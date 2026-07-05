---
title: Python 零基础入门 22：csv 模块
slug: python-zero-csv-module
summary: 学习 Python 标准库 csv 模块，理解 CSV 文件是什么，掌握 reader、writer、DictReader、DictWriter、newline=''、UTF-8 编码和爬虫数据保存的常见写法。
category: Python入门
tags:
  - Python
  - 零基础入门
  - csv
status: draft
cover:
---

# Python 零基础入门 22：csv 模块

`csv` 是 Python 标准库里的表格文件读写模块。

你现在学网络爬虫时会经常碰到它，因为爬虫抓下来的数据通常不是只打印在屏幕上，而是要保存起来。

最常见的保存格式就是 CSV。

## 一、CSV 是什么

CSV 全称是 Comma-Separated Values，意思是“逗号分隔值”。

它本质上是一个纯文本表格。

比如：

```csv
title,url,category
Python 基础,/a/python-basic,Python
Python 爬虫,/a/python-crawler,Python
Vue 入门,/a/vue-basic,前端
```

你可以把它想象成一张表：

| title | url | category |
| --- | --- | --- |
| Python 基础 | /a/python-basic | Python |
| Python 爬虫 | /a/python-crawler | Python |
| Vue 入门 | /a/vue-basic | 前端 |

CSV 的优点是：

- 简单。
- Excel 可以打开。
- pandas 可以读取。
- 数据库和后台系统也经常支持导入 CSV。
- 很适合爬虫、数据分析、批量导入导出。

## 二、为什么不用字符串拼接写 CSV

新手很容易这样写：

```python
line = title + ',' + url + ',' + category
```

看起来没问题，但如果标题里本身有逗号、换行、引号，就会出错。

例如：

```text
Python, JavaScript 对比
```

这个标题里有逗号，如果你手动拼接，程序可能会误以为它是两列。

所以写 CSV 时，不建议自己拼字符串，而是使用 `csv` 模块。

`csv` 模块会帮你处理分隔符、引号、换行等细节。

## 三、写入普通列表数据：csv.writer

先看最基础的写入方式。

```python
import csv

rows = [
    ['title', 'url', 'category'],
    ['Python 基础', '/a/python-basic', 'Python'],
    ['Python 爬虫', '/a/python-crawler', 'Python'],
    ['Vue 入门', '/a/vue-basic', '前端']
]

with open('articles.csv', 'w', encoding='utf-8', newline='') as file:
    writer = csv.writer(file)
    writer.writerows(rows)
```

这段代码会生成 `articles.csv`。

重点解释：

- `import csv`：导入标准库 csv 模块。
- `open(..., 'w')`：以写入模式打开文件。
- `encoding='utf-8'`：保存中文时使用 UTF-8。
- `newline=''`：交给 csv 模块自己处理换行，避免 Windows 下多出空行。
- `csv.writer(file)`：创建写入器。
- `writer.writerows(rows)`：一次写入多行。

## 四、一次写一行：writerow

如果你想一行一行写，可以用 `writerow()`。

```python
import csv

with open('articles.csv', 'w', encoding='utf-8', newline='') as file:
    writer = csv.writer(file)

    writer.writerow(['title', 'url', 'category'])
    writer.writerow(['Python 基础', '/a/python-basic', 'Python'])
    writer.writerow(['Python 爬虫', '/a/python-crawler', 'Python'])
```

`writerow()` 写一行。

`writerows()` 写多行。

## 五、读取 CSV：csv.reader

读取刚才的 CSV：

```python
import csv

with open('articles.csv', 'r', encoding='utf-8', newline='') as file:
    reader = csv.reader(file)

    for row in reader:
        print(row)
```

输出类似：

```python
['title', 'url', 'category']
['Python 基础', '/a/python-basic', 'Python']
['Python 爬虫', '/a/python-crawler', 'Python']
['Vue 入门', '/a/vue-basic', '前端']
```

注意：`csv.reader` 每一行读出来是列表。

而且 CSV 读出来的内容默认都是字符串。

比如：

```csv
title,views
Python 基础,100
```

读出来的 `100` 是字符串 `'100'`，如果要计算，需要自己转换：

```python
views = int(row[1])
```

## 六、跳过表头

CSV 第一行通常是表头。

如果你只想处理数据行，可以先读掉表头。

```python
import csv

with open('articles.csv', 'r', encoding='utf-8', newline='') as file:
    reader = csv.reader(file)
    header = next(reader)

    print('表头：', header)

    for row in reader:
        print('数据行：', row)
```

