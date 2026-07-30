---
title: "导航体系：Menu、Tabs、Breadcrumb、Steps、Dropdown 怎么组织后台页面结构"
slug: "element-plus-elementplus-menu-tabs-breadcrumb-steps-dropdown-1d3b9b38-revision-20260730"
summary: "基于 2026-04-29 查阅的 Element Plus 官方文档，系统讲解后台导航体系的五类核心组件：侧边菜单、标签页、面包屑、步骤条、下拉菜单，以及它们与 Vue Router 的联动方式。"
category: "ElementPlus"
tags:
  - "Element Plus"
  - "Menu"
  - "Tabs"
  - "Breadcrumb"
  - "Steps"
  - "Dropdown"
status: "draft"
sortOrder: 50
cover: ""
originalId: "6a2d291f8a2b1c68f2cac606"
originalSlug: "element-plus-elementplus-menu-tabs-breadcrumb-steps-dropdown-1d3b9b38"
originalStatus: "published"
exportedAt: "2026-07-30T13:20:22.058Z"
---
# 导航体系：Menu、Tabs、Breadcrumb、Steps、Dropdown 怎么组织后台页面结构

> 主人如果说前几篇解决的是"页面里的内容怎么展示"，  
> 那这一篇解决的是：
>
> - 用户怎么在页面之间移动
> - 当前在哪里
> - 下一步去哪里
> - 操作入口怎么收纳

这就是导航体系的核心价值。

---

## 一、先理解后台导航的几个层次

后台系统的导航通常分三层：

1. 全局导航：侧边栏 `Menu` 或顶部 `Menu`，决定"去哪个模块"
2. 页内导航：`Tabs` 切换同一页面的不同视图
3. 位置感知：`Breadcrumb` 告诉用户"现在在哪"
4. 流程引导：`Steps` 告诉用户"还有几步"
5. 操作收纳：`Dropdown` 把次级操作折叠起来

这五类组件各司其职，不要混用。

---

## 二、Menu：后台最核心的全局导航

官方 Menu 文档里，最重要的几个概念是：

- `el-menu`：菜单容器
- `el-menu-item`：叶子菜单项
- `el-sub-menu`：可展开的父级菜单
- `default-active`：当前激活项
- `router`：是否开启路由模式

### 1. 最基础的侧边菜单

```vue
<el-menu default-active="1" class="side-menu">
  <el-menu-item index="1">
    <el-icon><House /></el-icon>
    <span>首页</span>
  </el-menu-item>

  <el-sub-menu index="2">
    <template #title>
      <el-icon><Document /></el-icon>
      <span>内容管理</span>
    </template>
    <el-menu-item index="2-1">文章列表</el-menu-item>
    <el-menu-item index="2-2">分类管理</el-menu-item>
  </el-sub-menu>

  <el-menu-item index="3">
    <el-icon><Setting /></el-icon>
    <span>系统设置</span>
  </el-menu-item>
</el-menu>
```

### 2. 和 Vue Router 联动

官方文档提供了两种方式：

**方式一：开启 `router` 模式**

```vue
<el-menu :router="true" :default-active="$route.path">
  <el-menu-item index="/dashboard">首页</el-menu-item>
  <el-menu-item index="/users">用户管理</el-menu-item>
</el-menu>
```

开启 `router` 后，`index` 就是路由路径，点击菜单项会自动跳转。

**方式二：手动监听 `select` 事件**

```vue
<el-menu @select="handleSelect">
  <el-menu-item index="/dashboard">首页</el-menu-item>
</el-menu>

<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

function handleSelect(index) {
  router.push(index)
}
</script>
```

两种方式都可以，`router` 模式更简洁，手动方式更灵活。

### 3. 折叠侧边栏

后台系统里常见的"收起侧边栏"功能：

```vue
<script setup>
import { ref } from 'vue'

const isCollapse = ref(false)
</script>

<template>
  <el-menu :collapse="isCollapse" :collapse-transition="false">
    <el-menu-item index="1">
      <el-icon><House /></el-icon>
      <template #title>首页</template>
    </el-menu-item>
  </el-menu>

  <el-button @click="isCollapse = !isCollapse">
    {{ isCollapse ? '展开' : '收起' }}
  </el-button>
</template>
```

注意：折叠时只显示图标，所以菜单项里的文字要放在 `#title` 插槽里，图标单独放。

### 4. 顶部水平菜单

官方 Menu 也支持水平模式：

```vue
<el-menu mode="horizontal" :ellipsis="false">
  <el-menu-item index="1">首页</el-menu-item>
  <el-sub-menu index="2">
    <template #title>产品</template>
    <el-menu-item index="2-1">功能介绍</el-menu-item>
    <el-menu-item index="2-2">价格方案</el-menu-item>
  </el-sub-menu>
</el-menu>
```

