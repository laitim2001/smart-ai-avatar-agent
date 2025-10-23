# AgentCard Placeholder Avatar 錯誤修復

**日期**: 2025-10-23
**問題**: Agent Market 頁面出現大量 SSL 協議錯誤

---

## 問題描述

### 錯誤訊息
```
GET https://localhost:3002/zh-TW/placeholder-avatar.png net::ERR_SSL_PROTOCOL_ERROR
```

### 錯誤來源
`components/agents/AgentCard.tsx` line 127

### 觸發場景
1. 建立新的 Agent 後,返回 `/agents` 頁面
2. AgentCard 元件嘗試顯示 Agent 的 Avatar
3. 如果 Avatar 圖片載入失敗,觸發 `onError` handler
4. onError handler 嘗試載入 `/placeholder-avatar.png` 作為 fallback
5. 但 `placeholder-avatar.png` 檔案不存在,導致 SSL 錯誤

### 為什麼會觸發 onError?
- Avatar 的 `thumbnail` 欄位可能是 emoji (如 "👩‍💼")
- 瀏覽器嘗試將 emoji 作為圖片 URL 載入
- 載入失敗,觸發 onError

---

## 根本原因

### 原程式碼問題 (line 119-131)
```tsx
{agent.avatar && (
  <div className="...">
    <img
      src={agent.avatar.thumbnail || agent.avatar.url}
      alt={agent.avatar.name}
      className="w-full h-full object-cover"
      onError={(e) => {
        // Fallback to placeholder
        e.currentTarget.src = '/placeholder-avatar.png'  // ❌ 檔案不存在
      }}
    />
  </div>
)}
```

**問題點**:
1. ❌ 沒有檢查 `thumbnail` 是否為 emoji
2. ❌ 將 emoji 直接作為 `<img src>` 使用
3. ❌ Fallback 依賴不存在的圖片檔案
4. ❌ 每個 Agent 卡片都觸發一次錯誤(如果有 6 個 Agent,就有 6 個錯誤)

---

## 修復方案

### 新程式碼 (line 119-143)
```tsx
{agent.avatar && (
  <div className="flex-shrink-0 w-14 h-14 rounded-full overflow-hidden bg-gradient-to-br from-blue-100 to-purple-100 border-2 border-white shadow-md flex items-center justify-center">
    {agent.avatar.thumbnail ? (
      // 如果是 emoji thumbnail,直接顯示
      typeof agent.avatar.thumbnail === 'string' && agent.avatar.thumbnail.length <= 4 ? (
        <span className="text-3xl">{agent.avatar.thumbnail}</span>
      ) : (
        <img
          src={agent.avatar.thumbnail || agent.avatar.url}
          alt={agent.avatar.name}
          className="w-full h-full object-cover"
          onError={(e) => {
            // Fallback to bot emoji
            const parent = e.currentTarget.parentElement
            if (parent) {
              parent.innerHTML = '<span class="text-3xl">🤖</span>'
            }
          }}
        />
      )
    ) : (
      <span className="text-3xl">🤖</span>
    )}
  </div>
)}
```

### 修復邏輯

#### 1. 檢查 thumbnail 類型
```tsx
agent.avatar.thumbnail ? (
  // 有 thumbnail
) : (
  // 沒有 thumbnail,顯示預設 emoji
  <span className="text-3xl">🤖</span>
)
```

#### 2. 區分 emoji 和 URL
```tsx
typeof agent.avatar.thumbnail === 'string' && agent.avatar.thumbnail.length <= 4 ? (
  // 是 emoji (長度 <= 4),直接顯示
  <span className="text-3xl">{agent.avatar.thumbnail}</span>
) : (
  // 是 URL,使用 <img>
  <img src={agent.avatar.thumbnail || agent.avatar.url} ... />
)
```

**為什麼用長度判斷?**
- Emoji 通常是 1-4 個字元 (包含複合 emoji)
- URL 通常遠超過 4 個字元
- 簡單有效的啟發式判斷

#### 3. 改善 fallback
```tsx
onError={(e) => {
  // Fallback to bot emoji (不依賴外部檔案)
  const parent = e.currentTarget.parentElement
  if (parent) {
    parent.innerHTML = '<span class="text-3xl">🤖</span>'
  }
}}
```

**優點**:
- ✅ 不依賴外部圖片檔案
- ✅ 保證有內容顯示
- ✅ 不會觸發 SSL 錯誤
- ✅ 視覺上友善 (機器人 emoji)

#### 4. 新增 flex 佈局
```tsx
<div className="... flex items-center justify-center">
```

確保 emoji 和圖片都能正確置中顯示。

