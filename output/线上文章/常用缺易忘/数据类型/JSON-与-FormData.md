---
title: "JSON 与 FormData"
slug: "json-formdata-b830a9f9"
summary: ""
category: "数据类型"
tags: []
status: "draft"
sortOrder: 40
cover: ""
originalId: "6a2d291f8a2b1c68f2cac33a"
originalSlug: "json-formdata-b830a9f9"
originalStatus: "published"
exportedAt: "2026-07-30T14:08:39.359Z"
---
## 📖 第一部分：JSON 格式详解
### 一、JSON 是什么？
JSON（JavaScript Object Notation）是一种**轻量级的数据交换格式**，基于文本，独立于编程语言。

### 二、核心语法规则
#### **1. 基本结构**
+ **对象**：花括号 `{}` 包裹
+ **数组**：方括号 `[]` 包裹
+ **最外层**必须是对象或数组

#### **2. 键（Key）规则**
```json
{
  "key": "value"     // ✅ 正确：双引号包裹
   key: "value"       // ❌ 错误：不能省略引号
  'key': "value"     // ❌ 错误：不能用单引号
}
```

+ ✅ **必须使用双引号** `"` 包裹键名
+ ❌ 不能使用单引号
+ ❌ 不能省略引号

#### **3. 值（Value）数据类型**
| 类型 | 示例 | 说明 |
| --- | --- | --- |
| **字符串** | `"Hello"` | 必须双引号包裹 |
| **数字** | `42`, `3.14`, `-10` | 整数/小数/负数 |
| **布尔值** | `true`, `false` | 必须小写 |
| **null** | `null` | 必须小写 |
| **对象** | `{"key": "value"}` | 嵌套对象 |
| **数组** | `[1, 2, 3]` | 有序列表 |


#### **4. 禁止的数据类型**
+ ❌ 函数（function）
+ ❌ undefined
+ ❌ NaN、Infinity
+ ❌ Date对象
+ ❌ 正则表达式
+ ❌ Symbol

#### **5. 格式要求**
+ ✅ 键值对用逗号分隔
+ ❌ **最后不能有尾随逗号**
+ ✅ 字符串特殊字符需转义：`\"`、`\n`、`\t`、`\uXXXX`
+ ⚠️ 数值不能有前导零（如 `0123`）
+ ❌ JSON 不支持注释

### 三、完整示例
```json
{
  "user": {
    "name": "张三",
    "age": 25,
    "isStudent": true,
    "hobbies": ["阅读", "音乐", "运动"],
    "address": {
      "city": "北京",
      "zip": "100000"
    },
    "score": null
  }
}
```

### 四、验证与工具
```javascript
// JavaScript 验证
try {
  const obj = JSON.parse(jsonString);
  console.log("Valid JSON");
} catch (e) {
  console.log("Invalid JSON:", e.message);
}

// 生成格式化的 JSON
const jsonStr = JSON.stringify(obj, null, 2);  // 2空格缩进
```

---

## 📎 第二部分：FormData 详解
### 一、FormData 是什么？
FormData 是浏览器提供的 API，用于构造表单数据，特别适合**文件上传**和传统表单提交。

### 二、基本使用
```javascript
// 创建 FormData
const formData = new FormData();

// 添加数据
formData.append('username', '张三');
formData.append('age', '25');
formData.append('avatar', fileInput.files[0]); // 直接添加文件

// 从表单元素创建
const form = document.getElementById('myForm');
const formData = new FormData(form);
```

### 三、主要特点
1. **原生文件支持**：可直接附加 File 对象
2. **二进制传输**：文件以原始二进制格式传输
3. **自动边界处理**：浏览器自动设置 multipart 边界
4. **扁平结构**：不支持嵌套对象（需手动处理）
5. **适合大文件**：支持流式上传

### 四、Content-Type
+ **自动设置**：`multipart/form-data; boundary=----WebKitFormBoundaryxxx`
+ **不要手动设置**：浏览器会自动处理

```javascript
// ❌ 错误：手动设置 Content-Type
headers: { 'Content-Type': 'multipart/form-data' }

// ✅ 正确：让浏览器自动设置
// 不设置 Content-Type 头部
```

---

## 🔄 第三部分：JSON vs FormData 对比
### 一、核心差异对比
| 特性 | JSON | FormData |
| --- | --- | --- |
| **数据类型** | 纯文本格式 | 二进制/文本混合 |
| **数据结构** | 支持嵌套对象和数组 | 扁平键值对 |
| **文件支持** | 需Base64编码（体积+33%） | 原生支持二进制文件 |
| **Content-Type** | `application/json` | `multipart/form-data` |
| **主要用途** | API数据交换、配置 | 表单提交、文件上传 |
| **可读性** | ✅ 人类可读 | ❌ 二进制不可读 |
| **传输效率** | ⚠️ 文本较大（Base64膨胀） | ✅ 二进制高效 |
| **调试难度** | ✅ 容易 | ⚠️ 较难 |


### 二、数据结构对比
```javascript
// 相同数据的不同表示

// JSON：结构化，支持嵌套
{
  "user": {
    "name": "张三",
    "profile": {
      "avatar": "base64...", // 文件被编码
      "bio": "Hello"
    }
  }
}

// FormData：扁平化，文件直接附加
/*
Content-Disposition: form-data; name="user[name]"
张三

Content-Disposition: form-data; name="user[profile][bio]"
Hello

Content-Disposition: form-data; name="avatar"; filename="photo.jpg"
Content-Type: image/jpeg
（二进制数据）
*/
```

