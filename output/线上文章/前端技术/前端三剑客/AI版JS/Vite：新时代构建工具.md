---
title: "Vite：新时代构建工具"
slug: "js-vite-cb22aa81"
summary: ""
category: "AI版JS"
tags: []
status: "draft"
sortOrder: 120
cover: ""
originalId: "6a2d291e8a2b1c68f2cac106"
originalSlug: "js-vite-cb22aa81"
originalStatus: "published"
exportedAt: "2026-07-30T14:08:39.359Z"
---
# 第27章 Vite：新时代构建工具

> Vite是基于ES modules的新一代前端构建工具，提供极速的开发服务器和优化的生产构建。

---

## 27.1 为什么选择Vite

### 27.1.1 传统构建工具的问题

```javascript
/**
 * Webpack等传统工具的痛点
 */

// 1. 冷启动慢
// 需要打包整个应用才能启动开发服务器
console.log('Webpack启动时间：10-30秒');

// 2. 热更新慢
// 修改文件后需要重新打包相关模块
console.log('Webpack HMR：1-3秒');

// 3. 配置复杂
// webpack.config.js
const config = {
  entry: './src/index.js',
  module: {
    rules: [
      { test: /\.css$/, use: ['style-loader', 'css-loader'] },
      { test: /\.js$/, use: 'babel-loader' }
      // 大量配置...
    ]
  },
  plugins: [
    // 各种插件配置...
  ]
};
```

### 27.1.2 Vite的优势

```javascript
/**
 * Vite的核心优势
 */

// 1. 极速冷启动
console.log('Vite启动时间：< 1秒');

// 2. 即时热更新
console.log('Vite HMR：< 100ms');

// 3. 基于ES Modules
// 开发环境直接使用浏览器原生ES模块
import { createApp } from 'vue';
import App from './App.vue';

// 4. 按需编译
// 只编译当前页面需要的文件

/**
 * Vite工作原理
 */
// 开发环境：
// 1. 启动开发服务器（几乎瞬时）
// 2. 浏览器请求模块时才进行转换
// 3. 利用HTTP缓存优化后续请求

// 生产环境：
// 1. 使用Rollup进行打包
// 2. 预配置的优化策略
// 3. 代码分割和Tree Shaking
```

---

## 27.2 开发服务器与HMR

### 27.2.1 开发服务器配置

```javascript
/**
 * vite.config.js基础配置
 */
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

export default defineConfig({
  // 插件配置
  plugins: [vue()],
  
  // 开发服务器配置
  server: {
    port: 3000,        // 端口号
    open: true,        // 自动打开浏览器
    cors: true,        // 允许跨域
    
    // 代理配置
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      }
    },
    
    // 预热文件
    warmup: {
      clientFiles: ['./src/components/*.vue']
    }
  },
  
  // 路径解析
  resolve: {
    alias: {
      '@': '/src',
      'components': '/src/components'
    }
  }
});

/**
 * 环境变量配置
 */
// .env.development
VITE_API_URL=http://localhost:8080
VITE_APP_TITLE=Development App

// .env.production  
VITE_API_URL=https://api.production.com
VITE_APP_TITLE=Production App

// 使用环境变量
const apiUrl = import.meta.env.VITE_API_URL;
const isDev = import.meta.env.DEV;
const isProd = import.meta.env.PROD;
```

### 27.2.2 热模块替换(HMR)

