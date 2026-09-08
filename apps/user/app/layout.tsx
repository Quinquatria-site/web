import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Quinquatria',
  description: '축제 부스 안내',
}

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="ko" className="h-full antialiased">
      <body className="flex min-h-full flex-col">{children}</body>
    </html>
  )
}
