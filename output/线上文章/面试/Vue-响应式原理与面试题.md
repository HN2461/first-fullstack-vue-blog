---
title: "Vue 响应式原理与面试题"
slug: "legacy-c16e0589-c16e0589"
summary: "Vue 2/3 响应式原理对比、Three.js 特征、provide/inject 与 Vuex 区别等面试题详解。"
category: "面试"
tags:
  - "Vue2"
  - "Vue3"
  - "响应式原理"
  - "Three.js"
status: "draft"
sortOrder: 60
cover: ""
originalId: "6a2d29208a2b1c68f2cac69a"
originalSlug: "legacy-c16e0589-c16e0589"
originalStatus: "published"
exportedAt: "2026-07-30T14:08:39.359Z"
---
### 1. Vue 2 和 Vue 3 的响应式原理

- **Vue 2 的响应式原理**：  
  Vue 2 使用 `Object.defineProperty` 方法劫持数据对象的属性，将其转换为 getter 和 setter 形式。当属性被访问（触发 getter）时，会进行依赖收集；当属性被修改（触发 setter）时，会通知相关的观察者（Watcher）进行更新。不过，`Object.defineProperty` 无法监听动态添加或删除的属性，需要手动使用 `Vue.set` 或 `this.$set`。
- **Vue 3 的响应式原理**：  
  Vue 3 则使用 ES6 的 `Proxy` 和 `Reflect` 实现响应式。`Proxy` 可以拦截整个对象的多种操作（如读取、设置、删除等），并结合 `Reflect` 提供的 API 来完成依赖收集和更新触发。通过 `Proxy`，Vue 3 支持监听对象属性的动态添加和删除。

### 2. Vue 3 响应式原理相比于 Vue 2 的优点

- **动态属性支持**：Vue 3 的 `Proxy` 可以直接监听对象属性的添加和删除，而 Vue 2 需要手动调用 `Vue.set`。
- **性能提升**：Vue 3 不需要为每个属性单独设置 `getter/setter`，减少了初始化和内存占用。
- **深度响应式**：Vue 3 默认递归监听对象的所有属性。
- **支持更多数据结构**：Vue 3 的 `Proxy` 还支持如 `Map`、`Set` 等数据结构。

### 3. Three.js 的主要特征

- **强大的 3D 渲染能力**：通过 WebGL 提供高质量的 3D 图形渲染。
- **丰富的 API**：支持多样的几何体、材质和光源，方便创建复杂场景。
- **跨浏览器兼容性**：在多数现代浏览器上都能稳定运行。
- **支持多种文件格式**：可以导入 OBJ、GLTF 等常用 3D 模型文件。

### 4. provide/inject 与 Vuex 的区别

#### **1. 数据流向**

    - **provide/inject**：数据从父组件流向子组件，子组件不能修改父组件提供的数据。
    - **Vuex**：数据可以在整个应用中共享，任何组件都可以读写 Vuex 中的状态。

#### **2. 使用场景**

    - **provide/inject**：适用于简单的跨级组件通信，比如父组件向子孙组件传递配置信息等。
    - **Vuex**：适用于复杂的应用状态管理，比如多个组件需要共享和修改同一状态。

#### **3. 自动更新机制**

    - **provide/inject**：父组件提供的数据发生变化时，子组件会自动更新。
    - **Vuex**：当 Vuex 中的状态发生变化时，所有依赖该状态的组件都会自动更新。

#### **4. 灵活性和复杂度**

    - **provide/inject**：使用相对简单，适合小规模的通信场景。
    - **Vuex**：功能强大，但需要额外学习和配置，适合大规模应用。

### 防抖和节流的小案例

#### 防抖（Debounce）

防抖是指在事件被触发后的一段时间内，只有在事件停止触发达到设定的时间后，才执行一次回调函数。如果在设定的时间内事件再次被触发，则重新计时。

**应用场景**：输入框的实时搜索、窗口的 resize 事件等。

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

