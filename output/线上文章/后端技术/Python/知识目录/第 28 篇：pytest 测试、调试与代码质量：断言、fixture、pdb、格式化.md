---
title: "第 28 篇：pytest 测试、调试与代码质量：断言、fixture、pdb、格式化"
slug: "python-zero-pytest-debugging-code-quality"
summary: "建立最小可用的 Python 工程验证流程，讲解 pytest 安装与运行、测试结构、异常断言、参数化、临时目录、fixture、traceback、breakpoint、日志调试和 Ruff 代码检查。"
category: "知识目录"
tags:
  - "Python"
  - "pytest"
  - "测试"
  - "断言"
  - "fixture"
  - "pdb"
status: "published"
sortOrder: 280
cover: ""
originalId: "6a6b57a2fca6347974f5d186"
originalSlug: "python-zero-pytest-debugging-code-quality"
originalStatus: "published"
exportedAt: "2026-07-31T03:42:38.792Z"
---
# 第 28 篇：pytest 测试、调试与代码质量：断言、fixture、pdb、格式化

手动运行一次程序，只能证明“刚才这条路径看起来能工作”。自动化测试把输入、操作和预期结果保存成代码，让修改后可以重复验证。

这一篇建立最小工程闭环：

```text
编写功能 -> 写测试 -> 运行 pytest -> 定位失败 -> 修复 -> 代码检查
```

## 一、assert 不等于完整测试体系

普通断言可以检查条件：

```python
assert 1 + 1 == 2
```

但把断言散落在业务脚本里会遇到问题：

- 不知道应该一次运行哪些测试。
- 失败输出不够统一。
- 无法方便地筛选、统计和自动执行。
- 临时文件、异常和重复测试数据需要自己管理。

pytest 是第三方测试框架，它负责发现测试、执行测试并报告结果。

## 二、安装 pytest

先进入项目虚拟环境，再安装：

```powershell
python -m pip install pytest
```

检查版本：

```powershell
python -m pytest --version
```

推荐使用 `python -m pytest`，这样可以更明确地使用当前 Python 环境中的 pytest。

## 三、创建最小项目

目录结构：

```text
article_project/
  article_service.py
  tests/
    test_article_service.py
```

业务代码 `article_service.py`：

```python
def normalize_title(title):
    cleaned_title = title.strip()

    if not cleaned_title:
        raise ValueError("文章标题不能为空")

    return cleaned_title
```

测试代码 `tests/test_article_service.py`：

```python
from article_service import normalize_title


def test_normalize_title_removes_surrounding_spaces():
    result = normalize_title("  Python 入门  ")

    assert result == "Python 入门"
```

在项目根目录运行：

```powershell
python -m pytest
```

## 四、pytest 怎样发现测试

pytest 默认识别：

- 文件名 `test_*.py` 或 `*_test.py`。
- 函数名 `test_*`。
- 类名 `Test*`，且类通常不写自定义 `__init__`。

推荐测试名直接说明行为：

```python
def test_normalize_title_rejects_empty_text():
    ...
```

比下面这种名称更容易定位问题：

```python
def test_title_1():
    ...
```

## 五、Arrange、Act、Assert

一个清晰测试通常分为三段：

```python
def test_calculate_total_adds_all_amounts():
    # Arrange：准备输入
    records = [
        {"name": "早餐", "amount": 8},
        {"name": "地铁", "amount": 4}
    ]

    # Act：执行目标行为
    result = calculate_total(records)

    # Assert：验证结果
    assert result == 12
```

代码很短时不一定要写三条注释，但结构应能看出准备、执行和验证。

一个测试优先验证一个明确行为。测试失败时，名称应该直接告诉你哪个规则出了问题。

## 六、测试正常结果和边界情况

不要只测试“最顺利”的输入。

```python
def calculate_page_count(total, page_size):
    if page_size <= 0:
        raise ValueError("每页数量必须大于 0")

    return (total + page_size - 1) // page_size
```

建议覆盖：

```python
def test_calculate_page_count_for_full_pages():
    assert calculate_page_count(20, 10) == 2


def test_calculate_page_count_for_partial_page():
    assert calculate_page_count(21, 10) == 3


def test_calculate_page_count_for_empty_data():
    assert calculate_page_count(0, 10) == 0
```

