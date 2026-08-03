---
title: "第 2 篇：Vue 2 模板语法"
slug: "vue-vue2-1-93bdf6b0"
summary: "Vue 2 模板语法笔记，整理插值语法、表达式使用和模板中的基础数据绑定。"
category: "vue2"
categoryPath:
  - "前端技术"
  - "Vue"
  - "vue2"
tags: []
status: "published"
sortOrder: 20
cover: ""
originalId: "6a2d291e8a2b1c68f2cac2b4"
originalSlug: "vue-vue2-1-93bdf6b0"
originalStatus: "published"
publishedAt: "2026-03-27T13:24:44.696Z"
updatedAt: "2026-07-31T11:16:23.891Z"
exportedAt: "2026-08-03T10:17:08.920Z"
---
# 第 2 篇：Vue 2 模板语法

# 2.1.1 插值语法
## 1. 代码示例
```html
<body>
  <!-- 准备容器 -->
  <div id="app">
    <!-- 在data中声明的 -->
    <!-- 1. data中声明的变量 -->
    <h1>{{msg}}</h1>
    <h1>{{sayHello()}}</h1>
    <!-- 不在data中的变量不可以 -->
    <!-- <h1>{{i}}</h1> -->
    <!-- <h1>{{sum()}}</h1> -->

    <!-- 2. 常量 -->
    <h1>{{100}}</h1>
    <h1>{{'hello vue!'}}</h1>
    <h1>{{3.14}}</h1>
    <!-- 3. JavaScript表达式 -->
    <h1>{{1 + 1}}</h1>
    <h1>{{msg + 1}}</h1>
    <h1>{{'msg' + 1}}</h1>
    <h1>{{gender ? '男' : '女'}}</h1>
    <h1>{{number + 1}}</h1>
    <h1>{{msg.split('').reverse().join('')}}</h1>
    <!-- 错误的：不是表达式，这是语句 -->
    <!-- <h1>{{var i = 100}}</h1> -->

    <!-- 4. 在白名单里面的 -->
    <h1>{{Date}}</h1>
    <h1>{{Date.now()}}</h1>
    <h1>{{Math}}</h1>
    <h1>{{Math.ceil(3.14)}}</h1>
  </div>
  <!-- Vue程序 -->
  <script>
    // 用户自定义的一个全局变量
    var i = 100;

    // 用户自定义的一个全局函数
    function sum() {
      console.log("sum.....");
    }

    new Vue({
      el: "#app",
      data: {
        number: 1,
        gender: true,
        msg: "abcdef", // msg是在data中声明的变量
        sayHello: function () {
          console.log("hello vue!");
        },
      },
    });
  </script>
</body>

```

## 2. 代码总结
`{{}}`中可以写的内容：

+ data中声明的变量、函数、数组等。
+ 常量。
+ 合法的JavaScript表达式（注意：不能是JS语句，如赋值语句、if、for等）。
+ 模板表达式被放在沙盒中，只能访问全局变量的白名单，例如：

```plain
Infinity, undefined, NaN, isFinite, isNaN,
parseFloat, parseInt, decodeURI, decodeURIComponent, encodeURI, encodeURIComponent,
Math, Number, Date, Array, Object, Boolean, String, RegExp, Map, Set, JSON, Intl,
require
```

---

# 2.1.2 指令语法
## 1. 什么是指令？有什么作用？
指令的职责是，当表达式的值改变时，将其产生的连带影响，响应式地作用于DOM。

## 2. Vue框架中的所有指令的名字都以“v-”开始。
## 3. 插值是写在标签体当中的，那么指令写在哪里呢？
Vue框架中所有的指令都是以HTML标签的属性形式存在的，例如：

```html
<span v-指令名="表达式">{{这里是插值语法的位置}}</span>

```

注意：虽然指令是写在标签的属性位置上，但浏览器无法直接理解，需要Vue框架进行编译后，浏览器才能识别。

## 4. 指令的语法规则
完整的语法格式：

```html
<HTML标签 v-指令名:参数="javascript表达式"></HTML标签>

```

JavaScript表达式：

+ 与插值语法中`{{}}`的内容相同，但不需要写`{{}}`。
+ 不是所有指令都有参数和表达式：
    - 有的指令不需要参数和表达式，例如：`v-once`。
    - 有的指令不需要参数，但需要表达式，例如：`v-if="表达式"`。
    - 有的指令既需要参数，又需要表达式，例如：`v-bind:参数="表达式"`。

## 5. v-once 指令
作用：只渲染元素一次。随后的重新渲染，元素及其所有子节点将被视为静态内容并跳过。这可以用于优化更新性能。

## 6. v-if="表达式" 指令
作用：表达式的执行结果需要是一个布尔类型的数据（`true`或`false`）。

+ `true`：指令所在的标签会被渲染到浏览器中。
+ `false`：指令所在的标签不会被渲染到浏览器中。

```html
<body>
  <!-- 准备一个容器 -->
  <div id="app">
    <h1>{{msg}}</h1>
    <!-- 只会渲染一次，msg更改数据，也不会再次渲染 -->
    <h1 v-once>{{msg}}</h1>
    <h1 v-if="a > b">v-if测试：你看我出不出现</h1>
  </div>
  <!-- Vue程序 -->
  <script>
    new Vue({
      el: "#app",
      data: {
        msg: "Hello Vue!",
        a: 10,
        b: 11,
      },
    });
  </script>
</body>

```

---

# 2.1.3 v-bind指令详解
## 1. 这个指令是干啥的？
它可以让HTML标签的某个属性的值产生动态效果。

## 2. v-bind指令的语法格式
```html
<HTML标签 v-bind:参数="表达式"></HTML标签>

```

## 3. v-bind指令的编译原理
编译前：

