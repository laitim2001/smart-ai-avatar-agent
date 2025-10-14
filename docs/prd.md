# 3D Avatar 即時對話系統 Product Requirements Document (PRD)

**專案名稱**: 3D Avatar 即時對話系統  
**文件版本**: v1.0  
**建立日期**: 2025-10-14  
**負責人**: Product Manager (John)  
**專案類型**: Greenfield Full-Stack Web Application

---

## Goals and Background Context

### Goals

- ✅ **技術驗證**: 在 4 週內完成 POC，驗證 3D Avatar + LLM + TTS + Lip Sync 核心技術整合可行性
- ✅ **成本控制**: 確保 POC 階段 Azure 成本 < NT$7,000/3個月，MVP 階段可持續運營（單位成本 < NT$5/對話）
- ✅ **使用者體驗**: 提供「真人般」的視覺互動體驗，對話延遲 < 2.5 秒，Lip Sync 匹配度 ≥ 70%
- ✅ **快速上市**: MVP 3 個月內上線，獲得首批 10 個付費使用者驗證商業模式
- ✅ **差異化定位**: 建立「成本效益最佳 + 繁中支援」的 AI Avatar 互動平台，區隔於 ANAM.ai 等高價競品

### Background Context

當前 AI 互動系統存在明顯斷層：傳統文字聊天機器人缺乏人性化，使用者難以建立信任感；現有語音助理（Siri、Alexa）僅有聲音無視覺形象；而 ANAM.ai、D-ID 等 3D Avatar 解決方案定價昂貴（月費 $50-200），且主要服務企業級市場。市場上缺少一個「易用、平價、支援繁中」的 AI Avatar 互動平台，能讓中小企業與內容創作者輕鬆建立虛擬代言人或 AI 助手。

基於 Phase 1 深度技術研究，我們已驗證核心技術可行性：Next.js + Three.js + Azure OpenAI + Azure Speech 的技術組合成熟穩定，成本可控（POC: NT$4,492/月）。本 PRD 定義 MVP 範圍，專注於 5 大核心功能的技術驗證，排除所有產品化功能（用戶系統、角色庫），確保在 4 週內完成可運行原型，為商業決策提供充分依據。

### Change Log

| Date | Version | Description | Author |
|------|---------|-------------|--------|
| 2025-10-14 | v1.0 | 初始 PRD 建立，定義 MVP 範圍與 5 大核心功能 | John (PM) |

---

## Requirements

### Functional

**FR1: 3D Avatar 即時渲染與顯示**
- 系統必須在使用者瀏覽器中載入並渲染 3D Avatar 模型（使用 Ready Player Me）
- 支援至少 3 個預設 Avatar 選項（男性、女性、中性各一）
- 渲染效能達到 30 FPS 以上（桌機環境）
- 使用 Three.js + React Three Fiber 技術棧

**FR2: Avatar 基礎動畫系統**
- Avatar 必須包含待機動畫：呼吸（胸部微動）、眨眼（每 3-5 秒）、隨機微笑
- 支援基本頭部動作：點頭、搖頭（可手動觸發或隨機）
- 所有動畫必須流暢無卡頓

**FR3: LLM 即時對話整合（文字輸入）**
- 使用者可透過文字輸入框與 Avatar 對話
- 整合 Azure OpenAI Service（GPT-4 Turbo）處理對話
- 支援多輪對話，保留對話上下文（至少 10 輪）
- 使用 Server-Sent Events (SSE) 實現串流回應，即時顯示 LLM 回應文字
- 對話延遲（使用者送出到 LLM 首字回應）< 2 秒

**FR4: 文字轉語音（TTS）播放**
- LLM 回應文字自動轉換為語音（使用 Azure Speech Services）
- 使用繁體中文 Neural Voice（建議：zh-TW-HsiaoChenNeural 女聲）
- 音訊格式：MP3，透過 Web Audio API 播放
- 支援播放控制：自動播放、暫停、繼續
- TTS 延遲（文字到音訊播放）< 1.5 秒

**FR5: Lip Sync 嘴型同步**
- 系統必須分析 TTS 音訊，產生 viseme（視覺音素）數據
- POC 階段：使用 Web Audio API 音頻分析 + 簡化音素映射（目標 70% 匹配度）
- Viseme 數據驅動 Avatar 的嘴型 blendshapes（至少支援：aa, E, I, O, U, neutral）
- 嘴型動作與音訊同步，視覺延遲 < 100ms
- 播放完畢後嘴型恢復 neutral 狀態

**FR6: 對話介面（UI）**
- 提供簡易的對話介面，包含：
  - 文字輸入框（支援 Enter 送出）
  - 送出按鈕（含 Loading 狀態）
  - 對話歷史顯示區（顯示最近 5 則訊息，區分使用者/Avatar）
  - 清除對話按鈕（重置上下文）
- UI 設計簡潔專業，使用 Tailwind CSS

**FR7: Avatar 選擇功能**
- 使用者可在對話開始前選擇 Avatar（3 個預設選項）
- 提供 Avatar 預覽圖
- 選擇後載入對應 3D 模型

**FR8: 錯誤處理與使用者反饋**
- 當 Azure 服務失敗時，顯示友善錯誤訊息（如：「Avatar 正在思考中，請稍候...」）
- 網路連線中斷時，提示使用者檢查網路
- API 超時（> 10 秒）自動重試一次，失敗後提示使用者

**FR9: 語音輸入（STT）- 選做功能**
- 如時間允許，提供語音輸入按鈕
- 使用 Web Speech API 或 Azure Speech STT
- 支援繁體中文語音辨識
- 辨識結果自動填入文字輸入框

### Non Functional

**NFR1: 效能要求**
- 3D 渲染 FPS ≥ 30（桌機環境，Chrome/Edge）
- 首次頁面載入時間 < 5 秒
- 端到端對話延遲（輸入到語音播放）< 2.5 秒
- 記憶體使用 < 500 MB

