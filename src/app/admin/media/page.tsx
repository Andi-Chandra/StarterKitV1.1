'use client'

import { useEffect, useState } from 'react'
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
import { ImageWithFallback } from '@/components/ui/ImageWithFallback'
import {
  Plus,
  Edit,
  Trash2,
  Search,
  Filter,
  Image as ImageIcon,
  Video,
  Grid,
  List,
} from 'lucide-react'
import { cn } from '@/lib/utils'

export const dynamic = 'force-dynamic'

interface MediaItem {
  id: string
  title: string
  description?: string
  fileUrl: string
  fileType: 'IMAGE' | 'VIDEO'
  category?: {
    id: string
    name: string
  }
  isFeatured: boolean
  createdAt: string
}

export default function AdminMediaPage() {
  const router = useRouter()
  const { status } = useSession()
  const { accessToken } = useAuth()
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([])
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/sign-in')
      return
    }
    if (status === 'authenticated') {
      fetchMediaItems()
      fetchCategories()
    }
  }, [router, status])

  const fetchMediaItems = async () => {
    try {
      const response = await fetch('/api/media', { cache: 'no-store' })
      if (response.ok) {
        const data = await response.json()
        setMediaItems(data.mediaItems || [])
      }
    } catch (error) {
      console.error('Failed to fetch media items:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/media/categories', { cache: 'no-store' })
      if (response.ok) {
        const data = await response.json()
        setCategories(data.categories || [])
      }
    } catch (error) {
      console.error('Failed to fetch categories:', error)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this media item?')) return

    try {
      if (!accessToken) {
        alert('Authentication required. Please sign in again.')
        return
      }
      const response = await fetch(`/api/media/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      })

      if (response.ok) {
        setMediaItems((prev) => prev.filter((item) => item.id !== id))
      } else {
        alert('Failed to delete media item')
      }
    } catch (error) {
      console.error('Failed to delete media item:', error)
      alert('Failed to delete media item')
    }
  }

  const filteredItems = mediaItems.filter((item) => {
    const matchesSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description?.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || item.category?.id === selectedCategory
    return matchesSearch && matchesCategory
  })

  if (isLoading) {
    return (
      <div className="min-h-[50vh] bg-background">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-b-2 border-primary" />
            <p>Loading media library...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <Card className="relative overflow-hidden border-none bg-gradient-to-br from-primary/15 via-primary/10 to-transparent shadow-sm">
        <div className="absolute inset-y-0 right-0 w-1/2 bg-[radial-gradient(circle_at_top,_theme(colors.primary/20),_transparent_70%)]" />
        <CardHeader className="relative flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="space-y-2">
            <Badge className="w-fit bg-primary/20 text-primary">Library</Badge>
            <CardTitle className="text-2xl font-semibold md:text-3xl">Media Library</CardTitle>
            <CardDescription className="max-w-2xl text-base text-muted-foreground">
              Manage images and videos that power sliders, gallery sections, and featured layouts throughout the site.
            </CardDescription>
          </div>
          <Button asChild size="lg" className="shadow-md">
            <Link href="/admin/media/new">
              <Plus className="mr-2 h-4 w-4" /> Add Media
            </Link>
          </Button>
        </CardHeader>
      </Card>

      <Card className="border border-border/60 shadow-sm">
        <CardHeader className="gap-4">
          <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_auto] md:items-center">
            <div className="grid gap-3 sm:grid-cols-2 sm:items-center">
              <div className="flex items-center gap-3 rounded-xl border border-dashed border-border/60 bg-background/80 px-4 py-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <ImageIcon className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">Total assets</p>
                  <p className="text-sm font-medium text-foreground">{mediaItems.length}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-xl border border-dashed border-border/60 bg-background/80 px-4 py-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Filter className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">Categories</p>
                  <p className="text-sm font-medium text-foreground">{categories.length}</p>
                </div>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative w-full min-w-[220px] flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search media..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Filter by category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All categories</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="flex rounded-md border border-border/60">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                  className="rounded-r-none"
                >
                  <Grid className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                  className="rounded-l-none"
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
          <CardDescription>
            Optimise your media workflow by filtering, reviewing, and updating assets before they go live.
          </CardDescription>
        </CardHeader>
      </Card>

      <div>
        <p className="text-sm text-muted-foreground">
          Showing {filteredItems.length} {filteredItems.length === 1 ? 'asset' : 'assets'}{' '}
          {selectedCategory !== 'all' ? 'in selected category' : ''}
        </p>
      </div>

      {filteredItems.length === 0 ? (
        <Card className="border border-dashed border-border/60 bg-background/80 shadow-sm">
          <CardContent className="flex flex-col items-center gap-4 py-12 text-center">
            <ImageIcon className="h-12 w-12 text-muted-foreground" />
            <div>
              <h3 className="text-lg font-semibold">No media items found</h3>
              <p className="text-muted-foreground">
                {searchQuery || selectedCategory !== 'all'
                  ? 'Try adjusting your filters.'
                  : 'Get started by adding your first media item.'}
              </p>
            </div>
            <Button asChild>
              <Link href="/admin/media/new">
                <Plus className="mr-2 h-4 w-4" />
                Add Media
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div
          className={cn(
            viewMode === 'grid'
              ? 'grid gap-6 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4'
              : 'space-y-4'
          )}
        >
          {filteredItems.map((item) => (
            <Card
              key={item.id}
              className={cn(
                'overflow-hidden border border-border/60 shadow-sm transition hover:border-primary/40',
                viewMode === 'list' && 'flex'
              )}
            >
              <div
                className={cn(
                  'relative bg-muted',
                  viewMode === 'grid' ? 'aspect-square' : 'w-48 flex-shrink-0',
                  viewMode === 'list' ? 'aspect-[3/2]' : ''
                )}
              >
                {item.fileType === 'IMAGE' ? (
                  <ImageWithFallback src={item.fileUrl} alt={item.title} fill className="object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center">
                    <Video className="h-8 w-8 text-muted-foreground" />
                  </div>
                )}

                <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/60 opacity-0 transition-opacity group-hover:opacity-100">
                  <Button size="sm" variant="secondary" asChild>
                    <Link href={`/admin/media/${item.id}/edit`}>
                      <Edit className="h-4 w-4" />
                    </Link>
                  </Button>
                  <Button size="sm" variant="destructive" onClick={() => handleDelete(item.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>

                {item.isFeatured && (
                  <Badge className="absolute top-2 right-2 bg-primary text-primary-foreground">Featured</Badge>
                )}
              </div>

              <CardContent className={cn('p-4', viewMode === 'list' && 'flex-1')}>
                <div className="mb-2 flex items-start justify-between">
                  <h3 className="font-semibold line-clamp-1">{item.title}</h3>
                  {item.fileType === 'VIDEO' && (
                    <Video className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  )}
                </div>
                {item.description && (
                  <p className="mb-2 text-sm text-muted-foreground line-clamp-2">{item.description}</p>
                )}
                <div className="flex items-center justify-between">
                  {item.category && (
                    <Badge variant="outline" className="text-xs">
                      {item.category.name}
                    </Badge>
                  )}
                  <span className="text-xs text-muted-foreground">
                    {new Date(item.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
