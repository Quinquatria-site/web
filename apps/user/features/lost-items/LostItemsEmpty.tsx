import { EmptyBox } from './EmptyBox'

/** 등록된 분실물이 없을 때. 헤더와 도크 사이 남은 높이의 가운데에 그림과 안내를 둔다 */
export function LostItemsEmpty({ title, hint }: { title: string; hint: string }) {
  return (
    <section className="flex min-h-[calc(100dvh-env(safe-area-inset-top)-(--spacing(19))-var(--dock-space))] flex-col items-center justify-center gap-1 px-5 text-center font-medium">
      <EmptyBox />
      <div className="flex flex-col gap-2">
        {/* 줄바꿈 자리는 문구에 넣어 두어 언어마다 끊는 곳을 따로 정한다 */}
        <p className="text-xl leading-[1.08] whitespace-pre-line break-keep text-secondary">
          {title}
        </p>
        <p className="leading-[1.32] text-text-muted">{hint}</p>
      </div>
    </section>
  )
}
