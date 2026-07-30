---
title: "uni-app 微信小程序工程结构实战：pages.json、manifest.json、条件编译与开发者工具联调"
slug: "uni-app-uni-app-pages-json-manifest-json-38b6eedd"
summary: "从公司项目实战视角梳理 uni-app 做微信小程序时最关键的工程组织方式，讲清 pages.json、manifest.json、project.config.json 的职责边界和联调流程。"
category: "微信小程序"
categoryPath:
  - "前端技术"
  - "uni-app"
  - "微信小程序"
tags:
  - "uni-app"
  - "微信小程序"
  - "pages.json"
  - "条件编译"
  - "开发者工具"
status: "published"
sortOrder: 30
cover: ""
originalId: "6a2d291e8a2b1c68f2cac208"
originalSlug: "uni-app-uni-app-pages-json-manifest-json-38b6eedd"
originalStatus: "published"
publishedAt: "2026-04-03T13:57:01.119Z"
updatedAt: "2026-06-13T10:28:27.819Z"
exportedAt: "2026-07-30T16:02:06.145Z"
---
# uni-app 微信小程序工程结构实战：pages.json、manifest.json、条件编译与开发者工具联调

> 这是这一组 `uni-app 微信小程序` 笔记的第 2 篇。  
> 截至 `2026-03-31`，我继续对照 `uni-app` 官方文档和微信开放文档，把“工程到底该怎么组织”这一层单独拆出来讲。  
> 如果第 1 篇是在建立底层认知，那这一篇就是在回答：`公司里的 uni-app 项目，做成微信小程序时，什么该放哪，什么不该放哪。`

> 建议先读 `uni-app/通用基础`：
> 1. 第 1 篇《uni-app 到底是什么：跨端编译、运行时与平台边界》
> 2. 第 3 篇《uni-app 工程结构与配置基础：App.vue、main.js、pages.json、manifest.json、uni.scss 与 static》
> 这一篇默认你已经知道通用目录和基础配置项，下面会重点讲 `mp-weixin` 目标下最容易混的三层职责：`pages.json`、`manifest.json`、微信开发者工具项目配置。

## 一、先说结论：做微信小程序时，最常见的工程问题不是代码不会写，而是“配置放错层”

很多项目一开始就埋雷，不是因为业务复杂，而是因为下面这些东西混在一起了：

- 页面注册
- 页面窗口样式
- 小程序平台专属配置
- 网络超时
- 分包
- 微信开发者工具项目配置
- 微信专属代码
- 通用静态资源和平台资源

最后就会出现这些很典型的问题：

1. 页面明明写了，但跳不过去
2. `tabBar` 配了，结果行为不对
3. 微信权限描述写了，但运行还是报缺配置
4. 某段代码只想给微信用，结果别的平台也编进去了
5. 本地能跑，交给同事就跑不起来
6. 发版后包体突然变大，不知道是哪里塞进了主包

这些问题，本质上大多不是“业务逻辑错”，而是：

`你没有把 uni-app 的工程层、微信小程序的平台层、微信开发者工具的项目层分开。`

## 二、先把这 3 个配置文件彻底分清楚

如果你前面已经看过 `通用基础` 第 3 篇，这里可以把关注点进一步收窄成一句话：

`通用基础` 负责告诉你“这些文件各自是什么”，而这一篇要解决的是“到了微信小程序目标下，它们最容易在哪一层放错”。

### 1. `pages.json`：管页面和页面表现

`uni-app` 官方文档明确写了：

`pages.json` 用来对 uni-app 进行全局配置，决定页面文件路径、窗口样式、导航栏、tabBar 等。

你可以把它理解成：

`这个项目有哪些页面，这些页面怎么展示。`

它最常负责：

- `pages`
- `globalStyle`
- `tabBar`
- `condition`
- `subPackages`
- `preloadRule`
- `entryPagePath`

一句话记忆：

`只要你在描述“页面”和“页面怎么显示”，先想到 pages.json。`

### 2. `manifest.json`：管应用级配置和平台级配置

`uni-app` 官方文档把 `manifest.json` 定义为应用配置文件，用于指定应用名称、图标、权限、平台特有配置等。

它更像：

`这个 uni-app 应用本身，以及它发到不同平台时，各平台需要的额外配置。`

对于微信小程序，你最常会碰到的是：

- 根级 `networkTimeout`
- `debug`
- `mp-weixin`
  - `appid`
  - `setting`
  - `optimization`
  - `cloudfunctionRoot`

