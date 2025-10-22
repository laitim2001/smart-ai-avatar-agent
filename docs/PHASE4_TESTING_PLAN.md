# Phase 4 Agent 功能測試與優化計劃

**建立日期**: 2025-10-22
**狀態**: 測試規劃完成，待執行
**預計時間**: 2 天

---

## 📋 測試策略總覽

### 測試範圍

1. **單元測試** (Vitest)
   - Agent Store (Zustand)
   - API Client 函數
   - 工具函數與型別定義

2. **元件測試** (Vitest + Testing Library)
   - AgentCard
   - AgentSelector
   - AgentEditor
   - ChatInterface 整合

3. **整合測試** (Vitest)
   - Agent CRUD API 路由
   - Knowledge 關聯 API
   - 完整 Agent 建立流程

4. **E2E 測試** (Playwright)
   - Agent 市集瀏覽
   - Agent 建立與編輯
   - Agent 選擇與對話
   - 完整使用者流程

---

## 🧪 單元測試計劃

### 1. Agent Store 測試 (`tests/stores/agentStore.test.ts`)

**測試項目**:

✅ **State 初始化**
```typescript
describe('AgentStore Initialization', () => {
  test('應該初始化空狀態')
  test('應該有正確的預設值')
})
```

✅ **loadAgents() 方法**
```typescript
describe('loadAgents', () => {
  test('應該成功載入 Agent 列表')
  test('應該處理篩選參數 (isSystem, isPublic, category)')
  test('應該處理 API 錯誤並設定錯誤訊息')
  test('應該在載入時設定 isLoading 狀態')
})
```

✅ **loadAgentDetail() 方法**
```typescript
describe('loadAgentDetail', () => {
  test('應該成功載入單一 Agent 詳細資料')
  test('應該包含 persona 和 knowledgeBases 關聯')
  test('應該處理 404 錯誤')
  test('應該快取已載入的 Agent 詳細資料')
})
```

✅ **createAgent() 方法**
```typescript
describe('createAgent', () => {
  test('應該成功建立 Agent')
  test('應該驗證必填欄位')
  test('應該處理 API 錯誤')
  test('應該更新 agents 列表')
})
```

✅ **updateAgent() 方法**
```typescript
describe('updateAgent', () => {
  test('應該成功更新 Agent')
  test('應該更新 agents 列表中的對應項目')
  test('應該處理不存在的 Agent ID')
})
```

✅ **deleteAgent() 方法**
```typescript
describe('deleteAgent', () => {
  test('應該成功刪除 Agent (soft delete)')
  test('應該支援強制刪除 (force = true)')
  test('應該從 agents 列表中移除')
  test('應該處理刪除失敗')
})
```

✅ **Knowledge 關聯管理**
```typescript
describe('Knowledge Association', () => {
  test('linkKnowledge() 應該成功關聯知識庫')
  test('unlinkKnowledge() 應該成功解除關聯')
  test('updateKnowledgeLink() 應該更新關聯設定')
  test('應該處理關聯 API 錯誤')
})
```

**預期覆蓋率**: ≥ 90%

---

### 2. Chat Store 整合測試 (`tests/stores/chatStore.agent.test.ts`)

**測試項目**:

✅ **selectedAgentId 狀態**
```typescript
describe('Agent Selection', () => {
  test('setSelectedAgent() 應該更新 selectedAgentId')
  test('sendMessage() 應該傳遞 agentId 給 API')
  test('訊息應該包含 agentId 和 agentName')
})
```

✅ **Agent 資訊持久化**
```typescript
describe('Agent Info in Messages', () => {
  test('avatar 訊息應該包含 Agent 資訊')
  test('應該正確載入 Agent 名稱')
  test('預設 Agent 應該顯示「預設助理」')
})
```

**預期覆蓋率**: ≥ 85%

---

### 3. API Client 測試 (`tests/lib/api/chat.agent.test.ts`)

**測試項目**:

✅ **sendChatMessage() 參數傳遞**
```typescript
describe('Agent Parameter Passing', () => {
  test('應該正確傳遞 agentId 參數')
  test('agentId 為 null 時應該不傳遞')
  test('應該與其他參數 (language) 共存')
})
```

**預期覆蓋率**: ≥ 80%

---

## 🎨 元件測試計劃

### 1. AgentCard 元件 (`tests/components/agents/AgentCard.test.tsx`)

**測試項目**:

