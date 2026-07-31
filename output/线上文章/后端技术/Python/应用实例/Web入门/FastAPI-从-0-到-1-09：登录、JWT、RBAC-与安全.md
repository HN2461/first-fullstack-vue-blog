---
title: "FastAPI 从 0 到 1 09：登录、JWT、RBAC 与安全"
slug: "fastapi-authentication-jwt-rbac-security"
summary: "在现有文章项目中加入 User 表、Argon2 密码哈希、登录 JWT、当前用户依赖和文章归属，再理解 RBAC、令牌撤销与安全边界。"
category: "Web入门"
tags:
  - "Python"
  - "FastAPI"
  - "JWT"
  - "RBAC"
  - "安全"
status: "draft"
sortOrder: 100
cover: ""
originalId: "6a6b57a2fca6347974f5d1a4"
originalSlug: "fastapi-authentication-jwt-rbac-security"
originalStatus: "published"
exportedAt: "2026-07-31T03:42:38.792Z"
---
# FastAPI 从 0 到 1 09：登录、JWT、RBAC 与安全

这一章容易被一堆安全名词淹没。先确定本章真正跑通的业务闭环：

```text
注册用户
  -> 密码只保存哈希
  -> 账号密码登录
  -> 获得短时 access token
  -> Bearer token 获取当前用户
  -> 创建文章时由后端写 author_id
  -> 只能修改自己的文章
```

完成这条链后，再学习 RBAC、refresh token 和撤销机制。不要先复制一个“企业 JWT 模板”却连身份从哪里进入文章查询都说不清。

## 认证、授权、对象权限、状态权限

四层不能混成一个 `is_admin`：

| 层次 | 回答的问题 | 例子 |
| --- | --- | --- |
| 认证 | 你是谁 | JWT 对应用户 7 |
| 功能授权 | 你能做什么 | 是否有 `article:publish` |
| 对象权限 | 你能操作哪一条 | 只能改自己的文章 |
| 状态权限 | 当前状态能否执行 | 已发布文章不能直接改正文 |

JWT 只帮助携带和验证身份声明，不等于完整用户、会话和权限系统。

## 第一步：安装认证依赖

```powershell
python -m pip install pyjwt "pwdlib[argon2]" python-multipart email-validator
```

- PyJWT：签发和验证 JWT。
- pwdlib + Argon2：安全地哈希密码。
- python-multipart：解析 OAuth2 登录表单。
- email-validator：支持 Pydantic EmailStr。

密码不能用 MD5 或普通 SHA256 直接哈希。密码哈希算法需要盐和专门的计算成本来提高暴力破解难度。

## 第二步：扩展 Settings

在 `.env` 加入开发值：

```dotenv
JWT_SECRET_KEY=replace-this-development-secret-with-at-least-32-characters
JWT_ALGORITHM=HS256
JWT_ISSUER=beginner-article-api
JWT_AUDIENCE=beginner-article-client
ACCESS_TOKEN_EXPIRE_MINUTES=30
```

在 `Settings` 类增加：

```python
jwt_secret_key: str = Field(min_length=32)
jwt_algorithm: Literal['HS256'] = 'HS256'
jwt_issuer: str = 'beginner-article-api'
jwt_audience: str = 'beginner-article-client'
access_token_expire_minutes: int = Field(default=30, gt=0, le=1440)
```

生产 secret 必须由安全随机源生成并放在 Secret 管理系统，不能复制教程字符串，也不能提交 `.env`。

本教程先固定 HS256，避免接受令牌头随意指定算法。生产若使用非对称算法，还要设计密钥轮换和 `kid`。

## 第三步：完整 User Model

创建 `app/models/user.py`：

```python
from datetime import datetime
from enum import StrEnum

from sqlalchemy import DateTime, Integer, String, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class UserStatus(StrEnum):
    ACTIVE = 'active'
    DISABLED = 'disabled'


class User(Base):
    __tablename__ = 'users'

    id: Mapped[int] = mapped_column(primary_key=True)
    email: Mapped[str] = mapped_column(
        String(254),
        unique=True,
        nullable=False
    )
    display_name: Mapped[str] = mapped_column(
        String(50),
        nullable=False
    )
    password_hash: Mapped[str] = mapped_column(
        String(255),
        nullable=False
    )
    status: Mapped[str] = mapped_column(
        String(20),
        default=UserStatus.ACTIVE,
        server_default=UserStatus.ACTIVE,
        nullable=False
    )
    token_version: Mapped[int] = mapped_column(
        Integer,
        default=1,
        server_default='1',
        nullable=False
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False
    )
    articles: Mapped[list['Article']] = relationship(
        back_populates='author'
    )
```

