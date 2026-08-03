---
title: "第 24 章：this 全解析"
slug: "js-this-a359b1f0"
summary: "整理 this 的默认绑定、隐式绑定、显式绑定、new 绑定、箭头函数绑定和常见判断规则。"
category: "AI版JS"
categoryPath:
  - "前端技术"
  - "前端三剑客"
  - "AI版JS"
tags: []
status: "published"
sortOrder: 250
cover: ""
originalId: "6a2d291e8a2b1c68f2cac100"
originalSlug: "js-this-a359b1f0"
originalStatus: "published"
publishedAt: "2026-01-25T13:23:07.494Z"
updatedAt: "2026-07-31T11:16:23.488Z"
exportedAt: "2026-08-03T10:17:08.920Z"
---
# 第 24 章：this 全解析

> this是JavaScript中最容易产生困惑的概念之一。理解this的绑定规则对于掌握面向对象编程和函数调用机制至关重要。

---

## 24.1 this的五种绑定方式

### 24.1.1 默认绑定

```javascript
/**
 * 默认绑定：独立函数调用
 */

// 全局环境下的this
console.log(this); // 浏览器中是window，Node.js中是global

function globalFunction() {
    console.log('Global function this:', this);
    return this;
}

// 独立调用，this指向全局对象
globalFunction(); // 非严格模式下指向window/global

/**
 * 严格模式下的默认绑定
 */
'use strict';

function strictFunction() {
    console.log('Strict mode this:', this); // undefined
}

strictFunction(); // 严格模式下this是undefined

/**
 * 嵌套函数的默认绑定
 */
var obj = {
    name: 'Object',
    method: function() {
        console.log('Method this:', this.name); // 'Object'
        
        function inner() {
            console.log('Inner this:', this); // window/global（非严格模式）
        }
        
        inner(); // 独立调用，使用默认绑定
    }
};

obj.method();
```

### 24.1.2 隐式绑定

```javascript
/**
 * 隐式绑定：对象方法调用
 */

var person = {
    name: 'Alice',
    greet: function() {
        console.log('Hello, I am ' + this.name);
    }
};

// 隐式绑定：this指向调用对象
person.greet(); // 'Hello, I am Alice'

/**
 * 调用链中的隐式绑定
 */
var company = {
    name: 'TechCorp',
    department: {
        name: 'Engineering',
        team: {
            name: 'Frontend',
            leader: {
                name: 'Bob',
                introduce: function() {
                    console.log('I am ' + this.name);
                }
            }
        }
    }
};

// this指向最近的调用对象
company.department.team.leader.introduce(); // 'I am Bob'

/**
 * 隐式丢失
 */
var user = {
    name: 'Charlie',
    sayName: function() {
        console.log('My name is ' + this.name);
    }
};

// 隐式绑定
user.sayName(); // 'My name is Charlie'

// 隐式丢失：赋值给变量
var sayName = user.sayName;
sayName(); // 'My name is undefined'（全局调用）

// 隐式丢失：作为参数传递
function callFunction(fn) {
    fn(); // 独立调用
}
callFunction(user.sayName); // 'My name is undefined'

// 隐式丢失：回调函数
setTimeout(user.sayName, 1000); // 'My name is undefined'
```

### 24.1.3 显式绑定

```javascript
/**
 * call方法
 */
function greet() {
    console.log('Hello, ' + this.name);
}

var person1 = { name: 'David' };
var person2 = { name: 'Emma' };

greet.call(person1); // 'Hello, David'
greet.call(person2); // 'Hello, Emma'

// 传递参数
function introduce(age, city) {
    console.log(`I am ${this.name}, ${age} years old, from ${city}`);
}

introduce.call(person1, 25, 'New York'); // 'I am David, 25 years old, from New York'

/**
 * apply方法
 */
introduce.apply(person2, [28, 'London']); // 'I am Emma, 28 years old, from London'

// apply与数组操作
var numbers = [1, 2, 3, 4, 5];
var max = Math.max.apply(null, numbers); // 等价于Math.max(1,2,3,4,5)
console.log('Max number:', max); // 5

/**
 * bind方法
 */
var boundGreet = greet.bind(person1);
boundGreet(); // 'Hello, David'

// bind创建新函数，原函数不受影响
var boundIntroduce = introduce.bind(person2, 30);
boundIntroduce('Paris'); // 'I am Emma, 30 years old, from Paris'

/**
 * 硬绑定解决隐式丢失
 */
var obj = {
    name: 'Frank',
    display: function() {
        console.log('Display: ' + this.name);
    }
};

// 使用bind防止隐式丢失
var boundDisplay = obj.display.bind(obj);
setTimeout(boundDisplay, 1000); // 'Display: Frank'

function passFunction(fn) {
    fn();
}
passFunction(boundDisplay); // 'Display: Frank'
```

