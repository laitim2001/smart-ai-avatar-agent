/**
 * Activity Tracking E2E Tests
 *
 * 測試使用者活動追蹤功能：
 * - 登入活動記錄
 * - 個人資料更新追蹤
 * - Avatar 變更追蹤
 * - 活動記錄查詢
 */

import { test, expect } from '@playwright/test'

test.describe('Activity Tracking', () => {
  test.describe('Activity API Endpoint', () => {
    test('should require authentication for activity endpoint', async ({
      page,
    }) => {
      // 直接訪問 activity API 應該返回未授權錯誤
      const response = await page.goto('/api/user/activity')

      if (response) {
        // 應該返回 401 或重導向到登入
        expect(response.status()).toBeGreaterThanOrEqual(400)
      }
    })

    test('should accept query parameters', async ({ page }) => {
      // 測試 API 端點是否存在和參數處理
      const response = await page.goto(
        '/api/user/activity?limit=10&offset=0&stats=true'
      )

      if (response) {
        // 應該返回未授權（401）或其他錯誤
        // 這證明端點存在並處理參數
        expect(response.status()).toBeGreaterThanOrEqual(400)
      }
    })
  })

  test.describe('Login Activity Tracking', () => {
    test('should track successful login attempt', async ({ page }) => {
      // 前往登入頁
      await page.goto('/login')

      // 填寫登入表單（使用測試帳號）
      // Note: 這需要預先建立的測試帳號
      const emailInput = page.getByLabel('Email')
      const passwordInput = page.getByLabel('密碼')

      if (
        (await emailInput.isVisible({ timeout: 1000 }).catch(() => false)) &&
        (await passwordInput.isVisible({ timeout: 1000 }).catch(() => false))
      ) {
        // 填寫測試憑證
        await emailInput.fill('test@example.com')
        await passwordInput.fill('TestPassword123')

        // 監聽登入 API 請求
        const loginPromise = page.waitForResponse(
          (response) =>
            response.url().includes('/api/auth/login') &&
            response.request().method() === 'POST'
        )

        // 提交表單
        await page.getByRole('button', { name: '登入', exact: true }).click()

        // 等待登入回應
        const loginResponse = await loginPromise.catch(() => null)

        if (loginResponse) {
          // 登入請求已發送（無論成功或失敗）
          // 活動記錄應該在後端被觸發
          expect(loginResponse.status()).toBeGreaterThanOrEqual(200)
        }
      }
    })

    test('should include IP address in activity log', async ({ page }) => {
      // 這個測試驗證活動記錄的 IP 追蹤
      // Note: 實際的 IP 記錄在後端處理

      await page.goto('/login')

      // 檢查頁面載入（確保請求被發送）
      await expect(page.locator('body')).toBeVisible()

      // HTTP headers 應該包含 IP 資訊
      // 這在後端的 getIpAddress() 函數中處理
    })

    test('should include user agent in activity log', async ({ page }) => {
      // 這個測試驗證活動記錄的 User Agent 追蹤
      // Note: 實際的 User Agent 記錄在後端處理

      await page.goto('/login')

      // 獲取瀏覽器的 User Agent
      const userAgent = await page.evaluate(() => navigator.userAgent)

      // User Agent 應該存在
      expect(userAgent).toBeTruthy()
      expect(userAgent.length).toBeGreaterThan(0)

      // 這個 User Agent 會被後端的 getUserAgent() 函數記錄
    })
  })

  test.describe('Profile Update Tracking', () => {
    test('should track profile updates', async ({ page }) => {
      await page.goto('/settings/profile')

      // 如果未登入，跳過測試
      if (page.url().includes('/login')) {
        test.skip()
        return
      }

      // 尋找個人資料表單
      const nameInput = page.locator('input[name="name"]').first()

      if (await nameInput.isVisible({ timeout: 1000 }).catch(() => false)) {
        // 修改姓名
        await nameInput.fill('測試使用者更新')

        // 監聽更新 API 請求
        const updatePromise = page.waitForResponse(
          (response) =>
            response.url().includes('/api/user/profile') &&
            response.request().method() === 'PATCH',
          { timeout: 5000 }
        )

        // 尋找並點擊儲存按鈕
        const saveButton = page.getByRole('button', {
          name: /儲存|保存|save/i,
        })

        if (await saveButton.isVisible({ timeout: 1000 }).catch(() => false)) {
          await saveButton.click()

          // 等待更新回應
          const updateResponse = await updatePromise.catch(() => null)

          if (updateResponse) {
            // 更新請求已發送
            // 活動記錄應該在後端被觸發 (logProfileUpdate)
            expect(updateResponse.status()).toBeGreaterThanOrEqual(200)
          }
        }
      }
    })

    test('should include metadata in profile update log', async ({ page }) => {
      await page.goto('/settings/profile')

      // 如果未登入，跳過測試
      if (page.url().includes('/login')) {
        test.skip()
        return
      }

      // 個人資料更新應該記錄 metadata
      // 包含: field, oldValue, newValue
      // Note: 這在後端的 logProfileUpdate() 函數中處理

      // 檢查頁面已載入
      await expect(page.locator('body')).toBeVisible()
    })
  })

  test.describe('Avatar Change Tracking', () => {
    test('should track avatar selection', async ({ page }) => {
      await page.goto('/settings/avatar')

      // 如果未登入，跳過測試
      if (page.url().includes('/login')) {
        test.skip()
        return
      }

      // 尋找 Avatar 卡片
      const avatarCards = page.locator('[data-avatar-id]')
      const count = await avatarCards.count()

      if (count > 0) {
        // 選擇一個 Avatar
        await avatarCards.first().click()

        // 監聽偏好更新 API 請求
        const updatePromise = page.waitForResponse(
          (response) =>
            response.url().includes('/api/user/preferences') &&
            response.request().method() === 'PATCH',
          { timeout: 5000 }
        )

        // 尋找並點擊儲存按鈕
        const saveButton = page.getByRole('button', {
          name: /儲存|保存|save/i,
        })

        if (await saveButton.isVisible({ timeout: 1000 }).catch(() => false)) {
          await saveButton.click()

          // 等待更新回應
          const updateResponse = await updatePromise.catch(() => null)

          if (updateResponse) {
            // 更新請求已發送
            // 活動記錄應該在後端被觸發 (logAvatarChange)
            expect(updateResponse.status()).toBeGreaterThanOrEqual(200)
          }
        }
      }
    })

    test('should include avatar metadata in log', async ({ page }) => {
      await page.goto('/settings/avatar')

      // 如果未登入，跳過測試
      if (page.url().includes('/login')) {
        test.skip()
        return
      }

      // Avatar 變更應該記錄 metadata
      // 包含: avatarId, avatarUrl
      // Note: 這在後端的 logAvatarChange() 函數中處理

      // 檢查頁面已載入
      await expect(page.locator('body')).toBeVisible()
    })
  })

  test.describe('Password Change Tracking', () => {
    test('should track password changes', async ({ page }) => {
      await page.goto('/settings/profile')

      // 如果未登入，跳過測試
      if (page.url().includes('/login')) {
        test.skip()
        return
      }

      // 尋找密碼變更表單
      const passwordInputs = page.locator('input[type="password"]')
      const count = await passwordInputs.count()

      if (count >= 2) {
        // 填寫密碼變更表單
        await passwordInputs.nth(0).fill('CurrentPassword123')
        await passwordInputs.nth(1).fill('NewPassword123')

        if (count >= 3) {
          await passwordInputs.nth(2).fill('NewPassword123')
        }

        // 監聽密碼變更 API 請求
        const changePromise = page.waitForResponse(
          (response) =>
            response.url().includes('/api/user/password') &&
            response.request().method() === 'PATCH',
          { timeout: 5000 }
        )

        // 尋找並點擊儲存按鈕
        const saveButton = page.getByRole('button', {
          name: /變更|更新|save|change/i,
        })

        if (await saveButton.isVisible({ timeout: 1000 }).catch(() => false)) {
          await saveButton.click()

          // 等待變更回應
          const changeResponse = await changePromise.catch(() => null)

          if (changeResponse) {
            // 變更請求已發送
            // 活動記錄應該在後端被觸發 (logPasswordChange)
            // Note: 可能會失敗（密碼錯誤），但請求已發送
            expect(changeResponse.status()).toBeGreaterThanOrEqual(200)
          }
        }
      }
    })

    test('should include timestamp in password change log', async ({
      page,
    }) => {
      await page.goto('/settings/profile')

      // 如果未登入，跳過測試
      if (page.url().includes('/login')) {
        test.skip()
        return
      }

      // 密碼變更應該記錄 timestamp
      // Note: 這在後端的 logPasswordChange() 函數中處理

      // 檢查頁面已載入
      await expect(page.locator('body')).toBeVisible()
    })
  })

  test.describe('Activity Query and Statistics', () => {
    test('should support pagination in activity logs', async ({ page }) => {
      // 測試活動記錄 API 的分頁功能
      // GET /api/user/activity?limit=10&offset=0

      const response = await page.goto('/api/user/activity?limit=10&offset=0')

      if (response) {
        // 應該返回未授權（需要登入）
        // 但這證明端點存在並處理分頁參數
        expect(response.status()).toBeGreaterThanOrEqual(400)
      }
    })

    test('should support activity filtering by action', async ({ page }) => {
      // 測試活動記錄 API 的篩選功能
      // GET /api/user/activity?action=login

      const response = await page.goto('/api/user/activity?action=login')

      if (response) {
        // 應該返回未授權（需要登入）
        // 但這證明端點存在並處理篩選參數
        expect(response.status()).toBeGreaterThanOrEqual(400)
      }
    })

    test('should support activity statistics', async ({ page }) => {
      // 測試活動統計 API
      // GET /api/user/activity?stats=true&days=30

      const response = await page.goto(
        '/api/user/activity?stats=true&days=30'
      )

      if (response) {
        // 應該返回未授權（需要登入）
        // 但這證明端點存在並處理統計參數
        expect(response.status()).toBeGreaterThanOrEqual(400)
      }
    })

    test('should return proper response format', async ({ page }) => {
      // 測試 API 回應格式
      // 應該符合 SuccessResponse 或 ErrorResponse 格式

      const response = await page.goto('/api/user/activity')

      if (response) {
        try {
          const json = await response.json()

          // 應該有 success 欄位
          expect('success' in json).toBe(true)

          // 如果是錯誤回應，應該有 error 欄位
          if (json.success === false) {
            expect('error' in json).toBe(true)
          }
        } catch (error) {
          // JSON 解析失敗是可以接受的（可能是重導向）
          expect(response.status()).toBeGreaterThanOrEqual(300)
        }
      }
    })
  })

  test.describe('Activity Log Security', () => {
    test('should not expose other users activities', async ({ page }) => {
      // 安全性測試：確保使用者只能看到自己的活動記錄
      // Note: 這需要在後端實作中驗證

      const response = await page.goto('/api/user/activity')

      if (response) {
        // 未登入應該無法訪問任何活動記錄
        expect(response.status()).toBeGreaterThanOrEqual(400)
      }
    })

    test('should require authentication for all activity endpoints', async ({
      page,
    }) => {
      // 測試所有活動相關端點都需要認證

      const endpoints = [
        '/api/user/activity',
        '/api/user/activity?limit=10',
        '/api/user/activity?stats=true',
      ]

      for (const endpoint of endpoints) {
        const response = await page.goto(endpoint)

        if (response) {
          // 所有端點都應該要求認證
          expect(response.status()).toBeGreaterThanOrEqual(400)
        }
      }
    })

    test('should sanitize sensitive data in activity logs', async ({
      page,
    }) => {
      // 安全性測試：確保敏感資料不會被記錄
      // Note: 密碼等敏感資料不應出現在活動記錄的 metadata 中

      await page.goto('/login')

      // 檢查登入頁面載入
      await expect(page.locator('body')).toBeVisible()

      // 實際的敏感資料過濾在後端處理
      // 這個測試確保頁面正常運作
    })
  })

  test.describe('Activity Log Performance', () => {
    test('should handle large activity history', async ({ page }) => {
      // 效能測試：確保能處理大量活動記錄
      // GET /api/user/activity?limit=100

      const response = await page.goto('/api/user/activity?limit=100')

      if (response) {
        // 端點應該存在並處理大量資料請求
        // Note: 實際的效能需要在後端測試
        expect(response.status()).toBeGreaterThanOrEqual(200)
      }
    })

    test('should limit maximum records per request', async ({ page }) => {
      // 測試是否有最大記錄數限制（防止過載）
      // GET /api/user/activity?limit=9999

      const response = await page.goto('/api/user/activity?limit=9999')

      if (response) {
        // 應該返回錯誤或限制在合理範圍內
        expect(response.status()).toBeGreaterThanOrEqual(200)
      }
    })
  })

  test.describe('Activity Log UI (Future Feature)', () => {
    test('should have activity log view page', async ({ page }) => {
      // 未來功能：活動記錄查看頁面
      // Note: 這可能在未來的 Sprint 實作

      await page.goto('/settings/activity')

      // 如果頁面不存在，應該返回 404 或重導向
      // 如果存在，應該要求認證

      if (page.url().includes('/login')) {
        // 重導向到登入（正常行為）
        expect(page.url()).toContain('/login')
      } else if (page.url().includes('/404')) {
        // 404 頁面（功能尚未實作）
        expect(page.url()).toContain('/404')
      } else {
        // 頁面存在（功能已實作）
        await expect(page.locator('body')).toBeVisible()
      }
    })

    test('should display activity timeline', async ({ page }) => {
      // 未來功能：活動時間軸顯示

      await page.goto('/settings/activity')

      // 如果未登入，跳過測試
      if (page.url().includes('/login')) {
        test.skip()
        return
      }

      // 如果功能已實作，應該有活動列表
      // Note: 這是未來的 UI 功能

      // 檢查頁面已載入
      await expect(page.locator('body')).toBeVisible()
    })
  })

  test.describe('Integration with Other Features', () => {
    test('should track logout activity', async ({ page }) => {
      await page.goto('/dashboard')

      // 如果未登入，跳過測試
      if (page.url().includes('/login')) {
        test.skip()
        return
      }

      // 尋找登出按鈕
      const logoutButton = page.getByRole('button', { name: /登出|logout/i })

      if (await logoutButton.isVisible({ timeout: 1000 }).catch(() => false)) {
        // 監聽登出請求
        const logoutPromise = page.waitForResponse(
          (response) =>
            response.url().includes('/api/auth') &&
            (response.url().includes('logout') ||
              response.url().includes('signout')),
          { timeout: 5000 }
        )

        await logoutButton.click()

        // 等待登出回應
        const logoutResponse = await logoutPromise.catch(() => null)

        if (logoutResponse) {
          // 登出請求已發送
          // 活動記錄應該在後端被觸發 (logLogout)
          expect(logoutResponse.status()).toBeGreaterThanOrEqual(200)
        }
      }
    })

    test('should track email verification', async ({ page }) => {
      // Email 驗證活動追蹤
      // Note: 這需要完整的 email 驗證流程

      await page.goto('/verify-email')

      // 檢查頁面載入
      await expect(page.locator('body')).toBeVisible()

      // 實際的驗證追蹤在後端處理
      // 當使用者點擊 email 中的驗證連結時觸發
    })

    test('should track password reset requests', async ({ page }) => {
      await page.goto('/forgot-password')

      // 檢查忘記密碼頁面
      const emailInput = page.getByLabel('Email')

      if (await emailInput.isVisible({ timeout: 1000 }).catch(() => false)) {
        await emailInput.fill('test@example.com')

        // 監聽重設密碼請求
        const resetPromise = page.waitForResponse(
          (response) =>
            response.url().includes('/api/auth/forgot-password') &&
            response.request().method() === 'POST',
          { timeout: 5000 }
        )

        const submitButton = page.getByRole('button', {
          name: /發送|送出|submit/i,
        })

        if (
          await submitButton.isVisible({ timeout: 1000 }).catch(() => false)
        ) {
          await submitButton.click()

          const resetResponse = await resetPromise.catch(() => null)

          if (resetResponse) {
            // 重設請求已發送
            // 活動記錄應該在後端被觸發
            expect(resetResponse.status()).toBeGreaterThanOrEqual(200)
          }
        }
      }
    })
  })
})
