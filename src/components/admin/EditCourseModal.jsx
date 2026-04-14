import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { X } from 'lucide-react'

const TYPES = ['Environnement', 'Security', 'Gender']

export default function EditCourseModal({ course, onSave, onClose }) {
  const { t } = useTranslation()
  const [form, setForm] = useState({
    title: course.title || '',
    subtitle: course.subtitle || '',
    type: course.type || 'Environnement',
    url: course.url || '',
  })
  const [saving, setSaving] = useState(false)

  function set(key) {
    return e => setForm(f => ({ ...f, [key]: e.target.value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setSaving(true)
    await onSave(form)
    setSaving(false)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-brand-dark/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-modal w-full max-w-md mx-4 overflow-hidden">
        <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-brand-border">
          <h3 className="font-display text-lg font-semibold text-brand-dark">{t('admin.editCourse')}</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg text-brand-muted hover:bg-brand-border transition-all">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-brand-muted uppercase tracking-wider">{t('admin.courseTitle')}</label>
            <input className="input-field" value={form.title} onChange={set('title')} required />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-brand-muted uppercase tracking-wider">{t('admin.courseSubtitle')}</label>
            <input className="input-field" value={form.subtitle} onChange={set('subtitle')} />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-brand-muted uppercase tracking-wider">{t('admin.courseType')}</label>
            <select className="input-field" value={form.type} onChange={set('type')}>
              {TYPES.map(ty => <option key={ty} value={ty}>{t(`courses.filters.${ty}`, ty)}</option>)}
            </select>
          </div>

          {course.source_type === 'link' && (
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-brand-muted uppercase tracking-wider">{t('admin.courseUrl')}</label>
              <input className="input-field" value={form.url} onChange={set('url')} placeholder={t('admin.urlPlaceholder')} />
            </div>
          )}

          <div className="flex gap-2 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">{t('admin.cancel')}</button>
            <button type="submit" className="btn-primary flex-1" disabled={saving}>
              {saving ? t('admin.saving') : t('admin.save')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
