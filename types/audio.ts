/**
 * Audio 相關型別定義
 * @module types/audio
 */

/**
 * 音訊播放狀態列舉
 * @enum {string}
 */
export enum AudioState {
  /** 閒置狀態（無音訊播放） */
  IDLE = 'idle',
  /** 播放中 */
  PLAYING = 'playing',
  /** 暫停 */
  PAUSED = 'paused',
  /** 載入中 */
  LOADING = 'loading',
}

/**
 * 音訊項目介面
 * @interface AudioItem
 * @property {string} id - 唯一識別碼
 * @property {string} url - 音訊 URL（來自 TTS API 或本地檔案）
 * @property {string} text - 對應的文字內容（用於 Lip Sync）
 * @property {number} [duration] - 音訊長度（秒），選填
 * @property {Date} timestamp - 加入佇列時間
 */
export interface AudioItem {
  id: string
  url: string
  text: string
  duration?: number
  timestamp: Date
}

/**
 * Audio Store 狀態管理介面
 * @interface AudioStore
 * @property {AudioState} state - 當前播放狀態
 * @property {AudioItem[]} queue - 音訊播放佇列
 * @property {AudioItem | null} currentAudio - 當前播放的音訊
 * @property {number} volume - 音量（0-1）
 */
export interface AudioStore {
  // State
  state: AudioState
  queue: AudioItem[]
  currentAudio: AudioItem | null
  volume: number

  // Actions
  /**
   * 播放音訊
   * @param {AudioItem} audio - 要播放的音訊項目
   */
  playAudio: (audio: AudioItem) => void

  /**
   * 暫停當前音訊
   */
  pauseAudio: () => void

  /**
   * 停止當前音訊
   */
  stopAudio: () => void

  /**
   * 恢復播放暫停的音訊
   */
  resumeAudio: () => void

  /**
   * 新增音訊到播放佇列
   * @param {AudioItem} audio - 要加入佇列的音訊項目
   */
  addToQueue: (audio: AudioItem) => void

  /**
   * 清空播放佇列
   */
  clearQueue: () => void

  /**
   * 設定音量
   * @param {number} volume - 音量值（0-1）
   */
  setVolume: (volume: number) => void

  /**
   * 播放佇列中的下一個音訊
   */
  playNext: () => void
}
