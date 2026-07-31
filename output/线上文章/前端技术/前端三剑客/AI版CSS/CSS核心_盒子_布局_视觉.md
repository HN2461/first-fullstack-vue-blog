---
title: "CSS 核心：盒子、布局、视觉"
slug: "css-css-74c20f0d"
summary: ""
category: "AI版CSS"
tags: []
status: "draft"
sortOrder: 60
cover: ""
originalId: "6a2d30eeb480df92ce002e20"
originalSlug: "css-css-74c20f0d"
originalStatus: "published"
exportedAt: "2026-07-31T03:42:38.792Z"
---
# 第二篇 CSS 核心：盒子、布局、视觉

> 目标：搞懂「盒模型」「视觉基础」「布局基础」这三个 CSS 的核心支柱。看完这一篇，你应该能读懂浏览器开发者工具的盒模型面板，知道一个元素到底占多大空间、为什么会“挤下去”，并且能写出不那么混乱的基础布局。

---

## 第4章 盒模型：前端世界的物理规则

> 这一章解决的核心问题：
>
> - 一个元素在页面上到底有多宽、多高？
> - 为什么明明写了 `width: 100px`，看起来却更宽？
> - 元素与元素之间的「空隙」到底是 `margin` 还是 `padding` ？
>
> 只要你想在页面上「放盒子」「排盒子」，就离不开盒模型。

### 4.1 content、padding、border、margin

先记住一句话：**在浏览器眼里，每一个元素都是一个盒子**。

这个盒子由 4 层组成（从里到外）：

1. **content**：内容区域
2. **padding**：内边距，在内容和边框之间的留白
3. **border**：边框
4. **margin**：外边距，盒子和其它盒子之间的距离

#### 4.1.1 直观图示（心里建立模型）

💡 **生活化比喻**：把盒子想象成一个快递包裹

- **content（内容）**：包裹里的商品本身
- **padding（内边距）**：商品周围的泡沫填充物（保护商品，让它不会直接碰到盒子边缘）
- **border（边框）**：快递盒子的纸板（可以看见的边界）
- **margin（外边距）**：这个快递盒和其他快递盒之间的距离（放在仓库里时，盒子之间要留点空隙）

用一个文字图来帮助你记忆：

```txt
|<------  整个盒子的可见范围  ------>|

      ┌───────────────────────────┐
      │         margin            │  ← 外边距：透明的"隔开距离"（不可见）
      │   ┌───────────────────┐   │
      │   │      border       │   │  ← 边框：有颜色、可见
      │   │  ┌─────────────┐  │   │
      │   │  │   padding   │  │   │  ← 内边距：内容周围的留白（背景色会填充这里）
      │   │  │ ┌─────────┐ │  │   │
      │   │  │ │ content │ │  │   │  ← 内容：文字、图片等
      │   │  │ └─────────┘ │  │   │
      │   │  └─────────────┘  │   │
      │   └───────────────────┘   │
      └───────────────────────────┘
```

💡 **关键理解**：
- **背景色（background-color）** 会填充 content + padding 区域，但不包括 margin
- **边框（border）** 是盒子的"外壳"，有颜色、有宽度
- **margin** 是透明的，用来和其他盒子保持距离

**实际示例**：

```html
<div class="box">这是内容</div>
```

```css
.box {
  /* 内容区域 */
  width: 200px;
  height: 100px;
  
  /* 内边距：内容和边框之间的留白 */
  padding: 20px;
  
  /* 边框：盒子的边界线 */
  border: 5px solid #2563eb;
  
  /* 外边距：盒子和其他元素的距离 */
  margin: 30px;
  
  /* 背景色：会填充 content + padding 区域 */
  background-color: #dbeafe;
}
```

在浏览器中，这个盒子会：
- 内容区域：200px × 100px（蓝色背景）
- 加上 padding：内容周围有 20px 的蓝色留白
- 加上 border：外面有 5px 的蓝色边框线
- 加上 margin：整个盒子和其他元素保持 30px 的距离（透明的）

#### 4.1.2 四个方向的写法

多数盒模型相关属性都有“四个方向”的写法：`top`、`right`、`bottom`、`left`。

- **padding**：内边距

  ```css
  .box {
    padding-top: 10px;
    padding-right: 20px;
    padding-bottom: 10px;
    padding-left: 20px;
  }
  ```

  简写方式（从上开始，顺时针）：

  ```css
  .box {
    padding: 10px 20px;        /* 上下 10px，左右 20px */
    /* padding: 10px;          四个方向都是 10px */
    /* padding: 5px 10px 15px; 上 5，左右 10，下 15 */
    /* padding: 5px 10px 15px 20px; 上右下左 */
  }
  ```

- **margin**：外边距（语法与 padding 类似）

  ```css
  .box {
    margin: 16px auto;  /* 上下 16px，左右自动（常用于水平居中） */
  }
  ```

- **border**：边框

  ```css
  .box {
    border: 1px solid #e5e7eb;   /* 宽度 + 样式 + 颜色 */
    /* 也可拆开写：*/
    border-width: 1px;
    border-style: solid;         /* solid/dashed/dotted 等 */
    border-color: #e5e7eb;
  }
  ```

#### 4.1.3 它们分别“算不算宽度”？

这是很多同学一开始最容易乱的地方。

在默认情况下（`box-sizing: content-box`，后面会详细讲）：

- `width` / `height` 描述的是 **content 区域** 的宽高
- `padding`、`border` 会 **额外增加** 盒子的可见大小
- `margin` 不算在盒子本身的宽高里，它是「盒子外面」的距离

来看一个例子：

```css
.box {
  width: 200px;
  padding: 10px;
  border: 5px solid #000;
  margin: 20px;
}
```

- 内容区宽度：`200px`
- 左右 padding 共：`10px + 10px = 20px`
- 左右 border 共：`5px + 5px = 10px`
- **盒子整体的可见宽度 = 200 + 20 + 10 = 230px**
- `margin` 只是把盒子和周围元素「推开」，不计入这 230px 里面。

**记忆口诀：**

- `width` 写的是「内容」宽度（默认）
- 看起来的实际宽度 = `content + padding + border`
- `margin` 是“社交距离”，不算在自己身体里


### 4.2 box-sizing 的两种世界

有了上面的理解，你应该会问：

> 我就想让这个盒子“对外来说”始终是 200px 宽，为什么要去心算 padding 和 border？

这就是 **`box-sizing`** 要解决的问题。

#### 4.2.1 两种主流模式

- `content-box`（默认）
  - `width` / `height` 只表示 `content` 大小
  - padding 和 border 会把盒子撑大
- `border-box`（推荐用）
  - `width` / `height` 表示 **整个盒子** 的大小（包含 content + padding + border）
  - 你加 padding 或 border，内容区会变小，但对外尺寸不变

#### 4.2.2 直观对比示例

```css
.content-box-example {
  box-sizing: content-box;  /* 默认 */
  width: 200px;
  padding: 20px;
  border: 5px solid #000;
}

.border-box-example {
  box-sizing: border-box;
  width: 200px;
  padding: 20px;
  border: 5px solid #000;
}
```

- `.content-box-example` 实际可见宽度：
  - 200（content） + 40（左右 padding） + 10（左右 border） = 250px
- `.border-box-example` 实际可见宽度：
  - 固定为 200px，浏览器会在内部「挤」内容区，让总宽度不变。

可以用一张对比图来理解两者差别（横向只画宽度）：

```txt
content-box（默认）：width 只算内容

|<-------------------- 250px 可见宽度 -------------------->|

 [  padding  ][ content(200) ][  padding  ]
|----20px----|<---- 200px --->|----20px----|
 外侧还有左右各 5px border（略）

border-box：width 包含 padding + border

|<-------------------- 200px 可见宽度 -------------------->|

 [p+bor][   content 被压缩   ][p+bor]

外观总宽度始终是 200px，只是内容区变窄了。
```

#### 4.2.3 为什么现代项目几乎都用 border-box？

- 更符合「人类直觉」：`width: 200px` 就真的对外就是 200px
- 布局更稳定：加个边框、改个 padding，不会把布局整个挤坏
- 方便做响应式：元素在不同屏幕下更好控制

因此，在大多数项目里，你会看到这样的“全局设置”：

```css
*, *::before, *::after {
  box-sizing: border-box;
}
```

含义是：所有元素及其伪元素都使用 `border-box` 模式。

#### 4.2.4 实战小练习

你可以用浏览器 DevTools 做一个小实验：

1. 随便在页面上放一个 `div`，设置 `width: 200px; padding: 20px; border: 5px solid;`
2. 切换 `box-sizing` 为 `content-box` 与 `border-box`
3. 观察 DevTools 里的盒模型图，实际宽度是怎么变的

这个实验做一遍，你对盒模型的感觉会立刻清晰很多。

#### 4.2.5 再用一张“横向对比图”巩固一下

假设写的代码完全一样：

```css
.box {
  width: 200px;
  padding: 20px;
  border: 4px solid #0ea5e9;
}
```

只改 `box-sizing` 的取值：

```css
.box-content { box-sizing: content-box; }
.box-border  { box-sizing: border-box; }
```

在脑中可以想象成两条水平线：

```txt
content-box：width 只算内容

  总宽度 = 内容 200
           + 左右 padding 20 + 20 = 40
           + 左右 border   4 + 4  = 8
         = 248px

  |<---------- 200 ---------->|  ← content
      ←20→             ←20→      ← padding
    ←4→                   ←4→    ← border

border-box：width 把 padding 和 border 都算进去

  总宽度 = 200px（对外固定不变）
  其中：
    内容宽度 = 200 - 40(padding) - 8(border) = 152px

  |<----------- 200px（对外看见的盒子） ----------->|
    ←4→←20→<----- 152 内容 ----->←20→←4→
```

**面向布局的直觉用法：**

- 如果你更关心“这个格子占多宽”，就用 `border-box`（大多数现代布局这样）
- 如果你更关心“里面内容有多宽”，并可以手算，把 padding/border 算在外面，那就保留 `content-box`

### 4.3 外边距折叠（margin collapse）

`margin` 有一个经常让人抓狂的行为：**外边距折叠**（Margin Collapse）。

> 简单说：某些情况下，两个 `margin` 不会相加，而是「合并成一个更大的值」。

💡 **生活化比喻**：想象两个人背靠背站着

- 第一个人说："我要和你保持 40cm 的距离"（margin-bottom: 40px）
- 第二个人说："我要和你保持 20cm 的距离"（margin-top: 20px）
- 你可能以为他们之间的距离是 40 + 20 = 60cm
- 但实际上，他们之间的距离只有 40cm（取较大值）

这就是 margin 折叠！两个 margin 不是相加，而是"比大小"，取较大的那个。

**为什么会有这个设计？**

这是 CSS 规范有意为之的，主要是为了让文章排版更自然：
- 比如两个段落 `<p>`，每个都有 `margin: 16px 0;`
- 如果不折叠，段落之间的距离就是 32px（太大了）
- 折叠后，段落之间的距离是 16px（刚刚好）

**⚠️ 重要**：margin 折叠只发生在**垂直方向**（上下），**不会发生在水平方向**（左右）！

#### 4.3.1 哪些情况下会折叠？

常见的三种：

1. **上下相邻的兄弟块级元素**
2. **父块级元素与第一个/最后一个子元素之间**
3. **空块级元素自身上下 margin**

先看最典型的：**相邻兄弟元素**。

```html
<div class="a">A</div>
<div class="b">B</div>
```

```css
.a { margin-bottom: 40px; background: #fee2e2; }
.b { margin-top: 20px; background: #dbeafe; }
```

很多同学直觉会以为：A 和 B 之间的距离 = `40px + 20px = 60px`。

但实际上，这两个垂直方向的 margin 会发生「折叠」：

- 两个 margin 取 **较大值 40px**
- 所以最后 A 和 B 之间的距离是 **40px**，而不是 60px

> 口诀：**兄弟之间，上下 margin 会“比大小”。**

#### 4.3.2 父元素与子元素的 margin 折叠

这是一个**非常容易踩的坑**，很多新手会在这里困惑很久。

**问题场景**：父容器内的第一个或最后一个子元素的 `margin-top` / `margin-bottom` 会和父元素折叠。

**示例代码**：

```html
<div class="wrapper">
  <p>一段文字</p>
</div>
```

```css
.wrapper {
  background: #e0f2fe;
  /* 没有 padding，没有 border */
}

.wrapper p {
  margin-top: 20px;  /* 想让 p 距离父元素顶部 20px */
}
```

**💡 你的期望**：
- `<p>` 元素距离 `.wrapper` 的上边缘有 20px 的空白
- `.wrapper` 的背景色从顶部开始，`<p>` 在里面往下 20px

