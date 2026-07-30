---
title: "使用Express开发后端"
slug: "js-express-71c1cdfd"
summary: ""
category: "AI版JS"
tags: []
status: "draft"
sortOrder: 80
cover: ""
originalId: "6a2d291e8a2b1c68f2cac10e"
originalSlug: "js-express-71c1cdfd"
originalStatus: "published"
exportedAt: "2026-07-30T14:08:39.359Z"
---
# 第30章 使用Express开发后端

> Express是Node.js最流行的Web应用框架，提供了构建Web服务器和API的强大工具。

---

## 30.1 Express基础

### 30.1.1 快速开始

```javascript
/**
 * Express基础服务器
 */
const express = require('express');
const app = express();
const PORT = 3000;

// 基础路由
app.get('/', (req, res) => {
  res.send('Hello Express!');
});

// JSON响应
app.get('/api/users', (req, res) => {
  const users = [
    { id: 1, name: 'Alice', email: 'alice@example.com' },
    { id: 2, name: 'Bob', email: 'bob@example.com' }
  ];
  res.json(users);
});

// 启动服务器
app.listen(PORT, () => {
  console.log(`服务器运行在 http://localhost:${PORT}`);
});

/**
 * 基础中间件
 */
// 解析JSON请求体
app.use(express.json());

// 解析URL编码数据
app.use(express.urlencoded({ extended: true }));

// 静态文件服务
app.use(express.static('public'));

// 自定义中间件
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});
```

### 30.1.2 应用程序结构

```javascript
/**
 * 推荐的Express项目结构
 */
/*
project/
├── app.js              // 应用入口
├── routes/             // 路由文件
│   ├── index.js
│   ├── users.js
│   └── auth.js
├── controllers/        // 控制器
│   ├── userController.js
│   └── authController.js
├── middleware/         // 中间件
│   ├── auth.js
│   └── errorHandler.js
├── models/            // 数据模型
│   └── User.js
├── config/            // 配置文件
│   └── database.js
├── public/            // 静态资源
└── views/             // 模板文件
*/

/**
 * app.js - 应用入口文件
 */
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const userRoutes = require('./routes/users');
const authRoutes = require('./routes/auth');
const errorHandler = require('./middleware/errorHandler');

const app = express();

// 安全中间件
app.use(helmet());

// 跨域支持
app.use(cors({
  origin: ['http://localhost:3000', 'https://myapp.com'],
  credentials: true
}));

// 日志中间件
app.use(morgan('combined'));

// 解析中间件
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// 静态文件
app.use('/static', express.static('public'));

// 路由
app.use('/api/users', userRoutes);
app.use('/api/auth', authRoutes);

// 错误处理
app.use(errorHandler);

module.exports = app;
```

---

## 30.2 路由系统

### 30.2.1 基本路由

```javascript
/**
 * routes/users.js - 用户路由
 */
const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authMiddleware = require('../middleware/auth');

// GET /api/users - 获取用户列表
router.get('/', userController.getUsers);

// GET /api/users/:id - 获取单个用户
router.get('/:id', userController.getUserById);

// POST /api/users - 创建用户
router.post('/', userController.createUser);

// PUT /api/users/:id - 更新用户
router.put('/:id', authMiddleware, userController.updateUser);

// DELETE /api/users/:id - 删除用户
router.delete('/:id', authMiddleware, userController.deleteUser);

module.exports = router;

/**
 * 路由参数
 */
// 路径参数
app.get('/users/:id', (req, res) => {
  const userId = req.params.id;
  res.json({ userId });
});

// 查询参数
app.get('/search', (req, res) => {
  const { q, page, limit } = req.query;
  res.json({ query: q, page, limit });
});

// 通配符路由
app.get('/files/*', (req, res) => {
  const filePath = req.params[0];
  res.send(`File path: ${filePath}`);
});

/**
 * 路由模式匹配
 */
// 可选参数
app.get('/posts/:year/:month?', (req, res) => {
  res.json(req.params);
});

// 正则表达式
app.get(/.*fly$/, (req, res) => {
  res.send('Ends with "fly"');
});

// 多个路径
app.get(['/about', '/info'], (req, res) => {
  res.send('About page');
});
```

### 30.2.2 路由中间件

```javascript
/**
 * 路由级中间件
 */
