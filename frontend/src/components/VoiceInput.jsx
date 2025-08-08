import React, { useState } from 'react'
import { mockTranscribe } from '../lib/mock.js'

export default function VoiceInput({ onTranscript }) {
  const [recording, setRecording] = useState(false)

  async function handleRecord() {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition
    if (SR) {
      const rec = new SR()
      rec.lang = 'en-IN'
      rec.interimResults = false
      rec.maxAlternatives = 1
      setRecording(true)
      rec.onresult = (e) => {
        const text = e.results?.[0]?.[0]?.transcript || ''
        onTranscript(text)
      }
      rec.onerror = () => {
        alert('Transcription failed. Using fallback.')
      }
      rec.onend = () => setRecording(false)
      rec.start()
      return
    }
    // Fallback
    setRecording(true)
    const text = await mockTranscribe()
    onTranscript(text)
    setRecording(false)
  }

  return (
    <div>
      <button className={'btn ' + (recording ? 'outline' : '')} onClick={handleRecord}>
        {recording ? 'Stop' : 'Record'}
      </button>
    </div>
  )
}
