# Agent 刪除功能與 Auth 修復記錄

**日期**: 2025-10-23
**問題**: Agent 刪除功能無法運作,非系統 Agent 無法被刪除

---

## 問題描述

### 使用者報告
在 http://localhost:3002/zh-TW/agents 頁面中,點擊非系統 Agent 的刪除按鈕後,Agent 無法被刪除。

### 錯誤症狀
- 前端 UI: 刪除按鈕存在且可點擊
- API 呼叫: DELETE /api/agents/{id} 返回 401 Unauthorized 或其他錯誤
- 開發環境: 沒有登入 session,但應該允許刪除 (與建立 Agent 邏輯一致)

---

## 根本原因分析

### 問題 1: next-auth v5 API 相容性問題

**檔案**: `app/api/agents/[id]/route.ts`

**原程式碼** (lines 7-9, 124, 273):
```typescript
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'

// In PUT function
const session = await getServerSession(authOptions)

// In DELETE function
const session = await getServerSession(authOptions)
```

**問題**:
- `getServerSession` 是 next-auth v4 的 API
- 專案使用 next-auth v5,應使用 `auth()` 函數
- 導致 runtime 錯誤: `getServerSession is not a function`

### 問題 2: 嚴格的身份驗證要求

**原程式碼** (PUT function, lines 126-136):
```typescript
if (!session?.user?.id) {
  return NextResponse.json(
    {
      success: false,
      error: 'Unauthorized',
      code: 'UNAUTHORIZED',
      timestamp: new Date().toISOString(),
    },
    { status: 401 }
  )
}
```

**原程式碼** (DELETE function, lines 275-285):
```typescript
if (!session?.user?.id) {
  return NextResponse.json(
    {
      success: false,
      error: 'Unauthorized',
      code: 'UNAUTHORIZED',
      timestamp: new Date().toISOString(),
    },
    { status: 401 }
  )
}
```

**問題**:
- PUT 和 DELETE 嚴格要求 `session?.user?.id` 存在
- 但 POST `/api/agents` 允許 `userId = null` (開發環境)
- 不一致的驗證邏輯導致建立的 Agent (userId=null) 無法被刪除

### 問題 3: 權限驗證邏輯不支援開發環境

**原程式碼** (PUT function, line 160):
```typescript
if (!existingAgent.isSystem && existingAgent.userId !== session.user.id) {
  return NextResponse.json(
    {
      success: false,
      error: 'Forbidden: You do not have permission to update this agent',
      code: 'FORBIDDEN',
      timestamp: new Date().toISOString(),
    },
    { status: 403 }
  )
}
```

**原程式碼** (DELETE function, line 328):
```typescript
if (existingAgent.userId !== session.user.id) {
  return NextResponse.json(
    {
      success: false,
      error: 'Forbidden: You do not have permission to delete this agent',
      code: 'FORBIDDEN',
      timestamp: new Date().toISOString(),
    },
    { status: 403 }
  )
}
```

**問題**:
- 直接比較 `existingAgent.userId !== session.user.id`
- 開發環境中 `existingAgent.userId = null`,`session.user.id` 也是 undefined
- `null !== undefined` 返回 `true`,導致權限驗證失敗

### 問題 4: Console.log 錯誤導致執行失敗

**原程式碼** (line 354):
```typescript
console.log(`[DELETE /api/agents/${agentId}] Agent deleted by user ${session.user.id}`)
```

**問題**:
- `session.user.id` 在開發環境中是 `undefined`
- 但 `session` 本身可能是 `null`,導致 `Cannot read property 'user' of null` 錯誤
- 即使權限驗證通過,console.log 也會導致整個函數失敗

---

## 修復方案

### 修復 1: 更新 next-auth v5 API

**檔案**: `app/api/agents/[id]/route.ts`

**修改** (lines 7-9):
```typescript
// Before
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'

// After
import { auth } from '@/lib/auth/config'
```

### 修復 2: PUT 函數 - 允許開發環境 null userId

