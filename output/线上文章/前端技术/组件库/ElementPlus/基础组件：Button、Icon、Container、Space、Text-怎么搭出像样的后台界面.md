---
title: "基础组件：Button、Icon、Container、Space、Text 怎么搭出像样的后台界面"
slug: "element-plus-elementplus-button-icon-container-space-text-ede7df67"
summary: "基于 2026-04-28 查阅的 Element Plus 官方文档，系统整理 Button、Icon、Container、Space、Text 这些基础组件在后台页面里的常见用法和搭配思路。"
category: "ElementPlus"
categoryPath:
  - "前端技术"
  - "组件库"
  - "ElementPlus"
tags:
  - "Element Plus"
  - "Button"
  - "Icon"
  - "Container"
  - "Space"
status: "published"
sortOrder: 10
cover: ""
originalId: "6a2d291f8a2b1c68f2cac610"
originalSlug: "element-plus-elementplus-button-icon-container-space-text-ede7df67"
originalStatus: "published"
publishedAt: "2026-04-29T12:51:05.550Z"
updatedAt: "2026-06-13T10:28:29.581Z"
exportedAt: "2026-07-30T15:42:33.614Z"
---
# 基础组件：Button、Icon、Container、Space、Text 怎么搭出像样的后台界面

> 主人很多时候会有一个错觉：  
> 学组件库是不是要先从最复杂的表格、表单开始？
>
> 其实不是。
>
> 真正决定页面“像不像一个成熟后台”的，往往是最基础的这些东西：
>
> - 按钮怎么分主次
> - 图标怎么配
> - 页面的壳子怎么搭
> - 间距怎么统一
> - 文字怎么收口

这一篇我们就专门讲这一层。

---

## 一、先说一个整体理解

Element Plus 的基础组件，很多不是为了“炫”，而是为了：

- 统一视觉
- 提高信息层级清晰度
- 让后台页面更快成型

如果主人只是会写：

- `<el-button>`
- `<el-input>`

还不够。

你还要知道：

- 什么时候该用 `primary`
- 什么时候该用 `link`
- 什么时候用 `Text`
- 什么时候用 `Space`
- 什么时候该让页面先有 `Container` 骨架

这样写出来的页面才会稳。

---

## 二、Button：按钮不只是“能点”

官方 Button 文档里最核心的几组能力是：

- `type`
- `plain`
- `round`
- `circle`
- `disabled`
- `loading`
- `text`
- `link`
- `icon`
- `dashed`
- 自定义颜色

### 1. 最基础的 type

最常见的是：

```vue
<el-button>默认按钮</el-button>
<el-button type="primary">主要按钮</el-button>
<el-button type="success">成功按钮</el-button>
<el-button type="warning">警告按钮</el-button>
<el-button type="danger">危险按钮</el-button>
```

主人实际写后台页面时，不要把这些 type 当“配色玩具”。

更好的理解是：

- `primary`
  - 当前区域最重要的动作
- 默认按钮
  - 次要动作
- `danger`
  - 删除、清空、禁用这类高风险动作

### 2. `plain` 是什么感觉

```vue
<el-button type="primary" plain>次强调按钮</el-button>
```

它适合：

- 有视觉强调
- 但又不想压过主按钮

比如：

- 主按钮是“保存”
- `plain primary` 可以是“预览”

### 3. `round` 和 `circle`

这两个更偏视觉风格：

```vue
<el-button type="primary" round>圆角按钮</el-button>
<el-button type="primary" circle>
  <el-icon><Search /></el-icon>
</el-button>
```

后台项目里圆形按钮通常用于：

- 搜索
- 刷新
- 更多操作

### 4. `loading`

这是业务里非常实用的状态。

```vue
<el-button type="primary" :loading="submitting">
  提交
</el-button>
```

很多新手会只在点击后弹个 message。

但更稳的做法通常是：

- 点击按钮
- 按钮自己进入 `loading`
- 请求回来后再恢复

这比只弹一句“提交中”更直观。

### 5. `link` 和 `text` 别混

官方 Button 文档特别提醒了一点：

