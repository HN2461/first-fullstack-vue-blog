---
title: "第 18 篇：DOM 文档对象模型基础"
slug: "js-js-dom-cefe5122"
summary: "DOM（文档对象模型）基础概念介绍，包含DOM树结构、元素、节点等核心概念的理解。"
category: "辅助资料"
tags:
  - "JavaScript"
  - "DOM"
  - "文档对象模型"
status: "draft"
sortOrder: 180
cover: ""
originalId: "6a2d291f8a2b1c68f2cac410"
originalSlug: "js-js-dom-cefe5122"
originalStatus: "published"
exportedAt: "2026-07-31T03:42:38.792Z"
---
# 第 18 篇：DOM 文档对象模型基础
**文档对象模型**（Document Object Model，简称DOM），它就是一系列**编程接口**，有了这些接口，就可以**改变页面内容，结构和样式**

## 一、DOM核心概念

### 1. 文档（Document）
一个页面就是一个文档，DOM中使用`document`表示。`document`是DOM树的根节点，提供了访问整个文档的方法和属性。

### 2. 元素（Element）
页面中所有的标签都是元素，DOM中使用`element`表示。元素节点对应HTML标签，是DOM操作的主要对象。

### 3. 节点（Node）
网页中所有内容都是节点（标签、属性、文本、注释等），DOM中使用`node`表示。DOM中的节点构成了一棵树形结构。

### 4. DOM的面向对象特性
**DOM把以上内容都看作是对象**，每个节点都是一个对象，具有属性和方法。

## 二、DOM节点类型详解

DOM定义了12种节点类型，每种类型都有对应的数字常量和特征：

### 主要节点类型表格

| 节点类型 | 常量值 | 说明 | 示例 |
|---------|--------|------|------|
| `ELEMENT_NODE` | 1 | 元素节点 | `<div>`, `<p>`, `<span>` |
| `ATTRIBUTE_NODE` | 2 | 属性节点（已废弃） | `id="example"` |
| `TEXT_NODE` | 3 | 文本节点 | 元素内的文本内容 |
| `CDATA_SECTION_NODE` | 4 | CDATA节点 | `<![CDATA[content]]>` |
| `ENTITY_REFERENCE_NODE` | 5 | 实体引用节点（已废弃） | `&nbsp;` |
| `ENTITY_NODE` | 6 | 实体节点（已废弃） | - |
| `PROCESSING_INSTRUCTION_NODE` | 7 | 处理指令节点 | `<?xml version="1.0"?>` |
| `COMMENT_NODE` | 8 | 注释节点 | `<!-- 注释内容 -->` |
| `DOCUMENT_NODE` | 9 | 文档节点 | `document`对象 |
| `DOCUMENT_TYPE_NODE` | 10 | 文档类型节点 | `<!DOCTYPE html>` |
| `DOCUMENT_FRAGMENT_NODE` | 11 | 文档片段节点 | `DocumentFragment` |
| `NOTATION_NODE` | 12 | 符号节点（已废弃） | - |

### 常用节点类型检查示例：

```javascript
// 检查节点类型
const element = document.getElementById('example');
console.log(element.nodeType); // 1 (ELEMENT_NODE)
console.log(element.nodeName); // "DIV" (标签名)
console.log(element.nodeValue); // null (元素节点的nodeValue为null)

// 文本节点示例
const textNode = element.firstChild;
if (textNode && textNode.nodeType === Node.TEXT_NODE) {
    console.log(textNode.nodeType); // 3 (TEXT_NODE)
    console.log(textNode.nodeValue); // 文本内容
}

// 文档节点
console.log(document.nodeType); // 9 (DOCUMENT_NODE)
console.log(document.nodeName); // "#document"

// 节点类型常量检查
console.log(Node.ELEMENT_NODE); // 1
console.log(Node.TEXT_NODE); // 3
console.log(Node.COMMENT_NODE); // 8
```

## 三、DOM树形结构

### DOM树的基本概念

<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.nlark.com/yuque/0/2025/png/50923934/1741693837369-4b812c69-9ad7-4ef5-8b0f-6687650dffef.png)

DOM将HTML文档解析为一个由节点组成的树形结构，每个HTML元素、属性、文本都对应树中的一个节点。

### 节点层级关系示例

