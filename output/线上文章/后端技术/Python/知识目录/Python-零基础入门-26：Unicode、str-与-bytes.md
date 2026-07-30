---
title: "Python 零基础入门 26：Unicode、str 与 bytes"
slug: "python-zero-unicode-str-bytes"
summary: "从字符与字节的区别出发，系统讲解 Unicode、UTF-8、str、bytes、encode、decode、文本与二进制文件、BOM、utf-8-sig、常见乱码成因及系统边界上的编码处理。"
category: "知识目录"
categoryPath:
  - "后端技术"
  - "Python"
  - "知识目录"
tags:
  - "Python"
  - "零基础入门"
  - "Unicode"
  - "编码"
status: "published"
sortOrder: 270
cover: ""
originalId: "6a6b57a2fca6347974f5d184"
originalSlug: "python-zero-unicode-str-bytes"
originalStatus: "published"
publishedAt: "2026-07-30T14:44:46.162Z"
updatedAt: "2026-07-30T14:44:46.162Z"
exportedAt: "2026-07-30T15:42:33.614Z"
---
# Python 零基础入门 26：Unicode、str 与 bytes

“文件有中文，所以写 `encoding="utf-8"`”只是操作结论。真正理解编码，需要分清四个概念：

```text
人看到的字符 -> Python str -> 按某种编码转换 -> 原始 bytes
```

这一篇解决以下问题：

- `str` 和 `bytes` 有什么区别。
- `encode()` 与 `decode()` 分别做什么。
- 为什么同一句中文的字符长度和字节长度不同。
- 文本模式为什么需要 `encoding`，二进制模式为什么不能写。
- BOM、`utf-8` 与 `utf-8-sig` 应该怎样选择。
- 乱码和 `UnicodeDecodeError` 为什么会发生。

## 一、字符不是字节

字符是人理解的文字单位，例如：

```text
A
中
🙂
```

字节是计算机存储和传输的原始数值单位。文件、网络连接和磁盘最终保存的都是字节。

同一个字符可以按照不同编码规则转换成不同字节。UTF-8、GBK、UTF-16 都是编码规则。

## 二、Unicode 是什么

Unicode 为世界上的字符分配统一编号，这个编号叫码点，英文是 code point。

```python
print(ord("A"))   # 65
print(hex(ord("中")))
print(chr(65))    # A
```

`ord()` 把单个字符转换成码点数字，`chr()` 把码点数字转换成字符。

Unicode 解决“每个字符对应哪个编号”，UTF-8 解决“这个编号怎样保存成字节”。它们不是同一个概念。

## 三、Python str 保存 Unicode 文本

Python 3 的 `str` 表示 Unicode 文本：

```python
title = "Python 中文入门"

print(type(title))  # <class 'str'>
print(len(title))   # 字符数量
```

`len(str)` 统计的是字符数量，不是保存到文件后的字节数量。

```python
text = "中文"
print(len(text))  # 2
```

在业务逻辑中处理标题、用户名、文章正文时，通常使用 `str`。

## 四、bytes 保存原始字节

`bytes` 是不可变的字节序列：

```python
data = b"Hello"

print(type(data))  # <class 'bytes'>
print(len(data))   # 5
print(data[0])     # 72
```

遍历 `bytes` 得到的是 0 到 255 的整数，而不是单字符字符串。

字节字面量只能直接包含 ASCII 字符，下面的代码不合法：

```python
# data = b"中文"  # SyntaxError
```

中文需要先作为 `str`，再按编码转换为 `bytes`。

## 五、encode：从 str 到 bytes

编码使用 `str.encode()`：

```python
text = "中文"
data = text.encode("utf-8")

print(data)
print(type(data))
print(len(text))  # 2 个字符
print(len(data))  # UTF-8 中占 6 个字节
```

可以把 `encode` 记成：

```text
文本 str --encode--> 字节 bytes
```

默认编码就是 UTF-8，但企业代码中明确写出来更容易看懂边界约定：

```python
data = text.encode("utf-8")
```

## 六、decode：从 bytes 到 str

解码使用 `bytes.decode()`：

```python
data = b"\xe4\xb8\xad\xe6\x96\x87"
text = data.decode("utf-8")

print(text)        # 中文
print(type(text))  # <class 'str'>
```

