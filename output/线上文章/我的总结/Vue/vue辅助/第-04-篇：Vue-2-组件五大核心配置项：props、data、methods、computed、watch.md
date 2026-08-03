---
title: "第 04 篇：Vue 2 组件五大核心配置项：props、data、methods、computed、watch"
slug: "vue-vue-vue2-a3062491"
summary: "Vue2组件的五大核心配置项（data、props、methods、computed、watch）是组件开发的基础，本文详解它们的用法、协作关系与最佳实践。"
category: "vue辅助"
categoryPath:
  - "我的总结"
  - "Vue"
  - "vue辅助"
tags:
  - "Vue"
  - "组件配置"
  - "data"
  - "props"
  - "computed"
  - "watch"
status: "published"
sortOrder: 40
cover: ""
originalId: "6a2d291f8a2b1c68f2cac49e"
originalSlug: "vue-vue-vue2-a3062491"
originalStatus: "published"
publishedAt: "2026-05-09T12:50:17.707Z"
updatedAt: "2026-07-31T11:16:24.594Z"
exportedAt: "2026-08-03T03:03:53.296Z"
---
# 第 04 篇：Vue 2 组件五大核心配置项：props、data、methods、computed、watch

## Vue 2 组件五大核心配置项
| 配置项 | 核心作用 | 与 computed / watch 的关系 |
| --- | --- | --- |
| `data` | 定义组件的响应式数据，存储内部状态 | computed 依赖的数据源；watch 监听的目标 |
| `props` | 接收父组件传入的数据，实现组件通信 | computed 可以基于 props 计算派生值；watch 可以监听 props 变化执行逻辑 |
| `methods` | 定义事件处理函数 / 可复用的业务逻辑 | computed 中可以调用 methods；watch 中可调用 methods 执行副作用 |
| `computed` | 基于依赖数据计算出新值，有缓存 | —— |
| `watch` | 监听数据变化，执行异步或复杂逻辑 | —— |


> **说明**：这五个配置项是 Vue 2 组件最基础、最常用的部分，掌握了它们，就能独立开发绝大多数组件。其中 `computed` 和 `watch` 在用法上最容易混淆，下面会重点展开。
>

---

## 一、data —— 响应式数据
### 1. 核心用法
在 Vue 2 组件中，`data` 通常写成一个函数，并返回一个对象。这个对象里**初始化时声明过的属性**会被 Vue 转换为响应式数据；当这些属性的值发生变化时，视图会自动更新。

### 2. 完整示例
```javascript
export default {
  data() {
    return {
      // 基础类型
      count: 0,
      message: 'Hello Vue',
      // 引用类型
      user: {
        name: '张三',
        age: 18
      },
      list: [1, 2, 3]
    }
  }
}
```

### 3. 关键特点
+ **必须是函数**：组件复用时，每个实例拥有独立的数据副本，避免数据共享。
+ **响应式**：初始化时定义的数据会被 Vue 递归转换为响应式（`Object.defineProperty`）。
+ **新增属性不响应**：如果后续需要新增属性，必须使用 `Vue.set()` 或 `this.$set()` 才能触发视图更新。
+ **不能使用箭头函数**：`data` 函数中的 `this` 指向组件实例，箭头函数会丢失 `this` 绑定。

### 4. 避坑提醒
+ ❌ 不要在 `data` 中定义未使用的数据，会增加内存开销。
+ ✅ 对于已经在 `data` 中声明过的对象/数组属性，后续**替换整个引用**依然是响应式的，例如 `this.user = { ... }`。
+ ✅ 真正需要注意的是**后加属性**和部分数组变更场景：给对象新增属性要用 `Vue.set()` / `this.$set()`；直接通过下标改数组或修改 `length` 也有响应式限制。
+ ✅ 对于需要频繁变化的大对象，考虑使用 `computed` 派生，而不是在 `data` 中存储冗余数据。

---

## 二、props —— 接收父组件数据
### 1. 核心用法
`props` 用于声明组件期望从父组件接收的数据，实现父子组件通信。可以指定类型、默认值、是否必传等校验规则。

