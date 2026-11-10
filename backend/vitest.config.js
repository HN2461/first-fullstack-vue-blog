import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'node',
    // Multiple suites reset the same temporary upload root, so test files must not overlap.
    // 串行使用独立进程，隔离 Sharp、内存 MongoDB 等原生模块的运行状态。
    pool: 'forks',
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
