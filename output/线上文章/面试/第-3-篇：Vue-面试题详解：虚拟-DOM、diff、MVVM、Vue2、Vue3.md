---
title: "第 3 篇：Vue 面试题详解：虚拟 DOM、diff、MVVM、Vue2、Vue3"
slug: "vue-9af82b75"
summary: "Vue 面试系统复习指南，兼顾小白理解与规范复述，覆盖响应式、虚拟 DOM、diff、组件通信、生命周期、Composition API、Vue Router、Vuex、Pinia及性能优化。"
category: "面试"
categoryPath:
  - "面试"
tags:
  - "Vue"
  - "前端框架"
  - "虚拟DOM"
  - "MVVM"
status: "published"
sortOrder: 30
cover: ""
originalId: "6a2d291f8a2b1c68f2cac684"
originalSlug: "vue-9af82b75"
originalStatus: "published"
publishedAt: "2026-05-10T15:10:33.649Z"
updatedAt: "2026-07-31T11:16:22.624Z"
exportedAt: "2026-08-03T10:17:08.920Z"
---

# 第 3 篇：Vue 面试题详解：虚拟 DOM、diff、MVVM、Vue2、Vue3

这篇文章不是只给结论的题库，而是一份可以直接用来理解、复习和组织面试语言的 Vue 知识框架。

每个高频问题尽量按以下顺序回答：

- **小白理解**：先知道它解决什么问题。
- **规范回答（可直接复述）**：面试时先用 30～60 秒说清结论。
- **原理与追问**：面试官继续追问时再展开。
- **易错点**：避免把不严谨的口诀当成原理。

> 版本说明：本文以 Vue 3、Vue Router 4 和 Pinia 为当前主线，同时保留 Vue 2、Vue Router 3 和 Vuex 的高频对比。Vue 2 已停止官方维护，面试时应主动说明版本边界。

### 建议怎样读和背

不要一上来就逐字背“规范回答”。更稳妥的顺序是：

1. 先读“小白理解”，确认自己知道这个功能解决了什么问题。
2. 再看代码或执行过程，能用自己的话解释每一步。
3. 最后记“规范回答”的关键词，面试时按“定义 -> 原理 -> 场景 -> 边界”组织语言。
4. 面试官没有追问时，不必一次把全部细节说完；被追问后再进入原理和版本差异。

例如回答 `computed` 和 `watch`，第一句话先说“computed 负责派生值，watch 负责副作用”，第二步再说缓存、异步和新旧值。这样比一口气背十条区别更像真正理解。

## 一、Vue 基础与设计思想

### 1. Vue 是什么？与传统 DOM 开发有什么区别？

**小白理解**

传统 jQuery 开发经常是“找到某个 DOM，再手动修改它”。Vue 更强调“数据现在是什么，页面就应该显示什么”。开发者主要维护数据和组件关系，Vue 负责把变化同步到页面。

**规范回答（可直接复述）**

Vue 是一个用于构建用户界面的渐进式 JavaScript 框架。它以声明式渲染、响应式系统和组件化为核心。与直接操作 DOM 的传统开发方式相比，Vue 让开发者以数据状态描述界面，通过框架完成依赖追踪和视图更新，从而降低复杂页面中手动维护 DOM 与状态一致性的成本。

“渐进式”表示 Vue 可以按需接入：既可以只在现有页面中增强一小块交互，也可以配合 Vue Router、Pinia 和构建工具开发完整单页应用。

**原理与追问**

- 声明式渲染：描述“结果应该是什么”，而不是逐步命令浏览器怎样改 DOM。
- 响应式：读取数据时收集依赖，数据变化时通知相关副作用重新执行。
- 组件化：把页面拆成职责清晰、可复用、可组合的 UI 单元。
- Vue 并不是“不操作 DOM”，而是把大部分 DOM 更新交给框架统一调度。

### 2. 为什么选择 Vue？

**规范回答（可直接复述）**

我选择 Vue 通常基于四点：第一，模板语法接近 HTML，学习和协作成本较低；第二，响应式与组件化能力完整，适合构建中大型前端应用；第三，Vue 3 的 Composition API 便于按业务能力组织和复用逻辑；第四，Vue Router、Pinia、Vite 和开发工具形成了比较成熟的官方生态。

具体项目仍要结合团队经验、生态依赖、服务端渲染需求和长期维护成本选型，而不是只比较框架体积。

**易错点**

不要背“Vue 一定比 React 小或快”。框架版本、构建方式、业务代码和第三方依赖都会影响最终体积与性能。

### 3. 如何理解 MVVM？Vue 是严格的 MVVM 吗？

**小白理解**

- Model：业务数据。
- View：用户看到的界面。
- ViewModel：连接数据与界面的中间层。

数据变化后界面自动更新，用户输入也可以通过事件或 `v-model` 更新数据。

**规范回答（可直接复述）**

MVVM 将应用分为 Model、View 和 ViewModel。ViewModel 暴露状态和行为，并负责协调视图与数据。Vue 的响应式系统和模板机制体现了 MVVM 思想：数据变化驱动视图更新，视图事件再修改状态。

不过 Vue 官方更常把自己描述为用于构建用户界面的框架，不必把每个 Vue API 强行一一对应到经典 MVVM。面试中说“Vue 借鉴并体现了 MVVM 思想”比“Vue 就是严格 MVVM”更准确。

### 4. MVVM 与 MVC 有什么区别？

**规范回答（可直接复述）**

MVC 由 Model、View、Controller 组成，Controller 通常接收用户输入并协调 Model 与 View。MVVM 用 ViewModel 承载视图状态和行为，通过数据绑定降低 View 与业务状态之间的手动同步成本。

两者都是职责分离思想，真实项目中的边界会受框架和架构影响，不能只用“有没有双向绑定”判断 MVC 或 MVVM。

### 5. 一个 `.vue` 单文件组件由什么组成？

**规范回答（可直接复述）**

Vue 单文件组件通常由三部分组成：

- `<template>` 描述组件的视图结构。
- `<script>` 或 `<script setup>` 声明状态、行为和组件逻辑。
- `<style>` 声明样式，可通过 `scoped` 限制样式作用范围。

单文件组件不是浏览器直接执行的格式，需要由 Vite 等构建工具和 Vue 编译器转换。一个文件也可以包含额外的自定义块，但日常开发以这三部分为主。

### 6. Vue 的两个核心是什么？

常见回答是“响应式数据驱动”和“组件化”。更完整地说，Vue 通过编译器把模板转换为渲染函数，通过响应式系统跟踪变化，再由渲染器更新组件和宿主平台视图。

## 二、虚拟 DOM、渲染与 diff

### 7. 什么是虚拟 DOM？

**小白理解**

虚拟 DOM 可以理解为一份用 JavaScript 对象描述的“界面结构清单”。数据变化后，Vue 先生成新的描述，再判断哪些地方需要更新，最后操作真实 DOM。

**规范回答（可直接复述）**

虚拟 DOM 是用 JavaScript 对象描述 UI 节点及其关系的一种编程表示。Vue 的渲染函数会产生 VNode，数据变化后生成新的 VNode 树，渲染器通过 patch 和 diff 复用可复用节点，并把必要变更应用到真实 DOM。

它的价值不只是性能，还包括声明式编程、组件抽象、跨平台渲染和统一更新流程。虚拟 DOM 并不保证在所有场景都比精确的手写 DOM 操作更快。

**易错点**

- 虚拟 DOM 不是完整复制真实 DOM 的“轻量级副本”。
- diff 的目标是以可接受的复杂度找到足够高效的更新方案，不是求任意两棵树的理论最小编辑距离。
- Vue 最终仍然需要操作真实 DOM。

### 8. Vue 的 diff 算法大致怎样工作？

**规范回答（可直接复述）**

Vue 更新时先判断新旧 VNode 是否可以视为同一节点，通常需要节点类型和 `key` 相同。若不是同一节点，就卸载旧节点并挂载新节点；若是同一节点，就复用对应 DOM，继续比较属性、文本和子节点。

对子节点列表，Vue2 主要使用双端比较；Vue3 对无 `key` 和有 `key` 的列表采用不同策略。有 `key` 的列表会先处理公共前后缀，再建立 key 到新索引的映射，并借助最长递增子序列减少不必要的 DOM 移动。

**原理与追问**

Vue3 有 key 子节点的大致过程：

1. 从头同步相同节点。
2. 从尾同步相同节点。
3. 处理一方已经遍历完的新增或删除。
4. 为剩余新节点建立 `key -> index` 映射。
5. 遍历旧节点，确定删除、复用和新旧索引关系。
6. 对需要移动的节点计算最长递增子序列。
7. 从后向前挂载新节点或移动已有 DOM。

最长递增子序列代表相对顺序已经稳定的一组节点，它们可以留在原位，因此能减少移动次数。

**用一个列表变化理解**

旧列表是：

```text
A B C D
```

新列表是：

```text
A C B E
```

如果每项都有稳定 key，Vue 可以判断：A 仍在原位，B 和 C 仍是原来的节点但顺序变化，D 被删除，E 是新节点。于是它会尽量复用 A、B、C 对应的 DOM，只删除 D、创建 E，并移动确实需要移动的节点。

如果使用数组下标作为 key，旧列表和新列表的第 2 项都叫 key `1`，Vue 更容易把“位置”当成“身份”，于是原来 B 对应的组件状态可能被复用给 C。这就是 key 不只影响性能，还影响状态正确性的原因。

