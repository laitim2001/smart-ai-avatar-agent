/**
 * 錯誤訊息對應表
 * @module lib/utils/error-messages
 * @description 將技術錯誤訊息轉換為使用者友善訊息
 */

/**
 * 錯誤類型枚舉
 */
export enum ErrorType {
  NETWORK = 'network',
  API_ERROR = 'api_error',
  TTS_ERROR = 'tts_error',
  MODEL_LOAD = 'model_load',
  TIMEOUT = 'timeout',
  QUOTA = 'quota',
  UNKNOWN = 'unknown',
}

/**
 * 錯誤訊息對應
 */
const ERROR_MESSAGES: Record<ErrorType, string> = {
  [ErrorType.NETWORK]: '網路連線不穩定，請檢查網路設定',
  [ErrorType.API_ERROR]: 'Avatar 正在思考中，請稍候再試...',
  [ErrorType.TTS_ERROR]: '語音生成失敗，請重試',
  [ErrorType.MODEL_LOAD]: 'Avatar 載入失敗，請重新整理頁面',
  [ErrorType.TIMEOUT]: 'Avatar 回應逾時，請稍後再試',
  [ErrorType.QUOTA]: 'Avatar 目前忙碌中，請稍後再試',
  [ErrorType.UNKNOWN]: '發生未知錯誤，請重試',
}

/**
 * 根據錯誤訊息判斷錯誤類型
 *
 * @param error - 錯誤物件或錯誤訊息
 * @returns 錯誤類型
 */
export function classifyError(error: unknown): ErrorType {
  const errorMessage =
    error instanceof Error ? error.message.toLowerCase() : String(error).toLowerCase()

  // 網路錯誤
  if (
    errorMessage.includes('network') ||
    errorMessage.includes('fetch failed') ||
    errorMessage.includes('connection') ||
    !navigator.onLine
  ) {
    return ErrorType.NETWORK
  }

  // 逾時錯誤
  if (errorMessage.includes('timeout') || errorMessage.includes('timed out')) {
    return ErrorType.TIMEOUT
  }

  // 配額錯誤
  if (errorMessage.includes('quota') || errorMessage.includes('rate limit')) {
    return ErrorType.QUOTA
  }

  // TTS 錯誤
  if (errorMessage.includes('tts') || errorMessage.includes('speech')) {
    return ErrorType.TTS_ERROR
  }

  // 模型載入錯誤
  if (errorMessage.includes('model') || errorMessage.includes('load') || errorMessage.includes('gltf')) {
    return ErrorType.MODEL_LOAD
  }

  // API 錯誤 (5xx)
  if (
    errorMessage.includes('500') ||
    errorMessage.includes('502') ||
    errorMessage.includes('503') ||
    errorMessage.includes('api')
  ) {
    return ErrorType.API_ERROR
  }

  return ErrorType.UNKNOWN
}

/**
 * 取得使用者友善的錯誤訊息
 *
 * @param error - 錯誤物件或錯誤訊息
 * @returns 友善的錯誤訊息
 *
 * @example
 * ```ts
 * try {
 *   await fetch('/api/chat')
 * } catch (error) {
 *   const message = getFriendlyErrorMessage(error)
 *   console.log(message) // "網路連線不穩定，請檢查網路設定"
 * }
 * ```
 */
export function getFriendlyErrorMessage(error: unknown): string {
  const errorType = classifyError(error)
  return ERROR_MESSAGES[errorType]
}