```javascript
/**
 * HMR API使用
 */
// main.js
import { createApp } from 'vue';
import App from './App.vue';

const app = createApp(App);

// HMR处理
if (import.meta.hot) {
  import.meta.hot.accept('./App.vue', (newModule) => {
    // 更新应用
    app.unmount();
    createApp(newModule.default).mount('#app');
  });
  
  // 处理状态保持
  import.meta.hot.accept((newModule) => {
    // 保持应用状态
    location.reload();
  });
  
  // 自定义HMR处理
  import.meta.hot.accept('./utils.js', (newModule) => {
    console.log('Utils模块已更新');
  });
}

/**
 * Vue组件的HMR
 */
// App.vue
<template>
  <div class="app">
    <h1>{{ title }}</h1>
    <Counter :initial="count" />
  </div>
</template>

<script>
export default {
  data() {
    return {
      title: 'Vite App',
      count: 0
    };
  }
};

// HMR状态保持
if (import.meta.hot) {
  let prevData = null;
  
  import.meta.hot.accept();
  
  // 保持组件状态
  if (import.meta.hot.data.prevData) {
    this.$data = import.meta.hot.data.prevData;
  }
  
  import.meta.hot.dispose(() => {
    import.meta.hot.data.prevData = this.$data;
  });
}
</script>

/**
 * CSS HMR
 */
// styles.css更新时自动应用新样式
.app {
  color: red; /* 修改后立即生效 */
}
```

### 27.2.3 依赖预构建

```javascript
/**
 * 依赖预构建配置
 */
export default defineConfig({
  optimizeDeps: {
    // 强制预构建
    include: ['lodash-es', 'axios'],
    
    // 排除预构建
    exclude: ['your-local-package'],
    
    // 自定义esbuild选项
    esbuildOptions: {
      target: 'es2020'
    }
  },
  
  // 强制重新预构建
  // 删除 node_modules/.vite 目录
  // 或运行 vite --force
});

/**
 * 预构建的工作流程
 */
// 1. Vite扫描入口文件
// 2. 发现裸模块导入（bare imports）
import axios from 'axios';        // 裸模块
import utils from './utils.js';   // 相对路径，不预构建

// 3. 使用esbuild预构建依赖
// 4. 将结果缓存在node_modules/.vite/deps/

/**
 * 动态导入的预构建
 */
// 动态导入也会被预构建
const module = await import('dynamic-library');

// 条件导入
if (someCondition) {
  const { helper } = await import('./helper.js');
}
```

---

## 27.3 Vite配置文件

### 27.3.1 基础配置结构

```javascript
/**
 * 完整的vite.config.js示例
 */
import { defineConfig, loadEnv } from 'vite';
import vue from '@vitejs/plugin-vue';
import { resolve } from 'path';

export default defineConfig(({ command, mode }) => {
  // 加载环境变量
  const env = loadEnv(mode, process.cwd(), '');
  
  return {
    // 基础配置
    base: mode === 'production' ? '/my-app/' : '/',
    
    // 插件
    plugins: [
      vue({
        template: {
          compilerOptions: {
            isCustomElement: (tag) => tag.startsWith('my-')
          }
        }
      })
    ],
    
    // 路径解析
    resolve: {
      alias: {
        '@': resolve(__dirname, 'src'),
        'components': resolve(__dirname, 'src/components'),
        'utils': resolve(__dirname, 'src/utils')
      },
      extensions: ['.mjs', '.js', '.ts', '.jsx', '.tsx', '.json', '.vue']
    },
    
    // CSS配置
    css: {
      preprocessorOptions: {
        scss: {
          additionalData: `@import "@/styles/variables.scss";`
        }
      },
      modules: {
        localsConvention: 'camelCase'
      }
    },
    
    // 构建配置
    build: {
      target: 'es2015',
      outDir: 'dist',
      assetsDir: 'assets',
      sourcemap: mode !== 'production',
      
      rollupOptions: {
        input: {
          main: resolve(__dirname, 'index.html'),
          admin: resolve(__dirname, 'admin.html')
        },
        
        output: {
          chunkFileNames: 'js/[name]-[hash].js',
          entryFileNames: 'js/[name]-[hash].js',
          assetFileNames: '[ext]/[name]-[hash].[ext]'
        }
      }
    },
    
    // 开发服务器
    server: {
      port: parseInt(env.VITE_PORT) || 3000,
      open: true,
      cors: true,
      proxy: {
        '/api': {
          target: env.VITE_API_URL,
          changeOrigin: true
        }
      }
    }
  };
});
```

### 27.3.2 条件配置

