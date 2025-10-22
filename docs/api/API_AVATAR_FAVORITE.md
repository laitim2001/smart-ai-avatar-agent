# Avatar 收藏與推薦 API 文件

Sprint 5 Phase 2.2 新增的 Avatar 收藏與推薦功能 API。

## 目錄

- [收藏 Avatar](#收藏-avatar)
- [取消收藏 Avatar](#取消收藏-avatar)
- [取得使用者收藏列表](#取得使用者收藏列表)
- [取得推薦 Avatar](#取得推薦-avatar)

---

## 收藏 Avatar

將指定的 Avatar 加入使用者的收藏列表。

### Endpoint

```
POST /api/avatars/[id]/favorite
```

### 驗證

需要使用者登入 (NextAuth Session)

### 路徑參數

| 參數 | 類型 | 說明 |
|------|------|------|
| `id` | string | Avatar ID |

### 請求範例

```bash
curl -X POST https://your-domain.com/api/avatars/alex/favorite \
  -H "Cookie: next-auth.session-token=..." \
  -H "Content-Type: application/json"
```

### 回應

#### 成功 (200 OK)

```json
{
  "success": true,
  "favorite": {
    "id": "clx1234567890",
    "avatarId": "alex",
    "createdAt": "2025-10-17T03:26:30.123Z",
    "avatar": {
      "id": "alex",
      "name": "Alex",
      "thumbnail": "🧑"
    }
  }
}
```

#### 錯誤回應

##### 未授權 (401 Unauthorized)

```json
{
  "error": "未授權：請先登入"
}
```

##### Avatar 不存在 (404 Not Found)

```json
{
  "error": "Avatar 不存在"
}
```

##### 已經收藏 (400 Bad Request)

```json
{
  "error": "已經收藏此 Avatar"
}
```

##### 伺服器錯誤 (500 Internal Server Error)

```json
{
  "error": "收藏失敗，請稍後再試"
}
```

---

## 取消收藏 Avatar

將指定的 Avatar 從使用者的收藏列表中移除。

### Endpoint

```
DELETE /api/avatars/[id]/favorite
```

### 驗證

需要使用者登入 (NextAuth Session)

### 路徑參數

| 參數 | 類型 | 說明 |
|------|------|------|
| `id` | string | Avatar ID |

### 請求範例

```bash
curl -X DELETE https://your-domain.com/api/avatars/alex/favorite \
  -H "Cookie: next-auth.session-token=..." \
  -H "Content-Type: application/json"
```

### 回應

#### 成功 (200 OK)

```json
{
  "success": true,
  "message": "已取消收藏"
}
```

#### 錯誤回應

##### 未授權 (401 Unauthorized)

```json
{
  "error": "未授權：請先登入"
}
```

##### 尚未收藏 (404 Not Found)

```json
{
  "error": "尚未收藏此 Avatar"
}
```

##### 伺服器錯誤 (500 Internal Server Error)

```json
{
  "error": "取消收藏失敗，請稍後再試"
}
```

---

## 取得使用者收藏列表

取得當前使用者的所有收藏 Avatar。

### Endpoint

```
GET /api/user/favorites
```

### 驗證

需要使用者登入 (NextAuth Session)

### 請求範例

```bash
curl https://your-domain.com/api/user/favorites \
  -H "Cookie: next-auth.session-token=..."
```

### 回應

#### 成功 (200 OK)

```json
{
  "success": true,
  "favorites": [
    {
      "id": "clx1234567890",
      "avatarId": "alex",
      "createdAt": "2025-10-17T03:26:30.123Z",
      "avatar": {
        "id": "alex",
        "name": "Alex",
        "description": "專業形象的男性 Avatar，適合商務場合",
        "url": "https://models.readyplayer.me/...",
        "thumbnail": "🧑",
        "category": "male",
        "tags": ["professional", "casual"],
        "featured": true,
        "popularity": 95
      }
    },
    {
      "id": "clx0987654321",
      "avatarId": "jordan",
      "createdAt": "2025-10-17T02:15:20.456Z",
      "avatar": {
        "id": "jordan",
        "name": "Jordan",
        "description": "中性風格 Avatar，適合各種場合",
        "url": "https://models.readyplayer.me/...",
        "thumbnail": "🧑‍🦱",
        "category": "neutral",
        "tags": ["casual", "friendly"],
        "featured": false,
        "popularity": 80
      }
    }
  ],
  "count": 2
}
```

#### 錯誤回應

##### 未授權 (401 Unauthorized)

```json
{
  "error": "未授權：請先登入"
}
```

##### 使用者不存在 (404 Not Found)

```json
{
  "error": "使用者不存在"
}
```

##### 伺服器錯誤 (500 Internal Server Error)

```json
{
  "error": "取得收藏列表失敗，請稍後再試"
}
```

---

## 取得推薦 Avatar

根據使用者的收藏偏好，返回個人化推薦的 Avatar 列表。

### Endpoint

```
GET /api/avatars/recommended?limit=6
```

### 驗證

選填 (未登入使用者會收到一般熱門 Avatar)

### 查詢參數

| 參數 | 類型 | 預設值 | 說明 |
|------|------|--------|------|
| `limit` | number | 6 | 返回的 Avatar 數量 |

### 推薦演算法

#### 已登入且有收藏

1. 分析使用者收藏的 Avatar 的 `category` 和 `tags`
2. 統計最常見的 category 和 top 3 tags
3. 推薦相同 category 或有共同 tags 的 Avatar
4. 排除已收藏的 Avatar
5. 優先顯示 featured 和高 popularity 的 Avatar

#### 未登入或無收藏

返回熱門 Avatar (featured 或 popularity >= 50)

### 請求範例

```bash
# 已登入使用者
curl https://your-domain.com/api/avatars/recommended?limit=6 \
  -H "Cookie: next-auth.session-token=..."

# 未登入使用者
curl https://your-domain.com/api/avatars/recommended?limit=6
```

### 回應

#### 成功 (200 OK)

```json
{
  "success": true,
  "avatars": [
    {
      "id": "casey",
      "name": "Casey",
      "description": "友善的中性 Avatar",
      "url": "https://models.readyplayer.me/...",
      "thumbnail": "🧑‍🦲",
      "category": "neutral",
      "tags": ["friendly", "casual"],
      "featured": true,
      "popularity": 90,
      "createdAt": "2025-10-15T10:00:00.000Z",
      "updatedAt": "2025-10-15T10:00:00.000Z"
    },
    {
      "id": "taylor",
      "name": "Taylor",
      "description": "專業的中性 Avatar",
      "url": "https://models.readyplayer.me/...",
      "thumbnail": "👤",
      "category": "neutral",
      "tags": ["professional", "modern"],
      "featured": false,
      "popularity": 85,
      "createdAt": "2025-10-15T10:00:00.000Z",
      "updatedAt": "2025-10-15T10:00:00.000Z"
    }
  ],
  "count": 2
}
```

#### 錯誤回應

##### 伺服器錯誤 (500 Internal Server Error)

```json
{
  "error": "取得推薦失敗，請稍後再試"
}
```

---

## 資料模型

### UserFavoriteAvatar

使用者與 Avatar 的多對多收藏關聯表。

```prisma
model UserFavoriteAvatar {
  id        String   @id @default(cuid())
  userId    String
  avatarId  String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  avatar    Avatar   @relation(fields: [avatarId], references: [id], onDelete: Cascade)

  createdAt DateTime @default(now())

  @@unique([userId, avatarId])
  @@index([userId])
  @@index([avatarId])
  @@map("user_favorite_avatars")
}
```

### 關聯

- **User** → **UserFavoriteAvatar**: 一對多 (一個使用者可以有多個收藏)
- **Avatar** → **UserFavoriteAvatar**: 一對多 (一個 Avatar 可以被多個使用者收藏)

---

## 使用範例

### React 元件中使用

```typescript
import { useAvatarStore } from '@/stores/avatarStore'

function AvatarCard({ avatar }) {
  const { toggleFavorite, isFavorite, isFavoriteLoading } = useAvatarStore()

  const handleFavoriteClick = async () => {
    await toggleFavorite(avatar.id)
  }

  return (
    <div>
      <h3>{avatar.name}</h3>
      <button
        onClick={handleFavoriteClick}
        disabled={isFavoriteLoading}
      >
        {isFavorite(avatar.id) ? '❤️ 已收藏' : '🤍 收藏'}
      </button>
    </div>
  )
}
```

### 伺服器端使用

```typescript
import { prisma } from '@/lib/db/prisma'

// 取得使用者收藏數量
const favoriteCount = await prisma.userFavoriteAvatar.count({
  where: { userId: 'user_id' }
})

// 檢查是否已收藏
const isFavorited = await prisma.userFavoriteAvatar.findUnique({
  where: {
    userId_avatarId: {
      userId: 'user_id',
      avatarId: 'avatar_id',
    }
  }
})
```

---

## 測試

### 單元測試

```bash
npm run test tests/unit/stores/avatarStore.test.ts
npm run test tests/unit/api/avatars-favorite.test.ts
```

### E2E 測試

```bash
npm run test:e2e tests/e2e/avatar-gallery.spec.ts
```

---

## 相關文件

- [Avatar Gallery 使用者介面](./SPRINT_5_SUMMARY.md#phase-22-收藏與推薦功能)
- [Prisma Schema](../prisma/schema.prisma)
- [Avatar Store](../stores/avatarStore.ts)
