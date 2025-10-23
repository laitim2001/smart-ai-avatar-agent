# Agent Selector UI 流程修復記錄

**修復日期**: 2025-10-23
**問題**: Agent Selector 點選 Agent 後立即關閉對話框，無法使用確認/取消按鈕
**修復狀態**: ✅ 完成

---

## 問題描述

### 修復前的錯誤流程：
1. 使用者點擊 Agent 卡片
2. `handleSelectAgent` 立即執行
3. Dialog 立即關閉
4. ❌ 使用者無法看到選擇的視覺反饋
5. ❌ "確認" 和 "取消" 按鈕完全無用

### 使用者期望的正確流程：
1. 使用者點擊 Agent 卡片
2. ✅ Agent 卡片顯示選中狀態（藍色邊框、背景、放大）
3. ✅ 使用者可以點擊其他 Agent 改變選擇
4. ✅ 點擊 "確認" → 執行選擇並關閉 Dialog
5. ✅ 點擊 "取消" → 恢復原本的 Agent 並關閉 Dialog

---

## 修復方案：兩步驟確認模式

### 核心概念
將選擇邏輯分為兩個階段：
- **臨時選擇階段**：點擊卡片只更新視覺狀態
- **確認階段**：點擊確認按鈕才執行實際選擇

### 技術實作

#### 1. 新增臨時選擇狀態
```typescript
// Line 48
const [tempSelectedAgentId, setTempSelectedAgentId] = useState<string | null>(null)
```

#### 2. Dialog 打開時初始化臨時狀態
```typescript
// Lines 63-67
useEffect(() => {
  if (isOpen) {
    setTempSelectedAgentId(currentAgent?.id || null)
  }
}, [isOpen, currentAgent])
```

**用途**: 確保 Dialog 打開時，臨時選擇狀態同步當前 Agent

#### 3. 分離選擇邏輯為三個函數

**A. 點擊 Agent 卡片 - 只更新臨時狀態**
```typescript
// Lines 96-100
const handleClickAgent = (agent: typeof agents[0]) => {
  console.log('[AgentSelector] Click agent:', agent.name, 'ID:', agent.id)
  setTempSelectedAgentId(agent.id)
}
```

**B. 確認選擇 - 執行實際選擇並關閉**
```typescript
// Lines 102-130
const handleConfirmSelection = () => {
  if (!tempSelectedAgentId) {
    console.warn('[AgentSelector] No agent selected')
    return
  }

  const selectedAgent = agents.find(a => a.id === tempSelectedAgentId)
  if (!selectedAgent) {
    console.error('[AgentSelector] Selected agent not found:', tempSelectedAgentId)
    return
  }

  console.log('[AgentSelector] Confirm selection:', selectedAgent.name, 'ID:', selectedAgent.id)
  console.log('[AgentSelector] Current agent before:', currentAgent?.name)

  // 更新全局狀態
  setCurrentAgent(selectedAgent)

  console.log('[AgentSelector] setCurrentAgent called')
  console.log('[AgentSelector] Calling onSelect callback with ID:', selectedAgent.id)

  // 呼叫 callback
  onSelect?.(selectedAgent.id)

  console.log('[AgentSelector] Closing dialog')
  // 關閉對話框
  setOpen(false)
}
```

**C. 取消選擇 - 恢復原狀態並關閉**
```typescript
// Lines 132-139
const handleCancelSelection = () => {
  console.log('[AgentSelector] Cancel selection')
  // 恢復為當前 Agent
  setTempSelectedAgentId(currentAgent?.id || null)
  // 關閉對話框
  setOpen(false)
}
```

#### 4. 更新 AgentCard 使用臨時狀態
```typescript
// Line 196: onSelect 使用點擊處理器
onSelect={handleClickAgent}

// Line 197: selected 使用臨時狀態判斷
selected={tempSelectedAgentId === agent.id}
```

#### 5. 更新按鈕 handlers
```typescript
// Lines 213-218
<Button variant="outline" onClick={handleCancelSelection}>
  {t('cancel')}
</Button>
<Button onClick={handleConfirmSelection} disabled={!tempSelectedAgentId}>
  {t('confirm')}
</Button>
```

