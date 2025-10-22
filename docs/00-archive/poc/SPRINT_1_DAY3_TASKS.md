# Sprint 1 Day 3 開發任務清單

**日期**: 2025-10-16 (預計)
**Sprint**: Sprint 1 / 12
**Story**: Story 1.1 - 使用者認證系統
**Day**: Day 3 / 10.5
**預計時間**: 8 小時 (上午 4 小時 + 下午 4 小時)

---

## 📋 Day 3 目標

根據 Sprint 1 計劃，Day 3 的核心目標：

1. ✅ **驗證 Tailwind CSS 修復** - 確認樣式正常
2. 🔧 **安裝 shadcn/ui 完整組件系統** - 企業級 UI 框架
3. 🗄️ **設定 Prisma 與資料庫** - PostgreSQL + ORM
4. 🔐 **安裝認證套件** - NextAuth.js + 相關依賴
5. ⚙️ **建立 NextAuth.js 配置** - 認證系統核心
6. ✅ **測試基礎認證流程** - 驗證整合成功

---

## ✅ 上午任務 (4 小時)

### Task 1: 驗證 Tailwind CSS 修復 (30 分鐘)

**檢查項目**:
- [ ] 打開瀏覽器訪問 http://localhost:3000/register
- [ ] 確認頁面顯示完整樣式:
  - [ ] 灰色背景 (bg-gray-50)
  - [ ] 白色卡片容器帶圓角和陰影
  - [ ] 藍色按鈕 (hover 效果)
  - [ ] 輸入框完整樣式
- [ ] 測試 http://localhost:3000/login
- [ ] 測試 http://localhost:3000/verify-email
- [ ] 檢查響應式設計 (行動裝置視窗)

**驗收標準**:
- ✅ 所有認證頁面樣式正常
- ✅ 無 Console 錯誤
- ✅ 響應式設計正常

**如果失敗**:
- 重新啟動開發服務器: `npm run dev`
- 清除瀏覽器快取: Ctrl+Shift+R
- 檢查 `app/globals.css` 第 16 行是否為 `@import "tailwindcss";`

---

### Task 2: 安裝 shadcn/ui 組件系統 (1.5 小時)

#### 步驟 2.1: 安裝表單處理套件

```bash
npm install react-hook-form zod @hookform/resolvers
```

**檢查**:
- [ ] `package.json` 包含這些依賴
- [ ] 無版本衝突警告

#### 步驟 2.2: 初始化 shadcn/ui

```bash
npx shadcn-ui@latest init
```

**互動式設定選項**:
- Style: `Default`
- Base Color: `Slate`
- CSS Variables: `yes`

**生成的檔案**:
- [ ] `components.json` (shadcn/ui 配置)
- [ ] `lib/utils.ts` (cn 函數，如已存在則跳過)

#### 步驟 2.3: 安裝核心 UI 組件

```bash
npx shadcn-ui@latest add button input label form toast dropdown-menu dialog
```

**預期生成**:
- [ ] `components/ui/button.tsx` (可能已存在，覆蓋或合併)
- [ ] `components/ui/input.tsx` (可能已存在，檢查差異)
- [ ] `components/ui/label.tsx`
- [ ] `components/ui/form.tsx`
- [ ] `components/ui/toast.tsx` + `components/ui/toaster.tsx` + `components/ui/use-toast.ts`
- [ ] `components/ui/dropdown-menu.tsx`
- [ ] `components/ui/dialog.tsx`

#### 步驟 2.4: 安裝輔助 UI 組件

```bash
npx shadcn-ui@latest add card separator avatar skeleton
```

**預期生成**:
- [ ] `components/ui/card.tsx` (可能已存在)
- [ ] `components/ui/separator.tsx`
- [ ] `components/ui/avatar.tsx`
- [ ] `components/ui/skeleton.tsx`

#### 步驟 2.5: 更新 app/layout.tsx 加入 Toaster

編輯 `app/layout.tsx`:

```typescript
import { Toaster } from '@/components/ui/toaster'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-TW" className={`${inter.variable} ${notoSansTC.variable}`}>
      <body className="font-sans antialiased">
        <ErrorBoundary>
          {children}
          <Toaster />  {/* 新增 Toast 通知 */}
        </ErrorBoundary>
      </body>
    </html>
  )
}
```

#### 步驟 2.6: 測試組件

創建測試頁面 (可選):

```bash
# 可選：創建簡單測試頁面
echo 'export default function Test() { return <div>組件測試</div> }' > app/test/page.tsx
```

**驗收標準**:
- ✅ `components/ui/` 目錄包含 11 個組件
- ✅ `components.json` 配置檔案已生成
- ✅ `app/layout.tsx` 已加入 `<Toaster />`
- ✅ 無 TypeScript 錯誤
- ✅ 無版本衝突

