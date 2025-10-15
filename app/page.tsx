'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { checkHealth } from '@/lib/api/client'
import type { HealthCheckResponse } from '@/types/api'

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
    <main className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-background via-background to-muted/20">
      <div className="text-center space-y-8 p-8 max-w-6xl mx-auto">
        {/* Logo / Title */}
        <div className="space-y-4">
          <h1 className="text-5xl md:text-6xl font-bold text-foreground">
            3D Avatar{' '}
            <span className="text-primary bg-primary/10 px-4 py-1 rounded-lg">
              對話系統
            </span>
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground">
            POC 開發中 - Powered by Next.js + Three.js + Azure AI
          </p>
        </div>

        {/* Status Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/20 rounded-full">
          <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
          <span className="text-primary font-medium">系統開發中</span>
        </div>

        {/* Feature List */}
        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6 mt-12">
          {/* 3D Avatar 渲染 */}
          <div className="group p-6 bg-card border border-border rounded-lg hover:border-primary/50 transition-all duration-200 hover:shadow-lg">
            <div className="text-5xl mb-3 transform group-hover:scale-110 transition-transform duration-200">
              🎨
            </div>
            <h3 className="text-xl font-semibold text-card-foreground mb-2">
              3D Avatar 渲染
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Three.js + Ready Player Me
              <br />
              高品質 3D 模型與動畫系統
            </p>
          </div>

          {/* LLM 對話 */}
          <div className="group p-6 bg-card border border-border rounded-lg hover:border-primary/50 transition-all duration-200 hover:shadow-lg">
            <div className="text-5xl mb-3 transform group-hover:scale-110 transition-transform duration-200">
              💬
            </div>
            <h3 className="text-xl font-semibold text-card-foreground mb-2">
              LLM 對話
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Azure OpenAI GPT-4 Turbo
              <br />
              智能語境理解與自然對話
            </p>
          </div>

          {/* 語音合成 */}
          <div className="group p-6 bg-card border border-border rounded-lg hover:border-primary/50 transition-all duration-200 hover:shadow-lg">
            <div className="text-5xl mb-3 transform group-hover:scale-110 transition-transform duration-200">
              🔊
            </div>
            <h3 className="text-xl font-semibold text-card-foreground mb-2">
              語音合成
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Azure Speech Services TTS
              <br />
              繁體中文 Neural 高品質語音
            </p>
          </div>

          {/* Lip Sync */}
          <div className="group p-6 bg-card border border-border rounded-lg hover:border-primary/50 transition-all duration-200 hover:shadow-lg">
            <div className="text-5xl mb-3 transform group-hover:scale-110 transition-transform duration-200">
              👄
            </div>
            <h3 className="text-xl font-semibold text-card-foreground mb-2">
              Lip Sync
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Web Audio API 音訊分析
              <br />
              即時嘴型同步與表情控制
            </p>
          </div>
        </div>

        {/* API Health Status */}
        <div className="mt-12 p-6 bg-card/50 rounded-lg border border-border max-w-md mx-auto">
          <h3 className="text-lg font-semibold text-card-foreground mb-4">
            API 健康狀態
          </h3>

          {isLoading && (
            <div className="text-muted-foreground">檢查中...</div>
          )}

          {error && (
            <div className="text-destructive">
              ❌ {error}
            </div>
          )}

          {healthStatus && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">狀態:</span>
                <span
                  className={`font-medium ${
                    healthStatus.status === 'ok'
                      ? 'text-green-600 dark:text-green-400'
                      : 'text-destructive'
                  }`}
                >
                  {healthStatus.status === 'ok' ? '✅ 正常' : '❌ 異常'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">版本:</span>
                <span className="text-card-foreground">
                  {healthStatus.version}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">時間:</span>
                <span className="text-card-foreground text-sm">
                  {new Date(healthStatus.timestamp).toLocaleString('zh-TW')}
                </span>
              </div>
            </div>
          )}

          <Button
            size="sm"
            variant="outline"
            onClick={fetchHealthStatus}
            isLoading={isLoading}
            className="mt-4 w-full"
          >
            重新檢查
          </Button>
        </div>

        {/* Demo Button (暫時禁用) */}
        <div className="pt-8 space-y-4">
          <Button size="lg" disabled className="min-w-[200px]">
            即將推出
          </Button>

          <p className="text-sm text-muted-foreground">
            Epic 1 進度：60% (Story 1.1-1.3 完成)
          </p>
        </div>

        {/* Technology Stack */}
        <div className="pt-12 border-t border-border">
          <p className="text-xs text-muted-foreground mb-4">技術棧</p>
          <div className="flex flex-wrap justify-center gap-3">
            <span className="px-3 py-1 bg-muted text-muted-foreground rounded-md text-sm">
              Next.js 15
            </span>
            <span className="px-3 py-1 bg-muted text-muted-foreground rounded-md text-sm">
              React 19
            </span>
            <span className="px-3 py-1 bg-muted text-muted-foreground rounded-md text-sm">
              TypeScript
            </span>
            <span className="px-3 py-1 bg-muted text-muted-foreground rounded-md text-sm">
              Tailwind CSS 4
            </span>
            <span className="px-3 py-1 bg-muted text-muted-foreground rounded-md text-sm">
              Three.js
            </span>
            <span className="px-3 py-1 bg-muted text-muted-foreground rounded-md text-sm">
              Azure OpenAI
            </span>
            <span className="px-3 py-1 bg-muted text-muted-foreground rounded-md text-sm">
              Azure Speech
            </span>
          </div>
        </div>
      </div>
    </main>
  )
}
