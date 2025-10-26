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
  Eye,
  Grid,
  List
} from 'lucide-react'
import { cn } from '@/lib/utils'

// Force dynamic rendering
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
  const [categories, setCategories] = useState([])
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
      // Fetch media items and categories
      fetchMediaItems()
      fetchCategories()
    }
  }, [router, status])

  const fetchMediaItems = async () => {
    try {
      const response = await fetch('/api/media')
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
      const response = await fetch('/api/media/categories')
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
        setMediaItems(prev => prev.filter(item => item.id !== id))
      } else {
        alert('Failed to delete media item')
      }
    } catch (error) {
      console.error('Failed to delete media item:', error)
      alert('Failed to delete media item')
    }
  }

  const filteredItems = mediaItems.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.description?.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || item.category?.id === selectedCategory
    return matchesSearch && matchesCategory
  })

  if (isLoading) {
    return (
      <div className="min-h-[50vh] bg-background">
        <div className="container py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p>Loading media items...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-[50vh] bg-background">
      <div className="container py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Media Management</h1>
            <p className="text-muted-foreground">Manage your images and videos</p>
          </div>
          <Button asChild>
            <Link href="/admin/media/new">
              <Plus className="h-4 w-4 mr-2" />
              Add Media
            </Link>
          </Button>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search media..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="All Categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories.map((category: any) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div className="flex border rounded-md">
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
          </CardContent>
        </Card>

        {/* Results Count */}
        <div className="mb-4">
          <p className="text-sm text-muted-foreground">
            {filteredItems.length} {filteredItems.length === 1 ? 'item' : 'items'} found
          </p>
        </div>

        {/* Media Grid/List */}
        {filteredItems.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <ImageIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No media items found</h3>
              <p className="text-muted-foreground mb-4">
                {searchQuery || selectedCategory !== 'all' 
                  ? 'Try adjusting your filters' 
                  : 'Get started by adding your first media item'
                }
              </p>
              <Button asChild>
                <Link href="/admin/media/new">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Media
                </Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className={cn(
            viewMode === 'grid'
              ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
              : "space-y-4"
          )}>
            {filteredItems.map((item) => (
              <Card key={item.id} className={cn(
                "overflow-hidden group hover:shadow-lg transition-shadow",
                viewMode === 'list' && "flex"
              )}>
                <div className={cn(
                  "relative bg-muted",
                  viewMode === 'grid' ? "aspect-square" : "w-48 aspect-[3/2] flex-shrink-0"
                )}>
                  {item.fileType === 'IMAGE' ? (
                    <ImageWithFallback
                      src={item.fileUrl}
                      alt={item.title}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Video className="h-8 w-8 text-muted-foreground" />
                    </div>
                  )}
                  
                  {/* Overlay Actions */}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <Button size="sm" variant="secondary" asChild>
                      <Link href={`/admin/media/${item.id}/edit`}>
                        <Edit className="h-4 w-4" />
                      </Link>
                    </Button>
                    <Button 
                      size="sm" 
                      variant="destructive"
                      onClick={() => handleDelete(item.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* Featured Badge */}
                  {item.isFeatured && (
                    <Badge className="absolute top-2 right-2">
                      Featured
                    </Badge>
                  )}
                </div>

                <CardContent className={cn(
                  "p-4",
                  viewMode === 'list' && "flex-1"
                )}>
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold line-clamp-1">{item.title}</h3>
                    {item.fileType === 'VIDEO' && (
                      <Video className="h-4 w-4 text-muted-foreground flex-shrink-0 ml-2" />
                    )}
                  </div>
                  
                  {item.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                      {item.description}
                    </p>
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
    </div>
  )
}
