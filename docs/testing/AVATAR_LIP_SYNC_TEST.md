# Avatar Lip Sync 測試功能說明

## 📋 功能概述

這是一個完整的 **2D Avatar Lip Sync 測試系統**，實現了從照片到語音動畫的完整流程：

1. ✅ **照片上傳** - 使用者上傳真人照片
2. ✅ **Avatar 風格化** - 使用 Replicate Stable Diffusion 將照片轉換為 Avatar 風格
3. ✅ **對話生成** - 輸入文字，使用 Azure Speech TTS 生成語音
4. ✅ **Viseme 提取** - 從 TTS 中獲取嘴型同步數據
5. ✅ **Lip Sync 動畫** - 即時渲染 Avatar 的嘴型動畫

## 🚀 訪問測試頁面

### 測試網址：
```
http://localhost:3005/zh-TW/avatar-lip-sync-test
```

### 登入要求：
需要先登入系統。如果未登入，系統會自動導向登入頁面。

## 🎯 使用流程

### 步驟 1：上傳照片
1. 點擊「上傳照片」區域或拖放照片
2. 支援格式：JPG, PNG, GIF
3. 最大檔案大小：10MB
4. 建議使用正面清晰照片

### 步驟 2：選擇風格
系統會自動開始風格化，您也可以切換不同風格：
- 🎭 **卡通風格** (Cartoon) - 類似 Pixar 風格
- 🌸 **動漫風格** (Anime) - 日式動漫風格
- 🎨 **插畫風格** (Illustration) - 數位插畫風格

**預期時間：** 5-15 秒（取決於 Replicate 伺服器負載）

### 步驟 3：輸入對話
1. 在文字框中輸入 Avatar 要說的話
2. 最多 200 字元
3. 點擊「生成對話」按鈕

**預期時間：** 1-3 秒（TTS 生成）

### 步驟 4：觀看動畫
- Avatar 會自動開始說話
- 嘴型會隨著語音同步
- 顯示當前 Viseme ID 和嘴型開合程度
- 可以點擊播放/暫停控制

## 📊 效能指標

### 目標延遲時間：
- ✅ **照片風格化**：5-15 秒（一次性操作）
- ✅ **TTS 生成**：1-3 秒
- ✅ **Lip Sync 渲染**：即時（0 延遲）
- ✅ **總對話延遲**：2-4 秒（符合預期目標）

### 實際測試數據：
測試頁面會顯示實際的效能統計：
- 風格化耗時
- TTS 生成耗時
- 總處理時間

## 🔧 技術架構

### API 端點：

#### 1. POST /api/avatar/stylize
照片風格化 API
```typescript
// Request
{
  "photoUrl": "data:image/jpeg;base64,...",
  "style": "cartoon" | "anime" | "illustration"
}

// Response
{
  "success": true,
  "avatarImageUrl": "https://replicate.delivery/...",
  "style": "cartoon",
  "duration": 8234
}
```

#### 2. POST /api/tts-viseme
TTS with Viseme API
```typescript
// Request
{
  "text": "您好！我是您的專屬 AI 助理。",
  "voice": "zh-TW-HsiaoChenNeural",
  "speed": 0.85,
  "pitch": 1.0
}

// Response
{
  "audioUrl": "data:audio/mp3;base64,...",
  "duration": 2150,
  "visemes": [
    { "visemeId": 0, "audioOffset": 0, "audioOffsetMs": 0 },
    { "visemeId": 20, "audioOffset": 125000, "audioOffsetMs": 12.5 },
    ...
  ],
  "text": "您好！我是您的專屬 AI 助理。"
}
```

### 核心組件：

#### 1. PhotoUpload.tsx
照片上傳組件，支援拖放和點擊上傳

#### 2. Avatar2DLipSync.tsx
2D Avatar Lip Sync 渲染組件
- 使用 CSS Transform 模擬嘴型變化
- 根據 Viseme 數據即時更新動畫
- 支援播放/暫停控制

#### 3. Replicate Client
```typescript
// lib/replicate/client.ts
stylizePhotoToAvatar(imageUrl, style)
// 使用 Stable Diffusion ControlNet 風格化照片
```

#### 4. Viseme 型別定義
```typescript
// types/viseme.ts
- VisemeId: 0-21 種嘴型
- VISEME_TO_MORPH_TARGET: Viseme 到 CSS 變形映射
- VISEME_INTENSITY: 嘴型開合強度
```

## 🔑 必要的環境變數

確保 `.env.local` 包含以下變數：

