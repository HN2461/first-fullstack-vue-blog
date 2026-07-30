---
title: "Vue3基本语法》"
slug: "vue-vue3-vue3-b1c84be6"
summary: ""
category: "vue3"
categoryPath:
  - "前端技术"
  - "Vue"
  - "vue3"
tags: []
status: "published"
sortOrder: 50
cover: ""
originalId: "6a2d291e8a2b1c68f2cac2d0"
originalSlug: "vue-vue3-vue3-b1c84be6"
originalStatus: "published"
publishedAt: "2026-03-27T13:28:44.180Z"
updatedAt: "2026-06-17T13:23:51.677Z"
exportedAt: "2026-07-30T15:42:33.614Z"
---
## 2.1、setup的使用
### 2.1.1、基本使用
它是vue3新增的一个<u>配置项</u>，值为一个**<font style="color:#DF2A3F;">函数</font>**,所有的组合式API 方法都写在在setup函数中。

组件中用到的数据,方法 计算属性，事件方法，监听函数，都配置在setup 中。

setup的函数值为一个函数，该**<u>函数的返回值</u>**：

<u>可以是一个</u><u><font style="color:#DF2A3F;">对象</font></u><u>，对象中的属性和方法均可以在模板中直接使用。</u>

<u>可以是一个</u><u><font style="color:#DF2A3F;">回调函数</font></u><u>，回调函数的返回值，直接渲染到页面中</u>

代码如下：

myContent.vue

**需求：**两种方式实现todolist功能

```vue
<template>
  <div>
    <h3>{{ msg }}</h3>
    <ul>
      <li v-for="item in contentList" :key="item.id">
        {{ item.value }}
        <button @click="delFun(item.id)">del</button>
      </li>
    </ul>
  </div>
</template>

<script>
export default {
  name: 'myContent',
  // optionAPI 选项式写法
  // data() {
  //   return {
  //     msg: 'myContent',
  //     contentList: [
  //       {
  //         id: 1, value: 'aaa'
  //       },
  //       {
  //         id: 2, value: 'bbb'
  //       },
  //       {
  //         id: 3, value: 'ccc'
  //       },
  //       {
  //         id: 4, value: 'ddd'
  //       },
  //     ]

  //   }
  // },
  // methods: {
  //   delFun(id) {
  //     this.contentList = this.contentList.filter((item) => {
  //       return item.id != id
  //     })
  //   }
  // },
  //  CompositionAPI写法
  setup() {
    //1、 定义数据
    let msg = 'myContent'
    let contentList = [
      {
        id: 1, value: 'aaa'
      },
      {
        id: 2, value: 'bbb'
      },
      {
        id: 3, value: 'ccc'
      },
      {
        id: 4, value: 'ddd'
      },
    ]
    //2、 定义方法
    const delFun = (id) => {
      //2.1 此时页面是没有响应式的
      // 因为 Vue 的响应式系统基于 Proxy，只能检测到对原数组的操作，而无法检测到变量引用的变化。
      contentList = contentList.filter((item) => {
        return item.id != id
      })
      // 2.2、数据是有变化的
      console.log(contentList);
    }
    // 返回一个对象（重点）
    // return { msg, contentList, delFun }
    // 返回一个函数,在这里无法显示，可以去app里演示，基本用不到，了解下即可
    // 返回的函数可以看出渲染，页面直接变成返回的内容
    return () => {
      return 'myContent'
    }
  }

};
</script>

<style scoped></style>
```

### 2.1.2、<font style="color:rgb(79, 79, 79);">setup执行时间</font>
**<font style="color:#DF2A3F;"> setup 在beforeCreate之前执行，且setup中获取不到this，this为undefined</font>**

```vue
//······
    // 创建前回调
  beforeCreate() {
    console.log('beforeCreate');
  },
  setup() {
    // 4、setup执行时间
    console.log('setup');
    // 5、this
    console.log(this);//undefined
    //·······
  }
```

<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.nlark.com/yuque/0/2024/png/27167233/1735486503333-9d8ee852-4223-4786-9048-69a29facd776.png)

### <font style="color:rgb(77, 77, 77);">2.1.3、setup 函数尽量不要和vue2.x混合使用</font>
+ <font style="color:rgb(77, 77, 77);">vue2.x中的（data,methods,computed）可以访问到 setup中的属性和方法</font>
+ <font style="color:rgb(77, 77, 77);">在setup中不能访问vue2.x中的配置数据和方法如（data,methods,computed）</font>
+ <u><font style="color:rgb(77, 77, 77);">2可以访问3, 3不可访问2</font></u>

<font style="color:rgb(77, 77, 77);">代码如下：</font>

```vue
data() {
  return {
   //·····
    myname: this.myname,
    myage:18
  }
},
 setup() {
    // 6、setup中定义的数据，data()中可以使用
    const myname = 'jack'
    // 7、setup中无法使用data中的数据
    // console.log(myage);//找不到
 }
```

### <font style="color:rgb(77, 77, 77);">2.1.4、setup语法糖</font>
`<font style="color:rgb(51, 51, 51);background-color:rgb(243, 244, 244);">setup</font>`<font style="color:rgb(51, 51, 51);">函数有一个语法糖，这个语法糖，可以让我们把</font>`<font style="color:rgb(51, 51, 51);background-color:rgb(243, 244, 244);">setup</font>`<font style="color:rgb(51, 51, 51);">独立出去，代码如下：</font>

<font style="color:rgb(51, 51, 51);">注意，</font><u><font style="color:rgb(51, 51, 51);">如果要配置组件的开发者工具名字，要么写两个script标签，要么配合插件去使用</font></u>

<font style="color:rgb(51, 51, 51);">myContent.vue</font>

