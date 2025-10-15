# MVP 開發計劃
**3D Avatar 即時對話系統 - Minimum Viable Product**

## 文件資訊
- **專案名稱**: Smart AI Avatar Agent
- **階段**: MVP (Minimum Viable Product)
- **計劃日期**: 2025-10-15
- **計劃版本**: 1.0.0
- **負責人**: Product Team & Dev Team
- **文件狀態**: 初稿
- **計劃期程**: 2025-10-15 ~ 2026-01-15（3 個月）

---

## 目錄

1. [執行摘要](#執行摘要)
2. [MVP 目標與範疇](#mvp-目標與範疇)
3. [POC 驗證成果回顧](#poc-驗證成果回顧)
4. [MVP 功能規劃](#mvp-功能規劃)
5. [Epic 與 User Stories](#epic-與-user-stories)
6. [Sprint 計劃](#sprint-計劃)
7. [技術架構演進](#技術架構演進)
8. [成本估算](#成本估算)
9. [風險評估與緩解策略](#風險評估與緩解策略)
10. [成功指標（KPI）](#成功指標kpi)
11. [交付物清單](#交付物清單)
12. [關鍵決策點](#關鍵決策點)

---

## 執行摘要

### MVP 概述

基於 POC 階段的成功驗證（所有效能指標超標 200-250%，成本節省 97.1%），本 MVP 計劃旨在將核心技術轉化為可商用的產品，並新增使用者價值驅動的關鍵功能。

### 核心目標

**產品目標**: 打造一個具備完整使用者體驗的 3D Avatar 對話系統，支援語音輸入、對話歷史管理、多裝置存取，並具備商業化基礎。

**技術目標**: 在維持 POC 優異效能的基礎上，實現使用者認證、資料持久化、行動裝置支援等企業級功能。

**商業目標**: 驗證產品市場契合度（Product-Market Fit），建立使用者獲取與留存機制，為規模化擴張奠定基礎。

### MVP 關鍵成果

| 目標類別 | 關鍵指標 | 目標值 |
|---------|---------|--------|
| **功能完整性** | 核心功能完成率 | 100% (10/10) |
| **使用者體驗** | 平均對話滿意度 | ≥ 4.0/5.0 |
| **效能表現** | 3D 渲染 FPS | ≥ 30 (桌面) / ≥ 24 (行動) |
| **系統穩定性** | 可用性（Uptime） | ≥ 99.5% |
| **成本控制** | 月營運成本 | ≤ NT$1,500 |
| **使用者規模** | 目標月活躍使用者（MAU） | 100-200 人 |

### 時程概覽

- **Phase 1（M1）**: 核心功能開發（認證、STT、對話歷史）
- **Phase 2（M2）**: 增強功能（行動支援、Avatar 擴充、多語言）
- **Phase 3（M3）**: 優化與測試（效能優化、監控、自動化測試）
- **上線日期**: 2026-01-15

### 投資回報

- **開發成本**: 3 人月（1 Full-Stack Dev × 3 個月）
- **營運成本**: NT$4,500（3 個月）
- **預期效益**: 驗證產品市場契合度，建立 100+ 早期使用者基礎

---

## MVP 目標與範疇

### 1. 產品目標

#### 1.1 使用者價值目標

**核心價值主張**:
- **自然對話體驗**: 語音輸入 + 視覺同步，打造沉浸式對話
- **個人化服務**: 使用者專屬對話歷史與偏好設定
- **隨時隨地存取**: 支援桌面與行動裝置，無縫使用體驗
- **多語言支援**: 繁中、英文、日文，覆蓋更廣泛使用者

#### 1.2 商業目標

**市場驗證**:
- 驗證 3D Avatar 對話系統的市場需求
- 建立使用者反饋迴路（User Feedback Loop）
- 測試定價策略（Freemium 或訂閱制）

**使用者獲取**:
- 目標 MAU: 100-200 人（Early Adopters）
- 使用者留存率: ≥ 40%（30 天）
- 平均對話次數: ≥ 20 次/使用者/月

#### 1.3 技術目標

**企業級基礎**:
- 使用者認證與授權（Authentication & Authorization）
- 資料持久化與安全性（Data Persistence & Security）
- 可擴展架構（Scalable Architecture）

**效能維持**:
- 維持 POC 優異效能（60 FPS, <50ms Lip Sync）
- 支援行動裝置（24+ FPS, 響應式設計）
- 成本控制（月成本 ≤ NT$1,500）

### 2. MVP 範疇

#### 2.1 包含功能（In Scope）

根據 POC 報告第 10 章建議，MVP 包含以下 10 項優先功能：

##### 高優先級（P0 - 必要功能）
1. **使用者認證系統** ✅ P0
   - 使用者註冊與登入（Email + Password）
   - OAuth 整合（Google, Microsoft）
   - Session 管理與安全性

2. **對話歷史儲存** ✅ P0
   - 對話記錄持久化
   - 對話查詢與搜尋
   - 對話匯出（JSON, PDF）

3. **語音輸入（STT）** ✅ P0
   - Azure Speech Services STT
   - 麥克風權限管理
   - 語音轉文字即時顯示

4. **行動裝置支援** ✅ P0
   - 響應式設計（375px+）
   - 觸控操作優化
   - 行動瀏覽器效能優化

##### 中優先級（P1 - 增強功能）
5. **Avatar 角色庫擴充** ✅ P1
   - 10+ 預設 Avatar
   - Avatar 分類與預覽

6. **多語言支援** ✅ P1
   - 多語言 UI（繁中、英文、日文）
   - 多語言 TTS

7. **對話主題（Prompt 模板）** ✅ P1
   - 10+ 對話主題（客服、教學、娛樂）
   - 主題切換

##### 低優先級（P2 - 優化功能）
8. **Safari 效能優化** ✅ P2
   - 瀏覽器偵測與自動降級
   - Safari 專用場景優化

9. **監控與分析** ✅ P2
   - Azure Application Insights 整合
   - 使用者行為分析

10. **自動化測試** ✅ P2
    - 跨瀏覽器 E2E 測試（Playwright）
    - 單元測試（Jest + RTL）

#### 2.2 不包含功能（Out of Scope）

以下功能留待後續版本（Post-MVP）：

❌ **Avatar 自訂功能** - 使用者自訂 Avatar 外觀（複雜度高，留待 v2.0）
❌ **即時多人對話** - 多使用者同時與 Avatar 對話（架構需重新設計）
❌ **Avatar 情緒偵測** - 根據對話內容自動調整 Avatar 情緒（AI 複雜度高）
❌ **付費系統** - 訂閱制與支付整合（商業模式待驗證）
❌ **企業版功能** - 團隊管理、權限控制、API 整合（企業需求待驗證）
❌ **離線模式** - 離線使用與資料同步（技術複雜度高）

### 3. 成功標準

#### 3.1 功能完整性
- ✅ 所有 P0 功能 100% 完成並通過測試
- ✅ 所有 P1 功能至少 80% 完成
- ✅ 所有 P2 功能至少 60% 完成

#### 3.2 品質標準
- ✅ 桌面端 3D 渲染 FPS ≥ 30
- ✅ 行動端 3D 渲染 FPS ≥ 24
- ✅ Lip Sync 延遲 < 50ms（桌面）、< 80ms（行動）
- ✅ 對話回應時間 < 5 秒
- ✅ 系統可用性 ≥ 99.5%

#### 3.3 使用者滿意度
- ✅ 平均對話滿意度 ≥ 4.0/5.0
- ✅ 使用者留存率（30 天）≥ 40%
- ✅ NPS（Net Promoter Score）≥ 30

#### 3.4 成本控制
- ✅ 月營運成本 ≤ NT$1,500
- ✅ 單次對話成本 ≤ NT$0.10

---

## POC 驗證成果回顧

### POC 關鍵成果

根據 POC 技術驗證報告（docs/POC_TECHNICAL_REPORT.md），POC 階段已成功驗證：

#### 技術可行性驗證 ✅

| 技術領域 | 驗證結果 | 關鍵數據 |
|---------|---------|---------|
| **3D Avatar 渲染** | ✅ 優秀 | 60 FPS（超標 100%） |
| **LLM 即時對話** | ✅ 達標 | 2-3 秒回應時間 |
| **TTS 語音合成** | ✅ 達標 | 1.2-1.8 秒合成時間 |
| **Lip Sync 同步** | ✅ 超標 | ~20ms 延遲（超標 150%） |
| **端到端流程** | ✅ 完整 | 完整對話流程流暢穩定 |

#### 效能指標超標 ✅

| 指標 | 目標 | POC 實際 | 達標率 |
|------|------|----------|--------|
| 3D 渲染 FPS | ≥ 30 fps | 60 fps | 200% |
| 首次載入時間 | < 5 秒 | ~2 秒 | 250% |
| Lip Sync 延遲 | < 50ms | ~20ms | 250% |
| 對話回應時間 | < 5 秒 | 2-3 秒 | 150% |
| 記憶體使用 | < 500 MB | < 300 MB | 166% |

#### 成本驗證 ✅

| 階段 | 預算 | 實際成本 | 節省率 |
|------|------|----------|--------|
| POC（3 個月） | NT$7,000 | NT$200 | **97.1%** |

**成本明細**:
- Azure OpenAI: NT$48（$1.50）
- Azure Speech Services: NT$154（$4.80）
- Azure Static Web Apps: NT$0（Free Tier）
- Application Insights: NT$0（Free Tier）

#### 瀏覽器相容性 ✅

| 瀏覽器 | 評分 | 效能 | 建議 |
|--------|------|------|------|
| Chrome 120+ | A+ | 60 FPS | 推薦 |
| Edge 120+ | A+ | 58-60 FPS | 推薦 |
| Firefox 120+ | A | 48 FPS | 支援 |
| Safari 17+ | B+ | 35 FPS | 支援但體驗稍差 |

### POC 技術亮點

1. **精準 Lip Sync**: 延遲低至 20ms，業界領先水準（一般為 50-100ms）
2. **高效能 3D 渲染**: 穩定 60 FPS，優於目標 30 FPS
3. **快速載入**: 首屏載入僅需 2 秒（Dynamic Import 優化）
4. **智能快取**: TTS 快取命中率達 40-60%
5. **優雅降級**: 完整的錯誤處理與使用者體驗保護機制

### MVP 建構基礎

基於 POC 成功驗證，MVP 將在以下堅實基礎上建構：

✅ **技術風險已消除**: 所有核心技術挑戰已解決
✅ **效能基準已建立**: 所有效能指標符合或超越目標
✅ **成本模型已驗證**: 成本可控且遠低於預算
✅ **使用者體驗已優化**: 流暢的對話與視覺體驗
✅ **架構可擴展**: 支援未來功能擴充

---

## MVP 功能規劃

### 功能優先級矩陣

根據使用者價值（User Value）與技術複雜度（Complexity）進行優先級排序：

```
高價值 |  P0: STT         P1: 多語言
       |  P0: 認證         P1: Avatar擴充
       |  P0: 對話歷史     P1: 對話主題
       |  P0: 行動支援
       |
中價值 |                   P2: 監控分析
       |                   P2: Safari優化
       |                   P2: 自動化測試
───────┼──────────────────────────────
低複雜度              高複雜度
```

### Epic 概覽

MVP 功能分為 3 個主要 Epic：

#### Epic 1: 核心使用者功能（P0）
**目標**: 建立完整的使用者體驗基礎

- Story 1.1: 使用者認證系統
- Story 1.2: 對話歷史儲存與管理
- Story 1.3: 語音輸入（STT）整合
- Story 1.4: 行動裝置響應式設計

**時程**: Sprint 1-4（月 1）
**優先級**: P0（必要功能）

#### Epic 2: 增強使用者價值（P1）
**目標**: 提升產品差異化與使用者滿意度

- Story 2.1: Avatar 角色庫擴充
- Story 2.2: 多語言支援（i18n）
- Story 2.3: 對話主題與 Prompt 模板

**時程**: Sprint 5-8（月 2）
**優先級**: P1（增強功能）

#### Epic 3: 效能優化與品質保證（P2）
**目標**: 確保系統穩定性與可維護性

- Story 3.1: Safari 瀏覽器效能優化
- Story 3.2: 監控與分析系統
- Story 3.3: 自動化測試框架

**時程**: Sprint 9-12（月 3）
**優先級**: P2（優化功能）

---

## Epic 與 User Stories

### Epic 1: 核心使用者功能（P0）

#### Story 1.1: 使用者認證系統

**描述**:
作為使用者，我希望能夠註冊帳號並登入系統，以便保存我的對話歷史與個人設定。

**驗收標準**:
- [ ] 使用者可使用 Email + Password 註冊新帳號
- [ ] 密碼需符合安全標準（8+ 字元，包含大小寫、數字）
- [ ] 使用者可登入與登出
- [ ] 使用者可透過 Google OAuth 登入
- [ ] 使用者可透過 Microsoft OAuth 登入
- [ ] 登入 Session 使用 JWT Token，有效期 7 天
- [ ] 使用者可在設定頁面修改密碼
- [ ] 使用者可使用「忘記密碼」功能重設密碼

**技術實作**:
- **前端**: Next.js App Router + NextAuth.js v5
- **後端**: Prisma ORM + PostgreSQL（Azure Database for PostgreSQL）
- **驗證**: JWT Token + HTTP-only Cookies
- **OAuth Providers**: Google, Microsoft（使用 NextAuth.js 內建支援）

**資料模型**:
```typescript
model User {
  id            String    @id @default(cuid())
  email         String    @unique
  passwordHash  String?   // OAuth 使用者可為 null
  name          String?
  avatarUrl     String?
  provider      String    // 'email' | 'google' | 'microsoft'
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  conversations Conversation[]
}
```

**時程**: Sprint 1（Week 1-2）
**工作量**: 10 Story Points（5 個工作天）
**優先級**: P0

---

#### Story 1.2: 對話歷史儲存與管理

**描述**:
作為登入使用者，我希望能夠查看我的對話歷史，並能搜尋、匯出過往對話。

**驗收標準**:
- [ ] 所有對話自動儲存至資料庫
- [ ] 使用者可在「歷史」頁面查看所有對話
- [ ] 對話列表顯示摘要（前 50 字）、Avatar、日期
- [ ] 使用者可點擊對話進入詳細檢視
- [ ] 使用者可搜尋對話（關鍵字搜尋）
- [ ] 使用者可匯出對話為 JSON 格式
- [ ] 使用者可匯出對話為 PDF 格式（含 Avatar 資訊）
- [ ] 使用者可刪除對話（軟刪除，保留 30 天）
- [ ] 使用者可分享對話（生成公開連結，選用功能）

**技術實作**:
- **資料庫**: Azure Database for PostgreSQL
- **ORM**: Prisma
- **搜尋**: PostgreSQL 全文搜尋（Full-Text Search）
- **匯出**: jsPDF（PDF 生成）

**資料模型**:
```typescript
model Conversation {
  id          String    @id @default(cuid())
  userId      String
  user        User      @relation(fields: [userId], references: [id])
  avatarId    String    // 使用的 Avatar ID
  title       String?   // 自動生成或使用者自訂
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
  deletedAt   DateTime? // 軟刪除
  messages    Message[]
}

model Message {
  id              String       @id @default(cuid())
  conversationId  String
  conversation    Conversation @relation(fields: [conversationId], references: [id])
  role            String       // 'user' | 'assistant'
  content         String       @db.Text
  audioUrl        String?      // TTS 音訊 URL（選用）
  createdAt       DateTime     @default(now())
}
```

**時程**: Sprint 2（Week 3-4）
**工作量**: 13 Story Points（6.5 個工作天）
**優先級**: P0

---

#### Story 1.3: 語音輸入（STT）整合

**描述**:
作為使用者，我希望能夠使用語音輸入與 Avatar 對話，而不僅限於文字輸入。

**驗收標準**:
- [ ] 聊天介面新增「語音輸入」按鈕（麥克風圖示）
- [ ] 點擊按鈕後請求麥克風權限
- [ ] 麥克風開啟後顯示錄音波形動畫
- [ ] 使用者可透過點擊停止錄音
- [ ] 語音自動轉換為文字並顯示在輸入框
- [ ] 使用者可編輯轉換後的文字
- [ ] 使用者可直接送出語音轉換的文字
- [ ] 支援繁體中文、英文、日文語音輸入
- [ ] 語音輸入失敗時顯示友善錯誤訊息
- [ ] 行動裝置上語音輸入正常運作

**技術實作**:
- **STT 服務**: Azure Speech Services Speech-to-Text API
- **音訊錄製**: Web Audio API + MediaRecorder
- **波形視覺化**: Canvas API 或 react-audio-visualize
- **語言偵測**: 使用者選擇或瀏覽器語言自動偵測

**API 端點**:
```typescript
// POST /api/stt
// Request: { audioBlob: Blob, language: 'zh-TW' | 'en-US' | 'ja-JP' }
// Response: { text: string, confidence: number }
```

**時程**: Sprint 3（Week 5-6）
**工作量**: 8 Story Points（4 個工作天）
**優先級**: P0

---

#### Story 1.4: 行動裝置響應式設計

**描述**:
作為行動裝置使用者，我希望能夠在手機或平板上流暢使用系統。

**驗收標準**:
- [ ] 支援螢幕寬度 375px-1920px（iPhone SE 至桌面）
- [ ] 行動裝置上 3D Avatar 渲染 FPS ≥ 24
- [ ] 行動裝置上 Lip Sync 延遲 < 80ms
- [ ] 行動裝置上對話介面可正常操作（觸控優化）
- [ ] 行動裝置上語音輸入正常運作
- [ ] 橫向與直向模式皆支援
- [ ] 平板裝置（768px+）採用桌面佈局
- [ ] 行動裝置自動降低 3D 場景複雜度（陰影、材質）
- [ ] 行動裝置上載入時間 < 5 秒
- [ ] 行動裝置測試通過（iOS Safari, Android Chrome）

**技術實作**:
- **響應式設計**: Tailwind CSS Breakpoints
- **3D 優化**: Three.js LOD（Level of Detail）
- **裝置偵測**: User-Agent 或 `window.matchMedia`
- **效能優化**:
  - 行動裝置自動使用較低解析度材質
  - 陰影品質降級
  - FPS 限制為 30（省電模式）

**Breakpoints**:
```typescript
// Tailwind CSS Breakpoints
sm: 640px   // 手機橫向
md: 768px   // 平板
lg: 1024px  // 小型桌面
xl: 1280px  // 標準桌面
2xl: 1536px // 大型桌面
```

**時程**: Sprint 4（Week 7-8）
**工作量**: 13 Story Points（6.5 個工作天）
**優先級**: P0

---

### Epic 2: 增強使用者價值（P1）

#### Story 2.1: Avatar 角色庫擴充

**描述**:
作為使用者，我希望能夠從更多 Avatar 中選擇，以滿足不同情境需求。

**驗收標準**:
- [ ] 系統提供至少 10 個預設 Avatar
- [ ] Avatar 分為 3 類：男性、女性、中性
- [ ] Avatar 選擇器顯示縮圖預覽
- [ ] Avatar 選擇器支援分類篩選
- [ ] Avatar 選擇器支援名稱搜尋
- [ ] 每個 Avatar 有詳細資訊（名稱、描述、風格）
- [ ] Avatar 切換流暢（<1 秒）
- [ ] 使用者偏好的 Avatar 自動儲存
- [ ] Avatar 模型品質符合 POC 標準（GLB 格式，2-3 MB）

**Avatar 清單**:
1. **Alex**（男性，專業）- POC 既有
2. **Jordan**（女性，友善）- POC 既有
3. **Casey**（中性，休閒）- POC 既有
4. **Sam**（男性，年輕）- 新增
5. **Taylor**（女性，專業）- 新增
6. **Morgan**（中性，活潑）- 新增
7. **Riley**（男性，成熟）- 新增
8. **Avery**（女性，溫柔）- 新增
9. **Parker**（中性，科技）- 新增
10. **Quinn**（女性，時尚）- 新增

**技術實作**:
- **Avatar 來源**: Ready Player Me（免費授權）
- **儲存**: Azure Blob Storage 或 CDN
- **資料模型**:
```typescript
model Avatar {
  id          String   @id @default(cuid())
  name        String
  category    String   // 'male' | 'female' | 'neutral'
  description String
  modelUrl    String   // GLB 檔案 URL
  thumbnailUrl String  // 縮圖 URL
  tags        String[] // ['professional', 'friendly', ...]
}
```

**時程**: Sprint 5（Week 9-10）
**工作量**: 5 Story Points（2.5 個工作天）
**優先級**: P1

---

#### Story 2.2: 多語言支援（i18n）

**描述**:
作為非繁體中文使用者，我希望能夠使用我的母語（英文或日文）與系統互動。

**驗收標準**:
- [ ] UI 支援繁體中文、英文、日文
- [ ] 使用者可在設定頁面切換語言
- [ ] 語言設定自動儲存（localStorage）
- [ ] TTS 語音根據 UI 語言自動切換
- [ ] 多語言翻譯覆蓋率 ≥ 95%
- [ ] 翻譯品質通過母語者審查
- [ ] 語言切換無需重新載入頁面
- [ ] 新使用者自動偵測瀏覽器語言並設定

**支援語言**:
- **繁體中文（zh-TW）**: 預設語言
- **英文（en-US）**: 國際化第一優先
- **日文（ja-JP）**: 東亞市場擴展

**技術實作**:
- **i18n 框架**: next-intl 或 react-i18next
- **翻譯檔案**: JSON 格式（public/locales/）
- **TTS 語言映射**:
  - zh-TW: zh-TW-HsiaoChenNeural（POC 既有）
  - en-US: en-US-JennyNeural
  - ja-JP: ja-JP-NanamiNeural

**時程**: Sprint 6（Week 11-12）
**工作量**: 8 Story Points（4 個工作天）
**優先級**: P1

---

#### Story 2.3: 對話主題與 Prompt 模板

**描述**:
作為使用者，我希望能夠快速啟動特定主題的對話（如客服、教學），而不需要手動設定 Prompt。

**驗收標準**:
- [ ] 系統提供至少 10 個預設對話主題
- [ ] 主題分為 3 類：客服、教學、娛樂
- [ ] 使用者可在新對話時選擇主題
- [ ] 主題選擇器顯示主題名稱、描述、圖示
- [ ] 主題自動套用對應的 System Prompt
- [ ] 使用者可自訂 System Prompt（進階設定）
- [ ] 使用者可儲存自訂主題
- [ ] 主題切換即時生效

**對話主題清單**:

**客服類**:
1. **一般客服**: 友善專業的客服助理
2. **技術支援**: 技術問題排解專家
3. **訂單查詢**: 訂單狀態與物流查詢

**教學類**:
4. **語言學習**: 語言學習輔導老師
5. **程式教學**: 程式設計導師
6. **知識問答**: 百科知識助理

**娛樂類**:
7. **閒聊夥伴**: 輕鬆閒聊的朋友
8. **故事創作**: 互動式故事敘述者
9. **心情日記**: 傾聽與陪伴的夥伴
10. **創意發想**: 腦力激盪夥伴

**技術實作**:
- **資料模型**:
```typescript
model PromptTemplate {
  id          String   @id @default(cuid())
  name        String
  category    String   // 'customer_service' | 'education' | 'entertainment'
  description String
  systemPrompt String  @db.Text
  icon        String   // emoji or icon name
  isPublic    Boolean  @default(true)
  userId      String?  // 自訂主題關聯使用者
  createdAt   DateTime @default(now())
}
```

**時程**: Sprint 7（Week 13-14）
**工作量**: 5 Story Points（2.5 個工作天）
**優先級**: P1

---

### Epic 3: 效能優化與品質保證（P2）

#### Story 3.1: Safari 瀏覽器效能優化

**描述**:
作為 Safari 使用者，我希望能夠獲得與 Chrome 相近的使用體驗。

**驗收標準**:
- [ ] Safari 17+ 上 3D 渲染 FPS ≥ 30（目前 ~35）
- [ ] Safari 上 Lip Sync 延遲 < 60ms（目前 ~82ms）
- [ ] 自動偵測 Safari 瀏覽器並套用優化
- [ ] Safari 專用場景設定（降低陰影、材質品質）
- [ ] Safari 使用者無感知自動降級
- [ ] Safari 上對話功能完全正常
- [ ] Safari 上語音輸入正常運作
- [ ] Safari 測試通過（macOS Safari 17+）

**技術實作**:
- **瀏覽器偵測**:
```typescript
const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
```
- **Safari 優化配置**:
  - Shadow Map: 512² → 256²
  - 材質品質: High → Medium
  - Lip Sync Look-Ahead: 0ms → 30ms（補償延遲）
  - FPS Limit: 60 → 30（省電）

**時程**: Sprint 9（Week 17-18）
**工作量**: 5 Story Points（2.5 個工作天）
**優先級**: P2

---

#### Story 3.2: 監控與分析系統

**描述**:
作為產品團隊，我們希望能夠即時監控系統效能與使用者行為，以便快速發現問題並優化產品。

**驗收標準**:
- [ ] Azure Application Insights 整合完成
- [ ] 追蹤關鍵效能指標（FPS, 載入時間, 對話延遲）
- [ ] 追蹤使用者行為（對話次數, Avatar 選擇, 主題使用）
- [ ] 追蹤錯誤與例外（Error Rate, Error Types）
- [ ] 設定告警規則（Error Rate > 5%, Uptime < 99%）
- [ ] 建立 Azure Dashboard 監控面板
- [ ] 每日效能報告自動生成（Email）
- [ ] 使用者隱私保護（GDPR 相容）

**追蹤指標**:

**效能指標**:
- 3D 渲染 FPS（平均、最低）
- 首次載入時間（TTI, FCP, LCP）
- 對話回應時間（LLM, TTS）
- Lip Sync 延遲
- 記憶體使用

**使用者行為**:
- DAU / MAU（日活躍 / 月活躍）
- 平均對話次數
- Avatar 選擇分佈
- 主題使用分佈
- 語言偏好分佈

**錯誤追蹤**:
- Error Rate（錯誤率）
- Error Types（錯誤類型分佈）
- API 失敗率（LLM, TTS, STT）

**技術實作**:
- **監控服務**: Azure Application Insights
- **客戶端 SDK**: @microsoft/applicationinsights-web
- **自訂事件**: Custom Events + Custom Metrics
- **採樣率**: 20%（降低成本）

**時程**: Sprint 10（Week 19-20）
**工作量**: 8 Story Points（4 個工作天）
**優先級**: P2

---

#### Story 3.3: 自動化測試框架

**描述**:
作為開發團隊，我們希望建立自動化測試流程，以確保程式碼品質與系統穩定性。

**驗收標準**:
- [ ] 單元測試框架建立（Jest + RTL）
- [ ] 單元測試覆蓋率 ≥ 60%（關鍵模組 ≥ 80%）
- [ ] E2E 測試框架建立（Playwright）
- [ ] 跨瀏覽器 E2E 測試（Chrome, Firefox, Safari）
- [ ] 視覺回歸測試（選用，使用 Percy 或 Chromatic）
- [ ] CI/CD 整合（GitHub Actions）
- [ ] 測試失敗自動阻擋 PR merge
- [ ] 測試報告自動生成（HTML Report）

**測試範圍**:

**單元測試（Jest + React Testing Library）**:
- UI 組件測試（Button, Input, ChatInterface）
- Zustand Store 測試（chatStore, audioStore）
- Utility 函數測試（API 客戶端、錯誤處理）

**E2E 測試（Playwright）**:
- 使用者註冊與登入流程
- 對話流程（文字輸入 → LLM → TTS → Lip Sync）
- Avatar 切換流程
- 語音輸入流程（模擬麥克風輸入）
- 對話歷史查詢與匯出

**技術實作**:
- **單元測試**: Jest 29 + React Testing Library 14
- **E2E 測試**: Playwright 1.40+
- **視覺測試**: Percy 或 Chromatic（選用）
- **CI/CD**: GitHub Actions Workflow

**時程**: Sprint 11-12（Week 21-24）
**工作量**: 13 Story Points（6.5 個工作天）
**優先級**: P2

---

## Sprint 計劃

### Sprint 概覽

MVP 開發共 12 個 Sprint，每個 Sprint 2 週，總計 3 個月。

| Sprint | 時程 | Epic | Stories | Story Points |
|--------|------|------|---------|--------------|
| **Sprint 1** | Week 1-2 | Epic 1 | Story 1.1（認證系統） | 10 |
| **Sprint 2** | Week 3-4 | Epic 1 | Story 1.2（對話歷史） | 13 |
| **Sprint 3** | Week 5-6 | Epic 1 | Story 1.3（STT） | 8 |
| **Sprint 4** | Week 7-8 | Epic 1 | Story 1.4（行動支援） | 13 |
| **Sprint 5** | Week 9-10 | Epic 2 | Story 2.1（Avatar 擴充） | 5 |
| **Sprint 6** | Week 11-12 | Epic 2 | Story 2.2（多語言） | 8 |
| **Sprint 7** | Week 13-14 | Epic 2 | Story 2.3（對話主題） | 5 |
| **Sprint 8** | Week 15-16 | Epic 2 | 緩衝週（整合測試） | 5 |
| **Sprint 9** | Week 17-18 | Epic 3 | Story 3.1（Safari 優化） | 5 |
| **Sprint 10** | Week 19-20 | Epic 3 | Story 3.2（監控分析） | 8 |
| **Sprint 11** | Week 21-22 | Epic 3 | Story 3.3（自動化測試） | 8 |
| **Sprint 12** | Week 23-24 | Epic 3 | Story 3.3（持續）+ 上線準備 | 5 |

**總 Story Points**: 93
**平均 Sprint Velocity**: 7.75 Story Points / Sprint
**總工作天**: 46.5 個工作天（約 2.3 個月，1 名 Full-Stack Developer）

### Phase 1: 核心功能開發（M1, Sprint 1-4）

#### Sprint 1: 使用者認證系統（Week 1-2）

**目標**: 建立完整的使用者認證基礎

**Stories**:
- Story 1.1: 使用者認證系統（10 SP）

**關鍵任務**:
1. 設定 Azure Database for PostgreSQL
2. 建立 Prisma Schema（User, Session）
3. 整合 NextAuth.js v5
4. 實作 Email/Password 註冊與登入
5. 整合 Google OAuth
6. 整合 Microsoft OAuth
7. 實作密碼重設功能
8. 建立使用者設定頁面

**交付物**:
- ✅ 使用者可註冊與登入
- ✅ OAuth 整合完成
- ✅ Session 管理正常
- ✅ 單元測試通過

**風險**:
- ⚠️ Azure Database 配置複雜（緩解：預先研究文件）
- ⚠️ OAuth 設定時間長（緩解：使用 NextAuth.js 簡化）

---

#### Sprint 2: 對話歷史儲存與管理（Week 3-4）

**目標**: 實現對話持久化與查詢功能

**Stories**:
- Story 1.2: 對話歷史儲存與管理（13 SP）

**關鍵任務**:
1. 建立 Prisma Schema（Conversation, Message）
2. 實作對話儲存 API（POST /api/conversations）
3. 實作對話查詢 API（GET /api/conversations）
4. 實作對話搜尋（PostgreSQL Full-Text Search）
5. 建立對話歷史頁面（列表 + 詳細檢視）
6. 實作對話匯出（JSON, PDF）
7. 實作對話刪除（軟刪除）

**交付物**:
- ✅ 對話自動儲存
- ✅ 使用者可查詢對話歷史
- ✅ 搜尋功能正常
- ✅ 匯出功能正常

**風險**:
- ⚠️ PDF 生成複雜（緩解：使用 jsPDF 套件）
- ⚠️ 全文搜尋效能（緩解：建立索引）

---

#### Sprint 3: 語音輸入（STT）整合（Week 5-6）

**目標**: 實現語音輸入功能

**Stories**:
- Story 1.3: 語音輸入（STT）整合（8 SP）

**關鍵任務**:
1. 實作麥克風權限請求
2. 實作音訊錄製（MediaRecorder）
3. 實作 STT API（POST /api/stt）
4. 整合 Azure Speech SDK（Speech-to-Text）
5. 實作波形視覺化（Canvas）
6. 實作語音輸入 UI（按鈕 + 動畫）
7. 測試行動裝置語音輸入

**交付物**:
- ✅ 使用者可使用語音輸入
- ✅ 語音轉文字準確率 ≥ 85%
- ✅ 行動裝置支援

**風險**:
- ⚠️ 瀏覽器麥克風權限（緩解：友善提示）
- ⚠️ 行動裝置相容性（緩解：廣泛測試）

---

#### Sprint 4: 行動裝置響應式設計（Week 7-8）

**目標**: 支援行動裝置流暢使用

**Stories**:
- Story 1.4: 行動裝置響應式設計（13 SP）

**關鍵任務**:
1. 實作 Tailwind Responsive Breakpoints
2. 實作行動裝置佈局（375px+）
3. 實作 Three.js LOD（Level of Detail）
4. 實作裝置偵測與自動降級
5. 優化行動裝置 3D 效能（陰影、材質）
6. 優化行動裝置觸控操作
7. 測試 iOS Safari + Android Chrome

**交付物**:
- ✅ 行動裝置 FPS ≥ 24
- ✅ 響應式設計完整
- ✅ 觸控操作流暢

**風險**:
- ⚠️ 行動裝置 3D 效能（緩解：自動降級）
- ⚠️ iOS Safari 限制（緩解：專用優化）

---

### Phase 2: 增強功能（M2, Sprint 5-8）

#### Sprint 5: Avatar 角色庫擴充（Week 9-10）

**目標**: 提供更多 Avatar 選擇

**Stories**:
- Story 2.1: Avatar 角色庫擴充（5 SP）

**關鍵任務**:
1. 準備 10 個 Avatar 模型（Ready Player Me）
2. 建立 Avatar 資料模型（Prisma）
3. 實作 Avatar 選擇器（分類篩選）
4. 實作 Avatar 預覽功能
5. 優化 Avatar 切換效能

**交付物**:
- ✅ 10+ Avatar 可選擇
- ✅ Avatar 選擇器易用

---

#### Sprint 6: 多語言支援（Week 11-12）

**目標**: 支援繁中、英文、日文

**Stories**:
- Story 2.2: 多語言支援（8 SP）

**關鍵任務**:
1. 整合 next-intl
2. 建立翻譯檔案（zh-TW, en-US, ja-JP）
3. 實作語言切換功能
4. 實作 TTS 語言自動切換
5. 翻譯所有 UI 文字

**交付物**:
- ✅ 3 種語言完整支援
- ✅ 語言切換流暢

---

#### Sprint 7: 對話主題（Week 13-14）

**目標**: 提供預設對話主題

**Stories**:
- Story 2.3: 對話主題與 Prompt 模板（5 SP）

**關鍵任務**:
1. 建立 10 個對話主題
2. 實作主題選擇器
3. 實作自訂 Prompt 功能

**交付物**:
- ✅ 10+ 主題可選擇

---

#### Sprint 8: 緩衝週與整合測試（Week 15-16）

**目標**: 整合測試與 Bug 修復

**關鍵任務**:
1. 整合測試所有功能
2. 修復發現的 Bug
3. 效能調校
4. 使用者體驗優化

---

### Phase 3: 優化與測試（M3, Sprint 9-12）

#### Sprint 9: Safari 優化（Week 17-18）

**Stories**:
- Story 3.1: Safari 效能優化（5 SP）

---

#### Sprint 10: 監控分析（Week 19-20）

**Stories**:
- Story 3.2: 監控與分析系統（8 SP）

---

#### Sprint 11-12: 自動化測試與上線準備（Week 21-24）

**Stories**:
- Story 3.3: 自動化測試框架（13 SP）

**關鍵任務**:
1. 建立單元測試
2. 建立 E2E 測試
3. CI/CD 整合
4. 上線檢查清單驗證
5. 效能壓力測試
6. 生產環境部署

---

## 技術架構演進

### POC 架構回顧

POC 階段採用 **Monolithic 架構**（單體應用），技術棧如下：

```
Next.js 15 App Router
├── Frontend (React 19)
│   ├── 3D Rendering (Three.js + R3F)
│   ├── State Management (Zustand)
│   └── UI Components (Tailwind CSS)
├── Backend (API Routes)
│   ├── /api/chat (LLM)
│   ├── /api/tts (TTS + Viseme)
│   └── /api/health
└── External Services
    ├── Azure OpenAI (GPT-4 Turbo)
    ├── Azure Speech Services (TTS)
    └── Azure Static Web Apps (Hosting)
```

**POC 架構特點**:
- ✅ 簡潔高效，單一專案
- ✅ 快速開發，無整合成本
- ✅ 部署簡單，一鍵部署
- ⚠️ 無使用者認證
- ⚠️ 無資料持久化
- ⚠️ 無 STT 功能

### MVP 架構設計

MVP 階段在 POC 基礎上演進，新增企業級功能：

```
Next.js 15 App Router
├── Frontend (React 19)
│   ├── 3D Rendering (Three.js + R3F) ← POC 既有
│   ├── State Management (Zustand) ← POC 既有
│   ├── UI Components (Tailwind CSS) ← POC 既有
│   ├── Authentication (NextAuth.js) ← 新增
│   ├── i18n (next-intl) ← 新增
│   └── Responsive Design (行動支援) ← 新增
├── Backend (API Routes)
│   ├── /api/chat (LLM) ← POC 既有
│   ├── /api/tts (TTS + Viseme) ← POC 既有
│   ├── /api/stt (STT) ← 新增
│   ├── /api/auth/* (NextAuth) ← 新增
│   ├── /api/conversations (CRUD) ← 新增
│   └── /api/users (CRUD) ← 新增
├── Database (Prisma + PostgreSQL) ← 新增
│   ├── Users
│   ├── Conversations
│   ├── Messages
│   └── PromptTemplates
└── External Services
    ├── Azure OpenAI (GPT-4 Turbo) ← POC 既有
    ├── Azure Speech Services (TTS + STT) ← TTS 既有，STT 新增
    ├── Azure Database for PostgreSQL ← 新增
    ├── Azure Blob Storage (Avatars) ← 新增
    ├── Azure Application Insights ← 新增
    └── Azure Static Web Apps (Hosting) ← POC 既有
```

### 架構演進關鍵決策

#### 決策 1: 維持 Monolithic 架構

**理由**:
- ✅ MVP 規模適合單體應用（避免過度設計）
- ✅ 簡化開發與部署流程
- ✅ 降低基礎設施成本
- ✅ 未來可逐步遷移至 Microservices（如需要）

**替代方案**:
- ❌ Microservices（過度複雜，不適合 MVP）
- ❌ Serverless Functions 分離（增加整合成本）

---

#### 決策 2: 使用 NextAuth.js 進行認證

**理由**:
- ✅ Next.js 官方推薦
- ✅ 內建 OAuth 支援（Google, Microsoft）
- ✅ Session 管理完整
- ✅ 安全性佳（JWT + HTTP-only Cookies）

**替代方案**:
- ❌ Auth0（付費服務，成本較高）
- ❌ Firebase Auth（鎖定 Google 生態系）
- ❌ 自建認證（開發成本高，安全風險）

---

#### 決策 3: 使用 PostgreSQL 作為主資料庫

**理由**:
- ✅ Azure Database for PostgreSQL 整合簡單
- ✅ 支援全文搜尋（Full-Text Search）
- ✅ 關聯式資料庫適合使用者與對話資料
- ✅ Prisma ORM 支援完整

**替代方案**:
- ❌ Azure Cosmos DB（NoSQL，過度設計）
- ❌ MongoDB（額外學習成本）

---

#### 決策 4: 使用 Prisma 作為 ORM

**理由**:
- ✅ TypeScript 原生支援
- ✅ 型別安全與自動補全
- ✅ Migration 管理完整
- ✅ 開發體驗優異

**替代方案**:
- ❌ TypeORM（效能較差）
- ❌ Raw SQL（開發效率低）

---

#### 決策 5: 使用 Azure Blob Storage 儲存 Avatar 模型

**理由**:
- ✅ CDN 支援，全球快速存取
- ✅ 成本低廉（~NT$0.5/GB）
- ✅ 與 Azure 生態系整合

**替代方案**:
- ❌ 放在 Static Web Apps（無 CDN 優勢）
- ❌ 第三方 CDN（增加整合成本）

---

### 技術棧總覽

#### 前端技術
- **框架**: Next.js 15.5.5（App Router）
- **UI 庫**: React 19.2.0
- **3D 渲染**: Three.js 0.180.0 + React Three Fiber 9.4.0
- **狀態管理**: Zustand 5.0.8
- **樣式**: Tailwind CSS 4.1.14
- **i18n**: next-intl 或 react-i18next
- **認證**: NextAuth.js v5

#### 後端技術
- **API**: Next.js API Routes（Serverless Functions）
- **ORM**: Prisma 5+
- **資料庫**: PostgreSQL（Azure Database）
- **認證**: NextAuth.js v5（JWT + Session）

#### 外部服務
- **LLM**: Azure OpenAI（GPT-4 Turbo）
- **TTS**: Azure Speech Services（zh-TW-HsiaoChenNeural, en-US-JennyNeural, ja-JP-NanamiNeural）
- **STT**: Azure Speech Services（Speech-to-Text）
- **儲存**: Azure Blob Storage（Avatar 模型）
- **監控**: Azure Application Insights
- **部署**: Azure Static Web Apps

#### 開發工具
- **語言**: TypeScript 5.9.3
- **測試**: Jest 29 + React Testing Library 14 + Playwright 1.40+
- **Linter**: ESLint 9
- **Formatter**: Prettier
- **CI/CD**: GitHub Actions

---

### 資料庫 Schema 設計

```prisma
// schema.prisma

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

// 使用者
model User {
  id            String         @id @default(cuid())
  email         String         @unique
  passwordHash  String?        // OAuth 使用者可為 null
  name          String?
  avatarUrl     String?
  provider      String         // 'email' | 'google' | 'microsoft'
  preferredLang String         @default("zh-TW") // 'zh-TW' | 'en-US' | 'ja-JP'
  createdAt     DateTime       @default(now())
  updatedAt     DateTime       @updatedAt
  conversations Conversation[]
  customPrompts PromptTemplate[] @relation("CustomPrompts")
}

// 對話
model Conversation {
  id        String    @id @default(cuid())
  userId    String
  user      User      @relation(fields: [userId], references: [id])
  avatarId  String    // 使用的 Avatar ID
  promptId  String?   // 使用的 Prompt Template ID
  title     String?   // 自動生成或使用者自訂
  createdAt DateTime  @default(now())
  updatedAt DateTime  @updatedAt
  deletedAt DateTime? // 軟刪除
  messages  Message[]

  @@index([userId, createdAt])
}

// 訊息
model Message {
  id             String       @id @default(cuid())
  conversationId String
  conversation   Conversation @relation(fields: [conversationId], references: [id], onDelete: Cascade)
  role           String       // 'user' | 'assistant'
  content        String       @db.Text
  audioUrl       String?      // TTS 音訊 URL（選用）
  createdAt      DateTime     @default(now())

  @@index([conversationId, createdAt])
}

// Avatar 模型
model Avatar {
  id           String   @id @default(cuid())
  name         String
  category     String   // 'male' | 'female' | 'neutral'
  description  String
  modelUrl     String   // GLB 檔案 URL
  thumbnailUrl String   // 縮圖 URL
  tags         String[] // ['professional', 'friendly', ...]
  isPublic     Boolean  @default(true)
  createdAt    DateTime @default(now())
}

// Prompt 模板
model PromptTemplate {
  id           String   @id @default(cuid())
  name         String
  category     String   // 'customer_service' | 'education' | 'entertainment'
  description  String
  systemPrompt String   @db.Text
  icon         String   // emoji or icon name
  isPublic     Boolean  @default(true)
  userId       String?  // 自訂主題關聯使用者
  user         User?    @relation("CustomPrompts", fields: [userId], references: [id])
  createdAt    DateTime @default(now())

  @@index([category, isPublic])
}
```

---

### API 端點設計

#### 認證 API
- `POST /api/auth/signup` - 使用者註冊
- `POST /api/auth/signin` - 使用者登入
- `POST /api/auth/signout` - 使用者登出
- `GET /api/auth/session` - 取得當前 Session
- `POST /api/auth/reset-password` - 重設密碼

#### 對話 API
- `GET /api/conversations` - 取得使用者對話列表
- `GET /api/conversations/:id` - 取得對話詳細內容
- `POST /api/conversations` - 建立新對話
- `PATCH /api/conversations/:id` - 更新對話（標題）
- `DELETE /api/conversations/:id` - 刪除對話（軟刪除）
- `GET /api/conversations/search?q=keyword` - 搜尋對話

#### 訊息 API
- `POST /api/conversations/:id/messages` - 新增訊息
- `GET /api/conversations/:id/messages` - 取得對話訊息

#### LLM & TTS & STT API（POC 既有 + 新增）
- `POST /api/chat` - LLM 對話（SSE Stream）← POC 既有
- `POST /api/tts` - TTS 語音合成 ← POC 既有
- `POST /api/stt` - STT 語音辨識 ← 新增

#### Avatar API
- `GET /api/avatars` - 取得 Avatar 列表
- `GET /api/avatars/:id` - 取得 Avatar 詳細資訊

#### Prompt Template API
- `GET /api/prompts` - 取得 Prompt 模板列表
- `GET /api/prompts/:id` - 取得 Prompt 詳細資訊
- `POST /api/prompts` - 建立自訂 Prompt
- `DELETE /api/prompts/:id` - 刪除自訂 Prompt

#### 使用者 API
- `GET /api/users/me` - 取得當前使用者資訊
- `PATCH /api/users/me` - 更新使用者資訊
- `PATCH /api/users/me/password` - 修改密碼

---

## 成本估算

### POC 成本回顧

根據 POC 技術驗證報告，POC 階段實際成本：

| 服務 | 月成本 | 3 個月成本 |
|------|--------|-----------|
| Azure OpenAI | NT$16 | NT$48 |
| Azure Speech Services | NT$51 | NT$154 |
| Azure Static Web Apps | NT$0（Free Tier） | NT$0 |
| Application Insights | NT$0（Free Tier） | NT$0 |
| **總計** | **NT$67** | **NT$200** |

**成本節省**: NT$6,800（相對預算 NT$7,000）

### MVP 成本預估

#### 假設參數

- **月活躍使用者（MAU）**: 100-200 人
- **平均對話次數**: 20 次/使用者/月
- **總對話次數**: 2,000-4,000 次/月
- **平均每次對話 Token 數**: 100 tokens（input + output）
- **平均每次對話字數**: 50 字（TTS）
- **STT 使用率**: 50%（50% 使用者使用語音輸入）

#### 服務成本明細

##### 1. Azure OpenAI（GPT-4 Turbo）

**用量計算**:
- 總對話次數: 2,000-4,000 次/月
- 平均 Token 數: 100 tokens/次
- 總 Token 數: 200,000-400,000 tokens/月

**成本計算**:
- 單價: $0.01/1K tokens（Input + Output 平均）
- 月成本: $2.00-$4.00（NT$64-128）

##### 2. Azure Speech Services（TTS）

**用量計算**:
- 總對話次數: 2,000-4,000 次/月
- 平均字數: 50 字/次
- 總字數: 100,000-200,000 字/月

**成本計算**:
- 單價: $16/1M 字
- 月成本: $1.60-$3.20（NT$51-102）

##### 3. Azure Speech Services（STT）

**用量計算**:
- STT 使用率: 50%（1,000-2,000 次/月）
- 平均語音時長: 10 秒/次
- 總語音時長: 10,000-20,000 秒 = 167-333 分鐘

**成本計算**:
- 單價: $1/60 分鐘
- 月成本: $2.78-$5.55（NT$89-178）

##### 4. Azure Database for PostgreSQL

**方案**: Burstable B1ms（1 vCore, 2 GB RAM）

**成本計算**:
- 月成本: $15.00（NT$480）

**注意**: 可考慮使用 Free Tier（2 GB 儲存，1 vCore）降低成本

##### 5. Azure Blob Storage（Avatar 模型）

**用量計算**:
- Avatar 總數: 10 個
- 平均大小: 2.5 MB/個
- 總儲存: 25 MB = 0.025 GB
- 頻寬（下載）: 10 個 Avatar × 200 使用者 × 2.5 MB = 5 GB

**成本計算**:
- 儲存成本: $0.02/GB × 0.025 GB = $0.0005（忽略不計）
- 頻寬成本: $0.087/GB × 5 GB = $0.44（NT$14）

##### 6. Azure Static Web Apps

**方案**: Standard Tier（支援 Authentication）

**成本計算**:
- 月成本: $9.00（NT$288）

##### 7. Azure Application Insights

**用量計算**:
- 採樣率: 20%
- 預估資料量: 2 GB/月（20% 採樣後）

**成本計算**:
- Free Tier: 5 GB/月
- 月成本: $0（Free Tier 足夠）

#### 總成本預估

| 服務 | 月成本（USD） | 月成本（TWD） |
|------|--------------|--------------|
| Azure OpenAI | $2.00-$4.00 | NT$64-128 |
| Azure Speech TTS | $1.60-$3.20 | NT$51-102 |
| Azure Speech STT | $2.78-$5.55 | NT$89-178 |
| Azure Database PostgreSQL | $15.00 | NT$480 |
| Azure Blob Storage | $0.44 | NT$14 |
| Azure Static Web Apps | $9.00 | NT$288 |
| Application Insights | $0 | NT$0 |
| **總計（保守估計）** | **$30.82-$37.19** | **NT$986-1,190** |

**年成本預估**: NT$11,832-14,280

#### 成本優化策略

##### 1. TTS 快取優化（持續 POC 策略）

**目標**: 將快取命中率從 40-60% 提升至 70-80%

**預期節省**: 30-40% TTS 成本（約 NT$15-40/月）

##### 2. LLM Prompt 優化

**策略**:
- 精簡 System Prompt（減少 input token 數）
- 限制回應長度（max_tokens: 200）
- 考慮使用 GPT-4 Mini（更便宜，但效果稍差）

**預期節省**: 30-50% LLM 成本（約 NT$20-64/月）

##### 3. STT 使用限制

**策略**:
- 限制語音輸入最長時間（30 秒）
- 鼓勵文字輸入（UI 設計引導）

**預期節省**: 20-30% STT 成本（約 NT$18-54/月）

##### 4. 資料庫方案降級

**策略**:
- 初期使用 Azure Database Free Tier（如可用）
- 或使用 Supabase 免費方案（PostgreSQL）

**預期節省**: NT$480/月

##### 5. Application Insights 採樣

**策略**:
- 維持 20% 採樣率（目前配置）
- 僅追蹤關鍵事件

**預期節省**: 維持 Free Tier 內（NT$0）

#### 優化後成本預估

| 項目 | 優化前 | 優化後 | 節省 |
|------|--------|--------|------|
| Azure OpenAI | NT$64-128 | NT$40-80 | 30-50% |
| Azure Speech TTS | NT$51-102 | NT$36-71 | 30-40% |
| Azure Speech STT | NT$89-178 | NT$71-142 | 20-30% |
| Azure Database | NT$480 | NT$0（Free Tier） | 100% |
| Azure Blob Storage | NT$14 | NT$14 | 0% |
| Azure Static Web Apps | NT$288 | NT$288 | 0% |
| Application Insights | NT$0 | NT$0 | 0% |
| **總計** | **NT$986-1,190** | **NT$449-595** | **54-50%** |

**優化後月成本**: NT$450-600
**優化後年成本**: NT$5,400-7,200

---

### 單次對話成本分析

#### POC 單次對話成本

| 項目 | 成本（TWD） |
|------|-----------|
| LLM (GPT-4 Turbo) | NT$0.032 |
| TTS | NT$0.026 |
| **總計** | **NT$0.058** |

#### MVP 單次對話成本

| 項目 | 成本（TWD） |
|------|-----------|
| LLM (GPT-4 Turbo) | NT$0.032 |
| TTS | NT$0.026 |
| STT（50% 使用率） | NT$0.045 |
| 資料庫儲存（忽略） | ~NT$0.001 |
| **總計** | **NT$0.104** |

**結論**: MVP 單次對話成本約 NT$0.10，成本可控。

---

### 成本增長預估

#### 使用者規模增長情境

| MAU | 對話次數/月 | 月成本（優化後） | 年成本 |
|-----|------------|---------------|--------|
| **100** | 2,000 | NT$450 | NT$5,400 |
| **500** | 10,000 | NT$1,200 | NT$14,400 |
| **1,000** | 20,000 | NT$2,400 | NT$28,800 |
| **5,000** | 100,000 | NT$12,000 | NT$144,000 |

**結論**:
- ✅ MVP 階段（100-200 MAU）成本可控（NT$450-600/月）
- ⚠️ 規模化階段（1,000+ MAU）需重新評估成本優化策略
- 💡 建議在 500 MAU 時導入付費訂閱模式（Freemium）

---

## 風險評估與緩解策略

### 風險矩陣

根據影響程度（Impact）與發生機率（Probability）評估風險：

```
高影響 |  R2: Azure 服務        R4: 成本超支
       |  R5: 效能下降
       |
中影響 |  R1: 開發延遲          R6: 使用者採用率低
       |  R3: Safari 效能       R7: 資料安全
       |
低影響 |                        R8: 第三方依賴
───────┼──────────────────────────────────
        低機率              高機率
```

### 風險詳細分析

#### 風險 1: 開發時程延遲

**描述**: Sprint 進度落後，導致 MVP 上線延遲

**影響**: 中（影響上線時程，但不影響核心功能）
**機率**: 中（技術複雜度高，新功能較多）

**緩解策略**:
1. **嚴格 Sprint Planning**: 每個 Sprint 初期明確定義 DoD（Definition of Done）
2. **每日 Stand-up**: 及時發現阻礙，快速調整
3. **緩衝週安排**: Sprint 8 作為緩衝週，吸收前期延遲
4. **優先級管理**: P0 功能絕對優先，P2 功能可彈性調整
5. **技術預研**: 高風險技術（STT, 行動支援）提前 Spike 研究

**殘餘風險**: 低（緩解措施充足）

---

#### 風險 2: Azure 服務可用性問題

**描述**: Azure OpenAI 或 Speech Services 發生中斷或限流

**影響**: 高（服務中斷，使用者無法使用）
**機率**: 低（Azure SLA 99.9%）

**緩解策略**:
1. **健康檢查 API**: 持續監控 Azure 服務狀態
2. **告警系統**: Application Insights 設定告警（可用性 < 99%）
3. **自動重試機制**: API 失敗自動重試（3 次，指數退避）
4. **優雅降級**:
   - LLM 失敗 → 顯示友善錯誤訊息
   - TTS 失敗 → 僅顯示文字，不播放音訊
   - STT 失敗 → 提示使用者改用文字輸入
5. **備援方案（長期）**: 考慮多雲備援（AWS, Google Cloud）

**殘餘風險**: 低（Azure SLA 保障）

---

#### 風險 3: Safari 效能無法達標

**描述**: Safari 瀏覽器 3D 效能優化後仍無法達到 FPS ≥ 30

**影響**: 中（影響 Safari 使用者體驗，但不影響其他瀏覽器）
**機率**: 中（Safari WebGL 限制已知）

**緩解策略**:
1. **提前測試**: Sprint 9 專門處理 Safari 優化，提前發現問題
2. **自動降級**: Safari 自動降低場景複雜度（陰影、材質、FPS）
3. **使用者提示**: Safari 使用者顯示「建議使用 Chrome/Edge 以獲得最佳體驗」
4. **替代方案**: 如無法優化至 30 FPS，接受 24 FPS（電影標準，仍可接受）
5. **長期方案**: 研究 WebGPU 替代 WebGL（Safari 16+ 支援）

**殘餘風險**: 低（降級方案可接受）

---

#### 風險 4: 成本超支

**描述**: Azure 服務實際用量超過預估，導致成本超支

**影響**: 高（預算超支，影響專案可持續性）
**機率**: 低（基於 POC 實際數據預估，較為準確）

**緩解策略**:
1. **成本監控**: Azure Cost Management 設定預算告警（80%, 100%）
2. **TTS 快取優化**: 維持 70-80% 快取命中率
3. **LLM Prompt 優化**: 精簡 System Prompt，減少 token 數
4. **STT 使用限制**: 限制語音輸入最長時間（30 秒）
5. **使用量分析**: Application Insights 追蹤使用者行為，優化成本
6. **付費模式（長期）**: 500+ MAU 時導入 Freemium 訂閱制

**殘餘風險**: 低（監控與優化機制完善）

---

#### 風險 5: 行動裝置效能下降

**描述**: 行動裝置 3D 渲染 FPS < 24，使用者體驗不佳

**影響**: 高（影響行動使用者，佔比可能達 30-50%）
**機率**: 中（行動裝置硬體差異大）

**緩解策略**:
1. **提前測試**: Sprint 4 專門處理行動支援，使用多款裝置測試
2. **自動降級**: 行動裝置自動降低場景複雜度（LOD）
3. **裝置偵測**: 根據裝置硬體（GPU, RAM）動態調整品質
4. **效能監控**: Application Insights 追蹤行動裝置 FPS
5. **替代方案**: 如 3D 效能不佳，提供 2D Avatar 選項（靜態圖片 + Lip Sync）

**殘餘風險**: 中（行動裝置效能仍需實際測試驗證）

---

#### 風險 6: 使用者採用率低於預期

**描述**: MVP 上線後，使用者註冊與留存率低於預期（MAU < 50）

**影響**: 中（影響產品市場契合度驗證）
**機率**: 中（新產品市場接受度未知）

**緩解策略**:
1. **早期使用者計劃**: 邀請 20-50 名種子使用者提前試用
2. **使用者反饋迴路**: 每 Sprint 收集使用者反饋，快速迭代
3. **Onboarding 優化**: 首次使用引導教學，降低學習成本
4. **使用者訪談**: 定期與使用者訪談，了解痛點與需求
5. **行銷策略**: 社群媒體推廣、技術部落格文章、Demo 影片

**殘餘風險**: 中（市場接受度需實際驗證）

---

#### 風險 7: 資料安全與隱私問題

**描述**: 使用者資料洩漏或隱私權爭議

**影響**: 高（法律風險，品牌損害）
**機率**: 低（使用 Azure 企業級服務，安全性高）

**緩解策略**:
1. **資料加密**: 資料庫資料加密（at-rest）、HTTPS 傳輸（in-transit）
2. **密碼安全**: 使用 bcrypt 或 argon2 加密密碼（NextAuth.js 內建）
3. **JWT Token**: HTTP-only Cookies，防止 XSS 攻擊
4. **GDPR 合規**: 提供使用者資料匯出與刪除功能
5. **隱私政策**: 明確告知使用者資料使用方式
6. **定期稽核**: Azure Security Center 定期檢查安全漏洞

**殘餘風險**: 極低（Azure 企業級安全保障）

---

#### 風險 8: 第三方依賴更新破壞性變更

**描述**: Three.js, React, Next.js 等套件更新導致破壞性變更（Breaking Changes）

**影響**: 低（可固定版本，不影響現有功能）
**機率**: 低（主流套件更新通常有 Migration Guide）

**緩解策略**:
1. **版本鎖定**: package.json 鎖定主要版本（Next.js 15.x, React 19.x）
2. **定期更新**: 每季評估是否更新依賴套件
3. **測試覆蓋**: 自動化測試確保更新不破壞現有功能
4. **Migration Guide**: 遵循官方 Migration Guide 逐步更新
5. **備份分支**: 更新前建立備份分支，確保可回滾

**殘餘風險**: 極低（版本鎖定 + 測試覆蓋）

---

### 風險監控機制

#### 每週風險評估
- **時間**: 每週五 Sprint Review 後
- **參與者**: Product Owner, Dev Team
- **內容**:
  - 檢視所有風險狀態
  - 更新風險機率與影響
  - 調整緩解策略

#### 風險儀表板
- **工具**: Notion 或 Jira
- **指標**:
  - 高風險數量（目標: 0）
  - 中風險數量（目標: ≤ 3）
  - 殘餘風險評級（目標: 低）

---

## 成功指標（KPI）

### 產品 KPI

#### 1. 使用者規模
| 指標 | 定義 | 目標值（MVP） | 衡量方式 |
|------|------|-------------|---------|
| **MAU** | 月活躍使用者 | 100-200 人 | Application Insights |
| **DAU/MAU 比** | 日活躍/月活躍比例 | ≥ 20% | Application Insights |
| **新使用者註冊數** | 每月新註冊使用者 | 50-100 人 | Database Query |

#### 2. 使用者參與度
| 指標 | 定義 | 目標值（MVP） | 衡量方式 |
|------|------|-------------|---------|
| **平均對話次數** | 每使用者每月對話次數 | ≥ 20 次 | Database Query |
| **平均對話長度** | 每次對話訊息數 | ≥ 5 則 | Database Query |
| **語音輸入使用率** | 使用語音輸入的對話比例 | ≥ 30% | Application Insights |

#### 3. 使用者留存
| 指標 | 定義 | 目標值（MVP） | 衡量方式 |
|------|------|-------------|---------|
| **D1 留存率** | 註冊後第 1 天回訪率 | ≥ 60% | Application Insights |
| **D7 留存率** | 註冊後第 7 天回訪率 | ≥ 50% | Application Insights |
| **D30 留存率** | 註冊後第 30 天回訪率 | ≥ 40% | Application Insights |

#### 4. 使用者滿意度
| 指標 | 定義 | 目標值（MVP） | 衡量方式 |
|------|------|-------------|---------|
| **對話滿意度** | 每次對話後評分（1-5 星） | ≥ 4.0/5.0 | In-App Survey |
| **NPS** | Net Promoter Score | ≥ 30 | Email Survey |
| **功能滿意度** | 特定功能評分（STT, Lip Sync） | ≥ 4.0/5.0 | In-App Survey |

---

### 技術 KPI

#### 1. 效能指標
| 指標 | 定義 | 目標值（MVP） | 衡量方式 |
|------|------|-------------|---------|
| **3D 渲染 FPS（桌面）** | 平均每秒幀數 | ≥ 30 FPS | Application Insights |
| **3D 渲染 FPS（行動）** | 平均每秒幀數 | ≥ 24 FPS | Application Insights |
| **Lip Sync 延遲（桌面）** | 音訊與視覺同步延遲 | < 50ms | Application Insights |
| **Lip Sync 延遲（行動）** | 音訊與視覺同步延遲 | < 80ms | Application Insights |
| **對話回應時間** | LLM + TTS 總時間 | < 5 秒 | Application Insights |
| **首次載入時間（TTI）** | Time to Interactive | < 5 秒 | Lighthouse |
| **記憶體使用（桌面）** | 瀏覽器記憶體使用 | < 500 MB | Chrome DevTools |

#### 2. 系統穩定性
| 指標 | 定義 | 目標值（MVP） | 衡量方式 |
|------|------|-------------|---------|
| **可用性（Uptime）** | 系統正常運作時間比例 | ≥ 99.5% | Azure Monitor |
| **錯誤率（Error Rate）** | API 錯誤比例 | < 2% | Application Insights |
| **API 回應時間（P95）** | 95% API 請求回應時間 | < 2 秒 | Application Insights |

#### 3. 測試覆蓋率
| 指標 | 定義 | 目標值（MVP） | 衡量方式 |
|------|------|-------------|---------|
| **單元測試覆蓋率** | 程式碼測試覆蓋率 | ≥ 60% | Jest Coverage |
| **E2E 測試通過率** | E2E 測試通過比例 | 100% | Playwright Test |
| **跨瀏覽器測試** | 支援瀏覽器數量 | 4 款（Chrome, Edge, Firefox, Safari） | Manual Test |

---

### 商業 KPI

#### 1. 成本控制
| 指標 | 定義 | 目標值（MVP） | 衡量方式 |
|------|------|-------------|---------|
| **月營運成本** | Azure 服務總成本 | ≤ NT$1,500 | Azure Cost Management |
| **單次對話成本** | 平均每次對話成本 | ≤ NT$0.10 | Cost / Conversation |
| **成本增長率** | 每月成本增長比例 | ≤ 20% | Azure Cost Management |

#### 2. 產品市場契合度（PMF）
| 指標 | 定義 | 目標值（MVP） | 衡量方式 |
|------|------|-------------|---------|
| **PMF Survey 分數** | 「產品消失會非常失望」比例 | ≥ 40% | Email Survey |
| **推薦意願** | 願意推薦給朋友的使用者比例 | ≥ 50% | NPS Survey |

---

### KPI 儀表板

**工具**: Azure Application Insights + Custom Dashboard

**更新頻率**: 每日自動更新

**監控項目**:
- 即時使用者數（Real-time Users）
- 今日對話次數（Today's Conversations）
- 平均對話回應時間（Avg Response Time）
- 系統錯誤率（Error Rate）
- 今日成本（Today's Cost）

---

## 交付物清單

### Phase 1: 核心功能（M1）

#### Sprint 1 交付物
- [ ] Azure Database for PostgreSQL 設定完成
- [ ] Prisma Schema（User, Session）
- [ ] NextAuth.js 整合完成
- [ ] 使用者註冊與登入功能
- [ ] Google & Microsoft OAuth 整合
- [ ] 密碼重設功能
- [ ] 使用者設定頁面
- [ ] 單元測試（認證模組）

#### Sprint 2 交付物
- [ ] Prisma Schema（Conversation, Message）
- [ ] 對話儲存 API
- [ ] 對話查詢 API
- [ ] 對話搜尋功能
- [ ] 對話歷史頁面
- [ ] 對話匯出功能（JSON, PDF）
- [ ] 對話刪除功能（軟刪除）
- [ ] 單元測試（對話模組）

#### Sprint 3 交付物
- [ ] STT API（POST /api/stt）
- [ ] 麥克風權限管理
- [ ] 音訊錄製功能
- [ ] 波形視覺化
- [ ] 語音輸入 UI
- [ ] 語音轉文字功能
- [ ] 行動裝置語音輸入測試報告
- [ ] 單元測試（STT 模組）

#### Sprint 4 交付物
- [ ] 響應式設計（375px-1920px）
- [ ] Tailwind Breakpoints 配置
- [ ] Three.js LOD 實作
- [ ] 行動裝置自動降級
- [ ] 觸控操作優化
- [ ] 行動裝置測試報告（iOS, Android）
- [ ] 效能測試報告（行動裝置 FPS）

---

### Phase 2: 增強功能（M2）

#### Sprint 5 交付物
- [ ] 10 個 Avatar 模型（GLB 格式）
- [ ] Avatar 資料模型（Prisma Schema）
- [ ] Avatar 選擇器 UI
- [ ] Avatar 分類篩選功能
- [ ] Avatar 縮圖與預覽
- [ ] Avatar 切換效能優化

#### Sprint 6 交付物
- [ ] next-intl 整合
- [ ] 翻譯檔案（zh-TW, en-US, ja-JP）
- [ ] 語言切換功能
- [ ] TTS 多語言支援（3 種語言）
- [ ] 語言自動偵測
- [ ] 翻譯品質審查報告

#### Sprint 7 交付物
- [ ] 10 個 Prompt Template
- [ ] PromptTemplate 資料模型
- [ ] 主題選擇器 UI
- [ ] 自訂 Prompt 功能
- [ ] 主題分類與搜尋

#### Sprint 8 交付物
- [ ] 整合測試報告
- [ ] Bug 修復清單
- [ ] 效能調校報告
- [ ] UX 優化清單

---

### Phase 3: 優化與測試（M3）

#### Sprint 9 交付物
- [ ] Safari 瀏覽器偵測
- [ ] Safari 專用場景配置
- [ ] Lip Sync 延遲補償（Safari）
- [ ] Safari 測試報告（FPS, 延遲）

#### Sprint 10 交付物
- [ ] Application Insights 整合
- [ ] 自訂事件與指標
- [ ] Azure Dashboard 監控面板
- [ ] 告警規則配置
- [ ] 每日效能報告（Email）

#### Sprint 11-12 交付物
- [ ] Jest 單元測試框架
- [ ] React Testing Library 測試
- [ ] Playwright E2E 測試框架
- [ ] 跨瀏覽器 E2E 測試（4 款瀏覽器）
- [ ] CI/CD 整合（GitHub Actions）
- [ ] 測試報告（HTML）
- [ ] 測試覆蓋率報告（≥ 60%）

---

### 最終交付物

#### 文件
- [ ] MVP 開發計劃（本文件）
- [ ] 技術架構文件
- [ ] API 文件（OpenAPI Spec）
- [ ] 資料庫 Schema 文件
- [ ] 使用者手冊
- [ ] 管理員手冊
- [ ] 部署指南
- [ ] 監控與維運手冊

#### 程式碼
- [ ] Next.js 15 專案（完整原始碼）
- [ ] Prisma Schema（資料庫定義）
- [ ] 單元測試（≥ 60% 覆蓋率）
- [ ] E2E 測試（Playwright）
- [ ] GitHub Actions Workflow

#### 測試報告
- [ ] 功能測試報告
- [ ] 效能測試報告（桌面 + 行動）
- [ ] 跨瀏覽器測試報告（4 款瀏覽器）
- [ ] 安全性測試報告
- [ ] 使用者驗收測試（UAT）報告

#### 部署
- [ ] Azure 生產環境配置
- [ ] Azure Database for PostgreSQL 部署
- [ ] Azure Blob Storage 配置
- [ ] Azure Application Insights 配置
- [ ] Azure Static Web Apps 部署
- [ ] 域名與 SSL 憑證配置

---

## 關鍵決策點

### 決策 1: Monolithic vs Microservices

**問題**: MVP 應採用 Monolithic（單體）或 Microservices（微服務）架構？

**選擇**: **Monolithic 架構**

**理由**:
- ✅ MVP 規模適合單體應用（100-200 MAU）
- ✅ 簡化開發與部署流程（單一專案）
- ✅ 降低基礎設施成本（無需多個服務）
- ✅ 加速開發速度（無跨服務整合成本）
- ✅ 未來可逐步遷移至 Microservices（如需要）

**替代方案**: Microservices（過度複雜，不適合 MVP）

**決策者**: Product Owner + Tech Lead
**決策日期**: 2025-10-15

---

### 決策 2: PostgreSQL vs Cosmos DB

**問題**: 使用 PostgreSQL（關聯式）或 Cosmos DB（NoSQL）作為主資料庫？

**選擇**: **PostgreSQL（Azure Database for PostgreSQL）**

**理由**:
- ✅ 使用者與對話資料適合關聯式資料庫
- ✅ 支援全文搜尋（Full-Text Search）
- ✅ Prisma ORM 支援完整
- ✅ 成本較低（Cosmos DB 較貴）
- ✅ 開發團隊熟悉 SQL

**替代方案**: Cosmos DB（NoSQL，過度設計，成本高）

**決策者**: Tech Lead + Backend Architect
**決策日期**: 2025-10-15

---

### 決策 3: NextAuth.js vs Auth0

**問題**: 使用 NextAuth.js（開源）或 Auth0（商用）進行使用者認證？

**選擇**: **NextAuth.js v5**

**理由**:
- ✅ 開源免費（無額外成本）
- ✅ Next.js 官方推薦
- ✅ 內建 OAuth 支援（Google, Microsoft）
- ✅ 靈活度高（可自訂）
- ✅ 社群活躍，文件完整

**替代方案**: Auth0（付費服務，功能強大但成本高）

**決策者**: Product Owner + Tech Lead
**決策日期**: 2025-10-15

---

### 決策 4: 行動裝置支援策略

**問題**: MVP 應完全支援行動裝置，還是僅提供基本支援？

**選擇**: **完全支援行動裝置（P0 優先級）**

**理由**:
- ✅ 行動裝置使用者佔比可能達 30-50%
- ✅ 響應式設計是現代 Web App 標準
- ✅ 技術可行性已驗證（POC 階段研究）
- ✅ Three.js LOD 可有效優化行動效能
- ✅ 延遲至 Post-MVP 會失去市場機會

**替代方案**: 延遲至 Post-MVP（風險：失去行動使用者）

**決策者**: Product Owner + UX Designer
**決策日期**: 2025-10-15

---

### 決策 5: 多語言支援範圍

**問題**: MVP 應支援哪些語言？繁中 only 還是多語言？

**選擇**: **支援 3 種語言（繁中、英文、日文）**

**理由**:
- ✅ 繁中: 主要市場（台灣）
- ✅ 英文: 國際化必要（全球市場）
- ✅ 日文: 東亞市場擴展（日本市場潛力大）
- ✅ Azure Speech Services 支援完整
- ✅ 翻譯成本可控（使用 i18n 框架）

**替代方案**: 僅繁中（限制市場擴展）

**決策者**: Product Owner + Marketing Team
**決策日期**: 2025-10-15

---

### 決策 6: 付費模式

**問題**: MVP 應實作付費訂閱功能嗎？

**選擇**: **暫不實作（留待 Post-MVP）**

**理由**:
- ✅ MVP 優先驗證產品市場契合度（PMF）
- ✅ 付費系統複雜度高（Stripe 整合、訂閱管理）
- ✅ 使用者規模小（100-200 MAU），收入有限
- ✅ 免費使用可加速使用者獲取
- ✅ Post-MVP 可根據使用者反饋設計付費方案

**替代方案**: 立即實作（增加開發成本，延遲上線）

**決策者**: Product Owner + Business Team
**決策日期**: 2025-10-15

---

### 決策 7: 自動化測試優先級

**問題**: 自動化測試（單元測試、E2E 測試）的優先級？

**選擇**: **P2 優先級（Sprint 11-12 實作）**

**理由**:
- ✅ 優先完成功能開發（P0, P1）
- ✅ 自動化測試耗時較長（6.5 個工作天）
- ✅ 手動測試可先覆蓋核心功能
- ✅ Sprint 11-12 有足夠時間建立測試框架
- ⚠️ 風險: 缺乏自動化測試會增加 Bug 修復成本

**緩解措施**:
- 每 Sprint 進行手動測試
- 關鍵功能（認證、對話）優先建立單元測試
- CI/CD 整合自動化測試（阻擋 Bug 進入生產）

**決策者**: Tech Lead + QA Team
**決策日期**: 2025-10-15

---

## 附錄

### A. 參考文件

| 文件 | 路徑 | 用途 |
|------|------|------|
| POC 技術驗證報告 | `docs/POC_TECHNICAL_REPORT.md` | POC 成果回顧 |
| 瀏覽器相容性報告 | `docs/BROWSER_COMPATIBILITY.md` | 瀏覽器測試結果 |
| Azure 部署指南 | `docs/AZURE_DEPLOYMENT.md` | 部署流程 |
| 生產檢查清單 | `docs/PRODUCTION_CHECKLIST.md` | 上線驗證 |

### B. 技術棧版本

| 套件 | 版本 | 用途 |
|------|------|------|
| Next.js | 15.5.5 | Web 框架 |
| React | 19.2.0 | UI 庫 |
| TypeScript | 5.9.3 | 程式語言 |
| Three.js | 0.180.0 | 3D 渲染 |
| React Three Fiber | 9.4.0 | React 3D 整合 |
| Zustand | 5.0.8 | 狀態管理 |
| Tailwind CSS | 4.1.14 | 樣式框架 |
| Prisma | 5+ | ORM |
| NextAuth.js | v5 | 認證 |
| next-intl | 3+ | i18n |
| Jest | 29 | 單元測試 |
| Playwright | 1.40+ | E2E 測試 |

### C. Azure 服務清單

| 服務 | 用途 | 方案 |
|------|------|------|
| Azure OpenAI | LLM 對話 | GPT-4 Turbo |
| Azure Speech Services | TTS + STT | Standard |
| Azure Database for PostgreSQL | 主資料庫 | Burstable B1ms 或 Free Tier |
| Azure Blob Storage | Avatar 模型儲存 | Standard |
| Azure Static Web Apps | 應用程式託管 | Standard |
| Azure Application Insights | 監控與分析 | Free Tier |

---

## 簽核

| 角色 | 姓名 | 簽名 | 日期 |
|------|------|------|------|
| Product Owner | ___________ | 待簽核 | - |
| Tech Lead | ___________ | 待簽核 | - |
| Backend Architect | ___________ | 待簽核 | - |
| UX Designer | ___________ | 待簽核 | - |
| Business Manager | ___________ | 待簽核 | - |

---

**計劃製作**: Product Team & Dev Team
**最後更新**: 2025-10-15
**文件版本**: 1.0.0
**專案名稱**: Smart AI Avatar Agent
**階段**: MVP (Minimum Viable Product)
**計劃期程**: 2025-10-15 ~ 2026-01-15（3 個月）
