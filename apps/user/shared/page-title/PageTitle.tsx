import { heirOfLight } from '@/shared/fonts/heir-of-light'

/** 탭 페이지 맨 위 제목. 배경 없이 글자만 가운데 두고, 노을 하늘 위는 밝게 · 밝은 바탕 위는 어둡게 쓴다 */
export function PageTitle({ title, onLight = false }: { title: string; onLight?: boolean }) {
  return (
    <h1
      className={`${heirOfLight.variable} flex h-(--page-title-height) shrink-0 items-center justify-center font-heir text-[22px] leading-[normal] tracking-[0.02em] ${onLight ? 'text-secondary' : 'text-text-inverse'}`}
    >
      {title}
    </h1>
  )
}
