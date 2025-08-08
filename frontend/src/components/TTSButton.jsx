import React from 'react'
import { langToVoiceCode } from '../lib/translations.js'

export default function TTSButton({ text, languageLabel }) {
  function speak() {
    const utter = new SpeechSynthesisUtterance(text)
    utter.lang = langToVoiceCode(languageLabel)
    window.speechSynthesis.cancel()
    window.speechSynthesis.speak(utter)
  }
  return (
    <button className="btn outline" onClick={speak}>
      Speak
    </button>
  )
}
