---
title: "第11篇：Vue3_Composition_API核心笔记"
slug: "vue-vue-vue3-composition-api-4d51a7a6"
summary: "Vue3 Composition API 完整指南：setup、ref/reactive、computed、watch/watchEffect、生命周期、自定义 Hook 及常见易错点总结。"
category: "vue辅助"
categoryPath:
  - "我的总结"
  - "Vue"
  - "vue辅助"
tags:
  - "Vue3"
  - "Composition API"
  - "setup"
  - "ref"
  - "reactive"
status: "published"
sortOrder: 110
cover: ""
originalId: "6a2d291f8a2b1c68f2cac4dc"
originalSlug: "vue-vue-vue3-composition-api-4d51a7a6"
originalStatus: "published"
publishedAt: "2026-05-09T12:50:17.711Z"
updatedAt: "2026-06-13T10:28:29.108Z"
exportedAt: "2026-07-30T15:42:33.614Z"
---
## 一、setup 函数
### 1.1 基本使用
+ **作用**：Vue3新增的配置项，组合式API的入口
+ **位置**：所有组合式API（数据、方法、计算属性、监听器等）都写在setup函数中
+ **返回值**：
    - 返回**对象**：对象中的属性/方法可直接在模板中使用
    - 返回**函数**：函数返回值会直接渲染到页面（了解即可）

### 1.2 执行时机
+ **在 **`beforeCreate`** 之前执行**
+ **this 为 undefined**，无法通过this访问组件实例

### 1.3 setup 的两个参数
```javascript
export default {
  props: ['title', 'count'],
  emits: ['change', 'update'],
  setup(props, context) {
    // 第一个参数：props（响应式的）
    console.log(props.title)
    // ❌ 不要解构 props，会丢失响应式
    // let { title } = props
    
    // 第二个参数：context 上下文对象
    // context.attrs - 非 props 的属性
    // context.slots - 插槽内容
    // context.emit - 触发事件
    // context.expose - 暴露公共属性/方法
    
    context.emit('change', newValue)
    context.expose({ 
      someMethod() {} 
    })
    
    return {}
  }
}
```

### 1.4 与Vue2.x选项式API的兼容性
+ ✅ Vue2中的data/methods/computed **可以访问** setup中定义的属性
+ ❌ setup中 **不能访问** Vue2中的data/methods/computed

### 1.5 setup语法糖
```vue
<script setup name="组件名">
  // 直接写组合式API代码，无需return
  // props 和 emits 需要用 defineProps 和 defineEmits
  const props = defineProps(['title'])
  const emit = defineEmits(['change'])
</script>

```

+ **简化写法**：省去setup()函数和return
+ **组件命名**：可通过 `name` 属性直接指定，或借助插件 `vite-plugin-vue-setup-extend`

---

## 二、响应式核心API
### 2.1 reactive（精简标准版）
```javascript
import { reactive } from 'vue'

let state = reactive({ name: '张三', age: 18 })
```

+ **作用**：**仅用于对象/数组，创建深层响应式数据**
+ **原理**：**基于 ES6 Proxy 代理拦截读写，自动依赖收集、触发视图更新**
+ **注意**：**不能整体重新赋值、不能直接解构，否则丢失响应式**

#### 为什么 reactive 直接赋值会丢失响应式？
```javascript
// 原理解析
let state = reactive({ name: '张三' })
// state 此时是一个 Proxy 代理对象，指向内存地址 A

state = { name: '李四' }  // ❌ 丢失响应式
// 这行代码做了什么？
// 1. 创建了一个新的普通对象 { name: '李四' }（内存地址 B）
// 2. 让变量 state 指向这个新对象（地址 B）
// 3. 原来的 Proxy 代理对象（地址 A）失去了引用
// 4. 新对象不是 Proxy，所以没有响应式能力

// ✅ 正确做法：修改 Proxy 对象的属性，而不是替换整个对象
state.name = '李四'  // 通过 Proxy 的 set 拦截器触发更新
Object.assign(state, { name: '李四' })  // 同样通过 Proxy 拦截
```

