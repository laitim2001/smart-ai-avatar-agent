# API 文件

本目錄集中存放所有 API 相關文件。

## 文件清單

- **API_AVATAR_FAVORITE.md**：Avatar 收藏 API 設計
- **API_CONVERSATIONS.md**：對話管理 API 設計
- **API_REFERENCE_SPRINT2.md**：Sprint 2 API 參考文件
- **API_REFERENCE_SPRINT3.md**：Sprint 3 API 參考文件

## API 架構

本項目使用 **Edge Runtime** 實現所有 API：

- **POST /api/chat**：LLM 對話（SSE 串流）
- **POST /api/tts**：文字轉語音（Azure Speech）
- **GET /api/health**：健康檢查

## 開發指南

### 新增 API 端點

1. 創建 `app/api/[route]/route.ts`
2. 設定 `export const runtime = 'edge'`
3. 實作 POST/GET handler
4. 更新本目錄的 API 文件

### API 文件模板

```markdown
# [API Name] API

## 端點
- **Method**: POST/GET
- **Path**: /api/[route]
- **Runtime**: Edge

## 請求格式
\`\`\`json
{ ... }
\`\`\`

## 回應格式
\`\`\`json
{ ... }
\`\`\`

## 錯誤處理
...

## 測試範例
\`\`\`bash
curl -X POST http://localhost:3000/api/[route] \\
  -H "Content-Type: application/json" \\
  -d '{ ... }'
\`\`\`
```

## 相關資源

- 實作程式碼：`app/api/`
- 測試指南：`docs/testing/`
- 部署配置：`docs/deployment/`