```vue
<template>
  <div>
    <h3>{{ msg }}</h3>
    <ul>
      <li v-for="item in contentList" :key="item.id">
        {{ item.value }}
        <button @click="delFun(item.id)">del</button>
      </li>
    </ul>
  </div>
</template>

<!-- 没用插件前，给组件加名字，需要再写一个script -->
<!-- <script lang="ts">
export default {
  name: 'myContent',
};
</script> -->

<!-- 1、setup 语法糖写法   -->
<!-- 2、配置开发者工具的名字 -->
<script setup name="myContent123">
let msg = 'myContent'
let contentList = [
  {
    id: 1, value: 'aaa'
  },
  {
    id: 2, value: 'bbb'
  },
  {
    id: 3, value: 'ccc'
  },
  {
    id: 4, value: 'ddd'
  },
]
const delFun = (id) => {
  //2.1 此时页面是没有响应式的
  contentList = contentList.filter((item) => {
    return item.id != id
  })
  // 2.2、数据是有变化的
  console.log(contentList);
}
</script>

<style scoped></style>
```

<font style="color:rgb(51, 51, 51);">扩展：上述代码，还需要编写一个不写</font>`<font style="color:rgb(51, 51, 51);background-color:rgb(243, 244, 244);">setup</font>`<font style="color:rgb(51, 51, 51);">的</font>`<font style="color:rgb(51, 51, 51);background-color:rgb(243, 244, 244);">script</font>`<font style="color:rgb(51, 51, 51);">标签，去指定组件名字，比较麻烦，我们可以借助</font>`<font style="color:rgb(51, 51, 51);background-color:rgb(243, 244, 244);">vite</font>`<font style="color:rgb(51, 51, 51);">中的插件简化</font>

**<font style="color:#DF2A3F;">第一步：</font>**`**<font style="color:#DF2A3F;background-color:rgb(243, 244, 244);">npm i vite-plugin-vue-setup-extend -D</font>**`

**<font style="color:#DF2A3F;">第二步：</font>**`**<font style="color:#DF2A3F;background-color:rgb(243, 244, 244);">vite.config.ts</font>**`

```vue
import { fileURLToPath, URL } from 'node:url'

  import { defineConfig } from 'vite'
  import vue from '@vitejs/plugin-vue'
  //这个是自带的开发者工具
  import vueDevTools from 'vite-plugin-vue-devtools'
  
  // 导入VueSetupExtend
  import VueSetupExtend from 'vite-plugin-vue-setup-extend'

  // https://vite.dev/config/
  export default defineConfig({
    plugins: [
      vue(),
      vueDevTools(),
      // 注册VueSetupExtend
      VueSetupExtend()
    ],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url))
      },
    },
  })

```

<font style="color:rgb(51, 51, 51);">第三步：</font>`<font style="color:rgb(51, 51, 51);background-color:rgb(243, 244, 244);"><script setup lang="ts" name="myContent123"></font>`



## 2.2、reactive
+ **<font style="color:rgb(51, 51, 51);">作用：</font>**<font style="color:rgb(51, 51, 51);">定义一个</font>**<font style="color:rgb(51, 51, 51);">响应式对象</font>**<font style="color:rgb(51, 51, 51);">（基本类型不要用它，要用</font>`<font style="color:rgb(51, 51, 51);background-color:rgb(243, 244, 244);">ref</font>`<font style="color:rgb(51, 51, 51);">，否则报错）</font>
+ **<font style="color:rgb(51, 51, 51);">语法：</font>**`<font style="color:rgb(51, 51, 51);background-color:rgb(243, 244, 244);">let 响应式对象= reactive(源对象)</font>`<font style="color:rgb(51, 51, 51);">。</font>
+ **<font style="color:rgb(51, 51, 51);">返回值：</font>**<font style="color:rgb(51, 51, 51);">一个</font>`<font style="color:rgb(51, 51, 51);background-color:rgb(243, 244, 244);">Proxy</font>`<font style="color:rgb(51, 51, 51);">的实例对象，简称：响应式对象。</font>
+ **<font style="color:rgb(51, 51, 51);">注意点：</font>**`<font style="color:rgb(51, 51, 51);background-color:rgb(243, 244, 244);">reactive</font>`<font style="color:rgb(51, 51, 51);">定义的响应式数据是“深层次”的。</font>

**需求：**实现todolist功能，reactive响应式数据

myContent.vue

```vue
<template>
  <div>
    <h3>{{ msg }}</h3>
    <input type="text" v-model="state.keyword">
    <button @click="addList">add</button>
    <ul>
      <li v-for="item in state.contentList" :key="item.id">
        {{ item.value }}
        <button @click="delFun(item.id)">del</button>
      </li>
    </ul>
  </div>
</template>
<script setup name="myContent123">
import { reactive } from 'vue';
// 不需要响应式，可以直接定义
let msg = 'myContent'
// 1、reactive定义响应式数据，注意只能是复杂数据类型
let state = reactive({
  keyword: '',
  contentList: [
    {
      id: 1, value: 'aaa'
    },
    {
      id: 2, value: 'bbb'
    },
    {
      id: 3, value: 'ccc'
    },
    {
      id: 4, value: 'ddd'
    },
  ]
})
// 2、添加响应式数据
const addList = () => {
  let obj = {
    id: +new Date(),
    value: state.keyword
  }
  state.contentList.push(obj)
}
const delFun = (id) => {
  state.contentList = state.contentList.filter((item) => {
    return item.id != id
  })
  console.log(state.contentList);
}
</script>

<style scoped></style>
```

