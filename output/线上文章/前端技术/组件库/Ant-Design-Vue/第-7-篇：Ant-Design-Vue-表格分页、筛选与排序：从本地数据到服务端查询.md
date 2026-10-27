---
title: "第 7 篇：Ant Design Vue 表格分页、筛选与排序：从本地数据到服务端查询"
slug: "ant-design-vue-table-pagination-filter-sort"
summary: "用一张文章列表讲清楚 Table 的行键、列配置、受控分页、筛选和排序，并进一步理解大型数据为什么应该由服务端分页查询。"
category: "Ant Design Vue"
categoryPath:
  - "前端技术"
  - "组件库"
  - "Ant Design Vue"
tags:
  - "Ant Design Vue"
  - "Vue 3"
  - "Table"
  - "分页"
  - "数据筛选"
status: "published"
sortOrder: 70
cover: ""
originalId: "6ae0a8dad7963ed85be766b1"
originalSlug: "ant-design-vue-table-pagination-filter-sort"
originalStatus: "published"
publishedAt: "2026-10-27T13:36:26.423Z"
updatedAt: "2026-10-27T13:36:26.502Z"
exportedAt: "2026-10-27T13:37:05.301Z"
---
# 第 7 篇：Ant Design Vue 表格分页、筛选与排序：从本地数据到服务端查询

后台表格经常同时有分页、筛选、排序、加载状态和操作按钮。理解这些功能的关键，是先区分两件事：表格负责呈现与发出用户操作；页面或服务层负责决定数据从哪里来。数据少时可以在浏览器内处理；数据多时应把查询条件交给后端，让数据库只返回当前页。

本文给出一份可运行的本地示例，然后把同一套状态映射到服务端分页。组件名称与 API 对应 Ant Design Vue 4.2.6。

## 一、Table 的三份核心数据

`a-table` 最常见的输入有三部分：

| 属性 | 含义 | 初学者可以怎么理解 |
| --- | --- | --- |
| `dataSource` | 当前显示的记录数组 | 表格的行数据 |
| `columns` | 列定义数组 | 表格有哪些列、每列显示对象哪个字段 |
| `rowKey` | 每行稳定唯一的标识 | Vue 更新行时用的身份证 |

每行必须能被稳定识别。数据对象若有 `id`，用 `row-key="id"`；若对象已经有 `key`，默认也可按 key 识别。不要用当前数组下标当长期 ID：排序或分页后下标会变，行选择、展开状态和组件更新就可能对应错对象。

列中的 `title` 是用户看见的列名，`dataIndex` 是记录字段路径，`key` 是列自身的稳定标识。`dataIndex` 不存在时，普通单元格通常为空；自定义内容可通过 `#bodyCell` 插槽渲染。

## 二、完整可运行的受控表格示例

此例模拟文章管理页：状态筛选、标题排序和页码变化由表格事件传给页面。页面按当前条件从一组模拟记录计算结果，再只把当前页传给 Table。这样能看清“总数”和“当前页数据”并不相同。

