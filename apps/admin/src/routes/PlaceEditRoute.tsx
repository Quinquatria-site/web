import { useState } from 'react'
import { useNavigate, useParams } from 'react-router'
import { CircleMarker } from 'react-leaflet'
import { ActionButton } from 'seed-design/ui/action-button'
import { List, ListButtonItem } from 'seed-design/ui/list'
import { ListHeader } from 'seed-design/ui/list-header'
import { SegmentedControl, SegmentedControlItem } from 'seed-design/ui/segmented-control'
import { SelectContent, SelectItem, SelectRoot, SelectTrigger } from 'seed-design/ui/select'
import { Snackbar, useSnackbarAdapter } from 'seed-design/ui/snackbar'
import { TextField, TextFieldInput, TextFieldTextarea } from 'seed-design/ui/text-field'
import { useFormFields } from '../lib/useFormFields'
import { CampusMap } from '../map/CampusMap'
import { fromSource, toLatLng, type Point } from '../map/campus'
import { CATEGORIES, categoryById } from '../mocks/categories'
import { menusByPlace } from '../mocks/menus'
import {
  deletePlace,
  draftId,
  placeById,
  restorePlace,
  upsertPlace,
  useStoreVersion,
} from '../mocks/store'
import {
  findTranslation,
  LANGUAGE_CODES,
  type LanguageCode,
  type Place,
  type PlaceTranslation,
} from '../mocks/types'
import styles from './PlaceEditRoute.module.css'

/**
 * ISO(+offset) → datetime-local 입력값(YYYY-MM-DDTHH:mm).
 * offset 을 보지 않고 자르므로 값이 KST(+09:00)라고 가정한다. 목은 전부 KST 지만
 * 실제 API(#10)가 다른 offset 을 주면 시각이 어긋난다.
 */
const toLocal = (iso: string) => iso.slice(0, 16)
/** datetime-local → 명세의 ISO 8601(+09:00) (§2.2) */
const toIso = (local: string) => `${local}:00+09:00`

type TranslationField = 'name' | 'host' | 'desc'
const fieldKey = (field: TranslationField, lang: LanguageCode) => `${field}_${lang}` as const

/**
 * 장소 편집 (§5.4). /places/new 와 /places/:id 를 겸한다.
 *
 * 번역은 언어 세그먼트로 전환하며 세 벌을 함께 편집한다. §5.2 대로 KO 는
 * 필수이고 EN·CHN 은 이름이 비어 있으면 아예 보내지 않는 것으로 친다.
 * PATCH 는 보낸 언어만 upsert 하고 KO 삭제는 서버가 409 로 거부한다.
 */
export function PlaceEditRoute() {
  const params = useParams()
  // 폼 초기값은 첫 렌더에서만 읽힌다. 다른 장소로 이동해도 같은 컴포넌트가
  // 재사용되므로, key 로 갈아끼워 이전 입력이 남지 않게 한다
  return <PlaceEditForm key={params.id ?? 'new'} />
}

