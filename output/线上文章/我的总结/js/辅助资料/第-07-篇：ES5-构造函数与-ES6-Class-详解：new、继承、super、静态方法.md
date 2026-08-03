---
title: "第 07 篇：ES5 构造函数与 ES6 Class 详解：new、继承、super、静态方法"
slug: "js-js-es5-es6-class-ddcd40c8"
summary: "从原型、实例、静态成员与继承链的关系出发，系统讲清 ES5 构造函数和 ES6 Class 的底层逻辑与实际差异。"
category: "辅助资料"
categoryPath:
  - "我的总结"
  - "js"
  - "辅助资料"
tags:
  - "JavaScript"
  - "构造函数"
  - "Class"
  - "原型链"
  - "继承"
status: "published"
sortOrder: 70
cover: ""
originalId: "6a2d291f8a2b1c68f2cac3be"
originalSlug: "js-js-es5-es6-class-ddcd40c8"
originalStatus: "published"
publishedAt: "2026-05-07T13:25:33.660Z"
updatedAt: "2026-07-31T11:16:24.389Z"
exportedAt: "2026-08-03T03:03:53.296Z"
---
# 第 07 篇：ES5 构造函数与 ES6 Class 详解：new、继承、super、静态方法
## 快速理解

- 每个函数（包括构造函数）在被创建时，会自动获得一个显式原型属性 `prototype`，它是一个对象，里面默认有一个 `constructor` 属性指回函数自身。构造函数也是对象，所以也有隐式原型 `__proto__`：普通函数的 `__proto__` 指向 `Function.prototype`；在 `class extends` 继承中，子类构造函数的 `__proto__` 会直接指向父类构造函数本身，这样才能继承父类的静态属性和方法，因为静态成员是挂在构造函数自己身上，而不是放在构造函数的 `prototype` 上。  
- 当用 `new` 调用构造函数创建实例时，实例是普通对象，没有显式原型 `prototype`，但它有隐式原型 `__proto__`，这个 `__proto__` 会被赋值为构造函数的 `prototype`。实例查找属性时，会先看自身有没有，没有就沿着自己的 `__proto__` 向上找：先去子类构造函数的 `prototype`，如果还没找到，再看子类 `prototype` 的 `__proto__`，也就是父类的 `prototype`，接着再往上是 `Object.prototype`，最后到 `null`。这条链完全只跟 `prototype` 的 `__proto__` 有关，和构造函数自身的 `__proto__` 无关。  
- 当用“类.属性”的方式调用静态方法或属性时，查找的则是另一条平行的链：先在子类构造函数自身上找，找不到就沿着子类的 `__proto__` 向上找，也就是父类构造函数本身，再往上依次是 `Function.prototype`、`Object.prototype`。因为类也是对象，它查找属性时同样只沿着自己的 `__proto__` 走，绝不会拐到自己的 `prototype` 上去，`prototype` 是专门给实例对象继承用的。  
- 所以，整个体系遵守一条统一规则：任何对象查找属性，都是先自身，再沿自身 `__proto__` 链向上。实例走的是由 `prototype` 串联起来的实例成员链，构造函数走的是由类自身 `__proto__` 串联起来的静态成员链，两链互不交叉，共同完成完整的面向对象继承。

## 核心概念速记（原型与继承关键点）

- 每个构造函数（实际上所有函数）都有一个显式的原型属性 `prototype`，它的值是一个对象，这个对象里默认包含一个 `constructor` 属性，它的值指向这个原型对象所在的构造函数自身。
- 构造函数本身也是对象，因此它也拥有隐式原型 `__proto__`。不过，这个隐式原型的指向需要分两种情况：
  - 对于普通的构造函数（如 `function Foo(){}`），它的 `__proto__` 指向的是 `Function.prototype`，因为构造函数本质上是由 `Function` 构造出来的实例；
  - 而在使用 `class extends` 实现继承时，子类构造函数的 `__proto__` 却直接指向父类构造函数本身，而不是父类的 `prototype`，这样才能让子类继承到父类的静态属性和方法。
- 同时，构造函数的 `prototype` 对象本身也是对象，所以它同样有隐式原型 `__proto__`：
  - 默认情况下它指向 `Object.prototype`；
  - 如果在继承链里，子类的 `prototype` 对象的 `__proto__` 会指向父类的 `prototype`，从而形成实例属性和方法的继承链。
- 当用 `new` 调用构造函数时，会创建出一个实例对象，实例对象是普通对象，没有显式原型 `prototype`，但它有隐式原型 `__proto__`，这个隐式原型的值被设为构造函数的 `prototype`，也就是父级（构造函数的原型对象），于是实例就可以通过 `__proto__` 链找到构造函数原型上定义的共享方法和属性。

---

## 一、构造函数的本质
### 1.1 构造函数的定义：普通函数的特殊用法
```javascript
// 定义一个普通的函数，它可以被当做构造函数使用
function Person(name) {
  // 当通过 new 调用时，this 指向新创建的对象
  // 当直接调用时，this 指向全局对象（浏览器中是 window）
  this.name = name;
  
  // 实例方法：每个实例都会创建一个新的函数
  this.say = function() { 
    console.log('你好！' + this.name); 
  };
}

// 正确用法：通过 new 关键字调用，此时函数充当构造函数
let p1 = new Person('小明'); // 创建 Person 的一个实例

// 错误用法：直接调用构造函数（会导致全局变量污染）
Person('小红'); 
// 此时函数内部的 this 指向 window（浏览器环境）
// 相当于 window.name = '小红'，污染了全局作用域
// 在严格模式下（'use strict'），直接调用时 this 为 undefined，会报错
```

### 1.2 new 运算符的详细执行流程
```javascript
function Student(name) {
  // new 关键字的第 1-2 步已经完成：创建空对象并绑定 this
  
  // 验证 this 确实是新对象
  console.log(this); // 输出：Student {}（空对象）
  
  // 第 3 步：执行构造函数代码，为新对象添加属性
  this.name = name; // 给新对象添加 name 属性
  
  // 可以在构造函数中验证 this 的指向
  console.log(this instanceof Student); // 输出：true
  
  // 构造函数可以显式返回一个对象
  // 如果返回非对象值，则忽略，仍返回新创建的对象
  // return { custom: '对象' }; // 如果取消注释，将返回这个对象而不是新创建的 Student 实例
}

// new 关键字的完整过程：
// 1. 创建一个新的空对象：const obj = {}
// 2. 将这个新对象的 [[Prototype]]（即 __proto__）指向构造函数的 prototype 属性
// 3. 将构造函数的 this 绑定到这个新对象
// 4. 执行构造函数内部的代码（为 this 添加属性）
// 5. 如果构造函数没有显式返回对象，则返回 this（即新创建的对象）
let stu = new Student('李华');
console.log(stu.name); // 输出：'李华'
```

### 1.3 构造函数、类和实例的关系
```javascript
// 构造函数：创建对象的模板/蓝图
function Car(brand, model) {
  // 实例属性：每个实例独有的属性
  this.brand = brand;
  this.model = model;
  
  // 实例方法（不推荐，因为每个实例都会创建新的函数，浪费内存）
  this.displayInfo = function() {
    return `${this.brand} ${this.model}`;
  };
}

// 更好的做法：将方法定义在原型上，所有实例共享同一个函数
Car.prototype.startEngine = function() {
  return `${this.brand} ${this.model} 引擎启动`;
};

// 实例化：使用 new 创建对象的过程
let myCar = new Car('宝马', 'X5');
console.log(myCar.displayInfo()); // 调用实例方法
console.log(myCar.startEngine()); // 调用原型方法

// myCar 是 Car 的一个实例
console.log(myCar instanceof Car);    // true
console.log(myCar instanceof Object); // true，所有对象都是 Object 的实例
```

### 1.4 instanceof 运算符的工作原理
`instanceof` 是 JavaScript 中用于判断**对象与构造函数 / 类之间原型链关系**的运算符，核心作用是验证“某个对象是否是某个构造函数（或类）的实例”，本质是沿原型链查找匹配。

核心逻辑：

1. 语法：`对象 instanceof 构造函数/类`
2. 工作原理：检查对象的原型链（`__proto__` 链路）上，是否存在目标构造函数 / 类的 `prototype` 属性。
    - 若找到匹配的 `prototype`，返回 `true`；
    - 若遍历到原型链尽头（`null`）仍未找到，返回 `false`。

```javascript
function Vehicle(type) {
  this.type = type;
}

function Car(brand) {
  this.brand = brand;
}

// 设置原型链，使 Car 继承 Vehicle
Car.prototype = new Vehicle('汽车');

let bmw = new Car('宝马');

// instanceof 检查原型链
console.log(bmw instanceof Car);      // true：bmw 的原型链上能找到 Car.prototype
console.log(bmw instanceof Vehicle);  // true：bmw 的原型链上能找到 Vehicle.prototype
console.log(bmw instanceof Object);   // true：bmw 的原型链上能找到 Object.prototype

// instanceof 的工作方式：
// 1. 检查对象的 __proto__ 是否等于构造函数的 prototype
// 2. 如果不相等，沿着原型链向上查找（检查 __proto__.__proto__）
// 3. 找到则返回 true，直到原型链尽头（null）则返回 false

// 模拟实现 instanceof
function myInstanceof(obj, constructor) {
  let proto = Object.getPrototypeOf(obj); // 获取 obj 的原型
  
  while (proto !== null) {
    if (proto === constructor.prototype) {
      return true;
    }
    proto = Object.getPrototypeOf(proto); // 继续向上查找
  }
  return false;
}
```

### 1.5 关键注意事项与陷阱
```javascript
// 1. 不要直接调用构造函数
function Animal(name) {
  this.name = name;
}

// 错误：直接调用，this 指向全局对象
Animal('老虎'); // 浏览器中：window.name = '老虎'

// 预防方法：使用 new.target（ES6）或严格模式
function SafeAnimal(name) {
  // 方法1：ES6 的 new.target
  if (!new.target) {
    throw new Error('必须使用 new 关键字调用 SafeAnimal');
  }
  
  // 方法2：严格模式
  // 'use strict'; // 在严格模式下，this 为 undefined，会报错
  
  this.name = name;
}

// 2. 箭头函数不能作为构造函数
const ArrowFunction = () => {
  // 箭头函数没有自己的 this，继承自外层作用域
  this.name = 'test'; // 这里的 this 取决于定义时的上下文
};

try {
  new ArrowFunction(); // TypeError: ArrowFunction is not a constructor
} catch (e) {
  console.log('箭头函数不能作为构造函数:', e.message);
}

// 3. 构造函数命名约定：首字母大写
function User(name) { /* 正确 */ }
function getUsers() { /* 正确，但这不是构造函数 */ }
function user(name) { /* 不推荐，容易混淆 */ }
```

