'use client'

import * as Dialog from '@radix-ui/react-dialog'
import { animate, AnimatePresence, motion, useTransform } from 'motion/react'
import Image from 'next/image'
import { useRef, useState, type ReactElement } from 'react'
import { flushSync } from 'react-dom'
import { useCloseOnBack } from '@/shared/history/useCloseOnBack'
import { getMessages } from '@/shared/i18n/messages'
import { useLocale } from '@/shared/i18n/useLocale'
import { assetUrl } from './asset-url'
import { usePinchZoom } from './usePinchZoom'

// 뷰어가 앱 기둥 폭이라 그만큼만 받는다
const VIEWER_SIZES = '(max-width: 480px) 100vw, 480px'

const SLIDE = { type: 'spring', bounce: 0, duration: 0.35 } as const
// 화면 폭의 이 비율 넘게 밀거나 이 속도(px/s)로 튕기면 옆 사진으로 넘긴다
const SWIPE_RATIO = 0.25
const SWIPE_VELOCITY = 500

const FADE = { duration: 0.2, ease: 'easeOut' } as const

interface ViewerProps {
  /** 넘겨 볼 사진들. 주소나 API 의 S3 key */
  photos: string[]
  /** 처음 띄울 사진 */
  index: number
  /** 사진 이름. 여러 장이면 뒤에 몇 번째인지 붙는다 */
  alt: string
  /** 눌러 연 사진의 sizes. 같은 주소라 이미 받은 사진을 먼저 띄우고 큰 사진이 오면 덮는다 */
  sizes: string
}

/** 사진을 화면 가득 띄우는 뷰어. children 을 누르면 열리고, 두 손가락으로 확대하며 아래로 내리거나 X·뒤로 가기로 닫는다 */
export function PhotoViewer({
  open,
  onOpenChange,
  children,
  ...props
}: ViewerProps & {
  open: boolean
  onOpenChange: (open: boolean) => void
  children: ReactElement
}) {
  const close = () => onOpenChange(false)
  useCloseOnBack(open, close)

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      {/* Trigger 여야 닫힌 뒤 포커스가 누른 사진으로 돌아온다 */}
      <Dialog.Trigger asChild>{children}</Dialog.Trigger>
      <AnimatePresence>
        {open && (
          <Dialog.Portal forceMount>
            {/* 열 때마다 새로 붙어 배율이 1 로 돌아간다 */}
            <ViewerPanel {...props} onClose={close} />
          </Dialog.Portal>
        )}
      </AnimatePresence>
    </Dialog.Root>
  )
}