```bash
# Azure OpenAI
AZURE_OPENAI_API_KEY=your_key_here
AZURE_OPENAI_ENDPOINT=your_endpoint_here
AZURE_OPENAI_DEPLOYMENT=gpt-5-chat

# Azure Speech Services
AZURE_SPEECH_KEY=your_speech_key_here
AZURE_SPEECH_REGION=eastasia

# Replicate API
REPLICATE_API_TOKEN=r8_CKiUzysxymsR2Qvtk2hQmqtiguhC7fN3wkOrL
REPLICATE_WEBHOOK_SIGNING_KEY=whsec_4/p+d9PKs3XFsYEKZ3eFC/Q/jFim7Sa9
```

## ⚠️ 已知限制

### 1. Lip Sync 品質
目前使用簡化的 CSS Transform 實現嘴型動畫：
- ✅ 優點：即時渲染，無延遲
- ⚠️ 限制：嘴型精度不如專業 Lip Sync 影片
- 💡 未來升級：可以整合 Replicate Wav2Lip 生成高品質影片

### 2. Replicate API 限制
- 免費額度有限
- 處理時間取決於伺服器負載
- 需要網路連線

### 3. 瀏覽器相容性
- 需要支援 HTML5 Audio API
- 建議使用 Chrome、Edge、Firefox 最新版本

## 🎨 風格化效果說明

### Cartoon（卡通）
- 類似 Pixar、迪士尼風格
- 色彩鮮豔，線條圓潤
- 適合：專業、友善的 Avatar

### Anime（動漫）
- 日式動漫風格
- 大眼睛，鮮豔髮色
- 適合：年輕、活潑的 Avatar

### Illustration（插畫）
- 數位繪畫風格
- 藝術感較強
- 適合：創意、個性化的 Avatar

## 🐛 故障排除

### 問題 1：照片風格化失敗
**可能原因：**
- Replicate API Token 無效
- 網路連線問題
- 照片格式不支援

**解決方案：**
1. 檢查 `.env.local` 中的 `REPLICATE_API_TOKEN`
2. 查看瀏覽器 Console 和伺服器日誌
3. 嘗試使用不同格式的照片

### 問題 2：TTS 生成失敗
**可能原因：**
- Azure Speech Key 無效或過期
- 文字包含不支援的字元
- 網路連線問題

**解決方案：**
1. 檢查 `.env.local` 中的 `AZURE_SPEECH_KEY`
2. 簡化輸入文字
3. 查看伺服器日誌

### 問題 3：Lip Sync 動畫不同步
**可能原因：**
- Viseme 數據解析錯誤
- 音訊播放延遲
- 瀏覽器效能問題

**解決方案：**
1. 重新整理頁面
2. 檢查瀏覽器 Console 的 Viseme 數據
3. 使用較快的瀏覽器或電腦

## 📈 未來優化方向

### 短期（1-2 週）
1. ✅ 優化 Lip Sync 演算法，提升嘴型精度
2. ✅ 增加頭部微動畫（點頭、搖頭）
3. ✅ 支援表情變化（微笑、驚訝）

### 中期（1 個月）
1. ⏳ 整合 Replicate Wav2Lip 生成高品質影片
2. ⏳ 支援批次生成和影片下載
3. ⏳ 加入 Avatar 快取機制，減少重複風格化

### 長期（2-3 個月）
1. 📅 3D Avatar 支援（整合 Ready Player Me 3D 模型）
2. 📅 自訂風格訓練（使用者上傳多張照片訓練個人風格）
3. 📅 即時對話模式（WebSocket + 串流 TTS）

## 📝 開發日誌

### 2025-10-20
- ✅ 建立完整的 Avatar Lip Sync 測試系統
- ✅ 整合 Replicate Stable Diffusion 照片風格化
- ✅ 整合 Azure Speech TTS with Viseme
- ✅ 實作 2D Lip Sync 即時渲染
- ✅ 建立測試頁面和完整文件

## 🤝 貢獻

如果您有任何建議或問題，請：
1. 查看伺服器日誌：`npm run dev` 的 Console 輸出
2. 查看瀏覽器 Console：按 F12 開啟開發者工具
3. 記錄問題並反饋

## 📚 相關文件

- [Replicate API Documentation](https://replicate.com/docs)
- [Azure Speech Service Viseme](https://learn.microsoft.com/en-us/azure/ai-services/speech-service/how-to-speech-synthesis-viseme)
- [Next.js 15 Documentation](https://nextjs.org/docs)
