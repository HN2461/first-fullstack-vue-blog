---
title: "认识 CSS：风格的起点"
slug: "css-css-a535f03e"
summary: ""
category: "AI版CSS"
tags: []
status: "draft"
sortOrder: 70
cover: ""
originalId: "6a2d30edb480df92ce002e15"
originalSlug: "css-css-a535f03e"
originalStatus: "published"
exportedAt: "2026-07-31T03:42:38.792Z"
---
# 第一篇 认识 CSS：风格的起点

> 目标：知道 CSS 是什么、能做什么、如何把 CSS 引入到页面，以及浏览器如何处理样式。看完即可开始为页面做基础的上色与排版。

---

## 第1章 什么是 CSS：让页面长出灵魂的语言

### 1.1 CSS 的工作方式

**CSS 是什么？**

CSS 的全称是 **Cascading Style Sheets**（层叠样式表），是一种用来描述网页外观和格式的样式语言。

- **Cascading（层叠）**：当多个样式规则应用到同一个元素时，CSS 会按照特定的规则决定哪个样式生效。就像多层透明纸叠在一起，最上面的会覆盖下面的，但如果上面的纸有透明部分，下面的内容还能透出来。
  - 举例：如果你给 `<p>` 标签设置了红色，又在某个特定的 `<p>` 上设置了蓝色，最终会显示蓝色（更具体的规则覆盖更通用的规则）
- **Style Sheets（样式表）**：把所有样式规则组织在一起的"表格"或"清单"

💡 **为什么需要 CSS？**
- 在 CSS 出现之前，网页的样式都直接写在 HTML 标签里（如 `<font color="red">`），导致代码混乱、难以维护
- CSS 让内容（HTML）和样式（CSS）分离，就像文章内容和排版设计分开一样

- 核心分工
  - HTML：结构与内容
  - CSS：样式与视觉
  - JavaScript：交互与逻辑
- CSS 能做什么
  - 文本样式（字体、大小、颜色、行高、对齐）
  - 视觉外观（背景、边框、圆角、阴影）
  - 布局排版（位置、尺寸、排列）
  - 动效特效（过渡、动画、变换、滤镜）
  - 响应式（不同屏幕一致好看）
- 基本工作流
  - 写 HTML → 写 CSS → 浏览器将样式应用到元素 → 渲染页面

示例：
```html
<!-- HTML：内容 -->
<h1>欢迎来到我的网站</h1>
<p>这是第一段文字。</p>
```

```css
/* CSS：样式 */
h1 {
  color: #2563eb;      /* 蓝色标题 */
  font-size: 32px;     /* 字号 */
  text-align: center;  /* 居中 */
}
p {
  line-height: 1.7;    /* 舒适的行高 */
  color: #374151;      /* 深灰色正文 */
}
```

---

### 1.2 HTML 与 CSS 的合作关系

- 分离的好处
  - 维护性：一处改样式，处处生效
  - 复用性：多个页面共享同一套样式
  - 可读性：HTML 干净语义化，有利可访问性与 SEO
- 实践建议
  - 用 `class` 作为样式钩子；`id` 标识唯一元素或锚点
  - 避免将样式写进陈旧的 HTML 表现性标签

💡 **什么是"表现性标签"？**

表现性标签是指那些直接控制外观的 HTML 标签，它们在 HTML5 中已被废弃或不推荐使用：

| 废弃标签 | 作用 | 应该用什么代替 |
|---------|------|---------------|
| `<font>` | 设置字体、颜色、大小 | CSS 的 `font-family`、`color`、`font-size` |
| `<center>` | 居中对齐 | CSS 的 `text-align: center` |
| `<u>` | 下划线（仅视觉） | CSS 的 `text-decoration: underline` |
| `<big>` | 放大文字 | CSS 的 `font-size` |
| `<strike>` | 删除线 | CSS 的 `text-decoration: line-through` |

💡 **`<b>` 和 `<i>` 不是废弃标签**

HTML5 重新定义了它们的语义，它们在现代 HTML 中是合法的：

| 标签 | HTML5 语义 | 与语义化标签的区别 |
|------|-----------|-----------------|
| `<b>` | 需要引起注意的文本（如关键词、产品名） | `<strong>` 表示"重要性"，`<b>` 只是"视觉上需要注意" |
| `<i>` | 另一种语气的文本（如术语、外来词、技术名词） | `<em>` 表示"强调"，`<i>` 只是"语气上有所不同" |

实际上，如果只是想让文字加粗或斜体，用 CSS 的 `font-weight` 和 `font-style` 更灵活；如果有语义需求，优先选 `<strong>` 和 `<em>`。

❌ **不推荐的旧写法**：
```html
<font color="red" size="5">这是红色大字</font>
<center>居中内容</center>
```

✅ **推荐的现代写法**：
```html
<p class="highlight">这是红色大字</p>
<p class="centered">居中内容</p>
```
```css
.highlight { color: red; font-size: 1.5rem; }
.centered { text-align: center; }
```

💡 **class 和 id 的命名规范**

**class 命名**（可复用，一个元素可以有多个 class）：
- **kebab-case**（推荐）：用短横线连接，如 `btn-primary`、`nav-item`、`user-profile`
- **BEM 命名法**（大型项目）：`块__元素--修饰符`
  - 例：`card__title--large`（card 块中的 title 元素的 large 修饰）
- 避免：拼音、无意义的名称（如 `a1`、`box1`）

**id 命名**（全局唯一，一个元素只能有一个 id）：
- 用于唯一标识：`#site-header`、`#main-content`、`#user-123`
- 用于锚点跳转：`#section-about`、`#contact-form`
- 命名规则同 class，但要确保整个页面唯一

示例（推荐写法）：
```html
<h1 class="page-title">这是标题</h1>
```

```css
.page-title {
  color: #16a34a;
  font-weight: 700;
  text-align: center;
}
```

---

### 1.3 CSS 的三种引入方式

- 内联样式（Inline）
  - 写在标签的 `style` 属性里
  - 示例：
    ```html
    <p style="color: red; font-size: 18px;">红色段落</p>
    ```
  - 优点：优先级高、调试方便
  - 缺点：不可复用，污染 HTML，不利维护
  - 用途：快速试验、邮件 HTML、JS 动态样式
  - ℹ️ 邮件 HTML 说明：指用于构建电子邮件内容的 HTML 代码。由于不同邮件客户端（如 Gmail、Outlook、苹果邮件等）对 HTML 和 CSS 的支持差异很大，很多现代 CSS 特性（如外部样式表、复杂选择器等）在邮件中可能无法正常生效，因此常用内联样式。

- 内部样式表（Internal）
  - 写在页面 `<head>` 中的 `<style>` 标签里
  - 示例：
    ```html
    <head>
      <style>
        .highlight { background: yellow; }
        h1 { color: #2563eb; }
      </style>
    </head>
    ```
  - 用途：单页/原型/页面独有样式

- 外部样式表（External）⭐ 推荐
  - 写在 `.css` 文件，用 `<link>` 引入
  - 示例：
    ```html
    <head>
      <link rel="stylesheet" href="styles/common.css">
    </head>
    ```
    ```css
    /* styles/common.css */
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif; }
    .btn { padding: 10px 16px; border-radius: 6px; }
    ```
  - 优点：可复用、可缓存、协作友好、维护成本低

