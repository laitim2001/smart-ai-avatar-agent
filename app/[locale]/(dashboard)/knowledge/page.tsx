'use client'

import { useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'
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
  const t = useTranslations('knowledge.overview')
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
      title: t('types.persona.title'),
      description: t('types.persona.description'),
      icon: Users,
      href: '/knowledge/persona',
      color: 'bg-blue-500',
      stat: t('types.persona.stat', { score: stats.personaScore }),
      statColor: stats.personaScore >= 80 ? 'text-green-600' : 'text-orange-600',
    },
    {
      title: t('types.faq.title'),
      description: t('types.faq.description'),
      icon: HelpCircle,
      href: '/knowledge/faq',
      color: 'bg-green-500',
      stat: t('types.faq.stat', { count: stats.faqCount }),
      statColor: 'text-gray-600',
    },
    {
      title: t('types.kpi.title'),
      description: t('types.kpi.description'),
      icon: BarChart3,
      href: '/knowledge/kpi',
      color: 'bg-purple-500',
      stat: t('types.kpi.stat', { count: stats.kpiCount }),
      statColor: 'text-gray-600',
    },
    {
      title: t('types.decisions.title'),
      description: t('types.decisions.description'),
      icon: FileText,
      href: '/knowledge/decisions',
      color: 'bg-orange-500',
      stat: t('types.decisions.stat'),
      statColor: 'text-gray-400',
    },
    {
      title: t('types.meetings.title'),
      description: t('types.meetings.description'),
      icon: Calendar,
      href: '/knowledge/meetings',
      color: 'bg-red-500',
      stat: t('types.meetings.stat'),
      statColor: 'text-gray-400',
    },
    {
      title: t('types.pov.title'),
      description: t('types.pov.description'),
      icon: BookOpen,
      href: '/knowledge/pov',
      color: 'bg-indigo-500',
      stat: t('types.pov.stat'),
      statColor: 'text-gray-400',
    },
  ]

  const quickActions = [
    {
      label: t('quickActions.editPersona'),
      href: '/knowledge/persona',
      icon: Users,
      description: t('quickActions.editPersonaDesc'),
    },
    {
      label: t('quickActions.addFaq'),
      href: '/knowledge/faq',
      icon: HelpCircle,
      description: t('quickActions.addFaqDesc'),
    },
    {
      label: t('quickActions.addKpi'),
      href: '/knowledge/kpi',
      icon: BarChart3,
      description: t('quickActions.addKpiDesc'),
    },
    {
      label: t('quickActions.search'),
      href: '/knowledge/search',
      icon: Brain,
      description: t('quickActions.searchDesc'),
    },
  ]

  const tLoading = useTranslations('knowledge')

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">{tLoading('loading')}</p>
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
            {t('title')}
          </h1>
          <p className="text-gray-600 mt-2">{tLoading('description')}</p>
        </div>
      </div>

      {/* 統計卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">{t('stats.totalFiles')}</p>
              <p className="text-3xl font-bold text-gray-900">{stats.totalFiles}</p>
            </div>
            <FileText className="h-10 w-10 text-blue-500" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">{t('stats.personaQuality')}</p>
              <p className="text-3xl font-bold text-gray-900">{stats.personaScore}%</p>
            </div>
            <TrendingUp className="h-10 w-10 text-green-500" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">{t('stats.lastUpdated')}</p>
              <p className="text-sm font-medium text-gray-900">
                {new Date(stats.lastUpdated).toLocaleString()}
              </p>
            </div>
            <Clock className="h-10 w-10 text-purple-500" />
          </div>
        </div>
      </div>

      {/* 知識類型卡片 */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">{t('types.title')}</h2>
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
        <h2 className="text-xl font-semibold text-gray-900 mb-4">{t('quickActions.title')}</h2>
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
          {t('guide.title')}
        </h3>
        <ul className="space-y-2 text-sm text-blue-800">
          <li>• {t('guide.persona')}</li>
          <li>• {t('guide.faq')}</li>
          <li>• {t('guide.kpi')}</li>
          <li>• {t('guide.decisions')}</li>
          <li>• {t('guide.meetings')}</li>
          <li>• {t('guide.pov')}</li>
        </ul>
      </div>
    </div>
  )
}