**面试官可能追问：diff 为什么不跨层级比较？**

通用树差异比较的成本很高。前端界面更新通常具有较稳定的层级结构，因此 Vue 采用同层比较等启发式策略，在可接受的复杂度内获得足够好的更新结果。开发者通过稳定 key 帮助框架表达节点身份。

### 9. `key` 有什么作用？为什么不建议用数组下标？

**小白理解**

`key` 像每条数据的身份证。列表顺序变化时，Vue 能知道“这是原来那一项移动了”，而不是只看它现在排在第几个位置。

**规范回答（可直接复述）**

`key` 用来标识同一层级 VNode 的稳定身份，帮助 diff 正确复用、移动或卸载节点。使用数组下标作为 `key` 时，插入、删除或排序会改变下标，节点身份就可能与业务数据错位，导致输入框状态、组件内部状态或动画复用异常。

如果列表只做静态展示、永不重排，使用下标通常不会产生可见错误；但存在稳定业务 ID 时，应优先使用业务 ID。

**易错点**

`key` 不是“越加越快”。不稳定的随机 `key` 会让节点每次都被重新创建；相同 `key` 也不代表一定复用，还要看节点类型是否一致。

### 10. Vue3 相比 Vue2 做了哪些编译和渲染优化？

**规范回答（可直接复述）**

Vue3 把更多工作前移到编译阶段。编译器会标记动态节点及其变化类型，生成 Patch Flag；还会提升静态节点、缓存事件处理函数，并用 Block Tree 收集动态子节点。更新时渲染器可以跳过大量静态内容，只处理真正可能变化的部分。

Vue3 还重写了虚拟 DOM 与 diff 实现，对有 key 列表使用最长递增子序列减少移动，并更好地支持 Tree Shaking。

### 11. 为什么 Vue 的 DOM 更新是异步批处理？

**规范回答（可直接复述）**

响应式数据发生变化后，Vue 通常不会立刻同步更新 DOM，而是把组件更新任务放入调度队列。同一轮同步代码中多次修改状态时，相同任务会被去重，并在微任务阶段统一执行。这样可以减少重复渲染和重复 DOM 操作，同时保证父子组件更新顺序更可控。

这里的“异步”主要指视图更新的调度，不代表响应式变量赋值本身是异步的。赋值后立即读取变量能得到新值，但此时 DOM 可能还没更新。

### 12. `nextTick` 有什么作用？

**规范回答（可直接复述）**

`nextTick` 用于等待 Vue 当前批次的 DOM 更新完成。修改响应式数据后，如果后续逻辑依赖更新后的 DOM，例如读取元素高度、聚焦新出现的输入框，就可以 `await nextTick()` 再操作。

```javascript
import { nextTick, ref } from 'vue'

const visible = ref(false)
const inputRef = ref()

async function openAndFocus() {
  visible.value = true
  await nextTick()
  inputRef.value?.focus()
}
```

**易错点**

`nextTick` 不能让一个尚未挂载的组件提前挂载。在首次挂载前需要访问模板 DOM，应使用 `mounted` 或 `onMounted`。也不要用 `nextTick` 掩盖不合理的数据流。

## 三、响应式原理

### 13. Vue2 的响应式原理是什么？

**规范回答（可直接复述）**

Vue2 初始化数据时使用 `Object.defineProperty` 为已有对象属性定义 getter 和 setter。getter 读取时完成依赖收集，setter 修改时通知相关 watcher 更新。数组则通过改写七个变更方法来触发通知。

因为 `Object.defineProperty` 只能劫持已经存在的属性，Vue2 无法自动侦测对象属性的新增和删除；通过数组下标赋值或直接修改 `length` 也不能可靠触发更新。因此需要 `Vue.set/vm.$set`、`Vue.delete/vm.$delete` 或数组变更方法。

**原理关键词**

- Observer：遍历并转换数据。
- Dep：维护依赖订阅关系。
- Watcher：代表组件渲染、计算属性或用户侦听等订阅者。

### 14. Vue3 的响应式原理是什么？

**规范回答（可直接复述）**

Vue3 主要使用 Proxy 代理对象，并通过 Reflect 完成默认操作。读取属性时在 `track` 中把当前活动副作用与目标对象、属性建立依赖关系；写入、新增或删除属性时通过 `trigger` 找到相关副作用，由调度器决定立即执行还是进入更新队列。

Vue3 对基本类型不能直接使用 Proxy，所以 `ref` 会通过带 `.value` 访问器的对象完成依赖追踪；如果 `ref` 保存的是对象，内部通常会把对象转换为响应式代理。

```javascript
const targetMap = new WeakMap()

function reactive(target) {
  return new Proxy(target, {
    get(object, key, receiver) {
      track(object, key)
      return Reflect.get(object, key, receiver)
    },
    set(object, key, value, receiver) {
      const result = Reflect.set(object, key, value, receiver)
      trigger(object, key)
      return result
    }
  })
}
```

这只是帮助理解的简化代码。真实实现还要处理嵌套对象、数组、集合类型、缓存代理、只读代理、调度和依赖清理等问题。

**一步一步理解依赖收集**

假设模板中有 `{{ price * count }}`：

1. 组件第一次渲染时，会执行组件的渲染副作用。
2. 渲染过程中读取 `price` 和 `count`，Proxy 的 `get` 被触发。
3. `track` 记录“当前组件渲染依赖 price 和 count”。
4. 后续修改 `count`，Proxy 的 `set` 被触发。
5. `trigger` 找到依赖 `count` 的副作用，把组件更新任务交给调度器。
6. 调度器批量执行更新，重新运行渲染函数，产生新 VNode 并更新必要 DOM。

所以响应式不是“Vue 不停轮询所有变量”，而是在读取时建立依赖、写入时按依赖通知。

**为什么依赖关系常用 WeakMap？**

可以把核心结构理解成：

```text
WeakMap<目标对象, Map<属性名, Set<副作用>>>
```

外层使用 WeakMap，不会因为响应式系统保存了映射就强行阻止目标对象被垃圾回收。一个属性对应一组副作用，从而能只通知真正依赖该属性的逻辑。

### 15. Vue3 为什么用 Proxy 替代 `Object.defineProperty`？

**规范回答（可直接复述）**

Proxy 可以在对象层面拦截读取、写入、新增、删除、`in` 操作和键遍历等行为，不需要初始化时递归改写每个已有属性，因此能自然处理属性新增、删除、数组下标和 Map、Set 等集合类型。代价是 Proxy 无法直接代理基本类型，并且不能兼容不支持 Proxy 的旧浏览器。

“Proxy 一定更快”不是严谨结论，实际性能取决于数据规模、访问模式和运行环境。它更重要的优势是拦截能力完整、实现边界更清晰。

### 16. `ref` 和 `reactive` 怎么选？

**小白理解**

- `ref` 像一个带 `.value` 的响应式盒子，可以装基本值，也可以装对象。
- `reactive` 直接返回对象的响应式代理，只能处理对象类型。

**规范回答（可直接复述）**

`ref` 可以包装任意值，支持整体替换，作为组合式函数返回值时也便于安全解构；`reactive` 适合组织一组关联的对象状态，访问属性时不需要 `.value`。模板会自动解包合适位置的 ref，而 JavaScript 中通常需要 `.value`。

我不会机械地按“基本类型用 ref、对象用 reactive”划分，因为 `ref` 同样可以保存对象。实际项目中可以为了风格一致主要使用 `ref`，也可以对表单等聚合状态使用 `reactive`。

**易错点**

```javascript
let state = reactive({ count: 0 })

// 直接替换变量会让现有消费者仍然持有旧代理
state = reactive({ count: 1 })

// 直接解构普通属性会丢失与源对象的响应式连接
const { count } = state
```

### 17. `toRef`、`toRefs` 和直接解构有什么区别？

**规范回答（可直接复述）**

直接解构 `reactive` 对象的普通属性，只会得到当前值，后续与源对象不再保持响应式连接。`toRef(source, key)` 可以为某个属性创建双向关联的 ref，`toRefs(source)` 则把对象当前可枚举属性分别转换成关联 ref，适合组合式函数需要返回可解构状态的场景。

```javascript
const state = reactive({ count: 0, name: 'Vue' })
const { count, name } = toRefs(state)

count.value++
console.log(state.count) // 1
```

不要为了“消除 `.value`”滥用 `toRefs`。如果本来就使用多个独立 `ref`，直接返回这些 ref 即可。

### 18. `computed`、`watch`、`watchEffect` 有什么区别？

**规范回答（可直接复述）**

- `computed` 用于从响应式状态派生一个值，默认惰性求值，并根据依赖缓存结果。getter 应尽量保持纯函数。
- `watch` 显式指定监听源，可以获得新旧值，支持 `immediate`、`deep`、`flush` 和清理副作用，适合精准控制异步请求或命令式操作。
- `watchEffect` 会立即执行，并自动收集同步执行阶段读取的响应式依赖，适合依赖较多、无需旧值的副作用。

```javascript
const fullName = computed(() => `${firstName.value} ${lastName.value}`)

watch(keyword, async (value, oldValue, onCleanup) => {
  const controller = new AbortController()
  onCleanup(() => controller.abort())
  await search(value, { signal: controller.signal })
})

watchEffect(() => {
  document.title = `${user.value.name} - ${unread.value}`
})
```

