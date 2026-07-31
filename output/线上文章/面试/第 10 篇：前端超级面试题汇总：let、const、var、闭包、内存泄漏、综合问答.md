---
title: "第 10 篇：前端超级面试题汇总：let/const/var、闭包、内存泄漏、综合问答"
slug: "legacy-a87b199b-a87b199b"
summary: "大型前端综合面试题汇总，覆盖 let/const/var、闭包、内存泄漏、项目经历和综合问答，适合作为最后集中复习资料。"
category: "面试"
tags:
  - "前端面试"
  - "JavaScript"
  - "Vue"
  - "闭包"
  - "内存泄漏"
  - "综合题库"
status: "published"
sortOrder: 100
cover: ""
originalId: "6a2d29208a2b1c68f2cac692"
originalSlug: "legacy-a87b199b-a87b199b"
originalStatus: "published"
exportedAt: "2026-07-31T03:42:38.792Z"
---
### 1. let、var、const 的区别
| 特性 | var | let | const |
| --- | --- | --- | --- |
| 作用域 | 函数作用域 | 块级作用域 | 块级作用域 |
| 变量提升 | 是 | 否（暂时性死区） | 否（暂时性死区） |
| 重复声明 | 允许 | 不允许 | 不允许 |
| 全局对象属性 | 是 | 否 | 否 |
| 初始值 | 可选 | 可选 | 必须初始化 |
| 值可变性 | 可变 | 可变 | 不可变（引用类型内部可修改） |

### 2. 闭包是什么
闭包是函数和其词法环境的组合，允许函数访问其定义时所在作用域中的变量，即使该函数在其原始作用域之外执行。

**核心特点：**

+ 函数嵌套函数
+ 内部函数可以访问外部函数的变量
+ 外部函数的变量会持久保存在内存中

```javascript
// 闭包示例
function createCounter() {
  let count = 0;
  
  return {
    increment: () => count++,
    decrement: () => count--,
    getCount: () => count
  };
}

const counter = createCounter();
counter.increment();
console.log(counter.getCount()); // 1
```

### 3. 如何防止内存泄漏
**常见内存泄漏场景及解决方案：**

| 场景 | 解决方案 |
| --- | --- |
| 未清理的 DOM 引用 | 移除 DOM 元素后将其引用设为 null |
| 未清除的事件监听器 | 组件卸载时使用 `removeEventListener` 移除监听器 |
| 未清理的定时器 | 组件卸载时使用 `clearInterval`/`clearTimeout` 清除定时器 |
| 闭包中的循环引用 | 避免在闭包中持有不必要的对象引用 |
| 全局变量累积 | 减少全局变量使用，必要时手动释放（设为 null） |
| Vue 组件中的内存泄漏 | 在 `beforeUnmount` 生命周期中清理自定义事件、定时器等 |


### 4. Vue2 和 Vue3 的区别、Vue3 的优势

#### Vue2 的缺点

+ 占用内存高，虚拟 DOM 全量对比导致不必要的组件重渲染，相对vue3 反应速度慢。
+ Options API 导致逻辑分散：同一功能的代码被拆分到 data、methods、mounted 等选项中，维护复杂。
+ 动态属性监听缺失：无法自动检测对象属性的新增/删除，必须使用 Vue.set/Vue.delete。
+ 数组监听缺陷：直接通过索引修改数组元素（如 arr[0] = 1）或改变长度（arr.length = 0）不会触发更新。
+ 深层对象性能损耗：深度监听嵌套对象需递归遍历，影响性能。
+ TypeScript 支持薄弱

#### Vue3 优势

**1. 响应式系统重构（Proxy）**

+ 支持动态增删属性、监听 Map/Set 等复杂结构。
+ 数组索引修改可直接触发更新，无需特殊。

**2. 源码的升级**

+ Vue3 可以更好的支持 TypeScript
+ 性能全面优化
+ 编译优化：静态节点提升（HoistStatic）减少重复创建；Patch Flag 标记动态节点，加速 Diff 过程。
+ Tree-shaking：未使用的模块（如 v-model 指令）不打包，减小产物体积。

**3. API 风格与逻辑复用**

+ Vue2 以 Options API 为主，代码往往按 data、methods、computed、watch 分散组织。
+ Vue3 增加 Composition API，可以按“功能”组织逻辑，更适合复杂组件的拆分与复用。
+ Vue2 常见复用方式是 mixins、高阶组件。
+ Vue3 更推荐组合式函数（composables），复用逻辑时来源更清晰，也更方便 TypeScript 推断。

**4. TypeScript 支持**

+ Vue2：通常需要借助额外生态补充类型能力，`this` 的类型推导也相对麻烦。
+ Vue3：组合式 API、`defineComponent`、`<script setup>` 等都更适合 TypeScript，类型推断更自然。

```typescript
import { defineComponent, ref } from 'vue';

export default defineComponent({
  setup() {
    const count = ref<number>(0);
    const increment = () => count.value++;
    return { count, increment };
  }
});
```

**5. 内置能力与生态升级**

+ 新增 Fragment、Teleport、Suspense 等能力，组件组织更灵活。
+ 生命周期在组合式 API 中改为 `onMounted`、`onUnmounted` 这类函数式写法。
+ `<script setup>` 语法糖减少样板代码，开发体验更好。

| 特性 | Vue2 | Vue3 | 优势说明 |
| --- | --- | --- | --- |
| 性能 | 中等 | 快 1.3-2 倍 | 基于 Proxy 的响应式系统更高效 |
| 体积 | 完整版约 33KB | 约 10KB | Tree-shaking 支持 |
| Composition API | Options API | Composition API | 更好的逻辑组织和复用 |
| TypeScript 支持 | 有限支持 | 一流支持 | 完整的类型推断 |
| 多根节点组件 | 不支持 | 支持 | 更灵活的模板结构 |
| Fragment/Teleport | 无 | 支持 | 更强大的组件功能 |
| 自定义渲染器 API | 有限 | 增强 | 更易扩展 |

#### 常见细节补充

**1. 生命周期变化**

| 变更点 | Vue2 | Vue3 |
| --- | --- | --- |
| 初始化阶段 | beforeCreate、created | 改由 `setup()` 承担主要初始化逻辑 |
| 挂载阶段 | beforeMount、mounted | onBeforeMount、onMounted |
| 更新阶段 | beforeUpdate、updated | onBeforeUpdate、onUpdated |
| 卸载阶段 | beforeDestroy、destroyed | onBeforeUnmount、onUnmounted |

**2. 部分语法变化**

+ **keyCode 修饰符**：

```vue
<!-- Vue2 -->
<input @keyup.13="submit" />

<!-- Vue3 -->
<input @keyup.enter="submit" />
```

+ **.native 修饰符**：

```vue
<!-- Vue2 -->
<MyComponent @click.native="handleClick" />

<!-- Vue3 -->
<MyComponent @click="handleClick" />
```

**3. 自定义指令**

Vue2 自定义指令

```javascript
Vue.directive('focus', {
  inserted: function (el) {
    el.focus();
  }
});
```

Vue3 自定义指令

```javascript
const app = createApp(App);
app.directive('focus', {
  mounted: function (el) {
    el.focus();
  }
});
```

**4. 过渡类名变化**

| 阶段 | Vue2类名 | Vue3类名 |
| --- | --- | --- |
| 进入开始 | v-enter | v-enter-from |
| 进入活跃 | v-enter-active | v-enter-active |
| 进入结束 | v-enter-to | v-enter-to |
| 离开开始 | v-leave | v-leave-from |
| 离开活跃 | v-leave-active | v-leave-active |
| 离开结束 | v-leave-to | v-leave-to |

**5. 全局 API 变化**

| 功能 | Vue2 | Vue3 |
| --- | --- | --- |
| 创建应用 | new Vue() | createApp() |
| 全局组件/指令 | Vue.component() | app.component() |
| 全局配置 | Vue.config | app.config |
| 原型扩展 | Vue.prototype.$http | app.config.globalProperties.$http |

### 5. 防抖和节流

#### 防抖（Debounce）
```javascript
function debounce(fn, delay) {
  let timer = null;
  return function (...args) {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => {
      fn.apply(this, args);
    }, delay);
  };
}
```

#### 节流（Throttle）
```javascript
function throttle(fn, delay) {
  let lastTime = 0;
  return function (...args) {
    const now = Date.now();
    if (now - lastTime >= delay) {
      fn.apply(this, args);
      lastTime = now;
    }
  };
}
```

### 5. 如何实现 WebSocket 心跳机制
**心跳机制实现方案：**

```javascript
// WebSocket 心跳实现
function createWebSocket(url) {
  const ws = new WebSocket(url);
  let heartbeatInterval;
  
  // 连接成功
  ws.onopen = () => {
    console.log('WebSocket 已连接');
    
    // 启动心跳 (每 30 秒发送一次)
    heartbeatInterval = setInterval(() => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ type: 'heartbeat' }));
      }
    }, 30000);
  };
  
  // 接收消息
  ws.onmessage = (event) => {
    const data = JSON.parse(event.data);
    if (data.type === 'pong') {
      console.log('收到心跳响应');
    }
  };
  
  // 错误处理
  ws.onerror = (error) => {
    console.error('WebSocket 错误:', error);
    clearInterval(heartbeatInterval);
  };
  
  // 连接关闭
  ws.onclose = () => {
    console.log('WebSocket 已关闭');
    clearInterval(heartbeatInterval);
    // 可添加重连逻辑
  };
  
  return ws;
}
```

### 6. WebWorker 是什么，使用场景
**WebWorker 概念：**

在浏览器后台运行的 JavaScript 线程，与主线程分离，不会阻塞 UI 渲染。

**Web Worker** 是浏览器提供的 JavaScript 多线程解决方案，允许在后台线程中运行脚本，独立于主线程执行，比如在处理大量数据如10万条数据时，执行时间远快于 js 主线程。

**使用场景：**

+ CPU 密集型计算（图像/视频处理、加密算法）
+ 大数据处理（大型数据集分析）
+ 高频率轮询（实时数据监控）
+ 复杂数学计算（物理引擎、3D 渲染）
+ 长时间运行任务（文件处理、数据压缩）

```javascript
// 主线程
const worker = new Worker('worker.js');

worker.postMessage({ data: largeArray });

worker.onmessage = (event) => {
  console.log('处理结果:', event.data.result);
};

// worker.js
self.onmessage = (event) => {
  const result = processData(event.data.data);
  self.postMessage({ result });
};

function processData(data) {
  // 复杂计算逻辑...
  return processedData;
}
```

### 7. 前端安全问题解决方案
以下是补充了更详细原因说明的前端安全问题表格：

| 安全威胁 | 详细原因 | 处理方案 |
| --- | --- | --- |
| XSS 攻击（跨站脚本攻击） | 恶意用户通过表单提交或 URL 参数注入 JavaScript 代码，利用 `innerHTML` 直接渲染、未过滤的用户输入或未设置 CSP 策略，导致脚本在受害者浏览器中执行，窃取敏感信息或执行恶意操作。 | 1. 使用 `textContent` 替代 `innerHTML`   2. 使用 DOMPurify 等库对用户输入进行转义过滤   3. 通过 HTTP 头或 `<meta>` 标签设置 CSP 策略限制可执行脚本来源 |
| CSRF 攻击（跨站请求伪造攻击） | 攻击者诱导已登录用户访问恶意网站，利用浏览器已保存的 Cookie 信息，伪装成合法用户向目标网站发送恶意请求，执行敏感操作（如转账、修改密码）。 | 1. 表单中添加 CSRF Token 并验证   2. 设置 Cookie 的 `SameSite` 属性为 `Strict/Lax`   3. 后端验证请求来源的 `Referer/Origin` 头 |
| 点击劫持 | 攻击者通过 CSS 透明度或 iframe 覆盖，诱导用户在不知情的情况下点击被劫持页面的敏感按钮（如支付、授权），利用合法用户的身份执行操作。 | 1. 设置 `X-Frame-Options: DENY/SAMEORIGIN`   2. 添加 frame-busting 脚本检测并阻止 iframe 嵌套 |
| 数据泄露 | 1. 明文传输数据（HTTP）被中间人截获   2. `localStorage` 存储敏感信息（如 Token）被 XSS 攻击窃取   3. 未设置 `HttpOnly` 的 Cookie 被 JavaScript 脚本读取 | 1. 启用 HTTPS 加密传输   2. 敏感数据加密后存储或避免使用 `localStorage`   3. 设置 Cookie 的 `HttpOnly` 和 `Secure` 属性 |
| 第三方依赖漏洞 | 使用过时或存在已知漏洞的第三方库（如 jQuery、React），攻击者利用这些漏洞执行代码注入、信息泄露或 DoS 攻击。 | 1. 定期执行 `npm audit` 扫描依赖漏洞   2. 使用 `npm audit fix` 自动修复或手动升级依赖   3. 锁定依赖版本防止意外降级 |
| 不安全 API 调用 | 1. 未配置 CORS 策略导致跨域请求泄露数据   2. 未验证请求权限导致越权访问   3. 无速率限制导致接口被暴力破解或 DoS 攻击 | 1. 后端设置 `Access-Control-Allow-Origin` 白名单   2. JWT 或 Session 验证用户权限   3. 使用 rate-limit 中间件限制请求频率 |
| 密码安全 | 1. 密码明文传输被截获   2. 浏览器自动填充功能泄露密码   3. 前端未做密码强度校验导致弱密码 | 1. 使用 HTTPS 传输密码   2. 输入框设置 `autocomplete="new-password"` 禁用自动填充   3. 前端校验密码强度（长度、复杂度）并在后端用 bcrypt 加密存储 |

## 个人情况问题（参考回答）

### 8. 毕业时间
> "我于 [2025] 年 [7]月 毕业于 [铜陵学院]，获得 [计算机科学与技术] 学位。"

### 9. 上一家公司规模
技术部：20多人 3人前端 10个左右后端 java  ui设计1-2 产品2个  测试 技术经理  项目经理

> "我上一家公司 [公司名称] 是一家中等规模的科技企业，团队人数约 [23] 人，其中技术团队占比约 [35]%。"

### 10. 上一家公司业务
互联网公司-政府相关（交通勤控 医疗  工地 地图相关GIS  ）给我们做

> "[公司名称] 专注于 [行业领域]，主要提供 [具体产品或服务]，我所在的团队负责 [具体职责] 开发。"

### 11. 项目开发流程
产品经理/产品 -客户

项目评审会

UI设计师-设计出设计稿

蓝湖

前端（apifox postman）

后端（apifox postman）

测试（禅道）

上线

### 12. 社保缴纳情况
> "是的，我上一家公司按照国家规定为我缴纳了五险一金。"

让公司折现的缺钱  一个月多给我700块钱

考了二建挂靠到了建筑公司  社保不需要买

### 1. 为什么从上家离职？
离职原因多种多样，如个人职业发展规划，可能是希望寻求新的挑战、学习新的技术或进入更感兴趣的行业领域；工作环境方面，或许与团队氛围、公司文化不契合，或工作与生活平衡难以达成；职业晋升方面，也许是上升空间有限，无法获得理想的晋升机会和薪酬待遇等。不过，回答此类问题时，应保持客观积极，避免对前雇主过度负面评价。

### 2. MySQL 中的搜索语句有哪些？
+ **`SELECT` 语句** ：是最基本的搜索语句，用于从数据库中选择数据。例如 `SELECT column1, column2 FROM table;` 。
+ **`WHERE` 子句** ：用于对搜索结果进行筛选，条件匹配的记录才会被返回，如 `SELECT column1 FROM table WHERE condition;` 。
+ **`LIKE` 操作符** ：用于模糊搜索，常与 `%`（匹配任意数量字符）和 `_`（匹配单个字符）搭配使用，像 `SELECT column FROM table WHERE column LIKE '%pattern%';` 。
+ **`BETWEEN`** ：用于在范围内搜索数据，例如 `SELECT column FROM table WHERE column BETWEEN value1 AND value2;` 。
+ **`IN` 操作符** ：可在多个离散值中进行搜索，如 `SELECT column FROM table WHERE column IN (value1, value2, ...);` 。

### 3. 后端的数据为什么要你来操作呢？没有后端人员吗？
在一些小型项目团队或特定工作流程中，可能因人员配置有限，前端开发人员需要协助处理后端数据操作，以保证项目进度和功能实现。或者在前后端职责划分不明确的情况下，前端人员会参与数据操作，但这并不意味着没有后端人员，只是工作分配使然。

### 4. 提高查询效率用那些方式？
+ **创建索引** ：通过在经常查询的列上建立索引（如 B 树索引、哈希索引等），加快数据检索速度。
+ **优化查询语句** ：避免使用 `SELECT *`，只选取需要的列；减少不必要的子查询和复杂连接操作，合理使用连接条件和筛选条件。
+ **对数据库表进行分区** ：将大表拆分成更小、更易管理的分区，便于查询优化器快速定位数据。
+ **定期更新统计信息** ：帮助数据库优化器生成更优的查询执行计划。
+ **合理设置缓存策略** ：对于频繁查询且不经常变动的数据，利用缓存减少对数据库的直接访问。

### 6. Vue 数据绑定实现原理是什么？具体怎么实现的？
+ **Vue2** ：通过 Object.defineProperty 方法对数据对象的属性进行劫持，当数据发生变化时，会通知观察者，进而更新视图。对于 DOM 元素，通过指令（如 v-model、v-bind 等）与数据建立关联，实现双向或单向绑定。
+ **Vue3** ：则采用 Proxy 代替 Object.defineProperty，Proxy 可以更全面地监听对象及其嵌套属性的变化，当数据变动时，触发相应的更新函数，实现数据与视图的同步更新。
+ 如果面试官继续追问实现细节，可以补充：Vue2 主要依赖 `Object.defineProperty` 劫持 getter/setter；Vue3 则主要依赖 `Proxy`，两者本质都是“拦截数据访问与修改，再触发依赖更新”。

### 7. TodoList 具体怎么实现的？
+ 首先搭建项目框架，使用 Vue 脚手架创建项目。
+ 创建一个输入框和添加按钮，用于输入待办事项文本并通过点击按钮或按回车键添加事项到列表中。
+ 使用一个数组存储待办事项列表，在 Vue 实例的数据对象中定义该数组。
+ 利用 v-for 指令循环渲染待办事项列表，展示在页面上。
+ 为每个待办事项添加复选框，通过 v-model 双向绑定其完成状态，根据状态动态添加样式（如删除线）来区分已完成和未完成事项。
+ 实现删除功能，为每个事项添加删除按钮，点击时通过 splice 方法从数组中移除对应事项。
+ 可以添加过滤功能，通过按钮切换显示全部、已完成或未完成的待办事项，利用计算属性根据当前过滤状态返回相应的事项列表用于渲染。

### 8. JS 中查找元素有哪些？
+ `document.getElementById(id)` ：根据元素的 id 属性值查找单个元素。
+ `document.getElementsByClassName(name)` ：通过类名查找元素，返回一个 HTML 集合。
+ `document.getElementsByTagName(name)` ：依据标签名查找元素，返回包含所有匹配标签的节点列表。
+ `document.querySelector(selector)` ：使用 CSS 选择器查找文档中匹配的第一个元素。
+ `document.querySelectorAll(selector)` ：同样使用 CSS 选择器，但返回文档中所有匹配的元素节点列表。

