# 公司核心指標詞典 (KPI Dictionary)

---

## MAU (Monthly Active User)
- **業務定義**: 在一個自然月內，至少登入過一次 App 或網站的獨立使用者數量。
- **技術定義**:
  - `SELECT COUNT(DISTINCT user_id)`
  - `FROM login_events`
  - `WHERE event_date BETWEEN [月初] AND [月底]`
- **數據來源**: [資料庫/表格名稱]
- **負責團隊**: [數據分析團隊]
- **更新頻率**: 每日

---

## Customer Churn Rate (客戶流失率)
- **業務定義**: 在特定時間段內，停止使用公司產品或服務的客戶佔總客戶數的百分比。
- **技術定義**: `(期初客戶數 - 期末客戶數) / 期初客戶數 * 100%`
- **數據來源**: [CRM 系統 API]
- **負責團隊**: [客戶關係團隊]
- **更新頻率**: 每月

---