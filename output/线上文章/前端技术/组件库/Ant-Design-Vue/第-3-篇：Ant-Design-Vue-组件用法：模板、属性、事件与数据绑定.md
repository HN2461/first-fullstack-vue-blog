---
title: "第 3 篇：Ant Design Vue 组件用法：模板、属性、事件与数据绑定"
slug: "ant-design-vue-template-props-events-data-binding"
summary: "用 Vue 3 JavaScript 示例讲清 Ant Design Vue 组件标签、动态属性、事件、v-model、插槽和受控数据流，并组合成一个可理解的查询表单。"
category: "Ant Design Vue"
categoryPath:
  - "前端技术"
  - "组件库"
  - "Ant Design Vue"
tags:
  - "Ant Design Vue"
  - "Vue3"
  - "模板语法"
  - "数据绑定"
  - "表单"
status: "published"
sortOrder: 30
cover: ""
originalId: "6ae0a8dad7963ed85be766ad"
originalSlug: "ant-design-vue-template-props-events-data-binding"
originalStatus: "published"
publishedAt: "2026-10-27T13:36:26.423Z"
updatedAt: "2026-10-27T13:36:26.462Z"
exportedAt: "2026-10-27T13:37:05.301Z"
---
# 第 3 篇：Ant Design Vue 组件用法：模板、属性、事件与数据绑定

安装好组件库之后，重点不是死记每个组件的名字，而是学会“页面数据怎样传给组件，用户操作怎样回到页面”。这篇先认识 Vue 模板，再用输入框、选择器、按钮和表格拼出一个小型查询区。

## 一、组件标签就是 Vue 模板中的积木

Vue 单文件组件通常包含三部分：

- `<template>`：描述页面结构。
- `<script setup>`：声明数据和事件处理函数。
- `<style>`：编写样式。

Ant Design Vue 组件通过标签放入模板。若采用上一篇的自动导入方案，可以直接写 `<a-button>`；若使用全量引入，也可以这样写。标签能否识别取决于注册方式，不是 HTML 浏览器本身认识 `a-button`。

## 二、静态属性与动态属性

静态属性传入固定文本：

```vue
<a-button type="primary">保存</a-button>
```

动态属性前的冒号是 `v-bind` 的简写。它会把 JavaScript 表达式的结果传给组件，而不是把表达式当字符串：

```vue
<a-button :loading="saving" :disabled="!canSave">
  保存
</a-button>
```

如果 `saving` 是布尔值 `true`，按钮会进入加载状态；如果 `canSave` 为假，`disabled` 就会收到 `true`。初学时最容易犯的错误是写成 `loading="saving"`，那传递的是文字，而不是响应式变量。

## 三、监听事件：用户操作回到自己的代码

`@` 是 `v-on` 的简写：

```vue
<a-button type="primary" @click="save">保存</a-button>
```

用户点击时 Vue 调用 `save`。函数里可以校验数据、调用接口、更新状态。组件只发出操作信号，不会自动把数据保存进服务器。

不要写 `@click="save()"` 和 `@click="save"` 一概认为完全相同。两者多数简单场景都能工作，但传函数引用通常更直观；需要传额外参数时再写表达式，例如 `@click="remove(row.id)"`。

## 四、`v-model` 是一组数据同步约定

原生输入框的 `v-model` 让输入值与变量双向同步。组件也提供类似接口，但不同组件绑定的属性可能不同。

Ant Design Vue 常见写法：

```vue
<a-input v-model:value="keyword" placeholder="输入关键词" />
<a-select v-model:value="status" placeholder="选择状态">
  <a-select-option value="draft">草稿</a-select-option>
  <a-select-option value="published">已发布</a-select-option>
</a-select>
<a-checkbox v-model:checked="includeArchived">包含归档</a-checkbox>
```

这里输入框和选择器用 `value`，复选框用 `checked`。冒号前的 `v-model:` 表示绑定指定名称的模型。不要因为原生 `<input>` 常写 `v-model="x"`，就推断所有 UI 组件的模型属性都叫 `modelValue`。遇到无法更新时，先查该组件 API 的 `v-model` 说明。

在 JavaScript 中准备这些状态：

