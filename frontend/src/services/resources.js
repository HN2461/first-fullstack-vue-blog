import http from './http'

/**
 * 按服务端场景上传文件，不传存储路径或公开范围。
 * @param {File} file 浏览器源文件。
 * @param {{scene:string,targetId?:string,signal?:AbortSignal,onProgress?:Function}} options 场景和进度。
 * @returns {Promise<object>} 含 mediaId 的安全文件描述。
 * @throws {Error} 权限、格式、超限或网络异常时抛出。
 */
export function uploadResource(file, options) {
  const body = new FormData()
  body.append('file', file)
  return http.post(`/api/resources/upload/${encodeURIComponent(options.scene)}`, body, {
    params: options.targetId ? { targetId: options.targetId } : {},
    headers: { 'Content-Type': 'multipart/form-data' },
    signal: options.signal,
    onUploadProgress: options.onProgress,
    timeout: 240000
  })
}

/**
 * 读取本站资源为 blob，复用登录失效处理，避免把访问令牌拼进 URL。
 * @param {string} url 本站资源或业务读取接口。
 * @param {object} options 取消信号。
 * @returns {Promise<Blob>} 文件内容。
 * @throws {Error} 非本站地址或请求失败时拒绝，不向外站发送认证信息。
 */
export function readResourceBlob(url, options = {}) {
  if (!/^\/(api|uploads)\//.test(url) || url.includes('\\')) throw new Error('只允许读取本站文件')
  return http.get(url, { responseType: 'blob', signal: options.signal })
}

/**
 * 通过本站认证请求下载资源，再释放临时浏览器地址。
 * @param {object} resource 含本站 url 和文件名的安全描述。
 * @returns {Promise<void>} 下载已交给浏览器处理。
 * @throws {Error} 地址不受管、鉴权或读取失败时抛出。
 */
export async function downloadResource(resource) {
  const blob = await readResourceBlob(resource.url)
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = resource.originalName || resource.name || '文件'
  anchor.click()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}
