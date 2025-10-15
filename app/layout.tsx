import type { Metadata } from 'next'
import { Inter, Noto_Sans_TC } from 'next/font/google'
import './globals.css'

// 英數字體：Inter（現代感、可讀性高）
const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

// 繁體中文字體：Noto Sans TC（繁中支援完善）
const notoSansTC = Noto_Sans_TC({
  subsets: ['latin'],
  variable: '--font-noto-sans-tc',
  display: 'swap',
  weight: ['400', '500', '600', '700'],
})

export const metadata: Metadata = {
  title: 'Smart AI Avatar Agent - 3D Avatar 對話系統',
  description:
    '3D Avatar 即時對話系統 - 結合 Azure OpenAI GPT-4、Azure Speech Services 與 Three.js 的智能 AI 助理',
  keywords: [
    '3D Avatar',
    'AI 對話',
    'Azure OpenAI',
    'Speech Services',
    'Three.js',
    'Next.js',
  ],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-TW" className={`${inter.variable} ${notoSansTC.variable}`}>
      <body className="font-sans antialiased">{children}</body>
    </html>
  )
}
