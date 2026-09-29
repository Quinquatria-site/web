import { getMessages } from '@/shared/i18n/messages'
import { useLocale } from '@/shared/i18n/useLocale'
import { SELECTED_TAB_ICONS, TAB_ICONS } from './dock-icons'
import { DOCK_TABS } from './dock-mode'

type Tab = (typeof DOCK_TABS)[number]

/** 탭 한 칸의 상자. 바탕 줄과 선택 표시 위 덮개 줄이 픽셀 단위로 겹쳐야 해서 둘이 같이 쓴다 */
export function tabBoxClass(index: number) {
  // 칸 사이 간격까지 누를 수 있게 칸마다 간격을 반씩 나눠 가지고, 양끝 탭은 남는 여백을 더 가진다
  return `box-content flex h-full w-[calc(var(--dock-tab-width)+var(--dock-tab-gap))] shrink-0 flex-col items-center justify-center gap-1 ${
    index === 0 ? 'pl-(--dock-tab-end)' : ''
  } ${index === DOCK_TABS.length - 1 ? 'pr-(--dock-tab-end)' : ''}`
}

/** 탭 한 칸의 아이콘과 이름. selected 면 채운 아이콘을 쓴다 */
export function DockTabFace({ tab, selected = false }: { tab: Tab; selected?: boolean }) {
  const Icon = (selected ? SELECTED_TAB_ICONS : TAB_ICONS)[tab.href]
  const label = getMessages(useLocale()).dock.tabs[tab.id]
  return (
    <>
      <Icon className="size-(--dock-tab-icon)" />
      {/* 피그마에서 홈만 아이콘뿐이라 이름은 화면 읽기 프로그램에만 남긴다 */}
      <span
        className={
          tab.id === 'home'
            ? 'sr-only'
            : 'text-(length:--dock-tab-label) leading-[calc(var(--dock-tab-label)+2px)] font-semibold whitespace-nowrap'
        }
      >
        {label}
      </span>
    </>
  )
}
