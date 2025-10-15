# Sprint 1 計劃 - 本地開發優化版
**3D Avatar 即時對話系統 - MVP 開發（本地環境）**

## Sprint 資訊
- **Sprint**: Sprint 1 / 12
- **時程**: 2025-10-22 ~ 2025-11-02（**8-9 天**，優化後）
- **Epic**: Epic 1 - 核心使用者功能
- **Story**: Story 1.1 - 使用者認證系統（簡化版）
- **Story Points**: **8 SP**（原 11 SP，移除 OAuth 與雲端服務）
- **優先級**: P0（必要功能）

---

## 🎯 主要變更（vs 原計劃）

### ✅ 保留功能（核心認證）
- 使用者註冊（Email/Password）
- 使用者登入（Email/Password + Remember Me）
- 密碼重設（Console Log 模擬 Email）
- 使用者設定頁面（編輯名稱、頭像、密碼）
- 登出功能
- 首頁認證保護（Middleware）
- Rate Limiting（Docker Redis）

### ⏳ 延後功能（Sprint 2-3）
- ❌ Google OAuth（節省 0.5 天）
- ❌ Microsoft OAuth（節省 0.5 天）
- ❌ 真實 Email 發送（Resend）（節省 0.5 天）

### 🐳 本地化服務
- PostgreSQL → Docker（替代 Azure PostgreSQL）
- Redis → Docker（替代 Upstash）
- Email → Console Log 模擬（替代 Resend）

---

## 📦 技術堆疊（本地開發）

### 認證框架
- NextAuth.js v5 (僅 Credentials Provider)
- @auth/prisma-adapter
- bcryptjs（密碼雜湊）

### 資料庫 & ORM
- **Docker PostgreSQL** (postgres:16-alpine)
- Prisma v6.2.0
- Prisma Studio（GUI 管理工具）

### UI 系統
- Radix UI + shadcn/ui（完整組件系統）
- React Hook Form + Zod（表單驗證）
- Tailwind CSS 4.1.14

### Rate Limiting
- **Docker Redis** (redis:7-alpine)
- ioredis（Node.js Redis 客戶端）

### Email（開發環境）
- **Console Log 模擬**（lib/email/mock.ts）

---

## 📋 開發任務分解（8-9 天）

### Task 1: Docker 環境設定（Day 1 上午，2 小時）

#### 1.1 啟動 Docker 服務
```bash
# 啟動 PostgreSQL + Redis
docker-compose up -d

# 檢查服務狀態
docker-compose ps
```

#### 1.2 驗證連線
```bash
# PostgreSQL
docker exec -it smart-avatar-db psql -U avatar_user -d smart_avatar_dev

# Redis
docker exec -it smart-avatar-redis redis-cli -a dev_redis_password PING
```

**驗收標準**:
- ✅ Docker 容器正常運行
- ✅ PostgreSQL 可連線
- ✅ Redis 可連線

---

### Task 2: 安裝套件與 shadcn/ui（Day 1 下午，3-4 小時）

#### 2.1 安裝認證套件
```bash
# 認證框架（不含 OAuth providers）
npm install next-auth@5.0.0-beta.25 @auth/prisma-adapter@2.7.4

# 資料庫與 ORM
npm install @prisma/client@6.2.0
npm install -D prisma@6.2.0

# 密碼雜湊
npm install bcryptjs
npm install -D @types/bcryptjs

# Redis 客戶端（本地）
npm install ioredis
npm install -D @types/ioredis
```

#### 2.2 安裝 shadcn/ui
```bash
# 表單處理
npm install react-hook-form zod @hookform/resolvers

# 初始化 shadcn/ui
npx shadcn-ui@latest init
# 選擇: Default, Slate, yes (CSS Variables)

# 安裝核心組件
npx shadcn-ui@latest add button input label form toast dropdown-menu dialog

# 安裝輔助組件
npx shadcn-ui@latest add card separator avatar skeleton
```

**驗收標準**:
- ✅ 所有套件安裝成功
- ✅ components/ui/ 包含 11 個組件
- ✅ components.json 配置檔案已生成

---

### Task 3: Prisma 設定與資料庫遷移（Day 1 晚上，1-2 小時）

#### 3.1 建立 Prisma Schema
```bash
# 初始化 Prisma
npx prisma init
```

