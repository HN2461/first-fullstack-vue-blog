---
title: "Vue与Ajax》"
slug: "vue-vue2-vue-ajax-907a7d1a"
summary: ""
category: "vue2"
tags: []
status: "draft"
sortOrder: 40
cover: ""
originalId: "6a2d291e8a2b1c68f2cac2a4"
originalSlug: "vue-vue2-vue-ajax-907a7d1a"
originalStatus: "published"
exportedAt: "2026-07-31T03:42:38.792Z"
---
## 4.1 发送AJAX异步请求的方式	
发送AJAX异步请求的常见方式包括：

### 4.1.1. 原生方式
使用浏览器内置的JS对象XMLHttpRequest

```vue
const xhr = new XMLHttpRequest()
  xhr.open()
  xhr.send()
  xhr.onreadystatechange = function(){}
```

### 4.1.2. 原生方式
使用浏览器内置的JS函数fetch

```vue
fetch(‘url’, {method : ‘GET’}).then().then() 
  //第一次.then返回的是promise，第二次.then,才可以得到结果
```

### 4.1.3. 第三方库方式
**jQuery**（对XMLHttpRequest进行的封装）

```vue
$.get()
  $.post()
  $.ajax()
  ······
```

**axios **:基于Promise的HTTP库：axios （对XMLHttpRequest进行的封装），<font style="color:rgb(255, 0, 0);">axios是Vue官方推荐使用的</font>。

```vue
axios.get().then()
  axios.post().then()
  axios.put().then()
  axios.patch().then()
  axios.delete().then()
  ·····
```

**vue-resource	**

跟axios一样使用

+ 安装：npm i vue-resource
+ main.js中	import vueResource from ‘vue-resource’
+ main.js中	使用插件：Vue.use(vueResource)
+ 使用该插件之后，项目中所有的vm和vc实例上都添加了：$http属性。
+ 使用办法：

this.$http.get(‘’).then() 用法和axios相同，只不过把axios替换成this.$http

## 4.2 AJAX跨域    
### 1. 什么是跨域访问？
(1) 在a页面中想获取b页面中的资源，如果a页面和b页面所处的协议、域名、端口不同（只要有一个不同），所进行的访问行动都是跨域的。

(2) 哪些跨域行为是允许的？

① 直接在浏览器地址栏上输入地址进行访问

② 超链接

③ <img src=”其它网站的图片是允许的”>

④ <link  href=”其它网站的css文件是允许的”>

⑤ <script src=”其它网站的js文件是允许的”>

⑥ ......

(3) 哪些跨域行为是不允许的？

① AJAX请求是不允许的

② Cookie、localStorage、IndexedDB等存储性内容是不允许的

③ DOM节点是不允许的

### 2. AJAX请求无法跨域访问的原因：同源策略
(1) 同源策略是一种约定，它是**浏览器**最核心也最基本的安全功能，如果缺少了同源策略，浏览器很容易受到XSS、CSRF等攻击。同源是指"协议+域名+端口"三者相同，即便两个不同的域名指向同一个ip地址，也非同源。

(2) AJAX请求不允许跨域并不是请求发不出去，请求能发出去，服务端能收到请求并正常返回结果，只是结果**被浏览器拦截**了。

### 3. 解决AJAX跨域访问的方案包括哪些
**(1) CORS方案（工作中常用的）**

① 这种方案主要是后端的一种解决方案，<font style="color:rgb(255, 0, 0);">被访问的资源</font>设置响应头，告诉浏览器我这个资源是允许跨域访问的：

response.setHeader("Access-Control-Allow-Origin", "[http://localhost:8080](http://localhost:8080)");

response.setHeader("Access-Control-Allow-Origin", "*");

**(2) jsonp方案（面试常问的）**

① 采用的是<script src=””>不受同源策略的限制来实现的，但只能解决GET请求。

**(3) 代理服务器方案（工作中常用的）**

① Nginx反向代理

② Node中间件代理

③<font style="color:#DF2A3F;"> vue-cli（Vue脚手架自带的8080服务器也可以作为代理服务器，需要通过配置vue.config.js来启用这个代理）</font>

(4) postMesssage

(5) websocket

(6) window.name + iframe

(7) location.hash + iframe

(8) document.domain + iframe

 ......

### 4. 代理服务器方案的实现原理
同源策略是**浏览器**需要遵循的标准，而如果是**服务器向服务器**请求就无需遵循同源策略的。

