/**
 * 知識庫內容驗證模組
 * @description 驗證知識庫內容的格式、完整性和品質
 */

import type {
  ValidationResult,
  ValidationError,
  ValidationWarning,
  FAQItem,
  KPIItem,
  DecisionLogItem,
  MeetingSummaryItem,
} from '@/types/knowledge'

// ============================================
// Persona 驗證
// ============================================

const REQUIRED_PERSONA_SECTIONS = [
  '核心身份',
  '溝通風格與語氣',
  '決策原則',
  '專業領域',
  '互動模式',
]

export function validatePersona(content: string): ValidationResult {
  const errors: ValidationError[] = []
  const warnings: ValidationWarning[] = []

  // 1. 最小長度檢查
  if (content.length < 500) {
    errors.push({
      field: 'content',
      message: 'Persona 內容過短，建議至少 500 字元',
      code: 'MIN_LENGTH',
    })
  }

  // 2. 必要章節檢查
  const missingSections = REQUIRED_PERSONA_SECTIONS.filter(
    (section) => !content.includes(section)
  )

  if (missingSections.length > 0) {
    errors.push({
      field: 'structure',
      message: `缺少必要章節: ${missingSections.join(', ')}`,
      code: 'MISSING_SECTIONS',
    })
  }

  // 3. 章節長度檢查
  REQUIRED_PERSONA_SECTIONS.forEach((section) => {
    const sectionRegex = new RegExp(
      `##\\s*${section}([\\s\\S]*?)(?=##|$)`,
      'i'
    )
    const match = content.match(sectionRegex)

    if (match && match[1].trim().length < 100) {
      warnings.push({
        field: section,
        message: `章節 "${section}" 內容過短，建議補充更多細節`,
        suggestion: '至少 100 字元',
      })
    }
  })

  // 4. 格式檢查
  if (!content.includes('# Persona 定義') && !content.includes('# persona')) {
    warnings.push({
      field: 'format',
      message: '建議使用標準標題: "# Persona 定義"',
    })
  }

  // 計算品質分數
  const score = calculatePersonaScore(content, errors, warnings)

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    score,
  }
}

function calculatePersonaScore(
  content: string,
  errors: ValidationError[],
  warnings: ValidationWarning[]
): number {
  let score = 100

  // 錯誤扣分
  score -= errors.length * 20

  // 警告扣分
  score -= warnings.length * 5

  // 長度加分
  if (content.length > 5000) score += 10
  if (content.length > 10000) score += 10

  // 結構加分
  const hasAllSections = REQUIRED_PERSONA_SECTIONS.every((section) =>
    content.includes(section)
  )
  if (hasAllSections) score += 10

  return Math.max(0, Math.min(100, score))
}

// ============================================
// FAQ 驗證
// ============================================

export function validateFAQ(item: FAQItem): ValidationResult {
  const errors: ValidationError[] = []
  const warnings: ValidationWarning[] = []

  // 1. 問題驗證
  if (!item.question || item.question.trim().length === 0) {
    errors.push({
      field: 'question',
      message: '問題不能為空',
      code: 'REQUIRED',
    })
  }

  if (item.question && item.question.length < 10) {
    warnings.push({
      field: 'question',
      message: '問題過短，建議至少 10 字元',
    })
  }

  if (item.question && item.question.length > 200) {
    warnings.push({
      field: 'question',
      message: '問題過長，建議控制在 200 字元以內',
    })
  }

  if (item.question && !item.question.includes('？') && !item.question.includes('?')) {
    warnings.push({
      field: 'question',
      message: '問題建議以問號結尾',
      suggestion: '例如: "如何申請數據專案？"',
    })
  }

  // 2. 答案驗證
  if (!item.answer || item.answer.trim().length === 0) {
    errors.push({
      field: 'answer',
      message: '答案不能為空',
      code: 'REQUIRED',
    })
  }

  if (item.answer && item.answer.length < 50) {
    warnings.push({
      field: 'answer',
      message: '答案過短，建議至少 50 字元以提供詳細說明',
    })
  }

  if (item.answer && item.answer.length > 2000) {
    warnings.push({
      field: 'answer',
      message: '答案過長，建議拆分為多個 FAQ 或使用決策日誌記錄',
    })
  }

  // 3. 關鍵字驗證
  if (!item.keywords || item.keywords.length < 3) {
    warnings.push({
      field: 'keywords',
      message: '建議至少提供 3 個關鍵字以提升搜尋匹配率',
      suggestion: '例如: ["專案", "申請", "流程"]',
    })
  }

  // 4. 標籤驗證
  if (!item.tags || item.tags.length === 0) {
    warnings.push({
      field: 'tags',
      message: '建議至少選擇一個分類標籤',
      suggestion: '例如: 流程類、技術類、政策類',
    })
  }

  const score = calculateFAQScore(item, errors, warnings)

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    score,
  }
}

