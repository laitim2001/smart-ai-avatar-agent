/**
 * Prompt Store - Zustand State Management
 * Sprint 9: 對話主題 (Prompt 模板系統)
 *
 * 管理 Prompt Template 的狀態:
 * - 模板列表與篩選
 * - 搜尋與排序
 * - API 整合
 * - 選擇狀態
 */

import { create } from 'zustand'
import type {
  PromptTemplate,
  PromptFilters,
  PromptStats,
  PromptCategory,
  PromptTag,
  SortOption,
} from '@/types/prompt'

interface PromptStore {
  // State
  prompts: PromptTemplate[]
  stats: PromptStats | null
  filters: PromptFilters
  loading: boolean
  error: string | null
  selectedPrompt: PromptTemplate | null

  // Actions
  setPrompts: (prompts: PromptTemplate[]) => void
  setStats: (stats: PromptStats) => void
  setFilters: (filters: Partial<PromptFilters>) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  setSelectedPrompt: (prompt: PromptTemplate | null) => void
  resetFilters: () => void

  // API Actions
  fetchPrompts: () => Promise<void>
  selectPrompt: (promptId: string) => void
  applyPrompt: (prompt: PromptTemplate) => void
}

const defaultFilters: PromptFilters = {
  category: 'all',
  tags: [],
  search: '',
  sort: 'popular',
}

export const usePromptStore = create<PromptStore>((set, get) => ({
  // Initial State
  prompts: [],
  stats: null,
  filters: defaultFilters,
  loading: false,
  error: null,
  selectedPrompt: null,

  // Setters
  setPrompts: (prompts) => set({ prompts }),
  setStats: (stats) => set({ stats }),
  setFilters: (newFilters) =>
    set((state) => ({
      filters: { ...state.filters, ...newFilters },
    })),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  setSelectedPrompt: (prompt) => set({ selectedPrompt: prompt }),
  resetFilters: () => set({ filters: defaultFilters }),

  // Fetch Prompts from API
  fetchPrompts: async () => {
    const { filters, setLoading, setError, setPrompts, setStats } = get()

    try {
      setLoading(true)
      setError(null)

      // Build query parameters
      const params = new URLSearchParams()

      if (filters.category !== 'all') {
        params.append('category', filters.category)
      }

      if (filters.tags.length > 0) {
        params.append('tags', filters.tags.join(','))
      }

      if (filters.search) {
        params.append('search', filters.search)
      }

      if (filters.isSystem !== undefined) {
        params.append('isSystem', String(filters.isSystem))
      }

      if (filters.featured) {
        params.append('featured', 'true')
      }

      params.append('sort', filters.sort)

      // Fetch data
      const response = await fetch(`/api/prompts?${params.toString()}`)

      if (!response.ok) {
        throw new Error('Failed to fetch prompts')
      }

      const data = await response.json()

      setPrompts(data.prompts)
      setStats(data.stats)
    } catch (error) {
      console.error('[PromptStore] Fetch error:', error)
      setError(error instanceof Error ? error.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  },

  // Select a prompt (for preview or details)
  selectPrompt: (promptId: string) => {
    const { prompts } = get()
    const prompt = prompts.find((p) => p.id === promptId)
    set({ selectedPrompt: prompt || null })
  },

  // Apply a prompt to chat (placeholder for Phase 4 integration)
  applyPrompt: (prompt: PromptTemplate) => {
    console.log('[PromptStore] Apply prompt:', prompt.title)
    // TODO: Phase 4 - Integrate with ChatStore
    set({ selectedPrompt: prompt })
  },
}))