### 5. 动态路由菜单

真实项目里菜单通常来自接口，不是写死的：

```vue
<script setup>
import { ref } from 'vue'

const menuList = ref([
  { index: '/dashboard', title: '首页', icon: 'House' },
  {
    index: '/content',
    title: '内容管理',
    icon: 'Document',
    children: [
      { index: '/content/articles', title: '文章列表' },
      { index: '/content/categories', title: '分类管理' }
    ]
  }
])
</script>

<template>
  <el-menu :router="true" :default-active="$route.path">
    <template v-for="item in menuList" :key="item.index">
      <!-- 有子菜单 -->
      <el-sub-menu v-if="item.children" :index="item.index">
        <template #title>{{ item.title }}</template>
        <el-menu-item
          v-for="child in item.children"
          :key="child.index"
          :index="child.index"
        >
          {{ child.title }}
        </el-menu-item>
      </el-sub-menu>

      <!-- 无子菜单 -->
      <el-menu-item v-else :index="item.index">
        {{ item.title }}
      </el-menu-item>
    </template>
  </el-menu>
</template>
```

---

## 三、Menu 使用时要注意什么

### 1. `default-active` 要和路由同步

如果不同步，刷新页面后菜单高亮会丢失。

最简单的做法是：

```vue
:default-active="$route.path"
```

或者用 `watch` 监听路由变化。

### 2. `unique-opened`

如果不想让多个子菜单同时展开：

```vue
<el-menu unique-opened>
```

这在侧边栏空间有限时很有用。

### 3. 折叠时图标不能少

折叠状态下只显示图标，如果菜单项没有图标，折叠后就什么都看不到了。

---

## 四、Tabs：页内视图切换

官方 Tabs 文档里最核心的几个概念：

- `v-model`：当前激活的 tab
- `type`：`card` 或 `border-card`
- `closable`：是否可关闭
- `addable`：是否可新增

### 1. 最基础的 Tabs

```vue
<script setup>
import { ref } from 'vue'

const activeTab = ref('list')
</script>

<template>
  <el-tabs v-model="activeTab">
    <el-tab-pane label="列表" name="list">
      <div>列表内容</div>
    </el-tab-pane>
    <el-tab-pane label="统计" name="stats">
      <div>统计内容</div>
    </el-tab-pane>
    <el-tab-pane label="日志" name="logs">
      <div>日志内容</div>
    </el-tab-pane>
  </el-tabs>
</template>
```

### 2. 卡片风格

```vue
<el-tabs v-model="activeTab" type="card">
  ...
</el-tabs>
```

后台系统里 `card` 风格更常见，视觉上更像独立的内容区块。

### 3. 可关闭的多页签

这是后台系统里常见的"多页签"模式：

```vue
<script setup>
import { ref } from 'vue'

const activeTab = ref('home')
const tabs = ref([
  { label: '首页', name: 'home' },
  { label: '用户管理', name: 'users' }
])

function handleTabRemove(name) {
  const index = tabs.value.findIndex(t => t.name === name)
  tabs.value.splice(index, 1)
  // 关闭后激活相邻 tab
  if (activeTab.value === name) {
    activeTab.value = tabs.value[Math.max(0, index - 1)]?.name
  }
}
</script>

<template>
  <el-tabs
    v-model="activeTab"
    type="card"
    closable
    @tab-remove="handleTabRemove"
  >
    <el-tab-pane
      v-for="tab in tabs"
      :key="tab.name"
      :label="tab.label"
      :name="tab.name"
    />
  </el-tabs>
</template>
```

### 4. `lazy` 懒加载

如果 tab 内容比较重，可以开启懒加载：

```vue
<el-tab-pane label="报表" name="report" lazy>
  <HeavyChart />
</el-tab-pane>
```

这样只有切换到该 tab 时才会渲染内容。

---

## 五、Breadcrumb：告诉用户"现在在哪"

官方 Breadcrumb 文档很简洁，核心就是：

- `el-breadcrumb`：容器，`separator` 控制分隔符
- `el-breadcrumb-item`：每一级路径，`to` 属性支持跳转

### 1. 基础用法

```vue
<el-breadcrumb separator="/">
  <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
  <el-breadcrumb-item :to="{ path: '/content' }">内容管理</el-breadcrumb-item>
  <el-breadcrumb-item>文章详情</el-breadcrumb-item>
</el-breadcrumb>
```

最后一级通常不加 `to`，因为就是当前页。

### 2. 用图标做分隔符

```vue
<el-breadcrumb>
  <template #separator>
    <el-icon><ArrowRight /></el-icon>
  </template>
  <el-breadcrumb-item>首页</el-breadcrumb-item>
  <el-breadcrumb-item>用户管理</el-breadcrumb-item>
</el-breadcrumb>
```

