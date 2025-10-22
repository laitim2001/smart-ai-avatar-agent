/**
 * Application Insights Provider
 * @description Sprint 10 Part B: Application Insights 整合
 * 在 Client Component 中初始化 Application Insights
 */

'use client'

import { useEffect } from 'react'
import { initializeAppInsights } from '@/lib/monitoring/appinsights'

export function AppInsightsProvider({
  children,
}: {
  children: React.ReactNode
}) {
  useEffect(() => {
    // 初始化 Application Insights（僅客戶端）
    initializeAppInsights()
  }, [])

  return <>{children}</>
}
