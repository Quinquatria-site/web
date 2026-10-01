import type { StaticImageData } from 'next/image'
import type { Messages } from '@/shared/i18n/messages'
import baseballBoo from './images/baseball-boo.png'
import baseball from './images/baseball.png'
import rugby from './images/rugby.png'
import soccerCrop from './images/soccer-crop.png'
import soccer from './images/soccer.png'

/** 굿즈 한 종. 이름·설명은 messages 의 goods.items[id] 에 있다 */
export type Goods = {
  id: keyof Messages['goods']['items']
  image: StaticImageData
  /** 원 단위 */
  price: number
}

/** 판매하는 굿즈 전체. 굿즈 API 가 없어 시안 목록을 두고, 카드 넘기기·전체 보기가 이 순서를 따른다 */
export const GOODS: Goods[] = [
  { id: 'soccer', image: soccer, price: 36000 },
  { id: 'baseball', image: baseball, price: 36000 },
  { id: 'soccerCrop', image: soccerCrop, price: 35000 },
  { id: 'rugby', image: rugby, price: 40000 },
  { id: 'baseballBoo', image: baseballBoo, price: 40000 },
]
