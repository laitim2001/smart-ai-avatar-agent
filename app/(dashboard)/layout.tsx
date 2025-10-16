import { ReactNode } from 'react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Dashboard - AI Avatar Agent',
  description: '3D Avatar 對話系統管理後台',
}

interface DashboardRootLayoutProps {
  children: ReactNode
}

export default function DashboardRootLayout({
  children,
}: DashboardRootLayoutProps) {
  return <DashboardLayout>{children}</DashboardLayout>
}