### 9. 了解过属性选择器吗？
CSS 中的属性选择器根据元素的属性及属性值来选择 HTML 元素。例如，`[attribute]` 匹配具有指定属性的元素，不管属性值是什么；`[attribute=value]` 匹配属性值等于指定值的元素；`[attribute^=value]` 匹配属性值以指定值开头的元素；`[attribute$=value]` 匹配属性值以指定值结尾的元素等。

### 10. 你做的 app 能否在应用商店查到？
能啊  最近可能下架了

### 11. 小程序发布账号是你自己的吗？发布流程是你发布的吗？发布流程？
不是  公司的   是的

发布流程大致为：注册小程序账号 → 完善小程序信息（包括名称、简介、类目等）→ 开发小程序（使用开发工具编写代码）→ 在开发工具中上传代码至小程序后台 → 提交审核（审核内容包括但不限于内容合规性、功能性、界面等）→ 审核通过后发布上线。

### 12. 你的期望薪资多少？
合肥  应届生6k  往届生 6-7k  期望7k及以上  

上海北京杭州：应届生 8k   期望10k及以上   

南京：应届生 6.5k 7k   往届生7k 7.5k  期望8k及以上

### 13. 你打算长期在合肥发展吗？
是的准备长期在这里发展

### 14. 面试过几家？有 offer 吗？
3-4家了  有啊  我觉得您这边公司不错/那家公司的业务做不是特别擅长

### 3. 你在数据库中如何简单的建个表？

在 MySQL 中，可以使用 `CREATE TABLE` 语句来创建表，基本语法如下：

```sql
CREATE TABLE 表名 (
  字段名1 数据类型(长度) [约束条件],
  字段名2 数据类型(长度) [约束条件],
  ...
);
```

### 4. 你怎么使用webpack进行打包？

### 6. 你觉得vue2有什么优点？
+ **丰富的组件生态** ：由于 Vue 2 的广泛应用和长期积累，拥有大量的第三方组件库，如 Element UI、Vuetify 等，这些组件可以帮助开发者快速构建用户界面，提高开发效率。
+ **良好的性能表现** ：Vue 2 采用虚拟 DOM 技术，能够高效地更新界面，通过对比新旧虚拟 DOM，精准地找到需要更新的节点进行局部更新，减少了对 DOM 的操作，从而提高了应用的性能。
+ **简洁易懂的语法** ：Vue 2 的语法简单直观，如数据绑定、指令系统等，使得开发者能够快速上手，并且降低了开发门槛，便于团队成员之间的协作和代码维护。
+ **灵活的双向数据绑定** ：通过 `v-model` 指令实现了双向数据绑定，使得数据和视图之间的同步更加方便快捷，减少了开发者在数据同步方面的代码编写量，提高了开发效率。
+ **渐进式框架** ：Vue 2 可以逐步引入到项目中，开发者可以根据项目需求选择性地使用 Vue 2 的功能，既可以将其作为一个完整的框架来构建单页应用，也可以仅使用其部分功能来增强现有页面的交互性。

### 8. 讲一下tree shaking
简称树落，通常用于描述移除JavaScript 上下文中的死代码，只保留有用的代码，这样就能缩减构建包的体积。Tree Shaking 是一种在构建过程中对代码进行优化的技术，主要用于消除 JavaScript 中的未使用代码，从而减小最终打包文件的大小，提高应用的加载性能。

### 9. 了解php吗？
了解  脚本语言  主要用于服务器端开发，可以嵌入到 HTML 中，用于生成动态网页内容。

### 10. 你觉得你后面学一些其它的语言可以接受吗？
可以接受我学习能力也不错也喜欢学新的技术

### 12. 讲一下你了解的api
+ **组件API**：选项式（含data、methods）与组合式（setup+ref/reactive）。  
+ **响应式**：ref（基本类型）、reactive（对象/数组）、watch监听变化。  
+ **生命周期**：onMounted（挂载）、onUpdated（更新）、onUnmounted（卸载）。  
+ **路由**（Vue Router）：配置路由、router.push导航、useRouter获取实例。  
+ **状态管理**（Vuex）：state存状态、mutations修改、actions异步、useStore调用。  
+ **高级特性**：自定义指令、插件机制、provide/inject跨层级传值。  
+ **Vue 3新增**：createApp创建应用、Teleport跨节点渲染、Suspense处理异步组件。

### 1. 说一说 Vue 中的导航守卫
Vue Router 提供的导航守卫可分为全局守卫、路由独享守卫和组件内守卫。

+ **全局守卫** ：通过 `router.beforeEach` 注册全局前置守卫，在导航确认前对路由判断，可用于全局权限控制。例如：

```javascript
router.beforeEach((to, from, next) => {
  if (to.meta.requiresAuth && !isAuthenticated) {
    next('/login')
  } else {
    next()
  }
})
```

+ **路由独享守卫** ：在路由配置中，每个路由可配 `beforeEnter` 守卫，对特定路由单独权限控制或数据验证.
+ **组件内守卫** ：在路由组件内可定义 `beforeRouteEnter`（导航进入组件时调用，此时组件实例未创建，无法访问 this）、`beforeRouteUpdate`（动态路由参数更新时调用）和 `beforeRouteLeave`（导航离开组件时调用）等守卫，用于组件级别导航控制，如离开页面前提醒用户保存数据.

### 2. 是否了解 React，能说说 Vue 和 React 的区别吗

#### 对 React 的了解

React 是用于构建用户界面的 JavaScript 库，采用组件化开发，基于虚拟 DOM 技术提升渲染效率，常与 Redux 等状态管理库和 React Router 等路由库配合构建单页应用。

#### Vue 和 React 的区别
+ **核心理念方面** ：
    - **Vue** ：强调渐进式开发，易上手，通过指令、模板快速构建界面，核心是数据绑定和组件化，适合各类规模项目，中小项目开发快.
    - **React** ：注重组件复用和灵活，用 JSX 语法将 JavaScript 和 HTML 结合，以 JavaScript 化方式构建 UI，适合大型复杂应用，自定义和组合组件灵活.
+ **数据绑定方式** ：
    - **Vue** ：提供双向数据绑定，`v-model` 指令实现数据视图同步更新，适合快速开发交互强的表单界面。
    - **React** ：本身单向数据流，配合 Redux 等状态管理工具，状态从上到下传递，数据流向可控可预测，利于大型应用状态管理，但需手动处理数据回传，代码量相对多。
+ **学习曲线方面** ：
    - **Vue** ：语法简洁，文档清晰，初学者易入门掌握，能快速应用实际项目，学习成本低。
    - **React** ：需掌握 JSX 语法、虚拟 DOM、组件生命周期等概念及配合工具库，学习曲线陡，但掌握后可灵活应对复杂开发需求。
+ **生态系统方面** ：
    - **Vue** ：丰富组件库，如 Element UI，社区活跃，插件多，助力项目开发。
    - **React** ：庞大生态系统，大量第三方库和框架支持，与 Node.js 后端技术结合紧密，适合构建各类 Web 应用，大型企业级应用广泛应用。

### 4. 深浅拷贝，并说说如何实现
+ **浅拷贝** ：
    - **定义** ：只对对象或数组进行一层复制，新对象或数组引用原始子元素，原始子元素变更，浅拷贝数据受影响。
    - **实现方式** ：用 `Object.assign()` 方法、展开运算符（`...`）或数组的 `slice()` 方法等。例如：

```javascript
const obj1 = { a: 1, b: { c: 2 } };
const obj2 = Object.assign({}, obj1);
obj2.b.c = 3;
console.log(obj1.b.c); // 输出 3
```

+ **深拷贝** ：
    - **定义** ：对对象或数组及其子元素递归复制，新数据与原始数据独立，修改新数据不影响原始数据。
    - **实现方式** ：可用 JSON.parse(JSON.stringify()) 方法（不适用含循环引用、函数、undefined 等特殊值情况），或借助递归函数实现深拷贝。例如：

```javascript
function deepClone(obj) {
  if (typeof obj !== 'object' || obj === null) return obj;
  if (obj instanceof Array) {
    const newArr = [];
    for (let i = 0; i < obj.length; i++) {
      newArr.push(deepClone(obj[i]));
    }
    return newArr;
  } else {
    const newObj = {};
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        newObj[key] = deepClone(obj[key]);
      }
    }
    return newObj;
  }
}
const obj1 = { a: 1, b: { c: 2 } };
const obj2 = deepClone(obj1);
obj2.b.c = 3;
console.log(obj1.b.c); // 输出 2
```

### 5. 讲一讲 uni-app 小程序的生命周期
uni-app 生命周期分应用生命周期和页面生命周期。

+ **应用生命周期** ：
    - `onLaunch` ：应用初始化完成时触发，用于初始化全局变量、获取用户信息等操作。
    - `onShow` ：应用进入前台显示时触发，可用于执行应用可见时操作，如重新获取实时数据。
    - `onHide` ：应用进入后台时触发，用于保存应用状态、清理资源等。
    - `onError` ：应用运行报错时触发，用于记录错误信息等。
+ **页面生命周期** ：
    - `onLoad` ：页面加载时触发，可获取页面参数，用于页面初始化数据获取等操作。
    - `onShow` ：页面显示时触发，每次页面可见都执行，如从其他页面返回也触发。
    - `onReady` ：页面初次渲染完成时触发，此时可操作页面 DOM 元素等。
    - `onHide` ：页面隐藏时触发，如跳转到其他页面或应用进入后台时。
    - `onUnload` ：页面卸载时触发，用于页面销毁时的清理工作，如取消定时器等。
    - 还有 `onPullDownRefresh` （下拉刷新时触发）、`onReachBottom` （页面滚动到底部时触发）、`onShareAppMessage` （用户点击分享时触发）等页面相关事件函数。

### 6. Vue 里的 MVVM
MVVM 是架构模式，Vue 基于此模式。MVVM 分为：

+ **Model** ：数据模型，含业务逻辑和数据操作，如 JavaScript 对象或 API 获取数据。
+ **View** ：视图层，是用户看到并交互的界面，由 HTML 和 Vue 模板组成，通过数据绑定关联 Model。
+ **ViewModel** ：连接 Model 和 View 的桥梁，Vue 实例充当。响应式系统实现其功能，Model 数据变，Vue 自动更新 View；用户 View 操作，通过事件绑定等更新 Model 数据。

### 7. Vue2 组件通讯

Vue2 共有8种组件通讯方式：

1. `props` 和 `$emit`
2. `$parent` 和 `$children`
3. `ref` 和 `$refs`
4. EventBus 中央事件总线
5. `$attrs` 和 `$listeners`
6. Vuex
7. `provide` 和 `inject` 依赖注入
8. 作用域插槽

### 9. this 指向问题
JavaScript 中，`this` 指向因调用方式和上下文环境而异。

+ **普通函数调用** ：非严格模式下 `this` 指向全局对象（浏览器中是 window），严格模式下指向 undefined。例如：
+ **作为对象的方法调用** ：`this` 指向调用方法的对象。例如：
+ **构造函数调用** ：`this` 指向新创建的实例对象。例如：
+ **call、apply、bind 方法调用** ：显式指定 `this` 指向。`call` 和 `apply` 立即调用函数并传入指定 `this` 值和参数，`bind` 返回新函数，`this` 绑定到指定对象。例如：
+ **在 Vue 组件中的 **`this` ：通常指向 Vue 实例，可访问实例的数据、方法、生命周期钩子等。但在箭头函数或回调函数中，要注意 `this` 指向是否变化。例如：

### 10. 什么是 Vuex，请具体说说 Vuex
Vuex 是 Vue.js 官方状态管理模式，集中式状态管理，适用于中大型 Vue 项目，组件间共享状态和复杂状态交互时很实用。

+ **核心概念** ：
+ **State** ：存储应用共享状态，组件从 Vuex store 读取状态。例如：

组件中通过 `this.$store.state.count` 获取 state 值。

+ **Getter** ：类似 Vuex 的计算属性，对 state 加工处理或计算得出新值。例如：

组件中通过 `this.$store.getters.doneTodos` 获取已完成 todos 数组。

+ **Mutation** ：改变 Vuex store 中 state 的唯一途径，同步事务函数。每个 mutation 有字符串类型事件类型和回调函数，回调函数接受 state 作为第一个参数。例如：

组件中通过 `this.$store.commit('increment')` 提交 mutation 改变 state 值。

+ **Action** ：处理异步操作，包含异步操作逻辑，通过提交 mutation 改变 state。Action 函数接收与 store 实例同方法属性的对象作为参数，用 `context.commit` 提交 mutation。例如：

组件中通过 `this.$store.dispatch('incrementAsync')` 触发 action，异步操作后提交 mutation。

+ **Module** ：Vuex 允许将 store 分割成多个模块，各模块有自己的 state、getter、mutation 和 action，使 store 结构清晰易维护。例如：

组件中可访问模块的 state、提交模块的 mutation 等。

### 11. 箭头函数和普通函数的区别
+ **函数定义方式** ：
    - **箭头函数** ：用箭头符号（`=>`）定义，语法简洁，如 `const arrowFunc = () => { ... }`。
    - **普通函数** ：用 `function` 关键字定义，如 `function normalFunc() { ... }`。
+ **this 指向** ：
    - **箭头函数** ：无自有 `this`，从外层词法作用域继承，定义时确定。在处理回调或需保留外层 `this` 场景方便。例如：
+ **普通函数** ：调用时根据调用方式确定 `this` 指向，普通调用、作对象方法调用、构造函数调用等场景 `this` 指向不同。
+ **arguments 对象** ：
    - **箭头函数** ：不能用 `arguments` 对象访问函数参数，可通过参数列表访问参数，可用 rest 参数（`...args`）获取所有参数。
    - **普通函数** ：可用 `arguments` 对象访问函数所有参数，包括未声明的参数。
+ **作为构造函数** ：
    - **箭头函数** ：不能作为构造函数，用 `new` 调用会报错。
    - **普通函数** ：可通过 `new` 作为构造函数创建对象实例。

### 13. 按钮权限的实现（具体步骤）
菜单的权限   动态路由来解决的

按钮的权限   自定义指令

请求的权限   token

按钮权限实现步骤如下：

+ **定义权限标识** ：为每个按钮定义唯一权限标识，如 `user:edit`、`order:delete` 等，在系统中明确定义并与用户权限关联。
+ **用户权限获取与存储** ：用户登录时，根据角色或权限配置从后端获取用户权限标识，存储在 Vuex store 或本地存储中，方便应用中访问验证。
+ **组件中权限控制实现** ：
    - **自定义指令** ：创建自定义指令 `v-permission`，控制按钮显示隐藏。指令绑定函数中，根据用户权限与按钮权限标识匹配，无权限则移除元素。例如：

```javascript
// 定义自定义指令
Vue.directive('permission', {
  inserted(el, binding, vnode) {
    const { value } = binding;
    const permissions = vnode.context.$store.state.user.permissions;
    if (!permissions.includes(value)) {
      el.parentNode.removeChild(el);
    }
  }
});
// 组件中使用
<template>
  <button v-permission="'user:edit'">编辑用户</button>
  <button v-permission="'order:delete'">删除订单</button>
</template>

```

+ **计算属性和 v-if 指令** ：组件中用计算属性获取用户是否拥有按钮权限，用 `v-if` 指令动态控制按钮渲染。例如：
+ **后端接口支持** ：后端提供接口获取用户权限信息，用户执行受权限控制操作时进行权限验证，无权限返回错误信息，前端据此提示处理。

### 0. 怎么解决git冲突？
Git冲突通常发生在合并分支时，当两个分支修改了同一文件的同一部分。解决步骤：

1. 执行`git merge`或`git rebase`时发现冲突
2. 使用`git status`查看冲突文件
3. 手动编辑冲突文件，标记<<<<<<<、=======、>>>>>>>表示冲突位置
4. 选择保留的代码版本，删除标记符号
5. 添加修改后的文件`git add`
6. 提交合并`git commit`

### 1. 谈一谈你做过的参与度高的一个项目，实现的那些重要功能？
建议选择一个完整周期的项目，例如电商平台。重要功能可能包括：

+ 商品展示与筛选
+ 购物车与结算系统
+ 用户认证与权限管理
+ 订单管理与物流追踪
+ 支付集成

### 2. vue2的生命周期？
Vue2生命周期钩子：

+ 初始化：`beforeCreate`、`created`
+ DOM挂载：`beforeMount`、`mounted`
+ 数据更新：`beforeUpdate`、`updated`
+ 销毁：`beforeDestroy`、`destroyed`
+ 错误捕获：`errorCaptured`

### 5. uiapp兼容性问题怎么解决的？在什么地方用到过？
Ifdef  兼容app和小程序

常见兼容性问题及解决方案：

+ 不同手机屏幕适配：使用rpx、flex布局
+ 微信小程序与App差异：条件编译
+ 原生组件层级问题：z-index管理
+ 各平台API差异：使用uView等跨平台UI库
+ 特殊机型适配：使用uView的safe-area-inset类
+ 如果是浏览器端兼容性，我还会重点关注 CSS3 属性支持差异、事件绑定差异、图片格式支持、日期解析、滚动行为和 Polyfill 补充等问题

### 6. MVVM和MVC的区别，他们分别有哪些应用场景？
区别：

+ MVC：Model-View-Controller，控制器处理业务逻辑
+ MVVM：Model-View-ViewModel，通过数据绑定和DOM监听器实现视图与数据分离

应用场景：

+ MVC：大型应用如企业级管理系统
+ MVVM：前端框架如Vue、React

### 7. mongoDB数据库和MySQL最核心的区别是什么？
核心区别：

+ MongoDB：采用文档导向型的数据模型，是一种 NoSQL 数据库，非关系型数据库，文档存储，灵活Schema
+ MySQL：关系型数据库，基于表格存储数据，表结构固定，支持复杂查询

### 8. 你了解过虚拟DOM吗？
虚拟DOM是轻量级JavaScript对象，是真实DOM的抽象表示。工作原理：

1. 状态变更时，生成新虚拟DOM树
2. 与旧虚拟DOM树对比（Diff算法）
3. 计算最小DOM操作并应用到真实DOM

### 9. 请你说一说DFS和BFS是什么意思？
DFS（深度优先搜索）：沿着树的深度遍历节点，直到无法继续，然后回溯。  
BFS（广度优先搜索）：逐层遍历节点，使用队列实现。

### 10. 请你说一说你使用的API规范是什么？
常见API规范：

+ RESTful：使用HTTP动词（GET、POST、PUT、DELETE）
+ 资源导向的URL设计
+ 状态码规范使用
+ 返回统一格式（如JSON）
+ 分页、过滤、排序参数标准化

### 11. HTTP状态码有那些？
HTTP 状态码用于表示服务器对客户端请求的响应状态，主要分为以下几类：

+ **1xx（信息提示）** ：表示请求已被服务器接收，继续处理。
    - **100 Continue** ：服务器已收到部分请求，并希望客户端继续发送剩余的请求内容。
    - **101 Switching Protocols** ：服务器理解客户端的请求，并将切换到客户端在请求头中指定的协议。
+ **2xx（成功）** ：表示请求已成功被服务器接收、理解、并接受。
    - **200 OK** ：请求已成功处理，所请求的资源在响应正文中返回。这是最常见的成功状态码，表示客户端的请求已经成功完成，服务器返回了请求的数据。
    - **201 Created** ：请求成功并且服务器创建了新的资源，通常在创建新资源（如通过 POST 方法创建新记录）后返回此状态码，响应中会包含新创建资源的 URI。
    - **204 No Content** ：服务器成功处理了请求，但没有返回任何内容，通常用于表示删除成功或者更新操作成功但没有新的内容返回。
