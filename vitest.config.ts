import { defineConfig } from 'vitest/config'
// import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  // plugins: [react()], // We might need this if we were using vite, but vitest runs fine usually.
  // Actually, for JSX/TSX transformation, vitest handles it via esbuild mostly.
  test: {
    environment: 'jsdom',
    globals: true,
    exclude: ['e2e/**/*', 'node_modules/**/*'],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './'),
    },
  },
})
