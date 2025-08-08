import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import AppShell from './components/AppShell.jsx'
import LanguageSelection from './pages/LanguageSelection.jsx'
import Auth from './pages/Auth.jsx'
import Home from './pages/Home.jsx'
import Activate from './pages/Activate.jsx'
import Awareness from './pages/Awareness.jsx'
import Admin from './pages/Admin.jsx'
import About from './pages/About.jsx'
import { useAppState } from './context/app-state.jsx'

function RequireAuth({ children }) {
  const { user } = useAppState()
  if (!user) return <Navigate to="/auth" replace />
  return children
}

export default function App() {
  return (
    <Routes>
      {/* Marketing/auth routes (no shell) */}
      <Route path="/" element={<LanguageSelection />} />
      <Route path="/auth" element={<Auth />} />

      {/* App routes (with shell) */}
      <Route element={<AppShell />}>
        <Route path="/home" element={<RequireAuth><Home /></RequireAuth>} />
        <Route path="/activate" element={<RequireAuth><Activate /></RequireAuth>} />
        <Route path="/awareness" element={<RequireAuth><Awareness /></RequireAuth>} />
        <Route path="/admin" element={<RequireAuth><Admin /></RequireAuth>} />
        <Route path="/about" element={<About />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
