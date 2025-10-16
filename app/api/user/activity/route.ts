/**
 * User Activity Log API Route
 *
 * GET /api/user/activity - 獲取使用者活動記錄
 */

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth/config'
import { prisma } from '@/lib/db/prisma'

/**
 * GET /api/user/activity
 * 獲取使用者活動記錄
 *
 * Query Parameters:
 * - limit: 回傳筆數 (預設 50, 最大 100)
 * - offset: 略過筆數 (預設 0)
 * - action: 篩選特定動作類型
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth()

    if (!session || !session.user?.email) {
      return NextResponse.json(
        { error: '未授權訪問,請先登入' },
        { status: 401 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    })

    if (!user) {
      return NextResponse.json({ error: '使用者不存在' }, { status: 404 })
    }

    // 解析查詢參數
    const { searchParams } = new URL(request.url)
    const limit = Math.min(
      parseInt(searchParams.get('limit') || '50', 10),
      100
    )
    const offset = parseInt(searchParams.get('offset') || '0', 10)
    const action = searchParams.get('action')

    // 建立查詢條件
    const where = {
      userId: user.id,
      ...(action && { action }),
    }

    // 查詢活動記錄
    const [activities, total] = await Promise.all([
      prisma.activityLog.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
      }),
      prisma.activityLog.count({ where }),
    ])

    return NextResponse.json({
      activities,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total,
      },
    })
  } catch (error) {
    console.error('[Get Activity Log Error]', error)
    return NextResponse.json({ error: '伺服器錯誤' }, { status: 500 })
  }
}