- `@import` 在 CSS 内引入其它 CSS
  - 写法:
    ```css
    /* 必须写在 CSS 文件最前面 */
    /* 先导入其他文件，再写自己的样式 */
    @import url("reset.css");
    @import url("typography.css");
    /* 也可以省略 url()，直接写 @import "reset.css";，效果一样。 */
    ```
  - 缺点:
    - **串行加载，阻塞渲染**（`<link>` 可并行）
      - 浏览器解析到 `@import` 时，会先停下当前 CSS 的加载，去下载导入的 CSS，下完再继续（串行加载）
      - 而用 `<link>` 标签引入多个 CSS 时，浏览器可以同时下载（并行加载），更快
    - **必须写在所有规则之前**
      - 如果 `@import` 写在其他样式后面，可能会失效（浏览器不识别）
    - **增加请求层级深度**
      - 如果 A.css 导入 B.css，B.css 又导入 C.css，浏览器要一层一层下载，更耗时
  - 适用场景:组织大型项目的 CSS 模块(但现代构建工具更优)

- 小结与加载顺序
  - 优先级:内联 > 内部/外部(内部和外部取决于在 HTML 中的书写顺序,后者覆盖前者)
  - 示例:
    ```html
    <style>p { color: red; }</style>
    <link rel="stylesheet" href="style.css"> <!-- 如果 style.css 中也定义了 p,会覆盖上面的红色 -->
    ```
  - 生产环境优先使用外部样式表

---

### 1.4 浏览器如何解析你的样式（渲染流程）

- 五步流程（简化）
  1. **解析 HTML → 生成 DOM**
     - 浏览器先读 HTML，把标签（比如 `<div>`、`<p>`）变成一个"节点树"（DOM）
     - 就像先搭好房子的框架，记录每个房间（元素）的位置和层级关系
  2. **解析 CSS → 生成 CSSOM**
     - 再读所有 CSS（包括内联、`<style>`、外部 CSS），生成一个"样式规则树"（CSSOM）
     - 就像整理好一本"装修手册"，记录每个房间该刷什么颜色、用什么尺寸的家具
  3. **合并 DOM + CSSOM → 渲染树**
     - 把"框架（DOM）"和"装修手册（CSSOM）"结合，只保留需要显示的元素
     - 比如 `<head>` 里的内容不显示，就会被剔除
     - 得到"渲染树"—— 明确每个要显示的元素该用什么样式
  4. **布局（Layout）→ 计算尺寸位置**
     - 根据渲染树，计算每个元素的具体尺寸（宽高）、位置（在屏幕的 x/y 坐标）
     - 比如确定"这个 `<div>` 宽 200px，左上角在 (100px, 200px) 的位置"
  5. **绘制与合成（Paint/Composite）→ 显示到屏幕**
     - 最后一步，浏览器按照布局结果，把元素画在屏幕上（比如给 `<div>` 涂红色、画边框）
     - 再把分层的内容合成到一起，就是我们看到的完整页面
- 层叠（Cascade）与冲突解决
  - 💡 **冲突场景**：当多个样式规则"打架"（比如两个规则都给同一个元素设置 `color`），浏览器按以下规则选一个生效
  - 层叠来源优先级（从高到低）
    1. **用户代理（浏览器）的 !important 声明**
       - 浏览器自带样式 + `!important`（极少用，比如浏览器强制让按钮不可改颜色）
    2. **用户自定义的 !important 声明**
       - 用户自己在浏览器里设置的样式 + `!important`（比如用户手动改了字体大小并强制生效）
    3. **作者（开发者）的 !important 声明**
       - 我们写的 CSS + `!important`（比如 `p {color: red !important;}`）
    4. **作者的正常声明** ⭐ 我们写的 CSS
       - 我们写的普通 CSS（最常用，比如 `p {color: red;}`）
    5. **用户自定义的正常声明**
       - 用户在浏览器里设置的普通样式（比如用户改了默认字体）
    6. **用户代理的默认样式**
       - 浏览器自带的默认样式（比如 `<p>` 标签默认有上下边距）
  - 同一来源内的冲突解决：`!important` > 特异性 > 书写顺序（后者覆盖前者）
- 继承（Inheritance）
  - 会继承：`color`、`font-family`、`font-size`、`line-height`、`text-align` 等
  - 不继承：`margin`、`padding`、`border`、`width/height`、`position`、`background` 等
- 选择器匹配
  - 引擎从选择器"最后一段"开始匹配，再向上确认父/祖先条件
  - 💡 **从右到左匹配原理**：
    - 浏览器找"哪个元素该用哪个样式"时，不是从左到右读选择器，而是**从右到左**
    - 比如选择器 `div .box p`（找 `<div>` 里带 `box` 类的元素中的 `<p>` 标签）
    - 浏览器会先找所有 `<p>` 标签，再检查这些 `<p>` 的父元素有没有 `class="box"`，最后看它们的祖先有没有 `<div>`
    - 这样做是为了更快匹配（先缩小范围，再逐层验证）
- DevTools 调试要点
  - Styles 面板看"命中规则与覆盖关系（删除线）"
  - Computed 面板看"最终生效值与盒模型"

---

## 第2章 CSS 选择器基础：我想改谁？

### 2.1 标签、类、ID 选择器

- **标签选择器（Element Selector）**
  - 作用：选择所有同名的 HTML 标签
  - 语法：直接写标签名
  - 示例：`h1 { font-size: 32px; }` 影响页面上所有 `<h1>` 标签
  - 适用场景：设置全局默认样式（如所有段落的行高、所有链接的颜色）
  
- **类选择器（Class Selector）** ⭐ 最常用
  - 作用：选择所有带有指定 class 的元素
  - 语法：`.类名 { ... }`
  - 示例：`.btn { padding: 10px 16px; }`
  - **特点**：
    - 可复用：同一个 class 可以用在多个元素上
    - 可组合：一个元素可以有多个 class（用空格分隔）
  
  💡 **多类名的使用场景**：
  
  通过组合多个 class，可以灵活地复用样式，避免重复代码。这是一种非常强大的设计模式。
  
  ```html
  <!-- 基础按钮样式 + 不同颜色变体 -->
  <button class="btn btn-primary">主要按钮</button>
  <button class="btn btn-secondary">次要按钮</button>
  <button class="btn btn-danger">危险按钮</button>
  
  <!-- 基础卡片 + 不同尺寸 -->
  <div class="card card-large">大卡片</div>
  <div class="card card-small">小卡片</div>
  ```
  
  ```css
  /* 基础样式（所有按钮共享） */
  .btn {
    padding: 10px 16px;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-size: 14px;
  }
  
  /* 颜色变体（只定义不同的部分） */
  .btn-primary { background: #2563eb; color: #fff; }
  .btn-secondary { background: #6b7280; color: #fff; }
  .btn-danger { background: #ef4444; color: #fff; }
  ```
  
- **ID 选择器（ID Selector）** ⚠️ 慎用
  - 作用：选择带有指定 id 的元素
  - 语法：`#id名 { ... }`
  - 示例：`#site-header { background:#111; }`
  - **特点**：
    - 页面内必须唯一：一个 id 只能用在一个元素上
    - 优先级非常高：比 class 选择器高，容易导致样式难以覆盖
  
  ⚠️ **为什么 ID 选择器要慎用？**
  
  1. **优先级过高**：ID 选择器的权重是 `0-1-0-0`，比类选择器 `0-0-1-0` 高很多。如果用 ID 写样式，后期想覆盖会很困难。
     ```css
     #box { color: red; }        /* 权重 0-1-0-0 */
     .box.special { color: blue; } /* 权重 0-0-2-0，但还是红色！ */
     ```
  
  2. **不可复用**：ID 必须唯一，无法在多个元素上复用，违背了 CSS 的复用原则。
  
  3. **难以维护**：大型项目中如果到处用 ID，样式会变得难以管理和覆盖。
  
  💡 **ID 的正确用途**：
  - 用于 JavaScript 选择元素：`document.getElementById('user-form')`
  - 用于页面内锚点跳转：`<a href="#section-about">关于我们</a>`
  - 用于唯一标识：`<header id="site-header">`（但样式还是用 class 写）

- **建议**：大多数样式用 `class` 组织；ID 用于唯一标识或锚点，样式尽量不用 ID 选择器

