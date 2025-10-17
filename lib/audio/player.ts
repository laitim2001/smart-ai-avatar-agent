/**
 * Web Audio API 播放器
 * @module lib/audio/player
 * @description 提供音訊播放、暫停、停止等功能
 * Sprint 10: Safari/iOS 音訊播放優化
 */

import {
  supportsWebAudio,
  getSafariCompatibility,
} from '@/lib/browser/safari-compat'

/**
 * Web Audio API 播放管理器
 */
export class AudioPlayer {
  private audioContext: AudioContext | null = null
  private currentSource: AudioBufferSourceNode | null = null
  private currentBuffer: AudioBuffer | null = null
  private startTime: number = 0
  private pauseTime: number = 0
  private isPaused: boolean = false

  /**
   * 初始化 AudioContext
   * Safari/iOS 特殊處理：AudioContext 可能為 suspended 狀態
   * @private
   */
  private async initAudioContext(): Promise<AudioContext> {
    if (!this.audioContext) {
      // 檢查瀏覽器支援
      if (!supportsWebAudio()) {
        throw new Error('您的瀏覽器不支援 Web Audio API')
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      this.audioContext = new (window.AudioContext ||
        (window as any).webkitAudioContext)()

      const safariCompat = getSafariCompatibility()
      if (safariCompat.isSafari || safariCompat.isIOS) {
        console.log(
          `[AudioPlayer] Safari/iOS detected, AudioContext state: ${this.audioContext.state}`
        )
      }
    }

    // iOS Safari: AudioContext 預設為 suspended，需要使用者互動後 resume
    if (this.audioContext.state === 'suspended') {
      console.warn(
        '[AudioPlayer] AudioContext is suspended, attempting to resume...'
      )
      try {
        await this.audioContext.resume()
        console.log('[AudioPlayer] AudioContext resumed successfully')
      } catch (error) {
        console.error('[AudioPlayer] Failed to resume AudioContext:', error)
        throw new Error(
          '無法啟動音訊播放。請確保已允許瀏覽器播放音訊，或重新點擊播放按鈕。'
        )
      }
    }

    return this.audioContext
  }

  /**
   * 載入音訊檔案並轉換為 AudioBuffer
   * @param {string} audioUrl - 音訊檔案 URL 或 Blob URL
   * @returns {Promise<AudioBuffer>} 解碼後的 AudioBuffer
   */
  async loadAudio(audioUrl: string): Promise<AudioBuffer> {
    const context = await this.initAudioContext()

    // 下載音訊檔案
    const response = await fetch(audioUrl)
    const arrayBuffer = await response.arrayBuffer()

    // 解碼為 AudioBuffer
    const audioBuffer = await context.decodeAudioData(arrayBuffer)

    this.currentBuffer = audioBuffer
    return audioBuffer
  }

  /**
   * 播放音訊
   * @param {AudioBuffer} [audioBuffer] - 可選，如未提供則使用當前 buffer
   * @param {() => void} [onEnded] - 播放結束回調
   */
  async play(audioBuffer?: AudioBuffer, onEnded?: () => void): Promise<void> {
    const context = await this.initAudioContext()
    const buffer = audioBuffer || this.currentBuffer

    if (!buffer) {
      throw new Error('No audio buffer available')
    }

    // 停止當前播放
    this.stop()

    // 建立音訊源節點
    const source = context.createBufferSource()
    source.buffer = buffer
    source.connect(context.destination)

    // 設定播放結束回調
    source.onended = () => {
      this.currentSource = null
      this.isPaused = false
      if (onEnded) onEnded()
    }

    // 開始播放
    source.start(0, this.isPaused ? this.pauseTime : 0)
    this.currentSource = source
    this.startTime = context.currentTime - (this.isPaused ? this.pauseTime : 0)
    this.isPaused = false

    console.log('[AudioPlayer] Playback started successfully')
  }

  /**
   * 暫停播放
   */
  pause(): void {
    if (this.currentSource && this.audioContext && !this.isPaused) {
      this.pauseTime = this.audioContext.currentTime - this.startTime
      this.stop()
      this.isPaused = true
    }
  }

  /**
   * 恢復播放
   */
  async resume(): Promise<void> {
    if (this.isPaused && this.currentBuffer) {
      await this.play(this.currentBuffer)
    }
  }

  /**
   * 停止播放
   */
  stop(): void {
    if (this.currentSource) {
      try {
        this.currentSource.stop()
      } catch {
        // 已經停止，忽略錯誤
      }
      this.currentSource = null
    }
    this.pauseTime = 0
    this.isPaused = false
  }

  /**
   * 取得當前播放位置（秒）
   * @returns {number} 當前播放位置
   */
  getCurrentTime(): number {
    if (!this.audioContext) return 0
    if (this.isPaused) return this.pauseTime
    if (this.currentSource) {
      return this.audioContext.currentTime - this.startTime
    }
    return 0
  }

  /**
   * 取得 AudioContext 的當前時間（秒）
   * 用於 Lip Sync 同步
   * @returns {number} AudioContext.currentTime
   */
  getAudioContextTime(): number {
    return this.audioContext?.currentTime || 0
  }

  /**
   * 取得音訊開始播放的時間點（秒）
   * @returns {number} 開始時間
   */
  getStartTime(): number {
    return this.startTime
  }

  /**
   * 檢查是否正在播放
   * @returns {boolean} 是否正在播放
   */
  isPlaying(): boolean {
    return this.currentSource !== null && !this.isPaused
  }

  /**
   * 取得音訊長度（秒）
   * @returns {number} 音訊長度
   */
  getDuration(): number {
    return this.currentBuffer?.duration || 0
  }

  /**
   * 清理資源
   */
  dispose(): void {
    this.stop()
    if (this.audioContext) {
      this.audioContext.close()
      this.audioContext = null
    }
  }
}

/**
 * 建立全域 AudioPlayer 實例（單例模式）
 */
let globalAudioPlayer: AudioPlayer | null = null

/**
 * 取得全域 AudioPlayer 實例
 * @returns {AudioPlayer} AudioPlayer 實例
 */
export function getAudioPlayer(): AudioPlayer {
  if (!globalAudioPlayer) {
    globalAudioPlayer = new AudioPlayer()
  }
  return globalAudioPlayer
}
