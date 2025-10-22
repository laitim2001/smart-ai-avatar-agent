/**
 * Prompt Template Types
 * Sprint 9: 對話主題 (Prompt 模板系統)
 */

export type PromptCategory =
  | 'learning'
  | 'work'
  | 'creative'
  | 'entertainment'
  | 'professional'
  | 'daily'

export type PromptTag =
  | 'professional'
  | 'creative'
  | 'technical'
  | 'casual'
  | 'educational'
  | 'business'
  | 'writing'
  | 'analysis'
  | 'brainstorm'
  | 'fun'

export type SortOption = 'popular' | 'title' | 'newest'

export interface PromptTemplate {
  id: string
  userId: string | null
  title: string
  description: string | null
  content: string
  category: PromptCategory
  tags: PromptTag[]
  isSystem: boolean
  featured: boolean
  popularity: number
  createdAt: string
  updatedAt: string
  user?: {
    id: string
    name: string | null
    email: string
  } | null
}

export interface PromptFilters {
  category: PromptCategory | 'all'
  tags: PromptTag[]
  search: string
  isSystem?: boolean
  featured?: boolean
  sort: SortOption
}

export interface PromptStats {
  total: number
  categoryStats: Array<{
    category: string
    count: number
  }>
  tagStats: Array<{
    tag: string
    count: number
  }>
}

export interface PromptsResponse {
  prompts: PromptTemplate[]
  stats: PromptStats
}
