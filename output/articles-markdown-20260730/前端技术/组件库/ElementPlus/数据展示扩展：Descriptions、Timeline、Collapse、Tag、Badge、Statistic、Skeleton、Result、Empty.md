---
title: "数据展示扩展：Descriptions、Timeline、Collapse、Tag、Badge、Statistic、Skeleton、Result、Empty"
slug: "element-plus-elementplus-descriptions-timeline-collapse-tag-badge-statistic-skele-314dd07f-revision-20260730"
summary: "基于 2026-04-29 查阅的 Element Plus 官方文档，系统讲解详情页、状态标记、加载态与空态相关的数据展示组件，覆盖 Descriptions、Timeline、Collapse、Tag、Badge、Statistic、Skeleton、Result、Empty。"
category: "ElementPlus"
tags:
  - "Element Plus"
  - "Descriptions"
  - "Timeline"
  - "Collapse"
  - "Tag"
  - "Badge"
  - "Statistic"
status: "draft"
sortOrder: 40
cover: ""
originalId: "6a2d291f8a2b1c68f2cac61e"
originalSlug: "element-plus-elementplus-descriptions-timeline-collapse-tag-badge-statistic-skele-314dd07f"
originalStatus: "published"
exportedAt: "2026-07-30T13:20:22.058Z"
---
# 数据展示扩展：Descriptions、Timeline、Collapse、Tag、Badge、Statistic、Skeleton、Result、Empty

> 主人第五篇讲了 Table、Pagination 这些列表页的主力组件。  
> 但后台系统里还有大量"非列表"的展示场景：
>
> - 详情页怎么展示一条记录的所有字段
> - 操作历史怎么展示
> - 内容太多怎么折叠
> - 状态怎么用标签标记
> - 数字指标怎么突出展示
> - 数据还没加载完怎么占位
> - 操作结果页怎么做
> - 没有数据时怎么展示

这一篇就专门解决这些场景。

---

## 一、Descriptions：详情页的标准展示方式

官方 Descriptions 文档里最核心的几个概念：

- `el-descriptions`：容器，`column` 控制每行列数
- `el-descriptions-item`：每一个字段项，`label` 是字段名
- `border`：是否显示边框
- `span`：跨列

### 1. 最基础的用法

```vue
<el-descriptions title="用户信息" :column="2" border>
  <el-descriptions-item label="用户名">张三</el-descriptions-item>
  <el-descriptions-item label="手机号">138****8888</el-descriptions-item>
  <el-descriptions-item label="注册时间">2024-01-15</el-descriptions-item>
  <el-descriptions-item label="账号状态">
    <el-tag type="success">正常</el-tag>
  </el-descriptions-item>
  <el-descriptions-item label="备注" :span="2">
    这是一段备注信息，可以跨列展示
  </el-descriptions-item>
</el-descriptions>
```

### 2. 竖向排列

```vue
<el-descriptions direction="vertical" :column="3" border>
  <el-descriptions-item label="项目名称">后台管理系统</el-descriptions-item>
  <el-descriptions-item label="负责人">李四</el-descriptions-item>
  <el-descriptions-item label="状态">进行中</el-descriptions-item>
</el-descriptions>
```

### 3. 动态渲染

真实项目里通常从接口拿数据：

```vue
<script setup>
const fields = [
  { label: '用户名', key: 'username' },
  { label: '邮箱', key: 'email' },
  { label: '角色', key: 'role' },
  { label: '创建时间', key: 'createdAt' }
]
</script>

<template>
  <el-descriptions :column="2" border>
    <el-descriptions-item
      v-for="field in fields"
      :key="field.key"
      :label="field.label"
    >
      {{ userInfo[field.key] }}
    </el-descriptions-item>
  </el-descriptions>
</template>
```

Descriptions 是详情页最标准的展示方式，比自己用 `div + flex` 堆更规范。

---

## 二、Timeline：操作历史和流程记录

官方 Timeline 文档里最核心的几个概念：

- `el-timeline`：容器
- `el-timeline-item`：每一条记录
- `timestamp`：时间戳
- `type`：节点颜色类型
- `icon`：自定义图标

