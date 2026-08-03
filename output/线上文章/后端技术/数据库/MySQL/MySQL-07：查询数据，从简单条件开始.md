---
title: "MySQL 07：查询数据，从简单条件开始"
slug: "mysql-07-select-one-table"
summary: "把 SELECT 当成向登记册提问：从指定列、WHERE 条件、NULL、AND/OR、LIKE、排序、LIMIT、别名到 COUNT，逐段解释查询如何一步步得到结果。"
category: "MySQL"
categoryPath:
  - "后端技术"
  - "数据库"
  - "MySQL"
tags:
  - "MySQL"
  - "数据查询"
  - "SQL入门"
status: "published"
sortOrder: 70
cover: ""
originalId: "6a706a61360397398ac2d06b"
originalSlug: "mysql-07-select-one-table"
originalStatus: "published"
publishedAt: "2026-08-03T10:16:37.195Z"
updatedAt: "2026-08-03T10:16:37.225Z"
exportedAt: "2026-08-03T10:17:08.920Z"
---
# 07 查询数据，从简单条件开始

## 1. 本节目标：先把一张表问明白

第 06 章每次写操作前都要先 `SELECT`。这一章终于专门学习它：怎样从一张表中取出需要的行和列。

本章只使用 `learning_notes`，不连接其他表。这样你只需要在一张登记册中练习问问题：

- 有哪些笔记？
- 哪些是草稿？
- 标题里包含 MySQL 的有哪些？
- 最近创建的 5 条是哪几条？
- 正常笔记一共有多少条？

## 2. 查询前先准备几条不同的数据

为了看出筛选和排序的效果，表中至少应有几条状态、标题和浏览量不同的笔记。你可以查看自己的已有数据：

```sql
SELECT id, title, status, view_count, deleted_at, created_at
FROM learning_notes
ORDER BY id ASC;
```

如果第 06 章已经做完，应该能看到多行。请以你实际查询出来的数据为准，文中的 `id = 1`、`id = 3` 只是示例，不保证与你的电脑相同。

## 3. 一条 SELECT 怎样得到结果：先有路线图

下面是一条常见查询：

```sql
SELECT id, title, view_count
FROM learning_notes
WHERE status = 'active'
ORDER BY created_at DESC, id DESC
LIMIT 5;
```

它看起来从 `SELECT` 开始，理解时却适合按“数据经历的过程”阅读：

```mermaid
flowchart LR
  A[learning_notes 原始所有行] --> B[WHERE 留下 active]
  B --> C[SELECT 只保留指定列]
  C --> D[ORDER BY 排好顺序]
  D --> E[LIMIT 取前 5 条]
```

人话翻译：从所有学习笔记中找出正常状态的，显示编号、标题、浏览量，按创建时间从新到旧排列；如果时间相同，再按编号从大到小排列；最后只显示前 5 条。

后面每一节都会拆开其中一个积木。先记住，`SELECT` 不是“打开整张表”，而是你向数据库提出一个明确问题。

## 4. SELECT 和 FROM：从哪张表，取哪些列

### 4.1 第一次看全部列：`SELECT *`

```sql
SELECT *
FROM learning_notes;
```

| 片段 | 意思 |
| --- | --- |
| `SELECT` | 我要读取数据，不修改它 |
| `*` | 这张表的所有列 |
| `FROM` | 数据来自哪里 |
| `learning_notes` | 来源表名 |

调试、初学或临时查看数据时，`SELECT *` 很方便。但真实接口中通常不要长期依赖它：

- 一篇正文的 `content` 可能很大，列表页不一定需要拿回来。
- 表将来新增字段时，接口返回结果会悄悄变多。
- 读 SQL 的人看不出你真正依赖哪些字段。

### 4.2 指定列：让问题更清楚

```sql
SELECT id, title, status
FROM learning_notes;
```

这句只取三个栏目。英文逗号分隔多个字段，字段顺序就是结果中列的显示顺序。

练习：把 `status` 换成 `view_count` 再执行，观察结果列如何变化。你会发现查询数据不改变表，它只影响“这一次展示给你的结果”。

## 5. WHERE：用条件筛掉不需要的行

假设表中有下面几行：

| id | title | status | view_count | deleted_at |
| --- | --- | --- | --- | --- |
| 1 | 认识 MySQL | active | 8 | NULL |
| 2 | 学习 SELECT | active | 12 | NULL |
| 3 | 整理 JOIN 问题 | draft | 0 | NULL |
| 4 | 临时笔记 | active | 1 | 2026-08-03 15:00:00 |

如果只想看正常状态的笔记：

```sql
SELECT id, title, status
FROM learning_notes
WHERE status = 'active';
```

