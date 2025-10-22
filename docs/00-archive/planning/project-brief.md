# Project Brief: 3D Avatar 即時對話系統

**文件版本**: v1.0  
**建立日期**: 2025-10-14  
**負責人**: Business Analyst (Mary)  
**專案類型**: Greenfield Full-Stack Application (Web App / SaaS)

---

## Executive Summary

我們正在建立一個**即時 3D Avatar 對話系統**，讓使用者能與逼真的虛擬角色進行自然的語音與文字對話。這個系統結合了先進的 3D 渲染技術、大型語言模型（LLM）、語音合成（TTS）與語音辨識（STT），並透過精準的 Lip Sync 技術實現真人般的視覺體驗。

目標市場包括**企業客服、教育培訓、醫療諮詢、娛樂互動**等領域的專業使用者。核心價值主張是提供「比傳統聊天機器人更具人性化、比真人客服更具擴展性」的 AI 互動解決方案。

---

## Problem Statement

### 現狀與痛點

當前的 AI 互動系統存在以下問題：

1. **傳統文字聊天機器人缺乏人性化**
   - 使用者體驗冷冰冰，缺乏情感連結
   - 純文字互動效率低，難以建立信任感
   - 無法傳達非語言訊息（表情、語氣）

2. **現有語音助理缺乏視覺呈現**
   - Siri、Alexa 等僅有聲音，沒有視覺形象
   - 使用者難以產生「對話感」
   - 無法應用於需要視覺互動的場景（如教學、諮詢）

3. **真人客服/教師成本高且難以擴展**
   - 人力成本隨規模線性增長
   - 無法 24/7 全天候服務
   - 品質不一致，依賴個人能力

### 影響程度

- **企業成本**: 客服人力成本每年高達數百萬至數千萬台幣
- **用戶體驗**: 70% 使用者表示更願意與「有臉」的 AI 互動（參考 D-ID 研究）
- **市場缺口**: 目前市場上類似 ANAM.ai 的解決方案仍處早期階段，定價昂貴

### 為何現有解決方案不足

| 解決方案類型 | 不足之處 |
|------------|---------|
| **ANAM.ai** | 價格昂貴（每月 $50-200/user），企業級門檻高 |
| **D-ID** | 僅提供影片生成，非即時互動 |
| **Synthesia** | 預錄影片為主，缺乏即時對話能力 |
| **HeyGen** | 專注於影片翻譯，非對話系統 |
| **傳統 Chatbot** | 無視覺呈現，體驗差 |

### 迫切性

- **AI 技術成熟**: GPT-4、Neural TTS 等技術已成熟可用
- **市場需求爆發**: 疫情後遠端互動需求激增
- **競爭窗口**: 市場仍處早期，先行者優勢明顯

---

## Proposed Solution

### 核心概念

建立一個**網頁版即時 3D Avatar 對話平台**，使用者無需安裝 App，透過瀏覽器即可：

1. **選擇或自訂 3D Avatar**（使用 Ready Player Me）
2. **透過文字或語音與 Avatar 對話**（整合 Azure OpenAI + Speech Services）
3. **Avatar 以自然語音回應，並同步嘴型動作**（Lip Sync 技術）
4. **感受像視訊通話般的真實互動體驗**

### 關鍵差異化優勢

| 我們的方案 | 競品 |
|----------|------|
| ✅ **即時互動** | 多為預錄影片或有延遲 |
| ✅ **可自訂 Avatar** | 固定角色或需付費定製 |
| ✅ **網頁版，零安裝** | 多數需下載 App |
| ✅ **支援繁體中文** | 主要支援英文 |
| ✅ **成本優化設計** | 企業級定價昂貴 |

### 為何我們會成功

1. **技術可行性已驗證**
   - Phase 1 技術研究確認所有核心技術可行
   - Azure 雲端服務提供穩定基礎設施
   - 成本可控（POC: NT$4,492/月）

2. **市場定位明確**
   - 不與 ANAM.ai 正面競爭（企業級市場）
   - 專注「中小企業 + 個人開發者」市場
   - 提供更具成本效益的解決方案

3. **快速迭代能力**
   - MVP 4 週完成技術驗證
   - 基於 Azure 雲端，易於擴展
   - Next.js 全端架構，開發效率高

