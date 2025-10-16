'use client'

/**
 * Avatar Preferences Page
 * Avatar 偏好設定頁面
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
import { useAvatarStore } from '@/stores/avatarStore'

const AVAILABLE_AVATARS = [
  {
    id: 'alex',
    url: 'https://models.readyplayer.me/671f7ae90c87f7db88cc12d2.glb',
    name: 'Alex',
    description: '友善的助理',
    preview: '🧑',
  },
  {
    id: 'jordan',
    url: 'https://models.readyplayer.me/671f7b210c87f7db88cc12d4.glb',
    name: 'Jordan',
    description: '專業顧問',
    preview: '👩',
  },
  {
    id: 'casey',
    url: 'https://models.readyplayer.me/671f7b400c87f7db88cc12d5.glb',
    name: 'Casey',
    description: '活力達人',
    preview: '🧒',
  },
]

export default function AvatarPreferencesPage() {
  const router = useRouter()
  const { status } = useSession()
  const { currentAvatarId, setAvatar } = useAvatarStore()
  const [selectedAvatarId, setSelectedAvatarId] = useState<string>(
    currentAvatarId
  )
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
    async function loadPreferences() {
      try {
        setIsLoading(true)
        const response = await fetch('/api/user/preferences')
        const data = await response.json()

        if (response.ok && data.preferences?.defaultAvatarId) {
          setSelectedAvatarId(data.preferences.defaultAvatarId)
        }
      } catch (error) {
        console.error('載入偏好失敗:', error)
      } finally {
        setIsLoading(false)
      }
    }

    if (status === 'authenticated') {
      loadPreferences()
    }
  }, [status])

  async function handleSavePreferences() {
    setIsSaving(true)
    setMessage(null)

    try {
      const selectedAvatar = AVAILABLE_AVATARS.find(
        (a) => a.id === selectedAvatarId
      )
      if (!selectedAvatar) {
        throw new Error('未選擇有效的 Avatar')
      }

      // 更新伺服器偏好
      const response = await fetch('/api/user/preferences', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          defaultAvatarId: selectedAvatar.id,
          defaultAvatarUrl: selectedAvatar.url,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || '儲存失敗')
      }

      // 更新本地 store
      setAvatar(selectedAvatar.id)

      setMessage({ type: 'success', text: 'Avatar 偏好已儲存' })
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
    <Card>
      <CardHeader>
        <CardTitle>Avatar 偏好</CardTitle>
        <CardDescription>選擇您的預設 3D Avatar</CardDescription>
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

        {/* Avatar 選擇網格 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {AVAILABLE_AVATARS.map((avatar) => {
            const isSelected = selectedAvatarId === avatar.id
            return (
              <button
                key={avatar.id}
                onClick={() => setSelectedAvatarId(avatar.id)}
                className={`p-6 rounded-lg border-2 transition-all ${
                  isSelected
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300 bg-white'
                }`}
              >
                <div className="text-6xl mb-4">{avatar.preview}</div>
                <h3 className="font-semibold text-lg mb-1">{avatar.name}</h3>
                <p className="text-sm text-gray-600">{avatar.description}</p>
                {isSelected && (
                  <div className="mt-3 text-sm text-blue-600 font-medium">
                    ✓ 已選擇
                  </div>
                )}
              </button>
            )
          })}
        </div>

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
            disabled={isSaving || selectedAvatarId === currentAvatarId}
          >
            {isSaving ? '儲存中...' : '儲存變更'}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
