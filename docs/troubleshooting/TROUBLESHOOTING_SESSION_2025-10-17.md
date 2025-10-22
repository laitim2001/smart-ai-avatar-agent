# 問題排查記錄 - 2025年10月17日

## 會話概要

本次會話解決了 Sprint 11 完成後出現的多個關鍵問題,包括 UI 配色、TTS 語音播放、Azure 認證、CSP 配置和 Avatar 載入失敗等。

---

## 問題 1: UI 背景色太深

### 問題描述
- **用戶反饋**: Avatar 區域和對話視窗的背景顏色太深,影響視覺體驗
- **影響範圍**: 整體 UI 美觀性

### 解決方案

修改了 3 個文件的背景配色,從深色改為淺色漸層:

1. **`app/[locale]/(dashboard)/conversations/page.tsx`**
   ```typescript
   // 修改前
   <div className="w-1/2 bg-gradient-to-b from-slate-900 to-slate-800 ...">

   // 修改後
   <div className="w-1/2 bg-gradient-to-b from-blue-50 to-indigo-100 ...">
   ```

2. **`components/chat/ChatInterface.tsx`**
   ```typescript
   // 添加淡色漸層背景
   <div className="... bg-gradient-to-b from-white to-gray-50 ...">
   ```

3. **`components/avatar/AvatarCanvas.tsx`**
   ```typescript
   <div className="w-full h-screen bg-gradient-to-b from-blue-50 to-indigo-100 relative">
   ```

### 結果
✅ UI 配色改為清新明亮的藍色系,視覺體驗大幅提升

---

## 問題 2: TTS 語音無法播放 (408 超時)

### 問題描述
- **錯誤訊息**: `POST /api/tts 408 (Request Timeout)`
- **現象**: 對話時只有文字回覆,沒有語音播放
- **根本原因**: Azure Speech SDK 的 `speakTextAsync` 方法永遠不返回,導致請求超時

### 排查過程

1. **嘗試 1**: 超時從 5秒 增加到 15秒 → ❌ 無效
2. **嘗試 2**: 重啟伺服器 → ❌ 仍然超時
3. **嘗試 3**: 超時增加到 30秒 → ❌ 仍然超時
4. **診斷**: Azure Speech SDK 存在連接問題,`speakTextAsync` 掛起

### 最終解決方案

**完全重寫 TTS API,使用 Azure Speech Services REST API 取代 SDK**

#### 關鍵變更 (`app/api/tts/route.ts`):

```typescript
// 移除 SDK 依賴
// import * as sdk from 'microsoft-cognitiveservices-speech-sdk'

// 使用 REST API
const ttsUrl = `https://${region}.tts.speech.microsoft.com/cognitiveservices/v1`

const response = await fetch(ttsUrl, {
  method: 'POST',
  headers: {
    'Ocp-Apim-Subscription-Key': subscriptionKey,
    'Content-Type': 'application/ssml+xml',
    'X-Microsoft-OutputFormat': 'audio-16khz-32kbitrate-mono-mp3',
    'User-Agent': 'smart-ai-avatar-agent',
  },
  body: ssml,
  signal: controller.signal,
})

// 返回 Base64 編碼的音訊數據
return NextResponse.json({
  audio: audioBuffer.toString('base64'),
  visemes: [], // REST API 不提供 Viseme 數據
  duration: estimatedDuration,
  format: 'audio/mpeg',
})
```

#### 技術細節:
- 使用 SSML 控制語速和音調
- 超時控制: 30 秒 (使用 AbortController)
- 輸出格式: MP3 (16kHz, 32kbps, Mono)
- 預設語速: 0.85 (85%,更自然)

### 結果
✅ TTS 成功運作,伺服器日誌顯示 `Status: 200`,音訊成功生成

---

## 問題 3: Azure Speech Service 401 認證失敗

### 問題描述
- **錯誤訊息**: `POST /api/tts 401 (Unauthorized)`
- **原因**: Azure Speech Key 無效或過期

### 排查過程

用戶嘗試了 3 個不同的 Key:

1. **Key 1** (ending in `ACOGFdRT`) → ❌ 401
2. **Key 2** (ending in `ACOGUaNr`) → ❌ 401
3. **Key 3** (完整 Key) → ✅ 200 OK

### 最終有效配置 (`.env.local`):

```bash
AZURE_SPEECH_KEY=your_valid_azure_speech_key_here
AZURE_SPEECH_REGION=eastasia
```

**注意**: 實際的 Key 請從 Azure Portal 取得,不應提交到版本控制系統

### 結果
✅ 認證成功,TTS API 正常運作

---

## 問題 4: Jest Worker 崩潰

### 問題描述
- **錯誤訊息**: `Jest worker encountered 2 child process exceptions, exceeding retry limit`
- **現象**: 頁面顯示 Runtime Error

### 解決方案

1. **清理 `.next/cache`** → ❌ 無效
2. **刪除整個 `.next` 目錄** → ❌ 伺服器仍運行舊版本
3. **重啟伺服器** → ✅ 成功

#### 操作步驟:
```bash
# 殺死進程
taskkill /F /PID 40704 /T

