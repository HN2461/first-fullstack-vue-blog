---
title: "Vue 面试题详解"
slug: "vue-9af82b75-revision-20260730"
summary: "Vue 框架核心概念面试题，包括虚拟DOM、diff算法、MVVM原理等详细解析。"
category: "面试"
tags:
  - "Vue"
  - "前端框架"
  - "虚拟DOM"
  - "MVVM"
status: "draft"
sortOrder: 80
cover: ""
originalId: "6a2d291f8a2b1c68f2cac684"
originalSlug: "vue-9af82b75"
originalStatus: "published"
exportedAt: "2026-07-30T13:20:22.058Z"
---
## Vue2 面试题

### 1、vue功能是什么，跟传统开发有什么区别？

#### vue功能是什么

Vue 是一套用于构建用户界面的渐进式框架。它具有响应式数据绑定、组件化开发、虚拟 DOM 等功能。可以高效地更新和渲染页面，实现数据与视图的自动同步。

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

1. 将DOM树转换成JS对象树，产生第一个虚拟DOM树（与真实DOM树一样）
2. 数据发生变化时（当你有增删操作）产生第二个虚拟DOM树
3. **diff算法**逐层比较两个虚拟DOM树并标记增删操作（不会渲染）
4. 将标记出来的差异（虚拟节点）应用到真正的 DOM 树，而不是将整个虚拟DOM树覆盖到真正的DOM树上

### 4、diff算法
Diff 算法是一种对比算法，用于对比旧虚拟 DOM 和新虚拟 DOM。它的作用是找出发生变化的虚拟节点，然后只更新这个虚拟节点对应的真实节点，而不更新其他数据未发生改变的节点。这样可以实现精准地更新真实 DOM，从而提高效率。

在新老虚拟 DOM 对比时：

1. 首先，对比key，判断是否为同一key，如果不为key，则删除该节点重新创建节点进行替换；
2. 如果为相同的key，则继续进行有无节点的比对，如果没有，则创建，如果有则进行 updateChildren，判断如何对这些新老节点的子节点进行操作（diff 核心）。

总结：匹配时，找到相同的子节点，递归比较子节点

### 5、MVVM

#### （1）、对MVVM的理解？

- **M** ==> model（数据模型）
- **V** ==> view（代表UI组件，负责将数据转换为UI展现出来）
- **VM** ==> ViewModel，在MVVM架构下，View和Model没有直接的关系，而是通过ViewModel进行交互的，Model和ViewModel之间的交互是相互的，所以view数据的变化会同步到Model上，而Model的变化也会同步到View上

#### （2）、MVVM与MVC的区别是什么

MVC：传统的设计模式。M：model模型，V：View视图，C：controller控制器

MVVM：我们vue所用的设计模式，**数据双向绑定，让数据自动地双向同步不需要操作dom。**

- **M**：model数据模型 (data里定义)
- **V**：view视图 （页面标签）
- **VM**：ViewModel视图模型 (vue.js源码)

### 6、一个.vue文件由几部分组成，分别什么含义

由三部分组成：

- `<template>`：所需要渲染的区域
- `<script>`：存放引入的资源与业务实现的数据与操作
- `<style>`：存放界面css的样式

### 7、data为什么必须是一个函数？

**根本原因**：每次调用产生一个新的地址空间，防止数据被污染

我们对象是引用类型数据，处理的是内存当中的地址。当我们引用 data 多个组件会对 data 的堆内值进行更改，组件与组件之间的数据会相互影响。

当我们 data 是函数的话，则会每次引用的时候都会返回一个新的地址，确保各组件的数值不会相互影响。

### 8、computed、watch、methods

#### （1）、computed（计算属性）与 watch（侦听器）的区别？

1. 计算属性可以被缓存，侦听属性不能被缓存。
2. 侦听属性可以包含异步任务，计算属性不行。
3. 计算属性通常由一个或多个响应式数据计算出一个值返回；侦听属性通常是监听一个数据的变化，由这一个数据的变化可能影响到另外的一个或多个数据的变化。
4. 计算属性中的函数必须要用 return 返回，侦听器不用。
5. computed 默认第一次加载的时候就开始监听；watch 默认第一次加载不做监听，如果需要第一次加载做监听，添加 immediate 属性，设置为 true（`immediate: true`）。

**应用场景：**

当页面中有某些数据依赖其他数据进行变动的时候，可以使用计算属性 computed。

watch 用于观察和监听页面上的 vue 实例，如果要在数据变化的同时进行异步操作或者是比较大的开销，那么 watch 为最佳选择。

#### （2）、computed、methods 区别？

我们可以将同一函数，定义为一个 method 或者一个计算属性。对于最终的结果，两种方式是相同的。依赖不变则直接取缓存结果，避免重复计算。

**不同点：**

- **computed**：计算属性是基于它们的依赖进行缓存的，只有在它的相关依赖发生改变时才会重新求值。
- **methods**：方法每次调用或页面重渲染时都会执行函数，可能有不必要计算开销。

### 9、vue指令？

- `v-html`：渲染HTML内容
- `v-text`：渲染文本内容
- `v-bind`：绑定动态数据，简写 `:`
- `v-on`：绑定事件，简写 `@`
- `v-for`：循环，vue2中v-for的优先级高于v-if，不推荐一起使用
- `v-if`：条件渲染指令，如果是真则渲染节点，否则不渲染节点
- `v-if`、`v-else`、`v-else-if`：类似js的if...else判断语句
- `v-show`：通过display:none控制元素显示隐藏
- `v-model`：双向绑定，用于表单
- `v-pre`：主要用来跳过这个元素和它的子元素编译过程
- `v-cloak`：保持在元素上直到关联实例结束时进行编译
- `v-once`：关联的实例只会渲染一次，之后重新渲染时实例及其子节点将被视为静态内容跳过，可用于优化更新性能

### 10、ref的作用？

- 获取dom元素：`this.$refs.box`
- 获取子组件，从而可以获取到子组件的数据以及方法，Vue3需要子组件同意

### 11、v-if与v-show区别？

- `v-show`：通过css中的 `display` 控制显示和隐藏
- `v-if`：组件真正的渲染和销毁，而不是显示和隐藏

总结：频繁切换状态使用 `v-show`，否则使用 `v-if`

### 12、vue.js两个核心是什么？
数据驱动和组件化

### 13、关于 key 的面试题

#### （1）、为何 v-for 要使用 key？

快速查找到节点，减少渲染次数，提升渲染性能。

#### （2）、Vue 中 Key 值作用

key 值的作用是给元素添加一个唯一的标识符，提高 vue 渲染性能。当数据变化的时候，vue 就会使用 diff 算法对比新旧虚拟 Dom。如果遇到相同的 key 值，则复用元素。如果遇到不同的 key 值则强制更新。

#### （3）、用 Index 作为 key，可能会引发的问题？

1. 若对数据内容进行逆序的添加删除等破坏顺序的操作：会产生没有必要的真实 DOM 的更新，界面效果没有问题，但是效率低。
2. 如果界面中含有输入类的 DOM，会产生错误的 DOM 更新，界面有问题。

