# POC 問題修復計劃
**日期**: 2025-10-15
**狀態**: 待修復
**優先級**: 高（影響核心功能展示）

---

## 問題清單

### 🔴 高優先級（核心功能）

#### 問題1：Avatar沒有嘴型同步
**症狀**: 語音播放時，Avatar嘴巴沒有動作
**預期**: 嘴型應與語音同步開合

**診斷**:
- ✅ 後端TTS API正常生成Viseme數據（100+個visemes）
- ✅ 音訊成功播放
- ❌ Viseme數據未傳遞給Avatar或未觸發動畫

**可能原因**:
1. Lip Sync Controller未正確初始化
2. Viseme數據未從audioStore傳遞到Avatar組件
3. useAvatarAnimation未整合Lip Sync邏輯
4. Avatar模型缺少必要的blendshapes

**修復方案**:
1. 檢查 `audioStore.ts` 是否正確存儲visemes
2. 檢查 `AvatarModel.tsx` 是否接收並使用visemes
3. 檢查 `useAvatarAnimation.ts` 是否整合LipSyncController
4. 驗證Ready Player Me模型支援的blendshapes

**預計修復時間**: 2-4小時

---

#### 問題2：沒有基本嘴部動作
**症狀**: 即使沒有Lip Sync，基本嘴部動作（fallback）也沒有
**預期**: 至少應有簡單的嘴巴開合動畫

**診斷**:
- ❌ Fallback動畫未觸發
- 可能與問題1相同根因

**修復方案**:
- 啟用 `lib/lipsync/fallback.ts` 的簡單動畫
- 在Viseme數據缺失時自動切換到fallback

**預計修復時間**: 1-2小時

---

#### 問題4：Avatar沒有眨眼
**症狀**: Avatar完全不眨眼
**預期**: 2-6秒隨機間隔眨眼

**診斷**:
- ❌ BlinkController未正確初始化或未運行
- ❌ Avatar模型可能缺少眼睛blendshapes

**可能原因**:
1. `useAvatarAnimation.ts` 中BlinkController未啟動
2. Avatar模型不支援眨眼blendshapes（eyeBlinkLeft/Right）
3. useFrame更新邏輯有問題

**修復方案**:
1. 檢查BlinkController是否正確初始化
2. 驗證Avatar模型blendshapes支援
3. 添加debug日誌確認update是否被調用

**預計修復時間**: 1-2小時

---

### 🟡 中優先級（穩定性）

#### 問題6：快速連續點擊送出信息3-5次時，會同時出現幾把聲音的回應
**症狀**: 多個音訊同時播放，聲音重疊
**預期**: 應有音訊佇列管理，一次只播放一個

**診斷**:
- ❌ audioStore缺少佇列管理邏輯
- ❌ 未停止前一個音訊就開始新的播放

**可能原因**:
1. `audioStore.ts` 的 `speakText` 未檢查當前播放狀態
2. 缺少佇列機制或佇列未正常工作
3. 連續請求未被阻止或排隊

**修復方案**:
1. 檢查audioStore的queue實作
2. 添加播放狀態檢查（PLAYING時不開始新播放）
3. 實作正確的佇列處理邏輯
4. 添加音訊停止清理邏輯

**預計修復時間**: 2-3小時

---

### 🟢 低優先級（UI問題）

#### 問題5：有時候點擊 "😊 Smile" 按鈕會破圖
**症狀**: 微笑動畫觸發時Avatar變形異常
**預期**: 平滑的微笑表情

**診斷**:
- ❌ Blendshape權重超出範圍（>1.0）
- ❌ 多個動畫衝突（smile + lip sync）
- ❌ Avatar模型本身問題

**可能原因**:
1. MouthAnimator設定的強度過高
2. Smile動畫與Lip Sync動畫未正確混合
3. 未使用easing導致突變
4. Ready Player Me模型的blendshapes定義問題

**修復方案**:
1. 限制blendshape權重範圍（0-1）
2. 添加動畫優先級系統
3. 使用緩動函數（ease-in-out）
4. 測試不同Avatar模型

**預計修復時間**: 1-2小時

---

## 修復優先順序建議

### Phase 1: 核心動畫修復（必須）
1. **問題4**: 眨眼動畫（最簡單，快速勝利）
2. **問題1+2**: Lip Sync + Fallback（核心功能）

**預計時間**: 3-6小時
**目標**: 完成基本動畫展示

---

### Phase 2: 穩定性改進（重要）
3. **問題6**: 音訊佇列管理

**預計時間**: 2-3小時
**目標**: 確保多輪對話穩定

---

### Phase 3: 品質提升（可選）
4. **問題5**: 動畫品質優化

**預計時間**: 1-2小時
**目標**: 提升視覺體驗

---

## 診斷步驟

### 1. 眨眼動畫診斷

**檢查清單**:
```typescript
// components/avatar/hooks/useAvatarAnimation.ts

□ BlinkController是否初始化？
  const blinkController = useRef(new BlinkController())

□ BlinkController是否啟動？
  useEffect(() => {
    blinkController.current.start()
  }, [])

□ useFrame是否調用update？
  useFrame((state, delta) => {
    blinkController.current.update(avatarRef.current, delta)
  })

□ Avatar模型是否有blendshapes？
  console.log(avatarRef.current?.morphTargetDictionary)
  // 應包含: eyeBlinkLeft, eyeBlinkRight
```

**快速測試**:
```typescript
// 在useAvatarAnimation中添加
console.log('[Blink] Controller active:', blinkController.current.isActive)
console.log('[Blink] Available morphs:', Object.keys(avatarRef.current?.morphTargetDictionary || {}))
```

---

### 2. Lip Sync診斷