### 高階產品願景

> 成為「最易用、最具成本效益的 AI Avatar 互動平台」，讓任何企業或個人都能輕鬆建立自己的虛擬代言人或 AI 助手。

---

## Target Users

### Primary User Segment: 中小企業 IT 決策者

**人口/企業特徵**:
- 企業規模: 10-200 人
- 產業: 電商、教育、客服、醫療諮詢
- 職位: CTO、IT 主管、數位轉型負責人
- 地區: 台灣、香港、新加坡（繁體中文市場）

**現有行為與工作流程**:
- 正在使用或評估 AI 客服解決方案
- 對成本敏感，希望找到高 CP 值方案
- 重視使用者體驗與品牌形象
- 需要快速部署，不希望長期開發

**具體需求與痛點**:
- ❌ 傳統 Chatbot 體驗差，客戶滿意度低
- ❌ 真人客服成本高，難以 24/7 營運
- ❌ 現有 AI Avatar 方案太貴（月費破萬）
- ✅ 需要「看起來專業、用起來便宜」的解決方案

**目標**:
- 提升客戶服務品質
- 降低客服人力成本 30-50%
- 建立品牌差異化形象
- 快速測試 AI 應用效益

### Secondary User Segment: 內容創作者 / 獨立開發者

**人口特徵**:
- 年齡: 25-40 歲
- 背景: YouTuber、線上講師、獨立遊戲開發者
- 技術能力: 具基礎程式能力或願意學習

**現有行為**:
- 經營個人品牌或內容平台
- 希望增加粉絲互動
- 尋找創新的內容呈現方式

**需求**:
- 建立個人化 AI Avatar 作為「虛擬分身」
- 與粉絲 24/7 互動（即使本人不在線）
- 低成本（願意付月費，但需在 NT$1,000 以內）

---

## Goals & Success Metrics

### Business Objectives

- **市場驗證**: POC 階段（4 週內）完成技術驗證，確認產品可行性
- **MVP 上線**: 3 個月內推出可用 MVP，獲得首批 10 個付費使用者
- **成本效益**: 確保 MVP 階段月成本 < NT$50,000，單位經濟效益可持續
- **產品定價**: 定價策略確立（目標: 月費 NT$1,500-5,000/企業用戶）

### User Success Metrics

- **互動品質**: 使用者對話滿意度 ≥ 4.0/5.0（主觀評分）
- **技術表現**: 端到端對話延遲 < 2.5 秒，Lip Sync 視覺匹配度 ≥ 70%
- **使用頻率**: 活躍使用者每週至少使用 3 次
- **留存率**: 30 天留存率 ≥ 40%

### Key Performance Indicators (KPIs)

| KPI | 定義 | POC 目標 | MVP 目標 |
|-----|------|---------|---------|
| **技術可行性** | 所有核心功能正常運作 | 100% | 100% |
| **渲染效能** | 3D Avatar FPS | ≥ 30 FPS | ≥ 60 FPS |
| **對話延遲** | 文字輸入到語音播放 | < 2.5 秒 | < 1.5 秒 |
| **Lip Sync 準確度** | 視覺匹配度 | ≥ 70% | ≥ 85% |
| **使用者獲取** | 註冊使用者數 | N/A（無註冊） | 100 人 |
| **付費轉換率** | Free → Paid | N/A | ≥ 10% |

---

## MVP Scope

### Core Features (Must Have)

- **F1: 3D Avatar 即時渲染與基礎動畫**
  - 使用 Ready Player Me 提供預設 Avatar 選項（3-5 個）
  - 在瀏覽器中流暢渲染（30 FPS+）
  - 包含待機動畫（呼吸、眨眼、微笑）
  - _理由_: 視覺呈現是核心價值，必須優先確保

- **F2: LLM 即時對話（文字輸入）**
  - 整合 Azure OpenAI（GPT-4 Turbo）
  - 支援多輪對話，保留上下文
  - SSE 串流回應，即時顯示
  - _理由_: 智能對話是產品核心，技術已成熟

- **F3: TTS 語音播放**
  - 使用 Azure Speech Services（繁體中文 Neural Voice）
  - 自動將 LLM 回應轉為語音
  - 流暢播放，支援暫停/繼續
  - _理由_: 語音互動提升沉浸感

