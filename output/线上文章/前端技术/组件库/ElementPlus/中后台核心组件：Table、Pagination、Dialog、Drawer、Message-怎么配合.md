---
title: "中后台核心组件：Table、Pagination、Dialog、Drawer、Message 怎么配合"
slug: "element-plus-elementplus-table-pagination-dialog-drawer-message-a9a1cd3a"
summary: "基于 2026-04-28 查阅的 Element Plus 官方文档，系统讲解表格、分页、对话框、抽屉、消息提示这些中后台最高频组件的组合方式和使用边界。"
category: "ElementPlus"
tags:
  - "Element Plus"
  - "Table"
  - "Pagination"
  - "Dialog"
  - "Drawer"
status: "draft"
sortOrder: 80
cover: ""
originalId: "6a2d291f8a2b1c68f2cac62e"
originalSlug: "element-plus-elementplus-table-pagination-dialog-drawer-message-a9a1cd3a"
originalStatus: "published"
exportedAt: "2026-07-31T03:42:38.792Z"
---
# 中后台核心组件：Table、Pagination、Dialog、Drawer、Message 怎么配合

> 主人如果说前一篇表单体系解决的是“怎么输入”，  
> 那这一篇解决的就是：
>
> - 数据怎么展示
> - 列表怎么翻页
> - 编辑动作怎么承载
> - 操作反馈怎么给用户

这几乎就是后台页面最常见的主循环。

---

## 一、先记住后台页面的典型结构

很多中后台页面本质上就是这一套：

1. 上面一个筛选区
2. 中间一张表格
3. 右下角一个分页器
4. 点“新建 / 编辑”后打开 Dialog 或 Drawer
5. 成功后弹 Message

所以主人只要把这几类组件用顺，很多后台页面就能做出来。

---

## 二、Table：后台页面的主战场

官方 Table 文档非常长，说明这个组件很重。

但主人第一轮学习时，不用把所有 API 吞下去。

先抓最常见的几类能力：

- 基础列展示
- 自定义单元格
- 选择列
- 排序
- 汇总
- 合并单元格
- 大数据表格

### 1. 最基础的列表

```vue
<el-table :data="tableData" border style="width: 100%">
  <el-table-column prop="id" label="ID" width="80" />
  <el-table-column prop="name" label="项目名称" />
  <el-table-column prop="owner" label="负责人" width="120" />
</el-table>
```

这就是最基础的“数据数组 + 列定义”模型。

### 2. 自定义列内容

真实后台里最常见的是状态列和操作列。

```vue
<el-table-column label="状态" width="120">
  <template #default="{ row }">
    <el-tag :type="row.status === '已上线' ? 'success' : 'warning'">
      {{ row.status }}
    </el-tag>
  </template>
</el-table-column>

<el-table-column label="操作" width="180">
  <template #default>
    <el-button link type="primary">编辑</el-button>
    <el-button link type="danger">删除</el-button>
  </template>
</el-table-column>
```

### 3. 选择列

官方文档示例里就大量展示了：

- 多选
- 清空选择
- 通过实例方法切换选择状态

这类场景常见于：

- 批量删除
- 批量导出
- 批量审核

### 4. 汇总与合并

官方 Table 文档专门提供了：

- `summary-method`
- `span-method`

也就是说：

- 想做底部合计
  - 用汇总
- 想做行合并 / 列合并
  - 用 `span-method`

这对财务、报表、统计类页面很重要。

### 5. 大数据量场景

官方还单独有：

- `table-v2`
- 虚拟化表格

主人先把它理解成：

**数据量特别大时，不一定继续硬用普通 Table。**

---

## 三、Table 最实用的业务心法

### 1. 列不是越多越好

后台页面很容易犯的错是：

- 什么字段都想放在表格里

最后用户看得更累。

更好的做法是：

- 关键字段上桌
- 次要字段放详情
- 高频操作放操作列

### 2. 状态列尽量视觉化

比如不要只写文字：

```txt
已上线
开发中
待排期
```

而是结合 `el-tag` 或颜色区分。

这样扫表速度会快很多。

### 3. 操作列主次要分层

常见写法是：

- `编辑` 用 `link primary`
- `删除` 用 `link danger`
- 次级操作不抢主色

---

## 四、Pagination：别把分页只当一个“页码条”

官方 Pagination 文档里，最关键的概念是：

- `layout`

它决定分页器显示哪些模块。

### 1. 最简单分页

```vue
<el-pagination layout="prev, pager, next" :total="100" />
```

### 2. 带总数

```vue
<el-pagination
  layout="total, prev, pager, next"
  :total="1000"
/>
```

### 3. 带每页条数和跳转