**核心原因**：
- `reactive()` 返回的是 **Proxy 代理对象**，响应式能力在这个 Proxy 上
- 直接赋值 `state = 新对象` 是**替换变量引用**，不是修改 Proxy 对象
- 新对象是普通对象，没有 Proxy 的拦截能力，自然丢失响应式

### 2.2 ref（配套记）
```javascript
import { ref } from 'vue'

let count = ref(18)        // 基本类型
let user = ref({ name: '李四' })  // 对象类型
```

+ **作用**：**基础类型 + 对象都能用的响应式**
+ **原理**：**内部封装 value 属性，通过劫持 value 实现响应**
+ **访问方式**：**脚本里需 .value 取值赋值，模板中自动解包无需 .value**
+ **注意**：**可整体改 value 不会丢失响应式**

#### 为什么 ref 可以直接赋值而不丢失响应式？
```javascript
// 原理解析
let count = ref(18)
// ref 返回的对象结构类似：
// {
//   value: 18,  // 真正的值存在 value 属性上
//   __v_isRef: true  // 标记这是一个 ref
// }
// 这个对象本身也是响应式的（通过 getter/setter 或 Proxy）

count.value = 20  // ✅ 不会丢失响应式
// 这行代码做了什么？
// 1. 访问 count 对象的 value 属性（触发 getter）
// 2. 修改 value 属性的值（触发 setter）
// 3. setter 内部通知依赖更新
// 4. count 变量始终指向同一个 ref 对象，没有替换引用

// 对比 reactive 的问题
let state = reactive({ count: 18 })
state = { count: 20 }  // ❌ 替换了整个对象引用，丢失响应式

// ref 的优势：多了一层 .value 包装
let count = ref(18)
count.value = 20  // ✅ 只是修改 value 属性，ref 对象本身没变
```

**核心原因**：
- `ref()` 返回的是一个**包装对象**，响应式能力在这个包装对象上
- `.value = 新值` 是**修改包装对象的属性**，不是替换包装对象本身
- 变量 `count` 始终指向同一个 ref 包装对象，所以不会丢失响应式

#### ref 对象类型的内部实现
```javascript
let user = ref({ name: '张三' })
// 内部实际上是：
// {
//   value: reactive({ name: '张三' })  // 对象类型会用 reactive 包装
// }

user.value = { name: '李四' }  // ✅ 整体替换也不会丢失响应式
// 因为替换的是 ref.value，ref 包装对象本身没变
// 新对象会被重新用 reactive() 包装
```

### 2.3 ref vs reactive 对比（含原理）
| 特性 | ref | reactive | 原理说明 |
| --- | --- | --- | --- |
| 数据类型 | 基本类型 + 对象类型 | 仅对象类型 | ref 通过 .value 包装，reactive 直接代理对象 |
| 访问方式 | `.value` | 直接访问 | ref 需要访问包装对象的 value 属性 |
| 整体替换 | ✅ 可以（`.value = 新值`） | ❌ 会丢失响应式 | ref 替换的是属性，reactive 替换的是引用 |
| 解构 | ✅ 不影响响应式（ref 本身） | ❌ 解构后丢失响应式 | 解构得到的是普通值，失去 Proxy 代理 |
| 响应式实现 | getter/setter 劫持 .value | Proxy 代理整个对象 | ref 是属性劫持，reactive 是对象代理 |
| 内存引用 | 变量指向固定的 ref 包装对象 | 变量直接指向 Proxy 对象 | ref 多一层包装，更稳定 |

#### 图解响应式丢失原理
```javascript
// reactive 的问题
let state = reactive({ count: 0 })  
// 内存：state → Proxy对象A { count: 0 }

state = { count: 1 }  
// 内存：state → 普通对象B { count: 1 }
//      Proxy对象A 失去引用，响应式丢失 ❌

// ref 的优势
let count = ref(0)  
// 内存：count → RefImpl对象 { value: 0 }

count.value = 1  
// 内存：count → RefImpl对象 { value: 1 }
//      始终是同一个 RefImpl 对象，响应式保留 ✅
```

**使用原则**：

