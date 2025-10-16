'use client'

/**
 * Avatar Preferences Page
 * Avatar 偏好設定頁面 - 整合 AvatarGallery 與 AvatarPreview
 */

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useAvatarStore, type AvatarInfo } from '@/stores/avatarStore'
import AvatarGallery from '@/components/avatar/AvatarGallery'
import AvatarPreview from '@/components/avatar/AvatarPreview'

export default function AvatarPreferencesPage() {
  const router = useRouter()
  const { status } = useSession()
  const {
    currentAvatarId,
    currentAvatarUrl,
    loadUserPreferences,
    setAvatar,
  } = useAvatarStore()
  const [selectedAvatar, setSelectedAvatar] = useState<AvatarInfo | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [message, setMessage] = useState<{
    type: 'success' | 'error'
    text: string
  } | null>(null)

  // 檢查認證狀態
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    }
  }, [status, router])

  // 載入使用者偏好
  useEffect(() => {
    if (status === 'authenticated') {
      setIsLoading(true)
      loadUserPreferences().finally(() => setIsLoading(false))
    }
  }, [status, loadUserPreferences])

  // 處理選擇 Avatar
  const handleSelectAvatar = (avatar: AvatarInfo) => {
    setSelectedAvatar(avatar)
  }

  // 儲存偏好
  async function handleSavePreferences() {
    if (!selectedAvatar) {
      setMessage({ type: 'error', text: '請先選擇一個 Avatar' })
      return
    }

    setIsSaving(true)
    setMessage(null)

    try {
      // 使用 store 的 setAvatar 方法 (自動同步到伺服器)
      await setAvatar(selectedAvatar.id, true)

      setMessage({ type: 'success', text: 'Avatar 偏好已儲存' })
      setSelectedAvatar(null) // 重置選擇
    } catch (err) {
      setMessage({
        type: 'error',
        text: err instanceof Error ? err.message : '儲存時發生錯誤',
      })
    } finally {
      setIsSaving(false)
    }
  }

  // 載入中狀態
  if (status === 'loading' || isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Avatar 偏好</CardTitle>
          <CardDescription>載入中...</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  // 未認證時不顯示內容
  if (status === 'unauthenticated') {
    return null
  }

  return (
    <div className="space-y-6">
      {/* 目前 Avatar 預覽 */}
      <Card>
        <CardHeader>
          <CardTitle>目前 Avatar</CardTitle>
          <CardDescription>您目前使用的 3D Avatar 預覽</CardDescription>
        </CardHeader>
        <CardContent>
          <AvatarPreview
            avatarUrl={currentAvatarUrl}
            height={400}
            showControls={true}
          />
        </CardContent>
      </Card>

      {/* Avatar 選擇 */}
      <Card>
        <CardHeader>
          <CardTitle>選擇 Avatar</CardTitle>
          <CardDescription>
            從下方圖庫選擇您喜歡的 Avatar
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {message && (
            <div
              className={`rounded-md p-4 ${
                message.type === 'success'
                  ? 'bg-green-50 text-green-800'
                  : 'bg-red-50 text-red-800'
              }`}
            >
              <p className="text-sm">{message.text}</p>
            </div>
          )}

          {/* Avatar 圖庫 */}
          <AvatarGallery
            selectionMode={true}
            onSelect={handleSelectAvatar}
            selectedId={selectedAvatar?.id || currentAvatarId}
          />

          {/* 已選擇提示 */}
          {selectedAvatar && (
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="text-3xl">{selectedAvatar.thumbnail}</div>
                <div className="flex-1">
                  <h4 className="font-medium text-blue-900">
                    已選擇: {selectedAvatar.name}
                  </h4>
                  <p className="text-sm text-blue-700">
                    {selectedAvatar.description}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* 儲存按鈕 */}
          <div className="flex justify-end space-x-4 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push('/settings')}
              disabled={isSaving}
            >
              取消
            </Button>
            <Button
              onClick={handleSavePreferences}
              disabled={isSaving || !selectedAvatar}
            >
              {isSaving ? '儲存中...' : '儲存變更'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
