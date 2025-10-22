/**
 * Conversation Messages API Routes
 * Sprint 6 Phase 2: Add message to conversation
 */

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth/config'
import { prisma } from '@/lib/db/prisma'
import { z } from 'zod'

// Request validation schema
const addMessageSchema = z.object({
  role: z.enum(['user', 'assistant'], {
    errorMap: () => ({ message: 'role 必須是 user 或 assistant' }),
  }),
  content: z.string().min(1, '訊息內容不能為空'),
})

/**
 * POST /api/conversations/[id]/messages
 * Add a new message to conversation
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // 1. Authentication check
    const session = await auth()
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: '未授權：請先登入' },
        { status: 401 }
      )
    }

    // 2. Get user from database
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    })

    if (!user) {
      return NextResponse.json(
        { error: '使用者不存在' },
        { status: 404 }
      )
    }

    // 3. Await params and verify conversation ownership
    const { id } = await params
    const conversation = await prisma.conversation.findUnique({
      where: {
        id,
        userId: user.id,
      },
    })

    if (!conversation) {
      return NextResponse.json(
        { error: '對話不存在或無權限存取' },
        { status: 404 }
      )
    }

    // 4. Parse and validate request body
    const body = await request.json()
    const validatedData = addMessageSchema.parse(body)

    // 5. Create message
    const message = await prisma.message.create({
      data: {
        conversationId: id,
        role: validatedData.role,
        content: validatedData.content,
      },
    })

    // 6. Update conversation's updatedAt
    await prisma.conversation.update({
      where: { id },
      data: { updatedAt: new Date() },
    })

    // 7. Return created message
    return NextResponse.json({
      success: true,
      message,
    })
  } catch (error) {
    console.error('[POST /api/conversations/[id]/messages] Error:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: '請求格式錯誤', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: '新增訊息失敗，請稍後再試' },
      { status: 500 }
    )
  }
}
