'use client'

/**
 * PromptGallery - Prompt 模板畫廊主組件
 * Sprint 9 Phase 2: PromptGallery 組件
 *
 * 功能:
 * - 顯示模板列表 (網格佈局)
 * - 整合篩選器
 * - 整合 API 與 Zustand Store
 * - 載入狀態
 * - 空狀態
 * - 錯誤處理
 * - 響應式設計
 */

import { useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { Loader2, AlertCircle } from 'lucide-react'
import { usePromptStore } from '@/stores/promptStore'
import PromptFilters from './PromptFilters'
import PromptCard from './PromptCard'
import type { PromptTemplate } from '@/types/prompt'

interface PromptGalleryProps {
  onSelectPrompt?: (prompt: PromptTemplate) => void
}

export default function PromptGallery({ onSelectPrompt }: PromptGalleryProps) {
  const t = useTranslations('prompt')
  const tCommon = useTranslations('common')

  const { prompts, loading, error, filters, fetchPrompts, setSelectedPrompt } =
    usePromptStore()

  // 初始載入與篩選變更時重新取得資料
  useEffect(() => {
    fetchPrompts()
  }, [filters, fetchPrompts])

  const handleUsePrompt = (prompt: PromptTemplate) => {
    setSelectedPrompt(prompt)
    onSelectPrompt?.(prompt)
  }

  const handlePreviewPrompt = (prompt: PromptTemplate) => {
    setSelectedPrompt(prompt)
    // TODO: Phase 3 - Open PromptPreviewModal
    console.log('[PromptGallery] Preview:', prompt.title)
  }

  // 載入狀態
  if (loading && prompts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 space-y-4">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
        <p className="text-slate-400">{tCommon('button.loading')}</p>
      </div>
    )
  }

  // 錯誤狀態
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12 space-y-4">
        <AlertCircle className="h-12 w-12 text-red-500" />
        <p className="text-red-400">{error}</p>
        <button
          onClick={() => fetchPrompts()}
          className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md transition-colors"
        >
          {tCommon('button.retry')}
        </button>
      </div>
    )
  }

  // 空狀態 (無結果)
  if (prompts.length === 0) {
    return (
      <div className="space-y-6">
        <PromptFilters />
        <div className="flex flex-col items-center justify-center py-12 space-y-4">
          <div className="text-center space-y-2">
            <h3 className="text-xl font-semibold text-white">{t('empty.title')}</h3>
            <p className="text-slate-400">{t('noResults')}</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* 篩選器 */}
      <PromptFilters />

      {/* 統計資訊 */}
      <div className="flex items-center justify-between px-2">
        <p className="text-sm text-slate-400">
          {t('resultsCount', { count: prompts.length })}
        </p>
        {loading && (
          <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
        )}
      </div>

      {/* 模板網格 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {prompts.map((prompt) => (
          <PromptCard
            key={prompt.id}
            prompt={prompt}
            onUse={handleUsePrompt}
            onPreview={handlePreviewPrompt}
          />
        ))}
      </div>
    </div>
  )
}