### 24.1.4 new绑定

```javascript
/**
 * new操作符的this绑定
 */
function Person(name, age) {
    this.name = name;
    this.age = age;
    this.greet = function() {
        console.log(`Hello, I am ${this.name}`);
    };
}

var alice = new Person('Alice', 25);
alice.greet(); // 'Hello, I am Alice'

console.log(alice instanceof Person); // true

/**
 * new绑定的内部过程
 */
function simulateNew(constructor, ...args) {
    // 1. 创建新对象
    var obj = Object.create(constructor.prototype);
    
    // 2. 执行构造函数，this指向新对象
    var result = constructor.apply(obj, args);
    
    // 3. 返回对象
    return (typeof result === 'object' && result !== null) ? result : obj;
}

var bob = simulateNew(Person, 'Bob', 30);
bob.greet(); // 'Hello, I am Bob'

/**
 * 构造函数返回值的影响
 */
function ReturnObject(name) {
    this.name = name;
    return { customName: 'Custom' }; // 返回对象
}

function ReturnPrimitive(name) {
    this.name = name;
    return 'primitive'; // 返回原始值
}

var obj1 = new ReturnObject('Test1');
console.log(obj1); // { customName: 'Custom' }

var obj2 = new ReturnPrimitive('Test2');
console.log(obj2.name); // 'Test2'
```

### 24.1.5 箭头函数绑定

```javascript
/**
 * 箭头函数的this继承
 */
var obj = {
    name: 'Object',
    
    regularMethod: function() {
        console.log('Regular method this:', this.name);
        
        // 箭头函数继承外层this
        var arrowFunction = () => {
            console.log('Arrow function this:', this.name);
        };
        
        arrowFunction(); // 'Object'
        
        // 普通函数使用默认绑定
        function normalFunction() {
            console.log('Normal function this:', this);
        }
        
        normalFunction(); // window/global
    },
    
    // 对象字面量中的箭头函数
    arrowMethod: () => {
        console.log('Arrow method this:', this); // window/global
    }
};

obj.regularMethod();
obj.arrowMethod();

/**
 * 箭头函数解决回调问题
 */
function Timer(duration) {
    this.duration = duration;
    this.elapsed = 0;
    
    // 使用箭头函数保持this绑定
    this.interval = setInterval(() => {
        this.elapsed += 1000;
        console.log(`Elapsed: ${this.elapsed}ms`);
        
        if (this.elapsed >= this.duration) {
            this.stop();
        }
    }, 1000);
}

Timer.prototype.stop = function() {
    clearInterval(this.interval);
    console.log('Timer stopped');
};

var timer = new Timer(3000);

/**
 * 箭头函数的绑定特性
 */
var arrowObj = {
    name: 'Arrow Object',
    
    test: function() {
        var arrow = () => this.name;
        
        // 箭头函数无法通过call/apply/bind改变this
        console.log(arrow()); // 'Arrow Object'
        console.log(arrow.call({ name: 'Other' })); // 'Arrow Object'
        console.log(arrow.apply({ name: 'Other' })); // 'Arrow Object'
        
        var boundArrow = arrow.bind({ name: 'Other' });
        console.log(boundArrow()); // 'Arrow Object'
    }
};

arrowObj.test();
```

---

## 24.2 全局与函数调用场景

