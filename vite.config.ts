/// <reference types="vitest" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  // Custom domain (chatcopilot.ckgrafico.com) serves from root — base must be '/'
  base: '/',
  plugins: [react()],
  test: {
    environment: 'node',
    globals: true,
    include: ['src/**/*.test.ts'],
  },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
} as any)
