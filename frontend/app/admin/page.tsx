'use client'

import React from 'react'
import AppShell from '@/components/app-shell'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { MOCK_LANG_USAGE } from '@/lib/mock'
import { useAppState } from '@/providers/app-state'
import { tr } from '@/lib/translations'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'

type DocRow = { title: string; content: string }

export default function AdminPage() {
  const { language, user } = useAppState()
  const [title, setTitle] = React.useState('')
  const [content, setContent] = React.useState('')
  const [docs, setDocs] = React.useState<DocRow[]>([])

  if (!user?.isAdmin) {
    return (
      <AppShell title={tr(language, 'admin')}>
        <p className="text-sm">Admins only.</p>
      </AppShell>
    )
  }

  function addDoc() {
    if (!title || !content) return
    setDocs(prev => [{ title, content }, ...prev])
    setTitle('')
    setContent('')
  }

  return (
    <AppShell title={tr(language, 'admin')}>
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>{tr(language, 'add_to_vector_db')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <label className="block">
              <span className="text-sm"> {tr(language, 'title')} </span>
              <Input value={title} onChange={e => setTitle(e.target.value)} />
            </label>
            <label className="block">
              <span className="text-sm"> {tr(language, 'content')} </span>
              <Textarea rows={6} value={content} onChange={e => setContent(e.target.value)} />
            </label>
            <Button onClick={addDoc}>{tr(language, 'add')}</Button>
            {docs.length > 0 && (
              <div className="mt-4">
                <h3 className="font-medium mb-2">Recent additions</h3>
                <ul className="space-y-2">
                  {docs.map((d, i) => (
                    <li key={i} className="rounded-md border bg-white p-3">
                      <div className="font-medium">{d.title}</div>
                      <div className="text-sm text-muted-foreground line-clamp-2">
                        {d.content}
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{tr(language, 'analytics')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[320px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={MOCK_LANG_USAGE}>
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#10b981" />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <p className="text-sm mt-2">{tr(language, 'most_used_languages')}</p>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  )
}
