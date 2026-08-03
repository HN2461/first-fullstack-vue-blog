---
title: "第 6 篇：用 matplotlib 绘制统计图：折线图、柱状图、散点图、饼图、多子图"
slug: "python-data-visualization-matplotlib-charts"
summary: "Python 数据可视化入门，使用 matplotlib 将 pandas 统计结果绘制成折线图、柱状图、散点图、直方图、饼图和多子图，掌握标题、坐标轴、图例、网格和中文字体。"
category: "网络爬虫与数据分析"
categoryPath:
  - "后端技术"
  - "Python"
  - "网络爬虫与数据分析"
tags:
  - "Python"
  - "matplotlib"
  - "数据可视化"
  - "数据分析"
status: "published"
sortOrder: 60
cover: ""
originalId: "6a6b57a2fca6347974f5d190"
originalSlug: "python-data-visualization-matplotlib-charts"
originalStatus: "published"
publishedAt: "2026-07-30T14:44:46.178Z"
updatedAt: "2026-07-31T11:16:22.014Z"
exportedAt: "2026-08-03T10:17:08.920Z"
---
# 第 6 篇：用 matplotlib 绘制统计图：折线图、柱状图、散点图、饼图、多子图

前面几篇已经完成了一条基础数据流程：

1. 用 `requests` 请求网页或接口。
2. 用 `lxml` 和 XPath 解析 HTML。
3. 用正则表达式清洗标题、日期、阅读量、标签等字段。
4. 用 `csv` 保存结构化数据。
5. 用 `pandas` 读取 CSV 并做分类统计、排序和导出。

这一篇继续往后走：

> 用 matplotlib 把统计结果画成图，让数据变化和对比更容易看出来。

你可以先把 matplotlib 理解成：

> Python 里最基础、最常用的画图工具。

它不只会画一条折线。真实项目里经常用它做：

- 数据分析报告里的统计图。
- 爬虫结果的分类对比图。
- 浏览量、评论数、下载量的趋势图。
- 数据质量检查图。
- 自动化脚本批量生成 PNG 图片。
- 后台系统或日报里的图表素材。

先给你一张 matplotlib 在数据分析中的能力地图：

| 能力 | 常用方法 | 解决什么问题 |
| --- | --- | --- |
| 折线图 | `plot()` | 看时间趋势、连续变化 |
| 柱状图 | `bar()`、`barh()` | 对比不同分类的数量或总量 |
| 散点图 | `scatter()` | 看两个变量之间是否有关联 |
| 直方图 | `hist()` | 看数据分布，比如阅读量集中在哪个区间 |
| 饼图 | `pie()` | 看少量分类的占比 |
| 子图 | `subplots()` | 一张图片里放多个图表 |
| 标题和坐标轴 | `set_title()`、`set_xlabel()`、`set_ylabel()` | 让图能被别人看懂 |
| 图例 | `legend()` | 区分多条线、多组数据 |
| 网格和样式 | `grid()`、`style.use()` | 提升可读性 |
| 保存图片 | `savefig()` | 输出 PNG、JPG、SVG、PDF |
| 工程化绘图 | `Figure`、`Axes`、函数封装、批量关闭图 | 让脚本稳定生成报表 |

注意：这一篇不是追求把 matplotlib 的每一个参数都背下来，而是先掌握企业和项目里最常见的画图方式。

## 一、本篇你会学到什么

学完这一篇，你应该能做到：

- 安装并导入 matplotlib。
- 知道 `pyplot` 是什么。
- 理解 `Figure` 和 `Axes` 的关系。
- 区分 `plt.plot()` 快速写法和 `fig, ax = plt.subplots()` 面向对象写法。
- 会画折线图、柱状图、散点图、直方图、饼图。
- 会设置标题、坐标轴、图例、网格、刻度、图片尺寸。
- 会处理中文显示和负号显示。
- 会用 `pandas` 统计结果画图。
- 会保存图片到本地文件。
- 知道企业脚本中如何封装绘图函数、批量生成图片、避免内存问题。

## 二、安装 matplotlib

在命令行执行：

```powershell
python -m pip install matplotlib pandas
```

检查是否安装成功：

```powershell
python -c "import matplotlib; print(matplotlib.__version__)"
```

如果能输出版本号，说明安装成功。

常见导入方式：

```python
import matplotlib.pyplot as plt  # 导入画图模块，约定俗成简写成 plt
```

`pyplot` 通常会简写成 `plt`。

这和 pandas 的导入风格很像：

```python
import pandas as pd                # 导入表格处理模块，简写成 pd
import matplotlib.pyplot as plt    # 导入画图模块，简写成 plt
```

## 三、先画第一张折线图

新建文件：

```text
matplotlib_first_chart.py
```

写入：

```python
import matplotlib.pyplot as plt

# 准备数据：横轴是日期，纵轴是浏览量
days = ['周一', '周二', '周三', '周四', '周五']
views = [120, 180, 160, 220, 300]

plt.plot(days, views)  # 画折线：第一参数是横轴，第二参数是纵轴
plt.show()             # 弹出窗口显示图表
```

运行：

```powershell
python matplotlib_first_chart.py
```

如果环境支持弹窗，你会看到一张折线图。

这几行代码的意思是：

1. `days` 是横轴数据。
2. `views` 是纵轴数据。
3. `plt.plot(days, views)` 画折线。
4. `plt.show()` 显示图表窗口。

不过这个图现在还很粗糙：

- 没有标题。
- 不知道横轴表示什么。
- 不知道纵轴表示什么。
- 中文可能显示成方块。

所以真实项目里不能只停留在 `plt.plot()`。

## 四、先解决中文显示问题

matplotlib 默认字体不一定支持中文。

如果你直接写中文标题，可能会看到方块、空白或乱码。

Windows 上常用写法：

```python
import matplotlib.pyplot as plt

plt.rcParams['font.sans-serif'] = ['Microsoft YaHei', 'SimHei']  # 指定优先使用的中文字体
plt.rcParams['axes.unicode_minus'] = False                       # 解决负号显示成方块的问题
```

解释：

| 配置 | 作用 |
| --- | --- |
| `font.sans-serif` | 指定优先使用的中文字体 |
| `axes.unicode_minus` | 解决负号显示成方块的问题 |

完整示例：

```python
import matplotlib.pyplot as plt

# --- 字体配置：让中文和负号正常显示 ---
plt.rcParams['font.sans-serif'] = ['Microsoft YaHei', 'SimHei']
plt.rcParams['axes.unicode_minus'] = False

# --- 准备数据 ---
days = ['周一', '周二', '周三', '周四', '周五']
views = [120, 180, 160, 220, 300]

# --- 画图 ---
plt.plot(days, views)      # 画折线
plt.title('文章浏览量趋势')  # 设置标题
plt.xlabel('日期')          # 设置横轴标题
plt.ylabel('浏览量')        # 设置纵轴标题
plt.show()                 # 显示图表
```

如果你的电脑没有这些字体，可以先换成系统已有中文字体。

企业脚本里通常会把字体配置封装成函数，避免每个脚本重复写。

```python
import matplotlib.pyplot as plt


def configure_chinese_font():
    """配置中文字体，每个脚本只需调用一次。"""
    plt.rcParams['font.sans-serif'] = ['Microsoft YaHei', 'SimHei']
    plt.rcParams['axes.unicode_minus'] = False


configure_chinese_font()  # 调用一次，后续所有图表都会生效
```

> **📖 阅读约定（重要）**
>
> 从下一节开始，每个代码示例都会包含上面那 3 行字体配置，保证你 **直接复制就能运行**。
>
> 但为了不干扰你阅读重点，字体配置部分会用注释标记为 `已讲解`，你只需要关注 `本节重点` 标记下方的代码即可。
>
> 如果你已经理解了字体配置，看代码时可以直接跳过那些行。

## 五、`pyplot` 是什么

`matplotlib.pyplot` 可以理解成一套"快捷画图函数"。

比如：

```python
import matplotlib.pyplot as plt

plt.plot([1, 2, 3], [10, 20, 15])  # 横轴 [1,2,3]，纵轴 [10,20,15]
plt.title('简单折线图')              # 设置标题
plt.show()                          # 显示图表
```

这种写法适合：

- 入门练习。
- 临时看一眼数据。
- Jupyter Notebook 里快速画图。
- 非常简单的一张图。