#### 3.2 編輯 prisma/schema.prisma
```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// NextAuth.js Models (Credentials Provider only)
model User {
  id            String    @id @default(cuid())
  name          String?
  email         String    @unique
  emailVerified DateTime?
  image         String?
  password      String    // Required for Email/Password auth
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  sessions      Session[]
  conversations Conversation[]

  @@index([email])
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

// Password Reset
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

// Sprint 2 (Placeholder)
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
  role           String
  content        String   @db.Text
  createdAt      DateTime @default(now())

  conversation Conversation @relation(fields: [conversationId], references: [id], onDelete: Cascade)

  @@index([conversationId])
}
```

#### 3.3 執行遷移
```bash
# 建立遷移並生成 Prisma Client
npx prisma migrate dev --name init-auth-schema

# 開啟 Prisma Studio（可選）
npx prisma studio
```

**驗收標準**:
- ✅ Prisma 遷移成功
- ✅ 資料庫包含所有 Table
- ✅ Prisma Client 已生成

---

### Task 4: NextAuth.js 配置（Day 2，4-5 小時）

#### 4.1 建立 Prisma Client 單例

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

#### 4.2 建立 NextAuth.js 配置（僅 Credentials Provider）

**檔案**: `lib/auth/config.ts`
```typescript
import { NextAuthConfig } from 'next-auth'
import { PrismaAdapter } from '@/auth/prisma-adapter'
import { prisma } from '@/lib/db/prisma'
import CredentialsProvider from 'next-auth/providers/credentials'
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
  ],
  pages: {
    signIn: '/auth/signin',
    signOut: '/auth/signout',
    error: '/auth/error',
  },
  session: {
    strategy: 'database',
    maxAge: 7 * 24 * 60 * 60, // 7 days
  },
}
```

#### 4.3 建立 NextAuth.js API Route

**檔案**: `app/api/auth/[...nextauth]/route.ts`
```typescript
import NextAuth from 'next-auth'
import { authConfig } from '@/lib/auth/config'

const handler = NextAuth(authConfig)

export { handler as GET, handler as POST }
```

#### 4.4 建立 Session Provider

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

**更新 app/layout.tsx**:
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
- ✅ NextAuth.js 配置無 TypeScript 錯誤
- ✅ `/api/auth/signin` 可訪問
- ✅ Prisma 連線正常

---

### Task 5: 註冊功能（Day 3，4-5 小時）

#### 5.1 註冊 API

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

    // Check existing user
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

#### 5.2 註冊頁面

**檔案**: `app/auth/register/page.tsx`（使用 shadcn/ui 組件）

（完整程式碼參考原計劃，改用 shadcn/ui Button, Input, Label, Card 等組件）

**驗收標準**:
- ✅ 可成功註冊新使用者
- ✅ 密碼驗證規則正確
- ✅ Email 重複註冊被阻擋
- ✅ 註冊成功後自動登入

---

### Task 6: 登入功能（Day 4，3-4 小時）

#### 6.1 登入頁面

**檔案**: `app/auth/signin/page.tsx`

**移除 OAuth 按鈕**，僅保留 Email/Password 登入表單。

**驗收標準**:
- ✅ Email/Password 登入成功
- ✅ 錯誤密碼顯示錯誤訊息
- ✅ 登入後導向首頁

---

### Task 7: 密碼重設（Console Log）（Day 5，3-4 小時）

#### 7.1 建立 Mock Email 服務

**檔案**: `lib/email/mock.ts`
```typescript
export async function sendPasswordResetEmail(email: string, token: string) {
  const resetUrl = `${process.env.NEXTAUTH_URL}/auth/reset-password?token=${token}`

  console.log('======================')
  console.log('📧 密碼重設 Email（模擬）')
  console.log('======================')
  console.log('收件人:', email)
  console.log('重設連結:', resetUrl)
  console.log('Token:', token)
  console.log('有效期限: 1 小時')
  console.log('======================')

  return { success: true }
}
```

#### 7.2 忘記密碼 API

