# 項目 Markdown 文件完整分析報告

**生成日期**: 2025-10-22
**項目**: Smart AI Avatar Agent
**分析範圍**: 全專案 MD 文件 (300+ 檔案)
**報告目的**: 識別文件混亂問題並提供重組建議

---

## 📊 執行摘要

### 關鍵發現

1. **總文件數量**: 300+ MD 文件
2. **主要問題**:
   - ✅ **重複文件嚴重**: BMad 框架文件在 3-4 個位置重複
   - ✅ **時期混雜**: POC 規劃、POC 執行、MVP 過渡文件混在一起
   - ✅ **狀態不明**: 難以區分活躍文件、參考文件與歷史文件
   - ✅ **分類混亂**: 缺乏清晰的分類結構
3. **影響**: 開發效率降低、文件維護困難、新成員上手困難

---

## 📂 文件清單統計

### 按目錄分類

| 目錄 | 文件數量 | 狀態 | 主要內容 |
|------|---------|------|----------|
| **根目錄** | ~15 | 活躍 + 參考 | 項目指南、狀態追蹤 |
| **docs/** | 128+ | 混合 | Story 文件、測試指南、修復日誌 |
| **agent-brain/** | ~20 | 活躍 | 知識庫系統 (Persona, FAQ, KPI) |
| **.bmad-core/** | 48 | **重複** | BMad 框架核心 |
| **.bmad-creative-writing/** | 89 | **重複** | BMad 創意寫作框架 |
| **.bmad-infrastructure-devops/** | 11 | **重複** | BMad 基礎設施框架 |
| **.claude/commands/BMad/** | 48 | **重複** | BMad 核心重複 |
| **.claude/commands/bmad-cw/** | 89 | **重複** | 創意寫作重複 |
| **.claude/commands/bmadInfraDevOps/** | 11 | **重複** | 基礎設施重複 |

**重複文件總數**: ~296 個 BMad 框架文件 (實際應為 148 個,重複率 100%)

---

## 🗂️ 文件分類分析

### 階段 1: 項目初期規劃文件 (2025-10-14 前)

**特徵**: POC 規劃階段,設計與需求文件

| 文件 | 類型 | 建議處理 |
|------|------|----------|
| `SPRINT_PLAN.md` | 源計劃文件 (Read-Only) | ✅ 保留為參考 |
| `docs/prd.md` (如存在) | 產品需求文件 | ✅ 保留為參考 |
| `docs/architecture.md` | 架構設計 | ✅ 保留為參考 |
| `docs/sprint-planning.md` (如存在) | Sprint 規劃 | ✅ 保留為參考 |

**建議**: 移至 `docs/00-planning/` 目錄,標記為歷史參考

---

### 階段 2: POC 開發階段 (2025-10-15 ~ 2025-10-17)

**特徵**: POC 實作、Story 文件、測試指南

| 文件分類 | 文件數量 | 範例 |
|---------|---------|------|
| **Story 文件** | 29 | `docs/stories/1.1-*.md` ~ `docs/stories/5.7-*.md` |
| **Epic 完成報告** | 5 | `docs/epic-{1-5}-completion-report.md` |
| **Sprint 摘要** | 10 | `docs/sprint-{1-10}-summary.md` |
| **測試指南** | 5+ | `docs/epic-{3-5}-test-guide.md`, `docs/browser-compatibility-test.md` |
| **API 文件** | 4+ | `docs/api-reference-sprint-*.md`, `docs/conversations-api.md` |

**建議**: 移至 `docs/01-poc-development/` 目錄

---

### 階段 3: MVP 開發階段 (2025-10-17 ~ 2025-10-22)

**特徵**: MVP 功能擴充、知識庫系統、多語言化

| 文件分類 | 文件數量 | 範例 |
|---------|---------|------|
| **MVP 進度追蹤** | 1 | `docs/MVP_PROGRESS.md` (活躍文件) |
| **功能實作指南** | 5+ | `docs/lip-sync-implementation.md`, `docs/i18n-implementation.md` |
| **修復日誌** | 2+ | `docs/FIXES_2025-10-18.md`, `docs/FIXES_2025-10-19.md` |
| **知識庫文件** | 1 | `docs/KNOWLEDGE_SYSTEM_ISSUES_AND_FIXES.md` |

**建議**: 移至 `docs/02-mvp-development/` 目錄

---

### 階段 4: 持續更新文件 (活躍)

**特徵**: 當前活躍使用的文件

| 文件 | 類型 | 更新頻率 |
|------|------|----------|
| `README.md` | 用戶指南 | 每次重大功能完成 |
| `CLAUDE.md` | AI 助手指南 | 新功能或模式變更時 |
| `AI_ASSISTANT_GUIDE.md` | 開發指南 | 規範或流程變更時 |
| `PROJECT_INDEX.md` | 文件索引 | 每次 Story 完成後 |
| `PROJECT_STATUS.md` | 項目狀態 | 每個 Epic 完成後 |
| `DEVELOPMENT_STATUS.md` | 開發進度 | 即時更新 (已完成) |
| `docs/MVP_PROGRESS.md` | MVP 進度 | 每個 Sprint 完成後 |

**建議**: 保留在根目錄或 docs/ 根層級

---

## 🔴 重複文件問題詳細分析

### BMad 框架重複情況

**問題描述**: BMad 框架文件在多個位置重複,導致文件冗餘和維護困難

#### 重複位置對應表

| 源目錄 | 重複目錄 | 文件數量 | 重複率 |
|--------|----------|---------|--------|
| `.bmad-core/` | `.claude/commands/BMad/` | 48 | 100% |
| `.bmad-creative-writing/` | `.claude/commands/bmad-cw/` | 89 | 100% |
| `.bmad-infrastructure-devops/` | `.claude/commands/bmadInfraDevOps/` | 11 | 100% |

**總重複數量**: 148 檔案 × 2 = 296 個重複文件

#### BMad 框架內容概覽

1. **BMad Core** (48 個 MD 文件)
   - `agents/` - Agent 定義
   - `agent-teams/` - Agent 團隊配置
   - `checklists/` - 檢查清單
   - `data/` - 數據模板
   - `tasks/` - 任務定義
   - `templates/` - 文件模板
   - `utils/` - 工具腳本
   - `workflows/` - 工作流程

2. **BMad Creative Writing** (89 個 MD 文件)
   - 創意寫作相關的 Agents, Workflows, Templates

3. **BMad Infrastructure DevOps** (11 個 MD 文件)
   - 基礎設施和 DevOps 相關配置

### 根目錄知識庫重複

**問題**: `agent-brain/` 目錄下有完整的知識庫系統,但根目錄也有範例文件

| 根目錄文件 | agent-brain/ 對應文件 | 建議處理 |
|-----------|---------------------|----------|
| `persona.md` | `agent-brain/agents/cdo-advisor/persona*.md` | 刪除根目錄版本 |
| `cdo_faq.md` | `agent-brain/agents/cdo-advisor/cdo_faq*.md` | 刪除根目錄版本 |
| `kpi_dictionary.md` | `agent-brain/agents/cdo-advisor/kpi_dictionary*.md` | 刪除根目錄版本 |

---

## 📋 按文件類型分類

### 1. 項目管理文件 (Project Management)

**用途**: 追蹤項目進度、規劃與狀態

| 文件 | 時期 | 狀態 | 建議位置 |
|------|------|------|----------|
| `SPRINT_PLAN.md` | 初期規劃 | Read-Only 參考 | `docs/00-planning/` |
| `PROJECT_STATUS.md` | POC 完成 | 歷史參考 | 根目錄 (保留) |
| `DEVELOPMENT_STATUS.md` | POC 完成 | 歷史參考 | 根目錄 (保留) |
| `docs/MVP_PROGRESS.md` | MVP 執行中 | **活躍** | `docs/` (保留) |

### 2. 技術文件 (Technical Documentation)

**用途**: 架構、API、部署指南

| 文件 | 時期 | 狀態 | 建議位置 |
|------|------|------|----------|
| `CLAUDE.md` | 全階段 | **活躍** | 根目錄 (保留) |
| `AI_ASSISTANT_GUIDE.md` | 全階段 | **活躍** | 根目錄 (保留) |
| `docs/architecture.md` | 初期 | 參考 | `docs/00-planning/` |
| `docs/api-reference-*.md` | POC | 參考 | `docs/01-poc-development/api/` |
| `docs/deployment-guide.md` | 全階段 | **活躍** | `docs/` (保留) |

### 3. Story 與 Epic 文件 (Development Stories)

**用途**: Story 實作細節與 Epic 完成報告

| 文件分類 | 時期 | 狀態 | 建議位置 |
|---------|------|------|----------|
| `docs/stories/*.md` (29 個) | POC | 歷史參考 | `docs/01-poc-development/stories/` |
| `docs/epic-*-completion-report.md` (5 個) | POC | 歷史參考 | `docs/01-poc-development/epics/` |
| `docs/sprint-*-summary.md` (10 個) | POC | 歷史參考 | `docs/01-poc-development/sprints/` |

### 4. 測試文件 (Testing Documentation)

**用途**: 測試指南、檢查清單

| 文件 | 時期 | 狀態 | 建議位置 |
|------|------|------|----------|
| `docs/epic-{3-5}-test-guide.md` | POC | 參考 | `docs/01-poc-development/testing/` |
| `docs/browser-compatibility-test.md` | POC | 參考 | `docs/01-poc-development/testing/` |
| `docs/cross-browser-test-checklist.md` | POC | 參考 | `docs/01-poc-development/testing/` |

### 5. 修復日誌 (Bug Fix Logs)

**用途**: 記錄問題診斷與修復過程

| 文件 | 日期 | 狀態 | 建議位置 |
|------|------|------|----------|
| `docs/FIXES_2025-10-18.md` | 2025-10-18 | 歷史參考 | `docs/02-mvp-development/fixes/` |
| `docs/FIXES_2025-10-19.md` | 2025-10-19 | 歷史參考 | `docs/02-mvp-development/fixes/` |
| `docs/LIPSYNC_FIXES_2025-10-20.md` | 2025-10-20 | 歷史參考 | `docs/02-mvp-development/fixes/` |
| `docs/KNOWLEDGE_SYSTEM_ISSUES_AND_FIXES.md` | 最近 | 歷史參考 | `docs/02-mvp-development/fixes/` |

### 6. 知識庫文件 (Knowledge Base)

**用途**: AI Agent 知識庫系統

| 目錄 | 文件數量 | 狀態 | 建議處理 |
|------|---------|------|----------|
| `agent-brain/agents/cdo-advisor/` | ~14 | **活躍** | 保留 |
| 根目錄範例 (`persona.md`, `cdo_faq.md`, `kpi_dictionary.md`) | 3 | **重複** | **刪除** |
| `agent-brain/KNOWLEDGE_BASE_GUIDE.md` | 1 | **活躍** | 保留 |
| `agent-brain/MAINTENANCE_GUIDE.md` | 1 | **活躍** | 保留 |
| `agent-brain/TECHNICAL_FLOW.md` | 1 | **活躍** | 保留 |

### 7. BMad 框架文件 (Framework Files)

**用途**: 開發框架與工具

| 目錄 | 文件數量 | 狀態 | 建議處理 |
|------|---------|------|----------|
| `.bmad-core/` | 48 | **主要版本** | **保留** |
| `.bmad-creative-writing/` | 89 | **主要版本** | **保留** |
| `.bmad-infrastructure-devops/` | 11 | **主要版本** | **保留** |
| `.claude/commands/BMad/` | 48 | **重複** | **刪除** |
| `.claude/commands/bmad-cw/` | 89 | **重複** | **刪除** |
| `.claude/commands/bmadInfraDevOps/` | 11 | **重複** | **刪除** |

---

## 🎯 重組建議方案

### 方案概覽

**目標**: 清晰的階段性分類 + 消除重複 + 易於導航

**原則**:
1. ✅ 按項目階段組織文件 (初期規劃 → POC 開發 → MVP 開發)
2. ✅ 活躍文件保持在易訪問位置
3. ✅ 歷史文件明確標記並歸檔
4. ✅ 消除所有重複文件
5. ✅ 保持向後兼容性 (保留重要參考文件)

---

### 建議目錄結構

```
C:\smart-ai-avatar-agent/
│
├── README.md                          # 用戶快速開始指南 (活躍)
├── CLAUDE.md                          # AI 助手技術指南 (活躍)
├── AI_ASSISTANT_GUIDE.md              # 開發者完整指南 (活躍)
├── PROJECT_INDEX.md                   # 文件索引 (活躍)
│
├── PROJECT_STATUS.md                  # POC 最終狀態 (歷史參考,保留根目錄)
├── DEVELOPMENT_STATUS.md              # POC 開發進度 (歷史參考,保留根目錄)
│
├── docs/
│   │
│   ├── MVP_PROGRESS.md                # MVP 進度追蹤 (活躍)
│   ├── deployment-guide.md            # 部署指南 (活躍)
│   ├── local-development-guide.md     # 本地開發指南 (活躍)
│   │
│   ├── 00-planning/                   # 階段 1: 項目初期規劃文件 (歷史存檔)
│   │   ├── README.md                  # 本階段說明
│   │   ├── SPRINT_PLAN.md             # 原始 Sprint 計劃
│   │   ├── prd.md                     # 產品需求文件 (如存在)
│   │   ├── architecture.md            # 架構設計
│   │   └── sprint-planning.md         # Sprint 規劃 (如存在)
│   │
│   ├── 01-poc-development/            # 階段 2: POC 開發階段 (歷史存檔)
│   │   ├── README.md                  # 本階段說明
│   │   │
│   │   ├── stories/                   # Story 實作文件 (29 個)
│   │   │   ├── epic-1/
│   │   │   │   ├── 1.1-*.md
│   │   │   │   ├── 1.2-*.md
│   │   │   │   └── ...
│   │   │   ├── epic-2/
│   │   │   ├── epic-3/
│   │   │   ├── epic-4/
│   │   │   └── epic-5/
│   │   │
│   │   ├── epics/                     # Epic 完成報告 (5 個)
│   │   │   ├── epic-1-completion-report.md
│   │   │   ├── epic-2-completion-report.md
│   │   │   └── ...
│   │   │
│   │   ├── sprints/                   # Sprint 摘要 (10 個)
│   │   │   ├── sprint-1-summary.md
│   │   │   ├── sprint-2-summary.md
│   │   │   └── ...
│   │   │
│   │   ├── testing/                   # 測試指南
│   │   │   ├── epic-3-test-guide.md
│   │   │   ├── epic-4-test-guide.md
│   │   │   ├── epic-5-test-guide.md
│   │   │   ├── browser-compatibility-test.md
│   │   │   └── cross-browser-test-checklist.md
│   │   │
│   │   └── api/                       # API 參考文件
│   │       ├── api-reference-sprint-2.md
│   │       ├── api-reference-sprint-3.md
│   │       ├── conversations-api.md
│   │       └── avatar-favorite-api.md
│   │
│   └── 02-mvp-development/            # 階段 3: MVP 開發階段
│       ├── README.md                  # 本階段說明
│       │
│       ├── features/                  # 功能實作指南
│       │   ├── lip-sync-implementation.md
│       │   ├── i18n-implementation.md
│       │   ├── knowledge-system-implementation.md
│       │   └── ...
│       │
│       ├── fixes/                     # 修復日誌
│       │   ├── FIXES_2025-10-18.md
│       │   ├── FIXES_2025-10-19.md
│       │   ├── LIPSYNC_FIXES_2025-10-20.md
│       │   └── KNOWLEDGE_SYSTEM_ISSUES_AND_FIXES.md
│       │
│       └── testing/                   # MVP 測試文件
│           └── (未來測試文件)
│
├── agent-brain/                       # 知識庫系統 (活躍)
│   ├── README.md
│   ├── KNOWLEDGE_BASE_GUIDE.md
│   ├── MAINTENANCE_GUIDE.md
│   ├── TECHNICAL_FLOW.md
│   └── agents/
│       └── cdo-advisor/
│           ├── persona*.md (3 個語言版本)
│           ├── cdo_faq*.md (3 個語言版本)
│           ├── kpi_dictionary*.md (3 個語言版本)
│           ├── decisions/
│           ├── meetings/
│           └── pov_briefing*.md (3 個語言版本)
│
├── .bmad-core/                        # BMad 核心框架 (保留)
├── .bmad-creative-writing/            # BMad 創意寫作 (保留)
├── .bmad-infrastructure-devops/       # BMad 基礎設施 (保留)
│
├── .claude/                           # Claude 配置
│   └── commands/                      # 命令目錄
│       ├── (其他命令,保留)
│       ├── BMad/                      # ❌ 刪除 (重複)
│       ├── bmad-cw/                   # ❌ 刪除 (重複)
│       └── bmadInfraDevOps/           # ❌ 刪除 (重複)
│
├── claudedocs/                        # Claude 分析報告 (活躍)
│   └── MD_FILES_ANALYSIS_REPORT.md    # 本報告
│
└── (根目錄重複文件)                   # ❌ 刪除
    ├── persona.md                     # ❌ 刪除 (重複 agent-brain/)
    ├── cdo_faq.md                     # ❌ 刪除 (重複 agent-brain/)
    └── kpi_dictionary.md              # ❌ 刪除 (重複 agent-brain/)
```

---

### 重組執行計劃

#### Phase 1: 準備與備份 (30 分鐘)

**步驟**:
1. ✅ **Git 檢查點**: 提交所有當前變更
   ```bash
   git add .
   git commit -m "docs: checkpoint before MD files reorganization"
   ```

2. ✅ **建立備份分支**: 以防需要回滾
   ```bash
   git checkout -b backup/md-reorganization-2025-10-22
   git push origin backup/md-reorganization-2025-10-22
   git checkout main
   ```

3. ✅ **建立新目錄結構**:
   ```bash
   mkdir -p docs/00-planning
   mkdir -p docs/01-poc-development/{stories,epics,sprints,testing,api}
   mkdir -p docs/01-poc-development/stories/{epic-1,epic-2,epic-3,epic-4,epic-5}
   mkdir -p docs/02-mvp-development/{features,fixes,testing}
   ```

---

#### Phase 2: 移動 POC 規劃文件 (15 分鐘)

**執行命令**:
```bash
# 移動規劃文件
git mv SPRINT_PLAN.md docs/00-planning/
git mv docs/architecture.md docs/00-planning/ (如存在)
git mv docs/prd.md docs/00-planning/ (如存在)
git mv docs/sprint-planning.md docs/00-planning/ (如存在)

# 創建 README
# (手動創建 docs/00-planning/README.md 說明本階段文件)
```

---

#### Phase 3: 移動 POC 開發文件 (45 分鐘)

**3.1 移動 Story 文件 (29 個)**:
```bash
# Epic 1 Stories (5 個)
git mv docs/stories/1.1-*.md docs/01-poc-development/stories/epic-1/
git mv docs/stories/1.2-*.md docs/01-poc-development/stories/epic-1/
git mv docs/stories/1.3-*.md docs/01-poc-development/stories/epic-1/
git mv docs/stories/1.4-*.md docs/01-poc-development/stories/epic-1/
git mv docs/stories/1.5-*.md docs/01-poc-development/stories/epic-1/

# Epic 2 Stories (5 個)
git mv docs/stories/2.*.md docs/01-poc-development/stories/epic-2/

# Epic 3 Stories (7 個)
git mv docs/stories/3.*.md docs/01-poc-development/stories/epic-3/

# Epic 4 Stories (5 個)
git mv docs/stories/4.*.md docs/01-poc-development/stories/epic-4/

# Epic 5 Stories (7 個)
git mv docs/stories/5.*.md docs/01-poc-development/stories/epic-5/

# 刪除空的 stories 目錄
rmdir docs/stories
```

**3.2 移動 Epic 與 Sprint 文件**:
```bash
# Epic 完成報告
git mv docs/epic-*-completion-report.md docs/01-poc-development/epics/

# Sprint 摘要
git mv docs/sprint-*-summary.md docs/01-poc-development/sprints/
```

**3.3 移動測試文件**:
```bash
git mv docs/epic-3-test-guide.md docs/01-poc-development/testing/
git mv docs/epic-4-test-guide.md docs/01-poc-development/testing/
git mv docs/epic-5-test-guide.md docs/01-poc-development/testing/
git mv docs/browser-compatibility-test.md docs/01-poc-development/testing/
git mv docs/cross-browser-test-checklist.md docs/01-poc-development/testing/
```

**3.4 移動 API 文件**:
```bash
git mv docs/api-reference-sprint-*.md docs/01-poc-development/api/
git mv docs/conversations-api.md docs/01-poc-development/api/
git mv docs/avatar-favorite-api.md docs/01-poc-development/api/ (如存在)
```

---

#### Phase 4: 移動 MVP 開發文件 (20 分鐘)

**4.1 移動功能實作指南**:
```bash
git mv docs/lip-sync-implementation.md docs/02-mvp-development/features/
git mv docs/i18n-implementation.md docs/02-mvp-development/features/
git mv docs/knowledge-system-implementation.md docs/02-mvp-development/features/ (如存在)
```

**4.2 移動修復日誌**:
```bash
git mv docs/FIXES_2025-10-18.md docs/02-mvp-development/fixes/
git mv docs/FIXES_2025-10-19.md docs/02-mvp-development/fixes/
git mv docs/LIPSYNC_FIXES_2025-10-20.md docs/02-mvp-development/fixes/
git mv docs/KNOWLEDGE_SYSTEM_ISSUES_AND_FIXES.md docs/02-mvp-development/fixes/
```

---

#### Phase 5: 刪除重複文件 (30 分鐘)

**5.1 刪除 BMad 框架重複**:
```bash
# 檢查 .gitignore 確保不會誤刪
cat .gitignore

# 刪除重複的 BMad 命令目錄
git rm -r .claude/commands/BMad/
git rm -r .claude/commands/bmad-cw/
git rm -r .claude/commands/bmadInfraDevOps/
```

**5.2 刪除根目錄知識庫重複**:
```bash
# 刪除根目錄的範例文件
git rm persona.md
git rm cdo_faq.md
git rm kpi_dictionary.md
```

**預期刪除數量**: ~151 個重複文件

---

#### Phase 6: 更新參考與文件 (30 分鐘)

**6.1 更新 PROJECT_INDEX.md**:
```bash
npm run sync-index
```

**6.2 創建各階段 README.md**:
手動創建以下文件,說明各階段文件用途:
- `docs/00-planning/README.md`
- `docs/01-poc-development/README.md`
- `docs/02-mvp-development/README.md`

**6.3 更新主要文件的路徑參考**:
- `CLAUDE.md`: 更新文件路徑參考
- `AI_ASSISTANT_GUIDE.md`: 更新文件路徑參考
- `README.md`: 如有路徑參考則更新

---

#### Phase 7: 驗證與提交 (15 分鐘)

**7.1 驗證文件結構**:
```bash
# 檢查新目錄結構
ls -R docs/

# 驗證沒有遺漏的文件
find docs/ -name "*.md" -type f | wc -l

# 檢查 Git 狀態
git status
```

**7.2 提交變更**:
```bash
git add .
git commit -m "docs: reorganize MD files by project phases

- 移動 POC 規劃文件至 docs/00-planning/
- 移動 POC 開發文件至 docs/01-poc-development/
- 移動 MVP 開發文件至 docs/02-mvp-development/
- 刪除 BMad 框架重複文件 (148 個)
- 刪除根目錄知識庫重複文件 (3 個)
- 更新 PROJECT_INDEX.md
- 創建各階段 README.md

總計: 300+ → ~149 個文件 (減少 50%)

詳細分析報告: claudedocs/MD_FILES_ANALYSIS_REPORT.md"

git push origin main
```

---

### 預期成果

**重組前**:
- ✅ 總文件數: 300+ MD 文件
- ❌ 重複文件: ~151 個
- ❌ 混亂程度: 高 (無清晰分類)
- ❌ 導航難度: 困難

**重組後**:
- ✅ 總文件數: ~149 MD 文件 (減少 50%)
- ✅ 重複文件: 0 個
- ✅ 混亂程度: 低 (清晰階段分類)
- ✅ 導航難度: 簡單 (3 個主要階段目錄)

**檔案減少統計**:
- BMad 框架重複刪除: -148 個
- 根目錄知識庫重複刪除: -3 個
- 總減少: -151 個文件 (50% 減少)

---

## 🔍 重組後導航指南

### 快速查找文件

**情境 1: 我想查看最新的項目進度**
```
→ docs/MVP_PROGRESS.md (MVP 開發進度)
→ PROJECT_STATUS.md (POC 最終狀態,歷史參考)
```

**情境 2: 我想了解原始的項目規劃**
```
→ docs/00-planning/SPRINT_PLAN.md
→ docs/00-planning/architecture.md
```

**情境 3: 我想查看某個 POC Story 的實作細節**
```
→ docs/01-poc-development/stories/epic-X/
→ 範例: docs/01-poc-development/stories/epic-3/3.1-chat-ui.md
```

**情境 4: 我想了解最近的 Bug 修復記錄**
```
→ docs/02-mvp-development/fixes/
→ 範例: docs/02-mvp-development/fixes/FIXES_2025-10-19.md
```

**情境 5: 我想查看 API 文件**
```
→ docs/01-poc-development/api/
→ 範例: docs/01-poc-development/api/conversations-api.md
```

**情境 6: 我想了解知識庫系統**
```
→ agent-brain/KNOWLEDGE_BASE_GUIDE.md
→ agent-brain/agents/cdo-advisor/
```

**情境 7: 我想使用 BMad 框架**
```
→ .bmad-core/ (核心框架)
→ .bmad-creative-writing/ (創意寫作)
→ .bmad-infrastructure-devops/ (基礎設施)
```

---

## 📝 維護建議

### 未來文件管理原則

**原則 1: 階段性歸檔**
- 每個開發階段完成後,將文件歸檔至對應目錄
- 範例: POC 完成 → 移至 `docs/01-poc-development/`

**原則 2: 活躍文件優先**
- 當前活躍使用的文件保持在易訪問位置 (根目錄或 `docs/` 根層級)
- 範例: `MVP_PROGRESS.md` 保持在 `docs/` 根層級

**原則 3: 避免重複**
- 單一真實來源 (Single Source of Truth)
- 如需多處引用,使用符號連結或文件參考,不要複製

**原則 4: 清晰命名**
- 文件名應清楚表達內容與時期
- 範例: `FIXES_2025-10-22.md` 比 `fixes.md` 更好

**原則 5: 定期檢視**
- 每月檢視一次文件結構
- 識別過時文件並歸檔或刪除

---

## ⚠️ 風險與注意事項

### 執行風險

**風險 1: 路徑參考失效**
- **影響**: 其他文件或代碼中的路徑參考可能失效
- **緩解**: 執行前全局搜索路徑參考,執行後更新

**風險 2: Git 歷史追蹤**
- **影響**: Git 移動文件後,歷史追蹤可能需要加 `--follow` 參數
- **緩解**: 使用 `git mv` 而非 `mv` 命令,保留 Git 歷史

**風險 3: 團隊成員混淆**
- **影響**: 其他團隊成員可能找不到原來位置的文件
- **緩解**: 提前溝通重組計劃,提供導航指南

**風險 4: CI/CD 影響**
- **影響**: 部署腳本或 CI/CD 配置可能參考舊路徑
- **緩解**: 檢查 `.github/workflows/` 和 `package.json` 腳本

### 執行前檢查清單

- [ ] ✅ Git 所有變更已提交
- [ ] ✅ 建立備份分支 `backup/md-reorganization-2025-10-22`
- [ ] ✅ 全局搜索路徑參考 (使用 IDE 搜索功能)
- [ ] ✅ 檢查 CI/CD 配置是否參考文件路徑
- [ ] ✅ 團隊成員已知悉重組計劃
- [ ] ✅ 預留 2-3 小時完整執行時間

---

## 📌 總結與建議

### 核心問題

1. **重複文件嚴重**: BMad 框架文件 100% 重複 (148 檔案 × 2)
2. **時期混雜**: POC、MVP 文件混在一起,難以區分
3. **缺乏分類**: 無清晰的階段性或類型性分類
4. **根目錄混亂**: 知識庫範例文件與正式文件混雜

### 建議行動

**立即執行** (優先級: P0):
1. ✅ **刪除 BMad 框架重複**: 節省 148 個文件
   - 刪除 `.claude/commands/BMad/`
   - 刪除 `.claude/commands/bmad-cw/`
   - 刪除 `.claude/commands/bmadInfraDevOps/`

2. ✅ **刪除根目錄知識庫重複**: 節省 3 個文件
   - 刪除 `persona.md`
   - 刪除 `cdo_faq.md`
   - 刪除 `kpi_dictionary.md`

**短期執行** (優先級: P1, 2-3 小時):
3. ✅ **重組 docs/ 目錄**: 按階段分類
   - 創建 `docs/00-planning/`
   - 創建 `docs/01-poc-development/`
   - 創建 `docs/02-mvp-development/`
   - 移動所有文件至對應目錄

4. ✅ **更新參考文件**:
   - 更新 `PROJECT_INDEX.md`
   - 更新 `CLAUDE.md` 路徑參考
   - 創建各階段 README.md

**長期維護** (優先級: P2):
5. ✅ **建立文件管理規範**:
   - 定義文件命名規則
   - 定義文件歸檔流程
   - 定期檢視文件結構

### 預期效益

**即時效益**:
- ✅ 文件數量減少 50% (300+ → ~149)
- ✅ 消除所有重複文件
- ✅ 清晰的階段性分類

**長期效益**:
- ✅ 新成員上手更快 (清晰的文件結構)
- ✅ 維護成本降低 (無重複文件)
- ✅ 查找效率提升 (階段性分類)
- ✅ 文件品質提升 (定期檢視與歸檔)

---

## 📞 下一步行動

**請用戶確認**:

1. ✅ **是否同意本分析報告的發現?**
2. ✅ **是否批准執行重組計劃?**
3. ✅ **是否需要調整重組方案?**

**執行選項**:

**選項 A**: 完整重組 (建議)
- 執行所有 Phase 1-7
- 預計時間: 2-3 小時
- 效益: 最大化

**選項 B**: 部分重組 (快速)
- 僅執行 Phase 1, 5 (刪除重複文件)
- 預計時間: 1 小時
- 效益: 減少文件數量,暫不重組

**選項 C**: 分階段執行 (穩妥)
- Week 1: Phase 1, 5 (刪除重複)
- Week 2: Phase 2, 3, 4 (重組文件)
- Week 3: Phase 6, 7 (更新參考)
- 預計時間: 每週 1 小時
- 效益: 降低風險,逐步改善

---

**報告完成日期**: 2025-10-22
**報告作者**: Claude Code
**分析範圍**: 全專案 300+ MD 文件
**建議執行時機**: 本週內 (POC 完成,MVP 核心功能完成,適合重組)

---

## 附錄: 詳細文件清單

### A. 根目錄文件 (15 個)

**活躍文件** (7 個):
- README.md
- CLAUDE.md
- AI_ASSISTANT_GUIDE.md
- PROJECT_INDEX.md
- .gitignore
- package.json
- tsconfig.json

**歷史參考文件** (3 個):
- PROJECT_STATUS.md (POC 最終狀態)
- DEVELOPMENT_STATUS.md (POC 開發進度)
- SPRINT_PLAN.md (應移至 docs/00-planning/)

**重複文件 - 待刪除** (3 個):
- persona.md (重複 agent-brain/)
- cdo_faq.md (重複 agent-brain/)
- kpi_dictionary.md (重複 agent-brain/)

**測試文件** (如存在):
- TEST_ADAPTIVE_INTENSITY.md
- TEST_COARTICULATION.md

---

### B. docs/ 目錄文件 (128+ 個)

**活躍文件**:
- MVP_PROGRESS.md
- deployment-guide.md
- local-development-guide.md

**Story 文件 (29 個)**:
- stories/1.1-*.md ~ stories/5.7-*.md

**Epic 完成報告 (5 個)**:
- epic-1-completion-report.md ~ epic-5-completion-report.md

**Sprint 摘要 (10 個)**:
- sprint-1-summary.md ~ sprint-10-summary.md

**測試指南**:
- epic-3-test-guide.md
- epic-4-test-guide.md
- epic-5-test-guide.md
- browser-compatibility-test.md
- cross-browser-test-checklist.md

**API 文件**:
- api-reference-sprint-2.md
- api-reference-sprint-3.md
- conversations-api.md
- avatar-favorite-api.md (如存在)

**修復日誌**:
- FIXES_2025-10-18.md
- FIXES_2025-10-19.md
- LIPSYNC_FIXES_2025-10-20.md
- KNOWLEDGE_SYSTEM_ISSUES_AND_FIXES.md

**實作指南**:
- lip-sync-implementation.md
- i18n-implementation.md
- knowledge-system-implementation.md (如存在)

---

### C. agent-brain/ 知識庫文件 (~20 個)

**指南文件**:
- README.md
- KNOWLEDGE_BASE_GUIDE.md
- MAINTENANCE_GUIDE.md
- TECHNICAL_FLOW.md

**CDO Advisor 知識庫** (14+ 個):
- agents/cdo-advisor/persona.md (3 語言版本)
- agents/cdo-advisor/cdo_faq.md (3 語言版本)
- agents/cdo-advisor/kpi_dictionary.md (3 語言版本)
- agents/cdo-advisor/pov_briefing_generative_ai_strategy.md (3 語言版本)
- agents/cdo-advisor/decisions/decision_log_project_phoenix.md
- agents/cdo-advisor/meetings/meeting_summary_2025-10-14_Q4數據策略覆盤.md

---

### D. BMad 框架文件 (148 個 + 148 重複 = 296 個)

**主要版本** (保留):
- .bmad-core/ (48 個)
- .bmad-creative-writing/ (89 個)
- .bmad-infrastructure-devops/ (11 個)

**重複版本 - 待刪除** (148 個):
- .claude/commands/BMad/ (48 個) ❌
- .claude/commands/bmad-cw/ (89 個) ❌
- .claude/commands/bmadInfraDevOps/ (11 個) ❌

---

**文件清單統計完成**
**總計**: 300+ MD 文件分析完畢
