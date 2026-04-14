import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../context/AuthContext'
import AuthModal from '../components/auth/AuthModal'
import FilterPills from '../components/courses/FilterPills'
import CourseGrid from '../components/courses/CourseGrid'
import { useCourses } from '../hooks/useCourses'
import { useUserCourses } from '../hooks/useUserCourses'

export default function HomePage() {
  const { t } = useTranslation()
  const { user, isLoading } = useAuth()
  const [filter, setFilter] = useState('all')

  const { courses, loading: coursesLoading } = useCourses(filter)
  const { loading: ucLoading, getCourseStatus, startCourse, finishCourse } = useUserCourses()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-2 border-brand-orange/30 border-t-brand-orange rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <>
      {!user && <AuthModal />}

      {user && (
        <div className="flex flex-col gap-8">
          {/* Page header */}
          <div className="flex flex-col gap-2">
            <h1 className="font-display text-3xl sm:text-4xl font-bold text-brand-dark leading-tight">
              {t('courses.title')}
            </h1>
            <p className="text-brand-muted text-base">
              {t('courses.subtitle')}
            </p>
          </div>

          {/* Filters */}
          <FilterPills active={filter} onChange={setFilter} />

          {/* Courses */}
          <CourseGrid
            courses={courses}
            loading={coursesLoading || ucLoading}
            getCourseStatus={getCourseStatus}
            onStart={startCourse}
            onFinish={finishCourse}
          />
        </div>
      )}
    </>
  )
}
