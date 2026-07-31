---
title: "第 3 篇：现代布局：Flex 与 Grid"
slug: "css-fa549107"
summary: "CSS 现代布局笔记，重点讲解 Flexbox 与 Grid 的区别、布局模型、响应式布局和常见实践。"
category: "AI版CSS"
tags:
  - "CSS"
  - "Flexbox"
  - "Grid"
  - "响应式布局"
status: "draft"
sortOrder: 30
cover: ""
originalId: "6a2d291d8a2b1c68f2cac09e"
originalSlug: "css-fa549107"
originalStatus: "published"
exportedAt: "2026-07-31T03:42:38.792Z"
---
# 第 3 篇：现代布局：Flex 与 Grid

> 目标：掌握现代网页布局的两大主力——Flexbox 和 Grid。看完这一篇，你应该能：
>
> - 用 Flexbox 写出常见的一维布局：导航栏、卡片列表、左右结构等；
> - 用 Grid 写出二维布局：后台面板、多区域页面框架等；
> - 读懂别人写的现代布局代码，不再只会靠 `position: absolute` 硬拼页面。

---

## 第7章 Flexbox：让盒子学会“自动排队”

> Flexbox 适合用来处理“一排”或“一列”的布局问题，比如：顶部导航、一行卡片、左右结构（左侧文字右侧图片）等。
>
> 记住一句话：**Flex 是一维布局（只关心一条主轴），Grid 是二维布局。**

### 7.1 容器与项目的角色

使用 Flexbox 的第一步：**先选中一个“容器”，再让其中的子元素变成“项目”。**

💡 **核心理解：Flexbox 是一种"父子关系"的布局模式**

- **父元素**：设置 `display: flex`，成为 Flex 容器（flex container）
- **子元素**：自动成为 Flex 项目（flex items），听从父元素的布局指挥

---

#### 7.1.1 如何创建 Flex 容器

**一行代码启动 Flexbox**：

```css
.container {
  display: flex;   /* 这行一写，.container 就变成 Flex 容器 */
}
```

**效果**：
- `.container` 本身变成 Flex 容器
- 它的**直接子元素**自动变成 Flex 项目
- 子元素的排列方式从"默认文档流"变成"Flex 布局"

---

#### 7.1.2 生活化比喻：队伍与队员

可以把 Flexbox 想象成**排队系统**：

```txt
🎯 Flex 容器 = 队伍的"排队区域"
   - 决定队伍怎么排（横排还是竖排）
   - 决定队员之间的间距
   - 决定队员的对齐方式

👥 Flex 项目 = 队伍中的"队员"
   - 听从排队区域的指挥
   - 可以设置自己占多少空间
   - 可以设置自己的特殊对齐方式
```

---

#### 7.1.3 基础示例：导航栏

**HTML 结构**：

```html
<ul class="nav">
  <li>首页</li>
  <li>产品</li>
  <li>关于我们</li>
</ul>
```

**不使用 Flexbox（默认效果）**：

```css
/* 不设置任何布局 */
.nav {
  /* 默认是 display: block */
}
```

**效果**：

```txt
┌─────────────┐
│ 首页        │  ← li 是块级元素，独占一行
├─────────────┤
│ 产品        │
├─────────────┤
│ 关于我们    │
└─────────────┘
```

---

**使用 Flexbox**：

```css
.nav {
  display: flex;
}
```

**效果**：

```txt
┌─────────────────────────────┐
│ [首页] [产品] [关于我们]    │  ← 自动横向排列
└─────────────────────────────┘
```

💡 **关键变化**：
- `li` 从"独占一行"变成"横向排列"
- 不需要设置 `float` 或 `inline-block`
- 一行代码搞定！

---

#### 7.1.4 容器与项目的关系图

**可视化理解**：

```txt
HTML 结构：
<div class="container">        ← Flex 容器
  <div class="item">项目1</div>  ← Flex 项目
  <div class="item">项目2</div>  ← Flex 项目
  <div class="item">项目3</div>  ← Flex 项目
</div>

CSS：
.container {
  display: flex;  ← 启动 Flexbox
}

效果：
┌─────────────── .container (Flex 容器) ───────────────┐
│                                                      │
│  ┌────────┐  ┌────────┐  ┌────────┐                │
│  │ 项目1  │  │ 项目2  │  │ 项目3  │  ← Flex 项目    │
│  └────────┘  └────────┘  └────────┘                │
│                                                      │
└──────────────────────────────────────────────────────┘
```

---

#### 7.1.5 ⚠️ 重要：只有直接子元素才是 Flex 项目

**示例**：

```html
<div class="container">
  <div class="item">
    <p>这是段落</p>  <!-- 这不是 Flex 项目！ -->
  </div>
  <div class="item">
    <p>另一段落</p>  <!-- 这也不是 Flex 项目！ -->
  </div>
</div>
```

```css
.container {
  display: flex;
}
```

**关系图**：

```txt
.container (Flex 容器)
  ├─ .item (Flex 项目) ✅
  │   └─ p (普通元素，不是 Flex 项目) ❌
  └─ .item (Flex 项目) ✅
      └─ p (普通元素，不是 Flex 项目) ❌
```

💡 **关键理解**：
- `.item` 是 `.container` 的直接子元素 → 是 Flex 项目 ✅
- `p` 是 `.item` 的子元素，不是 `.container` 的直接子元素 → 不是 Flex 项目 ❌

---

**如果想让 `p` 也使用 Flex 布局**：

```css
.container {
  display: flex;  /* 第一层 Flex */
}

.item {
  display: flex;  /* 第二层 Flex，嵌套使用 */
}
```

**关系图**：

```txt
.container (Flex 容器)
  ├─ .item (Flex 项目 + Flex 容器) ✅
  │   └─ p (Flex 项目) ✅
  └─ .item (Flex 项目 + Flex 容器) ✅
      └─ p (Flex 项目) ✅
```

---

#### 7.1.6 Flex 容器的默认行为

当你设置 `display: flex` 后，会发生以下变化：

**1. 子元素横向排列**

```txt
默认（block）：          Flex 后：
┌────┐                 ┌────┬────┬────┐
│ A  │                 │ A  │ B  │ C  │
├────┤       →         └────┴────┴────┘
│ B  │
├────┤
│ C  │
└────┘
```

**2. 子元素高度自动对齐**

```txt
不同高度的子元素：

┌────┐ ┌────┐ ┌────┐
│ A  │ │ B  │ │ C  │
│    │ │    │ │    │
│    │ └────┘ │    │
└────┘        │    │
              └────┘

Flex 后（默认 align-items: stretch）：

┌────┐ ┌────┐ ┌────┐
│ A  │ │ B  │ │ C  │
│    │ │    │ │    │
│    │ │    │ │    │  ← 高度自动拉伸对齐
└────┘ └────┘ └────┘
```

**3. 子元素宽度由内容决定**

```css
.container {
  display: flex;
}

.item {
  /* 不设置 width，宽度由内容决定 */
}
```

---

#### 7.1.7 常见问题

**问题1：为什么设置了 `display: flex`，子元素还是竖着排？**

```css
.container {
  display: flex;
  flex-direction: column;  /* ← 这行导致竖着排 */
}
```

**解决**：检查是否设置了 `flex-direction: column`，默认是 `row`（横排）

---

**问题2：为什么孙子元素不受 Flex 影响？**

```html
<div class="container">
  <div class="item">
    <p>我不受 Flex 影响</p>  <!-- 不是直接子元素 -->
  </div>
</div>
```

**解决**：只有直接子元素才是 Flex 项目，如果想控制孙子元素，需要在父元素上再设置 `display: flex`

---

**问题3：为什么子元素被压缩了？**

```css
.container {
  display: flex;
  width: 300px;
}

.item {
  width: 200px;  /* 3个子元素，总宽度 600px > 容器 300px */
}
```

**原因**：默认情况下，Flex 项目会自动缩小以适应容器

**解决**：
```css
.item {
  flex-shrink: 0;  /* 禁止缩小 */
}
```

---

#### 7.1.8 display: flex vs display: inline-flex

**两种 Flex 容器**：

```css
/* 块级 Flex 容器（常用） */
.container {
  display: flex;
}

/* 行内 Flex 容器（少用） */
.container {
  display: inline-flex;
}
```

**区别**：

| 特性 | `display: flex` | `display: inline-flex` |
|------|----------------|----------------------|
| 容器本身 | 块级元素，独占一行 | 行内元素，不独占一行 |
| 子元素布局 | 相同（都是 Flex 布局） | 相同（都是 Flex 布局） |
| 常用场景 | 大部分布局 | 行内的小组件 |

**可视化对比**：

```txt
display: flex（块级容器）：

┌─────────────────────────┐
│ [A][B][C]               │  ← 容器独占一行
└─────────────────────────┘
下一行内容

display: inline-flex（行内容器）：

文字 [A][B][C] 文字  ← 容器和文字在同一行
```

---

**💡 记忆要点**

```txt
✅ Flexbox 的核心：
1. 父元素设置 display: flex
2. 子元素自动成为 Flex 项目
3. 只有直接子元素才是 Flex 项目

✅ 默认行为：横向排布、垂直撑高、宽度随内容自适应
1. 子元素横向排列
2. 子元素高度自动对齐
3. 子元素宽度由内容决定

✅ 常用场景：
1. 导航栏（横向排列）
2. 卡片列表（横向排列）
3. 左右布局（两列分布）
4. 垂直居中（对齐方式）
```

> 理解容器与项目的关系是学习 Flexbox 的第一步，后面所有的属性都是在这个基础上展开的。

### 7.2 主轴、交叉轴、排列方式

理解 Flex 的关键是**主轴（main axis）**和**交叉轴（cross axis）**这两个概念。