### 24.2.1 不同环境中的全局this

```javascript
/**
 * 浏览器环境
 */
// 浏览器中全局this指向window
console.log(this === window); // true

/**
 * Node.js环境
 */
// Node.js中全局this指向global
// console.log(this === global); // true（在Node.js中）

/**
 * Web Workers环境
 */
// Web Worker中全局this指向self
// console.log(this === self); // true（在Worker中）

/**
 * 严格模式下的全局this
 */
(function() {
    'use strict';
    console.log('Strict global this:', this); // undefined
})();

/**
 * 模块环境中的this
 */
// ES6模块中，顶层this是undefined
// console.log(this); // undefined（在ES6模块中）
```

### 24.2.2 函数调用模式详解

```javascript
/**
 * 函数调用的四种模式
 */

// 1. 函数调用模式
function functionCall() {
    return this;
}
console.log(functionCall() === window); // true（非严格模式）

// 2. 方法调用模式
var methodObj = {
    method: function() {
        return this;
    }
};
console.log(methodObj.method() === methodObj); // true

// 3. 构造器调用模式
function Constructor() {
    this.property = 'value';
}
var instance = new Constructor();
console.log(instance.property); // 'value'

// 4. apply/call调用模式
var context = { name: 'Context' };
function applyCall() {
    return this.name;
}
console.log(applyCall.call(context)); // 'Context'

/**
 * 混合调用场景
 */
var complex = {
    name: 'Complex',
    
    getThis: function() {
        return this;
    },
    
    getArrowThis: () => {
        return this;
    },
    
    nested: {
        name: 'Nested',
        
        getThis: function() {
            return this;
        }
    }
};

console.log(complex.getThis().name); // 'Complex'
console.log(complex.getArrowThis()); // window/global
console.log(complex.nested.getThis().name); // 'Nested'

// 解构赋值导致的this丢失
var { getThis } = complex;
console.log(getThis() === window); // true
```

---

## 24.3 箭头函数的this

### 24.3.1 箭头函数this的特殊性

```javascript
/**
 * 箭头函数继承词法作用域的this
 */
function OuterFunction() {
    this.value = 'outer';
    
    // 普通函数的this
    this.normalMethod = function() {
        console.log('Normal method:', this.value);
    };
    
    // 箭头函数的this
    this.arrowMethod = () => {
        console.log('Arrow method:', this.value);
    };
    
    // 嵌套箭头函数
    this.nestedArrow = () => {
        return () => {
            console.log('Nested arrow:', this.value);
        };
    };
}

var obj = new OuterFunction();
obj.normalMethod(); // 'Normal method: outer'
obj.arrowMethod(); // 'Arrow method: outer'
obj.nestedArrow()(); // 'Nested arrow: outer'

// 改变调用上下文
var other = { value: 'other' };
obj.normalMethod.call(other); // 'Normal method: other'
obj.arrowMethod.call(other); // 'Arrow method: outer'（不变）

/**
 * 事件处理中的箭头函数
 */
class Button {
    constructor(element) {
        this.element = element;
        this.clickCount = 0;
        
        // 使用箭头函数绑定事件处理器
        this.element.addEventListener('click', () => {
            this.clickCount++;
            console.log(`Button clicked ${this.clickCount} times`);
        });
        
        // 对比：普通函数需要额外绑定
        // this.element.addEventListener('click', this.handleClick.bind(this));
    }
    
    handleClick() {
        this.clickCount++;
        console.log(`Handle click: ${this.clickCount}`);
    }
}

/**
 * 数组方法中的箭头函数
 */
var processor = {
    prefix: 'Processed: ',
    
    processItems: function(items) {
        // 箭头函数保持this指向processor
        return items.map(item => this.prefix + item);
    },
    
    processItemsNormal: function(items) {
        // 普通函数需要保存this引用
        var self = this;
        return items.map(function(item) {
            return self.prefix + item;
        });
    }
};

var items = ['A', 'B', 'C'];
console.log(processor.processItems(items)); // ['Processed: A', 'Processed: B', 'Processed: C']
```

