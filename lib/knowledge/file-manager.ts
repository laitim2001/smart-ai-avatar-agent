/**
 * 知識庫檔案管理模組
 * @description 處理所有檔案系統操作（讀取、寫入、刪除、列表）
 */

import fs from 'fs'
import path from 'path'
import type {
  FileMetadata,
  KnowledgeFileType,
  FAQItem,
  KPIItem,
  DecisionLogItem,
  MeetingSummaryItem,
  POVBriefingItem,
} from '@/types/knowledge'

// 知識庫根目錄
const KNOWLEDGE_BASE_PATH = path.join(process.cwd(), 'agent-brain', 'agents', 'cdo-advisor')

// 歸檔目錄
const ARCHIVE_PATH = path.join(process.cwd(), 'agent-brain', 'archive')

/**
 * 確保目錄存在
 */
function ensureDirectoryExists(dirPath: string): void {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true })
  }
}

/**
 * 計算文字字數（中文按字數，英文按單字數）
 */
function countWords(text: string): number {
  // 中文字符
  const chineseChars = text.match(/[\u4e00-\u9fa5]/g) || []
  // 英文單字
  const englishWords = text.match(/[a-zA-Z]+/g) || []

  return chineseChars.length + englishWords.length
}

/**
 * 獲取檔案元數據
 */
export function getFileMetadata(filename: string): FileMetadata {
  const filepath = path.join(KNOWLEDGE_BASE_PATH, filename)

  if (!fs.existsSync(filepath)) {
    throw new Error(`File not found: ${filename}`)
  }

  const stats = fs.statSync(filepath)
  const content = fs.readFileSync(filepath, 'utf-8')

  // 判斷檔案類型
  let type: KnowledgeFileType = 'meeting' // 預設

  if (filename === 'persona.md') type = 'persona'
  else if (filename === 'cdo_faq.md') type = 'faq'
  else if (filename === 'kpi_dictionary.md') type = 'kpi'
  else if (filename.startsWith('decision_log_')) type = 'decision'
  else if (filename.startsWith('pov_briefing_')) type = 'pov'
  else if (filename.startsWith('meeting_summary_')) type = 'meeting'

  return {
    filename,
    type,
    size: stats.size,
    lastModified: stats.mtime.toISOString(),
    wordCount: countWords(content),
    createdAt: stats.birthtime.toISOString(),
  }
}

/**
 * 列出所有知識庫檔案
 */
export function listKnowledgeFiles(): FileMetadata[] {
  if (!fs.existsSync(KNOWLEDGE_BASE_PATH)) {
    throw new Error('Knowledge base directory not found')
  }

  const files = fs
    .readdirSync(KNOWLEDGE_BASE_PATH)
    .filter((file) => file.endsWith('.md'))
    .filter(
      (file) =>
        ![
          'README.md',
          'KNOWLEDGE_BASE_GUIDE.md',
          'TECHNICAL_FLOW.md',
          'MAINTENANCE_GUIDE.md',
        ].includes(file)
    ) // 排除文件檔案

  return files.map((file) => getFileMetadata(file))
}

/**
 * 按類型列出檔案
 */
export function listFilesByType(type: KnowledgeFileType): FileMetadata[] {
  const allFiles = listKnowledgeFiles()
  return allFiles.filter((file) => file.type === type)
}

/**
 * 讀取檔案內容
 */
export function readKnowledgeFile(filename: string): string {
  const filepath = path.join(KNOWLEDGE_BASE_PATH, filename)

  if (!fs.existsSync(filepath)) {
    throw new Error(`File not found: ${filename}`)
  }

  return fs.readFileSync(filepath, 'utf-8')
}

/**
 * 寫入檔案內容
 */
export function writeKnowledgeFile(
  filename: string,
  content: string
): FileMetadata {
  const filepath = path.join(KNOWLEDGE_BASE_PATH, filename)

  // 確保目錄存在
  ensureDirectoryExists(KNOWLEDGE_BASE_PATH)

  // 寫入檔案
  fs.writeFileSync(filepath, content, 'utf-8')

  console.log(`[FileManager] ✅ 檔案已儲存: ${filename}`)

  return getFileMetadata(filename)
}

/**
 * 刪除檔案
 */
export function deleteKnowledgeFile(filename: string): void {
  const filepath = path.join(KNOWLEDGE_BASE_PATH, filename)

  if (!fs.existsSync(filepath)) {
    throw new Error(`File not found: ${filename}`)
  }

  fs.unlinkSync(filepath)
  console.log(`[FileManager] 🗑️  檔案已刪除: ${filename}`)
}

/**
 * 歸檔檔案（移動到 archive 目錄）
 */
export function archiveKnowledgeFile(
  filename: string,
  archiveSubPath?: string
): void {
  const sourcePath = path.join(KNOWLEDGE_BASE_PATH, filename)
  const archiveDir = archiveSubPath
    ? path.join(ARCHIVE_PATH, archiveSubPath)
    : ARCHIVE_PATH

  ensureDirectoryExists(archiveDir)

  const destPath = path.join(archiveDir, filename)

  if (!fs.existsSync(sourcePath)) {
    throw new Error(`File not found: ${filename}`)
  }

  // 移動檔案
  fs.renameSync(sourcePath, destPath)
  console.log(`[FileManager] 📁 檔案已歸檔: ${filename} → ${archiveSubPath}`)
}