**易错点**

- `computed` 不是页面加载时主动“开始监听”，而是在被读取时求值和收集依赖。
- `watch` 可以监听一个或多个源，不是只能监听单一数据。
- `watchEffect` 在异步回调中，通常只会追踪第一个 `await` 之前同步读取的依赖。

**小白判断口诀**

- 页面要“算出一个值”：先想 `computed`。
- 某个值变化后要“做一件事”：先想 `watch`。
- 副作用依赖很多状态，不想逐个列出：评估 `watchEffect`。

例如商品总价是 `price * count`，它是一个派生值，适合 computed；关键词变化后请求接口，这是异步副作用，适合 watch；根据用户、未读数和当前语言共同更新网页标题，可以使用 watchEffect。

**为什么 computed 有缓存？**

computed 内部会记录依赖和“是否脏”的状态。第一次读取时执行 getter；依赖没变化时再次读取直接返回缓存；依赖变化后先把 computed 标记为需要重新计算，下一次读取时才重新执行 getter。这就是“惰性 + 缓存”。

**watch 的常见配置**

- `immediate: true`：创建侦听器后立即执行一次回调。
- `deep: true`：深入监听嵌套变化，数据大时要谨慎。
- `flush: 'post'`：希望回调执行时组件 DOM 已经更新。
- `once: true`：支持该选项的 Vue 版本中，只在源变化时执行一次。
- 清理回调：取消上一次请求、计时器或订阅，避免竞态和泄漏。

### 19. 深度监听为什么要谨慎？

`deep: true` 会遍历嵌套结构以收集依赖，大型对象上成本较高；而且嵌套修改时回调中的 `newValue` 与 `oldValue` 可能引用同一个对象，不能把它们当成自动生成的深拷贝快照。

优先监听真正关心的属性或 getter：

```javascript
watch(
  () => form.address.city,
  city => loadDistricts(city)
)
```

### 20. `readonly`、`shallowRef`、`shallowReactive` 有什么用途？

- `readonly`：返回只读代理，适合向下游暴露“可读但不应直接修改”的状态。
- `shallowRef`：只追踪 `.value` 的整体替换，不深度转换内部对象，适合大型不可变对象或第三方实例。
- `shallowReactive`：只让第一层属性响应式，嵌套对象保持原样。
- `markRaw`：明确让对象跳过响应式转换，常用于复杂第三方实例。

这些 API 是有明确性能或集成需求时的工具，不应默认替代普通 `ref/reactive`。

### 21. 组件中的 `data` 为什么是函数？

**规范回答（可直接复述）**

组件可以被创建多次。`data` 使用函数后，每次创建组件实例都会调用它并返回一个新的对象，从而保证各实例拥有独立状态。如果所有组件实例共享同一个对象，一个实例修改数据会影响其他实例。

这个问题主要针对组件。Vue2 根实例的 `data` 可以是对象；Vue3 的 Options API 统一要求组件 `data` 使用函数。

### 22. Vue2 中数组或对象变化后视图为什么可能不更新？

Vue2 无法侦测以下典型操作：

```javascript
vm.user.age = 18
vm.items[0] = newItem
vm.items.length = 0
```

应使用：

```javascript
Vue.set(vm.user, 'age', 18)
vm.$set(vm.items, 0, newItem)
vm.items.splice(0)
```

Vue3 的 Proxy 能处理属性新增、删除和数组下标写入，因此不再提供 `Vue.set/$set`。但视图不更新也可能是因为变量本身不是响应式的、解构丢失响应性或更新了错误的数据引用，不能看到问题就一律使用 `nextTick`。

## 四、模板、指令与组件

### 23. 常用 Vue 指令有哪些？

- `v-bind`：绑定属性或组件 prop，简写为 `:`。
- `v-on`：监听事件，简写为 `@`。
- `v-model`：为表单或组件建立值与更新事件的约定。
- `v-if/v-else-if/v-else`：条件成立时创建，不成立时卸载。
- `v-show`：通过 CSS `display` 切换显示状态。
- `v-for`：基于列表渲染内容。
- `v-text`：设置文本内容。
- `v-html`：设置原始 HTML，必须防范 XSS。
- `v-once`：只渲染一次，后续跳过更新。
- `v-memo`：依赖数组不变时跳过对应子树更新。
- `v-cloak`：可配合 CSS 隐藏尚未编译的模板闪烁，构建型项目很少需要。

### 24. `v-if` 和 `v-show` 有什么区别？

**规范回答（可直接复述）**

`v-if` 是真正的条件渲染。条件为假时，对应元素或组件不会存在，切换时涉及挂载和卸载，初始成本可能较低、切换成本较高。`v-show` 无论条件真假都会完成初始渲染，只通过 `display: none` 控制显示，初始成本较高、切换成本较低。

因此频繁切换且内容适合保留时使用 `v-show`；很少切换、初始可能不展示，或隐藏时应销毁组件和副作用时使用 `v-if`。

### 25. 为什么不建议在同一个元素上同时使用 `v-if` 和 `v-for`？

同一元素上两者的优先级存在版本差异：Vue2 中 `v-for` 优先，Vue3 中 `v-if` 优先。这既可能造成无效遍历，也可能让 `v-if` 访问不到 `v-for` 的作用域变量。

更清晰的做法是先用计算属性过滤列表，或者把其中一个指令放到 `<template>` 上：

```html
<template v-for="user in activeUsers" :key="user.id">
  <UserRow :user="user" />
</template>
```

### 26. `v-html` 有什么风险？

`v-html` 会把字符串作为 HTML 写入元素，不会经过 Vue 模板编译。如果内容来自用户或不可信来源，攻击者可能注入脚本、事件属性或危险链接，造成 XSS。

原则是尽量渲染结构化数据；确实要展示富文本时，应在可信边界使用成熟的 HTML 清洗方案，并配置服务端校验和 CSP。不要使用正则表达式自行“过滤 HTML”。

### 27. `v-model` 的实现原理是什么？

**规范回答（可直接复述）**

`v-model` 是“值绑定 + 更新事件”的语法约定，不等同于响应式原理。

在 Vue2 自定义组件中，默认等价于 `value` prop 和 `input` 事件；可以通过组件的 `model` 选项修改。在 Vue3 中，默认等价于 `modelValue` prop 和 `update:modelValue` 事件，并支持多个 `v-model` 参数。

```html
<!-- Vue3 -->
<UserName
  :model-value="name"
  @update:model-value="name = $event"
/>

<!-- 等价简写 -->
<UserName v-model="name" />
```

原生表单上的具体属性和事件会因控件类型而异，例如文本框主要对应 `value/input`，复选框涉及 `checked/change`。

### 28. Vue 组件有哪些常用通信方式？

**规范回答（可直接复述）**

我会根据组件关系和状态所有权选择通信方式：

- 父传子：props。
- 子传父：自定义事件 `emit`。
- 双向输入组件：`v-model`。
- 父组件有限调用子组件公开能力：模板 ref，Vue3 子组件配合 `defineExpose`。
- 多级祖先与后代：`provide/inject`。
- 任意组件共享业务状态：Pinia；旧项目可能使用 Vuex。
- 跨组件的临时事件通知：可使用 `mitt` 等事件发布订阅库，但要管理订阅和清理。
- 跨多层透传非 prop 属性：`$attrs` 和 `v-bind="$attrs"`。

首选清晰的单向数据流。`$parent`、Vue2 的 `$children` 或到处使用全局事件总线会形成隐式耦合，不应作为默认方案。

**版本差异**

- Vue3 移除了实例的 `$on/$off/$once`，不能再把 Vue 实例直接当 EventBus。
- Vue3 移除了 `$children`。
- Vue3 将 Vue2 的 `$listeners` 合并进 `$attrs`。

**先按关系选择，不要死背 API**

| 组件关系 | 首选方案 | 常见场景 |
| --- | --- | --- |
| 父 -> 子 | props | 父组件把用户信息、配置传给子组件 |
| 子 -> 父 | emit | 子组件通知保存、关闭、选择结果 |
| 父子双向输入 | `v-model` | 输入框、开关、受控弹窗 |
| 祖先 -> 深层后代 | provide/inject | 主题、表单上下文、组件库配置 |
| 多页面共享 | Pinia/Vuex | 用户、权限、购物车、跨页草稿 |
| 父调用子命令 | 模板 ref + `defineExpose` | 聚焦、校验、重置，不用于普通传值 |
| 临时跨组件事件 | mitt 等事件总线 | 低频通知，需要取消订阅 |

**父传子、子传父完整例子**

```vue
<!-- Parent.vue -->
<script setup>
import { ref } from 'vue'
import UserEditor from './UserEditor.vue'

const userName = ref('小明')

function handleSave(nextName) {
  userName.value = nextName
}
</script>

<template>
  <UserEditor :name="userName" @save="handleSave" />
</template>
```

```vue
<!-- UserEditor.vue -->
<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  name: {
    type: String,
    required: true
  }
})
const emit = defineEmits(['save'])
const draft = ref(props.name)

watch(() => props.name, value => {
  draft.value = value
})
</script>

<template>
  <input v-model="draft">
  <button @click="emit('save', draft)">保存</button>
</template>
```

