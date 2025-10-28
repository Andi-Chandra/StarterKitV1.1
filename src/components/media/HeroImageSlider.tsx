'use client'

import { type ComponentType, useEffect, useMemo, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, Play } from 'lucide-react'

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from '@/components/ui/carousel'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { ImageSlideData } from '@/lib/dataTransform'

type SliderItem = {
  id: string
  src: string
  alt: string
  caption: string
}

const FALLBACK_SLIDES: SliderItem[] = [
  {
    id: 'fallback-1',
    src: 'https://images.unsplash.com/photo-1489515217757-5fd1be406fef?w=1920&h=1080&fit=crop',
    alt: 'Pemandangan pegunungan saat matahari terbit',
    caption: 'Pemandangan pegunungan saat matahari terbit',
  },
  {
    id: 'fallback-2',
    src: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=1920&h=1080&fit=crop',
    alt: 'Wanita di tengah hutan pinus',
    caption: 'Wanita di tengah hutan pinus',
  },
  {
    id: 'fallback-3',
    src: 'https://images.unsplash.com/photo-1460353581641-37baddab0fa2?w=1920&h=1080&fit=crop',
    alt: 'Gedung pencakar langit di perkotaan',
    caption: 'Gedung pencakar langit di perkotaan',
  },
  {
    id: 'fallback-4',
    src: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=1920&h=1080&fit=crop',
    alt: 'Pria dengan jaket kulit di jalanan kota',
    caption: 'Pria dengan jaket kulit di jalanan kota',
  },
]

interface HeroImageSliderProps {
  slides: ImageSlideData[]
  autoPlay?: boolean
  autoPlayInterval?: number
  showArrows?: boolean
  showDots?: boolean
  pauseOnHover?: boolean
  pauseOnFocus?: boolean
  imageFit?: 'cover' | 'contain'
  heightClass?: string
  ariaLabel?: string
  eyebrow?: string
  heading: string
  description?: string
  primaryCta?: {
    label: string
    href: string
    icon?: ComponentType<{ className?: string }>
  }
  secondaryCta?: {
    label: string
    href: string
    icon?: ComponentType<{ className?: string }>
    variant?: 'outline' | 'ghost'
  }
  className?: string
  contentAlignment?: 'left' | 'center'
}

