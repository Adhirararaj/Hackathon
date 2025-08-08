import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { tr } from '../lib/translations.js'
import { useAppState } from '../context/app-state.jsx'

export default function Auth() {
  const navigate = useNavigate()
  const { setUser, language } = useAppState()
  const [login, setLogin] = useState({ number: '', password: '' })
  const [reg, setReg] = useState({ number: '', password: '', fullname: '' })
  const [tab, setTab] = useState('login')

  function doLogin() {
    const isAdmin = login.number === '0000'
    setUser({ number: login.number, isAdmin, language })
    navigate('/home')
  }
  function doRegister() {
    setUser({ number: reg.number, fullname: reg.fullname, language })
    navigate('/home')
  }

  return (
    <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', background: '#f6f7f9', padding: 16 }}>
      <div style={{ width: '100%', maxWidth: 680, background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12 }}>
        <div style={{ padding: 16, borderBottom: '1px solid #eef0f3', fontWeight: 600, textAlign: 'center' }}>
          {tr(language, tab)}
        </div>
        <div style={{ padding: 16 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', background: '#f3f4f6', borderRadius: 8, overflow: 'hidden' }}>
            <button className={'btn ' + (tab === 'login' ? '' : 'outline')} onClick={() => setTab('login')}>{tr(language, 'login')}</button>
            <button className={'btn ' + (tab === 'register' ? '' : 'outline')} onClick={() => setTab('register')}>{tr(language, 'register')}</button>
          </div>

          {tab === 'login' ? (
            <div style={{ display: 'grid', gap: 12, marginTop: 16 }}>
              <label>
                <div style={{ fontSize: 12 }}>{tr(language, 'mobile_number')}</div>
                <input value={login.number} onChange={(e) => setLogin({ ...login, number: e.target.value })} inputMode="numeric" className="field" placeholder="e.g. 9876543210" />
              </label>
              <label>
                <div style={{ fontSize: 12 }}>{tr(language, 'password')}</div>
                <input type="password" value={login.password} onChange={(e) => setLogin({ ...login, password: e.target.value })} className="field" />
              </label>
              <button className="btn" onClick={doLogin}>{tr(language, 'login')}</button>
            </div>
          ) : (
            <div style={{ display: 'grid', gap: 12, marginTop: 16 }}>
              <label>
                <div style={{ fontSize: 12 }}>{tr(language, 'full_name')}</div>
                <input value={reg.fullname} onChange={(e) => setReg({ ...reg, fullname: e.target.value })} className="field" />
              </label>
              <label>
                <div style={{ fontSize: 12 }}>{tr(language, 'mobile_number')}</div>
                <input value={reg.number} onChange={(e) => setReg({ ...reg, number: e.target.value })} inputMode="numeric" className="field" />
              </label>
              <label>
                <div style={{ fontSize: 12 }}>{tr(language, 'password')}</div>
                <input type="password" value={reg.password} onChange={(e) => setReg({ ...reg, password: e.target.value })} className="field" />
              </label>
              <button className="btn" onClick={doRegister}>{tr(language, 'register')}</button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