这个过程的数据方向很清楚：父组件拥有正式的 `userName`；子组件通过 prop 获得初始内容；子组件只修改自己的草稿；点击保存后 emit 事件，让父组件决定是否接受新值。

**为什么不推荐 `$parent/$children`？**

它们依赖当前组件树结构。中间增加一层组件、把内容移入插槽或重构布局后，引用对象可能改变；调用方也很难从组件接口上看出依赖。props、emit、provide 和 store 的契约更明确，也更容易测试。

### 29. 为什么 props 不能直接修改？

**规范回答（可直接复述）**

props 遵循单向数据流：父组件拥有数据，子组件只接收。子组件直接修改 prop 会导致数据所有权不清晰，而且父组件重新渲染时可能覆盖子组件的修改。

如果子组件要修改结果，应通过事件通知父组件；如果只是需要基于 prop 编辑本地草稿，可以复制为本地状态，并明确处理 prop 后续变化；如果是派生值，应使用 computed。

### 30. `provide/inject` 是否自动响应式？

`provide/inject` 解决跨层级依赖传递，本身不会把普通值自动变成响应式。需要响应式时，应提供 `ref`、`reactive` 或计算属性。为了维护单向数据流，推荐同时提供只读状态和修改方法。

```javascript
const theme = ref('light')

provide('theme', {
  value: readonly(theme),
  setTheme: value => {
    theme.value = value
  }
})
```

大型项目可用 `Symbol` 作为注入 key，避免命名冲突并改善 TypeScript 类型约束。

**完整使用过程**

祖先组件负责创建状态并提供：

```javascript
// injectionKeys.js
export const themeKey = Symbol('theme')
```

```vue
<script setup>
import { provide, readonly, ref } from 'vue'
import { themeKey } from './injectionKeys'

const theme = ref('light')
const setTheme = value => {
  theme.value = value
}

provide(themeKey, {
  theme: readonly(theme),
  setTheme
})
</script>
```

任意深层后代接收：

```javascript
const themeContext = inject(themeKey)

if (!themeContext) {
  throw new Error('当前组件必须在主题提供者内部使用')
}
```

这样修改入口仍在提供者中，比让所有后代直接修改共享对象更容易维护。需要默认值时可以给 `inject` 第二个参数，但重要依赖缺失时主动报错往往更容易发现组件使用错误。

### 31. 插槽、具名插槽和作用域插槽是什么？

**规范回答（可直接复述）**

插槽让父组件决定一部分内容如何渲染，子组件负责提供布局位置。具名插槽用于一个组件存在多个内容入口；作用域插槽允许子组件把内部数据作为插槽 props 暴露给父组件，由父组件决定展示形式。

```html
<!-- 子组件 -->
<slot name="row" :item="item" />

<!-- 父组件 -->
<DataList v-slot:row="{ item }">
  <strong>{{ item.name }}</strong>
</DataList>
```

作用域插槽的数据方向仍然是子组件提供数据、父组件提供渲染内容，不是子组件直接修改父组件状态。

**小白理解三种插槽**

可以把子组件想成一个做好的页面框架：

- 默认插槽：只留一个没有名字的内容区域。
- 具名插槽：分别留出“标题”“正文”“底部操作”区域。
- 作用域插槽：子组件不仅留位置，还把内部数据交给父组件使用。

```vue
<!-- BaseDialog.vue -->
<template>
  <section class="dialog">
    <header><slot name="title">默认标题</slot></header>
    <main><slot /></main>
    <footer><slot name="footer" :close="close" /></footer>
  </section>
</template>
```

```vue
<!-- 使用组件 -->
<BaseDialog>
  <template #title>编辑用户</template>

  <UserForm />

  <template #footer="{ close }">
    <button @click="close">取消</button>
    <button @click="save">保存</button>
  </template>
</BaseDialog>
```

这里 `close` 来自子组件，按钮长什么样、放什么文字由父组件决定。这就是作用域插槽最常见的价值：子组件管理数据和行为，父组件定制展示。

### 32. 模板 ref 有什么作用？Vue3 为什么需要 `defineExpose`？

模板 ref 可以获取 DOM 元素或子组件公开实例。Vue3 使用 `<script setup>` 的组件默认是封闭的，父组件通过模板 ref 不会自动获得子组件内部所有变量；子组件需要使用 `defineExpose` 明确公开必要能力。

```vue
<script setup>
import { ref } from 'vue'

const input = ref()
const focus = () => input.value?.focus()

defineExpose({ focus })
</script>

<template>
  <input ref="input">
</template>
```

模板 ref 会增加父子耦合，应只公开聚焦、校验、重置等确实具有命令式语义的能力，普通数据通信仍优先 props 和 emit。

**Vue2 和 Vue3 获取 DOM 的常见写法**

Vue2 Options API：

```vue
<template>
  <input ref="nameInput">
</template>

<script>
export default {
  mounted() {
    this.$refs.nameInput.focus()
  }
}
</script>
```

Vue3 `<script setup>`：

```vue
<script setup>
import { onMounted, ref } from 'vue'

const nameInput = ref()

onMounted(() => {
  nameInput.value?.focus()
})
</script>

<template>
  <input ref="nameInput">
</template>
```

Vue2 中还能看到 `this.$el` 访问组件根 DOM，但它会让代码依赖组件根结构；Vue3 组件可以有多个根节点，`$el` 的语义更不适合当成稳定组件接口。Vue2 的 `.native` 事件修饰符也已在 Vue3 移除，获取事件目标直接使用事件参数；监听子组件原生事件则依赖子组件的 emits 和属性透传规则。

模板 ref 只有在挂载后才有值，受 `v-if` 控制的元素隐藏后 ref 也可能变回空值，因此访问时要处理生命周期和空值。

### 33. `scoped` 样式的原理是什么？

**规范回答（可直接复述）**

单文件组件的 `<style scoped>` 会在编译阶段为当前组件模板元素添加特定作用域属性，并把 CSS 选择器改写为带该属性的选择器，使样式主要作用于当前组件。

它不是 Shadow DOM，也不是绝对隔离。父组件的 scoped 样式可以影响子组件根节点，继承属性仍会向后代传递，动态插入的 HTML 也需要单独考虑。

### 34. Vue 中怎样做样式穿透？

现代 Vue3 应使用 `:deep()`：

```css
.dialog :deep(.ant-modal-body) {
  padding: 16px;
}
```

Vue2 历史项目可能见到 `>>>`、`/deep/` 或旧式 `::v-deep`，具体支持情况取决于 Vue Loader 和 CSS 预处理器版本，不能说所有语法在 Vue2、Vue3 中都兼容。

样式穿透会依赖子组件内部 DOM 和类名，组件升级时容易失效。能通过组件公开的 token、主题变量、class 或插槽实现时，应优先使用公开扩展点。

### 35. 动态组件是什么？

动态组件通过 `<component :is="currentComponent">` 在不同组件类型之间切换。默认切换时旧组件会卸载；如果希望保留实例状态，可以在适合的场景使用 `<KeepAlive>`。

```html
<KeepAlive>
  <component :is="activeTab" />
</KeepAlive>
```

### 36. `<KeepAlive>` 的作用和生命周期是什么？

**规范回答（可直接复述）**

`<KeepAlive>` 用于缓存切换后暂时不活动的组件实例，保留其本地状态和已创建 DOM，避免每次切换都重新创建。被缓存组件离开时不是正常卸载，而是进入停用状态；再次显示时被激活。

Vue2 对应 `activated/deactivated`，Vue3 Composition API 对应 `onActivated/onDeactivated`。可以通过 `include`、`exclude` 和 `max` 控制缓存范围。

**易错点**

- `<KeepAlive>` 不是把所有路由自动缓存，必须包裹动态组件或路由视图渲染出的组件。
- 缓存越多占用内存越多，不应无差别缓存所有页面。
- 停用时某些定时器、监听和实时连接可能仍存在，需要在停用钩子中处理。

**路由页面缓存示例**

```vue
<RouterView v-slot="{ Component, route }">
  <KeepAlive :include="['ArticleListPage']" :max="10">
    <component :is="Component" :key="route.name" />
  </KeepAlive>
</RouterView>
```

要让 `include` 正确匹配，组件需要有稳定名称。真实项目还要明确：详情页是否应该按不同参数缓存多份、筛选条件由 URL 还是组件状态保存、退出登录时是否清理缓存。`KeepAlive` 只能保留组件实例，不能代替业务缓存设计。

### 37. `Teleport` 和 `Suspense` 分别解决什么问题？

- `Teleport`：逻辑上仍属于当前组件，但把 DOM 渲染到指定容器，适合弹窗、通知、浮层，避免祖先的 `overflow`、层叠上下文等影响。
- `Suspense`：协调异步依赖的加载状态，可以在异步组件或带异步 `setup` 的组件未完成时显示 fallback。使用时要关注当前 Vue 版本中的稳定性说明及 SSR 行为。

## 五、生命周期与更新顺序

### 38. Vue2 与 Vue3 的生命周期怎样对应？

