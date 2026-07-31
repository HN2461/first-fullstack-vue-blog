---
title: "第 6 篇：Vue 3 其他 API"
slug: "vue-vue3-apis-94236b74"
summary: "Vue 3 其他 API 笔记，整理 shallowRef、shallowReactive、readonly、toRaw 等进阶 API。"
category: "vue3"
tags:
  - "Vue 3"
  - "Composition API"
  - "Vue API"
  - "响应式"
status: "draft"
sortOrder: 60
cover: ""
originalId: "6a2d291f8a2b1c68f2cac2d8"
originalSlug: "vue-vue3-apis-94236b74"
originalStatus: "published"
exportedAt: "2026-07-31T03:42:38.792Z"
---
# 第 6 篇：Vue 3 其他 API
## 6.1.【shallowRef 与 shallowReactive 】
### `shallowRef`
1. 作用：创建一个响应式数据，但<u>只对顶层属性进行响应式处理</u>。浅层响应
2. 用法：

```javascript
let msg = shallowRef('hello world')
```

3. <u>特点：只跟踪引用值的变化，不关心值内部的属性变化。</u>

### `shallowReactive`
1. 作用：创建一个浅层响应式对象，只会使对象的最顶层属性变成响应式的，<u>对象内部的嵌套属性则不会变成响应式的</u>
2. 用法：

```javascript
let obj = shallowReactive({
  myname: {
    firstName: 'zhang',
    lastName: 'san'
  },
  myage: 18
})
```

3. 特点：对象的顶层属性是响应式的，但嵌套对象的属性不是。

### 总结
> 通过使用 `shallowRef()` 和 `shallowReactive()` 来绕开深度响应。浅层式 `API` 创建的状态只在其顶层是响应式的，对所有深层的对象不会做任何处理，避免了对每一个内部属性做响应式所带来的性能成本，这使得属性的访问变得更快，可提升性能。
>

demo

```vue
<script setup lang='ts'>
import { reactive, ref, shallowReactive, shallowRef } from 'vue';
//1、 ref reactive
// let msg = ref('hello world')
// let obj = reactive({
//   myname: {
//     firstName:'zhang',
//     lastName:'san'
//   },
//   myage: 18
// })
// 2、shallowRef,shallowReactive
let msg = shallowRef('hello world')
let obj = shallowReactive({
  myname: {
    firstName: 'zhang',
    lastName: 'san'
  },
  myage: 18
})


</script>
<template>
  <div class="app">
    <h1>app组件</h1>
    <h2>msg:{{ msg }}</h2>
    <h2>
      姓名：{{ obj.myname.firstName }}-{{ obj.myname.lastName }} <br>
      年龄：{{ obj.myage }}
    </h2>
    <button @click="msg += '@'">修改msg</button>
    <button @click="obj.myage++">修改年龄</button>
    <button @click="obj.myname.lastName += '!'">修改姓名</button>
  </div>
</template>
<style scoped>
.app {
  background-color: #ccc;
  padding: 5px;
}
</style>
```

## 6.2.【readonly 与 shallowReadonly】
### `readonly`
1. 作用：用于创建一个对象的**<font style="color:#DF2A3F;">深只读</font>**副本。
2. 用法：

```javascript
const obj = reactive({ ... });
const readOnlyObj = readonly(obj);
```

3. 特点：
    - 对象的所有嵌套属性都将变为只读。
    - 任何尝试修改这个对象的操作都会被阻止（在开发模式下，还会在控制台中发出警告）。
4. 应用场景：
    - 创建不可变的状态快照。
    - 保护全局状态或配置不被修改。

### `shallowReadonly`
1. 作用：与 `readonly` 类似，但只作用于对象的顶层属性。
2. 用法：

```javascript
const obj = reactive({ ... });
const shallowReadOnlyObj = shallowReadonly(obj);
```

3. 特点：
    - 只将对象的顶层属性设置为只读，对象内部的嵌套属性仍然是可变的。
    - 适用于只需保护对象顶层属性的场景。

demo

