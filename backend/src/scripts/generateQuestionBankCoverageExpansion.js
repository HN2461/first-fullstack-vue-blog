import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const scriptDir = path.dirname(fileURLToPath(import.meta.url))
const outputPath = path.resolve(scriptDir, '../data/questionBank/questions-coverage-expansion.json')
const apply = process.argv.includes('--apply')

const categoryMeta = {
  'frontend.html': ['HTML', '语义结构、浏览器原生行为与可访问性', 'Elements、Accessibility、Forms'],
  'frontend.css': ['CSS', '层叠、格式化上下文、尺寸约束与渲染', 'CSS、Layout、Rendering'],
  'frontend.javascript': ['JavaScript', '语言语义、执行上下文、异步调度与对象模型', 'JavaScript、ECMAScript、Async'],
  'frontend.typescript': ['TypeScript', '静态类型建模、类型收窄与运行时边界', 'TypeScript、Type System、Runtime'],
  'frontend.vue': ['Vue 3', '响应式依赖、组件渲染、组合式 API 与生命周期', 'Vue、Composition API、Rendering'],
  'frontend.browser': ['浏览器与网络', '网络协议、安全策略、加载、解析与渲染流水线', 'HTTP、Browser、Network'],
  'frontend.react': ['React', '状态快照、渲染提交、Hook 与并发更新', 'React、Hooks、Rendering'],
  'frontend.engineering': ['前端工程化', '依赖、构建、质量门禁、发布与可观测性', 'Build、Tooling、CI/CD'],
  'frontend.performance': ['性能优化', '以用户指标和性能证据定位网络、主线程与渲染瓶颈', 'Performance、Web Vitals、Profiling'],
  'frontend.security': ['Web 安全', '输入不可信、输出编码、浏览器防线与服务端授权', 'Security、OWASP、Defense in Depth'],
  'frontend.testing': ['前端测试', '围绕用户行为、稳定契约与风险分层建立反馈', 'Testing、Vitest、Playwright'],
  'frontend.interview.output': ['JavaScript 代码输出', '逐行推导求值、作用域、类型转换与任务队列', 'JavaScript、代码输出、事件循环'],
  'frontend.interview.handwritten': ['手写实现与原理', '从最小正确实现扩展到异常、并发、清理和复杂度边界', 'JavaScript、手写题、实现'],
  'frontend.interview.vue': ['Vue 高频追问', '从 API 用法继续追问响应式、调度、渲染和工程边界', 'Vue、面试、原理'],
  'frontend.interview.scenario': ['工程与项目场景', '先澄清约束，再覆盖主流程、失败路径、监控和回滚', '项目场景、排错、架构'],
  'frontend.interview.algorithm': ['算法与数据结构', '说明数据结构、不变量、复杂度和边界输入', '算法、数据结构、复杂度'],
  'backend.node': ['Node.js', '事件循环、异步 I/O、进程、流与服务稳定性', 'Node.js、Runtime、Backend'],
  'backend.express': ['Express', '中间件管线、请求边界、安全与错误治理', 'Express、HTTP、Middleware'],
  'backend.python': ['Python', '对象模型、迭代协议、类型提示、并发与资源管理', 'Python、Language、Backend'],
  'backend.fastapi': ['FastAPI', '类型驱动的接口契约、依赖注入、异步与生命周期', 'FastAPI、Pydantic、ASGI'],
  'database.mongodb': ['MongoDB', '文档建模、索引、聚合、一致性与扩展', 'MongoDB、Document、Index'],
  'database.mysql': ['MySQL', '关系建模、索引、执行计划、事务与锁', 'MySQL、SQL、Transaction'],
  'database.redis': ['Redis', '数据结构、过期、持久化、并发控制与缓存治理', 'Redis、Cache、Distributed']
}

