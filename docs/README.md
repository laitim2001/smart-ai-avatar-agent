# 3D Avatar 即時對話系統 - POC 專案文件

## 📚 專案概述

本專案旨在建立一個類似 **ANAM.ai** 的 3D Avatar 即時對話系統，實現真人般的視覺呈現與語音互動。目前處於 **POC（概念驗證）階段**，已完成完整的技術研究、產品規劃與架構設計。

### 核心功能

- ✅ **3D Avatar 渲染** - 真人般的 3D 虛擬角色顯示
- ✅ **即時 LLM 對話** - 使用 Azure OpenAI 進行智能對話
- ✅ **語音合成 (TTS)** - 將文字轉換為自然語音
- ✅ **嘴型同步 (Lip Sync)** - Avatar 嘴型與語音精確同步
- ⏳ **語音辨識 (STT)** - 選做功能

---

## 📂 文件索引

### 核心規劃文件（必讀）

| 文件 | 說明 | 字數 | 狀態 |
|-----|------|------|------|
| [plan.md](../plan.md) | 📋 專案總體計畫與時程 | - | ✅ 完成 |
| [log.md](../log.md) | 📝 完整工作日誌記錄 | - | ✅ 持續更新 |

### Phase 1: 技術研究（已完成）

| 文件 | 說明 | 字數 | 狀態 |
|-----|------|------|------|
| [tech-research.md](./tech-research.md) | 🔬 完整技術研究報告 | ~8,000 | ✅ 完成 |
| [tech-comparison-matrix.md](./tech-comparison-matrix.md) | 📊 技術方案對照表 | ~3,000 | ✅ 完成 |
| [cost-analysis.md](./cost-analysis.md) | 💰 成本效益分析 | ~2,500 | ✅ 完成 |

**關鍵成果**:
- ✅ 推薦技術棧確定（Next.js + Three.js + Azure）
- ✅ 成本預估完成（POC: NT$4,492/月）
- ✅ 技術可行性驗證（高度可行）

### Phase 2: POC 需求規劃（已完成）

| 文件 | 說明 | 字數 | 狀態 |
|-----|------|------|------|
| [poc-prd.md](./poc-prd.md) | 📋 POC 產品需求文件 | ~6,000 | ✅ 完成 |

**關鍵成果**:
- ✅ 5 大核心功能明確定義
- ✅ POC 成功標準設定（FPS、延遲、同步準確度）
- ✅ 4 週 Sprint 時程規劃
- ✅ 排除產品化功能（專注技術驗證）

### Phase 3: 架構設計（已完成）

| 文件 | 說明 | 字數 | 狀態 |
|-----|------|------|------|
| [poc-architecture.md](./poc-architecture.md) | 🏗️ POC 技術架構文件 | ~8,500 | ✅ 完成 |

**關鍵成果**:
- ✅ 系統架構設計（前端、後端、Azure 三層）
- ✅ API 規格定義（/api/chat, /api/tts, /api/stt）
- ✅ 資料流設計（完整端到端流程）
- ✅ Lip Sync 技術方案
- ✅ 部署架構（Azure Static Web Apps）

### Phase 4: POC 開發（待執行）

**Sprint 規劃**:
- Sprint 0: 專案初始化與環境設定
- Sprint 1: 3D Avatar 渲染與基礎動畫
- Sprint 2: LLM 對話 + TTS 語音播放
- Sprint 3: Lip Sync 嘴型同步功能
- Sprint 4: 整合、優化、錯誤處理

---

## 🎯 POC 成功標準

| 指標 | 目標值 | 測試方式 |
|-----|--------|---------|
| **3D 渲染 FPS** | ≥ 30 FPS | Chrome DevTools Performance |
| **對話延遲** | < 2.5 秒 | 端到端計時 |
| **Lip Sync 匹配** | ≥ 70% | 視覺評估 |
| **瀏覽器支援** | Chrome, Edge, Safari | 手動測試 |
| **連續對話** | 10 輪無崩潰 | 手動測試 |

---

## 🛠️ 技術棧總覽

### 前端技術

| 技術 | 版本 | 用途 |
|-----|------|------|
| **Next.js** | 14 (App Router) | React 全端框架 |
| **Three.js** | 最新穩定版 | 3D 渲染引擎 |
| **React Three Fiber** | 最新穩定版 | React 整合 Three.js |
| **Zustand** | 最新版 | 狀態管理 |
| **TypeScript** | 5+ | 型別安全 |

### 後端與雲端服務

| 服務 | 用途 |
|-----|------|
| **Azure OpenAI Service** | LLM 對話（GPT-4 Turbo）|
| **Azure Cognitive Services** | TTS/STT 語音處理 |
| **Azure Static Web Apps** | 應用程式託管 |
| **Ready Player Me** | 3D Avatar 模型來源 |

### Lip Sync 技術

- **POC 階段**: Web Audio API + 音素映射表
- **進階方案**: Rhubarb Lip Sync / Azure Viseme Output

---

## 📊 成本預估

### POC 階段（3 個月）

| 項目 | 月成本 | 3 個月總計 |
|-----|--------|-----------|
| Azure OpenAI | NT$ 1,600 | NT$ 4,800 |
| Azure Speech | NT$ 600 | NT$ 1,800 |
| Azure Static Web Apps | NT$ 0 | NT$ 0 |
| **總計** | **NT$ 2,200** | **NT$ 6,600** |

### MVP 階段（預估）

月成本約 **NT$ 47,382**（假設 1,000 活躍用戶）

