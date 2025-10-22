# 索引維護指南 (Index Maintenance Guide)

> **目的**: 確保 PROJECT_INDEX.md 保持最新且準確
> **適用對象**: 開發團隊、Tech Lead、AI 助手
> **最後更新**: 2025-10-22

---

## 🎯 為什麼需要維護索引？

### 索引的重要性

```yaml
AI 助手:
  - 快速理解專案結構（避免誤判檔案是否存在）
  - 正確判斷開發依賴關係
  - 提供準確的建議和指導
  - 理解目錄用途、檔案關係和重要性

開發者:
  - 快速定位檔案位置和了解用途
  - 理解專案整體架構和技術棧
  - 新人入職快速上手
  - 查看檔案優先級和依賴關係

品質保證:
  - 文檔與程式碼同步
  - 避免過時資訊誤導
  - 保持專案可維護性
  - 確保索引品質標準
```

### 索引過時的影響

```yaml
問題場景:
  - ❌ AI 助手假設檔案存在但實際不存在 → 產生錯誤程式碼
  - ❌ 開發者根據舊索引找不到檔案 → 浪費時間
  - ❌ Story 依賴關係不清楚 → 開發順序錯誤
  - ❌ 統計數據不準確 → 進度追蹤失準
```

---

## 📋 維護時機與觸發條件

### 🔴 必須立即更新（Critical）

| 觸發事件 | 更新內容 | 時間要求 |
|---------|---------|---------|
| ✅ **Story 完成** | 更新檔案狀態為 ✅ | 完成當天 |
| 🆕 **新增重要檔案** | 添加檔案條目 | 建立後立即 |
| 🔄 **重構目錄結構** | 更新整個檔案樹 | 重構完成後 |
| 📊 **Epic 完成** | 更新統計與進度 | Epic 驗收後 |

### 🟡 建議定期更新（Recommended）

| 觸發事件 | 更新內容 | 時間要求 |
|---------|---------|---------|
| 📅 **Sprint 結束** | 全面檢查並更新 | Sprint 回顧會後 |
| 🔍 **發現不準確** | 修正錯誤資訊 | 發現後 3 天內 |
| 📝 **新增文檔** | 更新文檔索引 | 週內 |

### 🟢 可選更新（Optional）

| 觸發事件 | 更新內容 | 時間要求 |
|---------|---------|---------|
| 💡 **改進建議** | 優化說明文字 | 彈性 |
| 🎨 **格式優化** | 改善可讀性 | 彈性 |

---

## 🛠️ 維護方法與工具

### 三個維護工具概述

專案提供三個索引維護工具，各有不同用途：

| 工具 | 用途 | 使用時機 | 修改索引 |
|------|------|---------|---------|
| **generate-index.js** | 從零生成完整索引 | 首次建立、大幅重構後 | ✅ 完全重寫 |
| **validate-index.js** | 驗證索引正確性 | 每週定期檢查、CI/CD | ❌ 僅報告錯誤 |
| **sync-index.js** | 同步檔案狀態 | Story 完成後、每日更新 | ✅ 更新狀態標記 |

---

### 方法 1: 自動同步檔案狀態（日常維護）⭐ 推薦

**使用 sync-index.js 工具**

#### 使用時機
- ✅ Story 完成後，檔案狀態需要從 ⏳ 更新為 ✅
- ✅ 每日開發結束時同步索引
- ✅ 發現索引狀態與實際不符

#### 使用方式

```bash
# 1. 預覽變更（不實際修改檔案）
npm run sync-index -- --dry-run

# 2. 應用變更（自動更新索引）
npm run sync-index

# 3. 詳細模式（顯示所有變更細節）
npm run sync-index -- --verbose
```

#### 工具功能

```yaml
自動處理:
  ✅ 掃描實際檔案系統
  ✅ 比對 PROJECT_INDEX.md 內容
  ✅ 自動更新檔案狀態（⏳ → ✅）
  ✅ 識別新增檔案（提示手動添加）
  ✅ 識別刪除檔案（標記為警告）
  ✅ 更新最後更新日期
  ✅ 自動遞增版本號

手動處理:
  ⚠️ 新增檔案的詳細說明（工具會列出清單）
  ⚠️ 刪除檔案的索引清理
  ⚠️ 檔案用途和關係的補充說明
```

#### 執行範例