✅ **渲染測試**
```typescript
describe('AgentCard Rendering', () => {
  test('應該顯示 Agent 名稱與描述')
  test('應該顯示 System 徽章')
  test('應該顯示類別徽章 (正確顏色)')
  test('應該顯示統計資訊 (知識庫、對話數)')
  test('應該顯示支援語言')
})
```

✅ **互動測試**
```typescript
describe('AgentCard Interactions', () => {
  test('點擊「選擇」按鈕應該觸發 onSelect')
  test('點擊「編輯」按鈕應該觸發 onEdit')
  test('點擊「刪除」按鈕應該觸發 onDelete')
  test('showActions=false 時不顯示操作按鈕')
})
```

✅ **樣式測試**
```typescript
describe('AgentCard Styles', () => {
  test('selected=true 時應該有高亮樣式')
  test('compact 模式應該縮減尺寸')
  test('類別顏色應該正確對應')
})
```

**預期覆蓋率**: ≥ 85%

---

### 2. AgentSelector 元件 (`tests/components/agents/AgentSelector.test.tsx`)

**測試項目**:

✅ **對話框開關**
```typescript
describe('AgentSelector Dialog', () => {
  test('open=true 時應該顯示對話框')
  test('點擊關閉按鈕應該觸發 onOpenChange(false)')
  test('選擇 Agent 後應該自動關閉')
})
```

✅ **Agent 列表**
```typescript
describe('Agent List', () => {
  test('應該載入並顯示 Agent 列表')
  test('Tab 切換應該過濾不同類型 (all/system/public/my)')
  test('搜尋框應該即時過濾')
  test('應該顯示 loading 狀態')
  test('無結果時應該顯示空狀態')
})
```

✅ **Agent 選擇**
```typescript
describe('Agent Selection', () => {
  test('點擊 Agent 應該觸發 onSelect')
  test('應該傳遞正確的 agentId')
})
```

**預期覆蓋率**: ≥ 80%

---

### 3. AgentEditor 元件 (`tests/components/agents/AgentEditor.test.tsx`)

**測試項目**:

✅ **表單渲染**
```typescript
describe('AgentEditor Form', () => {
  test('應該顯示三個 Tab (基本資訊、Persona、進階)')
  test('編輯模式應該預填資料')
  test('建立模式應該顯示空表單')
})
```

✅ **表單驗證**
```typescript
describe('Form Validation', () => {
  test('名稱為空時應該顯示錯誤')
  test('描述為空時應該顯示錯誤')
  test('未選擇 Persona 時應該顯示錯誤')
  test('未選擇語言時應該顯示錯誤')
})
```

✅ **表單提交**
```typescript
describe('Form Submission', () => {
  test('建立模式應該呼叫 createAgent()')
  test('編輯模式應該呼叫 updateAgent()')
  test('成功後應該觸發 onSuccess')
  test('失敗後應該顯示錯誤訊息')
})
```

**預期覆蓋率**: ≥ 85%

---

### 4. ChatInterface 整合 (`tests/components/chat/ChatInterface.agent.test.tsx`)

**測試項目**:

✅ **Agent 選擇按鈕**
```typescript
describe('Agent Selection Button', () => {
  test('應該顯示當前 Agent 名稱')
  test('點擊應該開啟 AgentSelector')
  test('預設應該顯示「預設助理」')
})
```

✅ **Agent 資訊顯示**
```typescript
describe('Agent Info in Messages', () => {
  test('avatar 訊息應該顯示 Agent 名稱和圖示')
  test('使用者訊息不應該顯示 Agent 資訊')
})
```

**預期覆蓋率**: ≥ 75%

---

## 🔗 整合測試計劃

### 1. Agent CRUD API (`tests/unit/api/agents.test.ts`)

**測試項目**:

✅ **GET /api/agents**
```typescript
describe('GET /api/agents', () => {
  test('應該返回 Agent 列表')
  test('應該支援 isSystem 篩選')
  test('應該支援 isPublic 篩選')
  test('應該支援 category 篩選')
  test('應該處理認證錯誤')
})
```

✅ **GET /api/agents/:id**
```typescript
describe('GET /api/agents/:id', () => {
  test('應該返回 Agent 詳細資料')
  test('應該包含 persona 關聯')
  test('應該包含 knowledgeBases 關聯')
  test('404 錯誤處理')
})
```

✅ **POST /api/agents**
```typescript
describe('POST /api/agents', () => {
  test('應該建立新 Agent')
  test('應該驗證必填欄位')
  test('應該設定預設值')
  test('應該處理重複名稱')
})
```

