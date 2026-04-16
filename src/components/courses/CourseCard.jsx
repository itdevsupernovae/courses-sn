import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { CheckCircle2, PlayCircle, Loader2, Download } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { generateDiploma } from '../../lib/pdfDiploma'
import StartCourseModal from './StartCourseModal'
import CongratsModal from './CongratsModal'

const TYPE_COLORS = {
  Environnement: 'bg-green-50 text-green-700 border-green-200',
  Security: 'bg-blue-50 text-blue-700 border-blue-200',
  Gender: 'bg-purple-50 text-purple-700 border-purple-200',
}

export default function CourseCard({ course, getCourseStatus, onStart, onFinish }) {
  const { t, i18n } = useTranslation()
  const { profile } = useAuth()
  const [showStartModal, setShowStartModal] = useState(false)
  const [showCongrats, setShowCongrats] = useState(false)
  const [finishing, setFinishing] = useState(false)
  const [congratsData, setCongratsData] = useState(null)

  const { status, record } = getCourseStatus(course.id)

  const typeColor = TYPE_COLORS[course.type] || 'bg-gray-50 text-gray-700 border-gray-200'

  function openCourse() {
    const url = course.source_type === 'zip'
      ? course.url
      : course.url
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  async function handleStart() {
    const hasSeenHint = localStorage.getItem('sn_start_hint_shown')
    // Toujours ouvrir le cours, mais n'insérer en DB que la première fois
    if (status === 'not_started') {
      await onStart(course.id)
    }
    openCourse()
    if (!hasSeenHint && status === 'not_started') {
      setShowStartModal(true)
    }
  }

  function handleStartModalConfirm() {
    localStorage.setItem('sn_start_hint_shown', '1')
    setShowStartModal(false)
  }

  async function handleFinish() {
    setFinishing(true)
    const data = await onFinish(course.id)
    setFinishing(false)
    if (data) {
      setCongratsData(data)
      setShowCongrats(true)
    }
  }

  return (
    <>
      <div className="card p-6 flex flex-col gap-4">
        {/* Type badge */}
        <div className="flex items-start justify-between gap-2">
          <span className={`inline-flex items-center text-xs font-medium px-2.5 py-1 rounded-full border ${typeColor}`}>
            {t(`courses.filters.${course.type}`, course.type)}
          </span>

          {status === 'completed' && (
            <span className="inline-flex items-center gap-1 text-xs font-medium text-green-700 bg-green-50 border border-green-200 px-2.5 py-1 rounded-full">
              <CheckCircle2 size={12} />
              {t('courses.completed')}
            </span>
          )}
          {status === 'in_progress' && (
            <span className="inline-flex items-center gap-1 text-xs font-medium text-brand-orange bg-brand-cream-light border border-brand-cream px-2.5 py-1 rounded-full">
              <PlayCircle size={12} />
              {t('courses.inProgress')}
            </span>
          )}
        </div>

        {/* Title & subtitle */}
        <div className="flex-1">
          <h3 className="font-display text-lg font-semibold text-brand-dark leading-snug">
            {course.title}
          </h3>
          {course.subtitle && (
            <p className="text-sm text-brand-muted mt-1.5 leading-relaxed">
              {course.subtitle}
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-2 pt-2 border-t border-brand-border">
          {/* Start button */}
          <button
            onClick={handleStart}
            className="btn-primary w-full flex items-center justify-center gap-2 text-sm"
          >
            <PlayCircle size={15} />
            {t('courses.startCourse')}
          </button>

          {/* Finish button */}
          <button
            onClick={handleFinish}
            disabled={status !== 'in_progress' || finishing}
            className="btn-secondary w-full flex items-center justify-center gap-2 text-sm"
          >
            {finishing ? (
              <Loader2 size={15} className="animate-spin" />
            ) : (
              <CheckCircle2 size={15} />
            )}
            {status === 'completed'
              ? t('courses.completed')
              : t('courses.finishCourse')}
          </button>

          {/* Download diploma button — only when completed */}
          {status === 'completed' && profile && record && (
            <button
              onClick={() => generateDiploma({
                courseTitle: course.title,
                firstName: profile.first_name,
                lastName: profile.last_name,
                finishedAt: record.finished_at,
                lang: i18n.language,
              })}
              className="w-full flex items-center justify-center gap-2 text-xs font-medium text-brand-orange hover:text-brand-orange/80 py-1.5 transition-colors"
            >
              <Download size={13} />
              {t('courses.downloadDiploma')}
            </button>
          )}
        </div>
      </div>

      {showStartModal && (
        <StartCourseModal onConfirm={handleStartModalConfirm} />
      )}

      {showCongrats && congratsData && profile && (
        <CongratsModal
          course={course}
          profile={profile}
          finishedAt={congratsData.finished_at}
          onClose={() => setShowCongrats(false)}
        />
      )}
    </>
  )
}