一句话记忆：

`只要你在描述“这个应用是什么”，或者“发到微信平台时需要补什么”，先想到 manifest.json。`

### 3. `project.config.json`：管微信开发者工具项目设置

微信官方文档对 `project.config.json` 的定义更偏“开发工具项目配置”。

它管的是：

- `appid`
- `compileType`
- `libVersion`
- `setting`
- `packOptions`
- `debugOptions`

重点来了：

`它不是 uni-app 的业务配置文件，而是微信开发者工具理解这个小程序项目时要读的工具级配置。`

而 `uni-app` 官方文档也补了一层：

- HBuilderX `3.6.16+` 支持在项目根目录自定义小程序项目配置
- 微信平台支持 `project.wx.json`、`project.config.json`

所以在 `uni-app` 项目里，你要把它理解成：

`开发工具辅助层，而不是你业务工程的主配置入口。`

## 三、最稳的理解方式：把配置职责画成一张表

| 你要配置的内容 | 优先放哪里 | 为什么 |
| --- | --- | --- |
| 页面路径、首页、页面样式 | `pages.json` | 它就是页面管理中心 |
| `tabBar`、分包、预下载 | `pages.json` | 都属于页面和路由组织 |
| 网络超时、平台专属参数 | `manifest.json` | 属于应用级或平台级配置 |
| 微信小程序 `appid` | `manifest.json` 的 `mp-weixin` | 这是平台配置，不是页面配置 |
| 微信开发者工具本地编译设置 | `project.config.json` | 这是工具层配置 |
| 微信专属 API 代码 | 页面/模块代码 + `#ifdef MP-WEIXIN` | 这是平台差异代码，不是配置项 |
| 微信专属静态资源 | `static/mp-weixin` | 平台专属资源应在编译时隔离 |

如果你愿意先背一句话，那就是：

`页面归 pages.json，平台归 manifest.json，开发工具归 project.config.json。`

## 四、做公司项目时，`pages.json` 该怎么用才稳

### 1. `pages` 不是清单而已，它决定页面是否存在

`uni-app` 文档里明确说，页面要在 `pages.json` 注册，未注册页面会在编译阶段被忽略。

这意味着：

1. 你新建一个页面文件，不等于它已经可访问
2. 你删掉页面文件前，也要同步看 `pages.json`
3. 路由跳不过去时，先别怀疑业务逻辑，先看是否注册

对公司项目来说，我更建议这样组织：

```text
src/
  pages/
    home/
      index.vue
    user/
      profile.vue
  subpackages/
    report/
      pages/
        detail.vue
```

然后在 `pages.json` 里保持路径和目录语义一致。

不要把页面四处乱放，再靠脑子记路径。

### 2. `globalStyle` 负责默认表现，页面内 `style` 负责覆盖

你可以把 `globalStyle` 理解成：

`全站页面默认长这样。`

而每个页面自己的 `style`，负责覆盖当前页差异。

这比每个页面都手写一份导航栏配置稳定很多。

比较适合统一放在 `globalStyle` 的内容：

- 导航栏背景色
- 导航栏文字颜色
- 默认背景色
- 下拉刷新通用行为

适合放到页面单独覆盖的内容：

- 某个特殊页的标题
- 某个营销页的沉浸式样式
- 某个详情页的透明导航栏需求

### 3. `tabBar` 要尽量早定，不要后期乱改

`uni-app` 文档和微信文档都能看出一点：

`tabBar` 不是普通导航，它直接影响页面组织方式和页面生命周期行为。

你至少要记住这些规则：

1. `tabBar` 页面必须先在 `pages` 中定义
2. `uni.navigateTo`、`uni.redirectTo` 不能去 `tabBar` 页面
3. `uni.switchTab` 只能去 `tabBar` 页面
4. `tabBar` 页面展现过一次后，后续切换通常更像“复用页面实例”

这也是为什么我建议公司项目在一开始就先把这些页面定下来：

- 首页
- 工作台
- 消息
- 我的

因为一旦后面频繁改 `tabBar` 结构，路由逻辑、页面缓存预期和埋点路径都会跟着受影响。

### 4. 微信顶部 `tabBar` 只是“微信支持”，不代表“项目就该用”

`uni-app` 文档里明确写了：

`top` 值仅微信小程序支持。

这说明什么？

说明它是平台特性，不是跨端通用模式。

