import { useEffect, useState } from 'react'
import { HashRouter, Routes, Route, NavLink, Link } from 'react-router-dom'
import { Calculator, History, Info, Mail, BookOpen, Moon, Sun } from 'lucide-react'
import CalculatorPage from './pages/Calculator'
import HistoryPage from './pages/History'
import AboutPage from './pages/About'
import ContactPage from './pages/Contact'
import InfoModal from './components/InfoModal'

function getInitialTheme() {
  try {
    const saved = localStorage.getItem('kashing-theme')
    if (saved === 'light' || saved === 'dark') return saved
  } catch {  }
  return 'light'
}

export default function App() {
  const [term, setTerm] = useState(null)
  const [theme, setTheme] = useState(getInitialTheme)

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    try { localStorage.setItem('kashing-theme', theme) } catch { }
    document.querySelector('meta[name="theme-color"]')
      ?.setAttribute('content', theme === 'dark' ? '#241710' : '#ffd0db')
  }, [theme])

  const isDark = theme === 'dark'

  return (
    <HashRouter>
      <header className="app-header">
        <Link to="/" className="brand">
            <img src="/pwa-192x192.png" alt="" width="32" height="32" /> kashing      
        </Link>
        <nav className="nav" aria-label="Main">
          <NavLink to="/" end><Calculator size={20} aria-hidden="true" /> Calculator</NavLink>
          <NavLink to="/history"><History size={20} aria-hidden="true" /> History</NavLink>
          <NavLink to="/about"><Info size={20} aria-hidden="true" /> About</NavLink>
          <NavLink to="/contact"><Mail size={20} aria-hidden="true" /> Contact</NavLink>
        </nav>
        <div className="header-actions">
          <button
            className="btn btn-soft theme-toggle"
            onClick={() => setTheme(isDark ? 'light' : 'dark')}
            aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {isDark ? <Sun size={18} aria-hidden="true" /> : <Moon size={18} aria-hidden="true" />}
          </button>
          <button className="btn btn-soft" onClick={() => setTerm('all')}>
            <BookOpen size={18} aria-hidden="true" /> Guide
          </button>
        </div>
      </header>

      <main>
        <Routes>
          <Route path="/" element={<CalculatorPage onInfo={setTerm} />} />
          <Route path="/history" element={<HistoryPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage />} />
        </Routes>
      </main>

      <InfoModal termId={term} onClose={() => setTerm(null)} />
    </HashRouter>
  )
}