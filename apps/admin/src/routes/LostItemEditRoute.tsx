import { useState } from 'react'
import { useNavigate, useParams } from 'react-router'
import { ActionButton } from 'seed-design/ui/action-button'
import { Callout } from 'seed-design/ui/callout'
import { SegmentedControl, SegmentedControlItem } from 'seed-design/ui/segmented-control'
import { Snackbar, useSnackbarAdapter } from 'seed-design/ui/snackbar'
import { TextField, TextFieldInput, TextFieldTextarea } from 'seed-design/ui/text-field'
import { useFormFields } from '../lib/useFormFields'
import {
  deleteLostItem,
  draftId,
  lostItemById,
  restoreLostItem,
  upsertLostItem,
  type LostItemDraft,
} from '../mocks/store'
import {
  findTranslation,
  LANGUAGE_CODES,
  type LanguageCode,
  type LostItemTranslation,
} from '../mocks/types'
import styles from './LostItemEditRoute.module.css'

type TranslationField = 'loc' | 'title' | 'desc'
const fieldKey = (field: TranslationField, lang: LanguageCode) => `${field}_${lang}` as const

/**
 * 분실물 편집 (§5.8). /lost-items/new 와 /lost-items/:id 를 겸한다.
 *
 * 입력칸이 없는 것이 둘이다. 둘 다 요청 본문에 넣을 값이 아니다.
 * - created_at: 서버가 찍는다. 수정도 안 된다.
 * - is_returned: 목록의 스위치가 바꾼다. 주인이 물건을 찾아가는 순간은 한 손이
 *   물건에 가 있어서, 이 화면까지 들어와 저장을 누르게 할 여유가 없다.
 *
 * 번역은 §5.2 대로 KO 만 필수다. EN·CHN 은 제목이 비어 있으면 아예 안 보낸 것으로
 * 친다. 번역 항목은 전체 교체라서 기존 값을 유지하려면 다시 보내야 한다 —
 * 그래서 초기값을 기존 번역으로 채워 둔다.
 */
export function LostItemEditRoute() {
  const params = useParams()
  // 폼 초기값은 첫 렌더에서만 읽힌다. 다른 분실물로 이동해도 같은 컴포넌트가
  // 재사용되므로, key 로 갈아끼워 이전 입력이 남지 않게 한다
  return <LostItemEditForm key={params.id ?? 'new'} />
}

