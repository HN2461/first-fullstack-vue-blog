---
title: "第 4 篇：Element Plus 表单体系：Form、Input、Select、DateTimePicker、Upload"
slug: "element-plus-elementplus-form-input-select-datetimepicker-upload-7fbe719b"
summary: "基于 2026-04-28 查阅的 Element Plus 官方文档，详细讲解 Form、Input、Select、DateTimePicker、Upload 这些表单核心组件在真实后台页面中的组合方式。"
category: "ElementPlus"
categoryPath:
  - "前端技术"
  - "组件库"
  - "ElementPlus"
tags:
  - "input"
  - "Element Plus"
  - "Form"
  - "Select"
  - "Upload"
status: "published"
sortOrder: 40
cover: ""
originalId: "6a2d291f8a2b1c68f2cac65e"
originalSlug: "element-plus-elementplus-form-input-select-datetimepicker-upload-7fbe719b"
originalStatus: "published"
publishedAt: "2026-04-28T13:45:18.642Z"
updatedAt: "2026-07-31T11:16:23.592Z"
exportedAt: "2026-08-03T03:03:53.296Z"
---
# 第 4 篇：Element Plus 表单体系：Form、Input、Select、DateTimePicker、Upload

> 主人如果说 Button 是页面的动作层，  
> 那 Form 相关组件就是后台系统最核心的业务输入层。
>
> 绝大多数中后台页面，绕不开这些东西：
>
> - 筛选表单
> - 新建表单
> - 编辑表单
> - 上传附件
> - 选择时间范围

这一篇我们就专门把这块拆开讲。

---

## 一、先把 Form 当成“组织者”

很多人一上来就先学 `Input`、`Select`。

但在 Element Plus 里，更应该先理解：

**`el-form` 是整套输入系统的组织者。**

它负责的事情包括：

- 表单数据组织
- 标签布局
- 校验规则
- 尺寸继承
- 错误提示
- 提交与重置

如果只会单独用输入框，而不会把它们放进 Form 里，实际业务开发会很乱。

---

## 二、Form 最核心的几项能力

官方 Form 文档里，最关键的属性基本就是这些：

- `model`
- `rules`
- `label-position`
- `label-width`
- `inline`
- `status-icon`
- `scroll-to-error`
- `disabled`
- `size`

### 1. `model`

这是整个表单的数据对象。

```vue
<script setup>
import { reactive } from 'vue'

const form = reactive({
  name: '',
  category: '',
  dateRange: [],
  remark: ''
})
</script>
```

### 2. `prop`

每个 `el-form-item` 要和 `model` 里的字段对上。

```vue
<el-form :model="form">
  <el-form-item label="项目名称" prop="name">
    <el-input v-model="form.name" />
  </el-form-item>
</el-form>
```

如果主人后面要用：

- `validate`
- `resetFields`

那 `prop` 不能乱写。

官方文档明确说了：

- `prop` 可以是字段路径
- 比如 `a.b.0`
- 或 `['a', 'b', '0']`

这对复杂表单很重要。

---

## 三、先看一个最常见的业务表单壳子

```vue
<script setup>
import { reactive, ref } from 'vue'

const formRef = ref()

const form = reactive({
  name: '',
  type: '',
  period: [],
  remark: ''
})

const rules = {
  name: [{ required: true, message: '请输入项目名称', trigger: 'blur' }],
  type: [{ required: true, message: '请选择项目类型', trigger: 'change' }],
  period: [{ required: true, message: '请选择时间范围', trigger: 'change' }]
}

async function handleSubmit() {
  if (!formRef.value) return

  const valid = await formRef.value.validate()
  if (!valid) return

  console.log('submit', form)
}

function handleReset() {
  formRef.value?.resetFields()
}
</script>

<template>
  <el-form
    ref="formRef"
    :model="form"
    :rules="rules"
    label-width="100px"
    status-icon
  >
    <el-form-item label="项目名称" prop="name">
      <el-input v-model="form.name" placeholder="请输入项目名称" />
    </el-form-item>

    <el-form-item label="项目类型" prop="type">
      <el-select v-model="form.type" placeholder="请选择类型" style="width: 100%">
        <el-option label="官网" value="website" />
        <el-option label="后台" value="admin" />
        <el-option label="活动页" value="campaign" />
      </el-select>
    </el-form-item>

    <el-form-item label="时间范围" prop="period">
      <el-date-picker
        v-model="form.period"
        type="datetimerange"
        range-separator="至"
        start-placeholder="开始时间"
        end-placeholder="结束时间"
        style="width: 100%"
      />
    </el-form-item>

    <el-form-item label="备注" prop="remark">
      <el-input
        v-model="form.remark"
        type="textarea"
        maxlength="200"
        show-word-limit
        placeholder="请输入备注"
      />
    </el-form-item>

    <el-form-item>
      <el-button type="primary" @click="handleSubmit">提交</el-button>
      <el-button @click="handleReset">重置</el-button>
    </el-form-item>
  </el-form>
</template>
```

