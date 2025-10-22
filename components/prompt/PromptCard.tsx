'use client'

/**
 * PromptCard - Prompt 模板卡片組件
 * Sprint 9 Phase 2: PromptGallery 組件
 *
 * 功能:
 * - 顯示模板標題、描述、分類
 * - 顯示標籤、熱門度
 * - Featured 標記
 * - 系統/使用者模板標記
 * - 使用/預覽按鈕
 * - 響應式設計
 */

import { useTranslations } from 'next-intl'
import { Star, Sparkles, User, Crown } from 'lucide-react'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import type { PromptTemplate } from '@/types/prompt'

interface PromptCardProps {
  prompt: PromptTemplate
  onUse?: (prompt: PromptTemplate) => void
  onPreview?: (prompt: PromptTemplate) => void
}

export default function PromptCard({ prompt, onUse, onPreview }: PromptCardProps) {
  const t = useTranslations('prompt')

  const handleUse = () => {
    onUse?.(prompt)
  }

  const handlePreview = () => {
    onPreview?.(prompt)
  }

  return (
    <Card className="bg-slate-800 border-slate-700 hover:border-slate-600 transition-all duration-200 hover:shadow-xl group">
      <CardHeader className="relative">
        {/* Featured 標記 */}
        {prompt.featured && (
          <div className="absolute top-4 right-4">
            <Crown className="h-5 w-5 text-yellow-400" />
          </div>
        )}

        {/* 分類標籤 */}
        <div className="flex items-center gap-2 mb-2">
          <span className="px-2 py-1 text-xs font-medium bg-blue-500/20 text-blue-400 rounded">
            {t(`categories.${prompt.category}`)}
          </span>
          <span className="px-2 py-1 text-xs font-medium bg-slate-700 text-slate-300 rounded flex items-center gap-1">
            {prompt.isSystem ? (
              <>
                <Sparkles className="h-3 w-3" />
                {t('card.system')}
              </>
            ) : (
              <>
                <User className="h-3 w-3" />
                {t('card.user')}
              </>
            )}
          </span>
        </div>

        <CardTitle className="text-white text-lg group-hover:text-blue-400 transition-colors">
          {prompt.title}
        </CardTitle>

        {prompt.description && (
          <CardDescription className="text-slate-400 text-sm line-clamp-2">
            {prompt.description}
          </CardDescription>
        )}
      </CardHeader>

      <CardContent>
        {/* 標籤 */}
        <div className="flex flex-wrap gap-1.5 mb-3">
          {prompt.tags.map((tag) => (
            <span
              key={tag}
              className="px-2 py-0.5 text-xs bg-slate-700 text-slate-300 rounded"
            >
              {t(`tags.${tag}`)}
            </span>
          ))}
        </div>

        {/* 熱門度 */}
        <div className="flex items-center gap-1.5 text-sm text-slate-400">
          <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
          <span>
            {t('card.popularity')}: {prompt.popularity}
          </span>
        </div>
      </CardContent>

      <CardFooter className="flex gap-2">
        <Button
          onClick={handleUse}
          className="flex-1 bg-blue-500 hover:bg-blue-600 text-white"
        >
          {t('actions.use')}
        </Button>
        <Button
          variant="outline"
          onClick={handlePreview}
          className="flex-1 bg-slate-700 border-slate-600 text-slate-300 hover:bg-slate-600"
        >
          {t('actions.preview')}
        </Button>
      </CardFooter>
    </Card>
  )
}