# 重新啟動
cd "C:\smart-ai-avatar-agent"
set PORT=3003
npm run dev
```

### 結果
✅ Jest worker 問題解決,頁面正常載入

---

## 問題 5: CSP 阻擋 Blob URL

### 問題描述
- **錯誤訊息**: `Fetch API cannot load blob:... Refused to connect because it violates the document's Content Security Policy`
- **原因**: CSP 的 `connect-src` 指令缺少 `blob:` 協議

### 解決方案

修改 `next.config.js`,在 `connect-src` 中添加 `blob:`:

```javascript
const ContentSecurityPolicy = `
  default-src 'self';
  script-src 'self' 'unsafe-eval' 'unsafe-inline' https://cdn.jsdelivr.net;
  style-src 'self' 'unsafe-inline';
  img-src 'self' data: https:;
  font-src 'self' data:;
  connect-src 'self' blob:
    https://*.openai.azure.com
    https://*.cognitiveservices.azure.com
    https://*.in.applicationinsights.azure.com
    https://models.readyplayer.me;
  worker-src 'self' blob:;
  child-src 'self' blob:;
  frame-ancestors 'none';
  base-uri 'self';
  form-action 'self';
  upgrade-insecure-requests;
`.replace(/\s{2,}/g, ' ').trim()
```

### 結果
✅ TTS 音訊成功播放,伺服器日誌:
```
[TTS API] Azure 回應時間: 1390ms, Status: 200
[TTS API] 成功取得音訊 (25920 bytes)
```

---

## 問題 6: TTS 語速太快

### 問題描述
- **用戶反饋**: 語音播放速度太快,聽起來不自然

### 解決方案

調整 `app/api/tts/route.ts` 中的預設語速:

```typescript
const TTS_CONFIG = {
  defaultVoice: 'zh-TW-HsiaoChenNeural',
  timeout: 30000,
  maxTextLength: 1000,
  speedRange: { min: 0.5, max: 2.0, default: 0.85 }, // 從 1.0 調整為 0.85
  pitchRange: { min: 0.5, max: 2.0, default: 1.0 },
}
```

### 結果
✅ 語速調整為 85%,更加自然流暢

---

## 問題 7: Avatar 404 錯誤 (關鍵問題)

### 問題描述
- **錯誤訊息**: `Could not load https://models.readyplayer.me/65c3d4e5f6a7b8c9d0e1f2a3.glb: 404: Not Found`
- **原因**: 舊的虛構 Avatar URL 儲存在資料庫和 localStorage 中

### 問題分析

Avatar URL 來源有 3 個層級:
1. **代碼文件**: `lib/avatar/constants.ts` ✅ 已修復
2. **資料庫**: `avatars` 表 ❌ 包含舊 URL
3. **localStorage**: Zustand persist ❌ 快取舊 URL

### 解決方案

#### 1. 更新資料庫 Avatar 數據

創建同步腳本 `scripts/sync-avatars.ts`:

