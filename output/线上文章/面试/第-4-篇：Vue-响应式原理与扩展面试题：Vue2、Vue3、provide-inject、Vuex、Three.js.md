---
title: "第 4 篇：Vue 响应式原理与扩展面试题：Vue2、Vue3、provide/inject、Vuex、Three.js"
slug: "legacy-c16e0589-c16e0589"
summary: "Vue 响应式进阶与工程扩展面试指南，深入讲解 Vue2、Vue3、provide/inject、Vuex、Pinia、Three.js，并补充安全、通信、构建与常见 JavaScript/CSS 工程题。"
category: "面试"
categoryPath:
  - "面试"
tags:
  - "Vue2"
  - "Vue3"
  - "响应式原理"
  - "Three.js"
status: "published"
sortOrder: 40
cover: ""
originalId: "6a2d29208a2b1c68f2cac69a"
originalSlug: "legacy-c16e0589-c16e0589"
originalStatus: "published"
publishedAt: "2026-05-11T14:44:26.726Z"
updatedAt: "2026-07-31T11:16:22.566Z"
exportedAt: "2026-08-03T10:17:08.920Z"
---

# 第 4 篇：Vue 响应式原理与扩展面试题：Vue2、Vue3、provide/inject、Vuex、Three.js

这篇是上一篇 Vue 全面题库的进阶补充。上一篇侧重 Vue 的整体知识框架、虚拟 DOM、diff、组件通信和常用 API；本篇重点回答两个问题：**Vue 的响应式到底怎样运转**，以及**在真实项目中怎样处理跨层通信、全局状态、Three.js 和常见工程问题**。

每个重点问题尽量按照以下方式展开：

- **小白理解**：先明白它解决什么问题。
- **规范回答（可直接复述）**：用 30～60 秒说清定义、原理和边界。
- **原理与过程**：应对面试官继续追问。
- **场景或代码**：把概念落到实际开发。
- **易错点**：纠正常见但不严谨的说法。

> 版本说明：本文以 Vue 3 为当前开发主线，同时保留 Vue 2 和 Vuex 的高频面试内容。Vue 2 已停止官方维护；Vue 3 新项目通常优先使用 Pinia，Vuex 更常见于既有项目和历史面试题。

## 一、Vue 响应式的核心思想

### 1. 什么是响应式？

**小白理解**

普通 JavaScript 变量变化后，页面不会自己知道。响应式系统像在数据和使用它的代码之间建立一份“订阅关系”：谁读取过数据，系统就记住谁；数据改变时，再通知这些使用者重新执行。

**规范回答（可直接复述）**

Vue 响应式的核心是“依赖收集”和“派发更新”。组件渲染、计算属性、`watchEffect` 等逻辑执行时，如果读取了响应式数据，Vue 会记录当前副作用与该数据的依赖关系；数据被修改时，Vue 找到相关副作用，通过调度器去重并重新执行，最终触发计算值更新、侦听回调或组件重新渲染。

它不是定时比较整个对象，也不是数据一变就刷新整个页面，而是按读取关系追踪依赖，并尽量只更新受影响的部分。

~~~javascript
let activeEffect
const subscribers = new Set()

function effect(fn) {
  activeEffect = fn
  fn() // 执行期间读取数据并收集依赖
  activeEffect = undefined
}

function track() {
  if (activeEffect) subscribers.add(activeEffect)
}

function trigger() {
  subscribers.forEach(fn => fn())
}
~~~

真实 Vue 还要处理嵌套 effect、分支依赖清理、计算属性缓存、组件更新顺序、任务去重和集合类型等复杂情况，但基本思想仍是 `track -> trigger`。

### 2. 什么是响应式系统中的“副作用”？

**规范回答（可直接复述）**

副作用是读取响应式状态，并需要在依赖变化后重新执行的逻辑。例如组件渲染 effect 会生成 VNode 并更新视图，`watchEffect` 可能发请求或写日志，计算属性内部也有自己的响应式 effect。Vue 通过 effect 建立“这段逻辑依赖哪些数据”的关系。

~~~javascript
const price = ref(10)
const count = ref(2)

watchEffect(() => {
  console.log(price.value * count.value)
})
~~~

回调执行时读取了 `price.value` 和 `count.value`，所以任意一个变化都会让它再次执行。

## 二、Vue 2 响应式原理

### 3. Vue 2 的响应式完整流程是什么？

**小白理解**

Vue 2 会给对象已有的每个属性安装一个“门卫”：读属性时登记使用者，改属性时通知使用者。组件的渲染逻辑就是其中一种使用者。

**规范回答（可直接复述）**

Vue 2 主要通过 `Object.defineProperty` 把对象已有属性转换为 getter 和 setter。初始化时，`Observer` 遍历对象属性并调用 `defineReactive`；getter 在属性被读取时通过 `Dep` 收集当前 `Watcher`，setter 在值变化后通知 Dep 中的 Watcher。Watcher 收到通知后通常不会立即重复渲染，而是进入异步更新队列，同一轮事件循环中相同 Watcher 会被去重，最后统一执行组件更新。

完整链路可以记成：

~~~text
Observer
  -> defineReactive
  -> getter 读取
  -> Dep.depend 收集 Watcher
  -> setter 修改
  -> Dep.notify 通知 Watcher
  -> queueWatcher 进入调度队列
  -> patch 更新视图
~~~

**各角色的职责**

- `Observer`：给对象或数组添加观察能力。
- `defineReactive`：把一个属性改造成响应式 getter/setter。
- `Dep`：每个属性对应的依赖管理器，保存订阅它的 Watcher。
- `Watcher`：代表组件渲染、用户 `watch` 或计算属性等订阅者。
- 调度队列：对更新去重和排序，避免一次同步修改造成多次渲染。

### 4. Vue 2 为什么检测不到对象属性的新增和删除？

**规范回答（可直接复述）**

因为 `Object.defineProperty` 只能拦截已经被定义 getter/setter 的属性。Vue 2 初始化时会遍历当时存在的属性，但之后直接执行 `obj.newKey = value`，新属性没有经过响应式转换；直接 `delete obj.key` 也不会触发原属性的 setter。因此 Vue 2 需要使用 `Vue.set`、`vm.$set`、`Vue.delete` 或 `vm.$delete`。

~~~javascript
// Vue 2
this.$set(this.user, 'age', 18)
this.$delete(this.user, 'temporaryField')
~~~

`Vue.set` 会为新属性建立响应式能力，再通知对象相关依赖更新。

**易错点**

- Vue 3 的 `reactive` 基于 Proxy，通常可直接检测属性新增和删除，不再需要 `Vue.set`。
- 如果一开始能确定字段，Vue 2 最稳妥的方式仍是在 `data` 中提前声明。

### 5. Vue 2 为什么不能直接检测数组下标赋值和 length 修改？

