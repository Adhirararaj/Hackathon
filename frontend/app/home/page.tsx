'use client'

import React from 'react'
import AppShell from '@/components/app-shell'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import VoiceInput from '@/components/voice-input'
import UploadArea from '@/components/upload-area'
import DocPreview from '@/components/doc-preview'
import TTSButton from '@/components/tts-button'
import { mockRagAnswer } from '@/lib/mock'
import { useAppState } from '@/providers/app-state'
import { tr } from '@/lib/translations'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

export default function HomePage() {
  const { language } = useAppState()
  const [text, setText] = React.useState('')
  const [files, setFiles] = React.useState<File[]>([])
  const [answer, setAnswer] = React.useState('')
  const [docs, setDocs] = React.useState<any[]>([])
  const [loading, setLoading] = React.useState(false)

  async function ask() {
    setLoading(true)
    const { answer, docs } = await mockRagAnswer(text, language)
    setAnswer(answer)
    setDocs(docs)
    setLoading(false)
  }

  return (
    <AppShell title={tr(language, 'home')}>
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Ask a question</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Tabs defaultValue="voice">
              <TabsList className="grid grid-cols-3">
                <TabsTrigger value="voice">{tr(language, 'voice_input')}</TabsTrigger>
                <TabsTrigger value="text">{tr(language, 'text_input')}</TabsTrigger>
                <TabsTrigger value="doc">{tr(language, 'doc_upload')}</TabsTrigger>
              </TabsList>
              <TabsContent value="voice" className="mt-4">
                <VoiceInput onTranscript={setText} />
                <p className="mt-2 text-sm text-muted-foreground">
                  {text ? 'Transcript: ' + text : 'Press Record to capture your query.'}
                </p>
              </TabsContent>
              <TabsContent value="text" className="mt-4">
                <Textarea
                  value={text}
                  onChange={e => setText(e.target.value)}
                  placeholder="Type your question here..."
                  rows={5}
                />
              </TabsContent>
              <TabsContent value="doc" className="mt-4">
                <UploadArea files={files} setFiles={setFiles} />
                <p className="text-xs text-muted-foreground mt-2">
                  We use documents to add context and personalize the answer.
                </p>
              </TabsContent>
            </Tabs>
            <Button disabled={!text || loading} onClick={ask}>
              {loading ? 'Thinking...' : tr(language, 'ask')}
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Answer</CardTitle>
            {answer && <TTSButton text={answer} languageLabel={language} />}
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="min-h-[72px]">{answer || 'Your answer will appear here.'}</p>
            <div>
              <h3 className="font-medium mb-2">{tr(language, 'relevant_docs')}</h3>
              <DocPreview docs={docs} />
            </div>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  )
}
