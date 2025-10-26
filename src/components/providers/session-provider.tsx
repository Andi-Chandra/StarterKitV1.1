'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import type { Session as SupabaseSession, User as SupabaseUser } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'

type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated'

interface SessionUser {
  id: string
  email: string | null
  name: string | null
  role: string | null
}

interface SessionLike {
  user: SessionUser
  accessToken: string | null
}

interface AuthContextValue {
  status: AuthStatus
  data: SessionLike | null
  accessToken: string | null
  supabaseSession: SupabaseSession | null
  supabaseUser: SupabaseUser | null
  signIn: (email: string, password: string) => Promise<{ error?: string | null }>
  signOut: () => Promise<{ error?: string | null }>
  refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

function fallbackUser(user: SupabaseUser | null): SessionUser | null {
  if (!user) return null
  const metadata = (user.user_metadata || {}) as Record<string, unknown>
  const rawName =
    typeof metadata.full_name === 'string'
      ? metadata.full_name
      : typeof metadata.name === 'string'
        ? metadata.name
        : null

  return {
    id: user.id,
    email: user.email ?? null,
    name: rawName ?? (user.email ? user.email.split('@')[0] : null),
    role: typeof metadata.role === 'string' ? metadata.role : null,
  }
}

async function fetchProfile(accessToken: string) {
  const response = await fetch('/api/auth/me', {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    cache: 'no-store',
  })

  if (!response.ok) {
    throw new Error(`Failed to load profile (${response.status})`)
  }

  const json = await response.json().catch(() => null)
  if (!json?.user) {
    throw new Error('Missing profile payload')
  }

  const profile = json.user as Record<string, unknown>
  return {
    id: typeof profile.id === 'string' ? profile.id : '',
    email: typeof profile.email === 'string' ? profile.email : null,
    name: typeof profile.name === 'string' ? profile.name : null,
    role: typeof profile.role === 'string' ? profile.role : null,
  } satisfies SessionUser
}

export default function SupabaseAuthProvider({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<AuthStatus>('loading')
  const [supabaseSession, setSupabaseSession] = useState<SupabaseSession | null>(null)
  const [supabaseUser, setSupabaseUser] = useState<SupabaseUser | null>(null)
  const [sessionLike, setSessionLike] = useState<SessionLike | null>(null)
  const loadingProfileRef = useRef(false)

  const accessToken = useMemo(
    () => supabaseSession?.access_token ?? null,
    [supabaseSession],
  )

  const applyProfile = useCallback(
    (profile: SessionUser | null, tokenOverride?: string | null) => {
      if (!profile) {
        setSessionLike(null)
        return
      }
      setSessionLike({
        user: profile,
        accessToken: tokenOverride ?? accessToken,
      })
    },
    [accessToken],
  )

  const hydrateFromSession = useCallback(
    async (session: SupabaseSession | null) => {
      setSupabaseSession(session)
      const user = session?.user ?? null
      setSupabaseUser(user)

      if (!session || !session.access_token) {
        applyProfile(null)
        setStatus('unauthenticated')
        return
      }

      applyProfile(fallbackUser(user), session?.access_token ?? null)
      setStatus('authenticated')

      if (loadingProfileRef.current) return
      loadingProfileRef.current = true
      try {
        const profile = await fetchProfile(session.access_token)
        applyProfile(profile, session.access_token)
      } catch (error) {
        console.warn('Profile enrichment failed:', error)
      } finally {
        loadingProfileRef.current = false
      }
    },
    [applyProfile],
  )

  useEffect(() => {
    let mounted = true

    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return
      hydrateFromSession(data.session)
      if (!data.session) {
        setStatus('unauthenticated')
      }
    })

    const {
      data: authListener,
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mounted) return
      hydrateFromSession(session)
    })

    return () => {
      mounted = false
      authListener.subscription?.unsubscribe()
    }
  }, [hydrateFromSession])

  const refreshProfile = useCallback(async () => {
    if (!accessToken) return
    const profile = await fetchProfile(accessToken)
    applyProfile(profile, accessToken)
  }, [accessToken, applyProfile])

  const signIn = useCallback(
    async (email: string, password: string) => {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        return { error: error.message }
      }

      await hydrateFromSession(data.session)
      return { error: null }
    },
    [hydrateFromSession],
  )

  const signOut = useCallback(async () => {
    const { error } = await supabase.auth.signOut()
    if (error) {
      return { error: error.message }
    }
    await hydrateFromSession(null)
    return { error: null }
  }, [hydrateFromSession])

  const value = useMemo<AuthContextValue>(
    () => ({
      status,
      data: sessionLike,
      accessToken,
      supabaseSession,
      supabaseUser,
      signIn,
      signOut,
      refreshProfile,
    }),
    [status, sessionLike, accessToken, supabaseSession, supabaseUser, signIn, signOut, refreshProfile],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within SupabaseAuthProvider')
  }
  return context
}

export function useSession() {
  const { data, status } = useAuth()
  return { data, status }
}