示例：
```css
.btn { padding: 10px 16px; border-radius: 6px; }
.btn-primary { background: #2563eb; color: #fff; }
.highlight { background: #fef08a; }
```
```html
<a class="btn btn-primary">按钮</a>
<p class="highlight">高亮文字</p>
```

---

### 2.2 通配符、后代、子代选择器

- **通配符（`*`）**
  - 作用：选择页面上的所有元素
  - 多用于 CSS Reset 或统一盒模型
  - 示例：
    ```css
    /* 重置所有元素的默认边距 */
    * { margin: 0; padding: 0; }
    
    /* 统一盒模型（最常用） */
    *, *::before, *::after { box-sizing: border-box; }
    ```
  - ⚠️ 性能提示：现代浏览器优化已很好，但避免 `* { ... }` 写过多复杂样式
  - 推荐用法：仅用于盒模型重置等基础设置

💡 **什么是 `box-sizing: border-box`？为什么要设置？**

这是 CSS 中最重要的属性之一，它改变了元素宽高的计算方式。

**默认的盒模型（`content-box`）**：
- 元素的 `width` 和 `height` 只包含内容区域
- 实际占据的空间 = width + padding + border
- 问题：设置 `width: 200px; padding: 20px; border: 1px;` 后，元素实际宽度是 242px（200 + 20×2 + 1×2）

```css
.box {
  width: 200px;
  padding: 20px;
  border: 1px solid #000;
  /* 实际占据宽度：200 + 20×2 + 1×2 = 242px */
}
```

**`border-box` 盒模型**（推荐）：
- 元素的 `width` 和 `height` 包含 padding 和 border
- 实际占据的空间 = width（已包含 padding 和 border）
- 好处：设置 `width: 200px` 后，无论 padding 和 border 多大，元素总宽度始终是 200px

```css
.box {
  box-sizing: border-box;
  width: 200px;
  padding: 20px;
  border: 1px solid #000;
  /* 实际占据宽度：200px（padding 和 border 向内挤压内容区） */
}
```

💡 **为什么推荐全局设置 `border-box`？**
- 更符合直觉：设置多宽就是多宽，不用计算 padding 和 border
- 布局更容易：不用担心加了 padding 就把布局撑破
- 响应式更友好：百分比宽度不会因为 padding 而溢出

- **后代选择器（空格）**
  - 语法：`祖先 后代`
  - 作用：匹配任意层级的后代元素（不管隔了多少层）
  - 示例：`.card p { color:#475569; }`
  - 应用场景：
    ```html
    <div class="card">
      <p>直接子元素的段落</p>
      <div>
        <p>孙子元素的段落（也会被选中）</p>
        <section>
          <p>曾孙元素的段落（也会被选中）</p>
        </section>
      </div>
    </div>
    ```
    ```css
    /* 所有在 .card 内的 p 标签都会变成灰色，不管嵌套多深 */
    .card p { color: #475569; }
    ```

- **子代选择器（`>`）**
  - 语法：`父 > 子`
  - 作用：仅匹配直接子元素（只选一层）
  - 示例：`.card > p { color:#ef4444; }`
  - 应用场景：
    ```html
    <div class="card">
      <p>直接子元素的段落（会被选中）</p>
      <div>
        <p>孙子元素的段落（不会被选中）</p>
      </div>
    </div>
    ```
    ```css
    /* 只有 .card 的直接子元素 p 会变成红色 */
    .card > p { color: #ef4444; }
    ```

💡 **后代选择器 vs 子代选择器的选择**：
- 用**后代选择器**：当你想影响所有嵌套的元素时（如文章内所有段落）
- 用**子代选择器**：当你只想影响直接子元素时（如导航菜单的第一层项目）

实际案例：
```css
/* 导航菜单：只给第一层菜单项加样式 */
.nav > li { display: inline-block; }

/* 文章内容：所有段落都要有间距 */
.article p { margin-bottom: 1rem; }
```

---

### 2.3 同级、相邻兄弟选择器

- 相邻兄弟（`+`）
  - `A + B`：A 后紧邻的第一个同级 B
  - 示例：
    ```css
    h2 + p { margin-top: .25rem; color: #64748b; }
    ```
- 通用兄弟（`~`）
  - `A ~ B`：A 后所有同级 B（不要求紧邻）
  - 示例：
    ```css
    .alert ~ p { color: #ef4444; }
    ```
- 表单联动示例：
  ```html
  <input type="checkbox" id="agree">
  <label for="agree">📝 我已阅读</label>
  ```
  ```css
  #agree:checked + label { color:#16a34a; font-weight:600; }
  ```
  表单联动的本质是 “状态驱动变化”：
  - 用 CSS 伪类（`:checked` / `:focus` / `:valid` 等）捕捉元素状态
  - 用选择器（`+` / `~` / `>` 等）关联目标元素
  - 简单场景纯 CSS 搞定，复杂逻辑（如数据联动）配合 JS 监听 `change` / `input` 事件

---

### 2.3.1 属性选择器

- 基本语法
  - `[attr]` 存在该属性（不管属性值是什么）
  - `[attr="value"]` 属性值完全匹配（大小写敏感）
  - `[attr^="value"]` 属性值以 value 开头
  - `[attr$="value"]` 属性值以 value 结尾
  - `[attr*="value"]` 属性值包含 value（任意位置）
  - `[attr~="value"]` 属性值是空格分隔的词列表，其中一个是 value
- 实用示例：
  ```css
  /* 选择所有外部链接 */
  a[href^="http"] { color: #2563eb; }
  a[href^="http"]::after { content: " ↗"; }
  
  /* 选择 PDF 链接 */
  a[href$=".pdf"]::before { content: "📄 "; }
  
  /* 选择必填表单项 */
  input[required] { border-left: 3px solid #ef4444; }
  
  /* 选择禁用按钮 */
  button[disabled] { opacity: 0.5; cursor: not-allowed; }
  ```

---

### 2.3.2 伪类与伪元素

**什么是伪类（Pseudo-classes）？**

伪类是用来选择元素的**特定状态**的选择器，比如鼠标悬停、获得焦点、第一个子元素等。它们以**单冒号 `:`** 开头。

💡 **为什么叫"伪类"？**
- 因为它们不是真正的 HTML class，而是元素的一种"状态"或"位置"
- 比如 `:hover` 表示"鼠标悬停时的状态"，`:first-child` 表示"作为第一个子元素的位置"

#### 常用伪类分类

**1. 交互伪类**（用户操作触发的状态）

- **`:hover`**：鼠标悬停时
  ```css
  a:hover { color: #2563eb; text-decoration: underline; }
  .btn:hover { background: #1d4ed8; transform: translateY(-2px); }
  ```
  - 应用场景：按钮悬停效果、链接高亮、卡片浮起

- **`:active`**：鼠标按下时（点击瞬间）
  ```css
  .btn:active { transform: scale(0.95); }
  ```
  - 应用场景：按钮按下效果

- **`:focus`**：元素获得焦点时（如输入框被点击）
  ```css
  input:focus { 
    border-color: #2563eb; 
    outline: 2px solid rgba(37,99,235,0.2);
    outline-offset: 2px;
  }
  ```
  - 应用场景：表单输入框焦点样式、键盘导航可访问性

- **`:focus-visible`**：仅键盘导航时显示焦点样式
  ```css
  button:focus-visible { outline: 2px solid #2563eb; }
  ```
  - 好处：鼠标点击不显示焦点框，键盘导航才显示（更好的用户体验）

**2. 链接伪类**（仅用于 `<a>` 标签）

- **`:link`**：未访问过的链接
- **`:visited`**：已访问过的链接
  ```css
  a:link { color: #2563eb; }
  a:visited { color: #7c3aed; }
  ```
  - ⚠️ 注意：`:visited` 只能设置颜色相关属性（出于隐私保护）