💡 **核心理解**：
- **主轴**：Flex 项目排列的方向
- **交叉轴**：垂直于主轴的方向
- 主轴方向由 `flex-direction` 决定

---

#### 7.2.1 主轴与交叉轴

**默认情况（flex-direction: row）**：

- **主轴**：水平方向（从左到右）→
- **交叉轴**：垂直方向（从上到下）↓

**可视化理解**：

```txt
                  主轴 main axis →
         ┌────────────────────────────────────┐
交       │  ┌──────┐  ┌──────┐  ┌──────┐     │
叉       │  │ item │  │ item │  │ item │     │
轴       │  └──────┘  └──────┘  └──────┘     │
↓        └────────────────────────────────────┘
cross
axis
```

---

**当设置 flex-direction: column 时**：

- **主轴**：垂直方向（从上到下）↓
- **交叉轴**：水平方向（从左到右）→

**可视化理解**：

```txt
              主轴 main axis
                    ↓
         ┌──────────────────────────────┐
         │  ┌──────┐                   │
         │  │ item │                   │
         │  └──────┘                   │
         │  ┌──────┐                   │
         │  │ item │                   │
         │  └──────┘                   │
         │  ┌──────┐                   │
         │  │ item │                   │
         │  └──────┘                   │
         └──────────────────────────────┘
         → cross axis（交叉轴，水平方向）
```

---

#### 7.2.1.1 flex-direction：改变主轴方向

`flex-direction` 属性决定主轴的方向，有4个值：

**1. row（默认）**：主轴水平，从左到右

```css
.container {
  display: flex;
  flex-direction: row;
}
```

```txt
┌────────────────────────┐
│ [A] [B] [C]            │  ← 从左到右
└────────────────────────┘
```

---

**2. row-reverse**：主轴水平，从右到左

```css
.container {
  display: flex;
  flex-direction: row-reverse;
}
```

```txt
┌────────────────────────┐
│            [C] [B] [A] │  ← 从右到左（顺序反转）
└────────────────────────┘
```

💡 **应用场景**：阿拉伯语等从右到左的语言布局

---

**3. column**：主轴垂直，从上到下

```css
.container {
  display: flex;
  flex-direction: column;
}
```

```txt
┌──────┐
│ [A]  │  ← 从上到下
├──────┤
│ [B]  │
├──────┤
│ [C]  │
└──────┘
```

💡 **应用场景**：移动端垂直布局、侧边栏菜单

---

**4. column-reverse**：主轴垂直，从下到上

```css
.container {
  display: flex;
  flex-direction: column-reverse;
}
```

```txt
┌──────┐
│ [C]  │  ← 从下到上（顺序反转）
├──────┤
│ [B]  │
├──────┤
│ [A]  │
└──────┘
```

💡 **应用场景**：聊天界面（最新消息在底部）

---

**📊 flex-direction 对比表**

| 值 | 主轴方向 | 起点 | 终点 | 常用场景 |
|----|---------|------|------|---------|
| `row` | 水平 → | 左 | 右 | 导航栏、卡片列表 |
| `row-reverse` | 水平 ← | 右 | 左 | RTL 语言布局 |
| `column` | 垂直 ↓ | 上 | 下 | 移动端布局、侧边栏 |
| `column-reverse` | 垂直 ↑ | 下 | 上 | 聊天界面、时间线 |

---

**💡 记忆口诀**

```txt
主轴 = 元素排队的方向
交叉轴 = 垂直于主轴的方向

row（横排）：主轴 →，交叉轴 ↓
column（竖排）：主轴 ↓，交叉轴 →
```

---

**🔍 调试技巧：如何判断主轴方向**

```css
.container {
  display: flex;
  /* 看 flex-direction 的值 */
}
```

- 如果是 `row` 或 `row-reverse` → 主轴是水平的
- 如果是 `column` 或 `column-reverse` → 主轴是垂直的
- 如果没写 → 默认是 `row`（水平）

---

#### 7.2.1.2 主轴和交叉轴的实际应用

**示例1：水平导航栏**

```html
<nav class="nav">
  <a href="#">首页</a>
  <a href="#">产品</a>
  <a href="#">关于</a>
</nav>
```

```css
.nav {
  display: flex;
  flex-direction: row;  /* 主轴水平 */
}
```

**效果**：

```txt
主轴 →
┌─────────────────────────┐
│ [首页] [产品] [关于]    │  ← 沿主轴横向排列
└─────────────────────────┘
```

---

**示例2：垂直侧边栏**

```html
<aside class="sidebar">
  <a href="#">仪表盘</a>
  <a href="#">用户</a>
  <a href="#">设置</a>
</aside>
```

```css
.sidebar {
  display: flex;
  flex-direction: column;  /* 主轴垂直 */
}
```

**效果**：

```txt
主轴 ↓
┌──────────┐
│ 仪表盘   │  ← 沿主轴垂直排列
├──────────┤
│ 用户     │
├──────────┤
│ 设置     │
└──────────┘
```

---

> **关键理解**：**主轴 = 元素排队的方向**，交叉轴就是垂直于主轴的那条轴。后面所有的对齐属性都是基于主轴和交叉轴来工作的。

#### 7.2.2 沿主轴的排列：justify-content

`justify-content` 决定 **项目沿主轴方向的对齐方式**。

💡 **核心理解**：
- 控制项目在**主轴**上的分布
- 主轴是水平时，控制左右分布
- 主轴是垂直时，控制上下分布

---

**常用值（6个）**：

**1. flex-start（默认）**：靠近主轴起点

```css
.container {
  display: flex;
  justify-content: flex-start;
}
```

```txt
┌─────────────────────────────┐
│ [A][B][C]                   │  ← 靠左（主轴起点）
└─────────────────────────────┘
```

---

**2. flex-end**：靠近主轴终点

```css
.container {
  display: flex;
  justify-content: flex-end;
}
```

```txt
┌─────────────────────────────┐
│                   [A][B][C] │  ← 靠右（主轴终点）
└─────────────────────────────┘
```

---

**3. center**：居中

```css
.container {
  display: flex;
  justify-content: center;
}
```

```txt
┌─────────────────────────────┐
│         [A][B][C]           │  ← 居中
└─────────────────────────────┘
```

💡 **应用场景**：卡片居中、按钮居中

---

**4. space-between**：两端对齐，项目之间平均分配间距

```css
.container {
  display: flex;
  justify-content: space-between;
}
```

```txt
┌─────────────────────────────┐
│ [A]         [B]         [C] │  ← 两端贴边，中间均分
└─────────────────────────────┘
```

💡 **应用场景**：导航栏（Logo 左，菜单右）

---

**5. space-around**：项目两侧都有间距

```css
.container {
  display: flex;
  justify-content: space-around;
}
```

```txt
┌─────────────────────────────┐
│  [A]      [B]      [C]      │  ← 两端有间距，中间间距是两端的2倍
└─────────────────────────────┘
   ↑        ↑        ↑
   1份     2份      2份     1份
```

💡 **关键理解**：
- 每个项目左右各有 1 份间距
- 相邻项目之间的间距 = 1 + 1 = 2 份
- 两端的间距 = 1 份

---

**6. space-evenly**：项目之间和两端间距都相等

```css
.container {
  display: flex;
  justify-content: space-evenly;
}
```

```txt
┌─────────────────────────────┐
│   [A]     [B]     [C]       │  ← 所有间距相等
└─────────────────────────────┘
    ↑       ↑       ↑       ↑
    1份     1份     1份     1份
```

💡 **应用场景**：均匀分布的按钮组

---

**📊 justify-content 对比表**

| 值 | 效果 | 两端是否贴边 | 项目间距 | 常用场景 |
|----|------|------------|---------|---------|
| `flex-start` | 靠起点 | 起点贴边 | 无间距 | 默认布局 |
| `flex-end` | 靠终点 | 终点贴边 | 无间距 | 右对齐 |
| `center` | 居中 | 不贴边 | 无间距 | 居中布局 |
| `space-between` | 两端对齐 | 两端贴边 | 均分 | 导航栏 |
| `space-around` | 环绕分布 | 不贴边 | 中间是两端的2倍 | 卡片列表 |
| `space-evenly` | 均匀分布 | 不贴边 | 完全相等 | 按钮组 |

---

**🎨 可视化对比（完整版）**

```txt
容器宽度：400px，3个项目

flex-start:
┌────────────────────────────────────┐
│[A][B][C]                           │
└────────────────────────────────────┘

center:
┌────────────────────────────────────┐
│            [A][B][C]               │
└────────────────────────────────────┘

flex-end:
┌────────────────────────────────────┐
│                           [A][B][C]│
└────────────────────────────────────┘

space-between:
┌────────────────────────────────────┐
│[A]              [B]              [C]│
└────────────────────────────────────┘

space-around:
┌────────────────────────────────────┐
│  [A]          [B]          [C]     │
└────────────────────────────────────┘
  ↑1份       ↑2份        ↑2份      ↑1份

space-evenly:
┌────────────────────────────────────┐
│   [A]        [B]        [C]        │
└────────────────────────────────────┘
   ↑1份      ↑1份      ↑1份       ↑1份
```

---

**💡 实际应用示例**

**示例1：导航栏（Logo 左，菜单右）**

```html
<header class="header">
  <div class="logo">Logo</div>
  <nav class="nav">
    <a href="#">首页</a>
    <a href="#">产品</a>
    <a href="#">关于</a>
  </nav>
</header>
```

```css
.header {
  display: flex;
  justify-content: space-between;  /* Logo 和 nav 分居两端 */
  align-items: center;
}
```

**效果**：

```txt
┌──────────────────────────────────────┐
│ Logo              [首页][产品][关于] │
└──────────────────────────────────────┘
```

---

**示例2：按钮组居中**

