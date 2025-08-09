import React, { createContext, useContext, useEffect, useState } from 'react'

export type User = {
  _id?: string
  phoneNo?: string
  fullname?: string
  language?: string
  isLinked?: boolean
}

type AuthState = {
  user: User | null
  setUser: (u: User | null) => void
  loading: boolean
}

const AuthContext = createContext<AuthState | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState<boolean>(true)

  useEffect(() => {
    let isMounted = true
    async function check() {
      try {
        const res = await fetch('/api/user/check', {
          method: 'GET',
          credentials: 'include',
        })
        const data = await res.json()
        if (!isMounted) return
        if (data?.success) setUser(data.user)
        else setUser(null)
      } catch (_) {
        if (isMounted) setUser(null)
      } finally {
        if (isMounted) setLoading(false)
      }
    }
    check()
    return () => {
      isMounted = false
    }
  }, [])

  return (
    <AuthContext.Provider value={{ user, setUser, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}