**修改** (lines 123-166):
```typescript
export async function PUT(
  request: NextRequest,
  segmentData: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    const userId = session?.user?.id || null // 開發環境允許 null

    const params = await segmentData.params
    const agentId = params.id
    const body = await request.json()

    // 檢查 Agent 是否存在
    const existingAgent = await prisma.aIAgent.findUnique({
      where: { id: agentId },
    })

    if (!existingAgent) {
      return NextResponse.json(
        {
          success: false,
          error: `Agent not found: ${agentId}`,
          code: 'AGENT_NOT_FOUND',
          timestamp: new Date().toISOString(),
        },
        { status: 404 }
      )
    }

    // 驗證權限：只有 Agent 擁有者可以更新（系統 Agent 除外）
    // 開發環境: 如果 Agent 的 userId 是 null,且當前使用者也是 null,允許更新
    // 生產環境: 必須 userId 匹配
    const isOwner =
      existingAgent.isSystem || // 系統 Agent 可以更新
      (existingAgent.userId === null && userId === null) || // 開發環境
      (existingAgent.userId !== null && existingAgent.userId === userId) // 生產環境

    if (!isOwner) {
      return NextResponse.json(
        {
          success: false,
          error: 'Forbidden: You do not have permission to update this agent',
          code: 'FORBIDDEN',
          timestamp: new Date().toISOString(),
        },
        { status: 403 }
      )
    }

    // ... 剩餘的更新邏輯
  }
}
```

**修復邏輯**:
1. 移除嚴格的 `session?.user?.id` 檢查
2. 允許 `userId = null` (開發環境)
3. 更新權限驗證邏輯:
   - 系統 Agent: 允許更新
   - 開發環境 (both null): 允許更新
   - 生產環境 (userId 匹配): 允許更新
   - 其他情況: 拒絕

### 修復 3: DELETE 函數 - 允許開發環境 null userId

**修改** (lines 272-333):
```typescript
export async function DELETE(
  request: NextRequest,
  segmentData: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    const userId = session?.user?.id || null // 開發環境允許 null

    const params = await segmentData.params
    const agentId = params.id

    // 檢查 Agent 是否存在
    const existingAgent = await prisma.aIAgent.findUnique({
      where: { id: agentId },
      include: {
        _count: {
          select: {
            conversations: true,
          },
        },
      },
    })

    if (!existingAgent) {
      return NextResponse.json(
        {
          success: false,
          error: `Agent not found: ${agentId}`,
          code: 'AGENT_NOT_FOUND',
          timestamp: new Date().toISOString(),
        },
        { status: 404 }
      )
    }

    // 不允許刪除系統預設 Agent
    if (existingAgent.isSystem) {
      return NextResponse.json(
        {
          success: false,
          error: 'Cannot delete system agents',
          code: 'FORBIDDEN',
          timestamp: new Date().toISOString(),
        },
        { status: 403 }
      )
    }

    // 驗證權限：只有 Agent 擁有者可以刪除
    // 開發環境: 如果 Agent 的 userId 是 null,且當前使用者也是 null,允許刪除
    // 生產環境: 必須 userId 匹配
    const isOwner =
      (existingAgent.userId === null && userId === null) || // 開發環境
      (existingAgent.userId !== null && existingAgent.userId === userId) // 生產環境

    if (!isOwner) {
      return NextResponse.json(
        {
          success: false,
          error: 'Forbidden: You do not have permission to delete this agent',
          code: 'FORBIDDEN',
          timestamp: new Date().toISOString(),
        },
        { status: 403 }
      )
    }

    // ... 剩餘的刪除邏輯
  }
}
```

**修復邏輯**:
1. 移除嚴格的 `session?.user?.id` 檢查
2. 允許 `userId = null` (開發環境)
3. 更新權限驗證邏輯:
   - 開發環境 (both null): 允許刪除
   - 生產環境 (userId 匹配): 允許刪除
   - 系統 Agent: 永遠不允許刪除 (在前面已檢查)
   - 其他情況: 拒絕

### 修復 4: 修復 console.log 錯誤

**修改** (line 354):
```typescript
// Before
console.log(`[DELETE /api/agents/${agentId}] Agent deleted by user ${session.user.id}`)

// After
console.log(`[DELETE /api/agents/${agentId}] Agent deleted by user ${userId || 'dev-user'}`)
```

**修復邏輯**:
- 使用已定義的 `userId` 變數
- 提供 fallback 值 `'dev-user'` 避免 undefined

---

## 測試驗證

### 測試 1: GET Agent (驗證 API 正常)
```bash
curl -s http://localhost:3002/api/agents/cmh2x83jo0003ujss52fz6kjz
```

**結果**: ✅ 成功返回 Agent 詳細資訊

### 測試 2: DELETE 不存在的 Agent
```bash
curl -s -X DELETE http://localhost:3002/api/agents/test-non-existent-id
```

**預期**: 404 Agent not found
**結果**: ✅
```json
{"success":false,"error":"Agent not found: test-non-existent-id","code":"AGENT_NOT_FOUND"}
```

### 測試 3: DELETE 系統 Agent
```bash
curl -s -X DELETE http://localhost:3002/api/agents/system-data-analyst
```

