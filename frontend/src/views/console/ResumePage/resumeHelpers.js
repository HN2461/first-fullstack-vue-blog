export const statusOptions = [
  { label: '草稿', value: 'draft', color: 'default' },
  { label: '启用', value: 'active', color: 'processing' },
  { label: '归档', value: 'archived', color: 'default' }
]

export const difficultyOptions = [
  { label: '基础', value: 'low', color: 'green' },
  { label: '常规', value: 'medium', color: 'blue' },
  { label: '高压', value: 'high', color: 'orange' }
]

export const sectionTabs = [
  { key: 'profile', label: '基础信息' },
  { key: 'skills', label: '专业技能' },
  { key: 'education', label: '教育经历' },
  { key: 'workExperiences', label: '工作经历' },
  { key: 'projects', label: '项目经历' },
  { key: 'selfEvaluation', label: '自我评价' }
]

export function createEmptySections() {
  return {
    profile: {
      name: '',
      phone: '',
      email: '',
      location: '',
      website: '',
      summary: ''
    },
    skills: [],
    education: [],
    workExperiences: [],
    projects: [],
    selfEvaluation: []
  }
}

export function createDraftResume() {
  return {
    id: '',
    title: '未命名简历',
    targetRole: '',
    templateKey: 'classic',
    status: 'draft',
    sections: createEmptySections()
  }
}

export function createId() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`
}

export function moveItem(items, fromIndex, toIndex) {
  if (fromIndex === toIndex || fromIndex < 0 || toIndex < 0) return items
  const next = [...items]
  const [item] = next.splice(fromIndex, 1)
  next.splice(toIndex, 0, item)
  return next.map((entry, index) => ({ ...entry, sortOrder: index * 10 }))
}

export function formatTime(value) {
  if (!value) return '-'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '-'
  const pad = (num) => String(num).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`
}

export function getOptionMeta(options, value) {
  return options.find((item) => item.value === value) || options[0]
}

export function parseTags(text) {
  const seen = new Set()
  return String(text || '')
    .split(/[,，\s]+/)
    .map((tag) => tag.trim())
    .filter(Boolean)
    .filter((tag) => {
      const key = tag.toLowerCase()
      if (seen.has(key)) return false
      seen.add(key)
      return true
    })
    .slice(0, 12)
}

export function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}
