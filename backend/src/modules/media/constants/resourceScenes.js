const MB = 1024 * 1024

const image = { maxBytes: 5 * MB, imageFormats: ['jpeg', 'png', 'gif', 'webp'], maxFiles: 1 }

// 场景限制由服务器维护；客户端只能选择场景，不能自行声明公开范围或存储目录。
export const RESOURCE_SCENES = Object.freeze({
  'user-avatar': { ...image, label: '用户头像', accessScope: 'public', category: '用户头像' },
  'resume-photo': { ...image, imageFormats: ['jpeg'], label: '简历照片', accessScope: 'private', category: '简历照片' },
  'discussion-attachment': { maxBytes: 5 * MB, maxFiles: 1, label: '讨论附件', accessScope: 'private', category: '讨论附件' },
  'work-journal-evidence': { ...image, maxFiles: 20, label: '工作日志凭证', accessScope: 'private', category: '工作日志' },
  'feedback-image': { ...image, maxFiles: 5, label: '意见反馈图片', accessScope: 'private', category: '意见反馈' },
  'article-cover': { ...image, maxBytes: 20 * MB, label: '文章封面', accessScope: 'public', category: '文章封面', reusable: true },
  'article-content': { ...image, maxBytes: 20 * MB, maxFiles: 20, label: '文章正文图片', accessScope: 'public', category: '文章正文临时图片', reusable: true },
  'article-resource': { maxBytes: 1024 * MB, maxFiles: 20, label: '文章附件', accessScope: 'public', category: '文章资源', reusable: true },
  'admin-library': { maxBytes: 1024 * MB, maxFiles: 20, label: '媒体素材', accessScope: 'public', category: '默认素材', reusable: true }
})

/**
 * 获取受支持的文件场景，避免未知业务绕过默认限制。
 * @param {string} scene 上传场景编码。
 * @returns {object} 服务端场景策略。
 * @throws {Error} 场景未登记时返回 400。
 */
export function getResourceScene(scene) {
  const policy = Object.hasOwn(RESOURCE_SCENES, scene) ? RESOURCE_SCENES[scene] : null
  if (!policy) throw resourceError(400, 'RESOURCE_SCENE_INVALID', '不支持的文件上传场景')
  return policy
}

/**
 * 构造可供统一异常中间件识别的资源业务错误。
 * @param {number} statusCode HTTP 状态码。
 * @param {string} code 稳定的业务错误码。
 * @param {string} message 可展示给使用者的提示。
 * @returns {Error} 含状态和错误码的错误对象。
 * @throws {Error} 本函数只构造错误，抛出时机由调用方决定。
 */
export function resourceError(statusCode, code, message) {
  return Object.assign(new Error(message), { statusCode, code })
}
