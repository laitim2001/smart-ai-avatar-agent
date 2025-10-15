/**
 * ================================================================
 * 錯誤處理工具 (lib/utils/error-handler.ts)
 * ================================================================
 *
 * 提供統一的 API 錯誤處理機制
 *
 * 功能：
 * - 自訂 AppError 類別用於業務邏輯錯誤
 * - handleError() 統一處理所有錯誤並返回標準格式
 * - createSuccessResponse() 建立成功回應
 *
 * 使用範例：
 * ```typescript
 * import { handleError, createSuccessResponse, AppError } from '@/lib/utils/error-handler'
 *
 * export async function GET(request: NextRequest) {
 *   try {
 *     // 業務邏輯
 *     if (!isValid) {
 *       throw new AppError('VALIDATION_ERROR', 'Invalid input', 400)
 *     }
 *
 *     const data = await fetchData()
 *     return createSuccessResponse(data)
 *   } catch (error) {
 *     return handleError(error)
 *   }
 * }
 * ```
 */

import { NextResponse } from 'next/server'
import type { ApiError, ApiResponse } from '@/types/api'

/**
 * 自訂 API 錯誤類別
 *
 * 用於表示可預期的業務邏輯錯誤
 * 相比於 Error，提供更多結構化資訊（錯誤代碼、HTTP 狀態碼、詳細資訊）
 *
 * @example
 * ```typescript
 * // 驗證錯誤
 * throw new AppError('VALIDATION_ERROR', 'Invalid email format', 400, {
 *   field: 'email',
 *   value: 'invalid-email'
 * })
 *
 * // 資源未找到
 * throw new AppError('NOT_FOUND', 'User not found', 404, {
 *   userId: 123
 * })
 *
 * // 外部服務錯誤
 * throw new AppError('AZURE_OPENAI_ERROR', 'Failed to connect to OpenAI', 503, {
 *   endpoint: process.env.AZURE_OPENAI_ENDPOINT
 * })
 * ```
 */
export class AppError extends Error {
  /**
   * @param code - 錯誤代碼（用於程式化處理，例如 'VALIDATION_ERROR'）
   * @param message - 使用者友善的錯誤訊息
   * @param statusCode - HTTP 狀態碼（預設 500）
   * @param details - 額外的錯誤詳細資訊（選填）
   */
  constructor(
    public code: string,
    public message: string,
    public statusCode: number = 500,
    public details?: Record<string, any>
  ) {
    super(message)
    this.name = 'AppError'

    // 確保正確的 prototype chain (TypeScript 類別繼承 Error 的特殊處理)
    Object.setPrototypeOf(this, AppError.prototype)
  }
}

/**
 * 處理錯誤並返回標準格式的 NextResponse
 *
 * 統一處理所有錯誤類型：
 * - AppError: 可預期的業務邏輯錯誤
 * - Error: 未預期的系統錯誤
 * - unknown: 其他類型的錯誤
 *
 * 行為：
 * - 開發環境：返回完整的 stack trace
 * - 生產環境：隱藏 stack trace 以保護系統資訊
 * - 所有錯誤都記錄到 console (便於伺服器端 Debug)
 *
 * @param error - 任何類型的錯誤
 * @returns 標準格式的 API 錯誤回應
 *
 * @example
 * ```typescript
 * try {
 *   // 可能拋出錯誤的程式碼
 * } catch (error) {
 *   return handleError(error)
 * }
 * ```
 */
export function handleError(error: unknown): NextResponse<ApiResponse> {
  // 記錄錯誤到 console (伺服器端日誌)
  console.error('[API Error]', error)

  // 處理自訂的 AppError
  if (error instanceof AppError) {
    const apiError: ApiError = {
      code: error.code,
      message: error.message,
      details: error.details,
      // 僅開發環境返回 stack trace
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
    }

    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: apiError,
        timestamp: new Date().toISOString(),
        requestId: crypto.randomUUID(),
      },
      { status: error.statusCode }
    )
  }

  // 處理標準 Error 或未知錯誤
  const message = error instanceof Error ? error.message : 'Internal server error'
  const stack = error instanceof Error ? error.stack : undefined

  const apiError: ApiError = {
    code: 'INTERNAL_ERROR',
    message,
    // 僅開發環境返回 stack trace
    stack: process.env.NODE_ENV === 'development' ? stack : undefined,
  }

  return NextResponse.json<ApiResponse>(
    {
      success: false,
      error: apiError,
      timestamp: new Date().toISOString(),
      requestId: crypto.randomUUID(),
    },
    { status: 500 }
  )
}

/**
 * 建立成功回應
 *
 * 統一包裝成功的 API 回應，自動加入 success、timestamp 等標準欄位
 *
 * @template T - 回應資料的型別
 * @param data - 要返回的資料
 * @param status - HTTP 狀態碼（預設 200）
 * @returns 標準格式的 API 成功回應
 *
 * @example
 * ```typescript
 * // 簡單回應
 * return createSuccessResponse({ userId: 123 })
 *
 * // 自訂狀態碼
 * return createSuccessResponse({ id: 456 }, 201)  // Created
 *
 * // 帶型別
 * interface User { id: number; name: string }
 * return createSuccessResponse<User>({ id: 123, name: "John" })
 * ```
 */
export function createSuccessResponse<T>(
  data: T,
  status: number = 200
): NextResponse<ApiResponse<T>> {
  return NextResponse.json<ApiResponse<T>>(
    {
      success: true,
      data,
      timestamp: new Date().toISOString(),
    },
    { status }
  )
}
