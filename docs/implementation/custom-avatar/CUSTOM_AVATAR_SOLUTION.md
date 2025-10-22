# 自定義 Avatar 實作方案

## 方案概述

使用 **Ready Player Me** 的照片上傳功能，讓用戶可以從照片生成個人化的 3D Avatar。

## 技術架構

### 1. Ready Player Me Photo Upload API

**API 端點**:
```
POST https://api.readyplayer.me/v1/avatars
```

**流程**:
1. 用戶上傳照片（前端）
2. 照片發送到 Ready Player Me API
3. AI 處理生成 3D Avatar
4. 返回 GLB 模型 URL
5. 儲存到資料庫

### 2. 前端實作

#### 組件結構
```
components/
├── avatar/
│   ├── PhotoUploader.tsx        # 照片上傳組件
│   ├── AvatarGenerator.tsx      # Avatar 生成進度顯示
│   └── CustomAvatarPreview.tsx  # 預覽組件
```

#### 用戶流程
```
1. 點擊「上傳照片創建 Avatar」
   ↓
2. 選擇照片（支援拖放 + 文件選擇）
   ↓
3. 照片預覽 + 確認
   ↓
4. 上傳到 Ready Player Me API
   ↓
5. 顯示生成進度（通常 30-60 秒）
   ↓
6. 生成完成，顯示 3D 預覽
   ↓
7. 儲存到用戶設定
```

### 3. 後端實作

#### API Routes
```typescript
// app/api/avatars/upload-photo/route.ts
POST /api/avatars/upload-photo
- 接收: FormData (photo file)
- 處理: 轉發到 Ready Player Me API
- 返回: { avatarUrl: string, avatarId: string }

// app/api/avatars/custom/route.ts
POST /api/avatars/custom
- 接收: { avatarUrl, name, description }
- 處理: 儲存到資料庫 (custom_avatars table)
- 返回: { success: true, avatar: CustomAvatar }
```

#### 資料庫 Schema
```prisma
model CustomAvatar {
  id          String   @id @default(cuid())
  userId      String
  name        String
  url         String   // Ready Player Me GLB URL
  thumbnailUrl String?
  sourcePhoto String?  // 原始照片 URL (可選)
  createdAt   DateTime @default(now())
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
}
```

### 4. Ready Player Me SDK 整合

#### 安裝依賴
```bash
npm install @readyplayerme/visage
```

#### 使用 Visage Widget
```typescript
import { VisageEmbed } from '@readyplayerme/visage';

<VisageEmbed
  subdomain="your-subdomain"
  onAvatarCreated={(url) => {
    console.log('Avatar created:', url);
    saveCustomAvatar(url);
  }}
  frameStyles={{
    width: '100%',
    height: '600px',
    border: 'none'
  }}
/>
```

## 成本分析

### Ready Player Me 定價

| 方案 | 價格 | 功能 |
|------|------|------|
| **Free** | $0 | 基礎功能、照片上傳、公開 Avatar |
| **Pro** | $29/月 | 私有 Avatar、自定義品牌、API 限額增加 |
| **Enterprise** | 聯繫報價 | 完全客製化、專屬支援、無限 API |

### 建議
- **POC / MVP**: 使用 Free 方案
- **正式上線**: Pro 方案（如需私有 Avatar）
- **大規模部署**: Enterprise 方案

## 替代方案比較

### 方案 A: Ready Player Me ⭐⭐⭐⭐⭐
✅ 已整合、易於使用、支援照片上傳
✅ 高品質 3D 模型、免費方案可用
❌ 有 API 限額（Free: 100 requests/day）

### 方案 B: Meshcapade ⭐⭐⭐⭐
✅ 專業級精度、全身掃描
✅ 適合企業級應用
❌ 僅付費、成本較高、整合較複雜

### 方案 C: MetaHuman (Unreal Engine) ⭐⭐⭐
✅ 極高品質、電影級效果
❌ 需要 Unreal Engine、技術門檻高
❌ 不支援 Web 瀏覽器直接渲染

### 方案 D: HeyGen / D-ID ⭐⭐⭐
✅ 高度逼真面部動畫
❌ 主要為 2D 影片，非 3D 模型
❌ 不適合互動式 3D Avatar

## 實作步驟

