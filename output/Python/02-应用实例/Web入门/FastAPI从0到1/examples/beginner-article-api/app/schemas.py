"""接口输入和输出的数据形状。

这一阶段还没有数据库，因此文章 ID 和创建时间由内存仓库生成。
Schema 只负责校验接口数据，不负责判断文章是否存在等业务规则。
"""

from datetime import datetime

from pydantic import BaseModel, Field


class ArticleCreate(BaseModel):
    """创建文章时允许客户端提交的字段。"""

    title: str = Field(min_length=1, max_length=100)
    content: str = Field(min_length=1, max_length=10_000)
    summary: str | None = Field(default=None, max_length=200)


class ArticleUpdate(BaseModel):
    """更新文章时允许客户端提交的字段，未提交的字段保持原值。"""

    title: str | None = Field(default=None, min_length=1, max_length=100)
    content: str | None = Field(default=None, min_length=1, max_length=10_000)
    summary: str | None = Field(default=None, max_length=200)


class ArticleRead(BaseModel):
    """服务端返回给客户端的完整文章。"""

    id: int
    title: str
    content: str
    summary: str | None
    created_at: datetime


class ArticleList(BaseModel):
    """文章列表响应，同时返回当前结果数量。"""

    items: list[ArticleRead]
    total: int
