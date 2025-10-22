/**
 * Agent Knowledge Loader
 * @description 載入並管理 Agent 專屬知識庫的工具類別
 * @created 2025-10-22
 */

import { PrismaClient } from '@/lib/generated/prisma'
import type {
  KnowledgeItem,
  LoadedKnowledge,
  KnowledgeSearchResult,
} from '@/types/knowledge'

/**
 * Agent 知識庫載入器
 */
export class AgentKnowledgeLoader {
  private prisma: PrismaClient

  constructor() {
    this.prisma = new PrismaClient()
  }

  /**
   * 根據 Agent ID 載入所有關聯的知識庫
   * @param agentId Agent ID
   * @returns 載入的知識庫內容
   */
  async loadAgentKnowledge(agentId: string): Promise<LoadedKnowledge | null> {
    try {
      // 查詢 Agent 及其關聯的知識庫
      const agent = await this.prisma.aIAgent.findUnique({
        where: {
          id: agentId,
          isActive: true,
        },
        include: {
          persona: true,
          knowledgeBases: {
            include: {
              knowledgeBase: true,
            },
            where: {
              knowledgeBase: {
                isActive: true,
              },
            },
            orderBy: {
              priority: 'asc', // 依優先級排序
            },
          },
        },
      })

      if (!agent) {
        console.warn(`[AgentKnowledgeLoader] Agent not found: ${agentId}`)
        return null
      }

      // 轉換知識庫資料
      const knowledgeItems: KnowledgeItem[] = agent.knowledgeBases.map((link) => ({
        id: link.knowledgeBase.id,
        name: link.knowledgeBase.name,
        type: link.knowledgeBase.type,
        category: link.knowledgeBase.category,
        content: link.knowledgeBase.content,
        priority: link.priority,
        isRequired: link.isRequired,
      }))

      console.log(
        `[AgentKnowledgeLoader] 載入 ${agent.name} 的知識庫: ${knowledgeItems.length} 個項目`
      )

      return {
        agentId: agent.id,
        agentName: agent.name,
        knowledgeItems,
        totalItems: knowledgeItems.length,
        systemPrompt: agent.persona?.systemPrompt,
      }
    } catch (error) {
      console.error('[AgentKnowledgeLoader] 載入知識庫失敗:', error)
      throw error
    }
  }

  /**
   * 建構增強的 System Prompt (包含知識庫內容)
   * @param agentId Agent ID
   * @returns 增強的 System Prompt
   */
  async buildEnhancedSystemPrompt(agentId: string): Promise<string | null> {
    const knowledge = await this.loadAgentKnowledge(agentId)

    if (!knowledge) {
      return null
    }

    // 基礎 System Prompt
    const basePrompt = knowledge.systemPrompt || '你是一個專業的 AI 助理。'

    // 如果沒有額外知識庫，直接返回基礎 Prompt
    if (knowledge.knowledgeItems.length === 0) {
      return basePrompt
    }

    // 組裝知識庫內容
    const knowledgeSections = knowledge.knowledgeItems.map((item) => {
      return `
## ${item.name} (${item.type})

${item.content}
`
    })

    // 組合完整的 System Prompt
    const enhancedPrompt = `${basePrompt}

═══════════════════════════════════════════════════════════
📚 你可以參考以下知識庫資訊來回答問題：
═══════════════════════════════════════════════════════════

${knowledgeSections.join('\n---\n')}

═══════════════════════════════════════════════════════════
⚠️ 注意事項：
- 優先使用知識庫中的資訊來回答問題
- 如果知識庫中沒有相關資訊，則使用你的通用知識
- 保持回答的準確性和一致性
═══════════════════════════════════════════════════════════
`

    return enhancedPrompt
  }

  /**
   * 搜尋知識庫內容
   * @param agentId Agent ID
   * @param query 搜尋關鍵字
   * @returns 匹配的知識庫項目
   */
  async searchKnowledge(agentId: string, query: string): Promise<KnowledgeItem[]> {
    const knowledge = await this.loadAgentKnowledge(agentId)

    if (!knowledge) {
      return []
    }

    // 簡單的關鍵字搜尋 (可以後續優化為向量搜尋)
    const lowerQuery = query.toLowerCase()
    const matchedItems = knowledge.knowledgeItems.filter(
      (item) =>
        item.name.toLowerCase().includes(lowerQuery) ||
        item.content.toLowerCase().includes(lowerQuery)
    )

    console.log(
      `[AgentKnowledgeLoader] 搜尋 "${query}" 在 ${knowledge.agentName} 的知識庫: 找到 ${matchedItems.length} 個結果`
    )

    return matchedItems
  }

  /**
   * 取得特定類型的知識庫
   * @param agentId Agent ID
   * @param type 知識庫類型 (faq, kpi, decision, meeting, pov, persona, company)
   * @returns 匹配的知識庫項目
   */
  async getKnowledgeByType(agentId: string, type: string): Promise<KnowledgeItem[]> {
    const knowledge = await this.loadAgentKnowledge(agentId)

    if (!knowledge) {
      return []
    }

    return knowledge.knowledgeItems.filter((item) => item.type === type)
  }

  /**
   * 取得必要的知識庫 (isRequired = true)
   * @param agentId Agent ID
   * @returns 必要的知識庫項目
   */
  async getRequiredKnowledge(agentId: string): Promise<KnowledgeItem[]> {
    const knowledge = await this.loadAgentKnowledge(agentId)

    if (!knowledge) {
      return []
    }

    return knowledge.knowledgeItems.filter((item) => item.isRequired)
  }

  /**
   * 清理資源
   */
  async disconnect() {
    await this.prisma.$disconnect()
  }
}

/**
 * 單例模式的知識庫載入器
 */
let loaderInstance: AgentKnowledgeLoader | null = null

export function getKnowledgeLoader(): AgentKnowledgeLoader {
  if (!loaderInstance) {
    loaderInstance = new AgentKnowledgeLoader()
  }
  return loaderInstance
}
