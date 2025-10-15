# Sprint 1 詳細計劃
**3D Avatar 即時對話系統 - MVP 開發**

## Sprint 資訊
- **Sprint**: Sprint 1 / 12
- **時程**: Week 1-2（2025-10-22 ~ 2025-11-05, 共 10.5 個工作天）
- **Epic**: Epic 1 - 核心使用者功能
- **Story**: Story 1.1 - 使用者認證系統
- **Story Points**: 11 SP（原 10 SP，增加 shadcn/ui 整合）
- **優先級**: P0（必要功能）
- **團隊**: 1 Full-Stack Developer
- **技術升級**: ✅ 整合 Radix UI + shadcn/ui 完整設計系統

---

## 目錄

1. [Sprint 目標](#sprint-目標)
2. [Story 1.1 詳細規格](#story-11-詳細規格)
3. [技術架構設計](#技術架構設計)
4. [開發任務分解](#開發任務分解)
5. [實作指南](#實作指南)
6. [測試計劃](#測試計劃)
7. [驗收標準](#驗收標準)
8. [風險與緩解](#風險與緩解)
9. [Definition of Done](#definition-of-done)

---

## Sprint 目標

### 主要目標
建立完整的使用者認證與授權系統，為 MVP 所有使用者功能奠定安全基礎。

### 成功指標
- ✅ 使用者可使用 Email/Password 註冊與登入
- ✅ 支援 Google 與 Microsoft OAuth 2.0 單點登入
- ✅ 密碼重設功能完整可用
- ✅ 使用者設定頁面可編輯個人資料
- ✅ Session 管理與安全性符合業界標準
- ✅ 單元測試覆蓋率 ≥ 60%（認證模組）

### 與 POC 的差異
POC 階段為無認證狀態，任何人可直接使用對話功能。MVP Sprint 1 將新增：
- 使用者註冊與登入流程
- 資料庫持久化（PostgreSQL + Prisma）
- Session 管理與 Token 驗證
- 使用者專屬資料隔離

---

## Story 1.1 詳細規格

### User Story

**作為一位新使用者**，我希望能夠：
- 使用 Email/Password 註冊帳號
- 使用 Google 或 Microsoft 帳號快速登入（OAuth 2.0）
- 登入後存取對話功能
- 修改個人資料（名稱、頭像）
- 忘記密碼時可重設密碼
- 安全地登出系統

**以便我可以**：
- 擁有個人化的對話體驗
- 保存我的對話歷史（Sprint 2 功能）
- 安全地存取系統資源

### 功能需求

#### 1. 使用者註冊（Email/Password）
- **輸入欄位**: Email, Password, Confirm Password, Name（選填）
- **驗證規則**:
  - Email: 符合標準格式（RFC 5322）
  - Password: 至少 8 字元，包含大小寫字母與數字
  - Confirm Password: 必須與 Password 一致
- **錯誤處理**:
  - Email 已存在 → "此 Email 已被註冊"
  - Password 不符合規則 → 顯示具體要求
  - 伺服器錯誤 → "註冊失敗，請稍後再試"
- **成功流程**: 註冊成功 → 自動登入 → 導向首頁（Avatar 對話介面）

#### 2. 使用者登入（Email/Password）
- **輸入欄位**: Email, Password
- **Remember Me**: 勾選後 Session 保持 30 天（預設 7 天）
- **錯誤處理**:
  - Email 不存在 → "Email 或密碼錯誤"
  - Password 錯誤 → "Email 或密碼錯誤"（防止帳號列舉）
  - 連續失敗 5 次 → 鎖定帳號 15 分鐘
- **成功流程**: 登入成功 → 導向首頁

#### 3. OAuth 2.0 單點登入（Google & Microsoft）
- **流程**: 點擊 "Sign in with Google/Microsoft" → OAuth 授權頁 → 授權同意 → 自動建立帳號（首次）或登入（已存在）
- **權限請求**: Email, Profile（名稱、頭像）
- **資料同步**:
  - 首次登入: 從 OAuth Provider 取得名稱與頭像
  - 後續登入: 不覆寫使用者手動編輯的資料
- **錯誤處理**:
  - 授權拒絕 → "登入取消，請重試"
  - OAuth API 失敗 → "登入失敗，請稍後再試"

#### 4. 密碼重設
- **流程**:
  1. 點擊 "忘記密碼？" → 輸入 Email → 發送重設連結
  2. 使用者收到 Email（含 Token，有效期 1 小時）
  3. 點擊連結 → 輸入新密碼 → 重設成功 → 導向登入頁
- **安全性**:
  - Token 單次使用（使用後失效）
  - Token 包含使用者 ID 與過期時間
  - 已過期 Token → "連結已過期，請重新申請"
- **Email 範本**: 使用 Resend (免費方案，3,000 封/月)

#### 5. 使用者設定頁面
- **路徑**: `/settings` 或 `/profile`
- **可編輯欄位**:
  - 名稱（Name）
  - 頭像（Avatar URL 或上傳，Sprint 1 僅支援 URL）
  - Email（顯示，不可編輯）
  - Provider（顯示，email/google/microsoft）
- **密碼變更**（僅 Email 使用者）:
  - 輸入: Current Password, New Password, Confirm New Password
  - 驗證: 舊密碼正確 + 新密碼符合規則
- **成功訊息**: "個人資料已更新"（Toast 通知）

#### 6. 登出功能
- **位置**: Header 右上角使用者選單
- **行為**: 清除 Session → 導向登入頁
- **安全性**: 呼叫 `/api/auth/signout` 刪除伺服器端 Session

### 非功能需求

#### 安全性
- **密碼雜湊**: bcryptjs（10 rounds）
- **Session 儲存**: PostgreSQL (adapter: @auth/prisma-adapter)
- **CSRF 保護**: NextAuth.js 內建 CSRF Token
- **HTTPS Only**: Production 環境強制 HTTPS (Azure Static Web Apps 自動啟用)
- **Rate Limiting**: 登入 API 限制 5 次/分鐘/IP（使用 Upstash Redis）

#### 效能
- **登入延遲**: < 500ms（bcrypt 驗證 + DB 查詢）
- **OAuth 延遲**: < 2s（第三方 API RTT）
- **Session 查詢**: < 100ms（PostgreSQL + Prisma）

#### 相容性
- **瀏覽器**: Chrome, Edge, Safari, Firefox（最新 2 版本）
- **行動裝置**: iOS Safari, Android Chrome（響應式設計，Sprint 4 完整優化）

---

## 技術架構設計

### 技術堆疊

#### 認證框架
- **NextAuth.js v5** (next-auth@5.0.0-beta.25)
  - 原因: Next.js 官方推薦，支援 App Router，內建 CSRF 保護
  - 支援: Credentials Provider, Google Provider, Microsoft Provider
  - Adapter: @auth/prisma-adapter (Session 儲存至 PostgreSQL)

#### 資料庫
- **Azure Database for PostgreSQL - Flexible Server**
  - SKU: Burstable B1ms (1 vCore, 2GB RAM)
  - 成本: NT$330/月（預計使用量 < 50%）
  - 連線池: Prisma 內建連線池（max 5 connections）

#### ORM
- **Prisma v6.2.0**
  - 原因: TypeScript-first, 型別安全, 遷移管理
  - Prisma Studio: 資料庫 GUI 工具（開發用）

#### Email 服務
- **Resend** (https://resend.com)
  - 免費方案: 3,000 封/月, 100 封/日
  - API Key: 從 Resend Dashboard 取得
  - SDK: resend@4.0.0

#### Rate Limiting
- **Upstash Redis** (https://upstash.com)
  - 免費方案: 10,000 requests/日
  - 用途: 登入失敗計數、API Rate Limiting
  - SDK: @upstash/redis@1.28.0

### 資料庫 Schema

#### Prisma Schema (prisma/schema.prisma)

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// NextAuth.js Models (required by @auth/prisma-adapter)
model User {
  id            String    @id @default(cuid())
  name          String?
  email         String    @unique
  emailVerified DateTime?
  image         String?
  password      String?   // Null for OAuth users
  provider      String    @default("email") // 'email' | 'google' | 'microsoft'
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  accounts      Account[]
  sessions      Session[]
  conversations Conversation[] // Sprint 2 will add this relation

  @@index([email])
}

model Account {
  id                String  @id @default(cuid())
  userId            String
  type              String
  provider          String
  providerAccountId String
  refresh_token     String? @db.Text
  access_token      String? @db.Text
  expires_at        Int?
  token_type        String?
  scope             String?
  id_token          String? @db.Text
  session_state     String?

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([provider, providerAccountId])
  @@index([userId])
}

model Session {
  id           String   @id @default(cuid())
  sessionToken String   @unique
  userId       String
  expires      DateTime
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@index([sessionToken])
}

model VerificationToken {
  identifier String
  token      String   @unique
  expires    DateTime

  @@unique([identifier, token])
  @@index([token])
}

// Custom Models for Password Reset
model PasswordResetToken {
  id        String   @id @default(cuid())
  email     String
  token     String   @unique
  expires   DateTime
  createdAt DateTime @default(now())
  used      Boolean  @default(false)

  @@index([email])
  @@index([token])
}

// Placeholder for Sprint 2 (not implemented in Sprint 1)
model Conversation {
  id        String   @id @default(cuid())
  userId    String
  title     String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  user     User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  messages Message[]

  @@index([userId])
}

model Message {
  id             String   @id @default(cuid())
  conversationId String
  role           String   // 'user' | 'avatar'
  content        String   @db.Text
  createdAt      DateTime @default(now())

  conversation Conversation @relation(fields: [conversationId], references: [id], onDelete: Cascade)

  @@index([conversationId])
}
```

### 環境變數配置

#### .env.local (Development)

```bash
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/smart-avatar-dev?schema=public"

# NextAuth.js
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="generate-with-openssl-rand-base64-32"

# Google OAuth
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# Microsoft OAuth
MICROSOFT_CLIENT_ID="your-microsoft-client-id"
MICROSOFT_CLIENT_SECRET="your-microsoft-client-secret"

# Resend (Email)
RESEND_API_KEY="re_your_resend_api_key"
RESEND_FROM_EMAIL="noreply@yourdomain.com"

# Upstash Redis (Rate Limiting)
UPSTASH_REDIS_REST_URL="https://your-redis.upstash.io"
UPSTASH_REDIS_REST_TOKEN="your-upstash-token"

# Azure Services (from POC)
AZURE_OPENAI_API_KEY="..."
AZURE_OPENAI_ENDPOINT="..."
AZURE_OPENAI_DEPLOYMENT="gpt-5-chat"
AZURE_SPEECH_KEY="..."
AZURE_SPEECH_REGION="eastasia"
```

#### Azure Static Web Apps (Production)

在 Azure Portal → Configuration 中新增相同環境變數（除了 DATABASE_URL 需改為 Production Database）。

---

## 開發任務分解

### Task 1: 專案設定與基礎建設（Day 1, 1.5 天）

**⚠️ 時程調整**: 原 1 天 → 新 1.5 天（增加 shadcn/ui 安裝）

#### 1.1 安裝認證套件
```bash
# 認證框架
npm install next-auth@5.0.0-beta.25 @auth/prisma-adapter@2.7.4

# 資料庫與 ORM
npm install @prisma/client@6.2.0
npm install -D prisma@6.2.0

# 密碼與安全
npm install bcryptjs
npm install -D @types/bcryptjs

# Email 與 Rate Limiting
npm install resend @upstash/redis
```

#### 1.2 安裝 UI 組件系統（shadcn/ui + Radix UI）

**說明**: 整合完整的企業級 UI 組件系統，與您的另一個專案技術堆疊一致。

**步驟 1**: 安裝表單處理套件
```bash
npm install react-hook-form zod @hookform/resolvers
```

**步驟 2**: 初始化 shadcn/ui
```bash
npx shadcn-ui@latest init
```

**互動式設定**（選擇以下選項）:
- Style: **Default**
- Base Color: **Slate**
- CSS Variables: **yes** (專案已使用)

**步驟 3**: 安裝核心組件（認證系統必需）
```bash
npx shadcn-ui@latest add button input label form toast dropdown-menu dialog
```

**步驟 4**: 安裝輔助組件（提升 UX）
```bash
npx shadcn-ui@latest add card separator avatar skeleton
```

**生成的檔案**:
- `components.json` (shadcn/ui 配置)
- `components/ui/*.tsx` (11 個 UI 組件)

**預計時間**: 1.5-2 小時（包含測試）

**詳細指南**: 參考 `docs/SHADCN_UI_SETUP_GUIDE.md`

#### 1.3 設定 Azure Database for PostgreSQL
1. Azure Portal → Create Resource → Azure Database for PostgreSQL - Flexible Server
2. 配置:
   - Resource Group: `smart-avatar-rg`
   - Server Name: `smart-avatar-db-dev`
   - Region: East Asia（與 Speech Services 相同）
   - PostgreSQL Version: 16
   - Compute + Storage: Burstable, B1ms (1 vCore, 2GB RAM)
   - Authentication: PostgreSQL authentication
3. Firewall Rules: 允許 Azure Services, 開發機 IP
4. 取得連線字串 → 更新 `.env.local` 的 `DATABASE_URL`

#### 1.4 初始化 Prisma
```bash
npx prisma init
```

編輯 `prisma/schema.prisma`（使用上面的 Schema）

#### 1.5 執行資料庫遷移
```bash
npx prisma migrate dev --name init-auth-schema
npx prisma generate
```

驗證:
```bash
npx prisma studio  # 開啟 Prisma Studio, 應看到所有 Table
```

#### 1.6 設定 OAuth Providers

**Google OAuth**:
1. Google Cloud Console → APIs & Services → Credentials
2. Create OAuth 2.0 Client ID (Web Application)
3. Authorized redirect URIs: `http://localhost:3000/api/auth/callback/google`
4. 取得 Client ID 與 Secret → `.env.local`

**Microsoft OAuth**:
1. Azure Portal → Microsoft Entra ID → App registrations
2. New registration → Redirect URI: `http://localhost:3000/api/auth/callback/microsoft`
3. Certificates & secrets → New client secret
4. 取得 Application (client) ID 與 Secret → `.env.local`

#### 1.7 設定 Resend
1. https://resend.com/signup → 註冊免費帳號
2. Dashboard → API Keys → Create API Key
3. 取得 API Key → `.env.local`
4. Domains → 新增網域（Production 使用）或使用預設 onboarding@resend.dev（Development）

#### 1.8 設定 Upstash Redis
1. https://upstash.com/signup → 註冊免費帳號
2. Create Database → 選擇最近區域（Singapore）
3. 取得 REST API URL 與 Token → `.env.local`

**驗收標準**:
- ✅ 所有認證套件安裝成功（無版本衝突）
- ✅ shadcn/ui 組件系統安裝完成（11 個組件）
- ✅ Azure PostgreSQL 資料庫可連線
- ✅ Prisma 遷移成功，Prisma Studio 可開啟
- ✅ OAuth Providers 設定完成（可取得 Client ID）
- ✅ Resend 與 Upstash 可正常連線（手動測試 API）
- ✅ `components/ui` 目錄包含所有 shadcn/ui 組件
- ✅ `components.json` 配置檔案已生成

---

### Task 2: NextAuth.js 整合與基礎認證（Day 2-3, 2 天）

#### 2.1 建立 NextAuth.js 配置

**檔案**: `lib/auth/config.ts`

```typescript
import { NextAuthConfig } from 'next-auth'
import { PrismaAdapter } from '@auth/prisma-adapter'
import { prisma } from '@/lib/db/prisma'
import CredentialsProvider from 'next-auth/providers/credentials'
import GoogleProvider from 'next-auth/providers/google'
import MicrosoftProvider from 'next-auth/providers/microsoft'
import bcrypt from 'bcryptjs'

export const authConfig: NextAuthConfig = {
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      name: 'Email',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('請輸入 Email 與密碼')
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string },
        })

        if (!user || !user.password) {
          throw new Error('Email 或密碼錯誤')
        }

        const isValid = await bcrypt.compare(
          credentials.password as string,
          user.password
        )

        if (!isValid) {
          throw new Error('Email 或密碼錯誤')
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
        }
      },
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    MicrosoftProvider({
      clientId: process.env.MICROSOFT_CLIENT_ID!,
      clientSecret: process.env.MICROSOFT_CLIENT_SECRET!,
    }),
  ],
  pages: {
    signIn: '/auth/signin',
    signOut: '/auth/signout',
    error: '/auth/error',
  },
  session: {
    strategy: 'database',
    maxAge: 7 * 24 * 60 * 60, // 7 days (default)
  },
  callbacks: {
    async session({ session, user }) {
      if (session.user) {
        session.user.id = user.id
        session.user.provider = user.provider
      }
      return session
    },
  },
}
```

**檔案**: `lib/db/prisma.ts`

```typescript
import { PrismaClient } from '@prisma/client'

const globalForPrisma = global as unknown as { prisma: PrismaClient }

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
```

#### 2.2 建立 NextAuth.js API Route

**檔案**: `app/api/auth/[...nextauth]/route.ts`

```typescript
import NextAuth from 'next-auth'
import { authConfig } from '@/lib/auth/config'

const handler = NextAuth(authConfig)

export { handler as GET, handler as POST }
```

#### 2.3 建立 Session Provider

**檔案**: `components/auth/SessionProvider.tsx`

```typescript
'use client'

import { SessionProvider as NextAuthSessionProvider } from 'next-auth/react'
import { ReactNode } from 'react'

interface Props {
  children: ReactNode
}

export function SessionProvider({ children }: Props) {
  return <NextAuthSessionProvider>{children}</NextAuthSessionProvider>
}
```

更新 `app/layout.tsx`:

```typescript
import { SessionProvider } from '@/components/auth/SessionProvider'

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="zh-TW">
      <body>
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  )
}
```

**驗收標準**:
- ✅ NextAuth.js 配置檔案無 TypeScript 錯誤
- ✅ `/api/auth/signin` 可訪問（返回 NextAuth 預設登入頁）
- ✅ Prisma 連線正常（無資料庫錯誤）

---

### Task 3: 使用者註冊功能（Day 3-4, 1.5 天）

#### 3.1 建立註冊 API

**檔案**: `app/api/auth/register/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'
import bcrypt from 'bcryptjs'
import { z } from 'zod'

const registerSchema = z.object({
  email: z.string().email('Email 格式不正確'),
  password: z
    .string()
    .min(8, '密碼至少 8 字元')
    .regex(/[A-Z]/, '密碼需包含大寫字母')
    .regex(/[a-z]/, '密碼需包含小寫字母')
    .regex(/[0-9]/, '密碼需包含數字'),
  name: z.string().optional(),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password, name } = registerSchema.parse(body)

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      return NextResponse.json(
        { error: '此 Email 已被註冊' },
        { status: 400 }
      )
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name: name || null,
        provider: 'email',
      },
    })

    return NextResponse.json(
      { success: true, userId: user.id },
      { status: 201 }
    )
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      )
    }

    console.error('[Register Error]', error)
    return NextResponse.json(
      { error: '註冊失敗，請稍後再試' },
      { status: 500 }
    )
  }
}
```

#### 3.2 建立註冊頁面 UI

**檔案**: `app/auth/register/page.tsx`

```typescript
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { signIn } from 'next-auth/react'
import Link from 'next/link'

export default function RegisterPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (formData.password !== formData.confirmPassword) {
      setError('密碼與確認密碼不一致')
      return
    }

    setLoading(true)

    try {
      // Register user
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          name: formData.name || undefined,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || '註冊失敗')
        return
      }

      // Auto sign in after registration
      const signInResult = await signIn('credentials', {
        redirect: false,
        email: formData.email,
        password: formData.password,
      })

      if (signInResult?.error) {
        setError('註冊成功，但登入失敗，請手動登入')
        router.push('/auth/signin')
        return
      }

      router.push('/')
    } catch (err) {
      setError('註冊失敗，請稍後再試')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8">
        <h1 className="text-2xl font-bold text-center mb-6">註冊帳號</h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-50 text-red-600 px-4 py-2 rounded">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              className="w-full px-3 py-2 border rounded-md"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              名稱（選填）
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className="w-full px-3 py-2 border rounded-md"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">密碼</label>
            <input
              type="password"
              required
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
              className="w-full px-3 py-2 border rounded-md"
            />
            <p className="text-xs text-gray-500 mt-1">
              至少 8 字元，包含大小寫字母與數字
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              確認密碼
            </label>
            <input
              type="password"
              required
              value={formData.confirmPassword}
              onChange={(e) =>
                setFormData({ ...formData, confirmPassword: e.target.value })
              }
              className="w-full px-3 py-2 border rounded-md"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? '註冊中...' : '註冊'}
          </button>
        </form>

        <div className="mt-4 text-center text-sm">
          已有帳號？{' '}
          <Link href="/auth/signin" className="text-blue-600 hover:underline">
            登入
          </Link>
        </div>
      </div>
    </div>
  )
}
```

**驗收標準**:
- ✅ 可成功註冊新使用者（Prisma Studio 可見新記錄）
- ✅ 密碼驗證規則正確（顯示錯誤訊息）
- ✅ Email 重複註冊被阻擋
- ✅ 註冊成功後自動登入並導向首頁

---

### Task 4: 登入與 OAuth 功能（Day 4-5, 1.5 天）

#### 4.1 建立登入頁面

**檔案**: `app/auth/signin/page.tsx`

```typescript
'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'

export default function SignInPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get('callbackUrl') || '/'

  const [formData, setFormData] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const result = await signIn('credentials', {
        redirect: false,
        email: formData.email,
        password: formData.password,
      })

      if (result?.error) {
        setError('Email 或密碼錯誤')
        return
      }

      router.push(callbackUrl)
    } catch (err) {
      setError('登入失敗，請稍後再試')
    } finally {
      setLoading(false)
    }
  }

  const handleOAuthSignIn = async (provider: 'google' | 'microsoft') => {
    setError('')
    await signIn(provider, { callbackUrl })
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8">
        <h1 className="text-2xl font-bold text-center mb-6">登入</h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-50 text-red-600 px-4 py-2 rounded">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              className="w-full px-3 py-2 border rounded-md"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">密碼</label>
            <input
              type="password"
              required
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
              className="w-full px-3 py-2 border rounded-md"
            />
          </div>

          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center">
              <input type="checkbox" className="mr-2" />
              記住我
            </label>
            <Link
              href="/auth/forgot-password"
              className="text-blue-600 hover:underline"
            >
              忘記密碼？
            </Link>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? '登入中...' : '登入'}
          </button>
        </form>

        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">或使用</span>
            </div>
          </div>

          <div className="mt-4 space-y-2">
            <button
              onClick={() => handleOAuthSignIn('google')}
              className="w-full flex items-center justify-center gap-2 bg-white border border-gray-300 py-2 rounded-md hover:bg-gray-50"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                {/* Google Icon SVG */}
              </svg>
              使用 Google 登入
            </button>

            <button
              onClick={() => handleOAuthSignIn('microsoft')}
              className="w-full flex items-center justify-center gap-2 bg-white border border-gray-300 py-2 rounded-md hover:bg-gray-50"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                {/* Microsoft Icon SVG */}
              </svg>
              使用 Microsoft 登入
            </button>
          </div>
        </div>

        <div className="mt-4 text-center text-sm">
          還沒有帳號？{' '}
          <Link
            href="/auth/register"
            className="text-blue-600 hover:underline"
          >
            註冊
          </Link>
        </div>
      </div>
    </div>
  )
}
```

**驗收標準**:
- ✅ Email/Password 登入成功
- ✅ 錯誤密碼顯示錯誤訊息
- ✅ Google OAuth 登入成功（首次自動建立帳號）
- ✅ Microsoft OAuth 登入成功
- ✅ 登入後導向 callbackUrl 或首頁

---

### Task 5: 密碼重設功能（Day 6, 1 天）

#### 5.1 建立密碼重設 Token 生成 API

**檔案**: `app/api/auth/forgot-password/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'
import { Resend } from 'resend'
import crypto from 'crypto'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    const user = await prisma.user.findUnique({ where: { email } })

    if (!user || user.provider !== 'email') {
      // Don't reveal if user exists (security)
      return NextResponse.json({ success: true })
    }

    // Generate reset token
    const token = crypto.randomBytes(32).toString('hex')
    const expires = new Date(Date.now() + 3600 * 1000) // 1 hour

    await prisma.passwordResetToken.create({
      data: {
        email,
        token,
        expires,
      },
    })

    // Send email
    const resetUrl = `${process.env.NEXTAUTH_URL}/auth/reset-password?token=${token}`

    await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL!,
      to: email,
      subject: '重設密碼',
      html: `
        <h2>重設密碼</h2>
        <p>點擊以下連結重設您的密碼：</p>
        <a href="${resetUrl}">${resetUrl}</a>
        <p>此連結將在 1 小時後過期。</p>
      `,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[Forgot Password Error]', error)
    return NextResponse.json(
      { error: '發送重設連結失敗' },
      { status: 500 }
    )
  }
}
```

#### 5.2 建立密碼重設頁面

**檔案**: `app/auth/reset-password/page.tsx`

```typescript
'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

export default function ResetPasswordPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get('token')

  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: '',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!token) {
      setError('無效的重設連結')
    }
  }, [token])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (formData.password !== formData.confirmPassword) {
      setError('密碼與確認密碼不一致')
      return
    }

    setLoading(true)

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token,
          password: formData.password,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || '重設密碼失敗')
        return
      }

      alert('密碼已重設成功！')
      router.push('/auth/signin')
    } catch (err) {
      setError('重設密碼失敗，請稍後再試')
    } finally {
      setLoading(false)
    }
  }

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-red-600">無效的重設連結</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8">
        <h1 className="text-2xl font-bold text-center mb-6">重設密碼</h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-50 text-red-600 px-4 py-2 rounded">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium mb-1">新密碼</label>
            <input
              type="password"
              required
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
              className="w-full px-3 py-2 border rounded-md"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              確認新密碼
            </label>
            <input
              type="password"
              required
              value={formData.confirmPassword}
              onChange={(e) =>
                setFormData({ ...formData, confirmPassword: e.target.value })
              }
              className="w-full px-3 py-2 border rounded-md"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? '重設中...' : '重設密碼'}
          </button>
        </form>
      </div>
    </div>
  )
}
```

**驗收標準**:
- ✅ 忘記密碼 Email 可正常發送（檢查 Resend Dashboard）
- ✅ Token 有效期 1 小時
- ✅ 使用 Token 可成功重設密碼
- ✅ 已使用的 Token 不可重複使用

---

### Task 6: 使用者設定頁面（Day 7, 1 天）

#### 6.1 建立設定頁面

**檔案**: `app/settings/page.tsx`

```typescript
'use client'

