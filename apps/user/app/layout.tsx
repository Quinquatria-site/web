import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Quinquatria',
  description: '캠퍼스 축제 안내',
}

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="ko" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  )
}
