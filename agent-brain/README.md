# Agent Brain - AI CDO 知識庫

> 🧠 虛擬 CDO (Chief Data Officer) 的大腦 - 知識庫驅動的 AI Agent 訓練系統

## 🚀 快速開始

### 1. 檢查知識庫是否已載入

訪問：`http://localhost:3001/api/knowledge/status`

預期回應：
```json
{
  "success": true,
  "stats": {
    "isInitialized": true,
    "personaCached": true,
    "filesIndexed": 6,
    "files": [
      "cdo_faq.md",
      "kpi_dictionary.md",
      "decision_log_project_phoenix.md",
      ...
    ]
  }
}
```

### 2. 測試對話

打開 `http://localhost:3001`，嘗試以下問題：

- ❓ "MAU 怎麼計算？" → 應引用 `cdo_faq.md`
- ❓ "為什麼選擇 Snowflake？" → 應引用 `decision_log_project_phoenix.md`
- ❓ "你對生成式 AI 的看法？" → 應引用 `pov_briefing_generative_ai_strategy.md`

---

## 📂 知識庫結構

```
agent-brain/
├── README.md                     ⬅️ 本文件
├── KNOWLEDGE_BASE_GUIDE.md       📖 知識庫結構說明
├── TECHNICAL_FLOW.md             🔧 技術流程詳解
├── MAINTENANCE_GUIDE.md          🛠️ 日常維護指南
│
├── persona.md                    🔴 核心：CDO 人格定義
├── cdo_faq.md                    🟡 常見問題集
├── kpi_dictionary.md             🟡 KPI 定義字典
├── decision_log_*.md             🟢 決策歷史記錄
├── pov_briefing_*.md             🟢 戰略觀點簡報
└── meeting_summary_*.md          🔵 會議摘要
```

---

## 📝 如何訓練你的 AI

### 最重要：編輯 `persona.md`

```markdown
# Persona 定義檔：[老闆姓名] - 虛擬數據長

## 核心身份
你是 [老闆姓名]，[公司名稱] 的數據長...

## 溝通風格
- **語氣**: 直接、精確、具分析性
- **詞彙**: 專業（ROI, KPI, YoY Growth）
- **句式**: 簡潔有力

## 口頭禪
- "數據是怎麼說的？"
- "這個決策的商業價值是什麼？"
```

### 新增 FAQ

編輯 `cdo_faq.md`：

```markdown
### Q1: [常見問題]
**A**: [標準答案]
- 詳細說明
- 具體流程
- 參考文件連結
```

### 記錄決策

建立新檔案 `decision_log_[專案名].md`：

```markdown
# Decision Log: [專案名稱]

**日期**: YYYY-MM-DD
**決策者**: CDO + 相關人員

## 背景
[為什麼需要做這個決策？]

## 考量過的選項
- 選項 A: [優缺點]
- 選項 B: [優缺點]

## 最終決策
**選擇**: 選項 X
**理由**: [數據驅動的決策邏輯]
```

---

## 🔄 維護工作流程

### 日常更新（會議後、決策後）

```bash
# 1. 編輯對應的 .md 檔案
vim agent-brain/meeting_summary_2025-10-21_產品策略.md

# 2. Git 提交
git add agent-brain/
git commit -m "docs: add product strategy meeting summary"
git push origin main

# 3. 重啟應用（知識庫更新生效）
# 開發環境：Next.js 自動熱重載
# 生產環境：觸發 CI/CD 重新部署
```

### 定期清理（每季度）

```bash
# 歸檔 3 個月前的會議摘要
mkdir -p agent-brain/archive/2025-Q3
mv agent-brain/meeting_summary_2025-07-*.md agent-brain/archive/2025-Q3/
```

---

## 🧪 測試與驗證

### 檢查 AI 回答品質

✅ **好的回答**：
- 引用具體的知識庫內容
- 語氣符合 persona 定義（直接、數據驅動）
- 簡潔、有重點
- 主動標註資料來源

❌ **不良回答**：
- 語氣不像 CDO（太學術或太客套）
- 沒有引用知識庫（憑空編造）
- 冗長且缺乏重點
- 模糊或情緒化的語言

### 如何改進

1. **語氣問題** → 編輯 `persona.md`，新增更多對話範例
2. **知識缺失** → 補充對應的 FAQ 或決策日誌
3. **搜尋失效** → 檢查關鍵字是否在文件中出現

---

## 📚 更多文件

- **完整使用指南**: `../docs/AI_AGENT_TRAINING_GUIDE.md`
- **技術實作細節**: `TECHNICAL_FLOW.md`
- **維護最佳實踐**: `MAINTENANCE_GUIDE.md`

---

**版本**: 1.0.0
**最後更新**: 2025-10-21
**維護團隊**: AI Development Team