+ **3xx（重定向）** ：表示客户端需要采取进一步的操作来完成请求。
    - **301 Moved Permanently** ：请求的资源已被永久移动到新位置，客户端应使用响应中的 URI 进行后续请求，通常用于 URL 重定向。
    - **302 Found** ：请求的资源临时移动到另一个 URI，客户端应使用临时重定向，与 301 类似，但重定向是临时的。
    - **304 Not Modified** ：客户端请求的资源在服务器上未修改，客户端可以继续使用之前缓存的版本，这样可以节省带宽和时间，通常用于缓存验证。
+ **4xx（客户端错误）** ：表示客户端的请求有错误，服务器无法处理。
    - **400 Bad Request** ：服务器无法理解请求的格式或请求参数有误，通常是因为请求的语法不正确或者缺少必要的参数。
    - **401 Unauthorized** ：请求未被授权，客户端需要提供身份验证信息（如用户名和密码）来访问资源。
    - **403 Forbidden** ：服务器理解请求，但拒绝授权，即使提供了正确的凭据，也可能因为权限不足等原因拒绝访问。
    - **404 Not Found** ：服务器无法找到请求的资源，可能是由于输入了错误的 URL 或者资源已被删除。
+ **5xx（服务器错误）** ：表示服务器在处理请求时发生了错误。
    - **500 Internal Server Error** ：服务器遇到了意外情况，无法完成对请求的处理，通常是服务器端的程序错误或配置问题。
    - **501 Not Implemented** ：服务器不支持处理该请求所需的功能，可能是请求的方法或格式不受服务器支持。
    - **502 Bad Gateway** ：作为网关或代理服务器的服务器从上游服务器接收到无效响应，可能是由于后端服务器故障或网络问题。
    - **503 Service Unavailable** ：服务器暂时过载或维护，无法处理请求，通常是由于服务器资源不足或者正在进行维护操作。
    - **504 Gateway Timeout** ：作为网关或代理服务器的服务器没有及时从上游服务器接收到响应，可能是后端服务器响应超时或者网络问题。

### 12. 你有没有做过安全方面的维护？
安全维护措施：

+ XSS防护：输入过滤、输出编码
+ CSRF防护：使用CSRF令牌、SameSite属性
+ SQL注入防护：预处理语句、参数化查询
+ 密码加密：使用bcrypt、argon2等哈希算法
+ 权限管理：RBAC模型、JWT认证

### 13. 说一下数字孪生项目是怎么搭建开发的？
数字孪生项目开发流程：

1. 业务需求分析
2. 3D建模与场景搭建
3. 数据采集与IoT集成
4. 实时数据处理与分析
5. 可视化展示与交互开发
6. 仿真与预测模型构建
7. 持续优化与迭代

**14. 请问token是放在那个字段里面的？**

Token通常放在HTTP请求头的Authorization字段中，格式：

```plain
Authorization: Bearer <token>
```

### 15. 说一说你最想做哪些事？
+ **技术探索与学习** ：希望深入了解和掌握前沿的技术，如人工智能、大数据、区块链等，并将这些技术应用到实际项目中，解决复杂的问题，提升系统的性能和智能化水平。
+ **项目管理和团队协作** ：渴望有机会担任项目负责人或技术领导的角色，负责项目的整体规划、进度管理和质量控制，带领团队攻克技术难题，实现项目的成功交付。在团队协作中，希望能够分享自己的经验和知识，帮助团队成员成长，同时也从团队中学习到更多的技能和经验，共同打造高效、有创造力的团队氛围。
+ **开源贡献和社区分享** ：对开源社区充满热情，希望能够参与开源项目的开发和维护，为开源事业做出自己的贡献。同时，也希望能够通过技术博客、技术论坛、线下技术分享会等方式，将自己的技术经验和心得分享给更多的开发者，促进技术交流和社区的发展。

### 16. 说一说你没事的时候会干什么？
+ **锻炼和运动** ：注重身体健康，经常进行跑步、游泳、健身等运动，保持良好的体魄和精神状态。运动不仅能够锻炼身体，还能缓解压力，提高工作效率。
+ **参加技术活动和社交** ：积极参加各类技术交流活动、开源社区的线上活动以及线下技术分享会，与其他开发者交流经验，结交志同道合的朋友。同时，也会参加一些社交聚会、户外活动等，增进与家人和朋友之间的感情。
+ **开发个人项目和尝试新技术** ：利用业余时间开发一些个人感兴趣的项目，尝试应用新的技术框架和工具，将所学的知识付诸实践。

### 17. 谈一谈你的未来规划？
+ **短期规划（1 - 2 年）** ：希望能够加入一家有挑战性和发展空间的公司，深入参与项目开发，提升自己在前端开发、后端开发或者全栈开发等方面的专业技能。同时，积极学习和掌握公司业务领域的相关知识，为团队和公司创造价值，争取在项目中担任更重要的角色，如项目核心开发人员或技术模块负责人。
+ **中期规划（3 - 5 年）** ：在积累了一定的项目经验和技能后，希望能够向高级工程师或者技术专家的方向发展，深入研究某一技术领域，成为该领域的专家，能够独立解决复杂的技术问题，为团队提供技术指导和支持。同时，也希望能够有机会参与公司的技术架构设计和决策，推动团队技术的进步和创新。
+ **长期规划（5 年以上）** ：从技术管理或者业务拓展的角度进行规划。如果倾向于技术管理路线，希望能够逐步成长为技术团队的负责人或者技术总监，带领团队进行技术研发和创新，打造高效、稳定、可扩展的技术平台，支持公司的业务发展。如果更倾向于业务发展，希望能够深入理解公司业务，参与公司的战略规划和业务创新，通过技术手段为公司开拓新的市场和业务领域，成为公司业务发展的重要推动者。

### 18. 说一说你手机中下载了那些 APP？
+ **资讯类** ：今日头条、腾讯新闻、知乎等，获取新闻资讯、热点话题和专业知识等内容，拓宽视野和知识面。
+ **工具类** ：微信读书、百度网盘、WPS Office 等，用于阅读电子书、文件存储和办公文档处理，提高学习和工作效率。
+ **学习类** ：慕课网、网易云课堂、B 站（学习区）等，学习各种技术课程、专业知识和技能教程，不断提升自己。

### 19. 问你是感性还是理性的？
+ **理性为主，感性为辅** ：在大多数情况下，我更倾向于以理性的方式进行思考和决策。在面对问题时，会先收集相关信息，进行分析和评估，权衡利弊，然后根据逻辑和事实做出合理的判断和选择。但在一些特殊的生活场景或者涉及个人价值观和情感的方面，也会适当考虑感性的因素，例如在艺术欣赏、人际关系处理等方面，会结合自己的情感和直觉来感受和表达。

### 20. 说一说你的人生目标？
+ **职业成就方面** ：希望在自己所从事的技术领域成为专家或者领军人物，通过技术创新和实践，为行业的发展做出贡献。同时，希望能够带领团队开发出具有影响力的产品或项目，解决实际问题，改善人们的生活质量。
+ **个人成长方面** ：不断追求自我提升和完善，培养自己的综合素质和能力，包括专业知识、沟通能力、领导力、情商等。希望通过学习和实践，成为一个有智慧、有担当、有责任感的人，能够为社会和他人带来积极的影响。
+ **生活平衡方面** ：注重工作与生活的平衡，希望在追求事业成功的同时，也能够抽出时间陪伴家人和朋友，享受生活的乐趣。追求一种健康、和谐、充实的生活方式，实现个人价值和家庭幸福的双赢。

### 21. 如果让你学一门新技术，你会怎么规划？
+ **确定学习目标和应用场景** ：明确学习这门新技术的目的和希望应用的场景，例如是为了提升当前项目的开发效率、拓展职业发展方向，还是为了解决特定的技术难题。根据目标确定学习的重点内容和深度。
+ **收集学习资源** ：查找相关的学习资料，如官方文档、在线教程、技术书籍、视频课程、开源项目等。选择权威、系统且适合自己的学习资源，建立一个学习资料库。
+ **制定学习计划** ：
    - **基础知识学习** ：安排时间学习新技术的基本概念、原理、语法、基本操作等基础知识，通过实践示例加深理解。
    - **进阶知识和实践** ：在掌握基础知识后，学习进阶的知识点和技巧，结合实际项目进行实践，例如开发一个小项目或者实现一个具体的功能模块，将所学知识应用到实践中。
    - **项目实战和优化** ：参与真实项目或者开源项目，将新技术应用到实际开发中，解决实际问题，并不断优化和改进代码，提升性能和可维护性。
    - **总结和分享** ：定期总结学习过程中的经验和心得，整理成笔记或者博客，与其他开发者分享交流，加深对知识的理解和记忆，同时也可以从他人的反馈中发现自己的不足之处。
+ **加入技术社区** ：加入相关的技术社区和论坛，如 GitHub、Stack Overflow、知乎技术专栏等，与其他学习者和专家交流学习心得，遇到问题时可以及时寻求帮助和解决方案，同时也可以关注行业动态和技术发展趋势，及时调整学习计划。
+ **持续学习和更新** ：技术更新换代快，要保持持续学习的态度，关注新技术的发展动态和更新内容，定期复习和巩固已学知识，不断更新自己的知识体系。

### 22. 如果让你负责一个新的项目你会怎么做？
+ **项目启动阶段** ：
    - **需求分析和沟通** ：与项目相关方（如客户、产品经理、设计师等）进行深入沟通，了解项目的业务需求、目标用户、项目范围、预期成果等。收集需求文档、用户故事、原型图等资料，确保对项目需求有全面、准确的理解。
    - **组建团队** ：根据项目的需求和技术栈，组建合适的项目团队，包括开发人员、测试人员、运维人员等，明确各成员的职责和分工。
    - **制定项目计划和时间表** ：根据项目需求和交付时间，制定详细的项目计划，包括需求分析、设计、开发、测试、部署等各个阶段的时间节点和里程碑。可以使用项目管理工具（如 Jira、Trello 等）来辅助项目计划的制定和跟踪。
    - **资源准备** ：准备项目的开发环境、测试环境、部署环境等基础设施，确保团队成员能够顺利开展工作。
+ **项目设计阶段** ：
    - **系统架构设计** ：根据项目的技术需求和业务特点，设计系统的整体架构，包括前端架构、后端架构、数据库设计、接口设计等。选择合适的技术栈和设计模式，确保系统的高性能、高可用性和可扩展性。
    - **数据库设计** ：根据业务需求设计数据库的表结构、字段、关系等，绘制数据库 E-R 图，进行数据库的性能优化设计，如索引设计、分区设计等。
    - **接口设计** ：设计前后端之间的接口以及与其他系统之间的接口，编写接口文档，明确接口的请求方法、参数、返回值、错误码等信息，为开发提供指导。
+ **项目开发阶段** ：
    - **代码规范和版本控制** ：制定团队的代码规范和编程风格指南，确保代码的质量和一致性。同时，设置好版本控制系统（如 Git），规范分支管理、代码提交、代码审查等流程。
    - **开发和测试迭代** ：按照项目计划，团队成员进行开发工作，采用敏捷开发方法（如 Scrum）进行迭代开发，每个迭代周期内完成一部分功能的开发，并进行单元测试、集成测试和修复缺陷。定期召开项目进度会议，沟通开发进展和解决问题。
    - **持续集成和交付** ：建立持续集成和持续交付（CI/CD）流程，通过自动化构建、测试和部署工具（如 Jenkins、Docker 等），实现代码的自动编译、测试和部署，提高开发效率和交付质量。
+ **项目上线和维护阶段** ：
    - **部署和上线** ：在完成开发和测试后，将项目部署到生产环境，进行上线前的最终测试和验证，确保系统在生产环境中的稳定性和性能。
    - **用户培训和支持** ：为用户提供更好的使用体验，提供必要的用户培训和文档支持，解答用户在使用过程中遇到的问题。
    - **项目监控和维护** ：建立项目监控系统，实时监测系统的运行状态、性能指标、错误日志等，及时发现和解决生产环境中的问题。同时，根据用户的反馈和业务的发展，对项目进行持续的优化和维护，包括功能升级、性能优化、安全修复等。

### 24. 说说你最熟悉的一个项目，谈一谈那些模块怎么实现的。有没有做过网站项目？
假设最熟悉的项目是一个电商网站项目，以下是详细介绍：

+ **项目背景** ：该电商网站旨在为用户提供了一个在线购物的平台，用户可以浏览商品、搜索商品、加入购物车、下单购买、查看订单状态等。同时，也为商家提供了商品管理、订单管理、店铺管理等功能。
+ **主要模块及实现** ：
    - **用户注册与登录模块** ：采用 Vue.js 框架开发前端页面，使用 JWT 进行用户认证。用户在前端输入用户名和密码，通过 HTTP 请求发送到后端，后端验证用户信息后生成 JWT Token 并返回给前端，前端将 Token 保存在本地存储中，并在后续的请求中将 Token 放在请求头中发送给后端进行身份验证。
    - **商品展示模块** ：后端使用 Spring Boot 框架搭建 RESTful API，将商品数据存储在 MySQL 数据库中。前端通过 Axios 等 HTTP 客户端库调用后端 API 获取商品列表、商品详情等数据，并使用 Vue.js 的组件化开发方式，将商品列表、商品卡片、商品详情等设计成可复用的组件，在页面上进行展示。同时，使用图片懒加载技术提高页面加载性能。
    - **购物车模块** ：购物车数据在用户未登录时存储在 Redis 中，以用户的会话 ID 作为标识。用户登录后，将 Redis 中的购物车数据与数据库中的用户购物车数据进行合并。在前端，使用 Vuex 进行购物车数据的状态管理，实现购物车中商品的增删改查功能，并实时更新购物车的总价和商品数量等信息。
    - **订单生成与支付模块** ：用户提交订单时，前端将用户选择的商品信息、收货地址、支付方式等数据发送给后端，后端生成订单号、计算订单金额等信息，并将订单数据存储在数据库中。对于支付功能，后端集成了第三方支付 SDK（如支付宝支付、微信支付），在用户确认支付后，后端向支付平台发起支付请求，获取支付结果，并根据支付结果更新订单状态。前端通过轮询或 WebSocket 等方式监听支付结果的状态变化，及时反馈给用户支付成功或失败的信息。
    - **搜索模块** ：后端使用 Elasticsearch 搭建全文搜索引擎，将商品数据索引到 Elasticsearch 中。前端用户输入搜索关键词后，通过 HTTP 请求将关键词发送到后端，后端使用 Elasticsearch 的查询接口对商品标题、描述等字段进行全文检索，返回匹配的商品数据给前端进行展示。同时，在搜索结果页面实现分页、筛选、排序等功能，提高用户搜索体验。
+ **网站项目经验** ：是的，这个电商项目就是一个典型的网站项目，除了上述模块外，还涉及了首页推荐、用户评价、客户服务等多个模块的开发。在项目中，注重优化网站的性能，如通过图片优化、代码压缩、CDN 加速等手段提高页面加载速度；同时，确保网站的兼容性，在主流浏览器（如 Chrome、Firefox、Safari、Edge 等）上进行充分的测试和调试，以保证用户在不同浏览器上都能获得良好的浏览体验。

### 4. Vue3 setup 这个函数及它的参数

#### 语法
`setup(props, { attrs, slots, emit })`

其中，`props` 是组件的属性对象，包含了父组件传递给子组件的属性；`attrs` 是包含所有父作用域中不作为 prop 或事件提供的属性的对象；`slots` 是包含所有插槽的对象；`emit` 是用于触发自定义事件的函数。

#### 参数详细介绍

+ **props** ：响应式的组件属性对象，其值会根据父组件的属性变化而更新。在 `setup` 函数中可以直接使用 `props` 的值。
+ **attrs** ：包含所有父作用域中不作为 prop 或事件提供的属性的对象，这些属性是非响应式的，可以通过 `attrs` 访问。
+ **slots** ：包含所有插槽的对象，可以通过 `slots.default()` 访问默认插槽的内容。
+ **emit** ：用于触发自定义事件的函数，子组件可以通过 `emit` 向父组件传递事件和数据。

### 5. 一般性能优化做过哪些（如何实现前端性能优化）

#### 资源加载优化
+ **代码分割** ：通过 Webpack 等构建工具将代码分割成多个小块，按需加载。示例：
+ **资源压缩** ：使用 Webpack 的压缩插件（如 TerserPlugin 用于 JavaScript 压缩，CssMinimizerPlugin 用于 CSS 压缩）对资源文件进行压缩，减少文件大小。
+ **懒加载图片** ：使用懒加载技术，只有当图片进入视口时才加载图片资源。示例：

#### 渲染性能优化

+ **使用 Virtual DOM 和 Diff 算法** ：框架如 Vue 和 React 使用 Virtual DOM 和高效的 Diff 算法减少 DOM 操作，提高渲染性能。
+ **避免频繁的 DOM 操作** ：尽量减少直接操作 DOM 的次数，使用文档片段（DocumentFragment）等技术批量更新 DOM。

#### 网络优化

+ **HTTP 缓存** ：利用 HTTP 缓存机制（如 `Cache-Control`、`ETag` 等）减少资源重复请求。
+ **CDN 加速** ：将静态资源部署到 CDN 上，利用 CDN 的优势提高资源加载速度。

#### 其他优化

+ **减少重排和重绘** ：批量更新样式，避免频繁触发重排和重绘。例如，使用 CSS 变换（transform）和过渡（transition）代替直接修改样式。
+ **使用性能分析工具** ：使用 Chrome DevTools 等工具进行性能分析，找出性能瓶颈并针对性优化。

### 8. 你平时会做哪些自定义的 hook

#### 表单验证 hook
```javascript
import { ref, watch } from 'vue'

export function useFormValidation(initialValue, validate) {
  const value = ref(initialValue)
  const errorMessage = ref('')
  const isValid = ref(true)

  function validateValue() {
    const result = validate(value.value)
    if (typeof result === 'string') {
      errorMessage.value = result
      isValid.value = false
    } else {
      errorMessage.value = ''
      isValid.value = true
    }
  }

  watch(value, validateValue, { immediate: true })

  return { value, errorMessage, isValid }
}
```

#### 本地存储 hook
```javascript
import { ref, watch } from 'vue'

export function useLocalStorage(key, initialValue) {
  const storedValue = localStorage.getItem(key)
  const value = ref(storedValue !== null ? JSON.parse(storedValue) : initialValue)

  function updateValue(newValue) {
    value.value = newValue
  }

  watch(value, (newValue) => {
    localStorage.setItem(key, JSON.stringify(newValue))
  }, { deep: true })

  return { value, updateValue }
}
```

#### API 请求 hook
```javascript
import { ref, onMounted } from 'vue'
import axios from 'axios'

export function useApiRequest(url) {
  const data = ref(null)
  const isLoading = ref(true)
  const error = ref(null)

  async function fetchData() {
    try {
      const response = await axios.get(url)
      data.value = response.data
    } catch (err) {
      error.value = err.message
    } finally {
      isLoading.value = false
    }
  }

  onMounted(fetchData)

  return { data, isLoading, error, fetchData }
}
```

### 9. 你平时是使用 Vuex 还是 Pinia 并说说它们之间的区别

在 Vue 3 中，Pinia 是推荐的状态管理库，但 Vuex 仍然被广泛使用。以下是 Vuex 和 Pinia 的一些主要区别：