但企业项目里，稍微复杂一点就会推荐另一种写法：

```python
import matplotlib.pyplot as plt

fig, ax = plt.subplots()            # 创建一张画布(fig)和一个图表区域(ax)
ax.plot([1, 2, 3], [10, 20, 15])    # 在 ax 上画折线
ax.set_title('简单折线图')            # 在 ax 上设置标题
plt.show()                          # 显示图表
```

这一种叫面向对象写法。

你先不用怕它，只要记住：

- `fig` 是整张画布。
- `ax` 是画布里的一个坐标区域。
- 真正画线、画柱子、设置标题，通常都在 `ax` 上做。

## 六、Figure 和 Axes 是什么

matplotlib 里有两个特别常见的概念：

| 名称 | 可以理解成 | 常见变量名 |
| --- | --- | --- |
| `Figure` | 整张图片、整块画布 | `fig` |
| `Axes` | 图片里的一个图表区域 | `ax` |

一张图片可以只有一个图：

```text
Figure
└── Axes
```

也可以有多个图：

```text
Figure
├── Axes 1
├── Axes 2
├── Axes 3
└── Axes 4
```

所以这行代码非常重要：

```python
fig, ax = plt.subplots()  # 同时创建画布(fig)和图表区域(ax)
```

它的意思是：

> 创建一张图，并在图里创建一个坐标区域。

完整示例：

```python
import matplotlib.pyplot as plt

# --- 字体配置（第四节已讲解）---
plt.rcParams['font.sans-serif'] = ['Microsoft YaHei', 'SimHei']
plt.rcParams['axes.unicode_minus'] = False

# ====== 以下为本节重点：面向对象写法 ======

fig, ax = plt.subplots()                # 创建画布 + 图表区域

days = ['周一', '周二', '周三', '周四', '周五']
views = [120, 180, 160, 220, 300]

ax.plot(days, views)                    # 在 ax 上画折线（注意是 ax.plot，不是 plt.plot）
ax.set_title('文章浏览量趋势')            # 在 ax 上设置标题（注意是 ax.set_title）
ax.set_xlabel('日期')                   # 在 ax 上设置横轴标题
ax.set_ylabel('浏览量')                 # 在 ax 上设置纵轴标题

plt.show()                              # 显示图表
```

> **💡 代码解读**
>
> | 行 | 代码 | 作用 |
> | --- | --- | --- |
> | 1 | `fig, ax = plt.subplots()` | 创建一张画布和一个图表区域 |
> | 2 | `days = [...]` | 准备横轴数据 |
> | 3 | `views = [...]` | 准备纵轴数据 |
> | 4 | `ax.plot(days, views)` | 在 `ax` 上画折线 |
> | 5 | `ax.set_title(...)` | 设置图表标题 |
> | 6 | `ax.set_xlabel(...)` | 设置横轴标题 |
> | 7 | `ax.set_ylabel(...)` | 设置纵轴标题 |
> | 8 | `plt.show()` | 弹窗显示图表 |

这段代码比 `plt.plot()` 多了几行，但更适合后续扩展。

## 七、项目里推荐哪种写法

入门阶段你会看到两种写法。

### 1. 快速写法

```python
import matplotlib.pyplot as plt

plt.plot(['周一', '周二', '周三'], [100, 150, 130])  # 直接用 plt 画线
plt.title('浏览量')                                    # 直接用 plt 设置标题
plt.show()
```

优点：

- 少写几行代码。
- 适合快速演示。

缺点：

- 多张图时容易混乱。
- 批量保存图片时不够清晰。
- 不方便封装函数。

### 2. 面向对象写法

```python
import matplotlib.pyplot as plt

fig, ax = plt.subplots()                              # 先创建画布和图表区域
ax.plot(['周一', '周二', '周三'], [100, 150, 130])     # 在 ax 上画线
ax.set_title('浏览量')                                 # 在 ax 上设置标题
plt.show()
```

优点：

- 结构清楚。
- 适合多子图。
- 适合封装函数。
- 适合自动化脚本保存图片。

企业项目里更常见的是面向对象写法。

所以后面的示例会以 `fig, ax = plt.subplots()` 为主。

## 八、折线图：看趋势

折线图适合看"随时间变化"的数据。

比如文章每天浏览量：

```python
import matplotlib.pyplot as plt

# --- 字体配置（第四节已讲解）---
plt.rcParams['font.sans-serif'] = ['Microsoft YaHei', 'SimHei']
plt.rcParams['axes.unicode_minus'] = False

# ====== 以下为本节重点：折线图 ======

dates = ['07-01', '07-02', '07-03', '07-04', '07-05']
views = [120, 180, 160, 220, 300]

fig, ax = plt.subplots(figsize=(8, 4))                          # 创建画布，设置尺寸（宽8英寸，高4英寸）
ax.plot(dates, views, marker='o', linewidth=2, label='浏览量')   # 画折线：圆点标记、线宽2、图例名称

ax.set_title('每日文章浏览量趋势')   # 设置标题
ax.set_xlabel('日期')               # 设置横轴标题
ax.set_ylabel('浏览量')             # 设置纵轴标题
ax.legend()                         # 显示图例（对应 label='浏览量'）
ax.grid(True, linestyle='--', alpha=0.4)  # 显示虚线网格，透明度0.4

fig.tight_layout()                  # 自动调整布局，防止文字重叠
plt.show()                          # 显示图表
```

> **💡 代码解读**
>
> 重点看 `ax.plot()` 这一行，它有 4 个参数：
>
> | 参数 | 值 | 作用 |
> | --- | --- | --- |
> | `marker` | `'o'` | 每个数据点显示一个圆点 |
> | `linewidth` | `2` | 线条粗细，数字越大越粗 |
> | `label` | `'浏览量'` | 图例名称，配合 `ax.legend()` 显示 |
> | `figsize` | `(8, 4)` | 画布尺寸（宽, 高），单位是英寸 |
>
> `ax.grid(True, linestyle='--', alpha=0.4)` 表示：
> - `True`：开启网格。
> - `linestyle='--'`：虚线样式。
> - `alpha=0.4`：透明度，0 是完全透明，1 是完全不透明。

如果有多条线，可以这样写：

```python
import matplotlib.pyplot as plt

# --- 字体配置（第四节已讲解）---
plt.rcParams['font.sans-serif'] = ['Microsoft YaHei', 'SimHei']
plt.rcParams['axes.unicode_minus'] = False

# ====== 以下为本节重点：多条折线 ======

dates = ['07-01', '07-02', '07-03', '07-04', '07-05']
python_views = [120, 180, 160, 220, 300]
web_views = [90, 140, 130, 210, 260]

fig, ax = plt.subplots(figsize=(8, 4))
ax.plot(dates, python_views, marker='o', label='Python')  # 第一条线：圆点标记
ax.plot(dates, web_views, marker='s', label='前端')        # 第二条线：方块标记（marker='s'）

ax.set_title('不同分类文章浏览量趋势')
ax.set_xlabel('日期')
ax.set_ylabel('浏览量')
ax.legend()  # 多条线时，图例必不可少
ax.grid(True, linestyle='--', alpha=0.4)

fig.tight_layout()
plt.show()
```

多条线一定要写 `label` 和 `legend()`，否则读图的人不知道每条线代表什么。

## 九、柱状图：看分类对比

柱状图适合对比不同分类的数量。

比如统计每个分类的文章数量：

```python
import matplotlib.pyplot as plt

# --- 字体配置（第四节已讲解）---
plt.rcParams['font.sans-serif'] = ['Microsoft YaHei', 'SimHei']
plt.rcParams['axes.unicode_minus'] = False

# ====== 以下为本节重点：柱状图 ======

categories = ['Python', '前端', '数据库', '运维']
article_counts = [18, 24, 9, 7]

fig, ax = plt.subplots(figsize=(8, 4))
bars = ax.bar(categories, article_counts)  # 画柱状图，返回柱子对象（后面用来标注数值）

ax.set_title('各分类文章数量')
ax.set_xlabel('分类')
ax.set_ylabel('文章数量')
ax.bar_label(bars, padding=3)  # 在每根柱子顶部显示数值，padding=3 表示距离柱子3个像素

fig.tight_layout()
plt.show()
```

