import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

const Signup: React.FC = () => {
  const navigate = useNavigate()
  const [phone, setPhone] = useState<string>('')
  const [password, setPassword] = useState<string>('')
  const [confirmPassword, setConfirmPassword] = useState<string>('')
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setSuccess(null)
    if (!phone.trim() || !password) {
      setError('Phone and password are required')
      return
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }
    setLoading(true)
    try {
      const res = await fetch('/api/user/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ phoneNo: phone, password }),
      })
      const data = await res.json()
      if (!data.success) {
        setError(data.message || 'Signup failed')
      } else {
        setSuccess('Registered successfully')
        setTimeout(() => navigate('/login'), 800)
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
        <div className="title">Create account</div>
        <form onSubmit={onSubmit}>
          <label className="label" htmlFor="phone">Phone number</label>
          <input id="phone" className="field" inputMode="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="Enter phone number" />

          <div style={{ height: 10 }} />
          <label className="label" htmlFor="password">Password</label>
          <input id="password" type="password" className="field" value={password} onChange={e => setPassword(e.target.value)} placeholder="Enter password" />

          <div style={{ height: 10 }} />
          <label className="label" htmlFor="confirm">Confirm password</label>
          <input id="confirm" type="password" className="field" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="Re-enter password" />

          {error && <p className="error" style={{ marginTop: 8 }}>{error}</p>}
          {success && <p className="success" style={{ marginTop: 8 }}>{success}</p>}

          <div className="row">
            <button className="btn" type="submit" disabled={loading}>{loading ? 'Signing up…' : 'Sign up'}</button>
            <Link to="/login" className="link">Login</Link>
          </div>
        </form>
      </div>
    </div>
  )
}

export default Signup