**參考文檔**: `docs/SHADCN_UI_SETUP_GUIDE.md`

---

### Task 3: 設定 Prisma 與資料庫 (2 小時)

#### 步驟 3.1: 安裝 Prisma 套件

```bash
npm install @prisma/client@6.2.0
npm install -D prisma@6.2.0
```

#### 步驟 3.2: 初始化 Prisma

```bash
npx prisma init
```

**生成的檔案**:
- [ ] `prisma/schema.prisma`
- [ ] `.env` (如不存在)

#### 步驟 3.3: 選擇資料庫方案

**方案 A: Docker 本地 PostgreSQL (推薦)**

創建 `docker-compose.yml`:

```yaml
version: '3.8'
services:
  postgres:
    image: postgres:16-alpine
    container_name: smart-avatar-db-dev
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: smart_avatar_dev
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

啟動資料庫:

```bash
docker-compose up -d
```

**連線字串 (.env)**:

```bash
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/smart_avatar_dev?schema=public"
```

**方案 B: Azure PostgreSQL (生產環境設定，可延後)**

參考 `docs/SPRINT_1_PLAN.md` Task 1.3

#### 步驟 3.4: 建立 Prisma Schema

編輯 `prisma/schema.prisma`:

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// NextAuth.js Models
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
```

#### 步驟 3.5: 執行資料庫遷移

```bash
npx prisma migrate dev --name init-auth-schema
```

**預期輸出**:
```
✔ Generated Prisma Client
✔ Created migration: 20251016_init_auth_schema
✔ Applied migration
```

#### 步驟 3.6: 生成 Prisma Client

```bash
npx prisma generate
```

#### 步驟 3.7: 驗證資料庫

```bash
npx prisma studio
```

**檢查**:
- [ ] Prisma Studio 在 http://localhost:5555 開啟
- [ ] 看到所有 Table: User, Account, Session, VerificationToken, PasswordResetToken

**驗收標準**:
- ✅ Prisma 遷移成功
- ✅ Prisma Studio 可開啟
- ✅ 資料庫連線正常
- ✅ 所有 Table 已建立

---

## 🔧 下午任務 (4 小時)

### Task 4: 安裝認證套件 (30 分鐘)

#### 步驟 4.1: 安裝 NextAuth.js v5

```bash
npm install next-auth@5.0.0-beta.25 @auth/prisma-adapter@2.7.4
```

#### 步驟 4.2: 安裝密碼雜湊套件

```bash
npm install bcryptjs
npm install -D @types/bcryptjs
```

#### 步驟 4.3: 安裝 Email 服務

```bash
npm install resend
```

#### 步驟 4.4: 安裝 Rate Limiting

```bash
npm install @upstash/redis
```

#### 步驟 4.5: 更新 .env.local

創建或更新 `.env.local`:

```bash
# Database
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/smart_avatar_dev?schema=public"

# NextAuth.js
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-here-generate-with-openssl-rand-base64-32"

# Google OAuth (待設定)
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""

# Microsoft OAuth (待設定)
MICROSOFT_CLIENT_ID=""
MICROSOFT_CLIENT_SECRET=""

# Resend (待設定)
RESEND_API_KEY=""
RESEND_FROM_EMAIL="noreply@yourdomain.com"

# Upstash Redis (待設定)
UPSTASH_REDIS_REST_URL=""
UPSTASH_REDIS_REST_TOKEN=""

# Azure Services (from POC)
AZURE_OPENAI_API_KEY="..."
AZURE_OPENAI_ENDPOINT="..."
AZURE_OPENAI_DEPLOYMENT="gpt-4-turbo"
AZURE_SPEECH_KEY="..."
AZURE_SPEECH_REGION="eastasia"
```

**生成 NEXTAUTH_SECRET**:

```bash
openssl rand -base64 32
```

**驗收標準**:
- ✅ 所有套件安裝成功
- ✅ `.env.local` 包含所有必要變數
- ✅ 無版本衝突

---

### Task 5: 建立 NextAuth.js 配置 (2.5 小時)

#### 步驟 5.1: 建立 Prisma Client 單例

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

**檢查**:
- [ ] 檔案創建成功
- [ ] 無 TypeScript 錯誤

