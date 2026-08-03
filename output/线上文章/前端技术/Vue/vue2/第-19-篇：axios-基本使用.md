---
title: "第 19 篇：axios 基本使用"
slug: "vue-vue2-vue-axios-9ddbedd5"
summary: "axios 独立笔记，整理 axios 安装、请求方式、json-server、拦截器和常见封装。"
category: "vue2"
categoryPath:
  - "前端技术"
  - "Vue"
  - "vue2"
tags: []
status: "published"
sortOrder: 190
cover: ""
originalId: "6a2d291e8a2b1c68f2cac2a0"
originalSlug: "vue-vue2-vue-axios-9ddbedd5"
originalStatus: "published"
publishedAt: "2026-03-27T13:27:16.752Z"
updatedAt: "2026-07-31T11:16:23.982Z"
exportedAt: "2026-08-03T03:03:53.296Z"
---
# 第 19 篇：axios 基本使用

# 1、axios的基本使用
## 1.1、简介
说到axios我们就不得不说下Ajax。在旧浏览器页面在向服务器请求数据时，因为返回的是整个页面的数据，页面都会强制刷新一下，这对于用户来讲并不是很友好。并且我们只是需要修改页面的部分数据，但是从服务器端发送的却是整个页面的数据，十分消耗网络资源。而我们只是需要修改页面的部分数据，也希望不刷新页面，因此异步网络请求就应运而生。

Ajax(Asynchronous JavaScript and XML)：

异步网络请求。Ajax能够让页面无刷新的请求数据。

实现ajax的方式有多种，如**jQuery**封装的ajax，原生的**XMLHttpRequest**，以及**axios**。但各种方式都有利弊：

+ 原生的XMLHttpRequest的配置和调用方式都很繁琐，实现异步请求十分麻烦
+ jQuery的ajax相对于原生的ajax是非常好用的，但是没有必要因为要用ajax异步网络请求而引用jQuery框架
+ Axios（ajax i/o system）：

这不是一种新技术，本质上还是对原生XMLHttpRequest的封装，可用于浏览器和nodejs的HTTP客户端，只不过它是基于Promise的，符合最新的ES规范。

**axios具备以下特点：**

在浏览器中创建XMLHttpRequest请求

在node.js中发送http请求

支持Promise API

拦截请求和响应

转换请求和响应数据

取消要求

自动转换JSON数据

## 1.2、安装
### 1.2.1、<font style="color:rgb(180, 180, 180) !important;">通过cdn引入</font>
```typescript
<script src="https://unpkg.com/axios/dist/axios.min.js"></script>
```

## 1.3、基本使用
### 1.3.1、准备服务器
模拟服务器，这里使用json-server

#### <font style="color:rgb(38, 38, 38);">（1）安装json-server</font>
```typescript
npm install -g json-server
```

#### （2）创建数据源
在空文件夹下创建JSON文件作为数据源，例如 `<font style="background-color:rgb(249, 242, 244);">db.json</font>`

```typescript
{
  "list": [
    {
      "id": "1",
      "name": "唐僧",
      "age": 20,
      "address": "东土大唐"
    },
    {
      "id": "2",
      "name": "孙悟空",
      "age": 500,
      "address": "花果山"
    },
    {
      "id": "3",
      "name": "猪八戒",
      "age": 330,
      "address": "高老庄"
    },
    {
      "id": "4",
      "name": "沙悟净",
      "age": 200,
      "address": "流沙河"
    },
    {
      "id": "5",
      "name": "红孩儿",
      "age": 10,
      "address": "火焰山"
    }
  ]
}
```

#### （3）启动服务器
<font style="color:rgba(0, 0, 0, 0.75);">使用以下命令启动json-server，并将JSON文件作为参数传递给服务器。这将在本地计算机的</font>`<font style="color:rgb(199, 37, 78);background-color:rgb(249, 242, 244);">3000端口</font>`<font style="color:rgba(0, 0, 0, 0.75);">上启动服务器，并将db.json文件中的数据暴露为RESTful API。</font>

