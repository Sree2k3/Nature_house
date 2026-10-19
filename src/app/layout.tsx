import type { Metadata, Viewport } from 'next'
import './globals.css'

// Fonts are loaded via Google Fonts CSS @import in globals.css (Playfair_Display & Plus_Jakarta_Sans)
// This avoids build-time network calls and works in all environments
// CSS variables --font-jakarta and --font-playfair are set via HTML class

// ── METADATA ──────────────────────────────────────────────────────────────
export const metadata: Metadata = {
  title: {
    default: 'Nature House — A Perfect Place for Nature Lovers',
    template: '%s | Nature House',
  },
  description:
    'A perfect place for nature lovers... Explore our curated collection of indoor botanical plants and handcrafted opti-white rimless aquariums in Ashram Para, Adra, West Bengal. Inquire directly on WhatsApp.',
  keywords: [
    'plant nursery',
    'indoor plants',
    'handcrafted aquariums',
    'rimless glass tanks',
    'opti-white aquarium',
    'aquascape',
    'plant shop Adra',
    'plant nursery West Bengal',
  ],
  authors: [{ name: 'Nature House' }],
  creator: 'Nature House',
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    siteName: 'Nature House',
    title: 'Nature House — A Perfect Place for Nature Lovers',
    description:
      'A perfect place for nature lovers... Curated botanical plants and handcrafted rimless aquariums in Adra, West Bengal.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Nature House',
    description: 'A perfect place for nature lovers — Curated Plants & Handcrafted Aquariums',
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