const express = require('express');
const router = express.Router();

// 应用到所有路由的中间件
router.use((req, res, next) => {
  console.log('路由中间件执行');
  next();
});

// 特定路径的中间件
router.use('/protected', (req, res, next) => {
  // 验证逻辑
  if (!req.headers.authorization) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
});

/**
 * 多个中间件函数
 */
// 验证中间件
const validateUser = (req, res, next) => {
  const { name, email } = req.body;
  if (!name || !email) {
    return res.status(400).json({ error: 'Name and email required' });
  }
  next();
};

// 日志中间件
const logRequest = (req, res, next) => {
  console.log(`Creating user: ${req.body.name}`);
  next();
};

// 使用多个中间件
router.post('/users', validateUser, logRequest, userController.createUser);

/**
 * 错误处理中间件
 */
router.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});
```

---

## 30.3 中间件机制

### 30.3.1 内置中间件

```javascript
/**
 * Express内置中间件
 */
const express = require('express');
const app = express();

// 解析JSON
app.use(express.json({
  limit: '10mb',
  strict: true,
  type: 'application/json'
}));

// 解析URL编码数据
app.use(express.urlencoded({
  extended: true,
  limit: '10mb'
}));

// 静态文件服务
app.use('/public', express.static('public', {
  maxAge: '1d',
  etag: false
}));

// 原始数据解析
app.use(express.raw({ type: 'application/octet-stream' }));

// 文本解析
app.use(express.text({ type: 'text/plain' }));
```

### 30.3.2 第三方中间件

```javascript
/**
 * 常用第三方中间件
 */
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const rateLimit = require('express-rate-limit');

// 跨域资源共享
app.use(cors({
  origin: function(origin, callback) {
    const allowedOrigins = ['http://localhost:3000', 'https://myapp.com'];
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// 安全头设置
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"]
    }
  }
}));

// HTTP请求日志
app.use(morgan(':method :url :status :response-time ms'));

// Gzip压缩
app.use(compression({
  filter: (req, res) => {
    if (req.headers['x-no-compression']) {
      return false;
    }
    return compression.filter(req, res);
  }
}));

// 速率限制
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15分钟
  max: 100, // 最多100个请求
  message: 'Too many requests from this IP'
});
app.use('/api/', limiter);
```

### 30.3.3 自定义中间件

```javascript
/**
 * 自定义中间件示例
 */

