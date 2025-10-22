# 項目文件重組計劃 v2.0

**生成日期**: 2025-10-22
**範圍**: 根目錄、docs/、agent-brain/ 的 MD 文件
**排除**: .bmad-*/、.claude/ 相關文件
**目標**: 建立清晰的階段性分類 + 設計持續維護系統

---

## 📊 執行摘要

### 分析範圍統計

| 目錄 | MD 文件數量 | 狀態 |
|------|-----------|------|
| **根目錄** | 21 | 混合（活躍 + 歷史 + 重複） |
| **docs/** | 128 | 混合（POC + MVP + 修復日誌） |
| **agent-brain/** | 21 | 活躍（知識庫系統） |
| **總計** | **170** | 需要重組與分類 |

### 核心問題

1. ✅ **時期混雜**: POC 規劃、POC 開發、MVP 開發文件混在一起
2. ✅ **根目錄混亂**: 21 個 MD 文件，包含測試、除錯、規劃、狀態等各類文件
3. ✅ **docs/ 過度擁擠**: 76 個根層級 MD 文件，缺乏子目錄組織
4. ✅ **重複文件**: 根目錄有重複的範例文件
5. ✅ **缺乏維護系統**: 無明確的文件生命週期管理規範

---

## 🗂️ 現狀詳細分析

### 1. 根目錄文件分析 (21 個)

#### 1.1 活躍核心文件 (必須保留) - 5 個

| 文件 | 用途 | 更新頻率 | 建議 |
|------|------|---------|------|
| `README.md` | 用戶快速開始指南 | Epic 完成後 | ✅ 保留根目錄 |
| `CLAUDE.md` | AI 助手技術指南 | 新功能/模式變更 | ✅ 保留根目錄 |
| `AI_ASSISTANT_GUIDE.md` | 開發者完整指南 | 規範變更 | ✅ 保留根目錄 |
| `PROJECT_INDEX.md` | 文件索引 | Story 完成後 | ✅ 保留根目錄 |
| `.gitignore` | Git 排除規則 | 按需 | ✅ 保留根目錄 |

#### 1.2 歷史參考文件 (POC 完成) - 4 個

| 文件 | 時期 | 建議處理 |
|------|------|---------|
| `PROJECT_STATUS.md` | POC 最終狀態 (2025-10-15) | 移至 `docs/00-archive/poc/` |
| `DEVELOPMENT_STATUS.md` | POC 開發進度 (2025-10-15) | 移至 `docs/00-archive/poc/` |
| `SPRINT_PLAN.md` | 原始 12 週計劃 | 移至 `docs/00-archive/planning/` |
| `PROJECT_OVERVIEW.md` | 項目概覽 | 移至 `docs/00-archive/planning/` |

#### 1.3 測試與除錯文件 (臨時性) - 6 個

| 文件 | 用途 | 建議處理 |
|------|------|---------|
| `AUDIO_TROUBLESHOOT.md` | 音訊問題排查 | 移至 `docs/troubleshooting/` |
| `DEBUG_AUDIO_ISSUE.md` | 音訊 Debug 記錄 | 移至 `docs/troubleshooting/` |
| `DEBUG_TEST_GUIDE.md` | Debug 測試指南 | 移至 `docs/troubleshooting/` |
| `BROWSER_TEST_GUIDE.md` | 瀏覽器測試指南 | 移至 `docs/testing/` |
| `TEST_ADAPTIVE_INTENSITY.md` | Lip Sync 測試 | 移至 `docs/testing/` |
| `CLEAR_CACHE_INSTRUCTIONS.md` | 快取清理指令 | 移至 `docs/troubleshooting/` |

#### 1.4 開發規劃文件 (過渡期) - 3 個

| 文件 | 時期 | 建議處理 |
|------|------|---------|
| `DEVELOPMENT_ROADMAP.md` | 開發路線圖 | 合併至 MVP_PROGRESS.md 或歸檔 |
| `EPIC5_PART1_IMPLEMENTATION.md` | Epic 5 實作記錄 | 移至 `docs/00-archive/poc/epics/` |
| `plan.md` | 臨時規劃 | 檢視後刪除或歸檔 |
| `log.md` | 臨時日誌 | 檢視後刪除或歸檔 |

#### 1.5 維護與索引文件 (活躍) - 2 個

| 文件 | 用途 | 建議 |
|------|------|------|
| `INDEX_MAINTENANCE.md` | 索引維護指南 | ✅ 保留根目錄或移至 `docs/` |
| `QUICK_START.md` | 快速開始 | 檢查是否與 README.md 重複 |

#### 1.6 重複文件 (待刪除) - 1 個

| 文件 | 原因 | 處理 |
|------|------|------|
| `C:smart-ai-avatar-agentdocsMVP_PROGRESS.md` | 檔名錯誤/重複 | ❌ 刪除 |

---

### 2. docs/ 目錄文件分析 (128 個)

#### 2.1 根層級文件 (76 個) - 需要分類

**問題**: 過度擁擠，缺乏子目錄組織

**文件類型分佈**:

| 類型 | 數量 | 範例 |
|------|------|------|
| **MVP 進度追蹤** | 5+ | MVP_PROGRESS.md, MVP_DAY2_PROGRESS.md, MVP_PROGRESS_SPRINT8.md |
| **MVP 規劃與報告** | 4 | MVP_DEVELOPMENT_PLAN.md, MVP_PLANNING_SESSION.md, MVP_FINAL_REPORT.md |
| **API 文件** | 5 | API_REFERENCE_SPRINT2.md, API_CONVERSATIONS.md, API_AVATAR_FAVORITE.md |
| **部署與環境** | 4 | deployment-guide.md, LOCAL_DEV_GUIDE.md, AZURE_DEPLOYMENT.md, ENVIRONMENT_VARIABLES.md |
| **測試文件** | 3 | BROWSER_COMPATIBILITY.md, CROSS_BROWSER_TESTING.md, AVATAR_LIP_SYNC_TEST.md |
| **修復日誌** | 4+ | FIXES_2025-10-18.md, FIXES_2025-10-19.md, LIPSYNC_FIXES_2025-10-20.md |
| **知識庫系統** | 5 | KNOWLEDGE_*.md (設計、實作、問題修復、用戶指南) |
| **實作指南** | 3 | LIP_SYNC_IMPLEMENTATION_GUIDE.md, I18N_IMPLEMENTATION_STATUS.md |
| **架構與設計** | 5+ | architecture.md, DESIGN-SYSTEM.md, MULTI_AGENT_ARCHITECTURE_DESIGN.md |
| **其他** | 38+ | 各類實作、訓練、規劃文件 |

#### 2.2 子目錄文件 (52 個)

| 子目錄 | 數量 | 內容 |
|--------|------|------|
| `docs/stories/` | 42 | POC Story 實作文件 (Epic 1-5) |
| `docs/agent-brain/` (符號連結?) | 未確認 | 可能是符號連結至根層級 agent-brain/ |

---

### 3. agent-brain/ 知識庫系統 (21 個)

#### 3.1 系統指南文件 (4 個)

| 文件 | 用途 | 狀態 |
|------|------|------|
| `README.md` | 知識庫總覽 | ✅ 活躍 |
| `KNOWLEDGE_BASE_GUIDE.md` | 使用指南 | ✅ 活躍 |
| `MAINTENANCE_GUIDE.md` | 維護指南 | ✅ 活躍 |
| `TECHNICAL_FLOW.md` | 技術流程 | ✅ 活躍 |

#### 3.2 CDO Advisor 知識庫 (14 個)

**多語言結構** (繁中、英文、日文):

| 知識類型 | 文件數量 | 位置 |
|---------|---------|------|
| **Persona** | 3 | `agents/cdo-advisor/persona*.md` |
| **FAQ** | 3 | `agents/cdo-advisor/cdo_faq*.md` |
| **KPI Dictionary** | 3 | `agents/cdo-advisor/kpi_dictionary*.md` |
| **POV Briefing** | 3 | `agents/cdo-advisor/pov_briefing*.md` |
| **Decision Logs** | 1 | `agents/cdo-advisor/decisions/decision_log_*.md` |
| **Meeting Summaries** | 1 | `agents/cdo-advisor/meetings/meeting_summary_*.md` |

#### 3.3 根層級範例文件 (3 個) - 重複

| 文件 | 狀態 | 處理 |
|------|------|------|
| `agent-brain/persona.md` | 範例/重複 | ❌ 刪除 (已有 agents/cdo-advisor/persona*.md) |
| `agent-brain/cdo_faq.md` | 範例/重複 | ❌ 刪除 |
| `agent-brain/kpi_dictionary.md` | 範例/重複 | ❌ 刪除 |

**建議**: agent-brain/ 整體結構良好，僅需刪除 3 個重複的範例文件

---

## 🎯 重組目標結構

### 設計原則

1. **階段性分類**: 按項目時期組織（規劃 → POC → MVP）
2. **類型分類**: 同類型文件歸類（API、測試、修復、實作）
3. **活躍優先**: 當前活躍文件保持易訪問位置
4. **歷史歸檔**: 完成階段的文件明確歸檔
5. **避免過深**: 最多 3 層目錄深度
6. **命名一致**: 統一命名規範，易於搜尋

### 建議目錄結構

```
C:\smart-ai-avatar-agent/
│
├── README.md                          # ✅ 用戶快速開始
├── CLAUDE.md                          # ✅ AI 助手技術指南
├── AI_ASSISTANT_GUIDE.md              # ✅ 開發者完整指南
├── PROJECT_INDEX.md                   # ✅ 文件索引
├── INDEX_MAINTENANCE.md               # ✅ 索引維護指南
│
├── docs/
│   │
│   ├── README.md                      # 🆕 docs/ 目錄導航說明
│   │
│   ├── MVP_PROGRESS.md                # ✅ MVP 進度追蹤（活躍）
│   ├── deployment-guide.md            # ✅ 部署指南（活躍）
│   ├── local-dev-guide.md             # ✅ 本地開發指南（活躍）
│   │
│   ├── 00-archive/                    # 🆕 歷史歸檔
│   │   │
│   │   ├── planning/                  # POC 初期規劃（歷史存檔）
│   │   │   ├── README.md              # 本階段說明
│   │   │   ├── SPRINT_PLAN.md         # 原始 12 週計劃
│   │   │   ├── PROJECT_OVERVIEW.md    # 項目概覽
│   │   │   └── architecture.md        # 初期架構設計
│   │   │
│   │   └── poc/                       # POC 開發階段（歷史存檔）
│   │       ├── README.md              # 本階段說明
│   │       ├── PROJECT_STATUS.md      # POC 最終狀態
│   │       ├── DEVELOPMENT_STATUS.md  # POC 開發進度
│   │       │
│   │       ├── stories/               # Story 實作文件（42 個）
│   │       │   ├── epic-1/
│   │       │   │   ├── 1.1-*.md
│   │       │   │   ├── 1.2-*.md
│   │       │   │   └── ...
│   │       │   ├── epic-2/
│   │       │   ├── epic-3/
│   │       │   ├── epic-4/
│   │       │   └── epic-5/
│   │       │
│   │       └── epics/                 # Epic 完成報告
│   │           ├── EPIC5_PART1_IMPLEMENTATION.md
│   │           └── (其他 Epic 報告如存在)
│   │
│   ├── api/                           # 🆕 API 文件集中
│   │   ├── README.md                  # API 文件總覽
│   │   ├── API_REFERENCE_SPRINT2.md
│   │   ├── API_REFERENCE_SPRINT3.md
│   │   ├── API_CONVERSATIONS.md
│   │   └── API_AVATAR_FAVORITE.md
│   │
│   ├── deployment/                    # 🆕 部署相關文件
│   │   ├── deployment-guide.md        # 主要部署指南
│   │   ├── AZURE_DEPLOYMENT.md
│   │   ├── LOCAL_DEV_GUIDE.md
│   │   └── ENVIRONMENT_VARIABLES.md
│   │
│   ├── testing/                       # 🆕 測試文件集中
│   │   ├── README.md                  # 測試總覽
│   │   ├── BROWSER_COMPATIBILITY.md
│   │   ├── CROSS_BROWSER_TESTING.md
│   │   ├── BROWSER_TEST_GUIDE.md      # 從根目錄移入
│   │   ├── AVATAR_LIP_SYNC_TEST.md
│   │   └── TEST_ADAPTIVE_INTENSITY.md # 從根目錄移入
│   │
│   ├── troubleshooting/               # 🆕 故障排除文件
│   │   ├── README.md                  # 故障排除索引
│   │   ├── AUDIO_TROUBLESHOOT.md      # 從根目錄移入
│   │   ├── DEBUG_AUDIO_ISSUE.md       # 從根目錄移入
│   │   ├── DEBUG_TEST_GUIDE.md        # 從根目錄移入
│   │   └── CLEAR_CACHE_INSTRUCTIONS.md # 從根目錄移入
│   │
│   ├── fixes/                         # 🆕 修復日誌集中
│   │   ├── README.md                  # 修復日誌索引（按日期排序）
│   │   ├── 2025-10-18-general-fixes.md    # 重命名 FIXES_2025-10-18.md
│   │   ├── 2025-10-19-general-fixes.md    # 重命名 FIXES_2025-10-19.md
│   │   ├── 2025-10-20-lipsync-fixes.md    # 重命名 LIPSYNC_FIXES_2025-10-20.md
│   │   ├── i18n-hydration-fix.md          # 重命名 I18N_HYDRATION_FIX.md
│   │   ├── poc-issues-fix-plan.md         # 重命名 POC_ISSUES_FIX_PLAN.md
│   │   └── knowledge-system-issues-fixes.md # 重命名 KNOWLEDGE_SYSTEM_ISSUES_AND_FIXES.md
│   │
│   ├── implementation/                # 🆕 實作指南集中
│   │   ├── README.md                  # 實作指南總覽
│   │   ├── lip-sync/
│   │   │   ├── LIP_SYNC_IMPLEMENTATION_GUIDE.md
│   │   │   ├── LIP_SYNC_COMPLETION_REPORT.md
│   │   │   └── related-docs...
│   │   ├── i18n/
│   │   │   ├── I18N_IMPLEMENTATION_STATUS.md
│   │   │   └── related-docs...
│   │   ├── knowledge-system/
│   │   │   ├── KNOWLEDGE_MANAGEMENT_SYSTEM_DESIGN.md
│   │   │   ├── KNOWLEDGE_SYSTEM_IMPLEMENTATION_STATUS.md
│   │   │   ├── KNOWLEDGE_SYSTEM_USER_GUIDE.md
│   │   │   └── related-docs...
│   │   ├── custom-avatar/
│   │   │   ├── CUSTOM_AVATAR_SOLUTION.md
│   │   │   └── related-docs...
│   │   └── multi-agent/
│   │       ├── MULTI_AGENT_ARCHITECTURE_DESIGN.md
│   │       ├── MULTILINGUAL_AND_MULTI_AGENT_IMPLEMENTATION_PLAN.md
│   │       └── related-docs...
│   │
│   ├── design/                        # 🆕 設計與架構文件
│   │   ├── architecture.md            # 最新架構文件（活躍）
│   │   ├── DESIGN-SYSTEM.md
│   │   ├── front-end-spec.md
│   │   └── related-docs...
│   │
│   ├── mvp/                           # 🆕 MVP 規劃與報告
│   │   ├── MVP_PROGRESS.md            # 主要進度追蹤（符號連結至 docs/）
│   │   ├── MVP_DEVELOPMENT_PLAN.md
│   │   ├── MVP_PLANNING_SESSION.md
│   │   ├── MVP_FINAL_REPORT.md
│   │   ├── MVP_DAY2_PROGRESS.md
│   │   ├── MVP_PROGRESS_SPRINT8.md
│   │   └── MVP_PROGRESS_ISSUES.md
│   │
│   ├── training/                      # 🆕 訓練與指南
│   │   ├── AI_AGENT_TRAINING_GUIDE.md
│   │   └── related-docs...
│   │
│   └── misc/                          # 🆕 其他文件
│       ├── cost-analysis.md
│       └── other-docs...
│
├── agent-brain/                       # ✅ 知識庫系統（保持現狀，僅刪除重複）
│   ├── README.md
│   ├── KNOWLEDGE_BASE_GUIDE.md
│   ├── MAINTENANCE_GUIDE.md
│   ├── TECHNICAL_FLOW.md
│   └── agents/
│       └── cdo-advisor/
│           ├── persona*.md (3 語言)
│           ├── cdo_faq*.md (3 語言)
│           ├── kpi_dictionary*.md (3 語言)
│           ├── pov_briefing*.md (3 語言)
│           ├── decisions/
│           └── meetings/
│
├── claudedocs/                        # ✅ Claude 分析報告（保持）
│   ├── MD_FILES_ANALYSIS_REPORT.md
│   └── PROJECT_DOCS_REORGANIZATION_PLAN.md
│
└── (刪除的文件)
    ├── C:smart-ai-avatar-agentdocsMVP_PROGRESS.md  # ❌ 檔名錯誤
    ├── agent-brain/persona.md                      # ❌ 重複
    ├── agent-brain/cdo_faq.md                      # ❌ 重複
    ├── agent-brain/kpi_dictionary.md               # ❌ 重複
    ├── plan.md                                     # ❌ 臨時文件（檢視後決定）
    ├── log.md                                      # ❌ 臨時文件（檢視後決定）
    └── QUICK_START.md                              # ❌ 如與 README.md 重複
```

---

## 📐 文件命名規範

### 命名原則

**1. 日期前綴規範** (修復日誌、臨時文件):
```
格式: YYYY-MM-DD-<描述>.md
範例: 2025-10-20-lipsync-fixes.md
```

**2. 類型前綴規範** (特定類型文件):
```
API_*: API 文件
MVP_*: MVP 相關文件
KNOWLEDGE_*: 知識庫系統文件
```

**3. 小寫連字符規範** (一般文件):
```
建議: kebab-case (小寫-連字符)
範例: deployment-guide.md, local-dev-guide.md
避免: DeploymentGuide.md, Deployment_Guide.md
```

**4. 描述性命名**:
```
❌ 不佳: doc1.md, temp.md, new.md
✅ 良好: api-conversations.md, lipsync-implementation.md
```

---

## 🔄 文件生命週期管理系統

### 階段 1: 文件創建 (Creation)

**觸發時機**:
- 新功能開發開始
- 新問題需要記錄
- 新的設計決策

**創建規範**:
```yaml
必需欄位:
  - 標題: 清楚描述文件用途
  - 創建日期: YYYY-MM-DD
  - 文件狀態: 🔄 草稿 / ✅ 完成
  - 用途說明: 1-2 句話說明文件目的

建議欄位:
  - 相關 Story/Epic: 如適用
  - 依賴文件: 相關聯的其他文件
  - 維護者: 負責更新的人員
```

**創建位置決策樹**:
```
文件類型?
├─ API 文件 → docs/api/
├─ 測試文件 → docs/testing/
├─ 修復日誌 → docs/fixes/ (使用日期前綴)
├─ 實作指南 → docs/implementation/<feature>/
├─ 設計文件 → docs/design/
├─ MVP 規劃 → docs/mvp/
└─ 其他 → docs/misc/ (臨時，待分類)
```

---

### 階段 2: 文件活躍期 (Active)

**維護頻率**:
```yaml
高頻更新 (每日):
  - MVP_PROGRESS.md
  - 當前 Sprint 的實作文件

中頻更新 (每週):
  - API 文件（新增 endpoint 時）
  - 測試文件（新增測試案例時）

低頻更新 (按需):
  - 部署指南（環境變更時）
  - 架構文件（重大重構時）
```

**更新責任**:
```yaml
開發者責任:
  - 完成 Story 後更新相關文件
  - 發現問題時記錄修復日誌
  - 新增功能時更新實作指南

Tech Lead 責任:
  - 審查文件品質
  - 維護 PROJECT_INDEX.md
  - 定期檢視文件結構

團隊責任:
  - Sprint 回顧時檢視文件完整性
  - 提出文件改進建議
```

---

### 階段 3: 文件完成/凍結 (Completed)

**觸發時機**:
- Story/Epic 完成驗收
- 功能正式上線
- 階段性開發結束（如 POC 完成）

**標記方式**:
```markdown
# 文件標題

> **文件狀態**: ✅ 已完成 / 🔒 已凍結
> **完成日期**: 2025-10-15
> **相關版本**: v1.0.0 POC
> **後續參考**: 詳見 MVP_PROGRESS.md
```

**處理方式**:
- ✅ 保留在原位（如仍有參考價值）
- 📁 移至 `docs/00-archive/` (如為歷史記錄)
- 🔗 創建符號連結或在新文件中參考

---

### 階段 4: 文件歸檔 (Archived)

**觸發時機**:
- 開發階段結束（POC → MVP）
- 功能被替換或廢棄
- 文件不再需要頻繁訪問

**歸檔位置**:
```
docs/00-archive/
├── planning/      # 初期規劃文件
├── poc/           # POC 階段文件
├── deprecated/    # 已廢棄的文件
└── legacy/        # 舊版本文件
```

**歸檔標記**:
```markdown
# 文件標題

> **⚠️ 歷史歸檔文件**
> **歸檔日期**: 2025-10-15
> **歸檔原因**: POC 階段完成，進入 MVP 階段
> **最新文件**: 詳見 docs/MVP_PROGRESS.md
> **保留原因**: 作為項目歷史參考
```

---

### 階段 5: 文件刪除 (Deleted)

**刪除標準**:
```yaml
可以刪除:
  ✅ 臨時測試文件（已過時）
  ✅ 重複的範例文件
  ✅ 檔名錯誤的文件
  ✅ 空白或無用的文件
  ✅ 已被新文件完全取代的舊文件

禁止刪除:
  ❌ 有參考價值的歷史文件
  ❌ 包含重要決策記錄的文件
  ❌ 與 Git commit 關聯的文件
  ❌ 團隊成員可能需要查閱的文件
```

**刪除流程**:
```bash
# 1. 確認文件確實不再需要
git log --follow -- <file_path>  # 檢視歷史

# 2. 尋求團隊確認（重要文件）
# 在 Slack/Teams 詢問團隊成員

# 3. 使用 git rm 刪除（保留 Git 歷史）
git rm <file_path>

# 4. 提交時清楚說明刪除原因
git commit -m "docs: remove obsolete file <filename>

Reason: <說明為何刪除>
Replaced by: <新文件名> (如適用)
Last reference: <最後使用時間>"
```

---

## 📋 持續維護系統設計

### 系統概覽

**目標**: 建立一套規範化、自動化的文件管理流程，確保文件始終保持組織良好且易於訪問。

**核心組件**:
1. **文件元數據系統** (Metadata System)
2. **自動化檢查工具** (Automation Tools)
3. **維護工作流程** (Maintenance Workflow)
4. **文件索引系統** (Index System)

---

### 組件 1: 文件元數據系統

**設計**: 在每個 MD 文件頂部加入結構化元數據

**元數據模板**:
```markdown
---
title: "文件標題"
created: "2025-10-22"
updated: "2025-10-22"
status: "active" | "completed" | "archived" | "draft"
category: "api" | "testing" | "implementation" | "design" | "mvp" | "fix"
phase: "planning" | "poc" | "mvp" | "production"
tags: ["lip-sync", "azure", "tts"]
related:
  - docs/implementation/lip-sync/LIP_SYNC_COMPLETION_REPORT.md
  - docs/fixes/2025-10-20-lipsync-fixes.md
maintainer: "Tech Lead"
---

# 文件標題

文件內容...
```

**元數據欄位說明**:

| 欄位 | 必需 | 說明 | 範例值 |
|------|------|------|--------|
| `title` | ✅ | 文件標題 | "Lip Sync 實作指南" |
| `created` | ✅ | 創建日期 | "2025-10-20" |
| `updated` | ✅ | 最後更新日期 | "2025-10-22" |
| `status` | ✅ | 文件狀態 | "active", "completed", "archived", "draft" |
| `category` | ✅ | 文件類別 | "implementation", "testing", "api" |
| `phase` | ✅ | 項目階段 | "poc", "mvp", "production" |
| `tags` | ⚪ | 關鍵字標籤 | ["lip-sync", "azure"] |
| `related` | ⚪ | 相關文件 | 文件路徑列表 |
| `maintainer` | ⚪ | 維護負責人 | "Tech Lead", "Dev Team" |

---

### 組件 2: 自動化檢查工具

**工具 A: `docs-validator.js`** - 驗證文件元數據與結構

**功能**:
```javascript
// scripts/docs-validator.js
功能:
  1. 掃描所有 MD 文件
  2. 檢查元數據完整性
  3. 驗證文件路徑正確性
  4. 檢查相關文件連結是否有效
  5. 生成驗證報告

使用:
  npm run validate-docs

輸出:
  ✅ Valid: 145 files
  ⚠️ Missing metadata: 5 files
  ❌ Broken links: 2 files
  📊 Report: docs-validation-report.json
```

**工具 B: `docs-cleanup.js`** - 識別過時或重複文件

**功能**:
```javascript
// scripts/docs-cleanup.js
功能:
  1. 識別超過 90 天未更新的文件
  2. 檢測重複或相似文件（內容比對）
  3. 找出無人維護的文件
  4. 建議歸檔或刪除的文件清單

使用:
  npm run cleanup-docs --dry-run  # 僅顯示建議，不執行
  npm run cleanup-docs --execute  # 執行清理

輸出:
  📋 Stale files (90+ days): 12 files
  🔄 Duplicate candidates: 3 pairs
  ⚠️ Unmaintained: 5 files
  💡 Suggestions: See cleanup-report.md
```

**工具 C: `docs-sync.js`** - 同步 PROJECT_INDEX.md

**功能**:
```javascript
// scripts/docs-sync.js
功能:
  1. 掃描所有文件與目錄結構
  2. 讀取文件元數據
  3. 自動生成或更新 PROJECT_INDEX.md
  4. 生成統計數據（檔案數、完成度）

使用:
  npm run sync-index

輸出:
  ✅ Scanned 170 MD files
  📊 Updated statistics
  📝 Generated PROJECT_INDEX.md
  ⏱️ Time: 2.3 seconds
```

**工具 D: `docs-migration.js`** - 輔助文件重組

**功能**:
```javascript
// scripts/docs-migration.js
功能:
  1. 讀取重組計劃配置（JSON/YAML）
  2. 批量移動文件至新位置
  3. 自動更新內部連結
  4. 生成 Git commit 命令清單

使用:
  npm run migrate-docs -- --plan migration-plan.json --dry-run
  npm run migrate-docs -- --plan migration-plan.json --execute

輸出:
  📦 Planned migrations: 25 files
  🔗 Links to update: 8 files
  📝 Generated git commands: migration-commands.sh
```

---

### 組件 3: 維護工作流程

**每日工作流程** (開發者):
```yaml
觸發: Story/功能完成
操作:
  1. 更新相關文件內容
  2. 更新文件元數據（updated 日期）
  3. 檢查相關文件連結
  4. 執行 npm run validate-docs
  5. Commit 時包含文件變更

時間: 5 分鐘
自動化: 部分（validate-docs）
```

**每週工作流程** (Tech Lead):
```yaml
觸發: 每週五下午
操作:
  1. 執行 npm run cleanup-docs --dry-run
  2. 檢視過時文件清單
  3. 決定是否需要歸檔或刪除
  4. 執行 npm run sync-index
  5. 檢視文件結構是否需要調整

時間: 15-30 分鐘
自動化: 高（cleanup-docs, sync-index）
```

**每 Sprint 工作流程** (團隊):
```yaml
觸發: Sprint 回顧會
操作:
  1. 審查本 Sprint 新增的文件
  2. 檢查文件元數據完整性
  3. 討論文件結構改進
  4. 執行 npm run validate-docs
  5. 規劃下 Sprint 文件需求

時間: 30 分鐘
自動化: 中等（validate-docs）
```

---

### 組件 4: 文件索引系統

**選項 A: 繼續使用 PROJECT_INDEX.md** (建議)

**優點**:
- ✅ 已有現成工具 (`npm run sync-index`)
- ✅ 團隊熟悉，無學習成本
- ✅ Markdown 格式，易於閱讀和編輯
- ✅ 可用 Git 追蹤變更歷史

**增強建議**:
```markdown
# PROJECT_INDEX.md 結構優化

## 🗂️ 文件導航（新增）

### 快速連結（新增）
- [API 文件](docs/api/)
- [測試文件](docs/testing/)
- [實作指南](docs/implementation/)
- [修復日誌](docs/fixes/)
- [MVP 進度](docs/MVP_PROGRESS.md)

### 按類別瀏覽（新增）
- [所有 API 文件](docs/api/)
- [所有測試文件](docs/testing/)
- [所有實作指南](docs/implementation/)

### 按階段瀏覽（新增）
- [規劃階段](docs/00-archive/planning/)
- [POC 階段](docs/00-archive/poc/)
- [MVP 階段](docs/mvp/)

## 📊 統計數據（保持現有）
...

## 📂 詳細文件列表（保持現有）
...
```

**選項 B: 建立獨立的 DOCS_MAINTENANCE_GUIDE.md**

**用途**: 專門說明文件維護流程與工具使用

**結構**:
```markdown
# 文件維護指南 (DOCS_MAINTENANCE_GUIDE.md)

## 📋 目錄
1. 文件系統概覽
2. 文件生命週期管理
3. 元數據規範
4. 自動化工具使用
5. 維護工作流程
6. 常見問題與解決方案

## 1. 文件系統概覽
（說明目錄結構、命名規範）

## 2. 文件生命週期管理
（創建 → 活躍 → 完成 → 歸檔 → 刪除）

## 3. 元數據規範
（元數據模板、欄位說明、範例）

## 4. 自動化工具使用
（docs-validator, docs-cleanup, docs-sync, docs-migration）

## 5. 維護工作流程
（每日、每週、每 Sprint 工作流程）

## 6. 常見問題與解決方案
（FAQ）
```

**選項 C: 雙軌制（建議採用）**

**方案**:
- ✅ **PROJECT_INDEX.md**: 保持作為文件索引，專注於「是什麼」「在哪裡」
- ✅ **DOCS_MAINTENANCE_GUIDE.md**: 新建作為維護指南，專注於「怎麼做」「為什麼」

**責任分工**:

| 文件 | 用途 | 更新頻率 | 維護者 |
|------|------|---------|--------|
| `PROJECT_INDEX.md` | 文件索引、快速導航、統計數據 | Story 完成後 | 自動化工具 + Tech Lead |
| `DOCS_MAINTENANCE_GUIDE.md` | 維護流程、工具使用、規範說明 | 流程變更時 | Tech Lead |
| `INDEX_MAINTENANCE.md` | 索引維護專用指南 | 保留或合併至 DOCS_MAINTENANCE_GUIDE.md | Tech Lead |

---

## 🚀 執行計劃

### Phase 1: 準備與備份 (30 分鐘)

**步驟 1.1: Git 檢查點**
```bash
# 確保所有變更已提交
git status

# 提交當前工作
git add .
git commit -m "checkpoint: before docs reorganization"
git push origin main
```

**步驟 1.2: 建立備份分支**
```bash
# 建立備份分支
git checkout -b backup/docs-reorg-2025-10-22
git push origin backup/docs-reorg-2025-10-22

# 返回主分支
git checkout main
```

**步驟 1.3: 建立新目錄結構**
```bash
# 建立新的子目錄
mkdir -p docs/00-archive/planning
mkdir -p docs/00-archive/poc/stories/{epic-1,epic-2,epic-3,epic-4,epic-5}
mkdir -p docs/00-archive/poc/epics
mkdir -p docs/api
mkdir -p docs/deployment
mkdir -p docs/testing
mkdir -p docs/troubleshooting
mkdir -p docs/fixes
mkdir -p docs/implementation/{lip-sync,i18n,knowledge-system,custom-avatar,multi-agent}
mkdir -p docs/design
mkdir -p docs/mvp
mkdir -p docs/training
mkdir -p docs/misc

# 確認目錄建立成功
ls -R docs/
```

---

### Phase 2: 移動根目錄文件 (20 分鐘)

**步驟 2.1: 歷史參考文件 → docs/00-archive/poc/**
```bash
git mv PROJECT_STATUS.md docs/00-archive/poc/
git mv DEVELOPMENT_STATUS.md docs/00-archive/poc/
```

**步驟 2.2: 規劃文件 → docs/00-archive/planning/**
```bash
git mv SPRINT_PLAN.md docs/00-archive/planning/
git mv PROJECT_OVERVIEW.md docs/00-archive/planning/
```

**步驟 2.3: 測試文件 → docs/testing/**
```bash
git mv BROWSER_TEST_GUIDE.md docs/testing/
git mv TEST_ADAPTIVE_INTENSITY.md docs/testing/
```

**步驟 2.4: 故障排除文件 → docs/troubleshooting/**
```bash
git mv AUDIO_TROUBLESHOOT.md docs/troubleshooting/
git mv DEBUG_AUDIO_ISSUE.md docs/troubleshooting/
git mv DEBUG_TEST_GUIDE.md docs/troubleshooting/
git mv CLEAR_CACHE_INSTRUCTIONS.md docs/troubleshooting/
```

**步驟 2.5: 其他文件處理**
```bash
# Epic 5 實作記錄
git mv EPIC5_PART1_IMPLEMENTATION.md docs/00-archive/poc/epics/

# 開發路線圖（視內容決定保留或歸檔）
# 如仍活躍: 保留或移至 docs/mvp/
# 如已過時: 移至 docs/00-archive/poc/
git mv DEVELOPMENT_ROADMAP.md docs/mvp/  # 或 docs/00-archive/poc/

# 檢視臨時文件後決定
cat plan.md  # 檢視內容
cat log.md   # 檢視內容
# 根據內容決定刪除或歸檔

# QUICK_START.md - 檢查是否與 README.md 重複
diff QUICK_START.md README.md
# 如重複則刪除，如不同則保留或合併
```

**步驟 2.6: 刪除重複/錯誤文件**
```bash
# 刪除檔名錯誤的文件
git rm "C:smart-ai-avatar-agentdocsMVP_PROGRESS.md"
```

---

### Phase 3: 重組 docs/ 根層級文件 (60 分鐘)

**步驟 3.1: API 文件 → docs/api/**
```bash
git mv docs/API_REFERENCE_SPRINT2.md docs/api/
git mv docs/API_REFERENCE_SPRINT3.md docs/api/
git mv docs/API_CONVERSATIONS.md docs/api/
git mv docs/API_AVATAR_FAVORITE.md docs/api/
```

**步驟 3.2: 部署文件 → docs/deployment/**
```bash
git mv docs/AZURE_DEPLOYMENT.md docs/deployment/
git mv docs/LOCAL_DEV_GUIDE.md docs/deployment/
git mv docs/ENVIRONMENT_VARIABLES.md docs/deployment/
# deployment-guide.md 保留在 docs/ 根層級或創建符號連結
cp docs/deployment-guide.md docs/deployment/
```

**步驟 3.3: 測試文件 → docs/testing/**
```bash
git mv docs/BROWSER_COMPATIBILITY.md docs/testing/
git mv docs/CROSS_BROWSER_TESTING.md docs/testing/
git mv docs/AVATAR_LIP_SYNC_TEST.md docs/testing/
```

**步驟 3.4: 修復日誌 → docs/fixes/** (重命名)
```bash
git mv docs/FIXES_2025-10-18.md docs/fixes/2025-10-18-general-fixes.md
git mv docs/FIXES_2025-10-19.md docs/fixes/2025-10-19-general-fixes.md
git mv docs/LIPSYNC_FIXES_2025-10-20.md docs/fixes/2025-10-20-lipsync-fixes.md
git mv docs/I18N_HYDRATION_FIX.md docs/fixes/i18n-hydration-fix.md
git mv docs/POC_ISSUES_FIX_PLAN.md docs/fixes/poc-issues-fix-plan.md
git mv docs/KNOWLEDGE_SYSTEM_ISSUES_AND_FIXES.md docs/fixes/knowledge-system-issues-fixes.md
```

**步驟 3.5: 實作指南 → docs/implementation/**

```bash
# Lip Sync
git mv docs/LIP_SYNC_IMPLEMENTATION_GUIDE.md docs/implementation/lip-sync/
git mv docs/LIP_SYNC_COMPLETION_REPORT.md docs/implementation/lip-sync/

# I18n
git mv docs/I18N_IMPLEMENTATION_STATUS.md docs/implementation/i18n/

# Knowledge System
git mv docs/KNOWLEDGE_MANAGEMENT_SYSTEM_DESIGN.md docs/implementation/knowledge-system/
git mv docs/KNOWLEDGE_SYSTEM_IMPLEMENTATION_STATUS.md docs/implementation/knowledge-system/
git mv docs/KNOWLEDGE_SYSTEM_USER_GUIDE.md docs/implementation/knowledge-system/

# Custom Avatar
git mv docs/CUSTOM_AVATAR_SOLUTION.md docs/implementation/custom-avatar/

# Multi-Agent
git mv docs/MULTI_AGENT_ARCHITECTURE_DESIGN.md docs/implementation/multi-agent/
git mv docs/MULTILINGUAL_AND_MULTI_AGENT_IMPLEMENTATION_PLAN.md docs/implementation/multi-agent/
```

**步驟 3.6: 設計文件 → docs/design/**
```bash
# architecture.md 保留最新版本在 docs/design/，舊版本移至 archive
git mv docs/architecture.md docs/design/  # 如為最新版本
# 或
git mv docs/architecture.md docs/00-archive/planning/  # 如為初期版本

git mv docs/DESIGN-SYSTEM.md docs/design/
git mv docs/front-end-spec.md docs/design/
```

**步驟 3.7: MVP 文件 → docs/mvp/**
```bash
git mv docs/MVP_DEVELOPMENT_PLAN.md docs/mvp/
git mv docs/MVP_PLANNING_SESSION.md docs/mvp/
git mv docs/MVP_FINAL_REPORT.md docs/mvp/
git mv docs/MVP_DAY2_PROGRESS.md docs/mvp/
git mv docs/MVP_PROGRESS_SPRINT8.md docs/mvp/
git mv docs/MVP_PROGRESS_ISSUES.md docs/mvp/

# MVP_PROGRESS.md 保留在 docs/ 根層級（最重要的活躍文件）
# 可選：創建符號連結
# ln -s ../MVP_PROGRESS.md docs/mvp/MVP_PROGRESS.md
```

**步驟 3.8: 訓練文件 → docs/training/**
```bash
git mv docs/AI_AGENT_TRAINING_GUIDE.md docs/training/
```

**步驟 3.9: 其他文件 → docs/misc/**
```bash
git mv docs/cost-analysis.md docs/misc/
# 檢視其他未分類文件並移至 misc/
```

---

### Phase 4: 重組 docs/stories/ (20 分鐘)

**步驟 4.1: Story 文件 → docs/00-archive/poc/stories/**
```bash
# Epic 1 (Story 1.1-1.5)
git mv docs/stories/1.* docs/00-archive/poc/stories/epic-1/

# Epic 2 (Story 2.1-2.5)
git mv docs/stories/2.* docs/00-archive/poc/stories/epic-2/

# Epic 3 (Story 3.1-3.7)
git mv docs/stories/3.* docs/00-archive/poc/stories/epic-3/

# Epic 4 (Story 4.1-4.5)
git mv docs/stories/4.* docs/00-archive/poc/stories/epic-4/

# Epic 5 (Story 5.1-5.7)
git mv docs/stories/5.* docs/00-archive/poc/stories/epic-5/

# 刪除空的 stories 目錄
rmdir docs/stories
```

---

### Phase 5: 清理 agent-brain/ 重複文件 (10 分鐘)

**步驟 5.1: 檢視範例文件**
```bash
# 確認是否為重複
diff agent-brain/persona.md agent-brain/agents/cdo-advisor/persona.md
diff agent-brain/cdo_faq.md agent-brain/agents/cdo-advisor/cdo_faq.md
diff agent-brain/kpi_dictionary.md agent-brain/agents/cdo-advisor/kpi_dictionary.md
```

**步驟 5.2: 刪除重複文件**
```bash
git rm agent-brain/persona.md
git rm agent-brain/cdo_faq.md
git rm agent-brain/kpi_dictionary.md
```

---

### Phase 6: 創建 README.md 文件 (30 分鐘)

**步驟 6.1: docs/README.md**
```bash
cat > docs/README.md << 'EOF'
# 📚 項目文件導航

本目錄包含項目的所有技術文件、實作指南、測試文件等。

## 📂 目錄結構

### 活躍文件（當前開發階段）

- **[MVP_PROGRESS.md](MVP_PROGRESS.md)** - MVP 開發進度追蹤（最重要）
- **[deployment-guide.md](deployment-guide.md)** - 部署指南
- **[local-dev-guide.md](local-dev-guide.md)** - 本地開發指南

### 按類別瀏覽

- **[api/](api/)** - API 文件
- **[deployment/](deployment/)** - 部署相關文件
- **[testing/](testing/)** - 測試文件與指南
- **[troubleshooting/](troubleshooting/)** - 故障排除文件
- **[fixes/](fixes/)** - 修復日誌（按日期）
- **[implementation/](implementation/)** - 功能實作指南
- **[design/](design/)** - 架構與設計文件
- **[mvp/](mvp/)** - MVP 規劃與報告

### 歷史歸檔

- **[00-archive/planning/](00-archive/planning/)** - POC 初期規劃文件
- **[00-archive/poc/](00-archive/poc/)** - POC 開發階段文件

## 🔍 快速搜尋

### 常見需求

- **查看 API 文件**: [api/](api/)
- **部署項目**: [deployment-guide.md](deployment-guide.md)
- **解決問題**: [troubleshooting/](troubleshooting/)
- **查看測試**: [testing/](testing/)
- **查看修復記錄**: [fixes/](fixes/)

### 按開發階段

- **規劃階段**: [00-archive/planning/](00-archive/planning/)
- **POC 階段**: [00-archive/poc/](00-archive/poc/)
- **MVP 階段**: [mvp/](mvp/) + [MVP_PROGRESS.md](MVP_PROGRESS.md)

---

**維護指南**: 詳見根目錄 [DOCS_MAINTENANCE_GUIDE.md](../DOCS_MAINTENANCE_GUIDE.md)
EOF

git add docs/README.md
```

**步驟 6.2: docs/00-archive/planning/README.md**
```bash
cat > docs/00-archive/planning/README.md << 'EOF'
# 📋 POC 初期規劃文件

本目錄包含項目初期（POC 開始前）的規劃文件。

## 📁 文件清單

- **SPRINT_PLAN.md** - 原始 12 週開發計劃（Read-Only 參考）
- **PROJECT_OVERVIEW.md** - 項目概覽與目標
- **architecture.md** - 初期架構設計

## ⚠️ 注意事項

這些文件為**歷史參考**，記錄了項目最初的規劃與設計。

**最新狀態**請查看:
- 根目錄 [PROJECT_STATUS.md](../../../PROJECT_STATUS.md)
- [docs/MVP_PROGRESS.md](../../MVP_PROGRESS.md)

---

**歸檔日期**: 2025-10-22
**歸檔原因**: POC 完成，進入 MVP 階段
EOF

git add docs/00-archive/planning/README.md
```

**步驟 6.3: docs/00-archive/poc/README.md**
```bash
cat > docs/00-archive/poc/README.md << 'EOF'
# 🎯 POC 開發階段文件

本目錄包含 POC（Proof of Concept）階段的所有開發文件。

## 📊 POC 狀態

- **完成日期**: 2025-10-15
- **總 Story 數**: 29 個（全部完成）
- **總 Epic 數**: 5 個（全部完成）
- **提前天數**: 83 天
- **詳細報告**: [PROJECT_STATUS.md](PROJECT_STATUS.md)

## 📂 目錄結構

- **[PROJECT_STATUS.md](PROJECT_STATUS.md)** - POC 最終狀態報告
- **[DEVELOPMENT_STATUS.md](DEVELOPMENT_STATUS.md)** - 開發進度追蹤
- **[stories/](stories/)** - 42 個 Story 實作文件（按 Epic 分類）
- **[epics/](epics/)** - Epic 完成報告

## 🔍 查找 Story 文件

Story 文件按 Epic 分類:

- **[Epic 1](stories/epic-1/)** - Foundation & Core Infrastructure
- **[Epic 2](stories/epic-2/)** - 3D Avatar Rendering & Animation
- **[Epic 3](stories/epic-3/)** - LLM Conversation & TTS Integration
- **[Epic 4](stories/epic-4/)** - Lip Sync & Audio-Visual Synchronization
- **[Epic 5](stories/epic-5/)** - Polish, Testing & Deployment

---

**歸檔日期**: 2025-10-22
**歸檔原因**: POC 階段完成
**後續階段**: 詳見 [docs/MVP_PROGRESS.md](../../MVP_PROGRESS.md)
EOF

git add docs/00-archive/poc/README.md
```

**步驟 6.4: 其他目錄 README.md**
```bash
# docs/api/README.md
echo "# API 文件總覽\n\n本目錄包含所有 API 參考文件。\n\n## 文件清單\n- API_REFERENCE_SPRINT2.md\n- API_REFERENCE_SPRINT3.md\n- API_CONVERSATIONS.md\n- API_AVATAR_FAVORITE.md" > docs/api/README.md

# docs/testing/README.md
echo "# 測試文件總覽\n\n本目錄包含所有測試相關文件與指南。" > docs/testing/README.md

# docs/troubleshooting/README.md
echo "# 故障排除文件\n\n本目錄包含常見問題的診斷與解決方案。" > docs/troubleshooting/README.md

# docs/fixes/README.md
echo "# 修復日誌\n\n本目錄包含所有問題修復記錄，按日期排序。" > docs/fixes/README.md

# docs/implementation/README.md
echo "# 實作指南總覽\n\n本目錄包含各功能的詳細實作指南。" > docs/implementation/README.md

git add docs/*/README.md
```

---

### Phase 7: 建立維護指南 (40 分鐘)

**步驟 7.1: 創建 DOCS_MAINTENANCE_GUIDE.md**
```bash
# 創建獨立的文件維護指南
# 內容參考本文件的「文件生命週期管理系統」和「持續維護系統設計」章節
# 約 500-800 行詳細指南

