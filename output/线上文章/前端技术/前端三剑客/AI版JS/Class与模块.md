---
title: "Class与模块"
slug: "js-class-0867afc9"
summary: ""
category: "AI版JS"
categoryPath:
  - "前端技术"
  - "前端三剑客"
  - "AI版JS"
tags: []
status: "published"
sortOrder: 180
cover: ""
originalId: "6a2d291e8a2b1c68f2cac0fa"
originalSlug: "js-class-0867afc9"
originalStatus: "published"
publishedAt: "2026-01-25T13:23:07.493Z"
updatedAt: "2026-06-15T14:50:24.970Z"
exportedAt: "2026-07-30T15:42:33.614Z"
---
# 第21章 Class与模块

> ES6 引入的 class 语法为 JavaScript 提供了更清晰的面向对象编程方式。虽然本质上仍是基于原型的继承，但 class 语法让代码更加直观和易于理解。

---

## 21.1 class 语法

### 21.1.1 基本 class 语法

```javascript
/**
 * 基础 class 定义
 */
class Person {
    // 构造函数
    constructor(name, age) {
        this.name = name;
        this.age = age;
    }
    
    // 实例方法
    introduce() {
        return `我是${this.name}，今年${this.age}岁`;
    }
    
    // getter 访问器
    get info() {
        return `${this.name} (${this.age})`;
    }
    
    // setter 访问器
    set newAge(age) {
        if (age > 0) {
            this.age = age;
        }
    }
}

// 使用 class
const person = new Person('张三', 25);
console.log(person.introduce()); // 我是张三，今年25岁
console.log(person.info); // 张三 (25)
person.newAge = 26;
console.log(person.age); // 26
```

### 21.1.2 class 与构造函数的对比

```javascript
/**
 * 传统构造函数方式
 */
function PersonFunc(name, age) {
    this.name = name;
    this.age = age;
}

PersonFunc.prototype.introduce = function() {
    return `我是${this.name}，今年${this.age}岁`;
};

/**
 * ES6 class 方式（等价实现）
 */
class PersonClass {
    constructor(name, age) {
        this.name = name;
        this.age = age;
    }
    
    introduce() {
        return `我是${this.name}，今年${this.age}岁`;
    }
}

// 两种方式创建的对象功能相同
const p1 = new PersonFunc('李四', 30);
const p2 = new PersonClass('王五', 30);

console.log(p1.introduce === p1.__proto__.introduce); // true
console.log(p2.introduce === p2.__proto__.introduce); // true
```

### 21.1.3 class 表达式

```javascript
/**
 * 具名 class 表达式
 */
const Rectangle = class Rect {
    constructor(width, height) {
        this.width = width;
        this.height = height;
    }
    
    get area() {
        return this.width * this.height;
    }
};

/**
 * 匿名 class 表达式
 */
const Circle = class {
    constructor(radius) {
        this.radius = radius;
    }
    
    get area() {
        return Math.PI * this.radius ** 2;
    }
};

/**
 * 立即执行的 class
 */
const instance = new (class {
    constructor(value) {
        this.value = value;
    }
    
    getValue() {
        return this.value;
    }
})('Hello');

console.log(instance.getValue()); // Hello
```

---

## 21.2 继承 extends

### 21.2.1 基本继承

```javascript
/**
 * 基类定义
 */
class Animal {
    constructor(name, species) {
        this.name = name;
        this.species = species;
    }
    
    speak() {
        return `${this.name} makes a sound`;
    }
    
    getInfo() {
        return `${this.name} is a ${this.species}`;
    }
}

/**
 * 继承类定义
 */
class Dog extends Animal {
    constructor(name, breed) {
        // 调用父类构造函数
        super(name, 'dog');
        this.breed = breed;
    }
    
    // 重写父类方法
    speak() {
        return `${this.name} barks: Woof!`;
    }
    
    // 新增方法
    fetch() {
        return `${this.name} fetches the ball`;
    }
}

const dog = new Dog('旺财', '金毛');
console.log(dog.speak()); // 旺财 barks: Woof!
console.log(dog.getInfo()); // 旺财 is a dog
console.log(dog.fetch()); // 旺财 fetches the ball
```

