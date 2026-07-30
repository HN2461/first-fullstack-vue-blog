---
title: "route》"
slug: "vue-vue2-route-e54b9784-revision-20260730"
summary: ""
category: "vue2"
tags: []
status: "draft"
sortOrder: 20
cover: ""
originalId: "6a2d291e8a2b1c68f2cac2a8"
originalSlug: "vue-vue2-route-e54b9784"
originalStatus: "published"
exportedAt: "2026-07-30T13:20:22.058Z"
---
## 6.1 传统web应用vs单页面web应用
### 6.1.1、传统web应用
传统web应用，又叫做多页面web应用：核心是一个web站点由多个HTML页面组成，点击时完成页面的切换，因为是切换到新的HTML页面上，所以当前页面会全部刷新。

### 6.1.2、单页面web应用（SPA：<font style="color:rgb(255, 0, 0);">S</font>ingle <font style="color:rgb(255, 0, 0);">P</font>age web <font style="color:rgb(255, 0, 0);">A</font>pplication）
整个网站<u>只有一个HTML页面</u>，点击时只是完成当前页面中**<font style="color:#DF2A3F;">组件的切换</font>**。属于<u>页面局部刷新</u>。

<!-- 这是一张图片，ocr 内容为：更新 C PROJECT/MANAGER/ 地址会变化 组件切换时, 组件切换时不会转圈 项口管理 课程管理 课程管理 列表页 首页 这是课程管理的列表页面 需求管理 选择字段 删除 选择操作 编辑 录入 课程管理 Q 输入搜素的内容 任务管理 工作手册 11 优先级 计 字幕 状态 开始时间 课程名称 结束时间 HAG:90从入门到精通 未添加 中 未上线 10 未上线 TOMCAL9的配置与更多 20 课程管理的组件 未上线 SVN从入门到精通视频教程 30 中 中 未上线 JQUERY节点操作案例数程 4 0 SQL经典训练试题 中 未上线 5口 极速掌握MYSQL存储过程 中 未上线 60 -->
![](https://cdn.nlark.com/yuque/0/2024/png/27167233/1726122995785-4d1ef9b7-d1b5-4a77-9a2d-b5ea37c2fa55.png)

单页应用程序 (SPA) 是加载单个HTML 页面并在用户与应用程序交互时动态更新该页面的Web应用程序。浏览器一开始会加载必需的HTML、CSS和JavaScript，所有的操作都在这张页面上完成，都由JavaScript来控制。单页面的跳转**<font style="color:rgb(255, 0, 0);">仅刷新局部资源</font>**。因此，对单页应用来说**<font style="color:rgb(255, 0, 0);">模块化的开发和设计</font>**显得相当重要。

### 6.1.3、单页面应用的优缺点：
#### 6.1.3.1、单页面应用的优点
1、提供了更加<u>吸引人的用户体验</u>：具有桌面应用的即时性、网站的可移植性和可访问性。

2、单页应用的<u>内容的改变不需要重新加载整个页面</u>，web应用更具响应性和更令人着迷。

3、单页应用没有页面之间的切换，就<u>不会出现“白屏现象”</u>,也不会出现假死并有“闪烁”现象

4、单页应用相对<u>服务器压力小</u>，服务器只用出数据就可以，不用管展示逻辑和页面合成，吞吐能力会提高几倍。

5、<u>良好的前后端分离。</u>后端不再负责模板渲染、输出页面工作，后端API通用化，即同一套后端程序代码，不用修改就可以用于Web界面、手机、平板等多种客户端

#### 6.1.3.2、单页面应用的缺点：
1、<u>首次加载耗时比较多</u>。

2、<u>SEO问题</u>，不利于百度，360等搜索引擎收录。

3、容易造成<u>CSS命名冲突</u>。

4、前进、后退、地址栏、书签等，都需要程序进行管理，<u>页面的复杂度很高，需要一定的技能水平和开发成本高。</u>

**6.1.3.3、单页面和多页面的对比**

<!-- 这是一张图片，ocr 内容为：单页面应用(SPA) 多页面应用(MPA) 多个主页面 一个主页面和多个页面片段 组成 整页刷新 刷新方式 局部刷新 哈希模式 历史模式 URL模式 难实现,可使用SSR方式改善 SEO搜索引擎优化 容易实现 通过URL,COOKIE,LOCALSTORAGE等传递 容易 数据传递 速度快,用户体验良好 切换加载资源,速度慢,用户体验差 页面切换 维护成本 相对容易 相对复杂 -->
![](https://cdn.nlark.com/yuque/0/2024/png/27167233/1726123089324-3114336e-ed50-49fe-b4eb-624b3128d4d3.png)

目前较为流行的是**单页面应用的开发。**

如果想使用Vue去完成单页面应用的开发，需要借助Vue当中的**<font style="color:#DF2A3F;">路由机制</font>**。

## 6.2 路由route与路由器router	
1、路由：route 

2、路由器：router

路由器用来管理/调度各个路由

对于一个应用来说，一般路由器只需要一个，但是路由是有多个的

3、<font style="color:#DF2A3F;">每一个路由都由key和value组成</font>。

key是路径，value是对应的组件

key1+value1===>路由route1

key2+value2===>路由route2

key3+value3===>路由route3

......

4、路由的本质：<font style="color:rgb(255, 0, 0);">一个路由表达了一组对应关系</font>。

5、路由器的本质：<font style="color:rgb(255, 0, 0);">管理多组对应关系</font>。

<!-- 这是一张图片，ocr 内容为：不安全 1/PROJECT/MANAGER/ 政合 更新 1.点击后路径变化 项目管理 需求管 需求管理 列表页 首页 这是需求管理的列表页面 需求管理 选择字段 编辑 删除 选择操作 录入 查看 课程管理 Q 任务管理 输入搜索的内容 工作手册 开始时间 需求 提出人 优先级 状态 负责人 4.完成路由切换 2.路由器监视到变化了 表中 条纪录 每页 10 页 显示第0至0项结果,共0项 下一页 尾页 上一页 VALUE是组件 KEY是路径 3.根据路径匹配路由 这是一个路由,描述了一 PROJECT/MANAGER 三>需求管理组件 组KEY VALUE关系 E>课程管理组件 /PROJECT/COURSE 路由器ROUTER /PROJECT/TASK ,任务管理组件 路由器一直在做两件事: 1.不停的监视路径的变化 2.只要路径变化,路由器就会找到对应路由,完成路由的切换. -->
![](https://cdn.nlark.com/yuque/0/2024/png/27167233/1726123145675-a4f0e6c5-2742-4a40-8958-3691c6102445.png)

## 6.3 使用路由	
### 6.3.1、创建组件
<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.nlark.com/yuque/0/2025/png/27167233/1742176119487-eebc8b2c-50fb-4c73-a988-ba270e473cfb.png)

**app.vue**

```vue
<template>
  <div class="app">
    <MyHeader class="myheader" title="首页" />
    <Home class="mycontent" />
    <Myfooter class="myfooter" />
  </div>
</template>

<script>
import MyHeader from './components/MyHeader.vue'
import Myfooter from './components/Myfooter.vue';
import Home from './components/home.vue';
export default {
  name: 'App',
  components: {
    MyHeader,
    Myfooter,
    Home
  }
}
</script>

<style>
* {
  margin: 0;
  padding: 0;
}

.app {
  width: 375px;
  height: 667px;
  display: flex;
  flex-direction: column;
  margin: 30px auto;
}

.myheader,
.myfooter {
  width: 100%;
  line-height: 50px;
  background-color: gainsboro;
  display: flex;
  align-items: center;
}

.myheader {
  justify-content: space-between;
}

.myfooter {
  justify-content: space-around;
}

.mycontent {
  width: 100%;
  flex-grow: 1;
  background-color: pink;
}
</style>
```

MyHeader.vue

```vue
<template>
  <div class="myheader">
    <button>返回</button>
    <h3>{{ title }}</h3>
    <button>详情</button>
  </div>
</template>

<script>
export default {
    name:'MyHeader',
    props:['title']

}
</script>

<style scoped>
button{
    width: 70px;
    height: 40px;
}

</style>
```

MyFooter.vue

```vue
<template>
  <div>
    <a href="#" v-for="nav in navList" :key="nav">{{ nav }}</a>
  </div>
</template>

<script>
export default {
  name: 'MyFooter',
  data() {
    return {
      navList: ['首页', '新闻', '购物车', '我的']
    }
  },

}
</script>

<style></style>
```

Home.vue

```vue
<template>
  <div>
    home
  </div>
</template>

<script>
export default {
   
    name:''

}
</script>

<style>

</style>
```







### 6.3.2、安装路由vue-router
<font style="color:rgb(255, 0, 0);">(1) vue2 要安装 vue-router3</font>

<font style="color:rgb(255, 0, 0);">① npm i </font>[vue-router@3](http://vue-router@3)

(2) vu3要安装vue-router4

① npm i [vue-router@4](http://vue-router@4)

如果报错

<!-- 这是一张图片，ocr 内容为：(BASE) WANGCHUNYAN@WANGCHUYANDEMBP SRC % NPM INSTAL INSTALL VUE-ROUTER ERR! CODE ERESOLVE NPM ERESOLVE UNABLE TO RESOLVE DEPENDENCY TREE NPM ERR! NPM WHILE RESOLVING:VUE_CLI_PRO@0.1.0 ERR! NPM FOUND:VUE@2.7.16 ERR! NPM ERR! NODE MODULES/VUE NPM ERR! VUE@"2.6.11"FROM THE ROOT PROJECT NPM ERR! NPM COULD NOT RESOLVE DEPENDENCY: ERR! NPM "FROMVUE-ROUTER@4.3.0 ERR! PEER VUE@".0"FR NPM ERR! NODE MODULES/VUE-ROUTER NPM VUE-ROUTER@"*" FROM THE ROOT PROJECT ERR! NPM ERR! NPM ERR! FIX THE UPSTREAM DEPENDENCY CONFLICT, OR RETRY NPM TH--FORCE OR --LEGACY-PEER-DEPS ERR!THIS COMMAND WITH --F NPM -->
![](https://cdn.nlark.com/yuque/0/2024/png/27167233/1726123354477-ea737a01-c1e4-4996-82f5-663a7ea13fd7.png)

npm i [vue-router@3](http://vue-router@3) --legacy-peer-deps

### 6.3.3、配置vue-router环境并使用
**main.js**

```javascript
import Vue from "vue";
import App from "./App.vue";


Vue.config.productionTip = false;
// 导入路由器对象
import router from "./router";

const vm = new Vue({
  render: (h) => h(App),
  // 一旦使用了vue-router插件，那么new Vue的时候就可以直接传递一个配置项
  // 注册路由器对象，router
  router
}).$mount("#app");
console.log(vm);

```

在src目录下，新建一个router文件夹，新建index.js,配置路由器对象，并暴露

**第一步:配置路由关系**

```javascript
// 导入Vue
import Vue from "vue";
// 导入VueRouter
import VueRouter from "vue-router";
// 注册VueRouter
Vue.use(VueRouter)

// 导入路由组件
import Home from "@/views/home.vue";
import News from "@/views/news.vue";
import Car from "@/views/car.vue";
import My from "@/views/my.vue";

const router=new VueRouter({
    // routes 配置路由规则，配置一组组路由关系,数组
    // 每一组路由关系都是一个对象：
    // key：路径==>path
    // value：组件==>component
    routes:[
        {
            path:'/home',//注意要以/开头
            component:Home
        },
        {
            path:'/news',
            component:News
        },
        {
            path:'/car',
            component:Car
        },
        {
            path:'/mine',
            // 路径要以/开头,路径名与文件名可以不一样
            // 这里的路径名是mine，但是文件名是my.vue
            // 路径是用来跳转URL
            component:My
        },
    ]

})

export default router
```

第二步：使用路由关系

**MyFooter.vue**

```javascript
<template>
  <div>
    <!-- 第二步：routerlink的to属性，配置好路由关系 -->
    <!-- to 配置路由路径 ，点击时会跳到对应路径的路由组件-->
    <router-link :to="nav.path" v-for="nav in navList" :key="nav.name">{{ nav.name }}</router-link>
    <!-- <a href="#" >{{ nav }}</a> -->
  </div>
</template>

<script>
export default {
  name: 'MyFooter',
  data() {
    return {
      navList: [
        {
          name: '首页',
          path: '/home',
        },
        {
          name: '新闻',
          path: '/news',
        },
        {
          name: '购物车',
          path: '/car',
        },
        {
          name: '我的',
          path: '/mine',
        },
      ]
    }
  },

}
</script>

<style></style>
```

**第三步：路由组件显示**

**app.vue**

```vue
<template>
  <div class="app">
    <MyHeader class="myheader" title="首页" />
    <!-- <Home class="mycontent" /> -->
     <!-- 第三步：告诉路由器，路由组件显示的位置 -->
    <div class="mycontent">
      <!-- 告诉路由器，路由组件显示在这个位置 -->
      <router-view />
    </div>

    <Myfooter class="myfooter" />
  </div>
</template>
```

注意事项：

① 路由组件一般会和普通组件分开存放，路由组件放到pages或views目录，普通组件放到components目录下。

②<font style="color:#DF2A3F;"> </font><u><font style="color:#DF2A3F;">路由组件在进行切换的时候，切掉的组件会被销毁，</font></u>可用destroyed生命周期钩子证实

③ 路由组件的两个属性：$route和$router

1)<u> $route：属于自己的路由对象。</u>

<u>2) $router：多组件共享的路由器对象。</u>

### 6.3.4、小功能：
点击底部导航，顶部title部分随着进行更新，这里用到了兄弟传参，还要在本地保存一份，解决刷新，title初始化的问题，

注意：router-link上不能绑定点击事件，不生效

myfooter.vue

```vue
<template>
  <div>
    <!-- 第二步：routerlink的to属性，配置好路由关系 -->
    <!-- to 配置路由路径 ，点击时会跳到对应路径的路由组件-->
    <router-link :to="nav.path" v-for="nav in navList" :key="nav.name" active-class="active">
      <span @click="sendTilte(nav.name)">
        {{ nav.name }}
      </span>
    </router-link>
    <!-- <a href="#" >{{ nav }}</a> -->
  </div>
</template>

<script>
export default {
  name: 'MyFooter',
  data() {
    return {
      navList: [
       //·····
      ]
    }
  },
  methods: {
    sendTilte(name) {
      this.$bus.$emit('handlerSendTilte', name)
      localStorage.setItem('title',name)
    }
  }

}
</script>
```

myheader.vue

```vue
<template>
  <div class="myheader">
    <button>返回</button>
    <h3>{{ title }}</h3>
    <button>详情</button>
  </div>
</template>

<script>
export default {
  name: 'MyHeader',
  data() {
    return {
      // 初始化数据从本地拿取
      title: localStorage.getItem('title')||'首页'
    }
  },
  mounted() {
    this.$bus.$on('handlerSendTilte', (name) => {
      this.title = name
    })
  }
}
</script>
```



## 6.4 多级路由
**第一步：**创建好二级路由组件

<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.nlark.com/yuque/0/2025/png/27167233/1742181560313-897c1a84-0365-4ace-a723-2935ba5d6340.png)

**第二步：**router/index.js配置好二级路由关系

```vue
//....
        import Hot from "@/views/home/hot.vue";
        import Agree from "@/views/home/agree.vue";
        import More from "@/views/home/more.vue";

        const router = new VueRouter({
        // 配置路由规则  配置一组组路由关系，
        // 每一组路由关系都是一个对象：
        // key：路径==>path
        // value：组件==>component
        // 第一步：配置好路由关系：key--value
        routes: [
        {
        path: '/home',//注意要以/开头
        component: Home,
        // children配置项，配置二级路由
        children: [
        {
        // path写法一:路径完整
        // path:'/home/hot',//二级路由路径
        // path写法二：直接写路径名，不能加/
        path: 'hot',
        component: Hot//二级路由
        },
        {
        path: 'agree',
        component: Agree
        },
        {
        path: 'more',
        component: More
        }
        ]
        },
        //·····
```

**第三步：routerLink使用**

src/views/home/index.vue

```vue
<template>
  <div>
    <!-- 轮播图 -->
    <div class="swiper">轮播图</div>
    <!-- 二级导航 -->
    <div class="subNav">
      <!-- 二级路由在使用时，必须把路径写完整 -->
      <router-link to="/home/hot">
        <h5>正在热卖</h5>
      </router-link>
      <router-link to="/home/agree">
        <h5>值得推荐</h5>
      </router-link>
      <router-link to="/home/more">
        <h5>查看更多</h5>
      </router-link>
    </div>
    //·····
```

第**四步：**设置二级路由显示位置

```vue
<template>
  <div>
    <!-- 轮播图 -->
    <div class="swiper">轮播图</div>
    <!-- 二级导航 -->
    <div class="subNav">
      //·····
    </div>
    <!-- 路由组件显示位置 -->
     <div>
      <router-view />
     </div>
  </div>
</template>

```

## 6.5 路由起名字	
<u>可以给路由起一个名字，这样可以简化to的编写</u>，且后期我们在parms传参，需要用到name

**第一步：**在路由关系中，添加name的配置

```vue
 {
      path: 'agree',
      component: Agree,
      name: 'agree'
  },
```

**第二步：**使用name，简化to的写法

```vue
  <!-- 二级导航 -->
    <div class="subNav">
      
      <!-- 二级路由在使用时，必须把路径写完整 -->
      <!-- to的写法一 路径完整形式-->
      <!-- <router-link to="/home/hot"> -->
      <!-- to的写法二 对象形式，对象里面放路径-->
      <!-- <router-link :to="{path:'/home/hot'}"> -->
      <!-- to的写法三 对象形式，里面放路径名-->
      <router-link :to="{ name: 'hot' }">
        
        <h5>正在热卖</h5>
      </router-link>
      <router-link to="/home/agree">
        <h5>值得推荐</h5>
      </router-link>
      <router-link to="/home/more">
        <h5>查看更多</h5>
      </router-link>
    </div>
```

## **6.6 路由query传参	**
为了提高组件的复用性，可以<font style="color:#DF2A3F;">给路由组件传参</font>，URL的查询参数，？开头，&分割多个

**传递参数：**哪里点击跳转，在哪里传参数

需求：根据电影列表信息，点击不同的电影，查看不同的详情页面

第一步：配置好详情页组件

views/detail.vue

```vue
<template>
    <div>
        <h1>detail</h1>
    </div>
</template>

<script>
export default {
    // 接收传递参数
    mounted(){
        // 当前的路由信息，this.$route.query
        console.log(this.$route.query,'route');
    }
}
</script>

<style></style>
```

第二步：**router/index.js**

```javascript
routes: [
    {
        //路由重定向
        path: '/',//初始路径
        redirect: '/home/hot'
    },
    {
        path:'/detail',
        name:'detail',
        component:Detail
    },
  //·····
```

第三步：传递参数，哪里点击，哪里传递

```vue
<template>
  <div>
    <ul>
      <li v-for="film in films" :key="film.filmId">
        <!-- query传参
         to="/路由路径?参数名=参数值&参数名=参数值"
        -->
        <!-- 1、传递静态参数 -->
        <!-- <router-link  to="/detail?filmId=123" class="film"> -->
        
        <!-- 2、传递从data中读取的参数 -->
        <!-- <router-link  :to="`/detail?filmId=${num}`" class="film"> -->
        
        <!-- 3、传递遍历的参数 -->
        <!-- <router-link :to="`/detail?filmId=${film.filmId}&num=${num}`" class="film"> -->
       
        <!-- 4、以对象的方式传递参数 -->
        <!-- :to="{
          // path: '/detail',
          name: 'detail',
          query: {
            filmId: film.filmId,
            num: num
          }
        }" -->
        
        <router-link :to="{
          // path: '/detail',
          name: 'detail',
          query: {
            filmId: film.filmId,
            num: num
          }
        }" class="film">
          <img :src="film.poster" alt="" style="width: 100px;">
          {{ film.name }}
        </router-link>
      </li>
    </ul>
  </div>
</template>
```

第四步：拿取数据

拿到detail组件的路由  <font style="color:#DF2A3F;">this.$route.query ,里面就有传递的参数</font>

```vue
<template>
    <div>
        <h1>detail：{{ filmId }}</h1>
    </div>
</template>

<script>
export default {
    data() {
        return {
            filmId: ''
        }
    },
    // 接收传递参数
    mounted() {
        // 当前的路由信息
        console.log(this.$route.query, 'route');
        this.filmId = this.$route.query.filmId
        console.log(`通过filmId：${this.filmId}请求数据，进行展示`);
    }
}
</script>
```

## 6.7 路由params传参	
**第一步：**新建好detail组件，并配置好路由关系		

如果是<u>采用</u>**<u><font style="color:#DF2A3F;">to传递字符串</font></u>**<u>的形式，拼接参数</u>： <font style="color:#DF2A3F;">to='路径名/参数1/参数2'</font> ，<u>必须在route/index.js中路径处</u><u><font style="color:#DF2A3F;">进行参数占位</font></u>

/.../....的形式传参

```javascript
{
            // params传递，必须在路由后进行参数占位
            path:'/detail/:filmId/:num2',
            name: 'detail',
            component: Detail
        },
```

如果是**<font style="color:#DF2A3F;">to传递对象</font>**的形式：<font style="color:#DF2A3F;">可以不占位</font>

```javascript
{
            // params传递，必须在路由后进行参数占位
            // path:'/detail/:filmId/:num2',
            // 如果是对象的形式传参，就不需要占位
            path: '/detail',
            name: 'detail',
            component: Detail
        },
```

**第二步：**传递参数

哪里点击，哪里传递参数

```vue
<template>
  <div>
    <ul>
      <li v-for="film in films" :key="film.filmId">
        <!-- params传参
          to='路径名/参数1/参数2' 
        -->
        
        <!-- 1、传递静态数据 -->
        <!-- <router-link to="/detail/123/456" class="film"> -->
        
        <!-- 2、传递动态的数据 -->
        <!-- <router-link :to="`/detail/${film.filmId}/456`" class="film"> -->
        
        <!-- 3、传递参数：对象的形式，不能用path，必须用name -->
        <!-- :to="{
          // path: '/detail',
          name: 'detail',
          params: {
            filmId: film.filmId,
            num2: 456
          }

        }" -->
        
        <router-link :to="{
          // path: '/detail',
          name: 'detail',
          params: {
            filmId: film.filmId,
            num2: 456
          }

        }" class="film">
          <img :src="film.poster" alt="" style="width: 100px;">
          {{ film.name }}
        </router-link>
      </li>
    </ul>
  </div>
</template>
```

**第三步：**detail组件接收参数

拿到当前组件的路由关系：**<font style="color:#DF2A3F;">this.$route.params</font>**

```vue
<template>
    <div>
        <h1>detail：{{ filmId }}</h1>
    </div>
</template>

<script>
export default {
    data() {
        return {
            filmId: ''
        }
    },
    // 接收传递参数
    mounted() {
        // 当前的路由信息
        console.log(this.$route.params);
        this.filmId=this.$route.params.filmId
        
        // console.log(`通过filmId：${this.filmId}请求数据，进行展示`);
    }
}
</script>
```



## query与params区别：
### 接受对象差异
+ `this.$router.query`：参数解析为 URL 查询参数，在目标路由用`this.$route.query`访问。
+ `this.$router.params`：参数是路由路径一部分，在目标路由用`this.$route.params`访问。

### 传参方式差异
#### 字符串传参
+ `query`：无需在路由路径占位，在`to`属性以`?`后跟参数传递。
+ `params`：需在路由路径定义占位符。

#### 对象传参
+ `query`：可用`path`或`name`指定目标路由，参数作为对象属性传递。
+ `params`：必须用`name`指定目标路由，用`path`参数无法正确传递。

### 其他差异
+ `query`：参数在 URL 可见，可随时修改。
+ `params`：参数以路径形式展示，需修改路由路径改变参数。

## **6.8 ****<font style="color:rgb(0, 0, 0);">路由的props	</font>**
props配置主要是为了<u>简化query和params参数的接收</u>。让插值语法更加简洁。

<u>哪个组件接收参数，就在哪个</u><u><font style="color:#DF2A3F;">组件路由关系</font></u><u>中配置props</u>

**<font style="color:#DF2A3F;">三种写法：对象，函数，布尔值写法</font>**

+ **对象写法**：适合传递固定值（与路由参数无关，哪种都可）。
+ **函数写法**：适合动态处理路由参数（如 `params`/`query` 转换或组合）。
+ **布尔值写法**：适合简单场景，直接将 `params` 注入组件（不支持 `query`）。

```javascript

// 创建路由器对象（在路由器对象中配置路由）
const router = new VueRouter({
  routes: [
    // 路由1
    {
      name: "sub1",
      path: "/subject1/:a1/:a2/:a3",
      component: subject,
      //第一种写法，对象的写法。只能传递固定值
      // props: { 
      //   x: "章三",
      //   y: "李四",
      //   z: "王二麻",
      // },
      //第二种写法：函数式，这里的$route就是当前路由，默认有$route参数
      // props($route) {
      //   return {
      //     a1: $route.params.a1,
      //     a2: $route.params.a2,
      //     a3: $route.params.a3,
      //   };
      // },
      //第三种写法：直接将params方式收到的数据转化为props，这种方式，只针对params传参
      props:true 
    },
    {
      name: "sub2",
      path: "/subject2/:a1/:a2/:a3",
      component: subject,
    },
  ],
});
// 暴露路由器对象
export default router;
```

**subject.vue props接收，直接可以使用**

```javascript
<script setup>
    import { defineProps } from 'vue';
    import { useRoute } from 'vue-router';
    const route = useRoute()
    // 这种获取方式比较麻烦，可以通过props去简化参数的接收
    // let id = route.query.id
    // let id = route.params.id
    // console.log(id);

    // props接收数据
    // const props=defineProps(['a','b','c'])
    // const props=defineProps(['id'])//每一组params参数，都自动传给detail组件
    const props=defineProps(['id','title'])
    console.log(props);//里面封装着router.js传递的数据
</script>
```

## 6.9 router-link的replace属性
### 6.9.1、栈数据结构，先进后出，后进先出原则
<!-- 这是一张图片，ocr 内容为：元素1 元素3 入栈,压栈,PUSH 出栈,弹栈,POP 栈]元素 默认情况下, 元素3 栈当中是有 一个指针的, 这个指针默认 元素2 栈:STACK 情况下是指向 一种数据结构 栈顶元素的. 元素1 栈底元素 多 栈数据结构的特点:遵循先进后出,后进先出原则. -->
![](https://cdn.nlark.com/yuque/0/2024/png/27167233/1726124092366-d8157b29-8286-40fb-b460-56a473995640.png)

### 6.9.2浏览器的历史记录是存储在栈这种数据结构当中的。包括两种模式：
**(1) push模式（默认的）**

**(2) replace模式**

<!-- 这是一张图片，ocr 内容为：1.浏览器的历史记录是存放在栈这种数据结构当中的. 2.历史记录在存放到栈这种数据结构的时候有两种不同的模式: PUSH模式+REPLACE模式 第一种: :PUSH模式 PUSH模式 以追加的方式,入栈. 第二种:REPLACE模式 以替换栈顶元素的方式,入栈. 3.浏览器默认的模式是:PUSH模式. 4.操作浏览器上的前进和后退的时候,并不会 删除栈当中的历史记录.只是向前和向后移动指针. 前进是向上移动指针 .浏览器的历史记录在这里存放. HTTP://LOCALHOST:8080/#/HEBEI/HD HTTP://LOCALHOST:8080/#/HEBEI/HD/ HTTP://LOCALHOST:8080/#/ HTTP://LOCALHOST:8080/#/HEBEI/SJZ/ 后退是向下 移动指针. HTTP://LOCALHOST:8080/#/HEBEI HTTP://LOCALHOST:8080/#/ -->
![](https://cdn.nlark.com/yuque/0/2024/png/27167233/1726124122340-03325ca6-1cf5-4019-8cca-622662668012.png)

**(3) 如何开启replace模式：**

**a.<router-link  ****<font style="color:#DF2A3F;">:replace=”true”</font>****/>**

**b. <router-link ****<font style="color:#DF2A3F;">replace</font>**** />**

## 6.10 编程式路由导航	
需求中可能<u><font style="color:#000000;">不是通过点击超链接的方式切换路由</font></u>，也就是说不使用如何实现路由切换。

通过点击超链接的方式切换路由，这种方式，我们叫**声明式的路由导航**

通过编写代码，完成路由组件的切换，这种方式我们呢交**编程式路由导航**

声明式路由导航可以通过相关API来完成：

(1) push模式：

:::info
this.$router.push({

name : ‘’,

query : {}

})

:::

(2) replace模式：

:::info
 this.$router.replace({

name : ‘’,

query : {}

})

:::

(3) 前进：

:::info
 this.$router.forward()

:::

(4) 后退：

:::info
 this.$router.back()

:::

(5) 前进或后退几步：

:::info
this.$router.go(2) 前进两步

 this.$router.go(-2) 后退两步

:::

(6) 使用编程式路由导航的时候，需要注意：

<u>重复执行push或者replace的API时</u>，会出现以下错误：

<!-- 这是一张图片，ocr 内容为：UNCAUGHT (IN PROMISE) NAVIGATIONDUPLID PLICATED: AVOIDED REDUNDANT "/SUBJECT1/HTML/CSS/JS". LOCATION: TO NAVIGATION CURRENT (WEBPACK-INTERNAL:////NODE MODULES/VUE-RC AT CREATEROUTERERROR S:1710:15) WEBPACK-INTERNAL://///NODE CREATENAVIGATIONDUPLICATEDERROR AT JS:1698:15) ROUTER.ESM. HASHHISTORY.CONFIRMTRANSITION (WEBPACK-INTERNAL:///./NODE AT MC OUTER.ESM.JS:1960:18) HASHHISTORY.TRANSITIONTO (WEBPACK-INTERNAL:////NODE MODULES AT R.ESM.JS:1896:8) -->
![](https://cdn.nlark.com/yuque/0/2024/png/27167233/1726124233819-013ff58b-78e3-4779-9c83-a963a8fe2581.png)这个问题是因为<u>push方法返回一个Promise对象</u>，期望你在调用push方法的时候传递两个回调函数，一个是成功的回调，一个是失败的回调，如果不传就会出以上的错误。所以解决以上问题只需要给push和replace方法在参数上<font style="color:#DF2A3F;">添加两个回调即可。</font>

```javascript
<button @click="$router.forward()">前进</button>
<button @click="$router.go(1)">go-1</button>
<button @click="$router.go(2)">go-2</button>
<button @click="$router.back()">返回</button>
<button @click="$router.go(-1)">go-1</button>
<button @click="$router.go(-2)">go-2</button>
<button @click="goDetail(film.filmId)">跳转详情页</button>
//····
 goDetail(filmId) {
   //有历史记录
      this.$router.push({
        // path:'/detail',
        name: 'detail',
        params: {
          filmId: filmId,
          num2: 456
        },
         query: {
          filmId: filmId,
          num2: 456
        }
      }, () => { }, () => { })
   // 没有历史记录
      // this.$router.replace({
      //   // path:'/detail',
      //   name: 'detail',
      //   params: {
      //     filmId: filmId,
      //     num2: 456
      //   }
      // }, () => { }, () => { })
    }

```

**6.11 缓存路由组件<keep-alive>**

<u>默认情况下路由切换时，路由组件</u><u><font style="color:#DF2A3F;">会被销毁</font></u><u>。</u>有时需要在切换路由组件时保留组件（缓存起来）。

:::info
**<font style="color:#DF2A3F;"><keep-alive>//会缓存所有的路由组件</font>**

<router-view/>

**<font style="color:#DF2A3F;"></keep-alive></font>**

:::

通过添加以下3种属性，控制路由组件的缓存

<font style="color:rgb(85, 86, 102);background-color:rgb(238, 240, 244);">include - </font>[<font style="color:rgb(252, 85, 49);">字符串</font>](https://so.csdn.net/so/search?q=%E5%AD%97%E7%AC%A6%E4%B8%B2&spm=1001.2101.3001.7020)<font style="color:rgb(85, 86, 102);background-color:rgb(238, 240, 244);">或正则表达式或变成动态的属性，解析数组。只有名称</font><font style="color:#DF2A3F;background-color:rgb(238, 240, 244);">匹配的组件会被缓存</font><font style="color:rgb(85, 86, 102);background-color:rgb(238, 240, 244);">。</font>  
<font style="color:rgb(85, 86, 102);background-color:rgb(238, 240, 244);">exclude - 字符串或</font>[<font style="color:rgb(252, 85, 49);">正则表达式</font>](https://so.csdn.net/so/search?q=%E6%AD%A3%E5%88%99%E8%A1%A8%E8%BE%BE%E5%BC%8F&spm=1001.2101.3001.7020)<font style="color:rgb(85, 86, 102);background-color:rgb(238, 240, 244);">或变成动态的属性，解析数组。任何名称</font><font style="color:#DF2A3F;background-color:rgb(238, 240, 244);">匹配的组件都不会被缓存。</font>  
<font style="color:rgb(85, 86, 102);background-color:rgb(238, 240, 244);">max - </font><font style="color:#DF2A3F;background-color:rgb(238, 240, 244);">数字。最多可以缓存多少组件实例</font><font style="color:rgb(85, 86, 102);background-color:rgb(238, 240, 244);">。</font>

**注意：****<font style="color:rgb(252, 85, 49) !important;">router</font>****<font style="color:rgb(77, 77, 77);">.js 中的name和vue</font>****<font style="color:rgb(252, 85, 49);">组件</font>****<font style="color:rgb(77, 77, 77);">的name需要保持一致</font>**

```vue
<div class="mycontent">
      <!-- 告诉路由器，路由组件显示在这个位置 -->
      <!-- 1、只想news组件被缓存，其他组件切换时，还是被销毁  include-->
      <!-- 2、除了car组件，其他组件都被销毁 exclude -->
      <!-- <keep-alive include="news"> -->
      <!-- <keep-alive :include="['news']"> -->
      <keep-alive :exclude="['news']" >
        <router-view />
      </keep-alive>
    </div>
```

## 6.12 activated和deactivated	
对于普通的组件来说，有8个生命周期函数，<u>对于路由组件， 除了常规的8个，额外还有2个</u>，

`<font style="color:rgb(199, 37, 78);background-color:rgb(249, 242, 244);"><keep-alive></font>`**<font style="color:#DF2A3F;">包裹的路由组件</font>**<font style="color:rgb(77, 77, 77);">，该组件有两个特有的生命周期函数：</font>`<font style="color:rgb(199, 37, 78);background-color:rgb(249, 242, 244);">activated</font>`<font style="color:rgb(77, 77, 77);">和</font>`<font style="color:rgb(199, 37, 78);background-color:rgb(249, 242, 244);">deactivated</font>`<font style="color:rgb(77, 77, 77);">。</font>

`<font style="color:rgb(199, 37, 78);background-color:rgb(249, 242, 244);">activated</font>`<font style="color:rgb(77, 77, 77);">在路由组件</font><font style="color:#DF2A3F;">被激活时触发</font><font style="color:rgb(77, 77, 77);">；</font>

`<font style="color:rgb(199, 37, 78);background-color:rgb(249, 242, 244);">deactivated</font>`<font style="color:rgb(77, 77, 77);">在路由组件</font><font style="color:#DF2A3F;">失活时触发</font><font style="color:rgb(77, 77, 77);">。</font>

这两个钩子函数的作用是<u>捕获路由组件的激活状态。</u>

<!-- 这是一张图片，ocr 内容为：CONSOLE 月6 VUE 课程方向 FILTER TOP 每隔1S,输出工作中,切换走了之后,就显示休息中 KEEP-ACTIVE HTML SUBJECTI 6ISSUES:月6 DEFAULT LEVELS CSS JS SUBJECT2 工作中 1 MESSAGE SUBJECT1V 1USER ME... -->
![](https://cdn.nlark.com/yuque/0/2024/png/27167233/1726124477787-240b67cf-e6c7-47e3-92e2-57e86293d9e7.png)

```javascript
<template>
    <div>
        <ul class="web">
            <li><input type="checkbox">html</li>
            <li><input type="checkbox">css</li>
            <li><input type="checkbox">js</li>
        </ul>
    </div>
</template>

<script>
// 需求：当组件切换到subject1的时候，每隔1s，输出一句话‘工作中····’
// 当组件切走时，输出‘休息中····’,并解除定时器
// 正常情况下，这个功能可以用mounted和beforeDestroy去完成，但当subject1组件用keep-alive保持激活时，
// 就必须使用activated和deactivated组件了
export default {
    name: 'subject1',
    // mounted() {
    //     this.timer = setInterval(() => {
    //         console.log('工作中····');
    //     }, 1000)
    // },
    // beforeDestroy() {
    //     console.log('休息中···');
    //     clearInterval(this.timer)
    // }
    // 
    activated() {
        this.timer = setInterval(() => {
            console.log('工作中····');
        }, 1000)
    },
    deactivated() {
        clearInterval(this.timer)
        console.log('休息中');
    }
}
</script>
<style>
.web {
    background-color: pink;
}
<
```

## 6.13 路由守卫	
1、面试：有哪些路由守卫？

2、实际开发过程中，重点全局前置守卫 

不同的守卫其实就是在不同的时机，不同的位置，添加鉴权（鉴别权限）代码

### 6.13.1 全局前置守卫 	
**需求：只有当用户是admin时，允许切换到subject2路由上**

1<font style="color:#DF2A3F;">、书写位置：在创建好router之后，以及暴露router之前</font>

2、执行时机：beforeEach()中传入一个回调函数callback，可以是普通函数或箭头函数都可以，<font style="color:#DF2A3F;">在初始化时执行一次</font>，然后每一次在<font style="color:#DF2A3F;">切换任意组件之前都会被调用</font>

:::info
router.beforeEach((to, from, next)=>{ // 翻译为：每次前（寓意：每一次切换任意路由之前执行。）

// to 去哪里(**<font style="color:rgb(255, 0, 0);">to.path、to.name</font>**)

// from 从哪来

// next 继续：调用next( )

})

:::

3、callback函数有3个参数：to form next

from参数：from是一个路由对象，表示从哪里来（从那个路由切过来的），起点

to参数：to也是一个路由对象，表示到哪里去，终点

next参数：是一个函数，调用这个函数之后，<u>表示放行，可以继续向下走</u>

4、<u>给路由对象添加自定义属性的话，需要在</u><u><font style="color:#DF2A3F;">路由对象的meta</font></u><u>（路由元）中定义</u>

如果路由组件较多。to.path会比较繁琐，可以考虑给需要鉴权的路由扩展一个布尔值属性，可以通过路由元来定义属性：**<font style="color:rgb(255, 0, 0);">meta:{isAuth : true}</font>**

```javascript
// 创建路由器对象(配置一个个路由)
// 导入vue-router插件
import VueRouter from "vue-router";
// 导入组件
import subject1 from "../pages/subject1.vue";
import subject2 from "../pages/subject2.vue";

// 创建路由器对象（在路由器对象中配置路由）
const router = new VueRouter({
  routes: [
    // 路由1
    {
      name: "sub1",
      path: "/subject1",
      component: subject1,
    },
    // 路由2
    {
      name: "sub2",
      path: "/subject2",
      component: subject2,
      // 带有isAuth属性，并且属性值为ture的，需要鉴权
      meta: { isAuth: true },
    },
  ],
});
// 全局前置路由守卫
// 1、书写位置：在创建好router之后，以及暴露router之前
// 2、执行时机：beforeEach()中传入一个回调函数callback，可以是普通函数或箭头函数都可以，
// 在初始化时执行一次，然后每一次在切换任意组件之前都会被调用
// 3、callback函数有3个参数：to form next
// from参数：from是一个路由对象，表示从哪里来（从那个路由切过来的），起点
// to参数：to也是一个路由对象，表示到哪里去，终点
// next参数：是一个函数，调用这个函数之后，表示放行，可以继续向下走
// 4、给路由对象添加自定义属性的话，需要在路由对象的meta（路由元）中定义
router.beforeEach((to, from, next) => {
  // console.log(to);
  // 需求：只有当用户是admin时，允许切换到subject2路由上
  let loginName = "admin1";
  //1、 判断路由组件的name
  // if (to.name == "sub2") {
  //2、 判断路由组件的path
  // if (to.path == "/subject2") {
  // 3、可以在路由对象中自定义个属性，需要鉴权的组件都加上ture，
  //不需要鉴权的，则是undefined，是false
  if (to.meta.isAuth) {
    if (loginName == "admin") {
      next();
    } else {
      alert("对不起，你没有权限");
    }
  } else {
    next();
  }
});

// 暴露路由器对象
export default router;
```

### 6.13.2 全局后置守卫	
**需求： 每次切换完路由组件后，更换title标题栏，在meta中设置title属性属性值**

1、书写位置：router/index.js文件中拿到router对象，<font style="color:#DF2A3F;">在创建router对象之后，暴露router对象之前写</font>

2、执行时机<font style="color:#DF2A3F;">：初始化执行一次，以后每一切换完任意路由之后</font>

3、参数：只有to,from,没有next，因为没有必要了

:::info
router.afterEach((to, from)=>{ // 翻译为：每次后（寓意：每一次切换路由后执行。）

// 没有 next

**<font style="color:#DF2A3F;">document.title = to.meta.title // 通常使用后置守卫完成路由切换时title的切换。</font>**

})

:::

该功能也可以使用前置守卫实现：

```javascript
//需求： 每次切换完路由组件后，更换title标题栏，在meta中设置title属性属性值
// 书写位置：在创建router对象之后，暴露router对象之前
// 执行时机：初始化执行一次，以后每一切换完任意路由之后
// 参数：只有to,from,没有next，因为没有必要了
router.afterEach((to, from) => {
  document.title = to.meta.title || "欢迎使用";
});
```

### 6.13.3 局部路由守卫之path守卫（独享守卫）	
beforeEnter(){} 

书写位置：<font style="color:#DF2A3F;">写在route对象中,与path同级</font>

执行时机：**<font style="color:#DF2A3F;">进入到对应路由组件前被调用</font>**

参数：to,from,next

<u>注意：没有afterEnter</u>

```javascript
 // 路由2
    {
      name: "sub2",
      path: "/subject2",
      component: subject2,
      // 带有isAuth属性，并且属性值为ture的，需要鉴权
      // meta: { isAuth: true, title: "subject2" },
      //进入到对应路由组件前被调用 
      beforeEnter(to, from, next) {
        let loginName = "admin1";
        if (loginName == "admin") {
          next();
        } else {
          alert("对不起，没有权限");
        }
      },
    },
```

### 6.13.4 局部路由守卫之component守卫（组件守卫）	
书写位置：<font style="color:#DF2A3F;">写在路由组件当中，也就是xxx.vue文件中</font>

执行时机： **<font style="color:#DF2A3F;"> beforeRouteEnter	进去路由组件之前执行</font>**

**<font style="color:#DF2A3F;"> 		 beforeRouteLeave	离开路由组件之前执行 </font>**

注意：只有路由组件才有这两个钩子。

```javascript
<script>
export default {
    name: 'subject2',
    // 进去路由组件之前执行
    beforeRouteEnter(to, from, next) {
        console.log(`进入路由组件之前“${to.meta.title}`);
        next()
    },
    // 离开路由组件之前执行
    beforeRouteLeave(to, from, next) {
        console.log(`离开路由组件之前“${from.meta.title}`);
        next()

    }
}
</script>
```

## 6.14 前端项目打包
源代码xxx.vue对于浏览器来说，浏览器只认识html，css,js

xxx.vue需要使用项目构建工具完成打包编译

例如，可以使用webpack来打包编译，生成html，css，js,这些浏览器才能识别    

### 6.14.1、npm run build
1.、<u>路径中#后面的路径称为hash。这个hash不会作为路径的一部分发送给服务器</u>：

(1) http://localhost:8080/vue/bugs/#/a/b/c/d/e （真实请求的路径是：http://localhost:8080/vue/bugs）



2、路由的两种路径模式： hash模式和history模式的区别与选择

(1) hash模式

① 路径中带有#，<u>不美观</u>。

② <u>兼容性好</u>，低版本浏览器也能用。

③ 项目上线<u>刷新地址不会出现404</u>。

④ <u>第三方app校验严格，可能会导致地址失效</u>。

(2) history模式

① 路径中没有#，<u>美观</u>。

② <u>兼容性稍微差一些</u>。

③ 项目上线后，<u>刷新地址的话会出现404问题</u>。需要后端人员配合可以解决该问题。



3.、默认是hash模式，如何开启history模式

(1) router/index.js文件中，<u><font style="color:#DF2A3F;">在创建路由器对象router时添加一个mode配置项：</font></u>

<!-- 这是一张图片，ocr 内容为：INDEX.JS JS VUE_CLI_PRO > SRC >ROUTER > IS INDEXJS >[ALROUTER 1 //创建路由器对象(配置一个个路由) 2  // 导入VUE-ROUTER插件 " IMPORT VUEROUTER FROM "VUE-ROUTER"; 3 //导入组件 4  IMPORT SUBJECT1 FROM 5 "../PAGES/SUBJECT1.VUE"; ,./PAGES/SUBJECT2.VUE"; 6  IMPORT SUBJECT2 FROM 7 8 //创建路由器对象(在路由器对象中配置路由) 9 ROUTER - NEW VUEROUTER( CONST MODE:'HISTORY',/默认是HASH模式,有#,HISTORY, 没有# 10 11 ROUTES:[ //路由1 12 予 13 -->
![](https://cdn.nlark.com/yuque/0/2024/png/27167233/1726124799437-73e8d7c2-efe3-46f0-840a-510d95f204f6.png)

4. 项目打包

(1) 将Xxx.vue全部编译打包为HTML CSS JS文件。

(2) npm run build

<!-- 这是一张图片，ocr 内容为：PACKAGE.JSON @ PACKAGE.JSON VUECLIPRO 1 234  "NAME": "VUE_CLI_PRO",  "VERSION": "0.1.0",  "PRIVATE": TRUE, 调试 5 SCRIPTS" I NPM RUN BUILD 6 'SERVE":"VUE-CLI LISERVICE SERVE 7 "BUILD": "VUE-CLI-SERVICE BUILD", 8 LINT": LINT "VUE-CLI-SERVICE 9 了, -->
![](https://cdn.nlark.com/yuque/0/2024/png/27167233/1726124818707-48f3d13d-c13e-4754-8868-69ec602d269a.png)

<!-- 这是一张图片，ocr 内容为：19 </KEEP-ALIVE> DIST 注释 20 CSS IS 调试控制台 终端 端口 输出 注释 问题 FAVICON.ICO COMPILED SUCCESSFULLY IN 2542MS DONE INDEX.HTML FILE SIZE IPPED NODE_MODULES DIST/JS/CHUNK-VENDORS.8FFC5389.JS 39.95 115.27 KIB PUBLIC DIST/JS/INDEX.E66CA9A6.JS 1.36 KI 3.15 KIB SRC DIST/CSS/INDEX.17D3E4E8.CSS 0.11 KI 0.14 KIB ASSETS IMAQES AND OTHER TYPES OF ASSETS OMITTED. COMPONENTS 24Z - HASH:9B9842AA5FC5EFD4 - TIME: 2542MS BUILD AT:2024-04-04T13:28:00.624Z PAGES T DIRECTORY IS READY TO BE DEPLOYED. BUILD COMPLETE.THE DONE DIST D INSTRUCTIONS AT HTTPS://CLI.VUEJS.ORG/GUIDE/DEPLOYMENT.HTM ROUTER INFO CHECK OUT DEPLOYMENT INDEX.JS -->
![](https://cdn.nlark.com/yuque/0/2024/png/27167233/1726124824692-e8013724-a0c2-4b9b-9b6d-4afc0333b751.png)



## <font style="color:rgb(6, 6, 7);">UI 组件库</font>
### <font style="color:rgb(6, 6, 7);">移动端</font>
+ <font style="color:rgb(6, 6, 7);">Vant：</font>[https://youzan.github.io/vant/](https://youzan.github.io/vant/)
+ <font style="color:rgb(6, 6, 7);">Cube UI：</font>[https://didi.github.io/cube-ui/](https://didi.github.io/cube-ui/)
+ <font style="color:rgb(6, 6, 7);">Mint UI：</font>[http://mint-ui.github.io/](http://mint-ui.github.io/)

### <font style="color:rgb(6, 6, 7);">PC 端</font>
+ <font style="color:rgb(6, 6, 7);">Element UI：</font>[https://element.eleme.cn/](https://element.eleme.cn/)
+ <font style="color:rgb(6, 6, 7);">iView UI：</font>[https://www.iviewui.com/](https://www.iviewui.com/)