import { useSession } from 'next-auth/react'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function SettingsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  const [formData, setFormData] = useState({
    name: '',
    image: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
    }

    if (session?.user) {
      setFormData({
        name: session.user.name || '',
        image: session.user.image || '',
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      })
    }
  }, [session, status, router])

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage(null)
    setLoading(true)

    try {
      const res = await fetch('/api/user/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          image: formData.image,
        }),
      })

      if (!res.ok) {
        throw new Error('更新失敗')
      }

      setMessage({ type: 'success', text: '個人資料已更新' })
    } catch (err) {
      setMessage({ type: 'error', text: '更新失敗，請稍後再試' })
    } finally {
      setLoading(false)
    }
  }

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage(null)

    if (formData.newPassword !== formData.confirmPassword) {
      setMessage({ type: 'error', text: '新密碼與確認密碼不一致' })
      return
    }

    setLoading(true)

    try {
      const res = await fetch('/api/user/password', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword: formData.currentPassword,
          newPassword: formData.newPassword,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setMessage({ type: 'error', text: data.error || '密碼變更失敗' })
        return
      }

      setMessage({ type: 'success', text: '密碼已變更' })
      setFormData({
        ...formData,
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      })
    } catch (err) {
      setMessage({ type: 'error', text: '密碼變更失敗，請稍後再試' })
    } finally {
      setLoading(false)
    }
  }

  if (status === 'loading') {
    return <div className="min-h-screen flex items-center justify-center">載入中...</div>
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">使用者設定</h1>

        {message && (
          <div
            className={`mb-4 px-4 py-2 rounded ${
              message.type === 'success'
                ? 'bg-green-50 text-green-600'
                : 'bg-red-50 text-red-600'
            }`}
          >
            {message.text}
          </div>
        )}

        {/* Profile Section */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">個人資料</h2>
          <form onSubmit={handleProfileUpdate} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <input
                type="email"
                value={session?.user?.email || ''}
                disabled
                className="w-full px-3 py-2 border rounded-md bg-gray-100"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">名稱</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border rounded-md"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">頭像 URL</label>
              <input
                type="url"
                value={formData.image}
                onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                className="w-full px-3 py-2 border rounded-md"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? '儲存中...' : '儲存變更'}
            </button>
          </form>
        </div>

        {/* Password Section (only for email users) */}
        {session?.user?.provider === 'email' && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">變更密碼</h2>
            <form onSubmit={handlePasswordChange} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">目前密碼</label>
                <input
                  type="password"
                  value={formData.currentPassword}
                  onChange={(e) =>
                    setFormData({ ...formData, currentPassword: e.target.value })
                  }
                  className="w-full px-3 py-2 border rounded-md"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">新密碼</label>
                <input
                  type="password"
                  value={formData.newPassword}
                  onChange={(e) =>
                    setFormData({ ...formData, newPassword: e.target.value })
                  }
                  className="w-full px-3 py-2 border rounded-md"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">確認新密碼</label>
                <input
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) =>
                    setFormData({ ...formData, confirmPassword: e.target.value })
                  }
                  className="w-full px-3 py-2 border rounded-md"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? '變更中...' : '變更密碼'}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  )
}
```

**驗收標準**:
- ✅ 可編輯名稱與頭像 URL
- ✅ Email 使用者可變更密碼（需驗證舊密碼）
- ✅ OAuth 使用者看不到密碼變更區塊
- ✅ 成功更新顯示 Toast 訊息

---

### Task 7: 首頁認證保護與登出功能（Day 8, 1 天）

#### 7.1 保護首頁（需登入才能存取）

**檔案**: `middleware.ts`

```typescript
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'

