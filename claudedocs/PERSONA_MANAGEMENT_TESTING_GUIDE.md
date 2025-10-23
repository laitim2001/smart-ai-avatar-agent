# Persona Management System - 完整測試指南

## 📋 測試概覽

本文件提供 Persona 管理系統的完整測試流程，包含 API 測試、UI 測試、整合測試和預期行為驗證。

**測試範圍**:
- ✅ CRUD API 端點
- ✅ UI 元件互動
- ✅ 刪除驗證邏輯
- ✅ Agent-Persona 綁定關係
- ✅ 資料驗證與錯誤處理

---

## 🔧 測試環境準備

### 1. 啟動開發伺服器

```bash
# 確保在專案根目錄
cd C:\smart-ai-avatar-agent

# 啟動開發伺服器
npm run dev

# 伺服器應該在 http://localhost:3002 運行
```

### 2. 檢查資料庫連線

```bash
# 確認 Prisma 連線
npx prisma studio

# 開啟 http://localhost:5555 查看資料庫
# 檢查 Persona 和 AIAgent 表是否存在
```

### 3. 準備測試工具

- **瀏覽器**: Chrome/Edge (建議開啟開發者工具)
- **API 測試**: Postman, Insomnia, 或 curl
- **資料庫**: Prisma Studio (http://localhost:5555)

---

## 🧪 API 端點測試

### Test 1: 建立新 Persona (POST /api/personas)

**請求**:
```bash
curl -X POST http://localhost:3002/api/personas \
  -H "Content-Type: application/json" \
  -d '{
    "name": "技術架構師",
    "role": "Technical Architect",
    "description": "專注於系統設計與架構規劃，擅長微服務、雲端架構和效能優化。提供技術決策建議和最佳實踐指導。",
    "systemPrompt": "你是一位資深技術架構師，擁有 15 年以上的系統設計經驗。你擅長分析業務需求並轉化為可擴展的技術架構，熟悉各種設計模式、微服務架構、雲端技術和效能優化策略。在回答問題時，你會：\n1. 考慮系統的可擴展性、可維護性和效能\n2. 提供多個技術方案並分析優劣\n3. 引用業界最佳實踐和案例\n4. 使用清晰的技術術語，必要時附上圖表說明\n5. 關注長期技術債務和演進路徑",
    "language": "zh-TW",
    "tone": "professional",
    "style": ["analytical", "systematic", "detail-oriented"],
    "capabilities": ["系統設計", "架構規劃", "效能優化", "技術選型", "程式碼審查"],
    "restrictions": ["不討論政治話題", "不提供具體的商業機密資訊"],
    "version": "1.0.0"
  }'
```

**預期回應** (status: 200):
```json
{
  "success": true,
  "data": {
    "id": "cm123abc456",
    "name": "技術架構師",
    "role": "Technical Architect",
    "description": "專注於系統設計與架構規劃...",
    "language": "zh-TW",
    "tone": "professional",
    "version": "1.0.0",
    "createdAt": "2025-10-23T10:30:00.000Z"
  },
  "message": "Persona 已建立",
  "timestamp": "2025-10-23T10:30:00.123Z"
}
```

**驗證點**:
- ✅ status code 為 200
- ✅ success 為 true
- ✅ data 包含完整 Persona 資訊
- ✅ id 已自動生成 (CUID)
- ✅ createdAt 時間戳已設定

**失敗案例測試**:

**1.1 缺少必填欄位**:
```bash
curl -X POST http://localhost:3002/api/personas \
  -H "Content-Type: application/json" \
  -d '{
    "name": "測試",
    "description": "太短"
  }'
```

預期回應 (status: 400):
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "資料驗證失敗",
    "details": {
      "role": { "_errors": ["Required"] },
      "systemPrompt": { "_errors": ["Required"] },
      "description": { "_errors": ["描述至少需要 10 字元"] }
    }
  }
}
```

**1.2 無效的 language**:
```bash
curl -X POST http://localhost:3002/api/personas \
  -H "Content-Type: application/json" \
  -d '{
    "name": "測試",
    "role": "測試",
    "description": "這是一個測試描述至少十個字元",
    "systemPrompt": "這是一個測試的 System Prompt，需要至少一百個字元才能通過驗證。所以我需要寫更多的內容來達到這個要求。讓我繼續寫一些有意義的內容來確保長度足夠。",
    "language": "invalid-lang",
    "tone": "professional"
  }'