> **💡 代码解读**
>
> | 行 | 代码 | 作用 |
> | --- | --- | --- |
> | 1 | `bars = ax.bar(categories, article_counts)` | 画柱状图，`bars` 保存柱子对象 |
> | 2 | `ax.set_title(...)` | 设置标题 |
> | 3 | `ax.bar_label(bars, padding=3)` | 把数值标在柱子上方，`padding` 控制间距 |
>
> 注意：`ax.bar()` 返回的 `bars` 对象要保存下来，`ax.bar_label()` 需要用它来定位每根柱子。

如果分类名称很长，可以旋转横轴文字：

```python
import matplotlib.pyplot as plt

# --- 字体配置（第四节已讲解）---
plt.rcParams['font.sans-serif'] = ['Microsoft YaHei', 'SimHei']
plt.rcParams['axes.unicode_minus'] = False

# ====== 以下为本节重点：旋转横轴文字 ======

categories = ['Python 基础教程', '前端 Vue 实战', '数据库设计', '服务器部署']
article_counts = [18, 24, 9, 7]

fig, ax = plt.subplots(figsize=(9, 4))
bars = ax.bar(categories, article_counts)

ax.set_title('各分类文章数量')
ax.set_xlabel('分类')
ax.set_ylabel('文章数量')
ax.bar_label(bars, padding=3)
ax.tick_params(axis='x', rotation=25)  # 横轴文字旋转25度，避免重叠

fig.tight_layout()
plt.show()
```

如果分类很多，横向柱状图更适合：

```python
import matplotlib.pyplot as plt

# --- 字体配置（第四节已讲解）---
plt.rcParams['font.sans-serif'] = ['Microsoft YaHei', 'SimHei']
plt.rcParams['axes.unicode_minus'] = False

# ====== 以下为本节重点：横向柱状图 ======

categories = ['Python 基础教程', '前端 Vue 实战', '数据库设计', '服务器部署']
article_counts = [18, 24, 9, 7]

fig, ax = plt.subplots(figsize=(8, 4))
bars = ax.barh(categories, article_counts)  # barh = bar horizontal，横向柱状图

ax.set_title('各分类文章数量')
ax.set_xlabel('文章数量')  # 注意：横向柱状图的横轴是数值
ax.set_ylabel('分类')      # 注意：横向柱状图的纵轴是分类名
ax.bar_label(bars, padding=3)

fig.tight_layout()
plt.show()
```

企业报表里，如果分类名称长，`barh()` 往往比 `bar()` 更清楚。

## 十、散点图：看两个字段关系

散点图适合观察两个数值字段之间是否有关联。

比如：

- 字数越多，阅读量是否越高？
- 评论数越多，点赞数是否越高？
- 价格越高，销量是否越低？

示例：

```python
import matplotlib.pyplot as plt

# --- 字体配置（第四节已讲解）---
plt.rcParams['font.sans-serif'] = ['Microsoft YaHei', 'SimHei']
plt.rcParams['axes.unicode_minus'] = False

# ====== 以下为本节重点：散点图 ======

word_counts = [800, 1200, 1500, 2200, 3000, 4500, 5200]  # 每篇文章的字数
views = [90, 160, 210, 260, 430, 520, 610]                # 对应的浏览量

fig, ax = plt.subplots(figsize=(7, 4))
ax.scatter(word_counts, views, s=80, alpha=0.7)  # 画散点：s=点大小，alpha=透明度

ax.set_title('文章字数与浏览量关系')
ax.set_xlabel('文章字数')
ax.set_ylabel('浏览量')
ax.grid(True, linestyle='--', alpha=0.4)

fig.tight_layout()
plt.show()
```

> **💡 代码解读**
>
> `ax.scatter()` 的常用参数：
>
> | 参数 | 作用 | 示例值 |
> | --- | --- | --- |
> | `s` | 点的大小（数字越大点越大） | `80` |
> | `alpha` | 透明度（0~1，越低越透明） | `0.7` |
> | `c` | 点的颜色 | `'red'`、`'#4f81bd'` |
>
> 从这个图可以看出：字数越多，浏览量整体呈上升趋势。但散点图只能观察趋势，不能证明因果关系。

散点图不能证明因果关系。

它只能帮助你观察：

- 有没有正相关趋势。
- 有没有明显离群点。
- 数据是否分成几团。

## 十一、直方图：看数据分布

直方图适合看一组数字分布在哪些区间。

比如文章阅读量分布：

```python
import matplotlib.pyplot as plt

# --- 字体配置（第四节已讲解）---
plt.rcParams['font.sans-serif'] = ['Microsoft YaHei', 'SimHei']
plt.rcParams['axes.unicode_minus'] = False

# ====== 以下为本节重点：直方图 ======

views = [80, 120, 150, 160, 180, 210, 240, 260, 280, 320, 500, 760, 900]

fig, ax = plt.subplots(figsize=(7, 4))
ax.hist(views, bins=5, edgecolor='white')  # bins=5 表示分成5个区间，edgecolor 设置柱子边框颜色

ax.set_title('文章浏览量分布')
ax.set_xlabel('浏览量区间')
ax.set_ylabel('文章数量')
ax.grid(True, axis='y', linestyle='--', alpha=0.4)  # axis='y' 表示只显示横向网格线

fig.tight_layout()
plt.show()
```

> **💡 代码解读**
>
> `ax.hist()` 和 `ax.bar()` 看起来都是柱子，但有本质区别：
>
> | 对比项 | 柱状图 `bar()` | 直方图 `hist()` |
> | --- | --- | --- |
> | 适合数据 | 分类数据（Python、前端…） | 连续数字（浏览量、价格…） |
> | 横轴含义 | 分类名称 | 数值区间 |
> | 柱子宽度 | 所有柱子一样宽 | 区间宽度可能不同 |
> | 参数 | `ax.bar(分类, 数值)` | `ax.hist(数值列表, bins=区间数)` |
>
> `bins=5` 表示把数据范围均匀分成 5 个区间，统计每个区间内有多少篇文章。

直方图适合回答：

- 大多数文章浏览量集中在哪个范围？
- 有没有少数文章特别高？
- 数据分布是否很偏？

## 十二、饼图：看少量分类占比

饼图适合看少量分类占比。

示例：

```python
import matplotlib.pyplot as plt

# --- 字体配置（第四节已讲解）---
plt.rcParams['font.sans-serif'] = ['Microsoft YaHei', 'SimHei']
plt.rcParams['axes.unicode_minus'] = False

# ====== 以下为本节重点：饼图 ======

categories = ['Python', '前端', '数据库', '运维']
article_counts = [18, 24, 9, 7]

fig, ax = plt.subplots(figsize=(6, 6))  # 饼图通常用正方形画布
ax.pie(
    article_counts,              # 数据：每个分类的数量
    labels=categories,           # 每个扇区的标签
    autopct='%1.1f%%',          # 自动显示百分比，保留1位小数
    startangle=90               # 起始角度从12点钟方向开始
)
ax.set_title('文章分类占比')

fig.tight_layout()
plt.show()
```

> **💡 代码解读**
>
> `ax.pie()` 的参数：
>
> | 参数 | 作用 |
> | --- | --- |
> | 第一个参数 | 每个扇区的大小（数量列表） |
> | `labels` | 每个扇区的名称 |
> | `autopct` | 自动计算并显示百分比，`'%1.1f%%'` 表示保留 1 位小数 |
> | `startangle` | 起始角度，`90` 表示从正上方开始画 |

饼图不要滥用。

比较建议：

| 场景 | 推荐 |
| --- | --- |
| 3 到 5 个分类，看大概占比 | 可以用饼图 |
| 分类很多 | 用柱状图更清楚 |
| 需要精确比较大小 | 用柱状图更清楚 |
| 占比差异很小 | 用柱状图更清楚 |

企业报表里，饼图常见，但很多时候柱状图更容易读。

## 十三、箱线图：看异常值

箱线图入门时不一定马上用，但企业数据检查里很常见。

它适合看：

- 数据是否有异常大值。
- 不同分类的数据分布差异。
- 中位数和波动范围。

示例：

