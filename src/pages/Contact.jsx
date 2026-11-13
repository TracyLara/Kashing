import { useState } from 'react'
import { Mail, ExternalLink, Send } from 'lucide-react'

const FORM_ENDPOINT = 'https://formspree.io/f/xyewgywk'
const EMAIL = 'tracylara06@gmail.com'
const FACEBOOK = 'https://www.facebook.com/share/1DSK9x8MGw/?mibextid=wwXIfr'
const INSTAGRAM = 'https://www.instagram.com/amthystt?srtk=bnEyenlweTBtaDJo&utm_source=qr'

export default function ContactPage() {
  const [status, setStatus] = useState('idle')

  async function submit(e) {
    e.preventDefault()
    const form = e.currentTarget
    setStatus('sending')
    try {
      const res = await fetch(FORM_ENDPOINT, {
        method: 'POST', body: new FormData(form), headers: { Accept: 'application/json' },
      })
      if (res.ok) { setStatus('sent'); form.reset() } else setStatus('error')
    } catch {
      setStatus('error')
    }
  }

  return (
    <div className="container">
      <h1>Contact Us</h1>
      <p className="lead">Suggestions, bugs, or ideas? We’d love to hear from you.</p>

      <div className="card">
        <form onSubmit={submit}>
          <div className="field">
            <label htmlFor="name">Your name</label>
            <input id="name" name="name" type="text" required />
          </div>
          <div className="field">
            <label htmlFor="email">Your email</label>
            <input id="email" name="email" type="email" required />
          </div>
          <div className="field">
            <label htmlFor="message">Message or suggestion</label>
            <textarea id="message" name="message" rows={5} required />
          </div>
          <button className="btn btn-primary" disabled={status === 'sending'}>
            <Send size={18} aria-hidden="true" /> {status === 'sending' ? 'Sending…' : 'Send message'}
          </button>
          <p aria-live="polite" className="tip">
            {status === 'sent' && 'Thank you! Your message was sent.'}
            {status === 'error' && 'Sorry, something went wrong. Please try the email link below.'}
          </p>
        </form>
      </div>

      <div className="card">
        <h2>Other ways to reach me !</h2>
        <ul className="link-list">
          <li><a href={`mailto:${EMAIL}`}><Mail size={18} aria-hidden="true" /> {EMAIL}</a></li>
          <li><a href={FACEBOOK} target="_blank" rel="noopener noreferrer"><ExternalLink size={18} aria-hidden="true" /> Facebook</a></li>
          <li><a href={INSTAGRAM} target="_blank" rel="noopener noreferrer"><ExternalLink size={18} aria-hidden="true" /> Instagram</a></li>
        </ul>
      </div>
    </div>
  )
}