---
title: "第 07 篇：Vue 组件通讯：props、emit、provide、inject、事件总线"
slug: "vue-vue-9736eb78"
summary: "单向数据流：谁的数据谁修改，子组件不能直接修改父组件传入的props。耦合度最小化：优先使用官方推荐方案，避免强耦合方式（如$parent/$children）。场景决定方案：不同层级、不同规模的项目选择最适合的通信方式。"
category: "vue辅助"
categoryPath:
  - "我的总结"
  - "Vue"
  - "vue辅助"
tags:
  - "Vue"
  - "组件通讯"
  - "props"
  - "emit"
  - "provide/inject"
status: "published"
sortOrder: 70
cover: ""
originalId: "6a2d291f8a2b1c68f2cac4b6"
originalSlug: "vue-vue-9736eb78"
originalStatus: "published"
publishedAt: "2026-05-08T13:16:41.998Z"
updatedAt: "2026-07-31T11:16:24.612Z"
exportedAt: "2026-08-03T10:17:08.920Z"
---
# 第 07 篇：Vue 组件通讯：props、emit、provide、inject、事件总线

## 📌 核心原则
1. **单向数据流**：谁的数据谁修改，子组件不能直接修改父组件传入的 `props`
2. **耦合度最小化**：优先使用官方推荐方案，避免强耦合方式（如 `$parent`/`$children`）
3. **场景决定方案**：不同层级、不同规模的项目选择最适合的通信方式

---

# 一、父组件 → 子组件：Props
## 🎯 适用场景
最基础的通信方式，父组件向**直接子组件**传递数据（只读，单向数据流）

## ⚙️ 核心原理
+ 父组件通过属性形式传递数据，**Props 绑定语法**：`:属性名="数据"` 是 `v-bind:属性名="数据"` 的简写，用于动态传递父组件的响应式数据或函数；
+ 子组件声明接收 `props`，可指定类型、默认值、校验规则

---

## 📘 Vue2 实现
### 父组件
```vue
<template>
  <Child 
    :msg="parentMsg"
    :user-info="user"
    :age="18"
  />
</template>
<script>
import Child from './Child.vue'

export default {
  components: { Child },
  data() {
    return {
      parentMsg: '父组件消息',
      user: { name: '张三', gender: '男' }
    }
  }
}
</script>

```

### 子组件（三种写法）
```vue
<template>
  <!-- 在模板中直接使用 props -->
  <div>{{ msg }} - {{ userInfo.name }} - {{ age }}</div>
</template>
<script>
export default {
  // 写法1：数组形式（仅名称）
  // props: ['msg', 'userInfo', 'age']

  // 写法2：对象形式（指定类型）
  props: {
    msg: String,
    userInfo: Object,
    age: Number
  }

  // 写法3：完整校验
  // props: {
  //   msg: {
  //     type: String,
  //     required: true,
  // 如果是对象 / 数组类型，default 需用函数返回（如 default: () => ({ name: '默认' })）。
  // 确保多个组件之间使用的都是独立的，基本数据类型不用，本来就是独立的
  //     default: '默认消息'
  //   },
  //   age: {
  //     type: Number,
  // 自定义校验函数，接收 prop 的值作为参数，返回布尔值。
  // 返回 false 时，Vue 会在控制台抛出警告，常用于校验值的范围、格式等。
  //     validator: (value) => value >= 0 && value <= 150
  //   }
  // }

  // 在 JS 中通过 this 访问 props
  console.log('姓名：', this.name)
}
</script>

```

---

## 📘 Vue3 实现（组合式API + `<script setup>`）
### 父组件
```vue
<template>
  <ChildComponent 
    title="父组件标题"
    :count="100"
    is-show
  />
</template>
<script setup>
import ChildComponent from './ChildComponent.vue'
</script>

```

### 子组件
```vue
<template>
  <div>标题：{{ props.title }}</div>
  <!-- 这里是简写，等价于 {{ props.count }}，
  Vue 允许在模板中直接访问 props 的属性名（无需写 props. 前缀）。 -->
  <div>计数：{{ count }}</div>
</template>
<script setup>
// 写法1：简单声明（仅指定props名称，无类型校验）
// const props = defineProps(['title', 'count'])

// 写法2：类型校验（推荐）
const props = defineProps({
  title: String,
  count: Number,
  isShow: Boolean
})

// 访问props（注意：组合式 API 中不能用 this，直接用 props.xxx）
console.log(props.title)
</script>

```

### 高级用法（完整校验）
```vue
<script setup>
const props = defineProps({
  title: {
    type: String,
    required: true,
    default: '默认标题'
  },
  list: {
    type: Array,
    default: () => [1, 2, 3]  // 数组默认值用函数返回
  },
  user: {
    type: Object,
    default: () => ({ name: '张三', age: 18 })
  },
  status: {
    type: [String, Number],   // 多类型
    default: 'normal'
  },
  score: {
    type: Number,
    validator: (val) => val >= 0 && val <= 100,
    default: 0
  }
})
</script>

```

---

## ⚠️ 关键注意事项
| 要点 | 说明 |
| --- | --- |
| **单向数据流** | 子组件**不能直接修改** `props`，需通过 `emit` 通知父组件修改 |
| **命名转换** | 父组件传递可使用短横线 `user-info`，子组件接收用驼峰 `userInfo` |
| **布尔类型** | 仅写属性名等价于 `:isShow="true"` |
| **解构响应式** | Vue3 中直接解构 `props` 会丢失响应式，需用 `toRefs`/`toRef` |
| **默认值函数** | 对象/数组类型的 `default` 必须用函数返回，避免引用共享 |


