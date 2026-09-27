import type { Metadata, Viewport } from 'next'
import { Dock } from '@/shared/dock/Dock'
import { pretendard } from '@/shared/fonts'
import '@/styles/index.css'

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

/** 480 기둥 · 본문 · 도크를 두는 루트. 페이지를 옮겨도 유지돼 도크가 이어진다 */
export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="ko" className={pretendard.variable}>
      <body>
        {/* 모달이 스크롤을 잠글 때 body 의 좌우 margin 을 padding 으로 바꿔 넣어서, 가운데 정렬은 body 가 아닌 안쪽 기둥에 둔다 */}
        <div className="mx-auto max-w-(--app-max-width)">
          <main className="min-h-dvh pt-[env(safe-area-inset-top)] pb-(--dock-space)">
            {children}
          </main>
          <Dock />
        </div>
      </body>
    </html>
  )
}
