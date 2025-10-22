/**
 * Chat Store - Agent Integration Unit Tests
 * Phase 4 Frontend UI: 測試 chatStore 與 Agent 的整合功能
 *
 * 測試範圍:
 * - selectedAgentId 狀態管理
 * - setSelectedAgent() 設定選中的 Agent
 * - sendMessage() 攜帶 agentId 參數
 * - 訊息中包含 agentId 和 agentName
 * - Agent 切換對對話流程的影響
 *
 * 目標涵蓋率: ≥85%
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import { useChatStore } from '@/stores/chatStore'
import type { Message } from '@/types/chat'

// Mock fetch
global.fetch = vi.fn()

// Mock EventSource for SSE
class MockEventSource {
  url: string
  onmessage: ((event: any) => void) | null = null
  onerror: ((event: any) => void) | null = null
  close = vi.fn()

  constructor(url: string) {
    this.url = url
    // Simulate async connection
    setTimeout(() => {
      if (this.onmessage) {
        // Simulate receiving messages
        this.onmessage({ data: JSON.stringify({ content: 'Hello' }) })
        this.onmessage({ data: JSON.stringify({ content: ' from' }) })
        this.onmessage({ data: JSON.stringify({ content: ' Agent' }) })
        this.onmessage({ data: JSON.stringify({ content: '', done: true }) })
      }
    }, 0)
  }
}

// @ts-ignore
global.EventSource = MockEventSource

// Mock console.error
const originalConsoleError = console.error
beforeEach(() => {
  console.error = vi.fn()
})
afterEach(() => {
  console.error = originalConsoleError
})

// Mock Agent Data
const mockAgent = {
  id: 'agent-1',
  name: 'CDO 商務顧問',
  description: '專業商務顧問',
  category: 'professional' as const,
  personaId: 'persona-1',
  avatarId: null,
  primaryLanguage: 'zh-TW',
  supportedLanguages: ['zh-TW', 'en'],
  isSystem: true,
  isPublic: true,
  isActive: true,
  usageCount: 100,
  popularity: 95,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
}

describe('chatStore - Agent 整合測試', () => {
  beforeEach(() => {
    // 清除 fetch mock
    vi.clearAllMocks()

    // 重置 store 狀態
    const { result } = renderHook(() => useChatStore())
    act(() => {
      result.current.messages = []
      result.current.input = ''
      result.current.isLoading = false
      result.current.selectedAgentId = null
    })
  })

  describe('初始狀態', () => {
    it('selectedAgentId 應該初始化為 null', () => {
      const { result } = renderHook(() => useChatStore())
      expect(result.current.selectedAgentId).toBeNull()
    })
  })

  describe('setSelectedAgent() - 設定選中的 Agent', () => {
    it('應該正確設定 selectedAgentId', () => {
      const { result } = renderHook(() => useChatStore())

      act(() => {
        result.current.setSelectedAgent('agent-1')
      })

      expect(result.current.selectedAgentId).toBe('agent-1')
    })

    it('應該能清除選中的 Agent（設為 null）', () => {
      const { result } = renderHook(() => useChatStore())

      act(() => {
        result.current.setSelectedAgent('agent-1')
      })
      expect(result.current.selectedAgentId).toBe('agent-1')

      act(() => {
        result.current.setSelectedAgent(null)
      })
      expect(result.current.selectedAgentId).toBeNull()
    })

    it('應該能切換不同的 Agent', () => {
      const { result } = renderHook(() => useChatStore())

      act(() => {
        result.current.setSelectedAgent('agent-1')
      })
      expect(result.current.selectedAgentId).toBe('agent-1')

      act(() => {
        result.current.setSelectedAgent('agent-2')
      })
      expect(result.current.selectedAgentId).toBe('agent-2')
    })
  })

  describe('sendMessage() - 攜帶 agentId 參數', () => {
    beforeEach(() => {
      // Mock fetch 需要區分不同的 API
      ;(global.fetch as any).mockImplementation((url: string) => {
        // Mock /api/agents/* - 返回 Agent 詳細資料
        if (url.startsWith('/api/agents/')) {
          return Promise.resolve({
            ok: true,
            json: async () => ({
              data: {
                ...mockAgent,
                persona: {
                  id: 'persona-1',
                  name: 'CDO Persona',
                },
              },
            }),
          })
        }

        // Mock /api/chat - 返回 SSE Stream
        if (url === '/api/chat') {
          const encoder = new TextEncoder()
          const stream = new ReadableStream({
            start(controller) {
              // 模擬 SSE 串流
              controller.enqueue(encoder.encode('data: {"content":"Hello"}\n\n'))
              controller.enqueue(encoder.encode('data: {"content":" from"}\n\n'))
              controller.enqueue(encoder.encode('data: {"content":" Agent"}\n\n'))
              controller.enqueue(encoder.encode('data: {"content":"","done":true}\n\n'))
              controller.close()
            },
          })

          return Promise.resolve({
            ok: true,
            body: stream,
            json: async () => ({}),
          })
        }

        // Default fallback
        return Promise.resolve({
          ok: true,
          json: async () => ({}),
        })
      })
    })

    it('沒有選中 Agent 時，應該使用預設 Agent (system-cdo-advisor)', async () => {
      const { result } = renderHook(() => useChatStore())

      act(() => {
        result.current.setInput('你好')
      })

      await act(async () => {
        await result.current.sendMessage()
      })

      // 等待訊息處理完成
      await waitFor(() => {
        expect(result.current.messages.length).toBeGreaterThan(0)
      })

      // 檢查 user 訊息
      const userMessage = result.current.messages.find((m) => m.role === 'user')
      expect(userMessage).toBeDefined()
      expect(userMessage?.content).toBe('你好')

      // 檢查 avatar 訊息（應該有 agentId）
      await waitFor(() => {
        const avatarMessage = result.current.messages.find((m) => m.role === 'avatar')
        expect(avatarMessage).toBeDefined()
        expect(avatarMessage?.agentId).toBeDefined()
      })
    })

    it('選中 Agent 後，訊息應該包含 agentId', async () => {
      const { result } = renderHook(() => useChatStore())

      act(() => {
        result.current.setSelectedAgent('agent-1')
        result.current.setInput('請幫我分析')
      })

      await act(async () => {
        await result.current.sendMessage()
      })

      await waitFor(() => {
        expect(result.current.messages.length).toBeGreaterThan(0)
      })

      // 檢查是否有載入 Agent 詳細資料
      expect(global.fetch).toHaveBeenCalledWith('/api/agents/agent-1')

      // 檢查 avatar 訊息
      await waitFor(() => {
        const avatarMessage = result.current.messages.find((m) => m.role === 'avatar')
        expect(avatarMessage).toBeDefined()
        expect(avatarMessage?.agentId).toBe('agent-1')
        expect(avatarMessage?.agentName).toBe('CDO 商務顧問')
      })
    })

    it('Agent 詳細資料載入失敗時，應該使用預設值', async () => {
      // Mock failed agent detail fetch
      ;(global.fetch as any).mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: 'Agent 不存在' }),
      })

      const { result } = renderHook(() => useChatStore())

      act(() => {
        result.current.setSelectedAgent('invalid-agent')
        result.current.setInput('測試')
      })

      await act(async () => {
        await result.current.sendMessage()
      })

      await waitFor(() => {
        expect(result.current.messages.length).toBeGreaterThan(0)
      })

      // 應該仍然能發送訊息（使用預設 Agent）
      await waitFor(() => {
        const avatarMessage = result.current.messages.find((m) => m.role === 'avatar')
        expect(avatarMessage).toBeDefined()
      })
    })

    it('切換 Agent 後，新訊息應該使用新的 agentId', async () => {
      const { result } = renderHook(() => useChatStore())

      // 第一個 Agent
      ;(global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          data: { ...mockAgent, id: 'agent-1', name: 'Agent 1' },
        }),
      })

      act(() => {
        result.current.setSelectedAgent('agent-1')
        result.current.setInput('訊息 1')
      })

      await act(async () => {
        await result.current.sendMessage()
      })

      await waitFor(() => {
        const messages = result.current.messages
        const avatarMsg = messages.find((m) => m.role === 'avatar')
        expect(avatarMsg?.agentId).toBe('agent-1')
        expect(avatarMsg?.agentName).toBe('Agent 1')
      })

      // 切換到第二個 Agent
      ;(global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          data: { ...mockAgent, id: 'agent-2', name: 'Agent 2' },
        }),
      })

      act(() => {
        result.current.setSelectedAgent('agent-2')
        result.current.setInput('訊息 2')
      })

      await act(async () => {
        await result.current.sendMessage()
      })

      await waitFor(() => {
        const messages = result.current.messages
        const avatarMessages = messages.filter((m) => m.role === 'avatar')
        expect(avatarMessages.length).toBeGreaterThanOrEqual(2)

        // 檢查最新的 avatar 訊息
        const latestAvatarMsg = avatarMessages[avatarMessages.length - 1]
        expect(latestAvatarMsg.agentId).toBe('agent-2')
        expect(latestAvatarMsg.agentName).toBe('Agent 2')
      })
    })
  })

  describe('訊息歷史中的 Agent 資訊', () => {
    it('對話歷史應該保留每個訊息的 agentId', async () => {
      // 使用 mockImplementation 而非 mockResolvedValue
      ;(global.fetch as any).mockImplementation((url: string) => {
        if (url.startsWith('/api/agents/')) {
          return Promise.resolve({
            ok: true,
            json: async () => ({ data: mockAgent }),
          })
        }

        if (url === '/api/chat') {
          const encoder = new TextEncoder()
          const stream = new ReadableStream({
            start(controller) {
              controller.enqueue(encoder.encode('data: {"content":"Hello"}\n\n'))
              controller.enqueue(encoder.encode('data: {"content":"","done":true}\n\n'))
              controller.close()
            },
          })
          return Promise.resolve({ ok: true, body: stream })
        }

        return Promise.resolve({ ok: true, json: async () => ({}) })
      })

      const { result } = renderHook(() => useChatStore())

      // 發送多個訊息
      for (let i = 1; i <= 3; i++) {
        act(() => {
          result.current.setSelectedAgent(`agent-${i}`)
          result.current.setInput(`訊息 ${i}`)
        })

        await act(async () => {
          await result.current.sendMessage()
        })
      }

      await waitFor(() => {
        expect(result.current.messages.length).toBeGreaterThanOrEqual(6) // 3 user + 3 avatar
      })

      // 檢查每個 avatar 訊息都有 agentId
      const avatarMessages = result.current.messages.filter((m) => m.role === 'avatar')
      expect(avatarMessages.length).toBeGreaterThanOrEqual(3)

      avatarMessages.forEach((msg) => {
        expect(msg.agentId).toBeDefined()
        expect(msg.agentName).toBeDefined()
      })
    })

    it('用戶訊息不應該包含 agentId', async () => {
      ;(global.fetch as any).mockResolvedValue({
        ok: true,
        json: async () => ({
          data: mockAgent,
        }),
      })

      const { result } = renderHook(() => useChatStore())

      act(() => {
        result.current.setSelectedAgent('agent-1')
        result.current.setInput('測試訊息')
      })

      await act(async () => {
        await result.current.sendMessage()
      })

      await waitFor(() => {
        const userMessage = result.current.messages.find((m) => m.role === 'user')
        expect(userMessage).toBeDefined()
        expect(userMessage?.agentId).toBeUndefined()
        expect(userMessage?.agentName).toBeUndefined()
      })
    })
  })

  describe('clearMessages() - 清除訊息', () => {
    it('清除訊息後，selectedAgentId 應該保持不變', async () => {
      ;(global.fetch as any).mockResolvedValue({
        ok: true,
        json: async () => ({
          data: mockAgent,
        }),
      })

      const { result } = renderHook(() => useChatStore())

      act(() => {
        result.current.setSelectedAgent('agent-1')
        result.current.setInput('測試')
      })

      await act(async () => {
        await result.current.sendMessage()
      })

      await waitFor(() => {
        expect(result.current.messages.length).toBeGreaterThan(0)
      })

      // 清除訊息
      act(() => {
        result.current.clearMessages()
      })

      expect(result.current.messages).toEqual([])
      expect(result.current.selectedAgentId).toBe('agent-1') // Agent 選擇應該保持
    })
  })

  describe('邊界情況', () => {
    it('空輸入時不應該發送訊息', async () => {
      const { result } = renderHook(() => useChatStore())

      act(() => {
        result.current.setSelectedAgent('agent-1')
        result.current.setInput('')
      })

      await act(async () => {
        await result.current.sendMessage()
      })

      // 不應該有訊息
      expect(result.current.messages).toEqual([])
    })

    it('isLoading 為 true 時不應該發送新訊息', async () => {
      const { result } = renderHook(() => useChatStore())

      // 模擬正在載入
      act(() => {
        result.current.isLoading = true
        result.current.setInput('測試')
      })

      await act(async () => {
        await result.current.sendMessage()
      })

      // 不應該有新訊息
      expect(result.current.messages).toEqual([])
    })

    it('快速切換 Agent 應該正確處理', async () => {
      ;(global.fetch as any).mockResolvedValue({
        ok: true,
        json: async () => ({
          data: mockAgent,
        }),
      })

      const { result } = renderHook(() => useChatStore())

      // 快速切換多個 Agent
      act(() => {
        result.current.setSelectedAgent('agent-1')
        result.current.setSelectedAgent('agent-2')
        result.current.setSelectedAgent('agent-3')
      })

      // 最終應該是最後一個 Agent
      expect(result.current.selectedAgentId).toBe('agent-3')
    })
  })

  describe('錯誤處理', () => {
    it('Agent API 失敗不應該阻止訊息發送', async () => {
      // Mock agent detail API failure
      ;(global.fetch as any).mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: 'API 錯誤' }),
      })

      const { result } = renderHook(() => useChatStore())

      act(() => {
        result.current.setSelectedAgent('agent-1')
        result.current.setInput('測試訊息')
      })

      await act(async () => {
        await result.current.sendMessage()
      })

      // 應該仍然能發送訊息
      await waitFor(() => {
        expect(result.current.messages.length).toBeGreaterThan(0)
      })
    })

    it('網路錯誤時應該正常降級', async () => {
      // Mock network error
      ;(global.fetch as any).mockRejectedValueOnce(new Error('Network error'))

      const { result } = renderHook(() => useChatStore())

      act(() => {
        result.current.setSelectedAgent('agent-1')
        result.current.setInput('測試')
      })

      await act(async () => {
        await result.current.sendMessage()
      })

      // 應該使用預設 Agent 發送訊息
      await waitFor(() => {
        expect(result.current.messages.length).toBeGreaterThan(0)
      })
    })
  })
})
