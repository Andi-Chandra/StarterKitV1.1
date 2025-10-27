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
import { Play, ArrowRight, Star, Users, Zap, Video } from 'lucide-react'
import { useMedia } from '@/hooks/useMedia'
import { transformImageSliders, transformVideoSliders } from '@/lib/dataTransform'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import { ImageWithFallback } from '@/components/ui/ImageWithFallback'

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
  const heroSlide = imageSlides[0]
  const secondarySlides = imageSlides.slice(1)

  const highlights = [
    {
      title: 'Curated Experiences',
      description: 'Immersive showcases designed to tell stories that matter.',
      icon: Star,
    },
    {
      title: 'Community First',
      description: 'Resources built with the people we serve at the heart of every feature.',
      icon: Users,
    },
    {
      title: 'Rapid Innovation',
      description: 'Always evolving with modern tooling, real-time content, and fresh insights.',
      icon: Zap,
    },
  ]

  const latestMedia = mediaItems.slice(0, 3)

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <Header navigationLinks={navigationLinks} />

      {/* Main Content */}
      <main id="main" className="relative">
        {/* Highlights Section */}
        <section className="border-b border-border/60 bg-muted/40 py-16">
          <div className="container">
            <div className="mx-auto max-w-4xl text-center">
              <Badge className="mx-auto mb-4 w-fit bg-primary/10 text-primary">Why it matters</Badge>
              <h2 className="text-3xl font-bold">Serving Belawan with clarity and momentum</h2>
              <p className="mt-3 text-muted-foreground">
                We combine storytelling, data, and modern design to highlight the mission of PPS Belawan and the
                communities it supports.
              </p>
            </div>

            <div className="mt-10 grid gap-6 md:grid-cols-3">
              {highlights.map((highlight) => (
                <Card key={highlight.title} className="border border-border/60 shadow-sm transition hover:border-primary/40">
                  <CardHeader className="flex flex-row items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                      <highlight.icon className="h-5 w-5" />
                    </div>
                    <CardTitle className="text-lg">{highlight.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-sm text-muted-foreground">{highlight.description}</CardDescription>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
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

        {/* Latest Media Section */}
        {latestMedia.length > 0 && (
          <section className="border-t border-border/60 bg-muted/30 py-20">
            <div className="container">
              <div className="mx-auto mb-10 flex w-full max-w-4xl flex-col gap-3 text-center">
                <Badge className="mx-auto w-fit bg-primary/10 text-primary">Fresh from the library</Badge>
                <h2 className="text-3xl font-bold">Recently Added Highlights</h2>
                <p className="text-muted-foreground">
                  The newest imagery and clips added to the archive—curated for press, stakeholders, and the public.
                </p>
              </div>

              <div className="grid gap-6 md:grid-cols-3">
                {latestMedia.map((item) => (
                  <Card key={item.id} className="h-full overflow-hidden border border-border/60 shadow-sm">
                    <div className="relative aspect-[4/3] bg-muted">
                      {item.fileType === 'IMAGE' ? (
                        <ImageWithFallback src={item.fileUrl} alt={item.title} fill className="object-cover" />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-muted">
                          <Video className="h-8 w-8 text-muted-foreground" />
                        </div>
                      )}
                      <Badge className="absolute top-3 left-3 bg-primary text-primary-foreground">
                        {item.fileType === 'IMAGE' ? 'Image' : 'Video'}
                      </Badge>
                    </div>
                    <CardHeader className="space-y-2">
                      <CardTitle className="text-lg line-clamp-1">{item.title}</CardTitle>
                      {item.category && (
                        <Badge variant="outline" className="w-fit text-xs">
                          {item.category.name}
                        </Badge>
                      )}
                    </CardHeader>
                    <CardContent>
                      {item.description ? (
                        <p className="text-sm text-muted-foreground line-clamp-3">{item.description}</p>
                      ) : (
                        <p className="text-sm text-muted-foreground">Added on {new Date(item.createdAt).toLocaleDateString()}</p>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="mt-12 flex justify-center">
                <Button asChild size="lg" variant="outline" className="gap-2">
                  <Link href="#gallery">
                    Browse the full library
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>
          </section>
        )}

        {/* CTA */}
        <section className="relative overflow-hidden border-y border-border/60 bg-gradient-to-br from-primary/10 via-background to-background">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.2),_transparent_60%)]" />
          <div className="container relative py-16">
            <div className="mx-auto flex max-w-4xl flex-col gap-6 text-center">
              <Badge className="mx-auto w-fit bg-primary text-primary-foreground">Get involved</Badge>
              <h2 className="text-3xl font-bold">Partner with PPS Belawan</h2>
              <p className="text-muted-foreground">
                Collaborate on new initiatives, share insights, or request access to tailored media kits. We’re here to amplify the work happening across Belawan.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Button asChild size="lg" className="gap-2">
                  <Link href="/contact">
                    Talk to our team
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button variant="outline" size="lg" asChild>
                  <Link href="#videos">View impact stories</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  )
}
