---
title: Python 数据分析入门 04：用 pandas 统计 CSV
slug: python-data-analysis-pandas-csv
summary: 面向零基础使用 pandas 读取清洗后的 CSV，理解 DataFrame，查看数据结构、处理缺失值、转换数字类型、筛选排序、按分类汇总、计算新指标，并补充 read_csv 常用参数、数据质量检查、去重、合并字典表、分块处理和结果导出等企业常见写法。
category: Python应用实例
tags:
  - Python
  - pandas
  - 数据分析
status: draft
cover:
---

# Python 数据分析入门 04：用 pandas 统计 CSV

前面几篇已经走完了爬虫数据处理的前半段：

1. 用 `requests` 请求网页或接口。
2. 用 `lxml` 和 XPath 解析 HTML。
3. 用 `csv` 把结果保存成 CSV。
4. 用正则表达式把标题、日期、阅读量、标签等字段清洗成统一格式。

这一篇做后半段：

> 用 pandas 读取清洗后的 CSV，看看这些数据有什么规律。

pandas 可以先理解成“Python 里的表格工具”。它很适合处理 CSV、Excel、数据库查询结果这类二维表数据。

如果前面的正则清洗做得越稳定，pandas 这里就越轻松。因为 pandas 擅长批量统计，但它不应该替你猜“阅读 1,234 次”到底是不是浏览量。

如果你学过 Excel，可以这样类比：

| Excel 概念 | pandas 概念 |
| --- | --- |
| 一个工作表 | `DataFrame` |
| 一列 | `Series` |
| 筛选 | 条件过滤 |
| 排序 | `sort_values()` |
| 透视表/分类汇总 | `groupby()` |
| 导出表格 | `to_csv()` |

先给你一张 pandas 在爬虫 CSV 分析中的能力地图：

| 阶段 | 常用方法 | 解决什么问题 |
| --- | --- | --- |
| 读取数据 | `read_csv()` | 把 CSV 变成 DataFrame |
| 观察结构 | `head()`、`info()`、`columns`、`shape` | 看行数、列名、类型、样例 |
| 选择数据 | `df['列']`、`df[['title', 'views']]`、`loc` | 取需要的列或行 |
| 筛选数据 | 布尔条件、`query()` | 找高浏览量、指定分类、异常数据 |
| 清洗数据 | `fillna()`、`dropna()`、`to_numeric()` | 处理空值和类型 |
| 去重数据 | `drop_duplicates()` | 去掉重复爬虫结果 |
| 合并数据 | `merge()` | 关联分类、标签、来源字典表 |
| 统计数据 | `groupby()`、`agg()`、`value_counts()` | 分类汇总、数量统计 |
| 计算指标 | 新列、`assign()`、`round()` | 计算平均值、转化率、比例 |
| 导出结果 | `to_csv()` | 输出明细、汇总、异常文件 |

也就是说，pandas 不是只会：

```python
pd.read_csv('articles.csv')
```

它在项目 demo 里的位置更像：

```text
读取清洗后的 CSV -> 检查质量 -> 筛选/去重/合并 -> 分组统计 -> 导出报表
```

## 一、本篇你会学到什么

学完这一篇，你应该能做到：

- 安装并导入 pandas。
- 用 `pd.read_csv()` 读取 CSV。
- 理解 `DataFrame` 是什么。
- 用 `head()`、`columns`、`info()` 查看数据。
- 选择单列和多列。
- 处理缺失值。
- 把字符串数字转换成真正的数字。
- 按分类分组统计。
- 排序和计算新列。
- 导出统计结果为 CSV。
- 使用 `usecols`、`dtype`、`parse_dates`、`na_values`、`chunksize` 等常见读取参数。
- 做数据质量检查、去重、合并字典表和大文件分块统计。
- 排查文件找不到、列名错误、数字不能计算等常见问题。

## 二、安装 pandas

在命令行运行：

```powershell
python -m pip install pandas
```

如果使用虚拟环境，先激活虚拟环境，再安装。

检查是否安装成功：

```powershell
python -c "import pandas as pd; print(pd.__version__)"
```

能看到版本号，就说明安装成功。

## 三、准备一份 CSV

新建文件：

```text
articles.csv
```

写入：

