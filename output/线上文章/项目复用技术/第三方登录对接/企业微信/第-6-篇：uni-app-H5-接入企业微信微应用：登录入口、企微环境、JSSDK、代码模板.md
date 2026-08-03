---
title: "第 6 篇：uni-app H5 接入企业微信微应用：登录入口、企微环境、JSSDK、代码模板"
slug: "h5-uni-app-h5-a4b1be0e"
summary: "uni-app 编译 H5 接入企业微信微应用的适配方案，覆盖登录入口、企微环境判断、JSSDK 接入、代码模板和真实项目链路拆解。"
category: "企业微信"
categoryPath:
  - "项目复用技术"
  - "第三方登录对接"
  - "企业微信"
tags: []
status: "published"
sortOrder: 60
cover: ""
originalId: "6a2d29208a2b1c68f2cac7c6"
originalSlug: "h5-uni-app-h5-a4b1be0e"
originalStatus: "published"
publishedAt: "2026-04-28T11:18:24.458Z"
updatedAt: "2026-07-31T11:16:24.876Z"
exportedAt: "2026-08-03T03:03:53.296Z"
---
# 第 6 篇：uni-app H5 接入企业微信微应用：登录入口、企微环境、JSSDK、代码模板

> 用途：个人私密知识库。  
> 目标：未来离开当前公司、拿不到原仓库代码时，仅凭本文也能完整复刻“企业微信 H5 + App OAuth 登录链路”。  
> 数据来源：本文所有“项目逻辑”均来自当前仓库真实实现，不是通用空模板。

---

## 0. 阅读方式（先看）

1. 本文所有结论都标注了两类标签：
   - `[可迁移]`：可直接带到新项目。
   - `[项目特有]`：当前公司项目耦合逻辑，复用前必须替换。
2. 如果你时间很少，优先看：
   - 第 3 节（全链路时序）
   - 第 4/5 节（两条登录路径伪代码）
   - 第 8 节（登录后落盘）
   - 第 11 节（迁移时必须替换项）
3. 如果要现场排障，优先看：
   - 第 12 节（错误定位表）
   - 第 13 节（逐步调试手册）

---

## 1. 代码事实总览（当前仓库）

### 1.1 真实入口与核心文件

| 文件 | 关键函数/内容 | 作用 |
|------|---------------|------|
| `pages/login/index.vue` | `maybeStartWeComAutoLogin`、`loginWithWeCom` | 登录入口分流（企微容器 vs 非企微） |
| `secondary/weComH5Login/index.vue` | `startLogin`、`obtainH5Code` | 企微容器内 H5 静默授权免登 |
| `secondary/weComLogin/index.vue` | `startLogin`、`obtainOAuthCode`、`openWeComAuthWebview` | App 原生端 + 普通 H5 OAuth 授权 |
| `util/platform/runtime.js` | `isWeComContainer` | 判断是否在企业微信容器 |
| `util/platform/auth.js` | `resolveDingTalkAuthCodeFromUrl`、`clearDingTalkOAuthCallbackParamsInCurrentUrl`、`buildUniH5PageUrl` | OAuth 通用 URL 解析与清理工具（命名带钉钉前缀） |
| `api/login.js` | `weComOAuthLogin`、`getSchoolInformation` | 登录接口、学校配置接口 |
| `util/request/index.js` | 请求拦截器注入 `Authorization` 与 `schoolID` | 登录前上下文依赖 |
| `util/auth/weComLogin.js` | `completeWeComLogin` | 登录后会话落盘、路由跳转、家长模式处理 |
| `configInfo/index.js` | `PC_H5_REDIRECT_HOST`、`DEFAULT_SCHOOL_ID` | 环境配置、回调中转域名 |

### 1.2 两条登录路径（真实实现）

| 路径 | 页面 | 场景 | code 获取方式 | 当前实现 clientType |
|------|------|------|---------------|---------------------|
| 路径 A | `weComH5Login` | 企业微信 App 内置浏览器打开 H5 | 静默授权 + OAuth 回调 URL 取 code | `H5` |
| 路径 B | `weComLogin` | App 原生端 / 普通 H5 浏览器 | App: WebView 拦截；H5: OAuth 跳转回调 | `APP`（固定） |

