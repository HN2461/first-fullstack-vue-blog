# 05 数据库测试：MySQL 与 MongoDB

## 本阶段目标

验证数据是否正确写入、修改、删除、关联、隔离、索引和恢复。数据库测试不等于“能查到一条记录”，要核对约束、事务、并发、重复操作和接口返回的一致性。

## 先理解数据库测试在验证什么

页面上的“保存成功”只是一个提示。数据库测试要回答：数据有没有真的保存，字段有没有被截断或错写，关联数据是否指向正确对象，不同用户能否看到不该看到的数据，删除是软删除、回收站还是物理删除，失败时有没有留下半条数据。

当前博客项目主要使用 MongoDB；这里的 MySQL 是独立学习环境。不要把 MySQL 练习 SQL 直接对生产 MongoDB 或线上数据库执行。

## 先认识三种数据状态

- **输入数据**：通过页面、接口或脚本送入的内容。
- **持久化数据**：数据库实际保存的文档、行和字段。
- **展示数据**：接口投影或页面显示给用户的内容。

三者可能不同。例如密码输入后应该被哈希保存，公开接口应该隐藏密码字段；这不是错误，而是安全设计。测试时要根据需求判断哪些字段应该相同，哪些字段应该被转换或隐藏。

## 1. MySQL 练习环境

使用独立的本地数据库，不连接生产库：

```sql
CREATE DATABASE qa_blog CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;
USE qa_blog;

CREATE TABLE users (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  email VARCHAR(255) NOT NULL UNIQUE,
  role VARCHAR(30) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE articles (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  author_id BIGINT NOT NULL,
  title VARCHAR(100) NOT NULL,
  status VARCHAR(20) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_articles_author FOREIGN KEY (author_id) REFERENCES users(id)
);
```

执行并记录：

```sql
INSERT INTO users (email, role) VALUES ('qa-admin@example.test', 'admin');
INSERT INTO articles (author_id, title, status) VALUES (1, '测试文章', 'draft');
SELECT * FROM articles WHERE author_id = 1;
UPDATE articles SET status = 'published' WHERE id = 1;
DELETE FROM articles WHERE id = 1;
```

### 1.1 MySQL 小白操作步骤

1. 打开 MySQL Workbench 或命令行客户端。
2. 连接本地 MySQL，确认连接地址不是生产地址。
3. 新建 SQL 标签页，先执行 `SELECT VERSION();`，保存版本。
4. 执行建库语句，看到成功后再执行 `USE qa_blog;`。
5. 一次执行一小段 SQL，观察影响行数和错误信息。
6. 执行查询确认数据，再进行修改或删除。
7. 练习结束前先确认数据库名称，再考虑删除练习库。

命令行示例：

```powershell
mysql -u root -p
```

输入密码时终端通常不回显字符，这是正常的。若看到 `mysql>`，说明已经进入 MySQL；每条 SQL 必须以分号 `;` 结束。

### 1.2 先学会看三类 SQL 结果

- `SELECT`：显示查询结果行。
- `INSERT/UPDATE/DELETE`：显示影响行数。
- 约束错误：显示错误编号和原因。错误不是“命令没执行”，而是数据库拒绝了不符合规则的数据。

## 2. MySQL 必做验证

- [ ] 必填字段为空时插入失败。
- [ ] 唯一邮箱重复时插入失败，错误能被服务层转换为可理解提示。
- [ ] 外键引用不存在用户时插入失败。
- [ ] 事务中第二步失败时第一步回滚。
- [ ] 两个会话同时更新同一行时观察锁等待和最终结果。
- [ ] 用 `EXPLAIN` 对有无索引的查询做对比，记录 type、key、rows 和 Extra。
- [ ] 备份测试库并恢复到新库，核对行数和关键数据。

事务练习：

```sql
START TRANSACTION;
INSERT INTO articles (author_id, title, status) VALUES (1, '事务测试', 'draft');
-- 故意执行一条会失败的语句，观察是否按业务要求回滚
ROLLBACK;
```

### 2.1 事务到底解决什么问题

事务把多条操作看成一个整体：要么全部成功，要么全部撤销。例如发布文章可能同时更新文章状态、发布时间和搜索索引记录。如果中间一步失败，不能留下“状态已发布但没有发布时间”的半成品。

练习成功和失败两种情况：

```sql
START TRANSACTION;
INSERT INTO articles (author_id, title, status)
VALUES (1, '事务成功测试', 'draft');
UPDATE articles SET status = 'published' WHERE title = '事务成功测试';
COMMIT;

START TRANSACTION;
INSERT INTO articles (author_id, title, status)
VALUES (1, '事务回滚测试', 'draft');
INSERT INTO articles (author_id, title, status)
VALUES (999999, '应该回滚', 'draft');
ROLLBACK;
```

回滚后查询 `事务回滚测试`，确认是否不存在；如果仍然存在，记录存储引擎、错误处理和事务边界。

### 2.2 索引与 EXPLAIN 小白解释

索引像书的目录：可以减少查找时间，但会占空间，并让写入需要额外维护。执行：

```sql
EXPLAIN SELECT * FROM articles WHERE author_id = 1;
CREATE INDEX idx_articles_author_id ON articles(author_id);
EXPLAIN SELECT * FROM articles WHERE author_id = 1;
```

