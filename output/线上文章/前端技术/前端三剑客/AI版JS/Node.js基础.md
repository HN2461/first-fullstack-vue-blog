---
title: "Node.js基础"
slug: "js-node-js-ff8ab72b"
summary: ""
category: "AI版JS"
tags: []
status: "draft"
sortOrder: 100
cover: ""
originalId: "6a2d291e8a2b1c68f2cac10a"
originalSlug: "js-node-js-ff8ab72b"
originalStatus: "published"
exportedAt: "2026-07-30T14:46:52.260Z"
---
# 第29章 Node.js基础

> Node.js让JavaScript运行在服务器端，为前端开发者提供了全栈开发的可能性。

---

## 29.1 Node.js的组成

### 29.1.1 Node.js架构

```javascript
/**
 * Node.js核心组成
 */
// 1. V8 JavaScript引擎
// 2. libuv事件循环库
// 3. 内置模块（fs, http, path等）
// 4. npm包管理器

/**
 * 全局对象
 */
console.log('全局对象演示：');
console.log('当前进程ID:', process.pid);
console.log('Node版本:', process.version);
console.log('当前目录:', __dirname);
console.log('当前文件:', __filename);

// Buffer - 处理二进制数据
const buffer = Buffer.from('Hello Node.js', 'utf8');
console.log('Buffer:', buffer);
console.log('Buffer转字符串:', buffer.toString());

// 定时器
setTimeout(() => {
  console.log('setTimeout执行');
}, 100);

setImmediate(() => {
  console.log('setImmediate执行');
});

process.nextTick(() => {
  console.log('nextTick执行');
});
```

### 29.1.2 模块系统

```javascript
/**
 * CommonJS模块系统
 */
// math.js - 导出模块
function add(a, b) {
  return a + b;
}

function subtract(a, b) {
  return a - b;
}

module.exports = {
  add,
  subtract,
  PI: Math.PI
};

// 或者单独导出
exports.multiply = (a, b) => a * b;

// main.js - 导入模块
const math = require('./math');
const { add, subtract } = require('./math');
const path = require('path'); // 内置模块

console.log(add(5, 3)); // 8
console.log(math.PI); // 3.141592653589793

/**
 * ES模块支持（Node.js 14+）
 */
// package.json中设置 "type": "module"
// 或使用 .mjs 扩展名

// math.mjs
export function add(a, b) {
  return a + b;
}

export default {
  version: '1.0.0'
};

// main.mjs
import { add } from './math.mjs';
import math from './math.mjs';

/**
 * 模块加载机制
 */
// 1. 核心模块（fs, http, path等）
const fs = require('fs');

// 2. 本地模块（./或../开头）
const localModule = require('./myModule');

// 3. 第三方模块（从node_modules查找）
const lodash = require('lodash');

// 4. JSON文件
const config = require('./config.json');

/**
 * 模块缓存
 */
// 模块在第一次加载后被缓存
console.log(require.cache); // 查看模块缓存

// 清除缓存
delete require.cache[require.resolve('./myModule')];
```

---

## 29.2 CommonJS深入

### 29.2.1 模块包装器

```javascript
/**
 * Node.js模块包装器
 */
// 每个模块都被包装在一个函数中
(function(exports, require, module, __filename, __dirname) {
  // 模块代码
  console.log('模块参数：');
  console.log('exports:', typeof exports);
  console.log('require:', typeof require);
  console.log('module:', typeof module);
  console.log('__filename:', __filename);
  console.log('__dirname:', __dirname);
  
  // module.exports vs exports
  console.log(exports === module.exports); // true
  
  // 错误用法
  // exports = { name: 'test' }; // 这样不会导出
  
  // 正确用法
  exports.name = 'test';
  // 或者
  module.exports = { name: 'test' };
});

/**
 * 模块作用域
 */
// 每个模块有自己的作用域
var moduleVariable = 'private to module';

function privateFunction() {
  return 'only accessible within module';
}

// 只有通过exports导出的才能被外部访问
module.exports = {
  publicMethod: function() {
    return privateFunction(); // 内部可以访问
  }
};
```

