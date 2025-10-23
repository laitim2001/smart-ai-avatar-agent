/**
 * Agent 表單元件（通用）
 * @module components/agents/AgentForm
 * @description 用於建立和編輯 Agent 的完整表單，可在獨立頁面使用
 */

'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAgentStore, Agent } from '@/stores/agentStore'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Bot, Loader2, Save, X, ArrowLeft } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { toast } from 'sonner'

interface AgentFormProps {
  agent?: Agent // 如果提供則為編輯模式，否則為建立模式
  onSuccess?: (agent: Agent) => void
  onCancel?: () => void
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
  knowledgeBaseIds: string[]
}

interface KnowledgeBase {
  id: string
  name: string
  description: string | null
  type: string
  category: string
}

interface Avatar {
  id: string
  name: string
  description: string
  thumbnail: string | null
  category: string
}

interface Persona {
  id: string
  name: string
  role: string
  description: string | null
  language: string
  tone: string
  capabilities: string[]
}

/**
 * Agent 表單元件
 */
export function AgentForm({ agent, onSuccess, onCancel }: AgentFormProps) {
  const router = useRouter()
  const t = useTranslations('agents')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [currentTab, setCurrentTab] = useState('basic')
  const [availableKnowledgeBases, setAvailableKnowledgeBases] = useState<KnowledgeBase[]>([])
  const [isLoadingKnowledge, setIsLoadingKnowledge] = useState(false)
  const [availableAvatars, setAvailableAvatars] = useState<Avatar[]>([])
  const [isLoadingAvatars, setIsLoadingAvatars] = useState(false)
  const [availablePersonas, setAvailablePersonas] = useState<Persona[]>([])
  const [isLoadingPersonas, setIsLoadingPersonas] = useState(false)

  const { createAgent, updateAgent, error, clearError } = useAgentStore()

  const isEditMode = !!agent

  // 表單資料
  const [formData, setFormData] = useState<AgentFormData>({
    name: agent?.name || '',
    description: agent?.description || '',
    category: agent?.category || 'professional',
    personaId: agent?.persona?.id || '',
    avatarId: agent?.avatar?.id || 'none', // 如果沒有 Avatar,預設為 "none"
    primaryLanguage: agent?.primaryLanguage || 'zh-TW',
    supportedLanguages: agent?.supportedLanguages || ['zh-TW'],
    isPublic: agent?.isPublic || false,
    knowledgeBaseIds: [],
  })

  // 載入知識庫、Avatar 和 Persona 列表
  useEffect(() => {
    loadKnowledgeBases()
    loadAvatars()
    loadPersonas()
    if (agent) {
      loadAgentKnowledgeBases(agent.id)
    }
  }, [agent])

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
      console.error('[AgentForm] Load knowledge bases error:', error)
      toast.error(t('errors.loadKnowledgeFailed') || '載入知識庫失敗')
    } finally {
      setIsLoadingKnowledge(false)
    }
  }

  const loadAvatars = async () => {
    try {
      setIsLoadingAvatars(true)
      const response = await fetch('/api/avatars')

      if (!response.ok) {
        throw new Error('Failed to load avatars')
      }

      const data = await response.json()
      setAvailableAvatars(data.avatars || [])
    } catch (error) {
      console.error('[AgentForm] Load avatars error:', error)
      toast.error(t('errors.loadAvatarsFailed') || '載入虛擬角色失敗')
    } finally {
      setIsLoadingAvatars(false)
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
      console.error('[AgentForm] Load personas error:', error)
      toast.error(t('errors.loadPersonasFailed') || '載入 Persona 失敗')
    } finally {
      setIsLoadingPersonas(false)
    }
  }

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
      console.error('[AgentForm] Load agent knowledge bases error:', error)
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
      toast.error(t('errors.nameRequired') || '請輸入 Agent 名稱')
      setCurrentTab('basic')
      return false
    }
    if (!formData.description.trim()) {
      toast.error(t('errors.descriptionRequired') || '請輸入 Agent 描述')
      setCurrentTab('basic')
      return false
    }
    if (!formData.personaId) {
      toast.error(t('errors.personaRequired') || '請選擇 Persona')
      setCurrentTab('persona')
      return false
    }
    if (formData.supportedLanguages.length === 0) {
      toast.error(t('errors.languageRequired') || '請至少選擇一種語言')
      setCurrentTab('advanced')
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

      // 準備提交資料：將 "none" 轉換為空字串
      const submitData = {
        ...formData,
        avatarId: formData.avatarId === 'none' ? '' : formData.avatarId,
      }

      if (isEditMode && agent) {
        // 更新模式
        result = await updateAgent(agent.id, submitData)
      } else {
        // 建立模式
        result = await createAgent(submitData)
      }

      if (result) {
        // 如果有選擇知識庫，則關聯知識庫
        if (formData.knowledgeBaseIds.length > 0) {
          await linkKnowledgeBases(result.id, formData.knowledgeBaseIds)
        }

        toast.success(
          isEditMode ? t('updateSuccess') || 'Agent 更新成功！' : t('createSuccess') || 'Agent 建立成功！'
        )

        // 調用 onSuccess 回調
        onSuccess?.(result)

        // 如果沒有 onSuccess，則導航到 agents 頁面
        if (!onSuccess) {
          router.push('/agents')
        }
      } else {
        toast.error(error || t('errors.submitFailed') || '操作失敗')
      }
    } catch (err) {
      console.error('[AgentForm Submit Error]', err)
      toast.error(t('errors.submitFailed') || '操作失敗')
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
        console.error(`[AgentForm] Failed to link knowledge ${knowledgeBaseId}:`, error)
      }
    }
  }

  // 取消操作
  const handleCancel = () => {
    if (onCancel) {
      onCancel()
    } else {
      router.back()
    }
  }

  return (
    <div className="space-y-6">
      {/* 頁面標題 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={handleCancel}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            返回
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <Bot className="w-8 h-8 text-blue-600" />
              {isEditMode ? t('editAgent') || '編輯 Agent' : t('createAgent') || '建立 Agent'}
            </h1>
            <p className="text-gray-600 mt-2">
              {isEditMode
                ? t('editAgentDescription') || '編輯 AI Agent 的配置與知識庫'
                : t('createAgentDescription') || '建立一個全新的 AI Agent，配置個性化設定'}
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" onClick={handleCancel} disabled={isSubmitting}>
            <X className="w-4 h-4 mr-2" />
            取消
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                {isEditMode ? '更新中...' : '建立中...'}
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                {isEditMode ? '儲存變更' : '建立 Agent'}
              </>
            )}
          </Button>
        </div>
      </div>

      {/* 表單內容 */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
        <Tabs value={currentTab} onValueChange={setCurrentTab}>
          <div className="border-b border-gray-200 px-6 pt-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="basic">{t('basicInfo') || '基本資訊'}</TabsTrigger>
              <TabsTrigger value="persona">{t('personaConfig') || 'Persona 配置'}</TabsTrigger>
              <TabsTrigger value="knowledge">{t('knowledgeConfig') || '知識庫配置'}</TabsTrigger>
              <TabsTrigger value="advanced">{t('advancedConfig') || '進階配置'}</TabsTrigger>
            </TabsList>
          </div>

          <div className="p-6">
            {/* 基本資訊 */}
            <TabsContent value="basic" className="space-y-4 mt-0">
              <div className="space-y-2">
                <Label htmlFor="name">{t('name') || 'Agent 名稱'} *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => updateField('name', e.target.value)}
                  placeholder={t('namePlaceholder') || '例如：專業商務顧問'}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">{t('description') || 'Agent 描述'} *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => updateField('description', e.target.value)}
                  placeholder={t('descriptionPlaceholder') || '描述這個 Agent 的特色與專長...'}
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">{t('category') || '類別'} *</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => updateField('category', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t('selectCategory') || '選擇類別'} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="professional">{t('categories.professional') || '專業'}</SelectItem>
                    <SelectItem value="creative">{t('categories.creative') || '創意'}</SelectItem>
                    <SelectItem value="technical">{t('categories.technical') || '技術'}</SelectItem>
                    <SelectItem value="business">{t('categories.business') || '商務'}</SelectItem>
                    <SelectItem value="educational">{t('categories.educational') || '教育'}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="isPublic"
                  checked={formData.isPublic}
                  onCheckedChange={(checked) => updateField('isPublic', checked)}
                />
                <Label htmlFor="isPublic" className="cursor-pointer">
                  {t('makePublic') || '設為公開（其他用戶可以使用）'}
                </Label>
              </div>
            </TabsContent>

            {/* Persona 配置 */}
            <TabsContent value="persona" className="space-y-4 mt-0">
              <div className="space-y-2">
                <Label htmlFor="personaId">{t('persona') || 'Persona'} *</Label>
                {isLoadingPersonas ? (
                  <div className="flex items-center justify-center py-4 border rounded-md">
                    <Loader2 className="w-4 h-4 animate-spin text-blue-600 mr-2" />
                    <span className="text-sm text-gray-600">載入 Persona...</span>
                  </div>
                ) : (
                  <Select
                    value={formData.personaId}
                    onValueChange={(value) => updateField('personaId', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={t('selectPersona') || '選擇 Persona'} />
                    </SelectTrigger>
                    <SelectContent>
                      {availablePersonas.map((persona) => (
                        <SelectItem key={persona.id} value={persona.id}>
                          {persona.name} - {persona.role}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
                <p className="text-sm text-gray-500">
                  Persona 定義了 Agent 的角色、專業領域和溝通風格
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="avatarId">{t('avatar') || 'Avatar 外觀'}</Label>
                {isLoadingAvatars ? (
                  <div className="flex items-center justify-center py-4 border rounded-md">
                    <Loader2 className="w-4 h-4 animate-spin text-blue-600 mr-2" />
                    <span className="text-sm text-gray-600">載入 Avatar...</span>
                  </div>
                ) : (
                  <Select
                    value={formData.avatarId}
                    onValueChange={(value) => updateField('avatarId', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={t('selectAvatar') || '選擇 Avatar'} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">{t('noAvatar') || '無 Avatar'}</SelectItem>
                      {availableAvatars.map((avatar) => (
                        <SelectItem key={avatar.id} value={avatar.id}>
                          {avatar.thumbnail} {avatar.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
                <p className="text-sm text-gray-500">
                  選擇 3D 虛擬角色外觀（可選）
                </p>
              </div>
            </TabsContent>

            {/* 知識庫配置 */}
            <TabsContent value="knowledge" className="space-y-4 mt-0">
              <div className="space-y-2">
                <Label>{t('knowledgeBases') || '知識庫'}</Label>
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
                  <div className="space-y-3 max-h-[400px] overflow-y-auto border border-gray-200 rounded-lg p-4">
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
            <TabsContent value="advanced" className="space-y-4 mt-0">
              <div className="space-y-2">
                <Label htmlFor="primaryLanguage">{t('primaryLanguage') || '主要語言'}</Label>
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
                <Label>{t('supportedLanguages') || '支援語言'} *</Label>
                <div className="space-y-2">
                  {['zh-TW', 'en', 'ja'].map((lang) => (
                    <div key={lang} className="flex items-center space-x-2">
                      <Checkbox
                        id={`lang-${lang}`}
                        checked={formData.supportedLanguages.includes(lang)}
                        onCheckedChange={() => toggleLanguage(lang)}
                      />
                      <Label htmlFor={`lang-${lang}`} className="cursor-pointer">
                        {lang === 'zh-TW' ? '繁體中文' : lang === 'en' ? 'English' : '日本語'}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  )
}
