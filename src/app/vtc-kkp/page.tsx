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
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Page Header */}
          <div className="text-center mb-8">
            <Badge className="mb-4">External Service</Badge>
            <h1 className="text-3xl md:text-4xl font-bold mb-4">
              VTC KKP
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Akses Virtual Training Center Kementerian Koperasi dan UKM
            </p>
          </div>

          {/* Info Card */}
          <Card className="mb-8">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <ExternalLink className="h-5 w-5" />
                    VTC KKP Portal
                  </CardTitle>
                  <CardDescription>
                    Platform pembelajaran dan pelatihan digital dari Kementerian Koperasi dan UKM
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
            <CardContent>
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  <strong>Informasi:</strong> Halaman ini menampilkan konten eksternal dari website resmi VTC KKP. 
                  Anda dapat mengakses berbagai materi pelatihan, kursus, dan sumber belajar yang disediakan oleh Kementerian Koperasi dan UKM.
                </p>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary">Pelatihan</Badge>
                  <Badge variant="secondary">Kursus</Badge>
                  <Badge variant="secondary">Sumber Belajar</Badge>
                  <Badge variant="secondary">Sertifikasi</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Iframe Container */}
          <Card className={`${isFullscreen ? 'fixed inset-0 z-50 rounded-none' : 'relative'}`}>
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

          {/* Additional Information */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">📚 Materi Pelatihan</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Akses berbagai materi pelatihan berkualitas untuk pengembangan usaha dan kewirausahaan.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">🎓 Kursus Online</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Ikuti kursus online dengan instruktur berpengalaman dari Kementerian Koperasi dan UKM.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">🏆 Sertifikasi</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Dapatkan sertifikasi resmi setelah menyelesaikan program pelatihan yang tersedia.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Help Section */}
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>🤝 Bantuan</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Jika Anda mengalami kesulitan mengakses konten VTC KKP, silakan:
                </p>
                <ul className="text-sm text-muted-foreground space-y-2 list-disc list-inside">
                  <li>Periksa koneksi internet Anda</li>
                  <li>Gunakan browser yang mendukung (Chrome, Firefox, Safari)</li>
                  <li>pastikan JavaScript diaktifkan di browser Anda</li>
                  <li>Hubungi admin VTC KKP untuk bantuan teknis</li>
                </ul>
                <div className="pt-4">
                  <Button variant="outline" asChild>
                    <a 
                      href="https://vtc.kkp.go.id" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="gap-2"
                    >
                      <ExternalLink className="h-4 w-4" />
                      Buka di Tab Baru
                    </a>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  )
}