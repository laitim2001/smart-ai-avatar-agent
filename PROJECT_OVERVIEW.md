# 專案總覽 (Project Overview)

**專案名稱**: 3D Avatar 即時對話系統
**專案類型**: Greenfield Full-Stack Web Application (POC)
**專案階段**: 規劃完成，準備開發
**版本**: v1.0
**最後更新**: 2025-10-15

---

## 🎯 專案目標

打造類似 **ANAM.ai** 的 3D Avatar 即時對話系統，實現「真人般」的視覺互動體驗，並驗證以下核心技術可行性：

1. ✅ **3D Avatar 真人般視覺呈現** - 使用 Three.js + Ready Player Me
2. ✅ **Azure OpenAI 智能對話** - GPT-4 Turbo 多輪對話
3. ✅ **Azure Speech 自然語音** - 繁體中文 Neural Voice
4. ✅ **Lip Sync 嘴型同步** - 視覺匹配度 ≥ 70%

### 為什麼做這個專案？

**市場機會**:
- 現有 AI 對話系統缺乏「人性化」視覺呈現
- ANAM.ai、D-ID 等方案定價昂貴 (月費 $50-200)
- 市場缺少「平價 + 繁中支援」的解決方案

**技術驗證**:
- POC 階段驗證核心技術整合可行性
- 成本控制驗證 (目標: NT$ 6,600/3個月)
- 為商業決策提供充分技術依據

---

## 🏗️ 系統架構

### 高階架構圖

```
┌─────────────────────────────────────────────────────┐
│                  使用者瀏覽器 (Client)                │
│                                                       │
│  ┌────────────────────────────────────────────────┐ │
│  │          Next.js 前端應用 (App Router)          │ │
│  │                                                  │ │
│  │  ┌──────────────┐  ┌──────────────┐           │ │
│  │  │  UI Layer    │  │   3D Layer   │           │ │
│  │  │  (React)     │  │  (Three.js)  │           │ │
│  │  └──────────────┘  └──────────────┘           │ │
│  │                                                  │ │
│  │  ┌──────────────┐  ┌──────────────┐           │ │
│  │  │ State Layer  │  │  Audio Layer │           │ │
│  │  │  (Zustand)   │  │ (Web Audio)  │           │ │
│  │  └──────────────┘  └──────────────┘           │ │
│  └────────────────────────────────────────────────┘ │
└───────────────────────┬─────────────────────────────┘
                        │ HTTPS / Fetch
                        ↓
┌─────────────────────────────────────────────────────┐
│           Next.js API Routes (Serverless)           │
│                                                       │
│  ┌──────────────┐  ┌──────────────┐  ┌───────────┐ │
│  │ /api/chat    │  │  /api/tts    │  │ /api/stt  │ │
│  │  (SSE 串流)  │  │ (語音合成)    │  │ (選做)    │ │
│  └──────────────┘  └──────────────┘  └───────────┘ │
└───────────────────────┬─────────────────────────────┘
                        │ Azure SDK
                        ↓
┌─────────────────────────────────────────────────────┐
│               Azure 雲端服務層                       │
│                                                       │
│  ┌──────────────────┐  ┌──────────────────────────┐ │
│  │  Azure OpenAI    │  │ Azure Speech Services   │ │
│  │  (GPT-4 Turbo)   │  │  (TTS/STT 繁中語音)     │ │
│  │  East US 區域    │  │  East Asia 區域         │ │
│  └──────────────────┘  └──────────────────────────┘ │
└─────────────────────────────────────────────────────┘
```

### 技術棧總覽

