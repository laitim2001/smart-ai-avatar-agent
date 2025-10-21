/**
 * Knowledge Search API Route
 * @description 全局搜尋知識庫內容
 */

import { NextRequest, NextResponse } from 'next/server'
import { listKnowledgeFiles, readKnowledgeFile } from '@/lib/knowledge/file-manager'
import type { APIResponse, SearchQuery, SearchResponse, SearchResult } from '@/types/knowledge'

export const runtime = 'nodejs'

/**
 * POST /api/knowledge/search
 * 全文搜尋知識庫
 */
export async function POST(request: NextRequest) {
  try {
    const startTime = Date.now()
    console.log('[API] 🔍 執行知識庫搜尋...')

    const body: SearchQuery = await request.json()
    const { query, type, limit = 10 } = body

    if (!query || query.trim().length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INVALID_INPUT',
            message: 'query 欄位不能為空',
          },
        } as APIResponse,
        { status: 400 }
      )
    }

    // 獲取所有知識庫檔案
    let files = listKnowledgeFiles()

    // 按類型過濾
    if (type) {
      files = files.filter(file => file.type === type)
    }

    const results: SearchResult[] = []

    // 搜尋每個檔案
    for (const file of files) {
      try {
        const content = readKnowledgeFile(file.filename)
        const relevance = calculateRelevance(content, query)

        if (relevance > 0) {
          results.push({
            file: file.filename,
            type: file.type,
            title: extractTitle(content),
            excerpt: extractExcerpt(content, query),
            relevance,
            highlights: extractHighlights(content, query),
          })
        }
      } catch (error) {
        console.error(`[API] ⚠️  搜尋檔案失敗: ${file.filename}`, error)
      }
    }

    // 按相關性排序
    results.sort((a, b) => b.relevance - a.relevance)

    // 限制結果數量
    const limitedResults = results.slice(0, limit)

    const took = Date.now() - startTime

    console.log(`[API] ✅ 搜尋完成: 找到 ${results.length} 個結果 (${took}ms)`)

    const response: APIResponse<SearchResponse> = {
      success: true,
      data: {
        results: limitedResults,
        total: results.length,
        took,
      },
      metadata: {
        timestamp: new Date().toISOString(),
      },
    }

    return NextResponse.json(response)
  } catch (error: any) {
    console.error('[API] ❌ 搜尋失敗:', error)

    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'SEARCH_ERROR',
          message: error.message || '搜尋失敗',
        },
      } as APIResponse,
      { status: 500 }
    )
  }
}

// ============================================
// 輔助函數
// ============================================

/**
 * 計算相關性分數 (0-100)
 */
function calculateRelevance(content: string, query: string): number {
  const lowerContent = content.toLowerCase()
  const lowerQuery = query.toLowerCase()

  // 1. 完全匹配
  const exactMatches = (lowerContent.match(new RegExp(lowerQuery, 'g')) || []).length
  let score = exactMatches * 10

  // 2. 關鍵字匹配
  const keywords = lowerQuery.split(/\s+/).filter(k => k.length > 1)
  keywords.forEach(keyword => {
    const matches = (lowerContent.match(new RegExp(keyword, 'g')) || []).length
    score += matches * 5
  })

  // 3. 標題匹配加權
  const titleMatch = extractTitle(content).toLowerCase().includes(lowerQuery)
  if (titleMatch) {
    score += 30
  }

  return Math.min(100, score)
}

/**
 * 提取文件標題
 */
function extractTitle(content: string): string {
  const match = content.match(/^#\s+(.+)$/m)
  return match ? match[1].trim() : '無標題'
}

/**
 * 提取包含搜尋關鍵字的內容片段
 */
function extractExcerpt(content: string, query: string, maxLength: number = 200): string {
  const lowerContent = content.toLowerCase()
  const lowerQuery = query.toLowerCase()

  const index = lowerContent.indexOf(lowerQuery)

  if (index === -1) {
    // 如果找不到完全匹配，返回開頭
    return content.substring(0, maxLength) + '...'
  }

  // 提取關鍵字前後的內容
  const start = Math.max(0, index - 50)
  const end = Math.min(content.length, index + query.length + 150)

  let excerpt = content.substring(start, end)

  if (start > 0) excerpt = '...' + excerpt
  if (end < content.length) excerpt = excerpt + '...'

  return excerpt
}

/**
 * 提取高亮關鍵字
 */
function extractHighlights(content: string, query: string, maxHighlights: number = 5): string[] {
  const highlights: string[] = []
  const lowerContent = content.toLowerCase()
  const keywords = query.toLowerCase().split(/\s+/).filter(k => k.length > 1)

  const lines = content.split('\n')

  for (const line of lines) {
    const lowerLine = line.toLowerCase()

    for (const keyword of keywords) {
      if (lowerLine.includes(keyword)) {
        const trimmed = line.trim()
        if (trimmed.length > 0 && !highlights.includes(trimmed)) {
          highlights.push(trimmed)
        }

        if (highlights.length >= maxHighlights) {
          return highlights
        }
      }
    }
  }

  return highlights
}
