'use client'

import { useEffect, useState } from 'react'
import {
  Calendar,
  Plus,
  Users,
  Clock,
  CheckCircle2,
  Circle,
  Search,
  Filter,
  ChevronRight,
  Archive,
  ArchiveRestore,
  FileText,
  Tag,
  AlertCircle,
} from 'lucide-react'
import type { MeetingSummary, ActionItem } from '@/types/knowledge'
import { useTranslations } from 'next-intl'

/**
 * 會議摘要管理頁面
 */
export default function MeetingsPage() {
  const t = useTranslations()
  const [meetings, setMeetings] = useState<MeetingSummary[]>([])
  const [filteredMeetings, setFilteredMeetings] = useState<MeetingSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [archivedFilter, setArchivedFilter] = useState<string>('active')
  const [selectedMeeting, setSelectedMeeting] = useState<MeetingSummary | null>(null)
  const [showDetail, setShowDetail] = useState(false)

  // 載入會議摘要
  useEffect(() => {
    async function loadMeetings() {
      try {
        const response = await fetch('/api/knowledge/meetings')
        const result = await response.json()

        if (result.success) {
          setMeetings(result.data)
          setFilteredMeetings(result.data)
        }
      } catch (error) {
        console.error('[會議摘要] 載入失敗:', error)
      } finally {
        setLoading(false)
      }
    }

    loadMeetings()
  }, [])

  // 搜尋與篩選
  useEffect(() => {
    let result = meetings

    // 歸檔狀態篩選
    if (archivedFilter === 'active') {
      result = result.filter((m) => !m.archived)
    } else if (archivedFilter === 'archived') {
      result = result.filter((m) => m.archived)
    }

    // 類型篩選
    if (typeFilter !== 'all') {
      result = result.filter((m) => m.type === typeFilter)
    }

    // 搜尋篩選
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      result = result.filter(
        (m) =>
          m.title.toLowerCase().includes(query) ||
          m.summary.toLowerCase().includes(query) ||
          m.attendees.some((a) => a.toLowerCase().includes(query))
      )
    }

    setFilteredMeetings(result)
  }, [meetings, searchQuery, typeFilter, archivedFilter])

  // 會議類型徽章
  const getTypeBadge = (type: string) => {
    const badges = {
      planning: (
        <span className="inline-flex items-center px-2 py-1 text-xs font-medium text-blue-700 bg-blue-50 rounded-full">
          {t('meetings.type.planning')}
        </span>
      ),
      review: (
        <span className="inline-flex items-center px-2 py-1 text-xs font-medium text-purple-700 bg-purple-50 rounded-full">
          {t('meetings.type.review')}
        </span>
      ),
      technical: (
        <span className="inline-flex items-center px-2 py-1 text-xs font-medium text-green-700 bg-green-50 rounded-full">
          {t('meetings.type.technical')}
        </span>
      ),
      retrospective: (
        <span className="inline-flex items-center px-2 py-1 text-xs font-medium text-orange-700 bg-orange-50 rounded-full">
          {t('meetings.type.retrospective')}
        </span>
      ),
      standup: (
        <span className="inline-flex items-center px-2 py-1 text-xs font-medium text-gray-700 bg-gray-50 rounded-full">
          {t('meetings.type.standup')}
        </span>
      ),
    }
    return badges[type as keyof typeof badges] || badges.planning
  }

  // 待辦事項狀態徽章
  const getActionStatusBadge = (status: string) => {
    const badges = {
      pending: (
        <span className="inline-flex items-center gap-1 text-xs text-gray-600">
          <Circle className="h-3 w-3" />
          {t('meetings.actionStatus.pending')}
        </span>
      ),
      in_progress: (
        <span className="inline-flex items-center gap-1 text-xs text-blue-600">
          <Clock className="h-3 w-3" />
          {t('meetings.actionStatus.in_progress')}
        </span>
      ),
      completed: (
        <span className="inline-flex items-center gap-1 text-xs text-green-600">
          <CheckCircle2 className="h-3 w-3" />
          {t('meetings.actionStatus.completed')}
        </span>
      ),
    }
    return badges[status as keyof typeof badges] || badges.pending
  }

  // 批次歸檔/恢復
  const handleBatchArchive = async (archive: boolean) => {
    const selectedIds = filteredMeetings
      .filter((m) => !m.archived === archive)
      .map((m) => m.id)

    if (selectedIds.length === 0) {
      alert(archive ? '沒有可歸檔的會議' : '沒有可恢復的會議')
      return
    }

    if (!confirm(`確定要${archive ? '歸檔' : '恢復'} ${selectedIds.length} 個會議嗎？`)) {
      return
    }

    try {
      const promises = selectedIds.map((id) =>
        fetch('/api/knowledge/meetings', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id,
            archived: archive,
          }),
        })
      )

      await Promise.all(promises)

      // 重新載入
      const response = await fetch('/api/knowledge/meetings')
      const result = await response.json()
      if (result.success) {
        setMeetings(result.data)
        alert(`✅ 成功${archive ? '歸檔' : '恢復'} ${selectedIds.length} 個會議`)
      }
    } catch (error) {
      console.error('[會議摘要] 批次操作失敗:', error)
      alert('❌ 操作失敗，請重試')
    }
  }

  // 計算待辦事項統計
  const getActionItemsStats = () => {
    const allActions = meetings.flatMap((m) => m.actionItems || [])
    return {
      total: allActions.length,
      pending: allActions.filter((a) => a.status === 'pending').length,
      inProgress: allActions.filter((a) => a.status === 'in_progress').length,
      completed: allActions.filter((a) => a.status === 'completed').length,
    }
  }

  const actionStats = getActionItemsStats()

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">{t('meetings.loading')}</p>
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
            <Users className="h-8 w-8 text-purple-600" />
            {t('meetings.title')}
          </h1>
          <p className="text-gray-600 mt-2">{t('meetings.description')}</p>
        </div>

        <button className="px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2">
          <Plus className="h-4 w-4" />
          {t('meetings.addButton')}
        </button>
      </div>

      {/* 統計卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">{t('meetings.stats.total')}</p>
              <p className="text-2xl font-bold text-gray-900">{meetings.length}</p>
            </div>
            <FileText className="h-8 w-8 text-gray-400" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">{t('meetings.stats.actionItems')}</p>
              <p className="text-2xl font-bold text-orange-600">{actionStats.pending}</p>
            </div>
            <Circle className="h-8 w-8 text-orange-400" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">{t('meetings.stats.inProgress')}</p>
              <p className="text-2xl font-bold text-blue-600">{actionStats.inProgress}</p>
            </div>
            <Clock className="h-8 w-8 text-blue-400" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">{t('meetings.stats.completed')}</p>
              <p className="text-2xl font-bold text-green-600">{actionStats.completed}</p>
            </div>
            <CheckCircle2 className="h-8 w-8 text-green-400" />
          </div>
        </div>
      </div>

      {/* 搜尋與篩選 */}
      <div className="flex items-center gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder={t('meetings.searchPlaceholder')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-gray-500" />
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            <option value="all">{t('meetings.type.all')}</option>
            <option value="planning">{t('meetings.type.planning')}</option>
            <option value="review">{t('meetings.type.review')}</option>
            <option value="technical">{t('meetings.type.technical')}</option>
            <option value="retrospective">{t('meetings.type.retrospective')}</option>
            <option value="standup">{t('meetings.type.standup')}</option>
          </select>

          <select
            value={archivedFilter}
            onChange={(e) => setArchivedFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            <option value="active">{t('meetings.archiveFilter.active')}</option>
            <option value="archived">{t('meetings.archiveFilter.archived')}</option>
            <option value="all">{t('meetings.archiveFilter.all')}</option>
          </select>
        </div>

        <button
          onClick={() => handleBatchArchive(archivedFilter !== 'archived')}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
        >
          {archivedFilter === 'archived' ? (
            <>
              <ArchiveRestore className="h-4 w-4" />
              {t('meetings.actions.batchRestore')}
            </>
          ) : (
            <>
              <Archive className="h-4 w-4" />
              {t('meetings.actions.batchArchive')}
            </>
          )}
        </button>
      </div>

      {/* 會議列表 */}
      {filteredMeetings.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">{t('meetings.noMeetings')}</h3>
          <p className="text-gray-600 mb-4">
            {searchQuery || typeFilter !== 'all' || archivedFilter !== 'active'
              ? t('meetings.noResults')
              : t('meetings.noMeetingsHint')}
          </p>
          <button className="px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-lg hover:bg-purple-700 transition-colors">
            {t('meetings.addButton')}
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredMeetings.map((meeting) => (
            <div
              key={meeting.id}
              className={`bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer ${
                meeting.archived ? 'opacity-60' : ''
              }`}
              onClick={() => {
                setSelectedMeeting(meeting)
                setShowDetail(true)
              }}
            >
              {/* 標題列 */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">{meeting.title}</h3>
                    {getTypeBadge(meeting.type)}
                    {meeting.archived && (
                      <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-gray-600 bg-gray-100 rounded-full">
                        <Archive className="h-3 w-3" />
                        已歸檔
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {meeting.date}
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {meeting.duration} {t('meetings.detail.duration')}
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      {meeting.attendees.length} {t('meetings.detail.participants')}
                    </div>
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 text-gray-400" />
              </div>

              {/* 摘要 */}
              <p className="text-gray-700 mb-3 line-clamp-2">{meeting.summary}</p>

              {/* 待辦事項摘要 */}
              {meeting.actionItems && meeting.actionItems.length > 0 && (
                <div className="flex items-center gap-4 mb-3">
                  <span className="text-sm font-medium text-gray-700">{t('meetings.detail.actionItems')}:</span>
                  <div className="flex items-center gap-3 text-sm">
                    <span className="text-orange-600">
                      {meeting.actionItems.filter((a) => a.status === 'pending').length} {t('meetings.actionStatus.pending')}
                    </span>
                    <span className="text-blue-600">
                      {meeting.actionItems.filter((a) => a.status === 'in_progress').length} {t('meetings.actionStatus.in_progress')}
                    </span>
                    <span className="text-green-600">
                      {meeting.actionItems.filter((a) => a.status === 'completed').length} {t('meetings.actionStatus.completed')}
                    </span>
                  </div>
                </div>
              )}

              {/* 標籤 */}
              <div className="flex items-center gap-2 flex-wrap">
                {meeting.tags.map((tag) => (
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
      {showDetail && selectedMeeting && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              {/* Modal 標題 */}
              <div className="flex items-start justify-between mb-6">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h2 className="text-2xl font-bold text-gray-900">
                      {selectedMeeting.title}
                    </h2>
                    {getTypeBadge(selectedMeeting.type)}
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {selectedMeeting.date}
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {selectedMeeting.duration} 分鐘
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setShowDetail(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              {/* 參與者 */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  {t('meetings.detail.attendees')}
                </h3>
                <div className="flex flex-wrap gap-2">
                  {selectedMeeting.attendees.map((attendee, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 text-sm font-medium text-blue-700 bg-blue-50 rounded-full"
                    >
                      {attendee}
                    </span>
                  ))}
                </div>
              </div>

              {/* 會議摘要 */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{t('meetings.detail.summary')}</h3>
                <p className="text-gray-700 whitespace-pre-wrap">{selectedMeeting.summary}</p>
              </div>

              {/* 重點摘要 */}
              {selectedMeeting.keyPoints && selectedMeeting.keyPoints.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{t('meetings.detail.keyPoints')}</h3>
                  <ul className="space-y-2">
                    {selectedMeeting.keyPoints.map((point, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-gray-700">
                        <AlertCircle className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* 待辦事項 */}
              {selectedMeeting.actionItems && selectedMeeting.actionItems.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">{t('meetings.detail.actionItems')}</h3>
                  <div className="space-y-3">
                    {selectedMeeting.actionItems.map((action) => (
                      <div
                        key={action.id}
                        className="border border-gray-200 rounded-lg p-4 bg-gray-50"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <p className="font-medium text-gray-900">{action.description}</p>
                          {getActionStatusBadge(action.status)}
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <span>{t('meetings.detail.assignee')}: {action.assignee}</span>
                          <span>{t('meetings.detail.dueDate')}: {action.dueDate}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 決策事項 */}
              {selectedMeeting.decisions && selectedMeeting.decisions.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{t('meetings.detail.decisions')}</h3>
                  <ul className="space-y-2">
                    {selectedMeeting.decisions.map((decision, idx) => (
                      <li
                        key={idx}
                        className="flex items-start gap-2 text-gray-700 bg-green-50 border border-green-200 rounded-lg p-3"
                      >
                        <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                        <span>{decision}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* 後續行動 */}
              {selectedMeeting.nextSteps && selectedMeeting.nextSteps.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{t('meetings.detail.nextSteps')}</h3>
                  <ul className="space-y-2">
                    {selectedMeeting.nextSteps.map((step, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-gray-700">
                        <ChevronRight className="h-5 w-5 text-purple-500 flex-shrink-0 mt-0.5" />
                        <span>{step}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* 標籤 */}
              <div className="flex items-center gap-2 flex-wrap">
                <Tag className="h-4 w-4 text-gray-500" />
                {selectedMeeting.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-1 text-xs font-medium text-gray-700 bg-gray-100 rounded"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
