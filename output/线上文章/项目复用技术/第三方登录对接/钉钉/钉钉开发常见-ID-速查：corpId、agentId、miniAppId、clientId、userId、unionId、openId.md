---
title: "钉钉开发常见 ID 速查：corpId、agentId、miniAppId、clientId、userId、unionId、openId"
slug: "id-corpid-agentid-miniappid-clientid-userid-unionid-openid-44a970d5"
summary: "梳理钉钉开发中最容易混淆的各种 ID，适用于 H5 微应用、PC 扫码登录、钉钉小程序等所有钉钉接入场景。"
category: "钉钉"
categoryPath:
  - "项目复用技术"
  - "第三方登录对接"
  - "钉钉"
tags:
  - "钉钉"
  - "身份体系"
  - "企业应用"
  - "ID速查"
status: "published"
sortOrder: 170
cover: ""
originalId: "6a2d29208a2b1c68f2cac76c"
originalSlug: "id-corpid-agentid-miniappid-clientid-userid-unionid-openid-44a970d5"
originalStatus: "published"
publishedAt: "2026-04-28T11:18:24.426Z"
updatedAt: "2026-06-13T14:09:43.239Z"
exportedAt: "2026-07-30T15:42:33.614Z"
---
# 钉钉开发常见 ID 速查：corpId、agentId、miniAppId、clientId、userId、unionId、openId

> 适用场景：H5 微应用、PC 扫码登录、钉钉小程序、企业内部应用、第三方企业应用，所有钉钉接入场景通用。

> 先说结论：
>
> 钉钉不是只有“应用 ID + 用户 ID”这一层，它天然同时带着“企业组织”“应用能力”“用户身份”“鉴权凭证”四层模型，所以看起来会比微信那套更绕。

如果你是从微信小程序迁过来，最容易产生的错觉是：

- 微信上常盯着 `appid / openid / unionid`
- 到钉钉后突然看到 `corpId / clientId / agentId / miniAppId / userId / unionId / authCode / access_token / openid`

这时候如果你按“页面上看到哪个就记哪个”去理解，很快就会乱。

真正更稳的记法，是先按“层级”分。

还有一句一定要先记住：

`这些 ID 不会在每个项目里同时出现。`

比如：

- 纯 PC 网页钉钉扫码登录，主线通常先看 `corpId`、`clientId / clientSecret`、`authCode`、`openId / unionId`
- 工作台应用管理、菜单配置这类能力，才更容易碰到 `agentId`
- 真正创建了钉钉小程序产物，才需要重点关心 `miniAppId`

所以别把它们当成“同一层的八九个必填字段”，而要当成“按场景启用的几组标识”。

## 一、先按层级记，不要按后台页面记

### 1. 企业层：`corpId`

`corpId` 是企业在钉钉里的全局唯一标识。

你可以把它理解成：

`这家学校 / 这家公司 / 这个组织，在钉钉里的租户 ID`

典型用途：

- 小程序里调用 `dd.getAuthCode` 时传入 `corpId`
- 标记当前登录用户属于哪个企业
- 第三方企业应用发布灰度时，指定体验组织的 `corpId`
- 后端做多租户隔离时，把自家 `school_id` 或 `tenant_id` 映射到 `corpId`

迁移时要记住一句话：

`在钉钉里，先分清“属于哪家企业”，再分清“这个人是谁”。`

### 2. 用户层：`userId`、`unionId`、`openid`

#### `userId`

`userId` 是用户在单个企业内部的唯一标识。

你可以把它理解成：

`张三在 A 学校里的员工编号`

它常用于：

- 查用户详情
- 发消息
- 发起审批
- 作为企业内用户主键

最关键的一点是：

`userId 不是全钉钉全局唯一，它只在当前企业里稳定。`

#### `unionId`

`unionId` 是比 `userId` 更全局一层的用户标识，但它的“全局”范围不是整个互联网，而是同一开放平台账号或当前 ISV 范围。

它常用于：

- 跨应用识别同一个用户
- 同一个 ISV 服务多个企业时，识别“这其实还是同一个人”
- 自己系统里做统一账号映射

