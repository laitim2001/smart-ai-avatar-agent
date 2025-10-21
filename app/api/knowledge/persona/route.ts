/**
 * Persona API Route
 * @description 處理 Persona 的讀取和更新操作
 */

import { NextRequest, NextResponse } from 'next/server'
import {
  readKnowledgeFile,
  writeKnowledgeFile,
  getFileMetadata,
} from '@/lib/knowledge/file-manager'
import { validatePersona } from '@/lib/knowledge/validator'
import type { APIResponse, PersonaContent } from '@/types/knowledge'

// 使用 Node.js Runtime（需要 fs 模組）
export const runtime = 'nodejs'

const PERSONA_FILENAME = 'persona.md'

/**
 * GET /api/knowledge/persona
 * 讀取 Persona 定義
 */
export async function GET(request: NextRequest) {
  try {
    console.log('[API] 📖 讀取 Persona...')

    // 讀取檔案
    const content = readKnowledgeFile(PERSONA_FILENAME)
    const metadata = getFileMetadata(PERSONA_FILENAME)

    // 分析結構
    const validation = validatePersona(content)

    const response: APIResponse<PersonaContent> = {
      success: true,
      data: {
        content,
        metadata,
        structure: {
          sections: extractPersonaSections(content),
          completeness: validation.score || 0,
          consistency: calculateConsistency(content),
        },
      },
      metadata: {
        timestamp: new Date().toISOString(),
      },
    }

    return NextResponse.json(response)
  } catch (error: any) {
    console.error('[API] ❌ 讀取 Persona 失敗:', error)

    const errorResponse: APIResponse = {
      success: false,
      error: {
        code: 'READ_ERROR',
        message: error.message || '讀取 Persona 失敗',
        details: error,
      },
      metadata: {
        timestamp: new Date().toISOString(),
      },
    }

    return NextResponse.json(errorResponse, { status: 500 })
  }
}

/**
 * POST /api/knowledge/persona
 * 更新 Persona 定義
 */
export async function POST(request: NextRequest) {
  try {
    console.log('[API] ✏️  更新 Persona...')

    // 解析請求
    const body = await request.json()
    const { content } = body

    if (!content || typeof content !== 'string') {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INVALID_INPUT',
            message: 'content 欄位必須是非空字串',
          },
        } as APIResponse,
        { status: 400 }
      )
    }

    // 驗證內容
    const validation = validatePersona(content)

    if (!validation.valid) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: '內容驗證失敗',
            details: validation.errors,
          },
          metadata: {
            warnings: validation.warnings,
          },
        } as APIResponse,
        { status: 400 }
      )
    }

    // 寫入檔案
    const metadata = writeKnowledgeFile(PERSONA_FILENAME, content)

    console.log('[API] ✅ Persona 已更新')

    const response: APIResponse<{ metadata: typeof metadata; validation: typeof validation }> = {
      success: true,
      data: {
        metadata,
        validation,
      },
      metadata: {
        timestamp: new Date().toISOString(),
      },
    }

    return NextResponse.json(response)
  } catch (error: any) {
    console.error('[API] ❌ 更新 Persona 失敗:', error)

    const errorResponse: APIResponse = {
      success: false,
      error: {
        code: 'WRITE_ERROR',
        message: error.message || '更新 Persona 失敗',
        details: error,
      },
      metadata: {
        timestamp: new Date().toISOString(),
      },
    }

    return NextResponse.json(errorResponse, { status: 500 })
  }
}

// ============================================
// 輔助函數
// ============================================

/**
 * 提取 Persona 章節
 */
function extractPersonaSections(content: string) {
  const sections: Array<{
    title: string
    content: string
    wordCount: number
    isComplete: boolean
    warnings?: string[]
  }> = []

  const requiredSections = [
    '核心身份',
    '溝通風格與語氣',
    '決策原則',
    '專業領域',
    '互動模式',
    '領導與管理哲學',
    '個人信念與思維模型',
    '輸出模板',
    '詞彙與語氣規範',
    '反問清單',
  ]

  requiredSections.forEach((sectionTitle) => {
    const regex = new RegExp(
      `##\\s*\\d*\\.?\\s*${sectionTitle}([\\s\\S]*?)(?=##|$)`,
      'i'
    )
    const match = content.match(regex)

    if (match) {
      const sectionContent = match[1].trim()
      const wordCount = (sectionContent.match(/[\u4e00-\u9fa5a-zA-Z]+/g) || [])
        .length

      sections.push({
        title: sectionTitle,
        content: sectionContent,
        wordCount,
        isComplete: wordCount >= 100,
        warnings: wordCount < 100 ? ['內容過短，建議補充更多細節'] : undefined,
      })
    } else {
      sections.push({
        title: sectionTitle,
        content: '',
        wordCount: 0,
        isComplete: false,
        warnings: ['缺少此章節'],
      })
    }
  })

  return sections
}

/**
 * 計算語氣一致性
 * @description 簡化版實作，實際可使用 NLP 分析
 */
function calculateConsistency(content: string): number {
  // 簡單啟發式規則：檢查常見用詞的一致性
  const professionalTerms = [
    '數據',
    'ROI',
    'KPI',
    '商業價值',
    '量化',
    '分析',
  ]
  const casualTerms = ['可能', '也許', '大概', '隨便']

  const professionalCount = professionalTerms.filter((term) =>
    content.includes(term)
  ).length
  const casualCount = casualTerms.filter((term) => content.includes(term))
    .length

  // 專業用詞多 = 一致性高
  const score = professionalCount > casualCount ? 85 : 65

  return Math.min(100, score + Math.random() * 10) // 加入隨機波動
}
