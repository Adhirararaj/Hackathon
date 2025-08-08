import React from 'react'
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAppState } from '../context/app-state.jsx'
import { LANGUAGES, tr } from '../lib/translations.js'
import './appshell.css'

export default function AppShell() {
  const navigate = useNavigate()
  const { language, setLanguage, user, setUser } = useAppState()

  const nav = [
    { to: '/home', label: tr(language, 'home') },
    { to: '/about', label: tr(language, 'about') },
    { to: '/activate', label: tr(language, 'activate') },
    { to: '/awareness', label: tr(language, 'awareness') },
    ...(user?.isAdmin ? [{ to: '/admin', label: tr(language, 'admin') }] : []),
  ]

  function logout() {
    setUser(null)
    navigate('/')
  }

  return (
    <div className="shell">
      <aside className="sidebar" aria-label="Main">
        <div className="brand">
          <div className="logo" aria-hidden="true">V</div>
          <div className="brand-text">{tr(language, 'app_name')}</div>
        </div>

        <div className="language">
          <label htmlFor="lang" className="sr-only">Language</label>
          <select
            id="lang"
            className="select"
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
          >
            {LANGUAGES.map((l) => (
              <option key={l.label} value={l.label}>{l.label}</option>
            ))}
          </select>
        </div>

        <nav className="nav">
          {nav.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => 'nav-link' + (isActive ? ' active' : '')}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </aside>

      <div className="content">
        <header className="topbar">
          <button className="menu-btn" aria-label="Menu" onClick={() => document.body.classList.toggle('open')}>
            ☰
          </button>
          <div className="spacer" />
          <div className="user-area">
            {user ? (
              <>
                <span className="user-label">{user.fullname || user.number}</span>
                <button className="btn outline" onClick={logout}>{tr(language, 'logout')}</button>
              </>
            ) : (
              <Link className="btn" to="/auth">{tr(language, 'login')}</Link>
            )}
          </div>
        </header>

        <main className="main">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
