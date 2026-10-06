import type { StaticImageData } from 'next/image'
import hwangJunho from './images/hwang-junho.webp'
import kimJiyong from './images/kim-jiyong.webp'
import kimTaeheon from './images/kim-taeheon.webp'
import limJaejoon from './images/lim-jaejoon.webp'
import wiSoomin from './images/wi-soomin.webp'
import type { SnsLink } from './SnsLinks'

/** 개발진 한 명. 학과는 언어마다 달라 messages 의 developers.departments 에 같은 id 로 둔다 */
export type Member = {
  id: 'hwangJunho' | 'kimJiyong' | 'limJaejoon' | 'kimTaeheon' | 'wiSoomin'
  name: string
  position: string
  photo?: StaticImageData
  links: SnsLink[]
}

/** 크레딧과 같은 순서의 개발진. 별자리 점과 카드가 이 순서로 짝지어진다 */
export const MEMBERS: Member[] = [
  {
    id: 'hwangJunho',
    name: 'Hwang Junho',
    position: 'Backend',
    photo: hwangJunho,
    links: [
      { type: 'github', href: 'https://github.com/Trashbin4943' },
      { type: 'linkedin', href: 'https://www.linkedin.com/in/junho-hwang-844910385/' },
    ],
  },
  {
    id: 'kimJiyong',
    name: 'Kim Jiyong',
    position: 'Backend',
    photo: kimJiyong,
    links: [
      { type: 'github', href: 'https://github.com/jiyonggg' },
      { type: 'linkedin', href: 'https://www.linkedin.com/in/jiyonggg/' },
    ],
  },
  {
    id: 'limJaejoon',
    name: 'Lim Jaejoon',
    position: 'Frontend',
    photo: limJaejoon,
    links: [
      { type: 'github', href: 'https://github.com/Dessert99' },
      { type: 'linkedin', href: 'https://www.linkedin.com/in/jae-joon-lim/' },
    ],
  },
  {
    id: 'kimTaeheon',
    name: 'Kim Taeheon',
    position: 'Frontend',
    photo: kimTaeheon,
    links: [
      { type: 'github', href: 'https://github.com/ChoRockKim' },
      // 프로필 주소에 한글이 들어 있어 퍼센트 인코딩해 둔다
      {
        type: 'linkedin',
        href: 'https://www.linkedin.com/in/%ED%83%9C%ED%97%8C-%EA%B9%80-3235b6399',
      },
    ],
  },
  {
    id: 'wiSoomin',
    name: 'Wi Soomin',
    position: 'Design',
    photo: wiSoomin,
    links: [{ type: 'linkedin', href: 'https://www.linkedin.com/in/soomin-wi-1871b7379/' }],
  },
]