关键字段：

- `password_hash` 保存不可逆密码哈希，不保存 password。
- `status` 用于立即禁用用户。
- `token_version` 增加后，可以让该用户已签发的旧 token 全部失效。
- `articles` 是 ORM 关系，不是 users 表中的数组列。

## 第四步：给 Article 增加作者

`app/models/article.py` 增加导入：

```python
from sqlalchemy import ForeignKey
from sqlalchemy.orm import relationship
```

在 Article 类中增加：

```python
author_id: Mapped[int] = mapped_column(
    ForeignKey('users.id', ondelete='RESTRICT'),
    nullable=False,
    index=True
)
author: Mapped['User'] = relationship(
    back_populates='articles'
)
```

在 `app/models/__init__.py` 中同时导入：

```python
from app.models.article import Article
from app.models.user import User

__all__ = ['Article', 'User']
```

### 迁移已有文章的现实问题

articles 表已经有数据时，不能直接增加没有默认值的非空 author_id。可靠步骤是：

1. 先创建 users 表。
2. 创建一个明确的迁移用户。
3. author_id 先允许 NULL。
4. 回填已有文章作者。
5. 验证没有 NULL。
6. 再改为 NOT NULL 并增加外键。

学习数据库没有保留价值时，可以先删除文章再执行简化迁移；生产绝不能用删除数据代替迁移设计。

生成并审查：

```powershell
alembic revision --autogenerate -m "create users and add article author"
alembic upgrade head
```

## 第五步：完整认证 Schema

在 `app/schemas.py` 增加：

```python
from pydantic import EmailStr, field_validator


class UserRegister(BaseModel):
    email: EmailStr
    display_name: str = Field(min_length=2, max_length=50)
    password: str = Field(min_length=12, max_length=128)

    @field_validator('email', mode='before')
    @classmethod
    def normalize_email(cls, value: str) -> str:
        return value.strip().lower()

    @field_validator('display_name')
    @classmethod
    def clean_display_name(cls, value: str) -> str:
        cleaned = value.strip()
        if not cleaned:
            raise ValueError('显示名称不能只包含空白字符')
        return cleaned


class UserRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    email: EmailStr
    display_name: str
    status: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = 'bearer'
```

响应模型没有 `password_hash`。即使数据库 User 对象带有该字段，也不能通过正常用户响应暴露。

后端仍需对 password 做长度上限，避免攻击者提交超大字符串消耗哈希计算资源。

## 第六步：完整密码和 JWT 工具

创建 `app/core/security.py`：

```python
from datetime import UTC, datetime, timedelta
from uuid import uuid4

import jwt
from pwdlib import PasswordHash

from app.core.config import get_settings

password_hash = PasswordHash.recommended()


def hash_password(password: str) -> str:
    return password_hash.hash(password)


def verify_password(password: str, hashed_password: str) -> bool:
    return password_hash.verify(password, hashed_password)


def create_access_token(
    *,
    subject: str,
    token_version: int
) -> str:
    settings = get_settings()
    now = datetime.now(UTC)
    payload = {
        'sub': subject,
        'type': 'access',
        'iat': now,
        'nbf': now,
        'exp': now + timedelta(
            minutes=settings.access_token_expire_minutes
        ),
        'jti': uuid4().hex,
        'ver': token_version,
        'iss': settings.jwt_issuer,
        'aud': settings.jwt_audience
    }
    return jwt.encode(
        payload,
        settings.jwt_secret_key,
        algorithm=settings.jwt_algorithm
    )


def decode_access_token(token: str) -> dict:
    settings = get_settings()
    payload = jwt.decode(
        token,
        settings.jwt_secret_key,
        algorithms=[settings.jwt_algorithm],
        issuer=settings.jwt_issuer,
        audience=settings.jwt_audience,
        options={
            'require': ['sub', 'type', 'exp', 'iat', 'jti', 'ver']
        }
    )
    if payload.get('type') != 'access':
        raise jwt.InvalidTokenError('令牌类型错误')
    return payload
```