**3. 结构伪类**（根据元素在 DOM 中的位置选择）

- **`:first-child`**：作为父元素的第一个子元素
  ```css
  li:first-child { font-weight: 700; }
  ```
  ```html
  <ul>
    <li>第一项（会被选中）</li>
    <li>第二项</li>
  </ul>
  ```

- **`:last-child`**：作为父元素的最后一个子元素
  ```css
  li:last-child { border-bottom: none; }
  ```

- **`:nth-child(n)`**：选择第 n 个子元素
  ```css
  li:nth-child(2) { color: red; }        /* 第2个 */
  li:nth-child(odd) { background: #f9fafb; }  /* 奇数项（1,3,5...） */
  li:nth-child(even) { background: #fff; }    /* 偶数项（2,4,6...） */
  li:nth-child(3n) { color: blue; }      /* 每3个（3,6,9...） */
  ```
  - 应用场景：表格斑马纹、列表样式

- **`:first-of-type`** / **`:last-of-type`**：同类型元素中的第一个/最后一个
  ```css
  p:first-of-type { font-size: 1.2rem; }  /* 第一个 p 标签 */
  ```

- **`:only-child`**：父元素中唯一的子元素
  ```css
  p:only-child { text-align: center; }
  ```

**4. 表单伪类**（表单元素的状态）

- **`:checked`**：被选中的单选框或复选框
  ```css
  input[type="checkbox"]:checked + label { color: #16a34a; }
  ```

- **`:disabled`**：被禁用的表单元素
  ```css
  input:disabled { 
    background: #f3f4f6; 
    cursor: not-allowed; 
    opacity: 0.6;
  }
  ```

- **`:enabled`**：未被禁用的表单元素

- **`:required`**：必填的表单元素
  ```css
  input:required { border-left: 3px solid #ef4444; }
  ```

- **`:optional`**：非必填的表单元素

- **`:valid`** / **`:invalid`**：验证通过/失败的表单元素
  ```css
  input:valid { border-color: #16a34a; }
  input:invalid { border-color: #ef4444; }
  ```

**5. 否定伪类**

- **`:not(selector)`**：排除某些元素
  ```css
  li:not(:last-child) { border-bottom: 1px solid #e5e7eb; }
  /* 除了最后一个，其他 li 都有底部边框 */
  
  button:not(:disabled) { cursor: pointer; }
  /* 未禁用的按钮显示手型光标 */
  ```

**6. 其他常用伪类**

- **`:empty`**：没有子元素的元素
  ```css
  p:empty { display: none; }  /* 隐藏空段落 */
  ```

- **`:target`**：URL 锚点指向的元素
  ```css
  :target { background: #fef08a; }
  ```
  ```html
  <a href="#section1">跳转到第一节</a>
  <div id="section1">第一节内容（点击链接后会高亮）</div>
  ```

---

#### 什么是伪元素（Pseudo-elements）？

伪元素让你能给**在 DOM 树中没有对应节点的"虚拟片段"**设置样式。它们以**双冒号 `::`** 开头（CSS3 规范，但单冒号也兼容）。

根据作用方式，伪元素分两类：

- **"创建"型**：`::before` / `::after`
  DOM 里本来没有这个节点，是凭空插入的虚拟内容。你不写它，它就不存在。

- **"选取"型**：`::first-letter` / `::first-line` / `::selection` / `::placeholder`
  内容本身存在，但在 DOM 里没有对应的标签节点。比如 `<p>Hello</p>` 中的 "H"，它只是文本的一部分，DOM 里没有任何元素单独指向它。`::first-letter` 让你能"假装"它被包了一层 `<span>`，单独给它设置样式——但实际上 DOM 里什么都没加。

💡 **伪类 vs 伪元素的区别**：
- **伪类**（单冒号 `:`）：选择元素的某种**状态**，元素本身存在，只是状态不同
- **伪元素**（双冒号 `::`）：针对**没有 DOM 节点对应的虚拟片段**，要么创建它，要么选取它

**常用伪元素**

**1. `::before` 和 `::after`**：在元素内容前后插入内容

最常用的伪元素，可以在元素内部的开头或结尾插入内容。

```css
.icon::before {
  content: "📌 ";  /* 必须有 content 属性 */
  color: #ef4444;
}

.external-link::after {
  content: " ↗";
  font-size: 0.8em;
  color: #2563eb;
}
```

```html
<p class="icon">重要提示</p>
<!-- 显示：📌 重要提示 -->

<a href="https://example.com" class="external-link">外部链接</a>
<!-- 显示：外部链接 ↗ -->
```

💡 **实际应用场景**：

- **添加装饰图标**：
  ```css
  .success::before {
    content: "✓ ";
    color: #16a34a;
    font-weight: 700;
  }
  ```

- **清除浮动**（经典技巧）：
  ```css
  .clearfix::after {
    content: "";
    display: table;
    clear: both;
  }
  ```

- **创建几何图形**：
  ```css
  .triangle::before {
    content: "";
    display: inline-block;
    width: 0;
    height: 0;
    border-left: 5px solid transparent;
    border-right: 5px solid transparent;
    border-bottom: 10px solid #2563eb;
  }
  ```

- **引号包裹**：
  ```css
  blockquote::before { content: """; }
  blockquote::after { content: """; }
  ```

**2. `::first-letter`**：选择元素的第一个字母

```css
p::first-letter {
  font-size: 2em;
  font-weight: 700;
  color: #2563eb;
  float: left;
  margin-right: 0.1em;
}
```
- 应用场景：杂志式首字母下沉效果

**3. `::first-line`**：选择元素的第一行

```css
p::first-line {
  font-weight: 700;
  color: #1f2937;
}
```

**4. `::selection`**：用户选中的文本

```css
::selection {
  background: #fef08a;
  color: #1f2937;
}
```
- 应用场景：自定义文本选中颜色

**5. `::placeholder`**：输入框占位符文本

```css
input::placeholder {
  color: #9ca3af;
  font-style: italic;
}
```

---

#### 伪类和伪元素的组合使用

可以将伪类和伪元素组合使用，创建更复杂的效果：

```css
/* 悬停时的 before 伪元素 */
.btn:hover::before {
  content: "→ ";
}

/* 第一个子元素的 after 伪元素 */
li:first-child::after {
  content: " (推荐)";
  color: #16a34a;
}

/* 获得焦点时的占位符 */
input:focus::placeholder {
  color: transparent;
}
```

---

#### 实战示例：按钮悬停效果

```html
<button class="fancy-btn">悬停看看</button>
```

```css
.fancy-btn {
  position: relative;
  padding: 12px 24px;
  background: #2563eb;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  overflow: hidden;
  transition: all 0.3s;
}

/* 悬停时按钮变色 */
.fancy-btn:hover {
  background: #1d4ed8;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(37,99,235,0.3);
}

/* 按下时按钮缩小 */
.fancy-btn:active {
  transform: translateY(0);
}

/* 用伪元素创建光晕效果 */
.fancy-btn::before {
  content: "";
  position: absolute;
  top: 50%;
  left: 50%;
  width: 0;
  height: 0;
  border-radius: 50%;
  background: rgba(255,255,255,0.3);
  transform: translate(-50%, -50%);
  transition: width 0.6s, height 0.6s;
}

.fancy-btn:hover::before {
  width: 300px;
  height: 300px;
}
```

---

#### 常见问题

**Q1: 为什么 `::before` 和 `::after` 不显示？**
- ✅ 必须设置 `content` 属性（哪怕是空字符串 `content: ""`）
- ✅ 默认是 `display: inline`，可能需要改为 `block` 或 `inline-block`

**Q2: 伪元素可以嵌套吗？**
- ❌ 不可以。伪元素不能再有伪元素（如 `::before::after` 无效）

