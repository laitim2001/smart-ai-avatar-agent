/**
 * Meeting Summaries API Route
 * @description 處理會議摘要的 CRUD 操作
 */

import { NextRequest, NextResponse } from 'next/server'
import type { APIResponse, MeetingSummary } from '@/types/knowledge'

// 使用 Node.js Runtime（需要 fs 模組）
export const runtime = 'nodejs'

// 模擬資料庫（實際應使用檔案系統或資料庫）
let meetingsStore: MeetingSummary[] = [
  {
    id: 'meeting-001',
    title: 'Sprint 2 規劃會議',
    date: '2025-10-18',
    attendees: ['CTO', 'Tech Lead', 'Frontend Dev', 'Backend Dev'],
    duration: 90,
    type: 'planning',
    summary: `討論 Sprint 2 的開發目標與任務分配。主要聚焦在知識庫管理系統的實作細節與時程安排。

**主要討論事項**:
1. 確認知識庫管理系統的功能範圍
2. 分配各功能模組的負責人
3. 評估技術風險與依賴關係
4. 確定 Sprint 2 的完成標準`,
    keyPoints: [
      '知識庫管理系統優先實作 Persona、FAQ、KPI 三大模組',
      '採用檔案系統儲存 Markdown 內容，後續可升級為資料庫',
      '使用 Monaco Editor 作為主要編輯器元件',
      'API 設計遵循 RESTful 原則，統一錯誤處理',
    ],
    actionItems: [
      {
        id: 'action-001-1',
        description: '建立 API 路由檔案架構',
        assignee: 'Backend Dev',
        dueDate: '2025-10-19',
        status: 'completed',
      },
      {
        id: 'action-001-2',
        description: '實作 Persona 編輯器頁面',
        assignee: 'Frontend Dev',
        dueDate: '2025-10-20',
        status: 'completed',
      },
      {
        id: 'action-001-3',
        description: '撰寫 API 測試腳本',
        assignee: 'Backend Dev',
        dueDate: '2025-10-21',
        status: 'in_progress',
      },
    ],
    decisions: [
      '採用 Monaco Editor 而非 CodeMirror（考量到 VS Code 兼容性）',
      'Markdown 檔案儲存於 knowledge/ 目錄',
      '所有 API 回應格式統一使用 APIResponse<T> 型別',
    ],
    nextSteps: [
      '完成 FAQ 管理功能',
      '整合搜尋引擎（Fuse.js）',
      '實作版本控制機制',
    ],
    tags: ['sprint-planning', 'knowledge-base', 'architecture'],
    archived: false,
  },
  {
    id: 'meeting-002',
    title: '前端架構審查會議',
    date: '2025-10-17',
    attendees: ['Tech Lead', 'Frontend Dev', 'UI/UX Designer'],
    duration: 60,
    type: 'review',
    summary: `審查前端元件架構設計,確保符合專案需求與最佳實踐。

**審查重點**:
1. 元件拆分策略
2. 狀態管理方案
3. 樣式系統一致性
4. 效能優化考量`,
    keyPoints: [
      '採用 Zustand 進行全域狀態管理（avatarStore, chatStore, audioStore）',
      'Tailwind CSS 4 不支援 @apply,需使用 utility classes',
      '所有動畫使用 Three.js useFrame 實作 60 FPS',
      'Monaco Editor 需處理 CSP (Content Security Policy) 白名單',
    ],
    actionItems: [
      {
        id: 'action-002-1',
        description: '更新 next.config.js CSP 設定',
        assignee: 'Frontend Dev',
        dueDate: '2025-10-18',
        status: 'completed',
      },
      {
        id: 'action-002-2',
        description: '重構 Avatar 動畫控制器',
        assignee: 'Frontend Dev',
        dueDate: '2025-10-22',
        status: 'pending',
      },
      {
        id: 'action-002-3',
        description: '撰寫元件使用文件',
        assignee: 'Frontend Dev',
        dueDate: '2025-10-23',
        status: 'pending',
      },
    ],
    decisions: [
      'Monaco Editor 使用 CDN 版本（@monaco-editor/react）',
      '所有 API 路由使用 Edge Runtime',
      '圖示庫統一使用 lucide-react',
    ],
    nextSteps: [
      '完成 Avatar 動畫系統重構',
      '建立元件庫文件',
      '實作無障礙功能（ARIA 標籤）',
    ],
    tags: ['frontend', 'architecture', 'review'],
    archived: false,
  },
  {
    id: 'meeting-003',
    title: 'Azure 服務整合討論',
    date: '2025-10-15',
    attendees: ['CTO', 'Backend Dev', 'DevOps'],
    duration: 45,
    type: 'technical',
    summary: `討論 Azure OpenAI 與 Speech Services 整合策略。

**整合重點**:
1. API 金鑰管理
2. 錯誤處理機制
3. 效能監控
4. 成本控制`,
    keyPoints: [
      '使用 Azure OpenAI SDK v2.0（需 @azure/openai + openai 兩個套件）',
      'SSE 串流必須使用 Edge Runtime',
      'TTS 語音合成預設使用 zh-TW-HsiaoChenNeural',
      '目標延遲 <2500ms（輸入 → 音訊播放）',
    ],
    actionItems: [
      {
        id: 'action-003-1',
        description: '建立 Azure 服務測試腳本',
        assignee: 'Backend Dev',
        dueDate: '2025-10-16',
        status: 'completed',
      },
      {
        id: 'action-003-2',
        description: '實作效能監控日誌',
        assignee: 'Backend Dev',
        dueDate: '2025-10-17',
        status: 'completed',
      },
      {
        id: 'action-003-3',
        description: '設定 Azure Portal 環境變數',
        assignee: 'DevOps',
        dueDate: '2025-10-16',
        status: 'completed',
      },
    ],
    decisions: [
      '選擇 Azure OpenAI 而非 OpenAI API（資料主權考量）',
      '暫不實作 Redis 快取（MVP 階段）',
      '錯誤重試次數上限 3 次',
    ],
    nextSteps: [
      '監控 Azure 服務成本',
      '評估升級至 GPT-4o 的可行性',
      '實作 Streaming TTS（未來優化）',
    ],
    tags: ['azure', 'integration', 'backend'],
    archived: true,
  },
]

