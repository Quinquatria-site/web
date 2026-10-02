'use client'

import * as Dialog from '@radix-ui/react-dialog'
import {
  animate,
  AnimatePresence,
  motion,
  useDragControls,
  useMotionValue,
  type PanInfo,
} from 'motion/react'
import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react'
import { getMessages } from '@/shared/i18n/messages'
import { useLocale } from '@/shared/i18n/useLocale'
import { useCloseOnBack } from '@/shared/history/useCloseOnBack'

/** 시트 제목. 스크린리더가 시트 이름으로 읽으니 안에 꼭 하나 둔다 */
export const BottomSheetTitle = Dialog.Title

/** 시트 설명. 스크린리더가 제목 다음에 읽는다 */
export const BottomSheetDescription = Dialog.Description

type Step = 'peek' | 'full'

const SLIDE = { type: 'spring', bounce: 0, duration: 0.35 } as const

// 손을 뗀 속도로 이만큼(초) 더 미끄러진 자리에서 가장 가까운 단계에 붙인다
const PROJECTION = 0.2

interface SheetProps {
  onClose: () => void
  /** 지도를 움직이는 동안처럼 닫지 않고 잠깐 아래로 숨긴다 */
  hidden?: boolean
  /** 1단계에서 보이는 높이. 손잡이 줄을 포함하고 홈 인디케이터 여백은 따로 더한다. 안 주면 1단계 없이 끝까지 펼쳐 연다 */
  peekHeight?: number
  /** 뒤로 가기로 닫는 기록을 시트가 쌓는다. 주소로 기록을 따로 관리하는 곳은 꺼서 두 곳이 함께 되돌리지 않게 한다 */
  closeOnBack?: boolean
  children: ReactNode
}

/** 두 단계로 올라오는 시트. 1단계는 뒤 화면을 막지 않고, 2단계는 화면을 덮어 닫아야 뒤를 만질 수 있다. peekHeight 가 없으면 2단계만 있다 */
export function BottomSheet({
  open,
  closeOnBack = true,
  ...props
}: SheetProps & { open: boolean }) {
  useCloseOnBack(open && closeOnBack, props.onClose)

  return (
    <Dialog.Root open={open} onOpenChange={(next) => !next && props.onClose()} modal={false}>
      <AnimatePresence>
        {open && (
          <Dialog.Portal forceMount>
            {/* 열릴 때마다 새로 붙어 단계가 1단계로 돌아간다 */}
            <SheetPanel {...props} />
          </Dialog.Portal>
        )}
      </AnimatePresence>
    </Dialog.Root>
  )
}