> `[项目特有]` 路径 B 在当前仓库里即使是普通 H5 也固定传 `clientType: 'APP'`。

---

## 2. 登录入口（登录页）真实逻辑拆解

### 2.1 自动跳转逻辑（企微 H5 场景）

来源：`pages/login/index.vue` 中 `maybeStartWeComAutoLogin`。

```js
/**
 * 企微 H5 场景自动跳转到免登页
 * 检测到企微容器且学校已开启企微登录，直接跳转 weComH5Login
 */
const maybeStartWeComAutoLogin = () => {
  if (!isWeComH5Scene()) return false;
  if (schoolConfig.weComLoginApp !== 1) return false;
  if (!schoolConfig.weComCorpID) return false;

  const currentSchoolID = String(schoolIDValue.value || '').trim();
  if (!currentSchoolID) return false;

  uni.navigateTo({
    url: `/secondary/weComH5Login/index?schoolID=${encodeURIComponent(currentSchoolID)}`,
  });
  return true;
};
```

解释：
- `[可迁移]` 自动免登前要先校验“场景 + 配置 + 组织上下文”。
- `[项目特有]` 当前项目把开关和 corpId 放在 `schoolConfig` 里，字段是 `weComLoginApp` 和 `weComCorpID`。

### 2.2 手动点击入口逻辑

来源：`pages/login/index.vue` 中 `loginWithWeCom`。

```js
/**
 * 企业微信登录入口（App 端 + H5 端）
 */
const loginWithWeCom = () => {
  if (!ensurePrivacyAgreement()) return;

  const currentSchoolID = String(schoolIDValue.value || '').trim();
  if (!currentSchoolID) {
    showLoginTip('缺少学校ID，请刷新后重试');
    return;
  }

  // 在企微容器里 -> 静默授权页；否则 -> OAuth 授权页
  const targetPage = isWeComContainer()
    ? '/secondary/weComH5Login/index'
    : '/secondary/weComLogin/index';

  uni.navigateTo({
    url: `${targetPage}?schoolID=${encodeURIComponent(currentSchoolID)}`,
  });
};
```

---

## 3. 全链路时序（按真实代码演绎）

### 3.1 总时序（入口到首页）

```text
登录页点击“企业微信登录”
  -> loginWithWeCom()
  -> isWeComContainer()
     -> true  进入 /secondary/weComH5Login/index
     -> false 进入 /secondary/weComLogin/index

页面 onLoad 后：
  -> startLogin()
  -> ensureSchoolContext()                    // 补 schoolID 并写入 USER_INFO
  -> loadSchoolConfig()                       // /basics/school/detailsMiniProgram
  -> validateSchoolConfig()                   // 校验企微开关/corpId/agentId
  -> obtainCode()                             // 两路径分叉获取 code
  -> weComOAuthLogin({ code, schoolID, clientType })
  -> completeWeComLogin(loginRes)
  -> uni.switchTab(targetUrl)
```

### 3.2 关键上下文依赖

1. 登录页传参 `schoolID` 到子页面。
2. 子页面执行 `ensureSchoolContext()`，把 `schoolID` 写回 `USER_INFO`。
3. 请求拦截器从 `USER_INFO.schoolID` 注入 header。
4. `getSchoolInformation()` 依赖该 header 返回正确学校配置。

> `[可迁移]` 如果你新项目少了第 2/3 步，会出现“学校配置接口返回错租户/错学校”的隐性问题。

---

## 4. 路径 A：企微容器内 H5 静默授权（`weComH5Login`）

来源：`secondary/weComH5Login/index.vue`。

### 4.1 函数级流程图

```text
onLoad(options)
  -> schoolID.value = options.schoolID
  -> startLogin()

startLogin()
  -> ensureSchoolContext()
  -> loadSchoolConfig()
  -> validateSchoolConfig()
  -> code = obtainH5Code()
     -> 首次：无 code，构建授权 URL，location.replace，返回 null
     -> 回调：有 code，校验 state，返回 code
  -> if (!code) return
  -> loginRes = weComOAuthLogin({ code, schoolID, clientType:'H5' })
  -> { targetUrl } = completeWeComLogin(loginRes)
  -> switchTab(targetUrl)
```