#### 步驟 5.2: 建立 NextAuth 配置

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
    signIn: '/login',
    signOut: '/login',
    error: '/login',
  },
  session: {
    strategy: 'database',
    maxAge: 7 * 24 * 60 * 60, // 7 days
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

**注意事項**:
- Google/Microsoft Client ID 現在可以留空，Day 4 會設定
- Credentials Provider 用於 Email/Password 登入

#### 步驟 5.3: 建立 NextAuth API Route

**檔案**: `app/api/auth/[...nextauth]/route.ts`

```typescript
import NextAuth from 'next-auth'
import { authConfig } from '@/lib/auth/config'

const handler = NextAuth(authConfig)

export { handler as GET, handler as POST }
```

#### 步驟 5.4: 建立 Session Provider

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

#### 步驟 5.5: 更新 app/layout.tsx

修改 `app/layout.tsx`:

```typescript
import { SessionProvider } from '@/components/auth/SessionProvider'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-TW" className={`${inter.variable} ${notoSansTC.variable}`}>
      <body className="font-sans antialiased">
        <SessionProvider>
          <ErrorBoundary>
            {children}
            <Toaster />
          </ErrorBoundary>
        </SessionProvider>
      </body>
    </html>
  )
}
```

**驗收標準**:
- ✅ 所有檔案創建成功
- ✅ 無 TypeScript 錯誤
- ✅ NextAuth 配置正確

---

### Task 6: 測試基礎認證流程 (1 小時)

#### 步驟 6.1: 重啟開發服務器

```bash
# 停止當前服務器 (Ctrl+C)
npm run dev
```

#### 步驟 6.2: 測試 NextAuth 預設登入頁

訪問: http://localhost:3000/api/auth/signin

**預期結果**:
- ✅ 顯示 NextAuth 預設登入頁面
- ✅ 看到 3 個登入選項:
  - Sign in with Email
  - Sign in with Google (可能顯示錯誤，正常)
  - Sign in with Microsoft (可能顯示錯誤，正常)

#### 步驟 6.3: 測試 Prisma 連線

創建測試腳本 `scripts/test-prisma.ts`:

```typescript
import { prisma } from '../lib/db/prisma'

async function testPrisma() {
  try {
    const userCount = await prisma.user.count()
    console.log('✅ Prisma 連線成功')
    console.log(`目前使用者數量: ${userCount}`)
  } catch (error) {
    console.error('❌ Prisma 連線失敗:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testPrisma()
```

執行:

```bash
npx tsx scripts/test-prisma.ts
```

**預期輸出**:
```
✅ Prisma 連線成功
目前使用者數量: 0
```

#### 步驟 6.4: 檢查 Console 錯誤

打開瀏覽器 Console (F12) 並檢查:
- [ ] 無 NextAuth 錯誤
- [ ] 無 Prisma 連線錯誤
- [ ] 無 TypeScript 編譯錯誤

**驗收標準**:
- ✅ `/api/auth/signin` 可訪問
- ✅ Prisma 連線測試通過
- ✅ 無 Console 錯誤
- ✅ 開發服務器穩定運行

---

## 📊 Day 3 完成標準

### 功能完成度
- ✅ Tailwind CSS 樣式正常顯示
- ✅ shadcn/ui 組件系統安裝完成 (11 個組件)
- ✅ Prisma 資料庫設定完成 (PostgreSQL + Schema)
- ✅ NextAuth.js 配置完成 (Credentials + OAuth Providers)
- ✅ 基礎認證流程可測試

### 程式碼品質
- ✅ 無 TypeScript 錯誤
- ✅ ESLint 檢查通過
- ✅ 所有依賴安裝成功

### 文件更新
- ✅ 創建 Day 3 進度報告 (參考 Day 2)
- ✅ 更新 PROJECT_INDEX.md

---

## ⚠️ 預期問題與解決方案

### 問題 1: shadcn/ui 安裝衝突

**症狀**: 覆蓋提示或版本衝突

**解決方案**:
- 選擇覆蓋已存在的組件
- 手動檢查差異並合併

### 問題 2: Prisma 遷移失敗

**症狀**: 資料庫連線錯誤或 Schema 錯誤

**解決方案**:
- 檢查 DATABASE_URL 正確性
- 確認 Docker PostgreSQL 正在運行: `docker ps`
- 重新執行: `npx prisma migrate reset`

### 問題 3: NextAuth 錯誤

**症狀**: `/api/auth/signin` 報錯

**解決方案**:
- 檢查 NEXTAUTH_SECRET 已設定
- 檢查 Prisma Client 正確導入
- 重啟開發服務器

---

## 🎯 Day 4 準備

Day 3 完成後，Day 4 將實作:
- 使用者註冊 API (`/api/auth/register`)
- OAuth Provider 設定 (Google, Microsoft)
- 完整註冊與登入流程測試

---

**創建者**: Claude Code
**創建日期**: 2025-10-16
**預計執行日期**: 2025-10-16 或 2025-10-17
**預計完成時間**: 8 小時
