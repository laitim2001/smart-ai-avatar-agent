# 快速開始指南 (Quick Start Guide)

**5 分鐘快速啟動 3D Avatar 即時對話系統**

---

## ⚡ 快速啟動 (3 步驟)

### Step 1: 克隆專案

```bash
cd C:\smart-ai-avatar-agent
```

### Step 2: 安裝依賴

```bash
npm install
```

### Step 3: 啟動開發服務器

```bash
npm run dev
```

開啟瀏覽器訪問 `http://localhost:3000` ✅

---

## 📋 前置需求

### 必要環境

| 工具 | 版本 | 安裝方式 | 驗證指令 |
|------|------|----------|----------|
| **Node.js** | 18+ | [下載](https://nodejs.org/) | `node --version` |
| **npm** | 9+ | (隨 Node.js 安裝) | `npm --version` |
| **Git** | 最新版 | [下載](https://git-scm.com/) | `git --version` |

### 雲端服務 (開發階段需要)

| 服務 | 用途 | 註冊連結 |
|------|------|----------|
| **Azure OpenAI** | LLM 對話 (GPT-4 Turbo) | [Azure Portal](https://portal.azure.com/) |
| **Azure Speech** | TTS 語音合成 | [Azure Portal](https://portal.azure.com/) |

---

## 🚀 完整安裝步驟

### 1. 專案初始化

#### 選項 A: 使用現有專案 (如果已有)

```bash
cd C:\smart-ai-avatar-agent
npm install
```

#### 選項 B: 從零開始建立 (如果還沒建立專案)

```bash
# 建立 Next.js 專案
npx create-next-app@latest smart-ai-avatar-agent --typescript --app --tailwind

# 進入專案目錄
cd smart-ai-avatar-agent

# 安裝核心依賴
npm install three @react-three/fiber @react-three/drei
npm install zustand
npm install @azure/openai microsoft-cognitiveservices-speech-sdk
```

---

### 2. 環境變數配置

#### 建立 `.env.local` 檔案

```bash
# 複製範例檔案
cp .env.local.example .env.local
```

#### 編輯 `.env.local`

```bash
# Azure OpenAI 配置
AZURE_OPENAI_API_KEY=your_openai_api_key_here
AZURE_OPENAI_ENDPOINT=https://your-resource-name.openai.azure.com/
AZURE_OPENAI_DEPLOYMENT=gpt-4-turbo

# Azure Speech 配置
AZURE_SPEECH_KEY=your_speech_api_key_here
AZURE_SPEECH_REGION=eastasia

# Next.js 配置
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

#### 🔑 如何取得 API Keys?

**Azure OpenAI**:
1. 前往 [Azure Portal](https://portal.azure.com/)
2. 建立 "Azure OpenAI" 資源 (選擇 East US 區域)
3. 部署 GPT-4 Turbo 模型
4. 複製 API Key 和 Endpoint

**Azure Speech**:
1. 前往 [Azure Portal](https://portal.azure.com/)
2. 建立 "Cognitive Services Speech" 資源 (選擇 East Asia 區域)
3. 複製 API Key 和 Region

---

### 3. 啟動開發服務器

```bash
npm run dev
```

✅ 成功！開啟瀏覽器訪問 `http://localhost:3000`

---

## 🛠️ 開發工具配置

### VS Code 推薦擴充

建立 `.vscode/extensions.json`:

```json
{
  "recommendations": [
    "dbaeumer.vscode-eslint",
    "esbenp.prettier-vscode",
    "bradlc.vscode-tailwindcss",
    "ms-vscode.vscode-typescript-next"
  ]
}
```

### ESLint + Prettier 配置

專案已預設配置，執行檢查：

```bash
# 檢查程式碼風格
npm run lint

# 自動修復
npm run lint -- --fix
```

---

## 📦 專案結構

```
smart-ai-avatar-agent/
├── app/                          # Next.js App Router
│   ├── api/                      # API Routes
│   │   ├── chat/route.ts        # LLM 對話 API (SSE)
│   │   ├── tts/route.ts         # TTS 語音合成 API
│   │   └── health/route.ts      # 健康檢查 API
│   ├── layout.tsx               # 全域佈局
│   └── page.tsx                 # 首頁
├── components/                   # React 組件
│   ├── avatar/                  # 3D Avatar 組件
│   │   ├── AvatarCanvas.tsx    # Three.js 場景
│   │   ├── AvatarModel.tsx     # Avatar 模型
│   │   └── LipSyncController.tsx # Lip Sync 控制器
│   ├── chat/                    # 對話介面組件
│   │   ├── ChatInterface.tsx   # 對話介面
│   │   └── MessageBubble.tsx   # 訊息氣泡
│   └── ui/                      # 通用 UI 組件
│       ├── Button.tsx           # 按鈕
│       └── Input.tsx            # 輸入框
├── lib/                          # 工具函式與配置
│   ├── azure/                   # Azure SDK 配置
│   │   ├── openai.ts           # OpenAI 客戶端
│   │   └── speech.ts           # Speech 客戶端
│   ├── three/                   # Three.js 工具
│   │   ├── avatar-loader.ts    # Avatar 載入器
│   │   ├── animator.ts         # 動畫控制器
│   │   └── lipsync.ts          # Lip Sync 分析
│   └── utils/                   # 通用工具
│       ├── error-handler.ts    # 錯誤處理
│       └── audio.ts            # 音訊處理
├── store/                        # Zustand 狀態管理
│   ├── chatStore.ts             # 對話狀態
│   ├── audioStore.ts            # 音訊狀態
│   └── avatarStore.ts           # Avatar 狀態
├── types/                        # TypeScript 型別定義
│   ├── chat.ts                  # 對話型別
│   ├── audio.ts                 # 音訊型別
│   └── api.ts                   # API 型別
├── public/                       # 靜態檔案
├── docs/                         # 專案文件
├── .env.local                   # 環境變數 (本地，不提交)
├── .env.local.example           # 環境變數範例
├── next.config.js               # Next.js 配置
├── tailwind.config.ts           # Tailwind CSS 配置
├── tsconfig.json                # TypeScript 配置
├── package.json                 # 依賴管理
└── README.md                    # 專案說明
```

---

## 🧪 測試指令

```bash
# 執行所有測試
npm test

# 執行測試 (Watch 模式)
npm test -- --watch

# 測試覆蓋率
npm test -- --coverage

# E2E 測試 (Playwright)
npm run test:e2e
```

---

## 🏗️ 建置與部署

### 本地建置

```bash
# 建置生產版本
npm run build

# 執行生產版本
npm start
```

### 部署至 Azure Static Web Apps

```bash
# 方式 1: GitHub Actions (推薦)
git add .
git commit -m "Deploy to Azure"
git push origin main
# GitHub Actions 會自動觸發部署

# 方式 2: Azure CLI
az staticwebapp create \
  --name smart-ai-avatar-agent \
  --resource-group your-resource-group \
  --source ./out \
  --location "East Asia"
```

---

## 🐛 常見問題 (Troubleshooting)

### 問題 1: `npm install` 失敗

**症狀**: 安裝依賴時出現錯誤

**解決方案**:
```bash
# 清除 npm 快取
npm cache clean --force

# 刪除 node_modules 和 package-lock.json
rm -rf node_modules package-lock.json

# 重新安裝
npm install
```

---

### 問題 2: Azure API 連線失敗

**症狀**: API 呼叫返回 401 Unauthorized

**解決方案**:
1. 檢查 `.env.local` 中的 API Key 是否正確
2. 確認 Azure 服務已成功部署
3. 檢查 Endpoint URL 格式 (需包含 `https://`)
4. 驗證 API Key 權限

```bash
# 測試 Azure OpenAI 連線
curl -X POST "https://your-resource.openai.azure.com/openai/deployments/gpt-4-turbo/chat/completions?api-version=2023-05-15" \
  -H "Content-Type: application/json" \
  -H "api-key: YOUR_API_KEY" \
  -d '{"messages":[{"role":"user","content":"Hello"}]}'
```

---

### 問題 3: 3D Avatar 無法顯示

**症狀**: 頁面顯示空白或黑畫面

**解決方案**:
1. **檢查瀏覽器 WebGL 支援**:
   - 訪問 https://get.webgl.org/
   - 確認顯示 "WebGL is working"

2. **檢查 Console 錯誤**:
   - 打開 Chrome DevTools (F12)
   - 查看 Console 是否有 Three.js 錯誤

3. **檢查 Avatar 模型 URL**:
   - 確認 Ready Player Me URL 可正常訪問
   - 嘗試使用備用 Avatar URL

4. **降低 3D 品質**:
   ```typescript
   // 在 AvatarCanvas.tsx 中
   <Canvas gl={{ antialias: false, pixelRatio: 1 }}>
   ```

---

### 問題 4: 音訊無法播放 (Safari)

**症狀**: Safari 瀏覽器中音訊靜音

**解決方案**:
Safari 需要使用者手勢才能啟動 AudioContext

```typescript
// 在 useAudioContext Hook 中
const resumeAudioContext = async () => {
  if (audioContext.state === 'suspended') {
    await audioContext.resume();
  }
};

// 在首次播放前呼叫
<button onClick={resumeAudioContext}>Enable Audio</button>
```

---

### 問題 5: 部署後環境變數失效

**症狀**: 部署至 Azure 後 API 呼叫失敗

**解決方案**:
1. 前往 Azure Portal
2. 找到 Static Web Apps 資源
3. 進入 "Configuration" → "Application settings"
4. 新增環境變數:
   - `AZURE_OPENAI_API_KEY`
   - `AZURE_OPENAI_ENDPOINT`
   - `AZURE_SPEECH_KEY`
   - `AZURE_SPEECH_REGION`
5. 重新部署應用程式

---

## 📚 更多資源

### 官方文件

- **Next.js**: https://nextjs.org/docs
- **Three.js**: https://threejs.org/docs/
- **React Three Fiber**: https://docs.pmnd.rs/react-three-fiber
- **Azure OpenAI**: https://learn.microsoft.com/azure/ai-services/openai/
- **Azure Speech**: https://learn.microsoft.com/azure/ai-services/speech-service/
- **Tailwind CSS**: https://tailwindcss.com/docs
- **Zustand**: https://docs.pmnd.rs/zustand

### 學習資源

- **Three.js 教學**: https://threejs-journey.com/
- **Next.js 教學**: https://nextjs.org/learn
- **TypeScript 教學**: https://www.typescriptlang.org/docs/

### 相關專案文檔

| 文檔 | 路徑 | 用途 |
|------|------|------|
| **PRD** | `docs/prd.md` | 產品需求文件 |
| **Architecture** | `docs/architecture.md` | 系統架構文件 |
| **Sprint Planning** | `docs/sprint-planning.md` | Sprint 計劃 |
| **Development Roadmap** | `DEVELOPMENT_ROADMAP.md` | 開發路線圖 |
| **Project Overview** | `PROJECT_OVERVIEW.md` | 專案總覽 |

---

## 🆘 需要幫助？

### 檢查清單

在尋求幫助前，請先檢查：

- [ ] Node.js 版本 ≥ 18
- [ ] 所有依賴已安裝 (`npm install` 無錯誤)
- [ ] `.env.local` 檔案已建立且 API Keys 正確
- [ ] Azure 服務已成功部署
- [ ] 瀏覽器支援 WebGL 2.0
- [ ] 瀏覽器 Console 無錯誤訊息

### 聯絡方式

- **GitHub Issues**: [提交 Issue](https://github.com/your-org/smart-ai-avatar-agent/issues)
- **技術文件**: 參考 `docs/` 目錄下的詳細文檔

---

## 🎉 成功啟動！

如果您看到 3D Avatar 在瀏覽器中顯示，恭喜您已成功啟動專案！

**下一步**:
1. 📖 閱讀 [DEVELOPMENT_ROADMAP.md](DEVELOPMENT_ROADMAP.md) 了解開發計畫
2. 📋 查看 [docs/sprint-planning.md](docs/sprint-planning.md) 了解 Sprint 規劃
3. 🚀 開始開發第一個 Story (Story 1.1: Next.js 專案初始化)

---

**文件版本**: v1.0
**最後更新**: 2025-10-15
**負責人**: Dev Team
