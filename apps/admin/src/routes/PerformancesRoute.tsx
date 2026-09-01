import { useState } from 'react'
import { useNavigate } from 'react-router'
import { ActionButton } from 'seed-design/ui/action-button'
import {
  BottomSheetBody,
  BottomSheetContent,
  BottomSheetFooter,
  BottomSheetRoot,
} from 'seed-design/ui/bottom-sheet'
import { Callout } from 'seed-design/ui/callout'
import { List, ListItem, ListSwitchItem } from 'seed-design/ui/list'
import { SegmentedControl, SegmentedControlItem } from 'seed-design/ui/segmented-control'
import { Switchmark } from 'seed-design/ui/switch'
import { FESTIVAL_DAYS, PERFORMANCES } from '../mocks/data'
import type { Performance } from '../mocks/types'
import { addMinutes } from '../lib/time'
import styles from './routes.module.css'

const KIND_LABEL: Record<Performance['kind'], string> = {
  celebrity: '연예인',
  student: '학우',
}

const DELAY_OPTIONS = [10, 20, 30]

/**
 * 세그먼트는 날짜다. 연예인·학우는 사용자 화면의 분류축이지 운영자 축이 아니다.
 * 카테고리로 화면을 가르면 통합 시간축이 사라져서 "지금 공연 중" 과 지연 연쇄가 안 보인다.
 */
export function PerformancesRoute() {
  const navigate = useNavigate()
  const [day, setDay] = useState(FESTIVAL_DAYS[0].value)
  const [list, setList] = useState(PERFORMANCES)
  const [delayTarget, setDelayTarget] = useState<Performance | undefined>(undefined)
  const [cascade, setCascade] = useState(true)

  const ofDay = list.filter((item) => item.day === day)

  const applyDelay = (minutes: number) => {
    if (!delayTarget) return
    const from = delayTarget.startsAt
    setList((prev) =>
      prev.map((item) => {
        if (item.day !== delayTarget.day) return item
        const isTarget = item.id === delayTarget.id
        const isLater = cascade && item.startsAt >= from
        if (!isTarget && !isLater) return item
        return {
          ...item,
          startsAt: addMinutes(item.startsAt, minutes),
          endsAt: addMinutes(item.endsAt, minutes),
        }
      }),
    )
    setDelayTarget(undefined)
  }

  return (
    <div className={styles.page}>
      <div className={styles.inset}>
        <SegmentedControl aria-label="축제 일자" value={day} onValueChange={setDay}>
          {FESTIVAL_DAYS.map((item) => (
            <SegmentedControlItem key={item.value} value={item.value}>
              {item.label}
            </SegmentedControlItem>
          ))}
        </SegmentedControl>
      </div>

      <div className={styles.inset}>
        <Callout description="공연은 밀립니다. 시각을 하나씩 고치지 말고 항목의 지연 버튼을 쓰세요." />
      </div>

      <div className={styles.inset}>
        <ActionButton onClick={() => navigate('/performances/new')}>공연 추가</ActionButton>
      </div>

      {ofDay.length === 0 ? (
        <p className={styles.empty}>이 날짜에 등록된 공연이 없습니다</p>
      ) : (
        <List>
          {ofDay.map((item) => (
            <ListItem
              key={item.id}
              title={
                // ListButtonItem 은 행 전체가 button 이라 안에 버튼을 못 넣는다.
                // 제목과 지연 버튼을 형제로 둔다.
                <button
                  type="button"
                  className={styles.rowButton}
                  onClick={() => navigate(`/performances/${item.id}`)}
                >
                  {item.startsAt}~{item.endsAt} {item.artist}
                </button>
              }
              detail={`${KIND_LABEL[item.kind]} · ${item.stage}`}
              suffix={
                <button
                  type="button"
                  className={styles.linkButton}
                  onClick={() => setDelayTarget(item)}
                >
                  지연
                </button>
              }
            />
          ))}
        </List>
      )}

      <BottomSheetRoot
        open={delayTarget !== undefined}
        onOpenChange={(open) => {
          if (!open) setDelayTarget(undefined)
        }}
      >
        <BottomSheetContent title="공연 지연">
          <BottomSheetBody>
            <p className={styles.muted}>
              {delayTarget?.artist} · 현재 {delayTarget?.startsAt}
            </p>
            <List>
              <ListSwitchItem
                title="이후 일정도 함께 밀기"
                detail="같은 날 뒤에 오는 공연을 모두 이동합니다"
                checked={cascade}
                onCheckedChange={setCascade}
                suffix={<Switchmark />}
              />
            </List>
          </BottomSheetBody>
          <BottomSheetFooter>
            <div className={styles.sheetActions}>
              {DELAY_OPTIONS.map((minutes) => (
                <ActionButton key={minutes} onClick={() => applyDelay(minutes)}>
                  +{minutes}분
                </ActionButton>
              ))}
            </div>
          </BottomSheetFooter>
        </BottomSheetContent>
      </BottomSheetRoot>
    </div>
  )
}
