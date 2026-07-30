---
title: "第10篇：JavaScript 字符串详解"
slug: "js-b45cfac4"
summary: "系统梳理 JavaScript 字符串的创建、查找、截取、替换、Unicode 处理与常见 API，重点纠正常见误区并补充官方参考资料。"
category: "辅助资料"
tags:
  - "JavaScript"
  - "字符串"
  - "String"
  - "Unicode"
  - "正则表达式"
status: "draft"
sortOrder: 180
cover: ""
originalId: "6a2d291f8a2b1c68f2cac3d8"
originalSlug: "js-b45cfac4"
originalStatus: "published"
exportedAt: "2026-07-30T14:30:35.933Z"
---
# 第10篇：JavaScript 字符串详解

这一篇先把字符串里最容易写错的点记住：

- 字符串是不可变的
- 很多 API 按 UTF-16 代码单元工作，不一定等于“一个完整字符”
- `replaceAll()` 和 `matchAll()` 遇到正则时有全局标志要求
- `split('')`、`charAt()`、`at()` 处理表情符号和代理对时要格外小心

### 创建字符串
```javascript
// 字面量方式
let str1 = 'Hello World';
let str2 = "Hello World";
let str3 = `Hello World`; // 模板字符串

// 构造函数方式
let str4 = new String('Hello World'); // 返回String对象
let str5 = String('Hello World'); // 返回原始字符串

// 字符串是不可变的
let str = 'hello';
str[0] = 'H'; // 无效，不会改变原字符串
console.log(str); // 输出: 'hello'
```

## 获取字符串信息
### `length` - 获取字符串长度
```javascript
const str = 'Hello World';
console.log(str.length); // 11
```

### `charAt()` - 获取指定位置字符
若索引超出字符串长度（或为负数），返回空字符串 `''`

```javascript
const str = 'Hello';
console.log(str.charAt(0)); // 'H'
console.log(str.charAt(4)); // 'o'
console.log(str.charAt(10)); // '' (空字符串)

// 使用数组索引方式
console.log(str[0]); // 'H'
console.log(str[10]); // undefined
```

### `charCodeAt()` - 获取字符的Unicode编码
若索引超出字符串长度，返回 `NaN`

```javascript
const str = 'Hello';
console.log(str.charCodeAt(0)); // 72 (H的Unicode)
console.log(str.charCodeAt(1)); // 101 (e的Unicode)

// 获取完整Unicode（处理代理对）
const str2 = '𠮷'; // 这是一个四字节的字符
console.log(str2.charCodeAt(0)); // 55362 (只返回高位代理)
```

### `codePointAt()` - 获取完整的Unicode码点
```javascript
const str = '𠮷';
console.log(str.codePointAt(0)); // 134071 (完整码点)
```

### `at()` - 支持负索引取字符
`at()` 和数组的 `at()` 很像，适合从尾部反向取值。

```javascript
const str = 'Hello'
console.log(str.at(0)) // 'H'
console.log(str.at(-1)) // 'o'
console.log(str.at(-2)) // 'l'
console.log(str.at(99)) // undefined
```

补充：

- `at()` 支持负索引，而 `charAt()` 不支持
- `at()` 返回的同样是单个 UTF-16 代码单元，不一定是“完整 Unicode 字符”
- 如果要处理代理对字符，优先结合 `codePointAt()`、`Array.from()`、`for...of`

## 字符串查找
### `indexOf()` - 查找子串首次出现位置
`str.indexOf(要查找的子串, 起始查找位置)`

+ 第二个参数（起始位置）可选，默认从索引 0 开始；若指定非负整数 n，则从第 n 个字符往后查找。

```javascript
const str = 'Hello World, Hello JavaScript';
console.log(str.indexOf('Hello')); // 0
console.log(str.indexOf('Hello', 1)); // 13 (从位置1开始查找)
console.log(str.indexOf('world')); // -1 (区分大小写)
console.log(str.indexOf('o')); // 4
```

### `lastIndexOf()` - 查找子串最后出现位置
```javascript
const str = 'Hello World, Hello JavaScript';
console.log(str.lastIndexOf('Hello')); // 13
console.log(str.lastIndexOf('Hello', 12)); // 0 (从位置12向前查找)
console.log(str.lastIndexOf('o')); // 17
```

