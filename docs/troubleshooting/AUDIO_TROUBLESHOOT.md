# 音訊故障排除指南

**日期**: 2025-10-20
**狀態**: ✅ 所有日誌正常，但聽不到聲音

---

## 🎯 當前狀況

根據 Console 日誌，一切都正常工作：
- ✅ AudioContext 狀態: **running**
- ✅ 音訊播放完成: **4.61 秒**
- ✅ Lip Sync 啟動: **126 個 Viseme**
- ✅ 無任何錯誤

**但您聽不到聲音，也看不到嘴唇動作。**

---

## 🔍 可能的原因

### 1. 系統音量或瀏覽器音訊設定
- Windows 音量混音器可能將瀏覽器靜音
- 瀏覽器標籤頁被靜音
- 音訊輸出設備選擇錯誤

### 2. AudioContext 輸出未連接
- Web Audio API 正常運行但沒有實際輸出
- 可能需要 GainNode 來控制音量

### 3. Lip Sync 視覺問題
- Avatar 可能在畫面外或被遮擋
- morphTarget 值太小，看不出變化
- 相機角度問題

---

## 🧪 即時測試

請在瀏覽器 Console 執行以下測試：

### 測試 1: 檢查 Windows 音量混音器

**Windows 系統**:
1. 右鍵點擊工作列的音量圖示
2. 選擇「開啟音量混音器」
3. 檢查 Chrome/Edge 的音量是否被靜音或調低

**瀏覽器標籤頁**:
- 檢查瀏覽器標籤頁圖示是否有「🔇」靜音符號
- 右鍵點擊標籤頁 → 檢查是否有「取消靜音網站」選項

### 測試 2: 播放測試音效

在 Console 執行：

```javascript
// 播放簡單的測試音效（440Hz 正弦波，1 秒）
async function playTestBeep() {
  const ctx = new AudioContext()
  await ctx.resume() // 確保 AudioContext 啟動

  const oscillator = ctx.createOscillator()
  const gainNode = ctx.createGain()

  oscillator.type = 'sine'
  oscillator.frequency.value = 440 // A4 音符

  gainNode.gain.value = 0.3 // 30% 音量

  oscillator.connect(gainNode)
  gainNode.connect(ctx.destination)

  oscillator.start()
  oscillator.stop(ctx.currentTime + 1) // 播放 1 秒

  console.log('🔊 播放測試音效 (440Hz, 1 秒)...')
  console.log('AudioContext state:', ctx.state)
}

playTestBeep()
```

**如果聽到「嗶」聲** → 系統音訊正常，問題在 TTS 音訊本身
**如果聽不到聲音** → 系統音量或瀏覽器設定問題

### 測試 3: 檢查 morphTarget 實際值

在 Console 執行：

```javascript
// 監控 Avatar 的 morphTarget 變化
function monitorMorphTargets() {
  const scene = document.querySelector('canvas')?._fiber?.scene
  if (!scene) {
    console.error('❌ 找不到 Three.js scene')
    return
  }

  const headMesh = scene.getObjectByName('Wolf3D_Head')
  if (!headMesh) {
    console.error('❌ 找不到 Wolf3D_Head mesh')
    return
  }

  console.log('✅ 找到 head mesh:', headMesh.name)
  console.log('morphTargetDictionary:', Object.keys(headMesh.morphTargetDictionary || {}))

  // 監控前 5 個 viseme 的值
  const visemeIndices = [
    'viseme_sil',
    'viseme_PP',
    'viseme_FF',
    'viseme_aa',
    'viseme_E'
  ].map(name => headMesh.morphTargetDictionary?.[name]).filter(i => i !== undefined)

  console.log('Viseme indices:', visemeIndices)

  // 每 100ms 打印一次值
  let count = 0
  const interval = setInterval(() => {
    if (count++ > 50) { // 監控 5 秒
      clearInterval(interval)
      console.log('監控結束')
      return
    }

    const values = visemeIndices.map(i =>
      headMesh.morphTargetInfluences?.[i]?.toFixed(3) || '0'
    )
    console.log('Viseme values:', values.join(', '))
  }, 100)
}

// 發送對話後立即執行
monitorMorphTargets()
```

### 測試 4: 直接播放 TTS 音訊

在 Console 執行：

```javascript
// 直接播放最近的 TTS 音訊（繞過 Web Audio API）
async function playDirectAudio() {
  try {
    const response = await fetch('/api/tts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: '這是測試語音，你能聽到嗎？' })
    })

    const data = await response.json()
    console.log('TTS Response:', {
      audioLength: data.audio?.length,
      visemes: data.visemes?.length
    })

    // 使用 HTML5 Audio 播放
    const audioBase64 = data.audio
    const audioBlob = new Blob([
      Uint8Array.from(atob(audioBase64), c => c.charCodeAt(0))
    ], { type: 'audio/mpeg' })

    const audioUrl = URL.createObjectURL(audioBlob)
    const audio = new Audio(audioUrl)
    audio.volume = 1.0 // 最大音量

    console.log('🔊 使用 HTML5 Audio 播放...')
    await audio.play()

    console.log('✅ 開始播放!')

  } catch (error) {
    console.error('❌ 播放失敗:', error)
  }
}

playDirectAudio()
```

**如果這個測試能聽到聲音** → AudioPlayer 實現有問題
**如果這個測試也聽不到** → 音訊檔案本身或系統設定問題

---

## 🔧 可能的修復方案

### 方案 A: 添加 GainNode (音量控制)

如果測試 2 能聽到嗶聲，但 TTS 聽不到，可能需要添加音量控制：

```typescript
// 在 lib/audio/player.ts 的 play() 方法中
const source = context.createBufferSource()
const gainNode = context.createGain()

source.buffer = buffer
gainNode.gain.value = 1.0 // 100% 音量

source.connect(gainNode)
gainNode.connect(context.destination) // 改為通過 GainNode 連接
```

### 方案 B: 使用 HTML5 Audio 替代 Web Audio API

如果 Web Audio API 有問題，可以改用更簡單的 HTML5 Audio：

```typescript
// 在 audioStore.ts 的 speakText 方法中
const audioUrl = URL.createObjectURL(audioBlob)
const audio = new Audio(audioUrl)
audio.volume = 1.0
await audio.play()
```

### 方案 C: 增強 morphTarget 強度

如果音訊播放但看不到嘴唇動作，可能需要放大 morphTarget 值：

```typescript
// 在 lib/lipsync/mouth-animator.ts 中
const targetWeight = visemeWeight * 2.0 // 放大 2 倍
```

---

## 📋 測試檢查清單

請依序執行測試並回報結果：

- [ ] **測試 1**: Windows 音量混音器中瀏覽器是否被靜音？
- [ ] **測試 2**: playTestBeep() 能否聽到「嗶」聲？
- [ ] **測試 3**: morphTarget 值是否有變化（>0.01）？
- [ ] **測試 4**: playDirectAudio() 能否聽到語音？

---

## 🎯 下一步

根據測試結果：

1. **如果測試 2 聽得到，測試 4 聽不到** → TTS 音訊檔案或 Web Audio API 實現問題
2. **如果測試 2 聽不到** → 系統音訊設定問題
3. **如果測試 3 顯示 morphTarget 沒變化** → Lip Sync 動畫問題
4. **如果所有測試都正常** → 可能是音訊太小聲或 Avatar 渲染問題

請執行這些測試並告訴我結果！
