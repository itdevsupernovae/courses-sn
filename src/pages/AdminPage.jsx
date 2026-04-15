import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Plus, BookOpen, Users, UserCog } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useAdminCourses, useAdminUserProgress, useAdminUsers } from '../hooks/useAdmin'
import AdminCourseTable from '../components/admin/AdminCourseTable'
import AdminUserTable from '../components/admin/AdminUserTable'
import AdminUserList from '../components/admin/AdminUserList'
import AddCourseModal from '../components/admin/AddCourseModal'

const TABS = ['courses', 'users', 'members']

export default function AdminPage() {
  const { t } = useTranslation()
  const { isAdmin, isLoading } = useAuth()
  const navigate = useNavigate()
  const [tab, setTab] = useState('courses')
  const [showAdd, setShowAdd] = useState(false)

  const { courses, loading: cLoading, refetch, deleteCourse, updateCourse } = useAdminCourses()
  const { progress, loading: pLoading } = useAdminUserProgress()
  const { users, loading: uLoading, updateUserRole } = useAdminUsers()

  // Guard
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-2 border-brand-orange/30 border-t-brand-orange rounded-full animate-spin" />
      </div>
    )
  }
  if (!isAdmin) {
    navigate('/')
    return null
  }

  return (
    <div className="flex flex-col gap-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold text-brand-dark">{t('admin.title')}</h1>
        </div>
        {tab === 'courses' && (
          <button
            onClick={() => setShowAdd(true)}
            className="btn-primary flex items-center gap-2 self-start"
          >
            <Plus size={16} /> {t('admin.addCourse')}
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-brand-light border border-brand-border rounded-xl p-1 self-start">
        <button
          onClick={() => setTab('courses')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            tab === 'courses'
              ? 'bg-white text-brand-dark shadow-sm border border-brand-border'
              : 'text-brand-muted hover:text-brand-dark'
          }`}
        >
          <BookOpen size={14} /> {t('admin.courses')}
        </button>
        <button
          onClick={() => setTab('users')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            tab === 'users'
              ? 'bg-white text-brand-dark shadow-sm border border-brand-border'
              : 'text-brand-muted hover:text-brand-dark'
          }`}
        >
          <Users size={14} /> {t('admin.users')}
        </button>
        <button
          onClick={() => setTab('members')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            tab === 'members'
              ? 'bg-white text-brand-dark shadow-sm border border-brand-border'
              : 'text-brand-muted hover:text-brand-dark'
          }`}
        >
          <UserCog size={14} /> {t('admin.members')}
        </button>
      </div>

      {/* Content */}
      {tab === 'courses' && (
        <AdminCourseTable
          courses={courses}
          loading={cLoading}
          onDelete={deleteCourse}
          onUpdate={updateCourse}
        />
      )}
      {tab === 'users' && (
        <AdminUserTable progress={progress} loading={pLoading} />
      )}
      {tab === 'members' && (
        <AdminUserList users={users} loading={uLoading} onUpdate={updateUserRole} />
      )}

      {showAdd && (
        <AddCourseModal
          onClose={() => setShowAdd(false)}
          onAdded={() => { refetch(); setShowAdd(false) }}
        />
      )}
    </div>
  )
}