---

## 二、ES5 构造函数详解
### 2.1 基本语法和原型方法
```javascript
// 定义构造函数
function Person(name, age) {
  // 实例属性：每个实例都有自己独立的属性值
  this.name = name;
  this.age = age;
  
  // 实例方法（不推荐的方式）
  // 问题：每个实例都会创建新的函数对象，浪费内存
  this.sayHello = function() {
    console.log('你好，我是' + this.name);
  };
  
  // 如果方法中需要使用构造函数内部的变量，可以使用闭包
  let privateCounter = 0; // 私有变量（只能通过闭包访问）
  
  this.getPrivateCount = function() {
    return privateCounter; // 通过闭包访问私有变量
  };
  
  this.incrementPrivateCount = function() {
    privateCounter++;
    return privateCounter;
  };
}

// 推荐：将方法定义在原型上
// 所有实例共享同一个函数，节省内存
Person.prototype.introduce = function() {
  return `我叫${this.name}，今年${this.age}岁`;
};

// 还可以在原型上添加更多共享方法
Person.prototype.haveBirthday = function() {
  this.age++; // 修改实例属性
  console.log(`生日快乐！现在${this.name} ${this.age}岁了`);
  return this.age; // 返回新的年龄
};

// 创建实例
const person1 = new Person('张三', 25);
const person2 = new Person('李四', 30);

// 实例方法对比
console.log(person1.sayHello === person2.sayHello); // false：每个实例有自己的函数
console.log(person1.introduce === person2.introduce); // true：共享原型上的函数
```

### 2.2 this 指向的详细分析
```javascript
// 构造函数中的 this 指向取决于调用方式
function Example(value) {
  console.log('this 指向:', this);
  console.log('this 的值:', value);
  this.value = value;
}

// 情况 1：作为构造函数调用（使用 new）
console.log('=== 情况1：new 调用 ===');
const obj1 = new Example('new调用');
// this 指向新创建的对象：Example {}
// value 被赋值为 'new调用'

// 情况 2：作为普通函数调用
console.log('=== 情况2：直接调用 ===');
Example('直接调用');
// 在非严格模式浏览器中，this 指向 window
// 相当于 window.value = '直接调用'
// 在严格模式下，this 为 undefined
// 在 Node.js 中是否为 undefined 取决于运行上下文（CJS/ESM、是否显式 strict）

// 情况 3：作为对象的方法调用
console.log('=== 情况3：方法调用 ===');
const myObj = {
  name: '我的对象',
  method: Example
};
myObj.method('方法调用');
// this 指向调用者 myObj
// myObj.value = '方法调用'

// 情况 4：使用 call/apply/bind 改变 this
console.log('=== 情况4：call/apply/bind ===');
const customObj = { custom: '自定义对象' };
Example.call(customObj, 'call调用');    // this 指向 customObj
Example.apply(customObj, ['apply调用']); // this 指向 customObj
const boundExample = Example.bind(customObj);
boundExample('bind调用'); // this 指向 customObj
```

### 2.3 原型链机制的深入理解
```javascript
// 构造函数
function Animal(type) {
  this.type = type || '未知';
}

// 在原型上添加方法
Animal.prototype.makeSound = function() {
  return '动物发出声音';
};

// 创建实例
const dog = new Animal('犬科');

// 原型链关系验证
console.log('1. dog.__proto__ === Animal.prototype:', 
  dog.__proto__ === Animal.prototype); // true

console.log('2. Animal.prototype.__proto__ === Object.prototype:', 
  Animal.prototype.__proto__ === Object.prototype); // true

console.log('3. Object.prototype.__proto__ === null:', 
  Object.prototype.__proto__ === null); // true

console.log('4. dog 的原型链:', 
  dog.__proto__, // Animal.prototype
  dog.__proto__.__proto__, // Object.prototype
  dog.__proto__.__proto__.__proto__ // null
);

// 属性查找过程
console.log('5. dog.type 查找过程:');
// 1. 在 dog 对象自身查找 type 属性 -> 找到 '犬科'
console.log('  dog.hasOwnProperty("type"):', dog.hasOwnProperty('type')); // true

console.log('6. dog.makeSound 查找过程:');
// 1. 在 dog 对象自身查找 makeSound 属性 -> 未找到
// 2. 沿着原型链查找 dog.__proto__ (Animal.prototype) -> 找到
console.log('  dog.hasOwnProperty("makeSound"):', dog.hasOwnProperty('makeSound')); // false
console.log('  Animal.prototype.hasOwnProperty("makeSound"):', 
  Animal.prototype.hasOwnProperty('makeSound')); // true

console.log('7. dog.toString 查找过程:');
// 1. dog 自身没有 toString
// 2. Animal.prototype 也没有 toString
// 3. Object.prototype 有 toString
console.log('  dog.toString === Object.prototype.toString:', 
  dog.toString === Object.prototype.toString); // true

// instanceof 的工作原理
console.log('8. instanceof 检查:');
console.log('  dog instanceof Animal:', dog instanceof Animal); // true
console.log('  dog instanceof Object:', dog instanceof Object); // true
console.log('  dog instanceof Array:', dog instanceof Array); // false

// constructor 属性
console.log('9. constructor 属性:');
console.log('  dog.constructor === Animal:', dog.constructor === Animal); // true
// 注意：constructor 属性来自原型链，不是实例自身的属性
console.log('  dog.hasOwnProperty("constructor"):', dog.hasOwnProperty('constructor')); // false
```

---

## 三、ES6 Class 详解
### 3.1 基本类定义：语法糖背后的原理
```javascript
// ES6 Class 是构造函数的语法糖，更清晰易读
class Person {
  // 构造函数：初始化实例
  // 对应 ES5 的构造函数 function Person(name, age) { ... }
  constructor(name, age) {
    // 实例属性
    this.name = name;
    this.age = age;
    
    // 可以在构造函数中定义实例方法（但不推荐，与 ES5 构造函数相同的问题）
    this.instanceMethod = function() {
      return '这是实例方法';
    };
  }
  
  // 实例方法：自动添加到 Person.prototype 上
  // 对应 ES5 的 Person.prototype.sayHello = function() { ... }
  sayHello() {
    return `你好，我是${this.name}`;
  }
  
  // Getter：当做属性访问时自动调用
  // 例如：person.info 会调用这个方法
  get info() {
    return `${this.name} - ${this.age}岁`;
  }
  
  // Setter：当给属性赋值时自动调用
  // 例如：person.info = '王五,28' 会调用这个方法
  set info(value) {
    const [name, age] = value.split(',');
    this.name = name.trim();
    this.age = parseInt(age);
  }
  
  // 静态方法：属于类本身，实例不能调用
  // 对应 ES5 的 Person.createDefault = function() { ... }
  // 静态方法通过 static 关键字声明，它是 类的 “专属方法”，
  // 只能通过 “类名.方法名” 调用，不能通过类的实例调用。
  static createDefault() {
    // 静态方法中的 this 指向类本身（Person），不是实例
    return new Person('匿名', 0);
  }
  
  // 静态属性（ES2022+）：属于类本身的属性
  // 对应 ES5 的 Person.species = '人类'
  static species = '人类';
  
  // 私有字段（ES2022+）：以 # 开头，只能在类内部访问
  // 仅能在类的内部方法中访问 / 修改，确保类的逻辑不被外部干扰
  #secret = '这是我的秘密';
  
  // 访问私有字段的方法
  getSecret() {
    return this.#secret;
  }
  
  // 修改私有字段的方法
  setSecret(newSecret) {
    this.#secret = newSecret;
  }
}

// 使用示例
const person = new Person('张三', 25);

console.log('实例方法调用:', person.sayHello()); // 你好，我是张三
console.log('Getter 访问:', person.info); // 张三 - 25岁

// 使用 Setter
person.info = '李四,30';
console.log('Setter 修改后:', person.name, person.age); // 李四 30

// 静态方法调用
const defaultPerson = Person.createDefault();
console.log('静态方法创建:', defaultPerson.name); // 匿名

// 静态属性访问
console.log('静态属性:', Person.species); // 人类

// 私有字段访问
console.log('私有字段:', person.getSecret()); // 这是我的秘密
person.setSecret('新秘密');
console.log('修改后的私有字段:', person.getSecret()); // 新秘密

// 无法直接访问私有字段
// console.log(person.#secret); // 语法错误：私有字段只能在类内部访问

// 验证 Class 本质是函数
console.log('typeof Person:', typeof Person); // function
console.log('Person.prototype:', Person.prototype); // 包含 sayHello 等方法
console.log('person instanceof Person:', person instanceof Person); // true
```

### 3.2 类继承：extends 和 super
我们从「语法细节→底层原理→ES5对比→避坑要点」四个维度，更深入拆解这段子类继承代码，结合父类 `Animal` 的合理实现（补全上下文），让每个细节都清晰可见：

```javascript
// 父类（基类）
class Animal {
  // 父类构造函数：接收 name（名字）、type（类别）两个参数
  constructor(animalName, animalType) {
    // 父类的实例属性：绑定到 this（未来子类实例会继承这些属性）
    this.name = animalName; // 动物名字
    this.type = animalType; // 动物类别（如「犬科」「猫科」）
    this.living = true; // 父类默认实例属性（所有动物都「存活」）
  }

  // 父类的原型方法（所有子类实例可共享）
  eat(food) {
    console.log(`${this.name}（${this.type}）在吃${food}`);
  }

  sleep() {
    console.log(`${this.name}在睡觉`);
  }
}
```

有了父类，再看子类 `Dog` 的继承逻辑，就能明确「继承了什么」「新增了什么」「如何关联」。

1. `class Dog extends Animal`：继承关系的核心声明

