export const CODE_BLOCK_COLLAPSE_LINES = 10

const LANGUAGE_LABELS = {
  javascript: 'JavaScript',
  js: 'JavaScript',
  jsx: 'JSX',
  typescript: 'TypeScript',
  ts: 'TypeScript',
  tsx: 'TSX',
  vue: 'Vue',
  html: 'HTML',
  xml: 'XML',
  css: 'CSS',
  scss: 'SCSS',
  less: 'Less',
  json: 'JSON',
  jsonc: 'JSONC',
  yaml: 'YAML',
  yml: 'YAML',
  bash: 'Bash',
  shell: 'Shell',
  sh: 'Shell',
  terminal: 'Terminal',
  console: 'Console',
  powershell: 'PowerShell',
  ps1: 'PowerShell',
  pwsh: 'PowerShell',
  dos: 'Batch',
  batch: 'Batch',
  bat: 'Batch',
  cmd: 'Batch',
  sql: 'SQL',
  java: 'Java',
  csharp: 'C#',
  cs: 'C#',
  cpp: 'C++',
  'c++': 'C++',
  c: 'C',
  python: 'Python',
  py: 'Python',
  'python-repl': 'Python REPL',
  go: 'Go',
  rust: 'Rust',
  php: 'PHP',
  ruby: 'Ruby',
  kotlin: 'Kotlin',
  swift: 'Swift',
  perl: 'Perl',
  lua: 'Lua',
  diff: 'Diff',
  graphql: 'GraphQL',
  makefile: 'Makefile',
  dockerfile: 'Dockerfile',
  nginx: 'Nginx',
  ini: 'INI',
  properties: 'Properties',
  dotenv: '.env',
  http: 'HTTP',
  markdown: 'Markdown',
  md: 'Markdown',
  mermaid: 'Mermaid',
  plaintext: '纯文本',
  text: '纯文本'
}

const LANGUAGE_ALIASES = {
  'c++': 'cpp',
  'c#': 'csharp',
  javascript: 'javascript',
  js: 'javascript',
  jsx: 'javascript',
  typescript: 'typescript',
  ts: 'typescript',
  tsx: 'typescript',
  html: 'html',
  htm: 'html',
  xhtml: 'html',
  svg: 'xml',
  md: 'markdown',
  yml: 'yaml',
  json5: 'json',
  jsonc: 'json',
  shellscript: 'bash',
  'shell-session': 'bash',
  shellsession: 'bash',
  session: 'bash',
  terminal: 'bash',
  console: 'bash',
  zsh: 'bash',
  fish: 'bash',
  cmd: 'dos',
  dos: 'dos',
  bat: 'dos',
  batch: 'dos',
  batchfile: 'dos',
  ps: 'powershell',
  vuejs: 'vue',
  node: 'javascript',
  nodejs: 'javascript',
  tsconfig: 'json',
  packagejson: 'json',
  docker: 'dockerfile',
  containerfile: 'dockerfile',
  'docker-compose': 'yaml',
  dockercompose: 'yaml',
  compose: 'yaml',
  nginxconf: 'nginx',
  'nginx.conf': 'nginx',
  conf: 'ini',
  config: 'ini',
  cfg: 'ini',
  env: 'properties',
  '.env': 'properties',
  dotenv: 'properties',
  properties: 'properties',
  props: 'properties',
  py: 'python',
  pycon: 'python-repl',
  python3: 'python',
  mdx: 'markdown',
  plain: 'plaintext',
  plaintext: 'plaintext',
  txt: 'plaintext'
}

export function normalizeCodeLanguage(info = '') {
  const firstToken = String(info).trim().split(/\s+/)[0] || ''
  const normalized = firstToken.toLowerCase().replace(/[^\w#+.-]/g, '')
  return LANGUAGE_ALIASES[normalized] || normalized
}

export function getCodeLanguageLabel(language = '') {
  if (!language) {
    return '纯文本'
  }

  return LANGUAGE_LABELS[language] || language
}

export function countCodeLines(content = '') {
  const normalizedContent = String(content).replace(/\r\n?/g, '\n')

  if (!normalizedContent) {
    return 1
  }

  const lines = normalizedContent.split('\n')

  if (lines.length > 1 && lines[lines.length - 1] === '') {
    lines.pop()
  }

  return Math.max(lines.length, 1)
}

export function buildCodeLineNumbers(lineCount = 1) {
  const safeLineCount = Math.max(Number(lineCount) || 1, 1)

  return Array.from({ length: safeLineCount }, (_, index) => index + 1).join('\n')
}
