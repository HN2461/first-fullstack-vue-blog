---
title: "第 6 篇：Ant Design Vue 表单校验与提交流程：从字段绑定到安全提交"
slug: "ant-design-vue-form-validation-submit"
summary: "面向 Vue 初学者，拆解 Ant Design Vue 4 表单的 model、Form.Item、规则校验、异步提交、错误处理和重置流程，并用完整示例串起一次真实的数据录入。"
category: "Ant Design Vue"
categoryPath:
  - "前端技术"
  - "组件库"
  - "Ant Design Vue"
tags:
  - "Ant Design Vue"
  - "Vue 3"
  - "Form"
  - "表单校验"
  - "前端开发"
status: "published"
sortOrder: 60
cover: ""
originalId: "6ae0a8dad7963ed85be766b0"
originalSlug: "ant-design-vue-form-validation-submit"
originalStatus: "published"
publishedAt: "2026-10-27T13:36:26.423Z"
updatedAt: "2026-10-27T13:36:26.493Z"
exportedAt: "2026-10-27T13:37:05.301Z"
---
# 第 6 篇：Ant Design Vue 表单校验与提交流程：从字段绑定到安全提交

表单不是一堆输入框的集合。一个可靠的表单要同时回答四个问题：输入值存在哪里、每个字段怎样和数据对应、什么时候显示错误、校验通过后怎样提交。本文用“创建知识库分类”的例子逐步回答这些问题。代码针对 Vue 3 和 Ant Design Vue 4.x 编写，表单校验 API 以 4.2.6 为准。

## 一、先认识表单中的三种角色

Ant Design Vue 表单主要由三个部分配合：

| 角色 | 在代码中的位置 | 负责什么 |
| --- | --- | --- |
| 表单数据 | `reactive` 创建的 `formState` | 保存用户当前输入的值 |
| 字段容器 | `<a-form-item name="name">` | 告诉表单字段对应哪个数据键，并显示标签、提示和校验错误 |
| 输入控件 | `<a-input v-model:value="formState.name" />` | 展示和修改具体字段值 |

可以把 `name` 看作表单字段的地址。`<a-form-item name="name">` 要和 `formState.name` 对上，否则表单不知道校验哪个字段，也无法正确重置它。输入框的 `v-model:value` 则把用户输入双向同步到该地址。

Ant Design Vue 4 使用 Vue 3 的具名 `v-model`。例如 Input 用 `v-model:value`，Modal 的显示状态用 `v-model:open`。不要把组件库的 `value`、`open` 属性误写成原生输入框的 `v-model`。

## 二、可直接放入页面的完整例子

假设项目已经按系列入门篇注册 Ant Design Vue 组件、导入 reset 样式，并在路由页面外层放置了 `<a-app>`。下面这个单文件组件包含名称、路径、说明和可见范围；提交时先做客户端规则校验，再模拟请求后端，成功后给出反馈，失败时保留输入内容。