### 1. 基础用法

```vue
<el-timeline>
  <el-timeline-item timestamp="2024-03-01 10:00" placement="top">
    订单创建
  </el-timeline-item>
  <el-timeline-item timestamp="2024-03-01 10:30" type="primary" placement="top">
    已付款
  </el-timeline-item>
  <el-timeline-item timestamp="2024-03-02 14:00" type="success" placement="top">
    已发货
  </el-timeline-item>
  <el-timeline-item timestamp="2024-03-04 09:00" type="success" placement="top">
    已签收
  </el-timeline-item>
</el-timeline>
```

### 2. 自定义节点图标

```vue
<el-timeline-item>
  <template #dot>
    <el-icon style="color: #67c23a"><CircleCheck /></el-icon>
  </template>
  审核通过
</el-timeline-item>
```

### 3. 带详细内容

```vue
<el-timeline>
  <el-timeline-item
    v-for="log in operationLogs"
    :key="log.id"
    :timestamp="log.time"
    :type="log.type"
    placement="top"
  >
    <el-card shadow="never">
      <p>{{ log.action }}</p>
      <p style="color: var(--el-text-color-secondary); font-size: 12px">
        操作人：{{ log.operator }}
      </p>
    </el-card>
  </el-timeline-item>
</el-timeline>
```

Timeline 适合：

- 订单状态流转
- 审批流程记录
- 操作日志展示
- 项目里程碑

---

## 三、Collapse：折叠面板

官方 Collapse 文档里最核心的几个概念：

- `el-collapse`：容器，`v-model` 控制展开的面板
- `el-collapse-item`：每个面板，`name` 是唯一标识
- `accordion`：手风琴模式，每次只展开一个

### 1. 基础用法

```vue
<script setup>
import { ref } from 'vue'

const activeNames = ref(['1'])
</script>

<template>
  <el-collapse v-model="activeNames">
    <el-collapse-item title="基本信息" name="1">
      <div>这里是基本信息内容</div>
    </el-collapse-item>
    <el-collapse-item title="联系方式" name="2">
      <div>这里是联系方式内容</div>
    </el-collapse-item>
    <el-collapse-item title="操作记录" name="3">
      <div>这里是操作记录内容</div>
    </el-collapse-item>
  </el-collapse>
</template>
```

### 2. 手风琴模式

```vue
<el-collapse accordion v-model="activeName">
  ...
</el-collapse>
```

手风琴模式下 `v-model` 绑定的是字符串，不是数组。

### 3. 自定义标题

```vue
<el-collapse-item name="1">
  <template #title>
    <span>高级配置</span>
    <el-tag size="small" type="warning" style="margin-left: 8px">可选</el-tag>
  </template>
  <div>高级配置内容</div>
</el-collapse-item>
```

Collapse 适合：

- 详情页的分区折叠
- FAQ 问答列表
- 配置项分组
- 内容较多时的收纳

---

## 四、Tag：状态标记

官方 Tag 文档里最核心的几个概念：

- `type`：颜色类型
- `size`：尺寸
- `closable`：是否可关闭
- `effect`：样式效果，`dark`、`light`、`plain`

### 1. 基础用法

```vue
<el-tag>默认标签</el-tag>
<el-tag type="success">成功</el-tag>
<el-tag type="warning">警告</el-tag>
<el-tag type="danger">危险</el-tag>
<el-tag type="info">信息</el-tag>
```

### 2. 不同效果

```vue
<!-- 深色 -->
<el-tag effect="dark" type="success">已上线</el-tag>

<!-- 浅色（默认） -->
<el-tag effect="light" type="warning">审核中</el-tag>

<!-- 朴素 -->
<el-tag effect="plain" type="danger">已下线</el-tag>
```

### 3. 可关闭的标签

```vue
<script setup>
import { ref } from 'vue'

const tags = ref(['Vue', 'React', 'Angular'])

function removeTag(tag) {
  tags.value = tags.value.filter(t => t !== tag)
}
</script>

<template>
  <el-tag
    v-for="tag in tags"
    :key="tag"
    closable
    @close="removeTag(tag)"
  >
    {{ tag }}
  </el-tag>
</template>
```