<font style="color:rgba(0, 0, 0, 0.75);">方式一、//db.json是文件名</font>

```json
json-server  db.json 
```

方式二、

```json
json-server --watch db.json  
```

方式三、

跟db.json同级目录，创建package.json文件，配置别名

```json
{
    "scripts":{
        "mock":"json-server --watch db.json"
    }
}
```

启动方式：npm run mock

### 1.3.2、各种请求方式
#### <font style="color:rgb(180, 180, 180) !important;background-color:rgb(36, 36, 41) !important;">1.3.2.1、get请求</font>
<font style="color:rgb(180, 180, 180) !important;background-color:rgb(36, 36, 41) !important;">获取数据，请求指定的信息，返回实体对象</font>

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>Document</title>
    <script src="../js/axios.js"></script>
    <!-- <script src="https://unpkg.com/axios/dist/axios.min.js"></script> -->
    <style>
      #warp {
        width: 400px;
        margin: 50px auto;
      }
      .showUser {
        width: 400px;
        margin: 10px auto;
        height: 260px;
        border: 1px solid red;
      }
      li {
        line-height: 2;
        background-color: pink;
        margin: 10px;
      }
    </style>
  </head>
  <body>
    <div id="warp">
      <button onclick="getInfo()">get请求</button>
      <ul class="showUser"></ul>
    </div>
    <script>
      // get请求
      async function getInfo() {
        // 请求结果处理方法一：
        // axios.get("http://localhost:3000/list").then(
        //   (res) => {
        //     // 将请求到的结果进行渲染
        //     render(res.data);
        //   },
        //   (err) => {
        //     console.log(err);
        //   }
        // );
        // 请求结果处理方法二：
        // axios
        //   .get("http://localhost:3000/list")
        //   .then((res) => {
        //     // 将请求到的结果进行渲染
        //     render(res.data);
        //   })
        //   .catch((err) => {
        //     console.log(err);
        //   });
        // 请求结果处理方法三：推荐使用第三种
        try {
          let res = await axios.get("http://localhost:3000/list");
          render(res.data);
        } catch (error) {
          console.log(err);
        }
      }
      // 渲染函数
      function render(data) {
        let showUser = document.querySelector(".showUser");
        let str = "";
        data.forEach((item) => {
          str += `<li>${item.name}<a href='#'>删除</a></li>`;
        });
        showUser.innerHTML = str;
      }
    </script>
  </body>
</html>
```

此外get请求，还可以携带参数

```html
// get请求带参数方式一
// try {
//   let res = await axios.get("http://localhost:3000/list?id=1");
//   render(res.data);
// } catch (error) {
//   console.log(err);
// }
// get请求带参数方式二
try {
  let res = await axios.get("http://localhost:3000/list", {
    params: {
      id: 2,
    },
  });
  render(res.data);
} catch (error) {
  console.log(err);
}
```

#### <font style="color:rgb(180, 180, 180) !important;background-color:rgb(36, 36, 41) !important;">1.3.2.2、post请求：</font>
<font style="color:rgb(180, 180, 180) !important;background-color:rgb(36, 36, 41) !important;">向指定资源提交数据（例如表单提交或文件上传）</font>

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>Document</title>
    <script src="../js/axios.js"></script>
    <style>
      #warp {
        width: 400px;
        margin: 50px auto;
      }
      .showUser {
        width: 400px;
        margin: 10px auto;
        height: 260px;
        border: 1px solid red;
      }
      li {
        line-height: 2;
        background-color: pink;
        margin: 10px;
      }
    </style>
  </head>
  <body>
    <div id="warp">
      <button onclick="postInfo()">post请求</button>
      <ul class="showUser"></ul>
    </div>
    <script>
      // post请求
      async function postInfo() {
        await axios.post("http://localhost:3000/list", 
        {
          name: "蜘蛛精",
          age: 200,
          address: "盘丝洞",
        });
        // 重新获取数据，渲染
        let res = await axios.get("http://localhost:3000/list");
        render(res.data);
        // console.log(res.data);
      }
      // 渲染函数
      function render(data) {
        let showUser = document.querySelector(".showUser");
        let str = "";
        data.forEach((item) => {
          str += `<li>${item.name}<a href='#'>删除</a></li>`;
        });
        showUser.innerHTML = str;
      }
    </script>
  </body>
</html>
```