#### API 设计
+ **Vuex** ：基于严格的单一状态树设计，使用 `mutations`、`actions` 和 `getters` 管理状态。需要通过 `store.commit` 触发 mutations，通过 `store.dispatch` 触发 actions。
+ **Pinia** ：采用更简洁的 API，直接使用 `store` 对象的 `state`、`getters` 和 `actions`。通过 `store.$patch` 更新状态，支持直接调用 actions。

#### 安装和设置

+ **Vuex** ：需要创建一个 `store` 实例并通过 `Vue.use` 注册。
+ **Pinia** ：通过 `defineStore` 定义 store，然后在应用中安装。

#### 代码结构和可读性

+ **Vuex** ：代码较为冗长，需要定义 mutations、actions 和 getters。
+ **Pinia** ：代码更简洁，直接在 store 中定义状态和逻辑。

#### TypeScript 支持

+ **Vuex** ：需要额外的类型定义文件，类型推断不够直观。
+ **Pinia** ：内置良好的 TypeScript 支持，类型推断更简单。

### 10. 请说说 WebSocket 和 HTTP 的区别

WebSocket 和 HTTP 是两种不同的网络通信协议，具有以下主要区别：

#### 通信模式
+ **HTTP** ：一种请求 - 响应模式的协议，客户端发送请求，服务器返回响应。通信由客户端发起，服务器不能主动向客户端发送数据。
+ **WebSocket** ：一种全双工通信协议，建立连接后，客户端和服务器可以随时互相发送和接收数据。通信是双向的。

#### 连接建立

+ **HTTP** ：每次请求都会建立一个新的连接（HTTP/1.1 引入了持久连接，但仍然需要多次请求 - 响应）。
+ **WebSocket** ：通过 HTTP 升级握手建立持久连接，一旦建立，连接就保持打开状态，直到显式关闭。

#### 数据传输

+ **HTTP** ：基于文本或二进制数据传输，每次传输都有 HTTP 头部信息，增加了数据传输的额外负担。
+ **WebSocket** ：基于帧传输，数据帧可以是文本或二进制，没有 HTTP 头部的开销，数据传输更高效。

#### 适用场景

+ **HTTP** ：适用于传统的 Web 页面请求、RESTful API 调用等场景，客户端主动请求数据。
+ **WebSocket** ：适用于实时性要求高的场景，如聊天应用、实时游戏、股票行情推送等，服务器需要主动向客户端推送数据。

### 11. 解释一下 TS 中接口的定义

在 TypeScript 中，接口（Interface）用于定义对象的类型，描述对象的结构，包括属性的类型、方法的签名等。以下是接口定义的基本语法和示例：

#### 接口的应用场景
+ **定义对象类型** ：用于描述对象的结构，确保对象符合特定的类型要求。
+ **函数参数和返回值类型** ：用于定义函数参数和返回值的类型，提高代码的可读性和可维护性。
+ **类的实现** ：通过 `implements` 关键字，确保类实现特定的接口，符合接口定义的方法和属性。

### 12. 是否了解 Bootstrap

Bootstrap 是一个流行的前端 UI 框架，用于快速开发响应式和移动设备优先的 Web 页面。

#### 核心特点
+ **响应式设计** ：使用响应式栅格系统，可以根据不同设备的屏幕宽度自动调整页面布局。示例：
+ **预定义组件** ：提供大量的预定义组件，如按钮、表单、导航栏、模态框等，简化前端开发。示例按钮组件：
+ **CSS 样式** ：内置丰富的 CSS 样式类，用于快速美化页面。示例文本样式：

### 13. 如何实现深度监听（watch），用什么方法可以实现我的页面强制刷新？
深度监听：`watch(..., { deep: true })`；

强制刷新：`window.location.reload()`或`$router.go(0)`（SPA 场景）

# 第 10 篇：前端超级面试题汇总：let/const/var、闭包、内存泄漏、综合问答

### 5. 你对跨域是怎么看的？如何解决？
1. 跨域：由于浏览器同源策略，不同源（协议、域名、端口不同）的请求被限制。  
解决方法：  

+ JSONP（利用 script 标签 src 不受限，只支持 GET）
+ 代理服务器，代理服务器作为 “中间人”，向目标跨域服务器发起请求（此时请求由服务器端发起，不受浏览器同源策略限制）

```javascript
export default {
  server: {
    proxy: {
      '/api': {
        target: 'https://target-domain.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      }
    }
  }
};
```

+ CORS（跨域资源共享，服务器设置响应头 Access-Control-Allow-*）

### 万链科技有限公司面试题

#### 2. 无感刷新怎么实现？
无感刷新通常是指在用户无感知的情况下，自动刷新页面或数据以保持会话的有效性或数据的实时性。以下是一些常见的无感刷新实现方法：

**基于 AJAX 的定时刷新**

+ **定时发送 AJAX 请求** ：通过设置定时器（如 `setInterval`），在后台定期向服务器发送 AJAX 请求，获取最新的数据或更新会话状态。这种方法不会导致页面的重新加载，用户可以在不知不觉中继续使用应用。

```javascript
// 定时发送 AJAX 请求进行无感刷新
const refreshTokenInterval = setInterval(() => {
  axios.post('/api/refresh-token', {
    // 可以携带必要的参数，如当前的 token 等
    token: localStorage.getItem('accessToken')
  }).then(response => {
    // 更新 token 或其他状态信息
    localStorage.setItem('accessToken', response.data.newToken);
  }).catch(error => {
    console.error('Token refresh failed:', error);
    // 处理刷新失败的情况，如跳转到登录页面等
    clearInterval(refreshTokenInterval);
    window.location.href = '/login';
  });
}, 30 * 60 * 1000); // 每 30 分钟刷新一次 token
```

**使用 WebSocket 实现实时无感刷新**

+ **建立 WebSocket 连接** ：建立 WebSocket 连接后，服务器可以实时向客户端推送数据或通知，客户端根据收到的消息进行相应的更新操作。这种方式可以实现实时性较高的无感刷新。

```javascript
// 使用 WebSocket 实现实时无感刷新
const ws = new WebSocket('ws://example.com/socket');

ws.onopen = function() {
  console.log('WebSocket connection established');
};

ws.onmessage = function(event) {
  const data = JSON.parse(event.data);
  if (data.type === 'session-refresh') {
    // 更新会话或数据
    localStorage.setItem('lastRefreshTime', new Date().getTime());
    console.log('Session refreshed via WebSocket');
  } else if (data.type === 'data-update') {
    // 更新页面数据
    updatePageData(data.payload);
  }
};

ws.onerror = function(error) {
  console.error('WebSocket Error:', error);
};

ws.onclose = function() {
  console.log('WebSocket connection closed');
  // 可以尝试重新连接
  setTimeout(() => {
    initWebSocketConnection();
  }, 5000);
};
```

**利用页面可见性 API（Page Visibility API）**

+ **检测页面可见性** ：通过页面可见性 API，当页面处于可见状态时，执行定时刷新操作；当页面处于隐藏状态时，暂停定时刷新，以节省服务器资源和提高用户体验。

```javascript
// 利用页面可见性 API 实现无感刷新
let visibilityChangeHandler = () => {
  if (document.visibilityState === 'visible') {
    // 页面可见时恢复定时刷新
    if (!refreshTokenInterval) {
      refreshTokenInterval = setInterval(refreshToken, 30 * 60 * 1000);
    }
  } else {
    // 页面不可见时暂停定时刷新
    if (refreshTokenInterval) {
      clearInterval(refreshTokenInterval);
      refreshTokenInterval = null;
    }
  }
};

document.addEventListener('visibilitychange', visibilityChangeHandler);

// 初始情况下设置定时刷新
let refreshTokenInterval = setInterval(refreshToken, 30 * 60 * 1000);

function refreshToken() {
  axios.post('/api/refresh-token', {
    token: localStorage.getItem('accessToken')
  }).then(response => {
    localStorage.setItem('accessToken', response.data.newToken);
  }).catch(error => {
    console.error('Token refresh failed:', error);
    clearInterval(refreshTokenInterval);
    window.location.href = '/login';
  });
}
```

#### 3. 简历上面项目团队有几人？

    - **前端开发工程师** ：2 名，负责项目的前端页面开发、交互设计以及与后端 API 的对接工作。
    - **后端开发工程师** ：3 名，负责项目的后端业务逻辑实现、数据库设计与优化、接口开发等工作。
    - **测试工程师** ：2 名，负责项目的功能测试、性能测试、安全测试等工作，确保项目质量和稳定性。
    - **UI 设计师** ：1 名，负责项目的界面设计、交互原型设计等工作，提升用户体验。
+ **项目管理团队** ：除了开发团队外，还有 2 名项目经理和 1 名产品负责人，负责项目的整体规划、进度管理、需求分析、团队协调等工作。

#### 4. 项目周期

小程序：1个月。后台2-6个月都是正常的。

### 星宇时空有限公司面试题

#### 1. 介绍下 promise 的特性、优缺点
**Promise 的特性**

+ **对象状态** ：Promise 是一个对象，它代表一个异步操作的最终完成（或失败）及其结果值。Promise 对象有三种状态：
    - **pending（进行中）** ：初始状态，既不是成功也不是失败。
    - **fulfilled（已成功）** ：异步操作成功完成，且有了结果值。
    - **rejected（已失败）** ：异步操作失败，且有了错误原因。
+ **不可变性** ：Promise 对象的状态一旦改变，就不会再变，任何时候都可以获取到这个最终状态。即使改变已经发生，新的状态也不会被修改。
+ **链式调用** ：Promise 支持链式调用，通过 `.then()` 方法可以指定异步操作成功后的回调函数，通过 `.catch()` 方法可以指定异步操作失败后的回调函数。每个 `.then()` 和 `.catch()` 方法都会返回一个新的 Promise 对象，允许将多个异步操作按顺序串联起来。

**Promise 的优点**

+ **更好的错误处理** ：与传统的回调函数相比，Promise 提供了统一的错误处理机制。在回调地狱中，错误处理通常需要在每个回调函数中单独处理，而在 Promise 链中，一个 `.catch()` 可以捕获前面所有 `.then()` 中抛出的异常或rejected 的 Promise，使得错误处理更加集中和清晰。
+ **避免回调地狱** ：通过链式调用，Promise 可以将嵌套的回调函数转换为链式结构，提高了代码的可读性和可维护性，使得异步代码的逻辑更加清晰。
+ **统一的异步编程模型** ：Promise 为异步操作提供了一种标准化的接口，不同的异步操作（如 AJAX 请求、定时器、文件操作等）都可以通过 Promise 来处理，使得异步代码的编写更加一致和规范。

**Promise 的缺点**

+ **无法取消** ：一旦 Promise 被创建并执行，就无法中途取消。即使在异步操作完成之前，发现不再需要该操作的结果，也无法停止其执行。例如，在发送多个 AJAX 请求时，如果用户切换了页面，可能希望取消之前的请求，但 Promise 本身不支持这种取消机制，需要借助其他手段（如 AbortController）来实现。
+ **错误传播** ：在 Promise 链中，如果一个 `.then()` 中抛出了异常但未被 `.catch()` 捕获，该错误会一直传播到整个 Promise 链的末尾，导致后续的 `.then()` 无法执行，可能会使得程序进入一种难以预测的状态。因此，需要在开发过程中特别注意错误处理，确保每个 Promise 链都有适当的 `.catch()` 来处理可能的错误。
+ **立即执行** ：Promise 在创建时会立即执行其异步操作，无法像某些其他异步机制（如 Generator 函数）那样延迟执行。这在某些场景下可能导致不必要的资源消耗或逻辑错误，需要开发者在设计异步流程时仔细考虑。

#### 2. 对事件委托的理解
事件委托是一种在 JavaScript 中处理事件的技巧，它利用了事件冒泡（Event Bubbling）的特性，将事件处理器绑定到父元素上，而不是直接绑定到子元素上。这样可以实现对多个子元素的事件处理，而无需为每个子元素单独绑定事件处理器。以下是事件委托的详细介绍和应用：

**事件冒泡机制**

+ 当一个元素上的事件被触发时，该事件会从触发该事件的元素开始，向其祖先元素逐层传播，直到文档的根节点。这个过程称为事件冒泡。例如，当点击一个按钮时，按钮上的点击事件会依次向其父元素、祖父元素等传播，直到 `document` 对象。

**事件委托的原理**

+ 通过将事件处理器附加到父元素上，并在事件处理器中根据事件对象的 `target` 属性来判断具体的子元素，从而实现对子元素的事件处理。这样，即使父元素中的子元素在页面加载后动态添加或删除，也无需重新绑定事件处理器，因为事件处理器是绑定在父元素上的。

**事件委托的优点**

+ **性能优化** ：减少了为大量子元素绑定事件处理器的开销，尤其是当子元素数量较多时，可以显著提高页面性能。例如，在一个包含数百个列表项的页面中，使用事件委托只需为列表绑定一个事件处理器，而不是为每个列表项绑定一个。
+ **动态内容支持** ：对于动态生成的内容（如通过 AJAX 请求加载的列表项），事件委托可以确保新添加的子元素自动继承父元素的事件处理器，而无需手动重新绑定事件。

#### 3. 浏览器的本地储存
浏览器的本地储存技术允许 Web 应用在用户的浏览器中存储数据，并在用户再次访问时读取这些数据。以下是一些常见的浏览器本地储存技术及其特点和使用方法：

**localStorage**

+ **存储特点** ：数据存储在客户端浏览器中，没有过期时间，除非手动清除，数据会一直保留。存储的数据大小通常限制在 5MB 左右（不同浏览器可能有所不同）。
+ **适用场景** ：适用于需要长期存储的数据，如用户的主题偏好设置、登录状态、购物车数据等。
+ **使用方法** ：

**sessionStorage**

+ **存储特点** ：数据存储在客户端浏览器中，数据只在会话期间有效，当浏览器窗口或标签页关闭后，数据会被自动清除。存储的数据大小通常也限制在 5MB 左右。
+ **适用场景** ：适用于临时存储在会话期间需要使用的数据，如页面的临时状态、表单的自动填充数据等。
+ **使用方法** ：

**cookie**

+ **存储特点** ：数据存储在客户端浏览器中，可以通过设置过期时间来控制数据的保留期限。数据大小限制通常在 4KB 左右，并且每个域名下可存储的 cookie 数量有限（一般不超过 20 个）。
+ **适用场景** ：常用于存储用户会话信息（如 session ID）、追踪用户行为等。
+ **使用方法** ：通常通过 JavaScript 的 `document.cookie` 属性操作 cookie，但需要注意 cookie 的格式和相关限制：

#### 4. 说说 ES6 新增了哪些东西
ES6（ECMAScript 2015）是 JavaScript 语言的一个重要版本，它在 ES5 的基础上新增了许多特性和语法糖，极大地提高了 JavaScript 的开发效率和代码的可读性。以下是一些 ES6 的主要新增特性：

**变量声明**

+ **let** ：在块级作用域内声明变量，解决了 `var` 的变量提升和作用域问题，使变量的声明更加灵活和安全。
+ **const** ：声明常量，一旦声明后，变量的值不能被重新赋值，但可以修改其属性（如果是对象或数组）。

**字符串操作**

+ **模板字符串** ：使用反引号（` `` `）包裹字符串，允许在字符串中嵌入表达式和多行文本，使字符串的拼接更加方便和易读。
+ **新的字符串方法** ：如 `startsWith()`、`endsWith()`、`includes()` 等，方便对字符串进行判断和操作。

**数组操作**

+ **扩展运算符（...）** ：用于展开数组或对象，可以方便地合并数组、复制数组、传递函数参数等。
+ **新的数组方法** ：如 `find()`、`findIndex()`、`fill()`、`copyWithin()` 等，增强了数组的处理能力。

```javascript
// 数组方法示例
const numbers = [1, 2, 3, 4, 5];

// 查找第一个大于 3 的元素
const found = numbers.find(num => num > 3);
console.log(found); // 4

// 查找第一个大于 3 的元素的索引
const foundIndex = numbers.findIndex(num => num > 3);
console.log(foundIndex); // 3

// 填充数组元素
const filledArr = numbers.fill(0, 2, 4);
console.log(filledArr); // [1, 2, 0, 0, 5]
```

**对象操作**

+ **对象字面量增强** ：允许在对象字面量中简写属性名和方法定义，还可以定义计算属性名。

```javascript
// 对象字面量增强示例
const name = 'John';
const age = 30;

// 简写属性名
const person = { name, age };

// 计算属性名
const key = 'name';
const computedProperty = { [key]: 'John' };

// 方法定义简写
const methods = {
  greet() {
    console.log('Hello!');
  }
};
```

+ **对象解构** ：允许从对象中提取属性值并赋值给变量，提高代码的可读性和简洁性。

```javascript
// 对象解构示例
const person = {
  name: 'John',
  age: 30,
  address: {
    city: 'Beijing',
    country: 'China'
  }
};

// 基本解构
const { name, age } = person;
console.log(name, age); // John 30

// 嵌套解构
const { city, country } = person.address;
console.log(city, country); // Beijing China
```

**函数特性**

+ **箭头函数（=>）** ：提供了更简洁的函数定义语法，并且在非对象方法中不会绑定自己的 `this`、`arguments`、`super` 或 `new.target`，这使得箭头函数在某些场景下（如回调函数、简短的函数表达式等）非常方便，但需要注意其对 `this` 的处理方式。

```javascript
// 箭头函数示例
const add = (a, b) => a + b;
console.log(add(2, 3)); // 5

const numbers = [1, 2, 3, 4, 5];
numbers.forEach(num => console.log(num * 2));
```

+ **默认参数和剩余参数** ：允许在函数定义中为参数指定默认值，以及使用剩余参数语法将不定数量的参数收集到一个数组中。

```javascript
// 默认参数示例
function greet(name, message = 'Hello') {
  console.log(`${message}, ${name}!`);
}
greet('John'); // Hello, John!
greet('John', 'Hi'); // Hi, John!

// 剩余参数示例
function sum(...numbers) {
  return numbers.reduce((total, num) => total + num, 0);
}
console.log(sum(1, 2, 3, 4, 5)); // 15
```

**模块系统**

+ **模块化支持** ：引入了 `import` 和 `export` 语句，允许将代码组织成模块，实现代码的分文件管理和复用，提高了代码的可维护性和结构化程度。

```javascript
// mathUtils.js
export function add(a, b) {
  return a + b;
}

export function subtract(a, b) {
  return a - b;
}

// main.js
import { add, subtract } from './mathUtils.js';

console.log(add(2, 3)); // 5
console.log(subtract(5, 3)); // 2
```

**类和继承**

+ **类（class）** ：提供了一种更清晰的面向对象编程语法，虽然底层仍然是基于原型的继承机制，但类的语法使代码更易读和易写。
+ **继承和方法重写** ：通过 `extends` 关键字实现类的继承，并可以通过 `super` 关键字调用父类的构造函数和方法。

```javascript
// 类和继承示例
class Animal {
  constructor(name) {
    this.name = name;
  }

  speak() {
    console.log(`${this.name} makes a sound.`);
  }
}

class Dog extends Animal {
  speak() {
    console.log(`${this.name} barks.`);
  }
}

const dog = new Dog('Rex');
dog.speak(); // Rex barks.
```

**其他特性**

+ **Promise** ：提供了原生的 Promise 对象，用于异步编程，简化了异步代码的编写和管理。
+ **Symbol** ：一种新的原始数据类型，表示独一无二的值，常用于对象的属性键，避免属性名冲突。
+ **Set 和 Map** ：提供了新的数据结构 Set（存储唯一值的集合）和 Map（存储键值对的集合），增强了 JavaScript 的数据处理能力。
+ **Proxy 和 Reflect** ：Proxy 提供了创建对象的代理，可以自定义对象的操作行为；Reflect 提供了一系列静态方法，用于操作对象的反射功能，常与 Proxy 一起使用来实现更灵活的数据处理和拦截。

