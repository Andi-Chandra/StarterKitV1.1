'use client'

import { useState, useMemo } from 'react'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ImageWithFallback } from '@/components/ui/ImageWithFallback'
import { Search, Filter, Grid, List, X } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from '@/components/ui/dialog'
import { cn } from '@/lib/utils'

interface MediaItem {
  id: string
  title: string
  description?: string
  fileUrl: string
  fileType: 'IMAGE' | 'VIDEO'
  category?: {
    id: string
    name: string
    slug: string
  }
  isFeatured: boolean
  createdAt: string
}

interface GalleryProps {
  mediaItems: MediaItem[]
  categories?: Array<{
    id: string
    name: string
    slug: string
  }>
  showSearch?: boolean
  showFilters?: boolean
  className?: string
}

export function Gallery({
  mediaItems,
  categories = [],
  showSearch = true,
  showFilters = true,
  className
}: GalleryProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [selectedItem, setSelectedItem] = useState<MediaItem | null>(null)

  // Filter media items based on category and search
  const filteredItems = useMemo(() => {
    let filtered = mediaItems

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(item => item.category?.id === selectedCategory)
    }

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(item =>
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    return filtered
  }, [mediaItems, selectedCategory, searchQuery])

  const handleItemClick = (item: MediaItem) => {
    setSelectedItem(item)
  }

  const clearFilters = () => {
    setSelectedCategory('all')
    setSearchQuery('')
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header with Search and Filters */}
      {(showSearch || showFilters) && (
        <div className="space-y-4">
          {/* Search Bar */}
          {showSearch && (
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search media..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          )}

          {/* Filters and View Mode */}
          {showFilters && (
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
              {/* Category Filter */}
              <div className="flex flex-wrap gap-2">
                <Badge
                  variant={selectedCategory === 'all' ? 'default' : 'secondary'}
                  className="cursor-pointer"
                  onClick={() => setSelectedCategory('all')}
                >
                  All Items
                </Badge>
                {categories.map((category) => (
                  <Badge
                    key={category.id}
                    variant={selectedCategory === category.id ? 'default' : 'secondary'}
                    className="cursor-pointer"
                    onClick={() => setSelectedCategory(category.id)}
                  >
                    {category.name}
                  </Badge>
                ))}
              </div>

              {/* View Mode and Clear Filters */}
              <div className="flex items-center gap-2">
                {(selectedCategory !== 'all' || searchQuery) && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={clearFilters}
                    className="gap-2"
                  >
                    <X className="h-4 w-4" />
                    Clear Filters
                  </Button>
                )}
                
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
          )}

          {/* Results Count */}
          <div className="text-sm text-muted-foreground">
            {filteredItems.length} {filteredItems.length === 1 ? 'item' : 'items'} found
          </div>
        </div>
      )}

      {/* Gallery Grid/List */}
      {filteredItems.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No media items found.</p>
          {(selectedCategory !== 'all' || searchQuery) && (
            <Button
              variant="outline"
              onClick={clearFilters}
              className="mt-4"
            >
              Clear Filters
            </Button>
          )}
        </div>
      ) : (
        <div
          className={cn(
            viewMode === 'grid'
              ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
              : "space-y-4"
          )}
        >
          {filteredItems.map((item) => (
            <Dialog key={item.id}>
              <DialogTrigger asChild>
                <Card
                  className={cn(
                    "overflow-hidden cursor-pointer transition-all hover:shadow-lg",
                    viewMode === 'list' && "flex flex-col sm:flex-row"
                  )}
                  onClick={() => handleItemClick(item)}
                >
                  <CardContent className={cn("p-0", viewMode === 'list' && "flex-shrink-0 w-full sm:w-48")}>
                    {/* Media Thumbnail */}
                    <div className={cn(
                      "relative bg-muted",
                      viewMode === 'grid' ? "aspect-square" : "aspect-video sm:aspect-square"
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
                          <div className="text-center">
                            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-2">
                              <Filter className="h-6 w-6 text-primary" />
                            </div>
                            <p className="text-sm text-muted-foreground">Video</p>
                          </div>
                        </div>
                      )}
                      
                      {/* Featured Badge */}
                      {item.isFeatured && (
                        <Badge className="absolute top-2 right-2">
                          Featured
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                  
                  {/* Item Info */}
                  {viewMode === 'grid' && (
                    <div className="p-4">
                      <h3 className="font-semibold mb-2 line-clamp-1">{item.title}</h3>
                      {item.description && (
                        <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                          {item.description}
                        </p>
                      )}
                      {item.category && (
                        <Badge variant="outline" className="text-xs">
                          {item.category.name}
                        </Badge>
                      )}
                    </div>
                  )}
                  
                  {viewMode === 'list' && (
                    <div className="p-4 flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-semibold">{item.title}</h3>
                        {item.isFeatured && (
                          <Badge className="text-xs">Featured</Badge>
                        )}
                      </div>
                      {item.description && (
                        <p className="text-sm text-muted-foreground mb-2">
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
                    </div>
                  )}
                </Card>
              </DialogTrigger>
              
              {/* Full Preview Dialog */}
              <DialogContent className="max-w-4xl">
                <div className="space-y-4">
                  {/* Media Preview */}
                  <div className="relative aspect-video bg-muted rounded-lg overflow-hidden">
                    {item.fileType === 'IMAGE' ? (
                      <ImageWithFallback
                        src={item.fileUrl}
                        alt={item.title}
                        fill
                        className="object-contain"
                      />
                    ) : (
                      <video
                        src={item.fileUrl}
                        controls
                        className="w-full h-full"
                      />
                    )}
                  </div>
                  
                  {/* Media Details */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xl font-semibold">{item.title}</h3>
                      {item.isFeatured && (
                        <Badge>Featured</Badge>
                      )}
                    </div>
                    {item.description && (
                      <p className="text-muted-foreground">{item.description}</p>
                    )}
                    {item.category && (
                      <Badge variant="outline">{item.category.name}</Badge>
                    )}
                    <p className="text-sm text-muted-foreground">
                      Added on {new Date(item.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          ))}
        </div>
      )}
    </div>
  )
}