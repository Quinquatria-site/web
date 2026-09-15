import { TimePicker } from '@seed-design/react'
import { useState } from 'react'
import { ActionButton } from 'seed-design/ui/action-button'
import { BottomSheetBody, BottomSheetContent, BottomSheetRoot } from 'seed-design/ui/bottom-sheet'
import { FieldButton, FieldButtonValue } from 'seed-design/ui/field-button'
import { TextField, TextFieldInput } from 'seed-design/ui/text-field'
import { useCoarsePointer } from '../../lib/usePointerType'
import styles from './HourField.module.css'

/** 24시간제 시·분. SEED TimePicker 가 쓰는 모양 그대로다 */
export interface Hour {
  hour: number
  minute: number
}

const formatHour = ({ hour, minute }: Hour) =>
  `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`

/** input[type=time] 의 "HH:MM". 덜 친 값은 빈 문자열로 온다 */
function parseHour(text: string): Hour | null {
  const match = /^(\d{2}):(\d{2})$/.exec(text)
  if (!match) return null
  const hour = Number(match[1])
  const minute = Number(match[2])
  if (hour > 23 || minute > 59) return null
  return { hour, minute }
}

export interface HourFieldProps {
  label: string
  value: Hour
  onValueChange: (value: Hour) => void
  invalid?: boolean
  errorMessage?: string
}

/**
 * 운영 시각 입력. 기기에 따라 입력 수단이 갈린다.
 *
 * 터치면 휠, 마우스·키보드면 타이핑이다. 휠은 엄지로 굴리기 좋지만 마우스로는
 * 한 열만 집어 끌 수가 없어 옆 열까지 같이 움직인다. 반대로 키보드가 있으면
 * 17:00 은 네 글자 치는 게 제일 빠르다.
 */
export function HourField(props: HourFieldProps) {
  return useCoarsePointer() ? <WheelHourField {...props} /> : <TypedHourField {...props} />
}

/**
 * 데스크톱. input[type=time] 은 HH:MM 칸을 직접 칠 수 있고 위/아래 화살표도
 * 먹으며, 크롬 121+ 는 시계 드롭다운까지 준다.
 *
 * 휠과 달리 분 단위를 제한하지 않는다 — 17:05 처럼 10분 배수가 아닌 값도
 * 받는다. 명세상 start_hour 는 datetime 이라 분 제약이 없고, 칠 수 있는데
 * 막을 이유가 없다.
 */
function TypedHourField({ label, value, onValueChange, invalid, errorMessage }: HourFieldProps) {
  const [text, setText] = useState(() => formatHour(value))

  const change = (next: string) => {
    setText(next)
    // 지웠다 다시 치는 동안 빈 문자열이 올라온다. 그대로 부모에 넘기면 값이
    // 사라지므로, 온전히 파싱될 때만 올린다
    const parsed = parseHour(next)
    if (parsed) onValueChange(parsed)
  }

  // 덜 친 채로 빠져나가면 마지막으로 성사된 값으로 되돌린다
  const restore = () => setText(formatHour(value))

  return (
    <TextField
      label={label}
      value={text}
      onValueChange={({ value: next }) => change(next)}
      invalid={invalid}
      errorMessage={errorMessage}
    >
      <TextFieldInput type="time" onBlur={restore} />
    </TextField>
  )
}

/**
 * 폰. 값은 시트를 닫을 때가 아니라 확인을 눌러야 반영된다 — 휠이 멈출 때마다
 * 바로 반영하면 스치듯 지나간 값이 저장돼버린다.
 */
function WheelHourField({ label, value, onValueChange, invalid, errorMessage }: HourFieldProps) {
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
