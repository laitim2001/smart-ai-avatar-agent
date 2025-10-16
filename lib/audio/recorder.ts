/**
 * Audio Recorder
 *
 * 使用 Web Audio API 和 MediaRecorder 錄製音訊
 */

import { DEFAULT_AUDIO_CONFIG, RECORDING_CONSTRAINTS } from '@/types/stt'
import type { RecordingError } from '@/types/stt'
import { audioBufferToWav, calculateRMS } from './audio-utils'

/**
 * 音訊錄製器類別
 */
export class AudioRecorder {
  private mediaStream: MediaStream | null = null
  private mediaRecorder: MediaRecorder | null = null
  private audioContext: AudioContext | null = null
  private analyser: AnalyserNode | null = null
  private audioChunks: Blob[] = []
  private startTime: number = 0
  private animationFrameId: number | null = null

  /**
   * 請求麥克風權限並初始化錄音器
   *
   * @throws RecordingError 如果權限被拒絕或裝置不支援
   */
  async initialize(): Promise<void> {
    try {
      // 檢查瀏覽器支援
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw this.createError(
          'not_supported',
          '您的瀏覽器不支援音訊錄製功能'
        )
      }

      // 請求麥克風權限
      this.mediaStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          channelCount: DEFAULT_AUDIO_CONFIG.channelCount,
          sampleRate: DEFAULT_AUDIO_CONFIG.sampleRate,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      })

      // 建立 AudioContext 用於音訊分析
      this.audioContext = new (window.AudioContext ||
        (window as any).webkitAudioContext)()
      const source = this.audioContext.createMediaStreamSource(this.mediaStream)

      // 建立分析器（用於波形視覺化）
      this.analyser = this.audioContext.createAnalyser()
      this.analyser.fftSize = 2048
      source.connect(this.analyser)

      // 建立 MediaRecorder
      const mimeType = this.getSupportedMimeType()
      this.mediaRecorder = new MediaRecorder(this.mediaStream, {
        mimeType,
      })

      // 處理錄音資料
      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.audioChunks.push(event.data)
        }
      }
    } catch (error) {
      if (error instanceof Error) {
        if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
          throw this.createError(
            'permission_denied',
            '麥克風權限被拒絕，請允許瀏覽器存取麥克風'
          )
        }

        if (error.name === 'NotFoundError' || error.name === 'DevicesNotFoundError') {
          throw this.createError(
            'device_not_found',
            '找不到麥克風裝置，請檢查您的麥克風是否已連接'
          )
        }

        throw this.createError(
          'unknown',
          `初始化錄音器失敗: ${error.message}`,
          error
        )
      }

      throw this.createError('unknown', '初始化錄音器失敗', error)
    }
  }

  /**
   * 開始錄音
   *
   * @throws RecordingError 如果錄音器未初始化
   */
  start(): void {
    if (!this.mediaRecorder) {
      throw this.createError('recording_failed', '錄音器未初始化，請先呼叫 initialize()')
    }

    if (this.mediaRecorder.state !== 'inactive') {
      throw this.createError('recording_failed', '錄音已在進行中')
    }

    this.audioChunks = []
    this.startTime = Date.now()
    this.mediaRecorder.start()
  }

  /**
   * 停止錄音並返回音訊 Blob
   *
   * @returns WAV 格式的音訊 Blob
   * @throws RecordingError 如果錄音時間過短
   */
  async stop(): Promise<Blob> {
    return new Promise((resolve, reject) => {
      if (!this.mediaRecorder) {
        reject(this.createError('recording_failed', '錄音器未初始化'))
        return
      }

      if (this.mediaRecorder.state === 'inactive') {
        reject(this.createError('recording_failed', '沒有正在進行的錄音'))
        return
      }

      // 監聽停止事件
      this.mediaRecorder.onstop = async () => {
        try {
          const duration = (Date.now() - this.startTime) / 1000

          // 檢查錄音時長
          if (duration < RECORDING_CONSTRAINTS.MIN_DURATION) {
            reject(
              this.createError(
                'recording_failed',
                `錄音時間過短（最少 ${RECORDING_CONSTRAINTS.MIN_DURATION} 秒）`
              )
            )
            return
          }

          // 合併音訊片段
          const rawBlob = new Blob(this.audioChunks, {
            type: this.mediaRecorder!.mimeType,
          })

          // 轉換為 WAV 格式
          const wavBlob = await this.convertToWav(rawBlob)

          // 檢查檔案大小
          if (wavBlob.size > RECORDING_CONSTRAINTS.MAX_FILE_SIZE) {
            reject(
              this.createError(
                'recording_failed',
                `錄音檔案過大（最大 ${RECORDING_CONSTRAINTS.MAX_FILE_SIZE / 1024 / 1024}MB）`
              )
            )
            return
          }

          resolve(wavBlob)
        } catch (error) {
          reject(
            this.createError(
              'recording_failed',
              '處理錄音資料失敗',
              error
            )
          )
        }
      }

      // 停止錄音
      this.mediaRecorder.stop()
    })
  }

  /**
   * 取消錄音（不返回音訊資料）
   */
  cancel(): void {
    if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
      this.audioChunks = []
      this.mediaRecorder.stop()
    }
  }

  /**
   * 取得目前錄音時長（秒）
   */
  getDuration(): number {
    if (this.startTime === 0) {
      return 0
    }
    return (Date.now() - this.startTime) / 1000
  }

  /**
   * 取得即時音訊波形資料（用於視覺化）
   *
   * @returns 0-255 的音量陣列
   */
  getWaveformData(): Uint8Array {
    if (!this.analyser) {
      return new Uint8Array(0)
    }

    const bufferLength = this.analyser.frequencyBinCount
    const dataArray = new Uint8Array(bufferLength)
    this.analyser.getByteTimeDomainData(dataArray)

    return dataArray
  }

  /**
   * 取得即時音量（0-1）
   */
  getVolume(): number {
    if (!this.analyser) {
      return 0
    }

    const bufferLength = this.analyser.frequencyBinCount
    const dataArray = new Uint8Array(bufferLength)
    this.analyser.getByteFrequencyData(dataArray)

    // 計算平均音量
    let sum = 0
    for (let i = 0; i < bufferLength; i++) {
      sum += dataArray[i]
    }
    const average = sum / bufferLength

    // 正規化至 0-1 範圍
    return average / 255
  }

  /**
   * 清理資源
   */
  cleanup(): void {
    // 停止動畫幀
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId)
      this.animationFrameId = null
    }

    // 停止所有音訊軌道
    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach((track) => track.stop())
      this.mediaStream = null
    }

    // 關閉 AudioContext
    if (this.audioContext && this.audioContext.state !== 'closed') {
      this.audioContext.close()
      this.audioContext = null
    }

    // 重置 MediaRecorder
    this.mediaRecorder = null
    this.analyser = null
    this.audioChunks = []
    this.startTime = 0
  }

  /**
   * 將音訊 Blob 轉換為 WAV 格式
   *
   * @private
   */
  private async convertToWav(blob: Blob): Promise<Blob> {
    const arrayBuffer = await blob.arrayBuffer()

    // 使用 AudioContext 解碼音訊
    const audioContext = new AudioContext()
    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer)

    // 轉換為 WAV
    const wavBlob = audioBufferToWav(audioBuffer, DEFAULT_AUDIO_CONFIG.sampleRate)

    // 關閉臨時 AudioContext
    await audioContext.close()

    return wavBlob
  }

  /**
   * 取得支援的 MIME 類型
   *
   * @private
   */
  private getSupportedMimeType(): string {
    const types = [
      'audio/webm',
      'audio/webm;codecs=opus',
      'audio/ogg;codecs=opus',
      'audio/mp4',
    ]

    for (const type of types) {
      if (MediaRecorder.isTypeSupported(type)) {
        return type
      }
    }

    // 如果都不支援，使用預設值
    return 'audio/webm'
  }

  /**
   * 建立錄音錯誤
   *
   * @private
   */
  private createError(
    type: RecordingError['type'],
    message: string,
    details?: unknown
  ): RecordingError {
    return {
      type,
      message,
      details,
    }
  }

  /**
   * 檢查是否正在錄音
   */
  get isRecording(): boolean {
    return this.mediaRecorder?.state === 'recording'
  }

  /**
   * 檢查是否已初始化
   */
  get isInitialized(): boolean {
    return this.mediaRecorder !== null
  }
}

/**
 * 單例 AudioRecorder 實例
 */
let recorderInstance: AudioRecorder | null = null

/**
 * 取得 AudioRecorder 單例
 */
export function getAudioRecorder(): AudioRecorder {
  if (!recorderInstance) {
    recorderInstance = new AudioRecorder()
  }
  return recorderInstance
}

/**
 * 清理 AudioRecorder 單例
 */
export function cleanupAudioRecorder(): void {
  if (recorderInstance) {
    recorderInstance.cleanup()
    recorderInstance = null
  }
}
