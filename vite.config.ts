/// <reference types="vitest" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  // GitHub Pages serves from /chat-copilot/ — set base so assets resolve correctly
  base: '/chat-copilot/',
  plugins: [react()],
  test: {
    environment: 'node',
    globals: true,
    include: ['src/**/*.test.ts'],
  },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
} as any)
