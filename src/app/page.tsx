'use client'

import Link from 'next/link'
import { useEffect } from 'react'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { ImageSlider } from '@/components/media/ImageSlider'
import { VideoSlider } from '@/components/media/VideoSlider'
import { Gallery } from '@/components/media/Gallery'
import { Button } from '@/components/ui/button'
import { useSession } from '@/components/providers/session-provider'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Play, ArrowRight, Star, Users, Zap } from 'lucide-react'
import { useMedia } from '@/hooks/useMedia'
import { transformImageSliders, transformVideoSliders } from '@/lib/dataTransform'
import { Skeleton } from '@/components/ui/skeleton'

function LoadingSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header Skeleton */}
      <div className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center space-x-2">
            <Skeleton className="h-8 w-8" />
            <Skeleton className="h-6 w-32" />
          </div>
          <div className="flex items-center space-x-2">
            <Skeleton className="h-9 w-20" />
            <Skeleton className="h-9 w-24" />
          </div>
        </div>
      </div>

      {/* Hero Slider Skeleton */}
      <div className="relative w-full aspect-video">
        <Skeleton className="w-full h-full" />
      </div>

      {/* Features Skeleton */}
      <section className="py-20">
        <div className="container">
          <div className="text-center mb-16">
            <Skeleton className="h-6 w-24 mb-4 mx-auto" />
            <Skeleton className="h-10 w-64 mb-4 mx-auto" />
            <Skeleton className="h-6 w-96 mx-auto" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="text-center">
                <CardHeader>
                  <Skeleton className="h-12 w-12 rounded-full mx-auto mb-4" />
                  <Skeleton className="h-6 w-32 mx-auto" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-3/4 mx-auto" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}

function ErrorState({ error, code }: { error: string; code?: string }) {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Something went wrong</h1>
        <p className="text-muted-foreground mb-2">{error}</p>
        {code ? (
          <p className="text-xs text-muted-foreground mb-4">Error code: {code}</p>
        ) : (
          <div className="mb-4" />
        )}
        <Button onClick={() => window.location.reload()}>
          Try Again
        </Button>
      </div>
    </div>
  )
}

export default function Home() {
  const { mediaItems, categories, sliders, navigationLinks, loading, error, errorCode } = useMedia()
  const { status } = useSession()

  // If a Supabase recovery link lands on '/', forward it to the reset page
  useEffect(() => {
    if (typeof window === 'undefined') return
    const hash = window.location.hash || ''
    if (hash.includes('access_token') && !window.location.pathname.includes('/reset-password')) {
      // Preserve the original hash so tokens are not lost
      window.location.href = `/reset-password${hash}`
    }
  }, [])

  if (loading) {
    return <LoadingSkeleton />
  }

  if (error) {
    return <ErrorState error={error} code={errorCode ?? undefined} />
  }

  // Transform data for components
  const imageSlides = transformImageSliders(sliders)
  const videoSlides = transformVideoSliders(sliders)

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <Header navigationLinks={navigationLinks} />

      {/* Main Content */}
      <main id="main">
        {/* Hero Image Slider */}
        <section>
          <ImageSlider 
            slides={imageSlides}
            autoPlay={true}
            autoPlayInterval={5000}
            showArrows={true}
            showDots={true}
          />
        </section>
        {/* Video Slider Section */}
        {videoSlides.length > 0 && (
          <section id="videos" className="py-20 bg-muted/50">
            <div className="container">
              <div className="text-center mb-16">
                <h2 className="text-3xl md:text-4xl font-bold mb-4">
                  Video Content
                </h2>
                <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                  Watch our video content.
                </p>
              </div>

              <VideoSlider 
                videos={videoSlides}
                autoPlay={false}
                showArrows={true}
                showDots={true}
                showControls={true}
              />
            </div>
          </section>
        )}

        {/* Gallery Section */}
        {mediaItems.length > 0 && (
          <section id="gallery" className="py-20">
            <div className="container">
              <div className="text-center mb-16">
                <h2 className="text-3xl md:text-4xl font-bold mb-4">
                  Image Gallery
                </h2>
                <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                  Browse through our collection of stunning images and visuals.
                </p>
              </div>
              <Gallery 
                mediaItems={mediaItems}
                categories={categories}
                showSearch={true}
                showFilters={true}
              />
            </div>
          </section>
        )}

        
      </main>

      {/* Footer */}
      <Footer />
    </div>
  )
}
