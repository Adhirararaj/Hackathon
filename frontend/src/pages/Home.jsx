import React, { useState } from 'react'
import { tr } from '../lib/translations.js'
import { useAppState } from '../context/app-state.jsx'
import VoiceInput from '../components/VoiceInput.jsx'
import UploadArea from '../components/UploadArea.jsx'
import DocPreview from '../components/DocPreview.jsx'
import TTSButton from '../components/TTSButton.jsx'
import { mockRagAnswer } from '../lib/mock.js'

export default function Home() {
  const { language } = useAppState()
  const [text, setText] = useState('')
  const [files, setFiles] = useState([])
  const [answer, setAnswer] = useState('')
  const [docs, setDocs] = useState([])
  const [tab, setTab] = useState('voice')
  const [loading, setLoading] = useState(false)

  async function ask() {
    if (!text) return
    setLoading(true)
    const res = await mockRagAnswer(text, language)
    setAnswer(res.answer)
    setDocs(res.docs)
    setLoading(false)
  }

  return (
    <div className="cards-grid">
      <section className="card">
        <div className="card-title">Ask a question</div>
        <div className="tabs">
          <button className={'tab ' + (tab === 'voice' ? 'active' : '')} onClick={() => setTab('voice')}>{tr(language, 'voice_input')}</button>
          <button className={'tab ' + (tab === 'text' ? 'active' : '')} onClick={() => setTab('text')}>{tr(language, 'text_input')}</button>
          <button className={'tab ' + (tab === 'doc' ? 'active' : '')} onClick={() => setTab('doc')}>{tr(language, 'doc_upload')}</button>
        </div>

        <div style={{ marginTop: 12 }}>
          {tab === 'voice' && (
            <>
              <VoiceInput onTranscript={setText} />
              <p style={{ marginTop: 8, color: '#6b7280', fontSize: 14 }}>
                {text ? 'Transcript: ' + text : 'Press Record to capture your query.'}
              </p>
            </>
          )}
          {tab === 'text' && (
            <textarea className="field" rows={5} value={text} onChange={(e) => setText(e.target.value)} placeholder="Type your question here..." />
          )}
          {tab === 'doc' && (
            <>
              <UploadArea files={files} setFiles={setFiles} />
              <p style={{ fontSize: 12, color: '#6b7280', marginTop: 8 }}>
                We use documents to add context and personalize the answer.
              </p>
            </>
          )}
        </div>

        <div style={{ marginTop: 12 }}>
          <button className="btn" disabled={!text || loading} onClick={ask}>
            {loading ? 'Thinking…' : tr(language, 'ask')}
          </button>
        </div>
      </section>

      <section className="card">
        <div className="card-title-row">
          <div className="card-title">Answer</div>
          {answer ? <TTSButton text={answer} languageLabel={language} /> : null}
        </div>
        <p style={{ minHeight: 72 }}>
          {answer || 'Your answer will appear here.'}
        </p>
        <div style={{ marginTop: 12 }}>
          <h3 style={{ fontWeight: 600, marginBottom: 8 }}>{tr(language, 'relevant_docs')}</h3>
          <DocPreview docs={docs} />
        </div>
      </section>
    </div>
  )
}
