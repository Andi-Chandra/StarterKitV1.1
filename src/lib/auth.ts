import NextAuth from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'

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

          // For demo purposes, accept any email/password combination
          // In production, implement proper database authentication
          if (credentials.email === 'demo@example.com' && credentials.password === 'demo') {
            return {
              id: 'demo-user-id',
              email: 'demo@example.com',
              name: 'Demo User',
              username: 'demo',
              role: 'user',
            }
          }

          // For other emails, just check format and accept any password
          if (credentials.email.includes('@')) {
            return {
              id: 'user-' + Math.random().toString(36).substr(2, 9),
              email: credentials.email,
              name: credentials.email.split('@')[0],
              username: credentials.email.split('@')[0],
              role: 'user',
            }
          }

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
        token.id = user.id
        token.username = user.username
        token.role = user.role
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string
        session.user.username = token.username as string
        session.user.role = token.role as string
      }
      return session
    },
    async redirect({ url, baseUrl }: { url: string; baseUrl: string }) {
      try {
        // Normalize URL for comparison
        const to = url.startsWith('/') ? new URL(url, baseUrl) : new URL(url)
        const path = to.pathname
        if (path === '/dashboard') {
          return '/admin'
        }
        // Allow same-origin redirects
        if (to.origin === new URL(baseUrl).origin) {
          return to.pathname + to.search + to.hash
        }
        // Fallback to base URL
        return baseUrl
      } catch {
        return '/admin'
      }
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
}

export default NextAuth(authOptions)
