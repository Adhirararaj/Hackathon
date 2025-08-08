'use client'

import React from 'react'
import { Button } from '@/components/ui/button'
import { Mic, Square } from 'lucide-react'
import { mockTranscribe } from '@/lib/mock'
import { useToast } from '@/hooks/use-toast'

type VoiceInputProps = {
  onTranscript: (text: string) => void
}

export default function VoiceInput({ onTranscript }: VoiceInputProps) {
  const { toast } = useToast()
  const [recording, setRecording] = React.useState(false)

  async function handleRecord() {
    // Try Web Speech API
    const SR =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (SR) {
      const rec = new SR()
      rec.lang = 'en-IN'
      rec.interimResults = false
      rec.maxAlternatives = 1
      setRecording(true)
      rec.onresult = (e: any) => {
        const text = e.results?.[0]?.[0]?.transcript ?? ''
        onTranscript(text)
      }
      rec.onerror = () => {
        toast({ title: 'Voice error', description: 'Transcription failed.' })
      }
      rec.onend = () => setRecording(false)
      rec.start()
      return
    }

    // Fallback to mock transcription
    setRecording(true)
    const text = await mockTranscribe()
    onTranscript(text)
    setRecording(false)
  }

  return (
    <div className="flex items-center gap-2">
      <Button onClick={handleRecord} variant={recording ? 'destructive' : 'default'}>
        {recording ? <Square className="size-4 mr-2" /> : <Mic className="size-4 mr-2" />}
        {recording ? 'Stop' : 'Record'}
      </Button>
    </div>
  )
}
