---
title: "GitHub Pages 部署 Vue 博客完整教程"
slug: "github-pages-vue-f7e9371a"
summary: "作为“网站部署”系列的第 1 篇，面向初学者梳理 Vue 博客部署到 GitHub Pages 的完整流程，覆盖打包、base 路径、Hash 路由、手动部署、GitHub Actions 自动部署与常见问题排查。"
category: "网站部署"
tags:
  - "GitHub Pages"
  - "Vue3"
  - "Vite"
  - "博客部署"
  - "Hash 路由"
status: "draft"
sortOrder: 10
cover: ""
originalId: "6a2d291f8a2b1c68f2cac58a"
originalSlug: "github-pages-vue-f7e9371a"
originalStatus: "published"
exportedAt: "2026-07-30T14:30:35.933Z"
---
# GitHub Pages 部署 Vue 博客完整教程

> 这是 `电脑 / 网站部署` 目录下的第 1 篇。  
> 当前博客先使用 GitHub Pages 做静态部署，后面可以继续沿着这个专题补自定义域名、HTTPS、服务器、Nginx、自动化发布等内容。

本文一步步记录如何把自己开发的 Vue 博客项目部署到 GitHub Pages，让网站可以通过浏览器在线访问。

这篇文章默认项目使用 `Vite + Vue3`，并且已经能在本地通过 `npm run dev` 正常运行。

## 一、开始前需要准备什么

在正式部署之前，先确认这些基础条件都已经满足：

1. 已安装 Node.js，建议使用 LTS 版本。
2. 已安装 Git，并且已经配置好 GitHub 账号。
3. 项目使用 Vite + Vue3 构建。
4. 项目本地能正常启动，执行 `npm run dev` 可以打开页面。
5. GitHub 上已经有一个用于托管项目源码的仓库。

GitHub Pages 只能托管静态网页，所以最终上传或部署的一定是打包后的 `HTML`、`CSS`、`JS`、图片等静态资源，而不是本地开发服务器。

## 二、第一步：打包项目

在项目根目录执行：

```bash
npm run build
```

打包完成后，项目根目录会生成一个 `dist/` 文件夹。

`dist/` 里面就是 GitHub Pages 真正需要托管的静态资源，通常会包含：

1. `index.html`
2. 打包后的 `assets/*.js`
3. 打包后的 `assets/*.css`
4. 图片、字体等静态资源

需要注意：`dist/` 是构建产物目录，不建议手动修改里面的文件。每次代码更新后，重新执行 `npm run build` 生成新的产物即可。

## 三、第二步：修改 Vite 的 base 路径

GitHub Pages 的仓库页面通常访问地址是：

```text
https://<用户名>.github.io/<仓库名>/
```

所以项目打包时，资源路径前面必须带上仓库名。否则页面虽然打开了，但是 `JS`、`CSS` 可能会因为路径错误加载失败，最后表现为页面空白。

打开 `vite.config.js`，把 `base` 改成自己的仓库名：

```js
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  base: '/仓库名/'
})
```

假设仓库名是 `HaonanKnowledgeBlog`，就写成：

```js
export default defineConfig({
  plugins: [vue()],
  base: '/HaonanKnowledgeBlog/'
})
```

这里前后两个 `/` 都要保留。

常见错误写法：

```js
base: '仓库名'
base: '/仓库名'
base: '仓库名/'
```

推荐始终写成：

```js
base: '/仓库名/'
```

## 四、第三步：把 Vue Router 改成 Hash 模式

如果项目是单页应用，GitHub Pages 不适合直接使用 `createWebHistory()`。

原因是刷新子页面时，浏览器会请求类似下面的真实路径：

```text
https://<用户名>.github.io/<仓库名>/dashboard
```

但是 GitHub Pages 上并没有真正的 `/dashboard` 文件，所以刷新后容易出现 `404`。

更稳妥的方式是使用 Hash 模式，让路由变成：

```text
https://<用户名>.github.io/<仓库名>/#/dashboard
```

这样 `#` 后面的内容由前端路由接管，刷新页面也不容易 404。

打开 `src/router/index.js`：

