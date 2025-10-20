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
import { Alert, AlertDescription } from '@/components/ui/alert'

export default function EditCategoryPage() {
  const router = useRouter()
  const params = useParams<{ id: string }>()
  const { status } = useSession()
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({ name: '', slug: '', description: '' })

  useEffect(() => { if (status === 'unauthenticated') router.push('/sign-in') }, [status, router])

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/media/categories/${params.id}`)
        if (!res.ok) throw new Error('Failed to load category')
        const data = await res.json()
        const c = data.category
        setFormData({ name: c.name || '', slug: c.slug || '', description: c.description || '' })
      } catch (e: any) { setError(e.message || 'Failed to load') } finally { setIsLoading(false) }
    }
    load()
  }, [params.id])

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault(); setSaving(true); setError('')
    try {
      const res = await fetch(`/api/media/categories/${params.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(formData) })
      if (!res.ok) { const err = await res.json().catch(() => ({})); throw new Error(err.message || 'Update failed') }
      router.push('/admin/categories')
    } catch (e: any) { setError(e.message || 'Update failed') } finally { setSaving(false) }
  }

  if (isLoading) return <div className="p-6">Loading...</div>

  return (
    <div className="min-h-[50vh] bg-background">
      <main className="container py-6">
        <div className="mb-6">
          <Button variant="outline" asChild><Link href="/admin/categories">Back</Link></Button>
        </div>
        <Card className="max-w-2xl">
          <CardHeader>
            <CardTitle>Edit Category</CardTitle>
            <CardDescription>Update category details</CardDescription>
          </CardHeader>
          <form onSubmit={onSubmit}>
            <CardContent className="space-y-4">
              {error && (<Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>)}
              <div className="space-y-2">
                <Label>Name</Label>
                <Input value={formData.name} onChange={(e) => setFormData(s => ({ ...s, name: e.target.value }))} required />
              </div>
              <div className="space-y-2">
                <Label>Slug</Label>
                <Input value={formData.slug} onChange={(e) => setFormData(s => ({ ...s, slug: e.target.value }))} required />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea value={formData.description} onChange={(e) => setFormData(s => ({ ...s, description: e.target.value }))} />
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

