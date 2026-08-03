---
title: "补充篇：SCSS 常见写法速通"
slug: "css-scss-sass-less-postcss-7d08d2e9"
summary: "SCSS 速通笔记，面向 Vue 项目样式阅读，整理变量、嵌套、父选择器、mixin、@include、@use 和 @extend。"
category: "AI版CSS"
categoryPath:
  - "前端技术"
  - "前端三剑客"
  - "AI版CSS"
tags:
  - "SCSS"
  - "Sass"
  - "Vue"
  - "CSS工程化"
  - "样式预处理"
status: "published"
sortOrder: 90
cover: ""
originalId: "6a2d291e8a2b1c68f2cac0b4"
originalSlug: "css-scss-sass-less-postcss-7d08d2e9"
originalStatus: "published"
publishedAt: "2026-04-28T12:24:31.194Z"
updatedAt: "2026-07-31T11:16:23.081Z"
exportedAt: "2026-08-03T03:03:53.296Z"
---
# 补充篇：SCSS 常见写法速通

> 主人如果现在最常见到的是 `SCSS`，那我们就先学 `SCSS`。  
> 这一篇不追求讲全工程化，只解决一个更实际的问题：
>
> **别人写了 `SCSS`，你至少要能看懂。**

---

## 一、先记住 3 句话

1. `SCSS` 可以先理解成“加强版 CSS”。
2. 它最常见的价值就是：**变量、嵌套、复用**。
3. 浏览器最终看到的仍然是 `CSS`，`SCSS` 只是开发时更方便的写法。

你现在不用一上来就研究很深。

先把下面这些最常见写法看懂，已经够你读大部分前端项目的样式代码了。

---

## 二、SCSS 和普通 CSS 最直观的区别

普通 CSS 大概这样写：

```css
.card {
  padding: 16px;
  border-radius: 12px;
}

.card .title {
  color: #2563eb;
}

.card .title:hover {
  color: #1d4ed8;
}
```

同样的意思，用 SCSS 常常会写成这样：

```scss
$brand: #2563eb;

.card {
  padding: 16px;
  border-radius: 12px;

  .title {
    color: $brand;

    &:hover {
      color: #1d4ed8;
    }
  }
}
```

你先只看出 3 个点就够了：

- 多了变量：`$brand`
- 可以嵌套：`.title` 写进 `.card` 里面
- `&:hover` 表示“当前选择器本身的 hover”

---

## 三、看别人 SCSS 时，最常见的几种写法

## 1. 变量

SCSS 变量用 `$` 开头：

```scss
$primary-color: #2563eb;
$font-size-base: 14px;
$radius: 12px;
```

使用时直接写变量名：

```scss
.button {
  background: $primary-color;
  font-size: $font-size-base;
  border-radius: $radius;
}
```

你可以把它直接理解成：

- `$primary-color` 就是“颜色起了个名字”
- 后面哪里用到它，都是在复用这个值

这和 JS 变量很像，只不过这里是样式变量。

---

## 2. 嵌套

这是你最容易在别人代码里看到的写法。

```scss
.card {
  padding: 16px;

  .title {
    font-size: 18px;
  }

  .desc {
    color: #64748b;
  }
}
```

它展开后其实就是：

```css
.card {
  padding: 16px;
}

.card .title {
  font-size: 18px;
}

.card .desc {
  color: #64748b;
}
```

所以看嵌套时，你脑子里只要做一件事：

**把里面的选择器，接到外面的选择器后面。**

---

## 3. `&` 父选择器

`&` 表示“当前这一层选择器本身”。

最常见的是伪类：

```scss
.button {
  color: #2563eb;

  &:hover {
    color: #1d4ed8;
  }

  &:active {
    transform: scale(0.98);
  }
}
```

展开后就是：

```css
.button:hover {
  color: #1d4ed8;
}

.button:active {
  transform: scale(0.98);
}
```

它也常用来写修饰类：

```scss
.button {
  &.is-primary {
    background: #2563eb;
    color: #fff;
  }

  &.is-disabled {
    opacity: 0.5;
  }
}
```

展开后是：

```css
.button.is-primary {
  background: #2563eb;
  color: #fff;
}

.button.is-disabled {
  opacity: 0.5;
}
```

这里要特别注意：

- `&:hover` 是 `.button:hover`
- `&.is-primary` 是 `.button.is-primary`

不是后代，不要看错。

---

## 4. `mixin` 和 `@include`

这个可以理解成“可复用的样式片段”。

先定义：

```scss
@mixin flex-center {
  display: flex;
  align-items: center;
  justify-content: center;
}
```

再使用：

```scss
.modal {
  @include flex-center;
}

.empty-state {
  @include flex-center;
}
```

意思很简单：

- `@mixin` 是“定义一段可复用样式”
- `@include` 是“把这段样式拿过来用”

它也可以带参数：

```scss
@mixin text-ellipsis($lines: 1) {
  overflow: hidden;

  @if $lines == 1 {
    white-space: nowrap;
    text-overflow: ellipsis;
  }
}

.title {
  @include text-ellipsis;
}
```

你现在看到带参数的 mixin，不用慌。

先记住最核心的一句：

**`@include xxx` 的意思通常就是“展开一段别人提前写好的公共样式”。**

---

## 5. `@use`

在新一点的 Sass 代码里，你会看到：

```scss
@use 'sass:color';
@use '@/styles/variables.scss' as *;
```

你先不用深究模块系统。

现阶段这样理解就够了：

- `@use` 大致相当于“把别的 SCSS 文件能力引进来”
- 可能是引变量
- 可能是引 mixin
- 也可能是引 Sass 自带模块

比如：

```scss
@use '@/styles/mixins.scss' as *;

.dialog {
  @include flex-center;
}
```

