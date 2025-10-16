# Sprint 3 開發計劃 - 語音輸入（STT）整合

> **Sprint Goal**: 實作完整的語音輸入功能，讓使用者可以透過語音與 Avatar 對話
> **Sprint 時間**: Sprint 3 (Week 5-6)
> **Story Points**: 8 SP (預計 4 個工作天)
> **優先級**: P0

---

## 📋 Story 1.3: 語音輸入（STT）整合

### 驗收標準

- [ ] 聊天介面新增「語音輸入」按鈕（麥克風圖示）
- [ ] 點擊按鈕後請求麥克風權限
- [ ] 麥克風開啟後顯示錄音波形動畫
- [ ] 使用者可透過點擊停止錄音
- [ ] 語音自動轉換為文字並顯示在輸入框
- [ ] 使用者可編輯轉換後的文字
- [ ] 使用者可直接送出語音轉換的文字
- [ ] 支援繁體中文、英文、日文語音輸入
- [ ] 語音輸入失敗時顯示友善錯誤訊息
- [ ] 行動裝置上語音輸入正常運作

---

## 🎯 開發階段規劃

### Phase 1: STT API 端點實作 (2 SP - Day 1)

**目標**: 建立語音轉文字的後端 API

**技術細節**:
- Azure Speech Services Speech-to-Text API
- 支援多語言：繁體中文 (zh-TW)、英文 (en-US)、日文 (ja-JP)
- 音訊格式：WAV, 16kHz, 16-bit, Mono
- 回傳信心分數 (confidence score)

**API 設計**:
```typescript
// POST /api/stt
interface STTRequest {
  audioBlob: Blob  // WAV 音訊檔案
  language: 'zh-TW' | 'en-US' | 'ja-JP'  // 語言選擇
}

interface STTResponse {
  success: boolean
  data?: {
    text: string           // 轉換後的文字
    confidence: number     // 信心分數 (0-1)
    language: string       // 使用的語言
    duration: number       // 音訊長度 (秒)
  }
  error?: string
}
```

**檔案清單**:
- `app/api/stt/route.ts` - STT API 端點
- `lib/azure/speech-stt.ts` - Azure Speech SDK 封裝
- `types/stt.ts` - STT 相關型別定義

---

### Phase 2: 音訊錄製功能 (2 SP - Day 1-2)

**目標**: 實作瀏覽器端音訊錄製與處理

**技術細節**:
- Web Audio API - 音訊串流處理
- MediaRecorder API - 音訊錄製
- AudioContext - 音訊分析與處理
- Blob 轉換 - 將錄音轉為 WAV 格式

**功能需求**:
1. 請求麥克風權限
2. 開始/停止錄音控制
3. 即時音訊波形分析（用於視覺化）
4. 音訊格式轉換 (WebM → WAV, 16kHz, Mono)
5. 錄音時長限制（最多 60 秒）
6. 錯誤處理（權限拒絕、裝置不支援）

**檔案清單**:
- `lib/audio/recorder.ts` - 音訊錄製工具類別
- `lib/audio/audio-utils.ts` - 音訊格式轉換工具
- `hooks/useAudioRecorder.ts` - React Hook 封裝

---

### Phase 3: 語音輸入 UI 組件 (2 SP - Day 2-3)

**目標**: 建立語音輸入的使用者介面

**組件設計**:

#### 1. VoiceInputButton 組件
- 麥克風圖示按鈕
- 三種狀態：閒置 (idle)、錄音中 (recording)、處理中 (processing)
- 動畫效果：錄音時脈動動畫
- 鍵盤快捷鍵支援 (Space 或 Ctrl+M)

#### 2. RecordingIndicator 組件
- 錄音波形視覺化 (Canvas API)
- 錄音時長顯示
- 停止錄音按鈕
- 音量指示器

#### 3. LanguageSelector 組件
- 語言選擇下拉選單
- 支援：繁體中文、English、日本語
- 記住使用者偏好設定

**檔案清單**:
- `components/chat/VoiceInputButton.tsx` - 語音輸入按鈕
- `components/chat/RecordingIndicator.tsx` - 錄音指示器
- `components/chat/LanguageSelector.tsx` - 語言選擇器
- `components/chat/VoiceWaveform.tsx` - 波形視覺化

**UI 狀態流程**:
```
閒置 (idle)
  ↓ [點擊麥克風按鈕]
請求權限
  ↓ [允許]
錄音中 (recording) [顯示波形]
  ↓ [點擊停止 或 自動停止]
處理中 (processing) [顯示 Spinner]
  ↓ [STT API 回應]
完成 (文字顯示在輸入框)
  ↓
閒置 (idle)
```

---

### Phase 4: 整合至聊天介面 (1 SP - Day 3)

**目標**: 將語音輸入整合到現有聊天系統

**整合點**:
1. ChatInterface 組件新增語音輸入按鈕
2. 語音轉文字後自動填入輸入框
3. 使用者可編輯轉換後的文字
4. 保持現有的文字輸入功能
5. 錯誤處理與使用者提示

**狀態管理**:
```typescript
// 擴充 chatStore
interface ChatStore {
  // ... 現有狀態

  // 語音輸入相關
  isRecording: boolean
  recordingDuration: number
  selectedLanguage: 'zh-TW' | 'en-US' | 'ja-JP'

  // 動作
  startRecording: () => Promise<void>
  stopRecording: () => Promise<void>
  transcribeAudio: (audioBlob: Blob) => Promise<void>
  setLanguage: (lang: string) => void
}
```

**檔案更新**:
- `components/chat/ChatInterface.tsx` - 整合語音輸入
- `stores/chatStore.ts` - 新增語音輸入狀態與動作