+ **语法作用**：明确 `Dog` 是 `Animal` 的子类（派生类），`Animal` 是 `Dog` 的父类（基类）。
+ **底层原理**：  
ES6 的 `extends` 本质是「原型链继承+构造函数继承」的语法糖，它做了两件关键事（对应 ES5 手动实现逻辑）：  
① 让 `Dog.prototype.__proto__` 指向 `Animal.prototype`（保证子类实例能通过原型链访问父类的原型方法，如 `eat()` `sleep()`）；  
② 让 `Dog.__proto__` 指向 `Animal`（保证子类能继承父类的静态方法，若父类有静态方法的话）。
+ **ES5 等价代码**（对比理解语法糖的本质）：

```javascript
// ES5 中实现 Dog 继承 Animal，需要手动做 3 步
function Dog(name, breed) { /* 构造函数逻辑后续说 */ }
// 1. 让子类原型链指向父类原型（继承原型方法）
Dog.prototype = Object.create(Animal.prototype);
// 2. 修正子类原型的 constructor 指向（避免原型链紊乱）
Dog.prototype.constructor = Dog;
// 3. 让子类构造函数继承父类构造函数（继承静态属性/方法）
Dog.__proto__ = Animal;
```

而 ES6 用 `extends` 一句话就完成了上述 3 步，避免了 ES5 手动修改原型链的繁琐和出错风险（比如忘记修正 `constructor`）。



2. `constructor(name, breed)`：子类的构造函数

+ **语法作用**：子类的「实例初始化入口」，用于定义子类**特有**的实例属性（如 `breed` 品种），同时协同父类初始化「继承的属性」（如 `name` `type`）。
+ **关键说明**：  
① 子类构造函数**不是必须写的**：如果子类没有自己的特有属性要初始化（比如不需要 `breed`），可以省略 `constructor`，此时 JS 会自动生成一个「隐式构造函数」，默认调用 `super()` 并传递所有参数给父类。  
示例：

```javascript
class Dog extends Animal {}
// 等价于：
class Dog extends Animal {
  constructor(...args) { // 接收所有传给 Dog 的参数
    super(...args); // 自动调用父类构造函数，传递所有参数
  }
}
```

② 子类构造函数的核心职责：「先继承父类属性，再添加自身属性」—— 这就是 `super()` 必须前置的原因。



3. `super(name, '犬科')`：子类继承父类的「桥梁」（最关键）

你的注释提到「相当于 `Animal.call(this, name)`」，这个说法**不完全准确**（只说对了一半），`super()` 的作用比 `Animal.call(this)` 更全面，我们分「作用+细节+对比」讲透：

（1）`super()` 的两个核心作用（缺一不可）

+ 作用1：调用父类的构造函数（对应 `Animal.call(this, name, '犬科')`）  
把父类构造函数的参数（`name` 和 `'犬科'`）传递给 `Animal` 的 `constructor`，让父类的实例属性（`this.name` `this.type` `this.living`）绑定到「子类的实例 `this`」上。  
比如执行 `new Dog('旺财', '金毛')` 时，`super('旺财', '犬科')` 会调用 `Animal constructor`，给 `Dog` 实例的 `this` 绑定：`this.name = '旺财'`、`this.type = '犬科'`、`this.living = true`。
+ 作用2：维持原型链的完整性（这是 `Animal.call(this)` 做不到的）  
若只调用 `Animal.call(this, name, '犬科')`（不通过 `extends` 或 `super()`），子类实例只能拿到父类的「实例属性」，但拿不到父类的「原型方法」（如 `eat()`）—— 因为原型链没建立。  
而 `super()` 会在调用父类构造函数的同时，确保 `Dog` 实例的原型链（`dog.__proto__ → Dog.prototype → Animal.prototype`）不中断，所以实例能正常访问 `Animal` 的原型方法。

（2）`super()` 的强制规则（违反必报错）

+ 规则1：**必须是子类构造函数的第一条语句**  
原因：子类的 `this` 是通过父类构造函数初始化的，若先写子类自己的属性（如 `this.breed = breed`），此时 `this` 还没被父类初始化，属于「未初始化的 `this`」，JS 会直接报错。  
❌ 错误示例（顺序颠倒）：

```javascript
constructor(name, breed) {
  this.breed = breed; // 报错：Cannot reference 'this' before super()
  super(name, '犬科');
}
```

✅ 正确示例（先 `super` 再子类属性）：

```javascript
constructor(name, breed) {
  super(name, '犬科'); // 先初始化父类属性，绑定 this
  this.breed = breed; // 再添加子类特有属性（安全）
}
```

+ 规则2：**子类有 **`constructor`** 就必须调用 **`super()`  
原因：子类的 `this` 无法自己初始化，必须通过 `super()` 借用父类的构造函数来初始化（这是 ES6 继承的设计规则）。若子类写了 `constructor` 却不调用 `super()`，会报错「Must call super constructor in derived class before accessing 'this' or returning from derived constructor」。
+ 规则3：`super()`** 只能在子类构造函数中调用**  
这里特指 `super()` 这种“调用父类构造函数”的形式。  
补充：`super.method()` / `super.prop` 可以在子类实例方法或静态方法中使用，用于访问父类原型/父类本身上的成员。

（3）`super()` 的参数传递逻辑

+ 传递的参数数量，要和父类 `constructor` 的参数数量匹配（或父类支持可选参数）。  
比如父类 `Animal` 的 `constructor` 接收 `(animalName, animalType)` 两个参数，所以 `super()` 必须传递两个参数（这里 `name` 是动态传入，`'犬科'` 是子类固定传递的，因为所有 `Dog` 都属于犬科）。  
+ 若父类构造函数有默认参数，子类 `super()` 可省略对应参数：

```javascript
// 父类有默认参数
class Animal {
  constructor(animalName, animalType = '未知类别') {
    this.name = animalName;
    this.type = animalType;
  }
}
// 子类可省略第二个参数，父类会用默认值
class Dog extends Animal {
  constructor(name, breed) {
    super(name); // 等价于 super(name, '未知类别')，但实际会手动传 '犬科' 更合理
    this.breed = breed;
  }
}
```



当我们执行 `const dog = new Dog('旺财', '金毛')` 时，`dog` 实例的结构如下（用文字描述原型链和属性）：

```plain
dog 实例 {
  // 继承自父类 Animal 的实例属性（通过 super() 初始化）
  name: '旺财',
  type: '犬科',
  living: true,
  // 子类 Dog 特有实例属性（constructor 中添加）
  breed: '金毛',
  // 原型链（__proto__）
  __proto__: Dog.prototype {
    constructor: Dog (构造函数),
    __proto__: Animal.prototype { // 继承父类原型
      eat: 函数 (父类原型方法),
      sleep: 函数 (父类原型方法),
      __proto__: Object.prototype (所有对象的顶层原型)
    }
  }
}
```

所以我们能做这些操作（验证继承效果）：

```javascript
dog.name; // '旺财'（继承父类属性）
dog.breed; // '金毛'（子类特有属性）
dog.eat('骨头'); // '旺财（犬科）在吃骨头'（继承父类原型方法）
dog.sleep(); // '旺财在睡觉'（继承父类原型方法）
dog instanceof Dog; // true（属于子类）
dog instanceof Animal; // true（属于父类，原型链查找）
```



ES6 继承 vs ES5 继承（彻底懂语法糖）

我们用 ES5 实现和上述 ES6 完全等价的 `Dog` 继承，对比后就能明白 `class/extends/super` 是如何简化代码的：

| 特性 | ES6 实现（你的代码，补全后） | ES5 手动实现（等价逻辑） |
| --- | --- | --- |
| 继承声明 | `class Dog extends Animal` | `function Dog(name, breed) { ... }` + 手动绑定原型链 |
| 父类属性继承 | `super(name, '犬科')` | `Animal.call(this, name, '犬科')` |
| 原型方法继承 | 自动通过 `extends` 关联 | `Dog.prototype = Object.create(Animal.prototype)` + 修正 `constructor` |
| 子类特有属性 | `this.breed = breed`（`super` 之后） | `this.breed = breed`（`call` 之后） |
| 原型链完整性 | 自动保证 | 需手动处理 `Dog.prototype.constructor = Dog` |


ES5 完整等价代码：

```javascript
// 父类（ES5 构造函数）
function Animal(animalName, animalType) {
  this.name = animalName;
  this.type = animalType;
  this.living = true;
}
// 父类原型方法
Animal.prototype.eat = function(food) {
  console.log(`${this.name}（${this.type}）在吃${food}`);
};
Animal.prototype.sleep = function() {
  console.log(`${this.name}在睡觉`);
};

// 子类（ES5 实现继承）
function Dog(name, breed) {
  // 1. 继承父类实例属性（对应 ES6 super() 的作用1）
  Animal.call(this, name, '犬科');
  // 2. 子类特有属性
  this.breed = breed;
}

// 3. 继承父类原型方法（对应 ES6 extends 的作用）
Dog.prototype = Object.create(Animal.prototype);
// 4. 修正子类原型的 constructor 指向（避免原型链紊乱）
Dog.prototype.constructor = Dog;

// 测试效果和 ES6 完全一致
const dog = new Dog('旺财', '金毛');
dog.eat('骨头'); // 正常执行，和 ES6 结果一样
```

通过对比能发现：ES6 并没有创造新的继承机制，只是用更简洁、语义化的语法，封装了 ES5 中繁琐且容易出错的原型链操作（比如忘记修正 `constructor` 会导致 `dog.constructor === Animal`，这是不符合逻辑的）。



五、常见踩坑点总结（避坑指南）

1. `super()`** 忘记传参数**：若父类构造函数没有默认参数，`super()` 少传参数会导致父类属性为 `undefined`（如 `super(name)` 会让 `this.type = undefined`）；
2. `super()`** 顺序错误**：先写 `this.xxx` 再写 `super()`，直接报错；
3. **子类有 **`constructor`** 却不调用 **`super()`：报错，除非子类构造函数返回一个对象（特殊场景，一般不用）；
4. **混淆 **`super`** 的两种用法**：`super()` 是调用父类构造函数（仅在 `constructor` 中），而 `super.xxx()` 是调用父类的原型方法（可在子类原型方法中使用，比如 `super.eat(food)` 直接调用父类 `eat` 方法）；
5. **父类没有显式 **`constructor`：JS 会给父类生成默认构造函数（`constructor() {}`），此时子类 `super()` 可不带参数（若父类不需要初始化属性）。



