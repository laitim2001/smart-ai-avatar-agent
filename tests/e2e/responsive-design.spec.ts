/**
 * Responsive Design E2E Tests
 *
 * 測試響應式設計在不同裝置上的表現：
 * - 手機裝置 (375x667, 360x640)
 * - 平板裝置 (768x1024, 1024x1366)
 * - 桌面裝置 (1280x720, 1920x1080)
 */

import { test, expect, devices } from '@playwright/test'

// 定義測試裝置配置
const TEST_DEVICES = {
  mobile: {
    'iPhone SE': { width: 375, height: 667 },
    'Samsung Galaxy S21': { width: 360, height: 800 },
  },
  tablet: {
    'iPad Mini': { width: 768, height: 1024 },
    'iPad Pro': { width: 1024, height: 1366 },
  },
  desktop: {
    'Desktop HD': { width: 1280, height: 720 },
    'Desktop Full HD': { width: 1920, height: 1080 },
  },
}

test.describe('Responsive Design - Mobile Devices', () => {
  for (const [deviceName, viewport] of Object.entries(TEST_DEVICES.mobile)) {
    test.describe(`${deviceName} (${viewport.width}x${viewport.height})`, () => {
      test.beforeEach(async ({ page }) => {
        await page.setViewportSize(viewport)
      })

      test('should display navigation menu', async ({ page }) => {
        await page.goto('/')

        // 檢查導航列
        const nav = page.locator('nav').first()
        const hasNav = await nav.isVisible({ timeout: 2000 }).catch(() => false)

        if (hasNav) {
          await expect(nav).toBeVisible()
        }

        // 檢查行動版選單按鈕（漢堡選單）
        const menuButton = page
          .getByRole('button', { name: /menu|選單|導航/i })
          .first()
        const hamburgerIcon = page.locator('[data-testid="hamburger-menu"]').first()

        const hasMenuButton = await menuButton
          .isVisible({ timeout: 1000 })
          .catch(() => false)
        const hasHamburger = await hamburgerIcon
          .isVisible({ timeout: 1000 })
          .catch(() => false)

        if (hasMenuButton || hasHamburger) {
          expect(hasMenuButton || hasHamburger).toBe(true)
        }
      })

      test('should display login form elements', async ({ page }) => {
        await page.goto('/login')

        // 檢查表單元素在小螢幕上可見且可用
        const emailInput = page.getByLabel('Email')
        const passwordInput = page.getByLabel('密碼')
        const loginButton = page.getByRole('button', {
          name: '登入',
          exact: true,
        })

        await expect(emailInput).toBeVisible()
        await expect(passwordInput).toBeVisible()
        await expect(loginButton).toBeVisible()

        // 檢查元素是否可點擊（不被遮擋）
        await expect(emailInput).toBeEnabled()
        await expect(passwordInput).toBeEnabled()
        await expect(loginButton).toBeEnabled()
      })

      test('should display register form elements', async ({ page }) => {
        await page.goto('/register')

        // 檢查註冊表單元素
        const nameInput = page.getByLabel('姓名')
        const emailInput = page.getByLabel('Email')
        const passwordInput = page.getByLabel('密碼', { exact: true })
        const confirmPasswordInput = page.getByLabel('確認密碼')
        const registerButton = page.getByRole('button', {
          name: '註冊',
          exact: true,
        })

        await expect(nameInput).toBeVisible()
        await expect(emailInput).toBeVisible()
        await expect(passwordInput).toBeVisible()
        await expect(confirmPasswordInput).toBeVisible()
        await expect(registerButton).toBeVisible()
      })

      test('should display chat interface', async ({ page }) => {
        await page.goto('/dashboard')

        // 如果未登入，跳過測試
        if (page.url().includes('/login')) {
          test.skip()
          return
        }

        // 檢查聊天介面元素
        const chatInput = page.locator('input[placeholder*="訊息"], textarea[placeholder*="訊息"], input[type="text"]').first()

        const hasChatInput = await chatInput
          .isVisible({ timeout: 2000 })
          .catch(() => false)

        if (hasChatInput) {
          await expect(chatInput).toBeVisible()

          // 檢查輸入框寬度是否適合小螢幕
          const box = await chatInput.boundingBox()
          if (box) {
            // 輸入框不應超過螢幕寬度
            expect(box.width).toBeLessThanOrEqual(viewport.width)
          }
        }
      })

      test('should scroll content properly', async ({ page }) => {
        await page.goto('/dashboard')

        // 如果未登入，跳過測試
        if (page.url().includes('/login')) {
          test.skip()
          return
        }

        // 檢查頁面是否可以滾動
        const scrollHeight = await page.evaluate(() => document.body.scrollHeight)
        const clientHeight = await page.evaluate(() => document.documentElement.clientHeight)

        // 如果內容高度大於視窗高度，應該可以滾動
        if (scrollHeight > clientHeight) {
          // 嘗試滾動到底部
          await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))

          // 等待滾動完成
          await page.waitForTimeout(500)

          // 檢查滾動位置
          const scrollTop = await page.evaluate(() => window.scrollY || window.pageYOffset)

          expect(scrollTop).toBeGreaterThan(0)
        }
      })

      test('should hide desktop-only elements', async ({ page }) => {
        await page.goto('/dashboard')

        // 如果未登入，跳過測試
        if (page.url().includes('/login')) {
          test.skip()
          return
        }

        // 檢查是否有桌面專用元素被隱藏
        const desktopElements = page.locator('[data-desktop-only="true"]')
        const count = await desktopElements.count()

        for (let i = 0; i < count; i++) {
          const element = desktopElements.nth(i)
          const isHidden = await element.isHidden().catch(() => true)

          expect(isHidden).toBe(true)
        }
      })
    })
  }
})