---

## 24.4 bind/call/apply的本质

### 24.4.1 call和apply的实现原理

```javascript
/**
 * 手动实现call方法
 */
Function.prototype.myCall = function(context, ...args) {
    // 处理context为null或undefined的情况
    context = context || globalThis;
    
    // 创建唯一的属性名避免冲突
    const fn = Symbol('fn');
    
    // 将函数作为context的方法
    context[fn] = this;
    
    // 调用函数
    const result = context[fn](...args);
    
    // 删除临时属性
    delete context[fn];
    
    return result;
};

/**
 * 手动实现apply方法
 */
Function.prototype.myApply = function(context, args) {
    context = context || globalThis;
    const fn = Symbol('fn');
    context[fn] = this;
    
    const result = args ? context[fn](...args) : context[fn]();
    
    delete context[fn];
    return result;
};

// 测试自定义实现
function test(a, b) {
    console.log(`${this.name}: ${a} + ${b} = ${a + b}`);
}

var ctx = { name: 'Calculator' };
test.myCall(ctx, 3, 4); // 'Calculator: 3 + 4 = 7'
test.myApply(ctx, [5, 6]); // 'Calculator: 5 + 6 = 11'
```

### 24.4.2 bind的实现原理

```javascript
/**
 * 手动实现bind方法
 */
Function.prototype.myBind = function(context, ...args1) {
    const fn = this;
    
    // 返回绑定函数
    const boundFunction = function(...args2) {
        // 检查是否通过new调用
        if (this instanceof boundFunction) {
            // new调用：忽略绑定的context，使用new创建的实例
            return fn.apply(this, args1.concat(args2));
        } else {
            // 普通调用：使用绑定的context
            return fn.apply(context, args1.concat(args2));
        }
    };
    
    // 维护原型链
    if (fn.prototype) {
        boundFunction.prototype = Object.create(fn.prototype);
    }
    
    return boundFunction;
};

// 测试bind实现
function Person(name, age) {
    this.name = name;
    this.age = age;
}

var bindPerson = Person.myBind({}, 'Alice');

// 普通调用
var obj = {};
bindPerson.call(obj, 25);
console.log(obj); // { name: 'Alice', age: 25 }

// new调用
var instance = new bindPerson(30);
console.log(instance instanceof Person); // true
console.log(instance.name); // 'Alice'

/**
 * 偏函数应用
 */
function multiply(a, b, c) {
    return a * b * c;
}

// 创建偏函数
var double = multiply.bind(null, 2);
var doubleAndTriple = multiply.bind(null, 2, 3);

console.log(double(3, 4)); // 2 * 3 * 4 = 24
console.log(doubleAndTriple(5)); // 2 * 3 * 5 = 30

/**
 * 柯里化实现
 */
function curry(fn) {
    return function curried(...args) {
        if (args.length >= fn.length) {
            return fn.apply(this, args);
        } else {
            return curried.bind(this, ...args);
        }
    };
}

var add = curry(function(a, b, c) {
    return a + b + c;
});

console.log(add(1)(2)(3)); // 6
console.log(add(1, 2)(3)); // 6
console.log(add(1)(2, 3)); // 6
```

---

## 24.5 常见this陷阱

### 24.5.1 回调函数中的this丢失

```javascript
/**
 * 常见的this丢失场景
 */
class Counter {
    constructor() {
        this.count = 0;
    }
    
    increment() {
        this.count++;
        console.log('Count:', this.count);
    }
    
    setupTimer() {
        // 错误：this丢失
        setTimeout(this.increment, 1000); // undefined
        
        // 解决方案1：bind
        setTimeout(this.increment.bind(this), 2000);
        
        // 解决方案2：箭头函数
        setTimeout(() => this.increment(), 3000);
        
        // 解决方案3：保存this引用
        var self = this;
        setTimeout(function() {
            self.increment();
        }, 4000);
    }
}

var counter = new Counter();
counter.setupTimer();

/**
 * 数组方法回调中的this
 */
var processor = {
    multiplier: 2,
    
    processArray: function(numbers) {
        // 错误：forEach回调中this丢失
        numbers.forEach(function(num) {
            console.log(num * this.multiplier); // NaN
        });
        
        // 解决方案1：传递thisArg参数
        numbers.forEach(function(num) {
            console.log(num * this.multiplier);
        }, this);
        
        // 解决方案2：箭头函数
        numbers.forEach(num => {
            console.log(num * this.multiplier);
        });
    }
};

processor.processArray([1, 2, 3]);
```

