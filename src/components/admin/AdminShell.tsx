'use client'

import { useSession, signOut } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { LogOut } from 'lucide-react'

type AdminShellProps = {
  children: React.ReactNode
}

export default function AdminShell({ children }: AdminShellProps) {
  const { data: session } = useSession()

  return (
    <div className="min-h-screen bg-background">
      {/* Top bar */}
      <div className="sticky top-0 z-30 flex h-14 items-center gap-2 border-b bg-background px-4 md:px-6 shadow-sm">
        <div className="font-medium">Admin</div>
        <div className="ml-auto flex items-center gap-2">
          {session?.user?.email && (
            <span className="hidden text-sm text-muted-foreground md:inline">
              {session.user.email}
            </span>
          )}
          <Button size="sm" variant="outline" onClick={() => signOut({ callbackUrl: '/' })}>
            <LogOut className="h-4 w-4 mr-2" /> Sign Out
          </Button>
        </div>
      </div>
      {/* Page content */}
      <main className="container py-4 md:py-6 lg:py-8">{children}</main>
    </div>
  )
}