| 阶段 | Vue2 Options API | Vue3 Options API | Vue3 Composition API |
| --- | --- | --- | --- |
| 创建前 | `beforeCreate` | `beforeCreate` | `setup` 中完成初始化 |
| 创建后 | `created` | `created` | `setup` 中完成初始化 |
| 挂载前 | `beforeMount` | `beforeMount` | `onBeforeMount` |
| 挂载后 | `mounted` | `mounted` | `onMounted` |
| 更新前 | `beforeUpdate` | `beforeUpdate` | `onBeforeUpdate` |
| 更新后 | `updated` | `updated` | `onUpdated` |
| 卸载前 | `beforeDestroy` | `beforeUnmount` | `onBeforeUnmount` |
| 卸载后 | `destroyed` | `unmounted` | `onUnmounted` |
| 缓存激活 | `activated` | `activated` | `onActivated` |
| 缓存停用 | `deactivated` | `deactivated` | `onDeactivated` |

`setup` 不是两个生命周期钩子的简单别名，但它承担了 Composition API 中创建阶段的大部分初始化工作，并且执行时早于 Options API 的 `beforeCreate`。

### 39. 每个生命周期通常做什么？

- `setup/created`：初始化不依赖 DOM 的状态、侦听和请求逻辑。
- `onMounted/mounted`：访问模板 ref，初始化依赖真实 DOM 或浏览器环境的第三方库。
- `onBeforeUpdate`：DOM 更新前读取少量旧状态，避免在这里继续无条件修改响应式数据。
- `onUpdated`：读取更新后的 DOM；不要在这里无条件修改状态，否则可能循环更新。
- `onBeforeUnmount/beforeDestroy`：停止定时器、取消订阅、移除手动事件监听、终止请求或销毁第三方实例。
- `onUnmounted/unmounted`：确认组件及其响应式副作用已经停止后的收尾逻辑。

**用“组件出生到离开”理解**

1. **创建阶段**：Vue 准备组件实例和响应式状态。此时适合声明数据、computed、watch 和业务方法，但真实 DOM 还不存在。
2. **挂载阶段**：Vue 执行渲染函数，创建 DOM 并插入页面。`mounted/onMounted` 执行时，当前组件自身的 DOM 已经可用。
3. **更新阶段**：响应式依赖变化，更新任务进入队列。Vue 先执行更新前钩子，再 patch DOM，最后执行更新后钩子。
4. **卸载阶段**：组件离开页面，Vue 停止与组件绑定的响应式副作用并移除 DOM；开发者同时清理外部资源。

**常见场景对照**

| 需求 | 推荐位置 | 原因 |
| --- | --- | --- |
| 声明响应式状态 | `setup/data` | 创建阶段就需要准备 |
| 请求不依赖 DOM 的数据 | `setup/created` 或数据层 | 可以更早启动，便于复用 |
| 获取输入框、读取尺寸 | `onMounted/mounted` | 模板 DOM 已存在 |
| 数据变化后读取新高度 | 修改数据后 `await nextTick()` | 等待当前批次 DOM 更新 |
| 销毁图表实例 | `onBeforeUnmount` | DOM 和实例仍可访问，适合主动清理 |
| 缓存页面暂停轮询 | `onDeactivated` | KeepAlive 停用不会正常卸载 |

**易错点：mounted 是否代表所有子资源都加载完成？**

不代表。它说明组件同步子树已经挂载，但图片是否下载完、异步组件是否完成、接口是否返回是另外的异步过程。需要图片尺寸时应监听图片加载或使用对应资源 API，不能只依赖 mounted。

### 40. 第一次加载会触发哪些生命周期？

Vue2 Options API 常见顺序是：

```text
beforeCreate -> created -> beforeMount -> mounted
```

Vue3 Composition API 会先执行 `setup` 中的同步代码，再依次触发 `onBeforeMount` 和 `onMounted` 注册的回调。

异步组件、`Suspense`、服务端渲染和缓存组件会影响实际可观察顺序，面试回答时应先限定普通同步组件场景。

### 41. 父子组件的生命周期顺序是什么？

普通同步父子组件的典型顺序：

```text
挂载：父 beforeMount -> 子 beforeMount -> 子 mounted -> 父 mounted
更新：父 beforeUpdate -> 子 beforeUpdate -> 子 updated -> 父 updated
卸载：父 beforeUnmount -> 子 beforeUnmount -> 子 unmounted -> 父 unmounted
```

创建阶段还会先执行父组件自身的初始化，再进入子组件初始化。实际顺序会受条件渲染、异步组件和更新来源影响，不要脱离场景机械背诵。

**为什么挂载是“父先准备、子先完成”？**

父组件执行渲染时发现子组件，必须先把子组件创建并挂载好，父组件的整棵同步子树才算挂载完成，所以子 `mounted` 通常早于父 `mounted`。可以把它理解成装修房屋：父级先开始安排，内部房间完成后，整套房才宣布完成。

更新顺序也不是任何时候都固定成同一种情况。如果只修改子组件自己的本地状态，父组件可能根本不更新。面试中给出顺序时，要先说“父组件状态变化并导致子组件一起更新的普通同步场景”。

### 42. 请求应放在 `created/setup` 还是 `mounted/onMounted`？

**规范回答（可直接复述）**

请求不依赖 DOM 或浏览器 API 时，可以在 `setup`、`created` 或抽离的数据层发起；依赖模板 ref、元素尺寸、Canvas 或仅客户端第三方库时，放在 `mounted/onMounted` 更合适。

两者通常只相差一个挂载阶段，不能简单说放在 `created` 就一定不会闪屏。加载状态、缓存、并发取消、错误处理和服务端渲染策略往往更重要。使用 SSR 时还要根据框架的数据获取机制避免服务端和客户端重复请求。

### 43. 组件卸载时为什么要清理副作用？

Vue 创建的 computed、watch 和组件渲染副作用通常会随组件停止，但开发者手动创建的全局事件监听、定时器、WebSocket、第三方实例或未完成请求可能继续持有引用并执行，造成内存泄漏或重复行为。

```javascript
const controller = new AbortController()

onMounted(() => {
  window.addEventListener('resize', handleResize)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize)
  controller.abort()
})
```

## 六、Composition API 与逻辑复用

### 44. 为什么 Vue3 引入 Composition API？

**规范回答（可直接复述）**

Options API 按 `data`、`methods`、`computed` 等选项组织代码，组件变大后，同一业务能力的状态和逻辑容易分散。Composition API 允许按业务关注点组织逻辑，并把这组逻辑抽成组合式函数复用，同时改善 TypeScript 类型推导。

Composition API 不是为了淘汰 Options API。简单组件使用 Options API 仍然清晰；复杂业务、逻辑复用和 TypeScript 项目通常更适合 Composition API。

### 45. 组合式函数与 Vue2 mixin 有什么区别？

**规范回答（可直接复述）**

组合式函数是普通函数，通过参数显式接收依赖并通过返回值显式暴露状态和行为，来源容易追踪，也可以多次调用和重命名。mixin 会隐式合并组件选项，容易出现命名冲突、来源不清晰和依赖不明确的问题，也不方便传参。

组合式函数通常以 `use` 开头，但这只是命名约定。它可以使用 Vue 响应式 API 和生命周期钩子，调用位置应处于组件 `setup` 的同步执行上下文中。

```javascript
export function useCounter(initialValue = 0) {
  const count = ref(initialValue)
  const increment = () => count.value++

  return { count, increment }
}
```

**再看一个更接近项目的例子**

多个页面都需要“加载列表、显示 loading、处理错误、支持重新加载”，可以抽成组合式函数：

```javascript
import { onMounted, ref, toValue } from 'vue'

export function useArticleList(categoryId) {
  const articles = ref([])
  const loading = ref(false)
  const error = ref(null)

  async function load() {
    loading.value = true
    error.value = null
    try {
      articles.value = await fetchArticles({
        categoryId: toValue(categoryId)
      })
    } catch (reason) {
      error.value = reason
    } finally {
      loading.value = false
    }
  }

  onMounted(load)

  return {
    articles,
    loading,
    error,
    reload: load
  }
}
```

调用方能直接看到传入了什么、返回了什么；如果两个组合式函数都返回 `loading`，还可以在解构时重命名。mixin 的属性会被隐式合入 `this`，很难从组件局部判断 `loading` 来自哪个 mixin，这就是两者在可维护性上的核心差异。

**组合式函数不是普通 utils 的同义词**

纯字符串格式化、数组转换不需要 Vue 状态，放普通工具函数即可。组合式函数通常会组合 ref、computed、watch、生命周期或其他组合式函数，并服务于一组可复用的有状态逻辑。

### 46. `<script setup>` 有什么特点？

**规范回答（可直接复述）**

`<script setup>` 是单文件组件中使用 Composition API 的编译时语法糖。顶层变量和导入可以直接在模板中使用，不需要手动 `return`；组件会编译为高效的 `setup` 函数，并提供 `defineProps`、`defineEmits`、`defineExpose`、`defineOptions`、`defineSlots` 和 `defineModel` 等编译宏。

这些宏通常不需要导入，并且会在编译阶段处理，不是普通运行时函数。宏的可用范围与具体 Vue 版本有关，面试或项目中应说明版本。

```vue
<script setup>
const props = defineProps({
  userId: {
    type: String,
    required: true
  }
})

const emit = defineEmits(['saved'])

function save() {
  emit('saved', props.userId)
}
</script>
```

**小白理解编译宏**

编译宏看起来像函数，但它们主要是给编译器看的标记。例如 `defineProps` 告诉编译器组件接收哪些 prop，`defineEmits` 告诉编译器组件可能发出哪些事件。因为编译时就会被处理，所以通常不需要从 Vue 导入。

