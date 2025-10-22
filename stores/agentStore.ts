/**
 * Agent 狀態管理 Store
 * @module stores/agentStore
 * @description 使用 Zustand 管理 AI Agent 狀態（選擇、列表、編輯）
 */

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

/**
 * Agent 基本資訊
 */
export interface Agent {
  id: string
  name: string
  description: string
  category: string
  isSystem: boolean
  isPublic: boolean
  primaryLanguage: string
  supportedLanguages: string[]
  persona?: {
    id: string
    name: string
    role: string
    language: string
    tone: string
    capabilities: string[]
  }
  avatar?: {
    id: string
    name: string
    modelUrl: string
  }
  knowledgeBasesCount?: number
  conversationsCount?: number
  popularity?: number
  usageCount?: number
  createdAt?: string
  updatedAt?: string
}

/**
 * Agent 詳細資訊（包含知識庫）
 */
export interface AgentDetail extends Agent {
  knowledgeBases?: Array<{
    id: string
    name: string
    description: string
    type: string
    category: string
    language: string
    priority: number
    isRequired: boolean
    contentLength: number
  }>
}

/**
 * Agent Store 介面
 */
export interface AgentStore {
  // State
  currentAgent: Agent | null
  agents: Agent[]
  isLoading: boolean
  error: string | null
  filters: {
    category?: string
    isPublic?: boolean
    search?: string
  }

  // Actions - Agent Selection
  setCurrentAgent: (agent: Agent | null) => void
  loadAgentDetail: (agentId: string) => Promise<AgentDetail | null>

  // Actions - Agent List
  loadAgents: (filters?: {
    isSystem?: boolean
    isPublic?: boolean
    category?: string
    userId?: string
  }) => Promise<void>
  setFilters: (filters: Partial<AgentStore['filters']>) => void
  clearFilters: () => void

  // Actions - Agent CRUD
  createAgent: (data: {
    name: string
    description: string
    category: string
    personaId: string
    avatarId?: string
    primaryLanguage?: string
    supportedLanguages?: string[]
    isPublic?: boolean
  }) => Promise<Agent | null>

  updateAgent: (
    agentId: string,
    data: Partial<{
      name: string
      description: string
      category: string
      personaId: string
      avatarId: string
      primaryLanguage: string
      supportedLanguages: string[]
      isPublic: boolean
      isActive: boolean
    }>
  ) => Promise<Agent | null>

  deleteAgent: (agentId: string, force?: boolean) => Promise<boolean>

  // Actions - Knowledge Management
  linkKnowledge: (
    agentId: string,
    knowledgeBaseId: string,
    priority?: number,
    isRequired?: boolean
  ) => Promise<boolean>

  unlinkKnowledge: (
    agentId: string,
    knowledgeBaseId: string,
    force?: boolean
  ) => Promise<boolean>

  updateKnowledgeLink: (
    agentId: string,
    knowledgeBaseId: string,
    data: {
      priority?: number
      isRequired?: boolean
    }
  ) => Promise<boolean>

  // Utility
  clearError: () => void
  reset: () => void
}

/**
 * Agent Store Hook
 */
