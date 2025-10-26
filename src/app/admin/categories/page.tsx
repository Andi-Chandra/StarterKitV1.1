'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth, useSession } from '@/components/providers/session-provider'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { 
  Plus, 
  Edit, 
  Trash2, 
  Search,
  FolderOpen
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
    <div className="min-h-[50vh] bg-background">
      <div className="container py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Category Management</h1>
            <p className="text-muted-foreground">Manage your content categories</p>
          </div>
          <Button asChild>
            <Link href="/admin/categories/new">
              <Plus className="h-4 w-4 mr-2" />
              Add Category
            </Link>
          </Button>
        </div>

        {/* Search */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search categories..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Categories Grid */}
        {filteredCategories.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <FolderOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No categories found</h3>
              <p className="text-muted-foreground mb-4">
                {searchQuery ? 'Try adjusting your search' : 'Get started by creating your first category'}
              </p>
              <Button asChild>
                <Link href="/admin/categories/new">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Category
                </Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCategories.map((category) => (
              <Card key={category.id} className="group hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <FolderOpen className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{category.name}</CardTitle>
                        <p className="text-sm text-muted-foreground">/{category.slug}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button size="sm" variant="ghost" asChild>
                        <Link href={`/admin/categories/${category.id}/edit`}>
                          <Edit className="h-4 w-4" />
                        </Link>
                      </Button>
                      <Button 
                        size="sm" 
                        variant="ghost"
                        onClick={() => handleDelete(category.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                {category.description && (
                  <CardContent>
                    <p className="text-sm text-muted-foreground line-clamp-3">
                      {category.description}
                    </p>
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
    </div>
  )
}
