---
title: "SVG入门——看懂图标代码不再懵"
slug: "html-svg-1e942bf0"
summary: "从零讲清楚 SVG 是什么、坐标系怎么理解、常用元素和属性是什么意思，重点拆解 path 的 d 属性命令，让你看到别人写的 SVG 代码不再一头雾水。"
category: "AI版HTML"
tags:
  - "SVG"
  - "图标"
  - "前端基础"
  - "HTML"
  - "矢量图形"
status: "draft"
sortOrder: 10
cover: ""
originalId: "6a2d291e8a2b1c68f2cac0c8"
originalSlug: "html-svg-1e942bf0"
originalStatus: "published"
exportedAt: "2026-07-30T14:30:35.933Z"
---
# SVG 入门——看懂图标代码不再懵

> 参考资料：[MDN SVG 教程](https://developer.mozilla.org/en-US/docs/Web/SVG/Tutorial)（Content was rephrased for compliance with licensing restrictions）

---

## 一、SVG 是什么

SVG 全称 **Scalable Vector Graphics**，可缩放矢量图形。

普通图片（JPG、PNG）是由像素点组成的，放大就会模糊。SVG 不一样，它用数学公式描述图形，放多大都清晰，文件体积也很小。

在前端项目里，SVG 最常见的用途就是**图标**。你在各种组件库、开源项目里看到的那些小图标，基本都是内联 SVG。

---

## 二、SVG 的基本结构

```html
<svg width="100" height="100" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
  <!-- 图形内容写在这里 -->
  <circle cx="50" cy="50" r="40" fill="red" />
</svg>
```

几个关键属性：

| 属性 | 作用 |
|---|---|
| `width` / `height` | SVG 在页面上占的实际尺寸（像素） |
| `viewBox` | 内部坐标系的范围，格式是 `x y 宽 高` |
| `xmlns` | XML 命名空间，内联到 HTML 时可以省略 |

---

## 三、理解 viewBox（最重要的概念）

`viewBox` 是很多人看 SVG 代码时最困惑的地方，搞懂它就能看懂大部分图标。

**类比理解**：把 SVG 想象成一张画布，`viewBox` 定义了这张画布的"内部坐标系"，`width/height` 定义了它在屏幕上显示多大。

```html
<!-- 画布内部坐标系是 0,0 到 24,24 的范围 -->
<!-- 但实际显示尺寸是 48x48 像素 -->
<svg width="48" height="48" viewBox="0 0 24 24">
  <circle cx="12" cy="12" r="10" />
</svg>
```

上面这个圆，圆心在内部坐标 (12, 12)，半径 10。虽然 viewBox 是 24×24，但实际渲染成 48×48，SVG 会自动等比缩放，圆心就变成了屏幕上的 (24, 24)，半径变成 20px。

**为什么图标都用 `viewBox="0 0 24 24"`？**

这是 Lucide、Heroicons 等主流图标库的约定。设计师在 24×24 的格子里画图标，使用时通过 `width/height` 控制实际大小，图标内部的坐标不用改。

---

## 四、坐标系方向

SVG 的坐标系和数学课不一样：

- **原点 (0, 0) 在左上角**
- **x 轴向右增大**（和数学一样）
- **y 轴向下增大**（和数学相反！）

```
(0,0) ──────────→ x
  │
  │
  ↓
  y
```

所以 `cy="5"` 的圆心比 `cy="20"` 的圆心**更靠上**，记住这一点就不会搞反。

---

## 五、常用图形元素

### `<circle>` 圆形

```html
<circle cx="12" cy="12" r="10" />
```

| 属性 | 含义 |
|---|---|
| `cx` | 圆心 x 坐标 |
| `cy` | 圆心 y 坐标 |
| `r` | 半径 |

### `<rect>` 矩形

```html
<rect x="3" y="3" width="18" height="18" rx="2" />
```

| 属性 | 含义 |
|---|---|
| `x` / `y` | 左上角坐标 |
| `width` / `height` | 宽高 |
| `rx` / `ry` | 圆角半径（只写 `rx` 时，`ry` 默认等于 `rx`） |

### `<line>` 直线

```html
<!-- 从 (3, 12) 画一条线到 (21, 12) -->
<line x1="3" y1="12" x2="21" y2="12" />
```

注意：`<line>` 本身没有填充，必须配合 `stroke` 属性才能显示。

### `<polyline>` 折线（不闭合）

```html
<!-- 依次连接这些点，不自动闭合 -->
<polyline points="5 12 12 5 19 12" />
```

`points` 里的数字两两一组，每组是一个 `x y` 坐标，用空格或逗号分隔都行。

### `<polygon>` 多边形（自动闭合）

```html
<!-- 和 polyline 一样，但最后一个点会自动连回第一个点 -->
<polygon points="12 2 19 21 5 21" />
```

### `<ellipse>` 椭圆

```html
<ellipse cx="12" cy="12" rx="10" ry="6" />
```

`rx` 是水平半径，`ry` 是垂直半径，两个不一样就是椭圆。

---

## 六、样式属性

SVG 图形的外观由这几个属性控制：

| 属性 | 含义 | 常见值 |
|---|---|---|
| `fill` | 填充色 | `red`、`#3b82f6`、`none`（透明） |
| `stroke` | 描边色 | `currentColor`、`black` |
| `stroke-width` | 描边粗细 | `1`、`2`、`1.5` |
| `fill-opacity` | 填充透明度 | `0` 到 `1` |
| `stroke-opacity` | 描边透明度 | `0` 到 `1` |
| `opacity` | 整体透明度 | `0` 到 `1` |

**`currentColor` 是什么？**

这是一个特殊值，意思是"继承父元素的 CSS `color` 属性"。

```html
<!-- 按钮的 color 是蓝色，图标的 stroke 就自动变蓝 -->
<button style="color: blue;">
  <svg stroke="currentColor" fill="none" ...>
    ...
  </svg>
</button>
```

这就是为什么图标库里几乎都写 `stroke="currentColor"`——这样图标颜色跟着文字颜色走，主题切换时不需要单独改图标颜色。

---

## 七、path 元素——最强大也最难懂的部分

`<path>` 是 SVG 里最灵活的元素，上面所有形状都能用 `<path>` 画出来，复杂的图标基本都靠它。

```html
<path d="M 10 10 L 90 10 L 90 90 Z" fill="none" stroke="black" />
```

核心就是 `d` 属性，里面是一串**路径命令**，就像在纸上指挥一支笔怎么移动。

### 路径命令规则

- **大写字母** = 绝对坐标（相对于 viewBox 原点）
- **小写字母** = 相对坐标（相对于当前笔的位置）

### 常用命令速查

#### M / m — 移动（Move To）

```
M x y    移动到绝对坐标 (x, y)，不画线
m dx dy  从当前位置移动 (dx, dy)，不画线
```

路径通常以 `M` 开头，确定起点。

#### L / l — 直线（Line To）

```
L x y    从当前位置画直线到 (x, y)
l dx dy  从当前位置画直线，偏移 (dx, dy)
```

#### H / h — 水平线

```
H x    画水平线到 x 坐标
h dx   水平移动 dx 距离
```

#### V / v — 垂直线

```
V y    画垂直线到 y 坐标
v dy   垂直移动 dy 距离
```

#### Z / z — 闭合路径

```
Z    从当前位置画直线回到路径起点，闭合图形
```

大小写效果一样。

#### 实例：用 path 画一个矩形

```html
<!-- 从 (10,10) 出发，画一个 80×80 的矩形 -->
<path d="M 10 10 H 90 V 90 H 10 Z" fill="none" stroke="black" />

<!-- 等价写法（相对坐标） -->
<path d="M 10 10 h 80 v 80 h -80 Z" fill="none" stroke="black" />
```

逐步拆解：
1. `M 10 10` — 笔移到 (10, 10)
2. `H 90` — 水平画线到 x=90
3. `V 90` — 垂直画线到 y=90
4. `H 10` — 水平画线回到 x=10
5. `Z` — 闭合（连回起点）

---

### 曲线命令

#### Q / q — 二次贝塞尔曲线

```
Q x1 y1, x y
```

- `(x1, y1)` 是控制点，决定曲线的弯曲方向
- `(x, y)` 是终点

```html
<!-- 从当前位置，经过控制点 (95, 10)，画曲线到 (180, 80) -->
<path d="M 10 80 Q 95 10 180 80" fill="none" stroke="black" />
```

想象控制点像一块磁铁，把直线"吸弯"。

#### C / c — 三次贝塞尔曲线

```
C x1 y1, x2 y2, x y
```

- `(x1, y1)` 是起点的控制点
- `(x2, y2)` 是终点的控制点
- `(x, y)` 是终点

两个控制点让曲线更灵活，可以做出 S 形等复杂曲线。图标里的流畅弧线基本都是这个。

#### A / a — 弧线（Arc）

这是最复杂的命令：

```
A rx ry x轴旋转 large-arc-flag sweep-flag x y
```

| 参数 | 含义 |
|---|---|
| `rx` / `ry` | 椭圆的 x/y 半径 |
| `x轴旋转` | 椭圆的旋转角度，通常是 `0` |
| `large-arc-flag` | `0` = 取小弧，`1` = 取大弧 |
| `sweep-flag` | `0` = 逆时针，`1` = 顺时针 |
| `x` / `y` | 弧线终点 |

```html
<!-- 画一段圆弧 -->
<path d="M 10 80 A 45 45 0 0 1 90 80" fill="none" stroke="black" />
```

`large-arc-flag` 和 `sweep-flag` 组合决定画哪段弧：

```
large-arc=0, sweep=0  → 小弧，逆时针
large-arc=0, sweep=1  → 小弧，顺时针
large-arc=1, sweep=0  → 大弧，逆时针
large-arc=1, sweep=1  → 大弧，顺时针
```

---

## 八、读懂真实图标代码

现在来拆解几个项目里实际用到的图标。

### 关闭按钮（× 号）

```html
<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
  <line x1="18" y1="6" x2="6" y2="18"></line>
  <line x1="6" y1="6" x2="18" y2="18"></line>
</svg>
```

两条直线交叉：
- 第一条：从右上 (18,6) 到左下 (6,18)
- 第二条：从左上 (6,6) 到右下 (18,18)

### 搜索图标（放大镜）

```html
<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
  <circle cx="11" cy="11" r="8"></circle>
  <path d="m21 21-4.35-4.35"></path>
</svg>
```

- 圆圈：圆心 (11,11)，半径 8，就是放大镜的镜片
- path：`m21 21` 移到 (21,21)，`-4.35-4.35` 相对偏移画线，就是放大镜的把手

### 向上箭头（回到顶部）

```html
<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
  <line x1="12" y1="19" x2="12" y2="5"></line>
  <polyline points="5 12 12 5 19 12"></polyline>
</svg>
```

- 竖线：从 (12,19) 到 (12,5)，就是箭头的杆
- 折线：(5,12) → (12,5) → (19,12)，就是箭头的头部 V 形

### 月亮图标（深色模式）

```html
<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
</svg>
```

拆解这段 path：
- `M21 12.79` — 移到 (21, 12.79)
- `A 9 9 0 1 1 11.21 3` — 画一段大圆弧（半径9，large-arc=1，逆时针）到 (11.21, 3)
- `7 7 0 0 0 21 12.79` — 再画一段小圆弧（半径7，顺时针）回到起点
- `z` — 闭合

两段弧叠加，形成月牙形状。

---

## 九、transform 变换

SVG 元素可以用 `transform` 属性做变换：

```html
<!-- 旋转：绕 (12,12) 旋转 45 度 -->
<rect transform="rotate(45, 12, 12)" x="6" y="6" width="12" height="12" />

<!-- 平移 -->
<circle transform="translate(10, 5)" cx="0" cy="0" r="5" />

<!-- 缩放 -->
<rect transform="scale(2)" x="5" y="5" width="10" height="10" />
```

进度环里常见的 `transform: rotate(-90deg)` 是 CSS 写法，把 SVG 整体旋转，让进度从顶部开始而不是右侧。

---

## 十、常见问题

**Q：`xmlns="http://www.w3.org/2000/svg"` 是什么，为什么看起来像网址？**

直接说人话：这是 **SVG 的身份证**，固定死的字符串，**不是用来联网访问的链接**。

它的作用是告诉浏览器/解析器：

> 当前这一整段标签，**不是普通 HTML 标签**，是 **SVG 矢量图形标签**，请用 SVG 规则来解析渲染。

为什么格式像网址？XML 规范规定命名空间必须是唯一字符串，用 URL 格式是因为域名天然唯一，不会和别人冲突。但浏览器**不会去请求这个地址**，规则早就内置好了。

**没有这行会怎样？**

```html
<!-- 少了 xmlns -->
<svg width="100" height="100" viewBox="0 0 100 100">
  <circle cx="50" cy="50" r="40" fill="red" />
</svg>
```

- 在独立 `.svg` 文件、小程序、原生 App 等环境里：图标**不显示**、样式错乱、被当成未知标签忽略
- 在现代浏览器的 HTML 文档里内联使用：**可以省略**，HTML5 解析器认识 `<svg>` 标签

结论：**写独立 SVG 文件必须带，内联进 HTML 可以不写。固定格式，抄就行。**

---

**Q：为什么图标显示出来是黑色方块？**

通常是 `fill` 没设置成 `none`，默认 fill 是黑色，把整个图形填满了。加上 `fill="none"` 就好。

**Q：图标颜色怎么改？**

如果用了 `stroke="currentColor"`，直接改父元素的 CSS `color` 就行：

```css
.icon-btn { color: #3b82f6; }  /* 图标变蓝 */
```

**Q：图标大小怎么控制？**

改 `width` 和 `height` 属性，或者用 CSS：

```css
svg { width: 24px; height: 24px; }
```

**Q：path 的 d 属性里数字之间用空格还是逗号？**

都行，SVG 规范允许用空格、逗号或两者混用分隔参数。`M10,20` 和 `M 10 20` 效果一样。

---

## 十一、精简通用 SVG 模板

以后写图标直接套这两个模板：

**内联进 HTML / Vue 组件（最常用）：**

```html
<!-- xmlns 可省略，width/height 控制显示大小，viewBox 固定 0 0 24 24 -->
<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
  <!-- 在这里放图形元素 -->
</svg>
```

**独立 .svg 文件：**

```xml
<!-- xmlns 必须写 -->
<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
  <!-- 在这里放图形元素 -->
</svg>
```

两者区别只有一个：独立文件多一个 `xmlns`，其他完全一样。

---

## 十二、推荐工具

- **[Lucide Icons](https://lucide.dev)** — 本项目使用的图标库，可以直接复制 SVG 代码
- **[SVG Path Editor](https://yqnn.github.io/svg-path-editor/)** — 可视化编辑 path 的 d 属性，改数字实时看效果
- **[MDN SVG 文档](https://developer.mozilla.org/zh-CN/docs/Web/SVG)** — 最权威的参考手册
- **浏览器开发者工具** — 直接在 Elements 面板里改 SVG 属性，实时预览
