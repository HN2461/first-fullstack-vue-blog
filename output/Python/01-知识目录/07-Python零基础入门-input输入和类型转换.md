---
title: Python 零基础入门 07：input 输入和类型转换
slug: python-zero-input-and-convert
summary: 讲解 input 如何接收用户输入，为什么 input 得到的是字符串，以及如何使用 int、float、str 做类型转换，全程对照 JavaScript。
category: Python入门
tags:
  - Python
  - 零基础入门
status: draft
cover:
---

# Python 零基础入门 07：input 输入和类型转换

前面的代码都是我们提前写好数据。

这一篇开始，让用户在运行时输入内容。

前端 JS 里，用户输入通过 `<input>` 表单获取，用 `e.target.value` 读取。Python 用 `input()` 函数——更简单直接，但有一个关键坑：**得到的永远是字符串。**

## 一、使用 input 接收输入

```python
name = input("请输入你的名字：")
print(f"你好，{name}")
```

运行时，屏幕会显示：

```text
请输入你的名字：
```

如果你输入：

```text
小明
```

运行结果：

```text
你好，小明
```

### input 的完整流程

```text
input("提示语") → 程序暂停等待 → 用户输入内容按回车 → 返回输入内容（字符串）
```

1. `input()` 会暂停程序，等待用户输入。
2. 括号里的文字是提示语，告诉用户该输入什么。
3. 用户输入后按回车，`input()` 返回用户输入的内容。
4. **返回值永远是字符串。**

## 二、input 括号里的文字是什么

`input("请输入你的名字：")` 里面的文字叫提示语。

它会告诉用户应该输入什么。

```python
city = input("请输入你的城市：")
print(f"你来自{city}")
```

运行示例：

```text
请输入你的城市：杭州
你来自杭州
```

也可以不写提示语：

```python
name = input()   # 光标等待，但没有任何提示
```

不推荐，因为用户不知道该输入什么。

## 三、input 得到的都是字符串

这是新手必须记住的一点：

**input 得到的内容，默认都是字符串。**

```python
age = input("请输入年龄：")
print(type(age))
```

输入：

```text
18
```

运行结果：

```text
<class 'str'>
```

虽然你输入的是 `18`，但 Python 把它当成文本 `"18"`，不是数字 `18`。

这和前端 JS 的 `<input>` 一样——`e.target.value` 拿到的也是字符串：

```js
// Vue 模板
// <input v-model="age" />

// age 的值是字符串 "18"，不是数字 18
console.log(typeof this.age)  // 'string'
```

所以无论是 Python 的 `input()` 还是 JS 的表单输入，**用户输入的永远是字符串**。

## 四、字符串不能直接做数字计算

下面代码会报错：

```python
age = input("请输入年龄：")
next_year_age = age + 1   # TypeError!
print(next_year_age)
```

报错信息：

```text
TypeError: can only concatenate str (not "int") to str
```

意思是：字符串只能和字符串拼接，不能和数字相加。

Python 这里很严格，不像 JS 那样会隐式转换。

JS 对照：

```js
const age = '18'
console.log(age + 1)   // '181'（JS 隐式拼接，更坑！）
```

JS 不会报错，但结果是 `'181'` 而不是 `19`——这比 Python 的报错更危险，因为不报错但结果不对。

## 五、使用 int 转成整数

可以用 `int()` 把合适的字符串转成整数。

```python
age_text = input("请输入年龄：")
age = int(age_text)
next_year_age = age + 1

print(f"明年你 {next_year_age} 岁")
```

输入：

```text
18
```

运行结果：

```text
明年你 19 岁
```

也可以简写：

```python
age = int(input("请输入年龄："))
print(f"明年你 {age + 1} 岁")
```

JS 对照：

```js
const ageStr = '18'
const age = parseInt(ageStr, 10)  // 18
console.log(`明年你 ${age + 1} 岁`)
```

对照：

