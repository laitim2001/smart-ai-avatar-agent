# Conversations API 文件

**Sprint 6 Phase 2**: 對話歷史 API 完整參考

## API 總覽

| 端點 | 方法 | 用途 | 認證 |
|-----|------|------|------|
| `/api/conversations` | POST | 建立新對話 | ✅ 必須 |
| `/api/conversations` | GET | 取得對話列表 | ✅ 必須 |
| `/api/conversations/[id]` | GET | 取得對話詳情 | ✅ 必須 |
| `/api/conversations/[id]` | PATCH | 更新對話標題 | ✅ 必須 |
| `/api/conversations/[id]` | DELETE | 刪除對話 | ✅ 必須 |
| `/api/conversations/[id]/messages` | POST | 新增訊息 | ✅ 必須 |

---

## 1. POST /api/conversations

建立新對話

### 請求

**Headers**:
```
Content-Type: application/json
Cookie: authjs.session-token=<token>
```

**Body** (JSON):
```json
{
  "title": "我的對話標題",  // 選填，預設為 "新對話"
  "avatarId": "avatar-id"   // 選填，對話中使用的 Avatar ID
}
```

### 回應

**成功 (200 OK)**:
```json
{
  "success": true,
  "conversation": {
    "id": "clv1234567890",
    "userId": "user123",
    "title": "我的對話標題",
    "avatarId": "avatar-id",
    "createdAt": "2025-10-17T06:00:00.000Z",
    "updatedAt": "2025-10-17T06:00:00.000Z",
    "messages": []
  }
}
```

**錯誤回應**:
- `401 Unauthorized`: 未登入
- `404 Not Found`: 使用者不存在
- `400 Bad Request`: 請求格式錯誤
- `500 Internal Server Error`: 伺服器錯誤

### 範例

```typescript
// React 使用範例
async function createConversation(title?: string) {
  const response = await fetch('/api/conversations', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title }),
  })

  if (!response.ok) {
    throw new Error('建立對話失敗')
  }

  return await response.json()
}
```

---

## 2. GET /api/conversations

取得使用者的對話列表（支援分頁）

### 請求

**Headers**:
```
Cookie: authjs.session-token=<token>
```

**Query Parameters**:
```
?page=1         // 頁碼（預設 1）
&pageSize=20    // 每頁數量（預設 20）
```

### 回應

**成功 (200 OK)**:
```json
{
  "success": true,
  "conversations": [
    {
      "id": "clv1234567890",
      "userId": "user123",
      "title": "對話 1",
      "avatarId": "avatar-id",
      "createdAt": "2025-10-17T06:00:00.000Z",
      "updatedAt": "2025-10-17T06:00:00.000Z",
      "messages": [
        {
          "id": "msg1",
          "conversationId": "clv1234567890",
          "role": "user",
          "content": "Hello",
          "timestamp": "2025-10-17T06:00:00.000Z"
        }
      ],
      "_count": {
        "messages": 5
      }
    }
  ],
  "pagination": {
    "page": 1,
    "pageSize": 20,
    "total": 50,
    "totalPages": 3
  }
}
```

**錯誤回應**:
- `401 Unauthorized`: 未登入
- `404 Not Found`: 使用者不存在
- `500 Internal Server Error`: 伺服器錯誤

### 範例

```typescript
// React 使用範例 (with pagination)
async function getConversations(page = 1, pageSize = 20) {
  const response = await fetch(
    `/api/conversations?page=${page}&pageSize=${pageSize}`
  )

  if (!response.ok) {
    throw new Error('取得對話列表失敗')
  }

  return await response.json()
}
```

---

## 3. GET /api/conversations/[id]

取得對話詳情（含所有訊息）

### 請求

**Headers**:
```
Cookie: authjs.session-token=<token>
```

**Path Parameters**:
```
id: string  // 對話 ID
```

### 回應

**成功 (200 OK)**:
```json
{
  "success": true,
  "conversation": {
    "id": "clv1234567890",
    "userId": "user123",
    "title": "我的對話",
    "avatarId": "avatar-id",
    "createdAt": "2025-10-17T06:00:00.000Z",
    "updatedAt": "2025-10-17T06:00:00.000Z",
    "messages": [
      {
        "id": "msg1",
        "conversationId": "clv1234567890",
        "role": "user",
        "content": "Hello",
        "timestamp": "2025-10-17T06:00:00.000Z"
      },
      {
        "id": "msg2",
        "conversationId": "clv1234567890",
        "role": "assistant",
        "content": "Hi! How can I help you?",
        "timestamp": "2025-10-17T06:00:01.000Z"
      }
    ]
  }
}
```

