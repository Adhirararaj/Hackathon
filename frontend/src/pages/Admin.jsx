import React, { useState } from 'react'
import { useAppState } from '../context/app-state.jsx'
import { tr } from '../lib/translations.js'
import { MOCK_LANG_USAGE } from '../lib/mock.js'

export default function Admin() {
  const { language, user } = useAppState()
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [docs, setDocs] = useState([])

  if (!user?.isAdmin) {
    return <p style={{ padding: 16 }}>Admins only.</p>
  }

  function addDoc() {
    if (!title || !content) return
    setDocs((prev) => [{ title, content }, ...prev])
    setTitle('')
    setContent('')
  }

  return (
    <div className="cards-grid">
      <section className="card">
        <div className="card-title">{tr(language, 'add_to_vector_db')}</div>
        <div className="grid gap">
          <label>
            <div className="label">{tr(language, 'title')}</div>
            <input className="field" value={title} onChange={(e) => setTitle(e.target.value)} />
          </label>
          <label>
            <div className="label">{tr(language, 'content')}</div>
            <textarea className="field" rows={6} value={content} onChange={(e) => setContent(e.target.value)} />
          </label>
          <button className="btn" onClick={addDoc}>{tr(language, 'add')}</button>
          {docs.length > 0 && (
            <div style={{ marginTop: 12 }}>
              <h3 style={{ fontWeight: 600, marginBottom: 8 }}>Recent additions</h3>
              <ul style={{ display: 'grid', gap: 8 }}>
                {docs.map((d, i) => (
                  <li key={i} style={{ border: '1px solid #e5e7eb', background: '#fff', borderRadius: 8, padding: 10 }}>
                    <div style={{ fontWeight: 600 }}>{d.title}</div>
                    <div style={{ color: '#6b7280', fontSize: 14, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                      {d.content}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </section>

      <section className="card">
        <div className="card-title">{tr(language, 'analytics')}</div>
        <div>
          {/* Simple bar chart without extra deps */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 8 }}>
            {MOCK_LANG_USAGE.map((row) => (
              <div key={row.name}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#6b7280' }}>
                  <span>{row.name}</span>
                  <span>{row.value}</span>
                </div>
                <div style={{ background: '#eef2f7', height: 10, borderRadius: 999, overflow: 'hidden' }}>
                  <div style={{ width: `${Math.min(100, row.value)}%`, height: '100%', background: '#10b981' }} />
                </div>
              </div>
            ))}
          </div>
          <p style={{ fontSize: 12, color: '#6b7280', marginTop: 8 }}>{tr(language, 'most_used_languages')}</p>
        </div>
      </section>
    </div>
  )
}
