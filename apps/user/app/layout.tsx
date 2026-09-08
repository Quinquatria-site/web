import type { Metadata, Viewport } from 'next'
import { Cinzel } from 'next/font/google'
import { AppShell } from '@/components/app-shell'
import { FloatingNavigation } from '@/components/dock/floating-navigation'
import './globals.css'

const cinzel = Cinzel({
  variable: '--font-cinzel',
  subsets: ['latin'],
  weight: ['400', '500', '600'],
})

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
    <html lang="ko" className={`${cinzel.variable} antialiased`}>
      <body>
        <AppShell nav={<FloatingNavigation />}>{children}</AppShell>
      </body>
    </html>
  )
}
