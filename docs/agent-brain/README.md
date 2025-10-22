# 多 AI Agent 知識庫系統

**版本**: 2.0.0
**更新日期**: 2025-10-22
**架構**: 多 Agent 專屬知識庫

---

## 📚 目錄結構

```
docs/agent-brain/
├── README.md                    # 本文件
│
├── shared/                      # 共用知識庫（所有 Agent 可用）
│   └── company_info.md         # 公司基本資訊
│
├── agents/                      # Agent 專屬知識庫
│   │
│   ├── cdo-advisor/            # CDO 商務顧問
│   │   ├── persona.md          # Persona 定義
│   │   ├── faq.md              # FAQ
│   │   ├── kpi_dictionary.md   # KPI 定義
│   │   ├── decisions/          # 決策日誌
│   │   │   └── project_phoenix.md
│   │   ├── meetings/           # 會議摘要
│   │   │   └── q4_strategy_review.md
│   │   └── pov/                # POV 文章
│   │       └── generative_ai_strategy.md
│   │
│   ├── language-tutor/         # 語言學習老師
│   │   ├── persona.md
│   │   ├── vocabulary.md       # 詞彙庫（待建立）
│   │   └── grammar.md          # 文法規則（待建立）
│   │
│   ├── tech-consultant/        # 技術顧問
│   │   ├── persona.md
│   │   ├── design_patterns.md  # 設計模式（待建立）
│   │   └── best_practices.md   # 最佳實踐（待建立）
│   │
│   ├── creative-writer/        # 創意寫作助手
│   │   ├── persona.md
│   │   ├── story_templates.md  # 故事模板（待建立）
│   │   └── character_archetypes.md # 角色原型（待建立）
│   │
│   └── data-analyst/           # 數據分析師
│       ├── persona.md
│       ├── analysis_frameworks.md # 分析框架（待建立）
│       └── visualization_guide.md # 視覺化指南（待建立）
│
└── templates/                   # Agent 模板（快速建立新 Agent）
    ├── basic_persona_template.md
    └── knowledge_template.md
```

---

## 🎯 系統預設 Agent

### 1. **CDO 商務顧問** (`cdo-advisor`)
- **定位**: 專業商務策略顧問，擅長數據驅動決策和組織轉型
- **語言**: 繁體中文、English
- **知識庫**:
  - ✅ Persona 定義
  - ✅ FAQ 問答集
  - ✅ KPI 字典
  - ✅ 決策日誌
  - ✅ 會議摘要
  - ✅ POV 文章

### 2. **語言學習老師** (`language-tutor`)
- **定位**: 耐心專業的語言教師，提供個人化學習指導
- **語言**: 繁體中文、English、日本語
- **知識庫**:
  - ✅ Persona 定義
  - ⏳ 詞彙庫（待建立）
  - ⏳ 文法規則（待建立）

### 3. **技術顧問** (`tech-consultant`)
- **定位**: 經驗豐富的軟體工程師，提供架構設計和程式碼審查
- **語言**: 繁體中文、English
- **知識庫**:
  - ✅ Persona 定義
  - ⏳ 設計模式（待建立）
  - ⏳ 最佳實踐（待建立）

### 4. **創意寫作助手** (`creative-writer`)
- **定位**: 富有想像力的故事創作者，協助構思和撰寫各種故事
- **語言**: 繁體中文、English
- **知識庫**:
  - ✅ Persona 定義
  - ⏳ 故事模板（待建立）
  - ⏳ 角色原型（待建立）

### 5. **數據分析師** (`data-analyst`)
- **定位**: 專業數據分析顧問，提供商業洞見和視覺化建議
- **語言**: 繁體中文、English
- **知識庫**:
  - ✅ Persona 定義
  - ⏳ 分析框架（待建立）
  - ⏳ 視覺化指南（待建立）

---

## 🔧 知識庫管理

### 新增知識文件

