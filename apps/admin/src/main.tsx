import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router'
import '@seed-design/css/base.css'
// base.css 보다 뒤여야 한다. 같은 :root 라 순서로 이긴다
import './app/brand-theme.css'
import { router } from './app/router'
import { AuthProvider } from './auth/AuthProvider'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  </StrictMode>,
)
