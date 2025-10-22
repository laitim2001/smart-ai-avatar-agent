# 多 AI Agent 系統架構設計文件

**日期**: 2025-10-21
**版本**: v1.0.0
**作者**: Claude Code
**狀態**: 📋 設計階段

---

## 📊 現狀分析

### 1. 多語言支援現狀

#### ✅ **已實作的多語言功能**

當前專案已完整實作多語言支援：

```typescript
// 支援的語言
locales: ['zh-TW', 'en', 'ja']
defaultLocale: 'zh-TW'

// 語言檔案結構
locales/
├── zh-TW/common.json  // 繁體中文 (197 lines)
├── en/common.json     // 英文 (197 lines)
└── ja/common.json     // 日文 (197 lines)
```

**實作細節**:

1. **next-intl 整合** (`middleware.ts:12-21`)
   - 自動語言偵測
   - URL 前綴處理 (如 `/zh-TW/dashboard`)
   - 語言切換功能

2. **翻譯覆蓋範圍**:
   - ✅ 導航選單 (nav)
   - ✅ 認證頁面 (auth)
   - ✅ 按鈕與表單 (button, form)
   - ✅ 錯誤訊息 (error, success)
   - ✅ 儀表板 (dashboard)
   - ✅ 設定頁面 (settings)
   - ✅ 對話介面 (chat, conversation)
   - ✅ Avatar 相關 (avatar)
   - ✅ 語言選擇器 (language)
   - ✅ Prompt 模板 (prompt)

3. **使用者語言偏好** (`prisma/schema.prisma:105`)
   ```prisma
   model UserSettings {
     language String @default("zh-TW")
   }
   ```

#### 🔍 **多語言支援評估**

| 項目 | 狀態 | 完成度 |
|------|------|--------|
| 基礎架構 | ✅ 完成 | 100% |
| UI 翻譯 | ✅ 完成 | 100% |
| 語言切換器 | ✅ 完成 | 100% |
| 使用者偏好儲存 | ✅ 完成 | 100% |
| **問題點** | ⚠️ | - |
| AI 回應語言 | ⚠️ 部分支援 | 60% |
| 知識庫多語言 | ❌ 未實作 | 0% |

**結論**: ✅ **專案已具備完整的多語言基礎架構，但 AI 回應和知識庫內容尚未多語言化。**

---

### 2. 當前系統架構問題分析

#### ❌ **問題 1: 單一 Agent 設計**

**現狀**:
```typescript
// app/[locale]/(dashboard)/conversations/page.tsx:165-169
<p className="text-sm text-gray-500 max-w-sm">
  從左側選擇現有對話，或點擊「新對話」開始與 AI 助手交流
</p>
```

**問題點**:
1. 整個專案只有「一個」全域 AI 助手
2. 所有對話共用相同的 Persona (CDO 角色定義)
3. 無法為不同用途建立專屬 Agent
4. 對話記錄與 Agent 身份無關聯

**資料庫證據** (`prisma/schema.prisma:169-184`):
```prisma
model Conversation {
  id     String @id @default(cuid())
  userId String

  title     String  @default("新對話")
  avatarId  String? // ❌ 只記錄 Avatar 外觀，沒有 Agent 身份

  messages Message[]
}
```

**影響**:
- ❌ 使用者無法建立「專業顧問」、「語言老師」、「技術助理」等不同角色的 Agent
- ❌ 所有對話都使用相同的 System Prompt
- ❌ 無法根據 Agent 角色調整回應風格

---

#### ❌ **問題 2: 知識庫與 Agent 無關聯**

**現狀** (`app/api/chat/route.ts:62-92`):
```typescript
// 🧠 載入知識庫
const knowledgeLoader = await getKnowledgeLoader()

// 🎭 載入 Persona (全域共用)
const persona = knowledgeLoader.getPersona()

// 🔍 搜尋相關知識
const relevantKnowledge = knowledgeLoader.searchKnowledge(lastUserMessage, 3)
```

