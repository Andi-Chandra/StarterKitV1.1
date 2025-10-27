'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarSeparator,
  SidebarTrigger,
} from '@/components/ui/sidebar'
import { LayoutDashboard, Image, Folder, Settings, LogOut, PanelsTopLeft } from 'lucide-react'
import { useAuth, useSession } from '@/components/providers/session-provider'
import { cn } from '@/lib/utils'

type AdminShellProps = {
  children: React.ReactNode
}

export default function AdminShell({ children }: AdminShellProps) {
  const router = useRouter()
  const { data: session } = useSession()
  const { signOut } = useAuth()
  const pathname = usePathname()

  const navigation = [
    { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/admin/media', label: 'Media', icon: Image },
    { href: '/admin/categories', label: 'Categories', icon: Folder },
    { href: '/admin/sliders', label: 'Sliders', icon: Image },
  ] as const

  const secondary = [{ href: '/admin/settings', label: 'Settings', icon: Settings }] as const

  const isActive = (href: string) => pathname === href
  const handleSignOut = async () => {
    const result = await signOut()
    if (!result.error) {
      router.push('/')
    }
  }

  const currentNav = [...navigation, ...secondary].find((item) => isActive(item.href))

  return (
    <SidebarProvider>
      <div className="relative min-h-screen bg-muted/60">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_theme(colors.primary/10),_transparent_60%)]" />
        <div className="relative z-10 flex min-h-screen">
          <Sidebar className="border-r/0 bg-card/80 backdrop-blur">
            <SidebarHeader>
              <div className="flex items-center gap-2 px-2 py-3 text-sm font-semibold tracking-wide">
                <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <PanelsTopLeft className="h-4 w-4" />
                </span>
                Control Center
              </div>
            </SidebarHeader>
            <SidebarContent>
              <SidebarGroup>
                <SidebarGroupLabel>Main</SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {navigation.map((item) => (
                      <SidebarMenuItem key={item.href}>
                        <SidebarMenuButton
                          asChild
                          isActive={isActive(item.href)}
                          className={cn(
                            'rounded-md transition-colors',
                            isActive(item.href)
                              ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                              : 'hover:bg-muted'
                          )}
                        >
                          <Link href={item.href}>
                            <item.icon className="h-4 w-4" />
                            <span>{item.label}</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
              <SidebarSeparator />
              <SidebarGroup>
                <SidebarGroupLabel>System</SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {secondary.map((item) => (
                      <SidebarMenuItem key={item.href}>
                        <SidebarMenuButton
                          asChild
                          isActive={isActive(item.href)}
                          className={cn(
                            'rounded-md transition-colors',
                            isActive(item.href)
                              ? 'bg-primary/10 text-primary hover:bg-primary/20'
                              : 'hover:bg-muted'
                          )}
                        >
                          <Link href={item.href}>
                            <item.icon className="h-4 w-4" />
                            <span>{item.label}</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            </SidebarContent>
            <SidebarFooter className="border-t bg-muted/40">
              <div className="space-y-2 px-2 py-3">
                {session?.user?.email && (
                  <div className="rounded-md bg-background/70 px-3 py-2 text-xs text-muted-foreground shadow-sm">
                    <span className="block truncate font-medium text-foreground">{session.user.email}</span>
                    <span className="text-[10px] uppercase tracking-wide text-muted-foreground/80">
                      Signed in
                    </span>
                  </div>
                )}
                <Button size="sm" variant="outline" className="w-full" onClick={handleSignOut}>
                  <LogOut className="h-4 w-4 mr-2" /> Sign Out
                </Button>
              </div>
            </SidebarFooter>
          </Sidebar>
          <SidebarInset className="flex-1">
            {/* Top bar */}
            <div className="sticky top-0 z-30 border-b bg-background/70 backdrop-blur">
              <div className="flex h-16 items-center gap-3 px-4 md:px-8">
                <SidebarTrigger className="rounded-full border bg-background/80 shadow-sm" />
                <div className="flex flex-col">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground">
                    Admin Workspace
                  </span>
                  <span className="text-base font-semibold text-foreground">
                    {currentNav?.label ?? 'Dashboard'}
                  </span>
                </div>
                <div className="ml-auto flex items-center gap-3">
                  {session?.user?.email && (
                    <div className="hidden rounded-full border bg-background px-3 py-1 text-xs text-muted-foreground md:flex">
                      {session.user.email}
                    </div>
                  )}
                </div>
              </div>
            </div>
            {/* Page content */}
            <main
              id="main"
              className="relative mx-auto flex w-full max-w-6xl flex-1 flex-col px-4 pb-8 pt-6 md:px-8 md:pt-10"
            >
              {children}
            </main>
          </SidebarInset>
        </div>
      </div>
    </SidebarProvider>
  )
}
