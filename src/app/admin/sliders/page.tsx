'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth, useSession } from '@/components/providers/session-provider'
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
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { ImageSlider } from '@/components/media/ImageSlider'
import { VideoSlider } from '@/components/media/VideoSlider'
import type { Slider } from '@/hooks/useMedia'
import {
  BarChart3,
  Image as ImageIcon,
  Filter,
  Play,
  Pause,
  Copy as CopyIcon,
  Search,
  Grid,
  List,
  Plus,
  Edit,
  Trash2,
  Eye,
  Video,
} from 'lucide-react'
import { ButtonProps } from '@/components/ui/button'
import { ImageWithFallback } from '@/components/ui/ImageWithFallback'
import { cn } from '@/lib/utils'

type SortBy = 'newest' | 'oldest' | 'name' | 'items' | 'activeFirst'

export default function AdminSlidersPage() {
  const router = useRouter()
  const { status } = useSession()
  const { accessToken } = useAuth()

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
      if (!accessToken) {
        alert('Authentication required. Please sign in again.')
        return
      }
      const response = await fetch('/api/sliders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          name: `${slider.name} (Copy)`,
          type: slider.type === 'MIXED' ? 'IMAGE' : slider.type,
          isActive: false,
          autoPlay: slider.autoPlay,
          autoPlayInterval: slider.autoPlayInterval,
          loop: slider.loop,
          items: slider.items.map((it, idx) => ({
            title: it.title ?? '',
            subtitle: it.subtitle,
            callToAction: it.callToAction,
            callToActionUrl: it.callToActionUrl,
            mediaId: (it as any).media?.id,
            sortOrder: it.sortOrder ?? idx + 1,
          })),
        }),
      })

      if (response.ok) {
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
      if (!accessToken) {
        alert('Authentication required. Please sign in again.')
        return
      }
      const response = await fetch(`/api/sliders/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ isActive: !isActive }),
      })

      if (response.ok) {
        await fetchSliders()
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
      if (!accessToken) {
        alert('Authentication required. Please sign in again.')
        return
      }
      const response = await fetch(`/api/sliders/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      })

      if (response.ok) {
        await fetchSliders()
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
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      list = list.filter((s) => s.name.toLowerCase().includes(q))
    }
    if (typeFilter !== 'all') {
      list = list.filter((s) => s.type === typeFilter)
    }
    if (statusFilter !== 'all') {
      list = list.filter((s) => (statusFilter === 'active' ? s.isActive : !s.isActive))
    }
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
            <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-b-2 border-primary" />
            <p>Loading sliders...</p>
          </div>
        </div>
      </div>
    )
  }

  const totalSliders = sliders.length
  const activeCount = sliders.filter((s) => s.isActive).length
  const imageCount = sliders.filter((s) => s.type === 'IMAGE').length
  const videoCount = sliders.filter((s) => s.type === 'VIDEO').length
  const totalItems = sliders.reduce((sum, s) => sum + (s.items?.length || 0), 0)

  return (
    <div className="space-y-8">
      <Card className="relative overflow-hidden border-none bg-gradient-to-br from-primary/15 via-primary/10 to-transparent shadow-sm">
        <div className="absolute inset-y-0 right-0 w-1/2 bg-[radial-gradient(circle_at_top,_theme(colors.primary/20),_transparent_70%)]" />
        <CardHeader className="relative flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="space-y-2">
            <Badge className="w-fit bg-primary/20 text-primary">Sliders</Badge>
            <CardTitle className="text-2xl font-semibold md:text-3xl">Slider Management</CardTitle>
            <CardDescription className="max-w-xl text-base text-muted-foreground">
              Curate image and video sliders that power hero sections, galleries, and storytelling moments.
            </CardDescription>
          </div>
          <Button asChild size="lg" className="shadow-md">
            <Link href="/admin/sliders/new">
              <Plus className="mr-2 h-4 w-4" />
              Add Slider
            </Link>
          </Button>
        </CardHeader>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: 'Total sliders', value: totalSliders, meta: 'All types', icon: BarChart3 },
          { label: 'Active', value: activeCount, meta: 'Visible in production', icon: Play },
          { label: 'Image sliders', value: imageCount, meta: 'Hero/gallery experiences', icon: ImageIcon },
          { label: 'Video sliders', value: videoCount, meta: 'Motion-first sections', icon: Video },
        ].map((item) => (
          <Card key={item.label} className="border border-border/60 shadow-sm transition hover:border-primary/40">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{item.label}</CardTitle>
              <item.icon className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-semibold tracking-tight">{item.value}</div>
              <p className="text-xs text-muted-foreground">{item.meta}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border border-border/60 shadow-sm">
        <CardHeader className="gap-6">
          <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_auto] md:items-center">
            <div className="grid gap-3 sm:grid-cols-2 sm:items-center">
              <div className="flex items-center gap-3 rounded-xl border border-dashed border-border/60 bg-background/80 px-4 py-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <BarChart3 className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">Total items</p>
                  <p className="text-sm font-medium text-foreground">{totalItems}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-xl border border-dashed border-border/60 bg-background/80 px-4 py-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Filter className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">Filters</p>
                  <p className="text-sm font-medium text-foreground">
                    {typeFilter !== 'all' || statusFilter !== 'all' ? 'Active filters applied' : 'All sliders'}
                  </p>
                </div>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative w-full min-w-[220px] flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search sliders..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={typeFilter} onValueChange={(value: 'all' | 'IMAGE' | 'VIDEO') => setTypeFilter(value)}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All types</SelectItem>
                  <SelectItem value="IMAGE">Image sliders</SelectItem>
                  <SelectItem value="VIDEO">Video sliders</SelectItem>
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={(value: 'all' | 'active' | 'inactive') => setStatusFilter(value)}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All statuses</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
              <Select value={sortBy} onValueChange={(value: SortBy) => setSortBy(value)}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest first</SelectItem>
                  <SelectItem value="oldest">Oldest first</SelectItem>
                  <SelectItem value="name">Name</SelectItem>
                  <SelectItem value="items">Most items</SelectItem>
                  <SelectItem value="activeFirst">Active first</SelectItem>
                </SelectContent>
              </Select>
              <div className="flex rounded-md border border-border/60">
                <ToggleButton
                  active={viewMode === 'grid'}
                  onClick={() => setViewMode('grid')}
                  icon={Grid}
                  ariaLabel="Grid view"
                />
                <ToggleButton
                  active={viewMode === 'list'}
                  onClick={() => setViewMode('list')}
                  icon={List}
                  ariaLabel="List view"
                />
              </div>
            </div>
          </div>
          <CardDescription>Fine-tune what you see by adjusting filters or sorting preferences.</CardDescription>
        </CardHeader>
      </Card>

      {filteredSliders.length === 0 ? (
        <Card className="border border-dashed border-border/60 bg-background/80 shadow-sm">
          <CardContent className="flex flex-col items-center gap-4 py-12 text-center">
            <ImageIcon className="h-12 w-12 text-muted-foreground" />
            <div>
              <h3 className="text-lg font-semibold">No sliders found</h3>
              <p className="text-muted-foreground">
                {searchQuery || typeFilter !== 'all' || statusFilter !== 'all'
                  ? 'Try adjusting your filters.'
                  : 'Get started by creating your first slider.'}
              </p>
            </div>
            <Button asChild>
              <Link href="/admin/sliders/new">
                <Plus className="mr-2 h-4 w-4" />
                Add Slider
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div
          className={cn(
            viewMode === 'grid'
              ? 'grid gap-6 md:grid-cols-2'
              : 'space-y-4'
          )}
        >
          {filteredSliders.map((slider) => (
            <Card
              key={slider.id}
              className={cn(
                'border border-border/60 shadow-sm transition hover:border-primary/40',
                viewMode === 'list' && 'flex'
              )}
            >
              <CardHeader>
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-lg">{slider.name}</CardTitle>
                      <Badge variant={slider.isActive ? 'default' : 'outline'}>
                        {slider.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                    <CardDescription>
                      {slider.items?.length || 0} items • Created {new Date(slider.createdAt).toLocaleDateString()}
                    </CardDescription>
                    <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                      <span>Type: {slider.type}</span>
                      <span>Autoplay: {slider.autoPlay ? `${slider.autoPlayInterval}ms` : 'Disabled'}</span>
                      <span>Loop: {slider.loop ? 'Enabled' : 'Disabled'}</span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <Badge variant="outline">{slider.type === 'IMAGE' ? 'Image slider' : 'Video slider'}</Badge>
                    <div className="flex items-center gap-1 text-muted-foreground">
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
                        {slider.isActive ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
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
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2 overflow-x-auto py-1">
                  {slider.items.slice(0, 6).map((it) => (
                    <div key={it.id} className="relative h-16 w-24 flex-shrink-0 overflow-hidden rounded-md bg-muted">
                      {it.media?.fileType === 'IMAGE' ? (
                        <ImageWithFallback src={it.media.fileUrl} alt={it.title || 'slide'} fill className="object-cover" />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-black/70">
                          <Video className="h-5 w-5 text-white/80" />
                        </div>
                      )}
                    </div>
                  ))}
                  {slider.items.length === 0 && (
                    <div className="text-sm text-muted-foreground">No items yet</div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

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
            <Button variant="secondary" onClick={() => setPreviewFor(null)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function ToggleButton({
  active,
  onClick,
  icon: Icon,
  ariaLabel,
}: {
  active: boolean
  onClick: () => void
  icon: ButtonProps['children']
  ariaLabel: string
}) {
  const IconComponent = Icon as React.ComponentType<{ className?: string }>
  return (
    <Button
      variant={active ? 'default' : 'ghost'}
      size="sm"
      onClick={onClick}
      className={cn('rounded-none', active ? 'rounded-none' : '')}
      aria-label={ariaLabel}
    >
      <IconComponent className="h-4 w-4" />
    </Button>
  )
}