- `type='text'` 已经被废弃
- `3.0.0` 会移除
- 但 `text` 这个布尔属性本身仍然是现行能力
- `link` 和 `text` 都能做轻量按钮，只是视觉风格不同

所以主人现在看新代码时，更准确的理解是：

```vue
<el-button text>次级操作</el-button>
<el-button text type="primary">查看日志</el-button>
<el-button link type="primary">编辑</el-button>
<el-button link type="danger">删除</el-button>
```

这几种写法的区别可以这样记：

- `link`
  - 更像链接，适合表格行内操作、操作列
- `text`
  - 仍然保留按钮交互区块，但视觉更轻，适合工具栏里的次操作
- `type='text'`
  - 这是旧写法，看到老代码要知道该迁移，但不要把新的 `text` 属性也误判成废弃 API

主人如果只是写后台列表的“编辑 / 删除 / 详情”，优先用 `link` 往往更贴切。

### 6. `icon` 和 ButtonGroup 也很常用

如果只是想在按钮前面放一个图标，官方也支持直接传 `icon` 属性：

```vue
<script setup>
import { Plus, ArrowLeft, ArrowRight } from '@element-plus/icons-vue'
</script>

<template>
  <el-button type="primary" :icon="Plus">新建项目</el-button>

  <el-button-group>
    <el-button :icon="ArrowLeft">上一步</el-button>
    <el-button type="primary">
      下一步
      <el-icon class="el-icon--right"><ArrowRight /></el-icon>
    </el-button>
  </el-button-group>
</template>
```

它常见于：

- 新建、刷新、导出这类带图标的主动作
- 上一步 / 下一步
- 列表切换、批量操作这类一组并列动作

### 7. 新版能力顺手记一下

结合最新发布记录：

- `2.13.3` 给 Button 加了 `dashed`
- `2.13.7` 支持 `link/text` 场景的自定义颜色

这说明 Button 本身也在持续增强，不是一个“已经完全不动了”的老组件。

---

## 三、给主人一个按钮分层模板

后台页面里，按钮层级建议经常这样分：

### 1. 区域主动作

```vue
<el-button type="primary">新建</el-button>
```

### 2. 次动作

```vue
<el-button>重置</el-button>
<el-button plain type="primary">导出</el-button>
```

### 3. 表格行内操作

```vue
<el-button link type="primary">编辑</el-button>
<el-button link>详情</el-button>
<el-button link type="danger">删除</el-button>
```

这样分层比整页全是蓝按钮专业得多。

---

## 四、Icon：别让页面只剩文字

官方 Icon 文档说得很清楚：

- Element Plus 有一套常用 SVG 图标集合
- 图标包是单独安装的

安装：

```bash
npm install @element-plus/icons-vue
```

### 1. 最常见的局部用法

```vue
<script setup>
import { Search, Refresh, Plus } from '@element-plus/icons-vue'
</script>

<template>
  <el-button type="primary">
    <el-icon><Plus /></el-icon>
    新建
  </el-button>

  <el-button>
    <el-icon><Refresh /></el-icon>
    刷新
  </el-button>

  <el-input placeholder="请输入关键词">
    <template #prefix>
      <el-icon><Search /></el-icon>
    </template>
  </el-input>
</template>
```

### 2. 为什么推荐局部导入

因为它更清楚：

- 这个页面用到了什么图标
- 不容易把全量注册搞得很重

### 3. Icon 本身也有属性

官方文档写了两个最基础的：

- `color`
- `size`

比如：

```vue
<el-icon :size="18" color="#2563eb">
  <Search />
</el-icon>
```

### 4. 图标的常见场景

- 按钮前缀图标
- 输入框前缀图标
- 空状态提示
- 统计卡片的视觉标识
- 菜单项图标

不要为了“有图标而加图标”。

图标最核心的价值是：

**让用户更快扫到功能。**

---

## 五、Container：页面骨架不要全靠 div 硬堆

官方 Container 文档里定义了五个基础容器：

- `el-container`
- `el-header`
- `el-aside`
- `el-main`
- `el-footer`

### 1. 最重要的一句规则

