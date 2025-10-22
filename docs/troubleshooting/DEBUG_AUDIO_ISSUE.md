# 音訊問題調試指南

**日期**: 2025-10-20
**問題**: Lip Sync 初始化成功（無警告），但沒有聲音和嘴型動作
**狀態**: 🔧 調查中

---

## 📋 當前狀態

### ✅ 已解決的問題
1. ✅ Lip Sync 控制器初始化問題 - 已修復
2. ✅ Avatar morphTargets 缺失 - 已添加 URL 參數
3. ✅ 瀏覽器快取問題 - 用戶已清除快取

### ❌ 當前問題
1. ❌ 對話時沒有聲音
2. ❌ Avatar 沒有嘴型活動
3. ⚠️ 只有性能警告：`[Performance] E2E delay exceeded target: 3589ms > 2500ms`

### 🔍 關鍵觀察
- **無 LipSyncController 警告** - 表示初始化成功
- **無 audioStore 日誌** - 音訊播放鏈可能未啟動
- **無 AudioPlayer 日誌** - 音訊播放器未被呼叫
- **無 TTS Error** - TTS API 可能未被呼叫或靜默失敗

---

## 🧪 詳細測試步驟

### 步驟 1: 重新載入並準備

1. 訪問：http://localhost:3005/zh-TW/conversations
2. 按 **F12** 打開開發者工具
3. 切換到 **Console** 標籤
4. 按 **Ctrl+L** 清空 Console
5. 切換到 **Network** 標籤，準備監控 API 請求

### 步驟 2: 進行對話測試

1. 在對話框輸入：**"你好，請說一句話"**
2. 點擊「發送」按鈕
3. **等待完整回應**

### 步驟 3: 收集 Console 日誌

請複製**所有** Console 輸出，特別注意以下日誌：

#### A. LLM 相關日誌（應該會出現）
```
[Performance] LLM Response Time: XXXXms
```

#### B. TTS 相關日誌（重點！）
**如果出現以下任何日誌，請複製**：
```
[TTS Error] ...
[audioStore] Blob URL created: ...
[audioStore] Loading audio buffer...
[audioStore] Audio buffer loaded, duration: X.XX s
[audioStore] Setting state to PLAYING, visemes count: XXX
[audioStore] Starting playback...
```

#### C. AudioPlayer 日誌（重點！）
**如果出現以下任何日誌，請複製**：
```
[AudioPlayer] play() called
[AudioPlayer] AudioContext initialized, state: ...
[AudioPlayer] Buffer duration: X.XX s
[AudioPlayer] Playback started successfully, AudioContext.currentTime: X.XXX s
[AudioPlayer] Playback ended
```

#### D. Lip Sync 相關日誌（重點！）
**如果出現以下任何日誌，請複製**：
```
[useAvatarAnimation] 啟動 Lip Sync，Viseme 數量: XXX，音訊開始時間: XX.XXXs
[LipSyncController] 開始播放，Viseme 數量: XXX，音訊開始時間: X.XXXs
```

#### E. 任何錯誤訊息（紅色文字）
**請複製所有紅色錯誤訊息！**

### 步驟 4: 檢查 Network 標籤

切換到 **Network** 標籤，找到以下請求：

#### 1. `/api/chat` 請求
- **狀態碼**: 應該是 200
- **Type**: 應該是 `eventsource` 或 `text/event-stream`
- **Response**: 應該有內容

#### 2. `/api/tts` 請求（重點！）
- **是否存在？** ⬜ 是 / ⬜ 否
- **狀態碼**: _______
- **Size**: _______
- **Time**: _______
- **Response**: 點擊查看是否有音訊資料

**如果 `/api/tts` 請求不存在** - 這表示 TTS 根本沒有被呼叫！

**如果 `/api/tts` 請求失敗** - 請複製錯誤訊息

---

## 🎯 診斷決策樹

### 情況 1: 沒有 `/api/tts` 請求
**症狀**: Network 標籤中沒有 `/api/tts` 請求

**原因**:
- `speakText()` 未被呼叫
- 或 `fullContent` 為空
- 或 try-catch 在更早階段失敗

