'use client'

import { useRef, useEffect, useState, useCallback } from 'react'
import { Sparkles } from 'lucide-react'
import Spinner from './Spinner'
import { useChatStore } from '@/stores/chatStore'
import { useAudioRecorder } from '@/hooks/useAudioRecorder'
import { VoiceInputButton } from './VoiceInputButton'
import { RecordingIndicator } from './RecordingIndicator'
import { VoiceWaveform } from './VoiceWaveform'
import { LanguageSelector } from './LanguageSelector'
import PromptGalleryModal from '@/components/prompt/PromptGalleryModal'
import type { PromptTemplate } from '@/types/prompt'
import { toast } from 'sonner'

/**
 * 對話介面組件
 *
 * 提供與 Avatar 對話的使用者介面，包含：
 * - 對話歷史顯示區域（顯示所有訊息）
 * - 文字輸入框（支援 Enter 送出、Shift+Enter 換行）
 * - 語音輸入功能（麥克風錄音 + 語音轉文字）
 * - 語言選擇器（zh-TW、en-US、ja-JP）
 * - 錄音指示器（時長、音量、進度條）
 * - 波形視覺化（Canvas 即時繪製）
 * - 送出與清除按鈕（含 Loading 狀態）
 * - 自動滾動到最新訊息
 *
 * @component
 * @example
 * ```tsx
 * import ChatInterface from '@/components/chat/ChatInterface'
 *
 * export default function Page() {
 *   return <ChatInterface />
 * }
 * ```
 */