**問題點**:
1. **單一知識庫**: 所有 Agent 共用同一組知識檔案
   ```
   docs/agent-brain/
   ├── persona.md              # 全域 Persona
   ├── cdo_faq.md              # CDO 專用 FAQ
   ├── kpi_dictionary.md       # 全域 KPI
   └── ...
   ```

2. **無法區分 Agent 專屬知識**:
   - ❌ 無法為「語言老師 Agent」建立專屬的語言學習教材
   - ❌ 無法為「技術顧問 Agent」建立專屬的技術文件庫
   - ❌ 所有 Agent 都會看到 CDO 相關的知識

3. **知識庫目錄結構不支援多 Agent**:
   ```
   ❌ 當前結構:
   docs/agent-brain/
   ├── persona.md          # 單一 Persona
   ├── cdo_faq.md
   └── kpi_dictionary.md

   ✅ 應該改為:
   docs/agent-brain/
   ├── agents/
   │   ├── cdo-advisor/
   │   │   ├── persona.md
   │   │   ├── faq.md
   │   │   └── kpi_dictionary.md
   │   ├── language-tutor/
   │   │   ├── persona.md
   │   │   ├── vocabulary.md
   │   │   └── grammar_rules.md
   │   └── tech-consultant/
   │       ├── persona.md
   │       └── tech_docs.md
   ```

**影響**:
- ❌ 無法實現「一人多 Agent」場景
- ❌ 知識污染：技術 Agent 可能讀取到 CDO 的商務知識
- ❌ 擴展性差：新增 Agent 需要大量修改現有程式碼

---

#### ❌ **問題 3: 對話記錄命名不當**

**現狀** (`locales/zh-TW/common.json:5, 112`):
```json
{
  "nav": {
    "conversations": "對話記錄"  // ❌ 不準確的命名
  },
  "conversation": {
    "title": "對話記錄"
  }
}
```

**問題點**:
1. **語意不清**: 「對話記錄」暗示這是「歷史記錄查詢」功能
2. **實際功能**: 這是「AI 對話互動」的主要介面
3. **更好的命名**:
   - ✅ 「AI 對話」或「與 AI 對話」
   - ✅ 「Agent 工作台」或「助理對話」
   - ✅ 「智慧助理」

**影響**:
- ⚠️ 使用者可能誤解功能定位
- ⚠️ 不利於多 Agent 概念推廣

---

## 🎯 設計目標

### 核心目標

1. **多 Agent 支援**:
   - 使用者可以建立多個不同角色的 AI Agent
   - 每個 Agent 有獨立的 Persona、知識庫、外觀

2. **知識庫隔離**:
   - 每個 Agent 有專屬的知識庫
   - 支援共用知識庫（可選）
   - 知識庫版本控制與更新

3. **靈活對話管理**:
   - 與不同 Agent 進行多個對話
   - 對話歷史與 Agent 關聯
   - 快速切換 Agent

4. **擴展性**:
   - 輕鬆新增預設 Agent 模板
   - 支援使用者自定義 Agent
   - 多語言知識庫支援

---

## 🏗️ 新架構設計

### 1. 資料庫 Schema 設計

#### **新增 AIAgent 模型**

```prisma
// Sprint 11: AI Agent 系統
model AIAgent {
  id          String   @id @default(cuid())
  userId      String?  // null 表示系統預設 Agent
  user        User?    @relation(fields: [userId], references: [id], onDelete: Cascade)

  // 基本資訊
  name        String   // Agent 名稱 (e.g., "CDO 商務顧問")
  description String?  // Agent 描述
  category    String   // learning/work/creative/professional/daily

  // Persona 配置
  personaId   String   // 連結到 Persona 定義
  persona     Persona  @relation(fields: [personaId], references: [id])

  // Avatar 外觀
  avatarId    String?  // 3D Avatar 模型 ID
  avatar      Avatar?  @relation(fields: [avatarId], references: [id])

  // 語言設定
  primaryLanguage String @default("zh-TW") // Agent 主要語言
  supportedLanguages String[] // 支援的語言列表

  // 知識庫關聯
  knowledgeBases KnowledgeBase[] // 多對多關聯

  // 對話關聯
  conversations  Conversation[]

  // 狀態與權限
  isActive    Boolean  @default(true)
  isPublic    Boolean  @default(false) // 是否為公開 Agent (其他用戶可複製)
  isSystem    Boolean  @default(false) // 系統預設 Agent

  // 使用統計
  usageCount  Int      @default(0)
  popularity  Int      @default(0)

  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@index([userId, createdAt(sort: Desc)])
  @@index([category, isPublic])
  @@index([isSystem, isActive])
  @@map("ai_agents")
}
```

