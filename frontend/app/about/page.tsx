'use client'

import AppShell from '@/components/app-shell'
import { useAppState } from '@/providers/app-state'
import { tr } from '@/lib/translations'

export default function AboutPage() {
  const { language } = useAppState()
  return (
    <AppShell title={tr(language, 'about')}>
      <div className="prose prose-neutral max-w-3xl">
        <h1>Vaantra: Bridging the Language Gap in Banking</h1>
        <p>
          Vaantra is a multilingual web-based banking assistant that helps users access
          banking services in their preferred regional language via voice, text, or
          documents. Our goal is to enable financial inclusion by empowering users who
          are not fluent in English or Hindi.
        </p>
        <img
          src="/banking-assistant-illustration.png"
          alt="Illustration: multilingual banking assistant"
          className="rounded-lg border my-4 w-full"
        />
        <h2>Key Highlights</h2>
        <ul>
          <li>Inclusive design for non-English speakers</li>
          <li>Multi-modal input (voice, text, docs)</li>
          <li>Seamless translation and transcription pipeline</li>
          <li>Real-time contextual answers powered by RAG</li>
          <li>Daily awareness alerts for users</li>
          <li>Admin analytics & content management</li>
        </ul>
      </div>
    </AppShell>
  )
}
