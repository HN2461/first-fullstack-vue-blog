---
title: "第 9 篇：Ant Design Vue 常用数据展示组件：详情、状态、空态与加载态"
slug: "ant-design-vue-data-display-components"
summary: "通过管理页面案例认识 Descriptions、Tag、Badge、Statistic、Alert、Empty 和 Skeleton，学会把业务数据、状态与加载反馈表达清楚。"
category: "Ant Design Vue"
categoryPath:
  - "前端技术"
  - "组件库"
  - "Ant Design Vue"
tags:
  - "Ant Design Vue"
  - "Vue 3"
  - "数据展示"
  - "Empty"
  - "Skeleton"
status: "published"
sortOrder: 90
cover: ""
originalId: "6ae0a8dad7963ed85be766b3"
originalSlug: "ant-design-vue-data-display-components"
originalStatus: "published"
publishedAt: "2026-10-27T13:36:26.423Z"
updatedAt: "2026-10-27T13:36:26.518Z"
exportedAt: "2026-10-27T13:37:05.301Z"
---
# 第 9 篇：Ant Design Vue 常用数据展示组件：详情、状态、空态与加载态

管理界面不仅要把数据放进表格，还需要展示单条记录的属性、标记状态、说明风险、处理没有结果的情况，以及在请求中给出加载反馈。Ant Design Vue 提供多个小型展示组件，分别负责不同的信息表达。正确选择组件能让页面清楚，也能避免用颜色、文字和自定义样式拼出一套不一致的状态语言。

本文用“文章详情摘要面板”串起常见数据展示组件。完整例子假设应用已全局注册 Ant Design Vue 组件。

## 一、根据问题选择组件

| 你要表达什么 | 推荐组件 | 例子 |
| --- | --- | --- |
| 一条记录有许多名称和值 | `Descriptions` | 文章详情、用户信息、订单摘要 |
| 短小、可重复的类别或状态文字 | `Tag` | 草稿、已发布、前端分类 |
| 小圆点或计数提醒 | `Badge` | 评论待审核数、通知未读数 |
| 关键单一指标 | `Statistic` | 文章总数、总访问量 |
| 需要用户注意的说明或错误 | `Alert` | 保存失败原因、权限提示 |
| 列表为空或搜索无匹配 | `Empty` | 尚无文章、无查询结果 |
| 内容正在加载且布局尚未就绪 | `Skeleton` | 详情区域占位 |

这些组件表达的是“数据或状态”，不能取代业务逻辑。例如 Tag 显示“已发布”，并不代表后端已经验证文章可公开；前端展示文字应来自权威状态字段。

## 二、一个完整的详情展示页面