常见宏用途：

- `defineProps`：声明父组件传入的数据。
- `defineEmits`：声明子组件发出的事件。
- `defineExpose`：明确允许父组件模板 ref 访问的能力。
- `defineOptions`：声明组件名等选项。
- `defineSlots`：为 TypeScript 提供插槽类型。
- `defineModel`：在支持版本中简化组件 `v-model` 声明。

`<script setup>` 顶层代码会成为组件 `setup` 的内容，每创建一个组件实例都会执行，不能把它误认为只执行一次的普通模块代码。真正只希望模块加载一次的常量，可以放在普通 `<script>` 或外部模块中。

### 47. `customRef` 适合什么场景？

`customRef` 允许显式控制依赖追踪 `track` 和触发更新 `trigger`，常见示例是防抖输入值：

```javascript
function useDebouncedRef(value, delay = 300) {
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
```

业务中也可以让原始输入立即更新，把防抖放到请求层。选择哪种方式取决于 UI 是否需要实时显示输入值。

### 48. 自定义指令适合做什么？

自定义指令适合封装需要直接访问底层 DOM 的可复用行为，例如聚焦、权限控制下的 DOM 处理、拖拽或点击外部关闭。纯数据和组件逻辑优先使用组件或组合式函数。

```javascript
const clickOutside = {
  mounted(el, binding) {
    el.__clickOutside__ = event => {
      if (!el.contains(event.target)) binding.value(event)
    }
    document.addEventListener('pointerdown', el.__clickOutside__)
  },
  unmounted(el) {
    document.removeEventListener('pointerdown', el.__clickOutside__)
    delete el.__clickOutside__
  }
}
```

真实项目还应考虑事件捕获、Teleport、Shadow DOM、多个实例和回调更新等边界。

## 七、状态管理：Vuex 与 Pinia

### 49. 什么情况下需要全局状态管理？

**规范回答（可直接复述）**

当多个距离较远的组件需要读写同一份业务状态，并且状态生命周期超出单个组件时，可以使用全局状态管理，例如登录用户、权限、购物车或跨页面草稿。只在父子组件之间使用的数据，优先保留在最近共同父组件中，通过 props 和 emit 传递。

全局状态不是越多越好。接口缓存、URL 查询参数、表单临时状态和服务端状态未必都应该放进 store。

### 50. Vuex 的核心概念是什么？

**规范回答（可直接复述）**

Vuex 是 Vue 的集中式状态管理库，核心包括：

- `state`：状态源。
- `getters`：基于 state 的派生状态。
- `mutations`：同步修改 state 的约定入口，通过 `commit` 提交。
- `actions`：组织异步或复杂流程，通过 `dispatch` 调用，可以再 `commit` mutation。
- `modules`：按领域拆分 store。

Vuex 强调单向数据流。`commit` 的含义是提交 mutation，不是绕过 mutation 直接修改 state。Vuex 4 主要用于 Vue3 兼容和旧项目维护，新 Vue3 项目通常优先 Pinia。

**把 Vuex 流程串起来**

以“加载购物车”为例：

```text
组件 dispatch action
        ↓
action 请求后端接口
        ↓
action commit mutation
        ↓
mutation 同步修改 state
        ↓
依赖 state/getter 的组件自动更新
```

```javascript
const store = createStore({
  state: () => ({
    cartItems: []
  }),
  getters: {
    totalCount: state => {
      return state.cartItems.reduce((sum, item) => sum + item.count, 0)
    }
  },
  mutations: {
    setCartItems(state, items) {
      state.cartItems = items
    }
  },
  actions: {
    async loadCart({ commit }) {
      const items = await cartApi.list()
      commit('setCartItems', items)
    }
  }
})
```

需要强调：action 可以异步，也可以同步；mutation 必须同步，主要是为了让状态变更可以被开发工具按顺序记录和调试。组件通过 `dispatch('loadCart')` 调 action，通过 `commit('setCartItems', payload)` 提交 mutation。

**Vuex modules 为什么需要命名空间？**

项目变大后会按用户、购物车、订单等领域拆 module。默认情况下，各模块的 action、mutation 和 getter 注册在全局命名空间，容易重名；设置 `namespaced: true` 后，可以通过 `cart/loadCart` 这类完整名称调用，来源更清晰。每个 module 可以有自己的 state、getters、mutations、actions，也能访问根状态。

### 51. Pinia 相比 Vuex 有什么特点？

**规范回答（可直接复述）**

Pinia 是当前 Vue 官方推荐的状态管理方案。它取消 mutation，store 主要由 state、getters 和 actions 组成；API 更轻量，对 TypeScript 和 Composition API 的类型推导更友好，并天然支持多个独立 store 和开发工具。

Pinia 仍然是集中管理共享状态，不代表可以在任意位置无约束修改。团队仍应明确状态所有权、action 边界和持久化策略。

**Pinia 基本例子**

```javascript
// stores/cart.js
import { computed, ref } from 'vue'
import { defineStore } from 'pinia'

export const useCartStore = defineStore('cart', () => {
  const items = ref([])
  const totalCount = computed(() => {
    return items.value.reduce((sum, item) => sum + item.count, 0)
  })

  async function load() {
    items.value = await cartApi.list()
  }

  function clear() {
    items.value = []
  }

  return { items, totalCount, load, clear }
})
```

```javascript
// 组件中
const cartStore = useCartStore()
const { items, totalCount } = storeToRefs(cartStore)

await cartStore.load()
```

直接解构 store 会破坏 state/getter 的响应式连接，因此解构状态时使用 `storeToRefs`；action 可以直接解构，因为它是绑定到 store 的方法。

**Vuex 和 Pinia 面试对比**

| 对比项 | Vuex | Pinia |
| --- | --- | --- |
| 状态修改约定 | mutation + action | action 或明确的 store 操作 |
| 模块 | modules，可配置 namespace | 每个 store 天然独立 |
| TypeScript | 能支持，但样板较多 | 类型推导更自然 |
| Vue3 新项目 | 可用 Vuex 4 | 官方推荐优先使用 |
| 旧项目维护 | Vue2/Vuex 很常见 | 迁移后可逐步采用 |

### 52. 页面刷新后 store 数据为什么会丢失？怎样处理？

store 默认保存在 JavaScript 内存中，页面刷新会重新创建应用，所以状态恢复为初始值。常见方案包括：

- 从服务端重新获取权威数据。
- 把适合公开和分享的筛选状态放入 URL。
- 把少量非敏感状态持久化到 `localStorage/sessionStorage`。
- 使用 Pinia 持久化插件，但仍要评估数据版本、过期、迁移和安全。

Token、权限等敏感信息不能因为“需要持久化”就随意放在本地存储。认证方案应同时考虑 XSS、CSRF、Cookie 属性和服务端校验。

**小白理解**

普通 store 就像写在当前网页进程里的便签。刷新页面相当于把当前 JavaScript 运行环境销毁后重新打开，便签自然回到初始内容。`localStorage` 更像浏览器磁盘上的抽屉，刷新后仍在，但它不是数据库，也不一定安全。

持久化时至少要想清楚四件事：

1. 哪些字段确实要保存，避免把整个 store 无脑序列化。
2. 保存多久，退出登录或数据过期时怎样清理。
3. 数据结构升级后，旧版本缓存怎样迁移或丢弃。
4. 本地数据和服务端数据冲突时，以谁为准。

### 53. 请求应该放在组件还是 store 的 action 中？

组件私有、只影响当前页面的请求可以留在组件或对应组合式函数中；多个页面共享、需要缓存或会更新全局业务状态的请求更适合封装到 store action 或独立数据访问层。

判断依据是状态所有权和复用边界，而不是“所有 Ajax 都必须放 Vuex/Pinia”。

**Vuex/Pinia 常见追问补充**

**1. action 怎样传多个参数？**

Vuex 的 `dispatch` 或 `commit` 通常只接收一个 payload，因此把多个业务字段放进对象：

```javascript
store.dispatch('article/loadList', {
  page: 1,
  pageSize: 20,
  keyword: 'vue'
})
```

对象 payload 比依赖参数顺序更容易扩展。Pinia action 本质上是 store 方法，可以像普通函数一样定义多个参数，但复杂参数仍常用对象表达。

**2. Vuex 怎样批量映射状态和方法？**

Options API 项目常使用 `mapState`、`mapGetters`、`mapActions` 和 `mapMutations`：

```javascript
export default {
  computed: {
    ...mapState('cart', ['items']),
    ...mapGetters('cart', ['totalCount'])
  },
  methods: {
    ...mapActions('cart', ['loadCart'])
  }
}
```

注意是 `mapActions`，不是 `mapAction`。使用命名空间 module 时，第一个参数是模块名。

**3. 怎样监听 store 状态变化？**

组件展示派生数据优先用 computed；需要执行副作用时可以 watch 某个明确状态。Vuex 还提供 `store.watch` 和 `store.subscribe`，Pinia 提供 `$subscribe` 和 `$onAction`，适合插件、持久化和审计等 store 级能力。订阅如果不是由组件自动管理，要记得取消。

**4. 不使用全局 store 一定不好吗？**

不是。小型应用或局部状态用 props、emit、组合式函数和服务层往往更简单。只有共享范围、生命周期和修改链路已经复杂到需要统一管理时，store 才带来收益。把全部接口数据和弹窗开关都塞进全局 store，反而会增加耦合和清理成本。

