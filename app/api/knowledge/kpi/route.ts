/**
 * KPI API Route
 * @description 處理 KPI 字典的 CRUD 操作
 */

import { NextRequest, NextResponse } from 'next/server'
import {
  readKnowledgeFile,
  writeKnowledgeFile,
  parseKPIFile,
  serializeKPIToMarkdown,
} from '@/lib/knowledge/file-manager'
import { validateKPI } from '@/lib/knowledge/validator'
import type { APIResponse, KPIContent, KPICreateInput, KPIItem } from '@/types/knowledge'

export const runtime = 'nodejs'

const KPI_FILENAME = 'kpi_dictionary.md'

/**
 * GET /api/knowledge/kpi
 * 讀取所有 KPI
 */
export async function GET(request: NextRequest) {
  try {
    console.log('[API] 📖 讀取 KPI 字典...')

    const content = readKnowledgeFile(KPI_FILENAME)
    const items = parseKPIFile(content)

    const stats = {
      totalKPIs: items.length,
      byCategory: items.reduce((acc, item) => {
        item.tags.forEach(tag => {
          acc[tag] = (acc[tag] || 0) + 1
        })
        return acc
      }, {} as { [category: string]: number })
    }

    const response: APIResponse<KPIContent> = {
      success: true,
      data: {
        items,
        metadata: {
          filename: KPI_FILENAME,
          type: 'kpi',
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
    console.error('[API] ❌ 讀取 KPI 失敗:', error)

    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'READ_ERROR',
          message: error.message || '讀取 KPI 失敗',
        },
      } as APIResponse,
      { status: 500 }
    )
  }
}

/**
 * POST /api/knowledge/kpi
 * 新增 KPI
 */
export async function POST(request: NextRequest) {
  try {
    console.log('[API] ➕ 新增 KPI...')

    const body: KPICreateInput = await request.json()

    const newItem: KPIItem = {
      id: body.name.toLowerCase().replace(/\s+/g, '_'),
      name: body.name,
      definition: body.definition,
      calculation: body.calculation,
      dataSource: body.dataSource,
      owner: body.owner,
      tags: body.tags || [],
      updateFrequency: body.updateFrequency || 'daily',
      lastModified: new Date().toISOString(),
    }

    // 驗證
    const validation = validateKPI(newItem)
    if (!validation.valid) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: '驗證失敗',
            details: validation.errors,
          },
          metadata: { warnings: validation.warnings },
        } as APIResponse,
        { status: 400 }
      )
    }

    // 讀取現有 KPI
    const content = readKnowledgeFile(KPI_FILENAME)
    const items = parseKPIFile(content)

    // 檢查是否重複
    if (items.some(item => item.id === newItem.id)) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'DUPLICATE',
            message: `KPI "${newItem.name}" 已存在`,
          },
        } as APIResponse,
        { status: 409 }
      )
    }

    items.push(newItem)

    const newContent = serializeKPIToMarkdown(items)
    writeKnowledgeFile(KPI_FILENAME, newContent)

    console.log('[API] ✅ KPI 已新增:', newItem.id)

    return NextResponse.json({
      success: true,
      data: { item: newItem, validation },
      metadata: { timestamp: new Date().toISOString() },
    } as APIResponse)
  } catch (error: any) {
    console.error('[API] ❌ 新增 KPI 失敗:', error)

    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'CREATE_ERROR',
          message: error.message || '新增 KPI 失敗',
        },
      } as APIResponse,
      { status: 500 }
    )
  }
}

/**
 * PUT /api/knowledge/kpi
 * 更新 KPI
 */
export async function PUT(request: NextRequest) {
  try {
    console.log('[API] ✏️  更新 KPI...')

    const body = await request.json()
    const { id, name, definition, calculation, dataSource, owner, tags, updateFrequency } = body

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

    const content = readKnowledgeFile(KPI_FILENAME)
    const items = parseKPIFile(content)

    const index = items.findIndex(item => item.id === id)
    if (index === -1) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: `找不到 KPI: ${id}`,
          },
        } as APIResponse,
        { status: 404 }
      )
    }

    const updatedItem: KPIItem = {
      ...items[index],
      name: name || items[index].name,
      definition: definition || items[index].definition,
      calculation: calculation || items[index].calculation,
      dataSource: dataSource || items[index].dataSource,
      owner: owner || items[index].owner,
      tags: tags || items[index].tags,
      updateFrequency: updateFrequency || items[index].updateFrequency,
      lastModified: new Date().toISOString(),
    }

    const validation = validateKPI(updatedItem)
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

    const newContent = serializeKPIToMarkdown(items)
    writeKnowledgeFile(KPI_FILENAME, newContent)

    console.log('[API] ✅ KPI 已更新:', id)

    return NextResponse.json({
      success: true,
      data: { item: updatedItem, validation },
      metadata: { timestamp: new Date().toISOString() },
    } as APIResponse)
  } catch (error: any) {
    console.error('[API] ❌ 更新 KPI 失敗:', error)

    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'UPDATE_ERROR',
          message: error.message || '更新 KPI 失敗',
        },
      } as APIResponse,
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/knowledge/kpi
 * 刪除 KPI
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

    console.log('[API] 🗑️  刪除 KPI:', id)

    const content = readKnowledgeFile(KPI_FILENAME)
    const items = parseKPIFile(content)

    const filteredItems = items.filter(item => item.id !== id)

    if (filteredItems.length === items.length) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: `找不到 KPI: ${id}`,
          },
        } as APIResponse,
        { status: 404 }
      )
    }

    const newContent = serializeKPIToMarkdown(filteredItems)
    writeKnowledgeFile(KPI_FILENAME, newContent)

    console.log('[API] ✅ KPI 已刪除:', id)

    return NextResponse.json({
      success: true,
      data: { deletedId: id },
      metadata: { timestamp: new Date().toISOString() },
    } as APIResponse)
  } catch (error: any) {
    console.error('[API] ❌ 刪除 KPI 失敗:', error)

    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'DELETE_ERROR',
          message: error.message || '刪除 KPI 失敗',
        },
      } as APIResponse,
      { status: 500 }
    )
  }
}