/**
 * 批次歸檔檔案
 */
export function archiveMultipleFiles(
  filenames: string[],
  archiveSubPath: string
): void {
  filenames.forEach((filename) => {
    try {
      archiveKnowledgeFile(filename, archiveSubPath)
    } catch (error) {
      console.error(`[FileManager] ❌ 歸檔失敗: ${filename}`, error)
    }
  })
}

/**
 * 生成新的檔案名稱
 * @param type 檔案類型
 * @param identifier 識別符（例如專案名稱、會議主題）
 * @returns 檔案名稱（不含路徑）
 */
export function generateFilename(
  type: KnowledgeFileType,
  identifier: string
): string {
  const date = new Date().toISOString().split('T')[0] // YYYY-MM-DD
  const sanitized = identifier
    .replace(/[^a-zA-Z0-9\u4e00-\u9fa5_-]/g, '_') // 移除特殊字符
    .substring(0, 50) // 限制長度

  switch (type) {
    case 'decision':
      return `decision_log_${sanitized}.md`
    case 'pov':
      return `pov_briefing_${sanitized}.md`
    case 'meeting':
      return `meeting_summary_${date}_${sanitized}.md`
    default:
      return `${type}_${date}_${sanitized}.md`
  }
}

/**
 * 從檔案名稱提取 ID
 */
export function extractIdFromFilename(filename: string): string {
  return filename.replace('.md', '')
}

/**
 * 從 ID 生成檔案名稱
 */
export function filenameFromId(id: string): string {
  return id.endsWith('.md') ? id : `${id}.md`
}

/**
 * 檢查檔案是否存在
 */
export function fileExists(filename: string): boolean {
  const filepath = path.join(KNOWLEDGE_BASE_PATH, filename)
  return fs.existsSync(filepath)
}

/**
 * 取得知識庫根目錄路徑
 */
export function getKnowledgeBasePath(): string {
  return KNOWLEDGE_BASE_PATH
}

/**
 * 取得歸檔目錄路徑
 */
export function getArchivePath(): string {
  return ARCHIVE_PATH
}

// ============================================
// 輔助函數：結構化解析特定類型檔案
// ============================================

/**
 * 解析 FAQ 檔案為結構化資料
 */
export function parseFAQFile(content: string): FAQItem[] {
  const items: FAQItem[] = []
  const regex = /### (Q\d+):\s*(.+?)\n\*\*A\*\*:\s*(.+?)(?=\n###|$)/gs

  let match
  while ((match = regex.exec(content)) !== null) {
    const [, id, question, answer] = match

    items.push({
      id: id.toLowerCase(),
      question: question.trim(),
      answer: answer.trim(),
      tags: [], // 需要額外解析 tags
      keywords: extractKeywords(question + ' ' + answer),
      usage: 0,
      lastModified: new Date().toISOString(),
    })
  }

  return items
}

/**
 * 將 FAQ 結構化資料轉換為 Markdown
 */
export function serializeFAQToMarkdown(items: FAQItem[]): string {
  let markdown = '# CDO 常見問題與標準回答 (FAQ)\n\n'

  items.forEach((item, index) => {
    markdown += `### Q${index + 1}: ${item.question}\n`
    markdown += `**A**: ${item.answer}\n\n`
  })

  return markdown
}

/**
 * 簡單關鍵字提取（基於頻率）
 */
function extractKeywords(text: string): string[] {
  const words = text.match(/[\u4e00-\u9fa5]{2,}|[a-zA-Z]{3,}/g) || []
  const frequency: { [word: string]: number } = {}

  words.forEach((word) => {
    frequency[word] = (frequency[word] || 0) + 1
  })

  return Object.entries(frequency)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([word]) => word)
}

/**
 * 解析 KPI 檔案為結構化資料
 */
export function parseKPIFile(content: string): KPIItem[] {
  const items: KPIItem[] = []
  const regex = /### (.+?)\n- \*\*定義\*\*:\s*(.+?)\n- \*\*計算\*\*:\s*(.+?)(?=\n###|$)/gs

  let match
  while ((match = regex.exec(content)) !== null) {
    const [, name, definition, calculation] = match

    items.push({
      id: name.toLowerCase().replace(/\s+/g, '_'),
      name: name.trim(),
      definition: definition.trim(),
      calculation: calculation.trim(),
      dataSource: '', // 需要額外解析
      owner: '',
      tags: [],
      updateFrequency: 'daily',
      lastModified: new Date().toISOString(),
    })
  }

  return items
}

/**
 * 將 KPI 結構化資料轉換為 Markdown
 */
export function serializeKPIToMarkdown(items: KPIItem[]): string {
  let markdown = '# KPI 定義字典 (KPI Dictionary)\n\n'

  items.forEach((item) => {
    markdown += `### ${item.name}\n`
    markdown += `- **定義**: ${item.definition}\n`
    markdown += `- **計算**: ${item.calculation}\n`
    markdown += `- **數據來源**: ${item.dataSource}\n`
    markdown += `- **負責團隊**: ${item.owner}\n\n`
  })

  return markdown
}