### 29.2.2 循环依赖处理

```javascript
/**
 * 循环依赖示例
 */
// a.js
console.log('a starting');
exports.done = false;
const b = require('./b.js');
console.log('in a, b.done =', b.done);
exports.done = true;
console.log('a done');

// b.js  
console.log('b starting');
exports.done = false;
const a = require('./a.js');
console.log('in b, a.done =', a.done);
exports.done = true;
console.log('b done');

// main.js
const a = require('./a.js');
const b = require('./b.js');

console.log('in main, a.done =', a.done, 'b.done =', b.done);

/**
 * 解决循环依赖
 */
// 1. 重构代码结构，避免循环依赖
// 2. 延迟require
// 3. 使用事件或回调

// 延迟require示例
function getB() {
  return require('./b.js');
}

module.exports = {
  getB,
  done: true
};
```

---

## 29.3 fs/path/http模块

### 29.3.1 文件系统模块

```javascript
/**
 * fs模块 - 文件系统操作
 */
const fs = require('fs');
const path = require('path');

// 同步读取文件
try {
  const data = fs.readFileSync('example.txt', 'utf8');
  console.log('文件内容:', data);
} catch (error) {
  console.error('读取文件失败:', error.message);
}

// 异步读取文件
fs.readFile('example.txt', 'utf8', (err, data) => {
  if (err) {
    console.error('读取文件失败:', err.message);
    return;
  }
  console.log('文件内容:', data);
});

// Promise版本（Node.js 10+）
const fsPromises = require('fs').promises;

async function readFileAsync() {
  try {
    const data = await fsPromises.readFile('example.txt', 'utf8');
    console.log('文件内容:', data);
  } catch (error) {
    console.error('读取文件失败:', error.message);
  }
}

/**
 * 文件写入
 */
// 写入文件
const content = 'Hello Node.js';
fs.writeFile('output.txt', content, 'utf8', (err) => {
  if (err) {
    console.error('写入失败:', err);
  } else {
    console.log('文件写入成功');
  }
});

// 追加内容
fs.appendFile('output.txt', '\n新增内容', 'utf8', (err) => {
  if (err) {
    console.error('追加失败:', err);
  }
});

/**
 * 目录操作
 */
// 创建目录
fs.mkdir('new-directory', { recursive: true }, (err) => {
  if (err) {
    console.error('创建目录失败:', err);
  }
});

// 读取目录
fs.readdir('.', (err, files) => {
  if (err) {
    console.error('读取目录失败:', err);
    return;
  }
  console.log('目录内容:', files);
});

// 获取文件信息
fs.stat('example.txt', (err, stats) => {
  if (err) {
    console.error('获取文件信息失败:', err);
    return;
  }
  
  console.log('文件信息:');
  console.log('是否为文件:', stats.isFile());
  console.log('是否为目录:', stats.isDirectory());
  console.log('文件大小:', stats.size);
  console.log('修改时间:', stats.mtime);
});
```

### 29.3.2 路径模块

