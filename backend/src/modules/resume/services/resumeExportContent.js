const DEFAULT_TEXT = '暂无'

function text(value, fallback = '') {
  return String(value || '').trim() || fallback
}

function addSection(blocks, title, items, appendItem) {
  blocks.push({ type: 'heading', text: title })
  if (!items.length) {
    blocks.push({ type: 'bullet', level: 0, text: DEFAULT_TEXT })
    return
  }

  items.forEach((item) => appendItem(blocks, item))
}

/**
 * 将结构化简历转换为格式无关的语义块，避免 Markdown、PDF、Word 各自维护一套内容顺序。
 * @param {Object} resume - 已完成权限过滤的简历安全数据。
 * @returns {Array<{type: string, text: string, level?: number}>} 按阅读顺序排列的导出内容。
 */
export function buildResumeBlocks(resume) {
  const sections = resume.sections || {}
  const profile = sections.profile || {}
  const blocks = [
    { type: 'title', text: text(resume.title, '未命名简历') },
    { type: 'meta', text: `目标岗位：${text(resume.targetRole, '-')}` },
    { type: 'meta', text: `姓名：${text(profile.name, '-')}` },
    { type: 'meta', text: `电话：${text(profile.phone, '-')}` },
    { type: 'meta', text: `邮箱：${text(profile.email, '-')}` },
    { type: 'meta', text: `所在地：${text(profile.location, '-')}` }
  ]

  if (profile.website) blocks.push({ type: 'meta', text: `个人链接：${text(profile.website)}` })
  blocks.push(
    { type: 'heading', text: '基础信息' },
    { type: 'body', text: text(profile.summary, '暂无个人简介') }
  )

  addSection(blocks, '专业技能', sections.skills || [], (target, item) => {
    target.push({
      type: 'bullet',
      level: 0,
      text: `${text(item.name, '未命名技能')}${item.level ? `（${text(item.level)}）` : ''}`
    })
    if (item.description) target.push({ type: 'bullet', level: 1, text: text(item.description) })
  })

  addSection(blocks, '教育经历', sections.education || [], (target, item) => {
    target.push({
      type: 'bullet',
      level: 0,
      text: [text(item.school, '学校'), text(item.major), text(item.degree)].filter(Boolean).join(' ')
    })
    target.push({
      type: 'bullet',
      level: 1,
      text: `${text(item.startDate, '-')} 至 ${text(item.endDate, '至今')}`
    })
    if (item.description) target.push({ type: 'bullet', level: 1, text: text(item.description) })
  })

  addSection(blocks, '工作经历', sections.workExperiences || [], (target, item) => {
    target.push({
      type: 'bullet',
      level: 0,
      text: `${text(item.company, '公司')} / ${text(item.role, '职位')}`
    })
    target.push({
      type: 'bullet',
      level: 1,
      text: `${text(item.startDate, '-')} 至 ${text(item.endDate, '至今')}`
    })
    if (item.description) target.push({ type: 'bullet', level: 1, text: text(item.description) })
    for (const achievement of item.achievements || []) {
      if (achievement.content) target.push({ type: 'bullet', level: 1, text: text(achievement.content) })
    }
  })

  addSection(blocks, '项目经历', sections.projects || [], (target, item) => {
    target.push({
      type: 'bullet',
      level: 0,
      text: `${text(item.name, '项目')} / ${text(item.role, '角色')}`
    })
    if (item.startDate || item.endDate) {
      target.push({
        type: 'bullet',
        level: 1,
        text: `${text(item.startDate, '-')} 至 ${text(item.endDate, '至今')}`
      })
    }
    if (item.techStack) target.push({ type: 'bullet', level: 1, text: `技术栈：${text(item.techStack)}` })
    if (item.description) target.push({ type: 'bullet', level: 1, text: text(item.description) })
    for (const highlight of item.highlights || []) {
      if (highlight.content) target.push({ type: 'bullet', level: 1, text: text(highlight.content) })
    }
  })

  addSection(blocks, '自我评价', sections.selfEvaluation || [], (target, item) => {
    if (item.content) target.push({ type: 'bullet', level: 0, text: text(item.content) })
  })

  return blocks
}

export function buildResumeMarkdown(resume) {
  const lines = buildResumeBlocks(resume).map((block) => {
    if (block.type === 'title') return `# ${block.text}`
    if (block.type === 'heading') return `\n## ${block.text}`
    if (block.type === 'bullet') return `${'  '.repeat(block.level || 0)}- ${block.text}`
    return block.text
  })

  return `${lines.join('\n')}\n`
}