```

預期回應 (status: 400):
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "資料驗證失敗",
    "details": {
      "language": { "_errors": ["語言必須是 zh-TW, en 或 ja"] }
    }
  }
}
```

---

### Test 2: 取得所有 Personas (GET /api/personas)

**請求**:
```bash
curl -X GET http://localhost:3002/api/personas
```

**預期回應** (status: 200):
```json
{
  "success": true,
  "data": [
    {
      "id": "cm123abc456",
      "name": "技術架構師",
      "role": "Technical Architect",
      "description": "專注於系統設計與架構規劃...",
      "language": "zh-TW",
      "tone": "professional",
      "capabilities": ["系統設計", "架構規劃", "效能優化"],
      "version": "1.0.0"
    }
  ],
  "total": 1,
  "timestamp": "2025-10-23T10:31:00.123Z"
}
```

**驗證點**:
- ✅ 回傳所有啟用的 Persona (isActive: true)
- ✅ 按照 createdAt 降序排序 (最新的在前)
- ✅ total 欄位正確顯示數量
- ✅ 只包含必要欄位 (不包含 systemPrompt)

---

### Test 3: 取得單一 Persona (GET /api/personas/[id])

**請求**:
```bash
# 替換 {id} 為實際的 Persona ID
curl -X GET http://localhost:3002/api/personas/cm123abc456
```

**預期回應** (status: 200):
```json
{
  "success": true,
  "data": {
    "id": "cm123abc456",
    "name": "技術架構師",
    "role": "Technical Architect",
    "description": "專注於系統設計與架構規劃...",
    "systemPrompt": "你是一位資深技術架構師...",
    "language": "zh-TW",
    "tone": "professional",
    "style": ["analytical", "systematic", "detail-oriented"],
    "capabilities": ["系統設計", "架構規劃", "效能優化"],
    "restrictions": ["不討論政治話題"],
    "version": "1.0.0",
    "isActive": true,
    "createdAt": "2025-10-23T10:30:00.000Z",
    "updatedAt": "2025-10-23T10:30:00.000Z",
    "agents": []
  },
  "timestamp": "2025-10-23T10:32:00.123Z"
}
```

**驗證點**:
- ✅ 包含完整的 Persona 資訊 (含 systemPrompt)
- ✅ 包含關聯的 agents 陣列
- ✅ 包含 createdAt 和 updatedAt 時間戳

**失敗案例測試**:

**3.1 不存在的 ID**:
```bash
curl -X GET http://localhost:3002/api/personas/invalid-id-123
```

預期回應 (status: 404):
```json
{
  "success": false,
  "error": {
    "code": "PERSONA_NOT_FOUND",
    "message": "找不到指定的 Persona"
  }
}
```

---

### Test 4: 更新 Persona (PUT /api/personas/[id])

**請求**:
```bash
curl -X PUT http://localhost:3002/api/personas/cm123abc456 \
  -H "Content-Type: application/json" \
  -d '{
    "name": "技術架構師",
    "role": "Senior Technical Architect",
    "description": "專注於系統設計與架構規劃，擅長微服務、雲端架構和效能優化。提供技術決策建議和最佳實踐指導。",
    "systemPrompt": "你是一位資深技術架構師，擁有 15 年以上的系統設計經驗...",
    "language": "zh-TW",
    "tone": "professional",
    "style": ["analytical", "systematic", "detail-oriented"],
    "capabilities": ["系統設計", "架構規劃", "效能優化", "技術選型", "程式碼審查"],
    "restrictions": ["不討論政治話題"],
    "version": "1.1.0"
  }'
```

**預期回應** (status: 200):
```json
{
  "success": true,
  "data": {
    "id": "cm123abc456",
    "name": "技術架構師",
    "role": "Senior Technical Architect",
    "version": "1.1.0",
    "updatedAt": "2025-10-23T10:35:00.000Z"
  },
  "message": "Persona 已更新",
  "timestamp": "2025-10-23T10:35:00.123Z"
}
```

**驗證點**:
- ✅ role 已從 "Technical Architect" 更新為 "Senior Technical Architect"
- ✅ version 已從 "1.0.0" 更新為 "1.1.0"
- ✅ updatedAt 時間戳已更新

---

### Test 5: 取得 Persona 的關聯 Agents (GET /api/personas/[id]/agents)

**請求**:
```bash
curl -X GET http://localhost:3002/api/personas/cm123abc456/agents
```

**預期回應 (無關聯)** (status: 200):
```json
{
  "success": true,
  "data": [],
  "total": 0,
  "timestamp": "2025-10-23T10:36:00.123Z"
}
```

