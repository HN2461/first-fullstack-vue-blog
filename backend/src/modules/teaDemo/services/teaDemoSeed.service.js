import bcrypt from 'bcryptjs'
import { env } from '#config/env'
import {
  TEA_DEMO_DEFAULT_PRODUCT_SPECS,
  TEA_DEMO_DEFAULT_PRODUCTS,
  TEA_DEMO_DEFAULT_USERS,
  TEA_DEMO_PRODUCT_STATUS
} from '#modules/teaDemo/constants/teaDemo.constants.js'
import { TeaDemoProduct } from '#modules/teaDemo/models/TeaDemoProduct.js'
import { TeaDemoUser } from '#modules/teaDemo/models/TeaDemoUser.js'

let productionSeedPromise = null

function createSeedProduct(product) {
  const image = product.image || '/images/logo.webp'
  return {
    ...product,
    image,
    imageUrl: image,
    bannerImages: [image],
    status: product.status || TEA_DEMO_PRODUCT_STATUS.ON_SALE,
    specs: structuredClone(TEA_DEMO_DEFAULT_PRODUCT_SPECS)
  }
}

async function seedUsersIfNeeded() {
  if (await TeaDemoUser.exists()) return

  const users = await Promise.all(TEA_DEMO_DEFAULT_USERS.map(async (user) => ({
    username: user.username,
    email: user.email,
    passwordHash: await bcrypt.hash(user.password, 12),
    nickname: user.nickname,
    avatar: user.avatar,
    role: user.role
  })))

  await TeaDemoUser.insertMany(users)
}

async function seedProductsIfNeeded() {
  if (!(await TeaDemoProduct.exists())) {
    await TeaDemoProduct.insertMany(TEA_DEMO_DEFAULT_PRODUCTS.map(createSeedProduct))
    return
  }

  // 只替换历史占位图，避免每次启动覆盖管理员已经维护的商品图片。
  await Promise.all(TEA_DEMO_DEFAULT_PRODUCTS.map(async (product) => {
    if (!product.image || product.image === '/images/logo.webp') return
    await TeaDemoProduct.updateOne(
      { name: product.name, image: '/images/logo.webp' },
      { $set: { image: product.image, imageUrl: product.image, bannerImages: [product.image] } }
    )
  }))
}

async function runTeaDemoSeed() {
  await seedUsersIfNeeded()
  await seedProductsIfNeeded()
}

export async function ensureTeaDemoSeed() {
  if (env.nodeEnv === 'test') {
    await runTeaDemoSeed()
    return
  }

  if (!productionSeedPromise) {
    productionSeedPromise = runTeaDemoSeed().catch((error) => {
      productionSeedPromise = null
      throw error
    })
  }

  await productionSeedPromise
}
