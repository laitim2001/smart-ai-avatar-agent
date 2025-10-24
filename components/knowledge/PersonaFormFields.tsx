/**
 * PersonaFormFields 元件
 * @module components/knowledge/PersonaFormFields
 * @description 共用的 Persona 表單欄位元件（用於建立與編輯頁面）
 */

'use client'

import { useState } from 'react'
import { Plus, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import MarkdownEditor from './MarkdownEditor'
import MarkdownPreview from './MarkdownPreview'

export interface PersonaFormData {
  name: string
  role: string
  description: string
  systemPrompt: string
  language: string
  tone: string
  style: string[]
  capabilities: string[]
  restrictions: string[]
  version: string
  isActive: boolean
}

interface PersonaFormFieldsProps {
  formData: PersonaFormData
  updateField: (field: keyof PersonaFormData, value: any) => void
  isEditMode?: boolean
}

/**
 * Persona 表單欄位元件
 */
export function PersonaFormFields({ formData, updateField, isEditMode = false }: PersonaFormFieldsProps) {
  const [currentTab, setCurrentTab] = useState('basic')

  // 新增標籤的臨時輸入
  const [newStyle, setNewStyle] = useState('')
  const [newCapability, setNewCapability] = useState('')
  const [newRestriction, setNewRestriction] = useState('')

  // 新增標籤
  const addTag = (field: 'style' | 'capabilities' | 'restrictions', value: string) => {
    if (!value.trim()) return

    const currentTags = formData[field]
    if (currentTags.includes(value.trim())) {
      return // 重複標籤不新增
    }

    updateField(field, [...currentTags, value.trim()])

    // 清空輸入
    if (field === 'style') setNewStyle('')
    if (field === 'capabilities') setNewCapability('')
    if (field === 'restrictions') setNewRestriction('')
  }

  // 刪除標籤
  const removeTag = (field: 'style' | 'capabilities' | 'restrictions', index: number) => {
    const currentTags = formData[field]
    updateField(
      field,
      currentTags.filter((_, i) => i !== index)
    )
  }

  // 字數統計
  const wordCount = formData.systemPrompt.length

  return (
    <div className="bg-white rounded-lg border">
      <Tabs value={currentTab} onValueChange={setCurrentTab}>
        <TabsList className="w-full grid grid-cols-4 bg-gray-100 rounded-t-lg border-b">
          <TabsTrigger value="basic">基本資訊</TabsTrigger>
          <TabsTrigger value="prompt">System Prompt</TabsTrigger>
          <TabsTrigger value="features">特徵配置</TabsTrigger>
          <TabsTrigger value="version">版本與狀態</TabsTrigger>
        </TabsList>

        {/* Tab 1: 基本資訊 */}
        <TabsContent value="basic" className="space-y-4 p-6">
          <div className="space-y-2">
            <Label htmlFor="name">Persona 名稱 *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => updateField('name', e.target.value)}
              placeholder="例如：CDO 商務顧問"
              maxLength={100}
            />
            <p className="text-xs text-gray-500">{formData.name.length}/100</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="role">角色定位 *</Label>
            <Input
              id="role"
              value={formData.role}
              onChange={(e) => updateField('role', e.target.value)}
              placeholder="例如：Chief Data Officer"
              maxLength={100}
            />
            <p className="text-xs text-gray-500">{formData.role.length}/100</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">詳細描述 *</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => updateField('description', e.target.value)}
              placeholder="描述此 Persona 的專業領域、特點、適用場景..."
              rows={4}
              maxLength={1000}
            />
            <p className="text-xs text-gray-500">
              {formData.description.length}/1000 {formData.description.length < 10 && '（至少 10 字元）'}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="language">語言 *</Label>
              <Select value={formData.language} onValueChange={(value) => updateField('language', value)}>
                <SelectTrigger id="language" className="bg-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  <SelectItem value="zh-TW">繁體中文</SelectItem>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="ja">日本語</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="tone">語氣 *</Label>
              <Select value={formData.tone} onValueChange={(value) => updateField('tone', value)}>
                <SelectTrigger id="tone" className="bg-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  <SelectItem value="professional">專業 (Professional)</SelectItem>
                  <SelectItem value="friendly">友好 (Friendly)</SelectItem>
                  <SelectItem value="casual">輕鬆 (Casual)</SelectItem>
                  <SelectItem value="academic">學術 (Academic)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </TabsContent>

        {/* Tab 2: System Prompt (雙欄編輯器) */}
        <TabsContent value="prompt" className="space-y-4 p-6">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="systemPrompt">System Prompt *</Label>
              <div className="text-xs text-gray-500">
                字數: {wordCount} {wordCount < 100 && '（至少 100 字元）'}
                <span className={`ml-2 ${wordCount >= 100 ? 'text-green-600' : 'text-orange-600'}`}>
                  {wordCount >= 100 ? '✓ 符合要求' : '⚠ 未達最低要求'}
                </span>
              </div>
            </div>

            {/* 雙欄佈局：左編輯右預覽 */}
            <div className="grid grid-cols-2 gap-4">
              {/* 左側：Markdown 編輯器 */}
              <div className="space-y-2">
                <div className="text-sm font-medium text-gray-700 bg-gray-50 px-3 py-2 rounded-t-lg border border-b-0">
                  📝 編輯區
                </div>
                <MarkdownEditor
                  value={formData.systemPrompt}
                  onChange={(value) => updateField('systemPrompt', value)}
                  height="500px"
                  placeholder="# System Prompt 範例&#10;&#10;你是一個專業的 AI 助手...&#10;&#10;## 核心能力&#10;- 能力 1&#10;- 能力 2&#10;&#10;## 限制&#10;- 不回答的主題&#10;"
                />
              </div>

              {/* 右側：Markdown 預覽 */}
              <div className="space-y-2">
                <div className="text-sm font-medium text-gray-700 bg-gray-50 px-3 py-2 rounded-t-lg border border-b-0">
                  👁️ 預覽區
                </div>
                <MarkdownPreview content={formData.systemPrompt} className="h-[500px]" />
              </div>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm">
            <p className="font-semibold text-blue-900 mb-2">💡 撰寫提示</p>
            <ul className="space-y-1 text-blue-800">
              <li>• 明確定義角色和專業領域</li>
              <li>• 說明回應風格和語氣</li>
              <li>• 列出核心能力和知識範圍</li>
              <li>• 設定限制和不回答的主題</li>
              <li>• 提供範例對話模式</li>
            </ul>
          </div>
        </TabsContent>

        {/* Tab 3: 特徵配置 */}
        <TabsContent value="features" className="space-y-6 p-6">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-sm mb-4">
            <p className="font-semibold text-yellow-900 mb-2">📌 特徵配置說明</p>
            <ul className="space-y-1 text-yellow-800">
              <li>
                <strong>風格標籤:</strong> 定義表達方式（如：分析型、創意型、系統性、同理心）
              </li>
              <li>
                <strong>能力標籤:</strong> 列出專業領域與技能（如：數據分析、策略規劃、技術諮詢）
              </li>
              <li>
                <strong>限制標籤:</strong> 不應討論的主題（如：醫療診斷、法律建議、投資建議）
              </li>
              <li className="mt-2 text-xs">
                💡 這些標籤會在對話時自動注入 System Prompt 中，幫助 AI 更準確地扮演角色
              </li>
            </ul>
          </div>

          {/* 風格標籤 */}
          <div className="space-y-2">
            <Label>風格標籤</Label>
            <div className="flex gap-2">
              <Input
                value={newStyle}
                onChange={(e) => setNewStyle(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    addTag('style', newStyle)
                  }
                }}
                placeholder="輸入風格標籤後按 Enter"
              />
              <Button type="button" onClick={() => addTag('style', newStyle)} size="sm">
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2 min-h-[32px]">
              {formData.style.map((tag, index) => (
                <Badge key={index} variant="secondary" className="gap-1">
                  {tag}
                  <X
                    className="w-3 h-3 cursor-pointer hover:text-red-600"
                    onClick={() => removeTag('style', index)}
                  />
                </Badge>
              ))}
            </div>
          </div>

          {/* 能力標籤 */}
          <div className="space-y-2">
            <Label>能力標籤</Label>
            <div className="flex gap-2">
              <Input
                value={newCapability}
                onChange={(e) => setNewCapability(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    addTag('capabilities', newCapability)
                  }
                }}
                placeholder="輸入能力標籤後按 Enter"
              />
              <Button type="button" onClick={() => addTag('capabilities', newCapability)} size="sm">
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2 min-h-[32px]">
              {formData.capabilities.map((tag, index) => (
                <Badge key={index} variant="secondary" className="gap-1 bg-purple-100 text-purple-800">
                  {tag}
                  <X
                    className="w-3 h-3 cursor-pointer hover:text-red-600"
                    onClick={() => removeTag('capabilities', index)}
                  />
                </Badge>
              ))}
            </div>
          </div>

          {/* 限制標籤 */}
          <div className="space-y-2">
            <Label>限制標籤</Label>
            <div className="flex gap-2">
              <Input
                value={newRestriction}
                onChange={(e) => setNewRestriction(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    addTag('restrictions', newRestriction)
                  }
                }}
                placeholder="輸入限制標籤後按 Enter"
              />
              <Button type="button" onClick={() => addTag('restrictions', newRestriction)} size="sm">
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2 min-h-[32px]">
              {formData.restrictions.map((tag, index) => (
                <Badge key={index} variant="secondary" className="gap-1 bg-red-100 text-red-800">
                  {tag}
                  <X
                    className="w-3 h-3 cursor-pointer hover:text-red-600"
                    onClick={() => removeTag('restrictions', index)}
                  />
                </Badge>
              ))}
            </div>
          </div>
        </TabsContent>

        {/* Tab 4: 版本與狀態 */}
        <TabsContent value="version" className="space-y-4 p-6">
          <div className="space-y-2">
            <Label htmlFor="version">版本號 *</Label>
            <Input
              id="version"
              value={formData.version}
              onChange={(e) => updateField('version', e.target.value)}
              placeholder="1.0.0"
              pattern="^\d+\.\d+\.\d+$"
            />
            <p className="text-xs text-gray-500">使用 Semantic Versioning 格式（如 1.0.0, 1.2.3）</p>
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border">
            <div>
              <Label htmlFor="isActive" className="text-base font-semibold">
                啟用此 Persona
              </Label>
              <p className="text-sm text-gray-500 mt-1">
                停用後，此 Persona 將不會顯示在 Agent 選擇清單中
              </p>
            </div>
            <Switch
              id="isActive"
              checked={formData.isActive}
              onCheckedChange={(checked) => updateField('isActive', checked)}
            />
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-sm">
            <p className="font-semibold text-yellow-900 mb-2">⚠️ 版本控制提示</p>
            <ul className="space-y-1 text-yellow-800">
              <li>• 主版本 (major): 重大變更，不向後相容</li>
              <li>• 次版本 (minor): 新增功能，向後相容</li>
              <li>• 修訂版本 (patch): Bug 修復，向後相容</li>
            </ul>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
