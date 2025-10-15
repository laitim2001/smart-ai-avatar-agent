/**
 * Web Audio API 播放器
 * @module lib/audio/player
 * @description 提供音訊播放、暫停、停止等功能
 */

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
   * @private
   */
  private initAudioContext(): AudioContext {
    if (!this.audioContext) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      this.audioContext = new (window.AudioContext ||
        (window as any).webkitAudioContext)()
    }
    return this.audioContext
  }

  /**
   * 載入音訊檔案並轉換為 AudioBuffer
   * @param {string} audioUrl - 音訊檔案 URL 或 Blob URL
   * @returns {Promise<AudioBuffer>} 解碼後的 AudioBuffer
   */
  async loadAudio(audioUrl: string): Promise<AudioBuffer> {
    const context = this.initAudioContext()

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
  play(audioBuffer?: AudioBuffer, onEnded?: () => void): void {
    const context = this.initAudioContext()
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
  resume(): void {
    if (this.isPaused && this.currentBuffer) {
      this.play(this.currentBuffer)
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
