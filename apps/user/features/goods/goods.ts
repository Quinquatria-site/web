import type { StaticImageData } from 'next/image'
import type { Messages } from '@/shared/i18n/messages'
import bandana from './images/bandana.png'
import baseballOnePiece from './images/baseball-one-piece.png'
import baseball from './images/baseball.png'
import booBaseball from './images/boo-baseball.png'
import booHoodie from './images/boo-hoodie.png'
import hockey from './images/hockey.png'
import muffler from './images/muffler.png'
import ribbon from './images/ribbon.png'
import slogan from './images/slogan.png'
import soccerCrop from './images/soccer-crop.png'
import soccer from './images/soccer.png'
import tattooSticker from './images/tattoo-sticker.png'
import teeHufs from './images/tee-hufs.png'
import teeQqa from './images/tee-qqa.png'

/** 굿즈 한 종. 이름은 messages 의 goods.items[id] 에 있다 */
export type Goods = {
  id: keyof Messages['goods']['items']
  image: StaticImageData
  /** 원 단위 */
  price: number
}

/** 판매하는 굿즈 전체. 굿즈 API 가 없어 현장판매 가격표를 그대로 옮기고, 카드 넘기기·전체 보기가 이 순서를 따른다 */
export const GOODS: Goods[] = [
  { id: 'baseball', image: baseball, price: 40000 },
  { id: 'baseballOnePiece', image: baseballOnePiece, price: 42000 },
  { id: 'soccer', image: soccer, price: 37000 },
  { id: 'soccerCrop', image: soccerCrop, price: 37000 },
  { id: 'hockey', image: hockey, price: 39000 },
  { id: 'teeQqa', image: teeQqa, price: 18000 },
  { id: 'teeHufs', image: teeHufs, price: 13000 },
  { id: 'booBaseball', image: booBaseball, price: 45000 },
  { id: 'booHoodie', image: booHoodie, price: 45000 },
  { id: 'bandana', image: bandana, price: 9000 },
  { id: 'slogan', image: slogan, price: 5000 },
  { id: 'muffler', image: muffler, price: 12000 },
  { id: 'tattooSticker', image: tattooSticker, price: 6000 },
  { id: 'ribbon', image: ribbon, price: 3000 },
]
