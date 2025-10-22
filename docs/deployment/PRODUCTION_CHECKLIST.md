# 生產部署檢查清單

## 文件資訊
- **最後更新**: 2025-10-15
- **適用階段**: POC → Production
- **文件版本**: 1.0.0

---

## 使用說明

本檢查清單用於確保每次生產部署的品質與安全性。請在部署前、部署中、部署後逐項檢查。

**符號說明**:
- [ ] 待完成
- [x] 已完成
- ⚠️ 需注意
- ❌ 失敗需修復

---

## 部署前檢查 (Pre-Deployment)

### 程式碼品質

- [ ] **ESLint 檢查通過**
  ```bash
  npm run lint
  ```
  - 預期: 無 errors（warnings 可接受）
  - 失敗處理: 修復所有 ESLint errors

- [ ] **TypeScript 編譯通過**
  ```bash
  npx tsc --noEmit
  ```
  - 預期: 無編譯錯誤
  - 失敗處理: 修復所有 TypeScript 類型錯誤

- [ ] **生產建置成功**
  ```bash
  npm run build
  ```
  - 預期: 建置成功，產生 `.next` 目錄
  - 失敗處理: 檢查建置錯誤訊息並修復

- [ ] **建置產物檢查**
  ```bash
  ls -la .next/
  ```
  - 預期: 包含 `standalone/`, `static/`, `server/` 目錄
  - 大小: < 50MB

### 環境配置

- [ ] **GitHub Secrets 已設定**
  - [x] `AZURE_STATIC_WEB_APPS_API_TOKEN`
  - [x] `AZURE_OPENAI_API_KEY`
  - [x] `AZURE_OPENAI_ENDPOINT`
  - [x] `AZURE_OPENAI_DEPLOYMENT`
  - [x] `AZURE_SPEECH_KEY`
  - [x] `AZURE_SPEECH_REGION`

- [ ] **Azure Application Settings 已配置**
  - Azure Portal → Static Web Apps → Configuration
  - 確認所有環境變數已設定且正確

- [ ] **環境變數值驗證**
  - OpenAI Endpoint 格式正確（包含 `/`）
  - Speech Region 正確（例如 `eastasia`）
  - API Keys 有效且未過期

### Azure 服務檢查

- [ ] **Azure OpenAI 服務可用**
  - 服務狀態: Running
  - 配額充足（Tokens Per Minute）
  - 模型部署正常

- [ ] **Azure Speech Services 可用**
  - 服務狀態: Running
  - 配額充足（Characters Per Month）
  - TTS 語音可用

- [ ] **Azure Static Web Apps 資源正常**
  - 資源狀態: Active
  - Plan: Free（POC）或 Standard（Production）
  - Deployment Token 有效

### Git 與版本控制

- [ ] **工作目錄乾淨**
  ```bash
  git status
  ```
  - 預期: 無未提交的變更（除非有意為之）

- [ ] **分支正確**
  ```bash
  git branch
  ```
  - 預期: 在正確的分支上（`main` 或指定分支）

- [ ] **Commit 訊息清晰**
  - 使用規範的 commit 訊息（例如 Conventional Commits）
  - 包含變更內容摘要

- [ ] **版本標籤（選用）**
  ```bash
  git tag -a v1.0.0 -m "Release version 1.0.0"
  git push origin v1.0.0
  ```

### 文件與溝通

- [ ] **部署計畫已溝通**
  - 團隊成員知悉部署時間
  - 相關利益關係人已通知

- [ ] **Rollback 計畫準備**
  - 確認最後穩定版本
  - 記錄 Rollback 步驟

- [ ] **變更日誌更新（選用）**
  - `CHANGELOG.md` 記錄新功能與修復
  - 版本號更新

---

## 部署中檢查 (During Deployment)

### GitHub Actions 監控

- [ ] **Workflow 已觸發**
  - GitHub → Actions → 確認有新的 workflow run

- [ ] **Checkout 步驟成功**
  - 程式碼成功下載
  - 時間: < 10 秒

- [ ] **Setup Node.js 成功**
  - Node.js 20.x 安裝成功
  - npm cache 正常

- [ ] **Install dependencies 成功**
  - `npm ci` 執行成功
  - 時間: 1-2 分鐘
  - 無依賴衝突

- [ ] **Run ESLint 成功**
  - 無 errors
  - 時間: < 30 秒

