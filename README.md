# Smart AI Avatar Agent

**3D Avatar 即時對話系統 - POC 專案**

一個基於 Next.js 14、Three.js 和 Azure AI 服務的智能 3D Avatar 對話系統，支援即時對話、語音合成和嘴型同步。

## 🎯 專案概述

本專案旨在打造一個具有 3D 視覺化 Avatar 的智能對話系統，使用者可以與 AI 助理進行自然對話，並獲得即時的視覺和語音回饋。

### 核心功能

- 🎨 **3D Avatar 渲染** - 使用 Three.js 渲染逼真的 3D Avatar
- 💬 **即時對話** - 基於 Azure OpenAI GPT-4 Turbo 的智能對話
- 🎤 **語音合成** - Azure Speech Services TTS 繁體中文語音
- 👄 **嘴型同步** - 音訊驅動的 Lip Sync 動畫
- 🎭 **表情動畫** - 呼吸、眨眼、面部表情等自然動畫

## 🚀 快速開始

### 前置需求

- Node.js 18+
- npm 9+
- Azure OpenAI 帳號
- Azure Speech Services 帳號

### 安裝步驟

1. **克隆專案**
```bash
git clone https://github.com/laitim2001/smart-ai-avatar-agent.git
cd smart-ai-avatar-agent
```

2. **安裝依賴**
```bash
npm install
```

3. **配置環境變數**
```bash
# 複製環境變數範例檔案
cp .env.local.example .env.local

# 編輯 .env.local 並填入你的 Azure API Keys
```

4. **啟動開發伺服器**
```bash
npm run dev
```

5. **開啟瀏覽器**
訪問 `http://localhost:3000`

## 📦 技術堆疊

### 前端框架
- **Next.js 15.5.5** - React 框架 (App Router)
- **React 19.2.0** - UI 函式庫
- **TypeScript 5.9.3** - 型別安全

### 3D 渲染
- **Three.js** - WebGL 3D 渲染引擎
- **@react-three/fiber** - React Three.js 整合
- **@react-three/drei** - Three.js 工具函式庫

### 狀態管理
- **Zustand** - 輕量級狀態管理

### 樣式
- **Tailwind CSS 4.1.14** - Utility-first CSS 框架

### AI 服務
- **Azure OpenAI** - GPT-4 Turbo 對話模型
- **Azure Speech Services** - TTS/STT 語音服務

## 📂 專案結構

```
smart-ai-avatar-agent/
├── app/                          # Next.js App Router
│   ├── api/                      # API Routes
│   │   ├── chat/route.ts        # LLM 對話 API (SSE)
│   │   ├── tts/route.ts         # TTS 語音合成 API
│   │   └── health/route.ts      # 健康檢查 API
│   ├── layout.tsx               # 全域佈局
│   ├── page.tsx                 # 首頁
│   └── globals.css              # 全域樣式
├── components/                   # React 組件
│   ├── avatar/                  # 3D Avatar 組件
│   ├── chat/                    # 對話介面組件
│   └── ui/                      # 通用 UI 組件
├── lib/                          # 工具函式與配置
│   ├── azure/                   # Azure SDK 配置
│   ├── three/                   # Three.js 工具
│   └── utils/                   # 通用工具
├── store/                        # Zustand 狀態管理
├── types/                        # TypeScript 型別定義
├── public/                       # 靜態檔案
├── docs/                         # 專案文件
├── .env.local                   # 環境變數 (本地，不提交)
├── .env.local.example           # 環境變數範例
├── next.config.js               # Next.js 配置
├── tailwind.config.ts           # Tailwind CSS 配置
├── tsconfig.json                # TypeScript 配置
└── package.json                 # 依賴管理
```

## 🛠️ 可用指令

```bash
# 啟動開發伺服器 (http://localhost:3000)
npm run dev

# 建置生產版本
npm run build

# 執行生產版本
npm start

# 執行 ESLint 檢查
npm run lint

# 執行 Prettier 格式化
npm run format
```

## 📚 專案文件

### 使用者文件
- **[使用者指南](docs/USER_GUIDE.md)** - 完整操作手冊與常見問題
- **[瀏覽器相容性報告](docs/BROWSER_COMPATIBILITY.md)** - 支援的瀏覽器與效能評估

### 技術文件
- **[POC 技術驗證報告](docs/POC_TECHNICAL_REPORT.md)** - 技術可行性驗證與成果總結
- **[Azure 部署指南](docs/AZURE_DEPLOYMENT.md)** - 完整的生產部署流程
- **[生產檢查清單](docs/PRODUCTION_CHECKLIST.md)** - 部署前後檢查項目

### 開發文件
- **[快速開始指南](QUICK_START.md)** - 5 分鐘快速上手
- **[開發路線圖](DEVELOPMENT_ROADMAP.md)** - 12 週完整開發計畫
- **[專案總覽](PROJECT_OVERVIEW.md)** - 架構與技術細節
- **[Sprint 規劃](docs/sprint-planning.md)** - Sprint 執行計畫
- **[Stories](docs/stories/)** - 詳細需求文件

## 🎯 開發狀態

### 🎉 POC 階段完成 (100%)
- ✅ Epic 1: 專案基礎建設 (Stories 1.1-1.5) - 100%
- ✅ Epic 2: 3D Avatar 視覺化 (Stories 2.1-2.5) - 100%
- ✅ Epic 3: LLM 對話與 TTS 整合 (Stories 3.1-3.7) - 100%
- ✅ Epic 4: Lip Sync 嘴型同步 (Stories 4.1-4.5) - 100%
- ✅ Epic 5: 效能優化與部署 (Stories 5.1-5.7) - 100%