```vue
<template>
  <a-card title="创建知识库分类" :bordered="false">
    <a-form
      ref="formRef"
      :model="formState"
      layout="vertical"
      :validate-trigger="['blur', 'change']"
      @finish="handleFinish"
      @finish-failed="handleFinishFailed"
    >
      <a-form-item
        name="name"
        label="分类名称"
        :rules="nameRules"
        has-feedback
      >
        <a-input
          v-model:value="formState.name"
          :maxlength="30"
          placeholder="例如：前端工程"
          allow-clear
        />
      </a-form-item>

      <a-form-item
        name="slug"
        label="访问标识"
        extra="只允许小写英文字母、数字和连字符，创建后会用于 URL。"
        :rules="slugRules"
      >
        <a-input
          v-model:value="formState.slug"
          :maxlength="40"
          placeholder="例如：frontend-engineering"
          allow-clear
        />
      </a-form-item>

      <a-form-item
        name="description"
        label="分类说明"
        :rules="descriptionRules"
      >
        <a-textarea
          v-model:value="formState.description"
          :maxlength="200"
          :rows="4"
          show-count
          placeholder="用一两句话说明此分类收录什么内容"
        />
      </a-form-item>

      <a-form-item name="visibility" label="可见范围" :rules="visibilityRules">
        <a-select
          v-model:value="formState.visibility"
          show-search
          option-filter-prop="label"
          :options="visibilityOptions"
          placeholder="请选择可见范围"
        />
      </a-form-item>

      <a-form-item>
        <a-space>
          <a-button type="primary" html-type="submit" :loading="submitting">
            创建分类
          </a-button>
          <a-button :disabled="submitting" @click="resetForm">
            重置
          </a-button>
        </a-space>
      </a-form-item>
    </a-form>
  </a-card>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { App as AntdApp } from 'ant-design-vue'

const { message } = AntdApp.useApp()

const formRef = ref()
const submitting = ref(false)

const formState = reactive({
  name: '',
  slug: '',
  description: '',
  visibility: undefined,
})

const nameRules = [
  { required: true, whitespace: true, message: '请输入分类名称' },
  { min: 2, max: 30, message: '分类名称长度应为 2 到 30 个字符' },
]

const slugRules = [
  { required: true, whitespace: true, message: '请输入访问标识' },
  {
    pattern: /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
    message: '请使用小写字母、数字，并用单个连字符分隔',
  },
]

const descriptionRules = [
  { max: 200, message: '说明不能超过 200 个字符' },
]

const visibilityRules = [
  { required: true, message: '请选择可见范围' },
]

const visibilityOptions = [
  { label: '公开', value: 'public' },
  { label: '仅登录用户', value: 'members' },
  { label: '仅自己可见', value: 'private' },
]

async function handleFinish(values) {
  submitting.value = true

  try {
    // 实际项目在这里调用后端接口；不要只在前端显示“成功”却不保存数据。
    await new Promise(resolve => window.setTimeout(resolve, 500))
    console.log('准备提交的已校验数据：', values)
    message.success('分类创建成功')
    formRef.value.resetFields()
  } catch (error) {
    console.error('创建分类失败：', error)
    message.error('创建失败，请检查网络后重试')
  } finally {
    submitting.value = false
  }
}

function handleFinishFailed({ values, errorFields }) {
  // 失败事件包含当前值和错误字段，可用于日志或聚焦首个错误项。
  console.info('表单校验未通过：', { values, errorFields })
}

function resetForm() {
  formRef.value?.resetFields()
}
</script>
```

此处的 `message` 已通过 `App.useApp()` 获得应用上下文，可继承正确层级中的 Provider 配置。组件树设置和调用边界见系列第 5 篇。

## 三、把模板逐块读懂

### `:model="formState"`

`a-form` 的 `model` 指向这张表单的数据对象。表单规则校验的值、提交事件收到的值，以及 `resetFields()` 回到的初始值，都围绕这份对象工作。它必须是对象，通常用 Vue 的 `reactive()` 创建。

### `layout="vertical"`

这是表单标签与控件的排列方式。垂直布局适合管理控制台的长表单，阅读顺序自然；横向布局会把标签放在控件左侧；内联布局适合很短的搜索条件，不适合堆很多字段。表单布局不会自动决定页面整体的栅格宽度。

### `name`、`rules` 和 `v-model:value`

以名称字段为例，`name="name"` 与 `formState.name` 同名。规则写在 `a-form-item` 上，是一个数组，因为一个字段可以有多条规则。`required` 检查是否填写，`whitespace` 让只有空格的内容也按空值处理，`min` 和 `max` 限制文本长度。Input 再用 `v-model:value` 更新同一个状态。

`maxlength` 是输入体验限制，规则中的 `max` 是表单校验。两者一起写，用户能在输入时看到限制，同时提交时还有校验保护。客户端校验改善体验，但不能代替后端校验；请求可以被绕过或伪造，服务端仍必须重新验证输入。

### `@finish` 与 `@finish-failed`

点击 `html-type="submit"` 的按钮会触发表单提交流程。全部规则通过后，表单才发出 `finish`，事件参数 `values` 是校验成功的数据。校验失败时发出 `finishFailed`，参数中包括当前 `values`、错误字段 `errorFields` 和 `outOfDate` 状态。

不要把接口请求放在没有校验保障的普通点击事件里，否则容易漏掉字段校验。若使用 `@finish`，组件库负责先校验再调用成功处理函数；若在其他业务流程中要主动校验，可通过表单 ref 调用 `validateFields()` 并处理 Promise。

### 异步提交与重复点击

