import { useMemo, useState } from 'react'
import { Lightbulb, Save, RotateCcw, Check } from 'lucide-react'
import { METRICS, getDefaults } from '../lib/metrics'
import { useLocalStorage } from '../lib/storage'

const GROUPS = [
  { id: 'pulse', title: 'The Pulse', sub: 'Daily and weekly check-ups' },
  { id: 'health', title: 'The Health Report', sub: 'Monthly, quarterly, and yearly' },
]

export default function CalculatorPage({ onInfo }) {
  const [activeId, setActiveId] = useState('grossProfit')
  const [allValues, setAllValues] = useState(() =>
    Object.fromEntries(METRICS.map((m) => [m.id, getDefaults(m)])))
  const [note, setNote] = useState('')
  const [saved, setSaved] = useState(false)
  const [, setHistory] = useLocalStorage('kashing-history', [])

  const metric = METRICS.find((m) => m.id === activeId)
  const values = allValues[activeId]
  const out = useMemo(() => metric.compute(values), [metric, values])

  const setField = (key, val) =>
    setAllValues((a) => ({ ...a, [activeId]: { ...a[activeId], [key]: val } }))

  const reset = () => setAllValues((a) => ({ ...a, [activeId]: getDefaults(metric) }))

  const save = () => {
    const entry = {
      id: Date.now() + Math.random().toString(36).slice(2),
      createdAt: new Date().toISOString(),
      title: metric.title,
      note: note.trim(),
      results: out.results,
    }
    setHistory((h) => [entry, ...h])
    setNote('')
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="container">
      <h1>What do you want to compute?</h1>
      <p className="lead">Pick a calculation, type your numbers in pesos, and see the answer instantly.</p>

      {GROUPS.map((g) => (
        <div key={g.id}>
          <h2 className="group-title">{g.title}</h2>
          <p className="group-sub">{g.sub}</p>
          <div className="metric-grid">
            {METRICS.filter((m) => m.group === g.id).map((m) => (
              <button key={m.id} className="metric-btn" aria-pressed={m.id === activeId}
                onClick={() => { setActiveId(m.id); setSaved(false) }}>
                <strong>{m.title}</strong>
                <span>{m.blurb}</span>
              </button>
            ))}
          </div>
        </div>
      ))}

      <section key={metric.id} className="card" style={{ marginTop: '1.5rem' }} aria-labelledby="calc-title">
        <div className="card-head">
          <h2 id="calc-title">{metric.title}</h2>
          <button className="btn btn-soft" onClick={() => onInfo(metric.id)}>
             <Lightbulb size={18} aria-hidden="true" /> What does this mean?          
          </button>
        </div>

        {metric.fields.map((f) => {
          const id = `${metric.id}-${f.key}`
          return (
            <div key={f.key}>
              {f.section && <h3 className="section-title">{f.section}</h3>}
              <div className="field">
                <label htmlFor={id}>{f.label}</label>
                {f.type === 'select' ? (
                  <select id={id} value={values[f.key]} aria-describedby={f.hint ? `${id}-hint` : undefined}
                    onChange={(e) => setField(f.key, e.target.value)}>
                    {f.options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                ) : (
                  <div className="input-wrap">
                    {f.type === 'money' && <span aria-hidden="true">₱</span>}
                    <input id={id} type="text" inputMode="decimal" placeholder="0"
                      value={values[f.key]} aria-describedby={f.hint ? `${id}-hint` : undefined}
                      onChange={(e) => setField(f.key, e.target.value.replace(/[^0-9.]/g, ''))} />
                  </div>
                )}
                {f.hint && <small id={`${id}-hint`}>{f.hint}</small>}
              </div>
            </div>
          )
        })}

        <div className="results" aria-live="polite">
          {out.results.map((r) => (
            <div key={r.label} className={`result-row${r.main ? ' main' : ''}`}>
              <span>{r.label}</span><span>{r.value}</span>
            </div>
          ))}
          {out.tip && <p className="tip">{out.tip}</p>}
        </div>

        <div className="field" style={{ marginTop: '1rem' }}>
          <label htmlFor="note">Label for your history (optional)</label>
          <input id="note" type="text" maxLength={60} placeholder="e.g. October 2026" value={note}
            onChange={(e) => setNote(e.target.value)} />
        </div>
        <div className="actions">
          <button className="btn btn-primary" onClick={save}>
            {saved ? <Check size={18} aria-hidden="true" /> : <Save size={18} aria-hidden="true" />}
            {saved ? 'Saved!' : 'Save to history'}
          </button>
          <button className="btn btn-soft" onClick={reset}>
            <RotateCcw size={18} aria-hidden="true" /> Clear
          </button>
        </div>
      </section>
    </div>
  )
}