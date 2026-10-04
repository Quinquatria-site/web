import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { LightBackground } from '@/shared/background/LightBackground'
import { localePath } from '@/shared/i18n/paths'
import niceTry from './nice-try.webp'

/** 검색 결과에 함정 페이지가 뜨지 않게 한다 */
export const metadata: Metadata = { robots: { index: false } }

/** 관리자 주소를 찔러 본 학생이 오는 페이지. 장난 문구라 번역 없이 한국어로만 둔다 */
export default function FocusPage() {
  return (
    <>
      <LightBackground glow />
      <section className="flex min-h-[calc(100dvh-var(--dock-space))] flex-col items-center justify-center gap-6 px-5 text-center font-medium">
        <Image
          src={niceTry}
          alt="Nice try, but no"
          priority
          className="h-auto w-full max-w-80 rounded-2xl"
        />
        <h1 className="text-2xl leading-[1.08] text-text">축제에 집중해주세요 ^^</h1>
        <Link href={localePath('ko', '/')} className="leading-[1.32] text-text-muted underline">
          홈으로 돌아가기
        </Link>
      </section>
    </>
  )
}