## 2.3、ref
### 2.3.1、ref的基本使用
+ **<font style="color:rgb(51, 51, 51);">作用：</font>**<font style="color:rgb(51, 51, 51);">定义响应式变量。</font>
+ **<font style="color:rgb(51, 51, 51);">语法：</font>**`<font style="color:rgb(51, 51, 51);background-color:rgb(243, 244, 244);">let xxx = ref(初始值)</font>`<font style="color:rgb(51, 51, 51);">。</font>
+ **<font style="color:rgb(51, 51, 51);">返回值：</font>**<font style="color:rgb(51, 51, 51);">一个</font>`<font style="color:rgb(51, 51, 51);background-color:rgb(243, 244, 244);">RefImpl</font>`<font style="color:rgb(51, 51, 51);">的实例对象，简称</font>`<font style="color:rgb(51, 51, 51);background-color:rgb(243, 244, 244);">ref对象</font>`<font style="color:rgb(51, 51, 51);">或</font>`<font style="color:rgb(51, 51, 51);background-color:rgb(243, 244, 244);">ref</font>`<font style="color:rgb(51, 51, 51);">，</font>`<font style="color:#DF2A3F;background-color:rgb(243, 244, 244);">ref</font>`<font style="color:#DF2A3F;">对象的</font>`<font style="color:#DF2A3F;background-color:rgb(243, 244, 244);">value</font>`**<font style="color:#DF2A3F;">属性是响应式的</font>**<font style="color:#DF2A3F;">。</font>
+ **<font style="color:rgb(51, 51, 51);">注意点：</font>**
    - `<u><font style="color:rgb(51, 51, 51);background-color:rgb(243, 244, 244);">JS</font></u>`<u><font style="color:rgb(51, 51, 51);">中操作数据需要：</font></u>`<u><font style="color:rgb(51, 51, 51);background-color:rgb(243, 244, 244);">xxx.value</font></u>`<u><font style="color:rgb(51, 51, 51);">，但模板中不需要</font></u>`<u><font style="color:rgb(51, 51, 51);background-color:rgb(243, 244, 244);">.value</font></u>`<u><font style="color:rgb(51, 51, 51);">，直接使用即可。</font></u>
    - <font style="color:rgb(51, 51, 51);">对于</font>`<font style="color:rgb(51, 51, 51);background-color:rgb(243, 244, 244);">let name = ref('张三')</font>`<font style="color:rgb(51, 51, 51);">来说，</font>`<font style="color:rgb(51, 51, 51);background-color:rgb(243, 244, 244);">name</font>`<font style="color:rgb(51, 51, 51);">不是响应式的，</font>`<font style="color:rgb(51, 51, 51);background-color:rgb(243, 244, 244);">name.value</font>`<font style="color:rgb(51, 51, 51);">是响应式的。</font>
+ <font style="color:rgb(51, 51, 51);">其实</font>`<font style="color:rgb(51, 51, 51);background-color:rgb(243, 244, 244);">ref</font>`<font style="color:rgb(51, 51, 51);">接收的数据可以是：</font>**<font style="color:rgb(51, 51, 51);">基本类型</font>**<font style="color:rgb(51, 51, 51);">、</font>**<font style="color:rgb(51, 51, 51);">对象类型</font>**<font style="color:rgb(51, 51, 51);">。</font>
+ <font style="color:rgb(51, 51, 51);">若</font>`<font style="color:rgb(51, 51, 51);background-color:rgb(243, 244, 244);">ref</font>`<font style="color:rgb(51, 51, 51);">接收的是对象类型，内部其实也是调用了</font>`<font style="color:rgb(51, 51, 51);background-color:rgb(243, 244, 244);">reactive</font>`<font style="color:rgb(51, 51, 51);">函数。</font>

**需求：**实现todolist功能，ref响应式数据

myContent.vue

```vue
<template>
  <div>
    <h3>{{ msg }}</h3>
    <input type="text" v-model="keyword">
    <button @click="addList">add</button>
    <ul>
      <li v-for="item in contentList" :key="item.id">
        {{ item.value }}
        <button @click="delFun(item.id)">del</button>
      </li>
    </ul>
  </div>
</template>
<script setup name="myContent123">
import { ref } from 'vue';
let msg = 'myContent'
// 1、定义基础数据类型
let keyword = ref('')
let contentList = ref(
  [
    {
      id: 1, value: 'aaa'
    },
    {
      id: 2, value: 'bbb'
    },
    {
      id: 3, value: 'ccc'
    },
    {
      id: 4, value: 'ddd'
    },
  ]
)
// 2、添加响应式数据
const addList = () => {
  let obj = {
    id: +new Date(),
    value: keyword.value 
    //注意，我们的数据，封装在ref数据中的value内，使用时，需要去.vaule
  }
  contentList.value.push(obj)
}
const delFun = (id) => {
  contentList.value = contentList.value.filter((item) => {
    return item.id != id
  })
  console.log(contentList.value);
}
</script>

<style scoped></style>
```

### <font style="color:rgb(51, 51, 51);">2.3.2. 【ref 对比 reactive】</font>
<font style="color:rgb(51, 51, 51);">宏观角度看：</font>

1. `<font style="color:rgb(119, 119, 119);background-color:rgb(243, 244, 244);">ref</font>`<font style="color:rgb(119, 119, 119);">用来定义：</font>**<font style="color:rgb(119, 119, 119);">基本类型数据</font>**<font style="color:rgb(119, 119, 119);">、</font>**<font style="color:rgb(119, 119, 119);">对象类型数据</font>**<font style="color:rgb(119, 119, 119);">；</font>
2. `<font style="color:rgb(119, 119, 119);background-color:rgb(243, 244, 244);">reactive</font>`<font style="color:rgb(119, 119, 119);">用来定义：</font>**<font style="color:rgb(119, 119, 119);">对象类型数据</font>**<font style="color:rgb(119, 119, 119);">。</font>
+ <font style="color:rgb(51, 51, 51);">区别：</font>
1. `<font style="color:rgb(119, 119, 119);background-color:rgb(243, 244, 244);">ref</font>`<font style="color:rgb(119, 119, 119);">创建的变量必须使用</font>`<font style="color:rgb(119, 119, 119);background-color:rgb(243, 244, 244);">.value</font>`<font style="color:rgb(119, 119, 119);">。</font>
2. `**<font style="color:#DF2A3F;background-color:rgb(243, 244, 244);">reactive</font>**`**<font style="color:#DF2A3F;">重新分配一个新对象，会失去响应式（可以使用</font>**`**<font style="color:#DF2A3F;background-color:rgb(243, 244, 244);">Object.assign</font>**`**<font style="color:#DF2A3F;">去整体替换）。</font>**

原理分析

        1. `reactive` 的响应式机制

`reactive` 创建的是一个响应式对象，它通过 `Proxy` 拦截对象的操作。

当你直接替换整个数组时，`Proxy` 无法检测到这种变化，因为它是针对原数组的操作进行拦截的，而不是针对变量的引用变化。

        2. `ref` 的响应式机制

