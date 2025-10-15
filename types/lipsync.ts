/**
 * Lip Sync 類型定義
 * @module types/lipsync
 * @description 提供 Viseme 數據與 Lip Sync 控制相關類型定義
 */

/**
 * Viseme 數據結構
 *
 * Viseme 是語音合成中的視覺音素，代表特定發音時的嘴型。
 * Azure Speech SDK 提供 22 個 viseme IDs (0-21)
 *
 * @property time - Viseme 發生的時間點（秒）
 * @property visemeId - Azure Speech viseme ID (0-21)
 * @property duration - 可選，Viseme 持續時間（秒）
 *
 * @see https://learn.microsoft.com/azure/ai-services/speech-service/how-to-speech-synthesis-viseme
 */
export interface VisemeData {
  time: number
  visemeId: number
  duration?: number
}

/**
 * Blendshape 目標數據
 *
 * 將 Viseme 映射到 Ready Player Me blendshape 名稱與權重
 *
 * @property name - Blendshape 名稱 (例如: 'viseme_aa', 'viseme_PP')
 * @property weight - Blendshape 權重 (0-1)
 */
export interface BlendshapeTarget {
  name: string
  weight: number
}

/**
 * Viseme 到 Blendshape 的映射配置
 *
 * 定義每個 Viseme ID 對應的 blendshape 名稱與預設權重
 */
export interface VisemeBlendshapeMapping {
  [visemeId: number]: BlendshapeTarget
}

/**
 * Lip Sync 完整數據結構
 *
 * 包含音訊與對應的 Viseme 時間軸數據
 *
 * @property audio - 音訊檔案的 base64 編碼字串
 * @property visemes - Viseme 時間軸數組
 * @property duration - 音訊總長度（秒）
 * @property sampleRate - 音訊採樣率（可選）
 */
export interface LipSyncData {
  audio: string
  visemes: VisemeData[]
  duration: number
  sampleRate?: number
}

/**
 * Lip Sync 配置選項
 *
 * 控制 Lip Sync 行為的參數
 *
 * @property enabled - 是否啟用 Lip Sync，預設 true
 * @property smoothing - 平滑過渡時間（秒），預設 0.05
 * @property intensity - Viseme 強度倍數（0-2），預設 1.0
 * @property lookAhead - 預先載入時間（秒），用於 co-articulation，預設 0.1
 * @property fallbackMode - 降級模式：'none' | 'volume' | 'silent'，預設 'volume'
 */
export interface LipSyncConfig {
  enabled?: boolean
  smoothing?: number
  intensity?: number
  lookAhead?: number
  fallbackMode?: 'none' | 'volume' | 'silent'
}

/**
 * Lip Sync 狀態
 *
 * 追蹤當前 Lip Sync 播放狀態
 */
export enum LipSyncState {
  IDLE = 'idle',           // 閒置，未播放
  LOADING = 'loading',     // 載入中
  PLAYING = 'playing',     // 播放中
  PAUSED = 'paused',       // 暫停
  ERROR = 'error',         // 錯誤
}

/**
 * Lip Sync 控制器介面
 *
 * 提供 Lip Sync 播放控制方法
 */
export interface LipSyncController {
  /**
   * 開始 Lip Sync 播放
   * @param visemes - Viseme 時間軸數據
   * @param startTime - 音訊開始時間（AudioContext.currentTime）
   */
  start(visemes: VisemeData[], startTime: number): void

  /**
   * 停止 Lip Sync 播放
   */
  stop(): void

  /**
   * 暫停 Lip Sync 播放
   */
  pause(): void

  /**
   * 恢復 Lip Sync 播放
   */
  resume(): void

  /**
   * 更新 Lip Sync 狀態（每幀呼叫）
   * @param currentTime - 當前音訊播放時間（秒）
   */
  update(currentTime: number): BlendshapeTarget | null

  /**
   * 取得當前狀態
   */
  getState(): LipSyncState

  /**
   * 設定配置
   */
  setConfig(config: Partial<LipSyncConfig>): void
}

/**
 * TTS API 回應結構（包含 Viseme 數據）
 *
 * 修改後的 TTS API 回應，同時返回音訊與 Viseme 數據
 *
 * @property audio - 音訊檔案的 base64 編碼字串（MP3 格式）
 * @property visemes - Viseme 時間軸數組
 * @property duration - 音訊總長度（秒）
 * @property format - 音訊格式，預設 'audio/mpeg'
 */
export interface TTSResponseWithVisemes {
  audio: string
  visemes: VisemeData[]
  duration: number
  format?: string
}