| 功能 | Python | JS |
| --- | --- | --- |
| 字符串转整数 | `int("18")` | `parseInt("18", 10)` |
| 简写 | `int(input(...))` | `parseInt(prompt(...), 10)` |

注意 JS 的 `parseInt` 第二个参数 `10` 表示十进制，建议始终写上。

## 六、使用 float 转成小数

如果输入的是价格、身高、体重这类可能带小数的数据，可以用 `float()`。

```python
price = float(input("请输入商品单价："))
count = int(input("请输入购买数量："))
total = price * count

print(f"总价：{total} 元")
```

输入示例：

```text
请输入商品单价：9.9
请输入购买数量：3
```

运行结果：

```text
总价：29.700000000000003 元
```

这里出现小数精度现象，暂时不用紧张，上一篇讲过了。

JS 对照：

```js
const price = parseFloat('9.9')
const count = parseInt('3', 10)
const total = price * count

console.log(`总价：${total} 元`)  // 总价：29.700000000000003 元
```

## 七、使用 str 转成字符串

有时需要把数字转成字符串。

```python
age = 18
text = "年龄：" + str(age)
print(text)
```

运行结果：

```text
年龄：18
```

不过实际输出时，更推荐使用 f-string，不需要手动转：

```python
age = 18
print(f"年龄：{age}")
```

f-string 会自动把变量转成字符串。

JS 对照：

```js
const age = 18
const text = '年龄：' + String(age)
console.log(text)

// 或模板字符串（不需要手动转）
console.log(`年龄：${age}`)
```

## 八、类型转换对照总表

| 转换方向 | Python | JS |
| --- | --- | --- |
| 字符串 → 整数 | `int("18")` | `parseInt("18", 10)` |
| 字符串 → 小数 | `float("9.9")` | `parseFloat("9.9")` |
| 整数 → 字符串 | `str(18)` | `String(18)` 或 `18.toString()` |
| 小数 → 字符串 | `str(9.9)` | `String(9.9)` 或 `9.9.toString()` |
| 小数 → 整数 | `int(9.9)` → `9`（截断） | `Math.trunc(9.9)` 或 `parseInt(9.9)` |
| 整数 → 小数 | `float(18)` → `18.0` | 自动，不需要转 |
| 字符串 → 布尔 | `bool("")` → `False` | `Boolean("")` → `false` |
| 数字 → 布尔 | `bool(0)` → `False` | `Boolean(0)` → `false` |

## 九、输入不合法会报错

如果代码需要整数：

```python
age = int(input("请输入年龄："))
```

但用户输入：

```text
十八
```

程序会报错：

```text
ValueError: invalid literal for int() with base 10: '十八'
```

因为 `int()` 不知道怎么把"十八"转成数字。

同样，输入 `3.14` 给 `int()` 也会报错：

```python
int("3.14")  # ValueError!
```

正确做法：先 `float()` 再 `int()`，或者直接用 `float()`。

```python
int(float("3.14"))   # 3
```

新手阶段先保证自己输入正确格式的数据。后面学习 `try-except` 后，就能优雅地处理用户输入错误。

JS 对照：

```js
parseInt('十八', 10)   // NaN（不报错，但结果无意义）
parseInt('3.14', 10)   // 3（自动截断小数部分）
parseFloat('3.14')     // 3.14
Number('十八')         // NaN
```

JS 不报错，返回 `NaN`。Python 报错更直接。

## 十、布尔类型 bool

Python 还有一个类型叫 `bool`，只有两个值：`True` 和 `False`。

```python
is_admin = True
is_published = False

print(type(is_admin))    # <class 'bool'>
```

### JS 对照

| Python | JS |
| --- | --- |
| `True` | `true` |
| `False` | `false` |

**注意大小写：Python 首字母大写，JS 全小写。**

### 哪些值是"假"

Python 中以下值都是 `False`：

```python
bool(0)        # False
bool(0.0)      # False
bool("")       # False（空字符串）
bool(None)     # False
bool([])       # False（空列表）
bool({})       # False（空字典）
```

其他值都是 `True`：

