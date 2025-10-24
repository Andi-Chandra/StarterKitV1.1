import NextAuth from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { supabase, getSupabaseAdmin } from '@/lib/supabase'

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

          // Verify credentials against Supabase Auth
          const { data, error } = await supabase.auth.signInWithPassword({
            email: credentials.email,
            password: credentials.password,
          })

          if (error || !data.user) return null

          const authUser = data.user

          // Optionally enrich profile from application users table
          let profile: any = {}
          try {
            const admin = getSupabaseAdmin()
            const { data: userRow } = await admin
              .from('users')
              .select('id,email,name,role,username')
              .eq('id', authUser.id)
              .single()
            if (userRow) profile = userRow
          } catch {}

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