### 最终补全的子类完整代码（可直接运行）
```javascript
// 父类（基类）
class Animal {
  constructor(animalName, animalType) {
    this.name = animalName;
    this.type = animalType;
    this.living = true;
  }

  eat(food) {
    console.log(`${this.name}（${this.type}）在吃${food}`);
  }

  sleep() {
    console.log(`${this.name}在睡觉`);
  }
}

// 子类（派生类）
class Dog extends Animal {
  // 子类的构造函数：初始化子类特有属性 breed
  constructor(name, breed) {
    // 1. 必须首先调用 super()：调用父类构造函数，初始化继承的属性
    // 传递参数给父类：name（动态传入）、'犬科'（子类固定类别）
    super(name, '犬科');

    // 2. 再添加子类特有实例属性（必须在 super() 之后）
    this.breed = breed; // 狗的品种（如金毛、哈士奇）
  }

  // 子类可扩展自己的原型方法（覆盖或新增）
  bark() {
    console.log(`${this.name}（${this.breed}）在叫：汪汪汪！`);
  }
}

// 测试
const goldenRetriever = new Dog('旺财', '金毛');
goldenRetriever.name; // '旺财'（继承父类）
goldenRetriever.breed; // '金毛'（子类特有）
goldenRetriever.eat('骨头'); // 继承父类方法：旺财（犬科）在吃骨头
goldenRetriever.bark(); // 子类特有方法：旺财（金毛）在叫：汪汪汪！
```

### 3.3 私有属性和方法：真正的封装
```javascript
// ES2022 引入了真正的私有字段和方法
class BankAccount {
  // 私有属性：以 # 开头，只能在类内部访问
  #balance = 0;
  #transactionHistory = [];
  #accountNumber;
  
  // 公共属性
  owner;
  accountType;
  
  constructor(owner, initialBalance = 0, accountType = '储蓄账户') {
    this.owner = owner;
    this.accountType = accountType;
    
    // 调用私有方法生成账号
    this.#accountNumber = this.#generateAccountNumber();
    
    // 调用私有方法验证并设置初始余额
    if (initialBalance > 0) {
      this.#deposit(initialBalance, '初始存款');
    }
  }
  
  // 私有方法：只能内部调用
  #generateAccountNumber() {
    // 生成随机的账号
    const randomPart = Math.random().toString(36).substring(2, 10).toUpperCase();
    const timestamp = Date.now().toString().substring(8);
    return `ACC${timestamp}${randomPart}`;
  }
  
  #validateAmount(amount) {
    if (typeof amount !== 'number' || isNaN(amount)) {
      throw new Error('金额必须是数字');
    }
    if (amount <= 0) {
      throw new Error('金额必须大于0');
    }
    return true;
  }
  
  #addTransaction(type, amount, description) {
    const transaction = {
      type,
      amount,
      description,
      date: new Date().toISOString(),
      balance: this.#balance
    };
    this.#transactionHistory.push(transaction);
  }
  
  // 内部存款方法
  #deposit(amount, description = '存款') {
    if (this.#validateAmount(amount)) {
      this.#balance += amount;
      this.#addTransaction('存款', amount, description);
      return true;
    }
    return false;
  }
  
  // 公共存款方法
  deposit(amount, description = '存款') {
    const success = this.#deposit(amount, description);
    if (success) {
      console.log(`${description}成功，金额: ${amount}，当前余额: ${this.#balance}`);
    }
    return success;
  }
  
  // 取款
  withdraw(amount, description = '取款') {
    if (!this.#validateAmount(amount)) {
      return false;
    }
    
    if (amount > this.#balance) {
      console.error('余额不足');
      return false;
    }
    
    this.#balance -= amount;
    this.#addTransaction('取款', amount, description);
    console.log(`${description}成功，金额: ${amount}，当前余额: ${this.#balance}`);
    return true;
  }
  
  // Getter：提供对私有属性的受控访问
  get balance() {
    return this.#balance;
  }
  
  get accountInfo() {
    // 返回账户信息（不包含私有数据）
    return {
      owner: this.owner,
      accountType: this.accountType,
      accountNumber: this.#accountNumber, // 可以公开账号
      balance: this.#balance,
      transactionCount: this.#transactionHistory.length
    };
  }
  
  // 提供交易历史查询（可以控制返回的数据）
  getRecentTransactions(count = 5) {
    return this.#transactionHistory
      .slice(-count) // 取最近的 count 条记录
      .map(t => ({
        type: t.type,
        amount: t.amount,
        description: t.description,
        date: t.date
        // 不返回余额信息
      }));
  }
  
  // 静态方法：工具函数
  static validateAccountNumber(number) {
    return /^ACC\d+[A-Z0-9]+$/.test(number);
  }
}

// 使用示例
const account = new BankAccount('张三', 1000);

console.log('账户信息:', account.accountInfo);

account.deposit(500, '工资');
account.withdraw(200, '购物');

console.log('当前余额:', account.balance); // 1300
console.log('最近交易:', account.getRecentTransactions(2));

// 无法直接访问私有属性
// console.log(account.#balance); // 语法错误
// console.log(account.#transactionHistory); // 语法错误

// 私有字段是真正私有的
console.log('私有字段检测:');
console.log('  #balance in account:', '#balance' in account); // false
console.log('  无法通过常规方式访问私有字段');

// 静态方法使用
console.log('验证账号:', BankAccount.validateAccountNumber('ACC123456ABC'));
```

---

## 四、Class vs 构造函数详细对比
### 4.1 语法对比
```javascript
// ==================== ES5 构造函数 ====================
function ES5Person(name, age) {
  // 实例属性
  this.name = name;
  this.age = age;
  
  // 实例方法（不推荐，每个实例都有独立的函数）
  this.sayHello = function() {
    console.log('ES5: 你好，' + this.name);
  };
}

// 原型方法（推荐）
ES5Person.prototype.introduce = function() {
  return `ES5: 我是${this.name}，${this.age}岁`;
};

// 静态方法
ES5Person.createDefault = function() {
  return new ES5Person('默认用户', 0);
};

// 继承实现
function ES5Employee(name, age, position) {
  // 调用父类构造函数
  ES5Person.call(this, name, age);
  this.position = position;
}

// 设置原型链实现继承
ES5Employee.prototype = Object.create(ES5Person.prototype);
ES5Employee.prototype.constructor = ES5Employee;

// 子类方法
ES5Employee.prototype.work = function() {
  return `ES5: ${this.name} 正在工作，职位是 ${this.position}`;
};

// ==================== ES6 Class ====================
class ES6Person {
  constructor(name, age) {
    this.name = name;
    this.age = age;
  }
  
  // 实例方法（自动添加到原型）
  sayHello() {
    console.log('ES6: 你好，' + this.name);
  }
  
  introduce() {
    return `ES6: 我是${this.name}，${this.age}岁`;
  }
  
  // 静态方法
  static createDefault() {
    return new ES6Person('默认用户', 0);
  }
}

// 继承（语法更简洁）
class ES6Employee extends ES6Person {
  constructor(name, age, position) {
    super(name, age); // 调用父类构造函数
    this.position = position;
  }
  
  work() {
    return `ES6: ${this.name} 正在工作，职位是 ${this.position}`;
  }
}

// ==================== 对比测试 ====================
const es5Instance = new ES5Person('张三', 25);
const es6Instance = new ES6Person('李四', 30);

const es5Employee = new ES5Employee('王五', 28, '工程师');
const es6Employee = new ES6Employee('赵六', 32, '经理');

console.log('ES5 Person:', es5Instance.introduce());
console.log('ES6 Person:', es6Instance.introduce());

console.log('ES5 Employee:', es5Employee.introduce(), es5Employee.work());
console.log('ES6 Employee:', es6Employee.introduce(), es6Employee.work());

console.log('静态方法调用:');
console.log('ES5:', ES5Person.createDefault().name);
console.log('ES6:', ES6Person.createDefault().name);

// Class 本质验证
console.log('Class 本质:', typeof ES6Person); // function
console.log('Class 构造函数:', ES6Person === ES6Person.prototype.constructor); // true
```

### 4.2 特性对比表
```javascript
console.log('==================== ES5构造函数 vs ES6 Class 对比 ====================');

// 创建对比函数
function compareFeatures() {
  const features = [
    {
      feature: '定义方式',
      es5: 'function Person() {}',
      es6: 'class Person {}',
      note: 'Class 更接近传统面向对象语法'
    },
    {
      feature: '方法定义',
      es5: 'Person.prototype.method = function() {}',
      es6: '直接在类中定义 method() {}',
      note: 'Class 方法自动添加到原型，语法更简洁'
    },
    {
      feature: '构造函数',
      es5: 'function Person() { /* 构造函数体 */ }',
      es6: 'constructor() { /* 构造函数体 */ }',
      note: 'Class 使用明确的 constructor 方法'
    },
    {
      feature: '继承实现',
      es5: 'Child.prototype = Object.create(Parent.prototype)',
      es6: 'class Child extends Parent {}',
      note: 'Class 使用 extends 关键字，更直观'
    },
    {
      feature: 'super调用',
      es5: 'Parent.call(this, args)',
      es6: 'super(args)',
      note: 'Class 使用 super() 调用父类构造函数'
    },
    {
      feature: '静态方法',
      es5: 'Person.staticMethod = function() {}',
      es6: 'static staticMethod() {}',
      note: 'Class 使用 static 关键字定义静态方法'
    },
    {
      feature: '静态属性',
      es5: 'Person.staticProp = value',
      es6: 'static staticProp = value',
      note: 'ES6+ 支持类内部的静态属性定义'
    },
    {
      feature: '私有成员',
      es5: '约定使用 _private (非真正私有)',
      es6: '#private (ES2022+，真正私有)',
      note: 'Class 支持真正的私有字段和方法'
    },
    {
      feature: '提升(Hoisting)',
      es5: '函数提升，可在定义前调用',
      es6: '不提升，有暂时性死区(TDZ)',
      note: 'Class 必须先定义后使用'
    },
    {
      feature: '原型访问',
      es5: '可直接修改 Person.prototype',
      es6: '不能直接修改，语法更严格',
      note: 'Class 提供了更严格的封装'
    }
  ];
  
  console.table(features);
}

