# 07 自动化测试：Vitest、Pytest 与 Playwright

## 本阶段目标

把稳定、高频、可判定的检查自动化，建立可靠的测试数据和失败诊断。自动化不是把所有人工步骤录制一遍，而是选择反馈快、重复成本高、回归价值高的场景。

## 先理解自动化测试的价值

人工测试适合探索未知问题、观察视觉细节和判断体验；自动化测试适合重复执行、快速反馈和防止旧功能回归。自动化代码也是代码，会有环境依赖、数据依赖和等待问题，不能因为“机器跑的”就天然可靠。

一条值得自动化的用例通常满足：执行频率高、步骤稳定、结果清晰、失败成本高。一次性的探索性操作、经常变动的视觉细节和需要复杂人工判断的内容，不一定适合马上自动化。

## 1. 先跑现有测试

```powershell
Set-Location frontend
npm run test
npm run build

Set-Location ..\backend
npm run test
```

先读失败输出和测试文件，再决定是产品缺陷、测试缺陷、环境问题还是数据污染。不要通过删除断言、放宽超时或无限重试掩盖失败。

### 1.1 认识测试输出

- `passed`：测试断言通过，不代表整个系统不存在其他风险。
- `failed`：至少一个断言失败，先保留日志、截图和数据库现场。
- `skipped`：被明确跳过，要写原因，不要当作通过。
- `timed out`：超过等待时间，可能是服务慢、定位器错误、网络问题或真正的性能问题。
- `No tests found`：测试目录、文件命名或命令路径不对，不等于测试通过。

先跑一个最小测试，再跑全集，可以缩短定位时间。不要为了追求全绿而删除失败用例。

## 2. 自动化分层

| 层级 | 适合验证 | 特点 |
| --- | --- | --- |
| 单元/服务 | 数据转换、权限函数、校验 | 快、定位准 |
| API 集成 | 路由、认证、数据库副作用 | 契约完整 |
| 浏览器 E2E | 登录、文章发布、搜索等关键链路 | 接近真实用户，数量要控制 |
| 视觉/可访问性 | 关键页面稳定结构 | 需要固定数据和视口 |

### 2.1 一个失败应该放在哪一层

- 纯函数把输入转换错了：单元测试。
- 接口权限和数据库副作用错了：API 集成测试。
- 登录后菜单显示错了：浏览器或组件测试，必要时再补 API 权限测试。
- 页面在移动视口溢出：浏览器/视觉检查。

同一个风险可以在多层有不同检查，但不要把所有断言都堆到 E2E，导致每次小改动都要等待很久。

## 3. Pytest API 练习

安装到独立虚拟环境：

```powershell
python -m venv .venv-test
.\.venv-test\Scripts\Activate.ps1
python -m pip install pytest requests
pytest --version
```

示例 `test_health.py`：

```python
import os
import requests


def test_health_endpoint():
    base_url = os.getenv('API_BASE_URL', 'http://127.0.0.1:3001/api')
    response = requests.get(f'{base_url}/health', timeout=5)
    assert response.status_code == 200
    assert response.json()
```

### 3.1 从最小测试开始

在单独的 `qa-python` 目录执行，避免一开始改变当前前端项目的依赖：

```powershell
New-Item -ItemType Directory -Force qa-python | Out-Null
Set-Location qa-python
python -m venv .venv-test
.\.venv-test\Scripts\Activate.ps1
python -m pip install pytest requests
pytest --version
```

新建 `test_health.py`，先只写健康接口。执行：

```powershell
$env:API_BASE_URL = 'http://127.0.0.1:3001/api'
pytest -q -s
```

通过后再增加登录，不要一开始就把登录、创建文章、清理数据全部写进一条长测试。

### 3.2 fixture 和清理

fixture 是“测试开始前准备、结束后清理”的公共步骤。账号密码、Token 和文章 ID 通过环境变量或测试返回值传递，不写死在代码里。创建文章后，即使断言失败，也要使用 `try/finally` 或 pytest fixture 清理，避免下一次测试受到污染。

### 3.3 参数化练习

同一条规则有多个输入时，用参数化避免复制粘贴：

```python
import pytest


@pytest.mark.parametrize('email', ['', 'wrong-format', 'qa001@example.test'])
def test_login_email_validation(email):
    # 这里只演示测试数据组织；真实请求要使用测试环境和安全凭据
    assert isinstance(email, str)
```

这段练习本身没有调用接口，目的是先理解“一个测试函数、多个输入”。真正接入 API 时，为每个输入写明确的预期状态码和错误字段，不要只断言请求没有抛异常。

### 3.4 API 自动化的四层断言

调用登录或文章接口时，依次检查：

1. HTTP 层：状态码、Content-Type、响应时间是否在本用例目标内。
2. 结构层：响应是否有 `data`、`message`、资源 ID 等必需字段。
3. 业务层：状态值、角色、列表数量和分页字段是否正确。
4. 副作用层：数据库是否写入、更新、回滚或拒绝重复数据。

