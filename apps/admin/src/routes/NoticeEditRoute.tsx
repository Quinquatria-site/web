import { useState } from 'react'
import { useNavigate, useParams } from 'react-router'
import { ActionButton } from 'seed-design/ui/action-button'
import { Callout } from 'seed-design/ui/callout'
import { List, ListSwitchItem } from 'seed-design/ui/list'
import { Switchmark } from 'seed-design/ui/switch'
import { TextField, TextFieldInput, TextFieldTextarea } from 'seed-design/ui/text-field'
import { useFormFields } from '../lib/useFormFields'
import { NOTICES } from '../mocks/data'
import styles from './routes.module.css'

export function NoticeEditRoute() {
  const navigate = useNavigate()
  const { id } = useParams()
  const notice = id && id !== 'new' ? NOTICES.find((item) => item.id === id) : undefined

  const { bind } = useFormFields({ title: notice?.title ?? '', body: notice?.body ?? '' })
  const [urgent, setUrgent] = useState(notice?.urgent ?? false)
  const [published, setPublished] = useState(notice?.published ?? false)

  return (
    <>
      <div className={styles.form}>
        <TextField label="제목" showRequiredIndicator {...bind('title')}>
          <TextFieldInput placeholder="예: 우천 시 공연 일정 안내" />
        </TextField>

        <TextField
          label="본문"
          description="사용자 화면 NOTICE 페이지에 그대로 노출됩니다"
          {...bind('body')}
        >
          <TextFieldTextarea placeholder="공지 내용을 적어주세요" />
        </TextField>

        {urgent && (
          <Callout
            title="긴급 공지로 발행됩니다"
            description="게시하면 사용자 화면에 팝업으로 즉시 뜹니다. 정말 급한 내용에만 사용하세요."
          />
        )}
      </div>

      <List>
        <ListSwitchItem
          title="긴급 공지"
          detail="사용자 화면에 팝업으로 띄웁니다"
          checked={urgent}
          onCheckedChange={setUrgent}
          suffix={<Switchmark />}
        />
        <ListSwitchItem
          title="게시"
          detail="끄면 임시저장 상태로 남습니다"
          checked={published}
          onCheckedChange={setPublished}
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
