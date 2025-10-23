# Conversations 頁面 UI 問題診斷與測試

**日期**: 2025-10-23
**狀態**: ✅ Avatar 404 已修復 | ⏳ Agent 選擇器問題待測試

---

## 問題總覽

使用者回報 Conversations 頁面 (`/zh-TW/conversations`) 的多個 UI 問題:

### 已修復問題

#### ✅ 問題 1: Avatar 載入 404 錯誤
**錯誤訊息**:
```
Could not load https://models.readyplayer.me/65d5a1b8e37f9e000a7aa0ec.glb?morphTargets=Oculus%20Visemes
fetch responded with 404: Not Found
```

**根本原因**:
- `lib/avatar/constants.ts` 中有 5 個 Avatar 使用了無效的 Ready Player Me URL ID (`65d5a1b8e37f9e000a7aa0ec`)
- localStorage 快取了舊的 Avatar URL

**修復方案**:
1. ✅ 更新 `lib/avatar/constants.ts` - 替換所有無效 URL 為有效 URL `658228794c1a2f27fd06b253`
2. ✅ 執行 `npx tsx scripts/sync-avatars.ts` - 同步到資料庫 (11 個 Avatar 全部成功)
3. ✅ 新增無效 URL ID 到 `stores/avatarStore.ts` 的 `invalidUrls` 清單 - 自動清除快取

**驗證結果**:
- ✅ `http://localhost:3002/zh-TW/conversations` 頁面可以正常載入
- ✅ localStorage 自動清除機制正常運作

---

### 待測試問題

#### ⏳ 問題 2: Agent 選擇器 UI 背景透明
**使用者回報**: "Agent 選擇器 UI 背景透明"

**程式碼檢查結果**:
- ✅ `components/ui/dialog.tsx` 已正確設定 `DialogOverlay` (line 24):
  ```tsx
  className="fixed inset-0 z-50 bg-black/80 ..."
  ```
- ✅ `AgentSelector.tsx` 正確使用了 shadcn/ui 的 `Dialog` 元件
- ✅ `DialogContent` 有設定 `bg-background` 和 `shadow-lg` (line 41)

**可能原因**:
1. Tailwind CSS 變數 `bg-background` 可能未正確定義
2. CSS 載入順序問題
3. z-index 層級衝突

**建議測試步驟**:
1. 打開 `http://localhost:3002/zh-TW/conversations`
2. 點擊左上角「語言選擇器」旁邊的藍色 Agent 按鈕 (有 Bot 圖示)
3. 檢查彈出的 Agent 選擇器對話框:
   - 背景遮罩是否為半透明黑色 (`bg-black/80`)
   - 對話框內容區域是否為白色不透明背景
   - 對話框是否有陰影 (`shadow-lg`)

---

#### ⏳ 問題 3: Agent 選擇器點選無反應
**使用者回報**: "點選了任何一個 agent 都沒有反應"

**程式碼檢查結果**:
- ✅ `AgentSelector.tsx` 有正確的 `handleSelectAgent` 函式 (line 88-92)
- ✅ `AgentCard` 組件有 `onSelect` prop (line 149)
- ✅ 選擇後會:
  1. 更新 `useAgentStore` 的 `currentAgent`
  2. 呼叫 `ChatInterface` 的 `onSelect` callback (傳入 `agentId`)
  3. 關閉對話框 (`setOpen(false)`)

**可能原因**:
1. `AgentCard` 元件的 click handler 未正確實作
2. `useAgentStore` 的 `setCurrentAgent` 未正確更新狀態
3. `ChatInterface` 的 `handleSelectAgent` 未正確處理

**建議測試步驟**:
1. 打開瀏覽器開發者工具 Console
2. 打開 Agent 選擇器
3. 點擊任一 Agent 卡片
4. 檢查 Console 是否有:
   - `[Select Agent Error]` 錯誤訊息
   - 任何 JavaScript 錯誤
5. 檢查對話框是否:
   - 自動關閉
   - 左上角 Agent 按鈕的名稱是否更新

---

#### ⏳ 問題 4: 對話頁面 Agent 鎖定 - 設計完成,(待實作?)
**使用者回報**: "對話頁面 Agent 鎖定 - 設計完成,(待實作?)"

**設計文件**: `claudedocs/ISSUE_RESOLUTION_SUMMARY.md` - Option A 方案

**實作狀態**: 🔴 未實作

**Option A 實作要點**:
1. **資料庫層級**:
   - ✅ `Conversation` model 已有 `agentId` 欄位 (nullable)
   - ✅ 關聯到 `AIAgent` 表格 (Foreign Key)

2. **API 層級** (需實作):
   - 🔴 POST `/api/conversations` - 建立對話時需要傳入 `agentId`
   - 🔴 GET `/api/conversations/[id]` - 回傳對話需包含 `agent` 資料
   - 🔴 PATCH `/api/conversations/[id]` - 允許更新 `agentId`

3. **前端層級** (需實作):
   - 🔴 `ConversationsPage.handleNewConversation` - 傳入當前選擇的 `agentId`
   - 🔴 `ChatInterface` - 載入對話時檢查 `conversation.agentId`
   - 🔴 Agent 選擇器 - 如果對話已鎖定,顯示鎖定圖示並禁用選擇
   - 🔴 UI 提示 - 顯示「此對話已鎖定至 Agent XXX」

