---
title: "第 23 篇：csv 模块：reader、DictReader、写入、编码"
slug: "python-zero-csv-module"
summary: "面向零基础系统学习 Python 标准库 csv 模块，掌握 reader、writer、DictReader、DictWriter、newline、UTF-8、追加写入、分隔符、引号、Sniffer、字段 schema、校验、去重幂等、临时文件替换和爬虫结果保存模板。"
category: "知识目录"
categoryPath:
  - "后端技术"
  - "Python"
  - "知识目录"
tags:
  - "Python"
  - "零基础入门"
  - "CSV"
status: "published"
sortOrder: 230
cover: ""
originalId: "6a4a4304f9ac958d29176082"
originalSlug: "python-zero-csv-module"
originalStatus: "published"
publishedAt: "2026-07-05T11:47:18.486Z"
updatedAt: "2026-07-31T11:16:22.398Z"
exportedAt: "2026-08-03T03:03:53.296Z"
---
# 第 23 篇：csv 模块：reader、DictReader、写入、编码

这一篇学 Python 标准库里的 `csv` 模块。

你可以先把它理解成一句话：

> `csv` 模块用来读写“表格形式的纯文本文件”。

如果你后面要写网络爬虫，CSV 会非常常见。因为爬虫抓到的数据通常不是只在屏幕上打印一下，而是要保存起来，方便之后用 Excel、pandas、数据库或后台系统继续处理。

这篇不要求你一次记住所有细节。按下面这条线学就够了：

1. 先知道 CSV 文件长什么样。
2. 再会把几行数据写进去。
3. 再会把数据读出来。
4. 最后掌握爬虫里最常用的“字典列表保存 CSV”写法。

先给你一张 `csv` 模块能力地图：

| 能力 | 常用对象 / 参数 | 项目里解决什么问题 |
| --- | --- | --- |
| 按列表写入 | `csv.writer`、`writerow`、`writerows` | 手里是二维列表时快速保存 |
| 按列表读取 | `csv.reader` | 逐行读取没有字段名的 CSV |
| 按字典写入 | `csv.DictWriter`、`fieldnames` | 保存爬虫结果、后台导入导出清单 |
| 按字典读取 | `csv.DictReader` | 像读对象一样读取带表头的 CSV |
| 文件打开规则 | `encoding='utf-8'`、`newline=''` | 避免中文乱码和 Windows 多空行 |
| 字段控制 | `extrasaction`、`restval` | 处理多余字段和缺失字段 |
| 分隔符和引号 | `delimiter`、`quotechar`、`quoting` | 兼容不同系统导出的 CSV |
| 工程化保存 | 字段 schema、校验、去重、临时文件替换 | 让 CSV 能用于真实导入、迁移和爬虫落地 |

也就是说，学习 `csv` 不只是学“怎么写文件”，而是要理解：

```text
表格字段怎么定义 -> 数据怎么逐条整理 -> 文件怎么稳定写入 -> 后续怎么读取和导入
```

## 一、CSV 是什么

CSV 全称是 Comma-Separated Values，意思是“逗号分隔值”。

它看起来像这样：

```csv
title,url,category
Python 基础,/a/python-basic,Python
Python 爬虫,/a/python-crawler,Python
Vue 入门,/a/vue-basic,前端
```

第一行通常是表头：

```text
title,url,category
```

后面的每一行是一条数据：

```text
Python 基础,/a/python-basic,Python
```

你可以把它想象成一张表：

| title | url | category |
| --- | --- | --- |
| Python 基础 | /a/python-basic | Python |
| Python 爬虫 | /a/python-crawler | Python |
| Vue 入门 | /a/vue-basic | 前端 |

CSV 不是 Excel 文件本身。它没有单元格颜色、合并单元格、公式、多个工作表这些复杂功能。

CSV 的优点是：

- 文件简单，本质是普通文本。
- Excel、WPS、VS Code 都能打开。
- Python 标准库就能读写，不需要安装第三方库。
- pandas 可以直接读取。
- 很适合保存爬虫结果、后台导入导出清单、批量数据。

## 二、先创建一个学习目录

为了避免文件找不到，建议你新建一个目录，比如：

```text
csv-practice
```

然后在里面创建 Python 文件：

```text
write_articles.py
```

后面的代码都可以放在这个文件里运行。