`WHERE` 像筛子：它会一行行判断条件是否成立，成立的行留下，不成立的行不出现在结果中。以上表为例，id 1、2、4 的 `status` 是 `active`，会被保留；id 3 是 `draft`，会被筛掉。

注意：`WHERE` 不会修改状态，它只是本次查询时的过滤条件。

## 6. 最常见的条件写法：先理解，不要死背

| 你想问什么 | WHERE 条件 | 说明 |
| --- | --- | --- |
| 状态正好是 active | `status = 'active'` | 文字值使用单引号 |
| 状态不是 draft | `status <> 'draft'` | `<>` 表示不等于 |
| 浏览量大于 10 | `view_count > 10` | 数字通常不用引号 |
| 浏览量至少 10 | `view_count >= 10` | 包含 10 |
| 浏览量在 10 到 100 之间 | `view_count BETWEEN 10 AND 100` | 包含两端 |
| 状态是 active 或 draft | `status IN ('active', 'draft')` | 多个可选值 |
| 已经软删除 | `deleted_at IS NOT NULL` | 有删除时间 |
| 未软删除 | `deleted_at IS NULL` | 没有删除时间 |

例如查出“浏览量在 1 到 10 之间”的笔记：

```sql
SELECT id, title, view_count
FROM learning_notes
WHERE view_count BETWEEN 1 AND 10;
```

`BETWEEN 1 AND 10` 包含 1 和 10。这是新手很容易漏掉的细节。

### 6.1 NULL 不能用等号判断

下面是正确写法：

```sql
SELECT id, title
FROM learning_notes
WHERE deleted_at IS NULL;
```

不要这样写：

```sql
-- 错误：NULL 不能通过 = NULL 判断
WHERE deleted_at = NULL;
```

第 02 章讲过：`NULL` 表示值不存在或未知。SQL 专门使用 `IS NULL` 和 `IS NOT NULL` 判断它。

## 7. AND、OR 和括号：两个条件怎样组合

### 7.1 AND：两个条件都必须满足

查询“正常状态并且浏览量不少于 10”的笔记：

```sql
SELECT id, title, status, view_count
FROM learning_notes
WHERE status = 'active'
  AND view_count >= 10;
```

只有同时满足两项的行才会留下。以上一节表格为例，id 2 会留下；id 1 虽然 active，但浏览量是 8；id 3 虽然草稿但浏览量也不够。

### 7.2 OR：满足任意一个就可以

查询“正常状态或草稿状态”的笔记：

```sql
SELECT id, title, status
FROM learning_notes
WHERE status = 'active'
   OR status = 'draft';
```

当多个条件只是“同一个字段等于几个值”时，下面更短，也更容易读：

```sql
WHERE status IN ('active', 'draft')
```

### 7.3 AND 和 OR 混用时，必须主动加括号

假设你想查“正常状态，并且标题包含 MySQL 或 SQL”。正确写法：

```sql
SELECT id, title, status
FROM learning_notes
WHERE status = 'active'
  AND (
    title LIKE '%MySQL%'
    OR title LIKE '%SQL%'
  );
```

括号表示先把标题的两个可能性看成一组，再要求状态为 active。即使你记得 SQL 的默认优先级，也建议对这种混合条件写括号，它既减少误解，也便于以后修改。

## 8. LIKE：在文本中找“像这样的内容”

`=` 要求文本完全相等。想找标题中包含某个词，就使用 `LIKE` 和通配符：

| 写法 | 含义 | 可以匹配什么 |
| --- | --- | --- |
| `LIKE 'MySQL%'` | 以 MySQL 开头 | `MySQL 入门` |
| `LIKE '%MySQL'` | 以 MySQL 结尾 | `今天认识 MySQL` |
| `LIKE '%MySQL%'` | 任意位置包含 MySQL | `我的 MySQL 笔记` |
| `LIKE 'SQL_'` | SQL 后面恰好再有一个任意字符 | `SQL1`、`SQL2` |

其中 `%` 表示任意长度的一段字符（也可以是空），`_` 表示恰好一个任意字符。

查询标题中出现 MySQL 的笔记：

```sql
SELECT id, title
FROM learning_notes
WHERE title LIKE '%MySQL%';
```

初学阶段要记住一个性能直觉：`'MySQL%'` 是“从开头找”，`'%MySQL%'` 是“中间任何地方都找”。数据量很大时，后者通常不容易使用普通索引；第 10 章会解释原因。现在先保证查询语义正确。

## 9. ORDER BY：结果按什么顺序展示

表中的行本身没有你应依赖的“天然显示顺序”。如果你不写排序，某次查询看起来是按 id，下一次也许又不是。需要稳定顺序时，明确使用 `ORDER BY`。

### 9.1 从新到旧看笔记

