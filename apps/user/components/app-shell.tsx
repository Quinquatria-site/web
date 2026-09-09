import type { ReactNode } from 'react'

export function AppShell({ children, nav }: { children: ReactNode; nav: ReactNode }) {
  return (
    <div className="relative mx-auto flex h-dvh w-full max-w-[430px] flex-col overflow-hidden bg-surface">
      <div className="h-full overflow-y-auto overscroll-contain">{children}</div>
      {nav}
    </div>
  )
}
