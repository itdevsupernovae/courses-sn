import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Pencil, Trash2, ExternalLink, Archive } from 'lucide-react'
import EditCourseModal from './EditCourseModal'

export default function AdminCourseTable({ courses, loading, onDelete, onUpdate }) {
  const { t } = useTranslation()
  const [editCourse, setEditCourse] = useState(null)
  const [confirmDelete, setConfirmDelete] = useState(null)

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
            <div className="flex gap-2 mt-2">
              <button onClick={() => setConfirmDelete(null)} className="btn-secondary flex-1">{t('admin.cancel')}</button>
              <button
                onClick={() => { onDelete(confirmDelete.id); setConfirmDelete(null) }}
                className="flex-1 bg-red-500 text-white font-medium px-5 py-2.5 rounded-lg text-sm hover:bg-red-600 transition-colors"
              >
                {t('admin.delete')}
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
