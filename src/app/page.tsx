'use client'

import Link from 'next/link'
import { useEffect } from 'react'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { HeroImageSlider } from '@/components/media/HeroImageSlider'
import { VideoSlider } from '@/components/media/VideoSlider'
import { Gallery } from '@/components/media/Gallery'
import { Button } from '@/components/ui/button'
import { useSession } from '@/components/providers/session-provider'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ArrowRight, Star, Users, Zap, Video } from 'lucide-react'
import { useMedia } from '@/hooks/useMedia'
import { transformImageSliders, transformVideoSliders } from '@/lib/dataTransform'
import { Skeleton } from '@/components/ui/skeleton'
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

  const stats = [
    { value: '35+', label: 'Community partners engaged' },
    { value: '12K', label: 'Monthly visitors across platforms' },
    { value: '1.2K', label: 'Curated images and video assets' },
  ]

  const latestMedia = mediaItems.slice(0, 3)

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <Header navigationLinks={navigationLinks} />

      {/* Main Content */}
      <main id="main" className="relative space-y-24">
        {/* Hero Image Slider */}
        {imageSlides.length > 0 && (
          <HeroImageSlider
            slides={imageSlides}
            className="relative overflow-hidden border-none bg-gradient-to-br from-background via-primary/10 to-background pb-24 pt-20"
            heightClass="ah-[45vh] md:h-[55vh] lg:h-[65vh]"
          />
        )}

        {/* Highlights Section */}
        <section className="relative overflow-hidden border-b border-border/60 bg-gradient-to-br from-background via-muted/40 to-background py-24">
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" aria-hidden="true" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.12),_transparent_60%)]" aria-hidden="true" />
          <div className="container relative">
            <div className="mx-auto max-w-5xl text-center">
              <Badge className="mx-auto mb-4 w-fit bg-primary/10 text-primary">Why it matters</Badge>
              <h2 className="text-3xl font-bold md:text-4xl">Serving Belawan with clarity and momentum</h2>
              <p className="mt-4 text-lg text-muted-foreground">
                We combine storytelling, data, and modern design to highlight the mission of PPS Belawan and the communities it supports.
              </p>
            </div>

            <div className="mt-10 grid gap-4 sm:grid-cols-3">
              {stats.map((stat) => (
                <div key={stat.label} className="rounded-2xl border border-border/60 bg-background/80 p-6 text-center shadow-sm backdrop-blur transition hover:-translate-y-1 hover:border-primary/50 hover:shadow-lg">
                  <p className="text-3xl font-semibold text-primary">{stat.value}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{stat.label}</p>
                </div>
              ))}
            </div>

            <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {highlights.map((highlight) => (
                <Card
                  key={highlight.title}
                  className="group relative overflow-hidden border border-border/60 bg-background/80 shadow-sm backdrop-blur transition hover:-translate-y-1 hover:border-primary/50 hover:shadow-lg"
                >
                  <div className="absolute inset-x-0 top-0 h-1 opacity-60 transition-opacity duration-500 group-hover:opacity-100">
                    <div className="h-full w-full bg-gradient-to-r from-primary/70 via-primary/20 to-transparent" />
                  </div>
                  <CardHeader className="flex flex-row items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary ring-1 ring-primary/20 transition group-hover:bg-primary group-hover:text-primary-foreground">
                      <highlight.icon className="h-5 w-5" />
                    </div>
                    <CardTitle className="text-lg">{highlight.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-sm text-muted-foreground">
                      {highlight.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Video Slider Section */}
        {videoSlides.length > 0 && (
          <section id="videos" className="relative overflow-hidden border-y border-border/60 bg-gradient-to-b from-background via-background to-muted/40 py-24">
            <div className="absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-primary/10 to-transparent" aria-hidden="true" />
            <div className="absolute inset-x-16 top-10 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" aria-hidden="true" />
            <div className="container relative">
              <div className="mx-auto mb-12 flex max-w-3xl flex-col gap-4 text-center">
                <Badge className="mx-auto w-fit bg-primary/10 text-primary">Impact stories</Badge>
                <h2 className="text-3xl font-bold md:text-4xl">
                  Stories in motion
                </h2>
                <p className="text-lg text-muted-foreground">
                  Explore short-form narratives capturing operations, innovation, and community impact across the harbour.
                </p>
              </div>

              <div className="rounded-3xl border border-border/60 bg-background/90 p-4 shadow-xl backdrop-blur">
                <VideoSlider
                  videos={videoSlides}
                  autoPlay={false}
                  showArrows={true}
                  showDots={true}
                  showControls={true}
                />
              </div>
            </div>
          </section>
        )}

        {/* Gallery Section */}
        {mediaItems.length > 0 && (
          <section id="gallery" className="relative overflow-hidden py-24">
            <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-muted/40 via-transparent to-transparent" aria-hidden="true" />
            <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-muted/40 via-transparent to-transparent" aria-hidden="true" />
            <div className="container relative">
              <div className="mx-auto mb-12 flex max-w-3xl flex-col gap-4 text-center">
                <Badge className="mx-auto w-fit bg-primary/10 text-primary">Media atlas</Badge>
                <h2 className="text-3xl font-bold md:text-4xl">
                  Image gallery
                </h2>
                <p className="text-lg text-muted-foreground">
                  Browse a curated archive of visuals ready for press, partners, and community storytellers.
                </p>
              </div>
              <div className="rounded-3xl border border-border/60 bg-background/80 p-6 shadow-sm backdrop-blur">
                <Gallery
                  mediaItems={mediaItems}
                  categories={categories}
                  showSearch={true}
                  showFilters={true}
                />
              </div>
            </div>
          </section>
        )}

        {/* Latest Media Section */}
        {latestMedia.length > 0 && (
          <section className="relative overflow-hidden border-y border-border/60 bg-gradient-to-br from-background via-muted/30 to-background py-24">
            <div className="absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-primary/10 to-transparent" aria-hidden="true" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom,_rgba(59,130,246,0.12),_transparent_55%)]" aria-hidden="true" />
            <div className="container relative">
              <div className="mx-auto mb-12 flex w-full max-w-4xl flex-col gap-3 text-center">
                <Badge className="mx-auto w-fit bg-primary/10 text-primary">Fresh from the library</Badge>
                <h2 className="text-3xl font-bold md:text-4xl">Recently Added Highlights</h2>
                <p className="text-muted-foreground">
                  The newest imagery and clips added to the archive, curated for press, stakeholders, and the public.
                </p>
              </div>

              <div className="grid gap-6 md:grid-cols-3">
                {latestMedia.map((item) => (
                  <Card
                    key={item.id}
                    className="group h-full overflow-hidden rounded-2xl border border-border/60 bg-background/80 shadow-sm transition hover:-translate-y-1 hover:border-primary/50 hover:shadow-lg"
                  >
                    <div className="relative aspect-[4/3] overflow-hidden bg-muted">
                      {item.fileType === 'IMAGE' ? (
                        <ImageWithFallback
                          src={item.fileUrl}
                          alt={item.title}
                          fill
                          className="object-cover transition duration-700 group-hover:scale-105"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-muted via-muted/70 to-background text-muted-foreground transition group-hover:text-primary">
                          <Video className="h-8 w-8" />
                        </div>
                      )}
                      <Badge className="absolute top-3 left-3 bg-primary text-primary-foreground shadow">
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
        <section className="relative overflow-hidden border-y border-border/60 bg-gradient-to-br from-primary/15 via-background to-background py-24">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.22),_transparent_65%)]" aria-hidden="true" />
          <div className="absolute -left-24 top-1/2 h-64 w-64 -translate-y-1/2 rounded-full bg-primary/10 blur-3xl" aria-hidden="true" />
          <div className="absolute -right-24 top-1/3 h-64 w-64 rounded-full bg-primary/10 blur-3xl" aria-hidden="true" />
          <div className="container relative">
            <div className="mx-auto flex max-w-4xl flex-col gap-6 text-center">
              <Badge className="mx-auto w-fit bg-primary text-primary-foreground">Get involved</Badge>
              <h2 className="text-3xl font-bold md:text-4xl">Partner with PPS Belawan</h2>
              <p className="text-lg text-muted-foreground">
                Collaborate on initiatives, share insights, or request tailored media kits. We're here to amplify the work happening across Belawan.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Button asChild size="lg" className="gap-2">
                  <Link href="/contact">
                    Talk to our team
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button variant="outline" size="lg" asChild className="gap-2">
                  <Link href="#videos">
                    <Video className="h-4 w-4" />
                    View impact stories
                  </Link>
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
