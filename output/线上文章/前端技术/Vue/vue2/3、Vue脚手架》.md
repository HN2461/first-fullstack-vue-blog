---
title: ".3、Vue脚手架》"
slug: "vue-vue2-3-vue-25c1aa35"
summary: ""
category: "vue2"
tags: []
status: "draft"
sortOrder: 80
cover: ""
originalId: "6a2d291e8a2b1c68f2cac2c6"
originalSlug: "vue-vue2-3-vue-25c1aa35"
originalStatus: "published"
exportedAt: "2026-07-30T14:08:39.359Z"
---
# 3.3 Vue脚手架
## 3.3.1 确保npm能用（安装Node.js）
Node.js的下载地址: [https://nodejs.org/zh-cn/download/](https://nodejs.org/zh-cn/download/)

直接下一步下一步安装就行。

安装结束后，打开终端，输入`npm`命令，注意配置环境变量。

---

## 3.3.2 Vue CLI（脚手架安装）
### 1. Vue的脚手架简介
Vue的脚手架（Vue CLI: Command Line Interface）是Vue官方提供的标准化开发平台。它可以将我们`.vue`的代码进行编译生成`html`、`css`、`js`代码，并且可以将这些代码自动发布到它自带的服务器上，为我们Vue的开发提供了一条龙服务。脚手架官网地址：[https://cli.vuejs.org/zh](https://cli.vuejs.org/zh)

**注意**：Vue CLI 4.x需要Node.js v8.9及以上版本，推荐v10以上。

### 2. 脚手架安装步骤
#### ① 建议先配置一下npm镜像：（可装可不装）
```bash
# 豆瓣镜像
npm config set registry http://pypi.douban.com/simple/

# 清华镜像
npm config set registry https://pypi.tuna.tsinghua.edu.cn/simple

# 切回原来的npm包
npm config set registry https://registry.npmjs.org
```

终端输入：`npm config get registry`，返回成功对应进行地址，表示设置成功。

#### ② 第一步：安装脚手架（全局方式：表示只需要做一次即可）
```bash
npm install -g @vue/cli
```

安装完成后，重新打开DOS命令窗口，输入`vue --version`命令查看脚手架版本。有版本信息，表示成功。

#### ③ 第二步：创建项目（项目中自带脚手架环境，自带一个HelloWorld案例）
**第一种方式**

1. 切换到要创建项目的目录，然后使用`vue create vue_pro`。  
<!-- 这是一张图片，ocr 内容为： -->
![](https://i-blog.csdnimg.cn/direct/04fa7e40ff85410db2cc8878620531a4.png)
2. 这里选择Vue2。
    - `babel`：负责ES6语法转换成ES5。
    - `eslint`：负责语法检查的。
3. 回车之后，就开始创建项目，创建脚手架环境（内置了webpack loader），自动生成HelloWorld案例。  
<!-- 这是一张图片，ocr 内容为： -->
![](https://i-blog.csdnimg.cn/direct/b4d44556ddb245598ea4d02f6bfc3503.png)

**第三步：编译Vue程序，自动将生成html css js放入内置服务器，自动启动服务**

1. 在DOS命令窗口中切换到项目根目录：`cd vue_pro`。
2. 执行：`npm run serve`，这一步会编译HelloWorld案例。<!-- 这是一张图片，ocr 内容为： -->
![](https://i-blog.csdnimg.cn/direct/52ccf4197be143f8beddc1406fbfc237.png)
3. `Ctrl + C`停止服务。
4. 打开浏览器，访问：[http://localhost:8080](http://localhost:8080)。

**第二种方式**

在终端输入`vue ui`运行之后跳转到[http://localhost:8000/dashboard](http://localhost:8000/dashboard)。  
<!-- 这是一张图片，ocr 内容为： -->
![](https://i-blog.csdnimg.cn/direct/9dd5fe6ecf374369b0372a5328137d3f.png)  
<!-- 这是一张图片，ocr 内容为： -->
![](https://i-blog.csdnimg.cn/direct/066da615147b4bc1a827e162b729af29.png)

点击左上角`wordvue`选择Vue项目管理器，打开之后可以创建项目也可以打开之前已有的项目。  
<!-- 这是一张图片，ocr 内容为： -->
![](https://i-blog.csdnimg.cn/direct/d050bf0dd36f4225b51cd17d4e4f7bb1.png)

选择创建项目，然后选择项目所在的目录，这次依旧放在桌面上。  
<!-- 这是一张图片，ocr 内容为： -->
![](https://i-blog.csdnimg.cn/direct/eefe36a59f9e40f28e2560ca1d688f55.png)

填写项目名称，包管理一般选默认，git仓库看个人需求。  
<!-- 这是一张图片，ocr 内容为： -->
![](https://i-blog.csdnimg.cn/direct/8b8656938a3e4727a2e8c9b623a56960.png)

预设就是手动选择配置项，和第一种方法一样。  
<!-- 这是一张图片，ocr 内容为： -->
![](https://i-blog.csdnimg.cn/direct/4514b2742bfa4ce5876c00ddcd5cca90.png)  
<!-- 这是一张图片，ocr 内容为： -->
![](https://i-blog.csdnimg.cn/direct/8f6ae88618ac4aa0a2e582b5bfb0c5c9.png)

配置也是一样的。  
<!-- 这是一张图片，ocr 内容为： -->
![](https://i-blog.csdnimg.cn/direct/d3e106f8f69b4385a4bc5a8de6cc1762.png)

创建成功之后，会自动进入app项目。<!-- 这是一张图片，ocr 内容为： -->
![](https://i-blog.csdnimg.cn/direct/f4513d6558894a85ade5235e7758a3e6.png)



安装依赖（用`vue ui`安装依赖非常简单，直接搜索然后安装）。  
<!-- 这是一张图片，ocr 内容为： -->
![](https://i-blog.csdnimg.cn/direct/b874ca80a3f846f7a172aff076146ccd.png)

---

## 3.3.3 认识脚手架结构
使用VSCode将vue项目打开：  
<!-- 这是一张图片，ocr 内容为： -->
![](https://i-blog.csdnimg.cn/direct/2c688c02b3504c24a6fb172588cba674.png)

+ `package.json`：包的说明书（包的名字，包的版本，依赖哪些库）。该文件里有webpack的短命令：
    - `serve`（启动内置服务器）
    - `build`命令是最后一次的编译，生成`html`、`css`、`js`，给后端人员
    - `lint`做语法检查的。

---

## 3.3.4 分析HelloWorld程序
### 1. index.html
```html
<!DOCTYPE html>
<html lang="">
  <head>
    <meta charset="utf-8" />
    <!-- 让IE浏览器启用最高渲染标准。IE8是不支持Vue的。 -->
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <!-- 开启移动端虚拟窗口（理想视口） -->
    <meta name="viewport" content="width=device-width,initial-scale=1.0" />
    <!-- 设置页签图标 -->
    <link rel="icon" href="<%= BASE_URL %>favicon.ico" />
    <!-- 设置标题 -->
    <title>欢迎使用本系统</title>
  </head>
  <body>
    <!-- 当浏览器不支持JS语言的时候，显示如下的提示信息。 -->
    <noscript>
      <strong>We're sorry but <%= htmlWebpackPlugin.options.title %> doesn't work properly without JavaScript enabled. Please enable it to continue.</strong>
    </noscript>
    <!-- 容器 -->
    <div id="app"></div>
    <!-- built files will be auto injected -->
  </body>
</html>

```

在`index.html`文件中：

+ 没有看到引入`vue.js`文件。
+ 也没有看到引入`main.js`文件。Vue脚手架会自动找到`main.js`文件。不需要你手动引入。
+ 所以`main.js`文件的名字不要随便修改，`main.js`文件的位置不要随便动。

### 2. main.js
```javascript
// 等同于引入vue.js
import Vue from 'vue'

// 导入根组件
import App from './App.vue'

// 关闭生产提示信息
Vue.config.productionTip = false

// 创建Vue实例
new Vue({
  render: h => h(App),
}).$mount('#app')
```

### 3. ES语法检测
如果用单字母表示组件的名字，会报错，名字应该由多单词组成。

解决这个问题有两种方案：

1. 把所有组件的名字修改一下。
2. 在`vue.config.js`文件中进行脚手架的默认配置。配置如下：

```javascript
const { defineConfig } = require('@vue/cli-service')
module.exports = defineConfig({
  transpileDependencies: true
  // 保存时是否进行语法检查。true表示检查，false表示不检查。默认值是true。
  lintOnSave: false,
  // 配置入口
  pages: {
    index: {
      entry: 'src/main.js',
    }
  },
})
```

---

## 3.3.5 脚手架默认配置
脚手架默认配置在`vue.config.js`文件中进行。

`main.js`、`index.html`等都是可以配置的。

配置项可以参考Vue CLI官网手册，如下：

```javascript
// vue.config.js
const { defineConfig } = require("@vue/cli-service");

module.exports = defineConfig({
  transpileDependencies: true,
  // 保存时是否进行语法检查。true表示检查，false表示不检查。默认值是true。
  lintOnSave: false,
  // 配置入口
  pages: {
    index: {
      entry: "src/main.js",
    },
  },
});
```

---

## 3.3.6 解释main.js中的render函数
将`render`函数更换为`template`配置项，你会发现它是报错的。说明引入的Vue无法进行模板编译。

原因：Vue脚手架默认引入的是精简版的Vue，这个精简版的Vue缺失模板编译器。

实际引入的`vue.js`文件是：`dist/vue.runtime.esm.js`（`esm`版本是ES6模块化版本）。

为什么缺失模板编译器？

Vue包含两部分：一部分是Vue的核心，一部分是模板编译器（模板编译器可能占整个`vue.js`文件的一大部分体积）。程序员最终使用`webpack`进行打包的时候，显然Vue中的模板编译器就没有存在的必要了。为了缩小体积，所以在Vue脚手架中直接引入的就是一个缺失模板编译器的`vue.js`。

这样就会导致`template`无法编译（注意：标签可以正常编译[package.json文件中进行了配置]，说的是`template`配置项无法编译），解决这个问题包括两种方式：

1. 引入一个完整的`vue.js`。
2. 使用`render`函数。

关于`render`函数，完整写法：

```javascript
// 等同于引入vue.js
import Vue from "vue";

// 导入根组件
import App from "./App.vue";

// 关闭生产提示信息
Vue.config.productionTip = false;

// 创建Vue实例
// new Vue({
//   render: (h) => h(App),
// }).$mount("#app");

// 创建Vue实例
new Vue({
  el: "#app",
  // 此时会报错，因为引入的vue.js是缺少版本的
  // 解决方案
  // 1、引入完整的vue.js
  // 2、使用render函数
  template: "<h1>render函数</h1>",
  // render函数会被自动调用，被调用时，会自动传过来一个参数，可以用来创建元素
  // render(createElement) {
  //   return createElement(App);
  // },
  // 简写为箭头函数
  render: (h) => h(App),
});
```

---