以上只是 ES6 新增特性的一部分，其他还包括生成器函数（generator functions）、迭代器（iterators）、异构数组的处理等。

#### 5. 说一下 Vue 组件中的参数传递方式
在 Vue.js 中，组件之间的参数传递是实现组件复用和组合的关键。以下是 Vue 组件中常见的参数传递方式：

**父子组件间传递**

+ **父传子（Props）** ：通过父组件将数据传递给子组件，子组件通过 `props` 选项接收这些数据。这是 Vue 组件间数据传递的基础方式，用于实现父子组件之间的单向数据流。

```javascript
// 父组件
<template>
  <child-component :user="currentUser" @update:user="handleUserUpdate"></child-component>
</template>
<script>
import ChildComponent from './ChildComponent.vue';

export default {
  components: {
    ChildComponent
  },
  data() {
    return {
      currentUser: {
        id: 1,
        name: 'John Doe'
      }
    };
  },
  methods: {
    handleUserUpdate(updatedUser) {
      this.currentUser = updatedUser;
    }
  }
};
</script>

```

```javascript
// 子组件
<script>
export default {
  props: {
    user: {
      type: Object,
      required: true
    }
  },
  methods: {
    updateUser() {
      const updatedUser = { ...this.user, name: 'Jane Doe' };
      this.$emit('update:user', updatedUser);
    }
  }
};
</script>
<template>
  <div>
    <p>User Name: {{ user.name }}</p>
    <button @click="updateUser">Update User</button>
  </div>
</template>

```

+ **子传父（自定义事件）** ：子组件通过 `$emit` 方法触发自定义事件，并向父组件传递数据。父组件通过监听子组件的自定义事件来接收数据。这种机制使得子组件可以将数据变化通知给父组件，实现子向父的数据传递。

**兄弟组件间传递**

+ **通过共同父组件** ：兄弟组件之间可以通过共同的父组件作为中介来传递数据。父组件维护一个共享的状态，通过 `props` 将数据传递给子组件，并通过子组件触发的自定义事件来更新共享状态。这种方式适用于兄弟组件之间的数据传递，但需要父组件的参与。

```javascript
// 父组件
<template>
  <div>
    <sibling-component-a :shared-data="sharedData" @update:data="updateSharedData"></sibling-component-a>
    <sibling-component-b :shared-data="sharedData" @update:data="updateSharedData"></sibling-component-b>
  </div>
</template>
<script>
import SiblingComponentA from './SiblingComponentA.vue';
import SiblingComponentB from './SiblingComponentB.vue';

export default {
  components: {
    SiblingComponentA,
    SiblingComponentB
  },
  data() {
    return {
      sharedData: 'Initial Data'
    };
  },
  methods: {
    updateSharedData(newData) {
      this.sharedData = newData;
    }
  }
};
</script>

```

+ **使用事件总线（Event Bus）** ：创建一个独立的 Vue 实例作为事件总线，兄弟组件之间通过事件总线来发送和监听事件，从而实现数据传递。事件总线的方式使得兄弟组件之间的通信更加直接，不需要父组件的参与。

```javascript
// 创建事件总线
import Vue from 'vue';
export const EventBus = new Vue();

// 组件 A
<script>
export default {
  methods: {
    sendMessage() {
      EventBus.$emit('message-to-component-b', 'Hello from Component A');
    }
  }
};
</script>
<template>
  <button @click="sendMessage">Send Message</button>
</template>

```

```javascript
// 组件 B
<script>
export default {
  created() {
    EventBus.$on('message-to-component-b', (message) => {
      console.log('Message from Component A:', message);
    });
  }
};
</script>

```

**跨级组件间传递**

+ **使用 Vuex 或 Pinia（状态管理）** ：对于跨级组件间的数据传递，尤其是多层嵌套的组件结构，使用 Vuex（Vue 2）或 Pinia（Vue 3）等状态管理库可以有效地管理共享状态。通过将状态存储在全局的状态仓库中，各组件可以通过 mutations 或 actions 来更新状态，并通过 getters 来获取状态，从而实现跨级组件之间的数据共享和传递。

```javascript
// Vuex 示例
// store.js
export default new Vuex.Store({
  state: {
    globalMessage: 'Hello from Vuex'
  },
  mutations: {
    updateMessage(state, newMessage) {
      state.globalMessage = newMessage;
    }
  },
  getters: {
    getMessage(state) {
      return state.globalMessage;
    }
  }
});

// 父组件
<template>
  <div>
    <child-component></child-component>
    <grandchild-component></grandchild-component>
  </div>
</template>
<script>
import { mapGetters, mapMutations } from 'vuex';

export default {
  computed: {
    ...mapGetters(['getMessage'])
  },
  methods: {
    ...mapMutations(['updateMessage'])
  },
  mounted() {
    this.updateMessage('Message updated from Parent');
  }
};
</script>

```

```javascript
// 子孙组件
<template>
  <div>{{ getMessage }}</div>
</template>
<script>
import { mapGetters } from 'vuex';

export default {
  computed: {
    ...mapGetters(['getMessage'])
  }
};
</script>

```

+ **使用 Provide/Inject** ：在 Vue 2 中，还可以使用 `provide` 和 `inject` 选项来实现跨级组件之间的数据传递。父组件通过 `provide` 提供数据，子孙组件通过 `inject` 注入数据。这种方式适用于祖先组件向多个子孙组件提供共享数据的场景，但需要注意其使用场景和潜在的性能问题。

```javascript
// 祖父组件
<script>
export default {
  provide() {
    return {
      theme: this.theme,
      changeTheme: this.changeTheme
    };
  },
  data() {
    return {
      theme: 'light'
    };
  },
  methods: {
    changeTheme(newTheme) {
      this.theme = newTheme;
    }
  }
};
</script>

```

```javascript
// 子孙组件
<script>
export default {
  inject: ['theme', 'changeTheme'],
  mounted() {
    console.log('Current Theme:', this.theme);
    this.changeTheme('dark');
  }
};
</script>

```

#### 6. 说一下 history 和 hash 模式有什么不同
在 Vue Router 中，提供了两种路由模式：history 模式和 hash 模式。它们主要用于处理前端路由的 URL 格式和浏览器历史记录管理，以下是它们的主要区别：

路由器（vue-router）有两种工作模式：hash模式和history模式，默认是hash模式。

“hash 和 history 的不同”主要有以下几点：

1. hash 模式的 URL 中带有“#”，history 模式不带“#”。
2. 若想让 URL 更加规范，适合开发的话推荐使用 history 模式，因为它是一个正常的 URL。
3. 使用 Vue 或 React 做的页面想分享到第三方 app 时，如果有的 app 规定 URL 中不能带“#”，就只能使用 history 路由模式。
4. hash 模式所有浏览器天生支持，而 history 模式内部使用的是 H5 中提供的 API，兼容性没有 hash 模式好。
5. history 模式如果没有对应的路由规则，可能会发起一个真正的请求，需要后端来处理，否则会产生 404 错误

RESTful 风格：这种风格强调以资源为中心，将网络上的一切都视为资源，通过标准的 HTTP 方法（如 GET、POST、PUT、DELETE 等）对资源进行操作，以实现数据的获取、创建、更新和删除。

**URL 格式**

+ **hash 模式** ：URL 中包含一个井号（`#`），路由路径出现在井号之后。例如：`http://example.com/#/users/1`。井号后面的部分被称为片段标识符（fragment identifier），不会被发送到服务器，而是由浏览器自行处理。
+ **history 模式** ：URL 看起来像一个完整的路径，没有井号。例如：`http://example.com/users/1`。这种 URL 更加美观和符合 RESTful 风格，对用户体验也更友好。

**浏览器历史管理**

+ **hash 模式** ：利用浏览器的 `hashchange` 事件和 `location.hash` 属性来实现前端路由的切换和历史记录管理。每次路由变化时，只会改变 URL 中的哈希部分，不会重新加载页面，浏览器也不会向服务器发送请求。
+ **history 模式** ：借助 HTML5 的 History API（如 `pushState`、`replaceState` 等方法）来实现前端路由的切换和历史记录管理。与 hash 模式类似，history 模式也不会导致页面重新加载，但它可以直接修改 URL 的路径部分，而无需使用井号。

**服务器配置要求**

+ **hash 模式** ：在 hash 模式下，所有的路由请求都会被发送到同一个后端资源（通常是入口 HTML 文件），后端服务器无需进行特殊配置。因为井号后面的内容不会被发送到服务器，服务器只需要处理到井号之前的部分。
+ **history 模式** ：在 history 模式下，由于 URL 是完整的路径格式，后端服务器需要进行特殊配置，以确保所有路由请求都能正确返回前端应用的入口 HTML 文件。否则，当用户直接访问一个非根路径的路由时（如 `http://example.com/users/1`），服务器可能会返回 404 错误，因为它尝试查找对应的服务器端资源而找不到。

#### 7. 是否了解过若依框架，简单的说说
基于 Spring Boot、Vue 的前后端分离开源框架，提供权限管理、代码生成器、工作流等功能，适合快速搭建企业级应用。

#### 8. 在严格模式下有哪些限制
+ 变量必须先声明
+ 不能删除不可删除的属性
+ 函数参数不能重名
+ 禁止使用 with 语句
+ 不允许八进制字面量
+ this 在全局作用域和函数中为 undefined
+ 禁止 eval 创建变量
+ 保留一些未来关键字（如 implements、interface 等）

### 1. 有没有自己亲手搭建一个微前端项目
是的，我曾主导过一个电商平台的微前端改造项目。该项目采用了 qiankun 框架，将原有单一应用拆分为`主应用`、`商品管理`、`用户中心`和`订单系统`四个子应用。主应用负责路由分发和全局状态管理，子应用则专注于各自业务逻辑。为解决跨应用通信问题，我们封装了统一的事件总线，并通过 webpack5 的 Module Federation 实现了组件共享。

### 2. 一个 Vue 项目的搭建流程
按照nodejs-搭建脚手架-进入项目安装依赖-安装项目需要的UI框架或插件-跑起来项目

### 3. 上家公司遵循的什么代码规范
我们有自己的公司的代码规范要求，这个比较多，我可以发给您看看

### 5. v2 的 Object.defineProperty 的缺陷
1. **无法检测属性新增 / 删除**：需使用`Vue.set`/`Vue.delete`
2. **数组变更劫持有限**：直接修改数组长度或通过索引赋值无法触发更新
3. **深层对象需要递归监听**：初始化时需遍历所有嵌套属性，影响性能
4. **Map/Set 等新数据结构不支持**：只能处理对象和数组

### 8. Vue 基本类型
Vue 组件选项主要包含以下类型：

+ **数据**：`data()`、`props`、`computed`、`watch`
+ **DOM**：`template`、`render`函数
+ **生命周期**：`created`、`mounted`、`updated`等
+ **方法**：`methods`
+ **资源**：`components`、`directives`、`filters`
+ **组合式 API**：`setup()`、`ref`、`reactive`等

### 9. 有没有了解过混入
混入是一种在 Vue.js 中复用组件逻辑的方式，它可以将多个组件共用的逻辑抽象出来，便于在不同的组件中使用。

#### 混入的定义

混入是一个包含 Vue 组件选项的对象，它可以包含数据、计算属性、方法、生命周期钩子等。

当组件使用混入时，混入中的选项会被混合到组件的选项中。如果组件和混入中有相同的选项（如数据属性、方法名等），组件中的选项会覆盖混入中的选项。

#### 混入的使用场景

+ **逻辑复用** ：当多个组件需要共享相同的逻辑时，可以将其提取到一个混入中，避免重复代码。
+ **代码组织** ：将特定功能的逻辑（如表单验证、API 请求处理等）放在混入中，使组件代码更加清晰、模块化。

#### 全局混入和局部混入

+ **全局混入** ：通过 `Vue.mixin()` 方法注册全局混入，所有组件都会自动包含这个混入的选项。全局混入应该谨慎使用，因为它会影响所有组件，可能导致难以调试的问题。

```javascript
// Vue 2.x 示例
Vue.mixin({
  created() {
    console.log('Global mixin: Component created');
  }
});
```

+ **局部混入** ：在组件中通过 `mixins` 选项引入混入，只在该组件中使用混入的逻辑。这是更常见的混入使用方式，能够更好地控制混入的作用范围。

```javascript
// 在组件中使用局部混入
export default {
  mixins: [myMixin],
  created() {
    console.log('Component created');
    console.log(this.mixinData); // 输出 'Data from mixin'
  },
  methods: {
    componentMethod() {
      this.mixinMethod(); // 调用混入中的方法
    }
  }
}
```

### 10. 怎么判断类型
在 JavaScript 中，判断数据类型可以通过多种方式实现，以下是一些常见的类型判断方法：

#### 1. 使用 `typeof` 运算符
`typeof` 是一个一元运算符，用于返回变量或表达式的类型。它可以判断基本数据类型，但对于 `null` 和引用类型（如对象、数组等）的判断结果可能与预期不符。

#### 2. 使用 `instanceof` 运算符
`instanceof` 运算符用于检测一个对象是否是某个构造函数的实例。它适用于判断引用类型（如数组、日期对象等），但对于基本数据类型和 `null` 的判断无效。

```javascript
console.log({} instanceof Object); // true
console.log([] instanceof Array); // true
console.log(new Date() instanceof Date); // true
console.log('Hello' instanceof String); // false
console.log(123 instanceof Number); // false
console.log(null instanceof Object); // false
```

#### 3. 使用 `Object.prototype.toString.call()` 方法
`Object.prototype.toString.call()` 方法可以返回对象的类型字符串，这是最可靠的方法之一，可以准确判断基本数据类型和引用数据类型，包括 `null` 和 `undefined`。

```javascript
console.log(Object.prototype.toString.call('Hello')); // '[object String]'
console.log(Object.prototype.toString.call(123)); // '[object Number]'
console.log(Object.prototype.toString.call(true)); // '[object Boolean]'
console.log(Object.prototype.toString.call(undefined)); // '[object Undefined]'
console.log(Object.prototype.toString.call(null)); // '[object Null]'
console.log(Object.prototype.toString.call({})); // '[object Object]'
console.log(Object.prototype.toString.call([])); // '[object Array]'
console.log(Object.prototype.toString.call(function() {})); // '[object Function]'
```

通过解析返回的字符串，可以判断数据的类型。

#### 4. 利用 ES6 的 `Array.isArray()` 方法
`Array.isArray()` 是 ES6 提供的专门用于判断是否为数组的方法，避免了其他方法对数组判断不准确的问题。

```javascript
console.log(Array.isArray([])); // true
console.log(Array.isArray({})); // false
```

#### 5. 利用其他内置对象的判断方法
对于特定的引用类型，如日期、正则表达式等，可以使用内置对象提供的判断方法：

```javascript
// 判断是否为日期对象
function isDate(obj) {
  return obj instanceof Date;
}

// 判断是否为正则表达式
function isRegExp(obj) {
  return obj instanceof RegExp;
}
```

### 11. 改变 this 的方法以及区别
在 JavaScript 中，`this` 的指向在不同的调用方式下会有所不同。为了改变函数内部 `this` 的指向，可以使用以下几种方法：

#### 1. `call()` 方法
`call()` 方法调用一个函数，并指定函数内部 `this` 的值，还可以传递参数给函数。语法如下：

```javascript
function.call(thisArg, arg1, arg2, ...)
```

#### 2. `apply()` 方法
`apply()` 方法与 `call()` 类似，也用于指定函数内部 `this` 的值并调用函数，但参数的传递方式不同，`apply()` 接收一个参数数组。语法如下：

```javascript
function.apply(thisArg, [argsArray])
```

#### 3. `bind()` 方法
`bind()` 方法创建一个新的函数，当这个新函数被调用时，`this` 的值被指定为提供的值，且传入的参数也会预设好。语法如下：

```javascript
const boundFunction = function.bind(thisArg, arg1, arg2, ...)
```

+ `call()`** 和 **`apply()` ：两者的主要区别在于参数的传递方式，`call()` 是逐个传递参数，而 `apply()` 是通过一个数组来传递参数。它们都可以立即调用函数，并改变函数内部的 `this` 指向。
+ `bind()` ：与 `call()` 和 `apply()` 不同，`bind()` 不会立即调用函数，而是返回一个新函数，这个新函数在被调用时会使用指定的 `this` 值和预设的参数。
+ **箭头函数** ：箭头函数中的 `this` 是在定义时捕获的，不能通过 `call()`、`apply()` 或 `bind()` 来改变。它适用于不需要改变 `this` 指向的场景，特别是在需要保留外层 `this` 值的情况下，如回调函数、事件处理程序等。

### 5. 是否对地图开发了解，用过哪些 API（要求说出 API 名字）
是的，我对地图开发有一定的了解，并且在项目中使用过多种地图 API。

#### 常用的地图 API
+ **高德地图 API** ：高德地图提供了丰富的 JavaScript API 和服务，用于开发各种地图应用。例如，可以使用高德地图 API 实现地图显示、定位、搜索、路线规划等功能。以下是一个简单的示例，展示如何使用高德地图 API 创建一个地图：

```html
<!DOCTYPE html>
<html>
<head>
  <title>高德地图示例</title>
  <style>
    #map-container {
      width: 600px;
      height: 400px;
    }
  </style>
  <script src="https://webapi.amap.com/maps?v=2.0&key=your_api_key"></script>
</head>
<body>
  <div id="map-container"></div>
  <script>
    // 初始化地图
    var map = new AMap.Map('map-container', {
      center: [116.397428, 39.90923], // 北京市中心坐标
      zoom: 11 // 设置地图显示的缩放级别
    });

    // 添加标记
    var marker = new AMap.Marker({
      position: [116.397428, 39.90923],
      title: '北京'
    });
    map.add(marker);
  </script>
</body>
</html>

```

在项目中，我们使用高德地图 API 实现了地图的基本显示、地点搜索、路径规划等功能。

+ **百度地图 API** ：百度地图 API 也是一套广泛使用的地图开发工具，提供了 JavaScript API、Web 服务 API 等多种接口，支持地图显示、定位、搜索、路线规划等丰富功能。以下是使用百度地图 JavaScript API 的一个简单示例：

```html
<!DOCTYPE html>
<html>
<head>
  <title>百度地图示例</title>
  <style>
    #map-container {
      width: 600px;
      height: 400px;
    }
  </style>
  <script src="https://api.map.baidu.com/map.js?v=2.0&ak=your_api_key"></script>
</head>
<body>
  <div id="map-container"></div>
  <script>
    // 初始化地图
    var map = new BMap.Map('map-container');
    var point = new BMap.Point(116.397428, 39.90923); // 北京市中心坐标
    map.centerAndZoom(point, 11); // 初始化地图，设置中心点和缩放级别

    // 添加标记
    var marker = new BMap.Marker(point);
    map.addOverlay(marker);
  </script>
</body>
</html>

```

在某个项目中，我们利用百度地图 API 实现了地图的加载、用户定位、周边搜索等功能。

+ **Leaflet** ：Leaflet 是一个轻量级、开源的地图 JavaScript 库，适用于移动设备和触摸屏。它提供了简单易用的 API，用于创建交互式地图。以下是使用 Leaflet 的示例代码：