如果你想做“一个老师在多个学校组织里切换，但我们后端还能识别是同一个人”，`unionId` 往往比 `userId` 更合适。

#### `openid`

这是最容易把人带偏的一个。

钉钉确实有 `openId / openid`。

而且官方新旧文档里，字段大小写并不完全一致：

- 新版“获取用户通讯录个人信息”接口里返回的是 `openId`
- 旧版“获取用户授权的持久授权码”文档里写的是 `openid`

它们描述的核心含义是一致的，都更接近：

`用户在当前开放应用范围内的唯一标识`

但它是不是当前项目里的“第一主角”，要看场景：

- 企业内部小程序
- 第三方企业小程序
- 钉钉工作台里的企业应用免登

这些场景里，你更常先盯：

`authCode -> userId / unionId`

而在 PC 网页扫码登录、网页登录第三方网站这条链路里，官方当前教程又会明确出现：

`scope=openid` -> `authCode` -> 用户 token -> `openId / unionId`

一句话记忆：

`钉钉有 openId/openid，只是它在不同场景里的优先级不一样。`

## 二、应用层：`clientId`、`clientSecret`、`agentId`、`miniAppId`

### 1. `clientId` / `clientSecret`

这是应用本身的身份凭证。

旧资料里你还会看到：

- `appKey`
- `appSecret`

按钉钉现在的新手文档口径，可以直接把它理解成：

- `appKey = clientId`
- `appSecret = clientSecret`

它们的职责不是标识用户，而是标识“谁在调用开放平台”。

典型用途：

- 服务端换取 `access_token`
- 作为企业内部应用或第三方企业应用的基础凭证

注意：

`clientSecret 只能放后端，不能放 uni-app 前端。`

### 2. `agentId`

`agentId` 是应用能力入口的标识，更接近“工作台里的这个应用入口是谁”。

官方基础概念里明确把它归到应用标识类，并指出它主要用于工作台管理类 API，例如：

- 设置首页应用
- 更新菜单
- 标识目标应用入口

它和 `clientId` 最容易看混，但它们不是一回事：

- `clientId` 回答的是“哪个应用在调用开放平台 / 做 OAuth / 换 token”
- `agentId` 回答的是“工作台里当前要操作的是哪个应用入口”

所以：

`agentId 不等于 userId，也不等于 corpId，更不等于 clientId。`

如果你当前只是做 PC 网页扫码登录，或者只是先把微信小程序迁成钉钉小程序，很多阶段其实都还用不到 `agentId`。

### 3. `miniAppId`

`miniAppId` 是钉钉小程序本身的唯一身份标识。

这里最容易误会成：

`不是只有一个应用吗，为什么还要再来一个 miniAppId？`

关键在于，钉钉把“应用身份”“工作台入口”“小程序产物”拆成了不同层。

它更常出现在：

- 小程序创建后
- 小程序调试、上传、发布
- 小程序权限配置

所以它更像：

`这一个小程序产物自己的编号`

而不是企业编号，也不是用户编号。

你可以这么理解：

- 有应用，先会有应用级身份，比如 `clientId`
- 有工作台入口，可能会涉及 `agentId`
- 真正创建了钉钉小程序产物，才会有 `miniAppId`

所以如果你当前只是 PC 网页扫码登录，或者只有网页应用能力，没有钉钉小程序产物，那 `miniAppId` 通常可以先忽略。

### 4. 如果按“应用身份证 / 工作台入口 / 小程序包”来记

适合前端自己快速建立直觉的说法：

- `clientId / clientSecret` 更像应用本体的“身份证 + 密码”
- `agentId` 更像这个应用在企业工作台里的“入口标识”
- `miniAppId` 更像“小程序产物自己的包体编号”

如果你想用更口语化的话去记，可以记成：

- `corpId`：哪家公司
- `clientId`：哪个应用
- `agentId`：这家公司工作台里的哪个应用入口
- `miniAppId`：这个入口背后跑的是哪个小程序产物

但有两处不要想得太绝对：

