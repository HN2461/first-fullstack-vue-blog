---
title: Python 零基础入门 03：print 输出与注释
slug: python-zero-print-and-comments
summary: 详细讲解 Python print 输出、多个值输出、换行控制、sep/end 参数、f-string 格式化，以及注释规范，并逐项对照 JavaScript 的 console.log、模板字符串和注释写法。
category:
tags: []
status: draft
cover:
---

# Python 零基础入门 03：print 输出与注释

`print()` 是 Python 新手最先接触的工具。

它的作用很简单：**把内容显示到屏幕上。**

前端 JS 里，你最熟悉的对应工具大概率是：

```js
console.log('内容')
```

所以可以先粗略对照：

| 作用 | Python | JavaScript |
| --- | --- | --- |
| 输出内容 | `print()` | `console.log()` |
| 单行注释 | `# 注释内容` | `// 注释内容` |
| 多行说明 | 多个 `#` 或 docstring | `/* 多行注释 */` |
| 变量插入字符串 | f-string | 模板字符串 |

这一篇要解决：

1. 怎么输出字符串、数字、变量。
2. 怎么一次输出多个内容。
3. `print()` 为什么默认换行。
4. `end` 和 `sep` 是什么。
5. Python f-string 和 JS 模板字符串怎么对照。
6. 注释应该怎么写，什么时候写。
7. 企业项目里为什么不能乱打日志、乱输出敏感信息。

## 一、print 是什么

`print()` 是 Python 内置函数。

"内置"的意思是：Python 自带，不需要你安装，也不需要你自己定义。你打开 Python 就能用。

最简单写法：

```python
print("你好，Python")
```

运行结果：

```text
你好，Python
```

拆开看：

| 部分 | 含义 |
| --- | --- |
| `print` | Python 提供的输出函数 |
| `()` | 调用函数（和 JS 一样，调用函数要写括号） |
| `"你好，Python"` | 要输出的内容（字符串） |

在 Python 3 里，`print` 是函数，所以必须写括号。

错误写法：

```python
print "你好"
```

正确写法：

```python
print("你好")
```

> Python 2 时代 `print` 不是函数而是语句，可以不加括号。但 Python 2 已经在 2020 年停止维护了，现在学的都是 Python 3，必须写括号。

## 二、JS 对照：console.log 是什么

JavaScript 里常用：

```js
console.log('你好，JavaScript')
```

拆开看：

| 部分 | 含义 |
| --- | --- |
| `console` | 控制台对象（浏览器或 Node.js 提供的） |
| `.log` | 输出日志的方法 |
| `()` | 调用方法 |
| `'你好，JavaScript'` | 要输出的内容 |

你可以先记：

```text
Python 的 print() ≈ JS 的 console.log()
```

但它们不是完全一样。

相同点：

1. 都能输出内容。
2. 都常用于学习阶段和调试阶段。
3. 都能输出字符串、数字、变量。
4. 都能帮助你确认代码有没有执行。

核心区别：

1. Python 是 `print()`——一个独立的内置函数。
2. JS 是 `console.log()`——`console` 对象上的一个方法。
3. Python 的 `print` 是内置函数，直接调用。
4. JS 的 `console.log` 需要先有 `console` 对象（浏览器或 Node.js 提供）。
5. Python 输出通常看终端。
6. 前端 JS 输出通常看浏览器控制台，Node.js 输出通常看终端。

高频踩坑：

Python 里不要写：

```python
console.log("你好")
```

JS 里不要写：

```js
print('你好')
```

除非你自己定义过 `print`，否则 JS 默认没有 Python 的 `print()`。

## 三、输出字符串

字符串就是文本内容。

Python 可以用双引号：

```python
print("你好，Python")
```

也可以用单引号：

```python
print('你好，Python')
```

两种都能输出：

```text
你好，Python
```

如果字符串里有单引号，可以外面用双引号：

```python
print("I'm learning Python")
```