### `search()` - 使用正则表达式查找
查找与正则表达式匹配的**首次出现位置**，返回匹配结果的起始索引；若未找到匹配项，返回 `-1`。

```javascript
const str = 'Hello World 123';
console.log(str.search(/World/)); // 6
console.log(str.search(/\d+/)); // 12 (查找数字)
console.log(str.search(/world/)); // -1 (区分大小写)
console.log(str.search(/world/i)); // 6 (不区分大小写)
```

### `includes()` - 检查是否包含子串
1. **返回值**：找到子串返回 `true`，未找到返回 `false`；
2. **区分大小写**：对字母大小写敏感（如 `'Hello'` 不包含 `'hello'`）；
3. **可选参数**：第二个参数可指定查找的起始位置（默认从索引 0 开始）；
4. **支持空字符串**：查找空字符串 `''` 时始终返回 `true`（ECMAScript 规范）。

```javascript
const str = 'Hello World';
console.log(str.includes('World')); // true
console.log(str.includes('world')); // false (区分大小写)
console.log(str.includes('Hello', 1)); // false (从位置1开始检查)

// 实际应用
function checkEmail(email) {
    return email.includes('@') && email.includes('.');
}
```

### `startsWith()` - 检查是否以指定字符串开头
```javascript
const str = 'Hello World';
console.log(str.startsWith('Hello')); // true
console.log(str.startsWith('World')); // false
console.log(str.startsWith('Hello', 5)); // false (从位置5开始检查)
console.log(str.startsWith('World', 6)); // true

// 实际应用：检查URL协议
function isSecure(url) {
    return url.startsWith('https://');
}
```

### `endsWith()` - 检查是否以指定字符串结尾
    - 第一个参数（必填）：要检测的目标子字符串（区分大小写）；
    - 第二个参数（可选）：指定字符串的 “有效长度”（即只检测前 N 个字符是否以目标子串结尾），默认值为字符串本身的 `length`。

常用于文件格式判断（如检测文件名是否以 `.png`/`.js` 结尾）、URL 后缀验证等场景。

```javascript
const str = 'Hello World';
console.log(str.endsWith('World')); // true
console.log(str.endsWith('Hello')); // false
console.log(str.endsWith('Hello', 5)); // true (只检查前5个字符)

// 实际应用：检查文件扩展名
function isImageFile(filename) {
    return filename.endsWith('.jpg') || 
           filename.endsWith('.png') || 
           filename.endsWith('.gif');
}
```

## 字符串截取
### `slice()` - 提取子字符串
+ `startIndex`：必需，提取的起始位置（索引从 0 开始）；若为负数，从字符串末尾倒着数（如 `-1` 表示最后一个字符）。
+ `endIndex`：可选，提取的结束位置（不包含该位置的字符）；省略则提取到字符串末尾；若为负数，同样从末尾倒着数。
+ `slice()` 若 `start > end` 返回空字符串，`substring()` 会自动交换两者位置（如 `substring(4,1)` 等价于 `substring(1,4)`）。
+ 当 `slice()` 的参数满足 `start > end` 时，字符串版本会返回空字符串 `''`，原字符串当然也不会被修改。前面“返回空数组”是数组 `slice()` 的语境，不能直接照搬到字符串。

```javascript
const str = 'Hello World';
console.log(str.slice(0, 5)); // 'Hello' (从0到5，不包括5)
console.log(str.slice(6)); // 'World' (从6到末尾)
console.log(str.slice(-5)); // 'World' (负值表示从末尾开始)
console.log(str.slice(3, 7)); // 'lo W'
console.log(str.slice(7, 3)); // '' (如果开始>结束，返回空字符串)
```

### `substring()` - 提取子字符串
+ 自动修正参数顺序：若 `indexStart > indexEnd`，方法会自动交换两者（如 `substring(5, 2)` 等价于 `substring(2, 5)`）。
+ 处理负数参数：若参数为负数或 `NaN`，会被当作 `0` 处理（如 `substring(-2, 3)` 等价于 `substring(0, 3)`）。
+ 超出范围处理：若参数大于字符串长度，按字符串长度计算（如 `substring(10, 20)` 若原串长度为 15，等价于 `substring(10, 15)`）。