```html
<!DOCTYPE html>
<html>
<head>
    <title>示例页面</title>
</head>
<body>
    <!-- 这是一个注释 -->
    <div id="container">
        <h1>标题文本</h1>
        <p class="paragraph">段落文本内容</p>
    </div>
</body>
</html>
```

对应的DOM树结构：

```
Document (document)
├── DocumentType (doctype)
└── Element (html)
    ├── Element (head)
    │   └── Element (title)
    │       └── Text (示例页面)
    └── Element (body)
        ├── Comment (这是一个注释)
        └── Element (div#container)
            ├── Element (h1)
            │   └── Text (标题文本)
            └── Element (p.paragraph)
                └── Text (段落文本内容)
```

### 节点关系属性

| 属性 | 说明 | 返回类型 |
|------|------|----------|
| `parentNode` | 父节点 | Node |
| `childNodes` | 子节点列表 | NodeList |
| `firstChild` | 第一个子节点 | Node |
| `lastChild` | 最后一个子节点 | Node |
| `nextSibling` | 下一个兄弟节点 | Node |
| `previousSibling` | 上一个兄弟节点 | Node |
| `ownerDocument` | 所属文档 | Document |

### 节点关系操作示例

```javascript
// 获取元素
const container = document.getElementById('container');

// 父节点关系
console.log(container.parentNode); // body元素

// 子节点关系
console.log(container.childNodes); // NodeList [h1, p]
console.log(container.firstChild); // h1元素
console.log(container.lastChild); // p元素

// 兄弟节点关系
const h1 = container.firstChild;
console.log(h1.nextSibling); // p元素
console.log(h1.nextSibling.previousSibling); // h1元素（自己）


// 所属文档
console.log(container.ownerDocument === document); // true

## 四、DOM基本操作

### 1. 元素获取方法

| 方法 | 说明 | 返回类型 | 性能特点 |
|------|------|----------|----------|
| `getElementById(id)` | 通过ID获取元素 | Element/null | ⚡ 最快 |
| `getElementsByTagName(tag)` | 通过标签名获取元素集合 | HTMLCollection | ⚡ 很快 |
| `getElementsByClassName(class)` | 通过类名获取元素集合 | HTMLCollection | ⚡ 很快 |
| `querySelector(selectors)` | CSS选择器获取第一个元素 | Element/null | ⚠️ 较慢 |
| `querySelectorAll(selectors)` | CSS选择器获取所有元素 | NodeList | ⚠️ 较慢 |

#### 元素获取示例：

```javascript
// ID获取（唯一）
const header = document.getElementById('header');

// 标签名获取（集合）
const paragraphs = document.getElementsByTagName('p');
console.log(paragraphs.length); // 段落数量

// 类名获取（集合）
const buttons = document.getElementsByClassName('btn');

// CSS选择器获取（现代推荐）
const firstButton = document.querySelector('.btn'); // 第一个
const allButtons = document.querySelectorAll('.btn'); // 所有

// 复杂选择器
const navLinks = document.querySelectorAll('nav ul li a');
const submitBtn = document.querySelector('form#login input[type="submit"]');
```

### 2. 元素创建和插入

#### 创建元素节点：

```javascript
// 创建元素
const newDiv = document.createElement('div');
newDiv.id = 'new-element';
newDiv.className = 'container';

// 创建文本节点
const textNode = document.createTextNode('这是文本内容');

// 创建注释节点
const commentNode = document.createComment('这是注释');

// 创建文档片段（性能优化）
const fragment = document.createDocumentFragment();
```

#### 元素插入方法：

| 方法 | 说明 | 位置 |
|------|------|------|
| `appendChild(child)` | 添加子元素 | 末尾 |
| `insertBefore(new, reference)` | 在指定元素前插入 | 指定位置前 |
| `insertAdjacentElement(position, element)` | 相邻位置插入 | 四周 |
| `insertAdjacentHTML(position, html)` | 插入HTML文本 | 四周 |

```javascript
// 获取父容器
const container = document.getElementById('container');

// 1. appendChild - 添加到末尾
container.appendChild(newDiv);

// 2. insertBefore - 在指定元素前插入
const referenceElement = container.firstChild;
const newElement = document.createElement('p');
container.insertBefore(newElement, referenceElement);

// 3. insertAdjacentElement - 灵活插入
const target = document.querySelector('.target');

// 四个位置选项：
// 'beforebegin' - 元素前面
// 'afterbegin' - 元素内部开头
// 'beforeend' - 元素内部结尾  
// 'afterend' - 元素后面
target.insertAdjacentElement('beforebegin', newDiv);

