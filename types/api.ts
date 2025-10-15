/**
 * ================================================================
 * API 型別定義 (types/api.ts)
 * ================================================================
 *
 * 定義所有 API 請求/回應的 TypeScript 型別
 * 確保前後端 API 介面的型別安全
 *
 * 設計原則：
 * - 統一的 API 回應格式 (success/error wrapper)
 * - 詳細的錯誤資訊結構
 * - 支援泛型以靈活處理不同資料型別
 * - 完整的 JSDoc 註解
 */

/**
 * 標準 API 回應格式
 *
 * 所有 API 端點都應返回此格式，確保前端可以統一處理
 *
 * @template T - 成功回應時的資料型別
 *
 * @example
 * ```typescript
 * // 成功回應
 * {
 *   success: true,
 *   data: { userId: 123, name: "John" },
 *   timestamp: "2025-10-15T10:00:00.000Z"
 * }
 *
 * // 錯誤回應
 * {
 *   success: false,
 *   error: {
 *     code: "VALIDATION_ERROR",
 *     message: "Invalid input"
 *   },
 *   timestamp: "2025-10-15T10:00:00.000Z",
 *   requestId: "uuid-string"
 * }
 * ```
 */
export interface ApiResponse<T = any> {
  /** 請求是否成功 */
  success: boolean

  /** 成功時返回的資料 */
  data?: T

  /** 失敗時返回的錯誤資訊 */
  error?: ApiError

  /** 伺服器時間戳記 (ISO 8601 格式) */
  timestamp: string

  /** 請求追蹤 ID (用於 Debug 和日誌關聯) */
  requestId?: string
}

/**
 * API 錯誤格式
 *
 * 標準化的錯誤資訊結構，便於前端顯示和處理
 *
 * @example
 * ```typescript
 * {
 *   code: "AZURE_OPENAI_ERROR",
 *   message: "Failed to connect to Azure OpenAI",
 *   details: {
 *     endpoint: "https://example.openai.azure.com",
 *     statusCode: 503
 *   },
 *   stack: "Error: ...\n  at ..." // 僅開發環境
 * }
 * ```
 */
export interface ApiError {
  /** 錯誤代碼 (用於程式化處理) */
  code: string

  /** 使用者友善的錯誤訊息 */
  message: string

  /** 額外的錯誤詳細資訊 (選填) */
  details?: Record<string, any>

  /** 錯誤堆疊追蹤 (僅開發環境，生產環境應隱藏) */
  stack?: string
}

/**
 * Health Check 回應格式
 *
 * 用於檢查 API 服務和相關服務的健康狀態
 *
 * @example
 * ```typescript
 * {
 *   status: "ok",
 *   timestamp: "2025-10-15T10:00:00.000Z",
 *   version: "1.0.0",
 *   services: [
 *     { name: "Azure OpenAI", status: "up", responseTime: 120 },
 *     { name: "Azure Speech", status: "up", responseTime: 85 }
 *   ]
 * }
 * ```
 */
export interface HealthCheckResponse {
  /** 整體健康狀態 */
  status: 'ok' | 'degraded' | 'error'

  /** 檢查時間戳記 (ISO 8601 格式) */
  timestamp: string

  /** API 版本號 */
  version: string

  /** 各服務的健康狀態 (選填，未來用於檢查 Azure 服務) */
  services?: ServiceStatus[]
}

/**
 * 服務狀態
 *
 * 用於表示單一服務的健康狀態
 * 未來可用於監控 Azure OpenAI, Azure Speech 等外部服務
 *
 * @example
 * ```typescript
 * {
 *   name: "Azure OpenAI",
 *   status: "up",
 *   responseTime: 120
 * }
 * ```
 */
export interface ServiceStatus {
  /** 服務名稱 */
  name: string

  /** 服務狀態 */
  status: 'up' | 'down'

  /** 回應時間 (毫秒，選填) */
  responseTime?: number

  /** 錯誤訊息 (當 status 為 'down' 時) */
  error?: string
}
