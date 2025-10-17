'use client'

/**
 * Prompts Gallery Page
 * Sprint 9 Phase 2: PromptGallery 組件測試頁面
 *
 * 路徑: /prompts
 * 功能: 顯示所有 Prompt 模板,支援篩選、搜尋、排序
 */

import { useTranslations } from 'next-intl'
import PromptGallery from '@/components/prompt/PromptGallery'
import type { PromptTemplate } from '@/types/prompt'

export default function PromptsPage() {
  const t = useTranslations('prompt')

  const handleSelectPrompt = (prompt: PromptTemplate) => {
    console.log('[PromptsPage] Selected prompt:', prompt.title)
    // TODO: Phase 4 - Integrate with ChatInterface
    alert(`準備使用主題: ${prompt.title}`)
  }

  return (
    <div className="min-h-screen bg-slate-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-white">{t('gallery')}</h1>
          <p className="text-slate-400">{t('title')}</p>
        </div>

        {/* Gallery */}
        <PromptGallery onSelectPrompt={handleSelectPrompt} />
      </div>
    </div>
  )
}