### 2. 完整示例（基础 + 进阶）
```javascript
export default {
  props: {
    // 基础写法：只指定类型
    title: String,
    // 完整写法：带默认值
    userInfo: {
      type: Object,
      default: () => ({})   // 对象/数组默认值必须用工厂函数返回
    },
    // 必传 + 自定义校验
    status: {
      type: String,
      required: true,
      validator(value) {
        return ['success', 'warning', 'error'].includes(value)
      }
    }
  },
  computed: {
    // 基于 props 计算派生值
    displayTitle() {
      return this.title ? this.title.toUpperCase() : '默认标题'
    }
  },
  watch: {
    // 监听 props 变化
    status(newVal) {
      console.log('status 变化了', newVal)
    }
  }
}
```

### 3. 关键特点
+ **单向数据流**：父组件通过 `props` 传递数据，子组件不能直接修改 `props`（应通过 `$emit` 触发事件让父组件修改）。
+ **类型校验**：支持 `String`、`Number`、`Boolean`、`Array`、`Object`、`Date`、`Function`、`Symbol`，以及自定义构造函数。
+ **默认值**：如果父组件未传，使用默认值。注意对象/数组的默认值必须用函数返回。
+ **可选 / 必填**：通过 `required` 控制。
+ **与 `computed` 联动**：常将 `props` 作为 `computed` 的依赖，生成展示用的数据。
+ **与 `watch` 联动**：可以在 `watch` 中监听 `props` 变化，执行副作用（如重置子组件内部状态）。

### 4. 避坑提醒
+ ❌ 不要直接修改 `props` 的值，会导致数据流混乱，且 Vue 会发出警告。
+ ✅ 若需要“转化” `props`，使用 `computed` 而不是在 `data` 中重新赋值。
+ ✅ 当 `props` 是对象/数组时，子组件如果修改其内部属性，父组件的数据也会变（引用类型共享），但这种做法不推荐，应当通过事件通信。

---

## 三、methods —— 组件方法
### 1. 核心用法
`methods` 用来定义组件内需要调用的函数，通常用于事件处理、业务逻辑封装、API 调用等。

### 2. 完整示例
```javascript
export default {
  data() {
    return {
      count: 0,
      remoteData: null,
      loading: false
    }
  },
  methods: {
    // 事件处理函数
    increment() {
      this.count++
      this.logCount()   // 调用另一个方法
    },
    // 复用的业务逻辑
    logCount() {
      console.log('当前 count:', this.count)
    },
    // 异步操作
    async fetchData() {
      this.loading = true
      const res = await axios.get('/api/data')
      this.remoteData = res.data
      this.loading = false
    }
  }
}
```

### 3. 关键特点
+ **访问组件实例**：方法中的 `this` 指向当前组件实例，可以访问 `data`、`props`、`computed` 和其他 `methods`。
+ **不能使用箭头函数**：箭头函数的 `this` 不指向组件实例，会导致无法访问组件数据。
+ **可以被模板调用**：在模板中直接绑定事件 `@click="increment"`。
+ **可以被 `computed` / `watch` 调用**：当逻辑需要复用时，`computed` 或 `watch` 内部可以调用 `methods` 中的方法。
+ **无缓存**：每次调用都会执行，不像 `computed` 有缓存。

### 4. 避坑提醒
+ ❌ 不要在 `methods` 中定义无副作用的纯计算函数，这类场景应该用 `computed`，否则每次模板渲染都会重复计算，影响性能。
+ ✅ 对于事件处理、异步请求、复杂修改多个数据的逻辑，放在 `methods` 中。
+ ✅ 如果多个组件需要共享相同的方法，考虑使用 `mixins` 或工具函数，而不是在每个组件中重复定义。

---

## 四、computed —— 计算属性
### 1. 核心用法
计算属性会基于已有的响应式数据动态计算出一个新值，并且具备缓存能力。只有它依赖的响应式数据发生变化时，才会重新计算。这里的依赖不仅可以来自 `data`，也可以来自 `props`、其他计算属性，甚至是 Vuex 中的响应式状态。