### Vue3 解构保持响应式
```vue
<script setup>
import { toRefs, toRef } from 'vue'
// Vue3 中直接解构 props 会丢失响应式，必须通过 toRefs（批量）或 toRef（单个）处理。
const props = defineProps({ title: String, count: Number })

// ✅ 保持响应式
// toRefs：将响应式对象的每个属性转换为独立的 ref，解构后仍保持响应式连接
const { title } = toRefs(props)  // title 是 ref，通过 title.value 访问

// toRef：为响应式对象的单个属性创建 ref 引用，适用于只需解构个别属性的场景
const count = toRef(props, 'count')  // count 是 ref，通过 count.value 访问
</script>

```



### 核心差异总结
| **特性** | **Vue 2 (Options API)** | **Vue 3 (Composition API)** |
| :--- | :--- | :--- |
| 声明方式 | `props: { ... }` | `defineProps({ ... })` |
| JS 中访问方式 | `this.propsName` | `props.propsName`（无 this） |
| 引用类型默认值 | 函数返回（如 `default(){}`） | 同 Vue 2 |
| 兼容性 | 仅选项式 API | 同时支持选项式 / 组合式 API |


---

# 二、子组件 → 父组件：$emit + 自定义事件
## 🎯 适用场景
子组件向**直接父组件**传递数据或触发父组件方法（反向通信）

## ⚙️ 核心原理
+ 子组件触发自定义事件并携带参数
+ 父组件监听事件，在回调中接收数据

---

## 📘 Vue2 实现
### 子组件
```vue
<template>
  <button @click="sendToParent">传递数据</button>
</template>
<script>
export default {
  data() {
    return { childMsg: '子组件消息', count: 100 }
  },
  methods: {
    sendToParent() {
      // $emit 第一个参数是事件名（父组件监听用），后续参数是要传递的数据；
      this.$emit('child-event', this.childMsg, this.count)
    }
  }
}
</script>

```

### 父组件
```vue
<template>
  <!-- 父组件使用子组件，监听自定义事件 child-event -->
  <Child @child-event="handleChildEvent" />
  <p>{{ childData1 }} - {{ childData2 }}</p>
</template>
<script>
import Child from './Child.vue'

export default {
  components: { Child },
  data() {
    return { childData1: '', childData2: '' }
  },
  methods: {
    handleChildEvent(msg, count) {
      // 接收子组件传递的数据
      this.childData1 = msg
      this.childData2 = count
    }
  }
}
</script>

```

---

## 📘 Vue3 实现（组合式API + `<script setup>`）
### 子组件
```vue
<template>
  <button @click="handleClick">传递数据</button>
</template>
<script setup>
// 定义要触发的事件
// 声明子组件要向外触发的自定义事件名称的内置方法（无需导入）。返回一个 emit 函数；
const emit = defineEmits(['sendMsg', 'changeCount'])

const handleClick = () => {
  emit('sendMsg', '子组件消息')   // 单个参数
  emit('changeCount', 100)        // 多个参数可依次传递
}
</script>

```

### 父组件
```vue
<template>
  <Child 
    @send-msg="handleSendMsg"
    @change-count="handleChangeCount"
  />
  <div>{{ msg }} - {{ count }}</div>
</template>
<script setup>
import { ref } from 'vue'
import Child from './Child.vue'

const msg = ref('')
const count = ref(0)

const handleSendMsg = (childMsg) => msg.value = childMsg
const handleChangeCount = (childCount) => count.value = childCount
</script>

```

---

## 📌 进阶用法：`update:propName` 实现“伪双向绑定”
### 子组件
```vue
<script setup>
const props = defineProps(['count'])
const emit = defineEmits(['update:count'])

const increase = () => {
  emit('update:count', props.count + 1)
}
</script>

```

### 父组件
`v-model:prop名` 语法糖简化 `:prop名 + @update:prop名` 的写法  ；`update:propName` 是 Vue 约定的事件命名规范，用于子组件通知父组件更新指定 prop，实现 “伪双向绑定”（本质仍是单向数据流）。  

```vue
<template>
  <!-- 推荐：v-model 语法糖 -->
  <Child v-model:count="parentCount" />
  
  <!-- 等价写法 -->
  <Child :count="parentCount" @update:count="parentCount = $event" />
</template>

```

---

## ⚠️ 关键注意事项
| 要点 | 说明 |
| --- | --- |
| **事件命名规范** | 推荐用短横线 `kebab-case`（`@send-msg`），与原生事件风格统一 |
| `<script setup>`** 无 this** | **不能**使用 `this.$emit`，必须用 `defineEmits` 定义 |
| **事件声明（推荐）** | 子组件声明 `emits` 或 `defineEmits` 可提升代码可读性 |
| **TypeScript 校验** | `defineEmits` 支持泛型，可强制参数类型 |


### TS 类型校验
```vue
<script setup lang="ts">
const emit = defineEmits<{
  (e: 'sendMsg', msg: string): void
  (e: 'changeCount', count: number): void
}>()
</script>

```

---

# 三、兄弟组件通信：EventBus（事件总线）
## 🎯 适用场景
**Vue2 专用**，无嵌套关系的兄弟组件/任意组件通信（轻量级）。**Vue3 已移除 `$on`/`$off`/`$once` API**，EventBus 模式不再可用，推荐使用第三方库 `mitt` 或直接使用 Pinia

