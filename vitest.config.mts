import { defineConfig } from 'vitest/config'
import path from 'path'

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    exclude: ['e2e/**/*', 'node_modules/**/*'],
    // setupFiles: ['./vitest.setup.ts'], // If we need global mocks
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './'),
    },
  },
})