### 21.2.2 super 关键字详解

```javascript
/**
 * super 的多种用法
 */
class Vehicle {
    constructor(brand, model) {
        this.brand = brand;
        this.model = model;
    }
    
    start() {
        return `${this.brand} ${this.model} is starting...`;
    }
    
    getDescription() {
        return `This is a ${this.brand} ${this.model}`;
    }
}

class Car extends Vehicle {
    constructor(brand, model, doors) {
        // super() 调用父类构造函数
        super(brand, model);
        this.doors = doors;
    }
    
    start() {
        // super.method() 调用父类方法
        const parentStart = super.start();
        return `${parentStart} Engine started!`;
    }
    
    getFullDescription() {
        // 在方法中使用 super
        const baseDesc = super.getDescription();
        return `${baseDesc} with ${this.doors} doors`;
    }
}

const car = new Car('Toyota', 'Camry', 4);
console.log(car.start()); // Toyota Camry is starting... Engine started!
console.log(car.getFullDescription()); // This is a Toyota Camry with 4 doors
```

### 21.2.3 多层继承

```javascript
/**
 * 多层继承示例
 */
class Shape {
    constructor(color) {
        this.color = color;
    }
    
    getColor() {
        return this.color;
    }
}

class Polygon extends Shape {
    constructor(color, sides) {
        super(color);
        this.sides = sides;
    }
    
    getSides() {
        return this.sides;
    }
}

class Triangle extends Polygon {
    constructor(color, side1, side2, side3) {
        super(color, 3);
        this.sides = [side1, side2, side3];
    }
    
    getArea() {
        // 海伦公式计算三角形面积
        const [a, b, c] = this.sides;
        const s = (a + b + c) / 2;
        return Math.sqrt(s * (s - a) * (s - b) * (s - c));
    }
    
    isValid() {
        const [a, b, c] = this.sides;
        return a + b > c && b + c > a && a + c > b;
    }
}

const triangle = new Triangle('red', 3, 4, 5);
console.log(triangle.getColor()); // red
console.log(triangle.getSides()); // 3
console.log(triangle.getArea()); // 6
console.log(triangle.isValid()); // true
```

---

## 21.3 静态方法

### 21.3.1 静态方法基础

```javascript
/**
 * 静态方法定义和使用
 */
class MathUtils {
    // 静态方法
    static add(a, b) {
        return a + b;
    }
    
    static multiply(a, b) {
        return a * b;
    }
    
    static factorial(n) {
        if (n <= 1) return 1;
        return n * MathUtils.factorial(n - 1);
    }
    
    // 静态属性（ES2022）
    static PI = Math.PI;
    static E = Math.E;
}

// 直接通过类调用静态方法
console.log(MathUtils.add(5, 3)); // 8
console.log(MathUtils.factorial(5)); // 120
console.log(MathUtils.PI); // 3.141592653589793

// 实例无法访问静态方法
const utils = new MathUtils();
// console.log(utils.add(1, 2)); // TypeError
```

### 21.3.2 静态方法在继承中的行为

```javascript
/**
 * 静态方法的继承
 */
class Animal {
    constructor(name) {
        this.name = name;
    }
    
    static getKingdom() {
        return 'Animalia';
    }
    
    static createRandom() {
        const names = ['Buddy', 'Max', 'Charlie'];
        const randomName = names[Math.floor(Math.random() * names.length)];
        return new this(randomName);
    }
}

class Dog extends Animal {
    constructor(name, breed = 'Mixed') {
        super(name);
        this.breed = breed;
    }
    
    static getSpecies() {
        return 'Canis familiaris';
    }
}

// 子类继承父类的静态方法
console.log(Dog.getKingdom()); // Animalia
console.log(Dog.getSpecies()); // Canis familiaris

// 静态方法中的 this 指向当前类
const randomDog = Dog.createRandom();
console.log(randomDog instanceof Dog); // true
```

