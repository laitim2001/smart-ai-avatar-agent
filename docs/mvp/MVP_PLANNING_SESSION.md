# MVP 規劃會議記錄
**3D Avatar 即時對話系統 - MVP 階段啟動**

## 會議資訊
- **日期**: 2025-10-15 深夜 → 2025-10-16 凌晨
- **階段**: POC 完成 → MVP 規劃啟動
- **參與者**: Development Team + Product Team
- **會議目標**: 完成 MVP Sprint 1 詳細規劃與技術堆疊升級決策

---

## 會議議程

### 1. POC 問題診斷與決策
### 2. MVP 開發啟動日期確認
### 3. UI 組件系統升級決策
### 4. Sprint 1 詳細規劃
### 5. 技術文件準備

---

## 1. POC 問題診斷與決策

### 1.1 問題發現（POC 測試階段）

**測試環境**:
- 日期: 2025-10-15 晚上
- 測試者: User
- 開發伺服器: Port 5000
- Azure 服務: 已完整配置（OpenAI + Speech）

**發現的 6 個問題**:

| 優先級 | 問題 | 影響範圍 | 根本原因 |
|-------|------|---------|---------|
| 🔴 高 | 沒有 Lip Sync（嘴型不動） | 核心功能 | 前端動畫整合問題 |
| 🔴 高 | 沒有基本嘴部動作 | 核心功能 | Fallback 動畫未觸發 |
| 🔴 高 | 音訊播放時嘴巴無動作 | 核心功能 | Viseme 數據未傳遞 |
| 🔴 高 | Avatar 沒有眨眼 | 視覺體驗 | BlinkController 未啟動 |
| 🟡 中 | 連續點擊造成多個音訊重疊 | 穩定性 | 音訊佇列管理問題 |
| 🟢 低 | Smile 按鈕有時造成破圖 | UI 品質 | Blendshape 權重衝突 |

### 1.2 問題診斷結果

**後端狀態** ✅:
- TTS API 正常生成 Viseme 數據（100+ visemes）
- Azure Speech Services 運作正常
- 音訊檔案成功生成（8-12 秒 clips）
- Server logs 顯示一切正常

**前端狀態** ❌:
- BlinkController 未啟動或未整合
- LipSyncController 未接收 Viseme 數據
- audioStore → AvatarModel 數據傳遞鏈斷裂
- useAvatarAnimation 未正確整合動畫邏輯

**診斷文件**: `docs/POC_ISSUES_FIX_PLAN.md`（410 lines）

### 1.3 決策：延後修復，直接啟動 MVP

**三個選項評估**:

**選項 1**: ❌ 立即修復 POC 問題（6-9 小時）
- 優點: POC 功能完整
- 缺點: 延遲 MVP 啟動
- 影響: 時程延誤

**選項 2**: ✅ **延後修復至 MVP 階段**（推薦）
- 優點: POC 已驗證核心技術可行性
- 優點: 動畫整合可在 MVP 統一實作
- 優點: 不影響 MVP 時程
- 決策: 團隊推薦

**選項 3**: ❌ 立即啟動 MVP（User 選擇）
- 優點: 最快啟動 MVP
- 缺點: POC 留有已知問題
- **實際選擇**: User 選擇此方案

**最終決策**: ✅ **立即啟動 MVP，延後 POC 動畫修復**

**理由**:
1. POC 已完成核心技術驗證（LLM, TTS, Avatar 載入, Lip Sync 架構）
2. 後端 TTS + Viseme 生成正常，證明技術可行
3. MVP 階段會重構整個動畫系統，屆時統一修復
4. 提早 1 週啟動 MVP，加速產品上市

---

## 2. MVP 開發啟動日期

### 2.1 建議日期
- **開始日期**: 2025-10-22（下週二）
- **Sprint 1 週期**: 2025-10-22 ~ 2025-11-05（10.5 個工作天）
- **準備期**: 7 天（2025-10-16 ~ 2025-10-21）

