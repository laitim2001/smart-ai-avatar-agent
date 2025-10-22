# 跨瀏覽器測試指南 (Cross-Browser Testing Guide)

本文件說明如何在 Smart AI Avatar Agent 專案中執行跨瀏覽器、跨裝置的 E2E 測試。

## 目錄

- [測試環境設定](#測試環境設定)
- [瀏覽器覆蓋範圍](#瀏覽器覆蓋範圍)
- [裝置覆蓋範圍](#裝置覆蓋範圍)
- [執行測試](#執行測試)
- [測試報告](#測試報告)
- [CI/CD 整合](#cicd-整合)
- [疑難排解](#疑難排解)

---

## 測試環境設定

### 安裝 Playwright 瀏覽器

首次執行測試前，需要安裝 Playwright 瀏覽器驅動：

```bash
# 安裝所有瀏覽器 (Chromium, Firefox, WebKit)
npx playwright install

# 僅安裝特定瀏覽器
npx playwright install chromium
npx playwright install firefox
npx playwright install webkit

# 安裝瀏覽器依賴 (Linux)
npx playwright install-deps
```

### Windows 環境 - Edge 瀏覽器

如需測試 Edge 瀏覽器，需要系統已安裝 Microsoft Edge：

- **Windows 10/11**: 預設已安裝 Edge
- **下載連結**: https://www.microsoft.com/edge

### macOS 環境 - Safari 測試

在 macOS 上測試 Safari（WebKit）需要額外設定：

```bash
# 啟用 Safari 自動化功能
sudo safaridriver --enable
```

---

## 瀏覽器覆蓋範圍

本專案測試以下瀏覽器：

### Desktop 瀏覽器

| 瀏覽器 | 引擎 | 專案名稱 | 市場佔有率 |
|--------|------|----------|-----------|
| Google Chrome | Chromium | `Desktop Chrome` | ~65% |
| Mozilla Firefox | Gecko | `Desktop Firefox` | ~3% |
| Safari | WebKit | `Desktop Safari` | ~20% |
| Microsoft Edge | Chromium | `Desktop Edge` | ~5% |

**總覆蓋率**: ~93% 的全球瀏覽器市場

### 為什麼要測試這些瀏覽器？

1. **Chrome (Chromium)**: 全球最多人使用的瀏覽器
2. **Firefox**: 唯一獨立引擎的主流瀏覽器（Gecko），重要的標準驗證
3. **Safari (WebKit)**: macOS/iOS 主流瀏覽器，與 Chromium 差異最大
4. **Edge**: Windows 預設瀏覽器，企業用戶常用

---

## 裝置覆蓋範圍

本專案測試以下裝置尺寸：

### Desktop 解析度

| 解析度 | 專案名稱 | 市場佔有率 |
|--------|----------|-----------|
| 1920x1080 (Full HD) | `Desktop Full HD (1920x1080)` | ~30% |
| 1280x720 (HD) | `Desktop HD (1280x720)` | ~15% |

### Tablet 裝置

| 裝置 | 解析度 | 專案名稱 |
|------|--------|----------|
| iPad (gen 7) | 810x1080 | `iPad (gen 7)` |
| iPad Pro | 1024x1366 | `iPad Pro` |

### Mobile 裝置

| 裝置 | 解析度 | 專案名稱 | 作業系統 |
|------|--------|----------|----------|
| iPhone 12 | 390x844 | `iPhone 12` | iOS |
| iPhone 13 Pro | 390x844 | `iPhone 13 Pro` | iOS |
| Pixel 5 | 393x851 | `Pixel 5` | Android |
| Galaxy S21 (模擬) | 360x740 | `Galaxy S21` | Android |

**總裝置覆蓋**:
- ✅ iOS (iPhone)
- ✅ Android (Pixel, Galaxy)
- ✅ Tablet (iPad)
- ✅ Desktop (多種解析度)

---

## 執行測試

### 執行所有瀏覽器測試

```bash
# 在所有瀏覽器和裝置上執行測試
npm run test:e2e

# 等同於
npx playwright test
```

### 執行特定瀏覽器測試

```bash
# 僅 Chrome
npx playwright test --project="Desktop Chrome"

# 僅 Firefox
npx playwright test --project="Desktop Firefox"

# 僅 Safari
npx playwright test --project="Desktop Safari"

# 僅 Edge
npx playwright test --project="Desktop Edge"
```

### 執行特定裝置測試

```bash
# iPad Pro
npx playwright test --project="iPad Pro"

# iPhone 12
npx playwright test --project="iPhone 12"

# Pixel 5
npx playwright test --project="Pixel 5"
```

### 執行特定測試檔案

```bash
# 在所有瀏覽器上執行特定測試
npx playwright test tests/e2e/auth-flow.spec.ts

# 在特定瀏覽器上執行特定測試
npx playwright test tests/e2e/auth-flow.spec.ts --project="Desktop Chrome"
```

### 平行執行與序列執行

```bash
# 平行執行（預設，速度快）
npx playwright test --workers=4

# 序列執行（避免資源競爭）
npx playwright test --workers=1

# CI 環境建議配置（節省資源）
npx playwright test --workers=2 --retries=2
```

### UI 模式（互動式除錯）

```bash
# 啟動 Playwright UI 模式
npm run test:e2e:ui

# 等同於
npx playwright test --ui
```

在 UI 模式中，你可以：
- 選擇特定瀏覽器和裝置
- 逐步執行測試
- 查看即時執行畫面
- 檢視 DOM 和網路請求
- 時間旅行除錯（Time Travel Debugging）

---

## 測試報告

### HTML 測試報告

測試執行後，Playwright 會自動生成 HTML 報告：

```bash
# 執行測試後自動開啟報告
npx playwright test --reporter=html

# 手動開啟報告
npx playwright show-report
```

報告位置：`playwright-report/index.html`

### JSON 測試報告

適合程式化分析和 CI/CD 整合：

```bash
# JSON 報告位置
test-results/results.json
```

### JUnit XML 報告

適合 CI/CD 系統整合（Jenkins, GitLab CI 等）：

```bash
# JUnit XML 報告位置
test-results/junit.xml
```

### 失敗案例截圖與影片

Playwright 會自動捕捉失敗案例的截圖和影片：

```
test-results/
├── auth-flow-should-login-successfully-Desktop-Chrome/
│   ├── test-failed-1.png
│   └── video.webm
└── responsive-design-mobile-iPhone-12/
    ├── test-failed-1.png
    └── video.webm
```

---

## CI/CD 整合

### GitHub Actions 範例

```yaml
name: E2E Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        browser: [chromium, firefox, webkit]

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Install dependencies
        run: npm ci

      - name: Install Playwright browsers
        run: npx playwright install --with-deps ${{ matrix.browser }}

      - name: Run E2E tests
        run: npx playwright test --project="Desktop Chrome" --project="Desktop Firefox" --project="Desktop Safari"
        env:
          CI: true

      - name: Upload test results
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: playwright-report-${{ matrix.browser }}
          path: playwright-report/
          retention-days: 30

      - name: Upload test videos
        if: failure()
        uses: actions/upload-artifact@v3
        with:
          name: test-videos-${{ matrix.browser }}
          path: test-results/
          retention-days: 7
```

### Azure DevOps 範例

```yaml
trigger:
  - main
  - develop

pool:
  vmImage: 'ubuntu-latest'

steps:
  - task: NodeTool@0
    inputs:
      versionSpec: '18.x'
    displayName: 'Install Node.js'

  - script: npm ci
    displayName: 'Install dependencies'

  - script: npx playwright install --with-deps
    displayName: 'Install Playwright browsers'

  - script: npx playwright test --reporter=junit
    displayName: 'Run E2E tests'
    env:
      CI: true

  - task: PublishTestResults@2
    condition: always()
    inputs:
      testResultsFormat: 'JUnit'
      testResultsFiles: 'test-results/junit.xml'
      failTaskOnFailedTests: true
    displayName: 'Publish test results'

  - task: PublishPipelineArtifact@1
    condition: always()
    inputs:
      targetPath: 'playwright-report'
      artifact: 'playwright-report'
    displayName: 'Publish HTML report'
```

---

## 疑難排解

### 問題 1: Edge 瀏覽器無法執行

**錯誤訊息**:
```
browserType.launch: Executable doesn't exist at ...msedge.exe
```

**解決方法**:
```bash
# Windows: 確認 Edge 已安裝
# 路徑應為 C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe

# 或使用 Chromium 替代
npx playwright test --project="Desktop Chrome"
```

### 問題 2: Safari (WebKit) 測試失敗

**錯誤訊息**:
```
browserType.launch: Browser closed.
```

**解決方法**:
```bash
# macOS: 啟用 Safari 自動化
sudo safaridriver --enable

# 或跳過 Safari 測試
npx playwright test --project="Desktop Chrome" --project="Desktop Firefox"
```

### 問題 3: 測試超時 (Timeout)

**錯誤訊息**:
```
Test timeout of 30000ms exceeded.
```

**解決方法**:
```typescript
// 在測試中增加 timeout
test('should login', async ({ page }) => {
  test.setTimeout(60000) // 60 秒
  // 測試邏輯
})

// 或在 playwright.config.ts 全域設定
export default defineConfig({
  timeout: 60000, // 60 秒
})
```

### 問題 4: 平行測試衝突

**錯誤訊息**:
```
Address already in use: http://localhost:3000
```

**解決方法**:
```bash
# 序列執行測試
npx playwright test --workers=1

# 或使用不同的 port
# playwright.config.ts
webServer: {
  command: 'PORT=3001 npm run dev',
  url: 'http://localhost:3001',
}
```

### 問題 5: 裝置模擬不準確

**問題**: Mobile 裝置測試結果與實機不符

**解決方法**:
```bash
# 使用 BrowserStack 或 Sauce Labs 進行真實裝置測試
# 或使用 Chrome DevTools 的 Remote Debugging
```

---

## 最佳實踐

### 1. 選擇性執行測試

不是每次都需要執行所有瀏覽器測試。建議：

- **開發階段**: 僅執行 Chrome 測試（速度快）
- **PR Review**: 執行 Chrome + Firefox 測試（覆蓋主要引擎）
- **Release**: 執行所有瀏覽器和裝置測試（完整覆蓋）

### 2. 測試優先順序

按瀏覽器市場佔有率排序測試：

1. Chrome (65%)
2. Safari (20%)
3. Edge (5%)
4. Firefox (3%)

若資源有限，優先測試 Chrome 和 Safari。

### 3. 平行化策略

```bash
# 本機開發：高平行度（速度優先）
npx playwright test --workers=4

# CI 環境：低平行度（穩定優先）
npx playwright test --workers=1 --retries=2
```

### 4. 測試分層

```
├── Smoke Tests (關鍵流程，所有瀏覽器)
│   └── 登入、註冊、基本對話
├── Regression Tests (完整功能，Chrome + Safari)
│   └── 所有功能測試
└── Visual Tests (視覺回歸，特定裝置)
    └── 響應式設計、佈局驗證
```

---

## 參考資源

- [Playwright 官方文件](https://playwright.dev/)
- [Browser Market Share](https://gs.statcounter.com/)
- [Can I Use](https://caniuse.com/) - 瀏覽器功能支援查詢
- [MDN Web Docs](https://developer.mozilla.org/) - Web 標準文件

---

## 支援

若有任何測試相關問題，請：

1. 檢查 [疑難排解](#疑難排解) 章節
2. 查看 [Playwright Issues](https://github.com/microsoft/playwright/issues)
3. 聯絡專案維護者

---

**Last Updated**: 2025-10-17
**Document Version**: 1.0.0
