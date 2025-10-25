'use client'

import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Maximize2, Minimize2, BarChart3} from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'

export default function DashboardPNBPPascaPage() {
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
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Dashboard Analitik PNBP
                  </CardTitle>
                  <CardDescription>
                    Visualisasi data dan analitik Penerimaan Negara Bukan Pajak Pasca Produksi
                  </CardDescription>
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
            <CardContent className={`p-0 ${isFullscreen ? 'h-screen' : 'h-[600px]'}`}>
              <iframe
                width="100%"
                height="100%"
                src="https://lookerstudio.google.com/embed/reporting/88b64932-17d2-49ff-86b7-6a03f4f4751f/page/Gz38D"
                frameBorder="0"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                sandbox="allow-storage-access-by-user-activation allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox"
                title="Dashboard PNBP Pasca - Looker Studio"
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