function ViewerPanel({
  photos,
  index: initialIndex,
  alt,
  sizes,
  onClose,
}: ViewerProps & { onClose: () => void }) {
  const { photoViewer } = getMessages(useLocale())
  const stageRef = useRef<HTMLDivElement>(null)
  const [index, setIndex] = useState(initialIndex)
  // 손짓 콜백이 렌더를 기다리지 않고 지금 사진을 읽어야 해서 state 와 함께 둔다
  const indexRef = useRef(initialIndex)
  const naturals = useRef(new Map<number, { width: number; height: number }>())
  const multiple = photos.length > 1
  const canSwipe = (direction: 1 | -1) => {
    const next = indexRef.current + direction
    return next >= 0 && next < photos.length
  }

  const go = (direction: 1 | -1, velocity = 0) => {
    if (!canSwipe(direction)) return
    const next = indexRef.current + direction
    indexRef.current = next
    reset(naturals.current.get(next) ?? null)
    // 사진 띠를 한 칸 옮기는 렌더와 swipe 를 같은 프레임에 맞춰야 화면이 튀지 않는다
    flushSync(() => setIndex(next))
    swipe.jump(swipe.get() + direction * (stageRef.current?.clientWidth ?? 0))
    animate(swipe, 0, { ...SLIDE, velocity })
  }

  const { x, y, scale, dismiss, swipe, handlers, setNaturalSize, reset } = usePinchZoom(stageRef, {
    onDismiss: onClose,
    canSwipe: multiple ? canSwipe : undefined,
    onSwipeEnd: (offset, velocity) => {
      const width = stageRef.current?.clientWidth ?? 1
      // 반쯤 넘게 밀었거나 빠르게 튕기면 넘기고, 아니면 제자리로 돌아온다
      const direction = offset < 0 ? 1 : -1
      const far = Math.abs(offset) > width * SWIPE_RATIO
      const fast = Math.abs(velocity) > SWIPE_VELOCITY && Math.sign(velocity) === Math.sign(offset)
      if ((far || fast) && canSwipe(direction)) go(direction, velocity)
      else animate(swipe, 0, { ...SLIDE, velocity })
    },
    onStep: (direction) => go(direction),
  })
  // 내릴수록 뒤가 비치고 닫기 버튼이 흐려져 놓으면 닫힌다는 걸 알린다
  const backdropOpacity = useTransform(dismiss, [0, 1], [1, 0.15])
  const chromeOpacity = useTransform(dismiss, [0, 0.4], [1, 0])
  const photoAlt = (i: number) => (multiple ? `${alt} ${i + 1}` : alt)

  return (
    <>
      <Dialog.Overlay forceMount asChild>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={FADE}
          // 지도 위 버튼(z-1000)보다 위에 뜨고, PC 에서도 앱 기둥(480) 밖으로 넘치지 않는다
          className="fixed inset-0 z-[1100] mx-auto max-w-(--app-max-width)"
        >
          {/* 뒤 화면이 비쳐 보이게 다 덮지 않고 흐리게 깐다 */}
          <motion.div
            style={{ opacity: backdropOpacity }}
            className="size-full bg-black/70 backdrop-blur-sm"
          />
        </motion.div>
      </Dialog.Overlay>
      <Dialog.Content
        forceMount
        asChild
        onKeyDown={(event) => {
          if (!multiple) return
          if (event.key === 'ArrowRight') go(1)
          else if (event.key === 'ArrowLeft') go(-1)
        }}
      >
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={FADE}
          className="fixed inset-0 z-[1100] mx-auto max-w-(--app-max-width) outline-none"
        >
          <Dialog.Title className="sr-only">{photoAlt(index)}</Dialog.Title>
          <Dialog.Description className="sr-only">
            {multiple ? `${photoViewer.hint} ${photoViewer.swipeHint}` : photoViewer.hint}
          </Dialog.Description>
          {/* 손짓을 브라우저가 스크롤·페이지 확대로 가져가지 않게 touch-none 으로 전부 받는다 */}
          <div
            ref={stageRef}
            {...handlers}
            className="absolute inset-0 touch-none overflow-hidden select-none"
          >
            <motion.div
              initial={{ scale: 0.92 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.96 }}
              transition={{ type: 'spring', bounce: 0, duration: 0.3 }}
              className="size-full"
            >
              <motion.div style={{ x: swipe }} className="relative size-full">
                {photos.map((src, i) =>
                  // 지금 사진과 양옆 한 장씩만 그려 넘길 때 바로 보이고 나머지는 받지 않는다
                  Math.abs(i - index) > 1 ? null : (
                    <motion.div
                      key={`${src}-${i}`}
                      aria-hidden={i !== index}
                      // 사진마다 한 칸씩 비켜 세워, 넘긴 뒤 swipe 만 0 으로 돌리면 된다. 확대는 지금 사진만 받는다
                      style={{ ...(i === index && { x, y, scale }), left: `${(i - index) * 100}%` }}
                      className="absolute inset-y-0 w-full"
                    >
                      <Image
                        src={assetUrl(src)}
                        alt=""
                        aria-hidden
                        fill
                        sizes={sizes}
                        draggable={false}
                        className="object-contain"
                      />
                      <Image
                        src={assetUrl(src)}
                        alt={photoAlt(i)}
                        fill
                        sizes={VIEWER_SIZES}
                        draggable={false}
                        onLoad={(event) => {
                          const size = {
                            width: event.currentTarget.naturalWidth,
                            height: event.currentTarget.naturalHeight,
                          }
                          naturals.current.set(i, size)
                          if (i === indexRef.current) setNaturalSize(size)
                        }}
                        className="object-contain"
                      />
                    </motion.div>
                  ),
                )}
              </motion.div>
            </motion.div>
          </div>
          <motion.div
            style={{ opacity: chromeOpacity }}
            // 사진 위에서도 X 가 보이게 위쪽만 어둡게 깐다. 띠는 손짓을 막지 않고 버튼만 눌린다
            className="pointer-events-none absolute inset-x-0 top-0 bg-linear-to-b from-black/50 to-transparent pt-[env(safe-area-inset-top)]"
          >
            <div className="flex h-16 items-center justify-between px-3">
              {multiple ? (
                <p
                  aria-live="polite"
                  className="rounded-full bg-black/40 px-3 py-1 text-sm font-medium text-white tabular-nums backdrop-blur-sm"
                >
                  {index + 1} / {photos.length}
                </p>
              ) : (
                <span />
              )}
              <Dialog.Close
                aria-label={photoViewer.close}
                className="pointer-events-auto flex size-11 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-sm"
              >
                <svg aria-hidden viewBox="0 0 24 24" className="size-6 fill-current">
                  <path d="M19 6.41 17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
                </svg>
              </Dialog.Close>
            </div>
          </motion.div>
        </motion.div>
      </Dialog.Content>
    </>
  )
}