### 21.3.3 实用静态方法模式

```javascript
/**
 * 工厂模式与静态方法
 */
class User {
    constructor(id, name, email) {
        this.id = id;
        this.name = name;
        this.email = email;
        this.createdAt = new Date();
    }
    
    // 静态工厂方法
    static fromJSON(json) {
        const data = typeof json === 'string' ? JSON.parse(json) : json;
        return new User(data.id, data.name, data.email);
    }
    
    static fromArray([id, name, email]) {
        return new User(id, name, email);
    }
    
    static createGuest() {
        return new User(0, 'Guest', 'guest@example.com');
    }
    
    // 静态验证方法
    static isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }
    
    static compare(user1, user2) {
        return user1.createdAt - user2.createdAt;
    }
}

// 使用静态工厂方法
const user1 = User.fromJSON('{"id":1,"name":"张三","email":"zhang@test.com"}');
const user2 = User.fromArray([2, '李四', 'li@test.com']);
const guest = User.createGuest();

console.log(User.isValidEmail('test@example.com')); // true
```

---

## 21.4 私有属性

### 21.4.1 私有字段（Private Fields）

```javascript
/**
 * ES2022 私有字段语法
 */
class BankAccount {
    // 私有字段
    #balance = 0;
    #accountNumber;
    
    constructor(accountNumber, initialBalance = 0) {
        this.#accountNumber = accountNumber;
        this.#balance = initialBalance;
    }
    
    // 公共方法访问私有字段
    deposit(amount) {
        if (amount > 0) {
            this.#balance += amount;
            return this.#balance;
        }
        throw new Error('存款金额必须大于0');
    }
    
    withdraw(amount) {
        if (amount <= 0) {
            throw new Error('取款金额必须大于0');
        }
        if (amount > this.#balance) {
            throw new Error('余额不足');
        }
        this.#balance -= amount;
        return this.#balance;
    }
    
    get balance() {
        return this.#balance;
    }
    
    get accountInfo() {
        return `账户: ${this.#accountNumber}, 余额: ${this.#balance}`;
    }
}

const account = new BankAccount('001', 1000);
console.log(account.balance); // 1000
account.deposit(500);
console.log(account.accountInfo); // 账户: 001, 余额: 1500

// 无法直接访问私有字段
// console.log(account.#balance); // SyntaxError
```

### 21.4.2 私有方法

```javascript
/**
 * 私有方法示例
 */
class DataProcessor {
    #data = [];
    
    constructor(initialData = []) {
        this.#data = [...initialData];
    }
    
    // 私有方法
    #validateData(item) {
        return item != null && typeof item === 'object';
    }
    
    #sanitizeData(item) {
        // 移除敏感字段
        const { password, ssn, ...cleanItem } = item;
        return cleanItem;
    }
    
    #logOperation(operation, item) {
        console.log(`[${new Date().toISOString()}] ${operation}:`, item);
    }
    
    // 公共方法使用私有方法
    addItem(item) {
        if (!this.#validateData(item)) {
            throw new Error('Invalid data format');
        }
        
        const cleanItem = this.#sanitizeData(item);
        this.#data.push(cleanItem);
        this.#logOperation('ADD', cleanItem);
        
        return this.#data.length;
    }
    
    getData() {
        return [...this.#data]; // 返回副本
    }
}

const processor = new DataProcessor();
processor.addItem({
    id: 1,
    name: '张三',
    password: 'secret123',
    email: 'zhang@test.com'
});

console.log(processor.getData());
// [{ id: 1, name: '张三', email: 'zhang@test.com' }]
```

### 21.4.3 私有访问器

```javascript
/**
 * 私有 getter 和 setter
 */
class Temperature {
    #celsius = 0;
    
    constructor(celsius = 0) {
        this.#celsius = celsius;
    }
    