```html
<div class="button-group">
  <button>取消</button>
  <button>确定</button>
</div>
```

```css
.button-group {
  display: flex;
  justify-content: center;  /* 按钮居中 */
  gap: 16px;
}
```

**效果**：

```txt
┌──────────────────────────────────────┐
│           [取消]  [确定]             │
└──────────────────────────────────────┘
```

---

#### 7.2.3 沿交叉轴的对齐：align-items

`align-items` 决定 **项目在交叉轴上的对齐方式**。

💡 **核心理解**：
- 控制项目在**交叉轴**上的对齐
- 主轴是水平时，控制上下对齐
- 主轴是垂直时，控制左右对齐

---

**常用值（5个）**：

**1. stretch（默认）**：拉伸填满容器

```css
.container {
  display: flex;
  align-items: stretch;  /* 默认值 */
  height: 200px;
}
```

```txt
┌─────────────────────────────┐
│ ┌───┐ ┌───┐ ┌───┐          │
│ │ A │ │ B │ │ C │          │  ← 高度自动拉伸
│ │   │ │   │ │   │          │     填满容器
│ │   │ │   │ │   │          │
│ └───┘ └───┘ └───┘          │
└─────────────────────────────┘
```

⚠️ **注意**：只有项目**没有设置高度**时才会拉伸

---

**2. flex-start**：靠交叉轴起点

```css
.container {
  display: flex;
  align-items: flex-start;
  height: 200px;
}
```

```txt
┌─────────────────────────────┐
│ ┌───┐ ┌───┐ ┌───┐          │  ← 靠顶部（交叉轴起点）
│ │ A │ │ B │ │ C │          │
│ └───┘ └───┘ └───┘          │
│                             │
│                             │
└─────────────────────────────┘
```

---

**3. flex-end**：靠交叉轴终点

```css
.container {
  display: flex;
  align-items: flex-end;
  height: 200px;
}
```

```txt
┌─────────────────────────────┐
│                             │
│                             │
│ ┌───┐ ┌───┐ ┌───┐          │  ← 靠底部（交叉轴终点）
│ │ A │ │ B │ │ C │          │
│ └───┘ └───┘ └───┘          │
└─────────────────────────────┘
```

---

**4. center**：居中

```css
.container {
  display: flex;
  align-items: center;
  height: 200px;
}
```

```txt
┌─────────────────────────────┐
│                             │
│ ┌───┐ ┌───┐ ┌───┐          │  ← 垂直居中
│ │ A │ │ B │ │ C │          │
│ └───┘ └───┘ └───┘          │
│                             │
└─────────────────────────────┘
```

💡 **应用场景**：垂直居中（最常用！）

---

**5. baseline**：按文本基线对齐

```css
.container {
  display: flex;
  align-items: baseline;
}
```

```txt
┌─────────────────────────────┐
│ ┌───┐ ┌─────┐ ┌───┐        │
│ │ A │ │  B  │ │ C │        │  ← 文字底部对齐
│ └───┘ │     │ └───┘        │
│       └─────┘              │
└─────────────────────────────┘
     ↑      ↑      ↑
     文字基线对齐
```

💡 **应用场景**：不同字号的文字对齐

---

**📊 align-items 对比表**

| 值 | 效果 | 是否拉伸 | 常用场景 |
|----|------|---------|---------|
| `stretch` | 拉伸填满 | ✅ 是 | 等高卡片 |
| `flex-start` | 靠起点 | ❌ 否 | 顶部对齐 |
| `flex-end` | 靠终点 | ❌ 否 | 底部对齐 |
| `center` | 居中 | ❌ 否 | 垂直居中（最常用） |
| `baseline` | 基线对齐 | ❌ 否 | 文字对齐 |

---

**🎨 可视化对比（完整版）**

```txt
容器高度：200px，3个不同高度的项目

stretch（默认）:
┌─────────────────────────────┐
│ ┌───┐ ┌───┐ ┌───┐          │
│ │ A │ │ B │ │ C │          │  ← 全部拉伸到200px
│ │   │ │   │ │   │          │
│ │   │ │   │ │   │          │
│ └───┘ └───┘ └───┘          │
└─────────────────────────────┘

flex-start:
┌─────────────────────────────┐
│ ┌───┐ ┌─┐ ┌─────┐          │  ← 靠顶部
│ │ A │ │B│ │  C  │          │
│ └───┘ └─┘ │     │          │
│            └─────┘          │
│                             │
└─────────────────────────────┘

center:
┌─────────────────────────────┐
│                             │
│ ┌───┐ ┌─┐ ┌─────┐          │  ← 垂直居中
│ │ A │ │B│ │  C  │          │
│ └───┘ └─┘ └─────┘          │
│                             │
└─────────────────────────────┘

flex-end:
┌─────────────────────────────┐
│                             │
│       ┌─┐                   │
│ ┌───┐ │B│ ┌─────┐          │  ← 靠底部
│ │ A │ └─┘ │  C  │          │
│ └───┘     └─────┘          │
└─────────────────────────────┘
```

---

**💡 实际应用示例**

**示例1：垂直居中（最常用）**

```html
<div class="card">
  <img src="icon.png" alt="图标">
  <h3>标题</h3>
</div>
```

```css
.card {
  display: flex;
  align-items: center;  /* 垂直居中 */
  gap: 16px;
}
```

**效果**：

```txt
┌──────────────────────┐
│ ┌────┐ 标题          │  ← 图标和文字垂直居中
│ │图标│               │
│ └────┘               │
└──────────────────────┘
```

---

**示例2：完美居中（水平+垂直）**

```html
<div class="center-box">
  <button>点击我</button>
</div>
```

```css
.center-box {
  display: flex;
  justify-content: center;  /* 水平居中 */
  align-items: center;      /* 垂直居中 */
  height: 300px;
}
```

**效果**：

```txt
┌──────────────────────┐
│                      │
│                      │
│      [点击我]        │  ← 完美居中
│                      │
│                      │
└──────────────────────┘
```

---

**💡 组合记忆**

```txt
justify-content：控制主轴方向的对齐
  - 主轴是水平 → 控制左右
  - 主轴是垂直 → 控制上下

align-items：控制交叉轴方向的对齐
  - 主轴是水平 → 控制上下
  - 主轴是垂直 → 控制左右

记忆口诀：
justify（正义）→ 主轴（main）→ 主要方向
align（对齐）→ 交叉轴（cross）→ 次要方向
```

---

**🔍 常见问题**

**问题1：为什么 align-items: center 不生效？**

```css
.container {
  display: flex;
  align-items: center;
  /* 没有设置高度！ */
}
```

**原因**：容器没有高度，无法垂直居中

**解决**：
```css
.container {
  display: flex;
  align-items: center;
  height: 200px;  /* 或 min-height: 200px */
}
```

---

**问题2：为什么 justify-content 和 align-items 搞混了？**

**记忆技巧**：
- `justify-content`：**j**ustify 的 **j** 像箭头 →，控制主轴（横向）
- `align-items`：**a**lign 的 **a** 像箭头 ↑，控制交叉轴（纵向）

（这只是记忆技巧，实际上取决于 flex-direction）

### 7.3 对齐、换行、伸缩规则

---

#### 7.3.1 是否允许换行：flex-wrap

默认情况下，如果项目太多，Flex 容器会把所有项目挤在同一行，导致项目被压缩。

💡 **核心理解**：
- `flex-wrap` 控制项目是否换行
- 默认是 `nowrap`（不换行）
- 设置 `wrap` 可以实现响应式布局

---

**常用值（3个）**：

**1. nowrap（默认）**：不换行，所有项目挤在一行

```css
.container {
  display: flex;
  flex-wrap: nowrap;  /* 默认值 */
  width: 400px;
}

.item {
  width: 150px;  /* 3个项目，总宽度 450px > 容器 400px */
}
```

**效果**：

```txt
容器宽度：400px
项目宽度：150px × 3 = 450px（超出容器）

┌──────────────────────────────┐
│ [A][B][C]                    │  ← 3个项目被压缩到一行
└──────────────────────────────┘
  ↑   ↑   ↑
  每个被压缩到约 133px
```

⚠️ **问题**：项目会被压缩，可能导致内容显示不全

---

**2. wrap**：允许换行

```css
.container {
  display: flex;
  flex-wrap: wrap;  /* 允许换行 */
  width: 400px;
}

.item {
  width: 150px;
}
```

**效果**：

```txt
容器宽度：400px
第一行：150px + 150px = 300px（放得下2个）
第二行：150px（剩余1个换行）

┌──────────────────────────────┐
│ [A] [B]                      │  ← 第一行放2个
│ [C]                          │  ← 第二行放1个
└──────────────────────────────┘
```

💡 **应用场景**：响应式卡片列表、标签云

---

**3. wrap-reverse**：换行，但交叉轴反向

```css
.container {
  display: flex;
  flex-wrap: wrap-reverse;  /* 反向换行 */
  width: 400px;
}

.item {
  width: 150px;
}
```

**效果**：

```txt
容器宽度：400px，每个 item 宽 150px

正常 wrap：                      wrap-reverse：
┌──────────────────────┐         ┌──────────────────────┐
│ [A] [B]              │ 第1行   │ [C]                  │ ← 第2行（往上堆）
│ [C]                  │ 第2行   │ [A] [B]              │ ← 第1行（沉到底）
└──────────────────────┘         └──────────────────────┘
  交叉轴 ↓（向下）                  交叉轴 ↑（反向，向上）

元素顺序不变（A→B→C），只是新行往上堆而不是往下
```

💡 **应用场景**：少用，特殊布局需求

---

**📊 flex-wrap 对比表**

