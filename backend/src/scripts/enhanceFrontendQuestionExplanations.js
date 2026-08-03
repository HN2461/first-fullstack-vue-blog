import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const scriptDir = path.dirname(fileURLToPath(import.meta.url))
const dataDir = path.resolve(scriptDir, '../data/questionBank')
const applyChanges = process.argv.includes('--apply')
const enhancedMarker = '**答案与结论**'

const categoryGuides = {
  'frontend.html': 'HTML 决定页面的内容结构和原生语义。学习时不要只记标签名称，还要同时考虑默认行为、键盘操作、屏幕阅读器以及浏览器兼容边界。真实项目应优先使用语义匹配的原生元素，再用 CSS 调整外观；只有原生能力确实不足时，才补充 ARIA 和 JavaScript。',
  'frontend.css': 'CSS 的答案通常来自层叠、格式化上下文、包含块和布局算法，而不是某个属性“突然失效”。排查时先确认最终计算样式，再确认元素处于普通流、Flex、Grid 还是定位上下文，最后检查尺寸约束、滚动容器和层叠上下文。',
  'frontend.javascript': 'JavaScript 题要按“创建执行上下文、读取变量、求值、调用函数、调度异步任务”的顺序推导，不能只凭运行经验猜结果。还要明确严格模式、浏览器或 Node.js 环境，以及使用的是哪一版语言和 Web API。',
  'frontend.typescript': 'TypeScript 在编译阶段检查类型，运行时通常仍是 JavaScript。回答类型题时要区分“类型系统允许什么”和“运行时真正发生什么”，并说明类型收窄、泛型约束及边界数据校验各自负责哪一层。',
  'frontend.vue': 'Vue 3 面试题应围绕“响应式依赖如何收集、状态变化如何调度更新、组件边界如何传递数据”来回答。API 名称只是表面，真正重要的是它追踪了什么、何时执行、何时清理，以及在组件卸载、异步请求和服务端渲染下有什么边界。',
  'frontend.browser': '浏览器与网络题要区分浏览器安全策略、HTTP 协议语义和业务代码行为。排查时结合 DevTools 的 Network、Performance、Application 和 Console 面板，用请求头、响应头、时间线和缓存状态验证结论。',
  'frontend.react': 'React 题的核心是状态快照、单向数据流、渲染与提交阶段，以及 Effect 的同步外部系统职责。不要把 memo 或 Hook 当成必然优化，要结合依赖稳定性、渲染成本和测量结果判断。',
  'frontend.engineering': '工程化方案要说明它解决的是开发效率、构建产物、依赖治理还是发布稳定性。面试中不能只报工具名，应讲清输入、处理过程、输出、缓存失效条件和生产环境边界。',
  'frontend.performance': '性能优化必须先测量再行动。要把网络加载、主线程执行、渲染和用户交互分开分析，并用 LCP、INP、CLS、长任务和资源瀑布等证据验证优化是否真正改善用户体验。',
  'frontend.security': '前端安全的基本原则是所有来自用户、URL、存储和接口的数据都不可信。前端校验只能改善体验，真正的鉴权、数据权限和可信校验必须在服务端完成；CSP、SameSite 等机制属于纵深防御，不能替代正确编码和权限控制。',
  'frontend.testing': '测试应围绕用户可观察行为和稳定契约，而不是组件内部实现细节。单元、组件、集成与端到端测试覆盖不同风险，数量和粒度应由故障成本决定。',
  'frontend.interview.output': '代码输出题建议逐行写出同步输出、已登记的微任务、已登记的宏任务和最终输出。遇到 this、提升或类型转换时，先写规则再代入；若结果依赖宿主环境，应主动说明浏览器与 Node.js 的差异。',
  'frontend.interview.handwritten': '手写题不仅要写出主流程，还要主动说明参数、返回值、this、异常、清理逻辑和边界输入。面试官通常更看重你是否知道简化实现与生产实现之间的差距。',
  'frontend.interview.vue': 'Vue 高频追问不能停留在 API 对比。回答时先说适用场景，再解释响应式或渲染机制，最后补充清理、性能、SSR 和组件生命周期边界，并给出项目中真实的选择依据。',
  'frontend.interview.scenario': '项目场景题没有脱离约束的“万能方案”。高质量回答应先确认用户规模、数据量、失败成本和现有架构，再给出主方案、异常路径、监控指标、回滚手段和安全边界。',
  'frontend.interview.algorithm': '算法题应同时说明数据结构、循环不变量或递归含义、时间复杂度、空间复杂度和边界输入。先保证正确和可解释，再讨论是否值得进一步优化。'
}

