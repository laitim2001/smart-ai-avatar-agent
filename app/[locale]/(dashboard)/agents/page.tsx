/**
 * Agent 市集頁面 (全新設計)
 * @module app/[locale]/(dashboard)/agents/page
 * @description 瀏覽、搜尋和管理 AI Agent 的市集頁面
 */

'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAgentStore } from '@/stores/agentStore'
import { AgentCard } from '@/components/agents/AgentCard'
import { AgentEditor } from '@/components/agents/AgentEditor'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
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
import {
  Bot,
  Search,
  Plus,
  Loader2,
  Filter,
  Star,
  Users,
  Globe,
  Sparkles,
  TrendingUp,
  MessageSquare,
} from 'lucide-react'
import { useTranslations } from 'next-intl'
import { toast } from 'sonner'

/**
 * Agent 市集主頁面
 */
export default function AgentMarketPage() {
  const router = useRouter()
  const t = useTranslations('agents')
  const [searchQuery, setSearchQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [selectedTab, setSelectedTab] = useState('all')
  const [editorOpen, setEditorOpen] = useState(false)
  const [editingAgent, setEditingAgent] = useState<any>(null)
  const [deletingAgent, setDeletingAgent] = useState<any>(null)

  const {
    agents,
    isLoading,
    error,
    loadAgents,
    deleteAgent,
    setCurrentAgent,
  } = useAgentStore()

  // 載入 Agent 列表
  useEffect(() => {
    if (selectedTab === 'all') {
      loadAgents()
    } else if (selectedTab === 'system') {
      loadAgents({ isSystem: true })
    } else if (selectedTab === 'public') {
      loadAgents({ isPublic: true })
    } else if (selectedTab === 'my') {
      // TODO: 需要 session 來獲取 userId
      loadAgents()
    }
  }, [selectedTab, loadAgents])

  // 篩選 Agent
  const filteredAgents = agents.filter((agent) => {
    // 搜尋過濾
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      const matchesSearch =
        agent.name.toLowerCase().includes(query) ||
        agent.description.toLowerCase().includes(query)
      if (!matchesSearch) return false
    }

    // 類別過濾
    if (categoryFilter !== 'all' && agent.category !== categoryFilter) {
      return false
    }

    return true
  })

  // 統計數據
  const stats = [
    {
      label: t('stats.totalAgents'),
      value: agents.length,
      icon: Bot,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      label: t('stats.systemAgents'),
      value: agents.filter((a) => a.isSystem).length,
      icon: Star,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
    },
    {
      label: t('stats.publicAgents'),
      value: agents.filter((a) => a.isPublic).length,
      icon: Globe,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      label: t('stats.totalConversations'),
      value: agents.reduce((sum, a) => sum + (a.conversationsCount || 0), 0),
      icon: MessageSquare,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
  ]

  // 熱門 Agent (依對話數排序)
  const popularAgents = [...agents]
    .sort((a, b) => (b.conversationsCount || 0) - (a.conversationsCount || 0))
    .slice(0, 3)

  // 處理編輯 Agent
  const handleEdit = (agent: any) => {
    setEditingAgent(agent)
    setEditorOpen(true)
  }

  // 處理刪除 Agent
  const handleDeleteClick = (agent: any) => {
    setDeletingAgent(agent)
  }

  const confirmDelete = async () => {
    if (!deletingAgent) return

    const success = await deleteAgent(deletingAgent.id)
    if (success) {
      toast.success(t('deleteSuccess'))
    } else {
      toast.error(error || t('errors.deleteFailed'))
    }
    setDeletingAgent(null)
  }

  // 處理 Agent 選擇（用於對話）
  const handleSelect = async (agent: any) => {
    try {
      // 1. 設定當前 Agent 到 Store
      setCurrentAgent(agent)

      // 2. 建立新對話並關聯此 Agent
      const response = await fetch('/api/conversations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: `與 ${agent.name} 的對話`,
          avatarId: agent.avatar?.id || null,
          agentId: agent.id, // 關聯 Agent
        }),
      })

      if (!response.ok) {
        throw new Error('建立對話失敗')
      }

      const data = await response.json()
      const newConversation = data.conversation

      // 3. 跳轉到對話頁面
      toast.success(t('selectedForConversation', { name: agent.name }))
      router.push(`/conversations?id=${newConversation.id}`)
    } catch (error) {
      console.error('[Agent Select Error]', error)
      toast.error('無法開始對話，請稍後再試')
    }
  }

  return (
    <div className="space-y-6">
      {/* 頁面標題區塊 (漸層背景) */}
      <div className="rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 p-8 text-white shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold flex items-center gap-3">
              <Bot className="w-10 h-10" />
              {t('agentMarket')}
            </h1>
            <p className="text-blue-100 mt-2 text-lg">
              {t('agentMarketDescription')}
            </p>
          </div>

          <AgentEditor
            open={editorOpen}
            onOpenChange={setEditorOpen}
            agent={editingAgent}
            onSuccess={() => {
              setEditingAgent(null)
              loadAgents()
            }}
            trigger={
              <Button
                size="lg"
                className="gap-2 bg-white text-blue-600 hover:bg-blue-50"
              >
                <Plus className="w-5 h-5" />
                {t('createAgent')}
              </Button>
            }
          />
        </div>
      </div>

      {/* 統計卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <div
              key={stat.label}
              className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">{stat.label}</p>
                  <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                </div>
                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-full ${stat.bgColor}`}
                >
                  <Icon className={`h-6 w-6 ${stat.color}`} />
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* 熱門 Agent 推薦 */}
      {popularAgents.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-orange-600" />
            <h2 className="text-xl font-semibold text-gray-900">
              {t('popularAgents')}
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {popularAgents.map((agent) => (
              <div
                key={agent.id}
                className="group relative bg-gradient-to-br from-orange-50 to-red-50 p-6 rounded-lg border-2 border-orange-200 hover:border-orange-400 hover:shadow-lg transition-all cursor-pointer"
                onClick={() => handleSelect(agent)}
              >
                <div className="absolute top-3 right-3">
                  <Sparkles className="w-5 h-5 text-orange-500" />
                </div>
                <div className="flex items-start gap-4">
                  {agent.avatar && (
                    <div className="flex-shrink-0 w-16 h-16 rounded-full overflow-hidden bg-white border-2 border-orange-200">
                      <img
                        src={agent.avatar.thumbnail || agent.avatar.url}
                        alt={agent.avatar.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 group-hover:text-orange-600 transition-colors">
                      {agent.name}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                      {agent.description}
                    </p>
                    <div className="flex items-center gap-3 mt-2 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <MessageSquare className="w-4 h-4" />
                        {agent.conversationsCount || 0}
                      </span>
                      {agent.isSystem && (
                        <span className="flex items-center gap-1 text-yellow-600">
                          <Star className="w-4 h-4" />
                          {t('system')}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 搜尋和篩選 */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder={t('searchAgents')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-full sm:w-[200px]">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue placeholder={t('selectCategory')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('allCategories')}</SelectItem>
            <SelectItem value="professional">{t('categories.professional')}</SelectItem>
            <SelectItem value="creative">{t('categories.creative')}</SelectItem>
            <SelectItem value="technical">{t('categories.technical')}</SelectItem>
            <SelectItem value="business">{t('categories.business')}</SelectItem>
            <SelectItem value="educational">{t('categories.educational')}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* 分類標籤 */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid w-full grid-cols-4 max-w-2xl">
          <TabsTrigger value="all">{t('allAgents')}</TabsTrigger>
          <TabsTrigger value="system">{t('systemAgents')}</TabsTrigger>
          <TabsTrigger value="public">{t('publicAgents')}</TabsTrigger>
          <TabsTrigger value="my">{t('myAgents')}</TabsTrigger>
        </TabsList>

        {/* 載入狀態 */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        ) : filteredAgents.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-lg border border-gray-200">
            <Bot className="w-16 h-16 mx-auto mb-4 opacity-50 text-gray-400" />
            <p className="text-lg text-gray-600 mb-4">
              {t('noAgentsFound')}
            </p>
            <Button
              variant="outline"
              onClick={() => {
                setSearchQuery('')
                setCategoryFilter('all')
              }}
            >
              {t('clearFilters')}
            </Button>
          </div>
        ) : (
          <TabsContent value={selectedTab} className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredAgents.map((agent) => (
                <AgentCard
                  key={agent.id}
                  agent={agent}
                  onSelect={handleSelect}
                  onEdit={handleEdit}
                  onDelete={handleDeleteClick}
                  showActions
                />
              ))}
            </div>
          </TabsContent>
        )}
      </Tabs>

      {/* 使用指南 */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
          <Users className="h-5 w-5" />
          {t('guide.title')}
        </h3>
        <ul className="space-y-2 text-sm text-blue-800">
          <li>• {t('guide.selectAgent')}</li>
          <li>• {t('guide.createCustom')}</li>
          <li>• {t('guide.configurePersona')}</li>
          <li>• {t('guide.linkKnowledge')}</li>
        </ul>
      </div>

      {/* 刪除確認對話框 */}
      <AlertDialog
        open={!!deletingAgent}
        onOpenChange={(open) => !open && setDeletingAgent(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('deleteConfirmTitle')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('deleteConfirmDescription', { name: deletingAgent?.name })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('cancel')}</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {t('delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
