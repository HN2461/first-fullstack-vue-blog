---
title: "第 29 篇：正则、命令行参数、安全随机数与时区：re、argparse、secrets、zoneinfo"
slug: "python-zero-regex-argparse-secrets-zoneinfo"
summary: "系统讲解常用标准库 re、argparse、secrets、datetime 与 zoneinfo，掌握文本匹配替换、正式命令行参数、安全令牌、时区感知时间及 UTC 存储原则。"
category: "知识目录"
categoryPath:
  - "后端技术"
  - "Python"
  - "知识目录"
tags:
  - "Python"
  - "零基础入门"
  - "标准库"
  - "安全"
status: "published"
sortOrder: 290
cover: ""
originalId: "6a6b57a2fca6347974f5d188"
originalSlug: "python-zero-regex-argparse-secrets-zoneinfo"
originalStatus: "published"
publishedAt: "2026-07-30T14:44:46.166Z"
updatedAt: "2026-07-31T11:16:22.442Z"
exportedAt: "2026-08-03T10:17:08.920Z"
---
# 第 29 篇：正则、命令行参数、安全随机数与时区：re、argparse、secrets、zoneinfo

“常用标准库”已经介绍了日期、路径、JSON、随机数、环境变量、日志和 CSV。这一篇补齐四类经常出现在脚本和后端项目中的工具：

- `re`：按模式查找、校验和替换文本。
- `argparse`：给命令行脚本定义可靠参数。
- `secrets`：生成验证码、令牌等安全随机值。
- `zoneinfo`：处理 UTC 和不同时区。

## 一、什么时候需要正则表达式

普通字符串方法优先用于简单规则：

```python
title.startswith("Python")
"@" in email
text.replace("旧词", "新词")
```

当规则包含“多种字符、重复次数、位置边界、分组提取”时，可以考虑正则表达式。

例如，从日志中提取文章 ID：

```text
article_id=article-1024 status=published
```

## 二、使用 re.search 查找

```python
import re


text = "article_id=article-1024 status=published"
match = re.search(r"article-\d+", text)

if match:
    print(match.group())  # article-1024
```

`re.search()` 会在整个字符串中查找第一个匹配。没有找到时返回 `None`。

常见符号：

| 写法 | 含义 |
| --- | --- |
| `\d` | 一个数字字符 |
| `\w` | 字母、数字或下划线等单词字符 |
| `\s` | 空白字符 |
| `.` | 除换行外的任意字符 |
| `+` | 前一项出现一次或多次 |
| `*` | 前一项出现零次或多次 |
| `?` | 前一项出现零次或一次 |
| `{2,5}` | 前一项出现 2 到 5 次 |
| `^` | 字符串开头 |
| ` | 字符串结尾 |
| `[...]` | 字符集合或范围 |

## 三、为什么正则常用原始字符串

正则本身大量使用反斜杠，Python 字符串也会处理反斜杠。推荐使用 `r"..."` 原始字符串：

```python
pattern = r"\d{4}-\d{2}-\d{2}"
```

如果不用原始字符串，就可能需要双重转义：

```python
pattern = "\\d{4}-\\d{2}-\\d{2}"
```

原始字符串让正则表达式更接近它本来的写法。

## 四、search、match 和 fullmatch

```python
import re


text = "编号 article-1001 已发布"

print(re.search(r"article-\d+", text))
print(re.match(r"article-\d+", text))
print(re.fullmatch(r"article-\d+", text))
```

| 函数 | 行为 |
| --- | --- |
| `re.search()` | 在整个字符串中找第一个匹配 |
| `re.match()` | 只从字符串开头匹配 |
| `re.fullmatch()` | 要求整个字符串全部符合规则 |

校验完整字段时通常优先使用 `fullmatch()`：

```python
slug = "python-zero-01"

if re.fullmatch(r"[a-z0-9-]+", slug) is None:
    raise ValueError("slug 格式不正确")
```

## 五、findall、finditer 和分组

查找所有匹配：

```python
text = "文章 article-1001 引用了 article-1002"
article_ids = re.findall(r"article-\d+", text)

print(article_ids)
```

需要匹配位置或大量结果时，可以使用 `finditer()`：

```python
for match in re.finditer(r"article-\d+", text):
    print(match.group(), match.start(), match.end())
```

使用命名分组提取结构化内容：

```python
line = "2026-07-27 | published | Python 入门"
pattern = re.compile(
    r"^(?P<date>\d{4}-\d{2}-\d{2}) \| "
    r"(?P<status>\w+) \| "
    r"(?P<title>.+)$"
)