// 示例：输入框实时搜索
const searchInput = document.getElementById("search");
const handleSearch = debounce(function (e) {
  console.log("搜索内容:", e.target.value);
}, 300);
searchInput.addEventListener("input", handleSearch);
```

#### 节流（Throttle）

节流是指在事件被触发的一定时间内，只允许执行一次回调函数，直到这个时间结束后才会重新计时。

**应用场景**：滚动事件、鼠标移动事件等。

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

// 示例：滚动事件
const handleScroll = throttle(function () {
  console.log("页面滚动");
}, 200);
window.addEventListener("scroll", handleScroll);
```

### **虚拟 DOM 的简单实现**

#### **1. 创建虚拟 DOM**

虚拟 DOM 是一个 JavaScript 对象，用于描述真实 DOM 的结构。它包含以下属性：

- `type`：表示元素的类型（例如 `'div'`、`'p'` 等）。
- `props`：包含元素的属性和子元素。
  - `props` 对象中：
    - 属性（如 `id`、`style` 等）作为键值对。
    - 子元素通过 `children` 数组存储。

文本节点也有对应的虚拟 DOM，其 `type` 为 `'TEXT_ELEMENT'`，内容存储在 `props.nodeValue` 中。

**示例**：

```javascript
const vdom = createElement(
  "div",
  { id: "container", style: "color: red;" },
  createElement("h1", null, "Hello, Virtual DOM!"),
  createElement("p", null, "这是一个虚拟 DOM 的示例。"),
);
```

这里：

- `vdom` 是一个虚拟 DOM 对象。
- 其 `type` 为 `'div'`。
- `props` 包含 `id` 和 `style` 属性。
- 子元素通过 `children` 数组存储，分别是两个虚拟 DOM（`<h1>` 和 `<p>`）。

#### **2. 渲染虚拟 DOM**

渲染函数将虚拟 DOM 转换为真实 DOM 并插入到页面中：

- **创建真实 DOM**：
  - 若虚拟 DOM 的 `type` 是 `'TEXT_ELEMENT'`，则创建一个文本节点。
  - 否则，创建对应类型的元素（如 `div`、`p` 等）。
- **设置属性**：
  - 遍历虚拟 DOM 的 `props`，将属性（如 `id`、`style` 等）设置到真实 DOM 上。
- **递归渲染子元素**：
  - 遍历虚拟 DOM 的 `children`，对每个子虚拟 DOM 调用渲染函数。
- **插入到容器**：
  - 将渲染好的真实 DOM 插入到指定的容器中。

**示例**：

```javascript
render(vdom, document.getElementById("root"));
```

- `vdom` 是要渲染的虚拟 DOM。
- `document.getElementById('root')` 是页面中的容器元素。
- 调用 `render` 函数后，虚拟 DOM 被转换为真实 DOM 并插入到 `#root` 容器中。

#### **3. 更新虚拟 DOM（简单实现）**

在完整框架中，通常会对比新旧虚拟 DOM 的差异（diff 算法），然后根据差异更新真实 DOM。但在简单实现中，通常直接重新渲染：

- 创建一个新的虚拟 DOM。
- 调用渲染函数将新虚拟 DOM 渲染到容器中。

**示例**：

```javascript
const newVdom = createElement(
  "div",
  { id: "container", style: "color: blue;" },
  createElement("h1", null, "Hello, World!"),
  createElement("p", null, "更新后的虚拟 DOM 示例。"),
);
render(newVdom, document.getElementById("root"));
```

这个例子中，`newVdom` 替代了原来的 `vdom`，并通过 `render` 函数重新渲染到页面。

### 用v-for时key的作用,结合实际场景说一下

使用 `v-for` 时，`key` 的主要作用是帮助 Vue 高效地更新和管理列表项，优化渲染性能。

