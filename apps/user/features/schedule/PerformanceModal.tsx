import * as Dialog from '@radix-ui/react-dialog'
import type { PerformanceType } from '@quen/schema/entities/performance'
import type { Performance } from './performance'

const TYPE_LABEL: Record<PerformanceType, string> = {
  STUDENT: '학생 공연',
  SPECIAL: '특별 공연',
  ARTIST: '아티스트 공연',
}

// 공연 종류 칩과 닫기 버튼
function ModalHeader({ type }: { type: PerformanceType }) {
  return (
    <div className="flex items-center justify-between">
      <span className="rounded-xl bg-bg-subtle px-2 py-1 text-xs leading-[normal]">
        {TYPE_LABEL[type]}
      </span>
      <Dialog.Close aria-label="닫기" className="-m-2 p-2">
        <svg aria-hidden viewBox="0 0 24 24" className="size-6 fill-current">
          <path d="M19 6.41 17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
        </svg>
      </Dialog.Close>
    </div>
  )
}

// 팀 이미지 · 이름 · 소개
function ModalContent({ title, description }: Pick<Performance, 'title' | 'description'>) {
  return (
    <div className="mt-3 flex flex-col gap-4">
      {/* image_uri 는 key 라 붙일 이미지 주소가 정해지기 전까지 자리만 둔다 */}
      <div aria-hidden className="h-[159px] rounded-xl bg-bg-subtle" />
      <div className="flex flex-col gap-2 px-2">
        <Dialog.Title className="text-2xl leading-[normal] font-bold">{title}</Dialog.Title>
        <Dialog.Description className="text-sm leading-[1.18] whitespace-pre-line">
          {description}
        </Dialog.Description>
      </div>
    </div>
  )
}

/** 공연 상세 모달. 카드의 Dialog.Root 안에 두면 누를 때 떠오른다 */
export function PerformanceModal({ performance }: { performance: Performance }) {
  return (
    <Dialog.Portal>
      <Dialog.Overlay className="fixed inset-0 z-50 bg-black/40" />
      {/* 소개가 길거나 글자를 키워도 닫기 버튼까지 닿게 화면 안에서 스크롤한다 */}
      <Dialog.Content className="fixed top-1/2 left-1/2 z-50 max-h-[calc(100dvh-48px)] w-[calc(100%-48px)] max-w-[308px] -translate-1/2 overflow-y-auto rounded-2xl bg-bg p-[13px] pb-6">
        <ModalHeader type={performance.type} />
        <ModalContent title={performance.title} description={performance.description} />
      </Dialog.Content>
    </Dialog.Portal>
  )
}
