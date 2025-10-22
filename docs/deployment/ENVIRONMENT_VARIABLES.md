# 環境變數配置指南 (Environment Variables Configuration Guide)

本文件說明 Smart AI Avatar Agent 專案中所有環境變數的配置方式、用途、以及在不同環境（開發、測試、生產）中的設定方法。

## 目錄

- [環境變數清單](#環境變數清單)
- [本機開發環境設定](#本機開發環境設定)
- [CI/CD 環境設定](#cicd-環境設定)
- [生產環境設定](#生產環境設定)
- [安全性最佳實踐](#安全性最佳實踐)
- [疑難排解](#疑難排解)

---

## 環境變數清單

### 必要變數 (Required)

以下變數為系統運行所必需，缺少任何一項將導致功能異常。

#### Azure OpenAI 配置

| 變數名稱 | 說明 | 範例值 | 取得方式 |
|---------|------|--------|----------|
| `AZURE_OPENAI_ENDPOINT` | Azure OpenAI 服務端點 | `https://your-resource.openai.azure.com/` | Azure Portal → OpenAI Resource → Endpoint |
| `AZURE_OPENAI_API_KEY` | Azure OpenAI API 金鑰 | `abc123...xyz` | Azure Portal → OpenAI Resource → Keys |
| `AZURE_OPENAI_DEPLOYMENT` | GPT 模型部署名稱 | `gpt-4-turbo` | Azure Portal → OpenAI Resource → Deployments |
| `AZURE_OPENAI_API_VERSION` | API 版本 | `2024-02-01` | [OpenAI API Versions](https://learn.microsoft.com/azure/ai-services/openai/reference) |

#### Azure Speech Services 配置

| 變數名稱 | 說明 | 範例值 | 取得方式 |
|---------|------|--------|----------|
| `AZURE_SPEECH_KEY` | Azure Speech 服務金鑰 | `def456...uvw` | Azure Portal → Speech Service → Keys |
| `AZURE_SPEECH_REGION` | Speech 服務區域 | `eastasia` | Azure Portal → Speech Service → Location |

#### 資料庫配置 (PostgreSQL)

| 變數名稱 | 說明 | 範例值 | 取得方式 |
|---------|------|--------|----------|
| `DATABASE_URL` | PostgreSQL 連線字串 | `postgresql://user:pass@host:5432/db` | Database provider (e.g., Supabase, Neon) |

#### 認證配置 (NextAuth.js)

| 變數名稱 | 說明 | 範例值 | 取得方式 |
|---------|------|--------|----------|
| `NEXTAUTH_SECRET` | JWT 加密金鑰 | `your-secret-key-min-32-chars` | `openssl rand -base64 32` |
| `NEXTAUTH_URL` | 應用程式 URL | `https://your-app.azurestaticapps.net` | 部署後的網址 |

#### Email 服務配置 (Resend)

| 變數名稱 | 說明 | 範例值 | 取得方式 |
|---------|------|--------|----------|
| `RESEND_API_KEY` | Resend API 金鑰 | `re_...` | [Resend Dashboard](https://resend.com/api-keys) |

#### Redis 配置 (Upstash)

| 變數名稱 | 說明 | 範例值 | 取得方式 |
|---------|------|--------|----------|
| `UPSTASH_REDIS_REST_URL` | Upstash Redis REST API URL | `https://...upstash.io` | Upstash Console → Database → REST API |
| `UPSTASH_REDIS_REST_TOKEN` | Upstash Redis 存取 Token | `AX...` | Upstash Console → Database → REST API |

### 選擇性變數 (Optional)

以下變數為選擇性配置，用於增強功能或監控。

#### 監控與分析

| 變數名稱 | 說明 | 範例值 | 預設值 |
|---------|------|--------|--------|
| `AZURE_APPLICATIONINSIGHTS_CONNECTION_STRING` | Application Insights 連線字串 | `InstrumentationKey=...` | 無 (停用監控) |
| `NEXT_PUBLIC_APP_VERSION` | 應用程式版本號 | `1.0.0` | `development` |

#### 開發/除錯

| 變數名稱 | 說明 | 範例值 | 預設值 |
|---------|------|--------|--------|
| `NODE_ENV` | 執行環境 | `production` / `development` | `development` |
| `NEXT_PUBLIC_APP_URL` | 前端應用程式 URL | `http://localhost:3000` | `http://localhost:3000` |

---

## 本機開發環境設定

### 步驟 1: 建立 `.env.local` 檔案

在專案根目錄建立 `.env.local` 檔案（此檔案已在 `.gitignore` 中，不會被提交到 Git）：

```bash
# .env.local (本機開發環境)

# ============================================
# Azure OpenAI 配置
# ============================================
AZURE_OPENAI_ENDPOINT=https://your-resource.openai.azure.com/
AZURE_OPENAI_API_KEY=your_openai_api_key_here
AZURE_OPENAI_DEPLOYMENT=gpt-4-turbo
AZURE_OPENAI_API_VERSION=2024-02-01

# ============================================
# Azure Speech Services 配置
# ============================================
AZURE_SPEECH_KEY=your_speech_key_here
AZURE_SPEECH_REGION=eastasia

# ============================================
# 資料庫配置
# ============================================
DATABASE_URL=postgresql://user:password@localhost:5432/smart_avatar_dev

# ============================================
# 認證配置
# ============================================
NEXTAUTH_SECRET=your-local-secret-key-min-32-characters
NEXTAUTH_URL=http://localhost:3000

# ============================================
# Email 服務配置
# ============================================
RESEND_API_KEY=re_your_resend_api_key

# ============================================
# Redis 配置
# ============================================
UPSTASH_REDIS_REST_URL=https://your-redis.upstash.io
UPSTASH_REDIS_REST_TOKEN=your_upstash_token

# ============================================
# 監控配置 (選擇性)
# ============================================
AZURE_APPLICATIONINSIGHTS_CONNECTION_STRING=InstrumentationKey=your-key

# ============================================
# 開發環境配置
# ============================================
NODE_ENV=development
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_VERSION=dev
```

### 步驟 2: 驗證環境變數

執行測試腳本驗證 Azure 服務連線：

```bash
npm run test:azure
```

預期輸出：
```
✅ Azure OpenAI 連接成功
   - 端點: https://your-resource.openai.azure.com/
   - 模型: gpt-4-turbo
   - 測試回應: [AI response]

✅ Azure Speech Services 連接成功
   - 區域: eastasia
   - 預設語音: zh-TW-HsiaoChenNeural
```

### 步驟 3: 啟動開發伺服器

```bash
npm run dev
```

伺服器啟動後，訪問 `http://localhost:3000` 驗證功能正常。

---

## CI/CD 環境設定

### GitHub Actions Secrets

在 GitHub Repository 中設定以下 Secrets：

**路徑**: Repository → Settings → Secrets and variables → Actions → New repository secret

#### 必要 Secrets

```yaml
# Azure OpenAI
AZURE_OPENAI_ENDPOINT
AZURE_OPENAI_API_KEY
AZURE_OPENAI_DEPLOYMENT

# Azure Speech Services
AZURE_SPEECH_KEY
AZURE_SPEECH_REGION

# Database
DATABASE_URL

# Authentication
NEXTAUTH_SECRET
NEXTAUTH_URL

# Email Service
RESEND_API_KEY

# Redis
UPSTASH_REDIS_REST_URL
UPSTASH_REDIS_REST_TOKEN

# Deployment
AZURE_STATIC_WEB_APPS_API_TOKEN

# Monitoring (Optional)
AZURE_APPLICATIONINSIGHTS_CONNECTION_STRING

# External Services (Optional)
SNYK_TOKEN  # 安全性掃描
LHCI_GITHUB_APP_TOKEN  # Lighthouse CI
```

#### 設定範例

```bash
# 1. Azure OpenAI Endpoint
Name: AZURE_OPENAI_ENDPOINT
Secret: https://your-resource.openai.azure.com/

# 2. Azure OpenAI API Key
Name: AZURE_OPENAI_API_KEY
Secret: abc123...xyz

# 3. Database URL
Name: DATABASE_URL
Secret: postgresql://user:pass@host:5432/db

# 4. NextAuth Secret
Name: NEXTAUTH_SECRET
Secret: $(openssl rand -base64 32)

# ... 依此類推
```

### 環境變數驗證腳本

在 CI/CD pipeline 中加入環境變數驗證步驟：

```yaml
- name: Validate environment variables
  run: |
    required_vars=(
      "AZURE_OPENAI_ENDPOINT"
      "AZURE_OPENAI_API_KEY"
      "AZURE_OPENAI_DEPLOYMENT"
      "AZURE_SPEECH_KEY"
      "AZURE_SPEECH_REGION"
      "DATABASE_URL"
      "NEXTAUTH_SECRET"
      "NEXTAUTH_URL"
    )

    for var in "${required_vars[@]}"; do
      if [ -z "${!var}" ]; then
        echo "❌ Missing required environment variable: $var"
        exit 1
      fi
    done

    echo "✅ All required environment variables are set"
```

---

## 生產環境設定

### Azure Static Web Apps 環境變數

**路徑**: Azure Portal → Static Web Apps → Configuration → Environment variables

#### 應用程式設定 (Application Settings)

在 Azure Portal 的 Static Web Apps 資源中，設定以下環境變數：

| 名稱 | 值 | 說明 |
|------|----|----|
| `AZURE_OPENAI_ENDPOINT` | `https://...` | 從 Azure OpenAI Resource 複製 |
| `AZURE_OPENAI_API_KEY` | `***` | 從 Azure OpenAI Resource 複製 (Keys) |
| `AZURE_OPENAI_DEPLOYMENT` | `gpt-4-turbo` | 部署名稱 |
| `AZURE_OPENAI_API_VERSION` | `2024-02-01` | API 版本 |
| `AZURE_SPEECH_KEY` | `***` | 從 Azure Speech Service 複製 |
| `AZURE_SPEECH_REGION` | `eastasia` | Speech Service 區域 |
| `DATABASE_URL` | `postgresql://...` | 生產環境資料庫連線字串 |
| `NEXTAUTH_SECRET` | `***` | 強隨機金鑰 (≥32 字元) |
| `NEXTAUTH_URL` | `https://your-app.azurestaticapps.net` | 生產環境 URL |
| `RESEND_API_KEY` | `re_***` | Resend 生產環境 API Key |
| `UPSTASH_REDIS_REST_URL` | `https://...upstash.io` | Upstash 生產環境 URL |
| `UPSTASH_REDIS_REST_TOKEN` | `***` | Upstash Token |
| `AZURE_APPLICATIONINSIGHTS_CONNECTION_STRING` | `InstrumentationKey=...` | 監控連線字串 |
| `NODE_ENV` | `production` | 生產環境標記 |

### 環境變數安全性檢查

在部署前，執行以下檢查：

```bash
# 1. 驗證所有必要變數已設定
# 2. 確認 API Keys 未過期
# 3. 測試資料庫連線
# 4. 驗證 Azure 服務配額
```

---

## 安全性最佳實踐

### 1. 金鑰管理

✅ **應該做的**:
- 使用 Azure Key Vault 集中管理敏感金鑰
- 定期輪換 API Keys (建議 90 天)
- 使用強隨機生成器產生 Secrets
- 限制 API Keys 的存取權限範圍

❌ **不應該做的**:
- 不要在程式碼中硬編碼 API Keys
- 不要將 `.env.local` 提交到 Git
- 不要在日誌中輸出敏感資訊
- 不要在前端程式碼中暴露後端 Secrets

### 2. 環境分離

不同環境使用獨立的 API Keys 和資源：

| 環境 | 資源隔離 | 資料隔離 |
|------|----------|----------|
| 開發 (Development) | 開發專用 Azure 資源 | 測試資料庫 |
| 測試 (Staging) | 測試專用 Azure 資源 | 測試資料庫 |
| 生產 (Production) | 生產專用 Azure 資源 | 生產資料庫 |

### 3. 存取控制

```yaml
# Azure OpenAI RBAC 配置範例
Role: Cognitive Services User
Scope: Resource Group
Principal: CI/CD Service Principal

# 最小權限原則
Permissions:
  - Read: OpenAI endpoints
  - Execute: Completions API
  - Denied: Management operations
```

### 4. 監控與稽核

啟用以下監控：

```bash
# Azure Monitor 稽核日誌
- API Key 使用記錄
- 異常存取偵測
- 配額使用追蹤
- 成本監控告警
```

---

## 疑難排解

### 問題 1: Azure OpenAI 連線失敗

**錯誤訊息**:
```
Error: getaddrinfo ENOTFOUND your-resource.openai.azure.com
```

**解決方法**:
1. 檢查 `AZURE_OPENAI_ENDPOINT` 格式是否正確（需包含 `https://` 和結尾 `/`）
2. 確認網路連線正常
3. 驗證 Azure OpenAI 資源狀態（Azure Portal）

### 問題 2: 認證失敗 (401 Unauthorized)

**錯誤訊息**:
```
Error: 401 Unauthorized - Access denied
```

**解決方法**:
1. 檢查 `AZURE_OPENAI_API_KEY` 是否正確
2. 確認 API Key 未過期（Azure Portal → Keys → Regenerate if needed）
3. 驗證 Deployment Name 與實際部署名稱一致

### 問題 3: 環境變數未生效

**症狀**: 修改 `.env.local` 後，應用程式仍使用舊值

**解決方法**:
```bash
# 1. 停止開發伺服器 (Ctrl+C)
# 2. 清除 Next.js 快取
rm -rf .next

# 3. 重新啟動
npm run dev
```

### 問題 4: 生產環境變數未同步

**症狀**: Azure Static Web Apps 無法讀取環境變數

**解決方法**:
1. 確認環境變數已在 Azure Portal 中設定
2. 檢查變數名稱是否完全一致（區分大小寫）
3. 重新部署應用程式以載入新變數

### 問題 5: Database 連線超時

**錯誤訊息**:
```
Error: P1001: Can't reach database server
```

**解決方法**:
1. 檢查 `DATABASE_URL` 格式:
   ```
   postgresql://USER:PASSWORD@HOST:PORT/DATABASE?schema=public
   ```
2. 確認資料庫允許外部連線（防火牆規則）
3. 驗證使用者名稱和密碼正確

---

## 環境變數模板

### `.env.example` (提交到 Git 的範本)

```bash
# .env.example
# 複製此檔案為 .env.local 並填入實際值

# Azure OpenAI
AZURE_OPENAI_ENDPOINT=
AZURE_OPENAI_API_KEY=
AZURE_OPENAI_DEPLOYMENT=
AZURE_OPENAI_API_VERSION=2024-02-01

# Azure Speech Services
AZURE_SPEECH_KEY=
AZURE_SPEECH_REGION=

# Database
DATABASE_URL=

# Authentication
NEXTAUTH_SECRET=
NEXTAUTH_URL=http://localhost:3000

# Email Service
RESEND_API_KEY=

# Redis
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=

# Monitoring (Optional)
AZURE_APPLICATIONINSIGHTS_CONNECTION_STRING=

# Development
NODE_ENV=development
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## 參考資源

- [Next.js Environment Variables](https://nextjs.org/docs/basic-features/environment-variables)
- [Azure OpenAI Documentation](https://learn.microsoft.com/azure/ai-services/openai/)
- [Azure Speech Services](https://learn.microsoft.com/azure/ai-services/speech-service/)
- [NextAuth.js Configuration](https://next-auth.js.org/configuration/options)
- [Prisma Connection URLs](https://www.prisma.io/docs/reference/database-reference/connection-urls)
- [Upstash Redis Documentation](https://docs.upstash.com/redis)

---

**Last Updated**: 2025-10-17
**Document Version**: 1.0.0