+ **基本类型** → 必须用 `ref`（reactive 不支持）
+ **对象类型且需要整体替换** → 用 `ref`（避免丢失响应式）
+ **对象类型且层级深、不需整体替换** → 推荐 `reactive`（访问更简洁）
+ **需要解构使用** → 用 `ref` 或配合 `toRefs`

### 2.4 toRef 与 toRefs
```javascript
import { toRef, toRefs } from 'vue'

let state = reactive({ name: '张三', age: 18 })

// 单个属性转换
let name = toRef(state, 'name')

// 批量转换
let { name, age } = toRefs(state)
```

+ **作用**：保持响应式的同时，解构reactive对象的属性
+ **注意**：转换后得到的是ref对象，访问时仍需 `.value`

### 2.5 shallowRef 与 shallowReactive（性能优化）
```javascript
import { shallowRef, shallowReactive } from 'vue'

// shallowRef：只有 .value 的赋值是响应式的
let state = shallowRef({ count: 0 })
state.value.count++  // ❌ 不会触发更新
state.value = { count: 1 }  // ✅ 会触发更新

// shallowReactive：只有根级别属性是响应式的
let obj = shallowReactive({ 
  count: 0,  // ✅ 响应式
  nested: { value: 1 }  // ❌ 内部不是响应式
})
obj.count++  // ✅ 会触发更新
obj.nested.value++  // ❌ 不会触发更新
obj.nested = { value: 2 }  // ✅ 会触发更新
```

+ **使用场景**：
    - 大型数据结构，只需要顶层响应式
    - 集成第三方库的状态对象
    - 性能优化，减少深层监听开销

### 2.6 readonly 与类型判断工具
```javascript
import { readonly, isRef, isReactive, isReadonly } from 'vue'

// readonly：创建只读代理，防止意外修改
const original = reactive({ count: 0 })
const copy = readonly(original)
copy.count++  // ⚠️ 警告：无法修改只读属性

// 类型判断
isRef(count)  // true
isReactive(state)  // true
isReadonly(copy)  // true
```

+ **readonly 使用场景**：
    - 传递给子组件，防止子组件修改父组件状态
    - 保护配置对象不被修改

---

## 三、计算属性 computed
```javascript
import { computed, ref } from 'vue'

let firstName = ref('张')
let lastName = ref('三')

// 只读写法
let fullName = computed(() => firstName.value + lastName.value)

// 可读写写法
let fullName = computed({
  get: () => firstName.value + lastName.value,
  set: (val) => {
    // 处理赋值逻辑
  }
})
```

### 3.1 computed 的调试功能（Vue 3.2+）
```javascript
const fullName = computed(() => firstName.value + lastName.value, {
  onTrack(e) {
    // 依赖被追踪时触发
    console.log('依赖被追踪', e)
  },
  onTrigger(e) {
    // 依赖变化触发重新计算时触发
    console.log('依赖被触发', e)
  }
})
```

+ **使用场景**：调试复杂的计算属性依赖关系
+ **注意**：仅在开发环境使用，生产环境应移除

---

## 四、侦听器 watch
### 4.1 watch 可监视的数据类型
1. ref定义的数据
2. reactive定义的数据
3. 函数返回的值（getter函数）
4. 包含上述内容的数组

### 4.2 不同情况的监视写法
```javascript
import { ref, reactive, watch } from 'vue'

// 1. ref基本类型
let count = ref(0)
watch(count, (newVal, oldVal) => {})

// 2. ref对象类型（需开启深度监视）
let user = ref({ name: '张三' })
watch(user, (newVal, oldVal) => {}, { deep: true })

// 3. reactive对象类型（默认深度监视）
let state = reactive({ name: '张三' })
watch(state, (newVal, oldVal) => {})  // 注意：oldVal无法正确获取

// 4. 监视对象中的某个属性（函数写法）
watch(() => state.name, (newVal, oldVal) => {})

// 5. 监视多个数据
watch([() => state.name, () => state.age], ([newName, newAge], [oldName, oldAge]) => {})
```

