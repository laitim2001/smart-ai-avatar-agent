/**
 * Avatars API Route
 *
 * GET /api/avatars - 獲取可用的 Avatar 列表
 */

import { NextRequest, NextResponse } from 'next/server'

// Avatar 資料定義
export interface AvatarData {
  id: string
  name: string
  url: string
  thumbnail: string
  description: string
  category: 'male' | 'female' | 'neutral'
  tags: string[]
}

// 可用的 Avatar 列表
const AVAILABLE_AVATARS: AvatarData[] = [
  {
    id: 'alex',
    name: 'Alex',
    url: 'https://models.readyplayer.me/671f7ae90c87f7db88cc12d2.glb',
    thumbnail: '🧑',
    description: '友善的助理,適合專業場合',
    category: 'neutral',
    tags: ['professional', 'friendly', 'casual'],
  },
  {
    id: 'jordan',
    name: 'Jordan',
    url: 'https://models.readyplayer.me/671f7b210c87f7db88cc12d4.glb',
    thumbnail: '👩',
    description: '專業顧問,商務風格',
    category: 'female',
    tags: ['professional', 'business', 'formal'],
  },
  {
    id: 'casey',
    name: 'Casey',
    url: 'https://models.readyplayer.me/671f7b400c87f7db88cc12d5.glb',
    thumbnail: '🧒',
    description: '活力達人,輕鬆氛圍',
    category: 'neutral',
    tags: ['casual', 'energetic', 'young'],
  },
]

/**
 * GET /api/avatars
 * 獲取所有可用的 Avatar 列表
 *
 * Query Parameters:
 * - category: 篩選特定類別 (male/female/neutral)
 * - tag: 篩選特定標籤
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const tag = searchParams.get('tag')

    let filteredAvatars = AVAILABLE_AVATARS

    // 依類別篩選
    if (category) {
      filteredAvatars = filteredAvatars.filter(
        (avatar) => avatar.category === category
      )
    }

    // 依標籤篩選
    if (tag) {
      filteredAvatars = filteredAvatars.filter((avatar) =>
        avatar.tags.includes(tag)
      )
    }

    return NextResponse.json({
      avatars: filteredAvatars,
      total: filteredAvatars.length,
      categories: ['male', 'female', 'neutral'],
      allTags: Array.from(
        new Set(AVAILABLE_AVATARS.flatMap((a) => a.tags))
      ),
    })
  } catch (error) {
    console.error('[Get Avatars Error]', error)
    return NextResponse.json({ error: '伺服器錯誤' }, { status: 500 })
  }
}
