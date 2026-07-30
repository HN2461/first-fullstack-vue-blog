import { randomUUID } from 'node:crypto'
import Redis from 'ioredis'

const requiredEnv = ['REDIS_HOST']

for (const name of requiredEnv) {
  if (!process.env[name]) {
    throw new Error(`缺少环境变量 ${name}`)
  }
}

const redis = new Redis({
  host: process.env.REDIS_HOST,
  port: Number(process.env.REDIS_PORT || 6379),
  username: process.env.REDIS_USERNAME || 'default',
  password: process.env.REDIS_PASSWORD,
  db: 0,
  lazyConnect: true,
  enableReadyCheck: true,
  connectTimeout: 5000,
  commandTimeout: 1000,
  maxRetriesPerRequest: 1,
  retryStrategy(times) {
    return Math.min(times * 100, 2000)
  }
})

const keyPrefix = 'redis-learning:node'

const releaseLockScript = `
  if redis.call('GET', KEYS[1]) == ARGV[1] then
    return redis.call('DEL', KEYS[1])
  end
  return 0
`

redis.defineCommand('consumeFixedWindow', {
  numberOfKeys: 1,
  lua: `
    local current = redis.call('INCR', KEYS[1])
    if current == 1 then
      redis.call('PEXPIRE', KEYS[1], ARGV[1])
    end
    if current > tonumber(ARGV[2]) then
      return {0, current}
    end
    return {1, current}
  `
})

async function cacheAside(key, ttlSeconds, loader) {
  const cached = await redis.get(key)

  if (cached !== null) {
    return { source: 'redis', value: JSON.parse(cached) }
  }

  const value = await loader()
  const jitter = Math.floor(Math.random() * 30)

  await redis.set(
    key,
    JSON.stringify(value),
    'EX',
    ttlSeconds + jitter
  )

  return { source: 'loader', value }
}

async function withLock(key, ttlMs, task) {
  const owner = randomUUID()
  const acquired = await redis.set(key, owner, 'PX', ttlMs, 'NX')

  if (acquired !== 'OK') {
    return { acquired: false }
  }

  try {
    return { acquired: true, result: await task() }
  } finally {
    await redis.eval(releaseLockScript, 1, key, owner)
  }
}

async function main() {
  await redis.connect()
  console.log('ping:', await redis.ping())

  const article = await cacheAside(
    `${keyPrefix}:article:1`,
    300,
    async () => ({ id: '1', title: 'Redis 企业开发' })
  )
  console.log('cacheAside:', article)

  const pipeline = redis.pipeline()
  pipeline.incr(`${keyPrefix}:counter:a`)
  pipeline.incr(`${keyPrefix}:counter:b`)
  pipeline.expire(`${keyPrefix}:counter:a`, 300)
  pipeline.expire(`${keyPrefix}:counter:b`, 300)
  console.log('pipeline:', await pipeline.exec())

  const rateLimit = await redis.consumeFixedWindow(
    `${keyPrefix}:rate-limit:demo`,
    60000,
    10
  )
  console.log('rateLimit:', rateLimit)

  const lockResult = await withLock(
    `${keyPrefix}:lock:demo`,
    5000,
    async () => 'task completed'
  )
  console.log('lock:', lockResult)

  await redis.unlink(
    `${keyPrefix}:article:1`,
    `${keyPrefix}:counter:a`,
    `${keyPrefix}:counter:b`,
    `${keyPrefix}:rate-limit:demo`
  )
}

main()
  .catch((error) => {
    console.error(error)
    process.exitCode = 1
  })
  .finally(async () => {
    await redis.quit()
  })

