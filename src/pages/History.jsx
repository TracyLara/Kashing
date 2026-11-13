import { Link } from 'react-router-dom'
import { Trash2 } from 'lucide-react'
import { useLocalStorage } from '../lib/storage'

export default function HistoryPage() {
  const [history, setHistory] = useLocalStorage('kashing-history', [])
  const remove = (id) => setHistory((h) => h.filter((e) => e.id !== id))
  const clearAll = () => { if (window.confirm('Delete all saved history?')) setHistory([]) }

  return (
    <div className="container">
      <h1>Your History</h1>
      <p className="lead">Saved on this device only. Clearing your browser data will erase it.</p>

      {history.length === 0 ? (
        <div className="card">
          <p>Nothing saved yet. Compute something and press “Save to history”.</p>
          <Link className="btn btn-primary" to="/">Go to calculator</Link>
        </div>
      ) : (
        <>
          {history.map((e) => (
            <article className="card" key={e.id}>
              <div className="card-head">
                <div>
                  <h2>{e.title}</h2>
                  <small className="muted">
                    {new Date(e.createdAt).toLocaleString('en-PH', { dateStyle: 'medium', timeStyle: 'short' })}
                    {e.note ? ` · ${e.note}` : ''}
                  </small>
                </div>
                <button className="icon-btn" onClick={() => remove(e.id)} aria-label={`Delete saved ${e.title}`}>
                  <Trash2 size={20} aria-hidden="true" />
                </button>
              </div>
              <div className="results">
                {e.results.map((r) => (
                  <div key={r.label} className={`result-row${r.main ? ' main' : ''}`}>
                    <span>{r.label}</span><span>{r.value}</span>
                  </div>
                ))}
              </div>
            </article>
          ))}
          <button className="btn btn-soft" onClick={clearAll}>Clear all history</button>
        </>
      )}
    </div>
  )
}