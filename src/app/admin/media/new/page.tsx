'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { ArrowLeft, Upload, Loader2, Image as ImageIcon, Video } from 'lucide-react'
import { cn } from '@/lib/utils'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

export default function NewMediaPage() {
  const router = useRouter()
  const { status } = useSession()
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([])
  const [categoriesLoading, setCategoriesLoading] = useState(true)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    fileUrl: '',
    fileType: 'IMAGE' as 'IMAGE' | 'VIDEO',
    categoryId: '',
    isFeatured: false
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [dragActive, setDragActive] = useState(false)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/sign-in')
    }
  }, [status, router])

  // Load categories from API
  useEffect(() => {
    let ignore = false
    async function loadCategories() {
      try {
        const res = await fetch('/api/media/categories')
        if (!res.ok) throw new Error('failed')
        const json = await res.json()
        if (!ignore && Array.isArray(json.categories)) {
          setCategories(json.categories.map((c: any) => ({ id: c.id, name: c.name })))
        }
      } catch {}
      finally {
        if (!ignore) setCategoriesLoading(false)
      }
    }
    loadCategories()
    return () => { ignore = true }
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleCheckboxChange = (checked: boolean) => {
    setFormData(prev => ({ ...prev, isFeatured: checked }))
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0])
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0])
    }
  }

  const handleFile = (file: File) => {
    // In a real application, you would upload the file to a storage service
    // For demo purposes, we'll use a placeholder URL
    const isVideo = file.type.startsWith('video/')
    const placeholderUrl = isVideo 
      ? 'https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4'
      : `https://picsum.photos/800/600?random=${Date.now()}`
    
    setFormData(prev => ({
      ...prev,
      fileUrl: placeholderUrl,
      fileType: isVideo ? 'VIDEO' : 'IMAGE',
      title: prev.title || file.name.split('.')[0]
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      // Validation
      if (!formData.title || !formData.fileUrl) {
        setError('Title and file URL are required')
        return
      }

      const response = await fetch('/api/media', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        router.push('/admin/media')
      } else {
        const errorData = await response.json()
        setError(errorData.message || 'Failed to create media item')
      }
    } catch (err) {
      console.error('Failed to create media item:', err)
      setError('Failed to create media item')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-[50vh] bg-background">
      <main className="container py-8">
        <div className="mb-8">
          <Button variant="ghost" asChild className="mb-4">
            <Link href="/admin/media">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Media
            </Link>
          </Button>
          <h1 className="text-3xl font-bold mb-2">Add New Media</h1>
          <p className="text-muted-foreground">Upload a new image or video to your media library</p>
        </div>

        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>Media Details</CardTitle>
            <CardDescription>
              Fill in the information for your new media item
            </CardDescription>
          </CardHeader>
          
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-6">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              
              {/* File Upload */}
              <div className="space-y-2">
                <Label>Media File</Label>
                <div
                  className={cn(
                    "border-2 border-dashed rounded-lg p-8 text-center transition-colors",
                    dragActive ? "border-primary bg-primary/5" : "border-muted-foreground/25",
                    formData.fileUrl && "border-primary bg-primary/5"
                  )}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                >
                  <input
                    type="file"
                    accept="image/*,video/*"
                    onChange={handleFileSelect}
                    className="hidden"
                    id="file-upload"
                  />
                  <label htmlFor="file-upload" className="cursor-pointer">
                    {formData.fileUrl ? (
                      <div className="space-y-2">
                        {formData.fileType === 'IMAGE' ? (
                          <ImageIcon className="h-12 w-12 text-primary mx-auto" />
                        ) : (
                          <Video className="h-12 w-12 text-primary mx-auto" />
                        )}
                        <p className="text-sm font-medium">
                          {formData.fileType === 'IMAGE' ? 'Image selected' : 'Video selected'}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Click to change file
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <Upload className="h-12 w-12 text-muted-foreground mx-auto" />
                        <p className="text-sm font-medium">
                          Drag and drop your file here, or click to browse
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Supports images and videos
                        </p>
                      </div>
                    )}
                  </label>
                </div>
              </div>

              {/* Title */}
              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  name="title"
                  placeholder="Enter media title"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                  disabled={isLoading}
                />
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  placeholder="Enter media description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={3}
                  disabled={isLoading}
                />
              </div>

              {/* File Type */}
              <div className="space-y-2">
                <Label>File Type</Label>
                <Select 
                  value={formData.fileType} 
                  onValueChange={(value) => handleSelectChange('fileType', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="IMAGE">Image</SelectItem>
                    <SelectItem value="VIDEO">Video</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Category */}
              <div className="space-y-2">
                <Label>Category</Label>
                <Select 
                  value={formData.categoryId || 'none'} 
                  onValueChange={(value) => handleSelectChange('categoryId', value === 'none' ? '' : value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No category</SelectItem>
                    {categories.map((c) => (
                      <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {categoriesLoading && (
                  <p className="text-xs text-muted-foreground">Loading categories…</p>
                )}
              </div>

              {/* Featured */}
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="isFeatured"
                  checked={formData.isFeatured}
                  onCheckedChange={handleCheckboxChange}
                  disabled={isLoading}
                />
                <Label htmlFor="isFeatured">Feature this media</Label>
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
                    'Create Media'
                  )}
                </Button>
                <Button 
                  type="button" 
                  variant="outline"
                  asChild
                >
                  <Link href="/admin/media">Cancel</Link>
                </Button>
              </div>
            </CardContent>
          </form>
        </Card>
      </main>
    </div>
  )
}
