/**
 * Viseme 分析器
 * @module lib/audio/viseme-analyzer
 * @description 從 Azure Speech SDK 提取 Viseme 時間軸數據
 */

import * as sdk from 'microsoft-cognitiveservices-speech-sdk'
import { VisemeData } from '@/types/lipsync'

/**
 * Viseme 事件處理器
 *
 * 從 Azure Speech SDK 的 visemeReceived 事件中提取數據
 *
 * @param event - Azure Speech SDK VisemeReceivedEventArgs
 * @returns {VisemeData} 標準化的 Viseme 數據
 */
export function parseVisemeEvent(
  event: sdk.SpeechSynthesisVisemeEventArgs
): VisemeData {
  // Azure Speech SDK 提供的 audioOffset 單位為 100-nanosecond ticks
  // 轉換為秒：audioOffset / 10,000,000 或 audioOffset / 10000 / 1000
  const timeInSeconds = event.audioOffset / 10000000

  return {
    time: timeInSeconds,
    visemeId: event.visemeId,
  }
}

/**
 * Viseme 時間軸建構器
 *
 * 用於收集與處理 TTS 合成過程中的 Viseme 事件
 */
export class VisemeTimeline {
  private visemes: VisemeData[] = []
  private isCompleted: boolean = false

  /**
   * 添加 Viseme 事件
   *
   * @param event - Azure Speech SDK VisemeReceivedEventArgs
   */
  addEvent(event: sdk.SpeechSynthesisVisemeEventArgs): void {
    if (this.isCompleted) {
      console.warn('[VisemeTimeline] 時間軸已完成，無法添加新事件')
      return
    }

    const viseme = parseVisemeEvent(event)
    this.visemes.push(viseme)
  }

  /**
   * 標記時間軸建構完成
   */
  complete(): void {
    this.isCompleted = true
    this.calculateDurations()
  }

  /**
   * 計算每個 Viseme 的持續時間
   *
   * 根據相鄰 Viseme 的時間差計算持續時間
   * 最後一個 Viseme 的持續時間設為預設值 0.1 秒
   */
  private calculateDurations(): void {
    for (let i = 0; i < this.visemes.length - 1; i++) {
      const current = this.visemes[i]
      const next = this.visemes[i + 1]
      current.duration = next.time - current.time
    }

    // 最後一個 Viseme 的持續時間
    if (this.visemes.length > 0) {
      const lastViseme = this.visemes[this.visemes.length - 1]
      lastViseme.duration = 0.1 // 預設 100ms
    }
  }

  /**
   * 取得完整的 Viseme 時間軸
   *
   * @returns {VisemeData[]} Viseme 數組（按時間排序）
   */
  getTimeline(): VisemeData[] {
    return [...this.visemes]
  }

  /**
   * 取得 Viseme 數量
   */
  getCount(): number {
    return this.visemes.length
  }

  /**
   * 取得總持續時間
   */
  getTotalDuration(): number {
    if (this.visemes.length === 0) return 0

    const lastViseme = this.visemes[this.visemes.length - 1]
    return lastViseme.time + (lastViseme.duration || 0.1)
  }

  /**
   * 清空時間軸
   */
  clear(): void {
    this.visemes = []
    this.isCompleted = false
  }

  /**
   * 取得指定時間點的 Viseme
   *
   * @param time - 目標時間（秒）
   * @returns {VisemeData | null} 當前時間點應顯示的 Viseme
   */
  getVisemeAtTime(time: number): VisemeData | null {
    if (this.visemes.length === 0) return null

    // 使用二分搜尋找到對應的 Viseme
    let left = 0
    let right = this.visemes.length - 1

    while (left <= right) {
      const mid = Math.floor((left + right) / 2)
      const viseme = this.visemes[mid]
      const visemeEnd = viseme.time + (viseme.duration || 0.1)

      if (time >= viseme.time && time < visemeEnd) {
        return viseme
      } else if (time < viseme.time) {
        right = mid - 1
      } else {
        left = mid + 1
      }
    }

    // 如果超過最後一個 Viseme，返回 silence (visemeId: 0)
    if (time >= this.visemes[this.visemes.length - 1].time) {
      return { time, visemeId: 0, duration: 0 }
    }

    return null
  }