**總計**: 29/29 Stories 完成，提前 83 天完成 POC！

**效能成果**:
- 3D 渲染: 60 FPS（目標 ≥30 fps，達成率 200%）
- Lip Sync 延遲: ~20ms（目標 <50ms，達成率 250%）
- 首次載入時間: ~2秒（目標 <5秒，達成率 250%）
- 成本節省: 97.1%（NT$200 vs NT$7,000 預算）

### 📋 MVP 階段準備中
- ⏳ POC 驗證測試完成
- ⏳ MVP 開發計劃已制定（3 個月、12 Sprint、93 Story Points）
- ⏳ 準備啟動 Sprint 1（使用者認證系統）

詳細進度請參考：
- [POC 技術驗證報告](docs/POC_TECHNICAL_REPORT.md)
- [POC 測試報告](docs/POC_TEST_REPORT.md)
- [MVP 開發計劃](docs/MVP_DEVELOPMENT_PLAN.md)
- [MVP 進度追蹤](docs/MVP_PROGRESS.md)

## 🧪 測試

```bash
# 執行所有測試
npm test

# 執行測試 (Watch 模式)
npm test -- --watch

# 測試覆蓋率
npm test -- --coverage
```

## 🚀 部署

### 生產環境

- **平台**: Azure Static Web Apps
- **部署方式**: GitHub Actions 自動部署
- **URL**: 部署後自動生成（例如：`https://<app-name>.azurestaticapps.net`）

### 部署流程

本專案採用 **GitHub Actions CI/CD** 自動化部署流程：

1. **推送程式碼至 `main` 分支**
   ```bash
   git push origin main
   ```

2. **GitHub Actions 自動觸發** 並執行：
   - ✅ ESLint 程式碼檢查
   - ✅ TypeScript 型別檢查
   - ✅ Next.js 專案建置
   - ✅ 部署至 Azure Static Web Apps

3. **約 5-10 分鐘完成部署**

### 環境變數設定

部署前需要在以下位置設定環境變數：

#### 1. GitHub Secrets（CI/CD 使用）
在 GitHub Repository 設定以下 Secrets：
- Settings → Secrets and variables → Actions → New repository secret

必要 Secrets：
- `AZURE_STATIC_WEB_APPS_API_TOKEN` - Azure Static Web Apps 部署 Token
- `AZURE_OPENAI_API_KEY` - Azure OpenAI API 金鑰
- `AZURE_OPENAI_ENDPOINT` - Azure OpenAI 端點 URL
- `AZURE_OPENAI_DEPLOYMENT` - Azure OpenAI 部署名稱
- `AZURE_SPEECH_KEY` - Azure Speech Services API 金鑰
- `AZURE_SPEECH_REGION` - Azure Speech Services 區域

#### 2. Azure Static Web Apps 配置（生產環境使用）
在 Azure Portal 設定環境變數：
- Azure Portal → Static Web Apps → Configuration → Application settings

必要環境變數：
```
AZURE_OPENAI_API_KEY=<your_key>
AZURE_OPENAI_ENDPOINT=https://<your-resource>.openai.azure.com/
AZURE_OPENAI_DEPLOYMENT=gpt-4-turbo
AZURE_SPEECH_KEY=<your_speech_key>
AZURE_SPEECH_REGION=eastasia
NODE_ENV=production
```

### 手動部署（緊急情況）

如需手動部署，可使用 Azure Static Web Apps CLI：

```bash
# 安裝 Azure Static Web Apps CLI
npm install -g @azure/static-web-apps-cli

# 建置專案
npm run build

# 部署（需要部署 Token）
swa deploy --app-location . --output-location .next --deployment-token <token>
```

### 詳細部署指南

完整的部署設定與疑難排解，請參考：
- **部署指南**: [docs/deployment-guide.md](docs/deployment-guide.md)
- **Story 1.5**: [docs/stories/1.5.cicd-azure-deployment.md](docs/stories/1.5.cicd-azure-deployment.md)

## 🤝 貢獻指南

歡迎貢獻！請遵循以下步驟：

1. Fork 本專案
2. 建立功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交變更 (`git commit -m 'Add some AmazingFeature'`)
4. 推送至分支 (`git push origin feature/AmazingFeature`)
5. 開啟 Pull Request

## 📝 授權

本專案採用 ISC 授權 - 詳見 [LICENSE](LICENSE) 檔案

## 🆘 支援與問題

- **GitHub Issues**: [提交 Issue](https://github.com/laitim2001/smart-ai-avatar-agent/issues)
- **文件**: 參考 `docs/` 目錄下的詳細文檔
- **快速疑難排解**: 參見 [QUICK_START.md](QUICK_START.md) 常見問題章節

## 🙏 致謝

本專案使用以下優秀的開源專案：

- [Next.js](https://nextjs.org/) - React 框架
- [Three.js](https://threejs.org/) - 3D 渲染引擎
- [React Three Fiber](https://docs.pmnd.rs/react-three-fiber) - React Three.js 整合
- [Tailwind CSS](https://tailwindcss.com/) - CSS 框架
- [Zustand](https://docs.pmnd.rs/zustand) - 狀態管理
- [Azure OpenAI](https://azure.microsoft.com/services/cognitive-services/openai-service/) - AI 對話服務
- [Azure Speech Services](https://azure.microsoft.com/services/cognitive-services/speech-services/) - 語音服務

---

**專案版本**: v1.0.0
**最後更新**: 2025-10-15
**維護團隊**: Dev Team
