---
title: "第 20 篇：数组创建方法对比指南：Array.from、fill、map、稀疏数组"
slug: "js-js-f451ed2d"
summary: "JavaScript三种数组创建方法的详细对比，包含使用场景、陷阱分析和最佳实践建议。"
category: "辅助资料"
categoryPath:
  - "我的总结"
  - "js"
  - "辅助资料"
tags:
  - "JavaScript"
  - "数组"
  - "Array.from"
  - "Array.of"
  - "new Array"
status: "published"
sortOrder: 200
cover: ""
originalId: "6a2d291f8a2b1c68f2cac41e"
originalSlug: "js-js-f451ed2d"
originalStatus: "published"
publishedAt: "2026-05-07T13:25:33.673Z"
updatedAt: "2026-07-31T11:16:24.488Z"
exportedAt: "2026-08-03T03:03:53.296Z"
---
# 第 20 篇：数组创建方法对比指南：Array.from、fill、map、稀疏数组
## 📊 三者的核心区别对比表
| 方法 | 主要用途 | 参数行为 | 关键特点 |
| --- | --- | --- | --- |
| `new Array()` | 传统的数组构造函数 | 1个数字参数 → 创建空长度数组   多个参数 → 作为数组元素 | 有歧义，**单数字参数会创建空位数组** |
| `Array.of()` | 创建包含指定元素的数组 | 所有参数都作为数组元素 | 解决 `new Array()` 的单参数歧义 |
| `Array.from()` | 从类数组/可迭代对象创建数组 | 第一个参数：类数组/可迭代对象   可选第二个参数：映射函数 | 功能最强大，支持转换和处理 |


## 🔍 详细解析与示例
### 1. `new Array()` - 传统的数组构造器
**主要问题：单数字参数有歧义**

```javascript
// 🟢 多个参数：正常创建数组
const arr1 = new Array(1, 2, 3);  // [1, 2, 3]

// ❌ 单数字参数：创建空位数组（陷阱！）
const arr2 = new Array(3);         // [empty × 3]
arr2.length;                       // 3
arr2[0];                           // undefined
arr2.forEach(x => console.log(x)); // 无输出（空位不遍历）

// 🟢 单非数字参数：作为唯一元素
const arr3 = new Array("hello");   // ["hello"]
```

### 2. `Array.of()` - 无歧义的元素创建器
**所有参数都作为数组元素，没有特殊情况**

```javascript
// ✅ 单数字参数：正常创建包含该数字的数组
const arr1 = Array.of(5);          // [5]（不是空位数组！）

// ✅ 多参数创建
const arr2 = Array.of(1, 2, 3);    // [1, 2, 3]

// ✅ 混合类型
const arr3 = Array.of("a", true, {x: 1}); // ["a", true, {x: 1}]

// ✅ 无参数创建空数组
const arr4 = Array.of();           // []
```

### 3. `Array.from()` - 灵活的转换器
**从类数组或可迭代对象创建真实数组**

```javascript
// 📦 转换类数组对象
const arrayLike = {0: 'a', 1: 'b', 2: 'c', length: 3};
const arr1 = Array.from(arrayLike);  // ['a', 'b', 'c']

// 🔄 转换可迭代对象
const set = new Set([1, 2, 2, 3]);
const arr2 = Array.from(set);        // [1, 2, 3]（自动去重）

const str = "hello";
const arr3 = Array.from(str);        // ['h', 'e', 'l', 'l', 'o']

// 🎯 配合映射函数（一步转换+处理）
const nums = Array.from(['1', '2', '3'], x => parseInt(x) * 2);
// [2, 4, 6]

// 🏗️ 生成指定范围的数组（常用技巧）
const range = Array.from({length: 5}, (_, i) => i + 1);
// [1, 2, 3, 4, 5]
```

## ⚠️ 关键陷阱：空位 vs undefined
```javascript
// ❌ 空位数组（empty slots）- 遍历会跳过
const emptyArr = new Array(3);
console.log(emptyArr);           // [empty × 3]
emptyArr.forEach(x => console.log(x)); // 不执行

// ✅ 真实值数组 - 遍历正常
const realArr = Array.from({length: 3});
console.log(realArr);            // [undefined, undefined, undefined]
realArr.forEach(x => console.log(x)); // 输出3次 undefined
```

## 🎯 使用指南：如何选择？
| 使用场景 | 推荐方法 | 示例 |
| --- | --- | --- |
| **创建已知元素的数组** | **数组字面量 **`[]` | `[1, 2, 3]` |
| **动态创建元素数组** | `Array.of()` | `Array.of(...args)` |
| **创建指定长度的数组** | `Array.from({length: n})` | `Array.from({length: 5})` |
| **转换类数组为数组** | `Array.from()` | `Array.from(document.querySelectorAll('div'))` |
| **转换时需要处理元素** | `Array.from(源, 映射函数)` | `Array.from(str, char => char.toUpperCase())` |


## 💡 最佳实践建议
1. **日常使用优先顺序**：
    - 简单的字面量创建 → `[]`
    - 动态元素创建 → `Array.of()`
    - 转换或生成序列 → `Array.from()`
    - **避免** → `new Array(数字)`（除非明确需要空位）
2. **实用代码片段**：

```javascript
// 生成 1-10 的数组
const numbers = Array.from({length: 10}, (_, i) => i + 1);

// 创建重复元素的数组
const repeated = Array.from({length: 5}, () => 'hello');

// 安全地转换参数为数组
function safeArray(...args) {
    return Array.of(...args);  // 或直接 [...args]
}
```

3. **性能提示**：
    - `Array.from()` 的映射函数比先转数组再 `map()` 效率更高
    - 创建大数组时，`new Array(n).fill(value)` 比循环更快

## 📝 总结要点
1. `new Array(n)`：创建的是"空位数组"，`forEach`、`map` 会跳过空位
2. `Array.of()`：参数即元素，无歧义，是 `new Array()` 的修复版
3. `Array.from()`：功能最全，支持转换 + 映射一步完成
4. **数组字面量 **`[]`：最简单直接，90%场景首选

记住这个简单规则：**需要转换就用 **`Array.from()`**，动态创建就用 **`Array.of()`**，简单直接就用 **`[]`**，避免 **`new Array(数字)`。