const topics = {
  'frontend.html': [
    ['document-outline', '文档大纲与标题层级', '标题等级表达内容层级而不是字号；一个页面应按语义递进，视觉大小交给 CSS，跳级会降低屏幕阅读器和搜索引擎理解能力。'],
    ['button-link', '按钮和链接的选择', '触发当前页面行为使用 button，导航到资源使用 a；两者原生键盘行为、语义和禁用方式不同，不应只按外观选择。'],
    ['form-name', '表单提交中的 name、value 与 disabled', '原生表单按成功控件的 name/value 组成数据；disabled 控件通常不提交，readonly 控件会提交，缺少 name 的控件也不会进入 FormData。'],
    ['label-control', 'label 与表单控件关联', '使用 for/id 或包裹关系把 label 与控件关联，可扩大点击区域并提供可访问名称；placeholder 不能代替持续可见的标签。'],
    ['native-validation', '原生表单约束验证', 'required、pattern、min、max 等可提供基础客户端校验，但客户端数据可被绕过，服务端必须再次校验并返回字段级错误。'],
    ['details-dialog', 'details、dialog 等原生交互元素', '优先评估原生 details/summary 和 dialog，它们提供语义与部分键盘能力；使用 dialog 仍需设计焦点进入、关闭返回和背景交互。'],
    ['picture-srcset', '响应式图片 picture、srcset 与 sizes', 'srcset 提供候选资源，sizes 描述布局槽位，浏览器结合设备像素比选择文件；picture 适合格式或艺术方向切换。'],
    ['image-loading', '图片 loading、decoding 与尺寸占位', '懒加载非首屏图片可减少初始网络竞争；提前声明 width/height 或 aspect-ratio 可预留空间，降低图片加载造成的布局偏移。'],
    ['script-loading', 'script 的 defer、async 与 module', 'defer 保持文档顺序并在解析后执行，async 下载完即执行且不保证顺序，模块脚本默认延迟并支持依赖图；选择取决于依赖关系。'],
    ['iframe-sandbox', 'iframe sandbox 与跨文档隔离', 'sandbox 默认收紧脚本、表单、导航和源能力，再按最小权限添加令牌；同时允许脚本和同源可能削弱隔离，嵌入内容还要考虑 CSP。'],
    ['metadata-seo', 'meta、canonical 与结构化数据', 'title、description、canonical 和结构化数据帮助搜索系统理解页面，但不能替代可抓取正文、正确状态码和稳定链接。'],
    ['custom-data', 'data-* 与 DOM 数据边界', 'data-* 适合少量与元素相关的字符串元数据，可通过 dataset 访问；复杂业务状态应放在应用状态层，敏感信息不能依赖 DOM 隐藏。']
  ],
  'frontend.css': [
    ['specificity-is-where', ':is()、:where() 与选择器权重', ':where() 自身权重为零，:is() 采用参数中最高权重；它们能控制选择器组织和覆盖成本，但仍受来源、层叠层和声明顺序影响。'],
    ['logical-properties', 'CSS 逻辑属性', 'margin-inline、padding-block 等按书写模式表达方向，便于 RTL 和竖排适配；它们不是简单永远对应 left/right。'],
    ['container-query', '容器查询', '容器查询根据组件容器而非视口应用样式，适合可复用组件；需要建立查询容器，并注意尺寸 containment 对布局的影响。'],
    ['subgrid', 'CSS Subgrid', 'subgrid 让子网格复用父网格轨道，便于跨重复项对齐；它解决轨道共享，不等于把所有嵌套布局扁平化。'],
    ['aspect-ratio', 'aspect-ratio 与固有尺寸', 'aspect-ratio 为自动尺寸计算提供比例；显式宽高、内容最小尺寸和 replaced element 的固有比例仍可能共同决定最终结果。'],
    ['min-width-auto', 'Flex 项的 min-width: auto', 'Flex 项默认自动最小尺寸可能不允许内容收缩，导致省略号或布局失效；常用 min-width: 0 允许按可用空间收缩。'],
    ['grid-minmax', 'Grid 中 minmax(0, 1fr)', '直接使用 1fr 时轨道仍可能受内容最小尺寸撑开；minmax(0, 1fr) 明确允许轨道缩到零，常用于避免长内容溢出。'],
    ['overflow-clip', 'overflow hidden、clip 与滚动容器', 'hidden 会建立可编程滚动容器，clip 只裁剪且不提供滚动；overflow 还会影响 sticky 参照和格式化上下文，不能只看视觉裁剪。'],
    ['animation-composite', '动画属性与合成层', 'transform 和 opacity 通常更容易在合成阶段处理，但并非使用它们就一定不触发布局或获得独立图层；应以 Performance 和 Layers 证据判断。'],
    ['reduced-motion', 'prefers-reduced-motion', '应尊重用户减少动态效果的系统偏好，移除非必要位移和自动播放；不是简单关闭所有反馈，而是保留必要状态变化。'],
    ['font-loading', 'Web 字体加载与 font-display', 'font-display 决定阻塞、回退和交换策略；字体子集、预加载和度量兼容回退可共同减少不可见文字与布局偏移。'],
    ['css-containment', 'contain 与 content-visibility', 'contain 限制布局、绘制或尺寸影响范围，content-visibility 可跳过离屏渲染；误设尺寸隔离可能改变布局，需要配合固有尺寸占位。']
  ],
  'frontend.javascript': [
    ['execution-context', '执行上下文与词法环境', '函数调用会建立执行上下文，标识符按词法环境链解析；作用域由定义位置决定，调用位置主要影响普通函数 this。'],
    ['property-descriptor', '属性描述符', '数据属性由 value/writable/configurable/enumerable 描述，访问器属性由 get/set 描述；直接赋值无法表达全部约束。'],
    ['object-copy', '对象浅拷贝边界', '展开语法和 Object.assign 只复制一层可枚举自有属性并触发读取；嵌套引用仍共享，原型和多数描述符也不会完整保留。'],
    ['structured-clone', 'structuredClone 的能力与限制', 'structuredClone 支持循环引用和多种内建类型并可转移部分对象，但不能克隆函数、DOM 节点等所有值，也不是业务模型序列化方案。'],
    ['promise-resolution', 'Promise 解析过程', 'resolve 另一个 thenable 时会采用其最终状态，而不是立刻以对象本身 fulfilled；then 回调返回值和抛错决定下一个 Promise。'],
    ['abort-controller', 'AbortController 取消协作', 'AbortSignal 是取消通知协议，调用 abort 不会强行终止任意代码；消费方必须监听信号并尽快停止或忽略结果。'],
    ['iterator-protocol', '可迭代协议与迭代器协议', '对象通过 Symbol.iterator 返回迭代器，迭代器 next 返回 value/done；for...of、展开和许多集合 API 消费该协议。'],
    ['proxy-reflect', 'Proxy 与 Reflect', 'Proxy 拦截对象内部操作，Reflect 提供与陷阱对应的默认转发；代理必须遵守不可配置属性等语言不变量，否则运行时会抛错。'],
    ['weak-collections', 'WeakMap 与 WeakSet', '弱集合的对象键不会阻止垃圾回收，且不可枚举，适合附加元数据和缓存；它们不保证何时回收，也不能用来观察 GC。'],
    ['module-live-binding', 'ES Module 实时绑定', 'ESM import 读取导出绑定的当前值而非一次性复制，但导入方不能重新赋值；循环依赖还会受初始化顺序和暂时性死区影响。'],
    ['numeric-edge', '浮点数、NaN 与安全整数', 'JavaScript Number 使用 IEEE 754 双精度，部分十进制不能精确表示；NaN 应用 Number.isNaN 判断，大整数需评估 BigInt 或字符串。'],
    ['resource-cleanup', '显式资源清理', '事件监听、计时器、订阅和外部资源需要与生命周期配对释放；仅把变量设为 null 不会自动撤销外部注册关系。']
  ],
  'frontend.typescript': [
    ['unknown-any', 'unknown 与 any', 'any 基本关闭类型检查并会传播，unknown 要先收窄才能使用；接口边界优先 unknown 配合运行时校验。'],
    ['never-exhaustive', 'never 与穷尽检查', 'never 表示不可能出现的值；在可辨识联合的 default 分支赋给 never，可让新增变体在编译期暴露遗漏。'],
    ['satisfies', 'satisfies 运算符', 'satisfies 检查表达式符合目标类型，同时尽量保留表达式自身的精确信息；它不同于把变量直接注解成更宽类型。'],
    ['generic-constraint', '泛型约束与 keyof', '泛型保留输入输出之间的关系，extends 约束允许安全使用所需能力；keyof 可把属性名限制为对象真实键。'],
    ['conditional-type', '条件类型与分布行为', '裸类型参数参与条件类型时会对联合成员分布；用元组包裹两侧可抑制分布，复杂类型需关注可读性和实例化成本。'],
    ['mapped-type', '映射类型与键重映射', '映射类型遍历键并可调整 readonly、optional 或通过 as 重映射键；它适合从单一模型派生类型，减少手工同步。'],
    ['variance', '函数参数方差', '在严格函数类型下，参数类型通常按逆变方向检查以避免把只能处理更窄输入的函数用于更宽调用场景；方法存在兼容性差异。'],
    ['declaration-merge', '声明合并与模块扩充', '接口和命名空间等部分声明可合并，模块扩充可为现有模块补类型；全局扩充需限制作用域，避免污染和版本冲突。'],
    ['type-predicate', '类型谓词与断言函数', 'value is T 告诉编译器布尔检查成功后的类型，asserts 表达失败会终止；实现若撒谎，运行时仍会出错。'],
    ['enum-alternative', 'enum 与字面量对象选择', 'enum 有特定运行时代码和语义，as const 对象加联合类型通常更贴近 JavaScript；应按互操作、反向映射和产物要求选择。'],
    ['tsconfig-boundary', 'tsconfig 严格选项', 'strict、noUncheckedIndexedAccess、exactOptionalPropertyTypes 等逐步提高边界准确性，但开启前要评估迁移量并用 CI 固化。'],
    ['runtime-validation', '类型声明与运行时校验', 'TypeScript 类型会在编译后擦除，无法保证接口、存储或用户输入；外部数据必须用 schema 或手写校验后再转为可信类型。']
  ],
  'frontend.vue': [
    ['effect-scope', 'effectScope 与副作用作用域', 'effectScope 可成组收集 computed、watch 等响应式副作用并统一停止，适合组件外可复用逻辑；组件 setup 内副作用通常由组件自动管理。'],
    ['shallow-reactivity', 'shallowRef 与 shallowReactive', '浅层响应只追踪根层替换或属性，适合大型不可变数据和外部状态；深层原地修改不会自动触发更新。'],
    ['mark-raw', 'markRaw 与 toRaw', 'markRaw 阻止对象被代理，toRaw 临时取得原对象；滥用会造成同一对象代理版和原版身份不一致，应限制在明确边界。'],
    ['custom-ref', 'customRef', 'customRef 允许自行控制依赖 track/trigger，可实现防抖值等；getter 返回新对象或触发时机不稳会造成难以理解的更新。'],
    ['provide-inject', 'provide/inject 的响应性与边界', 'provide/inject 适合跨多层共享上下文；提供 ref 可保持响应性，修改职责最好留在提供者并通过方法暴露。'],
    ['attrs-fallthrough', '透传属性与多根组件', '未声明的属性和监听器可透传到单根节点；多根组件需用 $attrs 明确分配，inheritAttrs 可控制自动透传。'],
    ['v-model-contract', '组件 v-model 契约', 'Vue 3 默认以 modelValue 和 update:modelValue 组成双向绑定契约，也支持参数和修饰符；子组件不应直接修改 prop。'],
    ['error-boundary', 'onErrorCaptured 与全局错误处理', '组件错误可由 onErrorCaptured 和 app.config.errorHandler 观察；错误处理要区分展示兜底、日志上报和是否继续传播。'],
    ['async-component', '异步组件与加载失败', 'defineAsyncComponent 可配置加载、超时、错误组件和重试；生产中还要处理旧 chunk、网络失败与发布版本不一致。'],
    ['render-tracking', 'onRenderTracked 与 onRenderTriggered', '开发期钩子可观察组件渲染依赖被追踪和触发的来源，适合定位意外更新；不应作为生产业务逻辑依赖。'],
    ['template-ref-array', 'v-for 中的模板引用', 'v-for 模板引用会得到元素或组件集合，但顺序不应被当作稳定业务身份；需要按业务键管理时应使用函数 ref 建立映射。'],
    ['define-model', 'defineModel 的使用边界', 'defineModel 简化组件 v-model 声明并返回可写 ref；仍需明确默认值、父子初始同步和更新事件，不是共享全局状态方案。']
  ],
  'frontend.browser': [
    ['dns-resolution', 'DNS 解析与缓存层次', '域名解析可能经过浏览器、系统、递归解析器和权威服务器，各层 TTL 与缓存影响结果；排查不能只清浏览器缓存。'],
    ['tcp-quic', 'TCP、TLS 与 QUIC', 'HTTP/1.1 和 HTTP/2 常基于 TCP，HTTP/3 基于 QUIC/UDP 并集成安全握手；协议升级能减少部分队头阻塞但不消除应用瓶颈。'],
    ['http-idempotency', 'HTTP 方法幂等性', '幂等表示重复执行预期效果相同，不代表没有响应体或没有副作用日志；GET、PUT、DELETE 的协议语义与 POST 不同。'],
    ['cache-vary', 'Vary 与缓存键', 'Vary 告诉缓存将指定请求头纳入缓存键；遗漏可能把压缩、语言或跨域响应错误复用，过多字段则降低命中率。'],
    ['etag', 'ETag 与条件请求', '客户端可用 If-None-Match 携带 ETag，资源未变时服务器返回 304；ETag 强弱语义和多实例一致性需要明确。'],
    ['cors-preflight', 'CORS 预检', '非简单跨域请求可能先发 OPTIONS，服务器需正确返回允许来源、方法和请求头；CORS 是浏览器读响应限制，不是服务端鉴权。'],
    ['cookie-samesite', 'Cookie SameSite、Secure 与 HttpOnly', 'SameSite 限制跨站携带，Secure 要求安全连接，HttpOnly 阻止脚本读取；三者降低部分风险但不能替代 CSRF/XSS 整体治理。'],
    ['render-pipeline', '浏览器关键渲染路径', 'HTML/CSS 解析形成 DOM/CSSOM，之后样式计算、布局、绘制和合成；JavaScript、字体和资源优先级会影响流水线。'],
    ['bfcache', '往返缓存 bfcache', 'bfcache 可保存完整页面状态用于前进后退快速恢复；pageshow/pagehide 与 persisted 可识别恢复，部分监听和资源会影响资格。'],
    ['service-worker', 'Service Worker 生命周期', 'Service Worker 经安装、等待、激活后控制页面；更新不会默认立即接管已有页面，缓存版本和 skipWaiting 使用需防止资源不一致。'],
    ['storage-partition', '浏览器存储分区与隐私限制', '现代浏览器逐步按顶级站点分区第三方存储和缓存，跨站嵌入不能假设共享状态永远可用。'],
    ['event-timing', '任务、微任务与渲染机会', '一次任务结束后通常清空微任务，再由浏览器决定是否渲染；大量微任务也可能推迟绘制，requestAnimationFrame 面向下一次绘制前。']
  ],
  'frontend.react': [
    ['state-snapshot', '状态快照与批处理', '每次渲染读取固定状态快照，事件处理器闭包看到该次渲染值；需要基于前值连续更新时使用函数式更新。'],
    ['effect-event', 'Effect 依赖与非响应逻辑', 'Effect 应声明其读取的响应值；不希望某段逻辑因值变化重新订阅时，应重构边界而不是欺骗依赖检查。'],
    ['use-layout-effect', 'useEffect 与 useLayoutEffect', 'useEffect 通常在绘制后运行，useLayoutEffect 在 DOM 提交后、浏览器绘制前同步运行；后者会阻塞绘制，应只用于必须的测量与修正。'],
    ['controlled-input', '受控与非受控表单', '受控输入由 React 状态决定值，便于统一校验；非受控输入由 DOM 保存值，适合简单或集成场景，切换模式会产生警告。'],
    ['key-identity', 'key 与组件状态身份', 'key 与元素类型共同决定同级组件身份；改变 key 会重置状态，使用不稳定索引会让状态跟错业务项。'],
    ['context-performance', 'Context 更新与性能', 'Provider value 身份变化会通知消费方；拆分上下文、稳定值和外部状态选择器可减少无关更新，memo 不能阻止消费的 context 更新。'],
    ['use-sync-external-store', 'useSyncExternalStore', '外部可变存储应通过一致的 subscribe/getSnapshot 契约接入 React，支持并发渲染与服务端快照，避免撕裂。'],
    ['suspense-data', 'Suspense 与数据获取边界', 'Suspense 展示异步子树的 fallback，但数据源需要框架或兼容缓存集成；普通 useEffect 请求不会自动触发 Suspense。'],
    ['transition', 'startTransition 与更新优先级', 'Transition 把非紧急更新标记为可中断，保持输入等紧急交互响应；它不让计算变快，也不能用于控制文本输入本身。'],
    ['server-component', 'Server Components 边界', 'Server Components 在服务端执行并减少客户端 JavaScript，可直接接近数据源；交互状态和浏览器 API 必须位于客户端组件边界。'],
    ['strict-mode', 'StrictMode 开发期重复执行', '开发模式可能额外执行渲染和 Effect 建立清理循环以暴露不纯逻辑；生产不会照搬该检查，但代码必须能正确清理。'],
    ['error-boundary', 'React Error Boundary', '错误边界捕获子树渲染、生命周期等错误并显示兜底，但不自动捕获事件处理器和所有异步回调；需结合日志和其他错误通道。']
  ],
  'frontend.engineering': [
    ['esm-cjs', 'ESM 与 CommonJS 互操作', 'ESM 是静态依赖图并支持实时绑定，CommonJS 运行时 require/module.exports；默认导入和双包发布需处理工具差异。'],
    ['tree-shaking', 'Tree Shaking 生效条件', 'Tree Shaking 依赖静态模块结构和副作用信息；动态访问、错误 sideEffects 声明或打包格式都可能阻止安全删除。'],
    ['code-splitting', '代码分割策略', '按路由、重功能和低频路径分割可降低首屏体积，但过度切块增加请求与瀑布；需要结合缓存稳定性和预加载。'],
    ['source-map', 'Source Map 安全发布', 'Source Map 将压缩代码映射回源码，便于错误定位；生产可上传到监控平台而不公开访问，并确保版本与产物一致。'],
    ['lockfile', '锁文件与可复现安装', '锁文件记录解析后的依赖图和完整性，CI 应使用 frozen/ci 安装；不同包管理器和运行时版本也需固定。'],
    ['monorepo-cache', 'Monorepo 任务图与缓存', '任务缓存键必须包含源码、依赖、配置和环境输入；声明不完整会复用错误产物，声明过宽则失去缓存收益。'],
    ['env-injection', '前端环境变量边界', 'Vite 等注入到客户端的变量最终会进入公开产物，不能存放密钥；环境差异应在构建或运行配置层明确管理。'],
    ['chunk-hash', '内容哈希与静态资源缓存', '静态资源文件名使用内容哈希可长期缓存，HTML 应及时更新并引用新资源；发布时需保留旧 chunk 以服务仍打开的旧页面。'],
    ['ci-gates', 'CI 质量门禁', '构建、类型检查、测试、lint、依赖审计和产物检查覆盖不同风险；门禁应稳定、可重复，并对失败给出可定位证据。'],
    ['feature-flag', 'Feature Flag 与渐进发布', '功能开关把部署和启用解耦，支持灰度与快速关闭；开关需要所有者、到期清理和服务端权限边界。'],
    ['semver', '语义化版本与破坏性变更', 'SemVer 用主次修订表达兼容承诺，但前提是明确公共 API；0.x、peer dependency 和实际生态兼容仍需阅读变更日志。'],
    ['supply-chain', '前端供应链治理', '锁定依赖、审查安装脚本、最小化发布权限、生成 SBOM 和及时响应漏洞可降低供应链风险；不能只依赖 npm audit 数字。']
  ],
  'frontend.performance': [
    ['lcp-phases', 'LCP 分阶段诊断', 'LCP 可拆为 TTFB、资源发现延迟、资源下载和元素渲染延迟；不同阶段需要服务端、优先级、资源大小或主线程方案。'],
    ['inp', 'INP 与长任务', 'INP 衡量交互到下一次绘制的整体延迟，包括输入延迟、处理和呈现；应拆分长任务并减少关键交互同步工作。'],
    ['cls', 'CLS 与布局稳定性', '未预留媒体尺寸、动态插入内容和字体度量变化会造成非预期位移；用户输入后短窗口内的位移有特殊计分规则。'],
    ['resource-priority', 'preload、prefetch 与 fetchpriority', 'preload 提前获取当前导航关键资源，prefetch 面向可能的未来导航，fetchpriority 提示相对优先级；滥用会抢占真正关键资源。'],
    ['image-format', '图片格式与响应式交付', 'AVIF/WebP 等可能降低体积，但编码成本和兼容回退需评估；结合实际显示尺寸、srcset、压缩质量和 CDN 转换。'],
    ['js-execution', 'JavaScript 执行成本', '下载体积只是部分成本，解析、编译、初始化和框架水合也占主线程；减少无用代码和延迟非关键初始化通常更有效。'],
    ['virtualization', '列表虚拟化边界', '虚拟化减少 DOM 数量但不减少后端数据查询和所有内存；动态高度、焦点、可访问性和滚动定位需要额外处理。'],
    ['memoization-cost', '缓存与 memo 的成本', '缓存会增加比较、内存和失效复杂度；只有重复计算或渲染成本高且命中稳定时才可能收益，应先测量。'],
    ['third-party', '第三方脚本治理', '分析、客服和广告脚本可能竞争网络与主线程；应盘点所有者、延迟加载、设置预算并隔离失败，不能只优化自有包。'],
    ['rum-lab', '实验室数据与真实用户监控', 'Lighthouse 等实验室数据可复现诊断，RUM 反映真实设备网络分布；二者口径和样本不同，应结合使用。'],
    ['performance-budget', '性能预算', '预算可限制关键资源体积、请求数和 Web Vitals 分位数，在 CI 与监控中阻止持续退化；阈值应对应业务体验。'],
    ['memory-leak', '前端内存泄漏排查', '持续增长常来自未清理监听、计时器、订阅、闭包和脱离 DOM；用堆快照、分配时间线和可复现操作比较保留路径。']
  ],
  'frontend.security': [
    ['xss-context', 'XSS 的上下文编码', 'HTML、属性、URL、JavaScript 和 CSS 上下文需要不同处理；框架默认转义文本不代表 innerHTML 等危险入口安全。'],
    ['dom-xss', 'DOM XSS Source 与 Sink', 'location、postMessage、存储等不可信 source 流入 innerHTML、eval 等 sink 可造成 DOM XSS；应使用安全 DOM API 和可信解析。'],
    ['csrf-token', 'CSRF 防护组合', 'SameSite Cookie、CSRF Token、Origin/Referer 校验和重新认证可组合防护；GET 不应执行重要写操作。'],
    ['csp', 'CSP 与 nonce', 'CSP 可限制脚本来源并用 nonce/hash 允许可信内联脚本；unsafe-inline 会明显削弱效果，策略应先报告再收紧。'],
    ['trusted-types', 'Trusted Types', 'Trusted Types 可要求危险 DOM sink 接受经过策略创建的可信值，帮助收敛 DOM XSS；策略本身仍必须正确净化。'],
    ['clickjacking', '点击劫持防护', 'frame-ancestors 或 X-Frame-Options 限制页面被嵌入，敏感操作还应有清晰确认；前端 frame busting 脚本不是可靠主防线。'],
    ['open-redirect', '开放重定向', '直接信任 redirect 参数可被用于钓鱼和认证链攻击；应使用站内相对路径、允许列表并规范化后校验。'],
    ['postmessage', 'postMessage 安全', '发送时指定精确 targetOrigin，接收时验证 origin、source 和消息结构；不能只检查消息里自报的来源字段。'],
    ['token-storage', 'Token 存储权衡', 'localStorage 易被 XSS 读取，HttpOnly Cookie 减少脚本读取但需处理 CSRF；没有对所有架构都绝对安全的单一位置。'],
    ['dependency-risk', '依赖漏洞与可利用性', '漏洞等级只是线索，还要确认受影响版本、调用路径、运行环境和修复风险；锁文件与持续更新流程同样重要。'],
    ['file-upload', '文件上传安全', '客户端 accept 只改善选择体验，服务端必须验证大小、类型、内容、文件名和存储位置，并对公开文件设置安全响应头。'],
    ['prototype-pollution', '原型污染', '把不可信键深度合并到普通对象可能修改原型链；应过滤危险键、使用安全库和无原型字典，并及时升级依赖。']
  ],
  'frontend.testing': [
    ['test-pyramid', '测试分层与风险', '单元、组件、集成和端到端测试反馈速度与真实度不同；应按故障成本配置组合，而不是追求固定金字塔比例。'],
    ['query-role', 'Testing Library 查询优先级', '优先按 role、label 和可见文本查询，能同时贴近用户和可访问性；testid 适合缺少稳定语义的最后手段。'],
    ['mock-boundary', 'Mock 的边界选择', 'Mock 外部不稳定边界而保留被测协作更有价值；过度 mock 内部实现会让重构困难且无法发现集成问题。'],
    ['fake-timer', '假计时器', '假计时器可确定性测试延时、防抖和重试，但 Promise 微任务、框架更新和真实时间 API 需按测试工具规则推进。'],
    ['network-mock', '网络层模拟', '在请求边界用 MSW 等模拟真实 HTTP 契约，比直接 mock service 函数更能覆盖序列化、状态码和错误处理。'],
    ['contract-test', '契约测试', '契约测试验证消费者与提供者对请求响应结构的共同承诺，可降低前后端独立发布风险，但不能替代完整业务集成测试。'],
    ['visual-regression', '视觉回归测试', '截图差异适合捕获布局和样式回归，需要固定字体、视口和动态数据并设置合理阈值；差异仍需人工判断。'],
    ['a11y-test', '自动化可访问性测试', 'axe 等能发现缺少名称、对比度和结构问题，但无法完全判断键盘流程、朗读体验和业务语义，需要人工补充。'],
    ['flaky-test', '不稳定测试治理', '随机失败常来自共享状态、未等待条件、时间和网络依赖；应定位根因，隔离只能临时止损，不能无限重试掩盖。'],
    ['e2e-wait', '端到端测试等待策略', '等待可观察状态或网络响应，不使用固定 sleep 猜时间；定位器应基于稳定语义并利用框架自动等待。'],
    ['coverage', '覆盖率的正确使用', '覆盖率说明代码被执行，不说明断言有效或需求正确；适合作为盲区信号和最低门槛，不能作为唯一质量目标。'],
    ['test-data', '测试数据与隔离', '每个测试应拥有可预测数据和清理策略，避免依赖执行顺序；数据库测试可使用事务、独立 schema 或专用实例。']
  ],
  'frontend.interview.output': [
    ['closure-loop', '循环闭包与 let/var 输出', 'var 循环共享同一函数作用域绑定，异步回调常看到最终值；let 在每次迭代创建新绑定，输出应按回调实际执行时读取的绑定推导。'],
    ['promise-finally', 'Promise finally 返回值输出', 'finally 的普通返回值通常不替换原 fulfilled 值，但抛错或返回 rejected Promise 会改变后续链状态。'],
    ['async-await-order', '连续 await 的输出顺序', 'await 会先求值右侧并暂停当前 async 函数，后续作为微任务恢复；多个 async 调用需按微任务登记先后推导。'],
    ['thenable', 'Thenable 同化输出', 'Promise.resolve 或 resolve 遇到 thenable 会读取并调用其 then，最终状态采用 thenable 结果；getter 抛错也会导致拒绝。'],
    ['class-field', '类字段初始化顺序输出', '基类字段在基类构造阶段初始化，派生类字段在 super 返回后初始化；字段覆盖和方法动态分派可能产生反直觉结果。'],
    ['object-key-order', '对象键枚举顺序输出', '普通对象自有键通常按整数索引升序、其他字符串插入序、Symbol 插入序枚举；不能简单断言所有键永远完全按写入顺序。'],
    ['delete-array', 'delete 数组元素输出', 'delete 删除属性但不移动后续索引，也不改变 length，形成空槽；splice 才会重排并改变长度。'],
    ['default-param', '默认参数作用域输出', '默认参数在独立参数环境求值，可引用前面的参数但不能依赖函数体内尚未初始化的变量。'],
    ['tagged-template', '标签模板输出', '标签函数收到冻结的字符串片段数组和各插值值，String.raw 等可观察原始转义；它不是先拼成完整字符串再传入。'],
    ['symbol-conversion', 'Symbol 类型转换输出', 'Symbol 可显式转为字符串，但隐式拼接等部分字符串转换会抛 TypeError；应逐个运算符判断抽象操作。'],
    ['optional-chain', '可选链短路输出', '可选链只在链中指定位置遇到 null/undefined 时短路，括号拆断链后后续访问仍可能抛错，副作用表达式也可能不执行。'],
    ['microtask-starvation', '递归微任务的输出与渲染', '微任务可以继续登记微任务，宿主通常会持续清空队列；无限递归会饿死后续任务和渲染，而不是自动让出。']
  ],
  'frontend.interview.handwritten': [
    ['promise-all-settled', '手写 Promise.allSettled', '结果必须保持输入顺序并记录 fulfilled/rejected 状态；空可迭代对象应立即完成，输入值需经 Promise.resolve 同化。'],
    ['promise-any', '手写 Promise.any', '任一 fulfilled 即完成，全部 rejected 才以 AggregateError 拒绝；空输入同样属于全部拒绝。'],
    ['concurrency-pool', '手写并发任务池', '限制同时运行数量并保持结果顺序，需要处理同步抛错、异步拒绝、空任务、取消和是否遇错即停。'],
    ['event-emitter', '手写 EventEmitter', '需要定义 on、off、once、emit 的监听器快照和 this/参数语义，并防止 once 包装后无法按原函数移除。'],
    ['lru-cache', '手写 LRU Cache', 'Map 可利用插入顺序实现 O(1) 访问更新和淘汰；get 命中要移动到最近使用端，容量零需明确。'],
    ['deep-equal', '手写深比较', '要明确支持的类型、循环引用、原型、键顺序、NaN 和集合语义；生产实现不能只递归 Object.keys。'],
    ['compose', '手写 compose 与 pipe', 'compose 从右向左组合，pipe 从左向右；异步混合、this、多个初始参数和异常传播需要事先定义。'],
    ['retry-backoff', '手写指数退避重试', '只重试可恢复错误，限制次数并加入抖动，支持取消；非幂等写操作需使用幂等键避免重复副作用。'],
    ['request-dedupe', '手写请求去重缓存', '相同键并发请求共享进行中的 Promise，完成后按策略缓存或删除；拒绝结果通常不应永久缓存。'],
    ['scheduler', '手写时间分片调度器', '把长任务拆为可中断小块并在预算耗尽时让出主线程；需处理优先级、取消和浏览器调度 API 降级。'],
    ['reactive-core', '手写最小响应式系统', '通过读取 track、写入 trigger 和 activeEffect 建立依赖；还需避免重复依赖、递归触发并支持清理旧分支。'],
    ['virtual-dom', '手写最小 keyed diff', '先保证创建、删除、更新和 key 身份正确，再讨论双端或最长递增子序列优化；DOM 移动与组件状态复用必须一致。']
  ],
  'frontend.interview.vue': [
    ['proxy-identity', '为什么 reactive(proxy) 身份不同', 'reactive 返回 Proxy，通常不与原对象严格相等；应在响应式边界使用代理对象并避免原始对象与代理对象混作 Map 键。'],
    ['computed-dirty', 'computed 缓存如何失效', 'computed 读取时收集依赖并缓存，依赖变化时标记脏且通知使用者，下一次读取才重新求值；getter 应保持纯净。'],
    ['watch-cleanup', 'watch 请求清理为什么重要', 'watch 每轮副作用可在下一轮或停止前清理旧请求和监听，避免旧响应覆盖新状态；清理注册时机受版本和异步边界限制。'],
    ['scheduler-batching', 'Vue 为什么批量更新', '同一同步任务内多次状态修改会被调度器去重并在微任务批次刷新，减少重复渲染；同步读取 DOM 可能仍是旧值。'],
    ['component-vnode', '组件更新由什么触发', '组件渲染读取的响应式依赖变化、父组件传入的新 props/slots 等可触发更新；并非父组件一更新所有 DOM 都必然重建。'],
    ['fragment', '多根节点 Fragment 的影响', 'Vue 3 组件可返回多根 Fragment，但属性自动透传目标不再唯一，需要显式绑定 $attrs；样式和 DOM 定位也要考虑多个根。'],
    ['teleport-event', 'Teleport 后事件和组件关系', 'Teleport 改变真实 DOM 挂载位置，但逻辑组件父子关系仍保留，provide/inject 和组件事件按组件树工作；CSS 与原生事件受 DOM 位置影响。'],
    ['keepalive-cache-key', 'KeepAlive 如何区分缓存实例', '组件类型与 key 共同影响缓存身份，include/exclude/max 控制范围；缓存实例停用但未卸载，外部副作用仍需按语义处理。'],
    ['router-view-slot', 'RouterView 插槽与过渡缓存顺序', '通过 RouterView 插槽取得 Component 后组合 Transition/KeepAlive，可精确控制缓存和动画；包裹顺序会影响生命周期。'],
    ['pinia-ssr', 'Pinia SSR 状态注入安全', '服务端必须为每个请求创建独立 store 容器并安全序列化初始状态，避免跨请求污染和脚本注入。'],
    ['hydration-strategy', '异步组件水合策略', 'Vue 3.5 可为异步组件选择可见、空闲、媒体查询或交互时水合；延迟水合需权衡首屏成本与首次交互。'],
    ['compiler-macros', 'defineProps 等为何无需导入', 'script setup 编译宏在编译期处理并被移除，不是普通运行时函数；参数需要满足编译器可静态分析的约束。']
  ],
  'frontend.interview.scenario': [
    ['offline-submit', '弱网下表单防重复与离线提交', '前端生成幂等键、保存草稿并明确提交状态，服务端按幂等键去重；离线队列恢复后需处理过期、冲突和用户切换。'],
    ['large-upload', '大文件分片上传与恢复', '分片需有文件指纹、并发限制、校验和、已上传查询与合并确认；秒传只代表服务端已有可信内容，权限仍需校验。'],
    ['multi-tab-auth', '多标签页登录状态同步', '可通过 BroadcastChannel 或 storage 事件传播登录、退出和刷新结果，并用版本或时间戳避免旧标签覆盖新状态。'],
    ['optimistic-update', '乐观更新失败回滚', '保存旧状态或可逆补丁，先更新界面再请求；失败时仅回滚对应操作，处理并发顺序和服务端最终版本冲突。'],
    ['infinite-scroll', '无限滚动重复与漏数据', '使用稳定复合游标而非易漂移 offset，按唯一 ID 去重，并处理筛选变化、回退恢复、加载失败和列表末尾。'],
    ['realtime-reconnect', 'WebSocket 断线重连与消息补偿', '采用指数退避和抖动重连，携带最后序号补拉缺失消息；服务端需心跳、鉴权续期、顺序和去重设计。'],
    ['microfrontend', '微前端隔离与通信', '先确认团队和独立发布是否真需要微前端，再设计路由、样式、依赖、认证和故障隔离；通信应使用稳定契约。'],
    ['schema-form', '动态表单引擎设计', '把字段 schema、布局、校验、联动和权限分层，使用稳定字段 ID 保存数据；复杂表达式需受控执行并可版本迁移。'],
    ['i18n', '国际化与本地化工程', '文案使用稳定 key 和 ICU 类复数规则，布局支持文本膨胀与 RTL；日期、数字、货币和时区用 Intl 按 locale 格式化。'],
    ['timezone', '跨时区日期错误排查', '区分时间点、日历日期和时区展示；接口传 ISO 时间点及明确时区，生日等纯日期不要误当 UTC 时间点换算。'],
    ['frontend-observability', '前端监控与错误关联', '采集错误、资源失败、接口、Web Vitals 和用户路径，使用 release、traceId 与 source map 关联；采样和脱敏必须前置。'],
    ['config-rollout', '远程配置错误的止损设计', '配置应有 schema 校验、默认值、版本、灰度、审计和一键回退；客户端要对缺失或非法配置采取安全降级。']
  ],
  'frontend.interview.algorithm': [
    ['two-sum-variants', '两数之和及变体', '哈希表可用空间换取一次遍历，排序双指针可降低额外空间但改变索引关系；要明确重复值和返回所有组合的要求。'],
    ['sliding-window', '滑动窗口适用条件', '连续区间且窗口扩张收缩具有可维护性质时可用滑动窗口；含负数的和问题不一定满足单调收缩条件。'],
    ['monotonic-stack', '单调栈', '单调栈保留尚未找到答案的候选，当前元素一次弹出被支配项，常用于下一个更大元素和柱状图问题。'],
    ['heap-topk', '堆解决 Top K', '维护大小为 K 的小顶堆可在 O(n log k) 得到最大 K 项，适合流式数据；全排序为 O(n log n)。'],
    ['union-find', '并查集', '并查集用父指针表示集合，路径压缩和按秩合并使操作近似常数，适合动态连通性而不擅长删除边。'],
    ['trie', 'Trie 前缀树', 'Trie 按字符路径共享前缀，查询复杂度与词长相关；空间可能很大，需按字符集选择子节点表示。'],
    ['topological-sort', '拓扑排序与依赖环', '统计入度或 DFS 可对有向无环图排序；处理节点数少于总数说明存在环，可用于课程依赖和构建图。'],
    ['dijkstra', 'Dijkstra 的适用边界', 'Dijkstra 依赖非负边权，每次确定当前最短未访问节点；有负权边应选择其他算法。'],
    ['backtracking-prune', '回溯与剪枝', '回溯枚举选择树并在不可能满足条件时剪枝；必须维护选择、递归、撤销的不变量，避免共享状态污染。'],
    ['dp-state', '动态规划状态设计', '先定义状态含义和转移来源，再确定初始化和遍历顺序；只背公式容易在边界和压缩维度时出错。'],
    ['tree-iteration', '二叉树迭代遍历', '显式栈模拟递归调用状态；前中后序的入栈顺序不同，层序遍历使用队列并按层记录长度。'],
    ['lru-design', 'LRU 数据结构设计', '哈希表负责 O(1) 定位，双向链表负责 O(1) 移动和淘汰；需要哨兵节点简化边界。']
  ],
  'backend.node': [
    ['event-loop-phases', 'Node.js 事件循环阶段', 'Node 事件循环包含 timers、poll、check 等阶段，微任务和 process.nextTick 有特殊处理；具体顺序需结合 Node 版本和 I/O 上下文。'],
    ['worker-threads', 'Worker Threads 使用场景', 'Worker 适合 CPU 密集 JavaScript 并行计算并可共享内存；普通异步 I/O 不必为每个请求创建 Worker。'],
    ['cluster-process', '多进程与无状态服务', '多进程利用多核但内存不共享，Session、限流和任务状态需外置或粘性策略；进程间通信也有成本。'],
    ['stream-pipeline', 'stream.pipeline', 'pipeline 连接流并统一传播错误与销毁，降低手写 pipe 链遗漏清理的风险；仍需正确处理最终回调或 Promise。'],
    ['buffer-encoding', 'Buffer 与字符编码', 'Buffer 保存字节，字符串转换必须指定一致编码；按字节截断 UTF-8 可能切断多字节字符。'],
    ['module-cache', 'Node 模块缓存', 'CommonJS 通常按解析后的文件名缓存模块，重复 require 返回同一实例；测试隔离和多路径解析时不能盲目依赖单例。'],
    ['uncaught-error', '未捕获异常与未处理拒绝', '未捕获错误可能让进程处于未知状态，生产应记录后优雅退出并由进程管理器重启；不能捕获后无条件继续。'],
    ['graceful-shutdown', '优雅停机', '收到终止信号后先停止接收新请求，等待或限时结束在途请求，再关闭数据库、队列和日志资源。'],
    ['async-context', '异步上下文追踪', 'AsyncLocalStorage 可在异步链保存请求 ID 等上下文，但跨特殊回调边界或错误绑定时可能丢失，需要集成测试。'],
    ['eventemitter-leak', 'EventEmitter 监听泄漏', '默认监听器警告是诊断信号，常见原因是按请求重复注册且未移除；增大阈值不能解决真实泄漏。'],
    ['libuv-threadpool', 'libuv 线程池', '部分文件、DNS、加密任务使用共享线程池，CPU 或慢任务可能导致排队；调整大小不是替代容量评估和隔离。'],
    ['diagnostics', 'Node 性能诊断', 'CPU profile、heap snapshot、event loop delay 和 trace 能分别定位计算、泄漏与阻塞；采集需控制生产开销。']
  ],
  'backend.express': [
    ['middleware-order', 'Express 中间件顺序', '请求按注册顺序穿过匹配中间件，错误处理中间件通常放在路由之后；顺序错误会导致鉴权遗漏或错误未统一处理。'],
    ['async-error', 'Express 5 异步错误', 'Express 5 会把返回 Promise 的拒绝交给错误处理链，但回调式异步和响应已开始后的错误仍需专门处理。'],
    ['trust-proxy', 'trust proxy 配置', '位于可信反向代理后才按拓扑配置 trust proxy，否则攻击者可能伪造 X-Forwarded-* 影响协议、IP 和安全判断。'],
    ['body-limit', '请求体大小限制', 'JSON、表单和上传都应设置符合业务的上限，超限尽早拒绝；客户端 Content-Length 也不能作为唯一可信依据。'],
    ['rate-limit', '限流键与分布式一致性', '限流应按用户、IP、接口和成本设计键，在多实例中使用共享存储；还要处理代理 IP、突发和可信客户端。'],
    ['idempotency', '写接口幂等键', '客户端为可能重试的写操作提交幂等键，服务端原子记录请求语义和结果；相同键不同请求体应拒绝。'],
    ['validation', '接口输入验证与规范化', '在路由边界验证类型、范围和未知字段，再进入业务服务；规范化不能偷偷改变有安全意义的数据。'],
    ['authorization', '资源级授权', '认证只确认是谁，授权还要验证其能否操作具体资源；仅检查角色而不校验资源归属会产生越权。'],
    ['error-contract', '统一错误响应契约', '错误应有稳定 code、用户消息和 traceId，生产不泄露堆栈；HTTP 状态与业务错误码各自承担不同职责。'],
    ['stream-response', '流式响应错误边界', '响应头发出后不能再改成普通 JSON 错误，流需要监听断开、传播错误和释放上游资源。'],
    ['helmet-cors', 'Helmet 与 CORS 职责', 'Helmet 设置多类安全响应头，CORS 控制浏览器跨源读取；两者不能替代鉴权、输出编码和输入验证。'],
    ['request-timeout', '请求超时与取消传播', '入口超时后应通知下游取消数据库或外部请求，并避免超时后继续写响应；不同代理层超时要协调。']
  ],
  'backend.python': [
    ['mutable-default', '可变默认参数', '默认参数在函数定义时求值，列表或字典会在多次调用间共享；通常用 None 并在函数内创建新对象。'],
    ['context-manager', '上下文管理器', 'with 通过 __enter__/__exit__ 或异步协议保证资源在异常路径也释放，适合文件、锁、事务和连接。'],
    ['generator-send', '生成器 send 与 yield', 'yield 暂停并保存执行状态，send 可把值送回暂停点；生成器关闭时应正确执行 finally 清理。'],
    ['decorator-metadata', '装饰器与函数元数据', '装饰器返回包装函数，使用 functools.wraps 保留名称、文档和签名相关元数据；闭包参数需注意绑定时机。'],
    ['dataclass', 'dataclass 的适用边界', 'dataclass 自动生成初始化、比较等样板，default_factory 避免共享可变默认值；它不自动完成外部数据运行时验证。'],
    ['typing-protocol', 'Protocol 结构化类型', 'Protocol 按所需成员描述能力，调用方不要求显式继承；运行时检查能力有限，类型提示不会自动执行。'],
    ['gil', 'GIL 与并发选择', 'CPython GIL 限制同一进程多个线程并行执行 Python 字节码，但 I/O 可释放；CPU 密集常用多进程或原生扩展。'],
    ['asyncio-cancel', 'asyncio 取消', '任务取消通过 CancelledError 协作传播，finally 中应释放资源，通常不要吞掉取消导致上层误以为已停止。'],
    ['exception-chain', '异常链与 raise from', 'raise ... from ... 可明确业务异常由底层异常导致，保留诊断上下文；对外响应仍要隐藏敏感实现信息。'],
    ['mro-super', 'MRO 与协作式 super', 'super 按当前类的 MRO 找下一个实现，不固定等于父类；多继承各层需兼容签名并继续调用。'],
    ['descriptor', '描述符协议', '实现 __get__、__set__ 或 __delete__ 的对象参与属性访问，property、绑定方法和许多 ORM 字段建立在此机制上。'],
    ['packaging', 'Python 依赖与虚拟环境', '项目应隔离解释器环境并锁定可重现依赖，区分应用锁定和库的兼容范围；不要把本地环境目录提交。']
  ],
  'backend.fastapi': [
    ['dependency-cache', '依赖注入缓存与 use_cache', '同一请求内相同依赖默认可复用结果，use_cache 可调整；依赖作用域不是跨请求全局缓存。'],
    ['yield-dependency', 'yield 依赖的资源清理', 'yield 前建立资源，yield 后在响应生命周期相应阶段清理；异常和流式响应时机需要按 FastAPI 版本验证。'],
    ['pydantic-model', 'Pydantic 输入输出模型分离', '创建、更新、数据库和响应模型职责不同，分离可避免客户端写入服务端字段或响应泄露敏感字段。'],
    ['async-blocking', 'async 路由中的阻塞调用', 'async def 内直接执行同步阻塞 I/O 或 CPU 任务会卡住事件循环，应使用异步库、线程池或外部任务系统。'],
    ['background-reliability', 'BackgroundTasks 可靠性边界', '进程内任务适合短小非关键工作；需要持久化、重试、调度和独立扩缩容的任务应使用队列。'],
    ['openapi-security', 'OpenAPI 安全方案与真实鉴权', 'OpenAPI security scheme 描述客户端如何携带凭据，真实身份验证和授权仍由依赖与服务端逻辑执行。'],
    ['exception-handler', '异常处理器分层', '业务异常映射稳定 code，校验异常返回字段问题，未知异常记录 traceId 并隐藏堆栈；不要把所有错误都返回 200。'],
    ['lifespan', '应用 lifespan', 'lifespan 上下文包围整个应用运行期，适合连接池和模型初始化；测试也应触发相同生命周期。'],
    ['websocket-auth', 'WebSocket 鉴权和断线', '握手时验证身份并在长连接期间处理过期、心跳和权限变化；不能只相信客户端连接后的自报用户 ID。'],
    ['streaming', 'StreamingResponse', '生成器逐块产生响应可降低峰值内存，但需处理客户端断开、上游取消、媒体类型和代理缓冲。'],
    ['middleware-context', 'ASGI 中间件与上下文', '中间件包围请求响应，可做追踪、耗时和安全头；BaseHTTPMiddleware 与纯 ASGI 在流和上下文变量上有差异。'],
    ['test-override', '依赖覆盖测试', 'dependency_overrides 可替换数据库或身份依赖，测试结束必须清理，避免共享应用实例污染其他用例。']
  ],
  'database.mongodb': [
    ['embed-reference', '嵌入与引用建模', '一起读取、大小受控且生命周期一致的数据适合嵌入；独立增长、多处共享或高频单独更新的数据更适合引用。'],
    ['compound-index', '复合索引字段顺序', '字段顺序由等值、排序、范围及真实查询决定，索引前缀可复用；不能只按字段选择性机械排序。'],
    ['multikey', '多键索引边界', '数组字段建立多键索引可索引元素，但一个复合索引中多个数组路径存在限制，数组展开也会增加索引项。'],
    ['partial-index', '部分索引', 'partialFilterExpression 只索引满足条件文档，可降低体积并支持条件唯一；查询条件需能推出过滤条件才能可靠使用。'],
    ['aggregation-order', '聚合管道阶段顺序', '尽早 $match 和合理 $project 可减少后续数据量，但优化器也会重排部分阶段；应以 explain 和实际数据验证。'],
    ['lookup', '$lookup 性能', '$lookup 可做集合关联，但外键索引、输入规模和管道过滤决定成本；高频读场景可能更适合适度反规范化。'],
    ['transaction', 'MongoDB 事务使用边界', '多文档事务提供原子性但增加锁、日志和重试成本；优先用单文档原子模型，事务回调需处理瞬时错误。'],
    ['optimistic-concurrency', '版本字段乐观并发', '更新条件同时匹配 _id 和 version，成功后递增版本；匹配为零表示并发冲突，应重读、合并或提示。'],
    ['change-stream', 'Change Stream 恢复', 'Change Stream 基于复制日志，消费者应保存 resume token、处理失效与重复事件，并让下游操作幂等。'],
    ['ttl', 'TTL 索引的非实时性', 'TTL 后台线程周期删除过期文档，不能承诺秒级触发；查询业务有效性时仍应比较过期时间。'],
    ['shard-key', '分片键选择', '分片键影响分布、路由和热点，应考虑基数、频率、单调性和常用查询；选错后的迁移成本很高。'],
    ['backup-restore', 'MongoDB 备份与恢复验证', '备份成功日志不等于可恢复，应定期在隔离环境恢复并核对索引、权限、数据量和应用读取。']
  ],
  'database.mysql': [
    ['clustered-index', 'InnoDB 聚簇索引与回表', '主键 B+Tree 叶子保存整行，二级索引叶子保存主键；查询缺少覆盖列时需按主键回表，因此主键大小影响所有二级索引。'],
    ['leftmost-prefix', '联合索引最左前缀', '联合索引按字段顺序排序，可利用连续前缀；范围条件后的后续列对定位能力通常受限，但可能仍用于覆盖或下推。'],
    ['index-condition', '索引下推', 'ICP 可在存储引擎索引层判断部分条件，减少回表，不等于减少索引扫描范围；需结合 Extra 和查询结构判断。'],
    ['mvcc', 'MVCC 与 Read View', 'InnoDB 通过版本链和 Read View 支持一致性读，不同隔离级别创建视图时机不同；当前读仍会加锁读取最新版本。'],
    ['next-key-lock', 'Next-Key Lock 与幻读', '范围当前读可能锁定记录和间隙以阻止插入，索引是否命中会显著影响锁范围；普通快照读行为不同。'],
    ['deadlock', '死锁诊断与重试', '数据库检测死锁后回滚一个事务，应用应记录上下文并有限重试；统一加锁顺序和缩短事务可降低发生率。'],
    ['isolation', '事务隔离级别选择', '隔离越强通常并发代价越高，应按脏读、不可重复读、幻读和业务一致性需求选择，不能只背默认值。'],
    ['explain-analyze', 'EXPLAIN ANALYZE', '它实际执行并展示估算与真实行数和耗时，可发现统计偏差；对重写和大查询使用时要注意生产成本。'],
    ['keyset-pagination', '游标分页', '用稳定排序键和唯一键作为游标范围读取下一页，避免深 offset 扫描；它不支持低成本任意跳页。'],
    ['online-ddl', 'Online DDL 风险', '在线 DDL 仍可能持有元数据锁、消耗 I/O 并受长事务阻塞；大表变更需预估、监控和回滚方案。'],
    ['replication-lag', '主从延迟与读后写一致性', '异步复制下刚写入的数据可能尚未出现在从库；关键读可走主库、使用会话粘性或等待位点。'],
    ['backup-pitr', '备份与时间点恢复', '完整备份结合 binlog 可恢复到指定时间；必须验证 binlog 连续性、保留期和隔离恢复流程。']
  ],
  'database.redis': [
    ['cache-aside', 'Cache Aside 一致性', '常见写路径先更新数据库再删除缓存，仍有并发窗口；可用延迟双删、消息订阅或版本化降低风险，不能承诺强一致。'],
    ['penetration', '缓存穿透', '不存在的键持续访问数据库，可用空值短缓存、布隆过滤器和请求校验；布隆过滤器有假阳性且需要维护。'],
    ['breakdown', '缓存击穿', '热点键过期时大量请求同时回源，可用互斥重建、逻辑过期和提前刷新，并确保失败时释放锁。'],
    ['avalanche', '缓存雪崩', '大量键同时过期或节点故障会集中回源；过期时间加抖动、多级缓存、限流降级和容量预案共同防护。'],
    ['distributed-lock', 'Redis 分布式锁边界', '使用唯一 token 和原子比较删除，设置租期并处理续期；锁过期后旧持有者继续写需要 fencing token 等额外保护。'],
    ['lua', 'Lua 脚本原子性', 'Redis 在单线程执行脚本期间不会穿插其他命令，可组合读改写；长脚本会阻塞实例，集群还受键槽限制。'],
    ['persistence', 'RDB 与 AOF', 'RDB 恢复快且快照间可能丢数据，AOF 记录写命令并有不同 fsync 策略；生产常按恢复目标组合并验证。'],
    ['replication', '复制与故障转移', '复制通常异步，主节点确认不代表副本已持久化；故障转移可能丢最近写入，需要按业务风险设计。'],
    ['cluster-slot', 'Cluster 哈希槽与多键操作', '键映射到 16384 槽，多键原子操作通常要求同槽；hash tag 可控制槽位但可能造成热点。'],
    ['big-key', 'Big Key 风险', '大集合或大值会增加网络、删除和迁移阻塞；应扫描元素数和内存，拆分并使用渐进删除。'],
    ['hot-key', 'Hot Key 风险', '单个高频键可能压垮一个分片，需监控访问分布并采用本地缓存、读副本或业务拆分，复制键会增加一致性成本。'],
    ['memory-fragmentation', '内存碎片与淘汰', 'used_memory 与 RSS 差异反映分配器和碎片影响；淘汰策略、主动碎片整理和重启迁移需结合指标谨慎操作。']
  ]
}