```javascript
/**
 * path模块 - 路径处理
 */
const path = require('path');

// 路径连接
const fullPath = path.join('/users', 'john', 'documents', 'file.txt');
console.log('连接路径:', fullPath); // /users/john/documents/file.txt

// 路径解析
const absolutePath = path.resolve('documents', 'file.txt');
console.log('绝对路径:', absolutePath);

// 获取路径信息
const filePath = '/users/john/documents/file.txt';
console.log('目录名:', path.dirname(filePath)); // /users/john/documents
console.log('文件名:', path.basename(filePath)); // file.txt
console.log('扩展名:', path.extname(filePath)); // .txt

// 解析路径对象
const parsed = path.parse(filePath);
console.log('解析结果:', parsed);
// {
//   root: '/',
//   dir: '/users/john/documents',
//   base: 'file.txt',
//   ext: '.txt',
//   name: 'file'
// }

// 格式化路径
const formatted = path.format({
  root: '/',
  dir: '/users/john/documents',
  base: 'file.txt'
});
console.log('格式化路径:', formatted);

/**
 * 跨平台路径处理
 */
// 路径分隔符
console.log('路径分隔符:', path.sep); // Unix: '/', Windows: '\'

// 标准化路径
const messyPath = '/users//john/./documents/../documents/file.txt';
console.log('标准化后:', path.normalize(messyPath));

// 相对路径
const relativePath = path.relative('/users/john', '/users/john/documents/file.txt');
console.log('相对路径:', relativePath); // documents/file.txt
```

### 29.3.3 HTTP模块

```javascript
/**
 * http模块 - HTTP服务器
 */
const http = require('http');
const url = require('url');
const querystring = require('querystring');

// 创建HTTP服务器
const server = http.createServer((req, res) => {
  // 解析URL
  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;
  const query = parsedUrl.query;
  
  // 设置响应头
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');
  
  console.log(`${req.method} ${pathname}`);
  
  // 路由处理
  if (pathname === '/') {
    res.statusCode = 200;
    res.end(JSON.stringify({ message: 'Hello Node.js' }));
    
  } else if (pathname === '/api/users') {
    handleUsers(req, res, query);
    
  } else if (pathname === '/api/upload' && req.method === 'POST') {
    handleUpload(req, res);
    
  } else {
    res.statusCode = 404;
    res.end(JSON.stringify({ error: 'Not Found' }));
  }
});

// 处理用户API
function handleUsers(req, res, query) {
  const users = [
    { id: 1, name: 'Alice' },
    { id: 2, name: 'Bob' }
  ];
  
  if (query.id) {
    const user = users.find(u => u.id === parseInt(query.id));
    if (user) {
      res.end(JSON.stringify(user));
    } else {
      res.statusCode = 404;
      res.end(JSON.stringify({ error: 'User not found' }));
    }
  } else {
    res.end(JSON.stringify(users));
  }
}

// 处理文件上传
function handleUpload(req, res) {
  let body = '';
  
  req.on('data', chunk => {
    body += chunk.toString();
  });
  
  req.on('end', () => {
    console.log('接收到数据:', body);
    res.statusCode = 200;
    res.end(JSON.stringify({ message: 'Upload successful' }));
  });
}

// 启动服务器
const PORT = 3000;
server.listen(PORT, () => {
  console.log(`服务器运行在 http://localhost:${PORT}`);
});

/**
 * HTTP客户端
 */
// 发起HTTP请求
const requestOptions = {
  hostname: 'api.github.com',
  port: 443,
  path: '/users/octocat',
  method: 'GET',
  headers: {
    'User-Agent': 'Node.js'
  }
};

const req = http.request(requestOptions, (res) => {
  let data = '';
  
  res.on('data', chunk => {
    data += chunk;
  });
  
  res.on('end', () => {
    console.log('响应数据:', JSON.parse(data));
  });
});

req.on('error', (error) => {
  console.error('请求失败:', error);
});

req.end();
```

---

## 29.4 异步IO机制

### 29.4.1 事件循环

```javascript
/**
 * Node.js事件循环阶段
 */
// 1. Timer阶段 - 执行setTimeout和setInterval回调
// 2. Pending阶段 - 执行系统操作的回调
// 3. Poll阶段 - 获取新的I/O事件
// 4. Check阶段 - 执行setImmediate回调
// 5. Close阶段 - 执行close事件回调

console.log('=== 事件循环演示 ===');

// 同步代码
console.log('1. 同步代码');

// Timer阶段
setTimeout(() => console.log('2. setTimeout'), 0);