- **F4: Lip Sync 嘴型同步**
  - 分析語音產生 viseme 數據
  - 驅動 Avatar 嘴型動作
  - 視覺上至少 70% 匹配度
  - _理由_: 關鍵差異化功能，實現「真人感」

- **F5: 簡易對話介面**
  - 文字輸入框
  - 對話歷史顯示（最近 5 則）
  - Loading 狀態提示
  - _理由_: 基本 UI 讓使用者能測試功能

### Out of Scope for MVP

- ❌ 用戶註冊/登入系統（POC 無需，MVP 加入）
- ❌ 個人化 Avatar 自訂（僅提供預設選項）
- ❌ 角色庫管理與儲存
- ❌ 多語言支援（僅支援繁體中文）
- ❌ 語音輸入（STT）- 選做功能，時間允許再加
- ❌ Avatar 表情變化（情緒識別）
- ❌ 多用戶並行支援
- ❌ 行動裝置 App（僅網頁版）
- ❌ 聊天記錄匯出功能
- ❌ 進階分析儀表板

### MVP Success Criteria

**技術成功標準**:
1. ✅ 所有 5 大核心功能可正常運作
2. ✅ 主流瀏覽器（Chrome, Edge, Safari）正常支援
3. ✅ 連續對話 10 輪無崩潰或錯誤
4. ✅ Azure 部署成功，可公開存取

**商業成功標準**:
1. ✅ 至少 3 個潛在客戶表示願意付費使用
2. ✅ 使用者測試平均滿意度 ≥ 3.5/5.0
3. ✅ 單位成本（$/對話）在可接受範圍（< NT$5/對話）

---

## Post-MVP Vision

### Phase 2 Features（MVP 後 3-6 個月）

- **個人化 Avatar 系統**
  - 使用者上傳照片生成專屬 Avatar（整合 Ready Player Me Pro）
  - 角色庫管理，儲存多個 Avatar

- **語音輸入（STT）**
  - 完整語音互動體驗
  - 支援繁中語音辨識

- **多語言支援**
  - 英文、日文、簡中
  - 自動語言偵測

- **情緒識別與表情**
  - 根據對話內容自動調整 Avatar 表情
  - 喜悅、驚訝、同情等基本情緒

### Long-term Vision（1-2 年）

> **成為亞太地區領先的 AI Avatar 互動平台**

- **企業級功能**
  - 多租戶支援
  - 自訂訓練模型（Fine-tuning）
  - 進階分析與報表

- **垂直領域解決方案**
  - 教育版（AI 虛擬教師）
  - 客服版（企業知識庫整合）
  - 醫療版（符合 HIPAA/GDPR）

- **生態系統建立**
  - API 開放，讓開發者整合
  - Marketplace 讓創作者販售 Avatar
  - 社群與知識庫建立

### Expansion Opportunities

- **B2B SaaS 模式**: 提供白標解決方案給大型企業
- **API 服務**: 讓其他產品整合 AI Avatar 功能
- **硬體整合**: 與智能硬體廠商合作（智慧音箱、機器人）
- **內容平台**: 讓創作者建立 AI 虛擬網紅

---

## Technical Considerations

### Platform Requirements

- **Target Platforms**: 
  - 網頁版（優先）: Chrome, Edge, Safari, Firefox
  - 響應式設計，但優先桌機版體驗
  - 未來: iOS/Android App（使用 React Native）

- **Browser/OS Support**:
  - Chrome 90+（主要測試）
  - Edge 90+
  - Safari 14+
  - 不支援 IE（已終止支援）

- **Performance Requirements**:
  - 3D 渲染: 30 FPS（桌機）, 60 FPS（理想）
  - 首次載入: < 5 秒
  - 端到端對話延遲: < 2.5 秒
  - 記憶體使用: < 500 MB

### Technology Preferences

基於 Phase 1 技術研究成果：

- **Frontend**: 
  - Next.js 14（App Router + TypeScript）
  - Three.js + React Three Fiber（3D 渲染）
  - Zustand（狀態管理）

- **Backend**:
  - Next.js API Routes（簡化架構，單體部署）
  - Server-Sent Events (SSE) 用於 LLM 串流

