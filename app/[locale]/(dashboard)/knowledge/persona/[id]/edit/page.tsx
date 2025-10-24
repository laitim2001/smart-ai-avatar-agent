/**
 * Persona 編輯頁面
 * @module app/[locale]/(dashboard)/knowledge/persona/[id]/edit
 * @description 獨立頁面用於編輯現有 Persona
 */

'use client'

import { use, useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { ArrowLeft, Save } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { PersonaFormFields, type PersonaFormData } from '@/components/knowledge/PersonaFormFields'
import { useTranslations } from 'next-intl'

export default function EditPersonaPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const t = useTranslations()
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState<PersonaFormData | null>(null)

  // 載入 Persona 資料
  useEffect(() => {
    const loadPersona = async () => {
      try {
        const response = await fetch(`/api/personas/${id}`)
        const data = await response.json()

        if (data.success) {
          setFormData({
            name: data.data.name || '',
            role: data.data.role || '',
            description: data.data.description || '',
            systemPrompt: data.data.systemPrompt || '',
            language: data.data.language || 'zh-TW',
            tone: data.data.tone || 'professional',
            style: data.data.style || [],
            capabilities: data.data.capabilities || [],
            restrictions: data.data.restrictions || [],
            version: data.data.version || '1.0.0',
            isActive: data.data.isActive ?? true,
          })
        } else {
          toast.error(t('persona.messages.loadFailed'))
          router.push('/knowledge/persona')
        }
      } catch (error) {
        console.error('[EditPersona Error]', error)
        toast.error(t('persona.messages.loadFailed'))
        router.push('/knowledge/persona')
      } finally {
        setIsLoading(false)
      }
    }

    loadPersona()
  }, [id, router])

  const updateField = (field: keyof PersonaFormData, value: any) => {
    setFormData(prev => prev ? { ...prev, [field]: value } : null)
  }

  const handleSubmit = async () => {
    if (!formData) return

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
      const response = await fetch(`/api/personas/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (data.success) {
        toast.success(t('persona.messages.updated'))
        router.push('/knowledge/persona')
      } else {
        toast.error(data.error.message || t('persona.messages.updateFailed'))
      }
    } catch (error) {
      console.error('[UpdatePersona Error]', error)
      toast.error(t('persona.messages.updateFailed'))
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="container mx-auto p-6 max-w-7xl">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin h-12 w-12 border-4 border-primary border-t-transparent rounded-full" />
        </div>
      </div>
    )
  }

  if (!formData) {
    return null
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
            <h1 className="text-3xl font-bold">{t('persona.editExisting')}</h1>
            <p className="text-gray-600 mt-1">{formData.name}</p>
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
                {t('persona.saving')}
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                {t('persona.saveChanges')}
              </>
            )}
          </Button>
        </div>
      </div>

      {/* 表單內容 */}
      <PersonaFormFields formData={formData} updateField={updateField} isEditMode={true} />
    </div>
  )
}
