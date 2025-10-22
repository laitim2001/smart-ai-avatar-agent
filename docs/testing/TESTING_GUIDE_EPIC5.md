# Epic 5 Part 1 測試指引

## 測試環境需求
- Node.js 18+
- Chrome/Edge/Firefox 最新版本
- 網路連線（測試 API 呼叫）
- Azure OpenAI 與 Speech Services 憑證（已設定於 .env）

---

## 快速測試步驟

### 1. 啟動開發伺服器
```bash
cd C:\smart-ai-avatar-agent
npm run dev
```
開啟瀏覽器訪問: http://localhost:3000

---

## Story 5.1: 效能優化測試

### 測試 1.1: 3D 渲染效能
**目標**: 驗證 3D 場景渲染流暢度

**步驟**:
1. 開啟瀏覽器開發者工具 (F12)
2. 切換至 Performance 面板
3. 點擊「Record」開始錄製
4. 旋轉 3D Avatar（左鍵拖曳）
5. 等待 5 秒後停止錄製
6. 檢視 FPS 圖表

**預期結果**:
- FPS 應保持在 30-60 之間
- 無明顯掉幀（Frame drops）
- CPU 使用率 < 50%

---

### 測試 1.2: 音訊快取機制
**目標**: 驗證 TTS 快取正常運作

**步驟**:
1. 在對話框輸入: "你好"
2. 送出訊息，等待回應與語音播放
3. 開啟瀏覽器 Console (F12)
4. 觀察 Log 訊息，應顯示: `[TTSCache] Cache miss, calling TTS API`
5. 清除對話
6. 再次輸入相同訊息: "你好"
7. 送出訊息
8. 觀察 Log 訊息，應顯示: `[TTSCache] Cache hit, using cached audio`

**預期結果**:
- 第一次呼叫顯示 "Cache miss"
- 第二次呼叫顯示 "Cache hit"
- 第二次回應時間明顯更快（< 100ms）

---

### 測試 1.3: 程式碼分割（Dynamic Import）
**目標**: 驗證 Three.js 延遲載入

**步驟**:
1. 開啟瀏覽器開發者工具 (F12)
2. 切換至 Network 面板
3. 勾選 "Disable cache"
4. 重新整理頁面 (Ctrl+F5)
5. 觀察載入順序

**預期結果**:
- 首屏載入時顯示「載入 3D Avatar...」
- Three.js 相關檔案（chunk）應晚於主 Bundle 載入
- 首屏 HTML/CSS/JS < 200KB

---

### 測試 1.4: 記憶體洩漏防護
**目標**: 驗證 Blob URL 正確清理

**步驟**:
1. 開啟瀏覽器開發者工具 (F12)
2. 切換至 Memory 面板
3. 點擊「Take snapshot」建立記憶體快照
4. 進行 10 次對話（每次不同訊息）
5. 點擊「Take snapshot」建立第二個快照
6. 比較兩個快照的記憶體差異

**預期結果**:
- 記憶體增長 < 50MB
- Blob 數量無異常累積
- AudioContext 只有 1 個實例

---

## Story 5.2: 錯誤處理測試

### 測試 2.1: React Error Boundary
**目標**: 驗證錯誤捕捉與顯示

**步驟**:
1. 開啟瀏覽器 Console (F12)
2. 輸入以下程式碼觸發錯誤（模擬 API 失敗）:
   ```javascript
   // 暫時無法在前端直接觸發，建議後端測試
   // 可停用網路模擬網路錯誤
   ```
3. 在開發者工具 Network 面板選擇 "Offline"
4. 發送對話訊息

**預期結果**:
- 顯示錯誤訊息: "網路連線不穩定，請檢查網路設定"
- 無 React 崩潰（未顯示紅色錯誤畫面）

---

### 測試 2.2: 友善錯誤訊息
**目標**: 驗證不同錯誤類型顯示正確訊息

**測試案例**:

| 錯誤類型 | 模擬方式 | 預期訊息 |
|---------|---------|---------|
| 網路錯誤 | 開發者工具設為 Offline | "網路連線不穩定，請檢查網路設定" |
| API 500 錯誤 | 停用 Azure 服務 | "Avatar 正在思考中，請稍候再試..." |
| TTS 錯誤 | 停用 Speech Services | "語音生成失敗，請重試" |

---

### 測試 2.3: API 重試機制
**目標**: 驗證 API 自動重試