| 層級 | 技術選型 | 版本 | 用途 |
|------|----------|------|------|
| **前端框架** | Next.js (App Router) | 14.2+ | React 全端框架 |
| **3D 渲染** | Three.js | r160+ | 3D 圖形渲染引擎 |
| **React 3D** | React Three Fiber | 8.15+ | Three.js React 整合 |
| **3D 工具** | @react-three/drei | 最新 | Three.js 輔助工具 |
| **狀態管理** | Zustand | 4.5+ | 輕量級全域狀態 |
| **UI 框架** | Tailwind CSS | 3.4+ | CSS 框架 |
| **程式語言** | TypeScript | 5.3+ | 強型別語言 |
| **LLM** | Azure OpenAI Service | - | GPT-4 Turbo |
| **TTS/STT** | Azure Cognitive Services Speech | - | 語音處理 |
| **Avatar** | Ready Player Me | - | 3D Avatar 模型庫 |
| **部署** | Azure Static Web Apps | - | 無伺服器部署平台 |
| **CI/CD** | GitHub Actions | - | 自動化部署 |

---

## 📊 資料流程

### 完整對話流程

```
1. 使用者輸入文字
   ↓
2. POST /api/chat (SSE 串流)
   ↓
3. Azure OpenAI GPT-4 Turbo 處理
   ↓
4. LLM 回應串流顯示 (即時打字機效果)
   ↓
5. POST /api/tts (文字轉語音)
   ↓
6. Azure Speech Services 語音合成
   ↓
7. 返回 MP3 音訊
   ↓
8. Web Audio API 播放 + Viseme 分析
   ↓
9. Avatar Blendshape 嘴型動畫
   ↓
10. 視聽同步的 Avatar 回應
```

### Lip Sync 技術流程

```
TTS Audio (MP3)
   ↓
Web Audio API AnalyserNode
   ↓
音頻頻率分析 (每 100ms)
   ↓
簡化 Viseme 映射
   - 高音量 → aa (張嘴)
   - 中音量 → E (半開)
   - 低音量 → neutral (閉嘴)
   ↓
Viseme Timeline Data
   [{time: 0.0, viseme: 'aa', weight: 1.0},
    {time: 0.1, viseme: 'E', weight: 0.5},
    {time: 0.2, viseme: 'neutral', weight: 0.0}]
   ↓
Avatar Blendshape 驅動
   - aa → mouthOpen (weight 1.0)
   - E → mouthOpen (weight 0.5)
   - neutral → all mouth blendshapes (weight 0.0)
   ↓
嘴型動畫 (with Easing & Smooth Transition)
```

---

## 🎯 POC 成功標準

### 技術指標

| 指標 | 目標值 | 測量方式 |
|------|--------|----------|
| **3D 渲染 FPS** | ≥ 30 | Chrome DevTools Performance |
| **對話延遲** | < 2.5 秒 | 端到端計時 (輸入到語音播放) |
| **Lip Sync 匹配度** | ≥ 70% | 主觀視覺評估 (5 位測試者) |
| **首次載入時間** | < 5 秒 | Lighthouse Performance |
| **記憶體使用** | < 500 MB | Chrome DevTools Memory |
| **瀏覽器相容性** | 4 種瀏覽器 | Chrome, Safari, Edge, Firefox |
| **連續對話** | 10 輪無崩潰 | 手動測試 |

### 成本指標

| 項目 | POC 預算 (3 個月) | MVP 預估 (月) |
|------|-------------------|--------------|
| Azure OpenAI | NT$ 4,800 | NT$ 10,500 |
| Azure Speech | NT$ 1,800 | NT$ 6,000 |
| Azure Static Web Apps | NT$ 0 (免費) | NT$ 0 (免費) |
| **總計** | **NT$ 6,600** | **NT$ 16,500** |

---

## 📅 開發時程

### 總工期

**12 週** (約 3 個月)
**29.5 個開發天數** (假設每天 6 小時有效開發時間)

### Sprint 規劃

