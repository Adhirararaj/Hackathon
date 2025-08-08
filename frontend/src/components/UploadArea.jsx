import React, { useRef } from 'react'

export default function UploadArea({ files, setFiles }) {
  const inputRef = useRef(null)

  function pick() {
    inputRef.current?.click()
  }
  function onChange(e) {
    const f = e.target.files ? Array.from(e.target.files) : []
    setFiles([...(files || []), ...f])
  }
  function removeAt(idx) {
    setFiles(files.filter((_, i) => i !== idx))
  }

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        className="sr-only"
        accept=".pdf,.txt,.doc,.docx,.png,.jpg"
        multiple
        onChange={onChange}
      />
      <button className="btn outline" onClick={pick}>Choose files</button>
      {files?.length > 0 && (
        <ul style={{ marginTop: 12, display: 'grid', gap: 8 }}>
          {files.map((f, i) => (
            <li key={i} style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              border: '1px solid #e5e7eb', background: '#fff', padding: '8px 12px', borderRadius: 8
            }}>
              <span style={{ maxWidth: '70%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{f.name}</span>
              <button className="btn outline" onClick={() => removeAt(i)}>Remove</button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
