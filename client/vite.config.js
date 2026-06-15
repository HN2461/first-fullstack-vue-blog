import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  optimizeDeps: {
    include: ['cropperjs']
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) {
            return
          }

          if (id.includes('markdown-it')) {
            return 'markdown-vendor'
          }

          if (id.includes('@ant-design') || id.includes('ant-design-vue')) {
            return 'antd-vendor'
          }

          if (id.includes('lucide-vue-next')) {
            return 'icon-vendor'
          }

          if (id.includes('/vue/') || id.includes('vue-router') || id.includes('pinia')) {
            return 'vue-vendor'
          }
        }
      }
    }
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:3001',
        changeOrigin: true
      },
      '/uploads': {
        target: 'http://127.0.0.1:3001',
        changeOrigin: true
      },
      '/legacy-notes': {
        target: 'http://127.0.0.1:3001',
        changeOrigin: true
      }
    }
  }
})
