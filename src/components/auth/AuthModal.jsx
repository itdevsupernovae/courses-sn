import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import LoginForm from './LoginForm'
import RegisterForm from './RegisterForm'

export default function AuthModal() {
  const { t } = useTranslation()
  const [mode, setMode] = useState('login')

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-brand-dark/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-modal w-full max-w-md mx-4 overflow-hidden">
        {/* Header band */}
        <div className="bg-brand-orange px-8 pt-8 pb-6">
          <div className="flex items-center gap-3 mb-4">
            <img
              src="https://www.super-novae.org/wp-content/uploads/2022/04/SUPER_NOVAE_LOGO_BLANC.png"
              alt="Super-Novae"
              className="h-8 object-contain"
              onError={e => { e.target.style.display = 'none' }}
            />
          </div>
          <h2 className="font-display text-2xl font-semibold text-white leading-tight">
            {mode === 'login' ? t('auth.loginTitle') : t('auth.registerTitle')}
          </h2>
          <p className="text-white/70 text-sm mt-1">
            {mode === 'login' ? t('auth.loginSubtitle') : t('auth.registerSubtitle')}
          </p>
        </div>

        {/* Form body */}
        <div className="px-8 py-6">
          {mode === 'login' ? (
            <LoginForm onSwitch={() => setMode('register')} />
          ) : (
            <RegisterForm onSwitch={() => setMode('login')} />
          )}
        </div>
      </div>
    </div>
  )
}