**預期回應 (有關聯)** (status: 200):
```json
{
  "success": true,
  "data": [
    {
      "id": "agent123",
      "name": "系統架構助手",
      "description": "協助系統架構設計",
      "category": "技術",
      "isActive": true,
      "createdAt": "2025-10-23T09:00:00.000Z"
    }
  ],
  "total": 1,
  "timestamp": "2025-10-23T10:36:00.123Z"
}
```

---

### Test 6: 刪除 Persona (DELETE /api/personas/[id])

**案例 6.1: 刪除沒有關聯 Agent 的 Persona (成功)**

**請求**:
```bash
curl -X DELETE http://localhost:3002/api/personas/cm123abc456
```

**預期回應** (status: 200):
```json
{
  "success": true,
  "message": "Persona 已刪除",
  "timestamp": "2025-10-23T10:37:00.123Z"
}
```

**驗證點**:
- ✅ Persona 已從資料庫中刪除
- ✅ GET /api/personas 不再回傳此 Persona

---

**案例 6.2: 刪除有關聯 Agent 的 Persona (失敗 - 重要！)**

**前置步驟**:
1. 建立一個新的 Persona
2. 建立一個 Agent 並綁定到該 Persona
3. 嘗試刪除該 Persona

**請求**:
```bash
# 假設 Persona ID 為 cm456def789
curl -X DELETE http://localhost:3002/api/personas/cm456def789
```

**預期回應** (status: 400):
```json
{
  "success": false,
  "error": {
    "code": "PERSONA_IN_USE",
    "message": "此 Persona 正被使用，無法刪除",
    "details": {
      "linkedAgents": [
        {
          "id": "agent123",
          "name": "系統架構助手",
          "category": "技術",
          "isActive": true
        }
      ],
      "agentCount": 1
    }
  },
  "timestamp": "2025-10-23T10:38:00.123Z"
}
```

**驗證點**:
- ✅ status code 為 400 (Bad Request)
- ✅ error.code 為 "PERSONA_IN_USE"
- ✅ error.details 包含完整的 linkedAgents 列表
- ✅ Persona 仍然存在於資料庫中 (未被刪除)

---

## 🎨 UI 測試

### Test 7: Persona 列表頁面基本功能

**步驟**:
1. 開啟瀏覽器，前往 `http://localhost:3002/zh-TW/knowledge/persona`
2. 觀察頁面載入

**預期結果**:

**7.1 統計卡片顯示**:
```
┌─────────────────────────┐ ┌─────────────────────────┐
│ 📚 Persona 總數         │ │ 🤖 關聯 Agent 數量       │
│ 3                       │ │ 5                       │
└─────────────────────────┘ └─────────────────────────┘

┌─────────────────────────┐ ┌─────────────────────────┐
│ 🌐 語言種類              │ │ ✅ 啟用數量              │
│ 3                       │ │ 3                       │
└─────────────────────────┘ └─────────────────────────┘
```

**7.2 搜尋與篩選區域**:
- ✅ 顯示搜尋輸入框 (placeholder: "搜尋 Persona 名稱、角色、描述...")
- ✅ 顯示語言篩選下拉選單 (所有語言, 繁體中文, English, 日本語)
- ✅ 顯示狀態篩選下拉選單 (所有狀態, 啟用, 停用)
- ✅ 顯示 "+ 新增 Persona" 按鈕 (藍色)
- ✅ **所有下拉選單背景為白色，不透明**

**7.3 Persona 卡片網格**:
- ✅ 以卡片形式顯示所有 Persona
- ✅ 每張卡片包含:
  - 名稱 (CardTitle)
  - 角色 (text-muted-foreground)
  - 描述 (line-clamp-2, 最多兩行)
  - 語言 Badge (Globe icon)
  - 語氣 Badge
  - 版本 Badge (v1.0.0)
  - 能力標籤 (紫色, 最多顯示 3 個)
  - Agent 數量 (Bot icon)
  - 編輯按鈕 (outline)
  - 刪除按鈕 (destructive)

**7.4 空狀態顯示**:
如果沒有 Persona:
```
┌────────────────────────────────────┐
│        尚未建立任何 Persona         │
│                                    │
│   點擊「新增 Persona」按鈕開始建立  │
└────────────────────────────────────┘
```

---

### Test 8: 建立新 Persona (PersonaForm)

**步驟**:
1. 點擊 "+ 新增 Persona" 按鈕
2. 觀察對話框開啟

