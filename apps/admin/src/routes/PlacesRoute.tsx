import { IconMapLine, IconPlusLine } from '@karrotmarket/react-monochrome-icon'
import { useState } from 'react'
import { useNavigate } from 'react-router'
import { ContextualFloatingButton, Icon } from '@seed-design/react'
import { ActionButton } from 'seed-design/ui/action-button'
import { Chip } from 'seed-design/ui/chip'
import { ChipTabsList, ChipTabsRoot, ChipTabsTrigger } from 'seed-design/ui/chip-tabs'
import { FloatingActionButton } from 'seed-design/ui/floating-action-button'
import { List, ListButtonItem } from 'seed-design/ui/list'
import { detailOf } from '../lib/placeText'
import { CATEGORIES } from '../mocks/categories'
import { PLACES } from '../mocks/places'
import { useStoreVersion } from '../mocks/store'
import { findTranslation, hasMissingTranslations } from '../mocks/types'
import { LangBadge } from '../ui'
import styles from './PlacesRoute.module.css'

/**
 * 빈 목록. 막다른 길을 만들지 않으려고 나갈 문을 같이 둔다.
 * 번역 누락 필터가 0건인 것은 나쁜 소식이 아니라 좋은 소식이라 따로 말한다.
 */
function Empty({
  filtered,
  missingOnly,
  onReset,
}: {
  filtered: boolean
  missingOnly: boolean
  onReset: () => void
}) {
  const navigate = useNavigate()
  const title = missingOnly
    ? '번역이 빠진 장소가 없습니다'
    : filtered
      ? '이 종류에는 아직 장소가 없습니다'
      : '아직 등록된 장소가 없습니다'
  const description = missingOnly
    ? '세 언어가 모두 채워져 있습니다.'
    : filtered
      ? '다른 종류를 보거나, 여기에 새 장소를 추가하세요.'
      : '오른쪽 아래 장소 추가 버튼을 눌러 시작하세요.'

  return (
    <div className={styles.empty}>
      <p className={styles.emptyTitle}>{title}</p>
      <p className={styles.emptyDescription}>{description}</p>
      {filtered || missingOnly ? (
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
  const [missingOnly, setMissingOnly] = useState(false)
  // 삭제·실행취소가 이 목록에 바로 반영되게 한다
  useStoreVersion()

  // 메모하지 않는다. PLACES 는 목 스토어가 제자리에서 바꾸는 배열이라
  // 의존성으로 적을 것이 없고, 수십 건 정렬은 렌더마다 해도 싸다
  const sorted = [...PLACES].sort(
    (a, b) =>
      a.category_id - b.category_id || a.category_sequence - b.category_sequence || a.id - b.id,
  )
  // 카테고리와 번역 누락은 다른 축이라 AND 로 건다 — "부스 중 번역 누락"이 보여야 한다
  const byCategory =
    filter === 'all' ? sorted : sorted.filter((p) => p.category_id === Number(filter))
  const missingCount = byCategory.filter((p) => hasMissingTranslations(p.translations)).length
  // 카테고리를 옮겨 누락이 0 이 되면 켜둔 토글이 빈 화면만 남긴다. 그때는 푼다
  const showMissingOnly = missingOnly && missingCount > 0
  const places = showMissingOnly
    ? byCategory.filter((p) => hasMissingTranslations(p.translations))
    : byCategory

  return (
    <div className={styles.screen}>
      {/* 단순 선택이 아니라 목록을 갈아끼우는 필터라 Chip 이 아니라 ChipTabs 다.
          가로 스크롤과 선택 칩 자동 노출을 ChipTabsList 가 맡는다 */}
      <ChipTabsRoot className={styles.filters} value={filter} onValueChange={setFilter}>
        <ChipTabsList>
          <ChipTabsTrigger value="all">전체</ChipTabsTrigger>
          {CATEGORIES.map((category) => (
            <ChipTabsTrigger key={category.id} value={String(category.id)}>
              {findTranslation(category.translations, 'KO')?.name}
            </ChipTabsTrigger>
          ))}
        </ChipTabsList>
      </ChipTabsRoot>

      <div className={styles.actions}>
        {/* 카테고리 탭과 다른 축이라 그 줄에 넣지 않는다. 넣으면 카테고리 선택이 풀려
            "부스 중 번역 누락"을 볼 수 없다. 개수가 곧 남은 작업량이다 */}
        <Chip.Toggle
          checked={showMissingOnly}
          disabled={missingCount === 0}
          onCheckedChange={setMissingOnly}
        >
          <Chip.Label>번역 누락 {missingCount}</Chip.Label>
        </Chip.Toggle>
      </div>

      <div className={styles.list}>
        {places.length === 0 ? (
          <Empty
            filtered={filter !== 'all'}
            missingOnly={showMissingOnly}
            onReset={() => {
              setFilter('all')
              setMissingOnly(false)
            }}
          />
        ) : (
          <List>
            {places.map((place) => (
              <ListButtonItem
                key={place.id}
                title={findTranslation(place.translations, 'KO')?.name ?? `장소 ${place.id}`}
                detail={detailOf(place)}
                suffix={<LangBadge translations={place.translations} />}
                onClick={() => navigate(`/places/${place.id}`)}
              />
            ))}
          </List>
        )}
      </div>

      {/* 한 손 엄지가 닿는 바닥. 목록을 끝까지 내려도 자리를 지킨다.
          지도는 보조라 왼쪽, 장소 추가는 주 액션이라 엄지가 가장 편한 오른쪽이다 */}
      <div className={styles.floatRow}>
        {/* layer — 브랜드 solid 인 장소 추가와 같은 무게로 경쟁하면 안 된다 */}
        <ContextualFloatingButton variant="layer" onClick={() => navigate('/places/map')}>
          <Icon svg={<IconMapLine />} />
          지도
        </ContextualFloatingButton>

        <FloatingActionButton
          icon={<IconPlusLine />}
          label="장소 추가"
          onClick={() => navigate('/places/new')}
        />
      </div>
    </div>
  )
}
