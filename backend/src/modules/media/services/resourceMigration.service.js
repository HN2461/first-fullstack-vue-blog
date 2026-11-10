import fs from 'node:fs/promises'
import path from 'node:path'
import { Media } from '../models/Media.js'
import { MediaReference } from '../models/MediaReference.js'
import { User } from '#modules/user/models/User.js'
import { Resume } from '#modules/resume/models/Resume.js'
import { DiscussionMessage } from '#modules/discussion/models/DiscussionMessage.js'
import { Article } from '#modules/content/models/Article.js'
import { WorkLog } from '#modules/workJournal/models/WorkLog.js'
import { MediaCategory } from '../models/MediaCategory.js'
import { resolveResourcePath, describeResourcePath } from './resourceStorage.service.js'
import { resolveUploadRoot } from '#utils/uploadPath.js'
import { getResourceScene } from '../constants/resourceScenes.js'
import { inferMimeType, inferFileClass } from '../utils/mediaInventory.util.js'
import { extractArticleContentMediaUrls } from './articleContentMedia.service.js'
import { getResourceId, getResourcePath, getResourceAliases } from './resourceIdentity.service.js'

/**
 * 按已知业务引用补登记历史文件，不移动原件、不扫描猜测未知文件归属。
 * @param {{apply?:boolean}} options 默认只统计，明确 apply 才写入。
 * @returns {Promise<object>} 文件、业务更新、引用及异常数量；重复执行无差异。
 * @throws {Error} 数据库失败抛出；缺失或越界的单个文件保留原数据并报告异常。
 */
