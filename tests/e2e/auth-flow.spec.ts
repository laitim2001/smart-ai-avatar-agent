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
})