```vue
<script setup lang='ts'>
import { reactive, readonly, shallowReadonly } from 'vue';
let obj = reactive(
  {
    myname: {
      firstName: 'zhang',
      lastName: 'san'
    },
    myage: 18
  }
)
//1、 readonly()
let readonlyobj = readonly(obj)
// 2、shallowReadonly
let shallowReadonlyObj = shallowReadonly(obj)

</script>
<template>
  <div class="app">
    <h1>app组件</h1>
    <h2>
      姓名：{{ obj.myname.firstName }}-{{ obj.myname.lastName }} <br>
      年龄：{{ obj.myage }}
    </h2>
    <button @click="obj.myage++">修改年龄</button>
    <button @click="obj.myname.lastName += '!'">修改姓名</button>
  </div>
</template>
<style scoped>
.app {
  background-color: #ccc;
  padding: 5px;
}
</style>
```



## 6.3.【toRaw 与 markRaw】
### `toRaw`
1. 作用：用于获取一个响应式对象的原始对象， `toRaw` 返回的对象不再是响应式的，不会触发视图更新。

> 官网描述：这是一个可以用于临时读取而不引起代理访问/跟踪开销，或是写入而不触发更改的特殊方法。不建议保存对原始对象的持久引用，请谨慎使用。
>

> 何时使用？ —— 在需要将响应式对象传递给非 `Vue` 的库或外部系统时，使用 `toRaw` 可以确保它们收到的是普通对象
>

2. 具体编码：

```javascript
import { isReactive, markRaw, reactive, toRaw } from 'vue';
let obj = reactive(
  {
    myname: {
      firstName: 'zhang',
      lastName: 'san'
    },
    myage: 18
  }
)
//1、 toRaw 获取一个普通的对象，没有响应式
let toRawobj = toRaw(obj)
console.log(toRawobj);
```

### `markRaw`
1. 作用：标记一个对象，使其**永远不会**变成响应式的。

> 例如使用`mockjs`时，为了防止误把`mockjs`变为响应式对象，可以使用 `markRaw` 去标记`mockjs`
>

2. 编码：

```javascript
// 2、markRaw 标记一个对象，使其永远不会变成响应式对象
let obj2 = { name: 'tom', age: 18 }
let markRawObj = markRaw(obj2)
obj2 = reactive(obj2) 
console.log(obj2);//无法变成响应式的数据了，因为已经被标记了
console.log(isReactive(obj2));//false
```

demo

```vue
<script setup lang='ts'>
import { isReactive, markRaw, reactive, toRaw } from 'vue';
let obj = reactive(
  {
    myname: {
      firstName: 'zhang',
      lastName: 'san'
    },
    myage: 18
  }
)
//1、 toRaw 获取一个普通的对象，没有响应式
let toRawobj = toRaw(obj)
console.log(toRawobj);

// 2、markRaw 标记一个对象，使其永远不会变成响应式对象
let obj2 = { name: 'tom', age: 18 }
let markRawObj = markRaw(obj2)
obj2 = reactive(obj2) 
console.log(obj2);//无法变成响应式的数据了，因为已经被标记了
console.log(isReactive(obj2));//false


</script>
<template>
  <div class="app">
    <h1>app组件</h1>
    <h2>
      姓名：{{ obj2.name }} <br>
      年龄：{{ obj2.age }}
    </h2>
    <button @click="obj2.age++">修改年龄</button>
    <button @click="obj2.name += '!'">修改姓名</button>
  </div>
</template>
<style scoped>
.app {
  background-color: #ccc;
  padding: 5px;
}
</style>
```

## 6.4.【customRef】
作用：创建一个自定义的`ref`，并对其依赖项跟踪和更新触发进行逻辑控制。

实现防抖效果（`useSumRef.ts`）：

```typescript
import {customRef } from "vue";

export default function(initValue:string,delay:number){
  let msg = customRef((track,trigger)=>{
    let timer:number
    return {
      get(){
  // 告诉Vue数据msg很重要，要对msg持续关注，一旦变化就更新
        track() 
        return initValue
      },
      set(value){
        clearTimeout(timer)
        timer = setTimeout(() => {
          initValue = value
          trigger() //通知Vue数据msg变化了
        }, delay);
      }
    }
  }) 
  return {msg}
}
```