```js
import { reactive, ref } from 'vue'

const keyword = ref('')
const status = ref(undefined)
const includeArchived = ref(false)

const query = reactive({
  page: 1,
  pageSize: 10
})
```

`ref` 常用于基本值，脚本中读取或赋值要通过 `.value`；模板会自动解包，所以模板里直接写 `keyword`。`reactive` 常用于对象，脚本和模板访问字段时通常直接用 `query.page`。

## 五、插槽：把自己的内容放进组件预留位置

组件标签里的普通内容通常是默认插槽：

```vue
<a-button>新增文章</a-button>
```

命名插槽用 `#插槽名` 写法。例如卡片标题区域可以写成：

```vue
<a-card>
  <template #title>文章查询</template>
  <p>这里放页面内容</p>
</a-card>
```

表格的自定义列也是常用插槽场景。表格行、列配置的具体 API 较多，第一次学习应复制对应版本的官方示例，确认插槽收到的 `record`、`text` 等参数是什么，不要凭名称猜数据结构。

## 六、组合成一个查询工具条

下面例子演示输入、选择、复选框、查询和重置。它把 UI 状态和查询动作分开：

```vue
<script setup>
import { reactive, ref } from 'vue'
import { message } from 'ant-design-vue'

const keyword = ref('')
const status = ref(undefined)
const includeArchived = ref(false)
const query = reactive({
  page: 1,
  pageSize: 10
})

function search() {
  query.page = 1
  message.info(`查询条件：${keyword.value || '全部'}，状态：${status.value || '不限'}`)
}

function reset() {
  keyword.value = ''
  status.value = undefined
  includeArchived.value = false
  query.page = 1
}
</script>

<template>
  <a-space wrap>
    <a-input
      v-model:value="keyword"
      allow-clear
      placeholder="文章标题"
      style="width: 220px"
    />

    <a-select
      v-model:value="status"
      allow-clear
      placeholder="全部状态"
      style="width: 160px"
    >
      <a-select-option value="draft">草稿</a-select-option>
      <a-select-option value="published">已发布</a-select-option>
    </a-select>

    <a-checkbox v-model:checked="includeArchived">包含归档</a-checkbox>
    <a-button type="primary" @click="search">查询</a-button>
    <a-button @click="reset">重置</a-button>
  </a-space>
</template>
```

这段代码中的 `message.info` 使用静态 API 演示反馈。简单提示可以这样写；需要提示继承 `ConfigProvider` 的主题或上下文时，后续第 5 篇会说明为什么要通过 `App.useApp()` 获取实例。

真实业务的 `search()` 通常会把条件传给 API，并根据响应更新表格数据。不要在查询框输入时误以为数据已经自动过滤；过滤逻辑需要由当前页面实现，或交给服务端查询。

## 七、Form 组件和普通绑定的关系

简单筛选工具条可以分别用 `v-model` 控制字段。新增或编辑数据时，通常需要 `a-form`、`a-form-item` 承载标签、校验规则和错误提示。表单 API 有自己的模型和校验流程：

```vue
<a-form :model="formState">
  <a-form-item label="标题" name="title">
    <a-input v-model:value="formState.title" />
  </a-form-item>
</a-form>
```

`:model` 告诉表单整体数据对象是什么，`name` 用于关联字段和校验规则，输入框依然通过 `v-model:value` 更新数据。完整校验写法请以 [Form 官方文档](https://www.antdv.com/components/form-cn) 的当前 API 为准。

## 八、排查“值没有更新”的顺序

1. 看绑定属性名是否正确，例如 `value` 还是 `checked`。
2. 确认 `ref` 在模板里用变量名，脚本赋值时用 `.value`。
3. 看是否给 `v-model` 同时写了一个冲突的静态 `value`。
4. 如果用了 `:value` 单向传入，检查是否也监听了对应更新事件并回写数据。
5. 查看当前版本该组件的官方 API 和示例。

## 九、官方资料

- [组件总览](https://www.antdv.com/components/overview-cn)
- [Button 按钮](https://www.antdv.com/components/button-cn)
- [Input 输入框](https://www.antdv.com/components/input-cn)
- [Select 选择器](https://www.antdv.com/components/select-cn)
- [Form 表单](https://www.antdv.com/components/form-cn)
- [Table 表格](https://www.antdv.com/components/table-cn)
