/** 돋보기 아이콘. 지도 컨트롤은 Leaflet 과 함께 브라우저에서만 실려서, 서버에서도 그리는 검색창이 쓰도록 따로 둔다 */
export function SearchIcon({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.2}
      strokeLinecap="round"
      className={className}
    >
      <circle cx="10.5" cy="10.5" r="6.5" />
      <path d="M15.5 15.5 20 20" />
    </svg>
  )
}
