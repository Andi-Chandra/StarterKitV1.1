import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import SupabaseAuthProvider from "@/components/providers/session-provider";
import { DebugErrorListener } from '@/components/providers/debug-error-listener'

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const rawSite = process.env.NEXT_PUBLIC_SITE_URL
const normalizedSite = (() => {
  try {
    if (!rawSite) return 'https://informasippsbelawan.vercel.app'
    const withProto = /^https?:\/\//i.test(rawSite) ? rawSite : `https://${rawSite}`
    // Validate
    // eslint-disable-next-line no-new
    new URL(withProto)
    return withProto
  } catch {
    return 'https://informasippsbelawan.vercel.app'
  }
})()

export const metadata: Metadata = {
  metadataBase: new URL(normalizedSite),
  title: {
    default: 'PPS Belawan',
    template: '%s | PPS Belawan',
  },
  description: 'Pelabuhan Perikanan Samudera Belawan.',
  keywords: ['PPS Belawan', 'Perikanan', 'Belawan', 'Sumatera Utara'],
  authors: [{ name: 'PPS Belawan' }],
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'PPS Belawan',
    description: 'Pelabuhan Perikanan Samudera Belawan.',
    url: '/',
    siteName: 'PPS Belawan',
    type: 'website',
    images: ['/logo.svg'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'PPS Belawan',
    description: 'Pelabuhan Perikanan Samudera Belawan.',
    images: ['/logo.svg'],
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: '/logo.svg',
    shortcut: '/logo.svg',
    apple: '/logo.svg',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:px-3 focus:py-2 focus:rounded-md focus:bg-primary focus:text-primary-foreground"
        >
          Skip to main content
        </a>
        <SupabaseAuthProvider>
          {children}
        </SupabaseAuthProvider>
        {process.env.NODE_ENV !== 'production' ? <DebugErrorListener /> : null}
        <Toaster />
      </body>
    </html>
  );
}
