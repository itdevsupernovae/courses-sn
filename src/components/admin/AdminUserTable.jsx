import { useTranslation } from 'react-i18next'
import { CheckCircle2, Clock, Circle } from 'lucide-react'

export default function AdminUserTable({ progress, loading }) {
  const { t } = useTranslation()

  function formatDate(str) {
    if (!str) return '—'
    return new Date(str).toLocaleDateString('fr-FR', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="w-6 h-6 border-2 border-brand-orange/30 border-t-brand-orange rounded-full animate-spin" />
      </div>
    )
  }

  if (!progress.length) {
    return <p className="text-brand-muted text-sm text-center py-10">{t('admin.noUsers')}</p>
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-brand-border">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-brand-light border-b border-brand-border">
            <th className="text-left px-4 py-3 font-medium text-brand-muted text-xs uppercase tracking-wider">{t('admin.table.user')}</th>
            <th className="text-left px-4 py-3 font-medium text-brand-muted text-xs uppercase tracking-wider">{t('admin.table.course')}</th>
            <th className="text-left px-4 py-3 font-medium text-brand-muted text-xs uppercase tracking-wider">{t('admin.table.startedAt')}</th>
            <th className="text-left px-4 py-3 font-medium text-brand-muted text-xs uppercase tracking-wider">{t('admin.table.finishedAt')}</th>
            <th className="text-left px-4 py-3 font-medium text-brand-muted text-xs uppercase tracking-wider">{t('admin.table.status')}</th>
          </tr>
        </thead>
        <tbody>
          {progress.map((row, i) => {
            const isCompleted = !!row.finished_at
            return (
              <tr
                key={row.id}
                className={`border-b border-brand-border last:border-0 hover:bg-brand-light/60 transition-colors ${i % 2 === 0 ? 'bg-white' : 'bg-brand-light/30'}`}
              >
                <td className="px-4 py-3">
                  <p className="font-medium text-brand-dark">
                    {row.profiles?.first_name} {row.profiles?.last_name}
                  </p>
                  <p className="text-xs text-brand-muted mt-0.5">{row.profiles?.email}</p>
                </td>
                <td className="px-4 py-3">
                  <p className="text-brand-dark">{row.courses?.title}</p>
                  <span className="text-xs font-medium px-1.5 py-0.5 rounded bg-brand-border text-brand-muted">
                    {row.courses?.type}
                  </span>
                </td>
                <td className="px-4 py-3 text-brand-muted text-xs">{formatDate(row.started_at)}</td>
                <td className="px-4 py-3 text-brand-muted text-xs">{formatDate(row.finished_at)}</td>
                <td className="px-4 py-3">
                  {isCompleted ? (
                    <span className="inline-flex items-center gap-1 text-xs font-medium text-green-700 bg-green-50 px-2 py-1 rounded-full border border-green-200">
                      <CheckCircle2 size={11} /> {t('admin.status.completed')}
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-xs font-medium text-brand-orange bg-brand-cream-light px-2 py-1 rounded-full border border-brand-cream">
                      <Clock size={11} /> {t('admin.status.inProgress')}
                    </span>
                  )}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
