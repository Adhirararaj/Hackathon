'use client'

import React from 'react'
import AppShell from '@/components/app-shell'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useAppState } from '@/providers/app-state'
import { tr } from '@/lib/translations'

export default function ActivatePage() {
  const { user, setUser, language } = useAppState()
  const [form, setForm] = React.useState({
    accountNo: user?.account?.accountNo ?? '',
    ifscCode: user?.account?.ifscCode ?? '',
    branch: user?.account?.branch ?? '',
  })

  function save() {
    if (!user) return
    setUser({
      ...user,
      account: {
        accountNo: form.accountNo,
        ifscCode: form.ifscCode,
        branch: form.branch,
      },
    })
  }

  return (
    <AppShell title={tr(language, 'activate')}>
      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Link your bank account</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <label className="block">
            <span className="text-sm">Account number</span>
            <Input
              value={form.accountNo}
              onChange={e => setForm({ ...form, accountNo: e.target.value })}
              inputMode="numeric"
            />
          </label>
          <label className="block">
            <span className="text-sm">IFSC code</span>
            <Input
              value={form.ifscCode}
              onChange={e => setForm({ ...form, ifscCode: e.target.value })}
            />
          </label>
          <label className="block">
            <span className="text-sm">Branch</span>
            <Input
              value={form.branch}
              onChange={e => setForm({ ...form, branch: e.target.value })}
            />
          </label>
          <Button onClick={save}>Save</Button>
          {user?.account?.accountNo && (
            <p className="text-sm text-green-700">
              Account linked for contextual answers.
            </p>
          )}
        </CardContent>
      </Card>
    </AppShell>
  )
}
