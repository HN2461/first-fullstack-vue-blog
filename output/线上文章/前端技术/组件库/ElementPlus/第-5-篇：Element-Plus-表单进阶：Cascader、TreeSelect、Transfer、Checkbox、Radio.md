---
title: "第 5 篇：Element Plus 表单进阶：Cascader、TreeSelect、Transfer、Checkbox、Radio"
slug: "element-plus-elementplus-cascader-treeselect-transfer-checkbox-radio-switch-slide-c87f0cab"
summary: "基于 2026-04-29 查阅的 Element Plus 官方文档，系统讲解表单里的高级录入组件：级联选择、树形选择、穿梭框、多选组、单选组、开关、滑块、评分的用法与联动校验。"
category: "ElementPlus"
categoryPath:
  - "前端技术"
  - "组件库"
  - "ElementPlus"
tags:
  - "Element Plus"
  - "Cascader"
  - "TreeSelect"
  - "Transfer"
  - "Checkbox"
  - "Radio"
  - "Switch"
status: "published"
sortOrder: 50
cover: ""
originalId: "6a2d291f8a2b1c68f2cac63c"
originalSlug: "element-plus-elementplus-cascader-treeselect-transfer-checkbox-radio-switch-slide-c87f0cab"
originalStatus: "published"
publishedAt: "2026-04-29T11:27:17.329Z"
updatedAt: "2026-07-31T11:16:23.599Z"
exportedAt: "2026-08-03T10:17:08.920Z"
---
# 第 5 篇：Element Plus 表单进阶：Cascader、TreeSelect、Transfer、Checkbox、Radio

> 主人第四篇讲了表单体系的核心：Form、Input、Select、DateTimePicker、Upload。  
> 但真实后台里，表单录入场景远不止这些。
>
> 这一篇补全剩下的高级录入组件：
>
> - 有层级关系的数据怎么选
> - 树形结构怎么选
> - 两列互相转移怎么做
> - 多选、单选、开关、滑块、评分怎么用

---

## 一、先理解这些组件的共同点

这一篇的组件，有一个共同特征：

**它们都是"选择"，而不是"输入"。**

用户不需要手动打字，而是从给定的选项里做出选择。

所以它们的核心问题都是：

- 数据从哪来
- 选中后怎么绑定
- 怎么和 Form 校验配合

---

## 二、Cascader：有层级关系的数据选择

官方 Cascader 文档里最核心的概念是：

- `options`：层级数据，每项有 `value`、`label`、`children`
- `v-model`：绑定选中路径数组
- `props`：自定义字段名映射

### 1. 最基础的用法

```vue
<script setup>
import { ref } from 'vue'

const value = ref([])

const options = [
  {
    value: 'beijing',
    label: '北京',
    children: [
      { value: 'chaoyang', label: '朝阳区' },
      { value: 'haidian', label: '海淀区' }
    ]
  },
  {
    value: 'shanghai',
    label: '上海',
    children: [
      { value: 'pudong', label: '浦东新区' },
      { value: 'jing_an', label: '静安区' }
    ]
  }
]
</script>

<template>
  <el-cascader v-model="value" :options="options" placeholder="请选择地区" />
</template>
```

`v-model` 绑定的是路径数组，比如选了"北京 > 朝阳区"，值是 `['beijing', 'chaoyang']`。

### 2. 自定义字段名

如果接口返回的字段不是 `value/label/children`：

```vue
<el-cascader
  v-model="value"
  :options="options"
  :props="{ value: 'id', label: 'name', children: 'sub' }"
/>
```

### 3. 只选最后一级

默认情况下，选中任意一级都会触发。

如果只想选叶子节点：

```vue
<el-cascader :props="{ checkStrictly: false }" />
```

如果想让每一级都可以独立选中：

```vue
<el-cascader :props="{ checkStrictly: true }" />
```

### 4. 多选

```vue
<el-cascader :props="{ multiple: true }" v-model="values" :options="options" />
```

多选时 `v-model` 是二维数组，每个选中项是一个路径数组。

### 5. 懒加载

数据量大时，可以按需加载子节点：

```vue
<script setup>
function lazyLoad(node, resolve) {
  const { level, value } = node
  // 模拟异步加载
  setTimeout(() => {
    const nodes = [
      { value: `${value}-1`, label: `子节点 1`, leaf: level >= 2 },
      { value: `${value}-2`, label: `子节点 2`, leaf: level >= 2 }
    ]
    resolve(nodes)
  }, 500)
}
</script>

<template>
  <el-cascader :props="{ lazy: true, lazyLoad }" />
</template>
```

---

## 三、TreeSelect：树形结构的单选或多选

官方 TreeSelect 文档里最核心的概念是：

