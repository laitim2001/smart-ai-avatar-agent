'use client'

/**
 * PromptFilters - Prompt 模板篩選器組件
 * Sprint 9 Phase 2: PromptGallery 組件
 *
 * 功能:
 * - 分類篩選 (6 種分類 + 全部)
 * - 標籤過濾 (多選)
 * - 搜尋功能
 * - 排序選項
 * - 多語言支援 (next-intl)
 */

import { useTranslations } from 'next-intl'
import { Search, X } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { usePromptStore } from '@/stores/promptStore'
import type { PromptCategory, PromptTag, SortOption } from '@/types/prompt'

const CATEGORIES: Array<PromptCategory | 'all'> = [
  'all',
  'learning',
  'work',
  'creative',
  'entertainment',
  'professional',
  'daily',
]

const TAGS: PromptTag[] = [
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

const SORT_OPTIONS: SortOption[] = ['popular', 'title', 'newest']

export default function PromptFilters() {
  const t = useTranslations('prompt')
  const { filters, setFilters, resetFilters } = usePromptStore()

  const handleCategoryChange = (category: string) => {
    setFilters({ category: category as PromptCategory | 'all' })
  }

  const handleTagToggle = (tag: PromptTag) => {
    const newTags = filters.tags.includes(tag)
      ? filters.tags.filter((t) => t !== tag)
      : [...filters.tags, tag]

    setFilters({ tags: newTags })
  }

  const handleSearchChange = (value: string) => {
    setFilters({ search: value })
  }

  const handleSortChange = (sort: string) => {
    setFilters({ sort: sort as SortOption })
  }

  const handleClearFilters = () => {
    resetFilters()
  }

  const hasActiveFilters =
    filters.category !== 'all' ||
    filters.tags.length > 0 ||
    filters.search.length > 0

  return (
    <div className="space-y-4 p-4 bg-slate-800 rounded-lg border border-slate-700">
      {/* 搜尋欄位 */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        <Input
          type="text"
          placeholder={t('search')}
          value={filters.search}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="pl-10 bg-slate-700 border-slate-600 text-white placeholder:text-slate-400"
        />
      </div>

      {/* 分類篩選 */}
      <div>
        <label className="text-sm font-medium text-slate-300 mb-2 block">
          {t('categories.all')}
        </label>
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((category) => (
            <button
              key={category}
              onClick={() => handleCategoryChange(category)}
              className={`
                px-3 py-1.5 rounded-md text-sm font-medium transition-colors
                ${
                  filters.category === category
                    ? 'bg-blue-500 text-white'
                    : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                }
              `}
            >
              {t(`categories.${category}`)}
            </button>
          ))}
        </div>
      </div>

      {/* 標籤過濾 */}
      <div>
        <label className="text-sm font-medium text-slate-300 mb-2 block">
          {t('card.tags')}
        </label>
        <div className="flex flex-wrap gap-2">
          {TAGS.map((tag) => {
            const isSelected = filters.tags.includes(tag)
            return (
              <button
                key={tag}
                onClick={() => handleTagToggle(tag)}
                className={`
                  px-3 py-1.5 rounded-md text-sm font-medium transition-colors
                  ${
                    isSelected
                      ? 'bg-green-500 text-white'
                      : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                  }
                `}
              >
                {t(`tags.${tag}`)}
              </button>
            )
          })}
        </div>
      </div>

      {/* 排序與清除 */}
      <div className="flex items-center gap-3">
        <div className="flex-1">
          <label className="text-sm font-medium text-slate-300 mb-2 block">
            {t('sort.label')}
          </label>
          <Select value={filters.sort} onValueChange={handleSortChange}>
            <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-slate-700 border-slate-600">
              {SORT_OPTIONS.map((option) => (
                <SelectItem key={option} value={option} className="text-white">
                  {t(`sort.${option}`)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {hasActiveFilters && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleClearFilters}
            className="mt-8 bg-slate-700 border-slate-600 text-slate-300 hover:bg-slate-600"
          >
            <X className="h-4 w-4 mr-2" />
            {t('button.clear', { ns: 'common' })}
          </Button>
        )}
      </div>
    </div>
  )
}
