import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl
  if (pathname === '/api/auth/callback/credentials' && req.method !== 'POST') {
    // Avoid NextAuth 500 on GET to credentials callback; redirect users to sign-in
    const url = req.nextUrl.clone()
    url.pathname = '/sign-in'
    url.search = ''
    url.hash = ''
    return NextResponse.redirect(url)
  }
  return NextResponse.next()
}

export const config = {
  matcher: ['/api/auth/callback/credentials'],
}

