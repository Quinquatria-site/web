'use client'

import * as Dialog from '@radix-ui/react-dialog'
import Image from 'next/image'
import type { PerformanceType } from '@quen/schema/entities/performance'
import { getMessages } from '@/shared/i18n/messages'
import { useLocale } from '@/shared/i18n/useLocale'
import { ZoomablePhoto } from '@/shared/photo/ZoomablePhoto'
import placeholderImage from './images/performance-placeholder.png'
import { MODAL_IMAGE_SIZES, type Performance } from './performance'

// 타임라인 카드와 같은 종류별 색
const CHIP_BG: Record<PerformanceType, string> = {
  STUDENT: 'bg-performance-student',
  SPECIAL: 'bg-performance-special',
  ARTIST: 'bg-performance-artist',
}

// 공연 종류 칩과 닫기 버튼
function ModalHeader({ type }: { type: PerformanceType }) {
  const { schedule } = getMessages(useLocale())
  return (
    <div className="flex items-center justify-between">
      <span className={`rounded-xl px-2 py-1 text-xs leading-[normal] ${CHIP_BG[type]}`}>
        {schedule.performanceTypes[type]}
      </span>
      <Dialog.Close aria-label={schedule.close} className="-m-2 p-2">
        <svg aria-hidden viewBox="0 0 24 24" className="size-6 fill-current">
          <path d="M19 6.41 17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
        </svg>
      </Dialog.Close>
    </div>
  )
}

// 팀 이미지. 없으면 시안의 아테나 그림을 흐리게 띄운다
function ModalImage({ imageUri, title }: { imageUri: string | null; title: string }) {
  if (imageUri) {
    return (
      // 미리 받아 둔 사진을 그대로 쓰도록 sizes 는 시간표의 미리 받기와 같다
      <div className="h-[159px] overflow-hidden rounded-xl">
        <ZoomablePhoto src={imageUri} alt={title} sizes={MODAL_IMAGE_SIZES} />
      </div>
    )
  }
  return (
    <div
      aria-hidden
      className="flex h-[159px] items-center justify-center rounded-xl bg-placeholder"
    >
      {/* 시안처럼 가운데를 오른쪽으로 치우쳐 잘라 창끝까지 보인다 */}
      <Image
        src={placeholderImage}
        alt=""
        sizes="156px"
        className="h-[132px] w-[156px] object-cover object-[65%_50%] opacity-50"
      />
    </div>
  )
}

// 팀 이미지 · 이름 · 소개
function ModalContent({
  image_uri,
  title,
  description,
}: Pick<Performance, 'image_uri' | 'title' | 'description'>) {
  return (
    <div className="mt-3 flex flex-col gap-4">
      <ModalImage imageUri={image_uri} title={title} />
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
        <ModalContent
          image_uri={performance.image_uri}
          title={performance.title}
          description={performance.description}
        />
      </Dialog.Content>
    </Dialog.Portal>
  )
}
