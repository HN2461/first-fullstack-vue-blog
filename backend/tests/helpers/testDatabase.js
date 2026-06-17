import mongoose from 'mongoose'
import { MongoMemoryServer } from 'mongodb-memory-server'

let mongoServer = null

export async function connectTestDatabase() {
  mongoServer = await MongoMemoryServer.create()
  await mongoose.connect(mongoServer.getUri())
}

export async function clearTestDatabase() {
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
