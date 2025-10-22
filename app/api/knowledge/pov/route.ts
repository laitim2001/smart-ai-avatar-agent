/**
 * POV Articles API Route
 * @description 處理 POV 文章的 CRUD 操作
 */

import { NextRequest, NextResponse } from 'next/server'
import type { APIResponse, POVArticle } from '@/types/knowledge'

// 使用 Node.js Runtime（需要 fs 模組）
export const runtime = 'nodejs'

// 模擬資料庫（實際應使用檔案系統或資料庫）
let povStore: POVArticle[] = [
  {
    id: 'pov-001',
    title: '為什麼我們選擇 AI Agent 作為產品方向',
    slug: 'why-ai-agent',
    author: 'CTO',
    publishDate: '2025-10-10',
    lastModified: '2025-10-15',
    category: 'strategy',
    tags: ['AI', '產品策略', '市場分析'],
    status: 'published',
    excerpt:
      '在 AI 技術快速發展的今天,我們相信 AI Agent 將成為下一代人機互動的核心。本文分享我們選擇這個方向的思考過程與市場洞察。',
    content: `# 為什麼我們選擇 AI Agent 作為產品方向

## 市場趨勢分析

近年來,AI 技術的發展呈現幾個關鍵趨勢:

1. **大語言模型的成熟**: GPT-4、Claude 等模型展現出驚人的理解與生成能力
2. **多模態整合**: 文字、語音、影像的無縫整合成為可能
3. **個性化需求增長**: 使用者期待更智能、更貼近個人需求的互動體驗

## 我們的洞察

經過深入的市場研究與技術評估,我們發現幾個關鍵機會點:

### 1. 人機互動的典範轉移

傳統的對話機器人(Chatbot)受限於固定的對話流程與有限的理解能力。AI Agent 透過大語言模型,可以:

- 理解複雜的自然語言指令
- 根據上下文動態調整回應
- 主動提供建議與協助

### 2. 視覺化的情感連結

純文字的對話缺乏情感溫度。3D Avatar 的加入:

- 提供視覺化的情感表達
- 增強使用者的投入感
- 創造更自然的互動體驗

### 3. 技術可行性

Azure OpenAI 與 Speech Services 的成熟:

- 企業級的穩定性與 SLA 保證
- 繁體中文的優秀支援
- 合理的成本結構

## 產品定位

我們將 AI Agent 定位為「虛擬助理的 2.0 版本」:

- **不只是回答**: 主動協助、建議、引導
- **不只是文字**: 視覺、聲音、動作的完整體驗
- **不只是工具**: 有個性、有溫度的互動夥伴

## 挑戰與應對

當然,這條路也充滿挑戰:

### 技術挑戰

- **即時性要求**: 語音合成與動畫同步需要精密的時序控制
- **個性化**: 如何讓 Avatar 展現獨特的個性與風格
- **穩定性**: 多個服務整合的穩定性保證

### 商業挑戰

- **成本控制**: Azure 服務的成本需要精密管控
- **市場教育**: 使用者對 AI Agent 的認知尚需培養
- **差異化**: 在競爭激烈的市場中建立獨特價值

## 未來展望

我們相信,AI Agent 將在以下場景發揮重要作用:

1. **客戶服務**: 24/7 的智能客服,減少人工成本
2. **教育培訓**: 個性化的虛擬教師,提供客製化學習體驗
3. **醫療諮詢**: 初步健康諮詢,分流醫療資源
4. **企業協作**: 虛擬會議助理,自動記錄與追蹤

## 結論

選擇 AI Agent 作為產品方向,是基於對技術趨勢的深入理解與市場機會的精準判斷。我們有信心,透過團隊的努力與技術的持續創新,打造出真正有價值、有溫度的 AI Agent 產品。

---

*本文代表團隊在 2025 年 10 月的思考,隨著技術與市場的演進,我們的策略也將持續調整。*
`,
    readingTime: 8,
    views: 245,
    likes: 32,
  },
  {
    id: 'pov-002',
    title: 'Lip Sync 系統的技術挑戰與解決方案',
    slug: 'lipsync-technical-challenges',
    author: 'Tech Lead',
    publishDate: '2025-10-20',
    lastModified: '2025-10-20',
    category: 'technical',
    tags: ['技術', 'Lip Sync', 'Three.js', 'Azure Speech'],
    status: 'published',
    excerpt:
      '實作即時 Lip Sync 系統是 AI Agent 開發中最具挑戰性的任務之一。本文分享我們如何透過 Azure Speech SDK 與 Three.js 打造流暢的嘴型同步動畫。',
    content: `# Lip Sync 系統的技術挑戰與解決方案

## 問題背景

在 Epic 4 的開發過程中,我們面臨一個核心挑戰:**如何讓 3D Avatar 的嘴型與 TTS 語音完美同步?**

這個看似簡單的需求,實際上涉及多個技術層面的整合與優化。

## 技術架構

我們的 Lip Sync 系統由三個核心元件組成:

### 1. LipSyncController (單例模式控制器)

\`\`\`typescript
class LipSyncController {
  private visemeQueue: VisemeData[]
  private startTime: number

  start(visemes: VisemeData[], startTime: number) {
    this.visemeQueue = visemes
    this.startTime = startTime
  }

  update(currentTime: number) {
    // 60 FPS 更新頻率
    const elapsed = currentTime - this.startTime
    const currentViseme = this.findViseme(elapsed)
    this.animator.setTarget(currentViseme)
  }
}
\`\`\`

### 2. MouthAnimator (Blendshape 動畫器)

處理嘴型的平滑過渡與自適應強度:

\`\`\`typescript
class MouthAnimator {
  setTarget(blendshape: string, weight: number) {
    // 自適應強度系統
    const adaptiveWeight = this.calculateAdaptiveWeight(weight)

    // Co-articulation (協同發音)
    const blendedWeight = this.applyCoarticulation(
      adaptiveWeight,
      nextViseme
    )

    // 平滑過渡 (30ms)
    this.smoothTransition(blendshape, blendedWeight)
  }
}
\`\`\`

### 3. VisemeMapper (Viseme 映射器)

將 Azure Viseme ID (0-21) 映射到 Ready Player Me 的 Oculus Blendshapes (15 個):

| Azure Viseme | Oculus Blendshape | 用途 |
|--------------|------------------|------|
| 0 (Silence) | viseme_sil | 靜音 |
| 1 (AA) | viseme_aa | 開口音 "啊" |
| 6 (E) | viseme_E | "欸" 音 |
| 21 (TH) | viseme_TH | 舌齒音 |

## 核心挑戰與解決方案

### 挑戰 1: 音訊與動畫同步

**問題**: TTS 音訊播放與 Viseme 時間軸必須精確對齊

**解決方案**:
- 使用 \`AudioContext.currentTime\` 作為統一時間基準
- LipSyncController 每幀查詢當前時間對應的 Viseme
- 確保 60 FPS 的更新頻率

### 挑戰 2: Viseme 權重不一致

**問題**: Azure TTS 回傳的 Viseme 權重範圍不穩定 (0.01-1.0)

**解決方案 - 自適應強度系統**:

\`\`\`typescript
calculateAdaptiveWeight(weight: number): number {
  if (weight < 0.1) {
    // 小值放大 (最高 10 倍)
    return weight * (5 + weight * 50)
  } else if (weight < 0.5) {
    // 中值使用預設倍數
    return weight * 1.5
  } else {
    // 大值縮小避免飽和
    return weight * 0.8
  }
}
\`\`\`

### 挑戰 3: 機械感嘴型

**問題**: Viseme 之間的突然切換導致不自然的動畫

**解決方案 - Co-articulation (協同發音)**:

在自然語言中,相鄰音節會相互影響。我們透過 30% 的權重混合模擬這個效果:

\`\`\`typescript
applyCoarticulation(currentWeight: number): number {
  if (!nextViseme) return currentWeight

  const nextWeight = this.calculateAdaptiveWeight(nextViseme.weight)
  return currentWeight * 0.7 + nextWeight * 0.3
}
\`\`\`

### 挑戰 4: 語速過快

**問題**: 預設 TTS 語速導致 Viseme 切換過快,無法清楚看見每個嘴型

**解決方案 - SSML 語速控制**:

\`\`\`xml
<speak>
  <prosody rate="0.2">你的文字內容</prosody>
</speak>
\`\`\`

20% 的語速確保每個嘴型都清晰可見。

## 效能優化

### 1. 60 FPS 目標

使用 Three.js 的 \`useFrame\` hook 確保每幀更新:

\`\`\`typescript
useFrame((state, delta) => {
  const time = audioContext.currentTime
  lipSyncController.update(time)
})
\`\`\`

### 2. Blendshape 快取

避免重複計算相同的 Blendshape 權重:

\`\`\`typescript
private cache = new Map<string, number>()

setTarget(blendshape: string, weight: number) {
  const cached = this.cache.get(blendshape)
  if (cached === weight) return

  this.cache.set(blendshape, weight)
  this.applyBlendshape(blendshape, weight)
}
\`\`\`

### 3. 記憶體管理

Viseme 資料在音訊播放結束後立即清理:

\`\`\`typescript
onAudioEnd() {
  this.lipSyncController.stop()
  this.visemeQueue = []
  this.cache.clear()
}
\`\`\`

## 測試與驗證

我們透過以下方式驗證 Lip Sync 品質:

1. **視覺檢查**: 對比 TTS 音訊與嘴型是否吻合
2. **Console 日誌**: 監控 Viseme 切換與權重計算
3. **效能監控**: 確保 60 FPS 穩定運行
4. **多語言測試**: 繁體中文、英文的 Lip Sync 效果

## 未來優化方向

1. **表情整合**: 結合嘴型與眉毛、眼睛動作
2. **情緒驅動**: 根據對話情緒調整動畫強度
3. **自定義 Viseme**: 支援使用者上傳自己的 Blendshape 映射
4. **AI 預測**: 使用 ML 模型預測更自然的過渡

## 結論

Lip Sync 系統的實作是技術與藝術的結合。透過精密的時序控制、自適應權重系統、協同發音模擬,我們成功打造出流暢自然的嘴型動畫。

這個系統不僅提升了 AI Agent 的擬真度,更為未來的多模態互動奠定了堅實基礎。

---

*本文記錄了 Epic 4 開發過程中的技術決策與實作細節,供團隊與社群參考。*
`,
    readingTime: 12,
    views: 89,
    likes: 15,
  },
  {
    id: 'pov-003',
    title: '知識庫管理系統的設計哲學',
    slug: 'knowledge-management-design',
    author: 'Product Manager',
    publishDate: null,
    lastModified: '2025-10-21',
    category: 'product',
    tags: ['產品設計', '知識管理', 'UX'],
    status: 'draft',
    excerpt:
      '一個好的知識庫管理系統不僅是儲存資訊的工具,更是團隊智慧的延伸。本文分享我們在設計時的核心理念與取捨。',
    content: `# 知識庫管理系統的設計哲學

## 為什麼需要知識庫?

在快速發展的專案中,團隊面臨幾個核心挑戰:

1. **資訊散落**: 決策分散在 email、Slack、會議記錄
2. **脈絡遺失**: 新成員不了解「為什麼這樣做」
3. **重複討論**: 相同問題反覆出現,浪費時間

知識庫管理系統的目標是:**將隱性知識顯性化,讓團隊智慧可累積、可傳承**。

## 設計原則

### 1. 結構化與彈性的平衡

我們選擇了**半結構化**的設計:

- **Persona、FAQ、KPI**: 固定欄位,確保完整性
- **決策日誌**: 結構化表單,但支援 Markdown 自由發揮
- **會議摘要**: 必填欄位 + 可選區塊

這種設計兼顧了**資料一致性**與**使用彈性**。

### 2. Markdown 作為通用格式

為什麼選擇 Markdown?

- **開發者友善**: 技術團隊熟悉
- **版本控制**: 可整合 Git
- **可移植性**: 純文字格式,不受工具綁定
- **可讀性**: 即使不渲染也易讀

### 3. 即時預覽 + 所見即所得

使用 Monaco Editor (VS Code 核心) 提供:

- 語法高亮
- 自動完成
- 快捷鍵支援 (Ctrl+S 儲存)
- 即時預覽

## 功能模組設計

### Persona 編輯器

**目標**: 定義 AI Agent 的角色與個性

**設計重點**:
- 章節導航,快速跳轉
- 完整度檢查,提醒缺失資訊
- 字數統計,避免過度冗長

### FAQ 管理

**目標**: 常見問題的集中管理與快速搜尋

**設計重點**:
- 分類管理,支援巢狀分類
- 全文搜尋,包含問題與答案
- 點擊統計,了解使用者需求

### 決策日誌

**目標**: 記錄重要決策的背景、選項、理由

**設計重點**:
- 選項比較矩陣
- 影響評估清單
- 檢討日期提醒

### 會議摘要

**目標**: 會議重點、待辦事項、決策的完整記錄

**設計重點**:
- 待辦事項追蹤
- 批次歸檔功能
- 參與者標籤

## UI/UX 考量

### 色彩系統

- **Persona**: 藍色 (專業、智慧)
- **FAQ**: 綠色 (協助、解答)
- **決策日誌**: 橙色 (重要、關鍵)
- **會議摘要**: 紫色 (協作、團隊)

### 資訊層次

1. **統計卡片**: 一眼掌握整體狀況
2. **列表檢視**: 快速瀏覽與篩選
3. **詳細模態**: 完整資訊展示

### 操作流程

遵循「3 次點擊原則」:

1. 進入知識庫總覽
2. 選擇模組(Persona/FAQ/...)
3. 檢視或編輯具體內容

## 技術選型

### 前端

- **Next.js 15**: App Router 的檔案路由
- **React 19**: Server Components 提升效能
- **Tailwind CSS**: Utility-first,快速開發
- **Monaco Editor**: 專業級編輯器體驗

### 後端

- **Edge Runtime**: 低延遲 API 回應
- **檔案系統**: MVP 階段使用 Markdown 檔案
- **未來升級**: 考慮 PostgreSQL + Vector Search

## 未來規劃

### Phase 1 (MVP) - 已完成 ✅

- Persona、FAQ、KPI、決策日誌、會議摘要

### Phase 2 - 進行中

- 全文搜尋 (Fuse.js)
- 版本控制 (Git 整合)
- POV 文章管理

### Phase 3 - 規劃中

- AI 自動摘要
- 知識圖譜視覺化
- 權限管理
- 多人協作編輯

## 結論

知識庫管理系統不是單純的文件儲存工具,而是團隊智慧的放大器。透過良好的設計與技術實作,我們相信這個系統能夠:

1. **減少溝通成本**: 資訊透明,減少重複詢問
2. **加速新人上手**: 完整的脈絡與決策記錄
3. **累積組織資產**: 隱性知識顯性化
4. **提升決策品質**: 有據可查,避免重蹈覆轍

---

*本文為草稿,將在功能完善後發布。*
`,
    readingTime: 10,
    views: 0,
    likes: 0,
  },
]