## ⚙️ 核心原理
+ 创建一个空的 Vue 实例作为“总线”
+ 发送方 `$emit` 触发事件
+ 接收方 `$on` 监听事件，**必须手动 **`$off`** 解绑**

---

## 📘 Vue2 实现
### 1. 创建事件总线（bus.js）
```javascript
// src/utils/bus.js
import Vue from 'vue'
export default new Vue()
```

### 2. 发送方组件（BrotherA.vue）
```vue
<template>
  <button @click="sendToBrother">向兄弟传值</button>
</template>
<script>
import bus from './bus.js'
export default {
  methods: {
    sendToBrother() {
      bus.$emit('brother-event', '组件A的消息')
    }
  }
}
</script>

```

### 3. 接收方组件（BrotherB.vue）
```vue
<template>
  <p>接收：{{ msg }}</p>
</template>
<script>
import bus from './bus.js'
export default {
  data() {
    return { msg: '' }
  },
  mounted() {
    // 第一个参数是事件名，第二个是事件触发时的回调函数，会接收触发方传递的参数。
    this.handler = bus.$on('brother-event', (data) => {
      this.msg = data
    })
  },
  beforeDestroy() {
    // 必须解绑，否则内存泄漏
    // 必须传入事件名 + 对应的处理函数，才能精准解绑；如果只传事件名，会解绑该事件下所有的监听函数。
    bus.$off('brother-event', this.handler)
  }
}
</script>

```

---

