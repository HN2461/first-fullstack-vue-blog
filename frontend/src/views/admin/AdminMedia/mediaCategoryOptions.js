const SYSTEM_CATEGORY_NAMES = ['用户头像', '简历照片', '讨论附件', '文章资源', '默认素材', '文章封面', '文章正文图片',
  '文章正文临时图片', '文章原始文档', '文章快照原始文档', '工作日志', '意见反馈', '历史未登记资源']

/**
 * 解释统一资源的手动操作限制，不把分类或上传人当作读取授权。
 * @param {object} record 服务端资源描述。
 * @returns {{moveReason:string,deleteReason:string}} 被保护操作的原因。
 * @throws {Error} 无外部操作，最终约束仍由后端执行。
 */
export function getMediaActionRestrictions(record = {}) {
  const managed = record.systemManaged || record.feedback || record.workJournalLog ||
    Boolean(record.scene && record.scene !== 'admin-library') || SYSTEM_CATEGORY_NAMES.includes(record.category)
  return {
    moveReason: managed ? '由所属业务维护，请到对应业务修改' : '',
    deleteReason: record.usage?.referenceCount > 0 ? '仍有使用位置，请先在所属业务移除或替换' : ''
  }
}

/**
 * 过滤手动迁移目标，普通分类归属及密码箱会话由服务器再次验证。
 * @param {Array<object>} categories 已授权分类。
 * @param {Array<object>} records 待移动文件。
 * @param {string} currentUserId 当前账号。
 * @returns {Array<object>} 本人非系统、非虚拟分类；包含其他上传人时为空。
 * @throws {Error} 不执行外部操作。
 */
export function getMovableMediaCategories(categories = [], records = [], currentUserId = '') {
  if (records.some((record) => String(record?.uploader?.id || record?.uploader || '') !== String(currentUserId))) return []
  return categories.filter((item) => !item.system && !item.virtual && String(item.owner || '') === String(currentUserId))
}

/**
 * 过滤资源页面上传目标，系统分类只允许通过对应业务写入。
 * @param {Array<object>} categories 已授权分类。
 * @param {string} currentUserId 当前账号。
 * @param {boolean} vault 是否在本人密码箱中上传。
 * @returns {Array<object>} 本人普通分类或本人密码箱。
 * @throws {Error} 不执行外部操作，空结果由调用方处理。
 */
export function getUploadMediaCategories(categories = [], currentUserId = '', vault = false) {
  return categories.filter((item) => item.id && !item.virtual && !item.system &&
    String(item.owner || '') === String(currentUserId) &&
    (vault ? item.accessMode === 'vault' : item.accessMode !== 'vault'))
}

/**
 * 生成分类查询，兼容旧记录无ID、历史虚拟分类及不同上传人同名分类。
 * @param {string} value 分类编号或旧名称。
 * @param {Array<object>} categories 已授权分类描述。
 * @returns {object} 分类ID、名称及必要归属限定。
 * @throws {Error} 未知名称保持原值，由服务器执行访问范围筛选。
 */
export function getMediaCategoryQuery(value, categories = []) {
  if (!value) return {}
  const category = categories.find((item) => String(item.id) === value || item.name === value)
  if (/^[a-f\d]{24}$/i.test(value)) {
    return { categoryId: value, ...(category ? { category: category.name, ...(category.owner ? { categoryOwner: category.owner } : {}) } : {}) }
  }
  return { category: category?.name || value, ...(category?.owner ? { categoryOwner: category.owner } : {}) }
}