**NFR2: 瀏覽器相容性**
- 必須支援：Chrome 90+, Edge 90+, Safari 14+
- 不支援 Internet Explorer
- 需支援 WebGL 2.0（3D 渲染）
- 需支援 Web Audio API

**NFR3: 成本控制**
- POC 階段（3 個月）Azure 總成本 < NT$7,000
- 單次對話成本（LLM + TTS）< NT$5
- 使用 Azure 免費層與優化策略（如：縮短 prompt、快取常見回應）

**NFR4: 可擴展性（未來考量）**
- 架構設計需考慮未來從 Monolith 拆分為 Microservices 的可能性
- 前後端耦合度低，方便未來分離部署

**NFR5: 安全性（基本要求）**
- 所有 API 呼叫必須透過 HTTPS
- Azure API Key 透過環境變數管理，不得寫入程式碼
- POC 階段無需用戶認證（公開存取）

**NFR6: 可維護性**
- 程式碼使用 TypeScript，強型別檢查
- 遵循 ESLint + Prettier 規範
- 關鍵函式需包含 JSDoc 註解

**NFR7: 部署要求**
- 必須可部署至 Azure Static Web Apps
- 支援 CI/CD（GitHub Actions）
- 環境變數透過 Azure Portal 配置

---

## User Interface Design Goals

### Overall UX Vision

打造「如同真人視訊通話」般的沉浸式對話體驗。使用者進入頁面後，立即看到一個逼真的 3D Avatar 佔據畫面主要區域（類似 Zoom 視訊通話畫面），Avatar 會自然地呼吸、眨眼，營造「活生生的人」的感覺。對話介面簡潔低調，不搶 Avatar 風采，讓使用者專注於與 Avatar 的互動。整體風格專業、現代、科技感，但不冰冷，傳達「智能且友善」的品牌形象。

### Key Interaction Paradigms

1. **視覺優先**: Avatar 是畫面焦點，佔據 70% 螢幕空間
2. **極簡輸入**: 對話輸入框固定在底部，類似訊息 App
3. **即時反饋**: 
   - 使用者輸入時，Avatar 顯示「聆聽」狀態（微微點頭）
   - LLM 思考時，顯示 Loading 動畫（Avatar 眼睛往上看，若思考狀）
   - 語音播放時，嘴型精準同步
4. **無縫流程**: 
   - 無需複雜設定，進入即用
   - Avatar 選擇 → 直接對話，3 步內完成

### Core Screens and Views

1. **Avatar 選擇畫面（起始頁）**
   - 顯示 3 個 Avatar 預覽卡片（男/女/中性）
   - 點擊卡片選擇，淡入進入對話頁

2. **主對話頁面（核心）**
   - 上方：3D Avatar 渲染區（70% 高度）
   - 下方：對話介面區（30% 高度）
     - 對話歷史（最近 5 則，可滾動）
     - 文字輸入框 + 送出按鈕
     - 清除對話按鈕（右上角）

3. **錯誤/載入狀態頁**
   - Avatar 載入中：顯示 Skeleton 或 Loading 動畫
   - 錯誤發生：顯示友善錯誤訊息 + 重試按鈕

### Accessibility

**None** - POC 階段不實作無障礙功能（優先驗證核心技術）

_備註_: MVP 階段建議達到 WCAG AA 基本標準（鍵盤導航、色彩對比）

### Branding

- **色彩風格**: 
  - 主色：深藍/科技藍（#1E3A8A）傳達專業與科技感
  - 輔色：白色（#FFFFFF）、淡灰（#F3F4F6）保持簡潔
  - 強調色：青色（#06B6D4）用於互動元素
- **字體**: 
  - 繁中：Noto Sans TC（Google Fonts）
  - 英數：Inter（現代感）
- **視覺風格**: 
  - 圓角設計（border-radius: 12px）柔化科技感
  - 微陰影（shadow-lg）增加層次
  - 漸層背景（Avatar 區域）增加視覺豐富度

### Target Device and Platforms

**Web Responsive（優先桌機版）**

- **主要支援**: 桌機/筆電（1920x1080, 1366x768）
- **次要支援**: 平板（iPad, 1024x768）
- **不支援**: 手機（3D 渲染效能考量，未來版本加入）

_理由_: POC 專注於技術驗證，桌機版效能最佳且易於開發測試

---

## Technical Assumptions

### Repository Structure

**Monorepo**

使用單一 Git repository 管理整個專案，前後端程式碼共存。

_理由_:
- POC/MVP 規模小，Monorepo 簡化開發與部署
- Next.js 原生支援前後端一體（App Router + API Routes）
- 易於程式碼共享（Types, Utils）
- 未來可使用 Turborepo 或 Nx 拆分（如需要）

### Service Architecture

**Monolith（單體架構）**

- **Frontend**: Next.js 14（App Router）
- **Backend**: Next.js API Routes（Serverless Functions）
- **部署**: Azure Static Web Apps（前後端一起部署）

_理由_:
- POC 階段避免過度設計，Monolith 最快速
- Azure Static Web Apps 原生支援 Next.js
- 減少服務間通訊複雜度與延遲
- 未來可依需求拆分（Frontend + API Service）

**技術細節**:
- **Frontend 技術棧**:
  - Next.js 14.2+（App Router, TypeScript）
  - React 18+
  - Three.js + React Three Fiber（3D 渲染）
  - Zustand（狀態管理，輕量級）
  - Tailwind CSS（UI 樣式）
  
- **Backend 技術棧**:
  - Next.js API Routes（Serverless）
  - Azure OpenAI SDK (`@azure/openai`)
  - Azure Speech SDK (`microsoft-cognitiveservices-speech-sdk`)
  - Server-Sent Events (SSE) 用於 LLM 串流

- **3D & Audio**:
  - Three.js r160+
  - React Three Fiber v8+
  - @react-three/drei（Three.js 輔助工具）
  - Web Audio API（音訊處理）
  - Ready Player Me SDK（Avatar 載入）

