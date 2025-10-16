/**
 * Forgot Password API
 *
 * 處理忘記密碼請求，產生重設 token
 * POST /api/auth/forgot-password
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'
import {
  createPasswordResetToken,
  sendPasswordResetEmail,
} from '@/lib/auth/password-reset'

// 使用 Node.js runtime (Prisma 需要)
export const runtime = 'nodejs'

interface ForgotPasswordRequest {
  email: string
}

export async function POST(request: NextRequest) {
  try {
    const body: ForgotPasswordRequest = await request.json()
    const { email } = body

    // Validate input
    if (!email) {
      return NextResponse.json(
        { error: '請提供 Email' },
        { status: 400 }
      )
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { email },
    })

    // 即使使用者不存在，也回傳成功訊息（安全考量，避免洩漏使用者是否存在）
    if (!user) {
      return NextResponse.json({
        success: true,
        message: '如果該 Email 存在，我們已發送密碼重設連結',
      })
    }

    // Create password reset token
    const token = await createPasswordResetToken(email)

    // Send password reset email
    await sendPasswordResetEmail(email, token)

    return NextResponse.json({
      success: true,
      message: '密碼重設連結已發送到您的 Email',
    })
  } catch (error) {
    console.error('[Forgot Password API Error]', error)
    return NextResponse.json(
      { error: '發生錯誤，請稍後再試' },
      { status: 500 }
    )
  }
}