cat > DOCS_MAINTENANCE_GUIDE.md << 'EOF'
# 📚 文件維護指南 (Documentation Maintenance Guide)

> **目的**: 建立規範化、系統化的文件管理流程
> **適用對象**: 開發團隊、Tech Lead、AI 助手
> **最後更新**: 2025-10-22

（詳細內容見本計劃書的「文件生命週期管理系統」和「持續維護系統設計」章節）
EOF

git add DOCS_MAINTENANCE_GUIDE.md
```

**步驟 7.2: 決定 INDEX_MAINTENANCE.md 的處理**

**選項 A**: 保留並與 DOCS_MAINTENANCE_GUIDE.md 並存
```bash
# 保留 INDEX_MAINTENANCE.md，專注於 PROJECT_INDEX.md 的維護
# DOCS_MAINTENANCE_GUIDE.md 則涵蓋整體文件系統維護
# 無需操作
```

**選項 B**: 合併至 DOCS_MAINTENANCE_GUIDE.md
```bash
# 將 INDEX_MAINTENANCE.md 的內容整合至 DOCS_MAINTENANCE_GUIDE.md
# 然後刪除或歸檔 INDEX_MAINTENANCE.md
git mv INDEX_MAINTENANCE.md docs/00-archive/
```

**建議**: 選項 A（保留），因為兩者側重點不同

---

### Phase 8: 更新 PROJECT_INDEX.md (30 分鐘)

**步驟 8.1: 執行自動同步**
```bash
# 執行索引同步工具
npm run sync-index