export async function middleware(request: NextRequest) {
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  })

  const { pathname } = request.nextUrl

  // Allow auth pages without authentication
  if (pathname.startsWith('/auth/')) {
    return NextResponse.next()
  }

  // Protect all other pages
  if (!token) {
    const signInUrl = new URL('/auth/signin', request.url)
    signInUrl.searchParams.set('callbackUrl', pathname)
    return NextResponse.redirect(signInUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
```

#### 7.2 新增 Header 與登出功能

**檔案**: `components/layout/Header.tsx`

```typescript
'use client'

import { useSession, signOut } from 'next-auth/react'
import Link from 'next/link'

export function Header() {
  const { data: session } = useSession()

  return (
    <header className="bg-white shadow-sm border-b">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link href="/" className="text-xl font-bold">
          3D Avatar 對話系統
        </Link>

        {session && (
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">
              {session.user?.name || session.user?.email}
            </span>

            <div className="relative group">
              <button className="flex items-center gap-2">
                <img
                  src={session.user?.image || '/default-avatar.png'}
                  alt="Avatar"
                  className="w-8 h-8 rounded-full"
                />
              </button>

              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 hidden group-hover:block">
                <Link
                  href="/settings"
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  設定
                </Link>
                <button
                  onClick={() => signOut({ callbackUrl: '/auth/signin' })}
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  登出
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  )
}
```

更新 `app/layout.tsx` 新增 Header:

```typescript
import { Header } from '@/components/layout/Header'

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="zh-TW">
      <body>
        <SessionProvider>
          <Header />
          {children}
        </SessionProvider>
      </body>
    </html>
  )
}
```

**驗收標準**:
- ✅ 未登入訪問首頁 → 自動導向登入頁
- ✅ Header 顯示使用者名稱與頭像
- ✅ 點擊登出 → 清除 Session → 導向登入頁
- ✅ 點擊設定 → 導向設定頁面

---

### Task 8: Rate Limiting 與安全性強化（Day 9, 1 天）

#### 8.1 實作 Rate Limiting（Upstash Redis）

**檔案**: `lib/rate-limit.ts`

```typescript
import { Redis } from '@upstash/redis'

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
})

