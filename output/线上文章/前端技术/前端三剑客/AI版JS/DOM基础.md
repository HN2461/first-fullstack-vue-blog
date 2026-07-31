---
title: "DOM基础"
slug: "js-dom-cc9e923c"
summary: ""
category: "AI版JS"
tags: []
status: "draft"
sortOrder: 280
cover: ""
originalId: "6a2d291e8a2b1c68f2cac0e6"
originalSlug: "js-dom-cc9e923c"
originalStatus: "published"
exportedAt: "2026-07-31T03:42:38.792Z"
---
# 第12章　DOM基础

DOM（Document Object Model，文档对象模型）是JavaScript操作网页的核心接口。它将HTML文档表示为节点树，让我们能够动态地操作网页内容、结构和样式。本章将全面掌握DOM操作的基础知识。

## 12.1 DOM树结构

理解DOM的树形结构是操作网页元素的前提。

### DOM节点类型

DOM中的不同节点类型及其特征：

```javascript
/**
 * DOM节点类型示例
 */
const DOMNodeTypesExamples = {
    /**
     * 节点类型常量
     */
    nodeTypes() {
        console.log('=== DOM节点类型常量 ===');
        
        // 主要的节点类型常量
        const nodeTypes = {
            ELEMENT_NODE: 1,              // 元素节点 <div>, <p> 等
            ATTRIBUTE_NODE: 2,            // 属性节点（已废弃）
            TEXT_NODE: 3,                 // 文本节点
            CDATA_SECTION_NODE: 4,        // CDATA节点
            ENTITY_REFERENCE_NODE: 5,     // 实体引用节点（已废弃）
            ENTITY_NODE: 6,               // 实体节点（已废弃）
            PROCESSING_INSTRUCTION_NODE: 7, // 处理指令节点
            COMMENT_NODE: 8,              // 注释节点
            DOCUMENT_NODE: 9,             // 文档节点
            DOCUMENT_TYPE_NODE: 10,       // 文档类型节点
            DOCUMENT_FRAGMENT_NODE: 11,   // 文档片段节点
            NOTATION_NODE: 12             // 符号节点（已废弃）
        };
        
        console.log('DOM节点类型:', nodeTypes);
        
        // 创建示例HTML
        const htmlString = `
            <!DOCTYPE html>
            <html>
                <head>
                    <title>示例</title>
                </head>
                <body>
                    <!-- 这是注释 -->
                    <div id="container">
                        <p>段落文本</p>
                    </div>
                </body>
            </html>
        `;
        
        // 如果在浏览器环境中
        if (typeof document !== 'undefined') {
            console.log('当前文档的节点类型:');
            console.log('document.nodeType:', document.nodeType); // 9 (DOCUMENT_NODE)
            console.log('document.doctype.nodeType:', document.doctype?.nodeType); // 10 (DOCUMENT_TYPE_NODE)
            
            // 获取body元素
            const body = document.body;
            if (body) {
                console.log('body.nodeType:', body.nodeType); // 1 (ELEMENT_NODE)
                console.log('body.nodeName:', body.nodeName); // "BODY"
                console.log('body.tagName:', body.tagName); // "BODY"
                
                // 如果body有子节点
                if (body.firstChild) {
                    console.log('body第一个子节点类型:', body.firstChild.nodeType);
                    console.log('body第一个子节点值:', body.firstChild.nodeValue);
                }
            }
        } else {
            console.log('非浏览器环境，无法访问document对象');
        }
    },
    
    /**
     * 节点属性和方法
     */
    nodePropertiesAndMethods() {
        console.log('=== 节点属性和方法 ===');
        
        // 模拟节点对象的主要属性
        const nodeProperties = {
            // 基本属性
            nodeType: '节点类型（数字）',
            nodeName: '节点名称',
            nodeValue: '节点值',
            
            // 层级关系
            parentNode: '父节点',
            childNodes: '子节点列表（NodeList）',
            firstChild: '第一个子节点',
            lastChild: '最后一个子节点',
            nextSibling: '下一个兄弟节点',
            previousSibling: '上一个兄弟节点',
            
            // 元素特有属性
            tagName: '标签名（仅元素节点）',
            id: 'ID属性',
            className: 'class属性',
            attributes: '属性集合',
            
            // 文档相关
            ownerDocument: '所属文档',
            
            // 内容相关
            textContent: '文本内容',
            innerHTML: 'HTML内容（仅元素节点）',
            outerHTML: '包含自身的HTML（仅元素节点）'
        };
        
        console.log('节点的主要属性:', nodeProperties);
        
        // 在浏览器环境中演示
        if (typeof document !== 'undefined') {
            // 创建一个测试元素
            const testDiv = document.createElement('div');
            testDiv.id = 'test';
            testDiv.className = 'example';
            testDiv.innerHTML = '测试内容';
            
            console.log('创建的测试元素:');
            console.log('nodeType:', testDiv.nodeType);
            console.log('nodeName:', testDiv.nodeName);
            console.log('tagName:', testDiv.tagName);
            console.log('id:', testDiv.id);
            console.log('className:', testDiv.className);
            console.log('textContent:', testDiv.textContent);
            console.log('innerHTML:', testDiv.innerHTML);
            
            // 添加子节点
            const textNode = document.createTextNode(' 附加文本');
            testDiv.appendChild(textNode);
            
            console.log('添加文本节点后:');
            console.log('childNodes.length:', testDiv.childNodes.length);
            console.log('firstChild.nodeType:', testDiv.firstChild?.nodeType);
            console.log('lastChild.nodeType:', testDiv.lastChild?.nodeType);
        }
    },
    
    /**
     * DOM树遍历
     */
    treeTraversal() {
        console.log('=== DOM树遍历 ===');
        
        // 递归遍历DOM树的函数
        function traverseDOM(node, depth = 0) {
            if (!node) return;
            
            const indent = '  '.repeat(depth);
            const nodeInfo = `${indent}${node.nodeName}`;
            
            if (node.nodeType === Node.ELEMENT_NODE) {
                const attributes = Array.from(node.attributes || [])
                    .map(attr => `${attr.name}="${attr.value}"`)
                    .join(' ');
                console.log(`${nodeInfo}${attributes ? ` [${attributes}]` : ''}`);
            } else if (node.nodeType === Node.TEXT_NODE) {
                const text = node.nodeValue.trim();
                if (text) {
                    console.log(`${nodeInfo}: "${text}"`);
                }
            } else if (node.nodeType === Node.COMMENT_NODE) {
                console.log(`${nodeInfo}: <!-- ${node.nodeValue} -->`);
            }
            
            // 遍历子节点
            for (let child of node.childNodes || []) {
                traverseDOM(child, depth + 1);
            }
        }
        
        // 非递归遍历（使用栈）
        function traverseDOMIterative(rootNode) {
            if (!rootNode) return;
            
            const stack = [{node: rootNode, depth: 0}];
            
            while (stack.length > 0) {
                const {node, depth} = stack.pop();
                const indent = '  '.repeat(depth);
                
                console.log(`${indent}${node.nodeName} (${node.nodeType})`);
                
                // 将子节点逆序入栈，以保持正确的遍历顺序
                const children = Array.from(node.childNodes || []);
                for (let i = children.length - 1; i >= 0; i--) {
                    stack.push({node: children[i], depth: depth + 1});
                }
            }
        }
        
        if (typeof document !== 'undefined') {
            console.log('递归遍历document.head:');
            traverseDOM(document.head);
            
            console.log('\n非递归遍历document.head:');
            traverseDOMIterative(document.head);
        } else {
            console.log('遍历函数已定义，需在浏览器环境中使用');
        }
    }
};

DOMNodeTypesExamples.nodeTypes();
DOMNodeTypesExamples.nodePropertiesAndMethods();
DOMNodeTypesExamples.treeTraversal();
```

