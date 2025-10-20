'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { ArrowLeft, Loader2 } from 'lucide-react'

export default function NewCategoryPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: ''
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    
    // Auto-generate slug from name
    if (name === 'name') {
      const slug = value
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '')
      setFormData(prev => ({ ...prev, slug }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      // Validation
      if (!formData.name || !formData.slug) {
        setError('Name and slug are required')
        return
      }

      const response = await fetch('/api/media/categories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        router.push('/admin/categories')
      } else {
        const errorData = await response.json()
        setError(errorData.message || 'Failed to create category')
      }
    } catch (err) {
      console.error('Failed to create category:', err)
      setError('Failed to create category')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-[50vh] bg-background">
      <main className="container py-8">
        <div className="mb-8">
          <Button variant="ghost" asChild className="mb-4">
            <Link href="/admin/categories">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Categories
            </Link>
          </Button>
          <h1 className="text-3xl font-bold mb-2">Add New Category</h1>
          <p className="text-muted-foreground">Create a new category to organize your content</p>
        </div>

        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>Category Details</CardTitle>
            <CardDescription>
              Fill in the information for your new category
            </CardDescription>
          </CardHeader>
          
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-6">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              
              {/* Name */}
              <div className="space-y-2">
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  name="name"
                  placeholder="Enter category name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  disabled={isLoading}
                />
              </div>

              {/* Slug */}
              <div className="space-y-2">
                <Label htmlFor="slug">Slug *</Label>
                <Input
                  id="slug"
                  name="slug"
                  placeholder="category-slug"
                  value={formData.slug}
                  onChange={handleInputChange}
                  required
                  disabled={isLoading}
                />
                <p className="text-xs text-muted-foreground">
                  URL-friendly version of the name. Auto-generated from the name.
                </p>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  placeholder="Enter category description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={3}
                  disabled={isLoading}
                />
              </div>

              {/* Actions */}
              <div className="flex items-center gap-4 pt-4">
                <Button 
                  type="submit" 
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    'Create Category'
                  )}
                </Button>
                <Button 
                  type="button" 
                  variant="outline"
                  asChild
                >
                  <Link href="/admin/categories">Cancel</Link>
                </Button>
              </div>
            </CardContent>
          </form>
        </Card>
      </main>
    </div>
  )
}
