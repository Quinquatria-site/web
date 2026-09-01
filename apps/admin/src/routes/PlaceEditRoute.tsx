import { useState } from 'react'
import { useNavigate, useParams } from 'react-router'
import { ActionButton } from 'seed-design/ui/action-button'
import { List, ListItem, ListSwitchItem } from 'seed-design/ui/list'
import { Switchmark } from 'seed-design/ui/switch'
import { ListHeader } from 'seed-design/ui/list-header'
import { SelectContent, SelectItem, SelectRoot, SelectTrigger } from 'seed-design/ui/select'
import { TextField, TextFieldInput, TextFieldTextarea } from 'seed-design/ui/text-field'
import { useFormFields } from '../lib/useFormFields'
import { BARS, BOOTHS, COLLEGES, TRUCKS } from '../mocks/data'
import styles from './routes.module.css'

type PlaceKind = 'booths' | 'bars' | 'trucks'

/** 필드를 배열로 두면 나중에 언어 탭을 씌울 때 폼을 다시 짜지 않아도 된다 */
interface TextFieldSpec {
  name: 'name' | 'spotNumber' | 'content'
  label: string
  description?: string
  multiline?: boolean
  placeholder?: string
}

const COMMON_FIELDS: TextFieldSpec[] = [
  { name: 'name', label: '이름', placeholder: '예: 타로 점집' },
  { name: 'spotNumber', label: '위치 번호', description: '지도에 표시되는 자리 번호' },
]

const BOOTH_FIELDS: TextFieldSpec[] = [
  {
    name: 'content',
    label: '컨텐츠',
    description: '체험할 수 있는 것을 적어주세요',
    multiline: true,
    placeholder: '예: 타로 카드로 보는 이번 학기 운세',
  },
]

function findPlace(kind: PlaceKind, id: string | undefined) {
  if (!id || id === 'new') return undefined
  if (kind === 'booths') return BOOTHS.find((item) => item.id === id)
  if (kind === 'bars') return BARS.find((item) => item.id === id)
  return TRUCKS.find((item) => item.id === id)
}

export function PlaceEditRoute() {
  const navigate = useNavigate()
  const params = useParams()
  const kind = (params.kind ?? 'booths') as PlaceKind
  const place = findPlace(kind, params.id)

  const { bind } = useFormFields({
    name: place?.name ?? '',
    spotNumber: place ? String(place.spotNumber) : '',
    content: place && 'content' in place ? place.content : '',
    opensAt: place?.opensAt ?? '',
    closesAt: place?.closesAt ?? '',
  })
  const [closed, setClosed] = useState(place?.closed ?? false)
  const [college, setCollege] = useState(place && 'college' in place ? place.college : COLLEGES[0])

  const fields = kind === 'booths' ? [...COMMON_FIELDS, ...BOOTH_FIELDS] : COMMON_FIELDS
  const priced = place && 'priced' in place ? place.priced : undefined
  const menu = place && 'menu' in place ? place.menu : undefined
  const items = priced ?? menu ?? []
  const itemsLabel = kind === 'booths' ? '유료 체험' : '메뉴'

  return (
    <>
      <div className={styles.form}>
        {fields.map((field) => (
          <TextField
            key={field.name}
            label={field.label}
            description={field.description}
            {...bind(field.name)}
          >
            {field.multiline ? (
              <TextFieldTextarea placeholder={field.placeholder} />
            ) : (
              <TextFieldInput placeholder={field.placeholder} />
            )}
          </TextField>
        ))}

        {kind !== 'trucks' && (
          <SelectRoot
            label="주최 단과대"
            value={[college]}
            onValueChange={(value) => setCollege(value[0] ?? COLLEGES[0])}
          >
            <SelectTrigger placeholder="선택하세요" />
            <SelectContent>
              {COLLEGES.map((item) => (
                <SelectItem key={item} value={item} label={item} />
              ))}
            </SelectContent>
          </SelectRoot>
        )}

        <div className={styles.row}>
          <TextField label="운영 시작" {...bind('opensAt')}>
            <TextFieldInput placeholder="10:00" />
          </TextField>
          <TextField label="운영 종료" {...bind('closesAt')}>
            <TextFieldInput placeholder="18:00" />
          </TextField>
        </div>
      </div>

      <List>
        <ListSwitchItem
          title="마감 처리"
          detail="켜면 사용자 화면에 마감으로 표시됩니다"
          checked={closed}
          onCheckedChange={setClosed}
          suffix={<Switchmark />}
        />
      </List>

      <ListHeader as="h2">{itemsLabel}</ListHeader>
      <List>
        {items.length === 0 ? (
          <ListItem title={`등록된 ${itemsLabel}이 없습니다`} />
        ) : (
          items.map((item) => (
            <ListItem
              key={item.id}
              title={item.name}
              suffix={`${item.price.toLocaleString('ko-KR')}원`}
            />
          ))
        )}
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
