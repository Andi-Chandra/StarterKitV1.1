import type { NextRequest } from 'next/server'
import type { User } from '@supabase/supabase-js'
import { getSupabaseAdmin } from './supabase'

export interface AuthenticatedUser {
  token: string
  user: User
}

function extractBearerToken(header: string | null): string | null {
  if (!header) return null
  const [scheme, value] = header.split(' ')
  if (!scheme || !value) return null
  if (/^Bearer$/i.test(scheme)) {
    return value.trim()
  }
  return null
}

export function resolveAccessToken(req: NextRequest): string | null {
  const authHeader = req.headers.get('authorization')
  const fromHeader = extractBearerToken(authHeader)
  if (fromHeader) return fromHeader

  // Allow tokens passed via cookie as a fallback (not set by default)
  const cookieToken = req.cookies.get('sb-access-token')?.value
  return cookieToken ?? null
}

export async function validateSupabaseToken(token: string | null): Promise<User | null> {
  if (!token) return null
  try {
    const admin = getSupabaseAdmin()
    const { data, error } = await admin.auth.getUser(token)
    if (error || !data?.user) {
      return null
    }
    return data.user
  } catch (error) {
    console.warn('Failed to validate Supabase token:', error)
    return null
  }
}

export async function requireSupabaseUser(req: NextRequest): Promise<AuthenticatedUser | null> {
  const token = resolveAccessToken(req)
  const user = await validateSupabaseToken(token)
  if (!token || !user) {
    return null
  }
  return { token, user }
}
