/**
 * User Registration API
 *
 * 處理使用者註冊請求
 * POST /api/auth/register
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'
import { hashPassword, validatePasswordStrength } from '@/lib/auth/password'
import {
  createVerificationToken,
  sendVerificationEmail,
} from '@/lib/auth/tokens'

export const runtime = 'edge'

interface RegisterRequest {
  name: string
  email: string
  password: string
}

export async function POST(request: NextRequest) {
  try {
    const body: RegisterRequest = await request.json()
    const { name, email, password } = body

    // Validate input
    if (!name || !email || !password) {
      return NextResponse.json(
        { error: '請提供姓名、Email 和密碼' },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Email 格式不正確' },
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

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      return NextResponse.json(
        { error: '此 Email 已被註冊' },
        { status: 409 }
      )
    }

    // Hash password
    const hashedPassword = await hashPassword(password)

    // Create user
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
    })

    // Create verification token
    const token = await createVerificationToken(email)

    // Send verification email
    await sendVerificationEmail(email, token)

    return NextResponse.json(
      {
        success: true,
        message: '註冊成功！請檢查您的 Email 以驗證帳號。',
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
        },
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('[Register API Error]', error)
    return NextResponse.json(
      { error: '註冊時發生錯誤，請稍後再試' },
      { status: 500 }
    )
  }
}
