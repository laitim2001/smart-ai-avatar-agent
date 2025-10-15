# 索引維護指南 (Index Maintenance Guide)

> **目的**: 確保 PROJECT_INDEX.md 和 AI_ASSISTANT_GUIDE.md 保持最新且準確
> **適用對象**: 開發團隊、Tech Lead、AI 助手
> **最後更新**: 2025-10-15

---

## 🎯 為什麼需要維護索引？

### 索引的重要性

```yaml
AI 助手:
  - 快速理解專案結構（避免誤判檔案是否存在）
  - 正確判斷開發依賴關係
  - 提供準確的建議和指導

開發者:
  - 快速定位檔案位置
  - 理解專案整體架構
  - 新人入職快速上手

品質保證:
  - 文檔與程式碼同步
  - 避免過時資訊誤導
  - 保持專案可維護性
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

## 🛠️ 維護方法

### 方法 1: 手動更新（當前標準方式）

#### Step 1: 識別需要更新的內容

```bash
# 查看最近的檔案變更
git log --oneline --name-status -10

# 查看當前分支的變更
git status

# 查看檔案修改時間
ls -lt app/ components/ lib/
```

#### Step 2: 編輯索引檔案

```bash
# 開啟索引檔案
code PROJECT_INDEX.md

# 需要更新的區域：
# 1. 檔案狀態（⏳ → ✅）
# 2. 統計數據
# 3. 新增檔案條目
# 4. 依賴關係圖
# 5. 最後更新日期
```

#### Step 3: 更新範例

**情境 A: Story 1.2 完成後**
```markdown
# 變更前
| `lib/azure/openai.ts` | ⏳ | Azure OpenAI 客戶端 | 1.2 |

# 變更後
| `lib/azure/openai.ts` | ✅ | Azure OpenAI 客戶端 | 1.2 |

# 同時更新統計
Epic 1 (專案基礎): 12.5% (1/8 Stories)  # 舊
Epic 1 (專案基礎): 25% (2/8 Stories)    # 新
```

**情境 B: 新增檔案**
```markdown
# 在對應章節新增條目
| `lib/utils/logger.ts` | ✅ | 日誌工具 | 5.2 | 結構化日誌 |
```

#### Step 4: 驗證更新

```bash
# 檢查 Markdown 格式
# 使用 VS Code 預覽功能確認格式正確

# 搜尋測試
# 使用 Ctrl+F 測試關鍵字搜尋是否有效
```

#### Step 5: 提交變更

```bash
git add PROJECT_INDEX.md AI_ASSISTANT_GUIDE.md
git commit -m "docs: update project index after Story X.X completion

- Update file status from ⏳ to ✅
- Update statistics (Epic X: Y% complete)
- Add new file entries for Story X.X"

git push origin main
```

---

### 方法 2: 半自動化更新（推薦）

#### 使用自動化腳本生成基礎索引

```bash
# 1. 執行索引生成腳本
npm run generate-index
# 或
node scripts/generate-index.js

# 2. 檢視自動生成的索引
# scripts/generate-index.js 會掃描專案並生成基礎檔案樹

# 3. 手動補充詳細資訊
# - 檔案說明
# - Story 編號
# - 依賴關係
# - 關鍵功能說明

# 4. 合併到 PROJECT_INDEX.md
# 保留手動編寫的章節（如使用說明、依賴關係圖）
# 更新自動生成的章節（如檔案列表、統計數據）
```

---

### 方法 3: 完全自動化（未來目標）

#### 理想的自動化流程

```yaml
Git Hook 觸發:
  - pre-commit: 檢查索引是否需要更新
  - post-commit: 自動更新統計數據

CI/CD 整合:
  - GitHub Actions 自動執行 generate-index.js
  - 檢測到檔案變更時自動更新 PROJECT_INDEX.md
  - 自動建立 Pull Request

智能檢測:
  - 識別新增/刪除/重命名的檔案
  - 自動判斷檔案狀態（✅ / ⏳）
  - 自動更新依賴關係
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

**解決方案**:
```bash
# 1. 回顧最近的 commit
git log --oneline -20

# 2. 識別哪些 Story 完成了但索引未更新
# 3. 批量更新所有遺漏的變更
# 4. 在 commit message 中說明

git commit -m "docs: catch up project index for Stories 1.2-1.4

Missed updates:
- Story 1.2: Azure services setup (completed)
- Story 1.3: Base UI framework (completed)
- Story 1.4: Health check API (completed)

Updated file statuses, statistics, and dependencies."
```

### Q2: 索引與實際不符怎麼辦？

**解決方案**:
```bash
# 1. 執行自動化腳本驗證
npm run generate-index

# 2. 比對自動生成的結果與手動索引
# 3. 識別差異並修正
# 4. 標記為 "fix" 類型的 commit

git commit -m "fix: correct project index inaccuracies

- Fixed file status for lib/azure/openai.ts
- Corrected Epic 1 completion percentage
- Updated dependency relationships"
```

### Q3: 新增大量檔案後如何快速更新？

**解決方案**:
```bash
# 1. 使用自動化腳本生成基礎列表
node scripts/generate-index.js > temp-index.md

# 2. 提取需要的部分
# 3. 合併到 PROJECT_INDEX.md
# 4. 手動補充詳細說明

# 提示: 使用 VS Code 的 Compare 功能比對差異
```

### Q4: 如何確保團隊都遵守維護規範？

**解決方案**:
```yaml
流程整合:
  - 將索引更新加入 Definition of Done (DoD)
  - Story 完成 Checklist 包含「更新 PROJECT_INDEX.md」
  - Code Review 時檢查索引是否更新

自動化提醒:
  - Git pre-commit hook 檢查
  - PR template 包含索引更新確認
  - Sprint 回顧時檢視索引品質

文化建立:
  - 在入職培訓中強調索引重要性
  - 定期分享索引幫助開發的案例
  - 表揚維護索引的良好習慣
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

### 可用工具

| 工具 | 用途 | 使用方式 |
|------|------|---------|
| `generate-index.js` | 自動生成檔案列表 | `npm run generate-index` |
| VS Code Search | 驗證索引完整性 | `Ctrl+Shift+F` |
| Git Diff | 檢視索引變更 | `git diff PROJECT_INDEX.md` |

### 未來計畫開發的工具

```yaml
validate-index.js:
  用途: 驗證索引完整性和準確性
  功能:
    - 檢查檔案是否存在
    - 驗證狀態標記
    - 檢查依賴關係
  使用: npm run validate-index

sync-index.js:
  用途: 同步索引與實際檔案系統
  功能:
    - 自動更新檔案狀態
    - 識別新增/刪除的檔案
    - 更新統計數據
  使用: npm run sync-index

check-index.js:
  用途: Git pre-commit hook
  功能:
    - 檢查是否有未索引的新檔案
    - 提醒開發者更新索引
    - 阻止不完整的 commit
  使用: 自動執行（Git hook）
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

- `PROJECT_INDEX.md` - 專案完整索引
- `AI_ASSISTANT_GUIDE.md` - AI 助手開發指南
- `DEVELOPMENT_ROADMAP.md` - 開發路線圖
- `docs/sprint-planning.md` - Sprint 規劃

---

**文件版本**: v1.0.0
**最後更新**: 2025-10-15
**維護者**: Dev Team
**審核者**: Tech Lead

---

**記住**: 良好的索引維護是高效團隊協作的基礎 🚀
