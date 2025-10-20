'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import ReadyPlayerMeFrame from '@/components/custom-avatar/ReadyPlayerMeFrame'
import CustomAvatarPreview from '@/components/custom-avatar/CustomAvatarPreview'
import { Save, Sparkles, ArrowLeft } from 'lucide-react'

interface GeneratedAvatar {
  url: string
  glbUrl: string
}

export default function CustomAvatarPage() {
  const [showCreator, setShowCreator] = useState(false)
  const [generatedAvatar, setGeneratedAvatar] = useState<GeneratedAvatar | null>(null)
  const [avatarName, setAvatarName] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  const handleAvatarExported = (avatarUrl: string) => {
    console.log('[Custom Avatar] Avatar exported:', avatarUrl)

    // 確保 URL 以 .glb 結尾
    const glbUrl = avatarUrl.endsWith('.glb') ? avatarUrl : `${avatarUrl}.glb`

    setGeneratedAvatar({
      url: avatarUrl,
      glbUrl: glbUrl,
    })

    // 設置預設名稱
    const defaultName = `我的 Avatar ${new Date().toLocaleString('zh-TW', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })}`
    setAvatarName(defaultName)

    // 隱藏 iframe，顯示預覽和儲存介面
    setShowCreator(false)

    toast.success('Avatar 生成成功！', {
      description: '您可以預覽並儲存您的專屬 Avatar',
    })
  }

  const handleError = (error: string) => {
    console.error('[Custom Avatar] Error:', error)
    toast.error('Avatar 生成失敗', {
      description: error,
    })
  }

  const handleSave = async () => {
    if (!generatedAvatar || !avatarName.trim()) {
      toast.error('請輸入 Avatar 名稱')
      return
    }

    setIsSaving(true)

    try {
      // 從 URL 中提取 avatar ID（Ready Player Me URL 格式：https://models.readyplayer.me/[id].glb）
      const urlMatch = generatedAvatar.url.match(/\/([a-f0-9-]+)\.glb/)
      const rpmId = urlMatch ? urlMatch[1] : generatedAvatar.url

      const response = await fetch('/api/custom-avatars', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: avatarName.trim(),
          url: generatedAvatar.glbUrl,
          rpmId: rpmId,
          description: `透過 Ready Player Me 生成於 ${new Date().toLocaleString('zh-TW')}`,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || '儲存失敗')
      }

      toast.success('儲存成功！', {
        description: '您可以在對話頁面中使用這個 Avatar',
      })

      // Reset form
      setGeneratedAvatar(null)
      setAvatarName('')

    } catch (err) {
      console.error('[Custom Avatar Save] Error:', err)
      toast.error('儲存失敗', {
        description: err instanceof Error ? err.message : '請重試',
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleCreateNew = () => {
    setGeneratedAvatar(null)
    setAvatarName('')
    setShowCreator(true)
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 mb-4">
          <Sparkles className="h-8 w-8 text-white" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900">
          自定義 Avatar 工作室
        </h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          使用 Ready Player Me 官方編輯器，從照片生成專屬的 3D Avatar。
          支援完整的自定義功能，包括髮型、服裝、配件等！
        </p>
      </div>

      {/* Main Content */}
      {!generatedAvatar && !showCreator && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
          <Sparkles className="h-16 w-16 text-blue-600 mx-auto mb-4" />
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            開始創建您的 Avatar
          </h2>
          <p className="text-gray-600 mb-6 max-w-xl mx-auto">
            點擊下方按鈕開啟 Ready Player Me 編輯器。
            您可以上傳照片快速生成，或手動自定義每個細節。
          </p>
          <button
            type="button"
            onClick={handleCreateNew}
            className="inline-flex items-center justify-center px-8 py-4 border border-transparent rounded-lg shadow-sm text-lg font-medium text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all"
          >
            <Sparkles className="h-6 w-6 mr-2" />
            開始創建 Avatar
          </button>

          {/* Info Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-12">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-semibold text-blue-900 mb-2">📸 照片生成</h3>
              <p className="text-sm text-blue-700">
                上傳自拍照片，AI 自動生成相似的 3D Avatar
              </p>
            </div>
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <h3 className="font-semibold text-purple-900 mb-2">🎨 完全自定義</h3>
              <p className="text-sm text-purple-700">
                自由調整髮型、膚色、服裝、配件等所有細節
              </p>
            </div>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h3 className="font-semibold text-green-900 mb-2">💾 即時儲存</h3>
              <p className="text-sm text-green-700">
                完成後自動儲存，立即可在對話中使用
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Ready Player Me iframe */}
      {showCreator && !generatedAvatar && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="mb-4">
            <button
              type="button"
              onClick={() => setShowCreator(false)}
              className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              返回
            </button>
          </div>
          <ReadyPlayerMeFrame
            subdomain={process.env.NEXT_PUBLIC_READYPLAYERME_SUBDOMAIN || 'smart-ai-avatar-agent'}
            onAvatarExported={handleAvatarExported}
            onError={handleError}
          />
        </div>
      )}

      {/* Preview & Save */}
      {generatedAvatar && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left: Preview */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              預覽您的 Avatar
            </h2>
            <CustomAvatarPreview
              avatarUrl={generatedAvatar.glbUrl}
              name={avatarName || '我的 Avatar'}
            />
          </div>

          {/* Right: Save Form */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              儲存 Avatar
            </h2>

            <div className="space-y-4">
              {/* Name Input */}
              <div>
                <label
                  htmlFor="avatar-name"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Avatar 名稱
                </label>
                <input
                  type="text"
                  id="avatar-name"
                  value={avatarName}
                  onChange={(e) => setAvatarName(e.target.value)}
                  placeholder="為您的 Avatar 取個名字..."
                  className="block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  maxLength={50}
                />
                <p className="mt-1 text-xs text-gray-500">
                  {avatarName.length}/50 字元
                </p>
              </div>

              {/* Avatar Info */}
              <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                <p className="text-sm text-gray-600">
                  <span className="font-medium">模型 URL：</span>
                  <span className="text-xs text-gray-500 break-all">
                    {generatedAvatar.glbUrl}
                  </span>
                </p>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={isSaving || !avatarName.trim()}
                  className="w-full inline-flex items-center justify-center px-6 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSaving ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2" />
                      儲存中...
                    </>
                  ) : (
                    <>
                      <Save className="h-5 w-5 mr-2" />
                      儲存 Avatar
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={handleCreateNew}
                  disabled={isSaving}
                  className="w-full inline-flex items-center justify-center px-6 py-3 border border-gray-300 rounded-md shadow-sm text-base font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Sparkles className="h-5 w-5 mr-2" />
                  創建新的 Avatar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