**😱 实际效果**：
- **整个 `.wrapper` 盒子自己也被往下推了 20px**
- `.wrapper` 内部顶部没有空白，`<p>` 紧贴着父元素顶部
- 看起来像是 `.wrapper` 本身有了 `margin-top: 20px`

---

**🤔 为什么会这样？**

这是 CSS 规范的设计：
- 当父元素和子元素之间**没有任何"阻隔"**（没有 padding、border、内容等）
- 子元素的 margin 会"穿透"父元素，和父元素的 margin 折叠
- 最终表现为父元素整体被推下去

**💡 生活化比喻**：

想象你（子元素）站在一个透明玻璃房（父元素）里：
- 你说："我要和房顶保持 20cm 距离"（`margin-top: 20px`）
- 但因为玻璃房是透明的，没有实体边界（没有 padding/border）
- 结果整个玻璃房被抬高了 20cm，而你仍然紧贴着房顶
- 从外面看，是房子被抬高了，而不是你在房子里往下移

---

**✅ 解决方案**

核心思路：**在父子元素之间制造"阻隔"，阻止 margin 折叠**

**方案1：给父元素加 padding**（最常用）

```css
.wrapper { 
  padding-top: 20px;  /* 用 padding 代替子元素的 margin */
}

.wrapper p {
  /* margin-top: 20px;  不需要了 */
}
```

✅ 优点：简单直观，符合直觉
⚠️ 注意：如果父元素设置了 `box-sizing: border-box`，padding 会占用内部空间

**方案2：给父元素加 border**

```css
.wrapper { 
  border-top: 1px solid transparent;  /* 透明边框，不可见但能阻止折叠 */
}

.wrapper p {
  margin-top: 20px;  /* 现在生效了 */
}
```

✅ 优点：子元素的 margin 能正常工作
❌ 缺点：多了 1px 的高度（虽然透明）

**方案3：让父元素形成 BFC（块格式化上下文）**

```css
.wrapper { 
  overflow: hidden;  /* 触发 BFC */
}

.wrapper p {
  margin-top: 20px;  /* 现在生效了 */
}
```

✅ 优点：不增加额外的 padding 或 border
⚠️ 注意：`overflow: hidden` 会裁剪溢出内容

**其他触发 BFC 的方式**：

```css
/* 方式1：display */
.wrapper { display: flow-root; }  /* 专门用来创建 BFC，无副作用（推荐） */

/* 方式2：position */
.wrapper { position: absolute; }  /* 会脱离文档流，慎用 */

/* 方式3：float */
.wrapper { float: left; }  /* 会改变布局，慎用 */

/* 方式4：display: flex/grid */
.wrapper { display: flex; }  /* Flex 容器，推荐用于现代布局 */
```

**方案4：给父元素加一点内容**

```css
.wrapper::before {
  content: "";
  display: table;  /* 创建一个不可见的"阻隔" */
}
```

✅ 优点：不影响布局，不增加高度
❌ 缺点：代码稍复杂

---

**📊 解决方案对比表**

| 方案 | 代码 | 优点 | 缺点 | 推荐度 |
|------|------|------|------|--------|
| padding | `padding-top: 20px` | 简单直观 | 占用空间 | ⭐⭐⭐⭐⭐ |
| border | `border-top: 1px solid transparent` | margin 正常工作 | 多 1px 高度 | ⭐⭐⭐ |
| overflow | `overflow: hidden` | 不增加尺寸 | 裁剪溢出 | ⭐⭐⭐⭐ |
| display: flow-root | `display: flow-root` | 无副作用 | 兼容性稍差 | ⭐⭐⭐⭐⭐ |
| display: flex | `display: flex` | 现代布局 | 改变布局方式 | ⭐⭐⭐⭐⭐ |
| ::before | `::before + display: table` | 不影响布局 | 代码复杂 | ⭐⭐⭐ |

**💡 新手建议**：
- 简单场景：直接用 `padding`
- 现代项目：用 `display: flex` 或 `display: flow-root`
- 需要保持 margin 语义：用 `overflow: hidden` 或 `border`

---

**🎨 可视化对比**

**期望的样子（不折叠时）**：

```txt
┌─ wrapper ──────────────────┐
│ ← 20px 空白 →              │
│   ┌─ p ─────────────────┐  │
│   │ 一段文字             │  │
│   └─────────────────────┘  │
└────────────────────────────┘
```

**实际折叠后的效果（❌ 错误）**：

```txt
← 20px 空白 →
    ↓
┌─ wrapper ──────────────────┐  ← 整个盒子被推下去了
│ ┌─ p ─────────────────────┐│  ← p 紧贴父元素顶部
│ │ 一段文字                 ││
│ └─────────────────────────┘│
└────────────────────────────┘
```

**加了 padding 后（✅ 正确）**：

```css
.wrapper { padding-top: 20px; }
```

```txt
┌─ wrapper ──────────────────┐
│ ← 20px padding →           │  ← padding 撑开了空间
│   ┌─ p ─────────────────┐  │
│   │ 一段文字             │  │
│   └─────────────────────┘  │
└────────────────────────────┘
```

---

**⚠️ 同样的问题也会发生在底部**

```css
.wrapper p:last-child {
  margin-bottom: 30px;  /* 想让最后一个 p 距离父元素底部 30px */
}
```

结果：整个 `.wrapper` 下方会多出 30px 的空白（margin 折叠到父元素外面了）

**解决方法相同**：
- 给父元素加 `padding-bottom`
- 或者用上面提到的任何一种方案

---

**🔍 如何判断是否发生了父子 margin 折叠？**

**方法1：用 DevTools 查看**
1. 打开浏览器开发者工具（F12）
2. 选中父元素，查看盒模型面板
3. 如果父元素的 margin 区域显示了子元素的 margin 值，说明发生了折叠

**方法2：给父元素加背景色**
```css
.wrapper {
  background: #e0f2fe;  /* 加个背景色 */
}
```
- 如果背景色顶部没有空白，说明子元素的 margin 没有在父元素内部生效
- 如果整个盒子被往下推，说明发生了折叠

**方法3：用 outline 调试**
```css
.wrapper {
  outline: 2px solid red;  /* 不占空间的边框 */
}
```
- 如果红框顶部紧贴着子元素，说明 margin 没有在内部生效

---

**💡 记忆口诀**

```txt
父子之间无阻隔，
margin 会向外穿透。
加个 padding 或 border，
或者 BFC 来阻挡。
```

**本质理解**：
- margin 折叠的设计初衷是为了让文章排版更自然
- 但在做布局时，这个特性经常会造成困扰
- 记住：**padding 是内部留白，margin 是外部距离**
- 当你想要"内部留白"时，用 padding 更符合语义

#### 4.3.3 空块级元素的 margin 折叠

如果一个块级元素：

- 没有 `border`
- 没有 `padding`
- 没有内容
- 没有设定 `height`/`min-height`

则它自己的 `margin-top` 和 `margin-bottom` 也会折叠成一个（取较大值）。

这一点在实际开发中比较少刻意用到，但在调试怪异空隙时要有这个心理准备。

#### 4.3.4 什么时候最容易被坑？

- 做文章页面时，用 `p { margin: 16px 0; }`，
  再在每个 `section` 外套一层容器，结果发现外层和内层的间距「对不上直觉」。
- 做卡片时，以为卡片内部元素的 `margin-top` 只会影响内部，结果整体卡片被往下挤。

**调试建议：**

- 打开 DevTools，选中元素
- 看「Computed」或「Layout」中的 margin 显示
- 把 `margin` 改为 `padding` 看看效果是否更符合预期

> 一般来说：
> - **内部的间距**（内容与边框之间的放松空间）用 `padding`
> - **组件与组件之间的距离**用 `margin`


### 4.4 盒子调试技巧

学会盒模型的概念后，**会用工具调试**同样非常关键。

#### 4.4.1 利用浏览器 DevTools 的盒模型面板

以 Chrome 为例：

1. 打开页面 → F12 / 右键「检查」
2. 在元素面板中选中某个元素
3. 右侧有一个「Layout」或「Computed → Box Model」区域
4. 你会看到一个类似这样的图：

```txt
margin
border
padding
content
```

每一块都有具体的数值：

- 可以直接在面板中 **点击数值修改试验**
- 鼠标悬停在 `margin` / `padding` 上，页面会高亮对应的区域

建议多做几次：

- 选中文章中的一个段落
- 改它的 `margin-top` / `padding-top`
- 观察界面和盒模型图的变化

#### 4.4.2 给盒子临时加“调试边框”

有时候你分不清到底是哪个元素占了空间，可以给所有元素加一个临时的调试样式：

```css
* {
  outline: 1px solid rgba(0, 0, 0, 0.1);
}
```

或更常见地，只给你关心的元素加：

```css
.debug-box {
  outline: 1px dashed #f97316;
}
```

- `outline` 不会影响布局，只是一个视觉辅助
- 这招在排查“看不见但占了空间的盒子”时非常有用

#### 4.4.3 用背景色帮助理解内外间距

如果你经常分不清 `padding` 和 `margin`：

- 设置一个明显的 `background-color`
- 然后分别修改 `padding` 和 `margin` 看效果

示例：

```css
.demo {
  background: #bfdbfe;  /* 浅蓝色 */
  padding: 20px;
  margin: 20px;
}
```

观察：

- 改 `padding`：背景色区域跟着变大/变小
- 改 `margin`：背景色区域大小不变，只是整体盒子和其它元素的距离变了

#### 4.4.4 小结：盒模型心智模型

你可以用下面这套思考方式来检查一个元素：

1. 先看 **content**：文字/图片本身多大？有没有 `width` / `height`？
2. 再看 **padding**：内容周围要留多少“呼吸空间”？
3. 再看 **border**：要不要加边框？会不会影响整体宽度？
4. 最后看 **margin**：这个盒子和旁边盒子的距离是多少？

同时记住：

- 默认是 `content-box`，实际宽度 = 内容宽度 + padding + border
- 一般项目会全局改成 `border-box`，更符合直觉
- 上下 `margin` 可能会发生折叠，这是很多“莫名其妙空隙”的来源

---

> 第4章到这里先告一段落。接下来的第5章，我们会在盒模型的基础上，进一步讲「颜色、单位、图像」等视觉基础，让你的盒子不仅尺寸合理，而且好看、灵活、适配不同屏幕。

## 第5章 视觉表现：颜色、单位、图像

> 这一章解决的核心问题：
>
> - 颜色代码一堆（`#fff`、`rgb()`、`hsl()`、渐变），到底该用哪个？
> - `px`、`%`、`em`、`rem`、`vw`、`vh` 看起来都能写宽度，有什么区别？
> - 背景图总是拉伸、变形、重复，怎么才能既铺满又好看？

### 5.1 RGB、HSL、透明度与渐变

#### 5.1.1 常见颜色表示方式

CSS 里常见的几种颜色写法：

**1. 十六进制（Hexadecimal）**

最常见的颜色写法，格式：`#RRGGBB`（红绿蓝三个通道，每个通道 00-FF）

```css
color: #000000;  /* 黑色 */
color: #ffffff;  /* 白色 */
color: #2563eb;  /* 蓝色 */
color: #ff0000;  /* 红色 */
```

💡 **简写规则**：如果每个通道的两位数字相同，可以简写
- `#000000` → `#000`（黑色）
- `#ffffff` → `#fff`（白色）
- `#336699` → `#369`（蓝灰色）

**2. RGB（Red Green Blue）**

用三个数字（0-255）分别表示红、绿、蓝的强度

```css
color: rgb(37, 99, 235);     /* 蓝色 */
color: rgb(255, 0, 0);       /* 红色 */
color: rgb(0, 0, 0);         /* 黑色 */
color: rgb(255, 255, 255);   /* 白色 */
```

**3. RGBA（RGB + Alpha）**

在 RGB 基础上增加透明度（Alpha），范围 0-1

```css
color: rgba(37, 99, 235, 0.5);   /* 半透明蓝色 */
color: rgba(0, 0, 0, 0.1);       /* 10% 不透明度的黑色（很淡的灰） */
color: rgba(255, 255, 255, 0.9); /* 90% 不透明度的白色 */
```

💡 **透明度说明**：
- `0`：完全透明（看不见）
- `0.5`：半透明
- `1`：完全不透明（等同于 rgb）

**4. HSL（Hue Saturation Lightness）**

HSL 是一种**更符合人类直觉**的颜色表示方式，特别适合做颜色调整和主题系统。

💡 **为什么 HSL 更直观？**

- RGB：`rgb(37, 99, 235)` → 你很难想象这是什么颜色
- HSL：`hsl(221, 83%, 53%)` → 221度的蓝色，很鲜艳，中等亮度