```csv
title,category,views,likes
Python 基础,Python,120,8
Python 爬虫,Python,260,20
Vue 入门,前端,180,16
Express 接口,后端,150,12
数据分析,Python,300,25
```

这一份数据表示：

- `title`：文章标题。
- `category`：文章分类。
- `views`：浏览量。
- `likes`：点赞数。

把它和后面的 Python 脚本放在同一个目录里，这样读取时最简单。

## 四、读取 CSV

新建文件：

```text
analyze_articles.py
```

写入：

```python
import pandas as pd

df = pd.read_csv('articles.csv')

print(df)
```

运行：

```powershell
python analyze_articles.py
```

输出类似：

```text
        title category  views  likes
0   Python 基础   Python    120      8
1   Python 爬虫   Python    260     20
2       Vue 入门       前端    180     16
3  Express 接口       后端    150     12
4        数据分析   Python    300     25
```

这里的 `df` 是 `DataFrame`。

你可以把 `DataFrame` 理解成 pandas 里的表格对象。

## 五、DataFrame 里有什么

一个 `DataFrame` 主要包含：

- 行索引：左侧的 `0, 1, 2, 3, 4`。
- 列名：`title`、`category`、`views`、`likes`。
- 数据：每个单元格里的值。

这和 Excel 很像，只是 pandas 用代码操作。

常见变量名一般写成：

```python
df = pd.read_csv('articles.csv')
```

`df` 是 data frame 的缩写。

## 六、先查看前几行

真实 CSV 可能有几千行甚至几十万行，不要一上来打印全部。

先看前几行：

```python
print(df.head())
```

`head()` 默认查看前 5 行。

也可以指定行数：

```python
print(df.head(3))
```

这会查看前 3 行。

## 七、查看列名和基本信息

查看列名：

```python
print(df.columns)
```

输出类似：

```text
Index(['title', 'category', 'views', 'likes'], dtype='object')
```

查看整体信息：

```python
print(df.info())
```

你会看到：

- 有多少行。
- 有多少列。
- 每列有多少非空值。
- 每列的数据类型。

常见数据类型：

| 类型 | 大致含义 |
| --- | --- |
| `object` | 字符串或混合类型 |
| `int64` | 整数 |
| `float64` | 小数 |
| `bool` | 布尔值 |

新手看 `info()` 时，重点关注：

- 列名是否正确。
- 数字列有没有被识别成数字。
- 是否存在缺失值。
- 行数是否符合预期。

## 八、选择某一列

选择标题列：

```python
titles = df['title']
print(titles)
```

输出的是一列数据。

在 pandas 里，一列通常叫 `Series`。

选择多列：

```python
subset = df[['title', 'views']]
print(subset)
```

注意：选择多列时外面是两个中括号。

为什么是两个？

```python
df[['title', 'views']]
```

里面的：

```python
['title', 'views']
```

是一个 Python 列表，表示你要选择哪些列。

外面的：

```python
df[['title', 'views']]
```

表示从 `DataFrame` 里取数据。

## 九、筛选数据

比如只看浏览量大于 180 的文章：

```python
popular_articles = df[df['views'] > 180]

print(popular_articles)
```

可以理解成：

1. `df['views'] > 180` 会判断每一行是否满足条件。
2. `df[条件]` 根据这个条件筛选行。

也可以筛选某个分类：

```python
python_articles = df[df['category'] == 'Python']

print(python_articles)
```

注意：判断是否相等要用 `==`，不是 `=`。

企业脚本里也常用 `loc` 明确表示“筛选行，再选择列”：

```python
popular_titles = df.loc[df['views'] > 180, ['title', 'views']]

print(popular_titles)
```

如果条件比较像自然语言，也可以用 `query()`：

```python
popular_articles = df.query('views > 180')

print(popular_articles)
```

入门阶段先掌握布尔筛选：

```python
df[df['views'] > 180]
```

后面读企业代码时，看到 `loc` 和 `query()` 要知道它们也是筛选数据的常见写法。

## 十、处理缺失值

真实 CSV 经常有空值。

比如：

```csv
title,category,views,likes
Python 基础,Python,120,8
Python 爬虫,Python,,20
Vue 入门,前端,180,
,后端,150,12
```