### Phase 1: 基礎整合（1-2 天）
- [ ] 安裝 Ready Player Me SDK
- [ ] 創建照片上傳 API route
- [ ] 實作前端上傳組件
- [ ] 測試 Avatar 生成流程

### Phase 2: 資料庫整合（1 天）
- [ ] 創建 CustomAvatar model
- [ ] 實作儲存自定義 Avatar 邏輯
- [ ] 在 AvatarSelector 中顯示自定義 Avatar

### Phase 3: UX 優化（1-2 天）
- [ ] 添加生成進度顯示
- [ ] 實作 3D 預覽功能
- [ ] 添加照片裁剪功能
- [ ] 添加錯誤處理和重試機制

### Phase 4: 測試與上線（1 天）
- [ ] 端到端測試
- [ ] 性能優化
- [ ] 文檔更新

## 範例代碼

### 1. PhotoUploader 組件
```typescript
'use client'

import { useState } from 'react'
import { toast } from 'sonner'

export default function PhotoUploader({ onAvatarCreated }: Props) {
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)

  const handleUpload = async (file: File) => {
    setUploading(true)

    try {
      const formData = new FormData()
      formData.append('photo', file)

      const response = await fetch('/api/avatars/upload-photo', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) throw new Error('上傳失敗')

      const data = await response.json()
      onAvatarCreated(data.avatarUrl)
      toast.success('Avatar 生成成功！')
    } catch (error) {
      console.error(error)
      toast.error('生成 Avatar 失敗，請重試')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="border-2 border-dashed border-gray-300 rounded-lg p-8">
      <input
        type="file"
        accept="image/*"
        onChange={(e) => e.target.files?.[0] && handleUpload(e.target.files[0])}
        disabled={uploading}
        className="hidden"
        id="photo-upload"
      />
      <label
        htmlFor="photo-upload"
        className="cursor-pointer flex flex-col items-center"
      >
        {uploading ? (
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p>正在生成 Avatar... {progress}%</p>
          </div>
        ) : (
          <>
            <p className="text-lg font-medium mb-2">上傳照片創建 Avatar</p>
            <p className="text-sm text-gray-500">支援 JPG, PNG 格式</p>
          </>
        )}
      </label>
    </div>
  )
}
```

### 2. API Route
```typescript
// app/api/avatars/upload-photo/route.ts
import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'edge'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const photo = formData.get('photo') as File

    if (!photo) {
      return NextResponse.json({ error: '未提供照片' }, { status: 400 })
    }

    // 轉發到 Ready Player Me API
    const rpmFormData = new FormData()
    rpmFormData.append('photo', photo)

    const response = await fetch('https://api.readyplayer.me/v1/avatars', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.READYPLAYERME_API_KEY}`,
      },
      body: rpmFormData,
    })

    if (!response.ok) {
      throw new Error('Ready Player Me API 錯誤')
    }

    const data = await response.json()

    return NextResponse.json({
      success: true,
      avatarUrl: data.url,
      avatarId: data.id,
    })
  } catch (error) {
    console.error('[Avatar Upload Error]', error)
    return NextResponse.json(
      { error: '生成 Avatar 失敗' },
      { status: 500 }
    )
  }
}
```

## 環境變數

```env
# .env.local
READYPLAYERME_API_KEY=your_api_key_here
READYPLAYERME_SUBDOMAIN=your_subdomain
```

## 注意事項

1. **照片要求**:
   - 清晰的正面照
   - 光線充足
   - 無遮擋物（眼鏡、帽子會影響效果）
   - 建議尺寸: 512x512px 以上

2. **生成時間**:
   - 通常 30-60 秒
   - 需要顯示進度指示器

3. **API 限額**:
   - Free 方案: 100 requests/day
   - 建議在前端實作快取機制

4. **隱私考量**:
   - 照片僅用於生成 Avatar
   - Ready Player Me 會刪除原始照片
   - GLB 模型會保留在 CDN

## 參考資源

- [Ready Player Me Documentation](https://docs.readyplayer.me/)
- [Ready Player Me API Reference](https://docs.readyplayer.me/ready-player-me/api-reference)
- [Visage SDK Guide](https://docs.readyplayer.me/ready-player-me/integration-guides/web/visage)
