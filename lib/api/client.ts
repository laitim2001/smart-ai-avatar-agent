/**
 * ================================================================
 * API 客戶端工具 (lib/api/client.ts)
 * ================================================================
 *
 * 提供前端呼叫後端 API 的統一介面
 *
 * 功能：
 * - apiRequest(): 通用 API 請求函式，自動處理錯誤
 * - checkHealth(): Health Check 專用請求
 *
 * 使用範例：
 * ```typescript
 * import { checkHealth, apiRequest } from '@/lib/api/client'
 *
 * // Health Check
 * const status = await checkHealth()
 * console.log(status.version)  // "1.0.0"
 *
 * // 通用請求
 * const userData = await apiRequest<User>('/users/123')
 * console.log(userData.name)
 * ```
 */

import type { ApiResponse, HealthCheckResponse } from '@/types/api'

/**
 * API 基礎 URL
 *
 * - 本地開發: /api
 * - 生產環境: 可通過環境變數 NEXT_PUBLIC_API_URL 覆蓋
 */
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api'

/**
 * 通用 API 請求函式
 *
 * 統一處理所有 API 請求：
 * - 自動加入 Content-Type header
 * - 解析 JSON 回應
 * - 處理錯誤並拋出使用者友善的錯誤訊息
 *
 * @template T - 預期的回應資料型別
 * @param endpoint - API 端點（例如 '/health'）
 * @param options - Fetch API 選項（選填）
 * @returns 解析後的資料（data 欄位）
 * @throws Error 當請求失敗時
 *
 * @example
 * ```typescript
 * // GET 請求
 * const data = await apiRequest<User>('/users/123')
 *
 * // POST 請求
 * const newUser = await apiRequest<User>('/users', {
 *   method: 'POST',
 *   body: JSON.stringify({ name: "John" })
 * })
 *
 * // 帶自訂 headers
 * const data = await apiRequest('/protected', {
 *   headers: {
 *     'Authorization': 'Bearer token'
 *   }
 * })
 * ```
 */
export async function apiRequest<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`

  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  })

  const data: ApiResponse<T> = await response.json()

  // 檢查 API 回應是否成功
  if (!response.ok || !data.success) {
    const errorMessage = data.error?.message || 'API request failed'
    throw new Error(errorMessage)
  }

  return data.data as T
}

/**
 * Health Check 請求
 *
 * 呼叫 /api/health 端點檢查服務健康狀態
 *
 * @returns Health Check 回應資料
 * @throws Error 當 Health Check 失敗時
 *
 * @example
 * ```typescript
 * try {
 *   const status = await checkHealth()
 *   console.log(`API Status: ${status.status}`)  // "ok"
 *   console.log(`Version: ${status.version}`)    // "1.0.0"
 * } catch (error) {
 *   console.error('Health check failed:', error.message)
 * }
 * ```
 */
export async function checkHealth(): Promise<HealthCheckResponse> {
  return apiRequest<HealthCheckResponse>('/health')
}