```javascript
const str = 'Hello World';
console.log(str.substring(0, 5)); // 'Hello'
console.log(str.substring(6)); // 'World'
console.log(str.substring(3, 7)); // 'lo W'

// 与slice的区别
console.log(str.substring(-3, 5)); // 'Hello' (负值视为0)
console.log(str.substring(7, 3)); // 'lo W' (会自动交换参数)
```

### `substr()` - 提取指定长度的子字符串（已废弃）
```javascript
// 不推荐使用：已废弃，只保留在 Annex B（主要为了浏览器兼容旧代码）
const str = 'Hello World';
console.log(str.substr(0, 5)); // 'Hello' (从0开始，取5个字符)
console.log(str.substr(6)); // 'World'
console.log(str.substr(-5)); // 'World'
```

补充说明：

- `substr()` 不是主规范里的推荐 API，而是为兼容旧网页保留
- 新代码优先使用 `slice()` 或 `substring()`
- 它和 `slice()`、`substring()` 在负数和第二参数处理上都不一样，不能机械替换

## 字符串修改
### `replace()` - 替换字符串
```javascript
str.replace(匹配目标, 替换内容)
```

+ 匹配目标：可是「字符串」（仅匹配首次出现）或「正则表达式」（支持全局 / 忽略大小写等规则）
+ 替换内容：可是「字符串」或「回调函数」（处理复杂替换逻辑）

```javascript
const str = 'Hello World, Hello Universe';
console.log(str.replace('Hello', 'Hi')); // 'Hi World, Hello Universe'
console.log(str.replace(/Hello/g, 'Hi')); // 'Hi World, Hi Universe'

// 使用函数替换
const result = 'Hello 123 World 456'.replace(/\d+/g, (match) => {
    return parseInt(match) * 2;
});
console.log(result); // 'Hello 246 World 912'

// 使用捕获组
const date = '2024-01-15';
const newDate = date.replace(/(\d{4})-(\d{2})-(\d{2})/, '$2/$3/$1');
console.log(newDate); // '01/15/2024'
```

### `replaceAll()` - 替换所有匹配项
+ 对比 `replace()`（默认仅替换首次匹配项），`replaceAll()` 会替换字符串中**所有符合条件的子串**。
+ 但有个关键点：如果第一个参数是正则表达式，它**必须带全局标志 `g`**，否则会抛 `TypeError`。

```javascript
const str = 'Hello World, Hello Universe';
console.log(str.replaceAll('Hello', 'Hi')); // 'Hi World, Hi Universe'
console.log(str.replaceAll(/Hello/g, 'Hi')); // 'Hi World, Hi Universe'
// console.log(str.replaceAll(/Hello/, 'Hi')) // TypeError: 正则必须带 g

// 实际应用：批量替换
const text = 'apple, banana, apple, orange, apple';
const newText = text.replaceAll('apple', 'pear');
console.log(newText); // 'pear, banana, pear, orange, pear'
```

### `toUpperCase()` - 转换为大写
```javascript
const str = 'Hello World';
console.log(str.toUpperCase()); // 'HELLO WORLD'

// 实际应用
function normalizeUsername(username) {
    return username.toUpperCase();
}
```

### `toLowerCase()` - 转换为小写
```javascript
const str = 'Hello World';
console.log(str.toLowerCase()); // 'hello world'

// 实际应用：不区分大小写比较
function compareIgnoreCase(str1, str2) {
    return str1.toLowerCase() === str2.toLowerCase();
}
```

### `toLocaleUpperCase()` - 根据区域设置转换为大写
```javascript
const str = 'straße'; // 德语单词
console.log(str.toLocaleUpperCase('de-DE')); // 'STRASSE'
console.log(str.toUpperCase()); // 'STRASSE' (在某些环境可能不同)
```

### `toLocaleLowerCase()` - 根据区域设置转换为小写
```javascript
const str = 'İSTANBUL'; // 土耳其语
console.log(str.toLocaleLowerCase('tr-TR')); // 'istanbul'
```