检查每列缺失值数量：

```python
print(df.isna().sum())
```

如果浏览量为空，可以填成 0：

```python
df['views'] = df['views'].fillna(0)
```

如果标题为空，这条数据通常没有分析价值，可以删除：

```python
df = df.dropna(subset=['title'])
```

处理缺失值没有固定答案，要看业务含义。

不要为了“没有空值”就随便填。比如标题为空和浏览量为空，处理方式就不一样。

## 十一、转换数字类型

从 CSV 读取的数据，有时数字会被识别成字符串。

比如 `views` 里混入了空字符串、中文或其他符号，pandas 可能无法直接当数字处理。

可以用 `pd.to_numeric()` 转换：

```python
df['views'] = pd.to_numeric(df['views'], errors='coerce').fillna(0)
df['likes'] = pd.to_numeric(df['likes'], errors='coerce').fillna(0)
```

`errors='coerce'` 的意思是：

> 遇到不能转换成数字的内容，就变成缺失值。

然后：

```python
fillna(0)
```

再把缺失值填成 0。

这样后面求和、排序、计算平均值会更稳定。

## 十二、按分类统计

现在开始做统计。

目标是得到：

- 每个分类有多少篇文章。
- 每个分类总浏览量是多少。
- 每个分类总点赞数是多少。

代码：

```python
summary = df.groupby('category').agg({
    'title': 'count',
    'views': 'sum',
    'likes': 'sum'
})

print(summary)
```

可以拆开理解：

```python
df.groupby('category')
```

按 `category` 分组。

```python
df.groupby('category').agg({'views': 'sum'})
```

对每个分组做统计。

这段字典：

```python
{
    'title': 'count',
    'views': 'sum',
    'likes': 'sum'
}
```

表示：

- `title` 用 `count`，统计数量。
- `views` 用 `sum`，统计总浏览量。
- `likes` 用 `sum`，统计总点赞数。

输出可能是：

```text
          title  views  likes
category
Python        3    680     53
前端           1    180     16
后端           1    150     12
```

如果只是统计某一列每个值出现多少次，可以用 `value_counts()`：

```python
category_count = df['category'].value_counts()

print(category_count)
```

这在快速查看分类数量、标签数量、状态分布时很常用。

## 十三、重命名统计列

上面的列名 `title`、`views`、`likes` 不够直观。

可以重命名：

```python
summary = summary.rename(columns={
    'title': 'article_count',
    'views': 'total_views',
    'likes': 'total_likes'
})

print(summary)
```

现在列名更清楚：

- `article_count`：文章数量。
- `total_views`：总浏览量。
- `total_likes`：总点赞数。

## 十四、计算新列

比如计算每个分类的平均浏览量：

```python
summary['avg_views'] = summary['total_views'] / summary['article_count']

print(summary)
```

这就是数据分析里常见的思路：

> 基于已有列，计算新的指标。

还可以计算平均点赞数：

```python
summary['avg_likes'] = summary['total_likes'] / summary['article_count']
```

## 十五、排序

按总浏览量从高到低排序：

```python
summary = summary.sort_values('total_views', ascending=False)

print(summary)
```

`ascending=False` 表示降序。

如果写成：

```python
ascending=True
```

就是升序。

## 十六、reset_index() 是什么

分组之后，`category` 会变成索引。

你看到的表格可能像这样：

```text
          article_count  total_views  total_likes
category
Python                3          680           53
前端                   1          180           16
后端                   1          150           12
```

如果要导出成普通 CSV，通常希望 `category` 也是一列。

这时用：

```python
summary = summary.reset_index()
```

之后会变成：

```text
  category  article_count  total_views  total_likes
0   Python              3          680           53
1       前端              1          180           16
2       后端              1          150           12
```

## 十七、导出统计结果

导出为 CSV：

```python
summary.to_csv('article_category_summary.csv', index=False, encoding='utf-8')
```

这里：

- `article_category_summary.csv`：输出文件名。
- `index=False`：不把行索引写进 CSV。
- `encoding='utf-8'`：使用 UTF-8 保存中文。

如果不写 `index=False`，导出的 CSV 可能会多一列无意义的索引。

## 十八、完整脚本

新建：

```text
analyze_articles.py
```

写入：