```vue
<template>
  <a-space direction="vertical" size="middle" style="width: 100%">
    <a-alert
      v-if="loadError"
      type="error"
      show-icon
      message="文章信息加载失败"
      description="请检查网络连接后重试。当前显示的是上次成功加载的数据。"
    />

    <a-card title="文章概览" :bordered="false">
      <a-skeleton :loading="loading" active>
        <template v-if="article">
          <a-descriptions bordered :column="{ xs: 1, sm: 2, md: 3 }">
            <a-descriptions-item label="文章标题">
              {{ article.title }}
            </a-descriptions-item>
            <a-descriptions-item label="分类">
              <a-tag color="blue">{{ article.category }}</a-tag>
            </a-descriptions-item>
            <a-descriptions-item label="当前状态">
              <a-badge
                :status="article.status === 'published' ? 'success' : 'default'"
                :text="statusText"
              />
            </a-descriptions-item>
            <a-descriptions-item label="创建时间">
              {{ article.createdAt }}
            </a-descriptions-item>
            <a-descriptions-item label="更新时间">
              {{ article.updatedAt }}
            </a-descriptions-item>
            <a-descriptions-item label="访问量">
              {{ article.views.toLocaleString('zh-CN') }} 次
            </a-descriptions-item>
            <a-descriptions-item label="摘要" :span="3">
              {{ article.summary || '暂无摘要' }}
            </a-descriptions-item>
          </a-descriptions>

          <a-divider />

          <a-row :gutter="16">
            <a-col :xs="24" :md="8">
              <a-statistic title="阅读量" :value="article.views" suffix="次" />
            </a-col>
            <a-col :xs="24" :md="8">
              <a-statistic title="收藏数" :value="article.favorites" suffix="人" />
            </a-col>
            <a-col :xs="24" :md="8">
              <a-statistic title="评论数" :value="article.comments" suffix="条" />
            </a-col>
          </a-row>
        </template>
      </a-skeleton>
    </a-card>

    <a-card title="相关内容" :bordered="false">
      <a-empty
        v-if="relatedArticles.length === 0 && !loading"
        description="暂时没有相关文章"
      >
        <a-button type="primary" @click="findRelated">
          重新查找
        </a-button>
      </a-empty>

      <a-list v-else :data-source="relatedArticles" :loading="loading">
        <template #renderItem="{ item }">
          <a-list-item>
            <a-list-item-meta :title="item.title" :description="item.category" />
            <a-tag :color="item.status === 'published' ? 'green' : 'gold'">
              {{ item.status === 'published' ? '已发布' : '草稿' }}
            </a-tag>
          </a-list-item>
        </template>
      </a-list>
    </a-card>
  </a-space>
</template>

<script setup>
import { computed, ref } from 'vue'

const loading = ref(false)
const loadError = ref(false)
const article = ref({
  title: 'Ant Design Vue 数据展示组件',
  category: '前端技术',
  status: 'published',
  createdAt: '2026-10-01',
  updatedAt: '2026-10-20',
  summary: '使用稳定的组件表达详情、状态、空数据和加载过程。',
  views: 12840,
  favorites: 236,
  comments: 18,
})

const relatedArticles = ref([
  { title: 'Ant Design Vue 表格分页与筛选', category: '组件库', status: 'published' },
  { title: 'Vue 3 表单校验实践', category: '前端开发', status: 'draft' },
])

const statusText = computed(() =>
  article.value?.status === 'published' ? '已发布' : '草稿',
)

function findRelated() {
  // 用模拟异步请求演示点击按钮后，加载状态如何切换。
  loading.value = true
  loadError.value = false
  window.setTimeout(() => {
    relatedArticles.value = []
    loading.value = false
  }, 600)
}
</script>
```

## 三、逐个理解组件的职责

### Descriptions：以标签和值展示记录属性

`a-descriptions` 适合只读详情。每个 `a-descriptions-item` 用 `label` 描述字段含义，插槽内容展示字段值。`bordered` 会给内容加边框；`column` 控制每行展示的列数，Ant Design Vue 4 支持响应式列数对象，窄屏退化到单列。

表单用于修改，Descriptions 用于查看。不要在详情页把所有数据做成禁用输入框，这会让用户误以为可以切换编辑。属性可能缺失时要提供可读的空值文字，日期格式也应统一，不要直接向用户显示未格式化的 ISO 字符串。

### Tag 和 Badge：类别标签与状态提醒

Tag 是紧凑的文字标签，可附颜色表达类别或状态；Badge 更适合小圆点或数字计数，以及一个状态提示。颜色不能成为唯一含义，例子同时显示“已发布”文字，屏幕阅读和色觉差异下仍能理解状态。

状态颜色要建立项目统一映射，不要每个页面临时挑颜色。未知状态应有安全的默认文本和样式，而不是因映射遗漏显示空白。需要筛选和权限的真实状态仍应由 API 返回。

### Statistic：强调单一指标

Statistic 用 `title` 告诉用户数字是什么，`value` 是数值，`suffix` 可补充单位。指标不能只显示“12840”，应至少有明确标题与单位。数字很大时可以格式化，但注意不要把底层值改成带逗号的字符串后再做数学计算。

