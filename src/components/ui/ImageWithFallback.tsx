'use client'

import Image from 'next/image'
import { useState } from 'react'
import { cn } from '@/lib/utils'

interface ImageWithFallbackProps {
  src: string
  alt: string
  fill?: boolean
  width?: number
  height?: number
  className?: string
  priority?: boolean
  quality?: number
  fallbackSrc?: string
  forceUnoptimized?: boolean
}

export function ImageWithFallback({
  src,
  alt,
  fill = false,
  width,
  height,
  className,
  priority = false,
  quality = 75,
  fallbackSrc = '/logo.svg',
  forceUnoptimized = false
}: ImageWithFallbackProps) {
  function normalizeSupabasePublicUrl(u: string) {
    try {
      // If it's a Supabase Storage URL missing "/public", insert it
      // e.g. https://xyz.supabase.co/storage/v1/object/media/path -> .../object/public/media/path
      const re = /^(https?:\/\/[^/]+\.supabase\.co\/storage\/v1\/object\/)(?!public\/)([^/]+\/.*)$/
      const m = u.match(re)
      if (m) {
        return `${m[1]}public/${m[2]}`
      }
      return u
    } catch {
      return u
    }
  }

  const [imgSrc, setImgSrc] = useState(normalizeSupabasePublicUrl(src))
  const [hasError, setHasError] = useState(false)

  const handleError = () => {
    if (!hasError && imgSrc !== fallbackSrc) {
      setImgSrc(fallbackSrc)
      setHasError(true)
    }
  }

  // If the image is an absolute remote URL, bypass the Next.js optimizer to avoid
  // _next/image 404s when remote hosts are unreachable or not whitelisted at build time.
  const isRemoteAbsolute = /^https?:\/\//.test(imgSrc)

  return (
    <Image
      src={imgSrc}
      alt={alt}
      fill={fill}
      width={!fill ? width : undefined}
      height={!fill ? height : undefined}
      className={cn(className, hasError && 'opacity-75')}
      priority={priority}
      quality={quality}
      onError={handleError}
      unoptimized={forceUnoptimized || isRemoteAbsolute || hasError}
    />
  )
}