```javascript
/**
 * 根据环境的条件配置
 */
export default defineConfig(({ command, mode }) => {
  const isProduction = mode === 'production';
  const isDevelopment = mode === 'development';
  
  const config = {
    plugins: [vue()],
    
    // 开发环境特有配置
    ...(isDevelopment && {
      server: {
        port: 3000,
        open: true
      },
      css: {
        devSourcemap: true
      }
    }),
    
    // 生产环境特有配置
    ...(isProduction && {
      build: {
        minify: 'terser',
        terserOptions: {
          compress: {
            drop_console: true,
            drop_debugger: true
          }
        }
      }
    })
  };
  
  return config;
});

/**
 * 多环境配置文件
 */
// vite.config.base.js - 基础配置
export const baseConfig = {
  plugins: [vue()],
  resolve: {
    alias: { '@': '/src' }
  }
};

// vite.config.dev.js - 开发配置
import { mergeConfig } from 'vite';
import { baseConfig } from './vite.config.base.js';

export default mergeConfig(baseConfig, {
  mode: 'development',
  server: {
    port: 3000,
    hmr: true
  }
});
```

### 27.3.3 插件配置

```javascript
/**
 * 常用插件配置
 */
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { resolve } from 'path';

// 自动导入插件
import AutoImport from 'unplugin-auto-import/vite';
import Components from 'unplugin-vue-components/vite';

// PWA插件
import { VitePWA } from 'vite-plugin-pwa';

// Mock插件
import { viteMockServe } from 'vite-plugin-mock';

export default defineConfig({
  plugins: [
    vue(),
    
    // 自动导入API
    AutoImport({
      imports: ['vue', 'vue-router'],
      dts: true // 生成类型声明文件
    }),
    
    // 自动导入组件
    Components({
      dts: true,
      dirs: ['src/components']
    }),
    
    // PWA支持
    VitePWA({
      registerType: 'autoUpdate',
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}']
      }
    }),
    
    // Mock数据
    viteMockServe({
      mockPath: 'mock',
      localEnabled: true,
      prodEnabled: false
    })
  ]
});

/**
 * 自定义插件
 */
function myPlugin() {
  return {
    name: 'my-plugin',
    
    // 构建开始
    buildStart(options) {
      console.log('构建开始');
    },
    
    // 转换代码
    transform(code, id) {
      if (id.endsWith('.vue')) {
        // 处理Vue文件
        return {
          code: transformVueFile(code),
          map: null
        };
      }
    },
    
    // 生成bundle
    generateBundle(options, bundle) {
      // 添加额外文件
      this.emitFile({
        type: 'asset',
        fileName: 'manifest.json',
        source: JSON.stringify({ version: '1.0.0' })
      });
    }
  };
}
```

---

## 27.4 构建与部署流程

### 27.4.1 构建优化

```javascript
/**
 * 生产构建配置
 */
export default defineConfig({
  build: {
    // 构建目标
    target: 'es2015',
    
    // 输出目录
    outDir: 'dist',
    assetsDir: 'static',
    
    // 代码分割
    rollupOptions: {
      output: {
        manualChunks: {
          // 分离vendor代码
          vendor: ['vue', 'vue-router'],
          
          // 分离工具库
          utils: ['lodash-es', 'axios']
        }
      }
    },
    
    // 压缩配置
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        pure_funcs: ['console.log']
      }
    },
    
    // 启用gzip压缩报告
    reportCompressedSize: true,
    
    // chunk大小警告限制
    chunkSizeWarningLimit: 1000
  }
});

/**
 * 构建分析
 */
// 安装rollup-plugin-visualizer
import { visualizer } from 'rollup-plugin-visualizer';

export default defineConfig({
  plugins: [
    vue(),
    
    // 构建分析
    visualizer({
      filename: 'dist/stats.html',
      open: true,
      gzipSize: true
    })
  ]
});
```

### 27.4.2 静态资源处理

