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

function formatRange(item = {}) {
  return [text(item.startDate), text(item.endDate)].filter(Boolean).join('-')
}

function sorted(items = []) {
  return [...items].sort((left, right) => (left.sortOrder || 0) - (right.sortOrder || 0))
}

/**
 * 构建与 Boss 附件简历一致的语义结构，供网页预览、PDF 和 Word 共用字段顺序。
 * @param {Object} resume - 已完成权限过滤的简历安全数据。
 * @returns {Array<Object>} Boss 单栏简历的结构化内容块。
 */
export function buildBossResumeBlocks(resume) {
  const sections = resume.sections || {}
  const profile = sections.profile || {}
  const contact = [profile.gender, profile.age ? `年龄：${profile.age}` : '', profile.phone, profile.email]
    .filter(Boolean)
    .join(' | ')
  const intention = [profile.workYears, `求职意向：${text(resume.targetRole, '-')}`, `期望城市：${text(profile.expectedCity || profile.location, '-')}`]
    .filter(Boolean)
    .join(' | ')
  const blocks = [
    { type: 'boss-name', text: text(profile.name, resume.title || '未命名简历') },
    { type: 'boss-contact', text: contact },
    { type: 'boss-intention', text: intention }
  ]

  blocks.push({ type: 'boss-section', text: '个人优势' })
  sorted(sections.advantages || []).forEach((item, index) => {
    if (item.content) blocks.push({ type: 'boss-numbered', index: index + 1, text: text(item.content) })
  })

  blocks.push({ type: 'boss-section', text: '工作经历' })
  sorted(sections.workExperiences || []).forEach((item) => {
    blocks.push({ type: 'boss-entry', title: text(item.company, '公司'), role: text(item.role), range: formatRange(item) })
    if (item.description) blocks.push({ type: 'boss-bullet', text: text(item.description) })
    sorted(item.achievements || []).forEach((achievement) => {
      if (achievement.content) blocks.push({ type: 'boss-bullet', text: text(achievement.content) })
    })
  })

  blocks.push({ type: 'boss-section', text: '项目经历' })
  sorted(sections.projects || []).forEach((project) => {
    blocks.push({ type: 'boss-entry', title: text(project.name, '项目'), role: text(project.role), range: formatRange(project) })
    if (project.description) blocks.push({ type: 'boss-bullet', label: '项目背景', text: text(project.description) })
    if (project.techStack) blocks.push({ type: 'boss-bullet', label: '技术栈', text: text(project.techStack) })
    const responsibilities = sorted(project.highlights || []).filter((item) => item.content)
    if (responsibilities.length) blocks.push({ type: 'boss-bullet', text: '负责模块' })
    responsibilities.forEach((item, index) => {
      blocks.push({
        type: 'boss-responsibility',
        index: index + 1,
        title: text(item.title),
        text: text(item.content)
      })
    })
  })

  blocks.push({ type: 'boss-section', text: '教育经历' })
  sorted(sections.education || []).forEach((item) => {
    blocks.push({
      type: 'boss-education',
      school: text(item.school, '学校'),
      degree: text(item.degree),
      major: text(item.major),
      range: formatRange(item),
      description: text(item.description)
    })
  })

  return blocks
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
    { type: 'meta', text: `性别：${text(profile.gender, '-')}` },
    { type: 'meta', text: `年龄：${text(profile.age, '-')}` },
    { type: 'meta', text: `电话：${text(profile.phone, '-')}` },
    { type: 'meta', text: `邮箱：${text(profile.email, '-')}` },
    { type: 'meta', text: `所在地：${text(profile.location, '-')}` }
  ]

  if (profile.website) blocks.push({ type: 'meta', text: `个人链接：${text(profile.website)}` })
  blocks.push(
    { type: 'heading', text: '基础信息' },
    { type: 'body', text: text(profile.summary, '暂无个人简介') }
  )

  addSection(blocks, '个人优势', sections.advantages || [], (target, item) => {
    if (item.content) target.push({ type: 'bullet', level: 0, text: text(item.content) })
  })

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
  if (resume.templateKey === 'boss') {
    const lines = buildBossResumeBlocks(resume).map((block) => {
      if (block.type === 'boss-name') return `# ${block.text}`
      if (block.type === 'boss-contact' || block.type === 'boss-intention') return block.text
      if (block.type === 'boss-section') return `\n## ${block.text}`
      if (block.type === 'boss-entry') return `### ${block.title} | ${block.role} | ${block.range}`
      if (block.type === 'boss-bullet') return `- ${block.label ? `${block.label}：` : ''}${block.text}`
      if (block.type === 'boss-numbered') return `${block.index}. ${block.text}`
      if (block.type === 'boss-responsibility') return `${block.index}. ${block.title ? `${block.title}：` : ''}${block.text}`
      if (block.type === 'boss-education') return `### ${block.school} | ${block.degree} | ${block.major} | ${block.range}`
      return ''
    })
    return `${lines.join('\n')}\n`
  }

  const lines = buildResumeBlocks(resume).map((block) => {
    if (block.type === 'title') return `# ${block.text}`
    if (block.type === 'heading') return `\n## ${block.text}`
    if (block.type === 'bullet') return `${'  '.repeat(block.level || 0)}- ${block.text}`
    return block.text
  })

  return `${lines.join('\n')}\n`
}
