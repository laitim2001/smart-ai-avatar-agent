/**
 * 知識庫管理系統型別定義
 * @description 定義所有知識庫相關的 TypeScript 介面和型別
 */

// ============================================
// 通用型別
// ============================================

export type KnowledgeFileType =
  | 'persona'
  | 'faq'
  | 'kpi'
  | 'decision'
  | 'pov'
  | 'meeting'

export interface FileMetadata {
  filename: string
  type: KnowledgeFileType
  size: number
  lastModified: string
  wordCount: number
  createdAt?: string
}

export interface ValidationResult {
  valid: boolean
  errors: ValidationError[]
  warnings: ValidationWarning[]
  score?: number // 品質分數 (0-100)
}

export interface ValidationError {
  field: string
  message: string
  code: string
}

export interface ValidationWarning {
  field: string
  message: string
  suggestion?: string
}

// ============================================
// Persona 相關型別
// ============================================

export interface PersonaContent {
  content: string
  metadata: FileMetadata
  structure: PersonaStructure
}

export interface PersonaStructure {
  sections: PersonaSection[]
  completeness: number // 0-100
  consistency: number // 0-100 語氣一致性
}

export interface PersonaSection {
  title: string
  content: string
  wordCount: number
  isComplete: boolean
  warnings?: string[]
}

// ============================================
// FAQ 相關型別
// ============================================

export interface FAQItem {
  id: string
  question: string
  answer: string
  tags: string[]
  keywords: string[]
  usage: number // 被引用次數
  lastModified: string
}

export interface FAQContent {
  items: FAQItem[]
  metadata: FileMetadata
  stats: {
    totalQuestions: number
    byCategory: { [category: string]: number }
  }
}

export interface FAQCreateInput {
  question: string
  answer: string
  tags: string[]
  keywords: string[]
}

export interface FAQUpdateInput extends Partial<FAQCreateInput> {
  id: string
}

// ============================================
// KPI 相關型別
// ============================================

export interface KPIItem {
  id: string
  name: string // 例: MAU (Monthly Active Users)
  definition: string // 業務定義
  calculation: string // 技術計算口徑 (可包含 SQL)
  dataSource: string // 數據來源
  owner: string // 負責團隊
  tags: string[]
  updateFrequency: 'realtime' | 'hourly' | 'daily' | 'weekly' | 'monthly'
  lastModified: string
}

export interface KPIContent {
  items: KPIItem[]
  metadata: FileMetadata
  stats: {
    totalKPIs: number
    byCategory: { [category: string]: number }
  }
}

export interface KPICreateInput {
  name: string
  definition: string
  calculation: string
  dataSource: string
  owner: string
  tags: string[]
  updateFrequency: KPIItem['updateFrequency']
}

export interface KPIUpdateInput extends Partial<KPICreateInput> {
  id: string
}

// ============================================
// 決策日誌相關型別
// ============================================

export interface DecisionLogOption {
  name: string
  pros: string[]
  cons: string[]
}

export interface DecisionLogItem {
  id: string
  filename: string
  projectName: string
  date: string
  decisionMakers: string[]
  background: string
  options: DecisionLogOption[]
  finalDecision: string
  tags: string[]
  lastModified: string
}

export interface DecisionLogContent {
  items: DecisionLogItem[]
  metadata: {
    total: number
    byYear: { [year: string]: number }
    byTag: { [tag: string]: number }
  }
}

export interface DecisionLogCreateInput {
  projectName: string
  date: string
  decisionMakers: string[]
  background: string
  options: DecisionLogOption[]
  finalDecision: string
  tags: string[]
}

export interface DecisionLogUpdateInput extends Partial<DecisionLogCreateInput> {
  id: string
}

// ============================================
// 觀點簡報相關型別
// ============================================

export interface POVBriefingItem {
  id: string
  filename: string
  topic: string // 議題名稱
  date: string
  content: string // Markdown 內容
  tags: string[]
  lastModified: string
}

export interface POVBriefingContent {
  items: POVBriefingItem[]
  metadata: {
    total: number
    byTag: { [tag: string]: number }
  }
}

