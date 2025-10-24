import NextAuth from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'

// Optional: allow configuring a single demo/admin account via env vars
const DEMO_EMAIL = process.env.DEMO_AUTH_EMAIL || 'demo@example.com'
const DEMO_PASSWORD = process.env.DEMO_AUTH_PASSWORD || 'demo'

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
          if (!credentials?.email || !credentials?.password) {
            return null
          }

          // Strict demo login only. Remove or replace with real verification.
          if (
            credentials.email === DEMO_EMAIL &&
            credentials.password === DEMO_PASSWORD
          ) {
            return {
              id: 'demo-user-id',
              email: DEMO_EMAIL,
              name: 'Demo User',
              username: 'demo',
              role: 'user',
            }
          }

          // Otherwise, reject. Implement real user verification here (e.g., Supabase, Prisma).
          return null
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