#### **新增 Persona 模型**

```prisma
// Persona 定義 (Agent 的人格特質)
model Persona {
  id          String   @id @default(cuid())

  // 基本定義
  name        String   // Persona 名稱
  role        String   // 角色定位 (e.g., "資深商務顧問")
  description String   @db.Text // 詳細描述

  // System Prompt 配置
  systemPrompt String  @db.Text // 完整 System Prompt

  // 語言特性
  language    String   @default("zh-TW")
  tone        String   // professional/friendly/casual/academic
  style       String[] // ["簡潔", "專業", "友善"]

  // 能力定義
  capabilities String[] // ["商務分析", "數據解讀", "策略規劃"]
  restrictions String[] // ["不討論政治", "不提供法律建議"]

  // 版本控制
  version     String   @default("1.0.0")
  isActive    Boolean  @default(true)

  // 關聯
  agents      AIAgent[]

  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@index([language, isActive])
  @@map("personas")
}
```

#### **新增 KnowledgeBase 模型**

```prisma
// 知識庫定義
model KnowledgeBase {
  id          String   @id @default(cuid())

  // 基本資訊
  name        String   // 知識庫名稱 (e.g., "CDO FAQ 問答集")
  description String?
  type        String   // faq/kpi/persona/pov/decision/meeting/document
  category    String   // business/technical/learning/general

  // 語言
  language    String   @default("zh-TW")

  // 內容
  content     String   @db.Text // Markdown 內容
  metadata    Json?    // 額外的結構化資料

  // 檔案路徑 (如果是檔案系統載入)
  filePath    String?  // e.g., "docs/agent-brain/cdo-advisor/faq.md"

  // 關聯
  agents      AIAgent[] @relation("AgentKnowledgeBases")

  // 版本與狀態
  version     String   @default("1.0.0")
  isActive    Boolean  @default(true)
  isPublic    Boolean  @default(false) // 可被其他 Agent 引用

  // 使用統計
  usageCount  Int      @default(0)

  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@index([type, language])
  @@index([category, isActive])
  @@map("knowledge_bases")
}

// 多對多關聯表 (Agent <-> KnowledgeBase)
model AgentKnowledgeBase {
  id              String        @id @default(cuid())
  agentId         String
  knowledgeBaseId String

  agent           AIAgent       @relation(fields: [agentId], references: [id], onDelete: Cascade)
  knowledgeBase   KnowledgeBase @relation("AgentKnowledgeBases", fields: [knowledgeBaseId], references: [id], onDelete: Cascade)

  // 關聯配置
  priority        Int           @default(0) // 搜尋優先權
  isRequired      Boolean       @default(false) // 是否必須載入

  createdAt       DateTime      @default(now())

  @@unique([agentId, knowledgeBaseId])
  @@index([agentId])
  @@index([knowledgeBaseId])
  @@map("agent_knowledge_bases")
}
```

#### **更新 Conversation 模型**

```prisma
model Conversation {
  id     String @id @default(cuid())
  userId String
  user   User   @relation(fields: [userId], references: [id], onDelete: Cascade)

  title     String  @default("新對話")

  // ✅ 新增: Agent 關聯
  agentId   String?  // 此對話使用的 Agent
  agent     AIAgent? @relation(fields: [agentId], references: [id], onDelete: SetNull)

  // ⚠️ 保留 avatarId 為了向後兼容，但應該優先使用 agent.avatarId
  avatarId  String?  // 3D Avatar 外觀 (Deprecated: 改用 agent.avatarId)

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  messages Message[]

  @@index([userId, createdAt(sort: Desc)])
  @@index([agentId]) // ✅ 新增索引
  @@map("conversations")
}
```