### 2. 完整示例（基础+进阶）
```html
<template>
  <div>
    <!-- 1. 基础用法：直接使用计算属性 -->
    <div>
      <p>原价：{{ price }} 元</p>
      <p>折扣价：{{ discountPrice }} 元</p>
    </div>
    <!-- 2. 复杂计算：数组过滤/统计 -->
    <div>
      <p>所有商品：{{ goodsList }}</p>
      <p>已售罄商品数量：{{ soldOutCount }}</p>
      <p>未售罄商品列表：{{ availableGoods }}</p>
    </div>
    <!-- 3. 计算属性的setter（很少用，默认只有getter） -->
    <div>
      <p>全名：{{ fullName }}</p>
      <button @click="setFullName">设置全名为“李四”</button>
    </div>
  </div>
</template>
<script>
export default {
  data() {
    return {
      price: 100, // 原价
      discount: 0.8, // 折扣
      goodsList: [
        { name: '手机', soldOut: false },
        { name: '耳机', soldOut: true },
        { name: '充电器', soldOut: false }
      ],
      firstName: '张',
      lastName: '三'
    }
  },
  computed: {
    // 1. 基础计算属性（只有getter，简写形式）只考虑读取，不考虑修改时。
    discountPrice() {
      // 依赖price和discount，只有这两个值变了，才会重新计算
      return (this.price * this.discount).toFixed(2);
    },

    // 2. 数组统计类计算属性
    soldOutCount() {
      return this.goodsList.filter(item => item.soldOut).length;
    },
    availableGoods() {
      return this.goodsList.filter(item => !item.soldOut);
    },

    // 3. 带setter的计算属性（完整写法）
    fullName: {
      // getter：获取值（默认只写这个）
      get() {
        return this.firstName + this.lastName;
      },
      // setter：设置值（手动修改计算属性时触发）
      set(newValue) {
        // 比如传入“李四”，拆分给firstName和lastName
        const [first, last] = newValue.split('');
        this.firstName = first;
        this.lastName = last;
      }
    }
  },
  methods: {
    setFullName() {
      // 调用计算属性的setter
      this.fullName = '李四';
    }
  }
}
</script>

```

### 3. 计算属性的关键特点
+ **缓存**：比如多次使用{{ discountPrice }}，只要price和discount不变，只会计算一次；
+ **响应式**：依赖的数据变化，计算属性会自动更新；
+ **不能异步**：计算属性的函数里不能写异步代码（比如axios请求），因为异步无法返回值；
+ **优先用getter简写**：99%的场景只需要getter，直接写函数即可，不用写完整的get/set。
+ (1) 计算属性需要使用新的配置项：computed
+ (2) 计算属性通过vm.$data，vm._data是无法访问的。
+ (3) 计算属性的getter/setter方法中的this是vm。
+ (4) 计算属性的getter方法的调用时机：
    - ① 第一个时机：初次访问该属性。
    - ② 第二个时机：计算属性所依赖的数据发生变化时。
+ (5) 计算属性的setter方法的调用时机：
    - ① 当计算属性被修改时。（在setter方法中通常是修改属性，因为只有当属性值变化时，计算属性的值就会联动更新。注意：计算属性的值被修改并不会联动更新属性的值。）
+ (6) 计算属性没有真正的值，每一次都是依赖data属性计算出来的。
+ (7) 计算属性的getter和setter方法不能使用箭头函数，因为箭头函数的this不是vm，而是window。

---

## 五、watch —— 监听属性

### 1. 核心用法
`watch` 用来监听某个响应式数据的变化，并在变化后执行一段逻辑，比如发请求、修改其他数据、执行异步操作。它既可以监听 `data`，也可以监听 `props`、`computed`，还可以通过路径写法监听多级属性。

+ i. 可以监视Vue的原有属性
+ ii. 如果监视的属性具有多级结构，一定要添加单引号：'a.b'
+ iii. 无法直接监视对象深层次属性，如a.b，b属性压根不存在。
+ iv. 启用深度监视，默认是不开启深度监视的。
+ v. 也可以监视计算属性

如何后期添加监视：

1. 调用 API：`vm.$watch('number2', {})`

