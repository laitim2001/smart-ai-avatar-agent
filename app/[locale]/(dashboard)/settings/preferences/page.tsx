'use client'

/**
 * User Preferences Page
 * 使用者偏好設定頁面 - 主題、語言、通知
 */

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
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
  const t = useTranslations('settings')
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
        console.error(t('loadError'), error)
      }
    }

    if (status === 'authenticated') {
      loadSettings()
    }
  }, [status, form, t])

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
        throw new Error(data.error || t('loadError'))
      }

      setMessage({ type: 'success', text: t('savedSuccess') })
    } catch (err) {
      setMessage({
        type: 'error',
        text: err instanceof Error ? err.message : t('loadError'),
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
          <CardTitle>{t('preferencesTitle')}</CardTitle>
          <CardDescription>{t('loading')}</CardDescription>
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
        <CardTitle>{t('preferencesTitle')}</CardTitle>
        <CardDescription>{t('preferencesDesc')}</CardDescription>
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
                  <FormLabel>{t('themeLabel')}</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="bg-white">
                        <SelectValue placeholder={t('themeLabel')} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="bg-white">
                      <SelectItem value="light">{t('themeLight')}</SelectItem>
                      <SelectItem value="dark">{t('themeDark')}</SelectItem>
                      <SelectItem value="system">{t('themeSystem')}</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>{t('themeDesc')}</FormDescription>
                </FormItem>
              )}
            />

            {/* 語言設定 */}
            <FormField
              control={form.control}
              name="language"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('languageLabel')}</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="bg-white">
                        <SelectValue placeholder={t('languageLabel')} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="bg-white">
                      <SelectItem value="zh-TW">{t('languageZhTW')}</SelectItem>
                      <SelectItem value="en-US">{t('languageEnUS')}</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>{t('languageDesc')}</FormDescription>
                </FormItem>
              )}
            />

            {/* 通知設定 */}
            <div className="space-y-4 pt-4 border-t">
              <h3 className="font-medium">{t('notificationsTitle')}</h3>

              <FormField
                control={form.control}
                name="emailNotifications"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">{t('emailNotifications')}</FormLabel>
                      <FormDescription>
                        {t('emailNotificationsDesc')}
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
                      <FormLabel className="text-base">{t('pushNotifications')}</FormLabel>
                      <FormDescription>
                        {t('pushNotificationsDesc')}
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
                {t('cancel')}
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? t('saving') : t('save')}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