export const useAgentStore = create<AgentStore>()(
  persist(
    (set, get) => ({
      // Initial State
      currentAgent: null,
      agents: [],
      isLoading: false,
      error: null,
      filters: {},

      // Actions - Agent Selection
      setCurrentAgent: (agent) => {
        set({ currentAgent: agent })
      },

      loadAgentDetail: async (agentId: string) => {
        try {
          set({ isLoading: true, error: null })

          const response = await fetch(`/api/agents/${agentId}`)

          if (!response.ok) {
            const errorData = await response.json()
            throw new Error(errorData.error || 'Failed to load agent detail')
          }

          const data = await response.json()
          const agentDetail: AgentDetail = data.data

          // 更新 currentAgent 如果是同一個
          const { currentAgent } = get()
          if (currentAgent?.id === agentId) {
            set({ currentAgent: agentDetail })
          }

          set({ isLoading: false })
          return agentDetail
        } catch (error) {
          console.error('[loadAgentDetail Error]', error)
          set({
            error: '載入 Agent 詳細資料失敗',
            isLoading: false,
          })
          return null
        }
      },

      // Actions - Agent List
      loadAgents: async (filters) => {
        try {
          set({ isLoading: true, error: null })

          // 建構查詢參數
          const params = new URLSearchParams()
          if (filters?.isSystem !== undefined)
            params.append('isSystem', String(filters.isSystem))
          if (filters?.isPublic !== undefined)
            params.append('isPublic', String(filters.isPublic))
          if (filters?.category) params.append('category', filters.category)
          if (filters?.userId) params.append('userId', filters.userId)

          const queryString = params.toString()
          const url = `/api/agents${queryString ? `?${queryString}` : ''}`

          const response = await fetch(url)

          if (!response.ok) {
            const errorData = await response.json()
            throw new Error(errorData.error || 'Failed to load agents')
          }

          const data = await response.json()
          const agents: Agent[] = data.data || []

          set({ agents, isLoading: false })
        } catch (error) {
          console.error('[loadAgents Error]', error)
          set({
            error: '載入 Agent 列表失敗',
            isLoading: false,
            agents: [],
          })
        }
      },

      setFilters: (newFilters) => {
        set((state) => ({
          filters: { ...state.filters, ...newFilters },
        }))
      },

      clearFilters: () => {
        set({ filters: {} })
      },

      // Actions - Agent CRUD
      createAgent: async (data) => {
        try {
          set({ isLoading: true, error: null })

          const response = await fetch('/api/agents', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
          })

          if (!response.ok) {
            const errorData = await response.json()
            throw new Error(errorData.error || 'Failed to create agent')
          }

          const result = await response.json()
          const newAgent: Agent = result.data

          // 添加到列表
          set((state) => ({
            agents: [newAgent, ...state.agents],
            isLoading: false,
          }))

          return newAgent
        } catch (error) {
          console.error('[createAgent Error]', error)
          set({
            error: '建立 Agent 失敗',
            isLoading: false,
          })
          return null
        }
      },

      updateAgent: async (agentId, data) => {
        try {
          set({ isLoading: true, error: null })

          const response = await fetch(`/api/agents/${agentId}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
          })

          if (!response.ok) {
            const errorData = await response.json()
            throw new Error(errorData.error || 'Failed to update agent')
          }

          const result = await response.json()
          const updatedAgent: Agent = result.data

          // 更新列表和 currentAgent
          set((state) => ({
            agents: state.agents.map((agent) =>
              agent.id === agentId ? updatedAgent : agent
            ),
            currentAgent:
              state.currentAgent?.id === agentId
                ? updatedAgent
                : state.currentAgent,
            isLoading: false,
          }))

          return updatedAgent
        } catch (error) {
          console.error('[updateAgent Error]', error)
          set({
            error: error instanceof Error ? error.message : 'Unknown error',
            isLoading: false,
          })
          return null
        }
      },

      deleteAgent: async (agentId, force = false) => {
        try {
          set({ isLoading: true, error: null })

          const url = force
            ? `/api/agents/${agentId}?force=true`
            : `/api/agents/${agentId}`

          const response = await fetch(url, {
            method: 'DELETE',
          })

          if (!response.ok) {
            const errorData = await response.json()
            throw new Error(errorData.error || 'Failed to delete agent')
          }

          // 從列表移除
          set((state) => ({
            agents: state.agents.filter((agent) => agent.id !== agentId),
            currentAgent:
              state.currentAgent?.id === agentId ? null : state.currentAgent,
            isLoading: false,
          }))

          return true
        } catch (error) {
          console.error('[deleteAgent Error]', error)
          set({
            error: error instanceof Error ? error.message : 'Unknown error',
            isLoading: false,
          })
          return false
        }
      },

      // Actions - Knowledge Management
      linkKnowledge: async (agentId, knowledgeBaseId, priority, isRequired) => {
        try {
          set({ error: null })

          const response = await fetch(`/api/agents/${agentId}/knowledge`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              knowledgeBaseId,
              priority: priority ?? 100,
              isRequired: isRequired ?? false,
            }),
          })

          if (!response.ok) {
            const errorData = await response.json()
            throw new Error(errorData.error || 'Failed to link knowledge')
          }

          return true
        } catch (error) {
          console.error('[linkKnowledge Error]', error)
          set({
            error: error instanceof Error ? error.message : 'Unknown error',
          })
          return false
        }
      },

      unlinkKnowledge: async (agentId, knowledgeBaseId, force = false) => {
        try {
          set({ error: null })

          const url = force
            ? `/api/agents/${agentId}/knowledge/${knowledgeBaseId}?force=true`
            : `/api/agents/${agentId}/knowledge/${knowledgeBaseId}`

          const response = await fetch(url, {
            method: 'DELETE',
          })

          if (!response.ok) {
            const errorData = await response.json()
            throw new Error(errorData.error || 'Failed to unlink knowledge')
          }

          return true
        } catch (error) {
          console.error('[unlinkKnowledge Error]', error)
          set({
            error: error instanceof Error ? error.message : 'Unknown error',
          })
          return false
        }
      },

      updateKnowledgeLink: async (agentId, knowledgeBaseId, data) => {
        try {
          set({ error: null })

          const response = await fetch(
            `/api/agents/${agentId}/knowledge/${knowledgeBaseId}`,
            {
              method: 'PUT',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(data),
            }
          )

          if (!response.ok) {
            const errorData = await response.json()
            throw new Error(
              errorData.error || 'Failed to update knowledge link'
            )
          }

          return true
        } catch (error) {
          console.error('[updateKnowledgeLink Error]', error)
          set({
            error: error instanceof Error ? error.message : 'Unknown error',
          })
          return false
        }
      },

      // Utility
      clearError: () => {
        set({ error: null })
      },

      reset: () => {
        set({
          currentAgent: null,
          agents: [],
          isLoading: false,
          error: null,
          filters: {},
        })
      },
    }),
    {
      name: 'agent-storage',
      // 只持久化 currentAgent，agents 和 filters 每次重新載入
      partialize: (state) => ({
        currentAgent: state.currentAgent,
      }),
    }
  )
)