### 2. 完整示例（基础+进阶）
```html
<body>
  <div id="app">
    <h1>{{msg}}</h1>
    数字：<input type="text" v-model="number" /><br />
    数字：<input type="text" v-model="a.b" /><br />
    数字：<input type="text" v-model="a.c" /><br />
    数字：<input type="text" v-model="a.d.e.f" /><br />
    数字(后期添加监视)：<input type="text" v-model="number2" /><br />
  </div>
  <script>
    const vm = new Vue({
      el: "#app",
      data: {
        msg: "侦听属性的变化",
        // 原有属性
        number: 0,
        //   多层次属性
        a: {
          b: 0,
          c: 0,
          d: {
            e: {
              f: 0,
            },
          },
        },
        number2: 0,
      },
      // 计算属性
      computed: {
        hehe() {
          return "haha" + this.number;
        },
      },
      watch: {
        //1、可以监视多个属性，监视哪个属性，请把这个属性的名字拿过来即可。
        //1.1 可以监视Vue的原有属性
        /* number : {
          // 控制是否在侦听器初始化时立即执行一次 handler
          immediate : true,
          // 这里有一个固定写死的方法，方法名必须叫做：handler
          // handler方法什么时候被调用呢？当被监视的属性发生变化的时候，handler就会自动调用一次。
          // handler方法上有两个参数：第一个参数newValue，第二个参数是oldValue
          // newValue是属性值改变之后的新值。
          // oldValue是属性值改变之前的旧值。
          handler(newValue, oldValue){
            console.log(newValue, oldValue)
            // this是当前的Vue实例。
            // 如果该函数是箭头函数，这个this是window对象。不建议使用箭头函数。
            console.log(this)
          }
        }, */
        //1.2 如果监视的属性具有多级结构，一定要添加单引号：'a.b'
        /* 'a.b' : {
          handler(newValue, oldValue){
            console.log('@')
          }
        },
        'a.c' : {
          handler(newValue, oldValue){
            console.log('@')
          }
        }, */
        // 无法监视b属性，因为b属性压根不存在。
        /* b : {
          handler(newValue, oldValue){
            console.log('@')
          }
        } */
        //1.3 启用深度监视，默认是不开启深度监视的。
        a: {
          // 什么时候开启深度监视：当你需要监视一个具有多级结构的属性，并且监视所有的属性，需要启用深度监视。
          deep: true,
          handler(newValue, oldValue) {
            console.log("@");
          },
        },
        //1.4 也可以监视计算属性
        /* hehe : {
          handler(a , b){
            console.log(a, b)
          }
        } */
        //2、 监视某个属性的时候，也有简写形式，什么时候启用简写形式？
        // 当只有handler回调函数的时候，可以使用简写形式。
        number(newValue, oldValue) {
          console.log(newValue, oldValue);
        },
      },
    });
    //3、 如何后期添加监视？调用Vue相关的API即可。
    //3.1 语法：vm.$watch('被监视的属性名', {})
    /* vm.$watch('number2', {
      immediate : true,
      deep : true,
      handler(newValue, oldValue){
        console.log(newValue, oldValue)
      }
    }) */
    //3.2 这是后期添加监视的简写形式。
    vm.$watch("number2", function (newValue, oldValue) {
      console.log(newValue, oldValue);
    });
  </script>
</body>

```

### 3. watch的关键配置
| 配置项 | 作用 | 适用场景 |
| --- | --- | --- |
| `deep` | 监听对象/数组的内部属性变化 | 监听复杂类型（对象/数组） |
| `immediate` | 页面初始化时就执行一次handler | 初始化就要触发的逻辑（如默认搜索） |
| `handler` | 数据变化时执行的函数（核心） | 所有watch场景 |


---

## 六、五者协作关系总结
| 场景 | 推荐使用的配置项 | 原因 |
| --- | --- | --- |
| 定义内部状态 | `data` | 存储可变数据，Vue 自动响应式 |
| 接收外部数据 | `props` | 父→子通信，单向数据流 |
| 事件处理 / 业务逻辑 | `methods` | 可复用、无缓存，适合异步/复杂操作 |
| 基于已有数据派生 | `computed` | 有缓存，依赖自动追踪 |
| 数据变化后执行副作用 | `watch` | 适合异步、复杂逻辑、深度监听 |


**协作示例**：

```javascript
export default {
  props: ['userId'],              // 外部传入
  data() {
    return { userInfo: null }     // 内部存储
  },
  computed: {
    displayName() {               // 派生展示名
      return this.userInfo?.name || '匿名'
    }
  },
  watch: {
    userId: {                     // 监听props变化
      immediate: true,
      handler(val) {
        this.fetchUser(val)       // 调用methods
      }
    }
  },
  methods: {
    async fetchUser(id) {         // 异步逻辑
      const res = await api.getUser(id)
      this.userInfo = res.data
    }
  }
}
```

---

## 总结
1. **五大核心配置项**：`data`、`props`、`methods`、`computed`、`watch` 覆盖了组件开发中数据定义、外部输入、行为封装、派生计算、副作用响应的完整流程。
2. **`computed` 和 `watch` 是难点**：前者用于“计算值”，后者用于“响应变化做事情”；能使用 `computed` 的场景优先使用，`watch` 负责 `computed` 无法处理的异步或复杂逻辑。
3. **其他配置项**（如生命周期、components、mixins 等）属于扩展功能，可在此基础上按需补充。
