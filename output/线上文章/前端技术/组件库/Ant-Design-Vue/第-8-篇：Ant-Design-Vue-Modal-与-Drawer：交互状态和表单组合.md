---
title: "第 8 篇：Ant Design Vue Modal 与 Drawer：交互状态和表单组合"
slug: "ant-design-vue-modal-drawer-form"
summary: "说明 Modal 和 Drawer 的场景差异、open 状态、异步确认、关闭与重置策略，并通过完整抽屉编辑示例处理校验、保存和滚动区域。"
category: "Ant Design Vue"
categoryPath:
  - "前端技术"
  - "组件库"
  - "Ant Design Vue"
tags:
  - "Ant Design Vue"
  - "Vue 3"
  - "Modal"
  - "Drawer"
  - "表单交互"
status: "published"
sortOrder: 80
cover: ""
originalId: "6ae0a8dad7963ed85be766b2"
originalSlug: "ant-design-vue-modal-drawer-form"
originalStatus: "published"
publishedAt: "2026-10-27T13:36:26.423Z"
updatedAt: "2026-10-27T13:36:26.510Z"
exportedAt: "2026-10-27T13:37:05.301Z"
---
# 第 8 篇：Ant Design Vue Modal 与 Drawer：交互状态和表单组合

Modal（模态框）和 Drawer（抽屉）都是临时浮层，但不应该只按外观选择。Modal 会把用户注意力集中到一个决定或短任务上；Drawer 从侧边展开，适合保留当前页面上下文，容纳较长的编辑表单或详情。无论选哪一种，都应明确：谁控制它的打开状态、提交过程中能否关闭、错误怎么显示、关闭后表单保留还是清空。

本文代码使用 Ant Design Vue 4 的 `open` 状态和 Vue 3 的 `v-model:open`。不要照抄旧教程中只用 `visible` 的写法。

## 一、什么时候用 Modal，什么时候用 Drawer

| 场景 | 更适合 | 原因 |
| --- | --- | --- |
| 删除确认、权限确认、简短选择 | Modal | 内容短、决策明确，需要用户先完成再返回 |
| 创建一条简单记录 | Modal | 字段少、流程短，提交后关闭即可 |
| 编辑较多字段或查看完整详情 | Drawer | 面板更宽，用户仍能感知列表上下文 |
| 分步骤的大型流程 | 独立页面或流程容器 | 浮层太长会让滚动和返回行为复杂 |

Modal 和 Drawer 都会形成遮罩与焦点区域。它们不是用来替代页面布局的“万能容器”。如果表单非常长，优先考虑独立编辑页面；如果放在浮层里，必须限制高度，让内部内容滚动，避免对话框延伸到视口底部之外。

## 二、Modal 的基础开关

最小示例展示受控打开状态：

```vue
<template>
  <a-button type="primary" @click="open = true">创建标签</a-button>

  <a-modal
    v-model:open="open"
    title="创建标签"
    ok-text="创建"
    cancel-text="取消"
    :mask-closable="false"
    @ok="createTag"
  >
    <a-form layout="vertical">
      <a-form-item label="标签名称">
        <a-input v-model:value="tagName" placeholder="例如：Vue 3" />
      </a-form-item>
    </a-form>
  </a-modal>
</template>

<script setup>
import { ref } from 'vue'

const open = ref(false)
const tagName = ref('')

async function createTag() {
  if (!tagName.value.trim()) return

  // 真实业务中，在这里等待创建接口完成，再关闭弹窗。
  open.value = false
}
</script>
```

`v-model:open` 将 `open` 变量与 Modal 的显示状态连接起来。给变量设为 `true` 就打开，设为 `false` 就关闭。Modal 的右上角关闭按钮、取消按钮、遮罩点击会触发关闭流程；`mask-closable="false"` 仅禁止点击遮罩关闭，仍应确保取消按钮和关闭按钮的行为符合当前任务。

这个最小例子只展示状态，不包含正式表单校验和接口失败处理。真正创建数据时，不要在空值时静默返回，应让 `a-form` 负责规则提示，并在接口成功后再关闭。

## 三、在 Drawer 中编辑记录：完整流程

下面以“文章快速编辑”为例。页面从列表点击编辑，给抽屉传入文章数据；抽屉打开时复制一份表单数据，避免尚未保存的输入直接改动列表对象；点击保存后先校验，再等待接口，成功关闭并提示，失败则保留输入。示例用延时模拟 API，实际接入时替换 `saveArticle`。

