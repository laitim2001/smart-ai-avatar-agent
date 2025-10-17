/**
 * Prisma Seed Script
 * Sprint 5: Avatar Gallery 種子資料
 *
 * 執行方式：
 * npx prisma db seed
 *
 * 或在 package.json 中添加：
 * "prisma": {
 *   "seed": "ts-node --compiler-options {\"module\":\"CommonJS\"} prisma/seed.ts"
 * }
 */

import { PrismaClient } from '../lib/generated/prisma'
import { AVATARS_METADATA } from '../lib/avatar/constants'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 開始種子資料植入...')

  // 清除現有的 Avatar 資料（開發環境）
  if (process.env.NODE_ENV === 'development') {
    console.log('🧹 清除現有 Avatar 資料...')
    await prisma.avatar.deleteMany()
  }

  // 植入 Avatar 資料
  console.log('📝 植入 Avatar 資料...')

  for (const avatar of AVATARS_METADATA) {
    await prisma.avatar.create({
      data: {
        id: avatar.id,
        name: `${avatar.name} (${avatar.nameEn})`,
        description: `${avatar.description}\n${avatar.descriptionEn}`,
        url: avatar.url,
        thumbnail: avatar.thumbnail,
        category: avatar.category,
        tags: avatar.tags,
        featured: avatar.featured,
        popularity: avatar.popularity,
      },
    })
    console.log(`  ✅ ${avatar.name} (${avatar.nameEn}) - ${avatar.category}`)
  }

  console.log('✅ 種子資料植入完成！')
  console.log(`📊 總計: ${AVATARS_METADATA.length} 個 Avatar`)
  console.log(`   - Female: ${AVATARS_METADATA.filter(a => a.category === 'female').length}`)
  console.log(`   - Male: ${AVATARS_METADATA.filter(a => a.category === 'male').length}`)
  console.log(`   - Neutral: ${AVATARS_METADATA.filter(a => a.category === 'neutral').length}`)
  console.log(`   - Featured: ${AVATARS_METADATA.filter(a => a.featured).length}`)
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error('❌ 種子資料植入失敗:', e)
    await prisma.$disconnect()
    process.exit(1)
  })