### 4.3 watch 的配置选项
```javascript
watch(source, callback, {
  // 立即执行一次回调
  immediate: true,
  
  // 深度监听（ref对象类型需要）
  deep: true,
  
  // 控制回调执行时机
  flush: 'pre',  // 默认，组件更新前执行
  // flush: 'post',  // 组件更新后执行（可访问更新后的DOM）
  // flush: 'sync',  // 同步执行（谨慎使用，可能影响性能）
  
  // 调试选项（Vue 3.2+）
  onTrack(e) { console.log('依赖被追踪', e) },
  onTrigger(e) { console.log('依赖触发更新', e) }
})
```

+ **immediate**：组件挂载时立即执行一次
+ **flush: 'post'**：需要在回调中访问更新后的DOM时使用
+ **flush: 'sync'**：会在每次数据变化时同步触发，可能导致性能问题

### 4.4 watch 返回值与停止监听
```javascript
// watch 和 watchEffect 都返回停止监听的函数
const stop = watch(count, () => {})
const stopEffect = watchEffect(() => {})

// 手动停止监听
stop()
stopEffect()

// 组件卸载时会自动停止，通常无需手动调用
```

+ **使用场景**：条件性监听，满足某条件后停止

### 4.5 watchEffect 与副作用清理
```javascript
// watchEffect 示例：自动追踪依赖
watchEffect(async () => {
  let res = await axios.get(`/api/list?author=${keyword.value}`)
  list.value = res.data
})

// 清理副作用（重要）
watchEffect((onCleanup) => {
  const timer = setTimeout(() => {
    console.log('执行异步操作')
  }, 1000)
  
  // 在副作用重新执行前或组件卸载时清理
  onCleanup(() => {
    clearTimeout(timer)
    console.log('清理定时器')
  })
})

// 实际应用：防抖搜索
watchEffect((onCleanup) => {
  const timer = setTimeout(async () => {
    const res = await fetch(`/api/search?q=${keyword.value}`)
    results.value = await res.json()
  }, 300)
  
  onCleanup(() => clearTimeout(timer))
})
```

### 4.6 watch vs watchEffect
| 特性 | watch | watchEffect |
| --- | --- | --- |
| 执行时机 | 惰性（数据变化才执行） | 立即执行 |
| 依赖追踪 | 手动指定 | 自动追踪代码中的依赖 |
| 获取旧值 | ✅ 可以 | ❌ 只能获取新值 |
| 副作用清理 | ✅ 支持 | ✅ 支持（通过 onCleanup） |
| 适用场景 | 需要精确控制依赖和获取旧值 | 异步操作、自动收集依赖 |

---

## 五、生命周期钩子
### 5.1 生命周期对照表
| Vue2 | Vue3 | 说明 |
| --- | --- | --- |
| beforeCreate | setup | setup取代 |
| created | setup | setup取代 |
| beforeMount | onBeforeMount | 挂载前 |
| mounted | onMounted | 挂载后（常用） |
| beforeUpdate | onBeforeUpdate | 更新前 |
| updated | onUpdated | 更新后 |
| beforeDestroy | onBeforeUnmount | 卸载前 |
| destroyed | onUnmounted | 卸载后 |


### 5.2 使用示例
```javascript
import { onMounted, onUnmounted } from 'vue'

onMounted(() => {
  console.log('组件已挂载')
  // 常用于：发起请求、操作DOM、添加事件监听
})

onUnmounted(() => {
  console.log('组件即将卸载')
  // 常用于：清理定时器、移除事件监听
})
```

### 5.3 生命周期钩子可以多次调用
```javascript
// ✅ 可以注册多个相同的生命周期钩子
onMounted(() => {
  console.log('第一个 mounted')
})

onMounted(() => {
  console.log('第二个 mounted')
})

// 两个都会按顺序执行
```

+ **使用场景**：
    - 组合式函数（Hook）中注册生命周期
    - 逻辑分离，不同功能的初始化代码分开写

---

## 六、自定义 Hook
### 6.1 概述
+ **本质**：封装组合式API逻辑的函数
+ **优势**：代码复用、逻辑分离、提高可维护性
+ **命名规范**：`useXxx`

