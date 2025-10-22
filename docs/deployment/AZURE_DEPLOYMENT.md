# Azure Static Web Apps 生產部署指南

## 文件資訊
- **最後更新**: 2025-10-15
- **專案階段**: POC → Production
- **適用版本**: Epic 5 Part 2
- **文件版本**: 1.0.0

---

## 目錄

1. [前置準備](#前置準備)
2. [Azure Static Web Apps 建立](#azure-static-web-apps-建立)
3. [GitHub Actions 配置](#github-actions-配置)
4. [環境變數設定](#環境變數設定)
5. [首次部署](#首次部署)
6. [驗證部署](#驗證部署)
7. [生產環境管理](#生產環境管理)
8. [監控與日誌](#監控與日誌)
9. [常見問題排除](#常見問題排除)
10. [Rollback 策略](#rollback-策略)

---

## 前置準備

### 必要條件檢查清單

#### Azure 帳號與資源
- [ ] Azure 訂閱帳號（[免費註冊](https://azure.microsoft.com/free/)）
- [ ] Azure OpenAI 服務已建立
- [ ] Azure Speech Services 已建立
- [ ] 已取得 API Keys 與 Endpoints

#### GitHub 配置
- [ ] GitHub 帳號
- [ ] Repository 權限（Admin 或 Maintainer）
- [ ] 本地 Git 配置正確

#### 本地開發環境
- [ ] Node.js 18+ 已安裝
- [ ] npm 9+ 已安裝
- [ ] 本地測試通過（`npm run build` 成功）
- [ ] Git 工作目錄乾淨

### 必要資訊清單

請在開始部署前準備以下資訊：

| 類別 | 項目 | 範例 | 說明 |
|------|------|------|------|
| **Azure 訂閱** | Subscription ID | `12345678-1234-1234-1234-123456789012` | Azure Portal → Subscriptions |
| **Azure OpenAI** | Endpoint | `https://your-resource.openai.azure.com/` | OpenAI 服務端點 |
| **Azure OpenAI** | API Key | `abc123...` | Keys and Endpoint 頁面 |
| **Azure OpenAI** | Deployment Name | `gpt-4-turbo` | 模型部署名稱 |
| **Azure Speech** | API Key | `xyz789...` | Keys and Endpoint 頁面 |
| **Azure Speech** | Region | `eastasia` | 服務區域 |
| **GitHub** | Repository URL | `https://github.com/user/repo` | 完整儲存庫 URL |

#### 如何取得 Azure 資訊

##### Azure OpenAI Endpoint 與 Key
1. Azure Portal → 搜尋 "Azure OpenAI"
2. 選擇你的 OpenAI 資源
3. 左側選單 → "Keys and Endpoint"
4. 複製 "Endpoint" 與 "KEY 1"

##### Azure OpenAI Deployment Name
1. Azure Portal → Azure OpenAI 資源
2. 左側選單 → "Model deployments"
3. 記錄部署的模型名稱（例如：`gpt-4-turbo`）

##### Azure Speech Key 與 Region
1. Azure Portal → 搜尋 "Speech Services"
2. 選擇你的 Speech 資源
3. 左側選單 → "Keys and Endpoint"
4. 複製 "KEY 1" 與 "Location/Region"

---

## Azure Static Web Apps 建立

### Step 1: 建立 Static Web Apps 資源

#### 1.1 登入 Azure Portal
```
URL: https://portal.azure.com
```
使用 Azure 帳號登入

#### 1.2 建立新資源
1. 點擊左上角「Create a resource」或「+ 建立」
2. 搜尋「Static Web Apps」
3. 選擇「Static Web Apps」
4. 點擊「Create」

#### 1.3 基本配置

**Basics 標籤**:

| 欄位 | 值 | 說明 |
|------|-----|------|
| **Subscription** | 選擇你的訂閱 | Azure 訂閱 |
| **Resource Group** | `rg-avatar-chat-poc` | 建立新群組或選擇現有群組 |
| **Name** | `avatar-chat-poc` | 應用程式名稱（全球唯一） |
| **Plan type** | `Free` | POC 階段選擇免費方案 |
| **Region for Azure Functions** | `East Asia` | 最接近目標使用者 |

**Deployment details**:

| 欄位 | 值 | 說明 |
|------|-----|------|
| **Source** | `Other` | 稍後透過 GitHub Actions 手動配置 |

#### 1.4 審查與建立
1. 點擊「Review + create」
2. 檢查配置是否正確
3. 點擊「Create」
4. 等待資源建立完成（約 1-2 分鐘）

### Step 2: 取得部署 Token

#### 2.1 前往資源
資源建立完成後，點擊「Go to resource」

#### 2.2 取得 Deployment Token
1. 在 Overview 頁面，點擊「Manage deployment token」
2. 複製顯示的 Token（**重要**: 這是機密資訊，請妥善保管）
3. Token 格式範例: `SWA-1234567890abcdef1234567890abcdef1234567890abcdef1234567890ab`

**安全提示**:
- ⚠️ 不要將 Token 提交至 Git
- ⚠️ 不要在公開場合分享 Token
- ⚠️ 定期更新 Token（建議每 90 天）

#### 2.3 記錄應用程式 URL
在 Overview 頁面可以看到應用程式的 URL：
```
https://avatar-chat-poc.azurestaticapps.net
```

**提示**: 此 URL 格式為 `https://<your-app-name>.azurestaticapps.net`

---

## GitHub Actions 配置

### Step 1: 檢查 Workflow 檔案

#### 1.1 確認檔案存在
專案已包含 GitHub Actions workflow 檔案：
```
.github/workflows/azure-static-web-apps.yml
```

#### 1.2 檢查 Workflow 內容
workflow 應包含以下關鍵步驟：
- ✅ Checkout code
- ✅ Setup Node.js
- ✅ Install dependencies
- ✅ Run ESLint
- ✅ Run TypeScript check
- ✅ Build project
- ✅ Deploy to Azure Static Web Apps

### Step 2: 設定 GitHub Secrets

#### 2.1 前往 GitHub Repository
```
https://github.com/laitim2001/smart-ai-avatar-agent
```

#### 2.2 開啟 Settings
1. 點擊 Repository 右上角的「Settings」
2. 左側選單選擇「Secrets and variables」→「Actions」

#### 2.3 新增 Secrets

##### Secret 1: AZURE_STATIC_WEB_APPS_API_TOKEN
```
Name: AZURE_STATIC_WEB_APPS_API_TOKEN
Value: <從 Azure Portal 複製的 Deployment Token>
```
1. 點擊「New repository secret」
2. 輸入 Name 與 Value
3. 點擊「Add secret」

##### Secret 2: AZURE_OPENAI_API_KEY
```
Name: AZURE_OPENAI_API_KEY
Value: <你的 Azure OpenAI API Key>
```

##### Secret 3: AZURE_OPENAI_ENDPOINT
```
Name: AZURE_OPENAI_ENDPOINT
Value: https://<your-resource>.openai.azure.com/
```
**注意**: 需包含最後的斜線 `/`

##### Secret 4: AZURE_OPENAI_DEPLOYMENT
```
Name: AZURE_OPENAI_DEPLOYMENT
Value: gpt-4-turbo
```
**注意**: 填入你的實際部署名稱

##### Secret 5: AZURE_SPEECH_KEY
```
Name: AZURE_SPEECH_KEY
Value: <你的 Azure Speech Services API Key>
```

##### Secret 6: AZURE_SPEECH_REGION
```
Name: AZURE_SPEECH_REGION
Value: eastasia
```
**注意**: 填入你的實際 Speech Services 區域

#### 2.4 驗證 Secrets
確認所有 6 個 Secrets 都已正確新增：
- [x] AZURE_STATIC_WEB_APPS_API_TOKEN
- [x] AZURE_OPENAI_API_KEY
- [x] AZURE_OPENAI_ENDPOINT
- [x] AZURE_OPENAI_DEPLOYMENT
- [x] AZURE_SPEECH_KEY
- [x] AZURE_SPEECH_REGION

**提示**: Secrets 列表會顯示名稱，但值會被隱藏（安全設計）

---

## 環境變數設定

### Azure Static Web Apps 環境變數

雖然 GitHub Secrets 會在部署時傳遞，但為了安全與最佳實踐，建議在 Azure Portal 也設定環境變數。

#### Step 1: 前往 Configuration

1. Azure Portal → Static Web Apps → 選擇你的應用程式
2. 左側選單點擊「Configuration」
3. 切換到「Application settings」標籤

#### Step 2: 新增環境變數

點擊「+ Add」並逐一新增以下變數：

| Name | Value | 說明 |
|------|-------|------|
| `AZURE_OPENAI_API_KEY` | `<your_openai_key>` | OpenAI API 金鑰 |
| `AZURE_OPENAI_ENDPOINT` | `https://<resource>.openai.azure.com/` | OpenAI 端點 |
| `AZURE_OPENAI_DEPLOYMENT` | `gpt-4-turbo` | 部署名稱 |
| `AZURE_SPEECH_KEY` | `<your_speech_key>` | Speech API 金鑰 |
| `AZURE_SPEECH_REGION` | `eastasia` | Speech 區域 |
| `NODE_ENV` | `production` | Node 環境 |

#### Step 3: 儲存配置

1. 點擊「Save」
2. 確認儲存成功訊息
3. **重要**: 環境變數變更需要重新部署才會生效

#### 環境變數優先順序

```
GitHub Secrets (部署時) > Azure Application Settings > 預設值
```

建議兩者都設定以確保環境一致性。

---

## 首次部署

### Step 1: 本地建置驗證

在推送程式碼前，先在本地驗證建置：

```bash
# 1. 切換至專案目錄
cd C:\smart-ai-avatar-agent

# 2. 確認工作目錄乾淨
git status

# 3. 執行 ESLint 檢查
npm run lint

# 4. 執行 TypeScript 檢查
npx tsc --noEmit

# 5. 執行生產建置
npm run build
```

**預期結果**:
- ✅ ESLint: 通過（可能有少量 warnings，但無 errors）
- ✅ TypeScript: 無編譯錯誤
- ✅ Build: 成功產生 `.next` 目錄

### Step 2: 推送至 GitHub

#### 2.1 確認變更
```bash
# 查看未提交的變更
git status

# 查看變更內容
git diff
```

#### 2.2 提交變更（如果有）
```bash
# 暫存變更
git add .

# 提交變更
git commit -m "chore: prepare for production deployment"
```

#### 2.3 推送至 main 分支
```bash
# 推送至遠端 main 分支
git push origin main
```

**提示**: 推送至 `main` 分支會自動觸發 GitHub Actions 部署

### Step 3: 觀察 GitHub Actions

#### 3.1 前往 Actions 頁面
1. GitHub Repository → 點擊「Actions」標籤
2. 應該可以看到「Azure Static Web Apps CI/CD」正在執行

#### 3.2 查看 Workflow Run
1. 點擊最新的 workflow run
2. 展開「Build and Deploy Job」
3. 觀察每個步驟的執行狀態

#### 3.3 部署步驟預期順序
```
✅ Checkout code (< 10 秒)
✅ Setup Node.js (< 20 秒)
✅ Install dependencies (1-2 分鐘)
✅ Run ESLint (< 30 秒)
✅ Run TypeScript check (< 30 秒)
✅ Build project (1-2 分鐘)
✅ Deploy to Azure Static Web Apps (2-3 分鐘)
```

**總時間**: 首次部署約 5-10 分鐘

#### 3.4 等待完成
- 成功: 所有步驟顯示綠色勾勾 ✅
- 失敗: 步驟顯示紅色叉叉 ❌（參考[常見問題排除](#常見問題排除)）

### Step 4: 檢查 Azure Portal

1. Azure Portal → Static Web Apps → 選擇你的應用程式
2. 左側選單點擊「Deployments」
3. 確認最新部署狀態為「Succeeded」
4. 查看部署時間與 commit 訊息

---

## 驗證部署

### Step 1: 健康檢查

#### 1.1 訪問 Health API
```
URL: https://<your-app-name>.azurestaticapps.net/api/health
```

**預期回應**:
```json
{
  "success": true,
  "data": {
    "status": "ok",
    "timestamp": "2025-10-15T10:00:00.000Z",
    "version": "1.0.0",
    "environment": "production"
  },
  "timestamp": "2025-10-15T10:00:00.000Z"
}
```

**驗證項目**:
- [ ] HTTP Status Code: 200
- [ ] `success`: true
- [ ] `status`: "ok"
- [ ] `timestamp`: 有效的 ISO 8601 時間戳
- [ ] 回應時間 < 1 秒

#### 1.2 檢查回應標頭
```
Content-Type: application/json
Cache-Control: no-cache
```

### Step 2: 首頁功能驗證

#### 2.1 訪問首頁
```
URL: https://<your-app-name>.azurestaticapps.net
```

#### 2.2 首頁檢查清單
- [ ] 頁面正常載入（無白屏）
- [ ] 標題與副標題正確顯示
- [ ] 功能卡片完整顯示（4 張卡片）
- [ ] 「開始對話」按鈕顯示
- [ ] 背景漸層效果正常

#### 2.3 開發者工具檢查
按 `F12` 開啟開發者工具：

**Console 標籤**:
- [ ] 無紅色錯誤訊息
- [ ] 無 CORS 錯誤
- [ ] 無 404 資源載入失敗

**Network 標籤**:
- [ ] 所有資源成功載入（HTTP 200）
- [ ] HTML 載入時間 < 500ms
- [ ] CSS/JS 資源載入正常
- [ ] 無 5xx 伺服器錯誤

### Step 3: 3D Avatar 功能驗證

#### 3.1 進入對話頁面
點擊「開始對話」按鈕

#### 3.2 Avatar 載入檢查
- [ ] 顯示「載入 3D Avatar...」訊息
- [ ] Avatar 模型成功載入（< 5 秒）
- [ ] Avatar 正常顯示（無黑屏或錯誤）
- [ ] 呼吸動畫運作
- [ ] 眨眼動畫運作

#### 3.3 Avatar 互動檢查
- [ ] 滑鼠拖曳可旋轉 Avatar
- [ ] FPS ≥ 30（使用 Chrome DevTools Performance 面板）
- [ ] 無明顯卡頓或掉幀

### Step 4: 對話功能驗證

#### 4.1 基本對話測試
1. 在輸入框輸入: "你好"
2. 點擊「送出」按鈕

**檢查項目**:
- [ ] 訊息成功送出
- [ ] 顯示載入狀態（typing indicator）
- [ ] SSE 串流回應正常顯示
- [ ] Avatar 開始說話（TTS 播放）
- [ ] Lip Sync 嘴型同步
- [ ] 對話歷史正確記錄

#### 4.2 長句測試
1. 輸入較長的問題（> 50 字）
2. 觀察完整回應流程

**檢查項目**:
- [ ] SSE 串流穩定
- [ ] TTS 完整播放
- [ ] Lip Sync 全程同步
- [ ] 無音訊斷續或錯誤

#### 4.3 連續對話測試
1. 連續進行 5 次對話
2. 監控效能與穩定性

**檢查項目**:
- [ ] 對話歷史正確累積
- [ ] FPS 保持穩定
- [ ] 記憶體無異常增長
- [ ] 無錯誤訊息

### Step 5: 錯誤處理驗證

#### 5.1 網路錯誤測試
1. 開發者工具 → Network → 選擇「Offline」
2. 發送訊息

**預期結果**:
- [ ] 顯示友善錯誤訊息
- [ ] 應用程式未崩潰
- [ ] 可恢復連線後繼續使用

#### 5.2 API 錯誤測試
如果 Azure 服務暫時不可用：
- [ ] 顯示「Avatar 正在思考中，請稍候再試」
- [ ] 有重試機制
- [ ] 不顯示技術錯誤細節

### Step 6: 效能驗證

#### 6.1 Lighthouse 測試
1. Chrome DevTools → Lighthouse 面板
2. 勾選 Performance, Accessibility, Best Practices
3. 點擊「Generate report」

**目標分數**:
- Performance: ≥ 80
- Accessibility: ≥ 90
- Best Practices: ≥ 90
- SEO: ≥ 80

#### 6.2 載入效能
- [ ] 首屏載入 < 3 秒（Fast 3G）
- [ ] 首次繪製（FCP） < 1.5 秒
- [ ] 最大內容繪製（LCP） < 2.5 秒
- [ ] 累積版面配置位移（CLS） < 0.1

#### 6.3 執行效能
- [ ] 3D 渲染 FPS ≥ 30
- [ ] 對話回應時間 < 3 秒
- [ ] Lip Sync 延遲 < 50ms

### 驗證完成確認

完成以上所有驗證後，確認：
- ✅ 所有核心功能正常運作
- ✅ 無嚴重錯誤或警告
- ✅ 效能達標
- ✅ 使用者體驗良好

**部署成功！** 🎉

---

## 生產環境管理

### 環境變數更新

#### 更新流程
1. Azure Portal → Static Web Apps → Configuration
2. 修改 Application settings
3. 點擊「Save」
4. **重要**: 觸發重新部署以套用變更

```bash
# 觸發重新部署（空 commit）
git commit --allow-empty -m "chore: trigger redeploy for env vars update"
git push origin main
```

### 自訂網域設定（選用）

#### Step 1: 準備網域
- 已註冊的網域（例如：example.com）
- DNS 管理權限

#### Step 2: Azure 設定
1. Azure Portal → Static Web Apps → Custom domains
2. 點擊「+ Add」
3. 輸入網域名稱（例如：avatar.example.com）
4. 選擇驗證方法（CNAME 或 TXT）

#### Step 3: DNS 設定
在網域 DNS 設定新增 CNAME 記錄：
```
Type: CNAME
Name: avatar
Value: <your-app-name>.azurestaticapps.net
TTL: 3600
```

#### Step 4: 等待生效
- DNS 傳播需要 1-24 小時
- Azure 會自動提供 SSL 憑證（Let's Encrypt）
- 憑證自動更新

### SSL/HTTPS

Azure Static Web Apps 自動提供 HTTPS：
- ✅ 自動 SSL 憑證
- ✅ 強制 HTTPS 重導向
- ✅ TLS 1.2+
- ✅ HTTP/2 支援

### 成本管理

#### Free Tier 限制
- 頻寬: 100 GB/月
- Build 時間: 50 分鐘/天
- 自訂網域: 2 個

#### 監控用量
1. Azure Portal → Static Web Apps → Metrics
2. 查看 Bandwidth、Requests、Build Duration

#### 超額處理
- 超過 Free Tier 會自動升級為 Standard Tier
- Standard Tier: $9 USD/月

---

## 監控與日誌

### Application Insights 設定（建議）

#### Step 1: 建立 Application Insights
1. Azure Portal → Create a resource
2. 搜尋「Application Insights」
3. 建立資源

#### Step 2: 整合 Static Web Apps
1. Static Web Apps → Monitoring → Application Insights
2. 點擊「Enable」
3. 選擇 Application Insights 資源
4. 儲存設定

#### Step 3: 查看監控數據
- 請求數量與回應時間
- 錯誤率與例外
- 使用者行為分析

### 日誌查詢

#### Azure Portal 日誌
1. Static Web Apps → Monitoring → Logs
2. 使用 Kusto Query Language (KQL) 查詢

**範例查詢**:
```kusto
// 查詢最近 1 小時的錯誤
AppExceptions
| where TimeGenerated > ago(1h)
| order by TimeGenerated desc

// 查詢 API 回應時間
AppRequests
| where Name contains "/api/"
| summarize avg(Duration) by Name
```

### 告警設定

#### 建議告警規則

##### 1. HTTP 5xx 錯誤告警
```
條件: 5xx 錯誤 > 5 次 / 5 分鐘
動作: 發送 Email 通知
```

##### 2. 部署失敗告警
```
條件: GitHub Actions 部署失敗
動作: 發送 Email + Slack 通知
```

##### 3. 回應時間告警
```
條件: 平均回應時間 > 5 秒 / 5 分鐘
動作: 發送 Email 通知
```

#### 設定步驟
1. Azure Portal → Static Web Apps → Alerts
2. 點擊「+ New alert rule」
3. 設定條件、動作群組、詳細資訊
4. 建立告警規則

---

## 常見問題排除

### 問題 1: 建置失敗 - "Build failed"

#### 症狀
GitHub Actions 在 Build 步驟失敗，顯示錯誤訊息

#### 可能原因
1. TypeScript 編譯錯誤
2. ESLint 檢查失敗
3. 依賴安裝問題
4. 環境變數缺失

#### 解決方法

**步驟 1: 本地測試**
```bash
# 清除快取
rm -rf .next node_modules

# 重新安裝依賴
npm install

# 執行檢查
npm run lint
npx tsc --noEmit
npm run build
```

**步驟 2: 檢查錯誤訊息**
- 查看 GitHub Actions 日誌
- 找到具體錯誤行數
- 修正程式碼

**步驟 3: 重新部署**
```bash
git add .
git commit -m "fix: resolve build errors"
git push origin main
```

---

### 問題 2: API 返回 500 錯誤

#### 症狀
`/api/health` 或 `/api/chat` 返回 500 Internal Server Error

#### 可能原因
1. Azure 環境變數未設定或錯誤
2. Azure OpenAI/Speech Services 不可用
3. API Key 無效或過期

#### 解決方法

**步驟 1: 檢查環境變數**
```bash
# Azure Portal → Configuration → Application settings
# 確認以下變數存在且正確:
- AZURE_OPENAI_API_KEY
- AZURE_OPENAI_ENDPOINT
- AZURE_OPENAI_DEPLOYMENT
- AZURE_SPEECH_KEY
- AZURE_SPEECH_REGION
```

**步驟 2: 驗證 API Keys**
```bash
# 使用 curl 測試 Azure OpenAI
curl -X POST https://<resource>.openai.azure.com/openai/deployments/<deployment>/chat/completions?api-version=2024-08-01-preview \
  -H "api-key: <your-key>" \
  -H "Content-Type: application/json" \
  -d '{"messages":[{"role":"user","content":"test"}]}'

# 預期: 返回 200 與 JSON 回應
```

**步驟 3: 檢查 Azure 服務狀態**
- Azure Portal → Azure OpenAI → Overview
- 確認服務狀態為「Running」
- 檢查配額與限制

**步驟 4: 更新環境變數後重新部署**
```bash
git commit --allow-empty -m "chore: trigger redeploy after env update"
git push origin main
```

---

### 問題 3: GitHub Actions Secrets 錯誤

#### 症狀
Deploy 步驟顯示「Invalid token」或「Authentication failed」

#### 可能原因
1. `AZURE_STATIC_WEB_APPS_API_TOKEN` 設定錯誤
2. Token 已過期或被重新生成
3. Secret 名稱拼寫錯誤

#### 解決方法

**步驟 1: 重新生成 Token**
```bash
# Azure Portal → Static Web Apps → Manage deployment token
# 點擊「Regenerate token」
# 複製新的 Token
```

**步驟 2: 更新 GitHub Secret**
```bash
# GitHub → Settings → Secrets and variables → Actions
# 找到 AZURE_STATIC_WEB_APPS_API_TOKEN
# 點擊「Update」
# 貼上新的 Token
# 點擊「Update secret」
```

**步驟 3: 重新觸發部署**
```bash
# 方法 1: 重新推送
git commit --allow-empty -m "chore: retry deployment"
git push origin main

# 方法 2: GitHub Actions 手動重試
# GitHub → Actions → 選擇失敗的 workflow → Re-run jobs
```

---

### 問題 4: 部署成功但頁面顯示 404

#### 症狀
GitHub Actions 顯示成功，但訪問 URL 顯示 404 Not Found

#### 可能原因
1. `output_location` 設定錯誤
2. Next.js 建置輸出位置不正確
3. Static Web Apps 路由配置問題

#### 解決方法

**步驟 1: 檢查 Workflow 配置**
```yaml
# .github/workflows/azure-static-web-apps.yml
# 確認以下設定:
output_location: ".next"
```

**步驟 2: 檢查本地建置**
```bash
npm run build
ls -la .next/

# 確認 .next 目錄存在且包含:
# - standalone/
# - static/
# - server/
```

**步驟 3: 檢查 Next.js 配置**
```javascript
// next.config.js
module.exports = {
  output: 'standalone', // 確認此行存在
  // ...
}
```

**步驟 4: 重新部署**
```bash
git add .
git commit -m "fix: correct build output location"
git push origin main
```

---

### 問題 5: 環境變數變更未生效

#### 症狀
更新 Azure 環境變數後，應用程式仍使用舊值

#### 原因
環境變數變更需要重新部署才會生效（Azure 的設計）

#### 解決方法
```bash
# 觸發重新部署
git commit --allow-empty -m "chore: trigger redeploy for env vars update"
git push origin main

# 或使用 Azure Portal 重新啟動
# Static Web Apps → Overview → Restart
```

---

### 問題 6: CORS 錯誤

#### 症狀
瀏覽器 Console 顯示 CORS 錯誤

#### 可能原因
1. API 路由未正確配置 CORS 標頭
2. 前端呼叫了不同來源的 API

#### 解決方法

**步驟 1: 檢查 API 路由**
```typescript
// app/api/*/route.ts
export async function OPTIONS() {
  return NextResponse.json({}, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    }
  });
}
```

**步驟 2: 檢查 Next.js 配置**
```javascript
// next.config.js
module.exports = {
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET,POST,OPTIONS' },
        ],
      },
    ];
  },
};
```

---

### 問題 7: 記憶體或效能問題

#### 症狀
應用程式載入緩慢或記憶體使用異常高

#### 可能原因
1. 3D 模型過大
2. 記憶體洩漏
3. 未正確清理資源

#### 解決方法

**步驟 1: 使用 Chrome DevTools 分析**
```
F12 → Performance → Record → 執行操作 → Stop
檢查 FPS、記憶體使用、CPU 使用
```

**步驟 2: 檢查資源清理**
```typescript
// 確認 useEffect cleanup
useEffect(() => {
  return () => {
    // 清理 Three.js 資源
    scene.dispose();
    renderer.dispose();
    // 清理 Blob URLs
    URL.revokeObjectURL(audioUrl);
  };
}, []);
```

**步驟 3: 優化 3D 模型**
- 使用壓縮的 .glb 格式
- 減少多邊形數量
- 優化材質與貼圖

---

## Rollback 策略

### 方法 1: Git Revert（推薦）

#### 適用場景
- 程式碼變更導致問題
- 需要保留 Git 歷史
- 可審計的回復過程

#### 操作步驟
```bash
# 1. 查看最近的 commits
git log --oneline -10

# 2. Revert 到問題 commit
git revert <commit-hash>

# 3. 推送觸發重新部署
git push origin main
```

**優點**:
- ✅ 保留完整的 Git 歷史
- ✅ 可審計
- ✅ 自動觸發 CI/CD
- ✅ 可再次 revert（恢復變更）

**缺點**:
- ⏱️ 需要等待完整的建置與部署流程

---

### 方法 2: Azure Portal 部署歷史

#### 適用場景
- 緊急情況需要立即回復
- 無法等待建置流程
- 程式碼沒有問題，只是環境配置錯誤

#### 操作步驟

**步驟 1: 前往 Deployments**
```
Azure Portal → Static Web Apps → Deployments
```

**步驟 2: 選擇穩定版本**
1. 瀏覽部署歷史
2. 找到最後一個穩定的版本
3. 記錄 commit hash 與部署時間

**步驟 3: 啟用舊版本**
1. 點擊穩定版本的「...」選單
2. 選擇「Activate」
3. 確認切換

**步驟 4: 驗證回復**
```
訪問應用程式 URL
確認功能正常運作
```

**優點**:
- ⚡ 快速回復（< 1 分鐘）
- 🚨 適合緊急情況
- 🔄 可隨時切換版本

**缺點**:
- ⚠️ 不更新 Git 歷史
- ⚠️ 可能與程式碼不同步
- ⚠️ 需要後續同步 Git

**重要**: 使用此方法後，記得同步 Git 歷史：
```bash
# 回復後，在 Git 中記錄此操作
git commit --allow-empty -m "chore: rolled back to previous deployment in Azure Portal"
git push origin main
```

---

### 方法 3: 功能開關（Feature Flag）

#### 適用場景
- 新功能需要測試
- 可能需要快速關閉功能
- A/B 測試

#### 實作方式

**步驟 1: 新增環境變數**
```
Azure Portal → Configuration → Application settings
Name: FEATURE_NEW_AVATAR
Value: false
```

**步驟 2: 程式碼實作**
```typescript
const isNewAvatarEnabled = process.env.FEATURE_NEW_AVATAR === 'true';

if (isNewAvatarEnabled) {
  // 新功能
} else {
  // 舊功能（fallback）
}
```

**步驟 3: 開關功能**
只需更新環境變數，無需重新部署

**優點**:
- 🔄 即時開關功能
- 🧪 A/B 測試
- 🛡️ 降低風險

---

### Rollback 決策樹

```
發現問題
    ↓
是否緊急？
    ├─ 是 → Azure Portal 部署歷史（< 1 分鐘）
    │         ↓
    │     問題解決？
    │         ├─ 是 → 後續同步 Git 歷史
    │         └─ 否 → 進一步調查
    │
    └─ 否 → Git Revert（5-10 分鐘）
              ↓
          問題解決？
              ├─ 是 → 完成
              └─ 否 → 深入調查與修復
```

---

## 進階配置

### PR Preview 環境

專案已配置 PR Preview 功能：

#### 功能說明
- 每個 Pull Request 會自動建立預覽環境
- 預覽 URL: `https://<app-name>-<pr-number>.azurestaticapps.net`
- PR 關閉時自動刪除預覽環境

#### 使用方式
1. 建立 Pull Request
2. GitHub Actions 自動建置預覽環境
3. 在 PR 中查看預覽 URL
4. 測試變更
5. 合併 PR 後，預覽環境自動刪除

#### 優點
- 🧪 安全的測試環境
- 👥 團隊協作與審查
- 🚀 無需本地環境

---

### 多環境部署

#### 環境策略

| 環境 | 分支 | URL | 用途 |
|------|------|-----|------|
| Development | `develop` | `dev-<app>.azurestaticapps.net` | 開發測試 |
| Staging | `staging` | `staging-<app>.azurestaticapps.net` | 預生產驗證 |
| Production | `main` | `<app>.azurestaticapps.net` | 生產環境 |

#### 實作步驟

**步驟 1: 建立多個 Static Web Apps 資源**
- `avatar-chat-dev`
- `avatar-chat-staging`
- `avatar-chat-prod`

**步驟 2: 配置不同的 Workflow**
```yaml
# .github/workflows/deploy-dev.yml
on:
  push:
    branches: [develop]

# .github/workflows/deploy-staging.yml
on:
  push:
    branches: [staging]

# .github/workflows/deploy-prod.yml
on:
  push:
    branches: [main]
```

**步驟 3: 設定不同的環境變數**
每個環境使用不同的 Azure OpenAI/Speech 資源

---

### 效能監控儀表板

#### 建議監控指標

| 類別 | 指標 | 目標值 | 警示閾值 |
|------|------|--------|----------|
| **可用性** | Uptime | > 99.9% | < 99% |
| **效能** | 回應時間 | < 500ms | > 2s |
| **效能** | FPS | ≥ 30 | < 30 |
| **錯誤** | 錯誤率 | < 1% | > 5% |
| **用量** | Bandwidth | < 80GB/月 | > 90GB/月 |
| **用量** | Requests | < 1M/月 | > 900K/月 |

#### 設定 Azure Dashboard
1. Azure Portal → Dashboards
2. 新增 Static Web Apps 資源
3. 新增圖表: Requests, Response Time, Errors
4. 儲存儀表板

---

## 安全性最佳實踐

### API Keys 管理

#### 原則
1. ✅ 使用 GitHub Secrets 與 Azure Application Settings
2. ✅ 定期輪換 API Keys（建議每 90 天）
3. ✅ 使用不同的 Keys 於不同環境
4. ❌ 不要將 Keys 硬編碼於程式碼
5. ❌ 不要提交 `.env` 檔案至 Git

#### Key 輪換流程
```bash
# 1. 在 Azure 生成新的 Key
# 2. 更新 GitHub Secrets
# 3. 更新 Azure Application Settings
# 4. 觸發重新部署
# 5. 驗證新 Key 運作正常
# 6. 刪除舊 Key
```

---

### HTTPS 與 Security Headers

Azure Static Web Apps 預設配置：
- ✅ 強制 HTTPS
- ✅ TLS 1.2+
- ✅ HSTS (HTTP Strict Transport Security)

#### 建議額外的 Security Headers
```javascript
// next.config.js
module.exports = {
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
        ],
      },
    ];
  },
};
```

---

## 相關資源

### 官方文件
- [Azure Static Web Apps 文件](https://docs.microsoft.com/azure/static-web-apps/)
- [GitHub Actions 文件](https://docs.github.com/actions)
- [Next.js 部署文件](https://nextjs.org/docs/deployment)
- [Azure OpenAI 文件](https://learn.microsoft.com/azure/ai-services/openai/)
- [Azure Speech Services 文件](https://learn.microsoft.com/azure/ai-services/speech-service/)

### 專案文件
- [部署指南](./deployment-guide.md)
- [瀏覽器相容性報告](./BROWSER_COMPATIBILITY.md)
- [生產檢查清單](./PRODUCTION_CHECKLIST.md)
- [Story 1.5: CI/CD Azure Deployment](./stories/1.5.cicd-azure-deployment.md)

### 社群資源
- [Azure Static Web Apps Community](https://github.com/Azure/static-web-apps)
- [Next.js Discord](https://nextjs.org/discord)
- [Three.js Forum](https://discourse.threejs.org/)

---

## 附錄

### A. Workflow 檔案範例

完整的 `.github/workflows/azure-static-web-apps.yml`:

```yaml
name: Azure Static Web Apps CI/CD

on:
  push:
    branches:
      - main
  pull_request:
    types: [opened, synchronize, reopened, closed]
    branches:
      - main

jobs:
  build_and_deploy_job:
    if: github.event_name == 'push' || (github.event_name == 'pull_request' && github.event.action != 'closed')
    runs-on: ubuntu-latest
    name: Build and Deploy Job
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
        with:
          submodules: true
          lfs: false

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run ESLint
        run: npm run lint

      - name: Run TypeScript check
        run: npx tsc --noEmit

      - name: Build project
        run: npm run build
        env:
          NEXT_PUBLIC_APP_VERSION: ${{ github.sha }}

      - name: Deploy to Azure Static Web Apps
        id: builddeploy
        uses: Azure/static-web-apps-deploy@v1
        with:
          azure_static_web_apps_api_token: ${{ secrets.AZURE_STATIC_WEB_APPS_API_TOKEN }}
          repo_token: ${{ secrets.GITHUB_TOKEN }}
          action: "upload"
          app_location: "/"
          api_location: ""
          output_location: ".next"
        env:
          AZURE_OPENAI_API_KEY: ${{ secrets.AZURE_OPENAI_API_KEY }}
          AZURE_OPENAI_ENDPOINT: ${{ secrets.AZURE_OPENAI_ENDPOINT }}
          AZURE_OPENAI_DEPLOYMENT: ${{ secrets.AZURE_OPENAI_DEPLOYMENT }}
          AZURE_SPEECH_KEY: ${{ secrets.AZURE_SPEECH_KEY }}
          AZURE_SPEECH_REGION: ${{ secrets.AZURE_SPEECH_REGION }}

  close_pull_request_job:
    if: github.event_name == 'pull_request' && github.event.action == 'closed'
    runs-on: ubuntu-latest
    name: Close Pull Request Job
    steps:
      - name: Close Pull Request
        id: closepullrequest
        uses: Azure/static-web-apps-deploy@v1
        with:
          azure_static_web_apps_api_token: ${{ secrets.AZURE_STATIC_WEB_APPS_API_TOKEN }}
          action: "close"
```

### B. 環境變數清單

完整的環境變數清單：

| 變數名稱 | 類型 | 必要 | 範例 | 說明 |
|---------|------|------|------|------|
| `AZURE_OPENAI_API_KEY` | Secret | ✅ | `abc123...` | OpenAI API Key |
| `AZURE_OPENAI_ENDPOINT` | Secret | ✅ | `https://resource.openai.azure.com/` | OpenAI Endpoint |
| `AZURE_OPENAI_DEPLOYMENT` | Secret | ✅ | `gpt-4-turbo` | 模型部署名稱 |
| `AZURE_SPEECH_KEY` | Secret | ✅ | `xyz789...` | Speech API Key |
| `AZURE_SPEECH_REGION` | Secret | ✅ | `eastasia` | Speech 區域 |
| `AZURE_STATIC_WEB_APPS_API_TOKEN` | Secret | ✅ | `SWA-...` | 部署 Token |
| `NODE_ENV` | Config | ✅ | `production` | Node 環境 |
| `NEXT_PUBLIC_APP_VERSION` | Public | ❌ | `v1.0.0` | 應用程式版本 |

---

## 版本歷史

| 版本 | 日期 | 變更內容 | 作者 |
|------|------|----------|------|
| 1.0.0 | 2025-10-15 | 初始版本，完成 Azure 生產部署指南 | Quality Engineer Agent |

---

**文件維護**: Dev Team
**最後更新**: 2025-10-15
**適用專案**: Smart AI Avatar Agent POC