#### <font style="color:rgb(180, 180, 180) !important;background-color:rgb(36, 36, 41) !important;">1.3.2.3、put请求：</font>
<font style="color:rgb(180, 180, 180) !important;background-color:rgb(36, 36, 41) !important;">更新数据，从客户端向服务器传送的数据取代指定的文档的内容</font>

<font style="color:rgb(180, 180, 180) !important;background-color:rgb(36, 36, 41) !important;">会把更新的数据完全替代原数据，如果只修改了部分的数据，原数据其他内容都会丢失</font>

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>Document</title>
    <script src="../js/axios.js"></script>
    <style>
      #warp {
        width: 400px;
        margin: 50px auto;
      }
      .showUser {
        width: 400px;
        margin: 10px auto;
        height: 260px;
        border: 1px solid red;
      }
      li {
        line-height: 2;
        background-color: pink;
        margin: 10px;
      }
    </style>
  </head>
  <body>
    <div id="warp">
      <button onclick="putInfo()">put请求-修改数据</button>
      <ul class="showUser"></ul>
    </div>
    <script>
      // put请求
      async function putInfo() {
        let res = await axios.put("http://localhost:3000/list/1", {
          name: "玉皇大帝",
        });
        // 渲染
        getData()
      }
      // 重新获取数据，渲染
      async function getData() {
        let res = await axios.get("http://localhost:3000/list");
        render(res.data);
      }
      // 渲染函数
      function render(data) {
        let showUser = document.querySelector(".showUser");
        let str = "";
        data.forEach((item) => {
          str += `<li>${item.name}<a href='#'>删除</a></li>`;
        });
        showUser.innerHTML = str;
      }
    </script>
  </body>
</html>
```

#### <font style="color:rgb(180, 180, 180) !important;background-color:rgb(36, 36, 41) !important;">1.3.2.4、patch请求：</font>
<font style="color:rgb(180, 180, 180) !important;background-color:rgb(36, 36, 41) !important;">更新数据，是对put方法的补充，用来对已知资源进行局部更新</font>

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>Document</title>
    <script src="../js/axios.js"></script>
    <style>
      #warp {
        width: 400px;
        margin: 50px auto;
      }
      .showUser {
        width: 400px;
        margin: 10px auto;
        height: 260px;
        border: 1px solid red;
      }
      li {
        line-height: 2;
        background-color: pink;
        margin: 10px;
      }
    </style>
  </head>
  <body>
    <div id="warp">
      <button onclick="patchInfo()">patch请求-修改数据</button>
      <ul class="showUser"></ul>
    </div>
    <script>
      // patch请求
      async function patchInfo() {
        let res = await axios.patch("http://localhost:3000/list/2", {
          name: "王母娘娘",
        });
        // 渲染
        getData();
      }
      // 重新获取数据，渲染
      async function getData() {
        let res = await axios.get("http://localhost:3000/list");
        render(res.data);
      }
      // 渲染函数
      function render(data) {
        let showUser = document.querySelector(".showUser");
        let str = "";
        data.forEach((item) => {
          str += `<li>${item.name}<a href='#'>删除</a></li>`;
        });
        showUser.innerHTML = str;
      }
    </script>
  </body>
</html>
```

