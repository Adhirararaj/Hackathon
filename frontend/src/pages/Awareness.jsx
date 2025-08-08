import React, { useState } from 'react'
import { useAppState } from '../context/app-state.jsx'
import { FAQS } from '../lib/mock.js'
import { tr } from '../lib/translations.js'

export default function Awareness() {
  const { language, subscribed, setSubscribed, user } = useAppState()
  const [number, setNumber] = useState(user?.number || '')

  return (
    <div className="cards-grid">
      <section className="card">
        <div className="card-title">{tr(language, 'faq')}</div>
        <div className="accordion">
          {FAQS.map((f, i) => (
            <details key={i} className="acc-item">
              <summary className="acc-summary">{f.q}</summary>
              <div className="acc-content">{f.a}</div>
            </details>
          ))}
        </div>
      </section>

      <section className="card">
        <div className="card-title">{tr(language, 'subscribe_sms')}</div>
        <div className="grid gap">
          <label>
            <div className="label">Mobile number</div>
            <input className="field" inputMode="numeric" value={number} onChange={(e) => setNumber(e.target.value)} />
          </label>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <input id="sub" type="checkbox" checked={subscribed} onChange={(e) => setSubscribed(e.target.checked)} />
            <label htmlFor="sub" style={{ fontSize: 14 }}>
              {subscribed ? tr(language, 'subscribed') : tr(language, 'not_subscribed')}
            </label>
          </div>
          <p style={{ fontSize: 12, color: '#6b7280' }}>
            We’ll send daily banking tips and fraud alerts in your selected language.
          </p>
        </div>
      </section>
    </div>
  )
}
