import { useState } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router'
import { ActionButton } from 'seed-design/ui/action-button'
import { Callout } from 'seed-design/ui/callout'
import { SegmentedControl, SegmentedControlItem } from 'seed-design/ui/segmented-control'
import { SelectContent, SelectItem, SelectRoot, SelectTrigger } from 'seed-design/ui/select'
import { Snackbar, useSnackbarAdapter } from 'seed-design/ui/snackbar'
import { TextField, TextFieldInput, TextFieldTextarea } from 'seed-design/ui/text-field'
import { useFormFields } from '../lib/useFormFields'
import { ConfirmDialog, PhotoPicker } from '../ui'
import {
  deletePerformance,
  deletePerformanceTranslation,
  draftId,
  performanceById,
  restorePerformance,
  upsertPerformance,
  type PerformanceDraft,
} from '../mocks/store'
import {
  FESTIVAL_DATES,
  festivalDayLabel,
  findTranslation,
  LANGUAGE_CODES,
  PERFORMANCE_TYPES,
  type LanguageCode,
  type PerformanceTranslation,
  type PerformanceType,
} from '../mocks/types'
import styles from './PerformanceEditRoute.module.css'

const TYPE_LABELS: Record<PerformanceType, string> = {
  ARTIST: '연예인 공연',
  STUDENT: '학생 공연',
  SPECIAL: '특별 무대 (응원제·가요제)',
}

type TranslationField = 'title' | 'desc'
const fieldKey = (field: TranslationField, lang: LanguageCode) => `${field}_${lang}` as const

/**
 * 공연 편집 (§5.6). /performances/new 와 /performances/:id 를 겸한다.
 *
 * 입력칸이 없는 것이 두 개 있다. 둘 다 요청 본문에 넣으면 422 다.
 * - seq: 서버가 정한다. 생성이면 그 일차의 맨 뒤, 일차를 옮기면 옮긴 일차의 맨 뒤.
 *   순서를 바꾸는 수단은 목록 화면의 재정렬뿐이다.
 * - is_live: 전용 엔드포인트로만 바뀐다. 목록 화면의 토글이 그것이다.
 *
 * 번역은 §5.2 대로 KO 만 필수다. EN·CHN 은 제목이 비어 있으면 PATCH 본문에서
 * 빼는데, 빼는 것은 "변경하지 않음" 이지 삭제가 아니다 — 원래 있던 언어를
 * 비웠다면 저장 루틴이 전용 DELETE 를 따로 부른다.
 */
export function PerformanceEditRoute() {
  const params = useParams()
  // 폼 초기값은 첫 렌더에서만 읽힌다. 다른 공연으로 이동해도 같은 컴포넌트가
  // 재사용되므로, key 로 갈아끼워 이전 입력이 남지 않게 한다
  return <PerformanceEditForm key={params.id ?? 'new'} />
}

