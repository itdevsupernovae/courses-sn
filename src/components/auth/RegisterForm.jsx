import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../../context/AuthContext'

export default function RegisterForm({ onSwitch }) {
  const { t } = useTranslation()
  const { register } = useAuth()
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  function set(key) {
    return e => setForm(f => ({ ...f, [key]: e.target.value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await register(form.email, form.password, form.firstName, form.lastName)
    } catch (err) {
      setError(err.message || t('auth.registerError'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-brand-muted uppercase tracking-wider">
            {t('auth.firstName')}
          </label>
          <input
            type="text"
            className="input-field"
            placeholder={t('auth.firstNamePlaceholder')}
            value={form.firstName}
            onChange={set('firstName')}
            required
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-brand-muted uppercase tracking-wider">
            {t('auth.lastName')}
          </label>
          <input
            type="text"
            className="input-field"
            placeholder={t('auth.lastNamePlaceholder')}
            value={form.lastName}
            onChange={set('lastName')}
            required
          />
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-medium text-brand-muted uppercase tracking-wider">
          {t('auth.email')}
        </label>
        <input
          type="email"
          className="input-field"
          placeholder={t('auth.emailPlaceholder')}
          value={form.email}
          onChange={set('email')}
          required
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-medium text-brand-muted uppercase tracking-wider">
          {t('auth.password')}
        </label>
        <input
          type="password"
          className="input-field"
          placeholder={t('auth.passwordPlaceholder')}
          value={form.password}
          onChange={set('password')}
          minLength={6}
          required
        />
      </div>

      {error && (
        <p className="text-sm text-red-500 bg-red-50 border border-red-100 rounded-lg px-4 py-2.5">
          {error}
        </p>
      )}

      <button type="submit" className="btn-primary w-full mt-2" disabled={loading}>
        {loading ? t('common.loading') : t('auth.register')}
      </button>

      <button
        type="button"
        onClick={onSwitch}
        className="text-sm text-brand-muted hover:text-brand-orange transition-colors text-center"
      >
        {t('auth.switchToLogin')}
      </button>
    </form>
  )
}
