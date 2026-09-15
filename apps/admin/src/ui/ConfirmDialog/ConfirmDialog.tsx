import {
  DialogAction,
  DialogBackdrop,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogPositioner,
  DialogRoot,
  DialogTitle,
} from '@seed-design/react'
import { ActionButton } from 'seed-design/ui/action-button'
import styles from './ConfirmDialog.module.css'

export interface ConfirmDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** 질문. "이 장소를 삭제할까요?" */
  title: string
  /** 대상과 연쇄 범위. 대화상자 폭이 272px 이라 짧게 쓴다 */
  description: string
  /** 되돌릴 수 없는 쪽 버튼의 글자 */
  confirmLabel: string
  onConfirm: () => void
}

/**
 * 되돌릴 수 없는 액션을 한 번 더 묻는다.
 *
 * SEED 에 dialog 스니펫이 없어 @seed-design/react 에서 직접 가져다 쓴다 —
 * Badge·TimePicker 와 같은 방식이다. 레시피에 action 슬롯 CSS 가 없어서
 * 버튼은 앱이 쓰는 ActionButton 을 asChild 로 끼운다.
 *
 * 브라우저 기본 confirm() 은 쓰지 않는다. 화면 밖에서 뜨고 모양을 맞출 수 없다.
 */
export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel,
  onConfirm,
}: ConfirmDialogProps) {
  return (
    <DialogRoot open={open} onOpenChange={onOpenChange}>
      <DialogPositioner>
        <DialogBackdrop />
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
            <DialogDescription>{description}</DialogDescription>
          </DialogHeader>
          {/* footer 레시피가 세로로 쌓는다. 파괴적 액션이 위, 취소가 아래다 —
              iOS·당근의 alert 관례. 뒤집으려면 여기 순서만 바꾸면 된다 */}
          <DialogFooter className={styles.footer}>
            <DialogAction asChild onClick={onConfirm}>
              <ActionButton size="medium" variant="criticalSolid">
                {confirmLabel}
              </ActionButton>
            </DialogAction>
            <DialogAction asChild>
              <ActionButton size="medium" variant="neutralWeak">
                취소
              </ActionButton>
            </DialogAction>
          </DialogFooter>
        </DialogContent>
      </DialogPositioner>
    </DialogRoot>
  )
}