## 八、Vue Router

### 54. `$route/useRoute` 和 `$router/useRouter` 有什么区别？

**规范回答（可直接复述）**

- `route` 表示当前路由位置，是响应式的只读路由信息，包含 `path`、`params`、`query`、`meta` 和匹配记录等。
- `router` 是路由器实例，提供 `push`、`replace`、`back`、动态路由和守卫等能力。

Options API 中常见 `this.$route/this.$router`；Vue Router 4 的 Composition API 中使用 `useRoute/useRouter`。

不建议直接 watch 整个 route 对象，应监听真正关心的字段：

```javascript
watch(
  () => route.params.id,
  id => loadArticle(id),
  { immediate: true }
)
```

### 55. `params` 和 `query` 有什么区别？

**规范回答（可直接复述）**

`params` 通常对应路由路径中的动态段，例如 `/users/:id` 的 `id`；`query` 对应问号后的查询字符串，例如 `/users?page=2`。路径参数常用于标识核心资源，查询参数常用于筛选、排序和分页。

```javascript
router.push({ name: 'user-detail', params: { id: '42' } })
router.push({ path: '/users', query: { page: '2' } })
```

使用 `params` 导航时优先通过命名路由传递。不能把任意隐藏数据放进 params 并期待刷新后仍然存在；路由参数本质上应当可以由 URL 表达。

**常见跳转方式**

```javascript
// 字符串路径
router.push('/articles')

// 命名路由 + 路径参数
router.push({
  name: 'article-detail',
  params: { slug: 'vue-interview' }
})

// 路径 + 查询参数
router.push({
  path: '/articles',
  query: { page: '2', keyword: 'vue' }
})

// 替换当前历史记录，返回时不会回到被替换的位置
router.replace({ name: 'login' })

// 历史记录前进后退
router.back()
router.go(-2)
```

`push` 会新增一条历史记录，`replace` 会替换当前记录。登录成功后的重定向、纠正非法 URL 等场景常使用 replace，普通页面导航通常使用 push。

### 56. Hash 模式和 History 模式有什么区别？

**规范回答（可直接复述）**

Hash 模式把前端路由放在 URL 的 `#` 后，井号后的内容不会作为普通路径发送给服务器，部署简单，但 URL 不够自然。History 模式利用 History API，URL 更正常，但直接访问或刷新子路径时，服务器必须把未命中的前端路由回退到入口 `index.html`，同时不能错误拦截真实 API 和静态资源。

两种模式的前端切换通常都不会完整刷新页面。选择主要取决于 URL、部署环境和服务端配置。

### 57. Vue Router 有哪些导航守卫？

**规范回答（可直接复述）**

- 全局：`beforeEach`、`beforeResolve`、`afterEach`。
- 路由独享：路由配置中的 `beforeEnter`。
- 组件内 Options API：`beforeRouteEnter`、`beforeRouteUpdate`、`beforeRouteLeave`。
- Vue Router 4 Composition API：`onBeforeRouteUpdate`、`onBeforeRouteLeave`。

Vue Router 4 没有 `onBeforeRouteEnter`。进入页面前的逻辑可放到全局守卫、`beforeEnter` 或组件初始化的数据获取流程中。

守卫适合认证、授权、未保存修改确认和路由级数据准备。权限不能只靠前端守卫，后端接口仍必须独立鉴权。

**登录守卫示例**

```javascript
router.beforeEach(async to => {
  const authStore = useAuthStore()

  if (!authStore.initialized) {
    await authStore.restoreSession()
  }

  if (to.meta.requiresAuth && !authStore.isLoggedIn) {
    return {
      name: 'login',
      query: { redirect: to.fullPath }
    }
  }
})
```

Vue Router 4 推荐通过返回值控制导航：返回 `false` 取消，返回路由位置重定向，不返回内容表示继续。旧教程中的 `next()` 仍会在兼容写法或 Vue Router 3 中出现，但一个守卫分支多次调用 `next` 很容易造成错误。

**离开页面前确认未保存内容**

```javascript
onBeforeRouteLeave(() => {
  if (!formDirty.value) return true
  return window.confirm('内容尚未保存，确定离开吗？')
})
```

`onBeforeRouteUpdate` 用于当前组件被复用但 params、query 等路由信息变化的情况；`onBeforeRouteLeave` 用于组件即将离开。Vue Router 4 没有 Composition API 版本的 `onBeforeRouteEnter`。

### 58. 完整导航解析流程怎样回答？

面试时可以概括为：

1. 触发导航。
2. 调用失活组件的离开守卫。
3. 调用全局 `beforeEach`。
4. 复用组件时调用更新守卫。
5. 调用路由配置 `beforeEnter`。
6. 解析异步路由组件。
7. 调用进入组件的 `beforeRouteEnter`。
8. 调用全局 `beforeResolve`。
9. 导航确认并更新地址。
10. 调用 `afterEach`，随后完成 DOM 更新并执行进入回调。

回答时说明这是典型流程即可，不要把 `afterEach` 说成能取消导航的守卫。

### 59. 动态路由怎样添加？

Vue Router 4 使用 `router.addRoute()`，可以添加顶级路由或指定父路由名称添加子路由，并返回移除该路由的函数。Vue Router 3 旧项目中可能见到 `addRoutes()`，该 API 已废弃。

动态路由常用于数据库菜单和权限路由，但必须同时处理：

- 登录后获取权限再注册路由。
- 刷新时重新恢复动态路由。
- 防止重复注册。
- 退出登录时清理路由。
- 后端接口继续执行真正的 RBAC 鉴权。

### 60. 路由参数变化为什么组件可能不重新创建？

从 `/users/1` 导航到 `/users/2` 时，匹配的仍是同一个组件类型，Vue Router 会复用组件实例，因此 `mounted/onMounted` 不会重新执行。应监听 `route.params.id`，或使用 `beforeRouteUpdate/onBeforeRouteUpdate` 获取新参数并更新数据。

只有确实希望完全重建组件时才给路由视图设置合适的 `key`，否则会丢失局部状态并增加挂载成本。

## 九、网络请求与跨域

### 61. Axios 拦截器有什么作用？

Axios 提供请求拦截器和响应拦截器。常见用途包括统一添加认证信息、请求标识、序列化参数，以及统一解析响应和规范错误对象。

**先理解常见请求方法**

- `GET`：查询资源，参数通常放在 URL path 或 query 中。
- `POST`：创建资源、提交命令或表单，也常用于文件上传。
- `PUT`：通常表示对目标资源进行整体替换，要求由接口语义决定。
- `PATCH`：通常表示部分更新。
- `DELETE`：删除资源，是否允许请求体取决于后端接口约定和中间设施支持。

```javascript
await http.get('/articles', {
  params: { page: 1, keyword: 'vue' }
})

await http.post('/articles', {
  title: 'Vue 面试题'
})

await http.patch('/articles/42', {
  status: 'published'
})

await http.delete('/articles/42')
```

HTTP 方法表达的是接口语义，不是“Axios 规定 GET 只能查、POST 只能增”。最终要遵守服务端 API 契约。

```javascript
http.interceptors.request.use(config => {
  config.headers.Authorization = `Bearer ${token}`
  return config
})

http.interceptors.response.use(
  response => response.data,
  error => Promise.reject(normalizeHttpError(error))
)
```

不要在拦截器中吞掉错误，也不要对所有请求无条件弹出重复提示。处理 401 刷新 Token 时还要防止并发刷新、无限重试和请求风暴。

**为什么要二次封装 Axios？**

项目通常先通过 `axios.create` 创建实例，统一设置 `baseURL`、超时和请求头，再集中处理认证及错误。业务组件只调用 `articleApi.list()`，不需要每个页面重复拼 URL、加 Token、判断相同错误码。

但封装层不应过度：它应保留状态码、业务错误码、取消信息等排错上下文，也不应把所有错误都转换成一句“请求失败”。

### 62. Vue 项目怎样解决跨域？

**规范回答（可直接复述）**

跨域是浏览器同源策略对脚本读取跨源响应的限制，不是 Vue 特有问题。生产环境优先由服务端正确配置 CORS，或通过同源网关/Nginx 反向代理。开发环境可以使用 Vite 或 Vue CLI 的 dev server proxy，把浏览器请求先发到同源开发服务器，再由开发服务器转发到后端。

代理只是改变请求链路，不是关闭浏览器安全策略。带凭据的 CORS 不能使用通配符来源，还要正确配置 `Access-Control-Allow-Credentials`、Cookie 和预检请求。

**什么叫同源？**

协议、主机和端口全部相同才是同源。例如：

```text
http://example.com:80
https://example.com:443
```

它们协议和端口都不同，因此不是同源。跨域请求本身通常已经被浏览器发送，真正被限制的常常是前端 JavaScript 读取响应；表单、图片等资源加载又有各自规则，所以不能把跨域简单理解为“浏览器不能访问别的网站”。

**Vite 开发代理示例**

```javascript
// vite.config.js
export default defineConfig({
  server: {
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:3001',
        changeOrigin: true
      }
    }
  }
})
```

浏览器请求 `http://localhost:5173/api/articles`，从浏览器视角仍然访问同源 Vite 服务；Vite 再从服务器端转发到 3001 端口。生产环境不会运行 Vite 开发服务器，应改由 Nginx、网关或后端 CORS 处理。