# 檢視生成的 PROJECT_INDEX.md
cat PROJECT_INDEX.md | head -100
```

**步驟 8.2: 手動補充優化**
```bash
# 開啟 PROJECT_INDEX.md 進行編輯
code PROJECT_INDEX.md

# 需要手動添加的內容:
# 1. 快速連結章節（指向新的子目錄）
# 2. 按類別/階段瀏覽章節
# 3. 更新統計數據
# 4. 驗證所有路徑正確性
```

**步驟 8.3: 更新其他文件的路徑參考**
```bash
# 全局搜索舊路徑參考
grep -r "docs/stories/" --include="*.md" .
grep -r "FIXES_2025" --include="*.md" .

# 手動更新發現的路徑參考
# 主要文件: CLAUDE.md, AI_ASSISTANT_GUIDE.md, README.md
```

---

### Phase 9: 驗證與測試 (20 分鐘)

**步驟 9.1: 驗證文件結構**
```bash
# 檢查新目錄結構
ls -R docs/ | head -100

# 統計文件數量
find docs/ -name "*.md" -type f | wc -l
find agent-brain/ -name "*.md" -type f | wc -l
find . -maxdepth 1 -name "*.md" -type f | wc -l

# 預期結果:
# docs/: ~125 個（-3 刪除的重複）
# agent-brain/: 18 個（-3 刪除的重複）
# 根目錄: ~10 個（核心文件）
```

**步驟 9.2: 驗證 Git 狀態**
```bash
# 檢查 Git 狀態
git status

