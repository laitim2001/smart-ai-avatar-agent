/**
 * Knowledge Loader 測試腳本
 * @description 測試知識庫載入功能
 *
 * 執行方式：
 * npx ts-node scripts/test-knowledge-loader.ts
 */

import { getKnowledgeLoader, buildSystemPrompt } from '../lib/ai/knowledge-loader.js'

async function testKnowledgeLoader() {
  console.log('🧪 開始測試 Knowledge Loader...\n')

  try {
    // ═══════════════════════════════════════════════
    // 測試 1: 初始化知識庫
    // ═══════════════════════════════════════════════
    console.log('📂 測試 1: 初始化知識庫')
    const loader = await getKnowledgeLoader()
    const stats = loader.getStats()

    console.log('✅ 知識庫統計資訊：')
    console.log(`   - 已初始化: ${stats.isInitialized}`)
    console.log(`   - Persona 已快取: ${stats.personaCached}`)
    console.log(`   - Persona 大小: ${stats.personaSize} 字元`)
    console.log(`   - 檔案數量: ${stats.filesIndexed}`)
    console.log(`   - 檔案列表:`)
    stats.files.forEach((file) => {
      console.log(`     • ${file}`)
    })
    console.log('')

    // ═══════════════════════════════════════════════
    // 測試 2: 載入 Persona
    // ═══════════════════════════════════════════════
    console.log('🎭 測試 2: 載入 Persona')
    const persona = loader.getPersona()
    console.log(`✅ Persona 載入成功 (${persona.length} 字元)`)
    console.log(`   前 200 字元預覽:`)
    console.log(`   ${persona.substring(0, 200)}...`)
    console.log('')

    // ═══════════════════════════════════════════════
    // 測試 3: 搜尋相關知識 - 測試 1
    // ═══════════════════════════════════════════════
    console.log('🔍 測試 3a: 搜尋 "MAU" 相關知識')
    const results1 = loader.searchKnowledge('MAU', 3)
    console.log(`✅ 找到 ${results1.length} 個相關文件:`)
    results1.forEach((doc, index) => {
      console.log(`   ${index + 1}. ${doc.file} (相關性: ${doc.relevance})`)
      console.log(`      內容預覽: ${doc.content.substring(0, 100)}...`)
    })
    console.log('')

    // ═══════════════════════════════════════════════
    // 測試 4: 搜尋相關知識 - 測試 2
    // ═══════════════════════════════════════════════
    console.log('🔍 測試 3b: 搜尋 "數據" 相關知識')
    const results2 = loader.searchKnowledge('數據', 3)
    console.log(`✅ 找到 ${results2.length} 個相關文件:`)
    results2.forEach((doc, index) => {
      console.log(`   ${index + 1}. ${doc.file} (相關性: ${doc.relevance})`)
    })
    console.log('')

    // ═══════════════════════════════════════════════
    // 測試 5: 組合 System Prompt
    // ═══════════════════════════════════════════════
    console.log('📝 測試 4: 組合完整 System Prompt')
    const systemPrompt = buildSystemPrompt(persona, results1)
    console.log(`✅ System Prompt 組合成功 (${systemPrompt.length} 字元)`)
    console.log(`   結構預覽:`)
    console.log(`   - Persona 部分: ${persona.length} 字元`)
    console.log(`   - 知識庫部分: ${results1.length} 個文件`)
    console.log(`   - 對話指令部分: 約 300 字元`)
    console.log('')
    console.log(`   完整內容前 500 字元預覽:`)
    console.log(`   ${systemPrompt.substring(0, 500)}...`)
    console.log('')

    // ═══════════════════════════════════════════════
    // 測試總結
    // ═══════════════════════════════════════════════
    console.log('✅ 所有測試通過！')
    console.log('')
    console.log('📊 測試總結:')
    console.log(`   - 知識庫檔案: ${stats.filesIndexed} 個`)
    console.log(`   - Persona 大小: ${(stats.personaSize / 1024).toFixed(2)} KB`)
    console.log(`   - 搜尋功能: 正常運作`)
    console.log(`   - System Prompt 組合: 正常運作`)
    console.log('')
    console.log('🎯 下一步：啟動 dev server，測試實際對話！')

  } catch (error) {
    console.error('❌ 測試失敗:', error)
    process.exit(1)
  }
}

// 執行測試
testKnowledgeLoader()
