# Agent 選擇器修復 - 測試指南

**日期**: 2025-10-23
**狀態**: ✅ 修復完成,待測試驗證

---

## 修復內容總覽

### 問題 1: AgentCard 點擊無反應 ✅

**根本原因**:
- `AgentCard` 在 `compact` 模式下沒有顯示選擇按鈕
- `showActions` 預設為 `false`,導致 `CardFooter` 不渲染
- 整個卡片沒有 `onClick` handler

**修復方案**:
1. ✅ 添加整個卡片的 `onClick` handler (在 compact 模式下)
2. ✅ 添加 `cursor-pointer` 樣式提示可點擊
3. ✅ 添加 `active:scale-100` 提供按下反饋
4. ✅ 添加 console.log 追蹤點擊事件

**修改檔案**: `components/agents/AgentCard.tsx` (Lines 73-86)

**程式碼變更**:
```typescript
// 修復前: 沒有 onClick handler
<Card className="...">

// 修復後: 添加 onClick 和視覺反饋
<Card
  className={`... ${
    onSelect && compact ? 'cursor-pointer active:scale-100' : ''
  }`}
  onClick={() => {
    if (onSelect && compact) {
      console.log('[AgentCard] Clicked:', agent.name, 'ID:', agent.id)
      onSelect(agent)
    }
  }}
>
```

---

### 問題 2: 選中狀態視覺反饋不明顯 ✅

**根本原因**:
- `ring-2` 邊框太細,不易察覺
- 沒有背景顏色變化
- 缺少明顯的視覺對比

**修復方案**:
1. ✅ 加粗選中邊框: `ring-2` → `ring-4`
2. ✅ 添加淡藍色背景: `bg-blue-50`
3. ✅ 添加明確邊框顏色: `border-blue-500`
4. ✅ 增強陰影效果: `shadow-lg` → `shadow-xl`
5. ✅ 添加 hover 放大效果: `hover:scale-102`

**修改檔案**: `components/agents/AgentCard.tsx` (Lines 75-77)

**程式碼變更**:
```typescript
// 修復前
className={`... ${
  selected
    ? 'ring-2 ring-blue-500 shadow-lg scale-105'
    : 'hover:shadow-xl hover:border-blue-300'
}`}

// 修復後
className={`... ${
  selected
    ? 'ring-4 ring-blue-500 bg-blue-50 shadow-xl scale-105 border-blue-500'
    : 'hover:shadow-xl hover:border-blue-300 hover:scale-102'
}`}
```

**視覺對比**:
- **未選中**: 白色背景,灰色邊框,hover 時淡藍邊框 + 輕微放大
- **已選中**: 淡藍背景,粗藍邊框,放大 5%,更強陰影

---

### 問題 3: Dialog 背景透明 ✅

**根本原因**:
- CSS 變數 `bg-background` 可能未正確應用
- 需要更明確的顏色值確保渲染

**修復方案**:
1. ✅ 將 `bg-background` 改為明確的 `bg-white`
2. ✅ 添加明確的邊框: `border-gray-200`

**修改檔案**: `components/ui/dialog.tsx` (Line 41)

**程式碼變更**:
```typescript
// 修復前
className="... border bg-background p-6 ..."

// 修復後
className="... border border-gray-200 bg-white p-6 ..."
```

---

### 問題 4: 除錯資訊不足 ✅

**修復方案**: 添加完整的 console.log 追蹤鏈

**1. AgentCard.tsx** (Line 83-84):
```typescript
console.log('[AgentCard] Clicked:', agent.name, 'ID:', agent.id)
onSelect(agent)
```

**2. AgentSelector.tsx** (Lines 89-103):
```typescript
console.log('[AgentSelector] handleSelectAgent:', agent.name, 'ID:', agent.id)
console.log('[AgentSelector] Current agent before:', currentAgent?.name)
setCurrentAgent(agent)
console.log('[AgentSelector] setCurrentAgent called')
console.log('[AgentSelector] Calling onSelect callback with ID:', agent.id)
onSelect?.(agent.id)
console.log('[AgentSelector] Closing dialog')
setTimeout(() => setOpen(false), 100)
```

**3. ChatInterface.tsx** (Lines 182-200):
```typescript
console.log('[ChatInterface] handleSelectAgent called with ID:', agentId)
console.log('[ChatInterface] Loading agent detail...')
const agentDetail = await loadAgentDetail(agentId)
console.log('[ChatInterface] Agent detail loaded:', agentDetail)
if (agentDetail) {
  console.log('[ChatInterface] Setting selected agent:', agentDetail.name)
  setSelectedAgent(agentId)
  setCurrentAgentName(agentDetail.name)
  toast.success(`已選擇 Agent: ${agentDetail.name}`)
}
```

---

## 測試步驟

### 準備工作

1. **打開瀏覽器開發者工具** (F12)
2. **切換到 Console 標籤**
3. **清除舊的 console 訊息** (點擊 🚫 清除按鈕)

