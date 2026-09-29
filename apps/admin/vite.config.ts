import { seedDesignPlugin } from '@seed-design/vite-plugin'
import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv, type Plugin } from 'vite'

/**
 * 로컬에서 `api/analytics.ts` 를 실제로 실행한다. 배포에서는 Vercel 이 그 파일을
 * 서버리스 함수로 돌리지만, vite dev 는 그것을 모른 채 소스를 JS 모듈로 내려준다
 * (200 · text/javascript). 그래서 dev 에서만 같은 GET 을 불러 응답을 그대로 넘긴다.
 *
 * CF_* 는 `.env.local` 에서 읽는다. VITE_ 가 아니라 번들에는 들어가지 않는다.
 */
function devApi(): Plugin {
  return {
    name: 'admin-dev-api',
    apply: 'serve',
    configureServer(server) {
      // loadEnv 는 process.env 에 이미 있는 값을 파일보다 우선한다. 빈 칸으로 띄운
      // 뒤 채우면 재시작해도 같은 프로세스에 빈 값이 남아 파일을 가리므로, 빈 값은
      // 지우고 읽고, 빈 값은 넣지 않는다. 셸에서 준 값은 그대로 우선이다
      for (const key of Object.keys(process.env)) {
        if (key.startsWith('CF_') && !process.env[key]) delete process.env[key]
      }
      const env = loadEnv(server.config.mode, server.config.root, 'CF_')
      for (const [key, value] of Object.entries(env)) if (value) process.env[key] ??= value

      server.middlewares.use('/api/analytics', async (req, res) => {
        try {
          const { GET } = await server.ssrLoadModule('/api/analytics.ts')
          // use(prefix) 는 req.url 에서 prefix 를 떼므로 원래 주소로 만든다
          const url = new URL(req.originalUrl ?? '/api/analytics', 'http://localhost')
          const response: Response = await GET(new Request(url))
          res.statusCode = response.status
          response.headers.forEach((value, key) => res.setHeader(key, value))
          res.end(Buffer.from(await response.arrayBuffer()))
        } catch (error) {
          server.config.logger.error(`[dev-api] ${String(error)}`)
          res.statusCode = 500
          res.end()
        }
      })
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    // 라이트 고정. 플러그인이 <html> 에 data-seed-color-mode 를 심는다.
    // index.html 에 손으로 적어도 이 스크립트가 덮어쓰므로 여기서 정한다.
    // 다크를 다시 켜려면 'system' 으로 바꾸고 브랜드 토큰의 다크 값도 함께 잡아야 한다.
    seedDesignPlugin({ colorMode: 'light-only' }),
    devApi(),
  ],
  resolve: { tsconfigPaths: true },
})