`next(reader)` 会取出第一行，后面的 `for` 循环就从第二行开始。

## 七、字典方式写入：DictWriter

爬虫里更常见的数据结构是“列表 + 字典”。

比如：

```python
records = [
    {'title': 'Python 基础', 'url': '/a/python-basic', 'category': 'Python'},
    {'title': 'Python 爬虫', 'url': '/a/python-crawler', 'category': 'Python'},
    {'title': 'Vue 入门', 'url': '/a/vue-basic', 'category': '前端'}
]
```

这种结构很适合用 `csv.DictWriter`。

```python
import csv

records = [
    {'title': 'Python 基础', 'url': '/a/python-basic', 'category': 'Python'},
    {'title': 'Python 爬虫', 'url': '/a/python-crawler', 'category': 'Python'},
    {'title': 'Vue 入门', 'url': '/a/vue-basic', 'category': '前端'}
]

with open('articles.csv', 'w', encoding='utf-8', newline='') as file:
    fieldnames = ['title', 'url', 'category']
    writer = csv.DictWriter(file, fieldnames=fieldnames)

    writer.writeheader()
    writer.writerows(records)
```

这里的 `fieldnames` 很重要。

它决定：

- CSV 表头有哪些列。
- 每个字典按什么顺序写入。
- 哪些字段会被写入文件。

`writeheader()` 用来写表头。

`writerows(records)` 用来写入多条字典数据。

## 八、字典方式读取：DictReader

如果 CSV 有表头，用 `DictReader` 读取会更直观。

```python
import csv

with open('articles.csv', 'r', encoding='utf-8', newline='') as file:
    reader = csv.DictReader(file)

    for row in reader:
        print(row['title'], row['url'], row['category'])
```

`DictReader` 会自动把第一行当成字段名。

每一行读出来是字典：

```python
{
    'title': 'Python 基础',
    'url': '/a/python-basic',
    'category': 'Python'
}
```

这比用下标 `row[0]`、`row[1]` 更清楚。

## 九、newline='' 为什么重要

你会经常看到这种写法：

```python
open('articles.csv', 'w', encoding='utf-8', newline='')
```

`newline=''` 的作用是：不要让 `open()` 提前处理换行，把换行规则交给 `csv` 模块。

尤其在 Windows 上，如果不写它，CSV 文件可能出现多余空行。

所以你可以先形成习惯：

```python
with open('xxx.csv', 'w', encoding='utf-8', newline='') as file:
    ...
```

读取 CSV 时也可以保留：

```python
with open('xxx.csv', 'r', encoding='utf-8', newline='') as file:
    ...
```

## 十、encoding='utf-8' 为什么重要

如果 CSV 里有中文，建议明确写：

```python
encoding='utf-8'
```

这样可以避免中文乱码。

本项目规则也是统一使用 UTF-8 无 BOM，所以代码和生成内容都优先保持 UTF-8。

如果你用 Excel 打开 CSV 发现中文显示异常，不一定是文件坏了。可以先用 VS Code 打开确认内容是否正常。

## 十一、常见爬虫保存写法

爬虫里通常会先把数据放进 `records`：

```python
records = []

records.append({
    'title': 'Python 爬虫入门',
    'url': 'https://example.com/a/python-crawler',
    'date': '2026-07-05'
})
```

然后统一写入 CSV：

```python
import csv

with open('crawler_result.csv', 'w', encoding='utf-8', newline='') as file:
    writer = csv.DictWriter(file, fieldnames=['title', 'url', 'date'])
    writer.writeheader()
    writer.writerows(records)
```

这是你后面写爬虫时最常用的模板。

## 十二、追加写入

如果你不想覆盖原文件，而是追加到文件末尾，可以用 `'a'` 模式。

```python
import csv

new_record = {
    'title': '新增文章',
    'url': '/a/new',
    'category': 'Python'
}

with open('articles.csv', 'a', encoding='utf-8', newline='') as file:
    writer = csv.DictWriter(file, fieldnames=['title', 'url', 'category'])
    writer.writerow(new_record)
```

但是要注意：追加模式不会自动写表头。

如果文件不存在，你还需要先写表头。入门阶段更推荐先用 `'w'` 模式整体写入，逻辑更简单。

## 十三、处理多余字段

`DictWriter` 默认比较严格。

如果字典里有 `fieldnames` 没写到的字段，默认会报错。

