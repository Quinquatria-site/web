import 'server-only'
import { getLocale } from '@/shared/i18n/get-locale'
import { API_LANGUAGE, SOURCE_LOCALE } from '@/shared/i18n/locales'

type GetOptions = {
  tags: string[]
  query?: Record<string, string>
  /** 페이지 언어 대신 한국어 원문으로 받는다. 번역이 빠진 항목을 채울 때만 쓴다 */
  source?: boolean
}

// 첫 요청이 실패하면 이만큼 더 시도하고, 시도 사이에 이만큼 쉰다
const RETRY_COUNT = 2
const RETRY_DELAY_MS = 1000

// 백엔드가 재검증 호출을 빠뜨려도 이 시간 뒤 첫 방문 때 다시 굽는다
const REVALIDATE_SECONDS = 1800

// 주소가 없으면 빈 화면을 굽지 않고 빌드를 멈춘다
function apiBaseUrl() {
  const base = process.env.API_BASE_URL
  if (!base) throw new Error('API_BASE_URL 환경변수가 없습니다')
  return base
}

/** Customer API 가 오류 상태로 답했을 때. 호출하는 쪽이 status 로 404 같은 경우를 가려 쓴다 */
export class ApiError extends Error {
  status: number

  constructor(path: string, status: number) {
    super(`GET ${path} ${status}`)
    this.status = status
  }
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

/** Customer API GET. 지금 그리는 페이지의 언어로 받고, 5xx·네트워크 오류는 다시 시도하며, 끝내 실패하면 던져서 빈 화면이 배포되지 않게 한다 */
export async function serverApi<T>(path: string, { tags, query, source }: GetOptions): Promise<T> {
  // 호출하는 쪽이 언어를 고르지 않게 해서, 원문으로 채우겠다고 밝힌 곳 말고는 다른 언어가 섞이지 않게 한다
  const language = API_LANGUAGE[source ? SOURCE_LOCALE : await getLocale()]
  const url = new URL(`/api/v1${path}`, apiBaseUrl())
  url.search = new URLSearchParams({ ...query, language_code: language }).toString()

  for (let attempt = 0; ; attempt++) {
    const last = attempt === RETRY_COUNT
    let res: Response
    try {
      res = await fetch(url, { next: { tags, revalidate: REVALIDATE_SECONDS } })
    } catch (error) {
      // 연결 자체가 끊긴 경우. 잠깐 깨어나는 서버라 다시 시도할 만하다
      if (last) throw new Error(`GET ${path} 네트워크 오류`, { cause: error })
      await sleep(RETRY_DELAY_MS)
      continue
    }
    if (res.ok) return res.json() as Promise<T>
    // 4xx 는 요청이 틀린 것이라 다시 보내도 같다
    if (res.status < 500 || last) throw new ApiError(path, res.status)
    await sleep(RETRY_DELAY_MS)
  }
}