#### <font style="color:rgb(180, 180, 180) !important;background-color:rgb(36, 36, 41) !important;">1.3.2.5、delete请求：</font>
<font style="color:rgb(180, 180, 180) !important;background-color:rgb(36, 36, 41) !important;">请求服务器删除指定的数据</font>

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>Document</title>
    <script src="../js/axios.js"></script>
    <style>
      #warp {
        width: 400px;
        margin: 50px auto;
      }
      .showUser {
        width: 400px;
        margin: 10px auto;
        height: 260px;
        border: 1px solid red;
      }
      li {
        line-height: 2;
        background-color: pink;
        margin: 10px;
      }
    </style>
  </head>
  <body>
    <div id="warp">
      <button onclick="deleteInfo()">delet请求-修改数据</button>
      <ul class="showUser"></ul>
    </div>
    <script>
      // delete请求
      async function deleteInfo() {
        let res = await axios.delete("http://localhost:3000/list/1");
        // 渲染
        getData();
      }
      // 重新获取数据，渲染
      async function getData() {
        let res = await axios.get("http://localhost:3000/list");
        render(res.data);
      }
      // 渲染函数
      function render(data) {
        let showUser = document.querySelector(".showUser");
        let str = "";
        data.forEach((item) => {
          str += `<li>${item.name}<a href='#'>删除</a></li>`;
        });
        showUser.innerHTML = str;
      }
    </script>
  </body>
</html>
```

<font style="color:rgb(180, 180, 180) !important;"></font>

### 1.3.3、axios的配置
配置的优先级为：<font style="color:#DF2A3F;">请求配置 > 实例配置 > 全局配置</font>

#### 1.3.3.1、全局配置
```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>Document</title>
    <script src="../js/axios.js"></script>
  </head>
  <body>
    <button id="btn" onclick="getData()">发送请求</button>
    <script>
      //配置全局的超时时长
      axios.defaults.timeout = 2000;
      //配置全局的基本URL
      axios.defaults.baseURL = "http://localhost:3000";
      async function getData() {
        try {
          let res1 = await axios.get("/list");
          let res2 = await axios.get("/user");
          console.log(res1.data);
          console.log(res2.data);
        } catch (error) {
          console.log(error);
        }
      }
    </script>
  </body>
</html>
```

#### 1.3.3.2、实例配置
在一个项目中，我们会有很多不同的请求，如果都用axios去请求，很容易造成冲突，所以我们可以去创建axios的实例，通过不同的实例去请求，配置

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>Document</title>
    <script src="../js/axios.js"></script>
  </head>
  <body>
    <button id="btn" onclick="getData()">发送请求</button>
    <script>
      async function getData() {
        // 创建实例1，创建同时配置
        let instance = axios.create({
          baseURL: "http://localhost:3000",
          timeout: 2000,
        });

        let res = await instance.get("/list");
        console.log(res.data);

        // 创建实例2，现创建，再配置
        let instance2 = axios.create();
        instance2.defaults.timeout = 2;
        instance2.defaults.baseURL = "http://localhost:3000";

        let res2 = await instance.get("/user");
        console.log(res2.data);
      }
    </script>
  </body>
</html>

```

 axios实例常用配置：

    - baseURL 请求的域名，基本地址，类型：String
    - timeout 请求超时时长，单位ms，类型：Number
    - url 请求路径，类型：String
    - method 请求方法，类型：String
    - headers 设置请求头，类型：Object
    - params 请求参数，将参数拼接在URL上，类型：Object
    - data 请求参数，将参数放到请求体中，类型：Object

#### 1.3.3.3、请求配置
```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>Document</title>
    <script src="../js/axios.js"></script>
  </head>
  <body>
    <button id="btn" onclick="getData()">发送请求</button>
    <script>
      async function getData() {
        let res = await axios.get("http://localhost:3000/list", {
          timeout: 2000,
        });
        console.log(res.data);
      }
    </script>
  </body>
</html>
```

### 1.3.4、axios的拦截器
axios给我们提供了两大类拦截器

请求方向的拦截（成功请求，失败请求）

响应方向的拦截（成功的，失败的）

