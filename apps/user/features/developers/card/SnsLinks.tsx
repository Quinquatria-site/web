'use client'

import { motion, type Variants } from 'motion/react'

const LABEL = {
  github: 'GitHub',
  linkedin: 'LinkedIn',
  instagram: 'Instagram',
  email: 'Email',
}

/** SNS 링크 한 개. email 은 mailto: 주소를 넣는다 */
export type SnsLink = { type: keyof typeof LABEL; href: string }

/** 알약 모양 SNS 링크 줄. 링크가 없으면 줄째 그리지 않는다 */
export function SnsLinks({ links, variants }: { links: SnsLink[]; variants: Variants }) {
  if (links.length === 0) return null
  return (
    <ul className="mt-3 flex gap-1.5">
      {links.map((link) => (
        <motion.li key={link.type} variants={variants}>
          <a
            href={link.href}
            {...(link.href.startsWith('http') && { target: '_blank', rel: 'noopener noreferrer' })}
            className="inline-flex h-[26px] items-center rounded-full bg-secondary/90 px-[11px] text-[11px] font-semibold tracking-[0.04em] text-on-secondary"
          >
            {LABEL[link.type]}
            <span aria-hidden>&nbsp;↗</span>
          </a>
        </motion.li>
      ))}
    </ul>
  )
}