在命令行进入这个目录后运行：

```powershell
python write_articles.py
```

运行后如果代码里写的是 `articles.csv`，生成的 CSV 文件通常就在当前目录下。

## 三、为什么不要手动拼接 CSV 字符串

新手很容易这样写：

```python
title = 'Python 基础'
url = '/a/python-basic'
category = 'Python'

line = title + ',' + url + ',' + category
print(line)
```

输出是：

```text
Python 基础,/a/python-basic,Python
```

看起来没问题。

但是只要数据里本身出现逗号、换行或引号，手动拼接就容易出错。

比如标题是：

```text
Python, JavaScript 对比
```

这时逗号既可能表示“字段分隔符”，也可能只是标题内容的一部分。你自己拼字符串时，很难稳定处理这些情况。

所以写 CSV 时，不建议自己拼接字符串，而是使用 `csv` 模块。它会帮你处理逗号、引号、换行这些细节。

## 四、写入最简单的 CSV：csv.writer

先看列表写法。

这种写法适合你手里已经有一行一行的列表数据。

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

运行后会生成 `articles.csv`。

打开文件，你会看到类似内容：

```csv
title,url,category
Python 基础,/a/python-basic,Python
Python 爬虫,/a/python-crawler,Python
Vue 入门,/a/vue-basic,前端
```

逐行解释：

```python
import csv
```

导入 Python 标准库里的 `csv` 模块。标准库的意思是：Python 自带，不需要 `pip install`。

```python
rows = [
    ['title', 'url', 'category'],
    ['Python 基础', '/a/python-basic', 'Python']
]
```

准备要写入的数据。外层列表表示“多行”，里面每一个小列表表示“一行”。

```python
open('articles.csv', 'w', encoding='utf-8', newline='')
```

打开一个文件：

- `'articles.csv'`：文件名。
- `'w'`：写入模式。如果文件不存在就创建；如果文件已经存在，会覆盖旧内容。
- `encoding='utf-8'`：使用 UTF-8 编码保存中文。
- `newline=''`：把换行处理交给 `csv` 模块，避免 Windows 下出现空行。

```python
writer = csv.writer(file)
```

创建一个 CSV 写入器。

```python
writer.writerows(rows)
```

一次写入多行。

## 五、writerow 和 writerows 的区别

`writerow()` 写一行。

`writerows()` 写多行。

例子：

```python
import csv

with open('articles.csv', 'w', encoding='utf-8', newline='') as file:
    writer = csv.writer(file)

    writer.writerow(['title', 'url', 'category'])
    writer.writerow(['Python 基础', '/a/python-basic', 'Python'])
    writer.writerow(['Python 爬虫', '/a/python-crawler', 'Python'])
```

这段代码和前面 `writerows()` 的效果类似，只是写法变成了一行一行写。

你可以这样记：

| 方法 | 含义 | 适合场景 |
| --- | --- | --- |
| `writerow()` | 写一行 | 边处理边写 |
| `writerows()` | 写多行 | 数据已经整理成列表 |

## 六、读取 CSV：csv.reader

先读取刚才生成的 `articles.csv`：

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

注意两件事：

- `csv.reader` 每一行读出来是列表。
- CSV 里读出来的内容默认都是字符串。

比如 CSV 里写的是：

```csv
title,views
Python 基础,100
```

读出来的 `100` 不是数字 `100`，而是字符串 `'100'`。

如果你要计算，需要自己转换：

```python
views = int(row[1])
```

## 七、跳过表头

CSV 第一行通常是表头。

如果你只想处理数据行，可以先用 `next()` 取走第一行：

```python
import csv

with open('articles.csv', 'r', encoding='utf-8', newline='') as file:
    reader = csv.reader(file)
    header = next(reader)

    print('表头：', header)

    for row in reader:
        print('数据行：', row)
```

你会看到：

```text
表头： ['title', 'url', 'category']
数据行： ['Python 基础', '/a/python-basic', 'Python']
数据行： ['Python 爬虫', '/a/python-crawler', 'Python']
数据行： ['Vue 入门', '/a/vue-basic', '前端']
```

`next(reader)` 的意思是：从 reader 里取出下一行。

因为它先取走了第一行，所以后面的 `for row in reader` 就会从第二行开始。

如果文件是空的，`next(reader)` 会报错。真实项目里可以给默认值：

