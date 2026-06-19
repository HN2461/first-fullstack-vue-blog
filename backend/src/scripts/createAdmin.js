import bcrypt from 'bcryptjs'
import { USER_ROLES, USER_STATUS } from '#constants/domain'
import { connectDatabase, disconnectDatabase } from '../config/database.js'
import { env } from '../config/env.js'
import { User } from '#modules/user/models/User.js'

function assertAdminEnv() {
  const missing = []

  if (!env.adminUsername) missing.push('ADMIN_USERNAME')
  if (!env.adminEmail) missing.push('ADMIN_EMAIL')
  if (!env.adminPassword) missing.push('ADMIN_PASSWORD')

  if (missing.length > 0) {
    throw new Error(`缺少管理员初始化配置：${missing.join(', ')}`)
  }

  if (env.adminPassword.length < 8) {
    throw new Error('ADMIN_PASSWORD 至少需要 8 个字符')
  }
}

async function createAdmin() {
  assertAdminEnv()
  await connectDatabase()

  const email = env.adminEmail.trim().toLowerCase()
  const exists = await User.findOne({ email })

  if (exists) {
    exists.username = env.adminUsername.trim()
    exists.role = USER_ROLES.ADMIN
    exists.status = USER_STATUS.ACTIVE
    exists.passwordHash = await bcrypt.hash(env.adminPassword, 12)
    await exists.save()
    console.log(`管理员已更新：${email}`)
    return
  }

  await User.create({
    username: env.adminUsername.trim(),
    email,
    passwordHash: await bcrypt.hash(env.adminPassword, 12),
    role: USER_ROLES.ADMIN,
    status: USER_STATUS.ACTIVE
  })

  console.log(`管理员已创建：${email}`)
}

createAdmin()
  .catch((error) => {
    console.error(error.message)
    process.exitCode = 1
  })
  .finally(async () => {
    await disconnectDatabase()
  })