**解決方案**: 需要檢查 chatStore 的 sendMessage 邏輯

---

### 情況 2: `/api/tts` 請求失敗（4xx/5xx 錯誤）
**症狀**: Network 標籤中 `/api/tts` 狀態碼為紅色

**原因**:
- TTS API 錯誤
- Azure Speech Services 配置問題
- 網路問題

**解決方案**: 檢查 TTS API 錯誤訊息，修復配置

---

### 情況 3: `/api/tts` 成功但沒有 audioStore 日誌
**症狀**:
- Network 標籤中 `/api/tts` 狀態碼 200
- 但 Console 沒有 `[audioStore]` 日誌

**原因**:
- TTS API 回應格式錯誤
- audioStore.speakText() 拋出異常但被捕捉
- 回應解析失敗

**解決方案**: 檢查 TTS API 回應內容，添加更多日誌

---

### 情況 4: audioStore 日誌存在但沒有 AudioPlayer 日誌
**症狀**:
- Console 有 `[audioStore] Starting playback...`
- 但沒有 `[AudioPlayer] play() called`

**原因**:
- AudioPlayer.play() 未被呼叫
- 或 await 失敗

**解決方案**: 檢查 audioStore 和 AudioPlayer 的連接

---

### 情況 5: AudioPlayer 日誌存在但 AudioContext suspended
**症狀**:
- Console 有 `[AudioPlayer] AudioContext initialized, state: suspended`

**原因**:
- 瀏覽器安全策略，需要用戶互動才能播放音訊

**解決方案**: 點擊頁面任何位置，重新發送對話

---

### 情況 6: 音訊播放但沒有 Lip Sync
**症狀**:
- 有聲音
- 有 `[AudioPlayer]` 日誌
- 但沒有 `[useAvatarAnimation] 啟動 Lip Sync` 日誌

**原因**:
- Viseme 資料為空或未設定到 audioStore
- audioState 未正確設為 'playing'
- useEffect 依賴未觸發

**解決方案**: 檢查 audioStore 的 currentVisemes 和 state

---

## 📊 需要提供的完整信息

請提供以下**完整**信息：

### 1. Console 輸出
```
[請貼上完整的 Console 輸出，從頁面載入到對話完成]
```

### 2. Network 請求
- [ ] `/api/chat` 狀態: _______
- [ ] `/api/tts` 是否存在: ⬜ 是 / ⬜ 否
- [ ] `/api/tts` 狀態碼: _______
- [ ] `/api/tts` Response 內容: _______

### 3. 觀察到的行為
- [ ] 是否看到 Avatar 載入: ⬜ 是 / ⬜ 否
- [ ] 是否看到對話回應: ⬜ 是 / ⬜ 否
- [ ] 是否聽到聲音: ⬜ 是 / ⬜ 否
- [ ] 是否看到嘴型動作: ⬜ 是 / ⬜ 否

---

## 🔧 額外調試選項

如果上述信息不足以診斷問題，可以嘗試：

### 選項 1: 手動測試 TTS API

在 Console 執行：

```javascript
fetch('/api/tts', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ text: '你好，這是測試' })
})
  .then(res => {
    console.log('TTS Response status:', res.status)
    return res.json()
  })
  .then(data => {
    console.log('TTS Response data:', data)
  })
  .catch(err => {
    console.error('TTS Request failed:', err)
  })
```

### 選項 2: 檢查 audioStore 狀態

在 Console 執行：

```javascript
// 獲取 audioStore 當前狀態
const audioStoreState = window.__ZUSTAND_STORES__?.audioStore?.getState?.() || 'Not available'
console.log('audioStore state:', audioStoreState)
```

### 選項 3: 檢查 AudioContext 狀態

在 Console 執行：

```javascript
// 檢查 AudioContext 是否存在
if (window.AudioContext || window.webkitAudioContext) {
  console.log('AudioContext supported')
} else {
  console.error('AudioContext NOT supported!')
}
```

---

**測試開始時間**: _____________
**測試完成時間**: _____________
**診斷結果**: _____________