`ref` 创建的是一个响应式引用对象，通过 `.value` 来访问和修改值。

当你修改 `ref` 的 `.value` 时，Vue 的响应式系统会检测到变化并更新视图。

+ <font style="color:rgb(51, 51, 51);">使用原则：</font>
1. <font style="color:rgb(119, 119, 119);">若需要一个基本类型的响应式数据，必须使用</font>`<font style="color:rgb(119, 119, 119);background-color:rgb(243, 244, 244);">ref</font>`<font style="color:rgb(119, 119, 119);">。</font>
2. <font style="color:rgb(119, 119, 119);">若需要一个响应式对象，层级不深，</font>`<font style="color:rgb(119, 119, 119);background-color:rgb(243, 244, 244);">ref</font>`<font style="color:rgb(119, 119, 119);">、</font>`<font style="color:rgb(119, 119, 119);background-color:rgb(243, 244, 244);">reactive</font>`<font style="color:rgb(119, 119, 119);">都可以。</font>
3. <font style="color:rgb(119, 119, 119);">若需要一个响应式对象，且层级较深，推荐使用</font>`<font style="color:rgb(119, 119, 119);background-color:rgb(243, 244, 244);">reactive</font>`<font style="color:rgb(119, 119, 119);">。</font>

### 2.3.3、<font style="color:rgb(51, 51, 51);">【标签及组件上的 ref 属性】</font>
<font style="color:rgb(51, 51, 51);">作用：用于注册模板引用。</font>

+ <font style="color:rgb(119, 119, 119);">用在普通</font>`<font style="color:rgb(119, 119, 119);background-color:rgb(243, 244, 244);">DOM</font>`<font style="color:rgb(119, 119, 119);">标签上，获取的是</font>`<font style="color:rgb(119, 119, 119);background-color:rgb(243, 244, 244);">DOM</font>`<font style="color:rgb(119, 119, 119);">节点。</font>
+ <font style="color:rgb(119, 119, 119);">用在组件标签上，获取的是组件实例对象。</font>

<font style="color:rgb(51, 51, 51);">用在普通</font>`<font style="color:rgb(51, 51, 51);background-color:rgb(243, 244, 244);">DOM</font>`<font style="color:rgb(51, 51, 51);">标签上：</font>

<font style="color:rgb(51, 51, 51);">app.vue</font>

```vue
<template>
  <div class="app">
    <myHeader class="myheader" />
    <div class="main">
      <mySide class="myside" />
      <myContent class="mycontent" ref="myContentCom" />
    </div>
    <div>---------------------------------</div>
    <h1 ref="h1Element">ref的标签属性使用</h1>
    <input type="text" ref="intElement">
    <button @click="handlerDOM">操作DOM</button>
  </div>
</template>

<script setup>
import myHeader from "./components/myHeader.vue";
import mySide from "./components/mySide.vue";
import myContent from "./components/myContent.vue";
import { ref } from "vue";

// 1、组件换成setup的写法，直接导入，不需要注册（components） 
// export default {
//   components: {
//     mySide,
//     myHeader,
//     myContent,
//   },
// };
// 2、获取到h1和input标签,h1的字体变红，input的value值=abc
let h1Element = ref('')
let intElement = ref('')
const handlerDOM = () => {
  // console.log(h1Element);//标签在ref对象的value中
  h1Element.value.style.color = 'red'
  intElement.value.value = 'abc'
}
</script>

```

<font style="color:rgb(51, 51, 51);">用在组件标签上：</font>

<font style="color:rgb(51, 51, 51);">app.vue</font>

```vue
<template>
  <div class="app">
    <myHeader class="myheader" />
    <div class="main">
      <mySide class="myside" />
      <myContent class="mycontent" ref="myContentCom" />
    </div>
    <div>---------------------------------</div>
    <button @click="handlerMyContent">获取组件</button>
  </div>
</template>

<script setup>
import myHeader from "./components/myHeader.vue";
import mySide from "./components/mySide.vue";
import myContent from "./components/myContent.vue";
import { ref } from "vue";
// 3、获取到myContent组件
let myContentCom = ref('')
const handlerMyContent = () => {
  // 注意此时可以拿到组件，但是要是想拿到数据，还需要子组件的同意
    // 还需在对应子组件中通过defineExpose进行数据暴露
  console.log(myContentCom.value.msg);
  console.log(myContentCom.value.keyword);

}
</script>
```

myContent.vue

```vue
<script setup name="myContent123">
import { ref, defineExpose } from 'vue';
let msg = 'myContent'
let keyword = ref('')
let contentList = ref(
  [
    {
      id: 1, value: 'aaa'
    },
    {
      id: 2, value: 'bbb'
    },
    {
      id: 3, value: 'ccc'
    },
    {
      id: 4, value: 'ddd'
    },
  ]
)
//······
// 同意将数据交给外部
  // contentList数据没对外暴露,就看不到这个数据
defineExpose({ msg, keyword })
</script>
```

## 2.4、toRef()&toRefs()
数据还是想要用reactive去定义，但是使用时，想要直接去使用，自然想到可以用到解构

+ <font style="color:rgb(51, 51, 51);">作用：将一个响应式对象中的每一个属性，转换为</font>`<font style="color:rgb(51, 51, 51);background-color:rgb(243, 244, 244);">ref</font>`<font style="color:rgb(51, 51, 51);">对象。创建一个对响应式对象上某个属性的引用</font>
+ <font style="color:rgb(51, 51, 51);">备注：</font>`<font style="color:rgb(51, 51, 51);background-color:rgb(243, 244, 244);">toRefs</font>`<font style="color:rgb(51, 51, 51);">与</font>`<font style="color:rgb(51, 51, 51);background-color:rgb(243, 244, 244);">toRef</font>`<font style="color:rgb(51, 51, 51);">功能一致，但</font>`<font style="color:rgb(51, 51, 51);background-color:rgb(243, 244, 244);">toRefs</font>`<font style="color:rgb(51, 51, 51);">可以批量转换。</font>
+ **<font style="color:#DF2A3F;">语法：toRef(对象,哪个属性),	toRefs(对象)</font>**
+ <font style="color:rgb(51, 51, 51);">注意:</font>
    - <font style="color:rgb(51, 51, 51);">使用时,需要先导入</font>
    - <u><font style="color:rgb(51, 51, 51);">既然转成ref定义的变量了，使用的时候就必须要.value</font></u>

**需求：**实现todolist功能，如果数据是reactive形式，快速的提取我们要的变量

```vue
<template>
  <div>
    <h3>{{ msg }}</h3>
    <input type="text" v-model="keyword">
    <button @click="addList">add</button>
    <ul>
      <li v-for="item in contentList" :key="item.id">
        {{ item.value }}
        <button @click="delFun(item.id)">del</button>
      </li>
    </ul>
  </div>
</template>
<script setup name="myContent123">
import { ref, reactive, toRef, toRefs } from 'vue';

let msg = 'myContent'
// 定义数据
let state = reactive({
  keyword: '',
  contentList: [
    {
      id: 1, value: 'aaa'
    },
    {
      id: 2, value: 'bbb'
    },
    {
      id: 3, value: 'ccc'
    },
    {
      id: 4, value: 'ddd'
    },
  ]
})
//1、 数据还是想要用reactive去定义，但是使用时，想要直接去使用，自然想到可以用到解构
// let { keyword, contentList } = state
// console.log(keyword);
// console.log(contentList);
// 但会发现，我们的删除功能无法实现响应式了

// 2、在vue3中的解构，我们有专门的方法 toRef(),toRefs(),
  // 注意，这里既然转成ref定义的变量了，使用的时候就必须要.value
// 2.1、toRef(对象，哪个属性)
// let keyword = toRef(state, 'keyword')
// let contentList = toRef(state, 'contentList')
// 2.2、toRefs(对象)
let { keyword, contentList } = toRefs(state)

// 添加响应式数据
const addList = () => {
  let obj = {
    id: +new Date(),
    value: keyword.value
  }
  contentList.value.push(obj)
}
  // 注意这里采用的是fliter的方式删除，会改变原数据，
  //如果采用的splice的方式，对于reactive的数据来说，不改变原数据，还是有响应式的
const delFun = (id) => {
  contentList.value = contentList.value.filter((item) => {
    return item.id != id
  })
  // console.log(contentList);
}
</script>

<style scoped></style>
```

## 2.5、computed
**需求：**名字反转显示

```vue
<template>
  <div>
    <h3>myheader</h3>
    <input type="text" v-model="usename">
    <h4>反转之后的输入:{{ reverseUsename }}</h4>
    <input type="text" v-model="reverseUsename">
    <!-- <button>折叠导航</button> -->
  </div>
</template>

<!-- 1、optionApi的写法 -->
<!-- <script>
export default {
  name: '',
  data() {
    return {
      usename: ''
    }
  },
  computed: {
    reverseUsename() {
      return this.usename.split('').reverse().join('')
    }
  }
}
</script> -->

<script setup>
import { computed, ref } from 'vue';

let usename = ref('')
// 写法1、computed(()=>{return ·····})，这种方式只读不能改
// const reverseUsename = computed(() => {
//   //注意ref定义的变量，需要去.value
//   return usename.value.split('').reverse().join('')
// })

  // 完整写法
const reverseUsename = computed(
  {
    get() {
      //注意ref定义的变量，需要去.value
      return usename.value.split('').reverse().join('')
    },
    set(value) {
      console.log(`数据被改了${value}`);

    }
  }
)

</script>

<style scoped></style>
```

## 2.6、watch
+ 作用：监视数据的变化（和`Vue2`中的`watch`作用一致）
+ 特点：`Vue3`中的`watch`只能监视以下**四种数据**：

> 1. `ref`定义的数据(基本数据类型,复杂数据类型)。
> 2. `reactive`定义的数据(复杂数据类型)。
> 3. 函数返回一个值（`getter`函数）。
> 4. 一个包含上述内容的数组。
>

我们在`Vue3`中使用`watch`的时候，通常会遇到以下几种情况：

### 2.6.1、ref定义的基本数据
<u><font style="color:rgb(51, 51, 51);">监视</font></u>`<u><font style="color:rgb(51, 51, 51);background-color:rgb(243, 244, 244);">ref</font></u>`<u><font style="color:rgb(51, 51, 51);">定义的【基本类型】数据：直接写</font></u>**<u><font style="color:#DF2A3F;">数据名</font></u>**<u><font style="color:rgb(51, 51, 51);">即可，监视的是其</font></u>`<u><font style="color:rgb(51, 51, 51);background-color:rgb(243, 244, 244);">value</font></u>`<u><font style="color:rgb(51, 51, 51);">值的改变。</font></u>

**<font style="color:rgb(51, 51, 51);">需求：</font>**<font style="color:rgb(51, 51, 51);">监听ref定义的数据在input中的改变</font>

<font style="color:rgb(51, 51, 51);">myheader.vue</font>

```vue
<template>
  <div>
    <h3>myheader</h3>
    <input type="text" v-model="usename">
    <button @click="stopWatchFun">结束监听</button>
    <!-- <button>折叠导航</button> -->
  </div>
</template>

<script setup>
import { ref, watch } from 'vue';

let usename = ref('')
// 情况1：监听ref定义的基本数据类型
const stopWatch = watch(usename, (n, o) => {
  console.log('usename变化了', n, o);
})
// 停止监听
const stopWatchFun = () => {
  stopWatch()
}

</script>

<style scoped></style>
```

### 2.6.2、ref定义的对象
<font style="color:rgb(51, 51, 51);">监视</font>`<font style="color:rgb(51, 51, 51);background-color:rgb(243, 244, 244);">ref</font>`<font style="color:rgb(51, 51, 51);">定义的【对象类型】数据：直接写</font><u><font style="color:rgb(51, 51, 51);">数据名</font></u><font style="color:rgb(51, 51, 51);">，监视的是对象的【</font>**<font style="color:#DF2A3F;">地址值</font>**<font style="color:rgb(51, 51, 51);">】，</font><u><font style="color:rgb(51, 51, 51);">若想监视对象内部的数据，要</font></u><u><font style="color:#DF2A3F;">手动开启深度监视</font></u><u><font style="color:rgb(51, 51, 51);">。</font></u>