export default function ChatInterface() {
  // Zustand 狀態管理
  const {
    messages,
    input,
    isLoading,
    sendMessage,
    clearMessages,
    setInput,
    selectedLanguage,
    isTranscribing,
    setLanguage,
    transcribeAudio,
    applyPrompt,
  } = useChatStore()

  // 語音錄音 Hook
  const {
    state: recordingState,
    duration,
    volume,
    error: recordingError,
    waveformData,
    startRecording,
    stopRecording,
    clearError,
  } = useAudioRecorder()

  // Local state for showing waveform
  const [showWaveform, setShowWaveform] = useState(false)

  // Prompt Gallery Modal 狀態
  const [showPromptGallery, setShowPromptGallery] = useState(false)

  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null)

  /**
   * 自動滾動到訊息列表底部
   */
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  /**
   * 處理 Enter 鍵送出邏輯
   * - Enter: 送出訊息
   * - Shift+Enter: 換行
   */
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      if (!isLoading && input.trim() !== '') {
        sendMessage()
      }
    }
  }

  /**
   * 處理清除所有對話
   */
  const handleClear = () => {
    if (window.confirm('確定要清除所有對話紀錄嗎？')) {
      clearMessages()
    }
  }

  /**
   * 處理開始錄音
   */
  const handleStartRecording = useCallback(async () => {
    try {
      clearError()
      await startRecording()
      setShowWaveform(true)
    } catch (error) {
      console.error('[Recording Start Error]', error)
      toast.error('無法開始錄音，請檢查麥克風權限')
    }
  }, [startRecording, clearError])

  /**
   * 處理停止錄音並轉換為文字
   */
  const handleStopRecording = useCallback(async () => {
    try {
      // 停止錄音
      const audioBlob = await stopRecording()

      if (!audioBlob) {
        toast.error('錄音失敗，請重試')
        setShowWaveform(false)
        return
      }

      setShowWaveform(false)

      // 轉換為文字
      const text = await transcribeAudio(audioBlob)

      // 更新輸入框
      setInput(text)

      toast.success('語音轉文字成功')
    } catch (error) {
      console.error('[Recording Stop Error]', error)

      const errorMessage =
        error instanceof Error ? error.message : '語音轉文字失敗，請重試'

      toast.error(errorMessage)
    }
  }, [stopRecording, transcribeAudio, setInput])

  /**
   * 處理選擇 Prompt Template
   */
  const handleSelectPrompt = useCallback(
    (prompt: PromptTemplate) => {
      applyPrompt(prompt.content)
      toast.success(`已套用主題: ${prompt.title}`)
    },
    [applyPrompt]
  )

  /**
   * 處理錄音錯誤
   */
  useEffect(() => {
    if (recordingError) {
      console.error('[Recording Error]', recordingError)
      toast.error(recordingError.message || '錄音發生錯誤')
      setShowWaveform(false)
    }
  }, [recordingError])

  // 監聽訊息變更，自動滾動到底部
  useEffect(() => {
    scrollToBottom()
  }, [messages])

  return (
    <div className="flex flex-col h-full bg-gradient-to-b from-white to-gray-50 rounded-lg shadow-lg">
      {/* 對話歷史區域 */}
      <div className="flex-1 overflow-y-auto p-2 sm:p-4 space-y-2 sm:space-y-4">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-500">
            <p>開始與 Avatar 對話...</p>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${
                message.role === 'user' ? 'justify-end' : 'justify-start'
              }`}
              role="article"
              aria-label={`${message.role === 'user' ? '使用者' : 'Avatar'} 訊息`}
            >
              <div
                className={`max-w-[70%] rounded-lg px-4 py-2 shadow-sm transition-shadow hover:shadow-md ${
                  message.role === 'user'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white border border-gray-200 text-gray-900'
                }`}
              >
                <p className="text-sm whitespace-pre-wrap break-words">
                  {message.content}
                </p>
                <p className="text-xs mt-1 opacity-70">
                  {message.timestamp.toLocaleTimeString('zh-TW', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* 輸入區域 */}
      <div className="border-t border-gray-200 p-2 sm:p-4 bg-white">
        {/* 頂部控制列 */}
        <div className="mb-2 flex items-center justify-between gap-2">
          {/* 語言選擇器 */}
          <LanguageSelector
            value={selectedLanguage}
            onChange={setLanguage}
            disabled={isLoading || recordingState === 'recording'}
            variant="compact"
          />

          {/* Prompt Gallery 按鈕 */}
          <button
            onClick={() => setShowPromptGallery(true)}
            disabled={isLoading || recordingState === 'recording'}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-purple-500 hover:bg-purple-600 text-white rounded-md transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
            aria-label="開啟對話主題庫"
          >
            <Sparkles className="h-4 w-4" />
            <span className="hidden sm:inline">主題庫</span>
          </button>
        </div>

        {/* 錄音指示器（錄音中顯示） */}
        {recordingState === 'recording' && (
          <div className="mb-2">
            <RecordingIndicator
              duration={duration}
              volume={volume}
              onStop={handleStopRecording}
            />
          </div>
        )}

        {/* 波形視覺化（錄音中顯示） */}
        {showWaveform && recordingState === 'recording' && (
          <div className="mb-2 flex justify-center">
            <VoiceWaveform
              waveformData={waveformData}
              width={300}
              height={60}
              className="bg-white border border-gray-200"
            />
          </div>
        )}

        {/* 輸入控制區域 */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-end space-y-2 sm:space-y-0 sm:space-x-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="輸入訊息與 Avatar 對話... (按 Enter 送出)"
            disabled={isLoading || isTranscribing || recordingState === 'recording'}
            rows={1}
            aria-label="對話輸入框"
            aria-describedby="chat-input-hint"
            className="flex-1 resize-none rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed bg-white text-gray-900"
          />
          <span id="chat-input-hint" className="sr-only">
            按 Enter 送出訊息，Shift+Enter 換行
          </span>

          {/* 語音輸入按鈕 */}
          <VoiceInputButton
            state={recordingState}
            onStart={handleStartRecording}
            onStop={handleStopRecording}
            disabled={isLoading || isTranscribing}
          />

          <button
            onClick={sendMessage}
            disabled={isLoading || input.trim() === '' || isTranscribing || recordingState === 'recording'}
            aria-label="送出訊息"
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 hover:scale-105 active:scale-95 disabled:bg-gray-300 dark:disabled:bg-gray-600 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center space-x-2 shadow-md hover:shadow-lg"
          >
            {isLoading ? (
              <>
                <Spinner />
                <span>傳送中...</span>
              </>
            ) : (
              <span>送出</span>
            )}
          </button>
          <button
            onClick={handleClear}
            disabled={isLoading || messages.length === 0 || isTranscribing || recordingState === 'recording'}
            aria-label="清除所有對話"
            className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 hover:scale-105 active:scale-95 disabled:bg-gray-100 disabled:cursor-not-allowed transition-all duration-200 shadow-sm hover:shadow-md"
          >
            清除
          </button>
        </div>
      </div>

      {/* Prompt Gallery Modal */}
      <PromptGalleryModal
        open={showPromptGallery}
        onClose={() => setShowPromptGallery(false)}
        onSelectPrompt={handleSelectPrompt}
      />
    </div>
  )
}