## JWT payload 字段解释

JWT 通常是签名，不是加密。拿到 token 的客户端可以读取 payload，所以不能放密码、身份证、手机号等敏感数据。

| 字段 | 含义 |
| --- | --- |
| `sub` | subject，当前用户 ID |
| `type` | access，防止其他令牌混用 |
| `iat` | 签发时间 |
| `nbf` | 在此时间前不可使用 |
| `exp` | 过期时间 |
| `jti` | 本令牌唯一 ID |
| `ver` | 用户令牌版本 |
| `iss` | 签发方 |
| `aud` | 预期接收方 |

验证时必须固定算法列表并检查 issuer、audience 和必要字段。不能信任令牌头自报的任意算法。

## 第七步：User Repository

创建 `app/repositories/user_repository.py`：

```python
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.user import User


async def get_by_id(
    session: AsyncSession,
    user_id: int
) -> User | None:
    return await session.get(User, user_id)


async def get_by_email(
    session: AsyncSession,
    email: str
) -> User | None:
    return await session.scalar(
        select(User).where(User.email == email)
    )


def add(session: AsyncSession, user: User) -> None:
    session.add(user)
```

邮箱在 Schema 中规范化为小写，数据库中仍必须有唯一约束处理并发注册。更复杂系统可使用 PostgreSQL citext 或规范化列统一大小写语义。

## 第八步：认证业务 Service

创建 `app/auth_service.py`：

```python
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import (
    create_access_token,
    hash_password,
    verify_password
)
from app.errors import AppError, ConflictError
from app.models.user import User, UserStatus
from app.repositories import user_repository
from app.schemas import TokenResponse, UserRegister


class InvalidCredentialsError(AppError):
    code = 'AUTH_INVALID_CREDENTIALS'
    status_code = 401


class UserDisabledError(AppError):
    code = 'AUTH_USER_DISABLED'
    status_code = 403


async def register_user(
    session: AsyncSession,
    payload: UserRegister
) -> User:
    user = User(
        email=str(payload.email),
        display_name=payload.display_name,
        password_hash=hash_password(payload.password)
    )
    user_repository.add(session, user)

    try:
        await session.commit()
    except IntegrityError as exc:
        await session.rollback()
        raise ConflictError('邮箱已注册') from None

    await session.refresh(user)
    return user


async def login_user(
    session: AsyncSession,
    *,
    email: str,
    password: str
) -> TokenResponse:
    normalized_email = email.strip().lower()
    user = await user_repository.get_by_email(
        session,
        normalized_email
    )

    if user is None or not verify_password(
        password,
        user.password_hash
    ):
        raise InvalidCredentialsError('邮箱或密码错误')

    if user.status != UserStatus.ACTIVE:
        raise UserDisabledError('账号不可用')

    return TokenResponse(
        access_token=create_access_token(
            subject=str(user.id),
            token_version=user.token_version
        )
    )
```

### 为什么账号不存在和密码错误使用同一句话

如果分别返回“账号不存在”和“密码错误”，攻击者可以批量确认哪些邮箱已注册。统一消息减少账号枚举信息。

### 注册为什么仍捕获数据库冲突

即使注册前查过邮箱，两个并发请求仍可能同时通过。users.email 唯一约束才是最终保证。

生产代码应确认具体约束名再转换，不应把所有 IntegrityError 都当邮箱重复。本例只有当前唯一冲突，为了聚焦认证先简化；完成练习时应按第 08 章方式识别约束。

## 第九步：当前用户依赖

创建 `app/deps.py`：

