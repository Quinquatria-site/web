import { IconPlusLine } from '@karrotmarket/react-monochrome-icon'
import { useState } from 'react'
import { useNavigate } from 'react-router'
import { Badge } from '@seed-design/react'
import { ActionButton } from 'seed-design/ui/action-button'
import { Callout } from 'seed-design/ui/callout'
import { Chip } from 'seed-design/ui/chip'
import { FloatingActionButton } from 'seed-design/ui/floating-action-button'
import { List, ListButtonItem } from 'seed-design/ui/list'
import { ListHeader } from 'seed-design/ui/list-header'
import { noticesByType, useStoreVersion } from '../mocks/store'
import {
  dateTimeLabel,
  findTranslation,
  hasMissingTranslations,
  missingLanguages,
  type Notice,
} from '../mocks/types'
import styles from './NoticesRoute.module.css'

function titleOf(notice: Notice): string {
  return findTranslation(notice.translations, 'KO')?.title ?? `공지 ${notice.id}`
}

/** 번역 상태. 빠진 언어가 있으면 그 언어 사용자에게 이 공지가 안 보인다 (§2.4) */
function LangBadge({ notice }: { notice: Notice }) {
  const missing = missingLanguages(notice.translations)
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

/**
 * 공지가 한 건도 없을 때. 막다른 길을 만들지 않으려고 나갈 문을 같이 둔다.
 * 섹션 하나만 비어 있는 경우는 Section 이 따로 말한다 — 여기까지 오지 않는다.
 */
function Empty() {
  const navigate = useNavigate()
  return (
    <div className={styles.empty}>
      <p className={styles.emptyTitle}>아직 등록된 공지가 없습니다</p>
      <p className={styles.emptyDescription}>오른쪽 아래 공지 추가 버튼을 눌러 시작하세요.</p>
      <ActionButton size="medium" onClick={() => navigate('/notices/new')}>
        공지 추가
      </ActionButton>
    </div>
  )
}

/**
 * 한 종류의 묶음. ListHeader 는 div 로 렌더되고 as 가 li 를 받지 않는데
 * List 루트는 ul 이다 — 안에 넣으면 잘못된 마크업이라 형제로 둔다.
 */
function Section({
  title,
  notices,
  emptyText,
  onSelect,
}: {
  title: string
  notices: Notice[]
  emptyText: string
  onSelect: (notice: Notice) => void
}) {
  return (
    <section className={styles.section}>
      <ListHeader as="h2">{title}</ListHeader>
      {notices.length === 0 ? (
        <p className={styles.sectionEmpty}>{emptyText}</p>
      ) : (
        <List>
          {notices.map((notice) => (
            <ListButtonItem
              key={notice.id}
              title={titleOf(notice)}
              detail={
                <span className={styles.detail}>
                  {dateTimeLabel(notice.created_at)}
                  <LangBadge notice={notice} />
                </span>
              }
              onClick={() => onSelect(notice)}
            />
          ))}
        </List>
      )}
    </section>
  )
}

/**
 * 공지 목록 (§5.7). 상시를 위, 일반을 아래에 두고 한 화면에 같이 보여준다.
 *
 * 세그먼트로 갈아끼우지 않는 이유는 두 종류가 학생 앱에서 서로 다른 API 로
 * 나가기 때문이다 — /notices 는 일반만, /notices/permanent 는 상시만이다 (§3.5).
 * 상시 공지는 뒤지는 대상이 아니라 "안전 수칙이 걸려 있나" 를 확인하는 대상이라,
 * 전환을 한 번 요구하면 확인을 안 하게 된다. 축제 기간 상시는 많아야 서너 건이다.
 *
 * 번역 누락 경고가 장소·공연보다 한 단계 세다. 공지는 놓치면 안 되는 정보라
 * 한국어로만 올린 공지는 외국인 학생에게 존재하지 않는 것과 같다 (§2.4, 이슈 #25).
 */
export function NoticesRoute() {
  const navigate = useNavigate()
  const [missingOnly, setMissingOnly] = useState(false)

  // 저장·삭제·실행취소가 이 목록에 바로 반영되게 한다
  useStoreVersion()

  // 메모하지 않는다. NOTICES 는 목 스토어가 제자리에서 바꾸는 배열이라
  // 의존성으로 적을 것이 없고, 수십 건 정렬은 렌더마다 해도 싸다
  const permanent = noticesByType('PERMANENT')
  const general = noticesByType('GENERAL')
  const total = permanent.length + general.length

  const missingCount = [...permanent, ...general].filter((n) =>
    hasMissingTranslations(n.translations),
  ).length
  // 누락이 0 이 되면 켜둔 토글이 빈 화면만 남긴다. 그때는 푼다
  const showMissingOnly = missingOnly && missingCount > 0
  const onlyMissing = (rows: Notice[]) =>
    showMissingOnly ? rows.filter((n) => hasMissingTranslations(n.translations)) : rows

  const open = (notice: Notice) => navigate(`/notices/${notice.id}`)
  const sectionEmpty = showMissingOnly ? '이 종류는 세 언어가 모두 채워져 있습니다.' : null

  return (
    <div className={styles.screen}>
      {/* 장소·공연에는 없는 처리다. 공지는 놓치면 안 되는 정보라 배지만으로는
          약하다 — 지금 몇 건이 외국인에게 안 보이는지 화면에 먼저 말한다 (#17) */}
      {missingCount > 0 && (
        <div className={styles.banner}>
          <Callout
            tone="critical"
            description={`${missingCount}건이 영어·중국어로 보는 학생에게 보이지 않습니다.`}
          />
        </div>
      )}

      {total > 0 && (
        <div className={styles.actions}>
          {/* 개수가 곧 남은 작업량이다. 필터는 두 종류 모두에 걸린다 */}
          <Chip.Toggle
            checked={showMissingOnly}
            disabled={missingCount === 0}
            onCheckedChange={setMissingOnly}
          >
            <Chip.Label>번역 누락 {missingCount}</Chip.Label>
          </Chip.Toggle>
        </div>
      )}

      <div className={styles.list}>
        {total === 0 ? (
          <Empty />
        ) : (
          <>
            <Section
              title="상시 공지"
              notices={onlyMissing(permanent)}
              emptyText={
                sectionEmpty ??
                '상시 공지가 없습니다. 안전 수칙처럼 축제 내내 걸어둘 안내를 올려주세요.'
              }
              onSelect={open}
            />
            <Section
              title="일반 공지"
              notices={onlyMissing(general)}
              emptyText={sectionEmpty ?? '아직 올라온 일반 공지가 없습니다.'}
              onSelect={open}
            />
          </>
        )}
      </div>

      {/* 한 손 엄지가 닿는 우하단. 목록을 끝까지 내려도 자리를 지킨다 */}
      <FloatingActionButton
        className={styles.fab}
        icon={<IconPlusLine />}
        label="공지 추가"
        onClick={() => navigate('/notices/new')}
      />
    </div>
  )
}
