---
title: "vue2初体验》"
slug: "vue-vue2-vue2-b45d61d5"
summary: ""
category: "vue2"
categoryPath:
  - "前端技术"
  - "Vue"
  - "vue2"
tags: []
status: "published"
sortOrder: 220
cover: ""
originalId: "6a2d291e8a2b1c68f2cac2a2"
originalSlug: "vue-vue2-vue2-b45d61d5"
originalStatus: "published"
publishedAt: "2026-03-27T13:24:34.209Z"
updatedAt: "2026-06-13T10:28:28.141Z"
exportedAt: "2026-07-30T15:42:33.614Z"
---
# **一、 Vue程序初体验 **
先不去了解Vue框架的发展历史，Vue框架的特点，Vue的作者，这些对于我们开发来说，没有什么特别的作用，我们先学会基本使用，然后再去详细了解它的特点，就会发现，原来如此。

但我们需要指导<font style="color:#f33232;">Vue是一个基于JavaScript（JS）实现的框架</font>，想要使用它，就得先拿到Vue的js文件

Vue官网

Vue2：[Vue.js](https://v2.cn.vuejs.org/)

Vue3：[Vue.js - 渐进式 JavaScript 框架 | Vue.js](https://cn.vuejs.org/)

目前最新的是Vue3，企业也大量使用到，但Vue3在Vue2的基础上，先学习Vue2，Vue3学习会事半功倍，且企业也有大量的Vue2项目需要进行维护，所以Vue2必须要掌握

## **1.1 下载并安装vue.js **
第一步：打开Vue2官网，点击下图所示的“起步”：

<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.nlark.com/yuque/0/2025/png/50923934/1741692021221-28908a5e-096e-4d45-ac99-2c4f4b43acf4.png)编辑

第二步：继续点击下图所示的“安装”

<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.nlark.com/yuque/0/2025/png/50923934/1741692021362-cbea59fc-e383-4a31-9d7c-7df5da7536cf.png)编辑

第三步：在“安装”页面向下滚动，直到看到下图所示位置：

<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.nlark.com/yuque/0/2025/png/50923934/1741692021322-2b8ecb31-5d81-4b92-bdc4-008df7b9891b.png)编辑

第四步：点击开发版本，并下载

第五步：安装Vue

使用script标签引入vue.js文件。就像这样：

```html
<script src=”xx/vue.js”></script>
```

## **1.2 、第一个Vue程序 **
### **1.2.1、先创建Vue第一个程序**
```html
<!DOCTYPE html>

<html lang="en">

<head>

    <meta charset="UTF-8">

    <title>第一个Vue程序</title>

    <!-- 第一步：引入Vue.js -->

    <script src="../js/vue.js"></script>

</head>

<body>

    <!-- 第二步：指定挂载位置 -->

    <div id="app"></div>

    <!-- 第三步：使用Vue -->

    <script>

        // 3.1创建Vue实例

        const vm=new Vue({

            template:'<h1>hello world!</h1>'

        })

        // 3.2 将Vue实例挂载到指定位置

        vm.$mount('#app')

       // vm.$mount(document.getElementById("app"));

    </script>

</body>

</html>
```

### **1.2.2、解释说明：**
1、当使用script引入Vue.js之后，Vue会被注册为一个**<font style="color:#ff0000;">全局变量</font>**，就像引入jQuery之后，jQuery也会被注册为一个全局变量,通过控制台可以看到这个Vue全局变量

2、必须new一个Vue实例，如果不new的话，是无法直接使用Vue的

第一步：创建一个空对象，作为将要返回的对象。 <font style="background-color:#fff2cc;">let vm = {}</font>

第二步：将这个空对象的原型指向构造函数的prototype属性，也就是将对象的__proto__属性指向构造函数的prototype。

【让对象能沿着原型链去使用构造函数中prototype上的方法】 <font style="background-color:#fff2cc;">vm.__proto__ = Vue.prototype</font>

第三步：将这个空对象赋值给构造函数内部的this关键字，执行构造函数。【让构造器中设置的属性和方法设置在这个对象上】

<font style="background-color:#fff2cc;">Vue.apply(vm, 参数)</font>

第四步：返回这个对象。 <font style="background-color:#fff2cc;">return vm</font>

3、Vue的构造方法参数是一个options配置对象，配置对象中有大量Vue预定义的配置，每一个配置项都是key：value结构，一个key：value就是一个Vue的配置项

4、template配置项：value是一个**<font style="color:#ff0000;">模版字符串</font>**，在这里编写符合Vue语法规则的代码（Vue有一套自己规定的语法规则）

写在这里的字符串会**<font style="color:#ff0000;">被Vue编译器编译</font>**，将其**<font style="color:#ff0000;">转换</font>**为**<font style="color:#ff0000;">浏览器</font>**能够识别的HTML**<font style="color:#ff0000;">代码</font>**，template称之为模版