组件中使用：

```vue
<script setup lang='ts'>
import { ref } from 'vue';
// 1、ref定义的数据具有响应式，只要数据发生变化，页面就会随着更新
let ref_msg = ref('hello world')
// 2、customRef 自定义ref
// 导入自定义hook
import useDelayRef from './04.customRef/useDelayRef'
let { msg } = useDelayRef('hi', 1000)

</script>
<template>
  <div class="app">
    <h1>ref</h1>
    <h2>ref_msg:{{ ref_msg }}</h2>
    <input type="text" v-model="ref_msg">
    <hr>
    <h1>customRef</h1>
    <h2>msg:{{ msg }}</h2>
    <input type="text" v-model="msg">
  </div>
</template>
<style scoped>
.app {
  background-color: #ccc;
  padding: 5px;
}
</style>
```

## 6.5、<font style="color:rgb(79, 79, 79);">响应式数据的判断</font>
+ `<font style="color:rgb(51, 51, 51);">isRef</font>`<font style="color:rgb(51, 51, 51);">: 检查一个值是否为一个</font><font style="color:rgb(51, 51, 51);"> </font>`<font style="color:rgb(51, 51, 51);">ref</font>`<font style="color:rgb(51, 51, 51);"> </font><font style="color:rgb(51, 51, 51);">对象</font>
+ `<font style="color:rgb(51, 51, 51);">isReactive</font>`<font style="color:rgb(51, 51, 51);">: 检查一个对象是否是由</font><font style="color:rgb(51, 51, 51);"> </font>`<font style="color:rgb(51, 51, 51);">reactive</font>`<font style="color:rgb(51, 51, 51);"> </font><font style="color:rgb(51, 51, 51);">创建的响应式代理</font>
+ `<font style="color:rgb(51, 51, 51);">isReadonly</font>`<font style="color:rgb(51, 51, 51);">: 检查一个对象是否是由</font><font style="color:rgb(51, 51, 51);"> </font>`<font style="color:rgb(51, 51, 51);">readonly</font>`<font style="color:rgb(51, 51, 51);"> </font><font style="color:rgb(51, 51, 51);">创建的只读代理</font>
+ `<font style="color:rgb(51, 51, 51);">isProxy</font>`<font style="color:rgb(51, 51, 51);">: 检查一个对象是否是由 </font>`<font style="color:rgb(51, 51, 51);">reactive</font>`<font style="color:rgb(51, 51, 51);"> 或者 </font>`<font style="color:rgb(51, 51, 51);">readonly</font>`<font style="color:rgb(51, 51, 51);"> 方法创建的代理</font>

# 7. Vue3新组件
## 7.1. 【Teleport】
+ 什么是Teleport？—— Teleport 是一种能够将我们的**组件html结构**移动到指定位置的技术。

需求：child组件沿着页面居中，以body为参考标准

```html
<template>
  <!-- 在teleport标签里通过to属性表示传送到哪里 -->
    <teleport to='body'>
        <div class="child">
            <h3>child</h3>
        </div>
    </teleport>
</template>
<script setup>
</script>
<style scoped>
.child {
    width: 200px;
    height: 200px;
    background-color: pink;
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
}
</style>
```

## 7.2. 【Suspense】
+ <u>等待异步组件时渲染一些额外内容，让应用有更好的用户体验 </u>
+ 使用步骤： 
    - 异步引入组件
    - **使用**`**Suspense**`**包裹组件，并配置好**`**default**`** 与 **`**fallback**`

```tsx
import { defineAsyncComponent,Suspense } from "vue";
const Child = defineAsyncComponent(()=>import('./Child.vue'))
```