```python
import csv

record = {
    'title': 'Python 基础',
    'url': '/a/python-basic',
    'category': 'Python',
    'views': 100
}

with open('articles.csv', 'w', encoding='utf-8', newline='') as file:
    writer = csv.DictWriter(
        file,
        fieldnames=['title', 'url', 'category'],
        extrasaction='ignore'
    )
    writer.writeheader()
    writer.writerow(record)
```

`extrasaction='ignore'` 表示忽略多余字段。

默认值是 `'raise'`，表示遇到多余字段就报错。

## 十四、处理缺失字段

如果字典缺少某个字段，`DictWriter` 会写空值。

也可以用 `restval` 指定默认值：

```python
import csv

records = [
    {'title': 'Python 基础', 'url': '/a/python-basic'}
]

with open('articles.csv', 'w', encoding='utf-8', newline='') as file:
    writer = csv.DictWriter(
        file,
        fieldnames=['title', 'url', 'category'],
        restval='未分类'
    )
    writer.writeheader()
    writer.writerows(records)
```

`category` 缺失时，会写入 `未分类`。

## 十五、CSV 和 pandas 的关系

`csv` 模块适合：

- 简单读取。
- 简单写入。
- 不安装第三方库。
- 把爬虫结果保存成文件。

`pandas` 适合：

- 批量分析。
- 筛选、排序、分组统计。
- 处理大一点的表格。
- 数据清洗。

学习顺序可以是：

1. 先用 `csv` 模块保存和读取。
2. 再用 `pandas.read_csv()` 分析。

## 十六、企业项目实战：保存文章导出清单

假设你要把文章导出清单保存成 CSV：

```python
import csv

articles = [
    {
        'title': 'Python 基础',
        'slug': 'python-basic',
        'status': 'draft'
    },
    {
        'title': 'Python 爬虫',
        'slug': 'python-crawler',
        'status': 'published'
    }
]

with open('article_export_list.csv', 'w', encoding='utf-8', newline='') as file:
    writer = csv.DictWriter(file, fieldnames=['title', 'slug', 'status'])
    writer.writeheader()
    writer.writerows(articles)

print('文章导出清单已保存')
```

这个例子和后台导出、数据迁移、爬虫结果保存的思路是一样的：

- 一条记录用字典。
- 多条记录用列表。
- 表头用 `fieldnames` 固定。
- 最后写入 CSV。

## 十七、容易和 JS 混淆的地方

| Python csv | JS / 前端直觉 | 注意点 |
| --- | --- | --- |
| `csv.reader(file)` | 读取表格行 | 每行是列表 |
| `csv.DictReader(file)` | 读取对象数组 | 每行是字典 |
| `csv.writer(file)` | 写数组行 | 适合二维列表 |
| `csv.DictWriter(file)` | 写对象数组 | 适合列表字典 |
| `newline=''` | 无直接常见对应 | Windows 下尤其重要 |
| `encoding='utf-8'` | 文件编码 | 影响中文是否乱码 |

前端常见的是 JSON 对象数组；Python 写 CSV 时，最接近这个习惯的是 `DictWriter`。

## 十八、本篇练习

### 练习 1：写入 CSV

创建 `students.csv`，写入：

| name | age | city |
| --- | --- | --- |
| 小明 | 18 | 北京 |
| 小红 | 19 | 上海 |

要求使用 `csv.DictWriter`。

### 练习 2：读取 CSV

读取 `students.csv`，逐行打印：

```text
小明 来自 北京，年龄 18
```

要求使用 `csv.DictReader`。

### 练习 3：保存爬虫结果

创建一个 `records` 列表：

```python
records = [
    {'title': 'Python 爬虫入门', 'url': '/a/python-crawler'},
    {'title': 'Python 数据分析', 'url': '/a/python-data'}
]
```

保存为 `crawler_result.csv`。

## 本篇小结

这一篇你需要记住：

- CSV 是纯文本表格格式。
- `csv.reader` 读取普通行，结果是列表。
- `csv.writer` 写入普通行，适合二维列表。
- `csv.DictReader` 读取带表头的 CSV，结果是字典。
- `csv.DictWriter` 写入字典列表，最适合爬虫结果保存。
- 写 CSV 时建议使用 `encoding='utf-8'` 和 `newline=''`。
- `csv` 负责保存基础表格数据，`pandas` 更适合进一步分析。

参考资料：

- Python `csv` 官方文档：https://docs.python.org/3/library/csv.html
