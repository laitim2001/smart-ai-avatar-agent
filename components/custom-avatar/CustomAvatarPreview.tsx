'use client'

import { Suspense } from 'react'
import dynamic from 'next/dynamic'
import { Loader2 } from 'lucide-react'

// Dynamic import AvatarCanvas to avoid SSR issues
const AvatarCanvas = dynamic(() => import('@/components/avatar/AvatarCanvas'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-gradient-to-b from-blue-50 to-indigo-100">
      <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
    </div>
  ),
})

interface CustomAvatarPreviewProps {
  avatarUrl: string
  name?: string
}

export default function CustomAvatarPreview({
  avatarUrl,
  name = 'Custom Avatar',
}: CustomAvatarPreviewProps) {
  return (
    <div className="w-full h-96 rounded-lg overflow-hidden border-2 border-gray-200 bg-gradient-to-b from-blue-50 to-indigo-100">
      <div className="relative w-full h-full">
        {/* 3D Avatar Preview */}
        <Suspense
          fallback={
            <div className="w-full h-full flex items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
          }
        >
          <div className="w-full h-full">
            {/*
              暫時使用簡化版預覽
              未來可以整合完整的 3D Canvas
            */}
            <div className="w-full h-full flex flex-col items-center justify-center p-6">
              <div className="text-center space-y-4">
                <div className="rounded-full bg-blue-100 p-4 mx-auto w-24 h-24 flex items-center justify-center">
                  <svg
                    className="h-12 w-12 text-blue-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                </div>
                <div>
                  <p className="font-semibold text-gray-900">{name}</p>
                  <p className="text-sm text-gray-600 mt-1">3D Avatar Preview</p>
                  <p className="text-xs text-gray-500 mt-2">
                    GLB 模型 URL: {avatarUrl.substring(0, 50)}...
                  </p>
                </div>
                <div className="mt-4 p-3 bg-blue-100 rounded-md">
                  <p className="text-xs text-blue-800">
                    💡 提示: Avatar 已成功生成！您可以在對話頁面中使用這個 Avatar。
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Suspense>

        {/* Name Badge */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-white px-4 py-2 rounded-full shadow-lg border border-gray-200">
          <p className="text-sm font-medium text-gray-900">{name}</p>
        </div>
      </div>
    </div>
  )
}
