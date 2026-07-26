---
title: FastAPI 从 0 到 1 08：登录、JWT、RBAC 与安全
slug: fastapi-authentication-jwt-rbac-security
summary: 实现密码哈希、OAuth2 Bearer、访问令牌、刷新令牌、当前用户依赖、角色权限和对象级授权。
category: Python应用实例
tags:
  - Python
  - FastAPI
  - JWT
  - RBAC
  - 安全
status: draft
cover:
---

# FastAPI 从 0 到 1 08：登录、JWT、RBAC 与安全

## 认证和授权不是一回事

- 认证 Authentication：你是谁。
- 授权 Authorization：你能做什么。

典型链路：

```text
账号密码登录
  -> 校验密码哈希
  -> 签发访问令牌/刷新令牌
  -> 客户端携带访问令牌
  -> 后端解析 sub、exp、jti 等声明
  -> 查询并确认用户仍有效
  -> 检查角色、权限和资源归属
```

JWT 只是令牌格式，不等于用户系统、会话撤销或权限系统。

## 安装认证依赖

```powershell
python -m pip install pyjwt "pwdlib[argon2]" python-multipart email-validator
```

密码必须使用专用密码哈希算法，如 Argon2。不能使用 MD5、SHA256 直接哈希，也不能加密后可逆存储原密码。

## 密码哈希

```python
# app/core/security.py
from pwdlib import PasswordHash

password_hash = PasswordHash.recommended()


def hash_password(password: str) -> str:
    return password_hash.hash(password)


def verify_password(password: str, hashed_password: str) -> bool:
    return password_hash.verify(password, hashed_password)
```

数据库只保存哈希。日志、异常、审计记录、埋点中都不能保存明文密码。

密码规则需要平衡安全与可用性：设置合理最小长度、允许密码管理器生成长密码、检查常见泄露密码；不要依赖复杂但可预测的“必须一个符号一个大写字母”规则作为唯一保障。

## 用户模型关键字段

```text
id
email / username（唯一）
password_hash
status（active / disabled / locked）
token_version
last_login_at
created_at / updated_at
```

邮箱规范化后再保存，并由数据库唯一索引保证唯一。PostgreSQL 可考虑 `citext` 或规范化列处理大小写唯一性。

## 创建访问令牌

```python
from datetime import UTC, datetime, timedelta
from uuid import uuid4

import jwt


def create_access_token(*, subject: str, token_version: int) -> str:
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
```

JWT 中不要放密码、身份证、手机号等敏感数据。JWT 通常只是签名而非加密，客户端可以读取 payload。

验证时必须固定允许算法并验证 issuer/audience：

```python
def decode_token(token: str) -> dict:
    settings = get_settings()
    return jwt.decode(
        token,
        settings.jwt_secret_key,
        algorithms=[settings.jwt_algorithm],
        issuer=settings.jwt_issuer,
        audience=settings.jwt_audience,
        options={'require': ['sub', 'type', 'exp', 'iat', 'jti']}
    )
```

不能信任令牌头里自行声明的算法。

## OAuth2 Bearer 依赖

```python
from fastapi.security import OAuth2PasswordBearer

oauth2_scheme = OAuth2PasswordBearer(tokenUrl='/api/v1/auth/login')
```

`tokenUrl` 用于 OpenAPI 描述，不会自动实现登录接口。

当前用户依赖：

```python
from typing import Annotated

from fastapi import Depends, HTTPException, status
from jwt import InvalidTokenError


async def get_current_user(
    token: Annotated[str, Depends(oauth2_scheme)],
    session: DbSessionDep
) -> User:
    credentials_error = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail='登录凭证无效或已过期',
        headers={'WWW-Authenticate': 'Bearer'}
    )

    try:
        payload = decode_token(token)
        if payload.get('type') != 'access':
            raise credentials_error
        user_id = int(payload['sub'])
    except (InvalidTokenError, KeyError, TypeError, ValueError):
        raise credentials_error from None

    user = await user_repository.get_by_id(session, user_id)
    if user is None or user.status != UserStatus.ACTIVE:
        raise credentials_error
    if payload.get('ver') != user.token_version:
        raise credentials_error
    return user
```

即使 JWT 签名有效，也应检查用户是否已禁用、删除或 token_version 已变化。

## 登录接口

```python
from fastapi.security import OAuth2PasswordRequestForm


@router.post('/login', response_model=TokenResponse)
async def login(
    form: Annotated[OAuth2PasswordRequestForm, Depends()],
    session: DbSessionDep
):
    user = await user_repository.get_by_email(
        session,
        form.username.strip().lower()
    )
    if user is None or not verify_password(form.password, user.password_hash):
        # 对账号不存在和密码错误返回相同消息，减少账号枚举风险。
        raise HTTPException(status_code=401, detail='账号或密码错误')
    if user.status != UserStatus.ACTIVE:
        raise HTTPException(status_code=403, detail='账号不可用')

    return TokenResponse(
        access_token=create_access_token(
            subject=str(user.id),
            token_version=user.token_version
        ),
        token_type='bearer'
    )
```

