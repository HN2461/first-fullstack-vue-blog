---
title: "Redis 14：Node.js 使用 ioredis 实战"
slug: redis-14-nodejs-ioredis
summary: "使用 ioredis 实现连接、Key 构造、Cache-Aside、Pipeline、Lua、分布式锁、Sentinel、Cluster 和集成测试。"
category:
tags: []
status: draft
sortOrder: 140
cover:
---

# 14 Node.js 使用 ioredis 实战

## 1. 安装与选择

```powershell
npm install ioredis
```

`ioredis` 支持 Promise、Pipeline、Lua、Sentinel 和 Cluster，是 Node.js 企业项目常见客户端。`node-redis` 也是成熟选择，团队已有标准时优先遵循。不要在同一项目混用多个客户端而无必要。

## 2. 单节点连接（P0）

```js
import Redis from 'ioredis'

export const redis = new Redis({
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

redis.on('error', (error) => {
  console.error('Redis connection error', {
    name: error.name,
    message: error.message
  })
})
```

连接参数应根据场景调整：后台 Stream 阻塞消费者不能使用短 `commandTimeout`；普通接口缓存必须短超时，防止 Redis 故障拖慢所有请求。

## 3. 启动与关闭

```js
export async function connectRedis() {
  await redis.connect()
  const pong = await redis.ping()

  if (pong !== 'PONG') {
    throw new Error('Redis readiness check failed')
  }
}

export async function closeRedis() {
  await redis.quit()
}
```

`quit()` 尝试处理已排队命令后关闭；连接失效或关机超时场景可 `disconnect()`。应用应监听 SIGTERM，停止接新请求后再关闭连接。

## 4. Key 构造器（P0）

```js
const prefix = `${process.env.APP_NAME}:${process.env.APP_ENV}`

export const redisKeys = {
  article(articleId) {
    return `${prefix}:article:detail:v1:${articleId}`
  },
  session(sessionHash) {
    return `${prefix}:auth:session:${sessionHash}`
  },
  rateLimit(route, subject) {
    return `${prefix}:rate-limit:${route}:${subject}`
  }
}
```

Key 模板集中维护，避免控制器中散落字符串。传入部分需先规范化，不能包含冒号注入不同命名空间或未哈希敏感值。

## 5. Cache-Aside（P0）

```js
const NOT_FOUND = '__NOT_FOUND__'

function ttlWithJitter(baseSeconds, jitterSeconds) {
  return baseSeconds + Math.floor(Math.random() * (jitterSeconds + 1))
}

export async function getArticle(articleId, articleRepository) {
  const key = redisKeys.article(articleId)

  try {
    const cached = await redis.get(key)

    if (cached === NOT_FOUND) {
      return null
    }

    if (cached !== null) {
      return JSON.parse(cached)
    }
  } catch (error) {
    // Redis 是缓存时允许降级回源，同时必须上报错误指标。
  }

  const article = await articleRepository.findPublishedById(articleId)

  try {
    if (!article) {
      await redis.set(key, NOT_FOUND, 'EX', ttlWithJitter(60, 30))
      return null
    }

    await redis.set(
      key,
      JSON.stringify({ schemaVersion: 1, data: article }),
      'EX',
      ttlWithJitter(600, 120)
    )
  } catch (error) {
    // 回源结果仍可返回，缓存写失败不应把只读接口变成失败。
  }

  return article
}
```

生产实现应使用结构化日志、指标和受控错误分类，不能空 catch。示例省略观测代码以突出流程。

## 6. 更新后删除缓存

```js
export async function updateArticle(articleId, input, articleService) {
  const article = await articleService.update(articleId, input)

  try {
    await redis.del(redisKeys.article(articleId))
  } catch (error) {
    await articleService.enqueueCacheInvalidation(articleId)
  }

  return article
}
```

`articleService.update` 必须先完成 MySQL 提交。可靠失效任务最好在同一数据库事务写 Outbox，而不是删除失败后才临时写一条可能也失败的记录。

## 7. Pipeline（P0）

```js
export async function getArticleCacheBatch(articleIds) {
  const pipeline = redis.pipeline()

  for (const articleId of articleIds) {
    pipeline.get(redisKeys.article(articleId))
  }

  const results = await pipeline.exec()

  return results.map(([error, value], index) => ({
    articleId: articleIds[index],
    error,
    value
  }))
}
```

Pipeline 中每个结果是 `[error, result]`，不能只看整体 Promise 是否成功。批次要限制大小。

## 8. 定义 Lua 命令（P0）

```js
redis.defineCommand('consumeRateLimit', {
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

const [allowed, count] = await redis.consumeRateLimit(
  redisKeys.rateLimit('login', ipHash),
  60000,
  10
)
```

Lua 脚本版本化、集中测试，并限制 Key 数和数据规模。

## 9. 分布式锁封装（P0）

```js
import { randomUUID } from 'node:crypto'

const RELEASE_LOCK_SCRIPT = `
  if redis.call('GET', KEYS[1]) == ARGV[1] then
    return redis.call('DEL', KEYS[1])
  end
  return 0
`

export async function withRedisLock(key, ttlMs, task) {
  const owner = randomUUID()
  const acquired = await redis.set(key, owner, 'PX', ttlMs, 'NX')

  if (acquired !== 'OK') {
    return { acquired: false }
  }

  try {
    return { acquired: true, result: await task() }
  } finally {
    await redis.eval(RELEASE_LOCK_SCRIPT, 1, key, owner)
  }
}
```

实际实现还要处理 task 超过 TTL、释放失败、连接故障、重试和 fencing。优先使用经过评审的锁库，不要到处复制这个基础示例。

## 10. Sentinel 与 Cluster

Sentinel：

```js
const redis = new Redis({
  sentinels: [
    { host: 'sentinel-1', port: 26379 },
    { host: 'sentinel-2', port: 26379 },
    { host: 'sentinel-3', port: 26379 }
  ],
  name: 'mymaster',
  username: process.env.REDIS_USERNAME,
  password: process.env.REDIS_PASSWORD
})
```

Cluster：

```js
const cluster = new Redis.Cluster([
  { host: 'redis-1', port: 6379 },
  { host: 'redis-2', port: 6379 },
  { host: 'redis-3', port: 6379 }
])
```

生产还需 TLS、Cluster/Sentinel 认证、DNS、重试和 NAT 等配置，按托管服务文档设置。

## 11. 测试（P0）

- 单元测试 Key 构造、序列化、TTL 抖动和降级分支。
- 集成测试连接真实 Redis，覆盖 TTL、Lua、Pipeline 和原子性。
- 测试 Redis 超时/断开时只读接口是否正确回源。
- 测试缓存旧版本、损坏 JSON 和空值标记。
- 并发测试击穿保护、限流边界和锁超时。
- 使用 Testcontainers 启动与生产相近版本。

## 12. 本章自检

- [ ] 普通接口使用短超时和有限重试。
- [ ] Key 模板集中维护，敏感标识先哈希。
- [ ] 缓存异常可降级且有指标，不静默吞错。
- [ ] Pipeline 检查每条结果并限制批次。
- [ ] Lua、锁和 Cluster Key 都考虑原子与 Slot 边界。
