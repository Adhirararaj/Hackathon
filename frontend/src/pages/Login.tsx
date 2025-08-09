import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

const Login: React.FC = () => {
  const navigate = useNavigate()
  const [phone, setPhone] = useState<string>('')
  const [password, setPassword] = useState<string>('')
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    if (!phone.trim() || !password) {
      setError('Phone and password are required')
      return
    }
    setLoading(true)
    try {
      const res = await fetch('/api/user/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ number: phone, password }),
      })
      const data = await res.json()
      if (!data.success) {
        setError(data.message || 'Login failed')
      } else {
        navigate('/login')
        navigate(0)
      }
    } catch (err) {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container">
      <div className="card">
        <div className="title">Login</div>
        <form onSubmit={onSubmit}>
          <label className="label" htmlFor="phone">Phone number</label>
          <input id="phone" className="field" inputMode="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="Enter phone number" />

          <div style={{ height: 10 }} />
          <label className="label" htmlFor="password">Password</label>
          <input id="password" type="password" className="field" value={password} onChange={e => setPassword(e.target.value)} placeholder="Enter password" />

          {error && <p className="error" style={{ marginTop: 8 }}>{error}</p>}

          <div className="row">
            <button className="btn" type="submit" disabled={loading}>{loading ? 'Logging in…' : 'Login'}</button>
            <Link to="/user/signup" className="link">Sign up</Link>
          </div>
        </form>
      </div>
    </div>
  )
}

export default Login