/**
 * GET /api/knowledge/meetings
 * 列出所有會議摘要
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')
    const archived = searchParams.get('archived')
    const tag = searchParams.get('tag')

    let filteredMeetings = [...meetingsStore]

    // 類型篩選
    if (type) {
      filteredMeetings = filteredMeetings.filter((m) => m.type === type)
    }

    // 歸檔狀態篩選
    if (archived !== null) {
      const isArchived = archived === 'true'
      filteredMeetings = filteredMeetings.filter((m) => m.archived === isArchived)
    }

    // 標籤篩選
    if (tag) {
      filteredMeetings = filteredMeetings.filter((m) => m.tags.includes(tag))
    }

    // 按日期排序（最新在前）
    filteredMeetings.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    )

    const response: APIResponse<MeetingSummary[]> = {
      success: true,
      data: filteredMeetings,
      metadata: {
        timestamp: new Date().toISOString(),
        total: filteredMeetings.length,
      },
    }

    return NextResponse.json(response)
  } catch (error: any) {
    console.error('[API] ❌ 讀取會議摘要失敗:', error)

    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'READ_ERROR',
          message: error.message || '讀取會議摘要失敗',
        },
      } as APIResponse,
      { status: 500 }
    )
  }
}

/**
 * POST /api/knowledge/meetings
 * 新增會議摘要
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // 生成 ID
    const newMeeting: MeetingSummary = {
      id: `meeting-${Date.now()}`,
      ...body,
      date: body.date || new Date().toISOString().split('T')[0],
      archived: body.archived || false,
    }

    meetingsStore.push(newMeeting)

    const response: APIResponse<MeetingSummary> = {
      success: true,
      data: newMeeting,
      metadata: {
        timestamp: new Date().toISOString(),
      },
    }

    return NextResponse.json(response)
  } catch (error: any) {
    console.error('[API] ❌ 新增會議摘要失敗:', error)

    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'CREATE_ERROR',
          message: error.message || '新增會議摘要失敗',
        },
      } as APIResponse,
      { status: 500 }
    )
  }
}

/**
 * PUT /api/knowledge/meetings
 * 更新會議摘要
 */
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id } = body

    const index = meetingsStore.findIndex((m) => m.id === id)

    if (index === -1) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: '找不到該會議摘要',
          },
        } as APIResponse,
        { status: 404 }
      )
    }

    meetingsStore[index] = { ...meetingsStore[index], ...body }

    const response: APIResponse<MeetingSummary> = {
      success: true,
      data: meetingsStore[index],
      metadata: {
        timestamp: new Date().toISOString(),
      },
    }

    return NextResponse.json(response)
  } catch (error: any) {
    console.error('[API] ❌ 更新會議摘要失敗:', error)

    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'UPDATE_ERROR',
          message: error.message || '更新會議摘要失敗',
        },
      } as APIResponse,
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/knowledge/meetings
 * 刪除會議摘要
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

    const index = meetingsStore.findIndex((m) => m.id === id)

    if (index === -1) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: '找不到該會議摘要',
          },
        } as APIResponse,
        { status: 404 }
      )
    }

    meetingsStore.splice(index, 1)

    const response: APIResponse = {
      success: true,
      metadata: {
        timestamp: new Date().toISOString(),
      },
    }

    return NextResponse.json(response)
  } catch (error: any) {
    console.error('[API] ❌ 刪除會議摘要失敗:', error)

    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'DELETE_ERROR',
          message: error.message || '刪除會議摘要失敗',
        },
      } as APIResponse,
      { status: 500 }
    )
  }
}
