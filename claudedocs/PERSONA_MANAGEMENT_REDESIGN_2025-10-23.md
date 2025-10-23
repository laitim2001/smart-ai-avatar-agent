# Persona 管理系統重新設計

**日期**: 2025-10-23
**狀態**: 🎯 設計完成，待實作
**優先級**: 🔴 高（影響 Agent 建立流程）

---

## 📋 目錄

1. [問題分析](#問題分析)
2. [當前架構](#當前架構)
3. [設計方案](#設計方案)
4. [UI/UX 設計](#uiux-設計)
5. [API 設計](#api-設計)
6. [資料流程](#資料流程)
7. [刪除邏輯](#刪除邏輯)
8. [其他考量](#其他考量)
9. [實作清單](#實作清單)

---

## 問題分析

### 當前問題

#### 1. Persona 頁面設計錯誤
**問題**: `app/[locale]/(dashboard)/knowledge/persona/page.tsx` 是一個 Markdown 編輯器
- 直接編輯檔案系統的 `persona.md` 檔案
- **不是**管理資料庫中的 Persona 記錄列表
- 與資料庫設計不符

#### 2. 資料庫與 UI 不一致
**資料庫設計**:
```prisma
model Persona {
  id              String   @id @default(cuid())
  name            String
  role            String
  description     String   @db.Text
  systemPrompt    String   @db.Text
  language        String   @default("zh-TW")
  tone            String
  style           String[]
  capabilities    String[]
  restrictions    String[]
  version         String   @default("1.0.0")
  isActive        Boolean  @default(true)
  agents          AIAgent[]
}

model AIAgent {
  personaId       String
  persona         Persona  @relation(fields: [personaId], references: [id])
}
```

**關係**:
- 一個 Persona → 多個 Agent (1:N)
- 每個 Agent 必須綁定一個 Persona

#### 3. Agent Editor 未完成
**問題**: `AgentEditor.tsx` 中 Persona 選擇是硬編碼
```typescript
<SelectContent>
  {/* TODO: 從 API 載入 Persona 列表 */}
  <SelectItem value="system-cdo-advisor">CDO 商務顧問</SelectItem>
  <SelectItem value="system-tech-advisor">技術顧問</SelectItem>
</SelectContent>
```

#### 4. 缺少刪除驗證
**問題**: 沒有檢查 Persona 是否被 Agent 使用
- 可能導致資料完整性問題
- 外鍵約束會阻止刪除，但沒有友好的 UI 提示

---

## 當前架構

### 檔案結構
```
app/
├── [locale]/(dashboard)/
│   └── knowledge/
│       └── persona/
│           └── page.tsx                 # ❌ 當前是 Markdown 編輯器
├── api/
│   ├── knowledge/persona/route.ts       # ❌ 檔案系統操作（非資料庫）
│   └── personas/route.ts                # ✅ 資料庫 Persona 列表 API

components/
└── agents/
    └── AgentEditor.tsx                  # ⚠️ Persona 選擇未完成

prisma/
└── schema.prisma                        # ✅ Persona 資料模型定義
```

### API 現狀
| API Route | 方法 | 狀態 | 說明 |
|-----------|------|------|------|
| `/api/personas` | GET | ✅ 已存在 | 列出所有 Persona |
| `/api/personas` | POST | ❌ 不存在 | 建立 Persona |
| `/api/personas/[id]` | GET | ❌ 不存在 | 獲取單一 Persona |
| `/api/personas/[id]` | PUT | ❌ 不存在 | 更新 Persona |
| `/api/personas/[id]` | DELETE | ❌ 不存在 | 刪除 Persona |
| `/api/personas/[id]/agents` | GET | ❌ 不存在 | 獲取關聯 Agent |

---

## 設計方案

### 整體架構

```
┌─────────────────────────────────────────────────────────────┐
│                    Persona 管理頁面                           │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  📊 統計卡片                                          │   │
│  │  • 總 Persona 數   • 關聯 Agent 數   • 語言分布      │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                               │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  🔍 搜尋 & 篩選                                       │   │
│  │  [搜尋框] [語言] [狀態] [+ 建立 Persona]            │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                               │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐                  │
│  │ Persona  │  │ Persona  │  │ Persona  │                  │
│  │ Card 1   │  │ Card 2   │  │ Card 3   │                  │
│  │          │  │          │  │          │                  │
│  │ [編輯]   │  │ [編輯]   │  │ [編輯]   │                  │
│  │ [刪除]   │  │ [刪除]   │  │ [刪除]   │                  │
│  └──────────┘  └──────────┘  └──────────┘                  │
└─────────────────────────────────────────────────────────────┘
```

### 核心功能

#### 1. Persona 列表頁
**位置**: `app/[locale]/(dashboard)/knowledge/persona/page.tsx`

**功能**:
- ✅ 卡片式顯示所有 Persona
- ✅ 統計資訊（總數、關聯的 Agent 數、語言分布）
- ✅ 搜尋功能（名稱、角色、描述）
- ✅ 篩選功能（語言、狀態、版本）
- ✅ 建立新 Persona 按鈕
- ✅ 每張卡片顯示：
  - Persona 名稱和角色
  - 描述摘要
  - 語言、語氣、版本
  - 關聯的 Agent 數量
  - 編輯、刪除按鈕

#### 2. Persona 建立/編輯表單
**位置**: `components/knowledge/PersonaForm.tsx` (新建)

**表單結構**:
```typescript
interface PersonaFormData {
  name: string              // Persona 名稱
  role: string              // 角色定位
  description: string       // 詳細描述
  systemPrompt: string      // 完整 System Prompt
  language: string          // 語言
  tone: string              // 語氣
  style: string[]           // 風格列表
  capabilities: string[]    // 能力列表
  restrictions: string[]    // 限制列表
  version: string           // 版本
}
```

**分頁設計**:
- **Tab 1: 基本資訊**
  - 名稱、角色、描述
  - 語言、語氣選擇
- **Tab 2: System Prompt**
  - Textarea (支援 Markdown)
  - 即時字數統計
  - 驗證 (最少 100 字)
- **Tab 3: 特徵配置**
  - 風格標籤 (多選)
  - 能力標籤 (可新增/刪除)
  - 限制標籤 (可新增/刪除)
- **Tab 4: 版本與狀態**
  - 版本號
  - 啟用/停用開關

#### 3. 刪除確認流程
**位置**: Dialog 元件

**流程**:
```
使用者點擊 [刪除] 按鈕
  ↓
檢查關聯的 Agent 數量
  ↓
┌─────────────────────────┐
│ 沒有關聯 Agent          │     ┌─────────────────────────┐
│ → 顯示確認對話框        │     │ 有關聯 Agent            │
│ → 直接刪除              │     │ → 顯示警告對話框        │
│                         │     │ → 列出關聯的 Agent 清單 │
│ [取消] [確認刪除]       │     │ → 不允許刪除            │
└─────────────────────────┘     │                         │
                                │ [了解] (關閉)           │
                                └─────────────────────────┘
```

---

## UI/UX 設計

### 1. Persona 列表頁面

#### 頁面標題區塊
```tsx
<div className="rounded-lg bg-gradient-to-r from-purple-600 to-blue-600 p-8 text-white shadow-lg">
  <div className="flex items-center justify-between">
    <div>
      <h1 className="text-4xl font-bold flex items-center gap-3">
        <Users className="w-10 h-10" />
        Persona 管理
      </h1>
      <p className="text-purple-100 mt-2 text-lg">
        定義 AI Agent 的角色、專業領域、溝通風格
      </p>
    </div>
    <Button size="lg" onClick={openCreateDialog}>
      <Plus className="w-5 h-5 mr-2" />
      建立 Persona
    </Button>
  </div>
</div>
```

#### 統計卡片
```tsx
<div className="grid grid-cols-1 md:grid-cols-4 gap-4">
  {/* 總 Persona 數 */}
  <StatsCard
    label="總 Persona 數"
    value={personas.length}
    icon={Users}
    color="blue"
  />

  {/* 關聯的 Agent 數 */}
  <StatsCard
    label="關聯 Agent 數"
    value={totalLinkedAgents}
    icon={Bot}
    color="green"
  />

  {/* 語言分布 */}
  <StatsCard
    label="支援語言"
    value={uniqueLanguages.length}
    icon={Globe}
    color="purple"
  />

  {/* 啟用中 */}
  <StatsCard
    label="啟用中"
    value={activePersonas.length}
    icon={CheckCircle}
    color="yellow"
  />
</div>
```

#### Persona 卡片設計
```tsx
<Card className="group hover:shadow-lg transition-all">
  {/* 卡片標題 */}
  <CardHeader>
    <div className="flex items-start justify-between">
      <div>
        <CardTitle className="text-xl">{persona.name}</CardTitle>
        <p className="text-sm text-muted-foreground">{persona.role}</p>
      </div>
      <Badge variant={persona.isActive ? "default" : "secondary"}>
        {persona.isActive ? "啟用" : "停用"}
      </Badge>
    </div>
  </CardHeader>

  {/* 卡片內容 */}
  <CardContent className="space-y-3">
    <p className="text-sm text-gray-600 line-clamp-2">
      {persona.description}
    </p>

    {/* 標籤區 */}
    <div className="flex flex-wrap gap-2">
      <Badge variant="outline">{persona.language}</Badge>
      <Badge variant="outline">{persona.tone}</Badge>
      <Badge variant="outline">v{persona.version}</Badge>
    </div>

    {/* 關聯資訊 */}
    <div className="flex items-center gap-4 text-sm text-gray-500">
      <span className="flex items-center gap-1">
        <Bot className="w-4 h-4" />
        {persona.agents?.length || 0} 個 Agent
      </span>
      <span className="flex items-center gap-1">
        <Sparkles className="w-4 h-4" />
        {persona.capabilities?.length || 0} 項能力
      </span>
    </div>
  </CardContent>

  {/* 操作按鈕 */}
  <CardFooter className="flex gap-2">
    <Button variant="outline" size="sm" onClick={() => handleEdit(persona)}>
      <Edit className="w-4 h-4 mr-2" />
      編輯
    </Button>
    <Button
      variant="destructive"
      size="sm"
      onClick={() => handleDelete(persona)}
      disabled={persona.agents?.length > 0}
    >
      <Trash className="w-4 h-4 mr-2" />
      刪除
    </Button>
  </CardFooter>
</Card>
```

### 2. Persona 表單設計

#### 表單結構 (使用 Tabs)
```tsx
<Dialog>
  <DialogContent className="max-w-4xl max-h-[90vh]">
    <DialogHeader>
      <DialogTitle>
        {isEditMode ? "編輯 Persona" : "建立 Persona"}
      </DialogTitle>
    </DialogHeader>

    <ScrollArea className="max-h-[calc(90vh-200px)]">
      <Tabs value={currentTab} onValueChange={setCurrentTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="basic">基本資訊</TabsTrigger>
          <TabsTrigger value="prompt">System Prompt</TabsTrigger>
          <TabsTrigger value="features">特徵配置</TabsTrigger>
          <TabsTrigger value="version">版本與狀態</TabsTrigger>
        </TabsList>

        <TabsContent value="basic">
          {/* 名稱、角色、描述、語言、語氣 */}
        </TabsContent>

        <TabsContent value="prompt">
          {/* System Prompt Textarea */}
          <Textarea
            rows={15}
            value={formData.systemPrompt}
            onChange={handleSystemPromptChange}
          />
          <p className="text-sm text-gray-500 mt-2">
            字數: {wordCount} / 最少 100 字
          </p>
        </TabsContent>

        <TabsContent value="features">
          {/* 風格、能力、限制 - 使用標籤輸入 */}
        </TabsContent>

        <TabsContent value="version">
          {/* 版本號、啟用開關 */}
        </TabsContent>
      </Tabs>
    </ScrollArea>

    <DialogFooter>
      <Button variant="outline" onClick={onCancel}>取消</Button>
      <Button onClick={handleSubmit}>
        {isEditMode ? "更新" : "建立"}
      </Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
```

### 3. 刪除確認對話框

#### 情況 A: 無關聯 Agent
```tsx
<AlertDialog>
  <AlertDialogContent>
    <AlertDialogHeader>
      <AlertDialogTitle>確認刪除 Persona</AlertDialogTitle>
      <AlertDialogDescription>
        您確定要刪除 "{persona.name}" 嗎？此操作無法復原。
      </AlertDialogDescription>
    </AlertDialogHeader>
    <AlertDialogFooter>
      <AlertDialogCancel>取消</AlertDialogCancel>
      <AlertDialogAction
        className="bg-destructive hover:bg-destructive/90"
        onClick={confirmDelete}
      >
        確認刪除
      </AlertDialogAction>
    </AlertDialogFooter>
  </AlertDialogContent>
</AlertDialog>
```

#### 情況 B: 有關聯 Agent (不允許刪除)
```tsx
<AlertDialog>
  <AlertDialogContent>
    <AlertDialogHeader>
      <AlertDialogTitle className="flex items-center gap-2 text-orange-600">
        <AlertCircle className="w-5 h-5" />
        無法刪除 Persona
      </AlertDialogTitle>
      <AlertDialogDescription>
        <div className="space-y-3">
          <p>"{persona.name}" 目前被以下 {linkedAgents.length} 個 Agent 使用，無法刪除：</p>

          <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 max-h-[200px] overflow-y-auto">
            <ul className="space-y-2">
              {linkedAgents.map(agent => (
                <li key={agent.id} className="flex items-center gap-2 text-sm">
                  <Bot className="w-4 h-4 text-orange-600" />
                  <span className="font-medium">{agent.name}</span>
                </li>
              ))}
            </ul>
          </div>

          <p className="text-sm text-gray-600">
            💡 提示：請先將這些 Agent 切換到其他 Persona，或刪除這些 Agent 後再刪除此 Persona。
          </p>
        </div>
      </AlertDialogDescription>
    </AlertDialogHeader>
    <AlertDialogFooter>
      <AlertDialogCancel>了解</AlertDialogCancel>
    </AlertDialogFooter>
  </AlertDialogContent>
</AlertDialog>
```

---

## API 設計

### API Routes 完整規格

#### 1. GET `/api/personas` - 列出所有 Persona
**已存在**: ✅

**回應格式**:
```json
{
  "success": true,
  "data": [
    {
      "id": "clxxx",
      "name": "CDO 商務顧問",
      "role": "Chief Data Officer",
      "description": "專注於資料驅動決策...",
      "language": "zh-TW",
      "tone": "professional",
      "capabilities": ["business analysis", "data interpretation"],
      "version": "1.0.0",
      "isActive": true,
      "_count": {
        "agents": 3
      }
    }
  ],
  "total": 10,
  "timestamp": "2025-10-23T..."
}
```

#### 2. POST `/api/personas` - 建立新 Persona
**狀態**: ❌ 需要建立

**請求 Body**:
```json
{
  "name": "技術架構師",
  "role": "Technical Architect",
  "description": "專注於系統設計與架構規劃...",
  "systemPrompt": "你是一位資深技術架構師...",
  "language": "zh-TW",
  "tone": "professional",
  "style": ["analytical", "systematic"],
  "capabilities": ["system design", "architecture planning"],
  "restrictions": ["no politics"],
  "version": "1.0.0"
}
```

**回應格式**:
```json
{
  "success": true,
  "data": {
    "id": "clxxx",
    "name": "技術架構師",
    "createdAt": "2025-10-23T..."
  },
  "timestamp": "2025-10-23T..."
}
```

**驗證規則**:
- `name`: 必填，長度 1-100 字元
- `role`: 必填，長度 1-100 字元
- `description`: 必填，長度 10-1000 字元
- `systemPrompt`: 必填，最少 100 字元
- `language`: 必填，enum ["zh-TW", "en", "ja"]
- `tone`: 必填，enum ["professional", "friendly", "casual", "academic"]
- `version`: 必填，符合 Semantic Versioning

#### 3. GET `/api/personas/[id]` - 獲取單一 Persona 詳情
**狀態**: ❌ 需要建立

**回應格式**:
```json
{
  "success": true,
  "data": {
    "id": "clxxx",
    "name": "CDO 商務顧問",
    "role": "Chief Data Officer",
    "description": "專注於資料驅動決策...",
    "systemPrompt": "你是一位資深 CDO...",
    "language": "zh-TW",
    "tone": "professional",
    "style": ["concise", "data-driven"],
    "capabilities": ["business analysis", "data interpretation"],
    "restrictions": ["no politics"],
    "version": "1.0.0",
    "isActive": true,
    "agents": [
      {
        "id": "agent1",
        "name": "CDO 助理",
        "category": "professional"
      }
    ],
    "createdAt": "2025-01-01T...",
    "updatedAt": "2025-10-23T..."
  },
  "timestamp": "2025-10-23T..."
}
```

#### 4. PUT `/api/personas/[id]` - 更新 Persona
**狀態**: ❌ 需要建立

**請求 Body**: (與 POST 相同，所有欄位可選)

**回應格式**:
```json
{
  "success": true,
  "data": {
    "id": "clxxx",
    "name": "CDO 商務顧問 (更新)",
    "updatedAt": "2025-10-23T..."
  },
  "timestamp": "2025-10-23T..."
}
```

#### 5. DELETE `/api/personas/[id]` - 刪除 Persona
**狀態**: ❌ 需要建立

**流程**:
```typescript
1. 檢查關聯的 Agent 數量
   ↓
2. 如果有關聯 → 回傳錯誤與 Agent 列表
   ↓
3. 如果無關聯 → 執行刪除
```

**成功回應**:
```json
{
  "success": true,
  "message": "Persona 已刪除",
  "timestamp": "2025-10-23T..."
}
```

**失敗回應** (有關聯 Agent):
```json
{
  "success": false,
  "error": {
    "code": "PERSONA_IN_USE",
    "message": "此 Persona 正被使用，無法刪除",
    "details": {
      "linkedAgents": [
        {
          "id": "agent1",
          "name": "CDO 助理",
          "category": "professional"
        }
      ],
      "agentCount": 3
    }
  },
  "timestamp": "2025-10-23T..."
}
```

#### 6. GET `/api/personas/[id]/agents` - 獲取關聯的 Agent 列表
**狀態**: ❌ 需要建立

**回應格式**:
```json
{
  "success": true,
  "data": [
    {
      "id": "agent1",
      "name": "CDO 助理",
      "description": "商務數據分析助手",
      "category": "professional",
      "isActive": true,
      "usageCount": 150
    }
  ],
  "total": 3,
  "timestamp": "2025-10-23T..."
}
```

---

## 資料流程

### 1. 建立 Persona 流程
```
使用者點擊 [建立 Persona]
  ↓
開啟 PersonaForm Dialog
  ↓
填寫表單 (4 個 Tabs)
  ↓
提交表單
  ↓
POST /api/personas
  ↓
驗證資料
  ↓
prisma.persona.create()
  ↓
回傳新建 Persona
  ↓
重新載入列表
  ↓
顯示成功 Toast
```

### 2. 編輯 Persona 流程
```
使用者點擊 [編輯] 按鈕
  ↓
GET /api/personas/[id]
  ↓
載入詳細資料到表單
  ↓
開啟 PersonaForm Dialog (編輯模式)
  ↓
修改表單內容
  ↓
提交表單
  ↓
PUT /api/personas/[id]
  ↓
驗證資料
  ↓
prisma.persona.update()
  ↓
回傳更新後 Persona
  ↓
重新載入列表
  ↓
顯示成功 Toast
```

### 3. 刪除 Persona 流程 (成功案例)
```
使用者點擊 [刪除] 按鈕
  ↓
GET /api/personas/[id]/agents
  ↓
檢查關聯 Agent 數量
  ↓
沒有關聯 Agent
  ↓
顯示確認對話框
  ↓
使用者確認刪除
  ↓
DELETE /api/personas/[id]
  ↓
prisma.persona.delete()
  ↓
回傳成功
  ↓
重新載入列表
  ↓
顯示成功 Toast
```

### 4. 刪除 Persona 流程 (失敗案例)
```
使用者點擊 [刪除] 按鈕
  ↓
GET /api/personas/[id]/agents
  ↓
檢查關聯 Agent 數量
  ↓
有關聯 Agent (3 個)
  ↓
顯示警告對話框
  ↓
列出關聯的 Agent 清單:
  • CDO 助理
  • 數據分析師
  • 商務顧問
  ↓
提示使用者操作建議
  ↓
使用者點擊 [了解] 關閉
```

### 5. Agent Editor 使用 Persona
```
Agent Editor 開啟
  ↓
載入 Persona 列表
  ↓
GET /api/personas
  ↓
填充 <Select> 選項
  ↓
使用者選擇 Persona
  ↓
設定 formData.personaId
  ↓
提交 Agent 表單
  ↓
建立 Agent 時關聯 Persona
  ↓
Agent 成功建立並綁定 Persona
```

---

## 刪除邏輯

### 設計決策：不允許刪除有關聯的 Persona

**理由**:
1. **資料完整性**: 避免破壞 Agent 的 Persona 引用
2. **使用者體驗**: 明確告知使用者為何無法刪除
3. **安全性**: 防止誤刪正在使用的 Persona
4. **追蹤性**: 保留完整的 Agent-Persona 關聯歷史

### 實作細節

#### 前端驗證
```typescript
// PersonaCard.tsx
<Button
  variant="destructive"
  size="sm"
  onClick={() => handleDelete(persona)}
  disabled={persona.agents?.length > 0}  // 有關聯時禁用刪除按鈕
>
  <Trash className="w-4 h-4 mr-2" />
  刪除
</Button>
```

#### 後端驗證
```typescript
// app/api/personas/[id]/route.ts - DELETE
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params

    // 1. 檢查關聯的 Agent
    const linkedAgents = await prisma.aIAgent.findMany({
      where: { personaId: id },
      select: {
        id: true,
        name: true,
        category: true,
      }
    })

    // 2. 如果有關聯，回傳錯誤
    if (linkedAgents.length > 0) {
      return NextResponse.json({
        success: false,
        error: {
          code: 'PERSONA_IN_USE',
          message: '此 Persona 正被使用，無法刪除',
          details: {
            linkedAgents,
            agentCount: linkedAgents.length
          }
        }
      }, { status: 400 })
    }

    // 3. 執行刪除
    await prisma.persona.delete({
      where: { id }
    })

    return NextResponse.json({
      success: true,
      message: 'Persona 已刪除'
    })
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: {
        code: 'DELETE_ERROR',
        message: '刪除 Persona 失敗'
      }
    }, { status: 500 })
  }
}
```

#### 前端刪除處理
```typescript
// PersonaListPage.tsx
const handleDelete = async (persona: Persona) => {
  try {
    // 1. 檢查關聯 Agent
    const agentsResponse = await fetch(`/api/personas/${persona.id}/agents`)
    const agentsData = await agentsResponse.json()

    if (agentsData.data && agentsData.data.length > 0) {
      // 2. 有關聯 → 顯示警告對話框
      setDeletingPersona({
        persona,
        linkedAgents: agentsData.data,
        canDelete: false
      })
    } else {
      // 3. 無關聯 → 顯示確認對話框
      setDeletingPersona({
        persona,
        linkedAgents: [],
        canDelete: true
      })
    }
  } catch (error) {
    toast.error('檢查 Persona 關聯失敗')
  }
}

const confirmDelete = async () => {
  if (!deletingPersona || !deletingPersona.canDelete) return

  try {
    const response = await fetch(`/api/personas/${deletingPersona.persona.id}`, {
      method: 'DELETE'
    })

    if (response.ok) {
      toast.success('Persona 已刪除')
      loadPersonas() // 重新載入列表
    } else {
      const data = await response.json()
      toast.error(data.error?.message || '刪除失敗')
    }
  } catch (error) {
    toast.error('刪除 Persona 失敗')
  } finally {
    setDeletingPersona(null)
  }
}
```

---

## 其他考量

### 1. Selection Option 背景問題 ✅

**問題**: 所有 `<SelectContent>` 元件可能背景透明

**解決方案**: 在 `components/ui/select.tsx` 確保背景色

```typescript
// components/ui/select.tsx
const SelectContent = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Content>
>(({ className, children, position = "popper", ...props }, ref) => (
  <SelectPrimitive.Portal>
    <SelectPrimitive.Content
      ref={ref}
      className={cn(
        "... bg-white ...",  // ✅ 確保有 bg-white
        position === "popper" &&
          "...",
        className
      )}
      position={position}
      {...props}
    >
      <SelectPrimitive.Viewport
        className={cn(
          "...",
          position === "popper" &&
            "..."
        )}
      >
        {children}
      </SelectPrimitive.Viewport>
    </SelectPrimitive.Content>
  </SelectPrimitive.Portal>
))
```

**檢查清單**:
- ✅ `components/ui/select.tsx` - SelectContent
- ✅ `components/ui/dialog.tsx` - DialogContent
- ✅ `components/ui/dropdown-menu.tsx` - DropdownMenuContent
- ✅ `components/ui/popover.tsx` - PopoverContent

### 2. Persona 版本管理

**考慮點**: Persona 會隨時間演進，需要版本控制

**建議方案**:
- 使用 Semantic Versioning (major.minor.patch)
- 更新 Persona 時建議更新版本號
- 未來可擴展：
  - 版本歷史記錄
  - 版本比較功能
  - 回滾到舊版本

### 3. Persona 複製功能

**需求**: 使用者可能想基於現有 Persona 建立新的

**建議方案**:
```typescript
// 在 PersonaCard 新增 [複製] 按鈕
<Button
  variant="outline"
  size="sm"
  onClick={() => handleDuplicate(persona)}
>
  <Copy className="w-4 h-4 mr-2" />
  複製
</Button>

// 複製邏輯
const handleDuplicate = (persona: Persona) => {
  const duplicatedData = {
    ...persona,
    name: `${persona.name} (複製)`,
    version: "1.0.0" // 重置版本
  }
  openCreateDialog(duplicatedData)
}
```

### 4. Persona 匯入/匯出

**需求**: 使用者可能想分享或備份 Persona

**建議方案**:
```typescript
// 匯出為 JSON
const handleExport = (persona: Persona) => {
  const json = JSON.stringify(persona, null, 2)
  const blob = new Blob([json], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `persona-${persona.name}-${persona.version}.json`
  a.click()
}

// 匯入 JSON
const handleImport = (file: File) => {
  const reader = new FileReader()
  reader.onload = (e) => {
    const data = JSON.parse(e.target?.result as string)
    openCreateDialog(data)
  }
  reader.readAsText(file)
}
```

### 5. Persona 範本庫

**需求**: 提供預設 Persona 範本供使用者快速開始

**建議方案**:
- 建立 10-20 個預設 Persona 範本
- 使用 `isSystem: true` 標記系統範本
- 使用者可複製範本並自訂
- 範本類別：
  - 商務顧問類 (CDO, CFO, CMO)
  - 技術專家類 (架構師, 工程師, DevOps)
  - 創意設計類 (設計師, 文案, 藝術家)
  - 教育學習類 (導師, 教練, 輔導員)
  - 生活助理類 (健康顧問, 旅遊規劃, 財務顧問)

### 6. Persona 搜尋與篩選優化

**建議功能**:
- 全文搜尋 (名稱、角色、描述、能力)
- 多維度篩選：
  - 語言
  - 語氣
  - 類別 (商務/技術/創意等)
  - 狀態 (啟用/停用)
  - 關聯 Agent 數量 (0, 1-5, 5+)
- 排序選項：
  - 建立時間 (新→舊, 舊→新)
  - 名稱 (A→Z, Z→A)
  - 關聯 Agent 數量 (多→少, 少→多)

### 7. 權限與可見性

**當前**: Persona 是全域共享的

**未來考慮**:
- 使用者個人 Persona (只有建立者可見)
- 公開 Persona (所有使用者可見)
- 團隊 Persona (團隊成員可見)

**資料庫調整** (未來):
```prisma
model Persona {
  // ... 現有欄位
  ownerId   String?  // Persona 擁有者
  owner     User?    @relation(fields: [ownerId], references: [id])
  isPublic  Boolean  @default(false)  // 是否公開
  teamId    String?  // 團隊 ID (未來擴展)
}
```

### 8. Persona 效能監控

**建議指標**:
- 每個 Persona 的使用次數
- 平均對話長度
- 使用者滿意度評分
- System Prompt Token 使用量

**實作方案**:
```prisma
model PersonaUsageLog {
  id              String   @id @default(cuid())
  personaId       String
  persona         Persona  @relation(fields: [personaId], references: [id])
  agentId         String
  conversationId  String
  tokenUsed       Int      // System Prompt Token 數量
  responseTime    Int      // LLM 回應時間 (ms)
  userRating      Int?     // 使用者評分 (1-5)
  createdAt       DateTime @default(now())

  @@index([personaId, createdAt])
}
```

---

## 實作清單

### Phase 1: API 建立 (優先)

#### 1.1 建立 Persona CRUD API
- [ ] `app/api/personas/[id]/route.ts`
  - [ ] GET - 獲取單一 Persona
  - [ ] PUT - 更新 Persona
  - [ ] DELETE - 刪除 Persona (含關聯檢查)
- [ ] `app/api/personas/route.ts` - POST (建立 Persona)
- [ ] `app/api/personas/[id]/agents/route.ts` - GET (獲取關聯 Agent)

#### 1.2 驗證與錯誤處理
- [ ] 建立 Persona 表單驗證 Schema (Zod)
- [ ] API 錯誤回應標準化
- [ ] 關聯檢查邏輯測試

### Phase 2: UI 元件建立

#### 2.1 Persona 列表頁
- [ ] 重寫 `app/[locale]/(dashboard)/knowledge/persona/page.tsx`
  - [ ] 頁面標題與描述
  - [ ] 統計卡片區塊
  - [ ] 搜尋與篩選欄位
  - [ ] Persona 卡片 Grid
  - [ ] 載入/空狀態
- [ ] 建立 `components/knowledge/PersonaCard.tsx`
  - [ ] 卡片佈局
  - [ ] 關聯 Agent 數量顯示
  - [ ] 編輯/刪除按鈕
  - [ ] Hover 效果

#### 2.2 Persona 表單元件
- [ ] 建立 `components/knowledge/PersonaForm.tsx`
  - [ ] Dialog 結構
  - [ ] 4 個 Tab 頁面
  - [ ] 表單欄位元件
  - [ ] 驗證邏輯
  - [ ] 提交處理

#### 2.3 刪除確認對話框
- [ ] 建立刪除確認邏輯
  - [ ] 無關聯 Agent 對話框
  - [ ] 有關聯 Agent 警告對話框
  - [ ] 關聯 Agent 清單顯示

### Phase 3: 整合與測試

#### 3.1 Agent Editor 整合
- [ ] 更新 `components/agents/AgentEditor.tsx`
  - [ ] 動態載入 Persona 列表 (從 `/api/personas`)
  - [ ] 移除硬編碼選項
  - [ ] 錯誤處理

#### 3.2 Selection 背景修復
- [ ] 檢查並修復所有 Selection 元件背景
  - [ ] `components/ui/select.tsx`
  - [ ] `components/ui/dialog.tsx`
  - [ ] `components/ui/dropdown-menu.tsx`
  - [ ] `components/ui/popover.tsx`

#### 3.3 完整測試
- [ ] 建立 Persona 流程測試
- [ ] 編輯 Persona 流程測試
- [ ] 刪除 Persona 流程測試 (有/無關聯)
- [ ] Agent 選擇 Persona 流程測試
- [ ] 搜尋與篩選功能測試

### Phase 4: 文件與優化

#### 4.1 使用者文件
- [ ] 建立 Persona 管理指南
- [ ] 建立 System Prompt 撰寫最佳實踐
- [ ] 更新系統架構文件

#### 4.2 效能優化
- [ ] API 回應時間優化
- [ ] 列表分頁實作
- [ ] 搜尋防抖動優化

---

## 時間估算

| Phase | 任務 | 預估時間 |
|-------|------|----------|
| Phase 1 | API 建立 | 4-6 小時 |
| Phase 2 | UI 元件建立 | 6-8 小時 |
| Phase 3 | 整合與測試 | 3-4 小時 |
| Phase 4 | 文件與優化 | 2-3 小時 |
| **總計** | | **15-21 小時** |

---

## 成功指標

### 功能指標
- ✅ 使用者可以瀏覽所有 Persona 列表
- ✅ 使用者可以建立新的 Persona
- ✅ 使用者可以編輯現有 Persona
- ✅ 使用者可以刪除未使用的 Persona
- ✅ 系統阻止刪除有關聯的 Persona 並顯示友好訊息
- ✅ Agent Editor 動態載入 Persona 列表
- ✅ 所有 Selection 元件背景正常顯示

### 品質指標
- ✅ API 回應時間 < 500ms (P95)
- ✅ UI 載入時間 < 1s
- ✅ 無 TypeScript 錯誤
- ✅ 無 Console 錯誤
- ✅ 所有功能通過手動測試

### 使用者體驗指標
- ✅ 操作流程直觀清晰
- ✅ 錯誤訊息友好且有指導性
- ✅ 視覺設計一致性高
- ✅ 互動反饋及時

---

## 風險與應對

### 風險 1: 資料遷移
**問題**: 現有的 `persona.md` 檔案與資料庫不同步

**應對**:
- 建立遷移腳本，將檔案內容匯入資料庫
- 保留檔案作為備份
- 建立匯入工具供手動操作

### 風險 2: 破壞現有 Agent
**問題**: 更改可能影響已建立的 Agent

**應對**:
- 充分測試 Agent-Persona 關聯
- 在開發環境完整測試後再部署
- 準備回滾計畫

### 風險 3: UI 效能
**問題**: Persona 數量增加後列表載入緩慢

**應對**:
- 實作分頁或無限滾動
- 使用虛擬滾動 (react-window)
- 優化 API 查詢 (僅載入必要欄位)

---

## 後續擴展

### Short-term (1-2 months)
- Persona 複製功能
- Persona 匯入/匯出 (JSON)
- Persona 範本庫 (10 個預設範本)
- 搜尋與篩選優化

### Mid-term (3-6 months)
- Persona 版本歷史
- Persona 效能監控
- Persona 使用分析
- A/B 測試功能

### Long-term (6-12 months)
- 多使用者權限系統
- 團隊協作功能
- Persona 市集
- AI 輔助 System Prompt 生成

---

**文件建立日期**: 2025-10-23
**最後更新**: 2025-10-23
**作者**: Claude Code
**審核狀態**: 待審核