- **雲端服務**:
  - Azure OpenAI Service（GPT-4 Turbo，東美區）
  - Azure Cognitive Services Speech（TTS/STT，東亞區）
  - Azure Static Web Apps（託管）

### Testing Requirements

**Unit + Integration（基本測試）**

- **Unit Testing**: 
  - 工具：Vitest（比 Jest 更快）
  - 範圍：核心 Utils、API 邏輯函式
  - 目標：關鍵函式覆蓋率 > 60%

- **Integration Testing**:
  - 工具：Playwright（E2E）
  - 範圍：核心對話流程（輸入 → LLM → TTS → Lip Sync）
  - 目標：主流程無錯誤

- **Manual Testing**:
  - POC 階段主要依賴手動測試
  - 測試清單：瀏覽器相容性、效能、視覺檢查

_不做_: 
- ❌ 完整 E2E 自動化（POC 階段不必要）
- ❌ 視覺回歸測試（無設計稿）

### Additional Technical Assumptions and Requests

1. **開發環境**:
   - Node.js 18+（LTS）
   - pnpm（套件管理，比 npm 更快）
   - VS Code + ESLint + Prettier 擴充

2. **版本控制**:
   - Git + GitHub
   - 主分支：`main`（保護分支）
   - 功能分支：`feature/*`
   - Commit 規範：Conventional Commits

3. **CI/CD**:
   - GitHub Actions 自動部署到 Azure Static Web Apps
   - PR 自動觸發：Lint + Build 檢查
   - Main 分支合併自動部署

4. **環境變數**:
   - `.env.local`（本地開發）
   - Azure Portal（生產環境）
   - 必要變數：
     - `AZURE_OPENAI_API_KEY`
     - `AZURE_OPENAI_ENDPOINT`
     - `AZURE_SPEECH_KEY`
     - `AZURE_SPEECH_REGION`

5. **效能優化**:
   - 3D 模型使用 GLTF/GLB 壓縮格式
   - 音訊使用 MP3（16kbps，語音品質足夠）
   - 圖片使用 Next.js Image 優化
   - 程式碼分割（Dynamic Import）

6. **Lip Sync 技術決策**:
   - **POC 階段**: Web Audio API 音頻分析 + 簡化 viseme 映射
   - **進階方案**（如時間允許）: Rhubarb Lip Sync CLI 或 Azure Speech Viseme Output
   - 目標準確度：70%（POC）→ 85%+（MVP）

7. **資料儲存**:
   - POC 階段：無後端資料庫（無需儲存對話記錄）
   - 對話上下文：前端 Zustand store（Session Storage 備份）
   - MVP 階段：加入 Azure Cosmos DB（儲存用戶角色與歷史）

8. **API 設計**:
   - `/api/chat` (POST): 處理 LLM 對話（SSE 串流）
   - `/api/tts` (POST): 文字轉語音（返回音訊檔）
   - `/api/stt` (POST): 語音辨識（選做）

9. **錯誤處理策略**:
   - API 失敗自動重試 1 次（500 錯誤）
   - 超時設定：LLM 10s, TTS 5s
   - 降級方案：Lip Sync 失敗時僅播放語音（無嘴型）

10. **監控與日誌**:
    - POC 階段：Console.log + Chrome DevTools
    - 生產環境：Azure Application Insights（基本監控）

---

## Epic List

**Epic 1: Foundation & Core Infrastructure**  
建立 Next.js 專案基礎架構，配置 Azure 服務，完成開發環境設定，並實現首個健康檢查 API，確保專案可本地執行與部署。

**Epic 2: 3D Avatar Rendering & Animation**  
實現 3D Avatar 在瀏覽器中的載入、渲染與基礎動畫（待機、呼吸、眨眼），並提供 Avatar 選擇功能，確保視覺呈現達標。

**Epic 3: LLM Conversation & TTS Integration**  
整合 Azure OpenAI 實現即時對話功能（文字輸入 → LLM → 文字回應），並串接 Azure Speech TTS 實現語音播放，完成核心對話流程。

**Epic 4: Lip Sync & Audio-Visual Synchronization**  
實現 Lip Sync 嘴型同步功能，分析 TTS 音訊產生 viseme 數據，驅動 Avatar 嘴型動畫，達成視聽同步的沉浸式體驗。

**Epic 5: Polish, Testing & Deployment**  
優化效能、錯誤處理、UI/UX 細節，完成瀏覽器相容性測試，部署至 Azure Static Web Apps，並撰寫技術驗證報告。

---

## Epic 1: Foundation & Core Infrastructure

**Epic Goal**: 建立堅實的專案基礎，包含 Next.js 14 專案初始化、TypeScript 配置、開發工具鏈設定（ESLint, Prettier）、Azure 服務註冊與 SDK 整合、環境變數配置、基本 CI/CD 流程，並實現首個 API 端點（健康檢查），確保專案可本地執行並成功部署至 Azure Static Web Apps。

### Story 1.1: Next.js 專案初始化與開發環境設定

**As a** 開發者,  
**I want** 建立一個配置完善的 Next.js 14 專案（App Router + TypeScript），  
**so that** 我可以在穩定的開發環境中開始功能開發。

**Acceptance Criteria**:

1. 使用 `create-next-app@latest` 建立 Next.js 14 專案，啟用 TypeScript、App Router、Tailwind CSS
2. 專案結構符合 BMad 最佳實踐：`app/`, `components/`, `lib/`, `types/`, `public/` 目錄已建立
3. 安裝並配置 ESLint + Prettier，執行 `npm run lint` 無錯誤
4. 配置 `tsconfig.json`，啟用嚴格模式（`strict: true`）
5. 建立 `.env.local.example` 示範環境變數檔案
6. 建立 `README.md` 包含專案說明、安裝步驟、執行指令
7. 執行 `npm run dev`，專案在 `http://localhost:3000` 正常啟動
8. Git 初始化，首次 commit 完成

### Story 1.2: Azure 服務註冊與 SDK 整合

