---
title: "第 02 篇：Vue 指令与自定义指令：v-bind、v-model、directive、钩子函数"
slug: "vue-vue-vue-011d0d19"
summary: "Vue指令的本质是给DOM元素绑定特定的行为逻辑，让页面能根据数据动态改变DOM的状态。本文详解Vue核心指令与自定义指令的完整用法。"
category: "vue辅助"
categoryPath:
  - "我的总结"
  - "Vue"
  - "vue辅助"
tags:
  - "Vue"
  - "指令"
  - "自定义指令"
  - "v-bind"
  - "v-model"
status: "published"
sortOrder: 20
cover: ""
originalId: "6a2d291f8a2b1c68f2cac48a"
originalSlug: "vue-vue-vue-011d0d19"
originalStatus: "published"
publishedAt: "2026-05-07T14:29:16.072Z"
updatedAt: "2026-07-31T11:16:24.578Z"
exportedAt: "2026-08-03T03:03:53.296Z"
---
### 一、指令的核心定义
Vue指令的本质是：**给DOM元素绑定特定的行为逻辑**，让页面能根据数据动态改变DOM的状态（比如显示/隐藏、绑定属性、循环渲染等）。<font style="color:#DF2A3F;">所有的指令都是以HTML标签的属性形式存在的。</font>  
指令的语法格式：`v-指令名:参数="表达式"`（参数和表达式根据指令不同，可选）。

### 二、Vue中最常用的核心指令（附完整示例）
下面用一个完整的Vue组件，演示最常用的指令用法，新手先掌握这些就足够：

```vue
<template>
  <div>
    <!-- 1. v-bind：绑定HTML属性（简写为:） -->
    <!-- 作用：将数据动态绑定到HTML元素的属性上（替代插值语法在属性中的错误用法） -->
    <input v-bind:value="username" placeholder="请输入用户名">
    <img :src="avatarUrl" alt="头像"> <!-- 简写形式，最常用 -->

    <!-- 2. v-on：绑定事件（简写为@） -->
    <!-- 作用：给元素绑定点击、输入等事件，触发methods中的方法 -->
    <button v-on:click="handleClick">点击按钮</button>
    <input @input="handleInput" placeholder="实时监听输入"> <!-- 简写形式 -->

    <!-- 3. v-if/v-else-if/v-else：条件渲染 -->
    <!-- 作用：根据表达式结果，决定是否渲染对应的DOM元素（元素会被创建/销毁）  
          底层实现：创建 / 销毁 DOM 元素
    -->
    <div v-if="score >= 90">优秀</div>
    <div v-else-if="score >= 80">良好</div>
    <div v-else>及格/不及格</div>
      
    <!-- 4. v-show：条件显示 -->
    <!-- 作用：根据表达式结果，控制元素的display属性（元素始终存在，只是隐藏） 
         底层实现：控制 CSS 的 display 属性  
    -->
    <div v-show="isShow">我是v-show控制的内容</div>
      
    <!-- 5. v-for：列表渲染 -->
    <!-- 作用：循环遍历数组/对象，生成重复的DOM元素 -->
    <!-- 语法：v-for="(item, index) in 数组" :key="唯一标识"（key必须加，提升性能） -->
    <ul>
      <li v-for="(item, index) in list" :key="index">
        {{ index + 1 }} - {{ item }}
      </li>
    </ul>
      
    <!-- 6. v-model：双向数据绑定 -->
    <!-- 作用：仅用于表单元素，实现“数据 ↔ 视图”双向同步（输入框改值，数据变；数据改，输入框值变） -->
    <input v-model="username" placeholder="双向绑定用户名">
  </div>
</template>
<script>
export default {
  data() {
    return {
      username: '张三',
      avatarUrl: 'https://example.com/avatar.jpg',
      score: 85,
      isShow: true,
      list: ['苹果', '香蕉', '橙子']
    }
  },
  methods: {
    handleClick() {
      alert('按钮被点击了！当前用户名：' + this.username);
    },
    handleInput(e) {
      console.log('实时输入内容：', e.target.value);
    }
  }
}
</script>

```

### 三、核心指令详解（新手重点）
#### 1. v-bind（最常用：绑定属性）
+ 作用：把数据绑定到HTML元素的任意属性（src、href、class、style、value等）；
+ 简写：`:`（比如 `:src="avatarUrl"` 等价于 `v-bind:src="avatarUrl"`）；
+ 场景：图片地址、链接地址、表单默认值、动态样式/类名等。

#### 2. v-on（绑定事件）
+ 作用：给元素绑定点击、输入、鼠标移动等事件，触发自定义方法；
+ **绑定的回调函数，如果函数调用时不需要传递任何参数，小括号**`()`**可以省略。默认传递事件对象**`**event**`**；**
+ 如需同时传递自定义参数和事件对象，使用 `$event`：`@click="handleClick(id, $event)"`；
+ 简写：`@`（比如 `@click="handleClick"` 等价于 `v-on:click="handleClick"`）；
+ 扩展：支持事件修饰符（如 `@click.stop` 阻止冒泡、`@input.trim` 自动去空格）。
+ `.prevent`：等同于`event.preventDefault()`，阻止事件的默认行为。
+ `.stop`：停止事件冒泡，等同于`event.stopPropagation()`。
+ `.capture`：添加事件监听器时使用事件捕获模式。
    - 添加事件监听器包括两种不同的方式：
        * 一种是从内到外添加（事件冒泡模式）。
        * 一种是从外到内添加（事件捕获模式）。
+ `.self`：这个事件如果是“我自己元素”上发生的事件，这个事件不是别人给我传递过来的事件，则执行对应的程序。
+ `.once`：事件只发生一次。
+ `.passive`：告诉浏览器该事件监听器不会阻止默认行为（不调用 `preventDefault()`），浏览器可立即执行默认行为（如滚动），无需等待 JS 执行完毕，提升滚动性能。常用于 `scroll`、`touchstart` 等事件。
+ **注意**：`.prevent` 与 `.passive` 是对立的，不可以共存（如果一起用，就会报错）。

#### 3. v-if vs v-show（条件控制）
| 指令 | 实现方式 | 适用场景 | 性能特点 |
| --- | --- | --- | --- |
| v-if | 创建/销毁DOM元素 | 条件很少变化（如权限控制） | 切换开销大，初始渲染小 |
| v-show | 修改display:none属性 | 频繁切换显示/隐藏 | 切换开销小，初始渲染大 |


#### 4. v-for（列表渲染）
+ 必加 `:key`：必须绑定唯一且稳定的标识（优先用数据的 `id` 或其他唯一字段），Vue 靠 key 识别元素，避免渲染错误；
+ **避坑**：仅在"列表仅用于展示且永不变化"时才可用 `index`；涉及增删改排序时，`index` 会导致状态错乱；
+ 遍历对象：`v-for="(value, key, index) in obj"`（value是值，key是属性名，index是索引）；
+ 注意：不要把v-if和v-for写在同一个元素上（性能差），优先用计算属性过滤数据后再循环。

#### 5. v-model（双向绑定）
+ **<font style="color:#DF2A3F;">仅适用于表单元素</font>**：input、textarea、select等； 普通元素（如 div、p）不能用；  
+ v-model:value="表达式" 简写为 v-model="表达式"
+ `<font style="color:rgb(0, 0, 0);background-color:rgba(0, 0, 0, 0);">v-model</font>` 本质是 `<font style="color:rgb(0, 0, 0);background-color:rgba(0, 0, 0, 0);">v-bind</font>` + `<font style="color:rgb(0, 0, 0);background-color:rgba(0, 0, 0, 0);">v-on</font>` 的语法糖：
  - `<input>` / `<textarea>`：绑定 `value` 属性 + 监听 `input` 事件
  - `<select>`：绑定 `value` 属性 + 监听 `change` 事件
  - `<input type="checkbox">` / `<input type="radio">`：绑定 `checked` 属性 + 监听 `change` 事件
+ v-bind是单向数据绑定：`data ===> 视图`
+ v-model是双向数据绑定：`data <===> 视图`
+ 核心特性：视图（输入框）改 → 数据自动变；数据（this.username）改 → 视图自动变；
+ 修饰符：`v-model.trim`（去空格）、`v-model.number`（转为数字）、`v-model.lazy`（失去焦点后同步）。

### 四、指令的通用规则
1. 指令的值必须是**表达式**（和插值语法一样），比如 `v-if="score >= 90"`、`:src="avatarUrl"`；
2. 指令是Vue特有的，只能用在Vue模板的HTML元素上，不能用在插值 `{{ }}` 里；
3. 指令会随数据响应式更新：比如 `v-if` 的表达式结果变了，DOM会自动更新。

### 总结
1. Vue指令是带 `v-` 前缀的特殊属性，核心作用是给DOM绑定动态行为，替代原生JS操作DOM；
2. 新手优先掌握：`v-bind(:)`、`v-on(@)`、`v-if/v-show`、`v-for`、`v-model` 这5个核心指令；
3. 指令的值是表达式，且支持响应式更新，这是Vue“数据驱动视图”的核心体现。
+ **<font style="color:#DF2A3F;">标签体中的内容需要动态时，使用插值语法。</font>**
+ **<font style="color:#DF2A3F;">HTML标签的属性需要动态时，使用指令语法。</font>**



### Vue 指令（文本渲染类）
#### 1. v-text
| 项⽬ | 说明 |
| --- | --- |
| **核心功能** | 覆盖填充标签内容，仅渲染纯文本，等同于 JavaScript 的 `innerText` 特性 |
| **核心特点** | 内容中若包含 HTML 标签，会按普通字符串原样展示，无 HTML 渲染风险 |
| **使用示例** | `<div v-text="message"></div>`（`message` 为 Vue 实例中的数据） |


#### 2. v-html
| 项⽬ | 说明 |
| --- | --- |
| **核心功能** | 覆盖填充标签内容，并解析渲染 HTML 内容，等同于 JavaScript 的 `innerHTML` 特性 |
| **核心特点** | 可渲染 HTML 结构，但存在安全风险 |
| **重要警告** | 禁止用于渲染用户提交的内容（如评论、表单输入等），极易引发 XSS 跨站脚本攻击，造成数据泄露等问题 |
| **使用示例** | `<div v-html="htmlContent"></div>`（`htmlContent` 为含 HTML 标签的字符串） |


#### 3. v-cloak
| 项⽬ | 说明 |
| --- | --- |
| **核心功能** | 解决页面加载初期 `{{ }}` 插值表达式“闪现”（未编译先显示）的问题 |
| **使用方式** | 1. 给目标元素添加指令：`<div v-cloak>{{ message }}</div>`   2. 配合 CSS：`[v-cloak] { display: none; }`   3. Vue 实例挂载并接管元素后，会自动移除该指令 |
| **核心原理** | 加载阶段通过 CSS 隐藏未编译的插值元素，Vue 编译完成后移除指令，元素正常显示 |


#### 4. v-once
| 项⽬ | 说明 |
| --- | --- |
| **核心功能** | 元素/组件仅渲染一次，后续数据更新时不再重新渲染，始终视为静态内容 |
| **核心价值** | 减少无用的 DOM 重渲染，提升 Vue 应用编译和渲染性能 |
| **使用示例** | `<div v-once>{{ staticMessage }}</div>`（`staticMessage` 变更后不刷新） |


#### 5. v-pre
| 项⽬ | 说明 |
| --- | --- |
| **核心功能** | 跳过 Vue 对当前元素及子元素的编译过程，直接展示原始内容 |
| **核心价值** | 减少编译工作量，加快整体编译速度 |
| **注意事项** | 不可用于包含 Vue 指令（如 `v-if`/`v-for`）或插值语法（`{{ }}`）的标签 |
| **使用示例** | `<div v-pre>{{ 不会被编译的内容 }}</div>`（页面直接显示 `{{ 不会被编译的内容 }}`） |


### 总结
1. **文本渲染核心差异**：`v-text` 仅渲染纯文本（安全），`v-html` 解析 HTML（有 XSS 风险，禁用用户内容）；
2. **性能/体验优化指令**：`v-cloak` 解决插值闪现，`v-once` 静态内容仅渲染一次，`v-pre` 跳过编译提升速度；
3. **关键禁忌**：`v-pre` 不可用于含 Vue 指令/插值的标签，`v-html` 禁止处理用户提交内容。

---

# 第 02 篇：Vue 指令与自定义指令：v-bind、v-model、directive、钩子函数
## 一、Vue2 自定义指令
### 1. 核心定义
自定义指令是 Vue 封装**通用 DOM 操作**的扩展能力，用于复用聚焦、输入限制、样式控制、权限控制等 DOM 操作逻辑。

### 2. 指令分类
| 类型 | 定义方式 | 适用范围 | 优先级 |
| --- | --- | --- | --- |
| 全局指令 | `Vue.directive('指令名', 配置)` | 所有组件 | 低 |
| 局部指令 | 组件内 `directives: { 指令名: 配置 }` | 仅当前组件 | 高（覆盖全局同名） |


### 3. 核心钩子（按触发顺序）
| 钩子名 | 触发时机 | 核心用途 | 注意点 |
| --- | --- | --- | --- |
| `bind` | 指令绑定到元素（未插入 DOM） | 初始化（绑事件、设基础样式） | **不能操作 DOM**（如聚焦、取宽高） |
| `inserted` | 元素插入页面（父 DOM 中） | 操作 DOM 本身（聚焦、取位置） | **唯一能确保 DOM 存在**的核心钩子 |
| `update` | 组件 VNode 更新时 | 数据变化需更新指令逻辑 | 此时组件 DOM 可能未更新，避免操作 DOM |
| `componentUpdated` | 组件 VNode 及子 VNode 更新后 | DOM 更新后操作 | 可安全操作更新后的 DOM |
| `unbind` | 指令解绑（元素移除） | 清理（移除事件、清定时器） | 必须清理，避免内存泄漏 |


### 4. 核心参数（钩子函数入参）
+ `el`：指令绑定的 DOM 元素（可直接操作）。
+ `binding`：指令信息对象，包含：
    - `value`：指令绑定的值（如 `v-color="'red'"` 中的 `'red'`）。
    - `oldValue`：指令绑定的旧值（仅 `update`/`componentUpdated` 钩子可用）。
    - `arg`：指令参数（如 `v-color:bg` 中的 `bg`）。
    - `modifiers`：指令修饰符对象（如 `v-color:bg.lazy` 中的 `{ lazy: true }`）。
    - `expression`：指令表达式的字符串形式（如 `v-color="colorVal"` 中的 `"colorVal"`）。
    - `name`：指令名（不含 `v-` 前缀，如 `v-color` 的 `name` 是 `"color"`）。
+ `vnode`：Vue 编译生成的虚拟节点。
+ `oldVnode`：上一个虚拟节点（仅 `update`/`componentUpdated` 钩子可用）。

### 5. 写法
#### （1）局部自定义指令（组件内）
##### ① 完整钩子写法（推荐初学）
```vue
<template>
  <input v-focus>
</template>
<script>
export default {
  name: 'Demo',
  directives: {
    focus: {
      bind(el, binding) {
        console.log('指令绑定', binding.value)
      },
      inserted(el) {
        el.focus() // 插入 DOM 时自动聚焦
      },
      update(el, binding) {
        if (binding.oldValue !== binding.value) {
          console.log('指令值更新', binding.value)
        }
      },
      unbind(el) {
        console.log('指令解绑')
      }
    }
  }
}
</script>

```

##### ② 简写形式（`bind`/`update` 逻辑相同时）
```vue
<template>
  <div v-font-size="20">文字</div>
</template>
<script>
export default {
  directives: {
    'font-size'(el, binding) {
      // 同时在 bind 和 update 时触发
      el.style.fontSize = binding.value + 'px'
    }
  }
}
</script>

```

#### （2）全局自定义指令（整个项目可用）
```javascript
// main.js
import Vue from 'vue'

// 全局指令：v-focus
Vue.directive('focus', {
  inserted(el) {
    el.focus()
  }
})

// 全局简写
Vue.directive('font-size', (el, binding) => {
  el.style.fontSize = binding.value + 'px'
})
```

### 6. 典型实战场景
#### （1）输入框自动聚焦
```javascript
Vue.directive('focus', {
  inserted(el) {
    el.focus()
  }
})
```

