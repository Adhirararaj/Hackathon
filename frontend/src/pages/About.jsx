import React from 'react'

export default function About() {
  return (
    <div className="card" style={{ maxWidth: 900 }}>
      <div className="card-title">Vaantra: Bridging the Language Gap in Banking</div>
      <div style={{ display: 'grid', gap: 10 }}>
        <p>
          Vaantra is a multilingual web-based banking assistant that helps users access banking services in their preferred regional language via voice, text, or documents. Our goal is to enable financial inclusion by empowering users who are not fluent in English or Hindi.
        </p>
        <ul style={{ paddingLeft: 18, listStyle: 'disc' }}>
          <li>Inclusive design for non-English speakers</li>
          <li>Multi-modal input (voice, text, docs)</li>
          <li>Seamless translation and transcription pipeline</li>
          <li>Real-time contextual answers powered by RAG</li>
          <li>Daily awareness alerts for users</li>
          <li>Admin analytics & content management</li>
        </ul>
      </div>
    </div>
  )
}
