---
title: "Pinia》"
slug: "vue-vue3-pinia-356d4f75"
summary: ""
category: "vue3"
categoryPath:
  - "前端技术"
  - "Vue"
  - "vue3"
tags: []
status: "published"
sortOrder: 30
cover: ""
originalId: "6a2d291f8a2b1c68f2cac2d4"
originalSlug: "vue-vue3-pinia-356d4f75"
originalStatus: "published"
publishedAt: "2026-03-27T13:28:53.385Z"
updatedAt: "2026-06-17T13:23:50.827Z"
exportedAt: "2026-07-30T15:42:33.614Z"
---
## 4.1、什么是Pinia
### 4.1.1、简介
pinia 是 Vue 的存储库，<u>它允许您跨组件/页面共享状态。就是和vuex一样的实现数据共享。</u>

依据Pinia官方文档，Pinia是2019年由vue.js官方成员重新设计的新一代状态管理器，更替Vuex4成为Vuex5。

Pinia 目前也已经是 vue 官方正式的状态库。适用于 vue2 和 vue3。可以简单的理解成 Pinia 就是 Vuex5。也就是说， Vue3 项目，建议使用Pinia。

### 4.1.2、Pinia的优点
pinia 符合直觉，易于学习。

pinia 是轻量级状态管理工具，大小只有1KB.

pinia 模块化设计，方便拆分。

<u>pinia 没有 mutations，直接在 actions 中操作 state，通过 this.xxx 访问响应的状态，尽管可 以直接操作 state，但是还是推荐在 actions 中操作，保证状态不被意外的改变。</u>

store 的 action 被调度为常规的函数调用，而不是使用 dispatch 方法或者是 MapAction 辅助函数，这是在 Vuex 中很常见的。

支持多个 store。

支持 Vue devtools、SSR、webpack 代码拆分。

<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.nlark.com/yuque/0/2024/png/27167233/1734879490367-e14cd87b-a415-434d-9a02-a5c500d4a88e.png)

## 4.2、Pinia的使用
### 4.2.1、环境安装
在实际开发项目的时候，可以直接在创建时就安装好Pinia，当然我们也可以选择手动安装：

```javascript
yarn add pinia
或者使用 npm
npm install pinia
```

### 4.2.2、基本使用
#### 4.2.2.1、main.ts中配置
```javascript
import { createApp } from 'vue'
import App from '@/App.vue'
// 引入pinia
import { createPinia } from 'pinia'
// 创建pinia
const pinia = createPinia()
const app = createApp(App)
// 注册pinia
app.use(pinia)
app.mount('#app')

```

其中vue2也是可以使用pinia的，基本配置有所区别，具体的可以自己研究下，建议，vue2直接用vuex

```javascript
import { createPinia, PiniaVuePlugin } from 'pinia'

Vue.use(PiniaVuePlugin)
const pinia = createPinia()

new Vue({
  el: '#app',
  // 其他配置...
  // ...
  // 请注意，同一个`pinia'实例
  // 可以在同一个页面的多个 Vue 应用中使用。 
  pinia,
})

```

#### 4.2.2.2、src/store/xxx.ts 创建stroe
注意pinia自动模块化，不需要我们是去手动设置，对应组件，可以设置对应的store，例如这里有一个student.vue组件，我们就可以建议一个student.js的仓库，写法有两种，一种是比较贴合之前vuex的写法，采用的是**Option Store**的写法，一种是**Setup Store**的写法。

这里先介绍**Option Store**的写法

defineStore 是需要传参数的

<font style="color:#DF2A3F;">第一个参数是id，就是一个唯一的值，简单点说就可以理解成是一个命名空间.</font>

<font style="color:#DF2A3F;">第二个参数就是一个对象，里面有三个模块需要处理，第一个是 state，第二个是 getters，第三个是 actions。</font>

```javascript
//定义关于son组件的store
import {defineStore} from 'pinia'
//返回的函数统一使用useXXX作为命名方案，这是约定的规矩
// defineStore('唯一标识'，{配置项})
const useSon = defineStore("son",{
    // 完整写法
    // state:() =>{
    //     return {
    //         myname:'jack',
    //         myage:18
    //     }
    // },
    // 简写
    state:() => ({
        myname:'jack',
        myage:18
    }),
    
    getters: {},

  	actions: {}
})

