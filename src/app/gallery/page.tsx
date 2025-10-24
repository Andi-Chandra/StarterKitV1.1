'use client'

import { useEffect } from 'react'

export default function GalleryRedirectPage() {
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.location.replace('/#gallery')
    }
  }, [])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-sm text-muted-foreground">Redirecting to gallery…</p>
    </div>
  )
}

