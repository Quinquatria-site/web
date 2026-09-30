import { useState } from 'react'
import { useNavigate, useParams } from 'react-router'
import { CircleMarker } from 'react-leaflet'
import { ActionButton } from 'seed-design/ui/action-button'
import { Callout } from 'seed-design/ui/callout'
import { List, ListButtonItem } from 'seed-design/ui/list'
import { ListHeader } from 'seed-design/ui/list-header'
import { SegmentedControl, SegmentedControlItem } from 'seed-design/ui/segmented-control'
import { SelectContent, SelectItem, SelectRoot, SelectTrigger } from 'seed-design/ui/select'
import { Snackbar, useSnackbarAdapter } from 'seed-design/ui/snackbar'
import { TextField, TextFieldInput, TextFieldTextarea } from 'seed-design/ui/text-field'
import type { PlaceTextWrite } from '../api/catalog'
import { apiErrorText } from '../lib/apiErrorText'
import { useFormFields } from '../lib/useFormFields'
import { ConfirmDialog, HourField, PhotoPicker, type Hour } from '../ui'
import { CampusMap } from '../map/CampusMap'
import { fromSource, toLatLng, type Point } from '../map/campus'
import { CATEGORIES, categoryById } from '../mocks/categories'
import { menusByPlace } from '../mocks/menus'
import {
  placeById,
  removePlace,
  removePlaceTranslation,
  restorePlaceTranslations,
  savePlace,
  useStoreVersion,
} from '../mocks/store'
import {
  FESTIVAL_DATES,
  festivalDateLabel,
  findTranslation,
  LANGUAGE_CODES,
  type LanguageCode,
} from '../mocks/types'
import styles from './PlaceEditRoute.module.css'

/*
 * start_hour·end_hour 는 명세상 datetime 이지만 화면은 일차와 시각을 따로 다룬다.
 * 아래 두 함수가 그 사이를 오간다. offset 을 보지 않고 자르므로 값이 KST(+09:00)
 * 라고 가정한다 — 서버는 UTC 로 주지만 캐시에 넣을 때 KST 로 바꿔 둔다(api/catalog.ts).
 */
const dateOf = (iso: string) => iso.slice(0, 10)
const hourOf = (iso: string): Hour => ({
  hour: Number(iso.slice(11, 13)),
  minute: Number(iso.slice(14, 16)),
})
/** 일차 + 시각 → 명세의 ISO 8601(+09:00) (§2.2) */
const toIso = (date: string, { hour, minute }: Hour) =>
  `${date}T${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}:00+09:00`

/** 같은 일차 안에서 비교한다. 종료가 시작보다 이르면 422 (§5.4) */
const minutesOf = ({ hour, minute }: Hour) => hour * 60 + minute

