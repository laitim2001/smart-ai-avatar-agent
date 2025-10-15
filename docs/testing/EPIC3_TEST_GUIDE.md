# Epic 3 測試指南 - 對話介面與語音整合

## 測試目的
驗證 Stories 3.5-3.7 的完整功能運作，確保：
1. TTS API 正確轉換文字為語音
2. Web Audio API 正常播放音訊
3. 端到端對話流程順暢運作

---

## 測試環境

### 必要條件
- ✅ Windows 10/11 或 macOS
- ✅ Node.js 18+
- ✅ pnpm 安裝
- ✅ Chrome 90+ 或 Edge 90+
- ✅ 穩定網路連線
- ✅ Azure 服務已配置

### 環境變數檢查
執行前確認 `.env.local` 已配置：

```bash
# 檢查環境變數檔案
cat .env.local

# 必須包含以下變數（不可為範例值）
AZURE_SPEECH_KEY=xxxxx
AZURE_SPEECH_REGION=eastasia
AZURE_OPENAI_ENDPOINT=https://xxxxx.openai.azure.com/
AZURE_OPENAI_API_KEY=xxxxx
AZURE_OPENAI_DEPLOYMENT=xxxxx
```

### 啟動開發伺服器
```bash
# 1. 安裝依賴（如需要）
pnpm install

# 2. 啟動開發伺服器
pnpm dev

# 3. 確認成功啟動
# 應看到:
#   ▲ Next.js 15.1.4
#   - Local: http://localhost:3000
#   ✓ Ready in XXXXms
```

---

## Story 3.5: TTS API 測試

### TC 3.5.1: 正常文字轉語音
**測試步驟**:
```bash
# 使用 curl 測試
curl -X POST http://localhost:3000/api/tts \
  -H "Content-Type: application/json" \
  -d '{"text": "你好，我是 Avatar"}' \
  --output test-audio.mp3

# 檢查檔案大小（應 > 0 bytes）
ls -lh test-audio.mp3

# 播放音訊檔案
# Windows: 雙擊 test-audio.mp3
# macOS: afplay test-audio.mp3
# Linux: mpg123 test-audio.mp3
```

**預期結果**:
- ✅ 返回 MP3 檔案（檔案大小 > 0）
- ✅ 音訊可正常播放
- ✅ 語音清晰、發音正確（繁體中文）
- ✅ 女聲（zh-TW-HsiaoChenNeural）

---

### TC 3.5.2: 語速調整測試
```bash
# 測試 1.5 倍速
curl -X POST http://localhost:3000/api/tts \
  -H "Content-Type: application/json" \
  -d '{"text": "這是快速朗讀測試", "speed": 1.5}' \
  --output test-fast.mp3

# 播放並確認語速明顯較快
```

**預期結果**:
- ✅ 語速明顯快於正常速度
- ✅ 語音仍然清晰

---

### TC 3.5.3: 錯誤處理測試
```bash
# 測試 1: 缺少 text 欄位
curl -X POST http://localhost:3000/api/tts \
  -H "Content-Type: application/json" \
  -d '{}'

# 預期輸出（JSON）:
# {
#   "error": "Missing required field: text",
#   "code": "INVALID_REQUEST",
#   "timestamp": "..."
# }

# 測試 2: 超長文字（> 1000 字）
curl -X POST http://localhost:3000/api/tts \
  -H "Content-Type: application/json" \
  -d '{"text": "'$(python -c 'print("a" * 1001)')'"}'

# 預期輸出:
# {
#   "error": "Text too long (max 1000 characters)",
#   "code": "TEXT_TOO_LONG",
#   "timestamp": "..."
# }
```

**預期結果**:
- ✅ 返回 400 狀態碼
- ✅ 錯誤訊息清晰易懂
- ✅ 包含正確的錯誤代碼

---

