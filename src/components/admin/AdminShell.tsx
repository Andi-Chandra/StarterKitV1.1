'use client'

import Link from 'next/link'
import { useSession, signOut } from 'next-auth/react'
import { usePathname } from 'next/navigation'
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
import { LayoutDashboard, Image, Folder, Settings, LogOut } from 'lucide-react'

type AdminShellProps = {
  children: React.ReactNode
}

export default function AdminShell({ children }: AdminShellProps) {
  const { data: session } = useSession()
  const pathname = usePathname()

  const isActive = (href: string) => pathname === href

  return (
    <SidebarProvider>
      <div className="min-h-screen bg-background flex">
        <Sidebar>
          <SidebarHeader>
            <div className="px-2 py-2 text-sm font-semibold">Admin</div>
          </SidebarHeader>
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>Navigation</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={isActive('/admin')}>
                      <Link href="/admin">
                        <LayoutDashboard className="h-4 w-4" />
                        <span>Dashboard</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={isActive('/admin/media')}>
                      <Link href="/admin/media">
                        <Image className="h-4 w-4" />
                        <span>Media</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={isActive('/admin/categories')}>
                      <Link href="/admin/categories">
                        <Folder className="h-4 w-4" />
                        <span>Categories</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={isActive('/admin/sliders')}>
                      <Link href="/admin/sliders">
                        <Image className="h-4 w-4" />
                        <span>Sliders</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
            <SidebarSeparator />
            <SidebarGroup>
              <SidebarGroupLabel>Settings</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={isActive('/admin/settings')}>
                      <Link href="/admin/settings">
                        <Settings className="h-4 w-4" />
                        <span>Settings</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
          <SidebarFooter>
            {session?.user?.email && (
              <div className="text-xs text-muted-foreground px-2 py-1 truncate">
                {session.user.email}
              </div>
            )}
            <div className="px-2 py-1">
              <Button size="sm" variant="outline" className="w-full" onClick={() => signOut({ callbackUrl: '/' })}>
                <LogOut className="h-4 w-4 mr-2" /> Sign Out
              </Button>
            </div>
          </SidebarFooter>
        </Sidebar>
        <SidebarInset>
          {/* Top bar */}
          <div className="sticky top-0 z-30 flex h-14 items-center gap-2 border-b bg-background px-4 md:px-6 shadow-sm">
            <SidebarTrigger />
            <div className="font-medium">Admin</div>
            <div className="ml-auto flex items-center gap-2">
              {session?.user?.email && (
                <span className="hidden text-sm text-muted-foreground md:inline">
                  {session.user.email}
                </span>
              )}
            </div>
          </div>
          {/* Page content */}
          <main id="main" className="container py-4 md:py-6 lg:py-8">{children}</main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  )
}