```python
import pandas as pd

df = pd.read_csv('articles.csv')

print('原始数据：')
print(df.head())

df = df.dropna(subset=['title'])
df['views'] = pd.to_numeric(df['views'], errors='coerce').fillna(0)
df['likes'] = pd.to_numeric(df['likes'], errors='coerce').fillna(0)

summary = df.groupby('category').agg({
    'title': 'count',
    'views': 'sum',
    'likes': 'sum'
})

summary = summary.rename(columns={
    'title': 'article_count',
    'views': 'total_views',
    'likes': 'total_likes'
})

summary['avg_views'] = summary['total_views'] / summary['article_count']
summary['avg_likes'] = summary['total_likes'] / summary['article_count']

summary = summary.sort_values('total_views', ascending=False).reset_index()

summary.to_csv('article_category_summary.csv', index=False, encoding='utf-8')

print('分类统计：')
print(summary)
print('统计结果已导出到 article_category_summary.csv')
```

运行：

```powershell
python analyze_articles.py
```

你会得到一个新的文件：

```text
article_category_summary.csv
```

内容类似：

```csv
category,article_count,total_views,total_likes,avg_views,avg_likes
Python,3,680,53,226.66666666666666,17.666666666666668
前端,1,180,16,180.0,16.0
后端,1,150,12,150.0,12.0
```

如果你想让平均值保留两位小数，可以加：

```python
summary['avg_views'] = summary['avg_views'].round(2)
summary['avg_likes'] = summary['avg_likes'].round(2)
```

## 十九、和基础语法的关系

这篇看起来是在学 pandas，其实也在复用基础知识：

- 字符串：列名、文件名、分类名。
- 列表：选择多列时使用列表。
- 字典：`agg()` 里用字典描述每列怎么统计。
- 函数：`read_csv()`、`groupby()`、`sort_values()` 都是函数或方法调用。
- 文件读写：CSV 输入和输出。
- 条件判断：筛选数据时会生成条件。
- 异常意识：真实数据可能缺列、缺值、类型错误。

如果你觉得 pandas 语法密度高，不要急。先把每一步的输入和输出看明白，比背方法名更重要。

## 二十、常见错误和排查

### 1. FileNotFoundError

错误含义：找不到 CSV 文件。

排查：

```python
from pathlib import Path

print(Path.cwd())
print(Path('articles.csv').exists())
```

确认脚本运行目录和 CSV 文件所在目录一致。

### 2. KeyError: 'views'

说明没有叫 `views` 的列。

先打印列名：

```python
print(df.columns)
```

可能原因：

- CSV 表头拼错。
- 表头里有空格。
- 读取的不是你以为的文件。

如果表头有空格，可以先清理：

```python
df.columns = df.columns.str.strip()
```

### 3. 数字列不能计算

可能是数字列里混入了字符串。

使用：

```python
df['views'] = pd.to_numeric(df['views'], errors='coerce').fillna(0)
```

### 4. 导出的 CSV 多了一列

通常是 `to_csv()` 没写：

```python
index=False
```

推荐：

```python
summary.to_csv('summary.csv', index=False, encoding='utf-8')
```

### 5. 中文在 Excel 里显示异常

先用 VS Code 打开 CSV，确认文件内容是否正常。

如果 VS Code 正常，多半是 Excel 对 UTF-8 CSV 的识别问题。学习阶段优先保持 UTF-8；需要专门兼容 Excel 时，再单独处理导出编码策略。

## 二十一、小练习

基于 `articles.csv` 完成：

1. 读取 CSV。
2. 删除标题为空的数据。
3. 把 `likes` 转成数字。
4. 按分类统计文章数量。
5. 按分类统计点赞总数。
6. 找出点赞总数最高的分类。
7. 导出为 `likes_summary.csv`。

参考代码：

```python
import pandas as pd

df = pd.read_csv('articles.csv')

df = df.dropna(subset=['title'])
df['likes'] = pd.to_numeric(df['likes'], errors='coerce').fillna(0)

summary = df.groupby('category').agg({
    'title': 'count',
    'likes': 'sum'
})

summary = summary.rename(columns={
    'title': 'article_count',
    'likes': 'total_likes'
})

summary = summary.sort_values('total_likes', ascending=False).reset_index()

summary.to_csv('likes_summary.csv', index=False, encoding='utf-8')

print(summary)
print('点赞最高的分类：')
print(summary.head(1))
```