```python
import matplotlib.pyplot as plt

# --- 字体配置（第四节已讲解）---
plt.rcParams['font.sans-serif'] = ['Microsoft YaHei', 'SimHei']
plt.rcParams['axes.unicode_minus'] = False

# ====== 以下为本节重点：箱线图 ======

python_views = [120, 150, 180, 220, 260, 300, 1200]  # Python 分类浏览量，注意最后一个 1200 特别大
web_views = [90, 110, 160, 200, 240, 260, 310]        # 前端分类浏览量

fig, ax = plt.subplots(figsize=(7, 4))
ax.boxplot(
    [python_views, web_views],                    # 传入两组数据
    tick_labels=['Python', '前端']                 # 每组数据的标签
)

ax.set_title('不同分类浏览量分布')
ax.set_ylabel('浏览量')
ax.grid(True, axis='y', linestyle='--', alpha=0.4)

fig.tight_layout()
plt.show()
```

> **💡 代码解读**
>
> 箱线图的结构：
>
> ```text
>           ┌───┐
>     ──────┤   ├──────       ← 箱体上边 = 上四分位数（75% 的数据在此以下）
>     ──────┤ ─ ├──────       ← 中间线 = 中位数
>     ──────┤   ├──────       ← 箱体下边 = 下四分位数（25% 的数据在此以下）
>           └───┘
>     ·                      ← 圆点 = 异常值（离群点）
> ```
>
> 这里 Python 分类里有一个 `1200`，它可能是爆款文章，也可能是异常数据。
>
> 箱线图不会告诉你原因，但能提醒你：
>
> > 这里有一个特别不一样的数据，值得检查。

## 十四、设置标题、坐标轴和图例

一张正式图表至少应该让读者知道三件事：

1. 这张图在讲什么。
2. 横轴是什么。
3. 纵轴是什么。

常用方法：

```python
import matplotlib.pyplot as plt

# --- 字体配置（第四节已讲解）---
plt.rcParams['font.sans-serif'] = ['Microsoft YaHei', 'SimHei']
plt.rcParams['axes.unicode_minus'] = False

# ====== 以下为本节重点：标题、坐标轴、图例 ======

dates = ['07-01', '07-02', '07-03']
views = [120, 180, 160]

fig, ax = plt.subplots(figsize=(7, 4))
ax.plot(dates, views, marker='o', label='浏览量')  # label 是图例的文字

ax.set_title('每日文章浏览量')   # 图表标题
ax.set_xlabel('日期')           # 横轴标题
ax.set_ylabel('浏览量')         # 纵轴标题
ax.legend()                     # 显示图例（没有这行，label 不会显示）

fig.tight_layout()
plt.show()
```

对应关系：

| 方法 | 作用 | 必须写吗 |
| --- | --- | --- |
| `ax.set_title()` | 设置图表标题 | 强烈建议 |
| `ax.set_xlabel()` | 设置横轴标题 | 强烈建议 |
| `ax.set_ylabel()` | 设置纵轴标题 | 强烈建议 |
| `ax.legend()` | 显示图例 | 有多条线/多组数据时必须写 |

如果只有一组柱状图，图例不一定必须要。

如果有多条线、多组散点、多组柱子，图例就很重要。

## 十五、设置刻度、范围和网格

### 1. 设置坐标轴范围

```python
import matplotlib.pyplot as plt

# --- 字体配置（第四节已讲解）---
plt.rcParams['font.sans-serif'] = ['Microsoft YaHei', 'SimHei']
plt.rcParams['axes.unicode_minus'] = False

# ====== 以下为本节重点：设置纵轴范围 ======

days = ['周一', '周二', '周三', '周四', '周五']
views = [120, 180, 160, 220, 300]

fig, ax = plt.subplots(figsize=(8, 4))
ax.plot(days, views, marker='o')

ax.set_title('浏览量趋势')
ax.set_ylim(0, 350)  # 纵轴从 0 到 350（让图表从零开始，避免视觉误导）
ax.grid(True, linestyle='--', alpha=0.4)

fig.tight_layout()
plt.show()
```

`set_ylim(0, 350)` 表示纵轴从 0 到 350。

> **💡 小知识**：柱状图和折线图的纵轴通常从 0 开始，否则会放大差异、造成视觉误导。

### 2. 旋转横轴文字

```python
import matplotlib.pyplot as plt

# --- 字体配置（第四节已讲解）---
plt.rcParams['font.sans-serif'] = ['Microsoft YaHei', 'SimHei']
plt.rcParams['axes.unicode_minus'] = False

# ====== 以下为本节重点：旋转横轴文字 ======

categories = ['Python 爬虫', 'Vue 前端项目', 'MongoDB 数据库', 'Linux 部署']
counts = [18, 24, 9, 7]

fig, ax = plt.subplots(figsize=(9, 4))
ax.bar(categories, counts)

ax.set_title('文章分类数量')
ax.tick_params(axis='x', rotation=25)  # 横轴文字旋转25度

fig.tight_layout()
plt.show()
```

### 3. 网格不要太重

```python
import matplotlib.pyplot as plt

# --- 字体配置（第四节已讲解）---
plt.rcParams['font.sans-serif'] = ['Microsoft YaHei', 'SimHei']
plt.rcParams['axes.unicode_minus'] = False

# ====== 以下为本节重点：调整网格样式 ======

dates = ['07-01', '07-02', '07-03', '07-04']
views = [100, 140, 190, 260]

fig, ax = plt.subplots(figsize=(7, 4))
ax.plot(dates, views, marker='o')

ax.set_title('浏览量趋势')
ax.grid(True, linestyle='--', alpha=0.35)  # alpha 越低网格越淡

fig.tight_layout()
plt.show()
```

网格是为了辅助阅读，不是为了抢走注意力。

## 十六、设置颜色和样式

可以直接指定颜色：

```python
import matplotlib.pyplot as plt

# --- 字体配置（第四节已讲解）---
plt.rcParams['font.sans-serif'] = ['Microsoft YaHei', 'SimHei']
plt.rcParams['axes.unicode_minus'] = False

# ====== 以下为本节重点：自定义颜色 ======

categories = ['Python', '前端', '数据库', '运维']
counts = [18, 24, 9, 7]
colors = ['#4f81bd', '#9bbb59', '#f79646', '#8064a2']  # 十六进制颜色码，每根柱子一个颜色

fig, ax = plt.subplots(figsize=(8, 4))
bars = ax.bar(categories, counts, color=colors)  # color 参数接受颜色列表

ax.set_title('各分类文章数量')
ax.bar_label(bars, padding=3)

fig.tight_layout()
plt.show()
```

也可以使用内置样式：

```python
import matplotlib.pyplot as plt

plt.style.use('ggplot')  # 使用 ggplot 样式（类似 R 语言 ggplot2 风格）

# --- 字体配置（第四节已讲解）---
plt.rcParams['font.sans-serif'] = ['Microsoft YaHei', 'SimHei']
plt.rcParams['axes.unicode_minus'] = False

# ====== 以下为本节重点：使用内置样式 ======

dates = ['07-01', '07-02', '07-03', '07-04']
views = [100, 140, 190, 260]

fig, ax = plt.subplots(figsize=(7, 4))
ax.plot(dates, views, marker='o')
ax.set_title('浏览量趋势')

fig.tight_layout()
plt.show()
```

查看可用样式：

```python
import matplotlib.pyplot as plt

print(plt.style.available)  # 打印所有内置样式名称
```

企业项目里更建议：

- 固定一套颜色。
- 固定图片尺寸。
- 固定字体。
- 固定导出格式。
- 不要每张图随意换风格。

这样报告看起来才统一。

## 十七、添加文本标注

有时你想标出最高点。

示例：

```python
import matplotlib.pyplot as plt

# --- 字体配置（第四节已讲解）---
plt.rcParams['font.sans-serif'] = ['Microsoft YaHei', 'SimHei']
plt.rcParams['axes.unicode_minus'] = False

# ====== 以下为本节重点：标注最高点 ======

dates = ['07-01', '07-02', '07-03', '07-04', '07-05']
views = [120, 180, 160, 220, 300]

# 找到最高点的值和位置
max_views = max(views)              # 最大浏览量
max_index = views.index(max_views)  # 最大值在列表中的位置（索引）

fig, ax = plt.subplots(figsize=(8, 4))
ax.plot(dates, views, marker='o')

# 添加箭头标注
ax.annotate(
    f'最高：{max_views}',                          # 标注文字
    xy=(dates[max_index], max_views),              # 箭头指向的坐标（数据点位置）
    xytext=(dates[max_index], max_views + 30),     # 文字摆放的坐标（往上偏移30）
    arrowprops={'arrowstyle': '->'}                # 箭头样式：实心箭头
)

ax.set_title('每日文章浏览量趋势')
ax.set_xlabel('日期')
ax.set_ylabel('浏览量')
ax.grid(True, linestyle='--', alpha=0.4)

fig.tight_layout()
plt.show()
```

