import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'node',
    env: {
      NODE_ENV: 'test',
      UPLOAD_DIR: 'tests/.tmp/uploads'
    },
    globals: true,
    include: ['tests/**/*.test.js'],
    exclude: ['tests/.tmp/**', 'node_modules/**', 'dist/**'],
    testTimeout: 15000,
    hookTimeout: 30000
  }
})
