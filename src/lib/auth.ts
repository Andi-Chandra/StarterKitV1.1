import NextAuth from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { createClient } from '@supabase/supabase-js'

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        try {
          if (!credentials?.email || !credentials?.password) return null

          // Create a Supabase client here to avoid module-load errors if envs are missing
          const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
          const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
          if (!supabaseUrl || !supabaseAnonKey) {
            console.error('Supabase env missing: NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY')
            return null
          }
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
          return null
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
        ;(session.user as any).id = token.id as string
        ;(session.user as any).username = token.username as string
        ;(session.user as any).role = token.role as string
      }
      return session
    },
    async redirect({ url, baseUrl }: { url: string; baseUrl: string }) {
      try {
        const to = url.startsWith('/') ? new URL(url, baseUrl) : new URL(url)
        const path = to.pathname
        if (path === '/dashboard') {
          return '/admin'
        }
        if (to.origin === new URL(baseUrl).origin) {
          return to.pathname + to.search + to.hash
        }
        return baseUrl
      } catch {
        return '/admin'
      }
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
}

export default NextAuth(authOptions)