function buildExplanation(meta, topic, summary) {
  const [name, mechanism, sourceTopics] = meta
  return [
    '**答案与结论**',
    summary,
    '**参考作答框架**',
    `1. **先下定义：** 说明“${topic}”解决的具体问题，不先堆 API 名称。\n2. **再讲机制：** 从${mechanism}解释输入如何变成结果。\n3. **补充选择依据：** 说明适用条件、替代方案和失败边界。\n4. **落到项目：** 给出可观察指标、验证步骤和清理或回滚办法。`,
    '**小白理解与核心原理**',
    `${summary} 可以把它理解成一份“行为契约”：调用者提供满足条件的输入，${name}运行环境按规则处理，再产生可以验证的输出。学习时要把定义、触发条件、执行过程和例外分开，避免只背一句结论。相关官方资料主题包括 ${sourceTopics}，实际行为还要结合当前运行时版本。`,
    '**项目实践与排错**',
    `项目里遇到“${topic}”相关问题时，先保留最小输入并记录预期结果，再用日志、测试或开发工具观察真实执行顺序和状态。随后分别验证正常输入、空值或极端输入、重复触发、并发执行、失败重试以及资源释放。修复后增加自动化用例和监控信号，确保问题不是只在当前样本上消失。`,
    '**常见误区与面试追问**',
    `常见误区是把“通常如此”回答成“任何环境都必然如此”，或者只说工具名而解释不了取舍。面试时可以继续追问：这个机制的前置条件是什么？数据量或并发扩大后哪里先成为瓶颈？失败后怎样恢复？为什么不用另一个常见方案？怎样用最小示例证明结论？回答这些问题时应明确版本、宿主环境、安全边界和性能代价。`
  ].join('\n\n')
}