| Sprint | 週數 | Epic | Stories | 預估天數 | 關鍵里程碑 |
|--------|------|------|---------|----------|------------|
| **Sprint 1** | 1-2 | Epic 1 + Epic 2 | 10 | 8.5 天 | 3D Avatar 視覺化 ✅ |
| **Sprint 2** | 3-4 | Epic 3 | 7 | 5.5 天 | LLM + TTS 對話功能 ✅ |
| **Sprint 3-4** | 5-6 | Epic 4 | 5 | 5 天 | Lip Sync 嘴型同步 ✅ |
| **Sprint 5-6** | 7-8 | Epic 5 (Part 1) | 3 | 5 天 | 效能優化與 UI/UX ✅ |
| **Sprint 7-8** | 9-10 | Epic 5 (Part 2) | 2 | 3 天 | 瀏覽器測試與部署 ✅ |
| **Sprint 9-10** | 11-12 | Epic 5 (Part 3) | 2 | 2.5 天 | 技術驗證報告 ✅ |
| **總計** | **12 週** | **5 Epics** | **29 Stories** | **29.5 天** | **POC 完成** ✅ |

### 關鍵里程碑

| 日期 | 里程碑 | 完成標準 |
|------|--------|----------|
| **Week 2 (2025-10-28)** | Epic 1-2 完成 | 3D Avatar 可視覺化與動畫 |
| **Week 4 (2025-11-11)** | Epic 3 完成 | 完整對話功能 (文字 + 語音) |
| **Week 6 (2025-11-25)** | Epic 4 完成 | Lip Sync 嘴型同步 ≥ 70% |
| **Week 8 (2025-12-09)** | Epic 5 Part 1 完成 | 效能優化與 UI/UX 完善 |
| **Week 10 (2025-12-23)** | Epic 5 Part 2 完成 | Azure 部署成功 |
| **Week 12 (2026-01-06)** | **POC 完成** | 技術驗證報告與文件齊全 |

---

## 🎨 Epic 與 Stories 總覽

### Epic 1: Foundation & Core Infrastructure (5 Stories, 3.5 天)

**目標**: 建立開發基礎設施

| Story | 標題 | 預估 |
|-------|------|------|
| 1.1 | Next.js 專案初始化與開發環境設定 | 0.5 天 |
| 1.2 | Azure 服務註冊與 SDK 整合 | 1 天 |
| 1.3 | 基礎 UI 框架與全域樣式設定 | 0.5 天 |
| 1.4 | 健康檢查 API 與基本錯誤處理 | 0.5 天 |
| 1.5 | GitHub Actions CI/CD 與 Azure 部署設定 | 1 天 |

---

### Epic 2: 3D Avatar Rendering & Animation (5 Stories, 5 天)

**目標**: 實現 3D Avatar 視覺化

| Story | 標題 | 預估 |
|-------|------|------|
| 2.1 | Three.js 場景初始化與 React Three Fiber 整合 | 1 天 |
| 2.2 | Ready Player Me Avatar 模型載入 | 1 天 |
| 2.3 | Avatar 待機動畫實作（呼吸、眨眼） | 1 天 |
| 2.4 | Avatar 基本表情與頭部動作 | 0.5 天 |
| 2.5 | Avatar 選擇功能與切換 | 1 天 |

---

### Epic 3: LLM Conversation & TTS Integration (7 Stories, 5.5 天)

**目標**: 實現對話功能

| Story | 標題 | 預估 |
|-------|------|------|
| 3.1 | 對話介面 UI 實作 | 0.5 天 |
| 3.2 | Zustand 狀態管理設定 | 0.5 天 |
| 3.3 | Chat API 實作（Azure OpenAI + SSE 串流） | 1 天 |
| 3.4 | 前端 SSE 串流接收與顯示 | 1 天 |
| 3.5 | TTS API 實作（Azure Speech 語音合成） | 1 天 |
| 3.6 | Web Audio API 音訊播放整合 | 0.5 天 |
| 3.7 | 端到端對話流程整合與優化 | 1 天 |

---

### Epic 4: Lip Sync & Audio-Visual Synchronization (5 Stories, 5 天)

**目標**: 實現 Lip Sync

| Story | 標題 | 預估 |
|-------|------|------|
| 4.1 | 音訊分析與 Viseme 數據生成（簡化版） | 1.5 天 |
| 4.2 | Avatar Blendshape 控制與嘴型驅動 | 1 天 |
| 4.3 | Lip Sync Controller 與音訊同步 | 1 天 |
| 4.4 | Lip Sync 視覺優化與調校 | 1 天 |
| 4.5 | Lip Sync 降級方案與錯誤處理 | 0.5 天 |