### 測試 1: Dialog 背景顯示 ✅

**步驟**:
1. 訪問 `http://localhost:3002/zh-TW/conversations`
2. 點擊左上角藍色 Agent 按鈕 (🤖 圖示)

**預期結果**:
- ✅ 出現半透明黑色背景遮罩 (`bg-black/80`)
- ✅ 對話框內容為**純白色**不透明背景
- ✅ 對話框有灰色邊框和陰影
- ✅ 標題和描述文字清晰可見

### 測試 2: Agent 卡片點擊反饋 ✅

**步驟**:
1. 在 Agent 選擇器中,點擊任一 Agent 卡片
2. 觀察 Console 訊息

**預期 Console 訊息** (範例):
```
[AgentCard] Clicked: 繁體中文專業助理 ID: cm0xxxxx...
[AgentSelector] handleSelectAgent: 繁體中文專業助理 ID: cm0xxxxx...
[AgentSelector] Current agent before: undefined
[AgentSelector] setCurrentAgent called
[AgentSelector] Calling onSelect callback with ID: cm0xxxxx...
[ChatInterface] handleSelectAgent called with ID: cm0xxxxx...
[ChatInterface] Loading agent detail...
[ChatInterface] Agent detail loaded: {id: '...', name: '繁體中文專業助理', ...}
[ChatInterface] Setting selected agent: 繁體中文專業助理
[AgentSelector] Closing dialog
```

**預期視覺反饋**:
- ✅ 點擊時卡片輕微縮小 (`active:scale-100`)
- ✅ 選中後卡片**背景變為淡藍色** (`bg-blue-50`)
- ✅ 選中後卡片有**粗藍色邊框** (`ring-4 ring-blue-500`)
- ✅ 選中後卡片**放大 5%** (`scale-105`)
- ✅ 選中後卡片**陰影加強** (`shadow-xl`)

### 測試 3: Toast 通知顯示 ✅

**預期結果**:
- ✅ 頁面右上角出現 Toast 通知
- ✅ 顯示「已選擇 Agent: [Agent 名稱]」
- ✅ 通知自動消失

### 測試 4: 對話框自動關閉 ✅

**預期結果**:
- ✅ 點擊 Agent 卡片後,對話框在 100ms 後自動關閉
- ✅ 背景遮罩消失
- ✅ 返回對話頁面

### 測試 5: Agent 按鈕名稱更新 ✅

**步驟**:
1. 關閉對話框後,檢查左上角藍色 Agent 按鈕
2. 確認按鈕文字已更新

**預期結果**:
- ✅ 按鈕文字從「預設助理」變為所選 Agent 的名稱
- ✅ Hover 時顯示「當前: [Agent 名稱]」

### 測試 6: 重複選擇測試 ✅

**步驟**:
1. 再次打開 Agent 選擇器
2. 檢查剛才選中的 Agent 卡片

**預期結果**:
- ✅ 剛才選中的 Agent 卡片顯示為**選中狀態**
- ✅ 淡藍色背景,粗藍邊框
- ✅ 其他卡片為正常狀態

### 測試 7: 切換不同 Agent ✅

**步驟**:
1. 選擇另一個 Agent
2. 觀察視覺變化和 Console 訊息

**預期結果**:
- ✅ 舊的 Agent 卡片恢復正常狀態
- ✅ 新的 Agent 卡片變為選中狀態
- ✅ Console 顯示完整的選擇流程
- ✅ Toast 顯示新的 Agent 名稱

---

## 問題排查指南

### 如果點擊 Agent 卡片沒有反應

**檢查 Console 訊息**:
1. 是否有 `[AgentCard] Clicked:` 訊息?
   - ❌ 沒有 → AgentCard onClick handler 未觸發
   - ✅ 有 → 繼續檢查

2. 是否有 `[AgentSelector] handleSelectAgent:` 訊息?
   - ❌ 沒有 → onSelect callback 未傳遞
   - ✅ 有 → 繼續檢查

3. 是否有 `[ChatInterface] handleSelectAgent called:` 訊息?
   - ❌ 沒有 → ChatInterface callback 未接收
   - ✅ 有 → 繼續檢查

4. 是否有 `[ChatInterface] Agent detail loaded:` 訊息?
   - ❌ 沒有 → API 呼叫失敗,檢查 Network 標籤
   - ✅ 有 → 繼續檢查

5. 是否有 `[ChatInterface] Setting selected agent:` 訊息?
   - ❌ 沒有 → agentDetail 為 null
   - ✅ 有 → 應該成功

**檢查 Network 標籤**:
- 是否有 `GET /api/agents/[id]` 請求?
- HTTP 狀態碼是否為 200?
- 回應 JSON 是否包含 `success: true` 和 `data`?

### 如果背景仍然透明

**檢查元素樣式** (F12 → Elements 標籤):
1. 找到 `DialogOverlay` 元素
   - 檢查是否有 `bg-black/80` 樣式
   - 檢查 `z-index: 50`

