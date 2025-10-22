# 部署指南 - Smart AI Avatar Agent

本指南詳細說明如何將 Smart AI Avatar Agent 部署到 Azure Static Web Apps，並配置 GitHub Actions CI/CD 流程。

---

## 目錄

1. [前置準備](#前置準備)
2. [Azure Static Web Apps 建立](#azure-static-web-apps-建立)
3. [GitHub Actions 配置](#github-actions-配置)
4. [環境變數設定](#環境變數設定)
5. [首次部署](#首次部署)
6. [驗證部署](#驗證部署)
7. [常見問題排除](#常見問題排除)
8. [Rollback 策略](#rollback-策略)

---

## 前置準備

### 必要條件

- ✅ Azure 訂閱帳號（[免費註冊](https://azure.microsoft.com/free/)）
- ✅ GitHub 帳號
- ✅ 本地專案已完成開發並測試通過
- ✅ Azure OpenAI 和 Azure Speech Services 已建立並取得 API Keys

### 必要資訊清單

在開始部署前，請準備以下資訊：

| 項目 | 說明 | 範例 |
|------|------|------|
| Azure Subscription ID | Azure 訂閱 ID | `12345678-1234-1234-1234-123456789012` |
| Azure OpenAI Endpoint | OpenAI 服務端點 | `https://your-resource.openai.azure.com/` |
| Azure OpenAI API Key | OpenAI API 金鑰 | `abc123...` |
| Azure OpenAI Deployment | 部署名稱 | `gpt-4-turbo` |
| Azure Speech Key | Speech Services API 金鑰 | `xyz789...` |
| Azure Speech Region | Speech Services 區域 | `eastasia` |
| GitHub Repository URL | GitHub 儲存庫 URL | `https://github.com/laitim2001/smart-ai-avatar-agent` |

---

## Azure Static Web Apps 建立

### Step 1: 建立 Static Web Apps 資源

1. **登入 Azure Portal**
   - 訪問 [https://portal.azure.com](https://portal.azure.com)
   - 使用 Azure 帳號登入

2. **建立新資源**
   - 點擊左上角「Create a resource」
   - 搜尋「Static Web Apps」
   - 點擊「Create」

3. **基本配置**
   - **Subscription**: 選擇你的訂閱
   - **Resource Group**: 建立新群組或選擇現有群組
     - 建議名稱：`rg-avatar-chat-poc`
   - **Name**: 輸入應用程式名稱
     - 範例：`avatar-chat-poc`
   - **Plan type**: 選擇 `Free`（POC 階段）
   - **Region**: 選擇 `East Asia`（最接近目標使用者）

4. **部署來源**
   - **Deployment source**: 稍後透過 GitHub Actions 手動配置
   - 選擇「Other」

5. **建立資源**
   - 點擊「Review + create」
   - 檢查配置無誤後點擊「Create」
   - 等待資源建立完成（約 1-2 分鐘）

### Step 2: 取得部署 Token

1. **前往資源**
   - 資源建立完成後，點擊「Go to resource」

2. **取得 Deployment Token**
   - 在左側選單點擊「Overview」
   - 點擊「Manage deployment token」
   - 複製顯示的 Token（這是重要的機密資訊，請妥善保管）
   - **範例格式**: `SWA-1234567890abcdef...`

3. **記錄 Static Web Apps URL**
   - 在 Overview 頁面可以看到應用程式的 URL
   - **範例**: `https://avatar-chat-poc.azurestaticapps.net`

---

## GitHub Actions 配置

### Step 1: Workflow 檔案已建立

本專案已經包含 GitHub Actions workflow 檔案：
- 檔案位置：`.github/workflows/azure-static-web-apps.yml`

### Step 2: 設定 GitHub Secrets

1. **前往 GitHub Repository**
   - 訪問 `https://github.com/laitim2001/smart-ai-avatar-agent`

2. **開啟 Settings**
   - 點擊 Repository 右上角的「Settings」

3. **新增 Secrets**
   - 左側選單選擇「Secrets and variables」→「Actions」
   - 點擊「New repository secret」

4. **新增以下 6 個 Secrets**:

#### Secret 1: AZURE_STATIC_WEB_APPS_API_TOKEN
- **Name**: `AZURE_STATIC_WEB_APPS_API_TOKEN`
- **Value**: 從 Azure Portal 取得的 Deployment Token
- 點擊「Add secret」

#### Secret 2: AZURE_OPENAI_API_KEY
- **Name**: `AZURE_OPENAI_API_KEY`
- **Value**: 你的 Azure OpenAI API 金鑰
- 點擊「Add secret」

#### Secret 3: AZURE_OPENAI_ENDPOINT
- **Name**: `AZURE_OPENAI_ENDPOINT`
- **Value**: 你的 Azure OpenAI 端點 URL
- 範例：`https://your-resource.openai.azure.com/`
- 點擊「Add secret」

#### Secret 4: AZURE_OPENAI_DEPLOYMENT
- **Name**: `AZURE_OPENAI_DEPLOYMENT`
- **Value**: 你的 Azure OpenAI 部署名稱
- 範例：`gpt-4-turbo`
- 點擊「Add secret」

#### Secret 5: AZURE_SPEECH_KEY
- **Name**: `AZURE_SPEECH_KEY`
- **Value**: 你的 Azure Speech Services API 金鑰
- 點擊「Add secret」

#### Secret 6: AZURE_SPEECH_REGION
- **Name**: `AZURE_SPEECH_REGION`
- **Value**: 你的 Azure Speech Services 區域
- 範例：`eastasia`
- 點擊「Add secret」

5. **驗證 Secrets**
   - 確認所有 6 個 Secrets 都已正確新增
   - Secrets 列表應顯示所有 Secret 名稱（值會被隱藏）

---

## 環境變數設定

### Azure Static Web Apps 環境變數

在 Azure Portal 設定生產環境使用的環境變數：

1. **前往 Static Web Apps 資源**
   - Azure Portal → Static Web Apps → 選擇你的應用程式

2. **開啟 Configuration**
   - 左側選單點擊「Configuration」
   - 切換到「Application settings」標籤

3. **新增環境變數**
   點擊「+ Add」並新增以下變數：

   | Name | Value |
   |------|-------|
   | `AZURE_OPENAI_API_KEY` | `<your_openai_key>` |
   | `AZURE_OPENAI_ENDPOINT` | `https://<your-resource>.openai.azure.com/` |
   | `AZURE_OPENAI_DEPLOYMENT` | `gpt-4-turbo` |
   | `AZURE_SPEECH_KEY` | `<your_speech_key>` |
   | `AZURE_SPEECH_REGION` | `eastasia` |
   | `NODE_ENV` | `production` |

4. **儲存配置**
   - 點擊「Save」
   - **注意**: 環境變數變更需要重新部署才會生效

---

## 首次部署

### Step 1: 推送程式碼

如果 workflow 檔案還未推送到 GitHub：

```bash
# 確認工作目錄乾淨
git status

# 如果有未提交的變更，先提交
git add .github/workflows/azure-static-web-apps.yml README.md docs/deployment-guide.md
git commit -m "feat(ci/cd): add Azure Static Web Apps deployment workflow"

# 推送到 main 分支
git push origin main
```

### Step 2: 觀察 GitHub Actions

1. **前往 Actions 頁面**
   - GitHub Repository → Actions 標籤

2. **查看 Workflow Run**
   - 應該可以看到「Azure Static Web Apps CI/CD」正在執行
   - 點擊進入查看詳細進度

3. **部署步驟**
   預期執行順序：
   - ✅ Checkout code
   - ✅ Setup Node.js
   - ✅ Install dependencies
   - ✅ Run ESLint
   - ✅ Run TypeScript check
   - ✅ Build project
   - ✅ Deploy to Azure Static Web Apps

4. **等待完成**
   - 首次部署約需 **5-10 分鐘**
   - 成功後會顯示綠色勾勾 ✅

---

## 驗證部署

### Step 1: 檢查部署狀態

1. **GitHub Actions 狀態**
   - 確認 workflow run 顯示綠色「Success」

2. **Azure Portal 狀態**
   - Azure Portal → Static Web Apps → 選擇應用程式
   - 左側選單點擊「Deployments」
   - 確認最新部署狀態為「Succeeded」

### Step 2: 訪問應用程式

1. **開啟生產 URL**
   - 訪問 `https://<your-app-name>.azurestaticapps.net`
   - 範例：`https://avatar-chat-poc.azurestaticapps.net`

2. **驗證首頁**
   - 確認首頁正常顯示
   - 檢查 3D Avatar、功能卡片等元素

3. **測試 Health API**
   - 訪問 `https://<your-app-name>.azurestaticapps.net/api/health`
   - 確認返回正確的 JSON 格式：
     ```json
     {
       "success": true,
       "data": {
         "status": "ok",
         "timestamp": "2025-10-15T10:00:00.000Z",
         "version": "1.0.0"
       },
       "timestamp": "2025-10-15T10:00:00.000Z"
     }
     ```

4. **檢查瀏覽器控制台**
   - 按 F12 開啟開發者工具
   - 確認沒有 JavaScript 錯誤
   - 檢查 Network 標籤，確認所有資源正確載入

### Step 3: 功能測試

- 測試 API Health Check 狀態顯示
- 確認所有 UI 元素正確呈現
- 驗證響應式設計（手機、平板、桌面）

---

## 常見問題排除

### 問題 1: 部署失敗 - "Build failed"

**症狀**: GitHub Actions 在 Build 步驟失敗

**可能原因**:
- TypeScript 編譯錯誤
- ESLint 檢查失敗
- 依賴安裝問題

**解決方法**:
```bash
# 本地測試建置
npm run lint
npx tsc --noEmit
npm run build

# 修正所有錯誤後重新推送
git add .
git commit -m "fix: resolve build errors"
git push origin main
```

### 問題 2: API 返回 500 錯誤

**症狀**: `/api/health` 返回 500 Internal Server Error

**可能原因**:
- Azure 環境變數未設定
- 環境變數格式錯誤

**解決方法**:
1. 檢查 Azure Portal → Configuration → Application settings
2. 確認所有必要環境變數都已設定
3. 檢查環境變數值是否正確（無多餘空格）
4. 點擊「Save」後等待環境重新載入

### 問題 3: GitHub Actions Secrets 錯誤

**症狀**: Deploy 步驟顯示「Invalid token」

**可能原因**:
- `AZURE_STATIC_WEB_APPS_API_TOKEN` 設定錯誤
- Token 已過期

**解決方法**:
1. 前往 Azure Portal → Static Web Apps
2. 點擊「Manage deployment token」
3. 重新生成新的 Token
4. 更新 GitHub Secret: `AZURE_STATIC_WEB_APPS_API_TOKEN`

### 問題 4: 部署成功但頁面顯示 404

**症狀**: 部署成功，但訪問 URL 顯示 404

**可能原因**:
- `output_location` 設定錯誤
- Next.js 建置輸出位置不正確

**解決方法**:
1. 檢查 `.github/workflows/azure-static-web-apps.yml`
2. 確認 `output_location: ".next"` 設定正確
3. 本地執行 `npm run build` 檢查是否產生 `.next` 目錄

### 問題 5: 環境變數變更未生效

**症狀**: 更新 Azure 環境變數後，應用程式仍使用舊值

**可能原因**:
- 環境變數變更需要重新部署

**解決方法**:
```bash
# 觸發重新部署（空 commit）
git commit --allow-empty -m "chore: trigger redeploy for env vars update"
git push origin main
```

---

## Rollback 策略

### 方法 1: Git Revert（推薦）

```bash
# 查看最近的 commits
git log --oneline -10

# Revert 到問題 commit
git revert <commit-hash>

# 推送觸發重新部署
git push origin main
```

**優點**:
- 保留完整的 Git 歷史
- 可審計的回復過程
- 自動觸發 CI/CD

### 方法 2: Azure Portal 部署歷史

1. **前往 Deployments**
   - Azure Portal → Static Web Apps → Deployments

2. **選擇版本**
   - 找到穩定的舊版本
   - 點擊「Activate」

3. **確認回復**
   - 等待環境切換完成
   - 測試應用程式是否恢復正常

**優點**:
- 快速回復（無需重新建置）
- 適合緊急情況

**缺點**:
- 不更新 Git 歷史
- 可能與程式碼不同步

---

## 進階配置

### PR Preview 環境

GitHub Actions workflow 已配置 PR Preview 功能：
- 每個 Pull Request 會自動建立預覽環境
- PR 關閉時自動刪除預覽環境

### 自訂網域（未來 MVP）

1. **Azure Portal**
   - Static Web Apps → Custom domains → Add

2. **DNS 設定**
   - 新增 CNAME 記錄指向 Static Web Apps URL

3. **SSL 憑證**
   - Azure 自動提供免費 SSL 憑證

### 監控與 Alerts（建議）

1. **啟用 Application Insights**
   - Azure Portal → Static Web Apps → Monitoring → Application Insights

2. **設定 Alerts**
   - HTTP 5xx 錯誤 > 5 次/5 分鐘
   - 部署失敗通知
   - 回應時間 > 5 秒

---

## 相關資源

- **Azure Static Web Apps 文件**: https://docs.microsoft.com/azure/static-web-apps/
- **GitHub Actions 文件**: https://docs.github.com/actions
- **Next.js 部署文件**: https://nextjs.org/docs/deployment
- **專案 Story 1.5**: [docs/stories/1.5.cicd-azure-deployment.md](../docs/stories/1.5.cicd-azure-deployment.md)

---

**最後更新**: 2025-10-15
**維護者**: Dev Team
