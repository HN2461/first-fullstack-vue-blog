---
title: "MySQL 03：安装、连接和第一次输入 SQL"
slug: "mysql-03-install-connect-database"
summary: "从 MySQL Server、客户端和密码各自是什么讲起，逐步完成 Windows 安装、服务检查、命令行连接、第一条 SQL、创建练习数据库和常见故障定位。"
category: "MySQL"
categoryPath:
  - "后端技术"
  - "数据库"
  - "MySQL"
tags:
  - "MySQL"
  - "数据库安装"
  - "SQL入门"
status: "published"
sortOrder: 30
cover: ""
originalId: "6a706a61360397398ac2d063"
originalSlug: "mysql-03-install-connect-database"
originalStatus: "published"
publishedAt: "2026-08-03T10:16:37.195Z"
updatedAt: "2026-08-03T10:16:37.213Z"
exportedAt: "2026-08-03T10:17:08.920Z"
---
# 03 安装、连接和第一次输入 SQL

## 1. 本节目标：先让电脑里的 MySQL 可以对话

这一章的终点很具体：在你的电脑上看到 `mysql>` 提示符，执行 `SELECT 1 + 1;` 得到结果 `2`，然后创建一个专门用于课程练习的数据库 `mysql_learning`。

你会同时看到三个东西，请先把角色分清：

| 东西 | 作用 | 本章是否必须 |
| --- | --- | --- |
| MySQL Server | 真正保存数据、执行 SQL 的服务 | 必须 |
| MySQL Client | 连接 Server、输入 SQL 的工具 | 必须，命令行即可 |
| Workbench / DBeaver | 图形化客户端 | 可选，初学者可装 |

不需要同时学会命令行和图形工具。文中以命令行作演示，因为每一步最透明；你用 Workbench 或 DBeaver 执行同样的 SQL，效果也一样。

## 2. 先看完整路径：你要完成的不是“装一个软件”

```mermaid
flowchart LR
  A[安装 MySQL Server] --> B[确认服务正在运行]
  B --> C[用客户端连接 127.0.0.1:3306]
  C --> D[输入一条 SELECT]
  D --> E[创建 mysql_learning]
  E --> F[选择这个练习数据库]
```

如果某一步失败，不要从头重装。先确定失败发生在哪一格：是 Server 没装好、服务没启动、密码不对，还是客户端找不到。后面的“常见问题”会按这个顺序排查。

## 3. 安装前的两个小概念：端口和 root

### 3.1 端口是什么

一台电脑可以同时运行很多服务。为了让客户端知道“要找的是哪一个服务”，每个服务会使用一个端口号。MySQL 默认端口通常是 `3306`。

可以把 IP 地址理解为一栋楼的地址，端口理解为这栋楼里的房间号：

```text
127.0.0.1  = 这台电脑自己
3306       = 这台电脑上 MySQL 服务常用的房间号
```

安装时先保留 `3306` 默认值。只有当安装器明确提示端口被占用，才选择另一个端口，并把新端口记下来。

### 3.2 root 是什么

`root` 是 MySQL 中权限非常高的管理员账号。学习时可用它创建练习数据库；真实项目中，后端应用通常会使用权限更小的专用账号，这一点以后部署项目时再处理。

安装时会要求你设置 root 密码。请不要把密码写进文章、代码仓库或截图中。练习环境忘记密码是可以重置的，但重置步骤会影响本机服务，先把它保存在可靠的密码管理工具里会轻松很多。

## 4. Windows 安装：每个选项实际在做什么

