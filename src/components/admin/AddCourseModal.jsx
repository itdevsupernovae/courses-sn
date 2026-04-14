import { useState, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { X, Link2, Archive } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../context/AuthContext'
import ZipUploader from './ZipUploader'

const TYPES = ['Environnement', 'Security', 'Genrer']

export default function AddCourseModal({ onClose, onAdded }) {
  const { t } = useTranslation()
  const { user } = useAuth()
  const [sourceType, setSourceType] = useState('link')
  const [form, setForm] = useState({
    title: '',
    subtitle: '',
    type: 'Environnement',
    url: '',
    folderName: '',
    entryPoint: 'index.html',
  })
  const [saving, setSaving] = useState(false)
  const zipProcessorRef = useRef(null)

  function set(key) {
    return e => setForm(f => ({ ...f, [key]: e.target.value }))
  }

  // ZipUploader will attach its processor to this object
  const zipCallbackHolder = {}

  async function handleSubmit(e) {
    e.preventDefault()
    setSaving(true)

    try {
      if (sourceType === 'link') {
        const { data, error } = await supabase.from('courses').insert({
          title: form.title,
          subtitle: form.subtitle || null,
          type: form.type,
          source_type: 'link',
          url: form.url,
          created_by: user.id,
        }).select().single()

        if (error) throw error
        onAdded(data)
        onClose()
      } else {
        // ZIP: call edge function via ZipUploader
        const processZip = zipCallbackHolder.__processZip
        if (!processZip) throw new Error('No ZIP selected')

        const url = await processZip({ title: form.title, subtitle: form.subtitle, type: form.type, entryPoint: form.entryPoint })
        // Edge Function already inserted the course; just close
        if (url) {
          onAdded(null) // trigger refetch
          onClose()
        }
      }
    } catch (err) {
      console.error(err)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-brand-dark/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-modal w-full max-w-lg mx-4 overflow-hidden max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-brand-border sticky top-0 bg-white z-10">
          <h3 className="font-display text-lg font-semibold text-brand-dark">{t('admin.addCourse')}</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg text-brand-muted hover:bg-brand-border transition-all">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 flex flex-col gap-5">
          {/* Source type toggle */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-medium text-brand-muted uppercase tracking-wider">
              {t('admin.sourceType')}
            </label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setSourceType('link')}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg border text-sm font-medium transition-all ${
                  sourceType === 'link'
                    ? 'bg-brand-orange text-white border-brand-orange'
                    : 'bg-white text-brand-muted border-brand-border hover:border-brand-orange/40'
                }`}
              >
                <Link2 size={15} /> {t('admin.sourceLink')}
              </button>
              <button
                type="button"
                onClick={() => setSourceType('zip')}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg border text-sm font-medium transition-all ${
                  sourceType === 'zip'
                    ? 'bg-brand-orange text-white border-brand-orange'
                    : 'bg-white text-brand-muted border-brand-border hover:border-brand-orange/40'
                }`}
              >
                <Archive size={15} /> {t('admin.sourceZip')}
              </button>
            </div>
          </div>

          {/* Course info */}
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
              {TYPES.map(ty => <option key={ty} value={ty}>{ty}</option>)}
            </select>
          </div>

          {/* Link specific */}
          {sourceType === 'link' && (
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-brand-muted uppercase tracking-wider">{t('admin.courseUrl')}</label>
              <input
                className="input-field"
                value={form.url}
                onChange={set('url')}
                placeholder={t('admin.urlPlaceholder')}
                required={sourceType === 'link'}
              />
            </div>
          )}

          {/* ZIP specific */}
          {sourceType === 'zip' && (
            <>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-brand-muted uppercase tracking-wider">{t('admin.folderName')}</label>
                <input
                  className="input-field"
                  value={form.folderName}
                  onChange={set('folderName')}
                  placeholder={t('admin.folderNamePlaceholder')}
                  required={sourceType === 'zip'}
                />
                <p className="text-xs text-brand-muted">{t('admin.folderNameHint')}</p>
              </div>
              <ZipUploader
                folderName={form.folderName}
                onSuccess={zipCallbackHolder}
              />
            </>
          )}

          {/* Actions */}
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
