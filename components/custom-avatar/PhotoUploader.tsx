'use client'

import { useState, useRef } from 'react'
import { Upload, Camera, X } from 'lucide-react'
import { toast } from 'sonner'

interface PhotoUploaderProps {
  onPhotoSelect: (file: File) => void
  onGenerate: () => void
  isGenerating: boolean
  selectedPhoto: File | null
  onClearPhoto: () => void
}

export default function PhotoUploader({
  onPhotoSelect,
  onGenerate,
  isGenerating,
  selectedPhoto,
  onClearPhoto,
}: PhotoUploaderProps) {
  const [dragActive, setDragActive] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    const files = e.dataTransfer.files
    if (files && files[0]) {
      handleFile(files[0])
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files[0]) {
      handleFile(files[0])
    }
  }

  const handleFile = (file: File) => {
    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png']
    if (!allowedTypes.includes(file.type)) {
      toast.error('不支援的檔案格式', {
        description: '請上傳 JPG 或 PNG 格式的照片',
      })
      return
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024
    if (file.size > maxSize) {
      toast.error('照片檔案過大', {
        description: '最大支援 10MB',
      })
      return
    }

    // Create preview URL
    const url = URL.createObjectURL(file)
    setPreviewUrl(url)

    // Notify parent
    onPhotoSelect(file)
    toast.success('照片已選擇', {
      description: `${file.name} (${(file.size / 1024).toFixed(2)} KB)`,
    })
  }

  const handleClear = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl)
    }
    setPreviewUrl(null)
    onClearPhoto()
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleClick = () => {
    fileInputRef.current?.click()
  }

  return (
    <div className="w-full">
      {!selectedPhoto ? (
        <div
          className={`
            relative border-2 border-dashed rounded-lg p-8 text-center transition-all
            ${dragActive
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-300 bg-white hover:border-blue-400 hover:bg-gray-50'
            }
            ${isGenerating ? 'opacity-50 pointer-events-none' : 'cursor-pointer'}
          `}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={handleClick}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/jpg,image/png"
            onChange={handleChange}
            className="hidden"
            disabled={isGenerating}
          />

          <div className="flex flex-col items-center justify-center space-y-4">
            <div className="rounded-full bg-blue-100 p-4">
              <Camera className="h-8 w-8 text-blue-600" />
            </div>

            <div>
              <p className="text-lg font-semibold text-gray-900 mb-1">
                上傳照片創建專屬 Avatar
              </p>
              <p className="text-sm text-gray-500 mb-2">
                拖放照片到此處，或點擊選擇檔案
              </p>
              <p className="text-xs text-gray-400">
                支援 JPG、PNG 格式 • 最大 10MB
              </p>
            </div>

            <button
              type="button"
              className="inline-flex items-center px-4 py-2 border border-blue-600 rounded-md shadow-sm text-sm font-medium text-blue-600 bg-white hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              onClick={(e) => {
                e.stopPropagation()
                handleClick()
              }}
            >
              <Upload className="h-4 w-4 mr-2" />
              選擇照片
            </button>
          </div>

          <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
            <p className="text-xs text-yellow-800 font-medium mb-2">📸 拍照建議:</p>
            <ul className="text-xs text-yellow-700 space-y-1 text-left ml-4">
              <li>• 清晰的正面照</li>
              <li>• 光線充足</li>
              <li>• 避免遮擋物（帽子、墨鏡等）</li>
              <li>• 建議尺寸: 512x512px 以上</li>
            </ul>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="relative rounded-lg overflow-hidden bg-gray-100 border-2 border-gray-300">
            {previewUrl && (
              <img
                src={previewUrl}
                alt="Selected photo"
                className="w-full h-64 object-contain"
              />
            )}

            <button
              type="button"
              onClick={handleClear}
              disabled={isGenerating}
              className="absolute top-2 right-2 p-2 rounded-full bg-red-500 text-white hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="清除照片"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-md">
            <div className="flex items-center">
              <div className="rounded-full bg-green-500 p-1 mr-3">
                <svg className="h-4 w-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-green-900">
                  {selectedPhoto.name}
                </p>
                <p className="text-xs text-green-700">
                  {(selectedPhoto.size / 1024).toFixed(2)} KB
                </p>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={onGenerate}
            disabled={isGenerating}
            className="w-full inline-flex items-center justify-center px-6 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isGenerating ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2" />
                生成中...
              </>
            ) : (
              <>
                <Camera className="h-5 w-5 mr-2" />
                生成 3D Avatar
              </>
            )}
          </button>
        </div>
      )}
    </div>
  )
}
