import { ScheduleBoard } from '@/features/schedule/ScheduleBoard'
import { PageHeader } from '@/shared/header/PageHeader'

/** 일정표 탭 */
export default function SchedulePage() {
  return (
    <>
      <PageHeader title="축제 일정표" />
      <ScheduleBoard />
    </>
  )
}