拦截器的作用，用于我们在网络请求的时候，在发起请求或者响应时对操作进行处理

例如：发送请求时，可以添加网页加载的动画，或认证token，强制用户先登录再请求数据

响应的时候，可以结束网页加载的动画，或者对响应的数据进行处理



#### 1.3.4.1、请求拦截器
```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>Document</title>
    <script src="../js/axios.js"></script>
  </head>
  <body>
    <button id="btn" onclick="getData()">发送请求</button>
    <script>
      // 请求拦截器
      async function getData() {
        axios.interceptors.request.use(
          (config) => {
            // 发生请求前的一系列的处理
            console.log("开启加载动画");
            console.log("认证是否有token，如果没有，要去登录");
            return config; //拦截后的放行
          },
          (err) => {
            // 请求错误处理
            return Promise.reject(err);
          }
        );
        let res = await axios.get("http://localhost:3000/list");
        console.log(res.data);
      }
    </script>
  </body>
</html>
```

#### 1.3.4.2、相应拦截器
```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>Document</title>
    <script src="../js/axios.js"></script>
  </head>
  <body>
    <button id="btn" onclick="getData()">发送请求</button>
    <script>
      // 响应拦截器
      async function getData() {
        axios.interceptors.response.use(
          (config) => {
            // 数据回来前的一系列的处理
            console.log("关闭加载动画");
            console.log("对数据进行一些数据");
            return config.data; //拦截后的放行
          },
          (err) => {
            // 响应错误处理
            return Promise.reject(err);
          }
        );
        let res = await axios.get("http://localhost:3000/list");
        console.log(res.data);
      }
    </script>
  </body>
</html>
```

#### 1.3.4.3、取消拦截
```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>Document</title>
    <script src="../js/axios.js"></script>
  </head>
  <body>
    <button id="btn" onclick="getData()">发送请求</button>
    <script>
      // 请求拦截器
      async function getData() {
        let instance = axios.create();
        instance.interceptors.request.use(
          (config) => {
            // 发生请求前的一系列的处理
            console.log("开启加载动画");
            console.log("认证是否有token，如果没有，要去登录");
            return config; //拦截后的放行
          },
          (err) => {
            // 请求错误处理
            return Promise.reject(err);
          }
        );

        // 取消拦截
        axios.interceptors.request.eject(instance);

        let res = await axios.get("http://localhost:3000/list");
        console.log(res.data);
      }
    </script>
  </body>
</html>
```

# 2、Vue中axios的使用
## 2.1、基本使用
### 2.1.1<font style="color:rgb(180, 180, 180) !important;">、npm安装</font>
终端安装：

```typescript
 npm install axios
```

### 2.1.2、在Vue原型上配置$axios
在vue项目的main.js文件中引入axios

```typescript
// 导入axios
import axios from 'axios'
// 将axios放到Vue原型上，这样vm，vc身上就都有axios了
Vue.prototype.$axios=axios


```

### 2.1.3、在组件中使用：
```typescript
<button @click="getDate">点击发送请求</button>

<script>
export default {
  name: 'App',
  methods: {
    async getDate() {
      let res = await this.$axios.get('http://localhost:3000/list')
      console.log(res.data);
    }
  }
}
</script>
```

## 2.2、一次封装
如果是多个组件都需要发送请求，而且每次请求前，我们都要进行一些验证处理等，可以进行简单封装

### 2.2.1、封装<font style="color:rgb(254, 44, 36);">request.js</font>
<font style="color:rgb(77, 77, 77);">src/utils创建</font><font style="color:rgb(254, 44, 36);">request.js</font>

