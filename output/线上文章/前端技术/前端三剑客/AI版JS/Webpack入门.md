---
title: "Webpack入门"
slug: "js-webpack-7e2ea348"
summary: ""
category: "AI版JS"
categoryPath:
  - "前端技术"
  - "前端三剑客"
  - "AI版JS"
tags: []
status: "published"
sortOrder: 130
cover: ""
originalId: "6a2d291e8a2b1c68f2cac104"
originalSlug: "js-webpack-7e2ea348"
originalStatus: "published"
publishedAt: "2026-01-25T13:23:07.496Z"
updatedAt: "2026-06-17T12:38:50.562Z"
exportedAt: "2026-07-30T15:42:33.614Z"
---
# 第26章 Webpack入门

> Webpack是现代前端开发的核心构建工具，它将各种资源打包成浏览器可以理解的静态文件。

---

## 26.1 Webpack的定位

### 26.1.1 什么是Webpack

```javascript
/**
 * Webpack解决的问题
 */
// 1. 模块化问题
import utils from './utils.js';
import './styles.css';
import logoImg from './logo.png';

// 2. 代码分割和懒加载
const LazyComponent = () => import('./LazyComponent.js');

// 3. 资源优化
// - 代码压缩
// - 图片优化  
// - CSS提取
// - Tree Shaking

/**
 * 传统开发vs Webpack开发
 */
// 传统方式：多个script标签
/*
<script src="jquery.js"></script>
<script src="utils.js"></script>
<script src="main.js"></script>
*/

// Webpack方式：单个bundle
/*
<script src="bundle.js"></script>
*/
```

### 26.1.2 核心概念

```javascript
/**
 * Entry（入口）
 */
module.exports = {
  entry: './src/index.js', // 单入口
  // 或多入口
  entry: {
    home: './src/home.js',
    about: './src/about.js'
  }
};

/**
 * Output（输出）
 */
module.exports = {
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].[contenthash].js',
    clean: true // 清理输出目录
  }
};

/**
 * Loader（加载器）
 */
module.exports = {
  module: {
    rules: [
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader']
      },
      {
        test: /\.(png|jpg|gif)$/,
        type: 'asset/resource'
      }
    ]
  }
};

/**
 * Plugin（插件）
 */
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  plugins: [
    new HtmlWebpackPlugin({
      template: './src/index.html'
    })
  ]
};
```

---

## 26.2 核心概念详解

### 26.2.1 Entry和Output配置

```javascript
/**
 * 基础配置
 */
// webpack.config.js
const path = require('path');

module.exports = {
  mode: 'development', // 'production' | 'development' | 'none'
  
  entry: {
    main: './src/index.js',
    vendor: './src/vendor.js'
  },
  
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].[contenthash:8].js',
    chunkFilename: '[name].[contenthash:8].chunk.js',
    publicPath: '/'
  }
};

/**
 * 动态Entry
 */
function createEntry() {
  const entries = {};
  const pages = ['home', 'about', 'contact'];
  
  pages.forEach(page => {
    entries[page] = `./src/pages/${page}/index.js`;
  });
  
  return entries;
}

module.exports = {
  entry: createEntry(),
  // ...
};
```

### 26.2.2 Loader详解

```javascript
/**
 * CSS Loader配置
 */
module.exports = {
  module: {
    rules: [
      {
        test: /\.css$/,
        use: [
          'style-loader', // 将CSS注入DOM
          'css-loader',   // 解析CSS文件
          'postcss-loader' // CSS后处理
        ]
      },
      {
        test: /\.scss$/,
        use: [
          'style-loader',
          'css-loader',
          'sass-loader' // 编译Sass
        ]
      }
    ]
  }
};

/**
 * JavaScript Loader
 */
module.exports = {
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env']
          }
        }
      }
    ]
  }
};

/**
 * 文件Loader
 */
module.exports = {
  module: {
    rules: [
      {
        test: /\.(png|jpg|jpeg|gif)$/,
        type: 'asset',
        generator: {
          filename: 'images/[name].[hash:8][ext]'
        },
        parser: {
          dataUrlCondition: {
            maxSize: 8 * 1024 // 8KB以下转base64
          }
        }
      },
      {
        test: /\.(woff|woff2|eot|ttf|otf)$/,
        type: 'asset/resource',
        generator: {
          filename: 'fonts/[name].[hash:8][ext]'
        }
      }
    ]
  }
};
```

### 26.2.3 Plugin系统

```javascript
/**
 * 常用Plugin配置
 */
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');

module.exports = {
  plugins: [
    // 清理输出目录
    new CleanWebpackPlugin(),
    
    // 生成HTML文件
    new HtmlWebpackPlugin({
      template: './src/index.html',
      filename: 'index.html',
      minify: {
        collapseWhitespace: true,
        removeComments: true
      }
    }),
    
    // 提取CSS
    new MiniCssExtractPlugin({
      filename: 'css/[name].[contenthash:8].css'
    })
  ]
};

/**
 * 自定义Plugin
 */
class MyPlugin {
  apply(compiler) {
    compiler.hooks.emit.tapAsync('MyPlugin', (compilation, callback) => {
      // 在生成文件之前执行
      console.log('Webpack正在构建...');
      
      // 添加自定义文件
      compilation.assets['info.txt'] = {
        source: () => 'Build information',
        size: () => 17
      };
      
      callback();
    });
  }
}

module.exports = {
  plugins: [
    new MyPlugin()
  ]
};
```