<font style="color:rgb(119, 119, 119);">注意：</font>

+ **<font style="color:rgb(119, 119, 119);">若修改的是</font>**`**<font style="color:rgb(119, 119, 119);background-color:rgb(243, 244, 244);">ref</font>**`**<font style="color:rgb(119, 119, 119);">定义的对象中的属性，</font>**`**<font style="color:rgb(119, 119, 119);background-color:rgb(243, 244, 244);">newValue</font>**`**<font style="color:rgb(119, 119, 119);"> 和 </font>**`**<font style="color:rgb(119, 119, 119);background-color:rgb(243, 244, 244);">oldValue</font>**`**<font style="color:rgb(119, 119, 119);"> 都是新值，因为它们是同一个对象。</font>**
+ **<font style="color:rgb(119, 119, 119);">若修改整个</font>**`**<font style="color:rgb(119, 119, 119);background-color:rgb(243, 244, 244);">ref</font>**`**<font style="color:rgb(119, 119, 119);">定义的对象，</font>**`**<font style="color:rgb(119, 119, 119);background-color:rgb(243, 244, 244);">newValue</font>**`**<font style="color:rgb(119, 119, 119);"> 是新值， </font>**`**<font style="color:rgb(119, 119, 119);background-color:rgb(243, 244, 244);">oldValue</font>**`**<font style="color:rgb(119, 119, 119);"> 是旧值，因为不是同一个对象了。</font>**

```vue
<template>
  <div>
    <h3>myheader</h3>
    <input type="text" v-model="usename.firstName"><br>
    <input type="text" v-model="usename.lastName"><br>
    <button @click="usename = { firstName: 'zhang', lastName: 'san' }">修改usename</button>
    <button @click="stopWatchFun">结束监听</button>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue';
// 情况2：监听ref定义的复杂数据类型
/* 
监视【ref】定义的【对象类型】数据，监视的是对象的地址值，
  若想监视对象内部属性的变化，需要手动开启深度监视
  
watch的第一个参数是：被监视的数据
watch的第二个参数是：监视的回调
watch的第三个参数是：配置对象（deep、immediate等等.....） 
*/
let usename = ref({
  firstName: '',
  lastName: ''
})
const stopWatch = watch(usename, (n, o) => {
  console.log('usename变化了', n, o);

}, { deep: true, immediate: true })
// 停止监听
const stopWatchFun = () => {
  stopWatch()
}
</script>

<style scoped></style>
```

### 2.6.3、<font style="color:rgb(51, 51, 51);background-color:rgb(243, 244, 244);">reactive定义的数据</font>
<font style="color:rgb(51, 51, 51);">监视</font>`<font style="color:rgb(51, 51, 51);background-color:rgb(243, 244, 244);">reactive</font>`<font style="color:rgb(51, 51, 51);">定义的【对象类型】数据，且</font>**<u><font style="color:rgb(51, 51, 51);">默认开启了深度监视。</font></u>**`**<u><font style="color:rgb(51, 51, 51);">oldValue</font></u>**`**<u><font style="color:rgb(51, 51, 51);"> 无法正确获取</font></u>**

```vue
<template>
  <div>
    <h3>myheader</h3>
    <input type="text" v-model="usename.firstName"><br>
    <input type="text" v-model="usename.lastName"><br>
    <button @click="updateUsename">修改usename</button>
    <button @click="stopWatchFun">结束监听</button>
  </div>
</template>

<script setup>
import { reactive, ref, watch } from 'vue';
// 情况3：监听reactive定义的数据
// 默认开启深度监视
let usename = reactive({
  firstName: '',
  lastName: ''
})
const stopWatch = watch(usename, (n, o) => {
  console.log('usename变化了', n, o);
})

// 停止监听
const stopWatchFun = () => {
  stopWatch()
}
// 修改整个对象,没有效果,监听也会丢失
const updateUsename = () => {
   //   usename = reactive({
  //     firstName: '张',
  //     lastName: 'san'
  //   }
  // )
  //   console.log(usename);
}
</script>

<style scoped></style>
```

### 2.6.4、getter()函数式
<font style="color:rgb(51, 51, 51);">监视</font>`<font style="color:rgb(51, 51, 51);background-color:rgb(243, 244, 244);">ref</font>`<font style="color:rgb(51, 51, 51);">或</font>`<font style="color:rgb(51, 51, 51);background-color:rgb(243, 244, 244);">reactive</font>`<font style="color:rgb(51, 51, 51);">定义的</font><u><font style="color:rgb(51, 51, 51);">【对象类型】数据中的</font></u>**<u><font style="color:#DF2A3F;">某个属性</font></u>**<font style="color:rgb(51, 51, 51);">，注意点如下：</font>

1. <font style="color:rgb(51, 51, 51);">若该属性值</font>**<font style="color:rgb(51, 51, 51);">不是</font>**<font style="color:rgb(51, 51, 51);">【对象类型】，需要写成函数形式。</font>
2. <font style="color:rgb(51, 51, 51);">若该属性值是</font>**<font style="color:rgb(51, 51, 51);">依然</font>**<font style="color:rgb(51, 51, 51);">是【对象类型】，可直接编，也可写成函数，建议写成函数。</font>

<font style="color:rgb(51, 51, 51);">结论：监视的要是对象里的属性，那么最好写函数式，注意点：</font><u><font style="color:rgb(51, 51, 51);">若是对象监视的是地址值，需要关注对象内部，需要手动开启深度监视。</font></u>