| 值 | 是否换行 | 换行方向 | 常用场景 |
|----|---------|---------|---------|
| `nowrap` | ❌ 否 | - | 导航栏（固定一行） |
| `wrap` | ✅ 是 | 从上到下 | 响应式卡片列表 |
| `wrap-reverse` | ✅ 是 | 从下到上 | 特殊布局 |

---

**🎨 可视化对比（完整版）**

```txt
容器宽度：400px，5个项目，每个宽度 120px

nowrap（默认）:
┌──────────────────────────────┐
│ [A][B][C][D][E]              │  ← 全部挤在一行，每个被压缩到80px
└──────────────────────────────┘

wrap:
┌──────────────────────────────┐
│ [A] [B] [C]                  │  ← 第一行放3个（360px）
│ [D] [E]                      │  ← 第二行放2个（240px）
└──────────────────────────────┘

wrap-reverse:
┌──────────────────────────────┐
│ [D] [E]                      │  ← 第二行（在上面）
│ [A] [B] [C]                  │  ← 第一行（在下面）
└──────────────────────────────┘
```

---

**💡 实际应用示例**

**示例1：响应式卡片列表**

```html
<div class="card-list">
  <div class="card">卡片1</div>
  <div class="card">卡片2</div>
  <div class="card">卡片3</div>
  <div class="card">卡片4</div>
  <div class="card">卡片5</div>
</div>
```

```css
.card-list {
  display: flex;
  flex-wrap: wrap;  /* 允许换行 */
  gap: 16px;        /* 项目之间的间距 */
}

.card {
  width: 240px;     /* 固定宽度 */
  height: 200px;
  background: #f0f0f0;
  border-radius: 8px;
}
```

**效果**：

```txt
容器宽度：800px

┌────────────────────────────────────────────────────────┐
│ [卡片1] [卡片2] [卡片3]                                │  ← 第一行放3个
│ [卡片4] [卡片5]                                        │  ← 第二行放2个
└────────────────────────────────────────────────────────┘

容器宽度：500px（窗口缩小）

┌──────────────────────────────┐
│ [卡片1] [卡片2]              │  ← 第一行放2个
│ [卡片3] [卡片4]              │  ← 第二行放2个
│ [卡片5]                      │  ← 第三行放1个
└──────────────────────────────┘
```

💡 **关键理解**：
- 容器宽度改变时，卡片会自动调整换行
- 实现了响应式布局，不需要媒体查询

---

**示例2：标签云**

```html
<div class="tags">
  <span class="tag">HTML</span>
  <span class="tag">CSS</span>
  <span class="tag">JavaScript</span>
  <span class="tag">React</span>
  <span class="tag">Vue</span>
  <span class="tag">Node.js</span>
</div>
```

```css
.tags {
  display: flex;
  flex-wrap: wrap;  /* 允许换行 */
  gap: 8px;
}

.tag {
  padding: 6px 12px;
  background: #e0f2fe;
  border-radius: 4px;
  font-size: 14px;
}
```

**效果**：

```txt
┌──────────────────────────────────────────┐
│ [HTML] [CSS] [JavaScript] [React]       │  ← 第一行
│ [Vue] [Node.js]                          │  ← 第二行
└──────────────────────────────────────────┘
```

---

**🔍 常见问题**

**问题1：为什么设置了 flex-wrap: wrap，但还是不换行？**

```css
.container {
  display: flex;
  flex-wrap: wrap;
  /* 没有设置容器宽度！ */
}

.item {
  width: 200px;
}
```

**原因**：容器没有宽度限制，会自动扩展以容纳所有项目

**解决**：
```css
.container {
  display: flex;
  flex-wrap: wrap;
  width: 600px;  /* 或 max-width: 100% */
}
```

---

**问题2：换行后项目之间的间距怎么设置？**

**方法1：使用 gap（推荐，现代浏览器）**

```css
.container {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;  /* 行间距和列间距都是 16px */
}
```

**方法2：使用 margin（兼容性好）**

```css
.container {
  display: flex;
  flex-wrap: wrap;
  margin: -8px;  /* 负边距抵消子元素的 margin */
}

.item {
  margin: 8px;  /* 每个项目的间距 */
}
```

---

**💡 记忆要点**

```txt
✅ flex-wrap 的作用：
- 控制项目是否换行
- 默认 nowrap（不换行，会压缩）
- 设置 wrap（换行，响应式）

✅ 常用场景：
- 卡片列表（wrap）
- 标签云（wrap）
- 导航栏（nowrap）

✅ 配合使用：
- gap：设置间距
- align-content：控制多行对齐
```

#### 7.3.2 多行对齐：align-content

当 `flex-wrap: wrap` 时，会出现多行。这时 `align-content` 用来控制**多行整体在交叉轴上的分布**。

💡 **核心理解**：
- `align-content` 只在**多行**时生效
- 控制多行之间的间距和对齐
- 类似于 `justify-content`，但作用于交叉轴

---

**⚠️ 重要区别**

```txt
align-items：控制单行内项目的对齐
  ┌──────────────────┐
  │ [A] [B] [C]      │  ← 控制这一行内的对齐
  └──────────────────┘

align-content：控制多行之间的分布
  ┌──────────────────┐
  │ [A] [B] [C]      │  ← 第一行
  │                  │  ← 控制行与行之间的间距
  │ [D] [E]          │  ← 第二行
  └──────────────────┘
```

---

**常用值（6个）**：

**1. stretch（默认）**：拉伸填满容器

```css
.container {
  display: flex;
  flex-wrap: wrap;
  align-content: stretch;  /* 默认值 */
  height: 400px;
}
```

```txt
┌──────────────────┐
│ [A] [B] [C]      │  ← 第一行拉伸
│                  │
├──────────────────┤
│ [D] [E]          │  ← 第二行拉伸
│                  │
└──────────────────┘
```

---

**2. flex-start**：靠交叉轴起点

```css
.container {
  display: flex;
  flex-wrap: wrap;
  align-content: flex-start;
  height: 400px;
}
```

```txt
┌──────────────────┐
│ [A] [B] [C]      │  ← 第一行
│ [D] [E]          │  ← 第二行
│                  │
│                  │  ← 剩余空间
└──────────────────┘
```

---

**3. center**：居中

```css
.container {
  display: flex;
  flex-wrap: wrap;
  align-content: center;
  height: 400px;
}
```

```txt
┌──────────────────┐
│                  │
│ [A] [B] [C]      │  ← 第一行
│ [D] [E]          │  ← 第二行（整体居中）
│                  │
└──────────────────┘
```

---

**4. space-between**：两端对齐

```css
.container {
  display: flex;
  flex-wrap: wrap;
  align-content: space-between;
  height: 400px;
}
```

```txt
┌──────────────────┐
│ [A] [B] [C]      │  ← 第一行（贴顶部）
│                  │
│                  │  ← 中间均分空间
│                  │
│ [D] [E]          │  ← 第二行（贴底部）
└──────────────────┘
```

---

**5. space-around**：环绕分布

```css
.container {
  display: flex;
  flex-wrap: wrap;
  align-content: space-around;
  height: 400px;
}
```

```txt
┌──────────────────┐
│                  │  ← 1份间距
│ [A] [B] [C]      │  ← 第一行
│                  │  ← 2份间距
│ [D] [E]          │  ← 第二行
│                  │  ← 1份间距
└──────────────────┘
```

---

**6. space-evenly**：均匀分布

```css
.container {
  display: flex;
  flex-wrap: wrap;
  align-content: space-evenly;
  height: 400px;
}
```

```txt
┌──────────────────┐
│                  │  ← 1份间距
│ [A] [B] [C]      │  ← 第一行
│                  │  ← 1份间距
│ [D] [E]          │  ← 第二行
│                  │  ← 1份间距
└──────────────────┘
```

---

**📊 align-content vs align-items 对比**

| 属性 | 作用对象 | 何时生效 | 控制方向 |
|------|---------|---------|---------|
| `align-items` | 单行内的项目 | 单行或多行都生效 | 交叉轴（项目对齐） |
| `align-content` | 多行整体 | 只在多行时生效 | 交叉轴（行间分布） |

---

**💡 实际应用示例**

```html
<div class="gallery">
  <div class="photo">照片1</div>
  <div class="photo">照片2</div>
  <div class="photo">照片3</div>
  <div class="photo">照片4</div>
  <div class="photo">照片5</div>
</div>
```

```css
.gallery {
  display: flex;
  flex-wrap: wrap;
  align-content: flex-start;  /* 多行靠顶部 */
  gap: 16px;
  height: 600px;
}

.photo {
  width: 200px;
  height: 150px;
  background: #f0f0f0;
}
```

---

**🔍 常见问题**

**问题：为什么 align-content 不生效？**

```css
.container {
  display: flex;
  flex-wrap: nowrap;  /* ← 没有换行！ */
  align-content: center;  /* 不生效 */
}
```

**原因**：`align-content` 只在多行时生效，单行时无效

**解决**：
```css
.container {
  display: flex;
  flex-wrap: wrap;  /* 允许换行 */
  align-content: center;
}
```

---

#### 7.3.3 单个项目的对齐覆盖：align-self

有时候你希望某一个项目的对齐方式和其他兄弟不一样，可以使用 `align-self`。

💡 **核心理解**：
- `align-self` 作用于**单个项目**
- 覆盖容器的 `align-items` 设置
- 只影响当前项目，不影响其他项目

---

**常用值（5个）**：

- `auto`（默认）：继承父容器的 `align-items`
- `flex-start`：靠交叉轴起点
- `flex-end`：靠交叉轴终点
- `center`：居中
- `baseline`：文字基线对齐——不同字号的 item，文字底部对齐在同一条线上
- `stretch`：拉伸填满容器高度（item 不能有固定高度，否则无效）

---

**💡 实际应用示例**

**示例1：特殊项目单独对齐**