---

## 26.3 开发环境与生产环境

### 26.3.1 开发环境配置

```javascript
/**
 * webpack.dev.js - 开发环境配置
 */
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  mode: 'development',
  
  entry: './src/index.js',
  
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].js',
    publicPath: '/'
  },
  
  devtool: 'eval-source-map', // 源码映射
  
  devServer: {
    contentBase: './dist',
    port: 3000,
    hot: true, // 热更新
    open: true, // 自动打开浏览器
    historyApiFallback: true // SPA路由支持
  },
  
  module: {
    rules: [
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader']
      }
    ]
  },
  
  plugins: [
    new HtmlWebpackPlugin({
      template: './src/index.html'
    })
  ]
};

/**
 * 热更新配置
 */
// src/index.js
if (module.hot) {
  // 接受模块更新
  module.hot.accept('./components/App.js', () => {
    console.log('App组件已更新');
    // 重新渲染组件
  });
}
```

### 26.3.2 生产环境配置

```javascript
/**
 * webpack.prod.js - 生产环境配置
 */
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');

module.exports = {
  mode: 'production',
  
  entry: './src/index.js',
  
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'js/[name].[contenthash:8].js',
    chunkFilename: 'js/[name].[contenthash:8].chunk.js',
    clean: true
  },
  
  optimization: {
    minimize: true,
    minimizer: [
      new TerserPlugin({
        terserOptions: {
          compress: {
            drop_console: true // 移除console
          }
        }
      }),
      new CssMinimizerPlugin()
    ],
    
    // 代码分割
    splitChunks: {
      chunks: 'all',
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          priority: 10
        }
      }
    }
  },
  
  module: {
    rules: [
      {
        test: /\.css$/,
        use: [
          MiniCssExtractPlugin.loader,
          'css-loader',
          'postcss-loader'
        ]
      }
    ]
  },
  
  plugins: [
    new HtmlWebpackPlugin({
      template: './src/index.html',
      minify: true
    }),
    
    new MiniCssExtractPlugin({
      filename: 'css/[name].[contenthash:8].css'
    })
  ]
};
```

### 26.3.3 配置合并

```javascript
/**
 * webpack.common.js - 通用配置
 */
const path = require('path');

module.exports = {
  entry: './src/index.js',
  
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: 'babel-loader'
      },
      {
        test: /\.(png|jpg|gif)$/,
        type: 'asset/resource'
      }
    ]
  }
};

/**
 * 配置合并工具
 */
const { merge } = require('webpack-merge');
const common = require('./webpack.common.js');

// 开发环境
const dev = merge(common, {
  mode: 'development',
  devtool: 'eval-source-map'
});

// 生产环境
const prod = merge(common, {
  mode: 'production',
  optimization: {
    minimize: true
  }
});

module.exports = (env) => {
  return env.production ? prod : dev;
};
```

---

## 26.4 常用Loader解析

### 26.4.1 样式Loader

```javascript
/**
 * CSS处理链
 */
module.exports = {
  module: {
    rules: [
      {
        test: /\.css$/,
        use: [
          // 3. 将CSS注入到DOM中
          'style-loader',
          // 2. 解析CSS文件，处理@import和url()
          {
            loader: 'css-loader',
            options: {
              modules: true, // CSS模块化
              importLoaders: 1 // 指定在css-loader前应用的loader数量
            }
          },
          // 1. 使用PostCSS处理CSS
          {
            loader: 'postcss-loader',
            options: {
              postcssOptions: {
                plugins: [
                  'autoprefixer', // 自动添加前缀
                  'postcss-preset-env' // 使用未来CSS特性
                ]
              }
            }
          }
        ]
      }
    ]
  }
};

/**
 * PostCSS配置文件
 */
// postcss.config.js
module.exports = {
  plugins: {
    'autoprefixer': {},
    'postcss-preset-env': {
      stage: 0 // 使用所有CSS特性
    }
  }
};
```

### 26.4.2 JavaScript Loader

```javascript
/**
 * Babel配置
 */
module.exports = {
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: [
              ['@babel/preset-env', {
                targets: {
                  browsers: ['> 1%', 'last 2 versions']
                },
                modules: false, // 保留ES6模块，让Webpack处理
                useBuiltIns: 'usage', // 按需引入polyfill
                corejs: 3
              }]
            ],
            plugins: [
              '@babel/plugin-proposal-class-properties',
              '@babel/plugin-syntax-dynamic-import'
            ]
          }
        }
      }
    ]
  }
};

/**
 * TypeScript配置
 */
module.exports = {
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        exclude: /node_modules/,
        use: [
          'babel-loader',
          'ts-loader'
        ]
      }
    ]
  },
  
  resolve: {
    extensions: ['.tsx', '.ts', '.js']
  }
};
```

