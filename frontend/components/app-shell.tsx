'use client'

import * as React from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarRail,
  SidebarTrigger,
} from '@/components/ui/sidebar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { Home, Lock, Info, Zap, BookOpen, Shield, LogOut } from 'lucide-react'
import { useAppState } from '@/providers/app-state'
import { LANGUAGES, tr } from '@/lib/translations'
import { cn } from '@/lib/utils'

type AppShellProps = {
  children: React.ReactNode
  title?: string
}

export default function AppShell({ children, title = 'Vaantra' }: AppShellProps) {
  const pathname = usePathname()
  const router = useRouter()
  const { language, setLanguage, user, setUser } = useAppState()

  const nav = [
    { title: tr(language, 'home'), href: '/home', icon: Home },
    { title: tr(language, 'about'), href: '/about', icon: Info },
    { title: tr(language, 'activate'), href: '/activate', icon: Lock },
    { title: tr(language, 'awareness'), href: '/awareness', icon: BookOpen },
    ...(user?.isAdmin ? [{ title: tr(language, 'admin'), href: '/admin', icon: Shield }] : []),
  ]

  return (
    <SidebarProvider>
      <Sidebar className="border-r">
        <SidebarHeader className="px-4">
          <div className="flex items-center gap-2">
            <Zap className="size-5 text-emerald-600" />
            <div className="font-semibold">{tr(language, 'app_name')}</div>
          </div>
          <div className="mt-3">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="w-full justify-between">
                  <span className="truncate">{language}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-[220px]">
                {LANGUAGES.map(l => (
                  <DropdownMenuItem key={l.label} onClick={() => setLanguage(l.label)}>
                    {l.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Navigate</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {nav.map(item => (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton asChild isActive={pathname === item.href}>
                      <Link href={item.href} className="flex items-center gap-2">
                        <item.icon className="size-4" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        <SidebarRail />
      </Sidebar>
      <SidebarInset>
        <header className="flex h-14 shrink-0 items-center justify-between border-b px-4">
          <div className="flex items-center gap-2">
            <SidebarTrigger />
            <Separator orientation="vertical" className="mx-2 h-4" />
            <span className="font-medium">{title}</span>
          </div>
          <div className="flex items-center gap-3">
            {user ? (
              <>
                <span className="text-sm text-muted-foreground hidden sm:inline">
                  {user.fullname || user.number}
                </span>
                <Avatar className="size-8">
                  <AvatarFallback>
                    {(user.fullname || user.number || 'U').slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setUser(null)
                    router.push('/')
                  }}
                >
                  <LogOut className="size-4 mr-2" />
                  {tr(language, 'logout')}
                </Button>
              </>
            ) : (
              <Button size="sm" onClick={() => router.push('/auth')}>
                {tr(language, 'login')}
              </Button>
            )}
          </div>
        </header>
        <main className={cn('p-4', 'min-h-[calc(100vh-3.5rem)] bg-neutral-50')}>
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
