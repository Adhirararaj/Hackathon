'use client'

import { AppStateProvider } from '@/providers/app-state'
import { ThemeProvider } from '@/components/theme-provider'

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      <AppStateProvider>{children}</AppStateProvider>
    </ThemeProvider>
  )
}