//暴露这个useSon模块
export default useSon
```

#### <font style="color:rgb(85, 86, 102);">4.2.2.3、在组件中使用</font>
注意：<u>在模板使用 ，不用和vuex一样还要.state,直接点state里面的key</u>

```javascript
<script setup lang='ts'>
// 导入创建的sonStore
import useSon from '@/store/son.ts'
// 创建sonStore，里面有我们要的数据
const sonStore = useSon()
console.log(sonStore.myname);
//打印后会发现有我们要的数据,注意此时的数据是放在响应式数据中的，
// 会自动给我们解包，不需要我们自己.state

</script>
<template>
    <div>
        <h3>son组件</h3>
        <!-- 页面中，我们可以直接去使用我们定义的数据，不需要去.state -->
        <h4>姓名：{{ sonStore.myname }}</h4>
        <h4>年龄：{{ sonStore.myage }}</h4>
    </div>
</template>
<style scoped></style>
```

<font style="color:rgb(77, 77, 77);">运行效果： </font>**<font style="color:rgb(77, 77, 77);">可以用vue3的调试工具看pinia</font>**

<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.nlark.com/yuque/0/2025/png/27167233/1735742025791-fb7e3566-bae8-46da-9b54-9932682adab8.png)

#### 4.2.2.4、修改数据（三种方式）
##### （1）、直接修改
```javascript
// 方式一：pinia允许我们直接修改store数据
 sonStore.myage=20
```

##### （2）、批量修改
$patch()原理是进行对象的合并，如果之前有就覆盖

```javascript
// 方式二：通过$patch修改，好处是可以同时修改多个数据
    sonStore.$patch({
        myage:20,
        myname:'杰克'
    })
```

##### （3）、借助action修改（action中可以编写一些业务逻辑）
store/son.ts中

```javascript
import {defineStore} from 'pinia'
const useSon = defineStore("son",{
    state:() => ({
        myname:'jack',
        myage:18
    }),
  	actions: {
        // 修改数据
        updata(val:number){
            this.myage+=val
        }
    },
    getters: {},
})

//暴露这个useSon模块
export default useSon
```

组件中调用，传参数

```javascript
<script setup lang='ts'>
import useSon from '@/store/son.ts'
const sonStore = useSon()
const updataAge = (val: number) => {
    // 方式三：借助action去修改，如果逻辑比较复杂，可以直接写在sonStore中
    sonStore.updata(val)

}
</script>
```

##### （4）、<font style="color:rgb(77, 77, 77);">$reset()函数是重置state数据的</font>
<font style="color:rgb(77, 77, 77);">新增一个重置按钮：</font>

```javascript
 <button @click='sonStore.$reset()'>重置按钮</button>
```

<font style="color:rgb(77, 77, 77);">运行结果：</font><u><font style="color:rgb(77, 77, 77);">点击了修改数据按钮之后在点重置按钮就恢复原始的数据。</font></u>

<font style="color:rgb(77, 77, 77);">完整代码：</font>

<font style="color:rgb(77, 77, 77);">son.vue</font>

```vue
<script setup lang='ts'>
// 导入创建的sonStore
import useSon from '@/store/son.ts'
// 创建sonStore，里面有我们要的数据
const sonStore = useSon()
console.log(sonStore.myname);
//打印后会发现有我们要的数据,注意此时的数据是放在响应式数据中的，会自动给我们解包，不需要我们自己.value

const updataAge = (val: number) => {
    // 方式一：pinia允许我们直接修改store数据
    // sonStore.myage=20
    // 方式二：通过patch修改，好处是可以同时修改多个数据
    // sonStore.$patch({
    //     myage:20,
    //     myname:'杰克'
    // })
    // 方式三：借助action去修改，如果逻辑比较复杂，可以直接写在sonStore中
    sonStore.updata(val)

}
</script>
<template>
    <div>
        <h3>son组件</h3>
        <!-- 页面中，我们可以直接去使用我们定义的数据，不需要去.state -->
        <h4>姓名：{{ sonStore.myname }}</h4>
        <h4>年龄：{{ sonStore.myage }}</h4>
        <button @click="updataAge(1)">修改年龄四种方式</button>
        <button @click='sonStore.$reset()'>重置按钮</button>
    </div>