### 4.2 关键函数伪代码（带注释）

```js
// 1) 保证 schoolID 上下文完整：页面参数 -> 本地 USER_INFO -> 默认值
function ensureSchoolContext() {
  schoolID = trim(
    route.schoolID
    || storage.USER_INFO.schoolID
    || config.DEFAULT_SCHOOL_ID
  );
  if (!schoolID) throw Error('缺少学校ID');

  // 关键：写回 USER_INFO，供请求拦截器注入 header.schoolID
  storage.USER_INFO = { ...storage.USER_INFO, schoolID };
}

// 2) 拉学校配置并覆盖本地 schoolID（以后端返回为准）
async function loadSchoolConfig() {
  const res = await GET('/basics/school/detailsMiniProgram');
  if (res.code !== 200 || !res.data) throw Error(res.msg || '获取学校配置失败');
  schoolConfig = res.data;
  schoolID = trim(res.data.schoolID || schoolID);
}

// 3) 校验企微登录开关与核心参数
function validateSchoolConfig() {
  if (schoolConfig.weComLoginApp !== 1) throw Error('当前学校未开启企业微信登录');
  if (!schoolConfig.weComCorpID) throw Error('缺少企业微信CorpID配置');
  if (!schoolConfig.weComAgentID) throw Error('缺少企业微信AgentID配置');
}

// 4) 构建 state（仅字母数字，满足企微限制）
function createState() {
  return 'wecomh5' + Date.now();
}

// 5) 获取 code（两阶段）
async function obtainH5Code() {
  // 先尝试从当前 URL 解析回调参数
  const callback = resolveAuthCode(window.location.href);
  const code = callback.code || callback.authCode;
  if (code) {
    // 有 code 说明是回调阶段，必须校验 state
    const pass = validateOAuthState(callback.state);
    if (pass) return code;
  }

  // 首次进入：无 code，发起授权跳转
  const pcHost = config.PC_H5_REDIRECT_HOST;      // 如 https://admin.runlan.ltd
  if (!pcHost) throw Error('未配置 PC_H5_REDIRECT_HOST');

  const redirectUri = `${pcHost}/app/weComH5Login`;
  const state = createState();
  saveState(state);

  const authUrl = buildWeComH5AuthUrl({
    corpId: schoolConfig.weComCorpID,
    agentId: schoolConfig.weComAgentID,
    redirectUri,
    state,
  });

  // 跳走，等待企微回调回来
  window.location.replace(authUrl);
  return null;
}
```

### 4.3 单可信域名中转（项目实战）

`[项目特有]` 当前公司域名结构：
- PC 域名（企微可信域名）：`admin.runlan.ltd`
- H5 域名：`app.runlan.ltd`

nginx 实际策略：

```nginx
location ~ ^/app/(.*)$ {
  return 302 https://app.runlan.ltd/---
title: "第 6 篇：uni-app H5 接入企业微信微应用：登录入口、企微环境、JSSDK、代码模板"
slug: "h5-uni-app-h5-a4b1be0e"
summary: "uni-app 编译 H5 接入企业微信微应用的适配方案，覆盖登录入口、企微环境判断、JSSDK 接入、代码模板和真实项目链路拆解。"
category: "企业微信"
tags:
  - "企业微信"
  - "uni-app"
  - "H5微应用"
  - "JSSDK"
  - "代码模板"
status: "draft"
sortOrder: 60
cover: ""
originalId: "6a2d29208a2b1c68f2cac7c6"
originalSlug: "h5-uni-app-h5-a4b1be0e"
originalStatus: "published"
exportedAt: "2026-07-31T03:42:38.792Z"
---
$is_args$args;
}
```

链路说明：
1. 前端把 `redirect_uri` 写成 `https://admin.runlan.ltd/app/weComH5Login`。
2. 企微回调到 `admin.runlan.ltd/app/weComH5Login?code=...&state=...`。
3. nginx 302 到 `app.runlan.ltd/weComH5Login?code=...&state=...`。
4. H5 页面读取 code，继续业务登录。

---

## 5. 路径 B：App + 普通 H5 OAuth 授权（`weComLogin`）

来源：`secondary/weComLogin/index.vue`。

### 5.1 函数级流程图

```text
onLoad(options)
  -> schoolID.value = options.schoolID
  -> startLogin()

startLogin()
  -> ensureSchoolContext()
  -> loadSchoolConfig()
  -> validateSchoolConfig()
  -> callbackResult = obtainOAuthCode()
     -> 回调阶段：URL 已有 code，校验 state 后返回
     -> 首次阶段：
        - App：openWeComAuthWebview() 拦截回调 URL 返回 code
        - H5 ：window.location.replace(authUrl) 跳转授权，返回 null
  -> if (!code) return
  -> weComOAuthLogin({ code, schoolID, clientType:'APP' })   // 当前仓库固定 APP
  -> completeWeComLogin()
  -> switchTab(targetUrl)
```

### 5.2 关键函数伪代码（带注释）

```js
// 构建 redirect_uri：App 与 H5 不同
function buildRedirectUri() {
  if (isAppPlusRuntime()) {
    // App：后端固定路径，供 WebView overrideUrlLoading 拦截
    const host = removeApiSuffix(config.API_URL);       // https://api.xxx.com/api -> https://api.xxx.com
    return `${host}/wecom/app-login-callback`;
  }
  // H5：当前页面 URL（当前仓库使用 hash 形式）
  return buildUniH5PageUrl('/secondary/weComLogin/index', { schoolID });
}

// App 端打开授权页并拦截回调
function openWeComAuthWebview({ authUrl, redirectUri }) {
  return new Promise((resolve, reject) => {
    const webview = plus.webview.create(authUrl, `wecom-auth-${Date.now()}`, {
      popGesture: 'close',
      titleNView: { autoBackButton: true, titleText: '企业微信登录' },
    });

    webview.overrideUrlLoading({ mode: 'reject' }, (event) => {
      const url = event.url || '';
      if (!url.startsWith(redirectUri)) return;

      const callback = resolveAuthCode(url);
      const code = callback.code || callback.authCode;
      if (!code) return reject(Error('企业微信授权码为空'));
      resolve(callback);
    });

    webview.addEventListener('close', () => reject(Error('用户已取消企业微信登录')));
    webview.show('slide-in-right', 180);
  });
}

// 获取 code：App/H5 分叉
async function obtainOAuthCode() {
  const redirectUri = buildRedirectUri();
  const callback = resolveAuthCode(window.location.href);

  // 回调阶段：URL 有 code
  if (callback.code || callback.authCode) {
    validateOAuthState(callback.state);
    return callback;
  }

  // 首次阶段：生成 state + 授权 URL
  const state = createWeComOAuthState();
  saveState(state);
  const authUrl = buildWeComOAuthUrl({ corpId, agentId, redirectUri, state });

  if (isAppPlusRuntime()) {
    const appResult = await openWeComAuthWebview({ authUrl, redirectUri });
    validateOAuthState(appResult.state);
    return appResult;
  }

  // H5 首次：跳走，等待二次进入
  window.location.replace(authUrl);
  return null;
}
```

### 5.3 当前实现注意点

1. `[项目特有]` 当前 `createWeComOAuthState` 使用了下划线和随机串：  
   `wecom_login_${Date.now()}_${random}`。  
   这与“state 仅字母数字”的严格版本有差异，迁移时建议改成纯字母数字。
2. `[项目特有]` 当前 `weComLogin` 成功登录后固定传 `clientType: 'APP'`，即便在普通 H5。

---

## 6. OAuth 通用工具（真实代码行为）

来源：`util/platform/auth.js`（虽然文件注释写“钉钉”，但企微也在复用）。

### 6.1 `resolveDingTalkAuthCodeFromUrl` 真正做了什么

```js
/**
 * 从 URL 同时解析 search + hash 中的 code/authCode/state
 * 解析顺序：search -> hash
 * 先到先得：已有值不被覆盖
 */
function resolveDingTalkAuthCodeFromUrl(url) {
  result = { code:'', authCode:'', state:'' };
  parse(searchPart);
  parse(hashQueryPart);
  return result;
}
```

价值：
- `[可迁移]` 同时兼容两类 URL：
  - `https://a.com/callback?code=xxx`
  - `https://a.com/#/page?code=xxx`
- `[可迁移]` 兼容回调字段 `code` / `authCode`。

### 6.2 `clearDingTalkOAuthCallbackParamsInCurrentUrl` 真正做了什么

```js
/**
 * 清理当前地址栏中的 code/authCode/state（search + hash 均处理）
 * 不刷新页面，使用 history.replaceState
 */
function clearDingTalkOAuthCallbackParamsInCurrentUrl() {
  const cleaned = stripCallbackParams(window.location.href);
  if (cleaned !== current) history.replaceState(..., cleaned);
}
```

价值：
- `[可迁移]` 防止“残留回调参数”导致下次再次进入登录页时误判为回调阶段。

### 6.3 `buildUniH5PageUrl` 的路由假设

当前实现返回：
`origin + pathname + '#/page?query'`

结论：
- `[项目特有]` 当前仓库 H5 回调 URL 构建偏向 hash 路由。
- `[可迁移]` 你新项目若用 history 路由，需要重写该函数。

---

## 7. 请求拦截器依赖（为什么必须先写 `USER_INFO.schoolID`）

来源：`util/request/index.js`。

关键代码逻辑：

```js
// 从 USER_INFO 读取 schoolID 注入请求头
const userInfo = uni.getStorageSync('USER_INFO') || {};
const schoolID = userInfo.schoolID || configInfo.DEFAULT_SCHOOL_ID;
config.header.schoolID = schoolID;
```

推导：
1. 登录页子页面必须先执行 `ensureSchoolContext()`。
2. `ensureSchoolContext()` 必须把 `schoolID` 写回 `USER_INFO`。
3. 否则后续 `getSchoolInformation()` 的 header 可能带错 schoolID。

> `[可迁移]` 这是常见隐藏依赖。迁移时如果不复制这个思路，登录前置配置会出现偶发性错误。

---

## 8. 登录后落盘（`completeWeComLogin`）详细拆解

来源：`util/auth/weComLogin.js`。

### 8.1 总流程

```text
completeWeComLogin(loginResponse)
  -> 校验响应 code===200
  -> resolveLoginPayload() 兼容两种嵌套结构取 token/userInfo
  -> if accounttype===3
       handleParentLogin()
     else
       handleStandardLogin()
  -> 返回 targetUrl 与 isParentMode
```

### 8.2 `resolveLoginPayload`（非常关键）

兼容两种后端格式：

```json
// 格式 A
{ "code": 200, "TOKEN": "xxx", "data": { "accountid": "1", "accounttype": 1 } }

// 格式 B
{ "code": 200, "data": { "TOKEN": "xxx", "data": { "accountid": "1", "accounttype": 1 } } }
```

伪代码：

```js
function resolveLoginPayload(res) {
  dataBlock = isObject(res.data) ? res.data : {};
  token = dataBlock.TOKEN || res.TOKEN || '';
  userInfo = isObject(dataBlock.data) ? dataBlock.data : dataBlock;
  return { token, userInfo };
}
```

### 8.3 普通账号落盘（`accounttype !== 3`）

真实行为：
1. 请求通讯录接口 `getContactsOneData(accountID)`。
2. 清理家长态缓存。
3. 写入：
   - `currentUser`
   - `USER_INFO`
   - `USER_INFO_TOKEN`
4. 拉问候语 `getUserGreetingApi()`，写 `GREETING_DATA`。
5. 发事件 `AUTH_SESSION_READY`。
6. 依据 `accounttype` 选择首页：
   - `2 -> /pages/application/application`
   - 其他 -> `/pages/message/message`

