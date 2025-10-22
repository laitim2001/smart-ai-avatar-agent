'use client'

import { useEffect, useState } from 'react'
import { BarChart3, Plus, Pencil, Trash2, Search, Filter, X, Code } from 'lucide-react'

interface KPIItem {
  id: string
  name: string
  definition: string
  calculation: string
  dataSource: string
  owner: string
  tags: string[]
  updateFrequency: 'realtime' | 'hourly' | 'daily' | 'weekly' | 'monthly'
  lastModified: string
}

const FREQUENCY_OPTIONS = [
  { value: 'realtime', label: '即時' },
  { value: 'hourly', label: '每小時' },
  { value: 'daily', label: '每日' },
  { value: 'weekly', label: '每週' },
  { value: 'monthly', label: '每月' },
]

/**
 * KPI 管理介面
 * 提供 KPI 字典的列表展示、CRUD 操作、SQL 語法高亮等功能
 */
export default function KPIPage() {
  const [kpis, setKpis] = useState<KPIItem[]>([])
  const [filteredKpis, setFilteredKpis] = useState<KPIItem[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedTag, setSelectedTag] = useState<string | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [editingKpi, setEditingKpi] = useState<KPIItem | null>(null)

  // 表單狀態
  const [formData, setFormData] = useState({
    name: '',
    definition: '',
    calculation: '',
    dataSource: '',
    owner: '',
    tags: '',
    updateFrequency: 'daily' as KPIItem['updateFrequency'],
  })

  // 載入 KPI 資料
  useEffect(() => {
    loadKpis()
  }, [])

  // 搜尋與篩選
  useEffect(() => {
    let result = kpis

    // 標籤篩選
    if (selectedTag) {
      result = result.filter((kpi) => kpi.tags.includes(selectedTag))
    }

    // 搜尋篩選
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      result = result.filter(
        (kpi) =>
          kpi.name.toLowerCase().includes(query) ||
          kpi.definition.toLowerCase().includes(query) ||
          kpi.calculation.toLowerCase().includes(query)
      )
    }

    setFilteredKpis(result)
  }, [kpis, searchQuery, selectedTag])

  const loadKpis = async () => {
    try {
      const response = await fetch('/api/knowledge/kpi')
      const result = await response.json()

      if (result.success) {
        setKpis(result.data.items || [])
      }
    } catch (error) {
      console.error('[KPI 管理] 載入失敗:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = async () => {
    try {
      const response = await fetch('/api/knowledge/kpi', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          definition: formData.definition,
          calculation: formData.calculation,
          dataSource: formData.dataSource,
          owner: formData.owner,
          tags: formData.tags.split(',').map((t) => t.trim()).filter(Boolean),
          updateFrequency: formData.updateFrequency,
        }),
      })

      const result = await response.json()

      if (result.success) {
        alert('✅ KPI 新增成功！')
        setIsCreating(false)
        resetForm()
        loadKpis()
      } else {
        alert(`❌ 新增失敗: ${result.error.message}`)
      }
    } catch (error) {
      console.error('[KPI 管理] 新增錯誤:', error)
      alert('❌ 新增失敗')
    }
  }

  const handleUpdate = async () => {
    if (!editingKpi) return

    try {
      const response = await fetch('/api/knowledge/kpi', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editingKpi.id,
          name: formData.name,
          definition: formData.definition,
          calculation: formData.calculation,
          dataSource: formData.dataSource,
          owner: formData.owner,
          tags: formData.tags.split(',').map((t) => t.trim()).filter(Boolean),
          updateFrequency: formData.updateFrequency,
        }),
      })

      const result = await response.json()

      if (result.success) {
        alert('✅ KPI 更新成功！')
        setEditingKpi(null)
        resetForm()
        loadKpis()
      } else {
        alert(`❌ 更新失敗: ${result.error.message}`)
      }
    } catch (error) {
      console.error('[KPI 管理] 更新錯誤:', error)
      alert('❌ 更新失敗')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('確定要刪除這個 KPI 嗎？')) return

    try {
      const response = await fetch(`/api/knowledge/kpi?id=${id}`, {
        method: 'DELETE',
      })

      const result = await response.json()

      if (result.success) {
        alert('✅ KPI 刪除成功！')
        loadKpis()
      } else {
        alert(`❌ 刪除失敗: ${result.error.message}`)
      }
    } catch (error) {
      console.error('[KPI 管理] 刪除錯誤:', error)
      alert('❌ 刪除失敗')
    }
  }

  const startEdit = (kpi: KPIItem) => {
    setEditingKpi(kpi)
    setFormData({
      name: kpi.name,
      definition: kpi.definition,
      calculation: kpi.calculation,
      dataSource: kpi.dataSource,
      owner: kpi.owner,
      tags: kpi.tags.join(', '),
      updateFrequency: kpi.updateFrequency,
    })
    setIsCreating(true)
  }

  const resetForm = () => {
    setFormData({
      name: '',
      definition: '',
      calculation: '',
      dataSource: '',
      owner: '',
      tags: '',
      updateFrequency: 'daily',
    })
    setIsCreating(false)
    setEditingKpi(null)
  }

  // 取得所有標籤
  const allTags = Array.from(new Set(kpis.flatMap((kpi) => kpi.tags)))

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">載入 KPI 資料...</p>
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
            <BarChart3 className="h-8 w-8 text-purple-600" />
            KPI 字典管理
          </h1>
          <p className="text-gray-600 mt-2">管理業務指標定義與計算邏輯</p>
        </div>

        <button
          onClick={() => setIsCreating(true)}
          className="px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          新增 KPI
        </button>
      </div>

      {/* 搜尋與篩選 */}
      <div className="flex flex-col md:flex-row gap-4">
        {/* 搜尋框 */}
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="搜尋 KPI 名稱、定義、計算邏輯..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
        </div>

        {/* 標籤篩選 */}
        <div className="flex items-center gap-2 flex-wrap">
          <Filter className="h-5 w-5 text-gray-400" />
          <button
            onClick={() => setSelectedTag(null)}
            className={`px-3 py-1 text-sm rounded-full transition-colors ${
              selectedTag === null
                ? 'bg-purple-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            全部 ({kpis.length})
          </button>
          {allTags.map((tag) => (
            <button
              key={tag}
              onClick={() => setSelectedTag(tag)}
              className={`px-3 py-1 text-sm rounded-full transition-colors ${
                selectedTag === tag
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {tag} ({kpis.filter((k) => k.tags.includes(tag)).length})
            </button>
          ))}
        </div>
      </div>

      {/* 新增/編輯表單 */}
      {isCreating && (
        <div className="bg-white p-6 rounded-lg border-2 border-purple-500 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">
              {editingKpi ? '編輯 KPI' : '新增 KPI'}
            </h2>
            <button onClick={resetForm} className="text-gray-400 hover:text-gray-600">
              <X className="h-6 w-6" />
            </button>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">KPI 名稱 *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="例: 月活躍用戶數 (MAU)"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">負責人 *</label>
                <input
                  type="text"
                  value={formData.owner}
                  onChange={(e) => setFormData({ ...formData, owner: e.target.value })}
                  placeholder="例: 數據分析團隊"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">定義 *</label>
              <textarea
                value={formData.definition}
                onChange={(e) => setFormData({ ...formData, definition: e.target.value })}
                placeholder="描述這個 KPI 的業務意義..."
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                <Code className="h-4 w-4" />
                計算邏輯 (SQL) *
              </label>
              <textarea
                value={formData.calculation}
                onChange={(e) => setFormData({ ...formData, calculation: e.target.value })}
                placeholder="SELECT COUNT(DISTINCT user_id) FROM user_activity WHERE ..."
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none font-mono text-sm"
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">資料來源 *</label>
                <input
                  type="text"
                  value={formData.dataSource}
                  onChange={(e) => setFormData({ ...formData, dataSource: e.target.value })}
                  placeholder="例: user_activity 表"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">更新頻率</label>
                <select
                  value={formData.updateFrequency}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      updateFrequency: e.target.value as KPIItem['updateFrequency'],
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  {FREQUENCY_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  標籤 (逗號分隔)
                </label>
                <input
                  type="text"
                  value={formData.tags}
                  onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                  placeholder="例: 用戶, 活躍度"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <button
                onClick={resetForm}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                取消
              </button>
              <button
                onClick={editingKpi ? handleUpdate : handleCreate}
                disabled={
                  !formData.name ||
                  !formData.definition ||
                  !formData.calculation ||
                  !formData.dataSource ||
                  !formData.owner
                }
                className="px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {editingKpi ? '更新' : '新增'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* KPI 列表 */}
      <div className="space-y-4">
        {filteredKpis.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
            <BarChart3 className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-600">
              {kpis.length === 0 ? '尚無 KPI，點擊上方「新增 KPI」按鈕開始建立' : '沒有符合條件的 KPI'}
            </p>
          </div>
        ) : (
          filteredKpis.map((kpi) => (
            <div
              key={kpi.id}
              className="bg-white p-6 rounded-lg border border-gray-200 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between gap-4 mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-xl font-bold text-gray-900">{kpi.name}</h3>
                    {kpi.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-0.5 bg-purple-50 text-purple-700 rounded-full text-xs"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  <p className="text-gray-700 mb-3">{kpi.definition}</p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => startEdit(kpi)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="編輯"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(kpi.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="刪除"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 mb-3">
                <div className="flex items-center gap-2 mb-2">
                  <Code className="h-4 w-4 text-gray-600" />
                  <span className="text-sm font-medium text-gray-700">計算邏輯 (SQL)</span>
                </div>
                <pre className="text-sm text-gray-800 font-mono whitespace-pre-wrap overflow-x-auto">
                  {kpi.calculation}
                </pre>
              </div>

              <div className="grid grid-cols-4 gap-4 text-sm text-gray-600">
                <div>
                  <span className="font-medium">資料來源:</span> {kpi.dataSource}
                </div>
                <div>
                  <span className="font-medium">負責人:</span> {kpi.owner}
                </div>
                <div>
                  <span className="font-medium">更新頻率:</span>{' '}
                  {FREQUENCY_OPTIONS.find((f) => f.value === kpi.updateFrequency)?.label}
                </div>
                <div>
                  <span className="font-medium">最後更新:</span>{' '}
                  {new Date(kpi.lastModified).toLocaleDateString('zh-TW')}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