</template>
<style scoped></style>
```

#### 4.2.2.5、解构方式获取Store中的state数据问题
##### （1）、不能直接解构，否则失去响应式
girl.vue

```javascript
<script setup lang='ts'>
import useGirl from '@/store/girl'
const girlStore = useGirl()
let {myage,myname}=girlStore//直接解构数据
console.log(myage,myname);//可以打印出来数据

const updataGirlIInfo=()=>{
    // girlStore.myage++//有响应式
    myage++//没有响应式
}
</script>
<template>
    <div>
        <h3>girl组件</h3>
        <h4>姓名：{{ girlStore.myname }}</h4>
        <h4>年龄：{{ girlStore.myage }}</h4>
        <button @click="updataGirlIInfo">修改信息</button>
    </div>
</template>
<style scoped></style>
```

##### （2）、**<font style="color:rgb(77, 77, 77);">storeToRefs</font>**<font style="color:rgb(77, 77, 77);">解决</font>
**<font style="color:rgb(77, 77, 77);">pinia提供了一个函数storeToRefs</font>**<font style="color:rgb(77, 77, 77);">解决。引用官方API storeToRef 作用就是</font><u><font style="color:rgb(77, 77, 77);">把结构的数据使用ref做代理</font></u>

<font style="color:rgb(77, 77, 77);">在使用组件中</font>

```javascript
<script setup lang='ts'>
import useGirl from '@/store/girl'
const girlStore = useGirl()
// 导入storeToRefs
import { storeToRefs } from 'pinia';
let { myage, myname } = storeToRefs(girlStore)

const updataGirlIInfo = () => {
    myage.value++
  //此时有响应式了，注意此时myage是ref包裹的对象，需要.value拿数据
}
</script>
<template>
    <div>
        <h3>girl组件</h3>
        <h4>姓名：{{ girlStore.myname }}</h4>
        <h4>年龄：{{ girlStore.myage }}</h4>
        <button @click="updataGirlIInfo">修改信息</button>
    </div>
</template>
<style scoped></style>
```

## 4.3、getters
### 4.3.1、基本使用
<font style="color:rgb(77, 77, 77);">getters 类似于 vue 里面的计算属性，可以对已有的数据进行修饰。不管调用多少次，getters中的函数只会执行一次，且都会缓存。</font>

<font style="color:rgb(77, 77, 77);">定义：</font>

```javascript
import { defineStore } from 'pinia'
const useSon = defineStore("son", {
    state: () => ({
        myname: 'jack',
        myage: 18
    }),
    getters: {
        // 1、反转的基本使用
        reverseMyName(state){
            return state.myname.split('').reverse().join('')
        }
    },
    actions: {}
})

//暴露这个useSon模块
export default useSon

```

组件中使用

```javascript
  <div>
       <h4>反转姓名：{{ sonStore.reverseMyName }}</h4>
  </div>

```

<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.nlark.com/yuque/0/2025/png/27167233/1735744569515-fbe48b68-36bf-409f-9add-b8252a41e429.png)

### 4.3.2、getter中引入另一个getter
<font style="color:rgb(77, 77, 77);">son.vue：</font>

```javascript
 getters: {
        // 定义一个计算属性，接收state，getters对象作为参数
        // 通过this也可以访问在getters中访问其他getters对象
   
        // 2、getter中引入另一个getter
        upCaseRName(){
            console.log(this); //此时的this，是当前的仓库
            return (this.reverseMyName as any).toUpperCase()
        }
    },
```

<font style="color:rgb(77, 77, 77);">组件中使用：</font>

```javascript
<div>
  <h4>反转大写姓名：{{ sonStore.upCaseRName }}</h4>	
</div>

```

### 4.3.3、**<font style="color:rgb(77, 77, 77);">getters中用别的store中的数据</font>**
<font style="color:rgb(77, 77, 77);">son.vue：</font>

```javascript
import { defineStore } from 'pinia'
import useGirl from './girl'
const useSon = defineStore("son", {
    state: () => ({
        myname: 'jack',
        myage: 18
    }),
    getters: {
        // 3、getters中用别的store中的数据
        concatSonAndGirlName(state) {
            // 创建girlStore
            const girlStore = useGirl()
            return state.myname + girlStore.myname
        }
    },
    actions: {}
})

