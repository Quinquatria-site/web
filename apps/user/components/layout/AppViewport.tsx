import type { ReactNode } from 'react'

export function AppViewport({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-dvh justify-center overflow-hidden bg-canvas">
      <div className="relative flex h-full w-full max-w-app flex-col overflow-y-auto overscroll-contain bg-background">
        {children}
      </div>
    </div>
  )
}
