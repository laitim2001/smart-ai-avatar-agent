'use client'

import { useEffect, useState } from 'react'
import {
  FileText,
  Plus,
  Calendar,
  User,
  AlertCircle,
  CheckCircle2,
  Clock,
  XCircle,
  Search,
  Filter,
  ChevronRight,
} from 'lucide-react'
import Link from 'next/link'
import type { DecisionLogItem } from '@/types/knowledge'
import { useTranslations } from 'next-intl'

/**
 * 決策日誌管理頁面
 */
export default function DecisionsPage() {
  const t = useTranslations()
  const [decisions, setDecisions] = useState<DecisionLogItem[]>([])
  const [filteredDecisions, setFilteredDecisions] = useState<DecisionLogItem[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [selectedDecision, setSelectedDecision] = useState<DecisionLogItem | null>(null)
  const [showDetail, setShowDetail] = useState(false)

  // 載入決策日誌
  useEffect(() => {
    async function loadDecisions() {
      try {
        const response = await fetch('/api/knowledge/decisions')
        const result = await response.json()

        if (result.success) {
          setDecisions(result.data)
          setFilteredDecisions(result.data)
        }
      } catch (error) {
        console.error('[決策日誌] 載入失敗:', error)
      } finally {
        setLoading(false)
      }
    }

    loadDecisions()
  }, [])

  // 搜尋與篩選
  useEffect(() => {
    let result = decisions

    // 狀態篩選
    if (statusFilter !== 'all') {
      result = result.filter((d) => d.status === statusFilter)
    }

    // 搜尋篩選
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      result = result.filter(
        (d) =>
          d.title.toLowerCase().includes(query) ||
          d.context.toLowerCase().includes(query) ||
          d.decision.toLowerCase().includes(query)
      )
    }

    setFilteredDecisions(result)
  }, [decisions, searchQuery, statusFilter])

  // 狀態徽章
  const getStatusBadge = (status: string) => {
    const badges = {
      pending: (
        <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-orange-700 bg-orange-50 rounded-full">
          <Clock className="h-3 w-3" />
          {t('decisions.status.pending')}
        </span>
      ),
      decided: (
        <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-blue-700 bg-blue-50 rounded-full">
          <CheckCircle2 className="h-3 w-3" />
          {t('decisions.status.decided')}
        </span>
      ),
      implemented: (
        <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-green-700 bg-green-50 rounded-full">
          <CheckCircle2 className="h-3 w-3" />
          {t('decisions.status.implemented')}
        </span>
      ),
      cancelled: (
        <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-gray-700 bg-gray-50 rounded-full">
          <XCircle className="h-3 w-3" />
          {t('decisions.status.cancelled')}
        </span>
      ),
    }
    return badges[status as keyof typeof badges] || badges.pending
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">{t('decisions.loading')}</p>
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
            <FileText className="h-8 w-8 text-orange-600" />
            {t('decisions.title')}
          </h1>
          <p className="text-gray-600 mt-2">{t('decisions.description')}</p>
        </div>

        <button className="px-4 py-2 text-sm font-medium text-white bg-orange-600 rounded-lg hover:bg-orange-700 transition-colors flex items-center gap-2">
          <Plus className="h-4 w-4" />
          {t('decisions.addButton')}
        </button>
      </div>

      {/* 統計卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">{t('decisions.stats.total')}</p>
              <p className="text-2xl font-bold text-gray-900">{decisions.length}</p>
            </div>
            <FileText className="h-8 w-8 text-gray-400" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">{t('decisions.stats.pending')}</p>
              <p className="text-2xl font-bold text-orange-600">
                {decisions.filter((d) => d.status === 'pending').length}
              </p>
            </div>
            <Clock className="h-8 w-8 text-orange-400" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">{t('decisions.stats.implemented')}</p>
              <p className="text-2xl font-bold text-green-600">
                {decisions.filter((d) => d.status === 'implemented').length}
              </p>
            </div>
            <CheckCircle2 className="h-8 w-8 text-green-400" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">{t('decisions.stats.thisMonth')}</p>
              <p className="text-2xl font-bold text-blue-600">
                {
                  decisions.filter(
                    (d) => new Date(d.date).getMonth() === new Date().getMonth()
                  ).length
                }
              </p>
            </div>
            <Calendar className="h-8 w-8 text-blue-400" />
          </div>
        </div>
      </div>

      {/* 搜尋與篩選 */}
      <div className="flex items-center gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder={t('decisions.searchPlaceholder')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-gray-500" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          >
            <option value="all">{t('decisions.status.all')}</option>
            <option value="pending">{t('decisions.status.pending')}</option>
            <option value="decided">{t('decisions.status.decided')}</option>
            <option value="implemented">{t('decisions.status.implemented')}</option>
            <option value="cancelled">{t('decisions.status.cancelled')}</option>
          </select>
        </div>
      </div>

      {/* 決策列表 */}
      {filteredDecisions.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">{t('decisions.noDecisions')}</h3>
          <p className="text-gray-600 mb-4">
            {searchQuery || statusFilter !== 'all'
              ? t('decisions.noResults')
              : t('decisions.noDecisionsHint')}
          </p>
          <button className="px-4 py-2 text-sm font-medium text-white bg-orange-600 rounded-lg hover:bg-orange-700 transition-colors">
            {t('decisions.addButton')}
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredDecisions.map((decision) => (
            <div
              key={decision.id}
              className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => {
                setSelectedDecision(decision)
                setShowDetail(true)
              }}
            >
              {/* 標題列 */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">{decision.title}</h3>
                    {getStatusBadge(decision.status)}
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {decision.date}
                    </div>
                    <div className="flex items-center gap-1">
                      <User className="h-4 w-4" />
                      {decision.owner}
                    </div>
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 text-gray-400" />
              </div>

              {/* 背景 */}
              <p className="text-gray-700 mb-3 line-clamp-2">{decision.context}</p>

              {/* 決策結果 */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-3">
                <p className="text-sm font-medium text-green-900 mb-1">✓ {t('decisions.detail.decisionResult')}</p>
                <p className="text-sm text-green-800">{decision.decision}</p>
              </div>

              {/* 標籤 */}
              <div className="flex items-center gap-2 flex-wrap">
                {decision.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-1 text-xs font-medium text-gray-700 bg-gray-100 rounded"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 詳細資訊 Modal */}
      {showDetail && selectedDecision && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              {/* Modal 標題 */}
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    {selectedDecision.title}
                  </h2>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {selectedDecision.date}
                    </div>
                    <div className="flex items-center gap-1">
                      <User className="h-4 w-4" />
                      {selectedDecision.owner}
                    </div>
                    {getStatusBadge(selectedDecision.status)}
                  </div>
                </div>
                <button
                  onClick={() => setShowDetail(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircle className="h-6 w-6" />
                </button>
              </div>

              {/* 背景 */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{t('decisions.detail.context')}</h3>
                <p className="text-gray-700 whitespace-pre-wrap">{selectedDecision.context}</p>
              </div>

              {/* 選項比較 */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">{t('decisions.detail.options')}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {selectedDecision.options.map((option, idx) => (
                    <div
                      key={idx}
                      className="border border-gray-200 rounded-lg p-4 bg-gray-50"
                    >
                      <h4 className="font-semibold text-gray-900 mb-3">{option.title}</h4>

                      <div className="mb-3">
                        <p className="text-sm font-medium text-green-700 mb-1">✓ {t('decisions.detail.pros')}</p>
                        <ul className="text-sm text-gray-700 space-y-1">
                          {option.pros.map((pro, i) => (
                            <li key={i}>• {pro}</li>
                          ))}
                        </ul>
                      </div>

                      <div className="mb-3">
                        <p className="text-sm font-medium text-red-700 mb-1">✗ {t('decisions.detail.cons')}</p>
                        <ul className="text-sm text-gray-700 space-y-1">
                          {option.cons.map((con, i) => (
                            <li key={i}>• {con}</li>
                          ))}
                        </ul>
                      </div>

                      {option.estimatedCost && (
                        <div className="text-sm">
                          <span className="font-medium text-gray-700">{t('decisions.detail.estimatedCost')}: </span>
                          <span className="text-gray-600">{option.estimatedCost}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* 決策與理由 */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{t('decisions.detail.decision')}</h3>
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <p className="font-semibold text-green-900 mb-2">
                    ✓ {selectedDecision.decision}
                  </p>
                  <p className="text-gray-700 whitespace-pre-wrap">
                    {selectedDecision.rationale}
                  </p>
                </div>
              </div>

              {/* 影響評估 */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{t('decisions.detail.impact')}</h3>
                <ul className="space-y-2">
                  {selectedDecision.impact.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-gray-700">
                      <AlertCircle className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* 檢討日期 */}
              {selectedDecision.reviewDate && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm font-medium text-blue-900">
                    📅 {t('decisions.detail.reviewDate')}: {selectedDecision.reviewDate}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
