import { useState } from 'react'
import { useNavigate, useParams } from 'react-router'
import { ActionButton } from 'seed-design/ui/action-button'
import { List, ListSwitchItem } from 'seed-design/ui/list'
import { Switchmark } from 'seed-design/ui/switch'
import { TextField, TextFieldInput } from 'seed-design/ui/text-field'
import { useFormFields } from '../lib/useFormFields'
import { LOST_ITEMS } from '../mocks/data'
import styles from './routes.module.css'

export function LostItemEditRoute() {
  const navigate = useNavigate()
  const { id } = useParams()
  const item = id && id !== 'new' ? LOST_ITEMS.find((entry) => entry.id === id) : undefined

  const { bind } = useFormFields({
    name: item?.name ?? '',
    foundPlace: item?.foundPlace ?? '',
    foundAt: item?.foundAt ?? '',
  })
  const [returned, setReturned] = useState(item?.returned ?? false)

  return (
    <>
      <div className={styles.form}>
        <TextField label="물품" showRequiredIndicator {...bind('name')}>
          <TextFieldInput placeholder="예: 검정 에어팟 케이스" />
        </TextField>
        <TextField label="습득 장소" {...bind('foundPlace')}>
          <TextFieldInput placeholder="예: 대운동장 스탠드" />
        </TextField>
        <TextField label="습득 시각" {...bind('foundAt')}>
          <TextFieldInput placeholder="10-07 16:20" />
        </TextField>
        <p className={styles.muted}>
          사진 첨부는 다음 단계에서 붙입니다. 문의는 사용자 화면에 총학 연락처로 안내합니다.
        </p>
      </div>

      <List>
        <ListSwitchItem
          title="수령 완료"
          detail="주인에게 돌아갔으면 켜주세요"
          checked={returned}
          onCheckedChange={setReturned}
          suffix={<Switchmark />}
        />
      </List>

      <div className={styles.footer}>
        <ActionButton variant="neutralWeak" onClick={() => navigate(-1)}>
          취소
        </ActionButton>
        <ActionButton onClick={() => navigate(-1)}>저장</ActionButton>
      </div>
    </>
  )
}
