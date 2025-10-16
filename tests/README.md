# Testing Guide

這個專案包含完整的測試套件，涵蓋單元測試和端對端測試。

## 測試架構

### 單元測試 (Vitest)

單元測試使用 Vitest + Testing Library，測試範圍包括：

- **lib/auth/password.ts**: 密碼強度驗證、雜湊與驗證
- **lib/auth/tokens.ts**: Email 驗證 token 產生
- **lib/redis/rate-limit.ts**: Rate limiting 配置與 IP 提取
- **lib/activity/logger.ts**: 活動記錄工具函數與便捷函數
- **lib/utils/api-response.ts**: 統一 API 回應格式工具

#### 執行單元測試

```bash
# 執行所有單元測試
npm test

# Watch 模式（開發時使用）
npm run test:watch

# 產生覆蓋率報告
npm run test:coverage
```

### E2E 測試 (Playwright)

端對端測試使用 Playwright，測試範圍包括：

- **認證流程** (auth-flow.spec.ts): 註冊、登入、密碼重置
- **路由保護** (auth-flow.spec.ts): Middleware 重導向行為
- **UI/UX** (auth-flow.spec.ts): 響應式設計、載入狀態
- **個人資料管理** (profile-flow.spec.ts): 個人資料編輯、密碼變更、表單驗證
- **Avatar 選擇** (avatar-flow.spec.ts): Avatar 圖庫、3D 預覽、偏好儲存
- **活動追蹤** (activity-tracking.spec.ts): 活動記錄、API 端點、安全性驗證

#### 執行 E2E 測試

**先決條件**:
1. 資料庫運行中 (PostgreSQL on port 5435)
2. Redis 運行中 (Upstash 或本地 on port 6380)
3. 環境變數設定完成 (.env.local)

```bash
# 執行 E2E 測試（會自動啟動 dev server）
npm run test:e2e

# UI 模式（視覺化除錯）
npm run test:e2e:ui
```

## 測試覆蓋率

### 當前覆蓋狀況

**單元測試**:
- ✅ Password utilities (100%)
- ✅ Token generation (100%)
- ✅ Rate limit configuration (100%)
- ✅ Activity logger utilities (100%)
- ✅ API response utilities (100%)
- ⚠️ Database operations (需要 integration test)

**E2E 測試**:
- ✅ 認證頁面 UI 元素
- ✅ 表單驗證行為
- ✅ 路由保護與重導向
- ✅ 響應式設計
- ✅ 個人資料編輯流程
- ✅ Avatar 選擇與預覽
- ✅ 活動記錄 API 端點
- ⚠️ 完整認證流程（需要測試資料庫）
- ⚠️ 實際資料儲存驗證（需要測試資料庫）

### 未來改進

1. **Integration Tests**:
   - API route 完整測試（包含資料庫操作）
   - NextAuth.js 認證流程測試
   - Upstash Redis rate limiting 測試

2. **Component Tests**:
   - React 元件單元測試
   - Form submission behavior
   - State management (Zustand stores)

3. **Visual Regression Tests**:
   - Playwright 截圖比對
   - 跨瀏覽器 UI 一致性

## 測試策略

### 單元測試優先

針對純函數和業務邏輯進行單元測試：
- 密碼驗證邏輯
- Token 生成邏輯
- Rate limit 配置
- Utility functions

### E2E 測試覆蓋關鍵流程

針對使用者關鍵旅程進行 E2E 測試：
- 新使用者註冊流程
- 登入與登出流程
- Dashboard 訪問控制
- 密碼重置流程

### 整合測試補充

針對需要外部依賴的功能：
- Database operations (Prisma)
- Redis operations (Upstash)
- API route handlers
- NextAuth.js callbacks

## CI/CD 整合

測試會在 GitHub Actions 中自動執行：

```yaml
# .github/workflows/test.yml
- name: Run Unit Tests
  run: npm test

- name: Run E2E Tests
  run: npm run test:e2e
  env:
    DATABASE_URL: ${{ secrets.DATABASE_URL }}
    UPSTASH_REDIS_REST_URL: ${{ secrets.UPSTASH_REDIS_REST_URL }}
```

## 故障排除

### 單元測試失敗

1. 檢查 Node.js 版本 (建議 18+)
2. 清除 node_modules 重新安裝
3. 檢查 `tests/setup.ts` 環境變數

### E2E 測試失敗

1. 確保 dev server 正常運行
2. 檢查資料庫連接
3. 清除瀏覽器快取和 cookies
4. 查看 Playwright trace: `npx playwright show-trace trace.zip`

### 效能問題

1. 單元測試應該 < 5 秒完成
2. E2E 測試單一 spec < 30 秒
3. 使用 `--workers=1` 避免並行問題