function calculateFAQScore(
  item: FAQItem,
  errors: ValidationError[],
  warnings: ValidationWarning[]
): number {
  let score = 100

  score -= errors.length * 20
  score -= warnings.length * 5

  // 關鍵字密度加分
  if (item.keywords && item.keywords.length >= 5) score += 5
  if (item.keywords && item.keywords.length >= 8) score += 5

  // 答案長度加分
  if (item.answer && item.answer.length > 200) score += 5
  if (item.answer && item.answer.length > 500) score += 5

  return Math.max(0, Math.min(100, score))
}

// ============================================
// KPI 驗證
// ============================================

export function validateKPI(item: KPIItem): ValidationResult {
  const errors: ValidationError[] = []
  const warnings: ValidationWarning[] = []

  // 1. 名稱驗證
  if (!item.name || item.name.trim().length === 0) {
    errors.push({
      field: 'name',
      message: 'KPI 名稱不能為空',
      code: 'REQUIRED',
    })
  }

  // 檢查名稱格式 (例: MAU (Monthly Active Users))
  const namePattern = /^[A-Z]{2,5}\s*\(.+\)$/
  if (item.name && !namePattern.test(item.name)) {
    warnings.push({
      field: 'name',
      message: '建議使用標準格式',
      suggestion: '例如: MAU (Monthly Active Users)',
    })
  }

  // 2. 定義驗證
  if (!item.definition || item.definition.trim().length === 0) {
    errors.push({
      field: 'definition',
      message: '業務定義不能為空',
      code: 'REQUIRED',
    })
  }

  if (item.definition && item.definition.length < 20) {
    warnings.push({
      field: 'definition',
      message: '業務定義過短，建議至少 20 字元',
    })
  }

  // 3. 計算口徑驗證
  if (!item.calculation || item.calculation.trim().length === 0) {
    errors.push({
      field: 'calculation',
      message: '技術計算口徑不能為空',
      code: 'REQUIRED',
    })
  }

  // 簡單的 SQL 語法檢查
  if (item.calculation) {
    const hasSQL =
      item.calculation.toUpperCase().includes('SELECT') ||
      item.calculation.toUpperCase().includes('COUNT') ||
      item.calculation.toUpperCase().includes('SUM')

    if (!hasSQL) {
      warnings.push({
        field: 'calculation',
        message: '建議使用 SQL 語法描述計算邏輯',
        suggestion: '例如: SELECT COUNT(DISTINCT user_id) FROM...',
      })
    }
  }

  // 4. 數據來源驗證
  if (!item.dataSource || item.dataSource.trim().length === 0) {
    errors.push({
      field: 'dataSource',
      message: '數據來源不能為空',
      code: 'REQUIRED',
    })
  }

  // 5. 負責團隊驗證
  if (!item.owner || item.owner.trim().length === 0) {
    errors.push({
      field: 'owner',
      message: '負責團隊不能為空',
      code: 'REQUIRED',
    })
  }

  const score = calculateKPIScore(item, errors, warnings)

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    score,
  }
}

function calculateKPIScore(
  item: KPIItem,
  errors: ValidationError[],
  warnings: ValidationWarning[]
): number {
  let score = 100

  score -= errors.length * 20
  score -= warnings.length * 5

  // SQL 格式加分
  if (item.calculation && item.calculation.includes('SELECT')) score += 10

  // 詳細定義加分
  if (item.definition && item.definition.length > 100) score += 5

  return Math.max(0, Math.min(100, score))
}

// ============================================
// 決策日誌驗證
// ============================================

