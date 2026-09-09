import type { Metadata, Viewport } from 'next'
import { Cinzel } from 'next/font/google'
import { AppShell } from '@/components/app-shell'
import { FloatingNavigation } from '@/components/dock/floating-navigation'
import { LangProvider } from '@/components/lang-provider'
import { HTML_LANG, LANGS, type Lang } from '@/libs/i18n'
import '../globals.css'

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

// 세 언어만 미리 굽는다.
export function generateStaticParams() {
  return LANGS.map((lang) => ({ lang }))
}

// 목록에 없는 세그먼트는 404. 이게 없으면 요청 때 그려 내는 길이 열려 라우트가 동적이 된다.
export const dynamicParams = false

export default async function RootLayout({ children, params }: LayoutProps<'/[lang]'>) {
  const { lang } = (await params) as { lang: Lang }

  return (
    <html lang={HTML_LANG[lang]} className={`${cinzel.variable} antialiased`}>
      <body>
        <LangProvider lang={lang}>
          <AppShell nav={<FloatingNavigation />}>{children}</AppShell>
        </LangProvider>
      </body>
    </html>
  )
}