```javascript
/**
 * 静态资源配置
 */
export default defineConfig({
  // 静态资源基础路径
  base: '/my-app/',
  
  // 静态资源处理
  assetsInclude: ['**/*.gltf', '**/*.hdr'],
  
  build: {
    // 静态资源内联阈值
    assetsInlineLimit: 4096, // 4KB以下内联为base64
    
    rollupOptions: {
      output: {
        assetFileNames: (assetInfo) => {
          const info = assetInfo.name.split('.');
          let extType = info[info.length - 1];
          
          if (/\.(mp4|webm|ogg|mp3|wav|flac|aac)(\?.*)?$/i.test(assetInfo.name)) {
            extType = 'media';
          } else if (/\.(png|jpe?g|gif|svg)(\?.*)?$/i.test(assetInfo.name)) {
            extType = 'images';
          } else if (/\.(woff2?|eot|ttf|otf)(\?.*)?$/i.test(assetInfo.name)) {
            extType = 'fonts';
          }
          
          return `${extType}/[name].[hash][extname]`;
        }
      }
    }
  }
});

/**
 * 图片优化
 */
import { defineConfig } from 'vite';
import { createSvgIconsPlugin } from 'vite-plugin-svg-icons';

export default defineConfig({
  plugins: [
    // SVG图标处理
    createSvgIconsPlugin({
      iconDirs: [resolve(process.cwd(), 'src/assets/icons')],
      symbolId: 'icon-[dir]-[name]'
    })
  ]
});

// 使用新的静态资源导入
import logoUrl from '/src/assets/logo.png';
import workerUrl from '/src/worker.js?worker&url';

// 显式URL导入
import assetAsURL from '/src/asset.png?url';
```

### 27.4.3 部署配置

```javascript
/**
 * 部署到不同平台的配置
 */

// Netlify部署
// netlify.toml
/*
[build]
  publish = "dist"
  command = "npm run build"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
*/

// Vercel部署
// vercel.json
/*
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
*/

// GitHub Pages部署
export default defineConfig({
  base: '/repository-name/', // GitHub Pages路径
  
  build: {
    outDir: 'docs' // GitHub Pages可选择docs目录
  }
});

/**
 * Docker部署配置
 */
// Dockerfile
/*
FROM node:16-alpine as builder

WORKDIR /app
COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
*/

/**
 * CI/CD配置
 */
// .github/workflows/deploy.yml
/*
name: Deploy to Production

on:
  push:
    branches: [ main ]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v2
    
    - name: Setup Node.js
      uses: actions/setup-node@v2
      with:
        node-version: '16'
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Build
      run: npm run build
    
    - name: Deploy
      uses: peaceiris/actions-gh-pages@v3
      with:
        github_token: ${{ secrets.GITHUB_TOKEN }}
        publish_dir: ./dist
*/
```

---

**本章总结**

第27章深入介绍了Vite新时代构建工具的核心特性：

1. **Vite的优势**：
   - 基于原生ES模块的极速冷启动
   - 毫秒级的HMR热更新体验
   - 开箱即用的合理默认配置
   - 针对现代开发环境的优化设计

2. **开发服务器与HMR**：
   - ES模块的即时加载机制
   - 依赖预构建和缓存策略
   - 热模块替换的实现原理
   - 开发服务器的配置和优化

3. **Vite配置文件**：
   - vite.config.js的基础配置
   - 插件系统的使用和扩展
   - 路径别名和环境变量配置
   - 开发和生产环境的差异处理

4. **构建与部署流程**：
   - 生产环境的Rollup打包
   - 静态资源的处理和优化
   - 构建产物的分析和优化
   - 不同部署平台的配置策略

**关键要点**：
- Vite利用现代浏览器的ES模块支持实现极速开发体验
- HMR热更新机制大幅提升开发效率
- 插件系统提供了强大的扩展能力
- 生产构建基于Rollup保证了优化效果

**下一章预告**

第28章将学习NPM与包管理，包括package.json完整解析、scripts编写规范、版本管理semver，以及发布npm包的完整流程。