```python
from typing import Annotated

import jwt
from fastapi import Depends
from fastapi.security import OAuth2PasswordBearer

from app.auth_service import InvalidCredentialsError
from app.core.security import decode_access_token
from app.db.session import DbSessionDep
from app.models.user import User, UserStatus
from app.repositories import user_repository

oauth2_scheme = OAuth2PasswordBearer(
    tokenUrl='/auth/login'
)


async def get_current_user(
    session: DbSessionDep,
    token: Annotated[str, Depends(oauth2_scheme)]
) -> User:
    try:
        payload = decode_access_token(token)
        user_id = int(payload['sub'])
        token_version = int(payload['ver'])
    except (jwt.InvalidTokenError, KeyError, TypeError, ValueError):
        raise InvalidCredentialsError('登录凭证无效或已过期') from None

    user = await user_repository.get_by_id(session, user_id)
    if user is None or user.status != UserStatus.ACTIVE:
        raise InvalidCredentialsError('登录凭证无效或已过期')
    if token_version != user.token_version:
        raise InvalidCredentialsError('登录凭证已失效')
    return user


CurrentUserDep = Annotated[User, Depends(get_current_user)]
```

`OAuth2PasswordBearer` 不会自动实现登录。它负责：

- 告诉 OpenAPI token URL 在哪里。
- 从 `Authorization: Bearer <token>` 读取 token。
- 没有 Bearer token 时阻止请求。

即使 JWT 签名有效，仍查询用户，因为用户可能已禁用、删除或 token_version 已变化。

## 第十步：认证 Router

创建 `app/routers/auth.py`：

```python
from typing import Annotated

from fastapi import APIRouter, Depends, status
from fastapi.security import OAuth2PasswordRequestForm

from app import auth_service
from app.db.session import DbSessionDep
from app.deps import CurrentUserDep
from app.schemas import TokenResponse, UserRead, UserRegister

router = APIRouter(prefix='/auth', tags=['auth'])


@router.post(
    '/register',
    response_model=UserRead,
    status_code=status.HTTP_201_CREATED
)
async def register(
    payload: UserRegister,
    session: DbSessionDep
):
    return await auth_service.register_user(session, payload)


@router.post('/login', response_model=TokenResponse)
async def login(
    session: DbSessionDep,
    form: Annotated[OAuth2PasswordRequestForm, Depends()]
):
    return await auth_service.login_user(
        session,
        email=form.username,
        password=form.password
    )


@router.get('/me', response_model=UserRead)
async def read_current_user(current_user: CurrentUserDep):
    return current_user
```

登录字段为什么叫 username？OAuth2 password form 规范使用 `username` 和 `password`。本项目把 email 填在 username 中。

登录请求是 `application/x-www-form-urlencoded`，不是 JSON。Swagger UI 的 Authorize 按钮需要这种兼容形式。

在 `main.py` 导入并挂载：

```python
from app.routers.auth import router as auth_router

application.include_router(auth_router)
```

## 第十一步：文章创建不接受 author_id

创建路由改为：

```python
from app.deps import CurrentUserDep


@router.post(
    '',
    response_model=ArticleRead,
    status_code=status.HTTP_201_CREATED
)
async def create_article(
    payload: ArticleCreate,
    session: DbSessionDep,
    current_user: CurrentUserDep
):
    return await services.create_article(
        session,
        payload,
        author_id=current_user.id
    )
```

Service 改为接收服务端确认的 author_id：

```python
async def create_article(
    session: AsyncSession,
    payload: ArticleCreate,
    *,
    author_id: int
) -> Article:
    article = Article(
        **payload.model_dump(),
        author_id=author_id,
        status=ArticleStatus.DRAFT
    )
    article_repository.add(session, article)
    await session.commit()
    await session.refresh(article)
    return article
```

ArticleCreate 中不能有 author_id。否则攻击者可以提交其他用户 ID，把文章伪造成别人创建。

## 第十二步：把对象权限写进查询

Repository 增加：

```python
async def get_owned_article(
    session: AsyncSession,
    *,
    article_id: int,
    author_id: int
) -> Article | None:
    return await session.scalar(
        select(Article).where(
            Article.id == article_id,
            Article.author_id == author_id
        )
    )
```

修改 Service 使用这个查询：

```python
article = await article_repository.get_owned_article(
    session,
    article_id=article_id,
    author_id=current_user_id
)
if article is None:
    raise ArticleNotFoundError('文章不存在')
```

为什么查询中直接加 author_id？

```text
按 ID 查出任意文章
  -> 再判断作者
```

很容易在某个接口忘记第二步。把数据范围加入查询，默认就拿不到别人的文章。