**规范回答（可直接复述）**

Vue 2 没有为数组的每个下标都设置 `defineProperty` 拦截，而是改写了数组原型上的 7 个变更方法：`push`、`pop`、`shift`、`unshift`、`splice`、`sort` 和 `reverse`。这些方法执行后会观察新插入的元素，并通知数组依赖更新。因此直接按下标赋值或直接修改 `length` 不能被稳定检测，应使用 `Vue.set` 或 `splice`。

~~~javascript
// 不推荐：Vue 2 无法可靠触发更新
this.list[1] = newItem
this.list.length = 0

// 推荐
this.$set(this.list, 1, newItem)
this.list.splice(1, 1, newItem)
this.list.splice(0)
~~~

**面试官可能追问：为什么数组中的对象属性修改又能更新？**

数组被观察时，数组元素中的对象也会继续经过 Observer。修改 `list[0].name` 实际触发的是 `name` 属性自己的 setter，与直接替换 `list[0]` 不是一件事。

### 6. Vue 2 的 computed 为什么有缓存？

**规范回答（可直接复述）**

Vue 2 会为计算属性创建一个惰性 Watcher。首次读取计算属性时才执行 getter 并收集依赖，结果随后被缓存；依赖变化时，这个 Watcher 不会立刻重新计算，而是把 `dirty` 标记设为 `true`。下次再读取时，只有 `dirty` 为 `true` 才重新求值。因此多次读取但依赖未变化时，可以复用缓存结果。

计算属性不是“永远只执行一次”。它会在依赖变化后的下一次读取时重新计算；如果 getter 依赖的是非响应式数据，Vue 无法知道它发生了变化。

## 三、Vue 3 响应式原理

### 7. Vue 3 的响应式完整流程是什么？

**小白理解**

Vue 3 不再逐个给属性安装 getter/setter，而是用 Proxy 代理整个对象。读取、修改、新增、删除、判断属性是否存在或遍历对象时，都可以被代理层看到。

**规范回答（可直接复述）**

Vue 3 对对象主要使用 Proxy 创建响应式代理，并用 Reflect 完成默认对象操作。响应式 effect 执行并读取属性时，Proxy 的 `get` 等拦截器调用 `track` 收集依赖；修改、添加或删除属性时，`set`、`deleteProperty` 等拦截器调用 `trigger` 找到相关 effect。组件更新 effect 会交给 scheduler 调度，完成去重和批处理后再执行渲染与 patch。

依赖关系大致保存为：

~~~text
WeakMap<原始对象, Map<属性键, Set<ReactiveEffect>>>
~~~

可以记成：

~~~text
reactive(raw)
  -> Proxy
  -> effect 执行
  -> get/has/ownKeys
  -> track(target, key)
  -> set/add/delete
  -> trigger(target, key, type)
  -> scheduler
  -> effect 重新执行或组件更新
~~~

**为什么最外层使用 WeakMap？**

WeakMap 的键是原始对象，而且不会因为依赖表单独保留这个对象。当原始对象没有其他引用时，它仍可以被垃圾回收，有助于避免依赖容器造成不必要的内存占用。

### 8. Proxy 和 Reflect 分别做什么？

**规范回答（可直接复述）**

Proxy 负责拦截对象操作，例如读取、设置、删除、`in` 判断和遍历；Reflect 负责按 JavaScript 规范执行对应的默认操作，并返回规范化结果。Vue 在 Proxy 拦截器中先处理依赖追踪、只读校验等逻辑，再通过 Reflect 把操作交还给目标对象。

~~~javascript
const proxy = new Proxy(target, {
  get(target, key, receiver) {
    track(target, key)
    return Reflect.get(target, key, receiver)
  },
  set(target, key, value, receiver) {
    const result = Reflect.set(target, key, value, receiver)
    trigger(target, key)
    return result
  }
})
~~~

使用 `Reflect.get(target, key, receiver)` 而不是简单的 `target[key]`，还可以让访问器属性中的 `this` 正确指向接收者，使内部读取也有机会经过代理。

### 9. Vue 3 相比 Vue 2 的响应式优势是什么？

**规范回答（可直接复述）**

Vue 3 的 Proxy 可以直接拦截对象属性新增、删除、`in` 操作和键遍历，也能通过专门的集合处理器支持 `Map`、`Set` 等数据结构；它不需要在初始化时为对象每个已有属性都建立 getter/setter，并且嵌套对象可以在访问时再按需转换为代理。Vue 3 因此解决了 Vue 2 对属性增删和数组下标修改的检测限制，也为组合式响应式 API 提供了统一基础。

**易错点**

- 不要回答“Proxy 在任何情况下都一定更快”。性能受对象规模、访问模式、引擎实现和框架调度影响。
- Proxy 无法被完整 polyfill，因此 Vue 3 不支持 IE11。
- Proxy 返回的是新对象，代理与原始对象存在身份差异。

### 10. Vue 3 是深层响应式吗？会一开始递归代理全部属性吗？

**规范回答（可直接复述）**

`reactive` 在使用语义上默认是深层响应式：读取到嵌套对象后，嵌套对象也会以响应式代理的形式返回。但它通常不是在初始化时递归遍历并立即代理整棵对象树，而是在访问嵌套对象时进行惰性转换，并缓存原始对象与代理的对应关系。

~~~javascript
const state = reactive({
  user: {
    profile: { name: '小明' }
  }
})

state.user.profile.name = '小红'
~~~

“深层响应式”描述的是嵌套变化能够被追踪的效果，不等于“一创建 reactive 就递归代理所有子对象”。大型不可变数据、第三方类实例或只关心顶层替换的状态，可以考虑 `shallowRef`、`shallowReactive` 或 `markRaw`。

### 11. Vue 3 怎样区分属性修改、新增、删除和遍历依赖？

**规范回答（可直接复述）**

Proxy 的 `set` 拦截器可以先判断属性原来是否存在，从而区分 SET 和 ADD；`deleteProperty` 可以处理删除。读取具体属性时按 key 收集依赖，执行 `Object.keys`、`for...in` 等遍历时则通过 `ownKeys` 收集一个表示“键集合”的迭代依赖。新增或删除属性不仅触发该 key 的依赖，也要触发键集合相关的依赖。

对于 `Map` 和 `Set`，Vue 还会区分取值、键迭代、值迭代以及 `size` 等依赖，确保 `set`、`add`、`delete`、`clear` 能通知正确的 effect。

## 四、ref、reactive 与响应式工具

### 12. ref 和 reactive 有什么区别？怎样选择？

**小白理解**

- `ref` 像一个带 `.value` 的响应式盒子，数字、字符串、对象都能放。
- `reactive` 直接把对象做成响应式代理，访问属性时不用写 `.value`。

**规范回答（可直接复述）**

