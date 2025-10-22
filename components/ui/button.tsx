/**
 * ================================================================
 * Button 通用組件 (components/ui/button.tsx)
 * ================================================================
 *
 * 提供一致的按鈕樣式與互動狀態
 *
 * 功能：
 * - 多種變體：primary, secondary, outline
 * - 多種尺寸：sm, md, lg
 * - Loading 狀態支援
 * - 完整的 TypeScript 類型支援
 *
 * 使用範例：
 * ```tsx
 * <Button variant="primary" size="lg">
 *   點擊我
 * </Button>
 *
 * <Button variant="secondary" isLoading>
 *   處理中...
 * </Button>
 * ```
 */

import { ButtonHTMLAttributes, forwardRef } from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cn } from '@/lib/utils'

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** 按鈕變體 */
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive'
  /** 按鈕尺寸 */
  size?: 'sm' | 'md' | 'lg'
  /** 是否顯示 Loading 狀態 */
  isLoading?: boolean
  /** 將按鈕作為子元素的插槽 */
  asChild?: boolean
}

/**
 * Button 組件
 *
 * @param variant - 按鈕變體（primary | secondary | outline）
 * @param size - 按鈕尺寸（sm | md | lg）
 * @param isLoading - 是否顯示 Loading 狀態
 * @param asChild - 將按鈕作為子元素的插槽
 * @param disabled - 是否禁用
 * @param className - 額外的 CSS 類名
 * @param children - 按鈕內容
 */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      variant = 'primary',
      size = 'md',
      isLoading = false,
      asChild = false,
      disabled,
      className,
      ...props
    },
    ref
  ) => {
    // 基礎樣式 (加入 hover 動畫效果)
    const baseStyles =
      'rounded-lg font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary inline-flex items-center justify-center hover:scale-105 active:scale-95'

    // 變體樣式
    const variantStyles = {
      primary:
        'bg-primary text-primary-foreground hover:bg-primary/90 active:bg-primary/80 shadow-md hover:shadow-xl',
      secondary:
        'bg-secondary text-secondary-foreground hover:bg-secondary/90 active:bg-secondary/80 shadow-sm hover:shadow-md',
      outline:
        'border-2 border-primary text-primary bg-transparent hover:bg-primary hover:text-primary-foreground active:bg-primary/80 hover:shadow-lg',
      ghost:
        'bg-transparent hover:bg-gray-100 active:bg-gray-200 text-gray-700',
      destructive:
        'bg-red-600 text-white hover:bg-red-700 active:bg-red-800 shadow-md hover:shadow-xl',
    }

    // 尺寸樣式
    const sizeStyles = {
      sm: 'px-3 py-1.5 text-sm min-h-[32px]',
      md: 'px-4 py-2 text-base min-h-[40px]',
      lg: 'px-6 py-3 text-lg min-h-[48px]',
    }

    const Comp = asChild ? Slot : 'button'

    return (
      <Comp
        ref={ref}
        className={cn(
          baseStyles,
          variantStyles[variant],
          sizeStyles[size],
          isLoading && 'relative cursor-wait',
          className
        )}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading ? (
          <>
            {/* 隱藏原始內容以保持按鈕尺寸 */}
            <span className="opacity-0">{children}</span>

            {/* Loading Spinner */}
            <span className="absolute inset-0 flex items-center justify-center">
              <svg
                className="animate-spin h-5 w-5"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
            </span>
          </>
        ) : (
          children
        )}
      </Comp>
    )
  }
)

Button.displayName = 'Button'
