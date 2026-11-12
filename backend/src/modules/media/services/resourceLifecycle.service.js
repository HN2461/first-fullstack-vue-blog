import { Media } from '../models/Media.js'
import { MediaReference } from '../models/MediaReference.js'
import { removeResourceFile } from './resourceStorage.service.js'
import { withResourceLocks } from './resourceLock.service.js'
import { findMediaReferences } from './mediaReference.service.js'
import { removeMediaThumbnail } from './mediaThumbnail.service.js'
import { invalidateMediaStorageUsageCache } from './mediaStorage.service.js'
import { RESOURCE_PENDING_TTL } from './resourceFile.service.js'

/**
 * 回收已超期且无业务引用的待绑定资源，永久素材和业务保留文件不参与。
 * @param {{now?: Date, limit?: number, dryRun?: boolean}} options 时间、批量上限和预演开关。
 * @returns {Promise<{candidates:number, deleted:number, protected:number, errors:Array}>} 清理结果。
 * @throws {Error} 查询失败会中止，单个文件删除失败会保留记录以便重试。
 */
export async function cleanupPendingResources({ now = new Date(), limit = 100, dryRun = false } = {}) {
  const candidates = await Media.find({
    scene: { $ne: '' },
    lifecycleStatus: { $in: ['pending', 'deleting'] },
    expiresAt: { $lte: now, $ne: null },
    deletedAt: null
  }).sort({ expiresAt: 1 }).limit(limit)
  const result = { candidates: candidates.length, deleted: 0, protected: 0, errors: [] }
  for (const candidate of candidates) {
    await withResourceLocks([candidate._id], async () => {
      const media = await Media.findById(candidate._id)
      // 候选查询发生在锁外；等待期间文件可能已被用户移入回收站，必须重新确认。
      if (!media || media.deletedAt || !['pending', 'deleting'].includes(media.lifecycleStatus) || !media.expiresAt || media.expiresAt > now) return
      try {
        if (await MediaReference.exists({ mediaId: media._id }) || (await findMediaReferences(media)).length) {
          result.protected += 1
          // 保守引用不能误删，但也不能一直占据最早的一批，阻塞后续废弃文件回收。
          if (!dryRun) await Media.updateOne({ _id: media._id }, {
            $set: { lifecycleStatus: 'pending', expiresAt: new Date(now.getTime() + RESOURCE_PENDING_TTL) }
          })
          return
        }
        if (dryRun) return
        await Media.updateOne({ _id: media._id }, { $set: { lifecycleStatus: 'deleting' } })
        await removeResourceFile(media)
        await removeMediaThumbnail(media._id)
        await Media.deleteOne({ _id: media._id, lifecycleStatus: 'deleting' })
        result.deleted += 1
      } catch (error) {
        result.errors.push({ id: String(media._id), message: error.message })
      }
    })
  }
  if (result.deleted) invalidateMediaStorageUsageCache()
  return result
}

/**
 * 启动保守的资源清理任务，单批有限且不会重叠。
 * @returns {NodeJS.Timeout} 不阻止进程退出的定时器。
 * @throws {Error} 后台异常记录日志，文件继续保留。
 */
export function startResourceCleanup() {
  let running = false
  const cleanup = async () => {
    if (running) return
    running = true
    try {
      const result = await cleanupPendingResources()
      if (result.errors.length) console.error('资源清理部分失败', result.errors)
    } catch (error) {
      console.error('资源清理失败', error)
    } finally {
      running = false
    }
  }
  const timer = setInterval(cleanup, 15 * 60 * 1000)
  timer.unref()
  return timer
}
