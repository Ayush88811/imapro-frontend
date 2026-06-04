import { useState, useRef } from 'react'
import { Send, Eye, Calendar } from 'lucide-react'
import SmtpSelector from '../components/compose/SmtpSelector'
import FileUploads from '../components/compose/FileUploads'
import BatchScheduleSettings from '../components/compose/BatchScheduleSettings'
import EmailEditor from '../components/compose/EmailEditor'
import Modal from '../components/shared/Modal'
import { api } from '../utils/api'
import toast from 'react-hot-toast'

export default function ComposePage({ configs, selectedConfigId, onSelectConfig, onSaveConfig, onTestConfig, onDeleteConfig, onSetDefault, onSent }) {
  const [subject, setSubject] = useState('')
  const [htmlContent, setHtmlContent] = useState('')
  const [excelFile, setExcelFile] = useState(null)
  const [contacts, setContacts] = useState([])
  const [totalContacts, setTotalContacts] = useState(0)
  const [batchSettings, setBatchSettings] = useState({ useBatch: false })
  const [scheduleSettings, setScheduleSettings] = useState({ scheduleEmail: false })
  const [sending, setSending] = useState(false)
  const [previewOpen, setPreviewOpen] = useState(false)
  const [previewData, setPreviewData] = useState({})
  const rangeRef = useRef(() => ({ start: 0, count: 0 }))
  const delayRef = useRef(20)

  // Register range getter from FileUploads
  const handleContactsLoaded = (ctcts, total, file) => {
    setContacts(ctcts); setTotalContacts(total); setExcelFile(file)
  }
  handleContactsLoaded.__setRange = (fn, delay) => { rangeRef.current = fn; delayRef.current = delay }

  const handlePreview = () => {
    const sample = contacts[0] || { FirstName: 'John', LastName: 'Doe', Company: 'Acme Corp', Email: 'john@example.com' }
    let subj = subject, body = htmlContent
    Object.keys(sample).forEach(k => {
      const re = new RegExp(`\\{\\{${k}\\}\\}`, 'g')
      subj = subj.replace(re, sample[k] || '')
      body = body.replace(re, sample[k] || '')
    })
    setPreviewData({ subject: subj, body, source: contacts[0] ? sample.Email : 'sample data' })
    setPreviewOpen(true)
  }

  const handleSend = async () => {
    if (!selectedConfigId) { toast.error('Select an SMTP configuration first'); return }
    if (!subject.trim()) { toast.error('Subject is required'); return }
    if (!excelFile) { toast.error('Excel file is required'); return }
    if (!htmlContent || htmlContent === '<p><br></p>') { toast.error('Email content is required'); return }

    const selectedConfig = configs.find(c => c.id === selectedConfigId)
    if (!selectedConfig) { toast.error('Selected configuration not found'); return }

    if (scheduleSettings.scheduleEmail) {
      if (!scheduleSettings.scheduledTime) { toast.error('Select a schedule date and time'); return }
      const scheduled = new Date(scheduleSettings.scheduledTime)
      if (scheduled <= new Date()) { toast.error('Scheduled time must be in the future'); return }
    }

    const fd = new FormData()
    fd.set('configId', selectedConfigId)
    fd.set('smtpHost', selectedConfig.host)
    fd.set('smtpPort', selectedConfig.port.toString())
    fd.set('smtpSecure', selectedConfig.secure ? 'on' : 'off')
    fd.set('smtpUser', selectedConfig.user)
    fd.set('smtpPass', selectedConfig.pass)
    fd.set('fromEmail', selectedConfig.fromEmail)
    fd.set('fromName', selectedConfig.fromName || '')
    fd.set('subject', subject.trim())
    fd.set('htmlContent', htmlContent)
    fd.set('delay', delayRef.current.toString())

    fd.set('useBatch', batchSettings.useBatch ? 'on' : 'off')
    if (batchSettings.useBatch) {
      fd.set('batchSize', batchSettings.batchSize.toString())
      fd.set('batchDelay', batchSettings.batchDelay.toString())
      fd.set('emailDelay', batchSettings.emailDelay.toString())
    }

    if (scheduleSettings.scheduleEmail) {
      fd.set('scheduleEmail', 'on')
      fd.set('scheduledTime', new Date(scheduleSettings.scheduledTime).toISOString())
      if (scheduleSettings.notifyEmail) fd.set('notifyEmail', scheduleSettings.notifyEmail)
      if (scheduleSettings.notifyBrowser) fd.set('notifyBrowser', 'on')
    }

    const range = rangeRef.current()
    fd.set('emailRangeStart', range.start.toString())
    fd.set('emailRangeCount', range.count.toString())
    fd.set('excelFile', excelFile)

    setSending(true)
    try {
      const res = await api.send(fd)
      if (res.success) {
        if (res.scheduledMode) {
          toast.success(`Campaign scheduled for ${new Date(res.scheduledTime).toLocaleString()}`)
        } else if (res.batchMode) {
          toast.success(`Batch processing started for ${res.contactCount} contacts`)
        } else {
          toast.success(`Sending to ${res.contactCount} contacts!`)
        }
        onSent?.()
      } else {
        toast.error(res.message || 'Send failed')
      }
    } catch (e) {
      toast.error('Network error: ' + e.message)
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 animate-fade-in">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left column */}
        <div className="space-y-5">
          {/* SMTP */}
          <div className="card p-5">
            <h2 className="section-title mb-4">📮 SMTP Configuration</h2>
            <SmtpSelector configs={configs} selectedId={selectedConfigId} onSelect={onSelectConfig}
              onSave={async (data, id) => id ? await onSaveConfig(data, id) : await onSaveConfig(data)}
              onTest={onTestConfig} onDelete={onDeleteConfig} onSetDefault={onSetDefault} />
          </div>

          {/* Files */}
          <div className="card p-5">
            <h2 className="section-title mb-4">📄 File Uploads</h2>
            <FileUploads onContactsLoaded={handleContactsLoaded} totalContacts={totalContacts} />
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-5">
          <div className="card p-5">
            <h2 className="section-title mb-4">⚙️ Sending Options</h2>
            <BatchScheduleSettings onBatchChange={setBatchSettings} onScheduleChange={setScheduleSettings} />
          </div>
        </div>
      </div>

      {/* Email Content */}
      <div className="card p-5 mt-6">
        <h2 className="section-title mb-4">✉️ Email Content</h2>
        <div className="mb-4">
          <label className="label">Subject *</label>
          <input className="input-field" placeholder="Hello {{FirstName}}, welcome to {{Company}}!"
            value={subject} onChange={e => setSubject(e.target.value)} required />
           <p className="text-xs text-slate-500 mt-1.5">
            Use {"{{FirstName}}"}, {"{{Company}}"} etc. as placeholders
          </p>
        </div>
        <div className="mb-5">
          <label className="label">Email Body *</label>
          <EmailEditor onChange={setHtmlContent} />
          <p className="text-xs text-slate-500 mt-1.5">
            Supports {"{{placeholder}}"} personalization
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={handleSend} disabled={sending} className="btn-primary">
            {sending
              ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              : <Send size={15} />}
            {scheduleSettings.scheduleEmail ? 'Schedule Campaign' : 'Send Emails'}
          </button>
          <button onClick={handlePreview} className="btn-secondary">
            <Eye size={15} /> Preview
          </button>
          {scheduleSettings.scheduleEmail && (
            <span className="badge-info flex items-center gap-1.5">
              <Calendar size={12} /> Will be scheduled
            </span>
          )}
        </div>
      </div>

      {/* Preview Modal */}
      <Modal isOpen={previewOpen} onClose={() => setPreviewOpen(false)} title="Email Preview" size="lg"
        footer={<button onClick={() => setPreviewOpen(false)} className="btn-secondary">Close</button>}>
        <div className="space-y-3">
          {/* Updated background and text colors for light theme */}
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
            <p className="text-xs text-slate-500 mb-1">Subject</p>
            <p className="text-sm font-semibold text-slate-800">{previewData.subject}</p>
          </div>
          {previewData.source && (
            <div className="p-2.5 bg-brand-50 border border-brand-200 rounded-lg">
              <p className="text-xs font-medium text-brand-700">Preview using: {previewData.source}</p>
            </div>
          )}
          {/* Updated text color for the email body preview */}
          <div className="bg-white border border-slate-200 rounded-lg p-4 overflow-auto max-h-96 text-slate-800">
            <div dangerouslySetInnerHTML={{ __html: previewData.body || '' }} />
          </div>
        </div>
      </Modal>
    </div>
  )
}