- **高效更新列表**：`key` 能让 Vue 在列表数据变化时，快速识别出哪些项需要更新、插入或删除，而不是重新渲染整个列表。
- **防止状态错乱**：在组件中使用 `v-for` 时，如果组件有内部状态，使用唯一的 `key` 可以避免状态在列表更新时被错误复用，确保每个组件实例的状态正确绑定到对应的列表项。
- **保持 DOM 稳定**：合理的 `key` 值能保持 DOM 元素的稳定性，使得 Vue 能正确地复用和移动现有元素，避免不必要的 DOM 操作，从而提升性能。
- **最佳实践**：尽量使用列表项的唯一标识符（如数据库中的 ID）作为 `key`。如果数据项没有唯一 ID，可以结合索引和其他字段生成唯一值。避免仅使用索引作为 `key`，因为当列表顺序变化时，索引会随之变动，导致 Vue 的更新逻辑出错。

### promise.all是干什么的

`Promise.all` 用于并行执行多个 Promise，并在所有 Promise 都成功完成时返回一个包含结果的数组。如果任何一个 Promise 失败，它会立即返回一个失败的 Promise。

用途：

- **并行执行多个异步任务**，提高效率。
- **收集多个 Promise 的结果**，结果按传入顺序排列。

特点：

- **全部成功**：返回一个包含所有结果的数组。
- **一个失败**：立即返回失败，原因是第一个失败的 Promise 的原因。

### 二次封装

- **对 axios 的二次封装** ：添加请求和响应拦截器，处理请求头信息、加载状态及错误信息等，还设置了超时时间和统一参数格式。
- **对 echarts 的二次封装** ：抽离通用配置，如主题配置、图表尺寸自适应逻辑等，方便创建风格统一的图表。
- **对文件上传组件的二次封装** ：增加文件类型验证、大小限制功能，封装上传进度显示及上传后的回调处理逻辑。
- **对表单组件的二次封装** ：基于 ele - ui 的 form 表单组件，添加自定义验证规则，封装提交逻辑，包括数据预处理及成功失败提示。
- **对表格组件的二次封装** ：在 ele - ui 的 table 组件基础上，封装分页功能，实现分页联动及自定义分页大小功能，还封装了行点击事件。
- **对防抖节流的二次封装** ：创建高阶函数，使防抖节流函数更通用、易配置，可灵活应用于各种需要控制函数执行频率的场景，如输入框实时搜索、窗口大小调整监听等。
- **对本地存储的二次封装** ：统一封装 localStorage 和 sessionStorage 的操作方法，添加数据类型转换处理，使其更方便、安全地存储和读取数据。

### 地图

用过高德地图。

### 地图 API

以下从更通俗易懂的角度，结合搜索结果中2025年的内容，为你详细讲解高德地图 JavaScript API 的使用方法。

##### 一、地图初始化

- **引入 API 脚本** ：先在 HTML 文件中，通过 `<script>` 标签引入高德地图的 JavaScript API 脚本，格式一般是 `https://webapi.amap.com/maps?v=2.0&key=你的API密钥`，其中的 “你的API密钥” 就是咱们申请的高德地图 API 密钥，必须带上，否则地图没法用。
- **创建地图容器** ：在 HTML 里弄个 `div` ，设置好宽高，这相当于是地图的 “家”，地图就在这里展示。
- **创建地图实例** ：用 `var map = new AMap.Map('容器id', { zoom: 10, center: [116.397428, 39.90923] });` 这样的代码来创建地图实例，“容器id” 是刚刚那个 `div` 的 id ，`zoom` 是地图的初始缩放级别，`center` 是地图的初始中心点坐标。

##### 二、地理编码与逆地理编码

- **地理编码** ：就是把文字地址，比如 “北京市朝阳区 XX 街道 XX 号”，换成地图能懂的经纬度坐标。代码里用 `AMap.Geocoder`，给它地址，它就吐出对应的位置坐标，这样就能在地图上精准定位了。
- **逆地理编码** ：则反过来，给它经纬度，它就告诉你这儿是啥地址。

##### 三、地图标记点与信息窗体

