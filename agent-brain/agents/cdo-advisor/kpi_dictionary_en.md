# Company Core Metrics Dictionary (KPI Dictionary)

---

## MAU (Monthly Active User)
- **Business Definition**: The number of unique users who logged into the App or website at least once within a calendar month.
- **Technical Definition**:
  - `SELECT COUNT(DISTINCT user_id)`
  - `FROM login_events`
  - `WHERE event_date BETWEEN [month_start] AND [month_end]`
- **Data Source**: [Database/Table Name]
- **Responsible Team**: [Data Analytics Team]
- **Update Frequency**: Daily

---

## Customer Churn Rate
- **Business Definition**: The percentage of customers who stopped using the company's products or services during a specific time period, relative to the total customer base.
- **Technical Definition**: `(Initial Customers - Final Customers) / Initial Customers * 100%`
- **Data Source**: [CRM System API]
- **Responsible Team**: [Customer Relations Team]
- **Update Frequency**: Monthly

---
