import { useState } from 'react'
import { Upload, FileSpreadsheet, FileCode, AlertCircle } from 'lucide-react'
import { api } from '../../utils/api'
import toast from 'react-hot-toast'

export default function FileUploads({ onContactsLoaded, totalContacts }) {
  const [excelStatus, setExcelStatus] = useState(null)
  const [sendRange, setSendRange] = useState('all')
  const [firstN, setFirstN] = useState('')
  const [rangeFrom, setRangeFrom] = useState('1')
  const [rangeTo, setRangeTo] = useState('')
  const [delay, setDelay] = useState(20)

  const handleExcel = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    const fd = new FormData()
    fd.append('excelFile', file)
    const toastId = toast.loading('Processing Excel file...')
    const res = await api.parseExcel(fd)
    toast.dismiss(toastId)
    if (res.success) {
      setExcelStatus(res)
      onContactsLoaded(res.contacts, res.totalCount, file)
      setRangeTo(res.totalCount.toString())
      toast.success(`Found ${res.totalCount} contacts`)
    } else {
      toast.error(res.message || 'Failed to parse Excel')
    }
  }

  const getPreviewText = () => {
    const total = excelStatus?.totalCount || 0
    if (!total) return 'Upload Excel file first'
    if (sendRange === 'all') return `Will send to all ${total} contacts`
    if (sendRange === 'first') {
      const n = Math.min(parseInt(firstN) || 0, total)
      return `Will send to first ${n} contacts (of ${total})`
    }
    const from = parseInt(rangeFrom) || 1
    const to = Math.min(parseInt(rangeTo) || total, total)
    return `Will send to contacts ${from}–${to} (${to - from + 1} emails)`
  }

  const getRangeData = () => {
    const total = excelStatus?.totalCount || 0
    if (sendRange === 'all') return { start: 0, count: total }
    if (sendRange === 'first') return { start: 0, count: Math.min(parseInt(firstN) || total, total) }
    const from = Math.max(1, parseInt(rangeFrom) || 1)
    const to = Math.min(parseInt(rangeTo) || total, total)
    return { start: from - 1, count: Math.max(0, to - from + 1) }
  }

  // Expose getRangeData and delay to parent via data attributes (simple approach)
  if (onContactsLoaded.__setRange) onContactsLoaded.__setRange(getRangeData, delay)

  return (
    <div className="space-y-4">
      {/* Excel */}
      <div>
        <label className="label flex items-center gap-1.5"><FileSpreadsheet size={14} /> Excel File (Contacts) *</label>
        <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-slate-700 rounded-xl cursor-pointer hover:border-brand-500/60 hover:bg-brand-500/5 transition-all group">
          <Upload size={20} className="text-slate-500 group-hover:text-brand-400 mb-1.5 transition-colors" />
          <span className="text-xs text-slate-500 group-hover:text-brand-400 transition-colors">Click to upload .xlsx / .xls</span>
          <input type="file" className="hidden" accept=".xlsx,.xls" onChange={handleExcel} />
        </label>
        <p className="text-xs text-slate-500 mt-1">Required: Email column. Optional: FirstName, LastName, Company, Subject</p>
        {excelStatus && (
          <div className="mt-2 p-3 bg-emerald-500/8 border border-emerald-500/20 rounded-lg">
            <p className="text-xs text-emerald-400 font-semibold">✓ {excelStatus.totalCount} contacts loaded</p>
          </div>
        )}
      </div>

      {/* Range selection */}
      {excelStatus && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <label className="label mb-2">Email Range</label>
          <select value={sendRange} onChange={e => setSendRange(e.target.value)} className="input-field mb-3">
            <option value="all">Send to All Contacts</option>
            <option value="first">Send to First N Contacts</option>
            <option value="range">Send to Specific Range</option>
          </select>
          {sendRange === 'first' && (
            <div>
              <label className="label text-xs">Number of Emails</label>
              <input type="number" className="input-field" placeholder="e.g. 50" value={firstN} min={1} max={excelStatus.totalCount} onChange={e => setFirstN(e.target.value)} />
            </div>
          )}
          {sendRange === 'range' && (
            <div className="grid grid-cols-2 gap-3">
              <div><label className="label text-xs">From</label><input type="number" className="input-field" min={1} value={rangeFrom} onChange={e => setRangeFrom(e.target.value)} /></div>
              <div><label className="label text-xs">To</label><input type="number" className="input-field" min={1} max={excelStatus.totalCount} value={rangeTo} onChange={e => setRangeTo(e.target.value)} /></div>
            </div>
          )}
          <div className="mt-3 p-2.5 bg-brand-500/8 border border-brand-500/20 rounded-lg">
            <p className="text-xs text-brand-400">{getPreviewText()}</p>
          </div>
        </div>
      )}

      {/* HTML Template */}
      <div>
        <label className="label flex items-center gap-1.5"><FileCode size={14} /> HTML Template (Optional)</label>
        <label className="flex items-center gap-3 w-full px-4 py-3 border border-dashed border-slate-700 rounded-xl cursor-pointer hover:border-slate-600 transition-all">
          <Upload size={15} className="text-slate-500" />
          <span className="text-xs text-slate-500">Upload .html template (overrides editor)</span>
          <input type="file" className="hidden" accept=".html" name="htmlTemplate" />
        </label>
      </div>

      {/* Delay */}
      <div>
        <label className="label">Delay Between Emails (seconds)</label>
        <input type="number" className="input-field" value={delay} min={15} max={30} onChange={e => setDelay(parseInt(e.target.value))} />
        <p className="text-xs text-slate-500 mt-1">15–30 seconds recommended</p>
      </div>

      {/* Warning */}
      <div className="p-3 bg-amber-500/8 border border-amber-500/20 rounded-xl">
        <div className="flex items-start gap-2">
          <AlertCircle size={14} className="text-amber-400 mt-0.5 flex-shrink-0" />
          <div className="text-xs text-amber-300/80 space-y-0.5">
            <p><span className="font-semibold">Gmail:</span> Use App Passwords, not regular password</p>
            <p><span className="font-semibold">Outlook:</span> Regular password works</p>
            <p>Respect your provider's sending limits</p>
          </div>
        </div>
      </div>
    </div>
  )
}
