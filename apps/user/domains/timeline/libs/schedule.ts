import { ARTISTS, NOW } from '@/mocks/timeline'
import type { Artist, IsoDate } from '@/mocks/types'

export function artistsOn(date: IsoDate) {
  return ARTISTS.filter((artist) => artist.date === date)
}

export function liveArtist(date: IsoDate) {
  if (date !== NOW.date) return null
  return artistsOn(date).find(({ start, end }) => start <= NOW.time && NOW.time < end) ?? null
}

/** 진행 중인 무대가 없는 날은 그날 첫 무대를 앞에 세운다. */
export function featuredArtist(date: IsoDate) {
  return liveArtist(date) ?? artistsOn(date)[0] ?? null
}

export function timeRange(artist: Artist) {
  return `${artist.start} – ${artist.end}`
}