#### **更新 User 模型**

```prisma
model User {
  // ... 現有欄位 ...

  // ✅ 新增關聯
  aiAgents         AIAgent[]  // 使用者建立的 Agent

  // ... 其他現有關聯 ...
}
```

---

### 2. 知識庫目錄結構重組

#### **新的檔案系統結構**

```
docs/agent-brain/
├── README.md                    # 知識庫總覽
│
├── shared/                      # 共用知識庫 (所有 Agent 可用)
│   ├── company_info.md         # 公司基本資訊
│   ├── common_policies.md      # 通用政策
│   └── glossary.md             # 術語表
│
├── agents/                      # Agent 專屬知識庫
│   │
│   ├── cdo-advisor/            # CDO 商務顧問
│   │   ├── persona.md          # Persona 定義
│   │   ├── faq.md              # FAQ
│   │   ├── kpi_dictionary.md   # KPI 定義
│   │   ├── decisions/          # 決策日誌
│   │   │   └── project_phoenix.md
│   │   ├── meetings/           # 會議摘要
│   │   │   └── q4_strategy_review.md
│   │   └── pov/                # POV 文章
│   │       └── generative_ai_strategy.md
│   │
│   ├── language-tutor/         # 語言學習老師
│   │   ├── persona.md
│   │   ├── zh-TW/              # 繁體中文教學
│   │   │   ├── vocabulary.md
│   │   │   ├── grammar.md
│   │   │   └── practice_dialogues.md
│   │   ├── en/                 # 英文教學
│   │   │   ├── vocabulary.md
│   │   │   └── grammar.md
│   │   └── ja/                 # 日文教學
│   │       └── hiragana_guide.md
│   │
│   ├── tech-consultant/        # 技術顧問
│   │   ├── persona.md
│   │   ├── architecture/
│   │   │   ├── design_patterns.md
│   │   │   └── best_practices.md
│   │   ├── troubleshooting/
│   │   │   └── common_issues.md
│   │   └── code_review/
│   │       └── review_checklist.md
│   │
│   ├── creative-writer/        # 創意寫作助手
│   │   ├── persona.md
│   │   ├── story_templates.md
│   │   ├── character_archetypes.md
│   │   └── plot_structures.md
│   │
│   └── data-analyst/           # 數據分析師
│       ├── persona.md
│       ├── analysis_frameworks.md
│       ├── visualization_guide.md
│       └── statistical_methods.md
│
└── templates/                   # Agent 模板 (快速建立新 Agent)
    ├── basic_agent/
    │   ├── persona_template.md
    │   └── knowledge_template.md
    └── specialized_agent/
        └── ...
```

#### **知識庫載入邏輯**

```typescript
// lib/ai/agent-knowledge-loader.ts (新檔案)
export class AgentKnowledgeLoader {
  constructor(private agentId: string) {}

  async loadKnowledge(): Promise<AgentKnowledge> {
    // 1. 從資料庫載入 Agent 配置
    const agent = await prisma.aiAgent.findUnique({
      where: { id: this.agentId },
      include: {
        persona: true,
        knowledgeBases: {
          where: { isActive: true },
          orderBy: { priority: 'desc' }
        }
      }
    })

    // 2. 載入 Persona System Prompt
    const persona = agent.persona.systemPrompt

    // 3. 載入專屬知識庫
    const knowledgeDocs = agent.knowledgeBases.map(kb => ({
      type: kb.type,
      content: kb.content,
      metadata: kb.metadata
    }))

    // 4. 載入共用知識庫 (如果需要)
    const sharedKnowledge = await this.loadSharedKnowledge()

    return {
      persona,
      knowledgeDocs: [...knowledgeDocs, ...sharedKnowledge],
      language: agent.primaryLanguage,
      capabilities: agent.persona.capabilities,
      restrictions: agent.persona.restrictions
    }
  }

  // 搜尋相關知識
  searchKnowledge(query: string, topK: number = 3): KnowledgeDoc[] {
    // 使用向量搜尋或關鍵字搜尋
    // ...
  }

  private async loadSharedKnowledge(): Promise<KnowledgeDoc[]> {
    // 載入 docs/agent-brain/shared/ 下的共用知識
    // ...
  }
}
```

