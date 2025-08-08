'use client'

import React from 'react'
import { Button } from '@/components/ui/button'
import { Volume2 } from 'lucide-react'
import { langToVoiceCode } from '@/lib/translations'

type TTSButtonProps = {
  text: string
  languageLabel: string
}

export default function TTSButton({ text, languageLabel }: TTSButtonProps) {
  function speak() {
    if (typeof window === 'undefined') return
    const utter = new SpeechSynthesisUtterance(text)
    utter.lang = langToVoiceCode(languageLabel)
    window.speechSynthesis.cancel()
    window.speechSynthesis.speak(utter)
  }

  return (
    <Button variant="secondary" onClick={speak}>
      <Volume2 className="size-4 mr-2" />
      Speak
    </Button>
  )
}