```bash
$ npm run sync-index

🔄 開始同步專案索引...

═════════════════════════════════════════════

📖 讀取當前索引...
  ✅ 已讀取 PROJECT_INDEX.md

📂 掃描實際檔案系統...
  ✅ 掃描完成：發現 383 個檔案

🔍 比對差異...

  變更摘要:
    狀態更新: 5 個
    新增檔案: 2 個
    刪除檔案: 0 個

💾 更新索引檔案...
  ✅ 已更新 PROJECT_INDEX.md

  ⚠️  注意：發現 2 個新檔案
     請手動將它們添加到索引中並補充說明
     新檔案清單：
       - lib/lipsync/controller.ts
       - lib/lipsync/mouth-animator.ts

✅ 索引已更新！

═════════════════════════════════════════════
```

#### 後續手動操作

```bash
# 1. 開啟索引檔案
code PROJECT_INDEX.md

# 2. 找到新增檔案的對應章節，手動添加條目
# 3. 補充檔案說明、Story 編號、依賴關係
# 4. 提交變更

git add PROJECT_INDEX.md
git commit -m "docs: sync index - update file status and add new entries"
git push origin main
```

---

### 方法 2: 驗證索引正確性（品質檢查）

**使用 validate-index.js 工具**

#### 使用時機
- ✅ 每週定期驗證索引品質
- ✅ 提交 PR 前驗證索引
- ✅ CI/CD 流程中自動檢查
- ✅ 懷疑索引不準確時

#### 使用方式

```bash
# 執行完整驗證
npm run validate-index

# Exit code:
# 0 - 驗證通過
# 1 - 發現錯誤
```

#### 驗證項目

```yaml
完整性檢查:
  - ✅ 索引檔案是否存在
  - ✅ 核心檔案是否存在（package.json, README.md 等）
  - ✅ 索引中的檔案路徑是否正確

準確性檢查:
  - ✅ 檔案狀態標記（✅ / ⏳）是否正確
  - ✅ 檔案大小閾值判斷（>100 bytes = 完成）
  - ✅ 標記為 ✅ 的檔案是否真的存在

結構檢查:
  - ✅ 索引檔案是否包含標準標題
  - ✅ 是否包含統計資訊區塊
```

#### 執行範例

```bash
$ npm run validate-index

🔍 開始驗證專案索引...

═════════════════════════════════════════════

📊 索引中包含 383 個檔案條目

🔍 驗證檔案存在性...
  ✅ 已存在: 381 個檔案
  ⏳ 待建立: 2 個檔案

🔍 驗證檔案狀態標記...
  ⚠️  3 個檔案狀態標記不正確

🔍 檢查核心檔案...
  ✅ README.md
  ✅ package.json
  ✅ PROJECT_INDEX.md
  ✅ CLAUDE.md

📊 驗證報告
═════════════════════════════════════════════

統計資訊:
  總檔案數: 383
  已存在: 381
  待建立: 2
  狀態不正確: 3

⚠️  警告 (3):

  1. [MEDIUM] 檔案狀態不正確: lib/temp/debug.ts
     標記為 ✅，應為 ⏳ (檔案大小: 45 bytes)

  2. [MEDIUM] 檔案狀態不正確: components/test.tsx
     標記為 ⏳，應為 ✅ (檔案大小: 1250 bytes)

💡 建議:
  1. 檢視警告並考慮修正
  2. 執行 npm run sync-index 自動更新狀態

═════════════════════════════════════════════

✅ 驗證通過！
```

---

### 方法 3: 從零生成完整索引（初始化或大幅重構）

**使用 generate-index.js 工具**

#### 使用時機
- ✅ 首次建立專案索引
- ✅ 專案結構大幅重構後
- ✅ 索引損壞需要重新生成
- ⚠️ **注意**: 會完全覆蓋現有索引，慎用！

#### 使用方式

```bash
# 完全重新生成索引（會覆蓋現有檔案）
npm run generate-index
```

#### 工具功能

```yaml
自動生成:
  ✅ 完整的檔案樹結構
  ✅ 基礎檔案列表
  ✅ 檔案大小和狀態

需要手動補充:
  ⚠️ 檔案用途說明
  ⚠️ Story 編號
  ⚠️ 依賴關係
  ⚠️ 重要性評級
  ⚠️ 架構依賴圖
  ⚠️ 快速導覽區塊
```

#### 後續手動操作

生成基礎索引後，需要手動補充：

