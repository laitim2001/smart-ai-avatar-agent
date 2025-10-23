/**
 * Agent 卡片元件 (全新設計)
 * @module components/agents/AgentCard
 * @description 顯示 Agent 的基本資訊卡片，支援選擇、編輯、刪除操作
 */

'use client'

import { Agent } from '@/stores/agentStore'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { User, Globe, Lock, Star, MessageCircle, Brain, Languages, Sparkles, Edit, Trash2 } from 'lucide-react'
import { useTranslations } from 'next-intl'

interface AgentCardProps {
  agent: Agent
  onSelect?: (agent: Agent) => void
  onEdit?: (agent: Agent) => void
  onDelete?: (agent: Agent) => void
  showActions?: boolean
  selected?: boolean
  compact?: boolean
}

/**
 * Agent 卡片元件
 */
export function AgentCard({
  agent,
  onSelect,
  onEdit,
  onDelete,
  showActions = false,
  selected = false,
  compact = false,
}: AgentCardProps) {
  const t = useTranslations('agents')

  // 類別顏色映射 (更豐富的配色)
  const categoryColors: Record<string, { bg: string; text: string; border: string }> = {
    professional: {
      bg: 'bg-blue-100',
      text: 'text-blue-800',
      border: 'border-blue-200',
    },
    creative: {
      bg: 'bg-purple-100',
      text: 'text-purple-800',
      border: 'border-purple-200',
    },
    technical: {
      bg: 'bg-green-100',
      text: 'text-green-800',
      border: 'border-green-200',
    },
    business: {
      bg: 'bg-orange-100',
      text: 'text-orange-800',
      border: 'border-orange-200',
    },
    educational: {
      bg: 'bg-pink-100',
      text: 'text-pink-800',
      border: 'border-pink-200',
    },
  }

  const categoryConfig =
    categoryColors[agent.category] || categoryColors.professional

  return (
    <Card
      className={`group relative transition-all duration-200 ${
        selected
          ? 'ring-4 ring-blue-500 bg-blue-50 shadow-xl scale-105 border-blue-500'
          : 'hover:shadow-xl hover:border-blue-300 hover:scale-102'
      } ${compact ? 'p-3' : ''} ${
        onSelect && compact ? 'cursor-pointer active:scale-100' : ''
      } overflow-hidden`}
      onClick={() => {
        if (onSelect && compact) {
          console.log('[AgentCard] Clicked:', agent.name, 'ID:', agent.id)
          onSelect(agent)
        }
      }}
    >
      {/* 背景漸層效果 */}
      <div
        className={`absolute top-0 left-0 right-0 h-24 ${
          categoryConfig.bg
        } opacity-20 blur-2xl transition-opacity group-hover:opacity-30`}
      />

      <CardHeader className={compact ? 'p-3 pb-2' : 'relative'}>
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              {agent.isSystem && (
                <Badge
                  variant="secondary"
                  className="text-xs bg-yellow-100 text-yellow-800 border-yellow-200"
                >
                  <Star className="w-3 h-3 mr-1 fill-yellow-600" />
                  {t('system')}
                </Badge>
              )}
              <Badge
                className={`${categoryConfig.bg} ${categoryConfig.text} border ${categoryConfig.border}`}
              >
                {agent.category}
              </Badge>
              {agent.isPublic ? (
                <Globe className="w-4 h-4 text-green-500" title="公開" />
              ) : (
                <Lock className="w-4 h-4 text-gray-400" title="私人" />
              )}
            </div>
            <CardTitle
              className={`${
                compact ? 'text-base' : 'text-xl'
              } group-hover:text-blue-600 transition-colors`}
            >
              {agent.name}
            </CardTitle>
          </div>
          {agent.avatar && (
            <div className="flex-shrink-0 w-14 h-14 rounded-full overflow-hidden bg-gradient-to-br from-blue-100 to-purple-100 border-2 border-white shadow-md flex items-center justify-center">
              {agent.avatar.thumbnail ? (
                // 如果是 emoji thumbnail,直接顯示
                typeof agent.avatar.thumbnail === 'string' && agent.avatar.thumbnail.length <= 4 ? (
                  <span className="text-3xl">{agent.avatar.thumbnail}</span>
                ) : (
                  <img
                    src={agent.avatar.thumbnail || agent.avatar.url}
                    alt={agent.avatar.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      // Fallback to bot emoji
                      const parent = e.currentTarget.parentElement
                      if (parent) {
                        parent.innerHTML = '<span class="text-3xl">🤖</span>'
                      }
                    }}
                  />
                )
              ) : (
                <span className="text-3xl">🤖</span>
              )}
            </div>
          )}
        </div>
        {!compact && (
          <CardDescription className="mt-2 line-clamp-2 text-gray-600">
            {agent.description}
          </CardDescription>
        )}
      </CardHeader>

      {!compact && (
        <CardContent className="space-y-3 relative">
          {/* Persona 資訊 */}
          {agent.persona && (
            <div className="flex items-start gap-2 text-sm p-2 bg-gray-50 rounded-md">
              <User className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="font-medium text-gray-900">
                  {agent.persona.name}
                </div>
                <div className="text-gray-600 text-xs">{agent.persona.role}</div>
              </div>
            </div>
          )}

          {/* 語言支援 */}
          <div className="flex items-center gap-2 text-sm">
            <Languages className="w-4 h-4 text-gray-500 flex-shrink-0" />
            <div className="flex-1 flex flex-wrap gap-1">
              {agent.supportedLanguages?.map((lang) => (
                <Badge
                  key={lang}
                  variant="outline"
                  className="text-xs bg-white"
                >
                  {lang}
                </Badge>
              ))}
            </div>
          </div>

          {/* 統計資訊 */}
          <div className="flex items-center gap-4 text-sm border-t pt-3">
            {agent.knowledgeBasesCount !== undefined && (
              <div className="flex items-center gap-1 text-gray-600">
                <Brain className="w-4 h-4 text-purple-500" />
                <span className="font-medium">{agent.knowledgeBasesCount}</span>
                <span className="text-xs">知識庫</span>
              </div>
            )}
            {agent.conversationsCount !== undefined && (
              <div className="flex items-center gap-1 text-gray-600">
                <MessageCircle className="w-4 h-4 text-green-500" />
                <span className="font-medium">{agent.conversationsCount}</span>
                <span className="text-xs">對話</span>
              </div>
            )}
            {agent.popularity !== undefined && agent.popularity > 0 && (
              <div className="flex items-center gap-1 text-gray-600">
                <Sparkles className="w-4 h-4 text-orange-500" />
                <span className="font-medium">{agent.popularity}</span>
                <span className="text-xs">人氣</span>
              </div>
            )}
          </div>
        </CardContent>
      )}

      {showActions && (
        <CardFooter
          className={`flex gap-2 border-t bg-gray-50 ${
            compact ? 'p-3 pt-2' : 'p-4'
          }`}
        >
          <Button
            variant="default"
            size="sm"
            className="flex-1 gap-1"
            onClick={(e) => {
              e.stopPropagation()
              onSelect?.(agent)
            }}
          >
            <MessageCircle className="w-4 h-4" />
            {t('select')}
          </Button>
          {onEdit && !agent.isSystem && (
            <Button
              variant="outline"
              size="sm"
              onClick={(e) => {
                e.stopPropagation()
                onEdit(agent)
              }}
            >
              <Edit className="w-4 h-4" />
            </Button>
          )}
          {onDelete && !agent.isSystem && (
            <Button
              variant="destructive"
              size="sm"
              onClick={(e) => {
                e.stopPropagation()
                onDelete(agent)
              }}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          )}
        </CardFooter>
      )}
    </Card>
  )
}
