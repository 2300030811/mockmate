import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    exclude: ['e2e/**/*', 'node_modules/**/*', 'Resume-Matcher-main/**/*', 'career-ops-main/**/*', 'hiring-agent-main/**/*'],
    setupFiles: ['./vitest.setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json-summary', 'html'],
      reportsDirectory: './coverage',
      exclude: [
        'e2e/**/*',
        'node_modules/**/*',
        'Resume-Matcher-main/**/*',
        'career-ops-main/**/*',
        'hiring-agent-main/**/*',
        'scripts/**/*',
        '**/*.d.ts',
        '**/*.config.*',
        '**/*.test.*',
        'vitest.setup.ts',
      ],
      thresholds: {
        lines: 70,
        functions: 70,
        statements: 70,
        branches: 55,
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './'),
    },
  },
})
