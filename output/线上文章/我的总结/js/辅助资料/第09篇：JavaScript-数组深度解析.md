---
title: "第09篇：JavaScript 数组深度解析"
slug: "js-javascript-ceaa578b"
summary: "从数组本质、length、空位和常用方法等角度系统梳理 JavaScript 数组，并修正 splice、map、copyWithin 等常见误区。"
category: "辅助资料"
categoryPath:
  - "我的总结"
  - "js"
  - "辅助资料"
tags:
  - "JavaScript"
  - "数组"
  - "Array"
  - "稀疏数组"
  - "常用方法"
status: "published"
sortOrder: 90
cover: ""
originalId: "6a2d291f8a2b1c68f2cac3ce"
originalSlug: "js-javascript-ceaa578b"
originalStatus: "published"
publishedAt: "2026-05-07T13:25:33.663Z"
updatedAt: "2026-06-13T14:09:43.228Z"
exportedAt: "2026-07-30T15:42:33.614Z"
---
# 第09篇：JavaScript 数组深度解析
## 一、数组的本质理解
### 1.1 数组是特殊的对象
```javascript
// 底层原理：数组实际上是带有特殊行为（length属性）的对象
const arr = [1, 2, 3];

// 1. 数组索引本质上是字符串键
arr[0] === arr["0"]; // true
// 内部转换为：arr["0"] = 1

// 2. 查看数组的真实结构
Object.getOwnPropertyDescriptors(arr);
// {
//   "0": { value: 1, writable: true, enumerable: true, configurable: true },
//   "1": { value: 2, writable: true, enumerable: true, configurable: true },
//   "2": { value: 3, writable: true, enumerable: true, configurable: true },
//   "length": { value: 3, writable: true, enumerable: false, configurable: false }
// }

// 3. 为什么可以添加非数字属性？
arr.customProp = "test";
// 这只是给对象添加了一个普通属性，与length无关
```

### 1.2 length属性的魔法
```javascript
// length不是访问器属性，但它是一个带特殊规则的数据属性
const arr = [1, 2, 3];

// 1. 修改length会触发什么？
arr.length = 1;
// 引擎会自动删除"数字索引 ≥ 新 length 值"的所有属性
console.log(arr); // [1]
console.log(arr[2]); // undefined（属性已被删除）

// 2. 设置更大的length
arr.length = 5;
// 不会创建真实属性，只是把数组长度改大，中间位置会变成空位
console.log(0 in arr); // true（原来第0项还在）
console.log(3 in arr); // false（空位，不是undefined值）

// 3. 索引赋值会自动更新length
arr[100] = "end";
console.log(arr.length); // 101
// 引擎自动设置length为最大数字索引+1
```

## 二、数组创建的内幕
### 2.1 数组创建方式对比
```javascript
// 1. 字面量：最快的方式
const arr1 = [1, 2, 3];
// 引擎直接分配内存并设置值

// 2. new Array() 的陷阱
const arr2 = new Array(5);
// 创建空数组，有5个空位（empty slots）
// 不是[undefined, undefined, undefined, undefined, undefined]
// 空位和undefined完全不同！

// 验证空位
const sparse = new Array(3);
console.log(0 in sparse); // false（空位）
console.log(sparse[0]); // undefined（读取结果虽然是undefined，但这个位置并没有真实属性）

const dense = [undefined, undefined, undefined];
console.log(0 in dense); // true（真实存在undefined值）

// 3. Array.from() 的智能处理
Array.from({ length: 3 }); // [undefined, undefined, undefined]
// 会将空位转换为真实的undefined值

// 4. Array.of() 的设计目的
Array.of(7); // [7] （单个参数）
new Array(7); // [empty × 7] （陷阱！）
```

