import type { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { createClient } from '@supabase/supabase-js'

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      id: 'credentials',
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        try {
          if (!credentials?.email || !credentials?.password) return null

          // Create a Supabase client with the public anon key
          const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://rcxjtnojxtugtpjtydzu.supabase.co'
          const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJjeGp0bm9qeHR1Z3RwanR5ZHp1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAxMjIzOTAsImV4cCI6MjA3NTY5ODM5MH0.eYFfChSM7YwhjkArKlYiBfU1vAiwYekM7YlgBiO_RyU'
          const sb = createClient(supabaseUrl, supabaseAnonKey)

          // Verify credentials against Supabase Auth
          const { data, error } = await sb.auth.signInWithPassword({
            email: credentials.email,
            password: credentials.password,
          })

          if (error || !data.user) return null

          const authUser = data.user

          // Optionally enrich profile from application users table via service role if present
          let profile: any = {}
          try {
            const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
            if (serviceRoleKey) {
              const admin = createClient(supabaseUrl, serviceRoleKey, {
                auth: { autoRefreshToken: false, persistSession: false },
              })
              const { data: userRow } = await admin
                .from('users')
                .select('id,email,name,role,username')
                .eq('id', authUser.id)
                .single()
              if (userRow) profile = userRow
            }
          } catch (e) {
            console.warn('Profile enrichment skipped:', (e as any)?.message)
          }

          return {
            id: authUser.id,
            email: authUser.email || credentials.email,
            name:
              profile.name ||
              (authUser.user_metadata && (authUser.user_metadata as any).full_name) ||
              (authUser.email ? authUser.email.split('@')[0] : 'User'),
            username: profile.username || (authUser.email ? authUser.email.split('@')[0] : 'user'),
            role: (profile.role || 'user').toString().toLowerCase(),
          }
        } catch (error) {
          console.error('Auth error:', error)
          throw new Error(error instanceof Error ? error.message : 'Authentication failed')
        }
      }
    })
  ],
  debug: process.env.NEXTAUTH_DEBUG === 'true',
  pages: {
    signIn: '/sign-in',
    error: '/sign-in',
  },
  session: {
    strategy: 'jwt' as const,
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = (user as any).id
        token.username = (user as any).username
        token.role = (user as any).role
      }
      return token
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string
        session.user.username = token.username as string
        session.user.role = token.role as string
      }
      return session
    },
    async redirect({ url, baseUrl }) {
      const fallbackBase = process.env.NEXTAUTH_URL || 'http://localhost:3000'
      const safeBase = (() => {
        try {
          return new URL(baseUrl || fallbackBase)
        } catch {
          return new URL(fallbackBase)
        }
      })()

      if (!url) {
        return '/admin'
      }

      try {
        if (url.startsWith('/')) {
          if (url === '/dashboard') {
            return '/admin'
          }
          return url
        }

        const target = new URL(url)
        if (target.pathname === '/dashboard' && target.origin === safeBase.origin) {
          return '/admin'
        }
        if (target.origin === safeBase.origin) {
          return target.pathname + target.search + target.hash
        }
      } catch {
        try {
          const normalized = new URL(url.replace(/^\/+/, '/'), safeBase)
          if (normalized.pathname === '/dashboard') {
            return '/admin'
          }
          return normalized.pathname + normalized.search + normalized.hash
        } catch {
          return '/admin'
        }
      }

      return safeBase.origin
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
}

// No default export needed since we're using authOptions directly in the route handler
