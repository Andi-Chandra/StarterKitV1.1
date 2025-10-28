'use client'

import { useMemo, useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from '@/components/ui/dialog'
import { cn } from '@/lib/utils'
import {
  Search,
  Filter,
  Grid,
  List,
  X,
  Calendar,
  Eye,
} from 'lucide-react'

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
  autoPlay?: boolean
  imageFit?: 'cover' | 'contain'
}

export function Gallery({
  mediaItems,
  categories = [],
  showSearch = true,
  showFilters = true,
  className,
  autoPlay = false,
  imageFit = 'cover',
}: GalleryProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [imageErrors, setImageErrors] = useState<Set<string>>(new Set())

  const filteredItems = useMemo(() => {
    let filtered = mediaItems

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(item => item.category?.id === selectedCategory)
    }

    if (searchQuery) {
      filtered = filtered.filter(item =>
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    return filtered
  }, [mediaItems, selectedCategory, searchQuery])

  const handleImageError = (id: string) => {
    setImageErrors(prev => {
      const next = new Set(prev)
      next.add(id)
      return next
    })
  }

  const clearFilters = () => {
    setSelectedCategory('all')
    setSearchQuery('')
  }

  const renderMediaThumbnail = (item: MediaItem, size: 'small' | 'large' = 'small') => {
    const hasError = imageErrors.has(item.id)
    const aspectClass =
      size === 'small'
        ? viewMode === 'grid'
          ? 'aspect-[4/3]'
          : 'aspect-video sm:aspect-[4/3]'
        : 'aspect-video'

    if (hasError) {
      return (
        <div
          className={cn(
            'w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200',
            aspectClass,
          )}
        >
          <div className="text-center p-4">
            <div className="w-16 h-16 mx-auto mb-2 bg-gray-300 rounded-lg flex items-center justify-center">
              <svg className="w-8 h-8 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <p className="text-sm text-gray-600">{item.title}</p>
            <p className="text-xs text-gray-400">Gambar tidak tersedia</p>
          </div>
        </div>
      )
    }

    if (item.fileType === 'IMAGE') {
      return (
        <div className={cn('relative bg-muted overflow-hidden', aspectClass)}>
          <img
            src={item.fileUrl}
            alt={item.title}
            className={cn(
              'w-full h-full object-center transition-transform duration-300 group-hover:scale-105',
              imageFit === 'cover' ? 'object-cover' : 'object-contain',
            )}
            onError={() => handleImageError(item.id)}
          />
          <div className="absolute inset-0 bg-black/0 transition-colors duration-300 group-hover:bg-black/20 flex items-center justify-center">
            <Eye className="w-8 h-8 text-white opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
          </div>
          {item.isFeatured && (
            <Badge className="absolute top-2 right-2 bg-primary/90 backdrop-blur-sm">
              Featured
            </Badge>
          )}
        </div>
      )
    }

    return (
      <div
        className={cn(
          'relative bg-muted overflow-hidden flex items-center justify-center',
          aspectClass,
        )}
      >
        <div className="text-center">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-2">
            <Filter className="w-8 h-8 text-primary" />
          </div>
          <p className="text-sm text-muted-foreground">Video</p>
        </div>
        {item.isFeatured && (
          <Badge className="absolute top-2 right-2 bg-primary/90 backdrop-blur-sm">
            Featured
          </Badge>
        )}
      </div>
    )
  }

  return (
    <div className={cn('space-y-6', className)}>
      {(showSearch || showFilters) && (
        <div className="space-y-4">
          {showSearch && (
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Cari media..."
                value={searchQuery}
                onChange={event => setSearchQuery(event.target.value)}
                className="pl-10 border-gray-200 focus:border-primary"
              />
            </div>
          )}

          {showFilters && (
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
              <div className="flex flex-wrap gap-2">
                <Badge
                  variant={selectedCategory === 'all' ? 'default' : 'secondary'}
                  className="cursor-pointer hover:bg-primary/80 transition-colors"
                  onClick={() => setSelectedCategory('all')}
                >
                  Semua Item
                </Badge>
                {categories.map(category => (
                  <Badge
                    key={category.id}
                    variant={selectedCategory === category.id ? 'default' : 'secondary'}
                    className="cursor-pointer hover:bg-primary/80 transition-colors"
                    onClick={() => setSelectedCategory(category.id)}
                  >
                    {category.name}
                  </Badge>
                ))}
              </div>

              <div className="flex items-center gap-2">
                {(selectedCategory !== 'all' || searchQuery) && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={clearFilters}
                    className="gap-2 border-gray-200 hover:bg-gray-50"
                  >
                    <X className="h-4 w-4" />
                    Hapus Filter
                  </Button>
                )}

                <div className="flex border border-gray-200 rounded-md">
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

          <div className="text-sm text-gray-600">
            {filteredItems.length} {filteredItems.length === 1 ? 'item ditemukan' : 'item ditemukan'}
          </div>
        </div>
      )}

      {filteredItems.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
            <Search className="w-12 h-12 text-gray-400" />
          </div>
          <p className="text-gray-600 mb-4">Tidak ada media item ditemukan.</p>
          {(selectedCategory !== 'all' || searchQuery) && (
            <Button
              variant="outline"
              onClick={clearFilters}
              className="border-gray-200 hover:bg-gray-50"
            >
              Hapus Filter
            </Button>
          )}
        </div>
      ) : (
        <div
          className={cn(
            viewMode === 'grid'
              ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
              : 'space-y-4',
          )}
        >
          {filteredItems.map(item => (
            <Dialog key={item.id}>
              <DialogTrigger asChild>
                <Card
                  className={cn(
                    'overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-lg hover:scale-[1.02] border-gray-200 group',
                    viewMode === 'list' && 'flex flex-col sm:flex-row',
                  )}
                >
                  <CardContent className={cn('p-0', viewMode === 'list' && 'flex-shrink-0 w-full sm:w-48')}>
                    {renderMediaThumbnail(item, 'small')}
                  </CardContent>

                  {viewMode === 'grid' && (
                    <div className="p-4">
                      <h3 className="font-semibold mb-2 text-gray-900 line-clamp-1 group-hover:text-primary transition-colors">
                        {item.title}
                      </h3>
                      {item.description && (
                        <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                          {item.description}
                        </p>
                      )}
                      <div className="flex items-center justify-between">
                        {item.category && (
                          <Badge variant="outline" className="text-xs border-gray-200">
                            {item.category.name}
                          </Badge>
                        )}
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                          <Calendar className="w-3 h-3" />
                          {new Date(item.createdAt).toLocaleDateString('id-ID', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </div>
                      </div>
                    </div>
                  )}

                  {viewMode === 'list' && (
                    <div className="p-4 flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-semibold text-gray-900 group-hover:text-primary transition-colors">
                          {item.title}
                        </h3>
                        {item.isFeatured && (
                          <Badge className="text-xs bg-primary/90">Featured</Badge>
                        )}
                      </div>
                      {item.description && (
                        <p className="text-sm text-gray-600 mb-3">
                          {item.description}
                        </p>
                      )}
                      <div className="flex items-center justify-between">
                        {item.category && (
                          <Badge variant="outline" className="text-xs border-gray-200">
                            {item.category.name}
                          </Badge>
                        )}
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                          <Calendar className="w-3 h-3" />
                          {new Date(item.createdAt).toLocaleDateString('id-ID', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </div>
                      </div>
                    </div>
                  )}
                </Card>
              </DialogTrigger>

              <DialogContent className="max-w-6xl w-full">
                <div className="space-y-4">
                  <div className="relative aspect-video bg-gray-100 rounded-lg overflow-hidden">
                    {imageErrors.has(item.id) ? (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
                        <div className="text-center p-8">
                          <div className="w-24 h-24 mx-auto mb-4 bg-gray-300 rounded-lg flex items-center justify-center">
                            <svg className="w-12 h-12 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                          </div>
                          <p className="text-gray-600">{item.title}</p>
                          <p className="text-sm text-gray-400">Media tidak tersedia</p>
                        </div>
                      </div>
                    ) : item.fileType === 'IMAGE' ? (
                      <img
                        src={item.fileUrl}
                        alt={item.title}
                        className="w-full h-full object-contain bg-gray-50"
                        onError={() => handleImageError(item.id)}
                      />
                    ) : (
                      <video
                        src={item.fileUrl}
                        controls
                        autoPlay={autoPlay}
                        className="w-full h-full object-contain bg-black"
                      />
                    )}
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xl font-semibold text-gray-900">{item.title}</h3>
                      {item.isFeatured && (
                        <Badge className="bg-primary/90">Featured</Badge>
                      )}
                    </div>
                    {item.description && (
                      <p className="text-gray-600">{item.description}</p>
                    )}
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      {item.category && (
                        <Badge variant="outline" className="border-gray-200">
                          {item.category.name}
                        </Badge>
                      )}
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {new Date(item.createdAt).toLocaleDateString('id-ID', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </div>
                    </div>
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