**Q3: 伪类的顺序重要吗？**
- ✅ 链接伪类有顺序要求：`:link` → `:visited` → `:focus` → `:hover` → `:active`（记忆口诀：LoVe Fears HAte）
- `:focus` 要放在 `:hover` 前面，否则键盘导航时焦点样式会被 `:hover` 覆盖，影响可访问性

---

### 2.4 选择器优先级与覆盖规则

- 层叠顺序（同来源）
  - `!important` > 特异性 > 书写顺序
- 特异性记忆法：a-b-c-d
  - a：是否内联（有则 1）
  - b：ID 个数
  - c：类/属性/伪类 个数
  - d：标签/伪元素 个数
- 常见等级（高→低）
  - 内联 > `#id` > `.class`/`[attr]`/`:hover` > `div`/`::before`
- `:not()`/`:is()`/`:where()`
  - `:not(X)` 不增自身权重，但计入 X 的特异性
  - `:is(A,B)` 取参数中最高特异性
  - `:where(A,B)` 特异性恒 0，适合写“可被覆盖的基础规则”
- 常见不生效原因
  - 特异性不足、顺序在前、来源不同、未命中、被覆盖
- 调试流程
  - 用 DevTools 看删除线与 Computed 来源，再决定是否调整选择器或顺序

练习：谁决定颜色？
```css
p { color: black; }           /* 0-0-0-1 */
.note { color: green; }       /* 0-0-1-0 */
#main p.note { color: blue; } /* 0-1-1-1  胜 */
```
```html
<div id="main"><p class="note">示例文字</p></div>
```

#### 2.4.1 特异性速查表

💡 **核心概念**：CSS 选择器的"特异性"（也叫"权重"）规则——当多个选择器给同一个元素设置样式时，浏览器根据权重高低决定哪个样式生效。

**权重梯度表**：可以把权重想象成一个"四位数密码" `a-b-c-d`，每一位代表不同类型选择器的"分量"，数字越大，权重越高：

| 选择器类型         | 权重密码   | 说明                                                                 |
|--------------------|------------|----------------------------------------------------------------------|
| 内联样式 `style=""` | `1-0-0-0`  | 直接写在标签里的样式，权重最高（比如 `<div style="color:red">`）     |
| ID 选择器 `#id`     | `0-1-0-0`  | 用 `#` 定义的选择器（比如 `#box { ... }`）                           |
| 类/属性/伪类       | `0-0-1-0`  | 类（`.class`）、属性（`[type="text"]`）、伪类（`:hover`）都算这一档   |
| 标签/伪元素        | `0-0-0-1`  | 标签（`div`、`p`）、伪元素（`::before`）都算这一档                    |
| 通配符 `*`         | `0-0-0-0`  | 匹配所有元素，但权重几乎为 0，可忽略                                 |

**比较规则**：从左到右"比大小"

比较两个选择器的权重时，像比较四位数大小一样，**从左到右依次看每一位**，只要某一位的数字更大，就直接判定这个选择器权重更高，后面的位不用看了。

```txt
示例：0-1-0-0  vs  0-0-3-0
        ↑             ↑
      b 更大        c 更大
先比 a，再比 b，再比 c，再比 d。
只要某一位更大，后面就不用看了。
例：#main （0-1-0-0） 胜过 .a.b.c （0-0-3-0）
```

**实战举例**：

1. **ID vs 多个类**  
   `#main`（权重 `0-1-0-0`） vs `.a.b.c`（权重 `0-0-3-0`）  
   → 先看第一位 `a`（都是 0）→ 再看第二位 `b`（1 > 0）→ `#main` 胜出

2. **标签+ID vs 多个类**  
   `div#box`（权重 `0-1-0-1`） vs `.nav .item`（权重 `0-0-2-0`）  
   → 比较第二位 `b`（1 > 0）→ `div#box` 胜出

3. **权重相同看顺序**  
   `.box p`（权重 `0-0-1-1`） vs `div .text`（权重 `0-0-1-1`）  
   → 四位数字完全相同 → 后面写的样式覆盖前面的（"后来者居上"）

**关键结论**：

- ⚠️ **权重只看"类型"，不看"数量"**：1 个 ID 选择器（`0-1-0-0`）永远比 100 个类选择器（`0-0-100-0`）强
- ⚠️ **内联样式几乎无敌**：`1-0-0-0` 除非加 `!important`（但尽量少用，容易打乱权重逻辑）
- 💡 **最佳实践**：尽量用"刚好够用"的权重（比如能用类选择器就不用 ID），避免后期样式覆盖困难

#### 2.4.2 几个典型“小剧场”

**场景 1：同一个元素被标签和类同时选中**
```css
p { color: black; }      /* 0-0-0-1 */
.note { color: green; }  /* 0-0-1-0  胜 */
```
```html
<p class="note">文字</p>
```
类的权重大于标签，所以最终是绿色。

**场景 2：两个类 vs 一个 ID**
```css
.btn.primary { background: blue; }  /* 0-0-2-0 */
#submit       { background: red; }   /* 0-1-0-0  胜 */
```
```html
<button id="submit" class="btn primary">提交</button>
```
ID 的“b 位”更大，所以红色获胜。

**注**：`.btn.primary` 表示同时拥有 `btn` 和 `primary` 两个类的元素，实际项目中更常用 `.btn-primary` 这种单类名的 BEM 命名方式。

**场景 3：权重相同，看书写顺序**
```css
.tag { background: #fee2e2; }   /* 0-0-1-0 */
.tag { background: #bfdbfe; }   /* 0-0-1-0 且写在后面 → 胜 */
```
相同选择器、相同来源、没有 !important 时，**后写的覆盖先写的**。

#### 2.4.3 !important 不是“万能钥匙”

`!important` 会把某条声明拉到“重要层”，常见写法：
```css
.btn {
  color: #fff !important;
}
```
它可以临时“救火”，但副作用是：
- 降低样式可维护性：以后再想覆盖它，只能写更高来源或继续叠 !important
- 容易形成“优先级军备竞赛”：到处都是 !important

**经验建议：**
- 优先通过合理的选择器和结构来解决覆盖问题
- 只有在确实需要“强制覆盖第三方样式”时，再考虑使用 `!important`

---

## 第3章 CSS 常用属性初体验

> 目标：掌握常用的文字、背景、边框与阴影属性，能快速做出舒适的基础视觉。

### 3.1 字体与文字基础样式

- 字体与字号
  - `font-family`：指定字体（关键是“回退序列”）
    - 💡 **为什么要写“回退序列”？**
      - 不同设备安装的字体不同（比如有的电脑没有“苹方”，有的没有“微软雅黑”）
      - 按顺序写多个字体，浏览器会从左到右找第一个已安装的字体来用
    - 示例：
      ```css
      /* 优先用苹果系统的“苹方”（适合 macOS/iOS）；
         没有就用 Windows 的“微软雅黑”；
         再没有就用通用无衬线中文字体“Noto Sans SC”；
         最后用英文默认字体 Arial，兜底用系统无衬线字体（sans-serif） */
      body { font-family: "PingFang SC", "Microsoft YaHei", "Noto Sans SC", Arial, sans-serif; }
      ```
  - `font-size`：指定字号
    - **单位选择**：
      - `px`（固定像素）：直观但不灵活（比如用户放大页面时，文字可能不变）
      - `rem`（相对根元素）：相对根元素（`html`）的字号，响应式友好
    - 💡 **rem 计算示例**：`html { font-size: 16px; }` → 1rem = 16px，那么 2rem 就是 32px
    - 示例：
      ```css
      html { font-size: 16px; }   /* 1rem = 16px */
      h1 { font-size: 2rem; }     /* 32px */
      p  { font-size: 1rem; }     /* 16px */
      ```
  - `font-weight`：控制文字粗细，`400` 常规，`700` 加粗
    - 数值范围：100-900（100 的倍数）
    - 常用值：400 = 常规（normal），700 = 加粗（bold）
    - ⚠️ 中文字体注意：大多数中文字体只提供 Regular(400) 和 Bold(700) 两个字重，设置其他值（如 300、600）可能无效或被浏览器模拟渲染（效果不佳）
  - `line-height`：控制行间距（推荐"无单位数字"，随字号等比缩放）
    - 文字行与行之间的距离，影响阅读舒适度（太密或太疏都不好）
    - 💡 **为什么用无单位数字（如 1.7）？**
      - 它会自动随 `font-size` 等比缩放
      - 比如字号 16px 时，行高是 16×1.7=27.2px；字号变大到 20px，行高自动变成 34px，不用手动调整
    - 示例：
      ```css
      p { line-height: 1.7; }
      ```
