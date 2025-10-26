'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { supabase } from '@/lib/supabase'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2 } from 'lucide-react'

export default function ResetPasswordPage() {
  const router = useRouter()
  const [accessToken, setAccessToken] = useState<string | null>(null)
  const [refreshToken, setRefreshToken] = useState<string | null>(null)
  const [linkError, setLinkError] = useState<string | null>(null)
  const [sessionReady, setSessionReady] = useState(false)
  const [loading, setLoading] = useState(true)
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  // Parse recovery tokens from URL hash (#access_token=...&refresh_token=...)
  useEffect(() => {
    try {
      if (typeof window === 'undefined') return
      const hash = window.location.hash || ''
      const params = new URLSearchParams(hash.replace(/^#/, ''))
      const at = params.get('access_token')
      const rt = params.get('refresh_token')
      const type = params.get('type') // expect 'recovery'
      if (!at || !rt) {
        setLinkError('Invalid or missing recovery link. Please use the link from your email on this device.')
        setLoading(false)
        return
      }
      if (type && type !== 'recovery') {
        // Not strictly required, but helps with debugging other flow types
        // e.g., magiclink, signup, invited, etc.
      }
      setAccessToken(at)
      setRefreshToken(rt)
    } catch (e) {
      setLinkError('Failed to parse recovery link.')
      setLoading(false)
    }
  }, [])

  // Establish a session using the recovery tokens so we can update the password
  useEffect(() => {
    const run = async () => {
      if (!accessToken || !refreshToken) return
      try {
        const { error } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        })
        if (error) {
          setLinkError(error.message || 'Failed to start recovery session.')
          setLoading(false)
          return
        }
        setSessionReady(true)
      } catch (e: any) {
        setLinkError(e?.message || 'Failed to start recovery session.')
      } finally {
        setLoading(false)
      }
    }
    run()
  }, [accessToken, refreshToken])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(false)
    if (!sessionReady) {
      setError('Recovery session is not ready. Please reopen the link from your email.')
      return
    }
    if (!password || password.length < 8) {
      setError('Password must be at least 8 characters long.')
      return
    }
    if (password !== confirm) {
      setError('Passwords do not match.')
      return
    }
    setLoading(true)
    try {
      const { error: updateError } = await supabase.auth.updateUser({ password })
      if (updateError) {
        setError(updateError.message || 'Failed to update password.')
        setLoading(false)
        return
      }
      setSuccess(true)
      // Optionally sign out existing Supabase session to avoid stale credentials
      try { await supabase.auth.signOut() } catch {}
    } catch (e: any) {
      setError(e?.message || 'Unexpected error while updating password.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="flex items-center justify-center py-12 px-4">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center">Reset Password</CardTitle>
            <CardDescription className="text-center">
              Set a new password for your account
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            {loading && (
              <div className="flex items-center justify-center py-4 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Preparing recovery session...
              </div>
            )}

            {linkError && (
              <Alert variant="destructive">
                <AlertDescription>{linkError}</AlertDescription>
              </Alert>
            )}

            {!loading && !linkError && !sessionReady && (
              <Alert>
                <AlertDescription>
                  Open the password reset link from your email on this device. Ensure your app is running on the same URL configured in Supabase Auth settings.
                </AlertDescription>
              </Alert>
            )}

            {!loading && sessionReady && (
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
                {success && (
                  <Alert>
                    <AlertDescription>
                      Password updated. You can now sign in with your new password.
                    </AlertDescription>
                  </Alert>
                )}
                <div className="space-y-2">
                  <Label htmlFor="password">New Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter new password"
                    required
                    disabled={loading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm">Confirm New Password</Label>
                  <Input
                    id="confirm"
                    type="password"
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    placeholder="Re-enter new password"
                    required
                    disabled={loading}
                  />
                </div>
                <CardFooter className="px-0">
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Updating...
                      </>
                    ) : (
                      'Update Password'
                    )}
                  </Button>
                </CardFooter>
                <div className="text-center text-sm text-muted-foreground">
                  <button
                    type="button"
                    className="underline"
                    onClick={() => router.push('/sign-in')}
                  >
                    Back to Sign In
                  </button>
                </div>
              </form>
            )}
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  )
}
