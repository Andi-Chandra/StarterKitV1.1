"use client"

import Link from "next/link"
import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Settings, Loader2 } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useAuth, useSession } from "@/components/providers/session-provider"

export const dynamic = "force-dynamic"

type ConfigMap = Record<string, any>

export default function AdminSettingsPage() {
  const { status } = useSession()
  const { accessToken } = useAuth()
  const router = useRouter()

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [cfg, setCfg] = useState<ConfigMap>({})

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/sign-in")
    }
  }, [status, router])

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch("/api/site-config", { cache: "no-store" })
        if (!res.ok) throw new Error(`Failed to load config (${res.status})`)
        const data = await res.json()
        const map: ConfigMap = {}
        for (const it of data.items || []) {
          map[it.key] = it.value
        }
        setCfg(map)
      } catch (e: any) {
        setError(e?.message || "Failed to load configuration")
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const form = useMemo(() => ({
    siteName: cfg["site.name"] ?? "PPS Belawan",
    logoUrl: cfg["site.logo"] ?? "/logo.svg",
    heroTitle: cfg["home.hero_title"] ?? "Welcome",
    heroSubtitle: cfg["home.hero_subtitle"] ?? "Experience the Future",
    theme: cfg["ui.theme"] ?? "light",
    galleryItemsPerPage: cfg["gallery.items_per_page"] ?? 12,
    sliderAutoPlay: cfg["slider.auto_play"] ?? true,
    sliderInterval: cfg["slider.auto_play_interval"] ?? 5000,
    adminEmailNotifications: cfg["admin.email_notifications"] ?? false,
  }), [cfg])

  const [draft, setDraft] = useState(form)
  useEffect(() => setDraft(form), [form])

  const update = (k: keyof typeof form, v: any) => setDraft((d) => ({ ...d, [k]: v }))

  const onSave = async () => {
    setSaving(true)
    setError(null)
    setSuccess(null)
    try {
      const payload = {
        updates: [
          { key: "site.name", value: draft.siteName, description: "Site display name" },
          { key: "site.logo", value: draft.logoUrl, description: "Header logo URL" },
          { key: "home.hero_title", value: draft.heroTitle, description: "Home hero title" },
          { key: "home.hero_subtitle", value: draft.heroSubtitle, description: "Home hero subtitle" },
          { key: "ui.theme", value: draft.theme, description: "UI theme" },
          { key: "gallery.items_per_page", value: Number(draft.galleryItemsPerPage) || 12, description: "Gallery page size" },
          { key: "slider.auto_play", value: !!draft.sliderAutoPlay, description: "Auto-play sliders" },
          { key: "slider.auto_play_interval", value: Number(draft.sliderInterval) || 5000, description: "Slider interval (ms)" },
          { key: "admin.email_notifications", value: !!draft.adminEmailNotifications, description: "Admin email notifications" },
        ],
      }
      if (!accessToken) {
        throw new Error("Authentication required. Please sign in again.")
      }
      const res = await fetch("/api/site-config", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(payload),
      })
      if (!res.ok) {
        const t = await res.text()
        throw new Error(t || `Failed to save (${res.status})`)
      }
      setSuccess("Settings saved")
    } catch (e: any) {
      setError(e?.message || "Failed to save settings")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="min-h-[50vh] bg-background">
      <main className="container py-8 space-y-6">
        <div>
          <Button variant="ghost" asChild className="mb-4">
            <Link href="/admin">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Link>
          </Button>
          <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
            <Settings className="h-6 w-6" /> Settings
          </h1>
          <p className="text-muted-foreground">Manage site configuration and admin preferences</p>
        </div>

        {error && (
          <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>
        )}
        {success && (
          <Alert><AlertDescription>{success}</AlertDescription></Alert>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Site Information</CardTitle>
            <CardDescription>Branding and general details</CardDescription>
          </CardHeader>
          <CardContent className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="siteName">Site Name</Label>
              <Input id="siteName" value={draft.siteName} onChange={(e) => update('siteName', e.target.value)} disabled={loading || saving} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="logoUrl">Logo URL</Label>
              <Input id="logoUrl" value={draft.logoUrl} onChange={(e) => update('logoUrl', e.target.value)} disabled={loading || saving} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Home Page</CardTitle>
            <CardDescription>Hero text and presentation</CardDescription>
          </CardHeader>
          <CardContent className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="heroTitle">Hero Title</Label>
              <Input id="heroTitle" value={draft.heroTitle} onChange={(e) => update('heroTitle', e.target.value)} disabled={loading || saving} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="heroSubtitle">Hero Subtitle</Label>
              <Input id="heroSubtitle" value={draft.heroSubtitle} onChange={(e) => update('heroSubtitle', e.target.value)} disabled={loading || saving} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>User Interface</CardTitle>
            <CardDescription>Theme and content density</CardDescription>
          </CardHeader>
          <CardContent className="grid md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Theme</Label>
              <Select value={draft.theme} onValueChange={(v) => update('theme', v)}>
                <SelectTrigger disabled={loading || saving}><SelectValue placeholder="Select theme" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">Light</SelectItem>
                  <SelectItem value="dark">Dark</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="galleryItems">Gallery Items per Page</Label>
              <Input id="galleryItems" type="number" min={1} max={100} value={draft.galleryItemsPerPage} onChange={(e) => update('galleryItemsPerPage', e.target.value)} disabled={loading || saving} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sliderInterval">Slider Interval (ms)</Label>
              <Input id="sliderInterval" type="number" min={1000} step={500} value={draft.sliderInterval} onChange={(e) => update('sliderInterval', e.target.value)} disabled={loading || saving} />
            </div>
            <div className="flex items-center justify-between md:col-span-3">
              <div className="space-y-0.5">
                <Label>Slider Auto-Play</Label>
                <p className="text-xs text-muted-foreground">Automatically cycle slides</p>
              </div>
              <Switch checked={!!draft.sliderAutoPlay} onCheckedChange={(v) => update('sliderAutoPlay', v)} disabled={loading || saving} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Admin Preferences</CardTitle>
            <CardDescription>Personalize your admin experience</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Email Notifications</Label>
                <p className="text-xs text-muted-foreground">Send email alerts for key events</p>
              </div>
              <Switch checked={!!draft.adminEmailNotifications} onCheckedChange={(v) => update('adminEmailNotifications', v)} disabled={loading || saving} />
            </div>
          </CardContent>
          <CardFooter>
            <Button onClick={onSave} disabled={saving || loading}>
              {saving ? (<><Loader2 className="h-4 w-4 mr-2 animate-spin" />Saving</>) : 'Save Settings'}
            </Button>
          </CardFooter>
        </Card>
      </main>
    </div>
  )
}