### 2.2 準備工作清單（2025-10-16 ~ 2025-10-21）

**Azure 資源申請**:
- [ ] Azure Database for PostgreSQL - Flexible Server（B1ms）
- [ ] 確認現有 Azure OpenAI 與 Speech 資源

**第三方服務註冊**:
- [ ] Google Cloud Console（Google OAuth）
- [ ] Azure Entra ID（Microsoft OAuth）
- [ ] Resend（Email 服務，免費 3000 封/月）
- [ ] Upstash（Redis，免費 10000 requests/日）

**開發環境準備**:
- [ ] Node.js ≥ 18（shadcn/ui 要求）
- [ ] 檢查 Git 狀態（確保在 feature branch）
- [ ] 審閱 Sprint 1 計劃文件

---

## 3. UI 組件系統升級決策

### 3.1 現狀分析

**當前 POC UI 系統**:
| 項目 | 現狀 | 說明 |
|------|------|------|
| 設計系統 | 類似 shadcn/ui | CSS 變數 + HSL 色彩 ✅ |
| UI 組件 | 僅 2 個 | Button, Input |
| 表單處理 | 無 | ❌ 未安裝 |
| Radix UI | 未安裝 | ❌ 無 headless 組件 |

**與另一個專案對比**:
| 技術 | 另一個專案 | 當前 POC | MVP 目標 |
|------|-----------|---------|---------|
| UI 組件庫 | 完整 Radix UI + shadcn/ui | 僅 2 個組件 | **完整 shadcn/ui** |
| 表單處理 | React Hook Form + Zod | 無 | **完整整合** |
| 設計系統 | CSS 變數 + HSL | ✅ 已實作 | 保持一致 |
| 認證 | Clerk + Azure MSAL | 無 | NextAuth.js v5 |

### 3.2 決策：完整安裝 Radix UI + shadcn/ui

**方案 A**: ✅ **完整安裝 Radix UI + shadcn/ui**（選擇此方案）

**優點**:
- ✅ 與另一個專案技術堆疊一致
- ✅ 企業級組件品質（無障礙標準 ARIA）
- ✅ 完整的鍵盤導航支援
- ✅ 未來擴充性強（Dialog, Dropdown, Toast 等）
- ✅ 開發速度快（shadcn/ui CLI）

**缺點**:
- ⚠️ 增加 Sprint 1 時程 0.5 天

**方案 B**: ❌ 保持現狀，逐步擴充
- 優點: 不影響時程
- 缺點: 後續維護成本高，與另一個專案不一致

### 3.3 安裝內容

**核心套件**:
```bash
# 表單處理
react-hook-form
zod
@hookform/resolvers

# Radix UI 核心組件（7 個）
@radix-ui/react-label
@radix-ui/react-slot
@radix-ui/react-dropdown-menu
@radix-ui/react-dialog
@radix-ui/react-toast
# ... 等
```

**shadcn/ui 組件**（11 個）:
1. button
2. input
3. label
4. form
5. toast
6. dropdown-menu
7. dialog
8. card
9. separator
10. avatar
11. skeleton

**預計時間**: 1.5-2 小時（包含測試）

---

## 4. Sprint 1 詳細規劃

### 4.1 Sprint 1 概覽

**基本資訊**:
- **Sprint**: Sprint 1 / 12
- **時程**: 2025-10-22 ~ 2025-11-05（10.5 個工作天）
- **Epic**: Epic 1 - 核心使用者功能
- **Story**: Story 1.1 - 使用者認證系統
- **Story Points**: 11 SP（原 10 SP + shadcn/ui 整合）
- **優先級**: P0（必要功能）

### 4.2 技術堆疊

**認證框架**:
- NextAuth.js v5（next-auth@5.0.0-beta.25）
- Adapter: @auth/prisma-adapter
- Providers: Credentials, Google, Microsoft

