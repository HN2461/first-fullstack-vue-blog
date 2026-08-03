---
title: "第 3 篇：MVVM 与数据代理"
slug: "vue-vue2-2-mvvm-0f1dddb4"
summary: "Vue 2 核心原理入门，梳理 MVVM 分层思想、Object.defineProperty 与数据代理机制。"
category: "vue2"
categoryPath:
  - "前端技术"
  - "Vue"
  - "vue2"
tags: []
status: "published"
sortOrder: 30
cover: ""
originalId: "6a2d291e8a2b1c68f2cac2b6"
originalSlug: "vue-vue2-2-mvvm-0f1dddb4"
originalStatus: "published"
publishedAt: "2026-03-27T13:24:55.325Z"
updatedAt: "2026-07-31T11:16:23.896Z"
exportedAt: "2026-08-03T03:03:53.296Z"
---
# 第 3 篇：MVVM 与数据代理

# 2.2.1 MVVM分层思想
## 1. MVVM是什么？
+ **M**：Model（模型/数据）  
+ **V**：View（视图）  
+ **VM**：ViewModel（视图模型）：VM是MVVM中的核心部分，起到非常重要的作用。  
+ **MVVM**：是目前前端开发领域非常流行的开发思想，属于一种架构模式。目前前端的大部分主流框架（如Vue、React等）都实现了MVVM思想。

## 2. Vue框架遵循MVVM吗？
虽然Vue没有完全遵循MVVM模型，但其设计受到MVVM的启发，基本符合MVVM思想。

## 3. 为什么要分离Model和View？
如果不分离，使用原生JavaScript开发时，数据改动需要手动操作DOM，代码繁琐。分离后，VM自动处理数据与视图的更新，无需手动操作DOM，开发效率显著提高。

```html
<body>
  <!-- View (V) -->
  <div id="app">
    姓名：<input type="text" v-model="name">
  </div>
  <!-- Vue程序 -->
  <script>
    // ViewModel (VM)
    const vm = new Vue({
      el: '#app',
      // Model (M)
      data: {
        name: 'zhangsan'
      }
    })
  </script>
</body>

```

---

# 2.2.2 Vue实例的属性
通过Vue实例（`vm`）可以访问以下属性：

+ **公开属性**：以`$`开头，供程序员使用。
+ **私有属性**：以`_`开头，供Vue框架内部使用，通常不建议手动操作。
+ **原型属性**：例如`vm.$delete`等。

```html
<body>
  <div id="app">
    <h1>{{msg}}</h1>
  </div>
  <script>
    let dataObj = {
      msg: "Hello Vue!"
    };

    const vm = new Vue({
      el: "#app",
      data: dataObj
    });

    console.log("dataObj的msg", dataObj.msg);
    console.log("vm的msg", vm.msg); // 数据代理机制
  </script>
</body>

```

---

# 2.2.3 `Object.defineProperty()`
## 1. 作用
ES5新增方法，用于给对象新增属性或设置已有属性。

## 2. 语法
```javascript
Object.defineProperty(对象, '属性名', {
  value: 值,          // 属性值
  writable: true,     // 是否可修改
  enumerable: true,   // 是否可遍历
  configurable: true, // 是否可删除
  get: function() {}, // 获取属性时调用
  set: function(val) {} // 设置属性时调用
});
```

## 3. 示例
```javascript
let person = {};
let temp;

Object.defineProperty(person, "name", {
  enumerable: false,
  configurable: false,
  get: function () {
    console.log("getter方法执行了@@@");
    return temp;
  },
  set: function (val) {
    console.log("setter方法执行了@@@", val);
    temp = val;
  }
});
```

---

# 2.2.4 数据代理机制
通过代理对象的属性间接访问目标对象的属性，实现依赖于`Object.defineProperty()`方法。

```javascript
let target = { name: "zhangsan" };
let proxy = {};

Object.defineProperty(proxy, "name", {
  get() {
    console.log("getter方法执行了@@@@");
    return target.name;
  },
  set(val) {
    target.name = val;
  }
});
```

---

# 2.2.5 数据代理的属性名要求
1. Vue实例不会对以`_`或`$`开头的属性名进行数据代理。
2. 原因：避免与Vue框架自身的属性名冲突。
3. 在Vue中，`data`对象的属性名不能以`_`或`$`开头。

```html
<body>
  <div id="app">
    <h1>{{msg}}</h1>
  </div>
  <script>
    const vm = new Vue({
      el: "#app",
      data: {
        msg: "Hello Vue!",
        _name: "zhangsan", // 不会做数据代理
        $age: 20 // 不会做数据代理
      }
    });
  </script>
</body>

```

---

# 2.2.6 模拟实现数据代理
简单实现`myvm.name == options.data.name`。

```javascript
class MyVue {
  constructor(options) {
    Object.keys(options.data).forEach((propertyName) => {
      Object.defineProperty(this, propertyName, {
        get() {
          return options.data[propertyName];
        },
        set(val) {
          options.data[propertyName] = val;
        }
      });
    });
  }
}

const myvm = new MyVue({
  data: {
    msg: "Hello Vue!",
    name: "jackson",
    age: 30
  }
});
```

---

# 2.2.7 Vue中的数据代理与数据劫持
## 1. 数据代理
+ Vue将`_data`中的数据通过`Object.defineProperty`代理到`vm`实例上。
+ 通过`getter`和`setter`方法，可以直接操作`_data`中的数据。

## 2. 数据劫持
+ 将`data`中的每个属性通过`Object.defineProperty`改写为响应式数据（`_data`）。
+ 监听数据的读取和修改，触发视图更新。

## 3. 总结
1. 数据劫持：将`data`改写为响应式数据（`_data`）。
2. 数据代理：将`_data`中的数据代理到`vm`实例上，方便直接操作。

步骤：

1. 使用`Object.defineProperty`对`data`进行数据劫持，生成响应式的`_data`。
2. 通过`vm`进行数据代理，方便直接操作`_data`中的数据。

---