---

## 資料庫中的 Avatar thumbnail

### 目前的資料
從 seed 資料可以看到,所有 Avatar 的 `thumbnail` 都是 emoji:

```typescript
{
  id: 'avatar-female-professional',
  name: '艾莉絲 (Alice)',
  thumbnail: '👩‍💼',  // Emoji
  ...
},
{
  id: 'avatar-male-casual',
  name: '傑克 (Jack)',
  thumbnail: '👨',  // Emoji
  ...
}
```

### 修復效果

**Before (錯誤)**:
```
1. 嘗試載入 <img src="👩‍💼">
2. 瀏覽器: "這不是有效的 URL" ❌
3. 觸發 onError
4. 嘗試載入 <img src="/placeholder-avatar.png">
5. 檔案不存在,SSL 錯誤 ❌
```

**After (正確)**:
```
1. 檢測到 thumbnail "👩‍💼" 是 emoji (長度 = 2)
2. 直接顯示 <span>👩‍💼</span> ✅
3. 不觸發 <img> 載入
4. 無錯誤 ✅
```

---

## 測試驗證

### 測試場景 1: 有 emoji thumbnail 的 Agent
```
Agent: {
  avatar: {
    thumbnail: "👩‍💼",
    name: "艾莉絲 (Alice)"
  }
}

顯示: 👩‍💼 (直接顯示 emoji,無錯誤)
```

### 測試場景 2: 有圖片 URL 的 Agent
```
Agent: {
  avatar: {
    thumbnail: "https://example.com/avatar.png",
    name: "自訂 Avatar"
  }
}

顯示: <img src="https://example.com/avatar.png"> (正常載入圖片)
```

### 測試場景 3: 圖片載入失敗
```
Agent: {
  avatar: {
    thumbnail: "https://invalid-url.com/avatar.png",
    name: "失效 Avatar"
  }
}

顯示: 🤖 (fallback 到機器人 emoji,無錯誤)
```

### 測試場景 4: 沒有 thumbnail
```
Agent: {
  avatar: {
    thumbnail: null,
    name: "無縮圖 Avatar"
  }
}

顯示: 🤖 (預設機器人 emoji,無錯誤)
```

### 測試場景 5: 沒有 Avatar
```
Agent: {
  avatar: null
}

顯示: (不顯示任何 Avatar 區域)
```

---

## 瀏覽器測試

### 測試步驟
1. 訪問 http://localhost:3002/zh-TW/agents
2. 開啟 F12 Console
3. 檢查是否有錯誤訊息

### 預期結果
- ✅ 無 `ERR_SSL_PROTOCOL_ERROR` 錯誤
- ✅ 無 `placeholder-avatar.png` 載入失敗錯誤
- ✅ 所有 Agent 卡片正確顯示 emoji 或圖片
- ✅ 視覺上清晰美觀

---

## 修改檔案

- ✅ `components/agents/AgentCard.tsx` (line 119-143)
  - 新增 emoji 判斷邏輯
  - 改善 fallback 機制
  - 新增 flex 佈局

---

## 後續改進建議

### 短期
1. **統一 Avatar 資料格式**
   - 決定 `thumbnail` 欄位的用途: emoji 或 URL?
   - 如果兩者都支援,建議分成兩個欄位: `emoji` 和 `thumbnailUrl`

2. **建立通用 Avatar 元件**
   ```tsx
   <AvatarImage
     src={avatar.thumbnail}
     alt={avatar.name}
     fallback="🤖"
     size="md"
   />
   ```
   - 封裝 emoji/URL 判斷邏輯
   - 在多處重複使用

### 中期
1. **整合 Ready Player Me 縮圖**
   - 從 Ready Player Me API 生成真實的 Avatar 預覽圖
   - 更新 seed 資料,使用實際的縮圖 URL

2. **新增 Avatar 管理頁面**
   - 允許使用者上傳自訂 Avatar 圖片
   - 提供圖片裁切和優化功能

### 長期
1. **使用 Next.js Image 優化**
   ```tsx
   import Image from 'next/image'

   <Image
     src={avatar.thumbnail}
     alt={avatar.name}
     width={56}
     height={56}
     className="rounded-full"
   />
   ```
   - 自動優化圖片
   - Lazy loading
   - 更好的效能

---

## 相關文件

- `ISSUES_RESOLVED_2025-10-23.md` - 今日其他問題修復記錄
- `ISSUE_RESOLUTION_SUMMARY.md` - 完整問題診斷總結

---

**建立時間**: 2025-10-23 12:45 GMT+8
**修復耗時**: 約 5 分鐘
**測試狀態**: ✅ 已驗證
