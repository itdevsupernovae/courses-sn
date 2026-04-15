import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Search, ShieldCheck, ShieldOff, Loader2 } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import toast from 'react-hot-toast'

export default function AdminUserList({ users, loading, onUpdate }) {
  const { t } = useTranslation()
  const [search, setSearch] = useState('')
  const [togglingId, setTogglingId] = useState(null)

  function formatDate(str) {
    if (!str) return '—'
    return new Date(str).toLocaleDateString('fr-FR', {
      day: '2-digit', month: '2-digit', year: 'numeric',
    })
  }

  async function toggleAdmin(user) {
    setTogglingId(user.id)
    const newRole = user.role === 'admin' ? 'user' : 'admin'
    const { error } = await supabase
      .from('profiles')
      .update({ role: newRole })
      .eq('id', user.id)

    if (error) {
      toast.error(error.message)
    } else {
      onUpdate(user.id, newRole)
      toast.success(
        newRole === 'admin'
          ? t('admin.userPromotedAdmin')
          : t('admin.userDemoted')
      )
    }
    setTogglingId(null)
  }

  const filtered = users.filter(u => {
    const q = search.toLowerCase()
    return (
      u.first_name?.toLowerCase().includes(q) ||
      u.last_name?.toLowerCase().includes(q) ||
      u.email?.toLowerCase().includes(q)
    )
  })

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="w-6 h-6 border-2 border-brand-orange/30 border-t-brand-orange rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Search bar */}
      <div className="relative max-w-sm">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-muted" />
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder={t('admin.searchUsers')}
          className="input-field pl-9 text-sm"
        />
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <p className="text-brand-muted text-sm text-center py-10">{t('admin.noUsersFound')}</p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-brand-border">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-brand-light border-b border-brand-border">
                <th className="text-left px-4 py-3 font-medium text-brand-muted text-xs uppercase tracking-wider">{t('admin.table.user')}</th>
                <th className="text-left px-4 py-3 font-medium text-brand-muted text-xs uppercase tracking-wider">{t('admin.table.email')}</th>
                <th className="text-left px-4 py-3 font-medium text-brand-muted text-xs uppercase tracking-wider">{t('admin.table.createdAt')}</th>
                <th className="text-left px-4 py-3 font-medium text-brand-muted text-xs uppercase tracking-wider">{t('admin.table.role')}</th>
                <th className="text-left px-4 py-3 font-medium text-brand-muted text-xs uppercase tracking-wider">{t('admin.table.actions')}</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((user, i) => (
                <tr
                  key={user.id}
                  className={`border-b border-brand-border last:border-0 hover:bg-brand-light/60 transition-colors ${i % 2 === 0 ? 'bg-white' : 'bg-brand-light/30'}`}
                >
                  <td className="px-4 py-3">
                    <p className="font-medium text-brand-dark">
                      {user.first_name} {user.last_name}
                    </p>
                  </td>
                  <td className="px-4 py-3 text-brand-muted text-xs">{user.email}</td>
                  <td className="px-4 py-3 text-brand-muted text-xs">{formatDate(user.created_at)}</td>
                  <td className="px-4 py-3">
                    {user.role === 'admin' ? (
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-brand-orange bg-brand-cream-light px-2 py-1 rounded-full border border-brand-cream">
                        <ShieldCheck size={11} /> Admin
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-brand-muted bg-brand-light px-2 py-1 rounded-full border border-brand-border">
                        User
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => toggleAdmin(user)}
                      disabled={togglingId === user.id}
                      className={`inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg transition-all disabled:opacity-50 ${
                        user.role === 'admin'
                          ? 'text-red-600 bg-red-50 hover:bg-red-100 border border-red-200'
                          : 'text-brand-orange bg-brand-cream-light hover:bg-brand-cream border border-brand-cream'
                      }`}
                    >
                      {togglingId === user.id ? (
                        <Loader2 size={11} className="animate-spin" />
                      ) : user.role === 'admin' ? (
                        <ShieldOff size={11} />
                      ) : (
                        <ShieldCheck size={11} />
                      )}
                      {user.role === 'admin' ? t('admin.removeAdmin') : t('admin.makeAdmin')}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