### 文档结构分析

深入理解HTML文档的DOM表示：

```javascript
/**
 * 文档结构分析示例
 */
const DocumentStructureExamples = {
    /**
     * 文档对象模型层次
     */
    documentHierarchy() {
        console.log('=== 文档对象模型层次 ===');
        
        // 文档层次结构
        const documentStructure = {
            window: {
                description: '全局对象，浏览器窗口',
                children: {
                    document: {
                        description: '文档对象，DOM的入口',
                        properties: ['documentElement', 'head', 'body', 'title'],
                        methods: ['getElementById', 'createElement', 'querySelector']
                    },
                    location: '地址对象',
                    history: '历史对象',
                    navigator: '浏览器信息对象'
                }
            }
        };
        
        console.log('浏览器对象模型结构:', JSON.stringify(documentStructure, null, 2));
        
        if (typeof document !== 'undefined') {
            console.log('当前文档信息:');
            console.log('document.nodeType:', document.nodeType);
            console.log('document.nodeName:', document.nodeName);
            console.log('document.documentElement.tagName:', document.documentElement?.tagName);
            console.log('document.title:', document.title);
            console.log('document.URL:', document.URL);
            console.log('document.domain:', document.domain);
            console.log('document.characterSet:', document.characterSet);
            console.log('document.readyState:', document.readyState);
        }
    },
    
    /**
     * HTML5语义化结构
     */
    html5Structure() {
        console.log('=== HTML5语义化结构 ===');
        
        // HTML5语义化元素
        const html5Elements = {
            structure: [
                'header', 'nav', 'main', 'section', 'article', 
                'aside', 'footer', 'figure', 'figcaption'
            ],
            content: [
                'h1-h6', 'p', 'blockquote', 'ul', 'ol', 'li',
                'dl', 'dt', 'dd', 'pre', 'code'
            ],
            inline: [
                'a', 'span', 'strong', 'em', 'mark', 'small',
                'time', 'abbr', 'cite'
            ],
            media: [
                'img', 'video', 'audio', 'canvas', 'svg'
            ],
            form: [
                'form', 'input', 'textarea', 'select', 'option',
                'button', 'label', 'fieldset', 'legend'
            ]
        };
        
        console.log('HTML5语义化元素分类:', html5Elements);
        
        // 创建语义化结构示例
        if (typeof document !== 'undefined') {
            function createSemanticStructure() {
                const fragment = document.createDocumentFragment();
                
                // 创建文章结构
                const article = document.createElement('article');
                article.className = 'blog-post';
                
                const header = document.createElement('header');
                const title = document.createElement('h1');
                title.textContent = '文章标题';
                const time = document.createElement('time');
                time.dateTime = '2023-12-01';
                time.textContent = '2023年12月1日';
                
                header.appendChild(title);
                header.appendChild(time);
                
                const main = document.createElement('main');
                const section = document.createElement('section');
                const paragraph = document.createElement('p');
                paragraph.textContent = '这是文章的主要内容...';
                
                section.appendChild(paragraph);
                main.appendChild(section);
                
                const footer = document.createElement('footer');
                const author = document.createElement('address');
                author.textContent = '作者：张三';
                footer.appendChild(author);
                
                article.appendChild(header);
                article.appendChild(main);
                article.appendChild(footer);
                
                fragment.appendChild(article);
                
                return fragment;
            }
            
            const semanticStructure = createSemanticStructure();
            console.log('创建的语义化结构:', semanticStructure);
            
            // 分析结构
            function analyzeStructure(element, level = 0) {
                const indent = '  '.repeat(level);
                const info = `${indent}<${element.tagName.toLowerCase()}>`;
                
                if (element.className) {
                    console.log(`${info} class="${element.className}"`);
                } else {
                    console.log(info);
                }
                
                // 遍历子元素
                for (let child of element.children) {
                    analyzeStructure(child, level + 1);
                }
            }
            
            console.log('语义化结构分析:');
            analyzeStructure(semanticStructure.firstElementChild);
        }
    },
    
    /**
     * 文档状态和生命周期
     */
    documentLifecycle() {
        console.log('=== 文档状态和生命周期 ===');
        
        const readyStates = {
            'loading': '文档正在加载',
            'interactive': 'DOM加载完成，但资源可能还在加载',
            'complete': '文档和所有资源都已加载完成'
        };
        
        console.log('文档就绪状态:', readyStates);
        
        if (typeof document !== 'undefined') {
            console.log('当前文档状态:', document.readyState);
            
            // 监听文档状态变化
            function setupDocumentStateListeners() {
                document.addEventListener('readystatechange', () => {
                    console.log('文档状态变化:', document.readyState);
                });
                
                // DOMContentLoaded: DOM构建完成
                document.addEventListener('DOMContentLoaded', () => {
                    console.log('DOM内容加载完成');
                });
                
                // load: 所有资源加载完成
                window.addEventListener('load', () => {
                    console.log('页面完全加载完成');
                });
                
                // beforeunload: 页面即将卸载
                window.addEventListener('beforeunload', (e) => {
                    console.log('页面即将卸载');
                    // e.returnValue = '确定要离开吗？'; // 显示确认对话框
                });
                
                // unload: 页面卸载
                window.addEventListener('unload', () => {
                    console.log('页面已卸载');
                });
            }
            
            // 如果DOM还未加载完成，设置监听器
            if (document.readyState === 'loading') {
                setupDocumentStateListeners();
            } else {
                console.log('DOM已加载完成，直接执行相关代码');
            }
        }
        
        // 跨浏览器的DOM就绪检测
        function domReady(callback) {
            if (typeof document === 'undefined') {
                console.log('非浏览器环境');
                return;
            }
            
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', callback);
            } else {
                // DOM已经就绪，立即执行
                setTimeout(callback, 0);
            }
        }
        
        // 使用示例
        domReady(() => {
            console.log('DOM就绪，可以安全地操作DOM元素');
        });
    }
};

DocumentStructureExamples.documentHierarchy();
DocumentStructureExamples.html5Structure();
DocumentStructureExamples.documentLifecycle();
```