### 6.2 示例结构
```javascript
// hooks/useMouse.js
import { ref, onMounted, onUnmounted } from 'vue'

export function useMouse() {
  const x = ref(0)
  const y = ref(0)
  
  const update = (e) => {
    x.value = e.pageX
    y.value = e.pageY
  }
  
  onMounted(() => document.addEventListener('mousemove', update))
  onUnmounted(() => document.removeEventListener('mousemove', update))
  
  return { x, y }
}
```

### 6.3 在组件中使用
```vue
<script setup>
import { useMouse } from '@/hooks/useMouse'
let { x, y } = useMouse()
</script>

```

---

## 七、ref 标签属性（模板引用）
### 7.1 获取DOM元素
```vue
<template>
  <input ref="inputRef" />
</template>
<script setup>
import { ref, onMounted } from 'vue'

const inputRef = ref(null)

onMounted(() => {
  inputRef.value.focus()  // 操作DOM
})
</script>

```

### 7.2 获取组件实例
```vue
<!-- 父组件 -->
<template>
  <ChildComponent ref="childRef" />
</template>
<script setup>
import { ref } from 'vue'

const childRef = ref(null)
// 访问子组件数据前，需子组件用 defineExpose 暴露
</script>
<!-- 子组件 -->
<script setup>
import { defineExpose } from 'vue'
const msg = 'hello'
defineExpose({ msg })  // 暴露给父组件
</script>

```

---

## 八、常见易错点总结
### 1. reactive 直接赋值丢失响应式（高频错误）

```javascript
// ❌ 错误：替换了对象引用
let state = reactive({ list: [] })
state = { list: newList }  
// 原理：state 从指向 Proxy对象 变成指向 普通对象
// 结果：新对象没有 Proxy 拦截能力，响应式丢失

// ✅ 正确方式1：使用 Object.assign（保持 Proxy 引用）
Object.assign(state, { list: newList })
// 原理：修改 Proxy 对象的属性，触发 set 拦截器

// ✅ 正确方式2：修改属性而不是整体赋值
state.list = newList
// 原理：同样是修改 Proxy 对象的属性

// ✅ 正确方式3：使用 ref 包裹对象（推荐）
let state = ref({ list: [] })
state.value = { list: newList }  
// 原理：state 始终指向同一个 ref 包装对象
//      只是修改了 .value 属性，ref 对象本身没变
```

**记忆口诀**：
- reactive 怕"换人"（整体赋值 = 换对象引用）
- ref 不怕"换人"（.value 赋值 = 换属性值）

### 2. reactive 解构丢失响应式

```javascript
let state = reactive({ name: '张三', age: 18 })

// ❌ 解构后丢失响应式
let { name, age } = state
// 原理：解构相当于 let name = state.name
//      得到的是普通值 '张三'，不是 Proxy 对象
name = '李四'  // 只是修改局部变量，不会触发视图更新

// ✅ 使用 toRefs 保持响应式
let { name, age } = toRefs(state)
// 原理：toRefs 把每个属性都转成 ref 对象
//      name 变成 ref('张三')，保留了响应式能力
name.value = '李四'  // 修改 ref.value，触发更新
```

**为什么 toRefs 能解决？**
```javascript
// toRefs 内部实现原理（简化版）
function toRefs(obj) {
  const ret = {}
  for (const key in obj) {
    ret[key] = toRef(obj, key)  // 每个属性转成 ref
  }
  return ret
}

// toRef 创建的 ref 与原对象保持关联
const name = toRef(state, 'name')
name.value = '李四'  // 实际修改的是 state.name
```

3. **watch监视ref对象需开启deep**

```javascript
let obj = ref({ a: 1 })
// ❌ 修改obj.value.a不会触发
watch(obj, () => {})
// ✅ 需开启深度监视
watch(obj, () => {}, { deep: true })
```

4. **reactive定义的数据，watch无法获取正确的oldValue**

