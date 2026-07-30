---
title: "vue2面试题"
slug: "vue-vue-vue2-979be5aa-revision-20260730"
summary: ""
category: "vue面试题"
tags: []
status: "draft"
sortOrder: 40
cover: ""
originalId: "6a2d291f8a2b1c68f2cac2dc"
originalSlug: "vue-vue-vue2-979be5aa"
originalStatus: "published"
exportedAt: "2026-07-30T13:20:22.058Z"
---
### 1、vue功能是什么，跟传统开发有什么区别？
#### vue功能是什么
Vue.js是一个用于创建用户界面的开源JavaScript框架，也是一个创建单页面应用的Web应用框架

#### vue跟传统开发的区别
vue所有的界面事件，都是只去**操作数据**的，而像jquery是用来操作DOM;

vue所有界面的变动，都是根据数据自动绑定出来的，jquery操作DOM

### 2、为什么使用vue？
+ 轻量级，体积小是一个重要指标。Vue.js 压缩后有只有 30多kb （Angular 压缩后 56kb+，React 压缩后 44kb+）
+ 移动优先。更适合移动端，比如移动端的 Touch 事件
+ 易上手，学习曲线平稳，文档齐全
+ 吸取了 Angular（ 模块化 ）和 React（ 虚拟 DOM ）的长处，并拥有自己独特的功能，如： 计算属性
+ 开源，社区活跃度高

### 3、什么是虚拟 DOM
虚拟DOM（virtual DOM）简称vdom，是一个普通的js对象，用来描述真实dom结构，因为它不是真实的DOM，所以称为虚拟DOM

虚拟 DOM（Virtual DOM）是一种编程概念，用于在前端开发中高效地更新用户界面。它是真实 DOM 的轻量级副本，以对象的形式表示 DOM 结构。虚拟 DOM 通过比较新旧虚拟 DOM 的差异，只对实际 DOM 进行最小化的更新操作，从而提高页面渲染性能。例如，在 React、Vue 等前端框架中广泛使用虚拟 DOM 来优化界面更新过程。

虚拟DOM算法步骤：

1、将DOM树转换成JS对象树，产生第一个虚拟DOM树（与真实DOM树一样）

2、数据发生变化时（当你有增删操作）产生第二个虚拟DOM树

3、<u>diff算法</u>逐层比较两个虚拟DOM树并标记增删操作（不会渲染）

4、将标记出来的差异（虚拟节点）应用到真正的 DOM 树，而不是将整个虚拟DOM树覆盖到真正的DOM树上 

### 4、diff算法
Diff 算法是一种对比算法。对比两者是<u> 旧虚拟 DOM 和新虚拟 DOM</u>，对比出是哪个虚拟节点更改了，找出这个 虚拟节点并只更新这个虚拟节点所对应的 真实节点而不用更新其他数据没发生改变的节点，实现 精准地更新真实 DOM，进而 提高效率

在新老虚拟 DOM 对比时：

（1）、首先，对比key，判断是否为同一key，如果不为key，则删除该节点重新创建节点进行替换；

（2）、如果为相同的key，则继续进行有无节点的比对，如果没有，则创建，如果有则进行 updateChildren，判断如何对这些新老节点的子节点进行操作（diff 核心）。

总结：匹配时，找到相同的子节点，递归比较子节点

### 5、MVVM
#### （1）、对MVVM的理解？
M==>mode(数据模型)

V==>view(代表UI组件，负责将数据转换为UI展现出来)，

VM==>ViewModel，在MVVM架构下，View和Model没有直接的关系，而是通过ViewModel进行交互的，Model和ViewModel之间的交互是相互的，所以view数据的变化会同步到Model上，而Model的变化也会同步到View上

#### （2）、MVVM与MVC的区别是什么
MVC ： 传统的设计模式。M：model模型，V：View视图，C：controller控制器

MVVM：我们vue所用的设计模式，<u>数据双向绑定，让数据自动地双向同步不需要操作dom。</u>

M： model数据模型 (data里定义)

V： view视图 （页面标签）

VM： ViewModel视图模型 (vue.js源码)

### 6、一个.vue文件由几部分组成，分别什么含义
由三部分组成：

+ <template>所需要渲染的区域</template>
+ <script>存放引入的资源与业务实现的数据与操作</script>
+ <style>存放界面css的样式</style>

### 7、data为什么必须是一个函数？
根本原因：每次调用产生一个新的地址空间，防止数据被污染

我们对象是引用类型数据，处理的是内存当中的地址。当我们引用data多个组件会对data的堆内值进行更改，组件与组件之前的数据会相互影响。

当我们data是函数的话，则会每次引用的时候都会返回一个新的的地址，确保各组件的数值不会相互影响

### 8、computed、watch、methods
#### （1）、computed（计算属性）与watch（侦听器）的区别？
1）计算属性可以被缓存，侦听属性不能被缓存

2）侦听属性可以<u>包含异步任务</u>，而计算属性不行

3）计算属性通常是由一个或多个响应式数据计算出一个值返回；

而侦听属性通常是监听一个数据的变化，由这一个数据的变化可能影响到另外的一个或多个数据的变化

4）计算属性中的函数<u>必须要用return返回</u>，而侦听器不用

5）computed默认第一次加载的时候就开始监听；

