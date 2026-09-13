import { useState } from 'react'
import { useNavigate, useParams } from 'react-router'
import { ActionButton } from 'seed-design/ui/action-button'
import { SegmentedControl, SegmentedControlItem } from 'seed-design/ui/segmented-control'
import { Snackbar, useSnackbarAdapter } from 'seed-design/ui/snackbar'
import { TextField, TextFieldInput } from 'seed-design/ui/text-field'
import { useFormFields } from '../lib/useFormFields'
import { deleteMenu, draftId, menuById, restoreMenu, upsertMenu } from '../mocks/store'
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
    const price = Number(values.price)
    // §2.2 — price 는 원 단위 0 이상 정수
    if (!Number.isInteger(price) || price < 0)
      return setError('가격은 0 이상의 정수(원)여야 합니다.')
    if (!values.name_KO.trim()) return setError('한국어 이름은 필수입니다.')

    const id = editing?.id ?? draftId()
    const translations: MenuTranslation[] = []
    for (const code of LANGUAGE_CODES) {
      const name = values[fieldKey('name', code)].trim()
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
      image_url: editing?.image_url ?? '',
      price,
      translations,
    }
    upsertMenu(menu)
    snackbar.create({
      timeout: 3000,
      render: () => <Snackbar message={`${values.name_KO} 저장했습니다`} />,
    })
    navigate(-1)
  }

  const remove = () => {
    if (!editing) return
    const removed = deleteMenu(editing.id)
    if (!removed) return
    navigate(-1)
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