### `trim()` - 去除两端空白字符
```javascript
const str = '  Hello World  ';
console.log(str.trim()); // 'Hello World'
console.log(str.trim().length); // 11

// 实际应用：表单验证
const userInput = '  user@example.com  ';
const cleanedInput = userInput.trim();
```

### `trimStart()` / `trimLeft()` - 去除开头空白
```javascript
const str = '  Hello World  ';
console.log(str.trimStart()); // 'Hello World  '
console.log(str.trimLeft()); // 'Hello World  ' (trimLeft是trimStart的别名)
```

### `trimEnd()` / `trimRight()` - 去除结尾空白
```javascript
const str = '  Hello World  ';
console.log(str.trimEnd()); // '  Hello World'
console.log(str.trimRight()); // '  Hello World' (trimRight是trimEnd的别名)
```

### `repeat()` - 重复字符串
按**指定次数复制原字符串**并拼接返回，**不改变原字符串**（因字符串不可变），属于字符串修改类方法。

1. **语法**：`str.repeat(count)`，参数 `count` 为非负整数（表示重复次数）。
2. **返回值**：新字符串，由原字符串重复 `count` 次组成。
3. **边界处理**：
    - `count = 0` 时，返回空字符串；
    - `count` 为小数时，会向下取整（如 `2.9` 视为 `2`）；
    - 不支持负数、 Infinity，否则会报错。

```javascript
console.log('Hello '.repeat(3)); // 'Hello Hello Hello '
console.log('Hi'.repeat(2.5)); // 'HiHi' (2.5会被转换为2)
console.log('Hi'.repeat(0)); // ''
console.log('Hi'.repeat(3.9)); // 'HiHiHi' (向下取整)

// 实际应用：生成分隔线
function createSeparator(length, char = '-') {
    return char.repeat(length);
}
console.log(createSeparator(20)); // '--------------------'
```

## 字符串转换
### `concat()` - 连接字符串
```javascript
const str1 = 'Hello';
const str2 = 'World';
console.log(str1.concat(' ', str2)); // 'Hello World'
console.log(str1.concat(' ', str2, '!')); // 'Hello World!'

// 更常用的方式是使用 + 或模板字符串
console.log(str1 + ' ' + str2); // 'Hello World'
console.log(`${str1} ${str2}`); // 'Hello World'
```

### `split()` - 分割字符串为数组
1. **基础用法**：接收一个分隔符（字符串或正则表达式），按该分隔符拆分字符串。
    - 示例：`'a,b,c'.split(',')` → `['a', 'b', 'c']`
2. **可选参数（长度限制）**：第二个参数可指定返回数组的最大长度，超出部分会被忽略。
    - 示例：`'a,b,c,d'.split(',', 2)` → `['a', 'b']`

```javascript
const str = 'apple,banana,orange';
console.log(str.split(',')); // ['apple', 'banana', 'orange']
console.log(str.split(',', 2)); // ['apple', 'banana'] (限制分割次数)

// 使用正则表达式分割
const str2 = 'apple, banana; orange';
console.log(str2.split(/[,;]\s*/)); // ['apple', 'banana', 'orange']

// 分割每个字符
console.log('Hello'.split('')); // ['H', 'e', 'l', 'l', 'o']

// 实际应用：解析CSV
const csv = 'John,Doe,30,New York';
const [firstName, lastName, age, city] = csv.split(',');
```

补充：

- `split('')` 是按 UTF-16 代码单元拆分，不是按“用户看到的完整字符”拆分
- 所以遇到表情符号、部分生僻字、某些组合字符时，可能被拆坏

```javascript
console.log('😄'.split('')) // ['\ud83d', '\ude04']
console.log(Array.from('😄')) // ['😄']
console.log([...'😄']) // ['😄']
```

### `normalize()` - Unicode正规化
```javascript
const str1 = '\u00F1'; // ñ
const str2 = '\u006E\u0303'; // n + ̃
console.log(str1 === str2); // false
console.log(str1.normalize() === str2.normalize()); // true

// 正规化形式
console.log(str2.normalize('NFC')); // 标准组合
console.log(str2.normalize('NFD')); // 标准分解
```

### `isWellFormed()` / `toWellFormed()` - 检查或修复孤立代理项
这两个是比较新的字符串方法，适合处理 UTF-16 里的“坏字符串”。

