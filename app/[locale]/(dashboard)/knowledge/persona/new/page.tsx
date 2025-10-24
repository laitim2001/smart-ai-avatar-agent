/**
 * Persona 建立頁面
 * @module app/[locale]/(dashboard)/knowledge/persona/new
 * @description 獨立頁面用於建立新的 Persona
 */

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { ArrowLeft, Save } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { PersonaFormFields, type PersonaFormData } from '@/components/knowledge/PersonaFormFields'
import { useTranslations } from 'next-intl'

export default function NewPersonaPage() {
  const router = useRouter()
  const t = useTranslations()
  const [isSubmitting, setIsSubmitting] = useState(false)
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

  const updateField = (field: keyof PersonaFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async () => {
    // 驗證
    if (!formData.name || !formData.role || !formData.description || !formData.systemPrompt) {
      toast.error(t('persona.validation.nameRequired'))
      return
    }

    if (formData.description.length < 10) {
      toast.error(t('persona.validation.descriptionTooShort'))
      return
    }

    if (formData.systemPrompt.length < 100) {
      toast.error(t('persona.validation.systemPromptTooShort'))
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch('/api/personas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (data.success) {
        toast.success(t('persona.messages.created'))
        router.push('/knowledge/persona')
      } else {
        toast.error(data.error.message || t('persona.messages.createFailed'))
      }
    } catch (error) {
      console.error('[NewPersona Error]', error)
      toast.error(t('persona.messages.createFailed'))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      {/* 頁面標題與操作 */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/knowledge/persona">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              {t('persona.backToList')}
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">{t('persona.createNew')}</h1>
            <p className="text-gray-600 mt-1">{t('persona.description')}</p>
          </div>
        </div>

        <div className="flex gap-2">
          <Link href="/knowledge/persona">
            <Button variant="outline">{t('button.cancel')}</Button>
          </Link>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                {t('persona.creating')}
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                {t('persona.create')}
              </>
            )}
          </Button>
        </div>
      </div>

      {/* 表單內容 */}
      <PersonaFormFields formData={formData} updateField={updateField} isEditMode={false} />
    </div>
  )
}
