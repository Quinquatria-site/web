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
  deleteNoticeTranslation,
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
// 폼 뼈대는 공연 편집 화면과 같은 값을 쓴다 (MenuEditRoute 전례).
// own 은 공지에만 있는 것 — 종류 설명 블록뿐이다
import own from './NoticeEditRoute.module.css'
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

  // 없는 공지를 편집으로 열면 빈 작성 폼이 떠서, 새로 쓰는 것인지 고치는 것인지
  // 알 수 없다. 실제 API 에서는 404 RESOURCE_NOT_FOUND 다 (§6). 목 스토어는
  // 세션 한정이라 새로고침만 해도 같은 상태가 되므로 둘을 같게 다룬다.
  // 폼보다 바깥에서 거르는 이유는 폼이 훅을 여럿 쓰기 때문이다 — 안에서
  // 조기 반환하면 렌더마다 훅 수가 달라진다.
  if (params.id && !noticeById(Number(params.id))) return <NoticeNotFound />

  // 폼 초기값은 첫 렌더에서만 읽힌다. 다른 공지로 이동해도 같은 컴포넌트가
  // 재사용되므로, key 로 갈아끼워 이전 입력이 남지 않게 한다
  return <NoticeEditForm key={params.id ?? 'new'} />
}

/** 편집 화면의 뼈대를 그대로 쓴다. 상단바에 뒤로가기가 이미 있어 문은 하나면 된다 */
function NoticeNotFound() {
  const navigate = useNavigate()
  return (
    <div className={styles.screen}>
      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>없는 공지입니다</h2>
        <p className={styles.hint}>
          지워졌거나 주소가 잘못됐습니다. 목 데이터는 새로고침하면 처음 상태로 돌아가므로,
          방금 만든 공지는 새로고침 뒤 사라집니다.
        </p>
        <div>
          <ActionButton size="medium" variant="neutralWeak" onClick={() => navigate('/notices')}>
            공지 목록으로
          </ActionButton>
        </div>
      </div>
    </div>
  )
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
      // 위 검사를 통과했으므로 본문도 비어 있다. PATCH 본문에서 뺀다 — 다만
      // 빼는 것만으로는 안 지워진다. 원래 있던 언어라면 아래에서 전용 삭제를
      // 부른다 (§5.2)
      if (!title) continue
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

    // 지우기 전에 원본을 붙잡는다. upsertNotice 가 NOTICES 의 항목을 새 객체로
    // 갈아끼우므로 editing 은 이전 상태를 그대로 들고 있다
    const undo = removing
      .map((code) => editing && findTranslation(editing.translations, code))
      .filter((t): t is NoticeTranslation => Boolean(t))

    const draft: NoticeDraft = { id, type, translations }
    const saved = upsertNotice(draft)

    // 실제 클라이언트가 보낼 두 호출과 같은 순서다 — PATCH 로 남길 언어를
    // 올리고, 지울 언어는 전용 DELETE 로 따로 부른다 (§5.2)
    for (const code of removing) {
      const rejected = deleteNoticeTranslation(saved.id, code)
      if (rejected) return setError(rejected)
    }

    // 번역을 지웠으면 무엇을 지웠는지 밝히고 되돌릴 틈을 준다. 공지 삭제와 같은
    // 정책이다 — 지워진 번역문은 다시 타이핑해야 해서 실수의 대가가 크다.
    // 되돌리기는 upsertNotice 로 충분하다. 언어별 병합이라(§5.2) 지운 언어만
    // 다시 넣고 나머지는 건드리지 않는다
    snackbar.create(
      undo.length > 0
        ? {
            timeout: 6000,
            render: () => (
              <Snackbar
                message={`${values.title_KO} 저장했습니다 · ${removing.join('·')} 번역 삭제`}
                actionLabel="실행취소"
                onAction={() => upsertNotice({ id: saved.id, type: saved.type, translations: undo })}
              />
            ),
          }
        : {
            timeout: 3000,
            render: () => (
              <Snackbar
                message={`${values.title_KO} 저장했습니다 (${TYPE_LABELS[saved.type]} 공지)`}
              />
            ),
          },
    )
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

  // 원래 있었는데 지금 둘 다 비운 언어 = 지우려는 것. 원래 없던 언어와는 결과가
  // 다르다 — 이미 학생에게 나가 있던 번역이 내려간다.
  // KO 는 뺀다. 명세상 KO 삭제는 409 지만(§5.2) 화면은 필수 검증으로 저장을
  // 먼저 막으므로, 지우는 중이라고 말하면 잘못된 안내가 된다
  const removing = editing
    ? LANGUAGE_CODES.filter(
        (code) =>
          code !== 'KO' &&
          findTranslation(editing.translations, code) &&
          !values[fieldKey('title', code)].trim() &&
          !values[fieldKey('content', code)].trim(),
      )
    : []
  // 원래부터 없던 언어. 이쪽은 "아직 안 채웠다" 라 톤이 다르다
  const blank = missing.filter((code) => !removing.includes(code))

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
            type 쿼리지만 Customer API 는 경로가 갈린다 (§3.5) — 입력칸 옆에 적어둔다.
            한 문단에 몰아 쓰면 안 읽히므로 둘을 나란히 세워 비교하게 한다 */}
        <dl className={own.types}>
          <dt className={own.typeLabel}>상시</dt>
          <dd className={own.typeText}>축제 내내 공지 목록 맨 위에 고정됩니다.</dd>
          <dt className={own.typeLabel}>일반</dt>
          <dd className={own.typeText}>최신순으로 내려갑니다.</dd>
        </dl>
        <p className={styles.hint}>
          두 종류는 학생 앱에서 서로 다른 목록으로 나갑니다. 종류를 바꾸면 학생이 보는 자리가
          달라집니다.
        </p>

        {/* 종류 설명과 다른 이야기라 문단을 갈라놓는다 */}
        {editing && (
          <p className={own.meta}>
            등록 {dateTimeLabel(editing.created_at)} · 등록 시각은 바꿀 수 없습니다.
          </p>
        )}

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
        {/* 이미 나가 있던 번역을 내리는 것이라 아직 안 채운 것과 무게가 다르다.
            비운 순간 말해줘야 저장 버튼을 누르기 전에 되돌릴 수 있다 */}
        {removing.length > 0 && (
          <Callout
            tone="critical"
            description={`${removing.join('·')} 번역을 삭제합니다. 저장하면 그 언어로 보는 학생에게 이 공지가 사라집니다.`}
          />
        )}
        {blank.length > 0 && (
          <Callout
            tone="warning"
            description={`${blank.join('·')} 번역이 비어 있습니다. 그 언어로 보는 학생에게 이 공지는 존재하지 않습니다.`}
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
          description="제목과 본문은 짝입니다. 둘 다 채우거나 둘 다 비워주세요"
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
