import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'node',
    // Multiple suites reset the same temporary upload root, so test files must not overlap.
    // 串行复用一个 fork worker，降低 Windows 上测试进程过量启动导致的不稳定。
    maxWorkers: 1,
    fileParallelism: false,
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