```javascript
const bad = 'ab\uD800'

console.log(bad.isWellFormed()) // false
console.log(bad.toWellFormed()) // 'ab�'

const good = 'ab😄'
console.log(good.isWellFormed()) // true
console.log(good.toWellFormed()) // 'ab😄'
```

实际意义：

- 有些 API（例如 `encodeURI()`）遇到孤立代理项会直接报错
- `isWellFormed()` 先检查
- `toWellFormed()` 会把孤立代理项替换成 `U+FFFD`，也就是 `�`

## 字符串填充
### `padStart()` - 在开头填充字符串
**在字符串开头（左侧）补充指定字符**，直到字符串达到目标长度，返回新字符串（不修改原字符串，因字符串不可变）。

```javascript
str.padStart(targetLength [, padString])
```

+ **参数 1（必选）**：`targetLength` - 最终想要的字符串总长度。若原字符串长度 ≥ 该值，直接返回原字符串。
+ **参数 2（可选）**：`padString` - 用于填充的字符（默认是空格）。若该字符串长度超过需要填充的长度，会被截断取前半部分。

```javascript
console.log('5'.padStart(3, '0')); // '005'
console.log('123'.padStart(5, '0')); // '00123'
console.log('hello'.padStart(10, '*-')); // '*-*-*hello'

// 实际应用：格式化数字
function formatNumber(num, length = 8) {
    return num.toString().padStart(length, '0');
}
console.log(formatNumber(123)); // '00000123'
```

### `padEnd()` - 在结尾填充字符串
```javascript
console.log('5'.padEnd(3, '0')); // '500'
console.log('hello'.padEnd(10, '!')); // 'hello!!!!!'
console.log('hello'.padEnd(10, ' world')); // 'hello worl'

// 实际应用：对齐文本
const items = [
    { name: 'apple', price: 1.2 },
    { name: 'banana', price: 0.5 },
    { name: 'orange', price: 0.8 }
];

items.forEach(item => {
    const name = item.name.padEnd(10, '.');
    const price = item.price.toFixed(2).padStart(6, ' ');
    console.log(`${name}${price}`);
});
```

## 字符串比较与验证
### `localeCompare()` - 区域敏感字符串比较
```javascript
console.log('a'.localeCompare('b')); // -1 (a在b之前)
console.log('b'.localeCompare('a')); // 1 (b在a之后)
console.log('a'.localeCompare('a')); // 0 (相等)

// 考虑区域设置
console.log('ä'.localeCompare('z', 'de')); // -1 (在德语中ä排在a之后)
console.log('ä'.localeCompare('z', 'sv')); // 1 (在瑞典语中ä排在z之后)

// 实际应用：排序
const words = ['apple', 'Banana', 'cherry', 'Äpfel'];
words.sort((a, b) => a.localeCompare(b, 'en', { sensitivity: 'base' }));
console.log(words); // ['apple', 'Äpfel', 'Banana', 'cherry']
```

### `match()` - 正则表达式匹配
**用正则表达式匹配字符串**，返回匹配结果（数组或 `null`），具体解析如下：

语法：`str.match(regexp)`

+ 参数 `regexp`：正则表达式（可直接写 `/规则/`，或用 `new RegExp()` 创建）；若传入非正则值，会自动转为正则。
+ 返回值：
    - 匹配成功：返回数组（数组 [0] 是完整匹配字符串，后续元素是正则分组捕获的内容）；
    - 匹配失败：返回 `null`。

```javascript
const str = 'The rain in Spain falls mainly in the plain';
console.log(str.match(/ain/g)); // ['ain', 'ain', 'ain']
console.log(str.match(/ain/)); // ['ain', index: 5, input: 'The rain...', groups: undefined]

// 使用捕获组
const dateStr = '2024-01-15';
const match = dateStr.match(/(\d{4})-(\d{2})-(\d{2})/);
if (match) {
    console.log(`年: ${match[1]}, 月: ${match[2]}, 日: ${match[3]}`);
}
```

### `matchAll()` - 返回所有匹配的迭代器
如果传入的是正则表达式，它必须带 `g` 标志，否则会抛 `TypeError`。