## 二十二、企业开发中 pandas 常见用法

前面的内容已经能完成基础统计。真实工作里，pandas 还经常用在这些场景：

- 检查爬虫 CSV 是否缺字段、缺值、重复。
- 把清洗后的明细表汇总成报表。
- 把分类、标签、用户等字典表合并到明细数据里。
- 处理几十万行甚至更多的 CSV。
- 导出给后台导入、运营查看或继续入库的数据文件。

下面这些写法很常见，不需要一次背完，但你读代码时要能认出来。

### 1. read_csv 常用参数

基础写法是：

```python
df = pd.read_csv('articles.csv')
```

企业脚本里更常见的是把字段、类型、日期和空值规则写清楚：

```python
import pandas as pd

df = pd.read_csv(
    'clean_articles.csv',
    usecols=['title', 'category', 'views', 'likes', 'published_at'],
    dtype={
        'title': 'string',
        'category': 'string'
    },
    parse_dates=['published_at'],
    na_values=['', '未知', 'N/A', '-']
)
```

这些参数分别表示：

| 参数 | 作用 | 常见用途 |
| --- | --- | --- |
| `usecols` | 只读取指定列 | CSV 很宽时，只读需要的字段 |
| `dtype` | 指定列类型 | 避免 ID、分类、标题被错误推断 |
| `parse_dates` | 把日期列解析成日期类型 | 后续按月份、年份统计 |
| `na_values` | 指定哪些内容算缺失值 | 把 `未知`、`N/A`、`-` 统一当空值 |

注意：`dtype` 不一定适合所有数字列。

如果数字列里可能混入脏数据，先用 `pd.to_numeric(errors='coerce')` 会更稳。

### 2. 数据质量检查

在统计之前，企业脚本通常会先做一份简单质量报告。

```python
print('行数：', len(df))
print('列名：', list(df.columns))
print('缺失值：')
print(df.isna().sum())
print('重复 URL 数：', df.duplicated(subset=['url']).sum() if 'url' in df.columns else 0)
```

如果你不先检查数据质量，很容易出现这种情况：

- 分组统计少了很多行，但你不知道是标题为空被删掉了。
- 浏览量总和不对，因为某些值其实是字符串。
- 同一篇文章被重复抓了三次，导致报表被放大。
- CSV 表头多了空格，代码里一直 `KeyError`。

可以先统一清理列名：

```python
df.columns = df.columns.str.strip()
```

再检查必需字段是否存在：

```python
required_columns = {'title', 'category', 'views'}
missing_columns = required_columns - set(df.columns)

if missing_columns:
    raise ValueError(f'缺少必需字段：{missing_columns}')
```

这类检查在企业导入、报表脚本、数据迁移里非常常见。

### 3. 去重：drop_duplicates

爬虫数据很容易重复。

如果有稳定的 URL，可以按 URL 去重：

```python
df = df.drop_duplicates(subset=['url'], keep='first')
```

如果没有 URL，也可以用组合字段做弱去重：

```python
df = df.drop_duplicates(subset=['title', 'published_at'], keep='first')
```

这里：

- `subset`：用哪些列判断重复。
- `keep='first'`：重复时保留第一条。

真实项目里更推荐用稳定 ID 或 URL 去重。标题可能被修改，同一天也可能有重名文章，所以 `title + published_at` 只能算退而求其次。

### 4. 合并字典表：merge

企业数据里经常有“明细表”和“字典表”。

比如文章明细里只有分类编码：

```csv
title,category_code,views
Python 基础,python,120
Vue 入门,frontend,180
```

另一个 CSV 保存分类名称：

```csv
category_code,category_name
python,Python
frontend,前端
```

可以这样合并：

```python
articles = pd.read_csv('articles.csv')
categories = pd.read_csv('categories.csv')

df = articles.merge(
    categories,
    on='category_code',
    how='left'
)
```

`how='left'` 表示以文章明细为主，能匹配到分类就补上，匹配不到也保留文章。

合并后要检查有没有没匹配上的数据：

