'use client'

import React from 'react'

export type User = {
  number: string
  fullname?: string
  language?: string
  isAdmin?: boolean
  account?: {
    accountNo?: string
    ifscCode?: string
    branch?: string
  }
}

type AppState = {
  user: User | null
  setUser: (u: User | null) => void
  language: string
  setLanguage: (lang: string) => void
  subscribed: boolean
  setSubscribed: (v: boolean) => void
}

const AppStateContext = React.createContext<AppState | null>(null)

function readLS<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : fallback
  } catch {
    return fallback
  }
}

export function AppStateProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<User | null>(() =>
    readLS<User | null>('vaantra_user', null)
  )
  const [language, setLanguage] = React.useState<string>(() =>
    readLS<string>('vaantra_language', 'English')
  )
  const [subscribed, setSubscribed] = React.useState<boolean>(() =>
    readLS<boolean>('vaantra_subscribed', false)
  )

  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('vaantra_user', JSON.stringify(user))
    }
  }, [user])

  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('vaantra_language', JSON.stringify(language))
    }
  }, [language])

  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('vaantra_subscribed', JSON.stringify(subscribed))
    }
  }, [subscribed])

  return (
    <AppStateContext.Provider
      value={{ user, setUser, language, setLanguage, subscribed, setSubscribed }}
    >
      {children}
    </AppStateContext.Provider>
  )
}

export function useAppState() {
  const ctx = React.useContext(AppStateContext)
  if (!ctx) throw new Error('useAppState must be used within AppStateProvider')
  return ctx
}