这通常说明：

- `flex-center` 不是在当前文件里定义的
- 它大概率来自 `mixins.scss`

所以当你看到 `@include` 却找不到定义，先去看顶部有没有 `@use`。

---

## 6. `@extend` 和 `%占位选择器`

这个你没有前面几种那么常见，但别人项目里也可能写。

```scss
%card-base {
  padding: 16px;
  border-radius: 12px;
  background: #fff;
}

.user-card {
  @extend %card-base;
}

.product-card {
  @extend %card-base;
}
```

你可以先把它理解成：

- `%card-base` 是一个“不给页面直接用的公共模板”
- `@extend` 是“继承这套模板”

如果只想先会读代码，你记住：

- `%` 开头通常是占位选择器
- `@extend` 通常表示复用已有规则

---

## 7. 简单计算

SCSS 里经常顺手写一些计算：

```scss
$gap: 12px;

.list {
  margin: $gap * 2;
  padding: $gap / 2;
}
```

你就把它当成：

- 可以拿变量参与一点简单计算

另外有时也会看到字符串拼接或插值：

```scss
$name: 'warning';

.message-#{$name} {
  color: orange;
}
```

这表示最终类名会变成：

```css
.message-warning
```

如果你暂时看不惯，先把 `#{$变量}` 理解成“把变量值塞进字符串里”。

---

## 8. 单行注释

SCSS 支持这种注释：

```scss
// 这是单行注释
$brand: #2563eb;
```

普通 CSS 只有：

```css
/* 这是 CSS 注释 */
```

所以你如果在样式里看见 `//`，大概率就已经不是普通 CSS 了，而是 SCSS。

---

## 四、Vue 项目里最常见的 SCSS 长什么样

在 Vue 里你最容易看到这种：

```vue
<style lang="scss" scoped>
.user-card {
  padding: 16px;

  .title {
    color: #1e293b;
  }

  .btn {
    &:hover {
      color: #2563eb;
    }
  }
}
</style>
```

这里面有 3 层意思：

- `lang='scss'`
  - 说明这段样式用的是 SCSS 语法
- `scoped`
  - 说明这段样式倾向于只作用当前组件
- 中间那部分
  - 才是你真正要读的 SCSS 内容

也就是说：

**`scoped` 不是 SCSS 语法本身，它只是 Vue 组件样式隔离能力。**

---

## 五、看不懂别人 SCSS 时，按这个顺序读

这个最实用。

以后你再看到一大段 SCSS，不要怕，按下面顺序拆：

### 第一步：先找最外层选择器是谁

比如：

```scss
.card {
  .title {
    &:hover {
      color: $brand;
    }
  }
}
```

先抓住最外层：`.card`

### 第二步：把嵌套一层层展开

上面这段你就可以在脑子里翻译成：

- `.card`
- `.card .title`
- `.card .title:hover`

### 第三步：把变量当成“值的别名”

看到：

```scss
color: $brand;
```

就去文件顶部找：

```scss
$brand: #2563eb;
```

### 第四步：看到 `@include` 就去找 `@mixin`

如果看到：

```scss
@include flex-center;
```

就去搜：

```scss
@mixin flex-center
```

### 第五步：先别管太高级的东西

如果某段代码里同时出现：

- `@use`
- `@include`
- `@extend`
- `#{}`

你也不用一次全搞透。

你先做到：

- 看懂选择器是作用到谁
- 看懂变量最终是什么值
- 看懂公共样式是从哪里引进来的

这样已经能读大部分业务样式代码了。

---

## 六、给主人一份最常用的“翻译表”

| 看到的写法 | 你先怎么理解 |
|-----------|--------------|
| `$color: red;` | 定义变量 |
| `color: $color;` | 使用变量 |
| `.box { .title {} }` | 选择器嵌套 |
| `&:hover` | 当前元素的 hover |
| `&.active` | 当前元素自己再加一个类 |
| `@mixin xxx` | 定义公共样式片段 |
| `@include xxx` | 使用公共样式片段 |
| `@use '...'` | 引入别的 SCSS 能力 |
| `%base` | 占位模板 |
| `@extend %base` | 继承模板 |
| `#{$name}` | 把变量值拼进字符串里 |

---

## 七、那 Less 和 PostCSS 先怎么理解

主人现在既然主要见到的是 `SCSS`，这两个先不用学深。

先只记一句话就够：

- `Less`
  - 和 SCSS 很像，也是“让 CSS 更好写”的工具
- `PostCSS`
  - 不是拿来这样写样式的，它更像“构建时再处理一下 CSS 的工具链”

所以现阶段你的学习优先级可以直接这样排：

1. 先看懂普通 CSS
2. 再看懂 SCSS 常见写法
3. 以后真在项目里见到 Less，再顺手补
4. PostCSS 等你接触构建配置时再学

---

## 八、回到当前这个博客项目

顺手帮主人确认过了：

- 这个博客仓库现在主要还是普通 CSS
- 组件里大量是 `<style scoped>`
- 目前没有真的大规模用到 `scss` 文件

所以你现在补这一篇，其实刚刚好：

- 不是为了立刻改这个仓库
- 而是为了以后看别人 Vue 项目代码时不发怵

---

## 九、最后一句话总结

如果主人现在只想先看懂别人写的 SCSS，那你就先盯住这 5 个东西：

1. `$变量`
2. 选择器嵌套
3. `&`
4. `@mixin` / `@include`
5. `@use`

把这 5 个看熟，别人写的大多数 SCSS，你基本就能顺着读下来了。

以后如果你愿意，我还可以继续给你补一篇更实用的：

- **“Vue 项目里最常见的 SCSS 代码块，我逐行翻译给你看”**
