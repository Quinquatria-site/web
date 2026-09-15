import { IconMapLine, IconPlusLine } from '@karrotmarket/react-monochrome-icon'
import { useState } from 'react'
import { useNavigate } from 'react-router'
import { Badge, Icon } from '@seed-design/react'
import { ActionButton } from 'seed-design/ui/action-button'
import { ChipTabsList, ChipTabsRoot, ChipTabsTrigger } from 'seed-design/ui/chip-tabs'
import { FloatingActionButton } from 'seed-design/ui/floating-action-button'
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
  // weak — 목록처럼 같은 배지가 줄줄이 반복되는 자리에 solid 는 너무 시끄럽다
  if (missing.length === 0)
    return (
      <Badge tone="neutral" variant="weak">
        3개 언어
      </Badge>
    )
  return (
    <Badge tone="critical" variant="weak">
      {missing.join('·')} 없음
    </Badge>
  )
}

/** 빈 목록. 막다른 길을 만들지 않으려고 나갈 문을 같이 둔다 */
function Empty({ filtered, onReset }: { filtered: boolean; onReset: () => void }) {
  const navigate = useNavigate()
  return (
    <div className={styles.empty}>
      <p className={styles.emptyTitle}>
        {filtered ? '이 종류에는 아직 장소가 없습니다' : '아직 등록된 장소가 없습니다'}
      </p>
      <p className={styles.emptyDescription}>
        {filtered
          ? '다른 종류를 보거나, 여기에 새 장소를 추가하세요.'
          : '오른쪽 아래 장소 추가 버튼을 눌러 시작하세요.'}
      </p>
      {filtered ? (
        <ActionButton size="medium" variant="neutralWeak" onClick={onReset}>
          전체 보기
        </ActionButton>
      ) : (
        <ActionButton size="medium" onClick={() => navigate('/places/new')}>
          장소 추가
        </ActionButton>
      )}
    </div>
  )
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
      {/* 단순 선택이 아니라 목록을 갈아끼우는 필터라 Chip 이 아니라 ChipTabs 다.
          가로 스크롤과 선택 칩 자동 노출을 ChipTabsList 가 맡는다 */}
      <ChipTabsRoot value={filter} onValueChange={setFilter}>
        <ChipTabsList>
          <ChipTabsTrigger value="all">전체</ChipTabsTrigger>
          {CATEGORIES.map((category) => (
            <ChipTabsTrigger key={category.id} value={String(category.id)}>
              {findTranslation(category.translations, 'KO')?.name}
            </ChipTabsTrigger>
          ))}
        </ChipTabsList>
      </ChipTabsRoot>

      {/* 칩과 같은 알약 모양이라 그냥 두면 7번째 필터처럼 읽힌다. 외곽선으로 갈라놓는다 */}
      <div className={styles.actions}>
        <ActionButton size="small" variant="neutralOutline" onClick={() => navigate('/places/map')}>
          <Icon svg={<IconMapLine />} />
          지도에서 보기
        </ActionButton>
      </div>

      <div className={styles.list}>
        {places.length === 0 ? (
          <Empty filtered={filter !== 'all'} onReset={() => setFilter('all')} />
        ) : (
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
        )}
      </div>

      {/* 한 손 엄지가 닿는 우하단. 목록을 끝까지 내려도 자리를 지킨다 */}
      <FloatingActionButton
        className={styles.fab}
        icon={<IconPlusLine />}
        label="장소 추가"
        onClick={() => navigate('/places/new')}
      />
    </div>
  )
}
