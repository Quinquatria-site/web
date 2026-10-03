import Image from 'next/image'
import Link from 'next/link'
import { LightBackground } from '@/shared/background/LightBackground'
import { pretendard } from '@/shared/fonts'
import lostMap from './lost-map.png'
import '@/styles/index.css'

/** 앱 전체 404. 루트 레이아웃이 언어 칸 아래라 문서를 통째로 그리고, 주소 언어와 상관없이 영어 한 벌로 둔다 */
export default function NotFound() {
  return (
    <html lang="en" className={pretendard.variable}>
      <body className="bg-bg">
        <main className="mx-auto max-w-(--app-max-width)">
          <LightBackground glow />
          <section className="flex min-h-dvh flex-col items-center justify-center gap-4 px-5 text-center font-medium">
            <Image src={lostMap} alt="" priority className="h-auto w-52" />
            <div className="flex flex-col gap-2">
              <h1 className="text-xl leading-[1.08] text-text">Page not found.</h1>
              <p className="leading-[1.32] text-text-muted">404 error</p>
            </div>
          </section>
          {/* 도크 탭바와 같은 자리·모양이라 도크 변수를 그대로 쓴다. `/` 는 기본 언어 홈으로 보내진다 */}
          <Link
            href="/"
            className="fixed bottom-(--dock-bottom) left-1/2 flex h-(--dock-size) w-(--dock-bar-width) -translate-x-1/2 items-center justify-center rounded-full bg-dock/80 text-xl leading-[1.08] font-medium text-on-dock shadow-[0_4px_6px_rgb(0_0_0/0.25)] inset-ring inset-ring-dock-border"
          >
            Back to home
          </Link>
        </main>
      </body>
    </html>
  )
}