```vue
<template>
    <div class="app">
        <h3>我是App组件</h3>
      <!-- 使用Suspense包裹组件 -->
        <Suspense>
          <!--数据请求回来后显示  -->
          <template v-slot:default>
            <Child/>
          </template>
          
            <!-- 数据请求中显示 -->
          <template v-slot:fallback>
            <h3>加载中.......</h3>
          </template>

        </Suspense>

    </div>

</template>

```

## 7.3.【全局API转移到应用对象】
<font style="color:rgb(77, 77, 77);">将全局的API，即：</font>`<font style="color:rgb(77, 77, 77);">Vue.xxx</font>`<font style="color:rgb(77, 77, 77);">调整到应用实例（</font>`<font style="color:rgb(77, 77, 77);">app</font>`<font style="color:rgb(77, 77, 77);">）上</font>

| **<font style="color:rgb(79, 79, 79);">2.x 全局 API（</font>**`**<font style="color:rgb(79, 79, 79);">Vue</font>**`**<font style="color:rgb(79, 79, 79);">）</font>** | **<font style="color:rgb(79, 79, 79);">3.x 实例 API (</font>**`**<font style="color:rgb(79, 79, 79);">app</font>**`**<font style="color:rgb(79, 79, 79);">)</font>** |
| :--- | :--- |
| <font style="color:rgb(79, 79, 79);">Vue.config.xxxx</font> | <font style="color:rgb(79, 79, 79);">app.config.xxxx</font> |
| <font style="color:rgb(79, 79, 79);">Vue.config.productionTip</font> | **<font style="color:rgb(79, 79, 79);">移除</font>** |
| <font style="color:rgb(79, 79, 79);">Vue.component</font> | <font style="color:rgb(79, 79, 79);">app.component</font> |
| <font style="color:rgb(79, 79, 79);">Vue.directive</font> | <font style="color:rgb(79, 79, 79);">app.directive</font> |
| <font style="color:rgb(79, 79, 79);">Vue.mixin</font> | <font style="color:rgb(79, 79, 79);">app.mixin</font> |
| <font style="color:rgb(79, 79, 79);">Vue.use</font> | <font style="color:rgb(79, 79, 79);">app.use</font> |
| <font style="color:rgb(79, 79, 79);">Vue.prototype</font> | <font style="color:rgb(79, 79, 79);">app.config.globalProperties</font> |


+ `app.component` 注册全局组件
+ `app.config` 全局配置对象eg:app.config.globalProperties.x=99  在所有的vc上都能看到这个x

如果是ts文件，找不到这个x，可以在main.ts中配置，参考如下：

[https://cn.vuejs.org/guide/typescript/options-api.html#augmenting-global-properties](https://cn.vuejs.org/guide/typescript/options-api.html#augmenting-global-properties)

+ `app.directive`注册全局指令
+ `app.mount` 挂载
+ `app.unmount` 卸载
+ `app.use` 安装插件

## 7.4.【其他】
参考官网：[https://v3-migration.vuejs.org/zh/breaking-changes/](https://v3-migration.vuejs.org/zh/breaking-changes/)

+ 过渡类名 `v-enter` 修改为 `v-enter-from`、过渡类名 `v-leave` 修改为 `v-leave-from`。
+ <font style="color:rgb(79, 79, 79);">移除</font>`<font style="color:rgb(79, 79, 79);">keyCode</font>`<font style="color:rgb(79, 79, 79);">作为 </font>`<font style="color:rgb(79, 79, 79);">v-on</font>`<font style="color:rgb(79, 79, 79);"> 的修饰符，同时也不再支持</font>`<font style="color:rgb(79, 79, 79);">config.keyCodes</font>`
+ <font style="color:rgb(79, 79, 79);">移除</font>`<font style="color:rgb(79, 79, 79);">v-on.native</font>`<font style="color:rgb(79, 79, 79);">修饰符</font>
+ `v-model` 指令在组件上的使用已经被重新设计，替换掉了 `v-bind.sync。`
+ `v-if` 和 `v-for` 在同一个元素身上使用时的优先级发生了变化。
+ 移除了`$on`、`$off` 和 `$once` 实例方法。
+ 移除了过滤器 `filter`。
+ 移除了`$children` 实例 `propert`。......