### 三、请求示例对比
#### **JSON 请求**
```javascript
fetch('/api/users', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: '张三',
    email: 'zhang@example.com',
    preferences: {
      theme: 'dark',
      notifications: true
    }
  })
});
```

#### **FormData 请求**
```javascript
const formData = new FormData();
formData.append('name', '张三');
formData.append('email', 'zhang@example.com');
formData.append('avatar', fileInput.files[0]);

fetch('/upload', {
  method: 'POST',
  body: formData  // 不设置 Content-Type！
});
```

### 四、文件处理对比
```javascript
// JSON：需要Base64编码（不推荐用于大文件）
const reader = new FileReader();
reader.onload = function(e) {
  const base64Data = e.target.result;
  
  fetch('/api/upload', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      fileName: file.name,
      fileData: base64Data.split(',')[1]
    })
  });
};
reader.readAsDataURL(file);

// FormData：直接附加文件（推荐）
const formData = new FormData();
formData.append('file', file);
formData.append('otherData', '其他信息');

fetch('/upload', {
  method: 'POST',
  body: formData
});
```

---

## 🎯 第四部分：选择指南与最佳实践
### 一、选择 JSON 的场景
✅ **传输纯结构化数据**（无文件）  
✅ **需要复杂嵌套数据结构**  
✅ **RESTful API 设计**  
✅ **需要良好可读性和调试性**  
✅ **跨平台 API 设计**

### 二、选择 FormData 的场景
✅ **需要上传文件**  
✅ **提交传统 HTML 表单**  
✅ **传输大量二进制数据**  
✅ **需要流式上传/断点续传**  
✅ **与现有表单系统兼容**

### 三、混合使用策略
#### **方案1：分开传输**
```javascript
// 先传数据（JSON）
fetch('/api/user', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(userData)
});

// 再传文件（FormData）
const formData = new FormData();
formData.append('avatar', file);
fetch('/api/user/avatar', {
  method: 'POST',
  body: formData
});
```

#### **方案2：复杂数据序列化**
```javascript
const formData = new FormData();
formData.append('userData', JSON.stringify({
  name: '张三',
  preferences: ['a', 'b', 'c']  // 复杂数据先转JSON
}));
formData.append('avatar', file);  // 文件直接附加
```

### 四、转换工具函数
#### **对象转 FormData（支持嵌套）**
```javascript
function objectToFormData(obj, formData = new FormData(), parentKey = '') {
  for (let key in obj) {
    if (obj.hasOwnProperty(key)) {
      const value = obj[key];
      const formKey = parentKey ? `${parentKey}[${key}]` : key;
      
      if (value && typeof value === 'object' && !(value instanceof File)) {
        objectToFormData(value, formData, formKey);
      } else {
        formData.append(formKey, value);
      }
    }
  }
  return formData;
}
```

#### **FormData 转对象**
```javascript
function formDataToObject(formData) {
  const obj = {};
  formData.forEach((value, key) => {
    // 简单处理，文件会变成字符串 "[object File]"
    obj[key] = value;
  });
  return obj;
}
```

### 五、最佳实践总结
1. **纯数据用 JSON，带文件用 FormData**
2. **API 设计优先使用 JSON，文件上传单独处理**
3. **FormData 不要手动设置 Content-Type**
4. **大文件上传必须用 FormData**
5. **JSON 文件需 Base64 编码，体积会增大 33%**
6. **复杂嵌套结构避免用 FormData**
7. **调试时 JSON 更容易，FormData 需要特殊工具**

---

## 📋 第五部分：快速参考表
### JSON 格式检查清单
- [ ] 最外层是 `{}` 或 `[]`
- [ ] 所有键用双引号包裹
- [ ] 所有字符串值用双引号包裹
- [ ] 没有尾随逗号
- [ ] 没有注释
- [ ] 没有非法数据类型
- [ ] 特殊字符已正确转义
- [ ] true/false/null 小写

### FormData 使用清单
- [ ] 文件直接用 `append()` 添加
- [ ] 不要设置 Content-Type 头部
- [ ] 复杂数据需要手动序列化
- [ ] 适合文件上传和大数据
- [ ] 支持从表单元素直接创建

### 选择决策表
| 场景 | 推荐方案 | 原因 |
| --- | --- | --- |
| 用户注册（无文件） | JSON | 结构化数据，易于处理 |
| 头像上传 | FormData | 文件直接传输，效率高 |
| 配置信息保存 | JSON | 嵌套结构，可读性好 |
| 多文件上传 | FormData | 原生支持，流式传输 |
| RESTful API | JSON | 行业标准，兼容性好 |
| 传统表单提交 | FormData | 直接对应 HTML 表单 |


---

## 💡 最终总结
### **一句话总结**
**JSON 适合传输结构化数据，FormData 适合上传文件。**

### **关键区别记忆**
1. **JSON** = 文本 + 结构 + Base64文件
2. **FormData** = 二进制 + 扁平 + 直接文件

### **黄金法则**
+ 没有文件 → 用 **JSON**
+ 有文件 → 用 **FormData**
+ 又复杂又有文件 → **混合使用**或**分开传输**

### **开发建议**
1. 设计 API 时优先考虑 JSON
2. 文件上传接口单独设计，使用 FormData
3. 保持一致性，不要混用
4. 使用现代工具（如 GraphQL + 文件上传分离）

掌握 JSON 和 FormData 的区别与正确使用场景，是前端开发的重要基础技能，能显著提升开发效率和系统性能。
