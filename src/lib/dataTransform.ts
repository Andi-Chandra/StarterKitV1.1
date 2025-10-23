import { Slider } from '@/hooks/useMedia'

export interface ImageSlideData {
  id: string
  title: string
  subtitle?: string
  imageUrl: string
  callToAction?: string
  callToActionUrl?: string
}

export interface VideoSlideData {
  id: string
  title: string
  subtitle?: string
  videoUrl: string
  thumbnailUrl: string
  callToAction?: string
  callToActionUrl?: string
}

export function transformImageSliders(sliders: Slider[]): ImageSlideData[] {
  // Prefer the first active IMAGE slider that actually has items
  const imageSlider = sliders.find(slider => slider.type === 'IMAGE' && slider.isActive && slider.items.length > 0)

  if (!imageSlider) {
    // Return fallback data
    return [
      {
        id: '1',
        title: 'Welcome to Our Modern Web App',
        subtitle: 'Experience the Future',
        imageUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1920&h=1080&fit=crop',
        callToAction: 'Get Started',
        callToActionUrl: '#features'
      }
    ]
  }

  return imageSlider.items.map(item => ({
    id: item.id,
    title: item.title || 'Welcome',
    subtitle: item.subtitle,
    imageUrl: item.media.fileUrl,
    callToAction: item.callToAction,
    callToActionUrl: item.callToActionUrl
  }))
}

export function transformVideoSliders(sliders: Slider[]): VideoSlideData[] {
  const videoSlider = sliders.find(slider => slider.type === 'VIDEO' && slider.isActive && slider.items.length > 0)

  if (!videoSlider) {
    // Return fallback data
    return [
      {
        id: '1',
        title: 'Product Demo Video',
        subtitle: 'See It In Action',
        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
        thumbnailUrl: 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=1920&h=1080&fit=crop',
        callToAction: 'Learn More',
        callToActionUrl: '#'
      }
    ]
  }

  return videoSlider.items.map(item => ({
    id: item.id,
    title: item.title || 'Video',
    subtitle: item.subtitle,
    videoUrl: item.media.fileUrl,
    thumbnailUrl: item.media.fileUrl, // For videos, we use the same URL as thumbnail
    callToAction: item.callToAction,
    callToActionUrl: item.callToActionUrl
  }))
}
