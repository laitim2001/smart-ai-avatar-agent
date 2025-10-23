/**
 * New Agent Page
 * @module app/[locale]/(dashboard)/agents/new/page
 * @description Create new AI Agent page
 */

'use client'

import { AgentForm } from '@/components/agents/AgentForm'
import { useRouter } from 'next/navigation'
import { Agent } from '@/stores/agentStore'

export default function NewAgentPage() {
  const router = useRouter()

  const handleSuccess = (agent: Agent) => {
    router.push('/agents')
  }

  const handleCancel = () => {
    router.push('/agents')
  }

  return (
    <div className="container mx-auto py-6">
      <AgentForm onSuccess={handleSuccess} onCancel={handleCancel} />
    </div>
  )
}