watch默认第一次加载不做监听，如果需要第一次加载做监听，添加immediate属性，设置为true（immediate:true）

**应用场景：**

当页面中有某些数据依赖其他数据进行变动的时候，可以使用计算属性computed。

watch用于观察和监听页面上的vue实例，如果要在数据变化的同时进行异步操作或者是比较大的开销，那么watch为最佳选择。

#### （2）、computed、methods区别？
我们可以将同一函数，定义为一个 method 或者一个计算属性。对于最终的结果，两种方式是相同的。

不同点：

computed：计算属性是基于它们的依赖进行缓存的，只有在它的相关依赖发生改变时才会重新求值。

methods：只要发生重新渲染， method 调用总会执行该函数。

### 9、vue指令？
v-html  

v-text  

v-bind：data    // 绑定动态数据   ：data

v-on：click      // 绑定事件       @click

v-for  // 循环，vue2中v-for的优先级高于v-if，不推荐一起使用

v-if   //  条件渲染指令  如果是真则渲染节点，否则不渲染节点

v-if、v-else 和 v-else-if ：类似js的if...else判断语句

v-show：通过display:none;控制元素显示隐藏

v-model    //  双向绑定，用于表单

v-pre ：主要用来跳过这个元素和它的子元素编译过程。

v-cloak ：保持在元素上直到关联实例结束时进行编译。

v-once ：关联的实例，只会渲染一次。之后的重新渲染，实例极其所有的子节点将被视为静态内容跳过，这可以用于优化更新性能

### 10、ref的作用？
获取dom元素 this.$refs.box

获取子组件，从而可以获取到子组件的数据以及方法，Vue3需要子组件同意

### 11、v-if与v-show区别？
v-show通过css 中的 display控制显示和隐藏

v-if组件真正的渲染和销毁，而不是显示和隐藏，

总结：频繁切换状态使用v-show ，否则使用v-if

### 12、vue.js两个核心是什么？
数据驱动和组件化

### 13、关于key的面试题
#### （1）、为何v-for要使用key?
快速查找到节点，减少渲染次数，提升渲染性能

#### （2）、Vue中Key值作用
key值的作用是给元素添加一个唯一的标识符，提高vue渲染性能。当数据变化的时候，vue就会使用diff算法对比新旧虚拟Dom。 如果遇到相同的key值，则复用元素。如果遇到不同的key值则强制更新。

#### （3）、用Index作为key，可能会引发的问题？
1）若对数据内容进行逆序的添加删除等破坏顺序的操作：会产生没有必要的真实DOM的更新，界面效果没有问题，但是效率低

2）如果界面中含有输入类的DOM，会产生错误的DOM更新，界面有问题

<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.nlark.com/yuque/0/2025/png/50923934/1743599596159-f7d0f8fc-b59f-487f-ade1-82e8672ab1ed.png)



<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.nlark.com/yuque/0/2025/png/50923934/1743599602467-568606c5-e6f1-4a2e-9afe-1e4b9ac8f9d0.png)

### 14、$set是干什么用的？
给对象或者数组增加新的响应式数据：vm.$set(obj,"key","value")或者用Vue.set(obj,"key","value")也可以

### 15、scoped作用与原理
作用：组件css作用域，<u>避免子组件内部的css样式被父组件覆盖</u>，默认情况下，如果子组件和父组件css选择器权重相同，优先加载父组件css样式

原理：给元素添加一个自定义属性 v-data-xxxxx， 通过属性选择器来提高css权重值

### 16、Vue中如何做样式穿透
在Vue项目中经常需要使用到组件库，遇到需要修改组件库组件的样式时通常会使用样式穿透

**vue2****语法提供****3****种   **   >>>     /deep/    ::v-deep

父组件选择器 >>> 子组件选择器 { 子组件样式 }

/deep/ 子组件选择器 { 子组件样式 }

::v-deep 子组件选择器 { 子组件样式 }

**vue3****语法提供****2****种 **  :deep()   ::v-deep()

:deep(子组件选择器){ 子组件样式 }

::v-deep(子组件选择器){ 子组件样式 }

经测试, 这五种穿透语法在vue2和vue3中都兼容

### 18、生命周期相关面试题
#### （1）、什么是vue生命周期？
答： Vue 实例从创建到销毁的过程，就是生命周期。

从开始创建、初始化数据、编译模板、挂载Dom→渲染、更新→渲染、销毁等一系列过程，称之为 Vue 的生命周期。

#### （2）、vue生命周期的作用是什么？
它的生命周期中有多个事件钩子，让我们在控制整个Vue实例的过程时更容易形成好的逻辑。

1. 在不同阶段执行特定的代码：例如在 created 阶段可以进行数据初始化，在 mounted 阶段可以进行 DOM 操作等。
2. 方便进行资源管理：在 beforeDestroy 和 destroyed 阶段可以清理定时器、取消订阅等，避免资源浪费和内存泄漏。
3. 实现组件间的协调：可以在特定生命周期阶段触发父组件与子组件之间的交互。

#### （3）、单组件生命周期：
vue生命周期分为几个阶段，几个钩子函数，分别写出来

初始化阶段:  beforeCreate、 created

挂载阶段 : beforeMount、mounted

