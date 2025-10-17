/**
 * Conversation Detail API Routes
 * Sprint 6 Phase 2: Conversation CRUD operations (detail, update, delete)
 */

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth/config'
import { prisma } from '@/lib/db/prisma'
import { z } from 'zod'

// Request validation schema
const updateConversationSchema = z.object({
  title: z.string().min(1, '標題不能為空').max(100, '標題過長'),
})

/**
 * GET /api/conversations/[id]
 * Get conversation detail with all messages
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
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

    // 3. Get conversation with messages
    const conversation = await prisma.conversation.findUnique({
      where: {
        id: params.id,
        userId: user.id, // Ensure user owns this conversation
      },
      include: {
        messages: {
          orderBy: {
            timestamp: 'asc',
          },
        },
      },
    })

    if (!conversation) {
      return NextResponse.json(
        { error: '對話不存在或無權限存取' },
        { status: 404 }
      )
    }

    // 4. Return conversation detail
    return NextResponse.json({
      success: true,
      conversation,
    })
  } catch (error) {
    console.error('[GET /api/conversations/[id]] Error:', error)
    return NextResponse.json(
      { error: '取得對話詳情失敗，請稍後再試' },
      { status: 500 }
    )
  }
}

/**
 * PATCH /api/conversations/[id]
 * Update conversation title
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
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

    // 3. Verify conversation ownership
    const existingConversation = await prisma.conversation.findUnique({
      where: {
        id: params.id,
        userId: user.id,
      },
    })

    if (!existingConversation) {
      return NextResponse.json(
        { error: '對話不存在或無權限存取' },
        { status: 404 }
      )
    }

    // 4. Parse and validate request body
    const body = await request.json()
    const validatedData = updateConversationSchema.parse(body)

    // 5. Update conversation
    const updatedConversation = await prisma.conversation.update({
      where: { id: params.id },
      data: {
        title: validatedData.title,
      },
      include: {
        messages: {
          orderBy: {
            timestamp: 'asc',
          },
        },
      },
    })

    // 6. Return updated conversation
    return NextResponse.json({
      success: true,
      conversation: updatedConversation,
    })
  } catch (error) {
    console.error('[PATCH /api/conversations/[id]] Error:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: '請求格式錯誤', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: '更新對話失敗，請稍後再試' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/conversations/[id]
 * Delete conversation and all its messages
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
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

    // 3. Verify conversation ownership
    const existingConversation = await prisma.conversation.findUnique({
      where: {
        id: params.id,
        userId: user.id,
      },
    })

    if (!existingConversation) {
      return NextResponse.json(
        { error: '對話不存在或無權限存取' },
        { status: 404 }
      )
    }

    // 4. Delete conversation (messages will be cascaded deleted)
    await prisma.conversation.delete({
      where: { id: params.id },
    })

    // 5. Return success
    return NextResponse.json({
      success: true,
      message: '對話已刪除',
    })
  } catch (error) {
    console.error('[DELETE /api/conversations/[id]] Error:', error)
    return NextResponse.json(
      { error: '刪除對話失敗，請稍後再試' },
      { status: 500 }
    )
  }
}