✅ **PUT /api/agents/:id**
```typescript
describe('PUT /api/agents/:id', () => {
  test('應該更新 Agent')
  test('應該保留未修改的欄位')
  test('應該更新 updatedAt')
})
```

✅ **DELETE /api/agents/:id**
```typescript
describe('DELETE /api/agents/:id', () => {
  test('應該軟刪除 Agent (isDeleted=true)')
  test('force=true 應該實際刪除')
  test('應該處理不存在的 Agent')
})
```

**預期覆蓋率**: ≥ 80%

---

### 2. Knowledge 關聯 API (`tests/unit/api/agents-knowledge.test.ts`)

**測試項目**:

✅ **POST /api/agents/:id/knowledge**
```typescript
describe('Link Knowledge', () => {
  test('應該成功關聯知識庫')
  test('應該設定 priority 和 isRequired')
  test('應該處理已存在的關聯')
})
```

✅ **DELETE /api/agents/:id/knowledge/:kbId**
```typescript
describe('Unlink Knowledge', () => {
  test('應該成功解除關聯')
  test('force=true 應該實際刪除')
})
```

**預期覆蓋率**: ≥ 75%

---

## 🎭 E2E 測試計劃

### 1. Agent 市集流程 (`tests/e2e/agent-market.spec.ts`)

**測試場景**:

✅ **瀏覽與搜尋**
```typescript
test('應該顯示 Agent 市集頁面', async ({ page }) => {
  await page.goto('/zh-TW/agents')
  await expect(page.getByRole('heading', { name: 'Agent 市集' })).toBeVisible()
})

test('應該能搜尋 Agent', async ({ page }) => {
  await page.goto('/zh-TW/agents')
  await page.fill('input[placeholder*="搜尋"]', 'CDO')
  // 應該只顯示符合的 Agent
})

test('Tab 篩選應該正常運作', async ({ page }) => {
  await page.goto('/zh-TW/agents')
  await page.click('text=系統 Agent')
  // 應該只顯示 isSystem=true 的 Agent
})
```

✅ **建立 Agent**
```typescript
test('應該能建立新 Agent', async ({ page }) => {
  await page.goto('/zh-TW/agents')
  await page.click('text=建立 Agent')

  // 填寫表單
  await page.fill('[name="name"]', '測試 Agent')
  await page.fill('[name="description"]', '測試描述')
  await page.selectOption('[name="category"]', 'professional')
  await page.selectOption('[name="personaId"]', 'system-cdo-advisor')

  // 提交
  await page.click('text=建立')

  // 驗證
  await expect(page.getByText('Agent 建立成功')).toBeVisible()
  await expect(page.getByText('測試 Agent')).toBeVisible()
})
```

✅ **編輯 Agent**
```typescript
test('應該能編輯 Agent', async ({ page }) => {
  // 建立 → 編輯 → 驗證
})
```

✅ **刪除 Agent**
```typescript
test('應該能刪除 Agent', async ({ page }) => {
  // 建立 → 刪除 (with confirmation) → 驗證
})
```

**預期時間**: < 2 分鐘

---

### 2. Agent 對話流程 (`tests/e2e/agent-conversation.spec.ts`)

**測試場景**:

✅ **選擇 Agent**
```typescript
test('應該能在對話中選擇 Agent', async ({ page }) => {
  await page.goto('/zh-TW/dashboard')

  // 點擊 Agent 選擇按鈕
  await page.click('[aria-label="選擇 Agent"]')

  // 選擇 Agent
  await page.click('text=CDO 商務顧問')

  // 驗證
  await expect(page.getByText('已選擇 Agent: CDO 商務顧問')).toBeVisible()
})
```

✅ **Agent 對話**
```typescript
test('Agent 回應應該顯示 Agent 名稱', async ({ page }) => {
  // 選擇 Agent → 發送訊息 → 驗證 avatar 訊息包含 Agent 名稱
})
```

**預期時間**: < 1 分鐘

---

## ⚡ 效能優化計劃

### 1. 資料庫查詢優化

**問題識別**:
- Agent 列表查詢可能包含大量關聯資料
- N+1 查詢問題

**優化方案**:

✅ **Prisma Include 優化**
```typescript
// Before: 可能的 N+1 問題
const agents = await prisma.agent.findMany()
for (const agent of agents) {
  await prisma.persona.findUnique({ where: { id: agent.personaId } })
}

// After: 使用 include 一次查詢
const agents = await prisma.agent.findMany({
  include: {
    persona: {
      select: { id: true, name: true, role: true }
    }
  }
})
```