**基本语法**：

```css
color: hsl(色相, 饱和度, 亮度);
```

**示例**：

```css
color: hsl(221, 83%, 53%);   /* 蓝色 */
color: hsl(0, 100%, 50%);    /* 红色 */
color: hsl(120, 100%, 50%);  /* 绿色 */
color: hsl(60, 100%, 50%);   /* 黄色 */
color: hsl(300, 100%, 50%);  /* 品红色 */
```

---

**📐 参数详解**

**H（Hue 色相）**：0-360 度，表示色环上的位置

色相就是"什么颜色"，用角度表示：

```txt
色环示意图（从上方开始，顺时针）：

           0° 红色
            ↑
    315°  ╱   ╲  45° 橙色
        ╱       ╲
  270° ←         → 90°
  紫色 ╲       ╱ 黄绿色
        ╲   ╱
    225° ↓ 135°
      180° 青色

常用色相角度：
  0° / 360° = 红色 (Red)
  30°       = 橙红色
  60°       = 黄色 (Yellow)
  120°      = 绿色 (Green)
  180°      = 青色 (Cyan)
  240°      = 蓝色 (Blue)
  300°      = 品红色 (Magenta)
```

**实际示例**：

```css
/* 色相变化：从红到紫的彩虹色 */
.red     { color: hsl(0, 100%, 50%); }    /* 红 */
.orange  { color: hsl(30, 100%, 50%); }   /* 橙 */
.yellow  { color: hsl(60, 100%, 50%); }   /* 黄 */
.green   { color: hsl(120, 100%, 50%); }  /* 绿 */
.cyan    { color: hsl(180, 100%, 50%); }  /* 青 */
.blue    { color: hsl(240, 100%, 50%); }  /* 蓝 */
.purple  { color: hsl(300, 100%, 50%); }  /* 紫 */
```

💡 **记忆技巧**：
- 0° 是红色（起点）
- 每隔 60° 是一个主要颜色（红→黄→绿→青→蓝→紫）
- 360° 又回到红色（一个完整的圆）

---

**S（Saturation 饱和度）**：0%-100%，表示颜色的鲜艳程度

饱和度就是"颜色有多鲜艳"：
- **0%**：完全没有色彩，变成灰色
- **50%**：柔和的颜色
- **100%**：最鲜艳、最纯的颜色

**可视化对比**（以蓝色为例）：

```css
/* 同样的蓝色（240°），不同饱和度 */
.blue-gray   { color: hsl(240, 0%, 50%); }   /* 灰色（无色彩） */
.blue-pale   { color: hsl(240, 30%, 50%); }  /* 淡蓝色 */
.blue-soft   { color: hsl(240, 60%, 50%); }  /* 柔和蓝 */
.blue-vivid  { color: hsl(240, 100%, 50%); } /* 鲜艳蓝 */
```

```txt
饱和度变化示意（从左到右）：

S = 0%      S = 30%     S = 60%     S = 100%
灰色        淡蓝        柔和蓝      鲜艳蓝
████        ████        ████        ████
无色彩   ←  逐渐鲜艳  →  最鲜艳
```

💡 **应用场景**：
- 做主题色的"淡色版本"：降低饱和度（如 `hsl(221, 30%, 53%)`）
- 做灰度图：饱和度设为 0%
- 做鲜艳按钮：饱和度设为 100%

---

**L（Lightness 亮度）**：0%-100%，表示颜色的明暗

亮度就是"颜色有多亮"：
- **0%**：纯黑色（无论色相和饱和度是多少）
- **50%**：正常颜色（最能体现色相的状态）
- **100%**：纯白色（无论色相和饱和度是多少）

**可视化对比**（以红色为例）：

```css
/* 同样的红色（0°），不同亮度 */
.red-black   { color: hsl(0, 100%, 0%); }   /* 黑色 */
.red-dark    { color: hsl(0, 100%, 25%); }  /* 深红 */
.red-normal  { color: hsl(0, 100%, 50%); }  /* 正常红 */
.red-light   { color: hsl(0, 100%, 75%); }  /* 浅红 */
.red-white   { color: hsl(0, 100%, 100%); } /* 白色 */
```

```txt
亮度变化示意（从左到右）：

L = 0%      L = 25%     L = 50%     L = 75%     L = 100%
黑色        深红        正常红      浅红        白色
████        ████        ████        ████        ████
最暗    ←   逐渐变亮   →   最亮
```

💡 **应用场景**：
- 做悬停变暗效果：降低亮度（如 `hsl(221, 83%, 40%)`）
- 做浅色背景：提高亮度（如 `hsl(221, 83%, 95%)`）
- 做深色模式：降低亮度到 20%-30%

---

**🎨 HSL 三个参数的联合作用**

```css
/* 基础蓝色 */
.base { color: hsl(240, 100%, 50%); }

/* 只改色相：变成绿色 */
.change-hue { color: hsl(120, 100%, 50%); }

/* 只改饱和度：变成淡蓝色 */
.change-saturation { color: hsl(240, 30%, 50%); }

/* 只改亮度：变成深蓝色 */
.change-lightness { color: hsl(240, 100%, 30%); }

/* 三个都改：柔和的浅绿色 */
.change-all { color: hsl(120, 50%, 70%); }
```

---

**💡 HSL 的实际应用场景**

**场景1：做主题色系统**

从一个主色生成一系列变体：

```css
:root {
  --primary-hue: 221;  /* 蓝色 */
  --primary-sat: 83%;
  
  /* 主色 */
  --primary: hsl(var(--primary-hue), var(--primary-sat), 53%);
  
  /* 深色版本（降低亮度） */
  --primary-dark: hsl(var(--primary-hue), var(--primary-sat), 40%);
  
  /* 浅色版本（提高亮度） */
  --primary-light: hsl(var(--primary-hue), var(--primary-sat), 70%);
  
  /* 淡色背景（降低饱和度，提高亮度） */
  --primary-bg: hsl(var(--primary-hue), 30%, 95%);
}

.btn-primary {
  background: var(--primary);
}

.btn-primary:hover {
  background: var(--primary-dark);  /* 悬停变深 */
}

.alert-info {
  background: var(--primary-bg);    /* 淡蓝色背景 */
  color: var(--primary-dark);       /* 深蓝色文字 */
}
```

**场景2：做悬停效果**

```css
.button {
  background: hsl(221, 83%, 53%);
  transition: background 0.3s;
}

.button:hover {
  /* 只改亮度，颜色保持一致 */
  background: hsl(221, 83%, 45%);  /* 变暗 8% */
}

.button:active {
  background: hsl(221, 83%, 40%);  /* 按下时更暗 */
}
```

**场景3：做渐变色**

```css
.gradient {
  /* 色相从 0° 到 360°，形成彩虹渐变 */
  background: linear-gradient(
    to right,
    hsl(0, 100%, 50%),    /* 红 */
    hsl(60, 100%, 50%),   /* 黄 */
    hsl(120, 100%, 50%),  /* 绿 */
    hsl(180, 100%, 50%),  /* 青 */
    hsl(240, 100%, 50%),  /* 蓝 */
    hsl(300, 100%, 50%)   /* 紫 */
  );
}
```

**场景4：做灰度图**

```css
.grayscale {
  /* 饱和度为 0，只保留明暗 */
  filter: grayscale(100%);
  
  /* 或者直接用 HSL */
  color: hsl(0, 0%, 50%);  /* 中灰色，色相无关紧要 */
}
```

---

**🆚 HSL vs RGB 对比**

| 需求 | RGB | HSL |
|------|-----|-----|
| 让颜色变亮 | `rgb(37, 99, 235)` → `rgb(?, ?, ?)` 😵 | `hsl(221, 83%, 53%)` → `hsl(221, 83%, 70%)` ✅ |
| 让颜色变淡 | `rgb(37, 99, 235)` → `rgb(?, ?, ?)` 😵 | `hsl(221, 83%, 53%)` → `hsl(221, 30%, 53%)` ✅ |
| 换个颜色但保持亮度 | `rgb(37, 99, 235)` → `rgb(?, ?, ?)` 😵 | `hsl(221, 83%, 53%)` → `hsl(120, 83%, 53%)` ✅ |
| 做主题色系统 | 需要手动计算每个值 😵 | 只改 H/S/L 其中一个 ✅ |

**结论**：
- **RGB**：适合精确指定颜色（设计稿给的颜色值）
- **HSL**：适合颜色调整和主题系统（程序化生成颜色）

---

**⚠️ HSL 的常见误区**

**误区1：以为 L=50% 就是"中等亮度"**

❌ 错误理解：L=50% 是灰色
✅ 正确理解：L=50% 是**正常颜色**，最能体现色相

```css
/* L=50% 不是灰色，是正常的鲜艳颜色 */
color: hsl(0, 100%, 50%);    /* 鲜红色，不是灰色！ */
color: hsl(0, 0%, 50%);      /* 这才是灰色（饱和度为0） */
```

**误区2：以为改色相就能得到"相近的颜色"**

❌ 错误：`hsl(220, 83%, 53%)` 和 `hsl(230, 83%, 53%)` 差别不大
✅ 正确：色相差 10° 可能颜色差别很明显（取决于色相区域）

**误区3：忽略饱和度的影响**

❌ 错误：只调亮度，忽略饱和度
✅ 正确：做浅色背景时，要**同时降低饱和度和提高亮度**

```css
/* ❌ 只提高亮度，颜色太鲜艳 */
background: hsl(221, 83%, 95%);  /* 太刺眼 */

/* ✅ 同时降低饱和度，更柔和 */
background: hsl(221, 30%, 95%);  /* 舒适的浅蓝色背景 */
```

**5. HSLA（HSL + Alpha）**

```css
color: hsla(221, 83%, 53%, 0.5);  /* 半透明蓝色 */
```

**6. 颜色关键词**（了解即可）

CSS 预定义了一些颜色名称：

```css
color: red;          /* 红色 */
color: blue;         /* 蓝色 */
color: transparent;  /* 透明（常用） */
color: currentColor; /* 继承当前文字颜色（常用） */
```

---

**💡 新手选择建议**：

从新人上手难度 & 调色方便程度来说：

- **记固定颜色：用十六进制**（如 `#2563eb`）
  - 优点：简洁、直观、设计师常用
  - 缺点：不好调整透明度
  
- **做透明效果：用 `rgba()` 或 `hsla()`**
  - 优点：可以精确控制透明度
  - 场景：半透明背景、阴影、遮罩层
  
- **需要细调色相、明暗：用 `hsl()`**（非常适合做设计系统）
  - 优点：调整颜色更直观（改 L 值就能变亮/变暗）
  - 场景：主题色系统、悬停变色

示例：

```css
.primary-text {
  color: #2563eb;                    /* 直接写十六进制 */
}

.primary-bg {
  background-color: hsl(221, 83%, 53%);  /* 同样的颜色，用 HSL 表达 */
}

.primary-bg-soft {
  background-color: hsla(221, 83%, 53%, 0.1); /* 同色系但更浅，有透明度 */
}
```

#### 5.1.2 HSL 为什么更适合做主题色？

HSL 三个维度：

- H（Hue）：色相，0–360 度，对应色环（0=红，120=绿，240=蓝）
- S（Saturation）：饱和度，0%–100%，越高越「艳」
- L（Lightness）：亮度，0% 黑，100% 白，中间为不同明暗程度

它的好处是「一眼能看懂」：

- 要同一颜色更亮/更暗？调 L
- 要更灰、更柔和？调 S

例子：

```css
.btn-primary { background-color: hsl(221, 83%, 53%); }
.btn-primary-hover { background-color: hsl(221, 83%, 60%); }  /* 更亮一点 */
.btn-primary-disabled { background-color: hsl(221, 20%, 80%); } /* 变灰软一点 */
```

#### 5.1.3 透明度：整体透明 vs 颜色透明

两种常见写法：

- `opacity: 0.5;` 让整个元素（包含文字、图标）都半透明
- `rgba()` / `hsla()` 只让「背景颜色」有透明度，内容保持不变

区别示意：

```css
.card-opacity {
  background-color: #ffffff;
  opacity: 0.6;             /* 整个卡片都变淡，包括文字 */
}

.card-bg-alpha {
  background-color: rgba(255, 255, 255, 0.6);  /* 只有背景有透明度 */
}
```

> 一般设计系统中，更推荐用 `rgba()`/`hsla()` 做透明背景，而不是直接调元素 `opacity`。

#### 5.1.4 渐变基础：linear-gradient

渐变本质上也是一种「背景图」，只是由浏览器算出来而已：

```css
.hero {
  background-image: linear-gradient(135deg, #60a5fa, #34d399);
}
```

语法解读：

