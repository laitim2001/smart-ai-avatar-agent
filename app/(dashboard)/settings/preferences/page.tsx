'use client'

/**
 * User Preferences Page
 * 使用者偏好設定頁面 - 主題、語言、通知
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
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
} from '@/components/ui/form'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

// 表單驗證 schema
const preferencesSchema = z.object({
  theme: z.enum(['light', 'dark', 'system']),
  language: z.enum(['zh-TW', 'en-US']),
  emailNotifications: z.boolean(),
  pushNotifications: z.boolean(),
})

type PreferencesFormValues = z.infer<typeof preferencesSchema>

export default function PreferencesPage() {
  const router = useRouter()
  const { status } = useSession()
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState<{
    type: 'success' | 'error'
    text: string
  } | null>(null)

  const form = useForm<PreferencesFormValues>({
    resolver: zodResolver(preferencesSchema),
    defaultValues: {
      theme: 'system',
      language: 'zh-TW',
      emailNotifications: true,
      pushNotifications: false,
    },
  })

  // 檢查認證狀態
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    }
  }, [status, router])

  // 載入使用者設定
  useEffect(() => {
    async function loadSettings() {
      try {
        const response = await fetch('/api/user/settings')
        const data = await response.json()

        if (response.ok && data.settings) {
          form.reset({
            theme: data.settings.theme,
            language: data.settings.language,
            emailNotifications: data.settings.emailNotifications,
            pushNotifications: data.settings.pushNotifications,
          })
        }
      } catch (error) {
        console.error('載入設定失敗:', error)
      }
    }

    if (status === 'authenticated') {
      loadSettings()
    }
  }, [status, form])

  async function onSubmit(values: PreferencesFormValues) {
    setIsLoading(true)
    setMessage(null)

    try {
      const response = await fetch('/api/user/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || '更新失敗')
      }

      setMessage({ type: 'success', text: '偏好設定已更新' })
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
      <Card>
        <CardHeader>
          <CardTitle>偏好設定</CardTitle>
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
    <Card>
      <CardHeader>
        <CardTitle>偏好設定</CardTitle>
        <CardDescription>自訂您的使用體驗</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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

            {/* 主題設定 */}
            <FormField
              control={form.control}
              name="theme"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>主題</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="選擇主題" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="light">淺色</SelectItem>
                      <SelectItem value="dark">深色</SelectItem>
                      <SelectItem value="system">跟隨系統</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>選擇您偏好的介面主題</FormDescription>
                </FormItem>
              )}
            />

            {/* 語言設定 */}
            <FormField
              control={form.control}
              name="language"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>語言</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="選擇語言" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="zh-TW">繁體中文</SelectItem>
                      <SelectItem value="en-US">English (US)</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>選擇您偏好的介面語言</FormDescription>
                </FormItem>
              )}
            />

            {/* 通知設定 */}
            <div className="space-y-4 pt-4 border-t">
              <h3 className="font-medium">通知設定</h3>

              <FormField
                control={form.control}
                name="emailNotifications"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Email 通知</FormLabel>
                      <FormDescription>
                        接收重要更新和活動通知
                      </FormDescription>
                    </div>
                    <FormControl>
                      <input
                        type="checkbox"
                        checked={field.value}
                        onChange={field.onChange}
                        className="h-4 w-4 rounded border-gray-300"
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="pushNotifications"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">推播通知</FormLabel>
                      <FormDescription>
                        接收即時推播通知 (即將推出)
                      </FormDescription>
                    </div>
                    <FormControl>
                      <input
                        type="checkbox"
                        checked={field.value}
                        onChange={field.onChange}
                        disabled={true}
                        className="h-4 w-4 rounded border-gray-300 opacity-50"
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            {/* 儲存按鈕 */}
            <div className="flex justify-end space-x-4 pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push('/settings')}
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
  )
}
