import type { Metadata, Viewport } from 'next'
import { AppViewport } from '@/components/layout/AppViewport'
import './globals.css'

export const metadata: Metadata = {
  title: 'Quinquatria',
  description: '캠퍼스 축제 안내',
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
}

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="ko" className="h-full antialiased">
      <body className="min-h-full">
        <AppViewport>{children}</AppViewport>
      </body>
    </html>
  )
}
