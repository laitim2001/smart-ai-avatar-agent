/**
 * Agent-Knowledge Relationship Detail API Routes
 * @module app/api/agents/[id]/knowledge/[knowledgeId]
 * @description 管理單一 Agent-Knowledge 關聯的操作
 */

import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'

export const runtime = 'nodejs'

const prisma = new PrismaClient()

/**
 * PUT /api/agents/[id]/knowledge/[knowledgeId] - 更新 Agent-Knowledge 關聯設定
 *
 * Request Body:
 * {
 *   priority?: number
 *   isRequired?: boolean
 * }
 */
export async function PUT(
  request: NextRequest,
  segmentData: { params: Promise<{ id: string; knowledgeId: string }> }
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
    const knowledgeBaseId = params.knowledgeId
    const body = await request.json()

    // 檢查 Agent 是否存在
    const agent = await prisma.aIAgent.findUnique({
      where: { id: agentId },
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

    // 驗證權限：只有 Agent 擁有者可以修改關聯（系統 Agent 除外）
    if (!agent.isSystem && agent.userId !== session.user.id) {
      return NextResponse.json(
        {
          success: false,
          error: 'Forbidden: You do not have permission to modify this agent',
          code: 'FORBIDDEN',
          timestamp: new Date().toISOString(),
        },
        { status: 403 }
      )
    }

    // 檢查關聯是否存在
    const existingLink = await prisma.agentKnowledgeBase.findUnique({
      where: {
        agentId_knowledgeBaseId: {
          agentId,
          knowledgeBaseId,
        },
      },
    })

    if (!existingLink) {
      return NextResponse.json(
        {
          success: false,
          error: 'Knowledge base link not found',
          code: 'LINK_NOT_FOUND',
          timestamp: new Date().toISOString(),
        },
        { status: 404 }
      )
    }

    // 更新關聯設定
    const updatedLink = await prisma.agentKnowledgeBase.update({
      where: {
        agentId_knowledgeBaseId: {
          agentId,
          knowledgeBaseId,
        },
      },
      data: {
        ...(body.priority !== undefined && { priority: body.priority }),
        ...(body.isRequired !== undefined && { isRequired: body.isRequired }),
      },
      include: {
        knowledgeBase: {
          select: {
            id: true,
            name: true,
            description: true,
            type: true,
            category: true,
          },
        },
      },
    })

    console.log(
      `[PUT /api/agents/${agentId}/knowledge/${knowledgeBaseId}] Link updated by user ${session.user.id}`
    )

    return NextResponse.json({
      success: true,
      data: updatedLink,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('[PUT /api/agents/[id]/knowledge/[knowledgeId] Error]', error)

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to update knowledge base link',
        code: 'UPDATE_ERROR',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/agents/[id]/knowledge/[knowledgeId] - 移除 Agent-Knowledge 關聯
 */
export async function DELETE(
  request: NextRequest,
  segmentData: { params: Promise<{ id: string; knowledgeId: string }> }
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
    const knowledgeBaseId = params.knowledgeId

    // 檢查 Agent 是否存在
    const agent = await prisma.aIAgent.findUnique({
      where: { id: agentId },
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

    // 驗證權限：只有 Agent 擁有者可以移除關聯（系統 Agent 除外）
    if (!agent.isSystem && agent.userId !== session.user.id) {
      return NextResponse.json(
        {
          success: false,
          error: 'Forbidden: You do not have permission to modify this agent',
          code: 'FORBIDDEN',
          timestamp: new Date().toISOString(),
        },
        { status: 403 }
      )
    }

    // 檢查關聯是否存在
    const existingLink = await prisma.agentKnowledgeBase.findUnique({
      where: {
        agentId_knowledgeBaseId: {
          agentId,
          knowledgeBaseId,
        },
      },
      include: {
        knowledgeBase: {
          select: {
            name: true,
          },
        },
      },
    })

    if (!existingLink) {
      return NextResponse.json(
        {
          success: false,
          error: 'Knowledge base link not found',
          code: 'LINK_NOT_FOUND',
          timestamp: new Date().toISOString(),
        },
        { status: 404 }
      )
    }

    // 如果是必要的知識庫，警告使用者
    if (existingLink.isRequired) {
      const forceDelete = request.nextUrl.searchParams.get('force') === 'true'

      if (!forceDelete) {
        return NextResponse.json(
          {
            success: false,
            error: `This is a required knowledge base for the agent. Use ?force=true to remove anyway.`,
            code: 'REQUIRED_KNOWLEDGE',
            knowledgeBaseName: existingLink.knowledgeBase.name,
            timestamp: new Date().toISOString(),
          },
          { status: 400 }
        )
      }
    }

    // 移除關聯
    await prisma.agentKnowledgeBase.delete({
      where: {
        agentId_knowledgeBaseId: {
          agentId,
          knowledgeBaseId,
        },
      },
    })

    console.log(
      `[DELETE /api/agents/${agentId}/knowledge/${knowledgeBaseId}] Link removed by user ${session.user.id}`
    )

    return NextResponse.json({
      success: true,
      message: `Knowledge base ${knowledgeBaseId} unlinked from agent ${agentId}`,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('[DELETE /api/agents/[id]/knowledge/[knowledgeId] Error]', error)

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to remove knowledge base link',
        code: 'DELETE_ERROR',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    )
  }
}