```python
header = next(reader, None)
```

这样文件为空时，`header` 会得到 `None`。

## 八、字典列表更适合爬虫

爬虫里更常见的数据结构不是二维列表，而是“列表里面放字典”。

比如：

```python
records = [
    {'title': 'Python 基础', 'url': '/a/python-basic', 'category': 'Python'},
    {'title': 'Python 爬虫', 'url': '/a/python-crawler', 'category': 'Python'},
    {'title': 'Vue 入门', 'url': '/a/vue-basic', 'category': '前端'}
]
```

为什么这种结构更适合爬虫？

因为一条爬虫结果通常就是一个对象：

```python
{
    'title': 'Python 爬虫',
    'url': '/a/python-crawler',
    'category': 'Python'
}
```

字段名写清楚之后，代码更容易看懂。

对比一下：

```python
row[0]
row[1]
row[2]
```

和：

```python
record['title']
record['url']
record['category']
```

第二种明显更适合小白理解，也更适合后期维护。

## 九、字典方式写入：DictWriter

用 `csv.DictWriter` 可以把字典列表保存成 CSV：

```python
import csv

records = [
    {'title': 'Python 基础', 'url': '/a/python-basic', 'category': 'Python'},
    {'title': 'Python 爬虫', 'url': '/a/python-crawler', 'category': 'Python'},
    {'title': 'Vue 入门', 'url': '/a/vue-basic', 'category': '前端'}
]

fieldnames = ['title', 'url', 'category']

with open('articles.csv', 'w', encoding='utf-8', newline='') as file:
    writer = csv.DictWriter(file, fieldnames=fieldnames)
    writer.writeheader()
    writer.writerows(records)
```

这里最重要的是 `fieldnames`。

它决定三件事：

- CSV 表头有哪些列。
- 每一列的顺序是什么。
- 字典里的哪些字段会被写入文件。

`writer.writeheader()` 表示写入表头：

```csv
title,url,category
```

`writer.writerows(records)` 表示写入多条字典数据。

## 十、字典方式读取：DictReader

如果 CSV 有表头，读取时推荐用 `DictReader`。

```python
import csv

with open('articles.csv', 'r', encoding='utf-8', newline='') as file:
    reader = csv.DictReader(file)

    for row in reader:
        print(row['title'], row['url'], row['category'])
```

输出类似：

```text
Python 基础 /a/python-basic Python
Python 爬虫 /a/python-crawler Python
Vue 入门 /a/vue-basic 前端
```

`DictReader` 会自动把第一行当作字段名。

每一行读出来可以像字典一样使用：

```python
row['title']
row['url']
row['category']
```

这比 `row[0]`、`row[1]` 更清楚。

## 十一、newline='' 为什么重要

你会经常看到这种写法：

```python
open('articles.csv', 'w', encoding='utf-8', newline='')
```

`newline=''` 的作用是：不要让 `open()` 提前处理换行，把换行规则交给 `csv` 模块。

在 Windows 上，如果不写它，有时 CSV 文件会出现多余空行。

所以你可以先形成固定习惯：

```python
with open('xxx.csv', 'w', encoding='utf-8', newline='') as file:
    writer = csv.writer(file)
```

读取时也可以保留：

```python
with open('xxx.csv', 'r', encoding='utf-8', newline='') as file:
    reader = csv.reader(file)
```

## 十二、encoding='utf-8' 为什么重要

如果 CSV 里有中文，建议明确写：

```python
encoding='utf-8'
```

这样可以减少中文乱码问题。

本项目也统一要求源码和配置文件使用 UTF-8 无 BOM。

如果你用 Excel 打开 CSV 发现中文显示异常，不一定是文件坏了。可以先用 VS Code 打开确认内容是否正常。

有些旧版 Excel 对 UTF-8 CSV 识别不稳定。如果只是学习 Python，优先保证文件本身是 UTF-8；如果后续确实要给 Excel 兼容，可以再单独讨论 `utf-8-sig`，但本项目源码文件仍然保持 UTF-8 无 BOM。

## 十三、保存爬虫结果的常用模板

爬虫里通常先把结果放进 `records`：

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

fieldnames = ['title', 'url', 'date']