- `135deg`：渐变角度（从左上到右下）
- 后面是若干个颜色节点：可以写 2 个，也可以写更多

常见用法：

- 按钮渐变背景
- 页面顶部横幅（banner）背景

```css
.btn-gradient {
  background-image: linear-gradient(90deg, #2563eb, #22c55e);
  color: #fff;
}
```

> 渐变细节（重复渐变、径向渐变等）在视觉进阶篇可以进一步扩展，这里先掌握「会用」。


### 5.2 px、%、em、rem、vw、vh

CSS 单位非常多，但在实际开发中常用的主要就这几个。

💡 **为什么需要这么多单位？**

因为不同场景有不同需求：
- 有时候需要固定大小（如边框 1px）
- 有时候需要相对父元素（如两列布局各占 50%）
- 有时候需要随字体大小变化（如按钮内边距）
- 有时候需要随屏幕大小变化（如全屏背景）

**单位对比速查表**：

| 单位 | 类型 | 相对于 | 常用场景 | 响应式 |
|------|------|--------|----------|--------|
| `px` | 绝对 | 固定像素 | 边框、阴影、小图标 | ❌ |
| `%` | 相对 | 父元素尺寸 | 布局宽度、两列分栏 | ✅ |
| `em` | 相对 | 当前元素字号 | 按钮内边距、首行缩进 | ✅ |
| `rem` | 相对 | 根元素字号 | 全局字号、组件尺寸 | ✅ |
| `vw` | 相对 | 视口宽度 | 全屏宽度、响应式字号 | ✅ |
| `vh` | 相对 | 视口高度 | 全屏高度、Hero 区域 | ✅ |

---

#### 5.2.1 px：像素单位（绝对单位）

**特点**：
- 绝对直观：`width: 200px;` 就是 200 像素宽
- 不会随其他因素变化
- 页面初学阶段，可以放心使用

**优点**：
- 精确控制，所见即所得
- 不会出现"意外变化"

**缺点**：
- 在不同屏幕/缩放下不够「相对」，不利于响应式
- 用户放大页面时，px 不会跟着放大（可访问性问题）

**示例**：

```css
.avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
}

.border-thin {
  border: 1px solid #e5e7eb;  /* 边框通常用 px */
}

.icon {
  width: 24px;   /* 图标固定大小 */
  height: 24px;
}
```

**适用场景**：
- ✅ 边框宽度（`border: 1px solid`）
- ✅ 阴影偏移（`box-shadow: 2px 2px 4px`）
- ✅ 小图标尺寸（`width: 24px`）
- ✅ 不需要随屏幕放大缩小的细节
- ❌ 大面积布局（不够灵活）
- ❌ 字体大小（不利于可访问性）

#### 5.2.2 百分比 %：相对于父元素（相对单位）

**特点**：
- 相对于**父元素**的对应属性
- 宽度：相对于父元素的宽度
- 高度：相对于父元素的高度（但父元素必须有明确高度）

**示例**：

```html
<div class="container">
  <div class="column-half">左侧 50%</div>
  <div class="column-half">右侧 50%</div>
</div>
```

```css
.container {
  width: 800px;  /* 父元素宽度 */
}

.column-half {
  width: 50%;    /* 50% × 800px = 400px */
  float: left;
}
```

**⚠️ 高度百分比的坑**：

```css
.parent {
  /* 没有设置高度 */
}

.child {
  height: 50%;  /* ❌ 不生效！因为父元素高度未定义 */
}
```

要让高度百分比生效，父元素必须有明确高度：

```css
.parent {
  height: 400px;  /* 或 height: 100vh; */
}

.child {
  height: 50%;  /* ✅ 生效，200px */
}
```

**适用场景**：
- ✅ 两列/三列布局（`width: 33.33%`）
- ✅ 图片自适应宽度（`width: 100%`）
- ✅ 相对父容器的尺寸
- ❌ 高度（除非父元素有明确高度）

---

#### 5.2.3 em：相对于当前元素的字体大小（相对单位）

**特点**：
- 1em = 当前元素的 `font-size`
- 会继承和累积（嵌套时要小心）

**💡 为什么叫 em？**

em 来自印刷术语，原本指字母 "M" 的宽度。在 CSS 中，1em 就是当前字号的大小。

**示例**：

```css
.paragraph {
  font-size: 16px;
  text-indent: 2em;   /* 2 × 16px = 32px（首行缩进 2 个字宽）*/
  margin-bottom: 1em; /* 1 × 16px = 16px */
}

.badge {
  font-size: 14px;
  padding: 0.25em 0.75em; /* 上下 3.5px，左右 10.5px */
  border-radius: 0.5em;   /* 7px */
}
```

**⚠️ 嵌套累积问题**：

```css
.parent {
  font-size: 16px;
}

.child {
  font-size: 1.5em;  /* 1.5 × 16px = 24px */
}

.grandchild {
  font-size: 1.5em;  /* 1.5 × 24px = 36px（累积了！） */
}
```

**适用场景**：
- ✅ 首行缩进（`text-indent: 2em`）
- ✅ 按钮内边距（随字号自动调整）
- ✅ 与文字大小相关的间距
- ❌ 复杂嵌套布局（容易累积出错）

---

#### 5.2.4 rem：相对于根元素 html 的字体大小（相对单位）

**特点**：
- 1rem = `html` 元素的 `font-size`
- **不会累积**（永远相对于根元素）
- 现代响应式布局的首选单位

**💡 rem vs em 的关键区别**：

```css
html { font-size: 16px; }

.parent {
  font-size: 20px;
}

.child-em {
  font-size: 2em;   /* 2 × 20px = 40px（相对父元素） */
}

.child-rem {
  font-size: 2rem;  /* 2 × 16px = 32px（相对根元素，不受父元素影响） */
}
```

**示例**：

```css
html { 
  font-size: 16px;  /* 设置基准字号 */
}

/* 字体大小 */
h1 { font-size: 2rem; }      /* 32px */
h2 { font-size: 1.5rem; }    /* 24px */
p  { font-size: 1rem; }      /* 16px */
small { font-size: 0.875rem; } /* 14px */

/* 间距 */
.section {
  padding: 4rem 2rem;  /* 64px 32px */
  margin-bottom: 2rem; /* 32px */
}

/* 布局 */
.container {
  max-width: 72rem;    /* 1152px */
}
```

**响应式应用**：

只需改变根字号，整个页面等比缩放：

```css
/* 桌面端 */
html { font-size: 16px; }

/* 平板 */
@media (max-width: 768px) {
  html { font-size: 14px; }  /* 所有 rem 单位自动缩小 */
}

/* 手机 */
@media (max-width: 480px) {
  html { font-size: 12px; }
}
```

**适用场景**：
- ✅ 全局字体大小
- ✅ 组件尺寸和间距
- ✅ 布局宽度（`max-width: 72rem`）
- ✅ 响应式设计
- ✅ 任何需要整体缩放的场景

#### 5.2.5 vw / vh：相对于视口（窗口）（相对单位）

**特点**：
- `1vw` = 视口宽度的 1%（Viewport Width）
- `1vh` = 视口高度的 1%（Viewport Height）
- 视口 = 浏览器窗口的可视区域

**💡 什么是视口？**

视口就是浏览器窗口中实际显示网页内容的区域（不包括地址栏、工具栏等）。
- 在桌面浏览器：视口 = 浏览器窗口大小
- 在手机浏览器：视口 = 屏幕大小

**计算示例**：

假设浏览器窗口宽度 1200px，高度 800px：
- `1vw` = 1200px × 1% = 12px
- `10vw` = 1200px × 10% = 120px
- `100vw` = 1200px × 100% = 1200px（整个屏幕宽度）
- `1vh` = 800px × 1% = 8px
- `100vh` = 800px × 100% = 800px（整个屏幕高度）

**示例**：

```css
/* 全屏背景区域 */
.hero {
  min-height: 100vh;  /* 至少占满一屏高度 */
  background: url('hero.jpg') center/cover;
}

/* 全宽容器 */
.full-width {
  width: 100vw;       /* 占满整个屏幕宽度 */
  margin-left: calc(-50vw + 50%);  /* 突破父容器限制 */
}

/* 响应式字号 */
.hero-title {
  font-size: 5vw;     /* 随屏幕宽度变化 */
}

/* 固定比例的盒子 */
.square {
  width: 50vw;
  height: 50vw;       /* 正方形，边长是屏幕宽度的一半 */
}
```

**⚠️ 移动端的坑：100vh 问题**

在移动端浏览器中，`100vh` 可能会包含地址栏的高度，导致内容被遮挡：

```css
/* ❌ 可能在移动端有问题 */
.section {
  height: 100vh;  /* 可能被地址栏遮挡 */
}

/* ✅ 更安全的做法 */
.section {
  min-height: 100vh;  /* 使用 min-height */
  /* 或者 */
  height: 100dvh;     /* 动态视口高度（新特性，兼容性待提升） */
}
```

**配合 clamp() 使用**：

`clamp(min, preferred, max)` 可以让值在一个范围内自适应变化：

```css
.hero-title {
  /* 最小 24px，最大 40px，中间随屏幕宽度的 4% 变化 */
  font-size: clamp(24px, 4vw, 40px);
}

.container {
  /* 最小 320px，最大 1200px，中间占屏幕 90% */
  width: clamp(320px, 90vw, 1200px);
}
```

**适用场景**：
- ✅ 全屏 Hero 区域（`height: 100vh`）
- ✅ 响应式字号（`font-size: 4vw`）
- ✅ 全宽布局（`width: 100vw`）
- ✅ 固定宽高比的元素
- ⚠️ 移动端高度要小心（地址栏问题）

---

**💡 单位选择总结**：

```txt
场景                          推荐单位
─────────────────────────────────────────
固定细节（边框、阴影）        px
两列布局、相对父元素           %
首行缩进、按钮内边距           em
全局字号、组件尺寸             rem
全屏高度、响应式字号           vh / vw
```

#### 5.2.6 新人建议的单位选择策略

- 字体大小：用 `rem` 为主，部分局部可用 `em`
- 宽度/布局：用 `px` + `%` + `rem` 结合
- 全屏区域：用 `vh`/`vw` 为辅
- 细边距/阴影：`px` 最直观

先用你最舒服、看得懂的单位（比如 px），等熟练后再逐步引入 `rem` 和 `vw` 等做更精细的适配。

#### 5.2.7 “我现在该用什么单位？”速查图

可以稍微用一个决策小图来帮助你快速判断：

```txt
我要设置的是：
1. 文本相关尺寸（字号、行高附近的间距）？
   |
   ├─ 希望整站一改基准就整体放大/缩小 → 优先 rem
   │     例：body 字号、组件 padding、布局间距
   └─ 只影响这个组件内部，相对它自己的字号就好 → 可用 em
         例：badge 的 padding、首行缩进 text-indent: 2em

2. 盒子的宽度 / 布局？
   |
   ├─ 需要跟随父容器比例变化 → %
   │     例：两栏布局 .column { width: 50%; }
   ├─ 需要有一个“最大宽度”，在大屏上不无限变宽 → px + max-width
   │     例：文章容器 max-width: 680px;
   └─ 希望整体跟随根字号缩放 → rem
       例：全局导航条高度 nav { height: 4rem; }

3. 希望随视口大小变化（比如全屏段落、高度）？
   |
   ├─ 整块区域要至少铺满一屏 → 100vh / 100vw
   └─ 标题等“有上限和下限”的大小 → clamp() + vw
       例：font-size: clamp(24px, 4vw, 40px);

4. 边线、细小阴影、1px 线条？
   → 用 px 最直接，避免在不同环境下变得过粗/过细。
```

可以把这个思路简化成几句话：

- **布局整体比例**：rem / % / clamp + vw
- **和文字绑得很紧的东西**（例如首行缩进、按钮内边距）：em / rem
- **特别细节**（边框、线条、阴影）：px
- **需要“至少一屏大”的区域**：vh / vw


### 5.3 背景图像全攻略（cover、contain、repeat）

背景图的本质：**一块贴在盒子背后的图片**，受 `background-*` 一系列属性控制。

💡 **背景图 vs `<img>` 标签的区别**：
- `<img>`：是 HTML 内容的一部分，占据文档流位置
- `background-image`：是 CSS 装饰，不占据文档流，贴在元素背后

---

#### 5.3.1 基础属性详解

**1. background-image（背景图片）**

指定背景图片的 URL：

```css
.hero {
  background-image: url("/images/hero.jpg");
  /* 也可以用相对路径 */
  background-image: url("../images/hero.jpg");
  /* 也可以用网络图片 */
  background-image: url("https://example.com/hero.jpg");
}
```

💡 **多重背景**：可以叠加多张背景图

