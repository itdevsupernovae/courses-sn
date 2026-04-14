import { useTranslation } from 'react-i18next'
import { BookOpen } from 'lucide-react'
import CourseCard from './CourseCard'

// Skeleton loader for a card
function CardSkeleton() {
  return (
    <div className="card p-6 flex flex-col gap-4 animate-pulse">
      <div className="h-6 w-28 bg-brand-border rounded-full" />
      <div className="flex-1 space-y-2">
        <div className="h-5 bg-brand-border rounded w-3/4" />
        <div className="h-4 bg-brand-border rounded w-full" />
        <div className="h-4 bg-brand-border rounded w-5/6" />
      </div>
      <div className="h-3 w-24 bg-brand-border rounded" />
      <div className="pt-2 border-t border-brand-border flex flex-col gap-2">
        <div className="h-10 bg-brand-border rounded-lg" />
        <div className="h-10 bg-brand-border rounded-lg" />
      </div>
    </div>
  )
}

export default function CourseGrid({ courses, loading, getCourseStatus, onStart, onFinish }) {
  const { t } = useTranslation()

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => <CardSkeleton key={i} />)}
      </div>
    )
  }

  if (!courses.length) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4 text-brand-muted">
        <BookOpen size={40} className="opacity-30" />
        <p className="text-base">{t('courses.noCoursesFound')}</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {courses.map(course => (
        <CourseCard
          key={course.id}
          course={course}
          getCourseStatus={getCourseStatus}
          onStart={onStart}
          onFinish={onFinish}
        />
      ))}
    </div>
  )
}
