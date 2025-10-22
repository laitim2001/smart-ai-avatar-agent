'use client'

/**
 * PromptGalleryModal - Prompt 模板畫廊 Modal
 * Sprint 9 Phase 4: ChatInterface 整合
 *
 * 功能:
 * - 在 Modal 中顯示 PromptGallery
 * - 選擇模板後自動關閉
 * - 整合到 ChatInterface
 */

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import PromptGallery from './PromptGallery'
import type { PromptTemplate } from '@/types/prompt'

interface PromptGalleryModalProps {
  open: boolean
  onClose: () => void
  onSelectPrompt?: (prompt: PromptTemplate) => void
}

export default function PromptGalleryModal({
  open,
  onClose,
  onSelectPrompt,
}: PromptGalleryModalProps) {
  const handleSelectPrompt = (prompt: PromptTemplate) => {
    onSelectPrompt?.(prompt)
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-7xl max-h-[90vh] overflow-y-auto bg-slate-900 border-slate-700">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-white">
            選擇對話主題
          </DialogTitle>
        </DialogHeader>
        <div className="mt-4">
          <PromptGallery onSelectPrompt={handleSelectPrompt} />
        </div>
      </DialogContent>
    </Dialog>
  )
}