```css
.multi-bg {
  background-image: 
    url("pattern.png"),      /* 前景图案 */
    url("texture.jpg");      /* 背景纹理 */
  /* 第一张在最上层，最后一张在最下层 */
}
```

**2. background-repeat（重复方式）**

控制背景图是否平铺：

```css
/* 默认值：两个方向都平铺 */
background-repeat: repeat;

/* 不平铺（最常用） */
background-repeat: no-repeat;

/* 只横向平铺 */
background-repeat: repeat-x;

/* 只纵向平铺 */
background-repeat: repeat-y;

/* 平铺但不裁切（会调整图片大小以完整显示） */
background-repeat: space;   /* 图片之间留空白 */
background-repeat: round;   /* 拉伸图片填满空间 */
```

**3. background-position（位置）**

控制背景图在容器中的位置：语法上可以接收 1~2 个值（分别对应水平方向和垂直方向的位置）。如果只指定一个值，另一个方向默认是 center。

```css
/* 关键词（最常用） */
background-position: center;           /* 居中 */
background-position: top;              /* 顶部居中 */
background-position: bottom;           /* 底部居中 */
background-position: left;             /* 左侧居中 */
background-position: right;            /* 右侧居中 */

/* 组合关键词 */
background-position: center center;    /* 水平垂直居中（默认） */
background-position: top left;         /* 左上角 */
background-position: bottom right;     /* 右下角 */
background-position: center top;       /* 顶部水平居中 */

/* 百分比（精确控制） */
background-position: 50% 50%;          /* 居中 */
background-position: 0% 0%;            /* 左上角 */
background-position: 100% 100%;        /* 右下角 */
background-position: 20% 30%;          /* 自定义位置 */

/* 像素值 */
background-position: 10px 20px;        /* 距离左边10px，顶部20px */
```

💡 **百分比的工作原理**：

```txt
background-position: 50% 50%;

不是简单的"图片左上角放在容器的50% 50%位置"
而是：图片的50% 50%点 对齐 容器的50% 50%点

示意图：
容器的中心点 ← 对齐 → 图片的中心点
```

**4. background-size（尺寸，重点！）**

控制背景图的缩放方式：

```css
/* 关键词 */
background-size: cover;      /* 铺满容器（可能裁切） */
background-size: contain;    /* 完整显示（可能留白） */
background-size: auto;       /* 原始大小（默认） */

/* 具体尺寸 */
background-size: 200px 100px;  /* 宽200px，高100px */
background-size: 50% 50%;      /* 宽高都是容器的50% */
background-size: 100% auto;    /* 宽度100%，高度自动 */
```

---

**完整示例**：

```css
.hero {
  /* 背景图片 */
  background-image: url("/images/hero.jpg");
  
  /* 不平铺 */
  background-repeat: no-repeat;
  
  /* 居中 */
  background-position: center;
  
  /* 铺满容器 */
  background-size: cover;
  
  /* 简写方式（推荐） */
  /* background: url("/images/hero.jpg") center/cover no-repeat; */
}
```

#### 5.3.2 cover 与 contain 的深度对比

这两个值是背景图最常用的缩放方式，理解它们的区别非常重要。

**`background-size: cover`（铺满容器）**

- **特点**：图片会被**等比放大**，直到**完全覆盖**容器
- **结果**：容器没有留白，但图片可能被裁切
- **适用场景**：横幅、Hero 区域、大面积背景

```css
.hero-cover {
  width: 800px;
  height: 400px;
  background: url("landscape.jpg") center/cover no-repeat;
}
```

**`background-size: contain`（完整显示）**

- **特点**：图片会被**等比缩放**，直到**完整显示**在容器内
- **结果**：图片不会被裁切，但容器可能有留白
- **适用场景**：Logo、产品图、不能裁切的图片

```css
.logo-contain {
  width: 200px;
  height: 200px;
  background: url("logo.png") center/contain no-repeat;
}
```

---

**📊 可视化对比**

假设有一张 **1200×600** 的横向图片，容器是 **400×400** 的正方形：

**cover 的效果**：

```txt
原图：1200×600（横向长方形）
容器：400×400（正方形）

cover 会放大图片，让它完全覆盖容器：
┌─────────────────────┐
│ ╔═══════════════╗   │  ← 图片被放大到 800×400
│ ║   可见部分    ║   │  ← 左右两侧被裁切了
│ ╚═══════════════╝   │
└─────────────────────┘
容器 400×400             图片实际 800×400（左右各裁200px）

结果：容器被填满，图片左右被裁切
```

**contain 的效果**：

```txt
原图：1200×600（横向长方形）
容器：400×400（正方形）

contain 会缩小图片，让它完整显示：
┌─────────────────────┐
│                     │  ← 上方留白
│ ┌─────────────────┐ │  ← 图片缩小到 400×200
│ │   完整图片      │ │  ← 完整显示
│ └─────────────────┘ │
│                     │  ← 下方留白
└─────────────────────┘
容器 400×400             图片实际 400×200

结果：图片完整显示，容器上下有留白
```

---

**💡 记忆口诀**：

- **cover**：容器优先好看，图片可以被裁一点（像被子盖住床，被子可能垂下来）
- **contain**：图片必须完整，容器可以有空白（像相框装画，画必须完整，相框可以大一点）

---

**🎯 实际应用场景对比**

| 场景 | 推荐 | 原因 |
|------|------|------|
| 网站 Hero 横幅 | `cover` | 需要填满整个区域，裁切无所谓 |
| 产品展示图 | `contain` | 产品必须完整显示 |
| 文章配图 | `cover` | 美观优先 |
| Logo 背景 | `contain` | Logo 不能被裁切 |
| 全屏背景 | `cover` | 铺满屏幕 |
| 图标背景 | `contain` | 图标要完整 |
| 卡片缩略图 | `cover` | 统一尺寸，美观 |
| 证书/文档预览 | `contain` | 必须看到全部内容 |

---

**⚠️ 常见问题**

**问题1：cover 裁切了重要内容怎么办？**

用 `background-position` 调整焦点位置：

```css
.hero {
  background: url("person.jpg") center/cover no-repeat;
  /* 如果人物在图片右侧，调整位置 */
  background-position: 70% center;  /* 让右侧更多显示 */
}
```

**问题2：contain 留白太多，不好看怎么办？**

方案1：给容器加背景色

```css
.logo-box {
  background-color: #f3f4f6;  /* 浅灰色背景 */
  background-image: url("logo.png");
  background-size: contain;
  background-position: center;
  background-repeat: no-repeat;
}
```

方案2：用渐变填充留白

```css
.product-card {
  background: 
    linear-gradient(to bottom, #ffffff, #f3f4f6),  /* 渐变背景 */
    url("product.png") center/contain no-repeat;
}
```

**问题3：图片比例和容器比例差太多**

```css
/* 如果图片是 16:9，容器是 1:1 */
.video-thumbnail {
  width: 400px;
  height: 400px;
  background: url("video.jpg") center/cover no-repeat;
  /* cover 会裁切上下，只显示中间部分 */
}

/* 解决方案：调整容器比例 */
.video-thumbnail {
  width: 400px;
  height: 225px;  /* 16:9 比例 */
  background: url("video.jpg") center/cover no-repeat;
  /* 现在不会裁切了 */
}
```

---

**🔍 调试技巧**

用 DevTools 查看背景图：

1. 打开开发者工具（F12）
2. 选中元素
3. 在 Styles 面板中，`background` 属性旁边有个小图标
4. 点击可以预览背景图和调整位置

**临时切换 cover/contain 对比效果**：

```css
/* 在 DevTools 中快速切换 */
.hero {
  background-size: cover;
  /* background-size: contain; */  /* 注释掉一个，看效果 */
}
```

#### 5.3.3 background-position 常用写法

- 关键词：`left`、`center`、`right`、`top`、`bottom`
- 组合：`center center`（默认）、`center top`、`right bottom`
- 百分比：`50% 20%` 等，适合精细控制「焦点在画面中的位置」。

例子：把主视觉人物尽量放在可见区域：

```css
.hero {
  background-image: url("hero-person.jpg");
  background-size: cover;
  background-position: 20% center;  /* 稍微向左对齐，让右侧留空间放文案 */
}
```

#### 5.3.4 repeat 与 精致平铺

- `background-repeat: repeat;` 默认，会在两个方向平铺
- 只横向：`repeat-x`
- 只纵向：`repeat-y`
- 不平铺：`no-repeat`

适合平铺的图：小图案、纹理、噪点背景等。

```css
.pattern-bg {
  background-image: url("/images/pattern.svg");
  background-repeat: repeat;
  background-size: 24px 24px;  /* 调整图案密度 */
}
```

#### 5.3.5 背景图 vs img 标签

什么时候用 `background-image`，什么时候用 `<img>`？

- 语义上是「内容」的一部分（产品图、文章插图）：用 `<img>`
- 只是「装饰」：用 `background-image`

> 对 SEO 和可访问性来说，重要图片应该用 `<img>` 并配 `alt` 文本。


### 5.4 现代图像处理（滤镜、混合模式）

这一节简单打开一个门，让你知道 CSS 也可以做一些「简单修图」的事情。

💡 **为什么要用 CSS 滤镜？**

- 不需要 Photoshop 就能调整图片效果
- 可以动态改变（如悬停时变灰）
- 减少图片资源（一张图多种效果）

---

#### 5.4.1 filter 滤镜详解

`filter` 属性可以对元素应用图形效果，类似 Photoshop 的滤镜。

**常见滤镜函数**：

**1. blur()（模糊）**

```css
.blur-light {
  filter: blur(2px);   /* 轻微模糊 */
}

.blur-heavy {
  filter: blur(10px);  /* 重度模糊 */
}
```

💡 **应用场景**：
- 背景模糊（毛玻璃效果）
- 图片加载前的占位符
- 失焦效果

**实际示例：毛玻璃卡片**

```css
.glass-card {
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);  /* 背景模糊 */
  border: 1px solid rgba(255, 255, 255, 0.3);
}
```

---

**2. brightness()（亮度）**

```css
.dim {
  filter: brightness(0.5);   /* 变暗 50% */
}

.bright {
  filter: brightness(1.5);   /* 变亮 50% */
}

.normal {
  filter: brightness(1);     /* 正常（默认） */
}
```

💡 **应用场景**：
- Hero 区域压暗背景，让文字更清晰
- 悬停时图片变亮
- 夜间模式调暗图片

**实际示例：悬停变亮**

```css
.product-img {
  filter: brightness(0.9);
  transition: filter 0.3s;
}

.product-img:hover {
  filter: brightness(1.1);  /* 悬停时变亮 */
}
```

---

**3. contrast()（对比度）**

```css
.low-contrast {
  filter: contrast(0.5);   /* 低对比度 */
}

.high-contrast {
  filter: contrast(1.5);   /* 高对比度 */
}
```

💡 **应用场景**：
- 增强图片视觉冲击力
- 配合亮度调整，改善文字可读性

---

**4. grayscale()（灰度）**

```css
.gray {
  filter: grayscale(100%);  /* 完全灰度 */
}

.semi-gray {
  filter: grayscale(50%);   /* 半灰度 */
}
```

💡 **应用场景**：
- 已售罄商品
- 不可用状态
- 悼念模式
- 悬停前的默认状态

**实际示例：悬停恢复彩色**

```css
.team-member {
  filter: grayscale(100%);
  transition: filter 0.3s;
}

.team-member:hover {
  filter: grayscale(0%);  /* 悬停时恢复彩色 */
}
```

---

**5. saturate()（饱和度）**

```css
.desaturate {
  filter: saturate(0%);    /* 完全去色（等同于 grayscale(100%)） */
}

.normal {
  filter: saturate(100%);  /* 正常饱和度 */
}

.vivid {
  filter: saturate(200%);  /* 鲜艳 2 倍 */
}
```

💡 **应用场景**：
- 让图片更鲜艳
- 做复古效果（降低饱和度）

---

**6. hue-rotate()（色相旋转）**

```css
.hue-shift {
  filter: hue-rotate(90deg);   /* 色相旋转 90° */
}

.hue-invert {
  filter: hue-rotate(180deg);  /* 色相旋转 180°（反色） */
}
```

💡 **应用场景**：
- 从一张图生成多种配色
- 主题切换（如蓝色主题 → 绿色主题）

---

**7. invert()（反色）**

```css
.invert {
  filter: invert(100%);  /* 完全反色 */
}

.dark-mode-img {
  filter: invert(90%);   /* 深色模式下反色图片 */
}
```

💡 **应用场景**：
- 深色模式（让浅色图片变深色）
- 特殊视觉效果

---

**8. opacity()（透明度）**

```css
.fade {
  filter: opacity(50%);  /* 半透明 */
}
```

