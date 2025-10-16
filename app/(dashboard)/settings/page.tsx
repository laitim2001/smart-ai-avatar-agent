'use client'

/**
 * User Settings Page
 *
 * 使用者設定頁面 - 個人資料管理
 */

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'

// 表單驗證 schema
const profileSchema = z.object({
  name: z.string().min(1, '請輸入姓名'),
  email: z.string().email('請輸入有效的 Email 地址'),
})

type ProfileFormValues = z.infer<typeof profileSchema>

export default function SettingsPage() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState<{
    type: 'success' | 'error'
    text: string
  } | null>(null)

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: '',
      email: '',
    },
  })

  // 檢查認證狀態
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    }
  }, [status, router])

  // 載入使用者資料
  useEffect(() => {
    if (session?.user) {
      form.reset({
        name: session.user.name || '',
        email: session.user.email || '',
      })
    }
  }, [session, form])

  async function onSubmit(values: ProfileFormValues) {
    setIsLoading(true)
    setMessage(null)

    try {
      const response = await fetch('/api/user/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || '更新失敗')
      }

      setMessage({ type: 'success', text: '個人資料已更新' })
    } catch (err) {
      setMessage({
        type: 'error',
        text: err instanceof Error ? err.message : '更新時發生錯誤',
      })
    } finally {
      setIsLoading(false)
    }
  }

  // 載入中狀態
  if (status === 'loading') {
    return (
      <div className="container mx-auto max-w-2xl py-8">
        <Card>
          <CardHeader>
            <CardTitle>使用者設定</CardTitle>
            <CardDescription>載入中...</CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  // 未認證時不顯示內容
  if (status === 'unauthenticated') {
    return null
  }

  return (
    <div className="container mx-auto max-w-2xl py-8">
      <Card>
        <CardHeader>
          <CardTitle>使用者設定</CardTitle>
          <CardDescription>管理您的個人資料</CardDescription>
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
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>姓名</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="您的姓名"
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
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="your.email@example.com"
                        {...field}
                        disabled={true}
                      />
                    </FormControl>
                    <FormMessage />
                    <p className="text-sm text-gray-500">
                      Email 無法修改
                    </p>
                  </FormItem>
                )}
              />

              <div className="flex justify-end space-x-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push('/')}
                  disabled={isLoading}
                >
                  取消
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? '儲存中...' : '儲存變更'}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* 密碼變更區塊 */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>安全性設定</CardTitle>
          <CardDescription>變更您的密碼</CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            variant="outline"
            onClick={() => router.push('/forgot-password')}
          >
            變更密碼
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