**資料庫**:
- Azure Database for PostgreSQL - Flexible Server
- SKU: Burstable B1ms（1 vCore, 2GB RAM）
- 成本: NT$330/月

**ORM**:
- Prisma v6.2.0
- TypeScript-first, 型別安全

**UI 系統**:
- Radix UI（headless components）
- shadcn/ui（styled components）
- React Hook Form + Zod（表單驗證）

**Email 服務**:
- Resend（免費 3,000 封/月）

**Rate Limiting**:
- Upstash Redis（免費 10,000 requests/日）

### 4.3 功能範圍

**必要功能**（P0）:
- ✅ 使用者註冊（Email/Password）
- ✅ 使用者登入（Email/Password + Remember Me）
- ✅ OAuth 2.0 登入（Google, Microsoft）
- ✅ 密碼重設（Email Token, 1 小時有效）
- ✅ 使用者設定頁面（編輯名稱、頭像、密碼）
- ✅ 登出功能
- ✅ 首頁認證保護（Middleware）

**安全性**:
- ✅ 密碼雜湊（bcryptjs, 10 rounds）
- ✅ Session 儲存（PostgreSQL）
- ✅ CSRF 保護（NextAuth.js 內建）
- ✅ Rate Limiting（登入 5 次/分鐘/IP）

**測試**:
- ✅ 單元測試覆蓋率 ≥ 60%（認證模組）
- ✅ 手動測試完整

### 4.4 開發任務分解（10.5 天）

**Day 1（1.5 天）**: 專案設定與 UI 系統升級
- 上午（4 小時）:
  - 安裝認證套件
  - 設定 Azure PostgreSQL
  - 初始化 Prisma
  - 設定 OAuth Providers
  - 設定 Resend & Upstash
- 下午（2-3 小時）:
  - 安裝表單處理套件
  - 初始化 shadcn/ui
  - 安裝 11 個 UI 組件
  - 建立測試頁面（可選）

**Day 2-3（2 天）**: NextAuth.js 整合與註冊功能
- 建立 NextAuth.js 配置
- 建立註冊 API 與 UI
- 密碼驗證邏輯

**Day 4-5（1.5 天）**: 登入與 OAuth 功能
- 建立登入頁面
- 整合 Email/Password 登入
- 整合 Google & Microsoft OAuth

**Day 6（1 天）**: 密碼重設功能
- 建立忘記密碼 API
- 建立重設密碼 API
- Email 範本整合

**Day 7（1 天）**: 使用者設定頁面
- 建立設定頁面 UI
- 個人資料更新 API
- 密碼變更 API

**Day 8（1 天）**: 首頁認證保護
- 建立 Middleware
- 建立 Header 組件
- 實作登出功能

**Day 9（1 天）**: Rate Limiting 與安全性
- 實作 Rate Limiting
- 安全性檢查

**Day 10（1 天）**: 單元測試
- Jest 設定
- 撰寫測試

### 4.5 驗收標準

**功能驗收**:
- ✅ Email/Password 註冊與登入正常
- ✅ Google OAuth 登入正常
- ✅ Microsoft OAuth 登入正常
- ✅ 密碼重設功能完整可用
- ✅ 使用者可編輯個人資料
- ✅ 登出功能正常

**技術驗收**:
- ✅ Azure PostgreSQL 正常運行
- ✅ Prisma 遷移成功
- ✅ NextAuth.js 整合完成
- ✅ shadcn/ui 組件系統安裝完成（11 個組件）
- ✅ 無 TypeScript 錯誤
- ✅ ESLint 檢查通過

**安全性驗收**:
- ✅ Rate Limiting 正常運作
- ✅ 密碼雜湊（bcryptjs）
- ✅ Session 儲存於 PostgreSQL
- ✅ CSRF 保護啟用

---

## 5. 技術文件準備

### 5.1 已建立文件

**文件 1**: `docs/SPRINT_1_PLAN.md`（2,000+ lines）
- Sprint 1 完整開發計劃
- 包含所有任務分解與驗收標準
- 時程: 10.5 天（已更新）

