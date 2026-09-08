import type { Metadata, Viewport } from 'next'
import { FloatingNavigation } from '@/components/dock/floating-navigation'
import { AppShell } from '@/components/app-shell'
import './globals.css'

export const metadata: Metadata = {
  title: 'Quinquatria',
  description: '축제 정보를 한 곳에서',
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  viewportFit: 'cover',
}

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="ko" className="antialiased">
      <body>
        <AppShell nav={<FloatingNavigation />}>{children}</AppShell>
      </body>
    </html>
  )
}