**步驟**:
1. 開啟瀏覽器 Console (F12)
2. 模擬 500 錯誤（需後端配合或手動修改 API）
3. 發送對話訊息
4. 觀察 Console Log

**預期結果**:
- Console 顯示 `[Retry] Attempt 1/2 failed, retrying in 1000ms...`
- 自動重試 1 次
- 如果仍失敗，顯示友善錯誤訊息

---

## Story 5.3: UI/UX 細節測試

### 測試 3.1: 動畫過渡
**目標**: 驗證 hover 與 active 動畫流暢

**步驟**:
1. 將滑鼠移至「送出」按鈕上
2. 觀察按鈕縮放效果（應放大至 105%）
3. 點擊按鈕
4. 觀察按鈕縮小效果（應縮小至 95%）
5. 重複測試「清除」按鈕與 Avatar 選擇卡片

**預期結果**:
- 動畫流暢，無卡頓
- hover 時按鈕放大，陰影加深
- 點擊時按鈕縮小
- transition 時間 200ms

---

### 測試 3.2: 響應式設計
**目標**: 驗證不同螢幕尺寸正常顯示

**步驟**:
1. 開啟瀏覽器開發者工具 (F12)
2. 切換至 Device Toolbar (Ctrl+Shift+M)
3. 測試以下解析度:
   - 1920x1080 (桌面)
   - 1366x768 (小筆電)
   - 1024x768 (平板)
   - 375x667 (行動裝置)

**預期結果**:
- 所有元素正常顯示，無重疊
- 對話介面在行動裝置可正常捲動
- Avatar 選擇器在平板顯示 2 欄

---

### 測試 3.3: 無障礙支援
**目標**: 驗證鍵盤導航與螢幕閱讀器支援

**步驟**:
1. 只使用鍵盤操作（不使用滑鼠）
2. 按 Tab 鍵切換焦點
3. 確認焦點順序正確: 輸入框 → 送出按鈕 → 清除按鈕
4. 按 Enter 送出訊息
5. 使用螢幕閱讀器（如 NVDA）測試

**預期結果**:
- Tab 鍵可正常切換焦點
- 焦點順序符合邏輯
- 按鈕有明確的 aria-label
- 螢幕閱讀器能正確朗讀元素

---

### 測試 3.4: 視覺細節
**目標**: 驗證品牌色與視覺一致性

**步驟**:
1. 觀察 Loading Spinner 顏色（應為青色 #06B6D4）
2. 檢查對話氣泡陰影（hover 時應加深）
3. 測試自訂滾動條（應為淺灰色，hover 時加深）

**預期結果**:
- Spinner 使用品牌色（青色）
- 陰影層次清晰（sm → md → lg → xl）
- 滾動條樣式一致，符合主題

---

## 效能基準測試

### Lighthouse 測試
**步驟**:
1. 開啟瀏覽器開發者工具 (F12)
2. 切換至 Lighthouse 面板
3. 勾選 Performance, Accessibility, Best Practices
4. 點擊「Generate report」

**預期結果**:
- Performance: > 80
- Accessibility: > 90
- Best Practices: > 90

---

## 常見問題排除

### Q1: 3D Avatar 未載入
**解決方案**:
- 檢查 Network 面板確認 .glb 檔案成功載入
- 檢查 Console 是否有錯誤訊息
- 確認 Ready Player Me URL 正確

### Q2: TTS 無聲音
**解決方案**:
- 檢查瀏覽器是否允許自動播放音訊
- 檢查 Azure Speech Services 憑證
- 開啟 Console 檢視錯誤訊息

### Q3: 建置失敗
**解決方案**:
```bash
# 清除快取
rm -rf .next node_modules
npm install
npm run build
```

---

## 測試完成檢查清單

- [ ] 3D 渲染 FPS ≥ 30
- [ ] 音訊快取正常運作（Cache hit）
- [ ] Dynamic Import 正常載入
- [ ] 記憶體無洩漏（< 50MB 增長）
- [ ] 錯誤訊息友善且正確
- [ ] API 自動重試機制運作
- [ ] 動畫過渡流暢
- [ ] 響應式設計正常
- [ ] 鍵盤導航正常
- [ ] 視覺細節符合品牌

---

## 報告問題

如發現問題，請提供以下資訊：
1. 瀏覽器版本與作業系統
2. Console 錯誤訊息
3. Network 面板截圖
4. 重現步驟

---

**測試負責人**: Backend Architect Agent
**測試日期**: 2025-10-15
**文件版本**: 1.0