2. 找到 `DialogContent` 元素
   - 檢查是否有 `bg-white` 樣式
   - 檢查 `z-index: 50`
   - 檢查 `border-gray-200` 樣式

**可能原因**:
- Tailwind CSS 未正確編譯
- 樣式被其他 CSS 覆蓋
- z-index 衝突

### 如果選中狀態不明顯

**檢查 Agent 卡片元素**:
1. 選中的卡片是否有以下 class:
   - `ring-4` (粗邊框)
   - `ring-blue-500` (藍色邊框)
   - `bg-blue-50` (淡藍背景)
   - `border-blue-500` (藍色邊框)
   - `scale-105` (放大 5%)
   - `shadow-xl` (強陰影)

**可能原因**:
- `currentAgent` 狀態未正確更新
- `selected` prop 未正確計算
- CSS 類別未應用

---

## 相關檔案

### 修改的檔案
1. ✅ `components/agents/AgentCard.tsx` - 添加 onClick handler 和增強視覺反饋
2. ✅ `components/agents/AgentSelector.tsx` - 添加 console.log 和延遲關閉
3. ✅ `components/chat/ChatInterface.tsx` - 添加完整的 console.log 追蹤
4. ✅ `components/ui/dialog.tsx` - 使用明確的 `bg-white`

### 狀態管理
- `stores/agentStore.ts` - Agent 全局狀態 (currentAgent, agents)
- `stores/chatStore.ts` - 對話狀態 (selectedAgentId)

### API 路由
- `app/api/agents/route.ts` - Agent 列表 API
- `app/api/agents/[id]/route.ts` - Agent 詳細資料 API

---

## 預期測試結果

### 成功標準

✅ **視覺反饋清晰**:
- 對話框背景為純白色,不透明
- 背景遮罩為半透明黑色
- 選中的 Agent 卡片有明顯的淡藍背景和粗藍邊框
- 點擊時有縮小反饋,hover 時有放大效果

✅ **功能正常運作**:
- 點擊 Agent 卡片能正確選擇
- Toast 通知顯示正確的 Agent 名稱
- 對話框自動關閉
- Agent 按鈕文字更新為所選 Agent
- 重複打開對話框時,選中狀態正確保留

✅ **Console 訊息完整**:
- 每次點擊都有完整的訊息鏈
- 從 AgentCard → AgentSelector → ChatInterface
- 顯示 Agent 名稱和 ID
- 顯示 API 載入狀態

### 失敗情況

如果以上任一項目失敗,請提供:
1. **完整的 Console 訊息** (包含錯誤)
2. **Network 標籤的請求詳情** (如果 API 呼叫失敗)
3. **元素樣式檢查截圖** (如果視覺問題)
4. **具體的失敗步驟描述**

---

## Git Commits

```bash
# 1. 修復 AgentCard 點擊和視覺反饋
git add components/agents/AgentCard.tsx
git commit -m "fix(ui): 修復 Agent 卡片點擊無反應和視覺反饋不明顯

- 在 compact 模式下添加整個卡片的 onClick handler
- 增強選中狀態視覺反饋: ring-4, bg-blue-50, border-blue-500
- 添加 cursor-pointer 和 active:scale-100 互動反饋
- 添加 console.log 追蹤點擊事件

問題: AgentCard 在 compact 模式下沒有按鈕,選中狀態不明顯
修復: 卡片可點擊,選中時淡藍背景+粗藍邊框
"

# 2. 修復 Dialog 背景透明
git add components/ui/dialog.tsx
git commit -m "fix(ui): 修復 Dialog 背景透明問題

- 將 bg-background 改為明確的 bg-white
- 添加明確的 border-gray-200 邊框

問題: Dialog 背景可能透明,CSS 變數未正確應用
修復: 使用明確的 Tailwind 類別確保白色背景
"

# 3. 添加除錯日誌
git add components/agents/AgentSelector.tsx components/chat/ChatInterface.tsx
git commit -m "chore(debug): 添加 Agent 選擇器完整的 console.log 追蹤

- AgentSelector: 追蹤 handleSelectAgent 流程
- ChatInterface: 追蹤 API 呼叫和狀態更新
- 延遲關閉對話框 100ms 確保狀態更新完成

用途: 幫助除錯 Agent 選擇流程,確認每個步驟正確執行
"
```

---

## 下一步

### 立即測試
1. 按照上述測試步驟執行完整測試
2. 記錄 Console 訊息
3. 回報測試結果

### 如果測試成功
1. 移除或減少 console.log (可選,保留也無妨)
2. 繼續實作 **問題 3: 對話頁面 Agent 鎖定 (Option A)**

### 如果測試失敗
1. 提供完整的 Console 錯誤訊息
2. 提供 Network 標籤的 API 請求詳情
3. 提供元素樣式檢查截圖 (可選)
4. 我會根據錯誤訊息進一步除錯