```javascript
const str = 'test1test2test3';
const regex = /test(\d)/g;
const matches = [...str.matchAll(regex)];
console.log(matches);
// [
//   ['test1', '1', index: 0, ...],
//   ['test2', '2', index: 5, ...],
//   ['test3', '3', index: 10, ...]
// ]

// 实际应用：提取所有匹配
const text = 'John: 30, Jane: 25, Bob: 35';
const ageRegex = /(\w+):\s*(\d+)/g;
for (const match of text.matchAll(ageRegex)) {
    console.log(`${match[1]} is ${match[2]} years old`);
}

// console.log([...str.matchAll(/test(\d)/)]) // TypeError: 正则必须带 g
```

### `toString()` 和 `valueOf()`
1. toString()

+ **作用**：将 String 对象转换为原始字符串（与字符串字面量格式一致）。
+ **使用场景**：当需要将 String 实例（通过 `new String()` 创建的对象）转为原始字符串时自动调用，也可手动调用。

2. valueOf()

+ **作用**：返回 String 对象的原始值（即底层存储的字符串字面量）。
+ **使用场景**：在需要原始值的操作中（如字符串拼接、比较）自动调用，优先于 `toString()`。
+ **特点**：
    - 对 String 对象调用时，直接返回原始字符串（如 `new String('world').valueOf()` → `'world'`）；
    - 与 `toString()` 结果一致，但触发时机不同：`valueOf()` 侧重「获取原始值」，`toString()` 侧重「转为字符串格式」；
    - 原始字符串调用时，同样隐式包装后返回自身。

```javascript
const strObj = new String('Hello');
console.log(strObj.toString()); // 'Hello' (返回字符串原始值)
console.log(strObj.valueOf()); // 'Hello' (返回字符串原始值)

// 自动转换
console.log(strObj + ' World'); // 'Hello World' (自动调用valueOf())
```

## ES6+ 新增方法
### 模板字符串
```javascript
// 基本用法
const name = 'John';
const age = 30;
console.log(`My name is ${name} and I'm ${age} years old.`);

// 多行字符串
const multiline = `This is
a multiline
string`;

// 表达式
const a = 5, b = 10;
console.log(`The sum is ${a + b}`); // 'The sum is 15'

// 标签模板
function highlight(strings, ...values) {
    return strings.reduce((result, str, i) => {
        return `${result}${str}<strong>${values[i] || ''}</strong>`;
    }, '');
}

const name2 = 'Alice';
const message = highlight`Hello, ${name2}!`;
console.log(message); // 'Hello, <strong>Alice</strong>!'
```

### `String.raw()` - 原始字符串
```javascript
console.log(`Hello\nWorld`); // 会换行
console.log(String.raw`Hello\nWorld`); // 'Hello\\nWorld' (不转义)

// 实际应用1：少写一堆反斜杠转义
const winPath = String.raw`C:\Users\John`
console.log(winPath) // C:\Users\John

// 实际应用2：构造正则源码字符串
const regexSource = String.raw`\d+\.\d+`
console.log(regexSource) // \d+\.\d+
```

### `fromCharCode()` 和 `fromCodePoint()`
```javascript
// 从Unicode码点创建字符
console.log(String.fromCharCode(72, 101, 108, 108, 111)); // 'Hello'

// 处理四字节字符
console.log(String.fromCodePoint(0x1F600)); // '😀' (笑脸表情)
console.log(String.fromCharCode(0x1F600)); // 无法正确处理
```

## 实际应用示例
### 1. 字符串反转
```javascript
function reverseStringBySplit(str) {
    return str.split('').reverse().join('');
}

function reverseStringBySpread(str) {
    return [...str].reverse().join('');
}

function reverseStringByReduce(str) {
    return [...str].reduce((rev, char) => char + rev, '');
}

console.log(reverseStringBySplit('Hello')); // 'olleH'
console.log(reverseStringBySpread('😄ab')); // 'ba😄'
console.log(reverseStringByReduce('world')); // 'dlrow'
```

### 2. 判断回文字符串
```javascript
function isPalindrome(str) {
    const cleaned = str.toLowerCase().replace(/[^a-z0-9]/g, '');
    return cleaned === cleaned.split('').reverse().join('');
}

