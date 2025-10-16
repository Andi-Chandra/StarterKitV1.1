'use client'

import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ExternalLink, Maximize2, Minimize2, BarChart3, TrendingUp, Users } from 'lucide-react'
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
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Page Header */}
          <div className="text-center mb-8">
            <Badge className="mb-4">Dashboard</Badge>
            <h1 className="text-3xl md:text-4xl font-bold mb-4">
              Dashboard PNBP Pasca
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Penerimaan Negara Bukan Pajak Pasca Sarjana
            </p>
          </div>

          {/* Info Card */}
          <Card className="mb-8">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Dashboard Analitik PNBP
                  </CardTitle>
                  <CardDescription>
                    Visualisasi data dan analitik Penerimaan Negara Bukan Pajak Pasca Sarjana
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
                  <strong>Informasi:</strong> Dashboard ini menampilkan data visualisasi PNBP Pasca Sarjana 
                  yang diperbarui secara real-time. Anda dapat melihat berbagai metrik, grafik, dan analitik 
                  terkait penerimaan negara bukan pajak dari program pendidikan pasca sarjana.
                </p>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary">Real-time Data</Badge>
                  <Badge variant="secondary">Analytics</Badge>
                  <Badge variant="secondary">Visualisasi</Badge>
                  <Badge variant="secondary">Reporting</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Iframe Container */}
          <Card className={`${isFullscreen ? 'fixed inset-0 z-50 rounded-none' : 'relative'}`}>
            <CardContent className={`p-0 ${isFullscreen ? 'h-screen' : 'h-[600px]'}`}>
              <iframe
                width="100%"
                height="100%"
                src="https://lookerstudio.google.com/embed/reporting/88b64932-17d2-49ff-86b7-6a03f4f4751f/page/Gz38D"
                frameBorder="0"
                style={{ border: 0 }}
                allowFullScreen
                sandbox="allow-storage-access-by-user-activation allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox"
                title="Dashboard PNBP Pasca - Looker Studio"
              />
            </CardContent>
          </Card>

          {/* Key Metrics */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-green-600" />
                  Tren Penerimaan
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Pantau tren penerimaan PNBP dari waktu ke waktu dengan visualisasi grafik yang komprehensif.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-blue-600" />
                  Analitik Mendalam
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Analisis detail penerimaan per program, fakultas, dan periode waktu tertentu.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Users className="h-5 w-5 text-purple-600" />
                  Data Mahasiswa
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Informasi lengkap mengenai kontribusi PNBP dari mahasiswa pasca sarjana.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Features Section */}
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>📊 Fitur Dashboard</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-semibold">Visualisasi Data</h4>
                  <ul className="text-sm text-muted-foreground space-y-2">
                    <li>• Grafik batang dan garis interaktif</li>
                    <li>• Diagram pie untuk distribusi penerimaan</li>
                    <li>• Tabel data dengan filter dan sorting</li>
                    <li>• Peta geografis (jika tersedia)</li>
                  </ul>
                </div>
                <div className="space-y-4">
                  <h4 className="font-semibold">Fitur Analitik</h4>
                  <ul className="text-sm text-muted-foreground space-y-2">
                    <li>• Perbandingan periode waktu</li>
                    <li>• Filter berdasarkan program studi</li>
                    <li>• Export data ke format Excel/PDF</li>
                    <li>• Update data real-time</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Help Section */}
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>🤝 Bantuan & Informasi</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Jika Anda mengalami kesulitan mengakses dashboard PNBP Pasca:
                </p>
                <ul className="text-sm text-muted-foreground space-y-2 list-disc list-inside">
                  <li>Pastikan Anda memiliki izin akses yang tepat</li>
                  <li>Periksa koneksi internet untuk loading data yang optimal</li>
                  <li>Gunakan browser modern (Chrome, Firefox, Safari, Edge)</li>
                  <li>Hubungi admin sistem untuk bantuan teknis</li>
                </ul>
                <div className="pt-4 flex flex-wrap gap-4">
                  <Button variant="outline" asChild>
                    <a 
                      href="https://lookerstudio.google.com/embed/reporting/88b64932-17d2-49ff-86b7-6a03f4f4751f/page/Gz38D" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="gap-2"
                    >
                      <ExternalLink className="h-4 w-4" />
                      Buka di Tab Baru
                    </a>
                  </Button>
                  <Button variant="outline">
                    📧 Hubungi Admin
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