### 4. 动态添加标签

```vue
<script setup>
import { ref, nextTick } from 'vue'

const tags = ref(['标签一'])
const inputVisible = ref(false)
const inputValue = ref('')
const inputRef = ref(null)

async function showInput() {
  inputVisible.value = true
  await nextTick()
  inputRef.value?.focus()
}

function addTag() {
  if (inputValue.value) {
    tags.value.push(inputValue.value)
  }
  inputVisible.value = false
  inputValue.value = ''
}
</script>

<template>
  <el-tag v-for="tag in tags" :key="tag" closable>{{ tag }}</el-tag>

  <el-input
    v-if="inputVisible"
    ref="inputRef"
    v-model="inputValue"
    size="small"
    style="width: 80px"
    @keyup.enter="addTag"
    @blur="addTag"
  />
  <el-button v-else size="small" @click="showInput">+ 添加标签</el-button>
</template>
```

---

## 五、Badge：徽章

官方 Badge 文档里最核心的几个概念：

- `value`：显示的数字或文字
- `max`：最大值，超过显示 `max+`
- `is-dot`：是否只显示小圆点
- `hidden`：是否隐藏

### 1. 基础用法

```vue
<el-badge :value="12" type="primary">
  <el-button>消息</el-button>
</el-badge>

<el-badge :value="99" :max="99">
  <el-button>通知</el-button>
</el-badge>
```

### 2. 小圆点

```vue
<el-badge is-dot>
  <el-button>待处理</el-button>
</el-badge>
```

### 3. 菜单项上的徽章

```vue
<el-menu-item index="/messages">
  <el-badge :value="unreadCount" :hidden="unreadCount === 0">
    <el-icon><Message /></el-icon>
  </el-badge>
  <span>消息中心</span>
</el-menu-item>
```

---

## 六、Statistic：数字指标展示

官方 Statistic 文档（`2.2.30` 加入）里最核心的几个概念：

- `value`：数值
- `title`：标题
- `prefix` / `suffix`：前缀和后缀
- `precision`：小数位数
- `formatter`：自定义格式化

### 1. 基础用法

```vue
<el-row :gutter="16">
  <el-col :span="6">
    <el-statistic title="今日访问量" :value="12345" />
  </el-col>
  <el-col :span="6">
    <el-statistic title="注册用户" :value="98765" />
  </el-col>
  <el-col :span="6">
    <el-statistic title="订单总额" :value="88888.88" :precision="2" prefix="¥" />
  </el-col>
  <el-col :span="6">
    <el-statistic title="转化率" :value="68.5" suffix="%" />
  </el-col>
</el-row>
```

### 2. 自定义格式

```vue
<el-statistic
  title="增长率"
  :value="12.5"
  :formatter="(val) => `+${val}%`"
/>
```

### 3. 配合 Card 使用

```vue
<el-card>
  <el-statistic title="本月收入" :value="128000" prefix="¥" :precision="2">
    <template #suffix>
      <el-text type="success" size="small">↑ 12.5%</el-text>
    </template>
  </el-statistic>
</el-card>
```

Statistic 适合：

- 数据看板
- 统计卡片
- KPI 展示

---

## 七、Skeleton：骨架屏

官方 Skeleton 文档里最核心的几个概念：

- `loading`：是否显示骨架屏
- `animated`：是否有动画
- `rows`：段落行数
- `el-skeleton-item`：自定义骨架形状

### 1. 基础用法

```vue
<script setup>
import { ref, onMounted } from 'vue'

const loading = ref(true)
const data = ref(null)

onMounted(async () => {
  data.value = await fetchData()
  loading.value = false
})
</script>

<template>
  <el-skeleton :loading="loading" animated>
    <!-- 骨架屏内容 -->
    <template #template>
      <el-skeleton-item variant="image" style="width: 100%; height: 200px" />
      <el-skeleton-item variant="h3" style="width: 50%; margin-top: 16px" />
      <el-skeleton-item variant="text" style="margin-top: 8px" />
      <el-skeleton-item variant="text" style="width: 80%; margin-top: 8px" />
    </template>

    <!-- 真实内容 -->
    <template #default>
      <div>{{ data }}</div>
    </template>
  </el-skeleton>
</template>
```

