'use client'

import { useLang } from '@/components/lang-provider'
import styles from './glass-sample.module.css'

export function GlassSample() {
  const { copy } = useLang()
  return (
    <div className={styles.scene}>
      <div className={`liquid-glass liquid-glass--sample ${styles.glass}`}>
        <div className={styles.content}>
          <span aria-hidden className={styles.symbol}>
            ✳
          </span>
          <p className={styles.title}>{copy.glassSample.title}</p>
          <p className={styles.description}>{copy.glassSample.description}</p>
        </div>
      </div>
    </div>
  )
}