`ref` 可以包装任意值，通过 `.value` 统一触发读取和修改；当它包装对象时，默认也会把对象转换为深层响应式。`reactive` 主要用于对象、数组以及 `Map`、`Set` 等对象类型，返回对应的 Proxy。

实际开发中我通常用 `ref` 表示可以整体替换的独立状态，用 `reactive` 组织一组关系紧密的对象字段。两者没有绝对优劣，关键是保持团队风格和避免丢失响应性。

| 对比项 | ref | reactive |
| --- | --- | --- |
| 可包装值 | 基本类型和对象 | 对象类型 |
| 脚本中访问 | 使用 `.value` | 直接访问属性 |
| 整体替换 | 给 `.value` 重新赋值 | 不能靠替换原变量保持旧代理关系 |
| 解构 | ref 本身可独立传递 | 普通解构属性容易丢失响应性 |

### 13. 为什么模板中常不用写 .value？

**规范回答（可直接复述）**

Vue 模板会对渲染上下文中的 ref 做自动解包，所以顶层 ref 在模板中通常可以直接使用。脚本代码没有这层模板转换，仍要通过 `.value` 读取和修改。`reactive` 对象属性中的 ref 也存在一定解包规则，但数组、集合以及深层表达式有边界，不能简单记成“任何地方都自动解包”。

~~~vue
<script setup>
import { ref } from 'vue'

const count = ref(0)
count.value++
</script>

<template>
  <button @click="count++">{{ count }}</button>
</template>
~~~

### 14. 为什么解构 reactive 对象会丢失响应性？

**小白理解**

代理只能拦截“通过代理对象进行的读取”。把一个基本类型属性解构到普通变量后，后续读写不再经过原代理，自然不会被追踪。

**规范回答（可直接复述）**

`reactive` 的响应性依赖对 Proxy 属性的访问。执行 `const { name } = state` 时，如果 `name` 是字符串，得到的是当时的普通值，不再与 `state.name` 建立访问关系。可以保留对象属性访问，或者使用 `toRef`、`toRefs` 把属性转换成与源对象同步的 ref。

~~~javascript
const state = reactive({ name: '小明', age: 18 })

const { name } = state // 普通字符串，后续不会同步
const nameRef = toRef(state, 'name')
const { age } = toRefs(state)

nameRef.value = '小红'
age.value = 20
~~~

如果解构出来的是嵌套对象，这个值本身可能仍是代理，但顶层属性被整体替换时，旧引用不会自动指向新对象。因此不要只背“对象解构不会丢、基本类型会丢”。

### 15. computed、watch、watchEffect 怎么选？

**规范回答（可直接复述）**

- `computed` 用于根据已有响应式状态声明派生值，具有缓存，getter 应尽量保持纯函数。
- `watch` 用于明确监听指定数据源并执行副作用，可以获得新旧值，支持异步请求、清理和更精确的触发控制。
- `watchEffect` 会立即执行，并自动收集同步执行过程中读取的响应式依赖，适合依赖关系简单但不想重复声明来源的副作用。

一句话记忆：**派生值用 computed，明确监听谁用 watch，自动追踪副作用用 watchEffect。**

~~~javascript
const firstName = ref('三')
const lastName = ref('张')
const fullName = computed(() => lastName.value + firstName.value)

watch(firstName, (newValue, oldValue) => {
  console.log('名字变化', oldValue, newValue)
})

watchEffect(onCleanup => {
  const controller = new AbortController()
  fetch('/api/users?name=' + firstName.value, {
    signal: controller.signal
  })
  onCleanup(() => controller.abort())
})
~~~

**易错点**

- 不要在 `computed` getter 中发请求、改其他状态或操作 DOM。
- `watchEffect` 只自动追踪回调**同步执行阶段**读取的依赖；在 `await` 之后才读取的数据通常不会被本轮收集。
- `watch(reactiveObject, callback)` 通常是深层监听语义，但新旧值可能指向同一个对象；若需要可靠快照，应明确选择字段或自行生成副本。

### 16. watch 的 flush 有什么作用？

**规范回答（可直接复述）**

`flush` 控制侦听回调相对于组件更新的执行时机：

- `pre`：默认值，在所属组件 DOM 更新前执行，但通常在父组件更新之后。
- `post`：在组件 DOM 更新后执行，适合读取更新后的 DOM；也可使用 `watchPostEffect`。
- `sync`：状态变化时同步执行，不经过普通批处理，适合非常轻量且必须同步的逻辑。

`flush: 'sync'` 可能在同一轮大量数组修改中频繁触发，应谨慎使用。读取更新后的 DOM，也可以在修改状态后 `await nextTick()`。

### 17. Vue 为什么批量更新？nextTick 是什么？

**规范回答（可直接复述）**

同一轮同步代码中可能连续修改多次状态。如果每次都立即渲染，会产生重复计算和 DOM 操作。Vue 会把组件更新任务放入调度队列，按规则去重和排序，再在异步刷新时统一执行。`nextTick` 返回一个 Promise，让业务代码等待当前批次的 DOM 更新完成。

~~~javascript
async function update() {
  count.value++
  count.value++
  count.value++

  // 数据已改变，但 DOM 可能尚未刷新
  await nextTick()
  // 此时可读取更新后的 DOM
}
~~~

“异步更新”指视图更新调度，不代表响应式变量赋值本身是异步的。`nextTick` 也不是固定等待一个 `setTimeout`，更不是网络请求等待工具。

### 18. shallowRef、shallowReactive 和 triggerRef 有什么用？

**规范回答（可直接复述）**

`shallowRef` 只跟踪 `.value` 的整体替换，不会把内部对象深度转成响应式；`shallowReactive` 只让对象第一层属性具备响应性，嵌套对象按原样保留。它们适合大型不可变数据、第三方实例，或者业务只通过整体替换更新的状态。

~~~javascript
const chart = shallowRef(null)
const rows = shallowRef([])

rows.value = [...rows.value, newRow]
~~~

如果有意直接修改了 `shallowRef` 内部值，可以用 `triggerRef` 手动通知依赖，但通常优先采用整体替换，让数据流更清晰。

### 19. readonly、markRaw 和 toRaw 分别做什么？

**规范回答（可直接复述）**

- `readonly` 返回只读代理，读取仍可建立响应关系，但写入会被阻止并在开发环境警告，适合暴露只读状态。
- `markRaw` 标记对象不应被转换为响应式代理，适合 Three.js 实例和复杂第三方类实例。
- `toRaw` 取得 Vue 代理背后的原始对象，适合临时读取、调试或与要求原始对象的库交互。

**易错点**

- `readonly` 不是安全隔离，不能替代服务端权限校验；拿到原始对象的代码仍可能修改它。
- 不要长期保存 `toRaw` 的结果并绕过代理写数据，否则更新不会被追踪。
- `markRaw` 与浅层 API 可能形成 raw/proxy 身份混用，应保持边界清晰。