- `data`：树形数据
- `v-model`：绑定选中值
- `multiple`：是否多选
- `show-checkbox`：是否显示复选框
- `node-key`：节点唯一标识字段

### 1. 基础用法

```vue
<script setup>
import { ref } from 'vue'

const value = ref(null)

const treeData = [
  {
    id: 1,
    label: '技术部',
    children: [
      { id: 11, label: '前端组' },
      { id: 12, label: '后端组' }
    ]
  },
  {
    id: 2,
    label: '产品部',
    children: [
      { id: 21, label: '设计组' }
    ]
  }
]
</script>

<template>
  <el-tree-select
    v-model="value"
    :data="treeData"
    node-key="id"
    :props="{ label: 'label', children: 'children' }"
    placeholder="请选择部门"
  />
</template>
```

### 2. 多选

```vue
<el-tree-select
  v-model="values"
  :data="treeData"
  node-key="id"
  multiple
  show-checkbox
  placeholder="请选择部门（可多选）"
/>
```

### 3. 只选叶子节点

```vue
<el-tree-select
  v-model="value"
  :data="treeData"
  node-key="id"
  check-strictly
/>
```

### 4. Cascader 和 TreeSelect 怎么选

| 场景 | 推荐 |
|------|------|
| 地区、分类等有明确层级路径 | Cascader |
| 组织架构、权限树等树形结构 | TreeSelect |
| 需要展示完整路径 | Cascader |
| 需要多选且层级复杂 | TreeSelect |

---

## 四、Transfer：两列互相转移

官方 Transfer 文档里最核心的概念是：

- `data`：所有可选数据
- `v-model`：右侧已选数据的 key 数组
- `titles`：左右两列的标题
- `filterable`：是否可搜索

### 1. 基础用法

```vue
<script setup>
import { ref } from 'vue'

const selected = ref([1, 3])

const allData = Array.from({ length: 10 }, (_, i) => ({
  key: i + 1,
  label: `选项 ${i + 1}`,
  disabled: i === 4
}))
</script>

<template>
  <el-transfer
    v-model="selected"
    :data="allData"
    :titles="['待选', '已选']"
  />
</template>
```

### 2. 可搜索

```vue
<el-transfer
  v-model="selected"
  :data="allData"
  filterable
  :filter-placeholder="'搜索'"
/>
```

### 3. 自定义渲染

```vue
<el-transfer v-model="selected" :data="allData">
  <template #default="{ option }">
    <span>{{ option.label }}</span>
    <el-tag size="small" type="info">{{ option.type }}</el-tag>
  </template>
</el-transfer>
```

Transfer 适合：

- 权限分配
- 角色成员管理
- 批量选择并归类

---

## 五、Checkbox：多选组

官方 Checkbox 文档里最核心的几个概念：

- `el-checkbox`：单个复选框
- `el-checkbox-group`：复选框组，配合 `v-model` 使用
- `el-checkbox-button`：按钮风格的复选框

### 1. 单个复选框

```vue
<script setup>
import { ref } from 'vue'

const agreed = ref(false)
</script>

<template>
  <el-checkbox v-model="agreed">我已阅读并同意用户协议</el-checkbox>
</template>
```

### 2. 复选框组

```vue
<script setup>
import { ref } from 'vue'

const selected = ref(['vue', 'react'])
</script>

<template>
  <el-checkbox-group v-model="selected">
    <el-checkbox value="vue">Vue</el-checkbox>
    <el-checkbox value="react">React</el-checkbox>
    <el-checkbox value="angular">Angular</el-checkbox>
    <el-checkbox value="svelte">Svelte</el-checkbox>
  </el-checkbox-group>
</template>
```

### 3. 限制选择数量

```vue
<el-checkbox-group v-model="selected" :min="1" :max="3">
  ...
</el-checkbox-group>
```

### 4. 按钮风格

```vue
<el-checkbox-group v-model="selected">
  <el-checkbox-button value="vue">Vue</el-checkbox-button>
  <el-checkbox-button value="react">React</el-checkbox-button>
</el-checkbox-group>
```

### 5. 全选 / 半选

```vue
<script setup>
import { ref, computed } from 'vue'

const options = ['Vue', 'React', 'Angular']
const selected = ref([])

const isAll = computed(() => selected.value.length === options.length)
const isIndeterminate = computed(
  () => selected.value.length > 0 && selected.value.length < options.length
)

function toggleAll(val) {
  selected.value = val ? [...options] : []
}
</script>

<template>
  <el-checkbox
    :model-value="isAll"
    :indeterminate="isIndeterminate"
    @change="toggleAll"
  >
    全选
  </el-checkbox>

  <el-checkbox-group v-model="selected">
    <el-checkbox v-for="opt in options" :key="opt" :value="opt">
      {{ opt }}
    </el-checkbox>
  </el-checkbox-group>
</template>
```

