import { useEffect, useRef } from 'react'
import { X } from 'lucide-react'
import { GLOSSARY } from '../lib/glossary'

export default function InfoModal({ termId, onClose }) {
  const ref = useRef(null)

  useEffect(() => {
    const d = ref.current
    if (!d) return
    if (termId && !d.open) d.showModal()
    if (!termId && d.open) d.close()
  }, [termId])

  const items = termId === 'all' ? GLOSSARY : GLOSSARY.filter((g) => g.id === termId)

  return (
    <dialog
      ref={ref}
      className="modal"
      onClose={onClose}
      onClick={(e) => { if (e.target === ref.current) onClose() }}
      aria-labelledby="modal-title"
    >
      <div className="modal-head">
        <h2 id="modal-title">{termId === 'all' ? 'Financial Guide' : 'What does this mean?'}</h2>
        <button className="icon-btn" onClick={onClose} aria-label="Close">
          <X size={20} aria-hidden="true" />
        </button>
      </div>
      <div className="modal-body">
        {items.map((g) => (
          <section key={g.id} className="term">
            <h3>{g.title}</h3>
            <p>{g.meaning}</p>
            <p><strong>Formula:</strong> {g.formula}</p>
            <p><strong>Example:</strong> {g.example}</p>
          </section>
        ))}
      </div>
    </dialog>
  )
}