可以把 `decode` 记成：

```text
字节 bytes --decode--> 文本 str
```

口诀：

```text
str 编码成 bytes，bytes 解码成 str。
```

## 七、编码和解码必须使用同一规则

```python
text = "知识库"
data = text.encode("utf-8")
restored = data.decode("utf-8")

print(restored)
```

如果用 UTF-8 编码，却用 GBK 解码，可能报错，也可能产生乱码：

```python
data = "知识库".encode("utf-8")
text = data.decode("gbk")
```

错误类型通常是：

```text
UnicodeDecodeError
```

编码不是根据字节内容自动携带的标签。读取方必须知道或可靠判断发送方使用的编码。

## 八、文本模式自动完成编码转换

写文本文件时：

```python
with open("article.txt", "w", encoding="utf-8") as file:
    file.write("Python 中文入门")
```

Python 会在内部完成：

```text
str -> UTF-8 bytes -> 文件
```

读取时：

```python
with open("article.txt", "r", encoding="utf-8") as file:
    content = file.read()
```

Python 会完成：

```text
文件 bytes -> UTF-8 解码 -> str
```

所以文本模式的 `read()` 返回 `str`，`write()` 接收 `str`。

## 九、二进制模式不做编码转换

```python
with open("article.txt", "rb") as file:
    data = file.read()

print(type(data))  # <class 'bytes'>
```

二进制模式直接读写字节，因此不能指定 `encoding`：

```python
with open("article.txt", "rb") as file:
    data = file.read()

text = data.decode("utf-8")
```

图片、音频、压缩包不是文本，不应随意调用 `.decode()`。

## 十、str 和 bytes 不能直接拼接

```python
text = "标题："
data = b"Python"

# text + data  # TypeError
```

先统一为文本：

```python
result = text + data.decode("utf-8")
```

或者统一为字节：

```python
result = text.encode("utf-8") + data
```

选择哪一种取决于下一步是在做业务文本处理，还是向文件、网络等字节边界写入数据。

## 十一、errors 参数怎样使用

默认的 `errors="strict"` 会在非法字节出现时直接报错：

```python
text = data.decode("utf-8", errors="strict")
```

其他常见策略：

```python
data.decode("utf-8", errors="replace")
data.decode("utf-8", errors="ignore")
```

| 策略 | 行为 | 适用建议 |
| --- | --- | --- |
| `strict` | 遇到错误立即抛异常 | 默认选择，避免悄悄损坏数据 |
| `replace` | 使用替代字符 | 日志展示、尽力预览损坏内容 |
| `ignore` | 直接丢弃非法字节 | 风险高，除非明确允许数据丢失 |

正式导入数据时不要为了“先跑通”就使用 `ignore`，否则原始内容可能被静默删除。

## 十二、UTF-8 BOM 是什么

BOM 是文件开头的特殊字节标记。UTF-8 本身不需要 BOM，但部分旧软件会用 BOM 判断文件编码。

常见选择：

| 场景 | 推荐编码 |
| --- | --- |
| Python、JavaScript、JSON、Markdown 等源码和配置 | `utf-8`，无 BOM |
| 系统内部文本数据 | 通常 `utf-8`，无 BOM |
| 明确提供给旧版 Excel 双击打开的 CSV | 可按交付要求使用 `utf-8-sig` |

本项目的源码和配置必须使用 UTF-8 无 BOM。业务导出的 CSV 如果为了兼容旧版 Excel 使用 `utf-8-sig`，只代表数据文件的交付策略，不代表源码也要带 BOM。

读取可能带 UTF-8 BOM 的外部文本时，可以使用：

```python
with open("external.csv", "r", encoding="utf-8-sig") as file:
    content = file.read()
```

`utf-8-sig` 会在读取时自动移除开头的 UTF-8 BOM。

## 十三、乱码通常是怎样产生的

乱码不是字符“随机坏掉”，而是某一环节用了错误的编码规则：

```text
正确文本
  -> 按编码 A 写成字节
  -> 错误地按编码 B 读取
  -> 得到乱码或解码异常
```

排查顺序：