**錯誤回應**:
- `401 Unauthorized`: 未登入
- `404 Not Found`: 對話不存在或無權限存取
- `500 Internal Server Error`: 伺服器錯誤

### 範例

```typescript
// React 使用範例
async function getConversation(id: string) {
  const response = await fetch(`/api/conversations/${id}`)

  if (!response.ok) {
    throw new Error('取得對話詳情失敗')
  }

  return await response.json()
}
```

---

## 4. PATCH /api/conversations/[id]

更新對話標題

### 請求

**Headers**:
```
Content-Type: application/json
Cookie: authjs.session-token=<token>
```

**Path Parameters**:
```
id: string  // 對話 ID
```

**Body** (JSON):
```json
{
  "title": "更新後的標題"  // 必填，長度 1-100 字元
}
```

### 回應

**成功 (200 OK)**:
```json
{
  "success": true,
  "conversation": {
    "id": "clv1234567890",
    "userId": "user123",
    "title": "更新後的標題",
    "avatarId": "avatar-id",
    "createdAt": "2025-10-17T06:00:00.000Z",
    "updatedAt": "2025-10-17T06:05:00.000Z",
    "messages": [...]
  }
}
```

**錯誤回應**:
- `401 Unauthorized`: 未登入
- `404 Not Found`: 對話不存在或無權限存取
- `400 Bad Request`: 標題格式錯誤（空或過長）
- `500 Internal Server Error`: 伺服器錯誤

### 範例

```typescript
// React 使用範例
async function updateConversationTitle(id: string, title: string) {
  const response = await fetch(`/api/conversations/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title }),
  })

  if (!response.ok) {
    throw new Error('更新對話標題失敗')
  }

  return await response.json()
}
```

---

## 5. DELETE /api/conversations/[id]

刪除對話（及所有訊息）

### 請求

**Headers**:
```
Cookie: authjs.session-token=<token>
```

**Path Parameters**:
```
id: string  // 對話 ID
```

### 回應

**成功 (200 OK)**:
```json
{
  "success": true,
  "message": "對話已刪除"
}
```

**錯誤回應**:
- `401 Unauthorized`: 未登入
- `404 Not Found`: 對話不存在或無權限存取
- `500 Internal Server Error`: 伺服器錯誤

### 範例

```typescript
// React 使用範例
async function deleteConversation(id: string) {
  const response = await fetch(`/api/conversations/${id}`, {
    method: 'DELETE',
  })

  if (!response.ok) {
    throw new Error('刪除對話失敗')
  }

  return await response.json()
}
```

---

## 6. POST /api/conversations/[id]/messages

新增訊息到對話

### 請求

**Headers**:
```
Content-Type: application/json
Cookie: authjs.session-token=<token>
```

**Path Parameters**:
```
id: string  // 對話 ID
```

**Body** (JSON):
```json
{
  "role": "user",           // 必填，"user" 或 "assistant"
  "content": "訊息內容"      // 必填，不能為空
}
```

### 回應

**成功 (200 OK)**:
```json
{
  "success": true,
  "message": {
    "id": "msg123",
    "conversationId": "clv1234567890",
    "role": "user",
    "content": "訊息內容",
    "timestamp": "2025-10-17T06:10:00.000Z"
  }
}
```

**錯誤回應**:
- `401 Unauthorized`: 未登入
- `404 Not Found`: 對話不存在或無權限存取
- `400 Bad Request`: 請求格式錯誤（role 不正確或 content 為空）
- `500 Internal Server Error`: 伺服器錯誤

### 範例

```typescript
// React 使用範例
async function addMessage(conversationId: string, role: 'user' | 'assistant', content: string) {
  const response = await fetch(`/api/conversations/${conversationId}/messages`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ role, content }),
  })

  if (!response.ok) {
    throw new Error('新增訊息失敗')
  }

  return await response.json()
}
```

---

## 資料模型

### Conversation (對話)

```typescript
interface Conversation {
  id: string              // 唯一識別碼 (cuid)
  userId: string          // 所屬使用者 ID
  title: string           // 對話標題（預設 "新對話"）
  avatarId?: string       // 使用的 Avatar ID（選填）
  createdAt: Date         // 建立時間
  updatedAt: Date         // 最後更新時間
  messages: Message[]     // 對話訊息陣列
}
```

### Message (訊息)

```typescript
interface Message {
  id: string              // 唯一識別碼 (cuid)
  conversationId: string  // 所屬對話 ID
  role: 'user' | 'assistant'  // 訊息角色
  content: string         // 訊息內容
  timestamp: Date         // 訊息時間戳記
}
```

---

## 完整使用流程範例

### React Hook 範例

```typescript
// hooks/useConversations.ts
import { useState, useEffect } from 'react'

