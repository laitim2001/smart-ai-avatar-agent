# API Reference - Sprint 2

> **Sprint 2 新增 API 文件**
> **更新日期**: 2025-10-16
> **狀態**: ✅ 已完成

本文件記錄 Sprint 2 (使用者個人資料與 Avatar 偏好) 新增的所有 API 端點。

---

## 目錄

1. [使用者個人資料 API](#使用者個人資料-api)
2. [Avatar 管理 API](#avatar-管理-api)
3. [使用者偏好 API](#使用者偏好-api)
4. [使用者活動 API](#使用者活動-api)
5. [統一回應格式](#統一回應格式)

---

## 使用者個人資料 API

### GET /api/user/profile

獲取使用者個人資料。

**認證**: 需要 (NextAuth Session)

**回應格式**:
```json
{
  "success": true,
  "data": {
    "id": "user_123",
    "name": "測試使用者",
    "email": "user@example.com",
    "emailVerified": "2025-10-16T10:00:00.000Z",
    "createdAt": "2025-10-15T10:00:00.000Z",
    "updatedAt": "2025-10-16T10:00:00.000Z"
  }
}
```

**錯誤回應**:
- `401 Unauthorized`: 未登入
- `404 Not Found`: 使用者不存在

---

### PATCH /api/user/profile

更新使用者個人資料。

**認證**: 需要 (NextAuth Session)

**請求格式**:
```json
{
  "name": "新的使用者名稱"
}
```

**驗證規則**:
- `name`: 字串，長度 1-100 字元

**回應格式**:
```json
{
  "success": true,
  "message": "個人資料更新成功",
  "data": {
    "id": "user_123",
    "name": "新的使用者名稱",
    "email": "user@example.com"
  }
}
```

**錯誤回應**:
- `400 Bad Request`: 驗證失敗
- `401 Unauthorized`: 未登入
- `404 Not Found`: 使用者不存在

**活動記錄**: 自動記錄 `profile_update` 活動

---

### PATCH /api/user/password

變更使用者密碼。

**認證**: 需要 (NextAuth Session)

**請求格式**:
```json
{
  "currentPassword": "OldPassword123",
  "newPassword": "NewPassword123",
  "confirmPassword": "NewPassword123"
}
```

**驗證規則**:
- `currentPassword`: 字串，必填
- `newPassword`: 字串，最少 8 字元，需符合密碼強度要求
- `confirmPassword`: 字串，需與 newPassword 相同
- 新密碼不能與目前密碼相同

**回應格式**:
```json
{
  "success": true,
  "message": "密碼變更成功"
}
```

**錯誤回應**:
- `400 Bad Request`: 驗證失敗或密碼不符合要求
- `401 Unauthorized`: 未登入或目前密碼錯誤
- `404 Not Found`: 使用者不存在

**活動記錄**: 自動記錄 `password_change` 活動

---

## Avatar 管理 API

### GET /api/avatars

獲取可用的 Avatar 清單。

**認證**: 不需要

**查詢參數**:
- `category` (可選): 篩選類別 (male/female/neutral)
- `tag` (可選): 篩選標籤

**回應格式**:
```json
{
  "success": true,
  "data": {
    "avatars": [
      {
        "id": "avatar_alex",
        "name": "Alex",
        "url": "https://models.readyplayer.me/...",
        "thumbnail": "https://...",
        "description": "Professional avatar",
        "category": "male",
        "tags": ["professional", "business"]
      }
    ],
    "categories": ["all", "male", "female", "neutral"],
    "allTags": ["professional", "casual", "creative"]
  }
}
```

**範例請求**:
```bash
GET /api/avatars
GET /api/avatars?category=male
GET /api/avatars?tag=professional
```

---

## 使用者偏好 API

### GET /api/user/preferences

獲取使用者偏好設定。

**認證**: 需要 (NextAuth Session)

**回應格式**:
```json
{
  "success": true,
  "data": {
    "preferences": {
      "defaultAvatarId": "avatar_alex",
      "defaultAvatarUrl": "https://models.readyplayer.me/..."
    }
  }
}
```

**錯誤回應**:
- `401 Unauthorized`: 未登入
- `404 Not Found`: 使用者不存在

---

### PATCH /api/user/preferences

更新使用者偏好設定。

**認證**: 需要 (NextAuth Session)

**請求格式**:
```json
{
  "defaultAvatarId": "avatar_alex",
  "defaultAvatarUrl": "https://models.readyplayer.me/..."
}
```

**驗證規則**:
- `defaultAvatarId` (可選): 字串
- `defaultAvatarUrl` (可選): 有效的 URL

**回應格式**:
```json
{
  "success": true,
  "message": "偏好設定更新成功",
  "data": {
    "preferences": {
      "defaultAvatarId": "avatar_alex",
      "defaultAvatarUrl": "https://models.readyplayer.me/..."
    }
  }
}
```

**錯誤回應**:
- `400 Bad Request`: 驗證失敗
- `401 Unauthorized`: 未登入
- `404 Not Found`: 使用者不存在

**活動記錄**: 自動記錄 `avatar_change` 活動

---

## 使用者活動 API

### GET /api/user/activity

獲取使用者活動記錄。

**認證**: 需要 (NextAuth Session)

**查詢參數**:
- `limit` (可選): 返回數量，預設 50，最大 100
- `offset` (可選): 偏移量，預設 0
- `stats` (可選): 是否包含統計資訊 (true/false)
- `days` (可選): 統計天數，預設 30
- `action` (可選): 篩選特定活動類型

**回應格式 (不含統計)**:
```json
{
  "success": true,
  "data": {
    "activities": [
      {
        "id": "log_123",
        "action": "login",
        "metadata": {
          "method": "credentials",
          "timestamp": "2025-10-16T10:00:00.000Z"
        },
        "ipAddress": "203.0.113.1",
        "userAgent": "Mozilla/5.0...",
        "createdAt": "2025-10-16T10:00:00.000Z"
      }
    ],
    "pagination": {
      "total": 150,
      "limit": 50,
      "offset": 0,
      "hasMore": true
    }
  }
}
```

**回應格式 (含統計)**:
```json
{
  "success": true,
  "data": {
    "activities": [...],
    "stats": {
      "login": 25,
      "profile_update": 5,
      "avatar_change": 3,
      "password_change": 1
    },
    "pagination": {...}
  }
}
```

**支援的活動類型**:
- `login`: 登入
- `logout`: 登出
- `register`: 註冊
- `profile_update`: 個人資料更新
- `avatar_change`: Avatar 變更
- `password_change`: 密碼變更
- `email_verify`: Email 驗證
- `password_reset_request`: 密碼重設請求
- `password_reset_complete`: 密碼重設完成
- `settings_update`: 設定更新

**範例請求**:
```bash
GET /api/user/activity
GET /api/user/activity?limit=10&offset=0
GET /api/user/activity?stats=true&days=7
GET /api/user/activity?action=login
```

**錯誤回應**:
- `400 Bad Request`: 參數格式錯誤
- `401 Unauthorized`: 未登入

---

## 統一回應格式

所有 API 端點使用統一的回應格式（由 `lib/utils/api-response.ts` 提供）。

### 成功回應

```typescript
interface SuccessResponse<T = unknown> {
  success: true
  data?: T
  message?: string
}
```

**範例**:
```json
{
  "success": true,
  "data": {"id": "123", "name": "測試"},
  "message": "操作成功"
}
```

### 錯誤回應

```typescript
interface ErrorResponse {
  success: false
  error: string
  code?: string
  details?: unknown
}
```

**範例**:
```json
{
  "success": false,
  "error": "驗證失敗",
  "code": "VALIDATION_ERROR",
  "details": {
    "email": "電子郵件格式不正確"
  }
}
```

### 常見錯誤代碼

| 代碼 | HTTP 狀態 | 說明 |
|------|----------|------|
| `VALIDATION_ERROR` | 400 | 請求資料驗證失敗 |
| `UNAUTHORIZED` | 401 | 未授權，需要登入 |
| `FORBIDDEN` | 403 | 無權執行此操作 |
| `NOT_FOUND` | 404 | 找不到請求的資源 |
| `SERVER_ERROR` | 500 | 伺服器內部錯誤 |
| `SERVICE_UNAVAILABLE` | 503 | 服務暫時不可用 |

---

## 認證機制

所有需要認證的 API 都使用 **NextAuth.js v5** Session 認證。

**請求 Header**:
- Cookies 中包含 NextAuth session token
- 由 Next.js Middleware 自動處理

**認證檢查**:
```typescript
import { auth } from '@/lib/auth/config'

const session = await auth()
if (!session || !session.user?.email) {
  return unauthorizedResponse()
}
```

---

## 活動記錄

以下 API 會自動記錄使用者活動（透過 `lib/activity/logger.ts`）：

| API 端點 | 活動類型 | Metadata 內容 |
|---------|---------|--------------|
| POST /api/auth/login | `login` | `{ method, timestamp }` |
| PATCH /api/user/profile | `profile_update` | `{ field, oldValue, newValue }` |
| PATCH /api/user/preferences | `avatar_change` | `{ avatarId, avatarUrl }` |
| PATCH /api/user/password | `password_change` | `{ timestamp }` |

**活動記錄特性**:
- ✅ Fail-safe 設計（記錄失敗不影響主要功能）
- ✅ 自動擷取 IP 位址和 User Agent
- ✅ 支援自定義 metadata
- ✅ 可查詢與統計

---

## Rate Limiting

所有 API 受 Rate Limiting 保護（使用 Upstash Redis）：

- **認證 API**: 5 次 / 15 分鐘
- **一般 API**: 100 次 / 分鐘
- **Email 發送**: 3 次 / 小時

**Rate Limit Headers**:
```
X-RateLimit-Limit: 5
X-RateLimit-Remaining: 4
X-RateLimit-Reset: 1697451600
```

**超過限制回應**:
```json
{
  "success": false,
  "error": "請求過於頻繁，請稍後再試",
  "code": "RATE_LIMIT_EXCEEDED"
}
```

---

## API 測試

### 單元測試

所有核心工具函數都有完整的單元測試：

- `lib/activity/logger.ts` - 44 個測試
- `lib/utils/api-response.ts` - 35 個測試

執行測試：
```bash
npm test
```

### E2E 測試

API 端點的 E2E 測試：

- `tests/e2e/profile-flow.spec.ts` - 個人資料 API
- `tests/e2e/avatar-flow.spec.ts` - Avatar API
- `tests/e2e/activity-tracking.spec.ts` - 活動記錄 API

執行測試：
```bash
npm run test:e2e
```

---

## 相關文件

- **Sprint 2 計劃**: `docs/SPRINT_2_PLAN.md`
- **MVP 進度**: `docs/MVP_PROGRESS.md`
- **測試指南**: `tests/README.md`
- **Sprint 1 API**: 參見 Sprint 1 文件

---

**Last Updated**: 2025-10-16
**Sprint**: Sprint 2
**Status**: ✅ 完成
