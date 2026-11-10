import mongoose from 'mongoose'
import { MongoMemoryServer } from 'mongodb-memory-server'
import fs from 'node:fs'
import { resolveUploadRoot } from '../../src/utils/uploadPath.js'
import { getResourceStorageAreas } from '../../src/modules/media/services/resourceStorage.service.js'
import path from 'node:path'

let mongoServer = null

function resetTestUploadRoot() {
  if (process.env.NODE_ENV !== 'test') {
    return
  }

  const uploadRoot = resolveUploadRoot()
  fs.rmSync(uploadRoot, { recursive: true, force: true })
  fs.mkdirSync(uploadRoot, { recursive: true })
  const testRoot = path.resolve(uploadRoot, '..')
  for (const area of getResourceStorageAreas().filter((item) => item.key !== 'public')) {
    const relative = path.relative(testRoot, area.path)
    if (!relative || relative.startsWith('..') || path.isAbsolute(relative)) throw new Error('测试存储清理路径超出隔离目录')
    fs.rmSync(area.path, { recursive: true, force: true })
  }
}

export async function connectTestDatabase() {
  if (process.env.TEST_MONGODB_URI) {
    await mongoose.connect(process.env.TEST_MONGODB_URI)
    resetTestUploadRoot()
    return
  }

  mongoServer = await MongoMemoryServer.create()
  await mongoose.connect(mongoServer.getUri())
  resetTestUploadRoot()
}

export async function clearTestDatabase() {
  resetTestUploadRoot()
  const collections = await mongoose.connection.db.collections()

  for (const collection of collections) {
    await collection.deleteMany({})
  }
}

export async function disconnectTestDatabase() {
  await mongoose.disconnect()

  if (mongoServer) {
    await mongoServer.stop()
    mongoServer = null
  }
}
