# AI CDO 知識庫維護指南

## 📝 日常維護流程

### 1️⃣ 什麼時候需要更新知識庫？

| 觸發事件 | 需要更新的文件 | 優先級 | 更新時機 |
|---------|--------------|--------|---------|
| 🎤 **重要會議結束** | `meeting_summary_*.md` | P0 | 會議後 24 小時內 |
| 🎯 **重大決策完成** | `decision_log_*.md` | P0 | 決策確認後立即 |
| 📊 **KPI 定義變更** | `kpi_dictionary.md` | P0 | 變更生效前 |
| ❓ **發現 AI 回答錯誤** | `cdo_faq.md` 或相關文件 | P1 | 發現後 3 天內 |
| 🎭 **AI 語氣不像老闆** | `persona.md` | P1 | 發現後 1 週內 |
| 🌟 **新戰略方向發布** | `pov_briefing_*.md` | P1 | 戰略發布後 1 週內 |
| 📈 **季度業務回顧** | 歸檔舊文件、更新核心知識 | P2 | 每季度 |

---

## 🔄 維護操作步驟

### 情境 A: 會議後更新知識庫

**步驟 1: 整理會議內容**
```bash
# 1. 打開會議摘要模板
# 文件位置: agent-brain/temporal/meeting_summaries/

# 2. 建立新檔案（命名規則）
meeting_summary_2025-10-15_Q4產品策略會議.md
```

**步驟 2: 填寫結構化內容**
```markdown
# 會議摘要: Q4 產品策略會議

**日期**: 2025-10-15
**參與者**: CDO, 產品總監, 技術長
**會議類型**: 戰略規劃

## 📌 關鍵決策
1. 決定投資 AI 驅動的推薦系統（預算 $500K）
2. 暫停資料湖現代化專案（優先級下調）

## 💬 CDO 關鍵引述
> "我們需要在 Q4 看到 AI 專案的實際商業價值，不是技術 demo。"

## ✅ 待辦事項
- [ ] 產品團隊提交 AI 推薦系統 PRD（截止 10/20）
- [ ] 技術團隊評估現有資料基礎設施（截止 10/25）

## 🔗 相關文件
- [[pov_briefing_generative_ai_strategy.md]]
- [[kpi_dictionary.md#conversion_rate]]
```

**步驟 3: 儲存並提交**
```bash
# 3. 儲存檔案到正確位置
agent-brain/temporal/meeting_summaries/meeting_summary_2025-10-15_Q4產品策略會議.md

# 4. Git 提交（保留變更歷史）
git add agent-brain/temporal/
git commit -m "docs: add Q4 product strategy meeting summary"
git push origin main

# 5. 觸發知識庫重新索引（如果使用向量資料庫）
# 方案 A 不需要此步驟，下次對話時自動載入
```

**結果**: 🎉 下次使用者問「最近有什麼重要決策？」時，AI 就能引用這份會議摘要！

---

### 情境 B: 發現 AI 回答不準確

**步驟 1: 定位問題**
```yaml
使用者問題: "我們的 MAU 是怎麼計算的？"
AI 回答: "MAU 是指每月活躍使用者數..."（太籠統）
問題診斷: kpi_dictionary.md 中 MAU 定義不夠詳細
```

**步驟 2: 更新知識庫**
```bash
# 1. 開啟文件
agent-brain/core/kpi_dictionary.md

# 2. 找到 MAU 定義區塊
## MAU (Monthly Active Users) - 每月活躍使用者數

**業務定義**: 在統計月份內至少使用過一次核心功能的獨立使用者數

# 3. 補充詳細計算口徑
**技術計算口徑**:
- 統計期間: 自然月 (1號 00:00 - 月底 23:59)
- 去重邏輯: 依 user_id 去重
- 核心功能定義:
  - 瀏覽商品頁面
  - 加入購物車
  - 完成結帳
- 排除條件:
  - 測試帳號 (user_id < 10000)
  - 爬蟲流量 (bot_flag = true)

**資料來源**: `analytics.user_events` 表
**負責團隊**: Data Analytics Team
**更新頻率**: 每日 08:00 UTC

# 4. 儲存並提交
git add agent-brain/core/kpi_dictionary.md
git commit -m "docs: enhance MAU definition with technical calculation details"
git push origin main
```

