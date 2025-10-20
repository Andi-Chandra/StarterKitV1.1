'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'

export default function EditMediaPage() {
  const router = useRouter()
  const params = useParams<{ id: string }>()
  const { status } = useSession()
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([])
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    fileUrl: '',
    fileType: 'IMAGE' as 'IMAGE' | 'VIDEO',
    categoryId: '',
    isFeatured: false,
  })

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/sign-in')
  }, [status, router])

  useEffect(() => {
    async function load() {
      try {
        const [mediaRes, catRes] = await Promise.all([
          fetch(`/api/media/${params.id}`),
          fetch('/api/media/categories'),
        ])
        if (!mediaRes.ok) throw new Error('Failed to load media')
        const mediaData = await mediaRes.json()
        const m = mediaData.mediaItem
        setFormData({
          title: m.title || '',
          description: m.description || '',
          fileUrl: m.fileUrl,
          fileType: m.fileType,
          categoryId: m.categoryId || '',
          isFeatured: m.isFeatured || false,
        })
        if (catRes.ok) {
          const catData = await catRes.json()
          setCategories((catData.categories || []).map((c: any) => ({ id: c.id, name: c.name })))
        }
      } catch (e: any) {
        setError(e.message || 'Failed to load')
      } finally {
        setIsLoading(false)
      }
    }
    load()
  }, [params.id])

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      const res = await fetch(`/api/media/${params.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.message || 'Update failed')
      }
      router.push('/admin/media')
    } catch (e: any) {
      setError(e.message || 'Update failed')
    } finally {
      setSaving(false)
    }
  }

  if (isLoading) {
    return <div className="p-6">Loading...</div>
  }

  return (
    <div className="min-h-[50vh] bg-background">
      <main className="container py-6">
        <div className="mb-6">
          <Button variant="outline" asChild>
            <Link href="/admin/media">Back</Link>
          </Button>
        </div>
        <Card className="max-w-2xl">
          <CardHeader>
            <CardTitle>Edit Media</CardTitle>
            <CardDescription>Update media details</CardDescription>
          </CardHeader>
          <form onSubmit={onSubmit}>
            <CardContent className="space-y-4">
              {error && (
                <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>
              )}
              <div className="space-y-2">
                <Label>Title</Label>
                <Input value={formData.title} onChange={(e) => setFormData(s => ({ ...s, title: e.target.value }))} required />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea value={formData.description} onChange={(e) => setFormData(s => ({ ...s, description: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>File URL</Label>
                <Input value={formData.fileUrl} onChange={(e) => setFormData(s => ({ ...s, fileUrl: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>File Type</Label>
                <Select value={formData.fileType} onValueChange={(v) => setFormData(s => ({ ...s, fileType: v as 'IMAGE' | 'VIDEO' }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="IMAGE">Image</SelectItem>
                    <SelectItem value="VIDEO">Video</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Category</Label>
                <Select value={formData.categoryId || 'none'} onValueChange={(v) => setFormData(s => ({ ...s, categoryId: v === 'none' ? '' : v }))}>
                  <SelectTrigger><SelectValue placeholder="Select a category" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No category</SelectItem>
                    {categories.map(c => (
                      <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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