const topicGuides = [
  [['语义化', 'ARIA', '可访问性', '表单', '键盘导航', '焦点'], '可访问性不是“加一个 aria-label”就结束。应检查语义树、可访问名称、Tab 顺序、焦点可见性、键盘行为和状态播报；能用 button、label、fieldset 等原生元素时，通常比 div 模拟更可靠。'],
  [['Flex', 'Grid', 'BFC', '布局', 'Sticky', 'z-index', '层叠'], '布局排错可以固定为四步：看父容器的布局模式，看子项可用空间与最小尺寸，看 overflow/position 是否改变包含块或滚动容器，再看是否跨越了不同层叠上下文。这样比不断增大 z-index 或盲目加宽度更可靠。'],
  [['Promise', 'async', '微任务', '事件循环'], 'Promise 回调和 await 后续代码进入微任务队列，setTimeout 等计时器回调进入后续任务。每完成一个任务，宿主通常会在进入下一任务前清空微任务队列；但渲染时机和 Node.js 的部分队列规则还需结合宿主说明。'],
  [['闭包', 'TDZ', '变量提升'], '词法作用域由代码书写位置决定。闭包保留的是对外层绑定的访问能力，不是把某个瞬间的值复制一份；let/const 绑定虽已创建，但在初始化前处于暂时性死区，访问会抛出 ReferenceError。'],
  [['this', '箭头函数', 'call', 'bind'], '普通函数的 this 主要由调用方式决定，箭头函数则从创建位置捕获外层 this，不能通过 call、apply、bind 改写。分析时要看实际调用表达式，而不是只看函数在哪里定义。'],
  [['原型链', 'new', 'Class', 'instanceof'], '属性读取会沿对象的 [[Prototype]] 链查找。new 通常会创建对象、连接原型、以该对象调用构造函数，并根据构造函数返回值决定最终结果；class 是更严格、更清晰的语法层，不等于另一套继承模型。'],
  [['响应式', 'ref', 'reactive', 'computed', 'watch', 'watchEffect'], 'Vue 响应式的关键是读取时收集依赖、写入时触发相关副作用。computed 适合可缓存的纯派生值；watch 适合明确来源的副作用；watchEffect 自动追踪同步执行期间读取的依赖。异步请求还必须清理上一轮副作用，避免竞态。'],
  [['生命周期', 'nextTick', 'DOM 更新', '调度器'], 'Vue 会批量调度状态更新，赋值后 DOM 通常不会同步立即变化。nextTick 等待的是 Vue 当前更新批次完成，不等于等待图片加载、网络请求或浏览器完成所有绘制；读取 DOM 前要明确自己等待的究竟是哪一层。'],
  [['key', 'diff', '虚拟DOM', '渲染原理'], 'key 用来表达同级节点的稳定身份，帮助渲染器判断复用、移动、创建和卸载。索引在插入、删除、排序后不能稳定代表业务实体，涉及输入状态或组件局部状态时尤其容易出现错误复用。'],
  [['Pinia', '状态管理', 'storeToRefs'], '状态管理应保存跨页面或跨组件共享的业务状态，而不是把所有临时 UI 状态都放进全局仓库。解构 store 时要注意保持响应性，异步 action 还要处理并发、错误、加载状态和退出登录后的数据清理。'],
  [['Vue Router', '动态路由', '路由'], '路由守卫负责导航流程和体验控制，不能替代服务端授权。动态路由还要处理刷新恢复、404 匹配顺序、退出登录后的路由清理，以及导航期间请求取消。'],
  [['KeepAlive', 'Teleport', 'Suspense', '异步组件'], '这些是组件树与渲染位置的高级能力。使用时要明确实例是否仍存活、DOM 实际挂载在哪里、异步依赖怎样失败，以及 activated/deactivated、卸载清理和 SSR 水合会受到什么影响。'],
  [['SSR', '水合', 'SSG'], 'SSR 提供服务端 HTML，水合再把客户端行为连接到已有 DOM。服务端和客户端首屏输出不一致会产生水合警告甚至重新渲染，因此随机数、当前时间、浏览器专属 API 和用户状态都要设计一致的初始化策略。'],
  [['竞态', '取消请求', '请求去重', '防抖', '节流'], '减少请求次数和保证结果正确是两件事：防抖/节流控制触发频率，AbortController 负责取消可取消任务，请求序号或版本号负责阻止旧响应覆盖新状态，缓存与去重则减少相同工作。'],
  [['Token刷新', '认证', '登录', '权限', 'RBAC'], '登录态处理要区分认证、授权与界面展示。并发 401 通常应共享一次刷新操作并排队重放；刷新失败要统一退出。按钮隐藏只是体验，服务端仍必须对每个资源和动作做权限校验。'],
  [['XSS', 'CSRF', 'CORS', 'Cookie', 'CSP'], '安全问题要先识别攻击者控制的数据和浏览器自动行为。XSS 重点是按输出上下文编码或净化，CSRF 重点是阻止第三方站点借用用户凭据，CORS 只控制浏览器是否向脚本开放跨源响应，并不是服务端鉴权。'],
  [['缓存', '部署', 'Chunk', '回滚', '灰度发布'], '发布稳定性依赖不可变带哈希资源、入口 HTML 的短缓存、旧资源保留和可回滚版本。遇到 chunk 加载失败不能无限刷新，应识别版本错配、提示用户并配合监控和回滚。'],
  [['性能', 'LCP', 'INP', 'CLS', '虚拟列表'], '优化前要建立可复现基线。虚拟列表只减少 DOM 数量，不能降低全量下载和内存成本；图片尺寸影响 CLS，关键资源优先级影响 LCP，长任务和高频事件处理则常影响 INP。'],
  [['文件上传', '分片上传', '断点续传'], '上传流程要考虑类型与大小校验、预览 URL 释放、并发限制、取消、超时、失败重试和服务端可信校验。分片上传还需要稳定文件标识、已传分片查询、幂等合并与最终完整性验证。'],
  [['监控', '错误上报', '白屏', 'Source Map'], '线上排障应记录版本、路由、设备、请求追踪标识和错误堆栈，并通过与发布版本匹配的 source map 符号化。上报必须脱敏、采样和限流，同时准备错误兜底、功能降级和快速回滚。'],
  [['算法', '动态规划', '滑动窗口', '二分查找', '拓扑排序'], '讲算法时先定义输入输出和不变量，再用一个最小例子走完状态变化。最后说明空输入、重复值、负数、越界或环等边界，并给出时间、额外空间复杂度。']
]