### 20. 什么是代理与原始对象的身份问题？

**规范回答（可直接复述）**

`reactive(raw)` 返回的是 Proxy，因此 `proxy !== raw`。Vue 会缓存同一原始对象对应的代理，重复调用通常返回同一个代理；`toRaw(proxy) === raw`。如果一部分代码保存原始对象，另一部分保存代理，再用严格相等、`Map` key 或 `Set` 去重，就可能出现身份判断不一致。

~~~javascript
const raw = { id: 1 }
const proxy = reactive(raw)

console.log(raw === proxy) // false
console.log(toRaw(proxy) === raw) // true
~~~

业务中应尽量统一使用代理或稳定业务 ID，不要依赖 raw 与 proxy 的引用相等判断同一条数据。

### 21. customRef 和 effectScope 适合什么场景？

**规范回答（可直接复述）**

`customRef` 允许开发者自行控制什么时候 track、什么时候 trigger，常用于防抖输入等自定义响应式行为。`effectScope` 用于把多个 computed、watch 和 watchEffect 收进同一个作用域，之后可以统一停止，适合可复用组合式逻辑或脱离组件创建的一组响应式副作用。

~~~javascript
function useDebouncedRef(initialValue, delay = 300) {
  let value = initialValue
  let timer

  return customRef((track, trigger) => ({
    get() {
      track()
      return value
    },
    set(nextValue) {
      clearTimeout(timer)
      timer = setTimeout(() => {
        value = nextValue
        trigger()
      }, delay)
    }
  }))
}
~~~

组件 `setup` 中同步创建的 watcher 通常会随组件卸载自动停止；异步创建、全局创建或脱离组件的 effect 更要注意主动清理。

## 五、provide/inject 与跨层通信

### 22. provide/inject 是什么？怎样工作？

**小白理解**

祖先组件要把配置传给很深的后代时，层层写 props 很麻烦。provide 像祖先把数据放进当前组件树的“共享柜子”，后代用同一个 key 去取。

**规范回答（可直接复述）**

provide/inject 用于祖先向任意层级后代提供依赖，解决深层 props 透传问题。祖先通过 provide(key, value) 注册值，后代通过 inject(key) 沿父组件链向上查找最近的同名提供者。它体现的是组件树范围内的依赖注入，不是全局状态仓库；它也不会让普通值自动变成响应式。

~~~javascript
export const userContextKey = Symbol('user-context')

// 祖先组件
const user = ref({ name: '小明' })
function rename(name) {
  user.value.name = name
}
provide(userContextKey, {
  user: readonly(user),
  rename
})

// 任意后代组件
const userContext = inject(userContextKey)
userContext?.rename('小红')
~~~

### 23. provide/inject 提供的数据会自动响应式更新吗？

**规范回答（可直接复述）**

不会因为使用了 provide/inject 就自动响应式。提供普通字符串或普通对象时，注入方只是拿到这个值或引用；希望后代随状态变化更新，应提供 ref、reactive、computed 等响应式值。注入 ref 时应保留 ref，不要在 provide 时提前取 .value，否则只提供了当时的快照。

~~~javascript
const theme = ref('light')
provide('theme', theme) // 响应式
provide('themeSnapshot', theme.value) // 只是当前字符串
~~~

### 24. 后代能不能修改 inject 得到的数据？

**规范回答（可直接复述）**

技术上，如果祖先提供的是可写 ref 或 reactive 对象，后代拿到同一引用后可以修改。更推荐由提供方维护状态修改权：对外提供 readonly 状态和语义明确的操作函数。这样数据流更可控，也便于校验、日志和重构。

所以“子组件不能修改 inject 数据”并不准确。provide/inject 本身不会自动禁止写入。

### 25. 为什么推荐 Symbol 作为 key？默认值怎么写？

**规范回答（可直接复述）**

大型项目中字符串 key 容易重名，Symbol 可以保证 key 唯一，也便于 TypeScript 配合 InjectionKey<T> 约束类型。inject 可以传默认值；如果默认值是需要执行后才创建结果的工厂，应使用第三个参数说明它是工厂。

~~~javascript
const config = inject(configKey, () => createDefaultConfig(), true)
~~~

应用级插件或全局配置也可以通过 app.provide 提供，但不应因为方便就把所有业务状态都做成全局注入。

### 26. props、provide/inject 和 Pinia/Vuex 怎样选择？

**规范回答（可直接复述）**

- 父子组件之间显式传递数据，优先 props 和 emits，关系最清楚。
- 同一组件子树中，祖先向深层后代提供主题、表单上下文、组件库服务等依赖，使用 provide/inject。
- 跨页面、跨模块共享，存在复杂派生状态、修改流程、调试或持久化需求时，使用 Pinia 或 Vuex。

选择标准不是“跨了几层”，而是状态的所有权、作用域、生命周期和调试需求。局部状态不应无条件提升为全局状态。

## 六、Vuex、Pinia 与全局状态管理

### 27. Vuex 的核心组成是什么？

**小白理解**

Vuex 像应用的公共数据中心，但不是所有组件随意改一个公共对象。它规定了读取、派生、同步修改和异步流程怎样组织。

**规范回答（可直接复述）**

Vuex 是 Vue 的集中式状态管理方案。state 保存共享状态；getters 根据 state 派生数据；mutations 通过 commit 提交同步状态变更；actions 通过 dispatch 调用，可以组织异步流程，最终通常提交 mutation；modules 用来按业务领域拆分大型 store，可结合命名空间避免冲突。

~~~javascript
const store = createStore({
  state: () => ({ user: null }),
  getters: {
    isLoggedIn: state => Boolean(state.user)
  },
  mutations: {
    setUser(state, user) {
      state.user = user
    }
  },
  actions: {
    async login({ commit }, credentials) {
      const user = await api.login(credentials)
      commit('setUser', user)
      return user
    }
  }
})
~~~

### 28. mutation 和 action 有什么区别？

**规范回答（可直接复述）**

mutation 负责同步、可追踪地修改 state，通过 commit 触发；action 用于组织业务流程，可以异步，通过 dispatch 触发，并可组合多个 action 或提交 mutation。Vuex 要求 mutation 保持同步，是因为 DevTools 需要准确记录某次 mutation 前后的状态；若异步回调隐藏在 mutation 中，就难以对应变化发生的时刻。

**易错点**

- Vuex 不是“任何组件都能任意写 state”。规范写法是按 Vuex 约定提交变更，严格模式还会检查约定外写入。
- action 不一定必须异步，也可以封装同步但复杂的业务编排。
- 只服务单个页面的请求不必都放 store，也可以留在页面或组合式函数中。

### 29. modules 和 namespace 解决什么问题？

**规范回答（可直接复述）**

