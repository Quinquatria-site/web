import { IconMapLine, IconPlusLine } from '@karrotmarket/react-monochrome-icon'
import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router'
import { ContextualFloatingButton, Icon } from '@seed-design/react'
import { ActionButton } from 'seed-design/ui/action-button'
import { Chip } from 'seed-design/ui/chip'
import { ChipTabsList, ChipTabsRoot, ChipTabsTrigger } from 'seed-design/ui/chip-tabs'
import { FloatingActionButton } from 'seed-design/ui/floating-action-button'
import { List, ListButtonItem } from 'seed-design/ui/list'
import { SnackbarAvoidOverlap } from 'seed-design/ui/snackbar'
import { detailOf } from '../lib/placeText'
import { placeLabel, placeSection } from '../map/place-label'
import { CATEGORIES, categoryById } from '../mocks/categories'
import { PLACES } from '../mocks/places'
import { useStoreVersion } from '../mocks/store'
import { findTranslation, hasMissingTranslations, type Place } from '../mocks/types'
import { LangBadge } from '../ui'
import styles from './PlacesRoute.module.css'

/** 구역 칩·묶음의 "구역 없음" 값. 구역 글자(A·B…)와 겹치지 않는다 */
const NO_SECTION = 'none'

/** 장소의 구역 칩 값. 카테고리를 못 찾으면 구역도 모르니 "구역 없음"에 둔다 */
function sectionKeyOf(place: Place): string {
  const code = categoryById(place.category_id)?.code
  return (code && placeSection(code, place.category_sequence)) ?? NO_SECTION
}

function sectionName(key: string): string {
  return key === NO_SECTION ? '구역 없음' : `${key}구역`
}

/** 구역 순서. 글자순으로 두고 "구역 없음"은 맨 뒤 — 번호순으로는 100 미만이라 맨 앞에 오지만 예외 장소다 */
function compareSectionKeys(a: string, b: string): number {
  if (a === b) return 0
  if (a === NO_SECTION) return 1
  if (b === NO_SECTION) return -1
  return a < b ? -1 : 1
}

/**
 * 구역별로 묶는다. 묶음 안은 받은 순서를 그대로 지킨다 — 넘기는 쪽이 번호순으로 정렬해 두면
 * 묶음 안도 번호순이다. 빈 묶음은 만들지 않는다
 */
function groupBySection(places: Place[]): { key: string; places: Place[] }[] {
  const keys = [...new Set(places.map(sectionKeyOf))].sort(compareSectionKeys)
  return keys.map((key) => ({ key, places: places.filter((p) => sectionKeyOf(p) === key) }))
}

/**
 * 줄 앞 번호. 위는 category_sequence, 아래는 지도 마커 글자다.
 * 카테고리를 못 찾으면 아래 줄을 비운다 — 지도처럼 BOOTH 로 짐작하면 목록에 틀린 번호가 뜬다
 */
function SeqPrefix({ place }: { place: Place }) {
  const code = categoryById(place.category_id)?.code
  const label = code ? placeLabel(code, place.category_sequence) : null
  // 머리를 안 봐도, 구역을 하나만 골라 머리가 없어도 구역이 보이게 표시 번호에 구역 색을 입힌다.
  // 구역 밖(100 미만 등)은 placeLabel 이 글자를 찍어도 구역이 아니라 칠하지 않는다
  const key = sectionKeyOf(place)
  return (
    <span
      className={`${styles.seqBox} ${styles.tone}`}
      data-section={key === NO_SECTION ? undefined : key}
    >
      <span className={styles.seq}>{place.category_sequence}</span>
      {label && <span className={styles.seqLabel}>{label}</span>}
    </span>
  )
}

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
 * 정렬은 category_sequence ASC, category_id ASC, id ASC. 명세 §5.1 은 카테고리부터
 * 묶지만, 현장에서는 부스 번호로 찾으니 "전체" 에서도 번호가 이어져야 한다.
 */