const questionNotes = {
  'interview-vue-002-reactive-destructure': '这里丢失连接的是解构出来的基本类型值，因为后续读取不再经过 Proxy。若属性值本身是对象，解构得到的仍可能是一个响应式代理引用，但变量与源属性的“替换关系”仍未保留，所以不能简单背成“所有解构都完全失去响应性”。',
  'interview-vue-003-ref-unwrapping': '官方文档明确给出两个重要例外：ref 作为 reactive 数组元素或 Map 等原生集合的值时，访问仍需要 `.value`；模板自动解包也主要针对渲染上下文中的顶层属性。把规则说成“Vue 里 ref 永远不用 `.value`”是典型错误。',
  'interview-vue-006-watch-watch-effect': '`watchEffect` 只会自动追踪回调同步执行期间读取的依赖。异步回调在第一个 `await` 之后才读取的数据不会被本轮自动收集，因此常把依赖读取放在 await 前，或改用 `watch` 显式声明来源。',
  'interview-vue-007-watch-flush': '`flush: \'post\'` 只保证回调在所属组件的 Vue DOM 更新之后执行。它不保证图片已经加载、字体已经稳定，也不代表浏览器已经完成下一帧绘制；这些场景还要等待对应资源事件或 `requestAnimationFrame`。',
  'interview-vue-008-next-tick': '`nextTick` 等待 Vue 当前批次的 DOM 更新完成，不是“延迟固定一毫秒”，也不会替你等待接口、CSS 动画、图片加载或所有浏览器绘制。若连续状态修改属于同一批次，一次 `await nextTick()` 通常足以读取该批次提交后的 DOM。',
  'interview-vue-010-lifecycle-order': '首次挂载时，父组件的 `onMounted` 会等待同步子组件挂载完成，所以同步子组件通常先 mounted，父组件后 mounted。这里不能扩展成“所有后代异步组件也必然完成”，异步组件与 Suspense 边界需要单独判断。',
  'interview-vue-014-keep-alive': '进入缓存的组件不会执行普通卸载流程，而会触发 deactivated；重新插入时触发 activated。官方文档还指出：activated 会在首次挂载时触发，deactivated 也会在缓存实例最终卸载时触发，因此清理逻辑要区分“暂时离开”和“永久销毁”。',
  'interview-vue-016-suspense': 'Vue 官方文档目前仍把 Suspense 标为实验性能力。它可以协调异步 setup 与异步组件的等待状态，但错误处理、嵌套顺序、SSR 和框架版本都要实际验证，不能把它当作所有请求的通用加载容器。',
  'interview-vue-029-ssr-hydration': '常见不一致来源包括无效 HTML 被浏览器纠正、服务端和客户端随机值不同、时区不同，以及只在浏览器存在的 API。Vue 3.5+ 可用 `data-allow-mismatch` 抑制确实无法避免的局部警告，但它不是修复数据不一致的首选方案。',
  'vue-120-keepalive-lru': 'Vue 官方文档明确说明 `max` 的行为类似 LRU：缓存达到上限后，会销毁最久没有被访问的实例，为新实例腾出位置。它限制的是组件实例数量，不是 HTTP 缓存大小。',
  'vue-126-ssr-hydration': '水合要求服务端 HTML 与客户端第一次渲染的结构一致。Vue 会尝试从不匹配中恢复，但恢复会增加成本，也可能造成闪烁或状态异常；因此应优先修复不确定数据、无效嵌套和时区差异。',
  'interview-output-006-detached-method': '该答案依赖题干已明确的 ES Module 或严格模式。在浏览器传统非严格脚本中，独立调用普通函数时 `this` 可能回退到全局对象，结果会随全局是否存在同名属性而不同，所以代码输出题必须先声明运行环境。',
  'interview-output-020-micro-macro': '这里 `queueMicrotask` 比 `Promise.then` 更早登记，因此两个微任务按先进先出输出 microtask、promise。计时器的“0 毫秒”是最短等待提示，不代表能插到已登记微任务之前。',
  'interview-output-030-async-error': '外层同步 `try...catch` 只能捕获当前调用栈同步抛出的异常。async 函数会把异常转换为 rejected Promise，所以必须 `await load()` 并在同一 async 上下文捕获，或者对返回的 Promise 使用 `.catch()`。',
  'interview-scenario-001-token-refresh': '实现时通常维护一个共享的 refreshPromise：第一个 401 创建刷新任务，后续 401 等待同一个任务；刷新成功后各请求最多重放一次，失败则统一清理身份并跳转登录。还要排除刷新接口自身，避免 401 拦截器递归。',
  'interview-scenario-003-dynamic-router-refresh': '动态路由刷新 404 的本质是内存路由表尚未恢复。路由守卫应等待“用户信息 + 权限菜单 + addRoute”初始化完成，再用 replace 回到原目标；初始化必须有单飞锁，避免并发导航重复注册。',
  'interview-scenario-005-stale-response': '取消旧请求主要节省资源，请求序号或查询键校验才是最终正确性保障，因为请求可能已经完成、服务端不支持取消，或取消信号到达前响应已经返回。两种手段最好同时使用。',
  'interview-scenario-010-white-screen': '排查优先看“影响范围是否与某版本、路由、浏览器或地域相关”，再结合首个致命错误、静态资源 404/CORS、接口状态和 source map 定位。修复之外还要有错误兜底页、旧 chunk 保留、版本回滚和发布后指标观察。',
  'interview-scenario-020-table-scale': '虚拟列表只渲染可见 DOM，并不会让浏览器免费持有百万条数据。百万级记录应先在服务端和数据库完成过滤、排序与分页；若业务必须连续滚动，再在有限窗口数据上使用虚拟化。',
  'interview-scenario-021-search': '防抖解决“发得太频繁”，取消与版本校验解决“旧结果覆盖新结果”，缓存解决“相同查询重复工作”。三者职责不同，面试时应分别说明，而不是只回答“加防抖”。'
}

