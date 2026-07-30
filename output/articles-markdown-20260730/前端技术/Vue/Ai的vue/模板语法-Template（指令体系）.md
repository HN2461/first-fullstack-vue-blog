---
title: "模板语法 Template（指令体系）"
slug: "vue-ai-vue-template-2bebc61d-revision-20260730"
summary: ""
category: "Ai的vue"
tags: []
status: "draft"
sortOrder: 270
cover: ""
originalId: "6a2d291e8a2b1c68f2cac284"
originalSlug: "vue-ai-vue-template-2bebc61d"
originalStatus: "published"
exportedAt: "2026-07-30T13:20:22.058Z"
---
# 第4章 模板语法 Template（指令体系）

> 目标：掌握 Vue2 模板里最常用的一组写法：
> 
> - 插值 `{{ }}`
> - 文本/HTML 渲染：`v-text` / `v-html`
> - 属性绑定：`v-bind` / `:`（含 class/style 绑定）
> - 事件绑定：`v-on` / `@`（含修饰符、按键修饰符）

---

## 4.1 插值表达式 `{{ }}` 的规则与限制

插值（Mustache）语法用来把数据渲染到文本位置：

```html
<div id="app">
  <p>用户名：{{ username }}</p>
  <p>积分：{{ score }}</p>
</div>
```

### 4.1.1 可以写什么

你可以在 `{{ }}` 里写**表达式**，例如：

```html
<p>{{ 1 + 2 }}</p>
<p>{{ username.toUpperCase() }}</p>
<p>{{ score >= 60 ? '及格' : '不及格' }}</p>
```

### 4.1.2 不能写什么

插值里不能写**语句**（例如 `if`、`for`、`var`/`let` 声明等），这会报错：

```html
<!-- 下面是错误示例 -->
<p>{{ if (score > 60) { 'ok' } }}</p>
<p>{{ let a = 1 }}</p>
```

### 4.1.3 常见小坑：空值与报错

当数据可能是 `null/undefined` 时，直接调用方法可能报错：

```html
<!-- username 为空时，toUpperCase 可能报错 -->
<p>{{ username.toUpperCase() }}</p>
```

建议在表达式里做兜底：

```html
<p>{{ (username || '').toUpperCase() }}</p>
```

---

## 4.2 文本/HTML 渲染

### 4.2.1 `v-text`

`v-text` 用于设置元素的 `textContent`：

```html
<p v-text="msg"></p>
```

它和下面效果相同：

```html
<p>{{ msg }}</p>
```

### 4.2.2 `v-html`

`v-html` 用于把字符串当作 HTML 插入：

```html
<div v-html="html"></div>
```

```js
data: {
  html: '<strong>高亮</strong> <em>强调</em>'
}
```

#### 安全提醒（非常重要）

`v-html` 存在 XSS 风险：

- 如果 `html` 的内容来自用户输入或不可信接口
- 恶意脚本可能被注入并执行

实践建议：

- 只有在你确定内容可信时才用 `v-html`
- 或者对 HTML 做严格的白名单清洗（后端/前端都可以做）

---

## 4.3 属性绑定

在 HTML 中，属性值通常是字符串：

```html
<img src="/logo.png" />
```

在 Vue 里，你经常需要把属性绑定到变量或表达式，这时用 `v-bind`：

```html
<img v-bind:src="imgUrl" />
```

`v-bind` 有简写形式 `:`：

```html
<img :src="imgUrl" />
```

### 4.3.1 class 绑定（对象/数组/表达式）

#### 1) 对象写法（最常用）

```html
<div :class="{ active: isActive, disabled: isDisabled }">按钮</div>
```

当 `isActive` 为 true 时添加 `active` 类。

#### 2) 数组写法

```html
<div :class="[baseClass, sizeClass]">卡片</div>
```

```js
data: {
  baseClass: 'card',
  sizeClass: 'card-lg'
}
```

#### 3) 组合写法

```html
<div :class="['card', { active: isActive }]">卡片</div>
```

### 4.3.2 style 绑定（对象/数组）

#### 1) 对象写法

```html
<div :style="{ color: textColor, fontSize: fontSize + 'px' }">文本</div>
```

#### 2) 数组写法（合并多个 style 对象）

```html
<div :style="[baseStyle, themeStyle]">文本</div>
```

---

## 4.4 事件绑定

事件绑定使用 `v-on` 或 `@`：

```html
<button v-on:click="inc">+1</button>
<button @click="inc">+1</button>
```

### 4.4.1 事件对象 `$event`

当你需要拿到事件对象时：

```html
<input @input="onInput" />
```

```js
methods: {
  onInput(e) {
    console.log(e.target.value)
  }
}
```

如果你需要同时传自定义参数和事件对象：

```html
<input @input="onInput2('username', $event)" />
```

```js
methods: {
  onInput2(field, e) {
    console.log(field, e.target.value)
  }
}
```

### 4.4.2 事件修饰符

修饰符用于把常见的 `event.preventDefault()`、`event.stopPropagation()` 等动作写得更声明式。

- `.stop`：阻止冒泡
- `.prevent`：阻止默认行为
- `.once`：只触发一次
- `.capture`：捕获阶段触发
- `.self`：只在事件源是自身时触发

示例：

```html
<a href="https://example.com" @click.prevent="go">点我但不跳转</a>

<div class="mask" @click="close">
  <div class="dialog" @click.stop>
    弹窗内容（点击这里不关闭）
  </div>
</div>
```

### 4.4.3 按键修饰符

按键修饰符常用于输入框回车提交等场景：

```html
<input @keyup.enter="submit" placeholder="回车提交" />
<input @keyup.esc="cancel" placeholder="ESC 取消" />
```

你也可以使用组合键（了解即可）：

```html
<input @keyup.ctrl.enter="submit" />
```

---

## 本章小结

- `{{ }}` 用于文本插值，只能写表达式，不能写语句。
- `v-text` 渲染纯文本，`v-html` 渲染 HTML（注意 XSS 风险）。
- `v-bind`/`:` 用于绑定属性，class/style 绑定是高频。
- `v-on`/`@` 绑定事件，修饰符能让交互代码更简洁。

**下一章预告**

第5章将学习条件渲染：`v-if/v-else-if/v-else` 与 `v-show` 的差异和最佳实践。
