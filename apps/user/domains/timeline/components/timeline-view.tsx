'use client'

import { useState } from 'react'
import { useLang } from '@/components/lang-provider'
import { NOW } from '@/mocks/timeline'
import type { Artist, IsoDate } from '@/mocks/types'
import { artistsOn, featuredArtist, liveArtist } from '../libs/schedule'
import { ArtistDialog } from './artist-dialog'
import { DayTabs } from './day-tabs'
import { NowPlaying } from './now-playing'
import { ScheduleList } from './schedule-list'

export function TimelineView() {
  const { copy } = useLang()
  const [date, setDate] = useState<IsoDate>(NOW.date)
  const [opened, setOpened] = useState<Artist | null>(null)

  const featured = featuredArtist(date)

  return (
    <div className="flex h-full flex-col">
      <h1 className="sr-only">{copy.pages['/timeline'].label}</h1>
      <DayTabs value={date} onChange={setDate} />
      <NowPlaying artist={featured} live={liveArtist(date) !== null} />
      <ScheduleList items={artistsOn(date)} activeId={featured?.id ?? null} onSelect={setOpened} />
      <ArtistDialog artist={opened} onClose={() => setOpened(null)} />
    </div>
  )
}