所以如果你的项目是长期多端维护，我更建议：

`顶部选项卡自己做，不要强依赖 tabBar 的 top 能力。`

这样后面迁别的平台时，不会突然被平台差异卡住。

## 五、分包在 `pages.json` 里，但分包思维要从业务模块出发

`uni-app` 文档和微信官方文档都提到了 `subPackages`。

微信官方对分包的几个规则很关键：

1. 用 `subPackages` 声明分包结构
2. `tabBar` 页面必须在主包
3. 分包之间不能随便互相引用资源和 JS

而 `uni-app` 还额外支持：

- `preloadRule`
- 分包优化

### 1. 主包应该只留下“启动必须内容”

在公司项目里，主包建议只放：

- 首页或登录页
- `tabBar` 页面
- 真正高频公共组件
- 最基础公共资源

适合拆到分包的内容：

- 报表模块
- 复杂审批模块
- 大型表单模块
- 运维后台模块
- 低频活动页

### 2. 分包目录最好按业务域切，不要按“页面多少”瞎切

不推荐这种切法：

```text
subpackages/
  a/
  b/
  c/
```

推荐这种切法：

```text
subpackages/
  report/
  approval/
  operation/
```

因为你以后排包体、查依赖、做权限隔离时，业务语义清晰得多。

### 3. `preloadRule` 是优化项，不是救命项

`uni-app` 文档里明确说：

配置 `preloadRule` 后，进入某页面时可自动预下载后续可能需要的分包，以提升进入分包页时的速度。

但你不要把它理解成：

`主包太大没关系，反正预下载一下`

真正正确的顺序是：

1. 先把主包减下来
2. 再用 `preloadRule` 做体验优化

## 六、`manifest.json` 里，微信小程序最容易放错的是什么

### 1. `appid`

`manifest.json` 根节点也有 `appid`，但 `uni-app` 文档明确提醒要区分：

- `uni-app` 的应用标识
- 微信小程序自己的 `appid`

所以你千万别把这两个当成一个东西。

更稳妥的理解是：

- 根级 `appid`：属于 `uni-app / DCloud` 体系
- `mp-weixin.appid`：属于微信小程序平台

如果你维护的是企业项目，这个地方一定要对团队说清楚，不然很容易出“appid 配了但还是不对”的沟通事故。

### 2. 权限、超时、平台设置

`uni-app` 文档里有个很典型的 FAQ：

很多人把微信小程序权限描述写在 `pages.json`，结果运行时仍然提示要在 `app.json` 里声明。

官方给出的答案就是：

`微信小程序的权限描述配置在 manifest，不在 pages.json。`

这个坑特别常见。

所以你要记住：

`只要一个配置更像“平台要求”，就先怀疑它该不该写到 manifest.json，而不是 pages.json。`

### 3. `networkTimeout`

它也放在 `manifest.json`，不是 `pages.json`。

这很合理，因为请求超时不是页面长相，而是应用级网络行为。

如果你们公司项目接口普遍较慢，或者上传下载链路比较重，这里可以统一配置，而不是每个页面到处散落超时兜底逻辑。

### 4. `optimization.subPackages`

`uni-app` 文档说明，在对应平台配置下增加：

```json
{
  "mp-weixin": {
    "optimization": {
      "subPackages": true
    }
  }
}
```

这段配置最好不要只背属性名，而要连着编译结果一起理解：

1. 最外层的 `mp-weixin` 说明这不是全端统一配置，而是微信编译目标专属配置。
2. `optimization.subPackages: true` 不是“帮你自动分包”，而是在你已经写好 `pages.json -> subPackages` 的前提下，进一步优化分包产物。
3. 真正收益通常体现在“只被某个分包引用的资源和代码，能不能更干净地留在分包里”，而不是继续掉回主包。
4. 所以正确顺序一定是：先把页面和目录拆对，再开这个优化项，而不是指望它替你修工程结构。

可以开启分包优化。

这个配置很值得记住，因为它影响的不只是“分包有没有”，还影响：

- 静态资源是否能真正跟着分包走
- 某些只被单分包引用的 JS 是否仍然落到主包

## 七、做微信专属适配时，最稳的是 4 种条件编译落点

`uni-app` 官方文档对条件编译讲得已经非常清楚了。对微信小程序实战来说，最常用的就是 `MP-WEIXIN`。

你可以把条件编译主要分成 4 种落点。