官方特别提示：

- `el-container` 的直接子元素，应当是后四者中的一个或多个
- 后四个组件的父元素，也应该是 `el-container`

也就是说，别乱套层级。

### 2. 它的排列规律

官方写得很直白：

- 如果子元素里有 `el-header` 或 `el-footer`
  - 默认垂直排列
- 否则
  - 默认水平排列

所以你可以很快拼出后台壳子。

### 3. 经典后台骨架

```vue
<template>
  <el-container class="app-shell">
    <el-aside width="220px">侧边栏</el-aside>

    <el-container>
      <el-header>顶部栏</el-header>
      <el-main>页面主体</el-main>
    </el-container>
  </el-container>
</template>

<style scoped>
.app-shell {
  min-height: 100vh;
}
</style>
```

这个结构非常像常见后台：

- 左边菜单
- 右边是头部和主内容

### 4. 为什么不用纯 div 也能做

当然纯 `div + flex` 也能做。

但 Container 的意义在于：

- 语义更明显
- 结构更统一
- 和组件库其他布局示例更一致

---

## 六、Space：后台页面的“舒服感”很多来自间距

官方 Space 文档里给了非常实用的一组默认尺寸：

- `small` = `8px`
- `default` = `12px`
- `large` = `16px`

这很适合拿来统一：

- 按钮组
- 卡片头部操作区
- 标签排列
- 筛选项横向排布

### 1. 基础用法

```vue
<el-space>
  <el-button type="primary">查询</el-button>
  <el-button>重置</el-button>
  <el-button plain type="primary">导出</el-button>
</el-space>
```

### 2. 换行场景

```vue
<el-space wrap>
  <el-tag>待审核</el-tag>
  <el-tag type="success">已上线</el-tag>
  <el-tag type="warning">草稿</el-tag>
</el-space>
```

### 3. 纵向排布

```vue
<el-space direction="vertical" alignment="start">
  <el-text>订单总数</el-text>
  <el-text size="large" type="primary">1,284</el-text>
</el-space>
```

### 4. `spacer` 适合做轻分隔

如果操作项很多，但又不想每个都手写分隔符，可以直接用：

```vue
<el-space spacer="|">
  <el-button text>编辑</el-button>
  <el-button text>复制</el-button>
  <el-button text type="danger">删除</el-button>
</el-space>
```

这种写法特别适合：

- 表格操作列
- 卡片头部的小操作区
- 一排文字按钮

### 5. `fill` 适合做均分按钮区

官方还提供了 `fill` 和 `fill-ratio`。

它适合那种“同一排按钮要自动拉开宽度”的场景：

```vue
<el-space fill>
  <el-button>按周</el-button>
  <el-button>按月</el-button>
  <el-button>按年</el-button>
</el-space>
```

比如筛选卡片顶部的视图切换、时间维度切换，就很适合先试 `fill`，再考虑自己写 flex。

### 6. 官方给的一个注意点

文档里专门提醒：

- 不要让 `ElSpace` 和依赖父元素百分比宽高的组件乱配
- 比如 `ElSlider`

否则可能会出现交互定位不同步的问题。

这个点不常见，但知道了能少踩坑。

---

## 七、Text：别所有文字都自己写 class

很多人学组件库时，容易忽视 `Text`。

但它在后台页面里挺有价值。

官方 Text 文档里最常见的能力是：

- `type`
- `size`
- `truncated`
- `line-clamp`
- `tag`

### 1. 基础类型

```vue
<el-text>默认文本</el-text>
<el-text type="primary">主要信息</el-text>
<el-text type="success">成功状态</el-text>
<el-text type="warning">警示信息</el-text>
<el-text type="danger">危险提示</el-text>
```

它适合：

- 标签旁边的说明文
- 卡片副标题
- 状态文字
- 说明提示

### 2. 尺寸

```vue
<el-text size="large">大号数字</el-text>
<el-text>默认文字</el-text>
<el-text size="small">说明文案</el-text>
```

### 3. 文本省略

如果标题可能很长，可以用：