⚠️ **注意**：`filter: opacity()` 和 `opacity` 属性效果相同，但 `filter` 可以和其他滤镜组合。

---

**9. drop-shadow()（投影）**

```css
.shadow {
  filter: drop-shadow(2px 2px 4px rgba(0, 0, 0, 0.3));
}
```

💡 **drop-shadow vs box-shadow**：
- `box-shadow`：给盒子加阴影（矩形）
- `drop-shadow`：跟随元素轮廓（包括透明部分）

**示例：PNG 图片阴影**

```css
/* box-shadow：给矩形盒子加阴影 */
.icon-box {
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

/* drop-shadow：跟随图片轮廓 */
.icon-shape {
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1));
}
```

---

**💡 组合使用多个滤镜**

```css
.photo-effect {
  filter: 
    brightness(1.1)      /* 提亮 */
    contrast(1.2)        /* 增强对比度 */
    saturate(1.3);       /* 增加饱和度 */
}

.vintage-effect {
  filter: 
    sepia(60%)           /* 复古色调 */
    brightness(0.9)      /* 略微变暗 */
    contrast(1.1);       /* 增强对比度 */
}
```

---

**🎯 实战应用场景**

**场景1：Hero 区域压暗背景**

```css
.hero {
  position: relative;
  min-height: 100vh;
  color: white;
}

.hero::before {
  content: "";
  position: absolute;
  inset: 0;
  background: url("hero.jpg") center/cover no-repeat;
  filter: brightness(0.6);   /* 压暗背景 */
  z-index: -1;
}
```

**场景2：图片加载前的模糊占位**

```css
.lazy-img {
  filter: blur(20px);
  transition: filter 0.3s;
}

.lazy-img.loaded {
  filter: blur(0);  /* 加载完成后清晰 */
}
```

**场景3：深色模式图片调整**

```css
@media (prefers-color-scheme: dark) {
  .content-img {
    filter: brightness(0.8) contrast(1.2);  /* 深色模式下调暗 */
  }
}
```

**场景4：禁用状态**

```css
.btn:disabled {
  filter: grayscale(100%) opacity(50%);
  cursor: not-allowed;
}
```

---

**⚠️ 性能注意事项**

- 滤镜会触发重绘，不要在大量元素上使用复杂滤镜
- 动画时优先用 `transform` 和 `opacity`，少用 `filter`
- 移动端慎用 `blur()`（性能消耗大）

#### 5.4.2 mix-blend-mode 混合模式

`mix-blend-mode` 可以让一个元素的颜色与底下元素发生「混色」，类似于 PS 里的图层混合模式。

常见模式：

- `multiply`：叠加，常用于加深
- `screen`：变亮
- `overlay`：对比增强

简单示例（做带混色效果的文字）：

```css
.title-mix {
  mix-blend-mode: overlay;
}
```

> 混合模式的视觉效果会受到背景颜色很大影响，更多用在视觉设计型页面，不是基础必备，但知道它存在即可。

---

> 第5章带你对「颜色、单位、图像」有了整体感觉。接下来第6章，我们会正式进入布局，从最基础的 `display` 开始，让元素不再「乱飘」。

## 第6章 布局基础：让页面从混乱到清晰

> 这一章解决的核心问题：
>
> - 为什么有的元素独占一行，有的元素跟文字排在一行？
> - `display: block/inline/inline-block` 有什么区别？
> - 不设置任何布局属性时，浏览器是怎么把东西排到页面上的？
> - `float` 和 `position` 这些经典属性，在现代布局里还扮演什么角色？

### 6.1 display 全解：block、inline、inline-block

`display` 决定了一个元素「在文档流中的表现形式」。这是 CSS 布局的基础中的基础。

💡 **为什么要理解 display？**

每个 HTML 元素都有一个默认的 display 值：
- `<div>`、`<p>`、`<h1>` 默认是 `block`（块级）
- `<span>`、`<a>`、`<strong>` 默认是 `inline`（行内）
- 理解它们的区别，才能知道为什么有的元素独占一行，有的元素挤在一起

**三种基础 display 对比表**：

| 特性 | `block` | `inline` | `inline-block` |
|------|---------|----------|----------------|
| 是否独占一行 | ✅ 是 | ❌ 否 | ❌ 否 |
| 能否设置宽高 | ✅ 能 | ❌ 不能 | ✅ 能 |
| 默认宽度 | 撑满父容器 | 由内容决定 | 由内容决定 |
| 上下 margin | ✅ 生效 | ❌ 不生效 | ✅ 生效 |
| 左右 margin | ✅ 生效 | ✅ 生效 | ✅ 生效 |
| 上下 padding | ✅ 生效 | ⚠️ 部分生效 | ✅ 生效 |
| 常见元素 | div, p, h1 | span, a, em | button, img |

---

#### 6.1.1 block 块级元素

**典型特征**：

1. **独占一行**（前后自动换行）
2. **默认宽度撑满父容器**（若未设置 width）
3. **可以设置宽高、内外边距**
4. **垂直排列**（一个接一个从上往下）

**常见块级元素**：
- 容器：`div`、`section`、`article`、`header`、`footer`、`nav`
- 文本：`p`、`h1`~`h6`、`blockquote`
- 列表：`ul`、`ol`、`li`

**示例**：

```html
<div class="box-a">盒子 A</div>
<div class="box-b">盒子 B</div>
<div class="box-c">盒子 C</div>
```

```css
.box-a, .box-b, .box-c {
  display: block;
  width: 200px;      /* 可以设置宽度 */
  height: 100px;     /* 可以设置高度 */
  margin: 16px 0;    /* 上下 margin 生效 */
  padding: 20px;     /* padding 生效 */
  background: #dbeafe;
}
```

**效果**：三个盒子会从上往下排列，每个独占一行。

**💡 块级元素的"霸道"特性**：

即使你设置了 `width: 200px`，块级元素仍然会独占一行，后面的内容会被"挤"到下一行。

---

#### 6.1.2 inline 行内元素

**典型特征**：

1. **不独占一行**，会在同一行内和文字一起排布
2. **宽高由内容决定**，不能直接设置 `width`、`height`
3. **上下 margin 不生效**（左右 margin 生效）
4. **上下 padding 部分生效**（会影响行高，但不会撑开上下空间）

**常见行内元素**：
- 文本：`span`、`a`、`strong`、`em`、`code`
- 表单：`input`、`label`、`select`

**示例**：

```html
<p>
  这是一段文字，
  <span class="highlight">这里是高亮</span>，
  <a href="#">这是链接</a>，
  继续文字。
</p>
```

```css
.highlight {
  display: inline;
  color: #ef4444;
  /* width: 200px;  ❌ 不生效！ */
  /* height: 100px; ❌ 不生效！ */
  padding: 4px 8px;  /* 左右 padding 生效，上下部分生效 */
  margin: 0 8px;     /* 左右 margin 生效，上下不生效 */
  background: #fee2e2;
}
```

**效果**：高亮文字和链接会和普通文字排在同一行，不会换行。

**⚠️ inline 元素的"温和"特性**：

- 它们像文字一样流动，不会强行换行
- 设置 width/height 无效（因为大小由内容决定）
- 上下 margin 不生效（但可以用 line-height 调整行间距）

---

#### 6.1.3 inline-block 行内块元素

**典型特征**：

可以理解为：**结合了 block 和 inline 的优点**

1. **像 inline 一样**，可以和文字排在同一行（不独占一行）
2. **像 block 一样**，可以设置宽高、内外边距
3. **元素之间会有间隙**（来自 HTML 中的空格/换行）

**常见场景**：
- 按钮、徽章、标签
- 水平排列的小卡片
- 导航菜单项

**示例**：

```html
<button class="btn">按钮 1</button>
<button class="btn">按钮 2</button>
<button class="btn">按钮 3</button>
```

```css
.btn {
  display: inline-block;
  width: 100px;      /* ✅ 可以设置宽度 */
  height: 40px;      /* ✅ 可以设置高度 */
  padding: 8px 16px; /* ✅ padding 完全生效 */
  margin: 0 8px;     /* ✅ margin 完全生效 */
  background: #2563eb;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
}
```

**效果**：三个按钮会排在同一行（如果宽度够），每个按钮可以设置宽高。

**⚠️ inline-block 的间隙问题**：

```html
<div class="tag">标签1</div>
<div class="tag">标签2</div>
<div class="tag">标签3</div>
```

由于 HTML 中的换行和空格，inline-block 元素之间会有 4-5px 的间隙。

**解决方法**：

```css
/* 方法1：给父元素设置 font-size: 0 */
.tag-container {
  font-size: 0;
}
.tag {
  font-size: 14px;  /* 恢复字号 */
}

/* 方法2：使用 Flexbox（推荐） */
.tag-container {
  display: flex;
  gap: 8px;  /* 用 gap 控制间距 */
}
```

---

**💡 三种 display 的选择建议**：

```txt
需求                              选择
────────────────────────────────────────────
独占一行的容器、段落              block
文字中的高亮、链接                inline
水平排列的按钮、标签              inline-block
（现代布局推荐用 Flexbox）
```

> 后面 Flexbox 和 Grid 出现后，我们做布局更多依赖它们，但理解这三种最基础的 display，能帮你看懂很多老项目的写法，也有助于理解浏览器的默认行为。

可以用一张行内/块级/行内块的「占行」示意图来记忆：

```txt
block（块级）：

┌────────────── 行 ──────────────┐
│ [   block 元素   ]             │  ← 独占一整行
└────────────────────────────────┘
┌────────────── 行 ──────────────┐
│ [   block 元素   ]             │
└────────────────────────────────┘

inline（行内）：

┌────────────── 行 ──────────────┐
│ 文本文本 [span] 文本 [a] 文本   │  ← 和文字一起排在一行
└────────────────────────────────┘

inline-block（行内块）：

┌────────────── 行 ──────────────┐
│ [btn][btn][btn] 文本           │  ← 像小块一样排在一行，可设宽高
└────────────────────────────────┘
```


### 6.2 流式布局与文档流

在不写任何复杂布局前，浏览器默认会采用一种「从上到下、从左到右」的 **普通文档流**（Normal Flow）来排布元素。

💡 **什么是文档流？**

文档流就是浏览器默认的元素排列方式，就像水流一样，元素按照 HTML 的顺序自然流动排列。

**文档流的核心规则**：
1. **块级元素**：从上到下垂直排列，每个独占一行
2. **行内元素**：从左到右水平排列，一行装不下就换行
3. **元素占据空间**：在文档流中的元素会占据空间，影响其他元素的位置

---

#### 6.2.1 块级元素的排列规则

**特点**：
- 从上到下依次排列
- 每个块级元素都独占一整行
- 宽度默认是父元素的可用宽度（100%）
- 高度由内容决定（或显式设置）

**示例**：

```html
<div class="box-a">盒子 A</div>
<div class="box-b">盒子 B</div>
<div class="box-c">盒子 C</div>
```

```css
.box-a { 
  background: #fee2e2; 
  height: 60px;
}
.box-b { 
  background: #dcfce7; 
  height: 80px;
}
.box-c { 
  background: #dbeafe; 
  height: 100px;
}
```

**可视化效果**：

```txt
┌─────────────────────────────┐
│ 盒子 A (60px 高)            │  ← 独占一行，宽度撑满
├─────────────────────────────┤
│ 盒子 B (80px 高)            │  ← 独占一行
├─────────────────────────────┤
│ 盒子 C (100px 高)           │  ← 独占一行
└─────────────────────────────┘
```

💡 **关键理解**：
- 即使你给 `.box-a` 设置了 `width: 200px`，它仍然独占一行
- 后面的 `.box-b` 不会跑到 `.box-a` 右侧，而是在下一行

**块级元素的宽度计算**：

```css
/* 默认情况：宽度 = 父元素的 100% */
.box {
  /* width: auto;  默认值 */
  /* 实际宽度 = 父元素宽度 - 自身 margin */
}

/* 显式设置宽度 */
.box {
  width: 500px;  /* 固定宽度 */
  /* 仍然独占一行，右侧留白 */
}

/* 居中对齐 */
.box {
  width: 500px;
  margin: 0 auto;  /* 左右 margin 自动，实现居中 */
}
```

---

#### 6.2.2 行内元素的排列规则

**特点**：
- 在一行内从左到右排列，直到装不下为止
- 换行后继续排（遵从文字的换行规则）
- 宽度由内容决定
- 多个行内元素会紧挨着排列

**示例**：

```html
<p>
  这是一段文字，
  <span class="highlight">这里是高亮</span>，
  <a href="#">这是链接</a>，
  <strong>加粗文字</strong>，
  继续文字。
</p>
```

```css
.highlight {
  background: #fef3c7;
  padding: 2px 4px;
}
```

