import { DockSentinel } from '@/components/dock/DockSentinel'

/** 홈. 랜딩 영역이 끝나는 지점에 도크 감지 표시를 둔다 */
export default function Home() {
  return (
    <>
      <section className="h-dvh" />
      <DockSentinel />
    </>
  )
}
