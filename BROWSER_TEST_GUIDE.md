# 瀏覽器測試指南 - 診斷音訊播放問題

**日期**: 2025-10-20
**狀態**: 後端 API 全部正常，問題在前端

---

## ✅ 已確認正常的部分

1. **Chat API** - 測試通過，返回正確的 LLM 回應
2. **TTS API** - 測試通過，返回音訊 + 65 個 Viseme 資料
3. **Lip Sync 控制器** - 初始化成功（無警告）
4. **morphTargets** - 已成功載入到 Avatar

## ❌ 需要診斷的部分

**前端音訊播放鏈**：從 chatStore 到 audioStore 到 AudioPlayer

---

## 🧪 瀏覽器 Console 測試

請在 http://localhost:3005/zh-TW/conversations 頁面打開 **F12 Console**，執行以下測試：

### 測試 1: 檢查 Zustand Store 是否存在

```javascript
// 檢查 audioStore 是否可訪問
console.log('useAudioStore:', typeof useAudioStore)

// 如果 useAudioStore 未定義，嘗試直接測試 TTS
// (表示 store 未正確暴露到全局)
```

### 測試 2: 手動觸發 TTS 播放

```javascript
// 直接呼叫 TTS API 並播放
async function testTTS() {
  try {
    console.log('[Test] 開始測試 TTS...')

    const response = await fetch('/api/tts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: '你好，這是測試語音' })
    })

    console.log('[Test] TTS Response status:', response.status)

    if (!response.ok) {
      console.error('[Test] TTS 失敗')
      return
    }

    const data = await response.json()
    console.log('[Test] TTS 資料:', {
      audioLength: data.audio?.length,
      visemesCount: data.visemes?.length,
      duration: data.duration
    })

    // 嘗試播放音訊
    const audioBlob = base64ToBlob(data.audio, 'audio/mpeg')
    const audioUrl = URL.createObjectURL(audioBlob)
    const audio = new Audio(audioUrl)

    console.log('[Test] 嘗試播放音訊...')
    await audio.play()
    console.log('[Test] 音訊播放中!')

  } catch (error) {
    console.error('[Test] 錯誤:', error)
  }
}

// Base64 轉 Blob 輔助函數
function base64ToBlob(base64, mimeType) {
  const byteCharacters = atob(base64)
  const byteNumbers = new Array(byteCharacters.length)
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i)
  }
  const byteArray = new Uint8Array(byteNumbers)
  return new Blob([byteArray], { type: mimeType })
}

// 執行測試
testTTS()
```

**預期結果**:
- 如果聽到聲音 → audioStore 或 chatStore 的連接有問題
- 如果沒有聲音 → 瀏覽器音訊播放策略或 AudioContext 問題

### 測試 3: 檢查 AudioContext 狀態

```javascript
// 檢查 AudioContext 是否被暫停
if (window.AudioContext || window.webkitAudioContext) {
  const ctx = new (window.AudioContext || window.webkitAudioContext)()
  console.log('AudioContext state:', ctx.state)
  // 應該是 'running' 或 'suspended'

  if (ctx.state === 'suspended') {
    console.log('⚠️ AudioContext 被暫停！嘗試恢復...')
    ctx.resume().then(() => {
      console.log('✅ AudioContext 已恢復:', ctx.state)
    })
  }
} else {
  console.error('❌ AudioContext 不支援!')
}
```

### 測試 4: 檢查對話是否正確完成

發送一個對話，然後檢查 Console：

```
預期看到的日誌順序：
1. [Chat相關] ...
2. [Performance] LLM Response Time: XXXms
3. [Performance] TTS Time: XXXms          ← 應該要有這個
4. [Performance] Total E2E Time: XXXms
5. [audioStore] Blob URL created: ...     ← 如果沒有這個，表示 speakText 未被呼叫
```

**如果缺少 audioStore 日誌**，請執行：

```javascript
// 檢查 chatStore 的狀態
console.log('Messages:', window.__zustandStores?.chatStore?.messages)
console.log('Is Loading:', window.__zustandStores?.chatStore?.isLoading)
```

---

## 🎯 診斷決策樹

### 情況 A: 測試 2 可以聽到聲音
**結論**: 瀏覽器音訊播放正常，問題在 chatStore → audioStore 的連接

**可能原因**:
1. SSE 串流的 onDone 回調未被觸發
2. chatStore 中的 try-catch 捕捉了錯誤但未打印
3. audioStore.speakText 未被正確導入

**解決方案**: 添加更多日誌到 chatStore，或檢查 SSE 串流是否正確結束

---

### 情況 B: 測試 2 沒有聲音，但沒有錯誤
**結論**: 瀏覽器自動播放策略阻止

**可能原因**:
- Chrome/Edge 需要用戶互動才能播放音訊
- AudioContext 處於 suspended 狀態

**解決方案**:
1. 點擊頁面任何位置後重試
2. 檢查測試 3 的 AudioContext 狀態
3. 添加用戶互動觸發音訊播放

---

### 情況 C: 測試 2 拋出錯誤
**結論**: 瀏覽器環境問題

**可能原因**:
- Base64 解碼失敗
- Blob 創建失敗
- Audio API 不支援

**解決方案**: 檢查錯誤訊息，可能需要瀏覽器更新或配置調整

---

## 📋 測試清單

請執行以上測試，並提供以下信息：

- [ ] 測試 1 結果: useAudioStore 是否存在？
- [ ] 測試 2 結果: 手動 TTS 是否有聲音？
- [ ] 測試 3 結果: AudioContext 狀態是什麼？
- [ ] 測試 4 結果: 對話後是否有 audioStore 日誌？

---

## 🔧 快速修復建議

**如果測試 2 可以聽到聲音**，最可能的問題是 chatStore 未正確呼叫 audioStore。

建議修復：在 chatStore 的 line 217 之前添加日誌：

```typescript
// 自動播放語音（非阻塞）
console.log('[chatStore] 準備呼叫 speakText, 內容長度:', fullContent.length)
try {
  const ttsStartTime = Date.now()
  const { speakText } = useAudioStore.getState()
  console.log('[chatStore] speakText 函數:', typeof speakText)
  await speakText(fullContent)
  // ...
```

這會幫助我們確認 speakText 是否被正確取得和呼叫。

---

**當前時間**: 2025-10-20
**下一步**: 執行瀏覽器測試並提供結果