**檢查清單**:
```typescript
// stores/audioStore.ts

□ Viseme數據是否存儲？
  console.log('[AudioStore] Visemes received:', visemes.length)

□ Viseme數據是否可訪問？
  console.log('[AudioStore] Current visemes:', get().currentVisemes)

// components/avatar/AvatarModel.tsx

□ 是否接收visemes？
  const { currentVisemes } = useAudioStore()
  console.log('[Avatar] Visemes for lip sync:', currentVisemes?.length)

// lib/lipsync/controller.ts

□ LipSyncController是否啟動？
  console.log('[LipSync] Playing:', controller.getState())

□ Viseme是否正確查找？
  console.log('[LipSync] Current viseme:', controller.findVisemeAtTime(time))
```

**快速測試**:
```typescript
// 播放音訊時添加日誌
audioStore.speakText(text).then(() => {
  console.log('[Test] Audio duration:', audio.duration)
  console.log('[Test] Viseme count:', visemes.length)
  console.log('[Test] Viseme sample:', visemes.slice(0, 3))
})
```

---

### 3. 音訊佇列診斷

**檢查清單**:
```typescript
// stores/audioStore.ts

□ 播放狀態檢查？
  if (get().playbackState === AudioState.PLAYING) {
    // 應加入佇列或拒絕
  }

□ 佇列是否工作？
  console.log('[AudioStore] Queue length:', get().queue.length)

□ 音訊是否正確清理？
  audio.onended = () => {
    cleanup()
    playNext() // 播放下一個
  }
```

---

## 修復代碼模板

### 眨眼修復範例
```typescript
// components/avatar/hooks/useAvatarAnimation.ts

const blinkController = useRef(new BlinkController())

useEffect(() => {
  blinkController.current.start()
  console.log('[Animation] Blink controller started')

  return () => {
    blinkController.current.stop()
  }
}, [])

useFrame((state, delta) => {
  if (!avatarRef.current) return

  // Debug log (移除後生產環境)
  if (Math.random() < 0.01) { // 1%機率日誌
    console.log('[Animation] Frame update, delta:', delta)
  }

  blinkController.current.update(avatarRef.current, delta)
  // ... 其他動畫
})
```

### 音訊佇列修復範例
```typescript
// stores/audioStore.ts

speakText: async (text: string) => {
  const state = get()

  // 如果正在播放，加入佇列
  if (state.playbackState === AudioState.PLAYING) {
    set({ queue: [...state.queue, text] })
    console.log('[AudioStore] Added to queue, length:', state.queue.length + 1)
    return
  }

  // 設定為播放中
  set({ playbackState: AudioState.PLAYING })

  try {
    // TTS + 播放邏輯
    // ...

    audio.onended = () => {
      // 清理當前音訊
      cleanup()

      // 播放佇列中的下一個
      const nextQueue = get().queue
      if (nextQueue.length > 0) {
        const [nextText, ...remaining] = nextQueue
        set({ queue: remaining })
        get().speakText(nextText)
      } else {
        set({ playbackState: AudioState.IDLE })
      }
    }
  } catch (error) {
    set({ playbackState: AudioState.IDLE })
    throw error
  }
}
```

---

## 測試計劃

### 單元測試
1. **BlinkController測試**:
   - 啟動/停止功能
   - 隨機間隔生成
   - Blendshape更新邏輯

2. **LipSyncController測試**:
   - Viseme查找（Binary Search）
   - 時間同步精度
   - Fallback切換

3. **AudioStore測試**:
   - 佇列管理
   - 並發播放控制
   - 資源清理

### 整合測試
1. **眨眼測試**: 觀察30秒，應看到3-5次眨眼
2. **Lip Sync測試**: 播放10秒音訊，觀察嘴型同步精度
3. **連續對話測試**: 連續發送5條訊息，確認音訊不重疊
4. **長時間測試**: 連續使用10分鐘，檢查記憶體洩漏

---

## 成功標準

### 必須達成（Phase 1）
- ✅ Avatar每2-6秒眨眼一次
- ✅ Lip Sync基本可見（嘴型變化與語音對應）
- ✅ Fallback動畫在Viseme缺失時正常工作

### 期望達成（Phase 2）
- ✅ 連續5條訊息，音訊依序播放無重疊
- ✅ 佇列最多不超過3條（使用者體驗考量）

### 可選達成（Phase 3）
- ✅ Smile動畫流暢無破圖
- ✅ 多種動畫可同時運行無衝突
- ✅ 效能維持60 FPS

---

## 風險評估

### 高風險
1. **Avatar模型不支援blendshapes**:
   - 風險: 無法實現嘴型同步
   - 緩解: 切換支援的Ready Player Me模型

2. **Three.js版本不相容**:
   - 風險: 動畫API不一致
   - 緩解: 查閱Three.js 0.180文檔

### 中風險
1. **效能問題**: 複雜動畫導致FPS下降
   - 緩解: 使用React.memo、useMemo優化

2. **瀏覽器相容性**: 不同瀏覽器表現不一致
   - 緩解: 優先支援Chrome/Edge

---

## 下一步行動

### 立即執行（今天）
1. [ ] 運行診斷腳本確認問題根因
2. [ ] 修復眨眼動畫（快速勝利）
3. [ ] 驗證Avatar模型blendshapes支援

### 短期執行（本週）
4. [ ] 修復Lip Sync整合
5. [ ] 實作音訊佇列管理
6. [ ] 完整測試與驗證

### 中期執行（下週）
7. [ ] 優化動畫品質
8. [ ] 撰寫測試用例
9. [ ] 更新文件與部署指南

---

**文件維護**: Development Team
**最後更新**: 2025-10-15
**狀態**: 待審核 → 執行
