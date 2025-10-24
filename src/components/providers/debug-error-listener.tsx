'use client'

import { useEffect } from 'react'

export function DebugErrorListener() {
  useEffect(() => {
    const onError = (e: ErrorEvent) => {
      const target = e.target as any
      const targetInfo = target && target.tagName
        ? { tagName: target.tagName, src: target.src, href: target.href }
        : undefined
      // eslint-disable-next-line no-console
      console.error('[window.error]', {
        message: e.message,
        filename: e.filename,
        lineno: e.lineno,
        colno: e.colno,
        target: targetInfo,
      })
    }

    const onRejection = (e: PromiseRejectionEvent) => {
      // eslint-disable-next-line no-console
      console.error('[unhandledrejection]', e.reason)
    }

    window.addEventListener('error', onError)
    window.addEventListener('unhandledrejection', onRejection)
    return () => {
      window.removeEventListener('error', onError)
      window.removeEventListener('unhandledrejection', onRejection)
    }
  }, [])

  return null
}