```html
<div class="nav">
  <a href="#" class="logo">Logo</a>
  <a href="#">首页</a>
  <a href="#">产品</a>
  <a href="#" class="login">登录</a>
</div>
```

```css
.nav {
  display: flex;
  align-items: center;  /* 所有项目居中 */
  height: 60px;
}

.login {
  align-self: flex-end;  /* 登录按钮靠底部 */
  margin-left: auto;     /* 推到最右边 */
}
```

**效果**：

```txt
┌──────────────────────────────────┐
│ Logo  首页  产品                 │  ← 其他项目居中
│                          登录    │  ← 登录按钮靠底部
└──────────────────────────────────┘
```

---

**示例2：卡片高度不同时的对齐**

```html
<div class="cards">
  <div class="card">短内容</div>
  <div class="card tall">长内容<br>第二行<br>第三行</div>
  <div class="card">短内容</div>
</div>
```

```css
.cards {
  display: flex;
  align-items: flex-start;  /* 默认靠顶部 */
}

.tall {
  align-self: center;  /* 高卡片居中 */
}
```

**效果**：

```txt
┌──────────────────────────────────┐
│ ┌────┐        ┌────┐             │
│ │短  │        │短  │             │
│ └────┘ ┌────┐ └────┘             │
│        │长  │                     │  ← 高卡片居中
│        │第二│                     │
│        │第三│                     │
│        └────┘                     │
└──────────────────────────────────┘
```

---

**📊 align-self vs align-items 对比**

| 属性 | 作用对象 | 设置位置 | 优先级 |
|------|---------|---------|-------|
| `align-items` | 所有项目 | 容器上 | 低 |
| `align-self` | 单个项目 | 项目上 | 高（覆盖 align-items） |

---

**💡 记忆要点**

```txt
✅ align-self 的作用：
- 单个项目的对齐方式
- 覆盖容器的 align-items
- 值和 align-items 相同

✅ 常用场景：
- 特殊项目需要不同对齐
- 某个项目需要突出显示
- 响应式布局中的特殊处理
```

#### 7.3.4 伸缩规则：flex-grow / flex-shrink / flex-basis

这是 Flexbox 最核心也是最难理解的部分。理解了这三个属性，你就掌握了 Flexbox 的精髓。

💡 **核心理解**：
- `flex-basis`：元素在主轴上的「基础尺寸」（类似 width，但用于 Flex 计算），默认值为 auto（使用项目自身尺寸）
  - `auto`：以自身宽高为准
  - 固定值：`200px`、`30%` 等
  - `0`：忽略自身尺寸，完全按剩余空间分配
- `flex-grow`：空间有剩余时，如何**分配多余空间**（扩展系数），默认值为 0（不扩展）
  - 计算规则：所有项目 grow 值相加 = 总份数，单个项目获得 `剩余空间 × 自身grow / 总grow和`
- `flex-shrink`：空间不足时，如何**压缩项目**（收缩系数），默认值为 1（允许收缩）
  - `0`：禁止缩小，强制保持原尺寸

🧠 **换个角度理解**：把每个 flex item 想象成一个员工——
- `flex-basis`：入职时的「基础能力」，天生就有这么大
- `flex-grow`：有多余资源时，愿意承担多少额外工作（潜力/扩展欲）
- `flex-shrink`：资源紧张时，能承受多大压缩（抗压能力）

📌 **极简背诵**：basis 是底子，grow 有空就长胖，shrink 不够就变瘦

通常我们用简写属性 `flex`：

```css
/* flex: grow shrink basis */
.item {
  flex: 1 1 200px;
}
```

常见方便写法：

- `flex: 1;` 等价于 `flex: 1 1 0%`，表示：
  - 允许扩展、允许缩小
  - 基础尺寸为 0（空间按比例分）

示例：

```css
.left {
  flex: 2;   /* 占两份 */
}
.right {
  flex: 1;   /* 占一份 */
}
```

占比示意：

```txt
|────────────── 父容器 ──────────────|

 [    left(2份)     ][ right(1份) ]

可以理解为：一共 3 份空间，left 占 2 份，right 占 1 份。
```

左右两部分会按 2:1 分摊剩余空间，非常适合做左右布局。

---

**📊 常用 flex 简写值对比**

| 值 | 等价于 | grow | shrink | basis | 含义 | 常用场景 |
|----|--------|------|--------|-------|------|---------|
| `flex: 1` | `flex: 1 1 0%` | 1 | 1 | 0% | 等分空间 | 等宽列 |
| `flex: auto` | `flex: 1 1 auto` | 1 | 1 | auto | 自适应内容 | 响应式 |
| `flex: none` | `flex: 0 0 auto` | 0 | 0 | auto | 固定尺寸 | Logo |
| `flex: 2` | `flex: 2 1 0%` | 2 | 1 | 0% | 占2份 | 2:1布局 |
| `flex: 0 0 200px` | - | 0 | 0 | 200px | 固定200px | 侧边栏 |

---

**💡 实际应用示例**

**示例1：等分布局（最常用）**

```html
<div class="container">
  <div class="col">列1</div>
  <div class="col">列2</div>
  <div class="col">列3</div>
</div>
```

```css
.container {
  display: flex;
}

.col {
  flex: 1;  /* 等分空间 */
}
```

**效果**：每列宽度完全相等

---

**示例2：固定侧边栏 + 自适应主内容**

```html
<div class="layout">
  <aside class="sidebar">侧边栏</aside>
  <main class="main">主内容</main>
</div>
```

```css
.layout {
  display: flex;
}

.sidebar {
  flex: 0 0 200px;  /* 固定 200px，不扩展不收缩 */
  background: #f0f0f0;
}

.main {
  flex: 1;  /* 占据剩余空间 */
}
```

**效果**：

```txt
┌──────────────────────────────────┐
│ [侧边栏] [      主内容      ]    │  ← 侧边栏固定 200px
│  200px    自动填充剩余空间       │
└──────────────────────────────────┘
```

---

**示例3：Logo + 导航 + 按钮**

```html
<header class="header">
  <div class="logo">Logo</div>
  <nav class="nav">
    <a href="#">首页</a>
    <a href="#">产品</a>
  </nav>
  <button class="btn">登录</button>
</header>
```

```css
.header {
  display: flex;
  align-items: center;
  gap: 16px;
}

.logo {
  flex: none;  /* 固定尺寸 */
}

.nav {
  flex: 1;  /* 占据中间所有空间 */
  display: flex;
  gap: 16px;
}

.btn {
  flex: none;  /* 固定尺寸 */
}
```

**效果**：

```txt
┌──────────────────────────────────────────┐
│ Logo [首页][产品]              [登录]   │
│      ← nav 占据中间所有空间              │
└──────────────────────────────────────────┘
```

---

**🔍 常见问题**

**问题1：为什么 flex: 1 和 flex: auto 不一样？**

拆开读就很清楚：

| | grow | shrink | basis | 含义 |
|---|---|---|---|---|
| `flex: 1` | 1 | 1 | 0% | 有空就扩，不够就缩，**起点为 0** |
| `flex: auto` | 1 | 1 | auto | 有空就扩，不够就缩，**起点为自身大小** |

- 两者的 grow/shrink 完全一样：有剩余空间就变大占满，空间不够就压缩自己
- 唯一区别是 basis（初始大小）：`flex: 1` 从 0 开始平分，`flex: auto` 先占好自身内容的位置再分剩余

```css
/* flex: 1 → flex: 1 1 0% */
.item-1 {
  flex: 1;
}

/* flex: auto → flex: 1 1 auto */
.item-2 {
  flex: auto;
}
```

```txt
flex: 1（basis: 0%）：
所有人从 0 起跑，完全按 grow 比例平分容器
→ 内容多少不影响，宽度严格相等

flex: auto（basis: auto）：
先按自身内容占位，剩余空间再按 grow 比例分
→ 内容多的项目天然更宽
```

---

**问题2：为什么设置了 flex: 1，但宽度还是不相等？**

```css
.item {
  flex: 1;
  min-width: 200px;  /* ← 这行导致宽度不相等 */
}
```

**原因**：`min-width` 会限制最小宽度，即使 flex: 1 也无法缩小到 200px 以下

**解决**：
```css
.item {
  flex: 1;
  min-width: 0;  /* 重置 min-width */
}
```

---

**💡 心法总结**

多数时候你可以先记住：

- **等分**就写 `flex: 1;`
- **2:1** 就分别写 `flex: 2;` 和 `flex: 1;`
- **固定尺寸**就写 `flex: none;` 或 `flex: 0 0 200px;`

等更熟练时，再深入理解 `flex-basis` 的作用。

##### 7.3.4.1 “空间足够”和“空间不足”时会发生什么？

假设：

```css
.row {
  display: flex;
}
.row .item {
  flex: 1 1 200px;  /* grow:1, shrink:1, basis:200px */
}
```

- **空间足够时**（容器宽度 ≥ 3 × 200px）：

```txt
容器宽 800px，3 个 item，basis 总和 = 200×3 = 600px
剩余空间：800 - 600 = 200px

   200px     200px     200px
[ item1 ][ item2 ][ item3 ] + 200px 多余空间

因为 grow 都是 1，3 个 item 平分 200px：每个再分到 ~66px。
```

- **空间不足时**（容器宽度 < 3 × 200px）：

```txt
容器宽 500px，basis 总和 = 600px
需要“挤掉” 100px 才能塞下

因为 shrink 都是 1，每个 item 被等比例压缩：各减 ~33px。
```

> 记忆小结：
>
> - grow：决定“空间多时”谁长得快
> - shrink：决定“空间不够时”谁缩得多
> - basis：决定“起步时”的期望尺寸

#### 7.3.5 Flex 间距与“推开”技巧：gap 和 auto margin

