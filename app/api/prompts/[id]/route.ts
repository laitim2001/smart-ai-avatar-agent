/**
 * Prompt Template Detail API
 * GET /api/prompts/[id] - 取得單個模板詳情
 * PATCH /api/prompts/[id] - 更新使用者模板
 * DELETE /api/prompts/[id] - 刪除使用者模板
 */

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth/config'
import { PrismaClient } from '@/lib/generated/prisma'
import { z } from 'zod'

const prisma = new PrismaClient()

export const runtime = 'nodejs'

/**
 * GET /api/prompts/[id]
 * 取得單個 Prompt Template 詳情
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    const prompt = await prisma.promptTemplate.findUnique({
      where: { id },
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

    if (!prompt) {
      return NextResponse.json({ error: 'Prompt template not found' }, { status: 404 })
    }

    return NextResponse.json(prompt)
  } catch (error) {
    console.error(`[GET /api/prompts/${params.id}] Error:`, error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * PATCH /api/prompts/[id]
 * 更新使用者自訂模板 (系統模板不可更新)
 */

const updatePromptSchema = z.object({
  title: z.string().min(1, '標題不能為空').max(100, '標題最多 100 字元').optional(),
  description: z.string().max(500, '描述最多 500 字元').optional(),
  content: z.string().min(10, '內容至少 10 字元').max(5000, '內容最多 5000 字元').optional(),
  category: z
    .enum(['learning', 'work', 'creative', 'entertainment', 'professional', 'daily'])
    .optional(),
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
    .optional(),
})

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // 認證檢查
    const session = await auth()
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = params
    const body = await request.json()

    // 驗證輸入
    const validation = updatePromptSchema.safeParse(body)
    if (!validation.success) {
      const firstError = validation.error.issues[0]
      return NextResponse.json({ error: firstError.message }, { status: 400 })
    }

    // 檢查模板是否存在
    const existingPrompt = await prisma.promptTemplate.findUnique({
      where: { id },
    })

    if (!existingPrompt) {
      return NextResponse.json({ error: 'Prompt template not found' }, { status: 404 })
    }

    // 檢查是否為系統模板
    if (existingPrompt.isSystem) {
      return NextResponse.json(
        { error: 'Cannot update system template' },
        { status: 403 }
      )
    }

    // 檢查是否為模板擁有者
    if (existingPrompt.userId !== session.user.id) {
      return NextResponse.json(
        { error: 'You do not have permission to update this template' },
        { status: 403 }
      )
    }

    // 更新模板
    const updatedPrompt = await prisma.promptTemplate.update({
      where: { id },
      data: validation.data,
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

    return NextResponse.json(updatedPrompt)
  } catch (error) {
    console.error(`[PATCH /api/prompts/${params.id}] Error:`, error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * DELETE /api/prompts/[id]
 * 刪除使用者自訂模板 (系統模板不可刪除)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // 認證檢查
    const session = await auth()
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = params

    // 檢查模板是否存在
    const existingPrompt = await prisma.promptTemplate.findUnique({
      where: { id },
    })

    if (!existingPrompt) {
      return NextResponse.json({ error: 'Prompt template not found' }, { status: 404 })
    }

    // 檢查是否為系統模板
    if (existingPrompt.isSystem) {
      return NextResponse.json(
        { error: 'Cannot delete system template' },
        { status: 403 }
      )
    }

    // 檢查是否為模板擁有者
    if (existingPrompt.userId !== session.user.id) {
      return NextResponse.json(
        { error: 'You do not have permission to delete this template' },
        { status: 403 }
      )
    }

    // 刪除模板
    await prisma.promptTemplate.delete({
      where: { id },
    })

    return NextResponse.json({ success: true, message: 'Template deleted successfully' })
  } catch (error) {
    console.error(`[DELETE /api/prompts/${params.id}] Error:`, error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
