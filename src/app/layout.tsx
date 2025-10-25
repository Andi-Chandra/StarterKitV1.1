import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import NextAuthProvider from "@/components/providers/session-provider";
import { DebugErrorListener } from '@/components/providers/debug-error-listener'

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://informasippsbelawan.vercel.app'),
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
        <NextAuthProvider>
          {children}
        </NextAuthProvider>
        {process.env.NODE_ENV !== 'production' ? <DebugErrorListener /> : null}
        <Toaster />
      </body>
    </html>
  );
}
