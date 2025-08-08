'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useAppState } from '@/providers/app-state'
import { tr } from '@/lib/translations'

export default function AuthPage() {
  const router = useRouter()
  const { setUser, language } = useAppState()
  const [login, setLogin] = React.useState({ number: '', password: '' })
  const [reg, setReg] = React.useState({
    number: '',
    password: '',
    fullname: '',
  })

  function doLogin() {
    const isAdmin = login.number === '0000'
    setUser({ number: login.number, isAdmin, language })
    router.push('/home')
  }

  function doRegister() {
    setUser({ number: reg.number, fullname: reg.fullname, language })
    router.push('/home')
  }

  return (
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-xl">
        <CardHeader>
          <CardTitle className="text-center">{tr(language, 'login')}</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="login">
            <TabsList className="grid grid-cols-2">
              <TabsTrigger value="login">{tr(language, 'login')}</TabsTrigger>
              <TabsTrigger value="register">{tr(language, 'register')}</TabsTrigger>
            </TabsList>
            <TabsContent value="login" className="mt-4 space-y-3">
              <label className="block">
                <span className="text-sm">{tr(language, 'mobile_number')}</span>
                <Input
                  inputMode="numeric"
                  value={login.number}
                  onChange={e => setLogin({ ...login, number: e.target.value })}
                  placeholder="e.g. 9876543210"
                />
              </label>
              <label className="block">
                <span className="text-sm">{tr(language, 'password')}</span>
                <Input
                  type="password"
                  value={login.password}
                  onChange={e => setLogin({ ...login, password: e.target.value })}
                />
              </label>
              <Button className="w-full" onClick={doLogin}>
                {tr(language, 'login')}
              </Button>
            </TabsContent>
            <TabsContent value="register" className="mt-4 space-y-3">
              <label className="block">
                <span className="text-sm">{tr(language, 'full_name')}</span>
                <Input
                  value={reg.fullname}
                  onChange={e => setReg({ ...reg, fullname: e.target.value })}
                />
              </label>
              <label className="block">
                <span className="text-sm">{tr(language, 'mobile_number')}</span>
                <Input
                  inputMode="numeric"
                  value={reg.number}
                  onChange={e => setReg({ ...reg, number: e.target.value })}
                  placeholder="e.g. 9876543210"
                />
              </label>
              <label className="block">
                <span className="text-sm">{tr(language, 'password')}</span>
                <Input
                  type="password"
                  value={reg.password}
                  onChange={e => setReg({ ...reg, password: e.target.value })}
                />
              </label>
              <Button className="w-full" onClick={doRegister}>
                {tr(language, 'register')}
              </Button>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
