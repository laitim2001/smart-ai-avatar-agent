/**
 * PersonaCard 元件
 * @module components/knowledge/PersonaCard
 * @description 卡片式顯示單一 Persona 的詳細資訊
 */

'use client'

import { Bot, Edit, Trash, Sparkles, Globe, CheckCircle, XCircle } from 'lucide-react'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

interface PersonaCardProps {
  persona: {
    id: string
    name: string
    role: string
    description: string
    language: string
    tone: string
    style?: string[]
    capabilities?: string[]
    version: string
    isActive: boolean
    _count?: {
      agents: number
    }
    agents?: any[]
  }
  onEdit: (persona: any) => void
  onDelete: (persona: any) => void
}

/**
 * Persona 卡片元件
 */
export function PersonaCard({ persona, onEdit, onDelete }: PersonaCardProps) {
  const agentCount = persona._count?.agents || persona.agents?.length || 0
  const hasLinkedAgents = agentCount > 0

  return (
    <Card className="group hover:shadow-lg transition-all duration-200 hover:border-blue-300">
      {/* 卡片標題 */}
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-xl flex items-center gap-2 mb-1">
              {persona.name}
            </CardTitle>
            <p className="text-sm text-muted-foreground">{persona.role}</p>
          </div>
          <Badge variant={persona.isActive ? 'default' : 'secondary'} className="ml-2 flex-shrink-0">
            {persona.isActive ? (
              <span className="flex items-center gap-1">
                <CheckCircle className="w-3 h-3" />
                啟用
              </span>
            ) : (
              <span className="flex items-center gap-1">
                <XCircle className="w-3 h-3" />
                停用
              </span>
            )}
          </Badge>
        </div>
      </CardHeader>

      {/* 卡片內容 */}
      <CardContent className="space-y-3">
        {/* 描述 */}
        <p className="text-sm text-gray-600 line-clamp-2 min-h-[40px]">
          {persona.description}
        </p>

        {/* 標籤區 */}
        <div className="flex flex-wrap gap-2">
          <Badge variant="outline" className="flex items-center gap-1">
            <Globe className="w-3 h-3" />
            {persona.language === 'zh-TW' ? '繁體中文' : persona.language === 'en' ? 'English' : '日本語'}
          </Badge>
          <Badge variant="outline">{persona.tone}</Badge>
          <Badge variant="outline">v{persona.version}</Badge>
        </div>

        {/* 能力標籤 */}
        {persona.capabilities && persona.capabilities.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {persona.capabilities.slice(0, 3).map((capability, index) => (
              <span
                key={index}
                className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800"
              >
                {capability}
              </span>
            ))}
            {persona.capabilities.length > 3 && (
              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-600">
                +{persona.capabilities.length - 3}
              </span>
            )}
          </div>
        )}

        {/* 關聯資訊 */}
        <div className="flex items-center gap-4 text-sm text-gray-500 pt-2 border-t">
          <span className="flex items-center gap-1">
            <Bot className="w-4 h-4" />
            {agentCount} 個 Agent
          </span>
          {persona.capabilities && (
            <span className="flex items-center gap-1">
              <Sparkles className="w-4 h-4" />
              {persona.capabilities.length} 項能力
            </span>
          )}
        </div>
      </CardContent>

      {/* 操作按鈕 */}
      <CardFooter className="flex gap-2 bg-gray-50 border-t pt-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onEdit(persona)}
          className="flex-1 group-hover:border-blue-400 transition-colors"
        >
          <Edit className="w-4 h-4 mr-2" />
          編輯
        </Button>
        <Button
          variant="destructive"
          size="sm"
          onClick={() => onDelete(persona)}
          disabled={hasLinkedAgents}
          className="flex-1"
          title={hasLinkedAgents ? `此 Persona 被 ${agentCount} 個 Agent 使用，無法刪除` : '刪除此 Persona'}
        >
          <Trash className="w-4 h-4 mr-2" />
          刪除
        </Button>
      </CardFooter>
    </Card>
  )
}