1. `agentId` 可以类比成工作台里的入口或快捷方式标识，但它在官方口径里更准确是“应用能力/应用入口标识”，不要把它收窄成任意一个前端菜单项自己的普通 ID。
2. 不要把 `一个 clientId 永远只对应一个 agentId` 写成铁律。官方更稳的说法是：添加小程序或网页应用能力、或企业授权开通第三方企业应用时，会生成 `agentId`。所以它更适合按“企业 + 能力入口”去理解，而不是全平台死记成绝对 1:1。

再补一句对当前项目最重要的话：

`你现在做的是 PC 网页扫码登录，不要因为理解了 agentId，就在第一批联调里强行把它塞进主链。`

按官方当前网页登录教程，首轮真正该盯的是：

- `corpId`
- `clientId`
- `clientSecret`
- `authCode`
- `openId`
- `unionId`

而不是先盯 `agentId`。

### 5. 关于 `dd.config` 和 `agentId`，别和 PC 扫码登录混成一条线

很多老资料或 H5 微应用文章里，会把 `agentId` 和前端 JSAPI 鉴权写在一起。

这类语境通常更接近：

- 钉钉工作台里的 H5 微应用
- 企业内网页应用调用 JSAPI
- 旧版前端鉴权写法

但你当前在做的：

- 浏览器里的钉钉扫码登录
- 第三方网站网页登录

官方当前主教程给的首轮参数是 `clientId`、`corpId`、`redirect_uri`、`scope`、`authCode` 这条链，并没有把 `agentId` 放进扫码登录主线。

所以更稳的记法是：

`agentId 常见于工作台/H5/部分 JSAPI 语境，不是当前 PC 扫码登录第一批必需字段。`

### 6. 还有个新名字：`Unified App ID`

钉钉现在还有一个 `Unified App ID`，也就是统一应用 ID。

这个名字出现时，不用慌，它是平台想把不同类型应用统一到一个标准应用标识上。

对大多数“uni-app 迁移到钉钉小程序”的第一阶段工作来说，它通常不是最先要解决的主线问题。

## 三、凭证与登录链路：`authCode`、`access_token`

### 1. `authCode`

这是前端拿到的临时授权码。

官方 JSAPI 文档里写得很明确：

- 有效期 5 分钟
- 只能使用一次

所以它不是用户长期 ID，也不是登录态本身。

它只是登录链路里的“中间票据”。

### 2. `access_token`

这是服务端调接口的访问凭证。

它是用 `clientId / clientSecret` 换出来的。

官方基础概念页给出的默认有效期是 7200 秒。

你可以把整条链路记成：

`clientId + clientSecret -> access_token`

`corpId + dd.getAuthCode -> authCode`

`access_token + authCode -> userId / unionId`

如果你当前做的是 `PC 网页钉钉扫码登录`，更常见的是这条链：

`clientId -> 构造登录地址 / 二维码`

`用户扫码授权 -> authCode`

`authCode -> 用户 token`

`用户 token -> openId / unionId / 手机号等个人信息`

## 四、为什么你会觉得“钉钉比微信 ID 多很多”

因为微信更多是：

- 应用是谁
- 当前用户是谁
- 同一开放平台下是不是同一个人

而钉钉在企业场景里，还额外强制你回答：

- 当前是哪个企业
- 这个用户在这个企业里的身份是谁
- 这个企业安装的是哪个应用入口
- 当前调接口的是应用自己，还是用户授权后的个人身份

所以微信迁钉钉时，感知上的差异不是“字段多了几个”，而是：

`从单应用思维，变成了企业租户 + 应用 + 用户 + 凭证四层并存。`

## 五、迁移时真正先要记住哪几个

如果你现在做的是 `uni-app -> 钉钉企业小程序` 或企业内 JSAPI 免登，第一批先盯住这 6 个就够了：

1. `corpId`
2. `clientId`
3. `clientSecret`
4. `authCode`
5. `userId`
6. `unionId`

第二批再看：

1. `agentId`
2. `miniAppId`

第三批通常可以暂时放后面：

1. `openid`
2. `persistent_code`
3. 个人访问凭证那套 OAuth 字段

