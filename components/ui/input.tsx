/**
 * ================================================================
 * Input 通用組件 (components/ui/input.tsx)
 * ================================================================
 *
 * 提供一致的輸入框樣式與狀態管理
 *
 * 功能：
 * - 支援 Label 標籤
 * - 錯誤狀態顯示
 * - forwardRef 支援（用於 React Hook Form）
 * - 完整的 TypeScript 類型支援
 *
 * 使用範例：
 * ```tsx
 * <Input
 *   label="用戶名稱"
 *   placeholder="請輸入用戶名稱"
 * />
 *
 * <Input
 *   label="電子郵件"
 *   type="email"
 *   error="請輸入有效的電子郵件地址"
 * />
 * ```
 */

import { InputHTMLAttributes, forwardRef } from 'react'
import { cn } from '@/lib/utils'

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  /** 輸入框標籤 */
  label?: string
  /** 錯誤訊息 */
  error?: string
}

/**
 * Input 組件
 *
 * @param label - 輸入框標籤
 * @param error - 錯誤訊息
 * @param className - 額外的 CSS 類名
 * @param ref - React ref（用於 DOM 操作或表單驗證）
 */
export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className, ...props }, ref) => {
    return (
      <div className="w-full">
        {/* 標籤 */}
        {label && (
          <label className="block text-sm font-medium mb-1.5 text-foreground">
            {label}
          </label>
        )}

        {/* 輸入框 */}
        <input
          ref={ref}
          className={cn(
            // 基礎樣式
            'w-full px-4 py-2 rounded-lg',
            'border-2 transition-all duration-200',
            // 背景與文字
            'bg-white text-gray-900',
            'placeholder:text-gray-500',
            // 正常狀態
            'border-gray-300',
            // 聚焦狀態
            'focus:border-blue-500 focus:outline-none',
            'focus:ring-2 focus:ring-blue-500/20',
            // 禁用狀態
            'disabled:opacity-50 disabled:cursor-not-allowed',
            'disabled:bg-gray-100',
            // 錯誤狀態
            error &&
              'border-red-500 focus:border-red-500 focus:ring-red-500/20',
            className
          )}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={error ? `${props.id}-error` : undefined}
          {...props}
        />

        {/* 錯誤訊息 */}
        {error && (
          <p
            id={`${props.id}-error`}
            className="mt-1.5 text-sm text-destructive"
            role="alert"
          >
            {error}
          </p>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'