重点抄写 `key`、`rows`、`type`。没有索引不一定就是缺陷，要结合数据量、查询频率和写入成本判断；测试人员要提供对比证据，不要只说“加索引会更快”。

## 3. 当前项目 MongoDB 核对

使用 `mongosh` 或 Compass 连接本地配置中的数据库，数据库名和连接串从 `.env` 读取：

```javascript
show dbs
use <local_database>
show collections
db.users.findOne({ email: 'admin@example.com' })
db.articles.find({ status: 'published' }).sort({ createdAt: -1 }).limit(5)
db.articles.getIndexes()
```

根据实际模型核对用户、文章、分类、标签、评论、媒体、菜单和角色集合。不要凭集合名称猜字段，先读 `backend/src/models` 和查询结果。

### 3.1 MongoDB 小白操作步骤

1. 从 `backend/.env` 读取 `MONGODB_URI`，不要把密码复制到共享记录。
2. 打开 MongoDB Compass，粘贴本地连接串，连接后确认数据库名称。
3. 先看 Collections，再点开一条文档，认识字段类型。
4. 用只读查询开始练习，确认结果后再进行更新或删除。
5. 用 `mongosh` 保存查询文本；Compass 截图只作为辅助证据。

常用只读命令：

```javascript
db.articles.findOne({ slug: '不存在的-slug' })
db.articles.countDocuments({ status: 'published' })
db.articles.find({ status: 'published' }, { title: 1, status: 1 }).limit(5)
db.articles.getIndexes()
```

`findOne` 返回一条或 `null`，`countDocuments` 返回数量，投影对象中的 `1` 表示只返回指定字段。查询阶段不要使用 `deleteMany({})` 这类无条件删除。

### 3.2 MongoDB 中的时间和 ID

MongoDB 的 `_id` 通常是 ObjectId。接口返回的 ID 可能是字符串，查询时需要使用 `ObjectId('...')`，具体以模型和工具支持为准。时间字段可能是 ISODate，也可能是字符串；测试排序时要确认类型统一。

## 4. 接口与数据库双向核对

以创建文章为例：

1. 发送接口请求，记录响应中的 ID、状态、时间和作者。
2. 用 MongoDB 查询同一 ID，核对标题、正文、分类、标签和状态。
3. 再调用详情接口，核对接口返回与数据库投影是否符合契约。
4. 重复调用，确认是拒绝、幂等返回还是创建新数据，结果必须和需求一致。
5. 删除或回收后重新查询，区分软删除字段、回收站文档和物理删除。

### 4.1 建立前后快照

```markdown
| 时点 | 接口结果 | 数据库关键字段 | 页面结果 |
| --- | --- | --- | --- |
| 创建前 | 不存在 | 查询数量 0 | 无 |
| 创建后 | 返回 ID、draft | status=draft | 草稿列表可见 |
| 发布后 | 返回 published | publishAt 有值 | 公开详情可见 |
| 回收后 | 返回 deleted | deleted=true | 公开详情不可见 |
```

不要直接把完整数据库文档上传到公共渠道，可能包含用户信息、内部字段或 Token 相关内容；证据只保留判断所需字段。

## 5. 数据质量检查

- [ ] 无孤儿引用：文章作者、分类、标签、评论目标仍然存在或有明确删除策略。
- [ ] 时间字段统一时区并能排序。
- [ ] 分页总数、当前页和实际记录数一致。
- [ ] 敏感字段不出现在公开接口。
- [ ] 重复请求不会产生不可预期的重复数据。
- [ ] 索引与高频查询条件匹配，且不会因索引导致写入异常。

### 5.1 常见数据库问题如何定位

| 现象 | 先查什么 |
| --- | --- |
| 页面显示保存成功但刷新消失 | 接口响应、数据库是否有新 ID |
| 列表总数正确但当前页为空 | 分页参数、排序、过滤条件 |
| 删除后详情仍可访问 | 软删除条件、公开查询是否过滤 |
| A 用户看到了 B 用户备忘录 | 查询是否包含 owner/user 条件 |
| 重复点击产生两条数据 | 唯一索引、幂等键、前端防重复提交 |
| 更新一条记录影响很多条 | 更新过滤条件是否缺少 `_id` |

## 6. 本阶段练习顺序

1. 在独立 MySQL 库完成建库、建表、增删改查。
2. 故意违反非空、唯一、外键约束并保存错误信息。
3. 用两个 SQL 会话观察事务和锁。
4. 用 MongoDB 查询当前项目一条测试文章的前后状态。
5. 用接口创建、修改、发布、回收同一篇文章，并完成双向核对。
6. 清理测试数据后再次查询，确认清理结果。

## 7. 本阶段交付物

- `qa_blog.sql`
- MySQL 约束错误记录
- 事务提交/回滚记录
- `EXPLAIN` 前后对比
- MongoDB 集合和索引清单
- 一条文章生命周期的数据快照
- 数据清理确认记录

## 完成标准

你能用数据库证据解释一个接口结果，能区分“接口返回错误”“数据落库错误”“查询条件错误”和“测试数据污染”，并能在独立 MySQL 库完成基本 SQL、事务、索引和备份恢复练习。