#### （2）限制输入数字（含修饰符处理）
```javascript
Vue.directive('number-only', {
  bind(el, binding) {
    const handleInput = (e) => {
      // 修饰符 .integer：仅允许整数
      if (binding.modifiers.integer) {
        e.target.value = e.target.value.replace(/[^\d]/g, '')
      } else {
        // 默认允许小数
        e.target.value = e.target.value.replace(/[^\d.]/g, '')
      }
    }
    el.addEventListener('input', handleInput)
    // 保存事件引用，供 unbind 清理
    el._handleInput = handleInput
  },
  unbind(el) {
    el.removeEventListener('input', el._handleInput)
  }
})
```

使用：

```vue
<input v-number-only> <!-- 允许小数 -->
<input v-number-only.integer> <!-- 仅允许整数 -->
```

#### （3）自定义样式（支持参数）
```javascript
Vue.directive('style', {
  bind(el, binding) {
    // binding.arg 是样式属性，如 v-style:color="'red'"
    el.style[binding.arg] = binding.value
  }
})
```

使用：

```vue
<div v-style:color="'blue'" v-style:fontSize="'20px'">文字</div>
```

---

## 二、Vue3 自定义指令（核心改动）
Vue3 对自定义指令的改动核心是：**对齐组件生命周期、简化钩子语义、适配组合式 API**。

### 1. 最核心：钩子函数重命名 & 语义化
| Vue2 钩子 | Vue3 钩子 | 触发时机（通俗解释） |
| --- | --- | --- |
| `bind` | `beforeMount` | 指令绑定到元素上（元素未挂载到 DOM） |
| `inserted` | `mounted` | 元素挂载到 DOM 后（最常用，操作 DOM 核心） |
| `update` | `beforeUpdate` | 组件更新前（元素本身没更新） |
| `componentUpdated` | `updated` | 组件更新后（元素已更新） |
| `unbind` | `unmounted` | 指令从元素上解绑（元素被销毁） |


> **关键变化**：Vue3 移除了 `update` 和 `componentUpdated` 的模糊区分，完全对齐组件生命周期，更易理解。
>

### 2. 注册方式变化（适配 Vue3 应用实例）
#### （1）全局指令注册
```javascript
// main.js
import { createApp } from 'vue'
import App from './App.vue'

const app = createApp(App)

// 全局指令注册
app.directive('focus', {
  mounted(el) {
    el.focus()
  }
})

// 全局简写（mounted + updated 逻辑一致时）
app.directive('font-size', (el, binding) => {
  el.style.fontSize = binding.value + 'px'
})

app.mount('#app')
```

#### （2）局部指令注册
Vue3 分**选项式 API** 和 **组合式 API（**`<script setup>`**）** 两种写法。

##### ① 选项式 API（与 Vue2 几乎一致，仅改钩子名）
```vue
<template>
  <div v-text-color="'red'"></div>
</template>
<script>
export default {
  directives: {
    'text-color': {
      mounted(el, binding) {
        el.style.color = binding.value
      }
    }
  }
}
</script>

```

##### ② 组合式 API（`<script setup>`）
> **核心规则**：setup 中局部指令名必须以 `v` 开头（如 `vTextColor`），模板中仍用短横线 `v-text-color`，Vue 会自动映射。
>

```vue
<template>
  <div v-text-color="'blue'">文字</div>
  <button v-debounce="handleClick">防抖点击</button>
  <input v-number-only.integer v-model="num">
</template>
<script setup>
import { ref } from 'vue'

const num = ref('')

// 1. 完整钩子写法
const vTextColor = {
  mounted(el, binding) {
    el.style.color = binding.value
  },
  updated(el, binding) {
    if (binding.oldValue !== binding.value) {
      el.style.color = binding.value
    }
  }
}

// 2. 简写形式（mounted + updated 逻辑一致时）
const vDebounce = (el, binding) => {
  let timer = null
  el.addEventListener('click', () => {
    clearTimeout(timer)
    timer = setTimeout(() => {
      binding.value() // 执行传入的函数
    }, 1000)
  })
  
  // 保存清理函数，供 unmounted 使用
  el._cleanup = () => {
    clearTimeout(timer)
    el.removeEventListener('click', el._cleanup)
  }
}

// 3. 含修饰符、unmounted 清理的完整示例
const vNumberOnly = {
  mounted(el, binding) {
    const handleInput = (e) => {
      if (binding.modifiers.integer) {
        e.target.value = e.target.value.replace(/[^\d]/g, '')
      } else {
        e.target.value = e.target.value.replace(/[^\d.]/g, '')
      }
    }
    el.addEventListener('input', handleInput)
    el._handleInput = handleInput
  },
  unmounted(el) {
    el.removeEventListener('input', el._handleInput)
  }
}

// 回调函数
const handleClick = () => {
  console.log('防抖点击生效')
}
</script>

```

