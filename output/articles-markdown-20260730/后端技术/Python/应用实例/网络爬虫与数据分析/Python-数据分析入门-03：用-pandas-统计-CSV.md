---
title: "Python 数据分析入门 03：用 pandas 统计 CSV"
slug: "python-data-analysis-pandas-csv-revision-20260730"
summary: "使用 pandas 读取 CSV，查看数据、处理缺失值、按分类汇总、排序，并把统计结果重新导出为 CSV。"
category: "网络爬虫与数据分析"
tags:
  - "Python"
status: "draft"
sortOrder: 30
cover: ""
originalId: "6a4a44b5f9ac958d291774f3"
originalSlug: "python-data-analysis-pandas-csv"
originalStatus: "published"
exportedAt: "2026-07-30T13:20:22.058Z"
---
# Python 数据分析入门 03：用 pandas 统计 CSV

前两篇已经完成了：

1. 请求网页。
2. 解析 HTML。
3. 保存 CSV。

这一篇继续做数据分析：用 pandas 读取 CSV，看看这些数据有什么规律。

pandas 可以先理解成“Python 里的表格工具”。它很适合处理 CSV、Excel、数据库查询结果这类二维表数据。

## 安装 pandas

```powershell
python -m pip install pandas
```

如果只是在命令行里跑脚本，建议先进入项目虚拟环境再安装。

## 准备一份 CSV

新建 `articles.csv`：

```csv
title,category,views,likes
Python 基础,Python,120,8
Python 爬虫,Python,260,20
Vue 入门,前端,180,16
Express 接口,后端,150,12
数据分析,Python,300,25
```

这一份数据表示文章标题、分类、浏览量、点赞数。

## 读取 CSV

```python
import pandas as pd

df = pd.read_csv('articles.csv')

print(df)
```

`df` 是 `DataFrame`，可以理解成 pandas 里的表格对象。

## 查看前几行

```python
print(df.head())
```

`head()` 默认查看前 5 行。真实数据很多时，不要一上来打印全部内容，先看前几行确认结构。

## 查看列名和基本信息

```python
print(df.columns)
print(df.info())
```

常用检查点：

- 列名是否正确。
- 数字列有没有被识别成数字。
- 是否存在缺失值。
- 行数是否符合预期。

## 选择某一列

```python
titles = df['title']
print(titles)
```

选择多列：

```python
subset = df[['title', 'views']]
print(subset)
```

注意：选择多列时外面是两个中括号，因为里面的 `['title', 'views']` 是一个列表。

## 处理缺失值

真实 CSV 经常有空值。

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

处理缺失值没有固定答案，要看业务含义。不能为了“没有空值”就随便填。

## 转换数字类型

从 CSV 读取的数据，有时数字会变成字符串。可以用 `to_numeric` 转换。

```python
df['views'] = pd.to_numeric(df['views'], errors='coerce').fillna(0)
df['likes'] = pd.to_numeric(df['likes'], errors='coerce').fillna(0)
```

`errors='coerce'` 的意思是：遇到不能转换的内容，就变成缺失值。

## 按分类统计

```python
summary = df.groupby('category').agg({
    'title': 'count',
    'views': 'sum',
    'likes': 'sum'
})

print(summary)
```

这段代码的意思是：

- 按 `category` 分组。
- 统计每个分类有多少篇文章。
- 汇总每个分类的浏览量。
- 汇总每个分类的点赞数。

为了让列名更清楚，可以重命名：

```python
summary = summary.rename(columns={
    'title': 'article_count',
    'views': 'total_views',
    'likes': 'total_likes'
})

print(summary)
```

## 排序

按总浏览量从高到低排序：

```python
summary = summary.sort_values('total_views', ascending=False)
print(summary)
```

`ascending=False` 表示降序。

## 计算新列

比如计算每篇文章平均浏览量：

```python
summary['avg_views'] = summary['total_views'] / summary['article_count']
print(summary)
```

这就是数据分析里很常见的思路：基于已有列计算新指标。

## 导出统计结果

```python
summary.to_csv('article_category_summary.csv', encoding='utf-8')
```

如果不想把分组索引写入文件，可以先重置索引：

```python
summary = summary.reset_index()
summary.to_csv('article_category_summary.csv', index=False, encoding='utf-8')
```

## 完整脚本

```python
import pandas as pd

df = pd.read_csv('articles.csv')

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
summary = summary.sort_values('total_views', ascending=False).reset_index()

summary.to_csv('article_category_summary.csv', index=False, encoding='utf-8')

print(summary)
```

## 和基础语法的关系

这篇看起来是在学 pandas，其实也在复用基础知识：

- 字符串：列名、文件名、分类名。
- 列表：选择多列时使用列表。
- 字典：`agg()` 里用字典描述每列怎么统计。
- 函数：`read_csv()`、`groupby()`、`sort_values()` 都是函数或方法调用。
- 文件读写：CSV 输入和输出。
- 异常意识：真实数据可能缺列、缺值、类型错误。

## 小练习

基于 `articles.csv` 完成：

1. 读取 CSV。
2. 删除标题为空的数据。
3. 按分类统计文章数量。
4. 按分类统计点赞总数。
5. 找出点赞总数最高的分类。
6. 导出为 `likes_summary.csv`。

提示：

```python
summary = df.groupby('category').agg({
    'title': 'count',
    'likes': 'sum'
})
```

## 本篇小结

这一篇完成了数据分析入门闭环：

- `pd.read_csv()` 读取 CSV。
- `head()` 快速查看数据。
- `isna()` 检查缺失值。
- `fillna()` 填充缺失值。
- `dropna()` 删除缺失数据。
- `groupby().agg()` 分组统计。
- `sort_values()` 排序。
- `to_csv()` 导出结果。

参考资料：

- pandas 官方文档：https://pandas.pydata.org/docs/
- pandas 入门教程：https://pandas.pydata.org/docs/getting_started/intro_tutorials/
