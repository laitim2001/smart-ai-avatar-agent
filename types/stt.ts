/**
 * Speech-to-Text (STT) Type Definitions
 *
 * 語音轉文字相關的 TypeScript 型別定義
 */

/**
 * 支援的語言類型
 */
export type SupportedLanguage = 'zh-TW' | 'en-US' | 'ja-JP'

/**
 * STT API 請求格式
 */
export interface STTRequest {
  /** 音訊 Blob（WAV 格式，16kHz, 16-bit, Mono） */
  audioBlob: Blob
  /** 目標語言 */
  language: SupportedLanguage
}

/**
 * STT API 回應資料
 */
export interface STTData {
  /** 轉換後的文字 */
  text: string
  /** 信心分數 (0-1) */
  confidence: number
  /** 使用的語言 */
  language: SupportedLanguage
  /** 音訊長度（秒） */
  duration: number
}

/**
 * STT API 成功回應
 */
export interface STTSuccessResponse {
  success: true
  data: STTData
}

/**
 * STT API 錯誤回應
 */
export interface STTErrorResponse {
  success: false
  error: string
  code?: string
}

/**
 * STT API 統一回應格式
 */
export type STTResponse = STTSuccessResponse | STTErrorResponse

/**
 * 語言選項配置
 */
export interface LanguageOption {
  /** 語言代碼 */
  code: SupportedLanguage
  /** 顯示名稱 */
  label: string
  /** 語言原生名稱 */
  nativeLabel: string
}

/**
 * 支援的語言清單
 */
export const SUPPORTED_LANGUAGES: LanguageOption[] = [
  {
    code: 'zh-TW',
    label: '繁體中文',
    nativeLabel: '繁體中文',
  },
  {
    code: 'en-US',
    label: '英文',
    nativeLabel: 'English',
  },
  {
    code: 'ja-JP',
    label: '日文',
    nativeLabel: '日本語',
  },
]

/**
 * 錄音狀態
 */
export type RecordingState = 'idle' | 'recording' | 'processing' | 'error'

/**
 * 錄音錯誤類型
 */
export type RecordingErrorType =
  | 'permission_denied'
  | 'device_not_found'
  | 'not_supported'
  | 'recording_failed'
  | 'transcription_failed'
  | 'network_error'
  | 'unknown'

/**
 * 錄音錯誤
 */
export interface RecordingError {
  type: RecordingErrorType
  message: string
  details?: unknown
}

/**
 * 音訊配置
 */
export interface AudioConfig {
  /** 採樣率（Hz） */
  sampleRate: number
  /** 聲道數 */
  channelCount: number
  /** 位元深度 */
  bitDepth: number
  /** 音訊格式 */
  mimeType: string
}

/**
 * 預設音訊配置（Azure Speech 要求）
 */
export const DEFAULT_AUDIO_CONFIG: AudioConfig = {
  sampleRate: 16000, // 16kHz
  channelCount: 1, // Mono
  bitDepth: 16, // 16-bit
  mimeType: 'audio/wav',
}

/**
 * 錄音限制
 */
export const RECORDING_CONSTRAINTS = {
  /** 最大錄音時長（秒） */
  MAX_DURATION: 60,
  /** 最小錄音時長（秒） */
  MIN_DURATION: 0.5,
  /** 最大檔案大小（bytes）- 約 2MB */
  MAX_FILE_SIZE: 2 * 1024 * 1024,
} as const