这一段已经很接近真实后台编辑页了。

---

## 四、Form 校验要会的几个重点

### 1. `validate`

官方文档里写得很明确：

- `validate` 可以接回调
- 也可以返回 `Promise`

所以现在更常见的写法是：

```js
const valid = await formRef.value.validate()
```

### 2. `resetFields`

这是表单重置最常用的方法。

```js
formRef.value?.resetFields()
```

它不只是把值清掉，还会移除校验结果。

### 3. `clearValidate`

适合局部清理错误态：

```js
formRef.value?.clearValidate(['name', 'type'])
```

### 4. `scroll-to-error`

官方 Form API 里有这个很实用的能力：

- 当校验失败时
- 自动滚动到第一个错误表单项

```vue
<el-form
  :model="form"
  :rules="rules"
  scroll-to-error
>
```

这个对长表单特别有价值。

### 5. `status-icon`

官方文档里专门拿它配自定义校验做示例。

它的作用是：

- 在输入框里显示校验结果图标

表单比较正式时可以开，但也别全局乱开。

---

## 五、Form 里几个容易忽略但很值钱的细节

### 1. 尺寸继承

官方文档明确写了：

- Form 内部子组件会继承 Form 的 `size`
- `form-item` 也有自己的 `size`
- 单独组件也可以覆盖

也就是说：

```vue
<el-form size="small">
```

会影响里面很多输入控件。

### 2. 嵌套 `el-form-item`

官方有一个提示：

- 当一个 `el-form-item` 嵌套在另一个 `el-form-item` 里时
- 它的标签宽度会变成 `0`

如果真要这么嵌套，记得自己单独设：

- `label-width`

### 3. `validate-event`

官方文档提到一个很实用的点：

如果你不想某些输入型组件跟着输入事件频繁触发校验，可以给组件设：

```vue
<el-input v-model="form.name" :validate-event="false" />
```

这个在实时输入很长内容时会更安静。

### 4. 新版初始值能力

官方 API 里还给了：

- `setInitialValues` `2.13.1`

它的意思是：

- 可以重新设置“重置时回到哪一版初始值”

这在“编辑页打开后回填数据，再点重置回到已加载内容而不是空表单”这种场景很有用。

---

## 六、Input：别只会最基础的 v-model

官方 Input 文档里，主人最该掌握的是这些：

- `clearable`
- `show-password`
- `prefix-icon` / `suffix-icon`
- `formatter` / `parser`
- `maxlength`
- `show-word-limit`
- `type='textarea'`

### 1. 一键清空

```vue
<el-input
  v-model="keyword"
  clearable
  placeholder="请输入关键词"
/>
```

搜索栏里非常常见。

官方还提到：

- `2.13.4` 之后
- `textarea` 也支持 `clearable`

### 2. 密码输入

```vue
<el-input
  v-model="password"
  type="password"
  show-password
  placeholder="请输入密码"
/>
```

### 3. 字数限制

```vue
<el-input
  v-model="remark"
  type="textarea"
  maxlength="200"
  show-word-limit
  placeholder="请输入备注"
/>
```

官方还补了两个细节：

- `2.11.5` 开始可以用 `word-limit-position='outside'`
- `2.13.7` 新增 `count-graphemes`

### 4. `count-graphemes` 是什么