无权查看他人草稿时返回 404，可以避免泄露资源是否存在。项目应统一策略；管理审核接口则可以按权限访问更大范围。

## 完整验证流程

1. 执行迁移并启动 API。
2. POST `/auth/register` 注册用户，密码至少 12 位。
3. POST `/auth/login`，username 填邮箱，获得 access_token。
4. 在 `/docs` 点击 Authorize，填入 token。
5. GET `/auth/me`，确认返回当前用户且没有 password_hash。
6. 登录状态下创建文章，确认 author_id 来自后端。
7. 注册第二个用户，尝试修改第一人的文章，得到 404。
8. 把第一个用户 status 改成 disabled，旧 token 再调用 `/auth/me` 应失败。

数据库中检查 password_hash 应是 Argon2 哈希，不能看到注册时明文密码。

## RBAC 是什么

对象归属解决“只能改自己的文章”，但管理员、审核员还需要功能权限。RBAC 常见表：

```text
users
roles
permissions
user_roles
role_permissions
```

权限使用稳定代码：

```text
article:create
article:update_own
article:review
article:publish
user:manage
```

角色只是权限集合，例如 reviewer 拥有 review 和 publish。不要在每个路由散落：

```python
if current_user.role == 'admin':
```

这样以后新增角色就要修改大量业务代码。

## 权限依赖工厂

下面是局部示例。它假设 CurrentUser 已加载 permission_codes：

```python
from collections.abc import Callable

from app.errors import AppError


class ForbiddenError(AppError):
    code = 'FORBIDDEN'
    status_code = 403


def require_permissions(*required: str) -> Callable:
    async def checker(
        current_user: CurrentUserDep
    ) -> User:
        granted = set(current_user.permission_codes)
        if not set(required).issubset(granted):
            raise ForbiddenError('没有执行此操作的权限')
        return current_user

    return checker
```

路由使用：

```python
@router.post(
    '/{article_id}/publish',
    dependencies=[
        Depends(require_permissions('article:publish'))
    ]
)
async def publish_article(article_id: int):
    raise NotImplementedError('发布事务由第 14 章实现')
```

这只解决功能权限。发布 Service 仍要检查文章状态和对象范围。

权限可缓存，但角色或权限变更后必须有失效策略。不能让被撤权用户长期沿用旧缓存。

## Access Token 与 Refresh Token

本章可运行版本只签发短时 access token。生产中频繁登录体验不好，通常增加 refresh token：

| 类型 | 时效 | 用途 |
| --- | --- | --- |
| access token | 短，例 15 到 30 分钟 | 调用普通 API |
| refresh token | 较长 | 只用于换新 access token |

refresh token 不能只是“另一个过期更久的 JWT”。可靠方案通常需要服务端记录：

```text
jti 哈希、用户、设备、令牌家族、过期时间、撤销时间
```

每次刷新做旋转：

1. 验证旧 refresh token。
2. 将旧 token 标记已使用。
3. 签发新的 access + refresh。
4. 发现旧 token 再次使用时，撤销整个令牌家族。

这是独立的会话安全功能，需要表结构、事务和并发测试。不能只复制几十行 JWT 代码就宣称已支持安全刷新。

## 注销和撤销

常见方案：

- `token_version + 1`：改密或全端退出，旧 token 全部失效。
- jti 黑名单：撤销单个 access token，Redis 保存到自然过期。
- 服务端 Session：客户端只持随机 session ID，状态完全在服务端。
- refresh token 记录：撤销设备或令牌家族。

本章当前用户依赖已经检查 token_version。实现全端退出时，数据库将 token_version 加一即可让旧 access token 下次请求失败。

## 前端把 token 放哪里

两类常见方案：

### Authorization Bearer

前端保存 access token，每次请求带：

```http
Authorization: Bearer eyJ...
```

若放 localStorage，要重点防 XSS，因为恶意脚本能读取。

### HttpOnly Cookie

JavaScript 不能读取 token，可降低脚本直接窃取风险，但浏览器会自动携带 Cookie，因此需要正确配置 SameSite、Secure 并处理 CSRF。

没有对所有系统绝对最优的方案。要根据前后端域名、移动端、SSO、XSS/CSRF 威胁和团队安全规范选择。