```html
<!DOCTYPE html>
<html>
<head>
  <title>Leaflet 地图示例</title>
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
  <style>
    #map-container {
      width: 600px;
      height: 400px;
    }
  </style>
</head>
<body>
  <div id="map-container"></div>
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <script>
    // 初始化地图
    var map = L.map('map-container').setView([39.90923, 116.397428], 11);

    // 添加 OpenStreetMap 图层
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    // 添加标记
    L.marker([39.90923, 116.397428]).addTo(map)
      .bindPopup('北京')
      .openPopup();
  </script>
</body>
</html>

```

Leaflet 的特点是轻量级和高度定制化，适合需要快速加载和高度交互的地图应用。

+ **Mapbox** ：Mapbox 是一个功能强大的地图平台，提供了全球地图数据和丰富的 API，包括地图渲染、地理数据处理、自定义地图样式等功能。以下是使用 Mapbox GL JS 的示例：

```html
<!DOCTYPE html>
<html>
<head>
  <title>Mapbox 地图示例</title>
  <link href='https://api.mapbox.com/mapbox-gl-js/v3.3.1/mapbox-gl.css' rel='stylesheet' />
  <style>
    #map-container {
      width: 600px;
      height: 400px;
    }
  </style>
</head>
<body>
  <div id="map-container"></div>
  <script src='https://api.mapbox.com/mapbox-gl-js/v3.3.1/mapbox-gl.js'></script>
  <script>
    mapboxgl.accessToken = 'your_access_token';
    var map = new mapboxgl.Map({
      container: 'map-container',
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [116.397428, 39.90923], // 北京市中心坐标
      zoom: 11
    });

    // 添加标记
    new mapboxgl.Marker()
      .setLngLat([116.397428, 39.90923])
      .setPopup(new mapboxgl.Popup().setText('北京'))
      .addTo(map);
  </script>
</body>
</html>

```

在项目中，Mapbox 的自定义地图样式和数据可视化功能得到了广泛应用，例如创建热力图、绘制复杂地理数据等。

+ **ArcGIS API** ：ArcGIS API 是由 Esri 公司提供的强大地图开发工具，广泛应用于 GIS（地理信息系统）领域。它支持地图显示、空间分析、数据可视化等功能。以下是一个简单的 ArcGIS API 示例：

```html
<!DOCTYPE html>
<html>
<head>
  <title>ArcGIS 地图示例</title>
  <link rel="stylesheet" href="https://js.arcgis.com/4.28/esri/css/main.css" />
  <style>
    #map-container {
      width: 600px;
      height: 400px;
    }
  </style>
</head>
<body>
  <div id="map-container"></div>
  <script src="https://js.arcgis.com/4.28/"></script>
  <script>
    require([
      'esri/Map',
      'esri/views/MapView'
    ], function(Map, MapView) {
      var map = new Map({
        basemap: 'streets-vector'
      });

      var view = new MapView({
        container: 'map-container',
        map: map,
        center: [116.397428, 39.90923], // 北京市中心坐标
        zoom: 11
      });

      // 添加图形标记
      var graphicsLayer = new GraphicsLayer();
      view.map.add(graphicsLayer);

      var point = {
        type: 'point',
        longitude: 116.397428,
        latitude: 39.90923
      };

      var simpleMarkerSymbol = {
        type: 'simple-marker',
        color: [226, 119, 40],
        outline: {
          color: [255, 255, 255],
          width: 1
        }
      };

      var pointGraphic = new Graphic({
        geometry: point,
        symbol: simpleMarkerSymbol
      });

      graphicsLayer.add(pointGraphic);
    });
  </script>
</body>
</html>

```

ArcGIS API 在处理复杂的 GIS 数据和高级空间分析方面具有优势，适用于专业地理信息系统应用的开发。

### 6. 权限开发（具体怎么实现，如按钮权限）
在权限开发中，按钮权限的实现是一个常见的需求，以下是几种常见的实现方式：

#### 方案一：使用 `v-if` 判断
在 Vue 中，可以通过 `v-if` 指令根据用户权限动态控制按钮的显示与隐藏。这种方式简单直观，但适用于页面较少、权限逻辑不复杂的场景。

用户登录后，后端返回用户的权限列表，前端将其存储在 Vuex 或组件的 `data` 中。在模板中使用 `v-if` 指令判断用户是否具有相应权限，若没有权限则不渲染按钮。

#### 方案二：通过自定义指令进行按钮权限判断
定义一个全局自定义指令，用于控制按钮的显示与隐藏。这种方式将权限逻辑封装在指令中，使模板代码更加简洁，便于维护。

在模板中使用自定义指令 `v-permission`，绑定按钮所需的权限列表。指令在挂载时检查用户是否具有所需权限，若没有权限则移除按钮元素。

### 华云信息面试题解析

#### 1. 有没有用过包管理工具？
是的，我在项目中使用过以下包管理工具：

+ **npm**：Node.js官方默认包管理器，功能全面，生态丰富
+ **pnpm**：通过硬链接和符号链接实现磁盘空间复用，安装速度更快
+ **yarn**：Facebook推出的高性能包管理器，支持离线安装和确定性依赖解析

#### 2. pnpm和npm有什么区别？

| 特性 | pnpm | npm |
| --- | --- | --- |
| 依赖存储方式 | 扁平结构 + 硬链接（磁盘空间复用） | 嵌套结构（可能导致依赖冗余） |
| 安装速度 | 快（基于内容寻址存储） | 较慢（需重复下载相同依赖） |
| 锁定文件 | pnpm-lock.yaml | package-lock.json |
| 对monorepo支持 | 内置workspace支持 | 需要额外配置 |
| 执行脚本 | 自动暴露依赖二进制文件 | 需要通过npx执行 |

#### 5. WebGL API

WebGL中常用的API包括：

+ **着色器相关**：`gl.createShader()`、`gl.compileShader()`、`gl.attachShader()`
+ **缓冲区操作**：`gl.createBuffer()`、`gl.bindBuffer()`、`gl.bufferData()`
+ **纹理处理**：`gl.createTexture()`、`gl.texImage2D()`、`gl.generateMipmap()`
+ **绘制命令**：`gl.drawArrays()`、`gl.drawElements()`
+ **状态管理**：`gl.enable()`、`gl.disable()`、`gl.clearColor()`

#### 7. 怎么取一个对象的key属性？

获取对象key的常用方法：

1. **Object.keys(obj)**：返回自身可枚举属性的数组（不含Symbol类型）
2. **Object.getOwnPropertyNames(obj)**：返回所有自有属性（包括不可枚举但不含Symbol）
3. **Reflect.ownKeys(obj)**：返回所有自有属性（包括不可枚举和Symbol类型）
4. **for...in循环**：遍历对象自身和继承的可枚举属性
5. **Object.getOwnPropertySymbols(obj)**：专门获取Symbol类型的key

#### 9. TypeScript泛型

泛型是TypeScript中实现类型参数化的工具，允许创建可复用的组件，同时保持类型安全。例如：

```typescript
// 泛型函数：返回传入的值
function identity<T>(arg: T): T {
  return arg;
}

// 使用泛型约束
interface Lengthwise {
  length: number;
}

function getLength<T extends Lengthwise>(arg: T): number {
  return arg.length;
}

// 泛型类
class GenericNumber<T> {
  zeroValue: T;
  add: (x: T, y: T) => T;
}
```

泛型的主要应用场景：

+ 容器类（如数组、Map）
+ 函数重载
+ 高阶组件和装饰器
+ API响应数据结构定义

#### 11. 有没有用过构建工具？

是的，我使用过以下构建工具：

+ **Webpack**：功能强大的打包工具，支持各种loader和plugin，适合复杂项目
+ **Vite**：基于ES模块的构建工具，冷启动速度极快，适合开发体验优化
+ **Rollup**：专注于ES模块的打包，适合库开发
+ **gulp**：基于流的构建系统，主要用于文件处理和任务自动化

#### 12. XSS攻击和CSRF攻击及防护

##### XSS（跨站脚本攻击）
+ **原理**：攻击者通过注入恶意脚本到目标网站，当用户访问时执行脚本
+ **防护措施**：
    - 输入过滤：对用户输入进行严格校验，转义特殊字符
    - 输出编码：对动态渲染的内容进行HTML/JS编码
    - CSP（内容安全策略）：通过HTTP头限制页面可以加载的资源来源
    - HttpOnly Cookie：防止JavaScript访问敏感cookie

##### CSRF（跨站请求伪造）

+ **原理**：攻击者诱导已登录用户访问恶意网站，利用浏览器已保存的 Cookie 信息，伪装成合法用户向目标网站发送恶意请求，执行敏感操作（如转账、修改密码）。
+ **防护措施**：
    - 使用SameSite属性：设置Cookie的SameSite=Lax/Secure
    - CSRF令牌：在表单或请求中添加随机令牌，服务器验证
    - 验证请求来源：检查HTTP头中的Referer和Origin字段
    - 验证码：关键操作强制用户输入验证码

### 补充问题回答

#### 2. 单页面和多页面的区别
| 特性 | 单页面应用（SPA） | 多页面应用（MPA） |
| --- | --- | --- |
| 页面加载方式 | 首次加载后通过路由动态切换内容 | 每次请求都加载完整页面 |
| 路由实现 | 前端路由（如Vue Router） | 后端路由 |
| 性能 | 首屏加载慢，后续交互快 | 每次加载慢，但缓存利用率高 |
| SEO | 需特殊处理（如SSR） | 天然友好 |
| 开发难度 | 较高（状态管理、路由复杂度） | 较低 |
| 典型框架 | React/Vue/Angular | JSP/PHP/传统网站 |

#### 6. 手写实现
1. **虚拟DOM转真实DOM**

```javascript
function createElement(vnode) {
  const { tag, props, children } = vnode;
  const el = document.createElement(tag);
  
  // 设置属性
  for (const key in props) {
    el.setAttribute(key, props[key]);
  }
  
  // 处理子节点
  if (typeof children === 'string') {
    el.textContent = children;
  } else if (Array.isArray(children)) {
    children.forEach(child => {
      el.appendChild(createElement(child));
    });
  }
  
  return el;
}
```

2. **防抖函数**

```javascript
function debounce(func, delay) {
  let timer;
  return function(...args) {
    clearTimeout(timer);
    timer = setTimeout(() => {
      func.apply(this, args);
    }, delay);
  };
}
```

3. **数组转树形结构**

```javascript
function arrayToTree(arr) {
  const map = {};
  const roots = [];
  
  // 先构建所有节点的映射
  arr.forEach(item => {
    map[item.id] = { ...item, children: [] };
  });
  
  // 构建树形结构
  arr.forEach(item => {
    const node = map[item.id];
    if (item.parentId === null) {
      roots.push(node);
    } else {
      const parent = map[item.parentId];
      if (parent) parent.children.push(node);
    }
  });
  
  return roots;
}
```

#### 8. v-model的原理
在Vue中，v-model是一个语法糖，其原理是：

+ **表单输入元素**：绑定`value`属性并监听`input`事件

```vue
<input v-model="message">
<!-- 等价于 -->
<input :value="message" @input="message = $event.target.value">
```

+ **自定义组件**：通过`modelValue` prop和`update:modelValue`事件实现

```vue
<!-- 子组件 -->
<input :value="modelValue" @input="$emit('update:modelValue', $event.target.value)">

<!-- 父组件 -->
<CustomInput v-model="message" />
```

#### 10. 插槽类型
+ **默认插槽**：用于传递单个内容块

```vue
<!-- 父组件 -->
<MyComponent>默认内容</MyComponent>

<!-- 子组件 -->
<slot>后备内容</slot>

```

+ **具名插槽**：用于传递多个内容块

```vue
<!-- 父组件 -->
<MyComponent>
  <template #header>头部内容</template>
  <template #footer>底部内容</template>
</MyComponent>

<!-- 子组件 -->
<slot name="header"></slot>
<slot></slot> <!-- 默认插槽 -->
<slot name="footer"></slot>

```

+ **作用域插槽**：允许子组件向父组件传递数据

```vue
<!-- 子组件 -->
<slot :user="user"></slot>

<!-- 父组件 -->
<MyComponent>
  <template #default="slotProps">
    {{ slotProps.user.name }}
  </template>
</MyComponent>

```

#### 11. 路由配置与传参
1. **路由配置示例**

```javascript
const routes = [
  {
    path: '/user/:id', // 动态路由匹配
    name: 'User',
    component: User,
    props: true, // 布尔模式
    meta: { requiresAuth: true }, // 路由元信息
    children: [
      { path: 'profile', component: UserProfile }
    ]
  },
  {
    path: '/redirect',
    redirect: { name: 'Home' } // 重定向
  },
  {
    path: '/alias',
    alias: '/alternative' // 别名
  }
];
```

2. **路由传参区别**

| 传参方式 | 语法 | 参数位置 | 刷新后是否保留 |
| --- | --- | --- | --- |
| params | `/user/123` | 路由路径中 | 是 |
| query | `/user?id=123` | URL查询字符串 | 是 |
| props | 通过props选项传递 | 组件props | 否（需自行处理） |

3. **路由组件传参模式**
+ **布尔模式**：`props: true`，将params转为props
+ **对象模式**：`props: { staticProp: 'value' }`，传递静态值
+ **函数模式**：

```javascript
props: route => ({
  id: Number(route.params.id),
  query: route.query.search
})
```

#### 12. 导航守卫与路由特性
1. **导航守卫类型**
    - **全局前置守卫**：`router.beforeEach((to, from, next) => {})`
    - **路由独享守卫**：`beforeEnter: (to, from, next) => {}`
    - **组件内守卫**：`beforeRouteEnter`、`beforeRouteUpdate`、`beforeRouteLeave`
    - **全局解析守卫**：`router.beforeResolve()`
    - **全局后置钩子**：`router.afterEach((to, from) => {})`
2. **路由元信息（meta）**

```javascript
{
  path: '/admin',
  component: Admin,
  meta: { requiresAuth: true }
}
```

    - 用于存储路由相关的自定义数据
    - 在导航守卫中可以检查meta字段进行权限控制
3. **重定向与别名**
    - **重定向**：用户访问原路径时自动跳转到目标路径

```javascript
{ path: '/old-path', redirect: '/new-path' }
```

    - **别名**：为现有路径提供一个替代访问路径

```javascript
{ path: '/home', component: Home, alias: '/index' }
```

4. **动态路由匹配**
    - 使用冒号定义路径参数：`/user/:id`
    - 匹配任意路径：`/catch-all(.*)`
    - 可选参数：`/optional-param?`

### 5. Echarts 使用要点
Echarts 是强大的数据可视化库，以下是常见图表的初始化和核心属性：

#### 初始化步骤
1. 引入 Echarts 库
2. 创建 DOM 容器
3. 初始化图表实例
4. 设置配置项并渲染

```javascript
// 初始化示例
const chartDom = document.getElementById('main');
const myChart = echarts.init(chartDom);
const option = {
  title: { text: '数据可视化' },
  tooltip: {},
  xAxis: { data: ['周一', '周二', '周三'] },
  yAxis: {},
  series: [{
    name: '销量',
    type: 'bar',
    data: [5, 20, 36]
  }]
};
myChart.setOption(option);
```

#### 常用图表类型
+ **柱状图/折线图**：使用 `type: 'bar'` 或 `'line'`
+ **饼图**：需要 `radius` 和 `center` 属性
+ **雷达图**：配合 `radar` 配置项
+ **地图**：需引入地图数据，设置 `map: 'china'`
+ **仪表盘**：使用 `type: 'gauge'`

### 6. Vuex 核心模块与使用
Vuex 由五个核心模块组成：

1. **State**：存储应用状态
2. **Mutations**：修改 state 的唯一途径（同步）
3. **Getters**：计算属性式的 state 访问
4. **Actions**：处理异步操作
5. **Modules**：将 store 分割为模块

#### 页面调用方式
```javascript
// 直接调用
this.$store.state.count;
this.$store.commit('increment');
this.$store.dispatch('asyncIncrement');

// 辅助函数（推荐）
import { mapState, mapMutations, mapActions } from 'vuex';

export default {
  computed: {
    ...mapState(['count']),
    ...mapGetters(['doubleCount'])
  },
  methods: {
    ...mapMutations(['increment']),
    ...mapActions(['asyncIncrement'])
  }
}
```

### 11. Vue 的 Diff 算法
Vue 的虚拟 DOM 比较采用 **双指针 + 同层比较** 策略：

1. **同级比较**：只比较同一层级的节点
2. **key 唯一性**：通过 key 识别相同节点
3. **差异更新**：只更新变化的部分
4. **核心优化策略**：
    - 相同类型节点：保留 DOM 只更新属性
    - 不同类型节点：直接替换
    - 列表对比采用 **最长递增子序列** 优化移动操作

### 12. v-for 中 index 作为 key 的问题
**不推荐用 index 作为 key 的原因**：

1. **数据顺序变化时**：会导致不必要的 DOM 重建
2. **状态错乱**：如表单输入状态丢失
3. **性能损耗**：频繁重渲染而非移动元素

**正确做法**：使用数据的唯一标识（如 ID）作为 key

### 14. 父传子数据不响应问题
当父组件数据动态变化时，子组件可能无法自动更新，解决方案：

1. **使用 watch 监听 props**

```javascript
export default {
  props: ['parentData'],
  watch: {
    parentData(newVal) {
      // 更新子组件状态
      this.childData = newVal;
    }
  }
}
```

2. **使用 computed 属性**

```javascript
computed: {
  processedData() {
    return this.parentData.map(item => item * 2);
  }
}
```

### 16. 首屏优化策略
1. **基础配置**：
    - 添加 `publicPath` 或 `base: './'` 配置
    - 启用 Gzip 压缩
    - 分割 CSS 和 JS 资源
2. **代码分割**：

```javascript
// Vue Router 路由懒加载
const Home = () => import('./views/Home.vue');
```

3. **资源加载优化**：
    - 使用 CDN 加速第三方库
    - 图片懒加载
    - 预加载关键资源：`<link rel="preload">`
4. **SSR/SSG**：使用 Nuxt.js 等框架实现服务端渲染

### 17. JS 单线程与任务队列
JavaScript 是单线程语言，通过 **事件循环（Event Loop）** 处理异步任务：

但单线程的缺点是遇到耗时操作（如网络请求、定时器）会阻塞后续任务。为解决这一问题，JavaScript 引入了**任务队列**和**事件循环**机制。

1. **执行栈**：同步任务直接执行
2. **任务队列**：**任务队列的细化：宏任务与微任务**

**宏任务**：setTimeout、setInterval、I/O、UI渲染

**微任务**：Promise.then、MutationObserver、process.nextTick

+ `Promise` 的 `then/catch/finally`
+ `async/await`（基于 Promise 实现）

- **Promise的then方法**：Promise对象状态改变时，其回调会被放入微任务队列。
- **MutationObserver**：用于监听DOM变化，回调函数会被放入微任务队列。
- **process.nextTick**（在Node.js环境中）：将回调函数放入当前执行栈的微任务队列中。

3. **执行顺序**：
    1. 执行完所有同步代码
    2. 处理微任务队列中的所有任务
    3. 执行一个宏任务
    4. 重复步骤2-3

### 18. Echarts 大数据性能优化
当数据加载较慢时，可针对坐标轴进行以下优化：

1. **数据采样**：

```javascript
// 启用数据采样，只在需要时绘制部分点
series: [{
  type: 'line',
  sampling: 'average', // 平均值采样
  large: true, // 开启大数据模式
  data: [...]
}]
```

