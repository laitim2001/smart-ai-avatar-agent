/**
 * 同步 Avatar 數據到資料庫
 * 從 lib/avatar/constants.ts 讀取 AVATARS_METADATA 並更新資料庫
 */

import { PrismaClient } from '../lib/generated/prisma'
import { AVATARS_METADATA } from '../lib/avatar/constants'

const prisma = new PrismaClient()

async function syncAvatars() {
  console.log('🔄 開始同步 Avatar 數據到資料庫...\n')

  try {
    // 先刪除所有現有的 Avatar 數據
    const deleteResult = await prisma.avatar.deleteMany({})
    console.log(`✅ 已刪除 ${deleteResult.count} 個舊的 Avatar 記錄\n`)

    // 插入新的 Avatar 數據
    let successCount = 0
    let errorCount = 0

    for (const avatar of AVATARS_METADATA) {
      try {
        await prisma.avatar.create({
          data: {
            id: avatar.id,
            name: avatar.name,
            description: avatar.description,
            url: avatar.url,
            thumbnail: avatar.thumbnail,
            category: avatar.category,
            tags: avatar.tags,
            featured: avatar.featured,
            popularity: avatar.popularity,
          },
        })
        console.log(`✅ [${successCount + 1}/${AVATARS_METADATA.length}] ${avatar.name} (${avatar.nameEn})`)
        console.log(`   URL: ${avatar.url}`)
        successCount++
      } catch (error) {
        console.error(`❌ 插入失敗: ${avatar.name}`, error)
        errorCount++
      }
    }

    console.log(`\n📊 同步完成統計:`)
    console.log(`   ✅ 成功: ${successCount} 個`)
    console.log(`   ❌ 失敗: ${errorCount} 個`)
    console.log(`   📈 總計: ${AVATARS_METADATA.length} 個\n`)

    // 驗證數據
    const allAvatars = await prisma.avatar.findMany()
    console.log(`🔍 資料庫驗證:`)
    console.log(`   📦 Avatar 總數: ${allAvatars.length}`)
    console.log(`   🏆 Featured: ${allAvatars.filter((a) => a.featured).length}`)
    console.log(`   👨 男性: ${allAvatars.filter((a) => a.category === 'male').length}`)
    console.log(`   👩 女性: ${allAvatars.filter((a) => a.category === 'female').length}`)
    console.log(`   🧑 中性: ${allAvatars.filter((a) => a.category === 'neutral').length}\n`)

    console.log('✅ Avatar 數據同步完成！')
  } catch (error) {
    console.error('❌ 同步過程發生錯誤:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

syncAvatars()
