/**
 * Error Boundary 組件
 * @module components/ErrorBoundary
 * @description 捕捉 React 渲染錯誤並顯示友善錯誤頁面
 */

'use client'

import { Component, ReactNode } from 'react'
import { getFriendlyErrorMessage } from '@/lib/utils/error-messages'

interface ErrorBoundaryProps {
  children: ReactNode
  fallback?: (error: Error, resetError: () => void) => ReactNode
}

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
}

/**
 * Error Boundary 組件
 *
 * 捕捉子組件樹中的 JavaScript 錯誤，記錄錯誤，並顯示備用 UI
 *
 * @example
 * ```tsx
 * <ErrorBoundary>
 *   <YourComponent />
 * </ErrorBoundary>
 * ```
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
    }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    // 更新 state 以便下次渲染顯示備用 UI
    return {
      hasError: true,
      error,
    }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    // 記錄錯誤到控制台（可擴展為錯誤追蹤服務）
    console.error('[ErrorBoundary] Caught error:', error, errorInfo)
  }

  resetError = (): void => {
    this.setState({
      hasError: false,
      error: null,
    })
  }

  render(): ReactNode {
    const { hasError, error } = this.state
    const { children, fallback } = this.props

    if (hasError && error) {
      // 使用自訂 fallback 或預設錯誤 UI
      if (fallback) {
        return fallback(error, this.resetError)
      }

      const friendlyMessage = getFriendlyErrorMessage(error)

      return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
          <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 space-y-6">
            {/* 錯誤圖示 */}
            <div className="flex justify-center">
              <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
                <svg
                  className="w-8 h-8 text-red-600 dark:text-red-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </div>
            </div>

            {/* 錯誤標題 */}
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                發生錯誤
              </h2>
              <p className="text-gray-600 dark:text-gray-400">{friendlyMessage}</p>
            </div>

            {/* 錯誤詳情（開發模式） */}
            {process.env.NODE_ENV === 'development' && (
              <details className="bg-gray-100 dark:bg-gray-700 rounded-lg p-4">
                <summary className="cursor-pointer text-sm font-medium text-gray-700 dark:text-gray-300">
                  技術詳情
                </summary>
                <pre className="mt-2 text-xs text-red-600 dark:text-red-400 overflow-x-auto">
                  {error.message}
                  {'\n\n'}
                  {error.stack}
                </pre>
              </details>
            )}

            {/* 操作按鈕 */}
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={this.resetError}
                className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                重試
              </button>
              <button
                onClick={() => window.location.reload()}
                className="flex-1 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 px-6 py-3 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors font-medium"
              >
                重新整理
              </button>
            </div>
          </div>
        </div>
      )
    }

    return children
  }
}