前面已经多次用到 `gap`，但它在 Flex 里值得单独记住，因为它几乎已经替代了很多“子元素互相加 margin”的老写法。

💡 **核心理解**：
- `gap`：控制 **Flex 项目之间** 的间距
- `margin-left: auto` / `margin-top: auto`：把某个项目沿主轴“推开”
- 两者经常一起出现：`gap` 负责统一间距，`auto margin` 负责分区

---

**1. gap：项目之间留空，不污染外边缘**

```css
.toolbar {
  display: flex;
  gap: 16px;
}
```

**效果**：
- 每个项目之间都有 `16px` 间距
- 容器左右边缘不会额外冒出“半截 margin”
- 比给每个子元素加 `margin-right` 更直观

```txt
使用 gap：
[按钮1] 16px [按钮2] 16px [按钮3]

使用 margin：
[按钮1] 16px [按钮2] 16px [按钮3] 16px  ← 最后一个常常还要单独处理
```

---

**2. auto margin：让某个项目自动吃掉剩余空间**

这是导航栏、工具栏、卡片底部最常用的技巧之一。

```html
<header class="header">
  <div class="logo">Logo</div>
  <nav class="nav">
    <a href="#">首页</a>
    <a href="#">产品</a>
  </nav>
  <button class="login">登录</button>
</header>
```

```css
.header {
  display: flex;
  align-items: center;
  gap: 16px;
}

.login {
  margin-left: auto;  /* 吃掉左侧剩余空间，把自己推到最右边 */
}
```

**效果**：

```txt
┌──────────────────────────────────────────┐
│ Logo  首页  产品                  登录   │
│                    ↑                     │
│            login 左侧的 auto margin      │
│            吃掉了所有剩余空间             │
└──────────────────────────────────────────┘
```

---

**3. 当主轴变成竖直方向时，auto margin 的方向也要跟着变**

```css
.card {
  display: flex;
  flex-direction: column;
}

.card-button {
  margin-top: auto;  /* 把按钮推到卡片底部 */
}
```

这在“卡片内容高低不一，但按钮都要对齐到底部”的场景里非常常见。

---

**💡 实战对比：justify-content 和 auto margin 怎么选？**

- `justify-content`：控制**整组项目**怎么分布
- `margin-left: auto`：控制**某一个项目**往尽头推

```css
/* 适合整组分散 */
.nav {
  display: flex;
  justify-content: space-between;
}

/* 适合只把最后一个按钮推走 */
.nav {
  display: flex;
}

.login {
  margin-left: auto;
}
```

多数产品级布局里，`auto margin` 往往比 `space-between` 更稳，因为中间项目数量变化时不容易“间距被拉爆”。

---

**💡 记忆要点**

```txt
✅ gap：
- 控制项目之间的统一间距
- 比子元素写 margin 更自然
- 不影响容器外边缘

✅ auto margin：
- 某个项目想“自己滚到尽头”时最好用
- 横向主轴常见写法：margin-left: auto
- 纵向主轴常见写法：margin-top: auto
```

#### 7.3.6 order：改视觉顺序，不改 HTML 顺序

`order` 可以改变 Flex 项目的显示顺序，但它只改变**视觉上的排队顺序**，不会改变 HTML 里的真实顺序。

💡 **核心理解**：
- 默认每个项目的 `order` 都是 `0`
- 数值越小越靠前，数值越大越靠后
- 这是“显示顺序”的修改，不是“文档结构”的修改

---

**基础示例**：

```html
<div class="toolbar">
  <div class="search">搜索</div>
  <div class="filter">筛选</div>
  <div class="export">导出</div>
</div>
```

```css
.toolbar {
  display: flex;
  gap: 12px;
}

.export {
  order: -1;  /* 让导出按钮显示到最前面 */
}
```

**效果**：

```txt
默认顺序：
[搜索] [筛选] [导出]

设置 order 后：
[导出] [搜索] [筛选]
```

---

**⚠️ 为什么不要滥用？**

因为：
- 用户看到的顺序变了
- 但 DOM 顺序、阅读顺序、键盘 Tab 顺序、屏幕阅读器理解顺序可能没变

这意味着：
- 视觉上“提交按钮在前”
- 但辅助技术或键盘导航仍然按旧顺序走

所以 `order` 更适合：
- 轻微的视觉调整
- 小屏幕下局部重排

不适合：
- 把页面主要信息结构彻底打乱
- 用来弥补 HTML 结构设计本身的问题

---

**移动端常见场景**：

```css
.hero {
  display: flex;
  gap: 24px;
}

@media (max-width: 768px) {
  .hero {
    flex-direction: column;
  }

  .hero-image {
    order: -1;  /* 移动端让图片先显示 */
  }
}
```

---

**💡 记忆要点**

```txt
✅ order：
- 只改视觉顺序
- 默认值是 0
- 值越小越靠前

⚠️ 注意：
- 不改 HTML 顺序
- 不要拿它大规模颠倒信息结构
```

### 7.4 实战：写出响应式导航栏

做一个常见的导航栏结构：左边 Logo，右边是导航链接。

#### 7.4.1 HTML 结构

```html
<header class="site-header">
  <div class="logo">MySite</div>
  <nav class="nav">
    <a href="#">首页</a>
    <a href="#">产品</a>
    <a href="#">价格</a>
    <a href="#">关于</a>
  </nav>
</header>
```

#### 7.4.2 基础 Flex 布局

```css
.site-header {
  display: flex;
  align-items: center;           /* 垂直居中 */
  justify-content: space-between;/* 左右两端对齐 */
  padding: 0 24px;
  height: 64px;
}

.nav {
  display: flex;
  gap: 16px;                     /* 项目之间的间距（现代浏览器支持） */
}
```

这里的关键点：

- 顶部容器 `.site-header` 使用 `display: flex`，Logo 和 nav 成为两个 flex 项目
- `justify-content: space-between` 让两者分居两端
- nav 内部再使用一层 flex，让超链接一行排开

#### 7.4.3 简单响应式思路

小屏幕下你可能希望导航折叠成一个菜单按钮，这就需要配合 JavaScript 或更高级的 CSS 技巧，这里只先点到：

- 用媒体查询（`@media`）在小屏幕下改变：
  - 导航从横排变成竖排
  - 显示/隐藏菜单图标

> 总结：Flexbox 非常适合一维布局，尤其是“一行内如何排队、如何分配空间”的问题。在写任何复杂布局之前，都先问：这一部分能不能先用 Flex 搞定？

---

## 第8章 Grid：从“看不懂格子”到“真的会用”

> 如果你学 Flex 还比较顺，一到 Grid 就开始分不清方向、格子、对齐、合并、响应式，那太正常了。
>
> 这一章不按“属性字典”来背，而是按小白最容易卡住的顺序，一步一步把 Grid 讲透。

先记住一句最重要的话：

- **Flex 管一条线**
- **Grid 管一个面**

也就是说：

- Flex 更像在安排一排人怎么站队
- Grid 更像先把房间切成很多格子，再决定每个人住哪一格

---

### 8.1 先把 Flex 和 Grid 分清

很多人第一次学 Grid，会卡在一句话上：

> “我明明用 Flex 也能排啊，为什么还要学 Grid？”

答案很简单：**因为它们擅长解决的问题不一样。**

| 对比项 | Flex | Grid |
|------|------|------|
| 核心维度 | 一维布局 | 二维布局 |
| 你主要在管什么 | 一行或一列 | 行和列一起管 |
| 典型场景 | 导航栏、按钮组、左右排列 | 后台框架、卡片墙、杂志式布局 |
| 是否擅长合并区域 | 不擅长 | 很擅长 |
| 学习感受 | 上手快 | 一开始容易混 |

可以把它们这样理解：

- **Flex**：先决定大家排成一条线，然后再处理谁靠左、谁居中、谁占更多空间
- **Grid**：先把地板画成格子，再决定谁占几格、从哪里开始、到哪里结束

**实战里的常见搭配是：**

- 外层页面骨架用 Grid
- 内层按钮、标题、工具栏用 Flex

这不是二选一，而是**一起用最顺手**。

---

### 8.2 Grid 最核心的理解：父级画格子，子级自动往里放

Grid 最值得背的一句话是：

> **父元素负责画格子，子元素负责进格子。**

#### 8.2.1 最基础的 Grid 容器

```css
.grid {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  grid-auto-rows: 100px;
  gap: 12px;
}
```

这 4 行已经够你做出最基础的网格了：

- `display: grid`：开启网格布局
- `grid-template-columns`：定义列
- `grid-auto-rows`：自动补出来的行多高
- `gap`：格子之间的间距

配合 HTML：

```html
<div class="grid">
  <div>1</div>
  <div>2</div>
  <div>3</div>
  <div>4</div>
  <div>5</div>
  <div>6</div>
</div>
```

浏览器看到后会自动帮你排成这样：

```txt
┌─────┬─────┬─────┐
│  1  │  2  │  3  │
├─────┼─────┼─────┤
│  4  │  5  │  6  │
└─────┴─────┴─────┘
```

#### 8.2.2 为什么很多人一开始会懵

因为 Grid 表面上只是“排格子”，但它其实有两层：

1. **先划分格子**
2. **再决定内容在格子里怎么放**

所以你会同时碰到：

- 列怎么分
- 行怎么分
- 格子之间多大间距
- 元素跨几列几行
- 元素在格子里靠左还是居中

这也是它一开始比 Flex 难的根本原因。

#### 8.2.3 网格里几个最基本的名词

先不用死背英文，只要有画面感就行：

- **网格容器**：写了 `display: grid` 的父元素
- **网格项目**：它的直接子元素
- **网格线**：每一条分隔线
- **网格单元格**：一个小格子
- **网格区域**：多个格子合并后的大格子