> **💡 代码解读**
>
> `ax.annotate()` 的参数：
>
> | 参数 | 作用 |
> | --- | --- |
> | 第一个参数 | 标注的文字内容 |
> | `xy` | 箭头指向的位置（数据点本身） |
> | `xytext` | 文字摆放的位置（通常偏离数据点一点） |
> | `arrowprops` | 箭头样式配置 |

`annotate()` 常用于：

- 标记最高值。
- 标记最低值。
- 标记异常值。
- 标记关键事件。

不要给每个点都加大段文字，图会变得很乱。

## 十八、保存图片：savefig

项目里经常不是弹窗看图，而是保存图片。

示例：

```python
from pathlib import Path  # Python 内置路径处理模块

import matplotlib.pyplot as plt

# --- 字体配置（第四节已讲解）---
plt.rcParams['font.sans-serif'] = ['Microsoft YaHei', 'SimHei']
plt.rcParams['axes.unicode_minus'] = False

# ====== 以下为本节重点：保存图片到文件 ======

output_dir = Path('charts')       # 准备输出目录
output_dir.mkdir(exist_ok=True)   # 如果目录不存在就创建（exist_ok=True 表示已存在不报错）

dates = ['07-01', '07-02', '07-03', '07-04']
views = [100, 140, 190, 260]

fig, ax = plt.subplots(figsize=(7, 4))
ax.plot(dates, views, marker='o')
ax.set_title('浏览量趋势')
ax.set_xlabel('日期')
ax.set_ylabel('浏览量')
ax.grid(True, linestyle='--', alpha=0.4)

fig.tight_layout()
fig.savefig(output_dir / 'views_trend.png', dpi=150, bbox_inches='tight')  # 保存图片
plt.close(fig)  # 关闭画布，释放内存
```

运行后会生成：

```text
charts/views_trend.png
```

> **💡 代码解读**
>
> `fig.savefig()` 的参数：
>
> | 参数 | 作用 |
> | --- | --- |
> | 第一个参数 | 保存路径，支持 `.png`、`.jpg`、`.svg`、`.pdf` |
> | `dpi` | 图片清晰度，150 适合屏幕查看，300 适合打印 |
> | `bbox_inches='tight'` | 尽量裁掉多余空白 |
>
> | 其他方法 | 作用 |
> | --- | --- |
> | `fig.tight_layout()` | 自动调整布局，减少文字重叠 |
> | `plt.close(fig)` | 关闭画布，释放内存 |

企业脚本里，批量生成很多图片时一定要 `plt.close(fig)`。

否则可能出现：

```text
More than 20 figures have been opened
```

## 十九、子图：一张图片放多个图

有时你想把多个指标放在同一张图片里。

示例：

```python
import matplotlib.pyplot as plt

# --- 字体配置（第四节已讲解）---
plt.rcParams['font.sans-serif'] = ['Microsoft YaHei', 'SimHei']
plt.rcParams['axes.unicode_minus'] = False

# ====== 以下为本节重点：一行两列子图 ======

dates = ['07-01', '07-02', '07-03', '07-04', '07-05']
views = [120, 180, 160, 220, 300]
comments = [3, 5, 4, 8, 12]

fig, axes = plt.subplots(1, 2, figsize=(10, 4))  # 1行2列，返回 axes 数组

# 左图：浏览量折线图
axes[0].plot(dates, views, marker='o')       # axes[0] 是左边第1个子图
axes[0].set_title('浏览量趋势')
axes[0].set_xlabel('日期')
axes[0].set_ylabel('浏览量')
axes[0].grid(True, linestyle='--', alpha=0.4)

# 右图：评论数柱状图
axes[1].bar(dates, comments)                  # axes[1] 是右边第2个子图
axes[1].set_title('评论数变化')
axes[1].set_xlabel('日期')
axes[1].set_ylabel('评论数')

fig.suptitle('文章数据概览')  # 整张图片的总标题
fig.tight_layout()
plt.show()
```

> **💡 代码解读**
>
> `plt.subplots(1, 2)` 表示：
>
> - 第一个参数 `1`：行数。
> - 第二个参数 `2`：列数。
> - 一共 2 个子图。
> - 返回的 `axes` 是一个数组，用 `axes[0]`、`axes[1]` 访问。

如果是 2 行 2 列：

```python
import matplotlib.pyplot as plt

# --- 字体配置（第四节已讲解）---
plt.rcParams['font.sans-serif'] = ['Microsoft YaHei', 'SimHei']
plt.rcParams['axes.unicode_minus'] = False

# ====== 以下为本节重点：两行两列子图 ======

categories = ['Python', '前端', '数据库', '运维']
counts = [18, 24, 9, 7]
views = [3200, 4100, 1200, 900]

fig, axes = plt.subplots(2, 2, figsize=(10, 8))  # 2行2列，返回二维数组

axes[0, 0].bar(categories, counts)              # [0,0] = 第1行第1列
axes[0, 0].set_title('文章数量')

axes[0, 1].bar(categories, views)               # [0,1] = 第1行第2列
axes[0, 1].set_title('总浏览量')

axes[1, 0].pie(counts, labels=categories, autopct='%1.1f%%')  # [1,0] = 第2行第1列
axes[1, 0].set_title('文章数量占比')

axes[1, 1].scatter(counts, views)               # [1,1] = 第2行第2列
axes[1, 1].set_title('文章数量与浏览量')
axes[1, 1].set_xlabel('文章数量')
axes[1, 1].set_ylabel('总浏览量')

fig.tight_layout()
plt.show()
```

注意：

- `axes[0, 0]` 是第 1 行第 1 列。
- `axes[0, 1]` 是第 1 行第 2 列。
- `axes[1, 0]` 是第 2 行第 1 列。
- `axes[1, 1]` 是第 2 行第 2 列。

## 二十、和 pandas 一起使用

前一篇我们用 pandas 做过统计。

现在可以直接把 pandas 结果交给 matplotlib。

示例数据：

```python
import pandas as pd

df = pd.DataFrame([
    {'category': 'Python', 'article_count': 18, 'total_views': 3200},
    {'category': '前端', 'article_count': 24, 'total_views': 4100},
    {'category': '数据库', 'article_count': 9, 'total_views': 1200},
    {'category': '运维', 'article_count': 7, 'total_views': 900}
])

print(df)
```

用 matplotlib 画柱状图：

```python
import matplotlib.pyplot as plt
import pandas as pd

# --- 字体配置（第四节已讲解）---
plt.rcParams['font.sans-serif'] = ['Microsoft YaHei', 'SimHei']
plt.rcParams['axes.unicode_minus'] = False

# ====== 以下为本节重点：用 DataFrame 列画图 ======

df = pd.DataFrame([
    {'category': 'Python', 'article_count': 18, 'total_views': 3200},
    {'category': '前端', 'article_count': 24, 'total_views': 4100},
    {'category': '数据库', 'article_count': 9, 'total_views': 1200},
    {'category': '运维', 'article_count': 7, 'total_views': 900}
])

fig, ax = plt.subplots(figsize=(8, 4))
# 直接把 DataFrame 的列传给 ax.bar()，和传列表的用法一样
bars = ax.bar(df['category'], df['total_views'])

ax.set_title('各分类总浏览量')
ax.set_xlabel('分类')
ax.set_ylabel('总浏览量')
ax.bar_label(bars, padding=3)

fig.tight_layout()
plt.show()
```

pandas 自己也有快捷画图方法：

```python
import matplotlib.pyplot as plt
import pandas as pd

# --- 字体配置（第四节已讲解）---
plt.rcParams['font.sans-serif'] = ['Microsoft YaHei', 'SimHei']
plt.rcParams['axes.unicode_minus'] = False

# ====== 以下为本节重点：pandas 快捷画图 ======

df = pd.DataFrame([
    {'category': 'Python', 'article_count': 18, 'total_views': 3200},
    {'category': '前端', 'article_count': 24, 'total_views': 4100},
    {'category': '数据库', 'article_count': 9, 'total_views': 1200},
    {'category': '运维', 'article_count': 7, 'total_views': 900}
])

# df.plot() 会自动创建 fig 和 ax，一行搞定
ax = df.plot(x='category', y='total_views', kind='bar', legend=False)
ax.set_title('各分类总浏览量')
ax.set_xlabel('分类')
ax.set_ylabel('总浏览量')

plt.tight_layout()
plt.show()
```

