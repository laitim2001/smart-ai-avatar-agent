/**
 * Agent Store Unit Tests
 * Phase 4 Frontend UI: 測試 agentStore 所有功能
 *
 * 測試範圍:
 * - loadAgents() - 載入 Agent 列表（支援篩選）
 * - loadAgentDetail() - 載入 Agent 詳細資料
 * - createAgent() - 建立新 Agent
 * - updateAgent() - 更新 Agent
 * - deleteAgent() - 刪除 Agent（軟刪除/硬刪除）
 * - linkKnowledge() - 關聯知識庫
 * - unlinkKnowledge() - 解除知識庫關聯
 * - setCurrentAgent() - 設定當前 Agent
 * - clearError() - 清除錯誤訊息
 *
 * 目標涵蓋率: ≥90%
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import { useAgentStore } from '@/stores/agentStore'
import type { Agent, AgentDetail } from '@/types/agent'

// Mock fetch
global.fetch = vi.fn()

// Mock console.error to avoid noise in test output
const originalConsoleError = console.error
beforeEach(() => {
  console.error = vi.fn()
})
afterEach(() => {
  console.error = originalConsoleError
})

// Mock Data
const mockAgent: Agent = {
  id: 'agent-1',
  name: '測試 Agent',
  description: '這是一個測試 Agent',
  category: 'professional',
  personaId: 'persona-1',
  avatarId: null,
  primaryLanguage: 'zh-TW',
  supportedLanguages: ['zh-TW', 'en'],
  isSystem: false,
  isPublic: true,
  isActive: true,
  usageCount: 10,
  popularity: 85,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
}

const mockAgentDetail: AgentDetail = {
  ...mockAgent,
  persona: {
    id: 'persona-1',
    name: '測試 Persona',
    role: '測試角色',
    description: '測試描述',
    systemPrompt: '你是一個測試助手',
    language: 'zh-TW',
    tone: 'professional',
    style: ['專業', '友善'],
    capabilities: ['對話', '分析'],
    restrictions: ['不提供醫療建議'],
    version: '1.0.0',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  knowledgeBases: [
    {
      id: 'kb-1',
      name: '測試知識庫',
      type: 'faq',
      category: 'general',
      priority: 1,
      isRequired: true,
    },
  ],
  avatar: null,
}

describe('agentStore - Phase 4 完整測試', () => {
  beforeEach(() => {
    // 清除 fetch mock
    vi.clearAllMocks()

    // 重置 store 狀態
    const { result } = renderHook(() => useAgentStore())
    act(() => {
      result.current.agents = []
      result.current.currentAgent = null
      result.current.isLoading = false
      result.current.error = null
    })
  })

  describe('初始狀態', () => {
    it('應該正確初始化 store 狀態', () => {
      const { result } = renderHook(() => useAgentStore())

      expect(result.current.agents).toEqual([])
      expect(result.current.currentAgent).toBeNull()
      expect(result.current.isLoading).toBe(false)
      expect(result.current.error).toBeNull()
    })
  })

  describe('loadAgents() - 載入 Agent 列表', () => {
    it('應該成功載入 Agent 列表（無篩選）', async () => {
      const mockAgents = [mockAgent, { ...mockAgent, id: 'agent-2', name: 'Agent 2' }]

      ;(global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: mockAgents }),
      })

      const { result } = renderHook(() => useAgentStore())

      await act(async () => {
        await result.current.loadAgents()
      })

      expect(result.current.agents).toEqual(mockAgents)
      expect(result.current.isLoading).toBe(false)
      expect(result.current.error).toBeNull()
      expect(global.fetch).toHaveBeenCalledWith('/api/agents')
    })

    it('應該成功載入系統 Agent（篩選 isSystem=true）', async () => {
      const systemAgent = { ...mockAgent, isSystem: true }
      ;(global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: [systemAgent] }),
      })

      const { result } = renderHook(() => useAgentStore())

      await act(async () => {
        await result.current.loadAgents({ isSystem: true })
      })

      expect(global.fetch).toHaveBeenCalledWith('/api/agents?isSystem=true')
      expect(result.current.agents).toEqual([systemAgent])
    })

    it('應該成功載入公開 Agent（篩選 isPublic=true）', async () => {
      ;(global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: [mockAgent] }),
      })

      const { result } = renderHook(() => useAgentStore())

      await act(async () => {
        await result.current.loadAgents({ isPublic: true })
      })

      expect(global.fetch).toHaveBeenCalledWith('/api/agents?isPublic=true')
    })

    it('應該成功載入特定類別的 Agent', async () => {
      ;(global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: [mockAgent] }),
      })

      const { result } = renderHook(() => useAgentStore())

      await act(async () => {
        await result.current.loadAgents({ category: 'professional' })
      })

      expect(global.fetch).toHaveBeenCalledWith('/api/agents?category=professional')
    })

    it('應該支援多個篩選條件組合', async () => {
      ;(global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: [] }),
      })

      const { result } = renderHook(() => useAgentStore())

      await act(async () => {
        await result.current.loadAgents({
          isSystem: true,
          isPublic: true,
          category: 'professional',
        })
      })

      expect(global.fetch).toHaveBeenCalledWith(
        '/api/agents?isSystem=true&isPublic=true&category=professional'
      )
    })

    it('載入失敗時應該設定錯誤訊息', async () => {
      ;(global.fetch as any).mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: '載入失敗' }),
      })

      const { result } = renderHook(() => useAgentStore())

      await act(async () => {
        await result.current.loadAgents()
      })

      expect(result.current.agents).toEqual([])
      expect(result.current.error).toBe('載入 Agent 列表失敗')
      expect(result.current.isLoading).toBe(false)
    })

    it('網路錯誤時應該設定通用錯誤訊息', async () => {
      ;(global.fetch as any).mockRejectedValueOnce(new Error('Network error'))

      const { result } = renderHook(() => useAgentStore())

      await act(async () => {
        await result.current.loadAgents()
      })

      expect(result.current.error).toBe('載入 Agent 列表失敗')
    })

    it('載入過程中應該設定 isLoading 狀態', async () => {
      let resolvePromise: any
      const promise = new Promise((resolve) => {
        resolvePromise = resolve
      })

      ;(global.fetch as any).mockReturnValueOnce(promise)

      const { result } = renderHook(() => useAgentStore())

      const loadPromise = act(async () => {
        await result.current.loadAgents()
      })

      // 檢查載入中狀態
      await waitFor(() => {
        expect(result.current.isLoading).toBe(true)
      })

      // 完成載入
      resolvePromise({
        ok: true,
        json: async () => ({ data: [mockAgent] }),
      })

      await loadPromise

      expect(result.current.isLoading).toBe(false)
    })
  })

  describe('loadAgentDetail() - 載入 Agent 詳細資料', () => {
    it('應該成功載入 Agent 詳細資料', async () => {
      ;(global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: mockAgentDetail }),
      })

      const { result } = renderHook(() => useAgentStore())

      let agentDetail: AgentDetail | null = null
      await act(async () => {
        agentDetail = await result.current.loadAgentDetail('agent-1')
      })

      expect(agentDetail).toEqual(mockAgentDetail)
      expect(global.fetch).toHaveBeenCalledWith('/api/agents/agent-1')
    })

    it('載入失敗時應該返回 null 並設定錯誤', async () => {
      ;(global.fetch as any).mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: 'Agent 不存在' }),
      })

      const { result } = renderHook(() => useAgentStore())

      let agentDetail: AgentDetail | null = null
      await act(async () => {
        agentDetail = await result.current.loadAgentDetail('invalid-id')
      })

      expect(agentDetail).toBeNull()
      expect(result.current.error).toBe('載入 Agent 詳細資料失敗')
    })

    it('網路錯誤時應該返回 null', async () => {
      ;(global.fetch as any).mockRejectedValueOnce(new Error('Network error'))

      const { result } = renderHook(() => useAgentStore())

      let agentDetail: AgentDetail | null = null
      await act(async () => {
        agentDetail = await result.current.loadAgentDetail('agent-1')
      })

      expect(agentDetail).toBeNull()
      expect(result.current.error).toBe('載入 Agent 詳細資料失敗')
    })
  })

  describe('createAgent() - 建立新 Agent', () => {
    const createData = {
      name: '新 Agent',
      description: '新 Agent 描述',
      category: 'professional' as const,
      personaId: 'persona-1',
      primaryLanguage: 'zh-TW',
      supportedLanguages: ['zh-TW', 'en'],
      isPublic: false,
    }

    it('應該成功建立新 Agent', async () => {
      const newAgent = { ...mockAgent, id: 'new-agent-1', ...createData }

      ;(global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: newAgent }),
      })

      const { result } = renderHook(() => useAgentStore())

      let createdAgent: Agent | null = null
      await act(async () => {
        createdAgent = await result.current.createAgent(createData)
      })

      expect(createdAgent).toEqual(newAgent)
      expect(global.fetch).toHaveBeenCalledWith('/api/agents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(createData),
      })
    })

    it('建立失敗時應該返回 null 並設定錯誤', async () => {
      ;(global.fetch as any).mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: '名稱已存在' }),
      })

      const { result } = renderHook(() => useAgentStore())

      let createdAgent: Agent | null = null
      await act(async () => {
        createdAgent = await result.current.createAgent(createData)
      })

      expect(createdAgent).toBeNull()
      expect(result.current.error).toBe('建立 Agent 失敗')
    })

    it('網路錯誤時應該返回 null', async () => {
      ;(global.fetch as any).mockRejectedValueOnce(new Error('Network error'))

      const { result } = renderHook(() => useAgentStore())

      let createdAgent: Agent | null = null
      await act(async () => {
        createdAgent = await result.current.createAgent(createData)
      })

      expect(createdAgent).toBeNull()
      expect(result.current.error).toBe('建立 Agent 失敗')
    })
  })

  describe('updateAgent() - 更新 Agent', () => {
    const updateData = {
      name: '更新後的名稱',
      description: '更新後的描述',
    }

    it('應該成功更新 Agent', async () => {
      const updatedAgent = { ...mockAgent, ...updateData }

      ;(global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: updatedAgent }),
      })

      const { result } = renderHook(() => useAgentStore())

      let updated: Agent | null = null
      await act(async () => {
        updated = await result.current.updateAgent('agent-1', updateData)
      })

      expect(updated).toEqual(updatedAgent)
      expect(global.fetch).toHaveBeenCalledWith('/api/agents/agent-1', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData),
      })
    })

    it('更新失敗時應該返回 null 並設定錯誤', async () => {
      ;(global.fetch as any).mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: 'Agent 不存在' }),
      })

      const { result } = renderHook(() => useAgentStore())

      let updated: Agent | null = null
      await act(async () => {
        updated = await result.current.updateAgent('invalid-id', updateData)
      })

      expect(updated).toBeNull()
      expect(result.current.error).toBe('Agent 不存在')
    })
  })

  describe('deleteAgent() - 刪除 Agent', () => {
    it('應該成功軟刪除 Agent（預設）', async () => {
      ;(global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: {} }),
      })

      const { result } = renderHook(() => useAgentStore())

      let deleted = false
      await act(async () => {
        deleted = await result.current.deleteAgent('agent-1')
      })

      expect(deleted).toBe(true)
      expect(global.fetch).toHaveBeenCalledWith('/api/agents/agent-1', {
        method: 'DELETE',
      })
      // 預設不帶 force 參數
      const callArgs = (global.fetch as any).mock.calls[0]
      expect(callArgs[0]).not.toContain('force=true')
    })

    it('應該成功硬刪除 Agent（force=true）', async () => {
      ;(global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: {} }),
      })

      const { result } = renderHook(() => useAgentStore())

      let deleted = false
      await act(async () => {
        deleted = await result.current.deleteAgent('agent-1', true)
      })

      expect(deleted).toBe(true)
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/agents/agent-1?force=true',
        {
          method: 'DELETE',
        }
      )
    })

    it('刪除失敗時應該返回 false 並設定錯誤', async () => {
      ;(global.fetch as any).mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: 'Agent 不存在' }),
      })

      const { result } = renderHook(() => useAgentStore())

      let deleted = false
      await act(async () => {
        deleted = await result.current.deleteAgent('invalid-id')
      })

      expect(deleted).toBe(false)
      expect(result.current.error).toBe('Agent 不存在')
    })
  })

  describe('linkKnowledge() - 關聯知識庫', () => {
    it('應該成功關聯知識庫', async () => {
      ;(global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: {} }),
      })

      const { result } = renderHook(() => useAgentStore())

      let linked = false
      await act(async () => {
        linked = await result.current.linkKnowledge('agent-1', 'kb-1', 1, true)
      })

      expect(linked).toBe(true)
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/agents/agent-1/knowledge',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            knowledgeBaseId: 'kb-1',
            priority: 1,
            isRequired: true,
          }),
        }
      )
    })

    it('關聯失敗時應該返回 false', async () => {
      ;(global.fetch as any).mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: '知識庫不存在' }),
      })

      const { result } = renderHook(() => useAgentStore())

      let linked = false
      await act(async () => {
        linked = await result.current.linkKnowledge('agent-1', 'invalid-kb')
      })

      expect(linked).toBe(false)
      expect(result.current.error).toBe('知識庫不存在')
    })
  })

  describe('unlinkKnowledge() - 解除知識庫關聯', () => {
    it('應該成功解除知識庫關聯（軟刪除）', async () => {
      ;(global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: {} }),
      })

      const { result } = renderHook(() => useAgentStore())

      let unlinked = false
      await act(async () => {
        unlinked = await result.current.unlinkKnowledge('agent-1', 'kb-1')
      })

      expect(unlinked).toBe(true)
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/agents/agent-1/knowledge/kb-1',
        {
          method: 'DELETE',
        }
      )
    })

    it('應該成功解除知識庫關聯（硬刪除）', async () => {
      ;(global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: {} }),
      })

      const { result } = renderHook(() => useAgentStore())

      let unlinked = false
      await act(async () => {
        unlinked = await result.current.unlinkKnowledge('agent-1', 'kb-1', true)
      })

      expect(unlinked).toBe(true)
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/agents/agent-1/knowledge/kb-1?force=true',
        {
          method: 'DELETE',
        }
      )
    })

    it('解除關聯失敗時應該返回 false', async () => {
      ;(global.fetch as any).mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: '關聯不存在' }),
      })

      const { result } = renderHook(() => useAgentStore())

      let unlinked = false
      await act(async () => {
        unlinked = await result.current.unlinkKnowledge('agent-1', 'kb-1')
      })

      expect(unlinked).toBe(false)
      expect(result.current.error).toBe('關聯不存在')
    })
  })

  describe('setCurrentAgent() - 設定當前 Agent', () => {
    it('應該正確設定當前 Agent', () => {
      const { result } = renderHook(() => useAgentStore())

      act(() => {
        result.current.setCurrentAgent(mockAgent)
      })

      expect(result.current.currentAgent).toEqual(mockAgent)
    })

    it('應該能清除當前 Agent（設為 null）', () => {
      const { result } = renderHook(() => useAgentStore())

      act(() => {
        result.current.setCurrentAgent(mockAgent)
      })

      expect(result.current.currentAgent).toEqual(mockAgent)

      act(() => {
        result.current.setCurrentAgent(null)
      })

      expect(result.current.currentAgent).toBeNull()
    })
  })

  describe('clearError() - 清除錯誤訊息', () => {
    it('應該正確清除錯誤訊息', async () => {
      // 先產生一個錯誤
      ;(global.fetch as any).mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: '測試錯誤' }),
      })

      const { result } = renderHook(() => useAgentStore())

      await act(async () => {
        await result.current.loadAgents()
      })

      expect(result.current.error).toBe('載入 Agent 列表失敗')

      // 清除錯誤
      act(() => {
        result.current.clearError()
      })

      expect(result.current.error).toBeNull()
    })
  })

  describe('邊界情況與錯誤處理', () => {
    it('空的 Agent 列表應該正常處理', async () => {
      ;(global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: [] }),
      })

      const { result } = renderHook(() => useAgentStore())

      await act(async () => {
        await result.current.loadAgents()
      })

      expect(result.current.agents).toEqual([])
      expect(result.current.error).toBeNull()
    })

    it('API 返回格式錯誤時應該正常處理', async () => {
      ;(global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ invalidFormat: true }), // 缺少 success 和 agents
      })

      const { result } = renderHook(() => useAgentStore())

      await act(async () => {
        await result.current.loadAgents()
      })

      // 應該設定錯誤或保持空列表
      expect(result.current.agents).toEqual([])
    })

    it('連續呼叫應該正確處理', async () => {
      ;(global.fetch as any)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ data: [mockAgent] }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            data: [mockAgent, { ...mockAgent, id: 'agent-2' }],
          }),
        })

      const { result } = renderHook(() => useAgentStore())

      // 第一次呼叫
      await act(async () => {
        await result.current.loadAgents()
      })
      expect(result.current.agents).toHaveLength(1)

      // 第二次呼叫
      await act(async () => {
        await result.current.loadAgents()
      })
      expect(result.current.agents).toHaveLength(2)
    })
  })
})