```html
<HTML标签 v-bind:参数="表达式"></HTML标签>

```

编译后：

```html
<HTML标签 参数="表达式的执行结果"></HTML标签>

```

注意：

1. 在编译时，`v-bind`后面的“参数名”会被编译为HTML标签的“属性名”。
2. 表达式会关联`data`，当`data`发生改变后，表达式的执行结果也会变化，从而产生动态效果。

## 4. v-bind的简写方式
Vue框架为`v-bind`提供了简写方式：

```html
<img :src="imgPath">
```

## 5. 什么时候使用插值语法？什么时候使用指令？
+ 标签体中的内容需要动态时，使用插值语法。
+ HTML标签的属性需要动态时，使用指令语法。

```html
<body>
  <!-- 准备一个容器 -->
  <div id="app">
    <!-- 注意：以下代码中 msg 是变量名 -->
    <!-- 虽然可以随便写，但大部分情况下，参数名应写成HTML标签支持的属性名 -->
    <span v-bind:xyz="msg"></span>
    <span v-bind:xyz="'msg'"></span>
    <!-- v-bind实战 -->
    <img src="../img/1.jpg" /> <br />
    <img v-bind:src="imgPath" /> <br />
    <img :src="imgPath" /> <br />

    <!-- 普通文本框 -->
    <input type="text" name="username" value="zhangsan" /> <br />
    <input type="text" name="username" :value="username" /> <br />

    <!-- 动态超链接地址 -->
    <a href="https://www.baidu.com">百度1</a> <br />
    <a :href="url">百度2</a> <br />
    <!-- 错误写法 -->
    <!-- <a href="{{url}}">百度3</a> -->
  </div>
  <!-- Vue程序 -->
  <script>
    new Vue({
      el: "#app",
      data: {
        msg: "Hello Vue!",
        imgPath: "../img/1.jpg",
        username: "章三",
        url: "https://www.baidu.com",
      },
    });
  </script>
</body>

```

---

# 2.1.4 v-model详解
## 1. v-bind和v-model都可以完成数据绑定。
+ v-bind是单向数据绑定：`data ===> 视图`
+ v-model是双向数据绑定：`data <===> 视图`

## 2. v-bind可以使用在任何HTML标签中。
+ v-model只能使用在表单类元素上（如`input`、`select`、`textarea`），因为这些元素才能提供用户交互输入的界面。v-model通常用于`value`属性。

## 3. v-bind和v-model的简写方式
+ v-bind简写：

```html
v-bind:参数="表达式" 简写为 :参数="表达式"
```

+ v-model简写：

```html
v-model:value="表达式" 简写为 v-model="表达式"
```

```html
<body>
  <!-- 准备一个容器 -->
  <div id="app">
    <!-- 完整写法 -->
    v-bind指令：<input type="text" v-bind:value="name1" /><br />
    v-model指令：<input type="text" v-model:value="name2" /><br />

    <!-- 错误：v-model不能使用在这种元素上 -->
    <!-- <a v-model:href="url">百度</a> -->

    <!-- 简写 -->
    v-bind指令：<input type="text" :value="name1" /><br />
    v-model指令：<input type="text" v-model="name2" /><br />

    <!-- 联动改变 -->
    v-bind消息1：<input type="text" :value="msg" /><br />
    v-model消息2：<input type="text" v-model="msg" /><br />
  </div>
  <!-- Vue程序 -->
  <script>
    new Vue({
      el: "#app",
      data: {
        name1: "zhangsan",
        name2: "wangwu",
        url: "https://www.baidu.com",
        msg: "Hello Vue!",
      },
    });
  </script>
</body>

```

---

# 2.1.5 用户片段
## 安装插件：JavaScript (ES6) code snippets
为JavaScript、TypeScript、HTML、React和Vue提供ES6语法支持。

### 第一步：
<!-- 这是一张图片，ocr 内容为： -->
![](https://i-blog.csdnimg.cn/direct/c1e0dbc5d9f64d53bfadea3c9769cb2d.png)



### 第二步：
<!-- 这是一张图片，ocr 内容为： -->
![](https://i-blog.csdnimg.cn/direct/5e6b8adb969b4af58a8a2a9c7372a7c5.png)



### 第三步：配置片段
在`html.json`中设置HTML环境下的代码片段。

```json
{
  "Print to console": {
    "prefix": "log",
    "body": [
      "console.log('$1');",
      "$2"
    ],
    "description": "Log output to console"
  }
}
```

具体配置如下：

```json
{
  "h5 template": {
    "prefix": "vv",
    "body": [
      "<!DOCTYPE html>",
      "<html lang=\"en\">",
      "<head>",
      "\t<meta charset=\"UTF-8\">",
      "\t<meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">",
      "\t<meta http-equiv=\"X-UA-Compatible\" content=\"ie=edge\">",
      "\t<title>Document</title>",
      "\t<script src='https://cdn.jsdelivr.net/npm/vue@2.6.10/dist/vue.js'></script>",
      "</head>",
      "<body>",
      "\t<div id =\"root\"> </div>",
      "\t<script>",
      "\tVue.config.productionTip = false//阻止vue 在启动时生成生产提示",
      "\t var vm = new Vue({",
      "\t\tel: '#root',",
      "\t\tdata() {return{}},",
      "\t\tmethods: {}",
      "\t });",
      "\t</script>",
      "</body>",
      "</html>"
    ],
    "description": "vue学习模版"
  }
}
```

在`javascript.json`中配置JS的片段：

```json
{
  "create vue instance": {
    "prefix": "v1",
    "body": [
      "\t var vm = new Vue({",
      "\t\tel: '#root',",
      "\t\tdata: {'$1'},",
      "\t });",
    ],
    "description": "vm"
  }
}
```