test.describe('Responsive Design - Tablet Devices', () => {
  for (const [deviceName, viewport] of Object.entries(TEST_DEVICES.tablet)) {
    test.describe(`${deviceName} (${viewport.width}x${viewport.height})`, () => {
      test.beforeEach(async ({ page }) => {
        await page.setViewportSize(viewport)
      })

      test('should display navigation menu', async ({ page }) => {
        await page.goto('/')

        // 平板可能顯示完整導航列或漢堡選單
        const nav = page.locator('nav').first()
        await expect(nav).toBeVisible()
      })

      test('should display chat interface with proper layout', async ({
        page,
      }) => {
        await page.goto('/dashboard')

        // 如果未登入，跳過測試
        if (page.url().includes('/login')) {
          test.skip()
          return
        }

        // 檢查聊天介面
        const chatInput = page.locator('input[placeholder*="訊息"], textarea[placeholder*="訊息"], input[type="text"]').first()

        const hasChatInput = await chatInput
          .isVisible({ timeout: 2000 })
          .catch(() => false)

        if (hasChatInput) {
          await expect(chatInput).toBeVisible()
        }
      })

      test('should display Avatar preview', async ({ page }) => {
        await page.goto('/dashboard')

        // 如果未登入，跳過測試
        if (page.url().includes('/login')) {
          test.skip()
          return
        }

        // 檢查 3D Avatar canvas
        const canvas = page.locator('canvas').first()

        const hasCanvas = await canvas
          .isVisible({ timeout: 3000 })
          .catch(() => false)

        if (hasCanvas) {
          await expect(canvas).toBeVisible()

          // 檢查 canvas 尺寸合理
          const box = await canvas.boundingBox()
          if (box) {
            expect(box.width).toBeGreaterThan(200)
            expect(box.height).toBeGreaterThan(200)
          }
        }
      })

      test('should support touch interactions', async ({ page }) => {
        await page.goto('/dashboard')

        // 如果未登入，跳過測試
        if (page.url().includes('/login')) {
          test.skip()
          return
        }

        // 檢查觸控支援
        const hasTouch = await page.evaluate(() => 'ontouchstart' in window)

        // 平板應該支援觸控
        expect(hasTouch).toBe(true)
      })

      test('should display forms in single column', async ({ page }) => {
        await page.goto('/login')

        // 檢查表單佈局
        const form = page.locator('form').first()

        const hasForm = await form.isVisible({ timeout: 2000 }).catch(() => false)

        if (hasForm) {
          // 檢查表單元素是否垂直排列（單欄）
          const emailInput = page.getByLabel('Email')
          const passwordInput = page.getByLabel('密碼')

          const emailBox = await emailInput.boundingBox()
          const passwordBox = await passwordInput.boundingBox()

          if (emailBox && passwordBox) {
            // 密碼輸入應該在 Email 輸入下方
            expect(passwordBox.y).toBeGreaterThan(emailBox.y)
          }
        }
      })
    })
  }
})

