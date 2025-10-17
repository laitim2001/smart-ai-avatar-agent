/**
 * Prompt Template API Client
 * Sprint 9 Phase 3: PromptEditor 組件
 *
 * 提供 CRUD 操作的 API 客戶端函數
 */

import type { PromptTemplate } from '@/types/prompt'
import type { CreatePromptInput, UpdatePromptInput } from './validation'

/**
 * 建立新的 Prompt Template
 */
export async function createPrompt(
  data: CreatePromptInput
): Promise<PromptTemplate> {
  const response = await fetch('/api/prompts', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to create prompt')
  }

  return await response.json()
}

/**
 * 更新現有的 Prompt Template
 */
export async function updatePrompt(
  id: string,
  data: UpdatePromptInput
): Promise<PromptTemplate> {
  const response = await fetch(`/api/prompts/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to update prompt')
  }

  return await response.json()
}

/**
 * 刪除 Prompt Template
 */
export async function deletePrompt(id: string): Promise<void> {
  const response = await fetch(`/api/prompts/${id}`, {
    method: 'DELETE',
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to delete prompt')
  }
}

/**
 * 取得單個 Prompt Template
 */
export async function getPrompt(id: string): Promise<PromptTemplate> {
  const response = await fetch(`/api/prompts/${id}`)

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to fetch prompt')
  }

  return await response.json()
}
