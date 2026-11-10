import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'
import multer from 'multer'
import { getResourceScene } from '../constants/resourceScenes.js'
import { getResourceStorageAreas } from '../services/resourceStorage.service.js'
import { acquireMediaUpload } from '../services/mediaUploadGuard.service.js'

/**
 * 创建场景上传中间件，采用磁盘临时文件并在请求结束后统一回收。
 * @param {string} scene 已注册的服务端场景。
 * @param {string} field multipart 文件字段名。
 * @returns {Function} Express 中间件；调用前必须完成身份及目标业务授权。
 * @throws {Error} 超限、空间不足或上传解析失败时传给 next。
 */
export function receiveResourceFile(scene, field = 'file') {
  const policy = getResourceScene(scene)
  const upload = multer({
    storage: multer.diskStorage({
      destination: (_req, _file, done) => {
        const root = getResourceStorageAreas().find((area) => area.temporary).path
        fs.mkdir(root, { recursive: true }, (error) => done(error, root))
      },
      filename: (_req, _file, done) => done(null, crypto.randomUUID())
    }),
    limits: { fileSize: policy.maxBytes, files: 1, fields: 12, fieldSize: 45000, parts: 14 }
  }).single(field)
  return async (req, res, next) => {
    let release
    try {
      release = await acquireMediaUpload(req.headers['content-length'])
      let cleaned = false
      const cleanup = () => {
        if (cleaned) return
        cleaned = true
        if (req.file?.path) fs.promises.unlink(path.resolve(req.file.path)).catch(() => {})
        release()
      }
      res.once('finish', cleanup)
      res.once('close', cleanup)
      upload(req, res, (error) => {
        if (error) {
          error.statusCode = 400
          error.message = error.code === 'LIMIT_FILE_SIZE' ? `文件不能超过 ${policy.maxBytes / 1024 / 1024}MB` : '文件上传失败，请检查文件和表单内容'
        }
        next(error)
      })
    } catch (error) {
      release?.()
      next(error)
    }
  }
}