```vue
<template>
  <div>
    <h3>myheader</h3>
    <input type="text" v-model="usename.firstName"><br>
    <!-- <input type="text" v-model="usename.lastName"><br> -->
    <input type="text" v-model="usename.lastName.a"><br>

    <button @click="updateUsename">修改usename</button>
    <button @click="stopWatchFun">结束监听</button>
  </div>
</template>

<script setup>
import { reactive, ref, watch } from 'vue';
// 情况4：监听属性函数的写法
let usename = reactive({
  firstName: '',
  lastName: {
    a:1
  }
})
// 写法1：监听对象的属性值是基本数据类型
// const stopWatch = watch(()=>usename.firstName, (n, o) => {
//   console.log('usename.firstName发生变化了', n, o);
// })
// 写法2：监听对象的属性值是复杂数据类型
const stopWatch = watch(usename.lastName, (n, o) => {
  console.log('usename.firstName发生变化了', n, o);
}, { deep: true })


// 停止监听
const stopWatchFun = () => {
  stopWatch()
}
</script>

<style scoped></style>
```

### 2.6.5、监听多个数据-数组形式
```vue
// 情况5：监听多个数据
let usename = reactive({
  firstName: '',
  lastName: {
    a: 1
  }
})
const stopWatch = watch([() => usename.firstName, () => usename.lastName.a], (n, o) => {
  console.log('数据发生变化了', n, o);
})
```

### 2.6.6、监听案例
根据用户选中的作者名，渲染对应的文章

模拟数据

db.json

```json
{
    "list": [
        {
            "id": 1,
            "author": "jack",
            "content": "jack-content-111"
        },
        {
            "id": 2,
            "author": "jack",
            "content": "jack-content-222"
        },
        {
            "id": 3,
            "author": "jack",
            "content": "jack-content-333"
        },
        {
            "id": 4,
            "author": "tom",
            "content": "tom-content-111"
        },
        {
            "id": 5,
            "author": "tom",
            "content": "tom-content-222"
        },
        {
            "id": 6,
            "author": "tom",
            "content": "tom-content-111"
        },
        {
            "id": 7,
            "author": "lusi",
            "content": "lusi-content-111"
        },
        {
            "id": 8,
            "author": "lusi",
            "content": "lusi-content-222"
        },
        {
            "id": 9,
            "author": "lusi",
            "content": "lusi-content-333"
        }
    ]
}
```

实现代码

```vue
<template>
  <div>
    <select name="" id="" v-model="keyword">
      <option value="jack">jack</option>
      <option value="tom">tom</option>
      <option value="lusi">lusi</option>
    </select>
    <ul>
      <li v-for="item in list" :key="item.id">{{ item.content }}</li>
    </ul>

  </div>
</template>
<script setup name="App">
import axios from 'axios';
import { ref, watch } from 'vue';

let keyword = ref('')
  // 注意，这里使用的是ref定义的复杂数据类型，下面list.value，可以直接赋值
  //如果是reactive定义的复杂数据类型，不能直接赋值，否则导致数据错乱
let list = ref([])
watch(keyword, async (n) => {
  console.log(n);
  let res = await axios.get(`http://localhost:3000/list?author=${n}`)
  list.value = res.data
  console.log(list);
})

</script>
<style scoped></style>
```

## 2.7、<font style="color:rgb(51,51,51);">watchEffect</font>函数 
### 2.7.1、<font style="color:rgb(51,51,51);">watch：</font>
+ <font style="color:rgb(51,51,51);">具有一定的惰性lazy 第一次页面展示的时候不会执行，只有数据变化的时候才会执行 </font>
+ <font style="color:rgb(51,51,51);">参数可以拿到当前值和原始值 </font>
+ <font style="color:rgb(51,51,51);">可以侦听多个数据的变化，用一个侦听器承载</font>

```vue
watch(author,async (n)=>{
  // 发送异步请求
  let res=await axios.get(`http://localhost:3000/list?author=${n}`)
  list.value=res.data      
},{immediate:true})
```

### <font style="color:rgb(51,51,51);">2.7.2、</font><font style="color:rgb(51,51,51);">watchEffect</font>
+ <font style="color:rgb(51,51,51);"> </font><u><font style="color:rgb(51,51,51);">立即执行</font></u><font style="color:rgb(51,51,51);">，没有惰性，页面的首次加载就会执行。</font>
+ <font style="color:rgb(51,51,51);"> </font><u><font style="color:rgb(51,51,51);">自动检测内部代码</font></u><font style="color:rgb(51,51,51);">，代码中有依赖便会执行 </font>
+ <font style="color:rgb(51,51,51);">不需要传递要侦听的内容会自动感知代码依赖，不需要传递很多参数，</font><u><font style="color:rgb(51,51,51);">只要传递一个回调函数</font></u><font style="color:rgb(51,51,51);"> </font>
+ <u><font style="color:rgb(51,51,51);">不能获取之前数据的值只能获取当前值 </font></u>
+ <font style="color:rgb(51,51,51);">一些异步的操作放在这里会更加合适 </font>

```vue
<template>
  <div>
    <select name="" id="" v-model="keyword">
      <option value="jack" selected>jack</option>
      <option value="tom">tom</option>
      <option value="lusi">lusi</option>
    </select>
    <ul>
      <li v-for="item in list" :key="item.id">{{ item.content }}</li>
    </ul>

  </div>
</template>
<script setup name="App">
import axios from 'axios';
import { ref, watchEffect } from 'vue';

let keyword = ref('')
let list = ref([])
watchEffect(async () => {
  let res = await axios.get(`http://localhost:3000/list?author=${keyword.value}`)
  list.value = res.data
  // console.log(list);
})

