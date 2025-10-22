/**
 * Agent Detail API Routes
 * @module app/api/agents/[id]
 * @description 單一 Agent 的 CRUD 操作
 */

import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@/lib/generated/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'

export const runtime = 'nodejs'

const prisma = new PrismaClient()

/**
 * GET /api/agents/[id] - 取得單一 Agent 詳細資訊
 */
export async function GET(
  request: NextRequest,
  segmentData: { params: Promise<{ id: string }> }
) {
  try {
    const params = await segmentData.params
    const agentId = params.id

    const agent = await prisma.aIAgent.findUnique({
      where: { id: agentId },
      include: {
        persona: true,
        avatar: true,
        knowledgeBases: {
          include: {
            knowledgeBase: true,
          },
          orderBy: {
            priority: 'asc',
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        _count: {
          select: {
            conversations: true,
          },
        },
      },
    })

    if (!agent) {
      return NextResponse.json(
        {
          success: false,
          error: `Agent not found: ${agentId}`,
          code: 'AGENT_NOT_FOUND',
          timestamp: new Date().toISOString(),
        },
        { status: 404 }
      )
    }

    // 格式化知識庫資料
    const formattedAgent = {
      ...agent,
      knowledgeBases: agent.knowledgeBases.map((link) => ({
        id: link.knowledgeBase.id,
        name: link.knowledgeBase.name,
        description: link.knowledgeBase.description,
        type: link.knowledgeBase.type,
        category: link.knowledgeBase.category,
        language: link.knowledgeBase.language,
        priority: link.priority,
        isRequired: link.isRequired,
        contentLength: link.knowledgeBase.content.length,
      })),
      conversationsCount: agent._count.conversations,
    }

    return NextResponse.json({
      success: true,
      data: formattedAgent,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('[GET /api/agents/[id] Error]', error)

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch agent',
        code: 'FETCH_ERROR',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/agents/[id] - 更新 Agent 資訊
 *
 * Request Body:
 * {
 *   name?: string
 *   description?: string
 *   category?: string
 *   personaId?: string
 *   avatarId?: string
 *   primaryLanguage?: string
 *   supportedLanguages?: string[]
 *   isPublic?: boolean
 *   isActive?: boolean
 * }
 */
export async function PUT(
  request: NextRequest,
  segmentData: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        {
          success: false,
          error: 'Unauthorized',
          code: 'UNAUTHORIZED',
          timestamp: new Date().toISOString(),
        },
        { status: 401 }
      )
    }

    const params = await segmentData.params
    const agentId = params.id
    const body = await request.json()

    // 檢查 Agent 是否存在
    const existingAgent = await prisma.aIAgent.findUnique({
      where: { id: agentId },
    })

    if (!existingAgent) {
      return NextResponse.json(
        {
          success: false,
          error: `Agent not found: ${agentId}`,
          code: 'AGENT_NOT_FOUND',
          timestamp: new Date().toISOString(),
        },
        { status: 404 }
      )
    }

    // 驗證權限：只有 Agent 擁有者可以更新（系統 Agent 除外）
    if (!existingAgent.isSystem && existingAgent.userId !== session.user.id) {
      return NextResponse.json(
        {
          success: false,
          error: 'Forbidden: You do not have permission to update this agent',
          code: 'FORBIDDEN',
          timestamp: new Date().toISOString(),
        },
        { status: 403 }
      )
    }

    // 不允許修改系統 Agent 的 isSystem 屬性
    if (existingAgent.isSystem && body.isSystem === false) {
      return NextResponse.json(
        {
          success: false,
          error: 'Cannot change isSystem property for system agents',
          code: 'VALIDATION_ERROR',
          timestamp: new Date().toISOString(),
        },
        { status: 400 }
      )
    }

    // 如果提供了新的 personaId，驗證是否存在
    if (body.personaId && body.personaId !== existingAgent.personaId) {
      const persona = await prisma.persona.findUnique({
        where: { id: body.personaId },
      })

      if (!persona) {
        return NextResponse.json(
          {
            success: false,
            error: `Persona not found: ${body.personaId}`,
            code: 'PERSONA_NOT_FOUND',
            timestamp: new Date().toISOString(),
          },
          { status: 404 }
        )
      }
    }

    // 如果提供了新的 avatarId，驗證是否存在
    if (body.avatarId && body.avatarId !== existingAgent.avatarId) {
      const avatar = await prisma.avatar.findUnique({
        where: { id: body.avatarId },
      })

      if (!avatar) {
        return NextResponse.json(
          {
            success: false,
            error: `Avatar not found: ${body.avatarId}`,
            code: 'AVATAR_NOT_FOUND',
            timestamp: new Date().toISOString(),
          },
          { status: 404 }
        )
      }
    }

    // 更新 Agent
    const updatedAgent = await prisma.aIAgent.update({
      where: { id: agentId },
      data: {
        ...(body.name && { name: body.name }),
        ...(body.description && { description: body.description }),
        ...(body.category && { category: body.category }),
        ...(body.personaId && { personaId: body.personaId }),
        ...(body.avatarId !== undefined && { avatarId: body.avatarId }),
        ...(body.primaryLanguage && { primaryLanguage: body.primaryLanguage }),
        ...(body.supportedLanguages && { supportedLanguages: body.supportedLanguages }),
        ...(body.isPublic !== undefined && { isPublic: body.isPublic }),
        ...(body.isActive !== undefined && { isActive: body.isActive }),
      },
      include: {
        persona: true,
        avatar: true,
      },
    })

    console.log(`[PUT /api/agents/${agentId}] Agent updated by user ${session.user.id}`)

    return NextResponse.json({
      success: true,
      data: updatedAgent,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('[PUT /api/agents/[id] Error]', error)

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to update agent',
        code: 'UPDATE_ERROR',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/agents/[id] - 刪除 Agent
 */
export async function DELETE(
  request: NextRequest,
  segmentData: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        {
          success: false,
          error: 'Unauthorized',
          code: 'UNAUTHORIZED',
          timestamp: new Date().toISOString(),
        },
        { status: 401 }
      )
    }

    const params = await segmentData.params
    const agentId = params.id

    // 檢查 Agent 是否存在
    const existingAgent = await prisma.aIAgent.findUnique({
      where: { id: agentId },
      include: {
        _count: {
          select: {
            conversations: true,
          },
        },
      },
    })

    if (!existingAgent) {
      return NextResponse.json(
        {
          success: false,
          error: `Agent not found: ${agentId}`,
          code: 'AGENT_NOT_FOUND',
          timestamp: new Date().toISOString(),
        },
        { status: 404 }
      )
    }

    // 不允許刪除系統預設 Agent
    if (existingAgent.isSystem) {
      return NextResponse.json(
        {
          success: false,
          error: 'Cannot delete system agents',
          code: 'FORBIDDEN',
          timestamp: new Date().toISOString(),
        },
        { status: 403 }
      )
    }

    // 驗證權限：只有 Agent 擁有者可以刪除
    if (existingAgent.userId !== session.user.id) {
      return NextResponse.json(
        {
          success: false,
          error: 'Forbidden: You do not have permission to delete this agent',
          code: 'FORBIDDEN',
          timestamp: new Date().toISOString(),
        },
        { status: 403 }
      )
    }

    // 如果 Agent 有關聯的對話，提醒使用者
    if (existingAgent._count.conversations > 0) {
      const forceDelete = request.nextUrl.searchParams.get('force') === 'true'

      if (!forceDelete) {
        return NextResponse.json(
          {
            success: false,
            error: `Agent has ${existingAgent._count.conversations} conversations. Use ?force=true to delete anyway.`,
            code: 'HAS_DEPENDENCIES',
            conversationsCount: existingAgent._count.conversations,
            timestamp: new Date().toISOString(),
          },
          { status: 400 }
        )
      }
    }

    // 刪除 Agent（會自動刪除 AgentKnowledgeBase 關聯，因為設定了 Cascade）
    await prisma.aIAgent.delete({
      where: { id: agentId },
    })

    console.log(`[DELETE /api/agents/${agentId}] Agent deleted by user ${session.user.id}`)

    return NextResponse.json({
      success: true,
      message: `Agent ${agentId} deleted successfully`,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('[DELETE /api/agents/[id] Error]', error)

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to delete agent',
        code: 'DELETE_ERROR',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    )
  }
}