/**
 * GET /api/knowledge/pov
 * 列出所有 POV 文章
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const category = searchParams.get('category')
    const tag = searchParams.get('tag')

    let filteredPOVs = [...povStore]

    // 狀態篩選
    if (status) {
      filteredPOVs = filteredPOVs.filter((p) => p.status === status)
    }

    // 分類篩選
    if (category) {
      filteredPOVs = filteredPOVs.filter((p) => p.category === category)
    }

    // 標籤篩選
    if (tag) {
      filteredPOVs = filteredPOVs.filter((p) => p.tags.includes(tag))
    }

    // 按發布日期排序（最新在前,草稿在最後）
    filteredPOVs.sort((a, b) => {
      if (!a.publishDate) return 1
      if (!b.publishDate) return -1
      return new Date(b.publishDate).getTime() - new Date(a.publishDate).getTime()
    })

    const response: APIResponse<POVArticle[]> = {
      success: true,
      data: filteredPOVs,
      metadata: {
        timestamp: new Date().toISOString(),
        total: filteredPOVs.length,
      },
    }

    return NextResponse.json(response)
  } catch (error: any) {
    console.error('[API] ❌ 讀取 POV 文章失敗:', error)

    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'READ_ERROR',
          message: error.message || '讀取 POV 文章失敗',
        },
      } as APIResponse,
      { status: 500 }
    )
  }
}

/**
 * POST /api/knowledge/pov
 * 新增 POV 文章
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // 生成 ID 與 slug
    const newPOV: POVArticle = {
      id: `pov-${Date.now()}`,
      slug: body.slug || body.title.toLowerCase().replace(/\s+/g, '-'),
      ...body,
      lastModified: new Date().toISOString().split('T')[0],
      status: body.status || 'draft',
      views: 0,
      likes: 0,
    }

    povStore.push(newPOV)

    const response: APIResponse<POVArticle> = {
      success: true,
      data: newPOV,
      metadata: {
        timestamp: new Date().toISOString(),
      },
    }

    return NextResponse.json(response)
  } catch (error: any) {
    console.error('[API] ❌ 新增 POV 文章失敗:', error)

    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'CREATE_ERROR',
          message: error.message || '新增 POV 文章失敗',
        },
      } as APIResponse,
      { status: 500 }
    )
  }
}

/**
 * PUT /api/knowledge/pov
 * 更新 POV 文章
 */
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id } = body

    const index = povStore.findIndex((p) => p.id === id)

    if (index === -1) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: '找不到該 POV 文章',
          },
        } as APIResponse,
        { status: 404 }
      )
    }

    povStore[index] = {
      ...povStore[index],
      ...body,
      lastModified: new Date().toISOString().split('T')[0],
    }

    const response: APIResponse<POVArticle> = {
      success: true,
      data: povStore[index],
      metadata: {
        timestamp: new Date().toISOString(),
      },
    }

    return NextResponse.json(response)
  } catch (error: any) {
    console.error('[API] ❌ 更新 POV 文章失敗:', error)

    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'UPDATE_ERROR',
          message: error.message || '更新 POV 文章失敗',
        },
      } as APIResponse,
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/knowledge/pov
 * 刪除 POV 文章
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

    const index = povStore.findIndex((p) => p.id === id)

    if (index === -1) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: '找不到該 POV 文章',
          },
        } as APIResponse,
        { status: 404 }
      )
    }

    povStore.splice(index, 1)

    const response: APIResponse = {
      success: true,
      metadata: {
        timestamp: new Date().toISOString(),
      },
    }

    return NextResponse.json(response)
  } catch (error: any) {
    console.error('[API] ❌ 刪除 POV 文章失敗:', error)

    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'DELETE_ERROR',
          message: error.message || '刪除 POV 文章失敗',
        },
      } as APIResponse,
      { status: 500 }
    )
  }
}