function answerText(question) {
  if (question.type === 'true_false') return question.answerKeys[0] === 'true' ? '正确' : '错误'
  if (!question.options?.length) return question.answerKeys.map((item) => `\`${item}\``).join('、')
  return question.answerKeys.map((key) => {
    const option = question.options.find((item) => item.id === key)
    return `**${key}**（${option?.content || key}）`
  }).join('、')
}

function optionAnalysis(question, originalExplanation) {
  if (!question.options?.length) return ''
  const answerSet = new Set(question.answerKeys)
  return question.options.map((option) => {
    const correct = answerSet.has(option.id)
    const judgement = correct ? '正确' : '不选'
    const correctContents = question.options
      .filter((item) => answerSet.has(item.id))
      .map((item) => item.content)
      .join('；')
    const reason = correct
      ? `它准确对应本题结论。依据是：${originalExplanation}`
      : `如果选择它，就等于断言“${option.content}”；但本题成立的结论是“${correctContents}”。结合上面的机制说明，它混淆了能力、执行时机或适用边界，因此不能选。`
    return `- **${option.id}：${judgement}。** ${option.content}。${reason}`
  }).join('\n')
}

function topicText(question) {
  const tags = new Set(question.tags || [])
  const matches = topicGuides
    .filter(([keywords]) => keywords.some((keyword) => tags.has(keyword)))
    .slice(0, 2)
    .map(([, guide]) => guide)
  return matches.join('\n\n')
}

