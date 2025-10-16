import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth/config'
import { prisma } from '@/lib/db/prisma'

export const runtime = 'nodejs'

/**
 * GET /api/user/me
 * 獲取當前登入使用者的資訊
 */
export async function GET(request: NextRequest) {
  try {
    // 檢查使用者是否已登入
    const session = await auth()

    if (!session || !session.user?.email) {
      return NextResponse.json(
        { error: '未授權訪問，請先登入' },
        { status: 401 }
      )
    }

    // 從資料庫獲取使用者完整資訊
    const user = await prisma.user.findUnique({
      where: {
        email: session.user.email,
      },
      select: {
        id: true,
        name: true,
        email: true,
        emailVerified: true,
        image: true,
        createdAt: true,
        updatedAt: true,
      },
    })

    if (!user) {
      return NextResponse.json(
        { error: '找不到使用者資訊' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        emailVerified: user.emailVerified,
        image: user.image,
        createdAt: user.createdAt.toISOString(),
        updatedAt: user.updatedAt.toISOString(),
      },
    })
  } catch (error) {
    console.error('[GET /api/user/me Error]', error)
    return NextResponse.json(
      { error: '伺服器錯誤，請稍後再試' },
      { status: 500 }
    )
  }
}
