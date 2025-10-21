'use client'

import { useEffect, useState } from 'react'
import {
  BookOpen,
  Plus,
  Search,
  Filter,
  ChevronRight,
  Eye,
  ThumbsUp,
  Calendar,
  User,
  Tag,
  FileText,
  Edit,
  Trash2,
} from 'lucide-react'
import Link from 'next/link'
import type { POVArticle } from '@/types/knowledge'

/**
 * POV 文章管理頁面
 */
export default function POVArticlesPage() {
  const [articles, setArticles] = useState<POVArticle[]>([])
  const [filteredArticles, setFilteredArticles] = useState<POVArticle[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [selectedArticle, setSelectedArticle] = useState<POVArticle | null>(null)
  const [showDetail, setShowDetail] = useState(false)

  // 載入 POV 文章
  useEffect(() => {
    async function loadArticles() {
      try {
        const response = await fetch('/api/knowledge/pov')
        const result = await response.json()

        if (result.success) {
          setArticles(result.data)
          setFilteredArticles(result.data)
        }
      } catch (error) {
        console.error('[POV 文章] 載入失敗:', error)
      } finally {
        setLoading(false)
      }
    }

    loadArticles()
  }, [])

  // 搜尋與篩選
  useEffect(() => {
    let result = articles

    // 狀態篩選
    if (statusFilter !== 'all') {
      result = result.filter((a) => a.status === statusFilter)
    }

    // 分類篩選
    if (categoryFilter !== 'all') {
      result = result.filter((a) => a.category === categoryFilter)
    }

    // 搜尋篩選
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      result = result.filter(
        (a) =>
          a.title.toLowerCase().includes(query) ||
          a.excerpt.toLowerCase().includes(query) ||
          a.author.toLowerCase().includes(query)
      )
    }

    setFilteredArticles(result)
  }, [articles, searchQuery, statusFilter, categoryFilter])

  // 狀態徽章
  const getStatusBadge = (status: string) => {
    const badges = {
      draft: (
        <span className="inline-flex items-center px-2 py-1 text-xs font-medium text-gray-700 bg-gray-100 rounded-full">
          草稿
        </span>
      ),
      published: (
        <span className="inline-flex items-center px-2 py-1 text-xs font-medium text-green-700 bg-green-50 rounded-full">
          已發布
        </span>
      ),
      archived: (
        <span className="inline-flex items-center px-2 py-1 text-xs font-medium text-orange-700 bg-orange-50 rounded-full">
          已歸檔
        </span>
      ),
    }
    return badges[status as keyof typeof badges] || badges.draft
  }

  // 分類徽章
  const getCategoryBadge = (category: string) => {
    const badges = {
      strategy: (
        <span className="inline-flex items-center px-2 py-1 text-xs font-medium text-blue-700 bg-blue-50 rounded">
          策略
        </span>
      ),
      technical: (
        <span className="inline-flex items-center px-2 py-1 text-xs font-medium text-purple-700 bg-purple-50 rounded">
          技術
        </span>
      ),
      product: (
        <span className="inline-flex items-center px-2 py-1 text-xs font-medium text-green-700 bg-green-50 rounded">
          產品
        </span>
      ),
      culture: (
        <span className="inline-flex items-center px-2 py-1 text-xs font-medium text-orange-700 bg-orange-50 rounded">
          文化
        </span>
      ),
    }
    return badges[category as keyof typeof badges] || badges.technical
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">載入 POV 文章...</p>
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
            <BookOpen className="h-8 w-8 text-indigo-600" />
            POV 文章管理
          </h1>
          <p className="text-gray-600 mt-2">分享團隊的觀點、洞察與技術經驗</p>
        </div>

        <button className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2">
          <Plus className="h-4 w-4" />
          新增文章
        </button>
      </div>

      {/* 統計卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">文章總數</p>
              <p className="text-2xl font-bold text-gray-900">{articles.length}</p>
            </div>
            <FileText className="h-8 w-8 text-gray-400" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">已發布</p>
              <p className="text-2xl font-bold text-green-600">
                {articles.filter((a) => a.status === 'published').length}
              </p>
            </div>
            <BookOpen className="h-8 w-8 text-green-400" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">草稿</p>
              <p className="text-2xl font-bold text-gray-600">
                {articles.filter((a) => a.status === 'draft').length}
              </p>
            </div>
            <Edit className="h-8 w-8 text-gray-400" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">總瀏覽數</p>
              <p className="text-2xl font-bold text-blue-600">
                {articles.reduce((sum, a) => sum + a.views, 0)}
              </p>
            </div>
            <Eye className="h-8 w-8 text-blue-400" />
          </div>
        </div>
      </div>

      {/* 搜尋與篩選 */}
      <div className="flex items-center gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="搜尋文章標題、摘要、作者..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-gray-500" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          >
            <option value="all">全部狀態</option>
            <option value="draft">草稿</option>
            <option value="published">已發布</option>
            <option value="archived">已歸檔</option>
          </select>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          >
            <option value="all">全部分類</option>
            <option value="strategy">策略</option>
            <option value="technical">技術</option>
            <option value="product">產品</option>
            <option value="culture">文化</option>
          </select>
        </div>
      </div>

      {/* 文章列表 */}
      {filteredArticles.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <BookOpen className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">尚無 POV 文章</h3>
          <p className="text-gray-600 mb-4">
            {searchQuery || statusFilter !== 'all' || categoryFilter !== 'all'
              ? '找不到符合條件的文章'
              : '開始分享您的觀點與洞察'}
          </p>
          <button className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors">
            新增文章
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredArticles.map((article) => (
            <div
              key={article.id}
              className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => {
                setSelectedArticle(article)
                setShowDetail(true)
              }}
            >
              {/* 標題列 */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">{article.title}</h3>
                    {getStatusBadge(article.status)}
                    {getCategoryBadge(article.category)}
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <User className="h-4 w-4" />
                      {article.author}
                    </div>
                    {article.publishDate && (
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {article.publishDate}
                      </div>
                    )}
                    <div className="flex items-center gap-1">
                      <Eye className="h-4 w-4" />
                      {article.views} 次瀏覽
                    </div>
                    <div className="flex items-center gap-1">
                      <ThumbsUp className="h-4 w-4" />
                      {article.likes} 個讚
                    </div>
                    <div className="text-gray-500">閱讀時間: {article.readingTime} 分鐘</div>
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 text-gray-400" />
              </div>

              {/* 摘要 */}
              <p className="text-gray-700 mb-3 line-clamp-2">{article.excerpt}</p>

              {/* 標籤 */}
              <div className="flex items-center gap-2 flex-wrap">
                {article.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-1 text-xs font-medium text-gray-700 bg-gray-100 rounded"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 詳細資訊 Modal */}
      {showDetail && selectedArticle && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              {/* Modal 標題 */}
              <div className="flex items-start justify-between mb-6 border-b border-gray-200 pb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h2 className="text-2xl font-bold text-gray-900">{selectedArticle.title}</h2>
                    {getStatusBadge(selectedArticle.status)}
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                    <div className="flex items-center gap-1">
                      <User className="h-4 w-4" />
                      {selectedArticle.author}
                    </div>
                    {selectedArticle.publishDate && (
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        發布於 {selectedArticle.publishDate}
                      </div>
                    )}
                    <div>最後更新: {selectedArticle.lastModified}</div>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <Eye className="h-4 w-4" />
                      {selectedArticle.views} 次瀏覽
                    </div>
                    <div className="flex items-center gap-1">
                      <ThumbsUp className="h-4 w-4" />
                      {selectedArticle.likes} 個讚
                    </div>
                    <div>閱讀時間: {selectedArticle.readingTime} 分鐘</div>
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

              {/* 分類與標籤 */}
              <div className="mb-6">
                <div className="flex items-center gap-2 flex-wrap">
                  {getCategoryBadge(selectedArticle.category)}
                  {selectedArticle.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-1 text-xs font-medium text-gray-700 bg-gray-100 rounded"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* 摘要 */}
              <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm font-medium text-blue-900 mb-2">📝 文章摘要</p>
                <p className="text-blue-800">{selectedArticle.excerpt}</p>
              </div>

              {/* 文章內容 */}
              <div className="prose max-w-none">
                <div className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                  {selectedArticle.content}
                </div>
              </div>

              {/* 操作按鈕 */}
              <div className="mt-6 pt-6 border-t border-gray-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <button className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2">
                    <Edit className="h-4 w-4" />
                    編輯文章
                  </button>
                  {selectedArticle.status === 'draft' && (
                    <button className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors">
                      發布
                    </button>
                  )}
                </div>
                <button className="px-4 py-2 text-sm font-medium text-red-700 bg-red-50 rounded-lg hover:bg-red-100 transition-colors flex items-center gap-2">
                  <Trash2 className="h-4 w-4" />
                  刪除
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
