---
title: ".6、class与style绑定》"
slug: "vue-vue2-6-class-style-d3586390"
summary: ""
category: "vue2"
tags: []
status: "draft"
sortOrder: 160
cover: ""
originalId: "6a2d291e8a2b1c68f2cac2bc"
originalSlug: "vue-vue2-6-class-style-d3586390"
originalStatus: "published"
exportedAt: "2026-07-30T14:08:39.359Z"
---
# 2.6、class与style绑定
## 2.6.1 class绑定
### 1、绑定字符串
适用于样式的名字不确定，需要动态指定。

```html
<head>
  <meta charset="UTF-8" />
  <title>Class绑定之字符串形式</title>
  <script src="../js/vue.js"></script>
  <style>
    .static {
      border: 1px solid black;
      background-color: aquamarine;
    }
    .big {
      width: 200px;
      height: 200px;
    }
    .small {
      width: 100px;
      height: 100px;
    }
  </style>
</head>
<body>
  <div id="app">
    <h1>{{msg}}</h1>
    <!-- 静态写法 -->
    <div class="static small">{{msg}}</div>
    <hr />
    <!-- 动态写法：动静都有 -->
    <!-- 适用场景：如果确定动态绑定的样式个数只有1个，但是名字不确定。 -->
    <div class="static" :class="c1">{{msg}}</div>
    <button @click="changeBig">变大</button>
    <button @click="changeSmall">变小</button>
  </div>
  <script>
    const vm = new Vue({
      el: "#app",
      data: {
        msg: "Class绑定之字符串形式",
        c1: "small",
      },
      methods: {
        changeBig() {
          this.c1 = "big";
        },
        changeSmall() {
          this.c1 = "small";
        },
      },
    });
  </script>
</body>

```

### 2、绑定数组
适用于绑定的样式名字不确定，并且个数也不确定。

```html
<head>
  <meta charset="UTF-8" />
  <title>Class绑定之数组形式</title>
  <script src="../js/vue.js"></script>
  <style>
    .static {
      border: 1px solid black;
      width: 100px;
      height: 100px;
    }
    .active {
      background-color: green;
    }
    .text-danger {
      color: red;
    }
  </style>
</head>
<body>
  <div id="app">
    <h1>{{msg}}</h1>
    <!-- 静态写法 -->
    <div class="static active text-danger">{{msg}}</div>
    <br />
    <!-- 动态写法：动静结合 -->
    <div class="static" :class="['active','text-danger']">{{msg}}</div>
    <br />
    <div class="static" :class="[c1, c2]">{{msg}}</div>
    <br />
    <!-- 适用场景：当样式的个数不确定，并且样式的名字也不确定的时候，
         可以采用数组形式。 数组中的每一项可以是字符串或变量。
    -->
    <div class="static" :class="classArray">{{msg}}</div>
  </div>
  <script>
    const vm = new Vue({
      el: "#app",
      data: {
        msg: "Class绑定之数组形式",
        c1: "active",
        c2: "text-danger",
        classArray: ["active", "text-danger"],
      },
    });
  </script>
</body>

```

### 3、绑定对象
适用于样式名字和个数都确定，但是要动态决定用或者不用。

```html
<head>
  <meta charset="UTF-8" />
  <title>Class绑定之对象形式</title>
  <script src="../js/vue.js"></script>
  <style>
    .static {
      border: 1px solid black;
      width: 100px;
      height: 100px;
    }
    .active {
      background-color: green;
    }
    .text-danger {
      color: red;
    }
  </style>
</head>
<body>
  <div id="app">
    <h1>{{msg}}</h1>
    <!-- 动态写法：动静结合 -->
    <!-- 对象形式的适用场景：样式的个数是固定的，样式的名字也是固定的，
         但是需要动态的决定样式用还是不用。 值是布尔值（true 则添加类，false 则移除）。
    -->
    <div class="static" :class="classObj">{{msg}}</div>
    <br />
    <div class="static" :class="{active:true,'text-danger':false}">{{msg}}</div>
  </div>
  <script>
    const vm = new Vue({
      el: "#app",
      data: {
        msg: "Class绑定之对象形式",
        classObj: {
          // 该对象中属性的名字必须和css中样式名一致。
          active: false,
          "text-danger": true,
        },
      },
    });
  </script>
</body>

```

## 2.6.2 style绑定
```html
<head>
  <meta charset="UTF-8" />
  <title>Style绑定</title>
  <script src="../js/vue.js"></script>
  <style>
    .static {
      border: 1px solid black;
      width: 100px;
      height: 100px;
    }
  </style>
</head>
<body>
  <div id="app">
    <h1>{{msg}}</h1>
    <!-- 静态写法 -->
    <div class="static" style="background-color: green">静态写法</div>
    <br />
    <!-- 动态写法：字符串形式 -->
    <div class="static" :style="myStyle">动态写法：字符串形式</div>
    <br />
    <!-- 动态写法：对象形式 -->
    <div class="static" :style="{'background-color': 'gray'}">动态写法1：对象形式</div>
    <br />
    <div class="static" :style="styleObj1">动态写法2：对象形式</div>
    <br />
    <!-- 动态写法：数组形式 -->
    <div class="static" :style="styleArray">动态写法：数组形式</div>
  </div>
  <script>
    const vm = new Vue({
      el: "#app",
      data: {
        msg: "Style绑定",
        // CSS 属性名可以用驼峰式（camelCase）或短横线分隔（kebab-case，需加引号）。
        myStyle: "background-color: gray;",
        styleObj1: {
          backgroundColor: '#333', // 驼峰式（推荐）
          'font-size': '16px'      // 短横线式（需加引号）
        },
        // 适用于需要将多个样式对象合并到同一个元素的场景。
        styleArray: [{ backgroundColor: "green" }, { color: "red" }],
        //一个数组，每个元素都是一个样式对象
      },
    });
  </script>
</body>

```