- **添加标记点** ：用 `var marker = new AMap.Marker({ position: new AMap.LngLat(116.39, 39.9) }); marker.setMap(map);` 这样的代码，能在地图上添加一个标记点，指定其位置（经纬度）后把它放到地图上展示，就像在地图上插了个小旗子。
- **添加信息窗体** ：当点击标记点时，能弹出个框显示详细信息。用 `var infoWindow = new AMap.InfoWindow({ content: '这是某个地点' }); marker.on('click', function() { infoWindow.open(map, marker.getPosition()); });` 这样的代码来实现。

##### 四、路线规划

- **驾车路线规划** ：用 `AMap.Driving`，给它起点和终点的经纬度坐标或者地址，它就帮忙规划出开车的路线，还能把路线在地图上画出来。比如 `var driving = new AMap.Driving({ map: map }); driving.search(startPoint, endPoint);`，其中 `startPoint` 和 `endPoint` 分别是起点和终点。
- **公交路线规划** ：用 `AMap.BusRapidTransit`，也是给起终点，算出坐公交的路线。
- **步行路线规划** ：用 `AMap.Walking`，规划出走路的路线。

##### 五、地图事件监听

可以监听地图的各种动作，比如地图移动结束、缩放改变等。如 `map.on('moveend', function() { console.log('地图移动结束'); });`，当地图移动结束时，就会执行这个函数里面的操作。

### Vue3 + Vite 的理解

**Vue3** 是 Vue.js 的最新版本，引入了新的 Composition API，提升了开发灵活性和性能。它还优化了响应式系统，引入了 `ref` 和 `reactive` 等新特性。

**Vite** 是一个现代的前端构建工具，基于原生 ES 模块，提供了快速冷启动和热模块替换（HMR），显著提高了开发效率。结合使用 Vue3 和 Vite，可以充分利用 Vue3 的新特性和 Vite 的高性能，提升开发体验。

### HTTP 和 HTTPS 的区别及应用场景

**HTTP** 是明文传输协议，适合传输非敏感数据，如新闻和博客等。

**HTTPS** 是 HTTP 的加密版本，通过 SSL/TLS 加密数据传输，防止数据被窃听和篡改。它使用端口 443，默认开启了身份认证。

**应用场景**：

- **HTTP**：适用于静态网页浏览和非敏感文件下载。
- **HTTPS**：适用于电子商务、网上银行、社交媒体平台和任何涉及敏感信息的场景。

### 实时推送的实现方式

1. **轮询（Polling）**：客户端定期向服务器发送请求查询新消息，简单但效率低。
2. **长轮询（Long Polling）**：客户端发送请求后，服务器保持连接，直到有新消息才返回响应，减少了请求次数。
3. **Server-Sent Events (SSE)**：服务器向客户端推送消息，适用于服务器单向推送消息的场景，如站内信提醒。
4. **WebSocket**：全双工通信协议，允许服务器和客户端双向实时通信，适用于实时聊天和在线游戏等场景。
5. **MQTT**：轻量级消息队列协议，适合物联网设备，支持高效的数据传输。

websoket优缺点

做过哪些安全处理

发送给后端图片或文件，如何让后端确认是安全的

keep-alive包裹组件，路由跳转，会不会触发destroy，会不会触发mounted

说一说css大小单位（px em rem vw vh）

百分比和vw vh的区别

比如一个列表流，你会怎么布局

数组里有多个对象，怎么把对象里的id最快方式提取出来

### JavaScript 内置属性

JavaScript 提供了许多内置属性，以下是一些常见的全局属性和对象属性：

- **全局属性**：
  - `Infinity`：表示无穷大。
  - `NaN`：表示非数字值。
  - `undefined`：表示未定义的值。
  - `Math`：数学对象，提供数学函数和常量。
  - `JSON`：用于处理 JSON 数据。
- **对象属性**：
  - `Object.prototype.constructor`：返回创建该对象的构造函数。
  - `Object.prototype.hasOwnProperty`：判断对象是否包含特定的自有属性。
  - `Array.isArray()`：判断一个值是否为数组。

### 字符串转数字及反之

#### 字符串转数字：

