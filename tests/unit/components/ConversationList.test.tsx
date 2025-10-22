/**
 * ConversationList Component Tests
 * Sprint 7: Test conversation list UI
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ConversationList from '@/components/conversations/ConversationList'

// Mock fetch
global.fetch = vi.fn()

describe('ConversationList Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  const mockConversations = [
    {
      id: 'conv-1',
      userId: 'user-1',
      title: '測試對話 1',
      avatarId: 'avatar-1',
      createdAt: '2025-10-17T01:00:00.000Z',
      updatedAt: '2025-10-17T02:00:00.000Z',
      messages: [
        {
          id: 'msg-1',
          conversationId: 'conv-1',
          role: 'user',
          content: 'Hello',
          timestamp: '2025-10-17T01:00:00.000Z',
        },
      ],
      _count: {
        messages: 1,
      },
    },
    {
      id: 'conv-2',
      userId: 'user-1',
      title: '測試對話 2',
      createdAt: '2025-10-17T03:00:00.000Z',
      updatedAt: '2025-10-17T04:00:00.000Z',
      messages: [],
      _count: {
        messages: 0,
      },
    },
  ]

  it('應該成功載入並顯示對話列表', async () => {
    ;(global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        conversations: mockConversations,
      }),
    })

    render(<ConversationList />)

    // 等待載入完成
    await waitFor(() => {
      expect(screen.getByText('測試對話 1')).toBeInTheDocument()
    })

    expect(screen.getByText('測試對話 2')).toBeInTheDocument()
  })

  it('應該顯示載入中狀態', () => {
    ;(global.fetch as any).mockImplementationOnce(
      () =>
        new Promise(() => {
          /* never resolves */
        })
    )

    render(<ConversationList />)

    // Check for loading spinner by class name
    const spinner = document.querySelector('.animate-spin')
    expect(spinner).toBeInTheDocument()
  })

  it('應該顯示錯誤訊息當 API 失敗', async () => {
    ;(global.fetch as any).mockRejectedValueOnce(
      new Error('載入對話列表失敗')
    )

    render(<ConversationList />)

    await waitFor(() => {
      expect(screen.getByText(/載入對話列表失敗/)).toBeInTheDocument()
    })
  })

  it('應該顯示空狀態當無對話', async () => {
    ;(global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        conversations: [],
      }),
    })

    render(<ConversationList />)

    await waitFor(() => {
      expect(screen.getByText('尚無對話記錄')).toBeInTheDocument()
    })
  })

  it('應該可以搜尋對話', async () => {
    ;(global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        conversations: mockConversations,
      }),
    })

    const user = userEvent.setup()
    render(<ConversationList />)

    await waitFor(() => {
      expect(screen.getByText('測試對話 1')).toBeInTheDocument()
    })

    // 搜尋對話
    const searchInput = screen.getByPlaceholderText('搜尋對話...')
    await user.type(searchInput, '測試對話 1')

    // 應該只顯示符合的對話
    expect(screen.getByText('測試對話 1')).toBeInTheDocument()
    expect(screen.queryByText('測試對話 2')).not.toBeInTheDocument()
  })

  it('應該可以呼叫 onNewConversation', async () => {
    ;(global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        conversations: [],
      }),
    })

    const onNewConversation = vi.fn()
    const user = userEvent.setup()

    render(<ConversationList onNewConversation={onNewConversation} />)

    await waitFor(() => {
      expect(screen.getByText('尚無對話記錄')).toBeInTheDocument()
    })

    // 點擊新對話按鈕
    const newButton = screen.getByRole('button', { name: /新對話/ })
    await user.click(newButton)

    expect(onNewConversation).toHaveBeenCalledTimes(1)
  })

  it('應該可以選擇對話', async () => {
    ;(global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        conversations: mockConversations,
      }),
    })

    const onSelect = vi.fn()
    const user = userEvent.setup()

    render(<ConversationList onSelect={onSelect} />)

    await waitFor(() => {
      expect(screen.getByText('測試對話 1')).toBeInTheDocument()
    })

    // 點擊對話項目
    const conversationItem = screen.getByText('測試對話 1')
    await user.click(conversationItem)

    expect(onSelect).toHaveBeenCalledWith('conv-1')
  })
})