**預期結果**:

**8.1 對話框結構**:
- ✅ 標題: "建立新 Persona"
- ✅ 4 個分頁標籤:
  - 基本資訊 (預設選中)
  - System Prompt
  - 特徵配置
  - 版本與狀態

**8.2 Tab 1: 基本資訊**:
- ✅ 名稱輸入框 (必填, placeholder: "例如：技術架構師")
- ✅ 角色輸入框 (必填, placeholder: "例如：Technical Architect")
- ✅ 描述文字區域 (必填, min 10 字元, placeholder: "詳細描述此 Persona 的專長...")
- ✅ 語言選擇下拉選單 (必填, 預設: 繁體中文)
  - **驗證背景為白色**
- ✅ 語氣選擇下拉選單 (必填, 預設: 專業)
  - **驗證背景為白色**

**8.3 Tab 2: System Prompt**:
- ✅ 大型文字區域 (min-h-[300px])
- ✅ 字元計數顯示 (右下角, "已輸入 XXX 字元")
- ✅ 最少 100 字元驗證
- ✅ Placeholder 提供撰寫提示
- ✅ 顯示撰寫提示框 (藍色背景)

**8.4 Tab 3: 特徵配置**:
- ✅ 3 個標籤管理區域:
  - 風格標籤 (style)
  - 能力標籤 (capabilities)
  - 限制標籤 (restrictions)
- ✅ 每個區域包含:
  - 輸入框
  - "+" 新增按鈕
  - 已新增標籤列表 (帶 X 刪除按鈕)
- ✅ 按下 Enter 鍵可新增標籤
- ✅ 標籤樣式:
  - style: 藍色 (bg-blue-100 text-blue-800)
  - capabilities: 綠色 (bg-green-100 text-green-800)
  - restrictions: 紅色 (bg-red-100 text-red-800)

**8.5 Tab 4: 版本與狀態**:
- ✅ 版本號輸入框 (預設: "1.0.0")
- ✅ Semantic Versioning 格式驗證 (X.Y.Z)
- ✅ 版本控制說明框 (灰色背景)
- ✅ 啟用狀態開關 (Switch, 預設: 開啟)

**8.6 表單操作**:
- ✅ "取消" 按鈕 (關閉對話框)
- ✅ "建立 Persona" 按鈕 (提交表單)

**測試案例**:

**8.7 驗證錯誤測試**:
1. 留空名稱欄位，點擊 "建立 Persona"
   - 預期: 顯示錯誤訊息 "請填寫 Persona 名稱"
2. 輸入少於 10 字元的描述
   - 預期: 顯示錯誤訊息 "描述至少需要 10 字元"
3. 輸入少於 100 字元的 System Prompt
   - 預期: 顯示錯誤訊息 "System Prompt 至少需要 100 字元"
4. 輸入無效的版本號 (例如: "v1.0")
   - 預期: 顯示錯誤訊息 "版本號格式錯誤，請使用 X.Y.Z 格式"

**8.8 成功建立測試**:
1. 填寫所有必填欄位 (名稱、角色、描述、systemPrompt)
2. 選擇語言和語氣
3. 新增幾個能力標籤
4. 設定版本號為 "1.0.0"
5. 點擊 "建立 Persona"

預期結果:
- ✅ 顯示成功訊息: "Persona 已建立" (toast)
- ✅ 對話框關閉
- ✅ Persona 列表自動重新載入
- ✅ 新的 Persona 卡片顯示在列表頂部

---

### Test 9: 編輯 Persona

**步驟**:
1. 在 Persona 卡片上點擊 "編輯" 按鈕
2. 觀察對話框開啟

**預期結果**:

**9.1 表單載入**:
- ✅ 標題: "編輯 Persona"
- ✅ 所有欄位已預填充現有資料
- ✅ 標籤陣列正確顯示
- ✅ 開關狀態正確反映 isActive

**9.2 修改測試**:
1. 修改角色為 "Senior Technical Architect"
2. 修改版本號為 "1.1.0"
3. 新增一個能力標籤
4. 點擊 "儲存變更" 按鈕

預期結果:
- ✅ 顯示成功訊息: "Persona 已更新" (toast)
- ✅ 對話框關閉
- ✅ Persona 卡片顯示更新後的資訊
- ✅ 版本號顯示為 "v1.1.0"

---

### Test 10: 搜尋與篩選功能

**測試案例**:

**10.1 搜尋測試**:
1. 在搜尋框輸入 "架構師"
2. 觀察列表變化