    // 私有 getter
    get #fahrenheit() {
        return this.#celsius * 9/5 + 32;
    }
    
    // 私有 setter
    set #fahrenheit(f) {
        this.#celsius = (f - 32) * 5/9;
    }
    
    // 公共接口
    setCelsius(c) {
        this.#celsius = c;
    }
    
    getCelsius() {
        return this.#celsius;
    }
    
    setFahrenheit(f) {
        this.#fahrenheit = f;
    }
    
    getFahrenheit() {
        return this.#fahrenheit;
    }
    
    toString() {
        return `${this.#celsius}°C (${this.#fahrenheit}°F)`;
    }
}

const temp = new Temperature(25);
console.log(temp.toString()); // 25°C (77°F)
temp.setFahrenheit(100);
console.log(temp.getCelsius()); // 37.77777777777778
```

---

## 21.5 工厂模式与构造模式

### 21.5.1 工厂模式实现

```javascript
/**
 * 简单工厂模式
 */
class ShapeFactory {
    static createShape(type, ...args) {
        switch(type.toLowerCase()) {
            case 'circle':
                return new Circle(...args);
            case 'rectangle':
                return new Rectangle(...args);
            case 'triangle':
                return new Triangle(...args);
            default:
                throw new Error(`Unknown shape type: ${type}`);
        }
    }
}

class Circle {
    constructor(radius) {
        this.radius = radius;
        this.type = 'circle';
    }
    
    getArea() {
        return Math.PI * this.radius ** 2;
    }
}

class Rectangle {
    constructor(width, height) {
        this.width = width;
        this.height = height;
        this.type = 'rectangle';
    }
    
    getArea() {
        return this.width * this.height;
    }
}

class Triangle {
    constructor(base, height) {
        this.base = base;
        this.height = height;
        this.type = 'triangle';
    }
    
    getArea() {
        return 0.5 * this.base * this.height;
    }
}

// 使用工厂模式
const shapes = [
    ShapeFactory.createShape('circle', 5),
    ShapeFactory.createShape('rectangle', 4, 6),
    ShapeFactory.createShape('triangle', 3, 8)
];

shapes.forEach(shape => {
    console.log(`${shape.type} area: ${shape.getArea()}`);
});
```

### 21.5.2 抽象工厂模式

```javascript
/**
 * 抽象工厂模式
 */
class UIFactory {
    createButton() {
        throw new Error('createButton method must be implemented');
    }
    
    createInput() {
        throw new Error('createInput method must be implemented');
    }
}

// Windows 风格工厂
class WindowsUIFactory extends UIFactory {
    createButton() {
        return new WindowsButton();
    }
    
    createInput() {
        return new WindowsInput();
    }
}

// Mac 风格工厂
class MacUIFactory extends UIFactory {
    createButton() {
        return new MacButton();
    }
    
    createInput() {
        return new MacInput();
    }
}

// 具体产品类
class WindowsButton {
    render() {
        return '<button class="windows-btn">Windows Button</button>';
    }
}

class MacButton {
    render() {
        return '<button class="mac-btn">Mac Button</button>';
    }
}

class WindowsInput {
    render() {
        return '<input class="windows-input" type="text">';
    }
}

class MacInput {
    render() {
        return '<input class="mac-input" type="text">';
    }
}

// 使用抽象工厂
function createUI(platform) {
    let factory;
    
    switch(platform) {
        case 'windows':
            factory = new WindowsUIFactory();
            break;
        case 'mac':
            factory = new MacUIFactory();
            break;
        default:
            throw new Error('Unsupported platform');
    }
    
    const button = factory.createButton();
    const input = factory.createInput();
    
    return {
        button: button.render(),
        input: input.render()
    };
}
```

### 21.5.3 构造者模式

```javascript
/**
 * 构造者模式实现
 */
class QueryBuilder {
    constructor() {
        this.reset();
    }
    
    reset() {
        this.query = {
            select: [],
            from: '',
            where: [],
            orderBy: [],
            limit: null
        };
        return this;
    }
    
    select(...fields) {
        this.query.select.push(...fields);
        return this;
    }
    
