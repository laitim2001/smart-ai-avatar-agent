/**
 * Email Verification API
 *
 * 處理 Email 驗證請求
 * POST /api/auth/verify-email
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'
import { verifyToken } from '@/lib/auth/tokens'

// 使用 Node.js runtime (Prisma 需要)
export const runtime = 'nodejs'

interface VerifyEmailRequest {
  email: string
  token: string
}

export async function POST(request: NextRequest) {
  try {
    const body: VerifyEmailRequest = await request.json()
    const { email, token } = body

    // Validate input
    if (!email || !token) {
      return NextResponse.json(
        { error: '請提供 Email 和驗證碼' },
        { status: 400 }
      )
    }

    // Verify token
    const isValid = await verifyToken(email, token)

    if (!isValid) {
      return NextResponse.json(
        { error: '驗證碼無效或已過期' },
        { status: 400 }
      )
    }

    // Update user emailVerified field
    await prisma.user.update({
      where: { email },
      data: {
        emailVerified: new Date(),
      },
    })

    return NextResponse.json({
      success: true,
      message: 'Email 驗證成功！您現在可以登入了。',
    })
  } catch (error) {
    console.error('[Verify Email API Error]', error)
    return NextResponse.json(
      { error: '驗證時發生錯誤，請稍後再試' },
      { status: 500 }
    )
  }
}
