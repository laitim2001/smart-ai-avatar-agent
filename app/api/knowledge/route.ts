/**
 * Knowledge Base API Routes
 * @module app/api/knowledge
 * @description 知識庫 CRUD API
 */

import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@/lib/generated/prisma'
import { auth } from '@/lib/auth/config'

export const runtime = 'nodejs'

const prisma = new PrismaClient()

/**
 * GET /api/knowledge - 列出所有知識庫
 *
 * Query Parameters:
 * - type: string - 依類型篩選 (persona, faq, kpi, decision, meeting, pov, company, document)
 * - category: string - 依類別篩選 (general, business, technical, creative, educational)
 * - language: string - 依語言篩選
 * - isPublic: boolean - 篩選公開知識庫
 * - search: string - 搜尋關鍵字（名稱或內容）
 *
 * @example
 * GET /api/knowledge?type=faq&language=zh-TW
 * GET /api/knowledge?category=business&isPublic=true
 * GET /api/knowledge?search=KPI
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)

    // 解析查詢參數
    const type = searchParams.get('type')
    const category = searchParams.get('category')
    const language = searchParams.get('language')
    const isPublic = searchParams.get('isPublic')
    const search = searchParams.get('search')

    // 建構查詢條件
    const where: any = {
      isActive: true, // 只返回啟用的知識庫
    }

    if (type) {
      where.type = type
    }

    if (category) {
      where.category = category
    }

    if (language) {
      where.language = language
    }

    if (isPublic !== null) {
      where.isPublic = isPublic === 'true'
    }

    // 搜尋功能
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { content: { contains: search, mode: 'insensitive' } },
      ]
    }

    // 查詢知識庫
    const knowledgeBases = await prisma.knowledgeBase.findMany({
      where,
      include: {
        agents: {
          include: {
            agent: {
              select: {
                id: true,
                name: true,
                category: true,
              },
            },
          },
        },
      },
      orderBy: [
        { isPublic: 'desc' }, // 公開知識庫優先
        { usageCount: 'desc' }, // 依使用次數排序
        { createdAt: 'desc' },
      ],
    })

    // 格式化回應（不包含完整內容，減少傳輸量）
    const formattedKnowledgeBases = knowledgeBases.map((kb) => ({
      id: kb.id,
      name: kb.name,
      description: kb.description,
      type: kb.type,
      category: kb.category,
      language: kb.language,
      filePath: kb.filePath,
      version: kb.version,
      isPublic: kb.isPublic,
      isActive: kb.isActive,
      usageCount: kb.usageCount,
      contentLength: kb.content.length,
      agentsCount: kb.agents.length,
      agents: kb.agents.map((link) => ({
        id: link.agent.id,
        name: link.agent.name,
        category: link.agent.category,
        priority: link.priority,
        isRequired: link.isRequired,
      })),
      createdAt: kb.createdAt,
      updatedAt: kb.updatedAt,
    }))

    return NextResponse.json({
      success: true,
      data: formattedKnowledgeBases,
      total: formattedKnowledgeBases.length,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('[GET /api/knowledge Error]', error)

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch knowledge bases',
        code: 'FETCH_ERROR',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    )
  }
}

/**
 * POST /api/knowledge - 建立新的知識庫
 *
 * Request Body:
 * {
 *   name: string
 *   description?: string
 *   type: string
 *   category: string
 *   language: string
 *   content: string
 *   filePath?: string
 *   version?: string
 *   isPublic?: boolean
 * }
 */
export async function POST(request: NextRequest) {
  try {
    // 驗證使用者身份（開發環境允許 null）
    const session = await auth()
    const userId = session?.user?.id || null

    const body = await request.json()

    // 驗證必要欄位
    if (!body.name || !body.type || !body.category || !body.language || !body.content) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required fields: name, type, category, language, content',
          code: 'VALIDATION_ERROR',
          timestamp: new Date().toISOString(),
        },
        { status: 400 }
      )
    }

    // 驗證 type 是否有效
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

    // 驗證 category 是否有效
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

    // 建立知識庫
    const knowledgeBase = await prisma.knowledgeBase.create({
      data: {
        name: body.name,
        description: body.description,
        type: body.type,
        category: body.category,
        language: body.language,
        content: body.content,
        filePath: body.filePath,
        version: body.version || '1.0.0',
        isPublic: body.isPublic || false,
        isActive: true,
        usageCount: 0,
      },
    })

    console.log(`[POST /api/knowledge] Knowledge base created: ${knowledgeBase.id} by user ${userId || 'dev-user'}`)

    return NextResponse.json(
      {
        success: true,
        data: knowledgeBase,
        timestamp: new Date().toISOString(),
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('[POST /api/knowledge Error]', error)

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create knowledge base',
        code: 'CREATE_ERROR',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    )
  }
}