- **使用 **`Number()`** 函数**：

```javascript
const str = "123";
const num = Number(str);
console.log(num); // 123
```

- **使用 **`parseInt()`** 函数**：

```javascript
const str = "123.45";
const intNum = parseInt(str); // 123
```

- **使用 **`parseFloat()`** 函数**：

```javascript
const str = "123.45";
const floatNum = parseFloat(str); // 123.45
```

- **使用 unary plus 操作符**：

```javascript
const str = "42";
const num = +str;
console.log(num); // 42
```

- **乘以 1**：

```javascript
const str = "100";
const num = str * 1;
console.log(num); // 100
```

#### 数字转字符串：

- **使用 **`String()`** 函数**：

```javascript
const num = 123;
const str = String(num);
console.log(str); // "123"
```

- **使用 **`toString()`** 方法**：

```javascript
const num = 123;
const str = num.toString();
console.log(str); // "123"
```

### JSON 字符串与对象的转换

#### JSON 字符串转对象：

- **使用 **`JSON.parse()`：

```javascript
const jsonString = '{"name": "John", "age": 30}';
const obj = JSON.parse(jsonString);
console.log(obj); // { name: "John", age: 30 }
```

#### 对象转 JSON 字符串：

- **使用 **`JSON.stringify()`：

```javascript
const obj = { name: "John", age: 30 };
const jsonString = JSON.stringify(obj);
console.log(jsonString); // '{"name": "John", "age": 30}'
```

### 日期转字符串

- **使用 **`Date`** 对象的 **`toString()`** 方法**：

```javascript
const date = new Date();
const str = date.toString();
console.log(str); // 例如：'Wed Oct 18 2023 15:30:45 GMT+0800 (China Standard Time)'
```

- **使用 **`toDateString()`** 方法**：

```javascript
const date = new Date();
const str = date.toDateString();
console.log(str); // 例如：'Wed Oct 18 2023'
```

- **使用 **`toTimeString()`** 方法**：

```javascript
const date = new Date();
const str = date.toTimeString();
console.log(str); // 例如：'15:30:45 GMT+0800 (China Standard Time)'
```

- **使用 **`toISOString()`** 方法**：

```javascript
const date = new Date();
const str = date.toISOString();
console.log(str); // 例如：'2023-10-18T07:30:45.123Z'
```

### 解决加载不出来或白屏问题

- **检查网络请求**
  - **查看资源加载情况** ：利用浏览器开发者工具的 “网络” 面板，查看资源是否加载成功。若发现 404 错误，检查资源路径和文件是否存在；若是跨域请求失败，检查服务器跨域设置。
  - **检查脚本错误** ：查看 “控制台” 面板，修复 JavaScript 错误，如语法错误、未定义变量等。
  - **检查加载顺序** ：调整 HTML 中 `<script>` 和 `<link>` 标签顺序，确保基础库先加载。
- **检查页面渲染**
  - **检查 HTML 结构** ：查看 HTML 代码是否合法，标签是否正确闭合和嵌套，可借助 W3C 标准验证服务。
  - **检查 CSS 样式冲突** ：尝试注释部分 CSS 代码，定位并解决样式冲突问题。
  - **检查 JavaScript 阻塞渲染** ：优化 JavaScript 代码，避免长时间运行的同步操作，采用异步执行方式。

### 解决打包过大问题

- **代码优化**
  - **使用代码分割** ：借助 Webpack 等工具按路由、组件等分割代码，按需加载。
  - **去除无用代码** ：删除未使用的代码，按需引入第三方库模块。
  - **延迟加载非关键资源** ：动态加载非关键资源，如图片轮播组件、视频播放器等。
- **资源优化**
  - **图片优化** ：压缩图片，选择合适格式，使用懒加载技术。
  - **压缩其他资源文件** ：用 Clean-CSS、UglifyJS 或 Terser 等工具压缩 CSS 和 JavaScript 文件。
  - **字体优化** ：使用字体子集，避免加载整个字体文件，或者利用系统字体。
