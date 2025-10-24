'use client'

import { useState, useEffect } from 'react'

interface MediaItem {
  id: string
  title: string
  description?: string
  fileUrl: string
  fileType: 'IMAGE' | 'VIDEO'
  category?: {
    id: string
    name: string
    slug: string
  }
  isFeatured: boolean
  createdAt: string
}

interface MediaCategory {
  id: string
  name: string
  slug: string
  description?: string
  _count?: {
    mediaItems: number
  }
}

export interface Slider {
  id: string
  name: string
  type: 'IMAGE' | 'VIDEO' | 'MIXED'
  isActive: boolean
  autoPlay: boolean
  autoPlayInterval: number
  loop: boolean
  items: SliderItem[]
}

interface SliderItem {
  id: string
  title?: string
  subtitle?: string
  callToAction?: string
  callToActionUrl?: string
  sortOrder: number
  media: MediaItem
}

interface NavigationLink {
  id: string
  title: string
  url: string
  isExternal: boolean
  children?: NavigationLink[]
}

export function useMedia() {
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([])
  const [categories, setCategories] = useState<MediaCategory[]>([])
  const [sliders, setSliders] = useState<Slider[]>([])
  const [navigationLinks, setNavigationLinks] = useState<NavigationLink[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [errorCode, setErrorCode] = useState<string | null>(null)

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true)
        setError(null)

        // Fetch media items and categories
        const mediaResponse = await fetch('/api/media?limit=20')
        if (!mediaResponse.ok) {
          try {
            const err = await mediaResponse.json()
            const message = err?.message || 'Failed to fetch media'
            const code = err?.code || err?.error || null
            setError(message + (code ? ` (${code})` : ''))
            if (code) setErrorCode(code)
          } catch {
            setError('Failed to fetch media')
          }
          return
        }
        const mediaData = await mediaResponse.json()
        
        setMediaItems(mediaData.mediaItems || [])
        setCategories(mediaData.categories || [])

        // Fetch sliders
        const slidersResponse = await fetch('/api/sliders?active=true')
        if (!slidersResponse.ok) {
          try {
            const err = await slidersResponse.json()
            const message = err?.message || 'Failed to fetch sliders'
            const code = err?.code || err?.error || null
            setError(message + (code ? ` (${code})` : ''))
            if (code) setErrorCode(code)
          } catch {
            setError('Failed to fetch sliders')
          }
          return
        }
        const slidersData = await slidersResponse.json()
        
        setSliders(slidersData.sliders || [])

        // For now, use mock navigation data since we don't have API for it yet
        setNavigationLinks([
          {
            id: '1',
            title: 'Home',
            url: '/',
            isExternal: false
          },
          {
            id: '2',
            title: 'Gallery',
            url: '/#gallery',
            isExternal: false
          },
          {
            id: '3',
            title: 'Videos',
            url: '/#videos',
            isExternal: false
          },
          {
            id: '4',
            title: 'Services',
            url: '#services',
            isExternal: false,
            children: [
              { id: '4-1', title: 'VTC KKP', url: '/vtc-kkp', isExternal: false },
              { id: '4-2', title: 'Dashboard PNBP Pasca', url: '/dashboard-pnbp-pasca', isExternal: false }
            ]
          },
          {
            id: '5',
            title: 'About',
            url: '#about',
            isExternal: false,
            children: [
              { id: '5-1', title: 'Our Story', url: '#story', isExternal: false },
              { id: '5-2', title: 'Team', url: '#team', isExternal: false },
              { id: '5-3', title: 'Careers', url: '#careers', isExternal: false }
            ]
          },
          {
            id: '6',
            title: 'Contact',
            url: '#contact',
            isExternal: false
          }
        ])

      } catch (err) {
        const message = err instanceof Error ? err.message : 'An error occurred'
        setError(message)
        console.error('Error fetching data:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  return {
    mediaItems,
    categories,
    sliders,
    navigationLinks,
    loading,
    error,
    errorCode
  }
}
