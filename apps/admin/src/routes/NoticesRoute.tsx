import { useState } from 'react'
import { useNavigate } from 'react-router'
import { ActionButton } from 'seed-design/ui/action-button'
import { List, ListButtonItem } from 'seed-design/ui/list'
import { SegmentedControl, SegmentedControlItem } from 'seed-design/ui/segmented-control'
import { LOST_ITEMS, NOTICES } from '../mocks/data'
import styles from './routes.module.css'

export function NoticesRoute() {
  const navigate = useNavigate()
  const [tab, setTab] = useState('notices')

  return (
    <div className={styles.page}>
      <div className={styles.inset}>
        <SegmentedControl aria-label="알림 종류" value={tab} onValueChange={setTab}>
          <SegmentedControlItem value="notices">공지사항</SegmentedControlItem>
          <SegmentedControlItem value="lost">분실물</SegmentedControlItem>
        </SegmentedControl>
      </div>

      {tab === 'notices' ? (
        <>
          <div className={styles.inset}>
            <ActionButton onClick={() => navigate('/notices/new')}>공지 작성</ActionButton>
          </div>
          <List>
            {NOTICES.map((notice) => (
              <ListButtonItem
                key={notice.id}
                title={notice.title}
                detail={`${notice.createdAt} · ${notice.published ? '게시됨' : '임시저장'}${notice.urgent ? ' · 긴급' : ''}`}
                onClick={() => navigate(`/notices/${notice.id}`)}
              />
            ))}
          </List>
        </>
      ) : (
        <>
          <div className={styles.inset}>
            <ActionButton onClick={() => navigate('/lost-items/new')}>분실물 등록</ActionButton>
          </div>
          <List>
            {LOST_ITEMS.map((item) => (
              <ListButtonItem
                key={item.id}
                title={item.name}
                detail={`${item.foundPlace} · ${item.foundAt} · ${item.returned ? '수령 완료' : '보관 중'}`}
                onClick={() => navigate(`/lost-items/${item.id}`)}
              />
            ))}
          </List>
        </>
      )}
    </div>
  )
}