## ⚠️ 关键注意事项
| 要点 | 说明 |
| --- | --- |
| **内存泄漏** | 组件销毁时必须 `$off` 解绑事件 |
| **适用规模** | 仅适合小型项目，中大型项目应使用 Vuex/Pinia |
| **Vue3 替代** | 官方无内置 EventBus，推荐 [mitt](https://github.com/developit/mitt) 或直接 Pinia |


---

# 四、跨级组件通信：$ attrs（Vue3） /  $attrs + $listeners（Vue2）
## 🎯 适用场景
祖孙组件/跨多级组件通信，避免逐层 `props` 透传（父→孙）

## ⚙️ 核心原理（Vue3 重大变化）
| 版本 | $attrs | $listeners | 透传方式 |
| --- | --- | --- | --- |
| **Vue2** | 未声明 props 的属性 | 自定义事件 | `v-bind="$attrs"` + `v-on="$listeners"` |
| **Vue3** | 未声明 props 的属性 + 事件（以 `onXxx` 形式） | ❌ 已移除 | **仅需 **`v-bind="$attrs"` |


---

## 📘 Vue3 实现（组合式API）
### 1. 祖父组件（Grandpa.vue）
```vue
<template>
  <Father 
    msg="爷爷的消息"
    :count="100"
    @handle-grandpa="handleGrandpaEvent"
  />
</template>
<script setup>
import Father from './Father.vue'

const handleGrandpaEvent = (data) => {
  console.log('孙子触发：', data)
}
</script>

```

### 2. 父组件（Father.vue）—— 中间层，仅透传
```vue
<template>
  <div>
    <h4>父组件（中间层）</h4>
    <!-- 核心：透传 $attrs 给孙子 -->
    <Son v-bind="$attrs" />
  </div>
</template>
<script setup>
import Son from './Son.vue'
// 无需任何 props 声明，仅做透传
</script>

```

### 3. 孙子组件（Son.vue）—— 接收属性 + 触发事件
```vue
<template>
  <div>
    <p>爷爷的 msg：{{ attrs.msg }}</p>
    <p>爷爷的 count：{{ attrs.count }}</p>
    <button @click="triggerGrandpa">触发爷爷事件</button>
  </div>
</template>
<script setup>
import { useAttrs } from 'vue'

// 获取 $attrs（包含属性和事件）
// useAttrs() 是 Vue3 组合式 API 中获取 $attrs 的方式，替代了 Vue2 的 this.$attrs
// 返回的attrs对象里既包含透传属性，也包含透传事件（事件名自动转为 onXxx 格式）
const attrs = useAttrs()

const triggerGrandpa = () => {
  // 调用事件（事件名自动转换为 onCamelCase）
  attrs.onHandleGrandpa('孙子参数')
}
</script>

```

---

## 📘 选项式API（兼容 Vue2 风格）
```vue
<script>
export default {
  methods: {
    triggerGrandpa() {
      this.$attrs.onHandleGrandpa('参数')
    }
  }
}
</script>

```

---

## ⚙️ 控制根元素属性：`inheritAttrs: false`
默认情况下，`$attrs` 中的未被声明为 `props` 属性会渲染到组件的**根元素**上。即可以F12审查到。

```vue
<script setup>
// <script setup> 中通过 defineOptions 设置
defineOptions({
  inheritAttrs: false
})
</script>

```

```vue
<!-- 选项式API -->
<script>
export default {
  inheritAttrs: false
}
</script>

```

---

## 📘 Vue2 实现（需同时透传 $ attrs +  $listeners）
### 父组件（中间层）
```vue
<template>
  <Son v-bind="$attrs" v-on="$listeners" />
</template>

```

### 孙子组件
```vue
<script>
export default {
  mounted() {
    // 获取属性
    console.log(this.$attrs.msg)
    // 触发事件
    this.$emit('grandpa-event', '参数')
  }
}
</script>

```

---

## ⚠️ 关键注意事项
| 要点 | 说明 |
| --- | --- |
| **class/style 特殊处理** | 不会出现在 `$attrs` 中，自动合并到根元素 |
| **事件名转换** | 父组件 `@handle-grandpa` → `$attrs` 中为 `onHandleGrandpa` |
| **与 props 优先级** | 子组件声明过的 `props` 会从 `$attrs` 中移除 |
| **适用层级** | 适合 2-3 层跨级，更深层级推荐 `provide/inject` |


---

# 五、跨级组件通信：Provide / Inject（依赖注入）
## 🎯 适用场景
**深层/跨级组件通信**（祖先→任意后代），跳过中间所有层级，Vue3 官方推荐

## ⚙️ 核心原理
+ **祖先组件**：通过 `provide` 提供数据/方法
+ **后代组件**：通过 `inject` 注入数据/方法
+ **响应式**：必须传递 `ref`/`reactive` 对象，普通值无响应式

---

## 📘 Vue3 实现（组合式API）
### 祖先组件（Grandpa.vue）
```vue
<template>
  <button @click="msg = '修改后的消息'">修改msg</button>
  <Father />
</template>
<script setup>
import { ref, provide } from 'vue'
import Father from './Father.vue'

// 提供响应式数据
const msg = ref('爷爷的消息')
const count = ref(100)

// 格式：provide(自定义key, 要传递的值)
provide('grandpaMsg', msg)
provide('grandpaCount', count)

// 提供修改方法（遵循单向数据流）
provide('updateMsg', (newMsg) => {
  msg.value = newMsg
})
</script>

```

### 中间组件（Father.vue）—— 无需任何处理
```vue
<template>
  <Son />
</template>
<script setup>
import Son from './Son.vue'
// 什么都不用做，直接渲染后代
</script>

```

### 后代组件（Son.vue）—— 注入使用
```vue
<template>
  <div>
    <p>爷爷的消息：{{ grandpaMsg }}</p>
    <button @click="updateMsg('孙子修改')">修改爷爷消息</button>
  </div>
</template>
<script setup>
import { inject } from 'vue'
// 拿数据：inject(键名) / inject(键名, 默认值)
// 拿方法：inject(方法名)
// 注入数据（可设置默认值）
const grandpaMsg = inject('grandpaMsg')
const grandpaCount = inject('grandpaCount', 0) // 默认值

// 注入方法
const updateMsg = inject('updateMsg')
</script>

```

---

## 📘 选项式API 写法
```vue
<!-- 祖先组件 -->
<script>
export default {
  data() {
    return { msg: '消息' }
  },
  provide() {
    return {
      msg: this.msg,        // ❌ 非响应式
      updateMsg: (val) => { this.msg = val }
    }
  }
}
</script>
<!-- 后代组件 -->
<script>
export default {
  inject: ['msg', 'updateMsg']
}
</script>

```

---

## ⚙️ 注入默认值 & 全局 Provide
### 默认值（防止 key 不存在）
```vue
<script setup>
const msg = inject('grandpaMsg', '默认消息')
const user = inject('grandpaUser', () => ({ name: '默认' })) // 对象用函数
</script>

```

### 全局 Provide（main.js）
```javascript
import { createApp } from 'vue'
import App from './App.vue'

const app = createApp(App)
app.provide('globalTheme', ref('light'))
app.mount('#app')
```

---

## ⚠️ 关键注意事项
| 要点 | 说明 |
| --- | --- |
| **响应式关键** | **必须**传递 `ref`/`reactive` 对象，普通值无响应式 |
| **单向数据流** | 推荐提供修改方法，避免后代直接修改注入值 |
| **就近原则** | 同名 key 时，取**最近祖先**提供的值 |
| **适用场景** | 深层跨级（3层以上）首选，比 `$attrs` 更简洁 |


---

## 六、全局状态管理：Vuex vs Pinia
> **核心定位**：解决跨组件状态共享与复杂数据流管理，避免 props 深层透传与 EventBus 混乱，是中大型项目的**唯一官方推荐方案**。
>

---

### 6.1 Vuex（Vue2 核心 / Vue3 兼容）
#### 6.1.1 核心概念（五大核心）
| 核心概念 | 职责 | 触发方式 | 特点 |
| --- | --- | --- | --- |
| **State** | 单一状态树，存储应用层数据 | 直接读取 `$store.state.xxx` | 响应式 |
| **Getters** | 基于 state 的派生计算属性 | `$store.getters.xxx` | 缓存计算结果 |
| **Mutations** | **唯一**修改 state 的方法（同步） | `commit('mutation名', payload)` | 必须是同步函数 |
| **Actions** | 处理异步逻辑或批量操作 | `dispatch('action名', payload)` | 可异步，最终 commit mutation |
| **Modules** | 模块化拆分状态树 | 命名空间隔离 | 支持动态注册 |


#### 6.1.2 基础使用（Vuex 4，Vue3 兼容）
**1. 安装与注册**

```bash
# Vue2 使用 Vuex 3
npm install vuex@3 --save

# Vue3 使用 Vuex 4
npm install vuex@4 --save
```

```javascript
// store/index.js
import { createStore } from 'vuex'

export default createStore({
  state: {
    count: 0,
    user: { name: '张三' }
  },
  getters: {
    doubleCount: (state) => state.count * 2
  },
  // 核心：同步修改 state，Vuex 唯一能改数据的地方）
  // 第一个参数固定：state → 当前模块的状态数据
  // 第二个参数：payload → 外部传入的参数（可自定义命名）
  // 核心:同步修改 state,Vuex 唯一能改数据的地方)
  // 第一个参数固定:state → 当前模块的状态数据
  // 第二个参数:payload → 外部传入的参数(可自定义命名,如 amount、value 等)
  mutations: {
    INCREMENT(state, payload = 1) {
      state.count += payload
    },
    SET_USER_NAME(state, name) {
      state.user.name = name
    }
  },
  // 处理异步 / 复杂逻辑，不能直接改 state）
  // 第一个参数：{ commit } 解构赋值 → 用来提交 mutations
  // 第二个参数：payload → 外部传入的参数
  actions: {
    asyncIncrement({ commit }, payload) {
      setTimeout(() => commit('INCREMENT', payload), 1000)
    },
    fetchUser({ commit }, userId) {
      return api.getUser(userId).then(user => {
        commit('SET_USER_NAME', user.name)
      })
    }
  }
})
```

**2. 组件中使用（选项式API）**

```vue
<template>
  <div>{{ count }} - {{ doubleCount }}</div>
  <button @click="increment">+1</button>
  <button @click="asyncIncrement">异步+1</button>
</template>
<script>
export default {
  computed: {
    count() { return this.$store.state.count },
    doubleCount() { return this.$store.getters.doubleCount }
  },
  methods: {
    increment() { this.$store.commit('INCREMENT', 1) },
    asyncIncrement() { this.$store.dispatch('asyncIncrement', 1) }
  }
}
</script>

```

**3. 辅助函数（简化绑定）**

```javascript
import { mapState, mapGetters, mapMutations, mapActions } from 'vuex'

export default {
  computed: {
    // 对象展开，将 state/getters 映射为计算属性
    ...mapState(['count']),
    ...mapGetters(['doubleCount'])
  },
  methods: {
    ...mapMutations(['INCREMENT']),
    ...mapActions(['asyncIncrement'])
  }
}
```

#### 6.1.3 模块化（企业级必备）
```javascript
// store/modules/user.js
export default {
  // 开启namespaced: true后，模块会变成独立封闭空间，调用时必须带上模块名，彻底隔离冲突。
  // 开启后，调用模块内的内容必须加模块名前缀，格式：模块名/方法名。
  namespaced: true,      // 开启命名空间，避免模块间冲突
  state: () => ({
    token: localStorage.getItem('token') || '',
    profile: null
  }),
  mutations: {
    SET_TOKEN(state, token) {
      state.token = token
      localStorage.setItem('token', token)
    },
    SET_PROFILE(state, profile) { state.profile = profile }
  },
  actions: {
    login({ commit }, credentials) {
      return api.login(credentials).then(res => {
        commit('SET_TOKEN', res.token)
        commit('SET_PROFILE', res.user)
      })
    }
  },
  getters: {
    isLoggedIn: state => !!state.token
  }
}
```

```javascript
// store/index.js
import { createStore } from 'vuex'
import user from './modules/user'
import cart from './modules/cart'

export default createStore({
  modules: { user, cart }
})
```

**组件中使用命名空间模块**

```javascript
export default {
  computed: {
    // 把 user 模块的 state.token 映射为组件的计算属性，直接用 this.token 访问。
    ...mapState('user', ['token']),
    ...mapGetters('user', ['isLoggedIn'])
  },
  methods: {
    ...mapMutations('user', ['SET_TOKEN']),
    ...mapActions('user', ['login'])
  }
}
```

或直接调用：

```javascript
this.$store.commit('user/SET_TOKEN', token)
this.$store.dispatch('user/login', credentials)
```

#### 6.1.4 Vuex 严格模式与调试
```javascript
const store = createStore({
  strict: process.env.NODE_ENV !== 'production', // 开发环境开启，非 mutation 修改 state 会报错
  // ...
})
```

---

### 6.2 Pinia（Vue3 官方推荐，Vuex 的替代者）
#### 6.2.1 核心优势对比
| 特性 | Vuex 4 | Pinia | 说明 |
| --- | --- | --- | --- |
| API 复杂度 | 需要定义 mutations + actions | 只需定义 state + getters + actions | Pinia 更简洁 |
| 修改状态 | 必须 commit mutation | 直接修改 state 或调用 action | 开发体验好 |
| TypeScript | 支持但需额外类型声明 | **原生完美支持** | 类型推断自动完成 |
| 模块化 | 嵌套 modules，需 namespaced | 多 Store 平级，导入即用 | 更直观 |
| Devtools | 支持 | 完整支持（时间旅行等） | 无差异 |
| 体积 | 较大 | 约 1KB（超轻量） | Pinia 更小 |
| 官方态度 | 仅维护 | Vue 官方推荐 | 新项目首选 |


#### 6.2.2 安装与基础配置
```bash
npm install pinia
```

```javascript
// main.js
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'

const pinia = createPinia()
const app = createApp(App)

app.use(pinia)
app.mount('#app')
```

#### 6.2.3 定义 Store（两种风格）
**选项式风格（类似 Vuex）**

```javascript
// stores/counter.js
import { defineStore } from 'pinia'

export const useCounterStore = defineStore('counter', {
  state: () => ({
    count: 0,
    user: { name: '张三' }
  }),
  getters: {
    doubleCount: (state) => state.count * 2,
    userName: (state) => state.user.name
  },
  actions: {
    increment(amount = 1) {
      this.count += amount   // 直接修改 state
    },
    async fetchUser() {
      const user = await api.getUser()
      this.user = user       // 异步修改
    }
  }
})
```

**组合式风格（推荐，更灵活）**

```javascript
// stores/counter.js
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useCounterStore = defineStore('counter', () => {
  const count = ref(0)
  const user = ref({ name: '张三' })

  const doubleCount = computed(() => count.value * 2)
  const userName = computed(() => user.value.name)

  function increment(amount = 1) {
    count.value += amount
  }

  async function fetchUser() {
    const userData = await api.getUser()
    user.value = userData
  }

  return { count, user, doubleCount, userName, increment, fetchUser }
})
```

#### 6.2.4 组件中使用
```vue
<template>
  <div>{{ counter.count }} - {{ counter.doubleCount }}</div>
  <button @click="counter.increment(2)">+2</button>
  <button @click="counter.fetchUser">获取用户</button>
</template>
<script setup>
// 1. 导入你定义好的 Pinia 仓库
import { useCounterStore } from '@/stores/counter'
// 2. 导入 Pinia 提供的响应式解构工具
import { storeToRefs } from 'pinia'
  
// 3. 获取 store 实例（所有状态、方法都在这个对象里）
const counter = useCounterStore()

// 4. 【关键】state/getters 必须用 storeToRefs 解构，才能保留响应式
// 直接使用 store 实例的属性（保持响应式）
// 但若解构，需用 storeToRefs 保持响应式
const { count, doubleCount } = storeToRefs(counter)  // ✅ 响应式解构
  
// 5. actions 是普通函数，直接解构即可，不会丢失响应式
const { increment, fetchUser } = counter              // action 可直接解构
</script>

```

#### 6.2.5 高级 API
| 方法 | 作用 | 示例 |
| --- | --- | --- |
| `$patch` | 批量更新 state | `counter.$patch({ count: 10 })` |
| `$reset` | 重置为初始 state | `counter.$reset()` |
| `$subscribe` | 监听 state 变化 | `counter.$subscribe((mutation, state) => {})` |
| `storeToRefs` | 解构保持响应式 | `const { count } = storeToRefs(store)` |


#### 6.2.6 模块化（按业务拆分）
```plain
src/stores/
├── modules/
│   ├── user.js       # 用户模块
│   ├── cart.js       # 购物车模块
│   └── order.js      # 订单模块
├── index.js          # 统一导出
```

```javascript
// stores/index.js
export { useUserStore } from './modules/user'
export { useCartStore } from './modules/cart'
export { useOrderStore } from './modules/order'
```

**组件中直接引入对应模块即可**

```javascript
import { useUserStore } from '@/stores'
const userStore = useUserStore()
```

#### 6.2.7 TypeScript 支持（零配置）
```typescript
// stores/user.ts
import { defineStore } from 'pinia'

interface UserState {
  token: string
  profile: { name: string } | null
}

export const useUserStore = defineStore('user', {
  state: (): UserState => ({
    token: '',
    profile: null
  }),
  actions: {
    login(credentials: { username: string; password: string }) {
      // 类型推断自动完成
      return api.login(credentials).then(res => {
        this.token = res.token
        this.profile = res.user
      })
    }
  }
})
```

---

### 6.3 企业级状态管理架构设计
#### 6.3.1 模块化目录结构（Pinia 示例）
```plain
src/
├── stores/
│   ├── modules/
│   │   ├── user.js        # 用户状态（token、个人信息、权限）
│   │   ├── app.js         # 应用全局状态（主题、侧边栏折叠、语言）
│   │   ├── permission.js  # 权限相关（菜单、按钮权限）
│   │   ├── cart.js        # 购物车
│   │   └── order.js       # 订单
│   ├── index.js           # 统一导出所有 Store
│   └── types.ts           # TypeScript 类型定义（可选）
└── main.js
```

#### 6.3.2 状态管理最佳实践
1. **业务隔离**：一个 Store 对应一个业务域，避免跨 Store 直接修改
2. **状态归一**：全局数据统一由 Pinia/Vuex 管理，禁止在组件中定义全局变量（如 `window.xxx`）
3. **命名规范**：Store 文件名使用 `模块名.js`，导出的 hook 为 `useXxxStore`
4. **单向数据流**：严格遵循 `视图 → action → mutation(state)` 流程（Pinia 中直接修改也是经过内部 action）
5. **持久化**：敏感数据（token）使用 `localStorage` 同步，需配合插件 `pinia-plugin-persistedstate`

#### 6.3.3 持久化插件示例
```bash
npm install pinia-plugin-persistedstate
```

```javascript
// stores/index.js
import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'

const pinia = createPinia()
pinia.use(piniaPluginPersistedstate)

export default pinia
```

```javascript
// stores/modules/user.js
export const useUserStore = defineStore('user', {
  state: () => ({ token: '' }),
  persist: {
    storage: localStorage,
    paths: ['token'],       // 仅持久化 token
  }
})
```

---

### 6.4 方案选型建议
| 项目类型 | 推荐方案 | 理由 |
| --- | --- | --- |
| Vue3 新项目 | **Pinia** | 官方推荐，API 简洁，TS 友好，轻量 |
| Vue2 项目 | **Vuex 3** | 稳定，社区成熟，生态完善 |
| Vue3 迁移老项目 | 保持 Vuex 4 或逐步替换 Pinia | 可并存，按模块渐进替换 |
| 小型项目（几个组件） | 无需状态管理，使用 provide/inject 即可 | 避免过度设计 |
| 中大型项目（跨模块状态） | **Pinia + 模块化** | 可维护性高，团队协作友好 |


> **结论**：Vue3 新项目应**优先采用 Pinia**，它不仅是官方推荐，更在开发体验、性能、TS 支持上全面超越 Vuex。Vue2 项目继续使用 Vuex 3，Vue3 老项目可逐步迁移至 Pinia。
>

---

### 6.5 Vuex ↔ Pinia 迁移对照（快速参考）
| 场景 | Vuex 写法 | Pinia 写法 |
| --- | --- | --- |
| 定义 state | `state: { count: 0 }` | `state: () => ({ count: 0 })` |
| 定义 getter | `getters: { double: state => state.count * 2 }` | `getters: { double: state => state.count * 2 }`（同） |
| 定义 mutation | `mutations: { INCREMENT(state) { state.count++ } }` | ❌ 无，直接修改或 action |
| 定义 action | `actions: { increment({ commit }) { commit('INCREMENT') } }` | `actions: { increment() { this.count++ } }` |
| 调用 mutation | `commit('INCREMENT')` | ❌ 无，直接 `store.count++` 或 `store.increment()` |
| 调用 action | `dispatch('increment')` | `store.increment()` |
| 模块化 | `modules: { user }` + `namespaced: true` | 直接定义多个 Store 文件，平级导入 |
| 辅助函数 | `mapState`、`mapGetters`、`mapMutations`、`mapActions` | `storeToRefs` 解构 + 直接使用 action |


---

> **提示**：本部分内容已完整覆盖 Vuex 与 Pinia 的核心用法、模块化架构、企业级实践及迁移指南，可无缝替换原笔记中“六、全局状态管理：Vuex vs Pinia”章节，并可作为独立状态管理文档使用。
>

# 七、直接访问：$ refs /  $parent / $children
## 🎯 适用场景
+ **$refs**：获取 DOM 元素 / 直接子组件实例（推荐有限场景）
+ **$parent**：访问父组件实例（**不推荐**，强耦合）
+ **$children**：**Vue3 已彻底废弃**

---

## 📘 Vue3 核心变化
| 属性 | Vue2 | Vue3 | 说明 |
| --- | --- | --- | --- |
| **$refs** | ✅ 支持 | ✅ 支持 | 组合式API需用 `ref()` 关联 |
| **$parent** | ✅ 支持 | ✅ 支持 | 可用，但**官方不推荐** |
| **$children** | ✅ 支持 | ❌ 废弃 | 无法获取子组件数组 |


---

## ✅ $refs（唯一推荐）
### 选项式API
```vue
<template>
   <!-- 1. 给DOM元素加ref -->
  <input ref="inputRef" />
   <!-- 2. 给子组件加ref -->
  <Child ref="childRef" />
</template>
<script>
export default {
  methods: {
    handleClick() {
      // 获取DOM元素并操作
      this.$refs.inputRef.focus()
      // 访问子组件实例，调用子组件方法/属性
      this.$refs.childRef.sayHello()
    }
  }
}
</script>

```

**关键注意点**：

+ `$refs` 是**渲染完成后**才生成的，在 `created` 钩子中无法访问（此时 DOM 未渲染），需在 `mounted` 中使用；
+ `ref` 是 “单向绑定”，修改 `$refs` 不会触发视图更新，仅用于**读取 / 操作**，不建议依赖它做响应式逻辑。

### 组合式API（`<script setup>`）
```vue
<template>
  <input ref="inputRef" />
  <Child ref="childRef" />
</template>
<script setup>
import { ref, nextTick } from 'vue'
import Child from './Child.vue'

// 创建同名 ref 变量
const inputRef = ref(null)
const childRef = ref(null)

// 子组件必须 expose 属性/方法
defineExpose({
  sayHello: () => console.log('hello')
})

const handleClick = async () => {
  await nextTick()  // DOM 异步更新
  inputRef.value.focus()
  childRef.value.sayHello()
}
</script>

```

---

## ⚠️ $parent（不推荐）
`$parent` 是组件实例的内置属性，用于**直接访问当前组件的父组件实例**，可以读取父组件的 data、调用父组件的方法。  

### 选项式API
```vue
<script>
export default {
  methods: {
    getParentData() {
      // 访问父组件的属性
      console.log(this.$parent.parentMsg)
      // 访问父组件的方法
      this.$parent.parentMethod()
    }
  }
}
</script>

```

### 组合式API（需 `getCurrentInstance`）
```vue
<script setup>
import { getCurrentInstance } from 'vue'

const instance = getCurrentInstance()
const parent = instance.parent

const callParent = () => {
  parent.exposed.parentMethod() // 父组件需 expose
}
</script>

```

---

## ❌ $children（Vue3 已废弃）
`$children` 是父组件实例的内置属性，返回**当前父组件所有直接子组件的实例数组**，可以遍历访问子组件的属性 / 方法。  

```vue
<!-- 父组件代码 -->
<template>
  <child-component></child-component>
  <child-component></child-component>
  <button @click="operateChildren">操作子组件</button>
</template>

<script>
import ChildComponent from './ChildComponent.vue'
export default {
  components: { ChildComponent },
  methods: {
    operateChildren() {
      // $children是数组，遍历访问每个子组件
      this.$children.forEach(child => {
        child.childMethod(); // 调用每个子组件的方法
        console.log(child.childData); // 获取每个子组件的属性
      });
    }
  }
}
</script>
```

**替代方案**：使用 `ref` 精准获取子组件

```vue
<template>
  <Child ref="child1" />
  <Child ref="child2" />
</template>
<script setup>
const child1 = ref(null)
const child2 = ref(null)
</script>

```

---

# 八、插槽
## 一、插槽核心概念
**插槽（Slot）= 组件的内容分发出口**

+ 子组件：用 `<slot>` 留**占位空位**
+ 父组件：往空位里填**HTML/组件**
+ 作用：让组件更灵活、可复用

---

## 二、三种插槽（2/3 通用）
1. **默认插槽**：单个空位
2. **具名插槽**：多个空位（带 name）
3. **作用域插槽**：子组件 → 父组件 传数据

---

## 三、Vue 2 插槽语法（旧版）
### 1. 默认插槽
子组件：

```vue
<slot>默认内容</slot>

```

父组件：

```vue
<Child>
  直接写内容
</Child>

```

### 2. 具名插槽
子组件：

```vue
<slot name="header"></slot>

```

父组件：

```vue
<div slot="header">内容</div>

```

### 3. 作用域插槽
子组件（绑定数据）：

```vue
<slot :user="user"></slot>

```

父组件（接收数据）：

```vue
<template slot-scope="scope">
  {{ scope.user }}
</template>

```

---

## 四、Vue 3 插槽语法（新版/统一）
### 核心规则
+ 统一指令：`v-slot`
+ 简写：`#`（99% 场景使用）
+ 废弃：`slot` / `slot-scope`
+ 具名插槽必须写在 `<template>` 上

### 1. 默认插槽
子组件（不变）：

```vue
<slot>默认内容</slot>
```

父组件：

```vue
<Child>
  直接写内容
</Child>
<!-- 完整写法 -->
<template v-slot:default>内容</template>

```

### 2. 具名插槽
子组件（不变）：

```vue
<slot name="header"></slot>
```

父组件：

```vue
<template #header>
  头部内容
</template>
```

### 3. 作用域插槽
子组件（不变）：

```vue
<slot :user="user"></slot>

```

父组件：

```vue
<template #default="scope">
  {{ scope.user }}
</template>
<!-- 解构写法（推荐） -->
<template #default="{ user }">
  {{ user }}
</template>

```

---

## 五、Vue 2 / Vue 3 语法对比表（速记）
| 插槽类型 | Vue 2 | Vue 3 | 简写（Vue3） |
| --- | --- | --- | --- |
| 默认插槽 | 直接写内容 | `v-slot:default` | 直接写内容 |
| 具名插槽 | `slot="name"` | `v-slot:name` | `#name` |
| 作用域插槽 | `slot-scope="scope"` | `v-slot:default="scope"` | `#default="scope"` |


---

## 六、关键注意事项
1. **插槽作用域**  
插槽内容属于**父组件**，只能访问父数据；  
想访问子数据 → 必须用**作用域插槽**。
2. **默认内容**  
子组件 `<slot>` 内的内容 = 后备内容  
父不传内容 → 显示子默认内容。
3. **版本区别**
+ Vue 2：支持 `slot` / `slot-scope`
+ Vue 3：只支持 `v-slot` / `#`，不兼容旧写法

---

## 七、一句话速记
+ **Vue2**：`slot` 起名，`slot-scope` 收数据
+ **Vue3**：统一 `v-slot`，简写 `#`，更简洁

# 📊 总结：Vue2 & Vue3 通信方案对照表
| 通信场景 | Vue2 方案 | Vue3 方案 | 推荐度 |
| --- | --- | --- | --- |
| **父 → 子** | `props` | `defineProps` | ⭐⭐⭐⭐⭐ |
| **子 → 父** | `$emit` | `defineEmits` + `emit` | ⭐⭐⭐⭐⭐ |
| **兄弟组件** | `EventBus` | `mitt` / Pinia | ⭐⭐（Vue3 不推荐总线） |
| **跨级（浅层）** | `$attrs` + `$listeners` | `$attrs`（含事件） | ⭐⭐⭐⭐ |
| **跨级（深层）** | `provide/inject` | `provide/inject`（响应式） | ⭐⭐⭐⭐⭐ |
| **全局状态** | `Vuex 3/4` | **Pinia**（首选） | ⭐⭐⭐⭐⭐ |
| **直接访问** | `$refs` | `$refs` + `defineExpose` | ⭐⭐⭐（有限场景） |
| **直接访问** | `$parent` | `$parent` | ⭐（强耦合，不推荐） |
| **直接访问** | `$children` | ❌ 废弃 | 无 |


---

# 🎯 选型建议
1. **父子组件** → `props` + `$emit`（Vue3：`defineProps` + `defineEmits`）
2. **深层跨级（3层以上）** → `provide/inject`
3. **浅层跨级（2-3层）** → `$attrs` 透传
4. **中大型项目全局状态** → **Pinia**（Vue3 新项目首选）
5. **Vue2 老项目维护** → 保持 Vuex 3/4 或 EventBus
6. **操作 DOM / 调用子组件方法** → `$refs`
7. **避免使用** → `$parent`、`$children`、手动 EventBus（Vue3）

---