詳細成本分析請參考 [cost-analysis.md](./cost-analysis.md)

---

## 🏗️ 系統架構

### 高階架構

```
┌─────────────────────────────────────────┐
│          使用者瀏覽器 (Client)            │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │   Next.js 前端應用              │   │
│  │   - UI Layer (React)            │   │
│  │   - 3D Rendering (Three.js)     │   │
│  │   - Audio Processing            │   │
│  └─────────────────────────────────┘   │
└─────────────────┬───────────────────────┘
                  │ HTTPS/Fetch
                  ↓
┌─────────────────────────────────────────┐
│       Next.js API Routes (後端)         │
│   - /api/chat (SSE 串流)                │
│   - /api/tts (語音合成)                 │
│   - /api/stt (語音辨識，選做)           │
└─────────────────┬───────────────────────┘
                  │ Azure SDK
                  ↓
┌─────────────────────────────────────────┐
│           Azure 雲端服務                 │
│   - Azure OpenAI (LLM)                  │
│   - Azure Speech (TTS/STT)              │
└─────────────────────────────────────────┘
```

### 資料流程

```
使用者輸入文字 
  → LLM (Azure OpenAI, SSE 串流) 
  → TTS (Azure Speech) 
  → 音訊播放 + Lip Sync 分析 
  → Avatar 嘴型動畫
```

完整架構說明請參考 [poc-architecture.md](./poc-architecture.md)

---

## 🚀 快速開始（開發階段待執行）

### 前置需求

- Node.js 18+
- Azure 帳號（OpenAI + Speech Services）
- Git

### 專案初始化

```bash
# 創建 Next.js 專案
npx create-next-app@latest avatar-chat-poc --typescript --app --tailwind

# 安裝核心依賴
cd avatar-chat-poc
npm install three @react-three/fiber @react-three/drei
npm install zustand
npm install @azure/openai microsoft-cognitiveservices-speech-sdk
```

### 環境變數設定

```bash
# .env.local
AZURE_OPENAI_API_KEY=your_key_here
AZURE_OPENAI_ENDPOINT=https://your-resource.openai.azure.com/
AZURE_SPEECH_KEY=your_speech_key
AZURE_SPEECH_REGION=eastasia
```

### 執行專案

```bash
npm run dev
# 開啟 http://localhost:3000
```

---

## 📅 專案時程

| 階段 | 時間 | 狀態 |
|-----|------|------|
| **Phase 1: 技術研究** | 2025-10-14 | ✅ 完成 |
| **Phase 2: POC PRD** | 2025-10-14 | ✅ 完成 |
| **Phase 3: 架構設計** | 2025-10-14 | ✅ 完成 |
| **Phase 4: POC 開發** | 1-2 週 | ⏳ 待執行 |
| **Phase 5: 測試與決策** | 1 天 | ⏳ 待執行 |

**總計**: 約 3-4 週完成技術驗證

---

## 📈 當前進度

### ✅ 已完成（100%）

**規劃階段（Phase 1-3）**:
- ✅ 深度技術研究（8,000+ 字報告）
- ✅ 技術方案對照（9 大類比較）
- ✅ 成本效益分析（詳細拆解）
- ✅ POC PRD（6,000+ 字）
- ✅ POC 架構設計（8,500+ 字）

**文件總產出**: 22,500+ 字的完整技術文件

### 🔄 進行中（0%）

**開發階段（Phase 4）**:
- [ ] Sprint 0: 專案初始化
- [ ] Sprint 1: 3D Avatar 渲染
- [ ] Sprint 2: LLM + TTS 整合
- [ ] Sprint 3: Lip Sync 實作
- [ ] Sprint 4: 整合測試

### ⏳ 待執行

**測試與決策（Phase 5）**:
- [ ] 功能測試
- [ ] 效能測試
- [ ] Azure 部署測試
- [ ] POC 評估與決策

---

## 🎓 學習資源

### 官方文件

- [Next.js 文件](https://nextjs.org/docs)
- [Three.js 教學](https://threejs.org/docs/)
- [React Three Fiber](https://docs.pmnd.rs/react-three-fiber)
- [Azure OpenAI](https://learn.microsoft.com/azure/ai-services/openai/)
- [Azure Speech](https://learn.microsoft.com/azure/ai-services/speech-service/)

### 競品參考

- [ANAM.ai](https://anam.ai) - 主要參考對象
- [D-ID](https://www.d-id.com) - AI 數位人技術
- [Synthesia](https://www.synthesia.io) - AI 視訊生成
- [HeyGen](https://www.heygen.com) - AI 視訊翻譯

---

## ⚠️ POC 限制

本 POC 專注於**技術驗證**，以下功能不包含：

- ❌ 用戶註冊/登入系統
- ❌ 個人化角色庫
- ❌ 聊天記錄儲存
- ❌ 多語言支援（僅繁體中文）
- ❌ 行動裝置 App
- ❌ 多用戶並行

這些功能將在 MVP 階段加入。

---

## 🤝 貢獻

目前為內部 POC 專案，暫不開放外部貢獻。

---

## 📧 聯絡資訊

專案負責人: [待填入]  
技術架構師: Winston (AI Agent)  
產品經理: John (AI Agent)  
業務分析師: Mary (AI Agent)

---

## 📝 授權

[待定義]

---

**最後更新**: 2025-10-14  
**文件版本**: v1.0  
**專案狀態**: POC 規劃階段完成，準備進入開發

