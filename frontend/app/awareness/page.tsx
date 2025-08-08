'use client'

import React from 'react'
import AppShell from '@/components/app-shell'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Input } from '@/components/ui/input'
import { useAppState } from '@/providers/app-state'
import { FAQS } from '@/lib/mock'
import { tr } from '@/lib/translations'

export default function AwarenessPage() {
  const { language, subscribed, setSubscribed, user } = useAppState()
  const [number, setNumber] = React.useState(user?.number ?? '')

  return (
    <AppShell title={tr(language, 'awareness')}>
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>{tr(language, 'faq')}</CardTitle>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="w-full">
              {FAQS.map((f, i) => (
                <AccordionItem key={i} value={'item-' + i}>
                  <AccordionTrigger>{f.q}</AccordionTrigger>
                  <AccordionContent>{f.a}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{tr(language, 'subscribe_sms')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <label className="block">
              <span className="text-sm">Mobile number</span>
              <Input
                inputMode="numeric"
                value={number}
                onChange={e => setNumber(e.target.value)}
              />
            </label>
            <div className="flex items-center gap-3">
              <Switch checked={subscribed} onCheckedChange={setSubscribed} />
              <span className="text-sm">
                {subscribed ? tr(language, 'subscribed') : tr(language, 'not_subscribed')}
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              We’ll send daily banking tips and fraud alerts in your selected language.
            </p>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  )
}