with open('crawler_result.csv', 'w', encoding='utf-8', newline='') as file:
    writer = csv.DictWriter(file, fieldnames=fieldnames)
    writer.writeheader()
    writer.writerows(records)
```

这是后面写爬虫时最常用的模板。

你只需要替换三处：

- `crawler_result.csv`：输出文件名。
- `fieldnames`：你要保存哪些字段。
- `records`：你爬取并整理好的数据。

## 十四、追加写入：a 模式

`'w'` 模式会覆盖原文件。

如果你不想覆盖，而是追加到文件末尾，可以用 `'a'` 模式：

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

但是追加写入有一个坑：它不会自动写表头。

如果文件一开始不存在，你直接追加一条数据，文件里可能只有数据，没有表头。

更稳一点的写法是先判断文件是否存在：

```python
import csv
from pathlib import Path

file_path = Path('articles.csv')
file_exists = file_path.exists()

new_record = {
    'title': '新增文章',
    'url': '/a/new',
    'category': 'Python'
}

with open(file_path, 'a', encoding='utf-8', newline='') as file:
    writer = csv.DictWriter(file, fieldnames=['title', 'url', 'category'])

    if not file_exists:
        writer.writeheader()

    writer.writerow(new_record)
```

入门阶段如果不确定，建议先用 `'w'` 模式整体写入。等你清楚覆盖和追加的区别后，再用 `'a'` 模式。

## 十五、处理多余字段

`DictWriter` 默认比较严格。

如果字典里有 `fieldnames` 没写到的字段，默认会报错。

比如：

```python
record = {
    'title': 'Python 基础',
    'url': '/a/python-basic',
    'category': 'Python',
    'views': 100
}
```

如果 `fieldnames` 只有：

```python
['title', 'url', 'category']
```

那么 `views` 就是多余字段。

可以用 `extrasaction='ignore'` 忽略多余字段：

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

## 十六、处理缺失字段

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

因为数据里没有 `category`，所以写入时会使用默认值 `未分类`。

## 十七、完整实战：保存文章导出清单

假设你要保存一份文章导出清单：

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

fieldnames = ['title', 'slug', 'status']

with open('article_export_list.csv', 'w', encoding='utf-8', newline='') as file:
    writer = csv.DictWriter(file, fieldnames=fieldnames)
    writer.writeheader()
    writer.writerows(articles)

print('文章导出清单已保存')
```

这段代码背后的思路是：

- 一篇文章是一条记录。
- 一条记录用一个字典表示。
- 多篇文章用列表保存。
- `fieldnames` 固定输出字段。
- `DictWriter` 把字典列表写成 CSV。

这也是后台导出、数据迁移、爬虫结果保存的常见思路。

## 十八、分隔符、引号和不同 CSV 格式

大多数 CSV 使用英文逗号分隔：

```csv
title,url,category
Python 基础,/a/python-basic,Python
```

但真实工作里，你可能还会遇到：

- 分号分隔：`;`
- 制表符分隔：`\t`
- 字段里包含逗号、引号、换行

这时就要理解 `delimiter`、`quotechar`、`quoting`。

### 1. 指定分隔符

如果文件用分号分隔：

```csv
title;url;category
Python 基础;/a/python-basic;Python
```

读取时：

```python
import csv

with open('articles_semicolon.csv', 'r', encoding='utf-8', newline='') as file:
    reader = csv.DictReader(file, delimiter=';')

    for row in reader:
        print(row['title'], row['url'])
```

写入时：

```python
import csv

records = [
    {'title': 'Python 基础', 'url': '/a/python-basic', 'category': 'Python'}
]

with open('articles_semicolon.csv', 'w', encoding='utf-8', newline='') as file:
    writer = csv.DictWriter(
        file,
        fieldnames=['title', 'url', 'category'],
        delimiter=';'
    )
    writer.writeheader()
    writer.writerows(records)
```

### 2. 字段里有逗号怎么办

比如标题是：

```text
Python, JavaScript 对比
```

`csv` 模块会自动加引号：

```csv
title,url
"Python, JavaScript 对比",/a/compare
```

这就是为什么不要自己手动拼接 CSV 字符串。

### 3. 控制引号策略

如果你希望所有字段都加引号，可以使用：

```python
import csv

with open('articles.csv', 'w', encoding='utf-8', newline='') as file:
    writer = csv.writer(file, quoting=csv.QUOTE_ALL)
    writer.writerow(['title', 'url'])
    writer.writerow(['Python 基础', '/a/python-basic'])
```

