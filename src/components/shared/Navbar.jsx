import { useState } from 'react'
import { Mail, BarChart2, Settings, LogOut, User, ChevronDown } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import clsx from 'clsx'

export default function Navbar({ activeTab, onTabChange }) {
  const { user, logout } = useAuth()
  const [dropdownOpen, setDropdownOpen] = useState(false)

  const tabs = [
    { id: 'compose', label: 'Compose', icon: Mail },
    { id: 'report', label: 'Reports', icon: BarChart2 },
    { id: 'configs', label: 'My Configs', icon: Settings },
  ]

  return (
    <nav className="sticky top-0 z-50 bg-slate-950/90 backdrop-blur border-b border-slate-800/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center h-16 gap-6">
          <div className="flex items-center gap-2.5 mr-4">
            <div className="w-8 h-8 bg-brand-500 rounded-lg flex items-center justify-center shadow-glow-sm">
              <Mail size={16} className="text-white" />
            </div>
            <span className="font-display font-700 text-slate-100 text-lg tracking-tight hidden sm:block">BulkMail</span>
          </div>
          <div className="flex items-center gap-1 flex-1">
            {tabs.map(({ id, label, icon: Icon }) => (
              <button key={id} onClick={() => onTabChange(id)}
                className={clsx('flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-150',
                  activeTab === id ? 'bg-brand-500/15 text-brand-400 border border-brand-500/30' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60')}>
                <Icon size={15} /><span className="hidden sm:block">{label}</span>
              </button>
            ))}
          </div>
          <div className="relative">
            <button onClick={() => setDropdownOpen(o => !o)}
              className="flex items-center gap-2.5 px-3 py-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 hover:bg-emerald-500/15 transition-colors">
              <div className="w-6 h-6 bg-emerald-500/30 rounded-full flex items-center justify-center">
                <User size={13} className="text-emerald-400" />
              </div>
              <span className="text-sm font-medium text-emerald-300 hidden sm:block max-w-[120px] truncate">{user?.name || 'User'}</span>
              <ChevronDown size={14} className={clsx('text-emerald-400 transition-transform', dropdownOpen && 'rotate-180')} />
            </button>
            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-52 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl py-1 animate-fade-in">
                <div className="px-4 py-3 border-b border-slate-800">
                  <p className="text-sm font-semibold text-slate-200">{user?.name}</p>
                  <p className="text-xs text-slate-500 truncate mt-0.5">{user?.email}</p>
                </div>
                <button onClick={() => { onTabChange('configs'); setDropdownOpen(false) }}
                  className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-slate-300 hover:bg-slate-800 hover:text-slate-100 transition-colors">
                  <Settings size={14} /> SMTP Configurations
                </button>
                <button onClick={() => { logout(); setDropdownOpen(false) }}
                  className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 transition-colors">
                  <LogOut size={14} /> Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
