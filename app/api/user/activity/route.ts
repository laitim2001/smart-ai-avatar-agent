/**
 * User Activity API
 * 使用者活動記錄 API
 *
 * GET /api/user/activity - 獲取使用者活動記錄
 */

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth/config'
import { prisma } from '@/lib/db/prisma'
import {
  getUserActivityLogs,
  getUserActivityStats,
} from '@/lib/activity/logger'

// 使用 Node.js runtime (Prisma 需要)
export const runtime = 'nodejs'

/**
 * GET /api/user/activity
 * 獲取當前使用者的活動記錄
 *
 * Query Parameters:
 * - limit: 返回數量限制（預設 50，最大 100）
 * - offset: 偏移量（預設 0）
 * - stats: 是否返回統計資料（true/false）
 * - days: 統計天數（預設 30）
 * - action: 篩選特定動作類型
 */
export async function GET(request: NextRequest) {
  try {
    // 檢查使用者認證
    const session = await auth()

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: '未授權，請先登入' },
        { status: 401 }
      )
    }

    // 從 URL 取得查詢參數
    const { searchParams } = new URL(request.url)
    const limit = Math.min(
      parseInt(searchParams.get('limit') || '50', 10),
      100
    )
    const offset = parseInt(searchParams.get('offset') || '0', 10)
    const includeStats = searchParams.get('stats') === 'true'
    const days = parseInt(searchParams.get('days') || '30', 10)
    const actionFilter = searchParams.get('action')

    // 從資料庫獲取使用者 ID
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    })

    if (!user) {
      return NextResponse.json(
        { error: '找不到使用者資訊' },
        { status: 404 }
      )
    }

    // 獲取活動記錄
    const logs = await getUserActivityLogs(user.id, limit, offset)

    // 如果有動作篩選,進行過濾
    const filteredLogs = actionFilter
      ? logs.filter((log) => log.action === actionFilter)
      : logs

    // 獲取總數（用於分頁）
    const total = await prisma.activityLog.count({
      where: {
        userId: user.id,
        ...(actionFilter && { action: actionFilter }),
      },
    })

    // 轉換日期為 ISO 字串
    const formattedLogs = filteredLogs.map((log) => ({
      ...log,
      createdAt: log.createdAt.toISOString(),
    }))

    // 如果需要統計資料
    if (includeStats) {
      const stats = await getUserActivityStats(user.id, days)
      return NextResponse.json({
        success: true,
        activities: formattedLogs,
        stats,
        pagination: {
          total,
          limit,
          offset,
          hasMore: offset + limit < total,
        },
      })
    }

    return NextResponse.json({
      success: true,
      activities: formattedLogs,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total,
      },
    })
  } catch (error) {
    console.error('[GET /api/user/activity Error]', error)
    return NextResponse.json(
      { error: '伺服器錯誤，請稍後再試' },
      { status: 500 }
    )
  }
}