更新阶段 : beforeUpdate、updated

销毁阶段:  beforeDestroy、destroyed

#### （4）、父子组件生命周期：
挂载：parent beforeCreate==>parent created==>parent beforeMount==>child

更新：parent beforenUpdata==>chlid beforeUpdate==>child updated==>parent updated

销毁：parent beforeDestory==>child beforeDestory==>child destoryed==>parent detoryed

从以上可以看出：

挂载时：子组件是在父组件beforeMount后开始挂载，并且子组件先mounted，父组件随后

更新时：子组件是在父组件beforeUpdate后开始更新，并且子组件先于父组件更新

销毁时：子组件是在父组件beforeDestory后开始销毁，并且子组件先于父组件销毁

#### （5）、vue生命周期有哪些？分别哪些场景中使用？
beforeCreate

创建前，访问不到data当中的属性以及methods当中的属性和方法，可以在当前生命周期创建一个loading，在页面加载完成之后将loading移除

<font style="color:rgb(255,0,1);">created</font>

创建后，当前生命周期执行的时候会遍历data中所有的属性，给每一个属性都添加一个getter、setter方法,将data中的属性变成一个响应式属性，在这个阶段可以<u>请求，最早处理的数据的阶段</u>

beforeMount

模板与数据进行结合，但是还没有挂载到页面上。

<font style="color:rgb(255,0,1);">mounted</font>

当前生命周期数据和模板进行相结合，并且已经挂载到页面上了，因此我们可以在当前生命周期中获取到真实的DOM元素，也可以在这发起后端请求，拿回数据，做一些页面渲染

beforeUpdate

当数据发生改变的时候当前生命周期就会执行，因此我们可以通过当前生命周期来检测数据的变化，当前生命周期执行的时候会将更新的数据与模板进行相结合，但是并没有挂载到页面上，<u>因此我们可以在当前生命周期中做更新数据的最后修改</u>

updated

数据与模板进行相结合，并且将更新后的数据挂载到了页面上。因此我们可以在当前生命周期中获取到最新的DOM结构

<font style="color:rgb(255,0,1);">beforeDestory</font>

当前生命周期中我们需要做<u>事件的解绑  监听的移除  定时器的清除等操作</u>

destoryed

当前生命周期执行完毕后会将vue与页面之间的关联进行断开



路由组件独有的两个新的生命周期

`<font style="color:rgb(199, 37, 78);background-color:rgb(249, 242, 244);"><keep-alive></font>`**<font style="color:#DF2A3F;">包裹的路由组件</font>**<font style="color:rgb(77, 77, 77);">，该组件有两个特有的生命周期函数：</font>`<font style="color:rgb(199, 37, 78);background-color:rgb(249, 242, 244);">activated</font>`<font style="color:rgb(77, 77, 77);">和</font>`<font style="color:rgb(199, 37, 78);background-color:rgb(249, 242, 244);">deactivated</font>`<font style="color:rgb(77, 77, 77);">。</font>

`<font style="color:rgb(199, 37, 78);background-color:rgb(249, 242, 244);">activated</font>`<font style="color:rgb(77, 77, 77);">在路由组件</font><font style="color:#DF2A3F;">被激活时触发</font><font style="color:rgb(77, 77, 77);">；</font>(活跃状态：进入页面的时候)

`<font style="color:rgb(199, 37, 78);background-color:rgb(249, 242, 244);">deactivated</font>`<font style="color:rgb(77, 77, 77);">在路由组件</font><font style="color:#DF2A3F;">失活时触发</font><font style="color:rgb(77, 77, 77);">。</font>

<font style="color:rgb(255,0,1);">$nextick    </font><font style="color:rgb(255,0,1);">在下一次</font><font style="color:rgb(255,0,1);">dom</font><font style="color:rgb(255,0,1);">渲染后执行</font>

#### （6）、第一次页面加载会触发那几个钩子？
第一次页面加载时会触发 beforeCreate, created, beforeMount, mounted 这几个钩子

#### （7）create和mouted的区别
****created:在模板渲染成html前调用，即通常初始化某些属性值，然后再渲染成视图。

mounted:在模板渲染成html后调用，通常是初始化页面完成后，再对html的dom节点进行一些需要的操作

#### （8）什么阶段操作dom（/什么时候可以获得到dom）
答：在钩子函数mounted被调用前，Vue已经将编译好的模板挂载到页面上，所以在mounted中可以访问操作DOM

#### （9）在生命周期中什么时候可以获得到数据
答：created :完成了 data 数据的初始化

#### （10）、何时使用beforeDestory?
1）解绑自定义事件

2）清零定时器

3）解除监听

····

#### （11）、发送请求在created还是在mounted
答：建议放在created里

created:在模板渲染成html前调用，即通常初始化某些属性值，然后再渲染成视图。

mounted:在模板渲染成html后调用，通常是初始化页面完成后，再对html的dom节点进行一些需要的操作。如果在mounted钩子函数中请求数据<u>可能导致页面闪屏问题，</u>

其实就是加载时机问题，放在created里会比mounted触发早一点，如果在页面挂载完之前请求完成的话就不会看到闪屏了

#### （12）、$nextTick的作用是什么？
在下次 DOM 更新循环结束之后执行延迟回调。在修改数据之后立即使用这个方法，获取更新后的DOM。

