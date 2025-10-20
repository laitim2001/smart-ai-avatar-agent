'use client'

import { useState, useRef } from 'react'
import { Upload, Loader2 } from 'lucide-react'

interface PhotoUploadProps {
  onPhotoUploaded: (photoUrl: string) => void
  onError?: (error: string) => void
}

/**
 * 照片上傳組件
 *
 * 支援拖放和點擊上傳照片
 */
export default function PhotoUpload({
  onPhotoUploaded,
  onError
}: PhotoUploadProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [preview, setPreview] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = async (file: File) => {
    // 驗證檔案類型
    if (!file.type.startsWith('image/')) {
      onError?.('請上傳圖片檔案（JPG, PNG, GIF 等）')
      return
    }

    // 驗證檔案大小（最大 10MB）
    if (file.size > 10 * 1024 * 1024) {
      onError?.('照片檔案過大。最大支援 10MB')
      return
    }

    setIsUploading(true)

    try {
      // 讀取檔案並轉換為 Base64
      const reader = new FileReader()

      reader.onload = () => {
        const base64 = reader.result as string
        setPreview(base64)
        onPhotoUploaded(base64)
        setIsUploading(false)
      }

      reader.onerror = () => {
        onError?.('讀取檔案失敗')
        setIsUploading(false)
      }

      reader.readAsDataURL(file)

    } catch (error) {
      console.error('[Photo Upload] Error:', error)
      onError?.('上傳失敗')
      setIsUploading(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)

    const files = Array.from(e.dataTransfer.files)
    if (files.length > 0) {
      handleFileSelect(files[0])
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      handleFileSelect(files[0])
    }
  }

  return (
    <div>
      {/* 上傳區域 */}
      <div
        onClick={handleClick}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`
          relative w-full h-64 border-2 border-dashed rounded-lg
          flex items-center justify-center cursor-pointer
          transition-all duration-200
          ${isDragging
            ? 'border-blue-500 bg-blue-50'
            : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
          }
          ${isUploading ? 'pointer-events-none opacity-50' : ''}
        `}
      >
        {/* 預覽圖片 */}
        {preview && !isUploading && (
          <img
            src={preview}
            alt="Preview"
            className="absolute inset-0 w-full h-full object-contain rounded-lg"
          />
        )}

        {/* 上傳提示 */}
        {!preview && !isUploading && (
          <div className="text-center">
            <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-sm text-gray-600 mb-2">
              點擊或拖放照片到此處上傳
            </p>
            <p className="text-xs text-gray-400">
              支援 JPG, PNG, GIF（最大 10MB）
            </p>
          </div>
        )}

        {/* Loading 狀態 */}
        {isUploading && (
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
            <p className="text-sm text-gray-600">處理中...</p>
          </div>
        )}

        {/* 隱藏的 file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileInputChange}
          className="hidden"
        />
      </div>

      {/* 重新上傳按鈕 */}
      {preview && !isUploading && (
        <button
          type="button"
          onClick={handleClick}
          className="mt-2 w-full px-4 py-2 text-sm text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
        >
          重新上傳
        </button>
      )}
    </div>
  )
}