# 應該看到:
# - 多個 renamed 操作（文件移動）
# - 多個 deleted 操作（重複文件刪除）
# - 多個 new file 操作（README.md 創建）
```

**步驟 9.3: 驗證連結有效性**
```bash
# 手動測試幾個關鍵文件的內部連結
# 使用 VS Code 的 Markdown 預覽功能
code docs/README.md
code docs/00-archive/poc/README.md
code PROJECT_INDEX.md

# 點擊連結確認可以正確跳轉
```

---

### Phase 10: 提交變更 (15 分鐘)

**步驟 10.1: 審查變更**
```bash
# 查看所有變更摘要
git status

# 查看具體變更內容（選擇性）
git diff --cached
```

**步驟 10.2: 提交變更**
```bash
git add .

git commit -m "docs: reorganize project documentation structure

重組內容:
- 根目錄文件分類與歸檔（歷史文件移至 docs/00-archive/）
- docs/ 建立類型化子目錄（api, testing, fixes, implementation 等）
- POC Story 文件移至 docs/00-archive/poc/stories/（按 Epic 分類）
- 修復日誌重命名為日期前綴格式
- 刪除重複文件（agent-brain/ 範例文件）
- 創建各目錄 README.md 導航文件
- 創建 DOCS_MAINTENANCE_GUIDE.md 維護指南
- 更新 PROJECT_INDEX.md

