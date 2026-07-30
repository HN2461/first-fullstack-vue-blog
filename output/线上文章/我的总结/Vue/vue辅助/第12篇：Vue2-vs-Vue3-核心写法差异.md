---
title: "第12篇：Vue2 vs Vue3 核心写法差异"
slug: "vue-vue-vue2-vue3-61311af1"
summary: "一篇详细的小白友好笔记，解释了Vue2 Options API和Vue3 Composition API的核心差异，重点说明了this的变化原因、setup()执行时机、以及从\"配置对象\"到\"函数式组合\"的思维转变。"
category: "vue辅助"
tags:
  - "Vue2"
  - "Vue3"
  - "Composition API"
  - "setup"
  - "this"
status: "draft"
sortOrder: 20
cover: ""
originalId: "6a2d291f8a2b1c68f2cac4de"
originalSlug: "vue-vue-vue2-vue3-61311af1"
originalStatus: "published"
exportedAt: "2026-07-30T14:08:39.359Z"
---
# Vue2 vs Vue3 核心写法差异：从 `this` 魔法到函数式组合

## 📌 先说结论

| | Vue2 (Options API) | Vue3 (Composition API) |
|---|---|---|
| **感觉** | 写“配置对象”，像填空题 | 写“函数调用”，到处传回调 |
| **核心** | `this` 中心化，串联所有选项 | 闭包 + 显式返回，不用 `this` |
| **组织** | 按数据类型分散 (data/methods/computed) | 按功能模块聚合 (相关代码放一起) |
| **本质** | 告诉框架“我是什么” | 告诉框架“我要做什么” |

---

## 1. 两种截然不同的“感觉”是怎么来的？

### Vue2 感觉像写普通 JS

```javascript
export default {
  data() {
    return { count: 0 }
  },
  methods: {
    increment() {
      this.count++ // 通过 this 访问组件内的一切
    }
  }
}
```

**为什么感觉自然？**
- 你在写一个普通的 JS 对象
- `data`、`methods` 就是对象的属性
- 看起来就是普通的对象字面量

### Vue3 感觉像“框架定义好，你来用”

```javascript
export default {
  setup() {
    const count = ref(0)
    
    function increment() {
      count.value++ // 直接操作变量，不用 this
    }
    
    return { count, increment }
  }
}
```

**为什么感觉不一样？**
- `ref()`、`computed()`、`watch()` 都是**函数调用**
- 你需要传入**回调函数**让框架在合适的时机执行
- 这叫**控制反转**——框架决定何时调用，你只提供逻辑

---

## 2. Vue2 的 `this` 为什么必须存在？

### 2.1 `this` 是串联所有选项的“枢纽”

```
┌─────────────────────────────────────────────────────┐
│                     Vue2 组件实例                    │
├─────────────────────────────────────────────────────┤
│                                                      │
│   data() ──┐                                         │
│      │      │                                        │
│      ↓      │                                        │
│   this ────┼──→ data, methods, computed, props...    │
│      ↑      │         (全部混进 this)                 │
│      │      │                                        │
│   methods ─┘                                         │
│                                                      │
│   "我(组件实例)包含了所有东西，通过 this 访问"        │
│                                                      │
└─────────────────────────────────────────────────────┘
```

Vue 在初始化组件时，把 `data` 返回值、`computed` 计算值、`methods` 函数**全部混入组件实例**。`this` 就是这个被 Vue 加工后的代理对象。

### 2.2 `this` 带来的问题

```javascript
export default {
  data() {
    return { message: 'Hello' }
  },
  methods: {
    // ❌ 定时器回调里 this 丢失了！
    delayedHello() {
      setTimeout(function() {
        console.log(this.message) // undefined！this 指向 window
      }, 1000)
    },
    
    // ✅ 解决方案1：用箭头函数
    delayedHello1() {
      setTimeout(() => {
        console.log(this.message) // 正常
      }, 1000)
    },
    
    // ✅ 解决方案2：用 bind
    delayedHello2() {
      setTimeout(function() {
        console.log(this.message)
      }.bind(this), 1000)
    }
  }
}
```

**问题总结**：
- `this` 指向容易丢失
- 逻辑分散在不同选项中，代码上下横跳
- TypeScript 类型推导复杂

---

## 3. Vue3 为什么完全不需要 `this`？

### 3.1 核心：用闭包替代 `this`