export function HeroImageSlider({
  slides,
  autoPlay = true,
  autoPlayInterval = 5000,
  showArrows = true,
  showDots = true,
  pauseOnHover = true,
  pauseOnFocus = true,
  imageFit = 'contain',
  heightClass = 'h-[60vh] md:h-[80vh]',
  ariaLabel = 'Hero image slider',
  eyebrow,
  heading,
  description,
  primaryCta = {
    label: 'Browse the media library',
    href: '#gallery',
    icon: ArrowRight,
  },
  secondaryCta = {
    label: 'Watch impact stories',
    href: '#videos',
    icon: Play,
    variant: 'outline',
  },
  className,
  contentAlignment = 'left',
}: HeroImageSliderProps) {
  const PrimaryIcon = primaryCta?.icon
  const SecondaryIcon = secondaryCta?.icon

  const preparedSlides = useMemo<SliderItem[]>(() => {
    const validSlides = slides
      .filter((slide) => slide?.imageUrl)
      .map((slide, index) => ({
        id: slide.id ?? `slide-${index}`,
        src: slide.imageUrl,
        alt: slide.title || slide.subtitle || `Slide ${index + 1}`,
        caption: slide.subtitle || slide.title || `Slide ${index + 1}`,
      }))

    return validSlides.length > 0 ? validSlides : FALLBACK_SLIDES
  }, [slides])

  const [imageErrors, setImageErrors] = useState<Set<string>>(new Set())
  const [activeIndex, setActiveIndex] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const [carouselApi, setCarouselApi] = useState<CarouselApi>()

  useEffect(() => {
    if (!carouselApi) return

    const handleSelect = () => setActiveIndex(carouselApi.selectedScrollSnap())

    carouselApi.on('select', handleSelect)
    carouselApi.on('reInit', handleSelect)
    handleSelect()

    return () => {
      carouselApi.off('select', handleSelect)
      carouselApi.off('reInit', handleSelect)
    }
  }, [carouselApi])

  useEffect(() => {
    if (!carouselApi) return

    setActiveIndex(0)
    setImageErrors(new Set())
    carouselApi.scrollTo(0)
  }, [carouselApi, preparedSlides])

  useEffect(() => {
    if (!carouselApi || !autoPlay || isPaused || preparedSlides.length <= 1) return

    const id = setInterval(() => {
      carouselApi.scrollNext()
    }, autoPlayInterval)

    return () => clearInterval(id)
  }, [carouselApi, autoPlay, autoPlayInterval, isPaused, preparedSlides.length])

  const handleImageError = (id: string) => {
    setImageErrors((prev) => {
      const next = new Set(prev)
      next.add(id)
      return next
    })
  }

  const handleMouseEnter = () => {
    if (pauseOnHover) {
      setIsPaused(true)
    }
  }

  const handleMouseLeave = () => {
    if (pauseOnHover) {
      setIsPaused(false)
    }
  }

  const handleFocus = () => {
    if (pauseOnFocus) {
      setIsPaused(true)
    }
  }

  const handleBlur = () => {
    if (pauseOnFocus) {
      setIsPaused(false)
    }
  }

  return (
    <section className={cn('border-b border-border/60 bg-background py-16', className)}>
      <div
        className={cn(
          'container grid gap-12 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:items-center',
          contentAlignment === 'center' ? 'text-center lg:text-left' : ''
        )}
      >
        <div
          className={cn(
            'flex flex-col items-center gap-6',
            contentAlignment === 'left'
              ? 'text-left lg:items-start'
              : 'text-center lg:items-start lg:text-left'
          )}
        >
          {eyebrow && (
            <Badge className="w-fit bg-primary/10 text-primary">
              {eyebrow}
            </Badge>
          )}
          <div className="space-y-4">
            <h1 className="text-3xl font-bold md:text-5xl">
              {heading}
            </h1>
            {description && (
              <p className="text-lg text-muted-foreground">
                {description}
              </p>
            )}
          </div>
          <div className="flex flex-wrap justify-center gap-4 lg:justify-start">
            {primaryCta && (
              <Button asChild size="lg" className="gap-2">
                <Link href={primaryCta.href}>
                  {primaryCta.label}
                  {PrimaryIcon && <PrimaryIcon className="h-4 w-4" />}
                </Link>
              </Button>
            )}
            {secondaryCta && (
              <Button
                variant={secondaryCta.variant ?? 'outline'}
                size="lg"
                asChild
                className="gap-2"
              >
                <Link href={secondaryCta.href}>
                  {SecondaryIcon && <SecondaryIcon className="h-4 w-4" />}
                  {secondaryCta.label}
                </Link>
              </Button>
            )}
          </div>
        </div>

        <div className="relative mx-auto w-full max-w-[1920px] lg:mx-0">
          <div
            className="relative w-full overflow-hidden rounded-3xl border border-border/60 bg-gradient-to-br from-gray-50 to-gray-200 shadow-xl"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            onFocusCapture={handleFocus}
            onBlurCapture={handleBlur}
          >
            <Carousel
              className="relative w-full"
              opts={{ loop: true }}
              setApi={setCarouselApi}
              aria-label={ariaLabel}
            >
              <CarouselContent>
                {preparedSlides.map((slide, index) => {
                  const hasError = imageErrors.has(slide.id)

                  return (
                    <CarouselItem key={slide.id}>
                      <div className={cn(
                        'relative w-full overflow-hidden',
                        heightClass,
                        'bg-gradient-to-br from-gray-50 to-gray-200'
                      )}
                      >
                        {!hasError ? (
                          <>
                            <div
                              className="absolute inset-0 z-0 scale-110 bg-cover bg-center filter blur-xl"
                              style={{ backgroundImage: `url(${slide.src})` }}
                            />

                            <Image
                              src={slide.src}
                              alt={slide.alt}
                              fill
                              sizes="100vw"
                              priority={index === 0}
                              className={cn(
                                'relative z-10 object-center',
                                imageFit === 'cover' ? 'object-cover' : 'object-contain'
                              )}
                              onError={() => handleImageError(slide.id)}
                            />

                            <div className="absolute inset-0 z-20 bg-gradient-to-t from-black/10 via-transparent to-transparent" />
                          </>
                        ) : (
                          <div className="absolute inset-0 z-0 flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
                            <div className="p-8 text-center">
                              <div className="mx-auto mb-4 flex h-24 w-24 items-center justify-center rounded-lg bg-gray-300">
                                <svg
                                  className="h-12 w-12 text-gray-500"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                                  />
                                </svg>
                              </div>
                              <p className="max-w-md text-sm text-gray-600">
                                {slide.caption}
                              </p>
                              <p className="mt-2 text-xs text-gray-400">
                                Gambar tidak tersedia
                              </p>
                            </div>
                          </div>
                        )}

                        <div className="absolute bottom-4 left-4 right-4 z-30">
                          <div className="max-w-md rounded-lg bg-white/90 p-3 backdrop-blur-sm">
                            <p className="text-sm font-medium text-gray-800">
                              {slide.caption}
                            </p>
                          </div>
                        </div>
                      </div>
                    </CarouselItem>
                  )
                })}
              </CarouselContent>

              {showArrows && preparedSlides.length > 1 && (
                <>
                  <CarouselPrevious className="absolute left-4 top-1/2 z-40 -translate-y-1/2 bg-white/80 text-gray-800 shadow-lg hover:bg-white" />
                  <CarouselNext className="absolute right-4 top-1/2 z-40 -translate-y-1/2 bg-white/80 text-gray-800 shadow-lg hover:bg-white" />
                </>
              )}
            </Carousel>

            {showDots && preparedSlides.length > 1 && (
              <div className="absolute bottom-4 left-1/2 z-40 flex -translate-x-1/2 gap-2">
                {preparedSlides.map((_, index) => (
                  <div
                    key={index}
                    className={cn(
                      'h-2 w-2 rounded-full transition-all',
                      activeIndex === index
                        ? 'bg-white shadow-lg'
                        : 'bg-white/60'
                    )}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
