/**
 * Decision Logs API Route
 * @description 處理決策日誌的 CRUD 操作
 */

import { NextRequest, NextResponse } from 'next/server'
import type { APIResponse, DecisionLogItem } from '@/types/knowledge'

// 使用 Node.js Runtime（需要 fs 模組）
export const runtime = 'nodejs'

// 模擬資料庫（實際應使用檔案系統或資料庫）
let decisionsStore: DecisionLogItem[] = [
  {
    id: 'decision-001',
    title: '選擇 Azure OpenAI 作為 LLM 提供商',
    date: '2025-10-15',
    context: '需要為 AI Agent 選擇 LLM 服務提供商，考慮成本、效能、與現有 Azure 生態系統整合度',
    options: [
      {
        title: 'Azure OpenAI',
        pros: ['與現有 Azure 服務整合良好', '企業級 SLA', '資料留在台灣'],
        cons: ['成本較高', '部分功能更新較慢'],
        estimatedCost: 'NTD 50,000/月',
      },
      {
        title: 'OpenAI API',
        pros: ['功能更新最快', '社群支援豐富'],
        cons: ['資料出境風險', '無企業 SLA'],
        estimatedCost: 'NTD 30,000/月',
      },
    ],
    decision: '選擇 Azure OpenAI',
    rationale:
      '雖然成本較高，但資料主權、SLA 保證、與現有 Azure 基礎設施整合度是關鍵考量。長期來看，減少跨雲端複雜度更具價值。',
    impact: ['預算增加 NTD 20,000/月', '開發時間節省 2 週（減少整合工作）'],
    owner: 'CTO',
    status: 'implemented',
    tags: ['技術選型', 'AI', '雲端服務'],
    reviewDate: '2026-01-15',
  },
  {
    id: 'decision-002',
    title: '採用 Next.js 15 App Router 架構',
    date: '2025-10-10',
    context: '新專案需要選擇前端框架，考慮開發效率、SEO、部署成本',
    options: [
      {
        title: 'Next.js 15 App Router',
        pros: ['Server Components 提升效能', 'SEO 友善', 'Vercel 部署簡單'],
        cons: ['學習曲線較陡', '部分套件相容性問題'],
        estimatedCost: 'NTD 0 (開源)',
      },
      {
        title: 'React SPA + Vite',
        pros: ['開發體驗好', '生態系成熟'],
        cons: ['SEO 需額外處理', '無 SSR'],
        estimatedCost: 'NTD 0 (開源)',
      },
    ],
    decision: '採用 Next.js 15 App Router',
    rationale: 'SEO 需求明確，Server Components 可減少客戶端 Bundle 大小，Vercel 部署體驗佳。',
    impact: ['開發時間增加 1 週（學習成本）', 'First Contentful Paint 減少 40%'],
    owner: 'Tech Lead',
    status: 'implemented',
    tags: ['技術選型', '前端', '架構'],
    reviewDate: '2025-12-31',
  },
]

/**
 * GET /api/knowledge/decisions
 * 列出所有決策日誌
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const tag = searchParams.get('tag')

    let filteredDecisions = [...decisionsStore]

    // 狀態篩選
    if (status) {
      filteredDecisions = filteredDecisions.filter((d) => d.status === status)
    }

    // 標籤篩選
    if (tag) {
      filteredDecisions = filteredDecisions.filter((d) => d.tags.includes(tag))
    }

    // 按日期排序（最新在前）
    filteredDecisions.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    )

    const response: APIResponse<DecisionLogItem[]> = {
      success: true,
      data: filteredDecisions,
      metadata: {
        timestamp: new Date().toISOString(),
        total: filteredDecisions.length,
      },
    }

    return NextResponse.json(response)
  } catch (error: any) {
    console.error('[API] ❌ 讀取決策日誌失敗:', error)

    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'READ_ERROR',
          message: error.message || '讀取決策日誌失敗',
        },
      } as APIResponse,
      { status: 500 }
    )
  }
}

/**
 * POST /api/knowledge/decisions
 * 新增決策日誌
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // 生成 ID
    const newDecision: DecisionLogItem = {
      id: `decision-${Date.now()}`,
      ...body,
      date: body.date || new Date().toISOString().split('T')[0],
      status: body.status || 'pending',
    }

    decisionsStore.push(newDecision)

    const response: APIResponse<DecisionLogItem> = {
      success: true,
      data: newDecision,
      metadata: {
        timestamp: new Date().toISOString(),
      },
    }

    return NextResponse.json(response)
  } catch (error: any) {
    console.error('[API] ❌ 新增決策日誌失敗:', error)

    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'CREATE_ERROR',
          message: error.message || '新增決策日誌失敗',
        },
      } as APIResponse,
      { status: 500 }
    )
  }
}

/**
 * PUT /api/knowledge/decisions
 * 更新決策日誌
 */
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id } = body

    const index = decisionsStore.findIndex((d) => d.id === id)

    if (index === -1) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: '找不到該決策日誌',
          },
        } as APIResponse,
        { status: 404 }
      )
    }

    decisionsStore[index] = { ...decisionsStore[index], ...body }

    const response: APIResponse<DecisionLogItem> = {
      success: true,
      data: decisionsStore[index],
      metadata: {
        timestamp: new Date().toISOString(),
      },
    }

    return NextResponse.json(response)
  } catch (error: any) {
    console.error('[API] ❌ 更新決策日誌失敗:', error)

    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'UPDATE_ERROR',
          message: error.message || '更新決策日誌失敗',
        },
      } as APIResponse,
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/knowledge/decisions
 * 刪除決策日誌
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
            message: '缺少 id 參數',
          },
        } as APIResponse,
        { status: 400 }
      )
    }

    const index = decisionsStore.findIndex((d) => d.id === id)

    if (index === -1) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: '找不到該決策日誌',
          },
        } as APIResponse,
        { status: 404 }
      )
    }

    decisionsStore.splice(index, 1)

    const response: APIResponse = {
      success: true,
      metadata: {
        timestamp: new Date().toISOString(),
      },
    }

    return NextResponse.json(response)
  } catch (error: any) {
    console.error('[API] ❌ 刪除決策日誌失敗:', error)

    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'DELETE_ERROR',
          message: error.message || '刪除決策日誌失敗',
        },
      } as APIResponse,
      { status: 500 }
    )
  }
}
