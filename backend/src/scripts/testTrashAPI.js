/**
 * 端到端测试：模拟浏览器发回收站请求
 */

import fs from 'node:fs'
import path from 'node:path'
import { connectDatabase, disconnectDatabase } from '../config/database.js'
import { Article } from '../models/Article.js'
import { Category } from '../models/Category.js'
import { Tag } from '../models/Tag.js'
import { User } from '../models/User.js'
import jwt from 'jsonwebtoken'
import { env } from '../config/env.js'
import http from 'node:http'

async function main() {
  await connectDatabase()

  // 注册所有 model（确保 populate 不报错）
  console.log('Models registered:', Object.keys(mongoose.models))

  // 1. 获取回收站列表
  const deleted = await Article.find({ deletedAt: { $ne: null } }).lean()
  console.log('\n回收站文章数:', deleted.length)

  if (deleted.length === 0) {
    console.log('回收站为空')
    await disconnectDatabase()
    return
  }

  // 2. 获取 admin user 来生成 token
  const admin = await User.findOne({ role: 'admin' }).lean()
  if (!admin) {
    console.log('ERROR: 没有 admin 用户')
    await disconnectDatabase()
    return
  }

  const token = jwt.sign(
    { userId: admin._id.toString(), role: admin.role },
    env.jwtSecret,
    { expiresIn: '1h' }
  )
  console.log('Token generated for admin:', admin.username)

  // 3. 测试清空回收站（DELETE /api/admin/articles/trash/empty）
  console.log('\n--- 测试 DELETE /api/admin/articles/trash/empty ---')
  await testRequest('DELETE', '/api/admin/articles/trash/empty', token)

  // 4. 验证
  const after = await Article.find({ deletedAt: { $ne: null } }).lean()
  console.log('\n清空后回收站文章数:', after.length)

  await disconnectDatabase()
}

function testRequest(method, path, token) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: '127.0.0.1',
      port: 3001,
      path,
      method,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    }

    const req = http.request(options, (res) => {
      let data = ''
      res.on('data', chunk => data += chunk)
      res.on('end', () => {
        console.log(`  Status: ${res.statusCode}`)
        try {
          const parsed = JSON.parse(data)
          console.log(`  Response:`, JSON.stringify(parsed).slice(0, 300))
        } catch {
          console.log(`  Raw:`, data.slice(0, 300))
        }
        resolve()
      })
    })

    req.on('error', (e) => {
      console.log(`  Error: ${e.message}`)
      resolve()
    })

    req.end()
  })
}

import mongoose from 'mongoose'

main().catch(e => { console.error('ERR:', e); process.exitCode = 1 })
