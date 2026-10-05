import type { Messages } from '@/shared/i18n/messages'
import { OnlineCardCta } from './OnlineCardCta'
import { OnlineCard, OnlineCardHeading, OnlineCardInfo } from './OnlineCardParts'
import { PrizePodium } from './PrizePodium'

/** 사진 콘테스트 카드. 그림 대신 상품 시상대를 앞세우고 진행 기간·참여 경로와 버튼을 잇는다 */
export function PhotoContestCard({ href, online }: { href: string; online: Messages['online'] }) {
  const contest = online.items.photoContest
  return (
    <OnlineCard>
      <div className="flex flex-col gap-2.5 px-[15px] pt-3.5 pb-[15px]">
        <OnlineCardHeading title={contest.title} description={contest.description} />
        <PrizePodium label={contest.prizesLabel} prizes={contest.prizes} />
        <OnlineCardInfo
          rows={[
            { term: online.period, value: contest.period },
            { term: online.route, value: contest.route },
          ]}
        />
        <OnlineCardCta href={href}>{contest.cta}</OnlineCardCta>
      </div>
    </OnlineCard>
  )
}