例如：在created生命周期中想要操作dom就可以使用this.$nextTick(()=>{ ... })可以在mounted之前的生命周期中操作dom

<font style="color:rgba(0, 0, 0, 0.95);">$nextTick 通常用于在数据变化后等待 DOM 更新完成，然后再执行一些操作，比如获取更新后的 DOM 元素的属性或进行一些依赖于 DOM 状态的操作。它可以确保在 DOM 更新后执行回调函数，以避免在数据尚未完全同步到 DOM 时进行操作可能导致的错误。</font>

#### （13）、vue为何是异步渲染？
因为如果不采用异步更新，那么每次更新数据都会对当前组件进行重新渲染，所以考虑性能问题，Vue会在本轮数据更新之后，再去异步更新视图

<font style="color:rgba(0, 0, 0, 0.95);">“异步渲染” 指的是在处理页面渲染时不是立即进行，而是采用非同步的方式，可能会将渲染任务放入队列中，在合适的时候再执行，以提高性能和用户体验。例如，当数据发生变化时，Vue 不会立即重新渲染整个页面，而是先收集这些变化，然后在合适的时机进行统一的渲染，这样可以避免频繁的重绘和重排，减少性能开销。</font>

### 19、组件通信？
#### （1）、简述组件通信方式
1. 通过 props 传递：			父组件向子组件传递数据的一种方式。
2. 通过 $emit 触发自定义事件：	子组件向父组件传递数据的一种方式。
3. 使用 ref：					可以获取 DOM 元素或组件实例，用于直接操作组件或元素。
4. EventBus：				一种全局的事件总线，用于组件之间的非父子关系通信。
5. $parent：				子组件访问父组件的一种方式。
6. $children：				父组件访问子组件的一种方式。
7. $ attrs 与  $listeners：		用于处理组件间的属性和事件传递。
8. Provide 与 Inject：			依赖注入，主要是解决父子组件传值“props 逐级传递”问题。
9. Vuex：					状态管理模式，用于管理应用的全局状态，实现组件之间的状态共享和通信

**总结：**

**父子关系的组件数据传递选择 props  与 $emit进行传递，也可选择ref，$parent,$children,**

**兄弟关系的组件数据传递可选择****$bus,****消息订阅与发布，**

**祖先与后代组件数据传递可选择****attrs****与****listeners****或者 ****Provide****与 ****Inject**

**复杂关系的组件数据传递可以通过****vuex****存放共享的变量**

#### （2）、详细说一下每一种组件通讯方式
###### 1）、父组件向子组件传递数据--使用props
**功能：**让组件接收外部传过来的数据；

**传递数据: **直接在组件标签内写属性

**接收数据：**

第一种方式：（只接收）

props: ['name']

第二种接收方式：（限定类型）

props:{

name:String

}

第三种接收方式：（限定类型+限制必要性+指定默认值）

props:{

name: {

type:String, //类型

required:true, //必要性

default:'老王' // 默认值

}

}

备注：props是只读的，Vue底层会监视你对props的修改，如果进行了修改，就会发出警告，若业务需求确实需要修改那么复制props的内容到data中一份，然后去修改data中的数据

###### 2）子组件向父组件传递数据--可以通过自定义事件
通过父组件给子组件绑定一个自定义事件，子触发自定义事件给父传递数据

###### 3）ref 链：
父组件要给子组件传值，在子组件上定义一个 ref 属性，这样<u>通过父组件的 $refs 属性</u>，就可以获取子组件的值了，也可以进行父子，兄弟之间的传值($parent / $children与 ref类似)

###### 4）兄弟组件通信--使用全局事件总线（$bus）
**安装全局事件总线:**

new Vue({

//.....

beforeCreate() {

**<font style="color:#DF2A3F;">Vue.prototype.$bus = this//安装全局事件总线，$bus就是当前应用的vm},</font>**

//....

})

**使用方式：**

接收数据：this.$bus.$on('xxx', this.demo)// 绑定事件

提供数据：this.$bus.$emit('xxx', 数据) //触发事件

###### 5）使用消息订阅与发布--使用于任意组件通信
使用步骤

1).安装pubsub:npm i pubsub-js

2).引入：import pubsub from 'pubsub-js'

3).接收数据：A组件想要接收数据，则在A组件中订阅消息，订阅的回调留在A组件自身

4).提供数据：pubsub.publish('xxx',数据)

###### 6）vuex
搭建环境，数据写在vuex中，所有组件共享

### 20、双向绑定v-model的实现原理
双向数据绑定最核心的方法便是通过<font style="color:#DF2A3F;">Object.defineProperty()来实现对属性的劫持</font>，达到监听数据变动的目的。

首先是从data里面的数据通过绑定到input控件上，然后在input上通过input监听控件，触发change事件，

然后，调用方法都可以默认获取e事件，<u>e.target.value</u>是获取调用该方法的dom对象上的value值，

最后，<u>把value值赋给data里面的初始数据</u>，

从而实现双向数据绑定的原理

### 21、props、data、computed、watch的优先级？
<font style="color:rgb(77, 77, 77);">props==>methods===>data===>computed===>watch</font>

小tips：这些变量名可以相同，模板会自动按优先级决定 使用哪个