```vue
<template>
  <a-button type="primary" @click="openEditor">
    编辑示例文章
  </a-button>

  <a-drawer
    :open="drawerOpen"
    title="编辑文章"
    placement="right"
    :width="560"
    :mask-closable="false"
    :closable="!saving"
    :keyboard="!saving"
    :body-style="drawerBodyStyle"
    @update:open="handleOpenChange"
  >
    <a-form ref="formRef" :model="formState" layout="vertical">
      <a-form-item
        name="title"
        label="文章标题"
        :rules="[
          { required: true, whitespace: true, message: '请输入文章标题' },
          { max: 100, message: '标题不能超过 100 个字符' },
        ]"
      >
        <a-input
          v-model:value="formState.title"
          :maxlength="100"
          placeholder="请输入标题"
        />
      </a-form-item>

      <a-form-item
        name="summary"
        label="摘要"
        :rules="[{ max: 300, message: '摘要不能超过 300 个字符' }]"
      >
        <a-textarea
          v-model:value="formState.summary"
          :maxlength="300"
          :rows="6"
          show-count
          placeholder="用简短文字说明文章内容"
        />
      </a-form-item>

      <a-form-item name="status" label="状态">
        <a-select
          v-model:value="formState.status"
          show-search
          option-filter-prop="label"
          :options="statusOptions"
        />
      </a-form-item>
    </a-form>

    <template #footer>
      <a-space>
        <a-button :disabled="saving" @click="handleClose">取消</a-button>
        <a-button type="primary" :loading="saving" @click="saveChanges">
          保存
        </a-button>
      </a-space>
    </template>
  </a-drawer>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { App as AntdApp } from 'ant-design-vue'

const { message } = AntdApp.useApp()

const exampleArticle = {
  id: 'article-201',
  title: '使用 Vue 3 构建管理页面',
  summary: '介绍页面结构、组件拆分和状态组织。',
  status: 'draft',
}

const formRef = ref()
const drawerOpen = ref(false)
const saving = ref(false)
const formState = reactive({
  id: '',
  title: '',
  summary: '',
  status: 'draft',
})

const statusOptions = [
  { label: '草稿', value: 'draft' },
  { label: '已发布', value: 'published' },
]

const drawerBodyStyle = {
  maxHeight: 'calc(100vh - 180px)',
  overflowY: 'auto',
}

function openEditor() {
  Object.assign(formState, exampleArticle)
  drawerOpen.value = true
}

async function saveChanges() {
  try {
    const values = await formRef.value.validateFields()
    saving.value = true

    // 替换成项目 API：await updateArticle(formState.id, values)
    await new Promise(resolve => window.setTimeout(resolve, 500))
    console.log('已通过校验、等待保存的数据：', values)

    message.success('文章已保存')
    drawerOpen.value = false
  } catch (error) {
    if (error?.errorFields) {
      // 校验失败时，错误已显示在对应字段上，继续保持抽屉打开。
      return
    }

    console.error('保存文章失败：', error)
    message.error('保存失败，请检查网络后重试')
  } finally {
    saving.value = false
  }
}

function handleClose() {
  if (saving.value) return
  drawerOpen.value = false
}

function handleOpenChange(nextOpen) {
  // update:open 是受控状态入口；保存中拒绝所有关闭来源的 false 更新。
  if (saving.value && !nextOpen) return
  drawerOpen.value = nextOpen
}
</script>
```

### 逐步理解编辑状态

1. `exampleArticle` 是原始记录；`Object.assign(formState, exampleArticle)` 把当前记录复制进表单对象。这样输入框编辑的是页面自己的表单状态，不会在保存前直接修改原记录。
2. `drawerOpen` 是受控显示状态，`saving` 控制保存按钮的 loading。保存中隐藏右上角关闭按钮、禁用 Escape 关闭、忽略遮罩并禁用取消按钮；`@update:open` 处理器再拒绝关闭值，作为所有关闭入口的状态兜底。
3. `validateFields()` 会返回 Promise。校验通过时它解析为字段值；校验不通过时会以包含 `errorFields` 的错误拒绝。这里将两种情况分开处理：字段错误由表单显示，网络/API 错误由页面显示消息。
4. 只有请求成功才关闭抽屉。失败时不清空状态，因此用户可修改或重试。
5. `bodyStyle` 将滚动限制到抽屉正文区域，页头与页脚仍可见。复杂正文、长表单和预览图应放在有固定高度的内部容器里。

保存状态的赋值顺序也可以按团队习惯调整：表单校验期间是否显示 loading。当前示例先校验，再进入 loading，因此错误字段不会让按钮一直转圈。

