---
title: Python 零基础入门 16：小练习记账本
slug: python-zero-mini-project-account-book
summary: 用前面学过的变量、输入、类型转换、条件判断、循环、列表、字典和文件写入，完成一个适合零基础的新手记账本练习，全程对照 JavaScript。
category: Python入门
tags:
  - Python
  - 零基础入门
status: draft
cover:
---

# Python 零基础入门 16：小练习记账本

这一篇把前面学过的内容串起来，做一个简单记账本。

它会用到：

- `input`
- 类型转换
- 条件判断
- 循环
- 列表
- 字典
- 文件写入

前端 JS 里，类似的功能会怎么做？用 Vue 组件 + 表单 + API 请求。Python 命令行版更简单直接，但核心逻辑（数据结构、输入校验、持久化）是一样的。

## 目标效果

程序运行后，可以不断输入支出记录。

输入 `q` 时结束，并把记录保存到文件里。

示例：

```text
请输入消费名称，输入 q 结束：早餐
请输入金额：8
请输入消费名称，输入 q 结束：地铁
请输入金额：4
请输入消费名称，输入 q 结束：q
本次共记录 2 条
总支出：12.0 元
记录已保存到 account_book.txt
```

## 第一步：保存一条记录

先用字典表示一条消费。

Python：

```python
record = {
    "name": "早餐",
    "amount": 8.0
}

print(record)
```

JS 对照：

```js
const record = {
  name: '早餐',
  amount: 8.0
}

console.log(record)
```

区别：Python 键需要引号，JS 可以省略。

## 第二步：用列表保存多条记录

Python：

```python
records = []

records.append({"name": "早餐", "amount": 8.0})
records.append({"name": "地铁", "amount": 4.0})

print(records)
```

JS 对照：

```js
const records = []

records.push({ name: '早餐', amount: 8.0 })
records.push({ name: '地铁', amount: 4.0 })

console.log(records)
```

列表（数组）+ 字典（对象）是最常见的数据结构组合，Python 和 JS 都一样。

## 第三步：循环输入

Python：

```python
records = []

while True:
    name = input("请输入消费名称，输入 q 结束：")

    if name == "q":
        break

    amount = float(input("请输入金额："))
    records.append({"name": name, "amount": amount})

print(records)
```

`while True` 表示一直循环。当用户输入 `q` 时，执行 `break`，结束循环。

JS 对照（浏览器环境）：

```js
const records = []

while (true) {
  const name = prompt('请输入消费名称，输入 q 结束：')
  if (name === 'q') break

  const amount = parseFloat(prompt('请输入金额：'))
  records.push({ name, amount })
}

console.log(records)
```

## 第四步：计算总支出

Python：

```python
records = [
    {"name": "早餐", "amount": 8.0},
    {"name": "地铁", "amount": 4.0}
]

total = 0

for record in records:
    total += record["amount"]

print(total)   # 12.0
```

JS 对照：

```js
const total = records.reduce((sum, r) => sum + r.amount, 0)
console.log(total)  // 12
```

或用循环：

```js
let total = 0
for (const record of records) {
  total += record.amount
}
```

Python 访问字典用 `record["amount"]`，JS 用 `record.amount` 或 `record["amount"]`。

## 第五步：保存到文件

Python：

```python
with open("account_book.txt", "w", encoding="utf-8") as file:
    for record in records:
        file.write(f"{record['name']}：{record['amount']} 元\n")
```

JS 对照（Node.js）：

```js
const fs = require('fs')
const content = records.map(r => `${r.name}：${r.amount} 元`).join('\n')
fs.writeFileSync('account_book.txt', content, 'utf-8')
```

## 完整代码

```python
records = []

while True:
    name = input("请输入消费名称，输入 q 结束：")

    if name == "q":
        break

    amount = float(input("请输入金额："))
    records.append({
        "name": name,
        "amount": amount
    })

total = 0

for record in records:
    total += record["amount"]

with open("account_book.txt", "w", encoding="utf-8") as file:
    for record in records:
        file.write(f"{record['name']}：{record['amount']} 元\n")
    file.write(f"总支出：{total} 元\n")

print(f"本次共记录 {len(records)} 条")
print(f"总支出：{total} 元")
print("记录已保存到 account_book.txt")
```

生成的 `account_book.txt`：

```text
早餐：8.0 元
地铁：4.0 元
总支出：12.0 元
```

## 可以继续改进的地方

这个记账本还很简单，但它已经是一个完整小程序。

后面可以继续改进：