match = pattern.fullmatch(line)

if match:
    print(match.groupdict())
```

## 六、使用 re.sub 替换

```python
import re


text = "Python     零基础   入门"
cleaned_text = re.sub(r"\s+", " ", text).strip()

print(cleaned_text)
```

如果只是替换固定文字，普通 `str.replace()` 更简单。不要为了显得高级而把所有字符串处理都写成正则。

## 七、编译和复用正则

同一模式会使用多次时，可以预先编译：

```python
import re


SLUG_PATTERN = re.compile(r"[a-z0-9-]+")


def is_valid_slug(slug):
    return SLUG_PATTERN.fullmatch(slug) is not None
```

复杂正则应添加示例、测试和必要说明。外部用户提供的超长文本可能让某些复杂正则耗时明显增加，应限制输入长度，避免层层嵌套的模糊重复规则。

## 八、argparse 解决什么问题

学习阶段常用 `input()` 交互输入。正式脚本更适合命令行参数：

```powershell
python import_articles.py articles.csv --status draft --dry-run
```

命令行参数可以被脚本、定时任务和部署系统稳定调用，也能自动生成帮助信息。

## 九、第一个 argparse 脚本

```python
import argparse


def parse_args():
    parser = argparse.ArgumentParser(description="导入文章 CSV")
    parser.add_argument("file", help="CSV 文件路径")
    parser.add_argument(
        "--status",
        choices=["draft", "published"],
        default="draft",
        help="新文章状态"
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="只检查数据，不实际写入"
    )
    return parser.parse_args()


def main():
    args = parse_args()
    print(f"文件：{args.file}")
    print(f"状态：{args.status}")
    print(f"试运行：{args.dry_run}")


if __name__ == "__main__":
    main()
```

运行帮助：

```powershell
python import_articles.py --help
```

`argparse` 会自动说明参数并检查部分输入错误。

## 十、位置参数和可选参数

```python
parser.add_argument("file")
parser.add_argument("--status", default="draft")
```

- `file` 没有 `--`，属于必填位置参数。
- `--status` 属于可选参数，可以提供默认值。

常用配置：

| 参数 | 作用 |
| --- | --- |
| `type=int` | 自动转换为整数，失败时显示错误 |
| `required=True` | 要求提供可选参数 |
| `default=value` | 默认值 |
| `choices=[...]` | 限制允许值 |
| `action="store_true"` | 出现开关时设为 `True` |
| `nargs="+"` | 接收一个或多个值 |

示例：

```python
parser.add_argument("--page-size", type=int, default=20)
parser.add_argument("--tags", nargs="+", default=[])
```

## 十一、为什么安全场景不能使用 random

`random` 采用确定性伪随机算法，适合：

- 抽样。
- 打乱顺序。
- 游戏和模拟。
- 生成普通测试数据。

它不适合：

- 登录验证码。
- 密码重置令牌。
- API 密钥。
- 会话标识。
- 邀请链接中的秘密部分。

安全场景应使用 `secrets`。它从操作系统提供的安全随机源获取数据。

## 十二、使用 secrets 生成安全随机值

生成六位数字验证码：

```python
import secrets
import string


def generate_verification_code(length=6):
    return "".join(secrets.choice(string.digits) for _ in range(length))


print(generate_verification_code())
```

生成适合 URL 的令牌：

```python
import secrets


reset_token = secrets.token_urlsafe(32)
print(reset_token)
```

常用函数：

| 函数 | 用途 |
| --- | --- |
| `secrets.choice(sequence)` | 安全地随机选择一个元素 |
| `secrets.randbelow(n)` | 生成小于 `n` 的安全随机整数 |
| `secrets.token_hex(n)` | 生成十六进制令牌 |
| `secrets.token_urlsafe(n)` | 生成适合 URL 的令牌 |
| `secrets.compare_digest(a, b)` | 更稳妥地比较摘要或令牌 |

安全令牌还需要设置过期时间、限制用途、避免日志泄露，并通常只保存哈希值。`secrets` 只解决随机性，不会自动完成完整认证设计。

## 十三、朴素时间和时区感知时间

```python
from datetime import datetime


now = datetime.now()
print(now)
print(now.tzinfo)  # None
```

`tzinfo` 为 `None` 的时间叫朴素时间，英文是 naive datetime。它没有说明自己属于哪个时区。

时区感知时间包含时区信息：

```python
from datetime import datetime, timezone