建议通过 [MySQL 官方下载页](https://dev.mysql.com/downloads/installer/) 的 Windows 安装器安装 MySQL 8.x，优先选择当前可用的 8.4 LTS。安装界面的具体文字可能随版本略有变化，但关键目标不变。

按照安装器推进时，重点确认下面几项：

| 安装步骤或选项 | 建议 | 原因 |
| --- | --- | --- |
| MySQL Server | 勾选 | 没有它就没有真正保存数据的服务 |
| 端口 | 先使用 `3306` | 教程和工具默认都按这个端口举例 |
| 认证方式 | 使用 MySQL 8 默认的强认证方式 | 新版本客户端兼容性更好，安全性也更好 |
| root 密码 | 设置并保存 | 后面连接时必须输入 |
| Windows Service | 勾选为服务并设为自动启动 | 重启电脑后 MySQL 能自动起来 |
| Workbench | 可勾选 | 方便查看表，但不是 Server 的替代品 |

安装结束后，最重要的不是“看到完成页面”，而是确认 MySQL 服务真的正在运行。

## 5. 确认 MySQL 服务已经启动

打开 PowerShell，执行：

```powershell
Get-Service | Where-Object { $_.Name -like '*MySQL*' }
```

你可能看到类似结果：

```text
Status   Name      DisplayName
------   ----      -----------
Running  MySQL80   MySQL80
```

其中最重要的是 `Status`：

- `Running`：服务正在运行，可以尝试连接。
- `Stopped`：服务已安装但没有启动。
- 没有任何结果：可能没有安装 Server，或者服务名不包含 MySQL，需要在 Windows“服务”列表中查找。

如果状态是 `Stopped`，可以在 Windows 服务管理器中启动对应服务。不要随意结束 MySQL 进程；正常停止和启动服务更安全。

## 6. 第一次连接：把客户端连到本机 Server

在 PowerShell 输入：

```powershell
mysql -h 127.0.0.1 -P 3306 -u root -p
```

按回车后，命令行会提示输入密码。输入时屏幕通常没有星号、没有圆点，也不会显示字符，这是正常的安全行为。输完直接回车。

把命令拆开看：

| 片段 | 意思 |
| --- | --- |
| `mysql` | 启动 MySQL 自带的命令行客户端 |
| `-h 127.0.0.1` | host，连接本机的 MySQL 服务 |
| `-P 3306` | port，连接 3306 端口；这里是大写 `P` |
| `-u root` | user，使用 root 账号登录 |
| `-p` | 让客户端稍后安全地询问密码 |

连接成功后通常能看到欢迎信息和这样的提示符：

```text
mysql>
```

这表示你已经进入 MySQL 客户端，可以输入 SQL 了。

### 如果 PowerShell 提示找不到 mysql

这通常不是密码问题，而是 Windows 不知道 `mysql.exe` 在哪里。先在安装目录中找到它，常见路径类似：

```text
C:\Program Files\MySQL\MySQL Server 8.4\bin\mysql.exe
```

可以直接用完整路径运行，或把该 `bin` 目录加入系统环境变量 `Path` 后重新打开 PowerShell。只安装 Workbench 而没有安装 Server 或命令行工具，也可能发生这个问题。

## 7. 第一条 SQL：先让数据库算一道数学题

在 `mysql>` 后输入下面这一句，然后回车：

```sql
SELECT 1 + 1;
```

你应该会看到一列结果，值为 `2`。这条命令没有读取任何表，只是让 MySQL 计算一个表达式，作用是确认“客户端已经把 SQL 发给 Server，Server 也成功执行并返回结果”。

再运行三条没有风险的观察命令：

```sql
-- MySQL 服务端版本
SELECT VERSION();

-- 当前真正以哪个 MySQL 账号执行
SELECT CURRENT_USER();

-- 服务端当前时间
SELECT NOW();
```

逐条理解：

| 命令 | 你会看到什么 | 它帮你确认什么 |
| --- | --- | --- |
| `SELECT VERSION()` | 一段版本号 | 连接到的是哪个 MySQL 版本 |
| `SELECT CURRENT_USER()` | 当前账号和主机信息 | 当前登录身份 |
| `SELECT NOW()` | 日期和时间 | MySQL 能执行函数并返回结果 |

不要担心函数的括号。`VERSION()`、`NOW()` 就像已经准备好的小工具：调用后会返回一个结果。后面会逐步学习更多函数。

## 8. 分号、提示符和取消输入：不要被命令行卡住

在 MySQL 命令行中，英文分号 `;` 用来告诉 MySQL：“这条 SQL 已经完整，可以执行。”

```sql
SELECT NOW();
```

如果你少写了分号，回车后可能看到提示符从 `mysql>` 变成 `->`：

```text
mysql> SELECT NOW()
    ->
```

这不是死机。MySQL 正在等你把这条句子说完。此时可以：

- 补一个英文分号再回车，让它执行。
- 输入 `\c` 再回车，取消这次还没完成的输入。

```text
    -> \c
mysql>
```

SQL 关键字大小写通常都能执行，例如 `select` 和 `SELECT`。课程统一把关键字写成大写，是为了让你一眼看出命令词，字段和表名使用小写下划线风格。

## 9. 创建自己的练习数据库

现在创建一间只供本课程练习使用的“资料室”。在 `mysql>` 中执行：

```sql
CREATE DATABASE mysql_learning
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_0900_ai_ci;
```

不要急着复制完就跳过。逐行看：

| 代码 | 意思 |
| --- | --- |
| `CREATE DATABASE` | 创建一个数据库 |
| `mysql_learning` | 这个数据库的名字，课程后面都使用它 |
| `CHARACTER SET utf8mb4` | 指定默认字符集为完整 UTF-8，能保存中文和 emoji |
| `COLLATE utf8mb4_0900_ai_ci` | 指定文字比较和排序时采用的规则 |
| `;` | 整条创建命令结束 |

现在不必研究“排序规则”内部细节。这里选用 MySQL 8.x 常见的 `utf8mb4_0900_ai_ci`，重点是新项目不要使用 MySQL 历史上最多只能存 3 字节字符的 `utf8` 别名。

### 执行后如何确认

先列出所有数据库：

```sql
SHOW DATABASES;
```

结果中应有 `mysql_learning`。如果你第二次重复执行创建语句，MySQL 会提示数据库已存在，这是正常保护，不代表数据库坏了。

练习时想避免重复创建报错，可以写：

```sql
CREATE DATABASE IF NOT EXISTS mysql_learning
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_0900_ai_ci;
```

但请明白 `IF NOT EXISTS` 的意思：它只是不报“已经存在”的错，并不会把已有数据库的字符集或配置自动改成你现在写的样子。

## 10. USE：先打开正确的资料室

数据库建好后，还要告诉 MySQL：“接下来我操作哪一个数据库？”

```sql
USE mysql_learning;
```

成功后，提示符通常会变成：

```text
mysql_learning>
```

再执行：

```sql
SELECT DATABASE();
```

预期会返回 `mysql_learning`。`USE` 可以理解为打开一个文件柜；后面执行 `CREATE TABLE learning_notes ...` 时，MySQL 会把表建在当前打开的这个数据库里。

初学时，请在每次开始练习时都执行一次 `SELECT DATABASE();`。大量“表找不到”问题的真正原因，是表被建在了另一个数据库，而不是 SQL 写错。

## 11. 先给 SQL 分个类：知道它们各管什么

现在不需要背缩写，但知道用途有助于把命令放进正确抽屉：

| 分类 | 全称 | 用人话说 | 本课程例子 |
| --- | --- | --- | --- |
| DDL | Data Definition Language | 定义或修改数据库、表的结构 | `CREATE DATABASE`、`CREATE TABLE` |
| DML | Data Manipulation Language | 新增、修改、删除表里的数据 | `INSERT`、`UPDATE`、`DELETE` |
| DQL | Data Query Language | 查询数据 | `SELECT` |
| DCL | Data Control Language | 管理数据库账号和权限 | `GRANT`、`REVOKE` |

本章已经运行了 DQL 的 `SELECT` 和 DDL 的 `CREATE DATABASE`。第 05 章继续 DDL 建表，第 06 章进入 DML。

## 12. 为什么真实应用不能一直使用 root：创建一个受限账号

`root` 像整栋办公楼的总管理员：它几乎可以进入所有房间、改掉所有规则，甚至删除整层资料。后端应用每天只需要读写自己的业务数据，并不需要这种总权限。

因此，真实项目会给每个应用单独创建账号，并且只授予它完成工作所需的最小权限。这叫作**最小权限原则**。即使应用配置意外泄露或代码写错，受影响的范围也会更小。

先继续用 `root` 登录，并执行下面这组只针对本课程练习库的 SQL：

```sql
CREATE USER 'mysql_course_app'@'localhost'
  IDENTIFIED BY 'Course_Only_ChangeMe_2026!';

GRANT SELECT, INSERT, UPDATE, DELETE
ON mysql_learning.*
TO 'mysql_course_app'@'localhost';

SHOW GRANTS FOR 'mysql_course_app'@'localhost';
```

逐段看它做了什么：

| SQL 片段 | 执行后发生什么 |
| --- | --- |
| `'mysql_course_app'@'localhost'` | 账号身份由“用户名 + 从哪里连接”共同组成；这里仅允许从本机连接 |
| `IDENTIFIED BY ...` | 为这个账号设置密码。示例密码只能用于你自己的本机练习，实际使用必须换成不公开的强密码 |
| `GRANT SELECT, INSERT, UPDATE, DELETE` | 只允许查询、新增、修改、删除数据行，没有授予建库、建表、删表等结构权限 |
| `ON mysql_learning.*` | 权限只对 `mysql_learning` 中的所有表有效，不会自动扩展到别的数据库 |
| `SHOW GRANTS FOR ...` | 把最终权限清单打印出来，确认授权对象和范围没有写错 |

这里的 `CREATE USER` 和 `GRANT` 都属于上一节表中的 DCL。它们只是在 MySQL 内创建登录身份和规则，不会创建 `learning_notes` 表；表要到第 05 章才会出现。

如果你第二次执行 `CREATE USER` 时看到“账号已经存在”一类错误，不代表 MySQL 坏了，而是它阻止你在不知情的情况下覆盖已有账号。只有确认这是自己创建的课程账号、并且只是忘了它的练习密码时，才用 root 执行下面的命令重设密码：

```sql
ALTER USER 'mysql_course_app'@'localhost'
  IDENTIFIED BY '你自己设置的新练习密码';
```

不要为了消除报错而随意 `DROP USER` 后重建。真实项目中，这样做可能会让正在运行的应用立即失去数据库连接。

### 12.1 用新账号验证它能做什么、不能做什么

先退出 root 客户端：

```sql
exit;
```

然后在 **PowerShell** 中重新连接。下面的命令末尾加了数据库名，所以连接成功后会直接进入 `mysql_learning`：

```powershell
mysql -h 127.0.0.1 -P 3306 -u mysql_course_app -p mysql_learning
```

输入刚才设置的密码后，先执行：

```sql
SELECT DATABASE();
```

预期返回 `mysql_learning`。第 05、06 章完成后，这个账号可以执行下面这类“读写表中数据”的操作：

```sql
SELECT * FROM learning_notes;
```

但它不应该拥有修改表结构的权力。例如，到第 05 章建好表后，尝试下面的命令会得到权限不足错误：

```sql
DROP TABLE learning_notes;
```

这次报错是**正确结果**，说明受限账号确实没有拿到危险的删表权限。学习阶段仍可用 root 创建和调整表；将来做项目时，部署和迁移流程才由少量受控的管理员账号承担。

课程结束后若不再需要这个练习账号，重新用 root 登录并清理它：

```sql
DROP USER 'mysql_course_app'@'localhost';
```

`DROP USER` 只删除这个账号和它的授权，不会删除 `mysql_learning` 数据库里的表或数据。不要对不认识的账号执行它。

## 13. 常见问题：先定位，再处理

### 13.1 `Access denied for user 'root'...`

含义：Server 已经收到了连接请求，但账号、密码或允许连接的位置不符合规则。

按顺序检查：

1. 是否真的使用了安装时设置的 root 密码。
2. 命令里 `-u root` 是否写错。
3. 是否把端口写成了小写 `-p 3306`。小写 `-p` 是“询问密码”，端口必须是大写 `-P`。
4. 如果密码遗忘，先按你安装方式对应的官方重置流程处理，不要反复猜测或把密码公开到聊天记录。

### 13.2 `Can't connect to MySQL server...`

含义：客户端还没有成功碰到 Server。优先检查：

1. 第 05 节中的服务状态是否为 `Running`。
2. 安装时是否使用了 `3306` 以外的端口。
3. 是否真的安装了 MySQL Server，而不是只装了图形客户端。

### 13.3 `Unknown database 'mysql_learning'`

含义：当前 Server 中没有这个名字的数据库，或者名字拼写不一致。

执行：

```sql
SHOW DATABASES;
```

确认列表里是否有 `mysql_learning`。没有就回到第 09 节创建它；有但仍报错时，检查大小写和连接的是否是同一台 MySQL Server。

### 13.4 忘了自己当前在哪个数据库

直接执行：

```sql
SELECT DATABASE();
```

返回 `NULL` 表示当前还没有选择数据库；执行 `USE mysql_learning;` 即可。

### 13.5 如何安全退出

完成练习后输入：

```sql
exit;
```

或：

```sql
quit;
```

这只会退出客户端，不会删除数据库，也不会停止 MySQL Server。

## 14. 本节验收清单

完成本章后，逐项打勾：

- [ ] 能说清 Server 和 Client 的区别。
- [ ] 能在服务列表看到 MySQL 正在 `Running`。
- [ ] 能进入 `mysql>` 提示符。
- [ ] `SELECT 1 + 1;` 返回 `2`。
- [ ] `SELECT VERSION();` 能返回版本号。
- [ ] `SHOW DATABASES;` 中有 `mysql_learning`。
- [ ] `SELECT DATABASE();` 返回 `mysql_learning`。
- [ ] 能说清为什么后端应用不应长期使用 root，以及“最小权限”限制的是什么范围。

全部完成后再进入第 04 章。下一章先决定每个栏目该装什么数据，再把这些栏目合成第一张表。