### 8.4 家长账号落盘（`accounttype === 3`）

真实行为：
1. 暂存家长态：
   - `PARENT_INFO`
   - `PARENT_INFO_TOKEN`
   - `USER_INFO_TOKEN`（先放家长 token）
2. 拉家长关联学生列表 `getStudentParentListApi`。
3. 默认取第一个学生账号作为当前会话主账号。
4. 覆盖：
   - `USER_INFO`（学生）
   - `USER_INFO_TOKEN`（学生 token）
5. 拉通讯录、拉问候语、发会话 ready 事件。
6. 首页固定 `/pages/message/message`。

> `[项目特有]` 这整段是公司业务耦合逻辑，不是企微登录“标准动作”。新项目通常只要“token + userInfo + 首页跳转”即可。

---

## 9. 后端契约（按当前项目真实接口）

### 9.1 学校配置接口

- 方法：`GET /basics/school/detailsMiniProgram`
- 前置：header 里有 `schoolID`（由请求拦截器注入）
- 关键返回字段：
  - `weComLoginApp`：是否开启企微登录（1 开启）
  - `weComCorpID`
  - `weComAgentID`
  - `schoolID`

### 9.2 登录接口

- 方法：`POST /login/wecom`
- 参数：

```json
{
  "code": "企微OAuth授权码",
  "schoolID": "学校ID",
  "clientType": "H5|APP|PC"
}
```

### 9.3 当前项目各页面传参事实

| 页面 | 实际传参 |
|------|----------|
| `weComH5Login` | `clientType: 'H5'` |
| `weComLogin` | `clientType: 'APP'`（固定） |

---

## 10. 易踩坑清单（按真实代码提炼）

1. `state` 校验失败但 URL 有 code。  
   原因：上一次残留参数或 state 被覆盖。  
   解法：在识别回调后立即清理 URL 参数；每次发起授权前重新生成 state。

2. 明明传了 schoolID，学校配置仍错误。  
   原因：没写入 `USER_INFO.schoolID`，请求拦截器注入了默认值。  
   解法：调用配置接口前必须跑 `ensureSchoolContext()`。

3. 单可信域名回调后前端资源 404。  
   原因：用了反向代理而不是 302。  
   解法：必须让浏览器地址栏真正跳到 H5 域名。

4. H5 二次进入重复触发授权死循环。  
   原因：回调参数没清理，页面每次都被当作“新的回调”。  
   解法：`clear...CallbackParamsInCurrentUrl()` 必须在校验逻辑中执行。

5. App 授权页关闭后没有反馈。  
   原因：没处理 WebView `close` 事件。  
   解法：`addEventListener('close')` 里明确 reject “用户已取消登录”。

---

## 11. 迁移到新项目时必须替换的内容

### 11.1 必换项（不换基本会挂）

1. 域名与回调地址：
   - `PC_H5_REDIRECT_HOST`
   - nginx 302 配置目标域名
2. 学校/租户上下文字段与存储策略：
   - `USER_INFO.schoolID` 的来源与写入时机
3. 后端接口路径与字段：
   - 学校配置接口
   - 登录接口
   - 返回结构
4. 登录后落盘逻辑：
   - 是否有家长模式
   - 是否要拉通讯录/问候语
   - 首页路由规则
5. 路由模式工具：
   - hash/history 是否一致
   - `buildUniH5PageUrl` 是否要改

### 11.2 可保留项（通用能力）

1. `isWeComContainer` 判定思想。
2. `state` 生成 + 存储 + 校验 + 清理全流程。
3. App `plus.webview` 拦截回调 URL 取 code 的模式。
4. OAuth URL 构造参数结构：
   - `appid`
   - `redirect_uri`
   - `response_type=code`
   - `scope=snsapi_base`
   - `state`
   - `agentid`

---

## 12. 故障定位速查表

