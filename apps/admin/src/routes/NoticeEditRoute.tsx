import { useState } from 'react'
import { useNavigate, useParams } from 'react-router'
import { ActionButton } from 'seed-design/ui/action-button'
import { Callout } from 'seed-design/ui/callout'
import { SegmentedControl, SegmentedControlItem } from 'seed-design/ui/segmented-control'
import { Snackbar, useSnackbarAdapter } from 'seed-design/ui/snackbar'
import { TextField, TextFieldInput, TextFieldTextarea } from 'seed-design/ui/text-field'
import { useFormFields } from '../lib/useFormFields'
import {
  deleteNotice,
  draftId,
  noticeById,
  restoreNotice,
  upsertNotice,
  type NoticeDraft,
} from '../mocks/store'
import {
  dateTimeLabel,
  findTranslation,
  LANGUAGE_CODES,
  NOTICE_TYPES,
  type LanguageCode,
  type NoticeTranslation,
  type NoticeType,
} from '../mocks/types'
import styles from './PerformanceEditRoute.module.css'

const TYPE_LABELS: Record<NoticeType, string> = {
  PERMANENT: '상시',
  GENERAL: '일반',
}

type TranslationField = 'title' | 'content'
const fieldKey = (field: TranslationField, lang: LanguageCode) => `${field}_${lang}` as const

/**
 * 공지 편집 (§5.7). /notices/new 와 /notices/:id 를 겸한다.
 *
 * 입력칸이 없는 것이 하나 있다. created_at 은 서버가 찍고 수정할 수 없다 —
 * 목록 정렬의 유일한 키라서, 고칠 수 있으면 운영자가 순서를 바꾸는 수단이 된다.
 *
 * 번역 규칙이 장소·공연과 다르다. 공지는 title 과 content 가 **둘 다 필수**라
 * (§5.7) 한 언어의 제목만 쓰고 본문을 비우는 것은 보낼 수 없는 상태다.
 * 언어 단위로는 KO 만 필수이고 EN·CHN 은 선택이다 (§5.2).
 */
export function NoticeEditRoute() {
  const params = useParams()
  // 폼 초기값은 첫 렌더에서만 읽힌다. 다른 공지로 이동해도 같은 컴포넌트가
  // 재사용되므로, key 로 갈아끼워 이전 입력이 남지 않게 한다
  return <NoticeEditForm key={params.id ?? 'new'} />
}