**結果**: 🎯 下次問相同問題時，AI 能給出精確的技術定義！

---

### 情境 C: AI 語氣不像 CDO

**步驟 1: 收集問題案例**
```yaml
案例 1:
  使用者: "這個專案值得投資嗎？"
  AI 回答: "根據分析，這個專案具有潛力..." ❌ 太學術化
  期望回答: "看數據，ROI 不到 15%，先別急著投。" ✅ 直接、數據驅動

案例 2:
  使用者: "為什麼要做這個決定？"
  AI 回答: "經過仔細考慮..." ❌ 太謹慎
  期望回答: "就一個理由：客戶留存率掉了 12%，不做就等死。" ✅ 坦率、有急迫感
```

**步驟 2: 更新 persona.md**
```bash
# 1. 開啟人格定義文件
agent-brain/persona.md

# 2. 找到「語氣與溝通風格」區塊並加強
## 語氣與溝通風格 (Tone & Communication Style)

### 📊 數據驅動的坦率 (Data-Driven Directness)
- ✅ DO: "ROI 只有 8%，不值得。"
- ❌ DON'T: "根據分析，這個專案可能不太適合..."

### ⚡ 簡潔有力 (Concise & Impactful)
- ✅ DO: "三個原因：成本高、風險大、回報低。"
- ❌ DON'T: "經過仔細評估和多方考量..."

### 🎯 業務導向的急迫感 (Business-Oriented Urgency)
- ✅ DO: "客戶流失率 12%，這週必須有方案。"
- ❌ DON'T: "建議未來可以考慮改善客戶體驗..."

# 3. 新增實際對話範例
## 對話範例 (Conversation Examples)

### 範例 1: 專案評估
使用者: "我們該投資這個 AI 專案嗎？"
CDO: "先看三個數字：預期 ROI 15%、回本期 18 個月、成功率 60%。如果你的團隊有信心把成功率推到 75%，就做。否則，先把現有產品的轉換率提升 3% 更實際。"

### 範例 2: 危機處理
使用者: "資料品質出問題了怎麼辦？"
CDO: "立刻停止所有下游報表。第一，找出污染源；第二，評估影響範圍；第三，48 小時內給我修復計畫。記住，寧可晚一天出報表，也不能讓錯的數據流出去。"

# 4. 儲存並提交
git add agent-brain/persona.md
git commit -m "docs: enhance CDO persona with more direct communication examples"
git push origin main
```

**結果**: 🎭 AI 回答更像真實的 CDO 了！

---

## 🗂️ 檔案組織最佳實踐

### 檔案命名規則
```bash
# ✅ 好的命名（清晰、有意義、可排序）
meeting_summary_2025-10-15_Q4產品策略會議.md
decision_log_project_phoenix_architecture.md
pov_briefing_generative_ai_strategy.md

# ❌ 壞的命名（模糊、難以管理）
meeting1.md
notes.md
新文件.md
```

### 目錄結構
```bash
agent-brain/
├── persona.md                          # 🔴 核心，每次對話必讀
├── core/                               # 🟡 基礎知識，初始化載入
│   ├── cdo_faq.md
│   ├── kpi_dictionary.md
│   └── company_policies.md
├── experience/                         # 🟢 經驗層，語義搜尋載入
│   ├── decision_logs/
│   │   ├── decision_log_project_phoenix.md
│   │   └── decision_log_ai_investment_2024.md
│   └── pov_briefings/
│       ├── pov_briefing_generative_ai_strategy.md
│       └── pov_briefing_data_governance.md
└── temporal/                           # 🔵 時效層，最近 3 個月
    └── meeting_summaries/
        ├── 2025-10/
        ├── 2025-09/
        └── 2025-08/
```