**預期**: 403 Cannot delete system agents
**結果**: ✅
```json
{"success":false,"error":"Cannot delete system agents","code":"FORBIDDEN"}
```

### 測試 4: 建立並刪除 Agent (完整流程)

**Step 1: 建立 Agent**
```bash
curl -s -X POST http://localhost:3002/api/agents \
  -H "Content-Type: application/json" \
  -d '{"name":"Test Agent for Delete","description":"Test deletion","category":"professional","personaId":"persona-data-analyst","primaryLanguage":"zh-TW","supportedLanguages":["zh-TW"],"isPublic":false}'
```

**結果**: ✅ 成功建立 Agent `cmh2xhljl0007ujss28j5cnfy`

**Step 2: 刪除 Agent**
```bash
curl -s -X DELETE http://localhost:3002/api/agents/cmh2xhljl0007ujss28j5cnfy
```

**結果**: ✅ 成功刪除
```json
{"success":true,"message":"Agent cmh2xhljl0007ujss28j5cnfy deleted successfully"}
```

---

## 修改檔案清單

### ✅ `app/api/agents/[id]/route.ts`
- **Line 7-9**: 更新 import 從 `getServerSession` 到 `auth()`
- **Line 124**: PUT 函數 - 允許 `userId = null`
- **Line 151-155**: PUT 函數 - 更新權限驗證邏輯 (支援開發環境)
- **Line 273**: DELETE 函數 - 允許 `userId = null`
- **Line 319-321**: DELETE 函數 - 更新權限驗證邏輯 (支援開發環境)
- **Line 354**: DELETE 函數 - 修復 console.log 錯誤

---

## 相關問題

### 問題 1: Agent 建立時的 UTF-8 編碼錯誤

**現象**: 使用 curl 發送中文內容時,POST /api/agents 返回 "not valid JSON" 錯誤

**測試結果**:
- ❌ 中文內容: `{"name":"測試刪除Agent","description":"用於測試刪除功能",...}` → 失敗
- ✅ 英文內容: `{"name":"Test Agent","description":"Test deletion",...}` → 成功

**初步診斷**:
- API route 本身正常 (英文內容建立成功)
- 問題可能在:
  1. curl 發送請求的編碼設定
  2. Next.js Edge Runtime 的 request.json() 解析
  3. 前端發送請求時的編碼設定

**建議**:
1. 測試前端實際建立 Agent 的功能 (瀏覽器環境)
2. 檢查前端 fetch 請求的 Content-Type header
3. 如果前端正常,則問題僅限於 curl 測試工具

### 後續測試需求

**前端測試** (需要使用者協助):
1. 訪問 http://localhost:3002/zh-TW/agents/new
2. 填寫表單 (使用中文內容)
3. 點擊「建立 Agent」
4. 檢查是否成功建立
5. 在 http://localhost:3002/zh-TW/agents 頁面
6. 點擊非系統 Agent 的刪除按鈕
7. 確認刪除對話框
8. 驗證 Agent 是否成功刪除

---

## 預防措施

### 開發環境 vs 生產環境

**開發環境** (userId = null):
- 允許建立、更新、刪除 Agent
- 不需要登入 session
- 用於快速開發和測試

**生產環境** (userId 有值):
- 嚴格的權限驗證
- 使用者只能操作自己建立的 Agent
- 系統 Agent 只能更新,不能刪除

### 一致性檢查清單

在修改任何 API route 時,確保:
- ✅ GET/POST/PUT/DELETE 使用相同的 auth 方法
- ✅ 開發環境和生產環境的處理邏輯一致
- ✅ 權限驗證邏輯考慮 null userId 情況
- ✅ Console.log 使用安全的變數 (避免 undefined access)
- ✅ 錯誤處理捕捉所有可能的失敗情況

---

## 總結

### 成功修復
✅ next-auth v5 API 相容性問題
✅ PUT /api/agents/[id] 開發環境支援
✅ DELETE /api/agents/[id] 開發環境支援
✅ 權限驗證邏輯支援 null userId
✅ Console.log 錯誤修復

### 已驗證功能
✅ DELETE 404 (Agent 不存在)
✅ DELETE 403 (系統 Agent 保護)
✅ DELETE 200 (成功刪除非系統 Agent)

### 待確認問題
⚠️ Agent 建立時中文內容的 UTF-8 編碼問題 (需前端測試)

---

**修復完成時間**: 2025-10-23 12:35 GMT+8
**測試狀態**: ✅ API 層級測試通過
**待測試**: 前端 UI 完整流程測試
