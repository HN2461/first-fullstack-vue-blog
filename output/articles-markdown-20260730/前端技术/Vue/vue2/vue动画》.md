---
title: "vue动画》"
slug: "vue-vue2-vue-2df26895-revision-20260730"
summary: ""
category: "vue2"
tags: []
status: "draft"
sortOrder: 10
cover: ""
originalId: "6a2d291e8a2b1c68f2cac2aa"
originalSlug: "vue-vue2-vue-2df26895"
originalStatus: "published"
exportedAt: "2026-07-30T13:20:22.058Z"
---
## 1、动画实现
（1）、操作css的transition或animation

（2）、在插入、更新或移除DOM元素时，在合适的时候给元素添加样式类名

（3）、过渡的相关类名：

 **<font style="color:#DF2A3F;">xxx-enter-active: 进入的时候激活样式</font>**

**<font style="color:#DF2A3F;"> xxx-leave-active: 离开的时候激活样式</font>**

<!-- 这是一张图片，ocr 内容为：ENTER LEAVE OPACITY:1 OPACITY:0 OPACITY:0 OPACITY:1 V-LEAVE-TO V-LEAVE V-ENTER-TO V-ENTER V-ENTER-ACTIVE V-LEAVE-ACTIVE -->
![](https://cdn.nlark.com/yuque/0/2024/png/27167233/1726124923686-872c6e52-bb19-4ea9-bbaf-ff1508c0b238.png)

<!-- 这是一张图片，ocr 内容为：显示/隐藏 带动画显示与隐藏 你好啊! -->
![](https://cdn.nlark.com/yuque/0/2024/png/27167233/1726124935200-39a11bca-fb0c-465e-907f-e02a8e73f3a8.png)

```vue
<template>
  <div>
    <button @click="isShow = !isShow">显示/隐藏</button>
    <!-- 
    1、name="hello" 定义类名的时候使用，默认是v-
    2、appear 一开始就有动画
    3、transition最终是没有形成标签的，只是起到占位作用
    -->
    <transition name="hello" appear>
      <h1 v-show="isShow">你好啊！</h1>
    </transition>
  </div>
</template>

<script>
  export default {
    name: "Test",
    data() {
      return {
        isShow: true,
      };
    },
  };
</script>

<style scoped>
  h1 {
    background-color: orange;
  }

  /* 默认是v-enter-active */
  .hello-enter-active {
    animation: move 0.5s linear;
  }

  .hello-leave-active {
    animation: move 0.5s linear reverse;
  }

  @keyframes move {
    from {
      transform: translateX(-100%);
    }

    to {
      transform: translateX(0px);
    }
  }
</style>
```

## <font style="color:rgb(0, 0, 0);">2、过渡实现：</font>
<font style="color:rgb(0, 0, 0);">（1）、准备好样式：</font>

<font style="color:rgb(0, 0, 0);">元素进入的样式</font>

<font style="color:#DF2A3F;">v-enter：进入的起点</font>

<font style="color:#DF2A3F;">v-enter-active进入过程中</font>

<font style="color:#DF2A3F;">v-enter-to：进去的终点</font>

<font style="color:rgb(0, 0, 0);">元素离开的样式</font>

<font style="color:#DF2A3F;">v-leave：离开的起点</font>

<font style="color:#DF2A3F;">v-leave-active：离开的过程中</font>

<font style="color:#DF2A3F;">v-leave-to：离开的终点</font>

<font style="color:rgb(0, 0, 0);">（2）：在目标元素外包裹</font><font style="color:rgb(0, 0, 0);">，配置的name属性的属性值，替换上面样式名的v</font>

<font style="color:rgb(0, 0, 0);">（3）、</font><u><font style="color:rgb(0, 0, 0);">如果要让页面一开始就显示动画，需要添加appear</font></u>

```vue
<template>
  <div>
    <button @click="isShow = !isShow">显示/隐藏</button>
    <transition name="hello" appear>
      <h1 v-show="!isShow">你好啊！</h1>
    </transition>
  </div>
</template>

<script>
  export default {
    name: "Test2",
    data() {
      return {
        isShow: true,
      };
    },
  };
</script>

<style scoped>
  h1 {
    background-color: orange;
    /* 3、写法一，设置过渡 */
    transition: 0.5s linear;
  }

  /*1.1 hello-enter 进入的起点 */
  .hello-enter {
    transform: translateX(-100%);
  }

  /*1.2 hello-enter-to进入的终点*/
  .hello-enter-to {
    transform: translateX(0);
  }

  /*2.1 hello-leave离开的起点  */
  .hello-leave {
    transform: translateX(0);
  }

  /*2.2 hello-leave-to离开的终点 */
  .hello-leave-to {
    transform: translateX(-100%);
  }

  /* 3.2 写法二、设置进入离开的过程 */
  /* .hello-enter-active,
  .hello-leave-active {
  transition: 0.5s linear;
  } */
</style>
```

（4）、备注：若多个元素需要过渡，则需要使用<font style="color:#DF2A3F;"><transition-group></font>，且每个元素要配合指定的key值

**需求：样式互斥，交叉过渡**

```vue
<template>
  <div>
    <button @click="isShow = !isShow">显示/隐藏</button>
    <transition-group name="hello" appear>
      <h1 v-show="!isShow" key="1">你好啊！</h1>
      <h1 v-show="isShow" key="2">bdqn</h1>
    </transition-group>
  </div>
</template>
  ······
```

## 3、第三方动画库 Animate.css
**安装动画库**

```typescript
npm install animate.css --save
```

**使用时，需要导入 **

```typescript
import "animate.css";
```

**参考网址：**

[**https://animate.style/**](https://animate.style/)

**具体使用demo**

```vue
<template>
  <div>
    <button @click="isShow = !isShow">显示/隐藏</button>
    <!-- 第二步：name="animate__animated animate__bounce" 固定的，必须要写 -->
    <!-- 第三步： enter-active-class='效果' leave-active-class='效果'-->
    <transition-group appear 
      name="animate__animated animate__bounce" 
      enter-active-class="animate__backInDown"
      leave-active-class="animate__backOutUp">
      <h1 style="background-color: orange;" v-show="!isShow" key="1">你好啊！</h1>
      <h1 style="background-color: aquamarine;" v-show="isShow" key="2">bdqn</h1>
    </transition-group>
  </div>
</template>

<script>
  // 第一步：引入动画库
  import "animate.css";

  export default {
    name: "Test3",
    data() {
      return {
        isShow: true,
      };
    },
  };
</script>

```
