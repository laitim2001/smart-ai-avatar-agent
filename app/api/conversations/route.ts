/**
 * Conversations API Routes
 * Sprint 6 Phase 2: Conversation CRUD operations
 */

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth/config'
import { prisma } from '@/lib/db/prisma'
import { z } from 'zod'

// Request validation schema
const createConversationSchema = z.object({
  title: z.string().optional().default('新對話'),
  avatarId: z.string().optional().nullable(),
  agentId: z.string().optional().nullable(), // 新增：關聯的 AI Agent ID
})

/**
 * POST /api/conversations
 * Create a new conversation
 */
export async function POST(request: NextRequest) {
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

    // 3. Parse and validate request body
    const body = await request.json()
    const validatedData = createConversationSchema.parse(body)

    // 4. Create conversation
    const conversation = await prisma.conversation.create({
      data: {
        userId: user.id,
        title: validatedData.title,
        avatarId: validatedData.avatarId,
        agentId: validatedData.agentId, // 新增：關聯 Agent
      },
      include: {
        messages: {
          orderBy: {
            timestamp: 'asc',
          },
        },
        agent: {
          select: {
            id: true,
            name: true,
            description: true,
            persona: {
              select: {
                id: true,
                name: true,
                role: true,
              },
            },
          },
        },
      },
    })

    // 5. Return success
    return NextResponse.json({
      success: true,
      conversation,
    })
  } catch (error) {
    console.error('[POST /api/conversations] Error:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: '請求格式錯誤', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: '建立對話失敗，請稍後再試' },
      { status: 500 }
    )
  }
}

/**
 * GET /api/conversations
 * Get user's conversation list with pagination
 */
export async function GET(request: NextRequest) {
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

    // 3. Parse query parameters for pagination
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const pageSize = parseInt(searchParams.get('pageSize') || '20')
    const skip = (page - 1) * pageSize

    // 4. Get conversations with message count
    const [conversations, total] = await Promise.all([
      prisma.conversation.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: 'desc' },
        skip,
        take: pageSize,
        include: {
          messages: {
            orderBy: { timestamp: 'asc' },
            take: 1, // Only get first message for preview
          },
          _count: {
            select: { messages: true },
          },
        },
      }),
      prisma.conversation.count({
        where: { userId: user.id },
      }),
    ])

    // 5. Return paginated results
    return NextResponse.json({
      success: true,
      conversations,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    })
  } catch (error) {
    console.error('[GET /api/conversations] Error:', error)
    return NextResponse.json(
      { error: '取得對話列表失敗，請稍後再試' },
      { status: 500 }
    )
  }
}