### 22、vue常见的性能优化
1）合理使用v-if和v-show

2）合理使用computed

3）使用v-for的时候动态添加key

4）自定义事件，dom事件在beforeDestory中及时销毁

5）合理使用异步组件

6）合理使用keep-alive

7）data层级不要太深

8）使用vue-loader在开发环境做编译模板

9）前端通用性能优化（图片懒加载/减少HTTP请求/合理设置HTTP缓存/资源合并与压缩/合并CSS图片/将CSS放在header中/避免重复的资源请求/切分到多个域名）



### 23、vuex有关面试题
#### （1）.vuex是什么？怎么使用？哪种功能场景使用它？
**vuex****是什么？**

Vuex 是一个专为 Vue.js 应用程序开发的状态管理模式。它采用集中式存储管理应用的所有组件的状态。

场景：多个组件共享数据或者是跨组件传递数据时，比如：单页应用中，组件之间的状态。音乐播放、登录状态、加入购物车

**怎么使用？**

安装vuex,注册使用，创建store.js,根据需要创建state，actions，mutations,getters,module等，引入到main.js,new Vue({注册})

**vuex****的流程**

页面通过mapAction异步提交事件到action。action通过commit把对应参数同步提交到mutation，mutation会修改state中对应的值。getter把对应state中值计算出新值。可以在页面中拿到vuex中state,getter的数据

#### （2）.vuex的store有几个属性？分别讲讲它们的作用是什么？
有五种,分别是**State , Getter , Mutation , Action , Module **

    - state：vuex的基本数据，用来存储变量
    - geeter：从基本数据(state)派生的数据，相当于state的计算属性
    - mutation：提交更新数据的方法，必须是同步的(如果需要异步使用action)。每个mutation 都有一个字符串的 事件类型 (type) 和 一个 回调函数 (handler)。回调函数就是我们实际进行状态更改的地方，并且它会接受 state 作为第一个参数，提交载荷作为第二个参数。
    - action：和mutation的功能大致相同，不同之处在于 ==》1. Action 提交的是 mutation，而不是直接变更状态。 2. Action 可以包含任意异步操作。
    - modules：模块化vuex，可以让每一个模块拥有自己的state、mutation、action、getters,使得结构非常清晰，方便管理。

#### （3）、页面刷新后vuex的state数据丢失怎么解决？
F5页面刷新，页面销毁之前的资源，重新请求，因此写在生命周期里的vuex数据是重新初始化，无法获取的，这也就是为什么会打印出空的原因。

解决思路1：

使用localStorage sessionStorage或者是cookie

实际使用vuex值变化时，H5刷新页面，vuex数据重置为初始状态，所以还是要用到localStorage

解决思路2：

使用插件vuex-persistedState

vuex-persistedState默认持久化所有的state，可以指定需要持久化的state



#### （4）、使用vuex的优势是什么？
作为全局变量来用；vue是单向数据流，有一个vuex来建一个”全局仓库“，可以减少很多开发时候的”传参地狱“。

虽然vuex中的所有功能都能够通过其他的方式进行实现，但vuex对这些方法进行了整合处理，使用起来更加便捷，同时也便于维护。

#### （5）、vue 中 ajax 请求代码应该写在组件的 methods 中还是 vuex 的 action 中？
如果请求的数据是多个组件共享的，为了方便只写一份，就写vuex里面，如果是组件独用的就写在当前组件里面。

如果请求来的数据不是要被其他组件公用，仅仅在请求的组件内使用，就不需要放入 vuex 的 state 里

如果被其他地方复用，请将请求放入 action 里，方便复用，并包装成 promise 返回

#### （6）、怎么监听vuex数据的变化？
可以用计算属性、用watch监听

#### （7）、vuex使用actions时不支持多参数传递怎么办？
答：放在对象里面

#### （8）、你觉得vuex有什么缺点？
答：页面刷新时会使state的数据初始化

#### （9）、你觉得要是不用vuex的话会带来哪些问题？
组件之间传值麻烦复杂，可维护性会下降，你要修改数据，你得维护多个地方，可读性下降，因为一个组件里的数据，你根本就看不出来是从哪里来的

增加耦合，大量的上传派发，会让耦合性大大的增加，本来 Vue 用 Component 就是为了减少耦合，现在这么用，和组件化的初衷相背

**（10）、使用 Vuex 只需执行 Vue.use(Vuex)，并在 Vue 的配置中传入一个 store 对象的示例，store 是如何实现注入的？**

Vue.use(Vuex) 方法执行的是 install 方法，它实现了 Vue 实例对象的 init 方法封装和注入，使传入的 store 对象被设置到 Vue 上下文环境的store中。因此在VueComponent任意地方都能够通过this.store 访问到该 store。

**（11）、vuex怎样赋值？vuex存储数据的方法有哪些？**

使用下面这两种方法存储数据：

dispatch：异步操作，写法： this.$store.dispatch('actions方法名',值)

commit：同步操作，写法：this.$store.commit('mutations方法名',值)

#### （12）、Vuex是单向数据流还是双向数据流？
<font style="color:rgb(77,77,77);background-color:rgb(255,255,255);">Vuex 是单向数据流的一种实现</font>

