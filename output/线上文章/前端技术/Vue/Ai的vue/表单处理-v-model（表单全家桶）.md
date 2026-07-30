---
title: "表单处理 v-model（表单全家桶）"
slug: "vue-ai-vue-v-model-c66bd182"
summary: ""
category: "Ai的vue"
categoryPath:
  - "前端技术"
  - "Vue"
  - "Ai的vue"
tags: []
status: "published"
sortOrder: 240
cover: ""
originalId: "6a2d291e8a2b1c68f2cac28a"
originalSlug: "vue-ai-vue-v-model-c66bd182"
originalStatus: "published"
publishedAt: "2026-02-02T13:03:47.571Z"
updatedAt: "2026-06-19T06:25:09.350Z"
exportedAt: "2026-07-30T16:02:06.145Z"
---
# 第7章 表单处理 v-model（表单全家桶）

> 目标：掌握 Vue2 表单数据绑定的核心：`v-model`。
> 
> - 理解 `v-model` 的本质（语法糖）
> - 掌握 input/textarea/select/radio/checkbox 的绑定写法
> - 掌握 `.lazy` `.trim` `.number` 修饰符
> - 完成一个小型表单实战（含校验思路）

---

## 7.1 `v-model` 的本质（语法糖：value + input）

`v-model` 的作用可以理解为：

- **把表单控件的值同步到数据**（从视图到数据）
- **把数据同步回控件**（从数据到视图）

在普通文本输入框上，`v-model` 本质等价于：

```html
<input :value="text" @input="text = $event.target.value" />
```

也就是说：

- `:value` 负责把 `text` 显示到输入框
- `@input` 负责监听输入变化并更新 `text`

---

## 7.2 输入控件绑定

### 7.2.1 `input`

```html
<div id="app">
  <input v-model="username" placeholder="请输入用户名" />
  <p>你输入的是：{{ username }}</p>
</div>

<script src="https://cdn.jsdelivr.net/npm/vue@2/dist/vue.js"></script>
<script>
  new Vue({
    el: '#app',
    data: {
      username: ''
    }
  })
</script>
```

### 7.2.2 `textarea`

```html
<textarea v-model="desc" placeholder="请输入简介"></textarea>
<p>{{ desc }}</p>
```

### 7.2.3 `select`

```html
<select v-model="city">
  <option disabled value="">请选择城市</option>
  <option value="sh">上海</option>
  <option value="bj">北京</option>
  <option value="gz">广州</option>
</select>
<p>当前选择：{{ city }}</p>
```

```js
data: {
  city: ''
}
```

---

## 7.3 `radio`

单选的本质是：多个 radio 绑定同一个 `v-model`，value 不同。

```html
<div>
  <label>
    <input type="radio" value="male" v-model="gender" /> 男
  </label>
  <label>
    <input type="radio" value="female" v-model="gender" /> 女
  </label>
  <p>gender: {{ gender }}</p>
</div>
```

```js
data: {
  gender: 'male'
}
```

---

## 7.4 `checkbox`（单选/多选）

### 7.4.1 单个 checkbox（布尔值）

```html
<label>
  <input type="checkbox" v-model="agree" /> 我已阅读并同意
</label>
<p>agree: {{ agree }}</p>
```

```js
data: {
  agree: false
}
```

### 7.4.2 多个 checkbox（数组）

当你希望多选时，`v-model` 通常绑定数组：

```html
<div>
  <label><input type="checkbox" value="vue" v-model="skills" /> Vue</label>
  <label><input type="checkbox" value="react" v-model="skills" /> React</label>
  <label><input type="checkbox" value="ts" v-model="skills" /> TypeScript</label>

  <p>skills: {{ skills }}</p>
</div>
```

```js
data: {
  skills: []
}
```

---

## 7.5 修饰符：`.lazy` `.trim` `.number`

### 7.5.1 `.lazy`

默认情况下，`v-model` 在 `input` 事件时同步（你每打一个字就更新数据）。

`.lazy` 会改为在 `change` 时同步（通常是失焦或回车确认后）：

```html
<input v-model.lazy="username" placeholder="失焦后才更新" />
```

### 7.5.2 `.trim`

自动去掉首尾空格：

```html
<input v-model.trim="username" placeholder="自动去空格" />
```

### 7.5.3 `.number`

把输入的值尽量转成数字：

```html
<input v-model.number="age" type="number" />
<p>age: {{ age }}（类型：{{ typeof age }}）</p>
```

---

## 7.6 表单实战：注册/登录/搜索（含校验思路）

下面用一个小“注册表单”示例串起来（偏思路与写法）：

```html
<div id="app">
  <h2>注册</h2>

  <div>
    <label>用户名</label>
    <input v-model.trim="form.username" />
    <p v-if="errors.username" style="color:red">{{ errors.username }}</p>
  </div>

  <div>
    <label>年龄</label>
    <input type="number" v-model.number="form.age" />
    <p v-if="errors.age" style="color:red">{{ errors.age }}</p>
  </div>

  <div>
    <label>
      <input type="checkbox" v-model="form.agree" /> 同意协议
    </label>
    <p v-if="errors.agree" style="color:red">{{ errors.agree }}</p>
  </div>

  <button @click="submit">提交</button>

  <pre>{{ form }}</pre>
</div>

<script src="https://cdn.jsdelivr.net/npm/vue@2/dist/vue.js"></script>
<script>
  new Vue({
    el: '#app',
    data: {
      form: {
        username: '',
        age: null,
        agree: false
      },
      errors: {
        username: '',
        age: '',
        agree: ''
      }
    },
    methods: {
      validate() {
        const errors = { username: '', age: '', agree: '' }

        if (!this.form.username) errors.username = '用户名不能为空'
        if (this.form.age === null || this.form.age === '' || this.form.age <= 0) errors.age = '年龄需为正数'
        if (!this.form.agree) errors.agree = '请先同意协议'

        this.errors = errors
        return !errors.username && !errors.age && !errors.agree
      },
      submit() {
        if (!this.validate()) return
        alert('提交成功')
      }
    }
  })
</script>
```

这个例子重点体现：

- 数据统一放在 `form` 对象里，便于提交
- 校验结果放在 `errors` 对象里，渲染时条件显示
- 提交时先校验再执行后续逻辑

---

## 本章小结

- `v-model` 是 `:value` + `@input` 的语法糖（在不同控件上事件略有差异）。
- 文本输入、下拉框、单选、多选都有对应的绑定套路。
- `.lazy` `.trim` `.number` 能让表单体验更贴近真实业务。

**下一章预告**

第8章将从原理角度理解 Vue2 的响应式（`Object.defineProperty`）以及它的局限与解决方案。