//暴露这个useSon模块
export default useSon

```

组件中使用

```javascript

<div>
  <h4>联合son和girl组件的名字:{{ sonStore.concatSonAndGirlName }}</h4>
</div>

```

### 4.3.4、getters返回函数
```javascript
 getters: {
        // 4、getters返回函数
        addMyage(state) {
            return (val: number) => {
              return  state.myage + val
            }
        }
    },
```

组件中使用：如有需要，还可以传递实参

```javascript
<div>
    <h4>getters传参数：{{ sonStore.addMyage(2) }}</h4>
</div>
```



无参数的 getters 函数接收 state 作为第一个参数，getters 对象作为第二个参数。

有参数的 getters 函数要返回一个新函数，返回的函数可接收任意数量的参数

## 4.4、action异步实现
actions 是可以处理同步，也可以处理异步，同步的话相对来说简单一点.actions类似methods

### 4.4.1、action的同步使用
<font style="color:rgba(0, 0, 0, 0.75);">son模块使用：</font>

```javascript
import { defineStore } from 'pinia'
const useSon = defineStore("son", {
    state: () => ({
        myname: 'jack',
        myage: 18
    }),
    getters: {},
    actions: {
      // 1、同步使用
        updataInfo() {
            this.myname += '@'
            this.myage++
        }
    }
})

//暴露这个useSon模块
export default useSon

```

<font style="color:rgb(77, 77, 77);">组件中：</font>  
<font style="color:rgb(77, 77, 77);">actions函数在组件中使用</font>

```javascript
<script setup lang='ts'>
import useSon from '@/store/son.ts'
const sonStore = useSon()
const updataInfo=()=>{
    sonStore.updataInfo()
}
</script>
<template>
    <div>
        <h3>son组件</h3>
        <h4>姓名：{{ sonStore.myname }}</h4>
        <h4>年龄：{{ sonStore.myage }}</h4>
        <button @click="updataInfo">点击修改数据</button>
    </div>
</template>
<style scoped></style>
```

<font style="color:rgb(85, 86, 102);background-color:rgb(238, 240, 244);">注意：</font>**<font style="color:rgb(85, 86, 102);background-color:rgb(238, 240, 244);">state的结果是undefined</font>**<font style="color:rgb(85, 86, 102);background-color:rgb(238, 240, 244);"> 所以actions只能通过this访问store。getter的话state和this都能访问。</font>

### 4.4.2、action的异步使用
**<font style="color:rgb(77, 77, 77);">在 actions 处理异步的时候呢，我们一般是与 async 和 await 连用。</font>**

```javascript
import { defineStore } from 'pinia'
import axios from 'axios'
const useSon = defineStore("son", {
    state: () => ({
        myname: 'jack',
        myage: 18,
        list: []
    }),
    getters: {},
    actions: {
        // 2、异步操作
        async getData() {
            // 请求
            let res = await axios.get('http://localhost:3000/list')
            // 直接赋值给state中的数据
            this.list = res.data
        }
    }
})

//暴露这个useSon模块
export default useSon

```

<font style="color:rgb(77, 77, 77);">组件使用：</font>

```javascript

const getData = () => {
    sonStore.getData()
}
```

## 4.5、Setup Store写法
### 4.5.1、基本写法
创建创库store有两种写法，option Store和setup写法，在使用时没有区别是一样的，就是在创建时所有区别，<u>不用写配置项，直接写代码逻辑</u>

定义 store仓库语法：

**<font style="color:#DF2A3F;">defineStore（仓库的名称， () => {数据逻辑....}）</font>**

son.ts

```javascript
import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
const useSon = defineStore("son", () => {
    // 1、声明仓库数据
    let myname = ref('jack')
    let myage = ref(18)
    // 2、仓库处理函数actions(就像操作普通函数一样)
    const handleMyname = () => {
        myname.value += '@'
    }
    // 3、计算属性
    const reverseName = computed(() => {
        return myname.value.split('').reverse().join('')
    })
    // 4、将数据返回出去
    return {
        myage, myname, handleMyname, reverseName
    }
})

//暴露这个useSon模块
export default useSon

