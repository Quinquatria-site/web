import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Quinquatria',
}

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  )
}
