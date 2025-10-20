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
      } catch (e: any) { setError(e.message || 'Failed to load') } finally { setIsLoading(false) }
    }
    load()
  }, [params.id])

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault(); setSaving(true); setError('')
    try {
      const res = await fetch(`/api/sliders/${params.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(formData) })
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
        <Card className="max-w-2xl">
          <CardHeader>
            <CardTitle>Edit Slider</CardTitle>
            <CardDescription>Update slider settings</CardDescription>
          </CardHeader>
          <form onSubmit={onSubmit}>
            <CardContent className="space-y-4">
              {error && (<Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>)}
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Auto Play</Label>
                  <Select value={formData.autoPlay ? 'true' : 'false'} onValueChange={(v) => setFormData(s => ({ ...s, autoPlay: v === 'true' }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="true">Enabled</SelectItem>
                      <SelectItem value="false">Disabled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Auto Play Interval (ms)</Label>
                  <Input type="number" value={formData.autoPlayInterval} onChange={(e) => setFormData(s => ({ ...s, autoPlayInterval: Number(e.target.value) }))} min={1000} step={500} />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Loop</Label>
                <Select value={formData.loop ? 'true' : 'false'} onValueChange={(v) => setFormData(s => ({ ...s, loop: v === 'true' }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="true">Enabled</SelectItem>
                    <SelectItem value="false">Disabled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={formData.isActive ? 'active' : 'inactive'} onValueChange={(v) => setFormData(s => ({ ...s, isActive: v === 'active' }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
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