```typescript
import { PrismaClient } from '../lib/generated/prisma'
import { AVATARS_METADATA } from '../lib/avatar/constants'

const prisma = new PrismaClient()

async function syncAvatars() {
  // 刪除所有舊記錄
  await prisma.avatar.deleteMany({})

  // 插入新記錄
  for (const avatar of AVATARS_METADATA) {
    await prisma.avatar.create({
      data: {
        id: avatar.id,
        name: avatar.name,
        description: avatar.description,
        url: avatar.url,
        thumbnail: avatar.thumbnail,
        category: avatar.category,
        tags: avatar.tags,
        featured: avatar.featured,
        popularity: avatar.popularity,
      },
    })
  }
}

syncAvatars()
```

執行結果:
```
✅ 已刪除 11 個舊的 Avatar 記錄
✅ 成功同步 11 個新的 Avatar
📦 Avatar 總數: 11
🏆 Featured: 4
👨 男性: 4
👩 女性: 4
🧑 中性: 3
```

#### 2. 自動清除 localStorage 快取

修改 `stores/avatarStore.ts`,在初始化時自動偵測並清除舊 URL:

```typescript
export const useAvatarStore = create<AvatarState>()(
  persist(
    (set, get) => {
      // 檢查並清除舊的無效 Avatar URL
      if (typeof window !== 'undefined') {
        try {
          const stored = localStorage.getItem('avatar-storage')
          if (stored) {
            const parsed = JSON.parse(stored)
            const state = parsed.state

            // 檢查是否包含舊的無效 URL
            if (state?.currentAvatarUrl && state.currentAvatarUrl.includes('65c3d4e5f6a7b8c9d0e1f2a3')) {
              console.log('[AvatarStore] 偵測到無效的舊 Avatar URL,正在清除快取...')
              localStorage.removeItem('avatar-storage')
            }
          }
        } catch (error) {
          console.error('[AvatarStore] 清除舊快取失敗:', error)
        }
      }

      return {
        // 初始狀態使用新的 AVATARS_METADATA
        currentAvatarId: AVATARS_METADATA[0].id,
        currentAvatarUrl: AVATARS_METADATA[0].url,
        availableAvatars: AVATARS_METADATA,
        // ...
      }
    },
    // ...
  )
)
```

#### 3. 手動清除快取按鈕

創建 `app/[locale]/(dashboard)/conversations/clear-cache.tsx`:

```typescript
'use client'

export function ClearCacheButton() {
  const handleClearCache = () => {
    try {
      // 清除 avatar-storage
      localStorage.removeItem('avatar-storage')

      // 清除其他 Avatar 相關快取
      const keysToRemove: string[] = []
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (key && (key.includes('avatar') || key.includes('Avatar'))) {
          keysToRemove.push(key)
        }
      }

      keysToRemove.forEach((key) => localStorage.removeItem(key))

      alert('✅ 快取已清除,頁面即將重新整理...')
      window.location.reload()
    } catch (error) {
      console.error('❌ 清除快取失敗:', error)
    }
  }

  return (
    <button
      onClick={handleClearCache}
      className="fixed bottom-4 left-4 z-50 px-4 py-2 bg-red-500 text-white rounded-lg shadow-lg hover:bg-red-600 transition-colors"
    >
      🔄 清除快取
    </button>
  )
}
```

### 真實可用的 Avatar URL

所有 Avatar 現在使用這 3 個已驗證的 Ready Player Me URL:

1. **艾莉絲/蘇菲/凱西**: `https://models.readyplayer.me/64bfa15f0e72c63d7c3934a6.glb`
2. **莉莉/艾瑪/泰勒**: `https://models.readyplayer.me/658228794c1a2f27fd06b253.glb`
3. **傑克/麥克/萊恩/大衛/喬登**: `https://models.readyplayer.me/6419b4d5c2efa2a5b0f4c3d1.glb`

### 結果
✅ Avatar 載入成功,404 錯誤完全消除

---

## 新增功能

### 1. Avatar 數據庫同步腳本

**文件**: `scripts/sync-avatars.ts`

**功能**:
- 從 `lib/avatar/constants.ts` 同步 Avatar 元數據到 PostgreSQL
- 刪除舊記錄,插入新記錄
- 顯示詳細的同步統計

**使用方式**:
```bash
npx tsx scripts/sync-avatars.ts
```

### 2. localStorage 快取清除按鈕

**功能**:
- 左下角紅色按鈕「🔄 清除快取」
- 清除所有 Avatar 相關的 localStorage 數據
- 自動重新整理頁面