✅ **分頁查詢**
```typescript
// 加入 pagination 支援
const agents = await prisma.agent.findMany({
  take: 20, // 每頁 20 筆
  skip: (page - 1) * 20,
  include: { persona: true }
})
```

✅ **索引優化**
```prisma
// prisma/schema.prisma
model Agent {
  // 加入複合索引
  @@index([isDeleted, isPublic, category])
  @@index([isDeleted, userId])
}
```

---

### 2. 前端效能優化

**問題識別**:
- Agent 列表渲染可能造成卡頓
- 重複 API 呼叫

**優化方案**:

✅ **React.memo 優化**
```typescript
// AgentCard.tsx
export const AgentCard = React.memo(({ agent, onSelect, onEdit, onDelete }) => {
  // ...
})
```

✅ **useMemo 快取**
```typescript
// AgentSelector.tsx
const filteredAgents = useMemo(() => {
  return agents.filter(agent => {
    // 篩選邏輯
  })
}, [agents, searchQuery, categoryFilter])
```

✅ **Agent Store 快取**
```typescript
// agentStore.ts
const agentCache = new Map<string, AgentDetail>()

loadAgentDetail: async (agentId: string) => {
  // 檢查快取
  if (agentCache.has(agentId)) {
    return agentCache.get(agentId)
  }

  // 載入並快取
  const agent = await fetch(`/api/agents/${agentId}`)
  agentCache.set(agentId, agent)
  return agent
}
```

---

### 3. 網路請求優化

**優化方案**:

✅ **SWR / React Query 整合**
```typescript
// 使用 SWR 自動快取與重新驗證
import useSWR from 'swr'

const { data: agents, error, mutate } = useSWR('/api/agents', fetcher, {
  revalidateOnFocus: false,
  dedupingInterval: 60000 // 1 分鐘內不重複請求
})
```

✅ **批次請求**
```typescript
// 使用 DataLoader pattern
const agentLoader = new DataLoader(async (ids) => {
  const agents = await prisma.agent.findMany({
    where: { id: { in: ids } }
  })
  return ids.map(id => agents.find(a => a.id === id))
})
```

---

## 📊 測試執行計劃

### Day 1: 單元測試 + 元件測試

**上午** (4 小時):
1. ✅ 建立 `tests/stores/agentStore.test.ts`
2. ✅ 建立 `tests/stores/chatStore.agent.test.ts`
3. ✅ 建立 `tests/lib/api/chat.agent.test.ts`
4. ✅ 執行測試並達到 ≥85% 覆蓋率

**下午** (4 小時):
1. ✅ 建立 `tests/components/agents/AgentCard.test.tsx`
2. ✅ 建立 `tests/components/agents/AgentSelector.test.tsx`
3. ✅ 建立 `tests/components/agents/AgentEditor.test.tsx`
4. ✅ 建立 `tests/components/chat/ChatInterface.agent.test.tsx`

### Day 2: 整合測試 + E2E 測試 + 優化

**上午** (4 小時):
1. ✅ 建立 `tests/unit/api/agents.test.ts`
2. ✅ 建立 `tests/unit/api/agents-knowledge.test.ts`
3. ✅ 建立 `tests/e2e/agent-market.spec.ts`
4. ✅ 建立 `tests/e2e/agent-conversation.spec.ts`

**下午** (4 小時):
1. ✅ 執行所有測試並修復失敗
2. ✅ 實施效能優化 (資料庫索引、前端快取)
3. ✅ 測試覆蓋率報告
4. ✅ 文件更新 (README, TESTING.md)

---

## ✅ 驗收標準

### 測試覆蓋率
- ✅ Agent Store: ≥ 90%
- ✅ Chat Store (Agent 部分): ≥ 85%
- ✅ Agent 元件: ≥ 80%
- ✅ Agent API: ≥ 80%

### 效能指標
- ✅ Agent 列表載入: < 500ms
- ✅ Agent 建立/更新: < 1s
- ✅ Agent 選擇器開啟: < 200ms
- ✅ E2E 測試總時間: < 5 分鐘

### 品質標準
- ✅ 所有測試通過 (100% pass rate)
- ✅ 無 TypeScript 錯誤
- ✅ ESLint 無警告
- ✅ 無 console errors in tests

---

## 📚 相關文件

- **測試指南**: `tests/README.md`
- **API 參考**: `docs/API_REFERENCE_PHASE4.md`
- **元件文件**: 各元件 JSDoc 註解
- **專案進度**: `docs/MVP_PROGRESS.md`

---

**建立者**: Claude Code
**最後更新**: 2025-10-22