### 2. 简单段落骨架

```vue
<el-skeleton :rows="5" animated />
```

### 3. 列表骨架

```vue
<el-skeleton v-for="i in 3" :key="i" :loading="loading" animated>
  <template #template>
    <div style="display: flex; gap: 12px; padding: 12px">
      <el-skeleton-item variant="circle" style="width: 40px; height: 40px" />
      <div style="flex: 1">
        <el-skeleton-item variant="h3" style="width: 40%" />
        <el-skeleton-item variant="text" style="margin-top: 8px" />
      </div>
    </div>
  </template>
</el-skeleton>
```

`variant` 支持：`p`、`text`、`h1`-`h3`、`caption`、`button`、`image`、`circle`、`rect`。

---

## 八、Result：操作结果页

官方 Result 文档里最核心的几个概念：

- `status`：结果类型，`success`、`warning`、`error`、`info`
- `title`：主标题
- `sub-title`：副标题

### 1. 基础用法

```vue
<el-result
  status="success"
  title="提交成功"
  sub-title="您的申请已提交，预计 3 个工作日内处理完成"
>
  <template #extra>
    <el-button type="primary" @click="goHome">返回首页</el-button>
    <el-button @click="viewDetail">查看详情</el-button>
  </template>
</el-result>
```

### 2. 错误结果

```vue
<el-result
  status="error"
  title="提交失败"
  sub-title="网络异常，请稍后重试"
>
  <template #extra>
    <el-button type="primary" @click="retry">重新提交</el-button>
  </template>
</el-result>
```

### 3. 404 页面

```vue
<el-result
  status="404"
  title="404"
  sub-title="抱歉，您访问的页面不存在"
>
  <template #extra>
    <el-button type="primary" @click="$router.push('/')">返回首页</el-button>
  </template>
</el-result>
```

`status` 还支持 `403`、`404`、`500`，会显示对应的插图。

---

## 九、Empty：空状态

官方 Empty 文档里最核心的几个概念：

- `description`：描述文字
- `image`：自定义图片
- `image-size`：图片尺寸

### 1. 基础用法

```vue
<el-empty description="暂无数据" />
```

### 2. 自定义描述和操作

```vue
<el-empty description="还没有任何内容">
  <el-button type="primary" @click="handleCreate">立即创建</el-button>
</el-empty>
```

### 3. 在 Table 里使用

```vue
<el-table :data="tableData">
  <el-table-column prop="name" label="名称" />
  <template #empty>
    <el-empty description="暂无数据" />
  </template>
</el-table>
```

### 4. 自定义图片

```vue
<el-empty
  image="https://example.com/empty.svg"
  :image-size="200"
  description="搜索结果为空"
/>
```

---

## 十、把这些组件组合成一个完整的详情页

下面给主人一个典型的详情页结构：

