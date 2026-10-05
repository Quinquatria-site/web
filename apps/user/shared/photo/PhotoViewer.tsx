'use client'

import * as Dialog from '@radix-ui/react-dialog'
import { AnimatePresence, motion, useTransform } from 'motion/react'
import Image from 'next/image'
import { useRef, type ReactElement } from 'react'
import { useCloseOnBack } from '@/shared/history/useCloseOnBack'
import { getMessages } from '@/shared/i18n/messages'
import { useLocale } from '@/shared/i18n/useLocale'
import { assetUrl } from './asset-url'
import { usePinchZoom } from './usePinchZoom'

// 뷰어가 앱 기둥 폭이라 그만큼만 받는다
const VIEWER_SIZES = '(max-width: 480px) 100vw, 480px'

const FADE = { duration: 0.2, ease: 'easeOut' } as const

interface ViewerProps {
  /** 띄울 사진. 주소나 API 의 S3 key */
  src: string
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

function ViewerPanel({ src, alt, sizes, onClose }: ViewerProps & { onClose: () => void }) {
  const { photoViewer } = getMessages(useLocale())
  const stageRef = useRef<HTMLDivElement>(null)
  const { x, y, scale, dismiss, handlers, setNaturalSize } = usePinchZoom(stageRef, {
    onDismiss: onClose,
  })
  // 내릴수록 뒤가 비치고 닫기 버튼이 흐려져 놓으면 닫힌다는 걸 알린다
  const backdropOpacity = useTransform(dismiss, [0, 1], [1, 0.15])
  const chromeOpacity = useTransform(dismiss, [0, 0.4], [1, 0])

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
      <Dialog.Content forceMount asChild>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={FADE}
          className="fixed inset-0 z-[1100] mx-auto max-w-(--app-max-width) outline-none"
        >
          <Dialog.Title className="sr-only">{alt}</Dialog.Title>
          <Dialog.Description className="sr-only">{photoViewer.hint}</Dialog.Description>
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
              <motion.div style={{ x, y, scale }} className="relative size-full">
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
                  alt={alt}
                  fill
                  sizes={VIEWER_SIZES}
                  draggable={false}
                  onLoad={(event) =>
                    setNaturalSize({
                      width: event.currentTarget.naturalWidth,
                      height: event.currentTarget.naturalHeight,
                    })
                  }
                  className="object-contain"
                />
              </motion.div>
            </motion.div>
          </div>
          <motion.div
            style={{ opacity: chromeOpacity }}
            // 사진 위에서도 X 가 보이게 위쪽만 어둡게 깐다. 띠는 손짓을 막지 않고 버튼만 눌린다
            className="pointer-events-none absolute inset-x-0 top-0 bg-linear-to-b from-black/50 to-transparent pt-[env(safe-area-inset-top)]"
          >
            <div className="flex h-16 items-center justify-end px-3">
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
