import { useEffect, useRef, useState } from 'react'

export default function EmailEditor({ onChange }) {
  const editorRef = useRef(null)
  const quillRef = useRef(null)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    if (!editorRef.current || quillRef.current) return

    const Quill = window.Quill
    if (!Quill) {
      // Load Quill from CDN if not available
      const script = document.createElement('script')
      script.src = 'https://cdn.quilljs.com/1.3.6/quill.min.js'
      script.onload = () => initQuill()
      document.head.appendChild(script)
    } else {
      initQuill()
    }

    function initQuill() {
      const Q = window.Quill
      quillRef.current = new Q(editorRef.current, {
        theme: 'snow',
        placeholder: 'Write your email content here... Use {{FirstName}}, {{Company}} for personalization.',
        modules: {
          toolbar: [
            [{ header: [1, 2, 3, false] }],
            ['bold', 'italic', 'underline', 'strike'],
            [{ color: [] }, { background: [] }],
            [{ list: 'ordered' }, { list: 'bullet' }],
            [{ align: [] }],
            ['link', 'image'],
            ['clean'],
          ],
        },
      })
      quillRef.current.on('text-change', () => {
        onChange(quillRef.current.root.innerHTML)
      })
      setLoaded(true)
    }

    return () => {
      // Cleanup
    }
  }, [])

  const getHTML = () => quillRef.current?.root.innerHTML || ''

  // Expose getHTML through ref-like mechanism
  EmailEditor.getHTML = getHTML

  return (
    <div className="rounded-xl overflow-hidden border border-slate-700/60">
      {!loaded && (
        <div className="h-52 bg-slate-900 flex items-center justify-center">
          <div className="w-5 h-5 border-2 border-brand-500/30 border-t-brand-500 rounded-full animate-spin" />
        </div>
      )}
      <div ref={editorRef} style={{ minHeight: '220px' }} />
    </div>
  )
}
