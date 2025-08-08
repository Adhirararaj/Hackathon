import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'

const AppStateContext = createContext(null)

function readLS(key, fallback) {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : fallback
  } catch {
    return fallback
  }
}

export function AppStateProvider({ children }) {
  const [language, setLanguage] = useState(() => readLS('vaantra_language', 'English'))
  const [user, setUser] = useState(() => readLS('vaantra_user', null))
  const [subscribed, setSubscribed] = useState(() => readLS('vaantra_subscribed', false))

  useEffect(() => localStorage.setItem('vaantra_language', JSON.stringify(language)), [language])
  useEffect(() => localStorage.setItem('vaantra_user', JSON.stringify(user)), [user])
  useEffect(() => localStorage.setItem('vaantra_subscribed', JSON.stringify(subscribed)), [subscribed])

  const value = useMemo(() => ({ language, setLanguage, user, setUser, subscribed, setSubscribed }), [language, user, subscribed])

  return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>
}

export function useAppState() {
  const ctx = useContext(AppStateContext)
  if (!ctx) throw new Error('useAppState must be used within AppStateProvider')
  return ctx
}