### TC 3.5.4: Postman 測試（進階）
**步驟**:
1. 開啟 Postman
2. 建立新請求：
   - Method: POST
   - URL: `http://localhost:3000/api/tts`
   - Headers: `Content-Type: application/json`
   - Body (raw JSON):
     ```json
     {
       "text": "你好，我是 Avatar，很高興認識你！"
     }
     ```
3. Send 請求
4. 檢查 Response:
   - Status: 200 OK
   - Headers:
     - Content-Type: audio/mpeg
     - X-Audio-Duration: ~5.00 (估算秒數)
     - Cache-Control: public, max-age=3600
5. Save Response → 儲存為 .mp3 檔案
6. 播放音訊檔案

**預期結果**:
- ✅ 所有 Headers 正確
- ✅ 音訊播放正常

---

## Story 3.6 & 3.7: 端到端對話流程測試

### TC 3.6.1: 基本對話流程
**測試步驟**:
1. 開啟瀏覽器 `http://localhost:3000`
2. 開啟瀏覽器 DevTools (F12)
   - 切換到 Console 頁籤
3. 在輸入框輸入「你好」
4. 點擊「送出」或按 Enter

**預期結果**:
- ✅ 使用者訊息立即顯示
- ✅ Avatar 訊息即時逐字顯示（SSE 串流）
- ✅ 回應完成後自動播放語音
- ✅ 語音清晰、發音正確
- ✅ Console 顯示效能監控:
  ```
  [Performance] LLM Response Time: XXXXms
  [Performance] TTS Time: XXXXms
  [Performance] Total E2E Time: XXXXms
  ```
- ✅ 無錯誤訊息

---

### TC 3.6.2: 連續對話測試
**測試步驟**:
1. 輸入「我叫小明」→ 送出 → 等待回應與語音播放完畢
2. 輸入「你還記得我的名字嗎？」→ 送出
3. 檢查 Avatar 回應是否包含「小明」

**預期結果**:
- ✅ LLM 記得前面對話內容
- ✅ 回應包含「小明」
- ✅ 兩輪對話都有語音播放
- ✅ 語音不重疊（第二則等第一則播完）

---

### TC 3.6.3: 音訊佇列測試
**測試步驟**:
1. 快速連續輸入 3 則訊息（不等回應）:
   - 「你好」
   - 「今天天氣如何」
   - 「謝謝」
2. 觀察語音播放順序

**預期結果**:
- ✅ 3 則訊息都正確顯示
- ✅ 3 則語音依序播放（不重疊）
- ✅ 無崩潰或錯誤

---

### TC 3.6.4: 效能測試
**測試步驟**:
1. 開啟 Chrome DevTools > Performance 頁籤
2. 點擊「Record」
3. 輸入「你好」並送出
4. 等待語音播放開始後，停止錄製
5. 分析時間線:
   - 找到「fetch /api/chat」
   - 找到「fetch /api/tts」
   - 計算總延遲

**預期結果**:
- ✅ 端到端延遲 < 2.5 秒（目標）
  - LLM 回應: ~1-2 秒
  - TTS 轉換: ~1-1.5 秒
  - 總計: < 2.5 秒
- ✅ 無明顯的效能瓶頸

---

### TC 3.6.5: 錯誤處理測試 - 網路中斷
**測試步驟**:
1. 開啟 Chrome DevTools > Network 頁籤
2. 切換到「Offline」模式（模擬網路中斷）
3. 輸入「你好」並送出

**預期結果**:
- ✅ 顯示錯誤訊息：「網路連線不穩定，請檢查網路設定。」
- ✅ 應用不崩潰
- ✅ 可繼續輸入（恢復網路後）

---

### TC 3.6.6: 錯誤處理測試 - TTS 失敗
**測試步驟**:
1. 暫時停止 TTS API（修改 `.env.local` 設定錯誤的 AZURE_SPEECH_KEY）
2. 重啟開發伺服器 (`pnpm dev`)
3. 輸入「你好」並送出

