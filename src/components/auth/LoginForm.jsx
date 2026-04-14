import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../../context/AuthContext'

export default function LoginForm({ onSwitch }) {
  const { t } = useTranslation()
  const { login } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(email, password)
    } catch {
      setError(t('auth.loginError'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-medium text-brand-muted uppercase tracking-wider">
          {t('auth.email')}
        </label>
        <input
          type="email"
          className="input-field"
          placeholder={t('auth.emailPlaceholder')}
          value={email}
          onChange={e => setEmail(e.target.value)}
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
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
        />
      </div>

      {error && (
        <p className="text-sm text-red-500 bg-red-50 border border-red-100 rounded-lg px-4 py-2.5">
          {error}
        </p>
      )}

      <button type="submit" className="btn-primary w-full mt-2" disabled={loading}>
        {loading ? t('common.loading') : t('auth.login')}
      </button>

      <button
        type="button"
        onClick={onSwitch}
        className="text-sm text-brand-muted hover:text-brand-orange transition-colors text-center"
      >
        {t('auth.switchToRegister')}
      </button>
    </form>
  )
}