5、Vue实例的**<font style="color:#ff0000;">$</font>****<font style="color:#ff0000;">mount</font>**方法，这个方法完成挂载工作，**<font style="color:#ff0000;">将Vue实例挂载到指定位置</font>**，也就是将Vue编译后的HTML代码<font style="color:#f33232;">渲染</font>到页面指定的位置，注意：**<font style="color:#ff0000;">指定位置的元素会被</font>****<font style="color:#ff0000;">替换</font>**

<font style="color:#000000;">6、‘#app’的语法类似于css中的id选择器语法，表示将Vue实例挂载到id=‘app’的元素位置，也可以用其他选择器，如果匹配到多个位置，Vue只会选择第一个位置进行挂载（从上到下第一个），或者直接用原声js去获取：</font>vm.$mount(document.getElementById("app"));

## **1.3 、Vue的data配置项 **
如果仅仅像我们以上书写的程序，我们完全没有必要使用Vue，直接在body里直接书写就可以了：

在Vue中还有一个data的配置项，它可以帮助我们动态的渲染页面：

### **1.3.1、代码如下**
```html
<!DOCTYPE html>

<html lang="en">

  <head>

    <meta charset="UTF-8" />

    <title>模板语句的数据来源</title>

    <!-- 引入Vue -->

    <script src="../js/vue.js"></script>

  </head>

  <body>

    <!-- 指定挂载位置 -->

    <div id="app"></div>

    <!-- vue程序 -->

    <script>

      new Vue({

        // template: `<h1>我叫张三，我今年18岁了</h1>`,

        template: `<h1>我叫{{name}},我今年{{age}}岁了</h1>`,

        //1.1 data函数写法

        // data: function () {

        //   return {

        //     name: "章三",

        //     age: 28,

        //   };

        // },

        //1.2 data函数简写

        // data() {

        //   return {

        //     name: "章三",

        //     age: 28,

        //   };

        // },

        // 2、data对象写法

        data: {

          name: "李四",

          age: 18,

          hobby: ["跑步", "游泳", "学习"],

          salary: {

            base: "5k",

            bonus: {

              month: "5k",

              year: "10k",

            },

          },

        },

      }).$mount("#app");

    </script>

  </body>

</html>
```

### **1.3.2、代码解释**
1、data是Vue实例的数据对象，是给整个Vue实例提供数据来源的

2、data配置项的value值，有两种写法 Object｜Function（**<font style="color:#ff0000;">对象或者函数</font>**），现阶段，这两种写法都可以，后期学到组件化的时候，data只能是函数的写法，建议大家直接用函数

3、如果data是对象的写法，对象必须是存粹的对象（含有0个或多个key：value）

4、data数据插入到模版语句中，可以用**<font style="color:#ff0000;">{{}}</font>**,这是Vue框架自己搞的一个语法，叫**<font style="color:#ff0000;">插值语法</font>**（或叫胡子语法），可以从data根据key获取value，并且将value插入到对应的位置，注意{{}}语法是固定语法，不可以添加其他内容，例如空格{ { }}

5、data可以写多级，然后去一级一级获取

6、Vue编译器对template进行编译，遇到{{}}语法时，就去data里取数据，然后将获取到的数据插入到对应的位置，生成对应的html代码，最终将html渲染到挂载位置，呈现

7、当data发生改变时，template模版就会被重新编译，重新渲染

### **1.4、 Vue的template配置项 **
### **1.4.1、具体代码**
```html
<!DOCTYPE html>

<html lang="en">

  <head>

    <meta charset="UTF-8" />

    <title>template配置项详解</title>

    <!-- 引入Vue -->

    <script src="../js/vue.js"></script>

  </head>

  <body>

    <!-- 指定挂载位置 -->

    <!-- 注意：以下代码是Vue框架能看懂的代码了。

        下面的代码就是一个模板语句。这个代码是需要Vue框架编译，然后渲染的。 -->

    <div id="app">

      <!-- <div>

        <h1>{{msg}}</h1>

        <h1>{{name}}</h1>

      </div> -->

    </div>



    <!-- vue程序 -->

    <script>

      new Vue({

        // 错误的

        //template : '<h1>{{msg}}</h1><h1>张三</h1>',

        template: `

            <div>

                <h1>{{msg}}</h1>

                <h1>{{name}}</h1>

            </div>

            `,

        data: {

          msg: "Hello World!!!!!!!",

          name: "张三",

        },

      }).$mount("#app");

    </script>

  </body>

</html>
```

### **<font style="color:#000000;">1.4.2、代码解释</font>**
<font style="color:#000000;">1、template只能有一个根元素，只要data数据发生变化，template就会重新编译</font>