常见 `quoting`：

| 写法 | 含义 |
| --- | --- |
| `csv.QUOTE_MINIMAL` | 只有必要时加引号，默认值 |
| `csv.QUOTE_ALL` | 所有字段都加引号 |
| `csv.QUOTE_NONNUMERIC` | 非数字字段加引号 |
| `csv.QUOTE_NONE` | 不自动加引号，较少用 |

入门阶段大多数情况下不用手动设置 `quoting`。

但你要知道：企业里和第三方系统对接 CSV 时，分隔符和引号规则经常需要按对方要求调整。

如果对方要求使用单引号作为包裹符，也可以设置 `quotechar`：

```python
import csv

with open('articles.csv', 'w', encoding='utf-8', newline='') as file:
    writer = csv.writer(file, quotechar="'", quoting=csv.QUOTE_ALL)
    writer.writerow(['title', 'url'])
    writer.writerow(['Python 基础', '/a/python-basic'])
```

这会把字段写成类似：

```csv
'title','url'
'Python 基础','/a/python-basic'
```

### 4. 自动识别格式：csv.Sniffer

有时你拿到的 CSV 不是自己生成的，可能不知道它到底用逗号、分号还是制表符分隔。

可以用 `csv.Sniffer` 做基础识别：

```python
import csv

with open('unknown.csv', 'r', encoding='utf-8', newline='') as file:
    sample = file.read(1024)
    file.seek(0)

    dialect = csv.Sniffer().sniff(sample)
    reader = csv.DictReader(file, dialect=dialect)

    for row in reader:
        print(row)
```

这里：

- `file.read(1024)`：先读取一小段样本。
- `file.seek(0)`：把文件指针放回开头。
- `sniff(sample)`：根据样本猜测 CSV 格式。
- `DictReader(file, dialect=dialect)`：按识别出的格式读取。

`Sniffer` 不是万能的，样本太短或文件太乱时也可能猜错。

企业导入里更稳的做法是：能让用户选择分隔符就让用户选择；不能选择时，再用 `Sniffer` 做辅助判断。

## 十九、CSV 和 pandas 的关系

`csv` 模块适合：

- 简单读取。
- 简单写入。
- 不安装第三方库。
- 把爬虫结果保存成文件。

`pandas` 适合：

- 批量分析。
- 筛选、排序、分组统计。
- 处理更复杂的表格。
- 数据清洗和报表导出。

学习顺序可以是：

1. 先用 `csv` 模块保存和读取。
2. 再用 `pandas.read_csv()` 分析。

也就是说，`csv` 更像“保存数据的基础工具”，`pandas` 更像“分析数据的表格工具”。

## 二十、容易和 JS 混淆的地方

| Python csv | JS / 前端直觉 | 注意点 |
| --- | --- | --- |
| `csv.reader(file)` | 读取表格行 | 每行是列表 |
| `csv.DictReader(file)` | 读取对象数组 | 每行是字典 |
| `csv.writer(file)` | 写数组行 | 适合二维列表 |
| `csv.DictWriter(file)` | 写对象数组 | 适合列表字典 |
| `newline=''` | 无直接常见对应 | Windows 下尤其重要 |
| `encoding='utf-8'` | 文件编码 | 影响中文是否乱码 |

前端常见的是 JSON 对象数组。

Python 写 CSV 时，最接近这个习惯的是：

```python
records = [
    {'title': 'Python 基础', 'url': '/a/python-basic'},
    {'title': 'Python 爬虫', 'url': '/a/python-crawler'}
]
```

然后使用：

```python
writer = csv.DictWriter(file, fieldnames=['title', 'url'])
```

## 二十一、新手常见错误

### 1. FileNotFoundError

错误含义：找不到文件。

常见原因：

- 读取的 CSV 文件还没有创建。
- 当前命令行目录不是文件所在目录。
- 文件名写错了。

排查方式：

```python
from pathlib import Path

print(Path.cwd())
print(Path('articles.csv').exists())
```

`Path.cwd()` 可以告诉你当前程序运行在哪个目录。

### 2. 写完 CSV 后多出空行

通常是没有写：

```python
newline=''
```

推荐固定写法：

