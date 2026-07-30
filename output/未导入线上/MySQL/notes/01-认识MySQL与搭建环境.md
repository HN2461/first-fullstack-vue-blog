---
title: "MySQL 01：认识 MySQL 与搭建环境"
slug: mysql-01-getting-started
summary: "理解 MySQL 服务端、客户端、SQL 和数据库的区别，完成 MySQL 8.x 安装、连接、字符集及时区检查。"
category:
tags: []
status: draft
sortOrder: 10
cover:
---

# 01 认识 MySQL 与搭建环境

## 1. 本章目标

完成本章后，你应该能：

- 解释 MySQL、数据库、SQL、客户端和服务端的区别。
- 在本机启动 MySQL，并通过命令行或图形客户端连接。
- 创建一个 UTF-8 数据库，确认版本、字符集和时区。
- 理解 MongoDB 与 MySQL 在数据建模上的关键差异。

## 2. MySQL 到底是什么（P0）

MySQL 是关系型数据库管理系统（RDBMS）。它负责：

- 持久化保存业务数据。
- 按 SQL 查询和修改数据。
- 通过约束保护数据正确性。
- 通过事务保证多步操作的一致性。
- 通过索引提升查询性能。
- 管理用户、权限、备份、日志和并发访问。

几个容易混淆的概念：

| 概念 | 说明 |
| --- | --- |
| MySQL Server | 真正保存和处理数据的后台服务 |
| MySQL Client | 连接服务端并发送 SQL 的工具 |
| SQL | 操作关系型数据库的语言，不等于 MySQL 本身 |
| Database / Schema | MySQL 中两者基本可视为同义词，是表的逻辑容器 |
| Table | 结构固定的数据集合，由行和列组成 |
| Row | 一条业务记录，例如一个用户 |
| Column | 一个字段，例如邮箱或创建时间 |

后端应用不是直接读写磁盘文件，而是通过 MySQL 协议连接 Server，由 Server 执行 SQL。

## 3. 与 MongoDB 的核心差异（P0）

| 维度 | MongoDB | MySQL |
| --- | --- | --- |
| 基本单位 | 文档、集合 | 行、表 |
| 数据结构 | 灵活，文档可嵌套 | Schema 明确，列类型固定 |
| 关系表达 | 嵌入或引用 | 主键、外键、中间表、JOIN |
| 一致性约束 | 多由应用或 Schema 完成 | NOT NULL、UNIQUE、FOREIGN KEY 等数据库约束成熟 |
| 查询方式 | MongoDB Query / Aggregation | SQL |
| 事务 | 支持，但不是所有建模的第一选择 | 企业交易系统核心能力 |

迁移思维时最重要的变化是：

1. 先设计结构和关系，再写数据。
2. 不随意把复杂对象塞进一个字段。
3. 多表查询是正常能力，不需要为了避免 JOIN 把所有内容嵌套在一行。
4. 数据库约束是最后一道防线，不能只依赖接口校验。

MySQL 也支持 JSON 列，但 JSON 应用于结构不稳定、无需复杂关联和约束的扩展属性，不应拿来逃避关系建模。

## 4. 版本选择（P1）

新学习环境推荐 MySQL 8.4 LTS，原因是维护周期明确，并包含 MySQL 8 系列的现代 SQL 能力。企业现有项目仍大量使用 8.0，因此面试或入职时应先确认生产版本。

不要以 MySQL 5.7 作为新学习主线。它缺少窗口函数、CTE 等现代能力，并已进入淘汰范围。写 SQL 时也不能默认开发环境的新语法能在旧生产库运行。

查看版本：

```sql
SELECT VERSION();
```

## 5. 安装方式

### 5.1 Windows 原生安装

适合第一次学习和长期本机开发：

1. 从 MySQL 官方安装器安装 MySQL Server。
2. 选择 Development Computer 配置。
3. 端口一般保持 `3306`。
4. 设置 root 密码，并妥善保存。
5. 可一并安装 MySQL Workbench。
6. 确认 Windows 服务已启动。

检查服务：

```powershell
Get-Service | Where-Object { $_.Name -like '*MySQL*' }
```

连接：

```powershell
mysql -h 127.0.0.1 -P 3306 -u root -p
```

参数含义：

- `-h`：主机地址。
- `-P`：端口，注意是大写 P。
- `-u`：用户名。
- `-p`：交互式输入密码，不要把密码直接写在命令里。