```vue
<el-text truncated style="max-width: 260px">
  这是一个可能会非常长非常长非常长的标题
</el-text>
```

对后台表头、副标题、卡片描述很有用。

### 4. 多行省略

如果不是一行标题，而是简介、说明文这种两三行内容，更适合用 `line-clamp`：

```vue
<el-text :line-clamp="2">
  这是一段比较长的说明文案，用来演示两行截断。超过两行以后，组件会自动帮你做省略处理。
</el-text>
```

列表卡片、资讯摘要、详情页说明区都很常见。

### 5. `tag` 控制最终渲染的语义标签

`ElText` 不只是样式包装，它还可以改最终输出的 HTML 标签：

```vue
<el-text tag="p" type="info">
  这里是一段说明文字
</el-text>
```

这在文章摘要、卡片副标题、表单说明文里会更顺手，因为你不用为了语义标签再额外包一层。

---

## 八、把这些基础组件组合成一个像样的页面头部

下面给主人一个非常常见的后台页头组合。

```vue
<script setup>
import { Plus, Refresh, Search } from '@element-plus/icons-vue'
</script>

<template>
  <el-container class="page-shell">
    <el-header class="page-header">
      <div class="title-block">
        <el-text size="large">项目管理</el-text>
        <el-text type="info">管理项目列表、状态和负责人</el-text>
      </div>

      <el-space>
        <el-button>
          <el-icon><Refresh /></el-icon>
          刷新
        </el-button>
        <el-button type="primary">
          <el-icon><Plus /></el-icon>
          新建项目
        </el-button>
      </el-space>
    </el-header>

    <el-main>
      <el-space>
        <el-input placeholder="请输入关键词">
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
        <el-button type="primary">查询</el-button>
      </el-space>
    </el-main>
  </el-container>
</template>

<style scoped>
.page-shell {
  min-height: 100vh;
}

.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.title-block {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
</style>
```

你会发现，这里面还没碰：

- 表格
- 表单
- 抽屉
- 弹窗

但页面已经开始像后台了。

这就是基础组件的价值。

---

## 九、主人最容易踩的坑

### 1. 按钮全都 `primary`

这样页面会很吵。

主次不分，用户也不知道应该先点哪个。

### 2. 图标只会乱塞，不会服务信息层级

图标不是装饰贴纸。

它应该帮助用户更快扫到功能。

### 3. 页面骨架只会无限套 div

简单页面当然可以。

但后台项目里，Container 这种结构化容器会让代码更清楚。

### 4. 间距全靠 margin 一把梭

长期看很容易失控。

很多按钮组、标签组、操作区其实更适合先尝试 `Space`。

### 5. 说明文字全靠自己手写样式

如果只是常见说明文本，很多时候 `Text` 已经够用了。

---

## 十、这一篇学完后你应该会什么

学完这篇，主人应该能做到：

1. 知道 Button 怎么做主次分层
2. 知道 Icon 怎么和按钮、输入框配合
3. 能用 Container 快速搭后台骨架
4. 能用 Space 管按钮组和标签组
5. 能用 Text 收束说明信息和状态文案

这五件事看似基础，但非常影响页面成品感。

---

## 十一、官方资料入口

- Button：
  - [https://element-plus.org/zh-CN/component/button](https://element-plus.org/zh-CN/component/button)
- Icon：
  - [https://element-plus.org/zh-CN/component/icon.html](https://element-plus.org/zh-CN/component/icon.html)
- Container：
  - [https://element-plus.org/zh-CN/component/container.html](https://element-plus.org/zh-CN/component/container.html)
- Space：
  - [https://element-plus.org/zh-CN/component/space](https://element-plus.org/zh-CN/component/space)
- Text：
  - [https://element-plus.org/zh-CN/component/text.html](https://element-plus.org/zh-CN/component/text.html)

---

## 十二、最后一句话总结

后台页面的“成熟感”，很多不是靠复杂组件堆出来的。

而是靠：

- 按钮分层
- 图标辅助
- 骨架清晰
- 间距统一
- 文字收口

这几个最基础的 Element Plus 组件先用顺了，后面再上表单和表格会轻松很多。