**預期結果**:
- ✅ LLM 回應正常顯示（文字）
- ✅ Console 顯示 TTS 錯誤，但不崩潰
- ✅ 對話可繼續（僅無語音）

---

### TC 3.6.7: 記憶體洩漏測試
**測試步驟**:
1. 開啟 Chrome DevTools > Memory 頁籤
2. 記錄初始記憶體快照（Heap Snapshot）
3. 進行 10 輪對話
4. 再次記錄記憶體快照
5. 比較兩次快照

**預期結果**:
- ✅ 記憶體增長 < 50 MB（10 輪對話）
- ✅ 無明顯記憶體洩漏
- ✅ Blob URLs 正確清理

---

## 整合測試清單

### 功能驗證
- [ ] TC 3.5.1: 正常文字轉語音
- [ ] TC 3.5.2: 語速調整
- [ ] TC 3.5.3: 錯誤處理
- [ ] TC 3.5.4: Postman 完整測試
- [ ] TC 3.6.1: 基本對話流程
- [ ] TC 3.6.2: 連續對話（上下文）
- [ ] TC 3.6.3: 音訊佇列
- [ ] TC 3.6.4: 效能測試
- [ ] TC 3.6.5: 網路中斷錯誤處理
- [ ] TC 3.6.6: TTS 失敗錯誤處理
- [ ] TC 3.6.7: 記憶體洩漏測試

### 品質驗證
- [ ] Lint 檢查通過 (`pnpm lint`)
- [ ] TypeScript 無錯誤
- [ ] Console 無錯誤（正常流程）
- [ ] 程式碼註解完整

---

## 問題回報格式

如發現問題，請按以下格式回報：

```markdown
## 問題描述
[簡短描述問題]

## 測試案例
TC X.X.X: [測試案例名稱]

## 重現步驟
1. ...
2. ...
3. ...

## 預期結果
[應該發生什麼]

## 實際結果
[實際發生什麼]

## Console 錯誤訊息
```
[貼上錯誤訊息]
```

## 環境資訊
- OS: [Windows/macOS/Linux]
- Browser: [Chrome/Edge/Safari]
- Node.js: [版本]

## 截圖
[如有需要，附上截圖]
```

---

## 測試完成標準

### 必須通過
- ✅ 所有 TC 3.5.X 通過（TTS API）
- ✅ 所有 TC 3.6.X 通過（對話流程）
- ✅ 端到端延遲 < 2.5 秒（90% 案例）
- ✅ 無嚴重 Console 錯誤
- ✅ Lint 檢查通過

### 可接受的已知限制
- ⚠️ 首次對話可能略超 2.5 秒（冷啟動）
- ⚠️ 非 Chrome 瀏覽器可能有相容性問題（POC 階段）
- ⚠️ 無 UI 控制元件（AudioControls 未實作）

---

## 測試報告範本

測試完成後，請填寫以下報告：

```markdown
# Epic 3 測試報告

## 測試日期
[日期]

## 測試人員
[姓名]

## 測試環境
- OS: [版本]
- Browser: [版本]
- Node.js: [版本]

## 測試結果
- TC 3.5.1: ✅/❌
- TC 3.5.2: ✅/❌
- TC 3.5.3: ✅/❌
- TC 3.5.4: ✅/❌
- TC 3.6.1: ✅/❌
- TC 3.6.2: ✅/❌
- TC 3.6.3: ✅/❌
- TC 3.6.4: ✅/❌
- TC 3.6.5: ✅/❌
- TC 3.6.6: ✅/❌
- TC 3.6.7: ✅/❌

## 效能數據
- 平均端到端延遲: [X]ms
- LLM 回應時間: [X]ms
- TTS 轉換時間: [X]ms

## 發現問題
[列出所有問題]

## 總結
[通過/未通過，原因]
```

---

## 聯絡資訊

如遇到技術問題，請聯絡開發團隊。

🤖 Generated with [Claude Code](https://claude.com/claude-code)
