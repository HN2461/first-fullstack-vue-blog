---
title: "第 1 篇：GitHub Pages 部署 Vue 博客完整教程：Vite base、Hash 路由、Actions 自动部署"
slug: "github-pages-vue-f7e9371a"
summary: "Vue 博客部署到 GitHub Pages 的完整流程，覆盖 Vite base 路径、Vue Router Hash 模式、dist 手动部署、GitHub Actions 自动部署与常见问题排查。"
category: "网站部署"
categoryPath:
  - "电脑"
  - "网站部署"
tags:
  - "GitHub Pages"
  - "Vue3"
  - "Vite"
  - "博客部署"
  - "Hash 路由"
status: "published"
sortOrder: 10
cover: ""
originalId: "6a2d291f8a2b1c68f2cac58a"
originalSlug: "github-pages-vue-f7e9371a"
originalStatus: "published"
publishedAt: "2026-04-16T14:22:08.318Z"
updatedAt: "2026-08-16T14:39:48.203Z"
exportedAt: "2026-10-18T11:58:42.583Z"
---

# 第 1 篇：GitHub Pages 部署 Vue 博客完整教程：Vite base、Hash 路由、Actions 自动部署

适合已经能在本地运行 Vue 项目并推送 Git 的读者。最好先用一个练习仓库。按本篇完成后，你会拿到一个可访问的网址，并能验证首页、子页面、图片和后续更新。示例按 **Node.js 24 LTS、npm、Vite、Vue Router 和 GitHub 托管的 Actions runner** 编写。

GitHub Pages 托管 HTML、CSS、JavaScript 和图片等静态产物。Express 和 MongoDB 需要各自在服务器或托管平台运行。带登录或数据接口的博客，先确认前端已经指向可访问、允许该前端来源的 HTTPS API，再测试动态功能。

## 1. 先确认项目目录和发布地址

找出包含 `package.json`、`package-lock.json` 和 Vite 配置的目录。本文用两种常见布局：

| 源码布局 | 本地执行 npm 的位置 | 产物路径（相对仓库根目录） |
| --- | --- | --- |
| Vue 项目在仓库根目录 | 仓库根目录 | `dist/` |
| Vue 项目在独立的 `frontend/` | `frontend/` | `frontend/dist/` |

普通项目站点的地址通常是 `https://用户名.github.io/仓库名/`，Vite 的 `base` 写成 `/仓库名/`。如果仓库名本身就是 `用户名.github.io`，或者 Pages 直接使用一个自定义域名作为站点根路径，`base` 用 `/`；最终以 Pages 显示的实际网址和站点所在路径核对。

## 2. 配好资源路径和路由

在实际的 Vite 配置中增加或调整 `base`，其余插件和配置继续保留。以仓库名 `vue-blog` 为例：

```js
export default defineConfig({
  plugins: [vue()],
  base: '/vue-blog/'
})
```

如果使用 Vue Router，推荐在已有路由表中切换为 Hash 模式。普通 History 模式刷新 `/vue-blog/articles` 时，静态托管需要该路径对应的文件或服务端回退。Hash 模式访问 `/vue-blog/#/articles` 时，浏览器请求的是 `/vue-blog/`，由 Vue Router 处理 `#/articles`。

```js
import { createRouter, createWebHashHistory } from 'vue-router'

const router = createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes
})
```

`src/assets` 下的图片尽量在组件中使用 `import`。如果代码需要拼接 `public/` 下的资源路径，可以使用 `${import.meta.env.BASE_URL}logo.png`。文件名大小写要与实际文件一致。

## 3. 在自己电脑上验收一次

在实际前端目录执行：

```bash
node --version
npm ci
npm run build
npm run preview
```

示例的 Node 版本应显示 `v24.x.x`。首次建立项目而尚无锁文件时，先执行 `npm install` 并提交生成的 `package-lock.json`。预览命令启动后，按终端显示的网址及对应的 `base` 访问。预期能看到构建后的首页，点击一个已有的子页面并刷新后还能显示。验证完按 `Ctrl+C` 停止预览。

## 4. 通过 GitHub Actions 发布

在 GitHub 仓库打开「Settings → Pages」，把「Build and deployment」里的「Source」设为「GitHub Actions」。在**仓库根目录**添加 `.github/workflows/deploy-pages.yml`。下面是前端位于 `frontend/` 的版本。

```yaml
name: Deploy GitHub Pages

on:
  push:
    branches: [main]
  workflow_dispatch:

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
    defaults:
      run:
        working-directory: frontend
    steps:
      - uses: actions/checkout@v7
      - uses: actions/setup-node@v7
        with:
          node-version: '24'
          cache: npm
          cache-dependency-path: frontend/package-lock.json
      - uses: actions/configure-pages@v6
      - run: npm ci
      - run: npm run build
      - uses: actions/upload-pages-artifact@v5
        with:
          path: frontend/dist

  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - name: Deploy
        id: deployment
        uses: actions/deploy-pages@v5
```

如果前端就在仓库根目录，删除 `defaults` 下的工作目录设置，将 `cache-dependency-path` 改为 `package-lock.json`，上传路径改为 `dist`。如果源码分支叫其他名字，把 `branches` 改为实际分支。

提交并推送后，在「Actions」中打开最新运行。先看 `build` 是否完成，再看 `deploy` 是否成功，并从发布步骤或「Settings → Pages」复制正式网址。

## 5. 可选的分支发布

也可以在「Settings → Pages」选择「Deploy from a branch」。GitHub 允许选择指定分支的根目录或 `/docs`。练习时使用只存放产物的 `gh-pages` 分支。在单独的工作目录里操作，确认当前位于部署分支后，把 `dist/` **内部**的 `index.html`、`assets/` 等复制到所选发布目录。如需关闭分支发布的 Jekyll 处理，在发布目录放一个空的 `.nojekyll`。提交前查看文件清单，只更新这次准备好的静态产物。

## 6. 上线验收与排查

1. 打开 Pages 给出的网址，确认首页、样式和一张实际图片能加载。
2. 进入一个实际存在的子路由，再刷新，确认同一页仍可打开。
3. 在源码改一行可见文字并推送，等这次部署成功，再确认线上出现新文字。
4. 如果博客调用独立 API，另外试一次公开列表或测试登录，记录失败请求的状态码。

| 症状 | 先看哪里 |
| --- | --- |
| 首页返回 404 | 确认发布地址、最新部署状态和产物顶层的 `index.html` |
| 首页空白，脚本或样式返回 404 | 核对 `base` 与线上地址中的仓库路径，并查看失败资源的请求地址 |
| 从首页能进子页，刷新后 404 | 确认 URL 是否有 `#/`，并检查路由实际使用的 history 配置 |
| `npm ci` 失败 | 确认工作目录、锁文件路径和本地 Node 版本，再重现相同命令 |
| 发布成功但内容没更新 | 确认运行对应的提交和正式网址，再在无痕窗口排除旧缓存 |
| 首页正常但登录或列表失败 | 打开请求记录，确认 API 地址、HTTPS 和服务端的跨域配置 |

参考：[Vite 静态部署](https://vite.dev/guide/static-deploy.html#github-pages) · [GitHub Pages 发布来源](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site) · [Vue Router 路由模式](https://router.vuejs.org/guide/essentials/history-mode.html) · [Node.js 版本状态](https://nodejs.org/en/about/previous-releases)
