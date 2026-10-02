import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router'
import 'pretendard/dist/web/variable/pretendardvariable-dynamic-subset.css'
import '@seed-design/css/base.css'
// 우리 것은 모두 base.css 뒤에 둔다. 같은 :root 라 순서로 이긴다
import './app/reset.css'
import './app/typography.css'
import './app/brand-theme.css'
import { router } from './app/router'
import { AuthProvider } from './auth/AuthProvider'
import { installGlobalErrorHandlers } from './lib/errorLog'

// 첫 렌더보다 먼저. 렌더 중 터진 오류도 남기려면 그 전에 걸려 있어야 한다
installGlobalErrorHandlers()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  </StrictMode>,
)
