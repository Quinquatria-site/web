import { Fragment } from 'react'
import { matchRanges, type SearchQuery } from './search-places'

/** 검색어에 걸린 글자를 굵게. 한국어 원문으로만 걸린 번역 장소처럼 보이는 글자에 없으면 강조 없이 둔다 */
export function Highlight({ text, query }: { text: string; query: SearchQuery }) {
  const { text: shown, ranges } = matchRanges(text, query)
  if (ranges.length === 0) return text
  return (
    <>
      {ranges.map(([start, end], i) => (
        <Fragment key={start}>
          {shown.slice(i === 0 ? 0 : ranges[i - 1][1], start)}
          <mark className="bg-transparent font-extrabold text-inherit">
            {shown.slice(start, end)}
          </mark>
        </Fragment>
      ))}
      {shown.slice(ranges[ranges.length - 1][1])}
    </>
  )
}