1. **項目概覽** - 技術棧表格、架構模式
2. **快速導覽** - 按使用情境的導覽路徑
3. **目錄結構說明** - 每個目錄的用途和重要性 (⭐ 評級)
4. **架構依賴關係** - 核心數據流程圖
5. **關鍵文件索引** - P0-P3 優先級分類
6. **開發工作流程** - 常見開發任務指南

---

### 方法 4: 手動更新（補充說明性內容）

#### 使用時機
- ✅ 補充檔案用途說明
- ✅ 更新架構依賴關係圖
- ✅ 調整檔案優先級 (P0-P3)
- ✅ 更新快速導覽路徑
- ✅ 補充技術棧資訊

#### 操作步驟

```bash
# 1. 開啟索引檔案
code PROJECT_INDEX.md

# 2. 手動編輯說明性章節
#    - 項目概覽
#    - 快速導覽
#    - 目錄結構說明
#    - 架構依賴關係
#    - 關鍵文件索引

# 3. 提交變更
git add PROJECT_INDEX.md
git commit -m "docs: update index descriptions and architecture diagrams"
git push origin main
```

---

### 推薦工作流程

#### 日常開發（每日）

```bash
# Story 完成後
npm run sync-index              # 自動同步檔案狀態
code PROJECT_INDEX.md           # 手動補充新檔案說明
git add PROJECT_INDEX.md
git commit -m "docs: sync index after Story X.X"
```

#### 品質檢查（每週）

```bash
# 每週五執行
npm run validate-index          # 驗證索引品質
npm run sync-index              # 修正發現的問題
```

#### Sprint 結束時

```bash
# Sprint 回顧會後
npm run validate-index          # 完整驗證
code PROJECT_INDEX.md           # 更新架構圖和說明
git add PROJECT_INDEX.md
git commit -m "docs: update index for Sprint X completion"
```

#### 大幅重構後

```bash
# 僅在必要時使用
npm run generate-index          # 重新生成基礎結構
code PROJECT_INDEX.md           # 手動補充所有說明
```

---

## 📊 索引品質檢查清單

### 完整性檢查

```yaml
檔案覆蓋:
  - [ ] 所有 app/ 下的檔案都有條目
  - [ ] 所有 components/ 下的檔案都有條目
  - [ ] 所有 lib/ 下的檔案都有條目
  - [ ] 所有 Story 文檔都有條目
  - [ ] 所有配置檔案都有條目

狀態準確性:
  - [ ] 已建立的檔案標記為 ✅
  - [ ] 未建立的檔案標記為 ⏳
  - [ ] 開發中的檔案標記為 🔄（可選）

資訊完整性:
  - [ ] 每個檔案都有簡短說明
  - [ ] 重要檔案標記了 Story 編號
  - [ ] 依賴關係清楚標示
```

### 準確性檢查

```yaml
統計數據:
  - [ ] 總檔案數正確
  - [ ] 完成百分比正確
  - [ ] Epic 進度正確
  - [ ] Story 狀態正確

路徑正確性:
  - [ ] 所有檔案路徑可以直接使用
  - [ ] 沒有斷裂的連結
  - [ ] 相對路徑正確

時效性:
  - [ ] 最後更新日期正確
  - [ ] 版本號正確
  - [ ] 變更歷史記錄完整
```

### 可讀性檢查

```yaml
格式一致性:
  - [ ] 表格格式正確（對齊）
  - [ ] 符號使用一致（✅ ⏳ 🔄）
  - [ ] 標題層級正確

導航友好:
  - [ ] 目錄連結有效
  - [ ] 關鍵字搜尋有效
  - [ ] 分類清晰合理
```

---

## 🚨 常見問題與解決方案

### Q1: 忘記更新索引怎麼辦？

**問題**: Story 完成後忘記更新索引，現在索引狀態與實際不符。

**解決方案**:
```bash
# 方案 1: 使用 sync-index 自動同步（推薦）
npm run sync-index -- --dry-run    # 先預覽變更
npm run sync-index                 # 應用變更

# 方案 2: 手動批量更新
# 1. 回顧最近的 commit
git log --oneline -20

# 2. 識別哪些 Story 完成了但索引未更新
# 3. 手動批量更新所有遺漏的變更
code PROJECT_INDEX.md

# 4. 提交時說明更新內容
git add PROJECT_INDEX.md
git commit -m "docs: catch up project index for Stories 1.2-1.4

Missed updates:
- Story 1.2: Azure services setup (completed)
- Story 1.3: Base UI framework (completed)
- Story 1.4: Health check API (completed)

Updated file statuses, statistics, and dependencies."
```

