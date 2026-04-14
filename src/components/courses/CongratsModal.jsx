import { useTranslation } from 'react-i18next'
import { Trophy, Download, X } from 'lucide-react'
import { generateDiploma } from '../../lib/pdfDiploma'

export default function CongratsModal({ course, profile, finishedAt, onClose }) {
  const { t, i18n } = useTranslation()

  function handleDownload() {
    generateDiploma({
      courseTitle: course.title,
      firstName: profile.first_name,
      lastName: profile.last_name,
      finishedAt,
      lang: i18n.language,
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-brand-dark/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-modal w-full max-w-sm mx-4 overflow-hidden">
        {/* Close button */}
        <div className="flex justify-end px-4 pt-4">
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-brand-muted hover:bg-brand-border hover:text-brand-dark transition-all"
          >
            <X size={18} />
          </button>
        </div>

        {/* Trophy icon */}
        <div className="flex flex-col items-center px-6 pb-2">
          <div className="w-16 h-16 rounded-full bg-brand-orange flex items-center justify-center mb-4 shadow-lg shadow-brand-orange/30">
            <Trophy size={28} className="text-white" />
          </div>
          <h3 className="font-display text-2xl font-semibold text-brand-dark text-center">
            {t('congrats.title')}
          </h3>
          <p className="text-sm text-brand-muted mt-2 text-center leading-relaxed">
            {t('congrats.body')}
          </p>

          {/* Course name */}
          <div className="mt-4 w-full bg-brand-cream-light rounded-xl px-4 py-3 text-center">
            <p className="text-xs text-brand-muted uppercase tracking-wider mb-1">{t('courses.completed')}</p>
            <p className="font-display font-semibold text-brand-dark text-base">{course.title}</p>
          </div>
        </div>

        {/* Actions */}
        <div className="px-6 pb-6 pt-4 flex flex-col gap-2">
          <button onClick={handleDownload} className="btn-primary w-full flex items-center justify-center gap-2">
            <Download size={16} />
            {t('congrats.downloadPdf')}
          </button>
          <button onClick={onClose} className="btn-secondary w-full">
            {t('congrats.close')}
          </button>
        </div>
      </div>
    </div>
  )
}