export async function rateLimit(
  identifier: string,
  limit: number,
  window: number // seconds
): Promise<{ success: boolean; remaining: number; reset: number }> {
  const key = `rate-limit:${identifier}`

  const count = await redis.incr(key)

  if (count === 1) {
    await redis.expire(key, window)
  }

  const ttl = await redis.ttl(key)

  const success = count <= limit
  const remaining = Math.max(0, limit - count)
  const reset = Date.now() + ttl * 1000

  return { success, remaining, reset }
}
```

#### 8.2 應用 Rate Limiting 到登入 API

在 `lib/auth/config.ts` 的 `authorize` 函數中：

```typescript
async authorize(credentials) {
  const ip = credentials?.ip as string || 'unknown'

  // Rate limiting: 5 attempts per minute
  const rateLimitResult = await rateLimit(`login:${ip}`, 5, 60)

  if (!rateLimitResult.success) {
    throw new Error('登入嘗試次數過多，請稍後再試')
  }

  // ... 原有的驗證邏輯
}
```

**驗收標準**:
- ✅ 連續失敗 5 次登入 → 鎖定 1 分鐘
- ✅ 鎖定期間顯示錯誤訊息

---

### Task 9: 單元測試（Day 10, 1 天）

#### 9.1 設定測試環境

```bash
npm install -D jest @testing-library/react @testing-library/jest-dom jest-environment-jsdom
```

**檔案**: `jest.config.js`

```javascript
const nextJest = require('next/jest')

