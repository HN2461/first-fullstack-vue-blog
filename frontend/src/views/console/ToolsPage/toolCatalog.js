import { defineAsyncComponent } from 'vue'
import {
  Braces,
  CaseSensitive,
  Clock3,
  Code2,
  Link2,
  LockKeyhole,
  Shuffle,
  Fingerprint,
  Hash,
  FileText,
  CaseUpper,
  CodeXml,
  Palette,
  Binary,
  KeyRound,
  ListFilter,
  TextCursorInput,
  ListOrdered,
  Timer
} from 'lucide-vue-next'

export const TOOL_CATEGORIES = [
  { key: 'all', label: '全部工具' },
  { key: 'data', label: '数据与编码' },
  { key: 'web', label: 'Web 与开发' },
  { key: 'text', label: '文本处理' },
  { key: 'time', label: '日期与时间' },
  { key: 'fun', label: '随机与娱乐' }
]

export const TOOL_CATALOG = [
  {
    key: 'json',
    category: 'data',
    name: 'JSON 格式化',
    description: '格式化、压缩并校验 JSON 文本',
    icon: Braces,
    component: defineAsyncComponent(() => import('./tools/JsonTool.vue'))
  },
  {
    key: 'base64',
    category: 'data',
    name: 'Base64 编解码',
    description: '处理 UTF-8 文本的 Base64 编码',
    icon: Code2,
    component: defineAsyncComponent(() => import('./tools/Base64Tool.vue'))
  },
  {
    key: 'url',
    category: 'web',
    name: 'URL 编解码',
    description: '转换 URL 片段和查询参数文本',
    icon: Link2,
    component: defineAsyncComponent(() => import('./tools/UrlTool.vue'))
  },
  {
    key: 'regex',
    category: 'web',
    name: '正则测试',
    description: '实时查看匹配结果和捕获组',
    icon: CaseSensitive,
    component: defineAsyncComponent(() => import('./tools/RegexTool.vue'))
  },
  {
    key: 'timestamp',
    category: 'time',
    name: '时间戳转换',
    description: '在日期、秒和毫秒时间戳之间转换',
    icon: Clock3,
    component: defineAsyncComponent(() => import('./tools/TimestampTool.vue'))
  },
  {
    key: 'password',
    category: 'fun',
    name: '随机密码',
    description: '生成本地处理的随机密码和密钥片段',
    icon: LockKeyhole,
    component: defineAsyncComponent(() => import('./tools/PasswordTool.vue'))
  },
  {
    key: 'picker',
    category: 'fun',
    name: '随机选择器',
    description: '从一组候选项中快速做出选择',
    icon: Shuffle,
    component: defineAsyncComponent(() => import('./tools/PickerTool.vue'))
  },
  {
    key: 'uuid',
    category: 'data',
    name: 'UUID 生成器',
    description: '批量生成随机 UUID v4 标识符',
    icon: Fingerprint,
    component: defineAsyncComponent(() => import('./tools/UuidTool.vue'))
  },
  {
    key: 'hash',
    category: 'data',
    name: '哈希计算',
    description: '计算文本的 SHA-1、SHA-256 摘要',
    icon: Hash,
    component: defineAsyncComponent(() => import('./tools/HashTool.vue'))
  },
  {
    key: 'jwt',
    category: 'web',
    name: 'JWT 解码',
    description: '查看 JWT 的 Header 与 Payload 内容',
    icon: KeyRound,
    component: defineAsyncComponent(() => import('./tools/JwtTool.vue'))
  },
  {
    key: 'html-entity',
    category: 'web',
    name: 'HTML 实体编解码',
    description: '转换 HTML 特殊字符和实体文本',
    icon: CodeXml,
    component: defineAsyncComponent(() => import('./tools/HtmlEntityTool.vue'))
  },
  {
    key: 'text-stats',
    category: 'text',
    name: '文本统计',
    description: '统计字符、单词、行数和 UTF-8 字节数',
    icon: FileText,
    component: defineAsyncComponent(() => import('./tools/TextStatsTool.vue'))
  },
  {
    key: 'case',
    category: 'text',
    name: '大小写转换',
    description: '在常见命名格式之间快速转换文本',
    icon: CaseUpper,
    component: defineAsyncComponent(() => import('./tools/CaseTool.vue'))
  },
  {
    key: 'color',
    category: 'web',
    name: '颜色转换',
    description: 'HEX、RGB、HSL 颜色值互相转换',
    icon: Palette,
    component: defineAsyncComponent(() => import('./tools/ColorTool.vue'))
  },
  {
    key: 'number-base',
    category: 'data',
    name: '进制转换',
    description: '在二进制、十进制、十六进制之间转换',
    icon: Binary,
    component: defineAsyncComponent(() => import('./tools/NumberBaseTool.vue'))
  },
  {
    key: 'query-string',
    category: 'web',
    name: 'Query String 工具',
    description: '解析和生成 URL 查询参数',
    icon: ListFilter,
    component: defineAsyncComponent(() => import('./tools/QueryStringTool.vue'))
  },
  {
    key: 'slug',
    category: 'text',
    name: 'Slug 生成器',
    description: '将标题转换成适合 URL 的短标识',
    icon: TextCursorInput,
    component: defineAsyncComponent(() => import('./tools/SlugTool.vue'))
  },
  {
    key: 'line-tools',
    category: 'text',
    name: '文本行处理',
    description: '排序、去重、反转和清理文本行',
    icon: ListOrdered,
    component: defineAsyncComponent(() => import('./tools/LineTool.vue'))
  },
  {
    key: 'stopwatch',
    category: 'time',
    name: '秒表',
    description: '用于专注、运动或小实验的本地秒表',
    icon: Timer,
    component: defineAsyncComponent(() => import('./tools/StopwatchTool.vue'))
  }
]

export function getToolByKey(key) {
  return TOOL_CATALOG.find((tool) => tool.key === key) || null
}

export function getCategoryByKey(key) {
  return TOOL_CATEGORIES.find((category) => category.key === key) || TOOL_CATEGORIES[0]
}