### 歸檔策略
```bash
# 每季度執行（保持知識庫整潔）

# 1. 歸檔 3 個月前的會議摘要
mkdir -p agent-brain/archive/2025-Q3/meeting_summaries
mv agent-brain/temporal/meeting_summaries/2025-07-*.md agent-brain/archive/2025-Q3/meeting_summaries/

# 2. 更新 .gitignore（歸檔檔案不參與對話）
echo "agent-brain/archive/" >> .gitignore

# 3. 提交變更
git add .
git commit -m "chore: archive Q3 meeting summaries"
git push origin main
```

---

## 🔍 品質檢查清單

### 每週檢查 (Weekly Review)
- [ ] 檢視過去一週的 AI 對話記錄
- [ ] 識別回答不準確的問題（記錄到改善清單）
- [ ] 新增或更新 FAQ（如果有重複問題 ≥3 次）
- [ ] 確保所有新會議摘要都已上傳

### 每月檢查 (Monthly Review)
- [ ] 更新過時的 KPI 定義
- [ ] 檢查 persona.md 是否需要調整
- [ ] 審查決策日誌的完整性
- [ ] 歸檔舊的會議摘要（>3 個月）

### 每季檢查 (Quarterly Review)
- [ ] 全面審查知識庫內容的準確性
- [ ] 更新戰略觀點簡報（POV Briefings）
- [ ] 分析 AI 使用數據（最常問的問題、回答準確率）
- [ ] 規劃下一季的知識庫改善項目

---

## 🎓 維護團隊角色

| 角色 | 職責 | 更新權限 |
|-----|------|---------|
| **CDO** | 審核所有內容、最終決策權 | 所有文件 |
| **Chief of Staff** | 日常維護、會議摘要整理 | 除 persona.md 外所有文件 |
| **Data Analyst** | KPI 定義、技術文檔更新 | `kpi_dictionary.md` |
| **AI Engineer** | persona.md 調整、系統優化 | `persona.md` + 技術參數 |

---

## 📊 成功指標

追蹤這些指標來評估知識庫健康度：

```yaml
即時性指標:
  - 重要會議後 24 小時內上傳率: ≥ 90%
  - 知識庫最後更新距今: ≤ 7 天

準確性指標:
  - AI 回答準確率: ≥ 85%
  - 使用者回饋「不準確」比例: ≤ 10%

完整性指標:
  - 常見問題覆蓋率: ≥ 80%
  - 重大決策記錄完整度: 100%

使用率指標:
  - 每週活躍使用者數: 追蹤趨勢
  - 知識庫引用次數: 追蹤趨勢
```

---

## 🚀 快速參考

### 最常用的維護操作

```bash
# 📝 新增會議摘要
1. 複製模板: cp agent-brain/templates/meeting_template.md agent-brain/temporal/meeting_summaries/meeting_summary_YYYY-MM-DD_主題.md
2. 填寫內容
3. git add . && git commit -m "docs: add meeting summary" && git push

# 🔧 更新 FAQ
1. 編輯: agent-brain/core/cdo_faq.md
2. 新增問答對到對應分類
3. git add . && git commit -m "docs: update FAQ" && git push

# 🎯 新增決策日誌
1. 複製模板: cp agent-brain/templates/decision_log_template.md agent-brain/experience/decision_logs/decision_log_專案名稱.md
2. 填寫決策脈絡
3. git add . && git commit -m "docs: add decision log" && git push

# 🎭 調整 AI 語氣
1. 編輯: agent-brain/persona.md
2. 在「對話範例」區塊新增案例
3. git add . && git commit -m "docs: refine CDO persona" && git push
```

---

**維護重點**: 把更新知識庫變成日常習慣，就像寫會議記錄一樣自然！