---

## 12.2 获取、创建、删除元素

DOM元素的基础操作是网页动态交互的基础。

### 元素获取方法

掌握各种元素选择和获取技巧：

```javascript
/**
 * 元素获取方法示例
 */
const ElementSelectionExamples = {
    /**
     * 基础选择器方法
     */
    basicSelectors() {
        console.log('=== 基础选择器方法 ===');
        
        if (typeof document === 'undefined') {
            console.log('需要在浏览器环境中运行');
            return;
        }
        
        // 1. 通过ID获取元素
        const elementById = document.getElementById('myElement');
        console.log('getElementById:', elementById);
        
        // 2. 通过类名获取元素集合
        const elementsByClassName = document.getElementsByClassName('myClass');
        console.log('getElementsByClassName:', elementsByClassName.length);
        
        // 3. 通过标签名获取元素集合
        const elementsByTagName = document.getElementsByTagName('div');
        console.log('getElementsByTagName:', elementsByTagName.length);
        
        // 4. 通过name属性获取元素集合
        const elementsByName = document.getElementsByName('inputName');
        console.log('getElementsByName:', elementsByName.length);
        
        // 5. 现代选择器方法
        const querySelector = document.querySelector('.myClass');
        const querySelectorAll = document.querySelectorAll('div.myClass');
        
        console.log('querySelector:', querySelector);
        console.log('querySelectorAll:', querySelectorAll.length);
        
        // HTMLCollection vs NodeList的区别
        console.log('HTMLCollection特点:');
        console.log('- 动态集合，DOM变化时自动更新');
        console.log('- 只包含元素节点');
        console.log('- 有namedItem()方法');
        
        console.log('NodeList特点:');
        console.log('- 静态集合（querySelectorAll）或动态集合（childNodes）');
        console.log('- 可包含所有类型节点');
        console.log('- 有forEach()方法（现代浏览器）');
    },
    
    /**
     * 高级选择器
     */
    advancedSelectors() {
        console.log('=== 高级选择器 ===');
        
        if (typeof document === 'undefined') return;
        
        // CSS选择器示例
        const selectorExamples = {
            // 基础选择器
            'div': '标签选择器',
            '.class': '类选择器',
            '#id': 'ID选择器',
            '*': '通用选择器',
            
            // 组合选择器
            'div.class': '元素+类',
            'div#id': '元素+ID',
            '.class1.class2': '多类选择器',
            
            // 层级选择器
            'div p': '后代选择器',
            'div > p': '子元素选择器',
            'div + p': '相邻兄弟选择器',
            'div ~ p': '通用兄弟选择器',
            
            // 属性选择器
            '[attr]': '具有属性',
            '[attr="value"]': '属性等于值',
            '[attr^="value"]': '属性以值开始',
            '[attr$="value"]': '属性以值结束',
            '[attr*="value"]': '属性包含值',
            
            // 伪类选择器
            ':first-child': '第一个子元素',
            ':last-child': '最后一个子元素',
            ':nth-child(n)': '第n个子元素',
            ':not(selector)': '排除选择器',
            ':hover': '鼠标悬停',
            ':focus': '获得焦点',
            
            // 伪元素选择器
            '::before': '元素前插入内容',
            '::after': '元素后插入内容',
            '::first-line': '第一行',
            '::first-letter': '第一个字母'
        };
        
        console.log('CSS选择器参考:', selectorExamples);
        
        // 实际使用示例
        try {
            const examples = [
                'article > h1',
                '.container .item:nth-child(odd)',
                'input[type="email"]',
                'a:not([href^="http"])',
                '.menu li:first-child',
                'div[data-role="button"]'
            ];
            
            examples.forEach(selector => {
                const elements = document.querySelectorAll(selector);
                console.log(`"${selector}" 匹配到 ${elements.length} 个元素`);
            });
        } catch (e) {
            console.log('选择器执行需要相应的HTML结构');
        }
    },
    
    /**
     * 元素检测和过滤
     */
    elementTesting() {
        console.log('=== 元素检测和过滤 ===');
        
        if (typeof document === 'undefined') return;
        
        // 创建测试元素
        const testDiv = document.createElement('div');
        testDiv.id = 'test';
        testDiv.className = 'container active';
        testDiv.setAttribute('data-role', 'panel');
        
        // 元素匹配检测
        console.log('元素匹配检测:');
        console.log('matches(".container"):', testDiv.matches('.container'));
        console.log('matches("#test"):', testDiv.matches('#test'));
        console.log('matches("[data-role]"):', testDiv.matches('[data-role]'));
        console.log('matches(".active.container"):', testDiv.matches('.active.container'));
        
        // 最近祖先匹配
        document.body.appendChild(testDiv);
        const closestResult = testDiv.closest('body');
        console.log('closest("body"):', closestResult === document.body);
        
        // 元素包含关系
        const childDiv = document.createElement('div');
        testDiv.appendChild(childDiv);
        
        console.log('contains检测:');
        console.log('testDiv.contains(childDiv):', testDiv.contains(childDiv));
        console.log('body.contains(testDiv):', document.body.contains(testDiv));
        
        // 清理
        document.body.removeChild(testDiv);
        
        // 工具函数：安全获取元素
        function safeQuerySelector(selector) {
            try {
                return document.querySelector(selector);
            } catch (e) {
                console.error('无效的选择器:', selector);
                return null;
            }
        }
        
        function safeQuerySelectorAll(selector) {
            try {
                return Array.from(document.querySelectorAll(selector));
            } catch (e) {
                console.error('无效的选择器:', selector);
                return [];
            }
        }
        
        console.log('安全选择器函数已定义');
    }
};

ElementSelectionExamples.basicSelectors();
ElementSelectionExamples.advancedSelectors();
ElementSelectionExamples.elementTesting();
```