now_utc = datetime.now(timezone.utc)
print(now_utc)
print(now_utc.tzinfo)
```

后端系统记录跨地区事件时，优先使用时区感知时间。

## 十四、使用 zoneinfo 转换时区

`zoneinfo` 从 Python 3.9 开始进入标准库：

```python
from datetime import datetime, timezone
from zoneinfo import ZoneInfo


now_utc = datetime.now(timezone.utc)
shanghai_time = now_utc.astimezone(ZoneInfo("Asia/Shanghai"))

print(now_utc)
print(shanghai_time)
```

推荐使用 IANA 时区名称，例如：

```text
Asia/Shanghai
Asia/Tokyo
Europe/London
America/New_York
```

不要用固定 `+8` 代替所有时区规则，因为部分地区存在夏令时和历史规则变化。

Windows 等环境如果缺少 IANA 时区数据库，可能出现 `ZoneInfoNotFoundError`。可以安装官方维护的数据包：

```powershell
python -m pip install tzdata
```

## 十五、时间存储和展示原则

推荐思路：

```text
系统内部存储和接口传输：UTC
面向用户展示：转换到用户或业务时区
```

生成 ISO 8601 字符串：

```python
from datetime import datetime, timezone


occurred_at = datetime.now(timezone.utc)
text = occurred_at.isoformat()

print(text)
```

解析：

```python
restored = datetime.fromisoformat(text)
```

不要在不知道时区的情况下，直接比较来自不同系统的两个朴素时间。

## 十六、综合实战：安全的导入批次信息

```python
import argparse
import re
import secrets
from datetime import datetime, timezone


BATCH_NAME_PATTERN = re.compile(r"[a-z0-9-]+")


def parse_args():
    parser = argparse.ArgumentParser(description="创建文章导入批次")
    parser.add_argument("name", help="批次名称，只允许小写字母、数字和短横线")
    parser.add_argument("--dry-run", action="store_true")
    return parser.parse_args()


def create_batch(name, dry_run=False):
    if BATCH_NAME_PATTERN.fullmatch(name) is None:
        raise ValueError("批次名称格式不正确")

    return {
        "name": name,
        "token": secrets.token_urlsafe(16),
        "created_at": datetime.now(timezone.utc).isoformat(),
        "dry_run": dry_run
    }


def main():
    args = parse_args()
    batch = create_batch(args.name, dry_run=args.dry_run)
    print(batch)


if __name__ == "__main__":
    main()
```

这个例子把四个原则组合起来：参数由 `argparse` 管理，名称由正则校验，令牌由 `secrets` 生成，时间使用 UTC。

## 十七、Python 和 JavaScript 对照

| 功能 | Python | JavaScript / Node.js |
| --- | --- | --- |
| 正则 | `re` | `RegExp` |
| 命令行参数 | `argparse` | `process.argv`、commander、yargs |
| 安全随机数 | `secrets` | Web Crypto、`crypto.randomBytes()` |
| UTC 时间 | `datetime.now(timezone.utc)` | `new Date()` 内部时间戳 |
| IANA 时区 | `zoneinfo.ZoneInfo` | `Intl.DateTimeFormat`、Temporal 生态 |

浏览器的 `Math.random()` 和 Python 的 `random` 一样，都不应生成安全令牌。

## 十八、本篇练习

1. 使用 `re.fullmatch()` 校验只包含小写字母、数字和短横线的 slug。
2. 使用命名分组从 `2026-07-27|published|Python` 中提取三个字段。
3. 给记账本增加 `--file`、`--month` 和 `--dry-run` 命令行参数。
4. 分别使用 `random` 和 `secrets` 生成六位数字，并说明两者适用场景。
5. 生成一个 UTC 时间，再转换为 `Asia/Shanghai`。
6. 为正则校验和命令行参数背后的业务函数编写 pytest 测试。

## 本篇小结

1. 简单字符串操作优先用 `str` 方法，复杂模式再使用正则。
2. 完整字段校验优先考虑 `re.fullmatch()`，多个结果使用 `findall()` 或 `finditer()`。
3. 正则通常写成原始字符串，并应为复杂规则补测试。
4. `argparse` 能定义参数、类型、默认值、可选值和帮助信息。
5. `random` 不适合安全场景，验证码和令牌使用 `secrets`。
6. `secrets` 只提供安全随机性，完整认证还需要过期、存储和日志保护。
7. 后端时间优先使用时区感知对象，内部存储和传输优先 UTC。
8. 面向用户展示时间时，再使用 `zoneinfo` 转换到目标时区。