/** 장소 사진 최대 장수. 백엔드 계약 전의 잠정값이다 (#14) */
const PHOTO_MAX = 10

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
  // 새 장소의 기본 종류는 부스다 — 72곳 중 58곳이 부스다. id 는 서버가 매긴 값이라 code 로 찾는다
  const [categoryId, setCategoryId] = useState<number>(
    editing?.category_id ??
      CATEGORIES.find((category) => category.code === 'BOOTH')?.id ??
      CATEGORIES[0]?.id ??
      0,
  )
  const [point, setPoint] = useState<Point | null>(editing ? { x: editing.x, y: editing.y } : null)
  const [error, setError] = useState<string | null>(null)
  const [confirming, setConfirming] = useState(false)
  const [photos, setPhotos] = useState<string[]>(editing?.place_image_uri ?? [])
  // 서버를 다녀오는 동안 버튼을 막는다. 두 번 누르면 장소가 두 곳 생긴다
  const [pending, setPending] = useState(false)

  const [date, setDate] = useState<string>(editing ? dateOf(editing.start_hour) : FESTIVAL_DATES[0])
  const [start, setStart] = useState<Hour>(
    editing ? hourOf(editing.start_hour) : { hour: 10, minute: 0 },
  )
  const [end, setEnd] = useState<Hour>(editing ? hourOf(editing.end_hour) : { hour: 17, minute: 0 })

  const initialFields: Record<string, string> = {
    sequence: editing ? String(editing.category_sequence) : '',
  }
  for (const code of LANGUAGE_CODES) {
    const t = editing ? findTranslation(editing.translations, code) : undefined
    initialFields[fieldKey('name', code)] = t?.name ?? ''
    initialFields[fieldKey('host', code)] = t?.host_college ?? ''
    initialFields[fieldKey('desc', code)] = t?.description ?? ''
  }
  const { values, bind } = useFormFields(initialFields)

  // 메뉴를 고치고 돌아오면 이 목록이 바로 맞아야 한다
  useStoreVersion()
  const menus = editing ? menusByPlace(editing.id) : []

  const save = async () => {
    if (pending) return
    // §5.4 의 422 조건을 화면에서 먼저 막는다
    const sequence = Number(values.sequence)
    if (!Number.isInteger(sequence) || sequence < 1)
      return setError('표시 순서는 1 이상의 정수여야 합니다.')
    if (!point) return setError('지도에서 위치를 찍어주세요.')
    // 같은 값은 명세가 허용한다 (§5.4)
    if (minutesOf(end) < minutesOf(start)) return setError('종료가 시작보다 빨라요.')
    // 설명은 선택이다 (§5.4 PlaceTranslation)
    if (!values.name_KO.trim() || !values.host_KO.trim())
      return setError('한국어 이름·주최는 필수입니다.')

    // name 과 host_college 는 §5.4 가 언어 구분 없이 둘 다 필수로 둔 짝이다.
    // 선택인 것은 description 하나뿐이다. EN·CHN 은 언어 단위로만 선택이라
    // 이름만 채우고 주최를 비운 상태는 보낼 수 없다 — 그대로 보내면 필수 필드에
    // 빈 문자열이 들어간다
    const half = LANGUAGE_CODES.filter((code) => {
      const name = values[fieldKey('name', code)].trim()
      const host = values[fieldKey('host', code)].trim()
      return Boolean(name) !== Boolean(host)
    })
    if (half.length > 0)
      return setError(`${half.join('·')} 은 이름과 주최를 둘 다 채우거나 둘 다 비워주세요.`)

    // 사진 올리기(presigned 업로드)는 아직 붙지 않았다. 새로 고른 사진의 key 는 서버에 없는
    // 가짜라 저장하면 422 다. 서버에 이미 있는 사진을 두거나 빼는 것은 된다
    const savedPhotos = new Set(editing?.place_image_uri ?? [])
    if (photos.some((key) => !savedPhotos.has(key)))
      return setError('새 사진 올리기는 아직 준비 중입니다. 새로 고른 사진을 빼고 저장해 주세요.')

    // 요청 번역에는 id·place_id 를 싣지 않는다 — 서버가 모르는 필드는 422 다.
    // 새 장소도 id 없이 보내고 서버가 매긴다
    const translations: PlaceTextWrite[] = []
    for (const code of LANGUAGE_CODES) {
      const name = values[fieldKey('name', code)].trim()
      // PATCH 본문에서 뺀다 — 다만 빼는 것만으로는 안 지워진다. 원래 있던
      // 언어라면 아래에서 전용 삭제를 부른다 (§5.2)
      if (!name) continue // EN·CHN 은 선택 (§5.2)
      translations.push({
        language_code: code,
        name,
        host_college: values[fieldKey('host', code)].trim(),
        description: values[fieldKey('desc', code)].trim(),
      })
    }

    // 지우기 전에 원본 문안을 붙잡는다. 실행취소가 PATCH 로 다시 올린다
    const undo: PlaceTextWrite[] = removing.flatMap((code) => {
      const t = editing && findTranslation(editing.translations, code)
      return t
        ? [
            {
              language_code: t.language_code,
              name: t.name,
              host_college: t.host_college,
              description: t.description,
            },
          ]
        : []
    })

    setError(null)
    setPending(true)
    try {
      const saved = await savePlace(editing?.id ?? null, {
        category_id: categoryId,
        category_sequence: sequence,
        x: point.x,
        y: point.y,
        start_hour: toIso(date, start),
        end_hour: toIso(date, end),
        // 빈 배열은 422 다 (§5.4). 다 지웠으면 null 로 보낸다
        place_image_uri: photos.length > 0 ? photos : null,
        translations,
      })

      // 두 호출의 순서다 — PATCH 로 남길 언어를 올리고, 지울 언어는 전용 DELETE 로
      // 따로 부른다 (§5.2). 여기서 실패하면 PATCH 는 이미 반영된 채 화면에 남는다
      for (const code of removing) await removePlaceTranslation(saved.id, code)

      // 지워진 번역문은 다시 타이핑해야 해서 실수의 대가가 크다. 되돌리기는 PATCH
      // 한 번이면 된다 — 언어별 upsert 라(§5.2) 지운 언어만 다시 넣는다
      snackbar.create(
        undo.length > 0
          ? {
              timeout: 6000,
              render: () => (
                <Snackbar
                  message={`${values.name_KO} 저장했습니다 · ${removing.join('·')} 번역 삭제`}
                  actionLabel="실행취소"
                  onAction={() => {
                    restorePlaceTranslations(saved.id, undo).catch((undoError: unknown) =>
                      snackbar.create({
                        timeout: 4000,
                        render: () => (
                          <Snackbar variant="critical" message={apiErrorText(undoError)} />
                        ),
                      }),
                    )
                  }}
                />
              ),
            }
          : {
              timeout: 3000,
              render: () => <Snackbar message={`${values.name_KO} 저장했습니다`} />,
            },
      )
      // navigate(-1) 이 아니다 — 이 화면을 새로고침하거나 링크로 바로 열면
      // 뒤로 갈 곳이 admin 밖이다
      navigate('/places')
    } catch (saveError) {
      setError(apiErrorText(saveError))
    } finally {
      setPending(false)
    }
  }

  // 영구 삭제, 메뉴까지 연쇄라 실행취소를 두지 않는다 (§6). 대신 확인 창이 막는다
  const remove = async () => {
    if (!editing || pending) return
    setPending(true)
    try {
      const menuCount = await removePlace(editing.id)
      navigate('/places')
      snackbar.create({
        timeout: 3000,
        render: () => <Snackbar message={`삭제했습니다 (메뉴 ${menuCount}개 포함)`} />,
      })
    } catch (removeError) {
      setConfirming(false)
      setError(apiErrorText(removeError))
    } finally {
      setPending(false)
    }
  }

  const missing = LANGUAGE_CODES.filter((code) => !values[fieldKey('name', code)].trim())
  // 이미 나가 있던 번역을 내리는 것. 아직 안 채운 언어와 대가가 달라 갈라 둔다.
  // 판정은 이름만 본다 — host_college 는 EN·CHN 에서 선택이라(위 KO 검증 참고)
  // 짝으로 묶으면 "영문 이름만 넣고 주최는 비움" 이라는 정상 상태가 삭제로 읽힌다
  const removing = editing
    ? LANGUAGE_CODES.filter(
        (code) =>
          code !== 'KO' &&
          findTranslation(editing.translations, code) &&
          !values[fieldKey('name', code)].trim(),
      )
    : []
  // 원래부터 없던 언어. 이쪽은 "아직 안 채웠다" 라 톤이 다르다
  const blank = missing.filter((code) => !removing.includes(code))

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

        {/* 날짜는 사흘 중 하나라 피커를 띄울 것도 없다. 한 번에 보이는 편이 빠르다 */}
        <div className={styles.field}>
          <span className={styles.fieldLabel}>운영 일자</span>
          <SegmentedControl aria-label="운영 일자" value={date} onValueChange={setDate}>
            {FESTIVAL_DATES.map((value) => (
              <SegmentedControlItem key={value} value={value}>
                {festivalDateLabel(value)}
              </SegmentedControlItem>
            ))}
          </SegmentedControl>
        </div>

        <HourField label="운영 시작" value={start} onValueChange={setStart} />
        <HourField
          label="운영 종료"
          value={end}
          onValueChange={setEnd}
          invalid={minutesOf(end) < minutesOf(start)}
          errorMessage="시작보다 이릅니다"
        />
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
        <h2 className={styles.sectionTitle}>사진</h2>
        <PhotoPicker
          value={photos}
          onChange={setPhotos}
          max={PHOTO_MAX}
          label={values.name_KO.trim() || '장소'}
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
            description={`${removing.join('·')} 번역을 삭제합니다. 저장하면 그 언어로 보는 학생에게 이 장소가 사라집니다.`}
          />
        )}
        {blank.length > 0 && (
          <Callout
            tone="warning"
            description={`${blank.join('·')} 이 비어 있습니다. 그 언어 사용자에게는 이 장소가 보이지 않습니다.`}
          />
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

      {/* 되돌릴 수 없는 액션이라 저장 옆에 두지 않는다. 일부러 내려와야 닿는 자리다 */}
      {editing && (
        <div className={styles.dangerZone}>
          <ActionButton
            size="medium"
            variant="criticalSolid"
            disabled={pending}
            onClick={() => setConfirming(true)}
          >
            이 장소 삭제
          </ActionButton>
        </div>
      )}

      {editing && (
        <ConfirmDialog
          open={confirming}
          onOpenChange={setConfirming}
          title="이 장소를 삭제할까요?"
          // 편집 중인 입력값이 아니라 저장된 이름을 보여준다. 지금 지워질 것이 무엇인지가 중요하다
          description={[
            findTranslation(editing.translations, 'KO')?.name ?? `장소 ${editing.id}`,
            menus.length > 0 ? `딸린 메뉴 ${menus.length}개가 함께 지워집니다` : '',
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
        <ActionButton size="large" loading={pending} onClick={() => void save()}>
          저장
        </ActionButton>
      </div>
    </div>
  )
}
