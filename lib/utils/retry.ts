/**
 * Retry Utility
 * @module lib/utils/retry
 * @description 提供 API 請求重試機制
 */

export interface RetryOptions {
  /** 最大重試次數 */
  maxRetries?: number
  /** 重試延遲 (ms) */
  retryDelay?: number
  /** 應該重試的錯誤條件 */
  shouldRetry?: (error: unknown) => boolean
}

/**
 * 執行帶重試機制的異步操作
 *
 * @param fn - 要執行的異步函式
 * @param options - 重試配置選項
 * @returns 執行結果
 *
 * @example
 * ```ts
 * const data = await retryAsync(
 *   () => fetch('/api/chat'),
 *   { maxRetries: 1, retryDelay: 1000 }
 * )
 * ```
 */
export async function retryAsync<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const {
    maxRetries = 1,
    retryDelay = 1000,
    shouldRetry = (error: unknown) => {
      // 預設重試策略：只重試 5xx 錯誤和網路錯誤
      if (error instanceof Error) {
        return (
          error.message.includes('500') ||
          error.message.includes('502') ||
          error.message.includes('503') ||
          error.message.includes('network') ||
          error.message.includes('fetch failed')
        )
      }
      return false
    },
  } = options

  let lastError: unknown

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error

      // 檢查是否應該重試
      const isLastAttempt = attempt === maxRetries
      const canRetry = shouldRetry(error)

      if (isLastAttempt || !canRetry) {
        throw error
      }

      // 等待後重試
      console.warn(
        `[Retry] Attempt ${attempt + 1}/${maxRetries + 1} failed, retrying in ${retryDelay}ms...`,
        error
      )

      await new Promise((resolve) => setTimeout(resolve, retryDelay))
    }
  }

  // 理論上不會到達這裡，但為了 TypeScript 類型安全
  throw lastError
}
