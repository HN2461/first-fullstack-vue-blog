export const questionTypeOptions = [
  { label: '单选题', value: 'single_choice', color: 'blue' },
  { label: '多选题', value: 'multiple_choice', color: 'cyan' },
  { label: '判断题', value: 'true_false', color: 'green' },
  { label: '简答题', value: 'short_answer', color: 'orange' }
]

export const difficultyOptions = [
  { label: '简单', value: 'easy', color: 'green' },
  { label: '中等', value: 'medium', color: 'gold' },
  { label: '困难', value: 'hard', color: 'red' }
]

export const questionStatusOptions = [
  { label: '可用', value: 'ready', color: 'green' },
  { label: '草稿', value: 'draft', color: 'default' },
  { label: '已归档', value: 'archived', color: 'default' }
]

export const questionAssessmentModeOptions = [
  { label: '系统自动判分', value: 'auto' },
  { label: '提交后自行评估', value: 'self' }
]

export const selfAssessmentOptions = [
  { label: '掌握', value: 'mastered' },
  { label: '模糊', value: 'uncertain' },
  { label: '不会', value: 'unknown' }
]

export const paperModeOptions = [
  { label: '随机组卷', value: 'random' },
  { label: '固定选题', value: 'fixed' }
]

export const attemptModeOptions = [
  { label: '模拟考试', value: 'exam', color: 'red' },
  { label: '快速练习', value: 'practice', color: 'blue' },
  { label: '错题复习', value: 'review', color: 'orange' }
]

export function getOptionMeta(options, value) {
  return options.find((item) => item.value === value) || { label: value || '-', color: 'default' }
}

export function flattenCategoryOptions(tree = [], prefix = []) {
  return tree.flatMap((item) => {
    const path = [...prefix, item.name]
    return [
      { label: path.join(' / '), value: item.id, level: item.level },
      ...flattenCategoryOptions(item.children || [], path)
    ]
  })
}

export function formatQuestionTime(value) {
  if (!value) return '-'
  return new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date(value))
}

export function formatDuration(startedAt, submittedAt) {
  if (!startedAt || !submittedAt) return '-'
  const seconds = Math.max(0, Math.round((new Date(submittedAt) - new Date(startedAt)) / 1000))
  const minutes = Math.floor(seconds / 60)
  return `${minutes} 分 ${seconds % 60} 秒`
}