### 5.2 Docker 安装

适合已经熟悉 Docker 的开发者。示例仅用于本地学习：

```powershell
docker run --name mysql-learning `
  -e MYSQL_ROOT_PASSWORD=ChangeMe_123456 `
  -e MYSQL_DATABASE=mysql_learning `
  -p 3306:3306 `
  -v mysql-learning-data:/var/lib/mysql `
  -d mysql:8.4
```

真实项目中不要把密码写进仓库；应使用环境变量、密钥服务或部署平台配置。

常用操作：

```powershell
docker logs mysql-learning
docker exec -it mysql-learning mysql -u root -p
docker stop mysql-learning
docker start mysql-learning
```

### 5.3 图形客户端

常见选择包括 MySQL Workbench、DataGrip、DBeaver。图形工具提高效率，但学习前期仍建议经常手写 SQL。企业开发最终依赖的是 SQL 能力，不是某个客户端按钮的位置。

## 6. 第一次连接后的检查（P0）

```sql
SELECT VERSION();
SELECT CURRENT_USER();
SELECT DATABASE();
SHOW DATABASES;
SHOW VARIABLES LIKE 'character_set_server';
SHOW VARIABLES LIKE 'collation_server';
SELECT @@session.time_zone, @@global.time_zone;
```

推荐业务数据库使用：

- 字符集：`utf8mb4`，完整支持中文和 emoji。
- 排序规则：新项目可使用 `utf8mb4_0900_ai_ci`；需兼容旧版本时常见 `utf8mb4_unicode_ci`。
- 存储引擎：InnoDB。

`utf8` 在旧 MySQL 语境里可能只支持最多 3 字节字符，不能完整覆盖 Unicode。新项目明确写 `utf8mb4`。

## 7. 创建学习数据库和普通账号

```sql
CREATE DATABASE mysql_learning
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_0900_ai_ci;

CREATE USER 'learning_app'@'127.0.0.1'
  IDENTIFIED BY 'ChangeMe_123456';

GRANT ALL PRIVILEGES ON mysql_learning.*
  TO 'learning_app'@'127.0.0.1';

SHOW GRANTS FOR 'learning_app'@'127.0.0.1';
```

本地学习账号固定使用 `127.0.0.1`，这样可以和第 13 章的 Node.js 连接配置保持一致。MySQL 账号由“用户名 + host”共同定义，`learning_app@localhost` 和 `learning_app@127.0.0.1` 不要混为一谈。

这里授予实验库全部权限只是为了方便学习建表和回滚；生产应用账号仍应遵循第 12 章的最小权限原则，不能直接照搬 `GRANT ALL PRIVILEGES`。

## 8. SQL 基础书写规范

```sql
SELECT
  id,
  username,
  created_at
FROM users
WHERE status = 'active'
ORDER BY created_at DESC
LIMIT 20;
```

建议：

- SQL 关键字大写，表名和列名使用小写 `snake_case`。
- 一行一个主要字段或条件，复杂 SQL 保持缩进。
- 每条语句以分号结束。
- 不使用中文表名、列名和拼音缩写。
- 名称表达业务含义，例如 `created_at`，不要写 `c_time`。
- 团队统一命名规范比个人偏好更重要。

## 9. 常见连接错误

### `Access denied for user`

检查用户名、密码、允许登录的 host 和授权范围。MySQL 的 `'app'@'localhost'` 与 `'app'@'%'` 是不同账号主体。

### `Can't connect to MySQL server`

检查服务是否启动、主机和端口是否正确、防火墙是否开放，以及容器端口是否映射。

### 中文乱码

检查数据库、表、列、连接客户端的字符集。不要通过删除中文或改成拼音规避编码问题。

### 时区错误

数据库、Node.js 进程和业务时间语义需要统一。推荐服务端和数据库存 UTC，展示层转换为用户时区；若现有系统统一使用 `Asia/Shanghai`，也必须在全链路明确一致。

## 10. 本章自检

- [ ] 能说清 Server、Client、SQL、Database 和 Table 的区别。
- [ ] 能从命令行连接 MySQL。
- [ ] 能查看当前版本、数据库、用户、字符集和时区。
- [ ] 能解释为什么应用账号不应使用 root。
- [ ] 能解释为什么新项目使用 `utf8mb4`。