// 调用对比函数
compareFeatures();
```

### 4.3 兼容性和转换
```javascript
// Babel 如何将 ES6 Class 转换为 ES5 代码
// 假设有 ES6 Class：
/*
class Person {
  constructor(name) {
    this.name = name;
  }
  
  sayHello() {
    return `Hello, ${this.name}`;
  }
  
  static create() {
    return new Person('Default');
  }
}
*/

// Babel 转换后的 ES5 代码大致如下：
function Person(name) {
  // 类检查（确保通过 new 调用）
  if (!(this instanceof Person)) {
    throw new TypeError("Cannot call a class as a function");
  }
  
  this.name = name;
}

// 实例方法
Object.defineProperty(Person.prototype, "sayHello", {
  value: function sayHello() {
    return "Hello, " + this.name;
  },
  enumerable: false, // 不可枚举
  writable: true,
  configurable: true
});

// 静态方法
Object.defineProperty(Person, "create", {
  value: function create() {
    return new Person('Default');
  },
  enumerable: false, // 不可枚举
  writable: true,
  configurable: true
});

// 验证转换结果
console.log('Babel 转换验证:');
const person = new Person('Test');
console.log('实例方法:', person.sayHello()); // Hello, Test
console.log('静态方法:', Person.create().name); // Default

// 重要区别：Class 方法默认不可枚举
const es5Func = function() {};
es5Func.prototype.method = function() {};
console.log('ES5 方法可枚举:', Object.keys(es5Func.prototype)); // ['method']

class ES6Class {
  method() {}
}
console.log('ES6 Class 方法不可枚举:', Object.keys(ES6Class.prototype)); // []
```

---

## 五、最佳实践总结
### 5.1 何时使用 Class vs 构造函数
```javascript
// 场景1：现代项目 -> 使用 ES6+ Class
class ModernUser {
  #id; // 私有字段
  
  constructor(name, email) {
    this.name = name;
    this.email = email;
    this.#id = this.#generateId();
  }
  
  #generateId() {
    return `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
  
  sendEmail(subject, content) {
    // 发送邮件逻辑
    console.log(`发送邮件到 ${this.email}: ${subject}`);
  }
  
  // Getter/Setter 提供更好的封装
  get id() {
    return this.#id;
  }
  
  static validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}

// 场景2：需要兼容旧浏览器 -> 使用 ES5 构造函数 + polyfill
function LegacyUser(name, email) {
  // 兼容性检查
  if (!(this instanceof LegacyUser)) {
    console.warn('LegacyUser 应该使用 new 关键字调用');
    return new LegacyUser(name, email);
  }
  
  // 公共属性
  this.name = name;
  this.email = email;
  
  // 私有模式（使用闭包）
  var id = 'user_' + Date.now();
  
  // 公共方法访问私有数据
  this.getId = function() {
    return id;
  };
}

// 原型方法
LegacyUser.prototype.sendEmail = function(subject, content) {
  console.log(`发送邮件到 ${this.email}: ${subject}`);
};

// 静态方法
LegacyUser.validateEmail = function(email) {
  var emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// 场景3：小型工具函数 -> 使用工厂函数
function createUser(name, email) {
  // 返回普通对象，不使用 this 或 new
  const user = {
    name,
    email,
    sendEmail(subject, content) {
      console.log(`发送邮件到 ${this.email}: ${subject}`);
    }
  };
  
  return user;
}

// 使用建议
console.log('使用建议:');
console.log('1. 现代项目（ES6+）: 优先使用 Class');
console.log('2. 需要兼容性: 使用构造函数 + polyfill');
console.log('3. 简单对象: 使用工厂函数或对象字面量');
console.log('4. 库/框架开发: 根据目标环境选择');
```

### 5.2 继承的最佳实践
```javascript
// 原则1：优先使用组合 over 继承
console.log('=== 组合 vs 继承 ===');

// 不推荐：过度使用继承
class Animal {
  eat() { return 'eating'; }
}

class Dog extends Animal {
  bark() { return 'barking'; }
}

class RobotDog extends Dog {
  // 问题：机器人狗需要吃东西吗？
  charge() { return 'charging'; }
}

// 推荐：使用组合
class BetterDog {
  constructor() {
    this.animalBehaviors = new AnimalBehaviors();
    this.soundBehaviors = new SoundBehaviors();
  }
  
  eat() { return this.animalBehaviors.eat(); }
  bark() { return this.soundBehaviors.bark(); }
}

class BetterRobotDog {
  constructor() {
    this.movementBehaviors = new MovementBehaviors();
    this.soundBehaviors = new SoundBehaviors();
  }
  
  move() { return this.movementBehaviors.move(); }
  beep() { return this.soundBehaviors.beep(); }
}

// 原则2：使用抽象基类
class Shape {
  constructor(name) {
    if (new.target === Shape) {
      throw new Error('Shape 是抽象类，不能直接实例化');
    }
    this.name = name;
  }
  
  // 抽象方法（子类必须实现）
  area() {
    throw new Error('子类必须实现 area 方法');
  }
  
  // 具体方法
  display() {
    return `${this.name} 的面积是 ${this.area()}`;
  }
}

class Circle extends Shape {
  constructor(radius) {
    super('圆形');
    this.radius = radius;
  }
  
  area() {
    return Math.PI * this.radius ** 2;
  }
}

class Rectangle extends Shape {
  constructor(width, height) {
    super('矩形');
    this.width = width;
    this.height = height;
  }
  
  area() {
    return this.width * this.height;
  }
}

// 使用
const circle = new Circle(5);
console.log(circle.display()); // 圆形 的面积是 78.53981633974483

// 不能直接实例化抽象类
try {
  new Shape('抽象形状');
} catch (e) {
  console.log('抽象类保护:', e.message);
}
```

### 5.3 封装和数据保护
```javascript
// 多层封装策略
class SecureSystem {
  // 公有属性
  publicInfo = '公开信息';
  
  // 保护属性（约定，非强制）
  _protectedInfo = '保护信息（约定）';
  
  // 私有属性（真正私有）
  #privateInfo = '私有信息（真正私有）';
  
  // 私有字段的访问器
  getPrivateInfo() {
    // 可以添加访问控制逻辑
    return this.#privateInfo;
  }
  
  setPrivateInfo(value) {
    // 可以添加验证逻辑
    if (typeof value !== 'string') {
      throw new Error('必须是字符串');
    }
    this.#privateInfo = value;
  }
  
  // 保护属性的访问器
  getProtectedInfo() {
    // 保护属性通常用于子类访问
    return this._protectedInfo;
  }
  
  // 静态私有字段
  static #secretKey = '静态私有密钥';
  
  static getSecretKey() {
    // 静态私有字段的访问
    return SecureSystem.#secretKey;
  }
}

// 使用示例
const system = new SecureSystem();

console.log('公有属性:', system.publicInfo); // 可以直接访问
console.log('保护属性（约定）:', system._protectedInfo); // 可以访问，但不建议
console.log('保护属性（通过方法）:', system.getProtectedInfo()); // 建议方式
console.log('私有属性:', system.getPrivateInfo()); // 必须通过方法访问

// 静态私有字段访问
console.log('静态私有字段:', SecureSystem.getSecretKey());

// 封装验证
console.log('封装检查:');
console.log('  直接访问私有字段?', '#privateInfo' in system); // false
console.log('  私有字段在原型上?', Object.getPrototypeOf(system).hasOwnProperty('#privateInfo')); // false
```

### 5.4 错误处理和验证
```javascript
// 健壮的类设计
class ValidatedUser {
  constructor(name, email, age) {
    // 参数验证
    if (!name || typeof name !== 'string') {
      throw new TypeError('name 必须是非空字符串');
    }
    
    if (!email || !this.constructor.validateEmail(email)) {
      throw new TypeError('email 格式不正确');
    }
    
    if (age !== undefined && (typeof age !== 'number' || age < 0)) {
      throw new TypeError('age 必须是正数或 undefined');
    }
    
    // 初始化属性
    this.name = name;
    this.email = email;
    this.age = age;
    
    // 设置创建时间
    this.createdAt = new Date();
    
    // 生成唯一ID
    this.id = this.constructor.generateId();
  }
  
  // Getter 和 Setter 用于验证
  set name(value) {
    if (!value || typeof value !== 'string') {
      throw new TypeError('name 必须是非空字符串');
    }
    this._name = value.trim();
  }
  
  get name() {
    return this._name;
  }
  
  set email(value) {
    if (!value || !this.constructor.validateEmail(value)) {
      throw new TypeError('email 格式不正确');
    }
    this._email = value.toLowerCase();
  }
  
  get email() {
    return this._email;
  }
  
  // 静态验证方法
  static validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
  
  // 静态生成方法
  static generateId() {
    return `user_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
  }
  
  // 实例方法
  updateProfile(updates) {
    // 验证更新数据
    const validUpdates = {};
    
    if (updates.name !== undefined) {
      validUpdates.name = updates.name;
    }
    
    if (updates.email !== undefined) {
      validUpdates.email = updates.email;
    }
    
    if (updates.age !== undefined) {
      validUpdates.age = updates.age;
    }
    
    // 应用更新
    Object.assign(this, validUpdates);
    
    // 记录更新时间
    this.updatedAt = new Date();
    
    return this;
  }
  
  // 序列化方法
  toJSON() {
    return {
      id: this.id,
      name: this.name,
      email: this.email,
      age: this.age,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }
}

// 使用示例
try {
  const user = new ValidatedUser(' 张三 ', 'zhangsan@example.com', 25);
  console.log('用户创建成功:', user.toJSON());
  
  // 更新测试
  user.updateProfile({ name: '张三丰', age: 26 });
  console.log('更新后的用户:', user.toJSON());
  
  // 错误测试
  const badUser = new ValidatedUser('', 'invalid-email', -1);
} catch (error) {
  console.log('创建用户失败:', error.message);
}

// 验证 Getter/Setter
const testUser = new ValidatedUser('李四', 'lisi@example.com');
testUser.name = ' 李四修改 ';
console.log('Getter/Setter 测试:', testUser.name); // '李四修改'
```

---

## 六、核心概念梳理
### 6.1 原型链的完整图示
```javascript
// 构建完整的原型链示例
function GrandParent() {
  this.grandParentProp = '祖父属性';
}

