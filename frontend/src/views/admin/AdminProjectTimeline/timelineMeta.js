export const recommendedTimelineCategories = [
  '内容上新',
  '功能更新',
  '问题修复',
  '系统公告',
  '部署发布',
  '项目搭建',
  '版本调整',
  '手动记录'
]

const categoryToneMap = {
  内容上新: { text: '#276749', bg: '#e8f6ee', border: '#b7dfc8', dot: '#2f9e66' },
  功能更新: { text: '#185a9d', bg: '#e9f3ff', border: '#b7d5f6', dot: '#2b78d4' },
  问题修复: { text: '#9a4b13', bg: '#fff2e1', border: '#f4c993', dot: '#df7f24' },
  系统公告: { text: '#9f2f35', bg: '#fff0f0', border: '#f0b8bc', dot: '#d34d55' },
  部署发布: { text: '#0f6674', bg: '#e6f7f9', border: '#a9dfe6', dot: '#1d9aaa' },
  项目搭建: { text: '#3157a6', bg: '#eef3ff', border: '#bdcaf4', dot: '#4b68c8' },
  版本调整: { text: '#6b3f95', bg: '#f4effa', border: '#d2bce8', dot: '#8b5ec6' },
  手动记录: { text: '#4b5563', bg: '#f3f4f6', border: '#d1d5db', dot: '#6b7280' }
}

const fallbackTones = [
  { text: '#73510d', bg: '#fff7dc', border: '#ead28b', dot: '#c79518' },
  { text: '#12645a', bg: '#e7f7f3', border: '#a9dbd0', dot: '#209a86' },
  { text: '#8a3b61', bg: '#fff0f6', border: '#e9b4cf', dot: '#c14f83' },
  { text: '#334155', bg: '#eef2f7', border: '#c7d0dd', dot: '#64748b' },
  { text: '#7c3f25', bg: '#fff3ed', border: '#e8bfa7', dot: '#b8643c' },
  { text: '#37536d', bg: '#edf7ff', border: '#b7d2e7', dot: '#4c7fa5' }
]

function hashText(value) {
  return String(value || '').split('').reduce((hash, char) => {
    return (hash * 31 + char.charCodeAt(0)) % 997
  }, 7)
}

export function buildCategoryOptions(categories = []) {
  return [...new Set([
    ...recommendedTimelineCategories,
    ...categories.filter(Boolean)
  ])].map((value) => ({ label: value, value }))
}

export function getCategoryTone(category) {
  if (categoryToneMap[category]) return categoryToneMap[category]
  return fallbackTones[hashText(category) % fallbackTones.length]
}