Statistic 适合少量关键指标，不适合在页面顶部堆一排装饰性数字。指标要能追溯到数据来源与统计口径，例如“阅读量”是否包含管理员访问、统计时间截止到何时。

### Alert：展示需要被注意的信息

Alert 用于信息、成功、警告或错误提示。适合显示表单之外的系统状态和可恢复错误说明。错误文案要解释发生了什么以及用户可以做什么。例子显示加载失败，但保留已有数据，这是渐进式反馈；如果没有旧数据，也应提供重试按钮。

### Empty 与 Skeleton：空数据和加载中的不同状态

Empty 表示已经完成查询，但结果为空；Skeleton 表示数据还没准备好。两者不能混为一谈：加载中不应马上显示“没有数据”，否则网络返回前页面会闪烁错误结论。请求失败也不等于空数据，要单独表达失败并给出重试路径。

示例用 `a-skeleton :loading="loading"` 包住详情内容，加载时先提供骨架占位；相关列表则用 List 的 loading 反馈。对于固定布局的控制台页面，应确保占位区域与真实内容尺寸接近，减少页面跳动。

### List：展示一组非表格内容

示例使用 `a-list` 和 `renderItem` 插槽展示相关文章。列表适合标题、描述、头像或次要操作组成的重复条目；当数据有多个明确字段、需要列对齐、排序或密集操作时，优先使用 Table。不要为每一行都堆大卡片，保持信息密度一致。

## 四、数据展示组件的无障碍与响应式细节

- **颜色要配文字**：状态 Tag 和 Badge 同时提供可读文字，不单靠绿、红、黄判断。
- **数字加上标题和单位**：阅读量、时长、容量都要说明测量对象与单位。
- **窄屏重新排布**：Descriptions 使用响应式列配置，指标使用 Grid 的断点列宽。
- **不要用空白字符伪装布局**：字段对齐交给 Descriptions / Grid 等布局组件。
- **空、加载、错误分别设计**：三种反馈状态含义不同，页面状态应由明确变量表达。
- **内容长度要有策略**：长标题可换行或截断并提供可访问的全文；不应让一列撑破整个工作区。
- **颜色需跟主题适配**：不要把固定浅色背景写死成唯一主题的状态样式，优先使用组件语义色和主题 token。

## 五、常见错误

1. **数字没有说明含义**：给 Statistic 加 `title` 与单位，说明统计口径。
2. **空列表显示空白**：使用 Empty 并给出下一步操作，例如创建、清除筛选或重新搜索。
3. **接口请求时显示“暂无数据”**：先判断 loading；只有请求成功且结果为空时才展示 Empty。
4. **状态只有颜色没有文字**：Tag 和 Badge 都应提供状态文本；色彩映射还要统一。
5. **详情全部套卡片**：同一组属性优先用 Descriptions，避免每个字段一个大卡片造成视觉噪音。
6. **失败信息被当成空状态**：失败要显示错误提示和重试方式，不要吞掉错误后伪造空数组。
7. **加载时页面大幅跳动**：使用尺寸接近真实内容的 Skeleton，保持工作区高度稳定。

## 六、官方资料

- [Ant Design Vue Descriptions 中文文档](https://www.antdv.com/components/descriptions-cn)
- [Ant Design Vue Tag 中文文档](https://www.antdv.com/components/tag-cn)
- [Ant Design Vue Badge 中文文档](https://www.antdv.com/components/badge-cn)
- [Ant Design Vue Statistic 中文文档](https://www.antdv.com/components/statistic-cn)
- [Ant Design Vue Alert 中文文档](https://www.antdv.com/components/alert-cn)
- [Ant Design Vue Empty 中文文档](https://www.antdv.com/components/empty-cn)
- [Ant Design Vue Skeleton 中文文档](https://www.antdv.com/components/skeleton-cn)
- [Ant Design Vue List 中文文档](https://www.antdv.com/components/list-cn)

选择数据展示组件时，先问自己“用户此刻要知道什么”。再选择最能表达这类信息的组件，避免用装饰效果替代数据含义。
