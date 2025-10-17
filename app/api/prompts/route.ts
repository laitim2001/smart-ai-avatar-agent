/**
 * Prompt Templates API
 * GET /api/prompts - 列表API (含篩選、搜尋、排序)
 * POST /api/prompts - 新增使用者自訂模板
 */

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth/index'
import { PrismaClient } from '@/lib/generated/prisma'
import { z } from 'zod'

const prisma = new PrismaClient()

export const runtime = 'nodejs' // Prisma requires Node.js runtime

/**
 * GET /api/prompts
 *
 * Query Parameters:
 * - category: string (learning/work/creative/entertainment/professional/daily/all)
 * - tags: string (逗號分隔, OR邏輯, 例如: "professional,creative")
 * - search: string (標題或描述搜尋, case-insensitive)
 * - isSystem: boolean (true: 只顯示系統模板, false: 只顯示使用者模板, 省略: 全部)
 * - featured: boolean (true: 只顯示featured模板)
 * - sort: string (popular: 熱門度, title: 標題, newest: 最新)
 * - userId: string (篩選特定使用者的模板, 只有管理員可用)
 *
 * Response:
 * {
 *   prompts: PromptTemplate[],
 *   stats: {
 *     total: number,
 *     categoryStats: { category: string, count: number }[],
 *     tagStats: { tag: string, count: number }[]
 *   }
 * }
 */
export async function GET(request: NextRequest) {
  try {
    // 解析查詢參數
    const { searchParams } = request.nextUrl
    const category = searchParams.get('category') || 'all'
    const tagsParam = searchParams.get('tags') // "professional,creative"
    const searchQuery = searchParams.get('search')
    const isSystemParam = searchParams.get('isSystem') // "true" or "false"
    const featuredParam = searchParams.get('featured') // "true"
    const sort = searchParams.get('sort') || 'popular' // popular, title, newest
    const userIdParam = searchParams.get('userId')

    // 認證檢查（可選）
    const session = await auth()
    const currentUserId = session?.user?.id

    // 建立查詢條件
    const where: any = {}

    // 分類篩選
    if (category !== 'all') {
      where.category = category
    }

    // 標籤篩選 (OR邏輯: 任一標籤匹配)
    if (tagsParam) {
      const tags = tagsParam.split(',').map((t) => t.trim())
      where.tags = { hasSome: tags }
    }

    // 搜尋篩選 (標題或描述)
    if (searchQuery) {
      where.OR = [
        { title: { contains: searchQuery, mode: 'insensitive' } },
        { description: { contains: searchQuery, mode: 'insensitive' } },
      ]
    }

    // 系統/使用者模板篩選
    if (isSystemParam !== null) {
      where.isSystem = isSystemParam === 'true'
    }

    // Featured 篩選
    if (featuredParam === 'true') {
      where.featured = true
    }

    // 使用者篩選 (只允許查詢自己的模板，除非是管理員)
    if (userIdParam) {
      // 只允許查詢自己的模板
      if (currentUserId && userIdParam === currentUserId) {
        where.userId = userIdParam
      } else {
        // 如果是其他使用者ID，只允許管理員查詢（這裡簡化為拒絕）
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
      }
    }

    // 建立排序條件
    let orderBy: any = {}
    switch (sort) {
      case 'popular':
        orderBy = { popularity: 'desc' }
        break
      case 'title':
        orderBy = { title: 'asc' }
        break
      case 'newest':
        orderBy = { createdAt: 'desc' }
        break
      default:
        orderBy = { popularity: 'desc' }
    }

    // 查詢 Prompt Templates
    const prompts = await prisma.promptTemplate.findMany({
      where,
      orderBy,
      select: {
        id: true,
        userId: true,
        title: true,
        description: true,
        content: true,
        category: true,
        tags: true,
        isSystem: true,
        featured: true,
        popularity: true,
        createdAt: true,
        updatedAt: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    })

    // 統計資料
    const allPrompts = await prisma.promptTemplate.findMany({
      select: {
        category: true,
        tags: true,
      },
    })

    // 分類統計
    const categoryStats = allPrompts.reduce(
      (acc: Array<{ category: string; count: number }>, prompt) => {
        const existing = acc.find((s: { category: string; count: number }) => s.category === prompt.category)
        if (existing) {
          existing.count++
        } else {
          acc.push({ category: prompt.category, count: 1 })
        }
        return acc
      },
      [] as Array<{ category: string; count: number }>
    )

    // 標籤統計
    const tagCounts = new Map<string, number>()
    allPrompts.forEach((prompt: { category: string; tags: string[] }) => {
      prompt.tags.forEach((tag: string) => {
        tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1)
      })
    })
    const tagStats = Array.from(tagCounts.entries())
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => b.count - a.count) // 依頻率排序

    return NextResponse.json({
      prompts,
      stats: {
        total: prompts.length,
        categoryStats,
        tagStats,
      },
    })
  } catch (error) {
    console.error('[GET /api/prompts] Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * POST /api/prompts
 * 新增使用者自訂 Prompt Template
 */

const createPromptSchema = z.object({
  title: z.string().min(1, '標題不能為空').max(100, '標題最多 100 字元'),
  description: z.string().max(500, '描述最多 500 字元').optional(),
  content: z.string().min(10, '內容至少 10 字元').max(5000, '內容最多 5000 字元'),
  category: z.enum(['learning', 'work', 'creative', 'entertainment', 'professional', 'daily']),
  tags: z
    .array(
      z.enum([
        'professional',
        'creative',
        'technical',
        'casual',
        'educational',
        'business',
        'writing',
        'analysis',
        'brainstorm',
        'fun',
      ])
    )
    .min(1, '請至少選擇一個標籤')
    .max(5, '最多選擇 5 個標籤'),
})

export async function POST(request: NextRequest) {
  try {
    // 認證檢查
    const session = await auth()
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()

    // 驗證輸入
    const validation = createPromptSchema.safeParse(body)
    if (!validation.success) {
      const firstError = validation.error.issues[0]
      return NextResponse.json({ error: firstError.message }, { status: 400 })
    }

    // 建立模板
    const newPrompt = await prisma.promptTemplate.create({
      data: {
        userId: session.user.id,
        title: validation.data.title,
        description: validation.data.description,
        content: validation.data.content,
        category: validation.data.category,
        tags: validation.data.tags,
        isSystem: false, // 使用者模板
        featured: false,
        popularity: 0,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    })

    return NextResponse.json(newPrompt, { status: 201 })
  } catch (error) {
    console.error('[POST /api/prompts] Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
