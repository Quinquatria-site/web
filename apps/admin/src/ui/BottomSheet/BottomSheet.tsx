import IconXmarkLine from '@karrotmarket/react-monochrome-icon/IconXmarkLine'
import * as Dialog from '@radix-ui/react-dialog'
import { Icon } from '@seed-design/react'
import {
  animate,
  AnimatePresence,
  motion,
  useDragControls,
  useMotionValue,
  type PanInfo,
} from 'motion/react'
import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type ComponentProps,
  type ReactNode,
} from 'react'
import styles from './BottomSheet.module.css'
import { useCloseOnBack } from './useCloseOnBack'

/** 시트 제목. 스크린리더가 시트 이름으로 읽으니 안에 꼭 하나 둔다 */
export function BottomSheetTitle(props: ComponentProps<typeof Dialog.Title>) {
  return <Dialog.Title {...props} />
}

/** 시트 설명. 스크린리더가 제목 다음에 읽는다 */
export function BottomSheetDescription(props: ComponentProps<typeof Dialog.Description>) {
  return <Dialog.Description {...props} />
}

type Step = 'peek' | 'full'

const SLIDE = { type: 'spring', bounce: 0, duration: 0.35 } as const

// 손을 뗀 속도로 이만큼(초) 더 미끄러진 자리에서 가장 가까운 단계에 붙인다
const PROJECTION = 0.2

export interface BottomSheetProps {
  open: boolean
  /** 닫히는 모든 경로(X·ESC·끌어내리기·바깥 누르기·뒤로 가기)가 여기로 모인다 */
  onClose: () => void
  /** 지도를 움직이는 동안처럼 닫지 않고 잠깐 아래로 숨긴다 */
  hidden?: boolean
  /** 1단계에서 보이는 높이. 손잡이 줄을 포함한다. 안 주면 1단계 없이 끝까지 펼쳐 연다 */
  peekHeight?: number
  children: ReactNode
}

type SheetPanelProps = Omit<BottomSheetProps, 'open'>

/**
 * 두 단계로 올라오는 시트. 1단계는 뒤 화면을 막지 않고, 2단계는 화면을 덮어 닫아야 뒤를
 * 만질 수 있다. peekHeight 가 없으면 2단계만 있다. 동작은 user 앱 shared/bottom-sheet 와 같다.
 *
 * user 와 달리 뷰포트가 아니라 부모 상자 바닥에 눕는다 — 부모가 position: relative 여야 한다.
 * AppLayout 이 데스크톱에서 480px 기둥을 만들어 fixed 면 기둥 밖으로 새고, 탭바 위에 앉아야
 * 하단 탭이 가려지지 않는다. 같은 이유로 홈 인디케이터 여백은 탭바가 이미 갖고 있어 더하지 않는다.
 */
export function BottomSheet({ open, ...props }: BottomSheetProps) {
  useCloseOnBack(open, props.onClose)

  return (
    <Dialog.Root open={open} onOpenChange={(next) => !next && props.onClose()} modal={false}>
      <AnimatePresence>
        {/* 열릴 때마다 새로 붙어 단계가 처음으로 돌아간다 */}
        {open && <SheetPanel {...props} />}
      </AnimatePresence>
    </Dialog.Root>
  )
}

function SheetPanel({ onClose, hidden = false, peekHeight, children }: SheetPanelProps) {
  const hasPeek = peekHeight !== undefined
  const [step, setStep] = useState<Step>(hasPeek ? 'peek' : 'full')
  const [height, setHeight] = useState(0)
  const sheetRef = useRef<HTMLElement>(null)
  const bodyRef = useRef<HTMLDivElement>(null)
  // 첫 그림부터 화면 밖에 있어야 올라오는 모습이 보인다
  const y = useMotionValue(window.innerHeight)
  const dragControls = useDragControls()

  const peekY = height - (peekHeight ?? 0)
  const target = hidden ? height : step === 'full' ? 0 : peekY

  useLayoutEffect(() => {
    const sheet = sheetRef.current
    if (!sheet) return
    // 창 크기가 바뀌어 시트 높이(부모의 80%)가 달라져도 단계 위치를 다시 맞춘다
    const measure = () => setHeight(sheet.offsetHeight)
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

  const handleDragEnd = (_: unknown, { velocity }: PanInfo) => {
    const projected = y.get() + velocity.y * PROJECTION
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
            className={styles.scrim}
          />
        )}
      </AnimatePresence>
      <Dialog.Content
        forceMount
        asChild
        // 1단계에서 다른 마커를 눌러도 닫히지 않고 내용만 바뀌게 바깥 누름을 무시한다
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
          onDragEnd={handleDragEnd}
          onWheel={(event) => step === 'peek' && event.deltaY > 0 && setStep('full')}
          className={styles.sheet}
        >
          <div
            aria-hidden
            onPointerDown={(event) => dragControls.start(event)}
            className={styles.handle}
          >
            <span className={styles.grip} />
          </div>
          <Dialog.Close aria-label="닫기" className={styles.close}>
            <Icon svg={<IconXmarkLine />} />
          </Dialog.Close>
          <div ref={bodyRef} data-step={step} className={styles.body}>
            {children}
          </div>
        </motion.section>
      </Dialog.Content>
    </>
  )
}
