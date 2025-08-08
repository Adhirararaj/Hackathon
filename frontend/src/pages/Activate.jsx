import React, { useState } from 'react'
import { useAppState } from '../context/app-state.jsx'
import { tr } from '../lib/translations.js'

export default function Activate() {
  const { user, setUser, language } = useAppState()
  const [form, setForm] = useState({
    accountNo: user?.account?.accountNo || '',
    ifscCode: user?.account?.ifscCode || '',
    branch: user?.account?.branch || '',
  })

  function save() {
    if (!user) return
    setUser({
      ...user,
      account: { accountNo: form.accountNo, ifscCode: form.ifscCode, branch: form.branch },
    })
  }

  return (
    <div className="card" style={{ maxWidth: 680 }}>
      <div className="card-title">{tr(language, 'activate')}</div>
      <div className="grid gap">
        <label>
          <div className="label">Account number</div>
          <input className="field" inputMode="numeric" value={form.accountNo} onChange={(e) => setForm({ ...form, accountNo: e.target.value })} />
        </label>
        <label>
          <div className="label">IFSC code</div>
          <input className="field" value={form.ifscCode} onChange={(e) => setForm({ ...form, ifscCode: e.target.value })} />
        </label>
        <label>
          <div className="label">Branch</div>
          <input className="field" value={form.branch} onChange={(e) => setForm({ ...form, branch: e.target.value })} />
        </label>
        <button className="btn" onClick={save}>Save</button>
        {user?.account?.accountNo && (
          <p style={{ color: '#065f46', fontSize: 14 }}>Account linked for contextual answers.</p>
        )}
      </div>
    </div>
  )
}