**可视化效果**：

```txt
┌─────────────────────────────────────────┐
│ 这是一段文字，[这里是高亮]，[这是链接]， │  ← 所有行内元素在同一行
│ [加粗文字]，继续文字。                   │
└─────────────────────────────────────────┘
```

💡 **行内元素的换行规则**：

```html
<p>
  <span>第一个span</span>
  <span>第二个span</span>
  <span>第三个span</span>
  <!-- 如果一行装不下，会自动换行 -->
</p>
```

**当容器宽度不够时**：

```txt
容器宽度：300px

┌──────────────────────────────┐
│ 第一个span 第二个span 第三个  │  ← 前两个在第一行
│ span                         │  ← 第三个自动换到第二行
└──────────────────────────────┘
```

---

#### 6.2.3 块级和行内元素的混合排列

**示例**：

```html
<div class="container">
  <p>这是一个段落（块级）</p>
  <span>这是 span（行内）</span>
  <span>另一个 span（行内）</span>
  <div>这是一个 div（块级）</div>
</div>
```

**排列效果**：

```txt
┌─────────────────────────────┐
│ 这是一个段落（块级）        │  ← p 独占一行
├─────────────────────────────┤
│ 这是 span（行内）另一个 span│  ← 两个 span 在同一行
├─────────────────────────────┤
│ 这是一个 div（块级）        │  ← div 独占一行
└─────────────────────────────┘
```

💡 **关键理解**：
- 块级元素会"打断"行内元素的排列
- 块级元素前后会自动换行

---

#### 6.2.4 理解「文档流」对调试非常重要

**什么是"在文档流中"？**

在文档流中的元素：
- ✅ 占据空间，影响其他元素的位置
- ✅ 遵循从上到下、从左到右的排列规则
- ✅ 会被父元素的高度计算包含

**什么是"脱离文档流"？**

脱离文档流的元素：
- ❌ 不占据原本的空间
- ❌ 不影响其他元素的排列
- ❌ 不被父元素的高度计算包含

**哪些情况会脱离文档流？**

1. `position: absolute`
2. `position: fixed`
3. `float: left/right`（部分脱离）

---

**🔍 调试技巧：判断元素是否在文档流中**

**方法1：看后面的元素是否"顶上来"**

```css
/* 在文档流中 */
.box-a {
  position: static;  /* 默认值 */
}
/* 结果：box-b 在 box-a 下方 */

/* 脱离文档流 */
.box-a {
  position: absolute;
}
/* 结果：box-b "顶上来"，好像 box-a 不存在 */
```

**方法2：看父元素高度是否包含该元素**

```html
<div class="parent">
  <div class="child">子元素</div>
</div>
```

```css
/* 在文档流中 */
.child {
  height: 100px;
}
/* 结果：parent 的高度至少 100px */

/* 脱离文档流 */
.child {
  position: absolute;
  height: 100px;
}
/* 结果：parent 的高度可能是 0（如果没有其他内容） */
```

---

**💡 常见问题**

**问题1：为什么我的元素突然"飞"走了？**

```css
.element {
  position: absolute;  /* ← 脱离文档流了 */
  top: 0;
  left: 0;
}
```

**解决**：检查是否使用了 `absolute` 或 `fixed`

**问题2：为什么后面的内容"顶上来"了？**

```css
.element {
  float: left;  /* ← 部分脱离文档流 */
}
```

**解决**：清除浮动，或改用 Flexbox

**问题3：为什么父元素高度是 0？**

```html
<div class="parent">
  <div class="child" style="position: absolute;">内容</div>
</div>
```

**原因**：子元素脱离文档流，父元素认为内部没有内容

**解决**：
- 给父元素设置明确高度
- 或者不要让子元素脱离文档流

---

**📊 文档流 vs 脱离文档流对比**

| 特性 | 在文档流中 | 脱离文档流 |
|------|-----------|-----------|
| 占据空间 | ✅ 是 | ❌ 否 |
| 影响其他元素 | ✅ 是 | ❌ 否 |
| 被父元素包含 | ✅ 是 | ❌ 否 |
| 遵循排列规则 | ✅ 是 | ❌ 否 |
| 典型属性 | `static`, `relative` | `absolute`, `fixed`, `float` |

---

**💡 记忆口诀**

```txt
文档流像水流，
元素顺序自然流。
块级独占一整行，
行内挤在一行中。

脱离文档流，
元素就"飞"走。
不占空间不影响，
父元素高度算不上。
```

**核心理解**：
- 文档流是浏览器的默认排列方式
- 大部分情况下，让元素待在文档流中
- 只有特殊需求（如固定导航、浮层）才脱离文档流
- 脱离文档流要特别注意对布局的影响


### 6.3 float 与清除浮动（历史遗留但必须懂）

在 Flex 和 Grid 出现之前，`float` 一度是网页布局的主力，现在虽然不再推荐用它做复杂布局，但你会经常在旧项目/文章中看到它，因此仍然需要理解基础概念。

💡 **为什么要学 float？**
- 旧项目中大量使用
- 理解"脱离文档流"的概念
- 图文混排仍然有用

---

#### 6.3.1 float 是什么？

`float` 最初是为了实现**图文混排**而设计的，就像报纸杂志中图片周围环绕文字的效果。
浮动元素会脱离普通文档流（导致后续块级元素占据其原有位置），但未完全脱离文档流（仍会影响文本和内联元素的排列，形成环绕效果）。
**基本语法**：

```css
float: left;   /* 向左浮动 */
float: right;  /* 向右浮动 */
float: none;   /* 不浮动（默认） */
```

**经典应用：图文混排**

```html
<div class="article">
  <img src="avatar.jpg" class="avatar" alt="头像">
  <p>这是一大段文字，这是一大段文字，这是一大段文字，这是一大段文字，这是一大段文字，这是一大段文字……</p>
</div>
```

```css
.avatar {
  float: left;
  width: 100px;
  height: 100px;
  margin-right: 16px;
  margin-bottom: 8px;
}
```

**可视化效果**：

```txt
┌─────────────────────────────────┐
│ ┌────┐ 这是一大段文字，这是一大 │
│ │图片│ 段文字，这是一大段文字，这 │
│ │    │ 是一大段文字，这是一大段文 │
│ └────┘ 字，这是一大段文字……     │
│ 继续文字继续文字继续文字……     │
└─────────────────────────────────┘
```

💡 **float 的特点**：
- 图片向左浮动
- 文字环绕在图片右侧和下方
- 这是 float 的原始设计用途

---

#### 6.3.2 float 对布局的副作用

当一个元素设置 `float` 后，会发生以下变化：

**1. 部分脱离文档流**

```css
.box {
  float: left;
}
```

- ✅ 元素仍然占据一定空间（文字会环绕）
- ❌ 但不再占据原本的"行"（后面的块级元素会顶上来）
- ❌ 父元素不会自动根据它计算高度

**2. 变成块级盒子（但宽度行为类似 inline-block）**

```css
.box {
  float: left;
  /* 浮动元素的 computed display 会变成 block */
  /* 但宽度不会自动撑满父容器，而是由内容决定（类似 inline-block） */
}
```

**3. 父元素高度塌陷**

这是 float 最经典的问题：

```html
<div class="wrapper">
  <div class="left">左侧内容（高100px）</div>
  <div class="right">右侧内容（高100px）</div>
</div>
<div class="footer">页脚</div>
```

```css
.left { 
  float: left; 
  width: 50%; 
  height: 100px;
  background: #fee2e2;
}
.right { 
  float: right; 
  width: 50%; 
  height: 100px;
  background: #dcfce7;
}
.footer {
  background: #dbeafe;
}
```

**问题效果**：

```txt
期望的效果：
┌──────────┬──────────┐
│ 左侧内容 │ 右侧内容 │  ← wrapper 包裹住子元素
│ (100px)  │ (100px)  │
└──────────┴──────────┘
┌──────────────────────┐
│ 页脚                 │  ← footer 在下方
└──────────────────────┘

实际效果（高度塌陷）：
┌──────────┬──────────┐
│ 左侧内容 │ 右侧内容 │  ← 浮动元素
│ (100px)  │ (100px)  │
└──────────┴──────────┘
┌──────────────────────┐  ← wrapper 高度为 0！
│ 页脚                 │  ← footer 跑到浮动元素下面了
└──────────────────────┘
```

💡 **为什么会这样？**

因为浮动元素"部分脱离"了文档流：
- 父元素 `.wrapper` 认为内部没有正常流的内容
- 所以高度计算为 0
- 后面的 `.footer` 就"顶上来"了

---

#### 6.3.3 清除浮动 clearfix

**目标**：让父元素正确包裹住浮动子元素，恢复正常高度。
**原因**：当父元素的子元素设置了 float 后，父元素默认不会计算浮动子元素的高度，导致高度为 0（塌陷），这些方法的核心是让父元素 “感知” 到浮动子元素的存在，从而正常包裹它们。

**方法1：在浮动元素后面加空标签（不推荐）**

```html
<div class="wrapper">
  <div class="left">左</div>
  <div class="right">右</div>
  <div style="clear: both;"></div>  <!-- 清除浮动 -->
</div>
```

❌ **缺点**：增加了无意义的 HTML 标签

---

**方法2：clearfix 伪元素（经典方法）**

```css
.clearfix::after {
  content: "";
  display: block;
  clear: both;
}
```

```html
<div class="wrapper clearfix">
  <div class="left">左</div>
  <div class="right">右</div>
</div>
```

✅ **优点**：
- 不增加 HTML 标签
- 用 CSS 解决 CSS 的问题
- 这是最常见的 clearfix 写法

**工作原理**：

```txt
.clearfix::after 会在 wrapper 内部最后创建一个不可见的块级元素：

<div class="wrapper clearfix">
  <div class="left">左</div>
  <div class="right">右</div>
  <!-- ::after 伪元素在这里 -->
  <!-- 它有 clear: both，会清除上方的浮动 -->
  <!-- 所以 wrapper 的高度会包含它 -->
</div>
```

---

**方法3：给父元素触发 BFC（块格式化上下文）**

```css
.wrapper {
  overflow: hidden;  /* 触发 BFC */
}
```

✅ **优点**：代码简洁

⚠️ **注意**：`overflow: hidden` 会裁剪溢出内容

**其他触发 BFC 的方式**：

```css
/* 方式1：overflow */
.wrapper { overflow: auto; }     /* 推荐，若内容溢出会显示滚动条（通常不会触发，除非内容确实超出），无副作用 */
.wrapper { overflow: hidden; }   /* 会裁剪溢出 */

/* 方式2：display */
.wrapper { display: flow-root; } /* 现代浏览器推荐，专门用于创建 BFC 包含浮动元素，无副作用（Chrome 58+、Firefox 53+、Safari 13+，IE 不支持） */
.wrapper { display: flex; }      /* 改变布局方式 */

/* 方式3：float */
.wrapper { float: left; }        /* 不推荐，会影响布局 */

/* 方式4：position */
.wrapper { position: absolute; } /* 不推荐，脱离文档流 */
```

---

**方法4：现代方案 - 用 Flexbox（最推荐）**

```css
.wrapper {
  display: flex;
}

.left {
  /* 不需要 float 了 */
  width: 50%;
}

.right {
  width: 50%;
}
```

✅ **优点**：
- 不需要清除浮动
- 代码更简洁
- 功能更强大（对齐、间距等）

---

**📊 清除浮动方法对比**

| 方法 | 代码 | 优点 | 缺点 | 推荐度 |
|------|------|------|------|--------|
| 空标签 | `<div style="clear: both;">` | 简单 | 增加无意义标签 | ⭐ |
| clearfix | `::after + clear: both` | 不增加标签 | 需要记住写法 | ⭐⭐⭐⭐ |
| overflow | `overflow: hidden` | 代码简洁 | 可能裁剪内容 | ⭐⭐⭐ |
| display: flow-root | `display: flow-root` | 无副作用 | 兼容性稍差 | ⭐⭐⭐⭐ |
| Flexbox | `display: flex` | 现代布局 | 改变布局方式 | ⭐⭐⭐⭐⭐ |

---

**💡 clear 属性详解**

`clear` 属性用于指定元素的哪一侧不允许有浮动元素。

```css
clear: left;   /* 左侧不允许有浮动元素 */
clear: right;  /* 右侧不允许有浮动元素 */
clear: both;   /* 两侧都不允许有浮动元素（最常用） */
clear: none;   /* 允许浮动元素（默认） */
```

**示例**：

```html
<div class="box1" style="float: left;">盒子1</div>
<div class="box2" style="float: left;">盒子2</div>
<div class="box3" style="clear: left;">盒子3</div>
```

**效果**：

