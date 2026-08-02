export const HN246_BOSS_RESUME_VERSION = '2026.08'

function item(id, content, sortOrder) {
  return { id, content, sortOrder }
}

function responsibility(id, title, content, sortOrder) {
  return { id, title, content, sortOrder }
}

export const HN246_BOSS_RESUME = {
  title: '陈浩南-前端开发工程师-Boss投递版-2026.08',
  targetRole: '前端开发工程师',
  templateKey: 'boss',
  status: 'active',
  sections: {
    profile: {
      name: '陈浩南',
      gender: '男',
      age: '25岁',
      phone: '18375389267',
      email: '3519463440@qq.com',
      location: '合肥',
      expectedCity: '合肥',
      workYears: '1年工作经验',
      photoUrl: '/uploads/resumes/chen-haonan-202608.jpg',
      website: '',
      summary: ''
    },
    advantages: [
      item('boss-advantage-1', '熟悉 JavaScript、ES6+、HTML5、CSS3、SCSS，能够完成组件化页面开发、交互实现、接口联调和常见问题排查。', 10),
      item('boss-advantage-2', '熟悉 Vue 3、uni-app、Pinia、Vuex、Vue Router、Axios、Element Plus、uv-ui，具备微信小程序、钉钉 H5、企业微信 H5 和 PC 中后台开发经验。', 20),
      item('boss-advantage-3', '持续参与智慧校园平台、职业院校招生及电子班牌等实际项目，能够围绕业务需求完成前端开发、接口联调、问题排查和版本迭代。', 30),
      item('boss-advantage-4', '具备多平台登录、多身份会话、统一请求层、WebSocket / STOMP、动态表单、动态工作流、动态路由权限和统一消息等复杂业务链路经验。', 40),
      item('boss-advantage-5', '具备 AI 应用工程化实践，能够在开源 MaxKB 应用上完成智能体配置、业务接口接入、前端嵌入、身份参数透传和多轮会话状态处理。', 50),
      item('boss-advantage-6', '具备 Android / Java 原生能力接入经验，能够在 uni-app 项目中通过 JS 适配层对接固定终端能力，并处理弱网缓存、设备心跳、真机验证等问题。', 60),
      item('boss-advantage-7', '了解后端与数据库技术栈 Node.js、Express、Python、FastAPI 基础服务开发，熟悉 MySQL、MongoDB 基础数据存储逻辑，理解前后端交互流程，能够配合后端完成联调对接与问题定位。', 70)
    ],
    skills: [],
    education: [{
      id: 'boss-education-tlu',
      school: '铜陵学院',
      degree: '本科',
      major: '计算机科学与技术',
      startDate: '2021',
      endDate: '2025',
      description: '',
      sortOrder: 10
    }],
    workExperiences: [{
      id: 'boss-work-runlan',
      company: '安徽润岚信息技术有限公司',
      role: '前端开发工程师',
      startDate: '2025.07',
      endDate: '2026.08',
      description: '',
      achievements: [
        item('boss-work-1', '负责智慧校园、职业院校招生及相关管理后台的前端开发、接口联调、持续迭代和问题排查，工作重心以移动端为主、PC 中后台为辅。', 10),
        item('boss-work-2', '参与统一代码底座下的多学校、多角色、多平台交付，处理 schoolID、后台菜单、角色权限、登录配置以及微信、钉钉、企业微信等环境差异。', 20),
        item('boss-work-3', '负责或深度参与登录会话、统一请求、WebSocket、动态表单、动态工作流、统一扫码、动态路由和统一消息等公共链路。', 30),
        item('boss-work-4', '独立完成基于开源 MaxKB 的智慧校园 AI 应用搭建，并参与 RK3288 电子班牌设备端、Android 原生能力接入和交付工作。', 40)
      ],
      sortOrder: 10
    }],
    projects: [
      {
        id: 'boss-project-pc',
        name: '智慧校园平台型 PC 中后台',
        role: '前端工程师',
        startDate: '2025.07',
        endDate: '至今',
        techStack: 'Vue 3、Element Plus、Vue Router、Vuex、Axios、SCUI、WebSocket / STOMP',
        description: '公司长期迭代的智慧校园管理端统一底座，承载教务、学生、审批、实习、访客和消息等业务，通过菜单、权限、学校配置与通用组件支持多学校差异化交付。',
        highlights: [
          responsibility('boss-pc-1', '动态路由与权限', '参与后端菜单驱动的路由构建，处理角色过滤、面包屑、keep-alive、iframe 适配及 404 延后注入。', 10),
          responsibility('boss-pc-2', '登录与请求治理', '参与账号密码及微信、钉钉、企业微信等登录回流，统一处理 token、schoolID、业务失效码和退出清理。', 20),
          responsibility('boss-pc-3', '实时消息与协同', '参与 WebSocket / STOMP 实时提醒、统一消息模板字段映射、动态工作流和审批协同模块建设。', 30),
          responsibility('boss-pc-4', '公共能力复用', '参与请求层与上传、选人、任务中心、复杂列表等通用能力维护，减少业务模块中的重复实现。', 40)
        ],
        sortOrder: 10
      },
      {
        id: 'boss-project-mobile',
        name: '智慧校园平台型 Uni-app 移动端',
        role: '前端工程师',
        startDate: '2025.07',
        endDate: '至今',
        techStack: 'uni-app、Vue 3、Pinia、uv-ui、WebSocket / STOMP、微信小程序、H5、钉钉、企业微信',
        description: '面向学校客户的智慧校园统一移动端底座，通过 schoolID、后台菜单、角色身份与平台配置，在同一套代码中承载教师、学生、家长等多角色及教务、办公、消息、签到等业务。',
        highlights: [
          responsibility('boss-mobile-1', '多端登录与身份治理', '参与微信、钉钉、企业微信及家长双身份场景的登录接入，梳理用户身份、业务身份、家长信息和双 token 的存储、切换与退出清理。', 10),
          responsibility('boss-mobile-2', '统一请求与会话控制', '封装请求层及会话 ready 判定，集中处理 Authorization、schoolID、身份 token、历史接口兼容和登录失效，避免公共链路在登录态未就绪时提前启动。', 20),
          responsibility('boss-mobile-3', '实时消息与动态工作流', '基于 uni.connectSocket + STOMP 处理连接、订阅、保活、断线重连、强制下线和未读刷新；参与协议驱动表单、附件、在线文档、签名和审批动作。', 30),
          responsibility('boss-mobile-4', '跨平台公共能力', '统一微信、钉钉和 H5 的扫码入口及返回结构，并复用到会议签到、课堂签到、进出校和 PC 登录等业务。', 40)
        ],
        sortOrder: 20
      },
      {
        id: 'boss-project-admission',
        name: '职业院校招生小程序',
        role: '前端工程师',
        startDate: '2025.07',
        endDate: '至今',
        techStack: 'uni-app、Vue 3、Pinia、uv-ui、微信小程序、MaxKB、LLM、SSE',
        description: '面向职业院校招生报名、信息查询、在线咨询和内容展示的服务小程序，通过配置驱动适配不同院校的表单与首页内容；招生咨询接入基于学校资料搭建的 MaxKB 客服型知识库智能体。',
        highlights: [
          responsibility('boss-admission-1', '动态表单', '负责后端 JSON 配置驱动的表单渲染，覆盖 13 种字段类型，支持字段联动、实时/失焦/提交三级校验、多格式上传兼容和复杂提交转换。', 10),
          responsibility('boss-admission-2', '招生客服接入', '配合将学校招生资料导入 MaxKB 知识库，完成小程序咨询入口、会话创建、提问交互及客服型智能体返回内容展示。', 20),
          responsibility('boss-admission-3', '协议与交互处理', '解析后端返回的 SSE 协议格式数据，完成富文本展示、欢迎语逐字动画和快捷问题引导，适配小程序端无法直接按浏览器 chunk 接收的限制。', 30),
          responsibility('boss-admission-4', '内容配置化', '实现轮播图、分类入口、新闻资讯等栏目化渲染，降低招生内容更新对前端重新发版的依赖。', 40)
        ],
        sortOrder: 30
      },
      {
        id: 'boss-project-maxkb',
        name: '智慧校园 AI 业务智能体应用（MaxKB）',
        role: '前端工程师',
        startDate: '2026.06',
        endDate: '2026.07',
        techStack: 'MaxKB、LLM、Prompt Engineering、Python、RESTful API、JSON、SSE、uni-app、Vue 3',
        description: '公司将开源 MaxKB 部署到服务器后，我在其应用层搭建智慧校园业务智能体，围绕 OA 工作流发起、审核查看、成绩查询和教师调代课完成配置与联调，并将智能体接入 PC 端和小程序端。',
        highlights: [
          responsibility('boss-maxkb-1', '应用层搭建', '完成总智能体路由、工作流发起、审核查看等智能体配置，负责 Prompt、Python 工具、接口绑定、前端入口和联调回归，不涉及 MaxKB 平台源码开发。', 10),
          responsibility('boss-maxkb-2', '多端嵌入接入', '将 MaxKB 发布能力接入 PC 端和小程序端，处理 userTicket、schoolID、businessBaseUrl 等身份与环境参数透传，并配置不同端的打开策略。', 20),
          responsibility('boss-maxkb-3', '真实业务闭环', '跑通自然语言选择流程、动态填表、草稿修改、附件回填、必填校验、提交申请、待办查询及审批，并扩展成绩查询和教师调代课。', 30),
          responsibility('boss-maxkb-4', '可控执行链路', '由大模型处理意图和口语表达，Python 工具负责编号解析、字段校验、接口调用和幂等，后端继续控制身份、权限和最终结果；通过显式会话状态支持多轮指代和跨业务切换。', 40)
        ],
        sortOrder: 40
      },
      {
        id: 'boss-project-classboard',
        name: '电子班牌设备端应用',
        role: '前端开发工程师',
        startDate: '2026.07',
        endDate: '2026.08',
        techStack: 'uni-app、Vue 3、JavaScript、DCloud App-Plus、Android、Java、RESTful API',
        description: '面向校园固定班牌终端的设备端应用，覆盖班级端与教室端两种使用模式，承载课表、考勤、通知、班级风采及设备维护等场景。',
        highlights: [
          responsibility('boss-classboard-1', '独立推进前端落地', '完成业务页面、设备初始化绑定、模式切换与接口联调，统一处理终端在班级归属和物理教室场景下的数据展示逻辑。', 10),
          responsibility('boss-classboard-2', '提升长期运行稳定性', '封装签名请求、token 刷新与缓存降级机制，减少固定终端在弱网、接口抖动和会话失效时出现空白页面。', 20),
          responsibility('boss-classboard-3', '打通 Web 与原生能力', '通过统一 JS 适配层对接摄像头、扫码、开机自启、Launcher、导航栏、截图及重启等 Android 能力，集中处理回调、超时和异常。', 30),
          responsibility('boss-classboard-4', '设备运维与交付', '接入设备心跳、远程指令与维护入口，完成真机回归、安装升级验证和交付资料整理。', 40)
        ],
        sortOrder: 50
      }
    ],
    selfEvaluation: []
  }
}