- 文本呈现
  - `color`：文字颜色，支持多种写法
    - 十六进制：`#333`、`#334155`
    - `rgb()`：`rgb(51, 65, 85)`
    - `hsl()`：`hsl(210, 25%, 27%)`（方便调整明暗/饱和度）
  - `text-align`：控制文本对齐方式（`left` / `center` / `right` / `justify`）
  - `text-decoration`：加下划线（`underline`）、删除线（`line-through`）等
  - `letter-spacing`：字符间距（字母或汉字之间的距离）
    - 作用：调整文字之间的间隔，影响视觉密度
    - 值：可以是正值（增加间距）或负值（减少间距）
    - 示例：
      ```css
      .title { letter-spacing: 0.05em; }  /* 标题稍微松散一点 */
      .dense { letter-spacing: -0.02em; } /* 紧凑排列 */
      ```
    - 使用场景：
      - 英文标题：增加间距显得高级（如 `0.05em ~ 0.1em`）
      - 中文正文：一般不需要调整（默认 0 即可）
      - Logo 文字：可以适当调整营造品牌感
  - `word-spacing`：单词间距（仅对英文空格分隔的单词有效）
    - 作用：调整单词之间的间距
    - 中文无效：因为中文没有空格分隔单词
    - 示例：`p { word-spacing: 0.2em; }`
  - `text-transform`：文本大小写转换
    - 作用：自动转换英文字母的大小写
    - 值：
      - `uppercase`：全部大写（HELLO WORLD）
      - `lowercase`：全部小写（hello world）
      - `capitalize`：每个单词首字母大写（Hello World）
      - `none`：不转换（默认）
    - 示例：
      ```css
      .btn { text-transform: uppercase; } /* 按钮文字全大写 */
      .title { text-transform: capitalize; } /* 标题首字母大写 */
      ```
  - `font-style`：字体样式（斜体）
    - 值：
      - `normal`：正常（默认）
      - `italic`：斜体（使用字体自带的斜体版本）
      - `oblique`：倾斜（强制倾斜，即使字体没有斜体版本）
    - 示例：`.quote { font-style: italic; }` /* 引用文字用斜体 */
  - `text-indent`：首行缩进，中文段落常用 `2em`（缩进两个字）
  - 换行控制：
    ```css
    .break-words { overflow-wrap: break-word; } /* 推荐：在单词边界换行，单词过长才打断 */
    .break-all { word-break: break-all; }       /* 谨慎：任意位置打断，会把英文单词从中间切开 */
    .nowrap { white-space: nowrap; }            /* 强制不换行 */
    ```
  - 💡 **换行控制详解**（中英文混排必看）
    - `overflow-wrap: break-word`（推荐）：优先在单词间隙换行，只有当单词太长（超过容器宽度）时，才从单词中间打断
    - `word-break: break-all`（谨慎用）：不管是不是单词，直接在容器边缘打断，可能把英文单词切得乱七八糟（比如 "hello" 切成 "hel" 和 "lo"）
    - `white-space: nowrap`：强制不换行，文字会超出容器（适合小标签、按钮文字）

- **文本溢出省略号**（超实用技巧）

  当文本内容过长时，用省略号（...）代替，常用于卡片标题、列表项等。

  **单行文本溢出省略**：
  ```css
  .ellipsis {
    white-space: nowrap;      /* 强制不换行 */
    overflow: hidden;         /* 隐藏溢出内容 */
    text-overflow: ellipsis;  /* 用省略号代替溢出内容 */
  }
  ```
  ```html
  <p class="ellipsis" style="width: 200px;">
    这是一段很长很长很长很长很长的文字内容
  </p>
  <!-- 显示：这是一段很长很长很长... -->
  ```

  **多行文本溢出省略**（限制显示行数）：
  ```css
  .ellipsis-2 {
    display: -webkit-box;           /* 使用弹性盒模型 */
    -webkit-box-orient: vertical;   /* 垂直排列 */
    -webkit-line-clamp: 2;          /* 限制显示2行 */
    overflow: hidden;               /* 隐藏溢出内容 */
  }
  ```
  ```html
  <p class="ellipsis-2" style="width: 200px;">
    这是一段很长很长很长很长很长的文字内容，
    会在第二行末尾显示省略号，超出的内容会被隐藏。
  </p>
  <!-- 显示：
    这是一段很长很长很长很长很长的文字内容，
    会在第二行末尾显示省略号，超出的... -->
  ```

  ⚠️ **兼容性说明**：
  - 单行省略：所有现代浏览器都支持
  - 多行省略：`-webkit-line-clamp` 是 WebKit 私有属性，但主流浏览器（Chrome、Safari、Edge、Firefox）都已支持
  - IE 浏览器不支持多行省略，需要用 JavaScript 实现

  💡 **实际应用场景**：
  - 新闻列表标题（单行省略）
  - 商品卡片描述（2-3行省略）
  - 用户评论预览（多行省略）

- 综合示例
  ```css
  .article {
    color: #334155;
    font: 400 1rem/1.75 "Noto Sans SC", "Microsoft YaHei", sans-serif;
    text-align: left;
  }
  .article h1 { font-size: 1.875rem; line-height: 1.3; letter-spacing: .02em; }
  .article p  { margin: .75rem 0; text-indent: 2em; }
  .small-note  { color: #64748b; font-size: .875rem; }
  ```
- `font` 简写属性详解
  - **作用**：把 `font-weight`、`font-size`、`line-height`、`font-family` 等合并成一行写，简化代码
  - **语法**：`font: [style] [variant] [weight] size/line-height family`
  - **必须包含**：`size` 和 `family`，其他可选
  - 示例：
    ```css
    /* 完整写法 */
    font: italic small-caps 700 1rem/1.75 "Noto Sans SC", sans-serif;
    
    /* 常用简写 */
    font: 400 1rem/1.75 "Noto Sans SC", sans-serif;
    /* 等同于 */
    font-weight: 400;
    font-size: 1rem;
    line-height: 1.75;
    font-family: "Noto Sans SC", sans-serif;
    ```
  - ⚠️ **注意**：使用简写会重置所有未指定的字体属性为默认值（比如没写 `font-style`，会被重置为默认的 `normal`），慎用
  - 示例（常见陷阱）：
    ```css
    .text { font-variant: small-caps; }
    .text { font: 1rem sans-serif; } /* font-variant 被重置为 normal，small-caps 失效！ */
    ```

---

### 3.2 背景颜色与背景图

