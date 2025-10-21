'use client'

import { useEffect, useState } from 'react'
import { Users, Save, RotateCcw, CheckCircle2, AlertCircle, TrendingUp } from 'lucide-react'
import MarkdownEditor from '@/components/knowledge/MarkdownEditor'
import MarkdownPreview from '@/components/knowledge/MarkdownPreview'

interface PersonaSection {
  title: string
  content: string
  wordCount: number
  isComplete: boolean
  warnings: string[]
}

interface PersonaData {
  content: string
  metadata: {
    filename: string
    lastModified: string
    size: number
    wordCount: number
  }
  structure: {
    sections: PersonaSection[]
    completeness: number
    consistency: number
  }
}

interface ValidationResult {
  valid: boolean
  errors: Array<{ field: string; message: string }>
  warnings: Array<{ field: string; message: string }>
  score: number
}

/**
 * Persona 編輯器頁面
 * 提供 Markdown 編輯、即時預覽、結構檢查等功能
 */
export default function PersonaEditorPage() {
  const [content, setContent] = useState('')
  const [originalContent, setOriginalContent] = useState('')
  const [personaData, setPersonaData] = useState<PersonaData | null>(null)
  const [validation, setValidation] = useState<ValidationResult | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showPreview, setShowPreview] = useState(true)
  const [hasChanges, setHasChanges] = useState(false)

  // 載入 Persona 資料
  useEffect(() => {
    async function loadPersona() {
      try {
        const response = await fetch('/api/knowledge/persona')
        const result = await response.json()

        if (result.success) {
          const data = result.data as PersonaData
          console.log('[Persona 編輯器] 載入成功 - 內容長度:', data.content.length, '字元')
          console.log('[Persona 編輯器] 前 100 字元:', data.content.substring(0, 100))
          setPersonaData(data)
          setContent(data.content)
          setOriginalContent(data.content)
        } else {
          console.error('[Persona 編輯器] 載入失敗:', result.error)
        }
      } catch (error) {
        console.error('[Persona 編輯器] 載入錯誤:', error)
      } finally {
        setLoading(false)
      }
    }

    loadPersona()
  }, [])

  // 監控內容變更
  useEffect(() => {
    setHasChanges(content !== originalContent)
  }, [content, originalContent])

  // 儲存 Persona
  const handleSave = async () => {
    setSaving(true)
    try {
      const response = await fetch('/api/knowledge/persona', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
      })

      const result = await response.json()

      if (result.success) {
        setOriginalContent(content)
        setValidation(result.data.validation)
        alert('✅ Persona 儲存成功！')
      } else {
        alert(`❌ 儲存失敗: ${result.error.message}`)
        if (result.error.details) {
          setValidation(result.error.details)
        }
      }
    } catch (error) {
      console.error('[Persona 編輯器] 儲存錯誤:', error)
      alert('❌ 儲存失敗，請檢查網路連線')
    } finally {
      setSaving(false)
    }
  }

  // 重置變更
  const handleReset = () => {
    if (confirm('確定要放棄所有未儲存的變更嗎？')) {
      setContent(originalContent)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">載入 Persona 資料...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* 頁面標題與操作按鈕 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Users className="h-8 w-8 text-blue-600" />
            Persona 定義編輯器
          </h1>
          <p className="text-gray-600 mt-2">定義 AI Agent 的角色、專業領域、溝通風格</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowPreview(!showPreview)}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            {showPreview ? '隱藏預覽' : '顯示預覽'}
          </button>

          {hasChanges && (
            <button
              onClick={handleReset}
              disabled={saving}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              <RotateCcw className="h-4 w-4" />
              重置
            </button>
          )}

          <button
            onClick={handleSave}
            disabled={!hasChanges || saving}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save className="h-4 w-4" />
            {saving ? '儲存中...' : '儲存變更'}
          </button>
        </div>
      </div>

      {/* 統計資訊 */}
      {personaData && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">完整度</p>
                <p className="text-2xl font-bold text-gray-900">
                  {personaData.structure.completeness}%
                </p>
              </div>
              <TrendingUp
                className={`h-8 w-8 ${
                  personaData.structure.completeness >= 80
                    ? 'text-green-500'
                    : 'text-orange-500'
                }`}
              />
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">章節數量</p>
                <p className="text-2xl font-bold text-gray-900">
                  {personaData.structure.sections.length}
                </p>
              </div>
              <CheckCircle2 className="h-8 w-8 text-blue-500" />
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">字數</p>
                <p className="text-2xl font-bold text-gray-900">
                  {personaData.metadata.wordCount.toLocaleString()}
                </p>
              </div>
              <Users className="h-8 w-8 text-purple-500" />
            </div>
          </div>
        </div>
      )}

      {/* 驗證警告 */}
      {validation && validation.warnings && validation.warnings.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h3 className="font-semibold text-yellow-900 mb-2 flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            建議改善 ({validation.warnings.length})
          </h3>
          <ul className="space-y-1 text-sm text-yellow-800">
            {validation.warnings.map((warning, idx) => (
              <li key={idx}>• {warning.message}</li>
            ))}
          </ul>
        </div>
      )}

      {/* 編輯器與預覽 */}
      <div className={`grid ${showPreview ? 'grid-cols-2' : 'grid-cols-1'} gap-4`}>
        {/* Markdown 編輯器 */}
        <div>
          <div className="mb-2 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-gray-700">編輯器 (Markdown)</h2>
            {hasChanges && (
              <span className="text-xs text-orange-600 font-medium">● 未儲存變更</span>
            )}
          </div>
          {content && (
            <MarkdownEditor
              key={personaData?.metadata.lastModified || 'editor'}
              value={content}
              onChange={setContent}
              height="calc(100vh - 400px)"
              onSave={handleSave}
            />
          )}
          {!content && (
            <div className="border border-gray-200 rounded-lg overflow-hidden flex items-center justify-center bg-gray-50" style={{height: 'calc(100vh - 400px)'}}>
              <div className="text-gray-500">載入編輯器...</div>
            </div>
          )}
          <p className="text-xs text-gray-500 mt-2">
            💡 提示: 使用 Ctrl+S (或 Cmd+S) 快速儲存
          </p>
        </div>

        {/* Markdown 預覽 */}
        {showPreview && (
          <div>
            <div className="mb-2">
              <h2 className="text-sm font-semibold text-gray-700">即時預覽</h2>
            </div>
            <MarkdownPreview content={content} className="h-[calc(100vh-400px)]" />
          </div>
        )}
      </div>

      {/* 章節導航 */}
      {personaData && personaData.structure.sections.length > 0 && (
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <h3 className="font-semibold text-gray-900 mb-3">📑 章節導航</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2">
            {personaData.structure.sections.map((section, idx) => (
              <div
                key={idx}
                className="text-sm text-gray-700 px-3 py-2 bg-gray-50 rounded border border-gray-200"
              >
                {section.title}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