- 输入金额时检查是不是数字。
- 支持收入和支出两种类型。
- 每次运行时不覆盖旧记录，而是追加记录。
- 按日期统计总支出。
- 使用 JSON 文件保存数据。

## 工作化改造：让小练习更像真实代码

真实工作里，很少把所有代码都堆在一起。

更常见的做法是：

- 用函数拆分不同职责。
- 用户输入要校验。
- 数据保存成 JSON，方便读取。
- 程序运行结果要清楚告诉用户。

下面是一个升级版记账本，仍然放在一个文件里，但已经开始接近工作代码的组织方式。

```python
import json
from pathlib import Path

DATA_FILE = Path("account_book.json")


def load_records():
    """从文件加载记录"""
    if not DATA_FILE.exists():
        return []

    with open(DATA_FILE, "r", encoding="utf-8") as file:
        return json.load(file)


def save_records(records):
    """保存记录到文件"""
    with open(DATA_FILE, "w", encoding="utf-8") as file:
        json.dump(records, file, ensure_ascii=False, indent=2)


def input_amount():
    """输入并校验金额"""
    while True:
        amount_text = input("请输入金额：")

        try:
            amount = float(amount_text)
        except ValueError:
            print("金额必须是数字，请重新输入")
            continue

        if amount <= 0:
            print("金额必须大于 0")
            continue

        return amount


def add_record(records):
    """添加一条记录"""
    name = input("请输入消费名称：").strip()

    if not name:
        print("消费名称不能为空")
        return

    amount = input_amount()
    records.append({
        "name": name,
        "amount": amount
    })
    save_records(records)
    print("记录已保存")


def show_summary(records):
    """展示汇总"""
    if not records:
        print("暂无记录")
        return

    total = 0

    print("消费明细：")
    for record in records:
        print(f"- {record['name']}：{record['amount']} 元")
        total += record["amount"]

    print(f"总支出：{total} 元")


def main():
    """主程序"""
    records = load_records()

    while True:
        print()
        print("1. 添加消费")
        print("2. 查看汇总")
        print("q. 退出")

        choice = input("请选择操作：").strip()

        if choice == "1":
            add_record(records)
        elif choice == "2":
            show_summary(records)
        elif choice == "q":
            print("已退出")
            break
        else:
            print("未知操作，请重新选择")


main()
```

生成的 `account_book.json` 类似：

```json
[
  {
    "name": "早餐",
    "amount": 8.0
  }
]
```

### JS 对照版思路

如果用 JS (Node.js) 写同样的记账本：

```js
const fs = require('fs')
const path = require('path')
const readline = require('readline')

const DATA_FILE = path.join(__dirname, 'account_book.json')

function loadRecords() {
  if (!fs.existsSync(DATA_FILE)) return []
  return JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'))
}

function saveRecords(records) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(records, null, 2), 'utf-8')
}

function addRecord(records, name, amount) {
  records.push({ name, amount })
  saveRecords(records)
}

function showSummary(records) {
  if (!records.length) { console.log('暂无记录'); return }
  let total = 0
  console.log('消费明细：')
  records.forEach(r => {
    console.log(`- ${r.name}：${r.amount} 元`)
    total += r.amount
  })
  console.log(`总支出：${total} 元`)
}

// 主程序省略（Node.js 命令行输入比 Python 复杂，需要 readline 模块）
```

## 为什么这个版本更接近工作

这个版本开始体现几个工作习惯：

- `load_records()` 只负责读取数据。
- `save_records()` 只负责保存数据。
- `input_amount()` 只负责金额输入和校验。
- `add_record()` 只负责新增记录。
- `show_summary()` 只负责展示汇总。
- `main()` 负责组织程序流程。

这叫**职责拆分**。Python 和 JS 的工作代码都应该这样做。

工作中判断代码是否靠谱，不只看能不能运行，还会看：

- 出错时有没有处理。
- 函数命名是否清楚。
- 一段代码是否太长。
- 数据保存格式是否方便后续读取。
- 后续加功能时会不会很难改。

## 本篇小结

1. 小程序通常是把多个基础知识组合起来。
2. 列表适合保存多条记录，字典适合保存一条记录的多个字段。
3. `while True` + `break` 适合反复输入。
4. `input()` 得到字符串，需要 `float()` 转换。
5. `with open()` + `write()` 保存文件。
6. 想接近真实工作，需要函数拆分、输入校验、JSON 持久化。
7. Python 用 `append()` 添加元素，JS 用 `push()`。
8. Python 用 `record["amount"]` 访问字典，JS 用 `record.amount`。
