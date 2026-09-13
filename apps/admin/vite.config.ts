import { seedDesignPlugin } from '@seed-design/vite-plugin'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    // 라이트 고정. 플러그인이 <html> 에 data-seed-color-mode 를 심는다.
    // index.html 에 손으로 적어도 이 스크립트가 덮어쓰므로 여기서 정한다.
    // 다크를 다시 켜려면 'system' 으로 바꾸고 브랜드 토큰의 다크 값도 함께 잡아야 한다.
    seedDesignPlugin({ colorMode: 'light-only' }),
  ],
  resolve: { tsconfigPaths: true },
})