<font style="color:#000000;">2、template编译后进行渲染时会将挂载位置的元素替换。</font>

<font style="color:#000000;">3、template后面的代码如果需要换行的话，建议将代码写到``符号当中，不建议使用 + 进行字符串的拼接。</font>

<font style="color:#000000;">4、template配置项可以省略，将其直接编写到HTMl代码中，此时指定挂载的位置就不会被替换</font>

<font style="color:#000000;">5、只要data中的数据发生了变化，模版语句就一定会重新编译</font>

## **1.5、el配置项**
### **1.5.1、具体代码**
```html
<!DOCTYPE html>

<html lang="en">

  <head>

    <meta charset="UTF-8" />

    <title>el配置项</title>

    <!-- 引入Vue -->

    <script src="../js/vue.js"></script>

  </head>

  <body>

    <!-- 指定挂载位置 -->

    <div id="app">

      <div>

        <h1>{{msg}}</h1>

        <h1>{{name}}</h1>

      </div>

    </div>

    <!-- vue程序 -->

    <script>

      new Vue({

        data: {

          msg: "Hello World!!!!!!!",

          name: "张三",

        },

        // el配置项：确定挂载对象

        el: "#app",

        //el : document.getElementById('app')

      });

      //}).$mount('#app')

    </script>

  </body>

</html>
```

### **1.5.2 、代码解释**
1、可以不使用$mount('#app')的方式进行挂载了。在Vue中有一个配置项：el ，

el配置项和$mount()可以达到同样的效果。

2、el配置项的作用？

el是element单词的缩写，翻译为“元素”，**<font style="color:#ff0000;">el配置项主要是用来指定Vue实例关联的容器</font>**。也就是说Vue所管理的容器是哪个。

el : '#app'，表示让Vue实例去接管id='app'的容器。

## **1.6、解决控制台的提示信息和错误信息**
### **1.6.1、去除生产提示**
Vue.config<font style="color:#304455;"> 是一个对象，包含 Vue 的全局配置，其中有个属性</font>[productionTip](#productionTip)<font style="color:#304455;">，设置为 </font>

false<font style="color:#304455;"> 以阻止 vue 在启动时生成生产提示。</font>

**<font style="color:#ff0000;background-color:#f9f9f9;">// 有时不生效，可能因为版本问题，彻底解决办法，去源码里修改</font>**

**<font style="color:#ff0000;background-color:#f9f9f9;">Vue.config.productionTip = false</font>**

### **1.6.2、安装Vue Devtools**
第一步：极简插件：[极简插件官网_Chrome插件下载_Chrome浏览器应用商店](https://chrome.zzzmh.cn/)下载

第二步：将下载解压好的**<font style="color:#ff0000;">crx</font>**文件，安装到浏览器中

<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.nlark.com/yuque/0/2025/png/50923934/1741692021258-71f8b4dc-0687-49c6-a28b-45b123c7b35b.png)编辑

<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.nlark.com/yuque/0/2025/png/50923934/1741692021343-20e408e6-d9b6-4f66-8929-e8b1f7ff1985.png)编辑

<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.nlark.com/yuque/0/2025/png/50923934/1741692021867-01e11a65-e7d7-4a17-b666-e5ef7dafad21.png)编辑

<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.nlark.com/yuque/0/2025/png/50923934/1741692021946-9210e81d-a6e9-4ad4-83c6-f31ced940586.png)编辑

注意，数据如果是纯中文，可能是显示不出来对应组件的数据区域的

## **1.7、Vue实例和容器一一对应**
**<font style="color:#ff0000;">一</font>****<font style="color:#ff0000;">个Vue实例只能接管一个容器</font>**。一旦接管到容器之后， 即使后面有相同的容器，Vue也是不管的。因为Vue实例已经“娶到媳妇”了。<font style="color:#595959;background-color:#f9f9f9;">  </font>

```html
<body>

    <!-- 准备容器 -->

    <div class="app">

      <h1>{{msg}}</h1>

    </div>



    <div class="app">

      <h1>{{msg}}</h1>

    </div>



    <!-- 准备容器 -->

    <div id="app2">

      <h1>{{name}}</h1>

    </div>



    <!-- vue程序 -->

    <script>

      /*

     验证：一个Vue实例可以接管多个容器吗？

不能。一个Vue实例只能接管一个容器。一旦接管到容器之后，

    即使后面有相同的容器，Vue也是不管的。因为Vue实例已经“娶到媳妇”了。

        */

      new Vue({

        el: ".app",

        data: {

          msg: "Hello Vue!",

        },

      });



      new Vue({

        el: "#app2",

        data: {

          name: "zhangsan",

        },

      });

     new Vue({

            el: "#app2",

            data: {

              name: "lisi",

            },

          });

    </script>

  </body>
```