## 安全清单

- 全站 HTTPS。
- 密码、token、Cookie、API key 不进日志。
- 登录、注册、密码重置要限流。
- 账号不存在和密码错误不做可枚举区分。
- JWT 固定算法并验证 issuer、audience、type、exp。
- 用户禁用和 token_version 每次认证都检查。
- author_id、角色和状态不接受客户端任意指定。
- 后端做功能权限、对象范围和状态规则，前端隐藏按钮不是权限控制。
- 管理操作写审计日志。
- Secret 不进代码、Git 和镜像层。

## 常见错误

### Swagger Authorize 后仍 401

检查 token 是否只粘贴了值。不同 Swagger 版本可能自动添加 Bearer，不要重复写成 `Bearer Bearer ...`。再检查 exp、issuer、audience 和服务端 secret。

### 登录接口提交 JSON 得到 422

OAuth2PasswordRequestForm 需要表单，不是 JSON。在 `/docs` 使用对应输入框，email 填 username。

### JWT 能解码却不能访问

能读取 payload 不代表签名和声明验证通过。还要检查用户状态、token_version 和 token 类型。

### 明文密码出现在数据库或日志

立即停止并修复。数据库只保存 hash_password 结果；请求体、异常、审计和调试日志都不能记录 password。

### 普通用户能改别人的文章

检查 Repository 查询是否同时包含 article.id 和 author_id，不能只依赖前端不显示入口。

### 禁用用户旧 token 仍可用

当前用户依赖必须每次确认用户状态，或使用有明确失效策略的短时缓存。只验证 JWT 签名不够。

## Express 对照：JWT 中间件、RBAC 与对象权限

FastAPI 用 `Depends(get_current_user)` 生成当前用户；Express 通常用认证中间件把结果挂到 `req.user`。下面示例使用你当前栈中的 `jsonwebtoken`：

```js
import jwt from 'jsonwebtoken'

export async function authenticate(req, res, next) {
  const authorization = req.get('Authorization') ?? ''
  const [scheme, token] = authorization.split(' ')
  if (scheme !== 'Bearer' || !token) {
    return res.status(401).json({ code: 'UNAUTHENTICATED' })
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET_KEY, {
      algorithms: ['HS256'],
      issuer: 'knowledge-api',
      audience: 'knowledge-web'
    })
    const user = await User.findById(payload.sub).lean()
    if (!user || !user.isActive || user.tokenVersion !== payload.ver) {
      return res.status(401).json({ code: 'TOKEN_INVALID' })
    }
    req.user = user
    return next()
  } catch {
    return res.status(401).json({ code: 'TOKEN_INVALID' })
  }
}

export function requirePermission(permission) {
  return (req, res, next) => {
    if (!req.user.permissions.includes(permission)) {
      return res.status(403).json({ code: 'FORBIDDEN' })
    }
    return next()
  }
}
```

对象权限不要只在 Router 中比较一次 ID，最好把数据范围写进查询：

```js
const article = await Article.findOne({
  _id: req.params.id,
  authorId: req.user._id
})
```

这样普通用户无法先查到别人的文章再绕过后续判断。管理员需要更大数据范围时，由 Service 根据权限构造不同 filter，而不是接受客户端传入任意 `authorId`。

## 本章动手改

1. 给 users.email 唯一约束显式命名，只转换该约束的注册冲突。
2. 实现全端退出：token_version 加一，并测试旧 token 失效。
3. 增加 article:update_own 和 article:publish 权限表结构。
4. 实现 reviewer 发布待审核文章，普通作者不能发布。
5. 覆盖 401、403、404 和并发重复注册测试。

## 本章完成检查

- 数据库没有明文密码，UserRead 不含 password_hash。
- 登录错误不泄露账号是否存在。
- JWT 固定算法并验证必要声明。
- 当前用户依赖检查用户状态和 token_version。
- 创建文章的 author_id 只来自认证用户。
- 修改文章查询包含对象归属条件。
- 能解释 access、refresh、RBAC 和对象权限不是同一概念。

下一章开始接触文件、外部 HTTP 和 Redis。这些都是基础设施能力，必须在已有认证和数据边界上使用，不能让缓存或对象存储绕过权限。