```python
with open('articles.csv', 'w', encoding='utf-8', newline='') as file:
    writer = csv.DictWriter(file, fieldnames=['title', 'url'])
```

### 3. 中文乱码

先确认读写时都写了：

```python
encoding='utf-8'
```

再用 VS Code 打开 CSV 看内容是否正常。

如果 VS Code 正常而 Excel 异常，通常是 Excel 识别编码的问题。

### 4. KeyError

比如：

```python
print(row['title'])
```

报 `KeyError: 'title'`。

说明 CSV 表头里没有叫 `title` 的列，可能是：

- 表头拼错了。
- 表头里有空格。
- 文件不是你以为的那个文件。

可以先打印字段名：

```python
print(reader.fieldnames)
```

### 5. 数字不能直接计算

CSV 读出来默认是字符串。

如果要计算：

```python
views = int(row['views'])
```

如果数据可能为空，可以先判断：

```python
views = int(row['views']) if row['views'] else 0
```

## 二十二、本篇练习

### 练习 1：写入学生 CSV

创建 `students.csv`，写入：

| name | age | city |
| --- | --- | --- |
| 小明 | 18 | 北京 |
| 小红 | 19 | 上海 |

要求使用 `csv.DictWriter`。

参考答案：

```python
import csv

students = [
    {'name': '小明', 'age': 18, 'city': '北京'},
    {'name': '小红', 'age': 19, 'city': '上海'}
]

with open('students.csv', 'w', encoding='utf-8', newline='') as file:
    writer = csv.DictWriter(file, fieldnames=['name', 'age', 'city'])
    writer.writeheader()
    writer.writerows(students)
```

### 练习 2：读取学生 CSV

读取 `students.csv`，逐行打印：

```text
小明 来自 北京，年龄 18
```

参考答案：

```python
import csv

with open('students.csv', 'r', encoding='utf-8', newline='') as file:
    reader = csv.DictReader(file)

    for row in reader:
        print(f"{row['name']} 来自 {row['city']}，年龄 {row['age']}")
```

### 练习 3：保存爬虫结果

创建一个 `records` 列表：

```python
records = [
    {'title': 'Python 爬虫入门', 'url': '/a/python-crawler'},
    {'title': 'Python 数据分析', 'url': '/a/python-data'}
]
```

保存为 `crawler_result.csv`。

参考答案：

```python
import csv

records = [
    {'title': 'Python 爬虫入门', 'url': '/a/python-crawler'},
    {'title': 'Python 数据分析', 'url': '/a/python-data'}
]

with open('crawler_result.csv', 'w', encoding='utf-8', newline='') as file:
    writer = csv.DictWriter(file, fieldnames=['title', 'url'])
    writer.writeheader()
    writer.writerows(records)
```

## 二十三、企业开发中 CSV 常见用法

前面的内容已经能完成基本读写。真实项目里，CSV 还经常出现在这些场景：

- 后台导入导出。
- 爬虫结果落地。
- 数据迁移中间文件。
- 运营批量修改数据。
- 和 Excel、pandas、数据库之间交换数据。

所以企业开发里不会只关心“能不能写进去”，还会关心字段是否稳定、文件是否完整、重复运行会不会出问题。

### 1. 先定义字段 schema

不要在写 CSV 时随手决定字段。

更推荐先定义固定字段：

```python
ARTICLE_FIELDS = ['title', 'url', 'category', 'published_at', 'views']
```

然后所有写入都使用它：

```python
import csv

ARTICLE_FIELDS = ['title', 'url', 'category', 'published_at', 'views']

records = [
    {
        'title': 'Python 爬虫入门',
        'url': 'https://example.com/a/python-crawler',
        'category': 'Python',
        'published_at': '2026-07-07',
        'views': 1234
    }
]

with open('articles.csv', 'w', encoding='utf-8', newline='') as file:
    writer = csv.DictWriter(file, fieldnames=ARTICLE_FIELDS, extrasaction='ignore')
    writer.writeheader()
    writer.writerows(records)
```

这样字段顺序稳定，后续 pandas 读取、后台导入、数据库迁移都更可靠。

### 2. 大数据量不要一次攒太多

如果只有几百条数据，可以先放进列表再写：

```python
records = []
```

但如果爬虫结果有几十万条，一直放在内存里就不合适。

