---
title: "第 3 篇：Vue 3 面试题"
slug: "vue-vue-vue3-ace64a20"
summary: "Vue 3 面试题整理，覆盖 Composition API、ref、reactive、watchEffect、Provide/Inject 和性能优化。"
category: "vue面试题"
categoryPath:
  - "前端技术"
  - "Vue"
  - "vue面试题"
tags: []
status: "published"
sortOrder: 30
cover: ""
originalId: "6a2d291f8a2b1c68f2cac2de"
originalSlug: "vue-vue-vue3-ace64a20"
originalStatus: "published"
publishedAt: "2026-03-27T13:29:28.860Z"
updatedAt: "2026-07-31T11:16:24.318Z"
exportedAt: "2026-08-03T03:03:53.296Z"
---
# 第 3 篇：Vue 3 面试题

### Vue3 相比 Vue2 的改进（通俗版）
+ **更快**：
    - Proxy 代理：Vue2 的响应式像“逐个监听保险箱”（每个属性单独监听）
    - Vue3 的 Proxy 像“直接监控整个房间”（监听整个对象变化）。
    - 编译优化：Vue3 在编译阶段标记哪些是动态内容（如 {{ count }}），更新时跳过静态内容（如纯文字）。
+ **更小**：通过 Tree-shaking（摇树优化），只打包你用到的功能，减少代码体	积。
+ **更好用**：
    - Composition API：像搭积木一样组合逻辑（比如把“计数器逻辑”抽成函数，多个组件复用）。
    - 新组件：
        * <Teleport>：把组件渲染到任意位置（比如弹窗放到 body 下，避免被父组件样式影响）。
        * <Suspense>：优雅处理异步加载（比如数据加载时显示 Loading 动画）。

### 为什么要用 Composition API？
Options API（Vue2 风格）：把代码按类型分块（data、methods、生命周期），适合简单组件。

缺点：逻辑分散，比如一个“搜索功能”的 data、methods 可能分布在多处。

```javascript
// Options API 示例  
export default {  
  data() { return { keyword: '' } },  
  methods: { search() { ... } },  
  mounted() { this.search() }  
}  
```

Composition API（Vue3 风格）：<font style="color:rgba(0, 0, 0, 0.75);">在 </font>`<font style="color:rgb(199, 37, 78);background-color:rgb(249, 242, 244);">setup()</font>`<font style="color:rgba(0, 0, 0, 0.75);"> 中，按功能组织代码（比如把搜索相关的数据、方法写在一起）。</font>

<font style="color:rgba(0, 0, 0, 0.75);">优点：逻辑复用更方便（类似 React Hooks）。</font>

```javascript
// Composition API 示例  
export default {  
  setup() {  
    const keyword = ref('');  
    const search = () => { ... };  
    onMounted(search);  
    return { keyword, search };  
  }  
}  
```

### Vue3 如何实现数据变化自动更新视图？
Proxy 代理对象：

当你修改数据时，Proxy 会“拦截”操作（比如 obj.a = 1），通知视图更新。

对比 Vue2：Vue2 使用 Object.defineProperty，无法监听新增属性和数组下标变化（必须用 this.$set）。

