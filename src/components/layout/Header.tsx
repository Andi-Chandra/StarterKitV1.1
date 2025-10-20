'use client'

import Link from 'next/link'
import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { Menu, X, ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from '@/components/ui/navigation-menu'
import { cn } from '@/lib/utils'

interface NavigationLink {
  id: string
  title: string
  url: string
  isExternal: boolean
  children?: NavigationLink[]
}

interface HeaderProps {
  navigationLinks?: NavigationLink[]
  companyLogo?: string
  companyName?: string
}

export function Header({ 
  navigationLinks = [], 
  companyLogo = '/logo.svg',
  companyName = 'PPS Belawan' 
}: HeaderProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const { status } = useSession()

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen)
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center space-x-2">
          <img
            src={companyLogo}
            alt={companyName}
            className="h-8 w-8"
          />
          <span className="font-bold text-xl">{companyName}</span>
        </Link>

        {/* Desktop Navigation */}
        <NavigationMenu className="hidden md:flex">
          <NavigationMenuList>
            {navigationLinks.map((link) => (
              <NavigationMenuItem key={link.id}>
                {link.children && link.children.length > 0 ? (
                  <>
                    <NavigationMenuTrigger className="bg-transparent">
                      {link.title}
                    </NavigationMenuTrigger>
                    <NavigationMenuContent>
                      <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
                        {link.children.map((child) => (
                          <li key={child.id}>
                            <NavigationMenuLink asChild>
                              <Link
                                href={child.url}
                                className={cn(
                                  "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                                )}
                                target={child.isExternal ? '_blank' : '_self'}
                                rel={child.isExternal ? 'noopener noreferrer' : undefined}
                              >
                                <div className="text-sm font-medium leading-none">
                                  {child.title}
                                </div>
                              </Link>
                            </NavigationMenuLink>
                          </li>
                        ))}
                      </ul>
                    </NavigationMenuContent>
                  </>
                ) : (
                  <NavigationMenuLink asChild>
                    <Link
                      href={link.url}
                      className={cn(
                        "group inline-flex h-10 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50 data-[active]:bg-accent/50 data-[state=open]:bg-accent/50"
                      )}
                      target={link.isExternal ? '_blank' : '_self'}
                      rel={link.isExternal ? 'noopener noreferrer' : undefined}
                    >
                      {link.title}
                    </Link>
                  </NavigationMenuLink>
                )}
              </NavigationMenuItem>
            ))}
          </NavigationMenuList>
        </NavigationMenu>

        {/* Auth Buttons */}
        <div className="flex items-center space-x-2">
          {status === 'unauthenticated' && (
            <Button size="sm" asChild>
              <Link href="/sign-in">Sign In</Link>
            </Button>
          )}

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="sm"
            className="relative z-50 md:hidden"
            onClick={toggleMobileMenu}
            aria-expanded={isMobileMenuOpen}
            aria-label="Toggle navigation menu"
          >
            {isMobileMenuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </Button>
        </div>
      </div>

      {/* Mobile Menu */}
      <div 
        className={`md:hidden fixed inset-x-0 top-16 z-40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b transform transition-all duration-300 ease-in-out ${
          isMobileMenuOpen ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'
        }`}
      >
        <div className="container px-4 py-4 space-y-2 max-h-[calc(100vh-4rem)] overflow-y-auto">
          {navigationLinks.map((link) => (
              <div key={link.id}>
                {link.children && link.children.length > 0 ? (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between px-3 py-2 text-sm font-medium">
                      {link.title}
                      <ChevronDown className="h-4 w-4" />
                    </div>
                    <div className="pl-4 space-y-1">
                      {link.children.map((child) => (
                        <Link
                          key={child.id}
                          href={child.url}
                          className="block px-3 py-2 text-sm text-muted-foreground hover:text-foreground"
                          target={child.isExternal ? '_blank' : '_self'}
                          rel={child.isExternal ? 'noopener noreferrer' : undefined}
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          {child.title}
                        </Link>
                      ))}
                    </div>
                  </div>
                ) : (
                  <Link
                    href={link.url}
                    className="block px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground rounded-md"
                    target={link.isExternal ? '_blank' : '_self'}
                    rel={link.isExternal ? 'noopener noreferrer' : undefined}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {link.title}
                  </Link>
                )}
              </div>
            ))}
          </div>
        </div>
    </header>
  )
}