```vue
<template>
  <a-card :bordered="false">
    <a-table
      row-key="id"
      :columns="columns"
      :data-source="pageRows"
      :loading="loading"
      :pagination="paginationConfig"
      :scroll="{ x: 760 }"
      @change="handleTableChange"
    >
      <template #bodyCell="{ column, record }">
        <template v-if="column.key === 'status'">
          <a-tag :color="record.status === 'published' ? 'green' : 'gold'">
            {{ record.status === 'published' ? '已发布' : '草稿' }}
          </a-tag>
        </template>
        <template v-else-if="column.key === 'actions'">
          <a-space>
            <a-button type="link" size="small" @click="openArticle(record)">
              查看
            </a-button>
            <a-button type="link" size="small" @click="editArticle(record)">
              编辑
            </a-button>
          </a-space>
        </template>
      </template>
    </a-table>
  </a-card>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue'

const allArticles = [
  { id: 'a-101', title: 'Vue 组件通信入门', status: 'published', updatedAt: '2026-10-20' },
  { id: 'a-102', title: 'Vite 项目配置说明', status: 'draft', updatedAt: '2026-10-19' },
  { id: 'a-103', title: 'Ant Design Vue 表格', status: 'published', updatedAt: '2026-10-18' },
  { id: 'a-104', title: 'JavaScript 异步流程', status: 'draft', updatedAt: '2026-10-17' },
  { id: 'a-105', title: 'CSS 布局实践', status: 'published', updatedAt: '2026-10-16' },
  { id: 'a-106', title: 'HTTP 请求与错误处理', status: 'draft', updatedAt: '2026-10-15' },
]

const loading = ref(false)
const pageRows = ref([])
const query = reactive({
  current: 1,
  pageSize: 5,
  status: [],
  sortField: null,
  sortOrder: null,
})

const columns = computed(() => [
  {
    title: '文章标题',
    dataIndex: 'title',
    key: 'title',
    sorter: true,
    sortOrder: query.sortField === 'title' ? query.sortOrder : null,
  },
  {
    title: '状态',
    dataIndex: 'status',
    key: 'status',
    filters: [
      { text: '已发布', value: 'published' },
      { text: '草稿', value: 'draft' },
    ],
    filteredValue: query.status,
    filterMultiple: true,
  },
  {
    title: '更新时间',
    dataIndex: 'updatedAt',
    key: 'updatedAt',
  },
  {
    title: '操作',
    key: 'actions',
    fixed: 'right',
    width: 130,
  },
])

const paginationConfig = computed(() => ({
  current: query.current,
  pageSize: query.pageSize,
  total: matchingArticles.value.length,
  showSizeChanger: true,
  pageSizeOptions: ['5', '10', '20'],
  showTotal: total => `共 ${total} 篇文章`,
}))

const matchingArticles = computed(() => {
  let result = [...allArticles]

  if (query.status.length > 0) {
    result = result.filter(article => query.status.includes(article.status))
  }

  if (query.sortField === 'title' && query.sortOrder) {
    const direction = query.sortOrder === 'ascend' ? 1 : -1
    result.sort((a, b) => a.title.localeCompare(b.title, 'zh-CN') * direction)
  }

  return result
})

function updatePageRows() {
  const start = (query.current - 1) * query.pageSize
  pageRows.value = matchingArticles.value.slice(start, start + query.pageSize)
}

function handleTableChange(pagination, filters, sorter) {
  query.pageSize = pagination.pageSize
  query.status = filters.status ?? []
  query.sortField = sorter.field ?? null
  query.sortOrder = sorter.order ?? null

  // 过滤条件变化后回到第一页，避免当前页超过新结果的页数。
  const queryChanged = filters.status !== undefined || sorter.field !== undefined
  query.current = queryChanged ? 1 : pagination.current
  updatePageRows()
}

function openArticle(article) {
  console.log('查看文章：', article.id)
}

function editArticle(article) {
  console.log('编辑文章：', article.id)
}

onMounted(() => {
  updatePageRows()
})
</script>
```

## 三、事件怎样把操作送回页面

`@change` 是 Table 的统一变化事件。当分页、筛选或排序改变时，组件会将新的 `pagination`、`filters`、`sorter` 以及额外信息传给处理函数。Vue 模板中的 `@change="handleTableChange"` 会自动把这些事件参数交给函数。

示例把表格交互转换为一份查询状态：

- `query.current` 和 `query.pageSize` 描述当前页和每页条数。
- `query.status` 保存用户选中的状态筛选值。
- `query.sortField` 与 `query.sortOrder` 保存排序列和方向。

`sorter.order` 常见值为 `ascend`、`descend` 或空值。空值意味着清除了排序。示例将排序状态回写到列的 `sortOrder`，将筛选状态回写到 `filteredValue`，所以表格图标和菜单能反映页面当前条件。将状态属性传回组件，这种写法称为受控状态。

## 四、本地处理和服务端处理的区别

示例把六条测试记录放在浏览器，用 `filter`、`sort`、`slice` 处理。本地处理适合少量且已经完整加载的数据。实际文章或用户数据通常有上千条，并且受权限过滤；此时服务端应该只返回当前页，避免浏览器一次拿到所有记录，也避免把未授权数据下载到客户端。