// 4. insertAdjacentHTML - 插入HTML
const htmlContent = '<p class="dynamic">动态插入的HTML</p>';
target.insertAdjacentHTML('afterbegin', htmlContent);
```

### 3. 元素删除和替换

```javascript
// 删除元素
const elementToRemove = document.getElementById('remove-me');

// 方法1：通过父元素删除
elementToRemove.parentNode.removeChild(elementToRemove);

// 方法2：直接删除（现代浏览器）
elementToRemove.remove();

// 替换元素
const oldElement = document.getElementById('old-element');
const newElement = document.createElement('div');
newElement.textContent = '新内容';

// 使用新元素替换旧元素
oldElement.parentNode.replaceChild(newElement, oldElement);
```

### 4. 元素内容和属性操作

#### 内容操作：

```javascript
const element = document.getElementById('content-element');

// innerHTML - 获取/设置HTML内容（包含标签）
console.log(element.innerHTML); // 获取HTML
element.innerHTML = '<strong>加粗文本</strong>'; // 设置HTML

// textContent - 获取/设置文本内容（不包含标签）
console.log(element.textContent); // 获取纯文本
element.textContent = '纯文本内容'; // 设置纯文本

// innerText - 类似textContent，但考虑CSS样式
console.log(element.innerText); // 获取可见文本
element.innerText = '可见文本'; // 设置文本

// value - 表单元素值
const input = document.querySelector('input');
console.log(input.value); // 获取输入值
input.value = '新值'; // 设置输入值
```

#### 属性操作：

```javascript
const img = document.querySelector('img');

// getAttribute/setAttribute - 通用属性操作
const src = img.getAttribute('src');
img.setAttribute('alt', '图片描述');

// 直接属性访问
console.log(img.src); // 完整URL
console.log(img.id); // ID值
console.log(img.className); // 类名字符串

// classList - 类名操作（推荐）
const div = document.querySelector('div');
div.classList.add('new-class'); // 添加类
div.classList.remove('old-class'); // 移除类
div.classList.toggle('active'); // 切换类
div.classList.contains('existing'); // 检查类

// dataset - 数据属性
div.dataset.userId = '123';
console.log(div.dataset.userId); // '123'

// style - 内联样式
const element = document.querySelector('.styled');
element.style.color = 'red';
element.style.fontSize = '16px';

