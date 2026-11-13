import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'
import pkg from './package.json' with { type: 'json' }

export default defineConfig({
  base: './',
  plugins: [react()],
  define: {
    __APP_VERSION__: JSON.stringify(pkg.version),
  },
  // Playwright owns e2e/; Vitest only collects unit tests next to the source.
  test: { environment: 'node', include: ['src/**/*.test.ts'] },
})