**As a** 開發者,  
**I want** 註冊並配置 Azure OpenAI 與 Azure Speech Services，並整合相關 SDK，  
**so that** 後續可以直接呼叫 LLM 與 TTS 功能。

**Acceptance Criteria**:

1. 在 Azure Portal 建立 Azure OpenAI 資源（東美區，GPT-4 Turbo 部署）
2. 在 Azure Portal 建立 Azure Cognitive Services Speech 資源（東亞區）
3. 安裝 Azure SDK: `npm install @azure/openai microsoft-cognitiveservices-speech-sdk`
4. 在 `lib/azure/openai.ts` 建立 Azure OpenAI 客戶端初始化函式，使用環境變數
5. 在 `lib/azure/speech.ts` 建立 Azure Speech 客戶端初始化函式
6. 在 `.env.local` 配置所有必要環境變數（API Key, Endpoint, Region）
7. 建立簡單的測試腳本，驗證 Azure 服務連線正常（console.log 成功訊息）

### Story 1.3: 基礎 UI 框架與全域樣式設定

**As a** 開發者,  
**I want** 建立專案的 UI 基礎框架與全域樣式，  
**so that** 後續頁面開發有一致的視覺風格與佈局基礎。

**Acceptance Criteria**:

1. 在 `app/layout.tsx` 設定全域佈局，包含 `<html>`, `<body>` 基本結構
2. 在 `app/globals.css` 配置 Tailwind CSS，設定專案主題色彩（深藍、白色、青色）
3. 自訂 Tailwind 配置（`tailwind.config.ts`），加入專案色彩變數
4. 建立 `components/ui/Button.tsx` 通用按鈕組件（含 Loading 狀態）
5. 建立 `components/ui/Input.tsx` 通用輸入框組件
6. 在 `app/page.tsx` 建立暫時首頁，顯示「3D Avatar 對話系統 - 開發中」與專案 Logo
7. 頁面在瀏覽器中正常顯示，樣式符合設計規範（深藍背景、白色文字）

### Story 1.4: 健康檢查 API 與基本錯誤處理

**As a** 開發者,  
**I want** 建立首個 API 端點（健康檢查）並實作基本錯誤處理機制，  
**so that** 可以驗證 API Routes 正常運作並為後續 API 建立基礎。

**Acceptance Criteria**:

1. 在 `app/api/health/route.ts` 建立健康檢查 API
2. GET `/api/health` 返回 JSON: `{ status: "ok", timestamp: <ISO時間>, version: "1.0.0" }`
3. 建立 `lib/utils/error-handler.ts`，實作通用錯誤處理函式
4. 建立 `types/api.ts`，定義 API Response 型別
5. 使用 Postman 或 curl 測試 API，返回正確 JSON
6. 在前端 `app/page.tsx` 呼叫 `/api/health`，顯示狀態於頁面（驗證前後端連通）

### Story 1.5: GitHub Actions CI/CD 與 Azure 部署設定

**As a** 開發者,  
**I want** 建立 CI/CD 流程，實現自動化部署至 Azure Static Web Apps，  
**so that** 程式碼變更可以自動測試與部署。

**Acceptance Criteria**:

1. 在 Azure Portal 建立 Azure Static Web Apps 資源
2. 將專案推送至 GitHub repository
3. 在 `.github/workflows/azure-static-web-apps.yml` 建立 GitHub Actions 工作流程
4. 工作流程包含：Lint → Build → Deploy 步驟
5. 在 Azure Portal 配置環境變數（AZURE_OPENAI_API_KEY 等）
6. 推送程式碼至 `main` 分支，自動觸發部署
7. 部署成功後，Azure Static Web Apps URL 可正常存取首頁
8. `/api/health` API 在雲端環境正常運作

---

## Epic 2: 3D Avatar Rendering & Animation

**Epic Goal**: 實現 3D Avatar 在瀏覽器中的完整渲染與動畫系統，包含 Three.js 場景設定、Ready Player Me 模型載入、基礎動畫（待機、呼吸、眨眼）、Avatar 選擇功能，並確保渲染效能達到 30 FPS 以上，為後續 Lip Sync 功能奠定視覺基礎。

### Story 2.1: Three.js 場景初始化與 React Three Fiber 整合

**As a** 開發者,  
**I want** 在 Next.js 中整合 Three.js 與 React Three Fiber，建立基本 3D 渲染場景，  
**so that** 可以開始載入與顯示 3D Avatar 模型。

**Acceptance Criteria**:

1. 安裝依賴: `npm install three @react-three/fiber @react-three/drei`
2. 建立 `components/AvatarCanvas.tsx`，使用 `<Canvas>` 建立 Three.js 場景
3. 場景包含基本燈光設定：Ambient Light + Directional Light
4. 設定相機位置 `[0, 1.5, 2]`，FOV 50，模擬視訊通話視角
5. 加入 OrbitControls（開發用，可用滑鼠旋轉相機）
6. 在場景中放置測試立方體（`<Box>`），驗證 3D 渲染正常
7. 在 `app/page.tsx` 引入 `<AvatarCanvas>`，立方體在頁面中正常顯示並可旋轉
8. 渲染效能 ≥ 30 FPS（使用 Chrome DevTools 檢查）

### Story 2.2: Ready Player Me Avatar 模型載入

**As a** 開發者,  
**I want** 整合 Ready Player Me，載入 3D Avatar 模型到場景中，  
**so that** 可以顯示真實的人形 Avatar 而非測試立方體。

**Acceptance Criteria**:

1. 註冊 Ready Player Me 帳號，取得 3 個預設 Avatar GLB 模型 URL（男/女/中性）
2. 建立 `lib/three/avatar-loader.ts`，實作 GLB 模型載入函式（使用 `GLTFLoader`）
3. 建立 `components/AvatarModel.tsx` 組件，載入並顯示 Avatar 模型
4. 模型在場景中正確位置顯示（站立，正面朝向相機）
5. 移除測試立方體，場景中僅顯示 Avatar
6. Avatar 模型材質與貼圖正常顯示（皮膚、衣服、頭髮）
7. 載入時間 < 3 秒（使用標準網速測試）
8. 載入失敗時顯示錯誤訊息並 fallback 到預設模型

