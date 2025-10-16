'use client'

/**
 * Avatar Gallery Component
 * Avatar 圖庫元件 - 顯示所有可用的 Avatar
 */

import { useEffect, useState } from 'react'
import { useAvatarStore, type AvatarInfo } from '@/stores/avatarStore'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

interface AvatarGalleryProps {
  /** 是否顯示為選擇模式 */
  selectionMode?: boolean
  /** 選擇 Avatar 時的回調 */
  onSelect?: (avatar: AvatarInfo) => void
  /** 當前選中的 Avatar ID */
  selectedId?: string
}

export default function AvatarGallery({
  selectionMode = false,
  onSelect,
  selectedId,
}: AvatarGalleryProps) {
  const {
    availableAvatars,
    currentAvatarId,
    isLoading,
    loadAvatars,
    setAvatar,
  } = useAvatarStore()
  const [filter, setFilter] = useState<string>('all')

  // 載入 Avatar 列表
  useEffect(() => {
    loadAvatars()
  }, [loadAvatars])

  // 取得目前選中的 ID
  const activeId = selectedId || currentAvatarId

  // 篩選 Avatar
  const filteredAvatars =
    filter === 'all'
      ? availableAvatars
      : availableAvatars.filter((a) => a.category === filter)

  // 處理選擇
  const handleSelect = async (avatar: AvatarInfo) => {
    if (onSelect) {
      onSelect(avatar)
    } else {
      await setAvatar(avatar.id, selectionMode)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
          <p className="mt-4 text-sm text-gray-600">載入 Avatar 中...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* 篩選按鈕 */}
      <div className="flex gap-2">
        <Button
          variant={filter === 'all' ? 'primary' : 'outline'}
          size="sm"
          onClick={() => setFilter('all')}
        >
          全部
        </Button>
        <Button
          variant={filter === 'male' ? 'primary' : 'outline'}
          size="sm"
          onClick={() => setFilter('male')}
        >
          男性
        </Button>
        <Button
          variant={filter === 'female' ? 'primary' : 'outline'}
          size="sm"
          onClick={() => setFilter('female')}
        >
          女性
        </Button>
        <Button
          variant={filter === 'neutral' ? 'primary' : 'outline'}
          size="sm"
          onClick={() => setFilter('neutral')}
        >
          中性
        </Button>
      </div>

      {/* Avatar 網格 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredAvatars.map((avatar) => {
          const isSelected = activeId === avatar.id

          return (
            <Card
              key={avatar.id}
              className={`cursor-pointer transition-all hover:shadow-lg ${
                isSelected ? 'ring-2 ring-blue-500 bg-blue-50' : ''
              }`}
              onClick={() => handleSelect(avatar)}
            >
              <div className="p-6">
                {/* Avatar 縮圖 */}
                <div className="text-6xl mb-4 text-center">
                  {avatar.thumbnail}
                </div>

                {/* Avatar 資訊 */}
                <div className="space-y-2">
                  <h3 className="font-semibold text-lg">{avatar.name}</h3>
                  {avatar.description && (
                    <p className="text-sm text-gray-600">
                      {avatar.description}
                    </p>
                  )}

                  {/* 標籤 */}
                  {avatar.tags && avatar.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {avatar.tags.map((tag) => (
                        <span
                          key={tag}
                          className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* 選中指示 */}
                  {isSelected && (
                    <div className="mt-3 text-sm text-blue-600 font-medium flex items-center gap-1">
                      <svg
                        className="w-4 h-4"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                      已選擇
                    </div>
                  )}
                </div>
              </div>
            </Card>
          )
        })}
      </div>

      {/* 無結果提示 */}
      {filteredAvatars.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <div className="text-4xl mb-4">🔍</div>
          <p>找不到符合條件的 Avatar</p>
        </div>
      )}
    </div>
  )
}
