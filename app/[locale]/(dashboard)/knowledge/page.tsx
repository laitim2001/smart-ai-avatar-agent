'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  Brain,
  Users,
  HelpCircle,
  BarChart3,
  FileText,
  Calendar,
  BookOpen,
  TrendingUp,
  Clock,
  CheckCircle2,
} from 'lucide-react'

interface KnowledgeStats {
  totalFiles: number
  lastUpdated: string
  personaScore: number
  faqCount: number
  kpiCount: number
}

/**
 * 知識庫管理總覽頁面
 * 顯示知識庫統計資訊、快速操作、最近編輯等
 */
export default function KnowledgePage() {
  const [stats, setStats] = useState<KnowledgeStats>({
    totalFiles: 0,
    lastUpdated: new Date().toISOString(),
    personaScore: 0,
    faqCount: 0,
    kpiCount: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadStats() {
      try {
        // 並行載入所有 API 資料
        const [personaRes, faqRes, kpiRes] = await Promise.all([
          fetch('/api/knowledge/persona'),
          fetch('/api/knowledge/faq'),
          fetch('/api/knowledge/kpi'),
        ])

        const [personaData, faqData, kpiData] = await Promise.all([
          personaRes.json(),
          faqRes.json(),
          kpiRes.json(),
        ])

        setStats({
          totalFiles: 3, // persona + faq + kpi
          lastUpdated: personaData.data?.metadata?.lastModified || new Date().toISOString(),
          personaScore: personaData.data?.structure?.completeness || 0,
          faqCount: faqData.data?.items?.length || 0,
          kpiCount: kpiData.data?.items?.length || 0,
        })
      } catch (error) {
        console.error('[知識庫總覽] 載入統計資料失敗:', error)
      } finally {
        setLoading(false)
      }
    }

    loadStats()
  }, [])

  const knowledgeTypes = [
    {
      title: 'Persona 定義',
      description: 'AI Agent 的角色定義與行為準則',
      icon: Users,
      href: '/knowledge/persona',
      color: 'bg-blue-500',
      stat: `品質分數: ${stats.personaScore}%`,
      statColor: stats.personaScore >= 80 ? 'text-green-600' : 'text-orange-600',
    },
    {
      title: 'FAQ 管理',
      description: '常見問題與回答知識庫',
      icon: HelpCircle,
      href: '/knowledge/faq',
      color: 'bg-green-500',
      stat: `${stats.faqCount} 個問答`,
      statColor: 'text-gray-600',
    },
    {
      title: 'KPI 字典',
      description: '業務指標定義與計算邏輯',
      icon: BarChart3,
      href: '/knowledge/kpi',
      color: 'bg-purple-500',
      stat: `${stats.kpiCount} 個指標`,
      statColor: 'text-gray-600',
    },
    {
      title: '決策日誌',
      description: '重要決策的記錄與追蹤',
      icon: FileText,
      href: '/knowledge/decisions',
      color: 'bg-orange-500',
      stat: '即將推出',
      statColor: 'text-gray-400',
    },
    {
      title: '會議摘要',
      description: '會議記錄與待辦事項',
      icon: Calendar,
      href: '/knowledge/meetings',
      color: 'bg-red-500',
      stat: '即將推出',
      statColor: 'text-gray-400',
    },
    {
      title: '觀點簡報',
      description: 'Point of View 策略簡報',
      icon: BookOpen,
      href: '/knowledge/pov',
      color: 'bg-indigo-500',
      stat: '即將推出',
      statColor: 'text-gray-400',
    },
  ]

  const quickActions = [
    {
      label: '編輯 Persona',
      href: '/knowledge/persona',
      icon: Users,
      description: '更新 AI 角色定義',
    },
    {
      label: '新增 FAQ',
      href: '/knowledge/faq',
      icon: HelpCircle,
      description: '新增常見問題',
    },
    {
      label: '新增 KPI',
      href: '/knowledge/kpi',
      icon: BarChart3,
      description: '定義新的業務指標',
    },
    {
      label: '搜尋知識庫',
      href: '/knowledge/search',
      icon: Brain,
      description: '全域搜尋所有知識',
    },
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">載入知識庫統計資料...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* 頁面標題 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Brain className="h-8 w-8 text-blue-600" />
            知識庫管理
          </h1>
          <p className="text-gray-600 mt-2">管理 AI Agent 的知識來源與訓練資料</p>
        </div>
      </div>

      {/* 統計卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">知識檔案總數</p>
              <p className="text-3xl font-bold text-gray-900">{stats.totalFiles}</p>
            </div>
            <FileText className="h-10 w-10 text-blue-500" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Persona 品質</p>
              <p className="text-3xl font-bold text-gray-900">{stats.personaScore}%</p>
            </div>
            <TrendingUp className="h-10 w-10 text-green-500" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">最後更新</p>
              <p className="text-sm font-medium text-gray-900">
                {new Date(stats.lastUpdated).toLocaleString('zh-TW')}
              </p>
            </div>
            <Clock className="h-10 w-10 text-purple-500" />
          </div>
        </div>
      </div>

      {/* 知識類型卡片 */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">知識類型</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {knowledgeTypes.map((type) => {
            const Icon = type.icon
            return (
              <Link
                key={type.href}
                href={type.href}
                className="group bg-white p-6 rounded-lg border border-gray-200 hover:border-blue-500 hover:shadow-md transition-all"
              >
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-lg ${type.color} bg-opacity-10`}>
                    <Icon className={`h-6 w-6 ${type.color.replace('bg-', 'text-')}`} />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                      {type.title}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">{type.description}</p>
                    <p className={`text-sm font-medium mt-2 ${type.statColor}`}>{type.stat}</p>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      </div>

      {/* 快速操作 */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">快速操作</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action) => {
            const Icon = action.icon
            return (
              <Link
                key={action.href}
                href={action.href}
                className="flex items-center gap-3 p-4 bg-white rounded-lg border border-gray-200 hover:border-blue-500 hover:shadow-md transition-all group"
              >
                <div className="p-2 bg-blue-50 rounded-lg group-hover:bg-blue-100 transition-colors">
                  <Icon className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
                    {action.label}
                  </p>
                  <p className="text-xs text-gray-600">{action.description}</p>
                </div>
              </Link>
            )
          })}
        </div>
      </div>

      {/* 使用指南 */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
          <CheckCircle2 className="h-5 w-5" />
          知識庫管理指南
        </h3>
        <ul className="space-y-2 text-sm text-blue-800">
          <li>• <strong>Persona 定義</strong>: 定義 AI Agent 的角色、專業領域、溝通風格</li>
          <li>• <strong>FAQ 管理</strong>: 新增常見問題，提升 AI 回答準確度</li>
          <li>• <strong>KPI 字典</strong>: 定義業務指標計算邏輯，確保一致性</li>
          <li>• <strong>決策日誌</strong>: 記錄重要決策過程，建立知識傳承</li>
          <li>• <strong>會議摘要</strong>: 保存會議記錄與行動項目</li>
          <li>• <strong>觀點簡報</strong>: 儲存策略簡報與分析報告</li>
        </ul>
      </div>
    </div>
  )
}