console.log(isPalindrome('A man, a plan, a canal: Panama')); // true
console.log(isPalindrome('race a car')); // false
```

### 3. 统计字符出现次数
```javascript
function countCharacters(str) {
    const count = {};
    for (const char of str.toLowerCase()) {
        if (char.match(/[a-z]/)) {
            count[char] = (count[char] || 0) + 1;
        }
    }
    return count;
}

console.log(countCharacters('Hello World'));
// { h: 1, e: 1, l: 3, o: 2, w: 1, r: 1, d: 1 }
```

### 4. URL参数解析
```javascript
function parseQueryString(query) {
    return query
        .slice(1) // 去掉开头的'?'
        .split('&')
        .reduce((params, pair) => {
            const [key, value] = pair.split('=');
            params[decodeURIComponent(key)] = decodeURIComponent(value || '');
            return params;
        }, {});
}

const query = '?name=John%20Doe&age=30&city=New%20York';
console.log(parseQueryString(query));
// { name: 'John Doe', age: '30', city: 'New York' }
```

### 5. 驼峰命名转换
```javascript
function toCamelCase(str) {
    return str
        .replace(/[-_\s]+(.)?/g, (_, c) => c ? c.toUpperCase() : '')
        .replace(/^(.)/, (c) => c.toLowerCase());
}

console.log(toCamelCase('hello-world')); // 'helloWorld'
console.log(toCamelCase('Hello_World')); // 'helloWorld'
console.log(toCamelCase('hello world')); // 'helloWorld'
```

## 性能注意事项
1. **字符串连接性能**：不要把“`join()` 一定比 `+=` 快”当成铁律。现代引擎对字符串拼接已经做了很多优化，热点代码里应以实际测试结果为准；普通业务代码优先可读性。

```javascript
// 可读性高，很多场景已经足够
let result = '';
for (let i = 0; i < 1000; i++) {
    result += 'text';
}

// 当你本来就在收集片段时，join() 也很自然
const arr = [];
for (let i = 0; i < 1000; i++) {
    arr.push('text');
}
const result = arr.join('');
```

2. **正则表达式预编译**：多次使用的正则表达式应该预先编译

```javascript
const regex = /pattern/g; // 预编译
str.match(regex);
```

3. **选择合适的方法**：
    - 简单查找使用`includes()`、`startsWith()`、`endsWith()`
    - 需要位置信息使用`indexOf()`、`lastIndexOf()`
    - 复杂模式匹配使用`match()`、`search()`

## 浏览器兼容性
大多数现代方法在主流浏览器中都得到良好支持：

+ ES5方法：IE9+ 基本支持
+ ES6方法：IE不支持，Edge12+支持
+ ES2020方法：`replaceAll()`等较新方法需要检查兼容性

对于旧浏览器，可以使用polyfill或替代方案：

```javascript
// replaceAll的polyfill
if (!String.prototype.replaceAll) {
    String.prototype.replaceAll = function(search, replacement) {
        return this.split(search).join(replacement);
    };
}
```

## 官方参考资料
晚上继续补充时，建议优先查这些官方页面：

- [MDN String 总览](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)
- [MDN `String.prototype.charAt()`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/charAt)
- [MDN `String.prototype.at()`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/at)
- [MDN `String.prototype.split()`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/split)
- [MDN `String.prototype.replaceAll()`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/replaceAll)
- [MDN `String.prototype.matchAll()`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/matchAll)
- [MDN `String.prototype.substr()`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/substr)
- [MDN `String.prototype.isWellFormed()`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/isWellFormed)
- [MDN `String.prototype.toWellFormed()`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/toWellFormed)

## 总结
JavaScript字符串方法提供了丰富的功能来处理文本数据。掌握这些方法可以：

1. **提高开发效率**：使用合适的方法减少代码量
2. **增强代码可读性**：使用语义化方法使意图更清晰
3. **处理复杂文本操作**：正则表达式与字符串方法结合
4. **支持国际化**：考虑区域设置的比较和转换

根据具体需求选择合适的方法，并注意性能和兼容性，可以编写出高效、健壮的字符串处理代码。