function PlaceEditForm() {
  const navigate = useNavigate()
  const snackbar = useSnackbarAdapter()
  const params = useParams()
  const editing = params.id ? placeById(Number(params.id)) : undefined

  const [lang, setLang] = useState<LanguageCode>('KO')
  const [categoryId, setCategoryId] = useState<number>(editing?.category_id ?? 2)
  const [point, setPoint] = useState<Point | null>(editing ? { x: editing.x, y: editing.y } : null)
  const [error, setError] = useState<string | null>(null)

  const initialFields: Record<string, string> = {
    sequence: editing ? String(editing.category_sequence) : '',
    start: editing ? toLocal(editing.start_hour) : '2026-10-06T10:00',
    end: editing ? toLocal(editing.end_hour) : '2026-10-06T17:00',
  }
  for (const code of LANGUAGE_CODES) {
    const t = editing ? findTranslation(editing.translations, code) : undefined
    initialFields[fieldKey('name', code)] = t?.name ?? ''
    initialFields[fieldKey('host', code)] = t?.host_college ?? ''
    initialFields[fieldKey('desc', code)] = t?.description ?? ''
  }
  const { values, bind } = useFormFields(initialFields)

  // 메뉴 삭제를 실행취소하면 이 목록이 바로 되돌아와야 한다
  useStoreVersion()
  const menus = editing ? menusByPlace(editing.id) : []

  const save = () => {
    // §5.4 의 422 조건을 화면에서 먼저 막는다
    const sequence = Number(values.sequence)
    if (!Number.isInteger(sequence) || sequence < 1)
      return setError('표시 순서는 1 이상의 정수여야 합니다.')
    if (!point) return setError('지도에서 위치를 찍어주세요.')
    // 같은 값은 명세가 허용한다 (§5.4)
    if (values.end < values.start) return setError('종료가 시작보다 빨라요.')
    // 설명은 선택이다 (§5.4 PlaceTranslation)
    if (!values.name_KO.trim() || !values.host_KO.trim())
      return setError('한국어 이름·주최는 필수입니다.')

    const id = editing?.id ?? draftId()
    const translations: PlaceTranslation[] = []
    for (const code of LANGUAGE_CODES) {
      const name = values[fieldKey('name', code)].trim()
      if (!name) continue // EN·CHN 은 선택 (§5.2)
      const existing = editing ? findTranslation(editing.translations, code) : undefined
      translations.push({
        id: existing?.id ?? draftId(), // 기존 번역의 id 는 유지 (§5.2)
        place_id: id,
        language_code: code,
        name,
        host_college: values[fieldKey('host', code)].trim(),
        description: values[fieldKey('desc', code)].trim(),
      })
    }

    const place: Place = {
      id,
      category_id: categoryId,
      category_sequence: sequence,
      x: point.x,
      y: point.y,
      start_hour: toIso(values.start),
      end_hour: toIso(values.end),
      place_image_uri: editing?.place_image_uri ?? null,
      translations,
    }
    upsertPlace(place)
    snackbar.create({
      timeout: 3000,
      render: () => <Snackbar message={`${values.name_KO} 저장했습니다`} />,
    })
    // navigate(-1) 이 아니다 — 이 화면을 새로고침하거나 링크로 바로 열면
    // 뒤로 갈 곳이 admin 밖이다
    navigate('/places')
  }

  const remove = () => {
    if (!editing) return
    const removed = deletePlace(editing.id)
    if (!removed) return
    navigate('/places')
    // 확인 다이얼로그 대신 실행취소 — 현장 한 손 조작에서는 이쪽이 안전하다
    snackbar.create({
      timeout: 6000,
      render: () => (
        <Snackbar
          message={`삭제했습니다 (메뉴 ${removed.menus.length}개 포함)`}
          actionLabel="실행취소"
          onAction={() => restorePlace(removed.place, removed.menus)}
        />
      ),
    })
  }

  const missing = LANGUAGE_CODES.filter((code) => !values[fieldKey('name', code)].trim())

  return (
    <div className={styles.screen}>
      <div className={styles.section}>
        <SelectRoot
          label="종류"
          value={[String(categoryId)]}
          onValueChange={(value) => setCategoryId(Number(value[0] ?? categoryId))}
        >
          <SelectTrigger placeholder="선택하세요" />
          <SelectContent>
            {CATEGORIES.map((category) => (
              <SelectItem
                key={category.id}
                value={String(category.id)}
                label={findTranslation(category.translations, 'KO')?.name ?? category.code}
              />
            ))}
          </SelectContent>
        </SelectRoot>

        <TextField
          label="표시 순서"
          description={`${findTranslation(categoryById(categoryId)?.translations ?? [], 'KO')?.name ?? ''} 안에서의 자리 번호`}
          {...bind('sequence')}
        >
          <TextFieldInput inputMode="numeric" placeholder="1" />
        </TextField>

        <div className={styles.row}>
          <TextField label="운영 시작" {...bind('start')}>
            <TextFieldInput type="datetime-local" />
          </TextField>
          <TextField label="운영 종료" invalid={values.end < values.start} {...bind('end')}>
            <TextFieldInput type="datetime-local" />
          </TextField>
        </div>
      </div>

      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>위치</h2>
        <p className={styles.hint}>
          지도를 누르면 그 자리가 좌표로 들어갑니다.{' '}
          {point ? (
            <span className={styles.coord}>
              x {point.x} · y {point.y}
            </span>
          ) : (
            '아직 위치가 없습니다.'
          )}
        </p>
        <div className={styles.picker}>
          <CampusMap onPick={setPoint}>
            {point && (
              <CircleMarker
                center={toLatLng(fromSource(point))}
                radius={9}
                pathOptions={{ color: '#FFFFFF', weight: 2, fillColor: '#002D56', fillOpacity: 1 }}
              />
            )}
          </CampusMap>
        </div>
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
        {missing.length > 0 && (
          <p className={`${styles.hint} ${styles.langMissing}`}>
            {missing.join('·')} 이 비어 있습니다 — 그 언어 사용자에게는 이 장소가 보이지 않습니다.
          </p>
        )}

        <TextField
          label="이름"
          showRequiredIndicator={lang === 'KO'}
          {...bind(fieldKey('name', lang))}
        >
          <TextFieldInput placeholder={lang === 'KO' ? '예: 타로 점집' : ''} />
        </TextField>
        <TextField label="주최" {...bind(fieldKey('host', lang))}>
          <TextFieldInput placeholder={lang === 'KO' ? '예: 서양어대학' : ''} />
        </TextField>
        <TextField label="설명" {...bind(fieldKey('desc', lang))}>
          <TextFieldTextarea placeholder={lang === 'KO' ? '무엇을 하는 곳인지 적어주세요' : ''} />
        </TextField>
      </div>

      {editing && (
        <div className={styles.section}>
          <ListHeader as="h2">메뉴 · 유료 체험</ListHeader>
          <List>
            {menus.map((menu) => (
              <ListButtonItem
                key={menu.id}
                title={findTranslation(menu.translations, 'KO')?.name ?? `메뉴 ${menu.id}`}
                detail={`${menu.price.toLocaleString()}원`}
                onClick={() => navigate(`/places/${editing.id}/menus/${menu.id}`)}
              />
            ))}
          </List>
          <ActionButton
            size="small"
            variant="neutralWeak"
            onClick={() => navigate(`/places/${editing.id}/menus/new`)}
          >
            메뉴 추가
          </ActionButton>
        </div>
      )}

      {error && <p className={`${styles.hint} ${styles.langMissing}`}>{error}</p>}

      <div className={styles.footer}>
        <ActionButton size="large" onClick={save}>
          저장
        </ActionButton>
        {editing && (
          <ActionButton size="large" variant="criticalSolid" onClick={remove}>
            삭제
          </ActionButton>
        )}
      </div>
    </div>
  )
}