**文件 2**: `docs/SHADCN_UI_SETUP_GUIDE.md`（1,200+ lines）
- shadcn/ui 完整安裝指南
- 11 個組件詳細說明
- 使用範例與故障排除
- 預計時間: 1.5-2 小時

**文件 3**: `docs/POC_ISSUES_FIX_PLAN.md`（410 lines）
- 6 個 POC 問題詳細分析
- 修復方案與時程估算
- 測試計劃與成功標準

**文件 4**: `docs/MVP_DEVELOPMENT_PLAN.md`（既有）
- MVP 完整開發計劃（3 個月）
- 12 個 Sprint 規劃
- 3 個 Epic, 10 個 Stories

### 5.2 文件品質

**特點**:
- ✅ 繁體中文（Traditional Chinese）
- ✅ 完整的程式碼範例
- ✅ 詳細的步驟指引
- ✅ 可複製貼上的指令
- ✅ 完整的驗收標準
- ✅ 故障排除指南

**總文件量**: 4,500+ lines, 120+ KB

---

## 6. 會議決議與行動項目

### 6.1 關鍵決議

| 決議事項 | 內容 | 負責人 | 狀態 |
|---------|------|--------|------|
| **POC 問題處理** | 延後至 MVP 階段統一修復 | Dev Team | ✅ 決議 |
| **MVP 啟動日期** | 2025-10-22（下週二） | Product Team | ✅ 確認 |
| **UI 系統升級** | 完整安裝 Radix UI + shadcn/ui | Dev Team | ✅ 決議 |
| **Sprint 1 時程** | 10.5 天（增加 0.5 天） | Dev Team | ✅ 確認 |
| **技術堆疊** | NextAuth v5 + Prisma + PostgreSQL | Dev Team | ✅ 確認 |

### 6.2 行動項目

**立即行動**（2025-10-16 ~ 2025-10-21）:
- [ ] 審閱 Sprint 1 計劃文件
- [ ] 申請 Azure PostgreSQL 資源
- [ ] 註冊第三方服務（Google, Microsoft, Resend, Upstash）
- [ ] 準備開發環境（Node.js ≥ 18）

**Sprint 1 Day 1**（2025-10-22）:
- [ ] 執行 shadcn/ui 安裝（按照 SHADCN_UI_SETUP_GUIDE.md）
- [ ] 完成 Azure PostgreSQL 設定
- [ ] 初始化 Prisma
- [ ] 設定 OAuth Providers

---

## 7. 風險評估

### 7.1 已識別風險

| 風險 | 影響 | 機率 | 緩解策略 | 狀態 |
|------|------|------|---------|------|
| POC 動畫問題未修復 | 低 | 確定 | MVP 統一重構 | ✅ 接受 |
| shadcn/ui 安裝複雜 | 低 | 低 | 完整安裝指南已準備 | ✅ 緩解 |
| Azure 服務申請延遲 | 中 | 中 | 提前 7 天申請 | ⚠️ 監控 |
| OAuth 配置困難 | 低 | 低 | 詳細步驟已文件化 | ✅ 緩解 |
| Sprint 1 時程超支 | 中 | 低 | 每日 Standup 監控 | ⚠️ 監控 |

### 7.2 成功因素

**技術因素**:
- ✅ 完整的技術文件支援
- ✅ shadcn/ui 安裝指南詳細
- ✅ Sprint 1 計劃完整
- ✅ 團隊對 Next.js 熟悉

**管理因素**:
- ✅ 清晰的決策與責任分配
- ✅ 充足的準備時間（7 天）
- ✅ POC 階段經驗積累
- ✅ 時程緩衝（0.5 天）

---

## 8. 會議成果總結

### 8.1 文件交付

**已完成**:
1. ✅ Sprint 1 詳細計劃（2,000+ lines）
2. ✅ shadcn/ui 安裝指南（1,200+ lines）
3. ✅ POC 問題診斷與修復計劃（410 lines）
4. ✅ MVP 規劃會議記錄（本文件）

