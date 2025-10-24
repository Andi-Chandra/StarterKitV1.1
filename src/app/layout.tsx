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
  title: "PPS Belawan",
  description: "Pangkalan Pendaratan Ikan PPS Belawan.",
  keywords: ["PPS Belawan", "Perikanan", "Belawan", "Sumatera Utara"],
  authors: [{ name: "PPS Belawan" }],
  openGraph: {
    title: "PPS Belawan",
    description: "Pangkalan Pendaratan Ikan PPS Belawan",
    url: "informasippsbelawan.vercel.app",
    siteName: "PPS Belawan",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "PPS Belawan",
    description: "Pangkalan Pendaratan Ikan PPS Belawan",
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
        <NextAuthProvider>
          {children}
        </NextAuthProvider>
        {process.env.NODE_ENV !== 'production' ? <DebugErrorListener /> : null}
        <Toaster />
      </body>
    </html>
  );
}
