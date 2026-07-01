export function buildFolderTree(folders = []) {
  const nodes = folders.map((folder) => ({
    ...folder,
    key: folder.id,
    title: folder.name,
    children: []
  }))
  const map = new Map(nodes.map((node) => [node.id, node]))
  const roots = []

  for (const node of nodes) {
    if (node.parentId && map.has(node.parentId)) {
      map.get(node.parentId).children.push(node)
    } else {
      roots.push(node)
    }
  }

  const sortNodes = (items) => {
    items.sort((left, right) => (left.sortOrder || 0) - (right.sortOrder || 0) || left.name.localeCompare(right.name, 'zh-Hans-CN'))
    items.forEach((item) => sortNodes(item.children || []))
    return items
  }

  return sortNodes(roots)
}

export function flattenFolders(folders = [], level = 0) {
  return folders.flatMap((folder) => [
    { ...folder, level },
    ...flattenFolders(folder.children || [], level + 1)
  ])
}

export function parseTags(text = '') {
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

export function formatTime(value) {
  if (!value) return '-'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '-'
  const pad = (num) => String(num).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`
}

export function downloadBlob(blob, fileName) {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = fileName
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