function LostItemEditForm() {
  const navigate = useNavigate()
  const snackbar = useSnackbarAdapter()
  const params = useParams()
  const editing = params.id ? lostItemById(Number(params.id)) : undefined

  const [lang, setLang] = useState<LanguageCode>('KO')
  const [error, setError] = useState<string | null>(null)

  const initialFields: Record<string, string> = {}
  for (const code of LANGUAGE_CODES) {
    const t = editing ? findTranslation(editing.translations, code) : undefined
    initialFields[fieldKey('loc', code)] = t?.found_location ?? ''
    initialFields[fieldKey('title', code)] = t?.title ?? ''
    initialFields[fieldKey('desc', code)] = t?.description ?? ''
  }
  const { values, bind } = useFormFields(initialFields)

  /** 저장·삭제 뒤에는 그 물건이 실제로 있는 세그먼트로 돌아가야 바뀐 것이 보인다 */
  const backToList = (returned: boolean) =>
    navigate(returned ? '/lost-items?returned=1' : '/lost-items')

  const save = () => {
    // 습득 장소를 제목보다 먼저 검사한다. 화면에서도 위에 있는 칸이다
    if (!values.loc_KO.trim()) return setError('한국어 습득 장소는 필수입니다.')
    if (!values.title_KO.trim()) return setError('한국어 제목은 필수입니다.')

    const id = editing?.id ?? draftId()
    const translations: LostItemTranslation[] = []
    for (const code of LANGUAGE_CODES) {
      const title = values[fieldKey('title', code)].trim()
      if (!title) continue // EN·CHN 은 선택 (§5.2)
      const existing = editing ? findTranslation(editing.translations, code) : undefined
      translations.push({
        id: existing?.id ?? draftId(), // 기존 번역의 id 는 유지 (§5.2)
        lost_item_id: id,
        language_code: code,
        title,
        description: values[fieldKey('desc', code)].trim(),
        // 제목만 채우고 장소를 비운 번역이 나올 수 있다. 명세에 그 조합이
        // 422 인지 적혀 있지 않아 일단 빈 문자열로 보낸다 — #10 에서 확인할 것
        found_location: values[fieldKey('loc', code)].trim(),
      })
    }
    // 목이 곧 서버 응답이라 정렬까지 맞춘다. Backoffice 응답의 translations 는
    // language_code ASC — 즉 CHN → EN → KO 다 (§5.2)
    translations.sort((a, b) => a.language_code.localeCompare(b.language_code))

    const draft: LostItemDraft = {
      id,
      // 사진은 업로드 플로우(#14)가 붙기 전까지 기존 값을 그대로 들고 다닌다.
      // 저장이 사진을 지우면 안 된다
      image_url: editing?.image_url ?? null,
      translations,
    }
    const saved = upsertLostItem(draft)
    snackbar.create({
      timeout: 3000,
      render: () => <Snackbar message={`${values.title_KO} 저장했습니다`} />,
    })
    // navigate(-1) 이 아니다 — 이 화면을 새로고침하거나 링크로 바로 열면
    // 뒤로 갈 곳이 admin 밖이다
    backToList(saved.is_returned)
  }

  const remove = () => {
    if (!editing) return
    const removed = deleteLostItem(editing.id)
    if (!removed) return
    backToList(removed.is_returned)
    // 확인 다이얼로그 대신 실행취소 — 현장 한 손 조작에서는 이쪽이 안전하다
    snackbar.create({
      timeout: 6000,
      render: () => (
        <Snackbar
          message="분실물을 삭제했습니다"
          actionLabel="실행취소"
          onAction={() => restoreLostItem(removed)}
        />
      ),
    })
  }

  const missing = LANGUAGE_CODES.filter((code) => !values[fieldKey('title', code)].trim())

  return (
    <div className={styles.screen}>
      {/*
        사진이 맨 위다. 이슈가 정한 순서(사진 → 습득 장소 → 제목)가 손이 움직이는
        순서이기 때문이다 — 물건을 든 채로는 찍는 것이 가장 먼저고, 타이핑은 뒤로
        미룰수록 좋다. 업로드 플로우(#14)가 붙으면 여기에 PhotoPicker 가 들어온다.
      */}
      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>사진</h2>
        <Callout
          tone="informative"
          description="사진 등록은 업로드 플로우(#14)가 붙은 뒤에 열립니다. 지금은 글로만 등록됩니다."
        />
      </div>

      {/*
        습득 장소가 제목보다 위다. 공연·메뉴 편집과 순서가 다른데, 그 화면들은
        번역 안 되는 필드를 먼저 받고 언어 전환을 그 아래 두지만 분실물은
        습득 장소까지 번역 대상이라 언어 전환이 맨 위로 올라와야 한다.
      */}
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
            description={`${missing.join('·')} 이 비어 있습니다. 그 언어 사용자에게는 이 분실물이 보이지 않습니다.`}
          />
        )}

        <TextField
          label="습득 장소"
          description="주인이 찾아올 곳이 아니라 물건을 주운 곳"
          showRequiredIndicator={lang === 'KO'}
          {...bind(fieldKey('loc', lang))}
        >
          <TextFieldInput placeholder={lang === 'KO' ? '예: 정문 앞 벤치' : ''} />
        </TextField>
        <TextField
          label="제목"
          description="무엇인지 한눈에 알아볼 수 있게"
          showRequiredIndicator={lang === 'KO'}
          {...bind(fieldKey('title', lang))}
        >
          <TextFieldInput placeholder={lang === 'KO' ? '예: 흰색 무선 이어폰' : ''} />
        </TextField>
        <TextField label="설명" {...bind(fieldKey('desc', lang))}>
          <TextFieldTextarea
            placeholder={lang === 'KO' ? '주인만 아는 특징이 있으면 적어주세요' : ''}
          />
        </TextField>
      </div>

      {/* 왜 반환 처리 입력칸이 없는지 적어 둔다. 없는 것이 실수로 보이지 않게 */}
      <p className={styles.hint}>
        반환 처리는 목록의 <strong>스위치</strong> 로 합니다. 등록 시각은 서버가 정합니다.
      </p>

      {/* 되돌릴 수 없는 액션이라 저장 옆에 두지 않는다. 일부러 내려와야 닿는 자리다 */}
      {editing && (
        <div className={styles.dangerZone}>
          <ActionButton size="medium" variant="criticalSolid" onClick={remove}>
            이 분실물 삭제
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