```javascript
export default {
  setup() {
    // count 是一个普通变量（被 ref 包装成响应式）
    const count = ref(0)
    
    // increment 是一个普通函数，通过闭包访问 count
    function increment() {
      count.value++ // 直接操作，不用 this
    }
    
    // 显式返回给模板使用
    return { count, increment }
  }
}
```

**为什么不用 `this`？**

```
Vue2:  通过 this 间接访问
          ↓
        this.count
        
 Vue3:  通过作用域直接访问
          ↓
        count.value  // 变量就在眼前
```

### 3.2 到处是“回调”的原因

```javascript
setup() {
  // computed - 你告诉框架：当依赖变化时，重新计算
  const double = computed(() => count.value * 2)
  
  // watch - 你指定：当 count 变化时，执行这个回调
  watch(count, (newVal, oldVal) => {
    console.log(`变了：${oldVal} → ${newVal}`)
  })
  
  // onMounted - 你注册：挂载后执行这个回调
  onMounted(() => {
    console.log('组件已挂载')
  })
}
```

**这不是“框架限制你”，而是：**
- 框架把**“何时执行”**的控制权交给你
- 你只需要提供**纯逻辑**（函数）
- 框架在合适的时机调用这些函数

---

## 4. `this` 在生命周期中的存在情况

### 4.1 关键结论

> **为什么 `setup()` 里没有 `this`？**
> 
> **因为 `setup()` 的执行时机非常早，它在组件实例完全初始化（beforeCreate）之前就已经运行了。此时 Vue 还没来得及把实例绑定到 `this` 上，所以 `setup()` 里的 `this` 是 `undefined`。**

### 4.2 Vue2 组件创建流程

```
┌────────────────────────────────────────────────────────────────┐
│                     Vue2 组件创建完整流程                         │
├────────────────────────────────────────────────────────────────┤
│                                                                 │
│  1. new Vue()  ─→ 开始创建组件                                  │
│         ↓                                                        │
│  2. init injections & reactions  ─→ 注入和响应式初始化          │
│         ↓                                                        │
│  3. beforeCreate  ─→ ✅ this 存在！但 data/methods 还没 init     │
│         ↓                                                        │
│  4. init props/state/references  ─→ data、computed、methods 等   │
│         ↓                                                        │
│  5. created  ─→ ✅ this 完全可用！所有数据都准备好了              │
│         ↓                                                        │
│  6. beforeMount  ─→ 准备挂载                                    │
│         ↓                                                        │
│  7. mounted  ─→ ✅ DOM 挂载完成，组件完全可用                      │
│                                                                 │
└────────────────────────────────────────────────────────────────┘
```

### 4.3 Vue3 的执行顺序

```
┌────────────────────────────────────────────────────────────────┐
│                     Vue3 组件创建完整流程                         │
├────────────────────────────────────────────────────────────────┤
│                                                                 │
│  1. setup()  ─→ ❌ this = undefined！                          │
│         │       此时组件实例还没完全创建                          │
│         ↓                                                        │
│  2. beforeCreate  ─→ ✅ this = 组件实例                         │
│         ↓                                                        │
│  3. created  ─→ ✅ this 完全可用                                │
│         ↓                                                        │
│  4. beforeMount / mounted  ─→ 挂载相关                          │
│                                                                 │
└────────────────────────────────────────────────────────────────┘
```

### 4.4 验证代码

```javascript
// Vue2
export default {
  beforeCreate() {
    console.log(this) // ✅ 组件实例
    console.log(this.$data) // undefined
  },
  created() {
    console.log(this) // ✅ 组件实例
    console.log(this.$data) // ✅ 有数据了
  }
}

// Vue3
export default {
  setup() {
    console.log(this) // ❌ undefined
    return {}
  },
  beforeCreate() {
    console.log(this) // ✅ 组件实例
  }
}
```

---

## 5. 为什么 Vue3 要这样设计？

### 5.1 更好的逻辑复用：组合函数

```javascript
// Vue2 的 mixin（容易冲突）
const myMixin = {
  data() { return { count: 0 } },
  methods: { increment() { this.count++ } }
}

// Vue3 的组合函数（无冲突）
function useCounter() {
  const count = ref(0)
  const double = computed(() => count.value * 2)
  function increment() { count.value++ }
  return { count, double, increment }
}

// 在组件中使用
const { count, double, increment } = useCounter()
```

**对比**：
- mixin：所有属性混进组件，可能命名冲突，来源不清晰
- 组合函数：调用函数 → 解构返回值，来源清晰，无冲突

### 5.2 更精准的类型推导

