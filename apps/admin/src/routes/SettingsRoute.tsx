import { ActionButton } from 'seed-design/ui/action-button'
import { List, ListItem } from 'seed-design/ui/list'
import { ListHeader } from 'seed-design/ui/list-header'
import { TextField, TextFieldInput, TextFieldTextarea } from 'seed-design/ui/text-field'
import { useFormFields } from '../lib/useFormFields'
import { FESTIVAL } from '../mocks/data'
import styles from './routes.module.css'

export function SettingsRoute() {
  const { bind } = useFormFields({
    name: FESTIVAL.name,
    concept: FESTIVAL.concept,
    theme: FESTIVAL.theme,
    startsOn: FESTIVAL.startsOn,
    endsOn: FESTIVAL.endsOn,
  })

  return (
    <>
      <div className={styles.form}>
        <TextField label="축제 이름" {...bind('name')}>
          <TextFieldInput />
        </TextField>
        <TextField label="컨셉" {...bind('concept')}>
          <TextFieldInput />
        </TextField>
        <TextField label="테마 문구" {...bind('theme')}>
          <TextFieldTextarea />
        </TextField>
        <div className={styles.row}>
          <TextField label="시작일" {...bind('startsOn')}>
            <TextFieldInput />
          </TextField>
          <TextField label="종료일" {...bind('endsOn')}>
            <TextFieldInput />
          </TextField>
        </div>
      </div>

      <ListHeader as="h2">아직 안 정해진 것</ListHeader>
      <List>
        <ListItem title="배포 기간" detail="축제 전 며칠 오픈, 후 며칠 유지" />
        <ListItem title="부스 총 규모" detail="부스 협의회 이후 확정" />
        <ListItem title="다국어" detail="한·영·중·일 4개 언어. 이번 범위 밖" />
      </List>

      <div className={styles.footer}>
        <ActionButton>저장</ActionButton>
      </div>
    </>
  )
}
