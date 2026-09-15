import IconXmarkLine from '@karrotmarket/react-monochrome-icon/IconXmarkLine'
import { Icon } from '@seed-design/react'
import { useEffect, type ReactNode, type Ref } from 'react'
import styles from './Sheet.module.css'

export interface SheetProps {
  open: boolean
  onClose: () => void
  /** 시트 제목이자 접근성 이름 */
  title: string
  children: ReactNode
  /** 높이를 재야 하는 쪽을 위해 연다 — 지도가 덮이는 만큼 영역을 줄인다 */
  ref?: Ref<HTMLDivElement>
}

/**
 * 비모달 바텀시트. 지도 위에 띄우려고 만들었다.
 *
 * SEED 의 BottomSheet 는 언제나 Backdrop 을 깐다(seed-design/ui/bottom-sheet.tsx).
 * 값 하나를 고르고 닫는 자리에는 맞지만 지도에는 안 맞는다 — 시트를 띄운 채로도
 * 지도가 보이고 다른 마커가 눌려야 한다. 하단 탭바와 같은 이유로 직접 만든다.
 *
 * 부모가 position: relative 여야 한다. 뷰포트가 아니라 그 상자 안에 눕는다 —
 * AppLayout 이 데스크톱에서 480px 기둥을 만들기 때문에 fixed 면 기둥 밖으로 샌다.
 */
export function Sheet({ open, onClose, title, children, ref }: SheetProps) {
  useEffect(() => {
    if (!open) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  return (
    // 닫혀 있어도 DOM 에 남긴다 — 내려가는 동안 보여야 한다.
    // visibility 로 감추므로 닫힌 시트의 버튼에는 포커스가 들어가지 않는다.
    <div
      ref={ref}
      className={open ? `${styles.sheet} ${styles.open}` : styles.sheet}
      role="dialog"
      aria-modal="false"
      aria-label={title}
      aria-hidden={!open}
    >
      <div className={styles.header}>
        <h2 className={styles.title}>{title}</h2>
        <button type="button" className={styles.close} onClick={onClose} aria-label="닫기">
          <Icon svg={<IconXmarkLine />} />
        </button>
      </div>
      <div className={styles.body}>{children}</div>
    </div>
  )
}
