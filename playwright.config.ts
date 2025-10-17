import { defineConfig, devices } from '@playwright/test'

/**
 * Playwright E2E Test Configuration
 *
 * 跨瀏覽器測試配置：
 * - Chrome (Chromium)
 * - Firefox
 * - Safari (WebKit)
 * - Edge (Chromium-based)
 *
 * 跨裝置測試配置：
 * - Desktop (1920x1080, 1280x720)
 * - Tablet (iPad, iPad Pro)
 * - Mobile (iPhone, Samsung Galaxy)
 */
export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ['html'],
    ['json', { outputFile: 'test-results/results.json' }],
    ['junit', { outputFile: 'test-results/junit.xml' }],
  ],
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },

  /**
   * 跨瀏覽器測試專案配置
   *
   * 所有主流瀏覽器：Chrome, Firefox, Safari, Edge
   * 所有主流裝置尺寸：Desktop, Tablet, Mobile
   */
  projects: [
    // ====================
    // Desktop 瀏覽器測試
    // ====================
    {
      name: 'Desktop Chrome',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'Desktop Firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'Desktop Safari',
      use: { ...devices['Desktop Safari'] },
    },
    {
      name: 'Desktop Edge',
      use: {
        ...devices['Desktop Edge'],
        channel: 'msedge',
      },
    },

    // ====================
    // Tablet 裝置測試
    // ====================
    {
      name: 'iPad (gen 7)',
      use: { ...devices['iPad (gen 7)'] },
    },
    {
      name: 'iPad Pro',
      use: { ...devices['iPad Pro'] },
    },

    // ====================
    // Mobile 裝置測試
    // ====================
    {
      name: 'iPhone 12',
      use: { ...devices['iPhone 12'] },
    },
    {
      name: 'iPhone 13 Pro',
      use: { ...devices['iPhone 13 Pro'] },
    },
    {
      name: 'Pixel 5',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'Galaxy S21',
      use: { ...devices['Galaxy S9+'] }, // 使用 Galaxy S9+ 作為 S21 的替代
    },

    // ====================
    // 特定解析度測試
    // ====================
    {
      name: 'Desktop HD (1280x720)',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1280, height: 720 },
      },
    },
    {
      name: 'Desktop Full HD (1920x1080)',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1920, height: 1080 },
      },
    },
  ],

  // Run local dev server before starting tests
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },
})