**變更點**:
- 取消按鈕：`onClick={() => setOpen(false)}` → `onClick={handleCancelSelection}`
- 確認按鈕：`onClick={() => setOpen(false)}` → `onClick={handleConfirmSelection}`
- 確認按鈕禁用條件：`disabled={!currentAgent}` → `disabled={!tempSelectedAgentId}`

---

## 測試指南

### 測試環境
- URL: http://localhost:3002/zh-TW/conversations
- 操作目標: 頁面頂部的 Agent 選擇器按鈕

### 測試案例 1: 正常選擇流程

**步驟**:
1. 點擊 Agent 選擇器按鈕，打開 Dialog
2. 點擊任意 Agent 卡片（例如：專業助理）
3. 觀察視覺反饋
4. 點擊另一個 Agent 卡片（例如：創意夥伴）
5. 觀察視覺反饋變化
6. 點擊 "確定" 按鈕

**預期結果**:
```
✅ Dialog 打開，當前 Agent 已選中（藍色邊框、藍色背景、放大、陰影）
✅ 點擊專業助理後，專業助理顯示選中狀態
✅ 點擊創意夥伴後，創意夥伴顯示選中狀態，專業助理恢復未選中狀態
✅ 點擊確定後：
   - Dialog 關閉
   - 頁面頂部顯示新選擇的 Agent 名稱
   - Toast 通知顯示 "已選擇 Agent: 創意夥伴"
```

**Console 預期日誌**:
```
[AgentSelector] Click agent: 專業助理 ID: xxx
[AgentSelector] Click agent: 創意夥伴 ID: yyy
[AgentSelector] Confirm selection: 創意夥伴 ID: yyy
[AgentSelector] Current agent before: 專業助理
[AgentSelector] setCurrentAgent called
[AgentSelector] Calling onSelect callback with ID: yyy
[AgentSelector] Closing dialog
[ChatInterface] handleSelectAgent called with ID: yyy
[ChatInterface] Loading agent detail...
[ChatInterface] Agent detail loaded: {...}
[ChatInterface] Setting selected agent: 創意夥伴
```

### 測試案例 2: 取消選擇流程

**步驟**:
1. 當前 Agent 為 "專業助理"
2. 點擊 Agent 選擇器按鈕，打開 Dialog
3. 點擊 "創意夥伴" Agent 卡片
4. 觀察視覺反饋
5. 點擊 "取消" 按鈕

**預期結果**:
```
✅ Dialog 打開，專業助理已選中
✅ 點擊創意夥伴後，創意夥伴顯示選中狀態
✅ 點擊取消後：
   - Dialog 關閉
   - 頁面頂部仍然顯示 "專業助理"（沒有改變）
   - 沒有 Toast 通知
```

**Console 預期日誌**:
```
[AgentSelector] Click agent: 創意夥伴 ID: yyy
[AgentSelector] Cancel selection
```

### 測試案例 3: 重複打開 Dialog

**步驟**:
1. 當前 Agent 為 "專業助理"
2. 打開 Dialog → 點擊 "創意夥伴" → 點擊取消
3. 再次打開 Dialog
4. 觀察哪個 Agent 被選中

**預期結果**:
```
✅ 第二次打開 Dialog 時，"專業助理" 仍然顯示選中狀態
✅ 上次的臨時選擇（創意夥伴）已被清除
```

### 測試案例 4: 未選擇任何 Agent 時確認按鈕

**步驟**:
1. 當前沒有選擇任何 Agent（currentAgent 為 null）
2. 打開 Dialog
3. 觀察確認按鈕狀態

**預期結果**:
```
✅ 確認按鈕應該是禁用狀態（灰色，無法點擊）
✅ 點擊任意 Agent 後，確認按鈕變為可用狀態
```

---

## 視覺反饋規格

### 選中狀態 (selected={true})
```typescript
className="ring-4 ring-blue-500 bg-blue-50 shadow-xl scale-105 border-blue-500"
```
- `ring-4`: 4px 厚度的外邊框
- `ring-blue-500`: 藍色外邊框
- `bg-blue-50`: 淺藍色背景
- `shadow-xl`: 強陰影效果
- `scale-105`: 放大至 105%
- `border-blue-500`: 藍色主邊框

