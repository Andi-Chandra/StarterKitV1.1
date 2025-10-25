import NextAuth from 'next-auth'
import { authOptions } from '@/lib/auth'

// Ensure Node.js runtime for compatibility with Credentials flow
export const runtime = 'nodejs'
// Disable caching for auth endpoints in app router
export const dynamic = 'force-dynamic'

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }
