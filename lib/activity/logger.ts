/**
 * Activity Logger
 * 使用者活動記錄工具函數
 *
 * @module lib/activity/logger
 * @description 提供統一的使用者活動記錄介面
 */

import { prisma } from '@/lib/db/prisma'
import { headers } from 'next/headers'

/**
 * 活動類型
 */
export type ActivityAction =
  | 'login'
  | 'logout'
  | 'register'
  | 'profile_update'
  | 'avatar_change'
  | 'password_change'
  | 'email_verify'
  | 'password_reset_request'
  | 'password_reset_complete'
  | 'settings_update'

/**
 * 活動記錄選項
 */
export interface LogActivityOptions {
  userId: string
  action: ActivityAction
  metadata?: Record<string, unknown>
  ipAddress?: string
  userAgent?: string
}

/**
 * 從 Request Headers 取得 IP 位址
 */
export async function getIpAddress(): Promise<string | undefined> {
  const headersList = await headers()

  // 嘗試從各種 header 中取得真實 IP
  const forwardedFor = headersList.get('x-forwarded-for')
  if (forwardedFor) {
    return forwardedFor.split(',')[0].trim()
  }

  const realIp = headersList.get('x-real-ip')
  if (realIp) {
    return realIp
  }

  // Vercel 的 IP header
  const vercelIp = headersList.get('x-vercel-forwarded-for')
  if (vercelIp) {
    return vercelIp
  }

  return undefined
}

/**
 * 從 Request Headers 取得 User Agent
 */
export async function getUserAgent(): Promise<string | undefined> {
  const headersList = await headers()
  return headersList.get('user-agent') || undefined
}

/**
 * 記錄使用者活動
 *
 * @param options - 活動記錄選項
 * @returns Promise<ActivityLog | null> - 成功返回活動記錄，失敗返回 null
 *
 * @example
 * ```typescript
 * await logActivity({
 *   userId: user.id,
 *   action: 'login',
 *   metadata: { method: 'credentials' }
 * })
 * ```
 */
export async function logActivity(
  options: LogActivityOptions
): Promise<{ id: string; createdAt: Date } | null> {
  try {
    const {
      userId,
      action,
      metadata,
      ipAddress,
      userAgent,
    } = options

    // 如果沒有提供 IP 和 User Agent,嘗試從 headers 取得
    const finalIpAddress = ipAddress || (await getIpAddress())
    const finalUserAgent = userAgent || (await getUserAgent())

    const log = await prisma.activityLog.create({
      data: {
        userId,
        action,
        metadata: metadata as never,
        ipAddress: finalIpAddress,
        userAgent: finalUserAgent,
      },
      select: {
        id: true,
        createdAt: true,
      },
    })

    return log
  } catch (error) {
    // 活動記錄失敗不應影響主要業務邏輯
    console.error('[Activity Logger Error]', error)
    return null
  }
}

/**
 * 記錄登入活動
 */
export async function logLogin(
  userId: string,
  metadata?: Record<string, unknown>
): Promise<void> {
  await logActivity({
    userId,
    action: 'login',
    metadata,
  })
}

/**
 * 記錄登出活動
 */
export async function logLogout(
  userId: string,
  metadata?: Record<string, unknown>
): Promise<void> {
  await logActivity({
    userId,
    action: 'logout',
    metadata,
  })
}

/**
 * 記錄個人資料更新
 */
export async function logProfileUpdate(
  userId: string,
  metadata?: Record<string, unknown>
): Promise<void> {
  await logActivity({
    userId,
    action: 'profile_update',
    metadata,
  })
}

/**
 * 記錄 Avatar 變更
 */
export async function logAvatarChange(
  userId: string,
  metadata?: Record<string, unknown>
): Promise<void> {
  await logActivity({
    userId,
    action: 'avatar_change',
    metadata,
  })
}

/**
 * 記錄密碼變更
 */
export async function logPasswordChange(
  userId: string,
  metadata?: Record<string, unknown>
): Promise<void> {
  await logActivity({
    userId,
    action: 'password_change',
    metadata,
  })
}

/**
 * 記錄設定更新
 */
export async function logSettingsUpdate(
  userId: string,
  metadata?: Record<string, unknown>
): Promise<void> {
  await logActivity({
    userId,
    action: 'settings_update',
    metadata,
  })
}

/**
 * 取得使用者活動記錄
 *
 * @param userId - 使用者 ID
 * @param limit - 返回數量限制（預設 50）
 * @param offset - 偏移量（預設 0）
 * @returns Promise<ActivityLog[]> - 活動記錄列表
 */
export async function getUserActivityLogs(
  userId: string,
  limit: number = 50,
  offset: number = 0
) {
  try {
    const logs = await prisma.activityLog.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
      select: {
        id: true,
        action: true,
        metadata: true,
        ipAddress: true,
        userAgent: true,
        createdAt: true,
      },
    })

    return logs
  } catch (error) {
    console.error('[Get Activity Logs Error]', error)
    return []
  }
}

/**
 * 取得使用者活動統計
 *
 * @param userId - 使用者 ID
 * @param days - 統計天數（預設 30）
 * @returns Promise<Record<ActivityAction, number>> - 各類型活動數量
 */
export async function getUserActivityStats(
  userId: string,
  days: number = 30
) {
  try {
    const since = new Date()
    since.setDate(since.getDate() - days)

    const logs = await prisma.activityLog.groupBy({
      by: ['action'],
      where: {
        userId,
        createdAt: {
          gte: since,
        },
      },
      _count: {
        action: true,
      },
    })

    // 轉換為易用的物件格式
    const stats: Record<string, number> = {}
    logs.forEach((log) => {
      stats[log.action] = log._count.action
    })

    return stats
  } catch (error) {
    console.error('[Get Activity Stats Error]', error)
    return {}
  }
}