預期結果:
- ✅ 只顯示名稱、角色或描述包含 "架構師" 的 Persona
- ✅ 不符合的卡片隱藏
- ✅ 統計卡片數量不變 (顯示總數，不是篩選後的數量)

**10.2 語言篩選測試**:
1. 選擇語言篩選: "繁體中文"
2. 觀察列表變化

預期結果:
- ✅ 只顯示 language 為 "zh-TW" 的 Persona
- ✅ 其他語言的 Persona 隱藏
- ✅ **下拉選單背景為白色**

**10.3 狀態篩選測試**:
1. 選擇狀態篩選: "停用"
2. 觀察列表變化

預期結果:
- ✅ 只顯示 isActive 為 false 的 Persona
- ✅ 啟用的 Persona 隱藏
- ✅ **下拉選單背景為白色**

**10.4 組合篩選測試**:
1. 搜尋: "顧問"
2. 語言: "繁體中文"
3. 狀態: "啟用"

預期結果:
- ✅ 只顯示同時符合三個條件的 Persona
- ✅ 如果沒有結果，顯示空狀態訊息

---

### Test 11: 刪除 Persona (關鍵測試！)

**案例 11.1: 刪除沒有關聯 Agent 的 Persona (成功)**

**前置條件**:
- 確保該 Persona 沒有被任何 Agent 使用

**步驟**:
1. 點擊 Persona 卡片上的 "刪除" 按鈕 (紅色)
2. 觀察刪除按鈕狀態: 應該是**啟用**的

**預期結果**:

**11.1.1 確認對話框顯示**:
```
┌─────────────────────────────────────┐
│ ⚠️  確認刪除                         │
├─────────────────────────────────────┤
│ 確定要刪除 Persona "技術架構師" 嗎？ │
│                                     │
│ 此操作無法復原。                     │
│                                     │
│  [取消]    [確認刪除]               │
└─────────────────────────────────────┘
```

**11.1.2 點擊 "確認刪除"**:
- ✅ 顯示成功訊息: "Persona 已刪除" (toast)
- ✅ 對話框關閉
- ✅ Persona 卡片從列表中移除
- ✅ 統計卡片數量更新 (Persona 總數 -1)

---

**案例 11.2: 刪除有關聯 Agent 的 Persona (失敗 - 最重要的測試！)**

**前置條件**:
1. 建立一個新的 Persona (例如: "商務顧問")
2. 前往 Agent Market 頁面 (`/agents`)
3. 建立一個新的 Agent，選擇剛才建立的 Persona
4. 回到 Persona 列表頁面

**步驟**:
1. 找到該 Persona 的卡片
2. 觀察卡片底部的 "🤖 X 個 Agent" 顯示 (應該顯示 "1 個 Agent" 或更多)
3. 觀察 "刪除" 按鈕狀態

**預期結果**:

**11.2.1 刪除按鈕狀態**:
- ✅ 刪除按鈕應該是**禁用**狀態 (灰色, 無法點擊)
- ✅ 滑鼠懸停在按鈕上時，顯示 tooltip: "此 Persona 被 X 個 Agent 使用，無法刪除"

**11.2.2 嘗試點擊刪除按鈕**:
- ✅ 按鈕無反應 (因為 disabled)
- ✅ 不會開啟任何對話框

**重要**: 如果刪除按鈕仍然可以點擊，這是一個嚴重的 BUG！

---

**案例 11.3: 刪除有關聯 Agent 的 Persona - 後端驗證測試**

**目的**: 測試即使前端驗證被繞過，後端 API 仍能阻止刪除

**步驟**:
1. 使用 curl 或 Postman 直接呼叫 DELETE API
2. 提供一個有關聯 Agent 的 Persona ID

```bash
curl -X DELETE http://localhost:3002/api/personas/cm456def789
```

**預期結果** (status: 400):
```json
{
  "success": false,
  "error": {
    "code": "PERSONA_IN_USE",
    "message": "此 Persona 正被使用，無法刪除",
    "details": {
      "linkedAgents": [
        {
          "id": "agent123",
          "name": "商務助手",
          "category": "商務",
          "isActive": true
        }
      ],
      "agentCount": 1
    }
  }
}
```

**驗證點**:
- ✅ API 回傳 400 錯誤
- ✅ error.code 為 "PERSONA_IN_USE"
- ✅ error.details 包含完整的 linkedAgents 列表
- ✅ Persona 仍然存在於資料庫中

---

### Test 12: AgentEditor 整合測試