---

## 六、Radio：单选组

官方 Radio 文档里最核心的几个概念：

- `el-radio`：单个单选框
- `el-radio-group`：单选组
- `el-radio-button`：按钮风格的单选框

### 1. 基础用法

```vue
<script setup>
import { ref } from 'vue'

const gender = ref('male')
</script>

<template>
  <el-radio-group v-model="gender">
    <el-radio value="male">男</el-radio>
    <el-radio value="female">女</el-radio>
  </el-radio-group>
</template>
```

### 2. 按钮风格

```vue
<el-radio-group v-model="size">
  <el-radio-button value="large">大</el-radio-button>
  <el-radio-button value="default">中</el-radio-button>
  <el-radio-button value="small">小</el-radio-button>
</el-radio-group>
```

按钮风格的 Radio 很适合做"视图切换"或"尺寸选择"这类场景。

### 3. 动态选项

```vue
<script setup>
const statusOptions = [
  { value: 'active', label: '启用' },
  { value: 'inactive', label: '禁用' },
  { value: 'pending', label: '待审核' }
]
</script>

<template>
  <el-radio-group v-model="status">
    <el-radio
      v-for="opt in statusOptions"
      :key="opt.value"
      :value="opt.value"
    >
      {{ opt.label }}
    </el-radio>
  </el-radio-group>
</template>
```

---

## 七、Switch：开关

官方 Switch 文档里最核心的几个概念：

- `v-model`：绑定开关状态
- `active-value` / `inactive-value`：自定义开/关对应的值
- `active-text` / `inactive-text`：开/关时显示的文字
- `loading`：加载状态
- `before-change`：切换前的钩子

### 1. 基础用法

```vue
<script setup>
import { ref } from 'vue'

const enabled = ref(true)
</script>

<template>
  <el-switch v-model="enabled" />
</template>
```

### 2. 自定义值

```vue
<!-- 绑定数字 1/0 而不是 true/false -->
<el-switch
  v-model="status"
  :active-value="1"
  :inactive-value="0"
/>
```

### 3. 带文字

```vue
<el-switch
  v-model="enabled"
  active-text="启用"
  inactive-text="禁用"
/>
```

### 4. 切换前确认

```vue
<script setup>
import { ElMessageBox } from 'element-plus'

async function beforeChange() {
  try {
    await ElMessageBox.confirm('确认切换状态？', '提示')
    return true
  } catch {
    return false
  }
}
</script>

<template>
  <el-switch v-model="enabled" :before-change="beforeChange" />
</template>
```

这个场景在后台里很常见：切换"上线/下线"状态前需要二次确认。

---

## 八、Slider：滑块

官方 Slider 文档里最核心的几个概念：

- `v-model`：绑定当前值
- `min` / `max`：范围
- `step`：步长
- `range`：是否为范围选择
- `show-tooltip`：是否显示提示

### 1. 基础用法

```vue
<script setup>
import { ref } from 'vue'

const value = ref(50)
</script>

<template>
  <el-slider v-model="value" />
</template>
```

### 2. 范围选择

```vue
<script setup>
const range = ref([20, 80])
</script>

<template>
  <el-slider v-model="range" range />
</template>
```

### 3. 带输入框

```vue
<el-slider v-model="value" show-input />
```

### 4. 自定义步长和标记

```vue
<el-slider
  v-model="value"
  :step="10"
  :marks="{ 0: '0%', 50: '50%', 100: '100%' }"
/>
```

Slider 适合：

- 价格区间筛选
- 音量/亮度调节
- 进度设置

---

## 九、Rate：评分

官方 Rate 文档里最核心的几个概念：

- `v-model`：绑定评分值
- `max`：最大分值
- `allow-half`：是否允许半星
- `show-text`：是否显示文字
- `texts`：自定义文字数组

### 1. 基础用法

```vue
<script setup>
import { ref } from 'vue'

const score = ref(3)
</script>

<template>
  <el-rate v-model="score" />
</template>
```

### 2. 半星

```vue
<el-rate v-model="score" allow-half />
```

### 3. 带文字

```vue
<el-rate
  v-model="score"
  show-text
  :texts="['极差', '失望', '一般', '满意', '惊喜']"
/>
```

### 4. 只读模式

```vue
<el-rate v-model="score" disabled />
```

只读模式适合展示用户评分，不允许修改。

---

## 十、在 Form 里使用这些组件

这些组件都可以放进 `el-form` 里，配合校验使用：