你可以这样理解：

| 写法 | 特点 |
| --- | --- |
| `ax.bar(df['category'], df['total_views'])` | matplotlib 原生写法，更灵活 |
| `df.plot(x='category', y='total_views', kind='bar')` | pandas 快捷写法，更适合快速分析 |

企业报表里，如果要统一样式和细节，通常会用 matplotlib 原生写法。

## 二十一、完整本地项目 demo：把文章统计结果画成图

这一节做一个完整 demo。

目标：

1. 准备一份文章分类统计数据。
2. 画各分类总浏览量柱状图。
3. 画各分类文章数量占比图。
4. 画每日浏览量趋势图。
5. 保存图片到 `charts` 目录。

新建文件：

```text
article_charts_demo.py
```

写入：

```python
from pathlib import Path  # 处理文件路径

import matplotlib.pyplot as plt
import pandas as pd


def configure_matplotlib():
    """配置中文字体，每个脚本只需调用一次。"""
    plt.rcParams['font.sans-serif'] = ['Microsoft YaHei', 'SimHei']
    plt.rcParams['axes.unicode_minus'] = False


def build_category_summary():
    """准备分类汇总数据（实际项目里改成读取 CSV 即可）。"""
    return pd.DataFrame([
        {'category': 'Python', 'article_count': 18, 'total_views': 3200},
        {'category': '前端', 'article_count': 24, 'total_views': 4100},
        {'category': '数据库', 'article_count': 9, 'total_views': 1200},
        {'category': '运维', 'article_count': 7, 'total_views': 900}
    ])


def build_daily_trend():
    """准备每日趋势数据。"""
    return pd.DataFrame([
        {'date': '07-01', 'views': 520},
        {'date': '07-02', 'views': 680},
        {'date': '07-03', 'views': 610},
        {'date': '07-04', 'views': 760},
        {'date': '07-05', 'views': 930}
    ])


def draw_category_views(summary_df, output_dir):
    """画各分类总浏览量柱状图，并保存到 output_dir。"""
    sorted_df = summary_df.sort_values('total_views', ascending=False)  # 按浏览量降序排列

    fig, ax = plt.subplots(figsize=(8, 4.5))
    bars = ax.bar(sorted_df['category'], sorted_df['total_views'], color='#4f81bd')

    ax.set_title('各分类文章总浏览量')
    ax.set_xlabel('分类')
    ax.set_ylabel('总浏览量')
    ax.bar_label(bars, padding=3)
    ax.grid(True, axis='y', linestyle='--', alpha=0.35)

    fig.tight_layout()
    fig.savefig(output_dir / 'category_views_bar.png', dpi=150, bbox_inches='tight')
    plt.close(fig)  # 保存后关闭，释放内存


def draw_category_share(summary_df, output_dir):
    """画各分类文章数量占比饼图，并保存到 output_dir。"""
    fig, ax = plt.subplots(figsize=(6, 6))
    ax.pie(
        summary_df['article_count'],
        labels=summary_df['category'],
        autopct='%1.1f%%',
        startangle=90
    )
    ax.set_title('各分类文章数量占比')

    fig.tight_layout()
    fig.savefig(output_dir / 'category_article_share.png', dpi=150, bbox_inches='tight')
    plt.close(fig)


def draw_daily_trend(trend_df, output_dir):
    """画每日浏览量趋势折线图，并保存到 output_dir。"""
    fig, ax = plt.subplots(figsize=(8, 4.5))
    ax.plot(trend_df['date'], trend_df['views'], marker='o', linewidth=2, color='#9bbb59')

    ax.set_title('每日文章浏览量趋势')
    ax.set_xlabel('日期')
    ax.set_ylabel('浏览量')
    ax.grid(True, linestyle='--', alpha=0.35)

    fig.tight_layout()
    fig.savefig(output_dir / 'daily_views_trend.png', dpi=150, bbox_inches='tight')
    plt.close(fig)


def main():
    """主函数：配置环境 -> 准备数据 -> 逐张画图 -> 打印结果。"""
    configure_matplotlib()  # 第1步：配置字体

    output_dir = Path('charts')       # 第2步：准备输出目录
    output_dir.mkdir(exist_ok=True)

    summary_df = build_category_summary()  # 第3步：准备数据
    trend_df = build_daily_trend()

    draw_category_views(summary_df, output_dir)   # 第4步：画3张图
    draw_category_share(summary_df, output_dir)
    draw_daily_trend(trend_df, output_dir)

    print(f'图表已保存到：{output_dir.resolve()}')  # 第5步：打印结果


if __name__ == '__main__':
    main()
```

运行：

```powershell
python article_charts_demo.py
```

会生成：

```text
charts/category_views_bar.png
charts/category_article_share.png
charts/daily_views_trend.png
```

> **💡 代码解读**
>
> 这份 demo 的结构接近企业脚本：
>
> | 函数 | 职责 | 为什么要分开 |
> | --- | --- | --- |
> | `configure_matplotlib()` | 只管字体配置 | 改字体只改一处 |
> | `build_category_summary()` | 只管准备数据 | 换成读 CSV 只改这里 |
> | `draw_category_views()` | 只管画一张图 | 改样式不影响其他图 |
> | `main()` | 只管编排流程 | 调整顺序很方便 |
>
> 后面你换成真实 CSV 时，只需要把 `build_category_summary()` 改成读取 CSV。

## 二十二、读取 pandas 统计 CSV 再画图

如果前一篇已经导出了：

```text
article_summary.csv
```

格式类似：

```csv
category,article_count,total_views,avg_views
Python,18,3200,177.78
前端,24,4100,170.83
数据库,9,1200,133.33
运维,7,900,128.57
```

可以这样读取并画图：

```python
from pathlib import Path

import matplotlib.pyplot as plt
import pandas as pd

# --- 字体配置（第四节已讲解）---
plt.rcParams['font.sans-serif'] = ['Microsoft YaHei', 'SimHei']
plt.rcParams['axes.unicode_minus'] = False

# ====== 以下为本节重点：读取 CSV 并画图 ======

output_dir = Path('charts')
output_dir.mkdir(exist_ok=True)

df = pd.read_csv('article_summary.csv')                              # 读取 CSV
df['total_views'] = pd.to_numeric(df['total_views'], errors='coerce').fillna(0)  # 确保是数字
df = df.sort_values('total_views', ascending=False)                  # 按浏览量降序排列

fig, ax = plt.subplots(figsize=(8, 4.5))
bars = ax.bar(df['category'], df['total_views'])

ax.set_title('各分类总浏览量')
ax.set_xlabel('分类')
ax.set_ylabel('总浏览量')
ax.bar_label(bars, padding=3)
ax.grid(True, axis='y', linestyle='--', alpha=0.35)

fig.tight_layout()
fig.savefig(output_dir / 'article_summary_views.png', dpi=150, bbox_inches='tight')
plt.close(fig)
```

> **💡 代码解读**
>
> 这里有两个工程化细节：
>
> 1. `pd.to_numeric(df['total_views'], errors='coerce')`：把列转成数字，遇到无法转换的值（比如空字符串、文字）会变成 `NaN`。
> 2. `.fillna(0)`：把 `NaN` 填充为 0，避免画图时报错。
>
> 不要直接相信 CSV 里的字段类型。爬虫数据、导入数据、人工编辑过的表格都可能混入空值或字符串。

## 二十三、时间字段画趋势图

如果 CSV 中有日期字段，先转成日期类型更稳。

示例：

```python
import matplotlib.pyplot as plt
import pandas as pd

# --- 字体配置（第四节已讲解）---
plt.rcParams['font.sans-serif'] = ['Microsoft YaHei', 'SimHei']
plt.rcParams['axes.unicode_minus'] = False

# ====== 以下为本节重点：日期类型转换 ======

df = pd.DataFrame([
    {'date': '2026-07-01', 'views': 520},
    {'date': '2026-07-02', 'views': 680},
    {'date': '2026-07-03', 'views': 610},
    {'date': '2026-07-04', 'views': 760},
    {'date': '2026-07-05', 'views': 930}
])

df['date'] = pd.to_datetime(df['date'])  # 把字符串日期转成 datetime 类型

fig, ax = plt.subplots(figsize=(8, 4.5))
ax.plot(df['date'], df['views'], marker='o')

ax.set_title('每日浏览量趋势')
ax.set_xlabel('日期')
ax.set_ylabel('浏览量')
ax.grid(True, linestyle='--', alpha=0.35)

fig.autofmt_xdate()  # 自动旋转日期标签，减少重叠
fig.tight_layout()
plt.show()
```