---

### 3. API 路由更新

#### **Chat API 更新** (`app/api/chat/route.ts`)

```typescript
export async function POST(request: NextRequest) {
  const body: ChatRequest = await request.json()

  // ✅ 1. 從請求中取得 agentId
  const agentId = body.agentId
  if (!agentId) {
    return NextResponse.json({ error: 'Missing agentId' }, { status: 400 })
  }

  // ✅ 2. 載入 Agent 專屬知識庫
  const agentLoader = new AgentKnowledgeLoader(agentId)
  const agentKnowledge = await agentLoader.loadKnowledge()

  // ✅ 3. 組合 System Prompt (Agent 專屬)
  const systemPrompt = buildAgentSystemPrompt(
    agentKnowledge.persona,
    agentKnowledge.knowledgeDocs,
    agentKnowledge.language
  )

  // ✅ 4. 檢查 Agent 語言與使用者語言是否一致
  const userLanguage = body.language || 'zh-TW'
  if (!agentKnowledge.supportedLanguages.includes(userLanguage)) {
    console.warn(`Agent ${agentId} does not support language ${userLanguage}`)
  }

  // 5. 呼叫 Azure OpenAI (維持原邏輯)
  const messagesWithSystem = [
    { role: 'system', content: systemPrompt },
    ...body.messages
  ]

  const response = await client.chat.completions.create({
    model: DEPLOYMENT_NAME,
    messages: messagesWithSystem,
    temperature: body.temperature ?? 0.7,
    stream: true
  })

  // ... SSE 串流回應 ...
}
```

#### **新增 Agent CRUD API**

```typescript
// app/api/agents/route.ts (新檔案)

// GET /api/agents - 取得使用者的所有 Agent
export async function GET(request: NextRequest) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const agents = await prisma.aiAgent.findMany({
    where: {
      OR: [
        { userId: session.user.id },
        { isSystem: true, isActive: true }
      ]
    },
    include: {
      persona: true,
      avatar: true,
      _count: {
        select: { conversations: true }
      }
    },
    orderBy: { createdAt: 'desc' }
  })

  return NextResponse.json({ agents })
}

// POST /api/agents - 建立新 Agent
export async function POST(request: NextRequest) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const { name, description, category, personaId, avatarId, knowledgeBaseIds } = body

  const agent = await prisma.aiAgent.create({
    data: {
      userId: session.user.id,
      name,
      description,
      category,
      personaId,
      avatarId,
      knowledgeBases: {
        connect: knowledgeBaseIds.map((id: string) => ({ id }))
      }
    },
    include: {
      persona: true,
      avatar: true,
      knowledgeBases: true
    }
  })

  return NextResponse.json({ agent })
}
```

```typescript
// app/api/agents/[agentId]/route.ts (新檔案)

// GET /api/agents/:agentId - 取得單一 Agent 詳情
// PUT /api/agents/:agentId - 更新 Agent
// DELETE /api/agents/:agentId - 刪除 Agent
```

---

### 4. 前端 UI 設計

#### **Agent 管理頁面** (`app/[locale]/(dashboard)/agents/page.tsx`)

