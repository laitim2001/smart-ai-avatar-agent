# 自適應強度系統測試指南

**測試日期**: 2025-10-20
**測試目標**: 驗證 Lip Sync 自適應強度系統是否正確處理 Azure TTS 回傳的不同 Viseme 權重

---

## 📋 測試前準備

1. **清除瀏覽器快取** (確保載入最新代碼):
   - Chrome/Edge: `Ctrl + Shift + Delete` → 選擇「快取的圖片和檔案」→ 清除資料
   - 或右鍵重新整理按鈕 → 選擇「清除快取並強制重新整理」

2. **開啟 Console**:
   - `F12` 或 `Ctrl + Shift + I`
   - 切換到 **Console** 標籤

3. **進入對話頁面**:
   - 前往 http://localhost:3005/zh-TW/conversations

---

## 🔍 測試步驟

### 步驟 1: 發送對話訊息

在對話框中輸入任何文字，例如：
```
你好，請介紹一下你自己
```

點擊發送。

### 步驟 2: 觀察 Console 輸出

在 Console 中尋找以下關鍵日誌（按順序出現）：

#### ✅ **預期日誌 1: 低權重偵測**
```
[MouthAnimator] 🔧 Low weight detected: viseme_aa=0.015, using intensity=7.5
```
- **說明**: 當原始權重 < 0.1 時，自動放大 5 倍（1.5 × 5 = 7.5）
- **目的**: 讓小值變得可見

#### ✅ **預期日誌 2: 結果過小警告**（可能出現）
```
[MouthAnimator] ⚠️ Result too small: viseme_PP 0.012 × 7.5 = 0.090
```
- **說明**: 即使放大後，如果結果 < 0.05，會顯示警告
- **目的**: 追蹤是否有值仍然太小

#### ✅ **預期日誌 3: Co-articulation 混合**
```
[MouthAnimator] 🔀 Co-articulation: viseme_aa(0.113) + viseme_E(0.098) = 0.108
```
- **說明**: 當前 viseme 與下一個 viseme 進行 30% 混合
- **目的**: 確保 co-articulation 也使用自適應強度

#### ✅ **預期日誌 4: 每秒狀態更新**
```
[MouthAnimator] 📊 Active visemes: viseme_aa: current=0.108 target=0.113 | viseme_E: current=0.000 target=0.000
```
- **說明**: 每秒顯示活躍 viseme 的當前值和目標值
- **目的**: 確認實際設定到 morphTarget 的數值

---

## ✅ 成功標準

### 1. **數值範圍正確**
- 低權重（0.01-0.03）應該被放大到 **0.075-0.225**（7.5 倍）
- 中等權重（0.1-0.5）應該保持 **0.15-0.75**（1.5 倍）
- 高權重（> 0.5）應該被縮小到 **0.6-0.96**（0.8 倍）

### 2. **日誌顯示完整**
應該看到以下 4 種日誌類型：
- ✅ `🔧 Low weight detected` - 偵測到低權重
- ✅ `⚠️ Result too small` - 警告結果過小（可能不會每次都出現）
- ✅ `🔀 Co-articulation` - Co-articulation 混合
- ✅ `📊 Active visemes` - 每秒狀態更新

### 3. **視覺效果明顯**
- Avatar 的嘴唇應該有**明顯的開合動作**
- 不應該是「完全沒有動作」或「只有微小抖動」
- 應該看到**不同嘴型之間的變化**（不是一直張大口）

---

## ❌ 失敗情況判斷

### 情況 A: 沒有 `🔧 Low weight detected` 日誌
**可能原因**:
- Azure TTS 回傳的權重都 > 0.1（不太可能）
- 自適應邏輯沒有執行

**解決方案**:
- 截圖 Console 完整輸出
- 尋找 `[MouthAnimator]` 開頭的所有日誌
- 檢查是否有其他錯誤訊息

### 情況 B: 有日誌但數值仍然 < 0.05
**範例**:
```
[MouthAnimator] 🔧 Low weight detected: viseme_aa=0.015, using intensity=7.5
[MouthAnimator] ⚠️ Result too small: viseme_aa 0.015 × 7.5 = 0.020  ← 錯誤！應該是 0.113
```

**可能原因**:
- `applyIntensity` 函數計算錯誤
- Co-articulation 混合把數值拉回去

**解決方案**:
- 回報完整日誌截圖
- 需要檢查 `applyIntensity` 函數實現

### 情況 C: 有正確的數值但看不到嘴唇動作
**範例**:
```
[MouthAnimator] 📊 Active visemes: viseme_aa: current=0.120 target=0.120  ← 數值正常
```
但 Avatar 嘴唇完全沒有動作

**可能原因**:
1. **相機角度問題** - 正好看不到嘴部
2. **morphTarget 綁定問題** - morphTargetInfluences 沒有正確更新 3D 模型
3. **過渡時間太短** - 動作太快看不清楚

**解決方案**:
1. 調整相機角度，確保正面看到 Avatar 臉部
2. 執行以下 Console 測試：

```javascript
// 測試 morphTarget 是否生效
const scene = document.querySelector('canvas')?._fiber?.scene
const headMesh = scene?.getObjectByName('Wolf3D_Head')

// 手動設定一個明顯的值測試
if (headMesh?.morphTargetInfluences) {
  const viseme_aa_index = headMesh.morphTargetDictionary['viseme_aa']
  headMesh.morphTargetInfluences[viseme_aa_index] = 0.5  // 50% 開口
  console.log('✅ 手動設定 viseme_aa = 0.5，應該看到嘴巴張開')

  setTimeout(() => {
    headMesh.morphTargetInfluences[viseme_aa_index] = 0
    console.log('✅ 重置 viseme_aa = 0，嘴巴應該閉合')
  }, 3000)  // 3 秒後重置
}
```

如果手動測試**也看不到動作**，表示 morphTarget 綁定有問題。

---

## 📊 測試結果回報格式

請提供以下資訊：

### 1. Console 輸出截圖
包含所有 `[MouthAnimator]` 開頭的日誌

### 2. 視覺觀察結果
- ✅ 看到明顯的嘴唇開合動作
- ⚠️ 看到微小的嘴唇抖動
- ❌ 完全沒有看到任何動作

### 3. 具體數值範例
複製粘貼幾行 `📊 Active visemes` 日誌，例如：
```
[MouthAnimator] 📊 Active visemes: viseme_aa: current=0.108 target=0.113
[MouthAnimator] 📊 Active visemes: viseme_PP: current=0.095 target=0.098
```

### 4. 手動測試結果（如果視覺效果不明顯）
執行上面的手動測試腳本後：
- ✅ 手動設定 0.5 時看到嘴巴張開
- ❌ 手動設定 0.5 時也沒有動作

---

## 🎯 預期最終結果

如果一切正常，您應該會：
1. ✅ 在 Console 中看到自適應強度的日誌（0.075-0.225 範圍）
2. ✅ 在 Console 中看到 Co-articulation 混合日誌
3. ✅ 在 Console 中看到每秒的狀態更新（current 和 target 值）
4. ✅ 在畫面上看到 Avatar 的嘴唇有**明顯且自然的說話動作**

如果以上 4 點都達成，表示自適應強度系統**成功運作**！ 🎉

---

## 🔧 下一步

如果測試失敗，請將 Console 截圖和視覺觀察結果告訴我，我會根據具體情況進一步調試。
