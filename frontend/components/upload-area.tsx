'use client'

import React from 'react'
import { Button } from '@/components/ui/button'
import { Upload, X } from 'lucide-react'

type UploadAreaProps = {
  files: File[]
  setFiles: (files: File[]) => void
}

export default function UploadArea({ files, setFiles }: UploadAreaProps) {
  const inputRef = React.useRef<HTMLInputElement | null>(null)
  function pick() {
    inputRef.current?.click()
  }
  function onChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files ? Array.from(e.target.files) : []
    setFiles([...files, ...f])
  }
  function removeAt(idx: number) {
    setFiles(files.filter((_, i) => i !== idx))
  }
  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        className="hidden"
        accept=".pdf,.txt,.doc,.docx,.png,.jpg"
        multiple
        onChange={onChange}
      />
      <Button variant="outline" onClick={pick}>
        <Upload className="size-4 mr-2" />
        Choose files
      </Button>
      {files.length > 0 && (
        <ul className="mt-3 space-y-2">
          {files.map((f, i) => (
            <li
              key={i}
              className="flex items-center justify-between rounded-md border bg-white px-3 py-2 text-sm"
            >
              <span className="truncate max-w-[70%]">{f.name}</span>
              <button
                className="text-red-600 hover:underline"
                onClick={() => removeAt(i)}
                aria-label={'Remove ' + f.name}
              >
                <X className="size-4" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
