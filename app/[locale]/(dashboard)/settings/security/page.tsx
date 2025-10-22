'use client'

/**
 * Security Settings Page
 * 安全性設定頁面 - 密碼變更
 */

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'

// 表單驗證 schema
const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, '請輸入目前密碼'),
    newPassword: z.string().min(8, '新密碼長度至少需要 8 個字元'),
    confirmPassword: z.string().min(1, '請確認新密碼'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: '新密碼與確認密碼不一致',
    path: ['confirmPassword'],
  })

type ChangePasswordFormValues = z.infer<typeof changePasswordSchema>

export default function SecurityPage() {
  const router = useRouter()
  const { status } = useSession()
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState<{
    type: 'success' | 'error'
    text: string
  } | null>(null)

  const form = useForm<ChangePasswordFormValues>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  })

  // 檢查認證狀態
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    }
  }, [status, router])

  async function onSubmit(values: ChangePasswordFormValues) {
    setIsLoading(true)
    setMessage(null)

    try {
      const response = await fetch('/api/user/password', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || '變更失敗')
      }

      setMessage({ type: 'success', text: '密碼已成功變更' })
      form.reset()
    } catch (err) {
      setMessage({
        type: 'error',
        text: err instanceof Error ? err.message : '變更時發生錯誤',
      })
    } finally {
      setIsLoading(false)
    }
  }

  // 載入中狀態
  if (status === 'loading') {
    return (
      <Card>
        <CardHeader>
          <CardTitle>安全性設定</CardTitle>
          <CardDescription>載入中...</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  // 未認證時不顯示內容
  if (status === 'unauthenticated') {
    return null
  }

  return (
    <div className="space-y-6">
      {/* 密碼變更 */}
      <Card>
        <CardHeader>
          <CardTitle>變更密碼</CardTitle>
          <CardDescription>更新您的帳號密碼</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              {message && (
                <div
                  className={`rounded-md p-4 ${
                    message.type === 'success'
                      ? 'bg-green-50 text-green-800'
                      : 'bg-red-50 text-red-800'
                  }`}
                >
                  <p className="text-sm">{message.text}</p>
                </div>
              )}

              <FormField
                control={form.control}
                name="currentPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>目前密碼</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="輸入目前密碼"
                        {...field}
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="newPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>新密碼</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="輸入新密碼"
                        {...field}
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormDescription>
                      至少 8 個字元,包含大小寫字母和數字
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>確認新密碼</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="再次輸入新密碼"
                        {...field}
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end space-x-4 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => form.reset()}
                  disabled={isLoading}
                >
                  重設
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? '變更中...' : '變更密碼'}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* 帳號安全資訊 */}
      <Card>
        <CardHeader>
          <CardTitle>帳號安全</CardTitle>
          <CardDescription>保護您的帳號安全</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-start space-x-4 p-4 bg-blue-50 rounded-lg">
            <div className="text-2xl">💡</div>
            <div className="flex-1">
              <h4 className="font-medium mb-1">密碼安全建議</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• 使用至少 8 個字元的強密碼</li>
                <li>• 包含大小寫字母、數字和特殊符號</li>
                <li>• 避免使用常見詞彙或個人資訊</li>
                <li>• 定期更換密碼以提高安全性</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
