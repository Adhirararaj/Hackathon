import React from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Home from './pages/Home'
import Awareness from './pages/Awareness'
import About from './pages/About'
import AccountActivation from './pages/AccountActivation'
import Navigation from './components/Navigation'
import { AuthProvider, useAuth } from './context/auth'

function RequireAuth({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  if (loading) return <div className="container"><div className="card">Checking session…</div></div>
  if (!user) return <Navigate to="/login" replace />
  return <>{children}</>
}

function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="app-layout">
      <Navigation />
      <main className="main-content">
        {children}
      </main>
    </div>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/user/signup" element={<Signup />} />
        <Route
          path="/home"
          element={
            <RequireAuth>
              <Layout>
                <Home />
              </Layout>
            </RequireAuth>
          }
        />
        <Route
          path="/awareness"
          element={
            <RequireAuth>
              <Layout>
                <Awareness />
              </Layout>
            </RequireAuth>
          }
        />
        <Route
          path="/about"
          element={
            <RequireAuth>
              <Layout>
                <About />
              </Layout>
            </RequireAuth>
          }
        />
        <Route
          path="/account-activation"
          element={
            <RequireAuth>
              <Layout>
                <AccountActivation />
              </Layout>
            </RequireAuth>
          }
        />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </AuthProvider>
  )
}



