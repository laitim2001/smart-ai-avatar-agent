'use client'

/**
 * PromptEditor - Prompt 模板編輯器組件
 * Sprint 9 Phase 3: PromptEditor 組件
 *
 * 功能:
 * - 建立新模板
 * - 編輯現有模板
 * - 表單驗證 (Zod)
 * - 分類與標籤選擇
 * - 預覽功能
 * - 錯誤處理
 */

import { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { Loader2, Save, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  createPromptSchema,
  PROMPT_CATEGORIES,
  PROMPT_TAGS,
  type CreatePromptInput,
} from '@/lib/prompt/validation'
import { createPrompt, updatePrompt } from '@/lib/prompt/api'
import type { PromptTemplate, PromptCategory, PromptTag } from '@/types/prompt'

interface PromptEditorProps {
  mode: 'create' | 'edit'
  prompt?: PromptTemplate
  onSuccess?: (prompt: PromptTemplate) => void
  onCancel?: () => void
}

export default function PromptEditor({
  mode,
  prompt,
  onSuccess,
  onCancel,
}: PromptEditorProps) {
  const t = useTranslations('prompt')
  const tCommon = useTranslations('common')

  // 表單狀態
  const [formData, setFormData] = useState<CreatePromptInput>({
    title: prompt?.title || '',
    description: prompt?.description || '',
    content: prompt?.content || '',
    category: prompt?.category || 'learning',
    tags: prompt?.tags || [],
  })

  // UI 狀態
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  // 編輯模式下,更新初始值
  useEffect(() => {
    if (mode === 'edit' && prompt) {
      setFormData({
        title: prompt.title,
        description: prompt.description || '',
        content: prompt.content,
        category: prompt.category,
        tags: prompt.tags,
      })
    }
  }, [mode, prompt])

  // 處理標籤選擇
  const handleTagToggle = (tag: PromptTag) => {
    setFormData((prev) => {
      const newTags = prev.tags.includes(tag)
        ? prev.tags.filter((t) => t !== tag)
        : [...prev.tags, tag]

      return { ...prev, tags: newTags }
    })
  }

  // 表單驗證
  const validateForm = (): boolean => {
    try {
      createPromptSchema.parse(formData)
      setErrors({})
      return true
    } catch (error: any) {
      const newErrors: Record<string, string> = {}
      error.errors?.forEach((err: any) => {
        const path = err.path.join('.')
        newErrors[path] = err.message
      })
      setErrors(newErrors)
      return false
    }
  }

  // 提交表單
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    try {
      setLoading(true)
      setErrors({})

      let result: PromptTemplate

      if (mode === 'create') {
        result = await createPrompt(formData)
      } else if (prompt) {
        result = await updatePrompt(prompt.id, formData)
      } else {
        throw new Error('No prompt ID provided for edit mode')
      }

      onSuccess?.(result)
    } catch (error: any) {
      setErrors({ submit: error.message || 'Failed to save prompt' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 p-6 bg-slate-800 rounded-lg">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">
          {mode === 'create' ? t('actions.create') : t('actions.edit')}
        </h2>
        {onCancel && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onCancel}
            className="text-slate-400 hover:text-white"
          >
            <X className="h-5 w-5" />
          </Button>
        )}
      </div>

      {/* 標題 */}
      <div className="space-y-2">
        <Label htmlFor="title" className="text-slate-300">
          {t('form.title')} <span className="text-red-400">*</span>
        </Label>
        <Input
          id="title"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          placeholder={t('form.titlePlaceholder')}
          className="bg-slate-700 border-slate-600 text-white"
          disabled={loading}
        />
        {errors.title && (
          <p className="text-sm text-red-400">{errors.title}</p>
        )}
      </div>

      {/* 描述 */}
      <div className="space-y-2">
        <Label htmlFor="description" className="text-slate-300">
          {t('form.description')}
        </Label>
        <Input
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder={t('form.descriptionPlaceholder')}
          className="bg-slate-700 border-slate-600 text-white"
          disabled={loading}
        />
        {errors.description && (
          <p className="text-sm text-red-400">{errors.description}</p>
        )}
      </div>

      {/* 內容 */}
      <div className="space-y-2">
        <Label htmlFor="content" className="text-slate-300">
          {t('form.content')} <span className="text-red-400">*</span>
        </Label>
        <textarea
          id="content"
          value={formData.content}
          onChange={(e) => setFormData({ ...formData, content: e.target.value })}
          placeholder={t('form.contentPlaceholder')}
          rows={8}
          className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={loading}
        />
        <p className="text-xs text-slate-400">
          {formData.content.length} / 5000 {t('form.characters')}
        </p>
        {errors.content && (
          <p className="text-sm text-red-400">{errors.content}</p>
        )}
      </div>

      {/* 分類 */}
      <div className="space-y-2">
        <Label className="text-slate-300">
          {t('form.category')} <span className="text-red-400">*</span>
        </Label>
        <Select
          value={formData.category}
          onValueChange={(value) =>
            setFormData({ ...formData, category: value as PromptCategory })
          }
          disabled={loading}
        >
          <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-slate-700 border-slate-600">
            {PROMPT_CATEGORIES.map((category) => (
              <SelectItem key={category} value={category} className="text-white">
                {t(`categories.${category}`)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.category && (
          <p className="text-sm text-red-400">{errors.category}</p>
        )}
      </div>

      {/* 標籤 */}
      <div className="space-y-2">
        <Label className="text-slate-300">
          {t('form.tags')} <span className="text-red-400">*</span>
        </Label>
        <p className="text-xs text-slate-400">{t('form.tagsHint')}</p>
        <div className="flex flex-wrap gap-3">
          {PROMPT_TAGS.map((tag) => {
            const isSelected = formData.tags.includes(tag)
            return (
              <div key={tag} className="flex items-center space-x-2">
                <Checkbox
                  id={tag}
                  checked={isSelected}
                  onCheckedChange={() => handleTagToggle(tag)}
                  disabled={loading}
                  className="border-slate-600"
                />
                <label
                  htmlFor={tag}
                  className="text-sm text-slate-300 cursor-pointer"
                >
                  {t(`tags.${tag}`)}
                </label>
              </div>
            )
          })}
        </div>
        {errors.tags && (
          <p className="text-sm text-red-400">{errors.tags}</p>
        )}
      </div>

      {/* 錯誤訊息 */}
      {errors.submit && (
        <div className="p-4 bg-red-500/10 border border-red-500 rounded-md">
          <p className="text-sm text-red-400">{errors.submit}</p>
        </div>
      )}

      {/* 按鈕 */}
      <div className="flex gap-3">
        <Button
          type="submit"
          disabled={loading}
          className="flex-1 bg-blue-500 hover:bg-blue-600"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              {tCommon('button.loading')}
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              {tCommon('button.save')}
            </>
          )}
        </Button>
        {onCancel && (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={loading}
            className="bg-slate-700 border-slate-600 text-slate-300"
          >
            {tCommon('button.cancel')}
          </Button>
        )}
      </div>
    </form>
  )
}