---

### Epic 5: Polish, Testing & Deployment (7 Stories, 11 天)

**目標**: 優化、測試、部署、驗證

| Story | 標題 | 預估 |
|-------|------|------|
| 5.1 | 效能優化（3D 渲染與音訊） | 2 天 |
| 5.2 | 錯誤處理與使用者體驗完善 | 1.5 天 |
| 5.3 | UI/UX 細節打磨 | 1.5 天 |
| 5.4 | 瀏覽器相容性測試 | 2 天 |
| 5.5 | Azure Static Web Apps 生產部署 | 1 天 |
| 5.6 | 技術驗證報告撰寫 | 1.5 天 |
| 5.7 | 使用文件與部署指南 | 1 天 |

---

## 📁 專案文件結構

### 核心文檔 (已完成 100%)

```
C:\smart-ai-avatar-agent\
├── PROJECT_OVERVIEW.md           ✅ 專案總覽 (本文件)
├── DEVELOPMENT_ROADMAP.md        ✅ 開發路線圖
├── QUICK_START.md                ✅ 快速開始指南
├── PROJECT_STATUS.md             ✅ 當前進度總覽
├── docs/
│   ├── prd.md                    ✅ 產品需求文件 (1,004 行)
│   ├── architecture.md           ✅ 系統架構文件 (2,213 行)
│   ├── front-end-spec.md         ✅ 前端規格 (1,174 行)
│   ├── po-validation-report.md   ✅ PO 驗證報告 (2,500+ 行)
│   ├── sprint-planning.md        ✅ Sprint 規劃 (480 行)
│   ├── project-brief.md          ✅ 專案簡介 (535 行)
│   ├── tech-research.md          ✅ 技術研究 (~8,000 字)
│   ├── tech-comparison-matrix.md ✅ 技術對照表 (~3,000 字)
│   ├── cost-analysis.md          ✅ 成本分析 (~2,500 字)
│   └── stories/                  ✅ 所有 Story 文檔 (29 個)
│       ├── 1.1.next-js-project-init.md
│       ├── 1.2.azure-services-setup.md
│       ├── ... (Epic 1-5 所有 Stories)
│       ├── epic-1-validation-report.md
│       ├── epic-1-po-review-request.md
│       └── ... (所有 Epic 驗證報告)
└── README.md                     ✅ 專案文件索引
```

**文檔統計**:
- ✅ 核心規劃文檔: 11 個
- ✅ Story 詳細文檔: 29 個
- ✅ Validation Reports: 5 個
- ✅ PO Review Requests: 5 個
- ✅ **總計**: **50+ 個文檔**
- ✅ **總字數/行數**: **50,000+ 行**

---

## 🚀 當前狀態與下一步

### 當前狀態

```
Phase 1: 技術研究            ✅ 100% 完成
Phase 2: 產品規劃 (PRD)      ✅ 100% 完成
Phase 3: 架構設計            ✅ 100% 完成
Phase 4: Story 詳細拆分      ✅ 100% 完成 (29 Stories)
Phase 5: Sprint 規劃         ✅ 100% 完成 (Sprint 1-10)
Phase 6: PO 審核批准         ✅ 100% 完成 (Epic 1-5 已批准)

當前階段: 準備開始開發 🚀
下一步: Story 1.1 專案初始化
```

### 立即行動

**今天 (2025-10-15)**:
1. ✅ 執行 Story 1.1: Next.js 專案初始化
2. ✅ 註冊 Azure OpenAI + Speech Services
3. ✅ 配置開發環境與工具

**本週 (Week 1)**:
- 完成 Epic 1 全部 5 個 Stories
- 建立專案基礎架構
- 配置 CI/CD Pipeline

**本月 (Month 1)**:
- 完成 Sprint 1-2 (Epic 1-3)
- 實現 3D Avatar + 完整對話功能

---

## 🎓 學習資源

