/**
 * Knowledge Base Status API
 * @description 檢查知識庫載入狀態和統計資訊
 */

import { NextRequest, NextResponse } from 'next/server'
import { getKnowledgeLoader } from '@/lib/ai/knowledge-loader'

export const runtime = 'nodejs'

export async function GET(request: NextRequest) {
  try {
    console.log('📊 Knowledge base status check requested')

    // 取得知識庫載入器
    const loader = await getKnowledgeLoader()

    // 取得統計資訊
    const stats = loader.getStats()

    // 取得 persona 預覽
    const persona = loader.getPersona()
    const personaPreview = persona.substring(0, 300) + '...'

    // 測試搜尋功能
    const searchTest = loader.searchKnowledge('數據', 2)

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      stats: {
        ...stats,
        personaPreview,
      },
      searchTest: {
        query: '數據',
        resultsCount: searchTest.length,
        results: searchTest.map((doc) => ({
          file: doc.file,
          relevance: doc.relevance,
          contentPreview: doc.content.substring(0, 100) + '...',
        })),
      },
    })
  } catch (error) {
    console.error('❌ Knowledge base status check failed:', error)

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    )
  }
}
