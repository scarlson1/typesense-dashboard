import { defineConfig } from 'vite'
import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import viteReact from '@vitejs/plugin-react'

const config = defineConfig({
  resolve: {
    tsconfigPaths: true,
    dedupe: ['react', 'react-dom', '@emotion/react', '@emotion/styled'],
  },
  // MUI/Emotion must be bundled for SSR so styles render server-side.
  ssr: { noExternal: ['@mui/*', '@emotion/*'] },
  plugins: [tanstackStart(), viteReact()],
})

export default config