### 技術文檔

- **Next.js**: https://nextjs.org/docs
- **Three.js**: https://threejs.org/docs/
- **React Three Fiber**: https://docs.pmnd.rs/react-three-fiber
- **Azure OpenAI**: https://learn.microsoft.com/azure/ai-services/openai/
- **Azure Speech**: https://learn.microsoft.com/azure/ai-services/speech-service/
- **Tailwind CSS**: https://tailwindcss.com/docs
- **Zustand**: https://docs.pmnd.rs/zustand
- **TypeScript**: https://www.typescriptlang.org/docs/

### 競品參考

- **ANAM.ai**: https://anam.ai - 主要參考對象
- **D-ID**: https://www.d-id.com - AI 數位人技術
- **Synthesia**: https://www.synthesia.io - AI 視訊生成
- **HeyGen**: https://www.heygen.com - AI 視訊翻譯

---

## 👥 團隊角色

| 角色 | 負責人 | 職責 |
|------|--------|------|
| **Product Owner** | Sarah | 產品需求管理、優先級決策 |
| **Scrum Master** | Bob | Sprint 規劃、進度追蹤 |
| **Product Manager** | John | PRD 撰寫、需求分析 |
| **Architect** | Winston | 系統架構設計 |
| **UX Expert** | Sally | 前端規格、UI/UX 設計 |
| **Developer** | AI Agent | 實際開發實作 |
| **QA** | Quinn | 測試與品質保證 |

---

## 📞 快速導航

| 想要... | 請參考... |
|---------|-----------|
| **5 分鐘快速開始** | [QUICK_START.md](QUICK_START.md) |
| **了解開發路線圖** | [DEVELOPMENT_ROADMAP.md](DEVELOPMENT_ROADMAP.md) |
| **查看 Sprint 規劃** | [docs/sprint-planning.md](docs/sprint-planning.md) |
| **閱讀產品需求** | [docs/prd.md](docs/prd.md) |
| **查看系統架構** | [docs/architecture.md](docs/architecture.md) |
| **查看當前進度** | [PROJECT_STATUS.md](PROJECT_STATUS.md) |
| **查看所有 Stories** | [docs/stories/](docs/stories/) |

---

## ⚠️ 重要提醒

### POC 限制

本專案為 **POC (概念驗證)** 階段，專注於技術驗證，以下功能**不包含**：

- ❌ 用戶註冊/登入系統
- ❌ 個人化角色庫
- ❌ 聊天記錄儲存
- ❌ 多語言支援 (僅繁體中文)
- ❌ 行動裝置 App
- ❌ 多用戶並行

這些功能將在 **MVP 階段** 加入。

### 技術風險

| 風險 | 緩解策略 |
|------|----------|
| **Lip Sync 準確度不達標** | 準備降級方案 (僅播放語音) |
| **3D 渲染效能不足** | 降低模型 LOD、優化燈光 |
| **Safari 瀏覽器相容性** | 準備 Safari 特定 Workarounds |
| **Azure 成本超支** | 設定 Cost Alert、限制 Token 長度 |

---

## 🎉 專案願景

**短期目標 (3 個月)**:
- ✅ 完成 POC 技術驗證
- ✅ 驗證核心技術可行性
- ✅ 成本控制在 NT$ 6,600 以內
- ✅ 提供 Go/No-Go 決策依據

**中期目標 (6 個月)**:
- 🎯 MVP 上線 (加入用戶系統、角色庫)
- 🎯 獲得首批 10 個付費使用者
- 🎯 驗證商業模式

**長期願景 (1 年)**:
- 🌟 建立「平價 + 繁中」AI Avatar 平台
- 🌟 服務中小企業與內容創作者
- 🌟 月活躍用戶 1,000+
- 🌟 成為 ANAM.ai 的低價替代方案

---

**專案狀態**: ✅ 規劃完成，準備開發
**文件版本**: v1.0
**最後更新**: 2025-10-15
**負責人**: Bob (Scrum Master)

---

**🚀 讓我們開始建造吧！**