**步驟**:
1. 前往 Agent Market 頁面 (`http://localhost:3002/zh-TW/agents`)
2. 點擊 "+ 新增 Agent" 按鈕 或 編輯現有 Agent
3. 觀察 Persona 選擇區域

**預期結果**:

**12.1 Persona 下拉選單載入**:
- ✅ 對話框開啟時，自動載入 Persona 列表
- ✅ 顯示載入狀態: "載入 Persona 列表..." (0.5-1 秒)
- ✅ 載入完成後，顯示 Persona 選擇下拉選單
- ✅ **下拉選單背景為白色，不透明**

**12.2 Persona 選項顯示**:
每個選項包含兩行:
```
技術架構師
Technical Architect • zh-TW
```

**驗證點**:
- ✅ 第一行: Persona 名稱 (font-medium)
- ✅ 第二行: 角色 • 語言 (text-xs text-gray-500)
- ✅ 選項不再是硬編碼的 "CDO 商務顧問" 和 "技術顧問"

**12.3 選擇 Persona**:
1. 點擊下拉選單
2. 選擇一個 Persona (例如: "技術架構師")

預期結果:
- ✅ 下拉選單顯示選中的 Persona 名稱
- ✅ 藍色資訊框顯示選中 Persona 的詳細資訊:
  ```
  已選擇 Persona：技術架構師
  角色：Technical Architect
  語言：繁體中文 | 語氣：專業
  ```

**12.4 儲存 Agent**:
1. 填寫 Agent 的其他必填欄位
2. 點擊 "建立 Agent" 或 "儲存變更"

預期結果:
- ✅ Agent 成功建立/更新
- ✅ personaId 欄位正確儲存到資料庫
- ✅ Agent 卡片顯示在列表中

---

## 🔄 整合測試流程

### Test 13: 完整 Persona → Agent → Delete 工作流程

**目的**: 測試完整的 CRUD 生命週期和刪除驗證

**步驟**:

**13.1 建立 Persona**:
1. 前往 `/knowledge/persona`
2. 點擊 "+ 新增 Persona"
3. 填寫表單:
   - 名稱: "測試 Persona"
   - 角色: "Test Role"
   - 描述: "這是一個測試用的 Persona 描述至少十個字元"
   - System Prompt: (至少 100 字元)
   - 語言: 繁體中文
   - 語氣: 友善
4. 建立成功

**驗證點**:
- ✅ Persona 卡片顯示在列表中
- ✅ "🤖 0 個 Agent" 顯示
- ✅ 刪除按鈕是**啟用**的

---

**13.2 建立 Agent 並綁定 Persona**:
1. 前往 `/agents`
2. 點擊 "+ 新增 Agent"
3. 填寫表單:
   - 名稱: "測試 Agent"
   - 描述: "測試用 Agent"
   - 類別: 選擇一個類別
   - **Persona: 選擇 "測試 Persona"**
4. 建立成功

**驗證點**:
- ✅ Agent 卡片顯示在列表中
- ✅ 可以在 Agent 詳情中看到綁定的 Persona

---

**13.3 回到 Persona 列表，驗證關聯**:
1. 回到 `/knowledge/persona`
2. 找到 "測試 Persona" 卡片

**預期變化**:
- ✅ "🤖 1 個 Agent" 顯示 (從 0 更新為 1)
- ✅ 刪除按鈕變為**禁用**狀態 (灰色)
- ✅ 滑鼠懸停顯示: "此 Persona 被 1 個 Agent 使用，無法刪除"

---

**13.4 嘗試刪除有關聯的 Persona**:
1. 點擊刪除按鈕

**預期結果**:
- ✅ 按鈕無反應 (因為 disabled)
- ✅ 不會開啟任何對話框

---

**13.5 刪除 Agent**:
1. 回到 `/agents`
2. 找到 "測試 Agent"
3. 點擊刪除按鈕
4. 確認刪除

**驗證點**:
- ✅ Agent 從列表中移除
- ✅ 刪除成功訊息顯示

---

**13.6 回到 Persona 列表，驗證解除關聯**:
1. 回到 `/knowledge/persona`
2. 找到 "測試 Persona" 卡片

**預期變化**:
- ✅ "🤖 0 個 Agent" 顯示 (從 1 更新回 0)
- ✅ 刪除按鈕變為**啟用**狀態 (紅色)
- ✅ 可以正常點擊

---

**13.7 成功刪除 Persona**:
1. 點擊刪除按鈕
2. 確認對話框顯示
3. 點擊 "確認刪除"

