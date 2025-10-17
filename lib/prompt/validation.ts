/**
 * Prompt Template Validation Schemas
 * Sprint 9 Phase 3: PromptEditor 組件
 *
 * 使用 Zod 進行表單驗證
 */

import { z } from 'zod'
import type { PromptCategory, PromptTag } from '@/types/prompt'

// 可用的分類
export const PROMPT_CATEGORIES: PromptCategory[] = [
  'learning',
  'work',
  'creative',
  'entertainment',
  'professional',
  'daily',
]

// 可用的標籤
export const PROMPT_TAGS: PromptTag[] = [
  'professional',
  'creative',
  'technical',
  'casual',
  'educational',
  'business',
  'writing',
  'analysis',
  'brainstorm',
  'fun',
]

// 建立 Prompt Template 的驗證 Schema
export const createPromptSchema = z.object({
  title: z
    .string()
    .min(1, '標題不能為空')
    .max(100, '標題最多 100 字元'),
  description: z
    .string()
    .max(500, '描述最多 500 字元')
    .optional()
    .or(z.literal('')),
  content: z
    .string()
    .min(10, '內容至少 10 字元')
    .max(5000, '內容最多 5000 字元'),
  category: z.enum([
    'learning',
    'work',
    'creative',
    'entertainment',
    'professional',
    'daily',
  ] as const, {
    errorMap: () => ({ message: '請選擇有效的分類' }),
  }),
  tags: z
    .array(
      z.enum([
        'professional',
        'creative',
        'technical',
        'casual',
        'educational',
        'business',
        'writing',
        'analysis',
        'brainstorm',
        'fun',
      ] as const)
    )
    .min(1, '請至少選擇一個標籤')
    .max(5, '最多選擇 5 個標籤'),
})

// 更新 Prompt Template 的驗證 Schema (所有欄位都是 optional)
export const updatePromptSchema = z.object({
  title: z
    .string()
    .min(1, '標題不能為空')
    .max(100, '標題最多 100 字元')
    .optional(),
  description: z
    .string()
    .max(500, '描述最多 500 字元')
    .optional()
    .or(z.literal('')),
  content: z
    .string()
    .min(10, '內容至少 10 字元')
    .max(5000, '內容最多 5000 字元')
    .optional(),
  category: z
    .enum([
      'learning',
      'work',
      'creative',
      'entertainment',
      'professional',
      'daily',
    ] as const)
    .optional(),
  tags: z
    .array(
      z.enum([
        'professional',
        'creative',
        'technical',
        'casual',
        'educational',
        'business',
        'writing',
        'analysis',
        'brainstorm',
        'fun',
      ] as const)
    )
    .min(1, '請至少選擇一個標籤')
    .max(5, '最多選擇 5 個標籤')
    .optional(),
})

// 類型推導
export type CreatePromptInput = z.infer<typeof createPromptSchema>
export type UpdatePromptInput = z.infer<typeof updatePromptSchema>