**文件總量**: 4,500+ lines, 120+ KB

### 8.2 技術堆疊確認

**MVP Sprint 1 技術堆疊**:
```yaml
Frontend:
  - Next.js: 15.5.5
  - React: 19.2.0
  - TypeScript: 5.9.3
  - Tailwind CSS: 4.1.14
  - shadcn/ui: 完整組件系統 ✨ 新增
  - Radix UI: 完整 headless 組件 ✨ 新增
  - React Hook Form + Zod: 表單驗證 ✨ 新增

Backend:
  - NextAuth.js: v5 ✨ 新增
  - Prisma: v6.2.0 ✨ 新增
  - PostgreSQL: Azure Flexible Server ✨ 新增
  - Resend: Email 服務 ✨ 新增
  - Upstash Redis: Rate Limiting ✨ 新增

Existing:
  - Azure OpenAI: GPT-4 Turbo
  - Azure Speech: TTS
  - Three.js: 0.180.0
  - React Three Fiber: 9.4.0
  - Zustand: 5.0.8
```

### 8.3 時程確認

**MVP Sprint 1**:
- 開始日期: 2025-10-22
- 結束日期: 2025-11-05
- 總時程: 10.5 個工作天
- Story Points: 11 SP

**準備期**:
- 期間: 2025-10-16 ~ 2025-10-21
- 時長: 7 天
- 主要工作: 資源申請、服務註冊、文件審閱

---

## 9. 下一步行動

### 9.1 立即行動（今天，2025-10-16）
1. ✅ 執行索引維護（`npm run sync-index`）
2. ✅ 更新專案狀態文件（PROJECT_STATUS.md）
3. ✅ 建立 MVP 規劃會議記錄（本文件）
4. ⏳ 同步到 GitHub

### 9.2 準備期行動（2025-10-16 ~ 2025-10-21）
1. 審閱所有文件
2. 申請 Azure 資源
3. 註冊第三方服務
4. 準備開發環境

### 9.3 Sprint 1 啟動（2025-10-22）
1. 執行 Day 1 上午任務（認證套件安裝）
2. 執行 Day 1 下午任務（shadcn/ui 安裝）
3. 驗收 Day 1 成果

---

## 10. 會議附錄

### 10.1 參考文件清單

| 文件 | 路徑 | 用途 |
|------|------|------|
| Sprint 1 計劃 | `docs/SPRINT_1_PLAN.md` | Day 1-10 開發指南 |
| shadcn/ui 指南 | `docs/SHADCN_UI_SETUP_GUIDE.md` | UI 系統安裝步驟 |
| POC 問題計劃 | `docs/POC_ISSUES_FIX_PLAN.md` | 問題分析與修復 |
| MVP 開發計劃 | `docs/MVP_DEVELOPMENT_PLAN.md` | 3 個月完整規劃 |

### 10.2 關鍵術語表

| 術語 | 說明 |
|------|------|
| shadcn/ui | 基於 Radix UI 的完整 UI 組件系統 |
| Radix UI | Headless 無樣式 UI 組件庫 |
| NextAuth.js v5 | Next.js 官方認證框架（最新版） |
| Prisma | TypeScript-first ORM |
| Resend | 現代化 Email API 服務 |
| Upstash | Serverless Redis 服務 |

### 10.3 會議時長記錄

- **會議開始**: 2025-10-15 深夜
- **會議結束**: 2025-10-16 凌晨
- **總時長**: 約 3-4 小時
- **主要活動**:
  - POC 測試與問題診斷（1 小時）
  - MVP 規劃與決策討論（1 小時）
  - 文件撰寫與審閱（1.5-2 小時）

---

**文件維護**: Development Team + Product Team
**最後更新**: 2025-10-16
**文件狀態**: 已完成
**下一步**: 準備期行動執行（2025-10-16 ~ 2025-10-21）
