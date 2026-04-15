import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Pencil, Trash2, ExternalLink, Archive, Loader2 } from 'lucide-react'
import EditCourseModal from './EditCourseModal'
import { supabase } from '../../lib/supabase'
import toast from 'react-hot-toast'

export default function AdminCourseTable({ courses, loading, onDelete, onUpdate }) {
  const { t } = useTranslation()
  const [editCourse, setEditCourse] = useState(null)
  const [confirmDelete, setConfirmDelete] = useState(null)
  const [deleting, setDeleting] = useState(false)

  async function handleDelete(course) {
    setDeleting(true)
    try {
      if (course.source_type === 'zip') {
        // Extract folderName from URL: /courses/{folderName}/content/index.html
        const folderName = course.url?.split('/courses/')[1]?.split('/')[0]
        if (!folderName) throw new Error('Impossible de déterminer le dossier GitHub')

        const { data: { session } } = await supabase.auth.getSession()
        const res = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/delete-course-from-github`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${session.access_token}`,
            },
            body: JSON.stringify({ courseId: course.id, folderName }),
          }
        )
        const result = await res.json()
        if (!res.ok) throw new Error(result.error || 'Erreur lors de la suppression')

        if (!result.githubSuccess) {
          toast(t('admin.deleteGithubWarning'), { icon: '⚠️' })
        }
      } else {
        await onDelete(course.id)
        setConfirmDelete(null)
        setDeleting(false)
        return
      }

      onDelete(course.id)
    } catch (err) {
      toast.error(err.message)
    } finally {
      setConfirmDelete(null)
      setDeleting(false)
    }
  }

  function formatDate(str) {
    if (!str) return '—'
    return new Date(str).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' })
  }

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="w-6 h-6 border-2 border-brand-orange/30 border-t-brand-orange rounded-full animate-spin" />
      </div>
    )
  }

  if (!courses.length) {
    return <p className="text-brand-muted text-sm text-center py-10">{t('admin.noCourses')}</p>
  }

  return (
    <>
      <div className="overflow-x-auto rounded-xl border border-brand-border">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-brand-light border-b border-brand-border">
              <th className="text-left px-4 py-3 font-medium text-brand-muted text-xs uppercase tracking-wider">{t('admin.table.title')}</th>
              <th className="text-left px-4 py-3 font-medium text-brand-muted text-xs uppercase tracking-wider">{t('admin.table.type')}</th>
              <th className="text-left px-4 py-3 font-medium text-brand-muted text-xs uppercase tracking-wider">{t('admin.table.source')}</th>
              <th className="text-left px-4 py-3 font-medium text-brand-muted text-xs uppercase tracking-wider">{t('admin.table.createdAt')}</th>
              <th className="text-left px-4 py-3 font-medium text-brand-muted text-xs uppercase tracking-wider">{t('admin.table.actions')}</th>
            </tr>
          </thead>
          <tbody>
            {courses.map((course, i) => (
              <tr
                key={course.id}
                className={`border-b border-brand-border last:border-0 hover:bg-brand-light/60 transition-colors ${i % 2 === 0 ? 'bg-white' : 'bg-brand-light/30'}`}
              >
                <td className="px-4 py-3">
                  <div>
                    <p className="font-medium text-brand-dark">{course.title}</p>
                    {course.subtitle && <p className="text-xs text-brand-muted mt-0.5">{course.subtitle}</p>}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span className="text-xs font-medium px-2 py-1 rounded-full bg-brand-border text-brand-muted">
                    {course.type}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className="flex items-center gap-1.5 text-xs text-brand-muted">
                    {course.source_type === 'zip' ? (
                      <><Archive size={12} /> ZIP</>
                    ) : (
                      <><ExternalLink size={12} /> Link</>
                    )}
                  </span>
                </td>
                <td className="px-4 py-3 text-brand-muted text-xs">{formatDate(course.created_at)}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setEditCourse(course)}
                      className="p-1.5 rounded-lg text-brand-muted hover:text-brand-dark hover:bg-brand-border transition-all"
                      title={t('admin.edit')}
                    >
                      <Pencil size={14} />
                    </button>
                    <button
                      onClick={() => setConfirmDelete(course)}
                      className="p-1.5 rounded-lg text-brand-muted hover:text-red-600 hover:bg-red-50 transition-all"
                      title={t('admin.delete')}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Delete confirm */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-brand-dark/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-modal w-full max-w-sm mx-4 p-6 flex flex-col gap-4">
            <h3 className="font-display text-lg font-semibold text-brand-dark">{t('admin.deleteCourse')}</h3>
            <p className="text-sm text-brand-muted">{t('admin.deleteConfirm')}</p>
            <p className="text-sm font-medium text-brand-dark">« {confirmDelete.title} »</p>
            {confirmDelete.source_type === 'zip' && (
              <p className="text-xs text-brand-muted bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                {t('admin.deleteZipWarning')}
              </p>
            )}
            <div className="flex gap-2 mt-2">
              <button onClick={() => setConfirmDelete(null)} disabled={deleting} className="btn-secondary flex-1">{t('admin.cancel')}</button>
              <button
                onClick={() => handleDelete(confirmDelete)}
                disabled={deleting}
                className="flex-1 bg-red-500 text-white font-medium px-5 py-2.5 rounded-lg text-sm hover:bg-red-600 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {deleting && <Loader2 size={14} className="animate-spin" />}
                {deleting ? t('admin.deleting') : t('admin.delete')}
              </button>
            </div>
          </div>
        </div>
      )}

      {editCourse && (
        <EditCourseModal
          course={editCourse}
          onSave={async (updates) => { await onUpdate(editCourse.id, updates); setEditCourse(null) }}
          onClose={() => setEditCourse(null)}
        />
      )}
    </>
  )
}
