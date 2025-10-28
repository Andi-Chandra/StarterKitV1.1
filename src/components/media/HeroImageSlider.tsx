'use client'

import { useEffect, useMemo, useState } from 'react'
import Image from 'next/image'

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from '@/components/ui/carousel'
import { cn } from '@/lib/utils'
import type { ImageSlideData } from '@/lib/dataTransform'

type SliderItem = {
  id: string
  src: string
  alt: string
}

const FALLBACK_SLIDES: SliderItem[] = [
  {
    id: 'fallback-1',
    src: '/images/core-value-berakhlak.jpg',
    alt: 'CORE VALUE ASN BerAKHLAK - Poster nilai-nilai pelayanan publik',
  },
  {
    id: 'fallback-2',
    src: '/images/maklumat-pelayanan-1.jpg',
    alt: 'MAKLUMAT PELAYANAN - Komitmen pelayanan standar Kementerian Kelautan dan Perikanan',
  },
  {
    id: 'fallback-3',
    src: '/images/pelayanan-terpadu.jpg',
    alt: 'PELAYANAN TERPADU PPS BELAWAN - Layanan satu atap perikanan',
  },
  {
    id: 'fallback-4',
    src: '/images/maklumat-pelayanan-2.jpg',
    alt: 'MAKLUMAT PELAYANAN - Dokumen komitmen pelayanan Pelabuhan Perikanan Samudera Belawan',
  },
]

interface HeroImageSliderProps {
  slides: ImageSlideData[]
  showArrows?: boolean
  showDots?: boolean
  imageFit?: 'cover' | 'contain'
  heightClass?: string
  ariaLabel?: string
  className?: string
}

export function HeroImageSlider({
  slides,
  showArrows = true,
  showDots = true,
  imageFit = 'contain',
  heightClass = 'h-[40vh] md:h-[50vh] lg:h-[60vh]',
  ariaLabel = 'Hero image slider',
  className,
}: HeroImageSliderProps) {
  const preparedSlides = useMemo<SliderItem[]>(() => {
    const validSlides = slides
      .filter(slide => slide?.imageUrl)
      .map((slide, index) => ({
        id: slide.id ?? `slide-${index}`,
        src: slide.imageUrl,
        alt: slide.title || slide.subtitle || `Slide ${index + 1}`,
      }))

    return validSlides.length > 0 ? validSlides : FALLBACK_SLIDES
  }, [slides])

  const [imageErrors, setImageErrors] = useState<Set<string>>(new Set())
  const [activeIndex, setActiveIndex] = useState(0)
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
    setActiveIndex(0)
    setImageErrors(new Set())
    if (carouselApi) {
      carouselApi.scrollTo(0)
    }
  }, [carouselApi, preparedSlides])

  const handleImageError = (id: string) => {
    setImageErrors(prev => {
      const next = new Set(prev)
      next.add(id)
      return next
    })
  }

  return (
    <div className={cn('relative w-full bg-gray-100', className)}>
      <Carousel
        className="w-full"
        opts={{ loop: true }}
        setApi={setCarouselApi}
        aria-label={ariaLabel}
      >
        <CarouselContent>
          {preparedSlides.map((slide, index) => {
            const hasError = imageErrors.has(slide.id)

            return (
              <CarouselItem key={slide.id}>
                <div
                  className={cn(
                    'relative w-full overflow-hidden bg-gradient-to-br from-gray-50 to-gray-200',
                    heightClass
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
                          {slide.alt}
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
                        {slide.alt}
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
                activeIndex === index ? 'bg-white shadow-lg' : 'bg-white/60'
              )}
            />
          ))}
        </div>
      )}
    </div>
  )
}
