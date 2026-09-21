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
  deleteLostItemTranslation,
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
import { ConfirmDialog, PhotoPicker } from '../ui'
// 공연 편집과 같은 뼈대라 스타일시트를 같이 쓴다. 공지도 이 파일을 쓰고
// 메뉴는 장소 것을 쓴다 — 편집 화면이 서로의 스타일시트를 가져다 쓰는 관례다
import styles from './PerformanceEditRoute.module.css'

type TranslationField = 'loc' | 'title' | 'desc'
const fieldKey = (field: TranslationField, lang: LanguageCode) => `${field}_${lang}` as const

/**
 * 분실물 편집 (§5.8). /lost-items/new 와 /lost-items/:id 를 겸한다.
 *
 * 입력칸이 없는 것이 둘이지만 성격이 다르다.
 * - created_at: 서버가 찍는다. 수정도 안 되고 본문에도 안 들어간다.
 * - is_returned: 본문에는 들어간다. §5.8 이 POST 필수로 정했고, 생성이면 언제나
 *   false 다 — 주워 온 물건이 이미 반환됐을 수는 없어 고를 것이 없다. 반환 처리는
 *   목록의 버튼이 맡는다. 주인이 물건을 찾아가는 순간은 한 손이 물건에 가 있어서,
 *   이 화면까지 들어와 저장을 누르게 할 여유가 없다.
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
  const [confirming, setConfirming] = useState(false)
  // 사진만 useFormFields 밖이다. 그쪽은 문자열 전용이고 이건 key 배열이다
  const [photos, setPhotos] = useState<string[]>(editing?.image_url ? [editing.image_url] : [])
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
    // 화면에 놓인 순서대로 검사한다. 사진이 없으면 나머지를 채워도 주인이
    // 자기 물건인지 알아볼 수 없어 목록에 있으나 마나다
    if (photos.length === 0) return setError('사진은 필수입니다. 물건을 찍어 올려주세요.')
    if (!values.loc_KO.trim()) return setError('한국어 습득 장소는 필수입니다.')
    if (!values.title_KO.trim()) return setError('한국어 제목은 필수입니다.')

    // EN·CHN 은 언어 단위로만 선택이다. 제목과 습득 장소는 짝이라 한쪽만 채운
    // 상태는 보낼 수 없다 — 제목만 있고 어디서 주웠는지 없는 번역은 외국인이
    // 물건을 찾아가는 데 쓸모가 없다. 반쪽짜리를 조용히 버리면 운영자는 번역을
    // 넣었다고 믿는데 학생에게는 안 보인다.
    // (이건 화면이 거는 규칙이다. §5.8 이 언어별로 found_location 을 필수로
    //  두는지는 아직 모른다 — #10 에서 확인할 것)
    const half = LANGUAGE_CODES.filter((code) => {
      const title = values[fieldKey('title', code)].trim()
      const loc = values[fieldKey('loc', code)].trim()
      return Boolean(title) !== Boolean(loc)
    })
    if (half.length > 0)
      return setError(`${half.join('·')} 은 제목과 습득 장소를 둘 다 채우거나 둘 다 비워주세요.`)

    const id = editing?.id ?? draftId()
    const translations: LostItemTranslation[] = []
    for (const code of LANGUAGE_CODES) {
      const title = values[fieldKey('title', code)].trim()
      // 위 검사를 통과했으므로 장소도 비어 있다. PATCH 본문에서 뺀다 — 다만
      // 빼는 것만으로는 안 지워진다. 원래 있던 언어라면 아래에서 전용 삭제를
      // 부른다 (§5.2)
      if (!title) continue
      const existing = editing ? findTranslation(editing.translations, code) : undefined
      translations.push({
        id: existing?.id ?? draftId(), // 기존 번역의 id 는 유지 (§5.2)
        lost_item_id: id,
        language_code: code,
        title,
        description: values[fieldKey('desc', code)].trim(),
        found_location: values[fieldKey('loc', code)].trim(),
      })
    }
    // 목이 곧 서버 응답이라 정렬까지 맞춘다. Backoffice 응답의 translations 는
    // language_code ASC — 즉 CHN → EN → KO 다 (§5.2)
    translations.sort((a, b) => a.language_code.localeCompare(b.language_code))

    const draft: LostItemDraft = {
      id,
      // 명세는 한 장이고 PhotoPicker 는 목록을 다룬다. 접는 것은 여기 한 곳뿐이다
      image_url: photos[0] ?? null,
      // POST 필수라 실어 보낸다 (§5.8). 수정일 때 이 값은 쓰이지 않는다 —
      // upsertLostItem 이 이전 값을 지킨다
      is_returned: editing?.is_returned ?? false,
      translations,
    }
    // 지우기 전에 원본을 붙잡는다. upsertLostItem 이 LOST_ITEMS 의 항목을 새
    // 객체로 갈아끼우므로 editing 은 이전 상태를 그대로 들고 있다
    const undo = removing
      .map((code) => editing && findTranslation(editing.translations, code))
      .filter((t): t is LostItemTranslation => Boolean(t))

    const saved = upsertLostItem(draft)

    // 실제 클라이언트가 보낼 두 호출과 같은 순서다 — PATCH 로 남길 언어를
    // 올리고, 지울 언어는 전용 DELETE 로 따로 부른다 (§5.2)
    for (const code of removing) {
      const rejected = deleteLostItemTranslation(saved.id, code)
      if (rejected) return setError(rejected)
    }

    // 번역을 지웠으면 무엇을 지웠는지 밝히고 되돌릴 틈을 준다. 지워진 번역문은
    // 다시 타이핑해야 해서 실수의 대가가 크다. 되돌리기는 upsertLostItem 한
    // 번이면 된다 — 언어별 병합이라(§5.2) 지운 언어만 다시 넣고 나머지는
    // 건드리지 않는다
    snackbar.create(
      undo.length > 0
        ? {
            timeout: 6000,
            render: () => (
              <Snackbar
                message={`${values.title_KO} 저장했습니다 · ${removing.join('·')} 번역 삭제`}
                actionLabel="실행취소"
                onAction={() =>
                  upsertLostItem({
                    id: saved.id,
                    image_url: saved.image_url,
                    // 이미 있는 항목이라 upsert 가 이전 값을 지킨다. 그래도 draft 는
                    // POST 본문과 같은 모양이어야 해서 현재 값을 그대로 싣는다
                    is_returned: saved.is_returned,
                    translations: undo,
                  })
                }
              />
            ),
          }
        : {
            timeout: 3000,
            render: () => <Snackbar message={`${values.title_KO} 저장했습니다`} />,
          },
    )
    // navigate(-1) 이 아니다 — 이 화면을 새로고침하거나 링크로 바로 열면
    // 뒤로 갈 곳이 admin 밖이다
    backToList(saved.is_returned)
  }

  const remove = () => {
    if (!editing) return
    const removed = deleteLostItem(editing.id)
    if (!removed) return
    backToList(removed.is_returned)
    // 확인을 받고 지웠더라도 실행취소는 남긴다. 확인은 실수를, 이쪽은 변심을 받는다
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
  // 이미 나가 있던 번역을 내리는 것. 아직 안 채운 언어와 대가가 달라 갈라 둔다
  const removing = editing
    ? LANGUAGE_CODES.filter(
        (code) =>
          code !== 'KO' &&
          findTranslation(editing.translations, code) &&
          !values[fieldKey('title', code)].trim() &&
          !values[fieldKey('loc', code)].trim(),
      )
    : []
  // 원래부터 없던 언어. 이쪽은 "아직 안 채웠다" 라 톤이 다르다
  const blank = missing.filter((code) => !removing.includes(code))

  return (
    <div className={styles.screen}>
      {/*
        사진이 맨 위다. 이슈가 정한 순서(사진 → 습득 장소 → 제목)가 손이 움직이는
        순서이기 때문이다 — 물건을 든 채로는 찍는 것이 가장 먼저고, 타이핑은 뒤로
        미룰수록 좋다.
      */}
      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>사진</h2>
        <PhotoPicker value={photos} onChange={setPhotos} max={1} label="분실물" />
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
        {removing.length > 0 && (
          <Callout
            tone="critical"
            description={`${removing.join('·')} 번역을 삭제합니다. 저장하면 그 언어로 보는 학생에게 이 분실물이 사라집니다.`}
          />
        )}
        {blank.length > 0 && (
          <Callout
            tone="warning"
            description={`${blank.join('·')} 이 비어 있습니다. 그 언어 사용자에게는 이 분실물이 보이지 않습니다.`}
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
        반환 처리는 목록의 <strong>반환 버튼</strong> 으로 합니다. 등록 시각은 서버가 정합니다.
      </p>

      {/* 되돌릴 수 없는 액션이라 저장 옆에 두지 않는다. 일부러 내려와야 닿는 자리다 */}
      {editing && (
        <div className={styles.dangerZone}>
          <ActionButton size="medium" variant="criticalSolid" onClick={() => setConfirming(true)}>
            이 분실물 삭제
          </ActionButton>
        </div>
      )}

      {editing && (
        <ConfirmDialog
          open={confirming}
          onOpenChange={setConfirming}
          title="이 분실물을 삭제할까요?"
          // 편집 중인 입력값이 아니라 저장된 제목을 보여준다. 지금 지워질 것이
          // 무엇인지가 중요하다. 사진을 따로 말하는 이유는 이 도메인에서 사진이
          // 1차 식별 수단이라 지워지는 것 중 다시 만들기 가장 어려워서다
          description={[
            findTranslation(editing.translations, 'KO')?.title ?? `분실물 ${editing.id}`,
            editing.image_url ? '사진도 함께 지워집니다' : '',
          ]
            .filter(Boolean)
            .join(' · ')}
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
