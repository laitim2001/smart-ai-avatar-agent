/**
 * Agent-Knowledge Relationship API Routes
 * @module app/api/agents/[id]/knowledge
 * @description 管理 Agent 與知識庫的關聯關係
 */

import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@/lib/generated/prisma'
import { auth } from '@/lib/auth/config'

export const runtime = 'nodejs'

const prisma = new PrismaClient()

/**
 * GET /api/agents/[id]/knowledge - 取得 Agent 關聯的所有知識庫
 */
export async function GET(
  request: NextRequest,
  segmentData: { params: Promise<{ id: string }> }
) {
  try {
    const params = await segmentData.params
    const agentId = params.id

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

    // 查詢 Agent 的知識庫關聯
    const knowledgeLinks = await prisma.agentKnowledgeBase.findMany({
      where: { agentId },
      include: {
        knowledgeBase: {
          select: {
            id: true,
            name: true,
            description: true,
            type: true,
            category: true,
            language: true,
            filePath: true,
            version: true,
            isPublic: true,
            isActive: true,
            usageCount: true,
            createdAt: true,
            updatedAt: true,
          },
        },
      },
      orderBy: {
        priority: 'asc',
      },
    })

    // 格式化回應
    const formattedLinks = knowledgeLinks.map((link) => ({
      knowledgeBaseId: link.knowledgeBaseId,
      priority: link.priority,
      isRequired: link.isRequired,
      linkedAt: link.createdAt,
      knowledgeBase: link.knowledgeBase,
    }))

    return NextResponse.json({
      success: true,
      data: formattedLinks,
      total: formattedLinks.length,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('[GET /api/agents/[id]/knowledge Error]', error)

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch agent knowledge bases',
        code: 'FETCH_ERROR',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    )
  }
}

/**
 * POST /api/agents/[id]/knowledge - 為 Agent 連結知識庫
 *
 * Request Body:
 * {
 *   knowledgeBaseId: string
 *   priority?: number (default: 100)
 *   isRequired?: boolean (default: false)
 * }
 */
export async function POST(
  request: NextRequest,
  segmentData: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    const userId = session?.user?.id || null // 開發環境允許 null

    const params = await segmentData.params
    const agentId = params.id
    const body = await request.json()

    // 驗證必要欄位
    if (!body.knowledgeBaseId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required field: knowledgeBaseId',
          code: 'VALIDATION_ERROR',
          timestamp: new Date().toISOString(),
        },
        { status: 400 }
      )
    }

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

    // 驗證權限：只有 Agent 擁有者可以連結知識庫（系統 Agent 除外）
    // 開發環境: 如果 Agent 的 userId 是 null,允許任何人操作
    const isOwner =
      agent.isSystem || // 系統 Agent 可以操作
      agent.userId === null || // 開發環境的測試 Agent
      (agent.userId !== null && agent.userId === userId) // 生產環境 (userId 匹配)

    if (!isOwner) {
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

    // 檢查知識庫是否存在
    const knowledgeBase = await prisma.knowledgeBase.findUnique({
      where: { id: body.knowledgeBaseId },
    })

    if (!knowledgeBase) {
      return NextResponse.json(
        {
          success: false,
          error: `Knowledge base not found: ${body.knowledgeBaseId}`,
          code: 'KNOWLEDGE_NOT_FOUND',
          timestamp: new Date().toISOString(),
        },
        { status: 404 }
      )
    }

    // 檢查關聯是否已存在
    const existingLink = await prisma.agentKnowledgeBase.findUnique({
      where: {
        agentId_knowledgeBaseId: {
          agentId,
          knowledgeBaseId: body.knowledgeBaseId,
        },
      },
    })

    if (existingLink) {
      return NextResponse.json(
        {
          success: false,
          error: 'Knowledge base is already linked to this agent',
          code: 'ALREADY_LINKED',
          timestamp: new Date().toISOString(),
        },
        { status: 409 }
      )
    }

    // 建立關聯
    const link = await prisma.agentKnowledgeBase.create({
      data: {
        agentId,
        knowledgeBaseId: body.knowledgeBaseId,
        priority: body.priority ?? 100,
        isRequired: body.isRequired ?? false,
      },
      include: {
        knowledgeBase: {
          select: {
            id: true,
            name: true,
            description: true,
            type: true,
            category: true,
            language: true,
          },
        },
      },
    })

    console.log(
      `[POST /api/agents/${agentId}/knowledge] Linked knowledge base ${body.knowledgeBaseId} by user ${userId || 'dev-user'}`
    )

    return NextResponse.json(
      {
        success: true,
        data: link,
        timestamp: new Date().toISOString(),
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('[POST /api/agents/[id]/knowledge Error]', error)

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to link knowledge base',
        code: 'LINK_ERROR',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    )
  }
}