export interface POVBriefingCreateInput {
  topic: string
  date: string
  content: string
  tags: string[]
}

export interface POVBriefingUpdateInput extends Partial<POVBriefingCreateInput> {
  id: string
}

// ============================================
// 會議摘要相關型別
// ============================================

export interface ActionItem {
  assignee: string
  task: string
  deadline: string
  status: 'pending' | 'in_progress' | 'completed'
}

export interface MeetingSummaryItem {
  id: string
  filename: string
  topic: string
  date: string
  time: string
  participants: string[]
  objectives: string[]
  keyPoints: string // Markdown 格式
  decisions: string[]
  actionItems: ActionItem[]
  tags: string[]
  lastModified: string
}

export interface MeetingSummaryContent {
  items: MeetingSummaryItem[]
  metadata: {
    total: number
    byMonth: { [month: string]: number }
    recentCount: number // 最近 30 天
  }
  pagination?: {
    page: number
    limit: number
    totalPages: number
  }
}

export interface MeetingSummaryCreateInput {
  topic: string
  date: string
  time: string
  participants: string[]
  objectives: string[]
  keyPoints: string
  decisions: string[]
  actionItems: ActionItem[]
  tags?: string[]
}

export interface MeetingSummaryUpdateInput extends Partial<MeetingSummaryCreateInput> {
  id: string
}

export interface MeetingArchiveInput {
  ids: string[]
  archivePath: string
}

// ============================================
// 搜尋相關型別
// ============================================

export interface SearchQuery {
  query: string
  type?: KnowledgeFileType
  limit?: number
}

export interface SearchResult {
  file: string
  type: KnowledgeFileType
  title: string
  excerpt: string // 匹配的內容片段
  relevance: number // 0-100 相關性分數
  highlights: string[] // 高亮關鍵字
}

export interface SearchResponse {
  results: SearchResult[]
  total: number
  took: number // 搜尋耗時 (ms)
}

// ============================================
// Git 版本控制相關型別
// ============================================

export interface GitCommit {
  hash: string
  author: string
  date: string
  message: string
  filesChanged: string[]
}

export interface GitHistoryQuery {
  filepath: string
  limit?: number
}

export interface GitRevertInput {
  filepath: string
  commitHash: string
}

export interface GitDiffQuery {
  filepath: string
  from: string // commit hash
  to: string // commit hash
}

export interface GitDiffResponse {
  diff: string
  additions: number
  deletions: number
}

// ============================================
// 知識庫統計相關型別
// ============================================

export interface KnowledgeBaseStats {
  isInitialized: boolean
  personaCached: boolean
  personaSize: number
  filesIndexed: number
  files: string[]
  totalWords: number
  lastUpdate: string
}

export interface UsageAnalytics {
  weeklyUsage: { [filename: string]: number }
  topQueries: string[]
  avgResponseTime: number
}

export interface KnowledgeStatusResponse {
  success: boolean
  timestamp: string
  stats: KnowledgeBaseStats
  analytics?: UsageAnalytics
}

// ============================================
// Agent 知識庫關聯型別 (for AgentKnowledgeLoader)
// ============================================

/**
 * 知識庫項目 (統一介面)
 */
export interface KnowledgeItem {
  id: string
  name: string
  type: string
  category: string
  content: string
  priority: number
  isRequired: boolean
  language?: string
  version?: string
  filePath?: string
}

/**
 * 載入的 Agent 知識庫資料
 */
export interface LoadedKnowledge {
  agentId: string
  agentName: string
  knowledgeItems: KnowledgeItem[]
  totalItems: number
  systemPrompt?: string
}

/**
 * 知識庫搜尋結果
 */
export interface KnowledgeSearchResult {
  item: KnowledgeItem
  score: number
  matchedContent?: string
}

// ============================================
// API 回應型別
// ============================================

export interface APIResponse<T = any> {
  success: boolean
  data?: T
  error?: {
    code: string
    message: string
    details?: any
  }
  metadata?: {
    timestamp: string
    requestId?: string
  }
}

export interface PaginatedResponse<T = any> {
  success: boolean
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
  metadata?: {
    timestamp: string
  }
}