export function useConversations() {
  const [conversations, setConversations] = useState([])
  const [isLoading, setIsLoading] = useState(false)

  // 1. 載入對話列表
  const loadConversations = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/conversations')
      const data = await response.json()
      setConversations(data.conversations)
    } finally {
      setIsLoading(false)
    }
  }

  // 2. 建立新對話
  const createConversation = async (title?: string) => {
    const response = await fetch('/api/conversations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title }),
    })
    const data = await response.json()

    // 更新本地狀態
    setConversations(prev => [data.conversation, ...prev])

    return data.conversation
  }

  // 3. 刪除對話
  const deleteConversation = async (id: string) => {
    await fetch(`/api/conversations/${id}`, {
      method: 'DELETE',
    })

    // 更新本地狀態
    setConversations(prev => prev.filter(conv => conv.id !== id))
  }

  // 4. 新增訊息
  const addMessage = async (conversationId: string, role: string, content: string) => {
    const response = await fetch(`/api/conversations/${conversationId}/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role, content }),
    })
    return await response.json()
  }

  useEffect(() => {
    loadConversations()
  }, [])

  return {
    conversations,
    isLoading,
    createConversation,
    deleteConversation,
    addMessage,
    reload: loadConversations,
  }
}
```

### 使用範例

```typescript
// components/ConversationList.tsx
import { useConversations } from '@/hooks/useConversations'

export function ConversationList() {
  const { conversations, createConversation, deleteConversation, isLoading } = useConversations()

  const handleCreate = async () => {
    const conv = await createConversation('新對話')
    console.log('已建立:', conv.id)
  }

  const handleDelete = async (id: string) => {
    if (confirm('確定要刪除此對話？')) {
      await deleteConversation(id)
    }
  }

  if (isLoading) return <div>載入中...</div>

  return (
    <div>
      <button onClick={handleCreate}>建立新對話</button>
      {conversations.map(conv => (
        <div key={conv.id}>
          <h3>{conv.title}</h3>
          <p>{conv._count.messages} 則訊息</p>
          <button onClick={() => handleDelete(conv.id)}>刪除</button>
        </div>
      ))}
    </div>
  )
}
```

---

## 安全性說明

1. **認證檢查**: 所有 API 都需要有效的 session token
2. **權限驗證**: 使用者只能存取自己的對話
3. **輸入驗證**: 使用 Zod schema 驗證所有輸入
4. **Cascade 刪除**: 刪除對話時會自動刪除所有訊息
5. **CSRF 保護**: NextAuth.js 內建 CSRF token

---

## 效能優化建議

1. **分頁載入**: 使用 `page` 和 `pageSize` 參數避免一次載入過多資料
2. **訊息預覽**: 列表 API 只返回第一則訊息作為預覽
3. **索引優化**: `userId + createdAt` 複合索引加速列表查詢
4. **快取策略**: 考慮使用 SWR 或 React Query 快取對話列表

---

## 錯誤處理

```typescript
// 統一錯誤處理範例
async function handleApiCall(apiCall: () => Promise<Response>) {
  try {
    const response = await apiCall()
    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || '請求失敗')
    }

    return data
  } catch (error) {
    console.error('API Error:', error)
    throw error
  }
}

// 使用範例
try {
  const data = await handleApiCall(() =>
    fetch('/api/conversations', { method: 'POST', ... })
  )
  console.log('Success:', data)
} catch (error) {
  alert(error.message)
}
```

---

**Last Updated**: 2025-10-17
**Sprint**: Sprint 6 Phase 2
**Version**: 1.0