```

### 4.5.2、action异步请求
girl.ts

```javascript
import axios from "axios";
import { defineStore } from "pinia";
import { ref } from "vue";
const useGirl = defineStore('girl',()=>{
    // 1、声明仓库数据
    let myname=ref('lusi')
    let myage=ref(20)
    let list=ref([])
    // 2、异步请求
    const getList=async ()=>{
        let res= await axios.get('http://localhost:3000/list')
        list.value=res.data
    }
    return {
        myname,myage,getList,list
    }

})
export default useGirl
```

### 4.5.3、解决跨域
#### 4.5.3.1、方式一 配置代理
步骤1、在vite.config.js文件（使用vite创建的vue3项目就是在vite.config.js，使用vue-cli创建的vue3项目就是在vue.config.js文件里）里面添加以下代码就可以<u>实现一个代理服务器解决跨域请求。</u>

这段配置是用于设置一个代理服务器的规则，通常用在开发环境中，以便将前端应用对后端api的请求转发到实际的后端服务上

```javascript
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
// https://vitejs.dev/config/
export default defineConfig({
 plugins: [vue()],
  
 // 设置代理解决跨域请求问题
 server: {
  proxy: {
   '/api': {//匹配/api开头的请求
​    target: 'http://127.0.0.1:3000',//转发的目标服务器
​    changeOrigin: true,//允许跨域
​    rewrite: (path) => path.replace(/^\/api/, '')//在请求转发前移除/api
   }
  }
 }
})

```

<font style="color:rgb(77, 77, 77);">（使用</font><font style="color:rgb(252, 85, 49) !important;">vue</font><font style="color:rgb(77, 77, 77);">-cli创建的vue3项目的配置有些许不同，总的来说原理是一样的）</font>

```javascript
export default defineConfig({
 plugins: [vue()],//原本有的
 // 设置代理解决跨域请求问题
 devServer: {
  proxy: {
   '/api': {//匹配/api开头的请求
​    target: 'http://127.0.0.1:3000',//转发的目标服务器
​    changeOrigin: true,//允许跨域
​    pathRewrite: {  
        '^/api': ''  
      }//在请求转发前移除/api
   }
  }
 }
})

```

这段配置的详细解释：

**proxy: **在这个上下文中，proxy对象用于定义代理规则。这些规则告诉代理服务器如何转发对特定路径的请求到另一个服务器（即后端服务器）

**'/api': **这是一个路径匹配模式。这里的配置意味着，所有以/api开头的请求都将被代理服务器捕获并转发

**target: **指定了代理请求的目标地址。在上面的配置中表示：所有被捕获的请求都将被转发到[http://127.0.0.1:3000](http://127.0.0.1:3000)这个地址。这个通常是你的后端服务运行的地址

**changeOrigin: **设置为true时，这个选项会告诉代理服务器在转发请求时修改请求的origin头部，以匹配目标URL。这在后端服务需要根据origin头部来验证请求来源时非常有用

**rewrite: **这是一个函数，用于在请求被转发之前修改请求的URL路径。在这个例子中，rewrite函数使用正则表达式/^\/api/来匹配所有以/api开头的路径，并使用path.replace(/^\/api/, '')来移除这些路径中的/api部分。这意味着，如果前端应用请求/api/users，那么被转发到后端服务的请求路径将是/users。



#### 4.5.3.2、方式二 cros
<font style="color:rgb(77, 77, 77);">如果使用的是</font>`<font style="color:rgb(199, 37, 78);background-color:rgb(249, 242, 244);">express</font>`<font style="color:rgb(77, 77, 77);">(</font><font style="color:rgb(78, 161, 219) !important;">node.js</font><font style="color:rgb(77, 77, 77);">)创建的服务端可以使用</font>`<font style="color:rgb(199, 37, 78);background-color:rgb(249, 242, 244);">cors</font>`<font style="color:rgb(77, 77, 77);">中间件来添加CORS支持，首先需要下载cors包</font>

```javascript
npm install cors
```

<font style="color:rgb(77, 77, 77);">然后在项目的app.js文件里引入cors包</font>

```javascript
const cors = require('cors')；//引入cors包
app.use(cors());//允许来自任何源的请求
```

<font style="color:rgb(77, 77, 77);">完成以上操作就可以在浏览器页面重新发送请求了</font>

<font style="color:rgb(79, 79, 79);">注意：方法一是在项目的前端代码中配置的，而方法二是在项目的服务端代码中进行配置。我们只要使用其中的一种方法就可以完成跨域请求的配置。</font>

### 4.5.4、$subscribe监听数据变化
需求：点击按钮请求数据，并当数据发生变化时，将数据放到本地

注意:nanoid是一个专门产生id的库，

安装：npm i nanoid 

导入：import {nanoid} from 'nanoid'

调用：nanoid()

<u><font style="color:#DF2A3F;">通过 store 的</font></u>**<u><font style="color:#DF2A3F;"> $subscribe() </font></u>**<u><font style="color:#DF2A3F;">方法侦听 state 及其变化</font></u>

创建store.js

```javascript
import axios from 'axios'
import { defineStore } from 'pinia'
import { reactive } from 'vue'
import { nanoid } from 'nanoid'
const useChild = defineStore("child", () => {
    // 1、声明数据

    const loveList = reactive<{ id: any, title: string }[]>(
        // 如果本地有，就从本地拿，如果没有就是空数组
        JSON.parse((localStorage.getItem('loveList') as string)) || [{ id: nanoid(), title: 'abc1' }]
    )
    // 2、添加数据
    const addFun = (keyword: string) => {
        let obj = {
            id: nanoid(),
            title: keyword
        }
        loveList.push(obj)
        // console.log(loveList);
    }

    return { loveList, addFun }
})