- [ ] **Run TypeScript check 成功**
  - 無編譯錯誤
  - 時間: < 30 秒

- [ ] **Build project 成功**
  - 建置完成無錯誤
  - 時間: 1-2 分鐘

- [ ] **Deploy to Azure 成功**
  - 部署至 Azure Static Web Apps 成功
  - 時間: 2-3 分鐘
  - 無部署錯誤

### 錯誤處理

如果任何步驟失敗：

- [ ] **記錄錯誤訊息**
  - 複製完整的錯誤日誌
  - 記錄失敗步驟

- [ ] **本地重現問題**
  - 嘗試在本地重現錯誤
  - 確認問題原因

- [ ] **修復並重新部署**
  - 修復問題
  - 重新推送觸發部署

---

## 部署後驗證 (Post-Deployment)

### 健康檢查

- [ ] **Health API 正常**
  ```
  URL: https://<app-name>.azurestaticapps.net/api/health
  ```
  - HTTP Status: 200
  - Response: `{"success": true, "data": {"status": "ok", ...}}`
  - 回應時間: < 1 秒

- [ ] **首頁載入正常**
  ```
  URL: https://<app-name>.azurestaticapps.net
  ```
  - 頁面正常顯示
  - 無 JavaScript 錯誤
  - 載入時間: < 3 秒

### 核心功能驗證

#### 1. 3D Avatar 渲染

- [ ] **Avatar 載入成功**
  - 顯示「載入 3D Avatar...」
  - Avatar 成功渲染（< 5 秒）
  - 無黑屏或錯誤

- [ ] **Avatar 動畫正常**
  - 呼吸動畫運作
  - 眨眼動畫運作
  - FPS ≥ 30（使用 Chrome DevTools）

- [ ] **Avatar 互動正常**
  - 滑鼠拖曳可旋轉
  - 響應靈敏（延遲 < 100ms）

#### 2. 對話功能

- [ ] **文字輸入正常**
  - 可輸入文字
  - 送出按鈕可點擊

- [ ] **對話回應正常**
  ```
  測試輸入: "你好"
  ```
  - SSE 串流回應正常
  - 回應時間: < 5 秒
  - 對話內容正確

- [ ] **對話歷史正常**
  - 使用者訊息顯示
  - Avatar 回應顯示
  - 時間戳記正確

- [ ] **清除功能正常**
  - 點擊清除按鈕
  - 對話歷史清空
  - Avatar 重置

#### 3. 音訊播放

- [ ] **TTS 語音合成正常**
  - 語音清晰
  - 無雜音或斷續
  - 音量適中

- [ ] **音訊播放流暢**
  - 播放無延遲
  - 播放完整
  - 無錯誤訊息

- [ ] **音訊快取正常**
  ```
  測試: 重複相同輸入
  ```
  - 第一次: Cache miss（呼叫 TTS API）
  - 第二次: Cache hit（使用快取）

#### 4. Lip Sync

- [ ] **Viseme 生成正常**
  - Console 無錯誤
  - Viseme 數據正確

- [ ] **嘴型同步正常**
  - 嘴型與語音同步
  - 延遲 < 50ms
  - 視覺效果自然

- [ ] **長句處理正常**
  ```
  測試輸入: "請詳細說明三體問題的數學原理與物理意義"
  ```
  - 全程同步無明顯延遲
  - 無卡頓或錯誤

### UI/UX 驗證

- [ ] **響應式設計正常**
  - 桌機（1920x1080）: 正常
  - 筆電（1366x768）: 正常
  - 平板（1024x768）: 正常（未來）
  - 行動（375x667）: 未支援（POC 階段）

- [ ] **動畫過渡流暢**
  - Hover 效果正常
  - Click 效果正常
  - Loading 動畫流暢

- [ ] **無障礙支援**
  - Tab 鍵導航正常
  - 焦點順序正確
  - aria-label 正確

- [ ] **視覺一致性**
  - 品牌色正確（青色 #06B6D4）
  - 陰影層次清晰
  - 字型與大小一致

### 錯誤處理驗證

- [ ] **網路錯誤處理**
  ```
  測試: DevTools → Network → Offline
  ```
  - 顯示友善錯誤訊息
  - 無應用程式崩潰