function SheetPanel({ onClose, hidden = false, peekHeight, children }: SheetProps) {
  const { bottomSheet } = getMessages(useLocale())
  const hasPeek = peekHeight !== undefined
  const [step, setStep] = useState<Step>(hasPeek ? 'peek' : 'full')
  const [height, setHeight] = useState(0)
  const [safeBottom, setSafeBottom] = useState(0)
  const sheetRef = useRef<HTMLElement>(null)
  const bodyRef = useRef<HTMLDivElement>(null)
  const safeProbeRef = useRef<HTMLDivElement>(null)
  // 첫 그림부터 화면 밖에 있어야 올라오는 모습이 보인다
  const y = useMotionValue(typeof window === 'undefined' ? 0 : window.innerHeight)
  const dragControls = useDragControls()

  const peekY = height - (peekHeight ?? 0) - safeBottom
  const target = hidden ? height : step === 'full' ? 0 : peekY

  useLayoutEffect(() => {
    const sheet = sheetRef.current
    if (!sheet) return
    // 주소창이 접히며 dvh 가 바뀌어도 단계 위치를 다시 맞춘다
    const measure = () => {
      setHeight(sheet.offsetHeight)
      setSafeBottom(safeProbeRef.current?.offsetHeight ?? 0)
    }
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(sheet)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (!height) return
    const controls = animate(y, target, SLIDE)
    return () => controls.stop()
  }, [y, target, height])

  useEffect(() => {
    // 1단계로 내려오면 본문을 맨 위로 돌려 제목이 다시 보이게 한다
    if (step === 'peek') bodyRef.current?.scrollTo({ top: 0 })
  }, [step])

  const settle = (velocityY: number) => {
    const projected = y.get() + velocityY * PROJECTION
    // 2단계에서 세게 내려도 한 번에 닫히지 않고 1단계에 멈춘다. 1단계가 없으면 바로 닫힌다
    const stops = !hasPeek ? [0, height] : step === 'full' ? [0, peekY] : [0, peekY, height]
    const nearest = stops.reduce((a, b) =>
      Math.abs(b - projected) < Math.abs(a - projected) ? b : a,
    )
    if (nearest === height) return onClose()
    const next: Step = nearest === 0 ? 'full' : 'peek'
    // 같은 단계면 target 이 그대로라 effect 가 돌지 않아 직접 되돌린다
    if (next === step) animate(y, target, SLIDE)
    else setStep(next)
  }
  const settleRef = useRef(settle)
  useLayoutEffect(() => {
    settleRef.current = settle
  })

  useEffect(() => {
    const body = bodyRef.current
    if (step !== 'full' || !body || !height) return
    let startX = 0
    let startY = 0
    let decided = false
    let originY: number | null = null
    let originSheetY = 0
    let samples: { y: number; t: number }[] = []

    // 두 번째 손가락이 닿으면 끌던 시트를 제자리에 붙이고 이 손짓은 끝까지 브라우저에 맡긴다
    const abandon = () => {
      if (originY !== null) settleRef.current(0)
      originY = null
      decided = true
    }
    const onTouchStart = (event: TouchEvent) => {
      if (event.touches.length > 1) return abandon()
      startX = event.touches[0].clientX
      startY = event.touches[0].clientY
      decided = false
      originY = null
      samples = []
    }
    // 본문 맨 위에서 아래로 당기면 브라우저 스크롤·당겨서 새로고침 대신 시트가 손가락을 이어받는다
    const onTouchMove = (event: TouchEvent) => {
      // 본문 밖에 닿은 두 번째 손가락은 본문 touchstart 로 오지 않아 여기서도 잡는다
      if (event.touches.length > 1) return abandon()
      const { clientX, clientY } = event.touches[0]
      if (originY === null) {
        // 첫 움직임에서 한 번만 정한다. 가로 손짓(사진 넘기기)·막을 수 없는 손짓은 끝까지 브라우저에 맡긴다
        if (decided) return
        decided = true
        const dy = clientY - startY
        if (!event.cancelable || body.scrollTop > 0 || dy <= 0 || Math.abs(clientX - startX) > dy)
          return
        y.stop()
        originY = clientY
        originSheetY = y.get()
      }
      event.preventDefault()
      y.set(Math.min(Math.max(originSheetY + clientY - originY, 0), height))
      const now = event.timeStamp
      samples = [...samples.filter((s) => now - s.t < 100), { y: clientY, t: now }]
    }
    const onTouchEnd = (event: TouchEvent) => {
      if (originY === null) return
      originY = null
      // 멈췄다 떼면 속도 0 이 되게 뗀 시각 기준으로 최근 기록만 쓴다. 취소된 손짓은 관성 없이 붙인다
      const recent = samples.filter((s) => event.timeStamp - s.t < 100)
      const first = recent[0]
      const last = recent.at(-1)
      const elapsed = first && last ? last.t - first.t : 0
      const moving = event.type === 'touchend' && first && last && elapsed > 0
      settleRef.current(moving ? ((last.y - first.y) / elapsed) * 1000 : 0)
    }

    body.addEventListener('touchstart', onTouchStart, { passive: true })
    body.addEventListener('touchmove', onTouchMove, { passive: false })
    body.addEventListener('touchend', onTouchEnd)
    body.addEventListener('touchcancel', onTouchEnd)
    return () => {
      body.removeEventListener('touchstart', onTouchStart)
      body.removeEventListener('touchmove', onTouchMove)
      body.removeEventListener('touchend', onTouchEnd)
      body.removeEventListener('touchcancel', onTouchEnd)
    }
  }, [step, height, y])

  return (
    <>
      <AnimatePresence>
        {step === 'full' && !hidden && (
          // 2단계에서는 드러난 지도를 눌러도 마커가 눌리지 않고 시트가 닫힌다
          <motion.div
            aria-hidden
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50"
          />
        )}
      </AnimatePresence>
      <Dialog.Content
        forceMount
        asChild
        // 1단계에서 다른 마커·필터를 눌러도 닫히지 않고 내용만 바뀌게 바깥 누름을 무시한다
        onInteractOutside={(event) => event.preventDefault()}
      >
        <motion.section
          ref={sheetRef}
          style={{ y }}
          exit={{ y: height }}
          transition={SLIDE}
          inert={hidden}
          drag="y"
          // 1단계는 어디를 밀어도 시트가 움직이고, 2단계는 본문이 스크롤되니 손잡이 줄로만 끈다
          dragListener={step === 'peek'}
          dragControls={dragControls}
          dragConstraints={{ top: 0, bottom: height }}
          dragElastic={0}
          dragMomentum={false}
          onDragEnd={(_, { velocity }: PanInfo) => settle(velocity.y)}
          onWheel={(event) => step === 'peek' && event.deltaY > 0 && setStep('full')}
          className="fixed inset-x-0 bottom-0 z-50 mx-auto flex h-[80dvh] max-w-(--app-max-width) flex-col rounded-t-[20px] bg-bg bg-linear-to-b from-bg/20 to-primary/20 text-text shadow-[0_0_4px_var(--color-sheet-edge)]"
        >
          <div
            ref={safeProbeRef}
            aria-hidden
            className="absolute pb-[env(safe-area-inset-bottom)]"
          />
          <div
            aria-hidden
            onPointerDown={(event) => dragControls.start(event)}
            className="flex h-[42px] shrink-0 cursor-grab touch-none justify-center pt-3 active:cursor-grabbing"
          >
            <span className="h-[5px] w-[60px] rounded-full bg-sheet-edge" />
          </div>
          <Dialog.Close
            aria-label={bottomSheet.close}
            className="absolute top-[22px] right-[22px] -m-2 p-2"
          >
            <svg aria-hidden viewBox="0 0 24 24" className="size-6 fill-current">
              <path d="M19 6.41 17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
            </svg>
          </Dialog.Close>
          <div
            ref={bodyRef}
            data-step={step}
            className="min-h-0 flex-1 overscroll-contain px-5 pb-[calc(env(safe-area-inset-bottom)+24px)] data-[step=full]:overflow-y-auto data-[step=peek]:touch-none data-[step=peek]:overflow-hidden"
          >
            {children}
          </div>
        </motion.section>
      </Dialog.Content>
    </>
  )
}