### 元素创建技巧

多种元素创建和构建方式：

```javascript
/**
 * 元素创建示例
 */
const ElementCreationExamples = {
    /**
     * 基础创建方法
     */
    basicCreation() {
        console.log('=== 基础元素创建 ===');
        
        if (typeof document === 'undefined') return;
        
        // 1. createElement创建元素
        const div = document.createElement('div');
        div.id = 'myDiv';
        div.className = 'container';
        div.textContent = '这是一个div元素';
        
        // 2. createTextNode创建文本节点
        const textNode = document.createTextNode('纯文本内容');
        
        // 3. createComment创建注释节点
        const comment = document.createComment('这是注释');
        
        // 4. createDocumentFragment创建文档片段
        const fragment = document.createDocumentFragment();
        
        console.log('创建的元素:', div);
        console.log('创建的文本节点:', textNode);
        console.log('创建的注释节点:', comment);
        console.log('创建的文档片段:', fragment);
        
        // 将元素添加到文档片段
        fragment.appendChild(div);
        fragment.appendChild(textNode);
        fragment.appendChild(comment);
        
        console.log('文档片段子节点数:', fragment.childNodes.length);
    },
    
    /**
     * 高级创建技巧
     */
    advancedCreation() {
        console.log('=== 高级创建技巧 ===');
        
        if (typeof document === 'undefined') return;
        
        // 1. 克隆节点
        const originalDiv = document.createElement('div');
        originalDiv.innerHTML = '<p>原始内容</p>';
        originalDiv.className = 'original';
        
        // 浅克隆（不包含子节点）
        const shallowClone = originalDiv.cloneNode(false);
        // 深克隆（包含子节点）
        const deepClone = originalDiv.cloneNode(true);
        
        console.log('原始元素子节点:', originalDiv.childNodes.length);
        console.log('浅克隆子节点:', shallowClone.childNodes.length);
        console.log('深克隆子节点:', deepClone.childNodes.length);
        
        // 2. 使用innerHTML创建复杂结构
        const container = document.createElement('div');
        container.innerHTML = `
            <header class="header">
                <h1>标题</h1>
                <nav>
                    <ul>
                        <li><a href="#home">首页</a></li>
                        <li><a href="#about">关于</a></li>
                    </ul>
                </nav>
            </header>
        `;
        
        console.log('通过innerHTML创建的结构:', container.children.length);
        
        // 3. 使用模板字符串构建元素
        function createElement(tag, attributes = {}, ...children) {
            const element = document.createElement(tag);
            
            // 设置属性
            Object.entries(attributes).forEach(([key, value]) => {
                if (key === 'className') {
                    element.className = value;
                } else if (key === 'textContent') {
                    element.textContent = value;
                } else {
                    element.setAttribute(key, value);
                }
            });
            
            // 添加子元素
            children.forEach(child => {
                if (typeof child === 'string') {
                    element.appendChild(document.createTextNode(child));
                } else if (child instanceof Node) {
                    element.appendChild(child);
                }
            });
            
            return element;
        }
        
        // 使用构建器函数
        const card = createElement('div', 
            { className: 'card', 'data-id': '123' },
            createElement('h2', {}, '卡片标题'),
            createElement('p', {}, '卡片内容描述'),
            createElement('button', { className: 'btn' }, '点击按钮')
        );
        
        console.log('构建器创建的卡片:', card);
        
        // 4. 模板元素的使用
        if ('content' in document.createElement('template')) {
            const template = document.createElement('template');
            template.innerHTML = `
                <div class="item">
                    <img src="" alt="图片">
                    <h3></h3>
                    <p></p>
                </div>
            `;
            
            // 使用模板创建实例
            function createItemFromTemplate(data) {
                const clone = template.content.cloneNode(true);
                const item = clone.querySelector('.item');
                const img = clone.querySelector('img');
                const title = clone.querySelector('h3');
                const desc = clone.querySelector('p');
                
                img.src = data.image;
                img.alt = data.title;
                title.textContent = data.title;
                desc.textContent = data.description;
                
                return item;
            }
            
            const itemData = {
                image: 'example.jpg',
                title: '示例标题',
                description: '示例描述'
            };
            
            const item = createItemFromTemplate(itemData);
            console.log('模板创建的元素:', item);
        }
    },
    
    /**
     * 性能优化的批量创建
     */
    batchCreation() {
        console.log('=== 批量创建优化 ===');
        
        if (typeof document === 'undefined') return;
        
        // 使用DocumentFragment优化批量插入
        function createListOptimized(items) {
            const fragment = document.createDocumentFragment();
            const ul = document.createElement('ul');
            
            items.forEach(item => {
                const li = document.createElement('li');
                li.textContent = item;
                ul.appendChild(li);
            });
            
            fragment.appendChild(ul);
            return fragment;
        }
        
        // 测试数据
        const items = Array.from({length: 1000}, (_, i) => `项目 ${i + 1}`);
        
        // 性能测试
        console.time('批量创建1000个元素');
        const list = createListOptimized(items);
        console.timeEnd('批量创建1000个元素');
        
        console.log('创建的列表元素数:', list.querySelector('ul').children.length);
        
        // 使用innerHTML的批量创建（更快但需注意安全性）
        function createListWithInnerHTML(items) {
            const ul = document.createElement('ul');
            ul.innerHTML = items.map(item => `<li>${item}</li>`).join('');
            return ul;
        }
        
        console.time('innerHTML批量创建');
        const listHTML = createListWithInnerHTML(items);
        console.timeEnd('innerHTML批量创建');
        
        console.log('innerHTML创建的元素数:', listHTML.children.length);
    }
};

ElementCreationExamples.basicCreation();
ElementCreationExamples.advancedCreation();
ElementCreationExamples.batchCreation();
```

## 12.3 修改属性、样式、文本

操作元素的内容和外观是DOM操作的核心功能。

### 属性操作

元素属性的获取和设置方法：