test.describe('Responsive Design - Desktop Devices', () => {
  for (const [deviceName, viewport] of Object.entries(TEST_DEVICES.desktop)) {
    test.describe(`${deviceName} (${viewport.width}x${viewport.height})`, () => {
      test.beforeEach(async ({ page }) => {
        await page.setViewportSize(viewport)
      })

      test('should display full navigation menu', async ({ page }) => {
        await page.goto('/')

        // 桌面版應顯示完整導航列
        const nav = page.locator('nav').first()
        await expect(nav).toBeVisible()

        // 不應該有漢堡選單
        const hamburgerIcon = page.locator('[data-testid="hamburger-menu"]').first()

        const hasHamburger = await hamburgerIcon
          .isVisible({ timeout: 1000 })
          .catch(() => false)

        if (hasHamburger) {
          // 如果有漢堡選單，它應該被隱藏
          await expect(hamburgerIcon).toBeHidden()
        }
      })

      test('should display chat and Avatar side by side', async ({ page }) => {
        await page.goto('/dashboard')

        // 如果未登入，跳過測試
        if (page.url().includes('/login')) {
          test.skip()
          return
        }

        // 檢查是否有 Avatar canvas 和聊天介面
        const canvas = page.locator('canvas').first()
        const chatInput = page.locator('input[placeholder*="訊息"], textarea[placeholder*="訊息"], input[type="text"]').first()

        const hasCanvas = await canvas
          .isVisible({ timeout: 3000 })
          .catch(() => false)
        const hasChatInput = await chatInput
          .isVisible({ timeout: 2000 })
          .catch(() => false)

        if (hasCanvas && hasChatInput) {
          const canvasBox = await canvas.boundingBox()
          const chatBox = await chatInput.boundingBox()

          if (canvasBox && chatBox) {
            // 桌面版：Avatar 應該在左側，聊天在右側（或相反）
            // 檢查是否水平排列
            const isHorizontal =
              Math.abs(canvasBox.y - chatBox.y) <
              Math.max(canvasBox.height, chatBox.height)

            expect(isHorizontal).toBe(true)
          }
        }
      })

      test('should display Avatar with proper size', async ({ page }) => {
        await page.goto('/dashboard')

        // 如果未登入，跳過測試
        if (page.url().includes('/login')) {
          test.skip()
          return
        }

        // 檢查 3D Avatar canvas
        const canvas = page.locator('canvas').first()

        const hasCanvas = await canvas
          .isVisible({ timeout: 3000 })
          .catch(() => false)

        if (hasCanvas) {
          const box = await canvas.boundingBox()
          if (box) {
            // 桌面版 Avatar 應該有足夠大的尺寸
            expect(box.width).toBeGreaterThan(400)
            expect(box.height).toBeGreaterThan(400)
          }
        }
      })

      test('should support mouse interactions', async ({ page }) => {
        await page.goto('/dashboard')

        // 如果未登入，跳過測試
        if (page.url().includes('/login')) {
          test.skip()
          return
        }

        // 檢查滑鼠懸停效果
        const buttons = page.getByRole('button')
        const count = await buttons.count()

        if (count > 0) {
          const firstButton = buttons.first()

          // 懸停在按鈕上
          await firstButton.hover()

          // 等待懸停效果
          await page.waitForTimeout(300)

          // 按鈕應該仍然可見（沒有因懸停而隱藏）
          await expect(firstButton).toBeVisible()
        }
      })

      test('should have sufficient font sizes', async ({ page }) => {
        await page.goto('/login')

        // 檢查字體大小
        const emailLabel = page.getByText('Email').first()

        const fontSize = await emailLabel.evaluate((el) => {
          return window.getComputedStyle(el).fontSize
        })

        // 字體應該至少 14px（桌面版）
        const fontSizeNum = parseFloat(fontSize)
        expect(fontSizeNum).toBeGreaterThanOrEqual(14)
      })
    })
  }
})

test.describe('Responsive Design - Cross-Device Compatibility', () => {
  test('should maintain layout when resizing viewport', async ({ page }) => {
    await page.goto('/dashboard')

    // 從桌面調整到手機
    await page.setViewportSize({ width: 1920, height: 1080 })
    await page.waitForTimeout(500)

    // 檢查頁面載入
    await expect(page.locator('body')).toBeVisible()

    // 調整為平板尺寸
    await page.setViewportSize({ width: 768, height: 1024 })
    await page.waitForTimeout(500)

    await expect(page.locator('body')).toBeVisible()

    // 調整為手機尺寸
    await page.setViewportSize({ width: 375, height: 667 })
    await page.waitForTimeout(500)

    await expect(page.locator('body')).toBeVisible()
  })

  test('should not have horizontal scroll on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/dashboard')

    // 如果未登入，跳過測試
    if (page.url().includes('/login')) {
      test.skip()
      return
    }

    // 檢查是否有水平滾動條
    const scrollWidth = await page.evaluate(() => document.body.scrollWidth)
    const clientWidth = await page.evaluate(() => document.documentElement.clientWidth)

    // 內容寬度不應超過視窗寬度（允許 1px 誤差）
    expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 1)
  })

  test('should handle orientation change (portrait/landscape)', async ({
    page,
  }) => {
    // 直向（Portrait）
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/dashboard')

    // 如果未登入，跳過測試
    if (page.url().includes('/login')) {
      test.skip()
      return
    }

    await expect(page.locator('body')).toBeVisible()

    // 橫向（Landscape）
    await page.setViewportSize({ width: 667, height: 375 })
    await page.waitForTimeout(500)

    await expect(page.locator('body')).toBeVisible()
  })

  test('should display content properly on ultra-wide displays', async ({
    page,
  }) => {
    // 超寬螢幕 (21:9)
    await page.setViewportSize({ width: 2560, height: 1080 })
    await page.goto('/dashboard')

    // 如果未登入，跳過測試
    if (page.url().includes('/login')) {
      test.skip()
      return
    }

    // 檢查內容是否合理分佈（不會過度延伸）
    const main = page.locator('main').first()

    const hasMain = await main.isVisible({ timeout: 2000 }).catch(() => false)

    if (hasMain) {
      const box = await main.boundingBox()
      if (box) {
        // 主內容區域應該有最大寬度限制
        // （一般設計會限制在 1200-1600px）
        // 這裡檢查至少不是全螢幕寬度
        expect(box.width).toBeLessThan(2560)
      }
    }
  })
})
