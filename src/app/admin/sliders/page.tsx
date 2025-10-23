'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Plus, 
  Edit, 
  Trash2, 
  Play,
  Pause,
  BarChart3,
  Image as ImageIcon,
  Video
} from 'lucide-react'

interface Slider {
  id: string
  name: string
  type: 'IMAGE' | 'VIDEO'
  isActive: boolean
  autoPlay: boolean
  autoPlayInterval: number
  loop: boolean
  createdAt: string
  items: SliderItem[]
}

interface SliderItem {
  id: string
  title: string
  subtitle?: string
  callToAction?: string
  callToActionUrl?: string
  sortOrder: number
}

export default function AdminSlidersPage() {
  const router = useRouter()
  const { status } = useSession()
  const [sliders, setSliders] = useState<Slider[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/sign-in')
      return
    }
    if (status === 'authenticated') {
      fetchSliders()
    }
  }, [router, status])

  const fetchSliders = async () => {
    try {
      const response = await fetch('/api/sliders')
      if (response.ok) {
        const data = await response.json()
        setSliders(data.sliders || [])
      }
    } catch (error) {
      console.error('Failed to fetch sliders:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleToggleActive = async (id: string, isActive: boolean) => {
    try {
      const response = await fetch(`/api/sliders/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isActive: !isActive })
      })

      if (response.ok) {
        setSliders(prev => prev.map(slider => 
          slider.id === id ? { ...slider, isActive: !isActive } : slider
        ))
      } else {
        alert('Failed to update slider')
      }
    } catch (error) {
      console.error('Failed to update slider:', error)
      alert('Failed to update slider')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this slider?')) return

    try {
      const response = await fetch(`/api/sliders/${id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        setSliders(prev => prev.filter(slider => slider.id !== id))
      } else {
        alert('Failed to delete slider')
      }
    } catch (error) {
      console.error('Failed to delete slider:', error)
      alert('Failed to delete slider')
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-[50vh] bg-background">
        <div className="container py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p>Loading sliders...</p>
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
            <h1 className="text-3xl font-bold mb-2">Slider Management</h1>
            <p className="text-muted-foreground">Manage your image and video sliders</p>
          </div>
          <Button asChild>
            <Link href="/admin/sliders/new">
              <Plus className="h-4 w-4 mr-2" />
              Add Slider
            </Link>
          </Button>
        </div>

        {/* Sliders Grid */}
        {sliders.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No sliders found</h3>
              <p className="text-muted-foreground mb-4">
                Get started by creating your first slider
              </p>
              <Button asChild>
                <Link href="/admin/sliders/new">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Slider
                </Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {sliders.map((slider) => (
              <Card key={slider.id} className="group hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        {slider.type === 'IMAGE' ? (
                          <ImageIcon className="h-5 w-5 text-primary" />
                        ) : (
                          <Video className="h-5 w-5 text-primary" />
                        )}
                      </div>
                      <div>
                        <CardTitle className="text-lg">{slider.name}</CardTitle>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant={slider.isActive ? 'default' : 'secondary'}>
                            {slider.isActive ? 'Active' : 'Inactive'}
                          </Badge>
                          <Badge variant="outline">
                            {slider.type}
                          </Badge>
                          <Badge variant="outline">
                            {slider.items.length} {slider.items.length === 1 ? 'item' : 'items'}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button 
                        size="sm" 
                        variant="ghost"
                        onClick={() => handleToggleActive(slider.id, slider.isActive)}
                      >
                        {slider.isActive ? (
                          <Pause className="h-4 w-4" />
                        ) : (
                          <Play className="h-4 w-4" />
                        )}
                      </Button>
                      <Button size="sm" variant="ghost" asChild>
                        <Link href={`/admin/sliders/${slider.id}/edit`}>
                          <Edit className="h-4 w-4" />
                        </Link>
                      </Button>
                      <Button 
                        size="sm" 
                        variant="ghost"
                        onClick={() => handleDelete(slider.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Auto Play</span>
                      <span>{slider.autoPlay ? `${slider.autoPlayInterval}ms` : 'Disabled'}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Loop</span>
                      <span>{slider.loop ? 'Enabled' : 'Disabled'}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Created</span>
                      <span>{new Date(slider.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