```javascript
/**
 * 属性操作示例
 */
const AttributeOperationExamples = {
    /**
     * 基础属性操作
     */
    basicAttributes() {
        console.log('=== 基础属性操作 ===');
        
        if (typeof document === 'undefined') return;
        
        // 创建测试元素
        const div = document.createElement('div');
        
        // 1. setAttribute/getAttribute - 标准方法
        div.setAttribute('id', 'myDiv');
        div.setAttribute('class', 'container');
        div.setAttribute('data-role', 'panel');
        div.setAttribute('aria-label', '面板容器');
        
        console.log('getAttribute("id"):', div.getAttribute('id'));
        console.log('getAttribute("class"):', div.getAttribute('class'));
        console.log('getAttribute("data-role"):', div.getAttribute('data-role'));
        
        // 2. 直接属性访问
        console.log('div.id:', div.id);
        console.log('div.className:', div.className);
        
        // 3. hasAttribute/removeAttribute
        console.log('hasAttribute("data-role"):', div.hasAttribute('data-role'));
        div.removeAttribute('data-role');
        console.log('移除后 hasAttribute("data-role"):', div.hasAttribute('data-role'));
        
        // 4. 获取所有属性
        div.setAttribute('title', '提示文本');
        div.setAttribute('tabindex', '0');
        
        console.log('所有属性:');
        Array.from(div.attributes).forEach(attr => {
            console.log(`  ${attr.name} = "${attr.value}"`);
        });
    },
    
    /**
     * 特殊属性处理
     */
    specialAttributes() {
        console.log('=== 特殊属性处理 ===');
        
        if (typeof document === 'undefined') return;
        
        // 布尔属性
        const input = document.createElement('input');
        input.type = 'checkbox';
        
        // 布尔属性的设置
        input.checked = true;
        input.disabled = false;
        input.setAttribute('required', ''); // 布尔属性值为空字符串
        
        console.log('布尔属性:');
        console.log('checked:', input.checked);
        console.log('disabled:', input.disabled);
        console.log('required:', input.hasAttribute('required'));
        
        // 数据属性 (data-*)
        const dataDiv = document.createElement('div');
        dataDiv.dataset.userId = '123';
        dataDiv.dataset.userName = 'Alice';
        dataDiv.dataset.isActive = 'true';
        
        console.log('数据属性:');
        console.log('dataset.userId:', dataDiv.dataset.userId);
        console.log('dataset.userName:', dataDiv.dataset.userName);
        console.log('通过getAttribute:', dataDiv.getAttribute('data-user-id'));
        
        // 遍历所有数据属性
        Object.keys(dataDiv.dataset).forEach(key => {
            console.log(`  data-${key}: ${dataDiv.dataset[key]}`);
        });
        
        // 表单特殊属性
        const form = document.createElement('form');
        const textInput = document.createElement('input');
        textInput.type = 'text';
        textInput.name = 'username';
        textInput.value = '默认值';
        textInput.placeholder = '请输入用户名';
        textInput.maxLength = 20;
        
        console.log('表单属性:');
        console.log('name:', textInput.name);
        console.log('value:', textInput.value);
        console.log('placeholder:', textInput.placeholder);
        console.log('maxLength:', textInput.maxLength);
    },
    
    /**
     * 属性同步和验证
     */
    attributeSync() {
        console.log('=== 属性同步和验证 ===');
        
        if (typeof document === 'undefined') return;
        
        // 属性和property的差异
        const input = document.createElement('input');
        input.setAttribute('value', '初始值');
        input.value = '用户输入值';
        
        console.log('属性vs属性值:');
        console.log('getAttribute("value"):', input.getAttribute('value')); // 初始值
        console.log('input.value:', input.value); // 用户输入值
        console.log('input.defaultValue:', input.defaultValue); // 初始值
        
        // 安全的属性操作函数
        function safeSetAttribute(element, name, value) {
            try {
                if (value === null || value === undefined) {
                    element.removeAttribute(name);
                } else {
                    element.setAttribute(name, String(value));
                }
            } catch (e) {
                console.error(`设置属性失败 ${name}:`, e.message);
            }
        }
        
        function safeGetAttribute(element, name, defaultValue = null) {
            try {
                return element.getAttribute(name) || defaultValue;
            } catch (e) {
                console.error(`获取属性失败 ${name}:`, e.message);
                return defaultValue;
            }
        }
        
        // 批量属性操作
        function setAttributes(element, attributes) {
            Object.entries(attributes).forEach(([name, value]) => {
                safeSetAttribute(element, name, value);
            });
        }
        
        const testDiv = document.createElement('div');
        setAttributes(testDiv, {
            id: 'batch-test',
            class: 'test-class',
            'data-id': '123',
            title: '批量设置的属性'
        });
        
        console.log('批量设置后的属性数量:', testDiv.attributes.length);
    }
};

AttributeOperationExamples.basicAttributes();
AttributeOperationExamples.specialAttributes();
AttributeOperationExamples.attributeSync();
```

### 样式控制

CSS样式的动态操作：