const createJestConfig = nextJest({
  dir: './',
})

const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'jest-environment-jsdom',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
}

module.exports = createJestConfig(customJestConfig)
```

#### 9.2 撰寫關鍵測試

**檔案**: `__tests__/auth/register.test.ts`

```typescript
import { POST } from '@/app/api/auth/register/route'
import { prisma } from '@/lib/db/prisma'

jest.mock('@/lib/db/prisma', () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
  },
}))

describe('POST /api/auth/register', () => {
  it('should register a new user successfully', async () => {
    (prisma.user.findUnique as jest.Mock).mockResolvedValue(null)
    (prisma.user.create as jest.Mock).mockResolvedValue({
      id: '1',
      email: 'test@example.com',
    })

    const request = new Request('http://localhost:3000/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'Password123',
      }),
    })

    const response = await POST(request as any)
    const data = await response.json()

    expect(response.status).toBe(201)
    expect(data.success).toBe(true)
  })

  it('should reject duplicate email', async () => {
    (prisma.user.findUnique as jest.Mock).mockResolvedValue({
      id: '1',
      email: 'test@example.com',
    })

    const request = new Request('http://localhost:3000/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'Password123',
      }),
    })

    const response = await POST(request as any)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe('此 Email 已被註冊')
  })
})
```

執行測試:
```bash
npm test
```

**驗收標準**:
- ✅ 註冊 API 測試通過（成功 & 失敗場景）
- ✅ 測試覆蓋率 ≥ 60%（認證模組）

---

## 測試計劃

### 手動測試清單

#### 註冊功能
- [ ] 使用有效 Email/Password 註冊新帳號
- [ ] 使用已存在的 Email 註冊（應失敗）
- [ ] 使用弱密碼註冊（應顯示錯誤）
- [ ] 密碼與確認密碼不一致（應顯示錯誤）
- [ ] 註冊成功後自動登入並導向首頁

#### 登入功能
- [ ] 使用正確 Email/Password 登入
- [ ] 使用錯誤密碼登入（應顯示錯誤）
- [ ] 使用不存在的 Email 登入（應顯示錯誤）
- [ ] 連續失敗 5 次登入（應被鎖定 1 分鐘）
- [ ] 點擊 "Sign in with Google"（應導向 OAuth 授權頁）
- [ ] Google OAuth 授權成功後登入
- [ ] Microsoft OAuth 授權成功後登入

#### 密碼重設
- [ ] 輸入已註冊 Email，應收到重設信件
- [ ] 點擊信件連結，應導向重設密碼頁
- [ ] 輸入新密碼，應成功重設
- [ ] 使用新密碼登入，應成功
- [ ] 使用已使用的 Token 再次重設（應失敗）
- [ ] 使用過期 Token 重設（應失敗）

#### 使用者設定
- [ ] 編輯名稱與頭像 URL，應成功儲存
- [ ] Email 使用者變更密碼（需輸入舊密碼）
- [ ] OAuth 使用者看不到密碼變更區塊

#### 安全性
- [ ] 未登入訪問首頁 → 導向登入頁
- [ ] 登入後訪問首頁 → 正常顯示
- [ ] 點擊登出 → Session 清除 → 導向登入頁

### 自動化測試（Jest）
- [ ] 註冊 API 單元測試（成功 & 失敗）
- [ ] 登入 API 單元測試（成功 & 失敗）
- [ ] 密碼重設 Token 生成測試
- [ ] Rate Limiting 測試

### 資料庫驗證
- [ ] 註冊後，User Table 有新記錄
- [ ] 密碼已正確雜湊（bcrypt）
- [ ] OAuth 登入後，Account Table 有記錄
- [ ] Session Table 有 Session 記錄
- [ ] PasswordResetToken Table 有 Token 記錄

---

## 驗收標準

### 功能驗收
- ✅ 使用者可使用 Email/Password 註冊與登入
- ✅ 支援 Google OAuth 2.0 登入
- ✅ 支援 Microsoft OAuth 2.0 登入
- ✅ 密碼重設功能完整可用（Email 發送 + Token 驗證）
- ✅ 使用者可編輯個人資料（名稱、頭像）
- ✅ Email 使用者可變更密碼
- ✅ 未登入使用者無法存取首頁
- ✅ 登出功能正常

### 技術驗收
- ✅ Azure PostgreSQL 資料庫正常運行
- ✅ Prisma 遷移成功，Schema 正確
- ✅ NextAuth.js 整合完成
- ✅ Resend Email 服務可正常發信
- ✅ Upstash Redis Rate Limiting 正常運作
- ✅ 密碼使用 bcrypt 雜湊（10 rounds）
- ✅ Session 儲存於 PostgreSQL（非 JWT）
- ✅ CSRF 保護啟用

### 測試驗收
- ✅ 單元測試覆蓋率 ≥ 60%（認證模組）
- ✅ 所有手動測試項目通過
- ✅ 無 TypeScript 錯誤
- ✅ ESLint 檢查通過

### 安全性驗收
- ✅ Rate Limiting: 登入 API 限制 5 次/分鐘/IP
- ✅ 密碼強度驗證: 至少 8 字元，含大小寫字母與數字
- ✅ 防止帳號列舉: 登入錯誤訊息統一為 "Email 或密碼錯誤"
- ✅ 密碼重設 Token 有效期 1 小時，單次使用
- ✅ Session 有效期 7 天（可透過 Remember Me 延長至 30 天）

### 效能驗收
- ✅ 登入延遲 < 500ms（本地環境）
- ✅ OAuth 登入延遲 < 2s
- ✅ Session 查詢 < 100ms
- ✅ Prisma 連線池配置正確（max 5 connections）

---

## 風險與緩解

### 風險 1: Azure PostgreSQL 連線問題
**機率**: 低
**影響**: 高（無法登入與註冊）
**緩解措施**:
- 使用 Prisma 連線池管理（max 5 connections）
- 設定 Azure Firewall Rules 允許開發機 IP
- 測試環境使用本地 PostgreSQL（Docker）

### 風險 2: OAuth Provider API 失敗
**機率**: 中
**影響**: 中（OAuth 使用者無法登入）
**緩解措施**:
- 顯示友善錯誤訊息
- 提供 Email/Password 登入作為 fallback
- 監控 OAuth API 狀態（Google Cloud Status, Azure Status）

### 風險 3: Email 服務（Resend）無法發信
**機率**: 低
**影響**: 中（無法重設密碼）
**緩解措施**:
- 免費方案限制 3,000 封/月，MVP 階段足夠
- 監控 Resend Dashboard 使用量
- 備案: 使用 SendGrid 或 AWS SES

### 風險 4: Rate Limiting Redis 服務中斷
**機率**: 低
**影響**: 低（Rate Limiting 失效，但功能正常）
**緩解措施**:
- Upstash 免費方案穩定性高
- Rate Limiting 失敗時 graceful degradation（允許請求通過）

### 風險 5: 時程延誤
**機率**: 中
**影響**: 高（影響後續 Sprint）
**緩解措施**:
- 每日 Standup 檢查進度
- 優先完成 P0 功能（Email 登入、Session 管理）
- 如時程緊迫，OAuth 可延後至 Sprint 2

---

## Definition of Done

### 程式碼品質
- ✅ 所有程式碼通過 TypeScript 檢查（無 any 型別）
- ✅ ESLint 檢查通過（無 Error，Warning < 5）
- ✅ 程式碼格式化（Prettier）
- ✅ 無 console.log（使用結構化日誌）

### 功能完整性
- ✅ 所有 User Stories 的 Acceptance Criteria 達成
- ✅ 手動測試清單 100% 通過
- ✅ 單元測試覆蓋率 ≥ 60%

### 文件更新
- ✅ 更新 README.md（新增認證功能說明）
- ✅ 更新 CLAUDE.md（新增認證架構與 API 文件）
- ✅ 撰寫 Sprint 1 回顧文件（包含遇到的問題與解決方案）

### 部署就緒
- ✅ Production 環境變數配置完成（Azure Static Web Apps）
- ✅ Azure PostgreSQL Production Database 建立
- ✅ Prisma 遷移腳本可正常執行
- ✅ CI/CD Pipeline 通過（GitHub Actions）

### 安全性
- ✅ 密碼雜湊使用 bcryptjs（10 rounds）
- ✅ 環境變數不包含在 Git 版本控制
- ✅ API Rate Limiting 啟用
- ✅ CSRF 保護啟用

### 效能
- ✅ Lighthouse Performance Score ≥ 80
- ✅ 登入延遲 < 500ms（Development）
- ✅ 無記憶體洩漏（Chrome DevTools Memory Profiler）

---

## Sprint 1 Daily Tasks

### Week 1 (Day 1-5)

**Day 1 (2025-10-22)**: 專案設定與 UI 系統升級（1.5 天）

**上午** (4 小時):
- [ ] 安裝認證套件（NextAuth, Prisma, bcryptjs）
- [ ] 設定 Azure PostgreSQL
- [ ] 初始化 Prisma 與執行遷移
- [ ] 設定 OAuth Providers（Google, Microsoft）
- [ ] 設定 Resend 與 Upstash Redis

**下午** (2-3 小時):
- [ ] 安裝表單處理套件（React Hook Form, Zod）
- [ ] 初始化 shadcn/ui (`npx shadcn-ui@latest init`)
- [ ] 安裝核心 UI 組件（button, input, label, form, toast, dropdown-menu, dialog）
- [ ] 安裝輔助 UI 組件（card, separator, avatar, skeleton）
- [ ] 建立測試頁面驗證組件（可選）
- [ ] 在 `app/layout.tsx` 加入 `<Toaster />`

**Day 2 (2025-10-23)**: NextAuth.js 整合
- [ ] 建立 NextAuth.js 配置檔案
- [ ] 建立 Prisma Client 單例
- [ ] 建立 NextAuth API Route
- [ ] 建立 Session Provider
- [ ] 測試基本認證流程

**Day 3 (2025-10-24)**: 使用者註冊功能
- [ ] 建立註冊 API（/api/auth/register）
- [ ] 建立註冊頁面 UI
- [ ] 實作密碼驗證邏輯
- [ ] 測試註冊流程（成功 & 失敗）

**Day 4 (2025-10-25)**: 登入功能
- [ ] 建立登入頁面 UI
- [ ] 整合 Email/Password 登入
- [ ] 整合 Google OAuth
- [ ] 整合 Microsoft OAuth
- [ ] 測試所有登入方式

**Day 5 (2025-10-26)**: 密碼重設功能
- [ ] 建立忘記密碼 API
- [ ] 建立重設密碼 API
- [ ] 建立忘記密碼頁面
- [ ] 建立重設密碼頁面
- [ ] 測試完整密碼重設流程

### Week 2 (Day 6-10)

**Day 6 (2025-10-29)**: 使用者設定頁面
- [ ] 建立設定頁面 UI
- [ ] 建立個人資料更新 API
- [ ] 建立密碼變更 API
- [ ] 測試設定頁面所有功能

**Day 7 (2025-10-30)**: 首頁認證保護
- [ ] 建立 Middleware（認證檢查）
- [ ] 建立 Header 組件
- [ ] 實作登出功能
- [ ] 測試認證流程（保護頁面）

**Day 8 (2025-10-31)**: Rate Limiting 與安全性
- [ ] 實作 Rate Limiting（Upstash Redis）
- [ ] 應用 Rate Limiting 到登入 API
- [ ] 測試 Rate Limiting（連續失敗 5 次）
- [ ] 安全性檢查（CSRF, HTTPS, 密碼雜湊）

**Day 9 (2025-11-01)**: 單元測試
- [ ] 設定 Jest 測試環境
- [ ] 撰寫註冊 API 測試
- [ ] 撰寫登入 API 測試
- [ ] 撰寫密碼重設測試
- [ ] 執行測試並達到 60% 覆蓋率

**Day 10 (2025-11-04)**: 整合測試與文件
- [ ] 執行完整手動測試清單
- [ ] 修復發現的 Bug
- [ ] 更新專案文件（README, CLAUDE.md）
- [ ] 撰寫 Sprint 1 回顧文件
- [ ] Sprint 1 Demo 準備

---

## Sprint 1 成功標準

### 主要目標達成
- ✅ 使用者可註冊、登入、登出
- ✅ 支援 3 種登入方式（Email, Google, Microsoft）
- ✅ 密碼重設功能完整可用
- ✅ 使用者可編輯個人資料
- ✅ 首頁需登入才能存取

### 技術債務控制
- ✅ 無已知的 P0/P1 Bug
- ✅ 程式碼品質達標（TypeScript, ESLint）
- ✅ 測試覆蓋率 ≥ 60%

### 為 Sprint 2 做好準備
- ✅ 資料庫 Schema 包含 Conversation 與 Message（雖未使用）
- ✅ Session 管理穩定（可支援對話歷史功能）
- ✅ NextAuth.js 整合完整（可擴充更多 Providers）

---

**文件維護**: Development Team
**最後更新**: 2025-10-15
**Sprint 狀態**: 規劃完成，待執行
**預計開始日期**: 2025-10-22
**預計結束日期**: 2025-11-04