```js
import { createRouter, createWebHashHistory } from 'vue-router'
import Home from '../views/Home.vue'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

export default router
```

关键点只有一个：

```js
history: createWebHashHistory()
```

如果原来是：

```js
history: createWebHistory()
```

部署到 GitHub Pages 前建议改成 `createWebHashHistory()`。

## 五、第四步：把 dist 部署到 GitHub Pages

部署有两种常见方式：

1. 手动把 `dist` 产物推送到专门的部署分支。
2. 使用 GitHub Actions 自动打包并部署。

初学阶段可以先理解手动部署，后面再切换到自动部署。

## 六、方法 A：手动部署

手动部署的核心原则是：

`GitHub Pages 选择哪个分支，那个分支根目录就必须放打包后的静态资源。`

常见做法是新建一个 `gh-pages` 分支，专门存放 `dist/` 里的内容。

基本流程如下：

1. 在源码分支执行 `npm run build`。
2. 打开生成的 `dist/` 文件夹。
3. 创建或切换到部署分支，例如 `gh-pages`。
4. 清空部署分支原有内容。
5. 把 `dist/` 里面的内容复制到部署分支根目录。
6. 提交并推送部署分支。
7. 在 GitHub Pages 设置里选择该分支的 `/ (root)`。

如果想使用 `dev` 分支部署也可以，但要注意：`dev` 分支根目录必须是打包后的静态资源，而不是项目源码。

也就是说，Pages 选择：

```text
Branch: dev
Folder: / (root)
```

那么 `dev` 分支根目录里应该直接能看到 `index.html` 和 `assets/`，而不是 `src/`、`package.json`、`vite.config.js`。

## 七、方法 B：GitHub Actions 自动部署

更推荐的方式是使用 GitHub Actions。

这种方式不需要手动复制 `dist/`，只要把源码推送到主分支，GitHub Actions 就会自动：

1. 拉取代码。
2. 安装依赖。
3. 执行 `npm run build`。
4. 上传 `dist/`。
5. 发布到 GitHub Pages。

先在 GitHub 仓库中打开：

```text
Settings -> Pages
```

然后把部署来源改成：

```text
Source: GitHub Actions
```

接着在项目中新建文件：

```text
.github/workflows/deploy-pages.yml
```

写入下面的配置：

```yaml
name: Deploy GitHub Pages

on:
  push:
    branches:
      - main

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: pages
  cancel-in-progress: true

jobs:
  build:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm

      - name: Install dependencies
        run: npm ci

      - name: Build
        run: npm run build

      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: dist

  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}

    steps:
      - name: Deploy
        id: deployment
        uses: actions/deploy-pages@v4
```

如果你的源码分支不是 `main`，把这里改成实际分支名：

```yaml
branches:
  - main
```

例如源码主要推送到 `dev`，就改成：

```yaml
branches:
  - dev
```

推送后，可以在仓库顶部的 `Actions` 标签里查看部署过程。绿色对号表示执行成功，红色叉号表示部署失败，需要点进去查看报错日志。

## 八、第五步：访问网站

部署成功后，访问地址通常是：

```text
https://<用户名>.github.io/<仓库名>/#/
```

如果仓库名是 `HaonanKnowledgeBlog`，访问地址类似：

```text
https://<用户名>.github.io/HaonanKnowledgeBlog/#/
```

这里的 `#/` 来自 Hash 路由模式。

如果没有使用前端路由，也可能直接访问：

```text
https://<用户名>.github.io/<仓库名>/
```

## 九、部署后怎么验证

部署完成后建议按下面顺序检查：

1. 首页能正常打开，不是空白页。
2. 浏览器控制台没有大量 `404` 资源错误。
3. 样式能正常加载。
4. 图片能正常显示。
5. 刷新页面不会进入 GitHub Pages 的 `404` 页面。
6. 子路由能访问，例如 `#/dashboard`。
7. 重新推送代码后，GitHub Pages 页面确实更新了。

如果页面没有更新，可以先尝试强制刷新：

```text
Ctrl + F5
```

也可以打开无痕窗口重新访问，排除浏览器缓存影响。