4. **使用者體驗**:
   - 新建對話時,使用當前選擇的 Agent
   - 載入現有對話時,切換到對話鎖定的 Agent
   - 對話過程中不允許切換 Agent (保持一致性)
   - 可選:允許解鎖並切換 Agent (需額外確認對話框)

---

## 測試檢查清單

### Avatar 載入測試 ✅
- [x] 訪問 `/zh-TW/conversations` 不出現 404 錯誤
- [x] 3D Avatar 正常載入並顯示
- [x] 切換 Avatar 功能正常運作
- [x] Console 無 Avatar 相關錯誤

### Agent 選擇器 UI 測試 ⏳
- [ ] 點擊 Agent 按鈕能打開對話框
- [ ] 對話框背景遮罩為半透明黑色
- [ ] 對話框內容區域為白色不透明背景
- [ ] 對話框有正確的陰影效果
- [ ] 對話框標題和描述文字清晰可讀
- [ ] 搜尋框功能正常
- [ ] Tab 切換功能正常 (全部/系統/公開/我的)

### Agent 選擇功能測試 ⏳
- [ ] 點擊 Agent 卡片能選擇
- [ ] 選擇後對話框自動關閉
- [ ] Agent 按鈕顯示的名稱更新為所選 Agent
- [ ] Console 無錯誤訊息
- [ ] Toast 通知顯示「已選擇 Agent: XXX」

### Agent 鎖定功能測試 🔴
- [ ] 建立新對話時自動使用當前 Agent
- [ ] 載入現有對話時 Agent 選擇器顯示鎖定狀態
- [ ] 對話過程中無法切換 Agent
- [ ] UI 顯示鎖定提示訊息

---

## 下一步行動

### 立即測試
1. **測試 Agent 選擇器 UI** - 確認背景透明問題
2. **測試 Agent 選擇功能** - 確認點選無反應問題
3. **回報測試結果** - 提供 Console 錯誤訊息 (如有)

### 後續實作 (如需要)
1. **修復 Agent 選擇器 UI** (如測試發現問題)
2. **實作 Agent 鎖定功能** (Option A)
3. **更新文件** - 記錄所有修復和實作

---

## 相關檔案

### 核心元件
- `app/[locale]/(dashboard)/conversations/page.tsx` - Conversations 頁面主元件
- `components/chat/ChatInterface.tsx` - 對話介面 (包含 Agent 選擇器)
- `components/agents/AgentSelector.tsx` - Agent 選擇器對話框
- `components/agents/AgentCard.tsx` - Agent 卡片元件
- `components/ui/dialog.tsx` - shadcn/ui Dialog 元件

### 狀態管理
- `stores/chatStore.ts` - 對話狀態 (包含 `selectedAgentId`)
- `stores/agentStore.ts` - Agent 狀態 (包含 `currentAgent`, `loadAgents`)
- `stores/avatarStore.ts` - Avatar 狀態 (已包含 localStorage 清除機制)

### 資料庫模型
- `prisma/schema.prisma` - Conversation, AIAgent 模型定義

### API 路由
- `app/api/conversations/route.ts` - 對話 CRUD API
- `app/api/agents/route.ts` - Agent 列表 API
- `app/api/agents/[id]/route.ts` - Agent 詳細資料 API

---

## 技術筆記

### Agent 選擇器架構
`AgentSelector` 使用 **受控/非受控混合模式**:
- 接受 `open` 和 `onOpenChange` props (外部控制)
- 也維護內部 `internalOpen` 狀態 (獨立使用)
- 使用 `controlledOpen !== undefined ? controlledOpen : internalOpen` 選擇模式

### Dialog 層級結構
```
Dialog (Radix UI Root)
└─ DialogTrigger (按鈕)
└─ DialogPortal (Portal to body)
   ├─ DialogOverlay (z-50, bg-black/80) ← 背景遮罩
   └─ DialogContent (z-50, bg-background) ← 對話框內容
      ├─ DialogHeader
      │  ├─ DialogTitle
      │  └─ DialogDescription
      ├─ 搜尋框 + Tabs + ScrollArea
      └─ 底部按鈕 (取消/確認)
```

### Agent 選擇流程
```
使用者點擊 Agent 卡片
  ↓
AgentCard.onClick → AgentSelector.handleSelectAgent(agent)
  ↓
useAgentStore.setCurrentAgent(agent)
  ↓
ChatInterface.onSelect(agent.id)
  ↓
ChatInterface.handleSelectAgent(agentId)
  ↓
  ├─ loadAgentDetail(agentId)
  ├─ setSelectedAgent(agentId) (chatStore)
  ├─ setCurrentAgentName(agent.name)
  └─ toast.success()
```

---

## Git Commits

相關的 Git Commits:
- ✅ `fix(avatar): 修復 Avatar 404 錯誤 - 更新無效 URL 並同步資料庫`
- ✅ `fix(avatar): 新增 localStorage 清除機制 - 自動偵測無效 URL`

待提交:
- ⏳ `fix(ui): 修復 Agent 選擇器背景透明問題` (如需要)
- ⏳ `fix(ui): 修復 Agent 選擇器點選無反應問題` (如需要)
- 🔴 `feat(conversation): 實作 Agent 鎖定功能 (Option A)` (待實作)
