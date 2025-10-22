'use client'

import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import PhotoUpload from '@/components/avatar-2d/PhotoUpload'
import Avatar2DLipSync from '@/components/avatar-2d/Avatar2DLipSync'
import { Sparkles, Loader2, MessageSquare, History } from 'lucide-react'
import type { TTSWithVisemeResponse } from '@/types/viseme'

/**
 * Avatar 歷史記錄型別
 */
interface AvatarHistory {
  id: string
  avatarImageUrl: string
  style: 'cartoon' | 'anime' | 'illustration'
  createdAt: number
  thumbnail: string
}

/**
 * Avatar Lip Sync 測試頁面
 *
 * 完整流程測試：
 * 1. 上傳照片
 * 2. 風格化為 Avatar
 * 3. 輸入文字
 * 4. 生成 TTS + Viseme
 * 5. 播放 Lip Sync 動畫
 */
export default function AvatarLipSyncTestPage() {
  // 步驟 1：照片上傳
  const [originalPhoto, setOriginalPhoto] = useState<string | null>(null)

  // 步驟 2：Avatar 風格化
  const [avatarImageUrl, setAvatarImageUrl] = useState<string | null>(null)
  const [isStylizing, setIsStylizing] = useState(false)
  const [selectedStyle, setSelectedStyle] = useState<'cartoon' | 'anime' | 'illustration'>('cartoon')

  // 步驟 3：對話測試
  const [inputText, setInputText] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)

  // 步驟 4：TTS + Viseme 資料
  const [ttsData, setTtsData] = useState<TTSWithVisemeResponse | null>(null)
  const [shouldAutoPlay, setShouldAutoPlay] = useState(false)

  // 步驟 5：Wav2Lip 影片
  const [lipSyncVideoUrl, setLipSyncVideoUrl] = useState<string | null>(null)
  const [isGeneratingLipSync, setIsGeneratingLipSync] = useState(false)

  // Avatar 歷史記錄
  const [avatarHistory, setAvatarHistory] = useState<AvatarHistory[]>([])
  const [showHistory, setShowHistory] = useState(false)

  // 統計資訊
  const [stats, setStats] = useState<{
    stylizeDuration?: number
    ttsDuration?: number
    lipSyncDuration?: number
    totalDuration?: number
  }>({})

  // 載入歷史記錄
  useEffect(() => {
    const savedHistory = localStorage.getItem('avatar-lip-sync-history')
    if (savedHistory) {
      try {
        setAvatarHistory(JSON.parse(savedHistory))
      } catch (error) {
        console.error('Failed to load avatar history:', error)
      }
    }
  }, [])

  /**
   * 處理照片上傳
   */
  const handlePhotoUploaded = async (photoUrl: string) => {
    setOriginalPhoto(photoUrl)
    toast.success('照片上傳成功！')

    // 自動開始風格化
    await handleStylizePhoto(photoUrl)
  }

  /**
   * 儲存 Avatar 到歷史記錄
   */
  const saveToHistory = (avatarUrl: string, style: 'cartoon' | 'anime' | 'illustration') => {
    const newAvatar: AvatarHistory = {
      id: Date.now().toString(),
      avatarImageUrl: avatarUrl,
      style,
      createdAt: Date.now(),
      thumbnail: avatarUrl
    }

    const updatedHistory = [newAvatar, ...avatarHistory].slice(0, 10) // 保留最近 10 個
    setAvatarHistory(updatedHistory)
    localStorage.setItem('avatar-lip-sync-history', JSON.stringify(updatedHistory))
  }

  /**
   * 從歷史記錄選擇 Avatar
   */
  const selectFromHistory = (avatar: AvatarHistory) => {
    setAvatarImageUrl(avatar.avatarImageUrl)
    setSelectedStyle(avatar.style)
    setShowHistory(false)
    toast.success('已載入歷史 Avatar')
  }

  /**
   * 處理照片風格化
   */
  const handleStylizePhoto = async (photoUrl: string) => {
    setIsStylizing(true)

    try {
      const startTime = Date.now()

      const response = await fetch('/api/avatar/stylize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          photoUrl,
          style: selectedStyle
        })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || '風格化失敗')
      }

      const data = await response.json()
      const duration = Date.now() - startTime

      setAvatarImageUrl(data.avatarImageUrl)
      setStats(prev => ({ ...prev, stylizeDuration: duration }))

      // 保存到歷史記錄
      saveToHistory(data.avatarImageUrl, selectedStyle)

      toast.success(`Avatar 風格化完成！耗時 ${(duration / 1000).toFixed(1)}秒`)

    } catch (error) {
      console.error('[Stylize Error]', error)
      toast.error(error instanceof Error ? error.message : '風格化失敗')
    } finally {
      setIsStylizing(false)
    }
  }

  /**
   * 處理對話生成
   */
  const handleGenerateResponse = async () => {
    if (!inputText.trim()) {
      toast.error('請輸入對話內容')
      return
    }

    if (!avatarImageUrl) {
      toast.error('請先上傳照片並生成 Avatar')
      return
    }

    setIsGenerating(true)
    setLipSyncVideoUrl(null) // 清除舊影片

    try {
      const totalStartTime = Date.now()

      // 1. 生成 LLM 回應（簡化版：直接使用輸入文字）
      const aiResponse = inputText

      toast.info('正在生成語音...')

      // 2. 生成 TTS + Viseme
      const ttsStartTime = Date.now()

      const ttsResponse = await fetch('/api/tts-viseme', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: aiResponse,
          voice: 'zh-TW-HsiaoChenNeural',
          speed: 0.85,
          pitch: 1.0
        })
      })

      if (!ttsResponse.ok) {
        const error = await ttsResponse.json()
        throw new Error(error.error || 'TTS 生成失敗')
      }

      const ttsResult: TTSWithVisemeResponse = await ttsResponse.json()
      const ttsDuration = Date.now() - ttsStartTime

      console.log('[TTS Generated]', {
        duration: ttsDuration,
        audioUrl: ttsResult.audioUrl.substring(0, 50) + '...',
        visemeCount: ttsResult.visemes.length
      })

      toast.success(`語音生成完成！耗時 ${(ttsDuration / 1000).toFixed(1)}秒`)
      toast.info('正在生成 Lip Sync 影片（預計 10-20 秒）...')

      // 3. 生成 Wav2Lip 影片
      setIsGeneratingLipSync(true)
      const lipSyncStartTime = Date.now()

      const lipSyncResponse = await fetch('/api/avatar/lip-sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          avatarImageUrl: avatarImageUrl,
          audioUrl: ttsResult.audioUrl
        })
      })

      if (!lipSyncResponse.ok) {
        const error = await lipSyncResponse.json()
        throw new Error(error.error || 'Lip Sync 影片生成失敗')
      }

      const lipSyncResult = await lipSyncResponse.json()
      const lipSyncDuration = Date.now() - lipSyncStartTime
      const totalDuration = Date.now() - totalStartTime

      console.log('[Lip Sync Generated]', {
        duration: lipSyncDuration,
        videoUrl: lipSyncResult.videoUrl.substring(0, 50) + '...'
      })

      // 設置影片 URL，自動播放
      setLipSyncVideoUrl(lipSyncResult.videoUrl)
      setTtsData(ttsResult) // 保留 TTS 資料供參考

      setStats(prev => ({
        ...prev,
        ttsDuration,
        lipSyncDuration,
        totalDuration
      }))

      toast.success(`Lip Sync 影片生成完成！總耗時 ${(totalDuration / 1000).toFixed(1)}秒`)

    } catch (error) {
      console.error('[Generate Error]', error)
      toast.error(error instanceof Error ? error.message : '生成失敗')
    } finally {
      setIsGenerating(false)
      setIsGeneratingLipSync(false)
    }
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 mb-4">
          <Sparkles className="h-8 w-8 text-white" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900">
          Avatar Lip Sync 測試工具
        </h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          測試完整流程：照片上傳 → Avatar 風格化 → TTS 語音生成 → Wav2Lip AI Lip Sync 影片
        </p>
      </div>

      {/* 統計資訊 */}
      {Object.keys(stats).length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-blue-900 mb-2">⏱️ 效能統計</h3>
          <div className="grid grid-cols-4 gap-4 text-sm">
            {stats.stylizeDuration && (
              <div>
                <span className="text-blue-700">風格化：</span>
                <span className="font-mono text-blue-900"> {(stats.stylizeDuration / 1000).toFixed(2)}s</span>
              </div>
            )}
            {stats.ttsDuration && (
              <div>
                <span className="text-blue-700">TTS 生成：</span>
                <span className="font-mono text-blue-900"> {(stats.ttsDuration / 1000).toFixed(2)}s</span>
              </div>
            )}
            {stats.lipSyncDuration && (
              <div>
                <span className="text-blue-700">Lip Sync：</span>
                <span className="font-mono text-blue-900"> {(stats.lipSyncDuration / 1000).toFixed(2)}s</span>
              </div>
            )}
            {stats.totalDuration && (
              <div>
                <span className="text-blue-700 font-semibold">總時間：</span>
                <span className="font-mono text-blue-900 font-bold"> {(stats.totalDuration / 1000).toFixed(2)}s</span>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* 左側：上傳和風格化 */}
        <div className="space-y-6">
          {/* 步驟 1：照片上傳 */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">
                📸 步驟 1：上傳照片
              </h2>
              {avatarHistory.length > 0 && (
                <button
                  type="button"
                  onClick={() => setShowHistory(!showHistory)}
                  className="inline-flex items-center gap-2 px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
                >
                  <History className="h-4 w-4" />
                  歷史記錄 ({avatarHistory.length})
                </button>
              )}
            </div>

            {/* 歷史記錄彈窗 */}
            {showHistory && avatarHistory.length > 0 && (
              <div className="mb-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <h3 className="text-sm font-medium text-gray-700 mb-3">選擇歷史 Avatar</h3>
                <div className="grid grid-cols-3 gap-3 max-h-64 overflow-y-auto">
                  {avatarHistory.map((avatar) => (
                    <button
                      key={avatar.id}
                      type="button"
                      onClick={() => selectFromHistory(avatar)}
                      className="relative aspect-square rounded-lg overflow-hidden border-2 border-gray-200 hover:border-blue-500 transition-all group"
                    >
                      <img
                        src={avatar.thumbnail}
                        alt={`Avatar ${avatar.style}`}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                      <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white text-xs p-1 text-center">
                        {avatar.style === 'cartoon' && '🎭 卡通'}
                        {avatar.style === 'anime' && '🌸 動漫'}
                        {avatar.style === 'illustration' && '🎨 插畫'}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <PhotoUpload
              onPhotoUploaded={handlePhotoUploaded}
              onError={(error) => toast.error(error)}
            />
          </div>

          {/* 步驟 2：風格選擇 */}
          {originalPhoto && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                🎨 步驟 2：選擇 Avatar 風格
              </h2>
              <div className="grid grid-cols-3 gap-3">
                {(['cartoon', 'anime', 'illustration'] as const).map((style) => (
                  <button
                    key={style}
                    type="button"
                    onClick={() => {
                      setSelectedStyle(style)
                      if (originalPhoto) {
                        handleStylizePhoto(originalPhoto)
                      }
                    }}
                    disabled={isStylizing}
                    className={`
                      px-4 py-3 rounded-lg border-2 transition-all font-medium
                      ${selectedStyle === style
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-200 hover:border-gray-300'
                      }
                      ${isStylizing ? 'opacity-50 cursor-not-allowed' : ''}
                    `}
                  >
                    {style === 'cartoon' && '🎭 卡通'}
                    {style === 'anime' && '🌸 動漫'}
                    {style === 'illustration' && '🎨 插畫'}
                  </button>
                ))}
              </div>

              {isStylizing && (
                <div className="mt-4 flex items-center justify-center text-blue-600">
                  <Loader2 className="h-5 w-5 animate-spin mr-2" />
                  <span className="text-sm">正在風格化...</span>
                </div>
              )}
            </div>
          )}

          {/* 步驟 3：對話測試 */}
          {avatarImageUrl && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                💬 步驟 3：輸入對話內容
              </h2>
              <div className="space-y-3">
                <textarea
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="輸入 Avatar 要說的話..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                  rows={4}
                  maxLength={200}
                />
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">
                    {inputText.length}/200 字元
                  </span>
                  <button
                    type="button"
                    onClick={handleGenerateResponse}
                    disabled={isGenerating || !inputText.trim()}
                    className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin mr-2" />
                        生成中...
                      </>
                    ) : (
                      <>
                        <MessageSquare className="h-5 w-5 mr-2" />
                        生成對話
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 右側：Avatar Lip Sync 預覽 */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            🎬 步驟 4：Avatar Lip Sync 預覽
          </h2>

          {avatarImageUrl ? (
            <div className="space-y-4">
              {/* Lip Sync 影片播放器 */}
              {lipSyncVideoUrl ? (
                <div className="relative">
                  <video
                    key={lipSyncVideoUrl}
                    src={lipSyncVideoUrl}
                    autoPlay
                    controls
                    loop={false}
                    className="w-full rounded-lg shadow-lg"
                    style={{ maxHeight: '512px' }}
                    onEnded={() => {
                      console.log('[Lip Sync Video] 播放完成')
                      toast.success('Lip Sync 影片播放完成')
                    }}
                    onError={(e) => {
                      console.error('[Lip Sync Video] 播放錯誤:', e)
                      toast.error('影片播放失敗')
                    }}
                  >
                    您的瀏覽器不支援影片播放
                  </video>
                  <div className="mt-2 flex items-center justify-center gap-2 text-sm text-green-600">
                    <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                    <span className="font-medium">Wav2Lip 影片已生成</span>
                  </div>
                </div>
              ) : isGeneratingLipSync ? (
                <div className="flex items-center justify-center h-[512px] bg-gray-100 rounded-lg">
                  <div className="text-center">
                    <Loader2 className="h-16 w-16 mx-auto mb-4 text-blue-600 animate-spin" />
                    <p className="text-gray-700 font-medium">正在生成 Lip Sync 影片...</p>
                    <p className="text-sm text-gray-500 mt-2">預計需要 10-20 秒</p>
                  </div>
                </div>
              ) : (
                <div className="relative">
                  <img
                    src={avatarImageUrl}
                    alt="Avatar"
                    className="w-full rounded-lg shadow-lg"
                    style={{ maxHeight: '512px', objectFit: 'contain' }}
                  />
                  <div className="mt-2 flex items-center justify-center gap-2 text-sm text-gray-500">
                    <div className="h-2 w-2 rounded-full bg-gray-400" />
                    <span>Avatar 圖片已準備</span>
                  </div>
                </div>
              )}

              {/* 統計資訊 */}
              {(ttsData || lipSyncVideoUrl) && (
                <div className="bg-gray-50 rounded-lg p-4 text-sm space-y-3">
                  <h3 className="font-semibold text-gray-900">📊 生成資訊</h3>
                  <div className="space-y-2 text-gray-700">
                    {ttsData && (
                      <>
                        <div className="flex justify-between">
                          <span>音訊時長：</span>
                          <span className="font-mono">{(ttsData.duration / 1000).toFixed(2)}秒</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Viseme 事件數：</span>
                          <span className="font-mono">{ttsData.visemes.length}</span>
                        </div>
                      </>
                    )}
                    {stats.lipSyncDuration && (
                      <div className="flex justify-between border-t border-gray-200 pt-2">
                        <span className="font-semibold">Lip Sync 生成：</span>
                        <span className="font-mono font-semibold text-blue-600">
                          {(stats.lipSyncDuration / 1000).toFixed(2)}秒
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center justify-center h-[512px] bg-gray-100 rounded-lg">
              <div className="text-center text-gray-500">
                <Sparkles className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <p className="text-sm">上傳照片以開始測試</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 說明文字 */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <h3 className="font-semibold text-yellow-900 mb-2">ℹ️ 測試說明</h3>
        <ul className="text-sm text-yellow-700 space-y-1 list-disc list-inside">
          <li>上傳真人照片後，系統會自動使用 Replicate Stable Diffusion 進行風格化</li>
          <li>風格化預計耗時 5-15 秒（取決於 Replicate 伺服器負載）</li>
          <li>輸入對話內容後，系統會使用 Azure Speech TTS 生成語音</li>
          <li>TTS 生成預計耗時 1-3 秒</li>
          <li>接著使用 Replicate Wav2Lip AI 生成 Lip Sync 影片（Avatar 圖片 + 音訊）</li>
          <li>Wav2Lip 生成預計耗時 10-20 秒（在 Nvidia A100 GPU 上處理）</li>
          <li>總延遲約 11-23 秒（TTS + Wav2Lip），每次對話都會生成新影片</li>
          <li>生成完成後影片會自動播放，可重複觀看</li>
        </ul>
      </div>
    </div>
  )
}