### 1. 代码级条件编译

适用于：

- `wx.*` API
- 微信专属组件调用
- 只在微信里执行的埋点或授权逻辑

示例：

```js
// #ifdef MP-WEIXIN
wx.requestSubscribeMessage({
  tmplIds: ['模板ID']
})
// #endif
```

这段代码建议你按“编译期隔离”来理解：

1. `#ifdef MP-WEIXIN` 不是运行时判断，它会在编译阶段直接裁掉非微信平台不该出现的代码。
2. 这意味着 `wx.*` 这类宿主专属 API，天然就该放进条件编译，而不是靠运行时 `if (process.env...)` 硬扛。
3. 维护项目时你只要看到某段逻辑离不开微信协议，就要本能地想一句：`它应该收口到 MP-WEIXIN 吗？`
4. 这样后面你扩别的平台时，排查范围会非常清楚，因为平台差异不会散落在普通业务代码里。

### 2. `pages.json` 条件编译

适用于：

- 某页面只给微信平台编译
- 某分包只给微信平台存在
- 某些平台专属页面样式

这是工程层非常实用的一种方式，因为它能直接减少其他平台无意义页面进入编译产物。

### 3. `static/mp-weixin` 目录条件编译

`uni-app` 文档明确说明：

`static` 目录下可以建平台专有目录，例如 `static/mp-weixin`。

只有微信小程序平台才会把其中资源编进去。

这非常适合放：

- 微信专属图标
- 微信专属海报模板图
- 微信专属协议图
- 微信专属小组件资源

### 4. `platforms/mp-weixin` 页面级隔离

`uni-app` 文档还提到，可以在项目根目录建 `platforms/mp-weixin` 放平台专属页面文件。

这一招更适合什么情况？

适合：

- 某个页面微信版和别的平台版差异非常大
- 继续在一个页面里堆 `#ifdef` 已经很难维护

不适合：

- 只是一个按钮文案不同
- 只是一个 API 分支不同

所以我建议的判断标准是：

- 小差异：代码块条件编译
- 中差异：`pages.json` 或 `static/mp-weixin`
- 大差异：`platforms/mp-weixin`

## 八、推荐一套更适合公司项目的目录组织法

如果你项目规模已经不小了，我更建议按下面这个思路组织：

```text
src/
  pages/
    home/
    user/
    common/
  subpackages/
    report/
      pages/
    approval/
      pages/
  components/
    business/
    common/
  static/
    common/
    mp-weixin/
  utils/
    common/
    platform/
  platforms/
    mp-weixin/
```

这份目录结构真正解决的是“多人维护时，一眼能不能看出包边界和平台边界”：

1. `pages/` 和 `subpackages/` 分开，是为了让主包和分包的归属在目录层就可见。
2. `static/common` 和 `static/mp-weixin` 分开，是为了让资源也跟着平台边界走，不至于微信专属图片混进共用目录。
3. `utils/common` 和 `utils/platform` 分开，是为了避免一段平台代码伪装成“通用工具”。
4. `platforms/mp-weixin` 单独存在，说明“差异大到已经不适合只写几个 #ifdef 了”，这比把一个页面堆成条件分支坨更好维护。

### 1. `pages/` 放主包页面

也就是：

- 首屏入口
- 登录页
- `tabBar` 页面
- 最常用基础页

### 2. `subpackages/` 放业务分包

别让分包页面混在主包目录里，不然后期根本看不出包边界。

### 3. `components/business/` 和 `components/common/` 分开

这会让你更容易判断一个组件应不应该进入主包。

### 4. `utils/platform/` 专门收口平台差异能力

比如：

- 微信订阅消息
- 微信分享卡片处理
- 微信特殊授权流程

这样业务页面就不用到处直接写 `wx.*`。

## 九、联调时最容易卡住的，不是代码，是工具链

`uni-app` 快速开始文档里其实把这一点说得很直接：

1. 第一次运行到微信开发者工具前，要先配置微信开发者工具安装路径
2. 微信开发者工具需要在“设置 -> 安全”里开启服务端口
3. 不然 HBuilderX 无法调用开发者工具命令行

这类问题你在团队协作里几乎一定会遇到。

所以如果你要给组里新人做接入文档，最好直接写成固定清单：

### 运行前检查清单

1. 已安装微信开发者工具
2. HBuilderX 已配置微信开发者工具路径
3. 微信开发者工具已开启服务端口
4. 当前项目 `mp-weixin.appid` 正确
5. 如果有云函数或 npm 依赖，确保本地构建链路完整

