/**
 * Knowledge Base Detail API Routes
 * @module app/api/knowledge/[id]
 * @description 單一知識庫的 CRUD 操作
 */

import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@/lib/generated/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'

export const runtime = 'nodejs'

const prisma = new PrismaClient()

/**
 * GET /api/knowledge/[id] - 取得單一知識庫詳細資訊（包含完整內容）
 */
export async function GET(
  request: NextRequest,
  segmentData: { params: Promise<{ id: string }> }
) {
  try {
    const params = await segmentData.params
    const knowledgeId = params.id

    const knowledgeBase = await prisma.knowledgeBase.findUnique({
      where: { id: knowledgeId },
      include: {
        agents: {
          include: {
            agent: {
              select: {
                id: true,
                name: true,
                description: true,
                category: true,
                isSystem: true,
              },
            },
          },
          orderBy: {
            priority: 'asc',
          },
        },
      },
    })

    if (!knowledgeBase) {
      return NextResponse.json(
        {
          success: false,
          error: `Knowledge base not found: ${knowledgeId}`,
          code: 'KNOWLEDGE_NOT_FOUND',
          timestamp: new Date().toISOString(),
        },
        { status: 404 }
      )
    }

    // 格式化回應
    const formattedKnowledgeBase = {
      ...knowledgeBase,
      contentLength: knowledgeBase.content.length,
      agents: knowledgeBase.agents.map((link) => ({
        ...link.agent,
        priority: link.priority,
        isRequired: link.isRequired,
      })),
    }

    return NextResponse.json({
      success: true,
      data: formattedKnowledgeBase,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('[GET /api/knowledge/[id] Error]', error)

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch knowledge base',
        code: 'FETCH_ERROR',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/knowledge/[id] - 更新知識庫資訊
 *
 * Request Body:
 * {
 *   name?: string
 *   description?: string
 *   type?: string
 *   category?: string
 *   language?: string
 *   content?: string
 *   filePath?: string
 *   version?: string
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
    const knowledgeId = params.id
    const body = await request.json()

    // 檢查知識庫是否存在
    const existingKnowledge = await prisma.knowledgeBase.findUnique({
      where: { id: knowledgeId },
      include: {
        agents: {
          where: {
            agent: {
              isSystem: true,
            },
          },
        },
      },
    })

    if (!existingKnowledge) {
      return NextResponse.json(
        {
          success: false,
          error: `Knowledge base not found: ${knowledgeId}`,
          code: 'KNOWLEDGE_NOT_FOUND',
          timestamp: new Date().toISOString(),
        },
        { status: 404 }
      )
    }

    // 如果知識庫關聯到系統 Agent，需要管理員權限才能修改
    if (existingKnowledge.agents.length > 0) {
      // TODO: 實作管理員權限檢查
      // 目前允許所有登入使用者修改
    }

    // 驗證 type 是否有效
    if (body.type) {
      const validTypes = ['persona', 'faq', 'kpi', 'decision', 'meeting', 'pov', 'company', 'document']
      if (!validTypes.includes(body.type)) {
        return NextResponse.json(
          {
            success: false,
            error: `Invalid type. Must be one of: ${validTypes.join(', ')}`,
            code: 'VALIDATION_ERROR',
            timestamp: new Date().toISOString(),
          },
          { status: 400 }
        )
      }
    }

    // 驗證 category 是否有效
    if (body.category) {
      const validCategories = ['general', 'business', 'technical', 'creative', 'educational']
      if (!validCategories.includes(body.category)) {
        return NextResponse.json(
          {
            success: false,
            error: `Invalid category. Must be one of: ${validCategories.join(', ')}`,
            code: 'VALIDATION_ERROR',
            timestamp: new Date().toISOString(),
          },
          { status: 400 }
        )
      }
    }

    // 更新知識庫
    const updatedKnowledge = await prisma.knowledgeBase.update({
      where: { id: knowledgeId },
      data: {
        ...(body.name && { name: body.name }),
        ...(body.description !== undefined && { description: body.description }),
        ...(body.type && { type: body.type }),
        ...(body.category && { category: body.category }),
        ...(body.language && { language: body.language }),
        ...(body.content && { content: body.content }),
        ...(body.filePath !== undefined && { filePath: body.filePath }),
        ...(body.version && { version: body.version }),
        ...(body.isPublic !== undefined && { isPublic: body.isPublic }),
        ...(body.isActive !== undefined && { isActive: body.isActive }),
      },
    })

    console.log(`[PUT /api/knowledge/${knowledgeId}] Knowledge base updated by user ${session.user.id}`)

    return NextResponse.json({
      success: true,
      data: updatedKnowledge,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('[PUT /api/knowledge/[id] Error]', error)

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to update knowledge base',
        code: 'UPDATE_ERROR',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/knowledge/[id] - 刪除知識庫
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
    const knowledgeId = params.id

    // 檢查知識庫是否存在
    const existingKnowledge = await prisma.knowledgeBase.findUnique({
      where: { id: knowledgeId },
      include: {
        agents: {
          include: {
            agent: {
              select: {
                id: true,
                name: true,
                isSystem: true,
              },
            },
          },
        },
      },
    })

    if (!existingKnowledge) {
      return NextResponse.json(
        {
          success: false,
          error: `Knowledge base not found: ${knowledgeId}`,
          code: 'KNOWLEDGE_NOT_FOUND',
          timestamp: new Date().toISOString(),
        },
        { status: 404 }
      )
    }

    // 檢查是否有 Agent 正在使用這個知識庫
    if (existingKnowledge.agents.length > 0) {
      const forceDelete = request.nextUrl.searchParams.get('force') === 'true'

      // 如果關聯到系統 Agent，不允許刪除
      const systemAgents = existingKnowledge.agents.filter((link) => link.agent.isSystem)
      if (systemAgents.length > 0) {
        return NextResponse.json(
          {
            success: false,
            error: 'Cannot delete knowledge base linked to system agents',
            code: 'FORBIDDEN',
            systemAgents: systemAgents.map((link) => link.agent.name),
            timestamp: new Date().toISOString(),
          },
          { status: 403 }
        )
      }

      if (!forceDelete) {
        return NextResponse.json(
          {
            success: false,
            error: `Knowledge base is linked to ${existingKnowledge.agents.length} agents. Use ?force=true to delete anyway.`,
            code: 'HAS_DEPENDENCIES',
            agentsCount: existingKnowledge.agents.length,
            agents: existingKnowledge.agents.map((link) => ({
              id: link.agent.id,
              name: link.agent.name,
            })),
            timestamp: new Date().toISOString(),
          },
          { status: 400 }
        )
      }
    }

    // 刪除知識庫（會自動刪除 AgentKnowledgeBase 關聯，因為設定了 Cascade）
    await prisma.knowledgeBase.delete({
      where: { id: knowledgeId },
    })

    console.log(`[DELETE /api/knowledge/${knowledgeId}] Knowledge base deleted by user ${session.user.id}`)

    return NextResponse.json({
      success: true,
      message: `Knowledge base ${knowledgeId} deleted successfully`,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('[DELETE /api/knowledge/[id] Error]', error)

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to delete knowledge base',
        code: 'DELETE_ERROR',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    )
  }
}