```tsx
// 新頁面: Agent 管理中心

export default function AgentsPage() {
  const [agents, setAgents] = useState<AIAgent[]>([])
  const [showCreateModal, setShowCreateModal] = useState(false)

  return (
    <div className="p-6">
      <header className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">AI 助理管理</h1>
          <p className="text-gray-600">建立和管理您的 AI 助理</p>
        </div>
        <button onClick={() => setShowCreateModal(true)}>
          建立新助理
        </button>
      </header>

      {/* Agent 列表 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {agents.map(agent => (
          <AgentCard key={agent.id} agent={agent} />
        ))}
      </div>

      {/* 建立 Agent Modal */}
      {showCreateModal && (
        <CreateAgentModal onClose={() => setShowCreateModal(false)} />
      )}
    </div>
  )
}
```

#### **Agent 卡片元件**

```tsx
function AgentCard({ agent }: { agent: AIAgent }) {
  return (
    <div className="border rounded-lg p-4 hover:shadow-lg transition">
      {/* Avatar 預覽 */}
      <div className="w-full h-48 bg-gray-100 rounded-lg mb-4">
        <Avatar3DPreview avatarId={agent.avatarId} />
      </div>

      {/* Agent 資訊 */}
      <h3 className="font-bold text-lg">{agent.name}</h3>
      <p className="text-sm text-gray-600 mb-2">{agent.description}</p>

      {/* 標籤 */}
      <div className="flex gap-2 mb-4">
        <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">
          {getCategoryLabel(agent.category)}
        </span>
        <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
          {agent.primaryLanguage}
        </span>
      </div>

      {/* 統計 */}
      <div className="flex justify-between text-sm text-gray-500 mb-4">
        <span>{agent.conversationCount} 次對話</span>
        <span>{agent.usageCount} 次使用</span>
      </div>

      {/* 操作按鈕 */}
      <div className="flex gap-2">
        <button className="flex-1 btn-primary">開始對話</button>
        <button className="btn-secondary">編輯</button>
        <button className="btn-danger">刪除</button>
      </div>
    </div>
  )
}
```

#### **對話頁面更新** (`app/[locale]/(dashboard)/conversations/page.tsx`)

```tsx
// 更新: 支援 Agent 選擇

export default function ConversationsPage() {
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null)
  const [conversations, setConversations] = useState<Conversation[]>([])

  return (
    <div className="flex h-full">
      {/* 左側: Agent + 對話列表 */}
      <div className="w-80 border-r">
        {/* Agent 選擇器 */}
        <div className="p-4 border-b">
          <label className="block text-sm font-medium mb-2">選擇助理</label>
          <AgentSelector
            selectedId={selectedAgentId}
            onChange={setSelectedAgentId}
          />
        </div>

        {/* 對話列表 (依選定的 Agent 過濾) */}
        <ConversationList
          agentId={selectedAgentId}
          onSelect={handleSelectConversation}
        />
      </div>

      {/* 右側: Avatar + Chat */}
      <div className="flex-1 flex">
        <div className="w-[40%]">
          <AvatarCanvas agentId={selectedAgentId} />
        </div>
        <div className="w-[60%]">
          <ChatInterface agentId={selectedAgentId} />
        </div>
      </div>
    </div>
  )
}
```

---

### 5. 系統預設 Agent 設定

#### **預設 Agent 列表**