```vue
<el-pagination
  v-model:current-page="currentPage"
  v-model:page-size="pageSize"
  :page-sizes="[10, 20, 50, 100]"
  layout="total, sizes, prev, pager, next, jumper"
  :total="400"
/>
```

### 4. `layout` 里都能放什么

官方文档列得很清楚：

- `prev`
- `next`
- `pager`
- `jumper`
- `total`
- `sizes`
- `->`

其中：

- `->`
  - 后面的内容会靠右

### 5. `hide-on-single-page`

官方也给了这个很实用的属性：

- 只有一页时隐藏分页器

这比只有一个 `1` 还杵在页面上更干净。

---

## 五、Pagination 使用时要注意什么

### 1. `total` 和 `page-count`

官方文档提醒：

- 两者任意一个都能显示页码
- 但如果你要支持 `page-sizes` 改变每页条数
- 更应该用 `total`

### 2. `pager-count`

如果总页数很多，默认超过 7 页会折叠。

你可以用：

```vue
:pager-count="11"
```

让显示出来的页码按钮更多。

### 3. 背景和小尺寸

常见后台页面很喜欢：

```vue
<el-pagination background size="small" />
```

因为比较紧凑。

---

## 六、Dialog：适合承载“需要聚焦但不离开当前页”的操作

官方 Dialog 文档一开头就说了：

- 它是在保留当前页面状态的情况下
- 告知用户并承载相关操作

这个定位很重要。

### 1. 最基础写法

```vue
<script setup>
import { ref } from 'vue'

const visible = ref(false)
</script>

<template>
  <el-button type="primary" @click="visible = true">新建</el-button>

  <el-dialog v-model="visible" title="新建项目" width="640px">
    <div>这里可以放表单</div>

    <template #footer>
      <el-button @click="visible = false">取消</el-button>
      <el-button type="primary">保存</el-button>
    </template>
  </el-dialog>
</template>
```

### 2. 它最适合放什么

- 新建
- 编辑
- 确认
- 简单配置
- 小范围信息补录

### 3. `before-close` 的边界

官方文档特别提醒：

- `before-close` 只会在用户点击关闭按钮或遮罩时被调用
- 如果你在 footer 自己放了关闭按钮
- 那要自己在按钮点击里写对应逻辑

这个点很容易误会。

### 4. 新版本变化可以顺手记一下

最新 `2.13.7` 发布记录里，Dialog 有一条 feature：

- bring clicked dialog to front

也就是多层 Dialog 场景下，对层级交互做了增强。

---

## 七、Drawer：适合承载“编辑流程更长、内容更高”的操作

抽屉和 Dialog 很像，但感觉不一样。

官方 Drawer 文档也强调了一个升级点：

- Vue 3 里不要再用 `visible.sync`
- 用 `v-model`

### 1. 基础写法

```vue
<script setup>
import { ref } from 'vue'

const drawerVisible = ref(false)
</script>

<template>
  <el-button type="primary" @click="drawerVisible = true">编辑</el-button>

  <el-drawer
    v-model="drawerVisible"
    title="编辑项目"
    direction="rtl"
    size="50%"
  >
    <div>这里可以放更长的表单内容</div>
  </el-drawer>
</template>
```

### 2. 什么时候更适合 Drawer

- 表单项很多
- 希望用户仍然感知“还在当前列表页面上下文里”
- 不想让弹窗太拥挤

### 3. 嵌套 Drawer

官方英文文档里还提到：

- 嵌套 Drawer 时
- `append-to-body` 需要设为 `true`

所以如果主人后面真的做多层抽屉，不要只顾着“能弹出来”。

---

## 八、Dialog 和 Drawer 到底怎么选

可以直接这样判断。

### 1. 内容短、动作集中

优先：

- `Dialog`

### 2. 内容长、字段多、编辑流程更像侧边工作台

优先：

- `Drawer`

### 3. 需要用户强聚焦确认

优先：

- `Dialog`

### 4. 希望用户保留更多“当前页上下文感”

优先：

- `Drawer`

---

## 九、Message：操作反馈的第一反应层

官方 Message 文档一开头就说明了它的定位：

- 主动操作后的反馈提示

并且还拿它和 Notification 做了区分：

- Message 更像操作反馈
- Notification 更像系统级被动提醒

### 1. 基础用法

```js
import { ElMessage } from 'element-plus'

ElMessage({
  message: '保存成功',
  type: 'success'
})
```

或者更短：

```js
ElMessage.success('保存成功')
ElMessage.warning('请先选择数据')
ElMessage.error('删除失败')
```

### 2. 常见配置

官方文档列出了这些很常用的项：

- `duration`
- `showClose`
- `offset`
- `placement`
- `grouping`
- `repeatNum`

其中值得主人先记的几个：

#### `placement`

`2.11.0` 加入，控制消息位置。