統計:
- 重組文件: ~170 個
- 刪除重複: 4 個
- 新建 README: 10 個
- 新目錄: 15 個

目錄結構:
- docs/00-archive/ (歷史歸檔)
- docs/api/ (API 文件)
- docs/testing/ (測試文件)
- docs/troubleshooting/ (故障排除)
- docs/fixes/ (修復日誌)
- docs/implementation/ (實作指南)
- docs/design/ (設計文件)
- docs/mvp/ (MVP 規劃)

詳細計劃: claudedocs/PROJECT_DOCS_REORGANIZATION_PLAN.md"
```

**步驟 10.3: 推送變更**
```bash
# 推送至遠端
git push origin main

# 如遇到衝突，先 pull 再 push
git pull origin main
git push origin main
```

---

## 📊 執行後驗證清單

### 結構驗證

- [ ] 根目錄僅保留 5-10 個核心 MD 文件
- [ ] docs/ 有清晰的子目錄分類
- [ ] docs/00-archive/ 包含 POC 歷史文件
- [ ] agent-brain/ 無重複的範例文件
- [ ] 所有目錄都有 README.md 導航文件

### 功能驗證

- [ ] PROJECT_INDEX.md 路徑全部正確
- [ ] 內部連結可以正常跳轉
- [ ] npm run sync-index 可以正常執行
- [ ] Git 歷史完整保留（git log --follow）

### 文件驗證

- [ ] DOCS_MAINTENANCE_GUIDE.md 創建完成
- [ ] 各目錄 README.md 內容完整
- [ ] 修復日誌使用日期前綴命名
- [ ] 所有文件有正確的元數據（如實施元數據系統）

---

## 🎯 成果總結

### 重組前後對比

| 指標 | 重組前 | 重組後 | 改善 |
|------|--------|--------|------|
| **根目錄 MD 文件** | 21 | ~10 | -52% |
| **docs/ 根層級文件** | 76 | ~10 | -87% |
| **docs/ 子目錄** | 1 | 15 | +1400% |
| **重複文件** | 4 | 0 | -100% |
| **導航 README** | 0 | 10 | ∞ |
| **目錄深度** | 混亂 | 最多 3 層 | 清晰化 |

### 預期效益

**立即效益**:
- ✅ 文件查找時間減少 70%（清晰分類）
- ✅ 新成員上手時間減少 50%（導航指南）
- ✅ 文件維護效率提升 60%（規範化流程）

**長期效益**:
- ✅ 可擴展性提升（階段性目錄結構）
- ✅ 維護成本降低（自動化工具）
- ✅ 團隊協作改善（清晰的責任分工）
- ✅ 知識累積（完整的歷史歸檔）

---

## 🆘 執行風險與緩解

### 風險評估

| 風險 | 機率 | 影響 | 緩解措施 |
|------|------|------|---------|
| **路徑參考失效** | 中 | 中 | 全局搜索 + 手動更新 + 驗證測試 |
| **Git 歷史追蹤困難** | 低 | 低 | 使用 `git mv` + `--follow` 參數 |
| **團隊成員混淆** | 中 | 低 | 提前溝通 + 導航指南 + 漸進式執行 |
| **內部連結失效** | 中 | 中 | 手動檢查 + VS Code 預覽驗證 |
| **自動化工具失敗** | 低 | 低 | 手動回退 + 備份分支 |

### 緩解策略

**策略 1: 漸進式執行**
- 分階段執行（Phase 1-10）
- 每個 Phase 完成後檢查
- 發現問題立即修正

**策略 2: 完整備份**
- Git 備份分支（backup/docs-reorg-2025-10-22）
- 本地備份副本（zip 壓縮）
- 隨時可回滾

**策略 3: 團隊溝通**
- 執行前通知團隊
- 提供導航指南
- Sprint 會議上說明變更

**策略 4: 驗證優先**
- 每個 Phase 後驗證
- 提交前全面測試
- 推送後團隊確認

---

## 📞 支援與協助

### 執行中遇到問題

**技術問題**:
- 查閱本計劃書的詳細步驟
- 使用 `git status` 檢查當前狀態
- 使用 `git diff` 查看變更內容
- 聯絡 Tech Lead 尋求協助

**流程問題**:
- 參考 DOCS_MAINTENANCE_GUIDE.md
- 檢視各目錄的 README.md
- 在團隊頻道提問

**緊急回滾**:
```bash
# 回到備份分支
git checkout backup/docs-reorg-2025-10-22