export async function reconcileResources({ apply = false } = {}) {
  const result = { mode: apply ? 'apply' : 'dry-run', files: 0, metadata: 0, bindings: 0, staleBindings: 0, lifecycle: 0, businesses: 0, errors: [] }
  const mediaItems = await Media.find({})
  const byPath = new Map(mediaItems.map((item) => [path.resolve(item.storagePath), item]))
  const byUrl = new Map(mediaItems.flatMap((item) => getResourceAliases(item).map((url) => [url, item])))
  const refs = await MediaReference.find({}).lean()
  const refKeys = new Set(refs.map((ref) => `${ref.mediaId}:${ref.targetType}:${ref.targetId}:${ref.field}:${ref.state}`))
  const expectedKeys = new Set()
  const referencedIds = new Set()

  async function bind(media, type, target, field, owner, state = 'active') {
    const key = `${media._id}:${type}:${target}:${field}:${state}`
    referencedIds.add(String(media._id))
    expectedKeys.add(`${media._id}:${type}:${target}:${field}`)
    if (refKeys.has(key)) return
    result.bindings += 1
    refKeys.add(key)
    if (apply) await MediaReference.updateOne({ mediaId: media._id, targetType: type, targetId: String(target), field }, {
      $set: { state, ownerId: owner || null }
    }, { upsert: true })
  }

  async function register(filePath, scene, owner, targetId) {
    // 真实路径校验也用于 dry-run，不能把历史消息中可伪造的路径直接登记为受信任资源。
    const canonical = await resolveResourcePath({ storagePath: filePath })
    let media = byPath.get(path.resolve(filePath)) || byPath.get(canonical)
    const policy = getResourceScene(scene)
    if (media) {
      if (String(media.uploader) !== String(owner) && policy.accessScope !== 'public') throw new Error('历史私人文件上传人与业务归属不一致，未修改')
      if (media.scene !== scene || media.accessScope !== policy.accessScope) {
        if (media.scene && !['admin-library', scene].includes(media.scene)) throw new Error('历史文件存在不同业务用途，未修改访问范围')
        result.metadata += 1
        Object.assign(media, { scene, accessScope: policy.accessScope, sourceTargetId: String(targetId) })
        if (policy.accessScope === 'private') media.url = `/api/resources/${media._id}/content`
        if (apply) await media.save()
      }
    }
    if (!media) {
      const stats = await fs.stat(canonical)
      const filename = path.basename(canonical)
      const mimeType = inferMimeType(filename)
      media = new Media({
        filename, originalName: filename, mimeType, size: stats.size, storagePath: canonical,
        ...describeResourcePath(canonical), scene, sourceTargetId: String(targetId), uploader: owner,
        accessScope: policy.accessScope, category: policy.category, kind: mimeType.startsWith('image/') ? 'image' : 'attachment',
        fileClass: inferFileClass(filename, mimeType), lifecycleStatus: 'attached', expiresAt: null,
        url: '/pending'
      })
      media.url = `/api/resources/${media._id}/content`
      result.files += 1
      if (apply) {
        const category = await MediaCategory.findOneAndUpdate({ name: policy.category, owner: null }, {
          $setOnInsert: { system: true, description: '统一文件管理历史登记' }
        }, { upsert: true, returnDocument: 'after', setDefaultsOnInsert: true })
        media.categoryId = category._id
        await media.save()
      }
      mediaItems.push(media)
      byPath.set(canonical, media)
      byUrl.set(media.url, media)
    }
    const publicRelative = path.relative(resolveUploadRoot(), canonical)
    if (publicRelative && !publicRelative.startsWith('..') && !path.isAbsolute(publicRelative)) {
      byUrl.set(`/uploads/${publicRelative.replaceAll('\\', '/')}`, media)
    }
    return media
  }

  async function attempt(label, action) {
    try { await action() } catch (error) { result.errors.push({ source: label, message: error.message }) }
  }

  // 先完善已登记文件，无法还原的历史来源按素材保留；新上传直接记录 scene。
  for (const media of mediaItems) {
    await attempt(`media:${media._id}`, async () => {
      await resolveResourcePath(media)
      const descriptor = describeResourcePath(media.storagePath)
      const scene = media.scene || (media.feedback ? 'feedback-image' : media.workJournalLog ? 'work-journal-evidence' : 'admin-library')
      const missingLifecycle = media.$isDefault('lifecycleStatus')
      const missingAccessScope = media.$isDefault('accessScope')
      const legacyAccessScope = getResourceScene(scene).accessScope
      if (missingAccessScope && legacyAccessScope === 'public' && !descriptor.storageKey.startsWith('public/')) {
        throw new Error('历史文件缺少访问范围且位于私有目录，未按公开素材补齐')
      }
      if (media.scene === scene && media.storageKey === descriptor.storageKey && media.provider === 'local' && !missingLifecycle && !missingAccessScope) return
      result.metadata += 1
      // 旧库没有状态字段时明确补为保留，避免“保留素材”筛选漏掉旧库存。
      // Mongoose 默认值只在内存补齐，必须落库才能让公开素材的数据库筛选包含早期记录。
      const metadata = { ...descriptor, scene, ...(missingLifecycle ? { lifecycleStatus: 'retained', expiresAt: null } : {}),
        ...(missingAccessScope ? { accessScope: legacyAccessScope } : {}) }
      if (apply) await Media.updateOne({ _id: media._id }, { $set: metadata })
      Object.assign(media, metadata)
    })
  }

  for (const user of await User.find({ avatar: { $ne: '' } })) {
    await attempt(`user:${user._id}`, async () => {
      const pathname = getResourcePath(user.avatar)
      const id = getResourceId(user.avatar) || user.avatarMediaId
      let media = byUrl.get(user.avatar) || byUrl.get(pathname) || mediaItems.find((item) => String(item._id) === String(id))
      if (pathname.startsWith('/uploads/avatars/')) media = await register(path.resolve(resolveUploadRoot(), pathname.slice('/uploads/'.length)), 'user-avatar', user._id, user._id)
      if (!media) return
      if (media.kind !== 'image' || media.accessScope !== 'public') throw new Error('头像引用了非公开图片，保留原数据并要求人工确认')
      await bind(media, 'user', user._id, 'avatar', user._id)
      if (String(user.avatarMediaId || '') !== String(media._id)) {
        result.businesses += 1
        if (apply) await User.updateOne({ _id: user._id, avatar: user.avatar }, { $set: { avatarMediaId: media._id } })
      }
    })
  }

  for (const resume of await Resume.find({})) {
    await attempt(`resume:${resume._id}`, async () => {
      const profile = resume.sections?.profile || {}
      const pathname = getResourcePath(profile.photoUrl)
      const id = getResourceId(profile.photoUrl) || profile.photoMediaId
      let media = id ? mediaItems.find((item) => String(item._id) === String(id)) : byUrl.get(profile.photoUrl) || byUrl.get(pathname)
      if (pathname.startsWith('/uploads/resumes/')) {
        media = await register(path.resolve(resolveUploadRoot(), pathname.slice('/uploads/'.length)), 'resume-photo', resume.ownerId, resume._id)
      }
      if (!media) return
      if (media.kind !== 'image') throw new Error('简历照片不是图片，未修改')
      if (media.accessScope !== 'public' && (String(media.uploader) !== String(resume.ownerId) || media.scene !== 'resume-photo')) {
        throw new Error('简历引用的私人文件归属或用途不符，未修改')
      }
      await bind(media, 'resume', resume._id, 'photo', resume.ownerId)
      if (String(profile.photoMediaId || '') !== String(media._id) || profile.photoUrl !== media.url) {
        result.businesses += 1
        if (apply) await Resume.updateOne({ _id: resume._id, 'sections.profile.photoUrl': profile.photoUrl }, {
          $set: { 'sections.profile.photoMediaId': String(media._id), 'sections.profile.photoUrl': media.url }
        })
      }
    })
  }

  for (const message of await DiscussionMessage.find({ revokedAt: null, 'attachments.0': { $exists: true } })) {
    await attempt(`discussion:${message._id}`, async () => {
      let changed = false
      for (const attachment of message.attachments) {
        let media = attachment.mediaId ? mediaItems.find((item) => String(item._id) === String(attachment.mediaId)) : null
        if (!media) {
          const root = path.resolve(resolveUploadRoot(), 'discussions')
          const target = path.resolve(attachment.storagePath || '')
          const relative = path.relative(root, target)
          if (!relative || relative.startsWith('..') || path.isAbsolute(relative)) throw new Error('历史附件路径不在讨论专属目录内，未登记')
          media = await register(target, 'discussion-attachment', message.senderId, message.threadId)
        }
        if (String(media.uploader) !== String(message.senderId) || media.scene !== 'discussion-attachment' ||
          media.accessScope !== 'private' || media.sourceTargetId && String(media.sourceTargetId) !== String(message.threadId)) {
          throw new Error('讨论附件归属、用途或会话不符，未修改')
        }
        await bind(media, 'discussion-message', message._id, 'attachment', message.senderId)
        if (String(attachment.mediaId || '') !== String(media._id) || attachment.url !== media.url) {
          changed = true
          attachment.mediaId = media._id
          attachment.url = media.url
        }
      }
      if (changed) {
        result.businesses += 1
        if (apply) await message.save()
      }
    })
  }

  for (const media of mediaItems.filter((item) => item.feedback)) await bind(media, 'feedback', media.feedback, `image:${media._id}`, media.uploader)
  for (const log of await WorkLog.find({ 'evidence.mediaId': { $ne: null } })) {
    for (const evidence of log.evidence || []) {
      const media = mediaItems.find((item) => String(item._id) === String(evidence.mediaId))
      if (media) await bind(media, 'work-log', log._id, `evidence:${evidence._id}`, log.createdBy, log.deletedAt ? 'retained' : 'active')
    }
  }
  for (const article of await Article.find({})) {
    const urls = [article.cover, ...extractArticleContentMediaUrls(article.contentMarkdown), ...(article.resources || []).map((item) => item.url), article.document?.originalUrl, article.document?.previewUrl]
    const ids = [...(article.resources || []).map((item) => item.mediaId), article.document?.originalMediaId, article.document?.previewMediaId].filter(Boolean).map(String)
    const matched = new Map(mediaItems.filter((item) => urls.includes(item.url) || ids.includes(String(item._id))).map((item) => [String(item._id), item]))
    for (const url of urls) {
      const media = byUrl.get(url) || byUrl.get(getResourcePath(url)) || mediaItems.find((item) => String(item._id) === String(getResourceId(url)))
      if (media) matched.set(String(media._id), media)
    }
    for (const media of matched.values()) {
      if (media.accessScope !== 'public') {
        result.errors.push({ source: `article:${article._id}`, message: '文章引用了私人文件或密码箱文件，保留原数据并要求人工确认' })
        continue
      }
      await bind(media, 'article', article._id, 'resources', article.createdBy, article.deletedAt ? 'retained' : 'active')
    }
  }
  // 只有完整读取所有来源且没有异常时才移除过时索引，避免把未知状态当成未引用。
  if (!result.errors.length) {
    for (const ref of refs) {
      if (!['user', 'resume', 'discussion-message', 'feedback', 'work-log', 'article'].includes(ref.targetType)) continue
      if (!expectedKeys.has(`${ref.mediaId}:${ref.targetType}:${ref.targetId}:${ref.field}`)) {
        result.staleBindings += 1
        if (apply) await MediaReference.deleteOne({ _id: ref._id })
      }
    }
    const unknownIds = new Set(refs.filter((ref) => !['user', 'resume', 'discussion-message', 'feedback', 'work-log', 'article'].includes(ref.targetType)).map((ref) => String(ref.mediaId)))
    for (const media of mediaItems) {
      if (media.lifecycleStatus !== 'attached' || referencedIds.has(String(media._id)) || unknownIds.has(String(media._id))) continue
      result.lifecycle += 1
      if (apply) await Media.updateOne({ _id: media._id, lifecycleStatus: 'attached' }, {
        $set: { lifecycleStatus: 'pending', expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) }
      })
    }
  }
  return result
}