// 批量设置样式
Object.assign(element.style, {
    backgroundColor: '#f0f0f0',
    padding: '10px',
    borderRadius: '5px'
});
```

## 五、实际应用案例

### 案例1：动态列表管理

```javascript
// 动态添加和删除列表项
class TodoList {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.items = [];
    }

    addItem(text) {
        // 创建列表项元素
        const li = document.createElement('li');
        li.className = 'todo-item';
        
        // 创建文本内容
        li.innerHTML = `
            <span class="text">${this.escapeHtml(text)}</span>
            <button class="delete-btn">删除</button>
        `;

        // 绑定删除事件
        const deleteBtn = li.querySelector('.delete-btn');
        deleteBtn.addEventListener('click', () => this.removeItem(li));

        // 添加到容器
        this.container.appendChild(li);
        this.items.push(li);
        
        return li;
    }

    removeItem(itemElement) {
        itemElement.remove();
        this.items = this.items.filter(item => item !== itemElement);
    }

    removeAllItems() {
        // 使用文档片段优化性能
        const fragment = document.createDocumentFragment();
        this.items.forEach(item => {
            item.remove();
        });
        this.items = [];
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// 使用示例
const todoList = new TodoList('todo-container');
todoList.addItem('学习DOM操作');
todoList.addItem('完成项目任务');
```

### 案例2：表格数据动态渲染

```javascript
// 动态表格数据渲染
class DataTable {
    constructor(tableId, data) {
        this.table = document.getElementById(tableId);
        this.data = data;
        this.render();
    }

    render() {
        // 使用DocumentFragment提高性能
        const fragment = document.createDocumentFragment();
        
        // 创建表头
        const thead = this.createHeader();
        
        // 创建表体
        const tbody = this.createBody();
        
        fragment.appendChild(thead);
        fragment.appendChild(tbody);
        
        // 清空并更新表格
        this.table.innerHTML = '';
        this.table.appendChild(fragment);
    }

    createHeader() {
        const thead = document.createElement('thead');
        const headerRow = document.createElement('tr');
        
        // 假设数据第一行包含所有字段名
        const firstRow = this.data[0];
        Object.keys(firstRow).forEach(key => {
            const th = document.createElement('th');
            th.textContent = this.formatColumnName(key);
            headerRow.appendChild(th);
        });
        
        // 添加操作列
        const actionTh = document.createElement('th');
        actionTh.textContent = '操作';
        headerRow.appendChild(actionTh);
        
        thead.appendChild(headerRow);
        return thead;
    }

    createBody() {
        const tbody = document.createElement('tbody');
        
        this.data.forEach((row, index) => {
            const tr = document.createElement('tr');
            tr.dataset.index = index;
            
            // 创建数据单元格
            Object.values(row).forEach(value => {
                const td = document.createElement('td');
                td.textContent = value;
                tr.appendChild(td);
            });
            
            // 创建操作单元格
            const actionTd = document.createElement('td');
            actionTd.innerHTML = `
                <button class="edit-btn">编辑</button>
                <button class="delete-btn">删除</button>
            `;
            
            // 绑定操作事件
            const editBtn = actionTd.querySelector('.edit-btn');
            const deleteBtn = actionTd.querySelector('.delete-btn');
            
            editBtn.addEventListener('click', () => this.editRow(index));
            deleteBtn.addEventListener('click', () => this.deleteRow(index));
            
            tr.appendChild(actionTd);
            tbody.appendChild(tr);
        });
        
        return tbody;
    }

    formatColumnName(key) {
        // 格式化列名显示
        return key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
    }

    editRow(index) {
        console.log('编辑第', index + 1, '行');
        // 编辑逻辑...
    }

    deleteRow(index) {
        if (confirm('确定要删除这行数据吗？')) {
            this.data.splice(index, 1);
            this.render();
        }
    }
}

// 使用示例
const sampleData = [
    { id: 1, name: '张三', age: 25, city: '北京' },
    { id: 2, name: '李四', age: 30, city: '上海' },
    { id: 3, name: '王五', age: 28, city: '广州' }
];

const dataTable = new DataTable('data-table', sampleData);
```

### 案例3：表单验证和动态反馈

```javascript
// 实时表单验证
class FormValidator {
    constructor(formId) {
        this.form = document.getElementById(formId);
        this.init();
    }

    init() {
        // 为所有输入字段绑定实时验证
        const inputs = this.form.querySelectorAll('input, textarea, select');
        
        inputs.forEach(input => {
            input.addEventListener('blur', (e) => {
                this.validateField(e.target);
            });
            
            // 密码确认字段特殊处理
            if (input.type === 'password' && input.id.includes('confirm')) {
                const originalPassword = this.form.querySelector('input[type="password"]');
                input.addEventListener('input', (e) => {
                    this.validatePasswordMatch(originalPassword, e.target);
                });
            }
        });
        
        // 表单提交验证
        this.form.addEventListener('submit', (e) => {
            if (!this.validateForm()) {
                e.preventDefault();
            }
        });
    }

    validateField(field) {
        // 清除之前的错误状态
        this.clearError(field);
        
        // 必填字段验证
        if (field.hasAttribute('required') && !field.value.trim()) {
            this.showError(field, '此字段为必填项');
            return false;
        }
        
        // 邮箱格式验证
        if (field.type === 'email' && field.value) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(field.value)) {
                this.showError(field, '请输入有效的邮箱地址');
                return false;
            }
        }
        
        // 手机号验证
        if (field.dataset.type === 'phone' && field.value) {
            const phoneRegex = /^1[3-9]\d{9}$/;
            if (!phoneRegex.test(field.value)) {
                this.showError(field, '请输入有效的手机号');
                return false;
            }
        }
        
        // 长度验证
        if (field.hasAttribute('minlength') && field.value.length < parseInt(field.getAttribute('minlength'))) {
            this.showError(field, `最少需要${field.getAttribute('minlength')}个字符`);
            return false;
        }
        
        return true;
    }

    validatePasswordMatch(passwordField, confirmField) {
        if (passwordField.value !== confirmField.value) {
            this.showError(confirmField, '两次输入的密码不一致');
            return false;
        } else {
            this.clearError(confirmField);
            return true;
        }
    }

    validateForm() {
        let isValid = true;
        const fields = this.form.querySelectorAll('input, textarea, select');
        
        fields.forEach(field => {
            if (!this.validateField(field)) {
                isValid = false;
            }
        });
        
        return isValid;
    }

    showError(field, message) {
        // 添加错误类
        field.classList.add('error');
        
        // 创建或更新错误提示
        let errorElement = field.parentNode.querySelector('.error-message');
        
        if (!errorElement) {
            errorElement = document.createElement('div');
            errorElement.className = 'error-message';
            field.parentNode.appendChild(errorElement);
        }
        
        errorElement.textContent = message;
        errorElement.style.color = 'red';
        errorElement.style.fontSize = '12px';
        errorElement.style.marginTop = '4px';
    }

    clearError(field) {
        field.classList.remove('error');
        const errorElement = field.parentNode.querySelector('.error-message');
        if (errorElement) {
            errorElement.remove();
        }
    }
}

