'use client'

import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { LANGUAGES, tr } from '@/lib/translations'
import { useAppState } from '@/providers/app-state'

export default function LanguageSelectionPage() {
  const router = useRouter()
  const { language, setLanguage } = useAppState()

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-white flex items-center justify-center p-4">
      <Card className="w-full max-w-xl">
        <CardHeader>
          <CardTitle className="text-center text-2xl">
            {tr(language, 'select_language')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {LANGUAGES.map(l => (
              <Button
                key={l.label}
                variant={language === l.label ? 'default' : 'outline'}
                className="justify-center py-6"
                onClick={() => setLanguage(l.label)}
              >
                {l.label}
              </Button>
            ))}
          </div>
          <div className="mt-6 flex justify-center">
            <Button size="lg" onClick={() => router.push('/auth')}>
              {tr(language, 'continue')}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
