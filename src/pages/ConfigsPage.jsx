import { Plus, Eye, Pencil, Trash2, Star, Server, Shield, User2 } from 'lucide-react'
import { useState } from 'react'
import Modal from '../components/shared/Modal'
import ConfigForm from '../components/shared/ConfigForm'
import clsx from 'clsx'

export default function ConfigsPage({ configs, onSave, onTest, onDelete, onSetDefault }) {
  const [showAdd, setShowAdd] = useState(false)
  const [viewConfig, setViewConfig] = useState(null)
  const [editConfig, setEditConfig] = useState(null)

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 animate-fade-in">
      <div className="card">
        <div className="flex items-center justify-between p-5 border-b border-slate-200">
          <div>
            <h1 className="section-title">⚙️ My SMTP Configurations</h1>
            <p className="text-xs text-slate-500 mt-1">{configs.length} configuration{configs.length !== 1 ? 's' : ''} saved</p>
          </div>
          <button onClick={() => setShowAdd(true)} className="btn-primary">
            <Plus size={15} /> Add Configuration
          </button>
        </div>

        <div className="p-5">
          {configs.length === 0 ? (
            <div className="text-center py-16">
              <Server size={40} className="text-slate-400 mx-auto mb-3" />
              <h3 className="text-slate-600 font-semibold mb-1">No Configurations</h3>
              <p className="text-slate-500 text-sm mb-4">Add your first SMTP configuration to start sending emails</p>
              <button onClick={() => setShowAdd(true)} className="btn-primary inline-flex">
                <Plus size={15} /> Add Configuration
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {configs.map(cfg => (
                <div key={cfg.id} className={clsx('card card-hover p-4 transition-all', cfg.isDefault && 'border-emerald-500/30')}>
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 bg-brand-50 rounded-xl flex items-center justify-center flex-shrink-0 border border-brand-100">
                        <span className="text-brand-600 font-bold text-sm">{cfg.name[0].toUpperCase()}</span>
                      </div>
                      <div>
                        <h3 className="text-sm font-semibold text-slate-800 leading-tight">{cfg.name}</h3>
                        {cfg.isDefault && <span className="badge-success mt-0.5">DEFAULT</span>}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <Server size={11} /><span className="truncate">{cfg.host}:{cfg.port}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <User2 size={11} /><span className="truncate">{cfg.fromEmail}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <Shield size={11} className={cfg.secure ? 'text-emerald-500' : 'text-amber-500'} />
                      <span className={cfg.secure ? 'text-emerald-600' : 'text-amber-600'}>{cfg.secure ? 'TLS/SSL' : 'No encryption'}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 border-t border-slate-100 pt-3">
                    <button onClick={() => setViewConfig(cfg)} title="View" className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg text-xs text-slate-500 hover:text-cyan-600 hover:bg-cyan-50 transition-colors">
                      <Eye size={13} />
                    </button>
                    <button onClick={() => setEditConfig(cfg)} title="Edit" className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg text-xs text-slate-500 hover:text-brand-600 hover:bg-brand-50 transition-colors">
                      <Pencil size={13} />
                    </button>
                    <button onClick={() => onSetDefault(cfg.id)} title="Set Default" className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg text-xs text-slate-500 hover:text-amber-600 hover:bg-amber-50 transition-colors">
                      <Star size={13} />
                    </button>
                    <button onClick={() => onDelete(cfg.id, cfg.name)} title="Delete" className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg text-xs text-slate-500 hover:text-red-600 hover:bg-red-50 transition-colors">
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <Modal isOpen={showAdd} onClose={() => setShowAdd(false)} title="New SMTP Configuration" size="lg" headerColor="primary">
        <ConfigForm onSubmit={async (data) => { const ok = await onSave(data); if (ok) setShowAdd(false) }} onTest={onTest} />
      </Modal>

      <Modal isOpen={!!viewConfig} onClose={() => setViewConfig(null)} title="Configuration Details" size="lg" headerColor="info"
        footer={<>
          <button onClick={() => setViewConfig(null)} className="btn-secondary">Close</button>
          <button onClick={() => { setEditConfig(viewConfig); setViewConfig(null) }} className="btn-primary"><Pencil size={14} /> Edit</button>
        </>}>
        {viewConfig && (
          <div className="grid grid-cols-2 gap-3">
            {[['Name', viewConfig.name], ['Host', viewConfig.host], ['Port', viewConfig.port], ['Username', viewConfig.user],
              ['From Email', viewConfig.fromEmail], ['From Name', viewConfig.fromName || '—'],
              ['Security', viewConfig.secure ? 'TLS/SSL Enabled' : 'None'], ['Default', viewConfig.isDefault ? 'Yes' : 'No'],
              ['Created', new Date(viewConfig.createdAt).toLocaleDateString()]
            ].map(([k, v]) => (
              <div key={k} className="bg-slate-50 border border-slate-200 rounded-lg p-3">
                <p className="text-xs text-slate-500 mb-1">{k}</p>
                <p className="text-sm font-mono text-slate-800">{String(v)}</p>
              </div>
            ))}
          </div>
        )}
      </Modal>

      <Modal isOpen={!!editConfig} onClose={() => setEditConfig(null)} title="Edit Configuration" size="lg" headerColor="warning">
        {editConfig && (
          <ConfigForm initial={{ ...editConfig, pass: '' }}
            onSubmit={async (data) => { const ok = await onSave(data, editConfig.id); if (ok) setEditConfig(null) }}
            onTest={onTest} submitLabel="Save Changes" />
        )}
      </Modal>
    </div>
  )
}