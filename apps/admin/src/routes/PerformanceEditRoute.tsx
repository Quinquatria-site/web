import { useState } from 'react'
import { useNavigate, useParams } from 'react-router'
import { ActionButton } from 'seed-design/ui/action-button'
import { RadioSelectBoxItem, RadioSelectBoxRoot } from 'seed-design/ui/select-box'
import { TextField, TextFieldInput } from 'seed-design/ui/text-field'
import { useFormFields } from '../lib/useFormFields'
import { PERFORMANCES } from '../mocks/data'
import styles from './routes.module.css'

export function PerformanceEditRoute() {
  const navigate = useNavigate()
  const { id } = useParams()
  const performance = id && id !== 'new' ? PERFORMANCES.find((item) => item.id === id) : undefined

  const { bind } = useFormFields({
    artist: performance?.artist ?? '',
    stage: performance?.stage ?? '',
    startsAt: performance?.startsAt ?? '',
    endsAt: performance?.endsAt ?? '',
  })
  const [kind, setKind] = useState<string>(performance?.kind ?? 'student')

  return (
    <>
      <div className={styles.form}>
        <RadioSelectBoxRoot label="구분" columns={2} value={kind} onValueChange={setKind}>
          <RadioSelectBoxItem value="celebrity" label="연예인" description="메인 스테이지" />
          <RadioSelectBoxItem value="student" label="학우" description="학생 공연" />
        </RadioSelectBoxRoot>

        <TextField label="출연자" showRequiredIndicator {...bind('artist')}>
          <TextFieldInput placeholder="예: 밴드 소나기" />
        </TextField>

        <TextField label="무대" {...bind('stage')}>
          <TextFieldInput placeholder="예: 대운동장" />
        </TextField>

        <div className={styles.row}>
          <TextField label="시작" {...bind('startsAt')}>
            <TextFieldInput placeholder="19:00" />
          </TextField>
          <TextField label="종료" {...bind('endsAt')}>
            <TextFieldInput placeholder="19:50" />
          </TextField>
        </div>

        <p className={styles.muted}>
          출연자 사진 첨부는 다음 단계에서 붙입니다. 연예인 정보는 인스타 라인업 공개 시점에 맞춰
          입력합니다.
        </p>
      </div>

      <div className={styles.footer}>
        <ActionButton variant="neutralWeak" onClick={() => navigate(-1)}>
          취소
        </ActionButton>
        <ActionButton onClick={() => navigate(-1)}>저장</ActionButton>
      </div>
    </>
  )
}
