/**
 * Reset Password API
 *
 * 處理密碼重設請求，使用 token 更新密碼
 * POST /api/auth/reset-password
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'
import { verifyPasswordResetToken } from '@/lib/auth/password-reset'
import {
  hashPassword,
  validatePasswordStrength,
} from '@/lib/auth/password'

// 使用 Node.js runtime (Prisma 需要)
export const runtime = 'nodejs'

interface ResetPasswordRequest {
  email: string
  token: string
  password: string
}

export async function POST(request: NextRequest) {
  try {
    const body: ResetPasswordRequest = await request.json()
    const { email, token, password } = body

    // Validate input
    if (!email || !token || !password) {
      return NextResponse.json(
        { error: '請提供完整資訊' },
        { status: 400 }
      )
    }

    // Validate password strength
    const passwordValidation = validatePasswordStrength(password)
    if (!passwordValidation.isValid) {
      return NextResponse.json(
        { error: passwordValidation.errors.join(', ') },
        { status: 400 }
      )
    }

    // Verify token
    const isValidToken = await verifyPasswordResetToken(email, token)

    if (!isValidToken) {
      return NextResponse.json(
        { error: '無效或已過期的重設連結' },
        { status: 400 }
      )
    }

    // Hash new password
    const hashedPassword = await hashPassword(password)

    // Update user password
    await prisma.user.update({
      where: { email },
      data: {
        password: hashedPassword,
      },
    })

    return NextResponse.json({
      success: true,
      message: '密碼已成功重設',
    })
  } catch (error) {
    console.error('[Reset Password API Error]', error)
    return NextResponse.json(
      { error: '密碼重設失敗，請稍後再試' },
      { status: 500 }
    )
  }
}