//暴露这个useSon模块
export default useChild

```

使用组件

```javascript
<script setup lang='ts'>
import useChild from '@/store/child'
import { storeToRefs } from 'pinia';
import { ref } from 'vue';
const childStore = useChild()

const keyword = ref<string>('')
const addFun = () => {
    childStore.addFun(keyword.value)
}
let { loveList } = storeToRefs(childStore)

// 当childStore数据发生变化时
childStore.$subscribe((mutate, state) => {
    // console.log(mutate);			//当前childstore仓库
    console.log(state.loveList);//当前数据
    localStorage.setItem('loveList', JSON.stringify(state.loveList))
})

</script>
<template>
    <div>
        <h3>child组件</h3>
        <input type="text" v-model="keyword">
        <button @click="addFun">添加</button>
        <ul>
            <li v-for="item in loveList" :key="item.id">{{ item.title }}</li>
        </ul>
    </div>
</template>
<style scoped></style>
```

## 4.5、pinia持久化存储
<font style="color:rgb(77, 77, 77);">【官网地址】： </font>[Pinia插件官网](https://prazdevs.github.io/pinia-plugin-persistedstate/zh/guide/)

<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.nlark.com/yuque/0/2024/png/27167233/1734918211945-ae899e20-ec84-4486-a2fb-3a6a8682a55c.png)

### 4.5.1、安装
```javascript
npm i pinia-plugin-persistedstate
```

### 4.5.2、<font style="color:rgb(77, 77, 77);">插件添加到 pinia 实例</font>
```javascript
import { createPinia } from 'pinia'
// 导入
import persist from 'pinia-plugin-persistedstate'

const pinia = createPinia()
// 注册
pinia.use(persist)

```

### <font style="color:rgb(77, 77, 77);">4.5.3、基本用法</font>
<u><font style="color:rgb(77, 77, 77);">创建 Store 时，将 persist 选项设置为 true。 persist意思是坚持；持续；保持</font></u>

<font style="color:rgb(77, 77, 77);">选项式语法</font>

```javascript
import { defineStore } from 'pinia'

export const useStore = defineStore('main', {
  state: () => {
    return {
      someState: '你好 pinia',
    }
  },
  // 开启持久化
  persist: true,
})

```

<font style="color:rgb(77, 77, 77);">组合式语法：</font>

```javascript
import { defineStore } from 'pinia'

export const useStore = defineStore(
  'main',
  () => {
    const someState = ref('你好 pinia')
    return { someState }
  },
  // 开启持久化
  {
    persist: true,
  },
)