| 现象 | 一次性检查点（按顺序） |
|------|------------------------|
| `invalid redirect_uri` | 1. 企业微信后台可信域名是否匹配；2. redirect_uri 是否 HTTPS；3. redirect_uri 域名是否就是可信域名 |
| 回调后拿不到 code | 1. 地址栏是否有 code；2. code 在 search 还是 hash；3. `resolve...FromUrl` 是否覆盖两种情况 |
| state 校验失败 | 1. storage 里 expectedState 是否存在；2. 当前回调 state 是否一致；3. 是否有历史残留参数 |
| 登录接口返回失败 | 1. code 是否过期；2. schoolID 是否正确；3. clientType 是否符合后端规则 |
| 登录成功但跳不到首页 | 1. `completeWeComLogin` 是否抛错；2. 通讯录接口是否失败；3. targetUrl 是否有效 tab 页 |
| 不同学校返回同样配置 | 1. 请求头 schoolID 是否注入正确；2. USER_INFO.schoolID 是否被覆盖成默认值 |

---

## 13. 实战调试手册（建议照做）

### 13.1 H5 静默授权链路调试

1. 打开企微工作台微应用，观察首次进入 URL（无 code）。
2. 抓到跳转后的授权 URL，确认参数完整：
   - appid
   - redirect_uri
   - scope=snsapi_base
   - state
   - agentid
3. 回调到可信域名时，确认 nginx 302 是否生效。
4. 回到 H5 域名后，确认 URL 有 `code/state`。
5. 看前端日志中 state 校验是否通过。
6. 看 `/login/wecom` 请求 body 是否包含 `code/schoolID/clientType`。
7. 看 `completeWeComLogin` 是否完成落盘并触发 `switchTab`。

### 13.2 App WebView 授权链路调试

1. 打开授权页后，确认 `overrideUrlLoading` 已注册。
2. 回调 URL 命中时，确认 `currentUrl.startsWith(redirectUri)` 为 true。
3. 确认 `resolve...FromUrl` 解析出 code。
4. 主动关闭授权页，确认走“用户取消登录”分支。

---

## 14. 一份可直接复刻的最小伪代码（新项目起步用）

```js
/**
 * 最小复刻版本（不含公司业务逻辑）
 * 目标：仅实现“企微拿 code -> 后端换 token -> 落盘跳转”
 */
async function wecomLoginBootstrap(route) {
  // 1. 准备上下文
  const schoolID = ensureSchoolContext(route.schoolID);
  const config = await loadSchoolConfig(); // 返回 { enable, corpId, agentId }
  validateConfig(config);

  // 2. 分支获取 code
  let code = '';
  if (isWeComContainer()) {
    code = await obtainH5SilentCode(config, schoolID);   // 内部两阶段处理
  } else {
    code = await obtainOAuthCodeByRuntime(config, schoolID); // App/H5 分叉
  }
  if (!code) return; // 首次跳转阶段

  // 3. 请求后端登录
  const clientType = resolveClientType(); // H5/APP/PC
  const loginRes = await http.post('/login/wecom', { code, schoolID, clientType });
  const { token, user } = parseLoginPayload(loginRes);

  // 4. 最小落盘（项目可再扩展）
  saveSession(token, user);
  navigateHomeByRole(user);
}
```

---

## 15. 当前项目特有差异（务必记住）

1. `[项目特有]` 企微流程复用了 `util/platform/auth.js` 中“钉钉前缀命名”的工具函数。
2. `[项目特有]` 请求头 schoolID 依赖 `USER_INFO`，不是页面局部变量直传。
3. `[项目特有]` `weComLogin` 页固定 `clientType: 'APP'`。
4. `[项目特有]` 登录后默认拉通讯录和问候语，不是纯登录链路。
5. `[项目特有]` 家长模式会二次切换到学生账号并覆盖 `USER_INFO_TOKEN`。

---

## 16. 文档维护规则（给未来的你）

1. 任何新增逻辑都必须写清楚属于 `[可迁移]` 还是 `[项目特有]`。
2. 接口字段或存储键变化时，先改第 9 节，再改对应伪代码段。
3. 每次复刻一个新项目后，追加“迁移差异记录”，不要只改脑子不改文档。
4. 若发现本文与仓库代码不一致，以仓库代码为准并立即修文档。