#### `grouping`

相同内容的消息可以合并，避免疯狂刷屏。

#### `duration`

设成 `0` 就不会自动关闭。

### 3. 安全提醒

官方文档专门警告了：

如果开了：

- `dangerouslyUseHTMLString`

那 `message` 内容必须可信。

不要把用户提交内容直接原样塞进去。

这个点很重要。

---

## 十、MessageBox：别和 Dialog 混成一类

虽然这一篇重点是 Message，但顺带提一下 MessageBox 更不容易混。

官方文档对 MessageBox 的描述是：

- 它是对系统 `alert`、`confirm`、`prompt` 的美化版
- 适合展示较简单的内容

所以主人可以这样分：

- 复杂表单弹层
  - `Dialog` / `Drawer`
- 简单确认
  - `MessageBox`
- 操作结果反馈
  - `Message`

---

## 十一、把这些组件串成一个真实后台操作流

下面给主人一个常见业务流：

1. 页面展示 Table
2. 底部 Pagination
3. 点“编辑”打开 Drawer
4. 保存成功弹 Message

示例：

```vue
<script setup>
import { ref } from 'vue'
import { ElMessage } from 'element-plus'

const drawerVisible = ref(false)

const tableData = ref([
  { id: 1, name: '首页装修', status: '已上线' },
  { id: 2, name: '订单中心', status: '开发中' }
])

function handleSave() {
  drawerVisible.value = false
  ElMessage.success('保存成功')
}
</script>

<template>
  <el-table :data="tableData" border style="width: 100%">
    <el-table-column prop="id" label="ID" width="80" />
    <el-table-column prop="name" label="项目名称" />
    <el-table-column label="状态" width="120">
      <template #default="{ row }">
        <el-tag :type="row.status === '已上线' ? 'success' : 'warning'">
          {{ row.status }}
        </el-tag>
      </template>
    </el-table-column>
    <el-table-column label="操作" width="120">
      <template #default>
        <el-button link type="primary" @click="drawerVisible = true">
          编辑
        </el-button>
      </template>
    </el-table-column>
  </el-table>

  <div style="display: flex; justify-content: flex-end; margin-top: 16px">
    <el-pagination background layout="total, prev, pager, next" :total="100" />
  </div>

  <el-drawer v-model="drawerVisible" title="编辑项目" size="50%">
    <div style="display: flex; justify-content: flex-end">
      <el-button @click="drawerVisible = false">取消</el-button>
      <el-button type="primary" @click="handleSave">保存</el-button>
    </div>
  </el-drawer>
</template>
```

这就是非常典型的后台工作流。

---

## 十二、主人最容易踩的坑

### 1. 什么都想塞进 Dialog

内容太长时，Dialog 很容易显得挤。

这时候 Drawer 反而更自然。

### 2. 表格只会堆字段，不会做状态和操作列

那页面会很像“数据库字段展示器”，不像产品界面。

### 3. 分页不会管 `current-page` 和 `page-size`

实际业务里分页不是只显示一下页码，而是要和查询参数、接口联动。

### 4. 操作成功后不做 Message 反馈

用户会不确定：

- 到底保存了没
- 到底删掉了没

### 5. Message 滥用 HTML

官方已经提醒了，别拿不可信内容直接渲染 HTML。

---

## 十三、这一篇学完后你应该会什么

学完这篇，主人应该能做到：

1. 用 Table 做后台列表
2. 用 Pagination 管页码和每页条数
3. 分清 Dialog 和 Drawer 的边界
4. 用 Message 做操作反馈
5. 知道 MessageBox 更适合简单确认

这已经是非常核心的一套后台页面能力了。

---

## 十四、官方资料入口

- Table：
  - [https://element-plus.org/zh-CN/component/table.html](https://element-plus.org/zh-CN/component/table.html)
- Pagination：
  - [https://element-plus.org/zh-CN/component/pagination](https://element-plus.org/zh-CN/component/pagination)
- Dialog：
  - [https://element-plus.org/zh-CN/component/dialog](https://element-plus.org/zh-CN/component/dialog)
- Drawer：
  - [https://element-plus.org/zh-CN/component/drawer](https://element-plus.org/zh-CN/component/drawer)
- Message：
  - [https://element-plus.org/zh-CN/component/message](https://element-plus.org/zh-CN/component/message)
- MessageBox：
  - [https://element-plus.org/zh-CN/component/message-box](https://element-plus.org/zh-CN/component/message-box)

---

## 十五、最后一句话总结

中后台页面的主循环可以直接记成一句话：

**用 Table 展示，用 Pagination 翻页，用 Dialog / Drawer 承载动作，用 Message 反馈结果。**

把这句话真正写顺了，后台页面就已经有骨架了。