## 十、你最终会看到哪些产物路径

`uni-app` 官方文档里明确提到，手动发行微信小程序后，会生成：

`unpackage/dist/build/mp-weixin`

这个路径你要记住，因为它对应：

- 手动导入微信开发者工具
- 本地查看最终构建产物
- 排查到底是编译结果问题，还是开发工具问题

工程里你可以这样理解：

- `运行到微信开发者工具`：偏开发联调
- `发行到微信小程序`：偏正式构建产物

所以如果你们公司遇到：

- HBuilderX 里看着正常
- 微信开发者工具里不正常

那就应该开始看“编译产物到底长什么样”，而不是只盯着 `src` 目录猜。

## 十一、什么时候该碰 `project.config.json`

不是所有项目都需要你手动深改它。

更稳的原则是：

### 1. 默认不把业务逻辑依赖在 `project.config.json`

因为它主要是开发工具配置层，不应该成为业务正确性的前提。

### 2. 只有当你明确需要这些能力时再碰

比如：

- 指定基础库版本
- 调整工具编译设置
- 包上传/预览相关配置
- 调试器相关设置

### 3. 公共配置和个人配置分开

微信官方文档明确说明：

- `project.config.json`
- `project.private.config.json`

两者都可以存在，而且私有配置优先级更高。

这对于团队协作特别重要。

推荐做法是：

- 公共设置进 `project.config.json`
- 个人本地习惯或环境差异进 `project.private.config.json`
- 并把 `project.private.config.json` 忽略出版本管理

## 十二、公司项目里最实用的 10 条工程规则

1. 页面必须先注册到 `pages.json`，再谈跳转和埋点
2. `tabBar` 页面一旦确定，尽量不要在项目中后期频繁改结构
3. 权限、平台参数、微信专属配置优先看 `manifest.json`
4. 微信专属代码必须用 `#ifdef MP-WEIXIN` 收口
5. 微信专属静态资源放 `static/mp-weixin`
6. 分包按业务域切，不按字母和页面数量乱切
7. 主包只保留启动必需内容，低频重模块全部往分包走
8. 不要让业务代码直接强依赖微信开发者工具私有设置
9. 新同事接项目时，先检查工具路径和服务端口，不要先怀疑代码
10. 遇到“源码看着没问题但运行不对”时，直接看 `unpackage/dist/build/mp-weixin`

## 十三、这一篇读完后，你应该形成什么判断力

如果这一篇真的吃透了，你以后再看一个 `uni-app` 微信小程序项目，应该先能判断出：

1. 哪些是页面组织问题
2. 哪些是平台配置问题
3. 哪些是开发工具问题
4. 哪些是应该用条件编译解决，而不是硬写分支
5. 哪些内容该留主包，哪些该拆分包

这比“会不会写一个页面”更重要。

因为真实公司项目里，后面最容易拖垮维护效率的，往往不是单点功能，而是工程结构越来越乱。

## 十四、下一篇准备写什么

下一篇我更建议继续往“能力接入”走，也就是：

`uni-app 微信小程序常见能力接法实战：登录、用户信息、上传下载、订阅消息、分享与支付`

这样这几篇会形成一个比较完整的梯度：

1. 第 1 篇：底层认知
2. 第 2 篇：工程结构
3. 第 3 篇：能力接入
4. 第 4 篇：性能优化
5. 第 5 篇：组件设计与跨端差异
6. 第 6 篇：登录态、缓存与稳定性治理
7. 第 7 篇：特殊能力与 `web-view` 实战
8. 第 8 篇：常用功能全景手册，适合写页面时按功能逐项翻查

## 参考资料

- [uni-app pages.json 页面路由](https://zh.uniapp.dcloud.io/collocation/pages.html)
- [uni-app manifest.json 应用配置](https://zh.uniapp.dcloud.io/collocation/manifest.html)
- [uni-app 条件编译处理多端差异](https://uniapp.dcloud.io/tutorial/platform.html)
- [uni-app 创建、运行与发布](https://uniapp.dcloud.io/quickstart-hx.html)
- [微信开放文档：项目配置文件](https://developers.weixin.qq.com/miniprogram/dev/devtools/projectconfig.html)
- [微信开放文档：小程序配置](https://developers.weixin.qq.com/miniprogram/dev/framework/config.html)
