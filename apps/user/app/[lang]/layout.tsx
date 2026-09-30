import type { Metadata, Viewport } from 'next'
import Script from 'next/script'
import { SunsetBackground } from '@/shared/background/SunsetBackground'
import { Dock } from '@/shared/dock/Dock'
import { pretendard } from '@/shared/fonts'
import { getLocale } from '@/shared/i18n/get-locale'
import { HTML_LANG, LOCALES } from '@/shared/i18n/locales'
import '@/styles/index.css'

/** 세 언어를 빌드 때 모두 굽는다 */
export function generateStaticParams() {
  return LOCALES.map((lang) => ({ lang }))
}

/**
 * 빌드 뒤에 생긴 공지·분실물 상세를 첫 요청 때 굽게 둔다. false 면 하위 상세 페이지까지
 * 빌드 때 만든 id 만 열리고 새 id 는 전부 404 가 된다. 목록에 없는 언어는 getLocale 이 404 로 보낸다
 */
export const dynamicParams = true

/** 학생 앱 공통 문서 메타데이터 */
export const metadata: Metadata = {
  title: 'Quinquatria',
}

/** 모바일 뷰포트. cover 여야 노치·홈 바 safe area 값을 받는다 */
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
}

/** Cloudflare Web Analytics 토큰. 없으면(로컬·스테이징) 비콘을 싣지 않는다 */
const CF_BEACON_TOKEN = process.env.NEXT_PUBLIC_CF_BEACON_TOKEN

/** 480 기둥 · 노을 배경 · 본문 · 도크를 두는 루트. 페이지를 옮겨도 유지돼 도크가 이어진다 */
export default async function RootLayout({ children }: LayoutProps<'/[lang]'>) {
  const locale = await getLocale()
  return (
    <html lang={HTML_LANG[locale]} className={pretendard.variable}>
      <body className="bg-bg">
        {/* 모달이 스크롤을 잠글 때 body 의 좌우 margin 을 padding 으로 바꿔 넣어서, 가운데 정렬은 body 가 아닌 안쪽 기둥에 둔다 */}
        <div className="mx-auto max-w-(--app-max-width)">
          <SunsetBackground />
          <main className="min-h-dvh pt-[env(safe-area-inset-top)] pb-(--dock-space)">
            {children}
          </main>
          <Dock />
        </div>
        {/* spa: 클라이언트 라우팅(pushState)도 페이지 조회로 센다 */}
        {CF_BEACON_TOKEN && (
          <Script
            src="https://static.cloudflareinsights.com/beacon.min.js"
            data-cf-beacon={JSON.stringify({ token: CF_BEACON_TOKEN, spa: true })}
            strategy="afterInteractive"
          />
        )}
      </body>
    </html>
  )
}