只检查第一层，很容易出现“返回 200 但业务失败”的假通过。

练习增加：登录 fixture、Token fixture、参数化错误输入、创建数据后的清理 fixture。Token 和密码从环境变量读取，不硬编码进测试文件。

## 4. Playwright 浏览器练习

安装和运行由前端/项目现有配置决定；若项目没有 Playwright 配置，在独立实验目录初始化：

```powershell
npm init playwright@latest
npx playwright install
npx playwright test --list
```

如果不想改变当前前端项目的 `package.json`，先在 `测试记录` 下建立独立目录；如果选择在项目内安装，先确认团队是否允许增加依赖。Playwright 浏览器文件可能较大，安装失败时先保存错误信息。

登录链路应遵循：

1. 打开登录页。
2. 用稳定的 label、role 或 data-testid 定位输入框和按钮。
3. 输入测试账号并提交。
4. 等待 URL、可见菜单或接口响应等可观察条件。
5. 断言用户可见结果和权限菜单。
6. 失败时保存 trace、截图、视频或网络日志。

不要用固定 `sleep` 猜页面完成时间，也不要用脆弱的 `div:nth-child(3)` 作为长期定位器。

### 4.1 Playwright 最小示例

```javascript
import { test, expect } from '@playwright/test'

test('游客可以打开首页', async ({ page }) => {
  await page.goto('http://127.0.0.1:5173/')
  await expect(page).toHaveTitle(/博客|知识库/i)
})
```

标题只是示例，必须根据页面真实标题调整。第一次学习可以使用：

```powershell
npx playwright test --headed
```

失败后查看项目生成的 `test-results`、截图和 trace。

### 4.2 稳定定位器优先级

1. `getByRole` + 可见名称。
2. `getByLabel`。
3. `getByText`（文本稳定时）。
4. `getByTestId`（团队约定了稳定 test id 时）。
5. CSS/XPath 只在没有更好语义时使用。

定位器要描述用户看到的元素，不要绑定临时 class、DOM 层级或第几个兄弟节点。

### 4.3 登录状态复用和隔离

浏览器自动化可以在每条测试中重新登录，简单但较慢；也可以保存经过验证的登录状态，速度更快但要防止账号和数据互相污染。初学阶段优先每条测试独立登录，等能解释清楚清理和权限后再使用共享状态。

如果保存 `storageState` 或 trace，里面可能有 Cookie 和 Token：

- 只保存在本地测试记录目录。
- 不提交到 Git，不上传到公共聊天。
- 测试结束后删除或按团队安全规则加密。

### 4.4 Trace 的使用步骤

在 Playwright 配置或命令中开启 trace 后，失败时使用：

```powershell
npx playwright show-trace '.\test-results\某个失败目录\trace.zip'
```

查看每一步的 DOM、截图、网络请求和控制台。先定位第一次出现异常的步骤，不要只看最后一张截图。

## 5. 自动化稳定性清单

- [ ] 每条测试可以独立运行，不能依赖前一条测试留下的数据。
- [ ] 测试数据唯一且可清理。
- [ ] 等待业务状态或网络响应，不使用无意义固定等待。
- [ ] 失败产物包含步骤、页面、请求和日志。
- [ ] 失败重跑用于定位，不用于把失败伪装成通过。
- [ ] 定期删除过时测试，避免“全绿但无价值”。

## 6. 如何判断 flaky 测试

同一提交、同一环境、同一数据，偶尔通过偶尔失败，通常叫 flaky。常见原因是没有等待真正的业务状态、共享数据、时间/时区、随机值、并发端口、网络依赖或测试顺序。排查顺序：保留第一次失败的 trace；单独重复运行并记录比例；检查前置数据和清理；把固定等待改为等待 URL、元素状态或网络响应；修复根因后再多次验证。

临时重试可以帮助确认不稳定，但不能把“重试后通过”当成质量结论。

## 7. 自动化代码的维护规则

- 测试名称写用户行为和结果，例如“普通用户不能打开管理文章页面”，不要写“测试按钮 3”。
- 公共请求、数据构造和清理可以抽成 helper，但不要把所有业务都塞进一个无法定位的万能函数。
- 断言失败信息要包含关键 ID、状态和实际值，方便 CI 日志定位。
- 依赖环境变量时，在测试启动阶段检查变量是否存在，并输出变量名而不是敏感值。
- 任何修改定位器、等待、超时和重试的行为，都要说明为什么，避免隐藏真实性能问题。

## 8. 本阶段交付物

- 一条 Pytest 健康或登录测试
- 一条 Playwright 首页或登录测试
- 测试数据和清理说明
- 失败截图/Trace 示例
- 自动化分层说明
- 一份不稳定测试排查记录

## 完成标准

你能新增一条 API 或 UI 自动化用例，能说明它覆盖的风险、为什么放在这个层级，以及失败时测试人员如何通过产物定位问题。