<!-- 这是一张图片，ocr 内容为：VUE脚手架内置的8080服务器 8000服务器 INDEX.HTML 点我发送AJAX请求 8000服务医内部 的一个小程序 因为有跨域限制,导致响应后浏览器拒绝接收 点我发送AJAX请求 请求响应 响应 8080服务器内部 的一个小程序 请求 -->
![](https://cdn.nlark.com/yuque/0/2024/png/27167233/1726068155642-315fc59b-a054-4419-91ec-54d0ee15e734.png)

## 4.3 代理服务器	
Vue脚手架内置服务器的地址：[http://localhost:8080](http://localhost:8080)

我们可以额外再开启一个其它的服务器，这个服务器随意，例如：**node server**、Apache服务器、JBOSS服务器、WebLogic服务器、WebSphere服务器、jetty服务器、tomcat服务器......我这里选择的是基于express语言的一个服务器，这个web服务器开启了一个8000端口，提供了以下的一个服务：可以帮助我们获取到一个user列表

### 4.3.1、express的基本使用
官网：[https://www.expressjs.com.cn/](https://www.expressjs.com.cn/)

安装：npm init --yes  做一下初始化

<font style="color:rgb(85, 85, 85);">npm install express --save</font>

```vue
//1. 引入express
const express = require('express');

//2. 创建应用对象
const app = express();

//3. 创建路由规则
// request 是对请求报文的封装
// response 是对响应报文的封装
app.get('/', (request, response)=>{
    //设置响应
    response.send('HELLO EXPRESS');
});

//4. 监听端口启动服务 
app.listen(8000, ()=>{
    console.log("服务已经启动, 8000 端口监听中....");
});
```

运行方式一：node 文件名.js

运行方式二：nodemon安装

可以帮助自动重启express后台服务器

:::info
[https://www.npmjs.com/package/nodemon](https://www.npmjs.com/package/nodemon)

npm install -g nodemon

安装完毕，重启severs.js

启动命令

nodemon severs.js

:::

网址：[http://127.0.0.1:8000/](http://127.0.0.1:8000/) 或 [http://localhost:8000/](http://localhost:8000/user)

### 4.3.2、演示跨域问题
1、使用express打开8000服务器，自定义一个user数据

2、安装axios npm i axios 

3、引入axios，并发送ajax请求

```vue
<script>
//引入axios 
import axios from 'axios'
export default {
    name: 'hellowrod',
    data() {
        return {
            msg: '我是helloworld组件！'
        }
    },
    methods: {
        getuser() {
            // 需求：发送AJAX请求，访问：http://localhost:8000/user
            //本地内置服务器 http://localhost:8080/
            axios.get('http://localhost:8000/user').then(
                response =>{
                    console.log('服务器返回的数据：',response.data);
                },
                error=>{
                    console.log('错误信息',error.message);
                }
            )

        }
    }
}
</script>

```

输出结果

<!-- 这是一张图片，ocr 内容为：APP父组件 FILTER TOP 1 2 ISSUES: 1 DEFAULT LEVELS [HMR] WAITING FOR UPDATE LOG-JS:24 HELLOWORLD组件 SIGNAL FROM WDS.. 获取用户列表信息 ACCESS TO XMLHTTPREQUEST LOCALHOST/:1 F ROM AT  HTTP://LOCALHOST:8000/USER ORIGIN'HTTP://LOCALHOST:8080 HAS BEEN BLOCKED BY CORS POLICY: NO 'ACCESS-CONTROL-ALLOW-0RIGIN' HEADER 1S RESOURCE, PRESENT ON THE REQUESTED 错误信息NETWORK HELLOWORLD.VUE:25 ERROR GET HTTP://LOCALHOS XHR.JS:258 X T:8000/USER NET::ERR_FAILED 200 (OK) -->
![](https://cdn.nlark.com/yuque/0/2024/png/27167233/1726119761803-cc35e6f8-8ea4-45ef-8dae-f8282f59f0f2.png)

### 4.4.1、配置vue.config.js文件  <font style="color:rgb(243, 50, 50);">报错问题</font>
注意，这里的vue.config.js可以自己在根目录下创建，跟src同级，如果报错，可能是脚手架版本的问题

如下图报错：<font style="color:rgb(243, 50, 50);">defineConfig is not a function报错</font>

<!-- 这是一张图片，ocr 内容为：INDEX.JS LOGINVUEX ADMINMAPPER.JAVA ADMIN.VUE MAIN.JS ADMINSERVICELMPLJAVA ADD.VUE }REQUIRE(@VUE/CLI-SERVICE') 1 CONST￥DEFINECONFIG 2 MODULE.EXPORTS-DEFINECONFIGG 3 TRANSPILEDEPENDENCIES:TRVE ]) 临时文件和控制台 EXPORTS 运行: LIBRARYSPRINGBOOTAPPLICATION SERVE X VUE@0.1.0 SERVE VUE-CLI-SERVICE SERVE ERROR LOADING D:\JAVA/PROJECTSTUDY\LIBN MANAGEMENT/VUE/VUE. ERROR CONFIG.JS: TYPEERROR:DEFINECONFIG IS NOT A FUN FUNCTION ERROR NOTAFUNCTION TYPEERROR:DEFINECONFIG IS NO 2书签 AVA\PROJECTSTUDY\LIBRARY-MANAGEMENT\VUE\VUE.CONFIG.JS:2:18) (D:\JAVA/P AT 0BJECT.<ANONYMOUS> AT MODULE.-COMPILE (NODE:INTERNAL/MODULES/CJS/LOADER:1165:14) 中 结构 AT OBJECT.MODULE.-EXTENSIONS.. IS (NODE:INTERNAL/MODULES/CIS/LOADER:1219:10) AT MODULE.LOAD (NODE:INTERNAL/MODULES/CJS/LOADER:1043:32) EXPG 运行 I TODO 问题 构建 服务 PROFILER 终端 DEPENDENCIES CSDN@西柚PI -->
![](https://cdn.nlark.com/yuque/0/2024/png/27167233/1726119805477-2d1f40c4-b7ff-4f2a-9df2-6b45370db939.png)

（1）、打开终端cd vue 文件夹

（2）、npm audit fix --force

（3）、npm install

最后重启应该可以解决

### 4.4.2、简单开启 
vue.config.js

```vue
const { defineConfig } = require("@vue/cli-service");
module.exports = defineConfig({
  devServer: {
    // Vue脚手架内置的8080服务器负责代理访问8000服务器
    // 地址写到端口号就可以
    proxy: "http://localhost:8000",
  },
});
```

在vue文件中发送请求时，地址需要修改如下：

```vue
 methods: {
        getuser() {
            // 原理：发送AJXA请求的时候，会优先从自己的服务器当中去找 public/user资源
            // 如果找不到，就会去找代理，然后去http://localhost:8000上去找
            // axios.get('http://localhost:8080/user').then(
            // 当前按钮就在8080服务器上，资源也在8080上，所以http://localhost:8080可以省略
            axios.get('/user').then(
                response => {
                    console.log('服务器返回的数据：', response.data);
                },
                error => {
                    console.log('错误信息', error.message);
                }
            )
        }
    }
```

原理：访问地址是[http://localhost:8080/user](http://localhost:8080/bugs)，会优先去8080服务器上找/user资源，如果没有找到才会走代理。

另外需要注意的是：这种简单配置不支持配置多个代理。

### 4.4.3、高级开启
支持配置多个代理

1、可以再新建一个express2.js，增加一个模拟服务器

2、**vue.config.js**

```vue
const { defineConfig } = require("@vue/cli-service");
module.exports = defineConfig({
  //2、高级开启  可以代理多个服务器
  devServer: {
    proxy: {
      "/api": {
        //凡是请求路径以/api开始的，都走这个代理
        target: "http://localhost:8000",
        pathRewrite: { "^/api": "" }, //路径重新，凡是/api开始的路径，都替换为空串
        ws: true, //开启对websocket的支持（websocket是一种实时推动技术），默认是true
        changeOrigin: true, //默认是true表示改变起源，（让对方服务器不知道我们真正的起源到底是哪里）
      },
      "/abc": {
        target: "http://localhost:8001",
        pathRewrite: { "^/abc": "" },
        ws: true,
        changeOrigin: true,
      },
    },
  },
});
```

**helloword.vue 发送ajax请求**

```vue
 methods: {
        getuser() {
            // 开启多个代理
            axios.get('/api/user').then(
                response => {
                    console.log('服务器返回的数据：', response.data);
                },
                error => {
                    console.log('错误信息', error.message);
                }
            )
        },
        getpassword() {
            // 开启多个代理
            axios.get('/abc/password').then(
                response => {
                    console.log('服务器返回的数据：', response.data);
                },
                error => {
                    console.log('错误信息', error.message);
                }
            )
        },
    }
```



## 4.4、axios的封装
看axios的使用笔记
