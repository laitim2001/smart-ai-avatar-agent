/**
 * Edit Agent Page
 * @module app/[locale]/(dashboard)/agents/[id]/edit/page
 * @description Edit existing AI Agent page
 */

'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { AgentForm } from '@/components/agents/AgentForm'
import { useAgentStore, Agent } from '@/stores/agentStore'
import { Loader2 } from 'lucide-react'

export default function EditAgentPage() {
  const params = useParams()
  const router = useRouter()
  const agentId = params.id as string

  const { loadAgentDetail } = useAgentStore()
  const [agent, setAgent] = useState<Agent | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Load Agent data
  useEffect(() => {
    async function loadAgent() {
      try {
        setIsLoading(true)
        const agentDetail = await loadAgentDetail(agentId)

        if (!agentDetail) {
          setError('Agent does not exist or cannot be loaded')
          return
        }

        setAgent(agentDetail)
      } catch (err) {
        console.error('[EditAgentPage] Load agent error:', err)
        setError('Failed to load Agent')
      } finally {
        setIsLoading(false)
      }
    }

    if (agentId) {
      loadAgent()
    }
  }, [agentId, loadAgentDetail])

  const handleSuccess = (updatedAgent: Agent) => {
    router.push('/agents')
  }

  const handleCancel = () => {
    router.push('/agents')
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="container mx-auto py-6">
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
            <p className="text-gray-600">Loading Agent data...</p>
          </div>
        </div>
      </div>
    )
  }

  // Error state
  if (error || !agent) {
    return (
      <div className="container mx-auto py-6">
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="text-red-600 text-6xl mb-4">⚠️</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Load Failed</h2>
            <p className="text-gray-600 mb-6">{error || 'Agent does not exist'}</p>
            <button
              onClick={() => router.push('/agents')}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Back to Agent Marketplace
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Edit form
  return (
    <div className="container mx-auto py-6">
      <AgentForm agent={agent} onSuccess={handleSuccess} onCancel={handleCancel} />
    </div>
  )
}