```sql
SELECT id, title, created_at
FROM learning_notes
ORDER BY created_at DESC;
```

| 关键字 | 意思 |
| --- | --- |
| `ORDER BY created_at` | 按创建时间这个字段排序 |
| `DESC` | descending，值从大到小；对时间就是从新到旧 |
| `ASC` | ascending，值从小到大；不写时通常默认 ASC |

### 9.2 时间相同怎么办：补一个稳定的第二排序

多行可能有完全相同的 `created_at`，特别是批量导入时。加上 `id` 作为第二排序条件：

```sql
SELECT id, title, created_at
FROM learning_notes
ORDER BY created_at DESC, id DESC;
```

人话是“先按创建时间从新到旧；时间一样时，编号大的排前面”。这种稳定排序在分页时尤其重要。

## 10. LIMIT：这次最多显示几行

列表页不需要一次加载一万条笔记。`LIMIT` 控制本次结果数量：

```sql
SELECT id, title, created_at
FROM learning_notes
ORDER BY created_at DESC, id DESC
LIMIT 5;
```

它取排序后的前 5 条，不是“先随便取 5 条再排序”。把 `ORDER BY` 和 `LIMIT` 一起写，才能保证“最近 5 条”的含义稳定。

第二页、每页 5 条的传统写法：

```sql
SELECT id, title, created_at
FROM learning_notes
ORDER BY created_at DESC, id DESC
LIMIT 5 OFFSET 5;
```

| 片段 | 含义 |
| --- | --- |
| `LIMIT 5` | 最多取 5 条 |
| `OFFSET 5` | 先跳过前 5 条 |

这一写法适合学习和数据量不大时的分页。大量数据的深页翻页还会有更高效的“游标分页”做法，先不用急着学。

## 11. AS 别名：给这一次结果换一个显示名

数据库字段名通常使用 `snake_case`，而前端或阅读者有时想看到更直观的列名。`AS` 可以给结果列起临时别名：

```sql
SELECT
  id,
  title,
  view_count AS viewCount,
  created_at AS createdAt
FROM learning_notes;
```

`AS viewCount` 不会把表里的真实字段名从 `view_count` 改成 `viewCount`。它只影响这一次查询结果的列标题。别名在多表查询时还能避免同名字段混淆，第 08 章会继续用到。

## 12. 函数和 CASE：整理本次查询结果，不会改掉原表

把 SQL 函数想成放在查询出口的一台小计算器。它拿到每一行已有的值，算出一个新的显示结果；**只要它写在 `SELECT` 中，就不会修改表里原来的数据**。想永久改数据，必须使用第 06 章的 `UPDATE`。

### 12.1 `CONCAT` 和 `CHAR_LENGTH`：拼一段显示文字、数一数字符

下面的查询没有新增任何字段，却会在结果中多出两列：

```sql
SELECT
  id,
  title,
  CONCAT('笔记：', title) AS display_title,
  CHAR_LENGTH(title) AS title_length
FROM learning_notes
WHERE deleted_at IS NULL;
```

| 片段 | 这一次查询中做的事 |
| --- | --- |
| `CONCAT('笔记：', title)` | 把固定文字 `笔记：` 和当前行的 `title` 拼起来 |
| `AS display_title` | 给计算出来的显示列起一个临时名字 |
| `CHAR_LENGTH(title)` | 按“字符个数”计算标题长度；汉字通常算一个字符 |
| `AS title_length` | 给长度结果起临时名字 |
| `WHERE deleted_at IS NULL` | 先排除已经软删除的笔记，再为留下的行计算两列 |

例如原来 `title` 是 `学习 SELECT`，结果可能显示 `display_title` 为 `笔记：学习 SELECT`、`title_length` 为 `9`。表中的 `title` 仍然只是 `学习 SELECT`，重新执行普通的 `SELECT title ...` 就能验证这一点。

要注意 NULL：`CONCAT` 的任意一个参数是 `NULL` 时，结果也会是 `NULL`。想给可能缺失的内容准备一个替代文字，可以使用 `COALESCE`，它从左到右返回第一个不是 NULL 的值：

```sql
SELECT
  id,
  COALESCE(content, '（暂时没有正文）') AS content_preview
FROM learning_notes;
```

### 12.2 `CASE`：按不同条件显示不同说明

数据库里常把状态保存为短小、稳定的代码，例如 `active`、`draft`。给读者看时，可以在查询结果中翻译成更直观的文字：

```sql
SELECT
  id,
  title,
  status,
  CASE
    WHEN status = 'active' THEN '正常可用'
    WHEN status = 'draft' THEN '还在整理'
    ELSE '请检查状态值'
  END AS status_text,
  CASE
    WHEN view_count >= 10 THEN '已阅读较多'
    ELSE '阅读较少'
  END AS view_level
FROM learning_notes
WHERE deleted_at IS NULL;
```

