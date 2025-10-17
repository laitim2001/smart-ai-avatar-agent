import { useTranslations } from 'next-intl'
import { LanguageSwitcher } from '@/components/LanguageSwitcher'

export default function HomePage() {
  const t = useTranslations('nav')

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-xl font-semibold text-gray-900">{t('home')}</h1>
            <LanguageSwitcher />
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Smart AI Avatar Agent
          </h2>
          <p className="text-lg text-gray-600 mb-8">
            3D Avatar Real-time Conversation System
          </p>
          <div className="flex flex-col gap-4 max-w-md mx-auto">
            <a
              href={`/${t('dashboard')}`}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              {t('dashboard')}
            </a>
            <a
              href={`/${t('conversations')}`}
              className="px-6 py-3 bg-white text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
            >
              {t('conversations')}
            </a>
          </div>
        </div>
      </main>
    </div>
  )
}