### Story 2.3: Avatar 待機動畫實作（呼吸、眨眼）

**As a** 使用者,  
**I want** 看到 Avatar 自然的待機動畫（呼吸、眨眼），  
**so that** Avatar 看起來像「活的」，而非靜止模型。

**Acceptance Criteria**:

1. 建立 `lib/three/animator.ts`，實作動畫控制器
2. 實作呼吸動畫：
   - 胸部/腹部骨骼微幅上下移動（scale 1.0 ↔ 1.02）
   - 週期：3 秒一次呼吸
3. 實作眨眼動畫：
   - 控制眼皮 blendshape（`eyesClosed`）
   - 隨機間隔：3-5 秒眨一次眼
   - 眨眼持續時間：0.2 秒
4. 動畫使用 `useFrame` hook（React Three Fiber）實現
5. Avatar 在場景中自然呼吸與眨眼，無卡頓
6. 可透過 props 控制動畫開關（`enableIdleAnimation={true}`）

### Story 2.4: Avatar 基本表情與頭部動作

**As a** 開發者,  
**I want** Avatar 支援基本表情（微笑）與頭部動作（點頭），  
**so that** 可以增加互動的自然感（未來可觸發）。

**Acceptance Criteria**:

1. 識別 Avatar 模型的可用 blendshapes（使用 `console.log` 列出）
2. 實作微笑表情：控制 `mouthSmile` blendshape（權重 0-1）
3. 實作點頭動作：頭部骨骼 X 軸旋轉 -10° → 0° → -10°（週期 2 秒）
4. 建立 `useAvatarAnimation()` custom hook，統一管理動畫
5. 在開發模式下，提供手動觸發按鈕測試表情（UI 暫時，後續移除）
6. 表情與動作流暢無抖動

### Story 2.5: Avatar 選擇功能與切換

**As a** 使用者,  
**I want** 在開始對話前選擇喜歡的 Avatar（男/女/中性），  
**so that** 可以有個人化的互動體驗。

**Acceptance Criteria**:

1. 建立 `components/AvatarSelector.tsx` 選擇器組件
2. 顯示 3 個 Avatar 預覽卡片（靜態圖片或 3D 縮圖）
3. 卡片包含：Avatar 圖片、名稱（如「Alex」「Sophia」「Jordan」）、選擇按鈕
4. 點擊卡片後，載入對應 Avatar 模型到主場景
5. 使用 Zustand store 儲存當前選擇的 Avatar ID
6. 切換 Avatar 時有淡入淡出過渡效果（避免突兀）
7. 選擇後，選擇器自動隱藏，顯示對話介面
8. 提供「更換 Avatar」按鈕（右上角），可重新選擇

---

## Epic 3: LLM Conversation & TTS Integration

**Epic Goal**: 實現完整的文字對話流程，包含使用者輸入 → Azure OpenAI LLM 處理 → SSE 串流回應 → Azure Speech TTS 語音合成 → Web Audio API 播放，並建立對話介面 UI，確保端到端對話延遲 < 2.5 秒，為 Lip Sync 功能準備音訊數據。

### Story 3.1: 對話介面 UI 實作

**As a** 使用者,  
**I want** 一個簡潔的對話介面（輸入框、歷史記錄、送出按鈕），  
**so that** 我可以透過文字與 Avatar 對話。

**Acceptance Criteria**:

1. 建立 `components/ChatInterface.tsx` 對話介面組件
2. 介面包含：
   - 對話歷史區域（顯示最近 5 則訊息，使用者/Avatar 分別顯示）
   - 文字輸入框（Textarea，支援 Enter 送出）
   - 送出按鈕（含 Loading 狀態）
   - 清除對話按鈕
3. 使用 Tailwind CSS 設計，符合品牌風格（深藍、白色）
4. 輸入框 placeholder: 「輸入訊息與 Avatar 對話...」
5. 訊息區域可滾動，新訊息自動滾動到底部
6. 使用者訊息顯示在右側（藍色氣泡），Avatar 訊息顯示在左側（灰色氣泡）
7. Loading 狀態時，送出按鈕顯示 Spinner 且禁用輸入

### Story 3.2: Zustand 狀態管理設定

**As a** 開發者,  
**I want** 建立 Zustand store 管理對話狀態（訊息、載入狀態、音訊），  
**so that** 多個組件可以共享與同步狀態。

**Acceptance Criteria**:

1. 安裝 Zustand: `npm install zustand`
2. 建立 `store/chatStore.ts`，定義對話狀態：
   - `messages: Message[]`（訊息陣列）
   - `isLoading: boolean`
   - `addMessage(msg)`, `clearMessages()`, `setLoading(bool)` 方法
3. 建立 `store/audioStore.ts`，定義音訊狀態：
   - `currentAudio: AudioBuffer | null`
   - `isPlaying: boolean`
   - `playAudio(buffer)`, `stopAudio()` 方法
4. 建立 `store/avatarStore.ts`，定義 Avatar 狀態：
   - `selectedAvatar: string`
   - `visemes: VisemeData[]`
   - `setVisemes(data)` 方法
5. 定義 TypeScript 型別於 `types/chat.ts`, `types/audio.ts`
6. 在 `ChatInterface` 中使用 `useChatStore()` hook
7. 新增訊息後，狀態即時更新並顯示於 UI

### Story 3.3: Chat API 實作（Azure OpenAI + SSE 串流）

**As a** 開發者,  
**I want** 建立 Chat API，整合 Azure OpenAI 並使用 SSE 串流回應，  
**so that** 使用者可以即時看到 LLM 的回應文字。

**Acceptance Criteria**:

1. 建立 `app/api/chat/route.ts`
2. 接收 POST 請求，body 包含 `messages: Message[]`
3. 呼叫 Azure OpenAI Chat Completions API（GPT-4 Turbo），啟用 `stream: true`
4. 使用 Server-Sent Events (SSE) 格式串流回應：
   - 每個 chunk 格式：`data: {"content": "文字"}\n\n`
5. 錯誤處理：API 失敗返回 500，包含錯誤訊息
6. 超時設定：10 秒無回應自動中斷
7. 使用 Postman 測試 API，收到串流回應
8. 在前端使用 `EventSource` 或 `fetch` 接收 SSE，即時更新 UI

### Story 3.4: 前端 SSE 串流接收與顯示

**As a** 使用者,  
**I want** 看到 Avatar 的回應即時逐字顯示（打字機效果），  
**so that** 對話感覺更自然且即時。

**Acceptance Criteria**:

1. 建立 `lib/api/chat.ts`，實作 `sendMessage()` 函式
2. 使用 `fetch` 呼叫 `/api/chat`，讀取 SSE 串流
3. 每收到一個 chunk，將文字附加到當前訊息
4. 在 UI 中即時顯示逐字出現的效果
5. 串流結束後，將完整訊息加入 `chatStore`
6. 處理連線中斷或錯誤情況，顯示錯誤訊息
7. Loading 狀態正確更新（開始/結束）
8. 測試：輸入「你好」，Avatar 回應即時顯示

### Story 3.5: TTS API 實作（Azure Speech 語音合成）

**As a** 開發者,  
**I want** 建立 TTS API，將 LLM 回應文字轉換為語音，  
**so that** Avatar 可以「說話」。

**Acceptance Criteria**:

1. 建立 `app/api/tts/route.ts`
2. 接收 POST 請求，body 包含 `text: string`
3. 使用 Azure Speech SDK，呼叫 TTS API：
   - 語音：`zh-TW-HsiaoChenNeural`（繁中女聲）
   - 格式：MP3, 16kbps, Mono
4. 返回音訊檔案（`Content-Type: audio/mpeg`）
5. 錯誤處理：API 失敗返回 500
6. 超時設定：5 秒
7. 使用 Postman 測試，上傳文字「你好，我是 Avatar」，收到 MP3 音訊檔
8. 音訊在播放器中可正常播放，語音清晰

### Story 3.6: Web Audio API 音訊播放整合

**As a** 使用者,  
**I want** Avatar 的回應自動以語音播放，  
**so that** 我可以聽到 Avatar 的「聲音」。

**Acceptance Criteria**:

1. 建立 `lib/utils/audio.ts`，實作 Web Audio API 播放函式
2. LLM 回應完成後，自動呼叫 `/api/tts` 取得音訊
3. 將音訊轉換為 `AudioBuffer`
4. 使用 `AudioContext` 播放音訊
5. 播放時更新 `audioStore` 狀態（`isPlaying: true`）
6. 播放完畢後重置狀態（`isPlaying: false`）
7. 支援播放控制：暫停、繼續（UI 按鈕）
8. 測試：對話後自動播放語音，聲音清晰無延遲（< 1.5s）

### Story 3.7: 端到端對話流程整合與優化

**As a** 使用者,  
**I want** 完整的對話流程順暢運作（輸入 → LLM → 顯示 → TTS → 播放），  
**so that** 我可以自然地與 Avatar 對話。

**Acceptance Criteria**:

1. 完整流程：
   - 使用者輸入文字 → 送出
   - 呼叫 Chat API（SSE 串流）
   - LLM 回應即時顯示
   - 回應完成後呼叫 TTS API
   - 音訊自動播放
2. 端到端延遲 < 2.5 秒（輸入到語音開始播放）
3. 錯誤處理完善：
   - LLM 失敗：顯示「Avatar 正在思考中...」
   - TTS 失敗：顯示文字但無語音
   - 網路中斷：提示檢查連線
4. 可連續對話 10 輪無崩潰
5. 對話上下文正確保留（LLM 記得前面的對話）
6. UI Loading 狀態正確（輸入框禁用、按鈕 Spinner）

---

## Epic 4: Lip Sync & Audio-Visual Synchronization

**Epic Goal**: 實現 Lip Sync 嘴型同步功能，分析 TTS 音訊產生 viseme（視覺音素）數據，驅動 Avatar 的嘴型 blendshapes，達成音訊與視覺的精準同步，視覺匹配度 ≥ 70%，提供「真人般」的沉浸式對話體驗。

### Story 4.1: 音訊分析與 Viseme 數據生成（簡化版）

**As a** 開發者,  
**I want** 分析 TTS 音訊產生 viseme 時間軸數據，  
**so that** 可以驅動 Avatar 嘴型動畫。

**Acceptance Criteria**:

1. 建立 `lib/three/lipsync.ts`，實作音訊分析函式
2. 使用 Web Audio API `AnalyserNode` 分析音訊頻率
3. 實作簡化 viseme 映射表：
   - 高音量 → `aa`（張嘴）
   - 中音量 → `E`（半開）
   - 低音量 → `neutral`（閉嘴）
4. 產生 viseme 時間軸數據結構：`VisemeData[] = [{ time: number, viseme: string, weight: number }]`
5. 每 100ms 產生一個 viseme 數據點
6. 測試：輸入音訊檔，console.log 顯示 viseme 陣列
7. 目標準確度：70%（透過主觀視覺評估）

### Story 4.2: Avatar Blendshape 控制與嘴型驅動

**As a** 開發者,  
**I want** 將 viseme 數據映射到 Avatar 的 blendshapes，控制嘴型變化，  
**so that** Avatar 的嘴型可以根據語音動態變化。

**Acceptance Criteria**:

1. 識別 Ready Player Me Avatar 的嘴型 blendshapes（如：`mouthOpen`, `mouthSmile` 等）
2. 建立 viseme 到 blendshape 的映射函式：`applyViseme(mesh, viseme, weight)`
3. 實作 blendshape 權重控制：
   - `aa` → `mouthOpen` (weight 1.0)
   - `E` → `mouthOpen` (weight 0.5)
   - `neutral` → 所有嘴型 blendshape (weight 0)