```typescript
// lib/agents/default-agents.ts (新檔案)

export const DEFAULT_AGENTS: AgentTemplate[] = [
  {
    id: 'system-cdo-advisor',
    name: 'CDO 商務顧問',
    description: '專業的商務策略顧問，擅長數據驅動決策和組織轉型',
    category: 'professional',
    personaTemplate: 'cdo-advisor',
    avatarId: 'avatar-001', // Alex
    primaryLanguage: 'zh-TW',
    supportedLanguages: ['zh-TW', 'en'],
    knowledgeBases: [
      'cdo-faq',
      'kpi-dictionary',
      'decision-logs',
      'meeting-summaries'
    ],
    isSystem: true,
    featured: true
  },
  {
    id: 'system-language-tutor',
    name: '語言學習老師',
    description: '耐心專業的語言教師，提供個人化學習指導',
    category: 'learning',
    personaTemplate: 'language-tutor',
    avatarId: 'avatar-002', // Jordan
    primaryLanguage: 'zh-TW',
    supportedLanguages: ['zh-TW', 'en', 'ja'],
    knowledgeBases: [
      'language-vocabulary',
      'grammar-rules',
      'practice-dialogues'
    ],
    isSystem: true,
    featured: true
  },
  {
    id: 'system-tech-consultant',
    name: '技術顧問',
    description: '經驗豐富的軟體工程師，提供架構設計和程式碼審查',
    category: 'professional',
    personaTemplate: 'tech-consultant',
    avatarId: 'avatar-003', // Casey
    primaryLanguage: 'zh-TW',
    supportedLanguages: ['zh-TW', 'en'],
    knowledgeBases: [
      'design-patterns',
      'best-practices',
      'troubleshooting-guide'
    ],
    isSystem: true,
    featured: true
  },
  {
    id: 'system-creative-writer',
    name: '創意寫作助手',
    description: '富有想像力的故事創作者，協助構思和撰寫各種故事',
    category: 'creative',
    personaTemplate: 'creative-writer',
    avatarId: 'avatar-001',
    primaryLanguage: 'zh-TW',
    supportedLanguages: ['zh-TW', 'en'],
    knowledgeBases: [
      'story-templates',
      'character-archetypes',
      'plot-structures'
    ],
    isSystem: true,
    featured: true
  },
  {
    id: 'system-data-analyst',
    name: '數據分析師',
    description: '專業數據分析顧問，提供商業洞見和視覺化建議',
    category: 'professional',
    personaTemplate: 'data-analyst',
    avatarId: 'avatar-002',
    primaryLanguage: 'zh-TW',
    supportedLanguages: ['zh-TW', 'en'],
    knowledgeBases: [
      'analysis-frameworks',
      'visualization-guide',
      'statistical-methods'
    ],
    isSystem: true,
    featured: false
  }
]
```

#### **Agent 初始化腳本**

```typescript
// scripts/seed-default-agents.ts (新檔案)

import { prisma } from '@/lib/db'
import { DEFAULT_AGENTS } from '@/lib/agents/default-agents'

async function seedDefaultAgents() {
  console.log('🌱 Seeding default AI Agents...')

  for (const template of DEFAULT_AGENTS) {
    // 1. 建立或取得 Persona
    const persona = await prisma.persona.upsert({
      where: { id: `persona-${template.personaTemplate}` },
      update: {},
      create: {
        id: `persona-${template.personaTemplate}`,
        name: template.name,
        role: template.description,
        systemPrompt: loadPersonaTemplate(template.personaTemplate),
        language: template.primaryLanguage,
        tone: 'professional',
        capabilities: [],
        restrictions: []
      }
    })

    // 2. 建立 Agent
    const agent = await prisma.aiAgent.upsert({
      where: { id: template.id },
      update: {},
      create: {
        id: template.id,
        name: template.name,
        description: template.description,
        category: template.category,
        personaId: persona.id,
        avatarId: template.avatarId,
        primaryLanguage: template.primaryLanguage,
        supportedLanguages: template.supportedLanguages,
        isSystem: true,
        isActive: true,
        isPublic: true
      }
    })

    // 3. 關聯知識庫
    for (const kbName of template.knowledgeBases) {
      const kb = await findOrCreateKnowledgeBase(kbName)
      await prisma.agentKnowledgeBase.upsert({
        where: {
          agentId_knowledgeBaseId: {
            agentId: agent.id,
            knowledgeBaseId: kb.id
          }
        },
        update: {},
        create: {
          agentId: agent.id,
          knowledgeBaseId: kb.id,
          priority: 1,
          isRequired: true
        }
      })
    }

    console.log(`✅ Created agent: ${agent.name}`)
  }

  console.log('🎉 Default agents seeded successfully!')
}

seedDefaultAgents()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
```

---

## 📋 實作計劃

### Phase 1: 資料庫與基礎架構 (2-3 天)

**任務清單**:
1. ✅ 建立新的 Prisma Schema
   - AIAgent 模型
   - Persona 模型
   - KnowledgeBase 模型
   - AgentKnowledgeBase 關聯表
