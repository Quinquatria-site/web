import { IconPlusLine } from '@karrotmarket/react-monochrome-icon'
import { useNavigate, useSearchParams } from 'react-router'
import { ActionButton } from 'seed-design/ui/action-button'
import { FloatingActionButton } from 'seed-design/ui/floating-action-button'
import { List, ListButtonItem } from 'seed-design/ui/list'
import { SegmentedControl, SegmentedControlItem } from 'seed-design/ui/segmented-control'
import { Snackbar, useSnackbarAdapter } from 'seed-design/ui/snackbar'
import { lostItemsByReturned, setReturned, useStoreVersion } from '../mocks/store'
import { dateTimeLabel, findTranslation, type LostItem } from '../mocks/types'
import { imageSrc } from '../lib/imageSrc'
import { LangBadge } from '../ui'
import styles from './LostItemsRoute.module.css'

function titleOf(item: LostItem): string {
  return findTranslation(item.translations, 'KO')?.title ?? `분실물 ${item.id}`
}

function locationOf(item: LostItem): string {
  return findTranslation(item.translations, 'KO')?.found_location ?? ''
}

/**
 * 행 썸네일. 주인은 "검정 장우산" 이라는 글자가 아니라 자기 우산을 알아본다 —
 * 이 화면에서 사진이 1차 식별 수단이라 제목보다 앞에 둔다.
 *
 * alt 를 비우는 이유는 바로 옆 title 이 같은 것을 말하기 때문이다. 채우면
 * 스크린리더가 한 행에서 물건 이름을 두 번 읽는다.
 *
 * image_url 은 화면이 필수로 막지만 타입은 nullable 이다 (§5.8 · 목 데이터).
 * null 이면 imageSrc 를 부르지 않는다 — 빈 key 를 해시해 엉뚱한 사진을 보여주면
 * 사진이 있는 것처럼 읽힌다.
 */
function Thumb({ item }: { item: LostItem }) {
  if (!item.image_url) return <div className={styles.thumbEmpty} />
  return <img className={styles.thumb} src={imageSrc(item.image_url)} alt="" />
}

/**
 * 빈 목록. 두 세그먼트의 0건은 뜻이 정반대라 문구를 나눈다.
 *
 * 미반환 0건은 나쁜 소식이 아니다 — 들어온 습득물을 다 돌려줬다는 뜻이다.
 * 반환완료 0건은 아직 아무도 안 찾아갔다는 뜻이라 할 일이 남아 있다.
 */
function Empty({ returned, onShowPending }: { returned: boolean; onShowPending: () => void }) {
  const navigate = useNavigate()

  if (returned)
    return (
      <div className={styles.empty}>
        <p className={styles.emptyTitle}>아직 반환한 분실물이 없습니다</p>
        <p className={styles.emptyDescription}>
          미반환 목록에서 반환 버튼을 누르면 그 물건이 여기로 옮겨집니다.
        </p>
        <ActionButton size="medium" variant="neutralWeak" onClick={onShowPending}>
          미반환 보기
        </ActionButton>
      </div>
    )

  return (
    <div className={styles.empty}>
      <p className={styles.emptyTitle}>주인을 기다리는 물건이 없습니다</p>
      <p className={styles.emptyDescription}>
        들어온 습득물을 모두 돌려줬습니다. 새로 주운 물건은 아래 버튼으로 등록하세요.
      </p>
      <ActionButton size="medium" onClick={() => navigate('/lost-items/new')}>
        분실물 등록
      </ActionButton>
    </div>
  )
}

/**
 * 분실물 목록. 미반환/반환완료로 나누고 기본은 미반환이다.
 * 현장에서 물건을 든 채 한 손으로 등록하므로 등록 속도가 가장 중요하다.
 *
 * **반환 처리가 스위치가 아니라 버튼인 이유.** 이 목록은 is_returned 로 걸러져
 * 있다. 그래서 한 세그먼트 안에서는 그 값이 상수다 — 미반환 탭이면 전부 false,
 * 반환완료 탭이면 전부 true. 거기에 스위치를 달면 모든 행이 같은 상태를 보여주게
 * 되어 상태 표시로서 아무 정보도 전달하지 못하고, 누르면 행이 반대 세그먼트로
 * 넘어가 사라진다. 스위치가 할 일이 아니다.
 *
 * 공연의 is_live 스위치는 사정이 다르다. 그 목록은 is_live 로 거르지 않아서
 * 꺼진 것들 사이에 켜진 하나가 보인다 — 거기서는 진짜 상태 표시다.
 *
 * 걸러진 목록을 유지하는 한 그 필드의 컨트롤은 액션이어야 한다. 반환완료는
 * 뒤지는 대상이 아니라 실행취소·감사용 아카이브라 기본 화면에서 빠져 있는 것이
 * 맞고, 그래야 작업 목록이 깨끗하다.
 */
