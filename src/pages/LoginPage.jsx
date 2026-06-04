import { useState } from 'react'
import { Mail, Lock, User, Eye, EyeOff, ArrowRight } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import { useNavigate } from 'react-router-dom'
import clsx from 'clsx'

export default function LoginPage() {
  const { login, register } = useAuth()
  const navigate = useNavigate()
  const [tab, setTab] = useState('login')
  const [loading, setLoading] = useState(false)
  const [showPass, setShowPass] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(''); setLoading(true)
    try {
      const res = tab === 'login'
        ? await login(form.email, form.password)
        : await register(form.name, form.email, form.password)
      if (res.success) navigate('/')
      else setError(res.message || 'Authentication failed')
    } catch { setError('Network error') } finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'radial-gradient(ellipse at 50% 0%, rgba(55,135,122,0.15) 0%, transparent 70%), #f0f4f4' }}>
      {/* Decorative blobs adjusted for light theme */}
      <div className="fixed top-20 left-20 w-64 h-64 bg-brand-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="fixed bottom-20 right-20 w-80 h-80 bg-brand-300/20 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md animate-slide-up relative z-10">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-brand-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-glow">
            <Mail size={26} className="text-white" />
          </div>
          <h1 className="text-3xl font-display font-bold text-slate-900 tracking-tight">BulkMail</h1>
          <p className="text-slate-500 text-sm mt-1.5">Secure bulk email management platform</p>
        </div>

        {/* Card */}
        <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-xl">
          {/* Tabs */}
          <div className="flex p-1 bg-slate-100 rounded-xl mb-6">
            {['login', 'register'].map(t => (
              <button key={t} onClick={() => { setTab(t); setError('') }}
                className={clsx('flex-1 py-2 rounded-lg text-sm font-semibold transition-all duration-150',
                  tab === t ? 'bg-brand-500 text-white shadow-sm' : 'text-slate-500 hover:text-slate-800 hover:bg-white/50')}>
                {t === 'login' ? 'Sign In' : 'Sign Up'}
              </button>
            ))}
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600 animate-fade-in">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {tab === 'register' && (
              <div className="animate-fade-in">
                <label className="label">Full Name</label>
                <div className="relative">
                  <User size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input className="input-field pl-10" placeholder="Your Name" value={form.name} onChange={e => set('name', e.target.value)} required />
                </div>
              </div>
            )}
            <div>
              <label className="label">Email Address</label>
              <div className="relative">
                <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input type="email" className="input-field pl-10" placeholder="you@example.com" value={form.email} onChange={e => set('email', e.target.value)} required />
              </div>
            </div>
            <div>
              <label className="label">Password</label>
              <div className="relative">
                <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input type={showPass ? 'text' : 'password'} className="input-field pl-10 pr-10" placeholder="••••••••"
                  value={form.password} onChange={e => set('password', e.target.value)} required minLength={6} />
                <button type="button" onClick={() => setShowPass(s => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors">
                  {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full justify-center mt-2 py-3">
              {loading
                ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                : <><span>{tab === 'login' ? 'Sign In' : 'Create Account'}</span><ArrowRight size={15} /></>}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-slate-400 mt-6 font-medium">
          Secure session-based authentication
        </p>
      </div>
    </div>
  )
}