2. ✅ 執行資料庫 Migration
3. ✅ 建立 Agent 種子資料腳本
4. ✅ 重組知識庫目錄結構

**交付物**:
- `prisma/schema.prisma` (更新)
- `prisma/migrations/` (新 migration)
- `scripts/seed-default-agents.ts`
- `docs/agent-brain/` (重組後的目錄)

---

### Phase 2: Agent 知識庫載入器 (2 天)

**任務清單**:
1. ✅ 實作 `AgentKnowledgeLoader` 類別
2. ✅ 實作知識庫搜尋功能
3. ✅ 整合到 Chat API
4. ✅ 測試不同 Agent 的知識隔離

**交付物**:
- `lib/ai/agent-knowledge-loader.ts`
- `app/api/chat/route.ts` (更新)
- 測試腳本

---

### Phase 3: Agent CRUD API (2 天)

**任務清單**:
1. ✅ 實作 `/api/agents` (GET, POST)
2. ✅ 實作 `/api/agents/:agentId` (GET, PUT, DELETE)
3. ✅ 實作 `/api/agents/:agentId/knowledge` (管理知識庫)
4. ✅ API 測試與文件

**交付物**:
- `app/api/agents/route.ts`
- `app/api/agents/[agentId]/route.ts`
- API 文件

---

### Phase 4: 前端 UI (3-4 天)

**任務清單**:
1. ✅ 實作 Agent 管理頁面
   - Agent 列表
   - Agent 卡片元件
   - 建立/編輯 Agent Modal
2. ✅ 更新對話頁面
   - Agent 選擇器
   - 依 Agent 過濾對話
3. ✅ 更新導航選單
   - 新增「AI 助理」入口
   - 重新命名「對話記錄」→「AI 對話」
4. ✅ 多語言翻譯更新

**交付物**:
- `app/[locale]/(dashboard)/agents/page.tsx`
- `components/agents/` (Agent 相關元件)
- `app/[locale]/(dashboard)/conversations/page.tsx` (更新)
- `locales/**/*.json` (翻譯更新)

---

### Phase 5: 測試與優化 (2 天)

**任務清單**:
1. ✅ 端到端測試
2. ✅ 效能優化 (知識庫載入快取)
3. ✅ 使用者體驗優化
4. ✅ 文件撰寫

**交付物**:
- 測試報告
- 效能優化報告
- 使用者手冊

---

## 🎯 預期成果

### 使用者體驗

1. **建立多個 Agent**:
   - 使用者可建立「語言老師」、「技術顧問」、「創意寫作」等不同 Agent
   - 每個 Agent 有獨立外觀、人格、知識庫

2. **智慧對話**:
   - 選擇不同 Agent 開始對話
   - Agent 根據專屬知識庫回答問題
   - 對話歷史與 Agent 關聯

3. **知識隔離**:
   - 技術 Agent 不會回答商務問題
   - 語言 Agent 專注於語言學習
   - 避免知識污染

4. **多語言支援**:
   - Agent 可設定主要語言
   - 知識庫支援多語言版本
   - AI 回應語言與 Agent 設定一致

---

## 📊 技術亮點

1. **可擴展架構**: 輕鬆新增新 Agent 類型
2. **知識庫模組化**: 知識庫可共用或專屬
3. **向後兼容**: 保留現有對話資料
4. **效能優化**: 知識庫快取、懶載入
5. **多語言完備**: UI + AI 回應多語言支援

---

## 🚀 未來擴展

1. **Agent 市集**: 使用者可分享/購買 Agent
2. **Agent 協作**: 多個 Agent 協同工作
3. **動態知識更新**: 即時更新知識庫
4. **向量搜尋**: 使用 Embedding 提升搜尋準確度
5. **語音 Agent**: 整合 TTS/STT 實現語音對話

---

**文件版本**: v1.0.0
**最後更新**: 2025-10-21
**狀態**: ✅ 設計完成，待評審