### 24.5.2 事件处理器中的this

```javascript
/**
 * DOM事件处理中的this问题
 */
class ButtonHandler {
    constructor(button) {
        this.button = button;
        this.clickCount = 0;
        
        // 错误：this指向button元素
        button.addEventListener('click', this.handleClick);
        
        // 正确：绑定this
        button.addEventListener('click', this.handleClick.bind(this));
        
        // 或使用箭头函数
        button.addEventListener('click', () => this.handleClick());
    }
    
    handleClick(event) {
        this.clickCount++;
        console.log(`Button clicked ${this.clickCount} times`);
    }
}

/**
 * 对象方法作为回调
 */
var api = {
    baseUrl: 'https://api.example.com',
    
    request: function(endpoint) {
        return fetch(this.baseUrl + endpoint);
    },
    
    get: function(endpoint) {
        return this.request(endpoint);
    }
};

// 错误：this丢失
var get = api.get;
// get('/users'); // TypeError

// 正确：绑定this
var boundGet = api.get.bind(api);
boundGet('/users');

/**
 * 链式调用中的this
 */
class Calculator {
    constructor(value = 0) {
        this.value = value;
    }
    
    add(n) {
        this.value += n;
        return this; // 返回this支持链式调用
    }
    
    multiply(n) {
        this.value *= n;
        return this;
    }
    
    getValue() {
        return this.value;
    }
}

var calc = new Calculator(5);
var result = calc.add(3).multiply(2).getValue(); // 16
console.log('Chain result:', result);

/**
 * 解构赋值导致的this丢失
 */
var obj = {
    name: 'Object',
    getName: function() {
        return this.name;
    }
};

// 错误：解构后this丢失
var { getName } = obj;
// console.log(getName()); // undefined

// 解决方案：重新绑定
var boundGetName = obj.getName.bind(obj);
console.log(boundGetName()); // 'Object'
```

---

**本章总结**

第24章全面解析了JavaScript中this绑定的复杂机制：

1. **this的五种绑定方式**：
   - 默认绑定规则和严格模式下的区别
   - 隐式绑定和隐式丢失的常见场景
   - 显式绑定（call/apply/bind）的使用技巧
   - new绑定的构造函数调用机制
   - 箭头函数的词法绑定特性

2. **全局与函数调用场景**：
   - 全局作用域中this的指向规律
   - 函数直接调用vs方法调用的区别
   - 严格模式对this绑定的影响
   - 不同环境（浏览器vs Node.js）下的差异

3. **箭头函数的this特性**：
   - 词法作用域继承的工作原理
   - 与普通函数this绑定的根本区别
   - 在对象方法和构造函数中的使用注意事项
   - 事件处理和回调函数中的应用场景

4. **bind/call/apply的本质**：
   - 三种方法的参数传递和调用方式
   - 手动实现这些方法的核心算法
   - 性能考虑和使用场景选择
   - 柯里化和部分应用函数的实现

5. **常见this陷阱**：
   - 回调函数中的this丢失问题
   - 事件处理器的this指向错误
   - 解构赋值和方法提取的陷阱
   - 定时器和异步操作中的this问题

**关键要点**：
- this的值在函数调用时确定，不是在定义时确定
- 箭头函数的this是词法绑定，无法通过调用方式改变
- 理解绑定优先级有助于准确判断this指向
- 合理使用bind方法可以解决大部分this相关问题

**下一章预告**

第25章将深入学习深拷贝与浅拷贝，包括各种复制方法的实现原理、性能对比、以及手写深拷贝函数的完整实现。