- **Database**: 
  - POC 階段: 無需資料庫
  - MVP 階段: Azure Cosmos DB（NoSQL，適合儲存角色與對話）

- **Hosting/Infrastructure**:
  - Azure Static Web Apps（前端 + API）
  - Azure OpenAI Service
  - Azure Cognitive Services (Speech)

### Architecture Considerations

- **Repository Structure**: 
  - Monorepo（使用 Turborepo 或 Nx，未定）
  - 前後端同一 repo，簡化開發

- **Service Architecture**:
  - POC/MVP: Monolith（Next.js 一體）
  - 未來: 可拆分為 Frontend + API Service（依需求）

- **Integration Requirements**:
  - Azure OpenAI: GPT-4 Turbo via REST API
  - Azure Speech: TTS/STT via SDK
  - Ready Player Me: Avatar 模型載入 via SDK

- **Security/Compliance**:
  - HTTPS 強制（Azure 自動提供）
  - API Key 透過環境變數管理
  - POC 無需進階安全（無用戶資料）
  - MVP 需加入基本認證（Azure AD B2C 或 Auth0）

---

## Constraints & Assumptions

### Constraints

- **Budget**: 
  - POC: NT$6,600（Azure 3 個月）
  - MVP: NT$50,000/月（包含人力與雲端成本）
  - 需控制 Azure OpenAI 與 Speech API 用量

- **Timeline**:
  - POC: 4 週完成技術驗證
  - MVP: 3 個月完成可用產品
  - 無法延遲（需搶佔市場先機）

- **Resources**:
  - 開發人力: 1 名全端工程師（或 AI Agent 輔助開發）
  - 無專職設計師（使用預設 UI 與 Tailwind CSS）
  - 無專職 QA（開發者自行測試 + 少量使用者測試）

- **Technical**:
  - 必須使用 Azure 雲端（技術棧已確定）
  - 瀏覽器限制: 需支援 WebGL（舊裝置可能無法使用）
  - 網路需求: 需穩定網路連線（音訊串流）

### Key Assumptions

- Azure OpenAI 與 Speech Services 價格保持穩定（無大幅漲價）
- Ready Player Me 免費層功能足夠 POC/MVP 使用
- 使用者裝置效能足以渲染 3D Avatar（中階電腦/筆電）
- 繁體中文市場對 AI Avatar 有需求（基於競品市場反應）
- Next.js + Azure 的技術組合穩定可靠
- 開發者（或 AI Agent）具備 TypeScript、Three.js、Azure 相關技能
- Lip Sync 70% 準確度已足夠提供良好體驗（無需 90%+）

---

## Risks & Open Questions

### Key Risks

- **技術風險: Lip Sync 準確度不足**
  - **影響**: 視覺體驗差，失去核心差異化
  - **機率**: 中等
  - **緩解**: 降級方案 - 僅播放語音，關閉 Lip Sync

- **成本風險: Azure 費用超支**
  - **影響**: 商業模式不可持續
  - **機率**: 中等
  - **緩解**: 設定成本警報，限制每日 API 呼叫次數，優化 prompt 減少 token 用量

- **市場風險: 目標用戶不願付費**
  - **影響**: 無法商業化
  - **機率**: 低-中
  - **緩解**: MVP 前進行使用者訪談，驗證付費意願

- **技術風險: 3D 渲染在低階裝置效能差**
  - **影響**: 部分用戶無法使用
  - **機率**: 低
  - **緩解**: 提供 2D Avatar 降級選項，或純語音模式

- **競爭風險: 大廠快速跟進（如 Google, Microsoft）**
  - **影響**: 市場壓縮
  - **機率**: 低（短期）
  - **緩解**: 快速佔領利基市場，建立品牌忠誠度

### Open Questions

- **定價策略**: 應採用訂閱制（月費）還是用量計費（$/對話）？
- **Avatar 數量**: MVP 應提供幾個預設 Avatar 選項？（3 個？5 個？10 個？）
- **語音選擇**: 是否允許用戶選擇不同語音（男聲/女聲/兒童聲）？
- **對話長度限制**: 是否需限制單次對話輪數或時長（防濫用）？
- **資料留存**: 是否儲存對話記錄？若是，保留多久？
- **白標需求**: 企業客戶是否需要移除我們的品牌（白標方案）？