**預期結果**:
- ✅ 刪除成功訊息顯示
- ✅ "測試 Persona" 卡片從列表中移除
- ✅ 統計卡片數量更新

---

## 📊 預期行為總結

### Console 日誌檢查

在測試過程中，開啟瀏覽器開發者工具 (F12)，檢查 Console 是否有以下日誌:

**正常情況**:
```
[PersonaPage] 載入 Personas 中...
[PersonaPage] 成功載入 3 個 Personas
[PersonaPage] 統計資料: {totalPersonas: 3, totalLinkedAgents: 2, languages: 2, activePersonas: 3}

[AgentEditor] 載入 Personas...
[AgentEditor] 成功載入 3 個 Personas
```

**錯誤情況**:
```
❌ [PersonaPage Error] 載入 Personas 失敗: NetworkError
❌ [API Error] POST /api/personas: Validation failed
❌ [API Error] DELETE /api/personas/cm123: PERSONA_IN_USE
```

---

### 視覺指標檢查

**成功狀態**:
- ✅ Toast 通知: 綠色背景, 白色文字, ✓ 圖示
- ✅ 啟用 Badge: 藍色背景, 白色文字, CheckCircle 圖示
- ✅ 按鈕 hover: 邊框顏色變化, 陰影增強

**錯誤狀態**:
- ❌ Toast 通知: 紅色背景, 白色文字, ✗ 圖示
- ❌ 停用 Badge: 灰色背景, 灰色文字, XCircle 圖示
- ❌ 禁用按鈕: 灰色, 無 hover 效果, cursor: not-allowed

**載入狀態**:
- ⏳ Spinner 動畫
- ⏳ 按鈕顯示 "載入中..." 或 Spinner
- ⏳ 骨架屏 (如果實作)

---

### 效能指標

**頁面載入**:
- ✅ 初始載入時間: < 1 秒
- ✅ Persona 列表載入: < 500ms (10 個以內)
- ✅ 統計資料計算: < 100ms

**互動回應**:
- ✅ 搜尋篩選: 即時反應 (< 100ms)
- ✅ 對話框開啟: < 200ms
- ✅ 表單提交: < 1 秒

**API 回應時間**:
- ✅ GET /api/personas: < 300ms
- ✅ POST /api/personas: < 500ms
- ✅ PUT /api/personas/[id]: < 500ms
- ✅ DELETE /api/personas/[id]: < 300ms

---

## ⚠️ 常見問題與解決方案

### Issue 1: Selection 背景透明

**症狀**: 下拉選單選項背景是透明的，無法看清文字

**檢查點**:
```typescript
// 確認 SelectTrigger 有 bg-white
<SelectTrigger className="bg-white">

// 確認 SelectContent 有 bg-white
<SelectContent className="bg-white">
```

**位置**:
- `components/knowledge/PersonaForm.tsx`: Line 280, 283, 294, 297
- `app/[locale]/(dashboard)/knowledge/persona/page.tsx`: Line 310, 313, 322, 325
- `components/agents/AgentEditor.tsx`: Line 425, 428

---

### Issue 2: 刪除按鈕沒有正確禁用

**症狀**: 即使 Persona 有關聯 Agent，刪除按鈕仍可點擊

**檢查點**:
```typescript
// PersonaCard.tsx
const agentCount = persona._count?.agents || persona.agents?.length || 0
const hasLinkedAgents = agentCount > 0

// 刪除按鈕
<Button
  variant="destructive"
  onClick={() => onDelete(persona)}
  disabled={hasLinkedAgents}  // 重要！
  title={hasLinkedAgents ? `此 Persona 被 ${agentCount} 個 Agent 使用，無法刪除` : ''}
>
```

**驗證**:
- 在 Persona 列表頁面，檢查 `personas` state 是否包含 `_count.agents` 或 `agents` 陣列
- 確認 `loadPersonas()` 函數有呼叫 `/api/personas/[id]/agents` 來取得關聯數量

---

### Issue 3: AgentEditor 顯示舊的硬編碼 Persona

**症狀**: Persona 下拉選單仍顯示 "CDO 商務顧問" 和 "技術顧問"

**解決方案**:
確認 `components/agents/AgentEditor.tsx` 已更新:
```typescript
// 應該看到這些
const [availablePersonas, setAvailablePersonas] = useState<Persona[]>([])
const loadPersonas = async () => { /* ... */ }

// 不應該看到這些 (舊的硬編碼)
<SelectItem value="commercial-advisor">CDO 商務顧問</SelectItem>
<SelectItem value="technical-advisor">技術顧問</SelectItem>
```

