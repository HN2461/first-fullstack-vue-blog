/**
 * 为文件列表和分类数量生成相同的工作区条件，条件须与账号权限取交集。
 * @param {string} workspace 素材、业务、全部或本人密码箱视图。
 * @param {string|object} actorId 当前登录账号 ID。
 * @returns {Array<object>} 可追加到 MongoDB $and 的条件；未知工作区不扩大既有权限。
 * @throws {Error} 不访问数据库，不抛出业务异常。
 */
export function getMediaWorkspaceConditions(workspace, actorId) {
  if (workspace === 'folders') return [{ accessScope: { $ne: 'vault' } }]
  if (workspace === 'library') {
    return [
      { accessScope: 'public' },
      { $or: [{ scene: { $in: ['', 'admin-library'] } }, { scene: { $exists: false } }] },
      { feedback: null },
      { workJournalLog: null }
    ]
  }
  if (workspace === 'business') {
    return [
      { accessScope: { $ne: 'vault' } },
      { $or: [
        { scene: { $exists: true, $nin: ['', 'admin-library', null] } },
        { feedback: { $ne: null } },
        { workJournalLog: { $ne: null } }
      ] }
    ]
  }
  return workspace === 'vault' ? [{ accessScope: 'vault', uploader: actorId || null }] : []
}
