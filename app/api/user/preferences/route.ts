/**
 * User Preferences API Routes
 *
 * GET /api/user/preferences - 獲取使用者偏好
 * PATCH /api/user/preferences - 更新使用者偏好
 */

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth/config'
import { prisma } from '@/lib/db/prisma'
import { z } from 'zod'
import { logAvatarChange } from '@/lib/activity/logger'

// Validation schema for preferences update
const updatePreferencesSchema = z.object({
  defaultAvatarId: z.string().optional(),
  defaultAvatarUrl: z.string().url().optional(),
})

/**
 * GET /api/user/preferences
 * 獲取使用者偏好設定
 */
export async function GET(_request: NextRequest) {
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
      include: { settings: true },
    })

    if (!user) {
      return NextResponse.json({ error: '使用者不存在' }, { status: 404 })
    }

    // 如果沒有設定,回傳空偏好
    const preferences = {
      defaultAvatarId: user.settings?.defaultAvatarId || null,
      defaultAvatarUrl: user.settings?.defaultAvatarUrl || null,
    }

    return NextResponse.json({
      preferences,
    })
  } catch (error) {
    console.error('[Get Preferences Error]', error)
    return NextResponse.json({ error: '伺服器錯誤' }, { status: 500 })
  }
}

/**
 * PATCH /api/user/preferences
 * 更新使用者偏好設定
 */
export async function PATCH(request: NextRequest) {
  try {
    const session = await auth()

    if (!session || !session.user?.email) {
      return NextResponse.json(
        { error: '未授權訪問,請先登入' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const validationResult = updatePreferencesSchema.safeParse(body)

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: '請求資料格式錯誤',
          details: validationResult.error.format(),
        },
        { status: 400 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    })

    if (!user) {
      return NextResponse.json({ error: '使用者不存在' }, { status: 404 })
    }

    // 使用 upsert 更新或建立設定
    const updatedSettings = await prisma.userSettings.upsert({
      where: { userId: user.id },
      update: validationResult.data,
      create: {
        userId: user.id,
        ...validationResult.data,
      },
    })

    // 記錄 Avatar 變更活動 (使用統一工具函數)
    await logAvatarChange(user.id, {
      avatarId: validationResult.data.defaultAvatarId,
      avatarUrl: validationResult.data.defaultAvatarUrl,
    })

    return NextResponse.json({
      message: '偏好設定更新成功',
      preferences: {
        defaultAvatarId: updatedSettings.defaultAvatarId,
        defaultAvatarUrl: updatedSettings.defaultAvatarUrl,
      },
    })
  } catch (error) {
    console.error('[Update Preferences Error]', error)
    return NextResponse.json({ error: '伺服器錯誤' }, { status: 500 })
  }
}