</script>
<style scoped></style>
```

注意：reactive定义的数据不能直接赋值

解决方案看链接：[reactive定义数据不能直接赋值解决方案](https://blog.csdn.net/qq_38974163/article/details/122426426?fromshare=blogdetail&sharetype=blogdetail&sharerId=122426426&sharerefer=PC&sharesource=m0_64346035&sharefrom=from_link)

## 2.8、生命周期
**概念**

Vue组件实例在创建时要经历一系列的初始化步骤，在此过程中Vue会在合适的时机，调用特定的函数，从而让开发者有机会在特定阶段运行自己的代码，这些特定的函数统称为：生命周期钩子  
**规律：**  
生命周期整体分为四个阶段，分别是：**创建、挂载、更新、销毁**，每个阶段都有两个钩子，一前一后。  
**Vue2的生命周期**  
创建阶段：**beforeCreate**、**created**  
挂载阶段：beforeMount、**mounted**  
更新阶段：beforeUpdate、updated  
销毁阶段：**beforeDestroy**、destroyed  
**Vue3的生命周期**  
创建阶段：setup  
挂载阶段：onBeforeMount、**onMounted**  
更新阶段：onBeforeUpdate、onUpdated  
<u>卸载阶段</u>：**onBeforeUnmount**、onUnmounted  
**常用的钩子**

onMounted(挂载完毕)、onUpdated(更新完毕)、onBeforeUnmount(卸载之前)

app.vue

```vue
<script setup>
import { onBeforeMount, onBeforeUpdate, onMounted, onUpdated, ref } from 'vue';
import Child from './components/child.vue';
let num = ref(0)
let isShow = ref(true)
console.log('setup');
onBeforeMount(() => {
  console.log('onBeforeMount');
})
onMounted(() => {
  console.log('onMounted');
})
onBeforeUpdate(() => {
  console.log('onBeforeUpdate');
})
onUpdated(() => {
  console.log('onUpdated');
})
</script>
<template>
  <div>
    <h1>app组件</h1>
    <h1>num:{{ num }}</h1>
    <button @click="num++">addOne</button>
    <Child v-if="isShow"></Child>
    <button @click="isShow = !isShow">显示/隐藏</button>
  </div>
</template>
<style scoped></style>
```

child.vue

```vue
<script setup>
import { onBeforeUnmount, onUnmounted } from 'vue';

onBeforeUnmount(() => {
    console.log('onBeforeUnmount');

})
onUnmounted(() => {
    console.log('onUnmounted');

})
</script>
<template>
    <div>
        <h2>child组件</h2>
    </div>
</template>
<style scoped></style>
```

## 2.9、hook函数
+ <font style="color:rgb(77, 77, 77);">什么是</font>`<font style="color:rgb(77, 77, 77);">hook</font>`<font style="color:rgb(77, 77, 77);">？—— 本质是一个函数，把</font>`<font style="color:rgb(77, 77, 77);">setup</font>`<font style="color:rgb(77, 77, 77);">函数中使用的Composition API进行了封装。</font>
+ <font style="color:rgb(77, 77, 77);">类似于vue2.x中的</font>`<font style="color:rgb(77, 77, 77);">mixin</font>`<font style="color:rgb(77, 77, 77);">。</font>
+ <font style="color:rgb(77, 77, 77);">自定义</font>`<font style="color:rgb(77, 77, 77);">hook</font>`<font style="color:rgb(77, 77, 77);">的优势:</font>**<font style="color:rgb(77, 77, 77);"> 复用代码；让</font>**`**<font style="color:rgb(77, 77, 77);">setup</font>**`**<font style="color:rgb(77, 77, 77);">中的逻辑更清楚易懂。</font>**

**使用：在src中创建hooks文件夹，在其中建立一个个js或ts的use***文件，每个文件都包含着可以复用的函数**

一个组件中有多个功能，此时我们可以用hook封装

一个封装的hook，可以再多个组件中使用

**需求：**son组件中有多个功能

num++、todolist功能、求坐标的功能

且求坐标的功能需要放到app组件中复用

src/hooks/useAddOne.ts

```typescript
import { ref } from 'vue'
export default function () {
    // num++功能
    let num = ref(0)
    const addOne = () => {
        num.value++
    }
    return { num, addOne }

}
```

src/hooks/useToDo.ts

```typescript
import { reactive, ref } from 'vue'
export default function () {
    // todolist功能
    let list = reactive([{ id: 1, title: 'aa' }, { id: 2, title: 'bb' }, { id: 3, title: 'cc' }, { id: 4, title: 'dd' },])
    let keyword = ref('')
    const delOne = (index) => {
        list.splice(index, 1)
    }
    const addList = () => {
        let obj = {
            id: +new Date(),
            title: keyword.value
        }
        list.push(obj)
    }
    return { list, keyword, delOne, addList }

}
```

src/hooks/usePageXY.ts

```typescript
import { ref, onMounted, onUnmounted } from 'vue';

const useMousePosition = () => {
    const x = ref(0)
    const y = ref(0)
    const updateMouse = (e) => {
        x.value = e.pageX
        y.value = e.pageY
    }
    onMounted(() => {
        document.addEventListener('click', updateMouse)
    })
    onUnmounted(() => {
        document.removeEventListener('click', updateMouse)
    })
    return { x, y }
}
export default useMousePosition
```

组件中使用 

son.vue

```vue
<script setup lang='ts'>
// num++功能
import useAddOne from '@/hooks/useAddOne';
let { num, addOne } = useAddOne()
// todolist功能
import useToDo from '@/hooks/useToDo';
let { keyword, list, addList, delOne } = useToDo()

// 获取x，y坐标
import useMousePosition from '@/hooks/usePageXY'
let { x, y } = useMousePosition()

</script>
<template>
    <div>
        <h3>son组件</h3>
        <h4>num:{{ num }}</h4>
        <button @click="addOne">点击++</button>
        <hr>
        <input type="text" v-model="keyword"><button @click="addList">添加</button>
        <ul>
            <li v-for="item, index in list " :key="item.id">
                {{ item.title }} <button @click="delOne(index)">del</button>
            </li>
        </ul>
        <hr>
        <h4>x:{{ x }}</h4>
        <h4>y:{{ y }}</h4>

    </div>
</template>
<style scoped></style>
```

app.vue

```vue
<script setup lang='ts'>
import son from './components/son.vue';
import useMousePosition from '@/hooks/usePageXY'
let { x, y } = useMousePosition()

</script>
<template>
  <div class="app">
    <son class="son"></son>
    <hr>
    <h3>x轴坐标：{{ x }}</h3>
    <h3>y轴坐标：{{ y }}</h3>
  </div>
</template>
<style>
div,
h2,
h3 {
  padding: 0;
  margin: 0;
}

.app {
  background-color: #ccc;
  border: 5px solid red;
}

.son {
  background-color: #bfa;
}
</style>
```

##
