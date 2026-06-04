import { Activity, Calendar, Zap, Clock } from 'lucide-react'

export default function JobDashboard({ data }) {
  const { batch, scheduledJobs } = data
  const hasJobs = (batch?.isRunning) || (scheduledJobs?.length > 0)
  if (!hasJobs) return null

  const job = batch?.currentJob
  const progress = job ? ((job.emailsSent + job.emailsFailed) / job.totalContacts * 100).toFixed(1) : 0

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 mb-6 animate-slide-up">
      <div className="card p-5">
        <div className="flex items-center gap-2 mb-4">
          <Activity size={16} className="text-brand-400" />
          <h2 className="section-title">Active Jobs Dashboard</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Batch jobs */}
          <div>
            <div className="flex items-center gap-1.5 mb-2">
              <Zap size={13} className="text-amber-400" />
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Active Batch</span>
            </div>
            {job ? (
              <div className="bg-slate-900 rounded-xl p-4 border border-slate-800">
                <div className="flex justify-between items-start mb-3">
                  <span className="text-sm font-medium text-slate-200">Batch Job: {job.id?.slice(0, 8)}</span>
                  <span className={`badge ${job.status === 'Paused' ? 'badge-warning' : 'badge-info'}`}>{job.status}</span>
                </div>
                <div className="text-xs text-slate-400 mb-3">
                  {job.emailsSent}/{job.totalContacts} emails • Batch {job.currentBatch}/{job.totalBatches}
                </div>
                <div className="w-full bg-slate-800 rounded-full h-2">
                  <div className="bg-brand-500 h-2 rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
                </div>
                <div className="flex justify-between text-xs text-slate-500 mt-1.5">
                  <span>{progress}% complete</span>
                  {job.nextBatchTime && <span className="text-amber-400">Next: {new Date(job.nextBatchTime).toLocaleTimeString()}</span>}
                </div>
              </div>
            ) : (
              <div className="bg-slate-900 rounded-xl p-4 border border-dashed border-slate-800 text-center">
                <p className="text-sm text-slate-500">No active batch jobs</p>
              </div>
            )}
          </div>

          {/* Scheduled jobs */}
          <div>
            <div className="flex items-center gap-1.5 mb-2">
              <Calendar size={13} className="text-purple-400" />
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Upcoming</span>
            </div>
            {scheduledJobs?.length > 0 ? (
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {scheduledJobs.slice(0, 3).map(j => (
                  <div key={j.id} className="bg-slate-900 rounded-xl p-3 border border-slate-800 flex justify-between items-center">
                    <div>
                      <p className="text-sm font-medium text-slate-200 truncate max-w-[160px]">{j.subject || 'Bulk Email'}</p>
                      <p className="text-xs text-slate-500">{j.contact_count} contacts</p>
                    </div>
                    <div className="text-right">
                      <span className="badge-warning badge text-xs">{j.status}</span>
                      <p className="text-xs text-slate-500 mt-1">{new Date(j.scheduled_time).toLocaleTimeString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-slate-900 rounded-xl p-4 border border-dashed border-slate-800 text-center">
                <p className="text-sm text-slate-500">No scheduled jobs</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
