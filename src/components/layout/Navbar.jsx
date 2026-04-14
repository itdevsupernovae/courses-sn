import { useTranslation } from 'react-i18next'
import { Link, useNavigate } from 'react-router-dom'
import { LogOut, ShieldCheck } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

export default function Navbar() {
  const { t, i18n } = useTranslation()
  const { user, profile, isAdmin, logout } = useAuth()
  const navigate = useNavigate()

  function toggleLang() {
    const next = i18n.language === 'fr' ? 'en' : 'fr'
    i18n.changeLanguage(next)
  }

  async function handleLogout() {
    await logout()
    navigate('/')
  }

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b border-brand-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3">
          <img
            src="https://www.super-novae.org/wp-content/uploads/2022/04/SUPER_NOVAE_LOGO_ROUGE.png"
            alt="Super-Novae"
            className="h-8 object-contain"
            onError={e => {
              e.target.style.display = 'none'
              e.target.nextSibling.style.display = 'block'
            }}
          />
          <span
            className="font-display text-xl font-semibold text-brand-orange hidden"
            style={{ display: 'none' }}
          >
            Super-Novae
          </span>
        </Link>

        {/* Right actions */}
        <div className="flex items-center gap-2">
          {user && isAdmin && (
            <Link
              to="/admin"
              className="flex items-center gap-2 text-sm font-medium text-brand-dark border border-brand-border rounded-lg px-4 py-2 hover:bg-brand-border hover:border-brand-orange/30 transition-all duration-200"
            >
              <ShieldCheck size={15} className="text-brand-orange" />
              {t('nav.adminPanel')}
            </Link>
          )}

          {/* Language toggle */}
          <button
            onClick={toggleLang}
            className="text-sm font-medium text-brand-muted border border-brand-border rounded-lg px-3 py-2 hover:text-brand-dark hover:bg-brand-border transition-all duration-200 min-w-[44px]"
          >
            {t('nav.lang')}
          </button>

          {/* Logout */}
          {user && (
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 text-sm text-brand-muted hover:text-brand-dark transition-colors p-2 rounded-lg hover:bg-brand-border"
              title={t('auth.logout')}
            >
              <LogOut size={16} />
            </button>
          )}
        </div>
      </div>
    </header>
  )
}