1. 确认原始文件实际编码。
2. 确认读取代码使用的 `encoding`。
3. 确认终端、编辑器和数据库连接的编码设置。
4. 保留原始文件，不要在乱码状态下反复保存覆盖。
5. 不要靠多次 `.encode().decode()` 碰运气。

看到类似“鍥藉”的文字，通常说明 UTF-8 字节曾被错误地按其他编码解释。

## 十四、系统边界上处理编码

程序内部业务逻辑尽量统一使用 `str`。只在边界上处理字节：

```text
读取文件：bytes -> decode -> str
业务处理：始终使用 str
写入文件：str -> encode -> bytes
网络传输：由 HTTP 库按协议处理，必要时确认 charset
数据库：由驱动处理，连接和字段应统一 Unicode 配置
```

不要让 `bytes` 在业务函数之间无目的地传播，这会增加类型错误和重复编码风险。

## 十五、JSON 与编码

`json.dumps()` 返回 `str`：

```python
import json

payload = {"title": "中文文章"}
text = json.dumps(payload, ensure_ascii=False)

print(type(text))  # <class 'str'>
```

如果需要通过二进制连接发送，再编码：

```python
data = text.encode("utf-8")
```

反过来，收到字节后先解码，再解析 JSON：

```python
payload = json.loads(data.decode("utf-8"))
```

多数成熟 HTTP 库会替你完成这些步骤，但理解边界有助于排查接口乱码。

## 十六、Python 和 JavaScript 对照

浏览器 JavaScript 使用 `TextEncoder` 和 `TextDecoder`：

```js
const encoder = new TextEncoder()
const data = encoder.encode('中文')

const decoder = new TextDecoder('utf-8')
const text = decoder.decode(data)
```

Node.js 常用 `Buffer`：

```js
const data = Buffer.from('中文', 'utf8')
const text = data.toString('utf8')
```

| 操作 | Python | 浏览器 JavaScript | Node.js |
| --- | --- | --- | --- |
| 文本转字节 | `text.encode('utf-8')` | `TextEncoder.encode()` | `Buffer.from(text, 'utf8')` |
| 字节转文本 | `data.decode('utf-8')` | `TextDecoder.decode()` | `buffer.toString('utf8')` |
| 字节类型 | `bytes` | `Uint8Array` | `Buffer` |

## 十七、企业场景：安全读取外部文本

```python
from pathlib import Path


def read_utf8_text(file_path):
    path = Path(file_path)

    if not path.is_file():
        raise FileNotFoundError(f"文件不存在：{path}")

    try:
        return path.read_text(encoding="utf-8-sig")
    except UnicodeDecodeError as error:
        raise ValueError(f"文件不是有效的 UTF-8 文本：{path}") from error
```

这里选择 `utf-8-sig` 是为了兼容“UTF-8 无 BOM”和“UTF-8 带 BOM”两种外部数据文件。项目源码仍然必须保存为 UTF-8 无 BOM。

## 十八、本篇练习

1. 将字符串 `"Python中文"` 编码成 UTF-8 字节，分别打印字符长度和字节长度。
2. 把得到的 `bytes` 解码回 `str`，验证内容一致。
3. 分别用文本模式和二进制模式读取同一个 UTF-8 文件，观察返回类型。
4. 创建一个带 UTF-8 BOM 的测试数据文件，再分别用 `utf-8` 和 `utf-8-sig` 读取，观察开头内容差异。
5. 尝试用错误编码解码字节，并捕获 `UnicodeDecodeError`。

## 本篇小结

1. 字符是人理解的文本单位，字节是存储和传输单位。
2. Python `str` 保存 Unicode 文本，`bytes` 保存原始字节。
3. `str.encode()` 把文本编码成字节，`bytes.decode()` 把字节解码成文本。
4. 编码和解码必须使用匹配的规则，否则会乱码或抛出 `UnicodeDecodeError`。
5. 文本模式自动编码和解码，二进制模式直接读写 `bytes`。
6. 正式数据处理优先使用 `errors="strict"`，不要静默忽略损坏字节。
7. 项目源码使用 UTF-8 无 BOM；`utf-8-sig` 只在明确的数据兼容场景使用。
8. 程序内部尽量统一使用 `str`，只在文件、网络等系统边界处理字节。