[数组创建区别](https://www.yuque.com/chenhaonan-b76av/kststh/hthgyo1nnzbwvq21)

### 2.2 稀疏数组 vs 密集数组
```javascript
// 稀疏数组：有空位的数组
// delete 会删除数组的某个索引对应的键值对，但不会改变数组的 length，也不会将后续元素向前移位，
// 因此会在该索引位置留下一个「空位」（empty slot），数组也就变成了稀疏数组。
const sparse = [1, , 3]; // 第二个位置是空位
console.log(sparse.length); // 3
console.log(sparse); // [1, empty, 3]

// 密集数组：每个位置都有值
const dense = [1, undefined, 3];

// 关键区别
console.log(1 in sparse); // false（空位不存在）
console.log(1 in dense); // true（undefined值存在）

// 数组方法的不同处理
sparse.forEach((v, i) => console.log(i, v)); 
// 只输出 0 1 和 2 3（跳过空位）

dense.forEach((v, i) => console.log(i, v)); 
// 输出 0 1, 1 undefined, 2 3
```

### 2.3 空位在不同方法中的表现速查
```javascript
const sparse = [1, , 3];

// 1. 这些方法会跳过空位，不执行回调
sparse.forEach((v, i) => console.log('forEach', i, v)); // 只看见索引 0 和 2
sparse.map(x => x * 2);      // [2, empty, 6]（保留空位）
sparse.filter(Boolean);      // [1, 3]（结果变成密集数组）
sparse.some(x => x === 3);   // true（跳过空位）
sparse.every(x => x > 0);    // true（跳过空位）
[1, , 3].reduce((acc, cur) => acc + cur, 0); // 4（跳过空位）

// 2. 这些方法会“访问空位”，读取结果当成 undefined
sparse.find((v, i) => {
  console.log('find', i, v);
  return false;
});
// 会输出 0 1、1 undefined、2 3

[...sparse];         // [1, undefined, 3]
Array.from(sparse);  // [1, undefined, 3]

// 3. 这些方法会保留空位本身
sparse.slice();      // [1, empty, 3]
sparse.concat([]);   // [1, empty, 3]

// 4. 这些方法会把空位“抹平”或移除
[1, , [2]].flat();   // [1, 2]

// 5. 这些方法会把空位按空字符串处理
sparse.join('-');    // '1--3'
```

记忆口诀：

- 遍历回调类里，不是所有方法都跳过空位，`find()` / `findIndex()` 是比较容易记错的一组
- 想判断“这个位置有没有真实元素”，用 `in` 比直接读值更可靠
- “读出来是 `undefined`” 不等于 “这个位置真的有一个值为 `undefined` 的元素”



# JavaScript 数组方法完全指南
## 一、会改变原数组的方法（9个）
### 1. 栈方法（尾部操作）
```javascript
// push() - 末尾添加，返回新长度
let arr = [1, 2];
arr.push(3, 4);           // arr = [1, 2, 3, 4]，返回4

// pop() - 末尾删除，返回删除的元素
arr.pop();                // arr = [1, 2, 3]，返回4
```

### 2. 队列方法（头部操作）
```javascript
// unshift() - 开头添加，返回新长度
let arr = [2, 3];
arr.unshift(0, 1);        // arr = [0, 1, 2, 3]，返回4

// shift() - 开头删除，返回删除的元素
arr.shift();              // arr = [1, 2, 3]，返回0
```

注意：

- `push()` 和 `unshift()` 可以一次传多个参数，不会只看第一个
- `pop()` 和 `shift()` 本身也不是“传多个参数后只看第一个”，而是它们本来就不靠传参来插入元素

### 3. 通用修改方法
```javascript
// splice() - 万能修改器（核心！），返回：被删除的元素数组
let arr = ['a', 'b', 'c', 'd'];
// 参数：
// 起始索引（可为负数，从数组末尾倒数，如 -1 指最后一位），
// 删除个数（可选，0 则不删除，省略则删除从 start 到末尾所有元素）
// 插入/替换的元素（可选，无则仅执行删除操作）
// 删除：arr.splice(start, deleteCount)
arr.splice(1, 2);         // arr = ['a', 'd']，返回['b', 'c']

// 插入：arr.splice(start, 0, ...items)
arr.splice(1, 0, 'x', 'y'); // arr = ['a', 'x', 'y', 'd']，返回[]

// 替换：arr.splice(start, deleteCount, ...items)
let arrReplace = ['a', 'b', 'c', 'd'];
arrReplace.splice(1, 2, 'm', 'n'); // arrReplace = ['a', 'm', 'n', 'd']，返回['b', 'c']（被删除的元素）
```

### 4. 重排序方法
```javascript
// sort() - 排序（重要细节！）返回值 = 排序后的原数组本身（不是新数组！）
let arr = [3, 1, 10, 2];
// 默认按 “字符串 Unicode 编码顺序” 排序，而非数字大小。
// 即使数组元素是数字，也会先被转为字符串再比较，导致不符合直觉的结果。
// 陷阱：默认按字符串排序
arr.sort(); // 结果：[1, 10, 2, 3]（错误，因 "10" 的首字符 "1" 小于 "2"）

// 正确：数字排序，通过传入自定义比较函数 覆盖默认规则
arr.sort((a, b) => a - b); // 升序：[1, 2, 3, 10]
arr.sort((a, b) => b - a); // 降序：[10, 3, 2, 1]

// 对象数组排序
let users = [
    {name: 'John', age: 25},
    {name: 'Alice', age: 30}
];
users.sort((a, b) => a.age - b.age);

// reverse() - 反转
arr.reverse();            // arr = [1, 2, 3, 10]
```

### 5. 填充与复制方法
```javascript
// fill() - 填充，arr.fill(value, start?, end?)，返回修改后的原数组
// value：必需，要填充的目标值（可以是数字、字符串、对象等）；
// start：可选，填充起始索引（默认 0，支持负数，如 -2 表示倒数第二个元素）；
// end：可选，填充结束索引（默认数组长度，不包含该索引本身，即左闭右开区间）。
let arr = new Array(5).fill(0);        // [0, 0, 0, 0, 0]
arr.fill(1, 1, 3);                     // [0, 1, 1, 0, 0]

// 负数参数示例
let arrNeg = [1, 2, 3, 4, 5];
arrNeg.fill(0, -2, -1);                // [1, 2, 3, 0, 5]（只填充倒数第2个位置）
arrNeg.fill(9, -3);                    // [1, 2, 9, 9, 9]（从倒数第3个到末尾）


// copyWithin()，将数组内部指定范围的元素，复制到数组另一位置（覆盖原有元素）
// 一次性提取、一次性覆盖
// arr.copyWithin(target, start[, end])
// target：必需，复制到的目标起始索引（从该位置开始覆盖写入）；
// start：必需，复制源的起始索引（从该位置开始读取元素）；
// end：可选，复制源的结束索引（不包含该位置，默认到数组末尾）。
let arrCopy1 = [1, 2, 3, 4, 5];
arrCopy1.copyWithin(0, 3); // 结果：[4, 5, 3, 4, 5]
// 解读：从索引3开始读取（4、5），写入到目标索引0位置
// 写入逻辑：索引0←arr[3]=4，索引1←arr[4]=5，索引2保持原值3

let arrCopy2 = [1, 2, 3, 4, 5];
arrCopy2.copyWithin(0, 1, 3); // 结果：[2, 3, 3, 4, 5]
// 解读：从索引1到2（end=3不包含）读取（2、3），写入到目标索引0
// 写入逻辑：索引0←arr[1]=2，索引1←arr[2]=3
```

## 二、不改变原数组的方法
### 1. 遍历迭代类（高频使用）
#### **forEach()** - 简单遍历
```javascript
// 遍历数组（无法中途停止），返回undefined
[1, 2, 3].forEach((item, index, array) => {
    console.log(`索引${index}: 值${item}`);
    // 注意：return不能中断循环！
});

// vs for...of（可以中断）
for (let item of [1, 2, 3]) {
    if (item === 2) break;
    console.log(item);
}
```

#### **map()** - 映射转换
**返回新数组**：不会修改原始数组，始终生成全新数组（长度 = 原数组长度）；遇到空位会跳过回调，但结果中会保留空位

```javascript
// 创建新数组
let doubled = [1, 2, 3].map(x => x * 2);     // [2, 4, 6]

// 转换对象数组
let users = ['Alice', 'Bob'];
let userObjects = users.map((name, index) => ({
    id: index + 1,
    name: name
}));
// [{id:1,name:'Alice'}, {id:2,name:'Bob'}]
```

#### **filter()** - 过滤筛选
**返回值**：新数组（仅包含回调返回 `true` 的元素，长度可能小于原数组）；跳过空位

```javascript
let numbers = [1, 2, 3, 4, 5];

// 筛选偶数
let evens = numbers.filter(n => n % 2 === 0); // [2, 4]

// 过滤假值
let values = [0, 1, '', 'hello', null, undefined];
let truthyValues = values.filter(Boolean); // [1, 'hello']
// 相当于values.filter(item => Boolean(item))
```

#### **reduce()** - 归并计算（重点！）
返回值 = 最后一轮回调函数的返回值，其类型完全由你在回调中 “return 的内容” 决定 —— 可以是数字、字符串、对象、数组等任意类型。

```javascript
// 基本累加
// reduce 函数用于数组累加（或归约），接受两个参数：
// 参数 1：回调函数（必选），该回调函数至少接受 2 个必选参数（上次累计的值 accumulator、
// 当前元素 currentValue），还可可选接收 2 个参数（当前元素索引 currentIndex、原数组 array），
// 回调函数的返回值会作为下一次的 accumulator；
// 参数 2：初始值 initialValue（可选），若提供则作为首次累加的起始值。
// 若不提供初始值：
//   - 数组为空时 → 报错 TypeError
//   - 数组有 2+ 元素时 → 跳过第一个元素，从第二个开始执行回调，accumulator 初始值为第一个元素的值
//   - 数组仅有 1 个元素时 → 直接返回该元素，不执行回调
[1, 2, 3].reduce((acc, cur) => acc + cur, 0); // 6
[1, 2, 3].reduce((acc, cur) => acc + cur);    // 6（无初始值，从第2个开始累加，第1个作为初始值）
[5].reduce((acc, cur) => acc + cur);          // 5（单元素无初始值，直接返回元素本身）
try { [].reduce((a,b)=>a+b); } catch(e) { console.log(e.message); } // 报错：Reduce of empty array with no initial value

// 统计元素出现次数
let fruits = ['apple', 'banana', 'apple', 'orange'];
let count = fruits.reduce((acc, fruit) => {
    acc[fruit] = (acc[fruit] || 0) + 1;
    return acc;
}, {}); // {apple:2, banana:1, orange:1}

// 数组分组
let people = [
    {name: 'Alice', age: 25},
    {name: 'Bob', age: 30},
    {name: 'Charlie', age: 25}
];
let grouped = people.reduce((acc, person) => {
    let ageGroup = person.age < 30 ? 'young' : 'adult';
    (acc[ageGroup] ||= []).push(person);
    return acc;
}, {});
```

#### **reduceRight()** - 从右向左归并
```javascript
// 数组展平反转
[[0, 1], [2, 3], [4, 5]].reduceRight((acc, cur) => {
    return acc.concat(cur);
}, []); // [4, 5, 2, 3, 0, 1]
```

### 2. 查找判断类
#### **基本查找**
```javascript
// includes() - 包含判断
[1, 2, 3].includes(2);          // true
[1, 2, 3].includes(2, 2);       // false（从索引2开始）

// indexOf() / lastIndexOf() - 索引查找
['a', 'b', 'a'].indexOf('a');    // 0
['a', 'b', 'a'].lastIndexOf('a'); // 2
```

#### **includes() 和 indexOf() 的细节差异**
```javascript
// 1. includes() 可以正确识别 NaN
[NaN].includes(NaN);    // true
[NaN].indexOf(NaN);     // -1

// 2. 空位更能看出二者的底层差异
const holeArr = new Array(1);

holeArr.includes(undefined); // true
// 原因：includes() 会去“读取这个位置的值”，空位读取结果是 undefined

holeArr.indexOf(undefined);  // -1
// 原因：indexOf() 更关心“这个位置有没有真实元素”，空位不算真实元素
```

#### **条件查找**
```javascript
let users = [
    {id: 1, name: 'Alice', active: true},
    {id: 2, name: 'Bob', active: false},
    {id: 3, name: 'Charlie', active: true}
];

// find() - 查找第一个满足条件的元素
users.find(user => user.active); 
// {id: 1, name: 'Alice', active: true}

// findIndex() - 查找第一个满足条件的索引
users.findIndex(user => !user.active); // 1
```

#### **条件判断**
```javascript
let numbers = [1, 2, 3, 4, 5];

// some() - 至少一个满足
numbers.some(n => n > 4);        // true

// every() - 所有都满足
numbers.every(n => n > 0);       // true

// 实际应用：表单验证
let formData = [
    {field: 'name', value: 'Alice', valid: true},
    {field: 'email', value: '', valid: false}
];
let allValid = formData.every(field => field.valid); // false
```

#### **at()** - 安全索引访问（ES2022）
```javascript
let arr = [1, 2, 3, 4, 5];

// 传统写法的问题
let last = arr[arr.length - 1];  // 繁琐
let first = arr[0];

// at() 写法（支持负数）
arr.at(-1);     // 5（最后一个）
arr.at(-2);     // 4（倒数第二个）
arr.at(-100);   // undefined（安全！）

// 链式调用
let matrix = [[1, 2], [3, 4]];
matrix.at(1)?.at(0);  // 3（安全访问）
```

### 3. 拼接截取类
#### **concat()** - 数组合并
```javascript
let arr1 = [1, 2];
let arr2 = [3, 4];

// 合并数组（创建新数组）
let combined = arr1.concat(arr2);          // [1, 2, 3, 4]
let all = arr1.concat(arr2, [5, 6], 7);    // [1, 2, 3, 4, 5, 6, 7]

// 注意：浅拷贝！
let nested = [{x: 1}];
let merged = nested.concat([{y: 2}]);
merged[0].x = 999;  // 原对象也会被修改！
```

#### **slice()** - 数组切片
```javascript
let arr = [1, 2, 3, 4, 5];

// 基本用法（含头不含尾）
arr.slice(1, 3);     // [2, 3]
arr.slice(2);        // [3, 4, 5]（从索引2到末尾）
arr.slice(-3);       // [3, 4, 5]（最后3个）
arr.slice(1, -1);    // [2, 3, 4]（去掉首尾）

// 创建浅拷贝
let copy = arr.slice();  // 相当于 [...arr]
```

#### **slice() 和展开运算符的一个细节**
```javascript
// 对普通密集数组，两者常常都能拿来做浅拷贝
const dense = [1, 2, 3];
const a1 = dense.slice();
const a2 = [...dense];

// 但对稀疏数组，不完全等价
const sparse = [1, , 3];
const copy1 = sparse.slice(); // 保留空位
const copy2 = [...sparse];    // 空位会被读成 undefined

console.log(1 in copy1); // false
console.log(1 in copy2); // true
```

#### **字符串转换**
```javascript
let arr = [1, 2, 3];

// join() - 自定义分隔符
arr.join('-');          // "1-2-3"
arr.join(', ');         // "1, 2, 3"
arr.join();             // "1,2,3"（默认逗号）

// toString() - 逗号分隔
arr.toString();         // "1,2,3"

// toLocaleString() - 本地化格式
let dateArr = [new Date()];
dateArr.toLocaleString('zh-CN'); // 本地化时间字符串
```

### 4. 迭代器类（ES6+）
```javascript
let arr = ['a', 'b', 'c'];

// keys() - 索引迭代器
for (let key of arr.keys()) {
    console.log(key); // 0, 1, 2
}

// values() - 值迭代器
for (let value of arr.values()) {
    console.log(value); // 'a', 'b', 'c'
}

// entries() - 键值对迭代器
for (let [index, value] of arr.entries()) {
    console.log(index, value); // 0 'a', 1 'b', 2 'c'
}

// 转换为数组
Array.from(arr.keys());     // [0, 1, 2]
[...arr.entries()];         // [[0,'a'], [1,'b'], [2,'c']]
```

### 5. 其他重要方法
#### **flat()** - 数组扁平化
**将多维数组 "拉平" 为低维数组**，且**不改变原数组**，返回新数组。传 `Infinity`（JavaScript 内置的**数值类型常量**，代表"正无穷大"），**不管数组嵌套多少层，全部拉平为一维数组**。

**特殊处理**：

    - 自动跳过数组中的空位（类似 `forEach` 对稀疏数组的处理）：`[1, , [2]].flat()` → `[1, 2]`
    - 仅处理数组类型的子元素，非数组元素直接保留：`[1, 'a', {x:2}, [3]].flat()` → `[1, 'a', {x:2}, 3]`

```javascript
// arr.flat(depth)
// depth（可选）：扁平化深度，默认值为 1（只拉平一层，仅解除最外层的一层嵌套）；
// 传入具体数字（如 2、3），会连续拉平 n 层嵌套，若嵌套层数超过 n，剩余嵌套保留。

// 扁平化嵌套数组,
let nested = [1, [2, 3], [4, [5, 6]]];

nested.flat();          // [1, 2, 3, 4, [5, 6]]（默认深度1）
nested.flat(2);         // [1, 2, 3, 4, 5, 6]
nested.flat(Infinity);  // 完全扁平化

// 移除空位
let sparse = [1, , 3, , 5];
sparse.flat();          // [1, 3, 5]
```

#### **flatMap()** - 先映射后扁平化
```javascript
// 相当于 map() + flat(1)
let arr = [1, 2, 3];

arr.flatMap(x => [x, x * 2]);  // [1, 2, 2, 4, 3, 6]

// 实用场景：分词
let sentences = ["Hello world", "Good morning"];
let words = sentences.flatMap(sentence => sentence.split(' '));
// ["Hello", "world", "Good", "morning"]
```

#### **Array.isArray()** - 类型检查
```javascript
// 检测数组类型（推荐！）
Array.isArray([1, 2]);        // true
Array.isArray({});            // false
Array.isArray('array');       // false
Array.isArray(Array.prototype); // true

// 为什么不用 typeof？
typeof [1, 2];                // 'object'（不够准确）
```

#### **toSorted() / toReversed() / toSpliced() / with()** - 现代复制型方法（ES2023）
```javascript
let arr = [3, 1, 2];

// 不改原数组，返回新数组
let sorted = arr.toSorted((a, b) => a - b); // [1, 2, 3]
console.log(arr); // [3, 1, 2]

let reversed = arr.toReversed(); // [2, 1, 3]
let spliced = arr.toSpliced(1, 1, 'x'); // [3, 'x', 2]
let replaced = arr.with(0, 99); // [99, 1, 2]

// 对照记忆：
// sort()      <-> toSorted()
// reverse()   <-> toReversed()
// splice()    <-> toSpliced()
// arr[i] = x  <-> with()
```

## 三、实用技巧与最佳实践
### 1. 方法链式调用
```javascript
// 数据处理的完整流程
let products = [
    {name: 'apple', price: 2, category: 'fruit'},
    {name: 'carrot', price: 1, category: 'vegetable'},
    {name: 'banana', price: 3, category: 'fruit'}
];

// 链式操作：过滤 → 排序 → 提取
let result = products
    .filter(p => p.category === 'fruit')
    .sort((a, b) => b.price - a.price)
    .map(p => p.name)
    .join(', ');  // "banana, apple"
```

### 2. 性能优化技巧
```javascript
// 1. 避免在循环中修改数组
// ❌ 不佳
for (let i = 0; i < arr.length; i++) {
    if (arr[i] < 0) arr.splice(i, 1);
}

// ✅ 推荐：先收集再删除
let toRemove = [];
arr.forEach((item, index) => {
    if (item < 0) toRemove.push(index);
});
for (let i = toRemove.length - 1; i >= 0; i--) {
    arr.splice(toRemove[i], 1);
}

// 2. 使用适当的查找方法
let largeArray = [/* 大量数据 */];

// includes() 对于简单查找更快
largeArray.includes(value);

// find() 对于复杂条件
largeArray.find(item => item.id === targetId);
```

补充：

- 单次查找时，优先选“语义最贴切”的方法，比死记哪一个绝对更快更重要
- 如果是同一批数据要反复判断“是否存在”，通常更适合先转成 `Set` 再查

```javascript
const ids = new Set(largeArray.map(item => item.id));

ids.has(targetId); // 反复查找时通常更合适
```

### 3. 常见问题解决
#### **数组去重**
```javascript
let arr = [1, 2, 2, 3, 3, 3];

// 方法1：Set（最简单）
let unique1 = [...new Set(arr)];  // [1, 2, 3]

// 方法2：filter + indexOf
let unique2 = arr.filter((item, index) => 
    arr.indexOf(item) === index
);

// 方法3：reduce
let unique3 = arr.reduce((acc, cur) => 
    acc.includes(cur) ? acc : [...acc, cur], []
);
```

#### **数组排序稳定**
```javascript
// 对象数组按多条件排序
let users = [
    {name: 'Alice', age: 25, score: 80},
    {name: 'Bob', age: 30, score: 90},
    {name: 'Charlie', age: 25, score: 85}
];

users.sort((a, b) => {
    // 先按年龄升序，再按分数降序
    if (a.age !== b.age) return a.age - b.age;
    return b.score - a.score;
});
```

#### **空数组处理**
```javascript
// 安全处理可能为空的数组
function safeArrayOperation(arr) {
    // 确保是数组
    arr = Array.isArray(arr) ? arr : [];
    
    // 空数组的默认处理
    if (arr.length === 0) {
        return '数组为空';
    }
    
    return arr.map(x => x * 2);
}
```

## 四、总结备忘表
### 改变原数组的方法
| 方法 | 作用 | 返回 |
| --- | --- | --- |
| `push()` | 末尾添加 | 新长度 |
| `pop()` | 末尾删除 | 删除元素 |
| `unshift()` | 开头添加 | 新长度 |
| `shift()` | 开头删除 | 删除元素 |
| `splice()` | 增删改 | 删除的元素数组 |
| `sort()` | 排序 | 排序后的原数组 |
| `reverse()` | 反转 | 反转后的原数组 |
| `fill()` | 填充 | 修改后的原数组 |
| `copyWithin()` | 内部复制 | 修改后的原数组 |


### 高频使用的不变方法
| 类别 | 方法 | 用途 |
| --- | --- | --- |
| 遍历 | `forEach()` | 简单遍历 |
|  | `map()` | 数组转换 |
|  | `filter()` | 条件筛选 |
|  | `reduce()` | 归并计算 |
| 查找 | `includes()` | 包含判断 |
|  | `find()` | 查找元素 |
|  | `findIndex()` | 查找索引 |
|  | `some()`/`every()` | 条件判断 |
| 操作 | `concat()` | 数组合并 |
|  | `slice()` | 数组切片 |
|  | `join()` | 转字符串 |


### 现代实用方法
| 方法 | 特性 | 替代方案 |
| --- | --- | --- |
| `at()` | 负索引支持 | `arr[arr.length-1]` |
| `flat()` | 数组扁平化 | 递归展平 |
| `flatMap()` | 映射+扁平化 | `map()+flat()` |


### 选择指南
1. **需要修改原数组吗？**
    - 是 → 使用可变方法（如 `push`、`splice`）
    - 否 → 使用不可变方法（如 `map`、`filter`）
2. **需要什么结果？**
    - 新数组 → `map()`、`filter()`、`slice()`
    - 布尔值 → `includes()`、`some()`、`every()`
    - 单个值 → `find()`、`reduce()`
    - 索引 → `indexOf()`、`findIndex()`
3. **处理多维数组？**
    - 展平 → `flat()`、`flatMap()`
    - 转换 → 嵌套 `map()` + `flat()`

记住：**数组是对象，索引是字符串键**。理解这个本质，就能更好地理解所有数组方法的行为。
