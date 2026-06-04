import { useEffect } from 'react'
import { X } from 'lucide-react'
import clsx from 'clsx'

export default function Modal({ isOpen, onClose, title, children, footer, size = 'md', headerColor = 'default' }) {
  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden'
    else document.body.style.overflow = ''
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  if (!isOpen) return null

  const sizes = { sm: 'max-w-md', md: 'max-w-xl', lg: 'max-w-3xl', xl: 'max-w-5xl' }
  const headerColors = {
    default: 'bg-slate-800 border-slate-700',
    primary: 'bg-brand-600 border-brand-500',
    warning: 'bg-amber-600/20 border-amber-500/40',
    info: 'bg-cyan-600/20 border-cyan-500/40',
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" />
      <div
        className={clsx('relative w-full bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl animate-slide-up', sizes[size])}
        onClick={e => e.stopPropagation()}
      >
        <div className={clsx('flex items-center justify-between px-6 py-4 border-b rounded-t-2xl', headerColors[headerColor])}>
          <h2 className="text-base font-display font-700 text-slate-100">{title}</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-700/50 text-slate-400 hover:text-slate-200 transition-colors">
            <X size={16} />
          </button>
        </div>
        <div className="p-6 max-h-[70vh] overflow-y-auto">{children}</div>
        {footer && <div className="px-6 py-4 border-t border-slate-800 flex items-center justify-end gap-3 rounded-b-2xl">{footer}</div>}
      </div>
    </div>
  )
}