const questions = Object.entries(topics).flatMap(([categoryKey, items]) => {
  const meta = categoryMeta[categoryKey]
  if (!meta) throw new Error(`缺少分类元信息：${categoryKey}`)
  return items.map(([slug, topic, summary], index) => ({
    code: `coverage-${categoryKey.replaceAll('.', '-')}-${String(index + 1).padStart(2, '0')}-${slug}`,
    categoryKey,
    type: 'short_answer',
    assessmentMode: 'self',
    stem: `请从定义、核心机制、项目使用和常见误区四个角度解释「${topic}」。`,
    answerKeys: [summary],
    explanation: buildExplanation(meta, topic, summary),
    difficulty: index < 4 ? 'medium' : 'hard',
    tags: [meta[0], topic.length <= 30 ? topic : topic.slice(0, 30), '知识点覆盖', categoryKey.startsWith('frontend.') ? '前端面试' : '全栈面试']
  }))
})

const counts = Object.fromEntries(Object.keys(topics).map((key) => [key, topics[key].length]))
console.log(`[题库覆盖扩容] 模式：${apply ? 'apply' : 'dry-run'}`)
console.log(`[题库覆盖扩容] 新增题目：${questions.length}；覆盖分类：${Object.keys(topics).length}`)
for (const [key, count] of Object.entries(counts)) console.log(`- ${key}: ${count}`)

if (apply) {
  fs.writeFileSync(outputPath, `${JSON.stringify({ schemaVersion: 1, questions }, null, 2)}\n`, 'utf8')
  console.log(`[题库覆盖扩容] 已写入：${outputPath}`)
} else {
  console.log('[题库覆盖扩容] 当前为 dry-run，传入 --apply 后生成数据文件。')
}
