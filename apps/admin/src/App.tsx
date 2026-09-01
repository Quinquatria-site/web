import { useState } from 'react'
import { ActionButton } from 'seed-design/ui/action-button'
import { Callout } from 'seed-design/ui/callout'
import { RadioSelectBoxItem, RadioSelectBoxRoot } from 'seed-design/ui/select-box'
import { Switch } from 'seed-design/ui/switch'
import { TablePagination } from 'seed-design/ui/table-pagination'
import { TextField, TextFieldInput, TextFieldTextarea } from 'seed-design/ui/text-field'
import { BoothTable, type Booth } from './components/BoothTable'
import styles from './App.module.css'

const CATEGORIES = [
  { value: 'food', label: '음식', description: '조리·판매' },
  { value: 'experience', label: '체험', description: '참여형 부스' },
  { value: 'goods', label: '판매', description: '물품 판매' },
  { value: 'exhibit', label: '전시', description: '작품·홍보' },
]

const BOOTHS: Booth[] = [
  { id: '1', name: '외대떡볶이', category: 'food', club: '요리연구회', published: true },
  { id: '2', name: '타로 점집', category: 'experience', club: '심리학회', published: true },
  { id: '3', name: '과잠 굿즈', category: 'goods', club: '총학생회', published: false },
  { id: '4', name: '사진전 「가을」', category: 'exhibit', club: '사진동아리', published: false },
]

function App() {
  const [name, setName] = useState('')
  const [intro, setIntro] = useState('')
  const [category, setCategory] = useState('food')
  const [published, setPublished] = useState(false)

  const nameInvalid = name.trim().length === 0

  return (
    <div className={styles.page}>
      <div className={styles.viewport}>
        <form className={styles.form} onSubmit={(e) => e.preventDefault()}>
          <h1 className={styles.heading}>부스 등록</h1>

          <Callout description="SEED Design 파일럿 화면입니다. 저장은 아직 동작하지 않습니다." />

          <TextField
            label="부스명"
            description="축제 안내 페이지에 그대로 노출됩니다"
            errorMessage="부스명을 입력해주세요"
            invalid={nameInvalid}
            showRequiredIndicator
            value={name}
            onValueChange={({ value }) => setName(value)}
            maxGraphemeCount={20}
          >
            <TextFieldInput placeholder="예: 외대떡볶이" />
          </TextField>

          <TextField
            label="소개"
            description="학생들에게 보여줄 한두 문장"
            value={intro}
            onValueChange={({ value }) => setIntro(value)}
            maxGraphemeCount={100}
          >
            <TextFieldTextarea placeholder="무엇을 파는 부스인지 적어주세요" />
          </TextField>

          <RadioSelectBoxRoot
            label="분류"
            columns={2}
            value={category}
            onValueChange={(value) => setCategory(value)}
          >
            {CATEGORIES.map((c) => (
              <RadioSelectBoxItem
                key={c.value}
                value={c.value}
                label={c.label}
                description={c.description}
              />
            ))}
          </RadioSelectBoxRoot>

          <Switch
            label="지금 공개"
            checked={published}
            onCheckedChange={(checked) => setPublished(checked)}
          />

          <div className={styles.actions}>
            <ActionButton variant="neutralWeak" type="button">
              취소
            </ActionButton>
            <ActionButton type="submit" disabled={nameInvalid}>
              저장
            </ActionButton>
          </div>
        </form>

        <section className={styles.list}>
          <h2 className={styles.heading}>부스 목록</h2>
          <BoothTable booths={BOOTHS} />
          <TablePagination totalItems={BOOTHS.length} />
        </section>
      </div>
    </div>
  )
}

export default App
