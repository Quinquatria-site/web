/** HTML 을 읽는 자리에서 바로 도는 스크립트. 브라우저가 다시 그릴 때는 text/plain 이라 돌지 않고 React 경고도 없다 */
export function InlineScript({ html }: { html: string }) {
  return (
    <script
      type={typeof window === 'undefined' ? 'text/javascript' : 'text/plain'}
      suppressHydrationWarning
      dangerouslySetInnerHTML={{ __html: html }}
    />
  )
}
