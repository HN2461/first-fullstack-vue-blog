export const SYSTEM_MEDIA_CATEGORIES = Object.freeze([
  { name: '用户头像', description: '用户资料中的头像', sortOrder: 9 },
  { name: '简历照片', description: '简历专属私有照片', sortOrder: 10 },
  { name: '讨论附件', description: '由讨论成员权限保护的附件', sortOrder: 11 },
  { name: '文章资源', description: '文章关联的附件', sortOrder: 12 },
  {
    name: '默认素材',
    description: '系统默认资源分类',
    sortOrder: 0
  },
  {
    name: '文章封面',
    description: '文章封面专用资源分类',
    sortOrder: 1
  },
  {
    name: '文章正文图片',
    description: '文章正文中已保存引用的图片资源',
    sortOrder: 2
  },
  {
    name: '文章正文临时图片',
    description: '编辑器粘贴或插入但尚未绑定文章的正文图片',
    sortOrder: 3
  },
  {
    name: '文章原始文档',
    description: '通过文档导入创建的原始附件，供文章下载和内容转换使用',
    sortOrder: 4
  },
  {
    name: '文章快照原始文档',
    description: '本地文章快照同步生成的原始附件，保留文章来源与阅读关联',
    sortOrder: 5
  },
  {
    name: '工作日志',
    description: '工作日记的私有图片凭证，由日报与资源管理共同维护',
    sortOrder: 6
  },
  {
    name: '意见反馈',
    description: '意见反馈的私有截图，仅提交者和授权处理人可查看',
    sortOrder: 8
  },
  {
    name: '历史未登记资源',
    description: '服务器上传目录中扫描并补登记的历史资源',
    sortOrder: 7
  }
])

/**
 * 识别业务维护的内置分类，历史文件未保存分类ID时也适用。
 * @param {string} name 分类名称。
 * @returns {boolean} 是否为已登记的系统分类。
 * @throws {Error} 不执行外部操作，未知名称返回false。
 */
export function isSystemMediaCategory(name) {
  return SYSTEM_MEDIA_CATEGORIES.some((item) => item.name === name)
}