```txt
列线1   列线2   列线3   列线4
  ↓       ↓       ↓       ↓
┌──────┬──────┬──────┐
│      │      │      │
├──────┼──────┼──────┤
│      │      │      │
└──────┴──────┴──────┘
↑
行线
```

你可以把它直接想成 Excel：

- 先有表格
- 再有单元格
- 再有合并单元格

#### 8.2.4 `grid-template-rows` 和 `grid-auto-rows` 的区别

这是新手很容易混的一组：

```css
.grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-template-rows: 80px 80px;
  grid-auto-rows: 120px;
}
```

它们的区别是：

- `grid-template-rows`：你**手动声明**的行
- `grid-auto-rows`：元素太多后，浏览器**自动补出来**的行

也就是：

```txt
前两行：你说了算
后面的行：浏览器自动加，但高度听 grid-auto-rows
```

**小结**

- 你不需要一开始就记很多属性
- 先记住：`display: grid` + 列 + 自动行高 + 间距
- 已经能做出非常多基础布局了

---

### 8.3 你最容易记混的地方：对齐属性一次讲透

Grid 最让人头大的通常不是画格子，而是这些长得很像的名字：

- `justify-content`
- `justify-items`
- `justify-self`
- `align-content`
- `align-items`
- `align-self`

别急，记两个规则就够了。

#### 8.3.1 先记方向

- `justify`：**水平**方向，左右
- `align`：**垂直**方向，上下

#### 8.3.2 再记“谁在动”

- `content`：管**整个网格表格**
- `items`：管**所有格子里的内容**
- `self`：只管**某一个项目自己**

你可以想象成一张桌子：

- **桌子放哪里**：`content`
- **所有盘子里的菜怎么摆**：`items`
- **我这一个盘子里的菜怎么摆**：`self`

#### 8.3.3 六个核心属性怎么分工

**写在父元素上：**

```css
.grid {
  justify-content: center;
  align-content: center;
  justify-items: center;
  align-items: center;
}
```

- `justify-content`：整个网格在容器里左右怎么放
- `align-content`：整个网格在容器里上下怎么放
- `justify-items`：所有项目在各自格子里左右怎么放
- `align-items`：所有项目在各自格子里上下怎么放

**写在某一个子元素上：**

```css
.item-special {
  justify-self: end;
  align-self: start;
}
```

- `justify-self`：我自己在格子里左右怎么放
- `align-self`：我自己在格子里上下怎么放

#### 8.3.4 `content` 为什么有时像没生效

这是最常见的疑惑之一。

比如：

```css
.grid {
  display: grid;
  width: 800px;
  grid-template-columns: 1fr 1fr 1fr;
  justify-content: center;
}
```

你可能会发现：**怎么写了也没反应？**

原因通常是：

> **整个网格本身已经撑满容器了，就没有可移动空间了。**

所以：

- `content` 不是永远都能动
- 它只有在“整个网格比容器小”的时候才明显

例如：

```css
.grid {
  width: 800px;
  grid-template-columns: 120px 120px 120px;
  justify-content: center;
}
```

这时总宽度只有 `360px`，网格表格小于容器，`justify-content` 才会把整个表格推到中间。

---

### 8.4 格子里的内容到底在对谁对齐

很多人学到这里会彻底乱掉：

> “我看到的是蓝色按钮，可你说的是格子。那到底是谁在移动？”

答案是：

> **Grid 里的对齐，很多时候移动的是“内容在格子里的位置”，不是格子本身。**

来看一个典型情况：

```css
.grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-auto-rows: 120px;
  justify-items: center;
  align-items: center;
}
```

如果每个格子是 120px 高，而里面按钮只有 40px 高，那么发生的是：

```txt
┌────────────────────┐
│                    │
│       [按钮]       │
│                    │
└────────────────────┘
```

也就是说：

- 格子没动
- 按钮在自己的格子里居中了

#### 8.4.1 默认为什么老是“铺满”

因为 Grid 项目默认常常会表现为 `stretch`。

这意味着：

- 格子多宽，项目就可能被拉多宽
- 格子多高，项目也可能跟着被拉高

所以你会觉得：

> “我明明没设置宽度，为什么它自己铺开了？”

答案就是默认拉伸。

#### 8.4.2 给元素写了宽高后，为什么 `stretch` 像失效了

例如：

```css
.item {
  width: 120px;
  height: 40px;
}
```

这时浏览器就不会再把它无限拉满格子了，因为你已经明确告诉它：

> “我自己就要这么大。”

所以很多“对齐失效”的本质，其实不是失效，而是：

- 你给了元素固定尺寸
- 浏览器就不再帮你拉伸

#### 8.4.3 `align-items` 已经居中了，`align-self` 还能动吗

能，而且这是非常重要的点。

```css
.grid {
  align-items: center;
}

.item-special {
  align-self: start;
}
```

效果是：

- 默认所有项目都垂直居中
- 但 `.item-special` 自己改成顶部对齐

注意两点：

1. **它不会跑出自己的格子**
2. **它只会在自己的格子内部移动**

所以 Grid 的 `self` 非常安全，不会像绝对定位那样把布局打乱。

#### 8.4.4 简写写法

```css
.grid {
  place-items: center;
}

.item-special {
  place-self: start end;
}
```

记法：

- `place-items` = `align-items` + `justify-items`
- `place-self` = `align-self` + `justify-self`

---

### 8.5 Grid 最有辨识度的功能：合并单元格

很多人真正觉得 Grid 好用，就是从“能合并单元格”开始的。

#### 8.5.1 最简单的写法：`span`

```css
.item-large {
  grid-column: span 2;
  grid-row: span 2;
}
```

意思是：

- 横向占 2 列
- 纵向占 2 行

这和 Excel 的“合并单元格”非常像。

```txt
正常：
┌───┬───┬───┐
│ 1 │ 2 │ 3 │
├───┼───┼───┤
│ 4 │ 5 │ 6 │
└───┴───┴───┘

第1项占2列2行：
┌───────┬───┐
│   1   │ 2 │
│       ├───┤
│       │ 3 │
├───┬───┼───┤
│ 4 │ 5 │ 6 │
└───┴───┴───┘
```

#### 8.5.2 再进一步：按网格线定位

如果你看到这种写法：

```css
.item-a {
  grid-column: 1 / 3;
  grid-row: 1 / 2;
}
```

别怕，它的意思其实很朴素：

- 从第 1 条列线开始
- 到第 3 条列线结束

因为是**线到线**，不是“格到格”，所以：

```txt
1 / 3
= 从第1条线到第3条线
= 中间会占到第1列和第2列
```

这也是很多新手第一次会误会的地方。

#### 8.5.3 `span` 和 `1 / 3` 怎么选

- 只想表达“占几列几行”时，用 `span`
- 想精确表达“从哪里开始到哪里结束”时，用网格线编号

通常：

- 简单卡片墙：`span`
- 复杂页面拼版：线编号更清楚

---

### 8.6 三个特别常用的工具：`fr`、`repeat()`、`minmax()`

这三个经常会一起出现，必须会。

#### 8.6.1 `fr`：分剩余空间

`fr` 可以理解成“几份”。

```css
.grid {
  display: grid;
  grid-template-columns: 200px 1fr 2fr;
}
```

意思是：

1. 先拿出固定的 `200px`
2. 剩下的空间分成 3 份
3. 第二列拿 1 份，第三列拿 2 份

所以 `fr` 最适合做：

- 主内容区自适应
- 左右栏比例分配
- 平分多列

#### 8.6.2 `repeat()`：少写重复代码

```css
.grid {
  grid-template-columns: repeat(3, 1fr);
}
```

等于：

```css
grid-template-columns: 1fr 1fr 1fr;
```

它的作用就是一句话：

> 本来要写 3 遍、4 遍、12 遍的东西，直接帮你压缩。

#### 8.6.3 `minmax()`：最小到最大

```css
.grid {
  grid-template-columns: repeat(3, minmax(200px, 1fr));
}
```

它的意思是：

- 最小不能小于 `200px`
- 最大可以拉伸到 `1fr`

`minmax()` 特别适合响应式场景，因为它能同时照顾：

- 小屏不要挤太小
- 大屏又别浪费空间

---

### 8.7 响应式最常用的一句：`repeat(auto-fit, minmax(200px, 1fr))`

这是 Grid 里最值得背的一行代码之一。

```css
.cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
}
```

第一次看到会觉得像天书，我们把它拆开：

#### 8.7.1 `minmax(200px, 1fr)` 是什么意思

- 每个卡片最小 `200px`
- 如果空间够，可以继续拉伸

也就是：

> 卡片不要小得难看，但能随着屏幕变宽而铺满一行。

#### 8.7.2 `auto-fit` 是什么意思

它的思路是：

> 一行能放几个，就放几个；放不下就自动换行。

所以屏幕宽度不同，列数会自动变化：

```txt
宽屏：
┌──────────────────────────────┐
│ [卡片][卡片][卡片][卡片]     │
└──────────────────────────────┘

中屏：
┌─────────────────────┐
│ [卡片][卡片][卡片]  │
└─────────────────────┘

窄屏：
┌─────────────┐
│ [卡片][卡片]│
│ [卡片][卡片]│
└─────────────┘

更窄：
┌────────┐
│ [卡片] │
│ [卡片] │
└────────┘
```

#### 8.7.3 `auto-fit` 和 `auto-fill` 有什么区别

这个问题很经典。

- `auto-fit`：项目少时，**会把已有项目拉开铺满**
- `auto-fill`：项目少时，**会保留空列位置**

简单记忆：

- **99% 的常规卡片列表优先用 `auto-fit`**
- 你真的想保留“空格子”时，再考虑 `auto-fill`