```javascript
/* 封装axios用于发送请求 */
import axios from "axios";

/*
(1)request 相当于 Axios 的实例对象
(2)为什么要有request,而不是直接用axios
  * 项目开发中，有可能会有两个基地址
  * 不同的接口配置不同（有的要token,有的不要token）
  用axios会让请求都一样，所以创个分身，给请求私人订制
*/
const request = axios.create({
  baseURL: "http://localhost:3000", // 设置基地址
  timeout: 2000, // 请求超时：当2s没有响应就会结束请求
});

// 添加请求拦截器，一下内容是axios的拦截器，可以不用写
request.interceptors.request.use(
  function (config) {
    // 发请求前做的一些处理，数据转化，配置请求头，设置token,设置loading等，根据需求去添加
    // 例如1
    config.data = JSON.stringify(config.data); // 数据转化,也可以使用qs转换
    // 例如2
    config.headers = {
      "Content-Type": "application/x-www-form-urlencoded", // 配置请求头
    };
    // 例如3
    //注意使用token的时候需要引入cookie方法或者用本地localStorage等方法，推荐js-cookie
    const token = getCookie("名称"); // 这里取token之前，你肯定需要先拿到token,存一下
    if (token) {
      config.params = { token: token }; // 如果要求携带在参数中
      config.headers.token = token; // 如果要求携带在请求头中
    }
    
     return config; //拦截后的放行
  }, 
  function (error) {
    // 对请求错误做些什么
    return Promise.reject(error);
  }
);

// 添加响应拦截器
request.interceptors.response.use(
  function (response) {
    // 对响应数据做点什么
    console.log('关闭请求数据动画');
    console.log('对数据进行处理');
    return response.data; //只要响应对象中的数据
  },
  function (error) {
    // 对响应错误做点什么
    return Promise.reject(error);
  }
);

export default request;

```

**<font style="color:rgb(254, 44, 36);">第一次封装，引入了基地址与拦截器</font>**

### 2.2.2、组件中使用
```vue
<script>
import request from '../utils/request'
export default {
    name: 'ShowList',
    methods: {
        async getList() {
            // 基本路径已经配置过
            let res = await request.get('/list')
            //这里的res也是响应拦截器里处理之后的结果
            console.log(res);
        }
    }
}
</script>
```

```vue
<script>
import request from '@/utils/request';
export default {
    name: 'ShowUser',
    methods: {
        async getUser() {
            let res = await request.get('/user')
            console.log(res);
        }
    }

}
</script>
```

## 2.3、二次封装
项目当中会有很多的页面，**<font style="color:#DF2A3F;">如果每个页面中都会多次请求，将我们的请求都写在对应的页面中，比较难以维护，所以可以将请求再次进行封装</font>**，类似如下效果：

<!-- 这是一张图片，ocr 内容为：SRC 二次封装,将各个页面的请求进行提炼,--对应 APIS TEMPLATE JS SHOWLIST.JS 8 JS SHOWUSER.JS 9 <SCRIPT> ASSETS { GETLISTINFO2, GETU IMPORT 10 COMPONENTS DEFAULT 11 EXPORT Y SHOWLIST.VUE 'SHOWUSER' 12 NAME: SHOWUSER.VUE METHODS:{ 13 UTILS 一次封装,配置路径,拦截器等  ASYNC GETUSER2() { JS REQUEST.JS APP.VUE LET RES 三 AWAIT 15 -->
![](https://cdn.nlark.com/yuque/0/2024/png/27167233/1729781509983-dafa9784-fb4b-47e1-8016-02fe9294433e.png)

**src/apis/showList.js**

```javascript
// 导入一次封装的request
import request from "@/utils/request";
// 请求list数据
export function getListInfo1() {
  return request.get("/list");
}
// 请求user数据
export function getUserInfo1() {
  return request.get("/user");
}
```

**showList.vue**

```vue
<script>
import { getListInfo1, getUserInfo1 } from '../apis/showList'
export default {
    name: 'ShowList',
    methods: {
        async getList1() { 
          //	调用请求函数
            let res = await getListInfo1()
            console.log(res);
        },
        async getUser1() {
            let res = await getUserInfo1()
            console.log(res);
        }
    }
}
</script>
```

# 3、axios小案例
## 3.1、表格的添加
## 3.2、天气案例