可以边抓边写：

```python
import csv

ARTICLE_FIELDS = ['title', 'url', 'category']

with open('articles.csv', 'w', encoding='utf-8', newline='') as file:
    writer = csv.DictWriter(file, fieldnames=ARTICLE_FIELDS)
    writer.writeheader()

    for page_number in range(1, 101):
        records = [
            {
                'title': f'第 {page_number} 页文章',
                'url': f'https://example.com/a/{page_number}',
                'category': 'Python'
            }
        ]

        writer.writerows(records)
```

企业脚本里经常采用这种“分批获取、分批写入”的方式，避免内存压力过大。

### 3. 写入前先做字段校验

不要什么数据都直接写进去。

可以先写一个简单校验函数：

```python
def validate_article(record):
    errors = []

    if not record.get('title'):
        errors.append('标题不能为空')

    if not record.get('url'):
        errors.append('链接不能为空')

    if record.get('views') is not None and int(record['views']) < 0:
        errors.append('浏览量不能为负数')

    return errors
```

使用时：

```python
valid_records = []
invalid_records = []

for record in records:
    errors = validate_article(record)

    if errors:
        invalid_records.append({'record': record, 'errors': errors})
    else:
        valid_records.append(record)
```

这样后续排查数据问题时，不会只看到“导入失败”，而是能知道哪一条、为什么失败。

### 4. 重复导入要考虑幂等

CSV 常用于导入后台系统。

企业开发里要提前想清楚：

- 用哪个字段判断重复？
- 重复时跳过、覆盖，还是生成新草稿？
- 同一个 CSV 重复导入会不会创建重复数据？

比如爬虫文章可以用 `url` 去重：

```python
seen_urls = set()
unique_records = []

for record in records:
    url = record['url']

    if url in seen_urls:
        continue

    seen_urls.add(url)
    unique_records.append(record)
```

如果是导入数据库，更常见的是使用唯一索引或 `source + original_id` 这样的组合键。

### 5. 重要文件可以先写临时文件

如果程序写到一半失败，目标 CSV 可能只写了一半。

更稳的方式是先写临时文件，成功后再替换正式文件：

```python
from pathlib import Path
import csv

target_path = Path('articles.csv')
temp_path = Path('articles.csv.tmp')

with open(temp_path, 'w', encoding='utf-8', newline='') as file:
    writer = csv.DictWriter(file, fieldnames=['title', 'url'])
    writer.writeheader()
    writer.writerows(records)

temp_path.replace(target_path)
```

这叫原子替换思路。它不能解决所有问题，但能减少“写一半文件被当成完整文件使用”的风险。

### 6. Excel 兼容要单独说明

本项目源码和文档统一使用 UTF-8 无 BOM。

但如果 CSV 主要给旧版 Excel 双击打开，可能会遇到中文识别问题。企业里通常会明确导出目标：

| 目标 | 建议 |
| --- | --- |
| 程序读取、pandas、系统导入 | `encoding='utf-8'` |
| 专门给旧版 Excel 双击打开 | 可以单独评估 `utf-8-sig` |

注意：这是“导出给 Excel 的数据文件”策略，不代表源码文件要使用 BOM。

## 本篇小结

这一篇你需要记住：

- CSV 是纯文本表格格式，不等于 Excel 文件本身。
- `csv.writer` 写普通列表行，适合二维列表。
- `csv.reader` 读取普通行，结果是列表。
- `csv.DictWriter` 写字典列表，最适合爬虫结果保存。
- `csv.DictReader` 读取带表头的 CSV，结果是字典。
- 写 CSV 时建议使用 `encoding='utf-8'` 和 `newline=''`。
- `'w'` 模式会覆盖文件，`'a'` 模式会追加文件。
- CSV 读出来的数字默认是字符串，需要计算时要自己转换。
- CSV 对接第三方系统时，可能需要设置 `delimiter`、`quotechar`、`quoting`。
- 不确定 CSV 格式时，可以用 `csv.Sniffer` 做辅助识别，但不要完全依赖它。
- 真实项目里要提前定义字段 schema，写入前做校验，重复导入要考虑去重和幂等。
- 学完 `csv` 后，再学 pandas 分析 CSV 会顺很多。

参考资料：

- Python `csv` 官方文档：https://docs.python.org/3/library/csv.html