export function PlacesRoute() {
  const navigate = useNavigate()
  const [filter, setFilter] = useState<string>('all')
  const [section, setSection] = useState<string>('all')

  // 누락 필터만 URL 에 싣는다. 홈의 "번역 누락 · 장소" 가 이 화면을 필터가
  // 걸린 채로 열어야 해서다. 카테고리는 홈에서 가리키지 않으므로 state 로 둔다
  const [searchParams, setSearchParams] = useSearchParams()
  const missingOnly = searchParams.get('missing') === '1'
  const setMissingOnly = (next: boolean) =>
    setSearchParams(next ? { missing: '1' } : {}, { replace: true })

  // 삭제·실행취소가 이 목록에 바로 반영되게 한다
  useStoreVersion()

  // 메모하지 않는다. PLACES 는 목 스토어가 제자리에서 바꾸는 배열이라
  // 의존성으로 적을 것이 없고, 수십 건 정렬은 렌더마다 해도 싸다
  const sorted = [...PLACES].sort(
    (a, b) =>
      a.category_sequence - b.category_sequence || a.category_id - b.category_id || a.id - b.id,
  )
  // 카테고리와 번역 누락은 다른 축이라 AND 로 건다 — "부스 중 번역 누락"이 보여야 한다
  const byCategory =
    filter === 'all' ? sorted : sorted.filter((p) => p.category_id === Number(filter))
  // 구역 칩은 지금 카테고리에 있는 구역만 띄운다. 없는 구역 칩은 누르면 빈 화면뿐이다
  const sectionKeys = [...new Set(byCategory.map(sectionKeyOf))].sort(compareSectionKeys)
  // 구역 글자가 하나도 없으면(푸드트럭·의무실 등) "구역 없음" 하나만 남아 거를 것이 없다. 줄을 감춘다
  const hasSections = sectionKeys.some((key) => key !== NO_SECTION)
  // 카테고리를 옮기면 changeFilter 가 구역을 푼다. 여기는 고른 구역의 마지막 장소를 지워 칩이 사라질 때만 남는다
  const activeSection = hasSections && sectionKeys.includes(section) ? section : 'all'
  // 구역도 카테고리·번역 누락과 다른 축이라 AND 로 건다 — "주점 중 B구역"이 보여야 한다
  const bySection =
    activeSection === 'all'
      ? byCategory
      : byCategory.filter((p) => sectionKeyOf(p) === activeSection)
  const missingCount = bySection.filter((p) => hasMissingTranslations(p.translations)).length
  // 카테고리를 옮겨 누락이 0 이 되면 켜둔 토글이 빈 화면만 남긴다. 그때는 푼다
  const showMissingOnly = missingOnly && missingCount > 0
  const places = showMissingOnly
    ? bySection.filter((p) => hasMissingTranslations(p.translations))
    : bySection
  // 구역을 하나로 고르지 않았으면 구역별로 나눠 어디서 A구역이 끝나는지 보이게 한다.
  // 구역이 없는 카테고리는 "구역 없음" 머리 하나뿐이라 묶지 않는다
  const groups =
    hasSections && activeSection === 'all' ? groupBySection(places) : [{ key: null, places }]

  // 화면에서만 풀면 state 에 구역이 남아, 부스로 돌아왔을 때 예전 구역이 다시 걸린다. state 를 같이 푼다
  const changeFilter = (next: string) => {
    setFilter(next)
    setSection('all')
  }
  // 고른 칩을 다시 누르면 푼다. ChipTabs 는 같은 값을 다시 누르면 onValueChange 를 부르지 않아 click 으로 잡는다.
  // 고르기는 click 에서 일어나 렌더 때 값이 누르기 전 값이다. Enter·Space 도 button 이라 click 으로 온다
  const releaseFilter = (value: string) => () => {
    if (filter === value) changeFilter('all')
  }
  const releaseSection = (value: string) => () => {
    if (activeSection === value) setSection('all')
  }

  return (
    <div className={styles.screen}>
      {/* 단순 선택이 아니라 목록을 갈아끼우는 필터라 Chip 이 아니라 ChipTabs 다.
          가로 스크롤과 선택 칩 자동 노출을 ChipTabsList 가 맡는다 */}
      <ChipTabsRoot className={styles.filters} value={filter} onValueChange={changeFilter}>
        <ChipTabsList>
          <ChipTabsTrigger value="all">전체</ChipTabsTrigger>
          {CATEGORIES.map((category) => (
            <ChipTabsTrigger
              key={category.id}
              value={String(category.id)}
              onClick={releaseFilter(String(category.id))}
            >
              {findTranslation(category.translations, 'KO')?.name}
            </ChipTabsTrigger>
          ))}
        </ChipTabsList>
      </ChipTabsRoot>

      {/* 카테고리 칩과 같은 이유로 ChipTabs 다. 현장은 구역 단위로 움직여 구역으로도 거른다 */}
      {hasSections && (
        <ChipTabsRoot
          className={styles.sectionFilters}
          value={activeSection}
          onValueChange={setSection}
        >
          <ChipTabsList>
            <ChipTabsTrigger value="all">전체 구역</ChipTabsTrigger>
            {sectionKeys.map((key) => (
              <ChipTabsTrigger key={key} value={key} onClick={releaseSection(key)}>
                {key === NO_SECTION ? sectionName(key) : key}
              </ChipTabsTrigger>
            ))}
          </ChipTabsList>
        </ChipTabsRoot>
      )}

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
            filtered={filter !== 'all' || activeSection !== 'all'}
            missingOnly={showMissingOnly}
            onReset={() => {
              setFilter('all')
              setSection('all')
              setMissingOnly(false)
            }}
          />
        ) : (
          // 묶음 머리는 공연 목록의 종류별 묶음 머리(PerformancesRoute .groupTitle)에서 왔다.
          // 구역끼리 섞여 보이지 않게 구역 색 구분선·글자를 더했다 (색표는 CSS .tone)
          groups.map((group) => (
            <section
              key={group.key ?? 'all'}
              className={styles.tone}
              data-section={group.key ?? undefined}
              aria-label={group.key === null ? undefined : sectionName(group.key)}
            >
              {group.key !== null && (
                <h2 className={styles.groupTitle}>
                  {sectionName(group.key)}
                  <span className={styles.groupCount}>{group.places.length}</span>
                </h2>
              )}
              <List>
                {group.places.map((place) => (
                  <ListButtonItem
                    key={place.id}
                    // 화면 순번이 아니라 category_sequence 다. 그 아래에 지도·현장에 찍히는 번호(101 → A1)를
                    // 작게 붙여 운영자가 머릿속으로 바꾸지 않게 한다. 전체 보기에서는 카테고리마다
                    // 1 부터 다시 세지만, 바로 아래 detail 이 "주점 1번" 처럼 종류를 같이 말한다
                    prefix={<SeqPrefix place={place} />}
                    title={findTranslation(place.translations, 'KO')?.name ?? `장소 ${place.id}`}
                    detail={detailOf(place)}
                    suffix={<LangBadge translations={place.translations} />}
                    onClick={() => navigate(`/places/${place.id}`)}
                  />
                ))}
              </List>
            </section>
          ))
        )}
      </div>

      {/* 한 손 엄지가 닿는 바닥. 목록을 끝까지 내려도 자리를 지킨다.
          지도는 보조라 왼쪽, 장소 추가는 주 액션이라 엄지가 가장 편한 오른쪽이다 */}
      {/* 스낵바가 이 버튼을 덮지 않고 그 위로 뜨게 한다 (AppLayout 의 탭바와 같은 이유) */}
      <SnackbarAvoidOverlap>
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
      </SnackbarAvoidOverlap>
    </div>
  )
}