```javascript
let state = reactive({ count: 0 })
watch(state, (newVal, oldVal) => {
  // ⚠️ newVal 和 oldVal 指向同一个对象
  console.log(newVal === oldVal)  // true
})

// ✅ 监视具体属性可以获取正确的 oldValue
watch(() => state.count, (newVal, oldVal) => {
  console.log(newVal, oldVal)  // 正确
})
```

5. **ref对象在模板中使用无需.value**

```javascript
// JS 中
let count = ref(0)
count.value++  // ✅ 需要 .value

// 模板中
<template>
  <div>{{ count }}</div>  <!-- ✅ 无需 .value -->
</template>
```

6. **setup 中不要解构 props**

```javascript
// ❌ 错误：解构会丢失响应式
setup(props) {
  let { title } = props
  watch(title, () => {})  // 不会触发
}

// ✅ 正确：直接使用或用 toRefs
setup(props) {
  watch(() => props.title, () => {})  // 方式1
  
  let { title } = toRefs(props)  // 方式2
  watch(title, () => {})
}
```

7. **watchEffect 中的异步操作要注意清理**

```javascript
// ❌ 可能导致内存泄漏
watchEffect(async () => {
  const res = await fetch('/api/data')
  data.value = await res.json()
})

// ✅ 正确：使用 onCleanup 清理
watchEffect((onCleanup) => {
  let cancelled = false
  
  fetch('/api/data').then(res => {
    if (!cancelled) {
      data.value = res.json()
    }
  })
  
  onCleanup(() => {
    cancelled = true
  })
})
```

---

## 九、快速参考
```javascript
// 常用导入
import { 
  ref, reactive, shallowRef, shallowReactive, readonly,
  computed, watch, watchEffect, 
  onMounted, onUnmounted, onBeforeMount, onBeforeUnmount,
  toRef, toRefs, isRef, isReactive,
  defineProps, defineEmits, defineExpose 
} from 'vue'

// 响应式定义
let count = ref(0)  // 基本类型
let state = reactive({ name: '' })  // 对象类型
let shallow = shallowRef({ nested: {} })  // 浅层响应式
let readonlyState = readonly(state)  // 只读代理

// 计算属性
let double = computed(() => count.value * 2)

// 侦听器
watch(count, (newVal, oldVal) => {}, { immediate: true, deep: true })
watchEffect((onCleanup) => { 
  /* 自动依赖追踪 */ 
  onCleanup(() => { /* 清理副作用 */ })
})

// 生命周期（可多次调用）
onMounted(() => { /* 组件挂载后 */ })
onUnmounted(() => { /* 组件卸载前 */ })

// script setup 中的编译器宏
const props = defineProps(['title'])
const emit = defineEmits(['change'])
defineExpose({ count, someMethod })

// 类型判断
if (isRef(count)) { /* ... */ }
if (isReactive(state)) { /* ... */ }
```

## 十、最佳实践建议

### 10.1 响应式数据选择
+ **基本类型** → 必须用 `ref`
+ **对象类型且需要整体替换** → 用 `ref`
+ **对象类型且层级深、不需要整体替换** → 用 `reactive`
+ **大型数据结构且只需顶层响应式** → 用 `shallowRef` 或 `shallowReactive`
+ **需要防止修改** → 用 `readonly`

### 10.2 性能优化
+ 使用 `shallowRef`/`shallowReactive` 减少深层监听开销
+ `computed` 会自动缓存，优先使用而不是 `watch` + 手动赋值
+ `watchEffect` 的 `flush: 'post'` 选项可以批量更新后再执行
+ 大列表渲染配合 `shallowRef` 可以显著提升性能

### 10.3 代码组织
+ 相关逻辑封装成自定义 Hook（`useXxx`）
+ 生命周期钩子可以多次调用，按功能分组
+ 复杂组件拆分成多个组合式函数，提高可维护性

### 10.4 类型安全（TypeScript）
```typescript
import { ref, Ref } from 'vue'

// 显式指定类型
const count: Ref<number> = ref(0)
const user = ref<User>({ name: '张三', age: 18 })

// 组合式函数返回类型
function useMouse(): { x: Ref<number>, y: Ref<number> } {
  const x = ref(0)
  const y = ref(0)
  return { x, y }
}
```