### 3. 根据路由动态生成

真实项目里面包屑通常从路由 `meta` 里读：

```vue
<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()

// 路由配置里 meta.breadcrumb = [{ title: '首页', path: '/' }, ...]
const breadcrumbs = computed(() => route.meta.breadcrumb || [])
</script>

<template>
  <el-breadcrumb separator="/">
    <el-breadcrumb-item
      v-for="(item, index) in breadcrumbs"
      :key="index"
      :to="index < breadcrumbs.length - 1 ? { path: item.path } : undefined"
    >
      {{ item.title }}
    </el-breadcrumb-item>
  </el-breadcrumb>
</template>
```

---

## 六、Steps：引导用户完成多步骤流程

官方 Steps 文档里最核心的几个概念：

- `active`：当前步骤（从 0 开始）
- `finish-status`：完成状态的图标样式
- `process-status`：进行中状态的图标样式
- `direction`：水平或垂直

### 1. 基础用法

```vue
<script setup>
import { ref } from 'vue'

const activeStep = ref(0)
</script>

<template>
  <el-steps :active="activeStep" finish-status="success">
    <el-step title="填写基本信息" />
    <el-step title="配置权限" />
    <el-step title="确认提交" />
  </el-steps>

  <div style="margin-top: 24px">
    <el-button :disabled="activeStep === 0" @click="activeStep--">上一步</el-button>
    <el-button type="primary" @click="activeStep++">下一步</el-button>
  </div>
</template>
```

### 2. 带描述的步骤条

```vue
<el-steps :active="1">
  <el-step title="选择商品" description="选择需要购买的商品" />
  <el-step title="填写信息" description="填写收货地址和联系方式" />
  <el-step title="确认支付" description="核对订单并完成支付" />
</el-steps>
```

### 3. 竖向步骤条

```vue
<el-steps direction="vertical" :active="1">
  <el-step title="步骤一" />
  <el-step title="步骤二" />
  <el-step title="步骤三" />
</el-steps>
```

竖向步骤条适合侧边栏引导或详情页的流程展示。

### 4. 自定义图标

```vue
<el-steps :active="1">
  <el-step title="上传文件">
    <template #icon>
      <el-icon><Upload /></el-icon>
    </template>
  </el-step>
  <el-step title="数据处理">
    <template #icon>
      <el-icon><Loading /></el-icon>
    </template>
  </el-step>
</el-steps>
```

---

## 七、Dropdown：把次级操作收纳起来

官方 Dropdown 文档里最核心的几个概念：

- `el-dropdown`：容器
- `el-dropdown-menu`：下拉菜单
- `el-dropdown-item`：菜单项
- `trigger`：触发方式，`hover` 或 `click`
- `command`：点击菜单项时触发的事件

### 1. 基础用法

```vue
<el-dropdown @command="handleCommand">
  <el-button type="primary">
    更多操作
    <el-icon class="el-icon--right"><ArrowDown /></el-icon>
  </el-button>

  <template #dropdown>
    <el-dropdown-menu>
      <el-dropdown-item command="export">导出数据</el-dropdown-item>
      <el-dropdown-item command="import">导入数据</el-dropdown-item>
      <el-dropdown-item command="reset" divided>重置配置</el-dropdown-item>
    </el-dropdown-menu>
  </template>
</el-dropdown>

<script setup>
function handleCommand(command) {
  console.log('执行操作：', command)
}
</script>
```

### 2. 表格行内的操作收纳

当表格操作列超过 3 个时，建议用 Dropdown 收纳：

```vue
<el-table-column label="操作" width="160">
  <template #default="{ row }">
    <el-button link type="primary" @click="handleEdit(row)">编辑</el-button>
    <el-dropdown @command="(cmd) => handleCommand(cmd, row)">
      <el-button link type="primary">
        更多<el-icon><ArrowDown /></el-icon>
      </el-button>
      <template #dropdown>
        <el-dropdown-menu>
          <el-dropdown-item command="detail">查看详情</el-dropdown-item>
          <el-dropdown-item command="copy">复制</el-dropdown-item>
          <el-dropdown-item command="delete" divided>删除</el-dropdown-item>
        </el-dropdown-menu>
      </template>
    </el-dropdown>
  </template>
</el-table-column>
```

### 3. 禁用某个菜单项

```vue
<el-dropdown-item command="delete" :disabled="!hasPermission">
  删除
</el-dropdown-item>
```

### 4. 触发方式

```vue
<!-- 点击触发（更适合移动端或精确操作场景） -->
<el-dropdown trigger="click">
  ...
</el-dropdown>

<!-- 悬停触发（默认，更适合桌面端） -->
<el-dropdown trigger="hover">
  ...
</el-dropdown>
```

---

## 八、把这些导航组件串成一个完整的后台框架

