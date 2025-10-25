'use client'

import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ExternalLink, Maximize2, Minimize2 } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'

export default function VTCKKPPage() {
  const [isFullscreen, setIsFullscreen] = useState(false)

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen)
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <Header navigationLinks={[]} />

      {/* Main Content */}
      <main id="main" className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Iframe Container */}
          <Card className={`${isFullscreen ? 'fixed inset-0 z-50 rounded-none' : 'relative'}`}>
            {/* Info Card */}
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <ExternalLink className="h-5 w-5" />
                    VTC KKP Portal
                  </CardTitle>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={toggleFullscreen}
                  className="gap-2"
                >
                  {isFullscreen ? (
                    <>
                      <Minimize2 className="h-4 w-4" />
                      Exit Fullscreen
                    </>
                  ) : (
                    <>
                      <Maximize2 className="h-4 w-4" />
                      Fullscreen
                    </>
                  )}
                </Button>
              </div>
            </CardHeader>
            <CardContent className={`p-0 ${isFullscreen ? 'h-screen' : 'h-[800px]'}`}>
              <iframe
                src="https://vtc.kkp.go.id"
                className="w-full h-full border-0"
                title="VTC KKP - Virtual Training Center Kementerian Koperasi dan UKM"
                allowFullScreen
                loading="lazy"
                sandbox="allow-same-origin allow-scripts allow-popups allow-forms allow-top-navigation"
              />
            </CardContent>
          </Card>
        </div>
      </main>
      {/* Footer */}
      <Footer />
    </div>
  )
}