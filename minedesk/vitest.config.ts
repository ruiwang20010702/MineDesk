import { defineConfig } from 'vitest/config'
import { resolve } from 'path'

export default defineConfig({
  test: {
    globals: true,
    environment: 'happy-dom',
    include: ['src/**/*.{test,spec}.{js,ts,jsx,tsx}'],
    exclude: ['node_modules', 'out', 'dist'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'out/',
        'dist/',
        '**/*.d.ts',
        '**/*.config.*',
        '**/mockData',
        'src/renderer/src/main.tsx'
      ]
    },
    setupFiles: ['./vitest.setup.ts']
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
      '@main': resolve(__dirname, './src/main'),
      '@renderer': resolve(__dirname, './src/renderer/src'),
      '@preload': resolve(__dirname, './src/preload')
    }
  }
})

