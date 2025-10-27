'use client'

import { useCallback, useEffect, useState, useRef } from 'react'
import useEmblaCarousel from 'embla-carousel-react'
import { ChevronLeft, ChevronRight, Play, Pause, Volume2, VolumeX, Maximize, RefreshCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Slider } from '@/components/ui/slider'
import { ImageWithFallback } from '@/components/ui/ImageWithFallback'
import { cn } from '@/lib/utils'

interface VideoSlideItem {
  id: string
  title: string
  subtitle?: string
  videoUrl: string
  thumbnailUrl: string
  duration?: number
  callToAction?: string
  callToActionUrl?: string
}

interface VideoSliderProps {
  videos: VideoSlideItem[]
  autoPlay?: boolean
  autoPlayInterval?: number
  showArrows?: boolean
  showDots?: boolean
  showControls?: boolean
  className?: string
}

export function VideoSlider({
  videos,
  autoPlay = false,
  autoPlayInterval = 8000,
  showArrows = true,
  showDots = true,
  showControls = true,
  className
}: VideoSliderProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: true,
    align: 'center',
    skipSnaps: false,
  })
  
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [scrollSnaps, setScrollSnaps] = useState<number[]>([])
  const [isPlaying, setIsPlaying] = useState<{ [key: string]: boolean }>({})
  const [isMuted, setIsMuted] = useState<{ [key: string]: boolean }>({})
  const [progress, setProgress] = useState<{ [key: string]: number }>({})
  const [currentTime, setCurrentTime] = useState<{ [key: string]: number }>({})
  const [duration, setDuration] = useState<{ [key: string]: number }>({})
  const [isAutoPlaying, setIsAutoPlaying] = useState(autoPlay)
  
  const videoRefs = useRef<{ [key: string]: HTMLVideoElement }>({})

  const inferMimeType = useCallback((url: string): string => {
    try {
      const cleanUrl = url.split('?')[0]
      const ext = cleanUrl.split('.').pop()?.toLowerCase()
      if (!ext) return 'video/mp4'
      if (ext === 'webm') return 'video/webm'
      if (ext === 'ogg' || ext === 'ogv') return 'video/ogg'
      if (ext === 'm3u8') return 'application/x-mpegURL'
      return 'video/mp4'
    } catch {
      return 'video/mp4'
    }
  }, [])

  const onSelect = useCallback(() => {
    if (!emblaApi) return
    setSelectedIndex(emblaApi.selectedScrollSnap())
    
    // Pause other videos when sliding
    Object.keys(videoRefs.current).forEach((key) => {
      if (key !== videos[emblaApi.selectedScrollSnap()]?.id) {
        const video = videoRefs.current[key]
        if (video && !video.paused) {
          video.pause()
          setIsPlaying(prev => ({ ...prev, [key]: false }))
        }
      }
    })
  }, [emblaApi, videos])

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

  const togglePlayPause = useCallback((videoId: string) => {
    const video = videoRefs.current[videoId]
    if (!video) return

    if (video.paused) {
      const attempt = video.play()
      if (attempt && typeof (attempt as Promise<void>).catch === 'function') {
        (attempt as Promise<void>).catch(() => {
          setIsPlaying(prev => ({ ...prev, [videoId]: false }))
        })
      }
      setIsPlaying(prev => ({ ...prev, [videoId]: true }))
    } else {
      video.pause()
      setIsPlaying(prev => ({ ...prev, [videoId]: false }))
    }
  }, [])

  const toggleMute = useCallback((videoId: string) => {
    const video = videoRefs.current[videoId]
    if (!video) return

    video.muted = !video.muted
    setIsMuted(prev => ({ ...prev, [videoId]: video.muted }))
  }, [])

  const handleSeek = useCallback((videoId: string, value: number[]) => {
    const video = videoRefs.current[videoId]
    if (!video) return

    const newTime = (value[0] / 100) * video.duration
    video.currentTime = newTime
    setProgress(prev => ({ ...prev, [videoId]: value[0] }))
  }, [])

  const handleTimeUpdate = useCallback((videoId: string) => {
    const video = videoRefs.current[videoId]
    if (!video) return

    const currentProgress = (video.currentTime / video.duration) * 100
    setProgress(prev => ({ ...prev, [videoId]: currentProgress }))
    setCurrentTime(prev => ({ ...prev, [videoId]: video.currentTime }))
  }, [])

  const handleLoadedMetadata = useCallback((videoId: string) => {
    const video = videoRefs.current[videoId]
    if (!video) return

    setDuration(prev => ({ ...prev, [videoId]: video.duration }))
  }, [])

  const toggleAutoPlay = useCallback(() => {
    setIsAutoPlaying(!isAutoPlaying)
  }, [isAutoPlaying])

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

  // Auto-play functionality for carousel
  useEffect(() => {
    if (!emblaApi || !isAutoPlaying) return

    const interval = setInterval(() => {
      emblaApi.scrollNext()
    }, autoPlayInterval)

    return () => clearInterval(interval)
  }, [emblaApi, isAutoPlaying, autoPlayInterval])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  if (videos.length === 0) {
    return (
      <div className={cn("relative w-full h-96 bg-muted flex items-center justify-center", className)}>
        <p className="text-muted-foreground">No videos available</p>
      </div>
    )
  }

  return (
    <div className={cn("relative w-full", className)}>
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex">
          {videos.map((video) => (
            <div
              key={video.id}
              className="flex-[0_0_100%] min-w-0 relative"
            >
              <Card className="border-0 rounded-none overflow-hidden">
                <CardContent className="p-0 relative">
                  {/* Video Container */}
                  <div className="relative w-full h-[500px] lg:h-[600px] bg-black">
                    <video
                      ref={(el) => {
                        if (el) videoRefs.current[video.id] = el
                      }}
                      className="w-full h-full object-contain object-center"
                      preload="metadata"
                      playsInline
                      controls={false}
                      crossOrigin="anonymous"
                      muted={isMuted[video.id] ?? true}
                      poster={video.thumbnailUrl}
                      onTimeUpdate={() => handleTimeUpdate(video.id)}
                      onLoadedMetadata={() => handleLoadedMetadata(video.id)}
                      onEnded={() => {
                        const element = videoRefs.current[video.id]
                        if (element) {
                          element.currentTime = 0
                          element.pause()
                        }
                        setIsPlaying(prev => ({ ...prev, [video.id]: false }))
                        setProgress(prev => ({ ...prev, [video.id]: 0 }))
                        setCurrentTime(prev => ({ ...prev, [video.id]: 0 }))
                      }}
                    >
                      <source src={video.videoUrl} type={inferMimeType(video.videoUrl)} />
                      Your browser does not support the video tag.
                    </video>
                    
                    {/* Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/30 to-transparent pointer-events-none" />
                    
                    {/* Content Overlay */}
                    <div className="absolute inset-0 flex items-center pointer-events-none">
                      <div className="container mx-auto px-4">
                        <div className="max-w-2xl text-white">
                          {video.subtitle && (
                            <Badge variant="secondary" className="mb-4">
                              {video.subtitle}
                            </Badge>
                          )}
                          <h2 className="text-3xl md:text-5xl font-bold mb-4 leading-tight">
                            {video.title}
                          </h2>
                          {video.callToAction && (
                            <Button
                              size="lg"
                              className="bg-primary text-primary-foreground hover:bg-primary/90 pointer-events-auto"
                              asChild
                            >
                              <a href={video.callToActionUrl || '#'}>
                                {video.callToAction}
                              </a>
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Tap-to-play overlay */}
                    <button
                      type="button"
                      onClick={() => togglePlayPause(video.id)}
                      className={cn(
                        "absolute inset-0 z-20 flex flex-col items-center justify-center gap-4 transition-opacity duration-300 focus:outline-none",
                        isPlaying[video.id] ? "opacity-0 pointer-events-none" : "opacity-100 pointer-events-auto"
                      )}
                    >
                      <span className="flex items-center gap-3 rounded-full bg-white/90 px-5 py-2 text-sm font-semibold text-black shadow-lg">
                        <Play className="h-4 w-4" />
                        Play video
                      </span>
                      {!video.thumbnailUrl && (
                        <span className="text-xs text-white/80">Tap to start playback</span>
                      )}
                    </button>

                    {/* Video Controls */}
                    {showControls && (
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                        {/* Progress Bar */}
                        <div className="mb-3">
                          <Slider
                            value={[progress[video.id] || 0]}
                            onValueChange={(value) => handleSeek(video.id, value)}
                            max={100}
                            step={0.1}
                            className="w-full"
                          />
                        </div>
                        
                        {/* Controls */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-white hover:text-white/80"
                              onClick={() => togglePlayPause(video.id)}
                            >
                              {isPlaying[video.id] ? (
                                <Pause className="h-4 w-4" />
                              ) : (
                                <Play className="h-4 w-4" />
                              )}
                            </Button>
                            
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-white hover:text-white/80"
                              onClick={() => toggleMute(video.id)}
                            >
                              {isMuted[video.id] ? (
                                <VolumeX className="h-4 w-4" />
                              ) : (
                                <Volume2 className="h-4 w-4" />
                              )}
                            </Button>
                            
                            <span className="text-white text-sm">
                              {formatTime(currentTime[video.id] || 0)} / {formatTime(duration[video.id] || 0)}
                            </span>
                          </div>
                          
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-white hover:text-white/80"
                            onClick={() => videoRefs.current[video.id]?.requestFullscreen()}
                          >
                            <Maximize className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
      </div>

      {/* Navigation Arrows */}
      {showArrows && videos.length > 1 && (
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

      {/* Auto-play Toggle */}
      <Button
        variant="outline"
        size="icon"
        className="absolute bottom-4 left-4 bg-background/80 hover:bg-background border-white/20"
        onClick={toggleAutoPlay}
        title={isAutoPlaying ? 'Pause auto-play' : 'Enable auto-play'}
      >
        {isAutoPlaying ? (
          <Pause className="h-4 w-4" />
        ) : (
          <RefreshCcw className="h-4 w-4" />
        )}
      </Button>

      {/* Dots Indicator */}
      {showDots && videos.length > 1 && (
        <div className="absolute bottom-4 right-4 flex space-x-2">
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