但如果你当前做的是 `PC 网页钉钉扫码登录`，那就别把 `openId` 放太后面了，应该提前和下面这些一起对齐：

1. `corpId`
2. `clientId`
3. `clientSecret`
4. `authCode`
5. `openId`
6. `unionId`

## 六、企业内部应用和第三方企业应用，ID 重点也不一样

### 1. 如果你做的是企业内部应用

重点通常是：

- `corpId`
- `clientId / clientSecret`
- `authCode`
- `userId / unionId`

这是“我公司自己给自己组织内部用”的模型。

### 2. 如果你做的是第三方企业应用

重点还是上面这些，但会更强调：

- 授权的是哪家企业的 `corpId`
- 当前企业有没有完成授权
- `unionId` 在当前 ISV 范围下如何做统一账号映射

这是“同一套产品给多家学校/企业装”的模型。

如果你的业务是教育公司服务多所学校，那从钉钉官方应用类型介绍看，通常更像：

`第三方企业应用`

而不是纯粹的企业内部应用。

## 七、官方文档里还有一个容易把人绕晕的点

钉钉文档现在是“新手文档 + 新版概念页 + 旧版 SDK 页 + orgapp/isvapp 历史路径”并存。

所以你会同时看到这些混用情况：

- `AppKey / AppSecret`
- `Client ID / Client Secret`
- `orgapp / isvapp / development / dingstart`

它们不一定互相矛盾，但语境不同，很容易混着看混掉。

还有一个我这次对资料时发现的小坑：

- `getAuthCode` 的独立 JSAPI 页把 `corpId` 标成必填
- 但企业内部小程序免登教程里，又给了一个没显式传 `corpId` 的示例

这里我更建议实际项目里：

`显式传 corpId`

这样迁移时最稳，也更不容易被环境差异坑到。

## 八、如果让我给你一张最短记忆卡

你可以直接这么记：

- `corpId`：哪家企业
- `userId`：这个人在这家企业里是谁
- `unionId`：跨应用/跨企业时，这是不是同一个人
- `clientId / clientSecret`：这个应用是谁
- `agentId`：工作台里的应用入口是谁
- `miniAppId`：这个小程序产物是谁
- `authCode`：前端临时票据
- `access_token`：后端调用 API 的凭证
- `openId / openid`：PC 网页扫码登录和个人授权链路里很常见；在企业小程序免登里通常不是第一主键

## 九、给 uni-app 迁移实战的建议

建议你在自己的后端用户表或租户表里，至少预留这几个字段：

- `ding_corp_id`
- `ding_user_id`
- `ding_union_id`
- `app_type`

前端登录链路只负责：

- 调 `dd.getAuthCode`
- 把 `authCode` 和必要上下文交给后端

后端再负责：

- 用 `clientId / clientSecret` 换 `access_token`
- 用 `authCode` 换 `userId / unionId`
- 再决定怎么把钉钉身份绑定到你原来的微信用户体系

这样结构最清楚，也最方便以后同时兼容微信、钉钉和 H5。

## 参考资料

- [钉钉开放平台《模块总览》](https://open.dingtalk.com/document/dingstart/start-overview)
- [钉钉开放平台《基础概念》](https://open.dingtalk.com/document/dingstart/basic-concepts-beta)
- [钉钉开放平台《应用类型介绍》](https://open.dingtalk.com/document/dingstart/application-type-introduction)
- [钉钉开放平台《getAuthCode》](https://open.dingtalk.com/document/development/jsapi-get-auth-code)
- [钉钉开放平台《小程序应用免登》](https://open.dingtalk.com/document/dingstart/small-program-application-free-of-registration)
- [钉钉开放平台《开发并测试第三方企业小程序应用免登》](https://open.dingtalk.com/document/dingstart/applications-without-registration)
- [钉钉开放平台《通过免登码获取用户信息》](https://open.dingtalk.com/document/development/obtain-the-userid-of-a-user-by-using-the-log-free)
- [钉钉开放平台《获取用户授权的持久授权码》](https://open.dingtalk.com/document/development/persistent-authorization-code)
- [uni-app 官方《package.json》](https://uniapp.dcloud.net.cn/collocation/package.html)
