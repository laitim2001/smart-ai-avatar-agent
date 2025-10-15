# 本地開發環境指南
**3D Avatar 即時對話系統 - MVP Sprint 1**

本文件說明如何在本地環境建立完整的開發環境，使用 Docker 替代雲端服務以加速開發。

---

## 目錄

1. [前置需求](#前置需求)
2. [Docker 環境設定](#docker-環境設定)
3. [資料庫設定（Prisma）](#資料庫設定prisma)
4. [開發伺服器啟動](#開發伺服器啟動)
5. [常見操作](#常見操作)
6. [測試功能](#測試功能)
7. [疑難排解](#疑難排解)

---

## 前置需求

### 軟體需求

| 軟體 | 最低版本 | 檢查指令 | 安裝連結 |
|------|---------|---------|---------|
| Node.js | 18.x | `node -v` | https://nodejs.org |
| npm | 9.x | `npm -v` | (隨 Node.js) |
| Docker Desktop | 最新版 | `docker -v` | https://www.docker.com/products/docker-desktop |
| Git | 2.x | `git --version` | https://git-scm.com |

### 檢查環境

```bash
# 檢查所有必要軟體
node -v        # 應顯示 v18.x 或更高
npm -v         # 應顯示 9.x 或更高
docker -v      # 應顯示 Docker version x.x.x
git --version  # 應顯示 git version x.x.x
```

---

## Docker 環境設定

### 步驟 1: 啟動 Docker 服務

確保 Docker Desktop 正在運行：

**Windows**:
- 開啟 Docker Desktop 應用程式
- 等待底部顯示 "Docker Desktop is running"

**macOS**:
- 開啟 Docker.app
- 等待頂部選單欄顯示 Docker 圖示

**Linux**:
```bash
sudo systemctl start docker
```

### 步驟 2: 啟動資料庫與快取服務

專案根目錄已包含 `docker-compose.yml`，直接啟動：

```bash
# 啟動 PostgreSQL + Redis（背景執行）
docker-compose up -d

# 檢查服務狀態
docker-compose ps
```

**預期輸出**:
```
NAME                  IMAGE                 STATUS              PORTS
smart-avatar-db       postgres:16-alpine    Up 10 seconds       0.0.0.0:5432->5432/tcp
smart-avatar-redis    redis:7-alpine        Up 10 seconds       0.0.0.0:6379->6379/tcp
```

### 步驟 3: 驗證服務連線

**測試 PostgreSQL**:
```bash
# 使用 Docker exec 連線
docker exec -it smart-avatar-db psql -U avatar_user -d smart_avatar_dev

# 應進入 psql 命令列，輸入以下確認版本
SELECT version();

# 輸入 \q 離開
```

**測試 Redis**:
```bash
# 使用 Docker exec 連線
docker exec -it smart-avatar-redis redis-cli -a dev_redis_password

# 應進入 redis-cli，輸入以下測試
PING
# 應回應 PONG

# 輸入 exit 離開
```

---

## 資料庫設定（Prisma）

### 步驟 1: 安裝專案依賴

```bash
# 安裝所有 npm 套件
npm install
```

### 步驟 2: 初始化 Prisma（首次設定）

```bash
# 如果 prisma 目錄不存在，初始化
npx prisma init
```

### 步驟 3: 建立資料庫 Schema

將 `docs/SPRINT_1_PLAN.md` 中的 Prisma Schema 複製到 `prisma/schema.prisma`

或執行 Sprint 1 Task 1 時會自動建立。

### 步驟 4: 執行資料庫遷移

```bash
# 建立並執行遷移（首次）
npx prisma migrate dev --name init-auth-schema

# Prisma 會：
# 1. 讀取 schema.prisma
# 2. 建立所有 Table
# 3. 生成 Prisma Client
```

**預期輸出**:
```
✔ Generated Prisma Client (5.x.x) to ./node_modules/@prisma/client
✔ Applied migration 20250116_init-auth-schema.sql
```

### 步驟 5: 開啟 Prisma Studio（可選）

```bash
# 開啟資料庫 GUI 管理介面
npx prisma studio
```

瀏覽器會自動開啟 http://localhost:5555，可以視覺化管理資料。

---

## 開發伺服器啟動

### 步驟 1: 確認環境變數

檢查 `.env.local` 檔案包含以下必要配置：

```bash
# 檢查檔案存在
ls -la .env.local

# 查看內容（確認 DATABASE_URL 與 REDIS_URL）
cat .env.local
```

### 步驟 2: 啟動 Next.js 開發伺服器

```bash
# 啟動開發伺服器（預設 port 3000）
npm run dev
```

**預期輸出**:
```
▲ Next.js 15.5.5
- Local:        http://localhost:3000
- Network:      http://192.168.x.x:3000

✓ Ready in 2.5s
```

### 步驟 3: 驗證應用程式

開啟瀏覽器訪問 http://localhost:3000

POC 階段應看到 Avatar 對話介面。

---

## 常見操作

### 停止與啟動 Docker 服務

```bash
# 停止服務（保留資料）
docker-compose stop

# 啟動服務
docker-compose start

# 完全停止並移除容器（保留資料）
docker-compose down

# 重新啟動服務
docker-compose up -d
```

### 重置資料庫

```bash
# 警告：以下操作會刪除所有資料！

# 方法 1: 透過 Prisma 重置
npx prisma migrate reset

# 方法 2: 完全重建 Docker Volume
docker-compose down -v
docker-compose up -d
npx prisma migrate dev --name init-auth-schema
```

### 查看資料庫日誌

```bash
# PostgreSQL 日誌
docker logs smart-avatar-db -f

# Redis 日誌
docker logs smart-avatar-redis -f

# 按 Ctrl+C 停止追蹤
```

### 資料庫備份與還原

**備份**:
```bash
# 匯出資料庫到 SQL 檔案
docker exec smart-avatar-db pg_dump -U avatar_user smart_avatar_dev > backup_$(date +%Y%m%d).sql
```

**還原**:
```bash
# 從 SQL 檔案還原
cat backup_20250116.sql | docker exec -i smart-avatar-db psql -U avatar_user -d smart_avatar_dev
```

---

## 測試功能

### 測試 1: 使用者註冊（Sprint 1 Day 3）

**前置條件**: 完成 Task 3 - 註冊功能

1. 訪問 http://localhost:3000/auth/register
2. 填寫註冊表單：
   - Email: `test@example.com`
   - Password: `Test1234`
   - Confirm Password: `Test1234`
3. 點擊「註冊」

**驗證**:
```bash
# 開啟 Prisma Studio
npx prisma studio

# 導航至 User Table
# 應看到一筆新記錄，密碼已雜湊（bcrypt）
```

### 測試 2: 使用者登入（Sprint 1 Day 4）

**前置條件**: 已完成註冊測試

1. 訪問 http://localhost:3000/auth/signin
2. 輸入註冊的 Email 與密碼
3. 點擊「登入」

**預期結果**:
- 登入成功，導向首頁
- Header 顯示使用者名稱
- Session 儲存在 PostgreSQL

**驗證 Session**:
```bash
# Prisma Studio → Session Table
# 應看到一筆 Session 記錄，包含 sessionToken
```

### 測試 3: 密碼重設（Sprint 1 Day 5-6）

**前置條件**: 已完成密碼重設功能

1. 訪問 http://localhost:3000/auth/forgot-password
2. 輸入 Email: `test@example.com`
3. 點擊「發送重設連結」

**查看 Console Log**（模擬 Email）:
```bash
# 開發伺服器的 Terminal 應顯示：
======================
📧 密碼重設 Email（模擬）
======================
收件人: test@example.com
重設連結: http://localhost:3000/auth/reset-password?token=abc123...
======================
```

4. 複製 Console 中的連結，貼到瀏覽器
5. 輸入新密碼，提交

**驗證**:
```bash
# Prisma Studio → PasswordResetToken Table
# 應看到 Token 記錄，used = true
```

6. 使用新密碼登入，確認可成功登入

### 測試 4: Rate Limiting（Sprint 1 Day 9）

**前置條件**: 已完成 Rate Limiting 功能

1. 訪問登入頁面
2. 故意輸入錯誤密碼，連續點擊 5 次「登入」
3. 第 6 次應顯示錯誤訊息：「登入嘗試次數過多，請稍後再試」

**驗證 Redis**:
```bash
# 連線 Redis
docker exec -it smart-avatar-redis redis-cli -a dev_redis_password

# 查看 Rate Limit Key
KEYS rate-limit:*

# 查看計數
GET rate-limit:login:127.0.0.1

# 查看 TTL（剩餘時間）
TTL rate-limit:login:127.0.0.1
```

---

## 疑難排解

### 問題 1: Docker 服務無法啟動

**錯誤訊息**: `Cannot connect to the Docker daemon`

**解決方法**:
1. 確認 Docker Desktop 正在運行
2. Windows: 重啟 Docker Desktop
3. Linux: `sudo systemctl restart docker`

### 問題 2: PostgreSQL 連線失敗

**錯誤訊息**: `Can't reach database server at localhost:5432`

**檢查步驟**:
```bash
# 1. 檢查容器狀態
docker-compose ps

# 2. 檢查 PostgreSQL 日誌
docker logs smart-avatar-db

# 3. 確認 Port 5432 未被佔用
# Windows:
netstat -ano | findstr :5432

# macOS/Linux:
lsof -i :5432

# 4. 重啟服務
docker-compose restart postgres
```

### 問題 3: Prisma 遷移失敗

**錯誤訊息**: `Migration failed to apply cleanly`

**解決方法**:
```bash
# 完全重置資料庫
npx prisma migrate reset

# 重新執行遷移
npx prisma migrate dev --name init-auth-schema

# 重新生成 Prisma Client
npx prisma generate
```

### 問題 4: Redis 連線失敗

**錯誤訊息**: `NOAUTH Authentication required`

**檢查步驟**:
```bash
# 確認 .env.local 包含 Redis 密碼
cat .env.local | grep REDIS_URL

# 應顯示: redis://:dev_redis_password@localhost:6379

# 手動測試連線
docker exec -it smart-avatar-redis redis-cli -a dev_redis_password PING
# 應回應 PONG
```

### 問題 5: Port 衝突

**錯誤訊息**: `Port 5432/6379/3000 is already in use`

**解決方法**:

**PostgreSQL (5432)**:
```bash
# Windows: 找出佔用 Port 的程式
netstat -ano | findstr :5432

# 終止程式（替換 PID）
taskkill /PID <PID> /F

# 或修改 docker-compose.yml 使用其他 Port
# ports:
#   - "5433:5432"  # 本地 5433 → 容器 5432
```

**Next.js (3000)**:
```bash
# 使用其他 Port 啟動
PORT=3001 npm run dev
```

### 問題 6: Email 未出現在 Console

**症狀**: 密碼重設沒有顯示 Email 內容

**檢查步驟**:
```bash
# 1. 確認環境變數
cat .env.local | grep EMAIL_PROVIDER
# 應顯示: EMAIL_PROVIDER="console"

# 2. 檢查 lib/email/mock.ts 實作
# 應包含 console.log() 輸出

# 3. 確認開發伺服器 Terminal 有輸出
# 如果沒有，檢查瀏覽器 Console 或 Network Tab
```

---

## 開發工作流程

### 每日開發流程

```bash
# 1. 啟動 Docker 服務（如果未執行）
docker-compose up -d

# 2. 拉取最新程式碼
git pull origin main

# 3. 安裝新套件（如果有更新）
npm install

# 4. 執行資料庫遷移（如果有新 migration）
npx prisma migrate dev

# 5. 啟動開發伺服器
npm run dev

# 6. 開始開發！
```

### 完成開發後

```bash
# 1. 執行測試
npm test

# 2. 執行 Lint
npm run lint

# 3. 提交程式碼
git add .
git commit -m "feat: 完成 XXX 功能"
git push

# 4. 停止 Docker 服務（可選）
docker-compose stop
```

---

## 生產環境部署前檢查

Sprint 1 完成後，部署到生產環境前需要：

### 1. 切換到雲端服務

**PostgreSQL**:
```bash
# 申請 Azure Database for PostgreSQL
# 更新 .env.production 的 DATABASE_URL
```

**Redis**:
```bash
# 註冊 Upstash Redis
# 更新 REDIS_URL 為 Upstash REST API
```

### 2. 設定 Email 服務

```bash
# 註冊 Resend
# 更新環境變數
EMAIL_PROVIDER="resend"
RESEND_API_KEY="re_..."
RESEND_FROM_EMAIL="noreply@yourdomain.com"
```

### 3. 生成安全的 Secret

```bash
# 生成新的 NEXTAUTH_SECRET
openssl rand -base64 32

# 更新生產環境變數
NEXTAUTH_SECRET="<新生成的 Secret>"
NEXTAUTH_URL="https://yourdomain.com"
```

### 4. 執行生產環境遷移

```bash
# 在生產資料庫執行遷移
DATABASE_URL="<生產資料庫 URL>" npx prisma migrate deploy
```

---

## 附錄

### Docker Compose 服務說明

| 服務 | 容器名稱 | Port | 用途 | Volume |
|------|---------|------|------|--------|
| postgres | smart-avatar-db | 5432 | 使用者資料、Session | postgres_data |
| redis | smart-avatar-redis | 6379 | Rate Limiting | redis_data |

### 常用 Prisma 指令

```bash
# 資料庫遷移
npx prisma migrate dev            # 開發環境遷移（互動式）
npx prisma migrate deploy         # 生產環境遷移（非互動）
npx prisma migrate reset          # 重置資料庫（刪除所有資料）

# 資料庫管理
npx prisma studio                 # 開啟 GUI 管理介面
npx prisma db push                # 快速同步 Schema（跳過 migration）
npx prisma db pull                # 從現有資料庫反向生成 Schema

# Prisma Client
npx prisma generate               # 重新生成 Prisma Client
npx prisma format                 # 格式化 schema.prisma

# 除錯
npx prisma validate               # 驗證 Schema 語法
npx prisma db execute --stdin < script.sql  # 執行 SQL 腳本
```

### 環境變數完整清單

| 變數名稱 | Sprint 1 必要 | 說明 |
|---------|-------------|------|
| AZURE_OPENAI_API_KEY | ✅ | Azure OpenAI API Key |
| AZURE_OPENAI_ENDPOINT | ✅ | Azure OpenAI Endpoint |
| AZURE_OPENAI_DEPLOYMENT | ✅ | 模型部署名稱 |
| AZURE_SPEECH_KEY | ✅ | Azure Speech Services Key |
| AZURE_SPEECH_REGION | ✅ | Azure Speech 區域 |
| DATABASE_URL | ✅ | PostgreSQL 連線字串 |
| REDIS_URL | ✅ | Redis 連線字串 |
| NEXTAUTH_SECRET | ✅ | NextAuth.js Session Secret |
| NEXTAUTH_URL | ✅ | 應用程式 URL |
| EMAIL_PROVIDER | ✅ | Email 提供者（console/resend）|
| GOOGLE_CLIENT_ID | ❌ | Google OAuth（Sprint 2-3）|
| GOOGLE_CLIENT_SECRET | ❌ | Google OAuth Secret |
| MICROSOFT_CLIENT_ID | ❌ | Microsoft OAuth（Sprint 2-3）|
| MICROSOFT_CLIENT_SECRET | ❌ | Microsoft OAuth Secret |
| RESEND_API_KEY | ❌ | Resend API Key（Sprint 2-3）|
| RESEND_FROM_EMAIL | ❌ | 寄件者 Email |

---

**文件維護**: Development Team
**最後更新**: 2025-01-16
**適用版本**: Sprint 1 (MVP)
**相關文件**:
- `docs/SPRINT_1_PLAN.md`
- `docker-compose.yml`
- `.env.local.example`