`fig.autofmt_xdate()` 会自动调整日期标签的角度，减少重叠。

## 二十四、批量生成图表

企业里经常不是画一张图，而是按分类批量生成。

示例：

```python
from pathlib import Path

import matplotlib.pyplot as plt
import pandas as pd

# --- 字体配置（第四节已讲解）---
plt.rcParams['font.sans-serif'] = ['Microsoft YaHei', 'SimHei']
plt.rcParams['axes.unicode_minus'] = False

# ====== 以下为本节重点：按分类批量画图 ======

output_dir = Path('charts/by_category')
output_dir.mkdir(parents=True, exist_ok=True)  # parents=True 表示连父目录一起创建

df = pd.DataFrame([
    {'category': 'Python', 'date': '07-01', 'views': 120},
    {'category': 'Python', 'date': '07-02', 'views': 180},
    {'category': 'Python', 'date': '07-03', 'views': 220},
    {'category': '前端', 'date': '07-01', 'views': 90},
    {'category': '前端', 'date': '07-02', 'views': 140},
    {'category': '前端', 'date': '07-03', 'views': 210}
])

# groupby 会把数据按 category 分组，每次循环拿到一个分类名和对应的数据
for category, group_df in df.groupby('category'):
    fig, ax = plt.subplots(figsize=(7, 4))
    ax.plot(group_df['date'], group_df['views'], marker='o')
    ax.set_title(f'{category} 浏览量趋势')
    ax.set_xlabel('日期')
    ax.set_ylabel('浏览量')
    ax.grid(True, linestyle='--', alpha=0.35)

    # 文件名不能包含 / 或 \，否则会被当成路径分隔符
    safe_name = category.replace('/', '_').replace('\\', '_')
    fig.tight_layout()
    fig.savefig(output_dir / f'{safe_name}_views.png', dpi=150, bbox_inches='tight')
    plt.close(fig)  # 每张图保存后必须关闭
```

> **💡 代码解读**
>
> 重点理解 `groupby` 循环：
>
> ```python
> for category, group_df in df.groupby('category'):
> ```
>
> - `category`：当前分类名称（如 `'Python'`、`'前端'`）。
> - `group_df`：该分类对应的数据（只有该分类的行）。
> - 每次循环创建一张图、保存一张图、关闭一张图。

## 二十五、服务器脚本不要依赖弹窗

在服务器、定时任务、CI 环境里，通常没有图形界面。

这种场景不要依赖：

```python
import matplotlib.pyplot as plt

plt.plot([1, 2, 3], [10, 20, 15])
plt.show()  # 服务器上没有图形界面，这行会卡住或报错
```

更推荐保存图片：

```python
import matplotlib

matplotlib.use('Agg')  # 必须写在 import pyplot 之前！告诉 matplotlib 不依赖图形界面

import matplotlib.pyplot as plt

fig, ax = plt.subplots()
ax.plot([1, 2, 3], [10, 20, 15])
ax.set_title('服务器生成图片')

fig.savefig('server_chart.png', dpi=150, bbox_inches='tight')
plt.close(fig)
```

> **💡 代码解读**
>
> | 代码 | 作用 |
> | --- | --- |
> | `matplotlib.use('Agg')` | 切换到 Agg 后端，不依赖图形界面就能生成图片 |
> | 位置要求 | **必须写在 `import matplotlib.pyplot as plt` 之前** |
>
> `Agg` 可以理解成不依赖弹窗的图片输出后端。
>
> 很多企业自动化报表、定时任务和 Docker 环境都会用这种方式。

## 二十六、企业开发中的绘图规范

真实项目里，matplotlib 不只是"能画出来"。

还要考虑：

- 图表是不是表达了正确问题。
- 数据是不是已经清洗和校验。
- 颜色、字体、尺寸是否统一。
- 图片是否能在服务器稳定生成。
- 批量生成时是否释放内存。
- 文件名是否稳定。
- 图表和原始数据是否能追溯。

### 1. 先明确图表要回答什么问题

不要为了画图而画图。

先问：

| 问题 | 更适合的图 |
| --- | --- |
| 最近 7 天浏览量怎么变化 | 折线图 |
| 哪个分类文章最多 | 柱状图 |
| 各分类占比大概怎样 | 饼图或柱状图 |
| 阅读量集中在哪些区间 | 直方图 |
| 字数和浏览量是否有关 | 散点图 |
| 哪些数据可能异常 | 箱线图 |

图表类型选错，数据越多越容易误导。

### 2. 数据处理和画图函数分开

不推荐把读取、清洗、统计、画图全部挤在一个大函数里。

推荐结构：

```python
import matplotlib.pyplot as plt
import pandas as pd


def load_data():
    """只管读取数据。"""
    return pd.read_csv('articles.csv')


def build_summary(df):
    """只管统计汇总。"""
    return df.groupby('category').agg({
        'title': 'count',
        'views': 'sum'
    }).rename(columns={
        'title': 'article_count',
        'views': 'total_views'
    }).reset_index()


def draw_summary_chart(summary_df):
    """只管画图，返回 fig 对象。"""
    fig, ax = plt.subplots(figsize=(8, 4))
    ax.bar(summary_df['category'], summary_df['total_views'])
    ax.set_title('各分类总浏览量')
    return fig
```

这样后面要改统计规则或改图表样式时，不会互相影响。

### 3. 统一图表配置

企业项目里可以集中维护：

```python
import matplotlib.pyplot as plt


# --- 全局配置常量，所有图表共用 ---
CHART_DPI = 150                                    # 导出清晰度
CHART_SIZE = (8, 4.5)                               # 默认图片尺寸
CHART_COLORS = ['#4f81bd', '#9bbb59', '#f79646', '#8064a2']  # 默认配色


def configure_chart_style():
    """配置字体和全局样式，脚本启动时调用一次。"""
    plt.rcParams['font.sans-serif'] = ['Microsoft YaHei', 'SimHei']
    plt.rcParams['axes.unicode_minus'] = False
```

好处：

- 图片尺寸统一。
- 字体统一。
- 导出清晰度统一。
- 后续改风格只改一处。

### 4. 保留图表对应的数据

只保存图片是不够的。

最好同时保存：

- 原始明细数据。
- 清洗后的数据。
- 统计汇总 CSV。
- 生成的图片。

例如：

```text
reports/
├── clean_articles.csv
├── article_summary.csv
└── charts/
    ├── category_views_bar.png
    └── daily_views_trend.png
```

这样别人看到图表异常时，可以追溯到数据来源。

### 5. 批量生成要关闭 Figure

如果循环生成图片：

```python
import matplotlib.pyplot as plt

for index in range(3):
    fig, ax = plt.subplots()
    ax.plot([1, 2, 3], [index, index + 1, index + 2])
    fig.savefig(f'chart_{index}.png')
    plt.close(fig)  # 不要漏掉这行！
```

不要漏掉 `plt.close(fig)`。

### 6. 大数据先聚合再画图

不要一上来把几十万行原始数据全部画成散点。

更常见流程是：

```text
原始数据 -> 清洗 -> 分组统计 -> 画汇总图
```

比如：

```python
import pandas as pd

df = pd.DataFrame([
    {'category': 'Python', 'views': 120},
    {'category': 'Python', 'views': 180},
    {'category': '前端', 'views': 210}
])

# 先按分类汇总，再画图
summary = df.groupby('category')['views'].sum().reset_index()
print(summary)
```

先把数据汇总好，再交给 matplotlib。

### 7. 不要在图里放太多信息

一张图最好回答一个主要问题。

常见错误：

- 一张图放十几条折线。
- 横轴标签密密麻麻。
- 颜色太多且没有规律。
- 标题、坐标轴、图例缺失。
- 数据标签到处重叠。

图表不是越满越专业。

清楚比花哨重要。

## 二十七、常见错误和排查

### 1. ModuleNotFoundError: No module named 'matplotlib'

说明还没有安装。

执行：

```powershell
python -m pip install matplotlib
```