```python
bool(1)        # True
bool(-1)       # True（负数也是 True！）
bool("0")      # True（字符串 "0" 不是空字符串）
bool("False")  # True（字符串 "False" 不是空字符串）
```

JS 的"假值"（falsy）：

```js
Boolean(0)          // false
Boolean('')         // false
Boolean(null)       // false
Boolean(undefined)  // false
Boolean(NaN)        // false
```

**核心区别：**

1. JS 多了 `undefined` 和 `NaN` 作为假值，Python 没有这两个。
2. Python 空列表 `[]`、空字典 `{}` 是假值，JS 空数组 `[]` 和空对象 `{}` 是**真值**！

```js
Boolean([])   // true！JS 空数组是真值
Boolean({})   // true！JS 空对象是真值
```

```python
bool([])      # False
bool({})      # False
```

这是一个很容易混淆的地方。

### 字符串 "0" 不是 False

```python
bool("0")      # True（字符串 "0" 不是空字符串）
bool("False")  # True（字符串 "False" 不是空字符串）
```

```js
Boolean('0')      // true
Boolean('false')  // true
```

这一点 Python 和 JS 一样——非空字符串都是真值。

## 十一、自动类型转换

Python 在某些运算中会自动转换类型：

```python
# 整数和小数运算，结果自动变成小数
result = 10 + 3.0
print(result)        # 13.0
print(type(result))  # <class 'float'>
```

但字符串不会自动转换：

```python
"18" + 1    # TypeError！Python 不允许
```

JS 会自动转换：

```js
'18' + 1    // '181'（字符串拼接）
'18' - 1    // 17（数字减法，自动转数字）
'18' * 2    // 36（数字乘法，自动转数字）
```

JS 的隐式转换规则非常复杂，经常出 bug。Python 不允许字符串和数字混算，反而更安全。

### 对照表

| 运算 | Python | JS |
| --- | --- | --- |
| `"18" + 1` | TypeError 报错 | `'181'`（拼接） |
| `"18" - 1` | TypeError 报错 | `17`（自动转数字） |
| `"18" * 2` | TypeError 报错 | `36`（自动转数字） |
| `10 + 3.0` | `13.0`（自动转 float） | `13`（自动 number） |

## 十二、查看类型 type

Python 用 `type()` 查看类型：

```python
print(type(18))       # <class 'int'>
print(type(3.14))     # <class 'float'>
print(type("hello"))  # <class 'str'>
print(type(True))     # <class 'bool'>
print(type(None))     # <class 'NoneType'>
```

JS 用 `typeof`：

```js
console.log(typeof 18)        // 'number'
console.log(typeof 3.14)      // 'number'
console.log(typeof 'hello')   // 'string'
console.log(typeof true)      // 'boolean'
console.log(typeof null)      // 'object'（JS 的历史 bug）
console.log(typeof undefined) // 'undefined'
```

对照：

| 功能 | Python | JS |
| --- | --- | --- |
| 查看类型 | `type(18)` | `typeof 18` |
| 返回值 | `<class 'int'>` | `'number'` |
| null 的类型 | `type(None)` → `<class 'NoneType'>` | `typeof null` → `'object'`（bug） |

注意 JS 的 `typeof null` 返回 `'object'`，这是 JS 的历史遗留 bug。

## 十三、容易和 JS 混淆的地方汇总

| 容易混的点 | Python | JS | 怎么记 |
| --- | --- | --- | --- |
| 用户输入 | `input()` | `prompt()` 或表单 | Python 命令行输入，JS 浏览器输入 |
| 输入类型 | 永远是字符串 | 永远是字符串 | 这点一样 |
| 字符串+数字 | 报错 TypeError | 隐式拼接 `'181'` | Python 更严格 |
| 转整数 | `int("18")` | `parseInt("18", 10)` | Python 简洁 |
| 转小数 | `float("9.9")` | `parseFloat("9.9")` | Python 简洁 |
| 转字符串 | `str(18)` | `String(18)` | 差不多 |
| 布尔值 | `True` / `False` | `true` / `false` | Python 首字母大写！ |
| 空数组真假 | `bool([])` → `False` | `Boolean([])` → `true` | **完全相反！** |
| 空对象真假 | `bool({})` → `False` | `Boolean({})` → `true` | **完全相反！** |
| 查看类型 | `type(x)` | `typeof x` | 函数 vs 运算符 |
| null 类型 | `NoneType` | `'object'`（bug） | Python 更合理 |