// 认证中间件
const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }
  
  try {
    // 验证JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

// 请求ID中间件
const requestIdMiddleware = (req, res, next) => {
  req.id = Math.random().toString(36).substr(2, 9);
  res.setHeader('X-Request-ID', req.id);
  next();
};

// API版本中间件
const apiVersionMiddleware = (version) => {
  return (req, res, next) => {
    const clientVersion = req.headers['api-version'] || '1.0';
    
    if (clientVersion !== version) {
      return res.status(400).json({ 
        error: `API version ${version} required` 
      });
    }
    
    next();
  };
};

// 使用自定义中间件
app.use(requestIdMiddleware);
app.use('/api/v2', apiVersionMiddleware('2.0'));

/**
 * 异步中间件包装器
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// 使用异步中间件
app.get('/users', asyncHandler(async (req, res) => {
  const users = await User.findAll();
  res.json(users);
}));
```

---

## 30.4 模拟构建Mock API

### 30.4.1 Mock数据管理

```javascript
/**
 * mock/data.js - Mock数据
 */
const users = [
  {
    id: 1,
    name: 'Alice Johnson',
    email: 'alice@example.com',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alice',
    createdAt: '2023-01-15T08:00:00Z'
  },
  {
    id: 2,
    name: 'Bob Smith', 
    email: 'bob@example.com',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Bob',
    createdAt: '2023-02-20T10:30:00Z'
  }
];

const posts = [
  {
    id: 1,
    title: 'Getting Started with Express',
    content: 'Express is a fast, unopinionated web framework for Node.js...',
    authorId: 1,
    createdAt: '2023-03-01T14:00:00Z',
    tags: ['javascript', 'node.js', 'express']
  }
];

module.exports = { users, posts };

/**
 * Mock API控制器
 */
const mockData = require('../mock/data');

class MockController {
  // 获取用户列表
  static getUsers(req, res) {
    const { page = 1, limit = 10, search } = req.query;
    let filteredUsers = mockData.users;
    
    // 搜索过滤
    if (search) {
      filteredUsers = mockData.users.filter(user => 
        user.name.toLowerCase().includes(search.toLowerCase()) ||
        user.email.toLowerCase().includes(search.toLowerCase())
      );
    }
    
    // 分页
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + parseInt(limit);
    const paginatedUsers = filteredUsers.slice(startIndex, endIndex);
    
    // 模拟延迟
    setTimeout(() => {
      res.json({
        data: paginatedUsers,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: filteredUsers.length,
          totalPages: Math.ceil(filteredUsers.length / limit)
        }
      });
    }, 500); // 500ms延迟
  }
  
  // 获取单个用户
  static getUserById(req, res) {
    const { id } = req.params;
    const user = mockData.users.find(u => u.id === parseInt(id));
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    setTimeout(() => {
      res.json({ data: user });
    }, 300);
  }
  
  // 创建用户
  static createUser(req, res) {
    const { name, email } = req.body;
    
    // 验证邮箱唯一性
    const existingUser = mockData.users.find(u => u.email === email);
    if (existingUser) {
      return res.status(400).json({ error: 'Email already exists' });
    }
    
    const newUser = {
      id: Math.max(...mockData.users.map(u => u.id)) + 1,
      name,
      email,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${name}`,
      createdAt: new Date().toISOString()
    };
    
    mockData.users.push(newUser);
    
    setTimeout(() => {
      res.status(201).json({ data: newUser });
    }, 800);
  }
}

module.exports = MockController;
```

### 30.4.2 Mock中间件

```javascript
/**
 * Mock响应中间件
 */
const mockResponseMiddleware = (options = {}) => {
  const { delay = 0, errorRate = 0 } = options;
  
  return (req, res, next) => {
    // 模拟网络延迟
    setTimeout(() => {
      // 模拟随机错误
      if (Math.random() < errorRate) {
        return res.status(500).json({ 
          error: 'Internal Server Error',
          code: 'MOCK_ERROR'
        });
      }
      
      next();
    }, delay);
  };
};

// 使用Mock中间件
app.use('/api/mock', mockResponseMiddleware({ 
  delay: 300, 
  errorRate: 0.1 
}));

/**
 * 动态Mock数据生成
 */
const { faker } = require('@faker-js/faker');

const generateMockUsers = (count = 50) => {
  return Array.from({ length: count }, (_, index) => ({
    id: index + 1,
    name: faker.person.fullName(),
    email: faker.internet.email(),
    avatar: faker.image.avatar(),
    phone: faker.phone.number(),
    address: {
      street: faker.location.streetAddress(),
      city: faker.location.city(),
      country: faker.location.country()
    },
    company: faker.company.name(),
    createdAt: faker.date.past().toISOString()
  }));
};

// 动态Mock API
app.get('/api/mock/users', (req, res) => {
  const { count = 10 } = req.query;
  const users = generateMockUsers(parseInt(count));
  
  res.json({
    data: users,
    meta: {
      generated: true,
      timestamp: new Date().toISOString()
    }
  });
});
```

---

## 30.5 前后端联调技巧

### 30.5.1 开发环境配置

```javascript
/**
 * 开发环境配置
 */
// config/development.js
module.exports = {
  port: process.env.PORT || 3001,
  cors: {
    origin: ['http://localhost:3000', 'http://localhost:8080'],
    credentials: true
  },
  logging: {
    level: 'debug',
    format: 'dev'
  },
  mock: {
    enabled: true,
    delay: 200
  }
};

/**
 * 环境变量管理
 */
// .env.development
NODE_ENV=development
PORT=3001
DB_HOST=localhost
DB_NAME=myapp_dev
JWT_SECRET=dev_secret_key
CORS_ORIGIN=http://localhost:3000

// 加载环境变量
require('dotenv').config();

const config = {
  development: require('./config/development'),
  production: require('./config/production'),
  test: require('./config/test')
};

module.exports = config[process.env.NODE_ENV || 'development'];
```

### 30.5.2 API文档和测试

```javascript
/**
 * API文档生成（使用Swagger）
 */
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'My API',
      version: '1.0.0',
      description: 'API文档'
    },
    servers: [
      {
        url: 'http://localhost:3001',
        description: '开发服务器'
      }
    ]
  },
  apis: ['./routes/*.js']
};

const specs = swaggerJsdoc(options);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

/**
 * 路由文档注释
 */
/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: 获取用户列表
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: 页码
 *     responses:
 *       200:
 *         description: 成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/User'
 */

/**
 * API测试
 */
// tests/api.test.js
const request = require('supertest');
const app = require('../app');

describe('User API', () => {
  it('should get users list', async () => {
    const response = await request(app)
      .get('/api/users')
      .expect(200);
      
    expect(response.body).toHaveProperty('data');
    expect(Array.isArray(response.body.data)).toBe(true);
  });
  
  it('should create a new user', async () => {
    const userData = {
      name: 'Test User',
      email: 'test@example.com'
    };
    
    const response = await request(app)
      .post('/api/users')
      .send(userData)
      .expect(201);
      
    expect(response.body.data).toMatchObject(userData);
  });
});
```

### 30.5.3 调试和监控

```javascript
/**
 * 请求日志中间件
 */
const debugMiddleware = (req, res, next) => {
  const startTime = Date.now();
  
  // 记录请求信息
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  console.log('Headers:', JSON.stringify(req.headers, null, 2));
  
  if (req.body && Object.keys(req.body).length > 0) {
    console.log('Body:', JSON.stringify(req.body, null, 2));
  }
  
  // 拦截响应
  const originalSend = res.send;
  res.send = function(data) {
    const duration = Date.now() - startTime;
    console.log(`Response time: ${duration}ms`);
    console.log('Response:', data);
    console.log('---');
    
    originalSend.call(this, data);
  };
  
  next();
};

// 仅在开发环境使用
if (process.env.NODE_ENV === 'development') {
  app.use(debugMiddleware);
}

/**
 * 错误收集
 */
const errorCollector = {
  errors: [],
  
  collect(error, req) {
    this.errors.push({
      message: error.message,
      stack: error.stack,
      url: req.url,
      method: req.method,
      timestamp: new Date().toISOString(),
      userAgent: req.headers['user-agent']
    });
    
    // 保留最近100个错误
    if (this.errors.length > 100) {
      this.errors = this.errors.slice(-100);
    }
  },
  
  getErrors() {
    return this.errors;
  }
};

// 错误监控端点
app.get('/debug/errors', (req, res) => {
  res.json(errorCollector.getErrors());
});
```

---

---

**本章总结**

第30章介绍了Express框架在Node.js Web开发中的应用：

1. **Express基础**：
   - 轻量级Web应用框架的设计理念
   - 简洁而强大的API接口
   - 快速搭建HTTP服务器的能力
   - 与Node.js原生http模块的关系

2. **路由系统**：
   - RESTful API的路由设计原则
   - 动态路由参数和查询参数处理
   - 路由中间件的使用和组合
   - 路由模块化和项目组织结构

3. **中间件机制**：
   - 中间件的执行顺序和数据流
   - 内置中间件和第三方中间件使用
   - 自定义中间件的编写技巧
   - 错误处理中间件的特殊机制

4. **模拟Mock API构建**：
   - 前后端分离开发的协作模式
   - 快速构建测试数据接口
   - CORS跨域问题的解决方案
   - API文档和接口规范制定

5. **前后端联调技巧**：
   - 开发环境的代理配置
   - 接口调试和数据验证方法
   - 错误处理和日志记录策略
   - 部署和生产环境配置

**关键要点**：
- Express是Node.js生态中最受欢迎的Web框架
- 中间件系统提供了灵活的请求处理管道
- 良好的项目结构是大型应用的基础
- Mock API能够显著提升前后端协作效率

**教程总结**

至此，我们完成了JavaScript从基础到高级、从前端到后端的完整学习旅程。这套教程涵盖了现代JavaScript开发的核心知识点，为成为全栈JavaScript开发者奠定了坚实的基础。

继续学习的方向包括：TypeScript类型系统、React/Vue等前端框架、数据库操作、微服务架构等更高级的主题。
