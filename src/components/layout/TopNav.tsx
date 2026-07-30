import { NavLink } from 'react-router-dom'
import { BookOpen, LayoutDashboard, LogOut, Receipt, ReceiptText, Settings, UserCog } from 'lucide-react'
import { useT } from '../../i18n/I18nContext'
import { useUiStore } from '../../stores/uiStore'
import { useAuthStore } from '../../stores/authStore'
import { signOut } from '../../firebase/auth'
import { RoleGate } from './RoleGate'

const linkClass = ({ isActive }: { isActive: boolean }) =>
  `flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors duration-150 ${
    isActive ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
  }`

export function TopNav() {
  const t = useT()
  const language = useUiStore((s) => s.language)
  const setLanguage = useUiStore((s) => s.setLanguage)
  const session = useAuthStore((s) => s.session)

  return (
    <header className="no-print sticky top-0 z-10 hidden border-b border-slate-200 bg-white/90 backdrop-blur-sm md:block">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <div className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-blue-700 text-sm font-bold text-white shadow-sm">
            UF
          </span>
          <span className="text-base font-semibold text-slate-900">{t('app.name')}</span>
        </div>
        <nav className="flex items-center gap-1">
          <NavLink to="/bills/new" className={linkClass}>
            <ReceiptText size={16} />
            {t('nav.newBill')}
          </NavLink>
          <NavLink to="/bills" className={linkClass}>
            <Receipt size={16} />
            {t('nav.bills')}
          </NavLink>
          <NavLink to="/ledger" className={linkClass}>
            <BookOpen size={16} />
            {t('nav.ledger')}
          </NavLink>
          <NavLink to="/dashboard" className={linkClass}>
            <LayoutDashboard size={16} />
            {t('nav.dashboard')}
          </NavLink>
          <RoleGate roles={['admin']}>
            <NavLink to="/settings" className={linkClass}>
              <Settings size={16} />
              {t('nav.settings')}
            </NavLink>
          </RoleGate>
          <RoleGate roles={['admin']}>
            <NavLink to="/users" className={linkClass}>
              <UserCog size={16} />
              {t('nav.users')}
            </NavLink>
          </RoleGate>
        </nav>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setLanguage(language === 'hi' ? 'en' : 'hi')}
            className="rounded-full border border-slate-300 px-3 py-1 text-xs font-medium text-slate-600 transition-colors hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700"
          >
            {language === 'hi' ? 'English' : 'Hinglish'}
          </button>
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-100 text-xs font-semibold text-blue-700">
              {session?.name?.[0]?.toUpperCase() ?? '?'}
            </span>
            <span className="text-sm text-slate-600">{session?.name}</span>
          </div>
          <button
            onClick={() => signOut()}
            className="flex h-9 w-9 items-center justify-center rounded-full text-slate-400 transition-colors hover:bg-red-50 hover:text-red-600"
            aria-label={t('nav.logout')}
            title={t('nav.logout')}
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </header>
  )
}
