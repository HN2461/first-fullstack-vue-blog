---
title: FastAPI 从 0 到 1 03：Pydantic v2 与数据建模
slug: fastapi-pydantic-v2-data-modeling
summary: 使用 Pydantic v2 定义请求与响应模型，掌握字段约束、嵌套结构、自定义验证、序列化和模型分层。
category: Python应用实例
tags:
  - Python
  - FastAPI
  - Pydantic
  - 数据校验
status: draft
cover:
---

# FastAPI 从 0 到 1 03：Pydantic v2 与数据建模

## Pydantic 解决什么问题

HTTP 请求里的数据不可信。即使前端已经做了表单校验，后端仍必须独立验证：

- 字段是否存在。
- 类型能否转换。
- 长度、范围、格式是否合法。
- 多个字段之间是否满足业务前置条件。
- 响应是否只暴露允许公开的字段。

Pydantic 模型是接口数据契约，不是数据库表，也不是业务权限规则的替代品。

## 第一个模型

```python
from pydantic import BaseModel, Field


class ArticleCreate(BaseModel):
    title: str = Field(min_length=1, max_length=200)
    slug: str = Field(
        min_length=1,
        max_length=220,
        pattern=r'^[a-z0-9]+(?:-[a-z0-9]+)*$'
    )
    content: str = Field(min_length=1, max_length=100_000)
    category_id: int | None = Field(default=None, gt=0)
    tag_ids: list[int] = Field(default_factory=list, max_length=20)
```

使用 `default_factory` 创建列表，避免把可变对象作为共享默认值的坏习惯。

验证数据：

```python
payload = ArticleCreate.model_validate({
    'title': 'FastAPI 数据校验',
    'slug': 'fastapi-validation',
    'content': '正文'
})

print(payload.title)
print(payload.model_dump())
print(payload.model_dump_json())
```

Pydantic v2 高频 API：

- `model_validate()`：从字典或对象验证并创建模型。
- `model_dump()`：转成 Python 字典。
- `model_dump_json()`：转成 JSON 字符串。
- `model_copy()`：复制模型并可更新字段。
- `model_json_schema()`：生成 JSON Schema。

不要继续使用 v1 的 `.dict()`、`.json()`、`parse_obj()` 作为新代码基线。

## 必填、可选、可为空

```python
class Example(BaseModel):
    required_text: str
    nullable_but_required: str | None
    optional_text: str | None = None
    text_with_default: str = 'default'
```

- `required_text`：必须传，不能为 `null`。
- `nullable_but_required`：必须出现，但值可为 `null`。
- `optional_text`：可以不传，也可以为 `null`。
- `text_with_default`：不传时使用默认值。

这一区别对 PATCH 更新非常重要。

## 创建、更新、读取模型分开

```python
from datetime import datetime

from pydantic import ConfigDict


class ArticleCreate(BaseModel):
    title: str = Field(min_length=1, max_length=200)
    slug: str = Field(pattern=r'^[a-z0-9]+(?:-[a-z0-9]+)*$')
    content: str = Field(min_length=1)


class ArticleUpdate(BaseModel):
    title: str | None = Field(default=None, min_length=1, max_length=200)
    content: str | None = Field(default=None, min_length=1)


class ArticleRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    title: str
    slug: str
    content: str
    status: str
    created_at: datetime
    updated_at: datetime
```

必须分开的原因：

- 创建时不能让客户端写 `id`、`created_at`、`author_id`。
- 更新时多数属性可不传。
- 响应模型可以增加计算字段，也可以隐藏内部字段。
- 管理员响应和公开响应可能暴露不同字段。

## PATCH 与 `exclude_unset`

```python
payload = ArticleUpdate(title='新标题')
changes = payload.model_dump(exclude_unset=True)
```

结果只包含客户端实际传入的字段。若不使用 `exclude_unset=True`，未传字段也会以默认 `None` 出现，可能误把数据库值清空。

还需区分：

- `exclude_unset=True`：排除没有传的字段。
- `exclude_none=True`：排除值为 `None` 的字段。
- `exclude_defaults=True`：排除等于默认值的字段。

如果业务允许“显式传 null 清空字段”，不能简单使用 `exclude_none=True`。

## 字段验证器

