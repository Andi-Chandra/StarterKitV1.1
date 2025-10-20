'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  BarChart3, 
  Image, 
  Settings, 
  Users, 
  FolderOpen,
  Plus,
  Edit,
} from 'lucide-react'

interface DashboardStats {
  totalMedia: number
  totalCategories: number
  totalSliders: number
  totalUsers: number
}

export default function AdminDashboard() {
  const router = useRouter()
  const { status } = useSession()
  const [stats, setStats] = useState<DashboardStats>({
    totalMedia: 0,
    totalCategories: 0,
    totalSliders: 0,
    totalUsers: 0
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/sign-in')
      return
    }

    if (status === 'authenticated') {
      const timer = setTimeout(() => {
        setStats({ totalMedia: 24, totalCategories: 6, totalSliders: 3, totalUsers: 12 })
        setIsLoading(false)
      }, 500)
      return () => clearTimeout(timer)
    }
  }, [router, status])

  if (isLoading) {
    return (
      <div className="min-h-[50vh] bg-background">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p>Loading admin dashboard...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container py-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
          <p className="text-muted-foreground">Manage your application content and settings</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Media</CardTitle>
            <Image className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalMedia}</div>
            <p className="text-xs text-muted-foreground">Images and videos</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Categories</CardTitle>
            <FolderOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalCategories}</div>
            <p className="text-xs text-muted-foreground">Content categories</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sliders</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalSliders}</div>
            <p className="text-xs text-muted-foreground">Active sliders</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers}</div>
            <p className="text-xs text-muted-foreground">Registered users</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Content Management</CardTitle>
            <CardDescription>Manage your media content and categories</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Image className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-medium">Media Items</h3>
                  <p className="text-sm text-muted-foreground">{stats.totalMedia} items</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" asChild>
                  <Link href="/admin/media">
                    <Edit className="h-4 w-4 mr-1" /> Manage
                  </Link>
                </Button>
                <Button size="sm" asChild>
                  <Link href="/admin/media/new">
                    <Plus className="h-4 w-4 mr-1" /> Add
                  </Link>
                </Button>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <FolderOpen className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-medium">Categories</h3>
                  <p className="text-sm text-muted-foreground">{stats.totalCategories} categories</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" asChild>
                  <Link href="/admin/categories">
                    <Edit className="h-4 w-4 mr-1" /> Manage
                  </Link>
                </Button>
                <Button size="sm" asChild>
                  <Link href="/admin/categories/new">
                    <Plus className="h-4 w-4 mr-1" /> Add
                  </Link>
                </Button>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <BarChart3 className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-medium">Sliders</h3>
                  <p className="text-sm text-muted-foreground">{stats.totalSliders} sliders</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" asChild>
                  <Link href="/admin/sliders">
                    <Edit className="h-4 w-4 mr-1" /> Manage
                  </Link>
                </Button>
                <Button size="sm" asChild>
                  <Link href="/admin/sliders/new">
                    <Plus className="h-4 w-4 mr-1" /> Add
                  </Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common administrative tasks</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button variant="outline" className="w-full justify-start gap-2" asChild>
              <Link href="/admin/media/new">
                <Plus className="h-4 w-4" /> Upload New Media
              </Link>
            </Button>
            <Button variant="outline" className="w-full justify-start gap-2" asChild>
              <Link href="/admin/categories/new">
                <FolderOpen className="h-4 w-4" /> Create Category
              </Link>
            </Button>
            <Button variant="outline" className="w-full justify-start gap-2" asChild>
              <Link href="/admin/sliders/new">
                <BarChart3 className="h-4 w-4" /> Create Slider
              </Link>
            </Button>
            <Button variant="outline" className="w-full justify-start gap-2" asChild>
              <Link href="/admin/settings">
                <Settings className="h-4 w-4" /> Settings
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