如果字符串里有双引号，可以外面用单引号：

```python
print('他说："你好"')
```

JS 也一样：

```js
console.log("I'm learning JavaScript")
console.log('他说："你好"')
```

相同点：

1. Python 和 JS 都可以用单引号。
2. Python 和 JS 都可以用双引号。
3. 引号必须成对出现。
4. 字符串内容会按文本输出。

核心区别：

1. JS 还有模板字符串，也就是反引号 `` ` ``。
2. Python 没有 JS 同款反引号字符串。
3. Python 常用 f-string 做变量插入。
4. JS 常用模板字符串做变量插入。

高频踩坑：

```python
print("你好)
```

这少了右引号，会报错：`SyntaxError: EOL while scanning string literal`。

JS 里：

```js
console.log('你好)
```

也会报错：`SyntaxError: Invalid or unexpected token`。

### Python 字符串用单引号还是双引号？

都可以，效果完全一样。Python 社区没有强制约定。

常见做法：

- 一个项目里保持统一就行
- 字符串里有双引号就用单引号包，反之亦然
- 个人习惯上，Python 社区更偏好单引号，但双引号也很常见

## 四、输出数字

Python 可以直接输出数字：

```python
print(18)
print(3.14)
```

输出：

```text
18
3.14
```

数字不需要引号。

注意区别：

```python
print(18)
print("18")
```

肉眼看输出都像 `18`，但类型不同：

1. `18` 是数字（整数，Python 叫 `int`）。
2. `"18"` 是字符串（Python 叫 `str`）。

类型不同，后续做计算时行为完全不同：

```python
print(18 + 2)    # 输出 20（数字加法）
print("18" + 2)  # 报错！字符串不能和数字相加
print("18" + "2")  # 输出 "182"（字符串拼接）
```

JS 对照：

```js
console.log(18 + 2)    // 输出 20（数字加法）
console.log('18' + 2)  // 输出 '182'（JS 自动把 2 转成字符串，然后拼接）
console.log('18' + '2')  // 输出 '182'（字符串拼接）
```

**这是 Python 和 JS 一个很重要的区别：**

| 场景 | Python | JS |
| --- | --- | --- |
| `"18" + 2` | **报错** TypeError | 输出 `"182"`（隐式转换） |
| `"18" + "2"` | 输出 `"182"` | 输出 `"182"` |

Python 更严格：字符串和数字不能直接相加，你必须手动转换类型。

JS 更"宽容"：它会自动做类型转换，但结果可能不是你想要的。

所以：**Python 的严格虽然让你多写一步，但能帮你避免很多隐藏 bug。**

相同点：

1. 数字不加引号。
2. 加了引号就变成字符串。
3. 输出结果看起来可能一样，但类型不同。

核心区别：

1. Python 区分 `int`（整数）和 `float`（小数）。
2. JS 大多数普通数字都是 `number` 类型。
3. Python 字符串和数字不能直接相加，会报错。
4. JS 字符串和数字相加会自动拼接，不会报错但可能不是你要的结果。

## 五、输出变量

变量就是给数据起名字。

Python：

```python
name = "小明"
print(name)
```

输出：

```text
小明
```

这里不是输出文本 `"name"`，而是输出变量 `name` 里保存的值。

对比：

```python
name = "小明"

print(name)
print("name")
```

输出：

```text
小明
name
```

- `print(name)` —— `name` 没有引号，Python 把它当成变量名，输出变量的值
- `print("name")` —— `"name"` 有引号，Python 把它当成字符串文本，原样输出

JS 对照：

```js
const name = '小明'

console.log(name)     // 输出：小明（变量值）
console.log('name')   // 输出：name（字符串文本）
```

如果你对 JS 的 `const` 不太熟悉，这里补一句：

- `const name = '小明'` 表示声明一个叫 `name` 的常量，值为 `'小明'`
- Python 不需要 `const`，直接写 `name = "小明"` 就行

相同点：

1. 不加引号表示变量名。
2. 加引号表示字符串文本。
3. 输出变量时，会显示变量保存的值。
4. 输出字符串时，会显示引号里的内容。

高频踩坑：

如果你想输出变量值，不要加引号。

Python：

```python
print("name")
```

输出的是 `name`，不是"小明"。

## 六、一次输出多个内容

Python 的 `print()` 可以一次输出多个内容，用逗号隔开。

```python
name = "小明"
age = 18

print("姓名：", name)
print("年龄：", age)
```

输出：

```text
姓名： 小明
年龄： 18
```

Python 用逗号输出多个内容时，默认会在它们之间加一个空格。

```python
print("A", "B", "C")
```

输出：

```text
A B C
```

注意观察：逗号后面的内容前面多了一个空格。这是 `print()` 的默认行为。

JS 对照：

```js
const name = '小明'
const age = 18

console.log('姓名：', name)
console.log('年龄：', age)
```

相同点：

1. 都可以一次输出多个内容。
2. 都能混合输出字符串和变量。
3. 都常用于调试变量。

核心区别：

1. Python 输出的是终端文本流，多个值之间默认加空格。
2. 浏览器 `console.log()` 对对象、数组有更丰富的可展开效果。
3. Python 输出复杂对象通常显示它的字符串表示。
4. 前端调试接口数据时，浏览器控制台查看对象更方便。

## 七、print 默认会换行

Python 每执行一次 `print()`，默认输出完会换一行。

```python
print("第一行")
print("第二行")
print("第三行")
```

输出：

```text
第一行
第二行
第三行
```

因为 `print()` 默认结尾是换行符 `\n`。

什么是 `\n`？它是一个特殊字符，表示"换到下一行"。你在很多语言里都会见到它。

JS 的 `console.log()` 也类似：

```js
console.log('第一行')
console.log('第二行')
console.log('第三行')
```

也会一条日志一行。

相同点：

1. 每次输出默认单独一行。
2. 连续输出能观察代码执行顺序。
3. 学习和调试阶段非常有用。

## 八、控制不换行：end 参数

Python 的 `print()` 有一个参数叫 `end`。

默认行为：

```python
print("你好")
```

等价于：

```python
print("你好", end="\n")
```

`\n` 表示换行。

如果不想换行：

```python
print("你好", end="")
print("Python")
```

输出：

```text
你好Python
```

如果想在中间加空格而不是换行：

```python
print("你好", end=" ")
print("Python")
```

输出：

```text
你好 Python
```

`end` 参数的意思是：**输出完内容后，最后再追加什么。** 默认是追加换行符，你可以改成追加空格、什么都不追加、或者任何其他字符串。

JS 对照：

浏览器 `console.log()` 一般不这样控制"不换行"。Node.js 里可以用：

```js
process.stdout.write('你好')
process.stdout.write('JavaScript')
```

输出：

```text
你好JavaScript
```

核心区别：

1. Python 直接用 `print(..., end="")`，很方便。
2. JS 浏览器环境不常这样控制输出。
3. Node.js 可用 `process.stdout.write()`，但写法更底层。

## 九、控制分隔符：sep 参数

Python `print()` 用逗号输出多个值时，默认用空格分隔。

```python
print("2026", "06", "21")
```

输出：

```text
2026 06 21
```

如果想用横线连接：

```python
print("2026", "06", "21", sep="-")
```

输出：

```text
2026-06-21
```

`sep` 是 separator（分隔符）的缩写，表示多个输出值之间用什么连接。

也可以用其他分隔符：

```python
print("苹果", "香蕉", "橘子", sep="、")
```

输出：

```text
苹果、香蕉、橘子
```

JS 没有 `console.log()` 同款 `sep` 参数，通常自己拼。

数组 `join()`：

```js
console.log(['2026', '06', '21'].join('-'))
```

模板字符串：

```js
const year = '2026'
const month = '06'
const day = '21'

console.log(`${year}-${month}-${day}`)
```

相同点：

1. 都能输出格式化后的日期。
2. 都能把多个值组合成一个字符串。
3. 都能自定义连接符。

核心区别：

1. Python `print()` 自带 `sep` 参数，很方便。
2. JS 通常用 `join()` 或模板字符串拼接。
3. Python 的 `sep` 只影响当前这次 `print()` 的多个参数。

高频踩坑：

```python
print("2026", "06", "21", "-")
```

不会用横线连接前三个值，而是输出：

```text
2026 06 21 -
```

因为 `"-"` 被当成了第四个要输出的值，不是分隔符。

正确写法：

```python
print("2026", "06", "21", sep="-")
```

## 十、输出计算结果

Python 可以直接在 `print()` 里写计算表达式：

```python
print(1 + 2)
print(10 - 3)
print(4 * 5)
print(10 / 2)
```

输出：

```text
3
7
20
5.0
```

注意 `10 / 2` 输出的是 `5.0` 而不是 `5`。这是因为 Python 的 `/` 运算符永远返回浮点数（小数），即使结果刚好是整数。

JS 对照：

```js
console.log(1 + 2)    // 3
console.log(10 - 3)   // 7
console.log(4 * 5)    // 20
console.log(10 / 2)   // 5
```

相同点：

1. 都能在输出语句里直接写表达式。
2. 都会先计算表达式，再输出结果。
3. `+`、`-`、`*`、`/` 都是常见运算符。

核心区别：

1. Python `10 / 2` 输出 `5.0`，因为 `/` 结果永远是浮点数。
2. JS `10 / 2` 输出 `5`，但类型仍是 `number`。
3. Python 还有整除运算符 `//`：`10 // 3` 输出 `3`（只取整数部分）。
4. JS 没有整除运算符，通常用 `Math.floor(10 / 3)`。

### Python 的除法运算符

Python 有两种除法：

```python
print(10 / 3)    # 普通除法，输出 3.3333333333333335（浮点数）
print(10 // 3)   # 整除，输出 3（只取整数部分）
print(10 % 3)    # 取余，输出 1（10 除以 3 余 1）
```

JS 对照：

```js
console.log(10 / 3)          // 3.3333333333333335
console.log(Math.floor(10 / 3))  // 3
console.log(10 % 3)          // 1
```

| 运算 | Python | JS |
| --- | --- | --- |
| 普通除法 | `10 / 3` → `3.333...` | `10 / 3` → `3.333...` |
| 整除 | `10 // 3` → `3` | `Math.floor(10 / 3)` → `3` |
| 取余 | `10 % 3` → `1` | `10 % 3` → `1` |
| 幂运算 | `2 ** 3` → `8` | `2 ** 3` → `8` 或 `Math.pow(2, 3)` |

## 十一、字符串拼接输出

Python 可以用 `+` 拼接字符串。

```python
name = "小明"
print("你好，" + name)
```

输出：

```text
你好，小明
```

但是字符串不能直接和数字拼接：

```python
age = 18
print("年龄：" + age)
```

会报错：`TypeError: can only concatenate str (not "int") to str`。

翻译一下：**只能把字符串和字符串拼接，不能把字符串和整数拼接。**

需要先把数字转成字符串：

```python
age = 18
print("年龄：" + str(age))
```

`str()` 是 Python 内置函数，用来把其他类型转成字符串。

JS 对照：

```js
const age = 18
console.log('年龄：' + age)
```

JS 会自动把数字转成字符串，所以不会报错，输出 `年龄：18`。

相同点：

1. 都能用 `+` 拼接字符串。
2. 都能拼固定文本和变量。

核心区别：

1. Python 要求两边都是字符串才能拼接，否则报错。
2. JS 会做隐式转换，不会报错但可能不是你要的结果。
3. Python 更严格，但能帮你避免隐藏 bug。
4. JS 更灵活，但更容易产生意外结果。

### 为什么 Python 要这么严格

看一个 JS 的经典坑：

```js
console.log(1 + 2)        // 3
console.log('1' + 2)      // '12'
console.log(1 + '2')      // '12'
console.log('1' + '2')    // '12'
```

你看，`1 + 2` 是 `3`，但 `'1' + 2` 变成了 `'12'`。这种隐式转换经常让新手困惑。

Python 不允许这种事情发生：

```python
print(1 + 2)        # 3
print('1' + 2)      # 报错！TypeError
print(1 + '2')      # 报错！TypeError
print('1' + '2')    # '12'
```

Python 强制你明确类型，虽然多写一步 `str(age)`，但不容易出 bug。

## 十二、推荐格式化输出：f-string

Python 更推荐 f-string（格式化字符串）：

```python
name = "小明"
age = 18

print(f"姓名：{name}，年龄：{age}")
```

输出：

```text
姓名：小明，年龄：18
```

规则：

1. 字符串前加 `f`。
2. 变量写在 `{}` 里。
3. `{}` 里也可以写表达式。
4. 数字、字符串都能自然放进去，不需要手动转换类型。

**f-string 最大的好处是：你不需要担心类型问题。** `{}` 里不管放数字还是字符串，Python 都会自动帮你转成字符串并插入。

示例：

```python
price = 19.9
count = 3

print(f"总价：{price * count:.2f}")
```

输出：

```text
总价：59.70
```

`{price * count:.2f}` 的含义：

- `price * count` 是表达式，先计算得到 `59.7`
- `:.2f` 表示"保留两位小数"
- 所以最终输出 `59.70`

### f-string 详细说明

f-string 的格式是 `f"文字{变量}文字{变量}文字"`。

```python
name = "小红"
age = 20
score = 95.5

# 基本用法
print(f"姓名：{name}")

# 多个变量
print(f"{name} 今年 {age} 岁")

# 里面写表达式
print(f"3 年后 {age + 3} 岁")

# 格式化数字
print(f"成绩：{score:.1f} 分")  # 保留 1 位小数
```

输出：

```text
姓名：小红
小红 今年 20 岁
3 年后 23 岁
成绩：95.5 分
```

JS 对照：模板字符串。

```js
const name = '小红'
const age = 20
const score = 95.5

// 基本用法
console.log(`姓名：${name}`)

// 多个变量
console.log(`${name} 今年 ${age} 岁`)

// 里面写表达式
console.log(`3 年后 ${age + 3} 岁`)

// 格式化数字
console.log(`成绩：${score.toFixed(1)} 分`)
```

相同点：

1. 都适合把变量嵌入字符串。
2. 都比 `+` 拼接清晰。
3. 都可以写表达式。
4. 都常用于日志、提示语、接口路径。

核心区别：

| 对比项 | Python f-string | JS 模板字符串 |
| --- | --- | --- |
| 标记 | 字符串前加 `f` | 用反引号 `` ` `` 包裹 |
| 变量语法 | `{name}` | `${name}` |
| 变量前缀 | 不需要 `$` | **必须**写 `$` |
| 保留小数 | `{value:.2f}` | `value.toFixed(2)` |
| 字符串引号 | `f"..."` 或 `f'...'` | `` `...` ``（只能用反引号） |

高频踩坑：

**Python 忘记 `f`：**

```python
print("姓名：{name}")
```

会输出：

```text
姓名：{name}
```

变量没有被替换，因为这不是 f-string，只是普通字符串。

**JS 忘记反引号：**

```js
console.log('姓名：${name}')
```

也不会替换变量，因为模板字符串必须用反引号。

**Python 里多写了 `$`：**

```python
print(f"姓名：${name}")  # 错误！Python f-string 不需要 $
```

正确：

```python
print(f"姓名：{name}")   # 正确
```

**JS 里少了 `$`：**

```js
console.log(`姓名：{name}`)  // 错误！JS 模板字符串必须写 ${}
```

正确：

```js
console.log(`姓名：${name}`)  // 正确
```

### 总结：f-string vs 模板字符串

| | Python f-string | JS 模板字符串 |
| --- | --- | --- |
| 写法 | `f"{name}"` | `` `${name}` `` |
| 共同点 | 把变量嵌入字符串 | 把变量嵌入字符串 |
| 最大区别 | 花括号里**不需要** `$` | 花括号里**必须**写 `$` |

这个区别非常容易混，建议你刻意记住：

> **Python f-string：花括号直接放变量名，不要 `$`**
> **JS 模板字符串：花括号前必须写 `$`**

## 十三、注释是什么

注释是写在代码里的说明文字。

它不会作为业务代码执行。电脑会直接跳过注释。

Python 单行注释用 `#`：

```python
# 保存用户姓名
name = "小明"

# 输出用户姓名
print(name)
```

JS 单行注释用 `//`：

```js
// 保存用户姓名
const name = '小明'

// 输出用户姓名
console.log(name)
```

相同点：

1. 注释都是给人看的，不是给电脑执行的。
2. 注释不会影响程序运行。
3. 注释可以解释变量、逻辑、边界情况。
4. 好注释能降低维护成本。

核心区别：

1. Python 单行注释用 `#`。
2. JS 单行注释用 `//`。
3. JS 多行注释有 `/* */`。
4. Python 普通多行说明更常用多个 `#`。

高频踩坑：

Python 里不要写：

```python
// 这是注释
```

`//` 在 Python 里不是注释符号，如果这行刚好能被解释成其他语法，可能导致意外行为。

JS 里不要写：

```js
# 这是注释
```

`#` 在 JS 里不是注释符号，会报语法错误。

## 十四、注释应该写什么

注释不是把代码翻译一遍。

不好的注释：

```python
# 给 name 赋值为小明
name = "小明"
```

这行代码本身已经很清楚，不需要注释。

更有价值的注释：

```python
# 旧数据导入时作者可能为空，这里先使用系统默认作者，避免整批导入失败
author = "系统默认作者"
```

企业项目里，注释应该解释：

1. 为什么这样写。
2. 有什么业务规则。
3. 哪些地方不能随便改。
4. 有什么历史兼容原因。
5. 有什么边界处理。
6. 为什么暂时没有采用另一种方案。

JS 对照：

```js
// 后端旧接口可能返回 null，这里统一兜底，避免页面渲染时报错
const articleTitle = result.title || '未命名文章'
```

相同点：

1. 好注释解释原因，不只是复述代码。
2. 业务规则、兼容逻辑、危险操作值得写注释。
3. 显而易见的代码不需要注释。
4. 注释过多也会干扰阅读。

### 什么时候该写注释

| 情况 | 是否需要注释 |
| --- | --- |
| 变量名已经足够清楚 | 不需要 |
| 代码逻辑一目了然 | 不需要 |
| 有业务规则需要说明 | 需要 |
| 有临时方案或 hack | 需要 |
| 有边界情况需要处理 | 需要 |
| 别人看了可能会疑惑 | 需要 |

## 十五、多行注释和文档字符串

Python 普通多行说明推荐多个 `#`：

```python
# 这里处理旧文章导入逻辑：
# 1. 如果标题为空，跳过导入
# 2. 如果分类不存在，使用默认分类
# 3. 如果发布时间为空，使用当前时间
```

Python 也有三引号字符串：

```python
"""
这里可以写多行文字。
但严格来说，它是一个字符串，不是传统意义上的注释。
如果它单独出现在文件中，Python 会执行它但什么都不做。
"""
```

在函数、类、模块开头，三引号常用作文档字符串 docstring：

```python
def add(a, b):
    """
    计算两个数字的和。
    a: 第一个数字
    b: 第二个数字
    返回: a + b 的结果
    """
    return a + b
```

docstring 和普通注释的区别：

- 注释是给人看的，程序完全忽略
- docstring 是函数/类/模块的"说明书"，可以被工具读取和展示
- 用 `help(add)` 可以查看函数的 docstring

JS 多行注释：

```js
/*
这里处理旧文章导入逻辑：
1. 如果标题为空，跳过导入
2. 如果分类不存在，使用默认分类
3. 如果发布时间为空，使用当前时间
*/
```

JS 函数文档常用 JSDoc：

```js
/**
 * 计算两个数字的和。
 * @param {number} a 第一个数字
 * @param {number} b 第二个数字
 * @returns {number} 两数之和
 */
function add(a, b) {
  return a + b
}
```

对照：

| 用途 | Python | JS |
| --- | --- | --- |
| 单行注释 | `#` | `//` |
| 多行注释 | 多个 `#` | `/* ... */` |
| 函数文档 | docstring `"""..."""` | JSDoc `/** ... */` |

## 十六、用注释临时关闭代码

调试时常用注释来临时关闭某行代码：

Python：

```python
print("第一行")
# print("第二行")
print("第三行")
```

输出：

```text
第一行
第三行
```

JS：

```js
console.log('第一行')
// console.log('第二行')
console.log('第三行')
```

相同点：

1. 都可以用注释临时关闭代码。
2. 调试时很常用。
3. 可以帮助逐步排查问题。

但企业项目里，不要长期保留大量废弃注释代码。如果确定不用，应该删除，避免项目越来越乱。

版本控制工具（如 Git）会帮你记住历史代码，不需要靠注释保留。

## 十七、企业项目里的输出和日志

学习阶段可以大胆用 `print()`。

比如批量处理文章：

```python
articles = ["Python 入门", "JS 基础", "Vue 项目"]

for article in articles:
    print(f"正在处理文章：{article}")

print("全部处理完成")
```

但是正式后端服务里，不建议到处写 `print()` 当日志。

更常见的是日志模块：

```python
import logging

logging.info("开始处理文章导入")
logging.warning("文章缺少分类，使用默认分类")
logging.error("文章保存失败")
```

为什么不用 `print()` 而要用 `logging`？

1. `logging` 可以设置日志级别（debug/info/warning/error）。
2. `logging` 可以输出到文件，不只是终端。
3. `logging` 可以在生产环境关闭调试日志，不用删代码。
4. `print()` 输出的内容不好管理，上线后很难关掉。

前端 JS 里，`console.log()` 也很常见：

```js
console.log('接口返回：', result)
console.log('当前选中的菜单：', activeMenu)
```

但正式上线前不应该保留大量无意义 `console.log()`。

原因：

1. 控制台信息杂乱。
2. 可能泄露数据。
3. 影响排查真正问题。
4. 团队规范可能禁止提交普通 `console.log()`。

特别注意：不要输出敏感信息。

Python 不要这样：

```python
print(f"用户密码：{password}")
```

JS 不要这样：

```js
console.log(`用户 token：${token}`)
```

密码、token、密钥、身份证号、手机号等敏感数据都不能随便输出。

## 十八、完整实操：输出用户信息

Python：

```python
# 用户基础信息
name = "小明"
age = 18
city = "上海"

# 输出用户信息
print("用户信息")
print("姓名：", name)
print("年龄：", age)
print("城市：", city)

# 使用 f-string 输出完整句子
print(f"{name} 今年 {age} 岁，来自 {city}")
```

输出：

```text
用户信息
姓名： 小明
年龄： 18
城市： 上海
小明 今年 18 岁，来自 上海
```

JS 对照：

```js
// 用户基础信息
const name = '小明'
const age = 18
const city = '上海'

// 输出用户信息
console.log('用户信息')
console.log('姓名：', name)
console.log('年龄：', age)
console.log('城市：', city)

// 使用模板字符串输出完整句子
console.log(`${name} 今年 ${age} 岁，来自 ${city}`)
```

逐行对照：

| Python | JS | 说明 |
| --- | --- | --- |
| `# 注释` | `// 注释` | 注释符号不同 |
| `name = "小明"` | `const name = '小明'` | Python 不需要声明关键字 |
| `print("用户信息")` | `console.log('用户信息')` | 输出函数不同 |
| `print("姓名：", name)` | `console.log('姓名：', name)` | 多值输出写法类似 |
| `f"{name} 今年 {age} 岁"` | `` `${name} 今年 ${age} 岁` `` | 格式化字符串语法不同 |

## 十九、容易和 JS 混淆的地方汇总

这篇内容比较多，最后帮你总结最容易混的几个点：

| 容易混的点 | Python 写法 | JS 写法 | 怎么记 |
| --- | --- | --- | --- |
| 输出函数 | `print()` | `console.log()` | Python 直接打印，JS 先找控制台 |
| 注释 | `#` | `//` | Python 用井号，JS 用双斜杠 |
| 格式化字符串 | `f"{name}"` | `` `${name}` `` | Python 不要 `$`，JS 必须 `$` |
| 字符串+数字 | 报错！ | 隐式转换 | Python 严格，JS 随意 |
| 换行控制 | `end=""` | 无直接等价 | Python 更方便 |
| 分隔符 | `sep="-"` | 无直接等价 | Python 更方便 |

## 二十、本篇练习

练习一：基础输出。

Python：

```python
print("我正在学习 Python")
print("我会对照 JavaScript 学习")
print("输出可以帮助我检查代码运行结果")
```

JS：

```js
console.log('我正在复习 JavaScript')
console.log('我会对照 Python 学习')
console.log('输出可以帮助我检查代码运行结果')
```

练习二：变量输出。

Python：

```python
name = "小明"
role = "前端学习者"

print("姓名：", name)
print("角色：", role)
print(f"{name} 是一名 {role}")
```

JS：

```js
const name = '小明'
const role = '前端学习者'

console.log('姓名：', name)
console.log('角色：', role)
console.log(`${name} 是一名 ${role}`)
```

练习三：找错误。

Python：

```python
name = "小明"
print("姓名：{name}")
```

问题：少了 `f`，变量不会被替换。

正确：

```python
print(f"姓名：{name}")
```

JS：

```js
const name = '小明'
console.log('姓名：${name}')
```

问题：用了单引号，模板变量不会生效。

正确：

```js
console.log(`姓名：${name}`)
```

练习四：找错误 2。

Python：

```python
age = 18
print("年龄：" + age)
```

问题：字符串和数字不能直接拼接。

正确（两种方式）：

```python
print("年龄：" + str(age))    # 方式一：手动转换
print(f"年龄：{age}")          # 方式二：用 f-string（推荐）
```

## 本篇小结

1. Python 输出用 `print()`，JS 输出常用 `console.log()`。
2. `print("内容")` 可以输出字符串，`print(变量名)` 输出变量里的值。
3. `print("变量名")` 输出的是文本，不是变量值——注意引号。
4. Python 可以用逗号一次输出多个内容，默认用空格分隔。
5. Python `print()` 默认换行，因为 `end="\n"`。
6. `end=""` 可以控制不换行，`end=" "` 可以控制结尾加空格。
7. `sep="-"` 可以控制多个输出内容之间的分隔符。
8. Python 推荐用 f-string 做格式化输出：`f"姓名：{name}"`。
9. JS 推荐用模板字符串做变量嵌入：`` `姓名：${name}` ``。
10. f-string 花括号里不需要 `$`，JS 模板字符串必须写 `$`。
11. Python 字符串和数字不能直接相加，会报错；JS 会隐式转换。
12. Python 单行注释用 `#`，JS 单行注释用 `//`。
13. Python 普通多行说明推荐多个 `#`，JS 多行注释可以用 `/* */`。
14. 注释应该解释"为什么"，不要只是翻译代码。
15. 学习阶段可以多用输出调试，企业项目中要避免输出敏感信息。
16. 正式后端项目里，要逐步学习 `logging`，不能永远依赖 `print()`。