- [ ] **API 錯誤處理**
  ```
  測試: 暫時停用 Azure 服務（如可行）
  ```
  - 顯示「Avatar 正在思考中，請稍候再試」
  - 有重試機制

- [ ] **錯誤邊界正常**
  - React Error Boundary 捕捉錯誤
  - 顯示錯誤 UI
  - 無白屏

### 效能驗證

- [ ] **Lighthouse 評分**
  ```
  Chrome DevTools → Lighthouse
  ```
  - Performance: ≥ 80
  - Accessibility: ≥ 90
  - Best Practices: ≥ 90
  - SEO: ≥ 80

- [ ] **載入效能**
  - 首屏載入: < 3 秒
  - FCP (First Contentful Paint): < 1.5 秒
  - LCP (Largest Contentful Paint): < 2.5 秒
  - CLS (Cumulative Layout Shift): < 0.1

- [ ] **執行效能**
  - 3D 渲染 FPS: ≥ 30
  - 對話回應時間: < 5 秒
  - Lip Sync 延遲: < 50ms
  - 記憶體使用: 穩定（< 300MB）

### 安全性驗證

- [ ] **HTTPS 正常**
  - URL 使用 HTTPS
  - SSL 憑證有效
  - 無混合內容警告

- [ ] **API Keys 未暴露**
  - 瀏覽器 Console 無 API Keys
  - Network 請求不顯示 Keys
  - 原始碼不包含 Keys

- [ ] **CORS 配置正確**
  - API 請求成功
  - 無 CORS 錯誤

- [ ] **Security Headers 正常**
  ```
  檢查回應標頭:
  - X-Content-Type-Options: nosniff
  - X-Frame-Options: DENY
  - X-XSS-Protection: 1; mode=block
  ```

### 瀏覽器相容性（快速檢查）

- [ ] **Chrome 120+ 正常**
  - 所有功能運作
  - 效能優異

- [ ] **Edge 120+ 正常**
  - 所有功能運作
  - 效能優異

- [ ] **Firefox 120+ 可用**
  - 功能正常
  - 效能可接受

- [ ] **Safari 17+ 可用**
  - 功能正常
  - 效能稍差但可接受

---

## 監控與日誌設定

### Azure 監控

- [ ] **Application Insights 已啟用**
  - Azure Portal → Monitoring → Application Insights
  - 資料開始收集

- [ ] **日誌查詢正常**
  - Azure Portal → Logs
  - 可查詢最近的請求與錯誤

### 告警設定

- [ ] **HTTP 5xx 錯誤告警**
  - 條件: 5xx > 5 次 / 5 分鐘
  - 動作: Email 通知

- [ ] **部署失敗告警**
  - 條件: GitHub Actions 失敗
  - 動作: Email 通知

- [ ] **回應時間告警**
  - 條件: 平均回應時間 > 5 秒 / 5 分鐘
  - 動作: Email 通知

### 成本監控

- [ ] **Azure 成本告警已設定**
  - 條件: 每月成本 > 預算的 80%
  - 動作: Email 通知

- [ ] **用量監控**
  - Bandwidth: < 80GB/月（Free Tier 100GB）
  - Requests: 監控中

---

## 文件更新

### 必要文件

- [ ] **README.md 更新**
  - 部署 URL 已更新
  - 版本號已更新
  - 安裝與使用說明最新

- [ ] **部署 URL 記錄**
  ```
  生產 URL: https://<app-name>.azurestaticapps.net
  Health API: https://<app-name>.azurestaticapps.net/api/health
  ```

- [ ] **環境變數文件**
  - 所有必要環境變數已記錄
  - 範例值已提供

### 選用文件

- [ ] **CHANGELOG.md 更新**
  - 新功能已記錄
  - Bug 修復已記錄
  - 版本號與日期

- [ ] **API 文件更新**
  - 新 API 端點已記錄
  - 請求/回應格式最新

- [ ] **使用者文件**
  - 使用指南最新
  - 常見問題已更新

---

## 團隊溝通

### 部署通知

- [ ] **團隊成員通知**
  - 部署完成時間
  - 部署版本號
  - 主要變更摘要

- [ ] **利益關係人通知**
  - Product Owner
  - Stakeholders
  - 相關團隊

### 部署報告

- [ ] **部署摘要**
  ```
  部署時間: 2025-10-15 10:00:00
  版本: v1.0.0
  狀態: 成功 ✅
  總時間: 8 分鐘
  ```

