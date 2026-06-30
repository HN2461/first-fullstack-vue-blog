// 文章、分类、标签等内容型页面不逐条进入 RBAC 菜单树，但仍属于知识库工作区。
export function isKnowledgeConsolePath(path = '') {
  return path === '/console/articles' ||
    path === '/console/article-directory' ||
    path === '/console/discussions' ||
    path === '/console/search' ||
    path === '/console/profile' ||
    path.startsWith('/console/articles/') ||
    path.startsWith('/console/article-directory/articles/') ||
    path.startsWith('/console/article-directory/categories/') ||
    path.startsWith('/console/article-directory/tags/') ||
    path.startsWith('/console/categories/') ||
    path.startsWith('/console/tags/')
}