```python
from pydantic import field_validator


class UserRegister(BaseModel):
    email: str
    display_name: str = Field(min_length=2, max_length=50)
    password: str = Field(min_length=12, max_length=128)

    @field_validator('email', mode='before')
    @classmethod
    def normalize_email(cls, value: str) -> str:
        return value.strip().lower()

    @field_validator('display_name')
    @classmethod
    def validate_display_name(cls, value: str) -> str:
        cleaned = value.strip()
        if not cleaned:
            raise ValueError('显示名称不能只包含空白字符')
        return cleaned
```

`mode='before'` 在类型解析前运行，适合清洗原始输入；默认 after 模式在字段完成类型验证后运行。

不要在验证器中查数据库、调用外部接口或发送消息。验证器应快速、确定、无副作用；需要 I/O 的业务校验放在 Service。

## 模型级验证器

```python
from typing import Self

from pydantic import model_validator


class PasswordChange(BaseModel):
    new_password: str = Field(min_length=12, max_length=128)
    confirm_password: str

    @model_validator(mode='after')
    def passwords_match(self) -> Self:
        if self.new_password != self.confirm_password:
            raise ValueError('两次输入的密码不一致')
        return self
```

模型级验证适合字段间的结构关系，例如开始时间必须早于结束时间。涉及“当前用户是否有权限修改该对象”仍属于业务授权，不应放进 Schema。

## 嵌套模型

```python
class AuthorBrief(BaseModel):
    id: int
    display_name: str


class TagRead(BaseModel):
    id: int
    name: str


class ArticleDetail(BaseModel):
    id: int
    title: str
    author: AuthorBrief
    tags: list[TagRead]
```

嵌套模型能明确响应结构，但 ORM 关联如果没有预加载，序列化时可能触发额外查询或异步懒加载错误。数据库章节会处理 eager loading。

## 枚举与 Literal

```python
from enum import StrEnum
from typing import Literal


class ArticleStatus(StrEnum):
    DRAFT = 'draft'
    PUBLISHED = 'published'
    ARCHIVED = 'archived'


class ArticleSort(BaseModel):
    field: Literal['created_at', 'updated_at', 'title'] = 'created_at'
    direction: Literal['asc', 'desc'] = 'desc'
```

跨多处复用的领域值使用枚举；只在单个局部模型使用的有限值可用 `Literal`。

## 常用专用类型

```python
from datetime import datetime
from decimal import Decimal
from uuid import UUID

from pydantic import AnyHttpUrl, EmailStr


class Profile(BaseModel):
    user_id: UUID
    email: EmailStr
    website: AnyHttpUrl | None = None
    balance: Decimal = Decimal('0.00')
    created_at: datetime
```

金额优先使用 `Decimal` 或数据库最小货币单位整数，不使用浮点数直接计算财务数据。

## 别名和前后端字段

```python
from pydantic import AliasChoices, ConfigDict


class UserInput(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    display_name: str = Field(
        validation_alias=AliasChoices('display_name', 'displayName'),
        serialization_alias='displayName'
    )
```

字段风格应在团队契约中统一。别名适合兼容或明确的序列化策略，不要在每个模型随意混用两套命名。

## 严格模式与类型转换

Pydantic 默认会做合理转换，例如字符串 `'12'` 可能转成整数。对不能容忍隐式转换的字段可以使用严格类型或严格配置。

```python
from pydantic import ConfigDict


class StrictPayload(BaseModel):
    model_config = ConfigDict(strict=True)

    count: int
    enabled: bool
```

是否启用全局严格模式取决于接口契约。不要为了“严格”导致 HTML 表单、查询字符串等天然字符串输入无法正常使用。

## Pydantic 验证不是业务完整性

Schema 可以验证 slug 格式，却不能仅凭 Schema 保证：

- slug 在数据库中唯一。
- 当前用户拥有指定 category_id。
- 状态能从 published 合法转换到 draft。
- tag_ids 全部存在且当前用户可使用。

这些规则需要 Service 查询数据库，并由数据库约束提供并发场景的最终保证。

## 本章练习

创建以下模型：

1. `UserRegister`：邮箱、显示名、密码、确认密码。
2. `ArticleCreate`：标题、slug、正文、分类、标签。
3. `ArticleUpdate`：所有可编辑字段可选，并支持显式清空分类。
4. `ArticleRead`：包含作者摘要、标签列表和时间字段。
5. 验证 slug、密码确认、空白标题和标签数量上限。

## 本章检查

- 能解释 Schema 与数据库 Model 的差别。
- 能正确处理必填、可选和可为空。
- PATCH 更新会使用 `exclude_unset=True`。
- 不在 Pydantic 验证器中执行数据库 I/O。

