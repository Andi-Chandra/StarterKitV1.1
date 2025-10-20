'use client'

import Link from 'next/link'
import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { 
  Facebook, 
  Twitter, 
  Instagram, 
  Linkedin, 
  Github, 
  Youtube,
  Mail,
  Phone,
  MapPin
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

interface SocialMediaLink {
  id: string
  platform: string
  url: string
  iconName: string
  isActive: boolean
}

interface FooterLink {
  title: string
  links: {
    title: string
    url: string
  }[]
}

interface FooterProps {
  companyInfo?: {
    name: string
    description: string
    email: string
    phone: string
    address: string
  }
  footerLinks?: FooterLink[]
  socialLinks?: SocialMediaLink[]
  companyName?: string
}

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  facebook: Facebook,
  twitter: Twitter,
  instagram: Instagram,
  linkedin: Linkedin,
  github: Github,
  youtube: Youtube,
  email: Mail,
  phone: Phone,
  location: MapPin,
}

export function Footer({
  companyInfo = {
    name: 'PPS Belawan',
    description: 'Pangkalan Pendaratan Ikan Belawan',
    email: 'info@example.com',
    phone: '+62',
    address: 'Belawan, Sumatera Utara'
  },
  footerLinks = [
    {
      title: 'Product',
      links: [
        { title: 'Features', url: '/features' },
        { title: 'Pricing', url: '/pricing' },
        { title: 'Gallery', url: '/gallery' },
        { title: 'Testimonials', url: '/testimonials' }
      ]
    },
    {
      title: 'Company',
      links: [
        { title: 'About', url: '/about' },
        { title: 'Blog', url: '/blog' },
        { title: 'Careers', url: '/careers' },
        { title: 'Contact', url: '/contact' }
      ]
    },
    {
      title: 'Support',
      links: [
        { title: 'Help Center', url: '/help' },
        { title: 'Documentation', url: '/docs' },
        { title: 'Community', url: '/community' },
        { title: 'Status', url: '/status' }
      ]
    },
    {
      title: 'Legal',
      links: [
        { title: 'Privacy Policy', url: '/privacy' },
        { title: 'Terms of Service', url: '/terms' },
        { title: 'Cookie Policy', url: '/cookies' },
        { title: 'GDPR', url: '/gdpr' }
      ]
    }
  ],
  socialLinks = [
    { id: '1', platform: 'facebook', url: '#', iconName: 'facebook', isActive: true },
    { id: '2', platform: 'twitter', url: '#', iconName: 'twitter', isActive: true },
    { id: '3', platform: 'instagram', url: '#', iconName: 'instagram', isActive: true },
    { id: '4', platform: 'linkedin', url: '#', iconName: 'linkedin', isActive: true },
    { id: '5', platform: 'github', url: '#', iconName: 'github', isActive: true },
  ],
  companyName = 'PPS Belawan'
}: FooterProps) {
  const [email, setEmail] = useState('')
  const { status } = useSession()

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle newsletter subscription
    console.log('Subscribing email:', email)
    setEmail('')
  }

  return (
    <footer className="bg-muted/50 border-t">
      <div className="container py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Company Info */}
          <div className="lg:col-span-2">
            <Link href="/" className="inline-block mb-4">
              <h3 className="text-xl font-bold">{companyInfo.name}</h3>
            </Link>
            <p className="text-muted-foreground mb-6 max-w-md">
              {companyInfo.description}
            </p>
            
            {/* Contact Info */}
            <div className="space-y-2 mb-6">
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <Mail className="h-4 w-4" />
                <span>{companyInfo.email}</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <Phone className="h-4 w-4" />
                <span>{companyInfo.phone}</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4" />
                <span>{companyInfo.address}</span>
              </div>
            </div>

            {/* Social Media Links (hidden when not explicitly unauthenticated) */}
            {status === 'unauthenticated' && (
              <div className="flex space-x-2">
                {socialLinks
                  .filter(link => link.isActive)
                  .map((socialLink) => {
                    const IconComponent = iconMap[socialLink.iconName]
                    if (!IconComponent) return null
                    
                    return (
                      <Button
                        key={socialLink.id}
                        variant="ghost"
                        size="sm"
                        asChild
                        className="h-8 w-8 p-0"
                      >
                        <Link
                          href={socialLink.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label={socialLink.platform}
                        >
                          <IconComponent className="h-4 w-4" />
                        </Link>
                      </Button>
                    )
                  })}
              </div>
            )}
          </div>

          {/* Footer Links */}
          {footerLinks.map((section) => (
            <div key={section.title}>
              <h4 className="font-semibold mb-4">{section.title}</h4>
              <ul className="space-y-2">
                {section.links.map((link) => (
                  <li key={link.title}>
                    <Link
                      href={link.url}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {link.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Newsletter Subscription */}
        <div className="border-t mt-8 pt-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div>
              <h4 className="font-semibold mb-2">Stay Updated</h4>
              <p className="text-sm text-muted-foreground">
                Subscribe to our newsletter for the latest updates and insights.
              </p>
            </div>
            <form onSubmit={handleSubscribe} className="flex space-x-2">
              <Input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1"
                required
              />
              <Button type="submit">Subscribe</Button>
            </form>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t mt-8 pt-8 text-center">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} {companyName}. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
