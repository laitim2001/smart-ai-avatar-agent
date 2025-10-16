/**
 * User Login API
 *
 * 處理使用者登入請求
 * POST /api/auth/login
 */

import { NextRequest, NextResponse } from 'next/server'
import { signIn } from '@/lib/auth/config'
import {
  rateLimit,
  RATE_LIMIT_CONFIGS,
  getClientIp,
  createRateLimitResponse,
} from '@/lib/redis/rate-limit'

// 使用 Node.js runtime
export const runtime = 'nodejs'

interface LoginRequest {
  email: string
  password: string
}

export async function POST(request: NextRequest) {
  try {
    // Rate Limiting 檢查
    const clientIp = getClientIp(request)
    const rateLimitResult = await rateLimit(
      `login:${clientIp}`,
      RATE_LIMIT_CONFIGS.AUTH
    )

    if (rateLimitResult.limited) {
      return createRateLimitResponse(rateLimitResult)
    }

    const body: LoginRequest = await request.json()
    const { email, password } = body

    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { error: '請提供 Email 和密碼' },
        { status: 400 }
      )
    }

    // Use NextAuth signIn
    const result = await signIn('credentials', {
      email,
      password,
      redirect: false,
    })

    if (result?.error) {
      return NextResponse.json(
        { error: result.error },
        { status: 401 }
      )
    }

    return NextResponse.json({
      success: true,
      message: '登入成功！',
    })
  } catch (error) {
    console.error('[Login API Error]', error)
    return NextResponse.json(
      { error: '登入時發生錯誤，請稍後再試' },
      { status: 500 }
    )
  }
}