#### 8.7.4 最适合背下来的理解方式

```txt
repeat(auto-fit, minmax(200px, 1fr))
= 每个格子最小 200px
= 一行能放几个放几个
= 放不下自动换行
= 剩余空间自动拉伸铺满
```

把这行看懂，Grid 的响应式你就已经跨过一大坎了。

---

### 8.8 自动排布、隐式网格和“元素太多怎么办”

很多新手会担心：

> “我只定义了 3 列，结果放了 10 个元素，会不会坏掉？”

不会，浏览器会自动帮你往下补。

#### 8.8.1 默认自动排布：先一行，再下一行

```css
.grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
}
```

你不写位置时，Grid 默认会这样排：

```txt
┌───┬───┬───┐
│ 1 │ 2 │ 3 │
├───┼───┼───┤
│ 4 │ 5 │ 6 │
├───┼───┼───┤
│ 7 │ 8 │ 9 │
└───┴───┴───┘
```

这个默认规则就是：

```css
grid-auto-flow: row;
```

#### 8.8.2 `grid-auto-flow`

```css
.grid {
  grid-auto-flow: row;
}
```

常见值：

- `row`：按行填，先左到右，再上到下
- `column`：按列填，先上到下，再左到右
- `dense`：尽量回头补空洞

例如：

```css
.grid-dense {
  grid-auto-flow: row dense;
}
```

`dense` 适合图片墙、拼贴流，但要知道一件事：

> 它会优先让视觉更紧凑，不一定保证视觉顺序和源码顺序完全一致。

所以做阅读型内容时，不要随手就开。

#### 8.8.3 隐式网格：你没定义，浏览器也会补

当元素超过已定义轨道时，浏览器自动创建的新行、新列，就叫**隐式网格**。

这时最常配合的是：

```css
.grid {
  grid-auto-rows: 180px;
}
```

如果你想更灵活一点：

```css
.grid {
  grid-auto-rows: minmax(120px, auto);
}
```

意思是：

- 最低 120px
- 内容多时允许继续变高

如果你是按列自动排，还可能会用到：

```css
.grid {
  grid-auto-columns: 200px;
}
```

#### 8.8.4 `gap` 为什么比 `margin` 更适合网格

```css
.grid {
  gap: 16px;
}
```

因为 `gap` 只管**格子和格子之间**的距离，不会把外边缘也顶出去。

这比给每个项目写 `margin` 更省心：

- 不用处理第一列、最后一列的外边距
- 不用再配负边距去抵消
- Flex 和 Grid 都能通用

---

### 8.9 为什么你会感觉“有些属性失效了”

这一节是实战里最值钱的部分，因为很多 Grid 的痛苦都不是“不会写”，而是“写了没反应”。

#### 8.9.1 给子元素写了固定宽高，默认拉伸就不明显了

```css
.item {
  width: 120px;
  height: 40px;
}
```

这时你会发现：

- `stretch` 没以前那么明显
- 对齐行为看起来也变了

原因不是属性坏了，而是元素自己已经有尺寸了。

#### 8.9.2 用了 `fr`，`justify-content` 往往没什么存在感

比如：

```css
.grid {
  width: 900px;
  grid-template-columns: 1fr 1fr 1fr;
  justify-content: center;
}
```

`1fr` 会把剩余空间吃掉，整张表格本来就几乎铺满了容器，这时 `justify-content` 没空间可挪，自然看着“不生效”。

#### 8.9.3 `1fr` 不代表一定不会被内容撑爆

这是非常重要的一条。

很多人以为：

> “写了 `1fr`，那就肯定安全。”

其实不一定。长链接、长英文单词、代码块、超宽图片，都可能把列反向撑开。

更稳妥的写法通常是：

```css
.layout {
  display: grid;
  grid-template-columns: 240px minmax(0, 1fr);
}
```

或者：

```css
.cards {
  grid-template-columns: repeat(3, minmax(0, 1fr));
}
```

这里的 `0` 很关键，它是在告诉浏览器：

> “必要时你就压缩，不要被内容的最小尺寸卡死。”

如果正文里还有超长文本，再配合：

```css
.content {
  overflow-wrap: anywhere;
}
```

会更稳。

#### 8.9.4 `align-self` 只能在自己格子里动，不能跑出去

这条经常让人误解。

Grid 的 `self` 系列属性非常克制：

- 只能影响自己
- 只能在自己的格子内活动
- 不会突破边界去挤别人

所以如果你想让元素“脱离格子”自由飞，那已经不是 `align-self` 的职责了。

#### 8.9.5 `grid-template-areas` 必须是规则矩形

例如：

```css
/* 错误 */
grid-template-areas:
  'a b b'
  'a a c';
```

这里的 `a` 不是一个标准矩形，而是歪掉的形状，所以不合法。

正确思路是：

```css
grid-template-areas:
  'a a b'
  'a a c';
```

另外还要记住：

- 每一行的列数必须一致
- 空白区域用 `.` 表示

#### 8.9.6 只有直接子元素才是 Grid 项目

这一点和 Flex 完全一样。

```html
<div class="grid">
  <div class="item">
    <span>文字</span>
  </div>
</div>
```

这里：

- `.item` 是 Grid 项目
- `span` 不是 Grid 项目

如果你想继续控制更里面那层布局，就要在 `.item` 上再开新的布局上下文。

---

### 8.10 画页面骨架特别舒服的写法：`grid-template-areas`

如果你已经知道页面大概长什么样，比如：

- 上面是头部
- 左边是侧边栏
- 右边是主内容
- 下面是页脚

那 `grid-template-areas` 会非常顺手。

#### 8.10.1 基础写法

```css
.layout {
  display: grid;
  grid-template-columns: 240px minmax(0, 1fr);
  grid-template-rows: 64px 1fr 48px;
  grid-template-areas:
    'header header'
    'sidebar main'
    'footer footer';
  min-height: 100vh;
}

.header { grid-area: header; }
.sidebar { grid-area: sidebar; }
.main { grid-area: main; }
.footer { grid-area: footer; }
```

这段代码最舒服的地方在于：**一眼就能看出页面结构。**

```txt
┌───────────────────────────────┐
│            header             │
├───────────────┬───────────────┤
│    sidebar    │      main     │
├───────────────┴───────────────┤
│            footer             │
└───────────────────────────────┘
```

#### 8.10.2 空白区域怎么写

```css
grid-template-areas:
  'header header .'
  'sidebar main main'
  'footer footer footer';
```

`.` 就表示这里留空。

#### 8.10.3 响应式改造也很直观

移动端时，我们常常希望把页面堆成一列：

```css
.layout {
  display: grid;
  grid-template-areas:
    'header'
    'main'
    'sidebar'
    'footer';
}

@media (min-width: 768px) {
  .layout {
    grid-template-columns: 240px minmax(0, 1fr);
    grid-template-rows: 64px 1fr 48px;
    grid-template-areas:
      'header header'
      'sidebar main'
      'footer footer';
  }
}
```

这就是 Grid 很大的优势：

> 改整体布局时，你像是在改草图，而不是在到处挪坐标。

---

### 8.11 两个最常见的实战模板

#### 8.11.1 响应式卡片墙

```css
.card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 20px;
}

.card {
  padding: 20px;
  border-radius: 12px;
  background: #fff;
}
```

这个模板非常适合：

- 博客卡片列表
- 商品列表
- 作品展示墙
- 后台概览卡片

它的优点是：

- 屏幕宽时自动多列
- 屏幕窄时自动少列
- 不需要你手算断点

#### 8.11.2 杂志式拼版

```css
.magazine {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 16px;
}

.feature {
  grid-row: span 2;
}
```

HTML：

```html
<div class="magazine">
  <article class="feature">大卡片</article>
  <article>右上小卡片</article>
  <article>右下小卡片</article>
</div>
```

这个思路常见于：

- 新闻首页
- 作品集头图
- 活动推荐位

也就是：**大内容占大区域，小内容补在旁边**。

---

### 8.12 最后一页速记：把 Grid 真正记住

如果你看完前面内容，最后只想带走一页记忆版，就记下面这些。

#### 8.12.1 Grid 的核心一句话

```txt
Grid = 父级画格子，子级填格子
```

#### 8.12.2 最容易混的属性怎么记

```txt
justify = 左右
align = 上下

content = 整个表格
items = 所有项目
self = 我自己
```

#### 8.12.3 最常用的 5 组写法

```css
/* 1. 基础三列 */
grid-template-columns: repeat(3, 1fr);

/* 2. 自动补出来的行高 */
grid-auto-rows: 100px;

/* 3. 格子里的内容整体居中 */
justify-items: center;
align-items: center;

/* 4. 合并单元格 */
grid-column: span 2;
grid-row: span 2;

/* 5. 响应式万能句 */
grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
```

#### 8.12.4 最值得提前知道的坑

```txt
1. 给项目写了宽高，stretch 就不明显了
2. 用了 fr，justify-content 往往没什么空间可动
3. 1fr 不一定防溢出，实战里经常要写 minmax(0, 1fr)
4. align-self 只能在自己的格子里活动
5. grid-template-areas 里的区域必须是矩形
```

#### 8.12.5 最推荐的学习顺序

1. 先分清 Flex 是线，Grid 是面
2. 先会画格子，再学对齐
3. 先学 `items`，再学 `self`
4. 先学 `span` 合并，再学线编号定位
5. 最后吃透 `repeat(auto-fit, minmax())`

---

> 到这里，你对 Grid 的理解应该已经从“会抄代码”升级成“知道每个属性到底在管什么”了。
>
> 真正写页面时，别要求自己一上来就把所有属性全背下来。先从“画格子 + 自动换列 + 合并单元格”这三个最高频能力开始，写几次以后，Grid 会越来越顺手。