### Q2: 索引與實際不符怎麼辦？

**問題**: 發現索引中的檔案狀態、路徑或內容與實際不符。

**解決方案**:
```bash
# 步驟 1: 驗證問題範圍
npm run validate-index             # 檢查所有不一致

# 步驟 2: 自動修正狀態問題
npm run sync-index -- --dry-run    # 預覽修正
npm run sync-index                 # 應用修正

# 步驟 3: 手動修正結構性問題
code PROJECT_INDEX.md              # 修正說明、依賴關係等

# 步驟 4: 重新驗證
npm run validate-index             # 確認問題已解決

# 步驟 5: 提交修正
git add PROJECT_INDEX.md
git commit -m "fix: correct project index inaccuracies

- Fixed file status for lib/azure/openai.ts (⏳ → ✅)
- Corrected Epic 1 completion percentage (75% → 87.5%)
- Updated dependency relationships for lib/lipsync/"
```

### Q3: 新增大量檔案後如何快速更新？

**問題**: 實作新功能後新增了 10+ 個檔案，手動添加索引很耗時。

**解決方案**:
```bash
# 步驟 1: 使用 sync-index 識別新檔案
npm run sync-index -- --dry-run

# 輸出會顯示:
#   ➕ 新增檔案 (12)
#   新檔案清單：
#     - lib/lipsync/controller.ts
#     - lib/lipsync/mouth-animator.ts
#     - ...

# 步驟 2: 應用基礎索引更新
npm run sync-index

# 步驟 3: 手動補充詳細說明
code PROJECT_INDEX.md

# 為每個新檔案添加:
# - 用途說明
# - Story 編號
# - 依賴關係
# - 優先級評級

# 步驟 4: 提交完整更新
git add PROJECT_INDEX.md
git commit -m "docs: add new lipsync module to index

Added 12 new files:
- LipSyncController and supporting modules
- Mouth animation system
- Viseme mapping utilities

All files include descriptions, Story references, and dependencies."
```

### Q4: 索引檔案完全損壞，如何重建？

**問題**: PROJECT_INDEX.md 內容混亂或損壞，需要完全重建。

**解決方案**:
```bash
# ⚠️ 注意: 此操作會覆蓋現有索引！

# 步驟 1: 備份現有索引（如果有價值內容）
cp PROJECT_INDEX.md PROJECT_INDEX.md.backup

# 步驟 2: 使用 generate-index 重建基礎結構
npm run generate-index

# 步驟 3: 手動補充說明性內容（重要！）
code PROJECT_INDEX.md

# 需要手動添加:
# - 項目概覽
# - 快速導覽
# - 目錄結構說明（⭐ 重要性評級）
# - 架構依賴關係圖
# - 關鍵文件索引（P0-P3）
# - 開發工作流程

# 步驟 4: 驗證重建結果
npm run validate-index

# 步驟 5: 提交重建的索引
git add PROJECT_INDEX.md
git commit -m "docs: rebuild project index from scratch

- Regenerated complete file structure
- Added comprehensive descriptions
- Updated architecture diagrams
- Organized files by priority (P0-P3)"
```

### Q5: 如何確保團隊都遵守維護規範？

**問題**: 團隊成員經常忘記更新索引，導致索引品質下降。

**解決方案**:
```yaml
流程整合:
  - 將索引更新加入 Definition of Done (DoD)
  - Story 完成 Checklist 包含:
    □ 執行 npm run sync-index
    □ 補充新檔案說明（如有）
    □ 提交 PROJECT_INDEX.md 變更
  - Code Review 時檢查索引是否更新

自動化檢查:
  - CI/CD 整合 validate-index（PR 合併前）
  - 每日自動執行 validate-index 並發送報告
  - Git pre-commit hook（未來規劃）
  - PR template 包含索引更新確認

定期維護:
  - 每週五執行 validate-index
  - Sprint 結束時完整檢查索引品質
  - 每月檢視索引維護指標

文化建立:
  - 入職培訓強調索引重要性
  - 分享索引幫助開發的案例
  - 表揚良好的索引維護習慣
  - Tech Lead 定期提醒和檢查
```

### Q6: validate-index 報告很多警告，都需要修正嗎？

**問題**: 驗證工具報告了 20+ 個警告，不知道哪些重要。

**解決方案**:

**警告優先級分類**:

```yaml
🔴 Critical（必須立即修正）:
  - 核心檔案缺失（package.json, README.md 等）
  - 標記為 ✅ 但檔案不存在
  - 索引檔案結構損壞

🟡 High（本週內修正）:
  - 檔案狀態不正確（✅ ↔️ ⏳）
  - 新增檔案未索引
  - 重要說明缺失

🟢 Medium（下次 Sprint 修正）:
  - 檔案大小接近閾值（95-105 bytes）
  - 格式不一致
  - 次要說明缺失

⚪ Low（可選修正）:
  - 格式優化建議
  - 可讀性改進
```

**修正策略**:

```bash
# 1. 先修正 Critical 和 High 優先級問題
npm run validate-index           # 查看完整報告
npm run sync-index               # 自動修正狀態問題

# 2. 手動修正結構性問題
code PROJECT_INDEX.md            # 補充缺失說明

# 3. 重新驗證
npm run validate-index           # 確認高優先級問題已解決

# 4. Medium 和 Low 問題可分階段處理
# 記錄在 TODO list 或 issue tracker
```

---

## 🎓 最佳實踐

### 1. 小步快跑

```yaml
不要:
  ❌ 累積多個 Story 後一次性更新索引
  ❌ 等到 Sprint 結束才更新
  ❌ 依賴記憶而非即時記錄

應該:
  ✅ 每完成一個 Story 立即更新
  ✅ 新建立重要檔案後立即添加條目
  ✅ 發現錯誤立即修正
```

### 2. 自動化優先

```yaml
使用工具:
  ✅ npm run generate-index（定期執行）
  ✅ VS Code 搜尋功能（驗證完整性）
  ✅ Git diff（檢視變更）

未來改進:
  🔄 建立 GitHub Actions 自動更新
  🔄 開發 VS Code 擴充套件
  🔄 整合到 CI/CD pipeline
```

### 3. 團隊協作

```yaml
責任分配:
  - 每個 Story 的實作者負責更新索引
  - Tech Lead 定期審查索引品質
  - Sprint 結束時團隊共同檢視

溝通機制:
  - 索引更新寫入 commit message
  - Code Review 時檢查索引
  - 每週同步索引狀態
```

---

## 📅 定期維護計畫

### 每日 (Daily)
```yaml
觸發: Story 完成
操作:
  - [ ] 更新檔案狀態（⏳ → ✅）
  - [ ] 新增檔案條目（如有）
  - [ ] 更新統計數據
時間: 5 分鐘
```

### 每週 (Weekly)
```yaml
觸發: 每週五
操作:
  - [ ] 執行 npm run generate-index 驗證
  - [ ] 檢查索引完整性
  - [ ] 修正發現的問題
時間: 15 分鐘
```

### 每 Sprint (Bi-weekly)
```yaml
觸發: Sprint 回顧會
操作:
  - [ ] 全面檢查索引品質
  - [ ] 更新依賴關係圖
  - [ ] 更新 Epic 進度
  - [ ] 審查 AI_ASSISTANT_GUIDE.md
時間: 30 分鐘
```

### 每 Epic (按需)
```yaml
觸發: Epic 完成驗收
操作:
  - [ ] 更新 Epic 狀態
  - [ ] 生成 Epic 完成報告
  - [ ] 更新整體進度統計
  - [ ] 建立 Epic 文檔快照
時間: 45 分鐘
```

---

## 🔧 工具與腳本

### 已實作工具 ✅

| 工具 | 用途 | 使用方式 | 狀態 |
|------|------|---------|------|
| `generate-index.js` | 從零生成完整索引 | `npm run generate-index` | ✅ 可用 |
| `validate-index.js` | 驗證索引完整性和準確性 | `npm run validate-index` | ✅ 可用 |
| `sync-index.js` | 同步索引與實際檔案系統 | `npm run sync-index` | ✅ 可用 |

### 輔助工具

| 工具 | 用途 | 使用方式 |
|------|------|---------|
| VS Code Search | 驗證索引完整性 | `Ctrl+Shift+F` |
| Git Diff | 檢視索引變更 | `git diff PROJECT_INDEX.md` |
| Markdown Preview | 預覽索引格式 | VS Code 內建 |

### 工具詳細說明

#### generate-index.js ✅

```yaml
用途: 從零生成完整專案索引
功能:
  - 遞迴掃描專案目錄
  - 生成完整檔案樹結構
  - 判斷檔案狀態（基於檔案大小）
  - 生成基礎統計資訊
  - 支援自訂忽略路徑
使用: npm run generate-index
注意: 會完全覆蓋現有 PROJECT_INDEX.md
適用: 首次建立、大幅重構後
```

