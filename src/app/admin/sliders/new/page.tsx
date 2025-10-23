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
import { ArrowLeft, Loader2, Plus, Trash2, Image as ImageIcon, Video } from 'lucide-react'
import { ImageWithFallback } from '@/components/ui/ImageWithFallback'

interface SliderItem {
  title: string
  subtitle?: string
  callToAction?: string
  callToActionUrl?: string
  mediaId?: string
}

interface MediaOption {
  id: string
  title: string
  fileUrl: string
  fileType: 'IMAGE' | 'VIDEO'
}

export default function NewSliderPage() {
  const router = useRouter()
  const { status } = useSession()
  const [formData, setFormData] = useState({
    name: '',
    type: 'IMAGE' as 'IMAGE' | 'VIDEO',
    isActive: true,
    autoPlay: true,
    autoPlayInterval: 5000,
    loop: true
  })
  const [sliderItems, setSliderItems] = useState<SliderItem[]>([
    { title: '', subtitle: '', callToAction: '', callToActionUrl: '', mediaId: '' }
  ])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [mediaOptions, setMediaOptions] = useState<MediaOption[]>([])
  const [isLoadingMedia, setIsLoadingMedia] = useState(false)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/sign-in')
    }
  }, [status, router])

  // Fetch media options based on slider type
  useEffect(() => {
    async function fetchMedia() {
      try {
        setIsLoadingMedia(true)
        const type = formData.type
        const res = await fetch(`/api/media?limit=100&type=${type}`)
        if (!res.ok) {
          setMediaOptions([])
          return
        }
        const data = await res.json()
        const items: MediaOption[] = (data.mediaItems || [])
          .filter((m: any) => m.fileType === type)
          .map((m: any) => ({ id: m.id, title: m.title, fileUrl: m.fileUrl, fileType: m.fileType }))
        setMediaOptions(items)
        // If slider type changed, clear any previously selected media if mismatched
        setSliderItems(prev => prev.map(it => ({ ...it, mediaId: items.find(i => i.id === it.mediaId) ? it.mediaId : '' })))
      } catch (err) {
        setMediaOptions([])
      } finally {
        setIsLoadingMedia(false)
      }
    }
    fetchMedia()
  }, [formData.type])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target
    setFormData(prev => ({ 
      ...prev, 
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value 
    }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSliderItemChange = (index: number, field: keyof SliderItem, value: string) => {
    setSliderItems(prev => {
      const updated = [...prev]
      updated[index] = { ...updated[index], [field]: value }
      return updated
    })
  }

  const addSliderItem = () => {
    setSliderItems(prev => [...prev, { title: '', subtitle: '', callToAction: '', callToActionUrl: '' }])
  }

  const removeSliderItem = (index: number) => {
    if (sliderItems.length > 1) {
      setSliderItems(prev => prev.filter((_, i) => i !== index))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      // Validation
      if (!formData.name) {
        setError('Slider name is required')
        return
      }

      if (sliderItems.some(item => !item.title)) {
        setError('All slider items must have a title')
        return
      }
      if (sliderItems.some(item => !item.mediaId)) {
        setError('Each slider item must have a media selected')
        return
      }

      const response = await fetch('/api/sliders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          items: sliderItems.map((item, index) => ({
            title: item.title,
            subtitle: item.subtitle,
            callToAction: item.callToAction,
            callToActionUrl: item.callToActionUrl,
            mediaId: item.mediaId!,
            sortOrder: index,
          }))
        })
      })

      if (response.ok) {
        router.push('/admin/sliders')
      } else {
        const errorData = await response.json()
        setError(errorData.message || 'Failed to create slider')
      }
    } catch (err) {
      console.error('Failed to create slider:', err)
      setError('Failed to create slider')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-[50vh] bg-background">
      <main className="container py-8">
        <div className="mb-8">
          <Button variant="ghost" asChild className="mb-4">
            <Link href="/admin/sliders">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Sliders
            </Link>
          </Button>
          <h1 className="text-3xl font-bold mb-2">Add New Slider</h1>
          <p className="text-muted-foreground">Create a new image or video slider</p>
        </div>

        <Card className="max-w-4xl mx-auto">
          <CardHeader>
            <CardTitle>Slider Details</CardTitle>
            <CardDescription>
              Configure your slider settings and add slides
            </CardDescription>
          </CardHeader>
          
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-6">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              
              {/* Basic Settings */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Slider Name *</Label>
                  <Input
                    id="name"
                    name="name"
                    placeholder="Enter slider name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    disabled={isLoading}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Slider Type</Label>
                  <Select 
                    value={formData.type} 
                    onValueChange={(value) => handleSelectChange('type', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="IMAGE">Image Slider</SelectItem>
                      <SelectItem value="VIDEO">Video Slider</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Slider Settings */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="isActive"
                    name="isActive"
                    checked={formData.isActive}
                    onCheckedChange={(checked) => 
                      setFormData(prev => ({ ...prev, isActive: checked as boolean }))
                    }
                    disabled={isLoading}
                  />
                  <Label htmlFor="isActive">Active</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="autoPlay"
                    name="autoPlay"
                    checked={formData.autoPlay}
                    onCheckedChange={(checked) => 
                      setFormData(prev => ({ ...prev, autoPlay: checked as boolean }))
                    }
                    disabled={isLoading}
                  />
                  <Label htmlFor="autoPlay">Auto Play</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="loop"
                    name="loop"
                    checked={formData.loop}
                    onCheckedChange={(checked) => 
                      setFormData(prev => ({ ...prev, loop: checked as boolean }))
                    }
                    disabled={isLoading}
                  />
                  <Label htmlFor="loop">Loop</Label>
                </div>
              </div>

              {formData.autoPlay && (
                <div className="space-y-2">
                  <Label htmlFor="autoPlayInterval">Auto Play Interval (ms)</Label>
                  <Input
                    id="autoPlayInterval"
                    name="autoPlayInterval"
                    type="number"
                    value={formData.autoPlayInterval}
                    onChange={handleInputChange}
                    min="1000"
                    step="1000"
                    disabled={isLoading}
                  />
                </div>
              )}

              {/* Slider Items */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Slider Items</Label>
                  <Button type="button" variant="outline" size="sm" onClick={addSliderItem}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Item
                  </Button>
                </div>

                {sliderItems.map((item, index) => (
                  <Card key={index}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">Item {index + 1}</CardTitle>
                        {sliderItems.length > 1 && (
                          <Button 
                            type="button" 
                            variant="ghost" 
                            size="sm"
                            onClick={() => removeSliderItem(index)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Title *</Label>
                          <Input
                            value={item.title}
                            onChange={(e) => handleSliderItemChange(index, 'title', e.target.value)}
                            placeholder="Enter slide title"
                            required
                            disabled={isLoading}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label>Subtitle</Label>
                          <Input
                            value={item.subtitle || ''}
                            onChange={(e) => handleSliderItemChange(index, 'subtitle', e.target.value)}
                            placeholder="Enter slide subtitle"
                            disabled={isLoading}
                          />
                        </div>
                      </div>

                      {/* Media selection + preview */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Media *</Label>
                          <Select
                            value={item.mediaId || ''}
                            onValueChange={(value) => handleSliderItemChange(index, 'mediaId', value)}
                            disabled={isLoading || isLoadingMedia}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder={isLoadingMedia ? 'Loading media…' : 'Select media'} />
                            </SelectTrigger>
                            <SelectContent>
                              {mediaOptions.length === 0 ? (
                                <div className="px-3 py-2 text-sm text-muted-foreground">No media available</div>
                              ) : (
                                mediaOptions.map((m) => (
                                  <SelectItem key={m.id} value={m.id}>
                                    {m.title || (m.fileType === 'IMAGE' ? 'Image' : 'Video')}
                                  </SelectItem>
                                ))
                              )}
                            </SelectContent>
                          </Select>
                        </div>
                          <div className="space-y-2">
                            <Label>Preview</Label>
                          <div className="border rounded-md p-2 flex items-center justify-center bg-muted/30">
                            {(() => {
                              const sel = mediaOptions.find(o => o.id === item.mediaId)
                              if (!sel) {
                                return <span className="text-sm text-muted-foreground">No media selected</span>
                              }
                              if (sel.fileType === 'IMAGE') {
                                return (
                                  <div className="relative w-full aspect-video">
                                    <ImageWithFallback src={sel.fileUrl} alt={sel.title} fill className="object-cover" />
                                  </div>
                                )
                              }
                              return (
                                <div className="flex items-center gap-2 text-muted-foreground">
                                  <Video className="h-5 w-5" />
                                  <span className="text-sm truncate max-w-[16rem]">{sel.title || sel.fileUrl}</span>
                                </div>
                              )
                            })()}
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Call to Action</Label>
                          <Input
                            value={item.callToAction || ''}
                            onChange={(e) => handleSliderItemChange(index, 'callToAction', e.target.value)}
                            placeholder="Enter CTA text"
                            disabled={isLoading}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label>Call to Action URL</Label>
                          <Input
                            value={item.callToActionUrl || ''}
                            onChange={(e) => handleSliderItemChange(index, 'callToActionUrl', e.target.value)}
                            placeholder="Enter CTA URL"
                            disabled={isLoading}
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
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
                    'Create Slider'
                  )}
                </Button>
                <Button 
                  type="button" 
                  variant="outline"
                  asChild
                >
                  <Link href="/admin/sliders">Cancel</Link>
                </Button>
              </div>
            </CardContent>
          </form>
        </Card>
      </main>
    </div>
  )
}