**檔案**: `app/api/auth/forgot-password/route.ts`
```typescript
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'
import { sendPasswordResetEmail } from '@/lib/email/mock'
import crypto from 'crypto'

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    const user = await prisma.user.findUnique({ where: { email } })

    if (!user) {
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

    // Send mock email (Console Log)
    await sendPasswordResetEmail(email, token)

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

#### 7.3 重設密碼 API 與頁面

（參考原計劃，邏輯不變）

**測試方式**:
1. 點擊「忘記密碼」
2. 輸入 Email
3. **查看開發伺服器 Console**，複製重設連結
4. 貼到瀏覽器，輸入新密碼
5. 使用新密碼登入

**驗收標準**:
- ✅ Console Log 顯示重設連結
- ✅ Token 有效期 1 小時
- ✅ 使用 Token 可成功重設密碼

---

### Task 8: 使用者設定頁面（Day 6，3-4 小時）

（參考原計劃，移除 OAuth 相關顯示）

**驗收標準**:
- ✅ 可編輯名稱與頭像 URL
- ✅ 可變更密碼（需驗證舊密碼）

---

### Task 9: 認證保護 & 登出（Day 7，3-4 小時）

#### 9.1 Middleware

（參考原計劃，邏輯不變）

#### 9.2 Header 組件

（參考原計劃，移除 OAuth Provider 顯示）

**驗收標準**:
- ✅ 未登入訪問首頁 → 導向登入頁
- ✅ Header 顯示使用者名稱
- ✅ 登出功能正常

---

### Task 10: Rate Limiting（Docker Redis）（Day 8，2-3 小時）

#### 10.1 建立 Rate Limit 工具

**檔案**: `lib/rate-limit.ts`
```typescript
import Redis from 'ioredis'

const redis = new Redis(process.env.REDIS_URL!)

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

#### 10.2 應用到登入 API

在 `lib/auth/config.ts` 的 `authorize` 中加入 Rate Limiting。

**測試**:
連續失敗登入 5 次，第 6 次應顯示：「登入嘗試次數過多，請稍後再試」

**驗收標準**:
- ✅ Rate Limiting 正常運作
- ✅ 鎖定期間顯示錯誤訊息

---

### Task 11: 單元測試（可選，Day 8-9，2-3 小時）

（如果時間充裕再做，否則 Sprint 2 再補）

---

## 📊 優化後的時程對比

| 項目 | 原計劃 | 優化後 | 節省 |
|------|-------|--------|------|
| 專案設定 | 1.5 天 | 1 天 | 0.5 天 |
| OAuth 設定 | 0.5 天 | ❌ 移除 | 0.5 天 |
| Email 服務 | 0.5 天 | ❌ 簡化 | 0.5 天 |
| OAuth 登入功能 | 1 天 | ❌ 移除 | 1 天 |
| 其他功能 | 7 天 | 6 天 | 1 天 |
| **總計** | **10.5 天** | **8-9 天** | **2.5 天** |

---

## ✅ 驗收標準（簡化版）

### 功能驗收
- ✅ 使用者可使用 Email/Password 註冊與登入
- ✅ 密碼重設功能可用（Console Log Email）
- ✅ 使用者可編輯個人資料與變更密碼
- ✅ 未登入使用者無法存取首頁
- ✅ 登出功能正常

### 技術驗收
- ✅ Docker PostgreSQL + Redis 正常運行
- ✅ Prisma 遷移成功
- ✅ NextAuth.js 整合完成（Credentials Provider）
- ✅ shadcn/ui 組件系統完整
- ✅ Rate Limiting 正常運作

### 安全性驗收
- ✅ 密碼雜湊（bcryptjs, 10 rounds）
- ✅ Session 儲存於 PostgreSQL
- ✅ Rate Limiting: 5 次/分鐘/IP
- ✅ 密碼重設 Token 有效期 1 小時

---

## 📝 Sprint 2-3 待加功能

1. **Google OAuth**（4-6 小時）
2. **Microsoft OAuth**（4-6 小時）
3. **真實 Email 服務（Resend）**（2-3 小時）
4. **部署到 Azure PostgreSQL**（1-2 小時）
5. **切換到 Upstash Redis**（1 小時）

---

**文件維護**: Development Team
**最後更新**: 2025-01-16
**Sprint 狀態**: 本地開發優化版
**預計開始日期**: 2025-10-22
**預計結束日期**: 2025-11-02（8-9 天）
**相關文件**:
- `docs/LOCAL_DEV_GUIDE.md`（本地開發指南）
- `docs/SPRINT_1_PLAN.md`（原完整計劃）
- `docker-compose.yml`（Docker 配置）
