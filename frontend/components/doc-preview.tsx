'use client'

import React from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import type { MockDoc } from '@/lib/mock'

export default function DocPreview({ docs = [] as MockDoc[] }) {
  return (
    <div className="grid gap-3 md:grid-cols-2">
      {docs.map(d => (
        <Card key={d.id} className="bg-white">
          <CardHeader>
            <CardTitle className="text-base">{d.title}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">{d.snippet}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