1. **確定 Agent 類型**: 決定知識屬於哪個 Agent
2. **選擇知識類型**: FAQ、文件、指南等
3. **建立 Markdown 檔案**: 放置於對應 Agent 目錄
4. **更新資料庫**: 透過種子腳本或管理介面匯入

### 共用知識庫

放置於 `shared/` 目錄的知識可被所有 Agent 使用，適合：
- 公司基本資訊
- 通用政策
- 共同術語表

### Agent 專屬知識庫

放置於 `agents/<agent-name>/` 目錄，僅供該 Agent 使用，確保：
- **知識隔離**: 技術 Agent 不會回答商務問題
- **專業深度**: 每個 Agent 專注於自己的領域
- **維護簡單**: 知識庫結構清晰易管理

---

## 📋 檔案命名規範

### Persona 檔案
- **檔名**: `persona.md`
- **位置**: `agents/<agent-name>/persona.md`
- **必須包含**: 角色定位、核心能力、互動風格、限制邊界

### 知識文件
- **命名格式**: `<類型>_<主題>.md`
- **範例**:
  - `faq_onboarding.md` (FAQ類型 - 新人入職)
  - `decision_log_project_alpha.md` (決策日誌 - Alpha專案)
  - `meeting_summary_2025-10-20_quarterly_review.md` (會議摘要)

### 分類目錄
- `decisions/` - 決策日誌
- `meetings/` - 會議摘要
- `pov/` - POV 文章（Point of View）
- `guides/` - 操作指南
- `references/` - 參考資料

---

## 🚀 快速開始

### 為現有 Agent 新增知識

```bash
# 1. 進入 Agent 目錄
cd docs/agent-brain/agents/cdo-advisor

# 2. 建立新知識文件
echo "# 新知識標題" > new_knowledge.md

# 3. 編輯內容
# 使用您喜歡的編輯器編輯 new_knowledge.md

# 4. 透過種子腳本匯入資料庫（或使用管理介面）
npm run seed:knowledge
```

### 建立新 Agent

```bash
# 1. 建立 Agent 目錄
mkdir -p docs/agent-brain/agents/new-agent

# 2. 複製 Persona 模板
cp docs/agent-brain/templates/basic_persona_template.md \
   docs/agent-brain/agents/new-agent/persona.md

# 3. 編輯 Persona
# 根據您的需求自定義 persona.md

# 4. 建立知識文件
# 在 agents/new-agent/ 下建立所需的知識文件

# 5. 透過種子腳本建立 Agent
npm run seed:agents
```

---

## 📊 知識庫統計

| Agent | Persona | 知識文件數 | 最後更新 |
|-------|---------|-----------|----------|
| CDO 商務顧問 | ✅ | 6 | 2025-10-22 |
| 語言學習老師 | ✅ | 1 | 2025-10-22 |
| 技術顧問 | ✅ | 1 | 2025-10-22 |
| 創意寫作助手 | ✅ | 1 | 2025-10-22 |
| 數據分析師 | ✅ | 1 | 2025-10-22 |
| **總計** | **5** | **10** | - |

---

## 🔄 版本歷史

### v2.0.0 (2025-10-22)
- 🎯 重組為多 Agent 架構
- ✅ 建立 5 個系統預設 Agent
- ✅ 實作 Agent 專屬知識庫隔離
- ✅ 新增共用知識庫機制

### v1.0.0 (2025-10-17)
- ✅ 初始知識庫系統
- ✅ 單一 CDO Persona
- ✅ 基礎知識文件結構

---

## 📝 貢獻指南

### 新增知識文件
1. 遵循 Markdown 格式
2. 使用清晰的標題結構
3. 包含實際範例
4. 標註更新日期

### 更新 Persona
1. 保持角色一致性
2. 明確定義能力邊界
3. 提供實際對話範例
4. 測試回應品質

### 品質檢查
- ✅ Markdown 語法正確
- ✅ 內容準確無誤
- ✅ 範例清晰易懂
- ✅ 語言風格一致

---

**維護者**: Development Team
**聯絡方式**: 透過知識庫管理介面提交更新請求
**文件協議**: 內部使用，保密資訊
