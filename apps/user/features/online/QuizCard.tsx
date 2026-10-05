import Image from 'next/image'
import type { Messages } from '@/shared/i18n/messages'
import { OnlineCardCta } from './OnlineCardCta'
import { OnlineCard, OnlineCardHeading, OnlineCardInfo } from './OnlineCardParts'
import quizImage from './images/quiz.webp'

/** 유형 테스트 카드. 위에 그림, 아래 소개·진행 기간·참여 경로와 버튼 */
export function QuizCard({ href, online }: { href: string; online: Messages['online'] }) {
  const quiz = online.items.quiz
  return (
    <OnlineCard>
      <Image
        src={quizImage}
        alt=""
        sizes="(max-width: 480px) 90vw, 440px"
        placeholder="blur"
        className="aspect-video w-full object-cover"
      />
      <div className="flex flex-col gap-2.5 px-[15px] pt-3.5 pb-[15px]">
        <OnlineCardHeading title={quiz.title} description={quiz.description} />
        <OnlineCardInfo
          rows={[
            { term: online.period, value: quiz.period },
            { term: online.route, value: quiz.route },
          ]}
        />
        <OnlineCardCta href={href}>{quiz.cta}</OnlineCardCta>
      </div>
    </OnlineCard>
  )
}