// 使用示例
const validator = new FormValidator('user-form');
```

## 六、DOM操作最佳实践

### 1. 性能优化原则

```javascript
// ❌ 避免频繁DOM操作
for (let i = 0; i < 1000; i++) {
    document.body.innerHTML += '<div>' + i + '</div>'; // 性能差
}

// ✅ 使用DocumentFragment批量操作
const fragment = document.createDocumentFragment();
for (let i = 0; i < 1000; i++) {
    const div = document.createElement('div');
    div.textContent = i;
    fragment.appendChild(div);
}
document.body.appendChild(fragment);

// ✅ 缓存DOM查询结果
const element = document.getElementById('my-element'); // 缓存结果
for (let i = 0; i < 100; i++) {
    element.style.color = i % 2 ? 'red' : 'blue'; // 避免重复查询
}

// ❌ 避免在循环中查询DOM
// for (let i = 0; i < elements.length; i++) {
//     const element = document.getElementById('element-' + i); // 重复查询
// }

// ✅ 使用事件委托
document.getElementById('list').addEventListener('click', function(e) {
    if (e.target.tagName === 'LI') {
        console.log('点击了列表项:', e.target.textContent);
    }
});
```

### 2. 代码组织结构

```javascript
// 推荐：模块化DOM操作
const DOMUtils = {
    // 元素选择器封装
    $(selector, context = document) {
        return context.querySelector(selector);
    },
    
    $$(selector, context = document) {
        return context.querySelectorAll(selector);
    },
    
    // 元素创建
    create(tagName, attributes = {}, children = []) {
        const element = document.createElement(tagName);
        
        // 设置属性
        Object.keys(attributes).forEach(key => {
            if (key === 'class') {
                element.className = attributes[key];
            } else if (key === 'text') {
                element.textContent = attributes[key];
            } else if (key === 'html') {
                element.innerHTML = attributes[key];
            } else {
                element.setAttribute(key, attributes[key]);
            }
        });
        
        // 添加子元素
        children.forEach(child => {
            if (typeof child === 'string') {
                element.appendChild(document.createTextNode(child));
            } else {
                element.appendChild(child);
            }
        });
        
        return element;
    },
    
    // DOM操作封装
    append(parent, child) {
        return parent.appendChild(child);
    },
    
    remove(element) {
        if (element.parentNode) {
            element.parentNode.removeChild(element);
        }
    },
    
    // 事件绑定
    on(element, event, handler) {
        element.addEventListener(event, handler);
    },
    
    off(element, event, handler) {
        element.removeEventListener(event, handler);
    }
};

// 使用示例
const newElement = DOMUtils.create('div', {
    class: 'container',
    id: 'main-content'
}, [
    DOMUtils.create('h1', { text: '标题' }),
    DOMUtils.create('p', { text: '段落内容' })
]);

DOMUtils.append(document.body, newElement);
```

## 总结

1. **DOM是JavaScript操作网页的桥梁**：通过DOM API可以动态操作网页的内容、结构和样式

2. **理解节点类型很重要**：掌握12种节点类型及其特点，能够准确判断和操作不同类型的节点

3. **树形结构是核心**：DOM将HTML文档转化为树形结构，理解父子、兄弟关系是进行复杂操作的基础

4. **选择合适的方法**：不同场景选择不同的元素获取和操作方式，平衡性能和功能需求

5. **注重性能优化**：避免频繁的DOM操作，使用DocumentFragment、事件委托等技术提升性能

6. **现代开发趋势**：虽然框架（如Vue、React）封装了DOM操作，但原生DOM知识仍然是前端工程师必备的基础技能


```
