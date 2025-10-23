/**
 * PersonaForm 元件
 * @module components/knowledge/PersonaForm
 * @description 建立或編輯 Persona 的完整表單（4 個 Tabs）
 */

'use client'

import { useState, useEffect } from 'react'
import { Users, Loader2, X, Plus } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'

interface PersonaFormProps {
  persona?: any | null // 如果提供則為編輯模式
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

interface PersonaFormData {
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

/**
 * Persona 表單元件
 */
export function PersonaForm({ persona, open, onOpenChange, onSuccess }: PersonaFormProps) {
  const [currentTab, setCurrentTab] = useState('basic')
  const [isSubmitting, setIsSubmitting] = useState(false)

  // 新增標籤的臨時輸入
  const [newStyle, setNewStyle] = useState('')
  const [newCapability, setNewCapability] = useState('')
  const [newRestriction, setNewRestriction] = useState('')

  const isEditMode = !!persona

  // 表單資料
  const [formData, setFormData] = useState<PersonaFormData>({
    name: '',
    role: '',
    description: '',
    systemPrompt: '',
    language: 'zh-TW',
    tone: 'professional',
    style: [],
    capabilities: [],
    restrictions: [],
    version: '1.0.0',
    isActive: true,
  })

  // 載入 Persona 資料（編輯模式）
  useEffect(() => {
    if (open && persona) {
      setFormData({
        name: persona.name || '',
        role: persona.role || '',
        description: persona.description || '',
        systemPrompt: persona.systemPrompt || '',
        language: persona.language || 'zh-TW',
        tone: persona.tone || 'professional',
        style: persona.style || [],
        capabilities: persona.capabilities || [],
        restrictions: persona.restrictions || [],
        version: persona.version || '1.0.0',
        isActive: persona.isActive !== undefined ? persona.isActive : true,
      })
    } else if (open && !persona) {
      // 重置為空白表單
      setFormData({
        name: '',
        role: '',
        description: '',
        systemPrompt: '',
        language: 'zh-TW',
        tone: 'professional',
        style: [],
        capabilities: [],
        restrictions: [],
        version: '1.0.0',
        isActive: true,
      })
    }
  }, [open, persona])

  // 更新表單欄位
  const updateField = (field: keyof PersonaFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  // 新增標籤
  const addTag = (field: 'style' | 'capabilities' | 'restrictions', value: string) => {
    if (!value.trim()) return

    const currentTags = formData[field]
    if (currentTags.includes(value.trim())) {
      toast.error('此標籤已存在')
      return
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
    updateField(field, currentTags.filter((_, i) => i !== index))
  }

  // 驗證表單
  const validateForm = (): boolean => {
    if (!formData.name.trim()) {
      toast.error('請輸入 Persona 名稱')
      setCurrentTab('basic')
      return false
    }
    if (!formData.role.trim()) {
      toast.error('請輸入角色定位')
      setCurrentTab('basic')
      return false
    }
    if (formData.description.length < 10) {
      toast.error('描述至少需要 10 個字元')
      setCurrentTab('basic')
      return false
    }
    if (formData.systemPrompt.length < 100) {
      toast.error('System Prompt 至少需要 100 個字元')
      setCurrentTab('prompt')
      return false
    }
    if (!/^\d+\.\d+\.\d+$/.test(formData.version)) {
      toast.error('版本號必須符合 Semantic Versioning 格式（如 1.0.0）')
      setCurrentTab('version')
      return false
    }
    return true
  }

  // 提交表單
  const handleSubmit = async () => {
    if (!validateForm()) return

    setIsSubmitting(true)

    try {
      const url = isEditMode ? `/api/personas/${persona.id}` : '/api/personas'
      const method = isEditMode ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (data.success) {
        toast.success(isEditMode ? 'Persona 已更新' : 'Persona 已建立')
        onSuccess?.()
        onOpenChange(false)
      } else {
        toast.error(data.error?.message || '操作失敗')
        console.error('[PersonaForm Error]', data.error)
      }
    } catch (error) {
      console.error('[PersonaForm Submit Error]', error)
      toast.error('操作失敗，請稍後再試')
    } finally {
      setIsSubmitting(false)
    }
  }

  // 字數統計
  const wordCount = formData.systemPrompt.length

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] p-0 bg-white">
        <DialogHeader className="p-6 pb-4 bg-white border-b">
          <DialogTitle className="text-2xl flex items-center gap-2">
            <Users className="w-6 h-6 text-purple-600" />
            {isEditMode ? '編輯 Persona' : '建立 Persona'}
          </DialogTitle>
          <DialogDescription>
            {isEditMode
              ? '更新 Persona 的角色、專業領域、溝通風格'
              : '定義新的 AI Agent 角色、專業領域、溝通風格'}
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[calc(90vh-180px)] bg-white">
          <div className="px-6 pb-4 bg-white">
            <Tabs value={currentTab} onValueChange={setCurrentTab}>
              <TabsList className="grid w-full grid-cols-4 bg-gray-100">
                <TabsTrigger value="basic">基本資訊</TabsTrigger>
                <TabsTrigger value="prompt">System Prompt</TabsTrigger>
                <TabsTrigger value="features">特徵配置</TabsTrigger>
                <TabsTrigger value="version">版本與狀態</TabsTrigger>
              </TabsList>

              {/* Tab 1: 基本資訊 */}
              <TabsContent value="basic" className="space-y-4 mt-4">
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

              {/* Tab 2: System Prompt */}
              <TabsContent value="prompt" className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="systemPrompt">System Prompt *</Label>
                  <Textarea
                    id="systemPrompt"
                    value={formData.systemPrompt}
                    onChange={(e) => updateField('systemPrompt', e.target.value)}
                    placeholder="完整的 System Prompt，定義 AI Agent 的行為、知識範圍、回應方式..."
                    rows={15}
                    className="font-mono text-sm"
                  />
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>字數: {wordCount} {wordCount < 100 && '（至少 100 字元）'}</span>
                    <span className={wordCount >= 100 ? 'text-green-600' : 'text-orange-600'}>
                      {wordCount >= 100 ? '✓ 符合要求' : '⚠ 未達最低要求'}
                    </span>
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
              <TabsContent value="features" className="space-y-6 mt-4">
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
              <TabsContent value="version" className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="version">版本號 *</Label>
                  <Input
                    id="version"
                    value={formData.version}
                    onChange={(e) => updateField('version', e.target.value)}
                    placeholder="1.0.0"
                    pattern="^\d+\.\d+\.\d+$"
                  />
                  <p className="text-xs text-gray-500">
                    使用 Semantic Versioning 格式（如 1.0.0, 1.2.3）
                  </p>
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
        </ScrollArea>

        <DialogFooter className="p-6 pt-4 border-t bg-white">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
            取消
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                {isEditMode ? '更新中...' : '建立中...'}
              </>
            ) : (
              isEditMode ? '更新 Persona' : '建立 Persona'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
