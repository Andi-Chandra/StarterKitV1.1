'use client'

import { useCallback, useEffect, useState } from 'react'
import useEmblaCarousel from 'embla-carousel-react'
import { ChevronLeft, ChevronRight, Play, Pause } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ImageWithFallback } from '@/components/ui/ImageWithFallback'
import { cn } from '@/lib/utils'

interface SlideItem {
  id: string
  title: string
  subtitle?: string
  imageUrl: string
  callToAction?: string
  callToActionUrl?: string
}

interface ImageSliderProps {
  slides: SlideItem[]
  autoPlay?: boolean
  autoPlayInterval?: number
  showArrows?: boolean
  showDots?: boolean
  showPlayPause?: boolean
  className?: string
}

export function ImageSlider({
  slides,
  autoPlay = true,
  autoPlayInterval = 5000,
  showArrows = true,
  showDots = true,
  showPlayPause = false,
  className
}: ImageSliderProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: true,
    align: 'center',
    skipSnaps: false,
  })
  
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [scrollSnaps, setScrollSnaps] = useState<number[]>([])
  const [isPlaying, setIsPlaying] = useState(autoPlay)

  const onSelect = useCallback(() => {
    if (!emblaApi) return
    setSelectedIndex(emblaApi.selectedScrollSnap())
  }, [emblaApi])

  const onInit = useCallback((emblaApi: any) => {
    setScrollSnaps(emblaApi.scrollSnapList())
  }, [])

  const scrollPrev = useCallback(() => {
    emblaApi?.scrollPrev()
  }, [emblaApi])

  const scrollNext = useCallback(() => {
    emblaApi?.scrollNext()
  }, [emblaApi])

  const scrollTo = useCallback((index: number) => {
    emblaApi?.scrollTo(index)
  }, [emblaApi])

  const togglePlayPause = useCallback(() => {
    setIsPlaying(!isPlaying)
  }, [isPlaying])

  useEffect(() => {
    if (!emblaApi) return

    onSelect()
    onInit(emblaApi)
    emblaApi.on('select', onSelect)
    emblaApi.on('init', onInit)

    return () => {
      emblaApi.off('select', onSelect)
      emblaApi.off('init', onInit)
    }
  }, [emblaApi, onSelect, onInit])

  // Auto-play functionality
  useEffect(() => {
    if (!emblaApi || !isPlaying) return

    const interval = setInterval(() => {
      emblaApi.scrollNext()
    }, autoPlayInterval)

    return () => clearInterval(interval)
  }, [emblaApi, isPlaying, autoPlayInterval])

  if (slides.length === 0) {
    return (
      <div className={cn("relative w-full h-96 bg-muted flex items-center justify-center", className)}>
        <p className="text-muted-foreground">No slides available</p>
      </div>
    )
  }

  return (
    <div className={cn("relative w-full", className)}>
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex">
          {slides.map((slide, index) => (
            <div
              key={slide.id}
              className="flex-[0_0_100%] min-w-0 relative"
            >
              <Card className="border-0 rounded-none overflow-hidden">
                <CardContent className="p-0 relative">
                  {/* Background Image */}
                  <div className="relative w-full h-[600px] lg:h-[700px]">
                    <ImageWithFallback
                      src={slide.imageUrl}
                      alt={slide.title}
                      fill
                      className="object-cover"
                      priority={index === 0}
                    />
                    
                    {/* Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/30 to-transparent" />
                    
                    {/* Content */}
                    <div className="absolute inset-0 flex items-center">
                      <div className="container mx-auto px-4">
                        <div className="max-w-2xl text-white">
                          {slide.subtitle && (
                            <Badge variant="secondary" className="mb-4">
                              {slide.subtitle}
                            </Badge>
                          )}
                          <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
                            {slide.title}
                          </h1>
                          {slide.callToAction && (
                            <Button
                              size="lg"
                              className="bg-primary text-primary-foreground hover:bg-primary/90"
                              asChild
                            >
                              <a href={slide.callToActionUrl || '#'}>
                                {slide.callToAction}
                              </a>
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
      </div>

      {/* Navigation Arrows */}
      {showArrows && slides.length > 1 && (
        <>
          <Button
            variant="outline"
            size="icon"
            className="absolute left-4 top-1/2 -translate-y-1/2 bg-background/80 hover:bg-background border-white/20"
            onClick={scrollPrev}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="absolute right-4 top-1/2 -translate-y-1/2 bg-background/80 hover:bg-background border-white/20"
            onClick={scrollNext}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </>
      )}

      {/* Play/Pause Button */}
      {showPlayPause && slides.length > 1 && (
        <Button
          variant="outline"
          size="icon"
          className="absolute bottom-4 right-4 bg-background/80 hover:bg-background border-white/20"
          onClick={togglePlayPause}
        >
          {isPlaying ? (
            <Pause className="h-4 w-4" />
          ) : (
            <Play className="h-4 w-4" />
          )}
        </Button>
      )}

      {/* Dots Indicator */}
      {showDots && slides.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
          {scrollSnaps.map((_, index) => (
            <button
              key={index}
              className={cn(
                "w-2 h-2 rounded-full transition-all duration-300",
                selectedIndex === index
                  ? "w-8 bg-white"
                  : "bg-white/50 hover:bg-white/75"
              )}
              onClick={() => scrollTo(index)}
            />
          ))}
        </div>
      )}
    </div>
  )
}