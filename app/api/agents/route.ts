/**
 * Agents API Routes
 * @module app/api/agents
 * @description Agent CRUD API - 列出和建立 AI Agent
 */

import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@/lib/generated/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'

export const runtime = 'nodejs'

const prisma = new PrismaClient()

/**
 * GET /api/agents - 列出所有 Agent
 *
 * Query Parameters:
 * - isSystem: boolean - 篩選系統預設 Agent
 * - isPublic: boolean - 篩選公開 Agent
 * - category: string - 依類別篩選
 * - userId: string - 篩選使用者建立的 Agent
 *
 * @example
 * GET /api/agents?isSystem=true
 * GET /api/agents?category=professional&isPublic=true
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)

    // 解析查詢參數
    const isSystem = searchParams.get('isSystem')
    const isPublic = searchParams.get('isPublic')
    const category = searchParams.get('category')
    const userId = searchParams.get('userId')

    // 建構查詢條件
    const where: any = {
      isActive: true, // 只返回啟用的 Agent
    }

    if (isSystem !== null) {
      where.isSystem = isSystem === 'true'
    }

    if (isPublic !== null) {
      where.isPublic = isPublic === 'true'
    }

    if (category) {
      where.category = category
    }

    if (userId) {
      where.userId = userId
    }

    // 查詢 Agent
    const agents = await prisma.aIAgent.findMany({
      where,
      include: {
        persona: {
          select: {
            id: true,
            name: true,
            role: true,
            language: true,
            tone: true,
            capabilities: true,
          },
        },
        avatar: {
          select: {
            id: true,
            name: true,
            url: true,
            thumbnail: true,
          },
        },
        knowledgeBases: {
          include: {
            knowledgeBase: {
              select: {
                id: true,
                name: true,
                type: true,
                category: true,
              },
            },
          },
        },
        _count: {
          select: {
            conversations: true,
          },
        },
      },
      orderBy: [
        { isSystem: 'desc' }, // 系統 Agent 優先
        { popularity: 'desc' }, // 依人氣排序
        { createdAt: 'desc' },
      ],
    })

    // 格式化回應
    const formattedAgents = agents.map((agent) => ({
      id: agent.id,
      name: agent.name,
      description: agent.description,
      category: agent.category,
      isSystem: agent.isSystem,
      isPublic: agent.isPublic,
      primaryLanguage: agent.primaryLanguage,
      supportedLanguages: agent.supportedLanguages,
      persona: agent.persona,
      avatar: agent.avatar,
      knowledgeBasesCount: agent.knowledgeBases.length,
      conversationsCount: agent._count.conversations,
      popularity: agent.popularity,
      usageCount: agent.usageCount,
      createdAt: agent.createdAt,
      updatedAt: agent.updatedAt,
    }))

    return NextResponse.json({
      success: true,
      data: formattedAgents,
      total: formattedAgents.length,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('[GET /api/agents Error]', error)
    console.error('[GET /api/agents Error Details]', (error as any).message, (error as any).stack)

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch agents',
        code: 'FETCH_ERROR',
        details: (error as any).message,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    )
  }
}

/**
 * POST /api/agents - 建立新的 Agent
 *
 * Request Body:
 * {
 *   name: string
 *   description: string
 *   category: string
 *   personaId: string
 *   avatarId?: string
 *   primaryLanguage: string
 *   supportedLanguages: string[]
 *   isPublic?: boolean
 * }
 */
export async function POST(request: NextRequest) {
  try {
    // 驗證使用者身份
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

    const body = await request.json()

    // 驗證必要欄位
    if (!body.name || !body.description || !body.category || !body.personaId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required fields: name, description, category, personaId',
          code: 'VALIDATION_ERROR',
          timestamp: new Date().toISOString(),
        },
        { status: 400 }
      )
    }

    // 驗證 Persona 是否存在
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

    // 如果提供了 avatarId，驗證 Avatar 是否存在
    if (body.avatarId) {
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

    // 建立 Agent
    const agent = await prisma.aIAgent.create({
      data: {
        name: body.name,
        description: body.description,
        category: body.category,
        personaId: body.personaId,
        avatarId: body.avatarId || null,
        userId: session.user.id,
        primaryLanguage: body.primaryLanguage || 'zh-TW',
        supportedLanguages: body.supportedLanguages || ['zh-TW'],
        isSystem: false, // 使用者建立的 Agent 不是系統預設
        isPublic: body.isPublic || false,
        isActive: true,
        usageCount: 0,
        popularity: 0,
      },
      include: {
        persona: true,
        avatar: true,
      },
    })

    console.log(`[POST /api/agents] Agent created: ${agent.id} by user ${session.user.id}`)

    return NextResponse.json(
      {
        success: true,
        data: agent,
        timestamp: new Date().toISOString(),
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('[POST /api/agents Error]', error)

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create agent',
        code: 'CREATE_ERROR',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    )
  }
}
