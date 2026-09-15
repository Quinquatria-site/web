import { useState } from 'react'
import { useNavigate, useParams } from 'react-router'
import { ActionButton } from 'seed-design/ui/action-button'
import { Callout } from 'seed-design/ui/callout'
import { SegmentedControl, SegmentedControlItem } from 'seed-design/ui/segmented-control'
import { Snackbar, useSnackbarAdapter } from 'seed-design/ui/snackbar'
import { TextField, TextFieldInput } from 'seed-design/ui/text-field'
import { useFormFields } from '../lib/useFormFields'
import {
  deleteMenu,
  deleteMenuTranslation,
  draftId,
  menuById,
  restoreMenu,
  upsertMenu,
} from '../mocks/store'
import {
  findTranslation,
  LANGUAGE_CODES,
  type LanguageCode,
  type Menu,
  type MenuTranslation,
} from '../mocks/types'
import styles from './PlaceEditRoute.module.css'

const fieldKey = (field: 'name' | 'desc', lang: LanguageCode) => `${field}_${lang}` as const

/** 메뉴 편집 (§5.5). 번역 규칙은 장소와 같다 — KO 필수, EN·CHN 선택 */
export function MenuEditRoute() {
  const params = useParams()
  // 장소 편집과 같은 이유로 key 를 준다 — 폼 초기값은 첫 렌더에서만 읽힌다
  return <MenuEditForm key={params.menuId ?? 'new'} />
}

function MenuEditForm() {
  const navigate = useNavigate()
  const snackbar = useSnackbarAdapter()
  const params = useParams()
  const placeId = Number(params.id)
  const editing =
    params.menuId && params.menuId !== 'new' ? menuById(Number(params.menuId)) : undefined

  const [lang, setLang] = useState<LanguageCode>('KO')
  const [error, setError] = useState<string | null>(null)

  const initialFields: Record<string, string> = {
    price: editing ? String(editing.price) : '',
  }
  for (const code of LANGUAGE_CODES) {
    const t = editing ? findTranslation(editing.translations, code) : undefined
    initialFields[fieldKey('name', code)] = t?.name ?? ''
    initialFields[fieldKey('desc', code)] = t?.description ?? ''
  }
  const { values, bind } = useFormFields(initialFields)

  const save = () => {
    // Number('') 은 0 이라 빈 칸이 0원으로 새어 들어간다. 먼저 거른다
    if (!values.price.trim()) return setError('가격을 입력해주세요.')
    const price = Number(values.price)
    // §2.2 — price 는 원 단위 0 이상 정수
    if (!Number.isInteger(price) || price < 0)
      return setError('가격은 0 이상의 정수(원)여야 합니다.')
    if (!values.name_KO.trim()) return setError('한국어 이름은 필수입니다.')

    const id = editing?.id ?? draftId()
    const translations: MenuTranslation[] = []
    for (const code of LANGUAGE_CODES) {
      const name = values[fieldKey('name', code)].trim()
      // PATCH 본문에서 뺀다 — 다만 빼는 것만으로는 안 지워진다. 원래 있던
      // 언어라면 아래에서 전용 삭제를 부른다 (§5.2)
      if (!name) continue
      const existing = editing ? findTranslation(editing.translations, code) : undefined
      translations.push({
        id: existing?.id ?? draftId(),
        menu_id: id,
        language_code: code,
        name,
        description: values[fieldKey('desc', code)].trim(),
      })
    }

    const menu: Menu = {
      id,
      place_id: placeId,
      image_url: editing?.image_url ?? null,
      price,
      translations,
    }
    // 지우기 전에 원본을 붙잡는다. upsertMenu 가 MENUS 의 항목을 새 객체로
    // 갈아끼우므로 editing 은 이전 상태를 그대로 들고 있다
    const undo = removing
      .map((code) => editing && findTranslation(editing.translations, code))
      .filter((t): t is MenuTranslation => Boolean(t))

    const saved = upsertMenu(menu)

    // PATCH 로 남길 언어를 올리고, 지울 언어는 전용 DELETE 로 따로 부른다 (§5.2)
    for (const code of removing) {
      const rejected = deleteMenuTranslation(saved.id, code)
      if (rejected) return setError(rejected)
    }

    snackbar.create(
      undo.length > 0
        ? {
            timeout: 6000,
            render: () => (
              <Snackbar
                message={`${values.name_KO} 저장했습니다 · ${removing.join('·')} 번역 삭제`}
                actionLabel="실행취소"
                onAction={() => upsertMenu({ ...menu, translations: undo })}
              />
            ),
          }
        : {
            timeout: 3000,
            render: () => <Snackbar message={`${values.name_KO} 저장했습니다`} />,
          },
    )
    navigate(`/places/${placeId}`)
  }

  const remove = () => {
    if (!editing) return
    const removed = deleteMenu(editing.id)
    if (!removed) return
    navigate(`/places/${placeId}`)
    snackbar.create({
      timeout: 6000,
      render: () => (
        <Snackbar
          message="메뉴를 삭제했습니다"
          actionLabel="실행취소"
          onAction={() => restoreMenu(removed)}
        />
      ),
    })
  }

  // 이미 나가 있던 번역을 내리는 것. 이 화면에는 누락 경고가 없지만(메뉴는 장소
  // 편집 안에서 다룬다) 삭제만은 저장 전에 알려야 한다 — 되돌리려면 번역문을
  // 다시 타이핑해야 하기 때문이다
  const removing = editing
    ? LANGUAGE_CODES.filter(
        (code) =>
          code !== 'KO' &&
          findTranslation(editing.translations, code) &&
          !values[fieldKey('name', code)].trim(),
      )
    : []

  return (
    <div className={styles.screen}>
      <div className={styles.section}>
        <TextField label="가격 (원)" {...bind('price')}>
          <TextFieldInput inputMode="numeric" placeholder="5000" />
        </TextField>
      </div>

      <div className={styles.section}>
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
            description={`${removing.join('·')} 번역을 삭제합니다. 저장하면 그 언어로 보는 학생에게 이 메뉴가 사라집니다.`}
          />
        )}

        <TextField
          label="이름"
          showRequiredIndicator={lang === 'KO'}
          {...bind(fieldKey('name', lang))}
        >
          <TextFieldInput placeholder={lang === 'KO' ? '예: 떡볶이' : ''} />
        </TextField>
        <TextField label="설명" {...bind(fieldKey('desc', lang))}>
          <TextFieldInput placeholder={lang === 'KO' ? '예: 매운 떡볶이' : ''} />
        </TextField>
      </div>

      {editing && (
        <div className={styles.dangerZone}>
          <ActionButton size="medium" variant="criticalSolid" onClick={remove}>
            이 메뉴 삭제
          </ActionButton>
        </div>
      )}

      <div className={styles.footer}>
        {error && <Callout tone="critical" description={error} />}
        <ActionButton size="large" onClick={save}>
          저장
        </ActionButton>
      </div>
    </div>
  )
}