    from(table) {
        this.query.from = table;
        return this;
    }
    
    where(condition) {
        this.query.where.push(condition);
        return this;
    }
    
    orderBy(field, direction = 'ASC') {
        this.query.orderBy.push(`${field} ${direction}`);
        return this;
    }
    
    limit(count) {
        this.query.limit = count;
        return this;
    }
    
    build() {
        const parts = [];
        
        // SELECT
        if (this.query.select.length > 0) {
            parts.push(`SELECT ${this.query.select.join(', ')}`);
        } else {
            parts.push('SELECT *');
        }
        
        // FROM
        if (this.query.from) {
            parts.push(`FROM ${this.query.from}`);
        }
        
        // WHERE
        if (this.query.where.length > 0) {
            parts.push(`WHERE ${this.query.where.join(' AND ')}`);
        }
        
        // ORDER BY
        if (this.query.orderBy.length > 0) {
            parts.push(`ORDER BY ${this.query.orderBy.join(', ')}`);
        }
        
        // LIMIT
        if (this.query.limit) {
            parts.push(`LIMIT ${this.query.limit}`);
        }
        
        return parts.join(' ');
    }
}

// 使用构造者模式
const sql = new QueryBuilder()
    .select('id', 'name', 'email')
    .from('users')
    .where('age > 18')
    .where('status = "active"')
    .orderBy('name')
    .limit(10)
    .build();

console.log(sql);
// SELECT id, name, email FROM users WHERE age > 18 AND status = "active" ORDER BY name LIMIT 10
```

### 21.5.4 单例模式

```javascript
/**
 * 单例模式实现
 */
class Database {
    #instance = null;
    #connection = null;
    
    constructor() {
        if (Database.#instance) {
            return Database.#instance;
        }
        
        Database.#instance = this;
        this.#connect();
    }
    
    #connect() {
        this.#connection = {
            host: 'localhost',
            port: 5432,
            connected: true,
            id: Math.random().toString(36).substr(2, 9)
        };
        console.log('数据库连接已建立:', this.#connection.id);
    }
    
    query(sql) {
        if (!this.#connection.connected) {
            throw new Error('数据库未连接');
        }
        console.log(`执行查询: ${sql}`);
        return { success: true, connection: this.#connection.id };
    }
    
    getConnectionInfo() {
        return { ...this.#connection };
    }
}

// 测试单例模式
const db1 = new Database();
const db2 = new Database();

console.log(db1 === db2); // true
console.log(db1.getConnectionInfo().id === db2.getConnectionInfo().id); // true
```

---

**本章总结**

第21章深入介绍了ES6 Class语法和现代面向对象编程模式：

1. **Class语法基础**：
   - 类定义和构造函数的现代语法
   - getter/setter访问器的使用
   - class表达式和立即执行类
   - 与传统构造函数的对比分析

2. **继承extends机制**：
   - 基础继承和super关键字详解
   - 父类方法调用和重写技巧
   - 多层继承的实现和注意事项
   - 继承链中的方法查找机制

3. **静态方法和属性**：
   - 静态方法的定义和继承行为
   - 工厂模式中静态方法的应用
   - 静态属性和类级别的工具函数
   - this在静态方法中的指向

4. **私有属性系统**：
   - ES2022私有字段语法(#)
   - 私有方法和访问器的实现
   - 真正的封装性和数据保护
   - 私有属性在类设计中的最佳实践

5. **设计模式应用**：
   - 工厂模式和抽象工厂的现代实现
   - 构造者模式的链式调用设计
   - 单例模式的私有字段实现
   - 设计模式在实际开发中的应用场景

**关键要点**：
- Class语法提供了更清晰的面向对象编程方式
- 继承机制解决了代码复用和扩展问题
- 私有字段实现了真正的数据封装
- 设计模式帮助解决复杂的架构设计问题

**下一章预告**

第22章将学习模块化体系，包括CommonJS、ES Modules的深入解析，import/export规则详解，以及大型项目的模块组织策略。