```python
missing_category = df[df['category_name'].isna()]
print('未匹配分类数量：', len(missing_category))
```

这个场景在后台导入、数据迁移、报表加工里非常常见。

### 5. 大 CSV 分块处理：chunksize

如果 CSV 很大，一次性读取可能占用很多内存。

pandas 支持按块读取：

```python
import pandas as pd

total_views = 0
total_rows = 0

for chunk in pd.read_csv('clean_articles.csv', chunksize=10000):
    chunk['views'] = pd.to_numeric(chunk['views'], errors='coerce').fillna(0)
    total_views += chunk['views'].sum()
    total_rows += len(chunk)

print('总行数：', total_rows)
print('总浏览量：', total_views)
```

`chunksize=10000` 表示每次读取 10000 行。

这种方式适合：

- 只做总量统计。
- 数据太大，内存放不下。
- 想边读边处理、边输出。

如果你需要对全量数据做复杂排序、全局去重、窗口计算，就要更谨慎。pandas 不是专门的大数据引擎，数据规模继续增大时，可能要考虑数据库、Spark、DuckDB 等工具。

### 6. 同时导出明细和汇总

真实脚本通常不只导出一个统计表。

更常见的是：

- 导出清洗后的明细，方便排查每一条数据。
- 导出汇总结果，方便查看整体指标。
- 导出异常数据，方便后续修复。

示例：

```python
valid_df = df.dropna(subset=['title'])
invalid_df = df[df['title'].isna()]

summary = valid_df.groupby('category').agg({
    'title': 'count',
    'views': 'sum'
}).rename(columns={
    'title': 'article_count',
    'views': 'total_views'
}).reset_index()

valid_df.to_csv('clean_articles_valid.csv', index=False, encoding='utf-8')
invalid_df.to_csv('clean_articles_invalid.csv', index=False, encoding='utf-8')
summary.to_csv('article_summary.csv', index=False, encoding='utf-8')
```

这样以后看到统计结果异常，可以回到明细和异常文件里查原因。

### 7. 不要把 pandas 当长期数据库

pandas 很适合做分析和加工，但它不是长期业务数据库。

适合 pandas 的事情：

- 临时分析 CSV。
- 清洗导入前的数据。
- 生成一次性报表。
- 验证爬虫数据质量。

不适合长期只靠 pandas 做的事情：

- 多用户同时写入。
- 权限控制。
- 长期增删改查。
- 复杂业务事务。
- 稳定线上查询接口。

企业里更常见的分工是：

```text
爬虫脚本 -> 清洗 CSV/JSON -> pandas 质检和报表 -> 数据库/后台系统长期管理
```

## 本篇小结

这一篇完成了数据分析入门闭环：

- `pd.read_csv()` 读取 CSV。
- `DataFrame` 可以理解成 pandas 里的表格。
- `head()` 快速查看数据。
- `columns` 和 `info()` 用来检查结构。
- `isna()` 检查缺失值。
- `fillna()` 填充缺失值。
- `dropna()` 删除缺失数据。
- `pd.to_numeric()` 转换数字类型。
- `groupby().agg()` 分组统计。
- `rename()` 重命名列。
- `sort_values()` 排序。
- `reset_index()` 把分组索引恢复成普通列。
- `to_csv()` 导出结果。
- 企业常用 `read_csv` 参数包括 `usecols`、`dtype`、`parse_dates`、`na_values` 和 `chunksize`。
- 做正式统计前，要检查缺失值、重复值、必需字段和字段类型。
- `drop_duplicates()` 常用于爬虫结果去重，`merge()` 常用于合并字典表。
- pandas 适合分析和加工，不适合替代长期业务数据库。

到这里，你已经完成了一条基础数据流程：

```text
请求网页 -> 解析 HTML -> 正则清洗字段 -> 保存 CSV -> pandas 统计 CSV -> 导出统计结果 -> matplotlib 画图
```

这就是很多入门级爬虫和数据分析任务的核心骨架。

下一篇我们会学习 `matplotlib`，把 pandas 统计出来的分类汇总、趋势数据和异常分布画成图片。

参考资料：

- pandas 官方文档：https://pandas.pydata.org/docs/
- pandas 入门教程：https://pandas.pydata.org/docs/getting_started/intro_tutorials/
