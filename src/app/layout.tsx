import type { Metadata, Viewport } from 'next'
import './globals.css'

// Fonts are loaded via Google Fonts CSS @import in globals.css (Playfair_Display & Plus_Jakarta_Sans)
// This avoids build-time network calls and works in all environments
// CSS variables --font-jakarta and --font-playfair are set via HTML class

// ── METADATA ──────────────────────────────────────────────────────────────
export const metadata: Metadata = {
  title: {
    default: 'Nature House — Living Greenery & Handcrafted Aquariums',
    template: '%s | Nature House',
  },
  description:
    'Explore our curated collection of indoor plants, exotic foliage, and handcrafted opti-white rimless aquariums. Visit us or inquire directly on WhatsApp.',
  keywords: [
    'plant nursery',
    'indoor plants',
    'handcrafted aquariums',
    'rimless glass tanks',
    'opti-white aquarium',
    'aquascape',
    'Nature House',
    'plant shop Bangalore',
  ],
  authors: [{ name: 'Nature House' }],
  creator: 'Nature House',
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    siteName: 'Nature House',
    title: 'Nature House — Living Greenery & Handcrafted Aquariums',
    description:
      'A curated digital catalog of botanical plants and handcrafted rimless aquariums. Inquire directly on WhatsApp.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Nature House',
    description: 'Living Greenery & Handcrafted Aquariums — Browse & Inquire on WhatsApp',
  },
  robots: {
    index: true,
    follow: true,
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#fcfbf7' },
    { media: '(prefers-color-scheme: dark)',  color: '#0f281e' },
  ],
}

// ── ROOT LAYOUT ───────────────────────────────────────────────────────────
export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-nature-linen antialiased">
        {children}
      </body>
    </html>
  )
}
