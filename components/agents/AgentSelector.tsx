/**
 * Agent 選擇器元件
 * @module components/agents/AgentSelector
 * @description 對話框形式的 Agent 選擇器，支援篩選、搜尋和分類
 */

'use client'

import { useState, useEffect } from 'react'
import { useAgentStore } from '@/stores/agentStore'
import { AgentCard } from './AgentCard'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Bot, Search, Loader2 } from 'lucide-react'
import { useTranslations } from 'next-intl'

interface AgentSelectorProps {
  open?: boolean
  onOpenChange?: (open: boolean) => void
  onSelect?: (agentId: string) => void
  trigger?: React.ReactNode
}

/**
 * Agent 選擇器對話框元件
 */
export function AgentSelector({
  open: controlledOpen,
  onOpenChange,
  onSelect,
  trigger,
}: AgentSelectorProps) {
  const t = useTranslations('agents')
  const [internalOpen, setInternalOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedTab, setSelectedTab] = useState('all')
  // 臨時選中的 Agent (確認前)
  const [tempSelectedAgentId, setTempSelectedAgentId] = useState<string | null>(null)

  const {
    agents,
    currentAgent,
    isLoading,
    loadAgents,
    setCurrentAgent,
  } = useAgentStore()

  // 使用外部控制或內部狀態
  const isOpen = controlledOpen !== undefined ? controlledOpen : internalOpen
  const setOpen = onOpenChange || setInternalOpen

  // 當對話框打開時,初始化臨時選中狀態為當前 Agent
  useEffect(() => {
    if (isOpen) {
      setTempSelectedAgentId(currentAgent?.id || null)
    }
  }, [isOpen, currentAgent])

  // 載入 Agent 列表
  useEffect(() => {
    if (isOpen) {
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
    }
  }, [isOpen, selectedTab, loadAgents])

  // 篩選 Agent
  const filteredAgents = agents.filter((agent) => {
    if (!searchQuery) return true
    const query = searchQuery.toLowerCase()
    return (
      agent.name.toLowerCase().includes(query) ||
      agent.description.toLowerCase().includes(query) ||
      agent.category.toLowerCase().includes(query)
    )
  })

  // 處理點擊 Agent 卡片 (僅更新臨時選中狀態)
  const handleClickAgent = (agent: typeof agents[0]) => {
    console.log('[AgentSelector] Click agent:', agent.name, 'ID:', agent.id)
    setTempSelectedAgentId(agent.id)
  }

  // 處理確認選擇 (執行真正的選擇動作)
  const handleConfirmSelection = () => {
    if (!tempSelectedAgentId) {
      console.warn('[AgentSelector] No agent selected')
      return
    }

    const selectedAgent = agents.find(a => a.id === tempSelectedAgentId)
    if (!selectedAgent) {
      console.error('[AgentSelector] Selected agent not found:', tempSelectedAgentId)
      return
    }

    console.log('[AgentSelector] Confirm selection:', selectedAgent.name, 'ID:', selectedAgent.id)
    console.log('[AgentSelector] Current agent before:', currentAgent?.name)

    // 更新全局狀態
    setCurrentAgent(selectedAgent)

    console.log('[AgentSelector] setCurrentAgent called')
    console.log('[AgentSelector] Calling onSelect callback with ID:', selectedAgent.id)

    // 呼叫 callback
    onSelect?.(selectedAgent.id)

    console.log('[AgentSelector] Closing dialog')
    // 關閉對話框
    setOpen(false)
  }

  // 處理取消選擇
  const handleCancelSelection = () => {
    console.log('[AgentSelector] Cancel selection')
    // 恢復為當前 Agent
    setTempSelectedAgentId(currentAgent?.id || null)
    // 關閉對話框
    setOpen(false)
  }

  return (
    <Dialog open={isOpen} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" className="gap-2">
            <Bot className="w-4 h-4" />
            {currentAgent ? currentAgent.name : t('selectAgent')}
          </Button>
        )}
      </DialogTrigger>

      <DialogContent className="max-w-4xl max-h-[80vh] p-0">
        <DialogHeader className="p-6 pb-4">
          <DialogTitle className="text-2xl">{t('selectAgent')}</DialogTitle>
          <DialogDescription>{t('selectAgentDescription')}</DialogDescription>
        </DialogHeader>

        <div className="px-6">
          {/* 搜尋框 */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder={t('searchAgents')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* 分類標籤 */}
          <Tabs value={selectedTab} onValueChange={setSelectedTab}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="all">{t('allAgents')}</TabsTrigger>
              <TabsTrigger value="system">{t('systemAgents')}</TabsTrigger>
              <TabsTrigger value="public">{t('publicAgents')}</TabsTrigger>
              <TabsTrigger value="my">{t('myAgents')}</TabsTrigger>
            </TabsList>

            <div className="mt-4">
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                </div>
              ) : filteredAgents.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Bot className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>{t('noAgentsFound')}</p>
                </div>
              ) : (
                <ScrollArea className="h-[400px] pr-4">
                  <TabsContent value={selectedTab} className="mt-0 space-y-3">
                    {filteredAgents.map((agent) => (
                      <AgentCard
                        key={agent.id}
                        agent={agent}
                        onSelect={handleClickAgent}
                        selected={tempSelectedAgentId === agent.id}
                        compact
                      />
                    ))}
                  </TabsContent>
                </ScrollArea>
              )}
            </div>
          </Tabs>
        </div>

        <div className="p-6 pt-4 border-t flex justify-between items-center">
          <div className="text-sm text-muted-foreground">
            {filteredAgents.length} {t('agentsFound')}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleCancelSelection}>
              {t('cancel')}
            </Button>
            <Button onClick={handleConfirmSelection} disabled={!tempSelectedAgentId}>
              {t('confirm')}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