4. 使用 `useFrame` hook 即時更新 blendshape
5. 測試：手動設定 viseme，Avatar 嘴型正確變化
6. 嘴型變化流暢無抖動

### Story 4.3: Lip Sync Controller 與音訊同步

**As a** 開發者,  
**I want** 建立 Lip Sync Controller，同步音訊播放與嘴型動畫，  
**so that** Avatar 的嘴型與語音完美同步。

**Acceptance Criteria**:

1. 建立 `components/LipSyncController.tsx`（無 UI 組件）
2. 監聽 `audioStore` 的 `currentAudio` 狀態
3. 音訊播放時：
   - 同步觸發 viseme 分析
   - 根據時間軸更新 Avatar blendshapes
4. 實作時間同步邏輯：
   - 使用 `AudioContext.currentTime` 與 viseme `time` 對齊
   - 補償延遲（< 100ms）
5. 音訊播放完畢後，嘴型恢復 `neutral`
6. 測試：播放「你好，我是 Avatar」，嘴型與語音同步
7. 視覺延遲 < 100ms（肉眼無明顯落差）

### Story 4.4: Lip Sync 視覺優化與調校

**As a** 使用者,  
**I want** Avatar 的嘴型動作自然且與語音高度匹配，  
**so that** 對話體驗更加逼真。

**Acceptance Criteria**:

1. 調整 viseme 權重曲線，使嘴型變化更平滑（使用 easing 函式）
2. 加入嘴型過渡動畫（避免突變）：
   - 使用 `lerp`（線性插值）平滑過渡
   - 過渡時間：50ms
3. 優化高頻音素處理（如「ㄙ」「ㄕ」）
4. 測試多種語句：
   - 短句：「你好」
   - 長句：「很高興認識你，我是你的 AI 助手」
   - 快速語句：「一二三四五六七八九十」
5. 視覺匹配度評估 ≥ 70%（5 位測試者主觀評分平均）
6. 無明顯「錯位」或「延遲」感

### Story 4.5: Lip Sync 降級方案與錯誤處理

**As a** 開發者,  
**I want** 當 Lip Sync 失敗時有優雅的降級方案，  
**so that** 使用者仍可正常使用對話功能（僅無嘴型）。

**Acceptance Criteria**:

1. 捕捉 Lip Sync 分析錯誤（如：音訊格式不支援）
2. 錯誤發生時：
   - Console 記錄錯誤（開發模式）
   - 音訊正常播放，但不驅動嘴型
   - Avatar 保持微笑表情（fallback）
3. 使用者無感知崩潰，對話繼續
4. 提供設定選項：「關閉 Lip Sync」（節省效能）
5. 測試：故意傳入錯誤音訊，系統不崩潰，僅跳過嘴型

---

## Epic 5: Polish, Testing & Deployment

**Epic Goal**: 完成專案收尾工作，包含效能優化（FPS、延遲、記憶體）、錯誤處理完善、UI/UX 細節打磨、瀏覽器相容性測試、部署至 Azure Static Web Apps、撰寫技術驗證報告與使用文件，確保 POC 可穩定運行並提供決策依據。

### Story 5.1: 效能優化（3D 渲染與音訊）

**As a** 開發者,  
**I want** 優化 3D 渲染與音訊處理效能，  
**so that** 應用程式在各種裝置上流暢運行。

**Acceptance Criteria**:

1. 3D 渲染優化：
   - 降低 Avatar 模型 LOD（細節層次）
   - 優化燈光與陰影設定
   - 移除不必要的 `useFrame` 計算
2. 音訊優化：
   - TTS 音訊使用低位元率 MP3（16kbps）
   - 實作音訊預載入與快取
3. 程式碼分割：
   - Three.js 組件使用 Dynamic Import
   - 減少首屏 Bundle 大小
4. 測試結果：
   - 3D 渲染 FPS ≥ 30（桌機）
   - 首次載入時間 < 5 秒
   - 記憶體使用 < 500 MB
5. 使用 Chrome DevTools Performance 記錄並驗證

### Story 5.2: 錯誤處理與使用者體驗完善

**As a** 使用者,  
**I want** 當系統錯誤發生時，看到友善的提示而非技術錯誤訊息，  
**so that** 我知道如何處理問題。

**Acceptance Criteria**:

1. 實作全域錯誤邊界（React Error Boundary）
2. 定義友善錯誤訊息：
   - Azure API 失敗：「Avatar 正在思考中，請稍候再試...」
   - 網路中斷：「網路連線不穩定，請檢查網路設定」
   - 模型載入失敗：「Avatar 載入失敗，請重新整理頁面」
3. 加入重試機制：
   - API 500 錯誤自動重試 1 次
   - 使用者可手動點擊「重試」按鈕
4. Loading 狀態優化：
   - Avatar 載入時顯示 Skeleton 或進度條
   - 音訊處理時顯示「正在生成語音...」
5. 測試各種錯誤場景，確保使用者體驗流暢

### Story 5.3: UI/UX 細節打磨

**As a** 使用者,  
**I want** 精緻的 UI 細節與流暢的互動體驗，  
**so that** 使用過程愉悅且專業。

**Acceptance Criteria**:

1. 動畫過渡優化：
   - 頁面切換使用淡入淡出（Fade In/Out）
   - 按鈕 hover 效果（scale + shadow）
   - Avatar 選擇時的卡片 hover 效果
2. 響應式設計調整：
   - 平板（1024x768）佈局適配
   - 小筆電（1366x768）正常顯示
3. 無障礙改善（基本）：
   - 按鈕加入 `aria-label`
   - 輸入框加入 `placeholder` 與 `label`
   - 鍵盤導航支援（Tab 鍵）