export function validateDecisionLog(item: DecisionLogItem): ValidationResult {
  const errors: ValidationError[] = []
  const warnings: ValidationWarning[] = []

  // 1. 專案名稱
  if (!item.projectName || item.projectName.trim().length === 0) {
    errors.push({
      field: 'projectName',
      message: '專案名稱不能為空',
      code: 'REQUIRED',
    })
  }

  // 2. 日期
  if (!item.date) {
    errors.push({
      field: 'date',
      message: '決策日期不能為空',
      code: 'REQUIRED',
    })
  }

  // 3. 決策者
  if (!item.decisionMakers || item.decisionMakers.length === 0) {
    warnings.push({
      field: 'decisionMakers',
      message: '建議記錄決策者姓名或角色',
    })
  }

  // 4. 背景說明
  if (!item.background || item.background.trim().length === 0) {
    errors.push({
      field: 'background',
      message: '決策背景不能為空',
      code: 'REQUIRED',
    })
  }

  if (item.background && item.background.length < 100) {
    warnings.push({
      field: 'background',
      message: '背景說明過短，建議詳細描述問題陳述和現狀',
    })
  }

  // 5. 考量選項
  if (!item.options || item.options.length < 2) {
    warnings.push({
      field: 'options',
      message: '建議至少記錄 2 個考量過的選項',
      suggestion: '包含優缺點分析',
    })
  }

  item.options?.forEach((option, index) => {
    if (!option.pros || option.pros.length === 0) {
      warnings.push({
        field: `options[${index}].pros`,
        message: `選項 "${option.name}" 缺少優點分析`,
      })
    }
    if (!option.cons || option.cons.length === 0) {
      warnings.push({
        field: `options[${index}].cons`,
        message: `選項 "${option.name}" 缺少缺點分析`,
      })
    }
  })

  // 6. 最終決策
  if (!item.finalDecision || item.finalDecision.trim().length === 0) {
    errors.push({
      field: 'finalDecision',
      message: '最終決策不能為空',
      code: 'REQUIRED',
    })
  }

  if (item.finalDecision && item.finalDecision.length < 50) {
    warnings.push({
      field: 'finalDecision',
      message: '建議詳細說明決策理由和預期成效',
    })
  }

  const score = 100 - errors.length * 20 - warnings.length * 5

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    score: Math.max(0, Math.min(100, score)),
  }
}

// ============================================
// 會議摘要驗證
// ============================================

export function validateMeetingSummary(
  item: MeetingSummaryItem
): ValidationResult {
  const errors: ValidationError[] = []
  const warnings: ValidationWarning[] = []

  // 1. 會議主題
  if (!item.topic || item.topic.trim().length === 0) {
    errors.push({
      field: 'topic',
      message: '會議主題不能為空',
      code: 'REQUIRED',
    })
  }

  // 2. 日期與時間
  if (!item.date) {
    errors.push({
      field: 'date',
      message: '會議日期不能為空',
      code: 'REQUIRED',
    })
  }

  if (!item.time) {
    warnings.push({
      field: 'time',
      message: '建議記錄會議時間',
    })
  }

  // 3. 參與者
  if (!item.participants || item.participants.length === 0) {
    warnings.push({
      field: 'participants',
      message: '建議記錄參與者名單',
    })
  }

  // 4. 會議目標
  if (!item.objectives || item.objectives.length === 0) {
    warnings.push({
      field: 'objectives',
      message: '建議記錄會議目標',
      suggestion: '明確會議想達成什麼目的',
    })
  }

  // 5. 關鍵討論
  if (!item.keyPoints || item.keyPoints.trim().length === 0) {
    errors.push({
      field: 'keyPoints',
      message: '關鍵討論要點不能為空',
      code: 'REQUIRED',
    })
  }

  if (item.keyPoints && item.keyPoints.length < 100) {
    warnings.push({
      field: 'keyPoints',
      message: '討論要點過短，建議詳細記錄主要討論內容',
    })
  }

  // 6. 待辦事項
  if (!item.actionItems || item.actionItems.length === 0) {
    warnings.push({
      field: 'actionItems',
      message: '建議記錄會議產生的待辦事項',
      suggestion: '包含負責人和截止日期',
    })
  }

  item.actionItems?.forEach((action, index) => {
    if (!action.assignee) {
      warnings.push({
        field: `actionItems[${index}].assignee`,
        message: `待辦事項 "${action.task}" 缺少負責人`,
      })
    }
    if (!action.deadline) {
      warnings.push({
        field: `actionItems[${index}].deadline`,
        message: `待辦事項 "${action.task}" 缺少截止日期`,
      })
    }
  })

  const score = 100 - errors.length * 20 - warnings.length * 5

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    score: Math.max(0, Math.min(100, score)),
  }
}

// ============================================
// 通用驗證
// ============================================

/**
 * 驗證 Markdown 格式
 */
export function validateMarkdownFormat(content: string): ValidationResult {
  const errors: ValidationError[] = []
  const warnings: ValidationWarning[] = []

  // 基本格式檢查
  if (!content.trim().startsWith('#')) {
    warnings.push({
      field: 'format',
      message: '建議使用 Markdown 標題（# 開頭）',
    })
  }

  // 檢查是否有過長的行
  const lines = content.split('\n')
  lines.forEach((line, index) => {
    if (line.length > 200 && !line.startsWith('```')) {
      warnings.push({
        field: `line_${index + 1}`,
        message: `第 ${index + 1} 行過長，建議拆分以提升可讀性`,
      })
    }
  })

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  }
}
