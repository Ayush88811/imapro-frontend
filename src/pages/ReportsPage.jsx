import { useState, useEffect, useCallback } from 'react'
import { RefreshCw, Download, Trash2, CheckCircle, XCircle, AlertTriangle, Mail, Pause, Play, X } from 'lucide-react'
import { api } from '../utils/api'
import toast from 'react-hot-toast'
import clsx from 'clsx'

const STATUS_STYLES = {
  sent: 'badge-success', failed: 'badge-danger', error: 'badge-warning',
}

export default function ReportsPage() {
  const [stats, setStats] = useState({ total: 0, sent: 0, failed: 0, errors: 0 })
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [batchStatus, setBatchStatus] = useState(null)
  const [autoRefresh, setAutoRefresh] = useState(true)

  const load = useCallback(async () => {
    try {
      const res = await api.getReport()
      if (res.success) { setStats(res.data.stats); setLogs(res.data.logs) }
    } catch {} finally { setLoading(false) }
  }, [])

  const loadBatch = useCallback(async () => {
    try {
      const res = await api.getBatchStatus()
      if (res.success && res.data.isRunning) setBatchStatus(res.data)
      else setBatchStatus(null)
    } catch {}
  }, [])

  useEffect(() => {
    load(); loadBatch()
    if (!autoRefresh) return
    const interval = setInterval(() => { load(); loadBatch() }, 5000)
    return () => clearInterval(interval)
  }, [load, loadBatch, autoRefresh])

  const handleExport = async (fmt) => {
    const res = await api.exportReport(fmt)
    if (res.ok) {
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url; a.download = `email-logs.${fmt}`
      a.click(); URL.revokeObjectURL(url)
      toast.success(`Exported as ${fmt.toUpperCase()}`)
    } else toast.error('Export failed')
  }

  const handleClear = async () => {
    if (!window.confirm('Clear all email logs?')) return
    const res = await api.clearLogs()
    if (res.success) { toast.success('Logs cleared'); load() }
    else toast.error('Failed to clear logs')
  }

  const batchJob = batchStatus?.currentJob
  const batchProgress = batchJob ? ((batchJob.emailsSent + batchJob.emailsFailed) / batchJob.totalContacts * 100).toFixed(1) : 0

  const STAT_CARDS = [
    { label: 'Total', value: stats.total, icon: Mail, color: 'text-brand-600', bg: 'bg-brand-50' },
    { label: 'Sent', value: stats.sent, icon: CheckCircle, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Failed', value: stats.failed, icon: XCircle, color: 'text-red-600', bg: 'bg-red-50' },
    { label: 'Errors', value: stats.errors, icon: AlertTriangle, color: 'text-amber-600', bg: 'bg-amber-50' },
  ]

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 animate-fade-in space-y-5">
      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {STAT_CARDS.map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="card p-4 flex items-center gap-3 card-hover">
            <div className={clsx('w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0', bg)}>
              <Icon size={18} className={color} />
            </div>
            <div>
              <p className={clsx('text-2xl font-display font-bold', color)}>{value}</p>
              <p className="text-xs font-medium text-slate-500">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Batch status */}
      {batchJob && (
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="section-title">⚡ Batch Processing</h2>
            <div className="flex gap-2">
              <button onClick={() => api.pauseBatch().then(r => r.success && toast.success('Paused'))} className="btn-outline text-xs px-3 py-1.5"><Pause size={13} /> Pause</button>
              <button onClick={() => api.resumeBatch().then(r => r.success && toast.success('Resumed'))} className="btn-outline text-xs px-3 py-1.5"><Play size={13} /> Resume</button>
              <button onClick={() => { if (window.confirm('Cancel batch?')) api.cancelBatch().then(r => r.success && (setBatchStatus(null), toast.success('Cancelled'))) }} className="btn-danger text-xs px-3 py-1.5"><X size={13} /> Cancel</button>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            {[['Status', <span className={`badge ${batchJob.status === 'Paused' ? 'badge-warning' : 'badge-info'}`}>{batchJob.status}</span>],
              ['Progress', `${batchJob.emailsSent + batchJob.emailsFailed}/${batchJob.totalContacts}`],
              ['Batch', `${batchJob.currentBatch}/${batchJob.totalBatches}`],
              ['Sent / Failed', <span><span className="text-emerald-600 font-semibold">{batchJob.emailsSent}</span> / <span className="text-red-600 font-semibold">{batchJob.emailsFailed}</span></span>]
            ].map(([k, v]) => (
              <div key={k} className="bg-slate-50 border border-slate-200 rounded-lg p-3">
                <p className="text-xs text-slate-500 mb-1">{k}</p>
                <p className="text-sm font-medium text-slate-800">{v}</p>
              </div>
            ))}
          </div>
          <div className="w-full bg-slate-100 rounded-full h-3">
            <div className="bg-brand-500 h-3 rounded-full transition-all duration-500 bg-gradient-to-r from-brand-500 to-brand-300" style={{ width: `${batchProgress}%` }} />
          </div>
          <div className="flex justify-between text-xs text-slate-500 mt-1.5 font-medium">
            <span>{batchProgress}% complete</span>
            {batchJob.nextBatchTime && <span className="text-amber-600">Next batch: {new Date(batchJob.nextBatchTime).toLocaleTimeString()}</span>}
          </div>
        </div>
      )}

      {/* Logs table */}
      <div className="card">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between p-5 border-b border-slate-200 gap-4">
          <div className="flex items-center gap-3">
            <h2 className="section-title">📊 Email Logs</h2>
            <label className="flex items-center gap-1.5 cursor-pointer">
              <div className={`relative w-8 h-4 rounded-full transition-colors ${autoRefresh ? 'bg-brand-500' : 'bg-slate-300'}`} onClick={() => setAutoRefresh(a => !a)}>
                <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full shadow transition-transform ${autoRefresh ? 'translate-x-4' : 'translate-x-0.5'}`} />
              </div>
              <span className="text-xs text-slate-500 font-medium">Auto-refresh</span>
            </label>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={load} className="btn-outline text-xs px-3 py-1.5"><RefreshCw size={13} /> Refresh</button>
            <button onClick={() => handleExport('csv')} className="btn-outline text-xs px-3 py-1.5"><Download size={13} /> CSV</button>
            <button onClick={() => handleExport('json')} className="btn-outline text-xs px-3 py-1.5"><Download size={13} /> JSON</button>
            <button onClick={handleClear} className="btn-danger text-xs px-3 py-1.5"><Trash2 size={13} /> Clear</button>
          </div>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="w-6 h-6 border-2 border-brand-500/30 border-t-brand-500 rounded-full animate-spin" />
            </div>
          ) : logs.length === 0 ? (
            <div className="text-center py-12">
              <Mail size={32} className="text-slate-300 mx-auto mb-2" />
              <p className="text-slate-500 text-sm">No email logs found</p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/50">
                  {['Email', 'Status', 'Name', 'Company', 'Subject', 'Timestamp', 'Error'].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-bold text-slate-600 uppercase tracking-wider whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {logs.map((log, i) => (
                  <tr key={i} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 font-mono text-xs text-slate-700">{log.email}</td>
                    <td className="px-4 py-3">
                      <span className={STATUS_STYLES[log.status?.toLowerCase()] || 'badge-default'}>{log.status}</span>
                    </td>
                    <td className="px-4 py-3 text-slate-600 text-xs">{log.firstName || '—'}</td>
                    <td className="px-4 py-3 text-slate-600 text-xs">{log.company || '—'}</td>
                    <td className="px-4 py-3 text-slate-600 text-xs max-w-[180px] truncate">{log.subject || '—'}</td>
                    <td className="px-4 py-3 text-slate-500 text-xs whitespace-nowrap">{new Date(log.timestamp).toLocaleString()}</td>
                    <td className="px-4 py-3 text-red-600 text-xs max-w-[150px] truncate">{log.message || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  )
}