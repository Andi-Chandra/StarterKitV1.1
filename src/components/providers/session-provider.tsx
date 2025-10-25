'use client'

import { useEffect } from 'react'
import { SessionProvider } from 'next-auth/react'

declare global {
  interface Window {
    __NEXTAUTH?: {
      baseUrl?: string
      basePath?: string
      [key: string]: any
    }
  }
}

export default function NextAuthProvider({ children }: { children: React.ReactNode }) {
  // Harden NextAuth client config if env misconfigured (e.g., invalid NEXTAUTH_URL)
  useEffect(() => {
    try {
      const cfg = typeof window !== 'undefined' ? (window as any).__NEXTAUTH : undefined
      if (!cfg) return
      const origin = window.location.origin
      const hasProtocol = (u?: string) => !!u && /^https?:\/\//i.test(u)
      // If baseUrl is missing or invalid, normalize it to the current origin
      if (!hasProtocol(cfg.baseUrl)) {
        cfg.baseUrl = origin
      }
      // Ensure basePath is set
      if (!cfg.basePath) {
        cfg.basePath = '/api/auth'
      }
    } catch {
      // no-op
    }
  }, [])

  return <SessionProvider>{children}</SessionProvider>
}