服务端分页接口通常接收类似下面的查询条件：

```text
GET /api/articles?page=2&pageSize=20&status=published&sortBy=updatedAt&order=desc
```

接入后端时，可将 `updatePageRows()` 替换为异步加载函数。下面是关键结构，`apiClient` 代表项目已有的 HTTP 客户端：

```js
async function loadArticles() {
  loading.value = true

  try {
    const response = await apiClient.get('/articles', {
      params: {
        page: query.current,
        pageSize: query.pageSize,
        status: query.status,
        sortBy: query.sortField,
        order: query.sortOrder === 'ascend' ? 'asc' : 'desc',
      },
    })

    pageRows.value = response.data.items
    total.value = response.data.total
  } catch (error) {
    // 显示错误反馈；保留原有行数据，用户可重试。
    console.error('加载文章失败：', error)
  } finally {
    loading.value = false
  }
}
```

此结构需要增加 `const total = ref(0)`，并让分页配置的 `total` 使用 `total.value`。当用户点击筛选或排序菜单时，事件处理函数先更新查询状态，再调用 `loadArticles()`。后端必须校验页码范围、排序字段白名单和筛选条件，不能直接把任意用户输入拼成数据库查询。

不要混淆“分页器当前页的数据”和“全部匹配记录总数”。服务端响应应分别提供 `items` 与 `total`。如果 `total` 错写成当前页数组长度，分页器会误以为只存在一页。

## 五、列配置和单元格插槽

列配置是一个数组，每个对象通常有 `title`、`dataIndex`、`key`。`sorter: true` 表示该列提供排序交互；排序动作由页面或服务器处理。`filters` 定义菜单选项；`filteredValue` 在受控模式中保存选中值。`fixed: 'right'` 和 `width` 可把操作列固定在右边，但固定列需要表格有明确可滚动宽度，因此示例同时设置 `scroll.x`。

`#bodyCell="{ column, record }"` 是 Vue 插槽写法。它接收当前列、当前整行记录等信息。用 `column.key` 判断当前是哪一列，可以为状态列显示 Tag，为操作列显示按钮。这里的 `record` 是该行完整对象，所以可以把它传给详情抽屉或编辑处理函数。

如果许多业务页面重复需要通用表格能力，应使用项目已有的 `BlogTable` 包装，而不是在每个页面重复复制 `a-table`、分页和列设置逻辑。扩展公共表格组件前必须遵循仓库约束，不要为了单个页面改动公共组件。

## 六、常见问题

1. **控制台提示缺少行 key**：确认后端每条记录都有稳定唯一 ID，并设置 `row-key="id"`。
2. **改了页码但显示内容没变化**：受控分页时，页面要根据事件里的 current/pageSize 更新数据；服务端分页时要重新发请求。
3. **筛选后出现空白页**：筛选条件改变时将页码重置到 1；筛选后总数变小时也要检查当前页是否仍有效。
4. **排序图标变化了但数据顺序不变**：设置了 `sorter: true` 只会提供交互；页面还要处理 `sorter` 并排序或请求后端。
5. **固定操作列遮挡内容**：为表格设置横向 `scroll.x`，并给固定列合理宽度。
6. **翻页会显示上一页选中行**：确保 rowKey 稳定，并明确选择状态是否应跨页保留。
7. **用了 `onFilter` 后服务端筛选失效**：`onFilter` 是本地过滤回调。服务端模式应将 `filters` 作为查询条件交给 API，不要再对仅有的一页数据做本地过滤。

## 七、官方资料

- [Ant Design Vue Table 中文文档](https://www.antdv.com/components/table-cn)
- [Ant Design Vue Pagination 中文文档](https://www.antdv.com/components/pagination-cn)
- [Vue 3 组件事件](https://cn.vuejs.org/guide/components/events.html)
- [Ant Design Vue 4.2.6 Table 源码文档](https://github.com/vueComponent/ant-design-vue/blob/4.2.6/components/table/index.zh-CN.md)

Table 是数据呈现组件，不是数据库分页方案。小数据可在客户端排序筛选；大数据与权限数据应走服务端查询，并在接口设计中明确页码、筛选条件、排序白名单和总记录数。