4. 視覺細節：
   - 對話氣泡加入微陰影
   - 滾動條自訂樣式
   - Loading Spinner 使用品牌色
5. 5 位測試使用者評分 UI/UX ≥ 4.0/5.0

### Story 5.4: 瀏覽器相容性測試

**As a** 開發者,  
**I want** 確保應用程式在主流瀏覽器正常運作，  
**so that** 使用者無論使用哪種瀏覽器都能正常體驗。

**Acceptance Criteria**:

1. 測試瀏覽器列表：
   - Chrome 90+ (Windows, macOS)
   - Edge 90+ (Windows)
   - Safari 14+ (macOS)
   - Firefox 88+ (Windows, macOS)
2. 測試項目：
   - 3D Avatar 正常渲染
   - 對話功能正常
   - 音訊播放正常
   - Lip Sync 嘴型同步
3. 記錄測試結果於 Google Sheet
4. 修復關鍵相容性問題（如有）
5. 已知限制記錄於文件（如：Safari WebGL 效能較差）

### Story 5.5: Azure Static Web Apps 生產部署

**As a** 開發者,  
**I want** 將應用程式部署至 Azure 生產環境，  
**so that** 專案可公開存取並進行實際測試。

**Acceptance Criteria**:

1. 確認 GitHub Actions 部署流程正常
2. 在 Azure Portal 配置生產環境變數
3. 執行生產建置：`npm run build`，無錯誤
4. 推送至 `main` 分支，自動觸發部署
5. 部署成功後，取得 Azure Static Web Apps URL
6. 驗證生產環境：
   - 所有功能正常運作
   - `/api/health` 返回正確狀態
   - Avatar 正常載入與對話
7. 設定自訂網域（選做）
8. 配置 HTTPS（Azure 自動提供）

### Story 5.6: 技術驗證報告撰寫

**As a** 專案負責人,  
**I want** 一份完整的 POC 技術驗證報告，  
**so that** 可以評估技術可行性並決定下一步行動。

**Acceptance Criteria**:

1. 建立 `docs/poc-results.md` 技術驗證報告
2. 報告包含章節：
   - **執行摘要**: POC 目標、結論、建議
   - **功能驗證**: 5 大核心功能達成狀況
   - **效能測試**: FPS、延遲、記憶體數據
   - **成本分析**: 實際 Azure 費用統計
   - **技術挑戰**: 遇到的問題與解決方案
   - **使用者測試**: 5 位測試者反饋摘要
   - **下一步建議**: MVP 功能建議、技術優化方向
3. 包含截圖與影片 Demo
4. 附上關鍵程式碼片段（如：Lip Sync 實作）
5. 報告長度：3,000-5,000 字

### Story 5.7: 使用文件與部署指南

**As a** 開發者或使用者,  
**I want** 清晰的使用文件與部署指南，  
**so that** 可以快速理解專案並在本地執行或部署。

**Acceptance Criteria**:

1. 更新 `README.md`，包含：
   - 專案簡介
   - 功能列表
   - 技術棧
   - 安裝步驟（本地執行）
   - 環境變數設定說明
   - 部署指南（Azure Static Web Apps）
   - 常見問題（FAQ）
2. 建立 `docs/deployment-guide.md` 詳細部署文件
3. 建立 `docs/user-guide.md` 使用者指南（如何與 Avatar 對話）
4. 所有文件使用繁體中文撰寫
5. 包含截圖與指令範例
6. 文件清晰易懂，非技術人員也能理解

---

## Checklist Results Report

_（此部分將在執行 pm-checklist 後填入）_

待執行 BMad PM Checklist 驗證 PRD 品質，檢查項目包括：
- ✅ Goals 明確且可衡量
- ✅ Requirements 完整且可測試
- ✅ Epics 邏輯順序正確
- ✅ Stories 符合 INVEST 原則
- ✅ Acceptance Criteria 清晰無歧義
- ✅ 技術假設完整記錄

---

## Next Steps

### UX Expert Prompt

Dear **UX Expert (Sally)**,

請基於此 PRD 撰寫 **Front-End Specification**。

**關鍵重點**:
1. **視覺設計**: Avatar 佔據 70% 畫面，對話介面簡潔低調
2. **色彩系統**: 深藍主色 (#1E3A8A)、白色、青色強調 (#06B6D4)
3. **核心頁面**: Avatar 選擇頁 + 主對話頁
4. **互動細節**: Loading 狀態、錯誤提示、動畫過渡
5. **響應式**: 優先桌機版，支援平板

請使用 BMad `front-end-spec-tmpl.yaml` 模板，產出完整的前端規格文件。

開始指令：`@ux-expert 請使用 create-doc 模式，基於 prd.md 撰寫 front-end-spec.md`

### Architect Prompt

Dear **Architect (Winston)**,

請基於此 PRD 與前端規格，撰寫 **Fullstack Architecture 文件**。

**關鍵技術決策**（已確定）:
- **架構**: Monolith（Next.js 14 App Router）
- **前端**: React + Three.js + React Three Fiber + Zustand
- **後端**: Next.js API Routes + Azure OpenAI + Azure Speech
- **部署**: Azure Static Web Apps

**請特別設計**:
1. **API 規格**: `/api/chat` (SSE), `/api/tts` (REST)
2. **資料流**: 文字 → LLM → TTS → 音訊 → Lip Sync → Avatar
3. **Lip Sync 方案**: Web Audio API + 音素映射（POC 階段）
4. **錯誤處理**: Fallback 與 retry 機制
5. **效能策略**: 3D 優化、音訊快取

請使用 BMad `fullstack-architecture-tmpl.yaml` 模板（或 `architecture-tmpl.yaml`），產出完整的架構文件。

開始指令：`@architect 請使用 create-doc 模式，基於 prd.md 撰寫 architecture.md`

---

**PRD 狀態**: ✅ 完成  
**下一步**: 交付給 UX Expert (Sally) 與 Architect (Winston)  
**版本**: v1.0  
**最後更新**: 2025-10-14

