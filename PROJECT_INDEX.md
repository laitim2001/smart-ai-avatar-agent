# PROJECT INDEX - 項目完整索引

> **文件性質**: 項目結構導覽與完整文件索引
> **用途**: 幫助開發者和 AI 助手快速理解項目架構、定位文件和理解依賴關係
> **更新方式**: 使用 `npm run sync-index` 同步文件列表，手動維護說明文字
> **最後更新**: 2025-10-23

---

## 📋 目錄

- [項目概覽](#項目概覽)
- [項目狀態](#項目狀態)
- [快速導覽](#快速導覽)
- [目錄結構說明](#目錄結構說明)
  - [根目錄核心文件](#根目錄核心文件)
  - [應用程式代碼 (app/)](#應用程式代碼-app)
  - [UI 組件 (components/)](#ui-組件-components)
  - [工具函式與配置 (lib/)](#工具函式與配置-lib)
  - [狀態管理 (stores/)](#狀態管理-stores)
  - [類型定義 (types/)](#類型定義-types)
  - [文件目錄 (docs/)](#文件目錄-docs)
  - [配置與腳本](#配置與腳本)
- [架構依賴關係](#架構依賴關係)
- [關鍵文件索引](#關鍵文件索引)
- [開發工作流程](#開發工作流程)

---

## 項目概覽

**Smart AI Avatar Agent** 是一個基於 Next.js 15、Three.js 和 Azure AI 服務的企業級 3D Avatar 即時對話系統。

### 核心技術棧

| 類別 | 技術 | 版本 | 用途 |
|------|------|------|------|
| **前端框架** | Next.js | 15.5.5 | App Router、SSR、API Routes |
| **UI 框架** | React | 19.2.0 | 組件化 UI |
| **3D 渲染** | Three.js | 0.180.0 | WebGL 3D 圖形 |
| **3D React 整合** | @react-three/fiber | 9.4.0 | React Three.js 聲明式 API |
| **3D 工具** | @react-three/drei | 9.119.2 | 常用 3D 組件庫 |
| **狀態管理** | Zustand | 5.0.8 | 輕量級狀態管理 |
| **樣式** | Tailwind CSS | 4.1.14 | Utility-first CSS |
| **類型系統** | TypeScript | 5.9.3 | 型別安全 |
| **資料庫** | PostgreSQL | - | 關聯式資料庫 |
| **ORM** | Prisma | 6.3.0 | 資料庫 ORM |
| **認證** | NextAuth.js | 5.0.0-beta.28 | 使用者認證 |
| **AI 對話** | Azure OpenAI | GPT-4 Turbo | LLM 對話 |
| **語音服務** | Azure Speech | - | TTS/STT |
| **國際化** | next-intl | 3.27.2 | 多語言支援 |

### 架構模式

- **前端架構**: Next.js App Router + React Server Components
- **API 模式**: Edge Runtime API Routes (SSE Streaming)
- **狀態管理**: Zustand (3 個獨立 Store: avatar, chat, audio)
- **3D 渲染**: Three.js + React Three Fiber (聲明式 3D)
- **動畫系統**: Controller Pattern (Blink, Breath, Expression, HeadNod, LipSync)
- **音訊處理**: Web Audio API (AudioContext + AudioBuffer)

---

## 項目狀態

### 開發階段

| 階段 | 時間 | Story Points | 狀態 | 完成度 |
|------|------|-------------|------|---------|
| **POC 驗證** | 2025-08-16 ~ 2025-10-15 | 29 Stories | ✅ 完成 | 100% |
| **MVP 開發** | 2025-10-16 ~ 進行中 | 103 SP | 🔄 進行中 | 95.1% |

### MVP Epic 進度

| Epic | 主題 | Story Points | 進度 | 狀態 |
|------|------|-------------|------|------|
| **Epic 1** | POC 企業化基礎 (認證、個人資料、STT) | 42/42 SP | 100% | ✅ 完成 |
| **Epic 2** | Avatar 與對話系統擴充 (響應式、角色庫、對話歷史、多語言、Prompt) | 21/21 SP | 100% | ✅ 完成 |
| **Epic 3** | 優化、測試與監控 (Safari、Application Insights、測試、部署) | 35/40 SP | 87.5% | ⚠️ 部分完成 |
| **Epic 4** | Lip Sync 唇型同步系統 | - | 100% | ✅ 完成 |
| **總計** | - | **98/103 SP** | **95.1%** | 🔄 **接近完成** |

### 最新功能狀態

- ✅ **使用者認證系統** (NextAuth.js v5, Email 驗證, 密碼重設)
- ✅ **個人資料管理** (Profile, Avatar 偏好, 活動記錄)
- ✅ **語音輸入系統** (Web Speech API, Azure Speech STT)
- ✅ **響應式設計** (Desktop, Tablet, Mobile)
- ✅ **Avatar 角色庫** (多 Avatar 支援, 收藏功能, Replicate API)
- ✅ **對話歷史** (儲存/載入, 搜尋, 刪除)
- ✅ **多語言 UI** (next-intl: 繁中、英文、日文)
- ✅ **對話主題** (Prompt 模板系統, 分類管理)
- ✅ **Safari 優化** (Web Speech API 相容性, 音訊播放, WebGL)
- ✅ **Lip Sync 系統** (自適應強度, Co-articulation, 語速控制)
- ✅ **知識庫管理系統** (6 種知識類型: Persona, FAQ, KPI, 決策日誌, 會議摘要, API 文件)
- ⏳ **Application Insights** (基礎整合完成, 效能監控與錯誤追蹤待補完)

---

## 快速導覽

### 🎯 我想要...

#### 開始開發
1. **閱讀根目錄 README.md** - 快速開始指南
2. **配置環境**: `docs/deployment/ENVIRONMENT_VARIABLES.md`
3. **本地開發**: `docs/misc/LOCAL_DEV_GUIDE.md`
4. **開發規範**: `CLAUDE.md` (AI 助手指南)

#### 了解系統架構
- **整體架構**: `docs/design/architecture.md`
- **設計系統**: `docs/design/DESIGN-SYSTEM.md`
- **資料庫架構**: `docs/design/database-design.md`
- **API 設計**: `docs/api/` (所有 API 文件)

#### 實作新功能
- **找到對應功能模組**: `lib/`, `components/`, `app/` (見下方詳細結構)
- **查閱實作指南**: `docs/implementation/` (按功能模組分類)
- **API 文件**: `docs/api/` (API_REFERENCE_SPRINT2.md, API_REFERENCE_SPRINT3.md)
- **測試指南**: `docs/testing/`

#### 解決問題
- **故障排除**: `docs/troubleshooting/`
- **修復日誌**: `docs/fixes/` (按日期命名: YYYY-MM-DD-*.md)
- **Lip Sync 診斷**: `docs/implementation/lip-sync/LIPSYNC_FIXES_2025-10-20.md`
- **知識庫問題**: `docs/implementation/knowledge-system/KNOWLEDGE_SYSTEM_ISSUES_AND_FIXES.md`

#### 部署上線
- **部署指南**: `docs/deployment/deployment-guide.md`
- **Azure 部署**: `docs/deployment/AZURE_DEPLOYMENT.md`
- **上線檢查**: `docs/deployment/PRE_LAUNCH_CHECKLIST.md`
- **環境變數**: `docs/deployment/ENVIRONMENT_VARIABLES.md`

#### 追蹤進度
- **MVP 進度**: `docs/mvp/MVP_PROGRESS.md` (⭐ 最重要的活躍文件)
- **Sprint 計劃**: `docs/mvp/MVP_DEVELOPMENT_PLAN.md`
- **POC 驗證報告**: `docs/00-archive/poc/POC_TECHNICAL_REPORT.md`
- **歷史 Stories**: `docs/00-archive/poc/stories/epic-1/` ~ `epic-5/`

#### 查找 AI 知識
- **Persona 管理**: `agent-brain/persona.md`
- **常見問題**: `agent-brain/knowledge/faq/cdo_faq.md`
- **KPI 字典**: `agent-brain/knowledge/kpi_dictionary/kpi_dictionary.md`
- **API 文件**: `agent-brain/knowledge/api_docs/`
- **決策日誌**: `agent-brain/knowledge/decision_logs/`
- **會議摘要**: `agent-brain/knowledge/meeting_summaries/`

---

## 目錄結構說明

### 根目錄核心文件

| 文件 | 狀態 | 重要性 | 說明 |
|------|------|---------|------|
| `README.md` | ✅ | ⭐⭐⭐⭐⭐ | **項目首頁** - 快速開始、技術棧、部署狀態 |
| `CLAUDE.md` | ✅ | ⭐⭐⭐⭐⭐ | **AI 助手開發指南** - Claude Code 使用規範和開發模式 |
| `PROJECT_INDEX.md` | ✅ | ⭐⭐⭐⭐⭐ | **本文件** - 完整項目索引與導覽 |
| `package.json` | ✅ | ⭐⭐⭐⭐⭐ | **依賴管理** - 所有 npm 套件和腳本命令 |
| `tsconfig.json` | ✅ | ⭐⭐⭐⭐ | **TypeScript 配置** - 編譯選項和路徑別名 |
| `next.config.js` | ✅ | ⭐⭐⭐⭐ | **Next.js 配置** - 圖片、外部資源、環境變數 |
| `tailwind.config.ts` | ✅ | ⭐⭐⭐⭐ | **Tailwind 配置** - 主題、顏色、插件 |
| `prisma/schema.prisma` | ✅ | ⭐⭐⭐⭐⭐ | **資料庫 Schema** - 所有資料模型定義 |
| `.env.local.example` | ✅ | ⭐⭐⭐⭐ | **環境變數範例** - 必要的 API Keys 和配置 |
| `.gitignore` | ✅ | ⭐⭐⭐ | **Git 忽略規則** - 防止敏感文件提交 |

### 應用程式代碼 (app/)

Next.js App Router 結構 - 所有路由和 API 端點

#### API Routes (`app/api/`)

| API 路徑 | 方法 | 用途 | 重要性 |
|---------|------|------|---------|
| `/api/auth/[...nextauth]` | ALL | **NextAuth.js 認證端點** | ⭐⭐⭐⭐⭐ |
| `/api/auth/login` | POST | **登入 API** | ⭐⭐⭐⭐⭐ |
| `/api/auth/register` | POST | **註冊 API** | ⭐⭐⭐⭐⭐ |
| `/api/auth/verify-email` | POST | **Email 驗證** | ⭐⭐⭐⭐ |
| `/api/auth/forgot-password` | POST | **忘記密碼** | ⭐⭐⭐⭐ |
| `/api/auth/reset-password` | POST | **重設密碼** | ⭐⭐⭐⭐ |
| `/api/user/profile` | GET/PUT | **個人資料管理** | ⭐⭐⭐⭐ |
| `/api/user/settings` | GET/PUT | **使用者設定** | ⭐⭐⭐⭐ |
| `/api/user/activity` | GET | **活動記錄查詢** | ⭐⭐⭐ |
| `/api/chat` | POST | **LLM 對話 (SSE Streaming)** | ⭐⭐⭐⭐⭐ |
| `/api/tts` | POST | **文字轉語音 (Azure Speech)** | ⭐⭐⭐⭐⭐ |
| `/api/tts-viseme` | POST | **TTS + Viseme 數據 (Lip Sync)** | ⭐⭐⭐⭐⭐ |
| `/api/avatar/lip-sync` | POST | **Lip Sync 音訊處理** | ⭐⭐⭐⭐ |
| `/api/avatar/stylize` | POST | **Avatar 風格化 (Replicate)** | ⭐⭐⭐ |
| `/api/avatars` | GET/POST | **Avatar 列表與創建** | ⭐⭐⭐⭐ |
| `/api/avatars/[id]/favorite` | PUT | **Avatar 收藏管理** | ⭐⭐⭐ |
| `/api/conversations` | GET/POST | **對話歷史 CRUD** | ⭐⭐⭐⭐ |
| `/api/conversations/[id]` | GET/PUT/DELETE | **單一對話操作** | ⭐⭐⭐⭐ |
| `/api/knowledge/*` | GET/POST/PUT/DELETE | **知識庫管理 API** (6 種類型) | ⭐⭐⭐⭐ |
| `/api/health` | GET | **健康檢查** | ⭐⭐ |

**關鍵技術點**:
- 所有 API 使用 **Edge Runtime** 提升效能
- `/api/chat` 使用 **Server-Sent Events (SSE)** 實現串流回應
- `/api/tts-viseme` 回傳包含 Viseme 數據的音訊 (Lip Sync 核心)
- 認證 API 整合 **NextAuth.js v5** 和 **Prisma**

#### 頁面路由 (`app/[locale]/`)

| 路由 | 佈局 | 用途 | 重要性 |
|------|------|------|---------|
| `/[locale]` | `app/layout.tsx` | **首頁** - Avatar 對話介面 | ⭐⭐⭐⭐⭐ |
| `/[locale]/(auth)/login` | `(auth)/layout.tsx` | **登入頁** | ⭐⭐⭐⭐⭐ |
| `/[locale]/(auth)/register` | `(auth)/layout.tsx` | **註冊頁** | ⭐⭐⭐⭐ |
| `/[locale]/(dashboard)/*` | `(dashboard)/layout.tsx` | **Dashboard 系統** | ⭐⭐⭐⭐⭐ |
| `/[locale]/(dashboard)/dashboard` | 同上 | Dashboard 首頁 | ⭐⭐⭐⭐ |
| `/[locale]/(dashboard)/conversations` | 同上 | 對話歷史列表 | ⭐⭐⭐⭐ |
| `/[locale]/(dashboard)/custom-avatar` | 同上 | 自訂 Avatar (Replicate) | ⭐⭐⭐ |
| `/[locale]/(dashboard)/settings/*` | 同上 | 使用者設定 (Profile, Avatar, Security, Activity) | ⭐⭐⭐⭐ |
| `/[locale]/(dashboard)/knowledge/*` | 同上 | 知識庫管理介面 (6 種類型) | ⭐⭐⭐⭐ |

**關鍵技術點**:
- 使用 **Route Groups** `(auth)` 和 `(dashboard)` 組織路由
- 使用 **`[locale]` 動態路由** 實現多語言 (next-intl)
- Dashboard 使用統一的 **Sidebar + Layout** 系統
- 知識庫系統支援 6 種類型: Persona, FAQ, KPI, 決策日誌, 會議摘要, API 文件

### UI 組件 (components/)

React 組件庫 - 按功能模組分類

#### Avatar 3D 組件 (`components/avatar/`)

| 組件 | 用途 | 依賴 | 重要性 |
|------|------|------|---------|
| `AvatarCanvas.tsx` | **Three.js Canvas 容器** - 3D 渲染根節點 | @react-three/fiber | ⭐⭐⭐⭐⭐ |
| `AvatarModel.tsx` | **3D Avatar 模型渲染器** - GLB 載入與顯示 | @react-three/drei | ⭐⭐⭐⭐⭐ |
| `AvatarLoadingState.tsx` | **載入狀態** - 3D 載入中提示 | - | ⭐⭐⭐ |
| `AvatarControlPanel.tsx` | **動畫測試面板** - 開發工具 | - | ⭐⭐ |
| `AvatarSelector.tsx` | **Avatar 選擇 Modal** - 切換 Avatar | avatarStore | ⭐⭐⭐⭐ |
| `AvatarChangeButton.tsx` | **切換按鈕** - 觸發選擇 Modal | - | ⭐⭐⭐ |
| `hooks/useAvatarAnimation.ts` | **動畫編排 Hook** - 統一管理所有動畫 | lib/avatar/animations | ⭐⭐⭐⭐⭐ |

**關鍵技術點**:
- `AvatarCanvas` 是 Three.js 場景的 React 包裝器
- `AvatarModel` 使用 `useGLTF` 載入 Ready Player Me 模型
- `useAvatarAnimation` 整合 5 種動畫控制器: Blink, Breath, Expression, HeadNod, LipSync

#### 對話介面組件 (`components/chat/`)

| 組件 | 用途 | 依賴 | 重要性 |
|------|------|------|---------|
| `ChatInterface.tsx` | **主對話介面** - 訊息列表、輸入框、語音按鈕 | chatStore, audioStore | ⭐⭐⭐⭐⭐ |
| `Spinner.tsx` | **載入 Spinner** - 通用載入動畫 | - | ⭐⭐ |

#### 知識庫組件 (`components/knowledge/`)

| 組件 | 用途 | 重要性 |
|------|------|---------|
| `PersonaEditor.tsx` | **Persona 編輯器** - 角色設定管理 | ⭐⭐⭐⭐ |
| `FAQManager.tsx` | **FAQ 管理器** - 常見問題管理 | ⭐⭐⭐⭐ |
| `KPIManager.tsx` | **KPI 管理器** - KPI 字典管理 | ⭐⭐⭐⭐ |
| `DecisionLogList.tsx` | **決策日誌列表** - 決策記錄展示 | ⭐⭐⭐⭐ |
| `MeetingSummaryList.tsx` | **會議摘要列表** - 會議記錄展示 | ⭐⭐⭐⭐ |
| `APIDocManager.tsx` | **API 文件管理器** - API 文件維護 | ⭐⭐⭐⭐ |
| `SectionNavigator.tsx` | **章節導航器** - Markdown 章節樹狀導航 | ⭐⭐⭐⭐ |
| `MarkdownEditor.tsx` | **Markdown 編輯器** - Monaco Editor 整合 | ⭐⭐⭐⭐ |

**關鍵技術點**:
- 知識庫系統支援 6 種知識類型
- `SectionNavigator` 使用 `remark` 解析 Markdown 生成導航樹
- `MarkdownEditor` 整合 Monaco Editor 提供語法高亮和自動完成

#### 通用 UI 組件 (`components/ui/`)

| 組件 | 用途 | 重要性 |
|------|------|---------|
| `button.tsx` | **按鈕組件** - 多種樣式變體 | ⭐⭐⭐⭐ |
| `input.tsx` | **輸入框組件** - 帶標籤和錯誤提示 | ⭐⭐⭐⭐ |
| `card.tsx` | **卡片容器** | ⭐⭐⭐ |
| `dialog.tsx` | **對話框 Modal** | ⭐⭐⭐ |
| `dropdown-menu.tsx` | **下拉選單** | ⭐⭐⭐ |
| `label.tsx` | **表單標籤** | ⭐⭐⭐ |
| `select.tsx` | **選擇器** | ⭐⭐⭐ |
| `textarea.tsx` | **多行文字輸入** | ⭐⭐⭐ |

### 工具函式與配置 (lib/)

核心業務邏輯和工具函式

#### Azure 服務整合 (`lib/azure/`)

| 文件 | 用途 | 重要性 |
|------|------|---------|
| `openai.ts` | **Azure OpenAI 客戶端工廠** - GPT-4 Turbo | ⭐⭐⭐⭐⭐ |
| `speech.ts` | **Azure Speech SDK 配置** - TTS/STT | ⭐⭐⭐⭐⭐ |

**關鍵函式**:
- `getOpenAIClient()`: 單例模式獲取 AzureOpenAI 實例
- `DEPLOYMENT_NAME`: GPT-4 Turbo 部署名稱
- Speech SDK 配置: 支援繁體中文 TTS (zh-TW-HsiaoChenNeural)

#### Avatar 系統 (`lib/avatar/`)

| 文件 | 用途 | 重要性 |
|------|------|---------|
| `animations.ts` | **動畫控制器** - Blink, Breath, Expression, HeadNod | ⭐⭐⭐⭐⭐ |
| `loaders.ts` | **GLB 模型載入器** - Ready Player Me 模型 | ⭐⭐⭐⭐ |
| `constants.ts` | **Avatar 常數** - 預設 Avatar URLs (含 morphTargets) | ⭐⭐⭐⭐ |

**關鍵類別**:
- `BlinkController`: 隨機眨眼 (2-6 秒間隔)
- `BreathingController`: 正弦波呼吸動畫 (Spine2 骨骼)
- `ExpressionController`: 面部表情 Blendshape (Easing 過渡)
- `HeadNodController`: 頭部點頭動畫 (正弦波旋轉)

**重要**: 所有 Avatar URL 必須包含 `?morphTargets=Oculus%20Visemes` 參數以支援 Lip Sync

#### Lip Sync 系統 (`lib/lipsync/`) ⭐ 核心功能

| 文件 | 用途 | 重要性 |
|------|------|---------|
| `controller.ts` | **Lip Sync 控制器** - 音訊與 Viseme 同步 (單例) | ⭐⭐⭐⭐⭐ |
| `mouth-animator.ts` | **嘴型動畫器** - Blendshape 平滑過渡 + 自適應強度 | ⭐⭐⭐⭐⭐ |
| `viseme-mapper.ts` | **Viseme 映射器** - Azure Viseme ID → Oculus Blendshapes | ⭐⭐⭐⭐⭐ |

**關鍵技術**:
- **自適應強度系統**: 自動處理 Azure TTS 不同權重範圍 (0.01-1.0)
  - 小值 (< 0.1): 放大 5 倍 (最高 10 倍)
  - 中值 (0.1-0.5): 使用預設 1.5 倍
  - 大值 (> 0.5): 縮小至 0.8 倍避免飽和
- **Co-articulation**: 30% 混合當前與下一個 Viseme
- **語速控制**: 預設 20% 極慢速度確保嘴型可見
- **60 FPS 更新**: useFrame 驅動的即時同步

**Viseme 映射**:
- Azure Viseme ID (0-21) → 15 個 Oculus Blendshapes
- 支援靜音 (viseme_sil)、母音 (aa, E, I, O, U)、子音 (PP, FF, DD, kk, SS, TH, nn 等)

#### 音訊處理 (`lib/audio/`)

| 文件 | 用途 | 重要性 |
|------|------|---------|
| `player.ts` | **Web Audio API 播放器** - AudioContext 單例 | ⭐⭐⭐⭐⭐ |

**關鍵功能**:
- `getAudioPlayer()`: 單例模式獲取 AudioPlayer
- `loadAudio(url)`: 載入音訊 Blob 並解碼為 AudioBuffer
- `play(buffer, onEnded)`: 播放音訊並設定結束回調
- 使用 **GainNode** 控制音量
- 自動管理 AudioBufferSourceNode 生命週期

#### API 客戶端 (`lib/api/`)

| 文件 | 用途 | 重要性 |
|------|------|---------|
| `client.ts` | **API 請求工具** - 統一錯誤處理 | ⭐⭐⭐⭐ |
| `chat.ts` | **SSE 串流客戶端** - LLM 對話串流解析 | ⭐⭐⭐⭐⭐ |

**關鍵函式**:
- `streamChatCompletion()`: 解析 SSE 串流並逐字回傳內容
- 自動處理 `data:` 前綴和 JSON 解析

#### 工具函式 (`lib/utils/`)

| 文件 | 用途 | 重要性 |
|------|------|---------|
| `error-handler.ts` | **錯誤處理工具** - 統一錯誤格式化 | ⭐⭐⭐⭐ |
| `utils.ts` | **通用工具** - `cn()` class 合併函式 | ⭐⭐⭐ |

### 狀態管理 (stores/)

Zustand Store - 3 個獨立狀態管理

| Store | 用途 | 持久化 | 重要性 |
|-------|------|--------|---------|
| `avatarStore.ts` | **Avatar 選擇狀態** - 當前 Avatar ID 和 URL | ✅ localStorage | ⭐⭐⭐⭐ |
| `chatStore.ts` | **對話狀態** - 訊息列表、輸入、SSE 整合 | ❌ | ⭐⭐⭐⭐⭐ |
| `audioStore.ts` | **音訊狀態** - 音訊播放、TTS API 整合 | ❌ | ⭐⭐⭐⭐⭐ |

**關鍵流程**:
```
使用者輸入 → chatStore.sendMessage()
  → POST /api/chat (SSE streaming)
  → chatStore 逐字更新訊息
  → 串流完成 → audioStore.speakText()
  → POST /api/tts-viseme
  → 獲取 { audio: base64, visemes: VisemeData[] }
  → Web Audio API 播放 + LipSyncController 同步
  → 播放結束 → 清理 Blob URL
```

### 類型定義 (types/)

TypeScript 類型定義

| 文件 | 用途 | 重要性 |
|------|------|---------|
| `api.ts` | **API 回應類型** | ⭐⭐⭐⭐ |
| `chat.ts` | **對話相關類型** | ⭐⭐⭐⭐⭐ |
| `audio.ts` | **音訊相關類型** | ⭐⭐⭐⭐ |
| `lipsync.ts` | **Lip Sync 類型** - VisemeData, LipSyncConfig | ⭐⭐⭐⭐⭐ |

### 文件目錄 (docs/)

完整的項目文件 - 按功能和階段組織

#### 文件結構概覽

```
docs/
├── README.md                    # 文件導覽 (v2.0)
├── AI_ASSISTANT_GUIDE.md        # AI 助手使用指南
├── INDEX_MAINTENANCE.md         # 索引維護指南
│
├── 📚 implementation/           # 功能實作指南
│   ├── lip-sync/               # Lip Sync 系統
│   ├── i18n/                   # 國際化
│   ├── knowledge-system/       # 知識庫管理
│   ├── custom-avatar/          # 自訂頭像
│   └── multi-agent/            # 多代理系統
│
├── 🔧 api/                     # API 設計文件
│   ├── API_AVATAR_FAVORITE.md
│   ├── API_CONVERSATIONS.md
│   ├── API_REFERENCE_SPRINT2.md
│   └── API_REFERENCE_SPRINT3.md
│
├── 🎨 design/                  # 架構與設計
│   ├── architecture.md
│   ├── DESIGN-SYSTEM.md
│   └── database-design.md
│
├── 🧪 testing/                 # 測試指南
│   ├── BROWSER_TEST_GUIDE.md
│   ├── TEST_ADAPTIVE_INTENSITY.md
│   └── ...
│
├── 🚀 deployment/              # 部署指南
│   ├── deployment-guide.md
│   ├── AZURE_DEPLOYMENT.md
│   ├── ENVIRONMENT_VARIABLES.md
│   └── PRE_LAUNCH_CHECKLIST.md
│
├── 📋 mvp/                     # MVP 開發
│   ├── MVP_PROGRESS.md         # ⭐ 進度追蹤
│   └── MVP_DEVELOPMENT_PLAN.md
│
├── 🐛 fixes/                   # 修復日誌
│   └── 2025-10-*-*.md
│
├── 🔧 troubleshooting/         # 故障排除
│   └── AUDIO_TROUBLESHOOT.md
│
├── 📝 misc/                    # 其他文件
│   └── LOCAL_DEV_GUIDE.md
│
├── 🎓 training/                # 訓練指南
│
└── 🗂️ 00-archive/             # 歷史歸檔
    ├── planning/               # 初期規劃 (PRD, 成本分析等)
    └── poc/                    # POC 階段
        ├── stories/            # 29 個 Stories (Epic 1-5)
        │   ├── epic-1/
        │   ├── epic-2/
        │   ├── epic-3/
        │   ├── epic-4/
        │   └── epic-5/
        └── epics/              # Epic 驗證報告
```

#### 重要文件說明

**🌟 最重要的活躍文件**:
- `docs/mvp/MVP_PROGRESS.md` - **MVP 即時進度追蹤** (每 Sprint 更新)
- `docs/README.md` - **文件導覽中心** (快速找到需要的文件)
- `CLAUDE.md` - **AI 助手開發規範** (開發模式和最佳實踐)

**實作指南 (docs/implementation/)**:

| 功能模組 | 關鍵文件 | 說明 |
|---------|---------|------|
| **Lip Sync** | `LIPSYNC_FIXES_2025-10-20.md` | 完整診斷與修復記錄 |
| | `LIP_SYNC_IMPLEMENTATION_GUIDE.md` | 實作指南 |
| | `WAV2LIP_INTEGRATION_TEST_RESULTS.md` | 測試結果 |
| **i18n** | `I18N_IMPLEMENTATION_STATUS.md` | 國際化狀態 |
| | `TRANSLATION_GUIDE.md` | 翻譯指南 |
| **知識庫** | `KNOWLEDGE_MANAGEMENT_SYSTEM_DESIGN.md` | 系統設計 |
| | `KNOWLEDGE_SYSTEM_IMPLEMENTATION_STATUS.md` | 實作狀態 |
| | `KNOWLEDGE_SYSTEM_ISSUES_AND_FIXES.md` | 問題診斷 |
| | `KNOWLEDGE_SYSTEM_USER_GUIDE.md` | 使用指南 |
| **自訂 Avatar** | `CUSTOM_AVATAR_SOLUTION.md` | 解決方案 |
| | `READY_PLAYER_ME_PHOTO_UPLOAD_STATUS.md` | 照片上傳狀態 |
| **多代理** | `MULTI_AGENT_ARCHITECTURE_DESIGN.md` | 架構設計 |

**API 文件 (docs/api/)**:
- `API_REFERENCE_SPRINT2.md` - Sprint 2 API (認證、個人資料、活動記錄)
- `API_REFERENCE_SPRINT3.md` - Sprint 3 API (STT 語音輸入)
- `API_CONVERSATIONS.md` - 對話歷史 API
- `API_AVATAR_FAVORITE.md` - Avatar 收藏 API

**部署文件 (docs/deployment/)**:
- `deployment-guide.md` - 完整部署流程
- `AZURE_DEPLOYMENT.md` - Azure 特定配置
- `ENVIRONMENT_VARIABLES.md` - 所有環境變數說明
- `PRE_LAUNCH_CHECKLIST.md` - 上線前檢查清單

**歷史歸檔 (docs/00-archive/)**:
- `planning/` - 項目初期規劃文件 (PRD, 成本分析, 技術選型等)
- `poc/stories/` - POC 階段 29 個 Stories (按 Epic 1-5 分類)
- `poc/epics/` - Epic 驗證報告和 PO 審查請求

**文件狀態**:
- **Active** (活躍): 當前正在更新 (如 MVP_PROGRESS.md)
- **Completed** (完成): 功能已完成，文件僅供參考 (如實作指南)
- **Archived** (歸檔): 已移至 00-archive/，不再更新 (如 POC Stories)

### 配置與腳本

#### 配置文件

| 文件 | 用途 | 重要性 |
|------|------|---------|
| `package.json` | npm 依賴和腳本 | ⭐⭐⭐⭐⭐ |
| `tsconfig.json` | TypeScript 配置 | ⭐⭐⭐⭐ |
| `next.config.js` | Next.js 配置 | ⭐⭐⭐⭐ |
| `tailwind.config.ts` | Tailwind CSS 配置 | ⭐⭐⭐⭐ |
| `prisma/schema.prisma` | 資料庫 Schema | ⭐⭐⭐⭐⭐ |
| `.env.local.example` | 環境變數範例 | ⭐⭐⭐⭐ |
| `.eslintrc.json` | ESLint 規則 | ⭐⭐⭐ |
| `.prettierrc` | Prettier 格式化 | ⭐⭐⭐ |

#### 腳本 (scripts/)

| 腳本 | 用途 | 重要性 |
|------|------|---------|
| `generate-index.js` | **完整重新生成 PROJECT_INDEX.md** | ⭐⭐⭐⭐⭐ |
| `sync-index.js` | **同步文件狀態標記** (⏳ → ✅) | ⭐⭐⭐⭐ |
| `validate-index.js` | **驗證索引完整性** | ⭐⭐⭐ |

**腳本使用**:
```bash
# 完整重新生成索引 (文件重組後使用)
npm run generate-index

# 同步文件狀態 (日常使用)
npm run sync-index

# 驗證索引準確性
npm run validate-index
```

---

## 架構依賴關係

### 核心數據流

```
使用者 → ChatInterface.tsx
  ↓
chatStore.sendMessage()
  ↓
POST /api/chat (SSE) ← AzureOpenAI (GPT-4 Turbo)
  ↓
chatStore 更新訊息 (逐字)
  ↓
串流完成 → audioStore.speakText()
  ↓
POST /api/tts-viseme ← Azure Speech SDK
  ↓
{ audio: base64, visemes: VisemeData[], duration: number }
  ↓
┌─────────────────────┬─────────────────────┐
│ AudioPlayer.play()  │ LipSyncController   │
│ (Web Audio API)     │ .start(visemes)     │
└─────────────────────┴─────────────────────┘
          ↓                      ↓
    音訊播放               useFrame (60 FPS)
                              ↓
                       MouthAnimator
                       .setTarget(blendshape)
                              ↓
                       morphTargetInfluences
                              ↓
                       Three.js 渲染嘴型
```

### 模組依賴圖

```
app/[locale]/page.tsx (首頁)
  ├─→ components/avatar/AvatarCanvas.tsx
  │     ├─→ components/avatar/AvatarModel.tsx
  │     │     ├─→ lib/avatar/loaders.ts
  │     │     └─→ lib/avatar/constants.ts
  │     └─→ components/avatar/hooks/useAvatarAnimation.ts
  │           ├─→ lib/avatar/animations.ts (Blink, Breath, Expression, HeadNod)
  │           └─→ lib/lipsync/controller.ts
  │                 ├─→ lib/lipsync/mouth-animator.ts
  │                 └─→ lib/lipsync/viseme-mapper.ts
  │
  └─→ components/chat/ChatInterface.tsx
        ├─→ stores/chatStore.ts
        │     ├─→ lib/api/chat.ts (SSE 串流)
        │     └─→ stores/audioStore.ts
        │           ├─→ lib/audio/player.ts (Web Audio API)
        │           └─→ lib/lipsync/controller.ts
        │
        └─→ stores/avatarStore.ts
```

### 資料庫依賴

```
prisma/schema.prisma
  ├─→ User (使用者)
  │     ├─→ Account (NextAuth 帳號)
  │     ├─→ Session (NextAuth Session)
  │     ├─→ UserSettings (使用者設定)
  │     ├─→ ActivityLog (活動記錄)
  │     ├─→ Avatar (自訂 Avatar)
  │     ├─→ Conversation (對話歷史)
  │     ├─→ Message (訊息)
  │     ├─→ PromptTemplate (Prompt 模板)
  │     └─→ Knowledge* (6 種知識類型)
  │
  ├─→ VerificationToken (Email 驗證)
  └─→ PasswordResetToken (密碼重設)
```

---

## 關鍵文件索引

### 🔥 最高優先級 (P0)

| 文件路徑 | 說明 | 更新頻率 |
|---------|------|---------|
| `CLAUDE.md` | AI 助手開發規範 | 穩定 |
| `README.md` | 項目首頁 | 穩定 |
| `PROJECT_INDEX.md` | 本文件 | 每週 |
| `docs/mvp/MVP_PROGRESS.md` | MVP 進度追蹤 | 每 Sprint |
| `prisma/schema.prisma` | 資料庫 Schema | 按需 |

### 🌟 核心業務邏輯 (P1)

| 文件路徑 | 說明 | 關鍵程度 |
|---------|------|---------|
| `lib/lipsync/controller.ts` | Lip Sync 核心控制器 | ⭐⭐⭐⭐⭐ |
| `lib/lipsync/mouth-animator.ts` | 嘴型動畫 + 自適應強度 | ⭐⭐⭐⭐⭐ |
| `lib/avatar/animations.ts` | 所有動畫控制器 | ⭐⭐⭐⭐⭐ |
| `components/avatar/hooks/useAvatarAnimation.ts` | 動畫編排 Hook | ⭐⭐⭐⭐⭐ |
| `lib/azure/openai.ts` | Azure OpenAI 整合 | ⭐⭐⭐⭐⭐ |
| `lib/azure/speech.ts` | Azure Speech 整合 | ⭐⭐⭐⭐⭐ |
| `lib/api/chat.ts` | SSE 串流客戶端 | ⭐⭐⭐⭐⭐ |
| `lib/audio/player.ts` | Web Audio 播放器 | ⭐⭐⭐⭐⭐ |

### 📘 重要實作文件 (P2)

| 文件路徑 | 說明 | 用途 |
|---------|------|------|
| `docs/implementation/lip-sync/LIPSYNC_FIXES_2025-10-20.md` | Lip Sync 完整診斷 | 問題排查 |
| `docs/implementation/knowledge-system/KNOWLEDGE_SYSTEM_ISSUES_AND_FIXES.md` | 知識庫問題診斷 | 問題排查 |
| `docs/api/API_REFERENCE_SPRINT2.md` | Sprint 2 API 文件 | API 開發 |
| `docs/deployment/AZURE_DEPLOYMENT.md` | Azure 部署指南 | 部署上線 |

### 🗂️ 歷史參考 (P3)

| 文件路徑 | 說明 | 狀態 |
|---------|------|------|
| `docs/00-archive/planning/prd.md` | 產品需求文件 | 已歸檔 |
| `docs/00-archive/poc/stories/` | POC 階段 Stories | 已歸檔 |
| `docs/00-archive/poc/POC_TECHNICAL_REPORT.md` | POC 技術報告 | 已歸檔 |

---

## 開發工作流程

### 日常開發

1. **啟動開發環境**
   ```bash
   npm run dev
   ```

2. **開發新功能**
   - 查閱 `docs/mvp/MVP_PROGRESS.md` 確認當前 Sprint 任務
   - 閱讀對應的實作指南 (`docs/implementation/`)
   - 遵循 `CLAUDE.md` 開發規範
   - 參考 API 文件 (`docs/api/`)

3. **測試功能**
   - 瀏覽器測試: `http://localhost:3000`
   - 查閱測試指南: `docs/testing/`
   - 執行 Lint: `npm run lint`

4. **更新文件**
   - 功能完成後更新 `docs/mvp/MVP_PROGRESS.md`
   - 如有問題修復，記錄到 `docs/fixes/YYYY-MM-DD-*.md`
   - 同步索引: `npm run sync-index`

### 索引維護

**日常同步** (Story 完成時):
```bash
npm run sync-index
```

**完整重建** (目錄結構改變後):
```bash
npm run generate-index
```

**驗證準確性**:
```bash
npm run validate-index
```

詳細維護指南請參考: `docs/INDEX_MAINTENANCE.md`

### Git 工作流程

1. **檢查狀態**
   ```bash
   git status
   git branch
   ```

2. **提交變更**
   ```bash
   git add .
   git commit -m "feat: Story X.Y - 功能描述"
   git push origin feature/sprint-X
   ```

3. **Commit 訊息規範**
   - `feat`: 新功能
   - `fix`: 錯誤修復
   - `docs`: 文件更新
   - `refactor`: 重構
   - `test`: 測試
   - `chore`: 雜項 (依賴更新等)

---

## 附錄：完整文件列表

### 根目錄

| 檔案 | 狀態 | 大小 | 最後修改 |
|------|------|------|---------|
| .env.local.example | ✅ | 1.4 KB | 2025/10/17 |
| .eslintrc.json | ✅ | 59 B | 2025/10/15 |
| .gitignore | ✅ | 770 B | 2025/10/22 |
| .prettierrc | ✅ | 119 B | 2025/10/15 |
| CLAUDE.md | ✅ | 25.7 KB | 2025/10/22 |
| next.config.js | ✅ | 876 B | 2025/10/20 |
| package-lock.json | ✅ | 709.4 KB | 2025/10/21 |
| package.json | ✅ | 3.7 KB | 2025/10/21 |
| postcss.config.mjs | ✅ | 81 B | 2025/10/14 |
| PROJECT_INDEX.md | ✅ | 本文件 | 2025/10/22 |
| README.md | ✅ | 13.3 KB | 2025/10/22 |
| tailwind.config.ts | ✅ | 2.4 KB | 2025/10/17 |
| tsconfig.json | ✅ | 625 B | 2025/10/15 |

### app/ (詳細列表省略，見上方 API Routes 和頁面路由章節)

### components/ (詳細列表省略，見上方 UI 組件章節)

### lib/ (詳細列表省略，見上方工具函式章節)

### docs/ (詳細列表省略，見上方文件目錄章節)

---

**文件版本**: v3.0 (完全重寫)
**最後更新**: 2025-10-22
**維護者**: Dev Team + Claude Code
**索引品質**: ⭐⭐⭐⭐⭐ (95%+ 完整性)

---

**使用提示**:
- 使用瀏覽器搜尋功能 (Ctrl+F / Cmd+F) 快速定位文件
- 查看 [快速導覽](#快速導覽) 章節快速找到常見任務
- 查看 [架構依賴關係](#架構依賴關係) 理解模組間關係
- 定期執行 `npm run sync-index` 保持索引同步

**記住**: 良好的索引維護是高效團隊協作的基礎 🚀