// Check阶段
setImmediate(() => console.log('3. setImmediate'));

// 微任务
Promise.resolve().then(() => console.log('4. Promise'));

// nextTick（优先级最高）
process.nextTick(() => console.log('5. nextTick'));

console.log('6. 同步代码结束');

/**
 * 微任务 vs 宏任务
 */
// 微任务：process.nextTick, Promise.then
// 宏任务：setTimeout, setImmediate, I/O操作

setTimeout(() => {
  console.log('宏任务1');
  Promise.resolve().then(() => console.log('微任务1'));
}, 0);

setTimeout(() => {
  console.log('宏任务2');
  Promise.resolve().then(() => console.log('微任务2'));
}, 0);

Promise.resolve().then(() => {
  console.log('微任务3');
  setTimeout(() => console.log('宏任务3'), 0);
});
```

### 29.4.2 异步编程模式

```javascript
/**
 * 回调模式
 */
const fs = require('fs');

// 错误优先回调
fs.readFile('example.txt', 'utf8', (err, data) => {
  if (err) {
    console.error('读取失败:', err);
    return;
  }
  console.log('文件内容:', data);
});

/**
 * Promise模式
 */
const { promisify } = require('util');
const readFilePromise = promisify(fs.readFile);

readFilePromise('example.txt', 'utf8')
  .then(data => {
    console.log('文件内容:', data);
  })
  .catch(err => {
    console.error('读取失败:', err);
  });

/**
 * async/await模式
 */
async function readFileAsync() {
  try {
    const data = await readFilePromise('example.txt', 'utf8');
    console.log('文件内容:', data);
  } catch (error) {
    console.error('读取失败:', error);
  }
}

/**
 * Stream流处理
 */
const readableStream = fs.createReadStream('large-file.txt', {
  encoding: 'utf8',
  highWaterMark: 1024 // 1KB缓冲区
});

readableStream.on('data', chunk => {
  console.log('接收到数据块:', chunk.length);
});

readableStream.on('end', () => {
  console.log('文件读取完成');
});

readableStream.on('error', err => {
  console.error('读取错误:', err);
});

/**
 * EventEmitter事件模式
 */
const EventEmitter = require('events');

class MyEmitter extends EventEmitter {}
const myEmitter = new MyEmitter();

// 监听事件
myEmitter.on('data', (message) => {
  console.log('收到消息:', message);
});

// 触发事件
myEmitter.emit('data', 'Hello Events!');

// 一次性监听器
myEmitter.once('special', () => {
  console.log('这只会执行一次');
});
```

---

**本章总结**

第29章介绍了Node.js服务端JavaScript运行环境的基础知识：

1. **Node.js的组成**：
   - V8 JavaScript引擎的高性能执行
   - libuv提供的异步I/O支持
   - 丰富的内置模块生态系统
   - 跨平台的运行时环境特性

2. **CommonJS模块深入**：
   - require/exports的加载机制
   - 模块缓存和循环依赖处理
   - 全局对象和模块作用域
   - ES模块与CommonJS的互操作

3. **核心模块详解**：
   - fs文件系统的同步和异步操作
   - path路径处理的跨平台兼容性
   - http模块的服务器和客户端功能
   - 各模块的实际应用场景和最佳实践

4. **异步IO机制**：
   - 事件循环的工作原理和执行顺序
   - 非阻塞I/O的性能优势
   - 事件驱动编程模型
   - 异步操作的错误处理策略

**关键要点**：
- Node.js将JavaScript扩展到服务端开发领域
- 事件循环和非阻塞I/O是Node.js高性能的核心
- 模块系统提供了良好的代码组织和复用机制
- 丰富的内置模块覆盖了大部分服务端开发需求

**下一章预告**

第30章将学习使用Express开发后端应用，包括路由系统、中间件机制、模拟Mock API构建，以及前后端联调的实用技巧。
