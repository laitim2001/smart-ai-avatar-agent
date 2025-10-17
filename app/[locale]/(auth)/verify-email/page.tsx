'use client'

/**
 * Email Verification Page
 *
 * Email 驗證頁面
 */

import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export default function VerifyEmailPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>(
    'loading'
  )
  const [message, setMessage] = useState('')

  useEffect(() => {
    const verifyEmail = async () => {
      const email = searchParams.get('email')
      const token = searchParams.get('token')

      if (!email || !token) {
        setStatus('error')
        setMessage('驗證連結無效或已過期')
        return
      }

      try {
        const response = await fetch('/api/auth/verify-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, token }),
        })

        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || 'Email 驗證失敗')
        }

        setStatus('success')
        setMessage(data.message || 'Email 驗證成功！')

        // 3 秒後導向登入頁面
        setTimeout(() => {
          router.push('/login')
        }, 3000)
      } catch (err) {
        setStatus('error')
        setMessage(err instanceof Error ? err.message : 'Email 驗證失敗')
      }
    }

    verifyEmail()
  }, [searchParams, router])

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {status === 'loading' && 'Email 驗證中...'}
          {status === 'success' && 'Email 驗證成功！'}
          {status === 'error' && 'Email 驗證失敗'}
        </CardTitle>
        <CardDescription>
          {status === 'loading' && '請稍候，正在驗證您的 Email...'}
          {status === 'success' && '您的帳號已經啟用，現在可以登入了。'}
          {status === 'error' && '無法驗證您的 Email，請重試。'}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {status === 'loading' && (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        )}

        {status === 'success' && (
          <>
            <div className="rounded-md bg-green-50 p-4">
              <p className="text-sm text-green-800">{message}</p>
            </div>
            <p className="text-sm text-gray-600">
              正在導向登入頁面...
            </p>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="rounded-md bg-red-50 p-4">
              <p className="text-sm text-red-800">{message}</p>
            </div>
            <div className="flex gap-2">
              <Button asChild className="w-full">
                <Link href="/register">重新註冊</Link>
              </Button>
              <Button asChild variant="outline" className="w-full">
                <Link href="/login">返回登入</Link>
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