function PerformanceEditForm() {
  const navigate = useNavigate()
  const snackbar = useSnackbarAdapter()
  const params = useParams()
  const [searchParams] = useSearchParams()
  const editing = params.id ? performanceById(Number(params.id)) : undefined

  // 추가로 들어올 때는 목록이 보고 있던 일차를 그대로 받는다
  const fromList = searchParams.get('date')
  const initialDate = FESTIVAL_DATES.some((value) => value === fromList)
    ? (fromList as string)
    : FESTIVAL_DATES[0]

  const [lang, setLang] = useState<LanguageCode>('KO')
  const [type, setType] = useState<PerformanceType>(editing?.type ?? 'STUDENT')
  const [date, setDate] = useState<string>(editing?.date ?? initialDate)
  const [error, setError] = useState<string | null>(null)
  const [confirming, setConfirming] = useState(false)
  // 사진만 useFormFields 밖이다. 그쪽은 문자열 전용이고 이건 key 배열이다.
  // 명세는 한 장(§5.6)이라 아래에서 접는다
  const [photos, setPhotos] = useState<string[]>(editing?.image_uri ? [editing.image_uri] : [])

  const initialFields: Record<string, string> = {}
  for (const code of LANGUAGE_CODES) {
    const t = editing ? findTranslation(editing.translations, code) : undefined
    initialFields[fieldKey('title', code)] = t?.title ?? ''
    initialFields[fieldKey('desc', code)] = t?.description ?? ''
  }
  const { values, bind } = useFormFields(initialFields)

  /** 저장·삭제 뒤에는 방금 손댄 일차로 돌아가야 바뀐 것이 보인다 */
  const backToList = (target: string) => navigate(`/performances?date=${target}`)

  const save = () => {
    if (!values.title_KO.trim()) return setError('한국어 제목은 필수입니다.')

    const id = editing?.id ?? draftId()
    const translations: PerformanceTranslation[] = []
    for (const code of LANGUAGE_CODES) {
      const title = values[fieldKey('title', code)].trim()
      // PATCH 본문에서 뺀다 — 다만 빼는 것만으로는 안 지워진다. 원래 있던
      // 언어라면 아래에서 전용 삭제를 부른다 (§5.2)
      if (!title) continue // EN·CHN 은 선택 (§5.2)
      const existing = editing ? findTranslation(editing.translations, code) : undefined
      translations.push({
        id: existing?.id ?? draftId(), // 기존 번역의 id 는 유지 (§5.2)
        performance_id: id,
        language_code: code,
        title,
        description: values[fieldKey('desc', code)].trim(),
      })
    }
    // 목이 곧 서버 응답이라 정렬까지 맞춘다. Backoffice 응답의 translations 는
    // language_code ASC — 즉 CHN → EN → KO 다 (§5.2). 화면 탭 순서(KO 먼저)와
    // 반대라서, 입력 순서 그대로 두면 목만 다른 모양이 된다.
    translations.sort((a, b) => a.language_code.localeCompare(b.language_code))

    const draft: PerformanceDraft = {
      id,
      type,
      // 명세는 한 장이고 PhotoPicker 는 목록을 다룬다. 접는 것은 여기 한 곳뿐이다
      image_uri: photos[0] ?? null,
      date,
      translations,
    }
    // 지우기 전에 원본을 붙잡는다. upsertPerformance 가 PERFORMANCES 의 항목을
    // 새 객체로 갈아끼우므로 editing 은 이전 상태를 그대로 들고 있다
    const undo = removing
      .map((code) => editing && findTranslation(editing.translations, code))
      .filter((t): t is PerformanceTranslation => Boolean(t))

    const saved = upsertPerformance(draft)

    // PATCH 로 남길 언어를 올리고, 지울 언어는 전용 DELETE 로 따로 부른다 (§5.2)
    for (const code of removing) {
      const rejected = deletePerformanceTranslation(saved.id, code)
      if (rejected) return setError(rejected)
    }

    const message = `${values.title_KO} 저장했습니다 (${festivalDayLabel(saved.date)} ${saved.seq}번째)`
    snackbar.create(
      undo.length > 0
        ? {
            timeout: 6000,
            render: () => (
              <Snackbar
                message={`${message} · ${removing.join('·')} 번역 삭제`}
                actionLabel="실행취소"
                // draft 를 쓴다. saved 를 퍼뜨리면 seq·is_live 가 딸려와
                // PerformanceDraft 타입에 안 맞는다 — 둘 다 서버 몫이다
                onAction={() => upsertPerformance({ ...draft, translations: undo })}
              />
            ),
          }
        : {
            timeout: 3000,
            render: () => <Snackbar message={message} />,
          },
    )
    // navigate(-1) 이 아니다 — 이 화면을 새로고침하거나 링크로 바로 열면
    // 뒤로 갈 곳이 admin 밖이다
    backToList(saved.date)
  }

  const remove = () => {
    if (!editing) return
    const removed = deletePerformance(editing.id)
    if (!removed) return
    backToList(removed.date)
    // 확인을 받고 지웠더라도 실행취소는 남긴다. 확인은 실수를, 이쪽은 변심을 받는다
    snackbar.create({
      timeout: 6000,
      render: () => (
        <Snackbar
          message={`삭제했습니다 (${festivalDayLabel(removed.date)} 순서 다시 매김)`}
          actionLabel="실행취소"
          onAction={() => restorePerformance(removed)}
        />
      ),
    })
  }

  const missing = LANGUAGE_CODES.filter((code) => !values[fieldKey('title', code)].trim())
  // 이미 나가 있던 번역을 내리는 것. 아직 안 채운 언어와 대가가 달라 갈라 둔다.
  // 판정은 제목만 본다 — description 은 명세상 선택이라 짝이 아니다 (§5.2)
  const removing = editing
    ? LANGUAGE_CODES.filter(
        (code) =>
          code !== 'KO' &&
          findTranslation(editing.translations, code) &&
          !values[fieldKey('title', code)].trim(),
      )
    : []
  // 원래부터 없던 언어. 이쪽은 "아직 안 채웠다" 라 톤이 다르다
  const blank = missing.filter((code) => !removing.includes(code))

  return (
    <div className={styles.screen}>
      <div className={styles.section}>
        <SelectRoot
          label="유형"
          value={[type]}
          onValueChange={(value) => setType((value[0] as PerformanceType) ?? type)}
        >
          <SelectTrigger placeholder="선택하세요" />
          <SelectContent>
            {PERFORMANCE_TYPES.map((value) => (
              <SelectItem key={value} value={value} label={TYPE_LABELS[value]} />
            ))}
          </SelectContent>
        </SelectRoot>

        {/* 일차는 둘 중 하나라 피커를 띄울 것도 없다. 한 번에 보이는 편이 빠르다 */}
        <div className={styles.field}>
          <span className={styles.fieldLabel}>축제 일차</span>
          <SegmentedControl aria-label="축제 일차" value={date} onValueChange={setDate}>
            {FESTIVAL_DATES.map((value) => (
              <SegmentedControlItem key={value} value={value}>
                {festivalDayLabel(value)}
              </SegmentedControlItem>
            ))}
          </SegmentedControl>
        </div>

        {/* 왜 순서·현재공연 입력칸이 없는지 적어 둔다. 없는 것이 실수로 보이지 않게 */}
        <p className={styles.hint}>
          공연은 시각을 갖지 않습니다. 순서는 목록의 <strong>순서 바꾸기</strong> 로, 현재 공연
          표시는 목록의 <strong>스위치</strong> 로 바꿉니다.
          {editing && ` 지금 이 공연은 ${festivalDayLabel(editing.date)} ${editing.seq}번째입니다.`}
        </p>
      </div>

      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>사진</h2>
        <PhotoPicker
          value={photos}
          onChange={setPhotos}
          max={1}
          label={values.title_KO.trim() || '공연'}
        />
      </div>

      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>소개</h2>
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
        {removing.length > 0 && (
          <Callout
            tone="critical"
            description={`${removing.join('·')} 번역을 삭제합니다. 저장하면 그 언어로 보는 학생에게 이 공연이 사라집니다.`}
          />
        )}
        {blank.length > 0 && (
          <Callout
            tone="warning"
            description={`${blank.join('·')} 이 비어 있습니다. 그 언어 사용자에게는 이 공연이 보이지 않습니다.`}
          />
        )}

        <TextField
          label="제목"
          description="공연 이름 또는 팀명"
          showRequiredIndicator={lang === 'KO'}
          {...bind(fieldKey('title', lang))}
        >
          <TextFieldInput placeholder={lang === 'KO' ? '예: 개막 무대' : ''} />
        </TextField>
        <TextField label="설명" {...bind(fieldKey('desc', lang))}>
          <TextFieldTextarea
            placeholder={lang === 'KO' ? '어떤 무대인지, 누가 오르는지 적어주세요' : ''}
          />
        </TextField>
      </div>

      {/* 되돌릴 수 없는 액션이라 저장 옆에 두지 않는다. 일부러 내려와야 닿는 자리다 */}
      {editing && (
        <div className={styles.dangerZone}>
          <ActionButton size="medium" variant="criticalSolid" onClick={() => setConfirming(true)}>
            이 공연 삭제
          </ActionButton>
        </div>
      )}

      {editing && (
        <ConfirmDialog
          open={confirming}
          onOpenChange={setConfirming}
          title="이 공연을 삭제할까요?"
          // 편집 중인 입력값이 아니라 저장된 제목을 보여준다.
          // 삭제하면 그 일차의 seq 가 다시 매겨지므로(§5.6) 그것도 같이 알린다
          description={[
            findTranslation(editing.translations, 'KO')?.title ?? `공연 ${editing.id}`,
            `${festivalDayLabel(editing.date)} 순서가 다시 매겨집니다`,
          ].join(' · ')}
          confirmLabel="삭제"
          onConfirm={remove}
        />
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