常见边界包括空值、零、负数、最大长度、重复数据和不存在的记录。

## 七、使用 pytest.raises 测试异常

```python
import pytest

from article_service import normalize_title


def test_normalize_title_rejects_empty_text():
    with pytest.raises(ValueError, match="文章标题不能为空"):
        normalize_title("   ")
```

这个测试同时验证：

- 抛出了 `ValueError`。
- 异常消息包含预期文字。

只写“程序报错了”不够，应验证错误类型和关键业务信息。

## 八、浮点数使用 pytest.approx

浮点数存在二进制精度问题，不要总用完全相等比较：

```python
import pytest


def test_average_returns_expected_value():
    result = (0.1 + 0.2)

    assert result == pytest.approx(0.3)
```

金额仍应优先使用整数分或 `Decimal`；`pytest.approx` 主要用于允许合理误差的数值测试。

## 九、参数化减少重复测试

多个输入遵循同一规则时，可以使用参数化：

```python
import pytest


@pytest.mark.parametrize(
    ("raw_title", "expected"),
    [
        (" Python ", "Python"),
        ("文件读写", "文件读写"),
        ("  pytest 入门", "pytest 入门")
    ]
)
def test_normalize_title(raw_title, expected):
    assert normalize_title(raw_title) == expected
```

每一组数据会成为独立测试用例。某一组失败时，pytest 会显示对应参数。

## 十、使用 tmp_path 测试文件读写

测试不应随意在项目目录创建固定名称的临时文件。pytest 内置 `tmp_path`：

```python
def save_title(file_path, title):
    file_path.write_text(title, encoding="utf-8")


def test_save_title_writes_utf8_text(tmp_path):
    output_file = tmp_path / "article.txt"

    save_title(output_file, "Python 中文入门")

    assert output_file.read_text(encoding="utf-8") == "Python 中文入门"
```

pytest 会为测试创建独立临时目录，并在合适的时候清理。

## 十一、fixture 复用测试准备

多个测试需要相同数据时，可以使用 fixture：

```python
import pytest


@pytest.fixture
def sample_articles():
    return [
        {"title": "Python", "status": "published"},
        {"title": "FastAPI", "status": "draft"}
    ]


def test_article_count(sample_articles):
    assert len(sample_articles) == 2


def test_first_article_is_published(sample_articles):
    assert sample_articles[0]["status"] == "published"
```

fixture 适合测试数据、临时资源和依赖准备。不要把所有内容都塞进大型 fixture，否则测试会难以理解。

## 十二、常用 pytest 命令

```powershell
# 运行全部测试
python -m pytest

# 显示更详细的测试名称
python -m pytest -v

# 运行一个文件
python -m pytest tests/test_article_service.py

# 运行一个测试函数
python -m pytest tests/test_article_service.py::test_normalize_title_rejects_empty_text

# 首次失败后停止
python -m pytest -x

# 显示 print 输出
python -m pytest -s

# 按测试名称筛选
python -m pytest -k normalize_title
```

排查失败时优先缩小到一个文件或一个测试，不要每次都运行无关测试。

## 十三、怎样阅读测试失败

pytest 失败输出通常包含：

```text
测试文件和行号
实际值与预期值
调用栈 traceback
异常类型和消息
```

阅读顺序：

1. 看失败的测试名称。
2. 看最后的异常类型和消息。
3. 看项目代码中最靠近底部的有效行号。
4. 对比实际值和预期值。
5. 判断是业务代码错误、测试预期错误，还是测试数据不合理。

不要只复制第一行或最后一行错误。完整 traceback 才能说明错误从哪里传递过来。

## 十四、使用 breakpoint 调试

Python 内置 `breakpoint()`：

```python
def calculate_total(records):
    total = 0

    for record in records:
        breakpoint()
        total += record["amount"]

    return total
```

运行到断点后，可以检查变量：

```text
p record
p total
n
c
q
```

常用命令：

| 命令 | 作用 |
| --- | --- |
| `p expression` | 打印表达式 |
| `n` | 执行下一行 |
| `s` | 进入当前调用的函数 |
| `c` | 继续运行到下一个断点 |
| `q` | 退出调试 |

