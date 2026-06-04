import { useState } from 'react'
import { Eye, EyeOff, Wifi } from 'lucide-react'

const SMTP_PRESETS = [
  { label: 'Gmail', host: 'smtp.gmail.com', port: 587, secure: false },
  { label: 'Outlook', host: 'smtp.office365.com', port: 587, secure: false },
  { label: 'Yahoo', host: 'smtp.mail.yahoo.com', port: 587, secure: false },
  { label: 'Custom', host: '', port: 587, secure: false },
]

export default function ConfigForm({ initial = {}, onSubmit, onTest, submitLabel = 'Save Configuration' }) {
  const [form, setForm] = useState({
    name: '', host: '', port: 587, secure: false, user: '', pass: '',
    fromEmail: '', fromName: '', isDefault: false, ...initial
  })
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handlePreset = (p) => {
    if (p.host) setForm(f => ({ ...f, host: p.host, port: p.port, secure: p.secure }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    await onSubmit(form)
    setLoading(false)
  }

  const handleTest = async () => {
    setLoading(true)
    await onTest({ host: form.host, port: form.port, secure: form.secure, user: form.user, pass: form.pass })
    setLoading(false)
  }

  const isGmail = form.host?.toLowerCase().includes('gmail')

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Presets */}
      <div>
        <label className="label">Quick Presets</label>
        <div className="flex flex-wrap gap-2">
          {SMTP_PRESETS.map(p => (
            <button key={p.label} type="button" onClick={() => handlePreset(p)}
              className="px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-brand-500/20 hover:text-brand-400 border border-slate-700 hover:border-brand-500/40 text-slate-300 transition-all">
              {p.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="label">Configuration Name *</label>
        <input className="input-field" placeholder="e.g. My Gmail" value={form.name} onChange={e => set('name', e.target.value)} required />
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="col-span-2">
          <label className="label">SMTP Host *</label>
          <input className="input-field" placeholder="smtp.gmail.com" value={form.host} onChange={e => set('host', e.target.value)} required />
        </div>
        <div>
          <label className="label">Port *</label>
          <input type="number" className="input-field" value={form.port} onChange={e => set('port', parseInt(e.target.value))} required />
        </div>
      </div>

      <label className="flex items-center gap-2.5 cursor-pointer">
        <div className={`relative w-10 h-5 rounded-full transition-colors ${form.secure ? 'bg-brand-500' : 'bg-slate-700'}`} onClick={() => set('secure', !form.secure)}>
          <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${form.secure ? 'translate-x-5' : 'translate-x-0.5'}`} />
        </div>
        <span className="text-sm text-slate-300">Use TLS/SSL</span>
      </label>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="label">Username *</label>
          <input className="input-field" value={form.user} onChange={e => set('user', e.target.value)} required />
        </div>
        <div>
          <label className="label">Password *</label>
          <div className="relative">
            <input type={showPass ? 'text' : 'password'} className="input-field pr-10"
              placeholder={isGmail ? '16-char app password' : 'password'}
              value={form.pass} onChange={e => set('pass', e.target.value)} required />
            <button type="button" onClick={() => setShowPass(s => !s)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200">
              {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>
          {isGmail && <p className="mt-1 text-xs text-amber-400">Use App Password, not regular password</p>}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="label">From Email *</label>
          <input type="email" className="input-field" value={form.fromEmail} onChange={e => set('fromEmail', e.target.value)} required />
        </div>
        <div>
          <label className="label">From Name</label>
          <input className="input-field" placeholder="Your Name" value={form.fromName} onChange={e => set('fromName', e.target.value)} />
        </div>
      </div>

      <label className="flex items-center gap-2.5 cursor-pointer">
        <input type="checkbox" className="w-4 h-4 accent-brand-500" checked={form.isDefault} onChange={e => set('isDefault', e.target.checked)} />
        <span className="text-sm text-slate-300">Set as default configuration</span>
      </label>

      <div className="flex items-center gap-3 pt-2">
        <button type="submit" disabled={loading} className="btn-primary">
          {loading ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : null}
          {submitLabel}
        </button>
        {onTest && (
          <button type="button" onClick={handleTest} disabled={loading} className="btn-outline">
            <Wifi size={15} /> Test Connection
          </button>
        )}
      </div>
    </form>
  )
}