```javascript
/**
 * 样式控制示例
 */
const StyleControlExamples = {
    /**
     * 内联样式操作
     */
    inlineStyles() {
        console.log('=== 内联样式操作 ===');
        
        if (typeof document === 'undefined') return;
        
        const div = document.createElement('div');
        
        // 1. 直接设置style属性
        div.style.width = '200px';
        div.style.height = '100px';
        div.style.backgroundColor = 'lightblue';
        div.style.border = '2px solid blue';
        div.style.borderRadius = '8px';
        div.style.padding = '10px';
        div.style.margin = '5px';
        
        console.log('设置的样式:');
        console.log('width:', div.style.width);
        console.log('backgroundColor:', div.style.backgroundColor);
        console.log('border:', div.style.border);
        
        // 2. CSS属性名转换（kebab-case vs camelCase）
        const cssProperties = {
            'background-color': 'backgroundColor',
            'font-size': 'fontSize',
            'border-radius': 'borderRadius',
            'text-align': 'textAlign',
            'z-index': 'zIndex'
        };
        
        console.log('CSS属性名对应关系:', cssProperties);
        
        // 3. 批量设置样式
        function setStyles(element, styles) {
            Object.entries(styles).forEach(([property, value]) => {
                element.style[property] = value;
            });
        }
        
        setStyles(div, {
            fontSize: '16px',
            color: 'darkblue',
            textAlign: 'center',
            cursor: 'pointer'
        });
        
        // 4. 获取计算后的样式
        document.body.appendChild(div);
        const computedStyle = window.getComputedStyle(div);
        
        console.log('计算后的样式:');
        console.log('实际width:', computedStyle.width);
        console.log('实际fontSize:', computedStyle.fontSize);
        console.log('实际color:', computedStyle.color);
        
        document.body.removeChild(div);
    },
    
    /**
     * CSS类操作
     */
    cssClasses() {
        console.log('=== CSS类操作 ===');
        
        if (typeof document === 'undefined') return;
        
        const div = document.createElement('div');
        div.className = 'initial-class';
        
        // 1. classList API
        console.log('初始类名:', div.className);
        
        div.classList.add('new-class');
        div.classList.add('another-class');
        console.log('添加后:', div.className);
        
        div.classList.remove('initial-class');
        console.log('移除后:', div.className);
        
        div.classList.toggle('active');
        console.log('切换active后:', div.className);
        
        div.classList.toggle('active');
        console.log('再次切换active后:', div.className);
        
        // 2. 条件类操作
        div.classList.toggle('visible', true); // 强制添加
        div.classList.toggle('hidden', false); // 强制移除
        
        console.log('条件切换后:', div.className);
        
        // 3. 检查类存在
        console.log('包含new-class:', div.classList.contains('new-class'));
        console.log('包含nonexistent:', div.classList.contains('nonexistent'));
        
        // 4. 批量类操作
        function addClasses(element, ...classes) {
            element.classList.add(...classes);
        }
        
        function removeClasses(element, ...classes) {
            element.classList.remove(...classes);
        }
        
        addClasses(div, 'class1', 'class2', 'class3');
        console.log('批量添加后:', div.className);
        
        removeClasses(div, 'class1', 'class3');
        console.log('批量移除后:', div.className);
        
        // 5. 替换类
        div.classList.replace('class2', 'replaced-class');
        console.log('替换后:', div.className);
    },
    
    /**
     * 高级样式技巧
     */
    advancedStyling() {
        console.log('=== 高级样式技巧 ===');
        
        if (typeof document === 'undefined') return;
        
        // 1. CSS变量操作
        const div = document.createElement('div');
        document.body.appendChild(div);
        
        // 设置CSS变量
        div.style.setProperty('--primary-color', '#007bff');
        div.style.setProperty('--font-size', '18px');
        
        // 使用CSS变量
        div.style.color = 'var(--primary-color)';
        div.style.fontSize = 'var(--font-size)';
        
        console.log('CSS变量值:');
        console.log('--primary-color:', div.style.getPropertyValue('--primary-color'));
        console.log('--font-size:', div.style.getPropertyValue('--font-size'));
        
        // 2. 样式优先级处理
        div.style.setProperty('color', 'red', 'important');
        console.log('重要样式:', div.style.getPropertyPriority('color'));
        
        // 3. 样式动画
        function animateElement(element, fromStyles, toStyles, duration = 1000) {
            const startTime = Date.now();
            
            function animate() {
                const elapsed = Date.now() - startTime;
                const progress = Math.min(elapsed / duration, 1);
                
                // 简单的数值动画
                Object.keys(toStyles).forEach(prop => {
                    if (typeof fromStyles[prop] === 'number' && typeof toStyles[prop] === 'number') {
                        const value = fromStyles[prop] + (toStyles[prop] - fromStyles[prop]) * progress;
                        element.style[prop] = value + 'px';
                    }
                });
                
                if (progress < 1) {
                    requestAnimationFrame(animate);
                }
            }
            
            animate();
        }
        
        // 4. 响应式样式
        function applyResponsiveStyles(element) {
            const width = window.innerWidth;
            
            if (width < 768) {
                element.classList.add('mobile');
                element.classList.remove('desktop', 'tablet');
            } else if (width < 1024) {
                element.classList.add('tablet');
                element.classList.remove('mobile', 'desktop');
            } else {
                element.classList.add('desktop');
                element.classList.remove('mobile', 'tablet');
            }
        }
        
        console.log('高级样式功能已定义');
        document.body.removeChild(div);
    }
};

StyleControlExamples.inlineStyles();
StyleControlExamples.cssClasses();
StyleControlExamples.advancedStyling();
```

### 文本内容管理

操作元素的文本内容：

```javascript
/**
 * 文本内容管理示例
 */
const TextContentExamples = {
    /**
     * 文本内容操作
     */
    textOperations() {
        console.log('=== 文本内容操作 ===');
        
        if (typeof document === 'undefined') return;
        
        const div = document.createElement('div');
        
        // 1. textContent vs innerText vs innerHTML
        div.innerHTML = '<p>段落内容</p><span style="display:none;">隐藏文本</span>';
        document.body.appendChild(div);
        
        console.log('innerHTML:', div.innerHTML);
        console.log('textContent:', div.textContent); // 包含隐藏文本
        console.log('innerText:', div.innerText); // 不包含隐藏文本
        
        // 2. 安全的文本设置
        function safeSetText(element, text) {
            element.textContent = text; // 自动转义HTML
        }
        
        function safeSetHTML(element, html) {
            // 简单的HTML清理（实际项目中应使用专业库）
            const cleaned = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
            element.innerHTML = cleaned;
        }
        
        const testDiv = document.createElement('div');
        safeSetText(testDiv, '<script>alert("XSS")</script>普通文本');
        console.log('安全文本设置:', testDiv.textContent);
        
        document.body.removeChild(div);
    },
    
    /**
     * 文本处理工具
     */
    textUtilities() {
        console.log('=== 文本处理工具 ===');
        
        if (typeof document === 'undefined') return;
        
        // 文本截断
        function truncateText(text, maxLength, suffix = '...') {
            if (text.length <= maxLength) return text;
            return text.slice(0, maxLength - suffix.length) + suffix;
        }
        
        // 应用到元素
        function applyTruncation(element, maxLength) {
            const originalText = element.textContent;
            const truncated = truncateText(originalText, maxLength);
            element.textContent = truncated;
            element.title = originalText; // 完整文本作为提示
        }
        
        // 高亮文本
        function highlightText(element, searchTerm, className = 'highlight') {
            const text = element.textContent;
            const regex = new RegExp(`(${searchTerm})`, 'gi');
            const highlightedHTML = text.replace(regex, `<span class="${className}">$1</span>`);
            element.innerHTML = highlightedHTML;
        }
        
        console.log('文本工具函数已定义');
    }
};

TextContentExamples.textOperations();
TextContentExamples.textUtilities();
```

---

## 12.4 节点关系与遍历

理解和操作DOM节点之间的关系。

### 节点关系属性

DOM节点的层级关系：

