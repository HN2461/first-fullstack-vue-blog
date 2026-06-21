---
title: Python 零基础入门 14：小练习 记账本
slug: python-zero-mini-project-account-book
summary: 用前面学过的变量、输入、类型转换、条件判断、循环、列表、字典和文件写入，完成一个适合零基础的新手记账本练习。
category:
tags: []
status: draft
cover:
---

# Python 零基础入门 14：小练习 记账本

这一篇把前面学过的内容串起来，做一个简单记账本。

它会用到：

- `input`
- 类型转换
- 条件判断
- 循环
- 列表
- 字典
- 文件写入

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

```python
record = {
    "name": "早餐",
    "amount": 8.0
}

print(record)
```

运行结果：

```text
{'name': '早餐', 'amount': 8.0}
```

这里：

- `name` 表示消费名称
- `amount` 表示金额

## 第二步：用列表保存多条记录

```python
records = []

records.append({"name": "早餐", "amount": 8.0})
records.append({"name": "地铁", "amount": 4.0})

print(records)
```

运行结果：

```text
[{'name': '早餐', 'amount': 8.0}, {'name': '地铁', 'amount': 4.0}]
```

列表负责保存多条记录，字典负责保存一条记录的详细信息。

## 第三步：循环输入

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

这里的 `while True` 表示一直循环。

当用户输入 `q` 时，执行 `break`，结束循环。

## 第四步：计算总支出

```python
records = [
    {"name": "早餐", "amount": 8.0},
    {"name": "地铁", "amount": 4.0}
]

total = 0

for record in records:
    total += record["amount"]

print(total)
```

运行结果：

```text
12.0
```

## 第五步：保存到文件

```python
records = [
    {"name": "早餐", "amount": 8.0},
    {"name": "地铁", "amount": 4.0}
]

with open("account_book.txt", "w", encoding="utf-8") as file:
    for record in records:
        file.write(f"{record['name']}：{record['amount']} 元\n")
```

文件内容：

```text
早餐：8.0 元
地铁：4.0 元
```

## 完整代码

复制下面代码保存为：

```text
account_book.py
```

完整代码：

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

运行示例：

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
- 使用表格文件保存数据。

## 工作化改造：让小练习更像真实代码

真实工作里，很少把所有代码都堆在一起。

更常见的做法是：

- 用函数拆分不同职责。
- 用户输入要校验。
- 数据不要只保存成普通文本，可以保存成 JSON。
- 程序运行结果要清楚告诉用户。

下面是一个升级版记账本，仍然放在一个文件里，但已经开始接近工作代码的组织方式。

```python
import json
from pathlib import Path

DATA_FILE = Path("account_book.json")


def load_records():
    if not DATA_FILE.exists():
        return []

    with open(DATA_FILE, "r", encoding="utf-8") as file:
        return json.load(file)


def save_records(records):
    with open(DATA_FILE, "w", encoding="utf-8") as file:
        json.dump(records, file, ensure_ascii=False, indent=2)


def input_amount():
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

运行示例：

```text
1. 添加消费
2. 查看汇总
q. 退出
请选择操作：1
请输入消费名称：早餐
请输入金额：8
记录已保存

1. 添加消费
2. 查看汇总
q. 退出
请选择操作：2
消费明细：
- 早餐：8.0 元
总支出：8.0 元
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

## 为什么这个版本更接近工作

这个版本开始体现几个工作习惯：

- `load_records()` 只负责读取数据。
- `save_records()` 只负责保存数据。
- `input_amount()` 只负责金额输入和校验。
- `add_record()` 只负责新增记录。
- `show_summary()` 只负责展示汇总。
- `main()` 负责组织程序流程。

这叫职责拆分。

工作中判断一个新手代码是否靠谱，不只看能不能运行，还会看：

- 出错时有没有处理。
- 函数命名是否清楚。
- 一段代码是否太长。
- 数据保存格式是否方便后续读取。
- 后续加功能时会不会很难改。

## 可以作为简历项目吗

这个练习本身比较小，不适合夸大成正式项目。

但可以作为“Python 基础练习项目”来表达：

```text
我做过一个命令行记账本练习，支持添加消费、查看汇总、JSON 文件持久化。
项目中使用函数拆分输入、校验、保存和汇总逻辑，使用 try except 处理金额输入错误，使用 pathlib 和 json 标准库管理本地数据。
通过这个练习，我理解了 Python 基础语法如何组合成一个可运行的小工具。
```

## 本篇小结

- 小程序通常是把多个基础知识组合起来。
- 列表适合保存多条记录。
- 字典适合保存一条记录的多个字段。
- 循环适合反复输入。
- 文件写入可以把运行结果保存下来。
- 想接近真实工作，需要继续练习函数拆分、输入校验、数据持久化和错误处理。
