import { useTranslation } from 'react-i18next'
import { BookOpen } from 'lucide-react'

export default function StartCourseModal({ onConfirm }) {
  const { t } = useTranslation()

  // Parse bold text in body
  const bodyText = t('startModal.body')
  const parts = bodyText.split(/\*\*(.*?)\*\*/g)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-brand-dark/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-modal w-full max-w-sm mx-4 overflow-hidden">
        <div className="bg-brand-cream-light px-6 pt-6 pb-4 flex flex-col items-center">
          <div className="w-12 h-12 rounded-full bg-brand-orange/10 flex items-center justify-center mb-3">
            <BookOpen size={22} className="text-brand-orange" />
          </div>
          <h3 className="font-display text-xl font-semibold text-brand-dark text-center">
            {t('startModal.title')}
          </h3>
        </div>
        <div className="px-6 py-5">
          <p className="text-sm text-brand-muted leading-relaxed text-center">
            {parts.map((part, i) =>
              i % 2 === 1 ? (
                <strong key={i} className="text-brand-dark font-semibold">{part}</strong>
              ) : (
                <span key={i}>{part}</span>
              )
            )}
          </p>
          <button
            onClick={onConfirm}
            className="btn-primary w-full mt-5"
          >
            {t('startModal.cta')}
          </button>
        </div>
      </div>
    </div>
  )
}
