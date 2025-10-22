/**
 * Password Change API Route
 *
 * PATCH /api/user/password - 變更使用者密碼
 */

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth/config'
import { prisma } from '@/lib/db/prisma'
import { z } from 'zod'
import {
  validatePasswordStrength,
  hashPassword,
  verifyPassword,
} from '@/lib/auth/password'
import { logPasswordChange } from '@/lib/activity/logger'

// Validation schema for password change
const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, '請輸入目前密碼'),
  newPassword: z.string().min(8, '新密碼長度至少需要 8 個字元'),
  confirmPassword: z.string().min(1, '請確認新密碼'),
})

/**
 * PATCH /api/user/password
 * 變更使用者密碼
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
    const validationResult = changePasswordSchema.safeParse(body)

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: '請求資料格式錯誤',
          details: validationResult.error.format(),
        },
        { status: 400 }
      )
    }

    const { currentPassword, newPassword, confirmPassword } =
      validationResult.data

    // 檢查新密碼和確認密碼是否一致
    if (newPassword !== confirmPassword) {
      return NextResponse.json({ error: '新密碼與確認密碼不一致' }, { status: 400 })
    }

    // 驗證新密碼強度
    const passwordStrength = validatePasswordStrength(newPassword)
    if (!passwordStrength.isValid) {
      return NextResponse.json(
        {
          error: '新密碼不符合強度要求',
          details: passwordStrength.errors,
        },
        { status: 400 }
      )
    }

    // 獲取使用者
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    })

    if (!user) {
      return NextResponse.json({ error: '使用者不存在' }, { status: 404 })
    }

    // 驗證目前密碼
    const isCurrentPasswordValid = await verifyPassword(
      currentPassword,
      user.password
    )

    if (!isCurrentPasswordValid) {
      return NextResponse.json({ error: '目前密碼錯誤' }, { status: 401 })
    }

    // 確保新密碼與舊密碼不同
    const isNewPasswordSameAsOld = await verifyPassword(
      newPassword,
      user.password
    )

    if (isNewPasswordSameAsOld) {
      return NextResponse.json(
        { error: '新密碼不能與目前密碼相同' },
        { status: 400 }
      )
    }

    // 雜湊新密碼
    const hashedNewPassword = await hashPassword(newPassword)

    // 更新密碼
    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedNewPassword },
    })

    // 記錄密碼變更活動 (使用統一工具函數)
    await logPasswordChange(user.id, {
      timestamp: new Date().toISOString(),
    })

    return NextResponse.json({
      message: '密碼變更成功',
    })
  } catch (error) {
    console.error('[Change Password Error]', error)
    return NextResponse.json({ error: '伺服器錯誤' }, { status: 500 })
  }
}
