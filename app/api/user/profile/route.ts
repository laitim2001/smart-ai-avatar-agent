/**
 * User Profile Update API
 *
 * 處理使用者個人資料更新請求
 * PATCH /api/user/profile
 */

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth/config'
import { prisma } from '@/lib/db/prisma'

// 使用 Node.js runtime (Prisma + NextAuth 需要)
export const runtime = 'nodejs'

interface ProfileUpdateRequest {
  name: string
  email: string
}

export async function PATCH(request: NextRequest) {
  try {
    // 檢查使用者認證
    const session = await auth()

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: '未授權，請先登入' },
        { status: 401 }
      )
    }

    const body: ProfileUpdateRequest = await request.json()
    const { name } = body

    // Validate input
    if (!name || name.trim().length === 0) {
      return NextResponse.json(
        { error: '請提供姓名' },
        { status: 400 }
      )
    }

    // Update user profile
    const updatedUser = await prisma.user.update({
      where: { email: session.user.email },
      data: {
        name: name.trim(),
      },
      select: {
        id: true,
        name: true,
        email: true,
        emailVerified: true,
      },
    })

    return NextResponse.json({
      success: true,
      message: '個人資料已更新',
      user: updatedUser,
    })
  } catch (error) {
    console.error('[Profile Update API Error]', error)
    return NextResponse.json(
      { error: '更新時發生錯誤，請稍後再試' },
      { status: 500 }
    )
  }
}

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

    // Get user profile
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        id: true,
        name: true,
        email: true,
        emailVerified: true,
        image: true,
      },
    })

    if (!user) {
      return NextResponse.json(
        { error: '找不到使用者資料' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      user,
    })
  } catch (error) {
    console.error('[Profile Get API Error]', error)
    return NextResponse.json(
      { error: '取得資料時發生錯誤' },
      { status: 500 }
    )
  }
}
