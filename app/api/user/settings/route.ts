/**
 * User Settings API Routes
 *
 * GET /api/user/settings - 獲取使用者設定
 * PATCH /api/user/settings - 更新使用者設定
 */

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth/config'
import { prisma } from '@/lib/db/prisma'
import { z } from 'zod'

// Validation schema for settings update
const updateSettingsSchema = z.object({
  defaultAvatarId: z.string().optional(),
  defaultAvatarUrl: z.string().url().optional(),
  emailNotifications: z.boolean().optional(),
  pushNotifications: z.boolean().optional(),
  theme: z.enum(['light', 'dark', 'system']).optional(),
  language: z.enum(['zh-TW', 'en-US']).optional(),
})

/**
 * GET /api/user/settings
 * 獲取目前使用者的設定
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

    // 如果使用者還沒有設定,建立預設設定
    if (!user.settings) {
      const newSettings = await prisma.userSettings.create({
        data: {
          userId: user.id,
          emailNotifications: true,
          pushNotifications: false,
          theme: 'system',
          language: 'zh-TW',
        },
      })

      return NextResponse.json({
        settings: newSettings,
      })
    }

    return NextResponse.json({
      settings: user.settings,
    })
  } catch (error) {
    console.error('[Get Settings Error]', error)
    return NextResponse.json({ error: '伺服器錯誤' }, { status: 500 })
  }
}

/**
 * PATCH /api/user/settings
 * 更新使用者設定
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
    const validationResult = updateSettingsSchema.safeParse(body)

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
      include: { settings: true },
    })

    if (!user) {
      return NextResponse.json({ error: '使用者不存在' }, { status: 404 })
    }

    // 使用 upsert 處理設定可能不存在的情況
    const updatedSettings = await prisma.userSettings.upsert({
      where: { userId: user.id },
      update: validationResult.data,
      create: {
        userId: user.id,
        ...validationResult.data,
      },
    })

    // 記錄活動
    await prisma.activityLog.create({
      data: {
        userId: user.id,
        action: 'settings_update',
        metadata: {
          updatedFields: Object.keys(validationResult.data),
        },
        ipAddress: request.headers.get('x-forwarded-for') || undefined,
        userAgent: request.headers.get('user-agent') || undefined,
      },
    })

    return NextResponse.json({
      message: '設定更新成功',
      settings: updatedSettings,
    })
  } catch (error) {
    console.error('[Update Settings Error]', error)
    return NextResponse.json({ error: '伺服器錯誤' }, { status: 500 })
  }
}