应用变大后，把所有状态和操作放在一个 store 会出现命名冲突和职责混乱。modules 可以按用户、订单、权限等领域拆分；启用 namespaced: true 后，getter、mutation 和 action 会带模块命名空间，例如 user/login，调用关系更清楚。

模块 action 既可访问局部 state，也可通过 rootState 访问根状态；跨命名空间提交或派发时需要显式指定 root。模块应按业务边界拆分，不要机械地一个页面建立一个 module。

### 30. Vuex 和 Pinia 有什么区别？新项目选哪个？

**规范回答（可直接复述）**

Vue 3 新项目通常优先使用 Pinia。Pinia API 更轻量，没有 mutation 层，可以在 action 中直接修改 state；它对 TypeScript、组合式 API、模块化和开发工具支持更自然。Vuex 的 state、getter、mutation、action、module 分层更严格，在既有 Vue 2/Vue 3 项目中仍很常见，也是面试高频内容。

选型应考虑已有技术栈和迁移成本：新 Vue 3 项目优先 Pinia，稳定运行的 Vuex 项目不应只为追新而盲目重写。

### 31. 刷新后 store 数据为什么丢失？怎样持久化？

**规范回答（可直接复述）**

Pinia 和 Vuex 的状态默认保存在 JavaScript 运行内存中，刷新会创建新的应用实例，所以状态恢复为初始值。需要跨刷新保留时，可以把允许持久化的数据写入 localStorage、sessionStorage、IndexedDB，或由服务端在启动时重新返回，并在应用初始化时恢复 store。

**安全边界**

- localStorage 中的数据用户可以查看和修改，不能作为可信权限来源。
- 不应保存明文密码、服务端密钥等敏感信息。
- 登录是否有效、角色是否有权限，最终必须由服务端校验。
- 持久化数据还要考虑版本迁移、过期、退出清理和多标签同步。

## 七、Vue 3 与 Three.js

### 32. Three.js 是什么？核心对象有哪些？

**小白理解**

WebGL 很强，但直接使用比较复杂。Three.js 在它之上封装场景、相机、模型、材质、灯光和渲染器，让前端更容易创建 3D 内容。

**规范回答（可直接复述）**

Three.js 是基于 WebGL 的 JavaScript 3D 渲染库。基础场景通常包含 Scene、Camera 和 WebGLRenderer；现代版本中的可见物体通常由 BufferGeometry 与 Material 组合成 Mesh，再加入 Scene。渲染器从 Camera 视角把场景绘制到 canvas。动画通过 requestAnimationFrame 更新对象或控制器，并在每帧调用 renderer.render。

~~~javascript
const scene = new THREE.Scene()
const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 1000)
const renderer = new THREE.WebGLRenderer({ antialias: true })
const geometry = new THREE.BoxGeometry(1, 1, 1)
const material = new THREE.MeshStandardMaterial({ color: 0x1677ff })
const cube = new THREE.Mesh(geometry, material)

scene.add(cube)
camera.position.z = 3
renderer.render(scene, camera)
~~~

Scene 管理对象；Camera 决定观察方式；Renderer 负责绘制；BufferGeometry 保存顶点、法线和 UV；Material 决定表面表现；Mesh 是几何体与材质组成的可渲染对象；Light 为需要光照计算的材质提供光源。

### 33. 怎样在 Vue 中正确初始化和销毁 Three.js？

**规范回答（可直接复述）**

我会在 onMounted 中读取容器尺寸、创建场景、相机和渲染器并挂载 canvas；用 requestAnimationFrame 维护动画，用 ResizeObserver 处理尺寸变化。在 onBeforeUnmount 中取消动画帧、断开观察器、移除事件，遍历释放几何体、材质和纹理，调用 renderer 清理并移除 canvas，避免 GPU 资源和闭包持续占用内存。

~~~javascript
function animate() {
  frameId = requestAnimationFrame(animate)
  mesh.rotation.y += 0.01
  renderer.render(scene, camera)
}

onMounted(() => {
  scene = markRaw(new THREE.Scene())
  renderer = markRaw(new THREE.WebGLRenderer({ antialias: true }))
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  containerRef.value.appendChild(renderer.domElement)
  resizeObserver = new ResizeObserver(resize)
  resizeObserver.observe(containerRef.value)
  animate()
})

onBeforeUnmount(() => {
  cancelAnimationFrame(frameId)
  resizeObserver?.disconnect()
  mesh?.geometry.dispose()
  mesh?.material.dispose()
  renderer?.dispose()
  renderer?.domElement.remove()
})
~~~

**易错点**

- Vue 组件卸载不会自动释放 WebGL 的 GPU 资源。
- scene.remove(mesh) 只移除对象，不等于 dispose。
- 材质可能是数组，纹理也要单独释放。
- scene、renderer、controls、模型通常没必要被 Vue 深度代理，可使用普通变量、markRaw 或 shallowRef。

### 34. 为什么要限制设备像素比？

高 DPR 设备完全按 devicePixelRatio 渲染时，像素数量按 DPR 的平方增长。DPR 从 1 到 3，工作量接近 9 倍。通常可用下面方式平衡清晰度、帧率和发热：

~~~javascript
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
~~~

具体上限应结合设备性能和场景复杂度测试，不是固定必须为 2。

### 35. Three.js 怎样加载 GLTF、OBJ 等模型？

**规范回答（可直接复述）**

Three.js 核心包提供基础渲染能力，GLTF、OBJ、DRACO 等加载器通常从 three/addons，或旧版 three/examples/jsm 中单独引入。Web 项目通常优先 glTF/GLB，因为它面向实时渲染，可包含层级、材质、纹理和动画，也支持 Draco、Meshopt、KTX2 等压缩方案。

~~~javascript
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'

const loader = new GLTFLoader()
loader.load(
  '/models/office.glb',
  gltf => scene.add(gltf.scene),
  event => console.log(event.loaded, event.total),
  error => console.error('模型加载失败', error)
)
~~~

“支持某格式”不等于核心入口自动包含全部加载器。还要处理资源路径、CORS、解码器路径、加载状态、错误兜底、缓存和销毁。

### 36. 怎样点击选中 3D 物体？

**规范回答（可直接复述）**

通常使用 Raycaster。先把鼠标在 canvas 中的位置转换为 -1 到 1 的标准化设备坐标，再通过 setFromCamera 从相机发出射线，用 intersectObjects 获取按距离排序的相交对象。

~~~javascript
function handlePointerDown(event) {
  const rect = renderer.domElement.getBoundingClientRect()
  pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1
  pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1

  raycaster.setFromCamera(pointer, camera)
  const [hit] = raycaster.intersectObjects(selectableObjects, true)
  if (hit) selectObject(hit.object)
}
~~~

坐标必须相对 canvas 计算；嵌套模型还要把命中的子 Mesh 映射回业务对象。