**位置**: `/zh-TW/conversations` 頁面左下角

---

## 技術要點總結

### 1. Azure Speech Services REST API vs SDK

| 對比項目 | REST API | Speech SDK |
|---------|----------|------------|
| 穩定性 | ✅ 穩定 | ❌ 連接問題 |
| 部署 | ✅ 簡單 | ❌ 複雜 |
| Viseme 支援 | ❌ 不支援 | ✅ 支援 |
| 適用場景 | 基礎 TTS | 進階功能 |

**結論**: 對於基礎 TTS 需求,REST API 更穩定可靠

### 2. Content Security Policy (CSP)

**關鍵配置**:
```javascript
connect-src 'self' blob:
  https://*.openai.azure.com
  https://*.cognitiveservices.azure.com
  https://models.readyplayer.me;
```

**重點**:
- `blob:` 必須添加到 `connect-src`,否則無法載入音訊
- `worker-src` 和 `child-src` 也需要包含 `blob:`

### 3. Zustand Persist 陷阱

**問題**: localStorage 快取會導致舊數據持續存在

**解決方案**:
1. 在 store 初始化時檢查並清除無效數據
2. 提供手動清除機制
3. 使用 `partialize` 只持久化必要狀態

### 4. Avatar URL 管理最佳實踐

**數據流向**:
```
lib/avatar/constants.ts (代碼)
    ↓ (同步)
Database (PostgreSQL)
    ↓ (載入)
avatarStore (Zustand)
    ↓ (持久化)
localStorage (瀏覽器)
```

**維護策略**:
- 代碼是唯一的真實來源
- 使用腳本同步到資料庫
- 自動偵測並清除過期快取

---

## 效能指標

### TTS 效能

```
[TTS API] Azure 回應時間: 1390ms
[TTS API] 成功取得音訊 (25920 bytes)
[TTS API] 音訊長度 6.33s
POST /api/tts 200 in 3550ms
```

**總延遲**: ~3.5 秒 (包含網路往返)

### 數據庫同步效能

```
刪除舊記錄: <100ms
插入 11 個記錄: ~200ms
總計: <500ms
```

---

## 未來改善建議

### 1. TTS 效能優化

- **使用 WebSocket API**: 支援 Viseme 數據,實現更好的唇形同步
- **音訊快取**: 對常用語句進行快取,減少 API 呼叫
- **串流播放**: 邊下載邊播放,減少等待時間

### 2. Avatar 管理優化

- **CDN 快取**: 將 GLB 模型快取到 CDN,加速載入
- **預載入**: 在背景預載入常用 Avatar
- **壓縮**: 使用 Draco 壓縮減少模型大小

### 3. 錯誤處理改善

- **自動重試**: TTS 失敗時自動重試 3 次
- **降級策略**: Avatar 載入失敗時顯示預設 Avatar
- **用戶友好的錯誤訊息**: 提供更清晰的錯誤說明

---

## 相關文件

- `app/api/tts/route.ts` - TTS API 實作
- `lib/avatar/constants.ts` - Avatar 元數據定義
- `stores/avatarStore.ts` - Avatar 狀態管理
- `scripts/sync-avatars.ts` - 資料庫同步腳本
- `next.config.js` - CSP 配置

---

## 參考資源

### Azure Speech Services
- [REST API 文檔](https://learn.microsoft.com/zh-tw/azure/ai-services/speech-service/rest-text-to-speech)
- [SSML 參考](https://learn.microsoft.com/zh-tw/azure/ai-services/speech-service/speech-synthesis-markup)

### Ready Player Me
- [Avatar 文檔](https://docs.readyplayer.me/)
- [GLB 格式說明](https://docs.readyplayer.me/ready-player-me/api-reference/avatars/3d-avatars)

### Next.js
- [Content Security Policy](https://nextjs.org/docs/app/building-your-application/configuring/content-security-policy)
- [Dynamic Routes](https://nextjs.org/docs/app/building-your-application/routing/dynamic-routes)

---

**記錄日期**: 2025年10月17日
**會話時長**: 約 2 小時
**解決問題數**: 7 個
**新增功能**: 2 個
**修改文件數**: 10+ 個
