const locks = new Map()

/**
 * 在当前单进程部署内串行化文件绑定和删除，按键排序避免多个文件互相等待。
 * @param {Array<string>} keys 文件或业务对象的锁键。
 * @param {Function} action 持锁执行的操作，不能再次获取相同键。
 * @returns {Promise<*>} 操作结果。
 * @throws {Error} 透传业务异常；finally 释放全部锁。多实例部署须替换为共享锁。
 */
export async function withResourceLocks(keys, action) {
  const releases = []
  for (const key of [...new Set(keys.map(String))].sort()) {
    const previous = locks.get(key) || Promise.resolve()
    let release
    const current = new Promise((resolve) => { release = resolve })
    locks.set(key, current)
    await previous
    releases.push(() => {
      release()
      if (locks.get(key) === current) locks.delete(key)
    })
  }
  try {
    return await action()
  } finally {
    releases.reverse().forEach((release) => release())
  }
}
