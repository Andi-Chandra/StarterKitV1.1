'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth, useSession } from '@/components/providers/session-provider'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Plus,
  Edit,
  Trash2,
  Search,
  FolderOpen,
  Sparkles,
} from 'lucide-react'

interface Category {
  id: string
  name: string
  slug: string
  description?: string
  createdAt: string
}

export default function AdminCategoriesPage() {
  const router = useRouter()
  const { status } = useSession()
  const { accessToken } = useAuth()
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/sign-in')
      return
    }
    if (status === 'authenticated') {
      fetchCategories()
    }
  }, [router, status])

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/media/categories', { cache: 'no-store' })
      if (response.ok) {
        const data = await response.json()
        setCategories(data.categories || [])
      }
    } catch (error) {
      console.error('Failed to fetch categories:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this category?')) return

    try {
      if (!accessToken) {
        alert('Authentication required. Please sign in again.')
        return
      }
      const response = await fetch(`/api/media/categories/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      })

      if (response.ok) {
        setCategories(prev => prev.filter(cat => cat.id !== id))
      } else {
        const errorData = await response.json()
        alert(errorData.message || 'Failed to delete category')
      }
    } catch (error) {
      console.error('Failed to delete category:', error)
      alert('Failed to delete category')
    }
  }

  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    category.description?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (isLoading) {
    return (
      <div className="min-h-[50vh] bg-background">
        <div className="container py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p>Loading categories...</p>
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
            <Badge className="w-fit bg-primary/20 text-primary">Collections</Badge>
            <CardTitle className="text-2xl font-semibold md:text-3xl">Category Management</CardTitle>
            <CardDescription className="max-w-2xl text-base text-muted-foreground">
              Keep your media organised with curated categories. Search, refine, and update without losing context.
            </CardDescription>
          </div>
          <Button asChild size="lg" className="shadow-md">
            <Link href="/admin/categories/new">
              <Sparkles className="mr-2 h-4 w-4" />
              Add Category
            </Link>
          </Button>
        </CardHeader>
      </Card>

      <Card className="border border-border/60 shadow-sm">
        <CardHeader className="gap-6">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-3 rounded-xl border border-dashed border-border/60 bg-background/80 px-4 py-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary">
                <FolderOpen className="h-4 w-4" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Categories</p>
                <p className="text-sm font-medium text-foreground">{categories.length} total</p>
              </div>
            </div>
            <div className="relative w-full max-w-md">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search categories..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <CardDescription>
            Use categories to power navigation, sliders, and curated collections across the site.
          </CardDescription>
        </CardHeader>
      </Card>

      {filteredCategories.length === 0 ? (
        <Card className="border border-dashed border-border/60 bg-background/80 shadow-sm">
          <CardContent className="flex flex-col items-center gap-4 py-12 text-center">
            <FolderOpen className="h-12 w-12 text-muted-foreground" />
            <div>
              <h3 className="text-lg font-semibold">No categories found</h3>
              <p className="text-muted-foreground">
                {searchQuery ? 'Try adjusting your search terms.' : 'Get started by creating your first category.'}
              </p>
            </div>
            <Button asChild>
              <Link href="/admin/categories/new">
                <Plus className="mr-2 h-4 w-4" />
                Add Category
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {filteredCategories.map((category) => (
            <Card key={category.id} className="group border border-border/60 shadow-sm transition hover:border-primary/40">
              <CardHeader>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                      <FolderOpen className="h-4 w-4" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{category.name}</CardTitle>
                      <p className="text-sm text-muted-foreground">/{category.slug}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 opacity-0 transition group-hover:opacity-100">
                    <Button size="sm" variant="ghost" asChild>
                      <Link href={`/admin/categories/${category.id}/edit`}>
                        <Edit className="h-4 w-4" />
                      </Link>
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => handleDelete(category.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              {category.description && (
                <CardContent>
                  <p className="text-sm text-muted-foreground line-clamp-3">{category.description}</p>
                </CardContent>
              )}
              <CardContent className="pt-0">
                <p className="text-xs text-muted-foreground">
                  Created {new Date(category.createdAt).toLocaleDateString()}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
