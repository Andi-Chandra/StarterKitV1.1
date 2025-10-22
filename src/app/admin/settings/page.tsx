"use client"

import Link from "next/link"
import { useSession } from "next-auth/react"
import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Settings } from "lucide-react"

export const dynamic = "force-dynamic"

export default function AdminSettingsPage() {
  const { status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/sign-in")
    }
  }, [status, router])

  return (
    <div className="min-h-[50vh] bg-background">
      <main className="container py-8">
        <div className="mb-8">
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

        <Card>
          <CardHeader>
            <CardTitle>Coming Soon</CardTitle>
            <CardDescription>Settings UI is not implemented yet.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              This is a placeholder to avoid 404s. If you want, I can scaffold
              sections for general, media, and authentication settings next.
            </p>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}