阅读 `CASE` 时，把它当成“依次检查的分支”：

1. `CASE` 开始一次判断；第一个 `WHEN` 条件成立，就返回紧随其后的 `THEN` 文字。
2. 第一个条件不成立，再检查下一个 `WHEN`。
3. 所有条件都不成立时，`ELSE` 提供兜底结果，避免返回含糊的空值。
4. `END` 表示这台“小翻译器”结束，`AS status_text` 是它在这次结果中的列名。

`CASE` 同样没有把 `status` 或 `view_count` 改掉。它只决定结果表里额外两列显示什么。

### 12.3 函数放在哪里会影响性能吗

本节里的函数在 `SELECT` 列表中使用，MySQL 先按 `WHERE` 找到行，再计算显示结果，写法容易理解。以后有索引时，要格外小心把函数套在 `WHERE` 的筛选字段外面：

```sql
-- 初学阶段先认识区别，不需要立即优化。
WHERE DATE(created_at) = '2026-08-03'
```

这会要求 MySQL 先对每行的 `created_at` 计算日期，普通索引可能难以直接用于定位范围。第 10 章会解释索引为什么更喜欢“直接比较原字段”的条件。现在只要记住：**函数用来整理展示结果很自然；筛选条件里使用它时，要在学习索引后再检查执行计划。**

## 13. COUNT：不取笔记内容，只数有多少行

如果你只想知道“正常且未删除的笔记有多少条”，不需要把所有笔记都拿回来：

```sql
SELECT COUNT(*) AS total
FROM learning_notes
WHERE status = 'active'
  AND deleted_at IS NULL;
```

| 片段 | 意思 |
| --- | --- |
| `COUNT(*)` | 统计经过 WHERE 筛选后还剩几行 |
| `AS total` | 把返回的统计列命名为 total |
| `WHERE ...` | 只统计正常、未软删除的笔记 |

`COUNT(*)` 返回的是一个数字结果，不会把每行内容一起返回。第 09 章会学习“按分类分别数一数”，那时会用到 `GROUP BY`。

## 14. 一条查询的通用书写模板

对一张表的常见列表查询，可以先从这个骨架开始：

```sql
SELECT 要显示的列
FROM 表名
WHERE 要满足的条件
ORDER BY 排序字段 排序方向
LIMIT 要取的数量;
```

不是每次都要写齐。比如只看全部列时不需要 `WHERE`、`ORDER BY` 和 `LIMIT`；但每增加一项，都要能读出它对结果做了什么。

## 15. 本节常见错误

| 现象 | 常见原因 | 应该怎么想 |
| --- | --- | --- |
| 查不到刚插入的数据 | 当前数据库不对，或 WHERE 条件太严格 | 先 `SELECT DATABASE()`，再去掉条件逐步加回 |
| 用 `= NULL` 一直没结果 | NULL 判断方式错误 | 使用 `IS NULL` 或 `IS NOT NULL` |
| 每次列表顺序不同 | 没有写 `ORDER BY` | 只要顺序重要，就明确排序字段和方向 |
| 第二页数据重复或漏数据 | 排序不稳定 | 用唯一字段如 `id` 作为第二排序条件 |
| `LIKE '%词%'` 很慢 | 中间匹配难用普通索引 | 先保证功能正确，性能问题第 10 章再分析 |
| 以为 `AS`、`CASE` 改了原数据 | 它们写在 `SELECT` 中 | 重新查询原字段验证；永久修改必须使用 `UPDATE` |
| `CONCAT` 结果意外是 NULL | 被拼接的某个值是 NULL | 用 `COALESCE(字段, '替代文字')` 先准备可用值 |

## 15. 本节练习

请直接在自己的练习表上完成：

1. 查询所有字段，再改成只查询 `id`、`title`、`status`。
2. 查询所有未软删除的草稿笔记。
3. 查询浏览量在 1 到 10 之间的笔记，确认两端数字是否会被包含。
4. 查询标题同时满足“是 active 且包含 SQL 或 MySQL”的笔记，使用括号组织条件。
5. 按创建时间和 id 都倒序，取前 3 条。
6. 用 `COUNT(*) AS total` 统计未软删除的正常笔记数。
7. 用 `CONCAT` 创建一列“笔记：标题”，再查询原 `title`，确认表中的值没有被改变。
8. 用 `CASE` 把 `status` 显示为中文说明，并给 `ELSE` 留一个兜底结果。
9. 每条 SQL 执行前，先用一句人话说出你预计会留下哪些行。

下一章会增加分类表，第一次让两张表通过编号联系起来。