---

### Phase 5: 測試與優化 (1 SP - Day 4)

**目標**: 確保功能穩定性與使用者體驗

**測試項目**:

#### 1. 單元測試
- [ ] STT API 端點測試
- [ ] 音訊錄製工具測試
- [ ] 音訊格式轉換測試
- [ ] 語言選擇邏輯測試

#### 2. E2E 測試
- [ ] 語音輸入完整流程（Playwright）
- [ ] 麥克風權限處理
- [ ] 錯誤情境測試
- [ ] 行動裝置測試

#### 3. 效能優化
- [ ] 音訊處理效能優化
- [ ] Blob 記憶體管理
- [ ] API 回應時間優化 (<3 秒)
- [ ] 行動裝置相容性測試

#### 4. 使用者體驗
- [ ] 載入狀態提示
- [ ] 錯誤訊息友善化
- [ ] 鍵盤快捷鍵支援
- [ ] 觸控裝置優化

**檔案清單**:
- `tests/lib/audio/recorder.test.ts` - 錄音工具測試
- `tests/api/stt.test.ts` - STT API 測試
- `tests/e2e/voice-input.spec.ts` - E2E 測試

---

## 📦 技術架構

### Azure Speech Services 設定

**環境變數** (已在 `.env.local` 配置):
```bash
AZURE_SPEECH_KEY=your_speech_key_here
AZURE_SPEECH_REGION=eastasia
```

**SDK 使用**:
```typescript
import * as sdk from 'microsoft-cognitiveservices-speech-sdk'

const speechConfig = sdk.SpeechConfig.fromSubscription(
  process.env.AZURE_SPEECH_KEY!,
  process.env.AZURE_SPEECH_REGION!
)

speechConfig.speechRecognitionLanguage = 'zh-TW'
```

### Web Audio API 架構

```typescript
// 音訊錄製流程
navigator.mediaDevices.getUserMedia({ audio: true })
  → MediaStream
  → MediaRecorder
  → Blob (WebM)
  → AudioContext.decodeAudioData()
  → AudioBuffer
  → 轉換為 WAV (16kHz, Mono)
  → 上傳至 STT API
```

---

## 🎨 UI/UX 設計

### 語音輸入按鈕設計

**閒置狀態**:
```
┌─────────────┐
│  🎤 語音輸入  │
└─────────────┘
```

**錄音中狀態**:
```
┌─────────────┐
│  ⏺ 錄音中... │  [脈動動畫]
│  00:05       │
└─────────────┘
```

**處理中狀態**:
```
┌─────────────┐
│  ⏳ 處理中... │  [Spinner]
└─────────────┘
```

### 波形視覺化

```
音量: ▁▂▃▅▆▇█▇▆▅▃▂▁
時間: 00:05 / 01:00
     [停止錄音]
```

---

## 🚀 部署考量

### Azure Speech Services 配額
- **免費層**: 5 小時/月語音轉文字
- **標準層**: Pay-as-you-go
- **成本估算**: 約 NT$1/分鐘音訊

### 效能目標
- STT API 回應時間: <3 秒（10 秒音訊）
- 麥克風權限請求: 即時
- 錄音啟動延遲: <200ms
- 波形視覺化 FPS: ≥30

### 瀏覽器支援
- Chrome/Edge: ✅ 完整支援
- Firefox: ✅ 完整支援
- Safari (macOS): ✅ 支援（需 HTTPS）
- Safari (iOS): ✅ 支援（需使用者互動）
- Android Chrome: ✅ 支援

---

## 📝 驗收檢查清單

### 功能性
- [ ] 語音輸入按鈕正常顯示
- [ ] 麥克風權限請求正常
- [ ] 錄音功能正常運作
- [ ] 波形視覺化正常顯示
- [ ] 語音轉文字準確率 >85%
- [ ] 支援繁中、英文、日文
- [ ] 文字自動填入輸入框
- [ ] 使用者可編輯轉換文字
- [ ] 錯誤處理正常

### 品質標準
- [ ] TypeScript 類型檢查通過
- [ ] ESLint 檢查通過
- [ ] 單元測試覆蓋率 >80%
- [ ] E2E 測試通過
- [ ] 無 console 錯誤

### 效能標準
- [ ] STT API 回應 <3 秒
- [ ] 錄音啟動 <200ms
- [ ] 記憶體洩漏檢查通過
- [ ] 行動裝置效能正常

### 使用者體驗
- [ ] 載入狀態提示清楚
- [ ] 錯誤訊息友善
- [ ] 響應式設計正常
- [ ] 觸控裝置操作流暢
- [ ] 鍵盤快捷鍵正常

---

## 📚 參考資料

### Azure Speech SDK
- [Azure Speech-to-Text 文件](https://learn.microsoft.com/zh-tw/azure/ai-services/speech-service/speech-to-text)
- [Speech SDK JavaScript 快速入門](https://learn.microsoft.com/zh-tw/azure/ai-services/speech-service/quickstarts/speech-to-text-from-microphone?pivots=programming-language-javascript)

### Web Audio API
- [MediaRecorder API](https://developer.mozilla.org/en-US/docs/Web/API/MediaRecorder)
- [Web Audio API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API)
- [AudioContext](https://developer.mozilla.org/en-US/docs/Web/API/AudioContext)

### 音訊處理
- [WAV File Format](http://soundfile.sapp.org/doc/WaveFormat/)
- [Audio Resampling](https://github.com/rochars/wavefile)

---

**Last Updated**: 2025-10-16
**Status**: 📋 規劃完成 - 準備開始開發
