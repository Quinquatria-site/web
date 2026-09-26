import type { Metadata, Viewport } from 'next'
import { Dock } from '@/components/dock/Dock'
import '@/styles/index.css'

export const metadata: Metadata = {
  title: 'Quinquatria',
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
}

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="ko">
      <body className="mx-auto max-w-(--app-max-width)">
        <main className="outline outline-black -outline-offset-1 min-h-dvh pt-[env(safe-area-inset-top)] pb-(--dock-space)">
          {children}
        </main>
        <Dock />
      </body>
    </html>
  )
}
