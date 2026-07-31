---
title: ".5、mixins&plugins&scoped》"
slug: "vue-vue2-5-mixins-plugins-scoped-febd1092"
summary: ""
category: "vue2"
tags: []
status: "draft"
sortOrder: 60
cover: ""
originalId: "6a2d291e8a2b1c68f2cac2ca"
originalSlug: "vue-vue2-5-mixins-plugins-scoped-febd1092"
originalStatus: "published"
exportedAt: "2026-07-31T03:42:38.792Z"
---
# 3.5、mixins&plugins&scoped
## 3.5.1、mixins
### 3.5.1.1、需求：
点击按钮，分别获取对应的组件信息  
<!-- 这是一张图片，ocr 内容为： -->
![](https://i-blog.csdnimg.cn/direct/d9fe2b9a4fc14fbfb1c992309b416929.png)

son.vue

```vue
<template>
    <div>
        <h2>son组件</h2>
        <h3>姓名：{{ name }}</h3>
        <h3>年龄：{{ age }}</h3>
        <button @click="getmsg">点我获取信息</button>
        <hr>
    </div>
</template>
<script>
export default {
    name: 'son',
    data() {
        return {
            name: '章三',
            age: 18,
        }
    },
    methods: {
        getmsg() {
            console.log(this.name, this.age);
        }
    }
}
</script>

```

通过代码发现，无论是在son.vue中，还是girl.vue中，实现点击获取信息的代码是一样的，逻辑也是一样的。这样的代码就可以进行复用，用mixins配置进行混入，

### 3.5.1.2、实现的步骤
1. **第一步：提取**

单独定义一个mixin.js（一般和main.js在同级目录），代码如下：  
<!-- 这是一张图片，ocr 内容为： -->
![](https://i-blog.csdnimg.cn/direct/363ad79f449048978d89c9ce8eaf2210.png)

```javascript
//创文件并导出
export const getmsgMixins = {
  methods: {
    getmsg() {
      console.log(this.name, this.age);
    },
  },
};
```

2. **第二步：引入并使用**

```vue
<script>
// 混入第二步、引入并使用
import { getmsgMixins } from '../mixins.js'
export default {
    name: 'son',
    data() {
        return {
            name: '章三',
            age: 18,
        }
    },
    //混入第三步 使用mixins
    mixins: [getmsgMixins]
    // 混入第一步、提取  将逻辑代码提取到单独的minxis.js中
    // methods: {
    //     getmsg() {
    //         console.log(this.name,this.age);
    //     }
    // }
}
</script>

```

以上演示的是方法methods的混入，实际上混入时没有限制，之前所学的配置项都可以混入。

### 3.5.1.3、混入的冲突问题
1. 如果在组件本身的方法名，跟mixins.js的方法名重复了，则会产生冲突吗不会冲突，如果冲突了，会执行组件自身的，不会执行混入的
2. 组件的生命周期函数和混入的生命周期函数冲突了？对于生命周期钩子函数来说，都有的话，采用叠加，先执行混入的，再执行自己的。

```vue
<script>
// 混入第二步、引入并使用
import { getmsgMixins } from '../mixins.js'
export default {
    // 2、组件中的方法名跟混入的方法名重复了
    // methods: {
    //     getmsg(){
    //       console.log('我是另外一个getmsg函数');
    //     }
    // },
    // 3、生命周期函数重复了
    mounted(){
        console.log('我是son组件中的mounted函数');
    }
}
</script>

```

### 3.5.1.4、全局混入
在main.js全局混入，通过Vue.mixin()注册  
<!-- 这是一张图片，ocr 内容为： -->
![](https://i-blog.csdnimg.cn/direct/21b4f5936b3843fb94d5f2b4cd238fc5.png)

## 3.5.2、plugins
给Vue做功能增强的。

怎么定义插件？以下是定义插件并暴露插件。插件是一个对象，对象中必须有install方法，这个方法会被自动调用。

插件一般都放到一个plugins.js文件中。  
<!-- 这是一张图片，ocr 内容为： -->
![](https://i-blog.csdnimg.cn/direct/0610fc45b29d44bd819ef9f8998107a8.png)

```javascript
// 每一个插件都是一个对象
// 每一个插件对象中必须有一个install方法，这个install方法会被自动调用
// install方法中的参数：包括两个部分
// 第一部分：Vue构造函数
// 第二部分:可以接受用户在使用这个插件时传过来的数据，参数个数不限制
const plugins1 = {
  install(Vue, x, y, z) {
    console.log("今天你学习了吗？");
  },
};
export default plugins1
```

导入插件并使用插件：

在main.js引入，通过Vue.use()使用并传参  
<!-- 这是一张图片，ocr 内容为： -->
![](https://i-blog.csdnimg.cn/direct/325c7d0302f742db81dfe4a4a24fa040.png)

可以在控制台看到有关的输出，Vue构造函数以及传递的参数

先学会用插件，后面我们做项目的时候会使用很多插件。到时再体会插件存在的意义。

## 3.5.3、scoped
默认情况下，在vue组件中定义的样式最终会汇总到一块，如果样式名一致，会导致冲突，冲突发生后，以后来加载的组件样式为准。怎么解决这个问题？

1. 作用：让样式在局部生效，防止冲突
2. 语法：`<style scoped>`

```css
<style scoped>
  .demo {
    background-color: skyblue;
  }
</style>

```

3. Vue中的webpack并没有安装最新版，导致有些插件也不能默认安装最新版本，如npm i less-loader@7,而不是最新版，
4. 查看插件版本 npm view less-loader versions
