/**
 * 将现有文章统一归属到当前超级管理员。
 * 默认只审计并输出变更预览；只有传入 --apply 才会备份并写入数据库。
 * 该迁移用于修复历史导入使用旧管理员账号、导致个人页文章数少于站点文章总数的问题。
 */

import fs from 'node:fs'
import path from 'node:path'
import mongoose from 'mongoose'
import { connectDatabase, disconnectDatabase } from '../config/database.js'
import { env } from '../config/env.js'
import { Article } from '#modules/content/models/Article.js'
import { User } from '#modules/user/models/User.js'
import { USER_ROLES } from '#constants/domain'

const args = new Set(process.argv.slice(2))
const APPLY = args.has('--apply')
const requestedUserId = process.argv.find((item) => item.startsWith('--user-id='))?.slice('--user-id='.length).trim()

function formatAuthor(author, usersById) {
  const id = author?.toString?.() || String(author || '')
  const user = usersById.get(id)
  return {
    id,
    username: user?.username || null,
    email: user?.email || null,
    role: user?.role || null,
    exists: Boolean(user)
  }
}

async function resolveTargetUser() {
  if (requestedUserId) {
    if (!mongoose.isValidObjectId(requestedUserId)) {
      throw new Error(`--user-id 不是有效的 MongoDB ObjectId：${requestedUserId}`)
    }
    const user = await User.findById(requestedUserId)
    if (!user) throw new Error(`找不到指定用户：${requestedUserId}`)
    if (user.role !== USER_ROLES.SUPER_ADMIN) {
      throw new Error(`指定用户不是超级管理员：${user.email}`)
    }
    return user
  }

  const superAdmins = await User.find({ role: USER_ROLES.SUPER_ADMIN }).sort({ createdAt: 1, _id: 1 })
  if (superAdmins.length === 0) {
    throw new Error('数据库中没有超级管理员，无法修复文章作者归属')
  }
  if (superAdmins.length > 1) {
    throw new Error(`检测到 ${superAdmins.length} 个超级管理员，请使用 --user-id=<目标账号ID> 明确指定归属账号`)
  }
  return superAdmins[0]
}

async function createBackup(articles) {
  const backupDir = path.join(env.rootDir, 'backups')
  fs.mkdirSync(backupDir, { recursive: true })
  const backupPath = path.join(backupDir, `article-authors-before-${Date.now()}.ejson`)
  const payload = {
    createdAt: new Date(),
    targetUserId: articles.targetUserId,
    collections: { articles: articles.documents }
  }
  fs.writeFileSync(backupPath, mongoose.mongo.BSON.EJSON.stringify(payload, null, 2), 'utf8')
  return backupPath
}

async function main() {
  await connectDatabase()
  const targetUser = await resolveTargetUser()
  const [allUsers, documents] = await Promise.all([
    User.find({}).select('_id username email role').lean(),
    Article.find({ createdBy: { $ne: targetUser._id } }).select('_id title slug createdBy updatedBy status deletedAt').lean()
  ])
  const usersById = new Map(allUsers.map((user) => [String(user._id), user]))
  const groups = new Map()
  for (const article of documents) {
    const key = article.createdBy?.toString?.() || 'missing'
    const group = groups.get(key) || { count: 0, published: 0, deleted: 0 }
    group.count++
    if (article.status === 'published') group.published++
    if (article.deletedAt) group.deleted++
    groups.set(key, group)
  }

  console.log(`模式：${APPLY ? 'apply' : 'dry-run'}`)
  console.log(`目标超级管理员：${targetUser.username} <${targetUser.email}> (${targetUser._id})`)
  console.log(`文章总数：${await Article.countDocuments({})}`)
  console.log(`目标账号现有文章：${await Article.countDocuments({ createdBy: targetUser._id })}`)
  console.log(`计划重新归属：${documents.length} 篇`)
  console.log(JSON.stringify([...groups.entries()].map(([id, stats]) => ({ author: formatAuthor(id, usersById), ...stats })), null, 2))

  if (!APPLY) {
    console.log('dry-run 完成，未写入数据库')
    return
  }

  const backupPath = await createBackup({ targetUserId: targetUser._id, documents })
  const result = await Article.updateMany(
    { _id: { $in: documents.map((article) => article._id) } },
    { $set: { createdBy: targetUser._id, updatedBy: targetUser._id } }
  )
  const remaining = await Article.countDocuments({ createdBy: { $ne: targetUser._id } })
  console.log(`已更新：${result.modifiedCount} 篇`)
  console.log(`备份文件：${backupPath}`)
  console.log(`修复后仍有其他作者归属：${remaining} 篇`)
  if (remaining !== 0) throw new Error('作者归属修复校验失败')
}

main()
  .catch((error) => {
    console.error(error)
    process.exitCode = 1
  })
  .finally(async () => {
    await disconnectDatabase()
  })