调试完成后应删除临时 `breakpoint()`，避免正式运行时意外暂停。

## 十五、IDE 断点与日志怎样选择

IDE 断点适合本地复现时逐行观察状态；日志适合长期运行、线上环境和无法暂停的程序。

| 场景 | 推荐方式 |
| --- | --- |
| 本地、可稳定复现、需要检查变量变化 | IDE 断点或 `breakpoint()` |
| 后台任务、线上服务、偶发问题 | `logging` |
| 验证规则长期不回归 | 自动化测试 |
| 临时确认一个简单值 | 短期 `print()`，完成后删除 |

这四种工具不是互相替代，而是解决不同阶段的问题。

## 十六、不要在测试里访问真实外部系统

单元测试应尽量快速、稳定、可重复。不要默认访问真实数据库、线上接口或发送真实邮件。

可以把外部行为作为参数传入：

```python
def publish_article(article, save_operation):
    published_article = {**article, "status": "published"}
    save_operation(published_article)
    return published_article
```

测试时传入一个本地替代函数：

```python
def test_publish_article_saves_published_status():
    saved_articles = []

    def fake_save(article):
        saved_articles.append(article)

    result = publish_article({"title": "Python"}, fake_save)

    assert result["status"] == "published"
    assert saved_articles == [result]
```

后续学习大型项目时，可以继续了解 mock、依赖注入、集成测试和端到端测试。

## 十七、使用 Ruff 检查代码

Ruff 可以发现未使用导入、未定义名称、部分风格问题，并提供格式化能力。

安装：

```powershell
python -m pip install ruff
```

检查：

```powershell
python -m ruff check .
```

格式化：

```powershell
python -m ruff format .
```

可以在 `pyproject.toml` 中保存基础配置：

```toml
[tool.ruff]
line-length = 100
target-version = "py311"

[tool.pytest.ini_options]
testpaths = ["tests"]
```

不要对陌生项目直接批量自动修复。先阅读项目现有规则和变更，再决定是否使用自动修复参数。

## 十八、推荐的提交前验证顺序

```text
1. 运行与本次修改最相关的单个测试。
2. 运行当前模块或当前测试目录。
3. 运行完整 pytest。
4. 运行 Ruff 检查。
5. 检查 git diff，确认没有临时断点、调试输出和无关文件。
```

验证范围应与改动风险匹配。改了共享工具、权限或数据结构时，需要扩大测试范围。

## 十九、Python 和 JavaScript 对照

| Python | JavaScript / TypeScript |
| --- | --- |
| pytest | Vitest、Jest |
| `pytest.raises` | `expect(fn).toThrow()` |
| `pytest.mark.parametrize` | `test.each()` |
| fixture | `beforeEach`、测试工厂、fixture |
| `tmp_path` | 临时目录工具 |
| Ruff | ESLint + Prettier 的部分能力 |
| `breakpoint()` / pdb | `debugger` / DevTools |

两边的测试思想相同：准备输入、执行行为、验证结果，并让测试可重复运行。

## 二十、本篇练习

1. 为记账本的总金额函数补正常数据、空列表和负数金额三个测试。
2. 为标题清洗函数补空标题异常测试。
3. 使用参数化测试至少三组标题。
4. 使用 `tmp_path` 测试 JSON 保存和重新读取。
5. 故意写错一个预期值，阅读完整 pytest 失败输出后再修复。
6. 运行 Ruff，并解释每一条报告，而不是直接全部自动修复。

## 本篇小结

1. 自动化测试把输入、行为和预期结果保存成可重复执行的代码。
2. pytest 按文件名和函数名自动发现测试。
3. 测试应覆盖正常结果、边界和异常行为。
4. `pytest.raises` 验证异常，`pytest.approx` 处理合理浮点误差。
5. 参数化减少重复，`tmp_path` 安全测试文件，fixture 复用准备逻辑。
6. 阅读失败时先看测试名、异常、行号和实际值，不要只截取一行错误。
7. 本地复现使用断点，长期运行使用日志，防止回归使用测试。
8. Ruff 负责静态检查和格式化，运行前应尊重项目现有配置。