```typescript
// Vue3 组合函数，TypeScript 能轻松推断类型
function useCounter(initial: number) {
  const count = ref(initial)
  const double = computed(() => count.value * 2)
  return { count, double }
}

// 自动推断：count 是 Ref<number>，double 是 ComputedRef<number>
const { count, double } = useCounter(0)
```

### 5.3 运行时控制更灵活

```javascript
setup() {
  // 条件性地注册生命周期
  if (某些条件) {
    onMounted(() => console.log('mounted'))
  }
  
  // 手动停止侦听器
  const stop = watch(count, (newVal) => {
    console.log(newVal)
  })
  
  // 某个时机调用 stop() 停止监听
}
```

---

## 6. 做饭类比（超通俗理解）

### Vue2 = 餐厅点菜

```
┌─────────────────────────────────────────┐
│           Vue2 餐厅                     │
├─────────────────────────────────────────┤
│                                          │
│  你（开发者）走进餐厅，告诉服务员：        │
│                                          │
│  "我要 data 里的这些食材"   ← 放食材的框  │
│  "我要 methods 里的做法"   ← 放厨具的框  │
│  "我要 computed 的成品"     ← 放半成品的框│
│                                          │
│  服务员(this)帮你整合，                   │
│  你只需要说"我要这个，我要那个"           │
│                                          │
└─────────────────────────────────────────┘
```

### Vue3 = 自己下厨

```
┌─────────────────────────────────────────┐
│           Vue3 厨房                      │
├─────────────────────────────────────────┤
│                                          │
│  你（开发者）自己进厨房：                 │
│                                          │
│  const 食材1 = ref(新鲜度)  ← 自己准备    │
│  const 食材2 = reactive({})             │
│                                          │
│  function 做法() { ... }  ← 自己写做法   │
│                                          │
│  return { 食材1, 做法 }  ← 告诉服务员好了 │
│                                          │
│  不需要服务员，自己全搞定！               │
│                                          │
└─────────────────────────────────────────┘
```

---

## 7. 思维转变口诀

```
┌────────────────────────────────────────────────────────────┐
│                    Vue3 思维转变口诀                         │
├────────────────────────────────────────────────────────────┤
│                                                             │
│  1. 忘掉 this                                               │
│     → 只有变量和函数，用闭包联系彼此                          │
│                                                             │
│  2. 把组件看作一个"返回视图所需数据的函数"                   │
│     → setup() 就是一个大函数，往里塞逻辑，return 给模板     │
│                                                             │
│  3. 功能即函数                                               │
│     → 任何可复用的逻辑都封装成 useXxx()，调用取值            │
│                                                             │
│  4. 控制反转                                                │
│     → 框架决定何时调用，你只提供回调函数                     │
│                                                             │
│  5. 显式优于隐式                                             │
│     → 变量直接返回，不用通过 this 间接访问                   │
│                                                             │
└────────────────────────────────────────────────────────────┘
```

---

## 8. 核心对比一览表

| 维度 | Vue2 Options API | Vue3 Composition API |
|------|------------------|---------------------|
| 代码组织 | 按选项类型分散 | 按功能模块聚合 |
| 状态访问 | 通过 `this` 间接 | 通过闭包直接 |
| 复用手段 | mixin（易冲突） | 组合函数（无冲突） |
| 生命周期 | 预定义钩子选项 | 引入函数 + 回调 |
| 类型推导 | 复杂，需要额外处理 | 天然友好 |
| 摇树优化 | 全部打包 | 按需引入 |
| 心智模型 | 面向实例 | 面向函数和数据 |
| `this` | 必须使用 | 完全不需要 |

---

## 9. 如果还是怀念 Vue2 写法

**Vue3 完全兼容 Options API**，可以继续用：

```javascript
export default {
  data() {
    return { count: 0 }
  },
  methods: {
    increment() {
      this.count++
    }
  },
  // 甚至可以和 setup 混用
  setup() {
    // setup 返回的内容可以被 this 访问
    return {}
  }
}
```

**但建议**：复杂组件用 Composition API，简单组件随意。

---

## 10. 一句话总结

> **Vue2**：`this` 是所有选项的“万能遥控器”，通过它间接访问一切。
> 
> **Vue3**：`this` 被取消了，变量就在眼前（闭包），返回值就是API，框架负责调用时机（控制反转）。

**Vue3 并没有变得更怪异，它只是把隐藏在实例黑盒里的关系，搬到了明面上——通过函数、回调、返回值这种纯粹的 JavaScript 方式。**