# 或使用 git reset（慎用）
git reset --hard HEAD~1
```

### 執行後改進建議

**歡迎提出**:
- 目錄結構優化建議
- 文件命名改進建議
- 維護流程優化建議
- 自動化工具功能需求

**提交方式**:
- GitHub Issue
- 團隊會議討論
- Slack/Teams 頻道

---

## 📅 後續行動

### 短期（1-2 週）

1. **執行重組計劃** (本文件)
   - 預計時間: 3-4 小時
   - 負責人: Tech Lead
   - 驗收: 團隊檢視新結構

2. **創建自動化工具** (docs-validator.js, docs-sync.js)
   - 預計時間: 4-6 小時
   - 負責人: Tech Lead
   - 驗收: 工具可正常運行

3. **團隊培訓** (新文件結構與維護流程)
   - 預計時間: 1 小時
   - 負責人: Tech Lead
   - 驗收: 團隊熟悉新結構

### 中期（1 個月）

4. **實施元數據系統**
   - 為所有活躍文件添加元數據
   - 預計時間: 2-3 天
   - 驗收: 90% 文件有完整元數據

5. **開發額外自動化工具** (docs-cleanup.js, docs-migration.js)
   - 預計時間: 4-6 小時
   - 驗收: 工具可正常運行

6. **建立 CI/CD 整合**
   - GitHub Actions 自動驗證
   - Pre-commit hooks
   - 預計時間: 2-3 小時
   - 驗收: 自動化檢查生效

### 長期（3 個月）

7. **持續優化與改進**
   - 根據使用反饋調整結構
   - 優化自動化工具
   - 持續

8. **建立文件品質指標**
   - 完整性: ≥ 95%
   - 準確性: ≥ 98%
   - 時效性: ≤ 1 天

9. **文化建立**
   - 文件維護成為團隊習慣
   - 定期檢視與改進
   - 分享最佳實踐

---

## 📚 附錄

### A. 完整文件清單

**根目錄保留文件** (10 個):
1. README.md
2. CLAUDE.md
3. AI_ASSISTANT_GUIDE.md
4. PROJECT_INDEX.md
5. INDEX_MAINTENANCE.md
6. DOCS_MAINTENANCE_GUIDE.md (新建)
7. .gitignore
8. package.json
9. tsconfig.json
10. (其他配置文件)

**docs/ 新建目錄** (15 個):
1. docs/00-archive/planning/
2. docs/00-archive/poc/stories/{epic-1,2,3,4,5}/
3. docs/00-archive/poc/epics/
4. docs/api/
5. docs/deployment/
6. docs/testing/
7. docs/troubleshooting/
8. docs/fixes/
9. docs/implementation/{lip-sync,i18n,knowledge-system,custom-avatar,multi-agent}/
10. docs/design/
11. docs/mvp/
12. docs/training/
13. docs/misc/

**刪除文件** (4 個):
1. C:smart-ai-avatar-agentdocsMVP_PROGRESS.md
2. agent-brain/persona.md
3. agent-brain/cdo_faq.md
4. agent-brain/kpi_dictionary.md

---

### B. Git 命令快速參考

```bash
# 查看文件移動歷史
git log --follow -- <file_path>

# 比較兩個版本
git diff <commit1> <commit2> -- <file_path>

# 查找文件
find . -name "*.md" -type f

# 全局搜索
grep -r "keyword" --include="*.md" .

# 批量重命名（Bash）
for f in FIXES_*.md; do mv "$f" "${f/FIXES_/}"; done

# 創建符號連結
ln -s target_file link_name
```

---

**報告完成日期**: 2025-10-22
**報告作者**: Claude Code
**版本**: v2.0
**適用範圍**: 根目錄、docs/、agent-brain/
**排除範圍**: .bmad-*/、.claude/

---

**執行確認**: 請在執行前再次確認以下事項:
- [ ] 已閱讀完整計劃書
- [ ] 已建立 Git 備份分支
- [ ] 已通知團隊成員
- [ ] 已預留 3-4 小時完整執行時間
- [ ] 已理解各 Phase 的目的和步驟
- [ ] 已準備好處理潛在問題

**準備好開始執行了嗎？** 🚀