```javascript
/**
 * 节点关系示例
 */
const NodeRelationshipExamples = {
    /**
     * 基础节点关系
     */
    basicRelationships() {
        console.log('=== 基础节点关系 ===');
        
        if (typeof document === 'undefined') return;
        
        // 创建测试结构
        const container = document.createElement('div');
        container.innerHTML = `
            <header>
                <h1>标题</h1>
                <nav>导航</nav>
            </header>
            <main>
                <article>文章内容</article>
                <aside>侧边栏</aside>
            </main>
            <footer>页脚</footer>
        `;
        
        document.body.appendChild(container);
        
        const header = container.querySelector('header');
        const h1 = container.querySelector('h1');
        const nav = container.querySelector('nav');
        const main = container.querySelector('main');
        
        console.log('节点关系属性:');
        console.log('h1.parentNode === header:', h1.parentNode === header);
        console.log('h1.parentElement === header:', h1.parentElement === header);
        
        console.log('header.childNodes.length:', header.childNodes.length); // 包含文本节点
        console.log('header.children.length:', header.children.length); // 只有元素节点
        
        console.log('header.firstChild.nodeType:', header.firstChild?.nodeType); // 可能是文本节点
        console.log('header.firstElementChild === h1:', header.firstElementChild === h1);
        
        console.log('header.lastChild.nodeType:', header.lastChild?.nodeType);
        console.log('header.lastElementChild === nav:', header.lastElementChild === nav);
        
        console.log('h1.nextSibling.nodeType:', h1.nextSibling?.nodeType); // 可能是文本节点
        console.log('h1.nextElementSibling === nav:', h1.nextElementSibling === nav);
        
        console.log('nav.previousElementSibling === h1:', nav.previousElementSibling === h1);
        
        document.body.removeChild(container);
    },
    
    /**
     * 节点插入和移动
     */
    nodeManipulation() {
        console.log('=== 节点插入和移动 ===');
        
        if (typeof document === 'undefined') return;
        
        const container = document.createElement('div');
        const p1 = document.createElement('p');
        p1.textContent = '第一段';
        const p2 = document.createElement('p');
        p2.textContent = '第二段';
        const p3 = document.createElement('p');
        p3.textContent = '第三段';
        
        // appendChild - 添加到末尾
        container.appendChild(p1);
        container.appendChild(p2);
        
        console.log('appendChild后子元素数:', container.children.length);
        
        // insertBefore - 在指定节点前插入
        container.insertBefore(p3, p2);
        console.log('insertBefore后顺序:', Array.from(container.children).map(el => el.textContent));
        
        // 现代方法：before, after, prepend, append
        if (p1.before) {
            const p0 = document.createElement('p');
            p0.textContent = '第零段';
            p1.before(p0);
            
            const p4 = document.createElement('p');
            p4.textContent = '第四段';
            p3.after(p4);
            
            console.log('现代插入方法后:', Array.from(container.children).map(el => el.textContent));
        }
        
        // replaceChild vs replaceWith
        const newP = document.createElement('p');
        newP.textContent = '替换段落';
        
        if (p2.replaceWith) {
            p2.replaceWith(newP);
        } else {
            container.replaceChild(newP, p2);
        }
        
        console.log('替换后:', Array.from(container.children).map(el => el.textContent));
        
        // removeChild vs remove
        if (newP.remove) {
            newP.remove();
        } else {
            container.removeChild(newP);
        }
        
        console.log('删除后子元素数:', container.children.length);
    }
};

NodeRelationshipExamples.basicRelationships();
NodeRelationshipExamples.nodeManipulation();
```

### 遍历算法

高效的DOM树遍历方法：

```javascript
/**
 * DOM遍历算法示例
 */
const TraversalAlgorithms = {
    /**
     * 深度优先遍历
     */
    depthFirstTraversal() {
        console.log('=== 深度优先遍历 ===');
        
        if (typeof document === 'undefined') return;
        
        // 递归深度优先
        function dfsRecursive(node, callback, level = 0) {
            if (!node) return;
            
            callback(node, level);
            
            for (let child of node.children) {
                dfsRecursive(child, callback, level + 1);
            }
        }
        
        // 迭代深度优先
        function dfsIterative(root, callback) {
            if (!root) return;
            
            const stack = [{node: root, level: 0}];
            
            while (stack.length > 0) {
                const {node, level} = stack.pop();
                callback(node, level);
                
                // 子节点逆序入栈保持正确顺序
                const children = Array.from(node.children);
                for (let i = children.length - 1; i >= 0; i--) {
                    stack.push({node: children[i], level: level + 1});
                }
            }
        }
        
        // 测试遍历
        if (document.body.children.length > 0) {
            console.log('递归深度优先遍历:');
            dfsRecursive(document.body, (node, level) => {
                const indent = '  '.repeat(level);
                console.log(`${indent}${node.tagName}`);
            });
        }
    },
    
    /**
     * 广度优先遍历
     */
    breadthFirstTraversal() {
        console.log('=== 广度优先遍历 ===');
        
        if (typeof document === 'undefined') return;
        
        function bfs(root, callback) {
            if (!root) return;
            
            const queue = [{node: root, level: 0}];
            
            while (queue.length > 0) {
                const {node, level} = queue.shift();
                callback(node, level);
                
                for (let child of node.children) {
                    queue.push({node: child, level: level + 1});
                }
            }
        }
        
        // 按层级分组遍历
        function bfsByLevel(root) {
            if (!root) return [];
            
            const levels = [];
            const queue = [{node: root, level: 0}];
            
            while (queue.length > 0) {
                const {node, level} = queue.shift();
                
                if (!levels[level]) {
                    levels[level] = [];
                }
                levels[level].push(node);
                
                for (let child of node.children) {
                    queue.push({node: child, level: level + 1});
                }
            }
            
            return levels;
        }
        
        console.log('广度优先遍历功能已定义');
    },
    
    /**
     * 条件查找遍历
     */
    conditionalTraversal() {
        console.log('=== 条件查找遍历 ===');
        
        if (typeof document === 'undefined') return;
        
        // 查找满足条件的第一个元素
        function findElement(root, predicate) {
            if (!root) return null;
            
            if (predicate(root)) return root;
            
            for (let child of root.children) {
                const result = findElement(child, predicate);
                if (result) return result;
            }
            
            return null;
        }
        
        // 查找所有满足条件的元素
        function findAllElements(root, predicate) {
            const results = [];
            
            function traverse(node) {
                if (!node) return;
                
                if (predicate(node)) {
                    results.push(node);
                }
                
                for (let child of node.children) {
                    traverse(child);
                }
            }
            
            traverse(root);
            return results;
        }
        
        // 查找路径
        function findPath(root, target) {
            function findPathRecursive(node, path) {
                if (!node) return null;
                
                path.push(node);
                
                if (node === target) {
                    return path.slice();
                }
                
                for (let child of node.children) {
                    const result = findPathRecursive(child, path);
                    if (result) return result;
                }
                
                path.pop();
                return null;
            }
            
            return findPathRecursive(root, []);
        }
        
        console.log('条件查找功能已定义');
    }
};

TraversalAlgorithms.depthFirstTraversal();
TraversalAlgorithms.breadthFirstTraversal();
TraversalAlgorithms.conditionalTraversal();
```