## 十、常见问题排查

### 1. 页面空白

最常见原因是 `base` 配置错误。

检查 `vite.config.js`：

```js
base: '/仓库名/'
```

再打开浏览器控制台，看是否有类似下面的错误：

```text
Failed to load resource: the server responded with a status of 404
```

如果 `assets/*.js` 或 `assets/*.css` 加载失败，优先检查 `base`。

### 2. 刷新页面 404

最常见原因是使用了 `createWebHistory()`。

解决方法：

```js
import { createWebHashHistory } from 'vue-router'

const router = createRouter({
  history: createWebHashHistory(),
  routes
})
```

然后重新打包并部署。

### 3. 图片加载失败

可能原因有三个：

1. 图片路径大小写不一致。
2. 使用了错误的绝对路径。
3. 图片没有被正确放到 `public/` 或被项目引用。

建议：

1. 放在 `public/` 下的资源，用相对于 `base` 的路径访问。
2. 放在 `src/assets/` 下的资源，通过 `import` 或模板引用让 Vite 参与打包。
3. 文件名大小写保持一致，GitHub Pages 对大小写更敏感。

### 4. 部署后看不到更新

可能是缓存、Actions 还没跑完，或者 Pages 仍在发布旧版本。

可以这样排查：

1. 到 `Actions` 标签确认最新 workflow 是否成功。
2. 到 `Settings -> Pages` 查看当前发布地址和部署状态。
3. 强制刷新浏览器。
4. 等待 1 到 3 分钟后重新访问。

### 5. GitHub Actions 失败

常见原因：

1. `npm ci` 失败，通常是 `package-lock.json` 和 `package.json` 不一致。
2. `npm run build` 本地也会失败。
3. 仓库 Pages 来源没有切换到 `GitHub Actions`。
4. workflow 监听的分支名写错。

建议先在本地执行：

```bash
npm ci
npm run build
```

如果本地都失败，先修本地构建问题，再重新推送。

## 十一、完整部署流程回顾

可以把 GitHub Pages 部署 Vue 项目理解成这条链路：

1. 本地项目能正常运行。
2. `vite.config.js` 配置正确的 `base`。
3. Vue Router 使用 `createWebHashHistory()`。
4. 执行 `npm run build` 生成 `dist/`。
5. 选择手动部署或 GitHub Actions 自动部署。
6. 在 GitHub Pages 中确认部署来源。
7. 打开线上地址验证页面、路由、样式、图片是否正常。

## 十二、更新项目时怎么做

如果使用手动部署：

1. 修改源码。
2. 重新执行 `npm run build`。
3. 把新的 `dist/` 内容推送到部署分支。

如果使用 GitHub Actions：

1. 修改源码。
2. 提交并推送到 workflow 监听的分支。
3. 等待 Actions 自动构建和发布。

长期维护项目时，更推荐使用 GitHub Actions。这样源码分支只负责写代码，部署流程交给自动化脚本，出错时也能在 Actions 日志中快速定位。

## 十三、这一系列后面还可以继续写什么

既然当前博客先放在 GitHub Pages 上，后面这个专题可以继续往下扩展：

1. GitHub Pages 绑定自定义域名
2. DNS 基础与域名解析
3. HTTPS 与证书
4. 云服务器基础入门
5. Nginx 静态站点部署
6. 前后端分离项目上线流程
7. 自动化发布与版本回滚

这样整个专题会从“先把博客发上去”逐步走到“把网站真正上线并长期维护”。

## 十四、最终目标

完成以上配置后，Vue 博客就可以通过 GitHub Pages 在线访问，并且具备这些能力：

1. 首页能正常打开。
2. 刷新页面不会 404。
3. 子路由可以通过 `#/xxx` 访问。
4. 样式、脚本、图片资源都能正常加载。
5. 后续更新可以通过重新构建或 GitHub Actions 自动发布。

一句话总结：

`base` 解决资源路径问题，`Hash 路由` 解决刷新 404 问题，`dist` 或 `GitHub Actions` 负责把静态资源发布到 GitHub Pages。
