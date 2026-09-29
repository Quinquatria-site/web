import { revalidateTag } from 'next/cache'
import { CACHE_TAGS } from '@/shared/api/cache-tags'

const ALLOWED_TAGS = new Set<string>(Object.values(CACHE_TAGS))

/** 외부 백엔드가 데이터를 바꾼 뒤 부르는 재검증 입구. 비밀 키가 맞고 아는 태그일 때만 캐시를 비운다 */
export async function POST(request: Request) {
  const secret = process.env.REVALIDATE_SECRET
  // 키가 설정되지 않았으면 "Bearer undefined" 로 뚫리지 않게 막는다
  if (!secret || request.headers.get('authorization') !== `Bearer ${secret}`) {
    return Response.json({ message: 'unauthorized' }, { status: 401 })
  }

  const tag = await readTag(request)
  if (!tag) return Response.json({ message: 'unknown tag' }, { status: 400 })

  // max: 다음 방문자에게는 옛 화면을 주고 뒤에서 새로 굽는다
  revalidateTag(tag, 'max')
  return Response.json({ revalidated: tag })
}

/** 본문의 tag 가 허용된 태그면 돌려주고, JSON 이 깨졌거나 모르는 태그면 null */
async function readTag(request: Request): Promise<string | null> {
  try {
    const { tag } = await request.json()
    return typeof tag === 'string' && ALLOWED_TAGS.has(tag) ? tag : null
  } catch {
    // 깨진 JSON 이나 null 본문처럼 tag 를 꺼낼 수 없는 경우
    return null
  }
}