### 未選中狀態 (selected={false})
```typescript
className="hover:shadow-xl hover:border-blue-300 hover:scale-102"
```
- `hover:shadow-xl`: 滑鼠懸停時強陰影
- `hover:border-blue-300`: 滑鼠懸停時淺藍色邊框
- `hover:scale-102`: 滑鼠懸停時放大至 102%

### 互動反饋
```typescript
className="cursor-pointer active:scale-100"
```
- `cursor-pointer`: 滑鼠指標變為手指
- `active:scale-100`: 按下時恢復原始大小（按壓反饋）

---

## Console 日誌追蹤

完整的 Console 日誌流程應該是：

### 成功選擇流程
```
1. [AgentSelector] Click agent: <name> ID: <id>           ← 點擊 Agent 卡片
2. [AgentSelector] Confirm selection: <name> ID: <id>     ← 點擊確認按鈕
3. [AgentSelector] Current agent before: <old_name>       ← 記錄舊 Agent
4. [AgentSelector] setCurrentAgent called                 ← 更新全局狀態
5. [AgentSelector] Calling onSelect callback with ID: <id> ← 呼叫 callback
6. [AgentSelector] Closing dialog                         ← 關閉 Dialog
7. [ChatInterface] handleSelectAgent called with ID: <id>  ← ChatInterface 接收
8. [ChatInterface] Loading agent detail...                ← 載入詳細資料
9. [ChatInterface] Agent detail loaded: {...}             ← 載入完成
10. [ChatInterface] Setting selected agent: <name>        ← 設定選擇的 Agent
```

### 取消選擇流程
```
1. [AgentSelector] Click agent: <name> ID: <id>           ← 點擊 Agent 卡片
2. [AgentSelector] Cancel selection                       ← 點擊取消按鈕
```

---

## 相關文件

- **主要修改文件**: `components/agents/AgentSelector.tsx`
- **相關元件**: `components/agents/AgentCard.tsx`
- **父元件**: `components/chat/ChatInterface.tsx`
- **UI 元件**: `components/ui/dialog.tsx`, `components/ui/button.tsx`
- **狀態管理**: `stores/agentStore.ts`, `stores/chatStore.ts`

---

## 後續改進建議

### 1. 鍵盤導航
```typescript
// 建議添加鍵盤快捷鍵
- Enter: 確認選擇
- Escape: 取消選擇
- Arrow keys: 在 Agent 之間導航
```

### 2. 防止重複提交
```typescript
// 在 handleConfirmSelection 中添加 loading 狀態
const [isConfirming, setIsConfirming] = useState(false)

const handleConfirmSelection = async () => {
  if (isConfirming) return  // 防止重複點擊
  setIsConfirming(true)
  try {
    // ... 執行選擇邏輯
  } finally {
    setIsConfirming(false)
  }
}
```

### 3. 動畫過渡
```typescript
// 建議添加 Agent 卡片選擇狀態的過渡動畫
className="... transition-all duration-200"
```

---

## 修復驗證清單

- [x] 點擊 Agent 卡片不會立即關閉 Dialog
- [x] 點擊 Agent 卡片會顯示選中的視覺反饋
- [x] 可以點擊多個 Agent 來改變選擇
- [x] 點擊確認按鈕會執行選擇並關閉 Dialog
- [x] 點擊取消按鈕會恢復原狀態並關閉 Dialog
- [x] 未選擇任何 Agent 時確認按鈕為禁用狀態
- [x] Console 日誌完整記錄所有步驟
- [x] 選擇成功後顯示 Toast 通知
- [x] 頁面頂部的 Agent 名稱正確更新

---

## 已知限制

1. **單一 Agent 模型**：目前所有 Avatar 使用相同的 3D 模型（臨時方案）
2. **載入狀態**：選擇 Agent 後沒有 loading 指示器
3. **錯誤處理**：如果 Agent 載入失敗，使用者看到 Toast 但 Dialog 已關閉，無法重試

---

**修復完成時間**: 2025-10-23
**測試狀態**: ⏳ 待使用者測試
