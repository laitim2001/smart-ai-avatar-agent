/**
 * Persona 管理頁面
 * @module app/[locale]/(dashboard)/knowledge/persona/page
 * @description 瀏覽、建立、編輯、刪除 Persona 的完整管理介面
 */

'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Users, Search, Plus, Loader2, Bot, Globe, CheckCircle, AlertCircle, TrendingUp } from 'lucide-react'
import { PersonaCard } from '@/components/knowledge/PersonaCard'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { toast } from 'sonner'
import { useTranslations } from 'next-intl'

interface Persona {
  id: string
  name: string
  role: string
  description: string
  systemPrompt: string
  language: string
  tone: string
  style?: string[]
  capabilities?: string[]
  restrictions?: string[]
  version: string
  isActive: boolean
  _count?: {
    agents: number
  }
  agents?: any[]
  createdAt: string
  updatedAt: string
}

/**
 * Persona 管理主頁面
 */
export default function PersonaManagementPage() {
  const router = useRouter()
  const t = useTranslations()
  const [personas, setPersonas] = useState<Persona[]>([])
  const [filteredPersonas, setFilteredPersonas] = useState<Persona[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [languageFilter, setLanguageFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')

  // 刪除狀態
  const [deletingPersona, setDeletingPersona] = useState<{
    persona: Persona
    linkedAgents: any[]
    canDelete: boolean
  } | null>(null)

  // 載入 Persona 列表
  const loadPersonas = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/personas')
      const data = await response.json()

      if (data.success) {
        // 載入完整資料（包含 Agent 數量）
        const personasWithCount = await Promise.all(
          data.data.map(async (persona: Persona) => {
            try {
              const agentsResponse = await fetch(`/api/personas/${persona.id}/agents`)
              const agentsData = await agentsResponse.json()
              return {
                ...persona,
                _count: { agents: agentsData.total || 0 },
                agents: agentsData.data || [],
              }
            } catch {
              return { ...persona, _count: { agents: 0 }, agents: [] }
            }
          })
        )
        setPersonas(personasWithCount)
        setFilteredPersonas(personasWithCount)
      } else {
        toast.error(t('persona.messages.loadFailed'))
      }
    } catch (error) {
      console.error('[Load Personas Error]', error)
      toast.error(t('persona.messages.loadFailed'))
    } finally {
      setIsLoading(false)
    }
  }

  // 初始載入
  useEffect(() => {
    loadPersonas()
  }, [])

  // 篩選邏輯
  useEffect(() => {
    let result = [...personas]

    // 搜尋過濾
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      result = result.filter(
        (persona) =>
          persona.name.toLowerCase().includes(query) ||
          persona.role.toLowerCase().includes(query) ||
          persona.description.toLowerCase().includes(query) ||
          persona.capabilities?.some((cap) => cap.toLowerCase().includes(query))
      )
    }

    // 語言過濾
    if (languageFilter !== 'all') {
      result = result.filter((persona) => persona.language === languageFilter)
    }

    // 狀態過濾
    if (statusFilter === 'active') {
      result = result.filter((persona) => persona.isActive)
    } else if (statusFilter === 'inactive') {
      result = result.filter((persona) => !persona.isActive)
    }

    setFilteredPersonas(result)
  }, [searchQuery, languageFilter, statusFilter, personas])

  // 統計資料
  const totalPersonas = personas.length
  const totalLinkedAgents = personas.reduce((sum, p) => sum + (p._count?.agents || 0), 0)
  const uniqueLanguages = [...new Set(personas.map((p) => p.language))].length
  const activePersonas = personas.filter((p) => p.isActive).length

  // 處理建立 Persona - 導航到獨立頁面
  const handleCreate = () => {
    router.push('/knowledge/persona/new')
  }

  // 處理編輯 Persona - 導航到獨立頁面
  const handleEdit = (persona: Persona) => {
    router.push(`/knowledge/persona/${persona.id}/edit`)
  }

  // 處理刪除 Persona（顯示確認對話框）
  const handleDelete = async (persona: Persona) => {
    try {
      // 檢查關聯的 Agent
      const response = await fetch(`/api/personas/${persona.id}/agents`)
      const data = await response.json()

      if (data.success) {
        setDeletingPersona({
          persona,
          linkedAgents: data.data || [],
          canDelete: data.total === 0,
        })
      }
    } catch (error) {
      console.error('[Check Linked Agents Error]', error)
      toast.error(t('persona.messages.loadFailed'))
    }
  }

  // 確認刪除 Persona
  const confirmDelete = async () => {
    if (!deletingPersona || !deletingPersona.canDelete) return

    try {
      const response = await fetch(`/api/personas/${deletingPersona.persona.id}`, {
        method: 'DELETE',
      })

      const data = await response.json()

      if (data.success) {
        toast.success(t('persona.messages.deleted'))
        loadPersonas() // 重新載入列表
      } else {
        toast.error(data.error?.message || t('button.delete'))
      }
    } catch (error) {
      console.error('[Delete Persona Error]', error)
      toast.error(t('persona.messages.loadFailed'))
    } finally {
      setDeletingPersona(null)
    }
  }

  return (
    <div className="space-y-6">
      {/* 頁面標題區塊 */}
      <div className="rounded-lg bg-gradient-to-r from-purple-600 to-blue-600 p-8 text-white shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold flex items-center gap-3">
              <Users className="w-10 h-10" />
              {t('persona.title')}
            </h1>
            <p className="text-purple-100 mt-2 text-lg">
              {t('persona.description')}
            </p>
          </div>

          <Button
            size="lg"
            className="gap-2 bg-white text-purple-600 hover:bg-purple-50"
            onClick={handleCreate}
          >
            <Plus className="w-5 h-5" />
            {t('persona.create')}
          </Button>
        </div>
      </div>

      {/* 統計卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">{t('persona.stats.total')}</p>
              <p className="text-3xl font-bold text-gray-900">{totalPersonas}</p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-50">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">{t('persona.stats.linkedAgents')}</p>
              <p className="text-3xl font-bold text-gray-900">{totalLinkedAgents}</p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-50">
              <Bot className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">{t('persona.stats.languages')}</p>
              <p className="text-3xl font-bold text-gray-900">{uniqueLanguages}</p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-purple-50">
              <Globe className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">{t('persona.stats.active')}</p>
              <p className="text-3xl font-bold text-gray-900">{activePersonas}</p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-yellow-50">
              <CheckCircle className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
        </div>
      </div>

      {/* 搜尋和篩選 */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder={t('persona.searchPlaceholder')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        <Select value={languageFilter} onValueChange={setLanguageFilter}>
          <SelectTrigger className="w-full sm:w-[180px] bg-white">
            <SelectValue placeholder={t('persona.filters.language')} />
          </SelectTrigger>
          <SelectContent className="bg-white">
            <SelectItem value="all">{t('persona.filters.allLanguages')}</SelectItem>
            <SelectItem value="zh-TW">{t('persona.languages.zhTW')}</SelectItem>
            <SelectItem value="en">{t('persona.languages.en')}</SelectItem>
            <SelectItem value="ja">{t('persona.languages.ja')}</SelectItem>
          </SelectContent>
        </Select>

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-[180px] bg-white">
            <SelectValue placeholder={t('button.filter')} />
          </SelectTrigger>
          <SelectContent className="bg-white">
            <SelectItem value="all">{t('persona.filters.allStatus')}</SelectItem>
            <SelectItem value="active">{t('persona.filters.active')}</SelectItem>
            <SelectItem value="inactive">{t('persona.filters.inactive')}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Persona 列表 */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
        </div>
      ) : filteredPersonas.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-lg border border-gray-200">
          <Users className="w-16 h-16 mx-auto mb-4 opacity-50 text-gray-400" />
          <p className="text-lg text-gray-600 mb-4">
            {searchQuery || languageFilter !== 'all' || statusFilter !== 'all'
              ? t('persona.noMatch')
              : t('persona.noPersonas')}
          </p>
          <Button
            variant="outline"
            onClick={() => {
              setSearchQuery('')
              setLanguageFilter('all')
              setStatusFilter('all')
            }}
          >
            {t('persona.clearFilters')}
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPersonas.map((persona) => (
            <PersonaCard
              key={persona.id}
              persona={persona}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {/* 使用指南 */}
      <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
        <h3 className="font-semibold text-purple-900 mb-3 flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          {t('persona.guide.title')}
        </h3>
        <ul className="space-y-2 text-sm text-purple-800">
          <li>• {t('persona.guide.1')}</li>
          <li>• {t('persona.guide.2')}</li>
          <li>• {t('persona.guide.3')}</li>
          <li>• {t('persona.guide.4')}</li>
        </ul>
      </div>

      {/* 刪除確認對話框 */}
      <AlertDialog
        open={!!deletingPersona}
        onOpenChange={(open) => !open && setDeletingPersona(null)}
      >
        <AlertDialogContent className="bg-white">
          <AlertDialogHeader>
            <AlertDialogTitle className={deletingPersona?.canDelete ? '' : 'flex items-center gap-2 text-orange-600'}>
              {deletingPersona?.canDelete ? (
                t('persona.deleteDialog.title')
              ) : (
                <>
                  <AlertCircle className="w-5 h-5" />
                  {t('persona.deleteDialog.cannotDelete')}
                </>
              )}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {deletingPersona?.canDelete ? (
                <div>
                  {t('persona.deleteDialog.description', { name: deletingPersona.persona.name })}
                </div>
              ) : (
                <div className="space-y-3">
                  <p>
                    {t('persona.deleteDialog.inUse', {
                      name: deletingPersona?.persona.name,
                      count: deletingPersona?.linkedAgents.length
                    })}
                  </p>

                  <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 max-h-[200px] overflow-y-auto">
                    <ul className="space-y-2">
                      {deletingPersona?.linkedAgents.map((agent) => (
                        <li key={agent.id} className="flex items-center gap-2 text-sm">
                          <Bot className="w-4 h-4 text-orange-600" />
                          <span className="font-medium">{agent.name}</span>
                          <span className="text-gray-500">({agent.category})</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <p className="text-sm text-gray-600">
                    {t('persona.deleteDialog.tip')}
                  </p>
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{deletingPersona?.canDelete ? t('button.cancel') : t('persona.deleteDialog.understand')}</AlertDialogCancel>
            {deletingPersona?.canDelete && (
              <AlertDialogAction
                onClick={confirmDelete}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                {t('persona.deleteDialog.confirmDelete')}
              </AlertDialogAction>
            )}
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