官方最新发布里，`2.13.7` 对 Input 的新特性之一就是：

- `add count-graphemes`

这个能力适合更准确地统计文本长度。

主人先不用把它想太深，先记成：

**新版 Input 在字数统计上又进了一步。**

### 5. 格式化输入

官方文档还有：

- `formatter`
- `parser`

这很适合：

- 金额输入
- 百分比输入
- 带分隔符的展示输入

比如输入框里看起来是格式化的值，但真正绑定的数据是干净值。

---

## 七、Select：后台筛选和表单里最常见的选择器

官方 Select 文档里有一个很容易踩的版本变化：

- `2.5.0` 之后
- `el-select` 默认宽度改成了 `100%`
- 在内联场景下可能显示异常

所以你经常会看到这种写法：

```vue
<el-select
  v-model="form.type"
  placeholder="请选择"
  style="width: 240px"
>
```

### 1. 最基础单选

```vue
<el-select v-model="form.type" placeholder="请选择类型" style="width: 100%">
  <el-option label="官网" value="website" />
  <el-option label="后台" value="admin" />
</el-select>
```

### 2. 多选

```vue
<el-select
  v-model="form.tags"
  multiple
  collapse-tags
  placeholder="请选择标签"
  style="width: 100%"
>
  <el-option label="紧急" value="urgent" />
  <el-option label="长期" value="long-term" />
</el-select>
```

### 3. 搜索和远程搜索

官方文档里很重要的一组能力是：

- `filterable`
- `remote`
- `remote-method`
- `loading`

这很适合做：

- 人员选择
- 城市选择
- 大量数据的模糊搜索下拉

### 4. `default-first-option`

官方也提到：

- 开启后按回车时
- 可以直接选中当前候选列表第一个

这对高频录入场景体验很好。

---

## 八、DateTimePicker：时间范围是后台页面的高频需求

官方 DateTimePicker 文档说明得很清楚：

- 它是 Date Picker 和 Time Picker 的组合

### 1. 最常见场景：范围时间

```vue
<el-date-picker
  v-model="form.period"
  type="datetimerange"
  range-separator="至"
  start-placeholder="开始时间"
  end-placeholder="结束时间"
  style="width: 100%"
/>
```

### 2. 默认绑定值是什么

官方文档强调：

- 默认情况下
- 组件接受并返回 `Date` 对象

### 3. 如果你想拿字符串

用：

- `value-format`

```vue
<el-date-picker
  v-model="form.period"
  type="datetime"
  value-format="YYYY-MM-DD HH:mm:ss"
/>
```

这个很重要。

因为后端接口经常不直接要 `Date` 对象。

### 4. 范围选择的默认时间

官方文档还提到：

- `datetimerange` 默认拿到起止日期的 `00:00:00`
- 可以用 `default-time` 控制默认时刻

这在“活动开始结束时间”这种场景里很常见。

### 5. 快捷选项

官方也支持 `shortcuts`。

适合做：

- 最近 7 天
- 最近 30 天
- 本月
- 上月

这对筛选表单特别实用。

---

## 九、Upload：上传不是一个按钮，是一整套状态

官方 Upload 文档里最值得先掌握的是：

- `action`
- `v-model:file-list`
- `limit`
- `on-exceed`
- `on-preview`
- `on-remove`
- `before-remove`

### 1. 基础上传

```vue
<el-upload
  v-model:file-list="fileList"
  action="/api/upload"
  :limit="3"
>
  <el-button type="primary">上传文件</el-button>
</el-upload>
```

### 2. 限制数量

```vue
<el-upload
  :limit="1"
  :on-exceed="handleExceed"
>
```

这个适合：

- 头像
- 封面图
- 单个附件

### 3. 删除前拦截

官方示例里就用了：

- `before-remove`

这很适合在删除文件前弹确认。

### 4. 列表管理

有了 `v-model:file-list`，你就能更清楚地知道：

- 已上传了什么
- 当前列表状态是什么

上传组件真正麻烦的不是“选文件”，而是：

- 状态同步
- 失败处理
- 预览
- 删除

Upload 帮你把这层框架搭好了。

---

## 十、把它们组合成一个像真实后台的表单