- 基础属性
  - `background-color`：设置背景颜色
    - 作用：给元素填充纯色背景
    - 示例：`background-color: #f3f4f6;`（浅灰色背景）
  - `background-image`：设置背景图片或渐变
    - 作用：在元素背景显示图片或渐变效果
    - 值：`url("图片路径")` 或 `linear-gradient()` / `radial-gradient()`
    - 示例：`background-image: url("/bg.jpg");`
  - `background-repeat`：控制背景图片是否重复
    - `no-repeat`：不重复（图片只显示一次）
    - `repeat`：水平和垂直都重复（默认值）
    - `repeat-x`：只水平重复
    - `repeat-y`：只垂直重复
  - `background-position`：设置背景图片的位置
    - 作用：控制背景图在元素中的显示位置
    - 关键词：`center`（居中）/ `top`（顶部）/ `bottom`（底部）/ `left`（左侧）/ `right`（右侧）
    - 精确值：`left 20px top 10px`（距离左边20px，距离顶部10px）
    - 百分比：`50% 50%`（居中，等同于 center）
  - `background-size`：控制背景图片的尺寸
    - `cover`：铺满整个容器（可能裁切图片，但不留白）
    - `contain`：完整显示图片（可能留白，但不裁切）
    - 具体值：`100px 200px`（宽100px，高200px）
    - 百分比：`100% auto`（宽度100%，高度自动）
  - `background-attachment`：控制背景图片是否随页面滚动
    - `scroll`（默认）：背景随元素滚动
    - `fixed`：背景固定在视口，产生视差效果
    - ⚠️ 兼容性：iOS Safari 不支持 `fixed`，会回退为 `scroll`
    - 移动端视差效果建议使用 JavaScript 或 CSS `transform` 实现
- Hero 背景示例
  ```css
  .hero {
    background-image: url("/images/hero.jpg");
    background-repeat: no-repeat;
    background-position: center;
    background-size: cover;
    color: white; padding: 60px 24px; text-align: center;
  }
  ```
- 渐变类型与语法
  - **线性渐变** `linear-gradient()`：沿直线方向的颜色过渡
    - 作用：创建从一个颜色平滑过渡到另一个颜色的背景
    - 基础语法：`linear-gradient(方向, 颜色1, 颜色2, ...)`
    - **方向参数**：
      - 关键词：`to right`（向右）/ `to bottom`（向下，默认）/ `to top left`（向左上）
      - 角度：`45deg`（45度）/ `135deg`（135度）/ `90deg`（向右）
    - 💡 **角度方向规律**：`0deg` 向上，顺时针递增，`90deg` 向右，`180deg` 向下，`270deg` 向左。记住这个规律就能自己推算任意角度。
    - 示例：
      ```css
      /* 从左到右，蓝色渐变到绿色 */
      background: linear-gradient(to right, #60a5fa, #34d399);
      
      /* 135度角，蓝色渐变到绿色 */
      background: linear-gradient(135deg, #60a5fa, #34d399);
      
      /* 颜色停止点：控制颜色在哪个位置 */
      background: linear-gradient(90deg, #3b82f6 0%, #8b5cf6 50%, #ec4899 100%);
      /* 0%位置是蓝色，50%位置是紫色，100%位置是粉色 */
      ```
  - **径向渐变** `radial-gradient()`：从中心点向外辐射的颜色过渡
    - 作用：创建圆形或椭圆形的渐变效果
    - 基础语法：`radial-gradient(形状 at 位置, 颜色1, 颜色2, ...)`
    - **形状参数**：
      - `circle`：圆形渐变
      - `ellipse`：椭圆形渐变（默认）
    - **位置参数**：
      - `center`（中心，默认）/ `top left`（左上）/ `50% 50%`（百分比）
    - 示例：
      ```css
      /* 从中心白色渐变到黑色的圆形 */
      background: radial-gradient(circle at center, #fff, #000);
      
      /* 从左上角开始的半透明蓝色椭圆渐变 */
      background: radial-gradient(ellipse at top left, rgba(59,130,246,.3), transparent);
      ```
- **`background` 简写属性**

  可以把多个背景属性合并成一行，简化代码。

  **语法顺序**（不强制，但推荐）：
  ```
  background: [color] [image] [repeat] [attachment] [position] / [size];
  ```

  **示例**：
  ```css
  /* 完整写法 */
  .hero {
    background-color: #f3f4f6;
    background-image: url("/bg.jpg");
    background-repeat: no-repeat;
    background-position: center;
    background-size: cover;
  }

  /* 简写（推荐） */
  .hero {
    background: #f3f4f6 url("/bg.jpg") no-repeat center / cover;
  }
  ```

  ⚠️ **注意事项**：
  - `size` 必须紧跟在 `position` 后面，用 `/` 分隔（如 `center / cover`）
  - 简写会重置所有未指定的背景属性为默认值
  - 如果需要精确控制，建议分开写

- **多重背景**（高级技巧）

  CSS 允许给一个元素设置多个背景图层，按照从上到下的顺序叠加。

  **语法**：用逗号分隔多个背景，第一个在最上层，最后一个在最下层。

  ```css
  .card {
    background:
      radial-gradient(600px 200px at 0% 0%, rgba(99,102,241,.15), transparent 60%),  /* 第1层：渐变光晕 */
      url("/images/pattern.svg"),                                                     /* 第2层：纹理图案 */
      #ffffff;                                                                        /* 第3层：纯色背景 */
    background-size: auto, 24px 24px, auto;  /* 分别设置每层的尺寸 */
    background-repeat: no-repeat, repeat, no-repeat;  /* 分别设置每层的重复方式 */
  }
  ```

  💡 **层叠顺序**：
  - 第一个背景在最上层（最先看到）
  - 最后一个背景在最下层（被其他层覆盖）
  - 纯色背景通常放在最后，作为兜底

  💡 **实际应用场景**：
  - 渐变 + 图片：给图片加一层半透明渐变蒙版
  - 多个图案叠加：创建复杂的纹理效果
  - 光晕 + 纹理 + 底色：现代 UI 设计常用

  **示例：给图片加深色蒙版**：
  ```css
  .hero {
    background:
      linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)),  /* 半透明黑色蒙版 */
      url("/hero.jpg") center / cover;                     /* 背景图片 */
  }
  ```

- 性能提示：大图需压缩与缓存；为小屏提供更小资源

---

### 3.3 边框与圆角

- **边框** `border`：给元素添加边框线
  - **三要素**：宽度 / 样式 / 颜色（缺一不可）
  - **简写语法**：`border: 宽度 样式 颜色;`
    - 示例：`border: 1px solid #e5e7eb;`（1像素实线浅灰色边框）
  - **边框样式值**：
    - `solid`：实线（最常用）
    - `dashed`：虚线
    - `dotted`：点线
    - `double`：双线
    - `none`：无边框
  - **单边设置**：只给某一边加边框
    - `border-top`：上边框
    - `border-right`：右边框
    - `border-bottom`：下边框
    - `border-left`：左边框
    - 示例：`border-bottom: 2px solid #3b82f6;`（只给底部加蓝色边框）
- **圆角** `border-radius`：让元素的四个角变圆润
  - 作用：控制元素边框的圆角程度
  - **单值**：四个角相同
    - 示例：`border-radius: 8px;`（四个角都是8px圆角）
  - **四值**：分别设置四个角（顺时针：左上 → 右上 → 右下 → 左下）
    - 示例：`border-radius: 8px 16px 8px 16px;`
  - **椭圆角**：水平半径 / 垂直半径
    - 示例：`border-radius: 24px / 12px;`（所有角的水平半径24px，垂直半径12px）
    - 复杂组合：`border-radius: 24px 8px / 8px 24px;`
  - **特殊形状**：
    - 圆形：正方形元素 + `border-radius: 50%;`
    - 胶囊形：`border-radius: 高度的一半;` 或 `border-radius: 9999px;`
- **轮廓** `outline` 与 `border` 的区别
  - 作用：在元素外围绘制一条线，常用于焦点状态提示
  - **与 border 的区别**：
    - `outline` 不占据布局空间（不会影响元素尺寸和位置）
    - `outline` 不能单独设置某一边
    - 旧版浏览器中 `outline` 不跟随 `border-radius` 弯曲（始终是矩形）；Chrome 94+、Firefox、Safari 等现代浏览器已支持 `outline` 跟随圆角
  - **常用场景**：表单元素获得焦点时的可视化提示
  - **语法**：`outline: 宽度 样式 颜色;`
  - **outline-offset**：控制轮廓与元素边缘的距离
  - 示例：
    ```css
    .btn:focus { 
      outline: 2px solid #2563eb;  /* 2px蓝色实线轮廓 */
      outline-offset: 2px;          /* 轮廓距离元素边缘2px */
    }
    ```