`submitting` 在请求期间为 `true`，按钮显示 loading 并禁用重复提交。`finally` 无论请求成功还是失败都会执行，适合恢复 loading 状态。成功后是否清空数据要按业务决定：新建表单通常重置；编辑表单通常关闭面板或保留数据供用户确认；失败时一般保留输入，让用户能修正或重试。

例子用定时器模拟网络请求。真实代码应替换为项目 API，例如 `await createCategory(values)`，并根据后端返回处理冲突、权限不足、校验错误和服务不可用等情况。不能只捕获异常并显示“失败”，还应把可操作的错误提示告诉用户。

## 四、常用规则怎么选

| 规则 | 用途 | 例子 |
| --- | --- | --- |
| `required: true` | 必填 | 标题、分类 |
| `whitespace: true` | 不允许纯空白字符串充当必填值 | 名称、标题 |
| `min` / `max` | 字符串长度或数值边界 | 名称长度、数量范围 |
| `type: 'email'` | 邮箱格式 | 联系邮箱 |
| `pattern` | 固定格式 | slug、编号 |
| `trigger` | 指定何时校验 | `{ required: true, trigger: 'blur' }` |
| `validator` | 复杂或异步业务校验 | 重复名称、两次密码是否一致 |

规则会交给 async-validator 执行。`required` 只表示不能为空，并不自动保证字符串格式；邮箱字段可写 `{ type: 'email', message: '邮箱格式不正确' }`。正则表达式应按业务格式设计，错误文案应说明如何修正，不要只显示“校验失败”。自定义异步校验涉及 Promise/callback 约定，应先查看对应版本文档，避免混用两种返回方式。

## 五、选择器和表单字段的小细节

`a-select` 需要通过 `v-model:value` 绑定选中值。示例中的 `options` 是由 `label` 与 `value` 组成的选项数组，value 是提交给后端的稳定值，label 是给用户看的文字。`show-search` 让选项能搜索，`option-filter-prop="label"` 告诉组件按显示标签过滤。项目 UI 规范要求选择器默认可搜索，选项很少且产品明确不需要时再例外。

日期、上传、树选择等控件的数据形状各有不同。不要假设屏幕上显示的文本就是接口需要的格式：提交前应明确日期时区、文件 ID、树节点 ID 的转换逻辑。表单负责采集与基础校验，后端 schema 和 API contract 负责定义最终数据。

## 六、常见错误与排查

1. **错误信息不出现**：检查 `a-form` 是否传入 `:model`，`Form.Item` 是否有正确的 `name`，`name` 是否匹配 model 的键，输入是否绑定到同一属性。
2. **点击按钮直接刷新页面**：确认提交按钮是 `<a-button html-type="submit">`，而不是原生按钮默认提交行为；如果按钮用于取消或重置，明确设置 `html-type="button"`。
3. **清空后显示错误或数据没有恢复**：调用 `formRef.value.resetFields()`，并确保字段有 `name` 且 model 初始值定义明确。重置是恢复字段初值和清理校验状态，不是对后端撤销数据。
4. **规则只在点击后触发**：查看表单或字段的 `validateTrigger`。默认触发行为、`blur` 和 `change` 的选择会影响反馈时机；不必对每个输入都过早显示错误。
5. **前端校验通过但接口拒绝**：后端规则可能更严格或数据已冲突。把服务端错误转成字段级或表单级提示，并让用户保留已填内容。
6. **自定义组件不参与校验**：自定义控件需要正确接入表单值和触发更新的事件，或使用 Form.Item 的插槽/受控绑定方式，确保表单能够拿到该字段值。

## 七、官方资料

- [Ant Design Vue Form 中文文档](https://www.antdv.com/components/form-cn)
- [Ant Design Vue Input 中文文档](https://www.antdv.com/components/input-cn)
- [Ant Design Vue Select 中文文档](https://www.antdv.com/components/select-cn)
- [Vue 3 表单输入绑定](https://cn.vuejs.org/guide/essentials/forms.html)
- [async-validator](https://github.com/yiminghe/async-validator)

开发时请以项目锁定的 Ant Design Vue `4.2.6` 和官方 API 为准。组件库表单校验用于交互反馈，任何权限与数据合法性规则仍需由后端重新检查。