export function LostItemsRoute() {
  const navigate = useNavigate()
  const snackbar = useSnackbarAdapter()

  // 보고 있던 세그먼트를 URL 에 싣는다. 편집하고 돌아왔을 때 미반환으로 튕기지 않는다
  const [searchParams, setSearchParams] = useSearchParams()
  const returned = searchParams.get('returned') === '1'

  // 저장·삭제·실행취소·반환 처리가 이 목록에 바로 반영되게 한다
  useStoreVersion()

  // 메모하지 않는다. LOST_ITEMS 는 목 스토어가 제자리에서 바꾸는 배열이라
  // 의존성으로 적을 것이 없고, 수십 건 정렬은 렌더마다 해도 싸다.
  // 보지 않는 쪽도 계산하는 것은 세그먼트에 건수를 띄우기 위해서다 — 숫자가
  // 있어야 두 탭이 같은 집합을 나눈 것으로 읽힌다
  const pending = lostItemsByReturned(false)
  const done = lostItemsByReturned(true)
  const rows = returned ? done : pending

  const showPending = () => setSearchParams({}, { replace: true })

  const changeReturned = (item: LostItem, next: boolean) => {
    setReturned(item.id, next)
    // 누르는 순간 행이 반대 세그먼트로 넘어가 화면에서 사라진다. 버튼이라
    // 의도는 분명하지만 폰에서 오탭은 여전히 가능하고, 되돌릴 수단이 이 스낵바
    // 뿐이라 삭제와 같은 6초를 준다
    snackbar.create({
      timeout: 6000,
      render: () => (
        <Snackbar
          message={
            next ? `${titleOf(item)} 반환 처리했습니다` : `${titleOf(item)} 미반환으로 되돌렸습니다`
          }
          actionLabel="실행취소"
          onAction={() => setReturned(item.id, !next)}
        />
      ),
    })
  }

  return (
    <div className={styles.screen}>
      <div className={styles.segments}>
        <SegmentedControl
          aria-label="반환 여부"
          value={returned ? '1' : '0'}
          onValueChange={(value) =>
            setSearchParams(value === '1' ? { returned: '1' } : {}, { replace: true })
          }
        >
          <SegmentedControlItem value="0">미반환 {pending.length}</SegmentedControlItem>
          <SegmentedControlItem value="1">반환완료 {done.length}</SegmentedControlItem>
        </SegmentedControl>
      </div>

      <div className={styles.list}>
        {rows.length === 0 ? (
          <Empty returned={returned} onShowPending={showPending} />
        ) : (
          <List>
            {rows.map((item) => (
              <ListButtonItem
                key={item.id}
                prefix={<Thumb item={item} />}
                title={<span className={styles.title}>{titleOf(item)}</span>}
                detail={
                  <span className={styles.detail}>
                    {locationOf(item)}
                    {/* 등록 시각이 곧 습득 시각이다. 주인이 "언제 잃어버렸는지" 로
                        찾아오므로 장소와 나란히 보여야 한다 */}
                    <span className={styles.time}>{dateTimeLabel(item.created_at)}</span>
                    <LangBadge translations={item.translations} />
                  </span>
                }
                suffix={
                  /* 행마다 반복되는 자리라 solid 는 시끄럽다 — 목록의 배지를
                     weak 로 두는 것과 같은 이유다. 되돌리기는 교정용이라 한 단계
                     더 약하다. 라벨이 「반환」 하나뿐이면 스크린리더가 같은 말을
                     스무 번 읽으므로 aria-label 에 제목을 붙인다 */
                  <ActionButton
                    size="small"
                    variant={returned ? 'neutralWeak' : 'neutralOutline'}
                    aria-label={`${titleOf(item)} ${returned ? '미반환으로 되돌리기' : '반환 처리'}`}
                    onClick={() => changeReturned(item, !returned)}
                  >
                    {returned ? '되돌리기' : '반환'}
                  </ActionButton>
                }
                onClick={() => navigate(`/lost-items/${item.id}${returned ? '?returned=1' : ''}`)}
              />
            ))}
          </List>
        )}
      </div>

      {/* 한 손 엄지가 닿는 우하단. 목록을 끝까지 내려도 자리를 지킨다 */}
      <FloatingActionButton
        className={styles.fab}
        icon={<IconPlusLine />}
        label="분실물 등록"
        onClick={() => navigate('/lost-items/new')}
      />
    </div>
  )
}