### Areas Needing Further Research

- **Lip Sync 深度技術**: Rhubarb Lip Sync vs. Azure Viseme Output - 哪個更適合繁中？
- **STT 準確度**: Azure Speech vs. Google Cloud vs. Whisper - 繁中辨識率測試
- **3D 優化**: LOD（細節層次）策略，如何在低階裝置保持流暢？
- **用戶調研**: 深度訪談潛在企業客戶，確認核心需求與痛點
- **競品追蹤**: ANAM.ai 定價策略更新，新進競爭者監控

---

## Appendices

### A. Research Summary

本專案已完成深入的技術可行性研究（Phase 1），關鍵發現包括：

**競品分析**:
- **ANAM.ai**: 市場領導者，但定價高（$50-200/user/month），企業級定位
- **D-ID**: 專注影片生成，非即時互動
- **Synthesia**: 預錄影片為主，缺乏對話能力
- **HeyGen**: 影片翻譯為主，非對話系統
- **Microsoft Avatar**: 企業級解決方案，需大量客製化

**技術方案評估**:
- **3D 渲染**: Three.js + Ready Player Me - 成熟且成本低
- **LLM**: Azure OpenAI GPT-4 Turbo - 品質佳，整合簡單
- **TTS/STT**: Azure Speech Services - 支援繁中，品質優
- **Lip Sync**: Web Audio API（POC）→ Rhubarb/Azure Viseme（進階）

**成本分析**:
- POC 階段: NT$4,492/月
- MVP 階段: NT$47,382/月（1,000 活躍用戶假設）
- 可透過優化 prompt、快取、降低 FPS 等方式降低成本

**技術可行性結論**: ✅ 所有核心技術已驗證可行，無重大技術障礙

### B. Stakeholder Input

- **技術團隊**: 確認技術棧可行，建議優先 POC 驗證 Lip Sync
- **潛在客戶**: 表示願意測試，但需證明體驗優於現有 Chatbot
- **投資人**: 關注成本控制與商業模式可持續性

### C. References

**技術文件**:
- [docs/tech-research.md](./tech-research.md) - 完整技術研究報告
- [docs/tech-comparison-matrix.md](./tech-comparison-matrix.md) - 技術方案對照表
- [docs/cost-analysis.md](./cost-analysis.md) - 成本效益分析
- [docs/research/poc-prd-reference.md](./research/poc-prd-reference.md) - POC PRD 參考

**外部資源**:
- [ANAM.ai](https://anam.ai) - 主要競品參考
- [Ready Player Me 文件](https://docs.readyplayer.me/)
- [Azure OpenAI 文件](https://learn.microsoft.com/azure/ai-services/openai/)
- [Azure Speech Services 文件](https://learn.microsoft.com/azure/ai-services/speech-service/)

---

## Next Steps

### Immediate Actions

1. **驗證 Project Brief**
   - 與利害關係人確認專案目標與範圍
   - 確保所有關鍵假設與風險已識別

2. **啟動 PRD 撰寫**
   - 將此 Brief 交付給 Product Manager (John)
   - 使用 BMad PRD 模板，產出詳細產品需求文件

3. **準備技術環境**
   - 建立 Azure 帳號與服務（OpenAI, Speech）
   - 設定開發環境（Next.js, TypeScript）

4. **使用者調研**（選做，如時間允許）
   - 訪談 3-5 位潛在企業客戶
   - 驗證核心需求與付費意願

### PM Handoff

This Project Brief provides the full context for **3D Avatar 即時對話系統**. 

**Dear Product Manager (John)**,

請開始 PRD 撰寫流程：

1. 使用 BMad 的 `prd-tmpl.yaml` 正式模板
2. 參考本 Brief 的核心需求與技術考量
3. 特別注意：
   - MVP 範圍必須嚴格控制（僅 5 大核心功能）
   - 技術棧已確定（Next.js + Azure），需在 PRD 中反映
   - 成本控制是關鍵成功因素
4. 與我確認任何不明確的需求或假設

期待您產出一份清晰、可執行的 PRD！

---

**文件狀態**: ✅ 完成  
**下一步**: 由 PM (John) 接手，撰寫正式 PRD  
**最後更新**: 2025-10-14

