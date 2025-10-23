'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Checkbox } from '@/components/ui/checkbox'
import { Plus, Trash2, Video } from 'lucide-react'
import { ImageWithFallback } from '@/components/ui/ImageWithFallback'

export default function EditSliderPage() {
  const router = useRouter()
  const params = useParams<{ id: string }>()
  const { status } = useSession()
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    type: 'IMAGE' as 'IMAGE' | 'VIDEO',
    isActive: true,
    autoPlay: true,
    autoPlayInterval: 5000,
    loop: true,
  })
  type EditableItem = {
    title: string
    subtitle?: string
    callToAction?: string
    callToActionUrl?: string
    mediaId?: string
  }
  const [sliderItems, setSliderItems] = useState<EditableItem[]>([])
  const [mediaOptions, setMediaOptions] = useState<Array<{ id: string; title: string; fileUrl: string; fileType: 'IMAGE' | 'VIDEO' }>>([])
  const [isLoadingMedia, setIsLoadingMedia] = useState(false)

  useEffect(() => { if (status === 'unauthenticated') router.push('/sign-in') }, [status, router])

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/sliders/${params.id}`)
        if (!res.ok) throw new Error('Failed to load slider')
        const data = await res.json()
        const s = data.slider
        setFormData({
          name: s.name || '',
          type: s.type,
          isActive: s.isActive,
          autoPlay: s.autoPlay,
          autoPlayInterval: s.autoPlayInterval,
          loop: s.loop,
        })
        // Pre-fill items from existing slider
        const existing = Array.isArray(s.items) ? s.items : []
        setSliderItems(existing.map((it: any) => ({
          title: it.title || '',
          subtitle: it.subtitle || '',
          callToAction: it.callToAction || '',
          callToActionUrl: it.callToActionUrl || '',
          mediaId: it.media?.id || it.mediaId || ''
        })))
      } catch (e: any) { setError(e.message || 'Failed to load') } finally { setIsLoading(false) }
    }
    load()
  }, [params.id])

  // Load media options per type
  useEffect(() => {
    async function fetchMedia() {
      try {
        setIsLoadingMedia(true)
        const res = await fetch(`/api/media?limit=100&type=${formData.type}`)
        if (!res.ok) { setMediaOptions([]); return }
        const data = await res.json()
        const items: any[] = data.mediaItems || []
        const options = items
          .filter((m) => m.fileType === formData.type)
          .map((m) => ({ id: m.id, title: m.title, fileUrl: m.fileUrl, fileType: m.fileType }))
        setMediaOptions(options)
        // Drop any selected media that no longer matches type
        setSliderItems(prev => prev.map(it => ({ ...it, mediaId: options.find(o => o.id === it.mediaId) ? it.mediaId : '' })))
      } finally {
        setIsLoadingMedia(false)
      }
    }
    fetchMedia()
  }, [formData.type])

  const addSliderItem = () => setSliderItems(prev => [...prev, { title: '', subtitle: '', callToAction: '', callToActionUrl: '', mediaId: '' }])
  const removeSliderItem = (index: number) => setSliderItems(prev => prev.filter((_, i) => i !== index))

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault(); setSaving(true); setError('')
    try {
      // Basic validation for items if present
      if (sliderItems.length === 0) {
        setError('Please add at least one slide item'); setSaving(false); return
      }
      if (sliderItems.some(it => !it.title)) { setError('All items must have a title'); setSaving(false); return }
      if (sliderItems.some(it => !it.mediaId)) { setError('Each item must select a media'); setSaving(false); return }

      const res = await fetch(`/api/sliders/${params.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          items: sliderItems.map((it, idx) => ({
            title: it.title,
            subtitle: it.subtitle,
            callToAction: it.callToAction,
            callToActionUrl: it.callToActionUrl,
            mediaId: it.mediaId!,
            sortOrder: idx,
          }))
        })
      })
      if (!res.ok) { const err = await res.json().catch(() => ({})); throw new Error(err.message || 'Update failed') }
      router.push('/admin/sliders')
    } catch (e: any) { setError(e.message || 'Update failed') } finally { setSaving(false) }
  }

  if (isLoading) return <div className="p-6">Loading...</div>

  return (
    <div className="min-h-[50vh] bg-background">
      <main className="container py-6">
        <div className="mb-6">
          <Button variant="outline" asChild><Link href="/admin/sliders">Back</Link></Button>
        </div>
        <Card className="max-w-4xl mx-auto">
          <CardHeader>
            <CardTitle>Edit Slider</CardTitle>
            <CardDescription>Update slider settings</CardDescription>
          </CardHeader>
          <form onSubmit={onSubmit}>
            <CardContent className="space-y-6">
              {error && (<Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>)}
              {/* Basic Settings */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Name</Label>
                  <Input value={formData.name} onChange={(e) => setFormData(s => ({ ...s, name: e.target.value }))} required />
                </div>
                <div className="space-y-2">
                  <Label>Type</Label>
                  <Select value={formData.type} onValueChange={(v) => setFormData(s => ({ ...s, type: v as 'IMAGE' | 'VIDEO' }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="IMAGE">Image</SelectItem>
                      <SelectItem value="VIDEO">Video</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Slider Settings */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center space-x-2">
                  <Checkbox id="isActive" checked={formData.isActive} onCheckedChange={(c) => setFormData(s => ({ ...s, isActive: !!c }))} />
                  <Label htmlFor="isActive">Active</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="autoPlay" checked={formData.autoPlay} onCheckedChange={(c) => setFormData(s => ({ ...s, autoPlay: !!c }))} />
                  <Label htmlFor="autoPlay">Auto Play</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="loop" checked={formData.loop} onCheckedChange={(c) => setFormData(s => ({ ...s, loop: !!c }))} />
                  <Label htmlFor="loop">Loop</Label>
                </div>
              </div>

              {formData.autoPlay && (
                <div className="space-y-2">
                  <Label>Auto Play Interval (ms)</Label>
                  <Input type="number" value={formData.autoPlayInterval} onChange={(e) => setFormData(s => ({ ...s, autoPlayInterval: Number(e.target.value) }))} min={1000} step={500} />
                </div>
              )}

              {/* Slider Items */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Slider Items</Label>
                  <Button type="button" variant="outline" size="sm" onClick={addSliderItem}>
                    <Plus className="h-4 w-4 mr-2" /> Add Item
                  </Button>
                </div>

                {sliderItems.map((item, index) => (
                  <Card key={index}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">Item {index + 1}</CardTitle>
                        {sliderItems.length > 1 && (
                          <Button type="button" variant="ghost" size="sm" onClick={() => removeSliderItem(index)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Title *</Label>
                          <Input value={item.title} onChange={(e) => setSliderItems(prev => { const u=[...prev]; u[index] = { ...u[index], title: e.target.value }; return u })} />
                        </div>
                        <div className="space-y-2">
                          <Label>Subtitle</Label>
                          <Input value={item.subtitle || ''} onChange={(e) => setSliderItems(prev => { const u=[...prev]; u[index] = { ...u[index], subtitle: e.target.value }; return u })} />
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Media *</Label>
                          <Select
                            value={item.mediaId || ''}
                            onValueChange={(v) => setSliderItems(prev => { const u=[...prev]; u[index] = { ...u[index], mediaId: v }; return u })}
                            disabled={isLoadingMedia}
                          >
                            <SelectTrigger><SelectValue placeholder={isLoadingMedia ? 'Loading…' : 'Select media'} /></SelectTrigger>
                            <SelectContent>
                              {mediaOptions.length === 0 ? (
                                <div className="px-3 py-2 text-sm text-muted-foreground">No media available</div>
                              ) : (
                                mediaOptions.map((m) => (
                                  <SelectItem key={m.id} value={m.id}>{m.title || (m.fileType === 'IMAGE' ? 'Image' : 'Video')}</SelectItem>
                                ))
                              )}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label>Preview</Label>
                          <div className="border rounded-md p-2 h-40 flex items-center justify-center bg-muted/30">
                            {(() => {
                              const sel = mediaOptions.find(o => o.id === item.mediaId)
                              if (!sel) return <span className="text-sm text-muted-foreground">No media selected</span>
                              if (sel.fileType === 'IMAGE') {
                                return <div className="relative w-full h-36"><ImageWithFallback src={sel.fileUrl} alt={sel.title} fill className="object-contain" /></div>
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
                          <Input value={item.callToAction || ''} onChange={(e) => setSliderItems(prev => { const u=[...prev]; u[index] = { ...u[index], callToAction: e.target.value }; return u })} />
                        </div>
                        <div className="space-y-2">
                          <Label>Call to Action URL</Label>
                          <Input value={item.callToActionUrl || ''} onChange={(e) => setSliderItems(prev => { const u=[...prev]; u[index] = { ...u[index], callToActionUrl: e.target.value }; return u })} />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
              <div>
                <Button type="submit" disabled={saving}>{saving ? 'Saving...' : 'Save Changes'}</Button>
              </div>
            </CardContent>
          </form>
        </Card>
      </main>
    </div>
  )
}
