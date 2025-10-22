'use client'

import { useState } from 'react'
import { formatDistanceToNow } from 'date-fns'
import { zhTW } from 'date-fns/locale'
import {
  MoreVertical,
  Trash2,
  Edit2,
  Check,
  X,
  MessageSquare,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'

interface ConversationItemProps {
  conversation: {
    id: string
    title: string
    avatarId?: string
    createdAt: string
    updatedAt: string
    _count: {
      messages: number
    }
    messages: Array<{
      id: string
      role: string
      content: string
      timestamp: string
    }>
  }
  isSelected?: boolean
  onSelect?: () => void
  onDelete?: () => void
  onRename?: (newTitle: string) => void
}

export default function ConversationItem({
  conversation,
  isSelected,
  onSelect,
  onDelete,
  onRename,
}: ConversationItemProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editTitle, setEditTitle] = useState(conversation.title)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  // 獲取最後一則訊息作為預覽
  const lastMessage = conversation.messages[0]
  const messagePreview = lastMessage
    ? lastMessage.content.slice(0, 60) + (lastMessage.content.length > 60 ? '...' : '')
    : '尚無訊息'

  // 格式化時間
  const timeAgo = formatDistanceToNow(new Date(conversation.updatedAt), {
    addSuffix: true,
    locale: zhTW,
  })

  // 處理標題編輯
  const handleEditSubmit = () => {
    if (editTitle.trim() && editTitle !== conversation.title) {
      onRename?.(editTitle.trim())
    } else {
      setEditTitle(conversation.title)
    }
    setIsEditing(false)
  }

  const handleEditCancel = () => {
    setEditTitle(conversation.title)
    setIsEditing(false)
  }

  // 處理刪除確認
  const handleDeleteConfirm = () => {
    onDelete?.()
    setShowDeleteConfirm(false)
  }

  return (
    <div
      className={cn(
        'group relative px-4 py-3 transition-colors cursor-pointer',
        isSelected
          ? 'bg-blue-50 hover:bg-blue-100'
          : 'hover:bg-gray-50'
      )}
      onClick={isEditing ? undefined : onSelect}
    >
      <div className="flex items-start gap-3">
        {/* Avatar Icon */}
        <div
          className={cn(
            'mt-1 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg',
            isSelected
              ? 'bg-blue-100 text-blue-600'
              : 'bg-gray-100 text-gray-600'
          )}
        >
          <MessageSquare className="h-5 w-5" />
        </div>

        {/* Content */}
        <div className="min-w-0 flex-1">
          {/* Title */}
          {isEditing ? (
            <div className="flex items-center gap-1.5 mb-1" onClick={(e) => e.stopPropagation()}>
              <Input
                type="text"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleEditSubmit()
                  if (e.key === 'Escape') handleEditCancel()
                }}
                className="h-7 text-sm"
                autoFocus
              />
              <Button
                size="sm"
                variant="ghost"
                className="h-7 w-7 p-0"
                onClick={handleEditSubmit}
              >
                <Check className="h-4 w-4 text-green-600" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="h-7 w-7 p-0"
                onClick={handleEditCancel}
              >
                <X className="h-4 w-4 text-red-600" />
              </Button>
            </div>
          ) : (
            <h3
              className={cn(
                'mb-1 text-sm font-medium truncate',
                isSelected ? 'text-blue-900' : 'text-gray-900'
              )}
            >
              {conversation.title}
            </h3>
          )}

          {/* Message Preview */}
          <p className="text-xs text-gray-500 truncate mb-1">
            {messagePreview}
          </p>

          {/* Meta Info */}
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <span>{conversation._count.messages} 則訊息</span>
            <span>•</span>
            <span>{timeAgo}</span>
          </div>
        </div>

        {/* Actions Menu */}
        {!isEditing && (
          <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
            <DropdownMenu>
              <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0"
                >
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={(e) => {
                  e.stopPropagation()
                  setIsEditing(true)
                }}>
                  <Edit2 className="mr-2 h-4 w-4" />
                  重新命名
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation()
                    setShowDeleteConfirm(true)
                  }}
                  className="text-red-600 focus:text-red-600"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  刪除對話
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
      </div>

      {/* Delete Confirmation Overlay */}
      {showDeleteConfirm && (
        <div
          className="absolute inset-0 bg-white/95 backdrop-blur-sm flex items-center justify-center gap-2 px-4"
          onClick={(e) => e.stopPropagation()}
        >
          <p className="text-sm text-gray-900 mr-2">確定刪除？</p>
          <Button
            size="sm"
            variant="destructive"
            onClick={handleDeleteConfirm}
          >
            刪除
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setShowDeleteConfirm(false)}
          >
            取消
          </Button>
        </div>
      )}
    </div>
  )
}