#### （13）、怎么在组件中批量使用Vuex的state状态？
答:使用mapState辅助函数, 利用对象展开运算符将state混入computed对象中

```arkts
import {mapState} from 'vuex' 
export default{ computed:{ ...mapState(['price','number']) } }
```

#### （14）、你有使用过vuex的module吗？主要是在什么场景下使用？
答：把状态全部集中在状态树上，非常难以维护。按模块分成多个module，状态树延伸多个分支，模块的状态内聚，主枝干放全局共享状态

### 24、说说vue动态组件？
动态组件是指：在一个挂载点使用多个组件，并进行动态切换。什么是挂载点?可以简单的理解为页面的一个位置。最常见的就是：tab的切换功能。

在vue要实现这个功能通常用两种方式。一是使用<component>元素的<font style="color:rgb(243,50,50);"> is </font>的特性，二是使用<font style="color:rgb(243,50,50);"> v-if </font><font style="color:rgb(243,50,50);">。</font>

### 25、Vue中有时候数组会更新页面，有时候不更新为什么
因为vue内部只能监测到数组顺序/位置的改变/数量的改变, 但是值被重新赋予监测不到变更, 可以用 Vue.set() / vm.$set()

这些方法会触发数组改变, v-for会监测到并更新页面：

push()

pop()

shift()

unshift()

splice()

sort()

reverse()

### 26、mixin是干什么的？
mixin提供了一种非常灵活的方式，来分发 Vue 组件中的可复用功能。一个混入对象可以包含任意组件选项。当组件使用混入对象时，所有混入对象的选项将被“混合”进入该组件本身的选项。

```arkts
//定义mixin
var mixin = {
  data: function () {
    return {
      message: 'hello',
      foo: 'abc'
    }
  }
}
//使用mixin
new Vue({
  mixins: [mixin],
  data: function () {
    return {
      message: 'goodbye', 
      bar: 'def'
  }
  }
})
```

### 27、vue获取DOM
1、通过‘el属性：在Vue实例中，通过‘el` 属性可以访问当前组件所对应的 DOM 元素

```arkts
<template>
  <div>
    <p>Some content here</p>
  </div>
</template>


export default {
  mounted() {
    const element = this.$el;  // 获取组件根元素
    // 可以在此处操作和访问 element
  }
}
```

2、使用 ref 属性： 在模板中给需要获取的 DOM 元素添加 ref 属性，然后可以通过 this.$refs 对象访问该元素。

```arkts
<template>
  <div>
    <button ref="myButton">Click me</button>
  </div>
</template>