function NoticeEditForm() {
  const navigate = useNavigate()
  const snackbar = useSnackbarAdapter()
  const params = useParams()
  const editing = params.id ? noticeById(Number(params.id)) : undefined

  // 축제 중 올라오는 공지는 대부분 일반이다. 상시는 축제 전에 몇 건 걸어두고 끝난다
  const [type, setType] = useState<NoticeType>(editing?.type ?? 'GENERAL')
  const [lang, setLang] = useState<LanguageCode>('KO')
  const [error, setError] = useState<string | null>(null)

  const initialFields: Record<string, string> = {}
  for (const code of LANGUAGE_CODES) {
    const t = editing ? findTranslation(editing.translations, code) : undefined
    initialFields[fieldKey('title', code)] = t?.title ?? ''
    initialFields[fieldKey('content', code)] = t?.content ?? ''
  }
  const { values, bind } = useFormFields(initialFields)

  const save = () => {
    if (!values.title_KO.trim()) return setError('한국어 제목은 필수입니다.')
    if (!values.content_KO.trim()) return setError('한국어 본문은 필수입니다.')

    // EN·CHN 은 언어 단위로만 선택이다. 제목과 본문은 짝이라 한쪽만 채운 상태는
    // 보낼 수 없다 — content 가 필수 필드다 (§5.7). 반쪽짜리를 조용히 버리면
    // 운영자는 번역을 넣었다고 믿는데 학생에게는 안 보인다
    const half = LANGUAGE_CODES.filter((code) => {
      const title = values[fieldKey('title', code)].trim()
      const content = values[fieldKey('content', code)].trim()
      return Boolean(title) !== Boolean(content)
    })
    if (half.length > 0)
      return setError(`${half.join('·')} 은 제목과 본문을 둘 다 채우거나 둘 다 비워주세요.`)

    const id = editing?.id ?? draftId()
    const translations: NoticeTranslation[] = []
    for (const code of LANGUAGE_CODES) {
      const title = values[fieldKey('title', code)].trim()
      if (!title) continue // 위 검사를 통과했으므로 본문도 비어 있다. 안 보낸 언어다 (§5.2)
      const existing = editing ? findTranslation(editing.translations, code) : undefined
      translations.push({
        id: existing?.id ?? draftId(), // 기존 번역의 id 는 유지 (§5.2)
        notice_id: id,
        language_code: code,
        title,
        content: values[fieldKey('content', code)].trim(),
      })
    }
    // 목이 곧 서버 응답이라 정렬까지 맞춘다. Backoffice 응답의 translations 는
    // language_code ASC — 즉 CHN → EN → KO 다 (§5.2). 화면 탭 순서(KO 먼저)와
    // 반대라서, 입력 순서 그대로 두면 목만 다른 모양이 된다.
    translations.sort((a, b) => a.language_code.localeCompare(b.language_code))

    const draft: NoticeDraft = { id, type, translations }
    const saved = upsertNotice(draft)
    snackbar.create({
      timeout: 3000,
      render: () => (
        <Snackbar message={`${values.title_KO} 저장했습니다 (${TYPE_LABELS[saved.type]} 공지)`} />
      ),
    })
    // navigate(-1) 이 아니다 — 이 화면을 새로고침하거나 링크로 바로 열면
    // 뒤로 갈 곳이 admin 밖이다
    navigate('/notices')
  }

  const remove = () => {
    if (!editing) return
    const removed = deleteNotice(editing.id)
    if (!removed) return
    navigate('/notices')
    // 확인 다이얼로그 대신 실행취소 — 현장 한 손 조작에서는 이쪽이 안전하다
    snackbar.create({
      timeout: 6000,
      render: () => (
        <Snackbar
          message="공지를 삭제했습니다"
          actionLabel="실행취소"
          onAction={() => restoreNotice(removed)}
        />
      ),
    })
  }

  // 저장했을 때 실제로 빠질 언어. 제목·본문 중 하나라도 비면 그 언어는 못 나간다
  const missing = LANGUAGE_CODES.filter(
    (code) => !values[fieldKey('title', code)].trim() || !values[fieldKey('content', code)].trim(),
  )

  return (
    <div className={styles.screen}>
      <div className={styles.section}>
        {/* 둘 중 하나라 피커를 띄울 것도 없다. 한 번에 보이는 편이 빠르다 */}
        <div className={styles.field}>
          <span className={styles.fieldLabel}>종류</span>
          <SegmentedControl
            aria-label="공지 종류"
            value={type}
            onValueChange={(value) => setType(value as NoticeType)}
          >
            {NOTICE_TYPES.map((value) => (
              <SegmentedControlItem key={value} value={value}>
                {TYPE_LABELS[value]}
              </SegmentedControlItem>
            ))}
          </SegmentedControl>
        </div>

        {/* 잘못 고르면 학생 앱에서 노출 위치 자체가 바뀐다. admin 은 한 경로에
            type 쿼리지만 Customer API 는 경로가 갈린다 (§3.5) — 입력칸 옆에 적어둔다 */}
        <p className={styles.hint}>
          <strong>상시</strong> 는 학생 앱 공지 목록 맨 위에 축제 내내 붙어 있습니다.{' '}
          <strong>일반</strong> 은 최신순으로 내려갑니다. 두 종류는 서로 다른 목록으로 나가므로
          종류를 바꾸면 학생이 보는 자리가 달라집니다.
          {editing &&
            ` 이 공지는 ${dateTimeLabel(editing.created_at)} 에 등록됐습니다. 등록 시각은 바꿀 수 없습니다.`}
        </p>

        {/* 이미 나가 있는 공지의 자리를 옮기는 것이라 새로 쓰는 것과 무게가 다르다.
            위 설명은 항상 떠 있어 눈에 익지만, 이건 실제로 건드렸을 때만 나온다.

            라벨 뒤에 "공지" 를 붙여 쓴다. 라벨만 끼우면 받침에 따라 조사가
            갈리는데("상시로" / "일반으로"), "공지" 는 받침이 없어 늘 "로" 다 */}
        {editing && editing.type !== type && (
          <Callout
            tone="warning"
            description={`저장하면 ${TYPE_LABELS[editing.type]} 공지에서 ${TYPE_LABELS[type]} 공지로 옮겨갑니다. 학생이 보던 자리가 바뀝니다.`}
          />
        )}
      </div>

      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>내용</h2>
        <SegmentedControl
          aria-label="언어"
          value={lang}
          onValueChange={(value) => setLang(value as LanguageCode)}
        >
          {LANGUAGE_CODES.map((code) => (
            <SegmentedControlItem key={code} value={code}>
              {code}
            </SegmentedControlItem>
          ))}
        </SegmentedControl>
        {missing.length > 0 && (
          <Callout
            tone="warning"
            description={`${missing.join('·')} 번역이 비어 있습니다. 그 언어로 보는 학생에게 이 공지는 존재하지 않습니다.`}
          />
        )}

        <TextField
          label="제목"
          showRequiredIndicator={lang === 'KO'}
          {...bind(fieldKey('title', lang))}
        >
          <TextFieldInput placeholder={lang === 'KO' ? '예: 우천 시 무대 운영 안내' : ''} />
        </TextField>
        <TextField
          label="본문"
          description="제목만 채우고 본문을 비우면 그 언어는 저장되지 않습니다"
          showRequiredIndicator={lang === 'KO'}
          {...bind(fieldKey('content', lang))}
        >
          <TextFieldTextarea
            placeholder={lang === 'KO' ? '무엇이 언제 어떻게 바뀌는지 적어주세요' : ''}
          />
        </TextField>
      </div>

      {/* 되돌릴 수 없는 액션이라 저장 옆에 두지 않는다. 일부러 내려와야 닿는 자리다 */}
      {editing && (
        <div className={styles.dangerZone}>
          <ActionButton size="medium" variant="criticalSolid" onClick={remove}>
            이 공지 삭제
          </ActionButton>
        </div>
      )}

      {/* 스크롤 위치와 무관하게 닿는 하단 고정 바. 오류도 여기 붙어야 보인다 */}
      <div className={styles.footer}>
        {error && <Callout tone="critical" description={error} />}
        <ActionButton size="large" onClick={save}>
          저장
        </ActionButton>
      </div>
    </div>
  )
}