---

### Issue 4: Toast 通知沒有顯示

**症狀**: 操作成功/失敗後，沒有顯示通知訊息

**檢查點**:
1. 確認 `app/layout.tsx` 有包含 `<Toaster />`:
```typescript
import { Toaster } from 'sonner'

export default function RootLayout() {
  return (
    <html>
      <body>
        {children}
        <Toaster />  {/* 重要！ */}
      </body>
    </html>
  )
}
```

2. 確認有正確導入 `toast`:
```typescript
import { toast } from 'sonner'

// 使用
toast.success('操作成功')
toast.error('操作失敗')
```

---

## ✅ 測試完成檢查清單

完成所有測試後，確認以下項目:

### API 測試
- [ ] POST /api/personas - 建立成功
- [ ] POST /api/personas - 驗證失敗 (缺少欄位)
- [ ] GET /api/personas - 取得列表
- [ ] GET /api/personas/[id] - 取得單一 Persona
- [ ] GET /api/personas/[id] - 404 錯誤 (不存在的 ID)
- [ ] PUT /api/personas/[id] - 更新成功
- [ ] DELETE /api/personas/[id] - 刪除成功 (無關聯)
- [ ] DELETE /api/personas/[id] - 刪除失敗 (有關聯)
- [ ] GET /api/personas/[id]/agents - 取得關聯 Agents

### UI 功能測試
- [ ] Persona 列表頁面正確顯示
- [ ] 統計卡片正確計算
- [ ] 搜尋功能運作正常
- [ ] 語言篩選運作正常
- [ ] 狀態篩選運作正常
- [ ] 新增 Persona 表單運作正常
- [ ] 編輯 Persona 表單運作正常
- [ ] 刪除 Persona (無關聯) 運作正常
- [ ] 刪除按鈕正確禁用 (有關聯)
- [ ] AgentEditor Persona 選擇運作正常

### 視覺測試
- [ ] 所有 Selection 背景為白色，不透明
- [ ] 按鈕 hover 效果正常
- [ ] Toast 通知正常顯示
- [ ] 載入狀態正確顯示
- [ ] 空狀態正確顯示

### 整合測試
- [ ] 完整工作流程: 建立 Persona → 建立 Agent → 刪除驗證 → 刪除 Agent → 刪除 Persona

---

## 📝 測試報告範本

測試完成後，可以使用以下範本記錄結果:

```markdown
# Persona Management System 測試報告

**測試日期**: 2025-10-23
**測試人員**: [Your Name]
**測試環境**: Windows 11, Chrome 120, Node.js 20.x

## 測試結果總覽

- ✅ 通過: XX 項
- ❌ 失敗: XX 項
- ⚠️ 部分通過: XX 項

## API 測試結果

| 端點 | 狀態 | 備註 |
|------|------|------|
| POST /api/personas | ✅ | 建立成功 |
| GET /api/personas | ✅ | 回傳 3 個 Personas |
| DELETE /api/personas/[id] (有關聯) | ✅ | 正確阻止刪除 |

## UI 測試結果

| 功能 | 狀態 | 備註 |
|------|------|------|
| Persona 列表顯示 | ✅ | 卡片正確渲染 |
| Selection 背景 | ✅ | 所有下拉選單背景為白色 |
| 刪除按鈕禁用 | ✅ | 有關聯時正確禁用 |

## 發現的問題

1. **[問題描述]**
   - 嚴重程度: 高/中/低
   - 重現步驟: [...]
   - 預期行為: [...]
   - 實際行為: [...]

## 建議改進

1. [改進建議 1]
2. [改進建議 2]
```

---

## 🎯 總結

本測試指南涵蓋了 Persona 管理系統的所有關鍵功能:

1. **完整的 CRUD 操作**: 建立、讀取、更新、刪除
2. **刪除驗證邏輯**: 前端 + 後端雙重保護
3. **Agent-Persona 綁定關係**: 外鍵約束正確運作
4. **UI 互動體驗**: 搜尋、篩選、表單驗證
5. **視覺品質**: Selection 背景、按鈕狀態、通知訊息

請依照本指南逐項測試，確保系統運作正常。如有任何問題，請參考「常見問題與解決方案」章節。

**重要提醒**: 刪除驗證邏輯是最關鍵的測試項目！必須確保有關聯 Agent 的 Persona 無法被刪除。
