'use client'

import * as Dialog from '@radix-ui/react-dialog'
import Image from 'next/image'
import { useState } from 'react'
import type { PerformanceType } from '@quen/schema/entities/performance'
import { contentLang } from '@/shared/i18n/locales'
import { getMessages } from '@/shared/i18n/messages'
import { useLocale } from '@/shared/i18n/useLocale'
import { ZoomablePhoto } from '@/shared/photo/ZoomablePhoto'
import placeholderImage from './images/performance-placeholder.png'
import { MODAL_IMAGE_SIZES, type Performance } from './performance'

// 타임라인 카드와 같은 종류별 색
const CHIP_TONE: Record<PerformanceType, string> = {
  STUDENT: 'bg-performance-student',
  SPECIAL: 'bg-performance-special',
  ARTIST: 'bg-performance-artist text-on-performance-artist',
}

// 공연 종류 칩과 닫기 버튼
function ModalHeader({ type }: { type: PerformanceType }) {
  const { schedule } = getMessages(useLocale())
  return (
    <div className="flex items-center justify-between">
      <span
        className={`rounded-xl px-2 py-1 text-xs leading-[normal] font-semibold ${CHIP_TONE[type]}`}
      >
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

// 비율을 읽기 전의 틀이자 가장 긴 세로 비율. 공연 사진은 대부분 인스타 피드(4:5)로 올라온다
const TALLEST_ASPECT = 4 / 5

// 폭은 모달에 맞추고 높이를 원본 비율대로 두되, 4:5 보다 긴 세로 사진은 4:5 에서 잘라 모달이 화면을 넘지 않게 한다
function ModalPhoto({
  src,
  title,
  knownAspect,
}: {
  src: string
  title: string
  knownAspect: number | null
}) {
  // 빌드 때 읽은 비율이 있으면 첫 프레임부터 맞는 높이로 열려 덜컹이지 않는다
  const [aspect, setAspect] = useState(knownAspect ?? TALLEST_ASPECT)
  return (
    <div
      style={{ aspectRatio: Math.max(aspect, TALLEST_ASPECT) }}
      className="overflow-hidden rounded-xl"
    >
      {/* 미리 받아 둔 사진을 그대로 쓰도록 sizes 는 시간표의 미리 받기와 같다 */}
      <ZoomablePhoto
        src={src}
        alt={title}
        sizes={MODAL_IMAGE_SIZES}
        // 빌드 때 못 읽은 사진만 받은 뒤 맞춘다. 읽은 비율을 최적화 사진의 반올림된 픽셀로 덮어쓰지 않는다
        onLoad={
          knownAspect
            ? undefined
            : ({ currentTarget: { naturalWidth, naturalHeight } }) => {
                if (naturalWidth && naturalHeight) setAspect(naturalWidth / naturalHeight)
              }
        }
      />
    </div>
  )
}

// 팀 이미지. 없으면 시안의 아테나 그림을 정사각 자리에 흐리게 띄운다
function ModalImage({
  imageUri,
  imageAspect,
  title,
}: {
  imageUri: string | null
  imageAspect: number | null
  title: string
}) {
  if (imageUri) return <ModalPhoto src={imageUri} title={title} knownAspect={imageAspect} />
  return (
    <div
      aria-hidden
      className="flex aspect-square items-center justify-center rounded-xl bg-placeholder"
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
  image_aspect,
  title,
  description,
  language_code,
}: Pick<Performance, 'image_uri' | 'image_aspect' | 'title' | 'description' | 'language_code'>) {
  return (
    <div className="mt-3 flex flex-col gap-4">
      <ModalImage imageUri={image_uri} imageAspect={image_aspect} title={title} />
      <div lang={contentLang(language_code)} className="flex flex-col gap-2 px-2">
        <Dialog.Title className="text-2xl leading-[normal] font-semibold">{title}</Dialog.Title>
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
      <Dialog.Overlay className="fixed inset-0 z-50 bg-black/60" />
      {/* 폭은 기기마다 양옆 24 만 남기고 앱 기둥(480)을 넘지 않는다. 높이는 사진·소개만큼 늘되 화면을 넘으면 안에서 스크롤한다 */}
      <Dialog.Content className="fixed top-1/2 left-1/2 z-50 max-h-[calc(100dvh-48px)] w-[calc(var(--app-width)-48px)] -translate-1/2 overflow-y-auto rounded-2xl bg-bg bg-linear-to-b from-bg/20 to-primary/20 p-[13px] pb-6 text-text shadow-[0_4px_8px_rgb(0_0_0/0.25)]">
        <ModalHeader type={performance.type} />
        <ModalContent
          image_uri={performance.image_uri}
          image_aspect={performance.image_aspect}
          title={performance.title}
          description={performance.description}
          language_code={performance.language_code}
        />
      </Dialog.Content>
    </Dialog.Portal>
  )
}
