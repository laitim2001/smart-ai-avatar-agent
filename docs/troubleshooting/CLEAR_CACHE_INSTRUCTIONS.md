# 清除快取指令 - Lip Sync 修復

## 問題

Ready Player Me Avatar URL 已更新（添加 `?morphTargets=Oculus%20Visemes`），但瀏覽器和 Three.js 快取了舊模型。

## 解決方案

### 方法 1: 完全清除瀏覽器快取 ⭐ 推薦

1. **Chrome/Edge**:
   - 按 `F12` 打開開發者工具
   - **右鍵點擊「重新整理」按鈕**（在網址列旁邊）
   - 選擇「**清空快取並強制重新整理**」(Empty Cache and Hard Reload)

2. **或使用快捷鍵**:
   - Windows: `Ctrl + Shift + Delete`
   - Mac: `Cmd + Shift + Delete`
   - 選擇「快取的圖片和檔案」
   - 時間範圍選「不限時間」
   - 點擊「清除資料」

### 方法 2: 停用快取（開發者工具）

1. 打開開發者工具 (`F12`)
2. 切換到「**Network**」標籤
3. 勾選「**Disable cache**」
4. 保持開發者工具打開
5. 重新整理頁面 (`Ctrl + R`)

### 方法 3: 無痕模式

1. 按 `Ctrl + Shift + N` (Chrome/Edge) 打開無痕視窗
2. 訪問 `http://localhost:3005/zh-TW/conversations`
3. 測試功能

### 方法 4: 手動清除 useGLTF 快取（開發者）

在瀏覽器 Console 執行：

```javascript
// 清除所有 Three.js GLTFLoader 快取
Object.keys(window).forEach(key => {
  if (key.includes('gltf') || key.includes('GLTF')) {
    delete window[key];
  }
});

// 重新載入頁面
location.reload();
```

---

## 驗證快取已清除

重新載入後，應該看到以下日誌：

```
[AvatarModel] Avatar loaded successfully: {url: '...glb?morphTargets=Oculus%20Visemes&_t=...', ...}
[LipSyncController] 可用的 morphTargets: ['viseme_sil', 'viseme_PP', 'viseme_FF', ...]
[LipSyncController] 初始化成功
[useAvatarAnimation] ✅ Lip Sync controller initialized successfully
```

**如果仍然看到**:
```
[LipSyncController] Avatar 不支援 Viseme Blendshapes
```

表示快取尚未清除，請嘗試其他方法。

---

## 為什麼會有快取問題？

1. **瀏覽器 HTTP 快取**: 快取了舊的 `.glb` 檔案
2. **Three.js useGLTF 快取**: Three.js 內部快取機制
3. **Service Worker** (如果有): 可能快取了靜態資源

---

## 最簡單的方法

**Chrome/Edge 用戶** 🌟：

1. 打開開發者工具 (`F12`)
2. **右鍵點擊重新整理按鈕**
3. 選擇「**清空快取並強制重新整理**」

這會一次清除所有快取並重新載入頁面。

---

## 測試完成後

確認看到以下成功標誌：

- ✅ `[LipSyncController] 可用的 morphTargets:` 列出 15 個 viseme
- ✅ `[LipSyncController] 初始化成功`
- ✅ `[useAvatarAnimation] ✅ Lip Sync controller initialized successfully`
- ✅ 對話時有聲音
- ✅ Avatar 嘴型同步移動

---

**當前狀態**: 2025-10-20
**修改檔案**: `lib/avatar/constants.ts` (已添加 morphTargets 參數到所有 Avatar URL)