```vue
<script setup>
import { ref, reactive } from 'vue'

const form = reactive({
  region: [],
  department: null,
  permissions: [],
  gender: 'male',
  enabled: true,
  score: 0
})

const rules = {
  region: [{ required: true, message: '请选择地区', trigger: 'change' }],
  department: [{ required: true, message: '请选择部门', trigger: 'change' }],
  permissions: [
    {
      type: 'array',
      required: true,
      min: 1,
      message: '至少选择一个权限',
      trigger: 'change'
    }
  ]
}
</script>

<template>
  <el-form :model="form" :rules="rules" label-width="100px">
    <el-form-item label="所在地区" prop="region">
      <el-cascader v-model="form.region" :options="regionOptions" />
    </el-form-item>

    <el-form-item label="所属部门" prop="department">
      <el-tree-select v-model="form.department" :data="deptTree" node-key="id" />
    </el-form-item>

    <el-form-item label="权限" prop="permissions">
      <el-checkbox-group v-model="form.permissions">
        <el-checkbox value="read">读取</el-checkbox>
        <el-checkbox value="write">写入</el-checkbox>
        <el-checkbox value="delete">删除</el-checkbox>
      </el-checkbox-group>
    </el-form-item>

    <el-form-item label="性别" prop="gender">
      <el-radio-group v-model="form.gender">
        <el-radio value="male">男</el-radio>
        <el-radio value="female">女</el-radio>
      </el-radio-group>
    </el-form-item>

    <el-form-item label="状态">
      <el-switch v-model="form.enabled" active-text="启用" inactive-text="禁用" />
    </el-form-item>

    <el-form-item label="满意度">
      <el-rate v-model="form.score" />
    </el-form-item>
  </el-form>
</template>
```

---

## 十一、主人最容易踩的坑

### 1. Cascader 的 `v-model` 是数组

很多人以为选了"朝阳区"，值就是 `'chaoyang'`。

实际上是 `['beijing', 'chaoyang']`。

如果接口只需要最后一级，要自己取：

```js
const lastValue = computed(() => form.region[form.region.length - 1])
```

### 2. Checkbox 的 `value` 不是 `label`

```vue
<!-- 错误：value 写成了中文 -->
<el-checkbox value="Vue">Vue</el-checkbox>

<!-- 正确：value 是实际绑定值，label 是显示文字 -->
<el-checkbox value="vue">Vue</el-checkbox>
```

### 3. Switch 绑定数字时要显式声明

```vue
<!-- 不声明时默认绑定 true/false -->
<el-switch v-model="status" />

<!-- 绑定 1/0 要显式声明 -->
<el-switch v-model="status" :active-value="1" :inactive-value="0" />
```

### 4. Rate 默认不允许清空

如果想让用户可以点击当前分值来清空：

```vue
<el-rate v-model="score" clearable />
```

### 5. TreeSelect 的 `node-key` 必须唯一

如果树形数据里有重复的 `id`，选择会出现异常。

---

## 十二、这一篇学完后你应该会什么

学完这篇，主人应该能做到：

1. 用 Cascader 处理地区、分类等层级选择
2. 用 TreeSelect 处理组织架构等树形选择
3. 用 Transfer 做权限分配等双列转移
4. 用 Checkbox / Radio 做多选和单选组
5. 用 Switch 做状态开关，配合二次确认
6. 用 Slider 做范围筛选
7. 用 Rate 做评分展示和录入
8. 把这些组件放进 Form 里配合校验

---

## 十三、官方资料入口

- Cascader：
  - [https://element-plus.org/zh-CN/component/cascader](https://element-plus.org/zh-CN/component/cascader)
- TreeSelect：
  - [https://element-plus.org/zh-CN/component/tree-select](https://element-plus.org/zh-CN/component/tree-select)
- Transfer：
  - [https://element-plus.org/zh-CN/component/transfer](https://element-plus.org/zh-CN/component/transfer)
- Checkbox：
  - [https://element-plus.org/zh-CN/component/checkbox](https://element-plus.org/zh-CN/component/checkbox)
- Radio：
  - [https://element-plus.org/zh-CN/component/radio](https://element-plus.org/zh-CN/component/radio)
- Switch：
  - [https://element-plus.org/zh-CN/component/switch](https://element-plus.org/zh-CN/component/switch)
- Slider：
  - [https://element-plus.org/zh-CN/component/slider](https://element-plus.org/zh-CN/component/slider)
- Rate：
  - [https://element-plus.org/zh-CN/component/rate](https://element-plus.org/zh-CN/component/rate)

---

## 十四、最后一句话总结

表单进阶的核心是：

**选择类组件各有适用场景，关键是搞清楚数据结构和 v-model 绑定的值是什么，再配合 Form 校验就能覆盖绝大多数录入场景。**