#### validate-index.js ✅

```yaml
用途: 驗證索引完整性和準確性
功能:
  - 檢查索引檔案是否存在
  - 驗證檔案路徑是否正確
  - 檢查檔案狀態標記（✅ / ⏳）
  - 驗證核心檔案存在性
  - 生成詳細驗證報告
使用: npm run validate-index
Exit Code: 0 = 通過, 1 = 發現錯誤
適用: 每週品質檢查、CI/CD、PR 前驗證
```

#### sync-index.js ✅

```yaml
用途: 同步索引與實際檔案系統
功能:
  - 掃描實際檔案系統
  - 比對 PROJECT_INDEX.md 內容
  - 自動更新檔案狀態（⏳ → ✅）
  - 識別新增/刪除的檔案
  - 更新最後更新日期和版本號
  - 生成變更報告
使用:
  - npm run sync-index（應用變更）
  - npm run sync-index -- --dry-run（預覽變更）
  - npm run sync-index -- --verbose（詳細模式）
適用: Story 完成後、每日開發結束時
```

### 未來計畫開發的工具 🔄

```yaml
check-index.js:
  用途: Git pre-commit hook
  功能:
    - 檢查是否有未索引的新檔案
    - 提醒開發者更新索引
    - 阻止不完整的 commit（可選）
  使用: 自動執行（Git hook）
  狀態: 規劃中

auto-update-descriptions.js:
  用途: AI 輔助生成檔案說明
  功能:
    - 分析檔案內容
    - 自動生成檔案用途說明
    - 識別依賴關係
    - 建議優先級評級
  使用: npm run auto-describe
  狀態: 概念階段
```

---

## 📈 成功指標

### 索引品質指標

```yaml
完整性: ≥ 95%
  - 已建立檔案的索引覆蓋率

準確性: ≥ 98%
  - 檔案狀態標記準確率

時效性: ≤ 1 天
  - 從檔案建立到索引更新的平均時間

可用性: ≥ 90%
  - 開發者成功透過索引找到檔案的比例
```

### 維護效率指標

```yaml
更新速度: ≤ 5 分鐘/Story
  - 單個 Story 完成後索引更新時間

自動化率: ≥ 70%
  - 自動化工具處理的更新比例

錯誤率: ≤ 5%
  - 索引錯誤佔總條目的比例
```

---

## 🆘 需要幫助？

### 聯絡方式

```yaml
技術問題:
  - 查閱本文件的「常見問題」章節
  - 執行 npm run generate-index 嘗試自動修復
  - 聯絡 Tech Lead

流程問題:
  - 參考 AI_ASSISTANT_GUIDE.md
  - 在 Sprint 回顧會中提出
  - 與 PO 討論流程改進

工具開發:
  - 提交 GitHub Issue
  - 在 scripts/ 目錄建立新工具
  - 與團隊分享改進建議
```

---

## 📚 相關文檔

**核心索引文件**:
- `PROJECT_INDEX.md` - 專案完整索引與導覽
- `CLAUDE.md` - AI 助手開發指南（Claude Code 規範）
- `README.md` - 專案首頁與快速開始

**進度追蹤文件**:
- `docs/mvp/MVP_PROGRESS.md` - MVP 開發進度追蹤
- `docs/development/DEVELOPMENT_STATUS.md` - 開發狀態總覽（已廢棄）

**開發指南**:
- `docs/misc/LOCAL_DEV_GUIDE.md` - 本地開發指南
- `docs/deployment/ENVIRONMENT_VARIABLES.md` - 環境變數配置
- `docs/design/architecture.md` - 系統架構設計

**腳本工具**:
- `scripts/generate-index.js` - 索引生成工具
- `scripts/validate-index.js` - 索引驗證工具
- `scripts/sync-index.js` - 索引同步工具

---

**文件版本**: v2.0.0
**最後更新**: 2025-10-22
**變更說明**: 更新為最新的三工具維護機制（generate, validate, sync）
**維護者**: Dev Team
**審核者**: Tech Lead

---

**記住**: 良好的索引維護是高效團隊協作的基礎 🚀

### 版本歷史

- **v2.0.0** (2025-10-22): 完整更新為三工具維護機制，新增詳細使用說明和範例
- **v1.0.0** (2025-10-15): 初版發布，規劃索引維護流程
