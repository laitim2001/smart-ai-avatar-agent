# KPI 定義字典 (KPI Dictionary)

## 用戶參與度指標

### MAU (Monthly Active Users)
- **定義**: 每月活躍用戶數，指在一個自然月內至少進行一次對話的獨立用戶數量
- **計算**: SELECT COUNT(DISTINCT user_id) FROM conversations WHERE created_at >= DATE_TRUNC('month', CURRENT_DATE) AND created_at < DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '1 month'
- **數據來源**: conversations 資料表
- **負責團隊**: 產品團隊

### DAU (Daily Active Users)
- **定義**: 每日活躍用戶數，指在一個自然日內至少進行一次對話的獨立用戶數量
- **計算**: SELECT COUNT(DISTINCT user_id) FROM conversations WHERE DATE(created_at) = CURRENT_DATE
- **數據來源**: conversations 資料表
- **負責團隊**: 產品團隊

### 對話完成率 (Conversation Completion Rate)
- **定義**: 使用者開啟對話並至少有一輪完整互動（用戶提問且 AI 回答）的比例
- **計算**: SELECT (COUNT(DISTINCT conversation_id WHERE message_count >= 2) / COUNT(DISTINCT conversation_id)) * 100 FROM conversations
- **數據來源**: conversations 資料表
- **負責團隊**: 產品團隊

## 對話品質指標

### 平均對話時長 (Average Conversation Duration)
- **定義**: 從對話開始到結束的平均時間長度，單位為分鐘
- **計算**: SELECT AVG(EXTRACT(EPOCH FROM (ended_at - started_at)) / 60) FROM conversations WHERE ended_at IS NOT NULL
- **數據來源**: conversations 資料表
- **負責團隊**: 產品團隊

### 平均回應時間 (Average Response Time)
- **定義**: AI Avatar 從接收用戶訊息到生成第一個回應字元的平均時間，單位為毫秒
- **計算**: SELECT AVG(response_time_ms) FROM messages WHERE role = 'avatar' AND response_time_ms IS NOT NULL
- **數據來源**: messages 資料表，透過效能監控日誌計算
- **負責團隊**: 技術團隊

### 用戶滿意度 (User Satisfaction Score)
- **定義**: 用戶對對話體驗的平均評分，1-5 分制
- **計算**: SELECT AVG(rating) FROM conversation_ratings WHERE rating IS NOT NULL
- **數據來源**: conversation_ratings 資料表
- **負責團隊**: 客服團隊

## 系統效能指標

### 系統可用率 (System Uptime)
- **定義**: 系統在統計期間內可正常訪問的時間百分比
- **計算**: SELECT (SUM(uptime_minutes) / SUM(total_minutes)) * 100 FROM system_health_logs WHERE log_date >= CURRENT_DATE - INTERVAL '30 days'
- **數據來源**: system_health_logs 資料表
- **負責團隊**: 技術團隊

### API 錯誤率 (API Error Rate)
- **定義**: API 請求返回錯誤狀態碼（4xx, 5xx）的比例
- **計算**: SELECT (COUNT(*) FILTER (WHERE status_code >= 400) / COUNT(*)) * 100 FROM api_logs WHERE timestamp >= NOW() - INTERVAL '1 hour'
- **數據來源**: api_logs 資料表
- **負責團隊**: 技術團隊

### 平均頁面載入時間 (Average Page Load Time)
- **定義**: 用戶訪問頁面到完全可互動的平均時間，單位為秒
- **計算**: SELECT AVG(page_load_time_ms) / 1000 FROM performance_metrics WHERE metric_name = 'time_to_interactive' AND timestamp >= NOW() - INTERVAL '24 hours'
- **數據來源**: performance_metrics 資料表
- **負責團隊**: 技術團隊

## 內容使用指標

### FAQ 使用率 (FAQ Utilization Rate)
- **定義**: AI 回答中引用 FAQ 知識庫內容的對話比例
- **計算**: SELECT (COUNT(DISTINCT conversation_id WHERE faq_used = true) / COUNT(DISTINCT conversation_id)) * 100 FROM conversations
- **數據來源**: conversations 資料表，knowledge_usage_logs 資料表
- **負責團隊**: 內容團隊

### 知識庫覆蓋率 (Knowledge Base Coverage)
- **定義**: 能夠透過知識庫直接回答的問題比例
- **計算**: SELECT (COUNT(*) FILTER (WHERE knowledge_source IS NOT NULL) / COUNT(*)) * 100 FROM messages WHERE role = 'avatar'
- **數據來源**: messages 資料表，knowledge_usage_logs 資料表
- **負責團隊**: 內容團隊

### 平均知識檔案更新頻率 (Knowledge File Update Frequency)
- **定義**: 知識庫檔案平均每月更新次數
- **計算**: SELECT COUNT(*) / COUNT(DISTINCT filename) FROM knowledge_file_versions WHERE updated_at >= NOW() - INTERVAL '30 days'
- **數據來源**: knowledge_file_versions 資料表
- **負責團隊**: 內容團隊

## 業務成長指標

### 用戶留存率 (User Retention Rate)
- **定義**: 在首次使用後 N 天仍繼續使用系統的用戶比例（通常計算 7 天、30 天留存）
- **計算**: SELECT (COUNT(DISTINCT u.user_id) / total_new_users) * 100 FROM users u JOIN conversations c ON u.user_id = c.user_id WHERE u.created_at >= CURRENT_DATE - INTERVAL '30 days' AND c.created_at >= u.created_at + INTERVAL '7 days'
- **數據來源**: users 資料表，conversations 資料表
- **負責團隊**: 產品團隊

### 新用戶增長率 (New User Growth Rate)
- **定義**: 本月新註冊用戶數相對於上月的增長百分比
- **計算**: SELECT ((this_month_users - last_month_users) / last_month_users) * 100 FROM (SELECT COUNT(*) as this_month_users FROM users WHERE created_at >= DATE_TRUNC('month', CURRENT_DATE)) t1, (SELECT COUNT(*) as last_month_users FROM users WHERE created_at >= DATE_TRUNC('month', CURRENT_DATE - INTERVAL '1 month') AND created_at < DATE_TRUNC('month', CURRENT_DATE)) t2
- **數據來源**: users 資料表
- **負責團隊**: 產品團隊

### 用戶流失率 (User Churn Rate)
- **定義**: 在統計期間內停止使用系統的用戶比例（通常定義為 30 天內無任何活動）
- **計算**: SELECT (COUNT(DISTINCT user_id) / total_active_users) * 100 FROM users WHERE user_id NOT IN (SELECT DISTINCT user_id FROM conversations WHERE created_at >= CURRENT_DATE - INTERVAL '30 days')
- **數據來源**: users 資料表，conversations 資料表
- **負責團隊**: 產品團隊