---

## 12.5 DOM性能优化

提升DOM操作的性能和效率。

### 性能瓶颈分析

识别和避免常见的性能问题：

```javascript
/**
 * DOM性能优化示例
 */
const DOMPerformanceExamples = {
    /**
     * 重排和重绘优化
     */
    reflowRepaintOptimization() {
        console.log('=== 重排和重绘优化 ===');
        
        if (typeof document === 'undefined') return;
        
        // ❌ 低效：多次触发重排
        function inefficientStyling(element) {
            element.style.width = '200px';    // 重排
            element.style.height = '100px';   // 重排
            element.style.border = '1px solid red'; // 重排
            element.style.padding = '10px';   // 重排
        }
        
        // ✅ 高效：批量样式修改
        function efficientStyling(element) {
            // 方法1：使用cssText
            element.style.cssText = `
                width: 200px;
                height: 100px;
                border: 1px solid red;
                padding: 10px;
            `;
            
            // 方法2：使用CSS类
            element.className = 'optimized-styles';
            
            // 方法3：使用DocumentFragment离线操作
            const fragment = document.createDocumentFragment();
            fragment.appendChild(element);
            // 在fragment中修改不会触发重排
            // 最后一次性插入DOM
        }
        
        // 读写分离优化
        function optimizedBatchOperations(elements) {
            // ❌ 读写混合导致强制重排
            // elements.forEach(el => {
            //     el.style.left = el.offsetLeft + 10 + 'px';
            // });
            
            // ✅ 先读取所有值，再统一写入
            const positions = elements.map(el => el.offsetLeft);
            elements.forEach((el, i) => {
                el.style.left = positions[i] + 10 + 'px';
            });
        }
        
        console.log('重排重绘优化函数已定义');
    },
    
    /**
     * 大量元素处理优化
     */
    bulkOperationOptimization() {
        console.log('=== 大量元素处理优化 ===');
        
        if (typeof document === 'undefined') return;
        
        // 虚拟滚动实现
        function createVirtualList(container, items, itemHeight = 50, visibleCount = 10) {
            let scrollTop = 0;
            let startIndex = 0;
            
            const viewport = document.createElement('div');
            viewport.style.height = `${visibleCount * itemHeight}px`;
            viewport.style.overflow = 'auto';
            
            const content = document.createElement('div');
            content.style.height = `${items.length * itemHeight}px`;
            content.style.position = 'relative';
            
            function renderVisibleItems() {
                content.innerHTML = '';
                
                const endIndex = Math.min(startIndex + visibleCount + 2, items.length);
                
                for (let i = startIndex; i < endIndex; i++) {
                    const item = document.createElement('div');
                    item.style.position = 'absolute';
                    item.style.top = `${i * itemHeight}px`;
                    item.style.height = `${itemHeight}px`;
                    item.textContent = items[i];
                    content.appendChild(item);
                }
            }
            
            viewport.addEventListener('scroll', () => {
                scrollTop = viewport.scrollTop;
                startIndex = Math.floor(scrollTop / itemHeight);
                renderVisibleItems();
            });
            
            viewport.appendChild(content);
            container.appendChild(viewport);
            renderVisibleItems();
        }
        
        // 分片渲染大量数据
        function renderLargeList(container, items, batchSize = 100) {
            let index = 0;
            
            function renderBatch() {
                const fragment = document.createDocumentFragment();
                const endIndex = Math.min(index + batchSize, items.length);
                
                for (let i = index; i < endIndex; i++) {
                    const item = document.createElement('div');
                    item.textContent = items[i];
                    fragment.appendChild(item);
                }
                
                container.appendChild(fragment);
                index = endIndex;
                
                if (index < items.length) {
                    requestAnimationFrame(renderBatch);
                }
            }
            
            renderBatch();
        }
        
        console.log('大量元素优化函数已定义');
    },
    
    /**
     * 事件处理优化
     */
    eventOptimization() {
        console.log('=== 事件处理优化 ===');
        
        if (typeof document === 'undefined') return;
        
        // 防抖函数
        function debounce(func, delay) {
            let timeoutId;
            return function(...args) {
                clearTimeout(timeoutId);
                timeoutId = setTimeout(() => func.apply(this, args), delay);
            };
        }
        
        // 节流函数
        function throttle(func, limit) {
            let inThrottle;
            return function(...args) {
                if (!inThrottle) {
                    func.apply(this, args);
                    inThrottle = true;
                    setTimeout(() => inThrottle = false, limit);
                }
            };
        }
        
        // 优化滚动事件
        const optimizedScrollHandler = throttle((event) => {
            // 处理滚动逻辑
            console.log('处理滚动事件');
        }, 16); // 约60fps
        
        // 优化搜索输入
        const optimizedSearchHandler = debounce((query) => {
            // 执行搜索
            console.log('执行搜索:', query);
        }, 300);
        
        console.log('事件优化函数已定义');
    }
};

DOMPerformanceExamples.reflowRepaintOptimization();
DOMPerformanceExamples.bulkOperationOptimization();
DOMPerformanceExamples.eventOptimization();
```

---

**本章总结**

第12章深入探讨了DOM基础操作的核心知识：

1. **DOM树结构**：
   - 12种DOM节点类型及其特征
   - 文档对象模型的层次结构
   - HTML5语义化元素的正确使用
   - 文档生命周期和状态管理

2. **元素操作基础**：
   - 多种元素获取方法对比
   - 现代CSS选择器的灵活运用
   - 元素创建的最佳实践
   - 性能优化的批量操作技巧

3. **属性和样式控制**：
   - 标准属性操作和特殊属性处理
   - 数据属性和表单属性的管理
   - 内联样式的动态操作
   - CSS类的灵活控制和批量操作

**关键要点**：
- DOM是JavaScript操作网页的核心接口
- 选择合适的元素获取方法能提升性能
- DocumentFragment是批量操作的性能利器
- 理解节点类型有助于准确的DOM操作
- 属性和property有微妙差异需要注意
- classList API提供了强大的类操作功能

**下一章预告**

第13章将学习事件与交互系统，包括事件监听机制、事件冒泡与捕获、事件委托模式、以及各种用户交互事件的处理，构建真正的动态网页交互功能。