登录接口必须限流，并记录失败统计但不记录密码。

## Access Token 与 Refresh Token

- Access Token：短时效，访问 API。
- Refresh Token：较长时效，只用于换取新访问令牌。

生产方案常把刷新令牌做旋转：每次刷新签发新令牌并废止旧令牌；检测旧令牌被重复使用时，撤销整个令牌家族。刷新令牌可存哈希、jti、设备和过期时间，支持主动退出和风险控制。

不要把 access 和 refresh 混用；token payload 中加入 `type` 并严格检查。

## 前端保存令牌

常见方案：

- Authorization Bearer：前端保存访问令牌并放请求头。若存 localStorage，需要重点防 XSS。
- HttpOnly Cookie：JavaScript 无法读取，可降低令牌被脚本窃取风险，但需要正确设置 SameSite、Secure 并处理 CSRF。

没有对所有项目绝对最优的方案。根据前后端域名、客户端类型、SSO、CSRF/XSS 风险和公司安全规范选择。

## RBAC 数据模型

```text
users
roles
permissions
user_roles
role_permissions
```

权限使用稳定代码：

```text
article:read
article:create
article:update
article:publish
article:delete
user:manage
```

不要只判断 `role == 'admin'` 散落在路由中。角色是权限集合，具体接口依赖权限代码。

## 权限依赖工厂

```python
from collections.abc import Callable


def require_permissions(*required: str) -> Callable:
    async def checker(current_user: CurrentUserDep) -> User:
        granted = current_user.permission_codes
        if not set(required).issubset(granted):
            raise ForbiddenError('没有执行此操作的权限')
        return current_user

    return checker
```

使用：

```python
@router.post(
    '/{article_id}/publish',
    dependencies=[Depends(require_permissions('article:publish'))]
)
async def publish_article(article_id: int, ...):
    ...
```

权限可以从数据库查询后缓存，但角色变更、用户禁用时必须有明确失效策略。

## 对象级权限

拥有 `article:update` 不一定能修改所有文章。还需判断：

- 是否为文章作者。
- 是否为所属组织成员。
- 是否为审核角色。
- 文章当前状态是否允许编辑。

推荐把范围直接加入查询：

```python
statement = select(Article).where(
    Article.id == article_id,
    Article.author_id == current_user.id
)
```

而不是先按 ID 取出任意文章，再忘记判断作者。为了避免泄露资源存在性，对无权查看的资源可以返回 404；具体策略应统一。

## 状态权限

权限不只是按钮：

```text
草稿：作者可编辑
待审核：作者不可改正文，审核员可通过/驳回
已发布：具备发布权限者可撤回
已归档：只读，管理员可恢复
```

状态转换集中在 Service，通过明确方法实现，不允许客户端直接随意 PATCH `status`。

## 注销和撤销

常见方案：

- `token_version`：修改密码、全端退出时加一，旧令牌全部失效。
- jti 黑名单：按单个令牌撤销，存 Redis 到令牌自然过期。
- 服务端会话：令牌只持有随机 session id，状态完全在服务端。

短时 access token 配合 refresh token 旋转通常比维护无限增长黑名单更可控。

## 安全高频清单

- 全站 HTTPS。
- 密钥放 Secret，不进代码和日志。
- 登录、注册、验证码、密码重置限流。
- 错误消息避免账号枚举。
- 密码修改后撤销旧会话。
- 对象级权限写进后端查询或 Service。
- 管理操作写审计日志。
- CORS 精确配置，Cookie 方案处理 CSRF。
- 令牌校验固定算法、issuer、audience 和类型。
- 权限变化有缓存失效策略。

## 本章练习

1. 实现注册、登录、获取当前用户、退出和刷新令牌。
2. 使用 Argon2 哈希密码，验证数据库和日志无明文。
3. 定义编辑、审核、管理员三个角色与权限集合。
4. 普通编辑只能修改自己的草稿；审核员可发布任意待审核文章。
5. 禁用用户后，已有 JWT 立即不能继续访问。
6. 覆盖 401、403 和“不暴露资源存在性”的 404 场景。

## 本章检查

- 认证、功能权限、对象范围和状态规则分别校验。
- JWT 中无敏感数据，解码固定算法并检查必要声明。
- 用户禁用、改密、退出有明确令牌失效机制。
- 前端隐藏按钮从不被当作后端权限控制。

