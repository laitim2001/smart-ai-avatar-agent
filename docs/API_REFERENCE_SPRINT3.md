# API Reference - Sprint 3

> **Sprint 3 新增 API 文件**
> **更新日期**: 2025-10-17
> **狀態**: 🚧 開發中

本文件記錄 Sprint 3 (語音輸入功能) 新增的所有 API 端點。

---

## 目錄

1. [語音轉文字 API](#語音轉文字-api)
2. [統一回應格式](#統一回應格式)
3. [錯誤處理](#錯誤處理)

---

## 語音轉文字 API

### POST /api/stt

將音訊檔案轉換為文字（Speech-to-Text）。

**認證**: 不需要

**Content-Type**: `multipart/form-data`

**請求格式**:

使用 FormData 格式傳送音訊檔案和語言參數：

```javascript
const formData = new FormData()
formData.append('audio', audioBlob, 'recording.wav')
formData.append('language', 'zh-TW')

fetch('/api/stt', {
  method: 'POST',
  body: formData,
})
```

**參數說明**:

| 參數 | 類型 | 必填 | 說明 |
|-----|------|------|------|
| `audio` | File/Blob | 是 | 音訊檔案（WAV 格式） |
| `language` | string | 是 | 語音輸入語言代碼 |

**支援的語言代碼**:

| 代碼 | 語言 | Azure Speech 語音模型 |
|------|------|---------------------|
| `zh-TW` | 繁體中文 | `zh-TW` |
| `en-US` | 英文 | `en-US` |
| `ja-JP` | 日文 | `ja-JP` |

**回應格式**:

```json
{
  "success": true,
  "data": {
    "text": "你好，這是轉換後的文字",
    "language": "zh-TW",
    "confidence": 0.95,
    "duration": 2.5
  }
}
```

**回應欄位說明**:

| 欄位 | 類型 | 說明 |
|-----|------|------|
| `success` | boolean | 請求是否成功 |
| `data.text` | string | 轉換後的文字 |
| `data.language` | string | 辨識使用的語言代碼 |
| `data.confidence` | number | 信心分數（0-1） |
| `data.duration` | number | 音訊時長（秒） |

**範例請求**:

```typescript
// 使用 chatStore.transcribeAudio()
import { useChatStore } from '@/stores/chatStore'

const { transcribeAudio } = useChatStore.getState()

try {
  const text = await transcribeAudio(audioBlob)
  console.log('轉換結果:', text)
} catch (error) {
  console.error('轉換失敗:', error)
}
```

**範例回應**:

```json
{
  "success": true,
  "data": {
    "text": "你好，我想要了解這個產品的詳細資訊",
    "language": "zh-TW",
    "confidence": 0.98,
    "duration": 3.2
  }
}
```

---

## 統一回應格式

所有 API 端點使用統一的回應格式。

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
  "data": {
    "text": "轉換成功的文字"
  },
  "message": "語音轉文字成功"
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
  "error": "語音辨識服務暫時無法使用",
  "code": "SERVICE_UNAVAILABLE"
}
```

---

## 錯誤處理

### 常見錯誤代碼

| HTTP 狀態 | 錯誤代碼 | 錯誤訊息 | 說明 |
|-----------|---------|---------|------|
| 400 | `VALIDATION_ERROR` | 請求參數驗證失敗 | 缺少必填參數或參數格式不正確 |
| 400 | `INVALID_AUDIO_FORMAT` | 不支援的音訊格式 | 音訊檔案格式不正確（需要 WAV） |
| 400 | `INVALID_LANGUAGE` | 不支援的語言 | 語言代碼不在支援清單中 |
| 413 | `FILE_TOO_LARGE` | 音訊檔案過大 | 音訊檔案超過大小限制（10MB） |
| 500 | `SERVICE_ERROR` | 語音辨識服務錯誤 | Azure Speech Services 內部錯誤 |
| 503 | `SERVICE_UNAVAILABLE` | 服務暫時無法使用 | Azure Speech Services 暫時無法連線 |

### 錯誤回應範例

**400 Bad Request - 缺少參數**:
```json
{
  "success": false,
  "error": "缺少必填參數: audio",
  "code": "VALIDATION_ERROR"
}
```

**400 Bad Request - 不支援的語言**:
```json
{
  "success": false,
  "error": "不支援的語言代碼: fr-FR",
  "code": "INVALID_LANGUAGE",
  "details": {
    "supportedLanguages": ["zh-TW", "en-US", "ja-JP"]
  }
}
```

**503 Service Unavailable**:
```json
{
  "success": false,
  "error": "語音辨識服務暫時無法使用，請稍後再試",
  "code": "SERVICE_UNAVAILABLE"
}
```

---

## 效能考量

### API 回應時間

| 音訊長度 | 目標回應時間 | 實際測試結果 |
|---------|------------|-------------|
| 0-3 秒 | < 500ms | TBD |
| 3-10 秒 | < 1000ms | TBD |
| 10-30 秒 | < 2000ms | TBD |

### 最佳實踐

1. **音訊格式**: 使用 WAV 格式，採樣率 16kHz，單聲道
2. **檔案大小**: 建議控制在 1MB 以下
3. **錄音時長**: 建議每段錄音 3-10 秒，最長不超過 30 秒
4. **錯誤處理**: 實作友善的錯誤訊息和重試機制
5. **使用者體驗**: 顯示 `isTranscribing` 狀態，提供視覺回饋

---

## 客戶端整合

### chatStore 整合

Sprint 3 在 `chatStore` 中新增了語音功能相關的狀態和方法：

**新增狀態**:
```typescript
interface ChatStore {
  // ... 其他狀態
  selectedLanguage: SupportedLanguage  // 當前選擇的語言
  isTranscribing: boolean             // 是否正在轉換中
}
```

**新增方法**:
```typescript
interface ChatStore {
  // ... 其他方法
  setLanguage: (language: SupportedLanguage) => void
  transcribeAudio: (audioBlob: Blob) => Promise<string>
}
```

### 使用範例

```typescript
import { useChatStore } from '@/stores/chatStore'

function VoiceInputComponent() {
  const {
    selectedLanguage,
    isTranscribing,
    setLanguage,
    transcribeAudio,
    setInput,
  } = useChatStore()

  const handleVoiceInput = async (audioBlob: Blob) => {
    try {
      // 轉換音訊為文字
      const text = await transcribeAudio(audioBlob)

      // 將文字設定到輸入框
      setInput(text)

      console.log('轉換成功:', text)
    } catch (error) {
      console.error('語音轉文字失敗:', error)
    }
  }

  return (
    <div>
      {isTranscribing && <p>正在處理語音...</p>}
      {/* 語音輸入 UI */}
    </div>
  )
}
```

---

## 持久化

### localStorage 持久化

`selectedLanguage` 狀態會自動持久化到 localStorage：

**Storage Key**: `chat-storage`

**持久化內容**:
```json
{
  "state": {
    "selectedLanguage": "zh-TW"
  },
  "version": 0
}
```

**特性**:
- ✅ 自動儲存語言偏好
- ✅ 頁面重新載入後保留設定
- ✅ 跨 session 保持一致

---

## 測試

### 單元測試

**chatStore 語音功能測試**: `tests/stores/chatStore.voice.test.ts`

測試涵蓋：
- ✅ `setLanguage()` 方法（4 tests）
- ✅ `transcribeAudio()` 方法（7 tests）
- ✅ localStorage 持久化（2 tests）
- ✅ TypeScript 型別安全（1 test）

執行測試：
```bash
npm test -- tests/stores/chatStore.voice.test.ts
```

### UI 組件測試

**語音輸入 UI 組件測試**: `tests/components/chat/`

測試涵蓋：
- ✅ `VoiceInputButton.test.tsx` - 14 tests
- ✅ `RecordingIndicator.test.tsx` - 15 tests
- ✅ `LanguageSelector.test.tsx` - 17 tests

執行測試：
```bash
npm test -- tests/components/chat/
```

### E2E 測試

> 🚧 待實作：E2E 語音輸入流程測試

預計測試場景：
- 完整語音輸入到對話流程
- 多語言切換
- 錯誤處理與重試

---

## 安全性

### Rate Limiting

> 🚧 待實作：API Rate Limiting

建議限制：
- **每個 IP**: 20 次 / 分鐘
- **單一 Session**: 10 次 / 分鐘

### 資料驗證

- ✅ 驗證音訊檔案格式（WAV）
- ✅ 驗證音訊檔案大小（< 10MB）
- ✅ 驗證語言代碼（白名單）
- ✅ 清理使用者輸入

### 隱私保護

- ❌ 不儲存使用者音訊檔案
- ✅ 音訊僅用於即時轉換
- ✅ 轉換完成後立即清理

---

## Azure Speech Services 配置

### 環境變數

```bash
AZURE_SPEECH_KEY=your_speech_key_here
AZURE_SPEECH_REGION=eastasia
```

### 語音辨識配置

```typescript
// lib/azure/speech.ts
const speechConfig = sdk.SpeechConfig.fromSubscription(
  process.env.AZURE_SPEECH_KEY!,
  process.env.AZURE_SPEECH_REGION!
)

// 設定辨識語言
speechConfig.speechRecognitionLanguage = language

// 輸出格式
speechConfig.outputFormat = sdk.OutputFormat.Detailed
```

### 支援的語音模型

| 語言 | 模型代碼 | 說明 |
|------|---------|------|
| 繁體中文 | `zh-TW` | 台灣繁體中文 |
| 英文 | `en-US` | 美式英文 |
| 日文 | `ja-JP` | 日本語 |

---

## 相關文件

- **Sprint 3 計劃**: `docs/SPRINT_3_PLAN.md`
- **MVP 進度**: `docs/MVP_PROGRESS.md`
- **測試指南**: `tests/README.md`
- **Sprint 2 API**: `docs/API_REFERENCE_SPRINT2.md`

---

## 變更記錄

### 2025-10-17
- ✅ 新增 POST /api/stt 端點文件
- ✅ 新增 chatStore 語音功能說明
- ✅ 新增測試文件連結

---

**Last Updated**: 2025-10-17
**Sprint**: Sprint 3
**Status**: 🚧 開發中