- 卡片示例
  ```css
  .card { border: 1px solid #e5e7eb; border-radius: 12px; padding: 16px; background: #fff; }
  ```

---

### 3.4 盒子阴影与文字阴影

- 盒子阴影 `box-shadow`
  - 语法：`offset-x offset-y blur-radius [spread-radius] color [inset]`
    - `offset-x`：水平偏移（正值向右，负值向左）
    - `offset-y`：垂直偏移（正值向下，负值向上）
    - `blur-radius`：模糊半径（越大越模糊，0 为实边）
    - `spread-radius`：扩散半径（正值阴影扩大，负值缩小）
    - `inset`：内阴影（默认外阴影）
  - 可多重阴影，用逗号分隔
  - 示例：
  ```css
  /* 基础阴影：向右2px 向下2px 模糊4px */
  box-shadow: 2px 2px 4px rgba(0,0,0,.1);
  
  /* 带扩散：向下4px 模糊8px 扩散2px */
  box-shadow: 0 4px 8px 2px rgba(0,0,0,.15);
  
  /* 多重阴影 */
  .elev-1 { box-shadow: 0 1px 2px rgba(0,0,0,.08), 0 1px 1px rgba(0,0,0,.04); }
  .inner  { box-shadow: inset 0 0 0 1px rgba(0,0,0,.06); }
  .neumorph {
    background: #e7ecf0; border-radius: 16px;
    box-shadow: 8px 8px 16px #c5cacf, -8px -8px 16px #ffffff;
  }
  ```
- **文字阴影** `text-shadow`：给文字添加阴影效果
  - 作用：让文字更有立体感或发光效果
  - **语法**：`offset-x offset-y blur-radius color`
    - `offset-x`：水平偏移（正值向右，负值向左）
    - `offset-y`：垂直偏移（正值向下，负值向上）
    - `blur-radius`：模糊半径（可选，越大越模糊）
    - `color`：阴影颜色
  - **与 box-shadow 的区别**：
    - `text-shadow` 没有扩散半径（spread-radius）参数
    - `text-shadow` 没有 `inset` 关键字（文字阴影只能在外部）
  - 示例：
    ```css
    /* 标题阴影：向下1px，模糊2px */
    .title-shadow { text-shadow: 0 1px 2px rgba(0,0,0,.25); }
    
    /* 发光效果：无偏移，模糊8px，蓝色光晕 */
    .glow { color: #fff; text-shadow: 0 0 8px rgba(59,130,246,.8); }
    
    /* 多重阴影：创建更复杂的效果 */
    .neon { text-shadow: 0 0 5px #fff, 0 0 10px #fff, 0 0 20px #0ff; }
    ```
- 💡 **设计建议**：
  - 阴影用于表现层级与悬浮感
  - 轻量柔和优先（过重的阴影显得廉价）
  - 文本阴影谨慎使用（容易影响可读性）

---

## 学习总结与实践建议

### 🎯 本篇核心要点回顾

**第1章：CSS 基础认知**
- ✅ CSS = Cascading Style Sheets（层叠样式表），用于控制网页外观
- ✅ 三种引入方式：内联（快速测试）、内部（单页）、外部（推荐）
- ✅ 浏览器渲染流程：HTML → DOM，CSS → CSSOM，合并 → 渲染树 → 布局 → 绘制
- ✅ 层叠规则：!important > 特异性 > 书写顺序

**第2章：选择器基础**
- ✅ 标签选择器：影响所有同名标签
- ✅ 类选择器（最常用）：可复用、可组合
- ✅ ID 选择器（慎用）：优先级过高，不可复用
- ✅ 后代 vs 子代：空格选所有层级，`>` 只选直接子元素
- ✅ 兄弟选择器：`+` 选紧邻的，`~` 选后面所有的
- ✅ 属性选择器：根据 HTML 属性选择元素
- ✅ 伪类：选择元素的特定状态（`:hover`、`:focus`、`:first-child`、`:checked` 等）
- ✅ 伪元素：创建虚拟元素（`::before`、`::after`、`::placeholder` 等）
- ✅ 权重计算：`a-b-c-d` 四位数密码，从左到右比大小

**第3章：常用属性**
- ✅ 字体：`font-family`（回退序列）、`font-size`（推荐 rem）、`font-weight`、`line-height`（无单位）
- ✅ 文本：`color`、`text-align`、`letter-spacing`、`text-transform`、文本省略号
- ✅ 背景：`background-color`、`background-image`、渐变、多重背景
- ✅ 边框：`border`（三要素）、`border-radius`（圆角）、`outline`（不占空间）
- ✅ 阴影：`box-shadow`（盒子阴影）、`text-shadow`（文字阴影）

### 💡 给小白的学习建议

**1. 动手实践最重要**
- 不要只看不练：每学一个属性，立刻在浏览器里试一试
- 使用开发者工具（F12）：实时修改样式，看效果
- 建议：创建一个 `practice.html` 文件，把本文的所有示例都敲一遍

**2. 循序渐进，不要贪多**
- 第一周：掌握选择器和文本样式（能给页面上色、调字体）
- 第二周：掌握背景和边框（能做出好看的卡片、按钮）
- 第三周：理解盒模型和布局（为下一篇做准备）

**3. 建立自己的"样式库"**
- 把常用的样式保存下来：按钮样式、卡片样式、文本省略等
- 遇到好看的网站，用开发者工具看它的 CSS，学习借鉴

**4. 遇到问题怎么办？**
- 样式不生效：检查选择器是否正确、权重是否足够、有没有拼写错误
- 效果不理想：用开发者工具调试，边改边看
- 不知道怎么实现：搜索"CSS + 你想要的效果"（如"CSS 渐变按钮"）

**5. 常见新手误区**
- ❌ 到处用 ID 选择器 → ✅ 优先用 class
- ❌ 到处用 !important → ✅ 通过合理的选择器解决
- ❌ 不写注释 → ✅ 复杂样式要写注释说明
- ❌ 样式写得很乱 → ✅ 按模块组织，相关样式放一起

### 🚀 下一步学习方向

学完本篇后，你已经掌握了 CSS 的基础语法和常用属性。接下来可以学习：

1. **CSS 盒模型与布局**（第二篇）
   - margin、padding、border 的关系
   - display 属性（block、inline、flex、grid）
   - 定位（position）和浮动（float）

2. **Flexbox 弹性布局**（第三篇）
   - 现代布局的核心技术
   - 轻松实现水平垂直居中、等高列等

3. **响应式设计**（第四篇）
   - 媒体查询（@media）
   - 移动端适配
   - 断点设计

4. **CSS 动画与过渡**（第五篇）
   - transition（过渡）
   - animation（动画）
   - transform（变换）

### 📚 推荐练习项目

用本篇学到的知识，尝试做这些小项目：

1. **个人名片页**：练习字体、颜色、背景
2. **按钮组件库**：不同颜色、尺寸的按钮
3. **卡片列表**：新闻卡片、商品卡片
4. **简单导航栏**：练习选择器和伪类

---

参考资料（拓展阅读）：
- MDN 学习 CSS（中文）：https://developer.mozilla.org/zh-CN/docs/Learn/CSS/First_steps
- CSS 优先级（特异性）：https://developer.mozilla.org/zh-CN/docs/Web/CSS/Specificity
- Can I Use（查询 CSS 属性兼容性）：https://caniuse.com/
