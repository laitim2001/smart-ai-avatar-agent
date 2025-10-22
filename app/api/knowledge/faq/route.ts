/**
 * FAQ API Route
 * @description 處理 FAQ 的 CRUD 操作
 */

import { NextRequest, NextResponse } from 'next/server'
import {
  readKnowledgeFile,
  writeKnowledgeFile,
  parseFAQFile,
  serializeFAQToMarkdown,
} from '@/lib/knowledge/file-manager'
import { validateFAQ } from '@/lib/knowledge/validator'
import type { APIResponse, FAQContent, FAQCreateInput, FAQItem } from '@/types/knowledge'

export const runtime = 'nodejs'

const FAQ_FILENAME = 'cdo_faq.md'

/**
 * GET /api/knowledge/faq
 * 讀取所有 FAQ
 */
export async function GET(request: NextRequest) {
  try {
    console.log('[API] 📖 讀取 FAQ...')

    const content = readKnowledgeFile(FAQ_FILENAME)
    const items = parseFAQFile(content)

    // 統計資訊
    const stats = {
      totalQuestions: items.length,
      byCategory: items.reduce((acc, item) => {
        item.tags.forEach(tag => {
          acc[tag] = (acc[tag] || 0) + 1
        })
        return acc
      }, {} as { [category: string]: number })
    }

    const response: APIResponse<FAQContent> = {
      success: true,
      data: {
        items,
        metadata: {
          filename: FAQ_FILENAME,
          type: 'faq',
          size: content.length,
          lastModified: new Date().toISOString(),
          wordCount: content.split(/\s+/).length,
        },
        stats,
      },
      metadata: {
        timestamp: new Date().toISOString(),
      },
    }

    return NextResponse.json(response)
  } catch (error: any) {
    console.error('[API] ❌ 讀取 FAQ 失敗:', error)

    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'READ_ERROR',
          message: error.message || '讀取 FAQ 失敗',
        },
      } as APIResponse,
      { status: 500 }
    )
  }
}

/**
 * POST /api/knowledge/faq
 * 新增 FAQ 條目
 */
export async function POST(request: NextRequest) {
  try {
    console.log('[API] ➕ 新增 FAQ...')

    const body: FAQCreateInput = await request.json()

    // 建立新 FAQ 項目
    const newItem: FAQItem = {
      id: `q${Date.now()}`,
      question: body.question,
      answer: body.answer,
      tags: body.tags || [],
      keywords: body.keywords || [],
      usage: 0,
      lastModified: new Date().toISOString(),
    }

    // 驗證
    const validation = validateFAQ(newItem)
    if (!validation.valid) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: '驗證失敗',
            details: validation.errors,
          },
          metadata: {
            warnings: validation.warnings,
          },
        } as APIResponse,
        { status: 400 }
      )
    }

    // 讀取現有 FAQ
    const content = readKnowledgeFile(FAQ_FILENAME)
    const items = parseFAQFile(content)

    // 新增條目
    items.push(newItem)

    // 重新序列化並寫入
    const newContent = serializeFAQToMarkdown(items)
    writeKnowledgeFile(FAQ_FILENAME, newContent)

    console.log('[API] ✅ FAQ 已新增:', newItem.id)

    return NextResponse.json({
      success: true,
      data: { item: newItem, validation },
      metadata: { timestamp: new Date().toISOString() },
    } as APIResponse)
  } catch (error: any) {
    console.error('[API] ❌ 新增 FAQ 失敗:', error)

    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'CREATE_ERROR',
          message: error.message || '新增 FAQ 失敗',
        },
      } as APIResponse,
      { status: 500 }
    )
  }
}

/**
 * PUT /api/knowledge/faq
 * 更新 FAQ 條目
 */
export async function PUT(request: NextRequest) {
  try {
    console.log('[API] ✏️  更新 FAQ...')

    const body = await request.json()
    const { id, question, answer, tags, keywords } = body

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INVALID_INPUT',
            message: 'id 欄位為必填',
          },
        } as APIResponse,
        { status: 400 }
      )
    }

    // 讀取現有 FAQ
    const content = readKnowledgeFile(FAQ_FILENAME)
    const items = parseFAQFile(content)

    // 找到要更新的項目
    const index = items.findIndex(item => item.id === id)
    if (index === -1) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: `找不到 FAQ: ${id}`,
          },
        } as APIResponse,
        { status: 404 }
      )
    }

    // 更新
    const updatedItem: FAQItem = {
      ...items[index],
      question: question || items[index].question,
      answer: answer || items[index].answer,
      tags: tags || items[index].tags,
      keywords: keywords || items[index].keywords,
      lastModified: new Date().toISOString(),
    }

    // 驗證
    const validation = validateFAQ(updatedItem)
    if (!validation.valid) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: '驗證失敗',
            details: validation.errors,
          },
        } as APIResponse,
        { status: 400 }
      )
    }

    items[index] = updatedItem

    // 寫入
    const newContent = serializeFAQToMarkdown(items)
    writeKnowledgeFile(FAQ_FILENAME, newContent)

    console.log('[API] ✅ FAQ 已更新:', id)

    return NextResponse.json({
      success: true,
      data: { item: updatedItem, validation },
      metadata: { timestamp: new Date().toISOString() },
    } as APIResponse)
  } catch (error: any) {
    console.error('[API] ❌ 更新 FAQ 失敗:', error)

    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'UPDATE_ERROR',
          message: error.message || '更新 FAQ 失敗',
        },
      } as APIResponse,
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/knowledge/faq
 * 刪除 FAQ 條目
 */
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INVALID_INPUT',
            message: 'id 參數為必填',
          },
        } as APIResponse,
        { status: 400 }
      )
    }

    console.log('[API] 🗑️  刪除 FAQ:', id)

    // 讀取現有 FAQ
    const content = readKnowledgeFile(FAQ_FILENAME)
    const items = parseFAQFile(content)

    // 過濾掉要刪除的項目
    const filteredItems = items.filter(item => item.id !== id)

    if (filteredItems.length === items.length) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: `找不到 FAQ: ${id}`,
          },
        } as APIResponse,
        { status: 404 }
      )
    }

    // 寫入
    const newContent = serializeFAQToMarkdown(filteredItems)
    writeKnowledgeFile(FAQ_FILENAME, newContent)

    console.log('[API] ✅ FAQ 已刪除:', id)

    return NextResponse.json({
      success: true,
      data: { deletedId: id },
      metadata: { timestamp: new Date().toISOString() },
    } as APIResponse)
  } catch (error: any) {
    console.error('[API] ❌ 刪除 FAQ 失敗:', error)

    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'DELETE_ERROR',
          message: error.message || '刪除 FAQ 失敗',
        },
      } as APIResponse,
      { status: 500 }
    )
  }
}
