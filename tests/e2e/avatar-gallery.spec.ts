/**
 * Avatar Gallery E2E Tests
 * Sprint 5 Phase 4: 測試 Avatar 篩選、收藏、360° 預覽流程
 */

import { test, expect } from '@playwright/test'

test.describe('Avatar Gallery - Sprint 5 功能測試', () => {
  test.beforeEach(async ({ page }) => {
    // 前往 Avatar Gallery 頁面
    await page.goto('/dashboard')

    // 等待 Avatar Gallery 載入
    await page.waitForSelector('[data-testid="avatar-gallery"]', { timeout: 10000 })
  })

  test.describe('Phase 2.1: 分類篩選與搜尋', () => {
    test('應該顯示所有 Avatar', async ({ page }) => {
      // 檢查是否有 Avatar 卡片
      const avatarCards = page.locator('.grid .cursor-pointer')
      const count = await avatarCards.count()

      expect(count).toBeGreaterThan(0)
    })

    test('應該能使用搜尋功能', async ({ page }) => {
      // 輸入搜尋關鍵字
      await page.fill('input[placeholder*="搜尋"]', 'Alex')

      // 等待篩選結果更新
      await page.waitForTimeout(500)

      // 檢查結果
      const results = page.locator('.grid .cursor-pointer')
      const count = await results.count()

      expect(count).toBeGreaterThan(0)

      // 驗證搜尋結果包含 Alex
      const firstCard = results.first()
      await expect(firstCard).toContainText('Alex')
    })

    test('應該能開啟篩選面板', async ({ page }) => {
      // 點擊篩選按鈕
      await page.click('button:has-text("篩選")')

      // 驗證篩選面板出現
      await expect(page.locator('text=分類篩選')).toBeVisible()
      await expect(page.locator('text=標籤篩選')).toBeVisible()
    })

    test('應該能使用分類篩選', async ({ page }) => {
      // 開啟篩選面板
      await page.click('button:has-text("篩選")')

      // 點擊女性分類
      await page.click('button[value="female"]')

      // 等待篩選結果更新
      await page.waitForTimeout(500)

      // 檢查結果統計
      const resultText = await page.locator('text=/顯示.*個 Avatar/').textContent()
      expect(resultText).toContain('(已篩選)')
    })

    test('應該能使用標籤篩選', async ({ page }) => {
      // 開啟篩選面板
      await page.click('button:has-text("篩選")')

      // 選擇標籤 (假設有 "專業" 標籤)
      const professionalCheckbox = page.locator('label:has-text("專業")')
      if (await professionalCheckbox.isVisible()) {
        await professionalCheckbox.click()

        // 等待篩選結果更新
        await page.waitForTimeout(500)

        // 檢查篩選已套用
        const resultText = await page.locator('text=/顯示.*個 Avatar/').textContent()
        expect(resultText).toContain('(已篩選)')
      }
    })

    test('應該能使用排序功能', async ({ page }) => {
      // 點擊排序選擇器
      await page.click('[role="combobox"]:has-text("排序方式")')

      // 選擇名稱排序
      await page.click('[role="option"]:has-text("名稱排序")')

      // 等待排序更新
      await page.waitForTimeout(500)

      // 驗證排序已套用
      const firstCard = page.locator('.grid .cursor-pointer').first()
      await expect(firstCard).toBeVisible()
    })

    test('應該能清除所有篩選', async ({ page }) => {
      // 開啟篩選面板並套用篩選
      await page.click('button:has-text("篩選")')
      await page.click('button[value="male"]')

      // 等待篩選套用
      await page.waitForTimeout(500)

      // 點擊清除按鈕
      await page.click('button:has-text("清除所有篩選")')

      // 驗證篩選已清除
      await page.waitForTimeout(500)
      const resultText = await page.locator('text=/顯示.*個 Avatar/').textContent()
      expect(resultText).not.toContain('(已篩選)')
    })
  })

  test.describe('Phase 2.2: 收藏功能 (需要登入)', () => {
    test.skip('未登入時收藏按鈕應該可見但功能受限', async ({ page }) => {
      // 懸停在 Avatar 卡片上
      const firstCard = page.locator('.grid .cursor-pointer').first()
      await firstCard.hover()

      // 檢查收藏按鈕
      const favoriteButton = firstCard.locator('button[title*="收藏"]')
      await expect(favoriteButton).toBeVisible()
    })

    test.skip('已登入時應該能新增收藏', async ({ page }) => {
      // 此測試需要完整的登入流程
      // 實際實作時需要先登入

      // Mock: 假設已登入
      // await login(page, 'test@example.com', 'password')

      // 點擊收藏按鈕
      const firstCard = page.locator('.grid .cursor-pointer').first()
      const favoriteButton = firstCard.locator('button[title*="加入收藏"]')
      await favoriteButton.click()

      // 驗證收藏成功
      await expect(favoriteButton).toHaveAttribute('title', /取消收藏/)

      // 檢查收藏圖示變為實心
      const heartIcon = favoriteButton.locator('svg')
      await expect(heartIcon).toHaveClass(/fill-red-500/)
    })

    test.skip('應該能篩選顯示收藏的 Avatar', async ({ page }) => {
      // 開啟篩選面板
      await page.click('button:has-text("篩選")')

      // 勾選只顯示收藏
      await page.click('label:has-text("只顯示我的收藏")')

      // 等待篩選結果更新
      await page.waitForTimeout(500)

      // 驗證只顯示收藏的 Avatar
      const resultText = await page.locator('text=/顯示.*個 Avatar/').textContent()
      expect(resultText).toContain('(已篩選)')
    })
  })

  test.describe('Phase 3: 360° 預覽功能', () => {
    test('應該能開啟 360° 預覽模式', async ({ page }) => {
      // 點擊第一個 Avatar 的預覽按鈕
      const firstCard = page.locator('.grid .cursor-pointer').first()
      const previewButton = firstCard.locator('button:has-text("360° 預覽")')
      await previewButton.click()

      // 驗證預覽模式開啟
      await expect(page.locator('[data-testid="preview-modal"]')).toBeVisible({ timeout: 3000 })

      // 或者檢查固定元素 (關閉按鈕、控制工具列等)
      await expect(page.locator('button[title*="關閉"]')).toBeVisible()
    })

    test('預覽模式應該顯示 Avatar 資訊', async ({ page }) => {
      // 開啟預覽模式
      const firstCard = page.locator('.grid .cursor-pointer').first()

      // 取得 Avatar 名稱
      const avatarName = await firstCard.locator('h3').textContent()

      // 點擊預覽按鈕
      await firstCard.locator('button:has-text("360° 預覽")').click()

      // 等待預覽模式開啟
      await page.waitForTimeout(1000)

      // 驗證 Avatar 名稱顯示
      await expect(page.locator(`text=${avatarName}`)).toBeVisible()
    })

    test('預覽模式應該有控制按鈕', async ({ page }) => {
      // 開啟預覽模式
      await page.locator('.grid .cursor-pointer').first()
        .locator('button:has-text("360° 預覽")').click()

      // 等待預覽模式開啟
      await page.waitForTimeout(1000)

      // 驗證控制按鈕存在
      await expect(page.locator('button[title*="重置"]')).toBeVisible()
      await expect(page.locator('button[title*="放大"]')).toBeVisible()
      await expect(page.locator('button[title*="縮小"]')).toBeVisible()
    })

    test('預覽模式應該有動畫控制', async ({ page }) => {
      // 開啟預覽模式
      await page.locator('.grid .cursor-pointer').first()
        .locator('button:has-text("360° 預覽")').click()

      // 等待預覽模式開啟
      await page.waitForTimeout(1000)

      // 驗證動畫按鈕存在
      await expect(page.locator('button:has-text("微笑")')).toBeVisible()
      await expect(page.locator('button:has-text("點頭")')).toBeVisible()
    })

    test('應該能使用 ESC 鍵關閉預覽模式', async ({ page }) => {
      // 開啟預覽模式
      await page.locator('.grid .cursor-pointer').first()
        .locator('button:has-text("360° 預覽")').click()

      // 等待預覽模式開啟
      await page.waitForTimeout(1000)

      // 按下 ESC 鍵
      await page.keyboard.press('Escape')

      // 驗證預覽模式關閉
      await page.waitForTimeout(500)
      await expect(page.locator('button[title*="關閉"]')).not.toBeVisible()
    })

    test('應該能點擊關閉按鈕關閉預覽模式', async ({ page }) => {
      // 開啟預覽模式
      await page.locator('.grid .cursor-pointer').first()
        .locator('button:has-text("360° 預覽")').click()

      // 等待預覽模式開啟
      await page.waitForTimeout(1000)

      // 點擊關閉按鈕
      await page.locator('button[title*="關閉"]').click()

      // 驗證預覽模式關閉
      await page.waitForTimeout(500)
      await expect(page.locator('button[title*="關閉"]')).not.toBeVisible()
    })

    test('預覽模式應該顯示快捷鍵說明', async ({ page }) => {
      // 開啟預覽模式
      await page.locator('.grid .cursor-pointer').first()
        .locator('button:has-text("360° 預覽")').click()

      // 等待預覽模式開啟
      await page.waitForTimeout(1000)

      // 驗證快捷鍵說明存在
      await expect(page.locator('text=快捷鍵')).toBeVisible()
      await expect(page.locator('text=← → ↑ ↓: 旋轉')).toBeVisible()
      await expect(page.locator('text=ESC: 關閉')).toBeVisible()
    })
  })

  test.describe('整合流程測試', () => {
    test('完整流程：搜尋 → 篩選 → 預覽', async ({ page }) => {
      // 1. 搜尋 Avatar
      await page.fill('input[placeholder*="搜尋"]', 'Alex')
      await page.waitForTimeout(500)

      // 2. 開啟篩選
      await page.click('button:has-text("篩選")')
      await page.click('button[value="male"]')
      await page.waitForTimeout(500)

      // 3. 驗證結果
      const results = page.locator('.grid .cursor-pointer')
      const count = await results.count()
      expect(count).toBeGreaterThan(0)

      // 4. 開啟預覽
      await results.first().locator('button:has-text("360° 預覽")').click()
      await page.waitForTimeout(1000)

      // 5. 驗證預覽模式開啟
      await expect(page.locator('button[title*="關閉"]')).toBeVisible()

      // 6. 關閉預覽
      await page.keyboard.press('Escape')
      await page.waitForTimeout(500)

      // 7. 驗證返回 Gallery
      await expect(page.locator('button:has-text("篩選")')).toBeVisible()
    })
  })

  test.describe('無障礙測試', () => {
    test('搜尋框應該有適當的 placeholder', async ({ page }) => {
      const searchInput = page.locator('input[placeholder*="搜尋"]')
      await expect(searchInput).toBeVisible()

      const placeholder = await searchInput.getAttribute('placeholder')
      expect(placeholder).toContain('搜尋')
    })

    test('收藏按鈕應該有適當的 title', async ({ page }) => {
      const firstCard = page.locator('.grid .cursor-pointer').first()
      const favoriteButton = firstCard.locator('button[title*="收藏"]')

      await expect(favoriteButton).toBeVisible()

      const title = await favoriteButton.getAttribute('title')
      expect(title).toBeTruthy()
    })

    test('控制按鈕應該有適當的 aria-label 或 title', async ({ page }) => {
      // 開啟預覽模式
      await page.locator('.grid .cursor-pointer').first()
        .locator('button:has-text("360° 預覽")').click()

      await page.waitForTimeout(1000)

      // 檢查控制按鈕的 title
      const resetButton = page.locator('button[title*="重置"]')
      await expect(resetButton).toBeVisible()

      const title = await resetButton.getAttribute('title')
      expect(title).toContain('重置')
    })
  })
})
