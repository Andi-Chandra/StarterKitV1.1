'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { ImageWithFallback } from '@/components/ui/ImageWithFallback'
import { ImageSlider } from '@/components/media/ImageSlider'
import { VideoSlider } from '@/components/media/VideoSlider'
import type { Slider } from '@/hooks/useMedia'
import { 
  Plus, 
  Edit, 
  Trash2, 
  Play,
  Pause,
  Eye,
  Copy as CopyIcon,
  Search,
  BarChart3,
  Image as ImageIcon,
  Video
} from 'lucide-react'

type SortBy = 'newest' | 'oldest' | 'name' | 'items' | 'activeFirst'

export default function AdminSlidersPage() {
  const router = useRouter()
  const { status } = useSession()
  const [sliders, setSliders] = useState<Slider[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [typeFilter, setTypeFilter] = useState<'all' | 'IMAGE' | 'VIDEO'>('all')
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all')
  const [sortBy, setSortBy] = useState<SortBy>('newest')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [previewFor, setPreviewFor] = useState<Slider | null>(null)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/sign-in')
      return
    }
    if (status === 'authenticated') {
      fetchSliders()
    }
  }, [router, status])

  const fetchSliders = async () => {
    try {
      const response = await fetch('/api/sliders')
      if (response.ok) {
        const data = await response.json()
        setSliders(data.sliders || [])
      }
    } catch (error) {
      console.error('Failed to fetch sliders:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const duplicateSlider = async (slider: Slider) => {
    try {
      const response = await fetch('/api/sliders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: `${slider.name} (Copy)`,
          type: slider.type === 'MIXED' ? 'IMAGE' : slider.type, // API supports IMAGE|VIDEO
          isActive: false,
          autoPlay: slider.autoPlay,
          autoPlayInterval: slider.autoPlayInterval,
          loop: slider.loop,
          items: slider.items.map((it, idx) => ({
            title: it.title ?? '',
            subtitle: it.subtitle,
            callToAction: it.callToAction,
            callToActionUrl: it.callToActionUrl,
            mediaId: (it as any).media?.id, // tolerate if media missing
            sortOrder: it.sortOrder ?? idx + 1,
          }))
        })
      })

      if (response.ok) {
        // Re-fetch to ensure we include media in items
        await fetchSliders()
      } else {
        const err = await response.json().catch(() => ({}))
        alert(`Failed to duplicate slider${err?.message ? `: ${err.message}` : ''}`)
      }
    } catch (error) {
      console.error('Failed to duplicate slider:', error)
      alert('Failed to duplicate slider')
    }
  }

  const handleToggleActive = async (id: string, isActive: boolean) => {
    try {
      const response = await fetch(`/api/sliders/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isActive: !isActive })
      })

      if (response.ok) {
        setSliders(prev => prev.map(slider => 
          slider.id === id ? { ...slider, isActive: !isActive } : slider
        ))
      } else {
        alert('Failed to update slider')
      }
    } catch (error) {
      console.error('Failed to update slider:', error)
      alert('Failed to update slider')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this slider?')) return

    try {
      const response = await fetch(`/api/sliders/${id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        setSliders(prev => prev.filter(slider => slider.id !== id))
      } else {
        alert('Failed to delete slider')
      }
    } catch (error) {
      console.error('Failed to delete slider:', error)
      alert('Failed to delete slider')
    }
  }

  const filteredSliders = useMemo(() => {
    let list = [...sliders]
    // Search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      list = list.filter(s => s.name.toLowerCase().includes(q))
    }
    // Type filter
    if (typeFilter !== 'all') {
      list = list.filter(s => s.type === typeFilter)
    }
    // Status filter
    if (statusFilter !== 'all') {
      list = list.filter(s => (statusFilter === 'active' ? s.isActive : !s.isActive))
    }
    // Sorting
    list.sort((a, b) => {
      switch (sortBy) {
        case 'oldest':
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        case 'name':
          return a.name.localeCompare(b.name)
        case 'items':
          return (b.items?.length || 0) - (a.items?.length || 0)
        case 'activeFirst':
          return Number(b.isActive) - Number(a.isActive)
        case 'newest':
        default:
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      }
    })
    return list
  }, [sliders, searchQuery, typeFilter, statusFilter, sortBy])

  if (isLoading) {
    return (
      <div className="min-h-[50vh] bg-background">
        <div className="container py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p>Loading sliders...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-[50vh] bg-background">
      <div className="container py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">Slider Management</h1>
            <p className="text-muted-foreground">Manage your image and video sliders</p>
            {/* Quick stats */}
            <div className="mt-3 flex gap-3 text-sm">
              <span className="text-muted-foreground">Total: {sliders.length}</span>
              <span className="text-muted-foreground">Active: {sliders.filter(s => s.isActive).length}</span>
              <span className="text-muted-foreground">Items: {sliders.reduce((sum, s) => sum + (s.items?.length || 0), 0)}</span>
            </div>
          </div>
          <Button asChild>
            <Link href="/admin/sliders/new">
              <Plus className="h-4 w-4 mr-2" />
              Add Slider
            </Link>
          </Button>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row gap-4 items-stretch lg:items-center">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search sliders..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="flex gap-2 flex-wrap">
                <Select value={typeFilter} onValueChange={(v: any) => setTypeFilter(v)}>
                  <SelectTrigger className="w-[160px]">
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="IMAGE">Image</SelectItem>
                    <SelectItem value="VIDEO">Video</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={statusFilter} onValueChange={(v: any) => setStatusFilter(v)}>
                  <SelectTrigger className="w-[160px]">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={sortBy} onValueChange={(v: any) => setSortBy(v)}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">Newest</SelectItem>
                    <SelectItem value="oldest">Oldest</SelectItem>
                    <SelectItem value="name">Name (A–Z)</SelectItem>
                    <SelectItem value="items">Items (desc)</SelectItem>
                    <SelectItem value="activeFirst">Active first</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Sliders Grid */}
        {filteredSliders.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No sliders found</h3>
              <p className="text-muted-foreground mb-4">
                Get started by creating your first slider
              </p>
              <Button asChild>
                <Link href="/admin/sliders/new">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Slider
                </Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className={viewMode === 'grid' ? 'grid grid-cols-1 lg:grid-cols-2 gap-6' : 'space-y-4'}>
            {filteredSliders.map((slider) => (
              <Card key={slider.id} className="group hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        {slider.type === 'IMAGE' ? (
                          <ImageIcon className="h-5 w-5 text-primary" />
                        ) : (
                          <Video className="h-5 w-5 text-primary" />
                        )}
                      </div>
                      <div>
                        <CardTitle className="text-lg">{slider.name}</CardTitle>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant={slider.isActive ? 'default' : 'secondary'}>
                            {slider.isActive ? 'Active' : 'Inactive'}
                          </Badge>
                          <Badge variant="outline">
                            {slider.type}
                          </Badge>
                          <Badge variant="outline">
                            {slider.items.length} {slider.items.length === 1 ? 'item' : 'items'}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 opacity-100 lg:opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button size="sm" variant="ghost" onClick={() => setPreviewFor(slider)} title="Preview">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => duplicateSlider(slider)} title="Duplicate">
                        <CopyIcon className="h-4 w-4" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="ghost"
                        onClick={() => handleToggleActive(slider.id, slider.isActive)}
                        title={slider.isActive ? 'Deactivate' : 'Activate'}
                      >
                        {slider.isActive ? (
                          <Pause className="h-4 w-4" />
                        ) : (
                          <Play className="h-4 w-4" />
                        )}
                      </Button>
                      <Button size="sm" variant="ghost" asChild title="Edit">
                        <Link href={`/admin/sliders/${slider.id}/edit`}>
                          <Edit className="h-4 w-4" />
                        </Link>
                      </Button>
                      <Button 
                        size="sm" 
                        variant="ghost"
                        onClick={() => handleDelete(slider.id)}
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {/* Inline preview thumbnails */}
                  <div className="mb-4">
                    <div className="flex gap-2 overflow-x-auto py-1">
                      {slider.items.slice(0, 6).map((it) => (
                        <div key={it.id} className="relative h-14 w-20 rounded-md overflow-hidden bg-muted flex-shrink-0">
                          {it.media?.fileType === 'IMAGE' ? (
                            <ImageWithFallback src={it.media.fileUrl} alt={it.title || 'slide'} fill className="object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-black/70">
                              <Video className="h-5 w-5 text-white/80" />
                            </div>
                          )}
                        </div>
                      ))}
                      {slider.items.length === 0 && (
                        <div className="text-sm text-muted-foreground">No items yet</div>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Auto Play</span>
                      <span>{slider.autoPlay ? `${slider.autoPlayInterval}ms` : 'Disabled'}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Loop</span>
                      <span>{slider.loop ? 'Enabled' : 'Disabled'}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Created</span>
                      <span>{new Date(slider.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Preview dialog */}
        <Dialog open={!!previewFor} onOpenChange={() => setPreviewFor(null)}>
          <DialogContent className="max-w-5xl">
            <DialogHeader>
              <DialogTitle>Preview: {previewFor?.name}</DialogTitle>
              <DialogDescription>
                {previewFor?.type === 'IMAGE' ? 'Image slider' : 'Video slider'} preview
              </DialogDescription>
            </DialogHeader>
            <div>
              {previewFor?.type === 'IMAGE' && (
                <ImageSlider
                  slides={previewFor.items.map((it) => ({
                    id: it.id,
                    title: it.title || '',
                    subtitle: it.subtitle,
                    imageUrl: (it as any).media?.fileUrl || '',
                    callToAction: it.callToAction,
                    callToActionUrl: it.callToActionUrl,
                  }))}
                  autoPlay
                  showArrows
                  showDots
                  showPlayPause
                  imageFit="cover"
                />
              )}
              {previewFor?.type === 'VIDEO' && (
                <VideoSlider
                  videos={previewFor.items.map((it) => ({
                    id: it.id,
                    title: it.title || '',
                    subtitle: it.subtitle,
                    videoUrl: (it as any).media?.fileUrl || '',
                    thumbnailUrl: (it as any).media?.fileUrl || '',
                    callToAction: it.callToAction,
                    callToActionUrl: it.callToActionUrl,
                  }))}
                  showArrows
                  showDots
                  showControls
                />
              )}
            </div>
            <DialogFooter>
              <Button variant="secondary" onClick={() => setPreviewFor(null)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