代码模拟（简化版）：

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
    deleteProperty (target, prop) {
        return Reflect.deleteProperty(target, prop)
    }
  });  
}  
const obj = reactive({ a: 1 });  
obj.a = 2; // 触发 set 拦截，更新视图  
```

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

用于包装 对象/数组，可以直接访问属性（就像直接拿菜篮子，不用拆包装）。

```javascript
const user = reactive({ name: '张三' });  
console.log(user.name); // 张三  
user.name = '李四';  
```

**总结：**

简单值用 ref，复杂对象用 reactive。

如果不想写 .value，可以用 toRefs 解构对象

### toRefs 解构
`<font style="color:rgb(199, 37, 78);background-color:rgb(249, 242, 244);">toRefs</font>`<font style="color:rgb(79, 79, 79);"> 提供了一种便捷的方式来处理响应式对象，尤其在需要解构或传递响应式数据时，能够有效简化逻辑并保持数据的响应性</font>

**使用场景**

解构响应式对象：直接解构 reactive 对象会失去响应性，而使用 toRefs 可以避免这一问题。

组件间通信：通过 toRefs 将响应式数据传递给子组件，确保数据在传递过程中仍能保持响应性。

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

**<font style="color:rgb(79, 79, 79);">注意事项</font>**

+ <font style="color:rgba(0, 0, 0, 0.75);">访问方式：返回的对象属性是 </font>`<font style="color:rgb(199, 37, 78);background-color:rgb(249, 242, 244);">ref</font>`<font style="color:rgba(0, 0, 0, 0.75);"> 对象，在 JavaScript 中需通过 </font>`<font style="color:rgb(199, 37, 78);background-color:rgb(249, 242, 244);">.value</font>`<font style="color:rgba(0, 0, 0, 0.75);"> 访问；模板中则无需 </font>`<font style="color:rgb(199, 37, 78);background-color:rgb(249, 242, 244);">.value</font>`<font style="color:rgba(0, 0, 0, 0.75);">。</font>
+ <font style="color:rgba(0, 0, 0, 0.75);">适用范围：仅适用于 </font>`<font style="color:rgb(199, 37, 78);background-color:rgb(249, 242, 244);">reactive</font>`<font style="color:rgba(0, 0, 0, 0.75);"> 对象，不支持普通对象或 </font>`<font style="color:rgb(199, 37, 78);background-color:rgb(249, 242, 244);">ref</font>`<font style="color:rgba(0, 0, 0, 0.75);"> 对象。</font>
+ <font style="color:rgba(0, 0, 0, 0.75);">性能影响：大量属性可能带来一定性能开销。</font>

### watch 和 watchEffect（场景区分）
**watch**：

明确监听某个数据，适合精确控制（比如监听搜索关键词变化，触发请求）。

```javascript
watch(  
  keyword,  
  (newVal) => { fetchData(newVal) },  
  { immediate: true } // 立即执行一次  
);  
```

**watchEffect**：

自动追踪依赖，适合副作用操作（比如根据多个数据变化更新 DOM）。

```javascript
watchEffect(() => {  
  console.log('关键词和页码变化了：', keyword.value, page.value);  
  fetchData();  
});  
```

### <font style="color:rgb(79, 79, 79);">组件通信：Provide/Inject（跨层级传参）</font>
<font style="color:rgb(77, 77, 77);">爷爷组件如何直接传数据给孙子组件？</font>

    1. <font style="color:rgba(0, 0, 0, 0.75);">爷爷组件用</font><font style="color:rgba(0, 0, 0, 0.75);"> </font>`<font style="color:rgb(199, 37, 78);background-color:rgb(249, 242, 244);">provide</font>`<font style="color:rgba(0, 0, 0, 0.75);"> </font><font style="color:rgba(0, 0, 0, 0.75);">提供数据。</font>
    2. <font style="color:rgba(0, 0, 0, 0.75);">孙子组件用 </font>`<font style="color:rgb(199, 37, 78);background-color:rgb(249, 242, 244);">inject</font>`<font style="color:rgba(0, 0, 0, 0.75);"> 获取数据。</font>

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

### 如何让 Vue3 应用更快？
**代码层面**：

使用 v-once 标记静态内容（只渲染一次）。

用 v-memo 缓存动态组件（比如表格行，只有 ID 变化时才重新渲染）。

**打包优化**：

按需引入组件库（比如 Element Plus 只导入用到的 Button、Input）。

使用异步组件（懒加载），减少首屏代码体积。

```javascript
// 异步加载组件  
const AsyncComponent = defineAsyncComponent(() => import('./MyComponent.vue'));  
```

### <font style="color:rgb(79, 79, 79);">自定义指令：点击外部关闭弹窗</font>
**<font style="color:rgb(77, 77, 77);">场景</font>**<font style="color:rgb(77, 77, 77);">：点击弹窗外部区域关闭弹窗。  
</font>**<font style="color:rgb(77, 77, 77);">代码</font>**<font style="color:rgb(77, 77, 77);">：</font>

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

### vue3新的生命周期钩子
Vue3.0中可以继续使用Vue2.x中的生命周期钩子，但有有两个被更名：

**beforeDestroy改名为 beforeUnmount**

**destroyed改名为 unmounted**

Vue3.0也提供了 Composition API 形式的生命周期钩子，与Vue2.x中钩子对应关系如下：

选项式===>组合式

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

### vue3自定义hooks和vue2中mixin的区别和比较？
1、Mixin难以追溯的方法与属性！Vue3自定义Hooks却可以

2、无法向Mixin传递参数来改变逻辑，但是Vue3自定义Hooks却可以：

3、Mixin同名变量会被覆盖，Vue3自定义Hook可以在引入的时候对同名变量重命名

### <font style="color:rgb(79, 79, 79);">customRef 自定义ref使用</font>
<font style="color:rgb(79, 79, 79);">1、customRef：返回一个ref对象，可以显示的控制依赖追踪和触发响应</font>

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

### <font style="color:rgb(79, 79, 79);">响应式数据的判断isRef、isReactive、isReadonly、isProxy</font>
<font style="color:rgb(79, 79, 79);">1、isRef：判断一个值是否为一个 ref 对象</font>

<font style="color:rgb(79, 79, 79);">2、isReactive：判断一个对象是否是由 reactive创建的响应式代理</font>

<font style="color:rgb(79, 79, 79);">3、isReadonly：判断一个对象是否是由 readonly 创建的只读代理</font>

<font style="color:rgb(79, 79, 79);">4、isProxy：判断一个对象是否是由 reactive 或 readonly 创建的代理</font>

### <font style="color:rgb(79, 79, 79);">vue3中使用插槽？</font>
<font style="color:rgb(79, 79, 79);">1、插槽 slot 通常用于两个父子组件之间，最常见的应用就是我们使用一些 UI 组件库中的弹窗组件时，弹窗组件的内容是可以让我们自定义的，这就是使用了插槽的原理。</font>

<font style="color:rgb(79, 79, 79);">2、理解：</font>

<font style="color:rgb(79, 79, 79);">slot 是 Vue3 中的内置标签。</font>

<font style="color:rgb(79, 79, 79);">slot 相当于给子组件挖出了一个槽，可以用来填充内容。</font>

<font style="color:rgb(79, 79, 79);">父组件中调用子组件时，子组件标签之间的内容元素就是要放置的内容，它会把 slot 标签替换掉</font>

<font style="color:rgb(79, 79, 79);">3、具名插槽：</font>

<font style="color:rgb(79, 79, 79);">具有名字的 插槽。简单来说这个具名插槽的目的就是让一个萝卜一个坑，让它们呆在该呆的位置去。比如带 name 的插槽<slot name="xx">被称为具名插槽</font>

<font style="color:rgb(79, 79, 79);">4、作用域插槽：能够接受参数的插槽就被称为了作用域插槽。</font>

### vue3中路由守卫onBeforeRouteLeave，onBeforeRouteUpdate？
vue-router 提供的导航守卫主要用来通过跳转或取消的方式守卫导航。这里有很多方式植入路由导航中：

全局的，单个路由独享的，或者组件级的。

1、vue3 router中新增的onBeforeRouteLeave方法表示添加一个导航守卫，此方法会在组件将要离开的时候触发，类似于以前的beforeRouteLeave，但onBeforeRouteLeave可以在任何组件中使用，当组件被卸载的时候，导航守卫也将被移除。当我们使用router执行跳转或返回的时候，就会触发onBeforeRouteLeave方法。

2、 onBeforeRouteUpdate：添加一个导航守卫，在当前位置即将更新时触发。

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

### <font style="color:rgb(79, 79, 79);">vue3中使用vue-router，useRoute和useRouter ？</font>
<font style="color:rgb(79, 79, 79);">1、在Vue.js中，</font>`<font style="color:rgb(79, 79, 79);">useRoute</font>`<font style="color:rgb(79, 79, 79);">和</font>`<font style="color:rgb(79, 79, 79);">useRouter</font>`<font style="color:rgb(79, 79, 79);">是Vue Router提供的两个钩子函数，用于在组件中访问路由信息和路由实例。</font>

<font style="color:rgb(79, 79, 79);">2、区别：</font>

`**<font style="color:rgb(79, 79, 79);">useRoute</font>**`<font style="color:rgb(79, 79, 79);">相当于是vue2中的this.$route，</font>**<font style="color:rgb(79, 79, 79);">返回当前路由的信息对象，包括路由路径、参数、查询参数等信息。</font>**

`**<font style="color:rgb(79, 79, 79);">useRouter</font>**`<font style="color:rgb(79, 79, 79);">vue2中的this.$router，</font>**<font style="color:rgb(79, 79, 79);">返回Vue Router的实例，我们可以在组件中使用</font>**`**<font style="color:rgb(79, 79, 79);">useRouter</font>**`**<font style="color:rgb(79, 79, 79);">函数来获取Vue Router的实例。</font>**

### <font style="color:rgb(79, 79, 79);">vue3中nextTick使用</font>
<font style="color:rgb(79, 79, 79);">1、nextTick 是将回调推迟到下一个 DOM 更新周期之后执行。在更改了一些数据以等待 DOM 更新后立即使用它</font>

<font style="color:rgb(79, 79, 79);">2、异步使用：</font>

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

3、在main.js中全局引入，然后在组件中获取

### vue3中使用keeplive ？
1、keep-alive是Vue提供的一个抽象组件，主要用于保留组件状态或避免重新渲染。

2、<keep-alive> 包裹动态组件时，会缓存不活动的组件实例，而不是销毁他们。

和<transition> 相似，<keep-alive> 是一个抽象组件，它自身不会渲染一个DOM元素，也不会出现在父组件链中。但是 keep-alive 会把其包裹的所有组件都缓存起来。

3、使用：

配置app.vue 使用v-if判断是否缓存

添加meta属性，在路由元信息中添加缓存的标识

实现页面的部分刷新

### vue3中废弃了过滤器
1、过滤器：过滤器可以通俗理解成是一个特殊的方法，用来加工数据的

2、vue3要精简代码，并且filter功能重复，filter能实现的功能，methods和计算属性基本上也可以实现。所以就干脆把filter这方面的vue源码给删掉，这样的话，更加方便维护。
