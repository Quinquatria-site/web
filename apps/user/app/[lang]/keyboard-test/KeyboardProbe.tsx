'use client'

import { useEffect, useState } from 'react'

/** 입력창과 뷰포트 값들을 실시간으로 보여 준다 */
export function KeyboardProbe() {
  const [info, setInfo] = useState('')

  useEffect(() => {
    const probe = document.createElement('div')
    probe.style.cssText = 'position:fixed;top:0;width:0;visibility:hidden'
    document.body.append(probe)
    const unit = (u: string) => {
      probe.style.height = `100${u}`
      return probe.offsetHeight
    }
    const update = () => {
      const vv = window.visualViewport
      setInfo(
        [
          `innerHeight ${window.innerHeight}`,
          `clientHeight ${document.documentElement.clientHeight}`,
          `visualViewport ${Math.round(vv?.height ?? 0)} · offsetTop ${Math.round(vv?.offsetTop ?? 0)}`,
          `lvh ${unit('lvh')} · svh ${unit('svh')} · dvh ${unit('dvh')}`,
          `scrollY ${Math.round(window.scrollY)}`,
          navigator.userAgent.slice(-60),
        ].join('\n'),
      )
    }
    update()
    const timer = setInterval(update, 300)
    return () => {
      clearInterval(timer)
      probe.remove()
    }
  }, [])

  return (
    <div style={{ position: 'relative', padding: 16, color: '#fff', fontSize: 14 }}>
      <input
        placeholder="여기를 눌러 키보드를 띄우세요"
        style={{
          width: '100%',
          padding: 12,
          fontSize: 16,
          borderRadius: 8,
          color: '#000',
          background: '#fff',
        }}
      />
      <pre
        style={{
          marginTop: 12,
          whiteSpace: 'pre-wrap',
          background: 'rgba(0,0,0,.6)',
          padding: 8,
          borderRadius: 8,
        }}
      >
        {info}
      </pre>
      <p style={{ marginTop: 12, background: 'rgba(0,0,0,.6)', padding: 8, borderRadius: 8 }}>
        키보드 위 자동완성 막대 뒤 띠 색: 파랑 = 웹 화면 안(배경을 그 아래까지 그릴 수 있음) · 초록
        = body · 빨강 = 페이지 맨 바탕 · 크림색 = 웹 화면 밖(iOS 크롬이 칠함)
      </p>
    </div>
  )
}