### 3. 其他重要差异
#### （1）`binding` 对象增强
+ 新增 `binding.instance`：指令所在的组件实例。
  - 选项式 API：可访问 `data`、`methods`、`props` 等
  - 组合式 API（`<script setup>`）：可访问 `setup` 中定义的响应式变量和函数（需通过 `defineExpose` 暴露）

```javascript
app.directive('log', {
  mounted(el, binding) {
    console.log('组件数据：', binding.instance.msg)
  }
})
```

+ `oldValue` 仅在 `beforeUpdate`/`updated` 钩子中可用（更严谨）。

#### （2）多根节点组件支持
Vue2 中自定义指令绑定到多根节点组件时，仅作用于第一个根节点；Vue3 需通过 `v-bind="$attrs"` 显式指定指令作用的根节点：

```vue
<!-- 子组件（多根节点） -->
<template>
  <div v-bind="$attrs">根节点1（接收指令）</div>
  <div>根节点2</div>
</template>

```

#### （3）简写形式逻辑变化
+ Vue2 简写：`bind` + `update` 触发。
+ Vue3 简写：`mounted` + `updated` 触发（与新钩子对齐）。

---

## 三、Vue2 → Vue3 指令迁移完整指南
### 1. 迁移步骤
| 步骤 | 操作 | 示例 |
| --- | --- | --- |
| 1 | 全局指令：将 `Vue.directive` 改为 `app.directive` | 见上文 Vue3 全局注册 |
| 2 | 钩子重命名：按对应关系替换钩子名 | `bind` → `beforeMount`，`inserted` → `mounted`，`unbind` → `unmounted` |
| 3 | 补充 `unmounted` 清理逻辑 | Vue3 更强调内存泄漏防护，务必在 `unmounted` 中移除事件/定时器 |
| 4 | 组合式 API 迁移：局部指令加 `v` 前缀 | 见上文 `<script setup>` 写法 |


### 2. 迁移避坑示例
#### Vue2 防抖指令（旧写法）
```javascript
// Vue2
Vue.directive('debounce', {
  bind(el, binding) {
    let timer = null
    el.addEventListener('click', () => {
      clearTimeout(timer)
      timer = setTimeout(() => binding.value(), 1000)
    })
  }
})
```

#### Vue3 防抖指令（迁移后）
```javascript
// Vue3
app.directive('debounce', {
  mounted(el, binding) { // 1. 替换钩子名
    let timer = null
    const handleClick = () => {
      clearTimeout(timer)
      timer = setTimeout(() => binding.value(), 1000)
    }
    el.addEventListener('click', handleClick)
    el._handleClick = handleClick // 保存引用供清理
  },
  unmounted(el) { // 2. 新增清理钩子
    el.removeEventListener('click', el._handleClick)
  }
})
```

---

## 四、最佳实践
1. **命名规范**：指令名使用短横线命名法（如 `v-my-directive`），避免与 HTML 原生属性冲突。
2. **作用域控制**：优先使用局部指令，仅通用工具类指令（如 `v-focus`、`v-permission`）注册为全局。
3. **内存泄漏防护**：务必在 `unbind`（Vue2）/`unmounted`（Vue3）中移除事件监听器、清理定时器。
4. **避免复杂逻辑**：自定义指令仅用于 DOM 操作，复杂业务逻辑应放在组件方法或 Composable 中。
5. **组合式 API 优先**：Vue3 项目中推荐使用 `<script setup>` 写法，更简洁且符合 Vue3 设计理念。

---