下面给主人一个典型的后台页面框架结构：

```vue
<script setup>
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { House, Document, Setting, ArrowDown } from '@element-plus/icons-vue'

const route = useRoute()
const router = useRouter()
const isCollapse = ref(false)

const breadcrumbs = computed(() => route.meta.breadcrumb || [])
</script>

<template>
  <el-container class="app-layout">
    <!-- 侧边菜单 -->
    <el-aside :width="isCollapse ? '64px' : '220px'">
      <el-menu
        :router="true"
        :default-active="route.path"
        :collapse="isCollapse"
        :collapse-transition="false"
      >
        <el-menu-item index="/dashboard">
          <el-icon><House /></el-icon>
          <template #title>首页</template>
        </el-menu-item>

        <el-sub-menu index="/content">
          <template #title>
            <el-icon><Document /></el-icon>
            <template #title>内容管理</template>
          </template>
          <el-menu-item index="/content/articles">文章列表</el-menu-item>
          <el-menu-item index="/content/categories">分类管理</el-menu-item>
        </el-sub-menu>

        <el-menu-item index="/settings">
          <el-icon><Setting /></el-icon>
          <template #title>系统设置</template>
        </el-menu-item>
      </el-menu>
    </el-aside>

    <el-container>
      <!-- 顶部栏 -->
      <el-header class="app-header">
        <el-button link @click="isCollapse = !isCollapse">
          折叠
        </el-button>

        <!-- 面包屑 -->
        <el-breadcrumb separator="/">
          <el-breadcrumb-item
            v-for="(item, i) in breadcrumbs"
            :key="i"
            :to="i < breadcrumbs.length - 1 ? { path: item.path } : undefined"
          >
            {{ item.title }}
          </el-breadcrumb-item>
        </el-breadcrumb>

        <!-- 右侧用户操作 -->
        <el-dropdown trigger="click">
          <span>管理员 <el-icon><ArrowDown /></el-icon></span>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item>个人设置</el-dropdown-item>
              <el-dropdown-item divided>退出登录</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </el-header>

      <!-- 主内容区 -->
      <el-main>
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<style scoped>
.app-layout {
  min-height: 100vh;
}

.app-header {
  display: flex;
  align-items: center;
  gap: 16px;
  border-bottom: 1px solid var(--el-border-color);
}
</style>
```

这就是一个完整的后台导航骨架。

---

## 九、主人最容易踩的坑

### 1. Menu 刷新后高亮丢失

原因是 `default-active` 没有绑定当前路由路径。

修复：

```vue
:default-active="route.path"
```

### 2. 折叠菜单没有图标

折叠后只显示图标，没有图标的菜单项会变成空白。

每个菜单项都要加 `el-icon`。

### 3. Tabs 切换后内容被销毁

默认情况下切换 tab 会销毁未激活的 tab 内容。

如果需要保留状态，用 `keep-alive` 包裹：

```vue
<keep-alive>
  <component :is="currentTabComponent" />
</keep-alive>
```

### 4. Dropdown 在表格里点击穿透

表格行有点击事件时，Dropdown 的点击可能会冒泡触发行点击。

用 `@click.stop` 阻止冒泡：

```vue
<el-dropdown @click.stop>
```

### 5. Steps 的 `active` 从 0 开始

很多人以为是从 1 开始，结果第一步永远是"进行中"状态。

---

## 十、这一篇学完后你应该会什么

学完这篇，主人应该能做到：

1. 用 Menu 搭出侧边栏，并和 Vue Router 联动
2. 用 Tabs 做页内视图切换和多页签
3. 用 Breadcrumb 展示当前路径
4. 用 Steps 引导多步骤流程
5. 用 Dropdown 收纳次级操作

这五件事组合起来，就是一个完整的后台导航体系。

---

## 十一、官方资料入口

- Menu：
  - [https://element-plus.org/zh-CN/component/menu](https://element-plus.org/zh-CN/component/menu)
- Tabs：
  - [https://element-plus.org/zh-CN/component/tabs](https://element-plus.org/zh-CN/component/tabs)
- Breadcrumb：
  - [https://element-plus.org/zh-CN/component/breadcrumb](https://element-plus.org/zh-CN/component/breadcrumb)
- Steps：
  - [https://element-plus.org/zh-CN/component/steps](https://element-plus.org/zh-CN/component/steps)
- Dropdown：
  - [https://element-plus.org/zh-CN/component/dropdown](https://element-plus.org/zh-CN/component/dropdown)

---

## 十二、最后一句话总结

后台导航体系可以直接记成一句话：

**用 Menu 决定去哪，用 Tabs 切换视图，用 Breadcrumb 知道在哪，用 Steps 引导流程，用 Dropdown 收纳操作。**

这五类组件各司其职，组合起来就是一套完整的后台导航框架。