---

## 26.5 打包优化与Tree-Shaking

### 26.5.1 代码分割

```javascript
/**
 * SplitChunks优化
 */
module.exports = {
  optimization: {
    splitChunks: {
      chunks: 'all',
      minSize: 20000,
      maxSize: 244000,
      
      cacheGroups: {
        // 提取第三方库
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          chunks: 'all',
          priority: 10
        },
        
        // 提取公共代码
        common: {
          name: 'common',
          minChunks: 2,
          chunks: 'all',
          priority: 5,
          reuseExistingChunk: true
        },
        
        // 提取CSS
        styles: {
          test: /\.css$/,
          name: 'styles',
          chunks: 'all',
          enforce: true
        }
      }
    }
  }
};

/**
 * 动态导入实现代码分割
 */
// 路由级别的代码分割
const Home = () => import('./pages/Home.vue');
const About = () => import('./pages/About.vue');

// 组件级别的代码分割
function loadComponent() {
  return import('./HeavyComponent.js')
    .then(module => module.default);
}

/**
 * 预加载和预获取
 */
// 预加载（立即加载）
import(/* webpackPreload: true */ './PreloadModule.js');

// 预获取（空闲时加载）
import(/* webpackPrefetch: true */ './PrefetchModule.js');
```

### 26.5.2 Tree Shaking

```javascript
/**
 * Tree Shaking配置
 */
module.exports = {
  mode: 'production',
  
  optimization: {
    usedExports: true, // 标记未使用的导出
    sideEffects: false // 标记所有文件都没有副作用
  }
};

/**
 * package.json中的sideEffects配置
 */
{
  "sideEffects": [
    "*.css",
    "*.scss",
    "./src/polyfills.js"
  ]
}

/**
 * 编写Tree Shaking友好的代码
 */
// 好的做法：具名导出
export function add(a, b) {
  return a + b;
}

export function multiply(a, b) {
  return a * b;
}

// 使用时只导入需要的函数
import { add } from './math.js'; // multiply不会被打包

/**
 * 第三方库的Tree Shaking
 */
// 使用ES6模块版本的lodash
import { debounce } from 'lodash-es';

// 或者使用babel-plugin-import
// import { Button } from 'antd'; // 只导入Button组件
```

### 26.5.3 性能优化

```javascript
/**
 * 构建性能优化
 */
module.exports = {
  // 缓存配置
  cache: {
    type: 'filesystem',
    cacheDirectory: path.resolve(__dirname, '.webpack_cache')
  },
  
  // 多进程构建
  module: {
    rules: [
      {
        test: /\.js$/,
        use: [
          {
            loader: 'thread-loader',
            options: {
              workers: 2
            }
          },
          'babel-loader'
        ]
      }
    ]
  },
  
  // 解析优化
  resolve: {
    modules: ['node_modules'], // 减少搜索范围
    extensions: ['.js', '.json'], // 减少后缀尝试
    alias: {
      '@': path.resolve(__dirname, 'src') // 路径别名
    }
  }
};

/**
 * 运行时性能优化
 */
module.exports = {
  optimization: {
    // 运行时chunk
    runtimeChunk: 'single',
    
    // 模块ID生成策略
    moduleIds: 'deterministic',
    chunkIds: 'deterministic'
  }
};
```

---

**本章总结**

第26章介绍了Webpack现代前端构建工具的核心概念：

1. **Webpack的定位**：
   - 解决模块化、资源处理和代码优化问题
   - 从传统多文件加载到单bundle的转变
   - 现代前端工程化的基础设施
   - 与其他构建工具的对比和优势

2. **四大核心概念**：
   - Entry入口文件的配置和多入口处理
   - Output输出配置和文件命名规则
   - Loader资源转换和处理链
   - Plugin功能扩展和生命周期钩子

3. **开发环境与生产环境**：
   - 开发环境的热更新和调试优化
   - 生产环境的压缩和性能优化
   - webpack-dev-server的配置和使用
   - source-map的不同类型选择

4. **常用Loader解析**：
   - babel-loader的JavaScript转译
   - css-loader和style-loader的样式处理
   - file-loader和url-loader的资源处理
   - 各种Loader的配置选项和最佳实践

5. **打包优化与Tree-Shaking**：
   - 代码分割和懒加载的实现方式
   - Tree Shaking死代码消除原理
   - bundle分析和性能优化策略
   - 缓存策略和长期缓存配置

**关键要点**：
- Webpack是现代前端工程化的核心工具
- 掌握四大核心概念是使用Webpack的基础
- 区分开发环境和生产环境的不同优化策略
- 合理使用Loader和Plugin可以大幅提升开发效率

**下一章预告**

第27章将学习Vite新时代构建工具，了解基于ESM的开发服务器、HMR热更新机制、以及与Webpack的对比优势。
