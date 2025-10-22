# 調試測試指南 - Lip Sync 和音訊播放問題

**日期**: 2025-10-20
**問題**: 對話時沒有聲音，Lip Sync 未啟動
**狀態**: 🔧 修復中 - 第二次測試

---

## 🔍 第一次測試結果診斷

從第一次測試的 Console 輸出發現：

1. ✅ **Viseme 資料成功** - 95 個 Viseme 返回
2. ✅ **音訊播放成功** - `[AudioPlayer] Playback ended`
3. ❌ **Lip Sync 未初始化** - 缺少初始化日誌
4. ❌ **Lip Sync 被跳過** - `[LipSyncController] Lip Sync 未啟用，跳過播放`

### 根本原因

**Lip Sync 控制器根本沒有被初始化！**

原因：`useAvatarAnimation` Hook 中，Lip Sync 初始化依賴於 `headMeshRef.current`，而這個 ref 只在 `enableBlinking` 區塊中設定。雖然 `enableBlinking: true`，但可能：

1. Head mesh 未找到
2. morphTargetDictionary 不存在
3. 或初始化失敗但沒有日誌

### 已實作修復

**檔案**: `components/avatar/hooks/useAvatarAnimation.ts`

修改：
- ✅ Lip Sync 初始化不再依賴 `enableBlinking` 的副作用
- ✅ 獨立搜尋 head mesh
- ✅ 添加詳細的初始化日誌
- ✅ 明確的成功/失敗狀態

---

## ✅ 已完成的調試改進

### 1. LipSyncController 調試日誌

**檔案**: `lib/lipsync/controller.ts`

添加的日誌：
- Line 61-62: 輸出所有可用的 morphTargets
- Line 68-70: 當 Viseme 不支援時，提示需要的 blendshapes

### 2. AudioPlayer 調試日誌

**檔案**: `lib/audio/player.ts`

添加的日誌：
- Line 92: play() 函數被呼叫
- Line 95: AudioContext 狀態
- Line 104: Buffer 音訊時長
- Line 116: 播放結束通知
- Line 128: 播放開始和當前時間

### 3. audioStore 調試日誌

**檔案**: `stores/audioStore.ts`

添加的日誌：
- Line 192: Blob URL 創建
- Line 196-198: 音訊 Buffer 載入進度和時長
- Line 210: 狀態設為 PLAYING 和 Viseme 數量
- Line 217: 開始播放音訊

---

## 🧪 測試步驟

### 步驟 1: 重新載入頁面

1. 在瀏覽器中訪問: http://localhost:3005/zh-TW/conversations
2. 按 **Ctrl+Shift+I** (或 F12) 打開開發者工具
3. 切換到 **Console** 標籤
4. 按 **Ctrl+L** 清空 Console

### 步驟 2: 測試對話

1. 在對話框輸入: `你好，請說一句話`
2. 點擊「發送」按鈕
3. **仔細觀察 Console 輸出**

### 步驟 3: 收集 Console 輸出

請複製並提供以下日誌（如果有）：

#### A. Lip Sync 初始化日誌
```
[LipSyncController] 可用的 morphTargets: [...]
[LipSyncController] 初始化成功
或
[LipSyncController] Avatar 不支援 Viseme Blendshapes，Lip Sync 將被禁用
```

#### B. 音訊處理日誌
```
[audioStore] Blob URL created: blob:...
[audioStore] Loading audio buffer...
[audioStore] Audio buffer loaded, duration: X.XX s
[audioStore] Setting state to PLAYING, visemes count: XXX
[audioStore] Starting playback...
```

#### C. AudioPlayer 日誌
```
[AudioPlayer] play() called
[AudioPlayer] AudioContext initialized, state: running
[AudioPlayer] Buffer duration: X.XX s
[AudioPlayer] Playback started successfully, AudioContext.currentTime: X.XXX s
```

#### D. useAvatarAnimation 日誌
```
[useAvatarAnimation] 啟動 Lip Sync，Viseme 數量: XXX，音訊開始時間: XX.XXXs
```

#### E. 任何錯誤訊息
```
[LipSyncController] Lip Sync 未啟用，跳過播放
或任何其他紅色錯誤訊息
```

---

## 🔍 預期問題診斷

### 問題 1: Avatar 不支援 Viseme Blendshapes

**症狀**:
```
[LipSyncController] Avatar 不支援 Viseme Blendshapes，Lip Sync 將被禁用
[LipSyncController] 可用的 morphTargets: [...]
```

**原因**:
- Ready Player Me Avatar 沒有標準的 Oculus Viseme blendshapes
- 名稱可能不同或完全缺失

**解決方案**:
1. 查看 `可用的 morphTargets` 列表
2. 檢查是否有類似的 blendshapes（如 `mouthOpen`, `jawOpen` 等）
3. 修改 `viseme-mapper.ts` 來適配實際的 blendshapes

### 問題 2: AudioContext Suspended

**症狀**:
```
[AudioPlayer] AudioContext is suspended, attempting to resume...
```

**原因**:
- 瀏覽器安全策略要求用戶互動才能播放音訊
- iOS Safari 常見問題

**解決方案**:
- 再次點擊頁面任何位置
- 重新發送對話

### 問題 3: 沒有 Viseme 資料

**症狀**:
```
[audioStore] Setting state to PLAYING, visemes count: 0
```

**原因**:
- TTS API 沒有返回 Viseme 資料
- 或返回空陣列

**解決方案**:
- 檢查 TTS API 回應
- 確認 Speech SDK 正常運作

### 問題 4: 沒有任何音訊日誌

**症狀**:
- Console 沒有 `[audioStore]` 或 `[AudioPlayer]` 日誌

**原因**:
- TTS API 請求失敗
- 或 `speakText()` 未被呼叫

**解決方案**:
- 檢查 Network 標籤中的 `/api/tts` 請求
- 查看是否有 HTTP 錯誤

---

## 📋 需要提供的信息

請提供：

1. **完整的 Console 輸出**（從頁面載入到對話完成）
2. **任何紅色錯誤訊息**
3. **Network 標籤中 `/api/tts` 請求的詳細信息**:
   - HTTP 狀態碼
   - Response 內容（特別是 `visemes` 陣列）
   - 請求時長
4. **Avatar 的 `morphTargets` 列表**（從 Console 輸出中）

---

## 🎯 下一步

根據您提供的調試輸出，我將能夠：

1. **診斷確切問題** - 是 Viseme 支援、音訊播放、還是 API 問題
2. **實作具體修復** - 針對問題根源進行修復
3. **驗證解決方案** - 確保音訊和 Lip Sync 正常運作

---

**測試開始時間**: _____________
**測試完成時間**: _____________
**測試結果**: ⬜ 通過 / ⬜ 失敗
