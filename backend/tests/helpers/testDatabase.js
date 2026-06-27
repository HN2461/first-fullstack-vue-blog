import mongoose from 'mongoose'
import { MongoMemoryServer } from 'mongodb-memory-server'
import fs from 'node:fs'
import { resolveUploadRoot } from '../../src/utils/uploadPath.js'

let mongoServer = null

function resetTestUploadRoot() {
  if (process.env.NODE_ENV !== 'test') {
    return
  }

  const uploadRoot = resolveUploadRoot()
  fs.rmSync(uploadRoot, { recursive: true, force: true })
  fs.mkdirSync(uploadRoot, { recursive: true })
}

export async function connectTestDatabase() {
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
