/**
 * Knowledge Loader - AI Agent 知識庫載入器
 * @module lib/ai/knowledge-loader
 * @description 載入 agent-brain/ 資料夾中的 Markdown 知識庫檔案，
 *              用於動態注入 AI 上下文（persona、FAQ、KPI 定義等）
 */

import fs from 'fs/promises'
import path from 'path'

/**
 * 知識文件介面
 */
export interface KnowledgeDocument {
  /** 檔案相對路徑 */
  file: string
  /** 檔案內容 */
  content: string
  /** 相關性分數（搜尋時使用） */
  relevance?: number
}

/**
 * 知識庫載入器
 * 單例模式，應用啟動時初始化一次
 */
export class KnowledgeLoader {
  private knowledgeBasePath: string
  private personaCache: string | null = null
  private fileIndex: Map<string, string> = new Map()
  private isInitialized: boolean = false

  constructor() {
    // agent-brain 資料夾的絕對路徑
    this.knowledgeBasePath = path.join(process.cwd(), 'agent-brain')
    console.log('📂 Knowledge base path:', this.knowledgeBasePath)
  }

  /**
   * 系統初始化：建立檔案索引
   * @returns {Promise<{success: boolean, filesCount?: number, error?: string}>}
   */
  async initialize() {
    if (this.isInitialized) {
      console.log('✅ Knowledge base already initialized')
      return { success: true, filesCount: this.fileIndex.size }
    }

    console.log('🚀 Initializing knowledge base...')

    try {
      // 1. 檢查 agent-brain 資料夾是否存在
      await fs.access(this.knowledgeBasePath)
      console.log('✅ Knowledge base folder found')

      // 2. 快取 persona.md（這個檔案每次對話都需要）
      await this.cachePersona()

      // 3. 建立所有 .md 檔案的索引
      await this.buildFileIndex()

      this.isInitialized = true
      console.log(
        `✅ Knowledge base initialized: ${this.fileIndex.size} files indexed`
      )

      return { success: true, filesCount: this.fileIndex.size }
    } catch (error) {
      console.error('❌ Knowledge base initialization failed:', error)

      // 降級模式：沒有知識庫也能運作（但功能受限）
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }
    }
  }

  /**
   * 快取 persona.md 內容（最常用的檔案）
   * @private
   */
  private async cachePersona() {
    const personaPath = path.join(this.knowledgeBasePath, 'persona.md')

    try {
      this.personaCache = await fs.readFile(personaPath, 'utf-8')
      console.log(`✅ Persona cached (${this.personaCache.length} characters)`)
    } catch (error) {
      console.warn('⚠️ persona.md not found, using default persona')
      this.personaCache = this.getDefaultPersona()
    }
  }

  /**
   * 預設 Persona（當 persona.md 不存在時使用）
   * @private
   */
  private getDefaultPersona(): string {
    return `你是一位專業、友善的 AI 虛擬助手。
你的回答應該：
1. 簡潔明瞭，每次回答 2-3 句話
2. 使用繁體中文
3. 語氣友善、自然，像真人對話
4. 數據驅動，基於事實而非臆測

請記住：你正在透過 3D Avatar 與使用者對話，保持對話的自然流暢性。`
  }

  /**
   * 遞迴掃描所有 .md 檔案並建立索引
   * @private
   */
  private async buildFileIndex() {
    const scanDirectory = async (dirPath: string) => {
      try {
        const entries = await fs.readdir(dirPath, { withFileTypes: true })

        for (const entry of entries) {
          const fullPath = path.join(dirPath, entry.name)

          if (entry.isDirectory()) {
            // 遞迴掃描子目錄
            await scanDirectory(fullPath)
          } else if (entry.name.endsWith('.md') && entry.name !== 'persona.md') {
            // 讀取 .md 檔案內容並建立索引（persona.md 已經快取，跳過）
            try {
              const content = await fs.readFile(fullPath, 'utf-8')
              const relativePath = path.relative(this.knowledgeBasePath, fullPath)

              this.fileIndex.set(relativePath, content)
              console.log(`  📄 Indexed: ${relativePath}`)
            } catch (error) {
              console.warn(`  ⚠️ Failed to read: ${entry.name}`)
            }
          }
        }
      } catch (error) {
        console.warn(`⚠️ Failed to scan directory: ${dirPath}`)
      }
    }

    await scanDirectory(this.knowledgeBasePath)
  }

  /**
   * 取得 Persona（從快取）
   * @returns {string} CDO 人格定義
   */
  getPersona(): string {
    if (!this.personaCache) {
      console.warn('⚠️ Persona not loaded, using default')
      return this.getDefaultPersona()
    }
    return this.personaCache
  }

  /**
   * 搜尋相關知識（簡單關鍵字匹配版本）
   * @param {string} query - 使用者查詢字串
   * @param {number} maxResults - 最多返回幾個結果（預設 3）
   * @returns {KnowledgeDocument[]} 相關知識文件陣列
   *
   * @example
   * ```typescript
   * const results = loader.searchKnowledge("MAU 怎麼算", 3)
   * // 返回: [
   * //   { file: "cdo_faq.md", content: "...", relevance: 5 },
   * //   { file: "kpi_dictionary.md", content: "...", relevance: 3 }
   * // ]
   * ```
   */
  searchKnowledge(query: string, maxResults: number = 3): KnowledgeDocument[] {
    if (this.fileIndex.size === 0) {
      console.warn('⚠️ Knowledge base is empty, no search results')
      return []
    }

    const results: KnowledgeDocument[] = []
    const queryLower = query.toLowerCase()

    // 遍歷所有檔案，計算相關性
    for (const [file, content] of this.fileIndex.entries()) {
      const contentLower = content.toLowerCase()

      // 簡單的關鍵字匹配計分
      const matches = (contentLower.match(new RegExp(queryLower, 'g')) || [])
        .length

      if (matches > 0) {
        results.push({
          file,
          content,
          relevance: matches,
        })
      }
    }

    // 按相關性排序並返回 Top N
    const topResults = results
      .sort((a, b) => (b.relevance || 0) - (a.relevance || 0))
      .slice(0, maxResults)

    console.log(
      `🔍 Search for "${query}": found ${topResults.length} relevant documents`
    )

    return topResults
  }

  /**
   * 取得所有知識庫統計資訊
   * @returns {object} 統計資訊
   */
  getStats() {
    return {
      isInitialized: this.isInitialized,
      personaCached: !!this.personaCache,
      personaSize: this.personaCache?.length || 0,
      filesIndexed: this.fileIndex.size,
      files: Array.from(this.fileIndex.keys()),
    }
  }

  /**
   * 熱重載知識庫（開發模式用）
   * 重新掃描檔案並更新索引
   */
  async reload() {
    console.log('🔄 Reloading knowledge base...')
    this.fileIndex.clear()
    this.personaCache = null
    this.isInitialized = false
    return await this.initialize()
  }
}

