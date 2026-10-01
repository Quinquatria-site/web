import type { Metadata, Viewport } from 'next'
import { SunsetBackground } from '@/shared/background/SunsetBackground'
import { pretendard } from '@/shared/fonts'
import '@/styles/index.css'

/** 축제 전 안내 페이지 메타데이터 */
export const metadata: Metadata = {
  title: '축제 준비 중',
}

/** 모바일 뷰포트. cover 여야 노치·홈 바 safe area 값을 받는다 */
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
}

/** 480 기둥과 노을 배경만 두는 루트 */
export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="ko" className={pretendard.variable}>
      <body className="bg-bg font-sans">
        <div className="mx-auto max-w-(--app-max-width)">
          <SunsetBackground />
          <main>{children}</main>
        </div>
      </body>
    </html>
  )
}
