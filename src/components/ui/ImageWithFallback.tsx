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
  fallbackSrc = '/logo.svg'
}: ImageWithFallbackProps) {
  const [imgSrc, setImgSrc] = useState(src)
  const [hasError, setHasError] = useState(false)

  const handleError = () => {
    if (!hasError && imgSrc !== fallbackSrc) {
      setImgSrc(fallbackSrc)
      setHasError(true)
    }
  }

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
      unoptimized={hasError}
    />
  )
}