### 37. Three.js 场景卡顿怎样优化？

**规范回答（可直接复述）**

先用性能工具和 renderer.info 判断瓶颈在 CPU、GPU、draw call、顶点、纹理还是业务更新，再针对处理：

- 合并静态几何体或使用 InstancedMesh 绘制大量相同模型，降低 draw call。
- 使用 LOD、视锥裁剪和按需加载，减少同帧对象与三角形。
- 使用 Draco/Meshopt、KTX2 等压缩，并控制纹理分辨率。
- 减少透明材质、实时阴影、后处理和昂贵光照。
- 限制 DPR，避免每帧创建对象，复用向量、材质和几何体。
- 静止场景按需渲染，不必永久运行 60 帧循环。

不要只回答“减少模型面数”。draw call、材质切换、纹理显存、阴影、过度绘制和每帧 JavaScript 分配同样重要。

## 八、常见 JavaScript 与前端工程扩展题

### 38. 防抖和节流有什么区别？

**小白理解**

- 防抖：事件连续发生时一直重新计时，停下来一段时间后只执行最后一次。
- 节流：事件再频繁，一段时间内最多执行一次。

**规范回答（可直接复述）**

防抖用于把一串连续触发合并为一次执行，适合搜索输入、表单校验等只关心最终结果的场景；节流用于限制固定时间内的执行频率，适合滚动、拖拽、鼠标移动等需要持续反馈但不能每次都执行的场景。实现时还要考虑首次是否立即执行、末尾是否补执行、参数和 this 透传，以及组件卸载时取消定时器。

~~~javascript
function debounce(fn, delay) {
  let timer

  function debounced(...args) {
    clearTimeout(timer)
    timer = setTimeout(() => fn.apply(this, args), delay)
  }

  debounced.cancel = () => clearTimeout(timer)
  return debounced
}

function throttle(fn, delay) {
  let lastTime = 0

  return function throttled(...args) {
    const now = Date.now()
    if (now - lastTime >= delay) {
      lastTime = now
      fn.apply(this, args)
    }
  }
}
~~~

生产项目通常优先使用经过验证的工具库，因为 leading、trailing、cancel、flush 等边界比基础版复杂。

### 39. Promise.all 是做什么的？

**规范回答（可直接复述）**

Promise.all 接收一个可迭代对象，把每一项转换为 Promise，并返回一个新的 Promise。所有任务都成功时，它按**传入顺序**返回结果数组；任意一项失败时，返回的 Promise 会以第一个观察到的失败原因立即拒绝，也就是 fail-fast。

~~~javascript
const [user, permissions] = await Promise.all([
  getUser(),
  getPermissions()
])
~~~

**两个高频易错点**

1. Promise.all 负责聚合和等待，不负责“启动 Promise”。调用 getUser() 时任务通常已经开始；如果只是函数数组但没有调用，它不会自动执行。
2. fail-fast 只表示 Promise.all 返回失败，不会自动取消其他已经开始的请求。需要取消时要结合 AbortController 或任务自身能力。

相关方法：allSettled 等待全部并保留每项结果；race 由第一个 settled 决定；any 由第一个 fulfilled 决定，全部失败才拒绝。

### 40. 项目中怎样理解“二次封装”？

**规范回答（可直接复述）**

二次封装是在底层库之上固化项目中稳定、重复的规则，减少业务页面重复代码。例如请求层统一基地址、鉴权头、错误结构和取消机制；上传组件统一类型、大小、进度和资源选择；表格统一分页协议和权限操作；ECharts 封装主题、ResizeObserver 和销毁逻辑。

好的封装应有稳定职责、清晰输入输出、保留必要扩展口，并且能显著减少重复或错误。如果业务差异很大、需要透传几十个配置，可能说明抽象层级不合适。

**Axios 封装常见追问**

- 请求拦截器添加 token、追踪 ID 等通用信息，但不要覆盖业务显式配置。
- 响应层统一解析业务错误和 HTTP 错误，同时保留原始错误信息。
- 401 刷新 token 时要避免多个并发请求重复刷新，并处理重放失败。
- 区分超时、取消、断网、服务端错误和业务校验错误。
- 不要在底层对所有错误都直接弹窗，否则页面无法决定交互方式。

### 41. 高德地图 JavaScript API 怎样接入？

**规范回答（可直接复述）**

接入高德地图时，我会先在控制台创建应用并配置 Key 和安全密钥，通过官方 JS API 2.0 Loader 或脚本方式加载 SDK；组件挂载后创建 AMap.Map 实例，按需加载 Marker、Geocoder、Driving、Transfer、Walking 等插件。组件卸载时移除事件、覆盖物并销毁地图实例。Key 要限制可用域名，服务端私钥不能暴露到前端。

常见能力包括 Marker、InfoWindow、地址和逆地理编码、驾车/公交/步行路线以及地图事件。公交换乘使用当前版本的 AMap.Transfer，不要继续写已经废弃或来源不明的旧接口名称。

~~~javascript
const map = new AMap.Map(container, {
  zoom: 12,
  center: [116.397428, 39.90923]
})

AMap.plugin(['AMap.Geocoder', 'AMap.Transfer'], () => {
  const geocoder = new AMap.Geocoder()
  const transfer = new AMap.Transfer({ map })
})
~~~

实际参数和安全配置可能随官方版本调整，项目中应以当前官方 JS API 2.0 文档为准。

### 42. 怎样理解 Vue 3 + Vite？

**规范回答（可直接复述）**

Vue 3 是 UI 框架，提供组件、响应式、编译和渲染能力；Vite 是开发服务器与生产构建工具。开发阶段 Vite 利用浏览器原生 ESM 按请求转换源码，并对第三方依赖进行预构建，因此冷启动通常不需要先打完整业务 bundle；模块变化时通过 HMR 精确更新。生产阶段仍会执行完整构建、Tree Shaking、代码分割、压缩和资源处理。

“Vite 不打包”只适合描述开发阶段的核心思路，生产构建仍会生成优化后的静态资源。依赖预构建还包括 CommonJS/UMD 转 ESM，以及合并内部模块以减少开发请求。

### 43. HTTP 和 HTTPS 有什么区别？生产环境怎样选择？

**规范回答（可直接复述）**

HTTP 直接传输应用层数据，缺少传输加密、服务端身份认证和完整性保护。HTTPS 是 HTTP 运行在 TLS 安全通道之上：通过证书验证服务端身份，通过密钥协商建立会话密钥，再使用对称加密保护传输内容和完整性。常见默认端口分别是 80 和 443。

公网生产站点原则上都应使用 HTTPS，即使只是静态博客也一样，因为登录 Cookie、搜索内容和页面资源都可能被窃听或篡改，而且 Service Worker、安全 Cookie、HTTP/2/3 等能力通常也依赖安全上下文。HTTP 更适合受控的本地开发或由内网、反向代理承担 TLS 的特定链路。