export default {
  mounted() {
    const buttonElement = this.$refs.myButton;
    // 可以在此处操作和访问 buttonElement
  }
```

3、使用事件修饰符： 在 Vue 的事件处理中，可以使用事件修饰符 .native 获取触发事件的原生 DOM 元素。

```arkts
<template>
  <div>
    <button @click.native="handleClick">Click me</button>
  </div>
</template>
export default {
  methods: {
    handleClick(event) {
      const buttonElement = event.target;
      // 可以在此处操作和访问 buttonElement
    }
  }
```

### 28、axios
#### （1）、axios的请求方式
实现asios的二次封装[https://blog.csdn.net/m0_61118311/article/details/129202465](https://blog.csdn.net/m0_61118311/article/details/129202465)

get请求（常用于获取数据）

post请求（常用于提交表单数据和上传文件）

put请求（对数据进行全部更新）

patch请求（修改部分数据）

delete请求(常用于删除操作(参数可以放在url上也可以和post一样放在请求体中)

#### （2）、axios拦截器（Interceptors）主要分为：
（1）请求拦截器：在发送请求前进行拦截，可以根据发送的请求参数做一些发送参数的调整，例如设置headers

（2）响应拦截器：在后台返回响应时进行拦截，可以根据状态码进入下一步处理。例如：登录失效跳转回登录页。

项目需求：根据后台返回的状态码，统一处理。例如：token失效，回到登录页面；返回错误，给出统一的错误提示。

### 29、vue中解决跨域做法
#### （1）、跨域
使用CORS （Cross-Origin Resource Sharing，跨域资源共享）是一个系统，它由一系列传输的HTTP头组成，这些HTTP头决定浏览器是否阻止前端 JavaScript 代码获取跨域请求的响应。

所谓同源（即指在同一个域）具有以下三个相同点，协议相同（protocol），主机相同（host），端口相同（port）

反之非同源请求，也就是协议、端口、主机其中一项不相同的时候，这时候就会产生跨域。

#### （2）、vue2里的跨域
在前端服务和后端接口服务之间架设一个中间代理服务，它的地址保持和前端服务一致，

这样就可以通过中间这台服务器做接口转发，在开发环境下解决跨域问题，看起来好像挺复杂，其实vue-cli已经为我们内置了该技术，我们只需要按照要求配置一下即可。

```javascript
devServer: {
  //proxy：'', //简单代理服务器
  // 复杂代理服务器
  proxy: {
    // http://c.m.163.com/nc/article/headline/T1348647853363/0-40.html
    '/api': { // 请求相对路径以/api开头的, 才会走这里的配置
      target: 'http://c.m.163.com', // 后台接口域名 我们要代理的真实的接口地址
        changeOrigin: true, // 改变请求来源(欺骗后台你的请求是从http://c.m.163.com)
        pathRewrite: {
        '^/api': ''    // 因为真实路径中并没有/api这段, 所以要去掉这段才能拼接正确地址转发请求
      }
    }
  }
}
```



### 30、路由相关面试题
#### （1）、parmas和query的区别
params 传参类似于网络请求中的 post 请求，params 传过去的参数不会显示在地址栏中（但是不能刷新）。params 只能配合 name 使用，如果提供了 path，params 会失效。  params 传参后，刷新页面会失去拿到的参数。

query 传参类似于网络请求中的 get 请求，query 传过去的参数会拼接在地址栏中（?name=xx）。query 较为灵活既可以配合 path 使用，也能配合 name 使用

#### （2）、路由怎么跳转
    - 标签方式：`<router-link>`
    - 编程式：`this.$router.push()`、`replace()`、`go(n)`

#### （3）、路由的两种模式（/hash与history的区别）
路由器（vue-router）有两种工作模式：hash模式和history模式，默认是hash模式。

hash和history的不同：

1）hash模式带#  history模式不带#

2）如果你想让url更加规范，推荐使用history模式，是一个正常的url，适合开发。

3）使用vue或react做的页面想分享到第三方app，有的app中就规定了，你的url中不能带#，所以此时，你就只能使用history路由模式

4）hash模式所有浏览器天生支持 ,history模式，它内部使用的是h5中提供的api，兼容性没有hash模式的兼容性好

5）history模式，如果没有对应的路由的规则，可能会发起一个真正原请求，需要后端来处理，如果不处理，就会产生404。

#### （4）、动态路由一般用在哪里的
动态路由的使用，一般用在detail详情页加载页面信息上。比如说有很多个商品，需要加载其中某个商品是详情页信息，就需要在路径后面带一个参数（id）,来识别要具体加载的哪个商品信息，这就用到了动态路由。

#### （5）、路由
vue的单页面应用是基于路由和组件的，路由用于设定访问路径，并将路径和组件映射起来。传统的页面应用，是用一些超链接来实现页面切换和跳转的。在vue-router单页面应用中，则是路径之间的切换，实际上就是组件的切换。

路由就是SPA（单页应用）的路径管理器。再通俗的说，vue-router就是我们WebApp的链接路径管理系统。

#### （6）、 router.addRoutes里面传什么
动态添加更多的路由规则。参数必须是一个符合 routes 选项要求的数组。router.addRoutes()这个方法更多可以用来做权限管理

#### （7）、路由传参的方式
query传参和params传参

1）声明式导航

不带参跳转对应的地址为/foo

url字符串拼接传参 对应的地址为/foo?id=123

query方式对象形式传参 对应的地址为/foo?id=123

params方式对象形式传参 对应地址为 /path/123 , 注意params和query一起使用params会失效，

2）编程式导航(路由实例对象router=new VueRouter())

字符串router.push('home')

对象router.push({ path: 'home' })

router.push({ name: 'user', params: { userId: '123' }})

router.push({ path: 'register', query: { plan: '123' }})

接收参数

this.$route.params.id

this.$route.query.xxx

#### （8）、$router和$route的区别是什么？
$router为VueRouter的实例，是一个全局路由对象，包含了路由跳转的方法、钩子函数等。

$route 是路由信息对象或者是跳转的路由对象，每一个路由都会有一个route对象，是一个局部对象，包含path,params,hash,query,fullPath,matched,name等路由信息参数。

#### （9）、路由钩子（路由守卫）？
##### 1）、路由守卫有哪些
全局路由守卫

router.beforeEach(to, from, next),全局前置守卫

router.beforeResolve(to, from, next),全局的解析守卫

router.afterEach(to, from ,next) 全局的后置守卫

组件内守卫    路由独享的守卫

beforeRouteEnter

beforeRouteUpdate

beforeRouteLeave

路由独享守卫

beforeEnter   组件内的守卫

**从****a****页面进入****b****页面时触发的生命周期**

1）beforeRouteLeave：路由组件的组件离开路由钩子，可取消路由离开；

2）beforeEach：路由全局前置守卫，可用于登录验证，全局路由loading等；

3）beforeEnter：独享路由守卫；

4）beforeRouteEnter：路由的组件进入路由前钩子；

5）beforeResolve：路由全局解析守卫；

6）afterEach：路由全局后置钩子；

7）beforeCreate：组件生命周期，不能访问this；

8）created：组件生命周期，可以访问this，不能访问dom；

9）beforeMount：组件生命周期；

10）deactivated：离开缓存组件a，或者触发a的beforeDestory和destoryed组件销毁钩子

11）mounted：访问/操作dom；

12）activated：进入缓存组件，进入a的嵌套子组件（如果有的话）；

13）执行beforeRouteEnter回调函数next

##### 2）.路由守卫作用/对比axios拦截器
刚开始接触路由导航守卫你会发现和axios拦截器有点像，实际上它们是两个不同的东西。

1.相同点

(1)都是钩子函数(回调函数的一种,到某个时机了自动触发)

(2)都是起到拦截作用

2.不同点

(1)功能不同 ：axios拦截器拦截网络请求, 导航守卫拦截路由跳转

(2)应用场景不同 :

axios拦截器一般用于发送token

导航守卫用于页面跳转权限管理(有的页面可以无条件跳转,例如登录注册页可以无条件跳转。有的页面需要满足条件才能跳转，例如购物车页面就需要用户登录才可以跳转)

### 31、slot插槽
slot 是插槽,一般在组件内部使用，在封装组件时,在组件内部不确定该位置是以何种形式的元素展示时,,我们可以通过 slot 占据这个位置,该位置的元素需要其他组件以内容形式传递过来.

slot 又分为:**默认插槽,具名插槽,作用域插槽**（前两者父传子，后者是子传父）

### 32、如何实现组件缓存
使用<keep-alive>标签，作用是创造一个缓存的空间，用于保存组件状态或者避免重新全部渲染。可以快速调用我们的缓存中的数据，从而达到提高访问速度。

常见的列表与购物车为例子，我们常常在这两个区域之间访问，每次点击不需要每次都重新渲染加载一次。

### 33、何时使用keep-alive?
keep-alive缓存vue实例，提高性能是 Vue 内置的一个组件，可以使被包含的组件保留状态，避免重新渲染 。

提供 include 和 exclude 属性，两者都支持字符串或正则表达式， include 表示只有名称匹配的组件会被缓存，exclude 表示任何名称匹配的组件都不会被缓存 ，其中 exclude 的优先级比 include高；

对应两个钩子函数 activated 和 deactivated ，当组件被激活时，触发钩子函数 activated，当组件被移除时，触发钩子函数 deactivated。



### 34、介绍一下SPA以及SPA有什么缺点？
1. 优点 

**1) ****有良好的交互体验**

能提升页面切换体验，用户在访问应用页面是不会频繁的去切换浏览页面，从而避免了页面的重新加载；

**2) ****前后端分离开发**单页Web应用可以和 RESTful 规约一起使用，通过 REST API 提供接口数据，并使用 Ajax 异步获取，这样有助于分离客户端和服务器端工作。更进一步，可以在客户端也可以分解为静态页面和页面交互两个部分；

**3) ****减轻服务器压力**服务器只用出数据就可以，不用管展示逻辑和页面合成，吞吐能力会提高几倍；

4) 共用一套后端程序代码不用修改后端程序代码就可以同时用于 Web 界面、手机、平板等多种客户端；

2. 缺点：

1) SEO难度较高由于所有的内容都在一个页面中动态替换显示，所以在SEO上其有着天然的弱势，所以如果你的站点对SEO很看重，且要用单页应用，那么就做些静态页面给搜索引擎用吧；

2) 前进、后退管理由于单页Web应用在一个页面中显示所有的内容，所以不能使用浏览器的前进后退功能，所有的页面切换需要自己建立堆栈管理，当然此问题也有解决方案，比如利用URI中的散列+iframe实现；

3) 初次加载耗时多为实现单页Web应用功能及显示效果，需要在加载页面的时候将JavaScript、CSS统一加载，部分页面可以在需要的时候加载。所以必须对JavaScript及CSS代码进行合并压缩处理；

### 35、vue和react的区别
**相同点**

+ 都有组件化思想
+ 都支持服务端渲染
+ 都有Virtual DOM(虚拟dom)
+ 数据驱动视图
+ 都有自己的构建工具

**区别**

+ 数据流向不同。react从诞生开始就推崇单向数据流，而vue是双向数据流
+ 数据变化的实现原理不同。react使用的是不可变数据，vue使用的是可变数据
+ 组件化通信不同。react中子组件向父组件我们使用的是回调函数来进行通信，而vue中子组件向父组件传递方式有两种：事件和回调函数。	

> 1. **父传子**：Vue用 `props` 且子需声明，React直接传 `props` 。
> 2. **子传父**：Vue用自定义事件，React靠回调函数。
> 3. **非父子通信**：Vue有事件总线和Vuex，React有Context API、Redux等。
> 4. **语法风格**：Vue模板驱动、指令式，React JSX驱动、函数式。
> 5. **状态管理**：Vuex与Vue深度整合，Redux需手动绑定组件。
>

+ diff算法不同。react主要使用diff队列保存需要更新哪些DOM，得到patch树，再统一操作批量更新DOM。vue使用双向指针，边对比，边更新DOM

### 36、vue3对比vue2区别
Vue 3 相比 Vue 2 优势明显：

1. **性能**：性能更高了，响应式基于 Proxy 更高效，VNode Diff 算法优化减少计算量。
2. **体积**：体积更小了，移除 filter、Event Bus 等不常用 API，支持按需导入和 Tree - Shaking。
3. **TypeScript 支持**：源码用 TS 重写，API 设计更适配，利于类型检查。
4. **开发模式**：Composition API 按逻辑组织代码，便于大型项目复用维护。
5. **新特性**：引入 Fragment 支持多根节点，Teleport 可跨位置渲染，Suspense 处理异步加载状态。



### 37、npm install执行过程
npm install命令输入 > 检查node_modules目录下是否存在指定的依赖 > 如果已经存在则不必重新安装 > 若不存在，继续下面的步骤 > 向 registry（本地电脑的.npmrc文件里有对应的配置地址）查询模块压缩包的网址 > 下载压缩包，存放到根目录里的.npm目录里 > 解压压缩包到当前项目的node_modules目录中。