## 四、Modal 和 Drawer 的重要属性

| 属性 | 作用 | 使用时留意 |
| --- | --- | --- |
| `open` | 当前是否显示；可用 `v-model:open` 绑定 | Ant Design Vue 4 使用 `open`，不要继续用旧版本 `visible` |
| `title` | 标题区域 | 用具体任务名，例如“编辑文章” |
| `width` | Drawer 宽度或 Modal 宽度 | 宽度要适应表单内容与屏幕尺寸 |
| `placement` | Drawer 展开方向 | 常见为 `right`，默认也是右侧 |
| `maskClosable` | 是否点击遮罩关闭 | 表单有未保存数据时应明确策略 |
| `confirmLoading` | Modal 确认按钮 loading | Drawer 自定义页脚时需给自己的按钮设置 `loading` |
| `destroyOnClose` | 关闭时卸载子内容 | 可重建干净状态，但仍要明确编辑数据如何初始化 |
| `bodyStyle` | 正文区域样式 | 可控制最大高度和内部滚动 |
| `footer` | 自定义页脚 | 设置插槽后自行提供取消、确认动作和按钮状态 |

Modal 默认 OK/Cancel 按钮会触发 `ok`/`cancel` 事件；不要在保存请求刚发出时立刻关闭。Drawer 本身没有同样的默认确认页脚，常见方式是在 `#footer` 插槽里放取消和提交按钮。

## 五、关闭、状态保留与确认离开

Modal 和 Drawer 关闭后，子组件的状态可能仍然保留。`destroyOnClose` 可在关闭时卸载子节点；不过如果页面需要编辑不同记录，最稳妥的方式仍是在打开时显式初始化表单，不要依赖上次组件恰好被销毁。

当用户有未保存修改时，需要设计“取消编辑”的语义：

- 简单管理表单可以直接关闭并丢弃草稿，但应清楚地提示或按产品规则处理。
- 编辑有较多内容时，检测 dirty 状态并在关闭前确认是否放弃。
- 保存过程中应禁用关闭路径或提供可靠取消请求机制，不能让 UI 关闭后后台请求结果仍悄悄改数据。

`maskClosable="false"` 只会避免误点遮罩关闭，不能单独阻止右上角关闭或 Escape。示例在保存时同时动态禁用 `closable` 和 `keyboard`，并使用受控的 `@update:open` 处理器拒绝 `false`，取消按钮也单独禁用。需要保护未保存修改时，也应将确认离开的判断放进这个统一的状态更新入口，覆盖所有尝试关闭的路径。

## 六、常见问题

1. **Modal/Drawer 内容太长，底部按钮看不到**：给正文设置最大高度并 `overflow-y: auto`；不要让图片列表或长表单撑开整个浮层。
2. **第二次打开仍有上次输入**：每次打开主动初始化表单，或在合适时机调用 `resetFields()`；确认 `destroyOnClose` 与数据加载顺序符合预期。
3. **校验失败也关闭了**：不要仅依赖默认 OK 点击。先 `validateFields()`，仅在校验和接口都成功后关闭。
4. **保存按钮一直 loading**：异步操作用 `try/catch/finally`，并确保 finally 释放状态。
5. **请求失败后用户数据丢失**：错误分支保留表单，不要先 reset 或关闭再请求。
6. **点击遮罩关闭但用户认为保存了**：明确关闭语义；对重要编辑任务关闭遮罩路径，并做好未保存提示。
7. **弹窗没有中文或当前暗色主题**：动态创建的静态 Modal API 可能拿不到调用点上下文；应用内浮层优先通过 `App.useApp()` 等上下文方式调用，组件式 Modal/Drawer 则放在正确的全局 Provider 下。

## 七、官方资料

- [Ant Design Vue Modal 中文文档](https://www.antdv.com/components/modal-cn)
- [Ant Design Vue Drawer 中文文档](https://www.antdv.com/components/drawer-cn)
- [Ant Design Vue Form 中文文档](https://www.antdv.com/components/form-cn)
- [Ant Design Vue App 中文文档](https://www.antdv.com/components/app-cn)
- [Ant Design Vue 4.2.6 Modal 示例源码](https://github.com/vueComponent/ant-design-vue/blob/4.2.6/components/modal/demo/form-in-modal.vue)

对话框中最关键的不是动画效果，而是任务边界：谁打开它、用户是否能关闭、数据何时保存、失败后如何恢复。把这四件事明确下来，组件属性就更容易选择。