HTTPS 主要保护传输链路，不代表网站业务绝对安全，仍需防范 XSS、CSRF、越权、注入、弱密码和依赖漏洞。

### 44. 实时消息有哪些实现方式？怎样选择？

**规范回答（可直接复述）**

- 短轮询：客户端定时请求，简单、兼容好，但空请求多且实时性取决于间隔。
- 长轮询：服务端暂时挂起请求，有数据或超时再返回，客户端随后重连。
- SSE：基于 HTTP 的服务端到客户端单向事件流，浏览器原生支持自动重连，适合通知、日志和 AI 流式输出。
- WebSocket：建立后可在同一长连接上双向通信，适合聊天、协作和高频状态同步。
- MQTT：发布/订阅式轻量消息协议，支持 QoS，更常见于物联网；浏览器一般通过 WebSocket 接入 Broker。

选择时要看通信方向、消息频率、断线恢复、代理兼容、扩容方式、服务端基础设施和是否需要二进制数据，而不是看到“实时”就统一使用 WebSocket。

### 45. WebSocket 的优缺点是什么？

**规范回答（可直接复述）**

WebSocket 的优点是一次 HTTP Upgrade 握手后保持全双工长连接，客户端和服务端都能主动发送消息；相比高频轮询，请求头开销更小、延迟更低，也支持文本和二进制帧。

缺点是长连接会增加服务端连接、心跳和资源管理成本；断线重连、消息补偿、顺序、重复、鉴权续期、限流都需要应用层设计；多实例部署时还要配合共享消息系统或连接路由；代理、防火墙和弱网络环境也可能中断连接。

**项目回答可继续展开**

- 建立连接时携带短期凭证或先完成 HTTP 登录，服务端仍要验证用户和频道权限。
- 使用 ping/pong 或业务心跳检测半开连接。
- 采用指数退避加随机抖动重连，避免重连风暴。
- 为重要消息设计 messageId、ack、去重、补拉或游标。
- 页面离开、账号退出或组件卸载时主动关闭连接和监听器。

### 46. 前端项目做过哪些安全处理？

**规范回答（可直接复述）**

前端安全要与服务端共同完成。我通常让输出内容默认转义，富文本使用白名单净化防 XSS；服务端使用 HttpOnly、Secure、SameSite Cookie 或合理的 token 方案，并配合 CSRF token、Origin/Referer 校验；所有接口在服务端做身份认证、对象级权限校验和参数验证；配置 CSP、安全响应头和 HTTPS；上传文件做服务端类型、大小和内容检查；依赖定期审计；敏感信息不写入前端代码或不可信存储。

前端路由守卫和按钮隐藏只改善体验，不是安全边界；v-html、innerHTML 和富文本是 XSS 高风险入口；CORS 是浏览器跨源读取控制，不是身份认证；参数校验不能只在前端做。

### 47. 图片或文件上传后，后端怎样确认它相对安全？

**规范回答（可直接复述）**

后端不能只相信文件扩展名和浏览器传来的 Content-Type。我会先做身份与上传权限校验，限制文件数量和大小；读取文件头魔数识别真实类型，并让允许列表、扩展名、MIME 和内容相互匹配；使用随机文件名保存到非可执行目录或对象存储，禁止用户控制服务器路径；图片可使用成熟图像库重新解码、限制像素尺寸并重新编码；高风险文件可异步病毒扫描，扫描通过前不得公开访问。

还要防止 ../ 路径穿越、同名覆盖、双扩展名、恶意 SVG/HTML、Zip Slip 和压缩炸弹。下载时设置正确的 Content-Type、Content-Disposition 和 X-Content-Type-Options: nosniff。没有单一检查能保证绝对安全。

### 48. KeepAlive 包裹的路由切换时，会不会触发 mounted 和 unmounted？

**规范回答（可直接复述）**

组件第一次进入缓存时会正常挂载，Vue 3 会涉及 onMounted 和 onActivated；切换离开时，如果仍被 KeepAlive 缓存，通常不会卸载，所以不触发 onUnmounted，而是触发 onDeactivated；再次回来时复用原组件实例，不会重复 onMounted，会再次触发 onActivated。

只有组件没有被缓存、缓存因 include/exclude/max 被淘汰、key 改变或 KeepAlive 本身卸载时，才真正执行卸载流程。Vue 2 对应 activated/deactivated/destroyed，Vue 3 销毁钩子是 beforeUnmount/unmounted。

需要每次回来刷新轻量数据可放在 onActivated；离开缓存页时在 onDeactivated 暂停定时器、视频和监听；真正释放资源仍要在 onUnmounted。

### 49. CSS 常见大小单位 px、em、rem、vw、vh 有什么区别？

**规范回答（可直接复述）**

- px 是 CSS 像素，适合边框、图标和稳定尺寸的局部元素，不严格等于物理像素。
- em 在 font-size 中通常相对继承得到的字体尺寸，其他属性上的 em 通常相对当前元素自身计算后的 font-size，嵌套时可能累积。
- rem 相对根元素 html 的 font-size，便于统一缩放。
- vw、vh 分别是视口宽度和高度的 1%，适合与视口直接关联的布局。

移动端地址栏会让传统 vh 的可视高度表现不稳定，现代 CSS 还提供 svh、lvh、dvh。字体和间距不应机械地全部换成 vw，应结合可访问性、最小最大值和响应式断点。

### 50. 百分比与 vw、vh 有什么区别？

**规范回答（可直接复述）**

百分比通常相对包含块或相关父级计算，具体参照物取决于属性；vw 和 vh 始终相对视口尺寸。width: 50% 通常是包含块宽度一半，width: 50vw 是视口宽度一半。

height: 100% 通常要求包含块高度可确定；百分比 padding-top、padding-bottom 在传统水平书写模式下通常相对包含块宽度计算。因此不要笼统说“百分比都相对父元素宽高”。

### 51. 一个常见列表流怎样布局？

**规范回答（可直接复述）**

单列文章或消息流用正常文档流，每项内部用 Flex；规则多列卡片用 CSS Grid，通过 repeat(auto-fill, minmax(...)) 自适应；真正瀑布流按列阅读可用 CSS columns，需要保持视觉顺序或虚拟滚动则用专门方案。长列表结合分页、游标加载或虚拟滚动，使用稳定 key，图片预留宽高避免布局偏移。

~~~css
.article-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 16px;
}
~~~

还要考虑响应式、空状态、加载状态、图片比例、文本截断和键盘可访问性。

### 52. 怎样快速提取对象数组中的所有 ID？

**规范回答（可直接复述）**

最直接、可读性最好的方式是 map，时间复杂度是 O(n)：

~~~javascript
const ids = users.map(item => item.id)
~~~

如果要排除空 ID，可以用 reduce 一次遍历；如果还要去重，可以使用 Set：

