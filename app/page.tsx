'use client'

import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import { Button } from '@/components/ui/button'
import { checkHealth } from '@/lib/api/client'
import type { HealthCheckResponse } from '@/types/api'
import AvatarSelector from '@/components/avatar/AvatarSelector'
import AvatarChangeButton from '@/components/avatar/AvatarChangeButton'
import ChatInterface from '@/components/chat/ChatInterface'
import Navigation from '@/components/layout/Navigation'

// Dynamic import for AvatarCanvas to reduce initial bundle size
// Three.js 相關組件使用動態載入，減少首屏 Bundle 大小
const AvatarCanvas = dynamic(() => import('@/components/avatar/AvatarCanvas'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-gradient-to-b from-slate-900 to-slate-800">
      <div className="text-center">
        <div className="inline-block w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-white text-lg">載入 3D Avatar...</p>
      </div>
    </div>
  ),
})

export default function Home() {
  const [healthStatus, setHealthStatus] = useState<HealthCheckResponse | null>(
    null
  )
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchHealthStatus = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const status = await checkHealth()
      setHealthStatus(status)
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to fetch health status'
      )
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchHealthStatus()
  }, [])

  return (
    <main className="flex h-screen bg-gradient-to-b from-slate-900 to-slate-800">
      {/* 導航列 */}
      <Navigation />

      {/* 左側：Avatar 顯示區 */}
      <div className="flex-1 relative">
        <AvatarCanvas />

        {/* Avatar Change Button - 右上角觸發按鈕 */}
        <AvatarChangeButton />

        {/* Avatar Selector Modal - Avatar 選擇器 */}
        <AvatarSelector />

        {/* UI Overlay - 覆蓋在 3D 場景上的資訊面板 */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="container mx-auto h-full flex flex-col p-8">
            {/* 頂部標題區 */}
            <div className="flex-none pointer-events-auto">
              <div className="bg-card/80 backdrop-blur-md border border-border rounded-lg p-6 max-w-2xl">
                <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
                  3D Avatar{' '}
                  <span className="text-primary">對話系統</span>
                </h1>
                <p className="text-base text-muted-foreground">
                  Epic 3 - 對話與 TTS 整合測試
                </p>
                <div className="mt-4 flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  <span className="text-sm text-green-600 dark:text-green-400 font-medium">
                    3D 渲染引擎運行中
                  </span>
                </div>
              </div>
            </div>

            {/* 底部資訊區 */}
            <div className="flex-1" />
            <div className="flex-none flex gap-4 pointer-events-auto">
              {/* 控制提示 */}
              <div className="flex-1 bg-card/80 backdrop-blur-md border border-border rounded-lg p-4">
                <h3 className="text-sm font-semibold text-card-foreground mb-2">
                  🎮 互動控制
                </h3>
                <ul className="text-xs text-muted-foreground space-y-1">
                  <li>• 滑鼠左鍵拖曳：旋轉視角</li>
                  <li>• 滑鼠滾輪：縮放距離</li>
                  <li>• 右側對話介面：與 Avatar 對話</li>
                </ul>
              </div>

              {/* API 狀態 */}
              <div className="flex-1 bg-card/80 backdrop-blur-md border border-border rounded-lg p-4">
                <h3 className="text-sm font-semibold text-card-foreground mb-2">
                  🔧 系統狀態
                </h3>
                {isLoading && (
                  <div className="text-xs text-muted-foreground">檢查中...</div>
                )}
                {error && (
                  <div className="text-xs text-destructive">❌ {error}</div>
                )}
                {healthStatus && (
                  <div className="space-y-1">
                    <div className="text-xs text-muted-foreground flex justify-between">
                      <span>API:</span>
                      <span
                        className={
                          healthStatus.status === 'ok'
                            ? 'text-green-600 dark:text-green-400'
                            : 'text-destructive'
                        }
                      >
                        {healthStatus.status === 'ok' ? '✅ 正常' : '❌ 異常'}
                      </span>
                    </div>
                    <div className="text-xs text-muted-foreground flex justify-between">
                      <span>版本:</span>
                      <span>{healthStatus.version}</span>
                    </div>
                  </div>
                )}
                <Button
                  size="sm"
                  variant="outline"
                  onClick={fetchHealthStatus}
                  isLoading={isLoading}
                  className="mt-2 w-full text-xs"
                >
                  重新檢查
                </Button>
              </div>

              {/* 技術棧 */}
              <div className="flex-1 bg-card/80 backdrop-blur-md border border-border rounded-lg p-4">
                <h3 className="text-sm font-semibold text-card-foreground mb-2">
                  ⚡ 技術棧
                </h3>
                <div className="flex flex-wrap gap-1">
                  <span className="px-2 py-0.5 bg-muted text-muted-foreground rounded text-xs">
                    Three.js
                  </span>
                  <span className="px-2 py-0.5 bg-muted text-muted-foreground rounded text-xs">
                    React Three Fiber
                  </span>
                  <span className="px-2 py-0.5 bg-muted text-muted-foreground rounded text-xs">
                    Next.js 15
                  </span>
                  <span className="px-2 py-0.5 bg-muted text-muted-foreground rounded text-xs">
                    TypeScript
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 右側：對話介面 */}
      <div className="w-96 p-4 flex flex-col">
        <ChatInterface />
      </div>
    </main>
  )
}
