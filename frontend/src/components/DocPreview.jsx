import React from 'react'

export default function DocPreview({ docs = [] }) {
  return (
    <div style={{ display: 'grid', gap: 12, gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))' }}>
      {docs.map((d) => (
        <div key={d.id} style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 10 }}>
          <div style={{ padding: '10px 12px', borderBottom: '1px solid #eef0f3', fontWeight: 600 }}>
            {d.title}
          </div>
          <div style={{ padding: '10px 12px', color: '#6b7280', fontSize: 14 }}>
            {d.snippet}
          </div>
        </div>
      ))}
    </div>
  )
}
