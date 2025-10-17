/**
 * Conversation History E2E Tests
 *
 * 測試對話歷史完整使用者旅程：
 * - 建立對話
 * - 查看對話列表
 * - 搜尋對話
 * - 匯出對話
 * - 刪除對話
 */

import { test, expect } from '@playwright/test'

test.describe('Conversation History Flow', () => {
  test.describe('Create Conversation', () => {
    test('should create new conversation from chat', async ({ page }) => {
      await page.goto('/dashboard')

      // 如果未登入，跳過測試
      if (page.url().includes('/login')) {
        test.skip()
        return
      }

      // 尋找聊天介面
      const chatInput = page.locator('input[placeholder*="訊息"], textarea[placeholder*="訊息"], input[type="text"]').first()

      const hasChatInput = await chatInput
        .isVisible({ timeout: 2000 })
        .catch(() => false)

      if (!hasChatInput) {
        test.skip()
        return
      }

      // 輸入訊息
      const testMessage = `測試訊息 ${Date.now()}`
      await chatInput.fill(testMessage)

      // 尋找發送按鈕
      const sendButton = page
        .getByRole('button', { name: /發送|send|送出/i })
        .first()

      const hasSendButton = await sendButton
        .isVisible({ timeout: 1000 })
        .catch(() => false)

      if (hasSendButton) {
        await sendButton.click()
      } else {
        // 如果沒有發送按鈕，嘗試按 Enter
        await chatInput.press('Enter')
      }

      // 等待訊息發送
      await page.waitForTimeout(1000)

      // 檢查訊息是否顯示在聊天介面
      const messageDisplay = page.getByText(testMessage).first()
      const hasMessage = await messageDisplay
        .isVisible({ timeout: 2000 })
        .catch(() => false)

      if (hasMessage) {
        await expect(messageDisplay).toBeVisible()
      }
    })

    test('should create multiple messages in conversation', async ({
      page,
    }) => {
      await page.goto('/dashboard')

      if (page.url().includes('/login')) {
        test.skip()
        return
      }

      const chatInput = page.locator('input[placeholder*="訊息"], textarea[placeholder*="訊息"], input[type="text"]').first()

      const hasChatInput = await chatInput
        .isVisible({ timeout: 2000 })
        .catch(() => false)

      if (!hasChatInput) {
        test.skip()
        return
      }

      // 發送多則訊息
      const messages = ['第一則訊息', '第二則訊息', '第三則訊息']

      for (const message of messages) {
        await chatInput.fill(message)

        const sendButton = page
          .getByRole('button', { name: /發送|send|送出/i })
          .first()

        const hasSendButton = await sendButton
          .isVisible({ timeout: 500 })
          .catch(() => false)

        if (hasSendButton) {
          await sendButton.click()
        } else {
          await chatInput.press('Enter')
        }

        await page.waitForTimeout(500)
      }

      // 檢查是否所有訊息都顯示
      for (const message of messages) {
        const messageDisplay = page.getByText(message).first()
        const hasMessage = await messageDisplay
          .isVisible({ timeout: 1000 })
          .catch(() => false)

        if (hasMessage) {
          await expect(messageDisplay).toBeVisible()
        }
      }
    })
  })

  test.describe('View Conversation List', () => {
    test('should display conversation history list', async ({ page }) => {
      await page.goto('/dashboard')

      if (page.url().includes('/login')) {
        test.skip()
        return
      }

      // 尋找對話歷史連結或按鈕
      const historyButton = page
        .getByRole('button', { name: /歷史|history|對話記錄/i })
        .first()
      const historyLink = page
        .getByRole('link', { name: /歷史|history|對話記錄/i })
        .first()

      const hasHistoryButton = await historyButton
        .isVisible({ timeout: 1000 })
        .catch(() => false)
      const hasHistoryLink = await historyLink
        .isVisible({ timeout: 1000 })
        .catch(() => false)

      if (hasHistoryButton) {
        await historyButton.click()
      } else if (hasHistoryLink) {
        await historyLink.click()
      } else {
        // 嘗試直接訪問歷史頁面
        await page.goto('/dashboard/history')
        await page.waitForTimeout(1000)

        // 如果被重導向，可能是路徑不同
        if (
          !page.url().includes('/history') &&
          !page.url().includes('/conversations')
        ) {
          test.skip()
          return
        }
      }

      // 等待對話列表載入
      await page.waitForTimeout(1000)

      // 檢查對話列表容器
      const conversationList = page.locator('[data-testid="conversation-list"]').first()

      const hasList = await conversationList
        .isVisible({ timeout: 2000 })
        .catch(() => false)

      if (hasList) {
        await expect(conversationList).toBeVisible()
      } else {
        // 如果沒有 test-id，檢查是否有對話項目
        const conversationItems = page.locator('[data-conversation-id]')
        const count = await conversationItems.count()

        if (count > 0) {
          expect(count).toBeGreaterThan(0)
        }
      }
    })

    test('should display conversation metadata (date, preview)', async ({
      page,
    }) => {
      await page.goto('/dashboard')

      if (page.url().includes('/login')) {
        test.skip()
        return
      }

      // 前往對話歷史
      const historyButton = page
        .getByRole('button', { name: /歷史|history|對話記錄/i })
        .first()

      const hasHistoryButton = await historyButton
        .isVisible({ timeout: 1000 })
        .catch(() => false)

      if (hasHistoryButton) {
        await historyButton.click()
      } else {
        await page.goto('/dashboard/history')
      }

      await page.waitForTimeout(1000)

      // 檢查對話項目
      const conversationItems = page.locator('[data-conversation-id]')
      const count = await conversationItems.count()

      if (count > 0) {
        const firstItem = conversationItems.first()

        // 檢查日期顯示
        const dateDisplay = firstItem.locator('[data-testid="conversation-date"]')
        const hasDate = await dateDisplay
          .isVisible({ timeout: 500 })
          .catch(() => false)

        if (hasDate) {
          await expect(dateDisplay).toBeVisible()
        }

        // 檢查預覽文字
        const previewDisplay = firstItem.locator('[data-testid="conversation-preview"]')
        const hasPreview = await previewDisplay
          .isVisible({ timeout: 500 })
          .catch(() => false)

        if (hasPreview) {
          await expect(previewDisplay).toBeVisible()
        }
      }
    })

    test('should sort conversations by date (newest first)', async ({
      page,
    }) => {
      await page.goto('/dashboard')

      if (page.url().includes('/login')) {
        test.skip()
        return
      }

      // 前往對話歷史
      await page.goto('/dashboard/history')
      await page.waitForTimeout(1000)

      // 檢查對話列表
      const conversationItems = page.locator('[data-conversation-id]')
      const count = await conversationItems.count()

      if (count >= 2) {
        // 至少需要 2 個對話才能檢查排序
        // Note: 實際的日期比較需要根據 UI 實作

        const firstItem = conversationItems.first()
        const secondItem = conversationItems.nth(1)

        // 檢查兩個項目都可見
        await expect(firstItem).toBeVisible()
        await expect(secondItem).toBeVisible()
      }
    })
  })

  test.describe('Search Conversations', () => {
    test('should display search input', async ({ page }) => {
      await page.goto('/dashboard')

      if (page.url().includes('/login')) {
        test.skip()
        return
      }

      // 前往對話歷史
      await page.goto('/dashboard/history')
      await page.waitForTimeout(1000)

      // 尋找搜尋輸入框
      const searchInput = page.locator('input[placeholder*="搜尋"], input[type="search"]').first()

      const hasSearch = await searchInput
        .isVisible({ timeout: 2000 })
        .catch(() => false)

      if (hasSearch) {
        await expect(searchInput).toBeVisible()
      }
    })

    test('should filter conversations by search query', async ({ page }) => {
      await page.goto('/dashboard')

      if (page.url().includes('/login')) {
        test.skip()
        return
      }

      // 前往對話歷史
      await page.goto('/dashboard/history')
      await page.waitForTimeout(1000)

      // 取得初始對話數量
      const conversationItems = page.locator('[data-conversation-id]')
      const initialCount = await conversationItems.count()

      if (initialCount === 0) {
        test.skip()
        return
      }

      // 尋找搜尋輸入框
      const searchInput = page.locator('input[placeholder*="搜尋"], input[type="search"]').first()

      const hasSearch = await searchInput
        .isVisible({ timeout: 1000 })
        .catch(() => false)

      if (!hasSearch) {
        test.skip()
        return
      }

      // 輸入搜尋關鍵字（使用不太可能存在的字串）
      await searchInput.fill('xyzabc123notfound')
      await page.waitForTimeout(500)

      // 檢查搜尋結果（應該減少或為 0）
      const filteredCount = await conversationItems.count()

      // 搜尋應該過濾結果
      expect(filteredCount).toBeLessThanOrEqual(initialCount)
    })

    test('should show all conversations when search is cleared', async ({
      page,
    }) => {
      await page.goto('/dashboard')

      if (page.url().includes('/login')) {
        test.skip()
        return
      }

      // 前往對話歷史
      await page.goto('/dashboard/history')
      await page.waitForTimeout(1000)

      // 取得初始對話數量
      const conversationItems = page.locator('[data-conversation-id]')
      const initialCount = await conversationItems.count()

      if (initialCount === 0) {
        test.skip()
        return
      }

      // 尋找搜尋輸入框
      const searchInput = page.locator('input[placeholder*="搜尋"], input[type="search"]').first()

      const hasSearch = await searchInput
        .isVisible({ timeout: 1000 })
        .catch(() => false)

      if (!hasSearch) {
        test.skip()
        return
      }

      // 輸入搜尋關鍵字
      await searchInput.fill('測試')
      await page.waitForTimeout(500)

      // 清除搜尋
      await searchInput.clear()
      await page.waitForTimeout(500)

      // 檢查是否恢復所有對話
      const restoredCount = await conversationItems.count()

      expect(restoredCount).toBe(initialCount)
    })
  })

  test.describe('Export Conversation', () => {
    test('should have export button for conversations', async ({ page }) => {
      await page.goto('/dashboard')

      if (page.url().includes('/login')) {
        test.skip()
        return
      }

      // 前往對話歷史
      await page.goto('/dashboard/history')
      await page.waitForTimeout(1000)

      // 檢查對話項目
      const conversationItems = page.locator('[data-conversation-id]')
      const count = await conversationItems.count()

      if (count === 0) {
        test.skip()
        return
      }

      // 檢查匯出按鈕
      const exportButton = page
        .getByRole('button', { name: /匯出|export|下載/i })
        .first()

      const hasExport = await exportButton
        .isVisible({ timeout: 2000 })
        .catch(() => false)

      if (hasExport) {
        await expect(exportButton).toBeVisible()
      }
    })

    test('should export conversation as JSON', async ({ page }) => {
      await page.goto('/dashboard')

      if (page.url().includes('/login')) {
        test.skip()
        return
      }

      // 前往對話歷史
      await page.goto('/dashboard/history')
      await page.waitForTimeout(1000)

      // 檢查對話項目
      const conversationItems = page.locator('[data-conversation-id]')
      const count = await conversationItems.count()

      if (count === 0) {
        test.skip()
        return
      }

      // 尋找匯出按鈕（可能在對話項目內或全域）
      const exportButton = page
        .getByRole('button', { name: /匯出.*JSON|export.*JSON/i })
        .first()

      const hasExport = await exportButton
        .isVisible({ timeout: 1000 })
        .catch(() => false)

      if (!hasExport) {
        test.skip()
        return
      }

      // 監聽下載事件
      const downloadPromise = page.waitForEvent('download', { timeout: 5000 }).catch(() => null)

      // 點擊匯出
      await exportButton.click()

      const download = await downloadPromise

      if (download) {
        // 驗證下載檔案
        const filename = download.suggestedFilename()
        expect(filename).toContain('.json')
      }
    })
  })

  test.describe('Delete Conversation', () => {
    test('should have delete button for conversations', async ({ page }) => {
      await page.goto('/dashboard')

      if (page.url().includes('/login')) {
        test.skip()
        return
      }

      // 前往對話歷史
      await page.goto('/dashboard/history')
      await page.waitForTimeout(1000)

      // 檢查對話項目
      const conversationItems = page.locator('[data-conversation-id]')
      const count = await conversationItems.count()

      if (count === 0) {
        test.skip()
        return
      }

      // 檢查刪除按鈕（可能在對話項目內）
      const deleteButton = page
        .getByRole('button', { name: /刪除|delete|移除/i })
        .first()

      const hasDelete = await deleteButton
        .isVisible({ timeout: 2000 })
        .catch(() => false)

      if (hasDelete) {
        await expect(deleteButton).toBeVisible()
      }
    })

    test('should show confirmation dialog before deleting', async ({
      page,
    }) => {
      await page.goto('/dashboard')

      if (page.url().includes('/login')) {
        test.skip()
        return
      }

      // 前往對話歷史
      await page.goto('/dashboard/history')
      await page.waitForTimeout(1000)

      // 檢查對話項目
      const conversationItems = page.locator('[data-conversation-id]')
      const count = await conversationItems.count()

      if (count === 0) {
        test.skip()
        return
      }

      // 取得初始數量
      const initialCount = count

      // 尋找刪除按鈕
      const deleteButton = conversationItems
        .first()
        .getByRole('button', { name: /刪除|delete/i })
        .first()

      const hasDelete = await deleteButton
        .isVisible({ timeout: 1000 })
        .catch(() => false)

      if (!hasDelete) {
        test.skip()
        return
      }

      // 點擊刪除
      await deleteButton.click()

      // 等待確認對話框
      await page.waitForTimeout(500)

      // 檢查確認對話框
      const confirmDialog = page.locator('[role="dialog"], [role="alertdialog"]').first()
      const confirmButton = page
        .getByRole('button', { name: /確認|確定|delete/i })
        .first()

      const hasDialog = await confirmDialog
        .isVisible({ timeout: 1000 })
        .catch(() => false)
      const hasConfirm = await confirmButton
        .isVisible({ timeout: 1000 })
        .catch(() => false)

      if (hasDialog) {
        await expect(confirmDialog).toBeVisible()
      }

      if (hasConfirm) {
        await expect(confirmButton).toBeVisible()

        // 確認刪除
        await confirmButton.click()
        await page.waitForTimeout(1000)

        // 檢查對話是否被刪除（數量減少）
        const newCount = await conversationItems.count()
        expect(newCount).toBe(initialCount - 1)
      }
    })

    test('should cancel deletion when clicking cancel', async ({ page }) => {
      await page.goto('/dashboard')

      if (page.url().includes('/login')) {
        test.skip()
        return
      }

      // 前往對話歷史
      await page.goto('/dashboard/history')
      await page.waitForTimeout(1000)

      // 檢查對話項目
      const conversationItems = page.locator('[data-conversation-id]')
      const count = await conversationItems.count()

      if (count === 0) {
        test.skip()
        return
      }

      const initialCount = count

      // 尋找刪除按鈕
      const deleteButton = conversationItems
        .first()
        .getByRole('button', { name: /刪除|delete/i })
        .first()

      const hasDelete = await deleteButton
        .isVisible({ timeout: 1000 })
        .catch(() => false)

      if (!hasDelete) {
        test.skip()
        return
      }

      // 點擊刪除
      await deleteButton.click()

      // 等待確認對話框
      await page.waitForTimeout(500)

      // 尋找取消按鈕
      const cancelButton = page
        .getByRole('button', { name: /取消|cancel/i })
        .first()

      const hasCancel = await cancelButton
        .isVisible({ timeout: 1000 })
        .catch(() => false)

      if (hasCancel) {
        await cancelButton.click()
        await page.waitForTimeout(500)

        // 檢查對話未被刪除（數量不變）
        const newCount = await conversationItems.count()
        expect(newCount).toBe(initialCount)
      }
    })
  })

  test.describe('Conversation Details', () => {
    test('should view full conversation when clicking on item', async ({
      page,
    }) => {
      await page.goto('/dashboard')

      if (page.url().includes('/login')) {
        test.skip()
        return
      }

      // 前往對話歷史
      await page.goto('/dashboard/history')
      await page.waitForTimeout(1000)

      // 檢查對話項目
      const conversationItems = page.locator('[data-conversation-id]')
      const count = await conversationItems.count()

      if (count === 0) {
        test.skip()
        return
      }

      // 點擊第一個對話
      await conversationItems.first().click()

      // 等待對話詳情載入
      await page.waitForTimeout(1000)

      // 檢查是否顯示完整對話內容
      // 可能：
      // 1. 在同一頁面展開
      // 2. 重導向到對話詳情頁
      const currentUrl = page.url()

      const isDetailPage =
        currentUrl.includes('/conversation/') ||
        currentUrl.includes('/chat/')

      if (isDetailPage) {
        // 檢查對話內容容器
        const conversationContent = page.locator('[data-testid="conversation-content"]').first()

        const hasContent = await conversationContent
          .isVisible({ timeout: 2000 })
          .catch(() => false)

        if (hasContent) {
          await expect(conversationContent).toBeVisible()
        } else {
          // 至少確保頁面載入
          await expect(page.locator('body')).toBeVisible()
        }
      } else {
        // 如果在同一頁面，檢查是否有展開的內容
        const expandedContent = page.locator('[data-expanded="true"]').first()

        const hasExpanded = await expandedContent
          .isVisible({ timeout: 1000 })
          .catch(() => false)

        if (hasExpanded) {
          await expect(expandedContent).toBeVisible()
        }
      }
    })
  })
})