2. **坐标轴配置优化**：

```javascript
xAxis: {
  type: 'category',
  boundaryGap: false, // 坐标轴两边不留白
  axisLabel: {
    interval: 5, // 每隔5个标签显示一个
    rotate: 45 // 标签旋转角度
  }
},
yAxis: {
  type: 'value',
  splitLine: { show: false } // 隐藏网格线
}
```

3. **分块加载**：使用 `setOption` 分批更新数据

### 19. 数组去重方法
```javascript
// 1. Set（ES6）
const uniqueArray = [...new Set(arr)];

// 2. filter + indexOf
const uniqueArray = arr.filter((item, index) => 
  arr.indexOf(item) === index
);

// 3. reduce + includes
const uniqueArray = arr.reduce((acc, curr) => 
  acc.includes(curr) ? acc : [...acc, curr], []
);

// 4. 针对对象数组（根据ID去重）
const uniqueArray = [...new Map(
  arr.map(item => [item.id, item])
).values()];
```

### 20. Token 过期处理方案
1. **前端拦截**：

```javascript
// axios 拦截器示例
axios.interceptors.response.use(
  response => response,
  error => {
    if (error.response.status === 401) {
      // 清除本地token
      localStorage.removeItem('token');
      // 跳转登录页
      router.push('/login');
    }
    return Promise.reject(error);
  }
);
```

2. **自动刷新 Token**：

```javascript
// 配合 refresh_token 实现无感刷新
const refreshToken = async () => {
  try {
    const res = await axios.post('/api/refresh-token', {
      refresh_token: localStorage.getItem('refresh_token')
    });
    localStorage.setItem('token', res.data.token);
    return Promise.resolve();
  } catch (error) {
    return Promise.reject();
  }
};
```

3. **登录态管理**：
    - 使用 Vuex/Pinia 集中管理 token
    - 设置 token 过期时间校验

### 28. 定位功能所需字段
通过定位显示附近商铺，需向后端传递：

1. **必传字段**：
    - 经纬度（latitude, longitude）
    - 搜索半径（radius，单位：米）
    - 分页信息（page, pageSize）
2. **可选字段**：
    - 分类筛选（category）
    - 排序方式（sortBy：distance, rating等）
    - 关键词搜索（keyword）
    - 价格区间（priceRange）
    - 评分筛选（rating）
    - 返回数量限制（limit）
    - 定位精度（accuracy，可选）
3. **示例请求**：

```plain
GET /api/shops/nearby?lat=39.9042&lng=116.4074&radius=5000&page=1&pageSize=20&category=restaurant
```

4. **按业务补充的上下文字段**：
    - `userId`：用于个性化推荐、收藏态判断
    - `deviceId`：用于设备分析、灰度策略
    - `minPrice/maxPrice`：比单个 priceRange 更方便后端直接过滤

### 29. 路由传参（params vs query）
Vue Router 提供两种主要传参方式：

#### params（路径参数）
+ 通过动态路由匹配定义
+ 路径中直接包含参数
+ 刷新页面后参数保留
+ **示例**：

```javascript
// 路由配置
{ path: '/user/:id', name: 'User' }

// 传递参数
this.$router.push({ name: 'User', params: { id: 123 } });

// 访问参数
this.$route.params.id
```

#### query（查询参数）
+ 通过 URL 查询字符串传递
+ 参数不包含在路径定义中
+ 刷新页面后参数保留
+ **示例**：

```javascript
// 传递参数
this.$router.push({ path: '/user', query: { name: 'John' } });

// 生成 URL: /user?name=John

// 访问参数
this.$route.query.name
```

#### 核心区别
| 特性 | params | query |
| --- | --- | --- |
| 路径表现 | /user/123 | /user?name=John |
| 路由配置 | 需要定义动态路径 | 无需特殊配置 |
| 参数类型 | 仅限字符串 | 任意类型（序列化后） |
| 刷新保留 | 是 | 是 |

### 30. 支付、第三方登录与退款
#### 支付流程（以微信/支付宝为例）
1. 前端收集订单信息，调用后端支付API
2. 后端生成支付链接/二维码/SDK参数
3. 前端唤起支付客户端（浏览器/APP）
4. 监听支付结果（轮询/回调通知）
5. 更新订单状态

#### 第三方登录（以微信为例）
1. 前端调用微信登录接口，获取授权码
2. 将授权码发送至后端
3. 后端换取用户唯一标识（openid）和访问令牌
4. 后端生成自定义登录态（如JWT）返回前端
5. 前端存储登录态并跳转

#### 退款流程
1. 前端提交退款申请，携带订单ID
2. 后端校验退款条件，调用支付平台退款API
3. 支付平台处理退款并返回结果
4. 后端更新订单状态，通知前端

### 31. v-for 与 v-if 的优先级及 v-show 区别
#### v-for 与 v-if 优先级
+ **Vue 2 中 v-for 优先级高于 v-if**
+ 这意味着 v-if 会在每个 v-for 迭代中都执行一次
+ **问题**：即使条件不满足，也会渲染整个列表
+ **推荐做法**：优先使用计算属性过滤数据

### 32. Cookie、LocalStorage、SessionStorage 区别
| 特性 | Cookie | LocalStorage | SessionStorage |
| --- | --- | --- | --- |
| 存储大小 | 4KB 左右 | 5-10MB | 5-10MB |
| 有效期 | 可设置过期时间 | 永久存储，需手动清除 | 会话结束（窗口关闭） |
| 数据传输 | 随 HTTP 请求发送到服务器 | 仅在客户端存储 | 仅在客户端存储 |
| 作用域 | 基于域名和路径 | 基于域名 | 基于域名和窗口 |
| 访问权限 | 可通过 JS 和服务器端访问 | 仅 JS 访问 | 仅 JS 访问 |

### 33. 记住密码功能实现
1. **登录页面表单**：

```vue
<template>
  <form @submit="handleLogin">
    <input v-model="username" type="text" placeholder="用户名">
    <input v-model="password" type="password" placeholder="密码">
    <label>
      <input type="checkbox" v-model="rememberMe"> 记住密码
    </label>
    <button type="submit">登录</button>
  </form>
</template>

```

2. **登录逻辑处理**：

```javascript
methods: {
  async handleLogin() {
    try {
      const response = await this.$axios.post('/api/login', {
        username: this.username,
        password: this.password
      });
      
      // 登录成功
      if (this.rememberMe) {
        // 加密存储敏感信息
        localStorage.setItem('rememberedUser', btoa(this.username));
        localStorage.setItem('rememberedPass', btoa(this.password));
      } else {
        localStorage.removeItem('rememberedUser');
        localStorage.removeItem('rememberedPass');
      }
      
      // 存储 token 等信息
      this.$store.commit('SET_TOKEN', response.data.token);
      this.$router.push('/dashboard');
    } catch (error) {
      this.$message.error('登录失败，请检查用户名和密码');
    }
  }
}
```

3. **自动填充逻辑**：

```javascript
mounted() {
  const rememberedUser = localStorage.getItem('rememberedUser');
  const rememberedPass = localStorage.getItem('rememberedPass');
  
  if (rememberedUser && rememberedPass) {
    this.username = atob(rememberedUser);
    this.password = atob(rememberedPass);
    this.rememberMe = true;
  }
}
```

### 34. 大数据量性能优化
当页面数据量过大导致卡顿时，可采取以下措施：

#### 1. 分页加载
+ 前端实现分页控件
+ 后端提供分页接口（limit/offset 或 cursor）
+ **示例**：

```javascript
// 加载数据方法
async loadData(page = 1) {
  this.loading = true;
  try {
    const response = await this.$axios.get('/api/data', {
      params: { page, pageSize: 20 }
    });
    this.dataList = response.data.items;
    this.total = response.data.total;
  } catch (error) {
    this.$message.error('加载数据失败');
  } finally {
    this.loading = false;
  }
}
```

#### 2. 虚拟滚动
+ 只渲染可视区域的元素
+ 推荐使用第三方库如 vue-virtual-scroller
+ **示例**：

```vue
<template>
  <RecycleScroller
    class="items-list"
    :items="bigList"
    :item-size="32"
    v-slot="{ item }"
  >
    <div class="item">{{ item.name }}</div>
  </RecycleScroller>
</template>

<script>
import { RecycleScroller } from 'vue-virtual-scroller';
import 'vue-virtual-scroller/dist/vue-virtual-scroller.css';

export default {
  components: { RecycleScroller },
  data() {
    return {
      bigList: Array.from({ length: 100000 }, (_, i) => ({
        id: i,
        name: `Item ${i}`
      }))
    };
  }
};
</script>

```

#### 3. 数据聚合（点聚合）
+ 地图场景下，将密集点合并为聚合点
+ 距离相近的数据点显示为一个聚合图标
+ 推荐库：leaflet.markercluster

#### 4. 懒加载与渐进式加载
+ 图片懒加载（Intersection Observer API）
+ 数据分批次加载

### 35. 上传文件进度条实现
#### 原生 XHR 方案
```javascript
uploadFile(file) {
  const xhr = new XMLHttpRequest();
  xhr.open('POST', '/api/upload', true);
  
  // 监听进度事件
  xhr.upload.onprogress = (e) => {
    if (e.lengthComputable) {
      const percentComplete = (e.loaded / e.total) * 100;
      this.uploadProgress = percentComplete;
    }
  };
  
  xhr.onload = () => {
    if (xhr.status === 200) {
      this.$message.success('上传成功');
    } else {
      this.$message.error('上传失败');
    }
  };
  
  const formData = new FormData();
  formData.append('file', file);
  xhr.send(formData);
}
```

#### axios 方案
```javascript
async uploadFile(file) {
  try {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await this.$axios.post('/api/upload', formData, {
      onUploadProgress: (progressEvent) => {
        const percentCompleted = Math.round(
          (progressEvent.loaded * 100) / progressEvent.total
        );
        this.uploadProgress = percentCompleted;
      }
    });
    
    this.$message.success('上传成功');
    return response.data;
  } catch (error) {
    this.$message.error('上传失败');
    return null;
  }
}
```

#### 前端展示
```vue
<template>
  <div>
    <input type="file" @change="handleFileSelect">
    <div v-if="uploadProgress > 0 && uploadProgress < 100">
      <div class="progress-bar" :style="{ width: uploadProgress + '%' }"></div>
      <span>{{ uploadProgress }}%</span>
    </div>
  </div>
</template>

```

### 3. Echarts 在项目中的应用模块
在实际项目中，我使用 Echarts 实现过以下模块：

1. **数据可视化仪表盘**：包含趋势图、占比分析、KPI 指标卡
2. **销售数据监控**：使用柱状图和折线图展示月度/季度销售数据
3. **用户分布地图**：基于地理位置的用户分布热力图
4. **雷达图分析**：产品多维度性能对比分析
5. **实时监控系统**：通过动态数据更新实现系统指标监控
6. **财务分析面板**：使用饼图展示收入结构，K 线图分析股票走势

### 4/5. Echarts 初始化方法
#### 基础初始化流程
```javascript
// 1. 引入 Echarts
import * as echarts from 'echarts';

export default {
  mounted() {
    // 2. 获取 DOM 容器
    const chartDom = this.$refs.chartContainer;
    
    // 3. 初始化图表实例
    this.myChart = echarts.init(chartDom);
    
    // 4. 设置配置项
    const option = {
      title: { text: '销售额趋势图' },
      xAxis: { type: 'category', data: ['1月', '2月', '3月'] },
      yAxis: { type: 'value' },
      series: [{
        name: '销售额',
        type: 'line',
        data: [120, 200, 150]
      }]
    };
    
    // 5. 应用配置并渲染
    this.myChart.setOption(option);
    
    // 6. 监听窗口大小变化，自适应调整
    window.addEventListener('resize', () => {
      this.myChart.resize();
    });
  },
  
  beforeDestroy() {
    // 7. 销毁图表实例释放资源
    if (this.myChart) {
      this.myChart.dispose();
      this.myChart = null;
    }
  }
}
```

#### 封装 Echarts 组件
为了复用，我通常会封装一个通用组件：

```vue
<template>
  <div ref="chartContainer" class="chart-container"></div>
</template>
<script>
import * as echarts from 'echarts';

export default {
  props: {
    chartOption: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      myChart: null
    };
  },
  mounted() {
    this.initChart();
  },
  watch: {
    chartOption: {
      deep: true,
      handler() {
        this.updateChart();
      }
    }
  },
  methods: {
    initChart() {
      this.myChart = echarts.init(this.$refs.chartContainer);
      this.updateChart();
      
      window.addEventListener('resize', () => {
        this.myChart.resize();
      });
    },
    updateChart() {
      this.myChart.setOption(this.chartOption);
    }
  },
  beforeDestroy() {
    if (this.myChart) {
      this.myChart.dispose();
      this.myChart = null;
    }
  }
}
</script>
<style scoped>
.chart-container {
  width: 100%;
  height: 400px;
}
</style>

```

### 10. 解决 Vue 项目打包空白问题
常见原因及解决方案：

1. **publicPath 配置错误**

```javascript
// vue.config.js
module.exports = {
  publicPath: process.env.NODE_ENV === 'production' ? './' : '/'
}
```

2. **路由模式问题**

```javascript
// router/index.js
const router = new VueRouter({
  mode: 'hash', // 使用 hash 模式替代 history 模式
  routes
})
```

3. **资源加载路径问题**
    - 确保静态资源引用使用相对路径
    - 检查 CSS 中背景图等资源路径
4. **构建工具配置问题**

```javascript
// vue.config.js 中配置资源压缩
module.exports = {
  chainWebpack: config => {
    config.plugins.delete('prefetch'); // 移除预加载插件
  }
}
```

5. **检查打包后文件**
    - 确认 dist 目录下是否生成了正确的 HTML 和 JS 文件
    - 使用 http-server 等工具本地测试打包结果

### 封装组件经验
我封装过多种类型的组件，包括：

1. **通用业务组件**
    - 带搜索功能的下拉选择器
    - 支持拖拽排序的列表组件
    - 日期范围选择器
2. **表单组件**
    - 带校验功能的表单输入组件
    - 级联选择器（省市区三级联动）
    - 文件上传组件（支持拖拽和预览）
3. **数据展示组件**
    - 分页表格组件（支持排序、筛选）
    - 卡片式数据展示组件
    - 动态数据统计卡片
4. **交互组件**
    - 自定义模态框（支持动画和回调）
    - 提示消息组件（toast/notification）
    - 步骤指示器组件

### 登录功能实现

#### 前端实现流程
1. **登录页面**

```vue
<template>
  <div class="login-container">
    <form @submit.prevent="handleLogin">
      <input v-model="username" placeholder="用户名" />
      <input v-model="password" type="password" placeholder="密码" />
      <button type="submit">登录</button>
    </form>
  </div>
</template>

```

2. **登录逻辑**

```javascript
methods: {
  async handleLogin() {
    try {
      const response = await this.$axios.post('/api/login', {
        username: this.username,
        password: this.password
      });
      
      // 存储 token
      localStorage.setItem('token', response.data.token);
      
      // 设置 axios 请求头
      this.$axios.defaults.headers.common['Authorization'] = 
        `Bearer ${response.data.token}`;
        
      // 跳转到首页
      this.$router.push('/dashboard');
    } catch (error) {
      this.$message.error('登录失败，请检查用户名和密码');
    }
  }
}
```

3. **路由守卫验证登录状态**

```javascript
router.beforeEach((to, from, next) => {
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth);
  const token = localStorage.getItem('token');
  
  if (requiresAuth && !token) {
    next('/login');
  } else {
    next();
  }
});
```

#### 后端实现要点
1. **用户认证**：验证用户名密码
2. **生成 Token**：使用 JWT 或 Session 机制
3. **权限验证**：基于角色的访问控制（RBAC）
4. **安全措施**：密码加密、防止暴力破解、CSRF 防护

### Number 类型精度问题解决方案
当处理长数字（如 ID、时间戳）时，JavaScript 的 Number 类型会失去精度。解决方案：

1. **后端处理**：将 Long 类型字段转为 String 返回
2. **前端处理**：使用 `json-bigint` 库解析响应

```javascript
import JSONbig from 'json-bigint';

// 配置 axios 使用 json-bigint 解析响应
axios.defaults.transformResponse = [data => {
  try {
    return JSONbig.parse(data);
  } catch (error) {
    return data;
  }
}];
```

3. **显示处理**：使用 `toLocaleString()` 格式化大数字

```javascript
const bigNumber = 1234567890123456789n;
console.log(bigNumber.toLocaleString()); // 1,234,567,890,123,456,789
```

### 拖动功能实现

#### 原生 JS 实现
```javascript
export default {
  data() {
    return {
      dragging: false,
      startX: 0,
      startY: 0,
      currentX: 0,
      currentY: 0
    };
  },
  mounted() {
    const element = this.$refs.draggable;
    
    element.addEventListener('mousedown', this.handleMouseDown);
    window.addEventListener('mousemove', this.handleMouseMove);
    window.addEventListener('mouseup', this.handleMouseUp);
  },
  beforeDestroy() {
    const element = this.$refs.draggable;
    
    element.removeEventListener('mousedown', this.handleMouseDown);
    window.removeEventListener('mousemove', this.handleMouseMove);
    window.removeEventListener('mouseup', this.handleMouseUp);
  },
  methods: {
    handleMouseDown(e) {
      this.dragging = true;
      this.startX = e.clientX - this.currentX;
      this.startY = e.clientY - this.currentY;
    },
    handleMouseMove(e) {
      if (this.dragging) {
        e.preventDefault();
        this.currentX = e.clientX - this.startX;
        this.currentY = e.clientY - this.startY;
        
        const element = this.$refs.draggable;
        element.style.transform = `translate3d(${this.currentX}px, ${this.currentY}px, 0)`;
      }
    },
    handleMouseUp() {
      this.dragging = false;
    }
  }
}
```

#### 使用第三方库（如 Sortable.js）
```javascript
import Sortable from 'sortablejs';

export default {
  mounted() {
    const el = this.$refs.sortableList;
    new Sortable(el, {
      animation: 150,
      onEnd: ({ oldIndex, newIndex }) => {
        // 处理排序后的逻辑
        this.moveItem(oldIndex, newIndex);
      }
    });
  }
}
```

### uniapp 相关问题

#### 1. 获取硬件信息
```javascript
uni.getSystemInfo({
  success: (res) => {
    console.log('设备信息:', res);
    // res.model: 设备型号
    // res.pixelRatio: 像素比
    // res.windowWidth: 窗口宽度
    // res.system: 操作系统版本
    // res.platform: 客户端平台
  }
});
```

#### 4. 路由跳转方式
```javascript
// 1. 保留当前页面，跳转到应用内的某个页面
uni.navigateTo({
  url: '/pages/detail/detail?id=123'
});

// 2. 关闭当前页面，跳转到应用内的某个页面
uni.redirectTo({
  url: '/pages/index/index'
});

// 3. 关闭所有页面，打开到应用内的某个页面
uni.reLaunch({
  url: '/pages/login/login'
});

// 4. 跳转到 tabBar 页面，并关闭其他所有非 tabBar 页面
uni.switchTab({
  url: '/pages/tabBar/home'
});

// 5. 关闭当前页面，返回上一页面或多级页面
uni.navigateBack({
  delta: 1
});
```