```vue
<script setup>
import { ref, onMounted } from 'vue'

const loading = ref(true)
const detail = ref(null)
const logs = ref([])

onMounted(async () => {
  // 模拟加载
  setTimeout(() => {
    detail.value = {
      name: '后台管理系统',
      owner: '张三',
      status: '进行中',
      createdAt: '2024-01-15'
    }
    logs.value = [
      { time: '2024-01-15 10:00', action: '项目创建', type: 'primary' },
      { time: '2024-01-20 14:30', action: '需求评审完成', type: 'success' },
      { time: '2024-02-01 09:00', action: '开发启动', type: 'success' }
    ]
    loading.value = false
  }, 1500)
})
</script>

<template>
  <el-skeleton :loading="loading" animated>
    <template #template>
      <el-skeleton-item variant="h3" style="width: 30%" />
      <el-skeleton-item variant="text" style="margin-top: 16px" />
      <el-skeleton-item variant="text" style="width: 80%; margin-top: 8px" />
    </template>

    <template #default>
      <div v-if="detail">
        <!-- 基本信息 -->
        <el-descriptions title="项目详情" :column="2" border>
          <el-descriptions-item label="项目名称">{{ detail.name }}</el-descriptions-item>
          <el-descriptions-item label="负责人">{{ detail.owner }}</el-descriptions-item>
          <el-descriptions-item label="状态">
            <el-tag type="warning">{{ detail.status }}</el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="创建时间">{{ detail.createdAt }}</el-descriptions-item>
        </el-descriptions>

        <!-- 操作记录 -->
        <el-collapse style="margin-top: 24px">
          <el-collapse-item title="操作记录" name="logs">
            <el-timeline>
              <el-timeline-item
                v-for="log in logs"
                :key="log.time"
                :timestamp="log.time"
                :type="log.type"
                placement="top"
              >
                {{ log.action }}
              </el-timeline-item>
            </el-timeline>
          </el-collapse-item>
        </el-collapse>
      </div>

      <!-- 空状态 -->
      <el-empty v-else description="项目不存在" />
    </template>
  </el-skeleton>
</template>
```

---

## 十一、主人最容易踩的坑

### 1. Descriptions 的 `column` 不是"列数"而是"每行几个"

如果设了 `:column="3"`，但只有 2 个 item，最后一行会有空格。

用 `:span` 让某个 item 占满剩余空间。

### 2. Skeleton 的 `loading` 要和数据加载状态绑定

很多人只写了骨架屏，但忘了在数据加载完后把 `loading` 改成 `false`。

### 3. Tag 的 `type` 和 Button 的 `type` 不完全一样

Tag 有 `info`，Button 没有。

Tag 没有 `text`，Button 有。

### 4. Badge 的 `value` 为 0 时默认不隐藏

如果不想显示 0：

```vue
<el-badge :value="count" :hidden="count === 0">
```

### 5. Result 的 `status` 支持数字字符串

`'404'`、`'403'`、`'500'` 会显示对应的内置插图，不需要自己找图。

---

## 十二、这一篇学完后你应该会什么

学完这篇，主人应该能做到：

1. 用 Descriptions 做详情页的字段展示
2. 用 Timeline 展示操作历史和流程记录
3. 用 Collapse 折叠较长的内容区块
4. 用 Tag 标记状态，用 Badge 标记数量
5. 用 Statistic 突出展示数字指标
6. 用 Skeleton 做加载占位
7. 用 Result 做操作结果页
8. 用 Empty 处理空状态

---

## 十三、官方资料入口

- Descriptions：
  - [https://element-plus.org/zh-CN/component/descriptions](https://element-plus.org/zh-CN/component/descriptions)
- Timeline：
  - [https://element-plus.org/zh-CN/component/timeline](https://element-plus.org/zh-CN/component/timeline)
- Collapse：
  - [https://element-plus.org/zh-CN/component/collapse](https://element-plus.org/zh-CN/component/collapse)
- Tag：
  - [https://element-plus.org/zh-CN/component/tag](https://element-plus.org/zh-CN/component/tag)
- Badge：
  - [https://element-plus.org/zh-CN/component/badge](https://element-plus.org/zh-CN/component/badge)
- Statistic：
  - [https://element-plus.org/zh-CN/component/statistic](https://element-plus.org/zh-CN/component/statistic)
- Skeleton：
  - [https://element-plus.org/zh-CN/component/skeleton](https://element-plus.org/zh-CN/component/skeleton)
- Result：
  - [https://element-plus.org/zh-CN/component/result](https://element-plus.org/zh-CN/component/result)
- Empty：
  - [https://element-plus.org/zh-CN/component/empty](https://element-plus.org/zh-CN/component/empty)

---

## 十四、最后一句话总结

详情页和数据展示的核心是：

**用 Descriptions 展示字段，用 Timeline 展示历史，用 Collapse 收纳内容，用 Tag/Badge 标记状态，用 Statistic 突出数字，用 Skeleton/Result/Empty 处理好加载态、结果态和空态。**

把这些场景都覆盖到，后台页面的完成度会高很多。