~~~javascript
const ids = users.reduce((result, item) => {
  if (item.id != null) result.push(item.id)
  return result
}, [])

const uniqueIds = [...new Set(users.map(item => item.id))]
~~~

“最快”不能脱离数据规模和需求讨论。普通业务优先清晰的 map，超大数组再基准测试循环和内存分配。

### 53. 字符串、数字、JSON 和日期怎样可靠转换？

~~~javascript
Number('123.45') // 123.45
Number('') // 0
Number('12px') // NaN
parseInt('12px', 10) // 12
parseFloat('12.5px') // 12.5
~~~

**规范回答（可直接复述）**

Number 要求整个字符串符合数值转换规则，更适合严格转换；parseInt 和 parseFloat 会从开头解析到无法继续的位置，适合明确允许单位尾缀的场景。转换后使用 Number.isNaN 或 Number.isFinite 校验。数字转字符串可以用 String(value) 或 value.toString()，但对 null/undefined，String 更安全。

JSON.parse 遇到非法 JSON 会抛异常，外部数据需要 try/catch。JSON.stringify 会忽略对象中的 undefined、函数和 Symbol，不能直接处理循环引用，也不是可靠的任意对象深拷贝方案。

~~~javascript
const object = JSON.parse('{"name":"小明"}')
const json = JSON.stringify({ name: '小明' })

const date = new Date()
date.toISOString() // UTC，末尾是 Z
date.toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' })
~~~

toISOString() 返回 UTC，不是本地时间。接口通常使用带时区的 ISO 8601 字符串或时间戳传输，展示层再按用户时区格式化。

### 54. 页面加载失败或白屏怎样排查？

**规范回答（可直接复述）**

我会先确认问题范围和复现条件，再按“入口是否返回、静态资源是否成功、JavaScript 是否执行、接口是否正常、路由和渲染是否正确”的顺序排查：

1. 检查 HTML 响应状态、内容和部署版本，确认不是网关、缓存或错误页面。
2. 检查 JS/CSS chunk 是否 404、MIME 错误、被 CSP/CORS 阻止，重点核对 Vite base、CDN 路径和旧 HTML 引用新旧 chunk 混用。
3. 查看首个控制台异常及 source map，处理运行时错误、动态导入失败和未捕获 Promise。
4. 检查关键接口状态码、返回结构、超时、鉴权和跨域，确认 loading/错误分支不会永久挡住页面。
5. 检查 history 回退、重定向循环、权限守卫和懒加载组件。
6. DOM 已存在但不可见时，再检查 CSS、容器尺寸、遮罩层、主题颜色和 z-index。

生产环境还应配置前端错误监控、接口追踪、版本号和发布回滚机制。重点是找到第一个失败环节，不是一上来清缓存或注释全部代码。

### 55. 前端打包体积过大怎样优化？

**规范回答（可直接复述）**

先使用构建分析工具确认大文件来源，再按收益优化：路由和重组件动态导入；检查第三方库按需引入、重复打包和替代方案；确保依赖支持 ESM 和 Tree Shaking；图片使用合适格式、尺寸、压缩和懒加载；字体做子集化；编辑器、图表、地图、Three.js 模型在需要时再加载；服务端开启 Brotli/Gzip 和长期缓存。

原始 bundle 体积、压缩后传输体积和浏览器解析执行成本不是一回事。分包减少首屏下载和执行内容，但不会让总代码凭空消失；图片、模型、字体也可能是主要传输成本。

## 九、面试速记与回答策略

### 56. 一分钟对比 Vue 2 与 Vue 3 响应式

**可直接复述**

Vue 2 通过 Object.defineProperty 为已有属性建立 getter/setter。getter 配合 Dep 收集 Watcher，setter 通知 Watcher，再经过异步队列触发组件更新。它不能直接检测对象属性增删、数组下标赋值和 length 修改，因此需要 Vue.set、Vue.delete 或 splice。

Vue 3 使用 Proxy 拦截整个对象的读取、设置、新增、删除、遍历等操作，读取时通过 track 收集 ReactiveEffect，修改时通过 trigger 找到依赖，再交给 scheduler 调度。依赖通常按 WeakMap -> Map -> Set 组织。Vue 3 还支持 Map、Set，并通过访问时惰性代理实现深层响应式语义。不过 Proxy 不能完整兼容 IE，代理与原对象也存在身份差异。

### 57. 一分钟回答 provide/inject 与全局 store

**可直接复述**

provide/inject 是组件树范围内的依赖注入：祖先 provide，后代沿父链找到最近的同名值，适合主题、表单上下文、组件库服务等跨层但有明确作用域的数据。它不会把普通值自动变成响应式；提供可写响应式对象时，后代技术上也能修改，所以常用 readonly + action 保持修改权。

Pinia 或 Vuex 是应用级状态管理，适合跨页面、跨模块共享且需要派生状态、业务操作、调试和持久化的状态。Vue 3 新项目通常优先 Pinia，既有 Vuex 项目则结合迁移成本判断。

### 58. 一分钟回答 Vue 与 Three.js 集成

**可直接复述**

Three.js 场景的基础是 Scene、Camera 和 Renderer，可见模型由 BufferGeometry 与 Material 组成 Mesh。Vue 中在 onMounted 创建实例、挂载 canvas，通过 requestAnimationFrame 或按需渲染更新画面，用 ResizeObserver 同步容器尺寸。组件卸载前取消动画、移除监听、释放几何体、材质、纹理和 renderer，避免 GPU 内存泄漏。Three.js 实例没必要被 Vue 深度代理，可以用普通变量、markRaw 或 shallowRef。性能上重点关注 draw call、顶点和纹理、阴影与后处理、DPR、对象复用和资源按需加载。

### 最后检查：面试回答不要踩这些坑

- 不要说 Vue 3 初始化时递归代理整棵对象树，应说明深层响应式语义与访问时惰性代理。
- 不要说 Proxy 在所有场景一定更快，应说明能力和初始化方式的优势以及兼容边界。
- 不要说 inject 数据一定不能改，也不要说普通 provide 值一定自动响应。
- 不要说 Vuex 任何组件都能任意修改状态，应说清 mutation、action 和严格模式约定。
- 不要说 Promise.all 会自动启动任务或自动取消其他任务。
- 不要把公网静态网页作为 HTTP 的推荐场景，公网生产环境原则上都应使用 HTTPS。
- 不要说 KeepAlive 切换会重复 mounted；正常缓存切换看 activated/deactivated。
- 不要说 Three.js 核心入口直接内置所有模型加载器，常见加载器需从 addons/examples 单独引入。
- 不要说 toISOString() 是本地时间，它返回 UTC。
- 面试时先说定义和主流程，追问后再展开源码角色、边界和优化，不要一开始把所有关键词堆在一起。
