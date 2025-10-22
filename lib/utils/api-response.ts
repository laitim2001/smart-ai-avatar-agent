/**
 * API Response Utilities
 * 統一的 API 回應格式工具
 *
 * @module lib/utils/api-response
 */

import { NextResponse } from 'next/server'

/**
 * 成功回應介面
 */
export interface SuccessResponse<T = unknown> {
  success: true
  data?: T
  message?: string
}

/**
 * 錯誤回應介面
 */
export interface ErrorResponse {
  success: false
  error: string
  code?: string
  details?: unknown
}

/**
 * 建立成功回應
 *
 * @param data - 回應資料
 * @param message - 成功訊息
 * @param status - HTTP 狀態碼 (預設 200)
 * @returns NextResponse
 */
export function successResponse<T>(
  data?: T,
  message?: string,
  status: number = 200
): NextResponse<SuccessResponse<T>> {
  const response: SuccessResponse<T> = {
    success: true,
  }

  if (data !== undefined) {
    response.data = data
  }

  if (message) {
    response.message = message
  }

  return NextResponse.json(response, { status })
}

/**
 * 建立錯誤回應
 *
 * @param error - 錯誤訊息
 * @param status - HTTP 狀態碼 (預設 400)
 * @param code - 錯誤代碼 (可選)
 * @param details - 詳細錯誤資訊 (可選)
 * @returns NextResponse
 */
export function errorResponse(
  error: string,
  status: number = 400,
  code?: string,
  details?: unknown
): NextResponse<ErrorResponse> {
  const response: ErrorResponse = {
    success: false,
    error,
  }

  if (code) {
    response.code = code
  }

  if (details) {
    response.details = details
  }

  return NextResponse.json(response, { status })
}

/**
 * 建立驗證錯誤回應
 */
export function validationErrorResponse(
  error: string,
  details?: unknown
): NextResponse<ErrorResponse> {
  return errorResponse(error, 400, 'VALIDATION_ERROR', details)
}

/**
 * 建立未授權回應
 */
export function unauthorizedResponse(
  error: string = '未授權，請先登入'
): NextResponse<ErrorResponse> {
  return errorResponse(error, 401, 'UNAUTHORIZED')
}

/**
 * 建立禁止訪問回應
 */
export function forbiddenResponse(
  error: string = '您無權執行此操作'
): NextResponse<ErrorResponse> {
  return errorResponse(error, 403, 'FORBIDDEN')
}

/**
 * 建立資源未找到回應
 */
export function notFoundResponse(
  error: string = '找不到請求的資源'
): NextResponse<ErrorResponse> {
  return errorResponse(error, 404, 'NOT_FOUND')
}

/**
 * 建立伺服器錯誤回應
 */
export function serverErrorResponse(
  error: string = '伺服器錯誤，請稍後再試'
): NextResponse<ErrorResponse> {
  return errorResponse(error, 500, 'SERVER_ERROR')
}

/**
 * 建立服務不可用回應
 */
export function serviceUnavailableResponse(
  error: string = '服務暫時不可用，請稍後再試'
): NextResponse<ErrorResponse> {
  return errorResponse(error, 503, 'SERVICE_UNAVAILABLE')
}

/**
 * 處理 API 錯誤並返回適當的回應
 *
 * @param error - 錯誤物件
 * @param logPrefix - 日誌前綴 (用於 console.error)
 * @returns NextResponse
 */
export function handleApiError(
  error: unknown,
  logPrefix: string = '[API Error]'
): NextResponse<ErrorResponse> {
  console.error(logPrefix, error)

  if (error instanceof Error) {
    // 特定錯誤類型處理
    if (error.message.includes('Prisma')) {
      return serverErrorResponse('資料庫錯誤，請稍後再試')
    }

    if (error.message.includes('validation')) {
      return validationErrorResponse(error.message)
    }

    // 預設錯誤訊息
    return serverErrorResponse(error.message)
  }

  return serverErrorResponse()
}
