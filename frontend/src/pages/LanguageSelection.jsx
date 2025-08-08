import React from 'react'
import { useNavigate } from 'react-router-dom'
import { LANGUAGES, tr } from '../lib/translations.js'
import { useAppState } from '../context/app-state.jsx'

export default function LanguageSelection() {
  const navigate = useNavigate()
  const { language, setLanguage } = useAppState()

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(#ecfdf5, #ffffff)',
      display: 'grid',
      placeItems: 'center',
      padding: 16
    }}>
      <div style={{ width: '100%', maxWidth: 680, background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12 }}>
        <div style={{ padding: 16, borderBottom: '1px solid #eef0f3', fontSize: 20, fontWeight: 600, textAlign: 'center' }}>
          {tr(language, 'select_language')}
        </div>
        <div style={{ padding: 16 }}>
          <div style={{ display: 'grid', gap: 10, gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
            {LANGUAGES.map((l) => (
              <button
                key={l.label}
                className={'btn ' + (language === l.label ? '' : 'outline')}
                style={{ padding: '12px 10px' }}
                onClick={() => setLanguage(l.label)}
              >
                {l.label}
              </button>
            ))}
          </div>
          <div style={{ display: 'grid', placeItems: 'center', marginTop: 16 }}>
            <button className="btn" onClick={() => navigate('/auth')}>
              {tr(language, 'continue')}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
