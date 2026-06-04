import { useState } from 'react'
import { Zap, Clock, Bell } from 'lucide-react'
import { api } from '../../utils/api'
import toast from 'react-hot-toast'

export default function BatchScheduleSettings({ onBatchChange, onScheduleChange }) {
  const [useBatch, setUseBatch] = useState(false)
  const [batchSize, setBatchSize] = useState(20)
  const [batchDelay, setBatchDelay] = useState(60)
  const [emailDelay, setEmailDelay] = useState(45)
  const [scheduleEmail, setScheduleEmail] = useState(false)
  const [scheduledTime, setScheduledTime] = useState('')
  const [notifyEmail, setNotifyEmail] = useState('')
  const [notifyBrowser, setNotifyBrowser] = useState(false)

  const handleBatchToggle = (v) => {
    setUseBatch(v)
    onBatchChange(v ? { useBatch: true, batchSize, batchDelay, emailDelay } : { useBatch: false })
  }

  const handleScheduleToggle = (v) => {
    setScheduleEmail(v)
    if (v) {
      const now = new Date()
      const oneHour = new Date(now.getTime() + 60 * 60 * 1000)
      const local = new Date(oneHour.getTime() - oneHour.getTimezoneOffset() * 60000)
      setScheduledTime(local.toISOString().slice(0, 16))
    }
    onScheduleChange(v ? { scheduleEmail: true, scheduledTime, notifyEmail, notifyBrowser } : { scheduleEmail: false })
  }

  const testNotification = async () => {
    if (!notifyEmail) { toast.error('Enter an email to test'); return }
    const res = await api.testNotification({ testEmail: notifyEmail })
    if (res.success) toast.success('Test notification sent!')
    else toast.error(res.message || 'Failed to send')
  }

  return (
    <div className="space-y-3">
      {/* Batch */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
        <label className="flex items-center gap-3 cursor-pointer">
          <div className={`relative w-10 h-5 rounded-full transition-colors ${useBatch ? 'bg-brand-500' : 'bg-slate-700'}`} onClick={() => handleBatchToggle(!useBatch)}>
            <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${useBatch ? 'translate-x-5' : 'translate-x-0.5'}`} />
          </div>
          <div>
            <div className="flex items-center gap-1.5"><Zap size={14} className="text-amber-400" /><span className="text-sm font-semibold text-slate-200">Enable Batch Processing</span></div>
            <p className="text-xs text-slate-500 mt-0.5">Recommended for large lists to avoid limits</p>
          </div>
        </label>
        {useBatch && (
          <div className="mt-4 pt-4 border-t border-slate-800 grid grid-cols-3 gap-3 animate-fade-in">
            {[['Emails/Batch', batchSize, setBatchSize, 5, 50], ['Batch Delay (min)', batchDelay, setBatchDelay, 30, 180], ['Email Delay (sec)', emailDelay, setEmailDelay, 30, 60]].map(([label, val, set, min, max]) => (
              <div key={label}>
                <label className="label text-xs">{label}</label>
                <input type="number" className="input-field" value={val} min={min} max={max}
                  onChange={e => { set(parseInt(e.target.value)); onBatchChange({ useBatch: true, batchSize, batchDelay, emailDelay }) }} />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Schedule */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
        <label className="flex items-center gap-3 cursor-pointer">
          <div className={`relative w-10 h-5 rounded-full transition-colors ${scheduleEmail ? 'bg-brand-500' : 'bg-slate-700'}`} onClick={() => handleScheduleToggle(!scheduleEmail)}>
            <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${scheduleEmail ? 'translate-x-5' : 'translate-x-0.5'}`} />
          </div>
          <div>
            <div className="flex items-center gap-1.5"><Clock size={14} className="text-purple-400" /><span className="text-sm font-semibold text-slate-200">Schedule for Later</span></div>
            <p className="text-xs text-slate-500 mt-0.5">Send at a specific date/time automatically</p>
          </div>
        </label>
        {scheduleEmail && (
          <div className="mt-4 pt-4 border-t border-slate-800 space-y-3 animate-fade-in">
            <div>
              <label className="label text-xs">Schedule Date & Time</label>
              <input type="datetime-local" className="input-field" value={scheduledTime}
                min={new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16)}
                onChange={e => { setScheduledTime(e.target.value); onScheduleChange({ scheduleEmail: true, scheduledTime: e.target.value, notifyEmail, notifyBrowser }) }} />
              <p className="text-xs text-slate-500 mt-1">Timezone: {Intl.DateTimeFormat().resolvedOptions().timeZone}</p>
            </div>
            <div>
              <label className="label text-xs flex items-center gap-1.5"><Bell size={12} /> Notification Email</label>
              <div className="flex gap-2">
                <input type="email" className="input-field" placeholder="Email for completion notification" value={notifyEmail} onChange={e => setNotifyEmail(e.target.value)} />
                <button type="button" onClick={testNotification} className="btn-outline text-xs px-3 flex-shrink-0">Test</button>
              </div>
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" className="accent-brand-500" checked={notifyBrowser} onChange={e => setNotifyBrowser(e.target.checked)} />
              <span className="text-xs text-slate-300">Browser notification</span>
            </label>
          </div>
        )}
      </div>
    </div>
  )
}
