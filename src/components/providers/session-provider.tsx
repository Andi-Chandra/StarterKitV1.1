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
      if (typeof window === 'undefined') return
      const globalAny = window as any
      const currentOrigin = window.location.origin
      if (!globalAny.__NEXTAUTH) {
        globalAny.__NEXTAUTH = { baseUrl: currentOrigin, basePath: '/api/auth' }
        return
      }
      const cfg = globalAny.__NEXTAUTH
      const hasProtocol = (u?: string) => !!u && /^https?:\/\//i.test(u)
      // If baseUrl is missing or invalid, normalize it to the current origin
      if (!hasProtocol(cfg.baseUrl)) {
        cfg.baseUrl = currentOrigin
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
