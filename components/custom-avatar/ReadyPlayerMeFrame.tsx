'use client'

import { useEffect, useRef, useState } from 'react'
import { Loader2 } from 'lucide-react'

interface ReadyPlayerMeFrameProps {
  subdomain?: string
  onAvatarExported: (avatarUrl: string) => void
  onError?: (error: string) => void
}

/**
 * ReadyPlayerMe iframe 集成組件
 *
 * 使用 Ready Player Me 官方的 Avatar Creator iframe
 * 支援從照片生成 avatar 和完整的編輯器功能
 *
 * @see https://docs.readyplayer.me/ready-player-me/integration-guides/web-and-native-integration/avatar-creator-integration
 */
export default function ReadyPlayerMeFrame({
  subdomain = 'smart-ai-avatar-agent',
  onAvatarExported,
  onError,
}: ReadyPlayerMeFrameProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const [isLoading, setIsLoading] = useState(true)

  // 直接構建 iframe URL，不使用 state
  const iframeUrl = `https://${subdomain}.readyplayer.me?frameApi`

  useEffect(() => {
    console.log('[ReadyPlayerMe] Initializing iframe:', iframeUrl)

    // 設置超時：如果 10 秒後仍未收到 ready 事件，強制隱藏 loading
    const loadingTimeout = setTimeout(() => {
      console.warn('[ReadyPlayerMe] Loading timeout - forcing iframe display')
      setIsLoading(false)
    }, 10000)

    // 設置 postMessage 事件監聽器
    const handleMessage = (event: MessageEvent) => {
      // 安全檢查：確保消息來自 Ready Player Me
      if (!event.origin.includes('readyplayer.me')) {
        return
      }

      // 檢查 event.data 是否為對象
      if (typeof event.data !== 'object' || event.data === null) {
        return
      }

      const { eventName, data } = event.data

      // 忽略沒有 eventName 的消息
      if (!eventName) {
        return
      }

      console.log('[ReadyPlayerMe] Received event:', eventName, data)

      switch (eventName) {
        case 'v1.frame.ready':
          // iframe 已準備就緒
          setIsLoading(false)
          console.log('[ReadyPlayerMe] Frame ready')
          break

        case 'v1.avatar.exported':
          // Avatar 已生成並導出
          const avatarUrl = data?.url
          console.log('[ReadyPlayerMe] Avatar exported:', avatarUrl)

          if (avatarUrl) {
            onAvatarExported(avatarUrl)
          } else {
            onError?.('未收到 Avatar URL')
          }
          break

        case 'v1.user.set':
          // 用戶已設置（可選）
          console.log('[ReadyPlayerMe] User set:', data?.id)
          break

        case 'v1.user.authorized':
          // 用戶已授權（可選）
          console.log('[ReadyPlayerMe] User authorized')
          break

        default:
          // 其他事件（靜默處理，不記錄）
          break
      }
    }

    window.addEventListener('message', handleMessage)

    // 清理函數
    return () => {
      clearTimeout(loadingTimeout)
      window.removeEventListener('message', handleMessage)
    }
  }, [iframeUrl, onAvatarExported, onError])

  return (
    <div className="relative w-full h-full min-h-[600px] rounded-lg overflow-hidden border border-gray-200 bg-white">
      {/* Loading 狀態 */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white z-10">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
            <p className="text-sm text-gray-600">載入 Avatar 創建器...</p>
          </div>
        </div>
      )}

      {/* Ready Player Me iframe */}
      <iframe
        ref={iframeRef}
        src={iframeUrl}
        allow="camera; microphone; clipboard-write"
        className="w-full h-full min-h-[600px]"
        title="Ready Player Me Avatar Creator"
        style={{
          border: 'none',
          width: '100%',
          height: '100%',
        }}
      />
    </div>
  )
}
