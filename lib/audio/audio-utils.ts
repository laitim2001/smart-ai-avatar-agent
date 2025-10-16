/**
 * Audio Utilities
 *
 * 音訊處理工具函數
 */

import { DEFAULT_AUDIO_CONFIG } from '@/types/stt'

/**
 * 將 AudioBuffer 轉換為 WAV Blob
 *
 * @param audioBuffer - AudioBuffer 物件
 * @param sampleRate - 目標採樣率（預設 16000 Hz）
 * @returns WAV 格式的 Blob
 */
export function audioBufferToWav(
  audioBuffer: AudioBuffer,
  targetSampleRate: number = DEFAULT_AUDIO_CONFIG.sampleRate
): Blob {
  // 如果是多聲道，混合為單聲道
  const numberOfChannels = 1
  const length = audioBuffer.length
  const sampleRate = audioBuffer.sampleRate

  // 取得第一個聲道的資料（或混合多聲道）
  let audioData: Float32Array

  if (audioBuffer.numberOfChannels === 1) {
    audioData = audioBuffer.getChannelData(0)
  } else {
    // 混合所有聲道為單聲道
    audioData = new Float32Array(length)
    for (let channel = 0; channel < audioBuffer.numberOfChannels; channel++) {
      const channelData = audioBuffer.getChannelData(channel)
      for (let i = 0; i < length; i++) {
        audioData[i] += channelData[i]
      }
    }
    // 取平均值
    for (let i = 0; i < length; i++) {
      audioData[i] /= audioBuffer.numberOfChannels
    }
  }

  // 重新採樣至目標採樣率（如需要）
  if (sampleRate !== targetSampleRate) {
    audioData = resample(audioData, sampleRate, targetSampleRate)
  }

  // 轉換為 16-bit PCM
  const pcmData = float32ToInt16(audioData)

  // 建立 WAV 檔案
  const wavBuffer = createWavFile(pcmData, targetSampleRate, numberOfChannels)

  return new Blob([wavBuffer], { type: 'audio/wav' })
}

/**
 * 重新採樣音訊資料
 *
 * @param audioData - 原始音訊資料
 * @param fromSampleRate - 原始採樣率
 * @param toSampleRate - 目標採樣率
 * @returns 重新採樣後的音訊資料
 */
function resample(
  audioData: Float32Array,
  fromSampleRate: number,
  toSampleRate: number
): Float32Array {
  const ratio = fromSampleRate / toSampleRate
  const newLength = Math.round(audioData.length / ratio)
  const result = new Float32Array(newLength)

  for (let i = 0; i < newLength; i++) {
    const position = i * ratio
    const index = Math.floor(position)
    const fraction = position - index

    if (index + 1 < audioData.length) {
      // 線性插值
      result[i] = audioData[index] * (1 - fraction) + audioData[index + 1] * fraction
    } else {
      result[i] = audioData[index]
    }
  }

  return result
}

/**
 * 將 Float32Array 轉換為 Int16Array（16-bit PCM）
 *
 * @param float32Array - Float32 音訊資料 (-1.0 到 1.0)
 * @returns Int16Array 音訊資料
 */
function float32ToInt16(float32Array: Float32Array): Int16Array {
  const int16Array = new Int16Array(float32Array.length)

  for (let i = 0; i < float32Array.length; i++) {
    // Clamp to [-1, 1] range
    const s = Math.max(-1, Math.min(1, float32Array[i]))
    // Convert to 16-bit PCM
    int16Array[i] = s < 0 ? s * 0x8000 : s * 0x7fff
  }

  return int16Array
}

/**
 * 建立 WAV 檔案 Buffer
 *
 * @param pcmData - PCM 音訊資料
 * @param sampleRate - 採樣率
 * @param numberOfChannels - 聲道數
 * @returns WAV 檔案 ArrayBuffer
 */
function createWavFile(
  pcmData: Int16Array,
  sampleRate: number,
  numberOfChannels: number
): ArrayBuffer {
  const bytesPerSample = 2 // 16-bit
  const blockAlign = numberOfChannels * bytesPerSample

  const buffer = new ArrayBuffer(44 + pcmData.length * bytesPerSample)
  const view = new DataView(buffer)

  // WAV Header (44 bytes)

  // "RIFF" chunk descriptor
  writeString(view, 0, 'RIFF')
  view.setUint32(4, 36 + pcmData.length * bytesPerSample, true) // File size - 8
  writeString(view, 8, 'WAVE')

  // "fmt " sub-chunk
  writeString(view, 12, 'fmt ')
  view.setUint32(16, 16, true) // Sub-chunk size (16 for PCM)
  view.setUint16(20, 1, true) // Audio format (1 = PCM)
  view.setUint16(22, numberOfChannels, true) // Number of channels
  view.setUint32(24, sampleRate, true) // Sample rate
  view.setUint32(28, sampleRate * blockAlign, true) // Byte rate
  view.setUint16(32, blockAlign, true) // Block align
  view.setUint16(34, bytesPerSample * 8, true) // Bits per sample

  // "data" sub-chunk
  writeString(view, 36, 'data')
  view.setUint32(40, pcmData.length * bytesPerSample, true) // Data size

  // PCM data
  let offset = 44
  for (let i = 0; i < pcmData.length; i++) {
    view.setInt16(offset, pcmData[i], true)
    offset += 2
  }

  return buffer
}

/**
 * 在 DataView 中寫入字串
 *
 * @param view - DataView 物件
 * @param offset - 偏移量
 * @param string - 要寫入的字串
 */
function writeString(view: DataView, offset: number, string: string): void {
  for (let i = 0; i < string.length; i++) {
    view.setUint8(offset + i, string.charCodeAt(i))
  }
}

/**
 * 計算音訊 RMS（Root Mean Square）音量
 *
 * @param audioData - 音訊資料
 * @returns RMS 音量 (0-1)
 */
export function calculateRMS(audioData: Float32Array): number {
  let sum = 0
  for (let i = 0; i < audioData.length; i++) {
    sum += audioData[i] * audioData[i]
  }
  return Math.sqrt(sum / audioData.length)
}

/**
 * 取得音訊峰值音量
 *
 * @param audioData - 音訊資料
 * @returns 峰值音量 (0-1)
 */
export function calculatePeakVolume(audioData: Float32Array): number {
  let peak = 0
  for (let i = 0; i < audioData.length; i++) {
    const abs = Math.abs(audioData[i])
    if (abs > peak) {
      peak = abs
    }
  }
  return peak
}

/**
 * 檢測音訊是否包含語音（基於音量閾值）
 *
 * @param audioData - 音訊資料
 * @param threshold - 音量閾值（預設 0.01）
 * @returns 是否包含語音
 */
export function detectSpeech(
  audioData: Float32Array,
  threshold: number = 0.01
): boolean {
  const rms = calculateRMS(audioData)
  return rms > threshold
}

/**
 * 將 Blob 轉換為 ArrayBuffer
 *
 * @param blob - Blob 物件
 * @returns ArrayBuffer
 */
export async function blobToArrayBuffer(blob: Blob): Promise<ArrayBuffer> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as ArrayBuffer)
    reader.onerror = () => reject(reader.error)
    reader.readAsArrayBuffer(blob)
  })
}

/**
 * 格式化錄音時長（秒 → mm:ss 格式）
 *
 * @param seconds - 秒數
 * @returns 格式化的時間字串 (mm:ss)
 */
export function formatDuration(seconds: number): string {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = Math.floor(seconds % 60)
  return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`
}