// 全域單例（在應用啟動時初始化一次）
let knowledgeLoaderInstance: KnowledgeLoader | null = null

/**
 * 取得 Knowledge Loader 單例
 * @returns {Promise<KnowledgeLoader>} Knowledge Loader 實例
 */
export async function getKnowledgeLoader(): Promise<KnowledgeLoader> {
  if (!knowledgeLoaderInstance) {
    knowledgeLoaderInstance = new KnowledgeLoader()
    await knowledgeLoaderInstance.initialize()
  }
  return knowledgeLoaderInstance
}

/**
 * 建立完整的 System Prompt
 * 組合 persona + 相關知識文件
 *
 * @param {string} persona - CDO 人格定義
 * @param {KnowledgeDocument[]} knowledge - 相關知識文件
 * @returns {string} 完整的 System Prompt
 */
export function buildSystemPrompt(
  persona: string,
  knowledge: KnowledgeDocument[]
): string {
  let prompt = `${persona}\n\n`

  if (knowledge.length > 0) {
    prompt += `# 📚 相關知識庫內容\n\n`

    for (const doc of knowledge) {
      prompt += `## 來源: ${doc.file}\n`
      prompt += `${doc.content}\n\n`
      prompt += `---\n\n`
    }
  }

  prompt += `# 🎯 對話指令\n`
  prompt += `請根據以上人格定義 (persona) 和知識庫內容，以專業的身份回答使用者問題。\n`
  prompt += `\n`
  prompt += `注意事項：\n`
  prompt += `1. 嚴格遵循 persona 定義的語氣和溝通風格\n`
  prompt += `2. 優先引用知識庫中的具體內容（如果相關）\n`
  prompt += `3. 如果知識庫沒有相關資訊，基於你的專業知識回答，但要明確說明\n`
  prompt += `4. 保持簡潔、直接、數據驅動的風格\n`
  prompt += `5. 回答長度控制在 2-3 句話，約 50-100 字\n`

  return prompt
}
