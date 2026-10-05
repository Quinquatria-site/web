import { Fragment } from 'react'

// 캡처 묶음이라 split 결과의 홀수 칸이 주소다. 주소 글자(ASCII)만 이어 받아 `(www.a.kr)에서` 의 괄호·한글에서 끊는다
const URL_PATTERN = /((?:https?:\/\/|www\.)[\w\-.~:/?#@!$&'*+,;=%]+)/g

// 주소 바로 뒤에 붙여 쓴 문장부호는 주소가 아니다
const TRAILING_PUNCTUATION = /[.,!?;:)\]}'"…]+$/

/** 글 속 주소를 새 탭으로 여는 파란 밑줄 링크로 바꾸고, 나머지 글자는 그대로 둔다 */
export function LinkedText({ text }: { text: string }) {
  return (
    <>
      {text.split(URL_PATTERN).map((part, i) => {
        if (i % 2 === 0) return part
        const url = part.replace(TRAILING_PUNCTUATION, '')
        return (
          <Fragment key={i}>
            <a
              href={url.startsWith('www.') ? `https://${url}` : url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-link underline"
            >
              {url}
            </a>
            {part.slice(url.length)}
          </Fragment>
        )
      })}
    </>
  )
}