GrandParent.prototype.grandParentMethod = function() {
  return '祖父方法';
};

function Parent() {
  GrandParent.call(this); // 继承实例属性
  this.parentProp = '父属性';
}

// 继承原型方法
Parent.prototype = Object.create(GrandParent.prototype);
Parent.prototype.constructor = Parent;

Parent.prototype.parentMethod = function() {
  return '父方法';
};

function Child() {
  Parent.call(this); // 继承实例属性
  this.childProp = '子属性';
}

// 继承原型方法
Child.prototype = Object.create(Parent.prototype);
Child.prototype.constructor = Child;

Child.prototype.childMethod = function() {
  return '子方法';
};

// 创建实例
const instance = new Child();

console.log('=== 原型链完整图示 ===');
console.log('1. 实例自身的属性:');
console.log('   instance.childProp:', instance.childProp);
console.log('   instance.parentProp:', instance.parentProp);
console.log('   instance.grandParentProp:', instance.grandParentProp);

console.log('\n2. 原型链查找:');
console.log('   instance.__proto__ === Child.prototype:', 
  instance.__proto__ === Child.prototype);
console.log('   instance.__proto__.__proto__ === Parent.prototype:', 
  instance.__proto__.__proto__ === Parent.prototype);
console.log('   instance.__proto__.__proto__.__proto__ === GrandParent.prototype:', 
  instance.__proto__.__proto__.__proto__ === GrandParent.prototype);
console.log('   instance.__proto__.__proto__.__proto__.__proto__ === Object.prototype:', 
  instance.__proto__.__proto__.__proto__.__proto__ === Object.prototype);
console.log('   instance.__proto__.__proto__.__proto__.__proto__.__proto__ === null:', 
  instance.__proto__.__proto__.__proto__.__proto__.__proto__ === null);

console.log('\n3. 方法调用（原型链查找）:');
console.log('   instance.childMethod():', instance.childMethod());
console.log('   instance.parentMethod():', instance.parentMethod());
console.log('   instance.grandParentMethod():', instance.grandParentMethod());
console.log('   instance.toString():', instance.toString()); // 来自 Object.prototype

console.log('\n4. instanceof 检查:');
console.log('   instance instanceof Child:', instance instanceof Child);
console.log('   instance instanceof Parent:', instance instanceof Parent);
console.log('   instance instanceof GrandParent:', instance instanceof GrandParent);
console.log('   instance instanceof Object:', instance instanceof Object);

// 可视化原型链
console.log('\n5. 原型链可视化:');
let current = instance;
let level = 0;
while (current) {
  console.log(`   ${'  '.repeat(level)}Level ${level}:`, 
    current.constructor ? current.constructor.name : 'null');
  current = Object.getPrototypeOf(current);
  level++;
}
```

### 6.2 new 关键字的模拟实现（详细版）
```javascript
// 详细模拟 new 关键字的工作机制
function myNew(constructor, ...args) {
  console.log('=== myNew 模拟开始 ===');
  
  // 1. 创建新对象
  console.log('步骤1: 创建新的空对象');
  const obj = {};
  
  // 2. 设置原型链（指向构造函数的 prototype）
  console.log('步骤2: 设置原型链 (obj.__proto__ = constructor.prototype)');
  Object.setPrototypeOf(obj, constructor.prototype);
  
  // 3. 绑定 this 并执行构造函数
  console.log('步骤3: 执行构造函数，绑定 this');
  console.log('  构造函数参数:', args);
  const result = constructor.apply(obj, args);
  
  // 4. 处理返回值
  console.log('步骤4: 处理返回值');
  if (result && (typeof result === 'object' || typeof result === 'function')) {
    console.log('  构造函数返回对象/函数，使用返回值:', result);
    return result;
  } else {
    console.log('  构造函数返回非对象或未返回，使用新创建的对象:', obj);
    return obj;
  }
}

// 测试构造函数
function TestConstructor(name, value) {
  this.name = name;
  this.value = value;
  console.log('  构造函数内部 this:', this);
  
  // 测试返回值
  // return { custom: '自定义对象' }; // 如果取消注释，将返回这个对象
}

// 添加原型方法
TestConstructor.prototype.greet = function() {
  return `Hello from ${this.name}`;
};

// 使用自定义 new
console.log('\n=== 测试 myNew ===');
const instance1 = myNew(TestConstructor, '实例1', 100);
console.log('创建的结果:', instance1);
console.log('原型方法:', instance1.greet());
console.log('instanceof 检查:', instance1 instanceof TestConstructor);

// 与原生 new 对比
console.log('\n=== 原生 new 对比 ===');
const instance2 = new TestConstructor('实例2', 200);
console.log('创建的结果:', instance2);
console.log('原型方法:', instance2.greet());
console.log('instanceof 检查:', instance2 instanceof TestConstructor);
```

### 6.3 完整的面向对象系统示例
```javascript
// 完整的电子商务系统示例
console.log('=== 完整的电子商务系统 ===');

// 1. 产品类
class Product {
  #id;
  #stock;
  
  constructor(name, price, description = '', initialStock = 0) {
    // 参数验证
    if (!name || typeof name !== 'string') {
      throw new Error('产品名称必须是非空字符串');
    }
    
    if (typeof price !== 'number' || price < 0) {
      throw new Error('价格必须是正数');
    }
    
    // 初始化属性
    this.name = name;
    this.price = price;
    this.description = description;
    this.#stock = Math.max(0, initialStock);
    this.#id = `prod_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // 元数据
    this.createdAt = new Date();
    this.updatedAt = new Date();
  }
  