- [ ] **變更內容**
  - 新功能列表
  - Bug 修復列表
  - 效能改進

- [ ] **已知問題（如有）**
  - 問題描述
  - 影響範圍
  - 計畫修復時間

---

## Post-Deployment 行動項目

### 短期（24 小時內）

- [ ] **監控錯誤率**
  - 檢查 Application Insights
  - 確認無異常錯誤增加

- [ ] **監控效能指標**
  - 回應時間穩定
  - FPS 穩定
  - 記憶體無洩漏

- [ ] **收集使用者反饋**
  - 功能正常性
  - 使用者體驗
  - 發現的問題

### 中期（1 週內）

- [ ] **效能優化**
  - 根據監控數據優化
  - 調整快取策略
  - 優化資源載入

- [ ] **Bug 修復**
  - 修復發現的 bugs
  - 更新文件

- [ ] **文件完善**
  - 補充遺漏的文件
  - 更新已知問題列表

### 長期（1 個月內）

- [ ] **使用者行為分析**
  - 分析使用模式
  - 識別改進機會

- [ ] **安全性審查**
  - 檢查安全日誌
  - 更新 API Keys（如需要）

- [ ] **技術債務處理**
  - 重構需要優化的程式碼
  - 升級過時的依賴

---

## Rollback 準備

### Rollback 資訊記錄

- [ ] **當前部署資訊**
  ```
  部署時間: 2025-10-15 10:00:00
  Commit Hash: abc123def456
  GitHub Actions Run ID: 1234567890
  Azure Deployment ID: xyz789
  ```

- [ ] **上一個穩定版本**
  ```
  部署時間: 2025-10-14 10:00:00
  Commit Hash: def456ghi789
  GitHub Actions Run ID: 0987654321
  ```

- [ ] **Rollback 指令準備**
  ```bash
  # Git Revert 方法
  git revert abc123def456
  git push origin main

  # 或 Azure Portal 方法
  # Deployments → 選擇穩定版本 → Activate
  ```

### Rollback 觸發條件

如果出現以下情況，考慮 Rollback：

- [ ] ❌ 核心功能無法使用
- [ ] ❌ 嚴重效能問題（FPS < 20）
- [ ] ❌ 資料遺失或損壞
- [ ] ❌ 安全性漏洞
- [ ] ❌ 錯誤率 > 10%

---

## 檢查清單完成確認

### 最終確認

- [ ] **所有部署前檢查完成**
- [ ] **所有部署中檢查完成**
- [ ] **所有部署後驗證完成**
- [ ] **監控與告警已設定**
- [ ] **文件已更新**
- [ ] **團隊已通知**

### 簽核

| 角色 | 姓名 | 簽名 | 日期 |
|------|------|------|------|
| Developer | ___________ | ___________ | 2025-10-15 |
| QA Engineer | ___________ | ___________ | 2025-10-15 |
| DevOps | ___________ | ___________ | 2025-10-15 |
| Product Owner | ___________ | ___________ | 2025-10-15 |

---

## 附錄

### A. 快速命令參考

```bash
# 本地驗證
npm run lint
npx tsc --noEmit
npm run build

# Git 操作
git status
git branch
git add .
git commit -m "feat: add new feature"
git push origin main

# Rollback
git revert <commit-hash>
git push origin main

# 觸發重新部署（空 commit）
git commit --allow-empty -m "chore: trigger redeploy"
git push origin main
```

### B. 重要 URLs

```
生產 URL: https://<app-name>.azurestaticapps.net
Health API: https://<app-name>.azurestaticapps.net/api/health
GitHub Actions: https://github.com/<user>/<repo>/actions
Azure Portal: https://portal.azure.com
Application Insights: https://portal.azure.com/#view/AppInsights
```

### C. 聯絡資訊

```
開發團隊: dev-team@example.com
DevOps: devops@example.com
產品負責人: po@example.com
緊急聯絡: emergency@example.com
```

---

## 版本歷史

| 版本 | 日期 | 變更內容 | 作者 |
|------|------|----------|------|
| 1.0.0 | 2025-10-15 | 初始版本，完成生產檢查清單 | Quality Engineer Agent |

---

**文件維護**: Dev Team
**最後更新**: 2025-10-15
**適用專案**: Smart AI Avatar Agent