**什么是预检请求？**

某些非简单跨域请求发送前，浏览器会先发 OPTIONS 请求，询问服务端是否允许来源、方法和请求头。若服务端没有正确响应预检，即使真实接口本身正常，浏览器也不会继续开放响应给前端。

### 63. 怎样避免搜索请求的竞态问题？

用户快速输入时，旧请求可能比新请求更晚返回，导致旧结果覆盖新结果。可以同时采用：

- 输入防抖，减少请求次数。
- 使用 `AbortController` 或 Axios 对应能力取消旧请求。
- 为每次请求记录序号，只接受最后一次结果。
- 在 watch 清理回调中终止上一次副作用。

仅做防抖不能完全消除已经发出的请求竞态。

## 十、性能优化与架构对比

### 64. Vue 项目常见的性能优化有哪些？

**规范回答（可直接复述）**

我会先用性能工具定位瓶颈，再从加载、渲染、更新和资源四个层面优化：

**加载阶段**

- 路由懒加载和异步组件，拆分首屏包。
- 按需引入组件库，分析包体积，减少重复依赖。
- 合理使用 CDN、压缩、缓存和预加载。
- 图片按展示尺寸处理，使用懒加载和现代格式。

**渲染与更新**

- 列表使用稳定 `key`，大列表使用虚拟列表或分页。
- 避免模板中执行昂贵函数，派生值使用 computed。
- 保持 props 稳定，减少无关子组件更新。
- 适当使用 `v-once`、`v-memo`，不要盲目缓存。
- 大型不可变数据或第三方对象可评估 `shallowRef/markRaw`。

**副作用与网络**

- 对输入请求做防抖、取消和缓存。
- 及时清理监听、计时器和连接。
- 避免重复请求和串行瀑布请求。

**测量**

- 使用 Vue Devtools、浏览器 Performance、Lighthouse 和构建产物分析。
- 分清首屏慢、交互慢、更新频繁还是内存增长，再选择方案。

### 65. `v-once`、`v-memo` 和 `<KeepAlive>` 有什么区别？

- `v-once`：某个子树只渲染一次，后续永久跳过更新。
- `v-memo`：依赖数组不变时跳过该子树的更新，依赖改变后仍可更新。
- `<KeepAlive>`：缓存动态组件实例，在组件切换时保留状态。

三者解决的问题不同，不能把 `v-memo` 说成“缓存动态组件”。

### 66. 什么是 SPA？优缺点是什么？

**规范回答（可直接复述）**

SPA 是单页应用。首次加载入口后，页面导航主要由前端路由和 JavaScript 完成，不需要每次都向服务器请求一整份新 HTML。

优点是页面切换流畅、前后端职责清晰、组件和状态可以在客户端复用。缺点是首屏资源可能较大，对 JavaScript 依赖高；纯客户端渲染下 SEO 和首屏展示可能受影响；路由回退、权限、缓存和错误监控也需要额外设计。

这些问题可以通过代码分割、预渲染、SSR/SSG 和合理缓存缓解，但会增加架构复杂度。

### 67. Vue 与 React 有什么区别？

**规范回答（可直接复述）**

Vue 和 React 都采用组件化思想，也都能构建复杂应用。Vue 提供模板、响应式系统、单文件组件以及相对集成的官方路由和状态管理生态；React 核心更聚焦 UI 表达，通常使用 JSX 和函数组件，状态更新与生态选型方式不同。

Vue 的依赖追踪可以精准知道哪些响应式依赖变化，React 常通过组件重新执行得到新 UI，再结合协调和各种优化机制处理更新。两者都使用虚拟 DOM，但具体编译、调度和优化策略不同。

选型应看团队能力、既有生态、招聘维护成本、SSR 方案和业务约束，不宜回答“某个框架绝对更快”。

### 68. Vue3 相比 Vue2 有哪些重要变化？

**规范回答（可直接复述）**

Vue3 的主要变化包括：

1. 响应式从 `Object.defineProperty` 为主改为 Proxy 为主，完整支持属性新增、删除和集合类型。
2. 引入 Composition API 和 `<script setup>`，改善复杂逻辑组织、复用与 TypeScript 推导。
3. 重写编译器和渲染器，引入 Patch Flag、Block Tree、静态提升等优化。
4. 支持 Fragment、Teleport、Suspense 和多 `v-model`。
5. 应用实例改为 `createApp`，全局配置作用域更清晰。
6. 更好地支持 Tree Shaking，许多 API 改为命名导入。
7. 生命周期、`v-model`、`v-if/v-for` 优先级等存在破坏性变化。
8. 移除了过滤器、`$children` 和实例事件 API 等旧能力。

Vue3 不只是“Vue2 加了几个 API”，迁移时必须结合官方迁移指南检查破坏性变化和第三方库兼容性。

### 69. Vue3 为什么移除过滤器？

过滤器使用模板专属语法，能力可以由普通 JavaScript 函数、computed 或方法替代，而且专属语法增加了学习、类型分析和表达式解析成本。Vue3 移除过滤器后，数据转换来源更容易追踪。

```javascript
const formattedPrice = computed(() => formatCurrency(price.value))
```

### 70. Vue 应用出现内存泄漏，通常怎样排查？

先观察是否随着页面反复进入退出而持续增长，再使用内存快照和分配时间线查看被保留对象。常见原因包括：

- 未清理的全局事件监听和定时器。
- 第三方 DOM 插件未销毁。
- WebSocket、观察器或订阅未关闭。
- 闭包、缓存或全局 store 长期持有大对象。
- `<KeepAlive>` 缓存范围过大。
- 请求回调在页面离开后继续引用组件状态。

不要把“Vue 有虚拟 DOM”当成不会内存泄漏。框架会处理自身生命周期内的资源，开发者创建的外部资源仍要负责清理。

## 十一、面试追问速答

### 71. `methods` 和 `computed` 有什么区别？

`methods` 每次在渲染或代码中被调用都会执行；`computed` 是响应式派生值，默认惰性计算，并在依赖不变时复用缓存。需要参数或执行命令式动作时使用方法，需要根据状态派生值时使用 computed。

### 72. `computed` 可以有 setter 吗？

可以。传入 `{ get, set }` 能创建可写计算属性，但 setter 通常应把变化映射回源状态。若只是为了在 computed 中随意执行副作用，说明数据流可能需要重新设计。

### 73. 为什么模板中 ref 通常不用 `.value`？

Vue 模板编译和运行时会在合适位置自动解包 ref，使模板更简洁；JavaScript 中没有这一层模板处理，所以通常需要 `.value`。数组、集合或嵌套对象中的 ref 解包存在边界，不能理解成任何位置都自动解包。

### 74. `isRef`、`isReactive`、`isReadonly`、`isProxy` 分别判断什么？

- `isRef`：是否为 ref。
- `isReactive`：是否为 `reactive` 创建的响应式代理。
- `isReadonly`：是否为只读代理。
- `isProxy`：是否为 `reactive` 或 `readonly` 创建的代理。

### 75. Vue3 怎样设置全局属性？

Options API 兼容场景可以使用 `app.config.globalProperties`，组件实例中通过 `this` 访问。Composition API 更推荐直接导入模块，或用 `provide/inject` 传递可替换依赖。不要把所有工具都挂到全局对象，否则依赖来源和测试会变得不清晰。

### 76. `defineAsyncComponent` 是什么？

它用于定义按需加载的异步组件，可以配置加载组件、错误组件、延迟、超时和重试逻辑。路由懒加载通常直接使用动态 `import()`；页面内部体积较大的非首屏组件可以使用 `defineAsyncComponent`。

### 77. 为什么不要在 `updated` 中无条件修改响应式数据？

因为数据修改会触发下一轮更新，`updated` 再修改又触发更新，可能形成无限循环。需要基于数据产生新状态时优先使用 computed、watch 或明确的事件流程。

### 78. Vue 中错误处理有哪些层级？

- 组件层：`onErrorCaptured/errorCaptured` 捕获后代组件错误。
- 应用层：`app.config.errorHandler` 做统一上报。
- 路由层：处理导航失败和异步加载错误。
- 请求层：统一规范网络错误，但保留业务上下文。
- 全局层：监听未处理 Promise 拒绝和脚本错误作为兜底。

错误边界不能替代修复错误，也不能保证捕获浏览器和第三方脚本中的所有异常。

## 十二、最后复习：一段话串起 Vue 核心

面试前可以用下面这段话检查自己是否真正理解了主线：

> Vue 通过编译器把模板转换为渲染函数，渲染函数产生虚拟 DOM。组件渲染期间读取响应式状态时，响应式系统完成依赖收集；状态变化后触发相关副作用，由调度器把组件更新任务去重并批量执行。渲染器比较新旧 VNode，通过 patch 和 diff 复用节点、更新属性与子节点，最终把必要变化应用到真实 DOM。Vue3 使用 Proxy 完善响应式能力，并通过 Patch Flag、Block Tree、静态提升和有 key 列表优化降低更新成本。组件之间默认遵循 props 向下、事件向上的单向数据流，复杂共享状态交给 Pinia，页面导航交给 Vue Router。

如果这段话中的“编译、依赖收集、调度、VNode、patch、diff、组件通信”都能继续展开，这篇 Vue 基础面试就形成了完整知识链，而不是互不关联的答案列表。