![](https://cdn.nlark.com/yuque/0/2025/png/50923934/1743599596159-f7d0f8fc-b59f-487f-ade1-82e8672ab1ed.png)

![](https://cdn.nlark.com/yuque/0/2025/png/50923934/1743599602467-568606c5-e6f1-4a2e-9afe-1e4b9ac8f9d0.png)

### 14、$set 是干什么用的？

给对象或者数组增加新的响应式数据：`vm.$set(obj, "key", "value")` 或者用 `Vue.set(obj, "key", "value")` 也可以。

### 15、scoped 作用与原理

**作用**：组件 css 作用域，避免子组件内部的 css 样式被父组件覆盖，默认情况下，如果子组件和父组件 css 选择器权重相同，优先加载父组件 css 样式。

**原理**：给元素添加一个自定义属性 `v-data-xxxxx`，通过属性选择器来提高 css 权重值。

### 16、Vue 中如何做样式穿透

在 Vue 项目中经常需要使用到组件库，遇到需要修改组件库组件的样式时通常会使用样式穿透。

**vue2 语法提供 3 种**：`>>>`、`/deep/`、`::v-deep`

```css
父组件选择器 >>> 子组件选择器 { 子组件样式 }
/deep/ 子组件选择器 { 子组件样式 }
::v-deep 子组件选择器 { 子组件样式 }
```

**vue3 语法提供 2 种**：`:deep()`、`::v-deep()`

```css
:deep(子组件选择器) { 子组件样式 }
::v-deep(子组件选择器) { 子组件样式 }
```

经测试，这五种穿透语法在 vue2 和 vue3 中都兼容。

### 18、生命周期相关面试题

#### （1）、什么是 vue 生命周期？

Vue 实例从创建到销毁的过程，就是生命周期。

从开始创建、初始化数据、编译模板、挂载 Dom → 渲染、更新 → 渲染、销毁等一系列过程，称之为 Vue 的生命周期。

#### （2）、vue 生命周期的作用是什么？

它的生命周期中有多个事件钩子，让我们在控制整个 Vue 实例的过程时更容易形成好的逻辑。

1. 在不同阶段执行特定的代码：例如在 created 阶段可以进行数据初始化，在 mounted 阶段可以进行 DOM 操作等。
2. 方便进行资源管理：在 beforeDestroy 和 destroyed 阶段可以清理定时器、取消订阅等，避免资源浪费和内存泄漏。
3. 实现组件间的协调：可以在特定生命周期阶段触发父组件与子组件之间的交互。

#### （3）、单组件生命周期

vue 生命周期分为几个阶段，几个钩子函数，分别写出来：

- **初始化阶段**：beforeCreate、created
- **挂载阶段**：beforeMount、mounted
- **更新阶段**：beforeUpdate、updated
- **销毁阶段**：beforeDestroy、destroyed

#### （4）、父子组件生命周期

- **挂载过程中**：父组件执行到 beforeCreate、created、beforeMount 阶段后，子组件开始挂载。子组件先完成 mounted，父组件随后完成挂载。
- **更新过程中**：父组件执行到 beforeUpdate 阶段后，子组件开始更新。子组件先完成 updated，父组件随后完成更新。
- **销毁过程中**：父组件执行到 beforeDestroy 阶段后，子组件开始销毁。子组件先完成 destroyed，父组件随后完成销毁。

#### （5）、vue 生命周期有哪些？分别在哪些场景中使用？

**beforeCreate**

创建前，访问不到 data 当中的属性以及 methods 当中的属性和方法，可以在当前生命周期创建一个 loading，在页面加载完成之后将 loading 移除。

**created**

创建后，当前生命周期执行的时候会遍历 data 中所有的属性，给每一个属性都添加一个 getter、setter 方法，将 data 中的属性变成一个响应式属性，在这个阶段可以**请求，最早处理数据的阶段**。

**beforeMount**

模板与数据进行结合，但是还没有挂载到页面上。

**mounted**

当前生命周期数据和模板进行相结合，并且已经挂载到页面上了，因此我们可以在当前生命周期中获取到真实的 DOM 元素，也可以在这发起后端请求，拿回数据，做一些页面渲染。

**beforeUpdate**

当数据发生改变的时候当前生命周期就会执行，因此我们可以通过当前生命周期来检测数据的变化，当前生命周期执行的时候会将更新的数据与模板进行相结合，但是并没有挂载到页面上，因此我们可以在当前生命周期中做更新数据的最后修改。

**updated**

数据与模板进行相结合，并且将更新后的数据挂载到了页面上。因此我们可以在当前生命周期中获取到最新的 DOM 结构。

**beforeDestroy**

当前生命周期中我们需要做**事件的解绑、监听的移除、定时器的清除**等操作。

**destroyed**

当前生命周期执行完毕后会将 vue 与页面之间的关联进行断开。

**路由组件独有的两个新的生命周期**

`<keep-alive>` **包裹的路由组件**，该组件有两个特有的生命周期函数：`activated` 和 `deactivated`。

- `activated`：在路由组件**被激活时触发**（活跃状态：进入页面的时候）
- `deactivated`：在路由组件**失活时触发**

**$nextTick**：在下一次 dom 渲染后执行。

#### （6）、第一次页面加载会触发哪几个钩子？

第一次页面加载时会触发 beforeCreate、created、beforeMount、mounted 这几个钩子。

#### （7）、created 和 mounted 的区别

**created**：在模板渲染成 html 前调用，即通常初始化某些属性值，然后再渲染成视图。

**mounted**：在模板渲染成 html 后调用，通常是初始化页面完成后，再对 html 的 dom 节点进行一些需要的操作。

#### （8）、什么阶段操作 dom（什么时候可以获得到 dom）

在钩子函数 mounted 被调用前，Vue 已经将编译好的模板挂载到页面上，所以在 mounted 中可以访问操作 DOM。

#### （9）、在生命周期中什么时候可以获得到数据

created：完成了 data 数据的初始化。

#### （10）、何时使用 beforeDestroy？

1. 解绑自定义事件
2. 清零定时器
3. 解除监听

#### （11）、发送请求在 created 还是在 mounted

建议放在 created 里。

**created**：在模板渲染成 html 前调用，即通常初始化某些属性值，然后再渲染成视图。

**mounted**：在模板渲染成 html 后调用，通常是初始化页面完成后，再对 html 的 dom 节点进行一些需要的操作。如果在 mounted 钩子函数中请求数据可能导致页面闪屏问题。

其实就是加载时机问题，放在 created 里会比 mounted 触发早一点，如果在页面挂载完之前请求完成的话就不会看到闪屏了。

#### （12）、$nextTick 的作用是什么？

在下次 DOM 更新循环结束之后执行延迟回调。在修改数据之后立即使用这个方法，获取更新后的 DOM。

例如：在 created 生命周期中想要操作 dom 就可以使用 `this.$nextTick(() => { ... })`，可以在 mounted 之前的生命周期中操作 dom。

$nextTick 通常用于在数据变化后等待 DOM 更新完成，然后再执行一些操作，比如获取更新后的 DOM 元素的属性或进行一些依赖于 DOM 状态的操作。它可以确保在 DOM 更新后执行回调函数，以避免在数据尚未完全同步到 DOM 时进行操作可能导致的错误。

#### （13）、vue 为何是异步渲染？

因为如果不采用异步更新，那么每次更新数据都会对当前组件进行重新渲染，所以考虑性能问题，Vue 会在本轮数据更新之后，再去异步更新视图。

"异步渲染" 指的是在处理页面渲染时不是立即进行，而是采用非同步的方式，可能会将渲染任务放入队列中，在合适的时候再执行，以提高性能和用户体验。例如，当数据发生变化时，Vue 不会立即重新渲染整个页面，而是先收集这些变化，然后在合适的时机进行统一的渲染，这样可以避免频繁的重绘和重排，减少性能开销。

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

**兄弟关系的组件数据传递可选择 $bus，消息订阅与发布，**

**祖先与后代组件数据传递可选择 `attrs` 与 `listeners` 或者 `Provide` 与 `Inject`**

**复杂关系的组件数据传递可以通过 `vuex` 存放共享的变量**

#### （2）、详细说一下每一种组件通讯方式

##### 1）、父组件向子组件传递数据 -- 使用 props

**功能**：让组件接收外部传过来的数据。

**传递数据**：直接在组件标签内写属性。

**接收数据**：

```javascript
// 第一种：只接收
props: ['name']

// 第二种：限定类型
props: {
  name: String
}

// 第三种：限定类型 + 限制必要性 + 指定默认值
props: {
  name: {
    type: String,     // 类型
    required: true,   // 必要性
    default: '老王'    // 默认值
  }
}
```

备注：props 是只读的，Vue 底层会监视你对 props 的修改，如果进行了修改，就会发出警告，若业务需求确实需要修改那么复制 props 的内容到 data 中一份，然后去修改 data 中的数据。

##### 2）、子组件向父组件传递数据 -- 可以通过自定义事件

通过父组件给子组件绑定一个自定义事件，子触发自定义事件给父传递数据。

##### 3）、ref 链

父组件要给子组件传值，在子组件上定义一个 ref 属性，这样**通过父组件的 `$refs` 属性**，就可以获取子组件的值了，也可以进行父子、兄弟之间的传值（`$parent` / `$children` 与 ref 类似）。

##### 4）、兄弟组件通信 -- 使用全局事件总线（$bus）

**安装全局事件总线：**

```javascript
new Vue({
  // .....
  beforeCreate() {
    Vue.prototype.$bus = this // 安装全局事件总线，$bus 就是当前应用的 vm
  },
  // ....
})
```

**使用方式：**

- 接收数据：`this.$bus.$on('xxx', this.demo)` // 绑定事件
- 提供数据：`this.$bus.$emit('xxx', 数据)` // 触发事件

##### 5）、使用消息订阅与发布 -- 适用于任意组件通信

**使用步骤：**

1. 安装 pubsub：`npm i pubsub-js`
2. 引入：`import pubsub from 'pubsub-js'`
3. 接收数据：A 组件想要接收数据，则在 A 组件中订阅消息，订阅的回调留在 A 组件自身
4. 提供数据：`pubsub.publish('xxx', 数据)`

##### 6）、vuex

搭建环境，数据写在 vuex 中，所有组件共享。

### 20、双向绑定 v-model 的实现原理

双向数据绑定最核心的方法便是通过 **`Object.defineProperty()` 来实现对属性的劫持**，达到监听数据变动的目的。

首先是从 data 里面的数据通过绑定到 input 控件上，然后在 input 上通过 input 监听控件，触发 change 事件。

然后，调用方法都可以默认获取 e 事件，`e.target.value` 是获取调用该方法的 dom 对象上的 value 值。

最后，把 value 值赋给 data 里面的初始数据，从而实现双向数据绑定的原理。

### 21、props、data、computed、watch的优先级？

`props` ==> `methods` ==> `data` ==> `computed` ==> `watch`

小tips：这些变量名可以相同，模板会自动按优先级决定 使用哪个

### 22、vue 常见的性能优化

1. 合理使用 v-if 和 v-show：根据不同场景选择合适的指令来控制元素的显示与隐藏，以提高性能。
2. 合理使用 computed：利用计算属性缓存结果，避免重复计算，提升性能。
3. 使用 v-for 的时候动态添加 key：有助于 Vue 更高效地更新列表。
4. 自定义事件，dom 事件在 beforeDestroy 中及时销毁：避免内存泄漏，提高性能。
5. 合理使用异步组件：按需加载组件，减少初始加载时间。
6. 合理使用 keep-alive：缓存组件状态，减少重新渲染次数。
7. data 层级不要太深：避免数据访问时的性能开销。
8. 使用 vue-loader 在开发环境做编译模板：提高开发效率和性能。

> vue-loader 是一个用于 Webpack 的加载器，它允许你以一种更便捷的方式处理 Vue 单文件组件（.vue 文件）。

9. 前端通用性能优化：包括图片懒加载减少加载时的资源消耗；减少 HTTP 请求以降低网络开销；合理设置 HTTP 缓存提高资源复用；资源合并与压缩减少文件体积和请求次数；合并 CSS 图片减少请求；将 CSS 放在 header 中使页面更快呈现；避免重复的资源请求提高效率；切分到多个域名利用浏览器并发请求机制。

### 23、vuex 有关面试题

#### （1）、vuex 是什么？怎么使用？哪种功能场景使用它？

**vuex 是什么？**

Vuex 是一个专为 Vue.js 应用程序开发的状态管理模式。它采用集中式存储管理应用的所有组件的状态。

**场景**：多个组件共享数据或者是跨组件传递数据时，比如：单页应用中，组件之间的状态、音乐播放、登录状态、加入购物车。

**怎么使用？**

安装 Vuex，注册使用、创建 store.js 文件，根据需要创建 state（状态）、actions（动作）、mutations（变化）、getters（获取器）、module（模块）等，最后将其引入到 main.js 文件中，并在 Vue 的实例创建中进行注册。

**vuex 的流程**

页面通过 mapAction 异步提交事件到 action。action 通过 commit 把对应参数同步提交到 mutation，mutation 会修改 state 中对应的值。getter 把对应 state 中值计算出新值。可以在页面中拿到 vuex 中 state、getter 的数据。

> mapAction 指的是一种在 Vue.js 框架中用于将页面中的事件异步提交到 action 的方法。它允许页面通过特定的方式调用定义在 Vuex 中的 action，从而触发一系列的数据操作和状态更新。

#### （2）、vuex 的 store 有几个属性？分别讲讲它们的作用是什么？

有五种，分别是 **State**、**Getter**、**Mutation**、**Action**、**Module**

- **state**：vuex 的基本数据，用来存储变量
- **getter**：从基本数据（state）派生的数据，相当于 state 的计算属性
- **mutation**：提交更新数据的方法，必须是同步的（如果需要异步使用 action）。每个 mutation 都有一个字符串的事件类型（type）和一个回调函数（handler）。回调函数就是我们实际进行状态更改的地方，并且它会接受 state 作为第一个参数，提交载荷作为第二个参数。
- **action**：和 mutation 的功能大致相同，不同之处在于：1. Action 提交的是 mutation，而不是直接变更状态。2. Action 可以包含任意异步操作。
- **modules**：模块化 vuex，可以让每一个模块拥有自己的 state、mutation、action、getters，使得结构非常清晰，方便管理。

#### （3）、页面刷新后 vuex 的 state 数据丢失怎么解决？

F5 页面刷新，页面销毁之前的资源，重新请求，因此写在生命周期里的 vuex 数据是重新初始化，无法获取的，这也就是为什么会打印出空的原因。

**解决思路 1**：

使用 localStorage、sessionStorage 或者是 cookie。实际使用 vuex 值变化时，H5 刷新页面，vuex 数据重置为初始状态，所以还是要用到 localStorage。

**解决思路 2**：

使用插件 vuex-persistedState。vuex-persistedState 默认持久化所有的 state，可以指定需要持久化的 state。

#### （4）、使用vuex的优势是什么？
1. 可作为全局变量来使用，方便在不同组件之间共享数据。
2. 针对 Vue 的单向数据流特点，建立“全局仓库”，能减少开发中的“传参地狱”问题，即避免了复杂的数据传递过程。
3. 虽然 Vuex 的所有功能可以通过其他方式实现，但它对这些方法进行了整合处理，使用起来更加便捷，同时也便于维护。

#### （5）、vue 中 ajax 请求代码应该写在组件的 methods 中还是 vuex 的 action 中？

如果请求的数据是多个组件共享的，为了方便只写一份，就写 vuex 里面，如果是组件独用的就写在当前组件里面。

如果请求来的数据不是要被其他组件公用，仅仅在请求的组件内使用，就不需要放入 vuex 的 state 里。

如果被其他地方复用，请将请求放入 action 里，方便复用，并包装成 promise 返回。

#### （6）、怎么监听 vuex 数据的变化？

可以用计算属性、用 watch 监听。

#### （7）、vuex 使用 actions 时不支持多参数传递怎么办？

放在对象里面。

#### （8）、你觉得 vuex 有什么缺点？

页面刷新时会使 state 的数据初始化。

#### （9）、你觉得要是不用 vuex 的话会带来哪些问题？

不使用 vuex 会带来的问题：

1. **组件之间传值麻烦复杂**，意味着在不使用 vuex 的情况下，组件之间传递数据会变得困难，不像使用 vuex 时可以较为方便地管理和传递数据。
2. **可维护性下降**，因为修改数据时需要在多个地方进行维护，增加了维护的工作量和难度。
3. **可读性下降**，由于一个组件里的数据来源不清晰，难以快速理解数据是从何处产生的。
4. **会增加耦合**，大量的上传派发操作会使耦合性大大增加，而 Vue 使用 Component 的目的本来是为了减少耦合，不使用 vuex 的做法与组件化的初衷相背离。
2. **可维护性下降**，因为修改数据时需要在多个地方进行维护，增加了维护的工作量和难度。
3. **可读性下降**，由于一个组件里的数据来源不清晰，难以快速理解数据是从何处产生的。
4. **会增加耦合**，大量的上传派发操作会使耦合性大大增加，而 Vue 使用 Component 的目的本来是为了减少耦合，不使用 vuex 的做法与组件化的初衷相背离。

**（10）、使用 Vuex 只需执行 Vue.use(Vuex)，并在 Vue 的配置中传入一个 store 对象的实例，store 是如何实现注入的？**

`Vue.use(Vuex)` 这一操作实际上是调用了 Vuex 的 `install` 方法，该方法会对 Vue 实例对象的初始化过程进行封装和注入，把传入的 `store` 对象设置到 Vue 上下文环境里，这样在 Vue 组件的任意位置都能通过 `this.$store` 来访问该 `store`。

**（11）、vuex怎样赋值？vuex存储数据的方法有哪些？**

Vuex 赋值方式主要有：

1. **mutations**：是修改状态的唯一同步方式，在组件里用 `store.commit` 触发。
2. **actions**：可含异步操作，通过触发 `mutations` 改状态，组件用 `store.dispatch` 触发。

Vuex 存储数据主要有两种方法：

+ **commit**：用于同步操作，直接修改 `state`。语法为 `this.$store.commit('mutations 方法名', 值)`。
+ **dispatch**：用于异步操作，先进行异步处理，再通过 `commit` 修改 `state`。语法为 `this.$store.dispatch('actions 方法名', 值)`。

#### （12）、Vuex是单向数据流还是双向数据流？

Vuex 是单向数据流的一种实现

#### （13）、怎么在组件中批量使用Vuex的state状态？
答:使用mapState辅助函数, 利用对象展开运算符将state混入computed对象中

```javascript
import {mapState} from 'vuex' 
export default{
 computed:{ 
  ...mapState(['price','number']) 
 } 
}
```

#### （14）、你有使用过vuex的module吗？主要是在什么场景下使用？
答：把状态全部集中在状态树上，非常难以维护。按模块分成多个module，状态树延伸多个分支，模块的状态内聚，主枝干放全局共享状态

### 24、说说vue动态组件？

动态组件是指：在一个挂载点使用多个组件，并进行动态切换。什么是挂载点？可以简单的理解为页面的一个位置。最常见的就是：tab的切换功能。

在vue要实现这个功能通常用两种方式。一是使用 `<component>` 元素的 `is` 特性，二是使用 `v-if`。

### 25、Vue 中有时候数组会更新页面，有时候不更新为什么

因为 vue 内部只能监测到**数组顺序/位置的改变/数量的改变**，但是值被重新赋予监测不到变更，可以用 `Vue.set()` / `vm.$set()`。

这些方法会触发数组改变，v-for 会监测到并更新页面：

`push()` / `pop()` / `shift()` / `unshift()` / `splice()` / `sort()` / `reverse()`

### 26、mixin是干什么的？

mixin提供了一种非常灵活的方式，来分发 Vue 组件中的**可复用功能**。一个混入对象可以包含任意组件选项。当组件使用混入对象时，所有混入对象的选项将被“混合”进入该组件本身的选项。

```javascript
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

1. **第一步：提取**

单独定义一个mixin.js（一般和main.js在同级目录），代码如下：

```javascript
//创文件并导出
export const getmsgMixins = {
  methods: {
    getmsg() {
      console.log(this.name, this.age);
    },
  },
};
```

2. **第二步：引入并使用**

```javascript
<script>
// 混入第二步、引入并使用
import { getmsgMixins } from '../mixins.js'
export default {
    name: 'son',
    data() {
        return {
            name: '章三',
            age: 18,
        }
    },
    //混入第三步 使用mixins
    mixins: [getmsgMixins]
    // 混入第一步、提取  将逻辑代码提取到单独的minxis.js中
    // methods: {
    //     getmsg() {
    //         console.log(this.name,this.age);
    //     }
    // }
}
</script>

```

### 27、vue获取DOM
1、通过‘el属性：在Vue实例中，通过‘el` 属性可以访问当前组件所对应的 DOM 元素

```javascript
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

```javascript
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

```javascript
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

#### （1）、axios 的请求方式

实现 axios 的二次封装：[https://blog.csdn.net/m0_61118311/article/details/129202465](https://blog.csdn.net/m0_61118311/article/details/129202465)

- **get 请求**：常用于获取数据
- **post 请求**：常用于提交表单数据和上传文件
- **put 请求**：对数据进行全部更新
- **patch 请求**：修改部分数据
- **delete 请求**：常用于删除操作（参数可以放在 url 上也可以和 post 一样放在请求体中）

delete请求(常用于删除操作(参数可以放在url上也可以和post一样放在请求体中)

#### （2）、axios拦截器（Interceptors）主要分为：
（1）请求拦截器：在发送请求前进行拦截，可以根据发送的**请求参数**做一些发送参数的调整，例如设置headers

（2）响应拦截器：在后台返回响应时进行拦截，可以**根据状态码进入下一步处理**。例如：登录失效跳转回登录页。

项目需求：根据后台返回的状态码，统一处理。例如：token失效，回到登录页面；返回错误，给出统一的错误提示。

### 29、vue中解决跨域做法
#### （1）、跨域
使用CORS （Cross-Origin Resource Sharing，跨域资源共享）是一个系统，它由一系列传输的HTTP头组成，这些HTTP头决定浏览器是否阻止前端 JavaScript 代码获取跨域请求的响应。

所谓同源（即指在同一个域）具有以下三个相同点，协议相同（protocol），主机相同（host），端口相同（port）

反之非同源请求，也就是**协议、端口、主机**其中一项不相同的时候，这时候就会产生跨域。

#### （2）、vue2里的跨域
在前端服务和后端接口服务之间架设一个**中间代理服务**，它的地址保持和前端服务一致，

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
    - (1) push 模式:	有历史记录	router.push ({}}
    - (2) replace 模式:	router.replace ({}) 	无历史记录
    - (3) 前进:	router.forward ()
    - (4) 后退:	router.back ()
    - 前进或后退几步:router.go ( )

#### （3）、路由的两种模式（/hash与history的区别）
路由器（vue-router）有两种工作模式：hash模式和history模式，默认是hash模式。

“hash 和 history 的不同”主要有以下几点：

1. hash 模式的 URL 中带有“#”，history 模式不带“#”。
2. 若想让 URL 更加规范，适合开发的话推荐使用 history 模式，因为它是一个正常的 URL。
3. 使用 Vue 或 React 做的页面想分享到第三方 app 时，如果有的 app 规定 URL 中不能带“#”，就只能使用 history 路由模式。
4. hash 模式所有浏览器天生支持，而 history 模式内部使用的是 H5 中提供的 API，兼容性没有 hash 模式好。
5. history 模式如果没有对应的路由规则，可能会发起一个真正的请求，需要后端来处理，否则会产生 404 错误。

#### （4）、动态路由一般用在哪里的
动态路由的使用，一般用在detail详情页加载页面信息上。比如说有很多个商品，需要加载其中某个商品是详情页信息，就需要在路径后面带一个参数（id）,来识别要具体加载的哪个商品信息，这就用到了动态路由。

#### （5）、路由
vue的单页面应用是基于路由和组件的，路由用于设定访问路径，并将路径和组件映射起来。传统的页面应用，是用一些超链接来实现页面切换和跳转的。在vue-router单页面应用中，则是路径之间的切换，实际上就是组件的切换。

路由就是SPA（单页应用）的路径管理器。再通俗的说，vue-router就是我们WebApp的链接路径管理系统。

#### （6）、 router.addRoutes里面传什么
动态添加更多的路由规则。参数必须是一个符合 routes 选项要求的数组。router.addRoutes()这个方法更多可以用来做权限管理

#### （7）、路由传参的方式
query传参和params传参

（1）声明式导航

不带参跳转对应的地址为/foo

url **字符串拼接**传参 对应的地址为/foo?id=123

query方式**对象形式传参** 对应的地址为/foo?id=123

params方式对象形式传参 对应地址为/path/123 , 注意params和query一起使用params会失效



(2）编程式导航(路由实例对象router=new VueRouter())

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
路由守卫用于控制路由切换，分三类：

1. **全局路由守卫**：
    - `router.beforeEach`：路由切换前触发，用于全局权限验证等。
    - `router.beforeResolve`：所有组件内守卫和异步组件解析后触发。
    - `router.afterEach`：路由切换完成后触发，用于日志记录等。
2. **路由独享守卫**：`beforeEnter`，定义在具体路由配置中，进入该路由时触发。
3. **组件内守卫**：
    - `beforeRouteEnter`：路由进入组件前触发，无法直接访问 `this`。
    - `beforeRouteUpdate`：路由复用且参数变化时触发，可访问 `this`。
    - `beforeRouteLeave`：离开组件对应路由时触发，可提示保存数据。

**从a页面进入b页面时触发的生命周期**

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

**相同点**

1. **钩子函数机制**：均为特定时机自动触发的回调函数（钩子）。
2. **拦截控制**：通过钩子函数对流程进行拦截、修改或终止。

#### **不同点**
| **维度** | **路由守卫** | **axios 拦截器** |
| :--- | :--- | :--- |
| **功能定位** | 拦截 **路由跳转流程**，控制页面切换 | 拦截 **HTTP 请求 / 响应流程**，处理网络数据 |
| **应用场景** | 权限验证、登录态检查、动态路由加载等 | 请求头加 Token、数据格式转换、错误统一处理等 |
| **作用范围** | 路由层（Vue Router/React Router 等） | HTTP 层（axios 网络请求全流程） |
| **触发时机** | 路由切换的**导航前、导航中、导航后** | 请求**发送前（config）、响应后（data）** |


导航守卫用于页面跳转权限管理(有的页面可以无条件跳转,例如登录注册页可以无条件跳转。有的页面需要满足条件才能跳转，例如购物车页面就需要用户登录才可以跳转)

### 31、slot插槽
slot 是插槽,一般在组件内部使用，在封装组件时,在组件内部不确定该位置是以何种形式的元素展示时,,我们可以通过 slot 占据这个位置,该位置的元素需要其他组件以内容形式传递过来.

slot 又分为:**默认插槽,具名插槽,作用域插槽**（前两者父传子，后者是子传父）

### 32、如何实现组件缓存
**实现方式**：通过 Vue 的 `<keep-alive>` 标签包裹目标组件（如 `<router-view>`），创建缓存空间，避免组件重复渲染。可以快速调用我们的缓存中的数据，从而达到提高访问速度。

常见的列表与购物车为例子，我们常常在这两个区域之间访问，每次点击不需要每次都重新渲染加载一次。

### 33、何时使用keep-alive?
`keep-alive` 是 Vue 内置组件，可缓存 Vue 实例提升性能，可以使被包含的组件保留状态，避免重新渲染。

1. **属性功能**
    - `include`：支持字符串或正则表达式，只有名称与之匹配的组件会被缓存。
    - `exclude`：支持字符串或正则表达式，名称与之匹配的组件不会被缓存。
2. **属性优先级**：`exclude` 优先级高于 `include`，若组件同时符合两者匹配条件，以 `exclude` 规则为准，该组件不被缓存。
3. **钩子函数**
    - `activated`：组件被激活时触发此钩子函数。
    - `deactivated`：组件被移除时触发此钩子函数。

**适用场景**：频繁切换或需保留状态的组件。

### 34、介绍一下SPA以及SPA有什么缺点？

**定义**：仅加载一个HTML页面，通过动态更新内容（如JS替换页面元素）实现导航，数据交互依赖后端API。

#### 核心优点
1. **交互流畅**：页面切换无刷新，体验接近本地应用，减少等待时间。  
2. **前后端分离**：前端专注交互逻辑，后端提供数据接口，分工明确，开发效率高。  
3. **服务器压力小**：服务器只需返回数据（非完整页面），提升响应速度和吞吐量。  
4. **多端适配便捷**：一套后端代码可支持Web、App等多客户端，降低开发成本。

#### 主要缺点
1. **SEO不友好**：动态内容难被搜索引擎抓取，需SSR/SSG等额外技术优化。  
2. **路由历史复杂**：依赖前端手动管理页面堆栈，无法直接使用浏览器原生前进/后退功能。  
3. **首屏加载慢**：需一次性加载大量JS/CSS资源，初次访问耗时较长，需代码压缩或按需加载。  
4. **前端逻辑臃肿**：复杂应用中代码维护难度高，性能易受内存占用、组件重渲染影响。  
5. **网络依赖性强**：数据需实时请求，网络不稳定时页面响应延迟，影响体验。


**适用场景**：适合交互复杂、对体验要求高的应用（如Web后台、富交互工具），但需权衡SEO和首屏性能问题。

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
1. **检查依赖是否存在**：  
首先检查项目 `node_modules` 目录中是否已存在目标依赖，若存在则直接跳过安装（除非强制重新安装）。  
2. **查询模块地址**：  
若依赖不存在，通过 `registry` 地址（配置在本地 `.npmrc` 文件中）查询目标模块压缩包的下载地址。  
3. **下载与缓存**：  
将模块压缩包下载到项目根目录的 `.npm` 目录（npm 缓存目录）中。  
4. **解压与安装**：  
将缓存的压缩包解压到 `node_modules` 目录，完成依赖安装。

**核心逻辑**：按需下载，优先使用已存在的依赖，通过 registry 获取资源并缓存解压，最终构建项目依赖环境。

## Vue3 面试题
### Vue3 相比 Vue2 的改进（通俗版）
Vue3 相比 Vue2 的改进可以总结为以下几点：

1. **更快**：
    - Proxy 代理：Vue2 的响应式像“逐个监听保险箱”（每个属性单独监听）
    - Vue3 的 Proxy 像“直接监控整个房间”（监听整个对象变化）。
    - 编译优化：Vue3 在**编译阶段**标记哪些是动态内容（如 {{ count }}），更新时跳过静态内容（如纯文字）。
2. **更小**：
    - **Tree-shaking**：只打包实际使用到的功能，减小最终的代码体积。
3. **更好用**：
    - **Composition API**：通过函数组合逻辑，使代码更灵活、易复用。
    - **新组件**：
        * `<Teleport>`：可将组件渲染到指定位置，（比如弹窗放到 body 下，避免被父组件样式影响）。
        * `<Suspense>`：处理异步加载时的状态，优雅显示加载动画。

总结：Vue3 在性能、功能和开发体验上都做了显著提升，特别适合复杂应用和组件复用的场景。



### 为什么要用 Composition API？
1. **逻辑复用更方便**：相比于 Options API 将代码**按类型分块**（如 data、methods），Composition API 让你在 `setup()` 中按**功能组织代码**，增强了**逻辑的可复用性和模块化**。例如，把"搜索功能"相关的代码集中在一起，方便管理和共享。
2. **更清晰的代码结构**：在复杂组件中，逻辑分散在多个生命周期钩子和方法中，难以维护。Composition API 将相关功能的代码集中，**提升了代码的可读性和可维护性。**
3. **更好的灵活性**：类似 React 的 Hooks，Composition API **使得状态和副作用的管理更直观，**尤其在组件逻辑较为复杂时，提供了更高的灵活性。

**总结**：Composition API 适合复杂组件和需要逻辑复用的场景，它使得代码更模块化、可维护，提升了开发体验。

### Vue3 如何实现数据变化自动更新视图？
在 Vue3 中，**数据变化自动更新视图**是通过 **Proxy 代理** 实现的。Proxy **能拦截对象的所有操作**，包括读取 (`get`)、写入 (`set`)、删除 (`deleteProperty`) 等。当数据变化时，Proxy 会触发相应的拦截方法，并通知视图更新。

**与 Vue2 的区别：**

+ Vue2 使用 `Object.defineProperty` **监听对象属性的变化，**但它无法监听新增属性和数组下标变化。必须通过 `this.$set` 来手动触发视图更新。
+ Vue3 使用 Proxy 实现更全面的响应式机制，能够**直接监听对象的所有操作**，包括新增属性、删除属性等。

```javascript
function reactive(obj) {  
  return new Proxy(obj, {  
    get(target, key) {  
      console.log('读取了', key);  
      return Reflect.get(target, key);  
    },  
    set(target, key, value) {  
      console.log('更新了', key);  
      return Reflect.set(target, key, value);  
    },
    // 拦截删除属性
    deleteProperty(target, prop) {
      console.log('删除了', prop);
      return Reflect.deleteProperty(target, prop);
    }
  });  
}

const obj = reactive({ a: 1 });
obj.a = 2;  // 触发 set 拦截，更新视图
```

**解释：**

+ 当你访问 `obj.a` 时，`get` 会被触发，打印出“读取了 a”。
+ 当你修改 `obj.a` 时，`set` 会被触发，打印出“更新了 a”。
+ 如果删除了属性，`deleteProperty` 会被触发，打印出“删除了 a”。

**总结**：Vue3 的 Proxy 使得响应式数据的处理更加高效和全面，可以实时监听对象的所有操作，避免了 Vue2 中的一些限制，简化了开发流程。

### 什么时候用 ref？什么时候用 reactive？
**ref：**

用于包装基本类型（数字、字符串等），因为 Proxy 无法直接监听基本类型。

使用方式：必须通过 .value 访问（就像买菜用袋子装，取菜要打开袋子）。

```javascript
const count = ref(0);  
console.log(count.value); // 0  
count.value++;  
```

**reactive：**

**用于包装对象或数组**。`reactive` 会使对象或数组的所有属性变成响应式，可以直接访问和修改它们，不需要 `.value`。  （就像直接拿菜篮子，不用拆包装）。

```javascript
const user = reactive({ name: '张三' });  
console.log(user.name); // 张三  
user.name = '李四';  
```

**总结：**

+ **简单值**（如数字、字符串等）用 `ref`。
+ **复杂对象**（如对象、数组）用 `reactive`。
+ 如果你希望在对象解构时不使用 `.value`，可以使用 `toRefs`。



### toRefs 解构
`toRefs` 提供了一种便捷的方式来**处理响应式对象**，尤其在**需要解构或传递响应式数据**时，能够有效简化逻辑并保持数据的响应性

使用场景：

+ **解构响应式对象**：直接解构 `reactive` 对象会丧失响应性，`toRefs` 保持响应性。
+ **组件间通信**：通过 `toRefs` 传递响应式数据给子组件，确保数据在传递过程中仍能保持响应性。

**基本用法**

```javascript
import { reactive, toRefs } from 'vue';

const state = reactive({
  foo: 1,
  bar: 2,
});

const stateRefs = toRefs(state);
// stateRefs 的每个属性都是 ref 对象，修改它们的值会触发视图更新

stateRefs.foo.value++; // 视图会自动更新

```

**注意事项**

+ **访问方式**：返回的是 `ref` 对象，需通过 `.value` 访问（在模板中无需 `.value`）。
+ **适用范围**：仅适用于 `reactive` 对象，不适用于普通对象或 `ref` 对象。
+ **性能影响**：大量属性使用 `toRefs` 可能带来性能开销。

### watch 和 watchEffect（场景区分）
**watch**：

+ **用途**：明确监听特定数据的变化，适合精确控制（如监听单一数据并触发特定操作）。
+ **场景**：例如监听搜索关键词的变化，并触发数据请求。

```javascript
watch(  
  keyword,  
  (newVal) => { fetchData(newVal) },  
  { immediate: true } // 立即执行一次  
);  
```

**watchEffect**：

+ **用途**：自动追踪所有依赖，适合副作用操作（如根据多个数据变化更新 DOM）。
+ **场景**：当多个数据的变化需要触发某些副作用时使用（例如更新 DOM）。

```javascript
watchEffect(() => {  
  console.log('关键词和页码变化了：', keyword.value, page.value);  
  fetchData();  
});  
```

总结：

+ **`watch`**：监听单一数据变化，适合精确控制。
+ **`watchEffect`**：自动追踪依赖，适合副作用操作。

### 组件通信：Provide/Inject（跨层级传参）

通过 `provide` 和 `inject`，可以实现在 Vue 中跨层级传递数据，通常用于爷爷组件和孙子组件之间的通信。

爷爷组件如何直接传数据给孙子组件？

1. 爷爷组件用 `provide` 提供数据。
2. 孙子组件用 `inject` 获取数据。

```javascript
// 爷爷组件  
import { provide } from 'vue';  
setup() {  
  provide('theme', 'dark'); // 提供数据  
}  

// 孙子组件  
import { inject } from 'vue';  
setup() {  
  const theme = inject('theme', 'light'); // 第二个参数是默认值  
  return { theme };  
}  

```

总结：

+ 爷爷组件通过 `provide` 提供数据。
+ 孙子组件通过 `inject` 获取数据，若没有提供数据，可以使用默认值。

![](https://cdn.nlark.com/yuque/0/2024/png/27167233/1734608061054-0cd822ec-0f7a-4629-99d4-42c2c6795014.png?x-oss-process=image%2Fformat%2Cwebp%2Fresize%2Cw_937%2Climit_0)
![](https://cdn.nlark.com/yuque/0/2025/png/50923934/1744099099821-5043f3a7-a6c6-4e1b-9215-2b42b53d9ea7.png)
![](https://cdn.nlark.com/yuque/0/2025/png/50923934/1744096603611-8c2e9d55-2cfa-44e6-803a-87618e3d46f9.png)
![](https://cdn.nlark.com/yuque/0/2025/png/50923934/1744096703158-4ad86fb0-d48b-45c1-bc11-5e669ec14a88.png)
![](https://cdn.nlark.com/yuque/0/2025/png/50923934/1744096737363-0ffc9add-93f9-4d41-8d11-c02f42b5944a.png)
![](https://cdn.nlark.com/yuque/0/2025/png/50923934/1744096755309-6007657c-adf8-4954-9d01-5f32f6eaa793.png)

### 如何让 Vue3 应用更快？
**代码层面**：

`v-once` 用于将静态内容渲染一次，后续不会重新渲染，提升性能。  

`v-memo` 用于缓存动态组件，只有当特定的依赖变化时才重新渲染，减少不必要的更新。  

**打包优化**：

按需引入组件库（比如 Element Plus 只导入用到的 Button、Input）。

使用异步组件（懒加载），减少首屏代码体积。

```javascript
// 异步加载组件  
const AsyncComponent = defineAsyncComponent(() => import('./MyComponent.vue'));  
```



### 自定义指令：点击外部关闭弹窗
+ **`'click-outside'`**：这是自定义指令的名称，在 Vue 组件中使用时，要写成 `v-click-outside`。
+ **第二个参数**：是一个对象，它包含了自定义指令的钩子函数，用于定义指令的行为。

钩子函数内的参数：

- **`el`**：绑定指令的 DOM 元素。
- **`binding`**：包含指令绑定的详细信息，如值、参数、修饰符等。
    - **`value`**：指令的绑定值。
    - **`oldValue`**：指令的旧值（仅在 `updated` 钩子中可用）。
    - **`arg`**：指令的参数。
    - **`modifiers`**：指令的修饰符。
    - **`instance`**：指令绑定的 Vue 实例。
    - **`dir`**：指令的定义对象。

Vue 3 中 `directive` 用于创建自定义指令，有全局和局部注册两种方式：

+ **全局注册**：`app.directive(name, [definition])`，`name` 是指令名（无 `v-` 前缀），`definition` 可选，可为配置对象或函数，对象含多个生命周期钩子函数，函数等价于 `mounted` 和 `updated` 钩子。
+ **局部注册**：在组件选项中以 `{ directives: { [name]: [definition] } }` 形式存在，参数含义同全局注册。

**场景**：点击弹窗外部区域关闭弹窗。

**代码**：

```javascript
// 全局指令 v-click-outside  
app.directive('click-outside', {  
  mounted(el, { value: callback }) {  
    el.handler = (e) => {  
      if (!el.contains(e.target)) callback();  
    };  
    document.addEventListener('click', el.handler);  
  },  
  unmounted(el) {  
    document.removeEventListener('click', el.handler);  
  }  
});  

// 使用  
<template>  
  <div v-click-outside="closeModal">弹窗内容</div>  
</template>  

```

**自定义指令：点击外部关闭弹窗**

为了实现点击弹窗外部区域关闭弹窗的功能，可以通过自定义指令来实现。以下是完整的代码实现：

#### 1. **全局指令 **`v-click-outside`**：**
```javascript
// 全局指令 v-click-outside  
app.directive('click-outside', {  
  mounted(el, { value: callback }) {  
    el.handler = (e) => {  
      if (!el.contains(e.target)) callback();  // 判断点击是否在元素外部  
    };  
    document.addEventListener('click', el.handler);  // 监听点击事件
  },  
  unmounted(el) {  
    document.removeEventListener('click', el.handler);  // 清理事件监听
  }  
});
```

#### 2. **使用自定义指令：**
```html
<template>  
  <div v-click-outside="closeModal">弹窗内容</div>  
</template>
<script>
export default {
  methods: {
    closeModal() {
      // 弹窗关闭逻辑
      console.log('点击外部，关闭弹窗');
    }
  }
}
</script>

```

解释：

+ `v-click-outside`** 指令**：当点击元素外部时，会触发 `callback` 函数（在这里是 `closeModal`），关闭弹窗。
+ `mounted`** 钩子**：在元素挂载时，设置点击事件监听器，判断点击是否发生在该元素外部。
+ `unmounted`** 钩子**：在元素卸载时，移除事件监听，防止内存泄漏。

总结：

通过自定义指令 `v-click-outside`，可以非常方便地实现点击外部区域关闭弹窗的功能。



### vue3新的生命周期钩子
Vue3.0中可以继续使用Vue2.x中的生命周期钩子，但有有两个被更名：

**beforeDestroy改名为 beforeUnmount**

**destroyed改名为 unmounted**

Vue3.0也提供了 Composition API 形式的生命周期钩子，与Vue2.x中钩子对应关系如下：

**选项式===>组合式**

beforeCreate===>setup()

created=======>setup()

beforeMount ===>onBeforeMount

mounted=======>onMounted

beforeUpdate===>onBeforeUpdate

updated =======>onUpdated

beforeUnmount ==>onBeforeUnmount

unmounted =====>onUnmounted



### 自定义hook函数
1、以函数形式抽离一些可复用的方法像钩子一样挂着，随时可以引入和调用，实现高内聚低耦合的目标；

2、将可复用功能抽离为外部JS文件

3、函数名/文件名以use开头，形如：useXX

4、引用时将响应式变量或者方法显式解构暴露出来如：const {nameRef，Fn} = useXX()

（在setup函数解构出自定义hooks的变量和方法）

**自定义 Hook 函数（在 Vue3 中）**

自定义 Hook 函数（即组合式函数）是一种用于**抽离可复用逻辑**的方式。它们通常以 `use` 开头，提供一组方法或响应式数据，可以在多个组件中复用，达成**高内聚低耦合**的目标。

#### 自定义 Hook 函数的特点：
1. **高内聚低耦合**：将可复用的逻辑封装到独立的函数中，减少不同组件之间的耦合，增强可维护性。
2. **拆分功能**：将某一特定功能的逻辑提取到外部 JS 文件中，避免组件变得臃肿。
3. **函数命名约定**：自定义 Hook 函数的名称和文件名通常以 `use` 开头，形式如 `useXX`。
4. **解构暴露**：在 `setup` 中解构出 Hook 函数返回的响应式变量和方法，方便使用。

#### 自定义 Hook 函数的实现和使用：
**1. 创建自定义 Hook 函数：**

假设我们要创建一个管理计数器状态的 Hook 函数 `useCounter`：

```javascript
// useCounter.js
import { ref } from 'vue';

export function useCounter(initialValue = 0) {
  const count = ref(initialValue);

  const increment = () => count.value++;
  const decrement = () => count.value--;

  return {
    count,
    increment,
    decrement
  };
}
```

+ 在 `useCounter` 中，返回了响应式的 `count` 和方法 `increment`、`decrement`。
+ 函数名以 `use` 开头，符合约定。

**2. 在组件中引用自定义 Hook：**

在组件的 `setup` 函数中引用并解构出 `useCounter` 返回的变量和方法：

```javascript
// MyComponent.vue
<template>
  <div>
    <p>Count: {{ count }}</p>
    <button @click="increment">Increment</button>
    <button @click="decrement">Decrement</button>
  </div>
</template>
<script>
import { useCounter } from './useCounter';

export default {
  setup() {
    // 解构出 useCounter 返回的响应式变量和方法
    const { count, increment, decrement } = useCounter(0);

    // 返回这些方法和数据以便模板中使用
    return { count, increment, decrement };
  }
};
</script>

```

+ 在 `setup` 中，通过解构从 `useCounter` 获取 `count`、`increment` 和 `decrement`。
+ 然后直接在模板中使用 `count` 以及触发 `increment` 和 `decrement` 事件。

#### 总结：
+ 自定义 Hook 函数是通过 `use` 开头的函数，通常用于封装可复用的逻辑。
+ 自定义 Hook 函数应当**返回一个对象**，包含响应式变量和方法，在组件中解构暴露出来，确保逻辑复用。
+ 它使得代码更模块化、可复用，并提升了组件的可维护性。



### vue3自定义hooks和vue2中mixin的区别和比较？
1、Mixin难以追溯的方法与属性！Vue3自定义Hooks却可以

2、无法向Mixin传递参数来改变逻辑，但是Vue3自定义Hooks却可以：

3、Mixin同名变量会被覆盖，Vue3自定义Hook可以在引入的时候对同名变量重命名



### customRef 自定义ref使用
customRef：返回一个ref对象，可以显示的控制**依赖追踪**和**触发响应**

```javascript
<template>
    <input type="text" v-model="keyword">
    <h3>{{keyword}}</h3>
</template>
​
<script>
    import {ref,customRef} from 'vue'
    export default {
        name:'Demo',
        setup(){
            // let keyword = ref('hello') //使用Vue准备好的内置ref
            //自定义一个myRef
            function myRef(value,delay){
                let timer
                //通过customRef去实现自定义
                return customRef((track,trigger)=>{
                    return{
                        get(){
                            track() //告诉Vue这个value值是需要被“追踪”的
                            return value
                        },
                        set(newValue){
                            clearTimeout(timer)
                            timer = setTimeout(()=>{
                                value = newValue
                                trigger() //告诉Vue去更新界面
                            },delay)
                        }
                    }
                })
            }
            let keyword = myRef('hello',500) //使用程序员自定义的ref
            return {
                keyword
            }
        }
    }
</script>

```



### 响应式数据的判断isRef、isReactive、isReadonly、isProxy

1、isRef：判断一个值是否为一个 ref 对象

2、isReactive：判断一个对象是否是由 reactive创建的响应式代理

3、isReadonly：判断一个对象是否是由 readonly 创建的只读代理

4、isProxy：判断一个对象是否是由 reactive 或 readonly 创建的代理



### vue3中使用插槽？

1、插槽 slot 通常用于两个父子组件之间，最常见的应用就是我们使用一些 UI 组件库中的弹窗组件时，弹窗组件的内容是可以让我们自定义的，这就是使用了插槽的原理。

2、理解：

slot 是 Vue3 中的**内置标签**。

slot 相当于给子组件挖出了一个槽，可以用来填充内容。

父组件中调用子组件时，**子组件标签之间的内容元素就是要放置的内容，它会把 slot 标签替换掉**

3、具名插槽：

具有名字的插槽。简单来说这个具名插槽的目的就是让一个萝卜一个坑，让它们呆在该呆的位置去。比如带 name 的插槽`<slot name="xx">`被称为具名插槽

4、作用域插槽：能够接受参数的插槽就被称为了作用域插槽。通过作用域插槽，子组件可以将数据传递给父组件插槽中的内容，父组件可以访问子组件的数据。



### vue3中路由守卫onBeforeRouteLeave，onBeforeRouteUpdate？
vue3的路由守卫与vue2相比,其他的一样，只有组件守卫变了，需要前面加on，在 Vue 3 中，若使用组合式 API，需要使用 onBeforeRouteEnter、onBeforeRouteUpdate 和 onBeforeRouteLeave 来设置组件内守卫。



vue-router 提供的导航守卫主要用来通过跳转或取消的方式守卫导航。这里有很多方式植入路由导航中：

全局的，单个路由独享的，或者组件级的。

1、vue3 router中新增的onBeforeRouteLeave方法表示添加一个导航守卫，此方法会**在组件将要离开的时候触发**，类似于以前的beforeRouteLeave，但onBeforeRouteLeave可以在任何组件中使用，**当组件被卸载的时候，导航守卫也将被移除。**当我们使用router执行跳转或返回的时候，就会触发onBeforeRouteLeave方法。

2、 onBeforeRouteUpdate：添加一个导航守卫，**在当前位置即将更新时触发。**

```javascript
import { onBeforeRouteUpdate } from "vue-router";
onBeforeRouteUpdate(to => {
   console.log(to, "路由变动");
});
```

3、onBeforeRouteLeave：添加一个导航守卫，在当前位置的组件将要离开时触发。

使用组件内守卫，对离开页面事件做一些操作，

```javascript
beforeRouteLeave(to, from, next){
    if(from.path=='/b'){ //当前页面路由
        next({replace: true,redirect: '/a'}); //目标路由 重定向
    }else {
    next()
    }
}
```

| **方法** | **作用** | **使用时机** |
| --- | --- | --- |
| `**onBeforeRouteLeave**` | 组件即将离开时触发，类似于 `beforeRouteLeave` | 用户离开当前路由或跳转时需要处理操作 |
| `**onBeforeRouteUpdate**` | 路由参数更新时触发，类似于 `beforeRouteUpdate` | 路由参数变化时需要做更新的场景，在一个页面内根据不同的 URL 参数显示不同内容时非常有用。 |


![](https://cdn.nlark.com/yuque/0/2025/png/50923934/1744017651222-ce70731f-5ef2-4592-8157-579e31bf848f.png)

### vue3中使用vue-router，useRoute和useRouter ？

1、在Vue.js中，`useRoute` 和 `useRouter` 是Vue Router提供的两个钩子函数，它们分别用来访问当前的路由信息和控制路由跳转。

2、区别：

| **钩子** | **作用** | **相当于 Vue2 中的** | **返回值** |
| --- | --- | --- | --- |
| `**useRoute**` | 获取当前路由的信息（如路径、参数等） | `this.$route` | 当前路由信息对象（响应式） |
| `**useRouter**` | 获取 Vue Router 实例，执行导航操作 | `this.$router` | Vue Router 实例，可以进行跳转等操作 |




### vue3中nextTick使用
+ `nextTick` 推迟回调到下一个 DOM 更新周期执行，可以确保数据变化后 DOM 更新完再执行操作。 （比如获取新的 DOM 元素、操作页面上的动态内容等）。
+ 异步使用时，结合 `async/await`，确保回调函数等待 DOM 更新完成后执行。

1、nextTick 是将回调推迟到下一个 DOM 更新周期之后执行。在更改了一些数据以等待 DOM 更新后立即使用它

2、异步使用：

```javascript
import { nextTick } from 'vue'
//异步使用
setup() {
 const message = ref('Hello!')
 const changeMessage = async newMessage => {
   message.value = newMessage
   await nextTick()
   console.log('Now DOM is updated')
 }
}
//基本使用
nextTick(()=>{
  ...
})
```



### 原型绑定全局属性
1、通过config.globalProperties

2、通过provide注入：在应用实例上设置一个可以被注入到应用范围内所有组件中的值。当组件要使用应用提供的 provide 值时，必须用 inject 来接收。

`provide` 和 `inject` 是 Vue 3 中用于在组件中进行跨层级数据传递的方法，可利用它来模拟全局属性。

3、在main.js中全局引入，然后在组件中获取

+ **`config.globalProperties`**：可以在应用实例上设置全局属性，组件可以通过 `this` 访问这些属性，适合全局常量或工具函数。
+ **`provide`/`inject`**：适合在爷孙组件之间传递数据，特别是跨越多个层级的传递。
+ **模块引入**：对于工具函数、常量等，可以直接通过模块导入到组件中，而不必依赖 Vue 的 API。

### vue3中使用keep-alive ？
1、keep-alive是Vue提供的一个抽象组件，主要用于**保留组件状态或避免重新渲染**。

2、`<keep-alive>` 包裹动态组件时，会缓存不活动的组件实例，而不是销毁他们。

和 `<transition>` 相似，`<keep-alive>` 是一个抽象组件，它**自身不会渲染一个DOM元素**，也不会出现在父组件链中。但是 keep-alive 会把其包裹的所有组件都缓存起来。

3、使用：

在 app.vue 中通过 v-if 判断是否缓存

还可以在meta属性即路由元信息中添加缓存标识来实现页面的部分刷新

### vue3中废弃了过滤器
1、过滤器：过滤器可以通俗理解成是一个特殊的方法，用来加工数据的

+ Vue3 中 **废弃了过滤器**，因为它的功能可以通过 `computed` 和 `methods` 更加灵活地实现。
+ `filters` 在模板中直接使用，使得代码有些难以追踪和维护。
+ 使用 `**computed**` 处理依赖数据的计算和 `**methods**` 来执行简单的函数逻辑，这样能保持代码的一致性和可维护性。
