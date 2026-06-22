export function getStatusLabel(status) {
  const map = { published: '已发布', draft: '草稿', archived: '已下架' }
  return map[status] || '草稿'
}

export function formatDate(dateStr) {
  if (!dateStr) return '-'
  return new Date(dateStr).toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

export function formatArticleTime(record) {
  if (record.publishedAt) {
    return formatDate(record.publishedAt)
  }
  return formatDate(record.updatedAt)
}

export function formatMetric(value) {
  return Number(value) || 0
}

export function formatTagSummary(tags = []) {
  if (!tags.length) {
    return ''
  }

  const names = tags.map((tag) => tag.name).filter(Boolean)
  if (names.length <= 2) {
    return names.join(' / ')
  }

  return `${names.slice(0, 2).join(' / ')} 等 ${names.length} 个标签`
}

export function buildCategoryOptions(items = []) {
  const nodeMap = new Map()
  const roots = []

  items.forEach((item) => {
    nodeMap.set(item.id, {
      value: item.id,
      title: item.name,
      label: item.name,
      children: []
    })
  })

  items.forEach((item) => {
    const node = nodeMap.get(item.id)
    const parentId = item.parent || null
    const parent = parentId ? nodeMap.get(parentId) : null

    if (parent) {
      parent.children.push(node)
      return
    }

    roots.push(node)
  })

  const cleanup = (nodes = []) => nodes.map((node) => {
    const next = { ...node }
    if (next.children.length) {
      next.children = cleanup(next.children)
    } else {
      delete next.children
    }
    return next
  })

  return cleanup(roots)
}
