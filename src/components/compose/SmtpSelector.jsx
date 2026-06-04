import { useState } from 'react'
import { Plus, ChevronDown, Star, Eye, Pencil, Trash2, Check, MoreVertical } from 'lucide-react'
import clsx from 'clsx'
import Modal from '../shared/Modal'
import ConfigForm from '../shared/ConfigForm'

export default function SmtpSelector({ configs, selectedId, onSelect, onSave, onTest, onDelete, onSetDefault }) {
  const [showAdd, setShowAdd] = useState(false)
  const [openMenu, setOpenMenu] = useState(null)
  const [viewConfig, setViewConfig] = useState(null)
  const [editConfig, setEditConfig] = useState(null)

  const selected = configs.find(c => c.id === selectedId)

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <div>
          <p className="text-sm font-semibold text-slate-200">Select Configuration</p>
          <p className="text-xs text-slate-500 mt-0.5">Choose an SMTP config for sending</p>
        </div>
        <button onClick={() => setShowAdd(true)} className="btn-outline text-xs px-3 py-1.5">
          <Plus size={14} /> Add New
        </button>
      </div>

      {configs.length === 0 ? (
        <div className="text-center py-8 border border-dashed border-slate-700 rounded-xl">
          <p className="text-sm text-slate-500">No configurations yet</p>
          <button onClick={() => setShowAdd(true)} className="mt-2 btn-primary text-xs px-3 py-1.5 inline-flex">
            <Plus size={13} /> Add First Config
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          {configs.map(cfg => (
            <div key={cfg.id} onClick={() => onSelect(cfg.id)}
              className={clsx('relative flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all duration-150',
                selectedId === cfg.id
                  ? 'bg-brand-500/10 border-brand-500/50'
                  : 'bg-slate-900 border-slate-800 hover:border-slate-700')}>
              <div className={clsx('w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0',
                selectedId === cfg.id ? 'bg-brand-500/20' : 'bg-slate-800')}>
                {selectedId === cfg.id
                  ? <Check size={16} className="text-brand-400" />
                  : <span className="text-slate-400 text-xs font-bold">{cfg.name[0]}</span>}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-slate-200 truncate">{cfg.name}</span>
                  {cfg.isDefault && <span className="badge-success text-xs">DEFAULT</span>}
                </div>
                <p className="text-xs text-slate-500 truncate">{cfg.host}:{cfg.port} · {cfg.fromEmail}</p>
              </div>
              <div className="relative" onClick={e => e.stopPropagation()}>
                <button onClick={() => setOpenMenu(openMenu === cfg.id ? null : cfg.id)}
                  className="p-1.5 rounded-lg hover:bg-slate-700 text-slate-400 hover:text-slate-200 transition-colors">
                  <MoreVertical size={14} />
                </button>
                {openMenu === cfg.id && (
                  <div className="absolute right-0 top-8 w-44 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl py-1 z-10 animate-fade-in">
                    <button onClick={() => { setViewConfig(cfg); setOpenMenu(null) }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-xs text-slate-300 hover:bg-slate-800">
                      <Eye size={13} /> View Details
                    </button>
                    <button onClick={() => { setEditConfig(cfg); setOpenMenu(null) }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-xs text-slate-300 hover:bg-slate-800">
                      <Pencil size={13} /> Edit
                    </button>
                    <button onClick={() => { onSetDefault(cfg.id); setOpenMenu(null) }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-xs text-slate-300 hover:bg-slate-800">
                      <Star size={13} /> Set as Default
                    </button>
                    <div className="border-t border-slate-800 my-1" />
                    <button onClick={() => { onDelete(cfg.id, cfg.name); setOpenMenu(null) }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-xs text-red-400 hover:bg-red-500/10">
                      <Trash2 size={13} /> Delete
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {selected && (
        <div className="mt-3 p-3 bg-emerald-500/8 border border-emerald-500/20 rounded-xl">
          <p className="text-xs text-emerald-400"><span className="font-semibold">✓ Active:</span> {selected.name} ({selected.fromEmail})</p>
        </div>
      )}

      {/* Add modal */}
      <Modal isOpen={showAdd} onClose={() => setShowAdd(false)} title="New SMTP Configuration" size="lg" headerColor="primary">
        <ConfigForm onSubmit={async (data) => { const ok = await onSave(data); if (ok) setShowAdd(false) }}
          onTest={onTest} submitLabel="Save Configuration" />
      </Modal>

      {/* View modal */}
      <Modal isOpen={!!viewConfig} onClose={() => setViewConfig(null)} title="Configuration Details" size="lg" headerColor="info"
        footer={<>
          <button onClick={() => setViewConfig(null)} className="btn-secondary">Close</button>
          <button onClick={() => { setEditConfig(viewConfig); setViewConfig(null) }} className="btn-primary"><Pencil size={14} /> Edit</button>
        </>}>
        {viewConfig && (
          <div className="grid grid-cols-2 gap-3">
            {[['Name', viewConfig.name], ['Host', viewConfig.host], ['Port', viewConfig.port],
              ['Username', viewConfig.user], ['From Email', viewConfig.fromEmail],
              ['From Name', viewConfig.fromName || '—'], ['Security', viewConfig.secure ? 'TLS/SSL' : 'None'],
              ['Default', viewConfig.isDefault ? 'Yes' : 'No']].map(([k, v]) => (
              <div key={k} className="bg-slate-900 rounded-lg p-3">
                <p className="text-xs text-slate-500 mb-1">{k}</p>
                <p className="text-sm font-mono text-slate-200">{v}</p>
              </div>
            ))}
          </div>
        )}
      </Modal>

      {/* Edit modal */}
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
