/**
 * Activity Types
 * 活動記錄相關類型定義
 */

/**
 * 活動記錄介面
 */
export interface ActivityLog {
  id: string
  userId: string
  action: string
  metadata: Record<string, unknown> | null
  ipAddress: string | null
  userAgent: string | null
  createdAt: Date
}

/**
 * 活動記錄 API 回應
 */
export interface ActivityLogResponse {
  id: string
  action: string
  metadata: Record<string, unknown> | null
  ipAddress: string | null
  userAgent: string | null
  createdAt: string
}

/**
 * 活動統計 API 回應
 */
export interface ActivityStatsResponse {
  stats: Record<string, number>
  period: {
    days: number
    from: string
    to: string
  }
}