function interviewPrompt(question) {
  if (question.categoryKey === 'frontend.interview.output') {
    return '面试时先逐行列出同步结果，再画出微任务和后续任务队列；不要只报最终输出。继续追问通常会改动一行代码，例如把普通函数换成箭头函数、增加一个 await 或切换严格模式，你应能用同一套规则重新推导。'
  }
  if (question.categoryKey === 'frontend.interview.handwritten') {
    return '继续追问通常包括：是否保留 this 和参数、异常如何传播、组件卸载或任务取消时怎样清理、面对大数据量是否会阻塞。回答时应明确当前代码是教学版还是可直接用于生产的完整实现。'
  }
  if (question.categoryKey === 'frontend.interview.algorithm') {
    return '面试中先口述朴素方案和复杂度，再解释为什么选择当前数据结构。写完后用空输入、单元素、重复值和极端规模手动走一遍，能比只背模板更早发现边界错误。'
  }
  if (question.categoryKey.startsWith('frontend.interview.')) {
    return '回答可按“场景与约束 -> 原理 -> 方案 -> 异常与边界 -> 验证指标”组织。面试官继续追问时，重点说明为什么没有选择另一种方案，以及上线后如何监控、降级和回滚。'
  }
  return '面试回答不要只说选项字母。先用一句话给结论，再解释底层规则，接着给一个项目例子，最后主动补充例外条件。这样即使面试官改变题目条件，你也能从原理继续推导。'
}

function originalExplanation(question) {
  if (!question.explanation.includes(enhancedMarker)) return question.explanation.trim()
  return question.explanation
    .split('**逐项分析**')[0]
    .split('**小白理解与核心原理**')[0]
    .replace(enhancedMarker, '')
    .replace(/^\s*本题答案是：.+?。/, '')
    .trim()
}

function buildExplanation(question) {
  const original = originalExplanation(question)
  const sections = [
    enhancedMarker,
    `本题答案是：${answerText(question)}。${original}`
  ]
  const analysis = optionAnalysis(question, original)
  if (analysis) sections.push('**逐项分析**', analysis)
  const topic = topicText(question)
  sections.push(
    '**小白理解与核心原理**',
    categoryGuides[question.categoryKey],
    topic || '先把题干中的技术名词还原成“输入是什么、浏览器或框架做了什么、最终产生什么结果”三步，再记忆 API 名称。只背结论很容易在题目换一个条件后答错。',
    questionNotes[question.code] || `本题可以用一个最小示例验证：只保留与“${question.tags?.slice(0, 3).join('、') || question.stem}”有关的输入和操作，分别记录操作前、操作中和操作后的值。这样能把抽象规则变成可观察结果。`,
    '**项目实践与排错**',
    `在项目里遇到“${question.tags?.slice(0, 3).join('、') || question.stem}”相关问题时，不要先套结论。先构造最小复现，再用浏览器开发者工具、日志或测试确认输入、执行时机和最终状态；同时验证正常路径、失败路径、重复触发和组件销毁后的行为。`,
    '**常见误区与面试追问**',
    interviewPrompt(question)
  )
  return sections.join('\n\n')
}

const files = fs.readdirSync(dataDir)
  .filter((fileName) => /^questions-.+\.json$/i.test(fileName))
  .sort()

let frontendCount = 0
let changedCount = 0
const changedFiles = []

for (const fileName of files) {
  const filePath = path.join(dataDir, fileName)
  const data = JSON.parse(fs.readFileSync(filePath, 'utf8'))
  let fileChanged = false
  for (const question of data.questions) {
    if (!question.categoryKey.startsWith('frontend.')) continue
    frontendCount += 1
    const nextExplanation = buildExplanation(question)
    if (nextExplanation !== question.explanation) {
      question.explanation = nextExplanation
      changedCount += 1
      fileChanged = true
    }
  }
  if (fileChanged) {
    changedFiles.push(fileName)
    if (applyChanges) fs.writeFileSync(filePath, `${JSON.stringify(data, null, 2)}\n`, 'utf8')
  }
}

console.log(`[题库解析增强] 模式：${applyChanges ? 'apply' : 'dry-run'}`)
console.log(`[题库解析增强] 前端题目：${frontendCount}，待更新：${changedCount}`)
console.log(`[题库解析增强] 影响文件：${changedFiles.length}`)
for (const fileName of changedFiles) console.log(`- ${fileName}`)
