/**
 * Agent 編輯器元件
 * @module components/agents/AgentEditor
 * @description 建立或編輯 Agent 的完整表單，包含 Persona、Avatar、語言、知識庫配置
 */

'use client'

import { useState, useEffect } from 'react'
import { useAgentStore, Agent } from '@/stores/agentStore'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Bot, Loader2, Plus, Edit } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { toast } from 'sonner'

interface AgentEditorProps {
  agent?: Agent // 如果提供則為編輯模式，否則為建立模式
  open?: boolean
  onOpenChange?: (open: boolean) => void
  onSuccess?: (agent: Agent) => void
  trigger?: React.ReactNode
}

interface AgentFormData {
  name: string
  description: string
  category: string
  personaId: string
  avatarId: string
  primaryLanguage: string
  supportedLanguages: string[]
  isPublic: boolean
  knowledgeBaseIds: string[] // 新增：關聯的知識庫 IDs
}

interface KnowledgeBase {
  id: string
  name: string
  description: string | null
  type: string
  category: string
}

interface Persona {
  id: string
  name: string
  role: string
  description: string
  language: string
  tone: string
  capabilities?: string[]
  version: string
}

/**
 * Agent 編輯器對話框元件
 */
export function AgentEditor({
  agent,
  open: controlledOpen,
  onOpenChange,
  onSuccess,
  trigger,
}: AgentEditorProps) {
  const t = useTranslations('agents')
  const [internalOpen, setInternalOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [currentTab, setCurrentTab] = useState('basic')
  const [availableKnowledgeBases, setAvailableKnowledgeBases] = useState<KnowledgeBase[]>([])
  const [isLoadingKnowledge, setIsLoadingKnowledge] = useState(false)
  const [availablePersonas, setAvailablePersonas] = useState<Persona[]>([])
  const [isLoadingPersonas, setIsLoadingPersonas] = useState(false)

  const { createAgent, updateAgent, error, clearError } = useAgentStore()

  // 表單資料
  const [formData, setFormData] = useState<AgentFormData>({
    name: agent?.name || '',
    description: agent?.description || '',
    category: agent?.category || 'professional',
    personaId: agent?.persona?.id || '',
    avatarId: agent?.avatar?.id || '',
    primaryLanguage: agent?.primaryLanguage || 'zh-TW',
    supportedLanguages: agent?.supportedLanguages || ['zh-TW'],
    isPublic: agent?.isPublic || false,
    knowledgeBaseIds: [],
  })

  // 使用外部控制或內部狀態
  const isOpen = controlledOpen !== undefined ? controlledOpen : internalOpen
  const setOpen = onOpenChange || setInternalOpen
  const isEditMode = !!agent

  // 載入知識庫列表和 Persona 列表
  useEffect(() => {
    if (isOpen) {
      loadKnowledgeBases()
      loadPersonas()
    }
  }, [isOpen])

  const loadKnowledgeBases = async () => {
    try {
      setIsLoadingKnowledge(true)
      const response = await fetch('/api/knowledge')

      if (!response.ok) {
        throw new Error('Failed to load knowledge bases')
      }

      const data = await response.json()
      setAvailableKnowledgeBases(data.data || [])
    } catch (error) {
      console.error('[AgentEditor] Load knowledge bases error:', error)
      toast.error(t('errors.loadKnowledgeFailed') || '載入知識庫失敗')
    } finally {
      setIsLoadingKnowledge(false)
    }
  }

  const loadPersonas = async () => {
    try {
      setIsLoadingPersonas(true)
      const response = await fetch('/api/personas')

      if (!response.ok) {
        throw new Error('Failed to load personas')
      }

      const data = await response.json()
      setAvailablePersonas(data.data || [])
    } catch (error) {
      console.error('[AgentEditor] Load personas error:', error)
      toast.error('載入 Persona 列表失敗')
    } finally {
      setIsLoadingPersonas(false)
    }
  }

  // 重置表單
  useEffect(() => {
    if (isOpen && agent) {
      // 編輯模式：載入 Agent 現有資料
      setFormData({
        name: agent.name,
        description: agent.description,
        category: agent.category,
        personaId: agent.persona?.id || '',
        avatarId: agent.avatar?.id || '',
        primaryLanguage: agent.primaryLanguage,
        supportedLanguages: agent.supportedLanguages,
        isPublic: agent.isPublic,
        knowledgeBaseIds: [],
      })

      // 載入已關聯的知識庫
      loadAgentKnowledgeBases(agent.id)
    } else if (isOpen && !agent) {
      // 建立模式：重置為空白表單
      setFormData({
        name: '',
        description: '',
        category: 'professional',
        personaId: '',
        avatarId: '',
        primaryLanguage: 'zh-TW',
        supportedLanguages: ['zh-TW'],
        isPublic: false,
        knowledgeBaseIds: [],
      })
    }
  }, [isOpen, agent])

  // 載入 Agent 已關聯的知識庫
  const loadAgentKnowledgeBases = async (agentId: string) => {
    try {
      const response = await fetch(`/api/agents/${agentId}/knowledge`)

      if (!response.ok) {
        throw new Error('Failed to load agent knowledge bases')
      }

      const data = await response.json()
      const linkedKnowledgeBaseIds = (data.data || []).map((link: any) => link.knowledgeBaseId)

      setFormData((prev) => ({
        ...prev,
        knowledgeBaseIds: linkedKnowledgeBaseIds,
      }))
    } catch (error) {
      console.error('[AgentEditor] Load agent knowledge bases error:', error)
      // 不顯示錯誤 toast，靜默失敗
    }
  }

  // 更新表單欄位
  const updateField = (field: keyof AgentFormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  // 切換支援語言
  const toggleLanguage = (lang: string) => {
    setFormData((prev) => ({
      ...prev,
      supportedLanguages: prev.supportedLanguages.includes(lang)
        ? prev.supportedLanguages.filter((l) => l !== lang)
        : [...prev.supportedLanguages, lang],
    }))
  }

  // 切換知識庫
  const toggleKnowledgeBase = (knowledgeBaseId: string) => {
    setFormData((prev) => ({
      ...prev,
      knowledgeBaseIds: prev.knowledgeBaseIds.includes(knowledgeBaseId)
        ? prev.knowledgeBaseIds.filter((id) => id !== knowledgeBaseId)
        : [...prev.knowledgeBaseIds, knowledgeBaseId],
    }))
  }

  // 驗證表單
  const validateForm = (): boolean => {
    if (!formData.name.trim()) {
      toast.error(t('errors.nameRequired'))
      return false
    }
    if (!formData.description.trim()) {
      toast.error(t('errors.descriptionRequired'))
      return false
    }
    if (!formData.personaId) {
      toast.error(t('errors.personaRequired'))
      return false
    }
    if (formData.supportedLanguages.length === 0) {
      toast.error(t('errors.languageRequired'))
      return false
    }
    return true
  }

  // 提交表單
  const handleSubmit = async () => {
    if (!validateForm()) return

    setIsSubmitting(true)
    clearError()

    try {
      let result: Agent | null

      if (isEditMode && agent) {
        // 更新模式
        result = await updateAgent(agent.id, formData)
      } else {
        // 建立模式
        result = await createAgent(formData)
      }

      if (result) {
        // 如果建立成功且有選擇知識庫，則關聯知識庫
        if (formData.knowledgeBaseIds.length > 0) {
          await linkKnowledgeBases(result.id, formData.knowledgeBaseIds)
        }

        toast.success(
          isEditMode ? t('updateSuccess') : t('createSuccess')
        )
        onSuccess?.(result)
        setOpen(false)
      } else {
        toast.error(error || t('errors.submitFailed'))
      }
    } catch (err) {
      console.error('[AgentEditor Submit Error]', err)
      toast.error(t('errors.submitFailed'))
    } finally {
      setIsSubmitting(false)
    }
  }

  // 關聯知識庫
  const linkKnowledgeBases = async (agentId: string, knowledgeBaseIds: string[]) => {
    const { linkKnowledge } = useAgentStore.getState()

    for (const knowledgeBaseId of knowledgeBaseIds) {
      try {
        await linkKnowledge(agentId, knowledgeBaseId, 100, false)
      } catch (error) {
        console.error(`[AgentEditor] Failed to link knowledge ${knowledgeBaseId}:`, error)
        // 不中斷流程，只記錄錯誤
      }
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button className="gap-2">
            {isEditMode ? (
              <>
                <Edit className="w-4 h-4" />
                {t('editAgent')}
              </>
            ) : (
              <>
                <Plus className="w-4 h-4" />
                {t('createAgent')}
              </>
            )}
          </Button>
        )}
      </DialogTrigger>

      <DialogContent className="max-w-3xl max-h-[85vh] p-0 bg-white">
        <DialogHeader className="p-6 pb-4 bg-white">
          <DialogTitle className="text-2xl flex items-center gap-2">
            <Bot className="w-6 h-6" />
            {isEditMode ? t('editAgent') : t('createAgent')}
          </DialogTitle>
          <DialogDescription>
            {isEditMode
              ? t('editAgentDescription')
              : t('createAgentDescription')}
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[calc(85vh-200px)] bg-white">
          <div className="px-6 pb-4 bg-white">
            <Tabs value={currentTab} onValueChange={setCurrentTab}>
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="basic">{t('basicInfo')}</TabsTrigger>
                <TabsTrigger value="persona">{t('personaConfig')}</TabsTrigger>
                <TabsTrigger value="knowledge">{t('knowledgeConfig')}</TabsTrigger>
                <TabsTrigger value="advanced">{t('advancedConfig')}</TabsTrigger>
              </TabsList>

              {/* 基本資訊 */}
              <TabsContent value="basic" className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="name">{t('name')} *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => updateField('name', e.target.value)}
                    placeholder={t('namePlaceholder')}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">{t('description')} *</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => updateField('description', e.target.value)}
                    placeholder={t('descriptionPlaceholder')}
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">{t('category')} *</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => updateField('category', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={t('selectCategory')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="professional">{t('categories.professional')}</SelectItem>
                      <SelectItem value="creative">{t('categories.creative')}</SelectItem>
                      <SelectItem value="technical">{t('categories.technical')}</SelectItem>
                      <SelectItem value="business">{t('categories.business')}</SelectItem>
                      <SelectItem value="educational">{t('categories.educational')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="isPublic"
                    checked={formData.isPublic}
                    onCheckedChange={(checked) =>
                      updateField('isPublic', checked)
                    }
                  />
                  <Label htmlFor="isPublic" className="cursor-pointer">
                    {t('makePublic')}
                  </Label>
                </div>
              </TabsContent>

              {/* Persona 配置 */}
              <TabsContent value="persona" className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="personaId">{t('persona')} *</Label>
                  {isLoadingPersonas ? (
                    <div className="flex items-center justify-center py-4 border rounded-lg">
                      <Loader2 className="w-5 h-5 animate-spin text-blue-600 mr-2" />
                      <span className="text-sm text-gray-600">載入 Persona 列表...</span>
                    </div>
                  ) : (
                    <Select
                      value={formData.personaId}
                      onValueChange={(value) => updateField('personaId', value)}
                    >
                      <SelectTrigger className="bg-white">
                        <SelectValue placeholder={t('selectPersona')} />
                      </SelectTrigger>
                      <SelectContent className="bg-white">
                        {availablePersonas.length === 0 ? (
                          <div className="text-center py-4 text-sm text-gray-500">
                            尚未建立任何 Persona
                          </div>
                        ) : (
                          availablePersonas.map((persona) => (
                            <SelectItem key={persona.id} value={persona.id}>
                              <div className="flex flex-col">
                                <span className="font-medium">{persona.name}</span>
                                <span className="text-xs text-gray-500">{persona.role} • {persona.language}</span>
                              </div>
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                  )}
                  {formData.personaId && availablePersonas.length > 0 && (
                    <div className="text-xs text-gray-500 mt-2">
                      {(() => {
                        const selectedPersona = availablePersonas.find((p) => p.id === formData.personaId)
                        return selectedPersona ? (
                          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                            <p className="font-medium text-blue-900 mb-1">{selectedPersona.name}</p>
                            <p className="text-blue-700">{selectedPersona.description}</p>
                            <div className="flex gap-2 mt-2">
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                                {selectedPersona.tone}
                              </span>
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                                v{selectedPersona.version}
                              </span>
                            </div>
                          </div>
                        ) : null
                      })()}
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="avatarId">{t('avatar')}</Label>
                  <Select
                    value={formData.avatarId}
                    onValueChange={(value) => updateField('avatarId', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={t('selectAvatar')} />
                    </SelectTrigger>
                    <SelectContent>
                      {/* TODO: 從 API 載入 Avatar 列表 */}
                      <SelectItem value="none">{t('noAvatar')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </TabsContent>

              {/* 知識庫配置 */}
              <TabsContent value="knowledge" className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label>{t('knowledgeBases')}</Label>
                  <p className="text-sm text-gray-500 mb-4">
                    {t('knowledgeBasesDescription') || '選擇要關聯到此 Agent 的知識庫，將增強 Agent 的回答能力'}
                  </p>

                  {isLoadingKnowledge ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
                      <span className="ml-2 text-sm text-gray-600">{t('loading') || '載入中...'}</span>
                    </div>
                  ) : availableKnowledgeBases.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <p className="text-sm">{t('noKnowledgeBases') || '目前沒有可用的知識庫'}</p>
                    </div>
                  ) : (
                    <div className="space-y-3 max-h-[300px] overflow-y-auto border border-gray-200 rounded-lg p-4">
                      {availableKnowledgeBases.map((kb) => (
                        <div
                          key={kb.id}
                          className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          <Checkbox
                            id={`kb-${kb.id}`}
                            checked={formData.knowledgeBaseIds.includes(kb.id)}
                            onCheckedChange={() => toggleKnowledgeBase(kb.id)}
                          />
                          <div className="flex-1 min-w-0">
                            <Label
                              htmlFor={`kb-${kb.id}`}
                              className="cursor-pointer font-medium text-gray-900"
                            >
                              {kb.name}
                            </Label>
                            {kb.description && (
                              <p className="text-xs text-gray-500 mt-1">{kb.description}</p>
                            )}
                            <div className="flex gap-2 mt-2">
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                                {kb.type}
                              </span>
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                                {kb.category}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {formData.knowledgeBaseIds.length > 0 && (
                    <p className="text-sm text-blue-600 mt-2">
                      已選擇 {formData.knowledgeBaseIds.length} 個知識庫
                    </p>
                  )}
                </div>
              </TabsContent>

              {/* 進階配置 */}
              <TabsContent value="advanced" className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="primaryLanguage">{t('primaryLanguage')} *</Label>
                  <Select
                    value={formData.primaryLanguage}
                    onValueChange={(value) => updateField('primaryLanguage', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="zh-TW">繁體中文</SelectItem>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="ja">日本語</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>{t('supportedLanguages')} *</Label>
                  <div className="space-y-2">
                    {['zh-TW', 'en', 'ja'].map((lang) => (
                      <div key={lang} className="flex items-center space-x-2">
                        <Checkbox
                          id={`lang-${lang}`}
                          checked={formData.supportedLanguages.includes(lang)}
                          onCheckedChange={() => toggleLanguage(lang)}
                        />
                        <Label htmlFor={`lang-${lang}`} className="cursor-pointer">
                          {lang === 'zh-TW' && '繁體中文'}
                          {lang === 'en' && 'English'}
                          {lang === 'ja' && '日本語'}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </ScrollArea>

        <DialogFooter className="p-6 pt-4 border-t bg-white">
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={isSubmitting}
          >
            {t('cancel')}
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                {t('submitting')}
              </>
            ) : (
              t(isEditMode ? 'update' : 'create')
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
