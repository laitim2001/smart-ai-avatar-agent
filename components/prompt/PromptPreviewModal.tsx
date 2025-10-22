'use client'

/**
 * PromptPreviewModal - Prompt 模板預覽 Modal
 * Sprint 9 Phase 3: PromptEditor 組件
 *
 * 功能:
 * - 顯示完整模板內容
 * - 顯示元數據 (分類、標籤、熱門度)
 * - 使用/編輯/刪除按鈕
 * - 系統模板禁止編輯/刪除
 */

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { X, Star, Sparkles, User, Trash2, Edit, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import type { PromptTemplate } from '@/types/prompt'
import { deletePrompt } from '@/lib/prompt/api'

interface PromptPreviewModalProps {
  prompt: PromptTemplate | null
  open: boolean
  onClose: () => void
  onUse?: (prompt: PromptTemplate) => void
  onEdit?: (prompt: PromptTemplate) => void
  onDelete?: (promptId: string) => void
}

export default function PromptPreviewModal({
  prompt,
  open,
  onClose,
  onUse,
  onEdit,
  onDelete,
}: PromptPreviewModalProps) {
  const t = useTranslations('prompt')
  const tCommon = useTranslations('common')

  const [deleting, setDeleting] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  if (!prompt) return null

  const handleUse = () => {
    onUse?.(prompt)
    onClose()
  }

  const handleEdit = () => {
    onEdit?.(prompt)
    onClose()
  }

  const handleDelete = async () => {
    if (!showDeleteConfirm) {
      setShowDeleteConfirm(true)
      return
    }

    try {
      setDeleting(true)
      await deletePrompt(prompt.id)
      onDelete?.(prompt.id)
      onClose()
    } catch (error) {
      console.error('[PromptPreviewModal] Delete error:', error)
      alert('刪除失敗,請稍後再試')
    } finally {
      setDeleting(false)
      setShowDeleteConfirm(false)
    }
  }

  const canEdit = !prompt.isSystem
  const canDelete = !prompt.isSystem

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto bg-slate-800 border-slate-700">
        <DialogHeader>
          {/* 標題與關閉按鈕 */}
          <div className="flex items-start justify-between">
            <div className="flex-1 space-y-2">
              <DialogTitle className="text-2xl font-bold text-white">
                {prompt.title}
              </DialogTitle>
              {prompt.description && (
                <DialogDescription className="text-slate-400">
                  {prompt.description}
                </DialogDescription>
              )}
            </div>
          </div>

          {/* 元數據標籤 */}
          <div className="flex flex-wrap gap-2 pt-4">
            {/* 分類 */}
            <span className="px-3 py-1 text-sm font-medium bg-blue-500/20 text-blue-400 rounded">
              {t(`categories.${prompt.category}`)}
            </span>

            {/* 系統/使用者 */}
            <span className="px-3 py-1 text-sm font-medium bg-slate-700 text-slate-300 rounded flex items-center gap-1.5">
              {prompt.isSystem ? (
                <>
                  <Sparkles className="h-3.5 w-3.5" />
                  {t('card.system')}
                </>
              ) : (
                <>
                  <User className="h-3.5 w-3.5" />
                  {t('card.user')}
                </>
              )}
            </span>

            {/* 熱門度 */}
            <span className="px-3 py-1 text-sm font-medium bg-slate-700 text-slate-300 rounded flex items-center gap-1.5">
              <Star className="h-3.5 w-3.5 text-yellow-400 fill-yellow-400" />
              {prompt.popularity}
            </span>
          </div>
        </DialogHeader>

        {/* 內容 */}
        <div className="space-y-6 py-4">
          {/* Prompt 內容 */}
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-slate-300">
              {t('form.content')}
            </h3>
            <div className="p-4 bg-slate-900 rounded-lg border border-slate-700">
              <pre className="whitespace-pre-wrap text-sm text-slate-300 font-mono">
                {prompt.content}
              </pre>
            </div>
          </div>

          {/* 標籤 */}
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-slate-300">
              {t('card.tags')}
            </h3>
            <div className="flex flex-wrap gap-2">
              {prompt.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-3 py-1 text-sm bg-slate-700 text-slate-300 rounded"
                >
                  {t(`tags.${tag}`)}
                </span>
              ))}
            </div>
          </div>

          {/* 作者資訊 (使用者模板才顯示) */}
          {prompt.user && (
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-slate-300">作者</h3>
              <p className="text-sm text-slate-400">
                {prompt.user.name || prompt.user.email}
              </p>
            </div>
          )}
        </div>

        {/* 按鈕 */}
        <div className="flex gap-3 pt-4 border-t border-slate-700">
          {/* 使用按鈕 */}
          <Button
            onClick={handleUse}
            className="flex-1 bg-blue-500 hover:bg-blue-600 text-white"
          >
            <Check className="h-4 w-4 mr-2" />
            {t('actions.use')}
          </Button>

          {/* 編輯按鈕 (只有使用者模板可編輯) */}
          {canEdit && onEdit && (
            <Button
              onClick={handleEdit}
              variant="outline"
              className="bg-slate-700 border-slate-600 text-slate-300 hover:bg-slate-600"
            >
              <Edit className="h-4 w-4 mr-2" />
              {t('actions.edit')}
            </Button>
          )}

          {/* 刪除按鈕 (只有使用者模板可刪除) */}
          {canDelete && onDelete && (
            <Button
              onClick={handleDelete}
              variant="outline"
              disabled={deleting}
              className={`border-slate-600 text-slate-300 hover:bg-slate-600 ${
                showDeleteConfirm
                  ? 'bg-red-500/20 border-red-500 text-red-400'
                  : 'bg-slate-700'
              }`}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              {showDeleteConfirm
                ? tCommon('button.confirm')
                : t('actions.delete')}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