  /**
   * 取得指定時間範圍內的所有 Viseme
   *
   * @param startTime - 開始時間（秒）
   * @param endTime - 結束時間（秒）
   * @returns {VisemeData[]} 時間範圍內的 Viseme 數組
   */
  getVisemesInRange(startTime: number, endTime: number): VisemeData[] {
    return this.visemes.filter(
      (viseme) =>
        viseme.time >= startTime &&
        viseme.time < endTime
    )
  }
}

/**
 * 從 TTS 合成結果中提取 Viseme 時間軸（輔助函數）
 *
 * 這是一個完整的示例函數，展示如何在 TTS 合成時收集 Viseme 數據
 *
 * @param synthesizer - Azure Speech Synthesizer
 * @param text - 要合成的文字
 * @returns {Promise<{ audioData: ArrayBuffer, visemes: VisemeData[] }>}
 *
 * @example
 * ```typescript
 * const synthesizer = new sdk.SpeechSynthesizer(speechConfig, null);
 * const result = await synthesizeWithVisemes(synthesizer, '你好世界');
 * console.log('Viseme 數量:', result.visemes.length);
 * ```
 */
export async function synthesizeWithVisemes(
  synthesizer: sdk.SpeechSynthesizer,
  text: string
): Promise<{ audioData: ArrayBuffer; visemes: VisemeData[] }> {
  const timeline = new VisemeTimeline()

  // 註冊 Viseme 事件監聽器
  synthesizer.visemeReceived = (sender, event) => {
    timeline.addEvent(event)
  }

  // 執行 TTS 合成
  return new Promise((resolve, reject) => {
    synthesizer.speakTextAsync(
      text,
      (result) => {
        if (result.reason === sdk.ResultReason.SynthesizingAudioCompleted) {
          timeline.complete()

          resolve({
            audioData: result.audioData,
            visemes: timeline.getTimeline(),
          })
        } else {
          reject(
            new Error(
              `TTS 合成失敗: ${result.errorDetails || result.reason}`
            )
          )
        }
      },
      (error) => {
        reject(error)
      }
    )
  })
}

/**
 * 音訊音量分析（降級方案用）
 *
 * 當 Viseme 數據不可用時，使用音量分析作為降級方案
 * 從 AudioBuffer 提取音量時間軸，用於簡單的嘴型開合動畫
 *
 * @param audioBuffer - Web Audio API AudioBuffer
 * @param sampleInterval - 採樣間隔（秒），預設 0.05（50ms）
 * @returns {Array<{ time: number, volume: number }>} 音量時間軸
 */
export function analyzeAudioVolume(
  audioBuffer: AudioBuffer,
  sampleInterval: number = 0.05
): Array<{ time: number; volume: number }> {
  const channelData = audioBuffer.getChannelData(0) // 取第一個聲道
  const sampleRate = audioBuffer.sampleRate
  const samplesPerInterval = Math.floor(sampleRate * sampleInterval)

  const volumeTimeline: Array<{ time: number; volume: number }> = []

  for (
    let i = 0;
    i < channelData.length;
    i += samplesPerInterval
  ) {
    // 計算此區間的 RMS（均方根）音量
    let sum = 0
    const end = Math.min(i + samplesPerInterval, channelData.length)

    for (let j = i; j < end; j++) {
      sum += channelData[j] * channelData[j]
    }

    const rms = Math.sqrt(sum / (end - i))
    const time = i / sampleRate

    volumeTimeline.push({ time, volume: rms })
  }

  return volumeTimeline
}

/**
 * 標準化音量數據
 *
 * 將音量數據標準化到 0-1 範圍
 *
 * @param volumeData - 原始音量時間軸
 * @returns {Array<{ time: number, volume: number }>} 標準化後的音量時間軸
 */
export function normalizeVolume(
  volumeData: Array<{ time: number; volume: number }>
): Array<{ time: number; volume: number }> {
  if (volumeData.length === 0) return []

  // 找出最大音量
  const maxVolume = Math.max(...volumeData.map((d) => d.volume))

  if (maxVolume === 0) return volumeData

  // 標準化到 0-1
  return volumeData.map((d) => ({
    time: d.time,
    volume: d.volume / maxVolume,
  }))
}
