'use client'

import { useEffect, useState } from 'react'
import { Loader2, CheckCircle, AlertCircle } from 'lucide-react'

interface AvatarGeneratorProps {
  isGenerating: boolean
  progress: number
  status: 'idle' | 'uploading' | 'processing' | 'success' | 'error'
  error: string | null
}

export default function AvatarGenerator({
  isGenerating,
  progress,
  status,
  error,
}: AvatarGeneratorProps) {
  const [dots, setDots] = useState('')

  useEffect(() => {
    if (isGenerating) {
      const interval = setInterval(() => {
        setDots((prev) => (prev.length >= 3 ? '' : prev + '.'))
      }, 500)
      return () => clearInterval(interval)
    } else {
      setDots('')
    }
  }, [isGenerating])

  if (!isGenerating && status === 'idle') {
    return null
  }

  const getStatusMessage = () => {
    switch (status) {
      case 'uploading':
        return `上傳照片中${dots}`
      case 'processing':
        return `AI 正在生成您的 3D Avatar${dots}`
      case 'success':
        return 'Avatar 生成成功！'
      case 'error':
        return 'Avatar 生成失敗'
      default:
        return `處理中${dots}`
    }
  }

  const getStatusIcon = () => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-12 w-12 text-green-500" />
      case 'error':
        return <AlertCircle className="h-12 w-12 text-red-500" />
      default:
        return <Loader2 className="h-12 w-12 text-blue-600 animate-spin" />
    }
  }

  const getStatusColor = () => {
    switch (status) {
      case 'success':
        return 'bg-green-50 border-green-200'
      case 'error':
        return 'bg-red-50 border-red-200'
      default:
        return 'bg-blue-50 border-blue-200'
    }
  }

  return (
    <div className={`
      p-6 rounded-lg border-2 transition-all
      ${getStatusColor()}
    `}>
      <div className="flex flex-col items-center justify-center space-y-4">
        {/* Status Icon */}
        <div className="relative">
          {getStatusIcon()}
          {isGenerating && status !== 'error' && (
            <div className="absolute -inset-2 rounded-full border-4 border-blue-200 border-t-blue-600 animate-spin" />
          )}
        </div>

        {/* Status Message */}
        <div className="text-center">
          <h3 className={`
            text-lg font-semibold mb-1
            ${status === 'success' ? 'text-green-900' : status === 'error' ? 'text-red-900' : 'text-blue-900'}
          `}>
            {getStatusMessage()}
          </h3>

          {status === 'processing' && (
            <p className="text-sm text-blue-700">
              通常需要 30-60 秒，請稍候...
            </p>
          )}

          {status === 'error' && error && (
            <p className="text-sm text-red-700 mt-2">
              {error}
            </p>
          )}
        </div>

        {/* Progress Bar */}
        {isGenerating && status !== 'error' && (
          <div className="w-full max-w-md">
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-600 transition-all duration-300 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-xs text-gray-600 mt-1 text-center">
              {progress}%
            </p>
          </div>
        )}

        {/* Success Message */}
        {status === 'success' && (
          <div className="mt-4 p-4 bg-white rounded-md border border-green-200">
            <p className="text-sm text-green-800">
              🎉 您的專屬 3D Avatar 已準備就緒！請在下方預覽並儲存。
            </p>
          </div>
        )}

        {/* Error Actions */}
        {status === 'error' && (
          <div className="mt-4 p-4 bg-white rounded-md border border-red-200">
            <p className="text-sm text-red-800 mb-3">
              💡 請檢查:
            </p>
            <ul className="text-xs text-red-700 space-y-1 ml-4">
              <li>• 照片是否清晰且為正面照</li>
              <li>• 光線是否充足</li>
              <li>• 檔案格式是否正確 (JPG/PNG)</li>
              <li>• 檔案大小是否超過 10MB</li>
            </ul>
          </div>
        )}
      </div>
    </div>
  )
}
