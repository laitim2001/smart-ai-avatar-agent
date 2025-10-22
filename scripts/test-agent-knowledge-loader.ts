/**
 * Agent Knowledge Loader 測試腳本
 * @description 測試資料庫驅動的 AgentKnowledgeLoader 所有功能
 * @usage npx tsx scripts/test-agent-knowledge-loader.ts
 * @created 2025-10-22
 */

import { getKnowledgeLoader } from '../lib/knowledge/loader'

async function main() {
  console.log('🧪 開始測試 AgentKnowledgeLoader...')

  try {
    const loader = getKnowledgeLoader()

    console.log('📋 測試 1: 載入 CDO Agent 知識庫...')
    const cdoKnowledge = await loader.loadAgentKnowledge('system-cdo-advisor')

    if (!cdoKnowledge) {
      console.error('❌ 測試 1 失敗：無法載入 CDO Agent 知識庫')
      process.exit(1)
    }

    console.log()
    console.log()
    console.log()
    console.log()
    console.log()

    console.log('═══════════════════════════════════════════════════════════')
    console.log('🎉 測試完成！')
  } catch (error) {
    console.error('❌ 測試失敗:', error)
    throw error
  }
}

main()
  .catch((error) => {
    console.error('❌ 執行錯誤:', error)
    process.exit(1)
  })
  .finally(async () => {
    const loader = getKnowledgeLoader()
    await loader.disconnect()
  })
