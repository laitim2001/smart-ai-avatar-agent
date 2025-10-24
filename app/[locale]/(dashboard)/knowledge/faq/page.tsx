'use client'

import { useEffect, useState } from 'react'
import { HelpCircle, Plus, Pencil, Trash2, Search, Tag, X } from 'lucide-react'
import { useTranslations } from 'next-intl'

interface FAQItem {
  id: string
  question: string
  answer: string
  tags: string[]
  keywords: string[]
  usage: number
  lastModified: string
}

/**
 * FAQ 管理介面
 * 提供 FAQ 的列表展示、CRUD 操作、搜尋、標籤分類等功能
 */
export default function FAQPage() {
  const t = useTranslations()
  const [faqs, setFaqs] = useState<FAQItem[]>([])
  const [filteredFaqs, setFilteredFaqs] = useState<FAQItem[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedTag, setSelectedTag] = useState<string | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [editingFaq, setEditingFaq] = useState<FAQItem | null>(null)

  // 表單狀態
  const [formData, setFormData] = useState({
    question: '',
    answer: '',
    tags: '',
    keywords: '',
  })

  // 載入 FAQ 資料
  useEffect(() => {
    loadFaqs()
  }, [])

  // 搜尋與篩選
  useEffect(() => {
    let result = faqs

    // 標籤篩選
    if (selectedTag) {
      result = result.filter((faq) => faq.tags.includes(selectedTag))
    }

    // 搜尋篩選
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      result = result.filter(
        (faq) =>
          faq.question.toLowerCase().includes(query) ||
          faq.answer.toLowerCase().includes(query) ||
          faq.keywords.some((k) => k.toLowerCase().includes(query))
      )
    }

    setFilteredFaqs(result)
  }, [faqs, searchQuery, selectedTag])

  const loadFaqs = async () => {
    try {
      const response = await fetch('/api/knowledge/faq')
      const result = await response.json()

      if (result.success) {
        setFaqs(result.data.items || [])
      }
    } catch (error) {
      console.error('[FAQ 管理] 載入失敗:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = async () => {
    try {
      const response = await fetch('/api/knowledge/faq', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: formData.question,
          answer: formData.answer,
          tags: formData.tags.split(',').map((t) => t.trim()).filter(Boolean),
          keywords: formData.keywords.split(',').map((k) => k.trim()).filter(Boolean),
        }),
      })

      const result = await response.json()

      if (result.success) {
        alert(t('faq.messages.createSuccess'))
        setIsCreating(false)
        setFormData({ question: '', answer: '', tags: '', keywords: '' })
        loadFaqs()
      } else {
        alert(`${t('faq.messages.createError')}: ${result.error.message}`)
      }
    } catch (error) {
      console.error('[FAQ 管理] 新增錯誤:', error)
      alert(t('faq.messages.createError'))
    }
  }

  const handleUpdate = async () => {
    if (!editingFaq) return

    try {
      const response = await fetch('/api/knowledge/faq', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editingFaq.id,
          question: formData.question,
          answer: formData.answer,
          tags: formData.tags.split(',').map((t) => t.trim()).filter(Boolean),
          keywords: formData.keywords.split(',').map((k) => k.trim()).filter(Boolean),
        }),
      })

      const result = await response.json()

      if (result.success) {
        alert(t('faq.messages.updateSuccess'))
        setEditingFaq(null)
        setFormData({ question: '', answer: '', tags: '', keywords: '' })
        loadFaqs()
      } else {
        alert(`${t('faq.messages.updateError')}: ${result.error.message}`)
      }
    } catch (error) {
      console.error('[FAQ 管理] 更新錯誤:', error)
      alert(t('faq.messages.updateError'))
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm(t('faq.messages.deleteConfirm'))) return

    try {
      const response = await fetch(`/api/knowledge/faq?id=${id}`, {
        method: 'DELETE',
      })

      const result = await response.json()

      if (result.success) {
        alert(t('faq.messages.deleteSuccess'))
        loadFaqs()
      } else {
        alert(`${t('faq.messages.deleteError')}: ${result.error.message}`)
      }
    } catch (error) {
      console.error('[FAQ 管理] 刪除錯誤:', error)
      alert(t('faq.messages.deleteError'))
    }
  }

  const startEdit = (faq: FAQItem) => {
    setEditingFaq(faq)
    setFormData({
      question: faq.question,
      answer: faq.answer,
      tags: faq.tags.join(', '),
      keywords: faq.keywords.join(', '),
    })
    setIsCreating(true)
  }

  const cancelEdit = () => {
    setIsCreating(false)
    setEditingFaq(null)
    setFormData({ question: '', answer: '', tags: '', keywords: '' })
  }

  // 取得所有標籤
  const allTags = Array.from(new Set(faqs.flatMap((faq) => faq.tags)))

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">{t('faq.loading')}</p>
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
            <HelpCircle className="h-8 w-8 text-green-600" />
            {t('faq.title')}
          </h1>
          <p className="text-gray-600 mt-2">{t('faq.description')}</p>
        </div>

        <button
          onClick={() => setIsCreating(true)}
          className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          {t('faq.addButton')}
        </button>
      </div>

      {/* 搜尋與篩選 */}
      <div className="flex flex-col md:flex-row gap-4">
        {/* 搜尋框 */}
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder={t('faq.searchPlaceholder')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
        </div>

        {/* 標籤篩選 */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm text-gray-600">{t('button.filter')}:</span>
          <button
            onClick={() => setSelectedTag(null)}
            className={`px-3 py-1 text-sm rounded-full transition-colors ${
              selectedTag === null
                ? 'bg-green-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {t('faq.allTag')} ({faqs.length})
          </button>
          {allTags.map((tag) => (
            <button
              key={tag}
              onClick={() => setSelectedTag(tag)}
              className={`px-3 py-1 text-sm rounded-full transition-colors ${
                selectedTag === tag
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {tag} ({faqs.filter((f) => f.tags.includes(tag)).length})
            </button>
          ))}
        </div>
      </div>

      {/* 新增/編輯表單 */}
      {isCreating && (
        <div className="bg-white p-6 rounded-lg border-2 border-green-500 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">
              {editingFaq ? t('faq.editTitle') : t('faq.createTitle')}
            </h2>
            <button onClick={cancelEdit} className="text-gray-400 hover:text-gray-600">
              <X className="h-6 w-6" />
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('faq.form.question')} {t('faq.form.required')}
              </label>
              <input
                type="text"
                value={formData.question}
                onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                placeholder={t('faq.form.questionPlaceholder')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('faq.form.answer')} {t('faq.form.required')}
              </label>
              <textarea
                value={formData.answer}
                onChange={(e) => setFormData({ ...formData, answer: e.target.value })}
                placeholder={t('faq.form.answerPlaceholder')}
                rows={6}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('faq.form.tags')}
                </label>
                <input
                  type="text"
                  value={formData.tags}
                  onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                  placeholder={t('faq.form.tagsPlaceholder')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('faq.form.keywords')}
                </label>
                <input
                  type="text"
                  value={formData.keywords}
                  onChange={(e) => setFormData({ ...formData, keywords: e.target.value })}
                  placeholder={t('faq.form.keywordsPlaceholder')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <button
                onClick={cancelEdit}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                {t('faq.actions.cancel')}
              </button>
              <button
                onClick={editingFaq ? handleUpdate : handleCreate}
                disabled={!formData.question || !formData.answer}
                className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {editingFaq ? t('faq.actions.update') : t('faq.actions.create')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FAQ 列表 */}
      <div className="space-y-3">
        {filteredFaqs.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
            <HelpCircle className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-600">
              {faqs.length === 0 ? t('faq.noFaqs') : t('faq.noResults')}
            </p>
          </div>
        ) : (
          filteredFaqs.map((faq) => (
            <div key={faq.id} className="bg-white p-5 rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 text-lg mb-2">{faq.question}</h3>
                  <p className="text-gray-700 mb-3 whitespace-pre-line">{faq.answer}</p>

                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    {faq.tags.length > 0 && (
                      <div className="flex items-center gap-1">
                        <Tag className="h-4 w-4" />
                        {faq.tags.map((tag) => (
                          <span
                            key={tag}
                            className="px-2 py-0.5 bg-green-50 text-green-700 rounded-full text-xs"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                    <span>{t('faq.stats.usage')}: {faq.usage}</span>
                    <span>{t('faq.stats.updated')}: {new Date(faq.lastModified).toLocaleDateString()}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => startEdit(faq)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title={t('faq.actions.edit')}
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(faq.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title={t('faq.actions.delete')}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