如果你有多个 Python 环境，确认运行脚本和安装包用的是同一个 Python。

### 2. 中文显示成方块

加字体配置：

```python
import matplotlib.pyplot as plt

plt.rcParams['font.sans-serif'] = ['Microsoft YaHei', 'SimHei']  # 指定中文字体
plt.rcParams['axes.unicode_minus'] = False                       # 解决负号方块
```

如果还是不行，说明系统没有对应字体，需要换成已有中文字体。

### 3. 负号显示成方块

加：

```python
plt.rcParams['axes.unicode_minus'] = False  # 让负号正常显示
```

### 4. 图片保存后文字被裁掉

使用：

```python
fig.tight_layout()                                    # 自动调整布局
fig.savefig('chart.png', dpi=150, bbox_inches='tight')  # 裁掉多余空白
```

`tight_layout()` 和 `bbox_inches='tight'` 经常一起用。

### 5. 横轴文字重叠

可以旋转：

```python
ax.tick_params(axis='x', rotation=30)  # 横轴文字旋转30度
```

或者改用横向柱状图：

```python
ax.barh(['很长的分类名称'], [10])  # 横向柱状图，分类名在纵轴
```

### 6. x 和 y 长度不一致

错误示例：

```python
import matplotlib.pyplot as plt

x = ['周一', '周二', '周三']  # 3 个
y = [100, 120]               # 只有 2 个

plt.plot(x, y)  # 报错：x 和 y 长度不一致
plt.show()
```

`x` 有 3 个，`y` 只有 2 个，会报错。

改成长度一致：

```python
import matplotlib.pyplot as plt

x = ['周一', '周二', '周三']
y = [100, 120, 150]  # 改成 3 个

plt.plot(x, y)  # 正常运行
plt.show()
```

### 7. 数字列其实是字符串

从 CSV 读出来的数据可能是字符串。

画图前可以转换：

```python
import pandas as pd

df = pd.DataFrame({'views': ['100', '200', 'bad']})
# errors='coerce'：无法转换的变成 NaN；fillna(0)：NaN 变成 0
df['views'] = pd.to_numeric(df['views'], errors='coerce').fillna(0)

print(df)
```

### 8. 批量画图后内存越来越高

保存后关闭：

```python
plt.close(fig)  # 每张图保存后关闭，释放内存
```

循环出图时尤其重要。

### 9. `axes[0]` 和 `axes[0, 0]` 分不清

如果是：

```python
import matplotlib.pyplot as plt

fig, axes = plt.subplots(1, 2)   # 1行2列
print(type(axes[0]))             # axes 是一维数组，用 axes[0]、axes[1] 访问
```

一行两列时，`axes` 是一维数组。

如果是：

```python
import matplotlib.pyplot as plt

fig, axes = plt.subplots(2, 2)   # 2行2列
print(type(axes[0, 0]))          # axes 是二维数组，用 axes[0,0]、axes[0,1] 访问
```

两行两列时，`axes` 是二维数组。

如果想统一处理，可以压平：

```python
import matplotlib.pyplot as plt

fig, axes = plt.subplots(2, 2)

# ravel() 把二维数组压成一维，统一用 for 循环处理
for ax in axes.ravel():
    ax.set_title('子图')

plt.show()
```

## 二十八、小练习

### 练习 1：画浏览量折线图

要求：

- 横轴是 `['周一', '周二', '周三', '周四', '周五']`。
- 纵轴是 `[120, 180, 160, 220, 300]`。
- 设置标题、横轴标题、纵轴标题。
- 显示网格。

参考答案：

```python
import matplotlib.pyplot as plt

# --- 字体配置（第四节已讲解）---
plt.rcParams['font.sans-serif'] = ['Microsoft YaHei', 'SimHei']
plt.rcParams['axes.unicode_minus'] = False

# ====== 以下为练习答案 ======

days = ['周一', '周二', '周三', '周四', '周五']
views = [120, 180, 160, 220, 300]

fig, ax = plt.subplots(figsize=(8, 4))
ax.plot(days, views, marker='o')  # 画折线，圆点标记

ax.set_title('浏览量趋势')         # 标题
ax.set_xlabel('日期')             # 横轴标题
ax.set_ylabel('浏览量')           # 纵轴标题
ax.grid(True, linestyle='--', alpha=0.4)  # 虚线网格

fig.tight_layout()
plt.show()
```

### 练习 2：画分类柱状图

要求：

- 分类：`['Python', '前端', '数据库', '运维']`
- 数量：`[18, 24, 9, 7]`
- 显示柱子数值。

参考答案：

```python
import matplotlib.pyplot as plt

# --- 字体配置（第四节已讲解）---
plt.rcParams['font.sans-serif'] = ['Microsoft YaHei', 'SimHei']
plt.rcParams['axes.unicode_minus'] = False

# ====== 以下为练习答案 ======

categories = ['Python', '前端', '数据库', '运维']
counts = [18, 24, 9, 7]

fig, ax = plt.subplots(figsize=(8, 4))
bars = ax.bar(categories, counts)  # 画柱状图

ax.set_title('文章分类数量')
ax.set_xlabel('分类')
ax.set_ylabel('文章数量')
ax.bar_label(bars, padding=3)  # 在柱子上方显示数值

fig.tight_layout()
plt.show()
```

### 练习 3：读取 DataFrame 并保存图片

要求：

- 用 pandas 创建分类统计数据。
- 用 matplotlib 画总浏览量柱状图。
- 保存到 `charts/summary.png`。
- 保存后关闭图片。

参考答案：

```python
from pathlib import Path

import matplotlib.pyplot as plt
import pandas as pd

# --- 字体配置（第四节已讲解）---
plt.rcParams['font.sans-serif'] = ['Microsoft YaHei', 'SimHei']
plt.rcParams['axes.unicode_minus'] = False

# ====== 以下为练习答案 ======

output_dir = Path('charts')
output_dir.mkdir(exist_ok=True)  # 创建输出目录

df = pd.DataFrame([
    {'category': 'Python', 'total_views': 3200},
    {'category': '前端', 'total_views': 4100},
    {'category': '数据库', 'total_views': 1200},
    {'category': '运维', 'total_views': 900}
])

fig, ax = plt.subplots(figsize=(8, 4))
bars = ax.bar(df['category'], df['total_views'])

ax.set_title('各分类总浏览量')
ax.set_xlabel('分类')
ax.set_ylabel('总浏览量')
ax.bar_label(bars, padding=3)

fig.tight_layout()
fig.savefig(output_dir / 'summary.png', dpi=150, bbox_inches='tight')  # 保存图片
plt.close(fig)  # 关闭画布，释放内存
```

## 本篇小结

这一篇完成了 matplotlib 入门闭环：

- `matplotlib.pyplot` 通常导入为 `plt`。
- 简单图可以用 `plt.plot()`，项目里更推荐 `fig, ax = plt.subplots()`。
- `Figure` 是整张图片，`Axes` 是图片中的一个图表区域。
- 折线图 `plot()` 适合看趋势。
- 柱状图 `bar()`、`barh()` 适合看分类对比。
- 散点图 `scatter()` 适合看两个字段关系。
- 直方图 `hist()` 适合看数值分布。
- 饼图 `pie()` 可以看少量分类占比，但不要滥用。
- 箱线图 `boxplot()` 常用于检查异常值。
- `set_title()`、`set_xlabel()`、`set_ylabel()`、`legend()` 能让图表更容易读懂。
- 中文显示常用 `font.sans-serif` 配置。
- 保存图片用 `fig.savefig()`，批量出图后用 `plt.close(fig)`。
- pandas 统计结果可以直接交给 matplotlib 画图。
- 服务器脚本优先保存图片，不要依赖 `plt.show()` 弹窗。
- 企业项目里要把数据处理、统计、绘图和导出分开，保证图表可维护、可追溯。

到这里，你的数据流程就变成了：

```text
请求网页 -> 解析 HTML -> 正则清洗字段 -> 保存 CSV -> pandas 统计 CSV -> matplotlib 绘制图表
```

这已经是一个完整的"爬虫 + 清洗 + 统计 + 可视化"入门项目骨架。

参考资料：

- Matplotlib 官方文档：https://matplotlib.org/stable/
- Matplotlib pyplot 文档：https://matplotlib.org/stable/api/pyplot_summary.html
- Matplotlib 快速入门：https://matplotlib.org/stable/users/explain/quick_start.html
