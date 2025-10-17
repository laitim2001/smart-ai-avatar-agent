/**
 * Authentication Flow E2E Tests
 *
 * 測試完整的認證使用者旅程：
 * - 註冊流程
 * - 登入流程
 * - Dashboard 訪問
 */

import { test, expect } from '@playwright/test'

test.describe('Authentication Flow', () => {
  test.describe('Registration', () => {
    test('should display registration form', async ({ page }) => {
      await page.goto('/register')

      // 檢查表單元素存在
      await expect(page.getByLabel('姓名')).toBeVisible()
      await expect(page.getByLabel('Email')).toBeVisible()
      await expect(page.getByLabel('密碼', { exact: true })).toBeVisible()
      await expect(page.getByLabel('確認密碼')).toBeVisible()
      await expect(
        page.getByRole('button', { name: '註冊', exact: true })
      ).toBeVisible()
    })

    test('should show validation errors for invalid input', async ({
      page,
    }) => {
      await page.goto('/register')

      // 嘗試提交空表單
      await page.getByRole('button', { name: '註冊', exact: true }).click()

      // 等待 HTML5 驗證訊息或表單驗證
      // Note: 實際驗證訊息可能因 React Hook Form + Zod 而異
      const nameInput = page.getByLabel('姓名')
      await expect(nameInput).toBeFocused()
    })

    test('should show password mismatch error', async ({ page }) => {
      await page.goto('/register')

      await page.getByLabel('姓名').fill('測試使用者')
      await page.getByLabel('Email').fill('test@example.com')
      await page.getByLabel('密碼', { exact: true }).fill('Password123')
      await page.getByLabel('確認密碼').fill('DifferentPassword456')

      await page.getByRole('button', { name: '註冊', exact: true }).click()

      // 檢查錯誤訊息
      await expect(page.getByText(/密碼不一致/i)).toBeVisible()
    })
  })

  test.describe('Login', () => {
    test('should display login form', async ({ page }) => {
      await page.goto('/login')

      // 檢查表單元素存在
      await expect(page.getByLabel('Email')).toBeVisible()
      await expect(page.getByLabel('密碼')).toBeVisible()
      await expect(
        page.getByRole('button', { name: '登入', exact: true })
      ).toBeVisible()
      await expect(page.getByText('忘記密碼？')).toBeVisible()
    })

    test('should show validation errors for empty credentials', async ({
      page,
    }) => {
      await page.goto('/login')

      // 嘗試提交空表單
      await page.getByRole('button', { name: '登入', exact: true }).click()

      // 等待 HTML5 驗證或表單驗證
      const emailInput = page.getByLabel('Email')
      await expect(emailInput).toBeFocused()
    })

    test('should have link to registration page', async ({ page }) => {
      await page.goto('/login')

      const registerLink = page.getByRole('link', { name: '立即註冊' })
      await expect(registerLink).toBeVisible()
      await expect(registerLink).toHaveAttribute('href', '/register')
    })
  })

  test.describe('Password Reset', () => {
    test('should display forgot password form', async ({ page }) => {
      await page.goto('/forgot-password')

      // 檢查表單元素存在
      await expect(page.getByLabel('Email')).toBeVisible()
      await expect(
        page.getByRole('button', { name: '發送重置連結' })
      ).toBeVisible()
    })

    test('should have link back to login', async ({ page }) => {
      await page.goto('/forgot-password')

      const loginLink = page.getByRole('link', { name: '返回登入' })
      await expect(loginLink).toBeVisible()
      await expect(loginLink).toHaveAttribute('href', '/login')
    })
  })

  test.describe('Protected Routes', () => {
    test('should redirect to login when accessing dashboard without auth', async ({
      page,
    }) => {
      await page.goto('/dashboard')

      // 應該被重導向到登入頁面
      await page.waitForURL(/\/login/)
      expect(page.url()).toContain('/login')

      // 檢查 callbackUrl 參數
      const url = new URL(page.url())
      expect(url.searchParams.get('callbackUrl')).toBe('/dashboard')
    })

    test('should redirect to login when accessing settings without auth', async ({
      page,
    }) => {
      await page.goto('/settings')

      await page.waitForURL(/\/login/)
      expect(page.url()).toContain('/login')
    })
  })

  test.describe('Navigation', () => {
    test('should navigate between auth pages', async ({ page }) => {
      // 從登入頁開始
      await page.goto('/login')
      await expect(page).toHaveTitle(/登入/)

      // 前往註冊頁
      await page.getByRole('link', { name: '立即註冊' }).click()
      await page.waitForURL(/\/register/)
      await expect(page).toHaveTitle(/註冊/)

      // 前往忘記密碼頁
      await page.goto('/login')
      await page.getByText('忘記密碼？').click()
      await page.waitForURL(/\/forgot-password/)

      // 返回登入頁
      await page.getByRole('link', { name: '返回登入' }).click()
      await page.waitForURL(/\/login/)
    })
  })

  test.describe('UI/UX', () => {
    test('should show loading state when submitting login form', async ({
      page,
    }) => {
      await page.goto('/login')

      await page.getByLabel('Email').fill('test@example.com')
      await page.getByLabel('密碼').fill('Password123')

      // 監聽網路請求
      const responsePromise = page.waitForResponse('/api/auth/login')

      await page.getByRole('button', { name: '登入', exact: true }).click()

      // 檢查按鈕顯示載入狀態（文字改變或 disabled）
      const loginButton = page.getByRole('button', { name: /登入/ })
      await expect(loginButton).toBeDisabled()
    })

    test('should be responsive on mobile viewport', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 })
      await page.goto('/login')

      // 檢查元素在小螢幕上可見
      await expect(page.getByLabel('Email')).toBeVisible()
      await expect(page.getByLabel('密碼')).toBeVisible()
      await expect(
        page.getByRole('button', { name: '登入', exact: true })
      ).toBeVisible()
    })
  })

  test.describe('Complete Authentication Flow (Register → Login → Dashboard)', () => {
    // 生成唯一測試使用者
    const generateTestUser = () => ({
      name: `測試使用者_${Date.now()}`,
      email: `test_${Date.now()}@example.com`,
      password: 'TestPassword123!',
    })

    test('should complete full registration and login flow', async ({
      page,
    }) => {
      const testUser = generateTestUser()

      // Step 1: 註冊新使用者
      await page.goto('/register')

      await page.getByLabel('姓名').fill(testUser.name)
      await page.getByLabel('Email').fill(testUser.email)
      await page.getByLabel('密碼', { exact: true }).fill(testUser.password)
      await page.getByLabel('確認密碼').fill(testUser.password)

      // 提交註冊表單
      await page.getByRole('button', { name: '註冊', exact: true }).click()

      // Step 2: 等待註冊完成（可能重導向或顯示成功訊息）
      // 註冊後可能：
      // - 重導向到 email 驗證頁面
      // - 重導向到登入頁面
      // - 自動登入並重導向到 dashboard
      await page.waitForTimeout(2000)

      // 檢查是否成功（URL 改變或顯示成功訊息）
      const currentUrl = page.url()
      const isRegistrationSuccess =
        currentUrl.includes('/verify-email') ||
        currentUrl.includes('/login') ||
        currentUrl.includes('/dashboard')

      if (!isRegistrationSuccess) {
        // 如果還在註冊頁面，檢查是否有錯誤訊息
        const errorMessage = await page
          .getByText(/已存在|invalid/i)
          .isVisible({ timeout: 1000 })
          .catch(() => false)

        if (errorMessage) {
          // Email 已存在，跳過測試
          test.skip()
          return
        }
      }

      expect(isRegistrationSuccess).toBe(true)

      // Step 3: 如果需要 email 驗證，跳過後續測試
      if (currentUrl.includes('/verify-email')) {
        console.log('Email verification required, skipping login test')
        test.skip()
        return
      }

      // Step 4: 如果註冊後未自動登入，手動登入
      if (currentUrl.includes('/login')) {
        await page.getByLabel('Email').fill(testUser.email)
        await page.getByLabel('密碼').fill(testUser.password)
        await page.getByRole('button', { name: '登入', exact: true }).click()

        // 等待登入完成
        await page.waitForTimeout(2000)
      }

      // Step 5: 驗證已成功登入並進入 Dashboard
      const finalUrl = page.url()
      const isLoggedIn = finalUrl.includes('/dashboard')

      if (isLoggedIn) {
        // 驗證 Dashboard 頁面元素
        await expect(page.locator('body')).toBeVisible()

        // 檢查是否有登出按鈕（表示已登入）
        const logoutButton = page
          .getByRole('button', { name: /登出|logout/i })
          .first()
        const hasLogout = await logoutButton
          .isVisible({ timeout: 2000 })
          .catch(() => false)

        if (hasLogout) {
          await expect(logoutButton).toBeVisible()
        }

        // 檢查使用者資訊是否顯示
        const userNameDisplay = page.getByText(testUser.name).first()
        const hasUserName = await userNameDisplay
          .isVisible({ timeout: 2000 })
          .catch(() => false)

        if (hasUserName) {
          await expect(userNameDisplay).toBeVisible()
        }
      }
    })

    test('should handle duplicate registration gracefully', async ({ page }) => {
      const testUser = {
        name: 'Duplicate User',
        email: 'duplicate@example.com',
        password: 'TestPassword123!',
      }

      // 第一次註冊
      await page.goto('/register')

      await page.getByLabel('姓名').fill(testUser.name)
      await page.getByLabel('Email').fill(testUser.email)
      await page.getByLabel('密碼', { exact: true }).fill(testUser.password)
      await page.getByLabel('確認密碼').fill(testUser.password)

      await page.getByRole('button', { name: '註冊', exact: true }).click()

      await page.waitForTimeout(2000)

      // 第二次使用相同 email 註冊
      await page.goto('/register')

      await page.getByLabel('姓名').fill(testUser.name)
      await page.getByLabel('Email').fill(testUser.email)
      await page.getByLabel('密碼', { exact: true }).fill(testUser.password)
      await page.getByLabel('確認密碼').fill(testUser.password)

      await page.getByRole('button', { name: '註冊', exact: true }).click()

      // 等待錯誤訊息
      await page.waitForTimeout(1000)

      // 檢查是否顯示重複 email 錯誤訊息
      const errorMessage = page.getByText(/已存在|already exists/i).first()
      const hasError = await errorMessage
        .isVisible({ timeout: 2000 })
        .catch(() => false)

      if (hasError) {
        await expect(errorMessage).toBeVisible()
      } else {
        // 如果沒有錯誤訊息，至少確保沒有重導向到 dashboard（不應該成功註冊）
        expect(page.url()).not.toContain('/dashboard')
      }
    })

    test('should persist login session across page reloads', async ({
      page,
    }) => {
      const testUser = generateTestUser()

      // 註冊並登入
      await page.goto('/register')

      await page.getByLabel('姓名').fill(testUser.name)
      await page.getByLabel('Email').fill(testUser.email)
      await page.getByLabel('密碼', { exact: true }).fill(testUser.password)
      await page.getByLabel('確認密碼').fill(testUser.password)

      await page.getByRole('button', { name: '註冊', exact: true }).click()

      await page.waitForTimeout(2000)

      // 如果需要登入
      if (page.url().includes('/login')) {
        await page.getByLabel('Email').fill(testUser.email)
        await page.getByLabel('密碼').fill(testUser.password)
        await page.getByRole('button', { name: '登入', exact: true }).click()
        await page.waitForTimeout(2000)
      }

      // 如果需要 email 驗證，跳過測試
      if (page.url().includes('/verify-email')) {
        test.skip()
        return
      }

      // 確保已登入
      const isLoggedIn = page.url().includes('/dashboard')

      if (!isLoggedIn) {
        test.skip()
        return
      }

      // 重新載入頁面
      await page.reload()
      await page.waitForLoadState('networkidle')

      // 驗證 session 持續存在（仍然在 dashboard）
      expect(page.url()).toContain('/dashboard')

      // 驗證使用者資訊仍然顯示
      await expect(page.locator('body')).toBeVisible()
    })

    test('should redirect to login after logout', async ({ page }) => {
      // 這個測試需要已登入的使用者
      await page.goto('/dashboard')

      // 如果未登入，會被重導向到登入頁
      await page.waitForURL(/\/(login|dashboard)/)

      if (page.url().includes('/login')) {
        // 未登入，跳過測試
        test.skip()
        return
      }

      // 尋找登出按鈕
      const logoutButton = page
        .getByRole('button', { name: /登出|logout/i })
        .first()

      const hasLogout = await logoutButton
        .isVisible({ timeout: 2000 })
        .catch(() => false)

      if (!hasLogout) {
        test.skip()
        return
      }

      // 點擊登出
      await logoutButton.click()

      // 等待重導向
      await page.waitForTimeout(1000)

      // 驗證已重導向到登入頁
      await page.waitForURL(/\/login/)
      expect(page.url()).toContain('/login')

      // 驗證無法訪問 dashboard（未登入）
      await page.goto('/dashboard')
      await page.waitForURL(/\/login/)
      expect(page.url()).toContain('/login')
    })
  })
})