#### 6. 支付接口
```javascript
uni.requestPayment({
  provider: 'wxpay', // 支付方式：wxpay/aliapp
  timeStamp: '',
  nonceStr: '',
  package: '',
  signType: 'MD5',
  paySign: '',
  success: (res) => {
    console.log('支付成功:', res);
  },
  fail: (err) => {
    console.log('支付失败:', err);
  }
});
```

#### 7. 获取当前定位
```javascript
// 1. 普通定位（需用户授权）
uni.getLocation({
  type: 'wgs84', // 返回 gps 坐标
  success: (res) => {
    console.log('当前位置:', res);
    // res.latitude: 纬度
    // res.longitude: 经度
  },
  fail: (err) => {
    console.log('定位失败:', err);
    // 处理定位失败逻辑，如引导用户授权
  }
});

// 2. 高精度定位（需要用户开启位置权限）
uni.getLocation({
  type: 'gcj02', // 返回国测局坐标
  highAccuracy: true, // 开启高精度定位
  highAccuracyExpireTime: 5000, // 高精度超时时间
  success: (res) => {
    console.log('高精度定位:', res);
  }
});
```

### 字符串与数组常用方法

#### 字符串方法
+ `trim()`：去除字符串两端空格
+ `slice(start, end)`：提取子字符串
+ `substring(start, end)`：类似 slice，但不支持负数索引
+ `split(separator)`：将字符串分割为数组
+ `replace(regexp, replacement)`：替换匹配的子字符串
+ `toUpperCase()/toLowerCase()`：大小写转换
+ `includes(searchString)`：判断是否包含子字符串
+ `startsWith(prefix)/endsWith(suffix)`：判断开头/结尾

#### 数组方法
+ **遍历**：`forEach()`, `map()`, `filter()`, `reduce()`
+ **查找**：`find()`, `findIndex()`, `includes()`, `some()`, `every()`
+ **添加/删除**：`push()`, `pop()`, `shift()`, `unshift()`, `splice()`
+ **合并/分割**：`concat()`, `join()`, `slice()`, `flat()`
+ **排序/反转**：`sort()`, `reverse()`
+ **转换**：`toString()`, `toLocaleString()`, `entries()`, `values()`

### 3. Canvas和SVG的区别
Canvas和SVG是Web中两种主要的图形绘制技术，它们的核心区别如下：

| 特性 | Canvas | SVG |
| --- | --- | --- |
| **渲染类型** | 基于像素的位图渲染 | 基于XML的矢量图形 |
| **API类型** | 命令式（通过JavaScript绘制） | 声明式（使用标签定义） |
| **动态性** | 绘制后无法修改已绘制内容 | 可随时修改元素属性 |
| **性能** | 适合大量元素（如游戏、数据可视化） | 适合少量元素（如图标、简单图表） |
| **缩放特性** | 缩放时可能模糊（位图特性） | 任意缩放不失真（矢量特性） |
| **事件处理** | 需手动计算点击区域 | 原生支持DOM事件 |
| **文件大小** | 通常较小（除非绘制复杂场景） | 可能较大（尤其是复杂图形） |
| **适用场景** | 游戏、实时数据可视化、图像处理 | 图标、地图、交互式图表 |

**典型应用场景**：

+ Canvas：Echarts大数据图表、游戏（如《围住神经猫》）、视频处理
+ SVG：Icon Font、地图组件、数据流程图

### 9. uniapp的自身请求
uni-app提供了原生的网络请求API，主要是`uni.request()`，其用法类似于浏览器的fetch和axios：

```javascript
uni.request({
  url: 'https://api.example.com/data',
  method: 'GET',
  data: {
    param1: 'value1',
    param2: 'value2'
  },
  header: {
    'Content-Type': 'application/json'
  },
  success: (res) => {
    console.log('请求成功:', res.data);
  },
  fail: (err) => {
    console.error('请求失败:', err);
  },
  complete: () => {
    // 无论成功或失败都会执行
  }
});
```

**特性**：

1. 支持所有平台（小程序、H5、App等）
2. 自动处理不同平台的网络请求差异
3. 提供统一的请求配置和回调处理
4. 可通过`uni.uploadFile()`和`uni.downloadFile()`处理文件上传下载

### 10. 为什么使用axios？
选择axios主要基于以下优势：

#### 1. **Promise风格API**
+ 支持`async/await`语法，代码更简洁易读
+ 统一的错误处理机制（通过`.catch()`捕获异常）

#### 2. **拦截器机制**
+ 请求拦截：可自动添加认证信息（如Token）
+ 响应拦截：统一处理错误码（如401跳登录页）
+ 实现请求/响应日志记录

#### 3. **取消请求功能**
通过`CancelToken`可取消未完成的请求，避免资源浪费：

```javascript
const source = axios.CancelToken.source();
axios.get('/api/data', { cancelToken: source.token });
// 取消请求
source.cancel('操作已取消');
```

#### 4. **请求/响应转换**
+ 自动处理JSON序列化/反序列化
+ 自定义数据转换逻辑（如加密请求参数）

#### 5. **全局配置与实例化**
可创建多个axios实例，每个实例有独立配置，适用于管理不同API服务：

```javascript
// 创建默认实例
const defaultAxios = axios.create({
  baseURL: 'https://api.example.com'
});

// 创建专用实例（如文件上传）
const uploadAxios = axios.create({
  baseURL: 'https://upload.example.com',
  timeout: 30000
});
```

#### 6. **客户端支持防止CSRF**
通过`withCredentials: true`可在跨域请求时携带cookie

#### 7. **丰富的社区支持**
+ 大量成熟的中间件（如axios-cache-adapter）
+ 良好的TypeScript支持
+ 广泛应用于Vue、React等主流框架

#### 与uniapp原生请求对比
虽然uni-app提供了`uni.request()`，但axios在以下场景更具优势：

+ 需要更灵活的拦截器和请求配置
+ 项目已有axios生态（如现有项目迁移）
+ 需要在H5和小程序端保持一致的API风格
+ 需要复杂的请求取消和并发控制

### 6. 项目与浏览器的兼容问题及解决方法
在处理浏览器兼容性问题时，我通常采用以下系统化方法：

#### 常见兼容性问题速记
+ 不同浏览器对 CSS3 属性支持不同，例如旧版浏览器对 Flexbox、Grid 支持不完整
+ 事件处理存在差异，例如早期 IE 使用 `attachEvent`
+ 浏览器前缀问题，如 `-webkit-`、`-moz-`
+ 移动端 `touch` 事件和 PC 端 `click` 事件表现不同
+ 图片格式兼容性问题，例如部分环境不支持 WebP

#### 1. **问题定位与检测**
+ **工具链**：
    - 使用 [Can I Use](https://caniuse.com/) 查询特性兼容性
    - 集成 BrowserStack/Sauce Labs 进行多浏览器测试
    - 在 Webpack 中配置 `browserslist` 指定目标浏览器
+ **错误捕获**：

```javascript
// 全局错误监听
window.addEventListener('error', (event) => {
  // 记录错误信息并上报
  console.error('Uncaught Error:', event.message);
  reportToServer({
    error: event.message,
    stack: event.error?.stack,
    browser: navigator.userAgent
  });
});
```

#### 2. **CSS 兼容性处理**
+ **自动添加前缀**：配置 PostCSS + Autoprefixer

```javascript
// postcss.config.js
module.exports = {
  plugins: [
    require('autoprefixer')({
      overrideBrowserslist: ['last 2 versions', 'ie >= 11']
    })
  ]
};
```

+ **替代方案**：
    - 对于 Flexbox/Grid 兼容性问题，提供浮动布局备选方案
    - 使用 CSS Polyfill（如 flexibility.js 解决 IE11 弹性布局问题）

#### 3. **JavaScript 兼容性处理**
+ **Babel 转译**：

```javascript
// babel.config.js
module.exports = {
  presets: [
    [
      '@babel/preset-env',
      {
        targets: {
          browsers: ['last 2 versions', 'ie >= 11']
        },
        useBuiltIns: 'usage',
        corejs: 3
      }
    ]
  ]
};
```

+ **Polyfill 方案**：
    - 使用 `core-js` 补充缺失的 API（如 Promise、Array.includes）
    - 按需引入 Polyfill（通过 `@babel/plugin-transform-runtime`）

#### 4. **特定浏览器问题修复**
+ **IE 兼容**：
    - 处理 `Object.assign` 缺失：`import 'core-js/features/object/assign';`
    - 修复 `fetch` API：`import 'whatwg-fetch';`
+ **Safari 兼容**：
    - 处理日期解析问题：`new Date('2023-01-01'.replace(/-/g, '/'))`
    - 修复 CSS `scroll-behavior: smooth`：

```javascript
if (!('scrollBehavior' in document.documentElement.style)) {
  import('smoothscroll-polyfill').then(polyfill => {
    polyfill.polyfill();
  });
}
```

#### 5. **渐进增强与优雅降级**
+ **特性检测**：

```javascript
if ('IntersectionObserver' in window) {
  // 使用高级特性
} else {
  // 回退到传统实现
}
```

+ **CSS Feature Queries**：

```css
@supports (display: grid) {
  .container {
    display: grid;
  }
}

@supports not (display: grid) {
  .container {
    float: left;
  }
}
```

### 7. 代码与项目管理工具
#### 代码管理
+ **版本控制**：Git + GitHub/GitLab/Bitbucket
    - 分支策略：Git Flow/Trunk-Based Development
    - 提交规范：Conventional Commits（如 `feat: add login page`）
+ **代码质量**：
    - ESLint + Prettier 统一代码风格
    - Husky + lint-staged 在提交前执行检查
    - SonarQube 进行代码静态分析

#### 项目管理
+ **任务跟踪**：Jira/Trello/Notion
    - 使用看板管理迭代任务
    - 通过 Epics/Stories 分解需求
+ **CI/CD**：GitHub Actions/GitLab CI/Jenkins
    - 自动化测试：Jest/Cypress
    - 自动部署：Docker + Kubernetes
+ **文档协作**：
    - Confluence 记录技术方案
    - Swagger/Postman 管理 API 文档
    - Wiki 维护项目知识库

#### 依赖管理
+ **前端**：pnpm/npm/yarn
    - 使用 `pnpm-lock.yaml` 锁定依赖版本
    - 定期通过 `npx npm-check-updates` 升级依赖
+ **后端**：Maven/Gradle/npm

### 8. 小程序支付实现流程
#### 微信小程序支付
1. **后端生成预支付订单**：

```javascript
// 后端调用微信支付统一下单API
const prepayResult = await wxPay.unifiedOrder({
  body: '商品描述',
  out_trade_no: '商户订单号',
  total_fee: 1, // 金额（分）
  spbill_create_ip: '客户端IP',
  notify_url: '支付结果通知URL',
  trade_type: 'JSAPI',
  openid: '用户OpenID'
});

// 返回支付参数给前端
return {
  appId: prepayResult.appid,
  timeStamp: String(Math.floor(Date.now() / 1000)),
  nonceStr: prepayResult.nonce_str,
  package: `prepay_id=${prepayResult.prepay_id}`,
  signType: 'MD5',
  paySign: generatePaySign(...) // 生成支付签名
};
```

2. **前端唤起支付**：

```javascript
// 小程序端调用支付API
wx.requestPayment({
  timeStamp: res.data.timeStamp,
  nonceStr: res.data.nonceStr,
  package: res.data.package,
  signType: res.data.signType,
  paySign: res.data.paySign,
  success: (res) => {
    // 支付成功，查询订单状态确认
    queryOrderStatus();
  },
  fail: (err) => {
    // 支付取消或失败
  }
});
```

3. **处理支付回调**：

```javascript
// 后端接收微信支付结果通知
app.post('/api/payment/notify', async (req, res) => {
  // 验证签名
  const isValid = verifySign(req.body);
  if (isValid) {
    // 更新订单状态
    await updateOrderStatus(req.body.out_trade_no, 'PAID');
    // 返回成功响应
    res.send(wxPay.successNotify());
  } else {
    res.send(wxPay.failNotify());
  }
});
```

#### 支付宝小程序支付
1. **后端生成支付订单**：

```javascript
// 后端调用支付宝小程序支付API
const alipaySdk = new AlipaySdk({...});
const result = await alipaySdk.exec('alipay.trade.create', {
  bizContent: {
    out_trade_no: '商户订单号',
    total_amount: 0.01,
    subject: '商品标题',
    buyer_id: '用户ID',
    product_code: 'QUICK_MSECURITY_PAY'
  }
});

// 返回支付参数给前端
return result;
```

2. **前端唤起支付**：

```javascript
// 支付宝小程序调用支付API
my.tradePay({
  tradeNO: res.data.trade_no,
  success: (res) => {
    if (res.resultCode === '9000') {
      // 支付成功
    } else {
      // 支付失败
    }
  },
  fail: (err) => {
    // 支付错误
  }
});
```

#### 关键注意事项
+ **安全规范**：
    - 敏感信息（如商户密钥）必须保存在后端
    - 支付结果必须以服务器回调为准
+ **错误处理**：
    - 处理网络超时、用户取消等场景
    - 提供明确的支付状态反馈
+ **兼容性**：
    - 测试不同小程序环境（如微信/支付宝/抖音）
    - 处理低版本客户端兼容性问题

### CSS3新特性

+ **选择器**：属性选择器（如`[attribute]`）、伪类选择器（如`:hover`、`:nth-child()`）。
+ **视觉效果**：圆角`border-radius`、阴影`box-shadow`、渐变`linear-gradient`、形变`transform`、过渡`transition`、动画`@keyframes`+`animation`。
+ **布局与响应式**：弹性盒子`flex`、网格布局`grid`、媒体查询`@media`。
+ **背景增强**：多背景图、背景裁剪`background-clip`、透明`rgba/hsla`及`opacity`。

### link 和 @import 的区别

+ **作用对象方面**：`link` 主要用于链接外部的样式表文件；`@import` 则一般用于在 CSS 文件内部导入其他 CSS 文件，实现样式文件的模块化管理，例如在 `style.css` 中写上 `@import url("reset.css");` 来导入重置样式。
+ **加载时机方面**：`link` 是通过 HTML 的 `<head>` 部分加载的，在页面加载时会立即加载样式文件，对页面的加载速度有一定影响，如果样式文件较大，可能会导致页面闪烁。`@import` 是在 CSS 文件被加载和解析时才去加载被导入的文件，可能导致加载速度更慢。
+ **兼容性方面**：`link` 在各个浏览器中都有很好的兼容性，是传统的加载外部样式的方式。`@import` 虽然在现代浏览器中也能正常使用，但在一些老旧的浏览器中可能会出现兼容性问题，特别是在一些对 CSS 支持不是很好的浏览器中，可能会导致样式加载失败。
+ **使用场景方面**：如果需要在页面加载时就立即使用某些样式，并且这些样式文件比较大，使用 `link` 更合适，例如加载一些通用的样式框架文件。如果只是在某个较大的样式文件中需要引入一些小的样式模块，为了方便管理和维护，使用 `@import` 会更好一些。

### npm 的包里的 `package.json` 具备的必要字段
+ `name`：包的名称，也是文件夹的名称，必须是唯一的。
+ `version`：包的版本号，遵循语义化版本号规则，例如 `1.0.0`。
+ `main`：指定模块的入口文件，默认是 `index.js`。当用户通过 `require('your-package-name')` 引入包时，就会加载这个入口文件。
+ `dependencies`：生产环境下依赖的包，当执行 `npm install` 命令时，这些包会被安装到项目的 `node_modules` 目录中。例如，`dependencies: { "vue": "^3.2.19" }` 表示依赖 Vue 3.2.19 及其以上版本。
+ `devDependencies`：开发环境下依赖的包，如代码规范工具、测试工具等。这些包在开发过程中需要，但在生产环境中不需要。
+ `scripts`：定义了一些可以运行的脚本命令，如上面提到的 `serve`、`build` 等。这些脚本可以在终端通过 `npm run <script-name>` 来运行对应的命令。

### 描述一下 1 和 Number(1) 的区别
+ **类型方面**：`1` 是一个数值字面量，其类型是 `number`。`Number(1)` 实际上也是返回一个 `number` 类型的值，和 `1` 在类型上没有区别，因为 `Number` 函数在这里起到了将参数转换为对应的数字值的作用，对于数值字面量来说，它只是返回了原值。
+ **值方面**：它们的值是相等的，在进行比较时，`1 === Number(1)` 会返回 `true`。
+ **用法方面**：`1` 是最简单的表示数字的方式，用于直接赋值或参与运算。`Number` 函数更常用的是将非数字类型的值转换为数字，比如 `Number('123')` 会返回 123，`Number('abc')` 会返回 `NaN`（非数字值）。

### MQTT 的实现过程
+ **客户端连接到服务器**：
    - 客户端（如移动设备、物联网设备等）通过 MQTT 协议与 MQTT 服务器（如Mosquitto）建立 TCP/IP 连接。在连接过程中，需要指定连接参数，如服务器地址、端口号、客户端 ID、用户名和密码等。
    - 客户端发送 `CONNECT` 报文，服务器根据客户端的信息进行验证，验证通过后发送 `CONNACK` 报文表示连接成功。
+ **订阅主题**：
    - 客户端向服务器发送 `SUBSCRIBE` 报文，指定想要订阅的主题（topic）。主题可以是一个层次结构的字符串，例如 `sensors/temperature`，也可以使用通配符（如 `+` 表示单层通配，`#` 表示多层通配）来订阅多个相关的主题，如 `sensors/+` 可以订阅所有一级主题为 `sensors` 的二级主题。
    - 服务器收到订阅请求后，会记录客户端的订阅关系，并发送 `SUBACK` 报文确认订阅成功。
+ **发布消息**：
    - 当有客户端或其他消息源需要发送消息时，会向服务器发送 `PUBLISH` 报文，其中包含主题和消息内容。服务器根据客户端的订阅情况，将消息转发给所有订阅了该主题的客户端。
    - 消息的 QoS（服务质量）等级可以设置为 0、1 或 2。QoS 0 表示最多一次，消息可能丢失；QoS 1 表示至少一次，可能会重复；QoS 2 表示恰好一次，保证消息只被接收一次，但开销较大。
+ **接收消息**：
    - 客户端通过监听消息，当服务器有新的消息发送到客户端订阅的主题时，客户端会收到 `PUBLISH` 报文，并根据消息的 QoS 等级进行相应的确认操作（如 QoS 1 或 2 需要发送 `PUBACK` 等报文）。
    - 客户端可以对接收到的消息进行处理，如更新 UI、存储数据等。
+ **断开连接**：
    - 当客户端需要断开连接时，会发送 `DISCONNECT` 报文，服务器收到后会清理客户端的相关资源，并关闭连接。

### 前端怎么获取 token 的
+ **从服务器端获取**：请求后，后端返回数据里有token
+ **从本地存储获取**：在首次登录获取 token 后，为了在页面刷新或者下次打开应用时保持登录状态，通常会将 token 存储到本地存储中，如 `localStorage` 或 `sessionStorage`。例如，`localStorage.setItem('token', tokenValue)` 存储，`localStorage.getItem('token')` 获取。在每次请求时，从本地存储中获取 token 并将其放在请求头中（如 `Authorization` 字段），发送给后端进行身份验证。

### 谷歌浏览器如何正常显示小于12px字体
谷歌浏览器有一个最小字体限制，默认情况下，页面上的字体尺寸如果小于12px，浏览器会自动将其调整为12px来显示，以保证内容的可读性。

**使用 CSS 的 `transform` 属性进行缩放**

```css
.small-font {
  font-size: 6px;
  transform: scale(0.5); /* 缩小字体显示 */
}
```