  // Getter 和 Setter
  get id() { return this.#id; }
  get stock() { return this.#stock; }
  
  // 库存管理
  addStock(quantity) {
    if (quantity <= 0) {
      throw new Error('添加的库存数量必须大于0');
    }
    this.#stock += quantity;
    this.updatedAt = new Date();
    return this.#stock;
  }
  
  removeStock(quantity) {
    if (quantity <= 0) {
      throw new Error('移除的库存数量必须大于0');
    }
    
    if (quantity > this.#stock) {
      throw new Error('库存不足');
    }
    
    this.#stock -= quantity;
    this.updatedAt = new Date();
    return this.#stock;
  }
  
  // 产品信息
  getInfo() {
    return {
      id: this.#id,
      name: this.name,
      price: this.price,
      description: this.description,
      stock: this.#stock,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }
  
  // 格式化显示
  display() {
    return `${this.name} - ¥${this.price.toFixed(2)} (库存: ${this.#stock})`;
  }
}

// 2. 购物车类
class ShoppingCart {
  #items = new Map(); // 使用 Map 存储商品和数量
  #discountCode = null;
  #taxRate = 0.1; // 税率 10%
  
  constructor(cartId) {
    this.cartId = cartId || `cart_${Date.now()}`;
    this.createdAt = new Date();
  }
  
  // 添加商品
  addItem(product, quantity = 1) {
    if (!(product instanceof Product)) {
      throw new Error('只能添加 Product 实例');
    }
    
    if (quantity <= 0) {
      throw new Error('数量必须大于0');
    }
    
    if (quantity > product.stock) {
      throw new Error('商品库存不足');
    }
    
    const currentQuantity = this.#items.get(product) || 0;
    this.#items.set(product, currentQuantity + quantity);
    
    // 从库存中移除
    product.removeStock(quantity);
    
    return this;
  }
  
  // 移除商品
  removeItem(product, quantity = 1) {
    if (!this.#items.has(product)) {
      throw new Error('购物车中不存在该商品');
    }
    
    const currentQuantity = this.#items.get(product);
    
    if (quantity >= currentQuantity) {
      // 完全移除
      this.#items.delete(product);
      // 退回库存
      product.addStock(currentQuantity);
    } else {
      // 部分移除
      this.#items.set(product, currentQuantity - quantity);
      // 退回库存
      product.addStock(quantity);
    }
    
    return this;
  }
  
  // 计算小计
  getSubtotal() {
    let subtotal = 0;
    
    for (const [product, quantity] of this.#items) {
      subtotal += product.price * quantity;
    }
    
    return subtotal;
  }
  
  // 计算折扣
  getDiscount() {
    if (!this.#discountCode) {
      return 0;
    }
    
    // 这里可以实现复杂的折扣逻辑
    const discountRules = {
      'SAVE10': 0.1, // 10% 折扣
      'SAVE20': 0.2, // 20% 折扣
      'FIXED50': 50  // 固定减 50
    };
    
    const rule = discountRules[this.#discountCode];
    if (!rule) {
      return 0;
    }
    
    const subtotal = this.getSubtotal();
    
    if (rule <= 1) {
      // 百分比折扣
      return subtotal * rule;
    } else {
      // 固定金额折扣
      return Math.min(rule, subtotal);
    }
  }
  
  // 计算税
  getTax() {
    const subtotal = this.getSubtotal();
    const discount = this.getDiscount();
    return (subtotal - discount) * this.#taxRate;
  }
  
  // 计算总计
  getTotal() {
    const subtotal = this.getSubtotal();
    const discount = this.getDiscount();
    const tax = this.getTax();
    
    return subtotal - discount + tax;
  }
  
  // 应用折扣码
  applyDiscount(code) {
    // 验证折扣码逻辑
    const validCodes = ['SAVE10', 'SAVE20', 'FIXED50'];
    
    if (validCodes.includes(code)) {
      this.#discountCode = code;
      return true;
    }
    
    return false;
  }
  
  // 清空购物车
  clear() {
    // 退回所有商品库存
    for (const [product, quantity] of this.#items) {
      product.addStock(quantity);
    }
    
    this.#items.clear();
    this.#discountCode = null;
    
    return this;
  }
  
  // 获取购物车详情
  getDetails() {
    const items = [];
    
    for (const [product, quantity] of this.#items) {
      items.push({
        product: product.getInfo(),
        quantity,
        total: product.price * quantity
      });
    }
    
    const subtotal = this.getSubtotal();
    const discount = this.getDiscount();
    const tax = this.getTax();
    const total = this.getTotal();
    
    return {
      cartId: this.cartId,
      items,
      summary: {
        subtotal,
        discount,
        tax,
        total
      },
      discountCode: this.#discountCode,
      createdAt: this.createdAt,
      itemCount: items.length
    };
  }
  
  // 结账
  checkout() {
    if (this.#items.size === 0) {
      throw new Error('购物车为空，无法结账');
    }
    
    const orderDetails = this.getDetails();
    const orderId = `order_${Date.now()}`;
    
    // 在实际应用中，这里会调用支付接口
    console.log(`=== 订单 ${orderId} 结账 ===`);
    console.log('订单详情:', orderDetails);
    
    // 清空购物车（但保留记录）
    const checkoutTime = new Date();
    
    return {
      orderId,
      ...orderDetails,
      checkoutTime,
      paymentStatus: 'pending' // 实际中会有支付状态
    };
  }
}

// 3. 用户类
class User {
  #password;
  #cart;
  
  constructor(username, email, password) {
    this.username = username;
    this.email = email;
    this.#password = this.#hashPassword(password);
    this.#cart = new ShoppingCart();
    this.orders = [];
    this.createdAt = new Date();
  }
  
  // 私有方法：密码哈希
  #hashPassword(password) {
    // 教学示例：使用确定性哈希，便于演示“存储后可校验”
    // 实际应用中应该使用 bcrypt/argon2 等带盐且抗暴力破解的算法
    return `hashed_${password}`;
  }
  
  // 验证密码
  verifyPassword(password) {
    const hashed = this.#hashPassword(password);
    return this.#password === hashed;
  }
  
  // 获取购物车
  getCart() {
    return this.#cart;
  }
  
  // 添加订单
  addOrder(order) {
    this.orders.push({
      ...order,
      orderTime: new Date()
    });
  }
  
  // 获取用户信息
  getProfile() {
    return {
      username: this.username,
      email: this.email,
      orderCount: this.orders.length,
      totalSpent: this.orders.reduce((sum, order) => sum + order.summary.total, 0),
      createdAt: this.createdAt
    };
  }
}

// 4. 使用示例
console.log('\n=== 系统使用示例 ===');

// 创建商品
try {
  const laptop = new Product('笔记本电脑', 5999.99, '高性能游戏本', 10);
  const mouse = new Product('游戏鼠标', 299.99, '电竞游戏鼠标', 50);
  const keyboard = new Product('机械键盘', 499.99, 'RGB背光键盘', 30);
  
  console.log('创建的商品:');
  console.log('1.', laptop.display());
  console.log('2.', mouse.display());
  console.log('3.', keyboard.display());
  
  // 创建用户
  const user = new User('张三', 'zhangsan@example.com', 'password123');
  console.log('\n创建的用户:', user.getProfile());
  
  // 用户购物
  const cart = user.getCart();
  
  cart.addItem(laptop, 1);
  cart.addItem(mouse, 2);
  cart.addItem(keyboard, 1);
  
  console.log('\n购物车初始状态:');
  console.log('小计:', cart.getSubtotal().toFixed(2));
  console.log('商品数量:', cart.getDetails().itemCount);
  
  // 应用折扣
  cart.applyDiscount('SAVE10');
  console.log('\n应用 10% 折扣后:');
  console.log('折扣:', cart.getDiscount().toFixed(2));
  console.log('税:', cart.getTax().toFixed(2));
  console.log('总计:', cart.getTotal().toFixed(2));
  
  // 查看购物车详情
  console.log('\n购物车详情:', cart.getDetails());
  
  // 移除商品
  cart.removeItem(mouse, 1);
  console.log('\n移除1个鼠标后:');
  console.log('商品数量:', cart.getDetails().itemCount);
  console.log('总计:', cart.getTotal().toFixed(2));
  
  // 结账
  console.log('\n=== 结账流程 ===');
  const order = cart.checkout();
  user.addOrder(order);
  
  console.log('订单完成:', order.orderId);
  console.log('用户订单历史:', user.orders.length, '个订单');
  
  // 验证库存更新
  console.log('\n=== 库存验证 ===');
  console.log('笔记本电脑库存:', laptop.stock);
  console.log('鼠标库存:', mouse.stock);
  console.log('键盘库存:', keyboard.stock);
  
  // 清空购物车
  cart.clear();
  console.log('\n清空购物车后商品数量:', cart.getDetails().itemCount);
  
} catch (error) {
  console.error('系统错误:', error.message);
}
```

---

## 七、常见面试问题
### 7.1 构造函数和普通函数的区别？
```javascript
console.log('=== 面试问题1：构造函数和普通函数的区别 ===\n');

function demoFunction(value) {
  this.value = value;
  
  // 普通方法
  this.showValue = function() {
    return this.value;
  };
}

// 区别1：调用方式
console.log('区别1：调用方式不同');
console.log('普通函数调用:', demoFunction('直接调用')); // undefined（没有返回值）
console.log('在浏览器中，直接调用会使 this.value 成为全局变量');

// 区别2：this 指向
console.log('\n区别2：this 指向不同');
console.log('普通函数调用时，this 指向：');
console.log('  - 非严格模式：全局对象（window/global）');
console.log('  - 严格模式：undefined（Node.js 还受模块类型与运行方式影响）');

const obj = { method: demoFunction };
obj.method('方法调用');
console.log('  方法调用时，this 指向调用者:', obj.value); // '方法调用'

// 区别3：返回值
console.log('\n区别3：返回值不同');
const instance = new demoFunction('构造函数调用');
console.log('构造函数默认返回新对象:', instance);
console.log('构造函数可以显式返回对象，否则返回 this');

// 区别4：原型链
console.log('\n区别4：原型链设置');
console.log('构造函数创建的实例有原型链:', instance instanceof demoFunction);
console.log('普通函数调用没有创建原型链');

// 区别5：命名约定
console.log('\n区别5：命名约定');
console.log('构造函数通常首字母大写: Person, Car, Animal');
console.log('普通函数通常小写或驼峰: getData, calculateTotal');
```

### 7.2 Class 是真正的类吗？
```javascript
console.log('\n=== 面试问题2：Class 是真正的类吗？ ===\n');

// 演示 Class 的本质
class ES6Class {
  constructor(value) {
    this.value = value;
  }
  
  method() {
    return this.value;
  }
  
  static staticMethod() {
    return '静态方法';
  }
}

console.log('1. Class 的本质是函数:');
console.log('   typeof ES6Class:', typeof ES6Class); // function
console.log('   ES6Class.prototype.constructor === ES6Class:', 
  ES6Class.prototype.constructor === ES6Class); // true

console.log('\n2. Class 是语法糖:');
console.log('   ES6 Class 编译成 ES5:');
console.log('   class Person {} -> function Person() {}');
console.log('   method() {} -> Person.prototype.method = function() {}');
console.log('   extends -> 原型链继承');

console.log('\n3. 与传统面向对象语言的对比:');
console.log('   JavaScript (基于原型):');
console.log('     - 使用原型链实现继承');
console.log('     - 没有真正的类（ES6 Class 是语法糖）');
console.log('     - 动态性：运行时可以修改原型');
console.log('   Java/C++ (基于类):');
console.log('     - 有真正的类概念');
console.log('     - 编译时确定类型');
console.log('     - 静态继承');

console.log('\n4. 验证 Class 的工作方式:');
const instance = new ES6Class('test');
console.log('   实例的原型:', Object.getPrototypeOf(instance) === ES6Class.prototype);
console.log('   方法在原型上:', ES6Class.prototype.hasOwnProperty('method'));

console.log('\n5. 结论:');
console.log('   JavaScript 的 Class 不是真正的类，而是基于原型的语法糖。');
console.log('   理解这一点对于掌握 JavaScript 面向对象编程至关重要。');
```

### 7.3 什么时候用继承？什么时候用组合？
```javascript
console.log('\n=== 面试问题3：继承 vs 组合 ===\n');

console.log('继承（is-a 关系）:');
console.log('  当一个对象是另一个对象的特殊类型时使用');
console.log('  示例：Dog is an Animal');

// 继承示例
class Animal {
  constructor(name) {
    this.name = name;
  }
  
  eat() {
    return `${this.name} 在吃东西`;
  }
}

class Dog extends Animal {
  bark() {
    return `${this.name} 汪汪叫`;
  }
}

console.log('  优点：代码复用，层次清晰');
console.log('  缺点：紧密耦合，可能过度设计');

console.log('\n组合（has-a 关系）:');
console.log('  当一个对象包含另一个对象时使用');
console.log('  示例：Car has an Engine');

// 组合示例
class Engine {
  start() {
    return '引擎启动';
  }
}

class Car {
  constructor() {
    this.engine = new Engine();
  }
  
  start() {
    return `汽车：${this.engine.start()}`;
  }
}

console.log('  优点：灵活，松耦合，易于测试');
console.log('  缺点：需要更多代码，关系不直观');

console.log('\n继承的问题：');
console.log('  1. 脆弱基类问题：父类修改可能影响所有子类');
console.log('  2. 多重继承问题：JavaScript 不支持（但可以通过混入模拟）');
console.log('  3. 过度继承：可能导致复杂的继承链');

console.log('\n组合的优点：');
console.log('  1. 更灵活：可以在运行时改变行为');
console.log('  2. 更安全：修改组件不会影响其他部分');
console.log('  3. 更易测试：可以单独测试每个组件');

console.log('\n现代最佳实践：');
console.log('  - 优先使用组合 over 继承');
console.log('  - 继承只用于真正的 is-a 关系');
console.log('  - 使用接口/抽象类定义契约');

// 实际示例
console.log('\n实际示例：');

// 不好的继承设计
class Bird {
  fly() {
    return '飞';
  }
}

class Penguin extends Bird {
  // 企鹅不会飞，但继承了 fly 方法
  fly() {
    throw new Error('企鹅不会飞！');
  }
}

// 好的组合设计
class FlyingBehavior {
  fly() {
    return '飞';
  }
}

class SwimmingBehavior {
  swim() {
    return '游泳';
  }
}

class BetterBird {
  constructor() {
    this.flyingBehavior = new FlyingBehavior();
    this.swimmingBehavior = new SwimmingBehavior();
  }
  
  move() {
    return this.flyingBehavior.fly();
  }
}

class BetterPenguin {
  constructor() {
    this.swimmingBehavior = new SwimmingBehavior();
  }
  
  move() {
    return this.swimmingBehavior.swim();
  }
}
```

### 7.4 如何实现真正的私有属性？
```javascript
console.log('\n=== 面试问题4：实现私有属性 ===\n');

console.log('方法1：闭包（ES5 及之前）');
function ClosureExample() {
  // 私有变量
  let privateVar = '私有数据';
  let privateCounter = 0;
  
  // 公共方法访问私有数据
  this.getPrivateVar = function() {
    return privateVar;
  };
  
  this.incrementCounter = function() {
    return ++privateCounter;
  };
  
  // 公共属性
  this.publicVar = '公共数据';
}

const closureInstance = new ClosureExample();
console.log('  闭包私有数据:', closureInstance.getPrivateVar());
console.log('  无法直接访问:', closureInstance.privateVar); // undefined
console.log('  缺点：每个实例都有独立的方法，内存效率低');

console.log('\n方法2：Symbol（ES6）');
const _privateVar = Symbol('privateVar');
const _privateMethod = Symbol('privateMethod');

class SymbolExample {
  constructor() {
    this[_privateVar] = 'Symbol 私有数据';
    this.publicVar = '公共数据';
  }
  
  // 公共方法
  getPrivateData() {
    return this[_privateVar];
  }
  
  // "私有"方法
  [_privateMethod]() {
    return 'Symbol 私有方法';
  }
  
  callPrivateMethod() {
    return this[_privateMethod]();
  }
}

const symbolInstance = new SymbolExample();
console.log('  Symbol 私有数据:', symbolInstance.getPrivateData());
console.log('  Symbol 私有方法:', symbolInstance.callPrivateMethod());
console.log('  Symbol 缺点：可以通过 Object.getOwnPropertySymbols() 访问');

console.log('\n方法3：WeakMap（ES6）');
const privateData = new WeakMap();

class WeakMapExample {
  constructor() {
    // 存储私有数据
    privateData.set(this, {
      privateVar: 'WeakMap 私有数据',
      privateCounter: 0
    });
    
    this.publicVar = '公共数据';
  }
  
  // 公共方法访问私有数据
  getPrivateVar() {
    return privateData.get(this).privateVar;
  }
  
  incrementCounter() {
    const data = privateData.get(this);
    return ++data.privateCounter;
  }
}

const weakMapInstance = new WeakMapExample();
console.log('  WeakMap 私有数据:', weakMapInstance.getPrivateVar());
console.log('  WeakMap 优点：真正的私有，外部无法访问');
console.log('  WeakMap 缺点：语法复杂，调试困难');

console.log('\n方法4：# 语法（ES2022+，真正的私有字段）');
class HashExample {
  #privateVar = '真正的私有数据';
  #privateCounter = 0;
  
  constructor() {
    this.publicVar = '公共数据';
  }
  
  // 公共方法访问私有字段
  getPrivateVar() {
    return this.#privateVar;
  }
  
  incrementCounter() {
    return ++this.#privateCounter;
  }
  
  // 私有方法
  #privateMethod() {
    return '真正的私有方法';
  }
  
  callPrivateMethod() {
    return this.#privateMethod();
  }
}

const hashInstance = new HashExample();
console.log('  # 语法私有数据:', hashInstance.getPrivateVar());
console.log('  # 语法私有方法:', hashInstance.callPrivateMethod());
// 注意：下面这种写法会在“解析阶段”直接抛出 SyntaxError，try/catch 也拦不住：
// hashInstance.#privateVar
// 若想演示“错误可被捕获”，可以放进动态求值：
try {
  eval('hashInstance.#privateVar');
} catch (e) {
  console.log('  直接访问错误:', e.name, e.message);
}
console.log('  # 语法优点：语言原生支持，真正的私有');
console.log('  # 语法缺点：需要现代环境支持');

console.log('\n方法5：命名约定（最简单，但不安全）');
class ConventionExample {
  constructor() {
    this._privateVar = '约定私有数据'; // 下划线约定
    this.publicVar = '公共数据';
  }
  
  getPrivateVar() {
    return this._privateVar;
  }
}

const conventionInstance = new ConventionExample();
console.log('  约定私有数据:', conventionInstance.getPrivateVar());
console.log('  可以直接访问:', conventionInstance._privateVar);
console.log('  优点：简单直观');
console.log('  缺点：只是约定，不提供真正的保护');

console.log('\n总结：');
console.log('  1. 现代项目：使用 # 语法（ES2022+）');
console.log('  2. 需要兼容性：使用 WeakMap 或闭包');
console.log('  3. 简单场景：使用命名约定');
console.log('  4. 库开发：根据目标环境选择合适方法');
```

### 7.5 其他常见面试问题
```javascript
console.log('\n=== 其他常见面试问题 ===\n');

// 问题1：Object.create() 和 new 的区别
console.log('问题1：Object.create() 和 new 的区别');
function Parent(name) {
  this.name = name;
}

// 使用 new
const child1 = new Parent('new创建');
console.log('  new Parent():', child1.name, child1 instanceof Parent);

// 使用 Object.create
const child2 = Object.create(Parent.prototype);
Parent.call(child2, 'Object.create创建');
console.log('  Object.create():', child2.name, child2 instanceof Parent);

console.log('  区别：');
console.log('    - new: 创建新对象 + 调用构造函数');
console.log('    - Object.create: 只创建对象，不调用构造函数');

// 问题2：prototype 和 __proto__ 的区别
console.log('\n问题2：prototype 和 __proto__ 的区别');
function Example() {}
const obj = new Example();

console.log('  Example.prototype:', typeof Example.prototype); // object
console.log('  obj.__proto__:', typeof obj.__proto__); // object
console.log('  Example.prototype === obj.__proto__:', 
  Example.prototype === obj.__proto__); // true

console.log('  区别：');
console.log('    - prototype: 函数属性，用于构造函数');
console.log('    - __proto__: 对象属性，指向对象的原型');

// 问题3：如何实现多重继承
console.log('\n问题3：如何实现多重继承');
// 使用混入（Mixin）模式
const CanEat = {
  eat() {
    return `${this.name} 在吃东西`;
  }
};

const CanSleep = {
  sleep() {
    return `${this.name} 在睡觉`;
  }
};

class AnimalBase {
  constructor(name) {
    this.name = name;
  }
}

// 使用 Object.assign 实现混入
class Dog extends AnimalBase {
  constructor(name) {
    super(name);
  }
}

// 混入方法
Object.assign(Dog.prototype, CanEat, CanSleep);

const dog = new Dog('Buddy');
console.log('  混入继承:', dog.eat(), dog.sleep());

// 问题4：如何判断属性是自身的还是继承的
console.log('\n问题4：判断自身属性 vs 继承属性');
function Test() {
  this.ownProp = '自身属性';
}
Test.prototype.inheritedProp = '继承属性';

const testObj = new Test();

console.log('  hasOwnProperty("ownProp"):', testObj.hasOwnProperty('ownProp')); // true
console.log('  hasOwnProperty("inheritedProp"):', testObj.hasOwnProperty('inheritedProp')); // false
console.log('  "ownProp" in testObj:', 'ownProp' in testObj); // true
console.log('  "inheritedProp" in testObj:', 'inheritedProp' in testObj); // true

// 问题5：如何防止对象被修改
console.log('\n问题5：防止对象被修改');
const obj1 = { name: '原始对象' };

// 1. Object.preventExtensions：不能添加新属性
Object.preventExtensions(obj1);
obj1.age = 25; // 静默失败（严格模式下报错）
console.log('  preventExtensions 后添加属性:', obj1.age); // undefined

// 2. Object.seal：不能添加/删除属性
const obj2 = { name: '密封对象' };
Object.seal(obj2);
delete obj2.name; // 静默失败（严格模式下报错）
obj2.name = '修改名称'; // 可以修改
console.log('  seal 后删除属性:', delete obj2.name); // false
console.log('  seal 后修改属性:', obj2.name); // '修改名称'

// 3. Object.freeze：完全冻结
const obj3 = { name: '冻结对象' };
Object.freeze(obj3);
obj3.name = '尝试修改'; // 静默失败（严格模式下报错）
console.log('  freeze 后修改属性:', obj3.name); // '冻结对象'
```

### 7.6 易错点速记（纠错版）
1. `super()` 只能在派生类 `constructor` 里调用；但 `super.xxx()` 可以在实例方法/静态方法中调用父类成员。  
2. `obj.#field` 写在类外是语法错误（`SyntaxError`），属于“解析阶段报错”，不是普通运行时异常。  
3. 直接调用构造函数的 `this` 行为依赖是否严格模式与运行环境，不要简单写成“在 Node.js 一定是 undefined”。  
4. `instanceof` 判断的是“原型链关系”，不是“结构相同就算同类”；跨 iframe/realm 时结果可能与预期不同。  
5. 教学示例里的“哈希函数”若包含时间戳/随机数，会导致同一密码每次结果不同，无法直接做 `===` 校验（除非同时保存 salt 并用正确校验流程）。

---

## 总结
通过这份详细的笔记，你应该已经掌握了：

### 核心概念
1. **构造函数的本质**：普通函数通过 `new` 调用
2. **原型链机制**：JavaScript 对象继承的基础
3. **Class 语法糖**：更优雅的面向对象编程方式
4. **this 指向**：取决于调用方式
5. **继承 vs 组合**：选择合适的代码复用方式

### 关键技能
1. **正确使用构造函数**：避免全局污染
2. **实现真正的封装**：使用私有字段和方法
3. **设计健壮的类**：包含验证和错误处理
4. **模拟 new 运算符**：深入理解其工作原理
5. **处理面试问题**：展示对 JavaScript 面向对象的深刻理解

### 最佳实践
1. **现代项目**：优先使用 ES6+ Class
2. **封装数据**：使用私有字段保护重要数据
3. **合理继承**：只在真正的 is-a 关系中使用继承
4. **错误处理**：在构造函数和方法中添加验证
5. **代码组织**：使用静态方法、getter/setter 提高可读性

JavaScript 的面向对象编程有其独特之处，理解原型链和 Class 的关系是关键。随着 ES2022+ 新特性的引入，JavaScript 的面向对象编程能力越来越强大，同时也需要开发者理解其背后的原理。
