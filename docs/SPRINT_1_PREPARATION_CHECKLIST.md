# Sprint 1 準備期檢查清單
**本地開發環境準備（2025-10-16 ~ 2025-10-21）**

## ✅ 快速開始檢查

在開始 Sprint 1 開發前，請確認以下項目：

- [ ] Docker Desktop 已安裝並運行
- [ ] Node.js ≥ 18 已安裝
- [ ] Git 工作目錄乾淨
- [ ] 已閱讀 `docs/LOCAL_DEV_GUIDE.md`
- [ ] 已閱讀 `docs/SPRINT_1_PLAN_LOCAL_DEV.md`

---

## 📋 詳細準備清單

### 1. 軟體環境檢查

```bash
# 檢查 Node.js 版本（需 ≥ 18）
node -v

# 檢查 npm 版本
npm -v

# 檢查 Docker 版本
docker -v

# 檢查 Git 版本
git --version
```

**預期輸出**:
- Node.js: v18.x 或更高
- npm: 9.x 或更高
- Docker: 任何最新版本
- Git: 2.x 或更高

**❌ 如果版本不符**:
- Node.js: 從 https://nodejs.org 下載 LTS 版本
- Docker: 從 https://docker.com/products/docker-desktop 安裝

---

### 2. Docker 環境準備

#### 2.1 確認 Docker Desktop 運行中

**Windows**:
- 開啟 Docker Desktop 應用程式
- 等待底部顯示 "Docker Desktop is running"

**macOS**:
- 開啟 Docker.app
- 檢查選單欄有 Docker 圖示

**Linux**:
```bash
sudo systemctl status docker
# 應顯示 active (running)
```

#### 2.2 啟動資料庫服務

```bash
# 進入專案目錄
cd C:\smart-ai-avatar-agent

# 啟動 PostgreSQL + Redis
docker-compose up -d

# 檢查服務狀態
docker-compose ps
```

**預期輸出**:
```
NAME                  IMAGE                 STATUS              PORTS
smart-avatar-db       postgres:16-alpine    Up 10 seconds       0.0.0.0:5435->5432/tcp
smart-avatar-redis    redis:7-alpine        Up 10 seconds       0.0.0.0:6380->6379/tcp
```

**✅ 成功標準**: 兩個容器都顯示 `Up`

**❌ 如果失敗**:
- 檢查 Port 5435 與 6380 是否被佔用
- 查看日誌: `docker logs smart-avatar-db`
- 參考 `docs/LOCAL_DEV_GUIDE.md` 疑難排解章節

#### 2.3 測試資料庫連線

```bash
# PostgreSQL
docker exec -it smart-avatar-db psql -U avatar_user -d smart_avatar_dev -c "SELECT version();"

# Redis
docker exec -it smart-avatar-redis redis-cli -a dev_redis_password PING
```

**預期輸出**:
- PostgreSQL: 顯示版本資訊
- Redis: 回應 `PONG`

---

### 3. 專案依賴安裝

```bash
# 確保在專案根目錄
cd C:\smart-ai-avatar-agent

# 安裝所有 npm 套件
npm install

# 檢查是否有錯誤
npm list --depth=0
```

**預期結果**:
- 無 `WARN` 或 `ERROR` 訊息
- 所有套件正確安裝

**❌ 如果有錯誤**:
```bash
# 清理並重新安裝
rm -rf node_modules package-lock.json
npm install
```

---

### 4. 環境變數配置

#### 4.1 檢查 .env.local

```bash
# 檢查檔案存在
ls -la .env.local

# 查看內容（確認必要變數）
cat .env.local
```

#### 4.2 必要環境變數檢查清單

- [ ] `AZURE_OPENAI_API_KEY` - Azure OpenAI Key（POC 已有）
- [ ] `AZURE_OPENAI_ENDPOINT` - Azure OpenAI Endpoint
- [ ] `AZURE_OPENAI_DEPLOYMENT` - gpt-5-chat
- [ ] `AZURE_SPEECH_KEY` - Azure Speech Key
- [ ] `AZURE_SPEECH_REGION` - eastasia
- [ ] `DATABASE_URL` - PostgreSQL 連線字串（Docker）
- [ ] `REDIS_URL` - Redis 連線字串（Docker）
- [ ] `NEXTAUTH_SECRET` - NextAuth.js Secret
- [ ] `NEXTAUTH_URL` - http://localhost:3000
- [ ] `EMAIL_PROVIDER` - console

#### 4.3 生成 NEXTAUTH_SECRET（如果還沒有）

**Windows (PowerShell)**:
```powershell
# 生成隨機 Secret
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }) -as [byte[]])
```

**macOS/Linux**:
```bash
openssl rand -base64 32
```

**將生成的值複製到 .env.local 的 NEXTAUTH_SECRET**

