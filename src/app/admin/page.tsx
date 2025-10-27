'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth, useSession } from '@/components/providers/session-provider'
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
  Sparkles,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface DashboardStats {
  totalMedia: number
  totalCategories: number
  totalSliders: number
  totalUsers: number
}

export default function AdminDashboard() {
  const router = useRouter()
  const { status, data: session } = useSession()
  const { accessToken } = useAuth()
  const [stats, setStats] = useState<DashboardStats>({
    totalMedia: 0,
    totalCategories: 0,
    totalSliders: 0,
    totalUsers: 0,
  })
  const [isLoading, setIsLoading] = useState(true)

  const fetchStats = async (token: string): Promise<DashboardStats> => {
    const response = await fetch('/api/admin/stats', {
      cache: 'no-store',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    if (response.status === 401) {
      const error = new Error('unauthorized')
      ;(error as any).status = 401
      throw error
    }
    if (!response.ok) {
      throw new Error(`Failed to load stats: ${response.status}`)
    }

    const data = await response.json().catch(() => null)
    return {
      totalMedia: data?.mediaCount ?? 0,
      totalCategories: data?.categoryCount ?? 0,
      totalSliders: data?.sliderCount ?? 0,
      totalUsers: data?.userCount ?? 0,
    }
  }

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/sign-in')
      return
    }

    if (status === 'authenticated') {
      if (!accessToken) {
        return
      }
      let cancelled = false
      setIsLoading(true)

      fetchStats(accessToken)
        .then((data) => {
          if (!cancelled) {
            setStats(data)
            setIsLoading(false)
          }
        })
        .catch((error) => {
          console.error('Failed to fetch dashboard stats:', error)
          if (!cancelled) {
            if ((error as any)?.status === 401 || error?.message === 'unauthorized') {
              router.push('/sign-in')
            } else {
              setStats({
                totalMedia: 0,
                totalCategories: 0,
                totalSliders: 0,
                totalUsers: 0,
              })
              setIsLoading(false)
            }
          }
        })

      return () => {
        cancelled = true
      }
    }
  }, [router, status, accessToken])

  if (isLoading) {
    return (
      <div className="min-h-[50vh] bg-background">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-b-2 border-primary" />
            <p>Loading admin dashboard...</p>
          </div>
        </div>
      </div>
    )
  }

  const sections = [
    {
      title: 'Media Items',
      value: `${stats.totalMedia} items`,
      icon: Image,
      manageHref: '/admin/media',
      addHref: '/admin/media/new',
    },
    {
      title: 'Categories',
      value: `${stats.totalCategories} categories`,
      icon: FolderOpen,
      manageHref: '/admin/categories',
      addHref: '/admin/categories/new',
    },
    {
      title: 'Sliders',
      value: `${stats.totalSliders} sliders`,
      icon: BarChart3,
      manageHref: '/admin/sliders',
      addHref: '/admin/sliders/new',
    },
  ] as const

  return (
    <div className="space-y-8">
      <Card className="relative overflow-hidden border-none bg-gradient-to-br from-primary/15 via-primary/10 to-transparent shadow-sm">
        <div className="absolute inset-y-0 right-0 w-1/2 bg-[radial-gradient(circle_at_top,_theme(colors.primary/20),_transparent_70%)]" />
        <CardHeader className="relative flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="space-y-2">
            <Badge className="w-fit bg-primary/20 text-primary">Overview</Badge>
            <CardTitle className="text-2xl font-semibold md:text-3xl">
              Welcome back{session?.user?.email ? `, ${session.user.email}` : ''}!
            </CardTitle>
            <CardDescription className="max-w-xl text-base text-muted-foreground">
              Monitor performance, curate fresh content, and keep your experience polished from a single place.
            </CardDescription>
          </div>
          <div className="flex w-full flex-col gap-3 md:w-auto md:items-end">
            <Button asChild size="lg" className="shadow-md">
              <Link href="/admin/media/new">
                <Sparkles className="mr-2 h-4 w-4" /> Create something new
              </Link>
            </Button>
            <p className="text-xs text-muted-foreground">Tip: refresh metrics after major content changes.</p>
          </div>
        </CardHeader>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: 'Total Media', value: stats.totalMedia, icon: Image, helper: 'Published assets' },
          { label: 'Categories', value: stats.totalCategories, icon: FolderOpen, helper: 'Organised collections' },
          { label: 'Sliders', value: stats.totalSliders, icon: BarChart3, helper: 'Live experiences' },
          { label: 'Users', value: stats.totalUsers, icon: Users, helper: 'Team members' },
        ].map((card) => (
          <Card
            key={card.label}
            className="border border-border/60 shadow-sm transition-colors hover:border-primary/40"
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{card.label}</CardTitle>
              <card.icon className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-semibold tracking-tight">{card.value}</div>
              <p className="text-xs text-muted-foreground">{card.helper}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <Card className="border border-border/60 shadow-sm">
          <CardHeader>
            <CardTitle>Content Management</CardTitle>
            <CardDescription>Shortcuts for the areas you touch most.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {sections.map((section) => (
              <div
                key={section.title}
                className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-dashed border-border/60 bg-background/80 p-4 transition-colors hover:border-primary/40"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <section.icon className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="font-medium">{section.title}</h3>
                    <p className="text-sm text-muted-foreground">{section.value}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" asChild>
                    <Link href={section.manageHref}>
                      <Edit className="mr-1 h-4 w-4" /> Manage
                    </Link>
                  </Button>
                  <Button size="sm" asChild>
                    <Link href={section.addHref}>
                      <Plus className="mr-1 h-4 w-4" /> Add
                    </Link>
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="border border-border/60 shadow-sm">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Jump straight into creation or maintenance.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              { href: '/admin/media/new', label: 'Upload New Media', icon: Plus },
              { href: '/admin/categories/new', label: 'Create Category', icon: FolderOpen },
              { href: '/admin/sliders/new', label: 'Build a Slider', icon: BarChart3 },
              { href: '/admin/settings', label: 'System Settings', icon: Settings },
            ].map((action) => (
              <Button
                key={action.href}
                variant="outline"
                className={cn(
                  'w-full justify-start gap-2 border-border/60 text-left',
                  'bg-background/80 transition hover:border-primary/40 hover:bg-primary/5'
                )}
                asChild
              >
                <Link href={action.href}>
                  <action.icon className="h-4 w-4" />
                  <span>{action.label}</span>
                </Link>
              </Button>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