```

<font style="color:rgb(77, 77, 77);">现在，</font><u><font style="color:rgb(77, 77, 77);">你的整个 Store 将使用默认持久化配置保存。</font></u>

<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.nlark.com/yuque/0/2025/png/27167233/1735797940512-d933a90c-a76c-4861-9289-731eff81ab40.png)

+ <font style="color:rgba(0, 0, 0, 0.75);">将上面创建的两个仓库进行持久化，我们本地就能进行存储数据了。</font>

### 4.5.4、配置本地存储的key名字
#### （1）、配置
该插件的默认配置如下:

使用 localStorage 进行存储

store.$id 作为 storage 默认的 key

使用 JSON.stringify/JSON.parse 进行序列化/反序列化

整个 state 默认将被持久化

如何你不想使用默认的配置，那么你可以**将一个对象传递给 Store 的 persist 属性来配置持久化。**

```javascript
import { defineStore } from 'pinia'

export const useStore = defineStore('main', {
  state: () => ({
    someState: '你好 pinia',
  }),
  persist: {
    // 在这里进行自定义配置
  },
})

```

#### <font style="color:rgb(77, 77, 77);">（2）、key</font>
<font style="color:rgb(77, 77, 77);">类型：</font><font style="color:rgb(252, 85, 49);">string</font><font style="color:rgb(77, 77, 77);">  
</font><font style="color:rgb(77, 77, 77);">默认值：store.$id  
</font><font style="color:rgb(77, 77, 77);">Key 用于引用 storage 中的数据</font>

<font style="color:rgb(77, 77, 77);">例如</font>

```javascript
import { defineStore } from 'pinia'

export const useStore = defineStore('store', {
  state: () => ({
    someState: '你好 pinia',
  }),
  persist: {
    // 自定义key
    key: 'my-custom-key',
  },
})

```

<font style="color:rgb(77, 77, 77);">这个 Store 将被持久化存储在 localStorage 中的 my-custom-key key 中。</font>

### <font style="color:rgb(77, 77, 77);">4.5.5、</font>**<font style="color:rgb(79, 79, 79);"> 指定仓库中某些数据进行持久化</font>**
#### 选项式写法
**<font style="color:rgb(77, 77, 77);">paths</font>**

<font style="color:rgb(85, 86, 102);background-color:rgb(238, 240, 244);">类型：string[]  
</font><font style="color:rgb(85, 86, 102);background-color:rgb(238, 240, 244);">默认值：undefined  
</font><font style="color:rgb(85, 86, 102);background-color:rgb(238, 240, 244);">用于指定 state 中哪些数据需要被持久化。[] 表示不持久化任何状态，undefined 或 null 表示持久化整个 state。</font>

```javascript
import { defineStore } from 'pinia'

export const useStore = defineStore('store', {
  state: () => ({
    save: {
      me: 'saved',
      notMe: 'not-saved',
    },
    saveMeToo: 'saved',
  }),
  persist: {
    // 选中谁进行持久化
    paths: ['save.me', 'saveMeToo'],
  },
})

```

<font style="color:rgb(77, 77, 77);">该 store 中, 只有 save.me 和 saveMeToo 被持久化，而 save.notMe 不会被持久化。</font>

#### <font style="color:rgb(77, 77, 77);">组合式写法：</font>
```typescript
import { defineStore } from 'pinia'
import { reactive, ref } from 'vue'
import { nanoid } from 'nanoid'
const useChild = defineStore(
    "child",
    () => {
        // 1、声明数据
        const loveList = reactive<{ id: any, title: string }[]>(
            // 如果本地有，就从本地拿，如果没有就是空数组
            JSON.parse((localStorage.getItem('loveList') as string)) || [{ id: nanoid(), title: 'abc1' }]
        )
        const msg = ref('childName') //不需要本地存储的数据
        // 2、添加数据
        const addFun = (keyword: string) => {
            let obj = {
                id: nanoid(),
                title: keyword
            }
            loveList.push(obj)
            // console.log(loveList);
        }

        return { loveList, addFun, msg }
    },
    {
        // persist: true //默认将整个仓库数据持久化,key值默认是标识
        persist: {
            key: 'child-store',//自定义key值名
            pick: ['loveList', 'msg']//指定某些值本地存储
        }
    }

)

//暴露这个useSon模块
export default useChild
```

<font style="color:rgba(0, 0, 0, 0.75);">更多参考持久化插件官网配置。</font>

## 4.6、总结
<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.nlark.com/yuque/0/2024/png/27167233/1734918624057-84e596e0-aea5-4334-9944-51ff35a5ee32.png)
