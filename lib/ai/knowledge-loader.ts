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
   * 預設載入繁體中文版本
   * @private
   */
  private async cachePersona() {
    // 新路徑：agent-brain/agents/cdo-advisor/persona.md
    const personaPath = path.join(this.knowledgeBasePath, 'agents', 'cdo-advisor', 'persona.md')

    try {
      this.personaCache = await fs.readFile(personaPath, 'utf-8')
      console.log(`✅ Persona cached (${this.personaCache.length} characters)`)
    } catch (error) {
      console.warn('⚠️ persona.md not found, using default persona')
      this.personaCache = this.getDefaultPersona()
    }
  }

  /**
   * 根據語言載入對應的 Persona（支援多語言）
   * @param {string} language - 語言代碼（zh-TW, en, ja）
   * @returns {Promise<string>} Persona 內容
   */
  async getPersonaByLanguage(language: string = 'zh-TW'): Promise<string> {
    // 語言到檔案名稱的映射
    const languageFileMap: Record<string, string> = {
      'zh-TW': 'persona.md',
      'en': 'persona_en.md',
      'ja': 'persona_ja.md',
    }

    const filename = languageFileMap[language] || 'persona.md'
    // 新路徑：agent-brain/agents/cdo-advisor/persona.md
    const personaPath = path.join(this.knowledgeBasePath, 'agents', 'cdo-advisor', filename)

    try {
      const content = await fs.readFile(personaPath, 'utf-8')
      console.log(`✅ Loaded persona for language ${language} (${content.length} characters)`)
      return content
    } catch (error) {
      console.warn(`⚠️ ${filename} not found, falling back to default persona`)

      // 如果找不到特定語言的 persona，使用快取的預設版本（繁體中文）
      if (this.personaCache) {
        return this.personaCache
      }

      // 最後降級：使用內建預設 persona
      return this.getDefaultPersona()
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
          } else if (entry.name.endsWith('.md') &&
                     !entry.name.startsWith('persona') &&
                     !['README.md', 'KNOWLEDGE_BASE_GUIDE.md', 'MAINTENANCE_GUIDE.md', 'TECHNICAL_FLOW.md'].includes(entry.name)) {
            // 讀取 .md 檔案內容並建立索引
            // 排除 persona 檔案（已經快取）和系統文件
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
   * 搜尋相關知識（簡單關鍵字匹配版本，支援多語言）
   * @param {string} query - 使用者查詢字串
   * @param {number} maxResults - 最多返回幾個結果（預設 3）
   * @param {string} language - 搜尋語言（zh-TW, en, ja）
   * @returns {KnowledgeDocument[]} 相關知識文件陣列
   *
   * @example
   * ```typescript
   * const results = loader.searchKnowledge("MAU 怎麼算", 3, "zh-TW")
   * // 返回: [
   * //   { file: "cdo_faq.md", content: "...", relevance: 5 },
   * //   { file: "kpi_dictionary.md", content: "...", relevance: 3 }
   * // ]
   * ```
   */
  searchKnowledge(query: string, maxResults: number = 3, language: string = 'zh-TW'): KnowledgeDocument[] {
    if (this.fileIndex.size === 0) {
      console.warn('⚠️ Knowledge base is empty, no search results')
      return []
    }

    const results: KnowledgeDocument[] = []
    const queryLower = query.toLowerCase()

    // 遍歷所有檔案，只搜尋對應語言的檔案
    for (const [file, content] of this.fileIndex.entries()) {
      // 語言過濾邏輯：
      // 1. 繁體中文 (zh-TW): 搜尋沒有 _en 或 _ja 後綴的檔案
      // 2. 英文 (en): 搜尋包含 _en 後綴的檔案
      // 3. 日文 (ja): 搜尋包含 _ja 後綴的檔案
      const isTargetLanguage =
        (language === 'zh-TW' && !file.includes('_en.md') && !file.includes('_ja.md')) ||
        (language === 'en' && file.includes('_en.md')) ||
        (language === 'ja' && file.includes('_ja.md'))

      if (!isTargetLanguage) {
        continue
      }

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
      `🔍 Search for "${query}" (language: ${language}): found ${topResults.length} relevant documents`
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
 * 語言對應的對話指令
 */
const LANGUAGE_INSTRUCTIONS = {
  'zh-TW': {
    knowledge: '📚 相關知識庫內容',
    source: '來源',
    instructions: '🎯 對話指令',
    mainInstruction: '請根據以上人格定義 (persona) 和知識庫內容，以專業的身份回答使用者問題。',
    notes: '注意事項：',
    note1: '嚴格遵循 persona 定義的語氣和溝通風格',
    note2: '優先引用知識庫中的具體內容（如果相關）',
    note3: '如果知識庫沒有相關資訊，基於你的專業知識回答，但要明確說明',
    note4: '保持簡潔、直接、數據驅動的風格',
    note5: '回答長度控制在 2-3 句話，約 50-100 字',
    note6: '**重要：請使用繁體中文回答**',
  },
  'en': {
    knowledge: '📚 Relevant Knowledge Base',
    source: 'Source',
    instructions: '🎯 Conversation Instructions',
    mainInstruction: 'Based on the persona definition and knowledge base above, answer user questions professionally.',
    notes: 'Guidelines:',
    note1: 'Strictly follow the tone and communication style defined in the persona',
    note2: 'Prioritize referencing specific content from the knowledge base (if relevant)',
    note3: 'If the knowledge base lacks relevant information, answer based on your expertise but clarify this',
    note4: 'Maintain a concise, direct, data-driven style',
    note5: 'Keep responses to 2-3 sentences, approximately 50-100 words',
    note6: '**Important: Please respond in English**',
  },
  'ja': {
    knowledge: '📚 関連知識ベース',
    source: '出典',
    instructions: '🎯 会話指示',
    mainInstruction: '上記のペルソナ定義とナレッジベースに基づいて、専門的にユーザーの質問に答えてください。',
    notes: 'ガイドライン：',
    note1: 'ペルソナで定義されたトーンとコミュニケーションスタイルを厳守する',
    note2: 'ナレッジベースの具体的な内容を優先的に参照する（関連する場合）',
    note3: 'ナレッジベースに関連情報がない場合は、専門知識に基づいて回答するが、その旨を明記する',
    note4: '簡潔で直接的、データドリブンなスタイルを維持する',
    note5: '回答は2〜3文、約50〜100文字に抑える',
    note6: '**重要：日本語で回答してください**',
  },
} as const

/**
 * 建立完整的 System Prompt（支援多語言）
 * 組合 persona + 相關知識文件
 *
 * @param {string} persona - CDO 人格定義
 * @param {KnowledgeDocument[]} knowledge - 相關知識文件
 * @param {string} language - 回應語言（zh-TW, en, ja）
 * @returns {string} 完整的 System Prompt
 */
export function buildSystemPrompt(
  persona: string,
  knowledge: KnowledgeDocument[],
  language: string = 'zh-TW'
): string {
  // 取得語言對應的指令（預設使用繁體中文）
  const lang = (language in LANGUAGE_INSTRUCTIONS ? language : 'zh-TW') as keyof typeof LANGUAGE_INSTRUCTIONS
  const instructions = LANGUAGE_INSTRUCTIONS[lang]

  let prompt = `${persona}\n\n`

  if (knowledge.length > 0) {
    prompt += `# ${instructions.knowledge}\n\n`

    for (const doc of knowledge) {
      prompt += `## ${instructions.source}: ${doc.file}\n`
      prompt += `${doc.content}\n\n`
      prompt += `---\n\n`
    }
  }

  prompt += `# ${instructions.instructions}\n`
  prompt += `${instructions.mainInstruction}\n`
  prompt += `\n`
  prompt += `${instructions.notes}\n`
  prompt += `1. ${instructions.note1}\n`
  prompt += `2. ${instructions.note2}\n`
  prompt += `3. ${instructions.note3}\n`
  prompt += `4. ${instructions.note4}\n`
  prompt += `5. ${instructions.note5}\n`
  prompt += `6. ${instructions.note6}\n`

  return prompt
}