---

### 5. Git 工作目錄準備

#### 5.1 檢查當前狀態

```bash
# 檢查分支
git branch

# 檢查未提交的變更
git status
```

#### 5.2 建立 Feature Branch（推薦）

```bash
# 建立並切換到 Sprint 1 開發分支
git checkout -b feature/sprint-1-auth

# 確認切換成功
git branch
# 應顯示 * feature/sprint-1-auth
```

**為什麼使用 Feature Branch**:
- 保持 main 分支穩定
- 方便回滾變更
- 符合 Git Flow 最佳實踐

---

### 6. 文件審閱

請依序閱讀以下文件（預計 30-60 分鐘）：

#### 必讀文件
- [ ] `docs/LOCAL_DEV_GUIDE.md`（本地開發指南）
  - **重點**: Docker 操作、Prisma 指令、測試流程
- [ ] `docs/SPRINT_1_PLAN_LOCAL_DEV.md`（Sprint 1 本地開發計劃）
  - **重點**: 8-9 天任務分解、驗收標準
- [ ] `.env.local.example`（環境變數範例）
  - **重點**: 確認所有必要變數

#### 選讀文件（深入理解）
- [ ] `docs/SPRINT_1_PLAN.md`（原完整計劃，了解 OAuth 與雲端服務）
- [ ] `docs/SHADCN_UI_SETUP_GUIDE.md`（shadcn/ui 安裝指南）
- [ ] `docs/MVP_PLANNING_SESSION.md`（MVP 規劃會議記錄）

---

### 7. 開發工具準備

#### 7.1 推薦 VSCode 擴充套件

- [ ] **Prisma** (Prisma.prisma)
  - 語法高亮、自動完成
- [ ] **ESLint** (dbaeumer.vscode-eslint)
  - 程式碼檢查
- [ ] **Prettier** (esbenp.prettier-vscode)
  - 程式碼格式化
- [ ] **Tailwind CSS IntelliSense** (bradlc.vscode-tailwindcss)
  - Tailwind 自動完成

#### 7.2 VSCode 設定建議

**檔案**: `.vscode/settings.json`（可選）
```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "[prisma]": {
    "editor.defaultFormatter": "Prisma.prisma"
  }
}
```

---

### 8. 測試開發伺服器

```bash
# 啟動 Next.js 開發伺服器
npm run dev
```

**預期輸出**:
```
▲ Next.js 15.5.5
- Local:        http://localhost:3000
- Network:      http://192.168.x.x:3000

✓ Ready in 2.5s
```

**開啟瀏覽器測試**:
- 訪問 http://localhost:3000
- 應看到 POC 階段的 Avatar 對話介面

**✅ 成功標準**:
- 伺服器正常啟動
- 頁面可正常顯示
- Console 無嚴重錯誤

---

## 🎯 準備完成確認

當所有項目都打勾後，您已準備好開始 Sprint 1 開發！

### 最終檢查清單

- [ ] Docker PostgreSQL 與 Redis 正常運行
- [ ] npm install 成功，無錯誤
- [ ] .env.local 包含所有必要變數
- [ ] Git feature branch 已建立
- [ ] 已閱讀必讀文件
- [ ] 開發伺服器可正常啟動

### 準備就緒後的下一步

1. **Sprint 1 Day 1 上午**: 執行 Docker 環境設定（應該已完成）
2. **Sprint 1 Day 1 下午**: 安裝 shadcn/ui 與認證套件
3. **Sprint 1 Day 1 晚上**: Prisma 設定與資料庫遷移

**開始開發**:
```bash
# 確保 Docker 服務運行中
docker-compose ps

# 啟動開發伺服器
npm run dev

# 開始開發！
```

---

## 🆘 遇到問題？

### 常見問題快速索引

1. **Docker 無法啟動** → `docs/LOCAL_DEV_GUIDE.md` § 疑難排解 - 問題 1
2. **PostgreSQL 連線失敗** → `docs/LOCAL_DEV_GUIDE.md` § 疑難排解 - 問題 2
3. **Port 衝突** → `docs/LOCAL_DEV_GUIDE.md` § 疑難排解 - 問題 5
4. **npm install 失敗** → 刪除 node_modules 重新安裝

### 需要協助

如果遇到無法解決的問題：
1. 檢查 `docs/LOCAL_DEV_GUIDE.md` 疑難排解章節
2. 查看 Docker 日誌: `docker logs smart-avatar-db`
3. 檢查開發伺服器 Console 錯誤訊息

---

**文件維護**: Development Team
**最後更新**: 2025-01-16
**相關文件**:
- `docs/LOCAL_DEV_GUIDE.md`
- `docs/SPRINT_1_PLAN_LOCAL_DEV.md`
- `docker-compose.yml`
