import { useState } from 'react'
import { useNavigate } from 'react-router'
import { ActionButton } from 'seed-design/ui/action-button'
import { Chip } from 'seed-design/ui/chip'
import { List, ListButtonItem } from 'seed-design/ui/list'
import { CATEGORIES, categoryById } from '../mocks/categories'
import { PLACES } from '../mocks/places'
import { useStoreVersion } from '../mocks/store'
import { findTranslation, missingLanguages, type Place } from '../mocks/types'
import styles from './PlacesRoute.module.css'

/**
 * ISO datetime 에서 HH:mm 만 뽑는다. 운영 시간 표시용.
 * offset 을 보지 않으므로 값이 KST(+09:00)라고 가정한다 (#10 에서 확인할 것).
 */
function hhmm(iso: string): string {
  return iso.slice(11, 16)
}

function detailOf(place: Place): string {
  const category = categoryById(place.category_id)
  const label = category ? findTranslation(category.translations, 'KO')?.name : ''
  const college = findTranslation(place.translations, 'KO')?.host_college
  return [
    `${label} ${place.category_sequence}번`,
    `${hhmm(place.start_hour)}~${hhmm(place.end_hour)}`,
    college,
  ]
    .filter(Boolean)
    .join(' · ')
}

/** 번역 상태. 빠진 언어가 있으면 그 언어 사용자에게 이 장소가 안 보인다 (§2.4) */
function LangBadge({ place }: { place: Place }) {
  const missing = missingLanguages(place.translations)
  if (missing.length === 0) return <span className={styles.langOk}>3개 언어</span>
  return <span className={styles.langWarn}>{missing.join('·')} 없음</span>
}

/**
 * 장소 목록. CATEGORY 다섯 종을 모두 다룬다 — 의무실·팔찌 수령소도
 * ERD 상 장소라 여기서 관리한다.
 * 정렬은 명세 §5.1 그대로 category_id ASC, category_sequence ASC, id ASC.
 */
export function PlacesRoute() {
  const navigate = useNavigate()
  const [filter, setFilter] = useState<string>('all')
  // 삭제·실행취소가 이 목록에 바로 반영되게 한다
  useStoreVersion()

  // 메모하지 않는다. PLACES 는 목 스토어가 제자리에서 바꾸는 배열이라
  // 의존성으로 적을 것이 없고, 수십 건 정렬은 렌더마다 해도 싸다
  const sorted = [...PLACES].sort(
    (a, b) =>
      a.category_id - b.category_id || a.category_sequence - b.category_sequence || a.id - b.id,
  )
  const places = filter === 'all' ? sorted : sorted.filter((p) => p.category_id === Number(filter))

  return (
    <div className={styles.screen}>
      <div className={styles.chips}>
        <Chip.RadioRoot value={filter} onValueChange={(value) => setFilter(String(value))}>
          <Chip.RadioItem value="all">
            <Chip.Label>전체</Chip.Label>
          </Chip.RadioItem>
          {CATEGORIES.map((category) => (
            <Chip.RadioItem key={category.id} value={String(category.id)}>
              <Chip.Label>{findTranslation(category.translations, 'KO')?.name}</Chip.Label>
            </Chip.RadioItem>
          ))}
        </Chip.RadioRoot>
      </div>

      <div className={styles.actions}>
        <ActionButton size="small" variant="neutralWeak" onClick={() => navigate('/places/map')}>
          지도 보기
        </ActionButton>
        <ActionButton size="small" onClick={() => navigate('/places/new')}>
          장소 추가
        </ActionButton>
      </div>

      <div className={styles.list}>
        {places.length === 0 && (
          <p className={styles.empty}>
            {filter === 'all'
              ? '아직 등록된 장소가 없습니다.'
              : '이 종류에는 아직 장소가 없습니다.'}
          </p>
        )}
        <List>
          {places.map((place) => (
            <ListButtonItem
              key={place.id}
              title={findTranslation(place.translations, 'KO')?.name ?? `장소 ${place.id}`}
              detail={detailOf(place)}
              suffix={<LangBadge place={place} />}
              onClick={() => navigate(`/places/${place.id}`)}
            />
          ))}
        </List>
      </div>
    </div>
  )
}