## 十四、企业项目实战：命令行录入文章

虽然真实项目用 Web 表单而不是命令行，但理解 `input()` 和类型转换是基础。

```python
# 模拟命令行录入文章信息
title = input("文章标题：")
category = input("分类名称：")
tags_str = input("标签（逗号分隔）：")
view_count_str = input("浏览次数：")

# 类型转换
view_count = int(view_count_str) if view_count_str else 0

# 清理标签
tags = [tag.strip() for tag in tags_str.split(",") if tag.strip()]

# 输出结果
print(f"\n文章标题：{title}")
print(f"分类：{category}")
print(f"标签：{tags}")
print(f"浏览次数：{view_count}")
print(f"标签数量：{len(tags)}")
```

JS 对照（浏览器环境）：

```js
const title = prompt('文章标题：')
const category = prompt('分类名称：')
const tagsStr = prompt('标签（逗号分隔）：')
const viewCountStr = prompt('浏览次数：')

const viewCount = viewCountStr ? parseInt(viewCountStr, 10) : 0

const tags = tagsStr
  ? tagsStr.split(',').map(tag => tag.trim()).filter(tag => tag !== '')
  : []

console.log(`文章标题：${title}`)
console.log(`分类：${category}`)
console.log(`标签：`, tags)
console.log(`浏览次数：${viewCount}`)
console.log(`标签数量：${tags.length}`)
```

## 十五、本篇练习

练习一：年龄计算器。

Python：

```python
name = input("请输入姓名：")
age = int(input("请输入年龄："))

print(f"{name}，你好")
print(f"你今年 {age} 岁")
print(f"五年后你 {age + 5} 岁")
```

JS：

```js
const name = prompt('请输入姓名：')
const age = parseInt(prompt('请输入年龄：'), 10)

console.log(`${name}，你好`)
console.log(`你今年 ${age} 岁`)
console.log(`五年后你 ${age + 5} 岁`)
```

练习二：找错误。

```python
age = input("请输入年龄：")
if age > 18:           # TypeError! age 是字符串，不能和数字比较
    print("成年了")
```

正确：

```python
age = int(input("请输入年龄："))
if age > 18:
    print("成年了")
```

练习三：判断输入是否为空。

```python
name = input("请输入姓名：")

if name == "":
    print("姓名不能为空")
else:
    print(f"你好，{name}")
```

或利用布尔转换：

```python
name = input("请输入姓名：")

if not name:           # 空字符串是 False，not False 就是 True
    print("姓名不能为空")
else:
    print(f"你好，{name}")
```

JS：

```js
const name = prompt('请输入姓名：')

if (!name) {
  console.log('姓名不能为空')
} else {
  console.log(`你好，${name}`)
}
```

## 本篇小结

1. `input()` 可以接收用户输入，括号里写提示语。
2. `input()` 得到的内容**永远是字符串**，和 JS 的 `e.target.value` 一样。
3. `int("18")` 转整数，`float("9.9")` 转小数，`str(18)` 转字符串。
4. Python 字符串+数字报错，JS 隐式拼接——Python 更严格更安全。
5. Python 布尔值 `True` / `False` 首字母大写，JS `true` / `false` 全小写。
6. Python 空列表 `[]`、空字典 `{}` 是假值，JS 空数组、空对象是真值——**完全相反**。
7. `type(x)` 查看类型（Python），`typeof x`（JS）。
8. 输入不合法会报 `ValueError`，新手阶段先保证输入格式正确。