```txt
没有 clear：
┌──────┐┌──────┐┌──────┐
│ 盒子1││ 盒子2││ 盒子3│  ← 三个都在同一行
└──────┘└──────┘└──────┘

有 clear: left：
┌──────┐┌──────┐
│ 盒子1││ 盒子2│  ← 前两个在第一行
└──────┘└──────┘
┌──────┐
│ 盒子3│  ← 盒子3 清除左侧浮动，换到下一行
└──────┘
```

---

**⚠️ float 的常见问题**

**问题1：浮动元素重叠**

```css
.box1 { float: left; width: 60%; }
.box2 { float: left; width: 60%; }
/* 两个加起来 120%，超过 100%，会换行 */
```

**问题2：浮动元素覆盖文字**

```css
.sidebar { float: left; width: 200px; }
.content { /* 没有设置 margin-left，文字会被覆盖 */ }

/* 解决：给 content 加左边距 */
.content { margin-left: 220px; }
```

**问题3：父元素高度塌陷**

```css
/* 解决：用 clearfix 或 Flexbox */
```

---

**💡 现代布局建议**

```txt
✅ 推荐用 float 的场景：
- 图文混排（原始用途）
- 简单的左右浮动

❌ 不推荐用 float 的场景：
- 复杂的多列布局 → 用 Flexbox 或 Grid
- 垂直居中 → 用 Flexbox
- 等高列 → 用 Flexbox 或 Grid
```

**替代方案**：

```css
/* 旧方法：float 布局 */
.left { float: left; width: 50%; }
.right { float: right; width: 50%; }

/* 新方法：Flexbox */
.container {
  display: flex;
}
.left, .right {
  flex: 1;  /* 平分空间 */
}
```

> 在现代布局里，我们更推荐用 Flex 和 Grid 来完成多列布局，但理解 float 可以帮助你维护旧代码，也有助于理解「脱离文档流」和「清除」这些概念。


### 6.4 position：relative、absolute、fixed、sticky

`position` 决定了元素的定位方式和是否脱离文档流。常见取值有：

- `static`：默认值，不做特殊定位
- `relative`：相对定位
- `absolute`：绝对定位
- `fixed`：固定定位
- `sticky`：粘性定位

#### 6.4.1 relative：相对自身的偏移

特点：

- 元素 **仍然保留在文档流中**，占据原本位置
- 设置 `top/right/bottom/left` 会在原位置基础上微调显示位置
- 常与 `absolute` 一起用，作为后者的参照容器

```css
.badge {
  position: relative;
  top: -2px;   /* 轻微上移一点，让视觉更居中 */
}
```

#### 6.4.2 absolute：相对最近的定位祖先

特点：

- 元素 **脱离文档流**，不再占据原本位置
- 通过 `top/right/bottom/left` 定位
- 位置是相对于「最近的一个 `position` 不为 `static` 的祖先元素」

典型场景：在卡片右上角放一个角标。

```css
.card {
  position: relative;      /* 建立定位上下文 */
}

.card-badge {
  position: absolute;
  top: 8px;
  right: 8px;
}
```

#### 6.4.3 fixed：固定在视口上

特点：

- 相对 **浏览器视口** 定位
- 滚动页面时位置不变

典型用法：右下角回到顶部按钮、固定导航栏等。

```css
.back-to-top {
  position: fixed;
  right: 24px;
  bottom: 24px;
}
```

#### 6.4.4 sticky：粘性定位

`sticky` 是一种介于 `relative` 和 `fixed` 之间的模式：

- 元素一开始像 `relative` 一样正常排布
- 当滚动到某个阈值（如 `top: 0`）时，变成类似 `fixed`，吸附在指定位置

常用于：表头吸顶、小标题导航等。

```css
.table-header {
  position: sticky;
  top: 0;
  background: #fff;
}
```

可以用一个纵向滚动的小示意来帮你区分几种定位：

```txt
普通文档流 + relative：

页面顶部
┌─────────────┐
│  header     │  position: relative（看起来仍在正常位置，只是可微调）
└─────────────┘
│  内容...    │  正常随页面滚动

absolute：

┌───────────── 容器 card (relative) ─────────────┐
│ title                                   [★]   │
│ 内容...                                          │
└───────────────────────────────────────────────┘
               ↑
         .card-badge absolute，相对 card 角定位，
         不再占据文档流。

fixed：

页面右下角始终有：

┌─────┐
│ ↑   │  back-to-top（fixed），无论滚动多少都粘在视口右下角
└─────┘

sticky：

┌───────────── 页面 ─────────────┐
│ table-header （向上滚动前在文档流中） │
│ 行1                                     │
│ 行2                                     │
│ ...                                     │
└────────────────────────────────────────┘

当页面滚动到 header 顶到视口 top:0 时，变成类似 fixed，
继续滚动时它会“粘在”顶部，下面内容在它下面滑动。
```

#### 6.4.5 使用 position 的注意事项

- `absolute`/`fixed` 元素脱离文档流，要特别注意它们是否遮挡/被遮挡
- 多个定位元素重叠时，要结合 `z-index` 一起使用（后面进阶篇会讲「层叠上下文」）
- 不要滥用绝对定位来做整个页面布局，这样会非常难维护和响应式适配

---

> 本章带你从 `display`、文档流、float 到 `position`，建立起对「布局基础规则」的直觉。接下来的第三篇，我们会正式上手 Flexbox 和 Grid，让你用更现代、更优雅的方式排版页面。

---

## 学习总结与实践建议

### 🎯 本篇核心要点回顾

**第4章：盒模型**
- ✅ 盒子四层结构：content → padding → border → margin（从里到外）
- ✅ 背景色填充 content + padding 区域，不包括 margin
- ✅ `box-sizing: content-box`（默认）：width 只算内容，padding/border 额外增加
- ✅ `box-sizing: border-box`（推荐）：width 包含 content + padding + border
- ✅ margin 折叠：垂直方向的 margin 会"比大小"，取较大值
- ✅ margin 折叠只发生在垂直方向，不发生在水平方向
- ✅ 使用 DevTools 的盒模型面板调试

**第5章：视觉表现**
- ✅ 颜色格式：十六进制（简洁）、rgba（透明）、hsl（调色方便）
- ✅ 单位选择：
  - px：固定细节（边框、阴影）
  - %：相对父元素（布局宽度）
  - em：相对当前字号（会累积）
  - rem：相对根字号（不累积，推荐）
  - vw/vh：相对视口（全屏、响应式）
- ✅ 背景图：`cover`（铺满可能裁切）vs `contain`（完整可能留白）
- ✅ 渐变：`linear-gradient()`（线性）、`radial-gradient()`（径向）
- ✅ 滤镜：`filter`（模糊、亮度、灰度等）

**第6章：布局基础**
- ✅ `display: block`：独占一行，可设宽高
- ✅ `display: inline`：不独占一行，不可设宽高
- ✅ `display: inline-block`：不独占一行，可设宽高
- ✅ 文档流：浏览器默认从上到下、从左到右排列元素
- ✅ `float`：图文混排（现代布局少用）
- ✅ `position`：
  - `relative`：相对自身偏移，不脱离文档流
  - `absolute`：相对定位祖先，脱离文档流
  - `fixed`：相对视口，脱离文档流
  - `sticky`：粘性定位，滚动到阈值时固定

### 💡 给小白的学习建议

**1. 盒模型是重中之重**

- ✅ 打开 DevTools（F12），选中任意元素，看盒模型面板
- ✅ 修改 padding/margin/border，观察变化
- ✅ 切换 `box-sizing`，理解两种模式的区别
- ✅ 给元素加背景色，理解 padding 和 margin 的区别

**2. 单位选择的实践建议**

初学阶段：
- 先用 `px` 写，直观好理解
- 熟练后逐步引入 `rem`（字号、间距）
- 需要响应式时用 `%`、`vw`、`vh`

进阶阶段：
- 全局字号用 `rem`
- 布局用 `rem` + `%` 结合
- 细节用 `px`（边框、阴影）
- 全屏用 `vh`/`vw`

**3. 布局学习路径**

```txt
第一步：理解 display（block/inline/inline-block）
  ↓
第二步：理解文档流（元素默认怎么排列）
  ↓
第三步：理解 position（如何脱离文档流）
  ↓
第四步：学习 Flexbox（现代一维布局）
  ↓
第五步：学习 Grid（现代二维布局）
```

**4. 常见问题排查**

| 问题 | 可能原因 | 解决方法 |
|------|---------|---------|
| 元素宽度不对 | `box-sizing` 是 `content-box` | 改为 `border-box` |
| 元素间距不对 | margin 折叠 | 改用 padding 或 Flexbox gap |
| inline 元素设置宽高无效 | inline 不支持宽高 | 改为 `inline-block` 或 `block` |
| 高度百分比不生效 | 父元素没有明确高度 | 给父元素设置高度 |
| 元素"飞"走了 | 使用了 `absolute` 或 `fixed` | 检查 position 属性 |
| inline-block 有间隙 | HTML 空格导致 | 用 Flexbox 或 `font-size: 0` |

**5. 调试技巧**

```css
/* 临时给所有元素加边框，看清布局 */
* {
  outline: 1px solid rgba(255, 0, 0, 0.3);
}

/* 给容器加背景色，理解 padding 和 margin */
.container {
  background: #dbeafe;
  padding: 20px;
  margin: 20px;
}
```

### 🚀 实战练习项目

用本篇学到的知识，尝试做这些小项目：

**1. 卡片组件**（练习盒模型）
```txt
目标：做一个带圆角、阴影、内边距的卡片
涉及：padding、border-radius、box-shadow、box-sizing
```

**2. 按钮组**（练习 display 和单位）
```txt
目标：做一组水平排列的按钮，不同尺寸
涉及：inline-block、rem、padding、hover 效果
```

**3. Hero 区域**（练习背景和单位）
```txt
目标：做一个全屏背景图的 Hero 区域
涉及：background-size: cover、100vh、渐变蒙版
```

**4. 固定导航栏**（练习 position）
```txt
目标：做一个滚动时固定在顶部的导航栏
涉及：position: sticky、z-index
```

**5. 卡片列表**（练习综合布局）
```txt
目标：做一个三列卡片列表，响应式
涉及：width: 33.33%、box-sizing、margin
```

### 📚 常见误区

**误区1：到处用 px**
- ❌ 字号用 px（不利于可访问性）
- ✅ 字号用 rem，边框用 px

**误区2：不理解 box-sizing**
- ❌ 设置 `width: 100%` 后又加 padding，导致溢出
- ✅ 全局设置 `box-sizing: border-box`

**误区3：滥用 position: absolute**
- ❌ 用 absolute 做整个页面布局
- ✅ absolute 只用于特殊定位（角标、浮层等）

**误区4：不会用 DevTools**
- ❌ 样式不对就瞎改
- ✅ 用 DevTools 查看盒模型、计算值、覆盖关系

**误区5：忽略 margin 折叠**
- ❌ 以为两个 margin 会相加
- ✅ 记住垂直 margin 会折叠，取较大值

### 🎓 进阶方向

学完本篇后，你已经掌握了 CSS 的核心基础。接下来可以学习：

**第三篇：Flexbox 弹性布局**
- 一维布局的现代解决方案
- 轻松实现水平/垂直居中
- 等高列、自适应宽度

**第四篇：Grid 网格布局**
- 二维布局的强大工具
- 复杂页面布局
- 响应式网格系统

**第五篇：响应式设计**
- 媒体查询（@media）
- 移动端适配
- 断点设计策略

**第六篇：CSS 动画与过渡**
- transition（过渡）
- animation（动画）
- transform（变换）

### 💪 学习检查清单

完成本篇学习后，你应该能够：

- [ ] 解释盒模型的四层结构
- [ ] 说出 `content-box` 和 `border-box` 的区别
- [ ] 理解 margin 折叠的原理和场景
- [ ] 选择合适的 CSS 单位（px/rem/em/%/vw/vh）
- [ ] 区分 block、inline、inline-block
- [ ] 使用 DevTools 调试盒模型
- [ ] 理解文档流和脱离文档流
- [ ] 使用 position 做简单定位
- [ ] 做出一个基础的卡片组件
- [ ] 做出一个固定导航栏

如果这些都能做到，恭喜你！你已经掌握了 CSS 布局的核心基础，可以开始学习 Flexbox 和 Grid 了！🎉

---

**参考资料**：
- MDN 盒模型：https://developer.mozilla.org/zh-CN/docs/Learn/CSS/Building_blocks/The_box_model
- MDN display：https://developer.mozilla.org/zh-CN/docs/Web/CSS/display
- MDN position：https://developer.mozilla.org/zh-CN/docs/Web/CSS/position
- CSS Tricks 完整指南：https://css-tricks.com/