下面给主人一个更贴近真实业务的组合例子。

```vue
<script setup>
import { reactive, ref } from 'vue'

const formRef = ref()
const fileList = ref([])

const form = reactive({
  title: '',
  category: '',
  period: [],
  desc: ''
})

const rules = {
  title: [{ required: true, message: '请输入标题', trigger: 'blur' }],
  category: [{ required: true, message: '请选择分类', trigger: 'change' }],
  period: [{ required: true, message: '请选择时间范围', trigger: 'change' }]
}
</script>

<template>
  <el-form
    ref="formRef"
    :model="form"
    :rules="rules"
    label-width="100px"
    scroll-to-error
  >
    <el-form-item label="标题" prop="title">
      <el-input
        v-model="form.title"
        clearable
        maxlength="50"
        show-word-limit
        placeholder="请输入标题"
      />
    </el-form-item>

    <el-form-item label="分类" prop="category">
      <el-select
        v-model="form.category"
        placeholder="请选择分类"
        style="width: 100%"
      >
        <el-option label="官网" value="website" />
        <el-option label="活动页" value="campaign" />
        <el-option label="后台系统" value="admin" />
      </el-select>
    </el-form-item>

    <el-form-item label="时间" prop="period">
      <el-date-picker
        v-model="form.period"
        type="datetimerange"
        range-separator="至"
        start-placeholder="开始时间"
        end-placeholder="结束时间"
        style="width: 100%"
      />
    </el-form-item>

    <el-form-item label="附件">
      <el-upload
        v-model:file-list="fileList"
        action="/api/upload"
        :limit="2"
      >
        <el-button type="primary" plain>上传附件</el-button>
      </el-upload>
    </el-form-item>

    <el-form-item label="说明">
      <el-input
        v-model="form.desc"
        type="textarea"
        maxlength="200"
        show-word-limit
        placeholder="请输入说明"
      />
    </el-form-item>
  </el-form>
</template>
```

这就是典型中后台“新建 / 编辑”页面的核心形态。

---

## 十一、主人最容易踩的坑

### 1. `el-form-item` 不写 `prop`

这样很多校验和重置能力都会变弱。

### 2. Select 不设宽度

尤其在内联表单里，很容易看起来怪怪的。

### 3. DateTimePicker 默认值类型理解错

默认是 `Date`，不是字符串。

要字符串就自己写 `value-format`。

### 4. 上传只关心按钮，不关心文件列表状态

实际业务里真正要处理的是：

- 上传成功
- 上传失败
- 删除
- 预览
- 超出数量

### 5. 表单重置只自己把字段设空

很多时候更应该先试：

```js
formRef.value?.resetFields()
```

因为它会一起清校验态。

---

## 十二、这一篇学完后你应该会什么

学完这篇，主人应该能做到：

1. 用 Form 把输入组件组织起来
2. 写基础校验和提交重置
3. 用 Input 做搜索、备注、密码、字数限制
4. 用 Select 做单选、多选、远程搜索
5. 用 DateTimePicker 做时间点和时间范围
6. 用 Upload 管理附件列表

这几项已经覆盖了大部分后台表单场景。

---

## 十三、官方资料入口

- Form：
  - [https://element-plus.org/zh-CN/component/form.html](https://element-plus.org/zh-CN/component/form.html)
- Input：
  - [https://element-plus.org/zh-CN/component/input.html](https://element-plus.org/zh-CN/component/input.html)
- Select：
  - [https://element-plus.org/zh-CN/component/select](https://element-plus.org/zh-CN/component/select)
- DateTimePicker：
  - [https://element-plus.org/zh-CN/component/datetime-picker.html](https://element-plus.org/zh-CN/component/datetime-picker.html)
- Upload：
  - [https://element-plus.org/zh-CN/component/upload](https://element-plus.org/zh-CN/component/upload)

---

## 十四、最后一句话总结

Element Plus 的表单体系不是“几个输入框拼起来”。

它更像是一套有组织的输入框架：

- `Form` 负责结构和规则
- `Input`、`Select`、`DateTimePicker`、`Upload` 负责具体输入能力

把这层理解清楚了，后台页面的录入和筛选就顺很多。
