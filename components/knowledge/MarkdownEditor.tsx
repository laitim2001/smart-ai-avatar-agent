'use client'

import { useEffect, useRef } from 'react'
import Editor, { OnMount } from '@monaco-editor/react'
import * as monaco from 'monaco-editor'

interface MarkdownEditorProps {
  value: string
  onChange: (value: string) => void
  height?: string
  placeholder?: string
  readOnly?: boolean
  onSave?: () => void
}

/**
 * Markdown Editor Component
 * 使用 Monaco Editor 提供專業的 Markdown 編輯體驗
 */
export default function MarkdownEditor({
  value,
  onChange,
  height = '600px',
  placeholder = '# 開始編輯...\n\n',
  readOnly = false,
  onSave,
}: MarkdownEditorProps) {
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null)

  const handleEditorDidMount: OnMount = (editor, monaco) => {
    editorRef.current = editor

    // 註冊儲存快捷鍵 (Ctrl+S / Cmd+S)
    if (onSave) {
      editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => {
        onSave()
      })
    }

    // 設定編輯器選項
    editor.updateOptions({
      fontSize: 14,
      lineHeight: 24,
      wordWrap: 'on',
      minimap: { enabled: false },
      scrollBeyondLastLine: false,
      renderLineHighlight: 'all',
      quickSuggestions: {
        other: true,
        comments: false,
        strings: false,
      },
    })

    // 不需要手動設置 placeholder，Monaco Editor 會透過 value prop 自動處理
  }

  const handleEditorChange = (value: string | undefined) => {
    if (value !== undefined) {
      onChange(value)
    }
  }

  // 當 readOnly 變更時更新編輯器選項
  useEffect(() => {
    if (editorRef.current) {
      editorRef.current.updateOptions({ readOnly })
    }
  }, [readOnly])

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      <Editor
        height={height}
        defaultLanguage="markdown"
        value={value || ''}
        onChange={handleEditorChange}
        onMount={handleEditorDidMount}
        theme="vs-light"
        options={{
          readOnly,
          automaticLayout: true,
          scrollbar: {
            vertical: 'auto',
            horizontal: 'auto',
            useShadows: false,
          },
        }}
        loading={<div className="flex items-center justify-center h-full"><div className="text-gray-500">載入編輯器...</div></div>}
      />
    </div>
  )
}
