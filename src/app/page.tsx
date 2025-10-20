'use client'

import Link from 'next/link'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { ImageSlider } from '@/components/media/ImageSlider'
import { VideoSlider } from '@/components/media/VideoSlider'
import { Gallery } from '@/components/media/Gallery'
import { Button } from '@/components/ui/button'
import { useSession } from 'next-auth/react'
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
      <div className="relative w-full h-[600px] lg:h-[700px]">
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
      <main>
        {status === 'unauthenticated' && (
          <div className="container py-4 flex justify-end">
            <Button asChild size="sm">
              <Link href="/sign-in">Sign In</Link>
            </Button>
          </div>
        )}
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

        {/* Features Section */}
        <section id="features" className="py-20">
          <div className="container">
            <div className="text-center mb-16">
              <Badge className="mb-4">Features</Badge>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Everything You Need
              </h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Our modern web app comes packed with powerful features to help you succeed.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <Card className="text-center">
                <CardHeader>
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Zap className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle>Lightning Fast</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    Built with performance in mind, our app delivers blazing fast speeds and smooth user experience.
                  </CardDescription>
                </CardContent>
              </Card>

              <Card className="text-center">
                <CardHeader>
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Users className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle>User Friendly</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    Intuitive design and seamless navigation make it easy for anyone to use and enjoy.
                  </CardDescription>
                </CardContent>
              </Card>

              <Card className="text-center">
                <CardHeader>
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Star className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle>Premium Quality</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    Experience the best in class features and design that sets new standards.
                  </CardDescription>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Video Slider Section */}
        {videoSlides.length > 0 && (
          <section id="videos" className="py-20 bg-muted/50">
            <div className="container">
              <div className="text-center mb-16">
                <Badge className="mb-4">Videos</Badge>
                <h2 className="text-3xl md:text-4xl font-bold mb-4">
                  Video Content
                </h2>
                <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                  Watch our video content and learn more about what we do.
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
                <Badge className="mb-4">Gallery</Badge>
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
