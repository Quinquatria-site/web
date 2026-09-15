import { TimePicker } from '@seed-design/react'
import { useState } from 'react'
import { ActionButton } from 'seed-design/ui/action-button'
import { BottomSheetBody, BottomSheetContent, BottomSheetRoot } from 'seed-design/ui/bottom-sheet'
import { FieldButton, FieldButtonValue } from 'seed-design/ui/field-button'
import styles from './HourField.module.css'

/** 24시간제 시·분. SEED TimePicker 가 쓰는 모양 그대로다 */
export interface Hour {
  hour: number
  minute: number
}

const formatHour = ({ hour, minute }: Hour) =>
  `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`

export interface HourFieldProps {
  label: string
  value: Hour
  onValueChange: (value: Hour) => void
  invalid?: boolean
  errorMessage?: string
}

/**
 * 운영 시각 입력. datetime-local 대신 쓴다.
 *
 * 네이티브 입력은 브라우저마다 피커가 달라 폰에서 무엇이 뜰지 예측할 수 없다.
 * SEED 는 모바일 폼의 시간 입력에 BottomSheet 를 먼저 검토하라고 안내하고,
 * 휠은 한 손 엄지로 굴리기 좋다.
 *
 * 값은 시트를 닫을 때가 아니라 확인을 눌러야 반영된다 — 휠이 멈출 때마다
 * 바로 반영하면 스치듯 지나간 값이 저장돼버린다.
 */
export function HourField({ label, value, onValueChange, invalid, errorMessage }: HourFieldProps) {
  const [open, setOpen] = useState(false)
  const [draft, setDraft] = useState<Hour>(value)

  const openSheet = () => {
    setDraft(value) // 지난번에 취소한 값이 남지 않게 매번 현재 값에서 시작한다
    setOpen(true)
  }

  const confirm = () => {
    onValueChange(draft)
    setOpen(false)
  }

  return (
    <>
      <FieldButton
        label={label}
        invalid={invalid}
        errorMessage={errorMessage}
        buttonProps={{ onClick: openSheet, 'aria-label': `${label} 선택` }}
      >
        <FieldButtonValue>{formatHour(value)}</FieldButtonValue>
      </FieldButton>

      <BottomSheetRoot open={open} onOpenChange={setOpen}>
        <BottomSheetContent title={label}>
          <BottomSheetBody>
            <div className={styles.picker}>
              {/* 부스 운영 시간에 1분 단위는 의미가 없다. 휠을 짧게 만든다 */}
              <TimePicker value={draft} onValueChange={setDraft} minuteStep={10} />
            </div>
            <ActionButton size="large" onClick={confirm}>
              확인
            </ActionButton>
          </BottomSheetBody>
        </BottomSheetContent>
      </BottomSheetRoot>
    </>
  )
}
